// ── P05A W1 — Production truth: the one scenery legality classifier ──────────
//
// Charter (CODEX-P05A-IMPLEMENTATION-CHARTER.md@b1d506d, WAVE 1) requires the
// exact families this file proves: due-at-call, remaining-one boundary, current
// transit, arrived-current reconnect, explicit grandfather, absent/malformed
// provenance, forged Clear, idempotence, reload, exact event chronology, and
// sibling consumer agreement. `sceneryLoadInDecision` is the single owner; the
// tick, the Director call, `applyClearSceneryLoadIn`, the decision selector,
// the journey, and the board card all read its answer — asserted here as PAIRS
// (state AND the sentence/command beside it), per P04 lesson L-05.

import { describe, expect, it } from 'vitest'

import {
  applyActions,
  exportSave,
  firstFilmJourney,
  studioWeekTheater,
  importSave,
  makeSave,
  migrateToV17,
  sceneryLoadInDecision,
  sceneryLoadInFor,
  isSceneryLoadIn,
  tick,
} from '../src/core/index.js'
import type { GameState, ProductionWorkflow } from '../src/core/index.js'
import { INITIAL_PROPERTY } from '../src/core/index.js'
import { advance } from './contracts/_contractFixtures.js'
import { contendedStudio } from './_m4Fixtures.js'

// ── fixtures (same public-action walk the sealed C2a-M5 suite uses) ──────────

