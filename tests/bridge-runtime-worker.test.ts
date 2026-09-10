import { createHash, randomUUID } from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

import { build } from 'esbuild'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

import { PROTOCOL_VERSION, SCHEMA_ID } from '../bridge/protocol.ts'
import { decodeBridgeRuntimeCheckpoint, DEFAULT_BRIDGE_RUNTIME_CHECKPOINT_LIMITS } from '../bridge/runtime-checkpoint.ts'
import type { CampaignLibrary } from '../bridge/runtime/campaign-library.ts'
import { decodeCampaignStorage } from '../bridge/runtime/campaign-storage-codec.ts'
import { createRuntimeWorker } from '../bridge/runtime/worker-client.ts'
import { WORKER_MAX_PENDING_REQUESTS, WORKER_RESPONSE_TIMEOUT_MS } from '../bridge/runtime/worker-contract.ts'
import type { BridgeSnapshotEnvelope, CampaignAcceptedResponse, CampaignLibraryResponse, CampaignRequest } from '../bridge/schema/bridge-schema.ts'
import type { AcceptedSaveResponse } from '../bridge/session.ts'

type RuntimeWorker = Awaited<ReturnType<typeof createRuntimeWorker>>
type WorkerRequest = Parameters<RuntimeWorker['request']>[0]
type WorkerResponse = Awaited<ReturnType<RuntimeWorker['request']>>

const fixtureEntry = new URL('./fixtures/runtime-worker-fixture.mjs', import.meta.url)
const temporaryRoots: string[] = []
const workers = new Set<RuntimeWorker>()
let productionEntry: URL
let buildRoot: string

function temporaryRoot(): string {
  // realpath avoids macOS /tmp aliases; the production store rejects symlink ancestors.
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'studio-runtime-worker-test-')))
  temporaryRoots.push(root)
  return root
}

async function openWorker(
  runtimeDirectory: string | null,
  fatals: Error[],
  entryUrl = productionEntry,
): Promise<RuntimeWorker> {
  const worker = await createRuntimeWorker({
    entryUrl,
    runtimeDirectory,
    regime: 'endowed',
    runtimeInstanceId: randomUUID(),
    fatal: (error) => { fatals.push(error) },
  })
  workers.add(worker)
  return worker
}

async function closeWorker(worker: RuntimeWorker): Promise<void> {
  await worker.close()
  workers.delete(worker)
}

function get(route: WorkerRequest['route']): WorkerRequest {
  return { route, method: 'GET', startedEpochMs: Date.now() }
}

function post(route: WorkerRequest['route'], value: unknown): WorkerRequest {
  // A separate array owns each transfer. Retrying reconstructs the exact request bytes.
  const body = new TextEncoder().encode(JSON.stringify(value))
  return {
    route,
    method: 'POST',
    body,
    requestUtf8Sha256: createHash('sha256').update(body).digest('hex'),
    startedEpochMs: Date.now(),
  }
}

function text(response: WorkerResponse): string {
  expect(response.disposition).toBe('respond')
  expect(ArrayBuffer.isView(response.body)).toBe(true)
  return new TextDecoder('utf-8', { fatal: true }).decode(response.body)
}

function parse<T>(response: WorkerResponse): T {
  expect(response.status).toBe(200)
  return JSON.parse(text(response)) as T
}

async function snapshot(worker: RuntimeWorker): Promise<BridgeSnapshotEnvelope> {
  return parse<BridgeSnapshotEnvelope>(await worker.request(get('/snapshot')))
}

function control(current: BridgeSnapshotEnvelope) {
  return {
    protocolVersion: PROTOCOL_VERSION,
    schemaId: SCHEMA_ID,
    sessionId: current.sessionId,
    commandId: randomUUID(),
    expectedStateRevision: current.stateRevision,
  }
}

function readLibrary(checkpointPath: string): CampaignLibrary {
  return decodeCampaignStorage(
    JSON.parse(fs.readFileSync(checkpointPath, 'utf8')),
    DEFAULT_BRIDGE_RUNTIME_CHECKPOINT_LIMITS.maxCheckpointBytes,
    32,
  ) as CampaignLibrary
}

function readWorkingCheckpoint(checkpointPath: string) {
  return decodeBridgeRuntimeCheckpoint(readLibrary(checkpointPath).workingCheckpointJson).checkpoint
}

