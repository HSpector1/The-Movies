// 1170-A/C and actual1173: three independent Bridge requirements, parent execution only.
// No simulation-helper import. One pinned45→52 route + one52→54 coordinator branch.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { afterAll, describe, expect, it, vi } from 'vitest'
import { BridgeSession } from '../bridge/session.ts'
import { PROJECTION_VERSION, PROTOCOL_VERSION, SCHEMA_ID, validateCampaign, validateCommand,
  validateControl, validateQuote } from '../bridge/protocol.ts'
import { BRIDGE_SCHEMA, type CampaignRequest } from '../bridge/schema/bridge-schema.ts'
import { canonicalJson } from '../bridge/schema/canonical.ts'
import { parseWireValue } from '../bridge/schema/runtime.ts'
import { marketCaseProjection, peopleProjection } from '../bridge/people.ts'
import { promiseHistoryFor } from '../bridge/promises.ts'
import { promiseAttentionRows } from '../bridge/trust.ts'
import { decodeBridgeRuntimeCheckpoint, encodeBridgeRuntimeCheckpoint, loadBridgeRuntimeCheckpoint,
  DEFAULT_BRIDGE_RUNTIME_CHECKPOINT_LIMITS, SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS,
  type BridgeRuntimeCheckpointLimits } from '../bridge/runtime-checkpoint.ts'
import { createBridgeRuntimeCoordinator, type BridgeRuntimeCoordinator } from '../bridge/runtime/runtime-coordinator.ts'
import { decodeCampaignStorage } from '../bridge/runtime/campaign-storage-codec.ts'
import type { BridgeCheckpointStore } from '../bridge/runtime/checkpoint-store.ts'
import type { CampaignLibrary } from '../bridge/runtime/campaign-library.ts'
import { caseDisclosure } from '../src/core/talentMarket.js'
import { activeContract } from '../src/core/employment.js'
import { exportSave, importSave, makeSave, migrateToLive, stableStringify,
  validateSaveV38, validateSaveV39 } from '../src/core/save.js'
import type { GameState, ProfessionalPromise } from '../src/core/types.js'

