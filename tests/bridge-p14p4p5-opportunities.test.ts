// 1236-A/B: three closed Bridge surfaces; no simulation helper or captured-prefix replay.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { afterAll, describe, expect, it, vi } from 'vitest'
import { BridgeSession } from '../bridge/session.ts'
import { PROJECTION_VERSION, PROTOCOL_VERSION, SCHEMA_ID, validateCommand, validateControl, validateQuote } from '../bridge/protocol.ts'
import { BRIDGE_SCHEMA } from '../bridge/schema/bridge-schema.ts'
import { canonicalJson } from '../bridge/schema/canonical.ts'
import { parseWireValue } from '../bridge/schema/runtime.ts'
import { marketCaseProjection, peopleProjection } from '../bridge/people.ts'
import { promiseHistoryFor, promiseRowsFor } from '../bridge/promises.ts'
import { promiseAttentionRows } from '../bridge/trust.ts'
import { decodeBridgeRuntimeCheckpoint, encodeBridgeRuntimeCheckpoint, loadBridgeRuntimeCheckpoint,
  SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS } from '../bridge/runtime-checkpoint.ts'
import { caseDisclosure } from '../src/core/talentMarket.js'
import { activeContract } from '../src/core/employment.js'
import { trustDescriptor } from '../src/core/promises.js'
import { exportSave, importSave, makeSave, migrateToLive, stableStringify, validateSaveV39, validateSaveV45 } from '../src/core/save.js'
import type { GameState, ProfessionalPromise } from '../src/core/types.js'

const TIMEOUT = 60_000
const E = new URL('../docs/engineering/playability-launch-review/evidence/p14b4-20260919/', import.meta.url)
const FOCUS = 'authored-0006', TITLE = 'A Season of Constellation'
const OLD_SCHEMA = 'sha256:9c5bba3fcc58e857fe57e33623a86f096cd04e00547bea8f2dae3a656025b302'
const CLASSES = ['allCast', 'lead', 'leadOrAntagonist'] as const
type Seat = typeof CLASSES[number]
type Family = 'PREFERRED_GENRE_OPPORTUNITY' | 'SPECIFIC_PROJECT'
const clone = <T>(value: T): T => structuredClone(value)
// 1309-X2 ruling 1: convertV40ToV41 (src/core/save.ts:10479) adds a zero
// `termination` movement to every rival finance period; the OLD state never
// carried it, so the expected migrated state must build it the same way,
// never a literal.
// 1309-X3 ruling 4: generic over the state it receives -- GameStateV38/V39
// (and any other era's state sharing this shape) hit exactOptionalPropertyTypes
// when forced through the plain GameState parameter/return type.
type WithRivalBusinesses = { hollywood: { businesses: readonly { account: { periods: readonly { movements: Record<string, number> }[] } }[] } | null }
function withRivalTermination<T extends WithRivalBusinesses>(state: T): T {
  if (state.hollywood === null) return state
  return { ...state, hollywood: { ...state.hollywood, businesses: state.hollywood.businesses.map((business) => ({
    ...business, account: { ...business.account, periods: business.account.periods.map((period) => ({
      ...period, movements: { ...period.movements, termination: 0 } })) },
  })) } }
}
// 1320-A S5: Save42 gives every relationship edge a `sharedCompetitions` counter
// (convertV41ToV42); a genuine V41-or-older old.state never carried it.
type WithRelationships = { relationships: readonly { sharedCompetitions?: number }[] }
function withSharedCompetitions<T extends WithRelationships>(state: T): T {
  return { ...state, relationships: state.relationships.map(edge => ({ ...edge, sharedCompetitions: 0 })) }
}
// 1344-N S5: Save43 gives every rival business a `screenplayShelving` root
// (convertV42ToV43); a genuine V42-or-older old.state never carried it.
type WithScreenplayShelvingBusinesses = { hollywood: { businesses: readonly { screenplayShelving?: {
  version: number; rejections: readonly unknown[]; shelved: readonly unknown[]; commissionHoldUntilWeek: number } }[] } | null }
