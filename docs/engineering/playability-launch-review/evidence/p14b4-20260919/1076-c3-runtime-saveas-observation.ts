// Exact R8 standalone observation; parent alone executes. No fixture/file writes.
// Both recorded Vitest timeouts remain failures; this adds no latency claim.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash, randomUUID } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { performance } from 'node:perf_hooks'
import { fileURLToPath } from 'node:url'
import { gunzipSync } from 'node:zlib'
import { BridgeSession } from '../../../../../bridge/session.ts'
import { PROJECTION_VERSION, PROTOCOL_VERSION, SCHEMA_ID } from '../../../../../bridge/protocol.ts'
import { canonicalJson } from '../../../../../bridge/schema/canonical.ts'
import { decodeBridgeRuntimeCheckpoint, DEFAULT_BRIDGE_RUNTIME_CHECKPOINT_LIMITS,
  type BridgeRuntimeCheckpointLimits } from '../../../../../bridge/runtime-checkpoint.ts'
import { createBridgeRuntimeCoordinator, type BridgeRuntimeCoordinator } from '../../../../../bridge/runtime/runtime-coordinator.ts'
import { decodeCampaignStorage } from '../../../../../bridge/runtime/campaign-storage-codec.ts'
import type { BridgeCheckpointStore } from '../../../../../bridge/runtime/checkpoint-store.ts'
import type { CampaignLibrary } from '../../../../../bridge/runtime/campaign-library.ts'
import type { CampaignRequest } from '../../../../../bridge/schema/bridge-schema.ts'
import { exportSave, importSave, makeSave, migrateToLive, stableStringify, validateSaveV37, validateSaveV38 } from '../../../../../src/core/save.ts'
import type { GameState } from '../../../../../src/core/types.ts'

