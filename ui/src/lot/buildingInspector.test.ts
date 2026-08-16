// ── World Inspector Default V1 — the pure projection behind the panel ─────────
//
// The panel must ALWAYS open (that is the whole point of M1.5), while every fact group
// inside it stays strict: a malformed, ambiguous, or absent read model is withheld
// atomically rather than guessed at (shift laws 6 / 17 / 21).

import { describe, expect, it } from 'vitest'
import type { StudioCalendarView, StudioConstructionView } from '../engine/adapter.ts'
import {
  LOT_DEEP_SCREEN_LABEL,
  lotBuildingInspectorContext,
} from './buildingInspector.ts'
import {
  ALL_BUILDING_IDS,
  BUILDING_LABELS,
  type ProductionOperationsState,
  type StudioLotSnapshot,
} from './snapshot/StudioLotSnapshot.ts'

function baseSnapshot(overrides: Partial<StudioLotSnapshot> = {}): StudioLotSnapshot {
  return {
    studioName: 'Project Studio',
    week: 2,
    cash: 1_250_000,
    cashBand: 'healthy',
    standing: 'established',
    standingValues: { awareness: 41, prestige: 33, confidence: 52 },
    publicityOffers: [],
    annexWork: null,
    activeProductions: [],
    releasedFilms: [],
    releasePresence: 'none',
    latestReleaseTitle: null,
    people: [],
    buildings: ALL_BUILDING_IDS.map((id) => ({ id, available: true })),
    selectedBuildingId: null,
    sceneSeed: 'inspector-spec',
    operationsMode: 'managed',
    stageAssignmentAuthority: 'engine',
    productionOperations: [],
    ...overrides,
  } as StudioLotSnapshot
}

function calendar(
  facilities: unknown[],
  commitments: unknown[] = [],
): StudioCalendarView {
  return { facilities, commitments } as unknown as StudioCalendarView
}

function developmentFacility(occupants: unknown[]): unknown {
  return {
    facilityId: 'facility-development-casting',
    facilityName: 'Development & Casting',
    capability: 'development-casting',
    capacity: 2,
    occupied: occupants.length,
    slots: [
      { facilityId: 'facility-development-casting', slot: 0, occupant: occupants[0] ?? null },
      { facilityId: 'facility-development-casting', slot: 1, occupant: occupants[1] ?? null },
    ],
  }
}

function operation(
  overrides: Partial<ProductionOperationsState> = {},
): ProductionOperationsState {
  return {
    productionId: 'production-1',
    title: 'A Season of Archipelago',
    phase: 'shooting',
    phaseLabel: 'Shooting',
    weeksRemaining: 4,
    progress01: 0.4,
    locationBuildingId: 'stage-b',
    facilityLabel: 'Soundstage 12',
    directorId: 'talent-d',
    directorName: 'Ida Cross',
    taskStatus: 'ready',
    statusLabel: 'Decision required',
    blocker: {
      kind: 'take-scheduling',
      headline: 'Take ready to schedule',
      detail: 'Soundstage 12 is ready, but the shooting take is not on the weekly schedule.',
    },
    attention: 'decision-required',
    currentCommand: {
      kind: 'scheduleShootingTake',
      productionId: 'production-1',
      label: 'Schedule the shooting take',
    },
    ...overrides,
  } as ProductionOperationsState
}

describe('World Inspector projection — the panel always opens', () => {
  it('names, describes and states every one of the nine places with nothing but a bare snapshot', () => {
    for (const id of ALL_BUILDING_IDS) {
      const context = lotBuildingInspectorContext(baseSnapshot(), id, null, null)
      expect(context.buildingId).toBe(id)
      expect(context.label).toBe(BUILDING_LABELS[id])
      expect(context.role.length).toBeGreaterThan(0)
      expect(context.status.length).toBeGreaterThan(0)
      expect(context.deepLabel).toBe(LOT_DEEP_SCREEN_LABEL[id])
    }
  })

  it('withholds every occupancy fact when the calendar is unavailable, and still opens', () => {
    const context = lotBuildingInspectorContext(baseSnapshot(), 'writers', null, null)
    expect(context.facts).toEqual([])
    expect(context.status).toBe('Development is open.')
  })
})

