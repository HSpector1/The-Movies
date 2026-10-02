// 1030/1063/1065: genuine prior52/51 bytes, current38 slots and real durable Save As.
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { afterAll, describe, expect, it, vi } from 'vitest'
import { BridgeSession } from '../bridge/session.ts'
import { PROJECTION_VERSION, PROTOCOL_VERSION, SCHEMA_ID } from '../bridge/protocol.ts'
import { canonicalJson } from '../bridge/schema/canonical.ts'
import { decodeBridgeRuntimeCheckpoint, encodeBridgeRuntimeCheckpoint, loadBridgeRuntimeCheckpoint,
  DEFAULT_BRIDGE_RUNTIME_CHECKPOINT_LIMITS, SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS,
  type BridgeRuntimeCheckpointLimits } from '../bridge/runtime-checkpoint.ts'
import { createBridgeRuntimeCoordinator, type BridgeRuntimeCoordinator } from '../bridge/runtime/runtime-coordinator.ts'
import { decodeCampaignStorage } from '../bridge/runtime/campaign-storage-codec.ts'
import type { BridgeCheckpointStore } from '../bridge/runtime/checkpoint-store.ts'
import type { CampaignLibrary } from '../bridge/runtime/campaign-library.ts'
import type { CampaignRequest } from '../bridge/schema/bridge-schema.ts'
import { convertV38ToV37, exportSave, LIVE_SAVE_VERSION, makeSave, migrateToV38, validateSaveV37, validateSaveV43 } from '../src/core/save.js'
import { tick } from '../src/core/tick.js'
import type { GameState } from '../src/core/types.js'
import { c3Raw, clone, CONTINUOUS208, FOCUS, migrated, PRE207, RUNTIME208, SCIENTIST, sha } from './helpers/p14c3-fixtures.js'
import { readRuntime51, OUTGOING_51 } from './helpers/p14c2rm-fixtures.js'
import { acceptedEvidence } from './helpers/p14c3-genuine-evidence-fixtures.js'

const OUTGOING_52 = 'sha256:f036ccdd62c4ac2a700a27796631e1c4f8c85f9cccfb14ac6850083fb8dba5f2'
type Historical = { format: string; checkpointVersion: number; protocolVersion: number; schemaId: string;
  sessionId: string; stateRevision: number; currentSaveJson: string; savedSaveJson: string;
  currentStateDigest: string; savedStateDigest: string; journalDigest: string;
  journal: { route: string; commandId: string; requestJson: string; responseJson: string }[] }
