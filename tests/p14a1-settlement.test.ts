// ── P14A.1 test 5: Atomic settlement — deterministic ranking, exactly once,
// receipts, incumbent renewal as a proposal, order-only reasons ────────────
//
// Requirement source: P14-HEADLESS-PLAN.md, P14A.1 expansion, Tests item 5:
// "5 atomic settlement: deterministic ranking, exactly once, receipts,
// incumbent renewal as a proposal, order-only reasons." Law, by reference to
// docs/engineering/p14-preparation-8ef5246a/P14-PREPARATION-COMPANION.md
// §2.1.8 ("Settlement"): "The decision phase is a new, terminal, fixed-order
// step of the weekly advance at the decision week W, after the tick has
// advanced (market.tick = W)... after finishHollywoodWeek has closed the
// subject's interval and written its `expiry` receipt... It freezes the
// submitted set... applies the rule of §2.1.7 to the survivors; and commits
// the chosen proposal through the accepted owners: P10 activates the new
// contract... for a player winner recordPlayerEmployment runs last and
// mirrors a player-contract start... P14 then writes the chooser receipt
// referencing the expiry receipt and the start receipt by eventId, and the
// case's terminal state." And §2.1.7 ("The person-choice rule"): "dominance
// (better-or-equal on every descriptor, better on at least one) always
// wins... Reasons are the descriptors won... ordering-only." And §2.1.3:
// "the incumbent's renewal becomes the incumbent's proposal: a draft whose
// startWeek is the old contract's endWeekExclusive, settled at the decision
// week with everyone else's."
//
// SCENARIO: a fresh player 52-week contract signed at week 0 (window opens
// week 40, decision week 52 = endWeekExclusive, derived on read — see
// tests/p14a1-case.test.ts). Both the player (incumbent) and one entered
// rival submit a proposal for the SAME 52-week term (so D2 term-preference
// ties); the player's premium tier is set to the maximum hypothesis value
// and the rival's to the minimum, so the player's compensation descriptor is
// AT LEAST as good as the rival's under ANY monotonic band scheme (exact
// band edges are OPEN — see tests/p14a1-proposals.test.ts), and the player
// is additionally the incumbent (D7). With D3-D5 neutral in P14A (no
// promises/trust/relationships yet) and D6 (Standing) unmanipulated by this
// scenario, the player DOMINATES: better-or-equal everywhere, strictly
// better on incumbency. Dominance settles the case without needing the
// person's OPEN public-priority-order tie-break law.
//
// RED-by-design: `src/core/talentMarket.ts` does not exist yet. `submitProposal`
// and `caseForTalent` are imported from that new module and CALLED below, so
// this file fails at module resolution before any test body runs.
//
// INTERPRETATIONS NAMED: `submitProposal`/`caseForTalent` shapes as in
// tests/p14a1-proposals.test.ts and tests/p14a1-case.test.ts. The chooser
// receipt is assumed reachable at `state.talentMarket.receipts` (an array of
// `{ kind; talentId; reasons: string[]; ... }` records); only `reasons`
// (a string array) and a settlement-kind receipt's existence/count are
// asserted — no other field of its shape is pinned.
//
// PREMISES NOT SATISFIED:
//   - A genuinely CONTESTED (non-dominant) outcome, decided by the person's
//     public priority order, is not exercised here: the plan states the tie
//     order's archetype thresholds as NUMERICAL/CONTENT HYPOTHESIS (companion
//     §2.1.7), and pinning a specific tie outcome would assert an unsettled
//     number. This file deliberately uses a DOMINANCE-settled case instead.
//   - "Duplicate delivery consumes the same in-state idempotency key once"
//     (companion §2.1.8) is not exercised: no duplicate-dispatch mechanism is
//     tested here, only that a second, LATER `tick()` does not re-settle an
//     already-settled case.

