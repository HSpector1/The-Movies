import { describe, expect, it } from 'vitest'
import {
  applyActions,
  beginFounding,
  FOUNDING_MINIMUMS,
  generateWorld,
  initialManagedStudioConstruction,
  initialManagedStudioOperations,
  nextStudioDecision,
  stableStringify,
  tick,
} from '../src/core/index.js'
import type {
  CastSlot,
  CommissionScriptPayload,
  CreativeRole,
  GameState,
  SegmentId,
  Talent,
} from '../src/core/index.js'

function byRole(talent: readonly Talent[], role: CreativeRole): Talent[] {
  return talent.filter((person) => person.role === role)
}

function richFoundedStudio(seed: string): GameState {
  let state = beginFounding(generateWorld(seed))
  const applicants = state.founding!.applicantIds.map(
    (id) => state.talent.find((person) => person.id === id)!,
  )
  const counts: Record<CreativeRole, number> = {
    actor: Math.max(6, FOUNDING_MINIMUMS.actor),
    director: Math.max(2, FOUNDING_MINIMUMS.director),
    writer: Math.max(3, FOUNDING_MINIMUMS.writer),
    craft: Math.max(2, FOUNDING_MINIMUMS.craft),
  }
  for (const role of ['actor', 'director', 'writer', 'craft'] as const) {
    for (const person of byRole(applicants, role).slice(0, counts[role])) {
      state = applyActions(state, [
        { kind: 'signContract', talentId: person.id, termWeeks: 104 },
      ])
    }
  }
  return applyActions(state, [{ kind: 'foundStudio' }])
}

function contractedByRole(state: GameState, role: CreativeRole): Talent[] {
  const contracted = new Set(state.contracts.map((contract) => contract.talentId))
  return byRole(
    state.talent.filter((person) => contracted.has(person.id)),
    role,
  )
}

function scriptPayload(
  state: GameState,
  conceptIndex: number,
  writerId: string,
): CommissionScriptPayload {
  const concept = state.concepts[conceptIndex]!
  return {
    conceptId: concept.id,
    writerId,
    shape: {
      opening: conceptIndex % 2 === 0 ? 'slowSetup' : 'mysteryHook',
      midpoint: conceptIndex % 2 === 0 ? 'revelation' : 'escalation',
      ending: conceptIndex % 2 === 0 ? 'bittersweet' : 'ambiguous',
    },
    promise: {
      genre: concept.genre,
      intendedSegments: ['adult', 'prestige'] as SegmentId[],
      ranges: {
        intimacy: [-0.4, 0.6],
        tonalWeight: [0, 0.8],
        kineticEnergy: [-0.7, 0.2],
      },
    },
  }
}

function rawProductionPayload(state: GameState, offset: number) {
  const concept = state.concepts[offset]!
  const actors = byRole(state.talent, 'actor')
  return {
    conceptId: concept.id,
    shape: {
      opening: 'slowSetup',
      midpoint: 'revelation',
      ending: 'bittersweet',
    } as const,
    promise: {
      genre: concept.genre,
      intendedSegments: ['adult'] as SegmentId[],
      ranges: {
        intimacy: [-0.5, 0.5] as [number, number],
        tonalWeight: [-0.5, 0.5] as [number, number],
        kineticEnergy: [-0.5, 0.5] as [number, number],
      },
    },
    writerId: byRole(state.talent, 'writer')[offset]!.id,
    directorId: byRole(state.talent, 'director')[offset]!.id,
    craftIds: [byRole(state.talent, 'craft')[offset]!.id],
    cast: {
      lead: actors[offset * 3]!.id,
      antagonist: actors[offset * 3 + 1]!.id,
      support: actors[offset * 3 + 2]!.id,
    } satisfies Record<CastSlot, string>,
    budget: { negative: concept.baseNegativeCost, marketing: 0 },
  }
}

function twoProductionsAtShooting(seed: string): GameState {
  let state: GameState = {
    ...generateWorld(seed),
    operations: initialManagedStudioOperations(),
    construction: initialManagedStudioConstruction(),
  }
  state = applyActions(state, [
    { kind: 'greenlight', production: rawProductionPayload(state, 0) },
  ])
  state = applyActions(state, [
    { kind: 'greenlight', production: rawProductionPayload(state, 1) },
  ])
  state = tick(state)
  state = tick(state)
  state = tick(state)
  return tick(state)
}

function reviewAndProductionDecisionState(seed: string): GameState {
  let state = richFoundedStudio(seed)
  state = applyActions(state, [
    { kind: 'activateStudioOperations' },
    { kind: 'activateScriptDevelopment' },
  ])
  const writers = contractedByRole(state, 'writer')
  const directors = contractedByRole(state, 'director')
  const actors = contractedByRole(state, 'actor')
  const craft = contractedByRole(state, 'craft')

  const first = scriptPayload(state, 0, writers[0]!.id)
  state = applyActions(state, [{ kind: 'commissionScript', project: first }])
  state = tick(state)
  state = applyActions(state, [{ kind: 'acceptScript', projectId: 'script-0000' }])
  state = applyActions(state, [
    {
      kind: 'greenlightScriptProject',
      production: {
        projectId: 'script-0000',
        directorId: directors[0]!.id,
        craftIds: [craft[0]!.id],
        cast: {
          lead: actors[0]!.id,
          antagonist: actors[1]!.id,
          support: actors[2]!.id,
        },
        budget: {
          negative: state.concepts[0]!.baseNegativeCost,
          marketing: 0,
        },
      },
    },
  ])

  // Move the production to Rehearsal, where Development & Casting is free.
  state = tick(state)
  state = tick(state)
  state = tick(state)
  state = applyActions(state, [
    { kind: 'commissionScript', project: scriptPayload(state, 1, writers[1]!.id) },
    { kind: 'commissionScript', project: scriptPayload(state, 2, writers[2]!.id) },
  ])
  // Both drafts resolve before the production advances from Rehearsal to Shooting.
  return tick(state)
}

