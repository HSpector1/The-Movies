import { describe, expect, it } from 'vitest'
import {
  applyActions,
  beginFounding,
  busyTalentIds,
  castingOccupiedFacilitySlots,
  castingSessionsReadModel,
  FOUNDING_MINIMUMS,
  generateWorld,
  nextStudioDecision,
  availableDevelopmentCastingSlots,
  scriptCapacityView,
  stableStringify,
  tick,
} from '../src/core/index.js'
import type {
  CastSlot,
  CommissionScriptPayload,
  CreativeRole,
  GameState,
  GreenlightScriptProjectPayload,
  SegmentId,
  StartCastingSessionPayload,
  Talent,
} from '../src/core/index.js'
import { contendedStudio, freeSlate } from './_m4Fixtures.js'

function applicants(state: GameState): Talent[] {
  return state.founding!.applicantIds.map(
    (id) => state.talent.find((talent) => talent.id === id)!,
  )
}

function byRole(talent: readonly Talent[], role: CreativeRole): Talent[] {
  return talent.filter((person) => person.role === role)
}

function foundedStudio(
  seed: string,
  writerCount = FOUNDING_MINIMUMS.writer,
): GameState {
  let state = beginFounding(generateWorld(seed))
  const pool = applicants(state)
  const hires = [
    ...byRole(pool, 'actor').slice(0, FOUNDING_MINIMUMS.actor),
    ...byRole(pool, 'director').slice(0, FOUNDING_MINIMUMS.director),
    ...byRole(pool, 'writer').slice(0, writerCount),
    ...byRole(pool, 'craft').slice(0, FOUNDING_MINIMUMS.craft),
  ]
  for (const hire of hires) {
    state = applyActions(state, [
      { kind: 'signContract', talentId: hire.id, termWeeks: 104 },
    ])
  }
  return applyActions(state, [{ kind: 'foundStudio' }])
}

function activateManaged(state: GameState): GameState {
  return applyActions(state, [
    { kind: 'activateStudioOperations' },
    { kind: 'activateScriptDevelopment' },
    { kind: 'activateCastingSessions' },
  ])
}

function contractedByRole(state: GameState, role: CreativeRole): Talent[] {
  const contracted = new Set(state.contracts.map((contract) => contract.talentId))
  return state.talent.filter(
    (person) => person.role === role && contracted.has(person.id),
  )
}

