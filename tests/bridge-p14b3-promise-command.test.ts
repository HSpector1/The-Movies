// DRAFT ONLY: intended tests/bridge-p14b3-promise-command.test.ts; not installed/run.
// P14B.3 audited expansion: complete the existing P1 quote→commit route atomically.
// All imports already exist. Expected RED is real missing attachment/refusal or
// draft-value retention, never an invented missing export. No new promise family,
// chooser rule, save/projection bump or rival-private disclosure is authorized.
import { describe, expect, it } from 'vitest'
import { BridgeSession, authoritativeDigest } from '../bridge/session.ts'
import { marketProposalDraftToEngine, playerProposalDraft } from '../bridge/contract.ts'
import { PROTOCOL_VERSION, SCHEMA_ID } from '../bridge/protocol.ts'
import { BRIDGE_SCHEMA, PROJECTION_VERSION, type BridgeMarketProposalDraftPayload } from '../bridge/schema/bridge-schema.ts'
import { parseWireValue } from '../bridge/schema/runtime.ts'
import { marketCaseProjection, peopleProjection } from '../bridge/people.ts'
import { marketPage } from '../bridge/market.ts'
import { industryPage } from '../bridge/industry.ts'
import { promiseRowsForPerson, trustBlockFor } from '../bridge/trust.ts'
import { applyActions, hiringMarketIds } from '../src/core/index.js'
import { attachPromise, promiseFeasibility, trustDrivers } from '../src/core/promises.js'
import { currentProposals, submitProposal, withdrawProposal } from '../src/core/talentMarket.js'
import { LIVE_SAVE_VERSION, makeSave, validateSaveV30 } from '../src/core/save.js'
import type { GameState } from '../src/core/types.js'
import { advanceTo, fund, p13aGeneratedStudio, player } from './helpers/p14b2-fixtures.js'

type Payload = BridgeMarketProposalDraftPayload
let cached: { state: GameState; talentId: string } | undefined
function fixture() {
  if (cached === undefined) {
    let state = fund(p13aGeneratedStudio())
    const talentId = hiringMarketIds(state, state.market.tick)
      .find((id) => state.talent.find((t) => t.id === id)?.role === 'actor')
    if (talentId === undefined) throw new Error('B3 premise: no real signable actor')
    state = applyActions(state, [{ kind: 'signContract', talentId, termWeeks: 52 }])
    state = advanceTo(state, 45)
    expect(currentProposals(state, talentId).filter((p) => p.issuerStudioId === player(state))).toEqual([])
    expect(state.promises.filter((p) => p.beneficiaryPersonId === talentId)).toEqual([])
    validateSaveV30(JSON.parse(JSON.stringify(makeSave(state))))
    cached = { state, talentId }
  }
  return structuredClone(cached)
}
function payload(talentId: string): Payload {
  return { verb: 'propose', talentId, termWeeks: 52, premiumTier: 1.25,
    promise: { family: 'APPEARANCE_COUNT', count: 1, windowStartWeek: 52, dueWeekExclusive: 92 } }
}
function control(session: BridgeSession, commandId: string, expectedStateRevision = session.stateRevision) {
  return { protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId: session.sessionId,
    commandId, expectedStateRevision }
}
function quoteRequest(session: BridgeSession, draft: Payload, commandId: string) {
  return { ...control(session, commandId), type: 'quoteMarketProposal' as const, draft }
}
function quote(session: BridgeSession, draft: Payload, commandId: string) {
  const response = session.quote(quoteRequest(session, draft, commandId))
  expect(response.accepted).toBe(true)
  if (!response.accepted) throw new Error(response.message)
  expect(parseWireValue(BRIDGE_SCHEMA.$defs.StudioBridgeQuoteResponse, response)).toEqual(response)
  expect(response.quote.kind).toBe('marketProposalAction')
  return response
}
function command(session: BridgeSession, intentId: string, commandId: string, revision = session.stateRevision) {
  return { ...control(session, commandId, revision), type: 'submitIntent' as const, payload: { intentId } }
}
function truth(session: BridgeSession) {
  // Journaled rejection/replay receipts are not campaign mutations. Compare all
  // authoritative state bytes (includes RNG, ledger, roots/counters) and the slot.
  return { state: JSON.stringify(session.gameState), digest: authoritativeDigest(session.gameState),
    revision: session.stateRevision, saved: session.exportRuntimeCheckpoint().savedSaveJson }
}
function currentOwn(state: GameState, talentId: string) {
  const rows = currentProposals(state, talentId).filter((p) => p.issuerStudioId === player(state))
  expect(rows).toHaveLength(1)
  return rows[0]!
}
function attachedOwn(state: GameState, talentId: string) {
  const proposal = currentOwn(state, talentId)
  expect(proposal.promises).toHaveLength(1)
  const promise = state.promises.find((p) => p.promiseId === proposal.promises[0])
  if (promise === undefined) throw new Error('B3: current proposal must reference its actual newly appended promise')
  return promise
}
function saveSlot(session: BridgeSession, commandId = 'save-fixture') {
  const result = session.save(control(session, commandId))
  if (!result.accepted) throw new Error(result.message)
  validateSaveV30(JSON.parse(result.saveJson))
  return result.saveJson
}
function feasibilityAfterRealBaseRevision(state: GameState, wire: Payload) {
  if (wire.promise === undefined || wire.termWeeks === null || wire.premiumTier === null) throw new Error('B3 test needs a priced promised draft')
  const next = submitProposal(state, { talentId: wire.talentId, issuerStudioId: player(state), termWeeks: wire.termWeeks, premiumTier: wire.premiumTier })
  const proposal = currentOwn(next, wire.talentId)
  return promiseFeasibility(next, { family: wire.promise.family, issuerStudioId: player(next), beneficiaryPersonId: wire.talentId,
    predicate: { count: wire.promise.count }, windowStartWeek: wire.promise.windowStartWeek, dueWeekExclusive: wire.promise.dueWeekExclusive,
    startWeek: proposal.startWeek, termWeeks: proposal.termWeeks }, next.market.tick)
}

