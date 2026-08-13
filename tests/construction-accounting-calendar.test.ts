import { describe, expect, it } from 'vitest'
import {
  ANNEX_CAPEX,
  ANNEX_FACILITY_ID,
  ANNEX_PROJECT_ID,
  applyActions,
  financeTotals,
  generateWorld,
  openTheatricalRun,
  periodSummary,
  studioCalendar,
  studioRunRecap,
  tick,
} from '../src/core/index.js'
import type {
  CommissionScriptPayload,
  GameState,
  SegmentId,
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
