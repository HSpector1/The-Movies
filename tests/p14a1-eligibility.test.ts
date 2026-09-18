// ── P14A.1 test 1: Market eligibility — six states, reserved rivals cannot
// propose, in-term approaches refused ───────────────────────────────────────
//
// Requirement source: docs/engineering/playability-launch-review/plans/
// P14-HEADLESS-PLAN.md, "P14A.1 — One Contested Expiry Core" expansion,
// Tests item 1: "1 eligibility table (six states; reserved rivals cannot
// propose; in-term approaches refused)." Law: the plan's Scope paragraph and,
// by reference, docs/engineering/p14-preparation-8ef5246a/
// P14-PREPARATION-COMPANION.md §2.1.2 ("Market eligibility (direction 4)"),
// whose table is reproduced here as the six states under test:
//   1. contracted_outside_window — no case; nobody may propose (no in-term
//      approaches, no hidden tampering)
//   2. renewal_window — a case opens at the window's first week; the
//      incumbent and any ENTERED P12 rival may propose
//   3. retirement_announced — P14C; no market case; not reachable pre-P14C
//   4. free_agent — any entered studio, instant-sign, no case
//   5. finishing_commitments — P14C; not reachable pre-P14C
//   6. retired_or_ineligible — P14C; not reachable pre-P14C
// "Eligibility reads rivalEmployment/studioEmployerId and the contract
// window, never the employmentStatus string... A reserved rival
// (enteredWeek === null) cannot propose." (companion §2.1.2). Settled law:
// rulings §3.4.1 direction 4 ("no unrestricted in-term poaching... a
// legitimately free person... may be pursued immediately").
//
// RED-by-design: `src/core/talentMarket.ts` does not exist yet. `marketEligibility`
// is the ONE import from that new module, and it is CALLED below, so this file
// fails at module resolution before any test body runs — not on a coincidental
// assertion.
//
// INTERPRETATIONS NAMED (the plan describes the law, not a function signature):
//   1. `marketEligibility(state, talentId, week)` is assumed to return
//      `{ status: MarketEligibilityStatus; proposers: string[] }` — the six-way
//      status plus the set of studioIds the table's "who may propose" column
//      admits at that state/week. No other shape is asserted; only the
//      status value and proposer-set membership are checked.
//   2. Both are named identifiers the test author chose to express the plan's
//      "an eligibility classifier"; T2 may choose different names, in which
//      case only this file's import line needs updating, not its law.
//
// PREMISES NOT SATISFIED (named, not invented):
//   - `retirement_announced`, `finishing_commitments`, `retired_or_ineligible`
//     are P14C states. No accepted engine path (worldgen, actions, or the
//     p13a harness) produces a retirement-announced or lifecycle-transitioned
//     person; hand-forging one would invent P14C state shape the plan does
//     not define for P14A.1. These three rows are therefore NOT exercised
//     here; T2/T-author must add coverage once P14C lands.
//   - "No case opens during the founding draft" (companion §2.1.2) is not
//     exercised: grep of src/core/worldgen.ts and src/core/actions.ts shows
//     no live path sets `state.founding` to a non-null value in the current
//     engine (`generateWorld` always emits `founding: null`); hand-forging an
//     open founding draft would invent an unreachable shape. Not tested.

import { describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { hiringMarketIds } from '../src/core/employment.js'
import { p13aGeneratedStudio, advanceTo } from '../src/harness/p13a/fixtures.js'
import type { GameState } from '../src/core/types.js'
// RED-by-design: src/core/talentMarket.ts does not exist. This is the ONE
// import from that new module in this file.
import { marketEligibility } from '../src/core/talentMarket.js'

/** A fresh, deterministic natural campaign: rows 1-4 (player + 3 rivals) entered
 * at week 0; rows 5-9 reserved (eligibleWeek 520+, enteredWeek null). Measured
 * via vite-node probe, 2026-09-18, against seed 'p13a-core-causal-01' (the
 * harness default). */
function freshWorld(): GameState {
  return p13aGeneratedStudio()
}

/** Sign the first available actor from the week-0 hiring market for `termWeeks`. */
function signActor(state: GameState, termWeeks: number): { state: GameState; talentId: string } {
  const candidates = hiringMarketIds(state, 0)
  const actorId = candidates.map((id) => state.talent.find((t) => t.id === id)).find((t) => t?.role === 'actor')?.id
  if (actorId === undefined) throw new Error('fixture assumption failed: no actor in the week-0 hiring market')
  const signed = applyActions(state, [{ kind: 'signContract', talentId: actorId, termWeeks }])
  return { state: signed, talentId: actorId }
}

describe('P14A.1 test 1: market eligibility (six states; reserved rivals; in-term refusal)', () => {
  it('contracted_outside_window: a fresh 208-week player contract has no case and no eligible proposer', () => {
    const world = freshWorld()
    const { state, talentId } = signActor(world, 208)
    const result = marketEligibility(state, talentId, state.market.tick)
    expect(result.status).toBe('contracted_outside_window')
    expect(result.proposers).toEqual([])
  })

  it('renewal_window: a 52-week player contract at its window-open week (week 40) opens a case; the incumbent (player) and every ENTERED rival may propose', () => {
    const world = freshWorld()
    const { state: signed, talentId } = signActor(world, 52)
    const atWindow = advanceTo(signed, 40) // 52 - HIRING_RENEWAL_WINDOW_WEEKS(12) = 40, the window's first week
    const result = marketEligibility(atWindow, talentId, atWindow.market.tick)
    expect(result.status).toBe('renewal_window')
    const playerStudioId = atWindow.hollywood!.playerStudioId
    const enteredRivalIds = atWindow.hollywood!.identities.filter((s) => s.role === 'rival' && s.enteredWeek !== null).map((s) => s.studioId)
    expect(enteredRivalIds.length).toBeGreaterThan(0) // rows 2-4 are entered at week 0 (sanity: this table row is meaningfully populated)
    expect(result.proposers).toContain(playerStudioId)
    for (const id of enteredRivalIds) expect(result.proposers).toContain(id)
  })

  it('reserved rivals cannot propose: row 5 (eligibleWeek 520, enteredWeek null at week 40) is excluded from the renewal_window proposer set', () => {
    const world = freshWorld()
    const { state: signed, talentId } = signActor(world, 52)
    const atWindow = advanceTo(signed, 40)
    const reservedRival = atWindow.hollywood!.identities.find((s) => s.row === 5)!
    expect(reservedRival.enteredWeek).toBeNull() // sanity: genuinely reserved at this week
    const result = marketEligibility(atWindow, talentId, atWindow.market.tick)
    expect(result.proposers).not.toContain(reservedRival.studioId)
  })

  it('free_agent: a released person has no case and is not the renewal_window/contracted_outside_window status', () => {
    const world = freshWorld()
    const { state: signed, talentId } = signActor(world, 208)
    const released = applyActions(signed, [{ kind: 'releaseTalent', talentId }])
    const result = marketEligibility(released, talentId, released.market.tick)
    expect(result.status).toBe('free_agent')
  })

  it('in-term approaches are refused at the eligibility table: contracted_outside_window admits zero proposers even for an ENTERED rival studio', () => {
    const world = freshWorld()
    const { state, talentId } = signActor(world, 208)
    const anyEnteredRival = state.hollywood!.identities.find((s) => s.role === 'rival' && s.enteredWeek !== null)!.studioId
    const result = marketEligibility(state, talentId, state.market.tick)
    expect(result.proposers).not.toContain(anyEnteredRival)
    expect(result.proposers.length).toBe(0)
  })
})
