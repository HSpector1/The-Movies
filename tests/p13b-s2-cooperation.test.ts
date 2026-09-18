import { beforeAll, describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { researchWeekQuote } from '../src/core/technology.js'
import { tick } from '../src/core/tick.js'
import type { GameState } from '../src/core/types.js'
import { p13bTwoLabWorld } from '../src/harness/p13b/fixtures.js'

// P13B-S2 plan test 4 (task expansion, 2026-09-16): cooperation arithmetic
// across two Laboratories — proportional per-Lab funding with the whole-dollar
// remainder to the lowest stable Lab id, the unequal-team output rule
// a + 0.625*b, and the fixed-point work numerator rebased to 1/160,000 so that
// rule is exact in integers (companion §4 / 03). Every case below is asserted
// both through `researchWeekQuote` (the pre-commit preview) and a real `tick`
// (the committed receipt), per the plan's own instruction. Generated worlds
// only; the two-Laboratory world is shared read-only across cases from one
// `beforeAll` build (base state is never mutated — every case branches off it
// with its own `applyActions` call, the same pattern as
// tests/p13b-s1-scheduler.test.ts's `branch()` helper).

const WORK_UNIT = 20_000 // S1's base: one whole dollar earns 1/20,000 of a Lab's own raw output.
const PROJECT_UNIT = 160_000 // S2's rebased project-credit base (WORK_UNIT * 8), so a + 0.625*b is exact.

/** The per-Lab raw output numerator, S1's own formula, always exact over WORK_UNIT. */
function rawUnitsOf(seats: number, spend: number): number {
  return seats * WORK_UNIT + spend
}
/** Project-level credit for one week: units === 8*rawUnits_a + 5*rawUnits_b, a >= b, exact over PROJECT_UNIT. */
function projectUnits(rawA: number, rawB: number): number {
  const [a, b] = rawA >= rawB ? [rawA, rawB] : [rawB, rawA]
  return 8 * a + 5 * b
}

type Split = { lab1Spend: number; lab2Spend: number }
/** The stated law: spend = min(ceiling, 10,000*n_total); per-Lab spend = floor(spend*n_L/n_total), whole-dollar remainder to the LOWEST stable Lab id. */
function splitSpend(spend: number, n1: number, n2: number, lowerIsLab1: boolean): Split {
  const nTotal = n1 + n2
  let s1 = Math.floor(spend * n1 / nTotal)
  let s2 = Math.floor(spend * n2 / nTotal)
  const remainder = spend - (s1 + s2)
  if (lowerIsLab1) s1 += remainder; else s2 += remainder
  return { lab1Spend: s1, lab2Spend: s2 }
}

describe('P13B-S2 cooperation arithmetic across two Laboratories (test 4)', () => {
  let world: ReturnType<typeof p13bTwoLabWorld>
  let lab1: string, lab2: string, lowerIsLab1: boolean
  beforeAll(() => {
    world = p13bTwoLabWorld()
    ;[lab1, lab2] = world.laboratoryFacilityIds
    lowerIsLab1 = lab1 < lab2 // "stable Lab id order" — plain string comparison, same law the catalogue uses for its own ids.
  }, 180_000)

  /** Stages one synchronized-sound project with seats1 on lab1 and seats2 on lab2, begun at budgetPerWeek. */
  function stage(seats1: number, seats2: number, budgetPerWeek: number): { state: GameState; projectId: string } {
    const ids1 = world.candidateIds.slice(0, seats1)
    const ids2 = world.candidateIds.slice(seats1, seats1 + seats2)
    let state = applyActions(world.state, ids1.map(scientistId =>
      ({ kind: 'assignResearchScientist' as const, laboratoryFacilityId: lab1, scientistId, technologyId: 'synchronized-sound' as const })))
    if (seats2 > 0) {
      state = applyActions(state, ids2.map(scientistId =>
        ({ kind: 'assignResearchScientist' as const, laboratoryFacilityId: lab2, scientistId, technologyId: 'synchronized-sound' as const })))
    }
    const projectId = state.technology.projects.find(p => p.technologyId === 'synchronized-sound' && p.studioId === state.hollywood!.playerStudioId)!.id
    state = applyActions(state, [{ kind: 'beginResearch', projectId, budgetPerWeek }])
    return { state, projectId }
  }

  it('(i) two full Labs (4+4) at $80,000: spend 40,000/40,000, raw 6/6, output 9.75/week, 7 funded weeks, verifiedWork 64 and expenditure 560,000 after 7 weeks (final week capped, full spend charged)', () => {
    const { state, projectId } = stage(4, 4, 80_000)
    const project = state.technology.projects.find(p => p.id === projectId)!
    const quote = researchWeekQuote(state, project)
    expect(quote.spend).toBe(80_000)
    expect(quote.output).toBe(9.75)
    expect(quote.remainingWeeks).toBe(7)

    let advancing = state
    for (let i = 0; i < 7; i++) advancing = tick(advancing)
    const finalProject = advancing.technology.projects.find(p => p.id === projectId)!
    expect(finalProject.verifiedWork).toBe(64)
    expect(finalProject.expenditure).toBe(560_000)

    const first = finalProject.weeks[0]!
    const expectedRaw = rawUnitsOf(4, 40_000)
    const [lowId, highId] = [lab1, lab2].sort()
    expect(first.labs).toEqual([
      { laboratoryFacilityId: lowId, seatTalentIds: expect.any(Array), spend: 40_000, rawUnits: expectedRaw },
      { laboratoryFacilityId: highId, seatTalentIds: expect.any(Array), spend: 40_000, rawUnits: expectedRaw },
    ])
    expect(first.spend).toBe(80_000)
    expect(first.units).toBe(projectUnits(expectedRaw, expectedRaw))
    expect(first.units / PROJECT_UNIT).toBe(9.75)

    const finalWeek = finalProject.weeks.at(-1)!
    expect(finalWeek.spend).toBe(80_000) // full spend charged even though output was capped
    const spentTotal = finalProject.weeks.reduce((sum, r) => sum + r.spend, 0)
    expect(spentTotal).toBe(560_000)
  })

  it('(ii) two full Labs (4+4) at $40,000: spend 20,000/20,000, raw 5/5, output 8.125/week', () => {
    const { state, projectId } = stage(4, 4, 40_000)
    const project = state.technology.projects.find(p => p.id === projectId)!
    const quote = researchWeekQuote(state, project)
    expect(quote.spend).toBe(40_000)
    expect(quote.output).toBe(8.125)
    const expectedRaw = rawUnitsOf(4, 20_000)
    expect(quote.output * PROJECT_UNIT).toBe(projectUnits(expectedRaw, expectedRaw))
  })

  it('(iii) 4 + 2 seats at $60,000: spend 40,000/20,000, raw 6/3, output 7.875/week', () => {
    const { state, projectId } = stage(4, 2, 60_000)
    const project = state.technology.projects.find(p => p.id === projectId)!
    const quote = researchWeekQuote(state, project)
    expect(quote.spend).toBe(60_000)
    expect(quote.output).toBe(7.875)
    const rawA = rawUnitsOf(4, 40_000)
    const rawB = rawUnitsOf(2, 20_000)
    expect(quote.output * PROJECT_UNIT).toBe(projectUnits(rawA, rawB))
  })

  it('(iv) 3 + 2 seats at $33,333: whole-dollar remainder to the lowest stable Lab id, exact fixed-point raw and output', () => {
    // The 3-seat group is staged on the Laboratory with the lower stable id, so
    // the remainder assignment is deterministic and computed (not guessed) from
    // the actual ids, per the plan's own "compute from the actual ids" note.
    const [n1, n2] = lowerIsLab1 ? [3, 2] : [2, 3]
    const { state, projectId } = stage(n1, n2, 33_333)
    const project = state.technology.projects.find(p => p.id === projectId)!
    const quote = researchWeekQuote(state, project)
    expect(quote.spend).toBe(33_333)
    const { lab1Spend, lab2Spend } = splitSpend(33_333, n1, n2, lowerIsLab1)
    expect(lab1Spend + lab2Spend).toBe(33_333)
    const rawLab1 = rawUnitsOf(n1, lab1Spend)
    const rawLab2 = rawUnitsOf(n2, lab2Spend)
    const expectedOutput = projectUnits(rawLab1, rawLab2) / PROJECT_UNIT
    expect(quote.output).toBe(expectedOutput)
  })

  it('(v) one Laboratory only (4 seats at $40,000): unchanged S1 output 6, but the receipt now carries the new per-Lab `labs` breakdown', () => {
    const { state, projectId } = stage(4, 0, 40_000)
    const project = state.technology.projects.find(p => p.id === projectId)!
    const quote = researchWeekQuote(state, project)
    expect(quote.spend).toBe(40_000)
    expect(quote.output).toBe(6) // unchanged S1 math — a regression check, not a new S2 behaviour
    const ticked = tick(state)
    const receipt = ticked.technology.projects.find(p => p.id === projectId)!.weeks.at(-1)!
    expect(receipt.labs).toEqual([{ laboratoryFacilityId: lab1, seatTalentIds: world.candidateIds.slice(0, 4), spend: 40_000, rawUnits: rawUnitsOf(4, 40_000) }])
  })
})
