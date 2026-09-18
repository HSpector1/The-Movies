// ── P14A.1-T3 bridge test 9 — the contested talent-market case reaches Unity
// through the Profile page (projection 42) ─────────────────────────────────
//
// Authority: docs/engineering/playability-launch-review/plans/P14-HEADLESS-PLAN.md
// (P14A.1 expansion — the Bridge bullet and test 9; the disclosure narrowing
// of `bridge/industry.ts` ≈239 / `bridge/people.ts` ≈516; the five Attention
// interrupt causes of companion §2.1.11), the landed engine
// (`src/core/talentMarket.ts`, Save V28: `{cases, proposals, receipts,
// representation: null, legacyTerminations}`; `underMarketCase`; the
// settlement), and the brief at /private/tmp/claude-501/
// -Users-zacheryspector-The-Movies-headless-program/
// 154fda95-524f-4734-9a1a-376fe09a0946/scratchpad/p14a1-bridge-test-brief.md
// (seven pin groups + AMENDMENTS: the player's own proposal row is the price
// RE-DERIVED at the read week through `proposalDraft`, never a stored copy).
//
// RED-BY-DESIGN, projection 41: the bridge does not yet publish PROJECTION_VERSION
// 42, a Contract case block, `marketProposalAction`, or any market-case fact.
// Every group below is expected RED.
//
// NOT-YET-EXISTING BINDINGS (imported from EXISTING host modules, per this
// repo's RED-first convention: Vite/esbuild binds a missing NAMED export to
// `undefined` rather than failing at module resolution — verified directly
// against this tree, 2026-09-18, via a disposable `vite-node` probe importing
// a deliberately-misspelled export from `bridge/people.ts`: the import
// resolved, `typeof` the missing binding was `undefined`, and calling it threw
// `TypeError: ... is not a function`, never a resolution error. Each binding
// below is therefore CALLED, not merely imported, in every group that needs
// it, so the RED cause is that exact call, never a coincidental regex or a
// vitest/harness error):
//   - `marketCaseProjection` from `../bridge/people.ts` — the profile-page
//     case-block / attention-row / disclosure / settlement DTO builder the
//     implementer will add alongside the existing `peopleProjection`.
//     Assumed signature: `marketCaseProjection(state, talentId, viewerStudioId,
//     week?) => { status; decisionWeek; decisionWeekLabel; proposals: {
//     issuerStudioId; termWeeks; effectiveWeek; premiumTier; annualSalary;
//     signingBonus }[]; attentionRows: { cause; talentId }[]; settlementReasons:
//     string[] } | null` (null outside a case). FIELD NAMES ARE INTERPRETATIONS
//     — no such DTO exists anywhere in this tree to copy from; only the fields
//     this file actually reads are asserted.
//   - `marketProposalDraftToEngine` from `../bridge/contract.ts` — the
//     `marketProposalAction` (propose/revise/withdraw) draft-to-engine
//     conversion, analogous in shape to the existing `contractDraftToEngine`.
//
// WHY THE SESSION-LEVEL quote()/command() PATTERN IS NOT EXERCISED DIRECTLY:
// `BridgeSession.quote()` (bridge/session.ts) dispatches on `request.type`
// through a fixed if/else chain with NO catch-all guard; an unrecognized
// `type` string (e.g. a hypothetical `'quoteMarketProposal'`) falls through
// to the FINAL `else` branch, which today is the CASTING handler — it would
// silently misinterpret a market-proposal draft as a casting draft and throw
// a confusing, unrelated casting error. That is exactly the "harness error /
// coincidental regex" this file's evidence run must not report as the RED
// cause. Pin group 3 below therefore exercises the draft-conversion entry
// point directly (`marketProposalDraftToEngine`), mirroring how the existing
// `tests/bridge-p10a-r1-contract-quote.test.ts` R6 case already calls
// `contractDraftToEngine` directly to reach the D-12 gate without routing
// through a session. The session-level stateRevision/STALE_REVISION wiring
// for this NEW intent kind is real, generic `BridgeSession` machinery
// (identical for every existing draft family) and is not independently
// re-pinned here once the entry point above lands.
//
// SCENARIO: reused verbatim from tests/p14a1-settlement.test.ts's own proven,
// GREEN, dominance-settled case (a fresh player 52-week contract, window opens
// week 40, decision week 52; the player proposes at premium tier 1.25, one
// entered rival at 1.0, same 52-week term — the player DOMINATES: at-least-as-
// good everywhere, incumbent). Reusing a proven scenario avoids re-deriving
// the still-open person-choice tie-break law (companion §2.1.7 HYPOTHESIS
// band edges) for facts this file does not need to settle.
//
// PREMISES NOT SATISFIED (named, not invented):
//   - Two of the five Attention causes are NOT independently exercised:
//     "decision week crossing the stop horizon" (the exact week-count
//     threshold is not read from companion §2.1.11 by this author and is not
//     guessed) and "terms revised after review" (whether "review" is a
//     persisted read-state or an inferred one is undecided by anything this
//     author has read). Both are named in the closed-set pin (group 4) rather
//     than silently dropped.
//   - The public preference descriptor (companion §2.1.7's priority-order /
//     preferred-term facts) has NO exported engine oracle — `priorityOrder`
//     and `preferredTerm` (src/core/talentMarket.ts) are private, and the
//     engine's own `caseDisclosure` DTO does not carry a preference field at
//     all. This file pins only that the case block exists for an open case
//     (group 2); it does not assert descriptor CONTENT.
//   - The settled-case "industry activity folds the two receipts into one
//     row" claim is pinned as ABSENT (group 6): the plan's A.1 scope does not
//     include it (A.2's Pulse projection does); this file asserts the CURRENT
//     two-separate-rows shape stays true after settlement, not that a folded
//     row will never exist.

