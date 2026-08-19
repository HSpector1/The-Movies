// ── C2a-M5 — LOAD-IN HAS A DISTANCE (charter §4.2, Owner-signed §18 item 8) ──
//
// Written from the charter, not the implementation:
//
//   *scenery load-in gains real duration from engine-owned grid distance between
//   the supplying set-scenery facility and the bound stage
//   (`SCENERY_LOAD_IN_WEEKS_BASE` + `_PER_DISTANCE`); general travel-as-outcome
//   stays out.*                                                          (§4.2)
//
//   *the layout narrowing — which satisfies the Success Blueprint's option A (a
//   bounded deterministic spatial consequence on TIME via load-in distance)*
//                                                                    (§18.8)
//
// THE RE-PROOF BUDGET (§4.2 / §11.6) IS ANSWERED BY A RULING, NOT BY A RE-PIN.
// The charter's own escape clause — *"keep migrated in-flight saves grandfathered
// (their load-in stays a click if changing them breaks T9)"* — is taken, and it is
// taken through a line the V14 migrator ALREADY drew: `requiresSetBinding` is
// FALSE for every migrated workflow, with the reason stated in `save.ts`. A
// picture that was never required to bind a set is never told how far its shop is.
//
// The consequence, verified and recorded here: **the four SHA-256-pinned Scenery
// Load-In V1 fixtures do not move, and neither does the T9 matrix** — every one of
// them is a migrated save, so every one of them is grandfathered by construction.
// Nothing is regenerated, nothing is re-pinned, and the V1 Keep gate is re-proven
// by the suites that own it running unmodified.

import { describe, expect, it } from 'vitest'
import {
  INITIAL_PROPERTY,
  TUNING,
  applyActions,
  facilityBodyCentre,
  gridDistance,
  isSceneryLoadIn,
  sceneryLoadInFor,
  sceneryLoadInWeeksForDistance,
  tick,
} from '../src/core/index.js'
import type { GameState, LotCell, ProductionWorkflow } from '../src/core/index.js'
import { advance } from './contracts/_contractFixtures.js'
import { contendedStudio } from './_m4Fixtures.js'

const SCENERY_SHOP = 'facility-scenery-shop'
const STAGE_A = 'facility-soundstage-07'
const STAGE_B = 'facility-soundstage-12'

/**
 * Weeks a picture spends holding its stage before its cameras are ready — the
 * rehearsal week plus the advance that enters Shooting. The scenery is called at
 * the START of that (`bindings.heldSinceWeek`), so a trip of this length or less
 * costs the picture nothing. Asserted against the engine below, never assumed.
 */
const FOUNDING_HEAD_START_WEEKS = 2

/** The property alone is enough to answer a geometry question. */
const GEOMETRY_ONLY = {
  property: INITIAL_PROPERTY,
  placement: { facilities: [] },
} as unknown as GameState

describe('C2a-M5 §4.2 — the bounded term', () => {
  it('is an integer inside [BASE, MAX] for every distance, including nonsense', () => {
    const distances = [
      -1, -0.5, 0, 1, 2, 7, 9, 16, 19, 20, 25, 39, 40, 43, 100, 10_000,
      Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY,
    ]
    for (const distance of distances) {
      const weeks = sceneryLoadInWeeksForDistance(distance)
      expect(Number.isSafeInteger(weeks), `distance ${String(distance)} → ${String(weeks)}`).toBe(true)
      expect(weeks).toBeGreaterThanOrEqual(TUNING.SCENERY_LOAD_IN_WEEKS_BASE)
      expect(weeks).toBeLessThanOrEqual(TUNING.SCENERY_LOAD_IN_WEEKS_MAX)
    }
  })

  it('never decreases as the trip gets longer (further is never faster)', () => {
    let previous = sceneryLoadInWeeksForDistance(0)
    for (let distance = 1; distance <= 200; distance++) {
      const weeks = sceneryLoadInWeeksForDistance(distance)
      expect(weeks).toBeGreaterThanOrEqual(previous)
      previous = weeks
    }
  })

  it('is BASE at zero distance and reaches MAX and stays there', () => {
    expect(sceneryLoadInWeeksForDistance(0)).toBe(TUNING.SCENERY_LOAD_IN_WEEKS_BASE)
    expect(sceneryLoadInWeeksForDistance(10_000)).toBe(TUNING.SCENERY_LOAD_IN_WEEKS_MAX)
  })

  it('is a PURE function of two positions — same cells, same answer, no state read', () => {
    const a: LotCell = { gx: 3, gy: 4 }
    const b: LotCell = { gx: 19, gy: 18 }
    expect(gridDistance(a, b)).toBe(gridDistance(b, a))
    expect(gridDistance(a, a)).toBe(0)
    for (let i = 0; i < 5; i++) {
      expect(sceneryLoadInWeeksForDistance(gridDistance(a, b))).toBe(
        sceneryLoadInWeeksForDistance(gridDistance(a, b)),
      )
    }
  })
})