const TIMEOUT = 60_000
const E = '../docs/engineering/playability-launch-review/evidence/p14b4-20260919/'
const CAPTURE = E + '1171-p3-current45-capture/'
const OLD = './fixtures/p14/genuine-v38-pre-p3/'
const OLD_SCHEMA = 'sha256:d59e144e4077f669804ca87dd6184ef23bd44c9d93e44eb795f2b66350926a4d'
const ACTOR = 'authored-0006', DIRECTOR = 'authored-0007'
const clone = <T>(value: T): T => structuredClone(value)
const sha = (value: string | Uint8Array): string => createHash('sha256').update(value).digest('hex')
const bytes = (state: GameState): string => exportSave(makeSave(state))
function full(state: GameState): string {
  const before = stableStringify(state), save = makeSave(state)
  expect(save.saveVersion).toBe(39); expect(validateSaveV39(save)).toBe(save)
  const raw = exportSave(save)
  expect(exportSave(importSave(raw))).toBe(raw)
  expect(stableStringify(state)).toBe(before)
  return raw
}
function pinned(relative: string, gzipHash: string, rawHash: string): string {
  const gzip = readFileSync(new URL(relative, import.meta.url))
  expect(sha(gzip)).toBe(gzipHash)
  const raw = gunzipSync(gzip, { maxOutputLength: 16 * 1024 * 1024 }).toString('utf8')
  expect(sha(raw)).toBe(rawHash); return raw
}
const OLD_PINS = {
  'genuine-v38-p3-migrated-week207.json.gz': ['5d9e980e616b4b51502a24c160ca8ac89d863b22710ed5fdf2b19c8ec7cf4119', '248070431a492773e1887946bffa7bdaf6be8cbc5fba8694a778df32b7b2c1a1'],
  'genuine-v38-p3-natural-week208.json.gz': ['a7418eb0f90fa2d10ae65e78e3c3b9e75ec19346970c677c1cfdeefce42b2960', 'ebb00ca54328ef3340d959d830045d28c73dc493b8f069220256183e718fc4bb'],
  'genuine-v38-p3-before-waiver-week104.json.gz': ['077eec0343307983266868aa8bb242375874f7738cbe06c94e5787baa7dc098e', '5defd3aeffea645c670beccfe5ca0edd3d75cde7ddec5ef26406ff7639e39648'],
  'genuine-v38-p3-after-waiver-week104.json.gz': ['129b8d5d6993d97f9b5aa5929b2ab4a607c506c58b942cf7c4a38133fa113181', 'ac2c9ef66c0bc7cd43448cde7d0c9aabc6474730e750d8ed72becb862c08ce95'],
  'genuine-v38-p3-kept-broken-week61.json.gz': ['803ed4415cc6cc1b34749a595f3b52a2d5fd0376e965c15defc06be6022d44fc', 'a689ee51581ebbf6cf5534e4fb961b27d90b5a5204f279da2d279e15af91ead0'],
  'genuine-v38-p3-bound-p2-lead-week52.json.gz': ['7872b26db5909f787d7c58ab37600bbd4499eb0f54f646cb480d1655afeab922', 'b79730a445d85155ef54f9497cd851d77d23388dfeeb9686f6e8399f5984af25'],
  'runtime53-current208-saved207.json.gz': ['49aeafba1c66a16eb3a4c23eb8b57dd5af186d127f27ae5fe53b725ee8a7c175', '968c211a79c2497646e4ef00dd705aebe90455d00af997e767fc107334233f3b'],
  'runtime53-waiver-current104-saved104.json.gz': ['7ace654b880e768ddb75da5c5e34cbc56443ee5ad513f2b38cc8f94c73ec02a5', '943de3c02b7218a18c4d0c08862d2cd91f87c3af23db7d712e976118df950877'],
} as const
const rawCache = new Map<string, string>()
function oldRaw(name: keyof typeof OLD_PINS): string {
  const cached = rawCache.get(name); if (cached !== undefined) return cached
  expect(sha(readFileSync(new URL(OLD + 'MANIFEST.json', import.meta.url))))
    .toBe('87db7cc4885f5e9a9464d8e2c3e586be84078550aebf1155a672fa2782a2c987')
  const [gzipHash, rawHash] = OLD_PINS[name], raw = pinned(OLD + name, gzipHash, rawHash)
  rawCache.set(name, raw); return raw
}
type Cached = { ok: true; value: unknown } | { ok: false; error: unknown }
const phases = new Map<string, Cached>()
function memo<T>(name: string, build: () => T): T {
  const old = phases.get(name)
  if (old) { if (!old.ok) throw old.error; return clone(old.value) as T }
  try { const value = build(); phases.set(name, { ok: true, value }); return clone(value) }
  catch (error) { phases.set(name, { ok: false, error }); throw error }
}
function current45(): GameState {
  return memo('captured45', () => {
    const manifest = readFileSync(new URL(CAPTURE + 'MANIFEST.json', import.meta.url))
    expect(manifest.byteLength).toBe(11550)
    expect(sha(manifest)).toBe('a261fc3177527d05d5a8daf624de7af015df8c9a8fedd3e11b37fe1597a2f4b6')
    expect(JSON.parse(manifest.toString('utf8'))).toMatchObject({ status: 'COMPLETE',
      actualExecutionHead: '272401eb36dc49563d306de39503e306b6c9dc2d', sourceGuardPassed: true,
      counts: { player: { actualTicks: 45 }, rival: { rivalCalls: 0 } } })
    const raw = pinned(CAPTURE + 'genuine-v39-p3-market-week45.json.gz',
      '12799a849b0b4aff49cd9707ea8c1b87c64b4e787ff261b2e9cf4b109a953117',
      'e7401f2578a7ad151383ca905df4253c2bbd82d6823c406c28b7e76aa809c5af')
    const parsed: unknown = JSON.parse(raw), save = validateSaveV39(parsed)
    expect(save).toBe(parsed); expect(exportSave(save)).toBe(raw)
    expect(save.state.market.tick).toBe(45)
    expect(save.state.scriptDevelopment.projects.map(p => [p.id, p.status, p.productionId]))
      .toEqual([['script-0000', 'ready', null], ['script-0001', 'ready', null]])
    expect(save.state.talent.find(row => row.id === ACTOR)?.role).toBe('actor')
    expect(save.state.talent.find(row => row.id === DIRECTOR)?.role).toBe('director')
    full(save.state); return save.state
  })
}
const calls = { reserved: 0, advanceInvocations: 0, completed: 0, session: 0, coordinator: 0, duplicateInvocations: 0 }
function reserve(kind: 'session' | 'coordinator'): void {
  assert.ok(calls.reserved < 12, 'hard shared Bridge12 cap, including every branch')
  if (kind === 'session') assert.ok(calls.session < 7, 'single captured45→52 path')
  else assert.ok(calls.coordinator < 2, 'single coordinator52→54 branch')
  calls.reserved++; calls[kind]++
}
const viewer = (state: GameState): string => { assert.ok(state.hollywood); return state.hollywood.playerStudioId }
const WIRE = { family: 'DIRECTING_COUNT', count: 2, windowStartWeek: 52, dueWeekExclusive: 112 } as const
const proposal = () => ({ verb: 'propose', talentId: ACTOR, termWeeks: 104, premiumTier: 1.25, promise: { ...WIRE } })
function control(session: BridgeSession, commandId: string) {
  return { protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId: session.sessionId,
    expectedStateRevision: session.stateRevision, commandId }
}
function authority(session: BridgeSession) {
  return { raw: bytes(session.gameState), rng: clone(session.gameState.rngState), revision: session.stateRevision,
    checkpoint: encodeBridgeRuntimeCheckpoint(session.exportRuntimeCheckpoint()) }
}
function quoteMarket(session: BridgeSession, draft: unknown, commandId: string) {
  const before = authority(session), request = { ...control(session, commandId), type: 'quoteMarketProposal', draft }
  const parsed = validateQuote(request)
  expect(parsed.ok).toBe(true); if (!parsed.ok) throw new Error(parsed.message)
  const response = session.quote(parsed.quote)
  expect(response.accepted).toBe(true); if (!response.accepted) throw new Error(response.message)
  expect(parseWireValue(BRIDGE_SCHEMA.$defs.StudioBridgeQuoteResponse, response)).toEqual(response)
  assert.ok(response.quote.kind === 'marketProposalAction')
  expect(authority(session)).toEqual(before)
  return { request, response, quote: response.quote }
}
function submit(session: BridgeSession, intentId: string, commandId: string, beforeDispatch: () => void = () => {}) {
  const parsed = validateCommand({ ...control(session, commandId), type: 'submitIntent', payload: { intentId } })
  expect(parsed.ok).toBe(true); if (!parsed.ok) throw new Error(parsed.message)
  beforeDispatch()
  const result = session.dispatchWithRuntimeCheckpoint('command', parsed.command)
  expect(result.response.accepted).toBe(true)
  if (!result.response.accepted) throw new Error(result.response.message)
  expect(parseWireValue(BRIDGE_SCHEMA.$defs.StudioBridgeAcceptedCommandResponse, result.response)).toEqual(result.response)
  assert.ok(result.prepared, 'actual prepared checkpoint accompanies the committed command')
  expect(result.prepared.checkpoint).toEqual(session.exportRuntimeCheckpoint())
  expect(result.prepared.checkpoint.currentSaveJson).toBe(full(session.gameState))
  return { request: parsed.command, response: result.response, prepared: result.prepared }
}
function root(state: GameState, id: string): ProfessionalPromise {
  const found = state.promises.find(row => row.promiseId === id); assert.ok(found); return found
}
function resume(raw: string): BridgeSession {
  return BridgeSession.fromRuntimeCheckpoint(decodeBridgeRuntimeCheckpoint(raw))
}
function attached45() {
  return memo('actualAttached45', () => {
    const session = new BridgeSession(current45(), '1174-attach45')
    const beforeRoots = clone(session.gameState.promises)
    const q = quoteMarket(session, proposal(), '1174-proposal-quote')
    expect(q.quote).toMatchObject({ ok: true, promise: { ok: true, classification: 'REASONABLY_ACHIEVABLE' } })
    const committed = submit(session, q.quote.intentId, '1174-proposal-commit')
    const own = session.gameState.talentMarket.proposals.filter(row => row.talentId === ACTOR
      && row.issuerStudioId === viewer(session.gameState))
    expect(own).toHaveLength(1); expect(own[0]!.promises).toHaveLength(1)
    const promiseId = own[0]!.promises[0]!, actual = root(session.gameState, promiseId)
    expect(actual).toMatchObject({ family: 'DIRECTING_COUNT', predicate: { kind: 'directorCount', count: 2 },
      version: 6, contractId: null, progress: 0, outcome: null, windowStartWeek: 52, dueWeekExclusive: 112,
      feasibilityReceipt: { classification: 'REASONABLY_ACHIEVABLE', rulesVersion: 6 } })
    expect(session.gameState.promises.slice(0, beforeRoots.length)).toEqual(beforeRoots)
    const beforeDuplicate = authority(session)
    calls.duplicateInvocations++
    const duplicate = session.dispatchWithRuntimeCheckpoint('command', committed.request)
    expect(canonicalJson(duplicate.response)).toBe(canonicalJson(committed.response))
    expect(duplicate.prepared).toBeNull(); expect(authority(session)).toEqual(beforeDuplicate)
    return { promiseId, state: clone(session.gameState), checkpoint: beforeDuplicate.checkpoint }
  })
}
function advance(session: BridgeSession, id: string): void {
  const snapshot = session.snapshot(), before = session.gameState.market.tick
  expect(parseWireValue(BRIDGE_SCHEMA.$defs.StudioBridgeSnapshotResponse, snapshot)).toEqual(snapshot)
  const intent = snapshot.availableIntents.find(row => row.kind === 'advanceWeek'); assert.ok(intent)
  submit(session, intent.intentId, id, () => { reserve('session'); calls.advanceInvocations++ })
  expect(session.gameState.market.tick).toBe(before + 1); calls.completed++
}
function bound52() {
  return memo('actualBound52', () => {
    const initial = attached45(), session = resume(initial.checkpoint)
    expect(session.gameState.market.tick).toBe(45)
    for (let week = 46; week <= 52; week++) advance(session, `1174-advance-${week}`)
    const actual = root(session.gameState, initial.promiseId)
    assert.ok(actual.contractId, 'actual public proposal must win and bind at52')
    expect(actual).toMatchObject({ predicate: { kind: 'directorCount', count: 2 }, progress: 0, outcome: null })
    const contract = activeContract(session.gameState, ACTOR); assert.ok(contract)
    expect(contract).toMatchObject({ startWeek: 52, endWeekExclusive: 156, termWeeks: 104 })
    expect(session.gameState.hollywood!.employment.find(row => row.contractId === actual.contractId))
      .toMatchObject({ studioId: viewer(session.gameState), terms: contract })
    expect(session.gameState.talentMarket.receipts.filter(row => row.kind === 'settled' && row.week === 52
      && row.talentId === ACTOR && row.studioId === viewer(session.gameState))).toHaveLength(1)
    expect(session.gameState.ledger.filter(row => row.kind === 'signingBonus' && row.week === 52 && row.talentId === ACTOR))
      .toEqual([expect.objectContaining({ amount: -contract.signingBonus })])
    full(session.gameState)
    return { promiseId: initial.promiseId, state: clone(session.gameState), checkpoint: authority(session).checkpoint }
  })
}
afterAll(() => console.info('1174-P3-BRIDGE-COUNTERS ' + JSON.stringify({
  reservedAdvanceCommands: calls.reserved, verifiedOneWeekAdvances: calls.completed,
  actualAdvanceDispatchInvocations: calls.advanceInvocations,
  sessionAdvanceAttempts: calls.session, coordinatorAdvanceAttempts: calls.coordinator,
  duplicateInvocations: calls.duplicateInvocations, cap: 12,
  phases: [...phases].map(([name, result]) => ({ name, complete: result.ok })) })))

