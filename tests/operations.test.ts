import { describe, expect, it } from 'vitest'
import {
  applyActions,
  assertStudioOperationsInvariants,
  beginFounding,
  emptyStudioConstruction,
  emptyStudioOperations,
  FOUNDING_MINIMUMS,
  generateWorld,
  INITIAL_STUDIO_FACILITIES,
  initialManagedStudioConstruction,
  initialManagedStudioOperations,
  addManagedProductionWorkflow,
  advanceManagedProductions,
  computeForecast,
  resolveShape,
  stableStringify,
  tick,
} from '../src/core/index.js'
import type {
  CastSlot,
  CreativeRole,
  GameState,
  SegmentId,
  Talent,
} from '../src/core/index.js'

function applicants(state: GameState): Talent[] {
  return state.founding!.applicantIds.map((id) => state.talent.find((talent) => talent.id === id)!)
}

function byRole(talent: readonly Talent[], role: CreativeRole): Talent[] {
  return talent.filter((person) => person.role === role)
}

function foundedStudio(seed: string): GameState {
  let state = beginFounding(generateWorld(seed))
  const pool = applicants(state)
  const hires = [
    ...byRole(pool, 'actor').slice(0, FOUNDING_MINIMUMS.actor),
    ...byRole(pool, 'director').slice(0, FOUNDING_MINIMUMS.director),
    ...byRole(pool, 'writer').slice(0, FOUNDING_MINIMUMS.writer),
    ...byRole(pool, 'craft').slice(0, FOUNDING_MINIMUMS.craft),
  ]
  for (const hire of hires) {
    state = applyActions(state, [{ kind: 'signContract', talentId: hire.id, termWeeks: 104 }])
  }
  return applyActions(state, [{ kind: 'foundStudio' }])
}

function assignment(state: GameState, offset = 0) {
  const population =
    state.contracts.length > 0
      ? state.contracts.map((contract) => state.talent.find((talent) => talent.id === contract.talentId)!)
      : state.talent
  const actors = byRole(population, 'actor')
  return {
    writerId: byRole(population, 'writer')[offset]!.id,
    directorId: byRole(population, 'director')[offset]!.id,
    cast: {
      lead: actors[offset * 3]!.id,
      antagonist: actors[offset * 3 + 1]!.id,
      support: actors[offset * 3 + 2]!.id,
    } satisfies Record<CastSlot, string>,
    craftIds: [byRole(population, 'craft')[offset]!.id],
  }
}

function productionPayload(state: GameState, offset = 0) {
  const concept = state.concepts[offset]!
  return {
    conceptId: concept.id,
    shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' } as const,
    promise: {
      genre: concept.genre,
      intendedSegments: ['adult'] as SegmentId[],
      ranges: {
        intimacy: [-0.5, 0.5] as [number, number],
        tonalWeight: [-0.5, 0.5] as [number, number],
        kineticEnergy: [-0.5, 0.5] as [number, number],
      },
    },
    ...assignment(state, offset),
    budget: { negative: concept.baseNegativeCost, marketing: 0 },
  }
}

function greenlightManaged(state: GameState, offset = 0): GameState {
  return applyActions(state, [{ kind: 'greenlight', production: productionPayload(state, offset) }])
}

function toShooting(state: GameState): GameState {
  let next = tick(state) // greenlight tick: skip
  next = tick(next) // Development → Pre-production
  next = tick(next) // Pre-production → Rehearsal
  return tick(next) // Rehearsal → Shooting
}

function withOneSoundstage(state: GameState): GameState {
  return {
    ...state,
    operations: {
      ...state.operations,
      facilities: state.operations.facilities.filter(
        (facility) => facility.id !== 'facility-soundstage-12',
      ),
    },
  }
}

function assertConfiguredOperations(state: GameState): void {
  assertStudioOperationsInvariants(state.operations, state.studio.activeProductions, {
    facilityPolicy: 'configured',
  })
}

function tickWithInvariant(
  state: GameState,
  facilityPolicy: 'initial-v1' | 'configured' = 'initial-v1',
): GameState {
  const next = tick(state)
  assertStudioOperationsInvariants(next.operations, next.studio.activeProductions, {
    facilityPolicy,
  })
  return next
}

