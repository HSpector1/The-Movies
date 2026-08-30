// ── C2a-M4 — THE RESOURCE-RELEASE LAW (ruling `00E`.5) ───────────────────────
//
// The Owner REVERSED r3.1's hold recommendation, and this file is the reversal
// under test:
//
//   *a scarce resource is held only while the current phase genuinely requires
//   it; when a phase's work COMPLETES, that phase's resources RELEASE, even if
//   the next phase's resource is unavailable.*
//
// Shooting completes → wrap fires → the stage and the set go back → the picture
// queues for Post HOLDING NOTHING → the freed stage is available to the next
// shoot THE SAME WEEK. Completed work never hostages an old resource.
//
// The walk below is a real studio, not a forged state: three pictures, one Post
// slot, and the week where two of them finish shooting at once.

import { describe, expect, it } from 'vitest'
import {
  advanceManagedProductions,
  applyActions,
  assertStudioOperationsInvariants,
  bindableSetsOnStage,
  productionsInSweepOrder,
  setById,
  stableStringify,
  studioCalendar,
  tick,
} from '../src/core/index.js'
import type { GameState, ProductionWorkflow } from '../src/core/index.js'
import { advance } from './contracts/_contractFixtures.js'
import { contendedStudio, freePackage } from './_m4Fixtures.js'

const POST_FACILITY = 'facility-post-building'

/** One Post slot for the whole studio — the scarcity the release law is about. */
function withOnePostSlot(state: GameState): GameState {
  return {
    ...state,
    operations: {
      ...state.operations,
      facilities: state.operations.facilities.map((facility) =>
        facility.id === POST_FACILITY ? { ...facility, capacity: 1 } : facility,
      ),
    },
  }
}

/** Issue whatever shooting commands the week is waiting on. */
function driveTakes(state: GameState): GameState {
  let next = state
  for (const workflow of state.operations.workflows) {
    if (workflow.phase !== 'shooting' || workflow.shootingTask === null) continue
    const production = state.studio.activeProductions.find(
      (candidate) => candidate.id === workflow.productionId,
    )!
    if (workflow.shootingTask.status === 'unassigned') {
      // P05A W1: due-at-call settles inside the Director call; schedule follows
      // the engine's own task status rather than a scripted clear.
      next = applyActions(next, [
        {
          kind: 'assignShootingDirector',
          productionId: production.id,
          directorId: production.directorId,
        },
      ])
    }
    const settled = next.operations.workflows.find(
      (candidate) => candidate.productionId === production.id,
    )
    if (settled?.shootingTask?.status === 'ready') {
      next = applyActions(next, [
        { kind: 'scheduleShootingTake', productionId: production.id },
      ])
    }
  }
  return next
}

function workflowOf(state: GameState, productionId: string): ProductionWorkflow {
  return state.operations.workflows.find(
    (workflow) => workflow.productionId === productionId,
  )!
}

/**
 * Two pictures in lockstep plus a third two weeks behind them, with exactly one
 * Post slot. The two leaders finish shooting in the same week: one enters Post,
 * the other wraps and waits — and the third is standing at the Rehearsal gate
 * that same week, needing a stage.
 */
function walkToTheWrapWeek(seed: string): {
  before: GameState
  after: GameState
  leaders: readonly string[]
  trailer: string
} {
  const { state, readyProjectIds } = contendedStudio(seed)
  let next = withOnePostSlot(state)
  const leaders = next.studio.activeProductions.map((production) => production.id)
  // Two advances free both Development & Casting slots (the leaders leave
  // Pre-production), which is what lets the third picture be greenlit at all.
  next = advance(next, 3)
  next = applyActions(next, [
    { kind: 'greenlightScriptProject', production: freePackage(next, readyProjectIds[0]!) },
  ])
  const trailer = next.studio.activeProductions[next.studio.activeProductions.length - 1]!.id
  // Walk to the week the leaders' shooting completes, issuing take commands as
  // the weeks ask for them.
  let before = next
  for (let week = 0; week < 12; week++) {
    const driven = driveTakes(before)
    const advanced = tick(driven)
    const wrapped = advanced.studioEvents.rows.some((row) => row.kind === 'wrapped')
    if (wrapped) return { before: driven, after: advanced, leaders, trailer }
    before = advanced
  }
  throw new Error('release-law fixture: no picture reached its wrap week')
}

