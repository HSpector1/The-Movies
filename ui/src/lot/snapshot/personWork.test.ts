import { describe, expect, it } from 'vitest'
import type {
  LotPublicityOffer,
  LotPersonState,
  ProductionOperationsState,
  StudioLotSnapshot,
} from './StudioLotSnapshot.ts'
import { lotPersonWorkContext } from './personWork.ts'

function person(overrides: Partial<LotPersonState> = {}): LotPersonState {
  return {
    id: 'director-a',
    name: 'Director A',
    role: 'director',
    authority: 'active-production',
    productionId: 'production-a',
    productionTitle: 'Picture A',
    ...overrides,
  }
}

function operation(overrides: Partial<ProductionOperationsState> = {}): ProductionOperationsState {
  return {
    productionId: 'production-a',
    title: 'Picture A',
    phase: 'shooting',
    phaseLabel: 'Shooting',
    weeksRemaining: 5,
    progress01: 0.375,
    locationBuildingId: 'stage-a',
    facilityLabel: 'Soundstage 7 + Scenery Shop',
    directorId: 'director-a',
    directorName: 'Director A',
    leadId: 'lead-a',
    leadName: 'Lead A',
    taskStatus: 'ready',
    statusLabel: 'Decision required',
    blocker: null,
    attention: 'decision-required',
    currentCommand: null,
    ...overrides,
  }
}

function publicityOffersAtWeek(week: number): LotPublicityOffer[] {
  const unavailable = {
    globalCooldownWeeks: 6,
    available: false,
    availableWeek: week,
    reason: 'Insufficient cash for this campaign.',
  } as const
  return [
    {
      tier: 'whisper',
      cost: 1_200_000,
      maxLift: 18,
      expectedLift: 0.28125,
      pricePerPoint: 4_266_666.666666667,
      cooldownWeeks: 8,
      ...unavailable,
    },
    {
      tier: 'push',
      cost: 3_600_000,
      maxLift: 30,
      expectedLift: 0.46875,
      pricePerPoint: 7_680_000,
      cooldownWeeks: 12,
      ...unavailable,
    },
    {
      tier: 'blitz',
      cost: 8_000_000,
      maxLift: 42,
      expectedLift: 0.65625,
      pricePerPoint: 12_190_476.19047619,
      cooldownWeeks: 20,
      ...unavailable,
    },
  ]
}

function snapshot(
  people: LotPersonState[],
  productionOperations: ProductionOperationsState[],
  mode: 'managed' | 'legacy' = 'managed',
): StudioLotSnapshot {
  const base = {
    studioName: 'Project: Studio',
    week: 30,
    cash: 1_000_000,
    cashBand: 'stable' as const,
    standing: 'established' as const,
    standingValues: { awareness: 50, prestige: 50, confidence: 50 },
    publicityOffers: publicityOffersAtWeek(30),
    activeProductions: [],
    releasedFilms: [],
    releasePresence: 'none' as const,
    latestReleaseTitle: null,
    people,
    buildings: [],
    selectedBuildingId: null,
    sceneSeed: 'person-work-test',
  }
  return mode === 'managed'
    ? {
        ...base,
        operationsMode: 'managed',
        stageAssignmentAuthority: 'engine',
        productionOperations,
      }
    : {
        ...base,
        operationsMode: 'legacy',
        stageAssignmentAuthority: 'presentation',
        productionOperations,
      }
}

