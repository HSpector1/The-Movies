// ── P14A.1 test 7: Firing — the 26-week cap, the anti-exploit floor (R1),
// and the confirmation's disclosure content per direction 2 ────────────────
//
// Requirement source: P14-HEADLESS-PLAN.md, P14A.1 expansion, Tests item 7:
// "7 firing: the 26-week cap, the anti-exploit floor (R1), AND the
// confirmation's disclosure content per direction 2 (remaining duration,
// remaining guaranteed compensation, the cap where it applies, the exact
// charge, the effective end, the other authoritative consequences — the two
// copy branches of companion §3.4)." Law: rulings §3.4.1 direction 2 ("The
// charge is the lesser of (a) all remaining guaranteed base salary... and
// (b) twenty-six weeks of that person's base salary... The confirmation must
// disclose remaining contract duration, remaining guaranteed compensation,
// the 26-week cap where it applies, the exact charge, the effective
// employment end and every other authoritative consequence.") and companion
// §3.2 ("charge = weekly × min(remaining, 26) (NEW: replaces round(0.5 ×
// guaranteed))... The charge equals today's at exactly 52 weeks remaining...
// higher below 52 weeks... lower above.") and §3.5 ("The guard: a persistent
// salary expectation toward the releasing studio (recommended, R1)... the
// person's ask toward the releasing StudioId is floored at the terminated
// contract's annualSalary... until its original endWeekExclusive... no new
// persisted fact").
//
// RED-by-design: `src/core/talentMarket.ts` does not exist yet. `releaseFloor`
// and `releaseDisclosure` are imported from that new module and `releaseFloor`
// is CALLED below, so this file fails at module resolution before any test
// body runs. `terminationCost`/`weeklySalary`/`guaranteedComp`
// (src/core/employment.ts) are REAL, already-exported functions this file
// asserts the RECALIBRATED law against — the plan's ownership matrix names
// this a P10 generalization (§2.5: "the recalibrated charge law"), so the
// same export is expected to carry the new law, not a new talentMarket.ts
// wrapper. If T2 instead adds a new wrapper, this file's import lines (not
// its law) need revision.
//
// INTERPRETATIONS NAMED:
//   1. `releaseFloor(state, releasingStudioId, talentId)` is assumed to
//      return `{ floorAnnual: number; validUntilWeek: number } | null` — the
//      highest unexpired terminated-contract salary for that
//      (studio,person) pair, or null before any release. Only these two
//      fields are asserted.
//   2. `releaseDisclosure(state, talentId, week)` is assumed to return
//      `{ remainingWeeks, remainingGuaranteedCompensation, capApplies,
//      charge, effectiveEndWeek }` — the six facts direction 2 requires,
//      minus "other authoritative consequences" (asserted only by shape:
//      the function exists and returns the five numeric/boolean facts;
//      the free-text consequence list is NOT pinned, since its exact wording
//      is bridge-owned copy, not Core law).
//
// PREMISES NOT SATISFIED:
//   - R2 (the busy-set and founding-draft release refusal extension) is NOT
//     exercised here: the plan's Tests item 7 text names only the cap, R1
//     and the disclosure content, not R2; R2 is Scope-paragraph text without
//     its own enumerated test-item number in P14A.1's Tests 1-9, so it is
//     out of this file's assigned scope, not overlooked.
//   - The exact worked-example dollar figures of companion §3.3 (LOW/MID/
//     HIGH/STAR) are not reproduced: they depend on a specific talent's
//     exact OVR/fame under worldgen, which this file does not pin. Instead
//     the LAW (`charge = weekly × min(remaining, 26)`) is asserted directly
//     against a real, engine-priced contract, which is what the table's own
//     rows are stated to reproduce.
//   - Proving the floor changes a LATER market ask (the round-trip-closing
//     effect of R1) needs a scenario where the person's market ask falls
//     in-term, which (per companion §3.5) requires fame loss from a visible
//     flop or a P14C aging effect — neither is exercised by this fixture.
//     Only `releaseFloor`'s own return value and its validity window are
//     asserted, not its downstream effect on a later `proposalDraft`/
//     `contractOffer` price.

import { describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { guaranteedComp, hiringMarketIds, terminationCost, weeklySalary } from '../src/core/employment.js'
import { p13aGeneratedStudio, advanceTo } from '../src/harness/p13a/fixtures.js'
import type { GameState } from '../src/core/types.js'
// RED-by-design: src/core/talentMarket.ts does not exist. These are the two
// imports from that new module in this file; releaseFloor is CALLED below.
import { releaseFloor, releaseDisclosure } from '../src/core/talentMarket.js'

function signActor(state: GameState, termWeeks: number): { state: GameState; talentId: string } {
  const candidates = hiringMarketIds(state, 0)
  const actorId = candidates.map((id) => state.talent.find((t) => t.id === id)).find((t) => t?.role === 'actor')?.id
  if (actorId === undefined) throw new Error('fixture assumption failed: no actor in the week-0 hiring market')
  const signed = applyActions(state, [{ kind: 'signContract', talentId: actorId, termWeeks }])
  return { state: signed, talentId: actorId }
}

describe('P14A.1 test 7: firing — 26-week cap, R1 floor, disclosure content', () => {
  it('the cap applies when more than 26 weeks remain: charge = weekly × 26, strictly less than the discarded 50%-of-guaranteed rule', () => {
    const { state, talentId } = signActor(p13aGeneratedStudio(), 208)
    const contract = state.contracts.find((c) => c.talentId === talentId)!
    const week = 0
    const remaining = contract.endWeekExclusive - week
    expect(remaining).toBeGreaterThan(26)
    const expected = weeklySalary(contract.annualSalary) * 26
    expect(terminationCost(contract, week)).toBe(expected)
    const oldRule = Math.round(0.5 * guaranteedComp(contract, week))
    expect(terminationCost(contract, week)).not.toBe(oldRule) // recalibrated away from the discarded 50% law
  })

  it('the cap does NOT apply when 26 or fewer weeks remain: charge = all remaining guaranteed base salary, unchanged from today\'s formula at that boundary', () => {
    const { state: signed, talentId } = signActor(p13aGeneratedStudio(), 52)
    const state = advanceTo(signed, 30) // 52 - 30 = 22 weeks remaining
    const contract = state.contracts.find((c) => c.talentId === talentId)!
    const remaining = contract.endWeekExclusive - state.market.tick
    expect(remaining).toBe(22)
    expect(remaining).toBeLessThanOrEqual(26)
    const expected = weeklySalary(contract.annualSalary) * remaining
    expect(terminationCost(contract, state.market.tick)).toBe(expected)
    expect(expected).toBe(guaranteedComp(contract, state.market.tick)) // no cap bite: charge equals the full remaining guarantee
  })

  it('the charge law is continuous at exactly 26 weeks remaining (no cliff, §3.5 E5)', () => {
    const { state: signed, talentId } = signActor(p13aGeneratedStudio(), 208)
    const state = advanceTo(signed, 182) // 208 - 182 = 26 weeks remaining, exactly the cap boundary
    const contract = state.contracts.find((c) => c.talentId === talentId)!
    expect(contract.endWeekExclusive - state.market.tick).toBe(26)
    expect(terminationCost(contract, state.market.tick)).toBe(weeklySalary(contract.annualSalary) * 26)
  })

  it('R1 floor: a released person\'s ask toward the releasing studio is floored at the terminated contract\'s annual salary, valid until the ORIGINAL endWeekExclusive', () => {
    const { state: signed, talentId } = signActor(p13aGeneratedStudio(), 208)
    const originalContract = signed.contracts.find((c) => c.talentId === talentId)!
    const playerStudioId = signed.hollywood!.playerStudioId
    expect(releaseFloor(signed, playerStudioId, talentId)).toBeNull() // no release has happened yet
    const released = applyActions(signed, [{ kind: 'releaseTalent', talentId }])
    const floor = releaseFloor(released, playerStudioId, talentId)!
    expect(floor).not.toBeNull()
    expect(floor.floorAnnual).toBe(originalContract.annualSalary)
    expect(floor.validUntilWeek).toBe(originalContract.endWeekExclusive)
  })

  it('the disclosure content per direction 2 states remaining duration, remaining guaranteed compensation, the cap, the exact charge, and the effective end — two branches (cap applies / cap does not apply)', () => {
    const { state: capApplies, talentId: id1 } = signActor(p13aGeneratedStudio(), 208)
    const d1 = releaseDisclosure(capApplies, id1, 0)
    const c1 = capApplies.contracts.find((c) => c.talentId === id1)!
    expect(d1.remainingWeeks).toBe(208)
    expect(d1.remainingGuaranteedCompensation).toBe(guaranteedComp(c1, 0))
    expect(d1.capApplies).toBe(true)
    expect(d1.charge).toBe(weeklySalary(c1.annualSalary) * 26)
    expect(d1.effectiveEndWeek).toBe(0)

    const { state: signed2, talentId: id2 } = signActor(p13aGeneratedStudio(), 52)
    const noCap = advanceTo(signed2, 45) // 52 - 45 = 7 weeks remaining
    const d2 = releaseDisclosure(noCap, id2, noCap.market.tick)
    const c2 = noCap.contracts.find((c) => c.talentId === id2)!
    expect(d2.remainingWeeks).toBe(7)
    expect(d2.capApplies).toBe(false)
    expect(d2.charge).toBe(guaranteedComp(c2, noCap.market.tick))
    expect(d2.effectiveEndWeek).toBe(45)
  })
})
