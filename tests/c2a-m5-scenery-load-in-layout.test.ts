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

/**
 * Walk to the week a shooting task exists, BEFORE the Director call. P05A W1
 * settles a due-at-call trip inside the call's own transaction, so the two
 * shapes this file needs are built from here: calling on the founding lot
 * (settles immediately) and calling with the stage moved far (a real transit).
 */
function pictureBeforeCall(seed: string): { state: GameState; productionId: string } {
  let state = contendedStudio(seed).state
  let workflow: ProductionWorkflow | undefined
  for (let i = 0; i < 16; i++) {
    workflow = state.operations.workflows.find(
      (candidate) => candidate.phase === 'shooting' && candidate.shootingTask?.status === 'unassigned',
    )
    if (workflow !== undefined) break
    state = advance(state, 1)
  }
  expect(workflow, 'the fixture must reach an unassigned shooting task').toBeDefined()
  return { state, productionId: workflow!.productionId }
}

function callDirector(state: GameState, productionId: string): GameState {
  const production = state.studio.activeProductions.find(
    (candidate) => candidate.id === productionId,
  )!
  return applyActions(state, [
    {
      kind: 'assignShootingDirector',
      productionId: production.id,
      directorId: production.directorId,
    },
  ])
}

/**
 * The same picture, with its stage's body moved to the far corner of the lot
 * BEFORE the Director call, so the derived trip is genuinely in transit when
 * the blocker is created. Only the PROPERTY is edited — the picture, its
 * reservations and its bindings are untouched.
 */