function withEmptyScreenplayShelving<T extends WithScreenplayShelvingBusinesses>(state: T): T {
  if (state.hollywood === null) return state
  return { ...state, hollywood: { ...state.hollywood, businesses: state.hollywood.businesses.map(business => ({
    ...business, screenplayShelving: { version: 1, rejections: [], shelved: [], commissionHoldUntilWeek: 0 } })) } }
}
// 1358-N S5: Save44 gives every relationship edge an empty `competitions` log and a null `romance`
// (convertV43ToV44); a genuine V43-or-older old.state never carried either.
type WithEdgeLogAndRomance = { relationships: readonly { competitions?: readonly unknown[]; romance?: unknown }[] }
function withEmptyCompetitionsAndRomance<T extends WithEdgeLogAndRomance>(state: T): T {
  return { ...state, relationships: state.relationships.map(edge => ({ ...edge, competitions: [], romance: null })) }
}
// 1361-N S5: Save45 (convertV44ToV45, save.ts:10980-10984) adds the four P15 roots, empty, at the
// save's own week and back-fills nothing; a genuine V44-or-older old.state never carried them. The literals
// are this file's own expectation: production's initialP15Roots never defines it (1361-F7 ruling 3).
function withEmptyP15Roots<T extends object>(state: T, week: number): T {
  return { ...state,
    powerRanking: { version: 1, recordedFromWeek: week, snapshots: [] },
    p15Sequence: { version: 1, next: 1 },
    sharedMarket: { version: 1, recordedFromWeek: week, assessments: [] },
    campaignLegacy: { version: 1, recordedFromWeek: week, official: null, endOfRun: null } }
}
const sha = (value: string | Uint8Array): string => createHash('sha256').update(value).digest('hex')
const bytes = (state: GameState): string => exportSave(makeSave(state))
const viewer = (state: GameState): string => { assert.ok(state.hollywood); return state.hollywood.playerStudioId }
function full(state: GameState): string {
  const before = stableStringify(state), save = makeSave(state)
  expect(save.saveVersion).toBe(45); expect(validateSaveV45(save)).toBe(save)
  const raw = exportSave(save); expect(exportSave(importSave(raw))).toBe(raw)
  expect(stableStringify(state)).toBe(before); return raw
}
function pinned(relative: string, zippedHash: string, rawHash: string): string {
  const zipped = readFileSync(new URL(relative, E)), raw = gunzipSync(zipped).toString('utf8')
  expect(sha(zipped)).toBe(zippedHash); expect(sha(raw)).toBe(rawHash); return raw
}
type Cached = { ok: true; value: unknown } | { ok: false; error: unknown }
const phases = new Map<string, Cached>()
function memo<T>(name: string, build: () => T): T {
  const old = phases.get(name)
  if (old) { if (!old.ok) throw old.error; return clone(old.value) as T }
  try { const value = build(); phases.set(name, { ok: true, value }); return clone(value) }
  catch (error) { phases.set(name, { ok: false, error }); throw error }
}
function input45(): GameState {
  return memo('genuine45', () => {
    const manifest = readFileSync(new URL('1171-p3-current45-capture/MANIFEST.json', E))
    expect(manifest.byteLength).toBe(11550)
    expect(sha(manifest)).toBe('a261fc3177527d05d5a8daf624de7af015df8c9a8fedd3e11b37fe1597a2f4b6')
    const raw = pinned('1171-p3-current45-capture/genuine-v39-p3-market-week45.json.gz',
      '12799a849b0b4aff49cd9707ea8c1b87c64b4e787ff261b2e9cf4b109a953117',
      'e7401f2578a7ad151383ca905df4253c2bbd82d6823c406c28b7e76aa809c5af')
    const parsed: unknown = JSON.parse(raw), old = validateSaveV39(parsed)
    expect(old).toBe(parsed); expect(exportSave(old)).toBe(raw)
    const current = migrateToLive(old); expect(current.saveVersion).toBe(45)
    expect(current.state).toEqual({ ...withEmptyP15Roots(withEmptyCompetitionsAndRomance(withEmptyScreenplayShelving(withRivalTermination(withSharedCompetitions(old.state)))), old.state.market.tick), firstTakeSubjects: { version: 1, cutoverOrdinal: 19, facts: [] } })
    expect(current.state.market.tick).toBe(45); expect(current.state.promises).toEqual([])
    expect(current.state.scriptDevelopment.projects.map(p => [p.id, p.status, p.productionId]))
      .toEqual([['script-0000', 'ready', null], ['script-0001', 'ready', null]])
    expect(current.state.concepts.find(c => c.id === 'c-00')).toMatchObject({ genre: 'drama', title: TITLE })
    expect(current.state.talent.find(p => p.id === FOCUS)?.role).toBe('actor')
    full(current.state); return current.state
  })
}
const counts = { attempted: 0, reserved: 0, invoked: 0, completed: 0,
  quoteInvocations: 0, duplicateInvocations: 0, mutationInvocations: 0, priorCommandInvocations: 0 }