describe('World Inspector projection — Development & Casting occupancy', () => {
  it('states the shared facility’s slots on Development, naming the exact current work', () => {
    const view = calendar(
      [
        developmentFacility([
          { owner: 'script', ownerId: 'p1', title: 'A Season of Archipelago', activity: 'drafting' },
        ]),
      ],
      [
        {
          certainty: 'committed',
          kind: 'scriptDue',
          week: 4,
          ownerId: 'p1',
          occurrenceIndex: 0,
          projectId: 'p1',
          title: 'A Season of Archipelago',
          activity: 'drafting',
        },
      ],
    )
    const context = lotBuildingInspectorContext(baseSnapshot(), 'writers', view, null)
    expect(context.facts.map((fact) => `${fact.term} — ${fact.detail}`)).toEqual([
      'Development & Casting — 1/2 slots in use',
      'Slot 1 — Drafting: A Season of Archipelago',
      'Drafting — A Season of Archipelago · Week 4',
    ])
    expect(context.status).toBe('Screenplay work is under way in the studio’s development slots.')
  })

  it('reports the same physical facility on Casting, ordering its own work first', () => {
    const view = calendar([
      developmentFacility([
        { owner: 'script', ownerId: 'p1', title: 'A Season of Archipelago', activity: 'drafting' },
        { owner: 'casting', ownerId: 's1', title: 'The Long Coast', activity: 'auditioning' },
      ]),
    ])
    const context = lotBuildingInspectorContext(baseSnapshot(), 'casting', view, null)
    expect(context.facts.map((fact) => fact.detail)).toEqual([
      '2/2 slots in use',
      'Auditioning: The Long Coast',
      'Drafting: A Season of Archipelago',
    ])
  })

  it('withholds the whole occupancy claim when a facility’s count disagrees with its own slots', () => {
    const inconsistent = {
      ...(developmentFacility([]) as Record<string, unknown>),
      occupied: 1,
    }
    const context = lotBuildingInspectorContext(
      baseSnapshot(),
      'writers',
      calendar([inconsistent]),
      null,
    )
    expect(context.facts).toEqual([])
    expect(context.status).toBe('Development is open.')
  })

  it.each([
    ['a non-record facility', 42],
    ['an empty facility name', { ...(developmentFacility([]) as Record<string, unknown>), facilityName: '  ' }],
    ['a fractional capacity', { ...(developmentFacility([]) as Record<string, unknown>), capacity: 1.5 }],
    ['occupancy above capacity', { ...(developmentFacility([]) as Record<string, unknown>), capacity: 0, occupied: 0, slots: 'nope' }],
    [
      'an occupant missing its title',
      developmentFacility([{ owner: 'script', ownerId: 'p1', activity: 'drafting' }]),
    ],
  ])('withholds occupancy for %s', (_label, facility) => {
    const context = lotBuildingInspectorContext(
      baseSnapshot(),
      'writers',
      calendar([facility]),
      null,
    )
    expect(context.facts).toEqual([])
  })

  it('withholds every commitment when one member of the set is malformed', () => {
    const view = calendar(
      [],
      [
        {
          certainty: 'committed',
          kind: 'scriptDue',
          week: 4,
          ownerId: 'p1',
          occurrenceIndex: 0,
          title: 'A Season of Archipelago',
          activity: 'drafting',
        },
        { certainty: 'committed', kind: 'scriptDue', week: 6, ownerId: 'p2', title: 'Broken' },
      ],
    )
    const context = lotBuildingInspectorContext(baseSnapshot(), 'writers', view, null)
    expect(context.facts).toEqual([])
  })
})

describe('World Inspector projection — soundstages, idle and active', () => {
  it('states an idle stage in its own words and offers no command', () => {
    const context = lotBuildingInspectorContext(baseSnapshot(), 'stage-a', null, null)
    expect(context.status).toBe('The stage is dark — no picture is shooting here.')
    expect(context.commandOperation).toBeNull()
  })

  it('states an active stage’s picture, phase, weeks left, blocker and its existing command', () => {
    const snapshot = baseSnapshot({ productionOperations: [operation()] })
    const context = lotBuildingInspectorContext(snapshot, 'stage-b', null, null)
    expect(context.status).toBe('A Season of Archipelago · Decision required')
    expect(context.facts.map((fact) => fact.detail)).toEqual([
      'Shooting · Decision required · 4 weeks left',
      'Take ready to schedule — Soundstage 12 is ready, but the shooting take is not on the weekly schedule.',
    ])
    expect(context.commandOperation?.currentCommand?.kind).toBe('scheduleShootingTake')
  })

  it('never claims a stage that another building’s production is located at', () => {
    const snapshot = baseSnapshot({ productionOperations: [operation()] })
    const context = lotBuildingInspectorContext(snapshot, 'stage-a', null, null)
    expect(context.facts).toEqual([])
    expect(context.commandOperation).toBeNull()
  })

  it('offers no command when two located productions both carry one', () => {
    const snapshot = baseSnapshot({
      productionOperations: [operation(), operation({ productionId: 'production-2' })],
    })
    const context = lotBuildingInspectorContext(snapshot, 'stage-b', null, null)
    expect(context.commandOperation).toBeNull()
    expect(context.status).toBe('2 productions are recorded at this stage.')
  })
})

