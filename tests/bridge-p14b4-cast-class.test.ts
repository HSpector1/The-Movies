// Installed unchanged after parent bounded review; original inert provenance retained. B4 evidence47.
// INERT / UNEXECUTED. Intended tests/bridge-p14b4-cast-class.test.ts.
// Authority B4 plan382252 and actual owner map26; source publication7022ade.
// Wire grammar below is independent of offerability. Later P2/session/lifecycle
// cases have explicit real fixture guards, never a feasibility or winner stub.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { describe, expect, it, vi } from 'vitest'
import { BridgeSession, authoritativeDigest } from '../bridge/session.ts'
import { marketProposalDraftToEngine, playerProposalDraft } from '../bridge/contract.ts'
import { PROTOCOL_VERSION, SCHEMA_ID, validateQuote } from '../bridge/protocol.ts'
import { BRIDGE_SCHEMA, type BridgeMarketProposalDraftPayload } from '../bridge/schema/bridge-schema.ts'
import { parseWireValue } from '../bridge/schema/runtime.ts'
import { marketCaseProjection, peopleProjection } from '../bridge/people.ts'
import { marketPage } from '../bridge/market.ts'
import { industryPage } from '../bridge/industry.ts'
import { promiseRowsForPerson } from '../bridge/trust.ts'
import { applyActions } from '../src/core/actions.js'
import { attachPromise } from '../src/core/promises.js'
import * as promiseModule from '../src/core/promises.js'
import { currentProposals, submitProposal, withdrawProposal } from '../src/core/talentMarket.js'
import { careerIdentity } from '../src/core/talentSummary.js'
import { convertV31ToV32, convertV32ToV33, convertV33ToV34, convertV34ToV35, exportSave, migrateToLive, migrateToV31, validateSaveV29, validateSaveV35 } from '../src/core/save.js'
import { advanceTo } from '../src/harness/p13a/fixtures.js'
import { provenanceRowFor, recomputeDue } from '../src/core/aging.js'
import type { GameState, ProfessionalPromiseV30 } from '../src/core/types.js'

type SeatClass = 'lead' | 'leadOrAntagonist'
type P2Payload = { verb: 'propose' | 'revise'; talentId: string; termWeeks: number; premiumTier: number;
  promise: { family: 'LEAD_OR_SIGNIFICANT_ROLE_COUNT'; count: number; windowStartWeek: number; dueWeekExclusive: number; seatClass: SeatClass } }
const clone = <T>(value: T): T => structuredClone(value)

/** 762 §6 condition 2: the V33 validator refuses a hand-written `talent[i].age`
 * that disagrees with its own provenance row. This rewrites the person's own
 * anchor to the current tick instead, so the law derives the desired age —
 * same explicit synthetic pure-read age input as before, expressed legally.
 * `due` is rebuilt so condition 3 (the cache) stays honest too. */
