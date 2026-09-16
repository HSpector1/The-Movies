import { beforeAll, describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { activeContract, busyTalentIds } from '../src/core/employment.js'
import { commitPlacement, queryPlacement } from '../src/core/placement.js'
import { researchCandidates } from '../src/core/technology.js'
import type { GameState } from '../src/core/types.js'
import { advanceTo, p13aResearchEntry } from '../src/harness/p13a/fixtures.js'

// P13B-S1, Ready row 1 (companion §5): hire/assign four distinct people, refuse the
// fifth, keep seat history. Generated worlds only; every date comes from the engine.
let entry: GameState
let laboratoryFacilityId: string
beforeAll(() => {
  entry = p13aResearchEntry()
  laboratoryFacilityId = entry.operations.facilities.find(f => f.capability === 'laboratory')!.id
}, 60_000)

const recruit = (state: GameState, scientistId?: string) =>
  applyActions(state, [scientistId === undefined
    ? { kind: 'recruitScientist', laboratoryFacilityId }
    : { kind: 'recruitScientist', laboratoryFacilityId, scientistId }])
const assign = (state: GameState, scientistId: string, lab = laboratoryFacilityId) =>
  applyActions(state, [{ kind: 'assignResearchScientist', laboratoryFacilityId: lab, scientistId, technologyId: 'synchronized-sound' }])
const employedScientists = (state: GameState) => state.talent.filter(t => t.role === 'scientist' && activeContract(state, t.id))
/** The first origin the P09 placement law accepts for a second Laboratory on this generated lot; never a guessed cell. */
const secondLaboratoryOrigin = (state: GameState) => {
  for (let gy = 0; gy < 24; gy++) for (let gx = 0; gx < 24; gx++) {
    if (queryPlacement(state, { blueprintId: 'research-laboratory', origin: { gx, gy } }).ok) return { gx, gy }
  }
  throw new Error('This generated lot offers no lawful site for a second Research Laboratory')
}

describe('P13B-S1 named research candidates', () => {
  it('offers eight deterministic, distinct candidates with Otto first and no RNG advance', () => {
    const candidates = researchCandidates(entry)
    expect(candidates).toHaveLength(8)
    expect(new Set(candidates.map(c => c.id)).size).toBe(8)
    expect(candidates.map(c => c.id)).toEqual(['t-sci-00', 't-sci-01', 't-sci-02', 't-sci-03', 't-sci-04', 't-sci-05', 't-sci-06', 't-sci-07'])
    expect(candidates.every(c => c.role === 'scientist' && c.name.trim() !== '')).toBe(true)
    expect(researchCandidates(entry)).toEqual(candidates)
    expect(entry.talent.some(t => t.role === 'scientist')).toBe(false)
  })

  it('recruits by explicit id, defaults to the first unemployed candidate, and refuses a ninth employed Scientist', () => {
    const pool = researchCandidates(entry)
    const rng = entry.rngState
    let state = recruit(entry, pool[3]!.id)
    expect(activeContract(state, pool[3]!.id)).toMatchObject({ annualSalary: 104_000, termWeeks: 208 })
    state = recruit(state)
    expect(activeContract(state, 't-sci-00')).toBeDefined()
    expect(() => recruit(state, pool[3]!.id)).toThrow(/already employ/)
    for (const candidate of pool) if (!activeContract(state, candidate.id)) state = recruit(state, candidate.id)
    expect(employedScientists(state)).toHaveLength(8)
    expect(new Set(employedScientists(state).map(t => t.id)).size).toBe(8)
    expect(() => recruit(state)).toThrow(/eight/)
    expect(() => recruit(state, 'not-a-candidate')).toThrow(/candidate/)
    expect(state.rngState).toBe(rng)
  })
})

describe('P13B-S1 named seats on one Laboratory', () => {
  let staffed: GameState
  beforeAll(() => {
    staffed = entry
    for (const candidate of researchCandidates(entry).slice(0, 5)) staffed = recruit(staffed, candidate.id)
  }, 60_000)

  it('seats four distinct people, refuses the fifth with the seat-cap reason, and refuses a seated person again', () => {
    const ids = researchCandidates(staffed).map(c => c.id)
    let state = staffed
    for (const id of ids.slice(0, 4)) state = assign(state, id)
    expect(state.technology.projects).toHaveLength(1)
    const project = state.technology.projects[0]!
    expect(project.id).toBe(`${state.hollywood!.playerStudioId}:research:synchronized-sound`)
    expect(project.seats.map(s => s.talentId)).toEqual(ids.slice(0, 4))
    expect(project.seats.every(s => s.laboratoryFacilityId === laboratoryFacilityId && s.assignedWeek === state.market.tick && s.releasedWeek === null)).toBe(true)
    expect(() => assign(state, ids[4]!)).toThrow(/four seats/)
    expect(() => assign(state, ids[1]!)).toThrow(/already holds/)
    expect(busyTalentIds(state).has(ids[0]!)).toBe(false)
  })

  it('refuses an unemployed person; a seat on a second Laboratory is accepted from S2 (the S1 refusal is retired)', () => {
    const unemployed = researchCandidates(staffed)[6]!.id
    expect(() => assign(staffed, unemployed)).toThrow(/Employ/)
    let state = commitPlacement(staffed, { blueprintId: 'research-laboratory', origin: secondLaboratoryOrigin(staffed) })
    state = advanceTo(state, state.market.tick + 12)
    const second = state.operations.facilities.filter(f => f.capability === 'laboratory').find(f => f.id !== laboratoryFacilityId)!
    state = assign(state, researchCandidates(state)[0]!.id)
    // S2 (plan §S2 test 3) retires S1's second-Laboratory refusal: the seat is accepted and carries its own Lab.
    state = assign(state, researchCandidates(state)[1]!.id, second.id)
    expect(state.technology.projects[0]!.seats.map(s => s.laboratoryFacilityId)).toEqual([laboratoryFacilityId, second.id])
  })

  it('releases a seat, keeps its history, and lets the same person be re-seated', () => {
    const [first, second] = researchCandidates(staffed).map(c => c.id)
    let state = assign(assign(staffed, first!), second!)
    const projectId = state.technology.projects[0]!.id
    state = advanceTo(state, state.market.tick + 2)
    state = applyActions(state, [{ kind: 'releaseResearchSeat', projectId, scientistId: first! }])
    expect(state.technology.projects[0]!.seats).toEqual([
      { talentId: first, laboratoryFacilityId, assignedWeek: staffed.market.tick, releasedWeek: staffed.market.tick + 2 },
      { talentId: second, laboratoryFacilityId, assignedWeek: staffed.market.tick, releasedWeek: null },
    ])
    expect(() => applyActions(state, [{ kind: 'releaseResearchSeat', projectId, scientistId: first! }])).toThrow(/no occupied seat/)
    state = assign(state, first!)
    expect(state.technology.projects[0]!.seats).toHaveLength(3)
    expect(state.technology.projects[0]!.seats[2]).toEqual({ talentId: first, laboratoryFacilityId, assignedWeek: staffed.market.tick + 2, releasedWeek: null })
  })
})