describe('P14B.3: quote and atomic command attachment', () => {
  it('commits exactly one real attachment at the live ordinal, one revision, no immediate cash movement', () => {
    const { state, talentId } = fixture()
    // Real abandoned output supplies a NONZERO live counter; preserve it. Its
    // disjoint window keeps this attachment RED independent of the F1 accounting
    // defect, which has its own test file. No root is deleted before quoting.
    let prepared = submitProposal(state, { talentId, issuerStudioId: player(state), termWeeks: 52, premiumTier: 1.25 })
    prepared = attachPromise(prepared, talentId, player(prepared), { family: 'APPEARANCE_COUNT', predicate: { count: 1 }, windowStartWeek: 93, dueWeekExclusive: 104 })
    prepared = withdrawProposal(prepared, talentId, player(prepared))
    const session = new BridgeSession(prepared, 'b3-atomic')
    const slot = saveSlot(session)
    const before = structuredClone(session.gameState)
    const ordinal = before.promises.length
    expect(ordinal).toBeGreaterThan(0)
    const wire = payload(talentId)
    expect(feasibilityAfterRealBaseRevision(before, wire).classification).toBe('REASONABLY_ACHIEVABLE')
    const quoted = quote(session, wire, 'quote-atomic')
    expect(quoted.quote.ok).toBe(true)
    expect(quoted.quote.promise).toMatchObject({ ok: true, classification: 'REASONABLY_ACHIEVABLE', message: null })
    expect(session.gameState).toEqual(before)
    const accepted = session.command(command(session, quoted.quote.intentId, 'commit-atomic'))
    expect(accepted.accepted).toBe(true)
    expect(session.stateRevision).toBe(1)
    expect(session.gameState.promises).toHaveLength(ordinal + 1)
    const promise = attachedOwn(session.gameState, talentId)
    expect(promise).toMatchObject({ promiseId: `promise-${ordinal}`, family: 'APPEARANCE_COUNT', predicate: { count: 1 },
      issuerStudioId: player(before), beneficiaryPersonId: talentId, windowStartWeek: 52, dueWeekExclusive: 92,
      contractId: null, outcome: null, outcomeWeek: null, outcomeEventId: null })
    expect(session.gameState.promises.slice(0, ordinal)).toEqual(before.promises)
    expect(session.gameState.talentMarket.receipts.slice(0, before.talentMarket.receipts.length)).toEqual(before.talentMarket.receipts)
    expect(session.gameState.talentMarket.receipts).toHaveLength(before.talentMarket.receipts.length + 1)
    expect(session.gameState.studio.cash).toBe(before.studio.cash)
    expect(session.gameState.ledger).toEqual(before.ledger)
    expect(session.gameState.rngState).toBe(before.rngState)
    expect(session.gameState.hollywood!.employment).toEqual(before.hollywood!.employment)
    expect(session.exportRuntimeCheckpoint().savedSaveJson).toBe(slot)
    const plain = submitProposal(before, { talentId, issuerStudioId: player(before), termWeeks: 52, premiumTier: 1.25 })
    expect(currentOwn(session.gameState, talentId).digest).not.toBe(currentOwn(plain, talentId).digest)
    validateSaveV30(JSON.parse(JSON.stringify(makeSave(session.gameState))))
  })

  it('pure repeated quotes retain exact state/RNG/receipt/cash/slot bytes and one opaque identity', () => {
    const { state, talentId } = fixture()
    const session = new BridgeSession(state, 'b3-pure')
    saveSlot(session)
    const before = truth(session)
    const a = quote(session, payload(talentId), 'quote-repeat-a')
    const b = quote(session, payload(talentId), 'quote-repeat-b')
    expect(a.quote).toEqual(b.quote)
    expect(a.quote.ok).toBe(true)
    expect(a.quote.intentId).not.toContain(talentId)
    expect(a.quote.intentId).not.toContain('APPEARANCE_COUNT')
    expect(truth(session)).toEqual(before)
  })

  it('each material promise field participates in the opaque intent identity, including refused variants', () => {
    const { state, talentId } = fixture()
    const session = new BridgeSession(state, 'b3-material-identity')
    const base = payload(talentId)
    // 600-T2 (record 600, projection 47): B3's refused variant was a CLASSLESS
    // LEAD_OR_SIGNIFICANT_ROLE_COUNT, engine-refused as "not offered in this slice".
    // Under the closed family-discriminated wire union a classless P2 is not a
    // wire shape at all — the grammar refuses it with INVALID_COMMAND before any
    // quote exists (bridge-p14b4-cast-class G2), so it can no longer be the
    // ENGINE-refused, quoted-yet-noncommittable variant this case needs. That
    // purpose is kept with the count-only P3 family, which the wire still
    // enumerates and promiseFeasibility still refuses ("not offered in this
    // slice"); the two lawful seat classes join as projection 47's new material
    // field. Every variant must still mint its own opaque identity and leave the
    // session truth untouched.
    const engineRefused: Payload = { ...base, promise: { ...base.promise!, family: 'DIRECTING_COUNT' } }
    const variants: Payload[] = [base,
      engineRefused,
      { ...base, promise: { ...base.promise!, family: 'LEAD_OR_SIGNIFICANT_ROLE_COUNT', seatClass: 'lead' } },
      { ...base, promise: { ...base.promise!, family: 'LEAD_OR_SIGNIFICANT_ROLE_COUNT', seatClass: 'leadOrAntagonist' } },
      { ...base, promise: { ...base.promise!, count: 2 } },
      { ...base, promise: { ...base.promise!, windowStartWeek: 53 } },
      { ...base, promise: { ...base.promise!, dueWeekExclusive: 93 } }]
    const before = truth(session)
    const responses = variants.map((draft, index) => quote(session, draft, `quote-material-${index}`))
    const ids = responses.map((response) => response.quote.intentId)
    expect(new Set(ids).size).toBe(variants.length)
    expect(responses[1]!.quote.ok).toBe(false)
    expect(responses[1]!.quote.promise).toMatchObject({ ok: false, classification: 'IMPOSSIBLE',
      message: 'not offerable: a directing promise is not offered in this slice' })
    expect(truth(session)).toEqual(before)
  })

  it('conversion retains canonical values, including nested promise, after the caller changes its object', () => {
    const { state, talentId } = fixture()
    const wire = payload(talentId)
    const canonical = playerProposalDraft(state, wire)
    const values = structuredClone(canonical)
    const conversion = marketProposalDraftToEngine(state, canonical)
    if (!conversion.ok) throw new Error(conversion.error)
    wire.promise!.count = 999
    wire.promise!.dueWeekExclusive = 999
    expect(canonical).toEqual(values)
    expect(conversion.draft.promise).not.toBe(canonical.promise)
    canonical.promise!.count = 888
    canonical.promise!.windowStartWeek = 0
    canonical.promise!.dueWeekExclusive = 888
    canonical.verb = 'withdraw'
    canonical.talentId = 'unknown-person'
    canonical.issuerStudioId = 'not-the-player'
    expect(conversion.draft).toEqual(values)
    expect(conversion.draft).not.toBe(canonical)
    expect(conversion.draft.promise).not.toBe(wire.promise)
    const result = conversion.apply(state)
    expect(result.ok).toBe(true)
    if (!result.ok) throw new Error(result.error)
    expect(attachedOwn(result.next, talentId)).toMatchObject({ predicate: { count: 1 }, dueWeekExclusive: 92 })
  })

  it('the session pending quote retains values rather than its caller-owned mutable draft', () => {
    const { state, talentId } = fixture()
    const session = new BridgeSession(state, 'b3-pending-values')
    const wire = payload(talentId)
    const quoted = quote(session, wire, 'quote-before-caller-edit')
    expect(quoted.quote.ok).toBe(true)
    const quotedValues = structuredClone(quoted.quote)
    wire.promise!.count = 999
    wire.promise!.windowStartWeek = 0
    wire.promise!.dueWeekExclusive = 999
    wire.promise!.family = 'DIRECTING_COUNT'
    wire.premiumTier = 1
    wire.termWeeks = 208
    const result = session.command(command(session, quoted.quote.intentId, 'commit-original-values'))
    expect(result.accepted).toBe(true)
    expect(quoted.quote).toEqual(quotedValues)
    expect(currentOwn(session.gameState, talentId)).toMatchObject({ termWeeks: 52, premiumTier: 1.25 })
    expect(attachedOwn(session.gameState, talentId)).toMatchObject({ family: 'APPEARANCE_COUNT', predicate: { count: 1 },
      windowStartWeek: 52, dueWeekExclusive: 92 })
  })

  it('base proposals without a promise still commit without appending any promise', () => {
    const { state, talentId } = fixture()
    const session = new BridgeSession(state, 'b3-base-proposal')
    const draft: Payload = { verb: 'propose', talentId, termWeeks: 52, premiumTier: 1.25 }
    const before = structuredClone(state)
    const response = quote(session, draft, 'quote-no-promise')
    expect(response.quote).toMatchObject({ ok: true, promise: null })
    expect(session.command(command(session, response.quote.intentId, 'commit-no-promise')).accepted).toBe(true)
    expect(currentOwn(session.gameState, talentId).promises).toEqual([])
    expect(session.gameState.promises).toEqual(before.promises)
    expect(session.gameState.studio.cash).toBe(before.studio.cash)
    expect(session.stateRevision).toBe(1)
  })
})