function pictureBeforeCall(
  seed: string,
  pick: 'first' | 'journey-winner' = 'first',
): { state: GameState; productionId: string } {
  let state = contendedStudio(seed).state
  let candidates: ProductionWorkflow[] = []
  for (let i = 0; i < 16; i++) {
    candidates = state.operations.workflows.filter(
      (candidate) =>
        candidate.phase === 'shooting' && candidate.shootingTask?.status === 'unassigned',
    )
    if (candidates.length > 0) break
    state = advance(state, 1)
  }
  expect(candidates.length, 'the fixture must reach an unassigned shooting task').toBeGreaterThan(0)
  if (pick === 'first') return { state, productionId: candidates[0]!.productionId }
  // The guided journey's no-decision production sort: newest startTick, then
  // DESCENDING id — pick the candidate the journey itself would guide.
  const byJourneyRank = [...candidates].sort((a, b) => {
    const pa = state.studio.activeProductions.find((p) => p.id === a.productionId)!
    const pb = state.studio.activeProductions.find((p) => p.id === b.productionId)!
    return pb.startTick - pa.startTick || (pb.id < pa.id ? -1 : pb.id > pa.id ? 1 : 0)
  })
  return { state, productionId: byJourneyRank[0]!.productionId }
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

function moveStage(state: GameState, productionId: string, origin: { gx: number; gy: number } | 'authored'): GameState {
  const workflow = state.operations.workflows.find(
    (candidate) => candidate.productionId === productionId,
  )!
  const stageFacilityId = workflow.bindings.stageFacilityId ??
    workflow.reservations.find((reservation) => reservation.capability === 'soundstage')!
      .facilityId
  const resolvedOrigin = origin === 'authored'
    ? INITIAL_PROPERTY.structures.find((structure) =>
        structure.providesFacilityIds.includes(stageFacilityId),
      )!.origin
    : origin
  return {
    ...state,
    property: {
      ...state.property!,
      structures: state.property!.structures.map((structure) =>
        structure.providesFacilityIds.includes(stageFacilityId)
          ? { ...structure, origin: resolvedOrigin }
          : structure,
      ),
    },
  }
}

/** Current derived trip, genuinely travelling: far stage, then the call. */
function inTransit(
  seed: string,
  pick: 'first' | 'journey-winner' = 'first',
): { state: GameState; productionId: string } {
  const start = pictureBeforeCall(seed, pick)
  const far = moveStage(start.state, start.productionId, { gx: 0, gy: 4 })
  const called = callDirector(far, start.productionId)
  const workflow = called.operations.workflows.find(
    (candidate) => candidate.productionId === start.productionId,
  )!
  expect(workflow.blocker?.kind).toBe('scenery-load-in')
  return { state: called, productionId: start.productionId }
}

/** The reconnect/old-save window: derived trip due while the blocker stands. */
function arrivedPending(
  seed: string,
  pick: 'first' | 'journey-winner' = 'first',
): { state: GameState; productionId: string } {
  const transit = inTransit(seed, pick)
  const state = moveStage(transit.state, transit.productionId, 'authored')
  const workflow = state.operations.workflows.find(
    (candidate) => candidate.productionId === transit.productionId,
  )!
  const loadIn = sceneryLoadInFor(state, workflow, state.market.tick)
  expect(isSceneryLoadIn(loadIn) && loadIn.arrived).toBe(true)
  expect(workflow.blocker?.kind).toBe('scenery-load-in')
  return { state, productionId: transit.productionId }
}

function withWorkflowBindings(
  state: GameState,
  productionId: string,
  mutate: (workflow: ProductionWorkflow) => ProductionWorkflow,
): GameState {
  return {
    ...state,
    operations: {
      ...state.operations,
      workflows: state.operations.workflows.map((candidate) =>
        candidate.productionId === productionId ? mutate(candidate) : candidate,
      ),
    },
  }
}

function workflowOf(state: GameState, productionId: string): ProductionWorkflow {
  return state.operations.workflows.find(
    (candidate) => candidate.productionId === productionId,
  )!
}

function arrivalRows(state: GameState, productionId: string) {
  return state.studioEvents.rows.filter(
    (row) => row.kind === 'sceneryArrived' && row.productionId === productionId,
  )
}


// ── the world plays the trucks arriving (review finding F3) ──────────────────

describe('P05A W1 — the theater plays the arrival week', () => {
  function arrivalSubject(state: GameState, productionId: string) {
    return studioWeekTheater(state).subjects.find(
      (subject) =>
        subject.kind === 'scenery-in-transit' && subject.productionId === productionId,
    )
  }

  it('plays travel weeks, then the arrival beats in the settled week, then stops', () => {
    const { state, productionId } = inTransit('w1-theater-arrival')
    let current = state
    // Travelling weeks: the subject is on the road.
    const travelling = arrivalSubject(current, productionId)
    expect(travelling).toBeDefined()
    expect(travelling!.beats.every((beat) => beat === 'travel')).toBe(true)
    // Walk to the settled week.
    for (let guard = 0; guard < 8; guard++) {
      if (workflowOf(current, productionId).shootingTask?.status === 'ready') break
      current = tick(current)
    }
    expect(workflowOf(current, productionId).shootingTask?.status).toBe('ready')
    const arriving = arrivalSubject(current, productionId)
    expect(arriving, 'the settled week must play the arrival').toBeDefined()
    expect(arriving!.weeksRemaining).toBe(0)
    expect(arriving!.beats[0]).toBe('travel')
    expect(arriving!.beats).toContain('working')
    // The cue is bounded: it does not replay after the window closes.
    const later = tick(current)
    expect(arrivalSubject(later, productionId)).toBeUndefined()
  })

  it('plays the arrival for a due-at-call settlement and stops once the take is scheduled', () => {
    const start = pictureBeforeCall('w1-theater-due-at-call')
    const called = callDirector(start.state, start.productionId)
    expect(workflowOf(called, start.productionId).shootingTask?.status).toBe('ready')
    const arriving = arrivalSubject(called, start.productionId)
    expect(arriving).toBeDefined()
    expect(arriving!.weeksRemaining).toBe(0)
    const scheduled = applyActions(called, [
      { kind: 'scheduleShootingTake', productionId: start.productionId },
    ])
    expect(arrivalSubject(scheduled, start.productionId)).toBeUndefined()
  })

  // W1 final-disposition residual R1, pinned honestly: the action-settled cue
  // with a still-unscheduled take survives exactly ONE further advance (the
  // two sink stamps are indistinguishable from state one week on) and is gone
  // the week after. Bounded, deterministic, cosmetic — and now asserted.
  it('bounds the unscheduled due-at-call cue to exactly two weeks', () => {
    const start = pictureBeforeCall('w1-theater-r1-window')
    const called = callDirector(start.state, start.productionId)
    expect(workflowOf(called, start.productionId).shootingTask?.status).toBe('ready')
    expect(arrivalSubject(called, start.productionId)).toBeDefined()
    const oneWeekOn = tick(called)
    expect(workflowOf(oneWeekOn, start.productionId).shootingTask?.status).toBe('ready')
    expect(arrivalSubject(oneWeekOn, start.productionId)).toBeDefined()
    const twoWeeksOn = tick(oneWeekOn)
    expect(arrivalSubject(twoWeeksOn, start.productionId)).toBeUndefined()
  })
})

// ── the classifier itself ────────────────────────────────────────────────────

describe('P05A W1 — the one scenery legality classifier', () => {
  it('classifies a travelling current trip as in-transit', () => {
    const { state, productionId } = inTransit('w1-classify-transit')
    const decision = sceneryLoadInDecision(state, workflowOf(state, productionId), state.market.tick)
    expect(decision.kind).toBe('in-transit')
  })

  it('classifies a due-but-standing trip as arrived-pending', () => {
    const { state, productionId } = arrivedPending('w1-classify-pending')
    const decision = sceneryLoadInDecision(state, workflowOf(state, productionId), state.market.tick)
    expect(decision.kind).toBe('arrived-pending')
  })

  it('grandfathers ONLY the exact false the V14 migrator mints', () => {
    const { state, productionId } = inTransit('w1-classify-grandfather')
    const grandfathered = withWorkflowBindings(state, productionId, (workflow) => ({
      ...workflow,
      bindings: { ...workflow.bindings, requiresSetBinding: false },
    }))
    expect(
      sceneryLoadInDecision(grandfathered, workflowOf(grandfathered, productionId), grandfathered.market.tick).kind,
    ).toBe('manual-clear')
  })

  it('withholds absent bindings instead of grandfathering them', () => {
    const { state, productionId } = inTransit('w1-classify-absent')
    const absent = withWorkflowBindings(state, productionId, (workflow) => {
      const clone = { ...workflow } as Record<string, unknown>
      delete clone['bindings']
      return clone as unknown as ProductionWorkflow
    })
    const decision = sceneryLoadInDecision(absent, workflowOf(absent, productionId), absent.market.tick)
    expect(decision).toEqual({ kind: 'withheld', reason: 'no-bindings' })
  })

  it('withholds a malformed provenance flag instead of grandfathering it', () => {
    const { state, productionId } = inTransit('w1-classify-malformed')
    const malformed = withWorkflowBindings(state, productionId, (workflow) => ({
      ...workflow,
      bindings: {
        ...workflow.bindings,
        requiresSetBinding: 'yes' as unknown as boolean,
      },
    }))
    const decision = sceneryLoadInDecision(malformed, workflowOf(malformed, productionId), malformed.market.tick)
    expect(decision).toEqual({ kind: 'withheld', reason: 'malformed-provenance' })
  })
})

// ── enforcement: manual Clear legality ───────────────────────────────────────

describe('P05A W1 — manual Clear is the grandfather’s click and nobody else’s', () => {
  it('rejects the arrived-current click and names the settlement', () => {
    const { state, productionId } = arrivedPending('w1-clear-pending')
    expect(() =>
      applyActions(state, [{ kind: 'clearSceneryLoadIn', productionId }]),
    ).toThrow(/already arrived.*no acknowledgment is required/)
  })

  it('rejects a withheld-provenance click and names the withholding', () => {
    const { state, productionId } = inTransit('w1-clear-withheld')
    const absent = withWorkflowBindings(state, productionId, (workflow) => {
      const clone = { ...workflow } as Record<string, unknown>
      delete clone['bindings']
      return clone as unknown as ProductionWorkflow
    })
    expect(() =>
      applyActions(absent, [{ kind: 'clearSceneryLoadIn', productionId }]),
    ).toThrow(/provenance is withheld \(no-bindings\)/)
  })

  it('rejects a forged Clear against a production with no scenery blocker', () => {
    const { state, productionId } = arrivedPending('w1-clear-forged')
    const settled = tick(state)
    expect(workflowOf(settled, productionId).blocker).toBeNull()
    expect(() =>
      applyActions(settled, [{ kind: 'clearSceneryLoadIn', productionId }]),
    ).toThrow(/no active scenery-load-in blocker/)
  })

  it('rejects a Clear against an unknown production loudly', () => {
    const { state } = inTransit('w1-clear-unknown')
    expect(() =>
      applyActions(state, [{ kind: 'clearSceneryLoadIn', productionId: 'prod-nope' }]),
    ).toThrow()
  })
})

// ── settlement: exactly once, at exact boundaries ────────────────────────────

describe('P05A W1 — settlement is exactly-once at exact boundaries', () => {
  it('settles the arrived-current reconnect state at the next boundary, once', () => {
    const { state, productionId } = arrivedPending('w1-settle-pending')
    const settled = tick(state)
    expect(workflowOf(settled, productionId).shootingTask!.status).toBe('ready')
    expect(arrivalRows(settled, productionId)).toHaveLength(1)
    // Tick-sink chronology: the engine's sink stamps the pre-advance week.
    expect(arrivalRows(settled, productionId)[0]!.week).toBe(settled.market.tick - 1)
    // Idempotence: another week writes no second arrival.
    const again = tick(settled)
    expect(arrivalRows(again, productionId)).toHaveLength(1)
  })

  it('remaining-one boundary: the tick that reaches the due week settles it', () => {
    const { state, productionId } = inTransit('w1-settle-boundary')
    const loadIn = sceneryLoadInFor(state, workflowOf(state, productionId), state.market.tick)
    expect(isSceneryLoadIn(loadIn)).toBe(true)
    if (!isSceneryLoadIn(loadIn)) return
    let walked = state
    for (let i = 0; i < loadIn.weeksRemaining - 1; i++) {
      walked = tick(walked)
      expect(workflowOf(walked, productionId).shootingTask!.status).toBe('blocked')
      expect(arrivalRows(walked, productionId)).toHaveLength(0)
    }
    walked = tick(walked)
    expect(workflowOf(walked, productionId).shootingTask!.status).toBe('ready')
    expect(arrivalRows(walked, productionId)).toHaveLength(1)
  })

  it('due-at-call: the Director call settles in its own transaction, stamped with the action week', () => {
    const start = pictureBeforeCall('w1-settle-due-at-call')
    const called = callDirector(start.state, start.productionId)
    const after = workflowOf(called, start.productionId)
    expect(after.shootingTask!.status).toBe('ready')
    expect(after.blocker).toBeNull()
    const rows = arrivalRows(called, start.productionId)
    expect(rows).toHaveLength(1)
    expect(rows[0]!.week).toBe(called.market.tick)
    // Idempotence across the boundary: the next tick adds nothing.
    expect(arrivalRows(tick(called), start.productionId)).toHaveLength(1)
  })
})



/**
 * The guided journey ranks advancing screenplays above productions and, among
 * productions, the newest start (descending id on ties). For journey-guidance
 * tests the contended studio's spare READY screenplays are retired so the
 * in-production picture is the guided one.
 */
function withoutAdvancingScripts(state: GameState): GameState {
  return {
    ...state,
    scriptDevelopment: {
      ...state.scriptDevelopment,
      projects: state.scriptDevelopment.projects.filter(
        (project) => project.status === 'inProduction' || project.status === 'produced',
      ),
    },
  }
}

// ── journey guidance (review findings F4/F5) ─────────────────────────────────

describe('P05A W1 — journey guidance for the scenery states', () => {
  it('speaks honest transit guidance on the advance-week path', () => {
    const { state, productionId } = inTransit('w1-journey-transit', 'journey-winner')
    // Settle the OTHER leader's decisions so the guided picture is ours.
    let current = state
    for (const production of current.studio.activeProductions) {
      if (production.id === productionId) continue
      const workflow = workflowOf(current, production.id)
      if (workflow.phase === 'shooting' && workflow.shootingTask?.status === 'unassigned') {
        current = applyActions(current, [
          {
            kind: 'assignShootingDirector',
            productionId: production.id,
            directorId: production.directorId,
          },
          { kind: 'scheduleShootingTake', productionId: production.id },
        ])
      }
    }
    current = withoutAdvancingScripts(current)
    const journey = firstFilmJourney(current)
    expect(journey.productionId).toBe(productionId)
    expect(journey).toMatchObject({
      stage: 'in-production',
      beat: 'load-in',
      headline: 'LOAD-IN',
      blocked: null,
    })
    expect(journey.next).toMatchObject({ kind: 'advance-week', site: null })
    expect(journey.next!.label).toBe('Scenery is on the road — advance the week')
    expect(journey.whyItMatters).toBe(
      'Scenery arrival is not a player decision — the engine settles the load-in itself.',
    )
    const loadIn = sceneryLoadInFor(
      current,
      workflowOf(current, productionId),
      current.market.tick,
    )
    expect(isSceneryLoadIn(loadIn)).toBe(true)
    if (!isSceneryLoadIn(loadIn)) return
    expect(journey.waiting?.reason).toContain('Scenery is en route to ')
    expect(journey.waiting?.reason).toContain(
      `${String(loadIn.weeksRemaining)} ${loadIn.weeksRemaining === 1 ? 'week' : 'weeks'} remaining`,
    )
    expect(journey.waiting?.untilWeek).toBe(current.market.tick + loadIn.weeksRemaining)
  })

  it('speaks arrival guidance for the arrived-current reconnect window', () => {
    const pending = arrivedPending('w1-journey-pending', 'journey-winner')
    let current = pending.state
    for (const production of current.studio.activeProductions) {
      if (production.id === pending.productionId) continue
      const workflow = workflowOf(current, production.id)
      if (workflow.phase === 'shooting' && workflow.shootingTask?.status === 'unassigned') {
        current = applyActions(current, [
          {
            kind: 'assignShootingDirector',
            productionId: production.id,
            directorId: production.directorId,
          },
          { kind: 'scheduleShootingTake', productionId: production.id },
        ])
      }
    }
    current = withoutAdvancingScripts(current)
    const journey = firstFilmJourney(current)
    expect(journey.productionId).toBe(pending.productionId)
    expect(journey.headline).toBe('LOAD-IN')
    expect(journey.next!.label).toBe('Scenery has arrived — advance the week')
    expect(journey.waiting?.reason).toContain('Scenery has arrived at ')
    expect(journey.waiting?.untilWeek).toBe(current.market.tick + 1)
  })

  it('keeps the grandfathered clear journey exact: LOAD-IN BLOCKED at the named facilities', () => {
    const { state, productionId } = inTransit('w1-journey-grandfather')
    const grandfathered = withWorkflowBindings(state, productionId, (workflow) => ({
      ...workflow,
      bindings: { ...workflow.bindings, requiresSetBinding: false },
    }))
    // Settle the other leader so the guided decision is the grandfathered clear.
    let current = grandfathered
    for (const production of current.studio.activeProductions) {
      if (production.id === productionId) continue
      const workflow = workflowOf(current, production.id)
      if (workflow.phase === 'shooting' && workflow.shootingTask?.status === 'unassigned') {
        current = applyActions(current, [
          {
            kind: 'assignShootingDirector',
            productionId: production.id,
            directorId: production.directorId,
          },
          { kind: 'scheduleShootingTake', productionId: production.id },
        ])
      }
    }
    const journey = firstFilmJourney(current)
    expect(journey.productionId).toBe(productionId)
    expect(journey).toMatchObject({ beat: 'load-in', headline: 'LOAD-IN BLOCKED' })
    expect(journey.next).toMatchObject({ kind: 'resolve-production', site: 'post' })
    // The step names the picture's own reserved facilities (red-team law) —
    // never "at the soundstage" alone.
    const facilities = workflowOf(current, productionId).reservations.map(
      (reservation) =>
        current.operations.facilities.find(
          (facility) => facility.id === reservation.facilityId,
        )!.name,
    )
    expect(facilities.length).toBeGreaterThan(1)
    expect(journey.next!.label).toBe(
      `Clear the scenery load-in at ${facilities.join(' + ')}`,
    )
    expect(journey.next!.label).not.toContain('at the soundstage')
  })
})

// ── presence: in-transit is work on site, never a capacity wait ──────────────

describe('P05A W1 — in-transit presence stays work, not waiting', () => {
  it('keeps the Director unblocked and never waiting while scenery travels', async () => {
    const { studioPresence } = await import('../src/core/index.js')
    const { state, productionId } = inTransit('w1-presence-transit')
    const production = state.studio.activeProductions.find(
      (candidate) => candidate.id === productionId,
    )!
    const presence = studioPresence(state)
    const director = presence.people.find(
      (candidate) => candidate.talentId === production.directorId,
    )
    expect(director).toBeDefined()
    expect(director!.blockedReason).toBeNull()
    expect(director!.beats).not.toContain('waiting')
  })
})

// ── reload: the classification survives a save round-trip ────────────────────

describe('P05A W1 — reload keeps the classification', () => {
  function roundTrip(state: GameState): GameState {
    return migrateToV17(importSave(exportSave(makeSave(state)))).state
  }

  it('an in-transit trip reloads as the same in-transit trip', () => {
    const { state, productionId } = inTransit('w1-reload-transit')
    const before = sceneryLoadInDecision(state, workflowOf(state, productionId), state.market.tick)
    const loaded = roundTrip(state)
    const after = sceneryLoadInDecision(loaded, workflowOf(loaded, productionId), loaded.market.tick)
    expect(after).toEqual(before)
  })

  it('an arrived-current state reloads arrived-current and settles on the next tick', () => {
    const { state, productionId } = arrivedPending('w1-reload-pending')
    const loaded = roundTrip(state)
    expect(
      sceneryLoadInDecision(loaded, workflowOf(loaded, productionId), loaded.market.tick).kind,
    ).toBe('arrived-pending')
    const settled = tick(loaded)
    expect(workflowOf(settled, productionId).shootingTask!.status).toBe('ready')
  })
})