// ── ADDED (coordinator instruction, post-T2, settlement re-derivation) ───────
//
// Requirement source: docs/engineering/p14-preparation-8ef5246a/P14-PREPARATION-COMPANION.md
// §2.1.4 ("The draft"), line 70: a proposal "stores (talentId, termWeeks, startWeek,
// premiumTier) and a digest of the derived ContractOffer, and re-derives the six
// accepted terms through the shared pricing entry at review and at settlement; a
// digest mismatch invalidates the version. … Material terms are termWeeks, startWeek,
// premiumTier and, when P14B exists, the attached promise set; a change to any of
// them → new version." And §2.1.7 ("Reservation"), line 104: "A proposal clears
// reservation iff its annual salary ≥ the person's ask for that term (true by
// construction while the premium tier is ≥ 1.00)".
//
// Coordinator ruling (adopted for the fix, which the engine specialist implements
// AFTER this RED lands): the version identity (digest) covers MATERIAL terms only —
// (talentId, issuerStudioId, termWeeks, startWeek, premiumTier); price is derived,
// never material. Settlement commits `annual = iround(ask(W).annualSalary ×
// premiumTier)` and `signingBonus = iround(annual × TUNING.CONTRACT_SIGNING_BONUS_FRACTION)`,
// where `ask(W) = studioOffer(stateAtW, issuerStudioId, talentId, termWeeks, W)`.
//
// DEFECT DIAGNOSED (engine specialist, seed p13b-s8-bridge-probe-01, week 208): all
// 24 open talent-market cases DECLINED with "no proposal cleared this person's
// reservation". Cause: `survivesFreeze` (talentMarket.ts ≈line 798) freezes the
// SUBMISSION-WEEK price into the reservation check (`proposal.annualSalary <
// ask.annualSalary`) and into the digest (`proposalDraft` ≈line 291 digests
// `annualSalary` and `signingBonus`), so ordinary fame drift between submission and
// the decision week invalidates every proposal. The two cases below pin the LAW
// (re-derivation), not the current defective behavior — both are expected RED.
//
// PREMISE NOT SATISFIED (searched, not assumed): a disposable probe (vite-node,
// not committed) checked every week-0 hiring-market actor's 52-week ask between
// week 40 (a week-0 52-week signing's renewal-window first week; 52-40=12=
// TUNING.HIRING_RENEWAL_WINDOW_WEEKS) and week 52, under the natural chain (the one
// `signContract` action, then pure `tick()` advancement, no other player action).
// None drifted: 6 candidates on seed 'p13a-core-causal-01' (this file's default
// fixture seed), 5 on 'p13b-s8-bridge-probe-01' (the diagnosis seed) — the world
// never touches an idle, uncast actor's `fame` week to week (fame only moves via
// the cast/reception path in `starPower.ts`, exercised only for actors actually cast
// in a production). So drift is INDUCED here by a direct edit to the subject's
// `fame` on `state.talent` (plain data, copy-on-write) after the proposal is
// submitted, and declared as this premise rather than pinned as an observed fact.

import { describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { hiringMarketIds } from '../src/core/employment.js'
import { tick } from '../src/core/tick.js'
import { p13aGeneratedStudio, advanceTo } from '../src/harness/p13a/fixtures.js'
import type { GameState } from '../src/core/types.js'
// RED-by-design: src/core/talentMarket.ts does not exist. These are the two
// imports from that new module in this file; submitProposal is CALLED below.
import { submitProposal, caseForTalent, proposalDraft, studioOffer } from '../src/core/talentMarket.js'
import { TUNING } from '../src/core/tuning.js'

function signActor(state: GameState, termWeeks: number): { state: GameState; talentId: string } {
  const candidates = hiringMarketIds(state, 0)
  const actorId = candidates.map((id) => state.talent.find((t) => t.id === id)).find((t) => t?.role === 'actor')?.id
  if (actorId === undefined) throw new Error('fixture assumption failed: no actor in the week-0 hiring market')
  const signed = applyActions(state, [{ kind: 'signContract', talentId: actorId, termWeeks }])
  return { state: signed, talentId: actorId }
}

type TalentMarketRoot = { cases: { talentId: string; status: string }[]; receipts: { kind: string; talentId: string; reasons: string[] }[] }
function marketOf(state: GameState): TalentMarketRoot {
  return (state as unknown as { talentMarket: TalentMarketRoot }).talentMarket
}

describe('P14A.1 test 5: atomic settlement', () => {
  it('a dominant incumbent proposal wins deterministically at the decision week, with order-only reasons and no amounts', () => {
    const { state: signed, talentId } = signActor(p13aGeneratedStudio(), 52)
    const atSubmission = advanceTo(signed, 45)
    const playerStudioId = atSubmission.hollywood!.playerStudioId
    const rivalStudioId = atSubmission.hollywood!.identities.find((s) => s.role === 'rival' && s.enteredWeek !== null)!.studioId

    let state = submitProposal(atSubmission, { talentId, issuerStudioId: playerStudioId, termWeeks: 52, premiumTier: 1.25 })
    state = submitProposal(state, { talentId, issuerStudioId: rivalStudioId, termWeeks: 52, premiumTier: 1.0 })
    expect(caseForTalent(state, talentId, state.market.tick)!.status).not.toBe('settled') // not yet — decision week (52) not reached

    state = advanceTo(state, 51)
    const preSettlement = state.contracts.find((c) => c.talentId === talentId)!
    expect(preSettlement.endWeekExclusive).toBe(52) // the ORIGINAL contract, unrenewed, one week before decision

    state = tick(state) // this tick advances market.tick 51 -> 52, the decision week: settlement runs
    expect(state.market.tick).toBe(52)

    const settledCase = caseForTalent(state, talentId, state.market.tick)!
    expect(settledCase.status).toBe('settled')

    // P10: the player's contract is renewed from the WINNING proposal's terms — startWeek 52, term 52.
    const renewed = state.contracts.find((c) => c.talentId === talentId)
    expect(renewed).toBeDefined()
    expect(renewed!.startWeek).toBe(52)
    expect(renewed!.endWeekExclusive).toBe(104)

    // P12/receipts: the old interval closed by expiry, a new player-contract start recorded.
    const employmentReceipts = state.hollywood!.receipts.filter((r) => r.kind === 'employment' && (r as { talentId: string }).talentId === talentId)
    expect(employmentReceipts.some((r) => (r as { reason: string }).reason === 'expiry')).toBe(true)
    expect(employmentReceipts.some((r) => (r as { reason: string }).reason === 'player-contract')).toBe(true)

    // P14: exactly one chooser receipt for this settlement, with order-only reasons (no amounts).
    const chooserReceipts = marketOf(state).receipts.filter((r) => r.talentId === talentId && r.kind !== 'discovered' && r.kind !== 'proposalSubmitted')
    expect(chooserReceipts.length).toBe(1)
    const reasons = chooserReceipts[0]!.reasons
    expect(reasons.length).toBeGreaterThan(0)
    for (const reason of reasons) {
      expect(reason).not.toMatch(/\$|\d{3,}/) // no dollar sign, no bare 3+-digit figure — ordering-only, never amounts
    }

    // "exactly once": a later tick does not re-settle or duplicate the chooser receipt.
    const again = tick(state)
    const chooserReceiptsAgain = marketOf(again).receipts.filter((r) => r.talentId === talentId && r.kind !== 'discovered' && r.kind !== 'proposalSubmitted')
    expect(chooserReceiptsAgain.length).toBe(1)
  })

  it("price drift does not invalidate a proposal's version: a proposal submitted at the window's first week settles at the re-derived decision-week price, not the submission-week quote", () => {
    const { state: signed, talentId } = signActor(p13aGeneratedStudio(), 52)
    // window opens when 0 < remaining <= HIRING_RENEWAL_WINDOW_WEEKS (12); for a
    // week-0 52-week signing the first window week is 52-12=40.
    const at40 = advanceTo(signed, 40)
    const playerStudioId = at40.hollywood!.playerStudioId
    const openView = caseForTalent(at40, talentId, 40)
    expect(openView).not.toBeNull()
    expect(openView!.status).not.toBe('settled') // open, not yet decided

    // The submission-week quote, captured BEFORE the drift is induced — this is the
    // frozen price the current (defective) code checks against at the decision week.
    const submissionQuote = proposalDraft(at40, playerStudioId, talentId, 52, 1.25, 40)
    let state = submitProposal(at40, { talentId, issuerStudioId: playerStudioId, termWeeks: 52, premiumTier: 1.25 })

    // PREMISE (see file header): no week-0 hiring-market actor drifts naturally on
    // this seed between week 40 and week 52. Drift is induced here by a direct fame
    // edit on the copy-on-write talent record, after submission.
    const subject = state.talent.find((t) => t.id === talentId)!
    const bumpedFame = subject.fame > 50 ? Math.max(0, subject.fame - 40) : Math.min(100, subject.fame + 40)
    state = { ...state, talent: state.talent.map((t) => (t.id === talentId ? { ...t, fame: bumpedFame } : t)) }

    state = advanceTo(state, 51)
    const preSettlement = state.contracts.find((c) => c.talentId === talentId)!
    expect(preSettlement.endWeekExclusive).toBe(52) // the original contract, unrenewed, one week before decision

    state = tick(state) // advances market.tick 51 -> 52, the decision week: settlement runs
    expect(state.market.tick).toBe(52)

    const settledCase = caseForTalent(state, talentId, state.market.tick)!
    // RED: currently 'declined' — survivesFreeze rejects the drifted proposal on the
    // frozen reservation check and the frozen digest (companion §2.1.4/§2.1.7).
    expect(settledCase.status).toBe('settled')

    const renewed = state.contracts.find((c) => c.talentId === talentId && c.startWeek === 52)
    expect(renewed).toBeDefined()

    // ask(W): studioOffer is a pure function of the talent record and any R1
    // release-floor receipt for (issuerStudioId, talentId). This is a RENEWAL (no
    // termination receipt for this pair exists), so the floor is null and the value
    // is identical whether read just before or just after the settling tick — the
    // POST-tick state is used here, as the task's instruction prefers.
    const atW = state
    const askAtW = studioOffer(atW, playerStudioId, talentId, 52, 52)
    const expectedAnnual = Math.round(askAtW.annualSalary * 1.25)
    expect(renewed!.annualSalary).toBe(expectedAnnual) // re-derived at the decision week, not frozen

    expect(renewed!.annualSalary).not.toBe(submissionQuote.annualSalary) // proves re-derivation, not a frozen quote

    const expectedBonus = Math.round(expectedAnnual * TUNING.CONTRACT_SIGNING_BONUS_FRACTION)
    expect(renewed!.signingBonus).toBe(expectedBonus)
  })

  it('the digest covers material terms only: a price drift leaves the version digest unchanged', () => {
    const { state: signed, talentId } = signActor(p13aGeneratedStudio(), 52)
    const at40 = advanceTo(signed, 40)
    const playerStudioId = at40.hollywood!.playerStudioId
    const draft40 = proposalDraft(at40, playerStudioId, talentId, 52, 1.25, 40)

    // PREMISE (see file header): drift induced by a direct fame edit — no week-0
    // hiring-market actor drifts naturally on this seed between week 40 and week 52.
    const subject = at40.talent.find((t) => t.id === talentId)!
    const bumpedFame = subject.fame > 50 ? Math.max(0, subject.fame - 40) : Math.min(100, subject.fame + 40)
    const drifted = { ...at40, talent: at40.talent.map((t) => (t.id === talentId ? { ...t, fame: bumpedFame } : t)) }
    const at51 = advanceTo(drifted, 51) // still before the decision week (52): startWeek is unaffected
    const draft51 = proposalDraft(at51, playerStudioId, talentId, 52, 1.25, 51)

    expect(draft51.startWeek).toBe(draft40.startWeek) // material terms unchanged (both derive decisionWeek 52)
    expect(draft51.annualSalary).not.toBe(draft40.annualSalary) // the induced premise actually drifted the price

    // RED: the current digest formula folds in annualSalary/signingBonus (derived,
    // not material), so this fails under the defective code even though every
    // material term (talentId, issuerStudioId, termWeeks, startWeek, premiumTier) matches.
    expect(draft51.digest).toBe(draft40.digest)
  })
})