function withSyntheticAge(state: GameState, personId: string, age: number): GameState {
  const oldRow = state.talentProvenance.rows.find((r) => r.personId === personId)
  if (oldRow === undefined) throw new Error(`withSyntheticAge: no provenance row for ${personId}`)
  const newRow = provenanceRowFor(personId, age, state.market.tick, oldRow.kind)
  const rows = state.talentProvenance.rows.map((r) => (r.personId === personId ? newRow : r))
  const talent = state.talent.map((t) => (t.id === personId ? { ...t, age } : t))
  const storedAge = new Map(talent.map((t) => [t.id, t.age]))
  return { ...state, talent, talentProvenance: { ...state.talentProvenance, rows, due: recomputeDue(rows, (id) => storedAge.get(id)) } }
}
const hash = (bytes: string | Uint8Array) => createHash('sha256').update(bytes).digest('hex')
const path = (name: string) => new URL('./fixtures/p14/genuine-v29-pre-p2/genuine-v29-' + name, import.meta.url)
const PINS = {
  'current-p1': { gzip: '4947c31baa8cf9b948edd3a75b246df56c6d924e6d624ef1e18591d977f4cca7',
    raw: '03017370f16d9d2cf211f5653650a6d41452f73f0e8b96bb4aa154a6a946f4ca',
    provenance: '8d971552112afe2c7e02501593b4fca03cd5d72be9d0b021bda20cbb175a0d89' },
  'bound-open-p1': { gzip: '48ec1b4474c2d808cae8d689dde74b8695fa5a95f2b51499a384a189e7fb880e',
    raw: '9d1a1ea177f021477fbd73d401e76bbb4a0448a680253082a100c1e5246862d9',
    provenance: '18e72f4320a52739624675ca930348a4e575dafb3f565534fb7e1631de42c781' },
  'refused-p2-count-only-current-draft': { gzip: 'dedd68ed7a975d362838dbbbc5b32016181052a62d3b82a33dea3d95a63d5497',
    raw: '7f7529cb05ab29d2b27bb2855448d2b72e69b5b222b6b351698da0ec7632a253',
    provenance: 'f1dbd042b5ddb4b59880c2d80987aff464a335a773c297bea69a99e1e751ad87' },
} as const
function fixture(name: keyof typeof PINS) {
  const compressed = readFileSync(path(name + '.json.gz'))
  const raw = gunzipSync(compressed).toString('utf8')
  const provenanceBytes = readFileSync(path(name + '.provenance.json'))
  expect(hash(compressed)).toBe(PINS[name].gzip)
  expect(hash(raw)).toBe(PINS[name].raw)
  expect(hash(provenanceBytes)).toBe(PINS[name].provenance)
  const provenance = JSON.parse(provenanceBytes.toString('utf8'))
  expect(provenance.authority).toMatchObject({ testedSourceSha: '89b5ad2cfc6947ea07fb043ef5b23eba38d7dbde',
    publishedRecoverySha: 'c06db6eae2a1350317c018c6f108d115dcba7b19', saveVersion: 29, promiseRulesVersion: 3,
    projectionVersion: 46, schemaId: 'sha256:584bdd8565030f049d548b1af4fcbf8c517ca7c9150016736f632f1ef8fcb98c' })
  const old = validateSaveV29(JSON.parse(raw))
  expect(exportSave(old)).toBe(raw)
  const save = migrateToV31(old)
  // P14B.5: the governed lift adds ONLY the empty relationship root (nothing recomputed).
  expect(save.state).toEqual({ ...old.state, relationships: [] })
  const id: unknown = provenance.focus[0]?.promiseId
  assert.equal(typeof id, 'string')
  const focus = save.state.promises.find((p) => p.promiseId === id)
  assert.ok(focus)
  expect(focus.feasibilityReceipt).toEqual(provenance.focus[0].originalFeasibilityReceipt)
  return { old, save, focus }
}
const player = (state: GameState) => state.hollywood!.playerStudioId
function ownProposal(state: GameState, id: string) {
  const rows = currentProposals(state, id).filter((p) => p.issuerStudioId === player(state))
  expect(rows).toHaveLength(1)
  return rows[0]!
}
function ownRoot(state: GameState, id: string): ProfessionalPromiseV30 {
  const proposal = ownProposal(state, id)
  expect(proposal.promises).toHaveLength(1)
  const root = state.promises.find((p) => p.promiseId === proposal.promises[0])
  assert.ok(root)
  return root
}
function base() {
  const { save, focus } = fixture('current-p1')
  // 735-T (P14B.7 bridge sweep): the caller from here on is LIVE (BridgeSession,
  // withdrawProposal require GameState) -- lift the already-validated V31 state up
  // through the lawful conversions, never by softening validateSaveV31's own refusal
  // inside fixture() above.
  // 763-R8 (P14C.1): the live alias is GameStateV33, so the lift runs one further
  // governed step -- `convertV32ToV33`, the provenance root and the floored ages.
  // 776-S9 (P14C.2a): the live alias is now GameStateV34, one further governed
  // step -- `convertV33ToV34`, the empty career-lifecycle root.
  // P14C.4: the live alias is now GameStateV35, one further governed step --
  // `convertV34ToV35`, adding empty `cohorts` inside the same root.
  const live = convertV34ToV35(convertV33ToV34(convertV32ToV33(convertV31ToV32(save))))
  let state: GameState = clone(live.state)
  const originalRoots = clone(state.promises)
  // Real withdrawal abandons both existing player drafts; roots/receipts remain.
  // The genuine whole roster/Set/mixed development+operations mode is preserved.
  for (const proposal of state.talentMarket.proposals.filter((p) => p.issuerStudioId === player(state))) {
    state = withdrawProposal(state, proposal.talentId, proposal.issuerStudioId)
  }
  expect(state.promises).toEqual(originalRoots)
  expect(state.market.tick).toBe(45)
  expect(state.operations.mode).toBe('managed')
  expect(state.scriptDevelopment.mode).toBe('legacy')
  expect(currentProposals(state, focus.beneficiaryPersonId)).toEqual([])
  validateSaveV35({ ...live, state, broadcastCache: state.broadcastItems })
  return { state, talentId: focus.beneficiaryPersonId }
}
function p2(talentId: string, seatClass: SeatClass = 'lead'): P2Payload {
  return { verb: 'propose', talentId, termWeeks: 52, premiumTier: 1.25,
    promise: { family: 'LEAD_OR_SIGNIFICANT_ROLE_COUNT', count: 1, windowStartWeek: 52, dueWeekExclusive: 92, seatClass } }
}
function control(session: BridgeSession, commandId: string, revision = session.stateRevision) {
  return { protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId: session.sessionId,
    commandId, expectedStateRevision: revision }
}
function request(session: BridgeSession, draft: unknown, commandId: string) {
  return { ...control(session, commandId), type: 'quoteMarketProposal' as const, draft }
}
function quote(session: BridgeSession, draft: BridgeMarketProposalDraftPayload, id: string) {
  const parsed = validateQuote(request(session, draft, id))
  if (!parsed.ok) throw new Error(parsed.message)
  const response = session.quote(parsed.quote)
  expect(response.accepted).toBe(true)
  if (!response.accepted) throw new Error(response.message)
  expect(parseWireValue(BRIDGE_SCHEMA.$defs.StudioBridgeQuoteResponse, response)).toEqual(response)
  if (response.quote.kind !== 'marketProposalAction') throw new Error('wrong actual quote family')
  return { ...response, quote: response.quote }
}
function command(session: BridgeSession, intentId: string, id: string, revision = session.stateRevision) {
  return { ...control(session, id, revision), type: 'submitIntent' as const, payload: { intentId } }
}
function truth(session: BridgeSession) {
  return { state: clone(session.gameState), digest: authoritativeDigest(session.gameState), revision: session.stateRevision,
    saved: session.exportRuntimeCheckpoint().savedSaveJson }
}
function assertTagged(root: ProfessionalPromiseV30, seatClass: SeatClass) {
  expect(root.family).toBe('LEAD_OR_SIGNIFICANT_ROLE_COUNT')
  expect(root.predicate).toEqual({ kind: 'castRoleCount', count: 1, seatClass })
}
const WIRE_P2 = { family: 'LEAD_OR_SIGNIFICANT_ROLE_COUNT', count: 1, windowStartWeek: 52, dueWeekExclusive: 92 }
const BAD_PROMISES: { name: string; value: unknown }[] = [
  { name: 'P2 missing class', value: WIRE_P2 },
  ...[null, 'support', 'leadOrSupport', 1, ['lead']].map((seatClass) => ({ name: `bad class ${JSON.stringify(seatClass)}`, value: { ...WIRE_P2, seatClass } })),
  { name: 'extra wire kind', value: { ...WIRE_P2, seatClass: 'lead', kind: 'castRoleCount' } },
  { name: 'extra nested predicate', value: { ...WIRE_P2, seatClass: 'lead', predicate: { count: 1 } } },
  ...['APPEARANCE_COUNT', 'DIRECTING_COUNT', 'PREFERRED_GENRE_OPPORTUNITY', 'SPECIFIC_PROJECT']
    .map((family) => ({ name: `class inapplicable to ${family}`, value: { ...WIRE_P2, family, seatClass: 'lead' } })),
]

