import { describe, expect, it } from 'vitest'
import { generateWorld } from '../src/core/worldgen.js'
import { applyActions } from '../src/core/actions.js'
import { initializeHollywood } from '../src/core/hollywood.js'
import { hasOperationalFacilityInstallation } from '../src/core/facilityEffects.js'
import { occupiedResourceSlots, resourceClaimsOf } from '../src/core/occupancy.js'
import {
  assertStudioPlacementInvariants, commitFacilityInstallation, commitPlacement,
  completeDuePlacements, demolishFacility, expectedWeeklyOperatingCostAt,
  facilityEngagements, facilityInstallationPhase, moveFacility, queryFacilityInstallation,
  queryPlacement, studioPlacementView, weeklyPlacementOperatingCost,
} from '../src/core/placement.js'
import { RESEARCH_LABORATORY_BLUEPRINT, STAGE_STANDARD_BLUEPRINT } from '../src/core/tuning.js'
import type { GameState } from '../src/core/types.js'

function studio(): GameState {
  const generated = generateWorld('p13a-physical-fixture')
  return initializeHollywood(applyActions({ ...generated, economyEngagedEver: true }, [{ kind: 'activateStudioOperations' }]), 'fresh')
}

/** Isolate the P09 transition boundary; research/access history has separate Core tests. */
function withSoundAccess(state: GameState): GameState {
  return { ...state, technology: {
    version: 1, recordingStartedWeek: 0, projects: [], adoptions: [], productions: [],
    access: [{ studioId: state.hollywood!.playerStudioId, technologyId: 'synchronized-sound',
      route: 'research', chosenWeek: 0, acquiredWeek: 0, accessCost: 0, researchProjectId: 'physical-test-access' }],
  } }
}

/** Exercise the existing P09 completion authority, preserving its exact weekly boundary. */
function arrive(state: GameState, week: number): GameState {
  const completed = completeDuePlacements(state.placement, state.operations, week)
  return { ...state, market: { ...state.market, tick: week }, placement: completed.placement, operations: completed.operations }
}

