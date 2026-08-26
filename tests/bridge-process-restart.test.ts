import { spawn, type ChildProcess } from 'node:child_process'
import { createHash, randomBytes } from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { expect, it } from 'vitest'

import {
  PROTOCOL_VERSION,
  SCHEMA_ID,
  type ControlEnvelope,
  type SubmitIntentCommand,
} from '../bridge/protocol.ts'
import {
  decodeBridgeRuntimeCheckpoint,
  type BridgeRuntimeJournalRoute,
} from '../bridge/runtime-checkpoint.ts'
import { canonicalJson } from '../bridge/schema/canonical.ts'
import { POST_COMMIT_RESPONSE_TEST_ENV } from '../bridge/testing/post-commit-response-gate.ts'
import {
  selectJourneyIntent,
  type CommandResponse,
  type SaveResponse,
  type SnapshotEnvelope,
} from '../bridge/session.ts'
import { exportSave } from '../src/core/index.js'

const ROOT = process.cwd()
const VITE_NODE = path.join(ROOT, 'node_modules', 'vite-node', 'vite-node.mjs')
const SERVER_ENTRY = path.join(ROOT, 'bridge', 'server.ts')
const STARTUP_TIMEOUT_MS = 20_000
const HTTP_TIMEOUT_MS = 10_000
const EXIT_TIMEOUT_MS = 10_000
const MAX_CAPTURED_LOG_BYTES = 1_000_000

type ProcessExit = {
  code: number | null
  signal: NodeJS.Signals | null
}

type CapturedLogs = {
  stdout: string
  stderr: string
}

type RunningBridge = {
  child: ChildProcess
  baseUrl: string
  capability: string
  logs: CapturedLogs
}

type RawHttpResponse = {
  status: number
  body: string
}

type PostCommitResponseTestPlan = {
  action: 'drop' | 'hold'
  commandId: string
  nonce: string
  route: BridgeRuntimeJournalRoute
  version: 1
}

type PostCommitResponseTestSignal = {
  action: 'drop' | 'hold'
  commandId: string
  committedSessionId: string
  committedStateDigest: string
  committedStateRevision: number
  event: 'post-commit-response'
  nonce: string
  requestUtf8Sha256: string
  responseJsonSha256: string
  route: BridgeRuntimeJournalRoute
  version: 1
}

type PostCommitReplayTestSignal = {
  commandId: string
  event: 'post-commit-replay'
  requestUtf8Sha256: string
  responseJsonSha256: string
  route: BridgeRuntimeJournalRoute
  version: 1
}

type PreparedOperation = {
  beforeSessionId: string
  beforeStateDigest: string
  beforeStateRevision: number
  body: string
  canonicalBody: string
  commandId: string
  pathname: '/command' | '/save' | '/load'
  route: BridgeRuntimeJournalRoute
  savedStateDigest: string | null
}

const postCommitSignalPrefix = '[bridge:test] post-commit '
const postCommitReplaySignalPrefix = '[bridge:test] replay '
const testRoutes = ['command', 'save', 'load'] as const

function appendBounded(previous: string, chunk: Buffer | string): string {
  const combined = previous + chunk.toString()
  if (Buffer.byteLength(combined, 'utf8') <= MAX_CAPTURED_LOG_BYTES) return combined
  return combined.slice(-MAX_CAPTURED_LOG_BYTES)
}

function diagnostics(label: string, bridge: RunningBridge | null): string {
  if (bridge === null) return `${label}: process was not started.`
  return [
    `${label}: pid=${String(bridge.child.pid ?? 'unknown')} exitCode=${String(bridge.child.exitCode)} ` +
      `signal=${String(bridge.child.signalCode)}`,
    `${label} stdout:\n${bridge.logs.stdout || '<empty>'}`,
    `${label} stderr:\n${bridge.logs.stderr || '<empty>'}`,
  ].join('\n')
}

function timeout<T>(promise: Promise<T>, milliseconds: number, message: () => string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message())), milliseconds)
    promise.then(
      (value) => {
        clearTimeout(timer)
        resolve(value)
      },
      (error: unknown) => {
        clearTimeout(timer)
        reject(error)
      },
    )
  })
}

function waitForExit(child: ChildProcess): Promise<ProcessExit> {
  if (child.exitCode !== null || child.signalCode !== null) {
    return Promise.resolve({ code: child.exitCode, signal: child.signalCode })
  }
  return new Promise<ProcessExit>((resolve) => {
    child.once('exit', (code, signal) => resolve({ code, signal }))
  })
}

async function signalAndWait(
  bridge: RunningBridge,
  signal: NodeJS.Signals,
  milliseconds = EXIT_TIMEOUT_MS,
): Promise<ProcessExit> {
  const exiting = waitForExit(bridge.child)
  if (bridge.child.exitCode === null && bridge.child.signalCode === null) {
    if (!bridge.child.kill(signal)) {
      throw new Error(`Failed to send ${signal} to bridge pid ${String(bridge.child.pid)}.`)
    }
  }
  return timeout(
    exiting,
    milliseconds,
    () => `Bridge did not exit after ${signal}.\n${diagnostics('bridge', bridge)}`,
  )
}

async function cleanupBridge(bridge: RunningBridge | null): Promise<void> {
  if (bridge === null || bridge.child.exitCode !== null || bridge.child.signalCode !== null) return
  try {
    await signalAndWait(bridge, 'SIGTERM', 2_000)
  } catch {
    if (bridge.child.exitCode === null && bridge.child.signalCode === null) {
      bridge.child.kill('SIGKILL')
      try {
        await timeout(waitForExit(bridge.child), 2_000, () => 'Bridge cleanup timed out.')
      } catch {
        // The bounded test timeout will still terminate the owning Vitest worker.
      }
    }
  }
}