function reserveAdvance(): void {
  counts.attempted++
  assert.ok(counts.reserved < 7, 'shared hard7, no second settlement or coordinator branch')
  counts.reserved++; counts.invoked++
}
afterAll(() => {
  console.info('1236-P4P5-BRIDGE-COUNTERS ' + JSON.stringify({ ...counts, hardAdvanceCap: 7,
    phases: [...phases].map(([name, result]) => ({ name, complete: result.ok })) }))
  expect(counts.invoked).toBeLessThanOrEqual(7)
})
function control(session: BridgeSession, commandId: string) {
  return { protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId: session.sessionId,
    expectedStateRevision: session.stateRevision, commandId }
}
function authority(session: BridgeSession) {
  return { raw: bytes(session.gameState), rng: clone(session.gameState.rngState), revision: session.stateRevision,
    checkpoint: encodeBridgeRuntimeCheckpoint(session.exportRuntimeCheckpoint()) }
}
function root(state: GameState, id: string): ProfessionalPromise {
  const found = state.promises.find(p => p.promiseId === id); assert.ok(found); return found
}
function terms(family: Family, seatClass: Seat = 'allCast', windowStartWeek = 52) {
  return family === 'PREFERRED_GENRE_OPPORTUNITY'
    ? { family, count: 1 as const, seatClass, genre: 'drama' as const, windowStartWeek, dueWeekExclusive: 112 }
    : { family, count: 1 as const, seatClass, scriptProjectId: 'script-0000', windowStartWeek, dueWeekExclusive: 112 }
}
function predicate(family: Family) {
  return family === 'PREFERRED_GENRE_OPPORTUNITY'
    ? { kind: 'genreOpportunity', count: 1, seatClass: 'allCast', genre: 'drama' }
    : { kind: 'projectOpportunity', count: 1, seatClass: 'allCast', scriptProjectId: 'script-0000' }
}
function proposal(promise: unknown) {
  return { verb: 'propose', talentId: FOCUS, termWeeks: 104, premiumTier: 1.25, promise }
}
function quoteMarket(session: BridgeSession, promise: unknown, id: string) {
  const before = authority(session), request = { ...control(session, id), type: 'quoteMarketProposal', draft: proposal(promise) }
  const preimage = canonicalJson(request), parsed = validateQuote(request)
  expect(parsed.ok).toBe(true); if (!parsed.ok) throw new Error(parsed.message)
  counts.quoteInvocations++
  const response = session.quote(parsed.quote)
  expect(authority(session)).toEqual(before); expect(canonicalJson(request)).toBe(preimage)
  expect(response.accepted).toBe(true); if (!response.accepted) throw new Error(response.message)
  expect(parseWireValue(BRIDGE_SCHEMA.$defs.StudioBridgeQuoteResponse, response)).toEqual(response)
  assert.ok(response.quote.kind === 'marketProposalAction'); return response.quote
}
function submit(session: BridgeSession, intentId: string, id: string, advancing = false) {
  const parsed = validateCommand({ ...control(session, id), type: 'submitIntent', payload: { intentId } })
  expect(parsed.ok).toBe(true); if (!parsed.ok) throw new Error(parsed.message)
  if (advancing) reserveAdvance()
  counts.mutationInvocations++
  const result = session.dispatchWithRuntimeCheckpoint('command', parsed.command)
  expect(result.response.accepted).toBe(true); if (!result.response.accepted) throw new Error(result.response.message)
  expect(parseWireValue(BRIDGE_SCHEMA.$defs.StudioBridgeAcceptedCommandResponse, result.response)).toEqual(result.response)
  assert.ok(result.prepared)
  expect(result.prepared.checkpoint).toEqual(session.exportRuntimeCheckpoint())
  expect(result.prepared.checkpoint.currentSaveJson).toBe(full(session.gameState))
  return { request: parsed.command, response: result.response }
}
function duplicate(session: BridgeSession, committed: ReturnType<typeof submit>): void {
  const before = authority(session); counts.duplicateInvocations++
  const repeated = session.dispatchWithRuntimeCheckpoint('command', committed.request)
  expect(canonicalJson(repeated.response)).toBe(canonicalJson(committed.response))
  expect(repeated.prepared).toBeNull(); expect(authority(session)).toEqual(before)
}
function resume(raw: string): BridgeSession { return BridgeSession.fromRuntimeCheckpoint(decodeBridgeRuntimeCheckpoint(raw)) }
function attached(family: Family) {
  return memo(`attached:${family}`, () => {
    const session = new BridgeSession(input45(), `1236-${family}-45`), priorRoots = clone(session.gameState.promises)
    const quote = quoteMarket(session, terms(family), `1236-quote-${family}`)
    console.info('1236-P4P5-QUOTE ' + JSON.stringify({ family, week: session.gameState.market.tick, quote }))
    expect(quote).toMatchObject({ ok: true, promise: { ok: true, classification: 'REASONABLY_ACHIEVABLE' } })
    const committed = submit(session, quote.intentId, `1236-commit-${family}`)
    const own = session.gameState.talentMarket.proposals.filter(p => p.talentId === FOCUS && p.issuerStudioId === viewer(session.gameState))
    expect(own).toHaveLength(1); expect(own[0]!.promises).toHaveLength(1)
    const promiseId = own[0]!.promises[0]!, actual = root(session.gameState, promiseId)
    expect(actual).toMatchObject({ family, predicate: predicate(family), version: 7, contractId: null,
      progress: 0, outcome: null, windowStartWeek: 52, dueWeekExclusive: 112,
      feasibilityReceipt: { classification: 'REASONABLY_ACHIEVABLE', rulesVersion: 7 } })
    expect(session.gameState.promises.slice(0, priorRoots.length)).toEqual(priorRoots)
    duplicate(session, committed)
    return { promiseId, state: clone(session.gameState), checkpoint: authority(session).checkpoint }
  })
}
function bound52() {
  return memo('bound52', () => {
    const initial = attached('PREFERRED_GENRE_OPPORTUNITY'), session = resume(initial.checkpoint)
    for (let week = 46; week <= 52; week++) {
      const snapshot = session.snapshot(), before = session.gameState.market.tick
      expect(parseWireValue(BRIDGE_SCHEMA.$defs.StudioBridgeSnapshotResponse, snapshot)).toEqual(snapshot)
      const intent = snapshot.availableIntents.find(row => row.kind === 'advanceWeek'); assert.ok(intent)
      submit(session, intent.intentId, `1236-advance-${week}`, true)
      expect(session.gameState.market.tick).toBe(before + 1); counts.completed++
    }
    // Actual market/contract/payment premises precede the new semantic root check.
    const contract = activeContract(session.gameState, FOCUS); assert.ok(contract)
    expect(contract).toMatchObject({ startWeek: 52, endWeekExclusive: 156, termWeeks: 104 })
    const employment = session.gameState.hollywood!.employment.filter(e => e.terms.talentId === FOCUS
      && e.studioId === viewer(session.gameState) && e.terms.startWeek === 52)
    expect(employment).toHaveLength(1); expect(employment[0]!.terms).toEqual(contract)
    expect(session.gameState.talentMarket.receipts.filter(r => r.kind === 'settled' && r.week === 52
      && r.talentId === FOCUS && r.studioId === viewer(session.gameState))).toHaveLength(1)
    expect(session.gameState.ledger.filter(r => r.kind === 'signingBonus' && r.week === 52 && r.talentId === FOCUS))
      .toEqual([expect.objectContaining({ amount: -contract.signingBonus })])
    const actual = root(session.gameState, initial.promiseId)
    expect(actual).toMatchObject({ contractId: employment[0]!.contractId, predicate: predicate('PREFERRED_GENRE_OPPORTUNITY'),
      progress: 0, outcome: null, feasibilityReceipt: { classification: 'REASONABLY_ACHIEVABLE', rulesVersion: 7 } })
    full(session.gameState)
    console.info('1236-P4P5-BOUND ' + JSON.stringify({ week: 52, contract, promise: actual, counts }))
    return { promiseId: initial.promiseId, state: clone(session.gameState), checkpoint: authority(session).checkpoint }
  })
}
function privateAbsent(value: unknown, promises: readonly ProfessionalPromise[]): void {
  const text = JSON.stringify(value)
  for (const key of ['predicate', 'inputsDigest', 'rulesVersion', 'feasibilityReceipt', 'evidenceRefs']) {
    expect(text).not.toContain(`"${key}"`)
  }
  for (const p of promises) expect(text).not.toContain(p.feasibilityReceipt.inputsDigest)
}
function material(value: unknown, family: Family | 'old'): void {
  assert.ok(value !== null && typeof value === 'object' && !Array.isArray(value))
  const row = value as { genre?: unknown; scriptProjectId?: unknown; scriptProjectTitle?: unknown }
  if (family === 'PREFERRED_GENRE_OPPORTUNITY') {
    expect(row.genre).toBe('drama'); expect(Object.hasOwn(row, 'scriptProjectId')).toBe(false)
    expect(Object.hasOwn(row, 'scriptProjectTitle')).toBe(false)
  } else if (family === 'SPECIFIC_PROJECT') {
    expect(row.scriptProjectId).toBe('script-0000'); expect(row.scriptProjectTitle).toBe(TITLE)
    expect(Object.hasOwn(row, 'genre')).toBe(false)
  } else for (const key of ['genre', 'scriptProjectId', 'scriptProjectTitle']) expect(Object.hasOwn(row, key)).toBe(false)
}
function quoteWaiver(session: BridgeSession, promiseId: string, substitute: unknown, id: string) {
  full(session.gameState)
  const before = authority(session), request = { ...control(session, id), type: 'quoteWaivePromise', draft: { promiseId, substitute } }
  const requestBefore = canonicalJson(request), parsed = validateQuote(request)
  expect(parsed.ok).toBe(true); if (!parsed.ok) throw new Error(parsed.message)
  counts.quoteInvocations++
  const response = session.quote(parsed.quote)
  expect(authority(session)).toEqual(before); expect(canonicalJson(request)).toBe(requestBefore)
  expect(response.accepted).toBe(true); if (!response.accepted) throw new Error(response.message)
  expect(parseWireValue(BRIDGE_SCHEMA.$defs.StudioBridgeQuoteResponse, response)).toEqual(response)
  assert.ok(response.quote.kind === 'waivePromise'); return response.quote
}
function waive(session: BridgeSession, promiseId: string, family: Family, from: number) {
  const before = clone(session.gameState), old = clone(root(before, promiseId))
  expect(old).toMatchObject({ progress: 0, outcome: null }); assert.ok(old.contractId)
  expect(trustDescriptor(before, FOCUS, viewer(before), before.market.tick).label).not.toBe('Distrusted')
  const quote = quoteWaiver(session, promiseId, terms(family, 'allCast', from), `1236-waiver-quote-${from}`)
  console.info('1236-P4P5-WAIVER-QUOTE ' + JSON.stringify({ actualWeek: before.market.tick, quote }))
  expect(quote).toMatchObject({ ok: true, refusalReason: null, family, count: 1, qualifyingRole: 'cast', seatClass: 'allCast',
    windowStartWeek: from, dueWeekExclusive: 112 })
  material(quote, family)
  expect(quote.commitLabel + ' ' + quote.consequence).toMatch(/begin filming/i)
  expect(quote.commitLabel + ' ' + quote.consequence).toMatch(/lead, antagonist or support/i)
  expect(quote.commitLabel).toContain('BEFORE WEEK 112'); expect(quote.consequence).toContain('Week 111')
  expect(quote.consequence).toContain(family === 'SPECIFIC_PROJECT' ? TITLE : 'drama')
  if (family === 'SPECIFIC_PROJECT') expect(quote.commitLabel + quote.consequence).not.toContain('script-0000')
  const committed = submit(session, quote.intentId, `1236-waiver-commit-${from}`)
  const previous = root(session.gameState, promiseId); assert.ok(previous.supersededByPromiseId)
  const successor = root(session.gameState, previous.supersededByPromiseId)
  expect(previous).toEqual({ ...old, outcome: 'WAIVED', outcomeWeek: 52,
    outcomeCause: previous.outcomeCause, outcomeEventId: previous.outcomeEventId, supersededByPromiseId: successor.promiseId })
  assert.ok(previous.outcomeCause); assert.ok(previous.outcomeEventId)
  expect(session.gameState.talentMarket.receipts.filter(r => r.eventId === previous.outcomeEventId))
    .toEqual([expect.objectContaining({ kind: 'promiseOutcome', week: 52, talentId: FOCUS, studioId: viewer(before) })])
  expect(successor).toMatchObject({ family, predicate: predicate(family), version: 7,
    contractId: old.contractId, issuerStudioId: old.issuerStudioId, beneficiaryPersonId: old.beneficiaryPersonId,
    progress: 0, evidenceRefs: [], outcome: null, windowStartWeek: from, dueWeekExclusive: 112,
    feasibilityReceipt: { classification: 'REASONABLY_ACHIEVABLE', rulesVersion: 7 } })
  expect(session.gameState.promises.filter(p => p.promiseId !== promiseId && p.promiseId !== successor.promiseId))
    .toEqual(before.promises.filter(p => p.promiseId !== promiseId))
  const { promises: _oldPromises, talentMarket: oldMarket, ...oldOther } = before
  const { promises: _newPromises, talentMarket: newMarket, ...newOther } = session.gameState
  expect(newOther).toEqual(oldOther)
  const { receipts: oldReceipts, ...oldMarketOther } = oldMarket
  const { receipts: newReceipts, ...newMarketOther } = newMarket
  expect(newMarketOther).toEqual(oldMarketOther)
  expect(newReceipts.slice(0, oldReceipts.length)).toEqual(oldReceipts)
  expect(newReceipts).toHaveLength(oldReceipts.length + 1)
  duplicate(session, committed); privateAbsent(quote, [previous, successor])
  return { previousId: promiseId, successorId: successor.promiseId, quote }
}
function waiverChain() {
  return memo('waiverChain52', () => {
    const bound = bound52(), session = resume(bound.checkpoint)
    const one = waive(session, bound.promiseId, 'PREFERRED_GENRE_OPPORTUNITY', 53)
    const two = waive(session, one.successorId, 'SPECIFIC_PROJECT', 54)
    full(session.gameState); expect(session.gameState.market.tick).toBe(52)
    return { state: clone(session.gameState), checkpoint: authority(session).checkpoint, one, two, originalId: bound.promiseId }
  })
}
function historySurfaces(state: GameState, checkpoint: string): ReturnType<typeof promiseHistoryFor> {
  full(state); const before = bytes(state), player = viewer(state)
  const rows = promiseHistoryFor(state, FOCUS, player)
  for (const row of rows) expect(parseWireValue(BRIDGE_SCHEMA.$defs.StudioMarketPromiseHistoryRow, row)).toEqual(row)
  expect(peopleProjection(state).profiles.find(p => p.talentId === FOCUS)?.promises).toEqual(rows)
  const snapshot = resume(checkpoint).snapshot()
  expect(parseWireValue(BRIDGE_SCHEMA.$defs.StudioBridgeSnapshotResponse, snapshot)).toEqual(snapshot)
  expect(snapshot.snapshot.talent.talent.profiles.find(p => p.talentId === FOCUS)?.promises).toEqual(rows)
  expect(marketCaseProjection(state, FOCUS, player)?.promiseHistory).toEqual(rows)
  privateAbsent(rows, state.promises); expect(bytes(state)).toBe(before); return rows
}
const OUTGOING = '1221-p4p5-outgoing-capture/'
function outgoingManifest(): void {
  const manifest = readFileSync(new URL(OUTGOING + 'MANIFEST.json', E))
  expect(manifest.byteLength).toBe(21306)
  expect(sha(manifest)).toBe('02115df5d6e7d4c33284b9a439a7c79601e1b2e807f4fa96c20149f5c84186f3')
}
function oldMeaningControls(): void {
  outgoingManifest()
  const raw = pinned(OUTGOING + 'director-bound-week52.json.gz',
    'b894a85ffad37378f93dc8a8e83bad926ab7a1bb857dd76e9b9926b520fec6e1',
    'eae34cd10d457ad551028f3d0a160a55a74d5153b73653b257dc89a4338b040b')
  const old = validateSaveV39(JSON.parse(raw)); expect(exportSave(old)).toBe(raw)
  const original = old.state.promises.find(p => p.promiseId === 'promise-0'); assert.ok(original)
  expect(original).toMatchObject({ family: 'DIRECTING_COUNT', predicate: { kind: 'directorCount', count: 2 }, progress: 0, outcome: null })
  for (const family of ['DIRECTING_COUNT', 'PREFERRED_GENRE_OPPORTUNITY', 'SPECIFIC_PROJECT'] as const) {
    const variant = clone(old)
    if (family !== 'DIRECTING_COUNT') {
      // Synthetic old-reader compatibility only. No natural historical P4/P5 claim.
      variant.state.promises = variant.state.promises.map(p => p.promiseId === original.promiseId
        ? { ...p, family, predicate: { count: p.predicate.count } } : p)
      expect(validateSaveV39(variant)).toBe(variant)
    }
    const current = migrateToLive(variant); full(current.state)
    const before = bytes(current.state), actual = root(current.state, original.promiseId)
    const row = promiseHistoryFor(current.state, actual.beneficiaryPersonId, actual.issuerStudioId)
      .find(p => p.promiseId === actual.promiseId); assert.ok(row)
    expect(row).toMatchObject({ family, qualifyingRole: family === 'DIRECTING_COUNT' ? 'director' : 'cast', seatClass: null })
    material(row, 'old'); expect(parseWireValue(BRIDGE_SCHEMA.$defs.StudioMarketPromiseHistoryRow, row)).toEqual(row)
    const reminders = promiseAttentionRows(current.state, actual.issuerStudioId, actual.dueWeekExclusive - 8, actual.beneficiaryPersonId)
    expect(reminders.filter(r => r.cause === 'promiseDue')).toEqual([expect.objectContaining({ reason: expect.stringMatching(
      family === 'DIRECTING_COUNT' ? /directing has not begun/i : /filming has not begun/i) })])
    expect(bytes(current.state)).toBe(before)
  }
}
type PriorRuntime = { format: string; checkpointVersion: number; protocolVersion: number; schemaId: string;
  sessionId: string; stateRevision: number; currentSaveJson: string; savedSaveJson: string;
  currentStateDigest: string; savedStateDigest: string; journalDigest: string;
  journal: { route: string; commandId: string; requestJson: string; responseJson: string }[] }