describe('P13A P09 physical substrate', () => {
  it('builds a real four-seat Laboratory and charges its accepted candidate rate only after completion', () => {
    let state = studio()
    const rng = state.rngState
    const initialCash = state.studio.cash
    state = commitPlacement(state, { blueprintId: 'research-laboratory', origin: { gx: 0, gy: 9 } })
    const lab = state.placement.facilities[0]!
    expect(lab).toMatchObject({ blueprintId: 'research-laboratory', placedWeek: 0, completesWeek: 12, status: 'underConstruction' })
    expect(state.studio.cash).toBe(initialCash - 900_000)
    expect(weeklyPlacementOperatingCost(state.placement)).toBe(0)
    expect(state.operations.facilities.some((facility) => facility.id === lab.facilityId)).toBe(false)
    state = arrive(state, 11)
    expect(state.operations.facilities.some((facility) => facility.capability === 'laboratory')).toBe(false)
    state = arrive(state, 12)
    expect(state.operations.facilities.find((facility) => facility.id === lab.facilityId)).toMatchObject({ capability: 'laboratory', capacity: 4 })
    expect(expectedWeeklyOperatingCostAt(state.placement, state.ledger, 11)).toBe(0)
    expect(expectedWeeklyOperatingCostAt(state.placement, state.ledger, 12)).toBe(3_000)
    expect(state.rngState).toEqual(rng)
    expect(RESEARCH_LABORATORY_BLUEPRINT.capex).toBe(900_000)
    expect(STAGE_STANDARD_BLUEPRINT).toMatchObject({ capex: 2_400_000, buildWeeks: 16, weeklyOperatingCost: 9_000 })
    assertStudioPlacementInvariants(state)
  })

  it('installs acoustic instruments on the exact operational Laboratory with no extra body or slots', () => {
    let state = commitPlacement(studio(), { blueprintId: 'research-laboratory', origin: { gx: 0, gy: 9 } })
    const lab = state.placement.facilities[0]!
    const request = { blueprintId: 'acoustic-instruments', targetFacilityId: lab.facilityId }
    expect(queryFacilityInstallation(state, request).rejections).toContain('unknownTarget')
    state = arrive(state, 12)
    const capacityBefore = state.operations.facilities
    state = commitFacilityInstallation(state, request)
    const installed = state.placement.facilities[1]!
    expect(installed).toMatchObject({ installation: { targetFacilityId: lab.facilityId }, cells: [], placedWeek: 12, completesWeek: 17 })
    expect(hasOperationalFacilityInstallation(state, lab.facilityId, 'acoustic-instruments')).toBe(false)
    expect(resourceClaimsOf(occupiedResourceSlots(state)).filter((claim) => claim.owner === 'installation' && claim.slot !== null)).toHaveLength(4)
    expect(studioPlacementView(state).placements).toHaveLength(1)
    expect(studioPlacementView(state).catalog.some((entry) => entry.blueprintId === 'acoustic-instruments')).toBe(false)
    expect(commitFacilityInstallation(state, request)).toBe(state)
    state = arrive(state, 17)
    expect(state.operations.facilities).toEqual(capacityBefore)
    expect(hasOperationalFacilityInstallation(state, lab.facilityId, 'acoustic-instruments')).toBe(true)
    expect(hasOperationalFacilityInstallation(state, 'different-lab', 'acoustic-instruments')).toBe(false)
    expect(expectedWeeklyOperatingCostAt(state.placement, state.ledger, 16)).toBe(3_000)
    expect(expectedWeeklyOperatingCostAt(state.placement, state.ledger, 17)).toBe(5_000)
    assertStudioPlacementInvariants(state)
  })

  it('owns a twelve-week stage/capture chain and six-week parallel Post fit-out without rewriting the founding bodies', () => {
    let state = withSoundAccess(studio())
    const stage = state.operations.facilities.find((facility) => facility.capability === 'soundstage')!
    const post = state.operations.facilities.find((facility) => facility.capability === 'post')!
    const bodyBefore = state.property
    const operationsBefore = state.operations.facilities
    const stageRequest = { blueprintId: 'synchronized-sound-stage', targetFacilityId: stage.id }
    const quote = queryFacilityInstallation(state, stageRequest)
    expect(quote).toMatchObject({ ok: true, cost: 675_000, buildWeeks: 12, weeklyOperatingCost: 2_000 })
    expect(quote.components.map((component) => [component.cost, component.weeks])).toEqual([[450_000, 9], [150_000, 3], [75_000, 0]])
    state = commitFacilityInstallation(state, stageRequest)
    state = commitFacilityInstallation(state, { blueprintId: 'synchronized-sound-post', targetFacilityId: post.id })
    const stageJob = state.placement.facilities[0]!
    expect(facilityInstallationPhase(stageJob, 8)).toBe('Stage site adaptation')
    expect(facilityInstallationPhase(stageJob, 9)).toBe('Equipment installation')
    expect(weeklyPlacementOperatingCost(state.placement)).toBe(0)
    state = arrive(state, 6)
    expect(hasOperationalFacilityInstallation(state, post.id, 'synchronized-sound-post')).toBe(true)
    expect(hasOperationalFacilityInstallation(state, stage.id, 'synchronized-sound-stage')).toBe(false)
    expect(weeklyPlacementOperatingCost(state.placement)).toBe(2_000)
    state = arrive(state, 12)
    expect(hasOperationalFacilityInstallation(state, stage.id, 'synchronized-sound-stage')).toBe(true)
    expect(expectedWeeklyOperatingCostAt(state.placement, state.ledger, 5)).toBe(0)
    expect(expectedWeeklyOperatingCostAt(state.placement, state.ledger, 6)).toBe(2_000)
    expect(expectedWeeklyOperatingCostAt(state.placement, state.ledger, 11)).toBe(2_000)
    expect(expectedWeeklyOperatingCostAt(state.placement, state.ledger, 12)).toBe(4_000)
    expect(state.property).toBe(bodyBefore)
    expect(state.operations.facilities).toEqual(operationsBefore)
    expect(state.ledger.filter((row) => row.kind === 'constructionCapex').map((row) => row.amount)).toEqual([-675_000, -300_000])
    assertStudioPlacementInvariants(state)
  })

  it('refuses live target work, stale commits, incompatible targets and ordinary placement of an installation', () => {
    let state = withSoundAccess(studio())
    const stage = state.operations.facilities.find((facility) => facility.capability === 'soundstage')!
    const request = { blueprintId: 'synchronized-sound-stage', targetFacilityId: stage.id }
    expect(queryFacilityInstallation(state, request).ok).toBe(true)
    state = { ...state, operations: { ...state.operations, workflows: [{ productionId: 'busy-physical-fixture', phase: 'shooting',
      reservations: [{ productionId: 'busy-physical-fixture', phase: 'shooting', facilityId: stage.id, capability: 'soundstage', slot: 0 }], shootingTask: null,
      blocker: null, bindings: { requiresSetBinding: false, stageFacilityId: null, setId: null, heldSinceWeek: null, lockedNovelty: null, lockedUplift: null } }] } }
    expect(queryFacilityInstallation(state, request).rejections).toContain('targetEngaged')
    expect(commitFacilityInstallation(state, request)).toBe(state)
    expect(queryFacilityInstallation(state, { blueprintId: 'acoustic-instruments', targetFacilityId: stage.id }).rejections).toContain('incompatibleTarget')
    expect(queryPlacement(state, { blueprintId: 'synchronized-sound-stage', origin: { gx: 0, gy: 9 } }).ok).toBe(false)
  })

  it('retains installed module and target destruction holds after completion', () => {
    let state = commitPlacement(studio(), { blueprintId: 'research-laboratory', origin: { gx: 0, gy: 9 } })
    const lab = state.placement.facilities[0]!
    state = arrive(state, 12)
    state = commitFacilityInstallation(state, { blueprintId: 'acoustic-instruments', targetFacilityId: lab.facilityId })
    state = arrive(state, 17)
    const module = state.placement.facilities[1]!
    expect(facilityEngagements(state, lab.facilityId).some((holder) => holder.kind === 'installation')).toBe(true)
    expect(demolishFacility(state, { placementId: lab.id })).toBe(state)
    expect(moveFacility(state, { placementId: lab.id, origin: { gx: 0, gy: 12 } })).toBe(state)
    expect(demolishFacility(state, { placementId: module.id })).toBe(state)
    expect(moveFacility(state, { placementId: module.id, origin: { gx: 0, gy: 12 } })).toBe(state)
    const forged = { ...state, placement: { ...state.placement, facilities: state.placement.facilities.map((placed) =>
      placed.id === module.id ? { ...placed, cells: [{ gx: 0, gy: 9 }] } : placed) } }
    expect(() => assertStudioPlacementInvariants(forged)).toThrow('installation must not occupy a second body')
  })

  it('preserves a purchased stage’s capital identity and historical base operating rate during conversion', () => {
    let state = withSoundAccess(studio())
    const request = { blueprintId: 'stage-standard', origin: { gx: 3, gy: 19 } }
    expect(queryPlacement(state, request).rejections).toEqual([])
    state = commitPlacement(state, request)
    const stage = state.placement.facilities[0]!
    expect(stage.blueprintId).toBe('stage-standard')
    state = arrive(state, 16)
    const originalStage = state.placement.facilities[0]!
    state = commitFacilityInstallation(state, { blueprintId: 'synchronized-sound-stage', targetFacilityId: stage.facilityId })
    expect(state.placement.facilities[0]).toBe(originalStage)
    expect(weeklyPlacementOperatingCost(state.placement)).toBe(9_000)
    state = arrive(state, 28)
    expect(state.placement.facilities[0]).toBe(originalStage)
    expect(expectedWeeklyOperatingCostAt(state.placement, state.ledger, 15)).toBe(0)
    expect(expectedWeeklyOperatingCostAt(state.placement, state.ledger, 16)).toBe(9_000)
    expect(expectedWeeklyOperatingCostAt(state.placement, state.ledger, 27)).toBe(9_000)
    expect(expectedWeeklyOperatingCostAt(state.placement, state.ledger, 28)).toBe(11_000)
    expect(state.ledger.find((row) => row.kind === 'constructionCapex' && row.constructionProjectId === stage.projectId)?.amount).toBe(-2_400_000)
    assertStudioPlacementInvariants(state)
  })
})