async function startBridge(
  runtimeDirectory: string,
  capability: string,
  postCommitPlan?: PostCommitResponseTestPlan,
  postCommitNodeEnvironment = 'test',
): Promise<RunningBridge> {
  const logs: CapturedLogs = { stdout: '', stderr: '' }
  const environment = { ...process.env }
  delete environment[POST_COMMIT_RESPONSE_TEST_ENV]
  if (postCommitPlan !== undefined) {
    environment.NODE_ENV = postCommitNodeEnvironment
    environment[POST_COMMIT_RESPONSE_TEST_ENV] = canonicalJson(postCommitPlan)
  }
  const child = spawn(process.execPath, [VITE_NODE, SERVER_ENTRY], {
    cwd: ROOT,
    env: {
      ...environment,
      NO_COLOR: '1',
      PROJECT_STUDIO_BRIDGE_CAPABILITY: capability,
      PROJECT_STUDIO_BRIDGE_PORT: '0',
      PROJECT_STUDIO_BRIDGE_RUNTIME_DIR: runtimeDirectory,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  const bridge: RunningBridge = { child, baseUrl: '', capability, logs }

  const started = new Promise<number>((resolve, reject) => {
    let settled = false
    const finish = (operation: () => void): void => {
      if (settled) return
      settled = true
      child.off('error', onError)
      child.off('exit', onExit)
      operation()
    }
    const inspect = (): void => {
      const match = /\[bridge\] live http:\/\/127\.0\.0\.1:(\d+)/.exec(logs.stdout)
      if (match === null) return
      const port = Number(match[1])
      if (!Number.isSafeInteger(port) || port < 1 || port > 65_535) {
        finish(() => reject(new Error(`Bridge reported invalid port ${String(match[1])}.`)))
        return
      }
      finish(() => resolve(port))
    }
    const onError = (error: Error): void => finish(() => reject(error))
    const onExit = (code: number | null, signal: NodeJS.Signals | null): void => {
      finish(() =>
        reject(
          new Error(
        `Bridge exited before startup (code=${String(code)}, signal=${String(signal)}).\n` +
          diagnostics('bridge', bridge),
          ),
        ),
      )
    }
    child.on('error', onError)
    child.on('exit', onExit)
    child.stdout?.on('data', (chunk: Buffer) => {
      logs.stdout = appendBounded(logs.stdout, chunk)
      inspect()
    })
    child.stderr?.on('data', (chunk: Buffer) => {
      logs.stderr = appendBounded(logs.stderr, chunk)
    })
  })

  let port: number
  try {
    port = await timeout(
      started,
      STARTUP_TIMEOUT_MS,
      () => `Bridge startup timed out.\n${diagnostics('bridge', bridge)}`,
    )
  } catch (error) {
    await cleanupBridge(bridge)
    throw error
  }
  bridge.baseUrl = `http://127.0.0.1:${String(port)}`
  return bridge
}

function sha256Utf8(text: string): string {
  return createHash('sha256').update(text, 'utf8').digest('hex')
}

function postCommitSignalFromText(
  stdout: string,
  nonce: string,
): { line: string; signal: PostCommitResponseTestSignal } | null {
  const finalNewline = stdout.lastIndexOf('\n')
  if (finalNewline < 0) return null
  for (const line of stdout.slice(0, finalNewline).split(/\r?\n/)) {
    if (!line.startsWith(postCommitSignalPrefix)) continue
    const signal = JSON.parse(
      line.slice(postCommitSignalPrefix.length),
    ) as PostCommitResponseTestSignal
    if (signal.nonce === nonce) return { line, signal }
  }
  return null
}

function postCommitSignalFromLogs(
  bridge: RunningBridge,
  nonce: string,
): { line: string; signal: PostCommitResponseTestSignal } | null {
  return postCommitSignalFromText(bridge.logs.stdout, nonce)
}

function waitForPostCommitSignal(
  bridge: RunningBridge,
  nonce: string,
): Promise<{ line: string; signal: PostCommitResponseTestSignal }> {
  const observed = postCommitSignalFromLogs(bridge, nonce)
  if (observed !== null) return Promise.resolve(observed)

  return timeout(
    new Promise((resolve, reject) => {
      const inspect = (): void => {
        const signal = postCommitSignalFromLogs(bridge, nonce)
        if (signal === null) return
        cleanup()
        resolve(signal)
      }
      const exited = (code: number | null, signal: NodeJS.Signals | null): void => {
        cleanup()
        reject(
          new Error(
            `Bridge exited before post-commit signal (code=${String(code)}, signal=${String(signal)}).\n` +
              diagnostics('bridge', bridge),
          ),
        )
      }
      const cleanup = (): void => {
        bridge.child.stdout?.off('data', inspect)
        bridge.child.off('exit', exited)
      }
      bridge.child.stdout?.on('data', inspect)
      bridge.child.once('exit', exited)
      inspect()
    }),
    STARTUP_TIMEOUT_MS,
    () => `Post-commit response signal timed out.\n${diagnostics('bridge', bridge)}`,
  )
}

function postCommitReplaySignalFromText(
  stdout: string,
  route: BridgeRuntimeJournalRoute,
  commandId: string,
): { line: string; signal: PostCommitReplayTestSignal } | null {
  const finalNewline = stdout.lastIndexOf('\n')
  if (finalNewline < 0) return null
  for (const line of stdout.slice(0, finalNewline).split(/\r?\n/)) {
    if (!line.startsWith(postCommitReplaySignalPrefix)) continue
    const signal = JSON.parse(
      line.slice(postCommitReplaySignalPrefix.length),
    ) as PostCommitReplayTestSignal
    if (signal.route === route && signal.commandId === commandId) return { line, signal }
  }
  return null
}

function waitForPostCommitReplaySignal(
  bridge: RunningBridge,
  route: BridgeRuntimeJournalRoute,
  commandId: string,
): Promise<{ line: string; signal: PostCommitReplayTestSignal }> {
  const observed = postCommitReplaySignalFromText(bridge.logs.stdout, route, commandId)
  if (observed !== null) return Promise.resolve(observed)

  return timeout(
    new Promise((resolve, reject) => {
      const inspect = (): void => {
        const signal = postCommitReplaySignalFromText(bridge.logs.stdout, route, commandId)
        if (signal === null) return
        cleanup()
        resolve(signal)
      }
      const exited = (code: number | null, signal: NodeJS.Signals | null): void => {
        cleanup()
        reject(
          new Error(
            `Bridge exited before replay signal (code=${String(code)}, signal=${String(signal)}).\n` +
              diagnostics('bridge', bridge),
          ),
        )
      }
      const cleanup = (): void => {
        bridge.child.stdout?.off('data', inspect)
        bridge.child.off('exit', exited)
      }
      bridge.child.stdout?.on('data', inspect)
      bridge.child.once('exit', exited)
      inspect()
    }),
    STARTUP_TIMEOUT_MS,
    () => `Post-commit replay signal timed out.\n${diagnostics('bridge', bridge)}`,
  )
}

async function request(
  bridge: RunningBridge,
  pathname: string,
  method: 'GET' | 'POST' = 'GET',
  body?: string,
): Promise<RawHttpResponse> {
  const abort = new AbortController()
  const timer = setTimeout(() => abort.abort(), HTTP_TIMEOUT_MS)
  try {
    const init: RequestInit = {
      headers: { 'x-project-studio-capability': bridge.capability },
      method,
      signal: abort.signal,
    }
    if (body !== undefined) {
      init.body = body
      init.headers = {
        ...init.headers,
        'content-type': 'application/json',
      }
    }
    const response = await fetch(`${bridge.baseUrl}${pathname}`, init)
    return { status: response.status, body: await response.text() }
  } catch (error) {
    throw new Error(
      `${method} ${pathname} failed: ${(error as Error).message}.\n${diagnostics('bridge', bridge)}`,
      { cause: error },
    )
  } finally {
    clearTimeout(timer)
  }
}

function parseJson<T>(response: RawHttpResponse): T {
  return JSON.parse(response.body) as T
}

async function snapshot(bridge: RunningBridge): Promise<SnapshotEnvelope> {
  const response = await request(bridge, '/snapshot')
  expect(response.status).toBe(200)
  return parseJson<SnapshotEnvelope>(response)
}

function journeyCommand(
  current: SnapshotEnvelope,
  commandId: string,
): { request: SubmitIntentCommand; body: string } {
  const intent = selectJourneyIntent(
    current.availableIntents.filter((candidate) => candidate.kind !== 'startConstruction'),
    current.snapshot.journeyNotices.firstFilmJourney,
  ) ?? current.availableIntents.find(
    (candidate) => candidate.kind === 'signFoundingContract' || candidate.kind === 'foundStudio',
  )
  if (intent === undefined) {
    throw new Error(
      `No authoritative intent is available at revision ${String(current.stateRevision)}.`,
    )
  }
  const request: SubmitIntentCommand = {
    protocolVersion: PROTOCOL_VERSION,
    schemaId: SCHEMA_ID,
    sessionId: current.sessionId,
    commandId,
    expectedStateRevision: current.stateRevision,
    type: 'submitIntent',
    payload: { intentId: intent.intentId },
  }
  return { request, body: canonicalJson(request) }
}

function control(
  current: SnapshotEnvelope,
  commandId: string,
): { request: ControlEnvelope; body: string } {
  const request: ControlEnvelope = {
    protocolVersion: PROTOCOL_VERSION,
    schemaId: SCHEMA_ID,
    sessionId: current.sessionId,
    commandId,
    expectedStateRevision: current.stateRevision,
  }
  return { request, body: canonicalJson(request) }
}

async function prepareOperation(
  bridge: RunningBridge,
  route: BridgeRuntimeJournalRoute,
  commandId: string,
): Promise<PreparedOperation> {
  let current = await snapshot(bridge)
  let savedStateDigest: string | null = null
  if (route === 'load') {
    const save = control(current, `${commandId}-pre-save`)
    const saveRaw = await request(bridge, '/save', 'POST', save.body)
    expect(saveRaw.status).toBe(200)
    const saveResponse = parseJson<SaveResponse>(saveRaw)
    if (!saveResponse.accepted) throw new Error(saveResponse.message)
    savedStateDigest = saveResponse.stateDigest

    current = await snapshot(bridge)
    const mutation = journeyCommand(current, `${commandId}-pre-load-mutation`)
    const mutationRaw = await request(bridge, '/command', 'POST', mutation.body)
    expect(mutationRaw.status).toBe(200)
    const mutationResponse = parseJson<CommandResponse>(mutationRaw)
    if (!mutationResponse.accepted) throw new Error(mutationResponse.message)
    expect(mutationResponse.stateDigest).not.toBe(saveResponse.stateDigest)
    current = await snapshot(bridge)
  }

  const prepared =
    route === 'command' ? journeyCommand(current, commandId) : control(current, commandId)
  const canonicalBody = prepared.body
  return {
    beforeSessionId: current.sessionId,
    beforeStateDigest: current.stateDigest,
    beforeStateRevision: current.stateRevision,
    body: `${canonicalBody}\n`,
    canonicalBody,
    commandId,
    pathname: `/${route}`,
    route,
    savedStateDigest,
  }
}

function ambiguousPost(
  bridge: RunningBridge,
  operation: PreparedOperation,
): Promise<
  { kind: 'response'; response: RawHttpResponse } | { error: Error; kind: 'transport-error' }
> {
  return request(bridge, operation.pathname, 'POST', operation.body).then(
    (response) => ({ kind: 'response' as const, response }),
    (error: unknown) => ({
      error: error as Error,
      kind: 'transport-error' as const,
    }),
  )
}

function assertCommittedSignal(
  checkpointPath: string,
  capability: string,
  operation: PreparedOperation,
  observed: { line: string; signal: PostCommitResponseTestSignal },
  action: 'drop' | 'hold',
): { checkpointBytes: string; responseJson: string } {
  expect(Object.keys(observed.signal).sort()).toEqual([
    'action',
    'commandId',
    'committedSessionId',
    'committedStateDigest',
    'committedStateRevision',
    'event',
    'nonce',
    'requestUtf8Sha256',
    'responseJsonSha256',
    'route',
    'version',
  ])
  expect(observed.signal).toMatchObject({
    action,
    commandId: operation.commandId,
    event: 'post-commit-response',
    requestUtf8Sha256: sha256Utf8(operation.body),
    route: operation.route,
    version: 1,
  })
  expect(observed.line).toBe(`${postCommitSignalPrefix}${canonicalJson(observed.signal)}`)
  expect(observed.signal.requestUtf8Sha256).not.toBe(sha256Utf8(operation.canonicalBody))
  expect(observed.signal.committedSessionId).toBe(operation.beforeSessionId)
  if (operation.route === 'save') {
    expect(observed.signal.committedStateRevision).toBe(operation.beforeStateRevision)
    expect(observed.signal.committedStateDigest).toBe(operation.beforeStateDigest)
  } else {
    expect(observed.signal.committedStateRevision).toBe(operation.beforeStateRevision + 1)
    if (operation.route === 'command') {
      expect(observed.signal.committedStateDigest).not.toBe(operation.beforeStateDigest)
    } else {
      expect(operation.savedStateDigest).not.toBeNull()
      expect(operation.savedStateDigest).not.toBe(operation.beforeStateDigest)
      expect(observed.signal.committedStateDigest).toBe(operation.savedStateDigest)
    }
  }
  expect(observed.line).not.toContain(capability)
  expect(observed.line).not.toContain(operation.body)
  expect(observed.line).not.toContain('saveJson')

  const checkpointBytes = fs.readFileSync(checkpointPath, 'utf8')
  const hydrated = decodeBridgeRuntimeCheckpoint(checkpointBytes)
  const journalEntry = hydrated.checkpoint.journal.find(
    (entry) => entry.route === operation.route && entry.commandId === operation.commandId,
  )
  expect(journalEntry).toBeDefined()
  if (journalEntry === undefined) throw new Error('Post-commit journal entry is missing.')
  expect(journalEntry.requestJson).toBe(operation.canonicalBody)
  expect(journalEntry.requestJson).not.toBe(operation.body)
  expect(sha256Utf8(journalEntry.responseJson)).toBe(observed.signal.responseJsonSha256)

  const response = JSON.parse(journalEntry.responseJson) as CommandResponse | SaveResponse
  expect(response).toMatchObject({
    accepted: true,
    commandId: operation.commandId,
    sessionId: observed.signal.committedSessionId,
    stateDigest: observed.signal.committedStateDigest,
    stateRevision: observed.signal.committedStateRevision,
  })
  expect(hydrated.checkpoint).toMatchObject({
    sessionId: observed.signal.committedSessionId,
    stateRevision: observed.signal.committedStateRevision,
    currentStateDigest: observed.signal.committedStateDigest,
  })
  return { checkpointBytes, responseJson: journalEntry.responseJson }
}

function assertReplaySignal(
  capability: string,
  operation: PreparedOperation,
  requestBody: string,
  responseJson: string,
  observed: { line: string; signal: PostCommitReplayTestSignal },
): void {
  expect(Object.keys(observed.signal).sort()).toEqual([
    'commandId',
    'event',
    'requestUtf8Sha256',
    'responseJsonSha256',
    'route',
    'version',
  ])
  expect(observed.signal).toEqual({
    commandId: operation.commandId,
    event: 'post-commit-replay',
    requestUtf8Sha256: sha256Utf8(requestBody),
    responseJsonSha256: sha256Utf8(responseJson),
    route: operation.route,
    version: 1,
  })
  expect(observed.line).toBe(`${postCommitReplaySignalPrefix}${canonicalJson(observed.signal)}`)
  expect(observed.line).not.toContain(capability)
  expect(observed.line).not.toContain(requestBody)
  expect(observed.line).not.toContain('saveJson')
}

function observationPlanAfter(route: BridgeRuntimeJournalRoute): PostCommitResponseTestPlan {
  const nextRoute = route === 'command' ? 'save' : route === 'save' ? 'load' : 'command'
  return {
    action: 'hold',
    commandId: `post-commit-next-${nextRoute}-after-${route}`,
    nonce: `next-${nextRoute}-after-${route}`,
    route: nextRoute,
    version: 1,
  }
}

it('waits for a newline-terminated post-commit marker when stdout splits the JSON write', () => {
  const signal: PostCommitResponseTestSignal = {
    action: 'hold',
    commandId: 'split-marker-command',
    committedSessionId: 'split-marker-session',
    committedStateDigest: 'split-marker-digest',
    committedStateRevision: 7,
    event: 'post-commit-response',
    nonce: 'split-marker',
    requestUtf8Sha256: 'a'.repeat(64),
    responseJsonSha256: 'b'.repeat(64),
    route: 'command',
    version: 1,
  }
  const line = `${postCommitSignalPrefix}${canonicalJson(signal)}`
  const splitAt = line.length - 5

  expect(() => postCommitSignalFromText(line.slice(0, splitAt), signal.nonce)).not.toThrow()
  expect(postCommitSignalFromText(line.slice(0, splitAt), signal.nonce)).toBeNull()
  expect(
    postCommitSignalFromText(`${line.slice(0, splitAt)}${line.slice(splitAt)}\n`, signal.nonce),
  ).toEqual({ line, signal })
})

it('rejects the post-commit response gate outside a test process before opening runtime state', async () => {
  const runtimeDirectory = fs.mkdtempSync(
    path.join(os.tmpdir(), 'project-studio-post-commit-denied-'),
  )
  fs.chmodSync(runtimeDirectory, 0o700)
  const capability = randomBytes(32).toString('base64url')
  const plan: PostCommitResponseTestPlan = {
    action: 'hold',
    commandId: 'post-commit-production-denied',
    nonce: 'production-denied',
    route: 'command',
    version: 1,
  }

  try {
    const failure = await startBridge(runtimeDirectory, capability, plan, 'production').then(
      () => null,
      (error: unknown) => error as Error,
    )
    expect(failure).toBeInstanceOf(Error)
    expect(failure?.message).toContain(
      `${POST_COMMIT_RESPONSE_TEST_ENV} is only available with NODE_ENV=test.`,
    )
    expect(failure?.message).not.toContain(capability)
    expect(fs.readdirSync(runtimeDirectory)).toEqual([])
  } finally {
    fs.rmSync(runtimeDirectory, { recursive: true, force: true })
  }
}, 60_000)

it('restores one durable logical bridge session and exact HTTP replay after SIGKILL', async () => {
  const runtimeDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'project-studio-bridge-process-'))
  fs.chmodSync(runtimeDirectory, 0o700)
  const checkpointPath = path.join(runtimeDirectory, 'bridge-runtime-v1.json')
  const lockPath = `${checkpointPath}.lock`
  let first: RunningBridge | null = null
  let restarted: RunningBridge | null = null
  const productLaunchCapability = randomBytes(32).toString('base64url')

  try {
    first = await startBridge(runtimeDirectory, productLaunchCapability)
    const firstHealthRaw = await request(first, '/health')
    expect(firstHealthRaw.status).toBe(200)
    const firstRuntimeInstanceId = parseJson<{ runtimeInstanceId: string }>(
      firstHealthRaw,
    ).runtimeInstanceId
    const initial = await snapshot(first)
    expect(initial.stateRevision).toBe(0)
    expect(initial.gameWeek).toBe(0)
    expect(initial.snapshot.lot.week).toBe(0)
    expect(initial.snapshot.productions.activeProductions).toEqual([])
    expect(initial.snapshot.releaseResults.releasedFilms).toEqual([])
    expect(initial.snapshot.journeyNotices.firstFilmJourney).toMatchObject({
      stage: 'no-picture',
      beat: 'no-picture',
      ordinal: 1,
      next: { kind: 'commission' },
    })
    expect(initial.availableIntents).not.toHaveLength(0)
    expect(initial.availableIntents.every(
      (intent) => intent.kind === 'signFoundingContract',
    )).toBe(true)

    const firstCommand = journeyCommand(initial, 'process-restart-command-1')
    const firstCommandRaw = await request(first, '/command', 'POST', firstCommand.body)
    expect(firstCommandRaw.status).toBe(200)
    const firstCommandResponse = parseJson<CommandResponse>(firstCommandRaw)
    if (!firstCommandResponse.accepted) throw new Error(firstCommandResponse.message)
    expect(firstCommandRaw.body).toBe(canonicalJson(firstCommandResponse))
    expect(firstCommandResponse.stateRevision).toBe(initial.stateRevision + 1)

    const afterFirstCommand = await snapshot(first)
    const save = control(afterFirstCommand, 'process-restart-save')
    const saveRaw = await request(first, '/save', 'POST', save.body)
    expect(saveRaw.status).toBe(200)
    const saveResponse = parseJson<SaveResponse>(saveRaw)
    if (!saveResponse.accepted) throw new Error(saveResponse.message)
    expect(saveRaw.body).toBe(canonicalJson(saveResponse))
    expect(saveResponse.stateRevision).toBe(afterFirstCommand.stateRevision)

    const afterSave = await snapshot(first)
    const laterCommand = journeyCommand(afterSave, 'process-restart-command-2')
    const laterCommandRaw = await request(first, '/command', 'POST', laterCommand.body)
    expect(laterCommandRaw.status).toBe(200)
    const laterCommandResponse = parseJson<CommandResponse>(laterCommandRaw)
    if (!laterCommandResponse.accepted) throw new Error(laterCommandResponse.message)
    expect(laterCommandRaw.body).toBe(canonicalJson(laterCommandResponse))
    expect(laterCommandResponse.stateRevision).toBe(afterSave.stateRevision + 1)

    const afterLaterCommand = await snapshot(first)
    const load = control(afterLaterCommand, 'process-restart-load')
    const loadRaw = await request(first, '/load', 'POST', load.body)
    expect(loadRaw.status).toBe(200)
    const loadResponse = parseJson<CommandResponse>(loadRaw)
    if (!loadResponse.accepted) throw new Error(loadResponse.message)
    expect(loadRaw.body).toBe(canonicalJson(loadResponse))
    expect(loadResponse.stateRevision).toBe(afterLaterCommand.stateRevision + 1)
    expect(loadResponse.stateDigest).toBe(saveResponse.stateDigest)

    const beforeCrash = await snapshot(first)
    expect(beforeCrash).toMatchObject({
      sessionId: initial.sessionId,
      stateRevision: loadResponse.stateRevision,
      stateDigest: loadResponse.stateDigest,
    })
    expect(fs.existsSync(checkpointPath)).toBe(true)
    expect(fs.existsSync(lockPath)).toBe(true)

    const persistedBeforeCrash = fs.readFileSync(checkpointPath, 'utf8')
    expect(persistedBeforeCrash).not.toContain(first.capability)
    expect(persistedBeforeCrash).not.toContain(firstRuntimeInstanceId)
    expect(first.logs.stdout).not.toContain(first.capability)
    expect(first.logs.stderr).not.toContain(first.capability)
    expect(first.logs.stdout).not.toContain(firstRuntimeInstanceId)
    expect(first.logs.stderr).not.toContain(firstRuntimeInstanceId)
    const hydrated = decodeBridgeRuntimeCheckpoint(persistedBeforeCrash)
    expect(hydrated.checkpoint.journal.map((entry) => [entry.route, entry.commandId])).toEqual([
      ['command', firstCommand.request.commandId],
      ['save', save.request.commandId],
      ['command', laterCommand.request.commandId],
      ['load', load.request.commandId],
    ])
    expect(hydrated.checkpoint.journal.map((entry) => entry.requestJson)).toEqual([
      firstCommand.body,
      save.body,
      laterCommand.body,
      load.body,
    ])
    expect(hydrated.checkpoint.journal.map((entry) => entry.responseJson)).toEqual([
      firstCommandRaw.body,
      saveRaw.body,
      laterCommandRaw.body,
      loadRaw.body,
    ])
    expect(hydrated.currentSave.saveVersion).toBe(15)
    expect(exportSave(hydrated.currentSave)).toBe(hydrated.checkpoint.currentSaveJson)
    expect(hydrated.savedSave?.saveVersion).toBe(15)
    expect(hydrated.savedSave === null ? null : exportSave(hydrated.savedSave)).toBe(
      hydrated.checkpoint.savedSaveJson,
    )
    expect(hydrated.checkpoint.currentSaveJson).toBe(hydrated.checkpoint.savedSaveJson)
    expect(hydrated.checkpoint.currentStateDigest).toBe(hydrated.checkpoint.savedStateDigest)
    expect(hydrated.checkpoint.currentStateDigest).toBe(loadResponse.stateDigest)
    expect(saveResponse.saveJson).toBe(hydrated.checkpoint.savedSaveJson)

    const killed = await signalAndWait(first, 'SIGKILL')
    expect(killed).toEqual({ code: null, signal: 'SIGKILL' })
    expect(fs.existsSync(lockPath)).toBe(true)

    restarted = await startBridge(runtimeDirectory, productLaunchCapability)
    expect(restarted.capability).toBe(first.capability)
    const restartedHealthRaw = await request(restarted, '/health')
    expect(restartedHealthRaw.status).toBe(200)
    const restartedRuntimeInstanceId = parseJson<{ runtimeInstanceId: string }>(
      restartedHealthRaw,
    ).runtimeInstanceId
    expect(restartedRuntimeInstanceId).not.toBe(firstRuntimeInstanceId)
    const restored = await snapshot(restarted)
    expect(restored).toMatchObject({
      sessionId: beforeCrash.sessionId,
      stateRevision: beforeCrash.stateRevision,
      stateDigest: beforeCrash.stateDigest,
    })

    const replayCases = [
      {
        pathname: '/command',
        body: firstCommand.body,
        expectedStatus: 200,
        expected: firstCommandRaw.body,
      },
      {
        pathname: '/save',
        body: save.body,
        expectedStatus: 200,
        expected: saveRaw.body,
      },
      {
        pathname: '/command',
        body: laterCommand.body,
        expectedStatus: 200,
        expected: laterCommandRaw.body,
      },
      {
        pathname: '/load',
        body: load.body,
        expectedStatus: 200,
        expected: loadRaw.body,
      },
    ] as const
    for (const replay of replayCases) {
      const response = await request(restarted, replay.pathname, 'POST', replay.body)
      expect(response.status).toBe(replay.expectedStatus)
      expect(response.body).toBe(replay.expected)
      const authority = await snapshot(restarted)
      expect(authority).toMatchObject({
        sessionId: restored.sessionId,
        stateRevision: restored.stateRevision,
        stateDigest: restored.stateDigest,
      })
    }

    const conflictingRoute = canonicalJson({
      protocolVersion: PROTOCOL_VERSION,
      schemaId: SCHEMA_ID,
      sessionId: restored.sessionId,
      commandId: firstCommand.request.commandId,
      expectedStateRevision: restored.stateRevision,
    } satisfies ControlEnvelope)
    const conflictRaw = await request(restarted, '/save', 'POST', conflictingRoute)
    expect(conflictRaw.status).toBe(409)
    expect(parseJson<CommandResponse>(conflictRaw)).toMatchObject({
      accepted: false,
      reasonCode: 'COMMAND_ID_REUSE',
      sessionId: restored.sessionId,
      commandId: firstCommand.request.commandId,
      stateRevision: restored.stateRevision,
      stateDigest: restored.stateDigest,
    })
    expect(await snapshot(restarted)).toMatchObject({
      sessionId: restored.sessionId,
      stateRevision: restored.stateRevision,
      stateDigest: restored.stateDigest,
    })
    expect(fs.readFileSync(checkpointPath, 'utf8')).toBe(persistedBeforeCrash)
    expect(restarted.logs.stdout).not.toContain(restarted.capability)
    expect(restarted.logs.stderr).not.toContain(restarted.capability)
    expect(restarted.logs.stdout).not.toContain(restartedRuntimeInstanceId)
    expect(restarted.logs.stderr).not.toContain(restartedRuntimeInstanceId)

    const graceful = await signalAndWait(restarted, 'SIGTERM')
    expect(graceful).toEqual({ code: 0, signal: null })
    expect(fs.existsSync(lockPath)).toBe(false)
  } catch (error) {
    throw new Error(
      `${(error as Error).message}\n\n${diagnostics('first bridge', first)}\n\n` +
        diagnostics('restarted bridge', restarted),
      { cause: error },
    )
  } finally {
    await cleanupBridge(restarted)
    await cleanupBridge(first)
    fs.rmSync(runtimeDirectory, { recursive: true, force: true })
  }
}, 60_000)

it.each(testRoutes)(
  'withholds a durably committed %s response until SIGKILL and replays it byte-identically after restart',
  async (route) => {
    const runtimeDirectory = fs.mkdtempSync(
      path.join(os.tmpdir(), `project-studio-post-commit-hold-${route}-`),
    )
    fs.chmodSync(runtimeDirectory, 0o700)
    const checkpointPath = path.join(runtimeDirectory, 'bridge-runtime-v1.json')
    const capability = randomBytes(32).toString('base64url')
    const commandId = `post-commit-hold-${route}`
    const nonce = `hold-${route}`
    const plan: PostCommitResponseTestPlan = {
      action: 'hold',
      commandId,
      nonce,
      route,
      version: 1,
    }
    let first: RunningBridge | null = null
    let restarted: RunningBridge | null = null

    try {
      first = await startBridge(runtimeDirectory, capability, plan)
      const firstSessionRaw = await request(first, '/session')
      expect(firstSessionRaw.status).toBe(200)
      const firstSession = parseJson<{
        runtimeInstanceId: string
        sessionId: string
      }>(firstSessionRaw)
      const operation = await prepareOperation(first, route, commandId)
      const ambiguous = ambiguousPost(first, operation)
      const observed = await waitForPostCommitSignal(first, nonce)
      const committed = assertCommittedSignal(
        checkpointPath,
        capability,
        operation,
        observed,
        'hold',
      )

      const killed = await signalAndWait(first, 'SIGKILL')
      expect(killed).toEqual({ code: null, signal: 'SIGKILL' })
      const ambiguousOutcome = await ambiguous
      expect(ambiguousOutcome.kind).toBe('transport-error')
      expect(fs.readFileSync(checkpointPath, 'utf8')).toBe(committed.checkpointBytes)

      restarted = await startBridge(runtimeDirectory, capability, observationPlanAfter(route))
      expect(restarted.capability).toBe(first.capability)
      const restartedSessionRaw = await request(restarted, '/session')
      expect(restartedSessionRaw.status).toBe(200)
      const restartedSession = parseJson<{
        runtimeInstanceId: string
        sessionId: string
        stateDigest: string
        stateRevision: number
      }>(restartedSessionRaw)
      expect(restartedSession).toMatchObject({
        sessionId: observed.signal.committedSessionId,
        stateDigest: observed.signal.committedStateDigest,
        stateRevision: observed.signal.committedStateRevision,
      })
      expect(restartedSession.runtimeInstanceId).not.toBe(firstSession.runtimeInstanceId)

      const replayRequest = request(restarted, operation.pathname, 'POST', operation.body)
      const replayObserved = await waitForPostCommitReplaySignal(
        restarted,
        operation.route,
        operation.commandId,
      )
      const replay = await replayRequest
      expect(replay.status).toBe(200)
      expect(replay.body).toBe(committed.responseJson)
      expect(sha256Utf8(replay.body)).toBe(observed.signal.responseJsonSha256)
      assertReplaySignal(
        capability,
        operation,
        operation.body,
        committed.responseJson,
        replayObserved,
      )
      expect(replayObserved.signal.requestUtf8Sha256).toBe(observed.signal.requestUtf8Sha256)
      expect(replayObserved.signal.responseJsonSha256).toBe(observed.signal.responseJsonSha256)
      expect(await snapshot(restarted)).toMatchObject({
        sessionId: observed.signal.committedSessionId,
        stateDigest: observed.signal.committedStateDigest,
        stateRevision: observed.signal.committedStateRevision,
      })
      expect(fs.readFileSync(checkpointPath, 'utf8')).toBe(committed.checkpointBytes)
      expect(first.logs.stdout.split(postCommitSignalPrefix)).toHaveLength(2)
      expect(restarted.logs.stdout).not.toContain(postCommitSignalPrefix)
      expect(restarted.logs.stdout.split(postCommitReplaySignalPrefix)).toHaveLength(2)
      expect(restarted.logs.stdout).not.toContain(capability)
      expect(restarted.logs.stderr).not.toContain(capability)

      const graceful = await signalAndWait(restarted, 'SIGTERM')
      expect(graceful).toEqual({ code: 0, signal: null })
    } catch (error) {
      throw new Error(
        `${(error as Error).message}\n\n${diagnostics('first bridge', first)}\n\n` +
          diagnostics('restarted bridge', restarted),
        { cause: error },
      )
    } finally {
      await cleanupBridge(restarted)
      await cleanupBridge(first)
      fs.rmSync(runtimeDirectory, { recursive: true, force: true })
    }
  },
  60_000,
)

it('observes a byte-different semantic replay instead of falsely proving an exact request retry', async () => {
  const runtimeDirectory = fs.mkdtempSync(
    path.join(os.tmpdir(), 'project-studio-post-commit-byte-different-'),
  )
  fs.chmodSync(runtimeDirectory, 0o700)
  const checkpointPath = path.join(runtimeDirectory, 'bridge-runtime-v1.json')
  const capability = randomBytes(32).toString('base64url')
  const commandId = 'post-commit-byte-different-command'
  const nonce = 'byte-different-command'
  const plan: PostCommitResponseTestPlan = {
    action: 'drop',
    commandId,
    nonce,
    route: 'command',
    version: 1,
  }
  let bridge: RunningBridge | null = null

  try {
    bridge = await startBridge(runtimeDirectory, capability, plan)
    const operation = await prepareOperation(bridge, 'command', commandId)
    const ambiguous = ambiguousPost(bridge, operation)
    const committedObserved = await waitForPostCommitSignal(bridge, nonce)
    const committed = assertCommittedSignal(
      checkpointPath,
      capability,
      operation,
      committedObserved,
      'drop',
    )
    expect((await ambiguous).kind).toBe('transport-error')

    const replayRequest = request(bridge, operation.pathname, 'POST', operation.canonicalBody)
    const replayObserved = await waitForPostCommitReplaySignal(
      bridge,
      operation.route,
      operation.commandId,
    )
    const replay = await replayRequest
    expect(replay.status).toBe(200)
    expect(replay.body).toBe(committed.responseJson)
    assertReplaySignal(
      capability,
      operation,
      operation.canonicalBody,
      committed.responseJson,
      replayObserved,
    )
    expect(replayObserved.signal.requestUtf8Sha256).not.toBe(
      committedObserved.signal.requestUtf8Sha256,
    )
    expect(replayObserved.signal.responseJsonSha256).toBe(
      committedObserved.signal.responseJsonSha256,
    )
    expect(await snapshot(bridge)).toMatchObject({
      sessionId: committedObserved.signal.committedSessionId,
      stateDigest: committedObserved.signal.committedStateDigest,
      stateRevision: committedObserved.signal.committedStateRevision,
    })
    expect(fs.readFileSync(checkpointPath, 'utf8')).toBe(committed.checkpointBytes)
    expect(bridge.logs.stdout.split(postCommitSignalPrefix)).toHaveLength(2)
    expect(bridge.logs.stdout.split(postCommitReplaySignalPrefix)).toHaveLength(2)

    const graceful = await signalAndWait(bridge, 'SIGTERM')
    expect(graceful).toEqual({ code: 0, signal: null })
  } catch (error) {
    throw new Error(`${(error as Error).message}\n\n${diagnostics('bridge', bridge)}`, {
      cause: error,
    })
  } finally {
    await cleanupBridge(bridge)
    fs.rmSync(runtimeDirectory, { recursive: true, force: true })
  }
}, 60_000)

it.each(testRoutes)(
  'drops a durably committed %s response and replays it byte-identically in the same process',
  async (route) => {
    const runtimeDirectory = fs.mkdtempSync(
      path.join(os.tmpdir(), `project-studio-post-commit-drop-${route}-`),
    )
    fs.chmodSync(runtimeDirectory, 0o700)
    const checkpointPath = path.join(runtimeDirectory, 'bridge-runtime-v1.json')
    const capability = randomBytes(32).toString('base64url')
    const commandId = `post-commit-drop-${route}`
    const nonce = `drop-${route}`
    const plan: PostCommitResponseTestPlan = {
      action: 'drop',
      commandId,
      nonce,
      route,
      version: 1,
    }
    let bridge: RunningBridge | null = null

    try {
      bridge = await startBridge(runtimeDirectory, capability, plan)
      const operation = await prepareOperation(bridge, route, commandId)
      const ambiguous = ambiguousPost(bridge, operation)
      const observed = await waitForPostCommitSignal(bridge, nonce)
      const committed = assertCommittedSignal(
        checkpointPath,
        capability,
        operation,
        observed,
        'drop',
      )
      const ambiguousOutcome = await ambiguous
      expect(ambiguousOutcome.kind).toBe('transport-error')

      const currentSessionRaw = await request(bridge, '/session')
      expect(currentSessionRaw.status).toBe(200)
      expect(parseJson(currentSessionRaw)).toMatchObject({
        sessionId: observed.signal.committedSessionId,
        stateDigest: observed.signal.committedStateDigest,
        stateRevision: observed.signal.committedStateRevision,
      })
      const replayRequest = request(bridge, operation.pathname, 'POST', operation.body)
      const replayObserved = await waitForPostCommitReplaySignal(
        bridge,
        operation.route,
        operation.commandId,
      )
      const replay = await replayRequest
      expect(replay.status).toBe(200)
      expect(replay.body).toBe(committed.responseJson)
      expect(sha256Utf8(replay.body)).toBe(observed.signal.responseJsonSha256)
      assertReplaySignal(
        capability,
        operation,
        operation.body,
        committed.responseJson,
        replayObserved,
      )
      expect(replayObserved.signal.requestUtf8Sha256).toBe(observed.signal.requestUtf8Sha256)
      expect(replayObserved.signal.responseJsonSha256).toBe(observed.signal.responseJsonSha256)
      expect(await snapshot(bridge)).toMatchObject({
        sessionId: observed.signal.committedSessionId,
        stateDigest: observed.signal.committedStateDigest,
        stateRevision: observed.signal.committedStateRevision,
      })
      expect(fs.readFileSync(checkpointPath, 'utf8')).toBe(committed.checkpointBytes)
      expect(bridge.logs.stdout.split(postCommitSignalPrefix)).toHaveLength(2)
      expect(bridge.logs.stdout.split(postCommitReplaySignalPrefix)).toHaveLength(2)

      const graceful = await signalAndWait(bridge, 'SIGTERM')
      expect(graceful).toEqual({ code: 0, signal: null })
    } catch (error) {
      throw new Error(`${(error as Error).message}\n\n${diagnostics('bridge', bridge)}`, {
        cause: error,
      })
    } finally {
      await cleanupBridge(bridge)
      fs.rmSync(runtimeDirectory, { recursive: true, force: true })
    }
  },
  60_000,
)
