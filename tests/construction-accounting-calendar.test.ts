import { describe, expect, it } from 'vitest'
import {
  ANNEX_CAPEX,
  ANNEX_FACILITY_ID,
  ANNEX_PROJECT_ID,
  applyActions,
  commitPlacement,
  exportSave,
  financeTotals,
  generateWorld,
  makeSave,
  openTheatricalRun,
  periodSummary,
  stableStringify,
  studioCalendar,
  studioRunRecap,
  tick,
} from '../src/core/index.js'
import type {
  CommissionScriptPayload,
  GameState,
  PlacementRequest,
  SegmentId,
  StudioCalendarCommitmentView,
  StudioCalendarView,
  Talent,
} from '../src/core/index.js'

function managedVacant(seed: string): GameState {
  const engaged: GameState = {
    ...generateWorld(seed),
    economyEngagedEver: true,
  }
  return applyActions(engaged, [{ kind: 'activateStudioOperations' }])
}

function startAnnex(seed: string): GameState {
  return applyActions(managedVacant(seed), [{ kind: 'startDevelopmentCastingAnnex' }])
}

function advance(state: GameState, weeks: number): GameState {
  let current = state
  for (let i = 0; i < weeks; i++) current = tick(current)
  return current
}

const ANNEX_BLUEPRINT = 'development-casting-annex'
const ANNEX_NAME = 'Development & Casting Annex'
const BUILD_WEEKS = 13

/** An Annex-class placement request at one lot origin. */
function at(gx: number, gy: number): PlacementRequest {
  return { blueprintId: ANNEX_BLUEPRINT, origin: { gx, gy } }
}

type ConstructionCommitment = Extract<
  StudioCalendarCommitmentView,
  { kind: 'constructionCompletion' }
>

function constructionEvents(calendar: StudioCalendarView): ConstructionCommitment[] {
  return calendar.commitments.filter(
    (event): event is ConstructionCommitment => event.kind === 'constructionCompletion',
  )
}

function placeAll(state: GameState, requests: readonly PlacementRequest[]): GameState {
  let current = state
  for (const request of requests) {
    const next = commitPlacement(current, request)
    // A rejected commit returns the SAME state by reference, so this is the
    // cheapest possible proof that every fixture site below is genuinely legal.
    if (next === current) {
      throw new Error(`fixture: placement at ${String(request.origin.gx)},${String(request.origin.gy)} was refused`)
    }
    current = next
  }
  return current
}

function byRole(state: GameState, role: Talent['role']): Talent[] {
  return state.talent.filter((person) => person.role === role)
}