const bytes = (state: GameState) => exportSave(makeSave(state))
let reserved = 0, completed = 0
function reserve(): void { assert.ok(reserved < 7, 'runtime aggregate7 actual advance cap'); reserved++ }
function actualAdvance(session: BridgeSession, commandId: string) {
  const snapshot = session.snapshot(), before = session.gameState.market.tick
  const option = snapshot.availableIntents.find(row => row.kind === 'advanceWeek'); assert.ok(option)
  const request = { protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId: snapshot.sessionId,
    expectedStateRevision: snapshot.stateRevision, commandId, type: 'submitIntent' as const, payload: { intentId: option.intentId } }
  reserve()
  const response = session.command(request)
  expect(response.accepted).toBe(true); expect(session.gameState.market.tick).toBe(before + 1); completed++
  acceptedEvidence(session.gameState)
  return { request, response }
}
function control(session: BridgeSession, commandId: string) {
  return { protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId: session.sessionId,
    expectedStateRevision: session.stateRevision, commandId }
}
function prior52() {
  const raw = c3Raw('runtime52-current208-saved207.json.gz'), value = JSON.parse(raw) as Historical
  expect(canonicalJson(value) + '\n').toBe(raw)
  expect(value).toMatchObject({ protocolVersion: 4, schemaId: OUTGOING_52, stateRevision: 1 })
  expect(value.journal).toHaveLength(1)
  expect(value.currentSaveJson).toBe(c3Raw(RUNTIME208)); expect(value.savedSaveJson).toBe(c3Raw(PRE207))
  return { raw, value }
}
function recovered52(label: string) {
  const prior = prior52(), factory = vi.fn(() => `1065-${label}`)
  const loaded = loadBridgeRuntimeCheckpoint(prior.raw, undefined, factory)
  expect(loaded.migratedFromProtocolVersion).toBe(4); expect(factory).toHaveBeenCalledTimes(1)
  return { ...prior, loaded, session: BridgeSession.fromRuntimeCheckpoint(loaded.hydrated) }
}
function choices(state: GameState, week: number) {
  expect(state.market.tick).toBe(week)
  for (const [target, id] of Object.entries(FOCUS)) {
    expect(state.careerLifecycle.professionChanges.filter(row => row.personId === id))
      .toEqual([expect.objectContaining({ week, from: 'actor', to: target })])
    expect(state.careerLifecycle.transitionEvaluations.filter(row => row.personId === id))
      .toEqual([expect.objectContaining({ week, outcome: 'chosen', selected: target })])
  }
}
function differences(a: unknown, b: unknown, path = '$'): string[] {
  if (Object.is(a, b)) return []
  if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') return [path]
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return [path]
    return a.flatMap((value, i) => differences(value, b[i], `${path}[${i}]`))
  }
  const left = a as Record<string, unknown>, right = b as Record<string, unknown>
  const keys = [...new Set([...Object.keys(left), ...Object.keys(right)])].sort()
  return keys.flatMap(key => differences(left[key], right[key], `${path}.${key}`))
}
function reopen(session: BridgeSession) {
  const raw = encodeBridgeRuntimeCheckpoint(session.exportRuntimeCheckpoint())
  const factory = vi.fn(() => { throw new Error('current53 must not migrate twice') })
  const decoded = loadBridgeRuntimeCheckpoint(raw, undefined, factory)
  expect(decoded.migratedFromProtocolVersion).toBeNull(); expect(factory).not.toHaveBeenCalled()
  expect(encodeBridgeRuntimeCheckpoint(decoded.hydrated.checkpoint)).toBe(raw)
  return BridgeSession.fromRuntimeCheckpoint(decoded.hydrated)
}
class Store implements BridgeCheckpointStore {
  checkpointPath = '/synthetic/1065-stage-d-library.json'
  writes = 0; closed = false
  constructor(public contents: string | null = null) {}
  async read() { return this.contents }
  async writeAtomic(text: string) { this.writes++; this.contents = text }
  async close() { this.closed = true }
}
// 1033/1068: read-only inspection reuses exact validated bytes. Each distinct
// stored boundary still goes through its actual codec/full-save validation;
// the real coordinator startup/restart and durable transactions are unchanged.
const libraryReads = new Map<string, CampaignLibrary>()
const checkpointReads = new Map<string, ReturnType<typeof decodeBridgeRuntimeCheckpoint>>()
function library(store: Store): CampaignLibrary {
  assert.ok(store.contents)
  const cached = libraryReads.get(store.contents)
  if (cached) return cached
  const value = decodeCampaignStorage(JSON.parse(store.contents), DEFAULT_BRIDGE_RUNTIME_CHECKPOINT_LIMITS.maxCheckpointBytes, 32)
  assert.ok(value !== null && typeof value === 'object' && 'format' in value && value.format === 'project-studio-campaign-library')
  const decoded = value as CampaignLibrary
  libraryReads.set(store.contents, decoded)
  return decoded
}
function storedCheckpoint(raw: string) {
  const cached = checkpointReads.get(raw)
  if (cached) return cached
  const decoded = decodeBridgeRuntimeCheckpoint(raw)
  checkpointReads.set(raw, decoded)
  return decoded
}
function storedState(raw: string) { return storedCheckpoint(raw).currentSave.state }
async function request(runtime: BridgeRuntimeCoordinator, operation: CampaignRequest['operation'], extra: Partial<CampaignRequest> = {}): Promise<CampaignRequest> {
  const current = await runtime.campaignLibrary(); assert.ok(current)
  return { protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, type: 'campaign', commandId: randomUUID(),
    sessionId: current.sessionId, expectedStateRevision: current.stateRevision, expectedCatalogueRevision: current.catalogueRevision,
    expectedActiveCampaignId: current.activeCampaignId, operation, campaignId: null, label: null, overwriteCampaignId: null,
    confirmDestructive: false, unsavedDisposition: 'requireClean', ...extra }
}
async function runtimeAdvance(runtime: BridgeRuntimeCoordinator, store: Store) {
  const snapshot = await runtime.read(session => session.snapshot()), before = storedState(library(store).workingCheckpointJson).market.tick
  const option = snapshot.availableIntents.find(row => row.kind === 'advanceWeek'); assert.ok(option)
  reserve()
  const result = await runtime.dispatch('command', { protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID,
    sessionId: snapshot.sessionId, expectedStateRevision: snapshot.stateRevision, commandId: randomUUID(),
    type: 'submitIntent', payload: { intentId: option.intentId } })
  expect(result.response.accepted).toBe(true)
  expect(storedState(library(store).workingCheckpointJson).market.tick).toBe(before + 1); completed++
}
afterAll(() => console.info(JSON.stringify({ phase: '1065-runtime', reservedAdvances: reserved, completedAdvances: completed, cap: 7 })))

