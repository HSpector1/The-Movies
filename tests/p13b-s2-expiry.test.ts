import { beforeAll, describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { tick } from '../src/core/tick.js'
import type { GameState } from '../src/core/types.js'
import { p13bTwoLabWorld, p13bTwoLabWorldWithEarlyHire } from '../src/harness/p13b/fixtures.js'

// P13B-S2 plan test 6 (task expansion, 2026-09-16): expiry/rehire across two
// Laboratories. Base scenario throughout: a synchronized-sound project with 4
// seats on Lab 1 and 2 seats on Lab 2 at a $60,000 ceiling — spend 40,000/20,000,
// raw 6/3 (in the old n+spend/20,000 sense), output 7.875/week (P13B-S2 plan
// test 4's own case (iii)). Every route below advances this same starting shape
// differently, so each case builds its own fresh branch.

const WORK_UNIT = 20_000
function rawUnitsOf(seats: number, spend: number): number { return seats * WORK_UNIT + spend }

describe('P13B-S2 expiry/rehire across Laboratories (test 6)', () => {
  let world: ReturnType<typeof p13bTwoLabWorld>
  let lab1: string, lab2: string

  beforeAll(() => {
    world = p13bTwoLabWorld()
    ;[lab1, lab2] = world.laboratoryFacilityIds
  }, 180_000)

  function stage(state: GameState, ids1: string[], ids2: string[], budgetPerWeek: number): { state: GameState; projectId: string } {
    let s = applyActions(state, ids1.map(scientistId => ({ kind: 'assignResearchScientist' as const, laboratoryFacilityId: lab1, scientistId, technologyId: 'synchronized-sound' as const })))
    s = applyActions(s, ids2.map(scientistId => ({ kind: 'assignResearchScientist' as const, laboratoryFacilityId: lab2, scientistId, technologyId: 'synchronized-sound' as const })))
    const projectId = s.technology.projects.find(p => p.technologyId === 'synchronized-sound')!.id
    s = applyActions(s, [{ kind: 'beginResearch', projectId, budgetPerWeek }])
    return { state: s, projectId }
  }

  describe('Case A: a Lab-2 seat released deliberately', () => {
    it('the next receipt carries a one-seat Lab-2 row with the spend split recomputed (5 seats: 40,000/10,000), output 6 + 0.625×1.5 = 6.9375; the Lab-1 row is unchanged in seats', () => {
      const ids = world.candidateIds
      const { state: begun, projectId } = stage(world.state, ids.slice(0, 4), ids.slice(4, 6), 60_000)
      const first = tick(begun)
      const firstReceipt = first.technology.projects.find(p => p.id === projectId)!.weeks[0]!
      // Sanity: the un-dropped week is plan test 4's own case (iii) — output 7.875/week.
      expect(firstReceipt.spend).toBe(60_000)
      expect(firstReceipt.units / 160_000).toBe(7.875)

      const released = applyActions(first, [{ kind: 'releaseResearchSeat', projectId, scientistId: ids[4]! }]) // drops one of Lab 2's two seats
      const next = tick(released)
      const project = next.technology.projects.find(p => p.id === projectId)!
      const receipt = project.weeks.at(-1)!
      expect(receipt.spend).toBe(50_000) // 5 seats now, usable = 10,000 x 5 = 50,000 < the 60,000 ceiling
      const rawLab1 = rawUnitsOf(4, 40_000)
      const rawLab2 = rawUnitsOf(1, 10_000)
      expect(receipt.labs).toEqual([
        { laboratoryFacilityId: lab1, seatTalentIds: ids.slice(0, 4), spend: 40_000, rawUnits: rawLab1 },
        { laboratoryFacilityId: lab2, seatTalentIds: [ids[5]], spend: 10_000, rawUnits: rawLab2 },
      ])
      expect(receipt.units / 160_000).toBe(6.9375)
    })
  })

  describe('Case B: a genuinely lapsed contract on Lab 2', () => {
    // The task's own illustrative earlyWeek (600, lapsing 808) assumes the
    // project is still running 28 weeks in — it is not, at this ceiling/team
    // size (64 units / 7.875 per week ≈ 9 funded weeks). earlyWeek is chosen
    // here instead so the SAME 4+2 @ $60,000 shape actually still has the
    // contract active for several weeks before it lapses mid-run: recruit at
    // 576 so the 208-week contract ends at 784, four ticks (780-783) into the
    // nine-week project.
    const EARLY_WEEK = 576 // 576 + 208 = 784
    let early: ReturnType<typeof p13bTwoLabWorldWithEarlyHire>
    let projectId: string
    let lab1Ids: string[], lab2Ids: string[]

    beforeAll(() => {
      early = p13bTwoLabWorldWithEarlyHire(EARLY_WEEK)
      const ids = early.candidateIds
      lab1Ids = [ids[1]!, ids[2]!, ids[3]!, ids[4]!]
      lab2Ids = [early.earlyCandidateId, ids[5]!] // the early hire sits on Lab 2
      expect(early.earlyCandidateId).toBe(ids[0]) // t-sci-00, by researchCandidates' own stable order
    }, 180_000)

    it('drops only the lapsed seat from Lab 2\'s row at the lapse week; Lab 1\'s row is untouched; payroll for that person stops', () => {
      const [labA, labB] = early.laboratoryFacilityIds
      let s = applyActions(early.state, lab1Ids.map(scientistId => ({ kind: 'assignResearchScientist' as const, laboratoryFacilityId: labA, scientistId, technologyId: 'synchronized-sound' as const })))
      s = applyActions(s, lab2Ids.map(scientistId => ({ kind: 'assignResearchScientist' as const, laboratoryFacilityId: labB, scientistId, technologyId: 'synchronized-sound' as const })))
      const project0 = s.technology.projects.find(p => p.technologyId === 'synchronized-sound')!
      projectId = project0.id
      s = applyActions(s, [{ kind: 'beginResearch', projectId, budgetPerWeek: 60_000 }])

      for (let i = 0; i < 4; i++) s = tick(s) // weeks 780..783: the early hire's contract is still active (576..784)
      const beforeLapse = s.technology.projects.find(p => p.id === projectId)!.weeks.at(-1)!
      expect(beforeLapse.week).toBe(783)
      expect(beforeLapse.spend).toBe(60_000) // still 4+2 seats, unaffected

      s = tick(s) // week 784: the early hire's contract has just lapsed (endWeekExclusive 784)
      const afterLapse = s.technology.projects.find(p => p.id === projectId)!.weeks.at(-1)!
      expect(afterLapse.week).toBe(784)
      const rawLab1 = rawUnitsOf(4, 40_000)
      const rawLab2 = rawUnitsOf(1, 10_000)
      expect(afterLapse.labs).toEqual([
        { laboratoryFacilityId: labA, seatTalentIds: lab1Ids, spend: 40_000, rawUnits: rawLab1 }, // unchanged in seats and spend
        { laboratoryFacilityId: labB, seatTalentIds: [lab2Ids[1]!], spend: 10_000, rawUnits: rawLab2 },
      ])
      // FINDING: `weeklyResearchPayroll(state, week)` cannot answer a RETROACTIVE
      // week once time has moved past a contract's own end — `state.contracts`
      // drops an expired row as part of the very tick that crosses its
      // `endWeekExclusive` (confirmed by direct inspection: the row is present
      // through market.tick 783 and gone the instant market.tick reaches 784),
      // so passing an explicit past `week` no longer finds it. The permanent,
      // reconciled record is the `researchPayroll` LEDGER row instead (one
      // combined row per week, mirroring tests/p13b-s1-scheduler.test.ts's own
      // `payrollRow` pattern), which is what is asserted here.
      const payrollRow = (week: number) => -s.ledger.find(e => e.kind === 'researchPayroll' && e.week === week)!.amount
      expect(payrollRow(784)).toBeLessThan(payrollRow(783))

      // Requirement-derived correction, recorded as a finding (not a silent
      // deviation from the brief): this project still has FIVE other eligible
      // seats after the lapse, so it never auto-pauses — the frozen S1 law this
      // engine actually implements for that shape is fixtureA's ("lets the same
      // expired id be rehired mid-project with no new seat row and no resume
      // needed while active, then names it in the next receipt",
      // tests/p13b-s1-scheduler.test.ts), NOT fixtureB's single-seat auto-pause
      // wording ("no auto-resume... stays ineligible until an explicit
      // assignResearchScientist/resumeResearch") the brief quoted for this case.
      // fixtureB's wording applies when the lapsed seat is the project's ONLY
      // eligible seat, which is not this shape. Asserted below is the behaviour
      // this repository's own regression-tested S1 law actually specifies for a
      // still-active, multi-seat project.
      const rehired = applyActions(s, [{ kind: 'recruitScientist', laboratoryFacilityId: labB, scientistId: early.earlyCandidateId }])
      expect(rehired.technology).toBe(s.technology) // recruiting touches employment only, never technology (fixtureA's own assertion)
      expect(rehired.technology.projects.find(p => p.id === projectId)!.status).toBe('active')

      const resumedWeek = tick(rehired)
      const resumedReceipt = resumedWeek.technology.projects.find(p => p.id === projectId)!.weeks.at(-1)!
      expect(resumedReceipt.week).toBe(785)
      expect(resumedReceipt.spend).toBe(60_000) // back to the full 4+2 seats and spend
      expect(resumedReceipt.labs).toEqual([
        { laboratoryFacilityId: labA, seatTalentIds: lab1Ids, spend: 40_000, rawUnits: rawLab1 },
        { laboratoryFacilityId: labB, seatTalentIds: lab2Ids, spend: 20_000, rawUnits: rawUnitsOf(2, 20_000) },
      ])
    }, 60_000)
  })

  describe('Case C: every Lab-2 seat gone', () => {
    it('the receipt drops to one row (Lab 1 only); output = raw_a/20,000 only (S1\'s single-Laboratory math), labs.length === 1', () => {
      const ids = world.candidateIds
      const { state: begun, projectId } = stage(world.state, ids.slice(0, 4), ids.slice(4, 6), 60_000)
      const released = applyActions(begun, [
        { kind: 'releaseResearchSeat', projectId, scientistId: ids[4]! },
        { kind: 'releaseResearchSeat', projectId, scientistId: ids[5]! },
      ])
      const next = tick(released)
      const project = next.technology.projects.find(p => p.id === projectId)!
      const receipt = project.weeks.at(-1)!
      expect(receipt.spend).toBe(40_000) // 4 seats now, usable = 10,000 x 4 = 40,000 < the 60,000 ceiling
      const rawLab1 = rawUnitsOf(4, 40_000)
      expect(receipt.labs).toEqual([{ laboratoryFacilityId: lab1, seatTalentIds: ids.slice(0, 4), spend: 40_000, rawUnits: rawLab1 }])
      expect(receipt.labs).toHaveLength(1)
      expect(receipt.units).toBe(8 * rawLab1)
      expect(receipt.units / 160_000).toBe(rawLab1 / WORK_UNIT) // output = raw_a/20,000 only — no cooperation weighting with one Laboratory
      expect(receipt.units / 160_000).toBe(6)
    })
  })
})