// Narrow future-field inspection: no future module, forged authority or broad DTO cast.
function role(value: unknown): unknown {
  assert.ok(value !== null && typeof value === 'object' && !Array.isArray(value))
  return (value as { qualifyingRole?: unknown }).qualifyingRole
}
function privateAbsent(value: unknown, promises: readonly ProfessionalPromise[]): void {
  const text = JSON.stringify(value)
  for (const key of ['predicate', 'inputsDigest', 'rulesVersion', 'feasibilityReceipt', 'evidenceRefs']) {
    expect(text).not.toContain(`"${key}"`)
  }
  for (const promise of promises) expect(text).not.toContain(promise.feasibilityReceipt.inputsDigest)
}
function dueControl(state: GameState, promise: ProfessionalPromise, expected: 'director' | 'cast') {
  full(state)
  const before = bytes(state), queryWeek = promise.dueWeekExclusive - 8
  // Explicit query-time presentation only. The admitted state remains at its real week.
  const rows = promiseAttentionRows(state, promise.issuerStudioId, queryWeek, promise.beneficiaryPersonId)
  const reminders = rows.filter(row => row.cause === 'promiseDue')
  expect(reminders).toHaveLength(1)
  expect(reminders[0]!.reason).toMatch(expected === 'director' ? /directing has not begun/i : /filming has not begun/i)
  if (expected === 'director') expect(reminders[0]!.reason).not.toMatch(/filming has not begun/i)
  const other = state.hollywood!.identities.find(row => row.studioId !== promise.issuerStudioId && row.enteredWeek !== null)
  assert.ok(other)
  expect(promiseAttentionRows(state, other.studioId, queryWeek, promise.beneficiaryPersonId)).toEqual([])
  expect(bytes(state)).toBe(before); privateAbsent(rows, [promise])
  return rows
}
function legacyClassless(open: boolean, version: 4 | 6) {
  const raw = oldRaw(open ? 'genuine-v38-p3-bound-p2-lead-week52.json.gz' : 'genuine-v38-p3-kept-broken-week61.json.gz')
  const old = validateSaveV38(JSON.parse(raw)); expect(exportSave(old)).toBe(raw)
  const target = old.state.promises.find(row => row.issuerStudioId === old.state.hollywood!.playerStudioId
    && row.contractId !== null && (open ? row.outcome === null && row.progress === 0
      : row.family === 'APPEARANCE_COUNT' && row.outcome === 'SATISFIED'))
  assert.ok(target, 'actual retained old bound row before the labelled compatibility construction')
  // Synthetic old-reader compatibility only; not a naturally authored historical P3.
  const variant = clone(old), replacement = { ...target, family: 'DIRECTING_COUNT' as const,
    predicate: { count: target.predicate.count }, version,
    feasibilityReceipt: { ...target.feasibilityReceipt, rulesVersion: version } }
  variant.state.promises = variant.state.promises.map(row => row.promiseId === target.promiseId ? replacement : row)
  expect(validateSaveV38(variant)).toBe(variant)
  const current = migrateToLive(variant); expect(current.saveVersion).toBe(39)
  expect(current.state.promises.find(row => row.promiseId === target.promiseId)).toEqual(replacement)
  full(current.state)
  return { state: current.state, promise: root(current.state, target.promiseId) }
}
function waiver52() {
  return memo('actualWaived52', () => {
    const bound = bound52(), session = resume(bound.checkpoint), original = root(session.gameState, bound.promiseId)
    expect(original).toMatchObject({ progress: 0, outcome: null })
    const before = authority(session), beforeRoots = clone(session.gameState.promises)
    const request = { ...control(session, '1174-waiver-quote'), type: 'quoteWaivePromise', draft: {
      promiseId: bound.promiseId, substitute: { ...WIRE, windowStartWeek: 53 },
    } }
    const parsed = validateQuote(request)
    expect(parsed.ok).toBe(true); if (!parsed.ok) throw new Error(parsed.message)
    const response = session.quote(parsed.quote)
    expect(response.accepted).toBe(true); if (!response.accepted) throw new Error(response.message)
    expect(parseWireValue(BRIDGE_SCHEMA.$defs.StudioBridgeQuoteResponse, response)).toEqual(response)
    assert.ok(response.quote.kind === 'waivePromise')
    expect(response.quote).toMatchObject({ ok: true, refusalReason: null, promiseId: bound.promiseId,
      family: 'DIRECTING_COUNT', count: 2, seatClass: null, windowStartWeek: 53, dueWeekExclusive: 112 })
    expect(role(response.quote)).toBe('director')
    expect(response.quote.commitLabel + ' ' + response.quote.consequence).toMatch(/direct/i)
    expect(authority(session)).toEqual(before)
    const committed = submit(session, response.quote.intentId, '1174-waiver-commit')
    const old = root(session.gameState, bound.promiseId)
    expect(old).toMatchObject({ outcome: 'WAIVED', outcomeWeek: 52, progress: 0 })
    assert.ok(old.supersededByPromiseId)
    const successor = root(session.gameState, old.supersededByPromiseId)
    expect(successor).toMatchObject({ family: 'DIRECTING_COUNT', predicate: { kind: 'directorCount', count: 2 },
      contractId: original.contractId, issuerStudioId: original.issuerStudioId, beneficiaryPersonId: ACTOR,
      progress: 0, outcome: null, windowStartWeek: 53, dueWeekExclusive: 112,
      feasibilityReceipt: { classification: 'REASONABLY_ACHIEVABLE', rulesVersion: 6 } })
    expect(session.gameState.promises.filter(row => row.promiseId !== old.promiseId && row.promiseId !== successor.promiseId))
      .toEqual(beforeRoots.filter(row => row.promiseId !== old.promiseId))
    expect(session.gameState.market.tick).toBe(52)
    const beforeDuplicate = authority(session); calls.duplicateInvocations++
    const duplicate = session.dispatchWithRuntimeCheckpoint('command', committed.request)
    expect(canonicalJson(duplicate.response)).toBe(canonicalJson(committed.response))
    expect(duplicate.prepared).toBeNull(); expect(authority(session)).toEqual(beforeDuplicate)
    privateAbsent(response.quote, [old, successor])
    return { state: clone(session.gameState), oldId: old.promiseId, successorId: successor.promiseId,
      quote: response.quote, checkpoint: beforeDuplicate.checkpoint }
  })
}