import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { describe, expect, it } from 'vitest'
import { PROTOCOL_VERSION, SCHEMA_ID } from '../bridge/protocol.ts'
import { AVAILABLE_INTENT_KINDS, BRIDGE_SCHEMA, PROJECTION_VERSION } from '../bridge/schema/bridge-schema.ts'
import type { BridgeQuoteRequest } from '../bridge/schema/bridge-schema.ts'
import type { IndustryQuery } from '../bridge/schema/industry-schema.ts'
import { parseWireValue } from '../bridge/schema/runtime.ts'
import { peopleProjection, marketCaseProjection } from '../bridge/people.ts'
import { contractActionDecisions, marketProposalDraftToEngine } from '../bridge/contract.ts'
import { industryPage } from '../bridge/industry.ts'
import { BridgeSession } from '../bridge/session.ts'
import {
  activeContract, applyActions, campaignDate, canAfford, hiringMarketIds, renewalWindowOpen, tick,
} from '../src/core/index.js'
import type { GameState } from '../src/core/types.js'
import {
  caseDisclosure, caseForTalent, currentProposals, marketEligibility, proposalDraft, submitProposal, UNKNOWN,
} from '../src/core/talentMarket.js'
import { advanceTo, p13aGeneratedStudio } from '../src/harness/p13a/fixtures.js'

// ── fixtures ─────────────────────────────────────────────────────────────────

function signActor(state: GameState, termWeeks: number): { state: GameState; talentId: string } {
  const candidates = hiringMarketIds(state, 0)
  const actorId = candidates.map((id) => state.talent.find((t) => t.id === id)).find((t) => t?.role === 'actor')?.id
  if (actorId === undefined) throw new Error('fixture assumption failed: no actor in the week-0 hiring market')
  const signed = applyActions(state, [{ kind: 'signContract', talentId: actorId, termWeeks }])
  return { state: signed, talentId: actorId }
}

/** The proven dominance-settled scenario of tests/p14a1-settlement.test.ts,
 * reused so this file needs no new fact about the still-open tie-break law.
 * `rivalPremiumTier` defaults to the original 1.00 (every existing caller is
 * unaffected); group 5's re-expression passes a tier != 1.00 so the rival's
 * real figures are not coincidentally a public number (see that test). */
function openCaseWithBothProposals(seed: string, rivalPremiumTier = 1.0) {
  const { state: signed, talentId } = signActor(p13aGeneratedStudio(seed), 52)
  const atSubmission = advanceTo(signed, 45)
  const playerStudioId = atSubmission.hollywood!.playerStudioId
  const rivalStudioId = atSubmission.hollywood!.identities.find((s) => s.role === 'rival' && s.enteredWeek !== null)!.studioId
  let state = submitProposal(atSubmission, { talentId, issuerStudioId: playerStudioId, termWeeks: 52, premiumTier: 1.25 })
  state = submitProposal(state, { talentId, issuerStudioId: rivalStudioId, termWeeks: 52, premiumTier: rivalPremiumTier })
  return { state, talentId, playerStudioId, rivalStudioId }
}

const load = (relative: string) => gunzipSync(readFileSync(new URL(relative, import.meta.url))).toString('utf8')
function assertSha256(json: string, expected: string) {
  expect(createHash('sha256').update(json).digest('hex')).toBe(expected)
}
const V27_FIXTURES = {
  renewalWindow: { file: './fixtures/p13b/legacy-v27-renewal-window-456.json.gz', sha256: 'af659268eddcc78da0b893056ba97794a3ed0a159488cb3de36e155b3ec1fa3f', week: 456 },
}

