import { beforeAll, describe, expect, it } from 'vitest'
import { makeSave } from '../src/core/save.js'
import { generateScientist } from '../src/core/worldgen.js'
import type { GameState } from '../src/core/types.js'
import { p13aResearchEntry } from '../src/harness/p13a/fixtures.js'
import { p13bStaffedProject } from '../src/harness/p13b/fixtures.js'

// P13B-S1 plan test 9: validator refusals on the v2 (V21) technology root. Each
// case starts from a lawful, generated, staffed save (>=2 real receipts) and
// mutates exactly one forged fact on a structuredClone, mirroring the
// established `rejected(source, change, message)` pattern from
// tests/p13a-technology-validation.test.ts.
let base2: GameState // 2 seats, room for a forged 3rd/unemployed seat without tripping the capacity check
let base4: GameState // 4 seats — the Laboratory's capacity, for the "fifth seat" refusal
beforeAll(() => {
  const entry = p13aResearchEntry()
  base2 = p13bStaffedProject(entry, 3, 20_000, 2).state
  base4 = p13bStaffedProject(entry, 2, 40_000, 4).state
  // Both baselines are lawful before any mutation.
  makeSave(base2)
  makeSave(base4)
}, 120_000)

function rejected(source: GameState, change: (state: GameState) => void, message: RegExp) {
  const changed = structuredClone(source)
  change(changed)
  expect(() => makeSave(changed)).toThrow(message)
}

describe('P13B-S1 validator refusals on Save V21 (test 9)', () => {
  it('accepts the unmutated staffed saves', () => {
    expect(() => makeSave(base2)).not.toThrow()
    expect(() => makeSave(base4)).not.toThrow()
  })

  it('rejects a forged receipt unit count that no longer matches its seats and charge', () => {
    rejected(base2, state => {
      const project = state.technology.projects[0]!
      project.weeks[0]!.units += 1
    }, /units do not match|does not reconcile/)
  })

  it('rejects a receipt naming a Scientist who was never employed that week, even with a seat forged to cover it', () => {
    rejected(base2, state => {
      const project = state.technology.projects[0]!
      const outsider = generateScientist(state.seed, 't-sci-04')
      state.talent.push(outsider)
      project.seats.push({ talentId: outsider.id, laboratoryFacilityId: project.laboratoryFacilityId, assignedWeek: project.weeks[0]!.week, releasedWeek: null })
      project.weeks[0]!.seatTalentIds = [...project.weeks[0]!.seatTalentIds, outsider.id]
    }, /unemployed Scientist/)
  })

  it('rejects a fifth unreleased seat on a four-seat Laboratory', () => {
    rejected(base4, state => {
      const project = state.technology.projects[0]!
      const outsider = generateScientist(state.seed, 't-sci-04')
      state.talent.push(outsider)
      project.seats.push({ talentId: outsider.id, laboratoryFacilityId: project.laboratoryFacilityId, assignedWeek: state.market.tick, releasedWeek: null })
    }, /exceed capacity/)
  })

  it('rejects a duplicate unreleased seat for one already-seated person', () => {
    rejected(base2, state => {
      const project = state.technology.projects[0]!
      project.seats.push({ ...project.seats[0]! })
    }, /double assigned/)
  })

  it('rejects a researchSpend ledger amount changed off its receipt, even when cash is adjusted by the same amount', () => {
    rejected(base2, state => {
      const project = state.technology.projects[0]!
      const row = state.ledger.find(e => e.kind === 'researchSpend' && e.note === `research:${project.id}`)!
      const delta = 1_000
      row.amount -= delta
      state.studio.cash -= delta
    }, /without its receipt|does not reconcile/)
  })

  it('rejects research receipt history beyond the bounded growth limit', () => {
    rejected(base2, state => {
      const project = state.technology.projects[0]!
      const template = project.weeks[0]!
      for (let i = 1; i <= 70; i++) project.weeks.push({ ...template, week: template.week + i })
    }, /bounded history/)
  })
})
