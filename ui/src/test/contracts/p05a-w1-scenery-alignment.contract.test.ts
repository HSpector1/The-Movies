// ── P05A W1 CONTRACT SUITE — sibling consumer agreement on the scenery seam ──
//
// Charter (CODEX-P05A-IMPLEMENTATION-CHARTER.md@b1d506d, WAVE 1) law 10 /
// P04 lessons L-05 and L-15: every consumer of the one scenery legality
// classifier must agree as a PAIR — the command offered (or withheld) AND the
// sentence beside it. This file drives the browser read boundary
// (`productionBoard` / `studioDecision`) against the same engine fixtures the
// core truth suite uses; the classifier itself is proven in
// tests/p05a-w1-scenery-truth.test.ts.

import { describe, expect, it } from 'vitest'
import {
  applyActions,
  INITIAL_PROPERTY,
} from '../../../../src/core/index.ts'
import type { GameState, ProductionWorkflow } from '../../../../src/core/index.ts'
import { productionBoard, studioDecision } from '../../engine/adapter.ts'
import { contendedStudio } from '../../../../tests/_m4Fixtures.ts'
import { advance } from '../../../../tests/contracts/_contractFixtures.ts'

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

function moveStage(
  state: GameState,
  productionId: string,
  origin: { gx: number; gy: number } | 'authored',
): GameState {
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

function arrivedPending(seed: string): { state: GameState; productionId: string } {
  const transit = inTransit(seed)
  const state = moveStage(transit.state, transit.productionId, 'authored')
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

function cardOf(state: GameState, productionId: string) {
  return productionBoard(state).cards.find((card) => card.productionId === productionId)!
}

describe('P05A W1 — every sibling consumer reads the one classifier', () => {
  it('in-transit: no command anywhere, and the sentence says transit', () => {
    const { state, productionId } = inTransit('w1-align-transit')
    const card = cardOf(state, productionId)
    expect(card.command).toBeNull()
    expect(card.statusLabel).toBe('Scenery in transit')
    expect(card.blocker?.headline).toBe('Scenery in transit')
    expect(card.blocker?.detail).toMatch(/en route from .+ to .+ · \d+ weeks? remaining/)
    const decision = studioDecision(state)
    if (decision?.kind === 'productionDecision') {
      expect(decision.decision.productionId).not.toBe(productionId)
    }
  })

  it('arrived-pending: no command anywhere, and the sentence says arrival', () => {
    const { state, productionId } = arrivedPending('w1-align-pending')
    const card = cardOf(state, productionId)
    expect(card.command).toBeNull()
    expect(card.statusLabel).toBe('Scenery arrived')
    expect(card.blocker?.detail).toMatch(/no acknowledgment is required/)
    const decision = studioDecision(state)
    if (decision?.kind === 'productionDecision') {
      expect(decision.decision.productionId).not.toBe(productionId)
    }
  })

  it('grandfathered: the legacy click is offered, executes, and says legacy', () => {
    const { state, productionId } = inTransit('w1-align-grandfather')
    const grandfathered = withWorkflowBindings(state, productionId, (workflow) => ({
      ...workflow,
      bindings: { ...workflow.bindings, requiresSetBinding: false },
    }))
    const card = cardOf(grandfathered, productionId)
    expect(card.command?.kind).toBe('clearSceneryLoadIn')
    expect(card.blocker?.headline).toBe('Legacy load-in needs acknowledgment')
    expect(card.blocker?.detail).toMatch(/travel duration was not recorded/)
    const cleared = applyActions(grandfathered, [
      { kind: 'clearSceneryLoadIn', productionId },
    ])
    expect(workflowOf(cleared, productionId).shootingTask!.status).toBe('ready')
  })

  it('withheld: no command, and the sentence says unavailable — never a guess', () => {
    const { state, productionId } = inTransit('w1-align-withheld')
    const malformed = withWorkflowBindings(state, productionId, (workflow) => ({
      ...workflow,
      bindings: {
        ...workflow.bindings,
        requiresSetBinding: 'yes' as unknown as boolean,
      },
    }))
    const card = cardOf(malformed, productionId)
    expect(card.command).toBeNull()
    expect(card.statusLabel).toBe('Production details unavailable')
    expect(card.blocker?.detail).toMatch(/could not be derived exactly/)
    expect(() =>
      applyActions(malformed, [{ kind: 'clearSceneryLoadIn', productionId }]),
    ).toThrow(/provenance is withheld/)
  })
})