describe('C2a-M4 `00E`.5 — a completed phase releases, even with nowhere to go', () => {
  it('wraps with Post full: the stage and the set go back, and a waiter takes the stage the SAME week', () => {
    const { before, after, leaders, trailer } = walkToTheWrapWeek('m4-release-law')

    // Both leaders were shooting, each on its own stage, before the advance.
    for (const id of leaders) {
      const workflow = workflowOf(before, id)
      expect(workflow.phase).toBe('shooting')
      expect(
        workflow.reservations.some((reservation) => reservation.capability === 'soundstage'),
      ).toBe(true)
    }

    // Exactly one Post slot, so exactly one of them could enter Post.
    const inPost = leaders.filter((id) => workflowOf(after, id).phase === 'postProduction')
    const waiting = leaders.filter((id) => workflowOf(after, id).phase === 'shooting')
    expect(inPost).toHaveLength(1)
    expect(waiting).toHaveLength(1)

    // ── THE LAW ────────────────────────────────────────────────────────────
    // The picture that could not enter Post still WRAPPED — the event fires
    // unconditionally — and it holds NOTHING: no stage, no scenery, no set, no
    // shooting task. A post-waiter is not a hostage-taker.
    const wrappedId = waiting[0]!
    const wrapRows = after.studioEvents.rows.filter((row) => row.kind === 'wrapped')
    expect(wrapRows.map((row) => (row as { productionId: string }).productionId).sort()).toEqual(
      [...leaders].sort(),
    )
    const stalled = workflowOf(after, wrappedId)
    expect(stalled.reservations).toEqual([])
    expect(stalled.shootingTask).toBeNull()
    expect(stalled.blocker).toEqual({
      kind: 'facility-capacity',
      capability: 'post',
      targetPhase: 'postProduction',
    })

    // ── AND THE POINT OF THE LAW ───────────────────────────────────────────
    // The third picture, which was waiting for a stage, is ON one — in the SAME
    // visible week the two leaders finished with theirs. That is the fixed-point
    // sweep and the release law together: capacity freed by anyone is visible to
    // every waiter the same week.
    const trailing = workflowOf(after, trailer)
    expect(trailing.phase).toBe('rehearsal')
    const stage = trailing.reservations.find(
      (reservation) => reservation.capability === 'soundstage',
    )
    expect(stage).toBeDefined()
    expect(trailing.bindings.setId).not.toBeNull()

    // The set the wrapped picture shot on is bindable again the same week (its
    // exclusivity is the stage's, and the stage went back).
    const wrappedSetId = stalled.bindings.setId
    expect(wrappedSetId).not.toBeNull()
    const releasedSet = setById(after.sets, wrappedSetId!)!
    expect(releasedSet.status).toBe('standing')
    expect(
      bindableSetsOnStage(after, releasedSet.mountedOn).some((set) => set.id === wrappedSetId),
    ).toBe(true)

    // The whole state still satisfies the operations authority, including the
    // acquisition-order invariant a post-waiter now trivially satisfies: it holds
    // nothing, so there is nothing it can be waiting below.
    assertStudioOperationsInvariants(after.operations, after.studio.activeProductions, {
      facilityPolicy: 'configured',
    })
  })

  it('keeps the stage and the set through Rehearsal → Shooting (the retention that stands)', () => {
    const { state } = contendedStudio('m4-retention')
    // Rehearsal acquires the stage+set composite; Shooting genuinely requires
    // both, so `00E`.5's retention exception applies and the crew does not move.
    let next = advance(state, 3)
    const [first] = next.studio.activeProductions
    const atRehearsal = workflowOf(next, first!.id)
    expect(atRehearsal.phase).toBe('rehearsal')
    const stageAtRehearsal = atRehearsal.bindings.stageFacilityId
    const setAtRehearsal = atRehearsal.bindings.setId
    const heldSince = atRehearsal.bindings.heldSinceWeek
    expect(stageAtRehearsal).not.toBeNull()
    expect(setAtRehearsal).not.toBeNull()

    next = tick(next)
    const atShooting = workflowOf(next, first!.id)
    expect(atShooting.phase).toBe('shooting')
    expect(atShooting.bindings.stageFacilityId).toBe(stageAtRehearsal)
    expect(atShooting.bindings.setId).toBe(setAtRehearsal)
    // The acquisition week survives the retention — that is the whole meaning of
    // the field, and it is how the queue view can say when the stage frees.
    expect(atShooting.bindings.heldSinceWeek).toBe(heldSince)
  })

  it('releases Pre-production’s slot to a waiter rather than holding it for a stage', () => {
    const { state } = contendedStudio('m4-preproduction-release')
    // One stage for two pictures: both finish Pre-production in the same week,
    // one gets the stage, and the other releases the Development & Casting slot
    // it no longer needs while it waits.
    let next: GameState = {
      ...state,
      operations: {
        ...state.operations,
        facilities: state.operations.facilities.filter(
          (facility) => facility.id !== 'facility-soundstage-12',
        ),
      },
      sets: state.sets.filter((set) => set.mountedOn !== 'facility-soundstage-12'),
    }
    next = advance(next, 3)
    const blocked = next.operations.workflows.find((workflow) => workflow.blocker !== null)
    expect(blocked).toBeDefined()
    expect(blocked!.phase).toBe('preProduction')
    expect(blocked!.reservations).toEqual([])
    // The slot it let go is genuinely free — the calendar shows it available.
    const board = studioCalendar(next).facilities.find(
      (facility) => facility.capability === 'development-casting',
    )!
    expect(board.available).toBeGreaterThan(0)
  })

  it('gives capacity released MID-SWEEP to the longest-waiting picture, not the next one scanned', () => {
    // ── THE PRIORITY INVERSION THE FIXED-POINT SWEEP MUST NOT HAVE ──────────
    //
    // Three pictures, ONE stage. The order is A (waited 3 weeks), C (waited 2,
    // and about to wrap), B (waited 1). A is attempted first and refused — the
    // stage is still under C. C then wraps and hands the stage back INSIDE the
    // same sweep. If the sweep simply carried on scanning, B — the shortest wait
    // — would take it, and A would find nothing when it retried. The scan
    // restarts instead, so the stage goes to A.
    const { state } = contendedStudio('m4-sweep-fairness')
    const template = state.studio.activeProductions[0]!
    const week = 20
    const make = (id: string, remainingTicks: number, waitWeeks: number) => ({
      ...template,
      id,
      startTick: week - waitWeeks - (8 - remainingTicks) - 1,
      remainingTicks,
    })
    const productions = [
      make('prod-0100', 7, 3), // A — longest wait, needs the stage
      make('prod-0101', 4, 2), // C — shooting, wraps this advance
      make('prod-0102', 7, 1), // B — shortest wait, also needs the stage
    ]
    const emptyBindings = {
      requiresSetBinding: false,
      stageFacilityId: null,
      setId: null,
      lockedNovelty: null,
      lockedUplift: null,
      heldSinceWeek: null,
    }
    const waiting = (productionId: string) => ({
      productionId,
      phase: 'preProduction' as const,
      reservations: [],
      shootingTask: null,
      blocker: {
        kind: 'facility-capacity' as const,
        capability: 'soundstage' as const,
        targetPhase: 'rehearsal' as const,
      },
      bindings: emptyBindings,
    })
    const operations = {
      ...state.operations,
      facilities: state.operations.facilities.filter(
        (facility) => facility.id !== 'facility-soundstage-12',
      ),
      workflows: [
        waiting('prod-0100'),
        {
          productionId: 'prod-0101',
          phase: 'shooting' as const,
          reservations: [
            {
              productionId: 'prod-0101',
              facilityId: 'facility-soundstage-07',
              capability: 'soundstage' as const,
              slot: 0,
              phase: 'shooting' as const,
            },
            {
              productionId: 'prod-0101',
              facilityId: 'facility-scenery-shop',
              capability: 'set-scenery' as const,
              slot: 0,
              phase: 'shooting' as const,
            },
          ],
          shootingTask: {
            id: 'shooting:prod-0101',
            productionId: 'prod-0101',
            directorId: template.directorId,
            soundstageFacilityId: 'facility-soundstage-07',
            status: 'completed' as const,
          },
          blocker: null,
          bindings: { ...emptyBindings, stageFacilityId: 'facility-soundstage-07', heldSinceWeek: 0 },
        },
        waiting('prod-0102'),
      ],
    }
    // The order the sweep will serve, stated by the engine's own comparator.
    expect(productionsInSweepOrder(productions, week).map((production) => production.id)).toEqual([
      'prod-0100',
      'prod-0101',
      'prod-0102',
    ])

    const advanced = advanceManagedProductions(operations, productions, week)
    const phaseOf = (productionId: string) =>
      advanced.operations.workflows.find(
        (workflow) => workflow.productionId === productionId,
      )!.phase
    expect(phaseOf('prod-0100')).toBe('rehearsal') // the longest wait got the stage
    expect(phaseOf('prod-0102')).toBe('preProduction') // the shortest wait still waits
    expect(phaseOf('prod-0101')).toBe('postProduction') // and the wrapper moved on
  })

  it('is deterministic under contention — the same seed resolves the same way twice', () => {
    expect(stableStringify(walkToTheWrapWeek('m4-release-determinism').after)).toBe(
      stableStringify(walkToTheWrapWeek('m4-release-determinism').after),
    )
  })
})
