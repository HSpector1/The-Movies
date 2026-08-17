import { describe, expect, it } from 'vitest'
import {
  applyActions,
  beginFounding,
  exportSave,
  FOUNDING_MINIMUMS,
  generateWorld,
  initialManagedStudioConstruction,
  initialManagedStudioOperations,
  makeSaveV7,
  migrateToV13,
  nextStudioDecision,
  openTheatricalRun,
  stableStringify,
  studioCalendar,
  tick,
  TUNING,
  initialManagedStudioPlacement,} from '../src/core/index.js'
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

function foundedStudio(
  seed: string,
  requested: Partial<Record<CreativeRole, number>> = {},
): GameState {
  let state = beginFounding(generateWorld(seed))
  const applicants = state.founding!.applicantIds.map(
    (id) => state.talent.find((person) => person.id === id)!,
  )
  const counts: Record<CreativeRole, number> = {
    actor: requested.actor ?? FOUNDING_MINIMUMS.actor,
    director: requested.director ?? FOUNDING_MINIMUMS.director,
    writer: requested.writer ?? FOUNDING_MINIMUMS.writer,
    craft: requested.craft ?? FOUNDING_MINIMUMS.craft,
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
  const ids = new Set(state.contracts.map((contract) => contract.talentId))
  return byRole(state.talent.filter((person) => ids.has(person.id)), role)
}

function managedStudio(seed: string): GameState {
  return applyActions(foundedStudio(seed, { writer: 2 }), [
    { kind: 'activateStudioOperations' },
    { kind: 'activateScriptDevelopment' },
    { kind: 'activateCastingSessions' },
  ])
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
  const actors = contractedByRole(state, 'actor')
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
    writerId: contractedByRole(state, 'writer')[offset]!.id,
    directorId: contractedByRole(state, 'director')[offset]!.id,
    craftIds: [contractedByRole(state, 'craft')[offset]!.id],
    cast: {
      lead: actors[offset * 3]!.id,
      antagonist: actors[offset * 3 + 1]!.id,
      support: actors[offset * 3 + 2]!.id,
    } satisfies Record<CastSlot, string>,
    budget: { negative: concept.baseNegativeCost, marketing: 0 },
  }
}

function auditionAndDraftState(seed: string): GameState {
  let state = managedStudio(seed)
  const writers = contractedByRole(state, 'writer')
  state = applyActions(state, [
    { kind: 'commissionScript', project: scriptPayload(state, 0, writers[0]!.id) },
  ])
  state = tick(state)
  state = applyActions(state, [{ kind: 'acceptScript', projectId: 'script-0000' }])
  const actors = contractedByRole(state, 'actor')
  state = applyActions(state, [
    {
      kind: 'startCastingSession',
      session: {
        projectId: 'script-0000',
        slate: {
          lead: [actors[0]!.id, actors[1]!.id],
          antagonist: [actors[0]!.id, actors[2]!.id],
          support: [actors[1]!.id, actors[2]!.id],
        },
      },
    },
    { kind: 'commissionScript', project: scriptPayload(state, 1, writers[1]!.id) },
  ])
  return state
}

function productionState(seed: string): GameState {
  let state = foundedStudio(seed, { actor: 3, director: 1, writer: 1, craft: 1 })
  state = applyActions(state, [{ kind: 'activateStudioOperations' }])
  return applyActions(state, [
    { kind: 'greenlight', production: rawProductionPayload(state, 0) },
  ])
}