function managedPlanningStudio(seed: string): GameState {
  const world = generateWorld(seed)
  const people = [
    ...byRole(world, 'actor').slice(0, 3),
    ...byRole(world, 'writer').slice(0, 2),
  ]
  const engaged: GameState = {
    ...world,
    economyEngagedEver: true,
    contracts: people.map((person) => ({
      talentId: person.id,
      annualSalary: person.salary,
      signingBonus: 0,
      startWeek: 0,
      endWeekExclusive: 104,
      termWeeks: 104,
    })),
  }
  return applyActions(engaged, [
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

describe('Development & Casting Annex V1 — accounting and planning integration', () => {
  it('classifies capex once as studio construction without contaminating film or fixed costs', () => {
    const state = startAnnex('annex-accounting')

    expect(financeTotals(state)).toMatchObject({
      construction: -ANNEX_CAPEX,
      production: 0,
      payroll: 0,
      overhead: 0,
      net: -ANNEX_CAPEX,
    })
    expect(periodSummary(state, 0, 0)).toMatchObject({
      construction: -ANNEX_CAPEX,
      production: 0,
      payroll: 0,
      overhead: 0,
      otherCash: 0,
      netCash: -ANNEX_CAPEX,
    })

    const recap = studioRunRecap(state)
    expect(recap.capital).toMatchObject({
      totalConstruction: ANNEX_CAPEX,
      totalFilmContribution: 0,
      totalAllocatedFixedCost: 0,
      idleFixedCost: 0,
      totalLedgerFixedCost: 0,
      cashTimeline: [{ week: 0, cash: 20_000_000 - ANNEX_CAPEX }],
    })
    expect(Math.abs(recap.capital.totalCommitments)).toBe(0)
    expect(Math.abs(recap.capital.totalPayroll)).toBe(0)
    expect(Math.abs(recap.capital.totalOverhead)).toBe(0)
  })

  it('projects the exact completion commitment, then replaces it with operational capacity', () => {
    const started = startAnnex('annex-calendar')
    const building = studioCalendar(started)

    expect(building.studioDevelopment).toMatchObject({
      status: 'building',
      projectId: ANNEX_PROJECT_ID,
      dueWeek: 13,
      completedAdvances: 0,
      remainingAdvances: 13,
      completedCapacityGain: 0,
    })
    expect(building.commitments).toContainEqual(
      expect.objectContaining({
        kind: 'constructionCompletion',
        certainty: 'committed',
        week: 13,
        ownerId: ANNEX_PROJECT_ID,
        projectId: ANNEX_PROJECT_ID,
        facilityId: ANNEX_FACILITY_ID,
      }),
    )

    const week12 = advance(started, 12)
    expect(studioCalendar(week12).studioDevelopment).toMatchObject({
      status: 'building',
      completedAdvances: 12,
      remainingAdvances: 1,
    })

    const week13 = tick(week12)
    const operational = studioCalendar(week13)
    expect(operational.studioDevelopment).toMatchObject({
      status: 'operational',
      completedWeek: 13,
      completedAdvances: 13,
      remainingAdvances: 0,
      completedCapacityGain: 1,
      currentDevelopmentCastingCapacity: 3,
    })
    expect(
      operational.commitments.some((event) => event.kind === 'constructionCompletion'),
    ).toBe(false)
    expect(
      operational.facilities.find((facility) => facility.facilityId === ANNEX_FACILITY_ID),
    ).toMatchObject({ capacity: 1, occupied: 0, available: 1 })
    expect(financeTotals(week13).construction).toBe(-ANNEX_CAPEX)
  })

  it('sorts every same-week commitment by the frozen cross-system kind order', () => {
    let state = advance(managedPlanningStudio('annex-calendar-order'), 39)
    state = applyActions(state, [{ kind: 'startDevelopmentCastingAnnex' }])
    state = advance(state, 11)
    const writers = byRole(state, 'writer')
    const actors = byRole(state, 'actor')
    state = applyActions(state, [
      { kind: 'commissionScript', project: scriptPayload(state, 0, writers[0]!.id) },
    ])
    state = tick(state)
    state = applyActions(state, [
      { kind: 'acceptScript', projectId: state.scriptDevelopment.projects[0]!.id },
    ])
    state = applyActions(state, [
      {
        kind: 'startCastingSession',
        session: {
          projectId: state.scriptDevelopment.projects[0]!.id,
          slate: {
            lead: [actors[0]!.id, actors[1]!.id],
            antagonist: [actors[0]!.id, actors[2]!.id],
            support: [actors[1]!.id, actors[2]!.id],
          },
        },
      },
      { kind: 'commissionScript', project: scriptPayload(state, 1, writers[1]!.id) },
    ])
    expect(state.market.tick).toBe(51)

    const expiryTalent = actors[0]!.id
    const renewalTalent = actors[1]!.id
    state = {
      ...state,
      contracts: state.contracts.map((contract) =>
        contract.talentId === expiryTalent
          ? { ...contract, startWeek: 0, endWeekExclusive: 52, termWeeks: 52 }
          : contract.talentId === renewalTalent
            ? { ...contract, startWeek: 12, endWeekExclusive: 64, termWeeks: 52 }
            : contract,
      ),
      theatricalRuns: [
        openTheatricalRun(
          {
            productionId: 'prod-annex-calendar-order',
            conceptId: state.concepts[2]!.id,
            releaseTick: 51,
            boxOffice: { opening: 1_000_000, total: 1_500_000 },
          } as never,
          1_000_000,
          1.5,
          51,
        ),
      ],
    }

    expect(
      studioCalendar(state).commitments
        .filter((event) => event.week === 52)
        .map((event) => event.kind),
    ).toEqual([
      'scriptDue',
      'castingDue',
      'constructionCompletion',
      'theatricalReceipt',
      'contractRenewal',
      'contractExpiry',
    ])
  })
})

// The calendar's committed events must come from the V12 placement root, not from
// the retained Annex read model, which fronts ONLY the placement standing on the
// legacy expansion parcel. Anything else under construction is capacity the studio
// has already paid for, and a calendar that omitted it lied by omission.
describe('Studio Calendar × Placement Core V12 — every committed build is on the board', () => {
  it('keeps the legacy-parcel Annex commitment byte-identical and adds only engine identity', () => {
    const calendar = studioCalendar(startAnnex('calendar-v12-legacy-parity'))
    const events = constructionEvents(calendar)
    expect(events).toHaveLength(1)
    const { placementId, parcelId, facilityName, ...retained } = events[0]!

    // Field for field, the exact projection the legacy construction path published.
    expect(retained).toEqual({
      kind: 'constructionCompletion',
      certainty: 'committed',
      week: BUILD_WEEKS,
      ownerId: ANNEX_PROJECT_ID,
      occurrenceIndex: 0,
      projectId: ANNEX_PROJECT_ID,
      facilityId: ANNEX_FACILITY_ID,
      title: ANNEX_NAME,
    })
    // …and it still agrees with the retained read model it used to be derived from.
    expect(retained.week).toBe(calendar.studioDevelopment.dueWeek)
    expect(retained.projectId).toBe(calendar.studioDevelopment.projectId)
    expect(retained.facilityId).toBe(calendar.studioDevelopment.facilityId)
    expect(retained.title).toBe(calendar.studioDevelopment.name)

    // The additive fields are engine identities the placement root already carries.
    // No BuildingId, no geometry.
    expect({ placementId, parcelId, facilityName }).toEqual({
      placementId: 1,
      parcelId: 'expansion',
      facilityName: ANNEX_NAME,
    })
  })

  it('lists a facility rising on a non-legacy parcel the retained Annex view cannot see', () => {
    const state = placeAll(managedVacant('calendar-v12-non-legacy'), [at(15, 16)])
    const calendar = studioCalendar(state)

    // The old source of truth is blind here: no Annex stands on the legacy parcel.
    expect(calendar.studioDevelopment).toMatchObject({ status: 'vacant', dueWeek: null })

    const events = constructionEvents(calendar)
    expect(events).toHaveLength(1)
    expect(events[0]).toEqual({
      kind: 'constructionCompletion',
      certainty: 'committed',
      week: BUILD_WEEKS,
      ownerId: ANNEX_PROJECT_ID,
      occurrenceIndex: 0,
      projectId: ANNEX_PROJECT_ID,
      facilityId: ANNEX_FACILITY_ID,
      title: ANNEX_NAME,
      placementId: 1,
      parcelId: 'stage-south',
      facilityName: ANNEX_NAME,
    })
    expect(calendar.summary.committedEvents).toBe(1)
    expect(calendar.summary.nextCommittedWeek).toBe(BUILD_WEEKS)
  })

  it('orders simultaneous builds by placement id and later builds by week', () => {
    let state = placeAll(managedVacant('calendar-v12-simultaneous'), [at(0, 9), at(15, 16)])
    state = advance(state, 2)
    state = placeAll(state, [at(0, 12)])
    expect(state.placement.facilities).toHaveLength(3)

    const events = constructionEvents(studioCalendar(state))
    expect(events.map((event) => [event.week, event.placementId])).toEqual([
      [BUILD_WEEKS, 1],
      [BUILD_WEEKS, 2],
      [BUILD_WEEKS + 2, 3],
    ])
    expect(events.map((event) => event.parcelId)).toEqual([
      'west-lawn',
      'stage-south',
      'west-lawn',
    ])
    expect(events.map((event) => event.facilityId)).toEqual([
      ANNEX_FACILITY_ID,
      `${ANNEX_FACILITY_ID}-2`,
      `${ANNEX_FACILITY_ID}-3`,
    ])
    expect(events.map((event) => event.facilityName)).toEqual([
      ANNEX_NAME,
      `${ANNEX_NAME} 2`,
      `${ANNEX_NAME} 3`,
    ])
    // Every event still carries the frozen kind, and the summary counts them all.
    expect(studioCalendar(state).summary).toMatchObject({
      committedEvents: 3,
      nextCommittedWeek: BUILD_WEEKS,
    })
  })

  it('breaks a same-week tie on the numeric placement id, not the suffixed project id', () => {
    // Ten simultaneous builds: the tenth's project id is "…-10", which sorts
    // BEFORE "…-2" as a string. Placement id is the only honest order.
    const state = placeAll(managedVacant('calendar-v12-ten'), [
      at(7, 15),
      at(0, 9),
      at(0, 12),
      at(0, 2),
      at(0, 5),
      at(6, 2),
      at(6, 5),
      at(15, 16),
      at(15, 19),
      at(3, 19),
    ])
    const events = constructionEvents(studioCalendar(state))
    expect(events).toHaveLength(10)
    expect(events.every((event) => event.week === BUILD_WEEKS)).toBe(true)
    expect(events.map((event) => event.placementId)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])

    const byProjectId = [...events].sort((a, b) =>
      a.projectId < b.projectId ? -1 : a.projectId > b.projectId ? 1 : 0,
    )
    expect(byProjectId.map((event) => event.placementId)).toEqual([
      1, 10, 2, 3, 4, 5, 6, 7, 8, 9,
    ])
  })

  it('stops projecting a completed build and hands its slots to facility utilization', () => {
    const started = placeAll(managedVacant('calendar-v12-operational'), [at(15, 16)])
    const building = studioCalendar(started)
    expect(constructionEvents(building)).toHaveLength(1)
    expect(
      building.facilities.some((facility) => facility.facilityId === ANNEX_FACILITY_ID),
    ).toBe(false)
    const baseCapacity = building.summary.facilityCapacity

    const operational = studioCalendar(advance(started, BUILD_WEEKS))
    expect(constructionEvents(operational)).toEqual([])
    // The retained Annex view still reports "vacant" — the legacy parcel is empty.
    // Utilization is what proves the capacity actually arrived.
    expect(operational.studioDevelopment.status).toBe('vacant')
    expect(
      operational.facilities.find((facility) => facility.facilityId === ANNEX_FACILITY_ID),
    ).toEqual({
      facilityId: ANNEX_FACILITY_ID,
      facilityName: ANNEX_NAME,
      capability: 'development-casting',
      capacity: 1,
      occupied: 0,
      available: 1,
      slots: [
        {
          facilityId: ANNEX_FACILITY_ID,
          facilityName: ANNEX_NAME,
          capability: 'development-casting',
          slot: 0,
          occupant: null,
        },
      ],
    })
    expect(operational.summary).toMatchObject({
      facilityCapacity: baseCapacity + 1,
      occupiedSlots: 0,
      availableSlots: baseCapacity + 1,
    })
  })

  it('projects deterministically and mutates nothing while builds are in flight', () => {
    let state = placeAll(managedVacant('calendar-v12-purity'), [at(7, 15), at(15, 16)])
    state = advance(state, 4)
    const before = exportSave(makeSave(state))
    const stateBefore = stableStringify(state)

    const first = studioCalendar(state)
    const second = studioCalendar(state)
    expect(second).toEqual(first)
    expect(stableStringify(second)).toBe(stableStringify(first))
    expect(constructionEvents(first).map((event) => event.placementId)).toEqual([1, 2])
    expect(constructionEvents(first).map((event) => event.parcelId)).toEqual([
      'expansion',
      'stage-south',
    ])

    expect(exportSave(makeSave(state))).toBe(before)
    expect(stableStringify(state)).toBe(stateBefore)
  })
})