describe('P14B4 exact wire grammar — no P2 offerability prerequisite', () => {
  it.each(['lead', 'leadOrAntagonist'] as const)('accepts explicit %s P2 through the actual closed quote-request validator', (seatClass) => {
    const { state, talentId } = base()
    const session = new BridgeSession(state, 'b4-wire-valid-' + seatClass)
    const wire = request(session, p2(talentId, seatClass), 'wire-valid')
    const before = clone(wire), authority = truth(session)
    const parsed = validateQuote(wire)
    expect(parsed.ok).toBe(true)
    if (!parsed.ok) throw new Error(parsed.message)
    expect(parsed.quote).toEqual(wire)
    expect(wire).toEqual(before)
    expect(truth(session)).toEqual(authority)
  })
  it.each(BAD_PROMISES)('refuses $name before session quote/commit authority is reached', ({ value }) => {
    const { state, talentId } = base()
    const session = new BridgeSession(state, 'b4-wire-invalid')
    const wire = request(session, { ...p2(talentId), promise: value }, 'wire-invalid')
    const before = clone(wire), authority = truth(session)
    expect(validateQuote(wire)).toMatchObject({ ok: false, reasonCode: 'INVALID_COMMAND', commandId: 'wire-invalid' })
    expect(() => parseWireValue(BRIDGE_SCHEMA.$defs.StudioBridgeQuoteRequest, wire)).toThrow()
    expect(wire).toEqual(before)
    expect(truth(session)).toEqual(authority)
    // This tests the actual worker-adapter's validateQuote boundary, not an HTTP
    // transport/future dispatch spy. Never cast malformed data into session.quote.
  })
  it('keeps no-promise and count-only non-P2 wire shapes legal; P3-P5 remain engine-refused separately', () => {
    const { state, talentId } = base()
    const session = new BridgeSession(state, 'b4-wire-old-shapes')
    const plain = { verb: 'propose', talentId, termWeeks: 52, premiumTier: 1.25 }
    expect(validateQuote(request(session, plain, 'plain')).ok).toBe(true)
    for (const family of ['APPEARANCE_COUNT', 'DIRECTING_COUNT', 'PREFERRED_GENRE_OPPORTUNITY', 'SPECIFIC_PROJECT']) {
      expect(validateQuote(request(session, { ...plain, promise: { ...WIRE_P2, family } }, family)).ok).toBe(true)
    }
  })
})