describe('Script Projects V1 — unified studio decision ordering', () => {
  it('returns screenplay reviews first in project order, then the legal production command', () => {
    let state = reviewAndProductionDecisionState('studio-decision-priority')
    const production = state.studio.activeProductions[0]!
    expect(
      state.operations.workflows.find(
        (workflow) => workflow.productionId === production.id,
      )?.shootingTask?.status,
    ).toBe('unassigned')

    const projected = structuredClone(state)
    projected.scriptDevelopment.projects.reverse()
    expect(nextStudioDecision(projected)).toMatchObject({
      kind: 'scriptReview',
      projectId: 'script-0001',
    })

    const beforeDecision = stableStringify(state)
    const firstDecision = nextStudioDecision(state)
    expect(firstDecision).toMatchObject({
      kind: 'scriptReview',
      projectId: 'script-0001',
    })
    expect(nextStudioDecision(state)).toEqual(firstDecision)
    expect(stableStringify(state)).toBe(beforeDecision)
    state = applyActions(state, [{ kind: 'acceptScript', projectId: 'script-0001' }])
    expect(nextStudioDecision(state)).toMatchObject({
      kind: 'scriptReview',
      projectId: 'script-0002',
    })
    state = applyActions(state, [{ kind: 'acceptScript', projectId: 'script-0002' }])
    const productionDecision = nextStudioDecision(state)
    expect(productionDecision).toEqual({
      kind: 'productionOperation',
      productionId: production.id,
      command: {
        kind: 'assignShootingDirector',
        productionId: production.id,
        directorId: production.directorId,
      },
    })
    if (productionDecision?.kind !== 'productionOperation') {
      throw new Error('expected an actionable production operation')
    }
    expect(() => applyActions(state, [productionDecision.command])).not.toThrow()
  })

  it('orders production decisions by id and emits each exact legal shooting command', () => {
    let state = twoProductionsAtShooting('studio-decision-production-order')
    const ids = state.studio.activeProductions.map((production) => production.id).sort()
    state = {
      ...state,
      studio: {
        ...state.studio,
        activeProductions: [...state.studio.activeProductions].reverse(),
      },
      operations: {
        ...state.operations,
        workflows: [...state.operations.workflows].reverse(),
      },
    }

    let decision = nextStudioDecision(state)
    expect(decision).toMatchObject({
      kind: 'productionOperation',
      productionId: ids[0],
      command: { kind: 'assignShootingDirector', productionId: ids[0] },
    })
    if (decision?.kind !== 'productionOperation') throw new Error('missing assign decision')
    state = applyActions(state, [decision.command])

    decision = nextStudioDecision(state)
    expect(decision).toEqual({
      kind: 'productionOperation',
      productionId: ids[0],
      command: { kind: 'clearSceneryLoadIn', productionId: ids[0] },
    })
    if (decision?.kind !== 'productionOperation') throw new Error('missing scenery decision')
    state = applyActions(state, [decision.command])

    decision = nextStudioDecision(state)
    expect(decision).toEqual({
      kind: 'productionOperation',
      productionId: ids[0],
      command: { kind: 'scheduleShootingTake', productionId: ids[0] },
    })
    if (decision?.kind !== 'productionOperation') throw new Error('missing schedule decision')
    state = applyActions(state, [decision.command])

    expect(nextStudioDecision(state)).toMatchObject({
      kind: 'productionOperation',
      productionId: ids[1],
      command: { kind: 'assignShootingDirector', productionId: ids[1] },
    })
  })

  it('returns null for legacy state and capacity-only warnings, without mutation', () => {
    const legacy = generateWorld('studio-decision-legacy')
    const legacyBefore = stableStringify(legacy)
    expect(nextStudioDecision(legacy)).toBeNull()
    expect(stableStringify(legacy)).toBe(legacyBefore)

    let constrained: GameState = {
      ...generateWorld('studio-decision-capacity'),
      operations: {
        ...initialManagedStudioOperations(),
        facilities: initialManagedStudioOperations().facilities.filter(
          (facility) => facility.id !== 'facility-soundstage-12',
        ),
      },
      construction: initialManagedStudioConstruction(),
    }
    constrained = applyActions(constrained, [
      { kind: 'greenlight', production: rawProductionPayload(constrained, 0) },
    ])
    constrained = applyActions(constrained, [
      { kind: 'greenlight', production: rawProductionPayload(constrained, 1) },
    ])
    constrained = tick(constrained)
    constrained = tick(constrained)
    constrained = tick(constrained)
    expect(
      constrained.operations.workflows.some(
        (workflow) => workflow.blocker?.kind === 'facility-capacity',
      ),
    ).toBe(true)
    const before = stableStringify(constrained)
    expect(nextStudioDecision(constrained)).toBeNull()
    expect(nextStudioDecision(constrained)).toBeNull()
    expect(stableStringify(constrained)).toBe(before)
  })
})