describe('C2a-M5 §4.2 — the geometry is the engine’s own', () => {
  it('locates the founding plant’s bodies from the authored structures', () => {
    // Pinned as MEASURED at this HEAD. If a structure moves, this test says so
    // rather than letting a duration silently change underneath the economy.
    expect(facilityBodyCentre(GEOMETRY_ONLY, SCENERY_SHOP)).toEqual({ gx: 19, gy: 18 })
    expect(facilityBodyCentre(GEOMETRY_ONLY, STAGE_A)).toEqual({ gx: 18, gy: 3 })
    expect(facilityBodyCentre(GEOMETRY_ONLY, STAGE_B)).toEqual({ gx: 18, gy: 10 })
  })

  it('withholds a position for a facility no body stands for (law 12)', () => {
    expect(facilityBodyCentre(GEOMETRY_ONLY, 'facility-that-does-not-exist')).toBeNull()
    expect(facilityBodyCentre(GEOMETRY_ONLY, '')).toBeNull()
  })

  it('THE FOUNDING LOT IS SUPPLIED INSIDE THE BASE WEEK — nothing measured moves', () => {
    const shop = facilityBodyCentre(GEOMETRY_ONLY, SCENERY_SHOP)!
    const toA = gridDistance(shop, facilityBodyCentre(GEOMETRY_ONLY, STAGE_A)!)
    const toB = gridDistance(shop, facilityBodyCentre(GEOMETRY_ONLY, STAGE_B)!)
    expect(toA).toBe(16)
    expect(toB).toBe(9)
    // TWO weeks and ONE — and the picture has had two weeks of rehearsal-and-entry
    // before its cameras are ready, so both arrive on time and cost nothing.
    expect(sceneryLoadInWeeksForDistance(toA)).toBe(2)
    expect(sceneryLoadInWeeksForDistance(toB)).toBe(1)
    expect(sceneryLoadInWeeksForDistance(toA)).toBeLessThanOrEqual(FOUNDING_HEAD_START_WEEKS)
  })

  it('IS NOT VACUOUS — ground a player chooses genuinely costs a week', () => {
    // The West Lawn is a real buildable parcel (`lot.ts`), and a Scenery Shop
    // standing there is 25 cells from Stage A.
    const westLawnShop: LotCell = { gx: 1, gy: 11 }
    const distance = gridDistance(westLawnShop, facilityBodyCentre(GEOMETRY_ONLY, STAGE_A)!)
    expect(distance).toBe(25)
    // Three weeks against a two-week head start: one full week of a company
    // standing on a bare stage, bought by where the player put the shop.
    expect(sceneryLoadInWeeksForDistance(distance)).toBe(3)
    expect(sceneryLoadInWeeksForDistance(distance)).toBeGreaterThan(FOUNDING_HEAD_START_WEEKS)
  })
})

// ── a real picture, driven to its load-in through public actions ─────────────

function pictureAtLoadIn(seed: string): { state: GameState; workflow: ProductionWorkflow } {
  let state = contendedStudio(seed).state
  // Walk to the week a shooting task exists and its director can be assigned.
  let workflow: ProductionWorkflow | undefined
  for (let i = 0; i < 16; i++) {
    workflow = state.operations.workflows.find(
      (candidate) => candidate.phase === 'shooting' && candidate.shootingTask?.status === 'unassigned',
    )
    if (workflow !== undefined) break
    state = advance(state, 1)
  }
  expect(workflow, 'the fixture must reach an unassigned shooting task').toBeDefined()
  const production = state.studio.activeProductions.find(
    (candidate) => candidate.id === workflow!.productionId,
  )!
  state = applyActions(state, [
    {
      kind: 'assignShootingDirector',
      productionId: production.id,
      directorId: production.directorId,
    },
  ])
  const blocked = state.operations.workflows.find(
    (candidate) => candidate.productionId === production.id,
  )!
  return { state, workflow: blocked }
}

/** The one workflow this fixture is about, as the given state holds it now. */
function reread(state: GameState, productionId: string): ProductionWorkflow {
  return state.operations.workflows.find(
    (candidate) => candidate.productionId === productionId,
  )!
}

