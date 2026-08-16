import { describe, expect, it } from 'vitest'
import {
  ANNEX_CAPEX,
  ANNEX_DURATION_WEEKS,
  ANNEX_FACILITY_ID,
  ANNEX_PARCEL_ID,
  ANNEX_PROJECT_ID,
  FOUNDING_MINIMUMS,
  INITIAL_STUDIO_FACILITIES,
  TUNING,
  applyActions,
  assertStudioPlacementInvariants,
  beginFounding,
  generateWorld,
  makeSave,
  stableStringify,
  studioConstructionView,
  tick,
  validateSaveV12,
} from '../src/core/index.js'
import { DEVELOPMENT_CASTING_ANNEX_FACILITY } from '../src/core/operations.js'
import type {
  CastSlot,
  CommissionScriptPayload,
  CreativeRole,
  GameState,
  SegmentId,
  Talent,
} from '../src/core/index.js'

function applicants(state: GameState): Talent[] {
  return state.founding!.applicantIds.map(
    (id) => state.talent.find((talent) => talent.id === id)!,
  )
}

function byRole(talent: readonly Talent[], role: CreativeRole): Talent[] {
  return talent.filter((person) => person.role === role)
}

function foundedStudio(seed: string, writers = 1): GameState {
  let state = beginFounding(generateWorld(seed))
  const pool = applicants(state)
  const hires = [
    ...byRole(pool, 'actor').slice(0, FOUNDING_MINIMUMS.actor),
    ...byRole(pool, 'director').slice(0, FOUNDING_MINIMUMS.director),
    ...byRole(pool, 'writer').slice(0, writers),
    ...byRole(pool, 'craft').slice(0, FOUNDING_MINIMUMS.craft),
  ]
  for (const hire of hires) {
    state = applyActions(state, [
      { kind: 'signContract', talentId: hire.id, termWeeks: 104 },
    ])
  }
  return applyActions(state, [{ kind: 'foundStudio' }])
}

function managedStudio(seed: string, writers = 1): GameState {
  return applyActions(foundedStudio(seed, writers), [
    { kind: 'activateStudioOperations' },
    { kind: 'activateScriptDevelopment' },
    { kind: 'activateCastingSessions' },
  ])
}

function operationsOnlyStudio(seed: string): GameState {
  return applyActions(foundedStudio(seed), [{ kind: 'activateStudioOperations' }])
}

function twoTeamManagedStudio(seed: string): GameState {
  let state = beginFounding(generateWorld(seed))
  const pool = applicants(state)
  const hires = [
    ...byRole(pool, 'actor').slice(0, 6),
    ...byRole(pool, 'director').slice(0, 2),
    ...byRole(pool, 'writer').slice(0, 3),
    ...byRole(pool, 'craft').slice(0, 2),
  ]
  for (const hire of hires) {
    state = applyActions(state, [
      { kind: 'signContract', talentId: hire.id, termWeeks: 104 },
    ])
  }
  state = applyActions(state, [{ kind: 'foundStudio' }])
  return applyActions(state, [
    { kind: 'activateStudioOperations' },
    { kind: 'activateScriptDevelopment' },
    { kind: 'activateCastingSessions' },
  ])
}

function cashWithIdentity(state: GameState, cash: number): GameState {
  const delta = cash - state.studio.cash
  return {
    ...state,
    studio: { ...state.studio, cash },
    ledger:
      delta === 0
        ? state.ledger
        : [
            ...state.ledger,
            {
              week: state.market.tick,
              kind: delta > 0 ? ('studioRevenue' as const) : ('overhead' as const),
              amount: delta,
              note: 'test fixture cash identity adjustment',
            },
          ],
  }
}

function advance(state: GameState, count: number): GameState {
  let next = state
  for (let i = 0; i < count; i++) next = tick(next)
  return next
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
    shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' },
    promise: {
      genre: concept.genre,
      intendedSegments: ['adult'] as SegmentId[],
      ranges: {
        intimacy: [-0.5, 0.5],
        tonalWeight: [-0.5, 0.5],
        kineticEnergy: [-0.5, 0.5],
      },
    },
  }
}

