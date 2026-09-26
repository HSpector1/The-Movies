// Independent 875 RM-D/E/F/G. Real old corpus, live engine discovery, public session verbs.
import { describe, expect, it } from 'vitest'
import { BridgeSession } from '../bridge/session.ts'
import { PROTOCOL_VERSION, SCHEMA_ID, validateQuote } from '../bridge/protocol.ts'
import { BRIDGE_SCHEMA, type BridgeMarketProposalDraftPayload } from '../bridge/schema/bridge-schema.ts'
import { parseWireValue } from '../bridge/schema/runtime.ts'
import { canonicalJson } from '../bridge/schema/canonical.ts'
import { decodeBridgeRuntimeCheckpoint, encodeBridgeRuntimeCheckpoint } from '../bridge/runtime-checkpoint.ts'
import { marketPage } from '../bridge/market.ts'
import { marketCaseProjection, peopleProjection } from '../bridge/people.ts'
import { personWorldRoute } from '../bridge/world.ts'
import { marketProposalDraftToEngine, playerProposalDraft } from '../bridge/contract.ts'
import { applyActions } from '../src/core/actions.js'
import { retirementRecordFor } from '../src/core/careerLifecycle.js'
import { caseForTalent, currentProposals, openMarketCaseFor, playerOffer, submitProposal } from '../src/core/talentMarket.js'
import { TUNING } from '../src/core/tuning.js'
import { AXES, admitted, advanceTo, bytes, extensionWorld, owner } from './helpers/p14c2rm-fixtures.js'
import { c2cFixture } from './helpers/p14c2c-fixtures.js'

type ExtensionFields = { variant: 'expiry' | 'retirementExtension'; soleIssuerStudioId: string | null;
  retirementExtension: null | { issuerStudioId: string; viewerCanOffer: boolean; requiredTermWeeks: number;
    startWeek: number; endWeekExclusive: number } }
const header = (session: BridgeSession, commandId: string) => ({ protocolVersion: PROTOCOL_VERSION,
  schemaId: SCHEMA_ID, sessionId: session.sessionId, commandId, expectedStateRevision: session.stateRevision })
function quote(session: BridgeSession, commandId: string, draft: BridgeMarketProposalDraftPayload) {
  const response = session.quote({ ...header(session, commandId), type: 'quoteMarketProposal', draft })
  expect(response.accepted, `875 public quote ${commandId}: ${JSON.stringify(response)}`).toBe(true)
  if (!response.accepted) throw new Error(response.message)
  expect(parseWireValue(BRIDGE_SCHEMA.$defs.StudioBridgeQuoteResponse, response)).toEqual(response)
  if (response.quote.kind !== 'marketProposalAction') throw new Error('Wrong quote family')
  return response.quote
}
function commit(session: BridgeSession, commandId: string, intentId: string) {
  const request = { ...header(session, commandId), type: 'submitIntent' as const, payload: { intentId } }
  const response = session.command(request)
  expect(response.accepted, `875 public commit ${commandId}`).toBe(true)
  return { request, response }
}
function refuse(session: BridgeSession, commandId: string, draft: BridgeMarketProposalDraftPayload) {
  const before = bytes(session.gameState), revision = session.stateRevision
  const response = session.quote({ ...header(session, commandId), type: 'quoteMarketProposal', draft })
  expect(response.accepted && response.quote.ok, `refusal ${commandId}`).toBe(false)
  expect(bytes(session.gameState)).toBe(before)
  expect(session.stateRevision).toBe(revision)
  return response
}

