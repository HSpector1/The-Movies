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

import { describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { hiringMarketIds } from '../src/core/employment.js'
import { tick } from '../src/core/tick.js'
import { p13aGeneratedStudio, advanceTo } from '../src/harness/p13a/fixtures.js'
import type { GameState } from '../src/core/types.js'
// RED-by-design: src/core/talentMarket.ts does not exist. These are the two
// imports from that new module in this file; submitProposal is CALLED below.
import { submitProposal, caseForTalent } from '../src/core/talentMarket.js'

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
})