function employmentQuery(sessionId: string, targetId: string): IndustryQuery {
  return { protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId, requestId: 'r-1', expectedStateRevision: 0, type: 'industryQuery', view: 'employment', targetId, page: 0, pageSize: 10, lane: 'recent', period: 'all' }
}

// ── group 1: PROJECTION_VERSION / schema $id / x-project-studio ─────────────

describe('group 1: PROJECTION_VERSION', () => {
  it('PROJECTION_VERSION is 45; the schema $id and x-project-studio.projectionVersion move with it', () => {
    expect(PROJECTION_VERSION).toBe(45)
    expect(BRIDGE_SCHEMA.$id).toBe(`urn:project-studio:bridge:protocol-${String(PROTOCOL_VERSION)}:projection-45`)
    expect(BRIDGE_SCHEMA['x-project-studio'].projectionVersion).toBe(45)
  })
})

// ── group 3: marketProposalAction / the accepted quote pattern ──────────────

describe('group 3: marketProposalAction (propose/revise/withdraw)', () => {
  it('is not yet a published intent kind', () => {
    expect(AVAILABLE_INTENT_KINDS).toContain('marketProposalAction')
  })

  it('drafts propose/revise/withdraw through the draft-to-engine conversion, with affordability via canAfford', () => {
    const { state, talentId, playerStudioId } = openCaseWithBothProposals('p14a1-bridge-proposal-draft')
    // NOT YET EXISTING: marketProposalDraftToEngine (see header). This call is
    // this test's RED cause today.
    const propose = marketProposalDraftToEngine(state, { verb: 'propose', talentId, issuerStudioId: playerStudioId, termWeeks: 52, premiumTier: 1.25 })
    expect(propose.ok).toBe(true)
    const revise = marketProposalDraftToEngine(state, { verb: 'revise', talentId, issuerStudioId: playerStudioId, termWeeks: 104, premiumTier: 1.25 })
    expect(revise.ok).toBe(true)
    const withdraw = marketProposalDraftToEngine(state, { verb: 'withdraw', talentId, issuerStudioId: playerStudioId })
    expect(withdraw.ok).toBe(true)
  })

  it('the profile\'s renew row does not yet surface underMarketCase once a case is open — the gap the case block must close', () => {
    const { state, talentId } = openCaseWithBothProposals('p14a1-bridge-stale-renew-row')
    // TODAY (projection 41): contractActionDecisions (bridge/contract.ts) does
    // not consult caseOpenForTalent, so this row still reads renewal as legal
    // even though the engine itself refuses the commit with underMarketCase
    // (P14A §2.1.3, src/core/actions.ts applyRenewContract). This is a REAL
    // assertion on the EXISTING exported function — no invented binding.
    const decision = contractActionDecisions(state, talentId)
    expect(decision.renewAvailable).toBe(false)
    expect(decision.renewReason ?? '').toMatch(/market case/i)
  })
})

// ── group 2: profile → Contract case block ───────────────────────────────────

describe('group 2: profile Contract case block', () => {
  it('publishes status, the DERIVED decision-week label, and one row per proposal — the player\'s own re-derived at the read week, the rival\'s premium/salary/bonus an explicit UNKNOWN marker', () => {
    const { state, talentId, playerStudioId, rivalStudioId } = openCaseWithBothProposals('p14a1-bridge-case-block')
    const view = caseForTalent(state, talentId, state.market.tick)!
    expect(view.status).toBe('proposals_open')
    const disclosure = caseDisclosure(state, talentId, playerStudioId, state.market.tick)

    // NOT YET EXISTING: marketCaseProjection (see header) — this test's RED cause.
    const block = marketCaseProjection(state, talentId, playerStudioId)!
    expect(block.status).toBe(view.status)
    expect(block.decisionWeek).toBe(view.decisionWeek)
    expect(block.decisionWeekLabel).toBe(campaignDate(view.decisionWeek).label)
    expect(block.proposals).toHaveLength(2)

    const mine = block.proposals.find((r) => r.issuerStudioId === playerStudioId)!
    const mineDisclosed = disclosure.proposals.find((r) => r.issuerStudioId === playerStudioId)!
    // AMENDMENT (a): the player's own row is the price RE-DERIVED at the read
    // week through the shared pricing entry, never a stored submission-week
    // quote — the engine's own caseDisclosure is the oracle for this fact.
    const redraft = proposalDraft(state, playerStudioId, talentId, 52, 1.25, state.market.tick)
    expect(mine.annualSalary).toBe(redraft.annualSalary)
    expect(mine.annualSalary).toBe(mineDisclosed.annualSalary)
    expect(mine.signingBonus).toBe(mineDisclosed.signingBonus)
    expect(mine.premiumTier).toBe(1.25)

    const theirs = block.proposals.find((r) => r.issuerStudioId === rivalStudioId)!
    const theirsDisclosed = disclosure.proposals.find((r) => r.issuerStudioId === rivalStudioId)!
    expect(theirs.termWeeks).toBe(theirsDisclosed.termWeeks)
    expect(theirs.effectiveWeek).toBe(theirsDisclosed.effectiveWeek)
    // Explicit UNKNOWN marker — never null, never omitted.
    expect(theirs.premiumTier).toBe(UNKNOWN)
    expect(theirs.annualSalary).toBe(UNKNOWN)
    expect(theirs.signingBonus).toBe(UNKNOWN)
    expect(JSON.stringify(theirs)).not.toMatch(/null/)
  })

  it('no case block outside a case', () => {
    const { state, rivalStudioId } = openCaseWithBothProposals('p14a1-bridge-no-case-block')
    const freeAgentOrUncontracted = state.talent.find((t) => activeContract(state, t.id) === undefined && caseForTalent(state, t.id, state.market.tick) === null)
    expect(freeAgentOrUncontracted).toBeDefined()
    // NOT YET EXISTING: marketCaseProjection — RED cause.
    expect(marketCaseProjection(state, freeAgentOrUncontracted!.id, rivalStudioId)).toBeNull()
  })
})