describe('lotPersonWorkContext', () => {
  it('projects exact managed Director and Lead picture facts without inventing a Lead task', () => {
    const director = person()
    const lead = person({ id: 'lead-a', name: 'Lead A', role: 'talent' })
    const state = snapshot([director, lead], [operation()])

    expect(lotPersonWorkContext(state, director.id)).toMatchObject({
      kind: 'managed-production',
      productionRole: 'director',
      productionId: 'production-a',
      productionTitle: 'Picture A',
      phaseLabel: 'Shooting',
      productionStatusLabel: 'Decision required',
      productionWeeksRemaining: 5,
      directorTaskStatus: 'ready',
      productionFacilities: {
        buildingId: 'stage-a',
        facilityLabel: 'Soundstage 7 + Scenery Shop',
      },
    })
    expect(lotPersonWorkContext(state, lead.id)).toMatchObject({
      kind: 'managed-production',
      productionRole: 'lead',
      directorTaskStatus: null,
    })
  })

  it('joins two same-title productions only by exact participant and production identity', () => {
    const directorB = person({
      id: 'director-b',
      name: 'Director B',
      productionId: 'production-b',
      productionTitle: 'Picture A',
    })
    const operationB = operation({
      productionId: 'production-b',
      directorId: 'director-b',
      directorName: 'Director B',
      leadId: 'lead-b',
      leadName: 'Lead B',
      locationBuildingId: 'stage-b',
      facilityLabel: 'Soundstage 12 + Scenery Shop',
    })
    const state = snapshot(
      [directorB, person()],
      [operationB, operation()],
    )

    expect(lotPersonWorkContext(state, 'director-b')).toMatchObject({
      kind: 'managed-production',
      productionId: 'production-b',
      productionFacilities: { buildingId: 'stage-b' },
    })
  })

  it('keeps legacy stage assignment out of person workplace truth', () => {
    const state = snapshot([person()], [operation({
      phase: 'legacy',
      phaseLabel: 'Legacy production schedule',
      facilityLabel: 'Presentation-assigned stage (legacy)',
      taskStatus: null,
      statusLabel: 'In production',
    })], 'legacy')

    expect(lotPersonWorkContext(state, 'director-a')).toMatchObject({
      kind: 'legacy-production',
      phaseLabel: 'Legacy production schedule',
      productionFacilities: null,
    })
  })

  it('retains an exact roster identity without manufacturing current work', () => {
    const rosterPerson = person({
      authority: 'studio-roster',
      productionId: null,
      productionTitle: null,
    })
    expect(lotPersonWorkContext(snapshot([rosterPerson], []), rosterPerson.id)).toEqual({
      kind: 'roster',
      person: rosterPerson,
    })
  })

  it.each([
    ['duplicate person', [person(), person()], [operation()]],
    ['duplicate operation', [person()], [operation(), operation()]],
    [
      'cross-production reuse',
      [person()],
      [operation(), operation({ productionId: 'production-b', title: 'Picture B' })],
    ],
    [
      'duplicate production row with different participants',
      [person()],
      [
        operation(),
        operation({
          directorId: 'director-b',
          directorName: 'Director B',
          leadId: 'lead-b',
          leadName: 'Lead B',
        }),
      ],
    ],
    [
      'dual Director and Lead role',
      [person()],
      [operation({ leadId: 'director-a', leadName: 'Director A' })],
    ],
    ['stale title', [person()], [operation({ title: 'Different Picture' })]],
    ['stale name', [person()], [operation({ directorName: 'Different Director' })]],
  ])('fails %s closed', (_label, people, operations) => {
    expect(lotPersonWorkContext(snapshot(people, operations), 'director-a').kind).toBe('unavailable')
  })

  it('fails a missing Lead projection closed', () => {
    const missingLead = operation()
    delete missingLead.leadId
    delete missingLead.leadName
    expect(lotPersonWorkContext(snapshot([person()], [missingLead]), 'director-a')).toMatchObject({
      kind: 'unavailable',
      reason: 'missing-participant-projection',
    })
  })

  it('fails unsupported district provenance and omitted legacy operations closed', () => {
    expect(lotPersonWorkContext(
      snapshot([person({ authority: 'district-managed' })], [operation()]),
      'director-a',
    ).kind).toBe('unavailable')

    const legacy = snapshot([person()], [], 'legacy')
    delete (legacy as { productionOperations?: ProductionOperationsState[] }).productionOperations
    expect(lotPersonWorkContext(legacy, 'director-a')).toMatchObject({
      kind: 'unavailable',
      reason: 'missing-participant-projection',
    })

    const contradictoryAuthority = snapshot([person()], [operation()]) as unknown as {
      stageAssignmentAuthority: 'presentation'
    } & StudioLotSnapshot
    contradictoryAuthority.stageAssignmentAuthority = 'presentation'
    expect(lotPersonWorkContext(contradictoryAuthority, 'director-a')).toMatchObject({
      kind: 'unavailable',
      reason: 'unsupported-authority',
    })
  })
})