function scriptGreenlightPayload(state: GameState, projectId: string, teamIndex: number) {
  const roster = state.contracts.map(
    (contract) => state.talent.find((talent) => talent.id === contract.talentId)!,
  )
  const actors = byRole(roster, 'actor')
  return {
    projectId,
    directorId: byRole(roster, 'director')[teamIndex]!.id,
    cast: {
      lead: actors[teamIndex * 3]!.id,
      antagonist: actors[teamIndex * 3 + 1]!.id,
      support: actors[teamIndex * 3 + 2]!.id,
    },
    craftIds: [byRole(roster, 'craft')[teamIndex]!.id],
    budget: {
      negative: state.concepts.find(
        (concept) => concept.id === state.scriptDevelopment.projects.find(
          (project) => project.id === projectId,
        )!.conceptId,
      )!.baseNegativeCost,
      marketing: 0,
    },
  }
}

function directProductionPayload(state: GameState) {
  const roster = state.contracts.map(
    (contract) => state.talent.find((talent) => talent.id === contract.talentId)!,
  )
  const actors = byRole(roster, 'actor')
  const concept = state.concepts[0]!
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
    writerId: byRole(roster, 'writer')[0]!.id,
    directorId: byRole(roster, 'director')[0]!.id,
    cast: {
      lead: actors[0]!.id,
      antagonist: actors[1]!.id,
      support: actors[2]!.id,
    } satisfies Record<CastSlot, string>,
    craftIds: [byRole(roster, 'craft')[0]!.id],
    budget: { negative: concept.baseNegativeCost, marketing: 0 },
  }
}

function renameActiveProduction(state: GameState, replacementId: string): GameState {
  const originalId = state.studio.activeProductions[0]!.id
  return {
    ...state,
    studio: {
      ...state.studio,
      activeProductions: state.studio.activeProductions.map((production) =>
        production.id === originalId ? { ...production, id: replacementId } : production,
      ),
    },
    operations: {
      ...state.operations,
      workflows: state.operations.workflows.map((workflow) =>
        workflow.productionId === originalId
          ? {
              ...workflow,
              productionId: replacementId,
              reservations: workflow.reservations.map((reservation) => ({
                ...reservation,
                productionId: replacementId,
              })),
              shootingTask:
                workflow.shootingTask === null
                  ? null
                  : { ...workflow.shootingTask, productionId: replacementId },
            }
          : workflow,
      ),
    },
    ledger: state.ledger.map((entry) =>
      entry.productionId === originalId ? { ...entry, productionId: replacementId } : entry,
    ),
    scriptDevelopment: {
      ...state.scriptDevelopment,
      projects: state.scriptDevelopment.projects.map((project) =>
        project.productionId === originalId
          ? { ...project, productionId: replacementId }
          : project,
      ),
    },
  }
}