type HistoricalRuntime = { format: string; checkpointVersion: number; protocolVersion: number; schemaId: string;
  sessionId: string; stateRevision: number; currentSaveJson: string; savedSaveJson: string;
  currentStateDigest: string; savedStateDigest: string; journalDigest: string;
  journal: { route: string; commandId: string; requestJson: string; responseJson: string }[] }
function prior53(name: 'natural' | 'waiver') {
  const raw = oldRaw(name === 'natural' ? 'runtime53-current208-saved207.json.gz' : 'runtime53-waiver-current104-saved104.json.gz')
  const value = JSON.parse(raw) as HistoricalRuntime
  expect(canonicalJson(value) + '\n').toBe(raw)
  expect(value).toMatchObject({ protocolVersion: 4, schemaId: OLD_SCHEMA, stateRevision: 1 })
  expect(value.journal).toHaveLength(2)
  expect(value.journal.map(row => row.route)).toEqual(['save', 'command'])
  expect(value.journal.every(row => JSON.parse(row.responseJson).accepted === true)).toBe(true)
  expect(value.currentSaveJson).toBe(oldRaw(name === 'natural' ? 'genuine-v38-p3-natural-week208.json.gz' : 'genuine-v38-p3-after-waiver-week104.json.gz'))
  expect(value.savedSaveJson).toBe(oldRaw(name === 'natural' ? 'genuine-v38-p3-migrated-week207.json.gz' : 'genuine-v38-p3-before-waiver-week104.json.gz'))
  for (const slot of ['currentSaveJson', 'savedSaveJson'] as const) {
    const old = validateSaveV38(JSON.parse(value[slot]))
    expect(exportSave(old)).toBe(value[slot])
    expect(sha(value[slot])).toBe(slot === 'currentSaveJson' ? value.currentStateDigest : value.savedStateDigest)
  }
  expect(value.currentSaveJson).not.toBe(value.savedSaveJson)
  expect(sha(canonicalJson(value.journal))).toBe(value.journalDigest)
  return { raw, value }
}
function qualifyPrior53(): void {
  for (const name of ['natural', 'waiver'] as const) {
    const old = prior53(name), before = canonicalJson(old.value)
    const factory = vi.fn(() => `1174-prior53-${name}`)
    const loaded = loadBridgeRuntimeCheckpoint(old.raw, undefined, factory)
    expect(loaded.migratedFromProtocolVersion).toBe(4); expect(factory).toHaveBeenCalledTimes(1)
    expect(PROJECTION_VERSION).toBe(54); expect(PROTOCOL_VERSION).toBe(4)
    expect([...SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS].filter(([id]) => id === OLD_SCHEMA)).toEqual([[OLD_SCHEMA, 'projection-v53']])
    expect(SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS.has(SCHEMA_ID)).toBe(false)
    const current = loaded.hydrated.checkpoint
    expect(current).toMatchObject({ schemaId: SCHEMA_ID, sessionId: `1174-prior53-${name}`,
      stateRevision: 0, journal: [], journalDigest: sha('[]') })
    expect(current.sessionId).not.toBe(old.value.sessionId)
    for (const slot of ['currentSaveJson', 'savedSaveJson'] as const) {
      assert.ok(current[slot])
      const previous = validateSaveV38(JSON.parse(old.value[slot]))
      const now = validateSaveV39(JSON.parse(current[slot]!))
      expect(now.state).toEqual(previous.state)
      expect(current[slot]).toBe(exportSave(migrateToLive(previous)))
      full(now.state)
    }
    expect(current.currentSaveJson).not.toBe(current.savedSaveJson)
    const session = BridgeSession.fromRuntimeCheckpoint(loaded.hydrated), authorityBefore = authority(session)
    const oldCommand = JSON.parse(old.value.journal[1]!.requestJson)
    expect(session.command(oldCommand).accepted).toBe(false)
    // A refused foreign command may enter the journal; authority state/RNG/revision must remain exact.
    expect(bytes(session.gameState)).toBe(authorityBefore.raw)
    expect(session.gameState.rngState).toEqual(authorityBefore.rng)
    expect(session.stateRevision).toBe(authorityBefore.revision)
    const currentRaw = encodeBridgeRuntimeCheckpoint(current)
    const again = vi.fn(() => { throw new Error('current54 must not migrate again') })
    const reloaded = loadBridgeRuntimeCheckpoint(currentRaw, undefined, again)
    expect(reloaded.migratedFromProtocolVersion).toBeNull(); expect(again).not.toHaveBeenCalled()
    expect(encodeBridgeRuntimeCheckpoint(reloaded.hydrated.checkpoint)).toBe(currentRaw)
    for (const slot of ['currentSaveJson', 'savedSaveJson'] as const) {
      const malformed = clone(old.value), inner = JSON.parse(malformed[slot])
      const person = inner.state.talent[0]; assert.ok(person)
      person.age += 1 // Detached malformed inner slot, never admitted or continued.
      malformed[slot] = canonicalJson(inner)
      if (slot === 'currentSaveJson') malformed.currentStateDigest = sha(malformed[slot])
      else malformed.savedStateDigest = sha(malformed[slot])
      const noSession = vi.fn(() => '1174-invalid-inner')
      expect(() => loadBridgeRuntimeCheckpoint(canonicalJson(malformed) + '\n', undefined, noSession)).toThrow(/age|provenance/i)
      expect(noSession).not.toHaveBeenCalled()
    }
    expect(canonicalJson(old.value)).toBe(before); expect(prior53(name).raw).toBe(old.raw)
  }
  console.info('1174-P3-PRIOR53 ' + JSON.stringify({ slots: ['208/207', '104-after/104-before'], ticks: 0, qualified: true }))
}