function campaignRequest(
  library: CampaignLibraryResponse,
  operation: CampaignRequest['operation'],
  label: string | null = null,
): CampaignRequest {
  return {
    protocolVersion: PROTOCOL_VERSION,
    schemaId: SCHEMA_ID,
    sessionId: library.sessionId,
    commandId: randomUUID(),
    expectedStateRevision: library.stateRevision,
    expectedCatalogueRevision: library.catalogueRevision,
    expectedActiveCampaignId: library.activeCampaignId,
    type: 'campaign',
    operation,
    campaignId: null,
    label,
    overwriteCampaignId: null,
    confirmDestructive: false,
    unsavedDisposition: 'requireClean',
  }
}

function fixtureEvents(directory: string): Array<{ event: string; route?: string }> {
  return fs.readFileSync(path.join(directory, 'worker-events.jsonl'), 'utf8')
    .trim().split('\n').map((line) => JSON.parse(line) as { event: string; route?: string })
}

beforeAll(async () => {
  buildRoot = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'studio-runtime-worker-build-')))
  const outfile = path.join(buildRoot, 'runtime-worker.mjs')
  // The test owns its bundle: concurrent packaged-supervisor tests may replace dist/studio.
  await build({
    entryPoints: [fileURLToPath(new URL('../bridge/runtime/worker-entry.ts', import.meta.url))],
    outfile,
    bundle: true,
    platform: 'node',
    format: 'esm',
    target: 'node24',
    logLevel: 'silent',
  })
  productionEntry = pathToFileURL(outfile)
}, 30_000)

afterEach(async () => {
  vi.useRealTimers()
  for (const worker of workers) {
    // Failure tests intentionally close poisoned workers, whose close may reject.
    await worker.close().catch(() => undefined)
  }
  workers.clear()
  for (const root of temporaryRoots.splice(0)) fs.rmSync(root, { recursive: true, force: true })
})

afterAll(() => {
  if (buildRoot !== undefined) fs.rmSync(buildRoot, { recursive: true, force: true })
})