// ── group 4: attention rows — exactly the five interrupt causes ─────────────

const KNOWN_ATTENTION_CAUSES = ['decisionWeekNear', 'newCompetingProposal', 'termsRevised', 'settlementCompleted', 'proposalWouldFail'] as const

describe('group 4: attention rows', () => {
  it('a new competing proposal on a case the player has a proposal in', () => {
    const { state: signed, talentId } = signActor(p13aGeneratedStudio('p14a1-bridge-attention-competing'), 52)
    const at40 = advanceTo(signed, 40)
    const playerStudioId = at40.hollywood!.playerStudioId
    const rivalStudioId = at40.hollywood!.identities.find((s) => s.role === 'rival' && s.enteredWeek !== null)!.studioId
    const mineOnly = submitProposal(at40, { talentId, issuerStudioId: playerStudioId, termWeeks: 52, premiumTier: 1.25 })
    expect(currentProposals(mineOnly, talentId)).toHaveLength(1) // sanity: player-only before the rival appears
    const withRival = submitProposal(mineOnly, { talentId, issuerStudioId: rivalStudioId, termWeeks: 52, premiumTier: 1.0 })
    // NOT YET EXISTING: marketCaseProjection — RED cause.
    const block = marketCaseProjection(withRival, talentId, playerStudioId)!
    expect(block.attentionRows.some((r) => r.cause === 'newCompetingProposal')).toBe(true)
  })

  it('settlement completed', () => {
    const { state: preSettle, talentId, playerStudioId } = openCaseWithBothProposals('p14a1-bridge-attention-settled')
    let state = advanceTo(preSettle, 51)
    state = tick(state) // settles at week 52
    const view = caseForTalent(state, talentId, state.market.tick)!
    expect(view.status).toBe('settled')
    // NOT YET EXISTING: marketCaseProjection — RED cause.
    const block = marketCaseProjection(state, talentId, playerStudioId)!
    expect(block.attentionRows.some((r) => r.cause === 'settlementCompleted')).toBe(true)
  })

  it('a player proposal that would currently fail', () => {
    const { state, talentId, playerStudioId } = openCaseWithBothProposals('p14a1-bridge-attention-fail')
    const mine = currentProposals(state, talentId).find((p) => p.issuerStudioId === playerStudioId)!
    const broke: GameState = { ...state, studio: { ...state.studio, cash: 0 } }
    expect(canAfford(broke, mine.signingBonus).ok).toBe(false) // sanity: genuinely would fail now
    // NOT YET EXISTING: marketCaseProjection — RED cause.
    const block = marketCaseProjection(broke, talentId, playerStudioId)!
    expect(block.attentionRows.some((r) => r.cause === 'proposalWouldFail')).toBe(true)
  })

  it('restricted to exactly the five named causes, and nothing else on the profile route (two causes not independently exercised — see header premises)', () => {
    const { state, talentId, playerStudioId } = openCaseWithBothProposals('p14a1-bridge-attention-closed-set')
    // NOT YET EXISTING: marketCaseProjection — RED cause.
    const block = marketCaseProjection(state, talentId, playerStudioId)!
    for (const row of block.attentionRows) expect(KNOWN_ATTENTION_CAUSES).toContain(row.cause)
  })
})

// ── group 5: disclosure narrowing ────────────────────────────────────────────