describe('World Inspector projection — theater, gate, administration, parcel', () => {
  it('states the marquee and the studio’s own recent releases', () => {
    const snapshot = baseSnapshot({
      releasePresence: 'now-showing',
      latestReleaseTitle: 'A Season of Archipelago',
      releasedFilms: [
        { id: 'production-1', title: 'A Season of Archipelago', reception: 'hit', weeksAgo: 1 },
      ],
    })
    const context = lotBuildingInspectorContext(snapshot, 'theater', null, null)
    expect(context.status).toBe('Now showing: A Season of Archipelago')
    expect(context.facts[0]).toMatchObject({
      term: 'A Season of Archipelago',
      detail: 'Hit · released 1 week ago',
    })
  })

  it('counts the exact current visitors at the gate', () => {
    const snapshot = baseSnapshot({
      gateHiringMarket: {
        candidates: [
          {
            talentId: 'talent-1',
            name: 'Marta Vance',
            creativeRole: 'actor',
            employmentStatus: 'freeAgent',
            offerTermWeeks: [52],
          },
        ],
      },
    })
    const context = lotBuildingInspectorContext(snapshot, 'gate', null, null)
    expect(context.status).toBe('1 visitor is waiting at the gate.')
    expect(context.facts).toEqual([
      { key: 'visitor:talent-1', term: 'Marta Vance', detail: 'Actor' },
    ])
  })

  it('withholds every visitor when one candidate is malformed, and says so', () => {
    const snapshot = baseSnapshot({
      gateHiringMarket: {
        candidates: [{ talentId: 'talent-1', name: 'Marta Vance' }],
      },
    } as unknown as Partial<StudioLotSnapshot>)
    const context = lotBuildingInspectorContext(snapshot, 'gate', null, null)
    expect(context.facts).toEqual([])
    expect(context.status).toBe('Current visitor details are unavailable at the Gate.')
  })

  it('states cash, standing and this week’s publicity at Administration', () => {
    const context = lotBuildingInspectorContext(baseSnapshot(), 'admin', null, null)
    expect(context.facts.map((fact) => fact.detail)).toEqual([
      '$1,250,000',
      'Awareness 41 · Prestige 33 · Confidence 52',
      'No campaign is offered this week',
    ])
  })

  it('quotes the parcel while vacant and prints its clock while building', () => {
    const vacant = {
      status: 'vacant',
      name: 'Development & Casting Annex',
      capex: 780_000,
      durationWeeks: 13,
    } as unknown as StudioConstructionView
    expect(
      lotBuildingInspectorContext(baseSnapshot(), 'expansion', null, vacant).facts.map(
        (fact) => fact.detail,
      ),
    ).toEqual(['Development & Casting Annex', '$780,000 · 13 weeks to build'])

    const building = {
      status: 'building',
      name: 'Development & Casting Annex',
      capex: 780_000,
      durationWeeks: 13,
      dueWeek: 14,
      completedAdvances: 3,
      remainingAdvances: 10,
    } as unknown as StudioConstructionView
    expect(
      lotBuildingInspectorContext(baseSnapshot(), 'expansion', null, building).facts[1],
    ).toMatchObject({ detail: '3/13 weeks done · due Week 14' })
  })

  it('withholds the parcel facts when the construction view is malformed', () => {
    const malformed = { status: 'building', name: 'Annex', capex: 780_000, durationWeeks: 13 }
    const context = lotBuildingInspectorContext(
      baseSnapshot(),
      'expansion',
      null,
      malformed as unknown as StudioConstructionView,
    )
    expect(context.facts).toEqual([])
    expect(context.status).toBe('Parcel details are unavailable.')
  })
})