describe('P14B4 real P2 session integration — offerability/commit prerequisites UNEXECUTED', () => {
  it('class changes opaque intent identity; quote/conversion/pending values are nested immutable snapshots', () => {
    const { state, talentId } = base()
    const session = new BridgeSession(state, 'b4-class-values')
    const wire = p2(talentId)
    const before = truth(session)
    const lead = quote(session, wire, 'lead')
    const flex = quote(session, p2(talentId, 'leadOrAntagonist'), 'flex')
    expect(lead.quote.ok).toBe(true); expect(flex.quote.ok).toBe(true)
    expect(lead.quote.intentId).not.toBe(flex.quote.intentId)
    for (const id of [lead.quote.intentId, flex.quote.intentId]) {
      expect(id).not.toContain(talentId); expect(id).not.toContain('LEAD_OR_SIGNIFICANT_ROLE_COUNT'); expect(id).not.toContain('lead')
    }
    const canonical = playerProposalDraft(state, wire)
    const values = clone(canonical)
    const converted = marketProposalDraftToEngine(state, canonical)
    if (!converted.ok) throw new Error(converted.error)
    expect(converted.draft.promise).not.toBe(canonical.promise)
    wire.promise.seatClass = 'leadOrAntagonist'; wire.promise.count = 999
    expect(canonical).toEqual(values)
    if (canonical.promise === undefined || canonical.promise === null || !('seatClass' in canonical.promise)) throw new Error('canonical P2 class missing')
    canonical.promise.seatClass = 'leadOrAntagonist'; canonical.promise.count = 888
    expect(converted.draft).toEqual(values)
    expect(truth(session)).toEqual(before)
    const applied = converted.apply(state)
    expect(applied.ok).toBe(true)
    if (!applied.ok) throw new Error(applied.error)
    assertTagged(ownRoot(applied.next, talentId), 'lead')
    expect(session.command(command(session, lead.quote.intentId, 'commit-retained-lead')).accepted).toBe(true)
    assertTagged(ownRoot(session.gameState, talentId), 'lead')
    expect(session.gameState.promises).toHaveLength(state.promises.length + 1)
    expect(session.gameState.promises.slice(0, state.promises.length)).toEqual(state.promises)
    expect(session.gameState.ledger).toEqual(state.ledger)
    expect(session.gameState.studio.cash).toBe(state.studio.cash)
    expect(session.gameState.rngState).toBe(state.rngState)
    expect(session.stateRevision).toBe(1)
  })

  it('whole-quote refusal registers no intent and returns no partial proposal/root/cash/ledger/RNG state', () => {
    const { state, talentId } = base()
    const session = new BridgeSession(state, 'b4-whole-refusal')
    const wire = p2(talentId); wire.promise.dueWeekExclusive = 105 // outside real [52,104), direct legal refusal
    const before = truth(session)
    const response = quote(session, wire, 'outside-term')
    expect(response.quote).toMatchObject({ ok: false, refusal: null, promise: { ok: false, classification: 'IMPOSSIBLE' } })
    expect(session.command(command(session, response.quote.intentId, 'attempt-refused')))
      .toMatchObject({ accepted: false, reasonCode: 'INTENT_NOT_AVAILABLE' })
    expect(truth(session)).toEqual(before)
    const conversion = marketProposalDraftToEngine(state, playerProposalDraft(state, wire))
    if (!conversion.ok) throw new Error(conversion.error)
    const applied = conversion.apply(state)
    expect(applied.ok).toBe(false); expect(applied).not.toHaveProperty('next')
    expect(state).toEqual(before.state)
  })

  it('class revision replaces attachment, while remove/withdraw preserve every old root and create no outcome', () => {
    const { state, talentId } = base()
    const session = new BridgeSession(state, 'b4-revise')
    const first = quote(session, p2(talentId), 'first')
    expect(first.quote.ok).toBe(true)
    expect(session.command(command(session, first.quote.intentId, 'commit-first')).accepted).toBe(true)
    const old = clone(ownRoot(session.gameState, talentId)), oldDigest = ownProposal(session.gameState, talentId).digest
    const changed = p2(talentId, 'leadOrAntagonist'); changed.verb = 'revise'
    const revised = quote(session, changed, 'revise')
    expect(revised.quote.ok).toBe(true)
    expect(session.command(command(session, revised.quote.intentId, 'commit-revision')).accepted).toBe(true)
    const replacement = ownRoot(session.gameState, talentId)
    assertTagged(replacement, 'leadOrAntagonist')
    expect(replacement.promiseId).not.toBe(old.promiseId)
    expect(ownProposal(session.gameState, talentId).digest).not.toBe(oldDigest)
    expect(session.gameState.promises.find((p) => p.promiseId === old.promiseId)).toEqual(old)
    const roots = clone(session.gameState.promises)
    const remove = quote(session, { verb: 'revise', talentId, termWeeks: 52, premiumTier: 1.25 }, 'remove')
    expect(session.command(command(session, remove.quote.intentId, 'commit-remove')).accepted).toBe(true)
    expect(ownProposal(session.gameState, talentId).promises).toEqual([])
    const withdraw = quote(session, { verb: 'withdraw', talentId, termWeeks: null, premiumTier: null }, 'withdraw')
    expect(session.command(command(session, withdraw.quote.intentId, 'commit-withdraw')).accepted).toBe(true)
    expect(currentProposals(session.gameState, talentId)).toEqual([])
    expect(session.gameState.promises).toEqual(roots)
    expect(session.gameState.talentMarket.receipts.filter((r) => r.kind === 'promiseOutcome')).toEqual([])
    expect(session.gameState.ledger).toEqual(state.ledger)
    expect(session.gameState.rngState).toBe(state.rngState)
    expect(session.gameState.studio.cash).toBe(state.studio.cash)
    expect(session.stateRevision).toBe(4)
  })

  it('direct apply revalidates real CURRENT employment, not the earlier offerable conversion', () => {
    const { state, talentId } = base()
    const conversion = marketProposalDraftToEngine(state, playerProposalDraft(state, p2(talentId)))
    if (!conversion.ok) throw new Error(conversion.error)
    expect(conversion.promise?.classification).toBe('REASONABLY_ACHIEVABLE')
    // Actual legal release ends the case's employment; do not manufacture a
    // changed feasibility receipt, consume an artificial RNG value, or mutate
    // session internals to simulate stale state.
    const changed = applyActions(state, [{ kind: 'releaseTalent', talentId }])
    expect(changed.contracts.some((c) => c.talentId === talentId)).toBe(false)
    const before = clone(changed)
    const result = conversion.apply(changed)
    expect(result.ok).toBe(false)
    expect(result).not.toHaveProperty('next')
    expect(changed).toEqual(before)
  })

  it('session/revision/replay protections still permit only one class-bearing attachment', () => {
    const { state, talentId } = base()
    const a = new BridgeSession(clone(state), 'b4-isolation-a'), b = new BridgeSession(clone(state), 'b4-isolation-b')
    const beforeA = truth(a), beforeB = truth(b)
    const q = quote(a, p2(talentId), 'only-a')
    expect(q.quote.ok).toBe(true)
    expect(b.command(command(b, q.quote.intentId, 'borrow'))).toMatchObject({ accepted: false, reasonCode: 'INTENT_NOT_AVAILABLE' })
    const submit = command(a, q.quote.intentId, 'commit-once')
    expect(a.command({ ...submit, sessionId: b.sessionId })).toMatchObject({ accepted: false, reasonCode: 'SESSION_MISMATCH' })
    expect(a.command({ ...submit, commandId: 'stale', expectedStateRevision: 99 })).toMatchObject({ accepted: false, reasonCode: 'STALE_REVISION' })
    expect(truth(a)).toEqual(beforeA); expect(truth(b)).toEqual(beforeB)
    const accepted = a.command(submit)
    expect(accepted.accepted).toBe(true)
    const after = truth(a)
    expect(a.command(submit)).toEqual(accepted)
    expect(a.command(command(a, q.quote.intentId, 'stale-intent'))).toMatchObject({ accepted: false, reasonCode: 'INTENT_NOT_AVAILABLE' })
    expect(truth(a)).toEqual(after); expect(truth(b)).toEqual(beforeB)
    expect(a.gameState.promises).toHaveLength(state.promises.length + 1)
  })

  it.each([16, 17])('exact cap16: after %i distinct offerable class-bearing quotes', (count) => {
    const { state, talentId } = base()
    const session = new BridgeSession(state, 'b4-cap-' + count)
    const before = truth(session), ids: string[] = []
    for (let index = 0; index < count; index++) {
      const draft = p2(talentId, index % 2 === 0 ? 'lead' : 'leadOrAntagonist')
      draft.promise.dueWeekExclusive = 80 + index
      const response = quote(session, draft, 'cap-' + index)
      expect(response.quote.ok, 'UNEXECUTED fixture: all distinct cap quotes must actually be offerable').toBe(true)
      ids.push(response.quote.intentId)
    }
    expect(new Set(ids).size).toBe(count)
    expect(truth(session)).toEqual(before)
    if (count === 17) {
      expect(session.command(command(session, ids[0]!, 'evicted'))).toMatchObject({ accepted: false, reasonCode: 'INTENT_NOT_AVAILABLE' })
      expect(truth(session)).toEqual(before)
    }
    const chosen = count === 16 ? 0 : 16
    expect(session.command(command(session, ids[chosen]!, 'commit-boundary')).accepted).toBe(true)
    expect(ownRoot(session.gameState, talentId).dueWeekExclusive).toBe(80 + chosen)
    assertTagged(ownRoot(session.gameState, talentId), 'lead')
    expect(session.stateRevision).toBe(1)
  })
})

