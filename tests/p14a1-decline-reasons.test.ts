// ── P14A.1 — typed decline reasons (tie exhausted / all proposals dropped) ──
//
// Requirement source: docs/engineering/p14-preparation-8ef5246a/P14-PREPARATION-COMPANION.md
// §2.1.7, line 104 ("Reservation…"): "Proposals that fail reservation, legality
// or affordability at freeze are dropped with typed reasons before ranking."
// And line 120 (the tie order): "…then by earliest submission week, then by
// incumbent-if-present, then decline-all. Reasons are the descriptors won
// (…), ordering-only."
//
// Diagnosis: docs/engineering/playability-launch-review/evidence/p14a1-20260918/
// 14-settlement-decline-diagnosis.txt (356 lines; seed p13b-s8-bridge-probe-01,
// week 208). NOTHING IS DROPPED on that probe — all 96 rival proposals across
// the 24 cases pass every survivesFreeze predicate with multi-million headroom;
// the 13 declines are `chooseProposal`'s terminal decline-all reached with a
// FULL LEGAL SURVIVOR SET, because `rivalPremiumTier` discriminates on two bits
// so non-incumbent challengers submitted at the same week share exact
// descriptor vectors the tie ladder cannot separate. `closeCase` nonetheless
// stamps every decline — a tie exhaustion or an actual drop, alike — with the
// fixed text "no proposal cleared this person's reservation", which is FALSE
// for a tie exhaustion (nothing failed reservation) and uninformative for a
// drop (no predicate named). Companion §2.1.7 line 104 requires typed reasons.
//
// COORDINATOR RULING (pinned exactly, per the assigning instruction): a
// declined case's `reason` is one of two typed codes —
//   'tie exhausted'        — a full legal survivor set; the §2.1.7 tie order
//                             ran out (chooseProposal returned null with
//                             survivors.length > 0).
//   'all proposals dropped' — every submitted proposal failed a freeze
//                             predicate before ranking (survivors.length === 0
//                             with submitted.length > 0).
// The decline receipt's `reasons[]`:
//   - for a tie: exactly ONE sentence naming the number of tied proposals,
//     containing neither "reservation" nor any amount.
//   - for drops: exactly one sentence PER dropped proposal, naming the issuing
//     studio and its predicate, from a typed six-predicate vocabulary (not
//     entered; committed elsewhere; start week no longer matches; terms
//     changed since submission; below the ask; could not fund the signing
//     bonus) mirroring `survivesFreeze`'s own checks in `src/core/
//     talentMarket.ts`.
// The exact sentence WORDING is CANDIDATE (not pinned by the coordinator);
// this file pins only: the count, the studio's identification (studioId or
// its public display name — the coordinator did not choose between them),
// the word "reservation" absent (unless the predicate is the ask), and the
// predicate keyword present ("bonus" for affordability).
//
// RED-by-design: `closeCase`/`settleCase` in `src/core/talentMarket.ts` do
// not yet distinguish a tie exhaustion from a drop — every decline is
// currently stamped `reason: 'no proposal cleared'` with the fixed receipt
// sentence "no proposal cleared this person's reservation" regardless of
// cause. Both cases below are expected to fail against that current text.
//
// PREMISES DECLARED (searched empirically, not assumed):
//   - On the default p13a fixture seed ('p13a-core-causal-01',
//     `p13aGeneratedStudio()`'s default), a disposable vite-node probe (not
//     committed) confirmed NO rival auto-proposes on a freshly-signed player
//     actor's case between weeks 40 and 52: every rival's freshly-generated
//     roster already meets `RIVAL_TEAM_ROLES`, so `rivalProposalTrigger`
//     branch (c) never fires and branch (a)/(b) do not apply to a case whose
//     `subjectStudioId` is the player. The only proposals present at week 52
//     are the ones this file submits by hand.
//   - Case A's exact tie needs two entered rivals whose `standingMean` differs
//     by <= 5 (`STANDING_BAND_TOLERANCE`, `talentMarket.ts` — the D6 standing
//     band: `mine >= highest - TOLERANCE ? 2 : …`, so within-tolerance issuers
//     both land in the top band). The same probe measured, on this seed at
//     week 40: r01=47.516, r02=48.061 (diff 0.545), r03=42.430, r04=45.384 —
//     multiple pairs tie; this file picks the closest pair programmatically
//     (never hardcodes a studio suffix) and asserts the premise explicitly so
//     a future world-gen change fails loud here rather than mis-scoring the
//     case silently.
//   - Case B's affordability drop is INDUCED (not observed): the chosen
//     rival's `account.cash` is set to 0 by a direct copy-on-write edit,
//     after its (affordable) submission and before the settling tick — the
//     same declared-premise idiom `tests/p14a1-settlement.test.ts` uses for
//     induced fame drift. `rivalWeeklyOperatingCost(...) * reserveWeeks` is
//     always positive, so cash=0 fails `affordabilityRefusal` unconditionally
//     regardless of the exact reserve figure.

import { describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { hiringMarketIds } from '../src/core/employment.js'
import { tick } from '../src/core/tick.js'
import { p13aGeneratedStudio, advanceTo } from '../src/harness/p13a/fixtures.js'
import type { GameState } from '../src/core/types.js'
import { submitProposal, caseForTalent } from '../src/core/talentMarket.js'

const STANDING_BAND_TOLERANCE = 5 // talentMarket.ts D6 band edge, named not imported (private const)

function signActor(state: GameState, termWeeks: number): { state: GameState; talentId: string } {
  const candidates = hiringMarketIds(state, 0)
  const actorId = candidates.map((id) => state.talent.find((t) => t.id === id)).find((t) => t?.role === 'actor')?.id
  if (actorId === undefined) throw new Error('fixture assumption failed: no actor in the week-0 hiring market')
  const signed = applyActions(state, [{ kind: 'signContract', talentId: actorId, termWeeks }])
  return { state: signed, talentId: actorId }
}

function standingMean(s: { audienceAwareness: number; industryPrestige: number; commercialConfidence: number }): number {
  return (s.audienceAwareness + s.industryPrestige + s.commercialConfidence) / 3
}

/** The two entered rivals whose Standing means are closest — the tightest
 * natural D6 band tie available on this seed at this week (see file header
 * PREMISE). Throws loud if no pair actually ties within tolerance: a faulty
 * premise must break the scenario, not silently mis-score it. */
function closestStandingRivalPair(state: GameState, week: number): [string, string] {
  const hollywood = state.hollywood!
  const entered = hollywood.identities.filter((s) => s.role === 'rival' && s.enteredWeek !== null && s.enteredWeek <= week)
  const withStanding = entered
    .map((s) => ({ studioId: s.studioId, mean: standingMean(hollywood.businesses.find((b) => b.studioId === s.studioId)!.standing) }))
    .sort((a, b) => a.mean - b.mean)
  let best: { a: string; b: string; diff: number } | null = null
  for (let i = 0; i < withStanding.length - 1; i++) {
    const diff = withStanding[i + 1]!.mean - withStanding[i]!.mean
    if (best === null || diff < best.diff) best = { a: withStanding[i]!.studioId, b: withStanding[i + 1]!.studioId, diff }
  }
  if (best === null || best.diff > STANDING_BAND_TOLERANCE) {
    throw new Error(`fixture premise failed: no two entered rivals tie Standing within ${STANDING_BAND_TOLERANCE} on this seed at week ${week}`)
  }
  return [best.a, best.b]
}

function drainCash(state: GameState, studioId: string): GameState {
  const hollywood = state.hollywood!
  return {
    ...state,
    hollywood: {
      ...hollywood,
      businesses: hollywood.businesses.map((b) => (b.studioId === studioId ? { ...b, account: { ...b.account, cash: 0 } } : b)),
    },
  }
}

type TalentMarketRoot = {
  cases: { talentId: string; outcome: string | null; reason: string | null }[]
  receipts: { kind: string; talentId: string; studioId: string | null; reasons: readonly string[] }[]
}
function marketOf(state: GameState): TalentMarketRoot {
  return (state as unknown as { talentMarket: TalentMarketRoot }).talentMarket
}

describe('P14A.1: typed decline reasons', () => {
  it('A. tie exhaustion: two entered rivals with identical material terms and tier, tied Standing band → reason "tie exhausted", one order-only sentence naming the tied count, never "reservation"', () => {
    const { state: signed, talentId } = signActor(p13aGeneratedStudio(), 52)
    const at40 = advanceTo(signed, 40)
    const [rivalA, rivalB] = closestStandingRivalPair(at40, 40)

    // Both proposals: identical material terms (52 weeks) and identical tier
    // (1.0, the floor) — every D1/D2/D7 band ties by construction; D6 ties by
    // the premise above. Neither is the incumbent (the player is).
    let state = submitProposal(at40, { talentId, issuerStudioId: rivalA, termWeeks: 52, premiumTier: 1.0 })
    state = submitProposal(state, { talentId, issuerStudioId: rivalB, termWeeks: 52, premiumTier: 1.0 })
    expect(caseForTalent(state, talentId, state.market.tick)!.status).not.toBe('settled')

    state = advanceTo(state, 51)
    const preSettlement = state.contracts.find((c) => c.talentId === talentId)!
    expect(preSettlement.endWeekExclusive).toBe(52) // original contract, unrenewed, one week before decision

    state = tick(state) // market.tick 51 -> 52, the decision week: settlement runs
    expect(state.market.tick).toBe(52)

    const settledView = caseForTalent(state, talentId, state.market.tick)!
    expect(settledView.status).toBe('declined')

    const kase = marketOf(state).cases.find((c) => c.talentId === talentId)!
    expect(kase.outcome).toBe('declined')
    expect(kase.reason).toBe('tie exhausted') // RED: current code stamps 'no proposal cleared'

    const declineReceipts = marketOf(state).receipts.filter((r) => r.talentId === talentId && r.kind === 'declined')
    expect(declineReceipts.length).toBe(1)
    const reasons = declineReceipts[0]!.reasons
    expect(reasons.length).toBe(1) // exactly one sentence for a tie, not one per proposal
    expect(reasons[0]).toContain('2') // the tied count
    expect(reasons[0]).not.toMatch(/reservation/i)
    expect(reasons[0]).not.toMatch(/\$|\d{3,}/) // no amount

    // No contract was created for the person at 52 — the case declined.
    expect(state.contracts.find((c) => c.talentId === talentId && c.startWeek === 52)).toBeUndefined()
    expect(state.hollywood!.employment.find((e) => e.terms.talentId === talentId && e.terms.startWeek === 52)).toBeUndefined()
  })

  it('B. all proposals dropped: a single rival proposal fails affordability at the decision week → reason "all proposals dropped", one sentence naming the studio and the bonus predicate, never "reservation"', () => {
    const { state: signed, talentId } = signActor(p13aGeneratedStudio(), 52)
    const at40 = advanceTo(signed, 40)
    const rivalStudioId = at40.hollywood!.identities.find((s) => s.role === 'rival' && s.enteredWeek !== null)!.studioId
    const rivalName = at40.hollywood!.identities.find((s) => s.studioId === rivalStudioId)!.name

    // Submitted while affordable (tier 1.0); drained just before the settling
    // tick — a declared premise (see file header), not an observed fact. The
    // drain runs AFTER advanceTo(51), not right after submission, because the
    // ordinary weekly rival economy (revenue/payroll) would otherwise refill
    // cash across the intervening 11 weeks and the drop would never happen.
    let state = submitProposal(at40, { talentId, issuerStudioId: rivalStudioId, termWeeks: 52, premiumTier: 1.0 })
    state = advanceTo(state, 51)
    state = drainCash(state, rivalStudioId)
    state = tick(state) // market.tick 51 -> 52, the decision week
    expect(state.market.tick).toBe(52)

    const settledView = caseForTalent(state, talentId, state.market.tick)!
    expect(settledView.status).toBe('declined')

    const kase = marketOf(state).cases.find((c) => c.talentId === talentId)!
    expect(kase.outcome).toBe('declined')
    expect(kase.reason).toBe('all proposals dropped') // RED: current code stamps 'no proposal cleared'

    const declineReceipts = marketOf(state).receipts.filter((r) => r.talentId === talentId && r.kind === 'declined')
    expect(declineReceipts.length).toBe(1)
    const reasons = declineReceipts[0]!.reasons
    expect(reasons.length).toBe(1) // one proposal submitted, one proposal dropped
    // Interpretation named (file header): the coordinator did not choose
    // between studioId and display name for "the studio name present".
    expect(reasons[0].includes(rivalStudioId) || reasons[0].includes(rivalName)).toBe(true)
    expect(reasons[0]).toMatch(/bonus/i) // the affordability predicate keyword
    expect(reasons[0]).not.toMatch(/reservation/i)

    expect(state.contracts.find((c) => c.talentId === talentId && c.startWeek === 52)).toBeUndefined()
    expect(state.hollywood!.employment.find((e) => e.terms.talentId === talentId && e.terms.startWeek === 52)).toBeUndefined()
  })
})