describe('group 5: disclosure narrowing', () => {
  it('the case block\'s disclosed fields never leak the rival\'s real figures, from every serialization surface — a rival tier that is not otherwise a public figure', () => {
    // RE-EXPRESSED (P14A.1-T3, coordinator adjudication #2, projection-42 landing —
    // docs/engineering/playability-launch-review/evidence/p14a1-20260918/
    // 15-bridge-projection-42-GREEN.txt item 2): the ORIGINAL check compared against
    // the rival's premiumTier-1.00 figure, which is not a private number at all — at
    // tier 1.00 the rival's ask IS the shared public P10 market ask (`contractOffer`),
    // and on this fixture that exact number is the PLAYER'S OWN employee's published
    // contract salary (t-act-05, projection 19; `buildEmployment` is untouched by this
    // feature and was always going to publish it). The case block itself leaks nothing
    // (probed); the check must use a figure that is not otherwise public — the rival's
    // competing proposal at a tier != 1.00.
    const { state, talentId, playerStudioId, rivalStudioId } = openCaseWithBothProposals('p14a1-bridge-disclosure-leak', 1.1)
    const rivalDraft = proposalDraft(state, rivalStudioId, talentId, 52, 1.1, state.market.tick)
    const rivalRealAnnual = rivalDraft.annualSalary
    const rivalRealBonus = rivalDraft.signingBonus

    const block = marketCaseProjection(state, talentId, playerStudioId)!
    const blockJson = JSON.stringify(block)
    expect(blockJson).not.toContain(String(rivalRealAnnual))
    expect(blockJson).not.toContain(String(rivalRealBonus))
    const theirs = block.proposals.find((r) => r.issuerStudioId === rivalStudioId)!
    // Explicit UNKNOWN marker on the competing row — never the real figure.
    expect(theirs.premiumTier).toBe(UNKNOWN)
    expect(theirs.annualSalary).toBe(UNKNOWN)
    expect(theirs.signingBonus).toBe(UNKNOWN)

    // Both directions: the existing, unrelated people projection must not carry it either.
    const peopleJson = JSON.stringify(peopleProjection(state))
    expect(peopleJson).not.toContain(String(rivalRealAnnual))
    expect(peopleJson).not.toContain(String(rivalRealBonus))

    // Nor the third serialization surface, Industry.
    const industryJson = JSON.stringify(
      industryPage(state, 'p14a1-bridge-disclosure-leak-industry', 0, employmentQuery('p14a1-bridge-disclosure-leak-industry', talentId)),
    )
    expect(industryJson).not.toContain(String(rivalRealAnnual))
    expect(industryJson).not.toContain(String(rivalRealBonus))
  })

  it('bridge/industry.ts\'s private-contract-terms rows and bridge/people.ts\'s contract:null for rival-employed people are UNCHANGED for a person outside any case', () => {
    const { state, talentId: caseSubject } = openCaseWithBothProposals('p14a1-bridge-disclosure-unchanged')
    const week = state.market.tick
    const rivalStudioId = state.hollywood!.identities.find((s) => s.role === 'rival' && s.enteredWeek !== null)!.studioId
    const otherRivalEmployee = state.hollywood!.employment.find((e) =>
      e.studioId === rivalStudioId && e.terms.talentId !== caseSubject && e.endedWeek === null && !renewalWindowOpen(e.terms, week))
    expect(otherRivalEmployee).toBeDefined() // sanity: a rival employee genuinely outside any case exists on this fixture
    expect(caseForTalent(state, otherRivalEmployee!.terms.talentId, week)).toBeNull()

    const profile = peopleProjection(state).profiles.find((p) => p.talentId === otherRivalEmployee!.terms.talentId)!
    expect(profile.employment.contract).toBeNull() // UNCHANGED
    expect(profile.employment.status).toBe('unavailable')

    const activities = industryPage(state, 'p14a1-bridge-disclosure-industry', 0, employmentQuery('p14a1-bridge-disclosure-industry', otherRivalEmployee!.terms.talentId)).activities
    expect(activities.length).toBeGreaterThan(0)
    expect(activities.every((a) => a.detail === 'Actual recorded employment authority. Contract terms are kept private in Industry.')).toBe(true) // UNCHANGED

    // NOT YET EXISTING: marketCaseProjection — this test's RED cause: the case
    // block must not exist for a peer outside any case.
    expect(marketCaseProjection(state, otherRivalEmployee!.terms.talentId, state.hollywood!.playerStudioId)).toBeNull()
  })
})

// ── group 6: settlement on the wire ──────────────────────────────────────────