describe('C2a-M5 §4.2 — a real picture’s load-in', () => {
  it('derives a load-in from the shop it holds and the stage it is on', () => {
    const { state, workflow } = pictureAtLoadIn('c2a-m5-loadin-real')
    const loadIn = sceneryLoadInFor(state, workflow, state.market.tick)
    expect(isSceneryLoadIn(loadIn)).toBe(true)
    if (!isSceneryLoadIn(loadIn)) return
    expect(loadIn.fromFacilityId).toBe(SCENERY_SHOP)
    expect([STAGE_A, STAGE_B]).toContain(loadIn.toFacilityId)
    expect(loadIn.weeks).toBeLessThanOrEqual(FOUNDING_HEAD_START_WEEKS)
    expect(loadIn.distance).toBeGreaterThan(0)
    // THE HEAD START, asserted against the engine rather than assumed: the picture
    // has held its stage for at least the two weeks the trip needed, so on the
    // founding lot the scenery is there when the cameras are. That is why every
    // sealed spec on this lot runs unmodified.
    expect(loadIn.weeksElapsed).toBeGreaterThanOrEqual(FOUNDING_HEAD_START_WEEKS)
    expect(state.market.tick - loadIn.calledWeek).toBeGreaterThanOrEqual(
      FOUNDING_HEAD_START_WEEKS,
    )
    expect(loadIn.arrived).toBe(true)
    expect(loadIn.weeksRemaining).toBe(0)
  })

  it('persists NOTHING — the duration is derived, and V14 gains no field', () => {
    const { state, workflow } = pictureAtLoadIn('c2a-m5-loadin-save-neutral')
    const blocker = workflow.blocker!
    // The blocker is exactly the two members V14 froze it at.
    expect(Object.keys(blocker).sort()).toEqual(['kind', 'taskId'])
    expect(Object.keys(workflow.bindings).sort()).toEqual([
      'heldSinceWeek',
      'lockedNovelty',
      'lockedUplift',
      'requiresSetBinding',
      'setId',
      'stageFacilityId',
    ])
    // Asking twice changes nothing about the world.
    const before = JSON.stringify(state)
    sceneryLoadInFor(state, workflow, state.market.tick)
    sceneryLoadInFor(state, workflow, state.market.tick + 5)
    expect(JSON.stringify(state)).toBe(before)
  })

  it('the ARRIVED load-in still clears on the player’s command, exactly as before', () => {
    const { state, workflow } = pictureAtLoadIn('c2a-m5-loadin-click')
    const cleared = applyActions(state, [
      { kind: 'clearSceneryLoadIn', productionId: workflow.productionId },
    ])
    expect(reread(cleared, workflow.productionId).shootingTask!.status).toBe('ready')
    expect(reread(cleared, workflow.productionId).blocker).toBeNull()
  })
})