function withDistantStageFor(state: GameState, productionId: string): GameState {
  const workflow = state.operations.workflows.find(
    (candidate) => candidate.productionId === productionId,
  )!
  const stageFacilityId = workflow.bindings.stageFacilityId ??
    workflow.reservations.find((reservation) => reservation.capability === 'soundstage')!
      .facilityId
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

/** A picture whose scenery is genuinely ON THE ROAD: far stage, then the call. */
function pictureInTransit(seed: string): { state: GameState; workflow: ProductionWorkflow } {
  const start = pictureBeforeCall(seed)
  const far = withDistantStageFor(start.state, start.productionId)
  const called = callDirector(far, start.productionId)
  const workflow = called.operations.workflows.find(
    (candidate) => candidate.productionId === start.productionId,
  )!
  expect(workflow.blocker?.kind).toBe('scenery-load-in')
  expect(workflow.shootingTask?.status).toBe('blocked')
  return { state: called, workflow }
}

/** The one workflow this fixture is about, as the given state holds it now. */
function reread(state: GameState, productionId: string): ProductionWorkflow {
  return state.operations.workflows.find(
    (candidate) => candidate.productionId === productionId,
  )!
}

describe('C2a-M5 §4.2 — a real picture’s load-in', () => {
  it('derives a load-in from the shop it holds and the stage it is on', () => {
    const { state, workflow } = pictureInTransit('c2a-m5-loadin-real')
    const loadIn = sceneryLoadInFor(state, workflow, state.market.tick)
    expect(isSceneryLoadIn(loadIn)).toBe(true)
    if (!isSceneryLoadIn(loadIn)) return
    expect(loadIn.fromFacilityId).toBe(SCENERY_SHOP)
    expect([STAGE_A, STAGE_B]).toContain(loadIn.toFacilityId)
    expect(loadIn.distance).toBeGreaterThan(0)
    expect(loadIn.calledWeek).toBe(workflow.bindings.heldSinceWeek)
    expect(loadIn.weeks).toBeGreaterThan(TUNING.SCENERY_LOAD_IN_WEEKS_BASE)
    expect(loadIn.arrived).toBe(false)
    expect(loadIn.weeksRemaining).toBeGreaterThan(0)
  })

  // P05A W1 — THE DUE-AT-CALL EDGE IS SETTLED, NOT CLICKED. On the founding lot
  // the picture has held its stage for at least the two weeks its short trip
  // needed, so the trip is already due the moment the Director call creates the
  // blocker — and the call's own transaction settles it: the take is `ready`,
  // the blocker is gone, and exactly one `sceneryArrived` row exists. The old
  // behavior (an ARRIVED load-in standing behind a manual click) is the exact
  // defect Package 05 §13.2 orders corrected.
  it('a trip already due at the Director call settles inside the call itself', () => {
    const start = pictureBeforeCall('c2a-m5-loadin-due-at-call')
    const called = callDirector(start.state, start.productionId)
    const after = reread(called, start.productionId)
    expect(after.shootingTask!.status).toBe('ready')
    expect(after.blocker).toBeNull()
    const arrivals = called.studioEvents.rows.filter(
      (row) => row.kind === 'sceneryArrived' && row.productionId === start.productionId,
    )
    expect(arrivals).toHaveLength(1)
    // Stamped with the action's own authoritative week, like every action event.
    expect(arrivals[0]!.week).toBe(called.market.tick)
  })

  it('persists NOTHING — the duration is derived, and V14 gains no field', () => {
    const { state, workflow } = pictureInTransit('c2a-m5-loadin-save-neutral')
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

  // P05A W1 — the reconnect/old-save window: a derived trip already due while
  // its blocker still stands (built here by moving the stage back beside the
  // shop AFTER the call, which is geometry's version of loading an old save).
  // Manual clear is refused — arrival is the engine's own settlement — and the
  // next authoritative boundary settles it with exactly one arrival row.
  it('an arrived-current load-in refuses the click and settles at the next boundary', () => {
    const transit = pictureInTransit('c2a-m5-loadin-arrived-pending')
    const movedStage = transit.workflow.bindings.stageFacilityId!
    const authoredOrigin = INITIAL_PROPERTY.structures.find((structure) =>
      structure.providesFacilityIds.includes(movedStage),
    )!.origin
    const nearAgain: GameState = {
      ...transit.state,
      property: {
        ...transit.state.property!,
        structures: transit.state.property!.structures.map((structure) =>
          structure.providesFacilityIds.includes(movedStage)
            ? { ...structure, origin: authoredOrigin }
            : structure,
        ),
      },
    }
    const pending = sceneryLoadInFor(
      nearAgain,
      reread(nearAgain, transit.workflow.productionId),
      nearAgain.market.tick,
    )
    expect(isSceneryLoadIn(pending) && pending.arrived).toBe(true)
    expect(() =>
      applyActions(nearAgain, [
        { kind: 'clearSceneryLoadIn', productionId: transit.workflow.productionId },
      ]),
    ).toThrow(/already arrived/)
    const settled = tick(nearAgain)
    const after = reread(settled, transit.workflow.productionId)
    expect(after.shootingTask!.status).toBe('ready')
    expect(after.blocker).toBeNull()
    expect(
      settled.studioEvents.rows.filter(
        (row) =>
          row.kind === 'sceneryArrived' &&
          row.productionId === transit.workflow.productionId,
      ),
    ).toHaveLength(1)
  })
})

describe('C2a-M5 §4.2 — scenery IN TRANSIT (the mechanic, made to bite)', () => {
  it('a stage far from the shop is NOT supplied inside the base week', () => {
    const { state, workflow } = pictureInTransit('c2a-m5-loadin-far')
    const loadIn = sceneryLoadInFor(state, workflow, state.market.tick)
    expect(isSceneryLoadIn(loadIn)).toBe(true)
    if (!isSceneryLoadIn(loadIn)) return
    expect(loadIn.weeks).toBeGreaterThan(TUNING.SCENERY_LOAD_IN_WEEKS_BASE)
    expect(loadIn.arrived).toBe(false)
    expect(loadIn.weeksRemaining).toBeGreaterThan(0)
  })

  it('REFUSES the clear while the trucks are on the road, and says how far out', () => {
    const { state, workflow } = pictureInTransit('c2a-m5-loadin-refusal')
    expect(() =>
      applyActions(state, [{ kind: 'clearSceneryLoadIn', productionId: workflow.productionId }]),
    ).toThrow(/still in transit/)
  })

  it('THE ENGINE ENDS IT — the scenery arrives on a tick, with no player input', () => {
    const { state, workflow } = pictureInTransit('c2a-m5-loadin-arrival')
    let far = state
    const initial = sceneryLoadInFor(far, workflow, far.market.tick)
    expect(isSceneryLoadIn(initial) && initial.weeksRemaining).toBeGreaterThan(0)

    // The take stays blocked while the trip is unfinished …
    const midway = sceneryLoadInFor(far, reread(far, workflow.productionId), far.market.tick)
    if (isSceneryLoadIn(midway) && !midway.arrived) {
      expect(reread(far, workflow.productionId).shootingTask!.status).toBe('blocked')
    }
    // … and the engine clears it once the scenery is there. No command is issued
    // anywhere in this test after the director was assigned. P05A W1: arrival is
    // evaluated at the NEXT-WEEK boundary, so the tick that reaches the due week
    // is the tick that settles it.
    for (let i = 0; i < TUNING.SCENERY_LOAD_IN_WEEKS_MAX + 2; i++) {
      if (reread(far, workflow.productionId).shootingTask?.status === 'ready') break
      far = tick(far)
    }
    expect(reread(far, workflow.productionId).shootingTask!.status).toBe('ready')
    expect(reread(far, workflow.productionId).blocker).toBeNull()
    // The arrival is in the studio's own history, exactly once.
    expect(
      far.studioEvents.rows.filter(
        (row) => row.kind === 'sceneryArrived' && row.productionId === workflow.productionId,
      ),
    ).toHaveLength(1)
  })

  // P05A W1 — THE NEXT-BOUNDARY LAW, exactly: a trip with N weeks remaining
  // settles after exactly N ticks, and the produced state can never show a
  // derived trip as arrived while its blocker still stands.
  it('settles on the exact tick that reaches the due week — never a week late', () => {
    const { state, workflow } = pictureInTransit('c2a-m5-loadin-boundary')
    const initial = sceneryLoadInFor(state, workflow, state.market.tick)
    expect(isSceneryLoadIn(initial)).toBe(true)
    if (!isSceneryLoadIn(initial)) return
    let walked = state
    for (let i = 0; i < initial.weeksRemaining - 1; i++) {
      walked = tick(walked)
      expect(reread(walked, workflow.productionId).shootingTask!.status).toBe('blocked')
    }
    walked = tick(walked)
    const after = reread(walked, workflow.productionId)
    expect(after.shootingTask!.status).toBe('ready')
    expect(after.blocker).toBeNull()
  })

  it('is DETERMINISTIC — two identical runs produce identical states', () => {
    const run = (): string => {
      let far = pictureInTransit('c2a-m5-loadin-determinism').state
      for (let i = 0; i < 4; i++) far = tick(far)
      return JSON.stringify(far)
    }
    expect(run()).toBe(run())
  })
})

describe('C2a-M5 §4.2 — THE GRANDFATHER (the re-proof budget, ruled)', () => {
  /** Flip every workflow to the exact provenance the V14 migrator mints. */
  function asGrandfathered(state: GameState): GameState {
    return {
      ...state,
      operations: {
        ...state.operations,
        workflows: state.operations.workflows.map((candidate) => ({
          ...candidate,
          bindings: { ...candidate.bindings, requiresSetBinding: false },
        })),
      },
    }
  }

  it('a picture that never bound a set is never told how far its shop is', () => {
    const { state, workflow } = pictureInTransit('c2a-m5-loadin-grandfather')
    // Exactly what the V14 migrator mints for an in-flight workflow.
    const migrated: ProductionWorkflow = {
      ...workflow,
      bindings: { ...workflow.bindings, requiresSetBinding: false },
    }
    expect(sceneryLoadInFor(state, migrated, state.market.tick)).toBe('grandfathered')
  })

  it('a grandfathered picture’s load-in is NEVER refused, however far its stage is', () => {
    const { state, workflow } = pictureInTransit('c2a-m5-loadin-grandfather-click')
    const grandfathered = asGrandfathered(state)
    const cleared = applyActions(grandfathered, [
      { kind: 'clearSceneryLoadIn', productionId: workflow.productionId },
    ])
    expect(reread(cleared, workflow.productionId).shootingTask!.status).toBe('ready')
  })

  it('and the engine never ends a grandfathered load-in for the player either', () => {
    const { state, workflow } = pictureInTransit('c2a-m5-loadin-grandfather-tick')
    let grandfathered = asGrandfathered(state)
    for (let i = 0; i < 4; i++) grandfathered = tick(grandfathered)
    const after = grandfathered.operations.workflows.find(
      (candidate) => candidate.productionId === workflow.productionId,
    )
    // Still waiting for the click it has always waited for.
    expect(after?.shootingTask?.status).toBe('blocked')
    expect(after?.blocker?.kind).toBe('scenery-load-in')
  })
})