describe('P14B.3: whole-quote refusal and current-state atomicity', () => {
  const refused = [
    { name: 'FRAGILE existing one-path capacity', values: { count: 2 }, classification: 'FRAGILE' },
    { name: 'IMPOSSIBLE count', values: { count: 999 }, classification: 'IMPOSSIBLE' },
    { name: 'lower contract-window edge', values: { windowStartWeek: 51 }, classification: 'IMPOSSIBLE' },
    { name: 'upper contract-window edge', values: { dueWeekExclusive: 105 }, classification: 'IMPOSSIBLE' },
  ] as const
  it.each(refused)('$name: accepted noncommittable answer retains nested verdict; no registered intent or partial commit', ({ values, classification }) => {
    const { state, talentId } = fixture()
    const session = new BridgeSession(state, `b3-refusal-${classification}-${JSON.stringify(values)}`)
    saveSlot(session)
    const draft = payload(talentId)
    draft.promise = { ...draft.promise!, ...values }
    const expected = feasibilityAfterRealBaseRevision(state, draft)
    expect(expected.classification).toBe(classification) // independent fixture precondition
    const before = truth(session)
    const response = quote(session, draft, 'quote-refused')
    expect(response.quote.ok).toBe(false)
    expect(response.quote.promise).toEqual({ ok: false, classification, message: `not offerable: ${expected.bottleneck}` })
    // This is promise feasibility, not an invented/unrelated base-refusal enum.
    expect(response.quote.refusal).toBeNull()
    expect(truth(session)).toEqual(before)
    const attempted = session.command(command(session, response.quote.intentId, 'attempt-refused-intent'))
    expect(attempted).toMatchObject({ accepted: false, reasonCode: 'INTENT_NOT_AVAILABLE' })
    expect(truth(session)).toEqual(before)
    const conversion = marketProposalDraftToEngine(state, playerProposalDraft(state, draft))
    if (!conversion.ok) throw new Error(conversion.error)
    const stateBytes = JSON.stringify(state)
    const applied = conversion.apply(state)
    expect(applied.ok).toBe(false)
    expect(applied).not.toHaveProperty('next')
    expect(JSON.stringify(state)).toBe(stateBytes)
  })

  it('direct apply rechecks CURRENT competing reservations, even if its prior quote was offerable', () => {
    const { state, talentId } = fixture()
    const conversion = marketProposalDraftToEngine(state, playerProposalDraft(state, payload(talentId)))
    if (!conversion.ok) throw new Error(conversion.error)
    expect(conversion.promise?.classification).toBe('REASONABLY_ACHIEVABLE')
    const rival = state.hollywood!.identities.find((s) => s.role === 'rival' && s.enteredWeek !== null)!.studioId
    let changed = submitProposal(state, { talentId, issuerStudioId: rival, termWeeks: 52, premiumTier: 1 })
    changed = attachPromise(changed, talentId, rival, { family: 'APPEARANCE_COUNT', predicate: { count: 1 }, windowStartWeek: 52, dueWeekExclusive: 92 })
    expect(feasibilityAfterRealBaseRevision(changed, payload(talentId)).classification).toBe('FRAGILE')
    const bytes = JSON.stringify(changed)
    const outcome = conversion.apply(changed)
    expect(outcome.ok).toBe(false)
    expect(outcome).not.toHaveProperty('next')
    expect(JSON.stringify(changed)).toBe(bytes)
  })

  it('malformed wire input and a forged issuer are rejected before any historical fact exists', () => {
    const { state, talentId } = fixture()
    const session = new BridgeSession(state, 'b3-malformed')
    const request = quoteRequest(session, payload(talentId), 'malformed')
    const before = truth(session)
    expect(() => parseWireValue(BRIDGE_SCHEMA.$defs.StudioBridgeQuoteRequest,
      { ...request, draft: { ...request.draft, issuerStudioId: 'rival-injected-by-client' } })).toThrow()
    expect(() => parseWireValue(BRIDGE_SCHEMA.$defs.StudioBridgeQuoteRequest,
      { ...request, draft: { ...request.draft, promise: { ...request.draft.promise!, count: 0 } } })).toThrow()
    expect(truth(session)).toEqual(before)
    const conversion = marketProposalDraftToEngine(state, { ...playerProposalDraft(state, payload(talentId)), talentId: 'unknown-person' })
    expect(conversion.ok).toBe(false)
    expect(truth(session)).toEqual(before)
  })
})