describe('C2a-M5 §4.2 — scenery IN TRANSIT (the mechanic, made to bite)', () => {
  /**
   * The same picture, with its stage's body moved to the far corner of the lot.
   * Only the PROPERTY is edited — the picture, its reservations and its bindings
   * are untouched — which is exactly the claim under test: distance is the only
   * input, and it comes from the ground.
   */
  function withDistantStage(state: GameState, stageFacilityId: string): GameState {
    const property = state.property!
    return {
      ...state,
      property: {
        ...property,
        structures: property.structures.map((structure) =>
          structure.providesFacilityIds.includes(stageFacilityId)
            ? { ...structure, origin: { gx: 0, gy: 4 } }
            : structure,
        ),
      },
    }
  }

  it('a stage far from the shop is NOT supplied inside the base week', () => {
    const { state, workflow } = pictureAtLoadIn('c2a-m5-loadin-far')
    const far = withDistantStage(state, workflow.bindings.stageFacilityId!)
    const loadIn = sceneryLoadInFor(far, workflow, far.market.tick)
    expect(isSceneryLoadIn(loadIn)).toBe(true)
    if (!isSceneryLoadIn(loadIn)) return
    expect(loadIn.weeks).toBeGreaterThan(TUNING.SCENERY_LOAD_IN_WEEKS_BASE)
    expect(loadIn.arrived).toBe(false)
    expect(loadIn.weeksRemaining).toBeGreaterThan(0)
  })

  it('REFUSES the clear while the trucks are on the road, and says how far out', () => {
    const { state, workflow } = pictureAtLoadIn('c2a-m5-loadin-refusal')
    const far = withDistantStage(state, workflow.bindings.stageFacilityId!)
    expect(() =>
      applyActions(far, [{ kind: 'clearSceneryLoadIn', productionId: workflow.productionId }]),
    ).toThrow(/still in transit/)
  })

  it('THE ENGINE ENDS IT — the scenery arrives on a tick, with no player input', () => {
    const { state, workflow } = pictureAtLoadIn('c2a-m5-loadin-arrival')
    let far = withDistantStage(state, workflow.bindings.stageFacilityId!)
    const initial = sceneryLoadInFor(far, workflow, far.market.tick)
    expect(isSceneryLoadIn(initial) && initial.weeksRemaining).toBeGreaterThan(0)

    // The take stays blocked while the trip is unfinished …
    far = tick(far)
    const midway = sceneryLoadInFor(far, reread(far, workflow.productionId), far.market.tick)
    if (isSceneryLoadIn(midway) && !midway.arrived) {
      expect(reread(far, workflow.productionId).shootingTask!.status).toBe('blocked')
    }
    // … and the engine clears it once the scenery is there. No command is issued
    // anywhere in this test after the director was assigned.
    for (let i = 0; i < TUNING.SCENERY_LOAD_IN_WEEKS_MAX + 2; i++) {
      if (reread(far, workflow.productionId).shootingTask?.status === 'ready') break
      far = tick(far)
    }
    expect(reread(far, workflow.productionId).shootingTask!.status).toBe('ready')
    expect(reread(far, workflow.productionId).blocker).toBeNull()
    // The arrival is in the studio's own history, exactly as a clicked one is.
    expect(
      far.studioEvents.rows.some(
        (row) => row.kind === 'sceneryArrived' && row.productionId === workflow.productionId,
      ),
    ).toBe(true)
  })

  it('is DETERMINISTIC — two identical runs produce identical states', () => {
    const run = (): string => {
      const { state, workflow } = pictureAtLoadIn('c2a-m5-loadin-determinism')
      let far = withDistantStage(state, workflow.bindings.stageFacilityId!)
      for (let i = 0; i < 4; i++) far = tick(far)
      return JSON.stringify(far)
    }
    expect(run()).toBe(run())
  })
})

describe('C2a-M5 §4.2 — THE GRANDFATHER (the re-proof budget, ruled)', () => {
  it('a picture that never bound a set is never told how far its shop is', () => {
    const { state, workflow } = pictureAtLoadIn('c2a-m5-loadin-grandfather')
    // Exactly what the V14 migrator mints for an in-flight workflow.
    const migrated: ProductionWorkflow = {
      ...workflow,
      bindings: { ...workflow.bindings, requiresSetBinding: false },
    }
    expect(sceneryLoadInFor(state, migrated, state.market.tick)).toBe('grandfathered')
  })

  it('a grandfathered picture’s load-in is NEVER refused, however far its stage is', () => {
    const { state, workflow } = pictureAtLoadIn('c2a-m5-loadin-grandfather-click')
    const grandfathered: GameState = {
      ...state,
      property: {
        ...state.property!,
        structures: state.property!.structures.map((structure) =>
          structure.providesFacilityIds.includes(workflow.bindings.stageFacilityId!)
            ? { ...structure, origin: { gx: 0, gy: 4 } }
            : structure,
        ),
      },
      operations: {
        ...state.operations,
        workflows: state.operations.workflows.map((candidate) => ({
          ...candidate,
          bindings: { ...candidate.bindings, requiresSetBinding: false },
        })),
      },
    }
    const cleared = applyActions(grandfathered, [
      { kind: 'clearSceneryLoadIn', productionId: workflow.productionId },
    ])
    expect(reread(cleared, workflow.productionId).shootingTask!.status).toBe('ready')
  })

  it('and the engine never ends a grandfathered load-in for the player either', () => {
    const { state, workflow } = pictureAtLoadIn('c2a-m5-loadin-grandfather-tick')
    let grandfathered: GameState = {
      ...state,
      operations: {
        ...state.operations,
        workflows: state.operations.workflows.map((candidate) => ({
          ...candidate,
          bindings: { ...candidate.bindings, requiresSetBinding: false },
        })),
      },
    }
    for (let i = 0; i < 4; i++) grandfathered = tick(grandfathered)
    const after = grandfathered.operations.workflows.find(
      (candidate) => candidate.productionId === workflow.productionId,
    )
    // Still waiting for the click it has always waited for.
    expect(after?.shootingTask?.status).toBe('blocked')
    expect(after?.blocker?.kind).toBe('scenery-load-in')
  })
})