describe('Studio Calendar V1 — authoritative read model', () => {
  it('is pure, canonical, and keeps legacy saves free of invented managed facilities', () => {
    const legacy = generateWorld('calendar-legacy')
    const before = stableStringify(legacy)
    expect(studioCalendar(legacy)).toMatchObject({
      mode: 'legacy',
      currentWeek: 0,
      nextDecision: null,
      facilities: [],
      productionOutlook: [],
      summary: { facilityCapacity: 0, occupiedSlots: 0, availableSlots: 0 },
    })
    expect(stableStringify(legacy)).toBe(before)

    let state = managedStudio('calendar-canonical')
    const writers = contractedByRole(state, 'writer')
    state = applyActions(state, [
      { kind: 'commissionScript', project: scriptPayload(state, 0, writers[0]!.id) },
    ])
    state = applyActions(state, [
      { kind: 'commissionScript', project: scriptPayload(state, 1, writers[1]!.id) },
    ])
    const expected = studioCalendar(state)
    const reordered: GameState = {
      ...state,
      contracts: [...state.contracts].reverse(),
      operations: {
        ...state.operations,
        facilities: [...state.operations.facilities].reverse(),
        workflows: [...state.operations.workflows].reverse(),
      },
      scriptDevelopment: {
        ...state.scriptDevelopment,
        projects: [...state.scriptDevelopment.projects].reverse(),
      },
    }
    const reorderedBefore = stableStringify(reordered)
    expect(studioCalendar(reordered)).toEqual(expected)
    expect(stableStringify(reordered)).toBe(reorderedBefore)
  })

  it('keeps a populated migrated studio explicitly legacy while preserving its real clocks', () => {
    let state = foundedStudio('calendar-populated-legacy', {
      actor: 6,
      director: 2,
      writer: 2,
      craft: 2,
    })
    state = applyActions(state, [
      { kind: 'greenlight', production: rawProductionPayload(state, 0) },
    ])
    for (let guard = 0; guard < 12 && state.theatricalRuns.length === 0; guard++) {
      state = tick(state)
    }
    expect(state.theatricalRuns[0]?.status).toBe('active')
    state = applyActions(state, [
      { kind: 'greenlight', production: rawProductionPayload(state, 1) },
    ])
    const migrated = migrateToV13(makeSaveV7(state))
    const before = exportSave(migrated)

    const calendar = studioCalendar(migrated.state)

    expect(calendar).toMatchObject({
      mode: 'legacy',
      facilities: [],
      summary: {
        activeProductions: 1,
        activeContracts: migrated.state.contracts.length,
      },
    })
    expect(calendar.productionOutlook[0]).toMatchObject({
      phase: 'legacy',
      status: 'legacy-countdown',
      facilities: [],
    })
    expect(
      calendar.commitments.filter((event) => event.kind === 'theatricalReceipt'),
    ).toHaveLength(state.theatricalRuns[0]!.totalWeeks - state.theatricalRuns[0]!.weekIndex)
    expect(exportSave(migrated)).toBe(before)
  })

  it('projects the exact shared three-owner capacity law and rejects a duplicate slot', () => {
    const shared = auditionAndDraftState('calendar-shared-capacity')
    const before = stableStringify(shared)
    const calendar = studioCalendar(shared)
    const development = calendar.facilities.find(
      (facility) => facility.capability === 'development-casting',
    )!
    expect(development).toMatchObject({ capacity: 2, occupied: 2, available: 0 })
    expect(development.slots.map((slot) => slot.occupant?.owner)).toEqual([
      'casting',
      'script',
    ])
    for (const slot of development.slots) {
      expect(slot).toMatchObject({
        facilityId: development.facilityId,
        facilityName: development.facilityName,
        capability: 'development-casting',
      })
    }
    expect(
      calendar.commitments.filter(
        (event) => event.kind === 'scriptDue' || event.kind === 'castingDue',
      ),
    ).toEqual([
      expect.objectContaining({ kind: 'scriptDue', certainty: 'committed', week: 2 }),
      expect.objectContaining({ kind: 'castingDue', certainty: 'committed', week: 2 }),
    ])
    expect(stableStringify(shared)).toBe(before)

    const duplicate = structuredClone(shared)
    const script = duplicate.scriptDevelopment.projects.find(
      (project) => project.status === 'drafting',
    )!
    const casting = duplicate.castingSessions.sessions[0]!
    casting.reservation = {
      ...casting.reservation!,
      facilityId: script.reservation!.facilityId,
      slot: script.reservation!.slot,
    }
    expect(() => studioCalendar(duplicate)).toThrow(/facility slot .*occupied twice/)

    const production = productionState('calendar-production-owner')
    const productionCalendar = studioCalendar(production)
    const productionSlot = productionCalendar.facilities
      .flatMap((facility) => facility.slots)
      .find((slot) => slot.occupant?.owner === 'production')
    expect(productionSlot?.occupant).toMatchObject({
      owner: 'production',
      ownerId: production.studio.activeProductions[0]!.id,
      activity: 'development',
    })

    let productionAndScript = managedStudio('calendar-production-script-collision')
    const productionWriters = contractedByRole(productionAndScript, 'writer')
    productionAndScript = applyActions(productionAndScript, [
      {
        kind: 'commissionScript',
        project: scriptPayload(productionAndScript, 0, productionWriters[0]!.id),
      },
    ])
    productionAndScript = tick(productionAndScript)
    productionAndScript = applyActions(productionAndScript, [
      { kind: 'acceptScript', projectId: 'script-0000' },
    ])
    const productionPackage = rawProductionPayload(productionAndScript, 0)
    productionAndScript = applyActions(productionAndScript, [
      {
        kind: 'greenlightScriptProject',
        production: {
          projectId: 'script-0000',
          directorId: productionPackage.directorId,
          craftIds: productionPackage.craftIds,
          cast: productionPackage.cast,
          budget: productionPackage.budget,
        },
      },
    ])
    productionAndScript = applyActions(productionAndScript, [
      {
        kind: 'commissionScript',
        project: scriptPayload(productionAndScript, 1, productionWriters[1]!.id),
      },
    ])
    expect(
      studioCalendar(productionAndScript)
        .facilities.find((facility) => facility.capability === 'development-casting')!
        .slots.map((slot) => slot.occupant?.owner),
    ).toEqual(['production', 'script'])

    const productionCollision = structuredClone(productionAndScript)
    const productionReservation = productionCollision.operations.workflows[0]!.reservations[0]!
    const scriptReservation = productionCollision.scriptDevelopment.projects.find(
      (project) => project.status === 'drafting',
    )!.reservation!
    scriptReservation.facilityId = productionReservation.facilityId
    scriptReservation.slot = productionReservation.slot
    expect(() => studioCalendar(productionCollision)).toThrow(/facility slot .*overbooked|occupied twice/)
  })

  it('aligns persisted screenplay and casting due events with their real completion tick', () => {
    const due = auditionAndDraftState('calendar-due-boundary')
    const before = stableStringify(due)
    const dueCalendar = studioCalendar(due)
    expect(due.market.tick).toBe(1)
    expect(
      dueCalendar.commitments.filter(
        (event) => event.kind === 'scriptDue' || event.kind === 'castingDue',
      ),
    ).toEqual([
      expect.objectContaining({ kind: 'scriptDue', ownerId: 'script-0001', week: 2 }),
      expect.objectContaining({ kind: 'castingDue', ownerId: 'casting-0000', week: 2 }),
    ])

    const completed = tick(due)
    expect(completed.market.tick).toBe(2)
    expect(
      completed.scriptDevelopment.projects.find((project) => project.id === 'script-0001'),
    ).toMatchObject({ status: 'review', dueWeek: null, reservation: null })
    expect(completed.castingSessions.sessions[0]).toMatchObject({
      id: 'casting-0000',
      status: 'review',
      dueWeek: null,
      reservation: null,
    })
    const afterCalendar = studioCalendar(completed)
    expect(
      afterCalendar.commitments.filter(
        (event) => event.ownerId === 'script-0001' || event.ownerId === 'casting-0000',
      ),
    ).toEqual([])
    expect(afterCalendar.nextDecision).toMatchObject({
      kind: 'scriptReview',
      projectId: 'script-0001',
    })
    expect(stableStringify(due)).toBe(before)
  })

  it('keeps production progress exact while moving only the conditional release boundary on a hold', () => {
    const greenlit = productionState('calendar-release-boundary')
    const productionId = greenlit.studio.activeProductions[0]!.id
    expect(studioCalendar(greenlit).productionOutlook[0]).toMatchObject({
      certainty: 'conditional',
      remainingTicks: 8,
      conditionalReleaseWeek: 9,
    })

    const weekOne = tick(greenlit)
    expect(studioCalendar(weekOne).productionOutlook[0]).toMatchObject({
      remainingTicks: 8,
      conditionalReleaseWeek: 9,
    })
    const weekThree = tick(tick(weekOne))
    expect(studioCalendar(weekThree).productionOutlook[0]).toMatchObject({
      phase: 'rehearsal',
      facilities: [
        expect.objectContaining({
          facilityId: 'facility-soundstage-07',
          capability: 'soundstage',
        }),
      ],
    })
    const weekFour = tick(weekThree)
    const atCommand = studioCalendar(weekFour)
    expect(atCommand.nextDecision).toEqual({
      kind: 'productionOperation',
      productionId,
    })
    expect(atCommand.productionOutlook[0]).toMatchObject({
      phase: 'shooting',
      remainingTicks: 5,
      conditionalReleaseWeek: 9,
      status: 'decision-required',
      blocker: {
        kind: 'director-dispatch',
        consequence: expect.stringMatching(/payroll and studio overhead continue/i),
      },
      facilities: [
        expect.objectContaining({
          facilityId: 'facility-scenery-shop',
          capability: 'set-scenery',
        }),
        expect.objectContaining({
          facilityId: 'facility-soundstage-07',
          capability: 'soundstage',
        }),
      ],
    })

    const heldOneWeek = tick(weekFour)
    expect(studioCalendar(heldOneWeek).productionOutlook[0]).toMatchObject({
      remainingTicks: 5,
      conditionalReleaseWeek: 10,
      status: 'decision-required',
    })

    let onSchedule = weekFour
    for (let index = 0; index < 3; index++) {
      const decision = nextStudioDecision(onSchedule)
      if (decision?.kind !== 'productionOperation') {
        throw new Error('expected the governed shooting command chain')
      }
      onSchedule = applyActions(onSchedule, [decision.command])
    }
    const secondShootingWeek = tick(onSchedule)
    expect(studioCalendar(secondShootingWeek).productionOutlook[0]).toMatchObject({
      phase: 'shooting',
      remainingTicks: 4,
      facilities: [
        expect.objectContaining({ facilityId: 'facility-scenery-shop' }),
        expect.objectContaining({ facilityId: 'facility-soundstage-07' }),
      ],
    })
    const firstPostWeek = tick(secondShootingWeek)
    expect(studioCalendar(firstPostWeek).productionOutlook[0]).toMatchObject({
      phase: 'postProduction',
      remainingTicks: 3,
      facilities: [
        expect.objectContaining({
          facilityId: 'facility-post-building',
          capability: 'post',
        }),
      ],
    })
    onSchedule = tick(tick(firstPostWeek))
    expect(studioCalendar(onSchedule).productionOutlook[0]).toMatchObject({
      phase: 'releaseReady',
      remainingTicks: 1,
      conditionalReleaseWeek: 9,
      status: 'on-schedule',
    })
    const released = tick(onSchedule)
    expect(released.market.tick).toBe(9)
    expect(studioCalendar(released).productionOutlook).toEqual([])
  })

  it('rejects a malformed shooting-task owner before it can advertise a decision', () => {
    let state = productionState('calendar-shooting-task-correlation')
    state = tick(tick(tick(tick(state))))
    expect(nextStudioDecision(state)).toMatchObject({ kind: 'productionOperation' })

    const malformed = structuredClone(state)
    const task = malformed.operations.workflows[0]!.shootingTask
    if (task === null) throw new Error('expected shooting task')
    task.productionId = 'prod-not-the-workflow-owner'

    expect(nextStudioDecision(malformed)).toBeNull()
    expect(() => studioCalendar(malformed)).toThrow(/shooting task owner disagrees with production/)
  })

  it('retains historical capacity-blocker tense after the contested slot becomes free', () => {
    let state = foundedStudio('calendar-capacity-history', {
      actor: 6,
      director: 2,
      writer: 2,
      craft: 2,
    })
    state = {
      ...state,
      construction: initialManagedStudioConstruction(),
      placement: initialManagedStudioPlacement(),
      operations: {
        ...initialManagedStudioOperations(),
        facilities: initialManagedStudioOperations().facilities.filter(
          (facility) => facility.id !== 'facility-soundstage-12',
        ),
      },
    }
    state = applyActions(state, [
      { kind: 'greenlight', production: rawProductionPayload(state, 0) },
    ])
    state = applyActions(state, [
      { kind: 'greenlight', production: rawProductionPayload(state, 1) },
    ])
    state = tick(tick(tick(state)))
    const held = studioCalendar(state).productionOutlook.find(
      (production) => production.status === 'held',
    )!
    expect(held.blocker).toMatchObject({
      kind: 'facility-capacity',
      detail: expect.stringMatching(/was available when .* attempted.*retry next week/i),
    })

    const holderId = state.studio.activeProductions.find(
      (production) => production.id !== held.productionId,
    )!.id
    state = applyActions(state, [{ kind: 'cancel', productionId: holderId }])
    const afterFree = studioCalendar(state)
    expect(
      afterFree.facilities.find((facility) => facility.capability === 'soundstage')!.available,
    ).toBe(1)
    expect(
      afterFree.productionOutlook.find((production) => production.productionId === held.productionId)!
        .blocker!.detail,
    ).toMatch(/was available when .* attempted.*retry next week/i)
  })

  it('locks receipt arrival/amounts and exposes the half-open Week-208 staffing boundary', () => {
    let state = foundedStudio('calendar-money-time')
    const film = {
      productionId: 'prod-calendar-run',
      conceptId: state.concepts[0]!.id,
      releaseTick: 16,
      boxOffice: { opening: 10_000_000, total: 25_000_000 },
    } as never
    const opened = openTheatricalRun(film, 10_000_000, 2.5, 16)
    const run = {
      ...opened,
      weekIndex: 2,
      cumulativeGrossPaid: opened.weeklyGross[0]! + opened.weeklyGross[1]!,
      cumulativeStudioRevenuePaid:
        (opened.weeklyGross[0]! + opened.weeklyGross[1]!) * opened.studioShare,
    }
    state = {
      ...state,
      market: { ...state.market, tick: 196 },
      theatricalRuns: [run],
      contracts: state.contracts.map((contract) => ({
        ...contract,
        startWeek: 0,
        endWeekExclusive: 208,
        termWeeks: 208,
      })),
    }
    const before = stableStringify(state)
    const calendar = studioCalendar(state)
    const receipts = calendar.commitments.filter(
      (event) => event.kind === 'theatricalReceipt',
    )
    expect(receipts).toHaveLength(run.totalWeeks - run.weekIndex)
    expect(receipts[0]).toMatchObject({
      certainty: 'committed',
      week: 197,
      paymentOrdinal: 3,
      totalPayments: run.totalWeeks,
      studioRevenue: run.weeklyGross[2]! * run.studioShare,
    })
    expect(receipts.at(-1)?.week).toBe(196 + (run.totalWeeks - run.weekIndex))

    let receiptReplay = state
    for (const expected of receipts) {
      if (expected.kind !== 'theatricalReceipt') throw new Error('expected theatrical receipt')
      const ledgerLength = receiptReplay.ledger.length
      receiptReplay = tick(receiptReplay)
      const actualRows = receiptReplay.ledger
        .slice(ledgerLength)
        .filter(
          (entry) =>
            entry.kind === 'studioRevenue' && entry.productionId === expected.productionId,
        )
      expect(actualRows).toEqual([
        expect.objectContaining({
          week: expected.week - 1,
          amount: expected.studioRevenue,
          productionId: expected.productionId,
        }),
      ])
      expect(receiptReplay.market.tick).toBe(expected.week)
      expect(
        receiptReplay.theatricalRuns.find(
          (candidate) => candidate.productionId === expected.productionId,
        )!.weekIndex,
      ).toBe(expected.paymentOrdinal)
    }
    expect(
      studioCalendar(receiptReplay).commitments.filter(
        (event) =>
          event.kind === 'theatricalReceipt' && event.productionId === run.productionId,
      ),
    ).toEqual([])

    const cluster = calendar.staffingHorizon.busiestExpiry!
    expect(cluster).toMatchObject({
      week: 208,
      contractCount: state.contracts.length,
      rosterCount: state.contracts.length,
      rosterShare: 1,
    })
    expect(cluster.talentIds).toEqual(state.contracts.map((contract) => contract.talentId).sort())
    expect(calendar.staffingHorizon.contracts.every((contract) => contract.renewalOpen)).toBe(true)
    expect(
      calendar.commitments.filter((event) => event.kind === 'contractRenewal'),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ week: 208 - TUNING.HIRING_RENEWAL_WINDOW_WEEKS, alreadyOpen: true }),
      ]),
    )
    expect(
      calendar.commitments.filter((event) => event.kind === 'contractExpiry'),
    ).toHaveLength(state.contracts.length)

    const week207: GameState = {
      ...state,
      market: { ...state.market, tick: 207 },
      theatricalRuns: [],
    }
    const beforeExpiry = studioCalendar(week207)
    const expiringTalentIds = beforeExpiry.staffingHorizon.contracts.map(
      (contract) => contract.talentId,
    )
    expect(beforeExpiry.commitments.filter((event) => event.kind === 'contractExpiry')).toHaveLength(
      expiringTalentIds.length,
    )
    const ledgerLength = week207.ledger.length
    const week208 = tick(week207)
    expect(
      week208.ledger
        .slice(ledgerLength)
        .filter((entry) => entry.kind === 'payroll'),
    ).toEqual([
      expect.objectContaining({
        week: 207,
        amount: -beforeExpiry.staffingHorizon.busiestExpiry!.weeklyPayroll,
      }),
    ])
    expect(week208.market.tick).toBe(208)
    expect(week208.contracts).toEqual([])
    expect(week208.freeAgents).toEqual(expect.arrayContaining(expiringTalentIds))
    expect(studioCalendar(week208).staffingHorizon).toEqual({
      contracts: [],
      busiestExpiry: null,
    })
    expect(
      studioCalendar(week208).commitments.filter(
        (event) => event.kind === 'contractRenewal' || event.kind === 'contractExpiry',
      ),
    ).toEqual([])
    expect(stableStringify(state)).toBe(before)
  })

  it('projects exactly the identity selected by the one studio decision law', () => {
    let state = managedStudio('calendar-decision-parity')
    const writers = contractedByRole(state, 'writer')
    state = applyActions(state, [
      { kind: 'commissionScript', project: scriptPayload(state, 0, writers[0]!.id) },
    ])
    state = applyActions(state, [
      { kind: 'commissionScript', project: scriptPayload(state, 1, writers[1]!.id) },
    ])
    state = tick(state)
    state = {
      ...state,
      scriptDevelopment: {
        ...state.scriptDevelopment,
        projects: [...state.scriptDevelopment.projects].reverse(),
      },
    }
    const selected = nextStudioDecision(state)
    expect(selected).toMatchObject({ kind: 'scriptReview', projectId: 'script-0000' })
    if (selected?.kind !== 'scriptReview') throw new Error('expected screenplay review')
    expect(studioCalendar(state).nextDecision).toEqual({
      kind: 'scriptReview',
      projectId: selected.projectId,
      title: selected.title,
    })
  })

  it('selects the lowest casting Review ID independently of stored session order', () => {
    let state = managedStudio('calendar-casting-decision-order')
    const writers = contractedByRole(state, 'writer')
    state = applyActions(state, [
      { kind: 'commissionScript', project: scriptPayload(state, 0, writers[0]!.id) },
      { kind: 'commissionScript', project: scriptPayload(state, 1, writers[1]!.id) },
    ])
    state = tick(state)
    state = applyActions(state, [
      { kind: 'acceptScript', projectId: 'script-0000' },
      { kind: 'acceptScript', projectId: 'script-0001' },
    ])
    const actors = contractedByRole(state, 'actor')
    const slate = {
      lead: [actors[0]!.id, actors[1]!.id],
      antagonist: [actors[0]!.id, actors[2]!.id],
      support: [actors[1]!.id, actors[2]!.id],
    } satisfies Record<CastSlot, [string, string]>
    state = applyActions(state, [
      { kind: 'startCastingSession', session: { projectId: 'script-0000', slate } },
      { kind: 'startCastingSession', session: { projectId: 'script-0001', slate } },
    ])
    state = tick(state)
    expect(state.castingSessions.sessions.map((session) => session.status)).toEqual([
      'review',
      'review',
    ])

    const expected = nextStudioDecision(state)
    expect(expected).toMatchObject({ kind: 'castingReview', sessionId: 'casting-0000' })
    if (expected?.kind !== 'castingReview') throw new Error('expected casting review')
    const reversed: GameState = {
      ...state,
      castingSessions: {
        ...state.castingSessions,
        sessions: [...state.castingSessions.sessions].reverse(),
      },
    }
    expect(nextStudioDecision(reversed)).toEqual(expected)
    expect(studioCalendar(reversed).nextDecision).toEqual(expected)
  })
})