describe('group 6: settlement on the wire', () => {
  it('after the decision week the case reads settled with order-only reasons; the winner\'s employer/contract updates; the two industry receipts stay separate rows (no folded row — A.2\'s Pulse projection, not A.1)', () => {
    const { state: preSettle, talentId, playerStudioId } = openCaseWithBothProposals('p14a1-bridge-settlement-wire')
    let state = advanceTo(preSettle, 51)
    state = tick(state) // settles at week 52 — the proven dominance scenario
    const week = state.market.tick
    expect(week).toBe(52)
    const disclosure = caseDisclosure(state, talentId, playerStudioId, week)
    expect(disclosure.status).toBe('settled')
    for (const reason of disclosure.settlementReasons) expect(reason).not.toMatch(/\$|\d{3,}/) // order-only, never an amount

    const contract = activeContract(state, talentId)!
    expect(contract.startWeek).toBe(week)
    const profile = peopleProjection(state).profiles.find((p) => p.talentId === talentId)!
    expect(profile.employment.contract?.startWeek).toBe(week)
    expect(profile.employment.status).toBe('contracted')

    const activities = industryPage(state, 'p14a1-bridge-settlement-industry', 0, employmentQuery('p14a1-bridge-settlement-industry', talentId)).activities
    const atSettlement = activities.filter((a) => a.week === week)
    expect(atSettlement.length).toBe(2) // expiry + player-contract: two rows on the Employment route; the A.2 fold is Pulse-scoped (plan A.2 item 3); an Employment-route fold is OPEN

    // NOT YET EXISTING: marketCaseProjection — this test's RED cause.
    const block = marketCaseProjection(state, talentId, playerStudioId)!
    expect(block.status).toBe('settled')
    expect(block.settlementReasons).toEqual(disclosure.settlementReasons)
  })
})

// ── group 7: Save/Load ────────────────────────────────────────────────────────

describe('group 7: save/load', () => {
  it('a genuine V27 fixture loads through the bridge converted, with an empty market root and no case block for its in-window subject', () => {
    const json = load(V27_FIXTURES.renewalWindow.file)
    assertSha256(json, V27_FIXTURES.renewalWindow.sha256)
    const session = BridgeSession.fromSaveJson(json, 'p14a1-bridge-v27-load')
    const state = session.gameState
    expect(state.market.tick).toBe(V27_FIXTURES.renewalWindow.week)
    const market = (state as unknown as { talentMarket: { cases: unknown[]; proposals: unknown[]; receipts: unknown[]; legacyTerminations: unknown[] } }).talentMarket
    expect(market.cases).toEqual([])
    expect(market.proposals).toEqual([])
    expect(market.receipts).toEqual([])
    expect(market.legacyTerminations).toEqual([])
    const subject = state.talent.find((t) => t.role === 'scientist' && state.contracts.some((c) => c.talentId === t.id))
    expect(subject).toBeDefined() // sanity: the fixture genuinely carries a contracted Scientist inside its window
    expect(marketEligibility(state, subject!.id, state.market.tick).status).toBe('renewal_window')
    // NOT YET EXISTING: marketCaseProjection — RED cause; migration invents no
    // case (tests/p14a1-save-v28.test.ts), so this must read null once it exists.
    expect(marketCaseProjection(state, subject!.id, state.hollywood!.playerStudioId)).toBeNull()
  })

  it('a V28 save round-trips through the bridge save/load path, carrying legacyTerminations, at projection 45', () => {
    const { state } = signActor(p13aGeneratedStudio('p14a1-bridge-roundtrip'), 52)
    const session = new BridgeSession(state, 'p14a1-bridge-roundtrip')
    const saved = session.save({ protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId: session.sessionId, commandId: 'save-1', expectedStateRevision: session.stateRevision })
    expect(saved.accepted).toBe(true)
    if (!saved.accepted) throw new Error(`save refused: ${JSON.stringify(saved)}`)
    const parsed = JSON.parse(saved.saveJson) as { saveVersion: number; state: { talentMarket: { legacyTerminations: unknown[]; representation: null } } }
    expect(parsed.saveVersion).toBe(29)
    expect(parsed.state.talentMarket.legacyTerminations).toEqual([])
    expect(parsed.state.talentMarket.representation).toBeNull()

    const reloaded = BridgeSession.fromSaveJson(saved.saveJson, 'p14a1-bridge-roundtrip-reload')
    // Both sides normalized through one JSON pass before comparing: `toEqual`
    // is key-order-independent already, but the LIVE in-memory state carries
    // genuine IEEE `-0` in some `perceived` genre-experience fields (unrelated
    // to this feature) that a JSON round trip silently flattens to `0`
    // (`JSON.stringify(-0) === '0'`) — comparing the live object directly
    // against the reloaded (already-JSON-normalized) one is a false-positive
    // `-0`-vs-`0` mismatch, not a real difference. Round-tripping the LEFT side
    // through JSON too makes the comparison apples-to-apples.
    expect(reloaded.gameState).toEqual(JSON.parse(JSON.stringify(session.gameState)))

    // NOT YET EXISTING: marketCaseProjection — ties this round trip to
    // projection 42; this test's RED cause.
    expect(marketCaseProjection(reloaded.gameState, session.gameState.talent[0]!.id, session.gameState.hollywood!.playerStudioId)).toBeNull()
  })
})

