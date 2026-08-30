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
  importSave,
  makeSave,
  migrateToV15,
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

function pictureBeforeCall(seed: string): { state: GameState; productionId: string } {
  let state = contendedStudio(seed).state
  let workflow: ProductionWorkflow | undefined
  for (let i = 0; i < 16; i++) {
    workflow = state.operations.workflows.find(
      (candidate) =>
        candidate.phase === 'shooting' && candidate.shootingTask?.status === 'unassigned',
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
function inTransit(seed: string): { state: GameState; productionId: string } {
  const start = pictureBeforeCall(seed)
  const far = moveStage(start.state, start.productionId, { gx: 0, gy: 4 })
  const called = callDirector(far, start.productionId)
  const workflow = called.operations.workflows.find(
    (candidate) => candidate.productionId === start.productionId,
  )!
  expect(workflow.blocker?.kind).toBe('scenery-load-in')
  return { state: called, productionId: start.productionId }
}

/** The reconnect/old-save window: derived trip due while the blocker stands. */
function arrivedPending(seed: string): { state: GameState; productionId: string } {
  const transit = inTransit(seed)
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
    return migrateToV15(importSave(exportSave(makeSave(state)))).state
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
