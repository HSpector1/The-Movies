// ── P14A.1 test 3: Proposals — one current per studio, premium-tier bounds,
// draft reference invalidation, affordability gates ─────────────────────────
//
// Requirement source: P14-HEADLESS-PLAN.md, P14A.1 expansion, Tests item 3:
// "3 proposals: one current per studio, premium tier bounds, draft reference
// invalidation, affordability gates (`canAfford` for the player; the rival's
// reserve)." Law, by reference to docs/engineering/p14-preparation-8ef5246a/
// P14-PREPARATION-COMPANION.md §2.1.4 ("Proposals, the compensation lever,
// and what makes a rival propose"):
//   "A proposal references a P10-priced draft, not a copy of a contract: it
//   stores (talentId, termWeeks, startWeek, premiumTier) and a digest of the
//   derived ContractOffer... a digest mismatch invalidates the version...
//   The player submits, revises or withdraws; nobody accepts."
//   "annual = round(ask(term) × premium), premium ∈ {1.00, 1.05, 1.10, 1.15,
//   1.20, 1.25} (hypothesis), signingBonus = round(0.18 × annual) by the
//   accepted law, canAfford re-asked on the bonus at submission and at
//   settlement."
//   "The player's bonus passes the accepted canAfford legality gate (D-12
//   contract law); the rival's bonus passes its reserve rule (operatingReserve,
//   P12 strategy)."
// Scope line: "at most one current proposal per studio."
//
// RED-by-design: `src/core/talentMarket.ts` does not exist yet. `proposalDraft`
// and `submitProposal` are the imports from that new module, and `proposalDraft`
// is CALLED below, so this file fails at module resolution before any test
// body runs.
//
// INTERPRETATIONS NAMED:
//   1. `proposalDraft(state, issuerStudioId, talentId, termWeeks, premiumTier,
//      week)` is assumed pure: it returns `{ annualSalary, signingBonus,
//      startWeek, endWeekExclusive, premiumTier, digest }` and throws on a
//      below-1.00 premium tier ("a below-ask tier is not offered in P14A").
//   2. `submitProposal(state, { talentId, issuerStudioId, termWeeks,
//      premiumTier })` is assumed to run at `state.market.tick` and either
//      return a new `GameState` (success, or a revise-in-place of that
//      studio's existing proposal for the same case) or throw a refusal.
//   3. PREMIUM TIER VALUES ARE OPEN (plan: "the values OPEN — pin only the
//      enum shape and that it is symmetric for both issuers"). This file
//      therefore never asserts an exact non-1.00 tier value or step size; it
//      asserts only: 1.00 is a valid, unambiguous floor tier equal to the
//      plain ask; a higher tier strictly increases the price; a below-1.00
//      tier is refused; the SAME law (the same `proposalDraft` entry) applies
//      to a rival issuer as to the player (symmetric).
//
// PREMISES NOT SATISFIED:
//   - A genuine forged digest-mismatch scenario (re-pricing after a live law
//     change) is not exercised; digest determinism/uniqueness is tested
//     instead, which is the property "invalidates the version" depends on.
//   - The rival's reserve-rule REFUSAL path is exercised by forcing a rival's
//     account cash to zero (a legal, in-state mutation of an already-entered
//     rival), not by a fixture that naturally reaches insolvency; this is
//     named because a "naturally poor rival" fixture was not attempted.

import { describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { canAfford, contractOffer, hiringMarketIds } from '../src/core/employment.js'
import { rivalWeeklyOperatingCost } from '../src/core/hollywood.js'
import { p13aGeneratedStudio, advanceTo } from '../src/harness/p13a/fixtures.js'
import type { GameState } from '../src/core/types.js'
// RED-by-design: src/core/talentMarket.ts does not exist. These are the two
// imports from that new module in this file; proposalDraft is CALLED below.
import { proposalDraft, submitProposal } from '../src/core/talentMarket.js'

function freshWorld(): GameState {
  return p13aGeneratedStudio()
}
function signActor(state: GameState, termWeeks: number): { state: GameState; talentId: string } {
  const candidates = hiringMarketIds(state, 0)
  const actorId = candidates.map((id) => state.talent.find((t) => t.id === id)).find((t) => t?.role === 'actor')?.id
  if (actorId === undefined) throw new Error('fixture assumption failed: no actor in the week-0 hiring market')
  const signed = applyActions(state, [{ kind: 'signContract', talentId: actorId, termWeeks }])
  return { state: signed, talentId: actorId }
}
/** The case state used by every test below: a 52-week player contract at its window-open week 40. */
function caseWorld(): { state: GameState; talentId: string; playerStudioId: string; rivalStudioId: string } {
  const world = freshWorld()
  const { state: signed, talentId } = signActor(world, 52)
  const atWindow = advanceTo(signed, 40)
  return {
    state: atWindow,
    talentId,
    playerStudioId: atWindow.hollywood!.playerStudioId,
    rivalStudioId: atWindow.hollywood!.identities.find((s) => s.role === 'rival' && s.enteredWeek !== null)!.studioId,
  }
}

describe('P14A.1 test 3: proposals — one per studio, premium tier bounds, draft reference, affordability', () => {
  it('premium tier 1.00 equals the plain ask; the signing bonus is 18% of the priced annual, both issuers, same law', () => {
    const { state, talentId, playerStudioId, rivalStudioId } = caseWorld()
    const plainAsk = contractOffer(state, talentId, 52, state.market.tick)
    for (const issuer of [playerStudioId, rivalStudioId]) {
      const draft = proposalDraft(state, issuer, talentId, 52, 1.0, state.market.tick)
      expect(draft.annualSalary).toBe(plainAsk.annualSalary)
      expect(draft.signingBonus).toBe(Math.round(draft.annualSalary * 0.18))
    }
  })

  it('a higher premium tier strictly increases the priced annual salary over 1.00 (exact tier values are OPEN; only monotonicity is pinned)', () => {
    const { state, talentId, playerStudioId } = caseWorld()
    const base = proposalDraft(state, playerStudioId, talentId, 52, 1.0, state.market.tick)
    const higher = proposalDraft(state, playerStudioId, talentId, 52, 1.25, state.market.tick)
    expect(higher.annualSalary).toBeGreaterThan(base.annualSalary)
  })

  it('a below-1.00 premium tier is refused (not offered in P14A)', () => {
    const { state, talentId, playerStudioId } = caseWorld()
    expect(() => proposalDraft(state, playerStudioId, talentId, 52, 0.9, state.market.tick)).toThrow()
  })

  it('at most one current proposal per studio: a second submission from the same studio replaces (revises) rather than stacks', () => {
    const { state, talentId, playerStudioId } = caseWorld()
    const first = submitProposal(state, { talentId, issuerStudioId: playerStudioId, termWeeks: 52, premiumTier: 1.0 })
    const proposalsAfterFirst = (first as unknown as { talentMarket: { proposals: { issuerStudioId: string; talentId: string }[] } }).talentMarket.proposals
    const mineAfterFirst = proposalsAfterFirst.filter((p) => p.issuerStudioId === playerStudioId && p.talentId === talentId)
    expect(mineAfterFirst.length).toBe(1)
    const second = submitProposal(first, { talentId, issuerStudioId: playerStudioId, termWeeks: 104, premiumTier: 1.0 })
    const proposalsAfterSecond = (second as unknown as { talentMarket: { proposals: { issuerStudioId: string; talentId: string; termWeeks: number }[] } }).talentMarket.proposals
    const mineAfterSecond = proposalsAfterSecond.filter((p) => p.issuerStudioId === playerStudioId && p.talentId === talentId)
    expect(mineAfterSecond.length).toBe(1) // still exactly one — revised in place, not stacked
    expect(mineAfterSecond[0]!.termWeeks).toBe(104)
  })

  it('draft reference: the digest is deterministic for identical inputs and changes when a material term changes', () => {
    const { state, talentId, playerStudioId } = caseWorld()
    const a = proposalDraft(state, playerStudioId, talentId, 52, 1.0, state.market.tick)
    const b = proposalDraft(state, playerStudioId, talentId, 52, 1.0, state.market.tick)
    expect(a.digest).toBe(b.digest) // determinism/replayability: identical inputs, identical digest
    const changedTerm = proposalDraft(state, playerStudioId, talentId, 104, 1.0, state.market.tick)
    expect(changedTerm.digest).not.toBe(a.digest) // a material-term change bumps the version
  })

  it('affordability (player): submitProposal is refused via the accepted canAfford legality gate when the bonus would leave cash negative', () => {
    const { state, talentId, playerStudioId } = caseWorld()
    const draft = proposalDraft(state, playerStudioId, talentId, 208, 1.25, state.market.tick)
    const poor: GameState = { ...state, studio: { ...state.studio, cash: draft.signingBonus - 1 } }
    expect(canAfford(poor, draft.signingBonus).ok).toBe(false) // sanity: the shared D-12 gate agrees this is illegal
    expect(() => submitProposal(poor, { talentId, issuerStudioId: playerStudioId, termWeeks: 208, premiumTier: 1.25 })).toThrow()
  })

  it('affordability (rival): submitProposal is refused via the reserve rule when the rival\'s account cannot clear operatingReserve after the bonus', () => {
    const { state, talentId, rivalStudioId } = caseWorld()
    const hollywood = state.hollywood!
    const business = hollywood.businesses.find((b) => b.studioId === rivalStudioId)!
    const requiredReserve = rivalWeeklyOperatingCost(business, hollywood, state.market.tick) * business.policy.reserveWeeks
    expect(requiredReserve).toBeGreaterThan(0) // sanity: the reserve law is genuinely load-bearing here
    const impoverished: GameState = {
      ...state,
      hollywood: { ...hollywood, businesses: hollywood.businesses.map((b) => (b.studioId === rivalStudioId ? { ...b, account: { ...b.account, cash: 0 } } : b)) },
    }
    expect(() => submitProposal(impoverished, { talentId, issuerStudioId: rivalStudioId, termWeeks: 208, premiumTier: 1.0 })).toThrow()
  })
})