function history(state: GameState, root: ProfessionalPromiseV30, seatClass: SeatClass | null) {
  expect(root.contractId).not.toBeNull()
  // P14B.8 (projection 50): `supersededByPromiseId` and `progress` ride every row, read
  // off the LIVE row in `state`: one caller hands in a pre-V32 promise object that never
  // carried the link at all, and reading it from there would pin `undefined`.
  const live = state.promises.find((p) => p.promiseId === root.promiseId)!
  const expected = { promiseId: root.promiseId, family: root.family, count: root.predicate.count,
    seatClass, windowStartWeek: root.windowStartWeek, dueWeekExclusive: root.dueWeekExclusive,
    contractId: root.contractId, outcome: root.outcome, outcomeWeek: root.outcomeWeek, outcomeCause: root.outcomeCause,
    supersededByPromiseId: live.supersededByPromiseId, progress: live.progress }
  const own = promiseRowsForPerson(state, root.beneficiaryPersonId, root.issuerStudioId)
  expect(own.filter((row) => row.promiseId === root.promiseId)).toEqual([expected])
  expect(parseWireValue(BRIDGE_SCHEMA.$defs.StudioMarketPromiseHistoryRow, expected)).toEqual(expected)
  const profile = peopleProjection(state).profiles.find((p) => p.talentId === root.beneficiaryPersonId)
  assert.ok(profile)
  expect(profile.promises).toEqual(own)
  const selected = marketPage(state, { view: 'market', targetId: root.beneficiaryPersonId }).selected
  assert.ok(selected)
  expect(selected.history.promises).toEqual(own)
  for (const issuer of state.hollywood!.identities.filter((s) => s.enteredWeek !== null && s.studioId !== root.issuerStudioId)) {
    expect(promiseRowsForPerson(state, root.beneficiaryPersonId, issuer.studioId).some((row) => row.promiseId === root.promiseId)).toBe(false)
  }
}
function pulse(state: GameState) {
  const page = (index: number) => industryPage(state, 'b4-public', 0, { protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID,
    sessionId: 'b4-public', requestId: 'pulse-' + index, expectedStateRevision: 0, type: 'industryQuery', view: 'pulse',
    targetId: null, page: index, pageSize: 50, lane: 'recent', period: 'all' })
  const first = page(0), rows = [...first.activities]
  expect(first.pageCount).toBeLessThan(1000)
  for (let index = 1; index < first.pageCount; index++) rows.push(...page(index).activities)
  expect(rows).toHaveLength(first.totalRows)
  return rows
}