describe('Development & Casting Annex V1 core lifecycle', () => {
  it('activates a vacant parcel with managed operations and keeps legacy worlds empty', () => {
    const legacy = generateWorld('annex-core-legacy')
    expect(legacy.construction).toEqual({ mode: 'legacy', parcels: [], projects: [] })

    const founded = foundedStudio('annex-core-activate')
    const activated = applyActions(founded, [{ kind: 'activateStudioOperations' }])
    expect(activated.construction).toEqual({
      mode: 'managed',
      parcels: [{ id: 'expansion', projectId: null }],
      projects: [],
    })
    expect(activated.operations.facilities).toEqual(
      INITIAL_STUDIO_FACILITIES.map((facility) => ({ ...facility })),
    )
    expect(activated.rngState).toBe(founded.rngState)
    expect(activated.studio.cash).toBe(founded.studio.cash)

    const forgedLegacy: GameState = {
      ...founded,
      studio: { ...founded.studio, cash: founded.studio.cash - ANNEX_CAPEX },
      ledger: [
        ...founded.ledger,
        {
          week: founded.market.tick,
          kind: 'constructionCapex',
          amount: -ANNEX_CAPEX,
          constructionProjectId: ANNEX_PROJECT_ID,
          note: 'Development & Casting Annex construction',
        },
      ],
    }
    const forgedBefore = stableStringify(forgedLegacy)
    expect(() =>
      applyActions(forgedLegacy, [{ kind: 'activateStudioOperations' }]),
    ).toThrow(/legacy mode cannot have construction capex/)
    expect(stableStringify(forgedLegacy)).toBe(forgedBefore)
  })

  it('enforces the exact affordability boundary and makes one atomic immutable commitment', () => {
    const base = managedStudio('annex-core-afford')
    const insufficient = cashWithIdentity(base, ANNEX_CAPEX - 1)
    const beforeReject = stableStringify(insufficient)
    expect(() =>
      applyActions(insufficient, [{ kind: 'startDevelopmentCastingAnnex' }]),
    ).toThrow(/Insufficient cash/)
    expect(stableStringify(insufficient)).toBe(beforeReject)

    const exact = cashWithIdentity(base, ANNEX_CAPEX)
    const before = stableStringify(exact)
    const rng = exact.rngState
    const started = applyActions(exact, [{ kind: 'startDevelopmentCastingAnnex' }])
    expect(stableStringify(exact)).toBe(before)
    expect(started.rngState).toBe(rng)
    expect(started.market.tick).toBe(exact.market.tick)
    expect(started.studio.cash).toBe(0)
    expect(started.operations).toBe(exact.operations)
    // Placement Core V12: the Annex is a placed facility on the legacy parcel.
    // Its price, duration, identities, and parcel are the V11 law unchanged.
    expect(started.construction.projects).toEqual([])
    expect(started.placement.facilities[0]).toEqual({
      id: 1,
      blueprintId: 'development-casting-annex',
      parcelId: ANNEX_PARCEL_ID,
      origin: { gx: 7, gy: 15 },
      cells: [
        { gx: 7, gy: 15 },
        { gx: 8, gy: 15 },
        { gx: 9, gy: 15 },
        { gx: 7, gy: 16 },
        { gx: 8, gy: 16 },
        { gx: 9, gy: 16 },
      ],
      facilityId: ANNEX_FACILITY_ID,
      projectId: ANNEX_PROJECT_ID,
      status: 'underConstruction',
      placedWeek: 0,
      completesWeek: ANNEX_DURATION_WEEKS,
    })
    expect(started.ledger.at(-1)).toMatchObject({
      week: 0,
      kind: 'constructionCapex',
      amount: -ANNEX_CAPEX,
      constructionProjectId: ANNEX_PROJECT_ID,
    })
    expect(() =>
      applyActions(started, [{ kind: 'startDevelopmentCastingAnnex' }]),
    ).toThrow(/occupied|clearanceRing/)
    assertStudioPlacementInvariants(started)
  })

  it.each([ANNEX_PARCEL_ID, ANNEX_PROJECT_ID, ANNEX_FACILITY_ID])(
    'reserves canonical Annex identity %s against every persisted production owner',
    (reservedId) => {
      const vacant = operationsOnlyStudio(`annex-core-id-${reservedId}`)
      const active = applyActions(vacant, [
        { kind: 'greenlight', production: directProductionPayload(vacant) },
      ])
      const forged = renameActiveProduction(active, reservedId)
      const before = stableStringify(forged)

      // A migrated vacant V11 state remains representable, but the start gate
      // must refuse to reserve an identity already owned by film history.
      expect(() => assertStudioPlacementInvariants(forged)).not.toThrow()
      expect(studioConstructionView(forged).canStart).toBe(false)
      expect(() =>
        applyActions(forged, [{ kind: 'startDevelopmentCastingAnnex' }]),
      ).toThrow(/canonical Annex id .*persisted production history/)
      expect(stableStringify(forged)).toBe(before)
    },
  )

  it('keeps a cancelled film identity reserved when only its durable ledger row remains', () => {
    let state = operationsOnlyStudio('annex-core-id-cancelled')
    state = applyActions(state, [
      { kind: 'greenlight', production: directProductionPayload(state) },
    ])
    const productionId = state.studio.activeProductions[0]!.id
    state = applyActions(state, [{ kind: 'cancel', productionId }])
    const forged: GameState = {
      ...state,
      ledger: state.ledger.map((entry) =>
        entry.productionId === productionId
          ? { ...entry, productionId: ANNEX_PROJECT_ID }
          : entry,
      ),
    }
    const before = stableStringify(forged)
    expect(forged.studio.activeProductions).toEqual([])
    expect(() => assertStudioPlacementInvariants(forged)).not.toThrow()
    expect(() =>
      applyActions(forged, [{ kind: 'startDevelopmentCastingAnnex' }]),
    ).toThrow(/canonical Annex id .*persisted production history/)
    expect(stableStringify(forged)).toBe(before)
  })

  it('completes on exactly the thirteenth advance from a nonzero start with no recurring charge or RNG draw', () => {
    let state = advance(managedStudio('annex-core-clock'), 4)
    const startedWeek = state.market.tick
    const rng = state.rngState
    state = applyActions(state, [{ kind: 'startDevelopmentCastingAnnex' }])
    const ledgerAfterStart = state.ledger.length
    const capitalRowsAfterStart = state.ledger.filter(
      (entry) => entry.kind === 'constructionCapex',
    ).length

    state = advance(state, 12)
    expect(state.market.tick).toBe(startedWeek + 12)
    expect(state.placement.facilities[0]!.status).toBe('underConstruction')
    expect(state.operations.facilities.some((facility) => facility.id === ANNEX_FACILITY_ID)).toBe(false)
    expect(studioConstructionView(state)).toMatchObject({
      status: 'building',
      completedAdvances: 12,
      remainingAdvances: 1,
    })

    const ledgerBeforeCompletion = state.ledger.length
    state = tick(state)
    expect(state.market.tick).toBe(startedWeek + 13)
    expect(state.placement.facilities[0]).toMatchObject({
      status: 'operational',
      completesWeek: startedWeek + 13,
    })
    expect(state.operations.facilities.at(-1)).toEqual(DEVELOPMENT_CASTING_ANNEX_FACILITY)
    expect(state.ledger).toHaveLength(ledgerBeforeCompletion + 2) // payroll + unchanged base overhead only
    expect(state.ledger.filter((entry) => entry.kind === 'constructionCapex')).toHaveLength(
      capitalRowsAfterStart,
    )
    expect(ledgerAfterStart).toBeGreaterThan(0)
    expect(state.rngState).toBe(rng)
    assertStudioPlacementInvariants(state)
  })

  it('does not reallocate completing-advance productions into the Annex, then exposes it immediately', () => {
    let state = twoTeamManagedStudio('annex-core-order')
    state = applyActions(state, [{ kind: 'startDevelopmentCastingAnnex' }])
    state = advance(state, 10)

    const writers = byRole(
      state.contracts.map((contract) => state.talent.find((talent) => talent.id === contract.talentId)!),
      'writer',
    )
    state = applyActions(state, [
      { kind: 'commissionScript', project: scriptPayload(state, 0, writers[0]!.id) },
      { kind: 'commissionScript', project: scriptPayload(state, 1, writers[1]!.id) },
    ])
    state = tick(state) // Week 10 -> 11: both screenplays enter Review and release their slots.
    const projectIds = state.scriptDevelopment.projects.map((project) => project.id)
    state = applyActions(state, [
      { kind: 'acceptScript', projectId: projectIds[0]! },
      { kind: 'acceptScript', projectId: projectIds[1]! },
    ])
    state = applyActions(state, [
      {
        kind: 'greenlightScriptProject',
        production: scriptGreenlightPayload(state, projectIds[0]!, 0),
      },
    ])
    state = applyActions(state, [
      {
        kind: 'greenlightScriptProject',
        production: scriptGreenlightPayload(state, projectIds[1]!, 1),
      },
    ])
    const baseReservations = state.operations.workflows.map((workflow) =>
      workflow.reservations.map((reservation) => ({ ...reservation })),
    )
    expect(baseReservations.map((reservations) => reservations[0]?.facilityId)).toEqual([
      'facility-development-casting', 'facility-development-casting',
    ])

    state = tick(state) // Week 11 -> 12: greenlight skip; both base slots remain held.
    expect(state.operations.workflows.map((workflow) => workflow.reservations)).toEqual(
      baseReservations,
    )

    // Week 12 -> 13 transitions both productions into Pre-production using only
    // the facility set present at the start of the advance. Construction then
    // appends the Annex without retrying or migrating either reservation.
    state = tick(state)
    expect(state.market.tick).toBe(13)
    expect(state.operations.facilities.at(-1)!.id).toBe(ANNEX_FACILITY_ID)
    expect(state.studio.activeProductions.map((production) => production.remainingTicks)).toEqual([7, 7])
    expect(state.operations.workflows.map((workflow) => workflow.phase)).toEqual([
      'preProduction', 'preProduction',
    ])
    expect(state.operations.workflows.map((workflow) => workflow.reservations)).toEqual(
      baseReservations.map((reservations) =>
        reservations.map((reservation) => ({ ...reservation, phase: 'preProduction' as const })),
      ),
    )
    expect(
      state.operations.workflows.flatMap((workflow) => workflow.reservations)
        .some((reservation) => reservation.facilityId === ANNEX_FACILITY_ID),
    ).toBe(false)

    const forged: GameState = {
      ...state,
      operations: {
        ...state.operations,
        workflows: state.operations.workflows.map((workflow, index) =>
          index === 0
            ? {
                ...workflow,
                reservations: workflow.reservations.map((reservation) => ({
                  ...reservation,
                  facilityId: ANNEX_FACILITY_ID,
                })),
              }
            : workflow,
        ),
      },
    }
    expect(() => assertStudioPlacementInvariants(forged)).toThrow(
      /cannot reserve the Annex before Week 13/,
    )
    const forgedSave = JSON.parse(stableStringify(makeSave(state))) as ReturnType<typeof makeSave>
    forgedSave.state.operations.workflows[0]!.reservations[0]!.facilityId = ANNEX_FACILITY_ID
    expect(() => validateSaveV12(forgedSave)).toThrow(
      /cannot reserve the Annex before Week 13/,
    )
    const laundered = JSON.parse(stableStringify(forged)) as GameState
    laundered.studio.activeProductions[0]!.startTick = 13
    expect(() => assertStudioPlacementInvariants(laundered)).toThrow(
      /advanced farther than its startTick permits/,
    )
    expect(() => validateSaveV12(makeSave(laundered))).toThrow(
      /advanced farther than its startTick permits/,
    )

    const thirdWriter = writers[2]!
    state = applyActions(state, [
      { kind: 'commissionScript', project: scriptPayload(state, 2, thirdWriter.id) },
    ])
    expect(state.scriptDevelopment.projects.at(-1)!.reservation).toMatchObject({
      facilityId: ANNEX_FACILITY_ID,
      capability: 'development-casting',
      slot: 0,
    })
    assertStudioPlacementInvariants(state)
  })

  it('uses the authoritative greenlight debit to reject skip-first start-clock laundering', () => {
    let state = managedStudio('annex-core-skip-first-laundering')
    const writer = byRole(
      state.contracts.map((contract) => state.talent.find((talent) => talent.id === contract.talentId)!),
      'writer',
    )[0]!
    state = applyActions(state, [
      { kind: 'startDevelopmentCastingAnnex' },
      { kind: 'commissionScript', project: scriptPayload(state, 0, writer.id) },
    ])
    state = tick(state)
    const projectId = state.scriptDevelopment.projects[0]!.id
    state = applyActions(state, [{ kind: 'acceptScript', projectId }])
    state = advance(state, 11)
    expect(state.market.tick).toBe(12)

    state = applyActions(state, [
      {
        kind: 'greenlightScriptProject',
        production: scriptGreenlightPayload(state, projectId, 0),
      },
    ])
    const productionId = state.studio.activeProductions[0]!.id
    expect(state.studio.activeProductions[0]).toMatchObject({ startTick: 12, remainingTicks: 8 })
    expect(
      state.ledger.find(
        (entry) => entry.kind === 'production' && entry.productionId === productionId,
      ),
    ).toMatchObject({ week: 12 })

    state = tick(state)
    expect(state.market.tick).toBe(13)
    expect(state.placement.facilities[0]).toMatchObject({ status: 'operational', completesWeek: 13 })
    expect(state.studio.activeProductions[0]).toMatchObject({ startTick: 12, remainingTicks: 8 })

    const forged = JSON.parse(stableStringify(state)) as GameState
    forged.studio.activeProductions[0]!.startTick = 13
    forged.operations.workflows[0]!.reservations[0]!.facilityId = ANNEX_FACILITY_ID
    expect(() => assertStudioPlacementInvariants(forged)).toThrow(
      /placed-facility reservation disagrees with its authoritative greenlight week/,
    )

    const forgedSave = JSON.parse(stableStringify(makeSave(state))) as ReturnType<typeof makeSave>
    forgedSave.state.studio.activeProductions[0]!.startTick = 13
    forgedSave.state.operations.workflows[0]!.reservations[0]!.facilityId = ANNEX_FACILITY_ID
    expect(() => validateSaveV12(forgedSave)).toThrow(
      /placed-facility reservation disagrees with its authoritative greenlight week/,
    )
  })

  it('allows a production started after completion to claim the Annex under normal allocation', () => {
    let state = twoTeamManagedStudio('annex-core-post-completion-production')
    const writers = byRole(
      state.contracts.map((contract) => state.talent.find((talent) => talent.id === contract.talentId)!),
      'writer',
    )
    state = applyActions(state, [{ kind: 'startDevelopmentCastingAnnex' }])
    state = applyActions(state, [
      { kind: 'commissionScript', project: scriptPayload(state, 0, writers[0]!.id) },
    ])
    state = tick(state)
    state = applyActions(state, [
      { kind: 'acceptScript', projectId: state.scriptDevelopment.projects[0]!.id },
    ])
    state = advance(state, 12)
    expect(state.market.tick).toBe(13)
    expect(state.placement.facilities[0]!.status).toBe('operational')

    state = applyActions(state, [
      { kind: 'commissionScript', project: scriptPayload(state, 1, writers[1]!.id) },
      { kind: 'commissionScript', project: scriptPayload(state, 2, writers[2]!.id) },
    ])
    state = applyActions(state, [
      {
        kind: 'greenlightScriptProject',
        production: scriptGreenlightPayload(
          state,
          state.scriptDevelopment.projects[0]!.id,
          0,
        ),
      },
    ])
    expect(state.studio.activeProductions[0]!.startTick).toBe(13)
    expect(state.operations.workflows[0]!.reservations).toEqual([
      expect.objectContaining({
        facilityId: ANNEX_FACILITY_ID,
        capability: 'development-casting',
        slot: 0,
      }),
    ])
    const firstProductionId = state.studio.activeProductions[0]!.id
    state = applyActions(state, [{ kind: 'cancel', productionId: firstProductionId }])
    expect(state.studio.activeProductions).toEqual([])
    expect(state.operations.workflows).toEqual([])
    expect(state.operations.facilities.at(-1)!.id).toBe(ANNEX_FACILITY_ID)
    expect(state.placement.facilities[0]).toMatchObject({ status: 'operational', completesWeek: 13 })

    // Cancellation returns the screenplay to Ready and frees the sixth-facility
    // slot. With both base slots still occupied by the two live drafts, a new
    // production of that screenplay must reuse the Annex normally.
    state = applyActions(state, [
      {
        kind: 'greenlightScriptProject',
        production: scriptGreenlightPayload(
          state,
          state.scriptDevelopment.projects[0]!.id,
          0,
        ),
      },
    ])
    const releasedProductionId = state.studio.activeProductions[0]!.id
    expect(state.operations.workflows[0]!.reservations[0]!.facilityId).toBe(ANNEX_FACILITY_ID)

    // Drive the ordinary managed lifecycle. The two drafts release their base
    // slots on the first advance; the production later moves through the other
    // canonical facilities and releases without altering Annex/project truth.
    state = advance(state, 4)
    const shooting = state.studio.activeProductions[0]!
    expect(state.operations.workflows[0]!.phase).toBe('shooting')
    state = applyActions(state, [
      {
        kind: 'assignShootingDirector',
        productionId: shooting.id,
        directorId: shooting.directorId,
      },
      { kind: 'clearSceneryLoadIn', productionId: shooting.id },
      { kind: 'scheduleShootingTake', productionId: shooting.id },
    ])
    state = advance(state, 5)
    expect(state.studio.activeProductions).toEqual([])
    expect(state.operations.workflows).toEqual([])
    expect(
      state.studio.releasedFilms.some((film) => film.productionId === releasedProductionId),
    ).toBe(true)
    expect(state.operations.facilities.at(-1)!.id).toBe(ANNEX_FACILITY_ID)
    expect(state.placement.facilities[0]).toMatchObject({ status: 'operational', completesWeek: 13 })
    expect(() => validateSaveV12(makeSave(state))).not.toThrow()
  })

  it('accepts only the exact Annex V1 facility set and detects cross-owner collisions', () => {
    const completed = advance(
      applyActions(managedStudio('annex-core-policy'), [
        { kind: 'startDevelopmentCastingAnnex' },
      ]),
      ANNEX_DURATION_WEEKS,
    )
    expect(() => assertStudioPlacementInvariants(completed)).not.toThrow()

    const capacityMutation: GameState = {
      ...completed,
      operations: {
        ...completed.operations,
        facilities: completed.operations.facilities.map((facility) =>
          facility.id === ANNEX_FACILITY_ID ? { ...facility, capacity: 2 } : facility,
        ),
      },
    }
    expect(() => assertStudioPlacementInvariants(capacityMutation)).toThrow(
      /managed V12 facility at index .* differs from/,
    )

    // Exercise the existing three-owner collision authority on the configured
    // sixth facility: one casting task takes base slot 0, one screenplay takes
    // base slot 1, and another takes the Annex. A forged casting reservation on
    // that Annex slot must fail loudly rather than overbook it.
    let collision = advance(
      applyActions(managedStudio('annex-core-collision', 3), [
        { kind: 'startDevelopmentCastingAnnex' },
      ]),
      ANNEX_DURATION_WEEKS,
    )
    const roster = collision.contracts.map(
      (contract) => collision.talent.find((talent) => talent.id === contract.talentId)!,
    )
    const writers = byRole(roster, 'writer')
    const actors = byRole(roster, 'actor')
    collision = applyActions(collision, [
      { kind: 'commissionScript', project: scriptPayload(collision, 0, writers[0]!.id) },
    ])
    collision = tick(collision)
    collision = applyActions(collision, [
      { kind: 'acceptScript', projectId: collision.scriptDevelopment.projects[0]!.id },
      {
        kind: 'startCastingSession',
        session: {
          projectId: collision.scriptDevelopment.projects[0]!.id,
          slate: {
            lead: [actors[0]!.id, actors[1]!.id],
            antagonist: [actors[0]!.id, actors[2]!.id],
            support: [actors[1]!.id, actors[2]!.id],
          },
        },
      },
      { kind: 'commissionScript', project: scriptPayload(collision, 1, writers[1]!.id) },
      { kind: 'commissionScript', project: scriptPayload(collision, 2, writers[2]!.id) },
    ])
    const annexReservation = collision.scriptDevelopment.projects.at(-1)!.reservation!
    const collided: GameState = {
      ...collision,
      castingSessions: {
        ...collision.castingSessions,
        sessions: collision.castingSessions.sessions.map((session) => ({
          ...session,
          reservation:
            session.reservation === null
              ? null
              : {
                  ...session.reservation,
                  facilityId: annexReservation.facilityId,
                  slot: annexReservation.slot,
                },
        })),
      },
    }
    expect(() => assertStudioPlacementInvariants(collided)).toThrow(/overbooked/)

    // No Annex operating charge exists: weekly overhead remains exactly the
    // governed base + per-employee formula before and after completion.
    const before = completed.ledger.length
    const next = tick(completed)
    const rows = next.ledger.slice(before)
    expect(rows.filter((entry) => entry.kind === 'overhead')).toEqual([
      expect.objectContaining({
        amount: -(TUNING.OVERHEAD_BASE + TUNING.OVERHEAD_PER_EMPLOYEE * completed.contracts.length),
      }),
    ])
    expect(rows.some((entry) => entry.kind === 'constructionCapex')).toBe(false)
  })

  it('rejects malformed project-free construction and cash before a tick can advance it', () => {
    const vacant = managedStudio('annex-core-tick-boundary')
    const cashMismatch: GameState = {
      ...vacant,
      studio: { ...vacant.studio, cash: vacant.studio.cash + 1 },
    }
    const cashBefore = stableStringify(cashMismatch)
    expect(() => tick(cashMismatch)).toThrow(/studio cash must equal initial cash plus the ordered ledger/)
    expect(stableStringify(cashMismatch)).toBe(cashBefore)

    const placementModeMismatch: GameState = {
      ...vacant,
      construction: { mode: 'legacy', parcels: [], projects: [] },
      placement: { mode: 'legacy', nextPlacementId: 1, facilities: [] },
    }
    const placementModeBefore = stableStringify(placementModeMismatch)
    expect(() => tick(placementModeMismatch)).toThrow(/placement mode must equal operations mode/)
    expect(stableStringify(placementModeMismatch)).toBe(placementModeBefore)

    const modeMismatch: GameState = {
      ...vacant,
      construction: { mode: 'legacy', parcels: [], projects: [] },
    }
    const modeBefore = stableStringify(modeMismatch)
    expect(() => tick(modeMismatch)).toThrow(/construction mode must equal operations mode/)
    expect(stableStringify(modeMismatch)).toBe(modeBefore)
  })
})