describe('P14B.3: revise, remove, withdraw retain abandoned evidence without phantom seats', () => {
  it('replacement feasibility uses the real cleared intermediate proposal; removal/withdrawal mint no false outcome', () => {
    const { state, talentId } = fixture()
    const session = new BridgeSession(state, 'b3-revisions')
    const beforeMoney = { cash: state.studio.cash, ledger: structuredClone(state.ledger), rng: state.rngState }
    const originalDrivers = trustDrivers(state, talentId, player(state), state.market.tick)
    const first = quote(session, payload(talentId), 'quote-first')
    expect(session.command(command(session, first.quote.intentId, 'commit-first')).accepted).toBe(true)
    const old = structuredClone(attachedOwn(session.gameState, talentId))
    const firstDigest = currentOwn(session.gameState, talentId).digest
    const revised = payload(talentId); revised.verb = 'revise'; revised.promise!.dueWeekExclusive = 93
    const q = quote(session, revised, 'quote-replacement')
    expect(q.quote).toMatchObject({ ok: true, promise: { ok: true, classification: 'REASONABLY_ACHIEVABLE' } })
    expect(session.command(command(session, q.quote.intentId, 'commit-replacement')).accepted).toBe(true)
    expect(session.stateRevision).toBe(2)
    const replacement = structuredClone(attachedOwn(session.gameState, talentId))
    expect(replacement.promiseId).not.toBe(old.promiseId)
    expect(replacement.dueWeekExclusive).toBe(93)
    expect(currentOwn(session.gameState, talentId).digest).not.toBe(firstDigest)
    expect(session.gameState.promises.find((p) => p.promiseId === old.promiseId)).toEqual(old)
    const roots = structuredClone(session.gameState.promises)
    const remove: Payload = { verb: 'revise', talentId, termWeeks: 52, premiumTier: 1.25 }
    const removeQuote = quote(session, remove, 'quote-remove')
    expect(removeQuote.quote.promise).toBeNull()
    expect(session.command(command(session, removeQuote.quote.intentId, 'commit-remove')).accepted).toBe(true)
    expect(currentOwn(session.gameState, talentId).promises).toEqual([])
    expect(session.gameState.promises).toEqual(roots)
    const withdrawal = quote(session, { verb: 'withdraw', talentId, termWeeks: null, premiumTier: null }, 'quote-withdraw')
    expect(session.command(command(session, withdrawal.quote.intentId, 'commit-withdraw')).accepted).toBe(true)
    expect(session.stateRevision).toBe(4)
    expect(currentProposals(session.gameState, talentId).some((p) => p.issuerStudioId === player(state))).toBe(false)
    expect(session.gameState.promises).toEqual(roots)
    expect(session.gameState.talentMarket.receipts.some((r) => r.talentId === talentId && r.kind === 'promiseOutcome')).toBe(false)
    expect(trustDrivers(session.gameState, talentId, player(state), state.market.tick)).toEqual(originalDrivers)
    expect(promiseRowsForPerson(session.gameState, talentId, player(state))).toEqual([])
    const next = quote(session, payload(talentId), 'quote-after-withdraw')
    expect(next.quote).toMatchObject({ ok: true, promise: { classification: 'REASONABLY_ACHIEVABLE' } })
    expect(session.command(command(session, next.quote.intentId, 'commit-after-withdraw')).accepted).toBe(true)
    expect(session.stateRevision).toBe(5)
    expect(session.gameState.promises.slice(0, roots.length)).toEqual(roots)
    expect(session.gameState.studio.cash).toBe(beforeMoney.cash)
    expect(session.gameState.ledger).toEqual(beforeMoney.ledger)
    expect(session.gameState.rngState).toBe(beforeMoney.rng)
    const saved = saveSlot(session, 'save-abandoned-evidence')
    expect(validateSaveV30(JSON.parse(saved)).state.promises).toEqual(session.gameState.promises)
  })
})