const EXPECTED_HEAD = 'e6475aca1ef3bdfd593d660743ebc311981836cc'
const CURRENT_SCHEMA = 'sha256:d59e144e4077f669804ca87dd6184ef23bd44c9d93e44eb795f2b66350926a4d'
const FOCUS = { director: 'authored-0000', writer: 'authored-0001' } as const
const root = new URL('../../../../../', import.meta.url)
const directory = 'tests/fixtures/p14/genuine-v37-c3-corpus/'
const filename = 'genuine-v37-c3-preretirement-week207.json.gz'
const pins = {
  manifest: 'b3a3251ae7b3df96a1e2a615991744c5d1e5966a095424693f086a1581244294',
  compressed: '926de1b20fa0cba9b822c05f542f0a3949c7e4b21560c2fa508b6fa3168af5a0',
  raw: 'd6ad88d432b3ec75fbf6a2843493240d4007892c8230aea1f9a2350adc8c1045',
} as const
const sha = (value: string | Uint8Array) => createHash('sha256').update(value).digest('hex')
const read = (path: string) => readFileSync(new URL(path, root))
const git = (...args: string[]) => execFileSync('git', args,
  { cwd: fileURLToPath(root), encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
const sourcePaths = ['src', 'bridge', 'tests', 'generated', 'ui', 'scripts', 'package.json', 'package-lock.json',
  'tsconfig.json', 'tsconfig.bridge.json', 'tsconfig.src.json', 'vitest.config.ts', 'vitest.workspace.ts']
const sourceIdentity = () => ({ head: git('rev-parse', 'HEAD').trim(),
  diffSha256: sha(git('diff', '--no-ext-diff', '--binary', 'HEAD', '--', ...sourcePaths)),
  untracked: git('ls-files', '--others', '--exclude-standard', '--', ...sourcePaths).trim() })
const sourceBefore = sourceIdentity(), producerSha256 = sha(readFileSync(fileURLToPath(import.meta.url)))
assert.equal(sourceBefore.head, EXPECTED_HEAD)
assert.equal(sourceBefore.untracked, '', 'all consumed source must be recorded')
assert.equal(PROTOCOL_VERSION, 4); assert.equal(PROJECTION_VERSION, 53); assert.equal(SCHEMA_ID, CURRENT_SCHEMA)

type PhaseKind = 'operation' | 'inspection'
type Phase = { order: number; kind: PhaseKind; name: string; startedAt: string; elapsedMs: number; status: 'PASS' | 'FAIL' }
const phases: Phase[] = []
let outputBytes = 0, phaseOrder = 0, lastPhase = 'initialization'
const startedAt = new Date().toISOString(), started = performance.now()
function emit(value: unknown) {
  const line = JSON.stringify(value)
  outputBytes += Buffer.byteLength(line, 'utf8') + 1
  assert.ok(outputBytes <= 1024 * 1024, 'bounded1076 stdout')
  console.log(line)
}
function phaseStart(kind: PhaseKind, name: string) {
  lastPhase = name
  const phase = { order: ++phaseOrder, kind, name, startedAt: new Date().toISOString(), at: performance.now() }
  emit({ marker: 'PHASE_START', order: phase.order, kind, name, startedAt: phase.startedAt })
  return phase
}
function phaseEnd(phase: ReturnType<typeof phaseStart>, status: Phase['status']) {
  const row: Phase = { order: phase.order, kind: phase.kind, name: phase.name,
    startedAt: phase.startedAt, elapsedMs: performance.now() - phase.at, status }
  phases.push(row); emit({ marker: 'PHASE_END', ...row })
}
function inspect<T>(name: string, body: () => T): T {
  const phase = phaseStart('inspection', name)
  try { const value = body(); phaseEnd(phase, 'PASS'); return value }
  catch (error) { phaseEnd(phase, 'FAIL'); throw error }
}
async function measured<T>(kind: PhaseKind, name: string, body: () => Promise<T>): Promise<T> {
  const phase = phaseStart(kind, name)
  try { const value = await body(); phaseEnd(phase, 'PASS'); return value }
  catch (error) { phaseEnd(phase, 'FAIL'); throw error }
}

class Store implements BridgeCheckpointStore {
  checkpointPath = '/synthetic/1076-stage-d-library.json'
  writes = 0; closed = false
  constructor(public contents: string | null = null) {}
  async read() { return this.contents }
  async writeAtomic(text: string) { this.writes++; this.contents = text }
  async close() { this.closed = true }
}
const libraryReads = new Map<string, CampaignLibrary>()
const checkpointReads = new Map<string, ReturnType<typeof decodeBridgeRuntimeCheckpoint>>()
function library(store: Store): CampaignLibrary {
  assert.ok(store.contents)
  const cached = libraryReads.get(store.contents)
  if (cached) return cached
  const decoded = decodeCampaignStorage(JSON.parse(store.contents), DEFAULT_BRIDGE_RUNTIME_CHECKPOINT_LIMITS.maxCheckpointBytes, 32)
  assert.ok(decoded !== null && typeof decoded === 'object' && 'format' in decoded
    && decoded.format === 'project-studio-campaign-library')
  const value = decoded as CampaignLibrary
  libraryReads.set(store.contents, value)
  return value
}
function storedCheckpoint(raw: string) {
  const cached = checkpointReads.get(raw)
  if (cached) return cached
  const value = decodeBridgeRuntimeCheckpoint(raw)
  checkpointReads.set(raw, value)
  return value
}
const storedState = (raw: string) => storedCheckpoint(raw).currentSave.state
function choices(state: GameState, week: number) {
  assert.equal(state.market.tick, week)
  for (const [target, id] of Object.entries(FOCUS)) {
    const changes = state.careerLifecycle.professionChanges.filter(row => row.personId === id)
    assert.equal(changes.length, 1)
    assert.equal(changes[0]!.week, week); assert.equal(changes[0]!.from, 'actor'); assert.equal(changes[0]!.to, target)
    const evaluations = state.careerLifecycle.transitionEvaluations.filter(row => row.personId === id)
    assert.equal(evaluations.length, 1)
    assert.equal(evaluations[0]!.week, week); assert.equal(evaluations[0]!.outcome, 'chosen')
    assert.equal(evaluations[0]!.selected, target)
  }
}
async function request(runtime: BridgeRuntimeCoordinator, operation: CampaignRequest['operation'], extra: Partial<CampaignRequest> = {}): Promise<CampaignRequest> {
  const current = await runtime.campaignLibrary(); assert.ok(current)
  return { protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, type: 'campaign', commandId: randomUUID(),
    sessionId: current.sessionId, expectedStateRevision: current.stateRevision, expectedCatalogueRevision: current.catalogueRevision,
    expectedActiveCampaignId: current.activeCampaignId, operation, campaignId: null, label: null, overwriteCampaignId: null,
    confirmDestructive: false, unsavedDisposition: 'requireClean', ...extra }
}
let reservedAdvances = 0, completedAdvances = 0, freshSessionCalls = 0
async function advance(runtime: BridgeRuntimeCoordinator, store: Store, label: string) {
  const snapshot = await measured('inspection', `${label}/snapshot`, () => runtime.read(session => session.snapshot()))
  const before = inspect(`${label}/before`, () => storedState(library(store).workingCheckpointJson).market.tick)
  const option = snapshot.availableIntents.find(row => row.kind === 'advanceWeek'); assert.ok(option)
  assert.ok(reservedAdvances < 2, 'at most two actual advance invocations'); reservedAdvances++
  const result = await measured('operation', label, () => runtime.dispatch('command', {
    protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId: snapshot.sessionId,
    expectedStateRevision: snapshot.stateRevision, commandId: randomUUID(),
    type: 'submitIntent', payload: { intentId: option.intentId } }))
  inspect(`${label}/accepted-after`, () => {
    assert.equal(result.response.accepted, true)
    assert.equal(storedState(library(store).workingCheckpointJson).market.tick, before + 1)
    completedAdvances++
  })
}

let runtime: BridgeRuntimeCoordinator | null = null
let store = new Store(), completed = false, failure: { phase: string; message: string } | null = null
let cleanupFailure: string | null = null, guardFailure: string | null = null
const boundaryHashes: Record<string, string> = {}
const message = (error: unknown) => (error instanceof Error ? error.message : String(error)).split('\n')[0]!.slice(0, 1500)
try {
  const initial = inspect('strict37-input-and-live38', () => {
    const manifestBytes = read(`${directory}MANIFEST.json`)
    assert.equal(sha(manifestBytes), pins.manifest)
    const manifest = JSON.parse(manifestBytes.toString('utf8'))
    assert.equal(manifest.saveVersion, 37); assert.equal(manifest.projectionVersion, 52)
    assert.equal(manifest.sourceSha, '1f44aa505c0d677430451ab5fcacaf5e0ce205d6')
    assert.equal(manifest.producerSha256, 'aba3b5c101a1982e2994ce69de0e78633a16d499ebe6cb26bdcc31875235bb4c')
    assert.equal(manifest.knownParityDefect.status, 'FAIL')
    const artifact = manifest.artifacts.find((row: { filename: string }) => row.filename === filename)
    assert.ok(artifact); assert.equal(artifact.compressedSha256, pins.compressed)
    assert.equal(artifact.uncompressedSha256, pins.raw)
    const compressed = read(directory + filename), raw = gunzipSync(compressed).toString('utf8')
    assert.equal(sha(compressed), pins.compressed); assert.equal(sha(raw), pins.raw)
    const old = validateSaveV37(JSON.parse(raw))
    assert.equal(old.state.market.tick, 207); assert.ok(exportSave(old) === raw, 'strict37 original bytes')
    const state = migrateToLive(importSave(raw)).state, before = stableStringify(state), envelope = makeSave(state)
    assert.equal(envelope.saveVersion, 38); assert.ok(validateSaveV38(envelope) === envelope)
    assert.ok(stableStringify(state) === before, 'initial full-save proof preserves state')
    boundaryHashes.initial38 = sha(exportSave(envelope))
    return state
  })
  const options = (target: Store) => ({ store: target, fatal: (error: unknown) => { throw error },
    campaigns: { durable: true, regime: 'endowed' as const },
    createFreshSession: (limits: BridgeRuntimeCheckpointLimits) => {
      freshSessionCalls++
      assert.deepEqual(limits, DEFAULT_BRIDGE_RUNTIME_CHECKPOINT_LIMITS)
      return new BridgeSession(initial, undefined, null, { limits })
    } })
  runtime = await measured('operation', 'coordinator-start', () => createBridgeRuntimeCoordinator(options(store)))
  const active = runtime
  const saveA = await measured('inspection', 'save-A207-request', () => request(active, 'saveAs', { label: 'A207' }))
  const savedA = await measured('operation', 'save-As-A207', () => active.campaign(saveA))
  assert.equal(savedA.accepted, true)
  const a = inspect('A207-record', () => {
    const record = library(store).records.find(row => row.label === 'A207'); assert.ok(record)
    assert.equal(storedState(record.checkpointJson).market.tick, 207)
    boundaryHashes.A207 = sha(record.checkpointJson); return record
  })
  const a207 = a.checkpointJson
  await advance(active, store, 'advance-to208')
  inspect('208-actual-choices', () => choices(storedState(library(store).workingCheckpointJson), 208))
  const saveAs = await measured('inspection', 'save-B208-request', () => request(active, 'saveAs', { label: 'B208' }))
  const reply = await measured('operation', 'save-As-B208', () => active.campaign(saveAs))
  assert.equal(reply.accepted, true)
  const b = inspect('B208-full-record', () => {
    const record = library(store).records.find(row => row.label === 'B208'); assert.ok(record)
    const decoded = storedCheckpoint(record.checkpointJson)
    assert.notEqual(record.id, a.id); assert.notEqual(decoded.checkpoint.sessionId, saveAs.sessionId)
    choices(storedState(record.checkpointJson), 208)
    assert.ok(decoded.checkpoint.currentSaveJson === decoded.checkpoint.savedSaveJson, 'B208 both complete saved slots')
    boundaryHashes.B208 = sha(record.checkpointJson); return record
  })
  const b208 = b.checkpointJson, writes = store.writes, beforeDuplicate = store.contents
  const duplicate = await measured('operation', 'duplicate-save-As-B208', () => active.campaign(saveAs))
  inspect('duplicate-response-and-no-write', () => {
    assert.ok(canonicalJson(duplicate) === canonicalJson(reply), 'exact original duplicate response')
    assert.equal(store.writes, writes); assert.ok(store.contents === beforeDuplicate, 'duplicate leaves exact store bytes')
    assert.equal(library(store).records.length, 2)
    assert.ok(library(store).records.find(row => row.id === a.id)!.checkpointJson === a207, 'A207 survives B208 save-as')
  })
  await advance(active, store, 'advance-B-to209')
  inspect('B209-week', () => assert.equal(storedState(library(store).workingCheckpointJson).market.tick, 209))
  const snapshot = await measured('inspection', 'SAVE-B209-snapshot', () => active.read(session => session.snapshot()))
  const save = await measured('operation', 'actual-SAVE-B209', () => active.dispatch('save', {
    protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId: snapshot.sessionId,
    expectedStateRevision: snapshot.stateRevision, commandId: randomUUID() }))
  assert.equal(save.response.accepted, true)
  const catalogue = await measured('inspection', 'SAVE-B209-clean-catalogue', () => active.campaignLibrary())
  assert.ok(catalogue); assert.equal(catalogue.dirty, false)
  const b209 = inspect('B209-both-saved-slots', () => {
    const record = library(store).records.find(row => row.id === b.id); assert.ok(record)
    assert.equal(storedState(record.checkpointJson).market.tick, 209)
    assert.ok(record.checkpointJson !== b208, 'actual B209 differs from saved B208')
    const decoded = storedCheckpoint(record.checkpointJson)
    assert.ok(decoded.checkpoint.currentSaveJson === decoded.checkpoint.savedSaveJson, 'B209 both saved slots')
    boundaryHashes.B209 = sha(record.checkpointJson); return record.checkpointJson
  })
  const b209Decoded = storedCheckpoint(b209)
  const loadA = await measured('inspection', 'load-A207-request', () => request(active, 'load', { campaignId: a.id }))
  assert.equal(loadA.unsavedDisposition, 'requireClean')
  const loaded = await measured('operation', 'clean-load-A207', () => active.campaign(loadA))
  assert.equal(loaded.accepted, true)
  inspect('loaded-A207-with-B209-preserved', () => {
    const afterLoad = library(store)
    assert.equal(afterLoad.activeCampaignId, a.id)
    assert.equal(storedState(afterLoad.workingCheckpointJson).market.tick, 207)
    assert.ok(afterLoad.records.find(row => row.id === b.id)!.checkpointJson === b209, 'B209 survives actual Load A')
  })
  const durable = store.contents; assert.ok(durable)
  const priorStore = store
  await measured('operation', 'close-before-restart', () => active.close())
  assert.equal(priorStore.closed, true); runtime = null
  store = new Store(durable)
  runtime = await measured('operation', 'actual-coordinator-restart', () => createBridgeRuntimeCoordinator(options(store)))
  inspect('restarted-record-slot-journal-isolation', () => {
    const restarted = library(store)
    assert.equal(restarted.activeCampaignId, a.id); assert.equal(restarted.records.length, 2)
    assert.ok(restarted.records.find(row => row.id === a.id)!.checkpointJson === a207, 'restarted exact A207 record')
    assert.ok(restarted.records.find(row => row.id === b.id)!.checkpointJson === b209, 'restarted exact B209 record')
    const activeCheckpoint = storedCheckpoint(restarted.workingCheckpointJson)
    assert.equal(storedState(restarted.workingCheckpointJson).market.tick, 207)
    assert.notEqual(activeCheckpoint.checkpoint.sessionId, b209Decoded.checkpoint.sessionId)
    assert.equal(activeCheckpoint.checkpoint.journal.some(row =>
      b209Decoded.checkpoint.journal.some(other => other.commandId === row.commandId)), false)
    assert.ok(activeCheckpoint.savedSave); assert.equal(activeCheckpoint.savedSave.state.market.tick, 207)
    boundaryHashes.restartedWorkingA207 = sha(restarted.workingCheckpointJson)
  })
  assert.equal(reservedAdvances, 2); assert.equal(completedAdvances, 2)
  assert.equal(freshSessionCalls, 1, 'durable restart must not fall back to a fresh session')
  completed = true
} catch (error) {
  failure = { phase: lastPhase, message: message(error) }
} finally {
  if (runtime !== null) try {
    await measured('operation', 'finally-close', () => runtime!.close())
    assert.equal(store.closed, true)
  } catch (error) { cleanupFailure = message(error); completed = false }
}
try {
  assert.deepEqual(sourceIdentity(), sourceBefore, 'consumed source/HEAD drift')
  assert.equal(sha(readFileSync(fileURLToPath(import.meta.url))), producerSha256, 'producer drift')
  assert.equal(sha(read(`${directory}MANIFEST.json`)), pins.manifest, 'manifest drift')
  assert.equal(sha(read(directory + filename)), pins.compressed, 'input drift')
} catch (error) { guardFailure = message(error); completed = false }
if (failure || cleanupFailure || guardFailure) completed = false
emit({ marker: completed ? 'R8_ALL_ORIGINAL_ASSERTIONS_COMPLETED' : 'R8_STOPPED_AT_FIRST_FAILURE',
  producer: '1076-c3-runtime-saveas-observation.ts', producerSha256, source: sourceBefore,
  sourceAndInputsUnchanged: guardFailure === null, input: { filename, pins }, startedAt,
  elapsedMs: performance.now() - started, reservedAdvances, completedAdvances, maxAdvanceInvocations: 2, freshSessionCalls,
  failure, cleanupFailure, guardFailure, boundaryHashes, phases,
  limits: DEFAULT_BRIDGE_RUNTIME_CHECKPOINT_LIMITS, storage: 'actual coordinator and codec, injected in-memory store',
  evidenceLimit: 'Standalone semantic observation; preserves both Vitest timeout failures. No latency, native or real-disk claim.',
  environment: { node: process.version, platform: process.platform, arch: process.arch } })
if (!completed) process.exitCode = 1