class Store implements BridgeCheckpointStore {
  checkpointPath = '/synthetic/1174-p3-library.json'
  writes = 0; closed = false
  constructor(public contents: string | null = null) {}
  async read() { return this.contents }
  async writeAtomic(text: string) { this.writes++; this.contents = text }
  async close() { this.closed = true }
}
const libraryCache = new Map<string, CampaignLibrary>()
const checkpointCache = new Map<string, ReturnType<typeof decodeBridgeRuntimeCheckpoint>>()
function library(store: Store): CampaignLibrary {
  assert.ok(store.contents)
  const old = libraryCache.get(store.contents); if (old) return old
  const decoded = decodeCampaignStorage(JSON.parse(store.contents), DEFAULT_BRIDGE_RUNTIME_CHECKPOINT_LIMITS.maxCheckpointBytes, 32)
  assert.ok(decoded !== null && typeof decoded === 'object' && 'format' in decoded && decoded.format === 'project-studio-campaign-library')
  const value = decoded as CampaignLibrary; libraryCache.set(store.contents, value); return value
}
function stored(raw: string) {
  const old = checkpointCache.get(raw); if (old) return old
  const value = decodeBridgeRuntimeCheckpoint(raw)
  full(value.currentSave.state); if (value.savedSave) full(value.savedSave.state)
  checkpointCache.set(raw, value); return value
}
let sequence = 0
const commandId = (label: string): string => `1174-${label}-${sequence++}`
async function campaignRequest(runtime: BridgeRuntimeCoordinator, operation: CampaignRequest['operation'], extra: Partial<CampaignRequest> = {}) {
  const current = await runtime.campaignLibrary(); assert.ok(current)
  const request = { protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, type: 'campaign', commandId: commandId(operation),
    sessionId: current.sessionId, expectedStateRevision: current.stateRevision, expectedCatalogueRevision: current.catalogueRevision,
    expectedActiveCampaignId: current.activeCampaignId, operation, campaignId: null, label: null, overwriteCampaignId: null,
    confirmDestructive: false, unsavedDisposition: 'requireClean', ...extra }
  const parsed = validateCampaign(request)
  expect(parsed.ok).toBe(true); if (!parsed.ok) throw new Error(parsed.message)
  return parsed.request
}
async function runtimeAdvance(runtime: BridgeRuntimeCoordinator, store: Store): Promise<void> {
  const snapshot = await runtime.read(session => session.snapshot())
  const before = stored(library(store).workingCheckpointJson).currentSave.state.market.tick
  const option = snapshot.availableIntents.find(row => row.kind === 'advanceWeek'); assert.ok(option)
  const parsed = validateCommand({ protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID,
    sessionId: snapshot.sessionId, expectedStateRevision: snapshot.stateRevision, commandId: commandId('runtime-advance'),
    type: 'submitIntent', payload: { intentId: option.intentId } })
  expect(parsed.ok).toBe(true); if (!parsed.ok) throw new Error(parsed.message)
  reserve('coordinator')
  calls.advanceInvocations++
  const result = await runtime.dispatch('command', parsed.command)
  expect(result.response.accepted).toBe(true)
  expect(stored(library(store).workingCheckpointJson).currentSave.state.market.tick).toBe(before + 1)
  calls.completed++
}
async function runtimeSave(runtime: BridgeRuntimeCoordinator): Promise<void> {
  const snapshot = await runtime.read(session => session.snapshot())
  const parsed = validateControl({ protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID,
    sessionId: snapshot.sessionId, expectedStateRevision: snapshot.stateRevision, commandId: commandId('save') })
  expect(parsed.ok).toBe(true); if (!parsed.ok) throw new Error(parsed.message)
  expect((await runtime.dispatch('save', parsed.control)).response.accepted).toBe(true)
}