function prior54() {
  outgoingManifest()
  const raw = pinned(OUTGOING + 'runtime54-waiver-current61-saved61.json.gz',
    'f329404212db51462182fea9e9291cc01fe3054437119f04ba9d9900353b6240',
    '8b139ebac88d27a1350dc41825d8aefb53b1c72414cf9be1cd173a6c4bf83239')
  const value = JSON.parse(raw) as PriorRuntime
  expect(canonicalJson(value) + '\n').toBe(raw)
  expect(value).toMatchObject({ protocolVersion: 4, schemaId: OLD_SCHEMA, sessionId: '1221-p4p5-outgoing', stateRevision: 1 })
  expect(value.journal).toHaveLength(2); expect(value.journal.map(r => r.route)).toEqual(['save', 'command'])
  for (const row of value.journal) {
    expect(canonicalJson(JSON.parse(row.requestJson))).toBe(row.requestJson)
    expect(canonicalJson(JSON.parse(row.responseJson))).toBe(row.responseJson)
    expect(JSON.parse(row.responseJson).accepted).toBe(true)
  }
  expect(value.journalDigest).toBe('1188a03e42c5b50be35d22dac1a437ad3b086d927ad97ed0359a643c5f132f09')
  expect(sha(canonicalJson(value.journal))).toBe(value.journalDigest)
  const waived = pinned(OUTGOING + 'director-waived-week61.json.gz',
    '95ca93ba0a0f16b1c11ad34960a9617217685a681e8ad27ebf896e75f1debb0e',
    'ad25e44bde2ec18bef17a37a252de4ee9323dd0d7b50dbdaf424be50a5d9abce')
  const earned = pinned(OUTGOING + 'director-earned-week61.json.gz',
    '97a1a96c32f0abe290a798734b322611e0be1f5a1c29461753c1d0b50feeceeb',
    '94558001e85aef5f46d709c07397dedda296416fe86e4f7482caeee88470cace')
  expect(value.currentSaveJson).toBe(waived); expect(value.savedSaveJson).toBe(earned)
  expect(value.currentSaveJson).not.toBe(value.savedSaveJson)
  for (const slot of ['currentSaveJson', 'savedSaveJson'] as const) {
    const previous = validateSaveV39(JSON.parse(value[slot]))
    expect(exportSave(previous)).toBe(value[slot]); expect(previous.state.market.tick).toBe(61)
    expect(previous.state.firstTakes).toHaveLength(25)
    expect(sha(value[slot])).toBe(slot === 'currentSaveJson' ? value.currentStateDigest : value.savedStateDigest)
  }
  return { raw, value }
}