describe('runtime worker production authority', () => {
  it('delivers an accepted campaign Save before close completes and recovers its catalogue receipt', async () => {
    const runtimeDirectory = path.join(temporaryRoot(), 'runtime')
    const checkpointPath = path.join(runtimeDirectory, 'bridge-runtime-v1.json')
    const fatals: Error[] = []
    let worker = await openWorker(runtimeDirectory, fatals)
    const unnamed = parse<CampaignLibraryResponse>(await worker.request(get('/campaigns')))
    const named = parse<CampaignAcceptedResponse>(await worker.request(post('/campaigns',
      campaignRequest(unnamed, 'saveAs', 'Worker shutdown campaign'))))
    expect(named.accepted).toBe(true)
    const catalogue = parse<CampaignLibraryResponse>(await worker.request(get('/campaigns')))
    expect(catalogue.activeCampaignId).toBe(named.campaignId)
    expect(catalogue.campaigns).toHaveLength(1)
    expect(catalogue.campaigns[0]!.label).toBe('Worker shutdown campaign')
    const request = campaignRequest(catalogue, 'save')
    const completions: string[] = []
    const saving = worker.request(post('/campaigns', request)).then((response) => {
      completions.push('receipt')
      return response
    })
    // No await between admission and close: this exercises the actual entry's handler drain.
    const closing = worker.close().then(() => { completions.push('closed') })
    const [response] = await Promise.all([saving, closing])
    workers.delete(worker)
    const receipt = parse<CampaignAcceptedResponse>(response)
    expect(receipt).toMatchObject({
      accepted: true,
      operation: 'save',
      commandId: request.commandId,
      campaignId: named.campaignId,
      catalogueRevision: catalogue.catalogueRevision + 1,
    })
    expect(completions).toEqual(['receipt', 'closed'])
    expect(fs.existsSync(`${checkpointPath}.lock`)).toBe(false)
    const durable = readLibrary(checkpointPath)
    expect(durable.receipts.find((entry) => entry.commandId === request.commandId)?.response)
      .toEqual(receipt)
    const working = decodeBridgeRuntimeCheckpoint(durable.workingCheckpointJson).checkpoint
    expect(working.savedSaveJson).toBe(working.currentSaveJson)

    worker = await openWorker(runtimeDirectory, fatals)
    const reopened = parse<CampaignLibraryResponse>(await worker.request(get('/campaigns')))
    expect(reopened).toMatchObject({
      activeCampaignId: named.campaignId,
      catalogueRevision: receipt.catalogueRevision,
      stateDigest: receipt.stateDigest,
      dirty: false,
    })
    expect(text(await worker.request(post('/campaigns', request)))).toBe(text(response))
    await closeWorker(worker)
    expect(fatals).toEqual([])
  }, 30_000)

  it('durably saves exact response bytes and replays them after later progress and reopen', async () => {
    const runtimeDirectory = path.join(temporaryRoot(), 'runtime')
    const checkpointPath = path.join(runtimeDirectory, 'bridge-runtime-v1.json')
    const fatals: Error[] = []
    let worker = await openWorker(runtimeDirectory, fatals)
    const initial = await snapshot(worker)
    const saveRequest = control(initial)
    const savedResponse = await worker.request(post('/save', saveRequest))
    const saved = parse<AcceptedSaveResponse>(savedResponse)
    expect(saved.accepted).toBe(true)
    expect(saved.stateDigest).toBe(initial.stateDigest)
    expect(saved.commandId).toBe(saveRequest.commandId)

    const committed = readWorkingCheckpoint(checkpointPath)
    expect(committed.currentSaveJson).toBe(saved.saveJson)
    expect(committed.savedSaveJson).toBe(saved.saveJson)
    const committedBytes = fs.readFileSync(checkpointPath)
    const replay = await worker.request(post('/save', saveRequest))
    expect(replay.status).toBe(savedResponse.status)
    expect(text(replay)).toBe(text(savedResponse))
    expect(fs.readFileSync(checkpointPath)).toEqual(committedBytes)

    const current = await snapshot(worker)
    const intent = current.availableIntents.find((option) => option.kind === 'advanceWeek')
      ?? current.availableIntents[0]
    expect(intent).toBeDefined()
    const mutation = parse<{ accepted: boolean }>(await worker.request(post('/command', {
      ...control(current),
      type: 'submitIntent',
      payload: { intentId: intent!.intentId },
    })))
    expect(mutation.accepted).toBe(true)
    const later = await snapshot(worker)
    expect(later.stateRevision).toBe(current.stateRevision + 1)
    expect(later.stateDigest).not.toBe(saved.stateDigest)
    const laterCheckpoint = readWorkingCheckpoint(checkpointPath)
    expect(laterCheckpoint.currentStateDigest).toBe(later.stateDigest)
    expect(laterCheckpoint.savedSaveJson).toBe(saved.saveJson)
    const laterBytes = fs.readFileSync(checkpointPath)

    await closeWorker(worker)
    expect(fs.existsSync(`${checkpointPath}.lock`)).toBe(false)
    worker = await openWorker(runtimeDirectory, fatals)
    const recovered = await snapshot(worker)
    expect(recovered.sessionId).toBe(later.sessionId)
    expect(recovered.stateRevision).toBe(later.stateRevision)
    expect(recovered.stateDigest).toBe(later.stateDigest)
    expect(text(await worker.request(post('/save', saveRequest)))).toBe(text(savedResponse))
    expect(fs.readFileSync(checkpointPath)).toEqual(laterBytes)
    expect((await snapshot(worker)).stateDigest).toBe(later.stateDigest)
    expect(readWorkingCheckpoint(checkpointPath).savedSaveJson).toBe(saved.saveJson)
    await closeWorker(worker)
    expect(fatals).toEqual([])
  }, 30_000)

  it('refuses a second authority while preserving the first worker and its durable bytes', async () => {
    const runtimeDirectory = path.join(temporaryRoot(), 'runtime')
    const checkpointPath = path.join(runtimeDirectory, 'bridge-runtime-v1.json')
    const fatals: Error[] = []
    const worker = await openWorker(runtimeDirectory, fatals)
    const initial = await snapshot(worker)
    const committedBytes = fs.readFileSync(checkpointPath)
    const contenderFatals: Error[] = []

    await expect(openWorker(runtimeDirectory, contenderFatals)).rejects.toThrow(/lock|owned|owner/i)
    expect(fs.readFileSync(checkpointPath)).toEqual(committedBytes)
    expect((await snapshot(worker)).stateDigest).toBe(initial.stateDigest)
    const saved = parse<AcceptedSaveResponse>(await worker.request(post('/save', control(initial))))
    expect(saved.accepted).toBe(true)
    await closeWorker(worker)
    expect(fs.existsSync(`${checkpointPath}.lock`)).toBe(false)
    expect(fatals).toEqual([])
  }, 30_000)

  it('rejects corrupt persisted state without replacing it with a fresh campaign', async () => {
    const runtimeDirectory = path.join(temporaryRoot(), 'runtime')
    fs.mkdirSync(runtimeDirectory, { mode: 0o700 })
    const checkpointPath = path.join(runtimeDirectory, 'bridge-runtime-v1.json')
    const corrupt = '{"libraryVersion":2,"records": [this is interrupted'
    fs.writeFileSync(checkpointPath, corrupt, { mode: 0o600 })
    const fatals: Error[] = []

    await expect(openWorker(runtimeDirectory, fatals)).rejects.toThrow()
    expect(fs.readFileSync(checkpointPath, 'utf8')).toBe(corrupt)
    expect(fs.existsSync(`${checkpointPath}.lock`)).toBe(false)
  }, 30_000)
})