describe('P3 public Bridge authority, truthful terms and durable runtime', () => {
  it('D15 commits genuine public directing commands with closed private authority', () => {
    const session = new BridgeSession(current45(), '1174-closed-wire')
    const initial = authority(session)
    const valid = { ...control(session, '1174-closed-positive'), type: 'quoteMarketProposal', draft: proposal() }
    expect(validateQuote(valid)).toMatchObject({ ok: true })
    const badDrafts: unknown[] = [
      { ...proposal(), issuerStudioId: viewer(session.gameState) },
      ...[{ kind: 'directorCount' }, { predicate: { kind: 'directorCount', count: 2 } },
        { seatClass: 'lead' }, { privateInputs: [] }].map(extra => ({ ...proposal(), promise: { ...WIRE, ...extra } })),
      { ...proposal(), promise: { ...WIRE, family: 'LEAD_OR_SIGNIFICANT_ROLE_COUNT' } },
      { ...proposal(), promise: { ...WIRE, family: 'APPEARANCE_COUNT', kind: 'directorCount' } },
    ]
    for (const [index, draft] of badDrafts.entries()) {
      const request = { ...control(session, `1174-invalid-wire-${index}`), type: 'quoteMarketProposal', draft }
      const beforeRequest = clone(request)
      expect(validateQuote(request)).toMatchObject({ ok: false, reasonCode: 'INVALID_COMMAND' })
      expect(request).toEqual(beforeRequest); expect(authority(session)).toEqual(initial)
    }

    const attached = attached45(), bound = bound52()
    expect(root(attached.state, attached.promiseId).contractId).toBeNull()
    expect(root(bound.state, bound.promiseId).contractId).not.toBeNull()
    expect(calls.session).toBe(7)

    // Real zero-tick board movement. Pending-clear and material-digest invalidation
    // are surface-equivalent; this control does not claim to isolate their internals.
    const stale = new BridgeSession(current45(), '1174-stale-material')
    const old = quoteMarket(stale, proposal(), '1174-stale-p3')
    expect(old.quote.ok).toBe(true)
    const different = quoteMarket(stale, { verb: 'propose', talentId: DIRECTOR,
      termWeeks: 104, premiumTier: 1.25 }, '1174-real-board-move')
    expect(different.quote.ok).toBe(true)
    const unchangedWeek = stale.gameState.market.tick
    submit(stale, different.quote.intentId, '1174-board-move-commit')
    expect(stale.gameState.market.tick).toBe(unchangedWeek)
    const beforeStale = authority(stale)
    const parsed = validateCommand({ ...control(stale, '1174-stale-commit'), type: 'submitIntent', payload: { intentId: old.quote.intentId } })
    expect(parsed.ok).toBe(true); if (!parsed.ok) throw new Error(parsed.message)
    const refused = stale.dispatchWithRuntimeCheckpoint('command', parsed.command)
    expect(refused.response).toMatchObject({ accepted: false, reasonCode: 'INTENT_NOT_AVAILABLE' })
    expect(bytes(stale.gameState)).toBe(beforeStale.raw)
    expect(stale.gameState.rngState).toEqual(beforeStale.rng); expect(stale.stateRevision).toBe(beforeStale.revision)
    // The existing command protocol journals its own refusal without replacing
    // any earlier entry or authoritative state; it cannot commit stale work.
    const previousJournal = JSON.parse(beforeStale.checkpoint).journal
    const afterJournal = stale.exportRuntimeCheckpoint().journal
    expect(afterJournal.slice(0, previousJournal.length)).toEqual(previousJournal)
    expect(afterJournal).toHaveLength(previousJournal.length + 1)
    expect(afterJournal.at(-1)).toMatchObject({ route: 'command', commandId: parsed.command.commandId,
      requestJson: canonicalJson(parsed.command), responseJson: canonicalJson(refused.response) })
    expect(stale.gameState.promises).toEqual(JSON.parse(beforeStale.raw).state.promises)
    full(stale.gameState)
    console.info('1174-P3-WIRE ' + JSON.stringify({ week: 52, promiseId: bound.promiseId,
      contractId: root(bound.state, bound.promiseId).contractId, advancingCommands: calls.session }))
  }, TIMEOUT)

  it('D16 discloses Director and legacy cast terms truthfully without private inputs', () => {
    const attached = attached45(), player = viewer(attached.state), actual = root(attached.state, attached.promiseId)
    const beforeReads = bytes(attached.state)
    const engine = caseDisclosure(attached.state, ACTOR, player, 45).proposals.find(row => row.issuerStudioId === player)
    assert.ok(engine && engine.promise !== 'UNKNOWN' && engine.promise !== null)
    expect(role(engine.promise)).toBe('director')
    expect(Object.keys(engine.promise).sort()).toEqual(['classification', 'count', 'dueWeekExclusive', 'family',
      'qualifyingRole', 'seatClass', 'windowStartWeek'].sort())
    const ownCase = marketCaseProjection(attached.state, ACTOR, player); assert.ok(ownCase)
    const own = ownCase.proposals.find(row => row.issuerStudioId === player); assert.ok(own)
    expect(own.promise).toEqual(engine.promise)
    expect(own.promise).toMatchObject({ family: 'DIRECTING_COUNT', count: 2, qualifyingRole: 'director',
      seatClass: null, windowStartWeek: 52, dueWeekExclusive: 112 })
    expect(parseWireValue(BRIDGE_SCHEMA.$defs.StudioMarketPromiseSnapshot, own.promise)).toEqual(own.promise)
    const rivalViewer = attached.state.hollywood!.identities.find(row => row.role === 'rival' && row.enteredWeek !== null)
    assert.ok(rivalViewer, 'actual other studio for the same retained player proposal')
    const otherCase = marketCaseProjection(attached.state, ACTOR, rivalViewer.studioId); assert.ok(otherCase)
    expect(otherCase.proposals.find(row => row.issuerStudioId === player)?.promise).toBe('UNKNOWN')
    expect(promiseHistoryFor(attached.state, ACTOR, rivalViewer.studioId)).toEqual([])
    expect(ownCase.promiseHistory).toEqual([]) // Unbound own draft is not bound history.
    const primaryDirectorCase = marketCaseProjection(attached.state, DIRECTOR, player); assert.ok(primaryDirectorCase)
    expect(primaryDirectorCase.preferences.preferredOpportunity).toBe('directingOpportunity')
    privateAbsent(own.promise, [actual]); expect(bytes(attached.state)).toBe(beforeReads)

    const bound = bound52(), boundRoot = root(bound.state, bound.promiseId), boundBefore = bytes(bound.state)
    const history = promiseHistoryFor(bound.state, ACTOR, player)
    const row = history.find(p => p.promiseId === bound.promiseId); assert.ok(row)
    expect(row).toMatchObject({ family: 'DIRECTING_COUNT', count: 2, qualifyingRole: 'director', seatClass: null,
      contractId: boundRoot.contractId, progress: 0, outcome: null, supersededByPromiseId: null })
    expect(Object.keys(row).sort()).toEqual(['promiseId', 'family', 'count', 'qualifyingRole', 'seatClass',
      'windowStartWeek', 'dueWeekExclusive', 'contractId', 'outcome', 'outcomeWeek', 'outcomeCause',
      'supersededByPromiseId', 'progress'].sort())
    expect(parseWireValue(BRIDGE_SCHEMA.$defs.StudioMarketPromiseHistoryRow, row)).toEqual(row)
    const profiles = peopleProjection(bound.state)
    expect(profiles.profiles.find(profile => profile.talentId === ACTOR)?.promises).toEqual(history)
    const snapshot = resume(bound.checkpoint).snapshot()
    expect(parseWireValue(BRIDGE_SCHEMA.$defs.StudioBridgeSnapshotResponse, snapshot)).toEqual(snapshot)
    expect(snapshot.snapshot.talent.profiles.find(profile => profile.talentId === ACTOR)?.promises).toEqual(history)
    expect(marketCaseProjection(bound.state, ACTOR, player)?.promiseHistory).toEqual(history)
    privateAbsent(history, [boundRoot])
    const reminders = dueControl(bound.state, boundRoot, 'director')
    expect(bound.state.market.tick).toBe(52); expect(boundRoot.dueWeekExclusive - 8).toBe(104)
    expect(bytes(bound.state)).toBe(boundBefore)

    const waived = waiver52(), waivedHistory = promiseHistoryFor(waived.state, ACTOR, player)
    expect(waivedHistory.find(p => p.promiseId === waived.oldId))
      .toMatchObject({ qualifyingRole: 'director', outcome: 'WAIVED', supersededByPromiseId: waived.successorId })
    expect(waivedHistory.find(p => p.promiseId === waived.successorId))
      .toMatchObject({ qualifyingRole: 'director', outcome: null, windowStartWeek: 53, progress: 0 })
    privateAbsent({ history: waivedHistory, quote: waived.quote, reminders }, waived.state.promises)

    // Two genuinely admitted sources, same opaque ID: no invented rival promise.
    const naturalOld = validateSaveV38(JSON.parse(oldRaw('genuine-v38-p3-natural-week208.json.gz')))
    const natural = migrateToLive(naturalOld).state; full(natural)
    const rivalPromise = natural.promises.find(p => p.issuerStudioId !== viewer(natural)); assert.ok(rivalPromise)
    const empty = current45(); expect(empty.promises.some(p => p.promiseId === rivalPromise.promiseId)).toBe(false)
    const rejections = [natural, empty].map((state, index) => {
      const session = new BridgeSession(state, `1174-hidden-${index}`), before = authority(session)
      const parsed = validateQuote({ ...control(session, '1174-hidden-quote'), type: 'quoteWaivePromise', draft: {
        promiseId: rivalPromise.promiseId, substitute: { ...WIRE, windowStartWeek: 53 },
      } })
      expect(parsed.ok).toBe(true); if (!parsed.ok) throw new Error(parsed.message)
      const response = session.quote(parsed.quote)
      expect(response.accepted).toBe(false); assert.ok(!response.accepted)
      expect(response.reasonCode).toBe('ENGINE_REJECTED')
      expect(bytes(session.gameState)).toBe(before.raw); expect(session.gameState.rngState).toEqual(before.rng)
      expect(session.stateRevision).toBe(before.revision)
      return { reasonCode: response.reasonCode, message: response.message }
    })
    expect(rejections[0]).toEqual(rejections[1])
    for (const version of [4, 6] as const) {
      for (const open of [false, true]) {
        const legacy = legacyClassless(open, version), before = bytes(legacy.state)
        const legacyRows = promiseHistoryFor(legacy.state, legacy.promise.beneficiaryPersonId, legacy.promise.issuerStudioId)
        const legacyRow = legacyRows.find(p => p.promiseId === legacy.promise.promiseId); assert.ok(legacyRow)
        expect(legacyRow).toMatchObject({ family: 'DIRECTING_COUNT', qualifyingRole: 'cast', seatClass: null })
        expect(parseWireValue(BRIDGE_SCHEMA.$defs.StudioMarketPromiseHistoryRow, legacyRow)).toEqual(legacyRow)
        if (open) dueControl(legacy.state, legacy.promise, 'cast')
        expect(bytes(legacy.state)).toBe(before)
      }
    }
    console.info('1174-P3-DISCLOSURE ' + JSON.stringify({ boundWeek: 52, reminderQueryWeek: 104,
      waiverWeek: 52, original: waived.oldId, successor: waived.successorId, extraTicks: 0 }))
  }, TIMEOUT)

  it('D17 migrates outgoing53 independently and isolates current54 campaigns', async () => {
    qualifyPrior53() // Independent zero-tick migration controls before any bound52 dependency.
    const bound = bound52(), initial = clone(bound.state); full(initial)
    let store = new Store(), freshFactories = 0
    const options = (target: Store) => ({ store: target, fatal: (error: unknown) => { throw error },
      campaigns: { durable: true, regime: 'endowed' as const },
      createFreshSession: (limits: BridgeRuntimeCheckpointLimits) => {
        freshFactories++; return new BridgeSession(clone(initial), undefined, null, { limits })
      } })
    let runtime = await createBridgeRuntimeCoordinator(options(store))
    const closedStores: Store[] = []
    try {
      await runtimeSave(runtime)
      expect((await runtime.campaignLibrary())!.dirty).toBe(false)
      expect((await runtime.campaign(await campaignRequest(runtime, 'saveAs', { label: 'P3 original52' }))).accepted).toBe(true)
      const a = library(store).records.find(row => row.label === 'P3 original52'); assert.ok(a)
      const a52 = a.checkpointJson, aDecoded = stored(a52)
      expect(aDecoded.currentSave.state.market.tick).toBe(52)
      expect(aDecoded.checkpoint.currentSaveJson).toBe(aDecoded.checkpoint.savedSaveJson)
      expect(root(aDecoded.currentSave.state, bound.promiseId)).toEqual(root(initial, bound.promiseId))
      await runtimeAdvance(runtime, store)
      expect(stored(library(store).workingCheckpointJson).currentSave.state.market.tick).toBe(53)
      const saveAs = await campaignRequest(runtime, 'saveAs', { label: 'P3 branch53' })
      const saveAsResponse = await runtime.campaign(saveAs); expect(saveAsResponse.accepted).toBe(true)
      const b = library(store).records.find(row => row.label === 'P3 branch53'); assert.ok(b)
      const b53 = b.checkpointJson, bDecoded = stored(b53)
      expect(b.id).not.toBe(a.id); expect(bDecoded.currentSave.state.market.tick).toBe(53)
      expect(bDecoded.checkpoint.sessionId).not.toBe(saveAs.sessionId)
      expect(bDecoded.checkpoint.currentSaveJson).toBe(bDecoded.checkpoint.savedSaveJson)
      const beforeDuplicate = store.contents, writes = store.writes
      calls.duplicateInvocations++
      expect(await runtime.campaign(saveAs)).toEqual(saveAsResponse)
      expect(store.contents).toBe(beforeDuplicate); expect(store.writes).toBe(writes)
      expect(library(store).records).toHaveLength(2)
      expect(library(store).records.find(row => row.id === a.id)!.checkpointJson).toBe(a52)
      await runtimeAdvance(runtime, store)
      expect(stored(library(store).workingCheckpointJson).currentSave.state.market.tick).toBe(54)
      await runtimeSave(runtime)
      expect((await runtime.campaignLibrary())!.dirty).toBe(false)
      const b54 = library(store).records.find(row => row.id === b.id)!.checkpointJson, b54Decoded = stored(b54)
      expect(b54).not.toBe(b53); expect(b54Decoded.currentSave.state.market.tick).toBe(54)
      expect(b54Decoded.checkpoint.currentSaveJson).toBe(b54Decoded.checkpoint.savedSaveJson)
      expect(root(b54Decoded.currentSave.state, bound.promiseId)).toEqual(root(initial, bound.promiseId))
      const loadA = await campaignRequest(runtime, 'load', { campaignId: a.id })
      expect(loadA.unsavedDisposition).toBe('requireClean')
      const loadResponse = await runtime.campaign(loadA); expect(loadResponse.accepted).toBe(true)
      const afterLoad = library(store)
      expect(afterLoad.activeCampaignId).toBe(a.id)
      expect(stored(afterLoad.workingCheckpointJson).currentSave.state.market.tick).toBe(52)
      expect(afterLoad.records.find(row => row.id === b.id)!.checkpointJson).toBe(b54)
      const durable = store.contents!, previous = store
      await runtime.close(); closedStores.push(previous); expect(previous.closed).toBe(true)
      store = new Store(durable); runtime = await createBridgeRuntimeCoordinator(options(store))
      const restarted = library(store), active = stored(restarted.workingCheckpointJson)
      expect(freshFactories).toBe(1)
      expect(restarted.activeCampaignId).toBe(a.id); expect(restarted.records).toHaveLength(2)
      expect(restarted.records.find(row => row.id === a.id)!.checkpointJson).toBe(a52)
      expect(restarted.records.find(row => row.id === b.id)!.checkpointJson).toBe(b54)
      expect(active.currentSave.state.market.tick).toBe(52); assert.ok(active.savedSave)
      expect(active.savedSave.state.market.tick).toBe(52)
      expect(active.checkpoint.sessionId).not.toBe(b54Decoded.checkpoint.sessionId)
      expect(active.checkpoint.journal.some(row => b54Decoded.checkpoint.journal.some(other => other.commandId === row.commandId))).toBe(false)
      expect(root(active.currentSave.state, bound.promiseId)).toEqual(root(initial, bound.promiseId))
      const beforeLoadReplay = store.contents, replayWrites = store.writes
      calls.duplicateInvocations++
      expect(await runtime.campaign(loadA)).toEqual(loadResponse)
      expect(store.contents).toBe(beforeLoadReplay); expect(store.writes).toBe(replayWrites)
      expect(calls.session).toBe(7); expect(calls.coordinator).toBe(2)
      expect(calls.reserved).toBe(9); expect(calls.completed).toBe(9)
      expect(calls.advanceInvocations).toBe(9)
      console.info('1174-P3-RUNTIME ' + JSON.stringify({ originalWeek: 52, branchWeek: 54,
        freshFactories, coordinatorAdvances: 2, aggregateVerifiedAdvances: calls.completed }))
    } finally {
      await runtime.close(); closedStores.push(store)
      expect(closedStores.every(row => row.closed)).toBe(true)
    }
  }, TIMEOUT)
})