describe('P14B.3: session/revision/intent identity and isolation', () => {
  it('wrong-session/stale envelopes, same-command replay and superseded intents never duplicate attachment', () => {
    const { state, talentId } = fixture()
    const session = new BridgeSession(state, 'b3-envelopes')
    const before = truth(session)
    const request = quoteRequest(session, payload(talentId), 'quote-envelope')
    expect(session.quote({ ...request, sessionId: 'other-session' })).toMatchObject({ accepted: false, reasonCode: 'SESSION_MISMATCH' })
    expect(session.quote({ ...request, commandId: 'quote-stale', expectedStateRevision: 99 })).toMatchObject({ accepted: false, reasonCode: 'STALE_REVISION' })
    expect(truth(session)).toEqual(before)
    const quoted = quote(session, payload(talentId), 'quote-current')
    const submit = command(session, quoted.quote.intentId, 'single-command')
    expect(session.command({ ...submit, sessionId: 'other-session' })).toMatchObject({ accepted: false, reasonCode: 'SESSION_MISMATCH' })
    expect(truth(session)).toEqual(before)
    const accepted = session.command(submit)
    expect(accepted.accepted).toBe(true)
    const after = truth(session)
    expect(session.command(submit)).toEqual(accepted)
    expect(truth(session)).toEqual(after)
    expect(session.command(command(session, quoted.quote.intentId, 'fresh-command-stale-revision', 0)))
      .toMatchObject({ accepted: false, reasonCode: 'STALE_REVISION' })
    expect(session.command(command(session, quoted.quote.intentId, 'fresh-command-expired-intent')))
      .toMatchObject({ accepted: false, reasonCode: 'INTENT_NOT_AVAILABLE' })
    expect(session.command(command(session, 'not-the-original-intent', submit.commandId)))
      .toMatchObject({ accepted: false, reasonCode: 'COMMAND_ID_REUSE' })
    expect(truth(session)).toEqual(after)
    expect(session.gameState.promises).toHaveLength(state.promises.length + 1)
  })

  it('the oldest of exactly 16 distinct offerable quotes remains committable in a fresh session', () => {
    const { state, talentId } = fixture()
    const session = new BridgeSession(state, 'b3-exactly16')
    const before = truth(session)
    const ids: string[] = []
    for (let index = 0; index < 16; index++) {
      const draft = payload(talentId); draft.promise!.dueWeekExclusive = 80 + index
      const response = quote(session, draft, `quote-exact16-${index}`)
      expect(response.quote.ok).toBe(true)
      ids.push(response.quote.intentId)
    }
    expect(new Set(ids).size).toBe(16)
    expect(truth(session)).toEqual(before)
    expect(session.command(command(session, ids[0]!, 'commit-oldest-of16')).accepted).toBe(true)
    expect(attachedOwn(session.gameState, talentId).dueWeekExclusive).toBe(80)
    expect(session.gameState.promises).toHaveLength(state.promises.length + 1)
    expect(session.stateRevision).toBe(1)
  }, 60_000)

  it('the 17th distinct quote expires the oldest pending quote, while the newest still attaches once', () => {
    const { state, talentId } = fixture()
    const session = new BridgeSession(state, 'b3-bound16')
    const before = truth(session)
    const ids: string[] = []
    for (let index = 0; index < 17; index++) {
      const draft = payload(talentId); draft.promise!.dueWeekExclusive = 80 + index
      const response = quote(session, draft, `quote-cap-${index}`)
      expect(response.quote.ok).toBe(true)
      ids.push(response.quote.intentId)
    }
    expect(new Set(ids).size).toBe(17)
    expect(truth(session)).toEqual(before)
    expect(session.command(command(session, ids[0]!, 'commit-evicted'))).toMatchObject({ accepted: false, reasonCode: 'INTENT_NOT_AVAILABLE' })
    expect(truth(session)).toEqual(before)
    expect(session.command(command(session, ids[16]!, 'commit-newest')).accepted).toBe(true)
    expect(attachedOwn(session.gameState, talentId).dueWeekExclusive).toBe(96)
    expect(session.stateRevision).toBe(1)
  }, 60_000)

  it('same-seed/same-person sessions do not share quote authority, mutable drafts or committed state', () => {
    const { state, talentId } = fixture()
    const a = new BridgeSession(structuredClone(state), 'b3-session-a')
    const b = new BridgeSession(structuredClone(state), 'b3-session-b')
    const aBefore = truth(a), bBefore = truth(b)
    const draft = payload(talentId)
    const qa = quote(a, draft, 'quote-only-a')
    expect(b.command(command(b, qa.quote.intentId, 'borrow-a-intent'))).toMatchObject({ accepted: false, reasonCode: 'INTENT_NOT_AVAILABLE' })
    expect(truth(a)).toEqual(aBefore)
    expect(truth(b)).toEqual(bBefore)
    draft.promise!.count = 999
    expect(a.command(command(a, qa.quote.intentId, 'commit-a-retained-values')).accepted).toBe(true)
    expect(attachedOwn(a.gameState, talentId).predicate.count).toBe(1)
    expect(truth(b)).toEqual(bBefore)
    const qb = quote(b, payload(talentId), 'quote-b-for-itself')
    expect(qb.quote.ok).toBe(true)
    expect(b.command(command(b, qb.quote.intentId, 'commit-b-own-quote')).accepted).toBe(true)
    expect(b.gameState).toEqual(a.gameState)
    expect(b.gameState).not.toBe(a.gameState)
    expect(b.gameState.promises).not.toBe(a.gameState.promises)
  })

  it('load and process restart discard pending quote authorization without inventing promises', () => {
    const { state, talentId } = fixture()
    const session = new BridgeSession(state, 'b3-load-invalidation')
    const save = saveSlot(session)
    const pending = quote(session, payload(talentId), 'quote-before-load')
    const restarted = BridgeSession.fromSaveJson(save, 'b3-restarted')
    expect(restarted.command(command(restarted, pending.quote.intentId, 'commit-unrestored-quote')))
      .toMatchObject({ accepted: false, reasonCode: 'INTENT_NOT_AVAILABLE' })
    expect(restarted.gameState.promises).toEqual(state.promises)
    expect(session.load(control(session, 'reload-slot')).accepted).toBe(true)
    expect(session.stateRevision).toBe(1)
    const afterLoad = truth(session)
    expect(session.command(command(session, pending.quote.intentId, 'commit-before-load-quote')))
      .toMatchObject({ accepted: false, reasonCode: 'INTENT_NOT_AVAILABLE' })
    expect(truth(session)).toEqual(afterLoad)
    expect(session.gameState.promises).toEqual(state.promises)
  })
})