describe('P4/P5 closed Bridge material and outgoing runtime authority', () => {
  it('B55-1 validates closed singular drafts and discloses only actual own material', () => {
    const session = new BridgeSession(input45(), '1236-grammar'), initial = authority(session)
    const check = (promise: unknown, accepted: boolean) => {
      for (const request of [
        { ...control(session, '1236-grammar-proposal'), type: 'quoteMarketProposal', draft: proposal(promise) },
        { ...control(session, '1236-grammar-waiver'), type: 'quoteWaivePromise', draft: { promiseId: 'wire-shape-only', substitute: promise } },
      ]) {
        const before = canonicalJson(request)
        expect(validateQuote(request).ok).toBe(accepted); expect(canonicalJson(request)).toBe(before)
      }
    }
    for (const family of ['PREFERRED_GENRE_OPPORTUNITY', 'SPECIFIC_PROJECT'] as const) {
      for (const seat of CLASSES) check(terms(family, seat), true)
      const valid = terms(family)
      for (const key of ['count', 'seatClass', family === 'SPECIFIC_PROJECT' ? 'scriptProjectId' : 'genre']) {
        const missing: Record<string, unknown> = { ...valid }; delete missing[key]; check(missing, false)
      }
      for (const extra of [{ count: 0 }, { count: 2 }, { seatClass: 'support' }, { seatClass: null },
        { kind: 'private' }, { predicate: { count: 1 } }, { issuerStudioId: viewer(session.gameState) },
        { inputsDigest: 'private' }, { scriptProjectTitle: 'client-authored title' },
        family === 'SPECIFIC_PROJECT' ? { genre: 'drama' } : { scriptProjectId: 'script-0000' }]) check({ ...valid, ...extra }, false)
      check(family === 'SPECIFIC_PROJECT' ? { ...valid, scriptProjectId: '' } : { ...valid, genre: 'unknown' }, false)
      const wrong: Record<string, unknown> = { ...valid }
      delete wrong[family === 'SPECIFIC_PROJECT' ? 'scriptProjectId' : 'genre']
      Object.assign(wrong, family === 'SPECIFIC_PROJECT' ? { genre: 'drama' } : { scriptProjectId: 'script-0000' }); check(wrong, false)
    }
    for (const family of ['APPEARANCE_COUNT', 'DIRECTING_COUNT'] as const) check({ family, count: 2, windowStartWeek: 52, dueWeekExclusive: 112 }, true)
    for (const seatClass of CLASSES) check({ family: 'LEAD_OR_SIGNIFICANT_ROLE_COUNT', count: 2, seatClass,
      windowStartWeek: 52, dueWeekExclusive: 112 }, seatClass !== 'allCast')
    const injected = { ...control(session, '1236-issuer'), type: 'quoteMarketProposal', draft: { ...proposal(terms('SPECIFIC_PROJECT')), issuerStudioId: 'foreign' } }
    expect(validateQuote(injected).ok).toBe(false); expect(authority(session)).toEqual(initial)
    const unknown = quoteMarket(session, { ...terms('SPECIFIC_PROJECT'), scriptProjectId: '1236-no-project' }, '1236-unknown-project')
    expect(unknown).toMatchObject({ ok: false, promise: { ok: false, classification: 'IMPOSSIBLE' } })
    expect(authority(session)).toEqual(initial)

    for (const family of ['PREFERRED_GENRE_OPPORTUNITY', 'SPECIFIC_PROJECT'] as const) {
      const actual = attached(family), state = actual.state, player = viewer(state), before = bytes(state)
      const engine = caseDisclosure(state, FOCUS, player, 45).proposals.find(p => p.issuerStudioId === player)
      assert.ok(engine && engine.promise !== 'UNKNOWN' && engine.promise !== null)
      const ownCase = marketCaseProjection(state, FOCUS, player); assert.ok(ownCase)
      const own = ownCase.proposals.find(p => p.issuerStudioId === player); assert.ok(own)
      expect(own.promise).toEqual(engine.promise)
      expect(promiseRowsFor(state, FOCUS, player).find(p => p.issuerStudioId === player)?.promise).toEqual(engine.promise)
      expect(own.promise).toMatchObject({ family, count: 1, qualifyingRole: 'cast', seatClass: 'allCast', windowStartWeek: 52, dueWeekExclusive: 112 })
      material(own.promise, family)
      expect(Object.keys(engine.promise).sort()).toEqual(['classification', 'count', 'dueWeekExclusive', 'family', 'qualifyingRole',
        'seatClass', 'windowStartWeek', ...(family === 'SPECIFIC_PROJECT' ? ['scriptProjectId', 'scriptProjectTitle'] : ['genre'])].sort())
      expect(parseWireValue(BRIDGE_SCHEMA.$defs.StudioMarketPromiseSnapshot, own.promise)).toEqual(own.promise)
      const other = state.hollywood!.identities.find(s => s.studioId !== player && s.enteredWeek !== null); assert.ok(other)
      const otherCase = marketCaseProjection(state, FOCUS, other.studioId); assert.ok(otherCase)
      const hidden = otherCase.proposals.find(p => p.issuerStudioId === player); assert.ok(hidden)
      expect(hidden).toMatchObject({ disclosure: 'undisclosed', promise: 'UNKNOWN', premiumTier: 'UNKNOWN', annualSalary: 'UNKNOWN', signingBonus: 'UNKNOWN' })
      for (const key of ['genre', 'scriptProjectId', 'scriptProjectTitle', 'seatClass']) expect(JSON.stringify(hidden)).not.toContain(`"${key}"`)
      expect(JSON.stringify(hidden)).not.toContain(TITLE); expect(JSON.stringify(hidden)).not.toContain('script-0000')
      expect(promiseHistoryFor(state, FOCUS, other.studioId)).toEqual([])
      expect(ownCase.promiseHistory).toEqual([]); privateAbsent({ own, hidden }, state.promises)
      expect(bytes(state)).toBe(before)
    }
    console.info('1236-P4P5-WIRE ' + JSON.stringify({ week: 45, acceptedFamilies: 2, advances: counts.invoked }))
  }, TIMEOUT)

  it('B55-2 binds actual genre work and preserves material through an own waiver chain', () => {
    oldMeaningControls() // Independent frozen-reader controls precede binding dependency.
    const bound = bound52(), original = root(bound.state, bound.promiseId), boundRows = historySurfaces(bound.state, bound.checkpoint)
    const originalRow = boundRows.find(p => p.promiseId === original.promiseId); assert.ok(originalRow)
    material(originalRow, 'PREFERRED_GENRE_OPPORTUNITY')
    const before = bytes(bound.state), reminders = promiseAttentionRows(bound.state, viewer(bound.state), 104, FOCUS)
    // Pure explicit query104; this admitted campaign remains at actual52.
    const due = reminders.filter(r => r.cause === 'promiseDue'); expect(due).toHaveLength(1)
    expect(due[0]!.reason).toMatch(/filming.*drama.*lead, antagonist or support.*has not begun/i)
    const other = bound.state.hollywood!.identities.find(s => s.studioId !== viewer(bound.state) && s.enteredWeek !== null); assert.ok(other)
    expect(promiseAttentionRows(bound.state, other.studioId, 104, FOCUS)).toEqual([])
    expect(bound.state.market.tick).toBe(52); expect(bytes(bound.state)).toBe(before)
    const chain = waiverChain(), rows = historySurfaces(chain.state, chain.checkpoint)
    for (const [id, family, outcome, successor] of [
      [chain.originalId, 'PREFERRED_GENRE_OPPORTUNITY', 'WAIVED', chain.one.successorId],
      [chain.one.successorId, 'PREFERRED_GENRE_OPPORTUNITY', 'WAIVED', chain.two.successorId],
      [chain.two.successorId, 'SPECIFIC_PROJECT', null, null],
    ] as const) {
      const row = rows.find(p => p.promiseId === id); assert.ok(row)
      expect(row).toMatchObject({ family, count: 1, qualifyingRole: 'cast', seatClass: 'allCast', outcome,
        supersededByPromiseId: successor, progress: 0, contractId: original.contractId })
      material(row, family)
    }
    const session = resume(chain.checkpoint)
    for (const [index, rejected] of [terms('PREFERRED_GENRE_OPPORTUNITY', 'allCast', 55),
      { ...terms('SPECIFIC_PROJECT', 'allCast', 55), scriptProjectId: 'script-0001' },
      { family: 'DIRECTING_COUNT', count: 1, windowStartWeek: 55, dueWeekExclusive: 112 },
    ].entries()) {
      const q = quoteWaiver(session, chain.two.successorId, rejected, `1236-restrict-${index}`)
      expect(q.ok).toBe(false); expect(q.refusalReason).toEqual(expect.any(String))
    }
    const foreign = chain.state.hollywood!.businesses.flatMap(b => b.development.projects)
      .find(p => !chain.state.scriptDevelopment.projects.some(own => own.id === p.id))
    assert.ok(foreign, 'actual foreign-only target before target privacy comparison')
    const refusedTargets = [foreign.id, '1236-no-project'].map((scriptProjectId, index) => {
      const q = quoteWaiver(session, chain.two.successorId, { ...terms('SPECIFIC_PROJECT', 'allCast', 55), scriptProjectId }, `1236-unresolved-${index}`)
      expect(q.ok).toBe(false); expect(Object.hasOwn(q, 'scriptProjectTitle')).toBe(false)
      return q.refusalReason
    })
    expect(refusedTargets[0]).toBe(refusedTargets[1])
    privateAbsent({ rows, reminders, one: chain.one.quote, two: chain.two.quote }, chain.state.promises)
    console.info('1236-P4P5-HISTORY ' + JSON.stringify({ actualWeek: 52, reminderQueryWeek: 104,
      chain: [chain.originalId, chain.one.successorId, chain.two.successorId], history: rows, advances: counts.invoked }))
  }, TIMEOUT)

  it('B55-3 independently migrates genuine54 slots and resets only prior runtime authority', () => {
    const advanceBefore = { attempted: counts.attempted, reserved: counts.reserved, invoked: counts.invoked, completed: counts.completed }
    const old = prior54(), preimage = canonicalJson(old.value), factory = vi.fn(() => '1236-prior54')
    const loaded = loadBridgeRuntimeCheckpoint(old.raw, undefined, factory)
    expect(loaded.migratedFromProtocolVersion).toBe(4); expect(factory).toHaveBeenCalledTimes(1)
    expect(PROTOCOL_VERSION).toBe(4); expect(PROJECTION_VERSION).toBe(57)
    expect(BRIDGE_SCHEMA.$id).toBe('urn:project-studio:bridge:protocol-4:projection-57')
    expect([...SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS].filter(([id]) => id === OLD_SCHEMA)).toEqual([[OLD_SCHEMA, 'projection-v54']])
    expect(SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS.has(SCHEMA_ID)).toBe(false)
    const older = [...SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS].filter(([id]) => id !== OLD_SCHEMA)
      .sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0)
    // 1309-X3 ruling 5: outgoing55 (projection-v55) is now registered as a prior
    // id too, so the older count grows to 43. Recomputed directly (never from a
    // run): parsed the literal [hash, label] pairs from
    // bridge/runtime-checkpoint.ts's SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS map
    // (including its three named-constant entries), excluded OLD_SCHEMA
    // (projection-v54), sorted by key, then computed
    // sha256(JSON.stringify(older)) with Python's json.dumps(...,
    // separators=(',', ':')) to match canonicalJson's compact array-of-tuples
    // encoding exactly (canonicalize() only sorts object keys, never reorders
    // array elements, and this array has no object elements to sort).
    // 1358-N P2: outgoing56 (projection-v56) is registered too, so the older count
    // grows to 44; the digest is recomputed by the same method.
    expect(older).toHaveLength(44)
    expect(sha(canonicalJson(older))).toBe('afae82e478438adcd177592fca60fc283c0e73bdc5eefc1101a8115de28cce58')
    const current = loaded.hydrated.checkpoint
    expect(current).toMatchObject({ schemaId: SCHEMA_ID, sessionId: '1236-prior54', stateRevision: 0, journal: [], journalDigest: sha('[]') })
    expect(current.sessionId).not.toBe(old.value.sessionId)
    for (const slot of ['currentSaveJson', 'savedSaveJson'] as const) {
      assert.ok(current[slot])
      const previous = validateSaveV39(JSON.parse(old.value[slot])), now = validateSaveV45(JSON.parse(current[slot]!))
      expect(now.state).toEqual({ ...withEmptyP15Roots(withEmptyCompetitionsAndRomance(withEmptyScreenplayShelving(withRivalTermination(withSharedCompetitions(previous.state)))), previous.state.market.tick), firstTakeSubjects: { version: 1, cutoverOrdinal: 25, facts: [] } })
      expect(current[slot]).toBe(exportSave(migrateToLive(previous))); full(now.state)
    }
    expect(current.currentSaveJson).not.toBe(current.savedSaveJson)
    const currentState = validateSaveV45(JSON.parse(current.currentSaveJson)).state
    const savedState = validateSaveV45(JSON.parse(current.savedSaveJson!)).state
    expect(root(currentState, 'promise-0')).toMatchObject({ outcome: 'WAIVED', progress: 1, supersededByPromiseId: 'promise-1' })
    expect(root(savedState, 'promise-0')).toMatchObject({ outcome: null, progress: 1, supersededByPromiseId: null })
    const currentRaw = encodeBridgeRuntimeCheckpoint(current), again = vi.fn(() => { throw new Error('current55 must not migrate again') })
    const reloaded = loadBridgeRuntimeCheckpoint(currentRaw, undefined, again)
    expect(reloaded.migratedFromProtocolVersion).toBeNull(); expect(again).not.toHaveBeenCalled()
    expect(encodeBridgeRuntimeCheckpoint(reloaded.hydrated.checkpoint)).toBe(currentRaw)

    const detached = resume(currentRaw), beforeOldCommand = authority(detached)
    counts.priorCommandInvocations++
    expect(detached.command(JSON.parse(old.value.journal[1]!.requestJson)).accepted).toBe(false)
    expect(bytes(detached.gameState)).toBe(beforeOldCommand.raw); expect(detached.gameState.rngState).toEqual(beforeOldCommand.rng)
    expect(detached.stateRevision).toBe(beforeOldCommand.revision)
    // A prior-schema refusal can journal; its original response is never accepted as55 replay.
    const clean = resume(currentRaw), beforeSave = authority(clean)
    const parsed = validateControl(control(clean, '1236-current-save'))
    expect(parsed.ok).toBe(true); if (!parsed.ok) throw new Error(parsed.message)
    counts.mutationInvocations++
    const saved = clean.dispatchWithRuntimeCheckpoint('save', parsed.control)
    expect(saved.response.accepted).toBe(true); assert.ok(saved.response.accepted && 'saveJson' in saved.response)
    expect(parseWireValue(BRIDGE_SCHEMA.$defs.StudioBridgeSaveResponse, saved.response)).toEqual(saved.response)
    assert.ok(saved.prepared)
    expect(saved.prepared.checkpoint.currentSaveJson).toBe(beforeSave.raw)
    expect(saved.prepared.checkpoint.savedSaveJson).toBe(beforeSave.raw)
    expect(bytes(clean.gameState)).toBe(beforeSave.raw); expect(clean.gameState.rngState).toEqual(beforeSave.rng)
    expect(clean.stateRevision).toBe(beforeSave.revision)
    const savedAuthority = authority(clean); counts.duplicateInvocations++
    const repeated = clean.dispatchWithRuntimeCheckpoint('save', parsed.control)
    expect(canonicalJson(repeated.response)).toBe(canonicalJson(saved.response))
    expect(repeated.prepared).toBeNull(); expect(authority(clean)).toEqual(savedAuthority)
    const journal = clean.exportRuntimeCheckpoint().journal
    expect(journal).toHaveLength(1)
    expect(journal[0]).toMatchObject({ route: 'save', commandId: parsed.control.commandId,
      requestJson: canonicalJson(parsed.control), responseJson: canonicalJson(saved.response) })

    for (const slot of ['currentSaveJson', 'savedSaveJson'] as const) {
      const malformed = clone(old.value), inner = JSON.parse(malformed[slot])
      const person = inner.state.talent.find((p: { id: string }) => p.id === 't-wri-00'); assert.ok(person)
      person.age += 1 // Detached negative only; repair outer hash, not inner authority.
      malformed[slot] = canonicalJson(inner)
      if (slot === 'currentSaveJson') malformed.currentStateDigest = sha(malformed[slot])
      else malformed.savedStateDigest = sha(malformed[slot])
      const forbiddenFactory = vi.fn(() => '1236-invalid')
      expect(() => loadBridgeRuntimeCheckpoint(canonicalJson(malformed) + '\n', undefined, forbiddenFactory)).toThrow(/age|provenance/i)
      expect(forbiddenFactory).not.toHaveBeenCalled()
    }
    expect(canonicalJson(old.value)).toBe(preimage)
    expect({ attempted: counts.attempted, reserved: counts.reserved, invoked: counts.invoked, completed: counts.completed }).toEqual(advanceBefore)
    console.info('1236-P4P5-PRIOR54 ' + JSON.stringify({ oldSchema: OLD_SCHEMA, currentSchema: SCHEMA_ID,
      oldJournalDigest: old.value.journalDigest, migratedJournalEntries: current.journal.length,
      currentDigest: current.currentStateDigest, savedDigest: current.savedStateDigest, additionalAdvances: 0,
      currentSaveReplayEqual: true, independentInnerSlotRefusals: 2 }))
  }, TIMEOUT)
})