describe('P14B4 existing own/private/public carriers', () => {
  it('both viewing directions retain whole competing promise UNKNOWN, with no class beside it', () => {
    const { state, talentId } = base()
    const session = new BridgeSession(state, 'b4-two-viewers')
    const q = quote(session, p2(talentId), 'own-lead')
    expect(q.quote.ok).toBe(true)
    expect(session.command(command(session, q.quote.intentId, 'commit-own')).accepted).toBe(true)
    const rival = state.hollywood!.identities.find((s) => s.role === 'rival' && s.enteredWeek !== null)
    assert.ok(rival)
    let two = submitProposal(session.gameState, { talentId, issuerStudioId: rival.studioId, termWeeks: 52, premiumTier: 1 })
    two = attachPromise(two, talentId, rival.studioId, { family: 'LEAD_OR_SIGNIFICANT_ROLE_COUNT',
      predicate: { kind: 'castRoleCount', count: 1, seatClass: 'leadOrAntagonist' }, windowStartWeek: 52, dueWeekExclusive: 92 })
    // Real staged rival output, not a claim of natural rival offerability/winner.
    for (const viewer of [player(two), rival.studioId]) {
      const block = marketCaseProjection(two, talentId, viewer)
      assert.ok(block)
      const own = block.proposals.find((p) => p.issuerStudioId === viewer)
      const foreign = block.proposals.find((p) => p.issuerStudioId !== viewer)
      assert.ok(own && foreign)
      expect(own).toMatchObject({ disclosure: 'own', promise: { family: 'LEAD_OR_SIGNIFICANT_ROLE_COUNT',
        count: 1, seatClass: viewer === player(two) ? 'lead' : 'leadOrAntagonist', windowStartWeek: 52, dueWeekExclusive: 92 } })
      expect(foreign).toEqual({ disclosure: 'undisclosed', issuerStudioId: foreign.issuerStudioId,
        submittedWeek: foreign.submittedWeek, termWeeks: foreign.termWeeks, effectiveWeek: foreign.effectiveWeek,
        premiumTier: 'UNKNOWN', annualSalary: 'UNKNOWN', signingBonus: 'UNKNOWN', promise: 'UNKNOWN' })
      expect(parseWireValue(BRIDGE_SCHEMA.$defs.StudioMarketProposalSnapshot, foreign)).toEqual(foreign)
    }
  })

  it('own legacy classless P2 shows null/unknown, never a fabricated lead; P1 remains not-applicable', () => {
    const oldRefused = fixture('refused-p2-count-only-current-draft')
    expect(oldRefused.focus.family).toBe('LEAD_OR_SIGNIFICANT_ROLE_COUNT')
    expect(oldRefused.focus.predicate).toEqual({ count: 1 })
    const own = marketCaseProjection(convertV34ToV35(convertV33ToV34(convertV32ToV33(convertV31ToV32(oldRefused.save)))).state, oldRefused.focus.beneficiaryPersonId, oldRefused.focus.issuerStudioId)!
      .proposals.find((p) => p.issuerStudioId === oldRefused.focus.issuerStudioId)
    expect(own).toMatchObject({ disclosure: 'own', promise: { family: 'LEAD_OR_SIGNIFICANT_ROLE_COUNT', seatClass: null } })
    const bound = fixture('bound-open-p1')
    history(convertV34ToV35(convertV33ToV34(convertV32ToV33(convertV31ToV32(bound.save)))).state, bound.focus, null)
    // Explicit OLD READER-ADMITTED bound legacy-P2 variant, not producer history.
    // Change family only; validate frozen29 BEFORE migration; keep actual binding.
    const changed = clone(bound.old)
    const original = changed.state.promises.find((p) => p.promiseId === bound.focus.promiseId)!
    original.family = 'LEAD_OR_SIGNIFICANT_ROLE_COUNT'
    const migrated = migrateToLive(validateSaveV29(changed))
    history(migrated.state, migrated.state.promises.find((p) => p.promiseId === original.promiseId)!, null)
  })

  it.each([29, 30])('shared profile/case/workspace preferences expose the existing age-edge at%i', (age) => {
    const { save, focus } = fixture('current-p1')
    const person = save.state.talent.find((p) => p.id === focus.beneficiaryPersonId)!
    expect(careerIdentity(person).identityDisciplines).toEqual([])
    const live = convertV34ToV35(convertV33ToV34(convertV32ToV33(convertV31ToV32(save))))
    // Expressed through the person's own provenance anchor (762 §6 condition 2: a
    // hand-written `talent[i].age` disagreeing with it is now refused), not a
    // fabricated credit — same disclosed synthetic pure-read age input as before.
    const state = withSyntheticAge(live.state, person.id, age)
    validateSaveV35({ ...live, state }) // disclosed synthetic pure-read age input, no fake credit
    const before = clone(state)
    const block = marketCaseProjection(state, person.id, player(state))!
    const profile = peopleProjection(state).profiles.find((p) => p.talentId === person.id)!
    const workspace = marketPage(state, { view: 'market', targetId: person.id }).selected!
    expect(block.preferences).toMatchObject({ preferredOpportunity: age === 29 ? 'significantCastRole' : 'anyCastAppearance',
      priorityOrder: age === 29 ? ['opportunity', 'compensation', 'relationships', 'term', 'trust', 'standing', 'incumbency']
        : ['compensation', 'term', 'trust', 'relationships', 'incumbency', 'standing', 'opportunity'] })
    expect(profile.marketCase!.preferences).toEqual(block.preferences)
    expect(workspace.rail.preferences).toEqual(block.preferences)
    expect(parseWireValue(BRIDGE_SCHEMA.$defs.StudioMarketPreferencesSnapshot, block.preferences)).toEqual(block.preferences)
    expect(state).toEqual(before)
  })

  it.each(['lead', 'leadOrAntagonist'] as const)('actual %s quote→binding→termination exposes own class, not public/private leakage', (seatClass) => {
    const { state, talentId } = base()
    const session = new BridgeSession(state, 'b4-bound-' + seatClass)
    const q = quote(session, p2(talentId, seatClass), 'quote-bind')
    expect(q.quote.ok).toBe(true)
    expect(session.command(command(session, q.quote.intentId, 'commit-bind')).accepted).toBe(true)
    const minted = clone(ownRoot(session.gameState, talentId))
    const freezes: { input: GameState; receipt: ReturnType<typeof promiseModule.promiseFeasibility> }[] = []
    const original = promiseModule.promiseFeasibility
    const spy = vi.spyOn(promiseModule, 'promiseFeasibility').mockImplementation((input, draft, week) => {
      const receipt = original(input, draft, week)
      if (draft.promiseId === minted.promiseId && week === 52) freezes.push(clone({ input, receipt }))
      return receipt
    })
    let settled: GameState
    try { settled = advanceTo(session.gameState, 52) } finally { spy.mockRestore() }
    const bound = settled.promises.find((p) => p.promiseId === minted.promiseId)!
    assertTagged(bound, seatClass)
    expect(bound.contractId, 'UNEXECUTED fixture: actual player must win; never fabricate binding').not.toBeNull()
    expect(settled.hollywood!.employment.find((e) => e.contractId === bound.contractId))
      .toMatchObject({ studioId: player(settled), terms: { talentId, startWeek: 52 } })
    expect(settled.talentMarket.receipts.filter((r) => r.kind === 'settled' && r.talentId === talentId && r.week === 52))
      .toEqual([expect.objectContaining({ studioId: player(settled) })])
    const trueFreezes = freezes.filter((f) => !f.input.hollywood!.employment.some((e) => e.contractId === bound.contractId))
    expect(trueFreezes.map((f) => f.receipt)).toContainEqual(bound.feasibilityReceipt)
    expect(bound.feasibilityReceipt).toMatchObject({ week: 52, classification: 'REASONABLY_ACHIEVABLE' })
    history(settled, bound, seatClass)
    const brokenState = applyActions(settled, [{ kind: 'releaseTalent', talentId }])
    const broken = brokenState.promises.find((p) => p.promiseId === minted.promiseId)!
    expect(broken).toMatchObject({ outcome: 'BROKEN', outcomeWeek: 52, contractId: bound.contractId })
    const receipt = brokenState.talentMarket.receipts.find((r) => r.eventId === broken.outcomeEventId)
    assert.ok(receipt)
    expect(receipt).toMatchObject({ kind: 'promiseOutcome', week: 52, talentId, studioId: player(brokenState) })
    history(brokenState, broken, seatClass)
    const publicRows = pulse(brokenState).filter((row) => row.eventId === receipt.eventId)
    expect(publicRows).toHaveLength(1)
    expect(publicRows[0]).toMatchObject({ outcomeKind: 'promiseBroken', talentId, studioId: player(brokenState), detail: receipt.reasons.join(' ') })
    for (const key of ['seatClass', 'family', 'count', 'predicate', 'windowStartWeek', 'dueWeekExclusive', 'classification', 'feasibilityReceipt']) {
      expect(publicRows[0]).not.toHaveProperty(key)
    }
    expect(publicRows[0]!.headline + ' ' + publicRows[0]!.detail).not.toMatch(/\blead\b|\bantagonist\b|leadOrAntagonist|castRoleCount|LEAD_OR_SIGNIFICANT_ROLE_COUNT/i)
    const savedSession = new BridgeSession(brokenState, 'b4-saved-' + seatClass)
    const saved = savedSession.save(control(savedSession, 'save-real-outcome'))
    if (!saved.accepted) throw new Error(saved.message)
    expect(validateSaveV35(JSON.parse(saved.saveJson)).state.promises).toEqual(brokenState.promises)
    const loaded = BridgeSession.fromSaveJson(saved.saveJson, 'b4-loaded-' + seatClass)
    expect(loaded.gameState.promises).toEqual(brokenState.promises)
    history(loaded.gameState, loaded.gameState.promises.find((p) => p.promiseId === broken.promiseId)!, seatClass)
    expect(pulse(loaded.gameState)).toEqual(pulse(brokenState))
  })
})