describe('P14B.3: real settlement/outcome, V29 and B2 public/private carriers', () => {
  it('quote→commit→real winning expiry binds; due-week BROKEN survives validated reload and exact public receipt join', () => {
    const { state, talentId } = fixture()
    const rival = state.hollywood!.identities.find((s) => s.role === 'rival' && s.enteredWeek !== null)!.studioId
    let input = submitProposal(state, { talentId, issuerStudioId: rival, termWeeks: 52, premiumTier: 1 })
    input = attachPromise(input, talentId, rival, { family: 'APPEARANCE_COUNT', predicate: { count: 999 }, windowStartWeek: 93, dueWeekExclusive: 104 })
    const rivalRoot = structuredClone(input.promises.at(-1)!)
    // Explicit staging-only rival fixture; disjoint from own[52,92), never
    // labelled a naturally offerable rival proposal or a historical fixture.
    expect(rivalRoot.feasibilityReceipt.classification).toBe('IMPOSSIBLE')
    const session = new BridgeSession(input, 'b3-outcome')
    const q = quote(session, payload(talentId), 'quote-to-outcome')
    expect(q.quote.ok).toBe(true)
    expect(session.command(command(session, q.quote.intentId, 'commit-to-outcome')).accepted).toBe(true)
    const minted = structuredClone(attachedOwn(session.gameState, talentId))
    expect(marketCaseProjection(session.gameState, talentId, player(input))!.proposals.find((p) => p.issuerStudioId === rival)!.promise).toBe('UNKNOWN')
    const settled = advanceTo(session.gameState, 52)
    const bound = settled.promises.find((p) => p.promiseId === minted.promiseId)!
    expect(bound.contractId).not.toBeNull()
    expect(bound.feasibilityReceipt).toMatchObject({ classification: 'REASONABLY_ACHIEVABLE', week: 52 })
    expect(settled.hollywood!.employment.find((e) => e.contractId === bound.contractId))
      .toMatchObject({ studioId: player(settled), terms: { talentId, startWeek: 52 } })
    expect(settled.talentMarket.receipts.filter((r) => r.talentId === talentId && r.kind === 'settled'))
      .toEqual([expect.objectContaining({ studioId: player(settled), week: 52 })])
    expect(currentProposals(settled, talentId)).toEqual([])
    expect(settled.promises.find((p) => p.promiseId === rivalRoot.promiseId)).toEqual(rivalRoot)
    const outcome = advanceTo(settled, minted.dueWeekExclusive)
    const broken = outcome.promises.find((p) => p.promiseId === minted.promiseId)!
    expect(broken).toMatchObject({ outcome: 'BROKEN', outcomeWeek: 92, progress: 0, evidenceRefs: [], contractId: bound.contractId })
    const receipt = outcome.talentMarket.receipts.find((r) => r.eventId === broken.outcomeEventId)!
    expect(receipt).toMatchObject({ kind: 'promiseOutcome', week: 92, talentId, studioId: player(outcome) })
    const completed = new BridgeSession(outcome, 'b3-outcome-save')
    const saved = saveSlot(completed)
    const validated = validateSaveV30(JSON.parse(saved))
    expect(LIVE_SAVE_VERSION).toBe(30)
    expect(PROJECTION_VERSION).toBe(47)
    expect(validated.saveVersion).toBe(30)
    const reloaded = BridgeSession.fromSaveJson(saved, 'b3-outcome-reloaded')
    const read = (world: GameState) => ({ trust: trustBlockFor(world, talentId, player(world)),
      own: promiseRowsForPerson(world, talentId, player(world)), foreign: promiseRowsForPerson(world, talentId, rival),
      profile: peopleProjection(world).profiles.find((p) => p.talentId === talentId),
      market: marketPage(world, { view: 'market', targetId: talentId }) })
    const before = read(outcome), after = read(reloaded.gameState)
    expect(after).toEqual(before)
    // P14B.4 (projection 47): the nullable `seatClass` rides every history row; a count-only P1 reads null.
    expect(before.own).toEqual([{ promiseId: broken.promiseId, family: 'APPEARANCE_COUNT', count: 1, seatClass: null,
      windowStartWeek: 52, dueWeekExclusive: 92, contractId: broken.contractId, outcome: 'BROKEN',
      outcomeWeek: 92, outcomeCause: broken.outcomeCause }])
    expect(before.foreign).toEqual([]) // rival sees no player-owned private history; its losing draft is unbound
    // The public trust DTO carries kind/week/reason, not a private promise ID.
    expect(before.trust.drivers.filter((d) => d.kind === 'promiseBroken'))
      .toEqual([expect.objectContaining({ week: broken.outcomeWeek, positive: false, reason: 'broke a promise' })])
    const pulse = (world: GameState) => {
      const page = (index: number) => industryPage(world, 'b3-pulse', 0, { protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID,
        sessionId: 'b3-pulse', requestId: `pulse-${index}`, expectedStateRevision: 0, type: 'industryQuery', view: 'pulse', targetId: null,
        page: index, pageSize: 50, lane: 'recent', period: 'all' })
      const first = page(0), rows = [...first.activities]
      expect(first.pageCount).toBeLessThan(1000)
      for (let index = 1; index < first.pageCount; index++) rows.push(...page(index).activities)
      expect(rows).toHaveLength(first.totalRows)
      return rows
    }
    const publicRows = pulse(outcome).filter((r) => r.eventId === receipt.eventId)
    expect(publicRows).toHaveLength(1)
    expect(publicRows[0]).toMatchObject({ outcomeKind: 'promiseBroken', week: 92, talentId, studioId: player(outcome), detail: receipt.reasons.join(' ') })
    for (const field of ['family', 'count', 'predicate', 'windowStartWeek', 'dueWeekExclusive', 'classification', 'feasibilityReceipt']) {
      expect(publicRows[0]).not.toHaveProperty(field)
    }
    expect(pulse(reloaded.gameState)).toEqual(pulse(outcome))
    expect(reloaded.gameState.promises).toEqual(outcome.promises)
  }, 60_000)
})