describe('C.2-RM discovered one-issuer extension through every existing reader', () => {
  it.each(['gap', 'exact'] as const)('%s real case publishes one exact opportunity, shared across profile, list, detail and world route', axis => {
    const facts = AXES[axis], state = extensionWorld(axis), before = bytes(state)
    const coreCase = openMarketCaseFor(state, facts.personId)
    expect(coreCase, 'fixture premise: natural discovery').toMatchObject({ variant: 'retirementExtension' })
    expect(caseForTalent(state, facts.personId)?.decisionWeek, 'fixture premise: derived decision boundary').toBe(facts.decision)
    const detail = marketCaseProjection(state, facts.personId, owner(state))
    expect(detail, '875 extension detail must be discoverable').not.toBeNull()
    expect(detail as unknown as ExtensionFields).toMatchObject({ variant: 'retirementExtension',
      soleIssuerStudioId: facts.issuer, retirementExtension: { issuerStudioId: facts.issuer,
        viewerCanOffer: true, requiredTermWeeks: facts.term, startWeek: facts.decision, endWeekExclusive: facts.effective + 52 } })
    const market = marketPage(state, { view: 'market', targetId: facts.personId })
    const rows = [...market.cases.renewalWindow, ...market.cases.settling]
    expect(rows.filter(row => row.talentId === facts.personId)).toHaveLength(1)
    expect(rows.find(row => row.talentId === facts.personId) as unknown as ExtensionFields).toMatchObject({
      variant: 'retirementExtension', soleIssuerStudioId: facts.issuer, retirementExtension: (detail as unknown as ExtensionFields).retirementExtension })
    expect(market.selected).toMatchObject({ marketCase: detail })
    expect(peopleProjection(state).profiles.find(row => row.talentId === facts.personId)?.marketCase).toEqual(detail)
    expect(personWorldRoute(state, facts.personId, false)).toMatchObject({ caseRef: { targetId: facts.personId } })
    expect(personWorldRoute(state, facts.personId, false).statusLine).toMatch(/final extension/i)
    expect(market.attention.filter(row => row.talentId === facts.personId).map(row => String(row.cause))).toContain('retirementExtensionOpen')
    expect(market.attention.filter(row => row.talentId === facts.personId).map(row => String(row.cause))).not.toContain('newCompetingProposal')
    expect(bytes(state)).toBe(before)
  })

  it('rival extension is readable but read-only, with exact UNKNOWN figures and no own extension alert', () => {
    const facts = AXES.rival
    let state = extensionWorld('rival')
    // Actual sole issuer proposal; no fabricated proposal, promise or compensation.
    if (!currentProposals(state, facts.personId).some(row => row.issuerStudioId === facts.issuer)) {
      state = submitProposal(state, { talentId: facts.personId, issuerStudioId: facts.issuer, termWeeks: facts.term, premiumTier: 1.1 })
    }
    admitted(state)
    const detail = marketCaseProjection(state, facts.personId, owner(state))
    expect(detail).not.toBeNull()
    expect(detail as unknown as ExtensionFields).toMatchObject({ variant: 'retirementExtension',
      soleIssuerStudioId: facts.issuer, retirementExtension: { viewerCanOffer: false, requiredTermWeeks: 52 } })
    const proposal = detail!.proposals.find(row => row.issuerStudioId === facts.issuer)
    expect(proposal).toMatchObject({ disclosure: 'undisclosed', annualSalary: 'UNKNOWN', signingBonus: 'UNKNOWN',
      premiumTier: 'UNKNOWN', promise: 'UNKNOWN' })
    expect(marketPage(state, { view: 'market', targetId: facts.personId }).attention.filter(row =>
      row.talentId === facts.personId && String(row.cause) === 'retirementExtensionOpen')).toEqual([])
    refuse(new BridgeSession(state, 'c2rm-rival-read-only'), 'wrong-issuer', {
      verb: 'propose', talentId: facts.personId, termWeeks: 52, premiumTier: 1.25 })
  })
})