describe('runtime worker responsiveness and lifecycle', () => {
  it('counts timed-out work against capacity until its actual worker response arrives', async () => {
    const directory = temporaryRoot()
    const fatals: Error[] = []
    const worker = await openWorker(directory, fatals, fixtureEntry)
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    const waits = Array.from({ length: WORKER_MAX_PENDING_REQUESTS }, (_, index) =>
      worker.request(post('/load', { operation: 'hold', index })).then(
        () => 'unexpected response',
        (error: unknown) => error,
      ))
    await vi.advanceTimersByTimeAsync(WORKER_RESPONSE_TIMEOUT_MS)
    const failures = await Promise.all(waits)
    for (const failure of failures) {
      expect(failure).toBeInstanceOf(Error)
      expect((failure as Error).message).toMatch(/deadline.*unresolved/i)
    }
    await expect(worker.request(get('/snapshot'))).rejects.toThrow(/capacity/i)
    // Only the caller's deadline was advanced. The fixture still holds every operation.
    vi.useRealTimers()
    fs.writeFileSync(path.join(directory, 'release-one'), 'release exactly one held response', { mode: 0o600 })
    await vi.waitFor(async () => {
      const admitted = await worker.request(get('/snapshot'))
      expect(admitted.status).toBe(200)
    }, { timeout: 5_000, interval: 20 })
    expect(fixtureEvents(directory).filter((event) => event.event === 'released')).toHaveLength(1)
    expect(fatals).toEqual([])
    await closeWorker(worker)
  }, 10_000)

  it('keeps the caller timer responsive during synchronous work and retains exact UTF-8 bytes', async () => {
    const directory = temporaryRoot()
    const fatals: Error[] = []
    const worker = await openWorker(directory, fatals, fixtureEntry)
    const request = post('/command', { operation: 'busy' })
    const originalBytes = new Uint8Array(request.body!)
    const response = worker.request(request)
    expect(request.body).toEqual(originalBytes)
    let timer: ReturnType<typeof setTimeout> | undefined
    try {
      const first = await Promise.race([
        response.then(() => 'response'),
        new Promise<string>((resolve) => { timer = setTimeout(() => resolve('timer'), 20) }),
      ])
      expect(first).toBe('timer')
      const result = await response
      expect(result.status).toBe(200)
      expect(text(result)).toBe('{ "message": "Café 🎬", "spacing": true }\n')
      expect(request.body).toEqual(originalBytes)
      expect(fatals).toEqual([])
    } finally {
      if (timer !== undefined) clearTimeout(timer)
      await closeWorker(worker)
    }
  })

  it('rejects every pending request on unexpected exit and never retries or replaces the worker', async () => {
    const directory = temporaryRoot()
    const fatals: Error[] = []
    const worker = await openWorker(directory, fatals, fixtureEntry)
    const pending = worker.request(post('/load', { operation: 'hold' }))
    const exiting = worker.request(post('/save', { operation: 'exit' }))
    const results = await Promise.allSettled([pending, exiting])
    expect(results.map((result) => result.status)).toEqual(['rejected', 'rejected'])
    expect(fatals).toHaveLength(1)
    await expect(worker.request(get('/snapshot'))).rejects.toThrow()
    await worker.close().catch(() => undefined)
    workers.delete(worker)
    const events = fixtureEvents(directory)
    expect(events.filter((event) => event.event === 'started')).toHaveLength(1)
    expect(events.filter((event) => event.event === 'request').map((event) => event.route))
      .toEqual(['/load', '/save'])
  })

  it('drains accepted work before graceful close and rejects requests made after closing starts', async () => {
    const directory = temporaryRoot()
    const fatals: Error[] = []
    const worker = await openWorker(directory, fatals, fixtureEntry)
    const accepted = worker.request(post('/command', { operation: 'busy' }))
    const closing = worker.close()
    await expect(worker.request(get('/snapshot'))).rejects.toThrow()
    expect(text(await accepted)).toBe('{ "message": "Café 🎬", "spacing": true }\n')
    await closing
    await worker.close()
    workers.delete(worker)
    expect(fixtureEvents(directory).map((event) => event.event))
      .toEqual(['started', 'request', 'responded', 'closed'])
    expect(fatals).toEqual([])
  })
})
