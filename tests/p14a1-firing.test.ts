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
// P14A.1 T2 landed at `d49cc27`: `src/core/talentMarket.ts` now exists
// (Save V28, `releaseFloor`/`studioOffer`/`proposalDraft`/`releaseDisclosure`
// real and exported); this file's original RED-by-module-resolution cause is
// gone (all 5 cases above pass, evidence `p14a1-20260918/08-engine-p14a1-suite.txt`).
// ADDED (coordinator instruction, post-T2): one more case closing exploit E1
// (rulings §3.4.1 direction 3, companion §3.5) on the REAL player action
// paths. ENGINE FACT, verified directly against `d49cc27` source: `studioOffer`
// (talentMarket.ts) floors the ask through `releaseFloor` BEFORE any premium
// tier, and `proposalDraft` calls `studioOffer` — so the MARKET-CASE path is
// floored. But `src/core/actions.ts`'s `applySignContract` (≈2628) and
// `applyRenewContract` (≈2714) still price through the floor-FREE
// `contractOffer`, never `studioOffer` — grep of `src/core/actions.ts`
// confirms `studioOffer` is not imported there at all. So the REAL player
// re-sign action (`signContract` on a released free agent) is NOT floored
// today: this is a genuine, reproducible E1 gap, not a testing artifact.
//
// `terminationCost`/`weeklySalary`/`guaranteedComp` (src/core/employment.ts)
// are REAL, already-exported functions this file asserts the RECALIBRATED
// law against — confirmed carrying the new law directly (case 1 above,
// green).
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
//   - The NEW E1 case (below) proves the floor's downstream effect on the
//     REAL `signContract` re-sign action WITHOUT needing a fame-loss/aging
//     scenario: a term-length switch (52 -> 208 weeks) alone lowers the
//     plain ask below the floor, deterministically, via
//     `TUNING.CONTRACT_LENGTH_FACTOR` (companion §3.5 E1: "Term switching
//     alone... a one-year 1.08x to four-year 0.90x switch is a 16.7% drop").
//     Verified by direct probe against `d49cc27`: a real 52-week signing
//     followed by a real release and a real 208-week re-sign prices at
//     546,797 (unfloored) where the floor requires >= 656,156 — the two are
//     genuinely, numerically distinguishable, not a coincidental tie.
//   - `applyRenewContract`'s SAME floor-free `contractOffer` call is NOT
//     independently exercised via `renewContract`, because it is
//     UNREACHABLE in a normal campaign: `caseOpenForTalent` is checked
//     BEFORE pricing (src/core/actions.ts ≈2709), and every renewal-window
//     contract opens a case as soon as any rival has entered — which every
//     accepted campaign has from week 0 (HOLLYWOOD_STARTING_MANIFEST rows
//     2-4). So `renewContract` on any window-eligible contract is refused
//     with `underMarketCase` (tests/p14a1-case.test.ts) before it ever
//     reaches the floor-free price. The coordinator's "where the window
//     allows" clause is read as conditional on this reachability; this file
//     finds it unreachable and names the finding here rather than asserting
//     an unreachable path.

import { describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { contractOffer, guaranteedComp, hiringMarketIds, terminationCost, weeklySalary } from '../src/core/employment.js'
import { p13aGeneratedStudio, advanceTo } from '../src/harness/p13a/fixtures.js'
import type { GameState } from '../src/core/types.js'
import { releaseFloor, releaseDisclosure, studioOffer } from '../src/core/talentMarket.js'

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

  it('E1 closed by R1: releasing a person, then re-signing the SAME PersonId to the SAME studio through the real player signContract, must be floored at the terminated contract\'s annual salary — not the plain (lower) market ask', () => {
    const { state: signed, talentId } = signActor(p13aGeneratedStudio(), 52)
    const originalContract = signed.contracts.find((c) => c.talentId === talentId)!
    const playerStudioId = signed.hollywood!.playerStudioId
    const released = applyActions(signed, [{ kind: 'releaseTalent', talentId }])
    const floor = releaseFloor(released, playerStudioId, talentId)!
    expect(floor.floorAnnual).toBe(originalContract.annualSalary)
    expect(released.market.tick).toBeLessThan(floor.validUntilWeek) // the floor is genuinely still valid at re-sign time

    // Sanity: a 208-week re-sign's PLAIN ask is genuinely, numerically LOWER
    // than the floor (the CONTRACT_LENGTH_FACTOR drop from a 1-year to a
    // 4-year term alone does this — no fame loss or aging needed), so this
    // case is a real test of the floor, not a vacuous tie.
    const plainAsk = contractOffer(released, talentId, 208, released.market.tick)
    expect(plainAsk.annualSalary).toBeLessThan(floor.floorAnnual)

    // The re-sign must price through the studio-aware, floored entry.
    const correctlyFloored = studioOffer(released, playerStudioId, talentId, 208, released.market.tick)
    expect(correctlyFloored.annualSalary).toBe(floor.floorAnnual) // the floor is the binding constraint here

    // The REAL player action path — this is the requirement under test.
    const resigned = applyActions(released, [{ kind: 'signContract', talentId, termWeeks: 208 }])
    const newContract = resigned.contracts.find((c) => c.talentId === talentId)!
    expect(newContract.annualSalary).toBe(correctlyFloored.annualSalary) // floored — E1's cheaper round trip must be impossible
    expect(newContract.annualSalary).toBeGreaterThanOrEqual(floor.floorAnnual)
  })
})