describe('C.2-RM exact public proposal commands', () => {
  it('a new extension never inherits a genuine earlier ordinary settlement explanation', () => {
    const f = c2cFixture()
    const prior = f.announced.talentMarket.receipts.find(row => row.talentId === f.actorId && row.kind === 'settled' && row.week === 52)
    expect(prior, 'history premise: actual earlier ordinary settlement').toBeDefined()
    expect(prior!.reasons.length).toBeGreaterThan(0)
    const open = admitted(advanceTo(f.announced, 144))
    expect(openMarketCaseFor(open, f.actorId)?.variant).toBe('retirementExtension')
    const expired = admitted(advanceTo(open, 156))
    const declined = admitted(advanceTo(submitProposal(open, { talentId: f.actorId,
      issuerStudioId: owner(open), termWeeks: 52, premiumTier: 1.05 }), 156))
    expect(caseForTalent(expired, f.actorId)?.status).toBe('expired')
    expect(caseForTalent(declined, f.actorId)?.status).toBe('declined')
    for (const state of [open, expired, declined]) {
      const detail = marketCaseProjection(state, f.actorId, owner(state))
      expect(detail).not.toBeNull()
      expect(detail!.settlementReasons, 'current extension owns no settled receipt').toEqual([])
      expect(marketPage(state, { view: 'market', targetId: f.actorId }).selected?.marketCase).toEqual(detail)
    }
    expect(marketPage(open, { view: 'market', targetId: f.actorId }).selected?.droppedReasons).toEqual([])
    // No claimed earlier own-drop control: this actual prior proposal won.
  })

  it.each(['gap', 'exact'] as const)('%s quote -> submit -> revise -> withdraw uses exact term and never charges before settlement', axis => {
    const facts = AXES[axis], session = new BridgeSession(extensionWorld(axis), `c2rm-${axis}-verbs`)
    const initial = bytes(session.gameState), cash = session.gameState.studio.cash, ledger = session.gameState.ledger
    const first = quote(session, 'quote-propose', { verb: 'propose', talentId: facts.personId, termWeeks: facts.term, premiumTier: 1.25 })
    expect(first).toMatchObject({ ok: true, termWeeks: facts.term, effectiveWeek: facts.decision, decisionWeek: facts.decision })
    expect(first.effectiveWeek! + first.termWeeks!).toBe(facts.effective + 52)
    expect(first.consequence).toMatch(/final extension/i)
    expect(bytes(session.gameState)).toBe(initial)
    const committed = commit(session, 'submit', first.intentId)
    expect(currentProposals(session.gameState, facts.personId).filter(row => row.issuerStudioId === facts.issuer)).toMatchObject([{ termWeeks: facts.term, premiumTier: 1.25 }])
    expect(session.gameState.studio.cash).toBe(cash)
    expect(session.gameState.ledger).toEqual(ledger)
    const afterSubmit = bytes(session.gameState)
    expect(canonicalJson(session.command(committed.request))).toBe(canonicalJson(committed.response))
    expect(bytes(session.gameState)).toBe(afterSubmit)
    const revision = session.stateRevision
    expect(session.command({ ...committed.request, commandId: 'fresh-id-stale-revision' })).toMatchObject({ accepted: false, reasonCode: 'STALE_REVISION' })
    expect(session.stateRevision).toBe(revision)
    const revised = quote(session, 'quote-revise', { verb: 'revise', talentId: facts.personId, termWeeks: facts.term, premiumTier: 1.1 })
    expect(revised.ok).toBe(true)
    commit(session, 'revise', revised.intentId)
    expect(currentProposals(session.gameState, facts.personId).filter(row => row.issuerStudioId === facts.issuer)).toMatchObject([{ termWeeks: facts.term, premiumTier: 1.1 }])
    expect(currentProposals(session.gameState, facts.personId).filter(row => row.issuerStudioId === facts.issuer)).toHaveLength(1)
    const withdrawal = quote(session, 'quote-withdraw', { verb: 'withdraw', talentId: facts.personId, termWeeks: null, premiumTier: null })
    expect(withdrawal.ok).toBe(true)
    commit(session, 'withdraw', withdrawal.intentId)
    expect(currentProposals(session.gameState, facts.personId).some(row => row.issuerStudioId === facts.issuer)).toBe(false)
    expect(session.gameState.studio.cash).toBe(cash)
    expect(session.gameState.ledger).toEqual(ledger)
    expect(session.command({ ...header(session, 'old-intent-current-revision'), type: 'submitIntent', payload: { intentId: first.intentId } }))
      .toMatchObject({ accepted: false, reasonCode: 'INTENT_NOT_AVAILABLE' })
  })

  it('wrong terms, no case, promises, ordinary off-catalogue terms and forged issuer are refused without state changes', () => {
    const facts = AXES.gap, session = new BridgeSession(extensionWorld(), 'c2rm-refusals')
    for (const termWeeks of [52, 57, 59, 104]) refuse(session, `wrong-${termWeeks}`, {
      verb: 'propose', talentId: facts.personId, termWeeks, premiumTier: 1.25 })
    refuse(session, 'no-employer-case', { verb: 'propose', talentId: 'authored-0001', termWeeks: 58, premiumTier: 1.25 })
    refuse(session, 'extension-promise', { verb: 'propose', talentId: facts.personId, termWeeks: 58, premiumTier: 1.25,
      promise: { family: 'APPEARANCE_COUNT', count: 1, windowStartWeek: 98, dueWeekExclusive: 156 } })
    const ordinary = new BridgeSession(extensionWorld('gap', 52), 'c2rm-ordinary-control')
    expect(openMarketCaseFor(ordinary.gameState, 'authored-0002')?.variant).toBe('expiry')
    refuse(ordinary, 'ordinary-off-catalogue', { verb: 'propose', talentId: 'authored-0002', termWeeks: 58, premiumTier: 1.25 })
    expect(quote(ordinary, 'ordinary-published', { verb: 'propose', talentId: 'authored-0002', termWeeks: 52, premiumTier: 1.25 }).ok).toBe(true)
    const before = bytes(session.gameState)
    const forgedDraft = { verb: 'propose' as const, talentId: facts.personId, termWeeks: 58,
      premiumTier: 1.25, issuerStudioId: 'another-studio' }
    //878: a direct typed session call bypasses the wire decoder; its extra field
    //was ignored safely, not accepted as authority. Exercise the actual boundary.
    expect(validateQuote({ ...header(session, 'forged-issuer'), type: 'quoteMarketProposal', draft: forgedDraft }))
      .toMatchObject({ ok: false, reasonCode: 'INVALID_COMMAND' })
    expect(playerProposalDraft(session.gameState, forgedDraft).issuerStudioId).toBe(facts.issuer)
    expect(bytes(session.gameState)).toBe(before)
  })

  it('a real58-week proposal settles once at98, survives save/runtime replay, and never opens a second opportunity', () => {
    const facts = AXES.gap, session = new BridgeSession(extensionWorld(), 'c2rm-gap-settlement')
    const drafted = quote(session, 'quote58', { verb: 'propose', talentId: facts.personId, termWeeks: 58, premiumTier: 1.1 })
    expect(drafted.ok).toBe(true)
    const submitted = commit(session, 'commit58', drafted.intentId)
    const restarted = BridgeSession.fromRuntimeCheckpoint(decodeBridgeRuntimeCheckpoint(encodeBridgeRuntimeCheckpoint(session.exportRuntimeCheckpoint())))
    expect(canonicalJson(restarted.command(submitted.request))).toBe(canonicalJson(submitted.response))
    expect(currentProposals(restarted.gameState, facts.personId)).toHaveLength(1)
    for (let week = facts.window; week < facts.decision; week++) {
      const intent = restarted.snapshot().availableIntents.find(row => row.kind === 'advanceWeek')
      expect(intent, `fixture premise: published advance at${week}`).toBeDefined()
      commit(restarted, `advance-${week}`, intent!.intentId)
    }
    const state = restarted.gameState
    expect(state.market.tick).toBe(98)
    expect(retirementRecordFor(state, facts.personId)).toMatchObject({ effectiveWeek: 156, extendedFromWeek: 104, extensionUsed: true })
    const actual = state.hollywood!.employment.find(row => row.terms.talentId === facts.personId && row.terms.startWeek === 98)
    expect(actual?.terms).toMatchObject({ termWeeks: 58, startWeek: 98, endWeekExclusive: 156 })
    const charges = state.ledger.filter(row => row.kind === 'signingBonus' && row.talentId === facts.personId && row.week >= 92)
    expect(charges).toHaveLength(1)
    expect(charges[0]!.week).toBe(98)
    const ask = playerOffer(state, facts.personId, 58, 98).annualSalary
    expect(-charges[0]!.amount).toBe(Math.round(Math.round(ask * 1.1) * TUNING.CONTRACT_SIGNING_BONUS_FRACTION))
    const detail = marketCaseProjection(state, facts.personId, owner(state))
    expect(detail as unknown as ExtensionFields).toMatchObject({ variant: 'retirementExtension', soleIssuerStudioId: facts.issuer, retirementExtension: null })
    expect(personWorldRoute(state, facts.personId, false).caseRef).toBeNull()
    refuse(restarted, 'second-extension', { verb: 'propose', talentId: facts.personId, termWeeks: 52, premiumTier: 1.25 })
    expect(openMarketCaseFor(advanceTo(admitted(state), 144), facts.personId)).toBeUndefined()
  })

  it('commit revalidation refuses a formerly valid quote after a lawful employer release', () => {
    const state = extensionWorld(), facts = AXES.gap
    const conversion = marketProposalDraftToEngine(state, { verb: 'propose', talentId: facts.personId,
      issuerStudioId: facts.issuer, termWeeks: 58, premiumTier: 1.1 })
    expect(conversion.ok).toBe(true)
    if (!conversion.ok) throw new Error(conversion.error)
    const released = applyActions(state, [{ kind: 'releaseTalent', talentId: facts.personId }]), before = bytes(released)
    expect(conversion.apply(released).ok).toBe(false)
    expect(bytes(released)).toBe(before)
  })

  it('SYNTHETIC cash-only whole-save variant has a fixed-term affordability remedy, not shortening', () => {
    const base = extensionWorld(), delta = -base.studio.cash
    const state = admitted({ ...base, studio: { ...base.studio, cash: 0 }, ledger: [...base.ledger,
      { week: base.market.tick, kind: 'overhead', amount: delta, note: 'C2RM explicit affordability test input' }] })
    const sheet = quote(new BridgeSession(state, 'c2rm-cash'), 'unaffordable58', {
      verb: 'propose', talentId: AXES.gap.personId, termWeeks: 58, premiumTier: 1.25 })
    expect(sheet).toMatchObject({ ok: false, affordable: false })
    expect(sheet.refusalRemedy).toBeTruthy()
    expect(sheet.refusalRemedy).not.toMatch(/shorter|shorten|short term/i)
    expect(sheet.refusalRemedy).toMatch(/compensation|cash|money|wait/i)
  })

  it.each(['expired', 'declined', 'invalidated'] as const)('real %s history retains variant and issuer without a fresh offer block', outcome => {
    const facts = AXES.gap
    let state = extensionWorld()
    if (outcome === 'declined') state = submitProposal(state, { talentId: facts.personId, issuerStudioId: facts.issuer, termWeeks: 58, premiumTier: 1.05 })
    if (outcome === 'invalidated') state = applyActions(state, [{ kind: 'releaseTalent', talentId: facts.personId }])
    state = advanceTo(state, 99)
    expect(state.talentMarket.cases.find(row => row.talentId === facts.personId && row.variant === 'retirementExtension')?.outcome,
      'fixture premise: actual terminal receipt').toBe(outcome)
    const detail = marketCaseProjection(state, facts.personId, owner(state))
    expect(detail as unknown as ExtensionFields).toMatchObject({ variant: 'retirementExtension', soleIssuerStudioId: facts.issuer, retirementExtension: null })
    const market = marketPage(state, { view: 'market', targetId: facts.personId })
    expect(market.cases.closed.rows.find(row => row.talentId === facts.personId)).toMatchObject({ outcome })
    expect(market.attention.filter(row => row.talentId === facts.personId && String(row.cause) === 'retirementExtensionOpen')).toEqual([])
  })
})