// ── group 8: session-level marketProposalAction — the owed requirement test ──
//
// NEW (P14A.1-T3, projection 42 landed 562cdf2): "no authorized test exercised
// quoteMarketProposal — a session-level requirement test for the new intent kind
// (quote → commit → STALE_REVISION → replay INTENT_NOT_AVAILABLE) is owed
// test-side with the three re-expressions" (evidence 15). Unlike group 3, this
// walks the REAL `BridgeSession.quote()`/`command()` dispatch end to end — the
// fall-through hazard the file header describes was for `marketProposalAction`
// as an UNRECOGNIZED type; `quoteMarketProposal` is now a named branch
// (bridge/session.ts) with its own FAIL-LOUD tail for anything still unknown, so
// exercising it here is exactly the missing coverage, not the harness trap.
describe('group 8: session-level marketProposalAction', () => {
  it('quote -> commit -> stale revision -> revise -> withdraw -> a superseded intent after the state moved -> an unknown quote type, all through BridgeSession', () => {
    const { state, talentId, playerStudioId } = openCaseWithBothProposals('p14a1-bridge-session-market-proposal')
    const session = new BridgeSession(state, 'p14a1-bridge-session-market-proposal')
    const week = state.market.tick

    // (a) quote propose (the contract's term, tier 1.25): an accepted quote that
    // validates against the wire quote-response schema, kind marketProposalAction,
    // the own-row figures equal to the engine's own re-derivation at the read week.
    const proposeRequest = {
      protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId: session.sessionId,
      commandId: 'q-propose', expectedStateRevision: session.stateRevision,
      type: 'quoteMarketProposal' as const,
      draft: { verb: 'propose' as const, talentId, termWeeks: 52, premiumTier: 1.25 },
    }
    const proposeResponse = session.quote(proposeRequest)
    if (!proposeResponse.accepted) throw new Error(proposeResponse.message)
    expect(parseWireValue(BRIDGE_SCHEMA.$defs.StudioBridgeQuoteResponse, proposeResponse)).toEqual(proposeResponse)
    expect(proposeResponse.quote.kind).toBe('marketProposalAction')
    expect(proposeResponse.quote.ok).toBe(true)
    const redraft = proposalDraft(state, playerStudioId, talentId, 52, 1.25, week)
    expect(proposeResponse.quote.termWeeks).toBe(redraft.termWeeks)
    expect(proposeResponse.quote.premiumTier).toBe(redraft.premiumTier)
    expect(proposeResponse.quote.annualSalary).toBe(redraft.annualSalary)
    expect(proposeResponse.quote.signingBonus).toBe(redraft.signingBonus)

    // (b) commit advances stateRevision; the proposal lands — both on the engine's
    // own currentProposals and on the profile's own case-block row.
    const revisionAtPropose = session.stateRevision
    const commitPropose = session.command({
      protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId: session.sessionId,
      commandId: 'c-propose', expectedStateRevision: session.stateRevision,
      type: 'submitIntent' as const, payload: { intentId: proposeResponse.quote.intentId },
    })
    expect(commitPropose.accepted).toBe(true)
    expect(session.stateRevision).toBe(revisionAtPropose + 1)
    expect(currentProposals(session.gameState, talentId).find((p) => p.issuerStudioId === playerStudioId))
      .toMatchObject({ termWeeks: 52, premiumTier: 1.25 })
    const ownRowAfterPropose = marketCaseProjection(session.gameState, talentId, playerStudioId)!
      .proposals.find((r) => r.issuerStudioId === playerStudioId)!
    expect(ownRowAfterPropose.termWeeks).toBe(52)
    expect(ownRowAfterPropose.premiumTier).toBe(1.25)

    // (c) committing the SAME quote's intentId again on the (now stale) pre-commit
    // revision is STALE_REVISION — a fresh commandId so this is not a memoized
    // replay of (b)'s own commandId.
    const staleRevisionReplay = session.command({
      protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId: session.sessionId,
      commandId: 'c-propose-stale-revision', expectedStateRevision: revisionAtPropose,
      type: 'submitIntent' as const, payload: { intentId: proposeResponse.quote.intentId },
    })
    expect(staleRevisionReplay.accepted).toBe(false)
    if (!staleRevisionReplay.accepted) expect(staleRevisionReplay.reasonCode).toBe('STALE_REVISION')

    // (e) revise replaces the earlier proposal — one current proposal per studio.
    const reviseResponse = session.quote({
      protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId: session.sessionId,
      commandId: 'q-revise', expectedStateRevision: session.stateRevision,
      type: 'quoteMarketProposal' as const,
      draft: { verb: 'revise' as const, talentId, termWeeks: 104, premiumTier: 1.1 },
    })
    if (!reviseResponse.accepted) throw new Error(reviseResponse.message)
    expect(reviseResponse.quote.ok).toBe(true)
    const commitRevise = session.command({
      protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId: session.sessionId,
      commandId: 'c-revise', expectedStateRevision: session.stateRevision,
      type: 'submitIntent' as const, payload: { intentId: reviseResponse.quote.intentId },
    })
    expect(commitRevise.accepted).toBe(true)
    const mineAfterRevise = currentProposals(session.gameState, talentId).filter((p) => p.issuerStudioId === playerStudioId)
    expect(mineAfterRevise).toHaveLength(1) // replaced, not appended
    expect(mineAfterRevise[0]!.termWeeks).toBe(104)
    expect(mineAfterRevise[0]!.premiumTier).toBe(1.1)

    // (d)+(f) withdraw removes it; the ORIGINAL propose-quote's intentId — minted
    // before (b), already superseded by (e)'s revise, and now stale again after this
    // withdraw — is refused as INTENT_NOT_AVAILABLE, not STALE_REVISION, when
    // resubmitted at the CORRECT (current) revision. Pinned against the actual code
    // in bridge/session.ts: `command()`'s STALE_REVISION guard passes (the revision
    // argument matches), so execution reaches `resolveAvailableIntents(...).find(...)
    // ?? this.quotedIntentFor(intentId)`; `quotedIntentFor` looks the intentId up in
    // `this.pendingQuotes`, which EVERY accepted command clears in full
    // (`this.pendingQuotes.clear()` at the end of `command()`) — (b)'s own commit
    // already evicted it, so `pending` is `undefined`, `quotedIntentFor` returns
    // `undefined`, `resolved` is `undefined`, and `command()` rejects with the fixed
    // message "Intent was not emitted by the current authoritative TypeScript state."
    // under `reasonCode: 'INTENT_NOT_AVAILABLE'`.
    const withdrawResponse = session.quote({
      protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId: session.sessionId,
      commandId: 'q-withdraw', expectedStateRevision: session.stateRevision,
      type: 'quoteMarketProposal' as const,
      draft: { verb: 'withdraw' as const, talentId, termWeeks: null, premiumTier: null },
    })
    if (!withdrawResponse.accepted) throw new Error(withdrawResponse.message)
    expect(withdrawResponse.quote.ok).toBe(true)
    const commitWithdraw = session.command({
      protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId: session.sessionId,
      commandId: 'c-withdraw', expectedStateRevision: session.stateRevision,
      type: 'submitIntent' as const, payload: { intentId: withdrawResponse.quote.intentId },
    })
    expect(commitWithdraw.accepted).toBe(true)
    expect(currentProposals(session.gameState, talentId).some((p) => p.issuerStudioId === playerStudioId)).toBe(false)

    const staleIntentAfterMove = session.command({
      protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId: session.sessionId,
      commandId: 'c-propose-stale-after-move', expectedStateRevision: session.stateRevision,
      type: 'submitIntent' as const, payload: { intentId: proposeResponse.quote.intentId },
    })
    expect(staleIntentAfterMove.accepted).toBe(false)
    if (!staleIntentAfterMove.accepted) {
      expect(staleIntentAfterMove.reasonCode).toBe('INTENT_NOT_AVAILABLE')
      expect(staleIntentAfterMove.message).toMatch(/not emitted by the current authoritative/)
    }

    // (g) an unknown quote type is refused loud — the fail-loud tail (bridge/
    // session.ts: "every family above is explicit, so an unrecognized `type` is
    // refused as an invalid command" — it used to fall through into the casting
    // handler and silently misread another family's draft).
    const unknownTypeRequest = {
      protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId: session.sessionId,
      commandId: 'q-unknown-type', expectedStateRevision: session.stateRevision,
      type: 'quoteNothing', draft: { verb: 'propose', talentId, termWeeks: 52, premiumTier: 1.0 },
    } as unknown as BridgeQuoteRequest
    const unknownTypeResponse = session.quote(unknownTypeRequest)
    expect(unknownTypeResponse.accepted).toBe(false)
    if (!unknownTypeResponse.accepted) {
      expect(unknownTypeResponse.reasonCode).toBe('INVALID_COMMAND')
      expect(unknownTypeResponse.message).toMatch(/Unknown quote type/)
    }
  })
})
