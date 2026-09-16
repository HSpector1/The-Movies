import { beforeAll, describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { findDoubleBookedResourceSlot, occupiedResourceSlots, resourceClaimsOf } from '../src/core/occupancy.js'
import { commitFacilityInstallation, commitPlacement, queryFacilityInstallation } from '../src/core/placement.js'
import { occupiedSeats, researchCandidates } from '../src/core/technology.js'
import type { ResearchProject, ResearchSeat, TechnologyId } from '../src/core/technologyTypes.js'
import type { GameState } from '../src/core/types.js'
import { advanceTo, p13aLaboratorySlice, p13aResearchEntry } from '../src/harness/p13a/fixtures.js'
import { nextLaboratoryOrigin, p13bTwoLabWorld } from '../src/harness/p13b/fixtures.js'

// P13B-S2 plan tests 2-3 (task expansion, 2026-09-16): the discipline-module
// ("bench") law that gates lighting research, and seats across two Laboratories
// for one project. Every assertion is requirement-derived from plan §S2 and its
// companion §4 identifiers. Where the action surface cannot yet reach a law
// (because assignResearchScientist ignores technologyId and every project is
// still hard-routed to synchronized-sound), a minimal, type-correct
// ResearchProject row is injected directly into `state.technology.projects` so
// the specific downstream law (researchPrerequisiteRefusal, occupancy, the
// per-Laboratory seat cap) can be exercised in isolation. That injection never
// fabricates a passing result — it only lets a genuinely-tested function see a
// state S2 is supposed to be able to produce on its own. Generated worlds only.

function injectProject(state: GameState, project: ResearchProject): GameState {
  return { ...state, technology: { ...state.technology, projects: [...state.technology.projects, project] } }
}
function seatOf(talentId: string, laboratoryFacilityId: string, assignedWeek: number): ResearchSeat {
  return { talentId, laboratoryFacilityId, assignedWeek, releasedWeek: null }
}
function projectRow(overrides: Partial<ResearchProject> & Pick<ResearchProject, 'id' | 'studioId' | 'technologyId' | 'laboratoryFacilityId' | 'seats'>): ResearchProject {
  return { status: 'paused', budgetPerWeek: 10_000, verifiedWork: 0, expenditure: 0, startedWeek: null, completedWeek: null, weeks: [], legacy: null, ...overrides }
}

describe('P13B-S2 module/bench law (test 2)', () => {
  it('refuses lighting beginResearch while the seated Laboratory lacks an operational electrical/control module', () => {
    let state = p13aLaboratorySlice()
    const laboratoryFacilityId = state.operations.facilities.find(f => f.capability === 'laboratory')!.id
    state = commitFacilityInstallation(state, { blueprintId: 'acoustic-instruments', targetFacilityId: laboratoryFacilityId }) // sound module only, no electrical
    state = advanceTo(state, 780)
    const scientistId = researchCandidates(state)[0]!.id
    state = applyActions(state, [{ kind: 'recruitScientist', laboratoryFacilityId, scientistId }])
    const own = state.hollywood!.playerStudioId
    const projectId = `${own}:research:lighting-control-01`
    state = injectProject(state, projectRow({
      id: projectId, studioId: own, technologyId: 'lighting-control-01' as TechnologyId, laboratoryFacilityId,
      seats: [seatOf(scientistId, laboratoryFacilityId, state.market.tick)],
    }))
    expect(() => applyActions(state, [{ kind: 'beginResearch', projectId, budgetPerWeek: 10_000 }])).toThrow(/module|electrical|control/i)
  })

  it('cannot yet even place the electrical/control module — the physical precondition for the "installation running" refusal is entirely absent', () => {
    const state = p13aLaboratorySlice()
    const laboratoryFacilityId = state.operations.facilities.find(f => f.capability === 'laboratory')!.id
    const quote = queryFacilityInstallation(state, { blueprintId: 'electrical-control-instruments', targetFacilityId: laboratoryFacilityId })
    expect(quote.ok).toBe(true)
    expect(quote.rejections).toEqual([])
  })

  it('does not double-book one Laboratory\'s seat slots when two technologies are both active there (sound 2 + lighting 2, four seats total)', () => {
    let state = p13aLaboratorySlice()
    const laboratoryFacilityId = state.operations.facilities.find(f => f.capability === 'laboratory')!.id
    state = advanceTo(state, 780)
    const ids = researchCandidates(state).slice(0, 4).map(c => c.id)
    state = applyActions(state, ids.map(scientistId => ({ kind: 'recruitScientist' as const, laboratoryFacilityId, scientistId })))
    const own = state.hollywood!.playerStudioId
    const soundProject = projectRow({
      id: `${own}:research:synchronized-sound`, studioId: own, technologyId: 'synchronized-sound' as TechnologyId,
      laboratoryFacilityId, status: 'active', startedWeek: 780,
      seats: [seatOf(ids[0]!, laboratoryFacilityId, 780), seatOf(ids[1]!, laboratoryFacilityId, 780)],
    })
    const lightingProject = projectRow({
      id: `${own}:research:lighting-control-01`, studioId: own, technologyId: 'lighting-control-01' as TechnologyId,
      laboratoryFacilityId, status: 'active', startedWeek: 780,
      seats: [seatOf(ids[2]!, laboratoryFacilityId, 780), seatOf(ids[3]!, laboratoryFacilityId, 780)],
    })
    state = injectProject(injectProject(state, soundProject), lightingProject)
    expect(findDoubleBookedResourceSlot(state)).toBeNull()
    const researchClaims = resourceClaimsOf(occupiedResourceSlots(state)).filter(c => c.owner === 'research')
    expect(researchClaims).toHaveLength(4)
  })

  it('seats a person for a technology on a Laboratory lacking its discipline module (retained P13A law), but refuses to begin until the module is operational', () => {
    let state = p13aResearchEntry() // week 260, acoustic instruments only, no electrical module, no Scientists yet
    const laboratoryFacilityId = state.operations.facilities.find(f => f.capability === 'laboratory')!.id
    state = advanceTo(state, 780)
    const scientistId = researchCandidates(state)[0]!.id
    state = applyActions(state, [{ kind: 'recruitScientist', laboratoryFacilityId, scientistId }])
    // Retained P13A law (tests/p13a-research-identity.test.ts): seating precedes instruments; the project waits paused.
    state = applyActions(state, [{ kind: 'assignResearchScientist', laboratoryFacilityId, scientistId, technologyId: 'lighting-control-01' }])
    const project = state.technology.projects.find(p => p.technologyId === 'lighting-control-01')!
    expect(project).toMatchObject({ status: 'paused', seats: [{ talentId: scientistId, laboratoryFacilityId, releasedWeek: null }] })
    expect(() => applyActions(state, [{ kind: 'beginResearch', projectId: project.id, budgetPerWeek: 10_000 }]))
      .toThrow(/module|electrical|control/i)
  })

  it('releases the seat claim on pause and reacquires it on resume — the S1 release law generalized to a lighting project (regression net)', () => {
    let base = p13aLaboratorySlice()
    const laboratoryFacilityId = base.operations.facilities.find(f => f.capability === 'laboratory')!.id
    base = advanceTo(base, 780)
    const scientistId = researchCandidates(base)[0]!.id
    base = applyActions(base, [{ kind: 'recruitScientist', laboratoryFacilityId, scientistId }])
    const own = base.hollywood!.playerStudioId
    const projectId = `${own}:research:lighting-control-01`
    const activeProject = projectRow({
      id: projectId, studioId: own, technologyId: 'lighting-control-01' as TechnologyId, laboratoryFacilityId,
      status: 'active', startedWeek: 780, seats: [seatOf(scientistId, laboratoryFacilityId, 780)],
    })
    const active = injectProject(base, activeProject)
    const activeClaims = resourceClaimsOf(occupiedResourceSlots(active)).filter(c => c.owner === 'research')
    expect(activeClaims).toEqual([expect.objectContaining({ slot: 0, facilitySlotKey: `${laboratoryFacilityId}:0`, ownerId: projectId })])

    const paused = injectProject(base, { ...activeProject, status: 'paused' })
    const pausedClaims = resourceClaimsOf(occupiedResourceSlots(paused)).filter(c => c.owner === 'research')
    expect(pausedClaims).toEqual([expect.objectContaining({ slot: null, facilitySlotKey: null, ownerId: projectId })])
  })
})

describe('P13B-S2 two Laboratories per project (test 3)', () => {
  let world: ReturnType<typeof p13bTwoLabWorld>
  beforeAll(() => { world = p13bTwoLabWorld() }, 180_000)

  it('accepts seats on a second operational Laboratory — S1\'s single-Laboratory refusal is retired', () => {
    const { state: base, laboratoryFacilityIds: [lab1, lab2], candidateIds } = world
    const state = applyActions(base, candidateIds.slice(0, 4).map(scientistId =>
      ({ kind: 'assignResearchScientist' as const, laboratoryFacilityId: lab1, scientistId, technologyId: 'synchronized-sound' as const })))
    expect(() => applyActions(state, [{ kind: 'assignResearchScientist', laboratoryFacilityId: lab2, scientistId: candidateIds[4]!, technologyId: 'synchronized-sound' }]))
      .not.toThrow()
  })

  it('refuses a third Laboratory for one project with a distinct reason from the S1 second-Laboratory message', () => {
    const { state: base, laboratoryFacilityIds: [lab1, lab2], candidateIds } = base3Setup(world)
    const own = base.hollywood!.playerStudioId
    const projectId = `${own}:research:synchronized-sound`
    // Only two seats occupied (one per Laboratory already in use) — the point
    // under test is the LABORATORY COUNT, not the per-Laboratory seat cap.
    const seats = [seatOf(candidateIds[1]!, lab1, 780), seatOf(candidateIds[2]!, lab2, 780)]
    const state = injectProject(base, projectRow({ id: projectId, studioId: own, technologyId: 'synchronized-sound' as TechnologyId, laboratoryFacilityId: lab1, seats }))
    const lab3 = state.operations.facilities.find(f => f.capability === 'laboratory' && f.id !== lab1 && f.id !== lab2)!.id
    expect(() => applyActions(state, [{ kind: 'assignResearchScientist', laboratoryFacilityId: lab3, scientistId: candidateIds[0]!, technologyId: 'synchronized-sound' }]))
      .toThrow(/third Laboratory|two Laboratories/)
  })

  it('keeps the four-seat cap on the second Laboratory too, once a project may staff it', () => {
    const { state: base, laboratoryFacilityIds: [lab1, lab2], candidateIds } = world
    const own = base.hollywood!.playerStudioId
    const projectId = `${own}:research:synchronized-sound`
    const seats = candidateIds.slice(0, 4).map(talentId => seatOf(talentId, lab2, 780)) // lab2 already full
    const state = injectProject(base, projectRow({ id: projectId, studioId: own, technologyId: 'synchronized-sound' as TechnologyId, laboratoryFacilityId: lab1, seats }))
    expect(() => applyActions(state, [{ kind: 'assignResearchScientist', laboratoryFacilityId: lab2, scientistId: candidateIds[4]!, technologyId: 'synchronized-sound' }]))
      .toThrow(/four seats/)
  })

  it('keeps one seat per person across projects, including across two different technologies (regression net)', () => {
    const { state: base, laboratoryFacilityIds: [lab1, lab2], candidateIds } = world
    const own = base.hollywood!.playerStudioId
    const state = injectProject(base, projectRow({
      id: `${own}:research:synchronized-sound`, studioId: own, technologyId: 'synchronized-sound' as TechnologyId,
      laboratoryFacilityId: lab1, seats: [seatOf(candidateIds[0]!, lab1, 780)],
    }))
    expect(() => applyActions(state, [{ kind: 'assignResearchScientist', laboratoryFacilityId: lab2, scientistId: candidateIds[0]!, technologyId: 'lighting-control-01' }]))
      .toThrow(/already holds/)
  })

  it('occupiedSeats(project, laboratoryFacilityId) already counts seats per Laboratory (regression net)', () => {
    const { laboratoryFacilityIds: [lab1, lab2], candidateIds } = world
    const project: ResearchProject = projectRow({
      id: 'unit-check:research:synchronized-sound', studioId: 'unit-check', technologyId: 'synchronized-sound' as TechnologyId,
      laboratoryFacilityId: lab1,
      seats: [...candidateIds.slice(0, 3).map(id => seatOf(id, lab1, 780)), ...candidateIds.slice(3, 5).map(id => seatOf(id, lab2, 780))],
    })
    expect(occupiedSeats(project, lab1)).toHaveLength(3)
    expect(occupiedSeats(project, lab2)).toHaveLength(2)
    expect(occupiedSeats(project)).toHaveLength(5)
  })
})

/** Places a real, operational third Laboratory beside the shared two-Laboratory world, for the one test that needs it. */
function base3Setup(w: ReturnType<typeof p13bTwoLabWorld>): { state: GameState; laboratoryFacilityIds: [string, string]; candidateIds: string[] } {
  const origin = nextLaboratoryOrigin(w.state)
  let state = commitPlacement(w.state, { blueprintId: 'research-laboratory', origin })
  state = advanceTo(state, state.market.tick + 12)
  return { state, laboratoryFacilityIds: w.laboratoryFacilityIds, candidateIds: w.candidateIds }
}