function commissionPayload(
  state: GameState,
  conceptIndex = 0,
  writerId = contractedByRole(state, 'writer')[0]!.id,
): CommissionScriptPayload {
  const concept = state.concepts[conceptIndex]!
  return {
    conceptId: concept.id,
    writerId,
    shape: {
      opening: 'slowSetup',
      midpoint: 'revelation',
      ending: 'bittersweet',
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

function readyScript(state: GameState, conceptIndex = 0): GameState {
  let next = applyActions(state, [
    { kind: 'commissionScript', project: commissionPayload(state, conceptIndex) },
  ])
  next = tick(next)
  const project = next.scriptDevelopment.projects.find(
    (candidate) => candidate.conceptId === next.concepts[conceptIndex]!.id,
  )!
  return applyActions(next, [{ kind: 'acceptScript', projectId: project.id }])
}

function auditionSlate(state: GameState, projectId = 'script-0000'): StartCastingSessionPayload {
  const actors = contractedByRole(state, 'actor')
  if (actors.length < 3) throw new Error('fixture requires three contracted primary Actors')
  return {
    projectId,
    slate: {
      lead: [actors[0]!.id, actors[1]!.id],
      antagonist: [actors[0]!.id, actors[2]!.id],
      support: [actors[1]!.id, actors[2]!.id],
    },
  }
}

function remainingPackage(
  state: GameState,
  projectId = 'script-0000',
): GreenlightScriptProjectPayload {
  const actors = contractedByRole(state, 'actor')
  const concept = state.concepts.find(
    (candidate) =>
      candidate.id ===
      state.scriptDevelopment.projects.find((project) => project.id === projectId)!.conceptId,
  )!
  return {
    projectId,
    directorId: contractedByRole(state, 'director')[0]!.id,
    craftIds: [contractedByRole(state, 'craft')[0]!.id],
    cast: {
      lead: actors[0]!.id,
      antagonist: actors[1]!.id,
      support: actors[2]!.id,
    } satisfies Record<CastSlot, string>,
    budget: { negative: concept.baseNegativeCost, marketing: 0 },
  }
}

describe('Casting Sessions V1 action, tick, and read-model integration', () => {
  it('activates only after managed operations/scripts and consumes no behavior state', () => {
    const founded = foundedStudio('casting-actions-activation')
    const before = stableStringify(founded)
    expect(() =>
      applyActions(founded, [{ kind: 'activateCastingSessions' }]),
    ).toThrow(/Operations and Script Development must be active first/)
    expect(stableStringify(founded)).toBe(before)

    const prerequisites = applyActions(founded, [
      { kind: 'activateStudioOperations' },
      { kind: 'activateScriptDevelopment' },
    ])
    const activated = applyActions(prerequisites, [{ kind: 'activateCastingSessions' }])
    expect(activated.castingSessions).toEqual({ mode: 'managed', sessions: [] })
    expect(activated.rngState).toBe(prerequisites.rngState)
    expect(activated.studio.cash).toBe(prerequisites.studio.cash)
    expect(activated.ledger).toEqual(prerequisites.ledger)
  })

  it('runs one optional week, persists only observations, stops for review, and never holds talent', () => {
    let state = readyScript(activateManaged(foundedStudio('casting-actions-lifecycle')))
    const project = state.scriptDevelopment.projects[0]!
    const slate = auditionSlate(state, project.id)
    const beforeStart = stableStringify(state)
    const cashBeforeStart = state.studio.cash
    const ledgerBeforeStart = state.ledger.length
    const rngBeforeStart = state.rngState

    state = applyActions(state, [{ kind: 'startCastingSession', session: slate }])
    const session = state.castingSessions.sessions[0]!
    expect(session).toMatchObject({
      id: 'casting-0000',
      projectId: project.id,
      status: 'auditioning',
      startedWeek: 1,
      dueWeek: 2,
      results: null,
    })
    expect(session.reservation).not.toBeNull()
    expect(state.studio.cash).toBe(cashBeforeStart)
    expect(state.ledger).toHaveLength(ledgerBeforeStart)
    expect(state.rngState).toBe(rngBeforeStart)
    expect(stableStringify(state)).not.toBe(beforeStart)
    for (const actorId of new Set(Object.values(slate.slate).flat())) {
      expect(busyTalentIds(state).has(actorId)).toBe(false)
    }

    state = tick(state)
    const reviewed = state.castingSessions.sessions[0]!
    expect(state.market.tick).toBe(2)
    expect(reviewed).toMatchObject({
      status: 'review',
      dueWeek: null,
      reservation: null,
    })
    expect(reviewed.results).not.toBeNull()
    expect(state.rngState).toBe(rngBeforeStart)
    expect(nextStudioDecision(state)).toMatchObject({
      kind: 'castingReview',
      sessionId: reviewed.id,
      projectId: project.id,
    })
    const serializedResults = JSON.stringify(reviewed.results)
    expect(serializedResults).not.toMatch(/actual|execution|skills|ceilings|rng|seed/i)

    const acknowledged = applyActions(state, [
      { kind: 'acknowledgeCastingSession', sessionId: reviewed.id },
    ])
    expect(acknowledged.castingSessions.sessions[0]).toMatchObject({
      status: 'complete',
      results: reviewed.results,
    })
    expect(acknowledged.rngState).toBe(state.rngState)
    expect(acknowledged.studio.cash).toBe(state.studio.cash)
    expect(acknowledged.ledger).toEqual(state.ledger)
    expect(nextStudioDecision(acknowledged)?.kind).not.toBe('castingReview')
  })

  it('blocks core greenlight through Review, then opens blank advisory package authority', () => {
    let state = readyScript(activateManaged(foundedStudio('casting-actions-package-gate')))
    const projectId = state.scriptDevelopment.projects[0]!.id
    const packagePayload = remainingPackage(state, projectId)
    state = applyActions(state, [
      { kind: 'startCastingSession', session: auditionSlate(state, projectId) },
    ])

    expect(() =>
      applyActions(state, [
        { kind: 'greenlightScriptProject', production: packagePayload },
      ]),
    ).toThrow(/casting session.*reviewed and acknowledged/i)

    state = tick(state)
    expect(() =>
      applyActions(state, [
        { kind: 'greenlightScriptProject', production: packagePayload },
      ]),
    ).toThrow(/casting session.*reviewed and acknowledged/i)

    const boardAtReview = castingSessionsReadModel(state)
    const review = boardAtReview.sections.needsReview[0]!
    expect(review.results).not.toBeNull()
    expect(review.legalActions).toContainEqual(
      expect.objectContaining({
        kind: 'acknowledgeCastingSession',
        opensPackage: true,
      }),
    )
    expect(JSON.stringify(packagePayload)).not.toContain('estimate')

    state = applyActions(state, [
      { kind: 'acknowledgeCastingSession', sessionId: review.sessionId! },
    ])
    const greenlit = applyActions(state, [
      { kind: 'greenlightScriptProject', production: packagePayload },
    ])
    expect(greenlit.studio.activeProductions[0]!.cast).toEqual(packagePayload.cast)
    expect(greenlit.castingSessions.sessions[0]).toMatchObject({
      status: 'complete',
      results: state.castingSessions.sessions[0]!.results,
    })
    expect(greenlit.scriptDevelopment.projects[0]!.status).toBe('inProduction')
  })

  it('hands capacity-only casting forward to a queueable Package and closes the exact queued project', () => {
    let state = readyScript(
      activateManaged(foundedStudio('casting-actions-capacity-handoff', 3)),
    )
    const projectId = state.scriptDevelopment.projects[0]!.id
    const targetWriterId = state.scriptDevelopment.projects[0]!.writerId
    const payload = remainingPackage(state, projectId)

    state = applyActions(state, [
      { kind: 'startCastingSession', session: auditionSlate(state, projectId) },
    ])
    const auditioning = castingSessionsReadModel(state).sections.auditioning[0]!
    expect(auditioning.projectId).toBe(projectId)
    expect(auditioning.legalActions).toEqual([])

    state = tick(state)
    const otherWriters = contractedByRole(state, 'writer').filter(
      (writer) => writer.id !== targetWriterId,
    )
    expect(otherWriters).toHaveLength(2)
    state = applyActions(state, [
      { kind: 'commissionScript', project: commissionPayload(state, 1, otherWriters[0]!.id) },
      { kind: 'commissionScript', project: commissionPayload(state, 2, otherWriters[1]!.id) },
    ])

    expect(scriptCapacityView(state)).toMatchObject({ occupied: 2, available: 0 })
    const review = castingSessionsReadModel(state).sections.needsReview[0]!
    expect(review).toMatchObject({
      projectId,
      packageAvailability: {
        knownGatesClear: false,
        canSubmitGreenlightIntent: true,
        willQueueGreenlightIntent: true,
        blockers: [expect.objectContaining({ kind: 'facility-capacity' })],
      },
      legalActions: [
        {
          kind: 'acknowledgeCastingSession',
          sessionId: review.sessionId,
          projectId,
          label: 'Take results to Package',
          opensPackage: true,
        },
      ],
    })

    state = applyActions(state, [
      { kind: 'acknowledgeCastingSession', sessionId: review.sessionId! },
    ])
    const complete = castingSessionsReadModel(state).sections.history.find(
      (card) => card.projectId === projectId,
    )!
    expect(complete.legalActions).toEqual([
      { kind: 'openPackage', projectId, label: 'Open package' },
    ])
    expect(complete.packageAvailability?.canSubmitGreenlightIntent).toBe(true)

    const queued = applyActions(state, [
      { kind: 'greenlightScriptProject', production: payload },
    ])
    expect(queued.productionQueue).toContainEqual(
      expect.objectContaining({
        kind: 'greenlightScriptProject',
        payload: expect.objectContaining({ projectId }),
      }),
    )
    expect(queued.scriptDevelopment.projects.find((project) => project.id === projectId)?.status)
      .toBe('ready')
    const waiting = castingSessionsReadModel(queued).sections.history.find(
      (card) => card.projectId === projectId,
    )!
    expect(waiting.packageAvailability).toMatchObject({
      canSubmitGreenlightIntent: false,
      willQueueGreenlightIntent: false,
      blockers: [expect.objectContaining({ kind: 'greenlight-queued' })],
    })
    expect(waiting.legalActions.map((action) => action.kind)).not.toContain('openPackage')
  })

  it('shares both slots with scripts in both directions and reports one combined occupancy', () => {
    let state = readyScript(activateManaged(foundedStudio('casting-actions-capacity')))
    const project = state.scriptDevelopment.projects[0]!
    state = applyActions(state, [
      { kind: 'startCastingSession', session: auditionSlate(state, project.id) },
      { kind: 'commissionScript', project: commissionPayload(state, 1) },
    ])

    const capacity = scriptCapacityView(state)
    expect(capacity).toMatchObject({ capacity: 2, occupied: 2, available: 0 })
    expect(
      availableDevelopmentCastingSlots(
        state.operations,
        state.scriptDevelopment,
        castingOccupiedFacilitySlots(state.castingSessions),
      ),
    ).toBe(0)
    expect(capacity.facilities[0]!.slots.map((slot) => slot.occupant?.owner)).toEqual([
      'casting',
      'script',
    ])
    // ── C2a-M4 RE-BASE (charter §3.3; owner law 2, ruling `00E`.16) ─────────
    //
    // The predecessor pinned the REFUSAL: a commission with both shared slots
    // occupied threw. Phase-Gate Admission replaces the refusal with a wait, so
    // this assertion is re-based onto its successor — and the successor proves
    // strictly more than the refusal did: the intent is ADMITTED, it carries its
    // whole payload, it HOLDS NOTHING while it waits (no project, no reservation,
    // no slot, no charge), and it is granted the week a slot actually frees.
    const thirdCommission = commissionPayload(
      state,
      2,
      contractedByRole(state, 'director')[0]!.id,
    )
    const queued = applyActions(state, [
      { kind: 'commissionScript', project: thirdCommission },
    ])
    expect(queued.productionQueue).toEqual([
      {
        kind: 'commissionScript',
        ordinal: 0,
        queuedWeek: state.market.tick,
        payload: thirdCommission,
      },
    ])
    // NOTHING IS HELD WHILE QUEUED.
    expect(queued.scriptDevelopment.projects).toHaveLength(
      state.scriptDevelopment.projects.length,
    )
    expect(scriptCapacityView(queued)).toMatchObject({ capacity: 2, occupied: 2, available: 0 })
    // ...and the week the slots free, the queue is what takes one.
    const admittedFromQueue = tick(queued)
    expect(admittedFromQueue.productionQueue).toEqual([])
    expect(
      admittedFromQueue.scriptDevelopment.projects.find(
        (candidate) => candidate.conceptId === thirdCommission.conceptId,
      )?.status,
    ).toBe('drafting')

    const untouched = stableStringify(state)
    expect(() =>
      applyActions(state, [
        {
          kind: 'startCastingSession',
          session: { ...auditionSlate(state, project.id), projectId: project.id },
        },
      ]),
    ).toThrow(/already owns a casting session/)
    expect(stableStringify(state)).toBe(untouched)

    const afterTick = tick(state)
    expect(scriptCapacityView(afterTick)).toMatchObject({ occupied: 0, available: 2 })
    expect(afterTick.castingSessions.sessions[0]!.status).toBe('review')
    expect(afterTick.scriptDevelopment.projects[1]!.status).toBe('review')
    expect(nextStudioDecision(afterTick)).toMatchObject({
      kind: 'scriptReview',
      projectId: 'script-0001',
    })
    const afterScriptReview = applyActions(afterTick, [
      { kind: 'acceptScript', projectId: 'script-0001' },
    ])
    expect(nextStudioDecision(afterScriptReview)).toMatchObject({
      kind: 'castingReview',
      sessionId: 'casting-0000',
    })
  })

  it('rejects a second exact-project audition intent while the first waits in the queue', () => {
    const fixture = contendedStudio('casting-actions-queued-duplicate')
    const projectId = fixture.readyProjectIds[0]!
    const slate = freeSlate(fixture.state, projectId)
    const queued = applyActions(fixture.state, [
      { kind: 'startCastingSession', session: slate },
    ])

    expect(queued.productionQueue).toMatchObject([
      { kind: 'startCastingSession', payload: { projectId } },
    ])
    const queuedCard = castingSessionsReadModel(queued).sections.readyToPlan.find(
      (project) => project.projectId === projectId,
    )!
    expect(queuedCard.legalActions.map((action) => action.kind)).not.toContain('planAuditions')
    expect(queuedCard.blockers).toContainEqual(
      expect.stringMatching(/already waiting in the Development & Casting queue/i),
    )

    const beforeDuplicate = stableStringify(queued)
    expect(() =>
      applyActions(queued, [{ kind: 'startCastingSession', session: slate }]),
    ).toThrow(/already has auditions waiting in the production queue/i)
    expect(stableStringify(queued)).toBe(beforeDuplicate)
    expect(queued.productionQueue).toHaveLength(1)
  })

  it('orders casting review cards and the player decision by session ID, not project ID', () => {
    let state = readyScript(activateManaged(foundedStudio('casting-actions-review-order')), 0)
    state = readyScript(state, 1)
    state = applyActions(state, [
      { kind: 'startCastingSession', session: auditionSlate(state, 'script-0001') },
      { kind: 'startCastingSession', session: auditionSlate(state, 'script-0000') },
    ])
    state = tick(state)

    const board = castingSessionsReadModel(state)
    expect(board.sections.needsReview.map((project) => [project.sessionId, project.projectId])).toEqual([
      ['casting-0000', 'script-0001'],
      ['casting-0001', 'script-0000'],
    ])
    expect(board.nextDecision).toMatchObject({
      kind: 'castingReview',
      sessionId: 'casting-0000',
      projectId: 'script-0001',
    })
    expect(nextStudioDecision(state)).toEqual(board.nextDecision)
  })

  it('keeps direct package available before opting into auditions and preserves evidence when availability changes', () => {
    let state = readyScript(activateManaged(foundedStudio('casting-actions-optional')))
    const initial = castingSessionsReadModel(state).sections.readyToPlan[0]!
    expect(initial.legalActions.map((action) => action.kind)).toEqual([
      'planAuditions',
      'openPackage',
    ])

    state = applyActions(state, [
      { kind: 'startCastingSession', session: auditionSlate(state, initial.projectId) },
    ])
    state = tick(state)
    state = applyActions(state, [
      {
        kind: 'acknowledgeCastingSession',
        sessionId: state.castingSessions.sessions[0]!.id,
      },
    ])
    const auditionedId = state.castingSessions.sessions[0]!.slate.lead[0]
    state = applyActions(state, [
      {
        kind: 'greenlightScriptProject',
        production: remainingPackage(state, initial.projectId),
      },
    ])
    const history = castingSessionsReadModel(state).sections.history[0]!
    const persisted = history.results!.lead.find((result) => result.talentId === auditionedId)!
    expect(persisted.available).toBe(false)
    expect(persisted.availabilityLabel).toMatch(/currently assigned/i)
    expect(persisted.label).toBe('Est.')
    expect(Number.isInteger(persisted.estimate)).toBe(true)
  })
})