describe('Production Operations V1', () => {
  it('honors externally occupied slots when allocating or advancing workflows', () => {
    const world = generateWorld('ops-external-capacity')
    const operations = initialManagedStudioOperations()
    const payload = productionPayload(world)
    const writer = world.talent.find((talent) => talent.id === payload.writerId)!
    const director = world.talent.find((talent) => talent.id === payload.directorId)!
    const cast = Object.fromEntries(
      Object.entries(payload.cast).map(([slot, id]) => [
        slot,
        world.talent.find((talent) => talent.id === id)!,
      ]),
    ) as Record<CastSlot, Talent>
    const craftHires = payload.craftIds.map(
      (id) => world.talent.find((talent) => talent.id === id)!,
    )
    const concept = world.concepts.find((candidate) => candidate.id === payload.conceptId)!
    const production = {
      ...payload,
      id: 'prod-external',
      startTick: 0,
      remainingTicks: 8,
      forecastSnapshot: computeForecast(
        {
          concept,
          shape: payload.shape,
          shapeEffects: resolveShape(payload.shape),
          promise: payload.promise,
          budget: payload.budget,
          writer,
          director,
          cast,
          craftHires,
          market: world.market,
          standing: world.studio.standing,
          era: world.era,
        },
        {
          seed: world.seed,
          productionId: 'prod-external',
          directorId: director.id,
          releasedFilms: [],
          concepts: world.concepts,
        },
      ),
    }
    const oneSlotTaken = new Set(['facility-development-casting:0'])
    const allocated = addManagedProductionWorkflow(operations, production, oneSlotTaken)
    expect(allocated.workflows[0]!.reservations[0]!.slot).toBe(1)

    expect(() =>
      addManagedProductionWorkflow(
        operations,
        production,
        new Set([
          'facility-development-casting:0',
          'facility-development-casting:1',
        ]),
      ),
    ).toThrow(/no development-casting capacity/)

    const advanced = advanceManagedProductions(
      allocated,
      [{ ...production, startTick: -1 }],
      0,
      oneSlotTaken,
    )
    expect(advanced.productions[0]!.remainingTicks).toBe(7)
    expect(advanced.operations.workflows[0]!.reservations[0]!.slot).toBe(1)
  })

  it('deep-freezes the exported facility template while activation receives fresh clones', () => {
    expect(Object.isFrozen(INITIAL_STUDIO_FACILITIES)).toBe(true)
    for (const facility of INITIAL_STUDIO_FACILITIES) expect(Object.isFrozen(facility)).toBe(true)

    const template = INITIAL_STUDIO_FACILITIES[0]!
    const initialCapacity = template.capacity
    expect(Reflect.set(template, 'capacity', initialCapacity + 99)).toBe(false)
    expect(template.capacity).toBe(initialCapacity)

    const first = initialManagedStudioOperations()
    const second = initialManagedStudioOperations()
    expect(first.facilities[0]).not.toBe(template)
    expect(first.facilities[0]).not.toBe(second.facilities[0])
    first.facilities[0] = { ...first.facilities[0]!, capacity: 1 }
    expect(second.facilities[0]!.capacity).toBe(initialCapacity)
    expect(INITIAL_STUDIO_FACILITIES[0]!.capacity).toBe(initialCapacity)
  })

  it('seeds legacy/empty and preserves legacy countdown behavior', () => {
    const world = generateWorld('ops-legacy')
    expect(world.operations).toEqual(emptyStudioOperations())
    const greenlit = applyActions(world, [
      { kind: 'greenlight', production: productionPayload(world) },
    ])
    const afterSkip = tick(greenlit)
    const afterAdvance = tick(afterSkip)
    expect(afterAdvance.studio.activeProductions[0]!.remainingTicks).toBe(7)
    expect(afterAdvance.operations).toEqual(emptyStudioOperations())
  })

  it('activates only for a founded, engaged studio with an empty active slate', () => {
    const headless = generateWorld('ops-activation-headless')
    expect(() => applyActions(headless, [{ kind: 'activateStudioOperations' }])).toThrow(
      /economy is not engaged/,
    )

    const drafting = beginFounding(generateWorld('ops-activation-draft'))
    expect(() => applyActions(drafting, [{ kind: 'activateStudioOperations' }])).toThrow(
      /founding draft/,
    )

    const founded = foundedStudio('ops-activation')
    const rngBefore = founded.rngState
    const managed = applyActions(founded, [{ kind: 'activateStudioOperations' }])
    expect(managed.operations).toEqual(initialManagedStudioOperations())
    expect(managed.rngState).toBe(rngBefore)
    expect(() => applyActions(managed, [{ kind: 'activateStudioOperations' }])).toThrow(
      /already managed/,
    )

    const withFilm = greenlightManaged(managed)
    expect(() =>
      applyActions(
        {
          ...withFilm,
          operations: emptyStudioOperations(),
          construction: emptyStudioConstruction(),
        },
        [{ kind: 'activateStudioOperations' }],
      ),
    ).toThrow(/active production slate is not empty/)
  })

  it('creates the managed workflow and allocates slots deterministically', () => {
    let state = generateWorld('ops-allocation')
    state = {
      ...state,
      operations: initialManagedStudioOperations(),
      construction: initialManagedStudioConstruction(),
    }
    state = greenlightManaged(state, 0)
    state = greenlightManaged(state, 1)

    expect(state.operations.workflows.map((workflow) => workflow.reservations[0]!.slot)).toEqual([0, 1])
    state = tick(state) // skip both
    state = tick(state) // both pre-production
    state = tick(state) // both rehearsal
    expect(
      state.operations.workflows.map((workflow) => workflow.reservations[0]!.facilityId),
    ).toEqual(['facility-soundstage-07', 'facility-soundstage-12'])
    assertStudioOperationsInvariants(state.operations, state.studio.activeProductions)
  })

  it('rejects capacity blocker combinations that the transition allocator cannot produce', () => {
    let state = generateWorld('ops-impossible-blockers')
    state = {
      ...state,
      operations: initialManagedStudioOperations(),
      construction: initialManagedStudioConstruction(),
    }
    state = greenlightManaged(state)
    const developmentBlocker = {
      ...state.operations,
      workflows: state.operations.workflows.map((workflow) => ({
        ...workflow,
        blocker: {
          kind: 'facility-capacity' as const,
          capability: 'development-casting' as const,
          targetPhase: 'preProduction' as const,
        },
      })),
    }
    expect(() =>
      assertStudioOperationsInvariants(developmentBlocker, state.studio.activeProductions),
    ).toThrow(/cannot have a capacity blocker/)

    state = tickWithInvariant(state) // skip
    state = tickWithInvariant(state) // Pre-production
    state = tickWithInvariant(state) // Rehearsal; its soundstage is retained into Shooting
    const reallocatingRetainedStage = {
      ...state.operations,
      workflows: state.operations.workflows.map((workflow) => ({
        ...workflow,
        blocker: {
          kind: 'facility-capacity' as const,
          capability: 'soundstage' as const,
          targetPhase: 'shooting' as const,
        },
      })),
    }
    expect(() =>
      assertStudioOperationsInvariants(reallocatingRetainedStage, state.studio.activeProductions),
    ).toThrow(/must be set-scenery for shooting/)
  })

  it('maps the exact eight-week phases and completes a scheduled take on tick', () => {
    let state = generateWorld('ops-eight-weeks')
    state = {
      ...state,
      operations: initialManagedStudioOperations(),
      construction: initialManagedStudioConstruction(),
    }
    state = greenlightManaged(state)
    const productionId = state.studio.activeProductions[0]!.id
    const directorId = state.studio.activeProductions[0]!.directorId

    expect(state.operations.workflows[0]!.phase).toBe('development')
    state = tick(state)
    expect(state.studio.activeProductions[0]!.remainingTicks).toBe(8)
    state = tick(state)
    expect(state.operations.workflows[0]!.phase).toBe('preProduction')
    state = tick(state)
    expect(state.operations.workflows[0]!.phase).toBe('rehearsal')
    const stage = state.operations.workflows[0]!.reservations[0]!.facilityId
    state = tick(state)
    expect(state.operations.workflows[0]!.phase).toBe('shooting')
    expect(state.operations.workflows[0]!.reservations[0]!.facilityId).toBe(stage)
    expect(state.operations.workflows[0]!.shootingTask?.status).toBe('unassigned')

    state = applyActions(state, [{ kind: 'assignShootingDirector', productionId, directorId }])
    expect(state.operations.workflows[0]!.blocker?.kind).toBe('scenery-load-in')
    state = applyActions(state, [{ kind: 'clearSceneryLoadIn', productionId }])
    expect(state.operations.workflows[0]!.shootingTask?.status).toBe('ready')
    state = applyActions(state, [{ kind: 'scheduleShootingTake', productionId }])
    state = tick(state)
    expect(state.studio.activeProductions[0]!.remainingTicks).toBe(4)
    expect(state.operations.workflows[0]!.shootingTask?.status).toBe('completed')

    state = tick(state)
    expect(state.operations.workflows[0]!.phase).toBe('postProduction')
    expect(state.operations.workflows[0]!.shootingTask).toBeNull()
    expect(state.operations.workflows[0]!.reservations[0]!.capability).toBe('post')
    state = tick(state)
    expect(state.studio.activeProductions[0]!.remainingTicks).toBe(2)
    state = tick(state)
    expect(state.operations.workflows[0]!.phase).toBe('releaseReady')
    expect(state.operations.workflows[0]!.reservations).toEqual([])
    state = tick(state)
    expect(state.studio.activeProductions).toEqual([])
    expect(state.operations.workflows).toEqual([])
    expect(state.studio.releasedFilms[0]!.releaseTick).toBe(8)
  })

  it('holds atomically, then retries after cancellation frees valid positive capacity', () => {
    let state = generateWorld('ops-capacity')
    state = {
      ...state,
      operations: initialManagedStudioOperations(),
      construction: initialManagedStudioConstruction(),
    }
    state = greenlightManaged(state, 0)
    state = greenlightManaged(state, 1)
    // A structurally valid future configuration: every facility has positive
    // capacity and every required capability exists, with one soundstage slot.
    state = withOneSoundstage(state)
    assertConfiguredOperations(state)
    state = tickWithInvariant(state, 'configured') // skip
    state = tickWithInvariant(state, 'configured') // both enter Pre-production
    const beforeTransitionWeek = state.market.tick
    state = tickWithInvariant(state, 'configured') // only ascending first id enters Rehearsal

    expect(state.market.tick).toBe(beforeTransitionWeek + 1)
    expect(state.studio.activeProductions.map((production) => production.remainingTicks)).toEqual([6, 7])
    expect(state.operations.workflows[0]!.phase).toBe('rehearsal')
    expect(state.operations.workflows[1]!.phase).toBe('preProduction')
    expect(state.operations.workflows[1]!.blocker).toEqual({
      kind: 'facility-capacity',
      capability: 'soundstage',
      targetPhase: 'rehearsal',
    })
    expect(state.operations.workflows[1]!.reservations).toEqual([
      {
        productionId: state.studio.activeProductions[1]!.id,
        facilityId: 'facility-development-casting',
        capability: 'development-casting',
        slot: 1,
        phase: 'preProduction',
      },
    ])

    const holderId = state.operations.workflows.find((workflow) => workflow.phase === 'rehearsal')!
      .productionId
    const waiterId = state.operations.workflows.find((workflow) => workflow.phase === 'preProduction')!
      .productionId
    state = applyActions(state, [{ kind: 'cancel', productionId: holderId }])
    assertConfiguredOperations(state)
    expect(state.operations.workflows[0]!.productionId).toBe(waiterId)
    expect(state.operations.workflows[0]!.blocker?.kind).toBe('facility-capacity')

    state = tickWithInvariant(state, 'configured')
    expect(state.studio.activeProductions[0]!.remainingTicks).toBe(6)
    expect(state.operations.workflows[0]!.phase).toBe('rehearsal')
    expect(state.operations.workflows[0]!.blocker).toBeNull()
    expect(state.operations.workflows[0]!.reservations[0]!.facilityId).toBe(
      'facility-soundstage-07',
    )
  })

  it('releases capacity in-order and defers a lower-id waiter exactly one retry week', () => {
    function releaseBoundary(holderFirst: boolean): GameState {
      let state = generateWorld(`ops-release-order-${String(holderFirst)}`)
      state = {
        ...state,
        operations: initialManagedStudioOperations(),
        construction: initialManagedStudioConstruction(),
      }
      state = greenlightManaged(state, 0)
      state = greenlightManaged(state, 1)
      state = withOneSoundstage(state)
      state = tickWithInvariant(state, 'configured')
      state = tickWithInvariant(state, 'configured')
      state = tickWithInvariant(state, 'configured')

      const orderedProductions = [...state.studio.activeProductions].sort((a, b) =>
        a.id < b.id ? -1 : a.id > b.id ? 1 : 0,
      )
      const holderProduction = holderFirst ? orderedProductions[0]! : orderedProductions[1]!
      const waiterProduction = holderFirst ? orderedProductions[1]! : orderedProductions[0]!
      const holderId = holderProduction.id
      const waiterId = waiterProduction.id
      const renamedProductions = state.studio.activeProductions.map((production) =>
        production.id === holderId
          ? { ...production, remainingTicks: 4 }
          : { ...production, remainingTicks: 7 },
      )
      const shootingReservations = [
        {
          productionId: holderId,
          facilityId: 'facility-soundstage-07',
          capability: 'soundstage' as const,
          slot: 0,
          phase: 'shooting' as const,
        },
        {
          productionId: holderId,
          facilityId: 'facility-scenery-shop',
          capability: 'set-scenery' as const,
          slot: 0,
          phase: 'shooting' as const,
        },
      ]
      const renamedWorkflows = renamedProductions.map((production) =>
        production.id === holderId
          ? {
              productionId: holderId,
              phase: 'shooting' as const,
              reservations: shootingReservations,
              shootingTask: {
                id: `shooting:${holderId}`,
                productionId: holderId,
                directorId: holderProduction.directorId,
                soundstageFacilityId: 'facility-soundstage-07',
                status: 'completed' as const,
              },
              blocker: null,
            }
          : {
              productionId: waiterId,
              phase: 'preProduction' as const,
              reservations: [{
                productionId: waiterId,
                facilityId: 'facility-development-casting',
                capability: 'development-casting' as const,
                slot: 0,
                phase: 'preProduction' as const,
              }],
              shootingTask: null,
              blocker: {
                kind: 'facility-capacity' as const,
                capability: 'soundstage' as const,
                targetPhase: 'rehearsal' as const,
              },
            },
      )
      state = {
        ...state,
        studio: { ...state.studio, activeProductions: renamedProductions },
        operations: { ...state.operations, workflows: renamedWorkflows },
      }
      assertConfiguredOperations(state)
      return state
    }

    let holderFirst = releaseBoundary(true)
    const forwardWaiterId = [...holderFirst.studio.activeProductions.map((production) => production.id)].sort()[1]!
    holderFirst = tickWithInvariant(holderFirst, 'configured')
    expect(
      holderFirst.operations.workflows.find((workflow) => workflow.productionId === forwardWaiterId)!
        .phase,
    ).toBe('rehearsal')

    let waiterFirst = releaseBoundary(false)
    const reverseWaiterId = [...waiterFirst.studio.activeProductions.map((production) => production.id)].sort()[0]!
    waiterFirst = tickWithInvariant(waiterFirst, 'configured')
    const held = waiterFirst.operations.workflows.find(
      (workflow) => workflow.productionId === reverseWaiterId,
    )!
    expect(held.phase).toBe('preProduction')
    expect(held.blocker?.kind).toBe('facility-capacity')
    waiterFirst = tickWithInvariant(waiterFirst, 'configured')
    const retried = waiterFirst.operations.workflows.find(
      (workflow) => workflow.productionId === reverseWaiterId,
    )!
    expect(retried.phase).toBe('rehearsal')
    expect(retried.blocker).toBeNull()
  })

  it('runs two simultaneous managed pipelines through shooting and release with invariants each tick', () => {
    let state = generateWorld('ops-two-full-pipelines')
    state = {
      ...state,
      operations: initialManagedStudioOperations(),
      construction: initialManagedStudioConstruction(),
    }
    state = greenlightManaged(state, 0)
    state = greenlightManaged(state, 1)
    assertStudioOperationsInvariants(state.operations, state.studio.activeProductions)

    state = tickWithInvariant(state) // skip
    state = tickWithInvariant(state) // Pre-production
    state = tickWithInvariant(state) // Rehearsal
    state = tickWithInvariant(state) // Shooting
    const productions = [...state.studio.activeProductions]
    const shootingActions = productions.flatMap((production) => [
      {
        kind: 'assignShootingDirector' as const,
        productionId: production.id,
        directorId: production.directorId,
      },
      { kind: 'clearSceneryLoadIn' as const, productionId: production.id },
      { kind: 'scheduleShootingTake' as const, productionId: production.id },
    ])
    state = applyActions(state, shootingActions)
    assertStudioOperationsInvariants(state.operations, state.studio.activeProductions)

    state = tickWithInvariant(state) // first Shooting week; both takes complete
    expect(state.operations.workflows.map((workflow) => workflow.shootingTask?.status)).toEqual([
      'completed',
      'completed',
    ])
    state = tickWithInvariant(state) // Post-production, week 1
    state = tickWithInvariant(state) // Post-production, week 2
    state = tickWithInvariant(state) // Release Ready
    state = tickWithInvariant(state) // release
    expect(state.studio.activeProductions).toEqual([])
    expect(state.operations.workflows).toEqual([])
    expect(state.studio.releasedFilms).toHaveLength(2)
    expect(state.studio.releasedFilms.map((film) => film.releaseTick)).toEqual([8, 8])
  })

  it('holds only the blocked production while world time and weekly costs continue', () => {
    let state = foundedStudio('ops-hold')
    state = applyActions(state, [{ kind: 'activateStudioOperations' }])
    state = greenlightManaged(state)
    state = toShooting(state)
    const before = state
    const held = tick(state)
    expect(held.market.tick).toBe(before.market.tick + 1)
    expect(held.studio.activeProductions[0]!.remainingTicks).toBe(5)
    expect(held.studio.cash).toBeLessThan(before.studio.cash)
    expect(held.operations.workflows[0]!.shootingTask?.status).toBe('unassigned')
  })

  it('rejects illegal shooting commands loudly and byte-preserves their input', () => {
    let state = generateWorld('ops-actions')
    state = {
      ...state,
      operations: initialManagedStudioOperations(),
      construction: initialManagedStudioConstruction(),
    }
    state = toShooting(greenlightManaged(state))
    const production = state.studio.activeProductions[0]!
    const before = stableStringify(state)

    expect(() =>
      applyActions(state, [
        {
          kind: 'assignShootingDirector',
          productionId: production.id,
          directorId: 'not-the-director',
        },
      ]),
    ).toThrow(/not .*locked director/)
    expect(() =>
      applyActions(state, [{ kind: 'clearSceneryLoadIn', productionId: production.id }]),
    ).toThrow(/no active scenery-load-in blocker/)
    expect(() =>
      applyActions(state, [{ kind: 'scheduleShootingTake', productionId: production.id }]),
    ).toThrow(/not ready/)
    expect(stableStringify(state)).toBe(before)
  })

  it('cancel removes the workflow and every reservation without a refund', () => {
    let state = generateWorld('ops-cancel')
    state = {
      ...state,
      operations: initialManagedStudioOperations(),
      construction: initialManagedStudioConstruction(),
    }
    state = greenlightManaged(state)
    const productionId = state.studio.activeProductions[0]!.id
    const cash = state.studio.cash
    state = applyActions(state, [{ kind: 'cancel', productionId }])
    expect(state.studio.cash).toBe(cash)
    expect(state.studio.activeProductions).toEqual([])
    expect(state.operations.workflows).toEqual([])
  })
})