describe('C.3 projection53 current/save/journal and durable campaign authority', () => {
  it('R1 preserves genuine outgoing52 bytes, real old journal and the recorded twelve-digest parity defect', () => {
    const { raw, value } = prior52()
    const manifest = JSON.parse(readFileSync('tests/fixtures/p14/genuine-v37-c3-corpus/MANIFEST.json', 'utf8'))
    expect(manifest).toMatchObject({ saveVersion: 37, projectionVersion: 52, knownParityDefect: { status: 'FAIL', parsed208: { count: 12 } } })
    for (const [slot, week] of [['currentSaveJson', 208], ['savedSaveJson', 207]] as const) {
      const old = validateSaveV37(JSON.parse(value[slot]))
      expect(old.state.market.tick).toBe(week); expect(exportSave(old)).toBe(value[slot])
      expect(old.state.careerLifecycle).not.toHaveProperty('transitionBoundaryWeek')
      expect(sha(value[slot])).toBe(slot === 'currentSaveJson' ? value.currentStateDigest : value.savedStateDigest)
    }
    expect(value.currentSaveJson).not.toBe(value.savedSaveJson)
    expect(sha(canonicalJson(value.journal))).toBe(value.journalDigest)
    expect(JSON.parse(value.journal[0]!.responseJson)).toMatchObject({ accepted: true })
    const changed = differences(JSON.parse(c3Raw(CONTINUOUS208)), JSON.parse(value.currentSaveJson))
    expect(changed).toHaveLength(12)
    expect(changed.every(path => /^\$\.state\.promises\[\d+\]\.feasibilityReceipt\.inputsDigest$/.test(path))).toBe(true)
    expect(prior52().raw).toBe(raw)
  })
  it('R2 opens53/Save38 once, registers exact52 and independently migrates208/207 while resetting prior session authority', () => {
    const f = recovered52('slots')
    expect(PROJECTION_VERSION).toBe(56); expect(PROTOCOL_VERSION).toBe(4); expect(LIVE_SAVE_VERSION).toBe(43)
    expect([...SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS].filter(([id]) => id === OUTGOING_52)).toEqual([[OUTGOING_52, 'projection-v52']])
    expect(SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS.has(SCHEMA_ID)).toBe(false)
    const current = f.loaded.hydrated.checkpoint
    expect(current).toMatchObject({ schemaId: SCHEMA_ID, sessionId: '1065-slots', stateRevision: 0, journal: [], journalDigest: sha('[]') })
    expect(current.sessionId).not.toBe(f.value.sessionId)
    for (const [slot, week] of [['currentSaveJson', 208], ['savedSaveJson', 207]] as const) {
      assert.ok(current[slot])
      const saved = validateSaveV43(JSON.parse(current[slot]!))
      expect(saved.state.careerLifecycle.transitionBoundaryWeek).toBe(week)
      expect(saved.state.careerLifecycle.professionChanges).toEqual([])
      expect(saved.state.careerLifecycle.transitionEvaluations).toEqual([])
      for (const id of Object.values(FOCUS)) {
        expect(saved.state.careerLifecycle.professionAnchors.find(row => row.personId === id))
          .toEqual({ personId: id, profession: 'actor', kind: 'existing', recordedWeek: week })
        if (week === 208) expect(saved.state.careerLifecycle.transitionDue).toContainEqual({ personId: id, week: 209 })
        else expect(saved.state.careerLifecycle.transitionDue.some(row => row.personId === id)).toBe(false)
      }
      expect(exportSave(convertV38ToV37(migrateToV38(saved)))).toBe(f.value[slot])
    }
    expect(current.currentSaveJson).not.toBe(current.savedSaveJson)
    expect(f.session.snapshot().savedSlot?.gameWeek).toBe(207)
    expect(sha(current.currentSaveJson)).toBe(current.currentStateDigest)
    expect(sha(current.savedSaveJson!)).toBe(current.savedStateDigest)
  })
  it('R3 actual new commands date current208 reconciliation209 separately from saved207 natural208 and replay without extra work', () => {
    const current = recovered52('current209'), saved = recovered52('saved208')
    const oldRequest = JSON.parse(current.value.journal[0]!.requestJson), unchanged = bytes(current.session.gameState)
    expect(current.session.command(oldRequest).accepted).toBe(false); expect(bytes(current.session.gameState)).toBe(unchanged)
    const currentAdvance = actualAdvance(current.session, '1065-current-to209')
    choices(current.session.gameState, 209)
    const load = control(saved.session, '1065-load207'), loadedResponse = saved.session.load(load)
    expect(loadedResponse.accepted).toBe(true); expect(saved.session.gameState.market.tick).toBe(207)
    const loadRestart = reopen(saved.session), loadedBytes = bytes(loadRestart.gameState)
    expect(canonicalJson(loadRestart.load(load))).toBe(canonicalJson(loadedResponse))
    expect(bytes(loadRestart.gameState)).toBe(loadedBytes)
    const savedAdvance = actualAdvance(loadRestart, '1065-saved-to208'); choices(loadRestart.gameState, 208)
    reserve(); const direct = tick(migrated(PRE207), { develop: true }); completed++
    expect(bytes(loadRestart.gameState)).toBe(bytes(direct))
    for (const [session, accepted] of [[current.session, currentAdvance], [loadRestart, savedAdvance]] as const) {
      const restart = reopen(session), before = bytes(restart.gameState), revision = restart.stateRevision
      expect(canonicalJson(restart.command(accepted.request))).toBe(canonicalJson(accepted.response))
      expect(bytes(restart.gameState)).toBe(before); expect(restart.stateRevision).toBe(revision)
      expect(restart.exportRuntimeCheckpoint().journal.some(row => row.commandId === current.value.journal[0]!.commandId)).toBe(false)
    }
  })
  it('R4 real prior51 Scientist current670 finalizes671 while its saved669 branch retires/finalizes670', () => {
    const raw = readRuntime51(), old = JSON.parse(raw) as Historical
    expect(old.schemaId).toBe(OUTGOING_51)
    const current = BridgeSession.fromRuntimeCheckpoint(loadBridgeRuntimeCheckpoint(raw, undefined, () => '1065-sci-current').hydrated)
    const saved = BridgeSession.fromRuntimeCheckpoint(loadBridgeRuntimeCheckpoint(raw, undefined, () => '1065-sci-saved').hydrated)
    expect(current.gameState.market.tick).toBe(670); expect(current.snapshot().savedSlot?.gameWeek).toBe(669)
    expect(current.gameState.careerLifecycle.industryRetirements.filter(row => row.personId === SCIENTIST)).toEqual([])
    actualAdvance(current, '1065-scientist671')
    expect(current.gameState.careerLifecycle.industryRetirements.find(row => row.personId === SCIENTIST)).toMatchObject({ week: 671 })
    expect(saved.load(control(saved, '1065-load669')).accepted).toBe(true)
    expect(saved.gameState.market.tick).toBe(669); actualAdvance(saved, '1065-scientist670')
    expect(saved.gameState.careerLifecycle.industryRetirements.find(row => row.personId === SCIENTIST)).toMatchObject({ week: 670 })
    for (const session of [current, saved]) {
      expect(session.gameState.careerLifecycle.records.find(row => row.personId === SCIENTIST)).toMatchObject({ retiredWeek: 670 })
      const reopened = reopen(session)
      expect(bytes(reopened.gameState)).toBe(bytes(session.gameState))
      expect(reopened.exportRuntimeCheckpoint().savedSaveJson).toBe(session.exportRuntimeCheckpoint().savedSaveJson)
    }
    expect(readRuntime51()).toBe(raw)
  })
  it('R5 refuses unknown schema, bad outer/journal digests and reused prior session without changing historical artifacts', () => {
    const { raw, value } = prior52()
    for (const bad of [{ ...value, schemaId: `sha256:${'ab'.repeat(32)}` }, { ...value, currentStateDigest: '0'.repeat(64) },
      { ...value, savedStateDigest: '0'.repeat(64) }, { ...value, journalDigest: '0'.repeat(64) }]) {
      const factory = vi.fn(() => '1065-invalid-envelope')
      expect(() => loadBridgeRuntimeCheckpoint(canonicalJson(bad) + '\n', undefined, factory)).toThrow(/schema|digest/i)
      expect(factory).not.toHaveBeenCalled()
    }
    expect(() => loadBridgeRuntimeCheckpoint(raw, undefined, () => value.sessionId)).toThrow(/must differ/)
    expect(prior52().raw).toBe(raw)
  })
  it.each([['R6', 'currentSaveJson'], ['R7', 'savedSaveJson']] as const)('%s rejects independently malformed %s through strict inner authority before session creation', (_label, slot) => {
    const { raw, value } = prior52(), bad = clone(value)
    const inner = JSON.parse(bad[slot])
    const talent = inner.state.talent.find((row: { id: string }) => row.id === FOCUS.director); assert.ok(talent)
    talent.age += 1
    bad[slot] = canonicalJson(inner)
    if (slot === 'currentSaveJson') bad.currentStateDigest = sha(bad[slot])
    else bad.savedStateDigest = sha(bad[slot])
    const factory = vi.fn(() => '1065-invalid-inner')
    expect(() => loadBridgeRuntimeCheckpoint(canonicalJson(bad) + '\n', undefined, factory)).toThrow(/age|provenance/i)
    expect(factory).not.toHaveBeenCalled()
    expect(prior52().raw).toBe(raw)
  })
  it('R8 durable coordinator Save As branches208, saves B209, then clean-loads A207 and restarts with isolated records/journals', async () => {
    const initial = migrated(PRE207); acceptedEvidence(initial)
    let store = new Store()
    const options = (target: Store) => ({ store: target, fatal: (error: unknown) => { throw error },
      campaigns: { durable: true, regime: 'endowed' as const },
      createFreshSession: (limits: BridgeRuntimeCheckpointLimits) => new BridgeSession(initial, undefined, null, { limits }) })
    let runtime = await createBridgeRuntimeCoordinator(options(store))
    try {
      expect((await runtime.campaign(await request(runtime, 'saveAs', { label: 'A207' }))).accepted).toBe(true)
      const a = library(store).records.find(row => row.label === 'A207')!; assert.ok(a)
      const a207 = a.checkpointJson
      expect(storedState(a207).market.tick).toBe(207)
      await runtimeAdvance(runtime, store)
      choices(storedState(library(store).workingCheckpointJson), 208)
      const saveAs = await request(runtime, 'saveAs', { label: 'B208' }), reply = await runtime.campaign(saveAs)
      expect(reply.accepted).toBe(true)
      const b = library(store).records.find(row => row.label === 'B208')!; assert.ok(b)
      const b208 = b.checkpointJson, b208Decoded = storedCheckpoint(b208)
      expect(b.id).not.toBe(a.id); expect(b208Decoded.checkpoint.sessionId).not.toBe(saveAs.sessionId)
      choices(storedState(b208), 208)
      expect(b208Decoded.checkpoint.currentSaveJson).toBe(b208Decoded.checkpoint.savedSaveJson)
      const writes = store.writes, beforeDuplicate = store.contents
      expect(await runtime.campaign(saveAs)).toEqual(reply)
      expect(store.writes).toBe(writes); expect(store.contents).toBe(beforeDuplicate)
      expect(library(store).records).toHaveLength(2)
      expect(library(store).records.find(row => row.id === a.id)!.checkpointJson).toBe(a207)
      await runtimeAdvance(runtime, store)
      expect(storedState(library(store).workingCheckpointJson).market.tick).toBe(209)
      const snapshot = await runtime.read(session => session.snapshot())
      const save = await runtime.dispatch('save', { protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID,
        sessionId: snapshot.sessionId, expectedStateRevision: snapshot.stateRevision, commandId: randomUUID() })
      expect(save.response.accepted).toBe(true); expect((await runtime.campaignLibrary())!.dirty).toBe(false)
      const b209 = library(store).records.find(row => row.id === b.id)!.checkpointJson
      expect(storedState(b209).market.tick).toBe(209); expect(b209).not.toBe(b208)
      const b209Decoded = storedCheckpoint(b209)
      expect(b209Decoded.checkpoint.savedSaveJson).toBe(b209Decoded.checkpoint.currentSaveJson)
      const loadA = await request(runtime, 'load', { campaignId: a.id })
      expect(loadA.unsavedDisposition).toBe('requireClean')
      expect((await runtime.campaign(loadA)).accepted).toBe(true)
      const afterLoad = library(store)
      expect(afterLoad.activeCampaignId).toBe(a.id)
      expect(storedState(afterLoad.workingCheckpointJson).market.tick).toBe(207)
      expect(afterLoad.records.find(row => row.id === b.id)!.checkpointJson).toBe(b209)
      const durable = store.contents!, priorStore = store
      await runtime.close(); expect(priorStore.closed).toBe(true)
      store = new Store(durable); runtime = await createBridgeRuntimeCoordinator(options(store))
      const restarted = library(store)
      expect(restarted.activeCampaignId).toBe(a.id); expect(restarted.records).toHaveLength(2)
      expect(restarted.records.find(row => row.id === a.id)!.checkpointJson).toBe(a207)
      expect(restarted.records.find(row => row.id === b.id)!.checkpointJson).toBe(b209)
      const active = storedCheckpoint(restarted.workingCheckpointJson)
      expect(storedState(restarted.workingCheckpointJson).market.tick).toBe(207)
      expect(active.checkpoint.sessionId).not.toBe(b209Decoded.checkpoint.sessionId)
      expect(active.checkpoint.journal.some(row => b209Decoded.checkpoint.journal.some(other => other.commandId === row.commandId))).toBe(false)
      assert.ok(active.savedSave)
      expect(active.savedSave.state.market.tick).toBe(207)
    } finally { await runtime.close() }
  })
})
