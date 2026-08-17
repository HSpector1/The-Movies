// ── World Inspector Default V1 — the pure projection behind the panel ─────────
//
// The panel must ALWAYS open (that is the whole point of M1.5), while every fact group
// inside it stays strict: a malformed, ambiguous, or absent read model is withheld
// atomically rather than guessed at (shift laws 6 / 17 / 21).

import { describe, expect, it } from 'vitest'
import type {
  ScriptProjectsReadModel,
  StudioCalendarView,
  StudioConstructionView,
} from '../engine/adapter.ts'
import {
  LOT_DEEP_SCREEN_LABEL,
  lotBuildingInspectorContext,
} from './buildingInspector.ts'
import {
  ALL_BUILDING_IDS,
  BUILDING_LABELS,
  LOT_PRESENCE_STATIC_BEAT,
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

// ── M3-UI: "Who's here this week" ────────────────────────────────────────────

describe('World Inspector projection — presence occupants (M3-UI)', () => {
  function presenceSnapshot(people: unknown[]): StudioLotSnapshot {
    return baseSnapshot({
      presence: {
        week: 2,
        beatsPerWeek: 10,
        staticBeat: LOT_PRESENCE_STATIC_BEAT,
        people,
        withheldTalentIds: ['talent-withheld'],
      },
    } as unknown as Partial<StudioLotSnapshot>)
  }

  const beats = (working: 'at-site' | 'waiting'): string[] =>
    Array.from({ length: 10 }, (_, i) => (i === 0 ? 'home' : i === 1 ? 'travel' : i <= 8 ? working : 'home'))

  const occupant = (overrides: Record<string, unknown> = {}) => ({
    talentId: 'talent-w',
    name: 'Ada Vane',
    creativeRole: 'writer',
    engagement: 'script',
    credit: 'writer',
    ownerId: 'script-1',
    facilityId: 'facility-development-casting',
    slot: 0,
    beats: beats('at-site'),
    blockedReason: null,
    facilityName: 'Development & Casting',
    workTitle: 'A Season of Archipelago',
    activity: 'drafting',
    ...overrides,
  })

  it('lists who is in the building this week, by name and credit', () => {
    const context = lotBuildingInspectorContext(
      presenceSnapshot([
        occupant(),
        occupant({ talentId: 'talent-d', name: 'Ida Cross', credit: 'director', slot: 1 }),
      ]),
      'writers',
      null,
      null,
    )
    // M-B moved the people group into `occupantFacts` so the panel can print WHO IS
    // HERE before the verbs and leave capacity as trailing detail. The group's content
    // is unchanged, and `facts` must no longer carry any of it.
    expect(context.occupantFacts.map((fact) => `${fact.term} — ${fact.detail}`)).toEqual([
      'Who’s here this week — 2 people',
      'Ada Vane — Writer · A Season of Archipelago',
      'Ida Cross — Director · A Season of Archipelago',
    ])
    expect(context.facts.some((fact) => fact.key.startsWith('presence:'))).toBe(false)
  })

  it('marks a queued person as waiting outside the stage', () => {
    const context = lotBuildingInspectorContext(
      presenceSnapshot([
        occupant({
          talentId: 'talent-q',
          name: 'Rex Hale',
          credit: 'lead',
          facilityId: 'facility-soundstage-07',
          beats: beats('waiting'),
          blockedReason: 'awaiting soundstage capacity to enter rehearsal',
          facilityName: 'Soundstage 7',
        }),
      ]),
      'stage-a',
      null,
      null,
    )
    expect(context.occupantFacts.map((fact) => fact.detail)).toEqual([
      '1 person',
      'Lead · waiting outside',
    ])
    expect(context.facts).toEqual([])
  })

  it('reports the Annex parcel’s own occupants without inventing Calendar slot facts', () => {
    const context = lotBuildingInspectorContext(
      presenceSnapshot([
        occupant({ facilityId: 'facility-development-casting-annex', facilityName: 'Annex' }),
      ]),
      'expansion',
      null,
      null,
    )
    expect(context.occupantFacts.map((fact) => fact.term)).toEqual([
      'Who’s here this week',
      'Ada Vane',
    ])
    expect(context.facts).toEqual([])
  })

  it('claims nobody when the snapshot carries no presence, and still opens', () => {
    const context = lotBuildingInspectorContext(baseSnapshot(), 'writers', null, null)
    expect(context.occupantFacts).toEqual([])
    expect(context.facts).toEqual([])
    expect(context.status.length).toBeGreaterThan(0)
  })

  it('never lists a person the engine withheld', () => {
    const context = lotBuildingInspectorContext(
      presenceSnapshot([occupant()]),
      'writers',
      null,
      null,
    )
    expect(
      context.occupantFacts.some((fact) => fact.key === 'presence:talent-withheld'),
    ).toBe(false)
    expect(context.facts.some((fact) => fact.key === 'presence:talent-withheld')).toBe(false)
  })

  it('adds presence BELOW the accepted Calendar occupancy, never instead of it', () => {
    const view = calendar([
      developmentFacility([
        { owner: 'script', ownerId: 'script-1', title: 'A Season of Archipelago', activity: 'drafting' },
      ]),
    ])
    const context = lotBuildingInspectorContext(presenceSnapshot([occupant()]), 'writers', view, null)
    // Both groups still exist and neither swallowed the other — the ONLY thing M-B
    // changed is which group prints first (people, then the verbs, then capacity).
    expect(context.occupantFacts.map((fact) => fact.key)).toEqual([
      'presence:heading',
      'presence:talent-w',
    ])
    expect(context.facts.map((fact) => fact.key)).toEqual([
      'facility:facility-development-casting',
      'slot:facility-development-casting:0',
    ])
  })
})

// ── M-B: "what can I do here right now" ──────────────────────────────────────
//
// The cold playtest's loudest finding: a new player could not reach Commission or
// Plan-auditions FROM THE BUILDINGS. The picture-guidance card names those verbs; the
// buildings offered only a deep-details ghost. These specs pin the replacement and,
// just as hard, pin what must NOT appear — a verb the engine has not published is a
// button that lies about legality, which is worse than no button at all.

describe('World Inspector projection — primary actions (M-B)', () => {
  function board(overrides: {
    mode?: 'legacy' | 'managed'
    attention?: string
    canStart?: boolean
  } = {}): ScriptProjectsReadModel {
    return {
      mode: overrides.mode ?? 'managed',
      lotAttention: { kind: overrides.attention ?? 'idle', headline: 'x', detail: 'y' },
      commission: { canStart: overrides.canStart ?? true, blockers: [], concepts: [], writers: [] },
    } as unknown as ScriptProjectsReadModel
  }

  function journeySnapshot(view: unknown): StudioLotSnapshot {
    return baseSnapshot({ firstFilmJourney: view } as unknown as Partial<StudioLotSnapshot>)
  }

  function readyToPackage(kind: 'plan-auditions' | 'open-package'): unknown {
    return {
      stage: 'ready-to-package',
      pictureTitle: 'A Season of Archipelago',
      ordinal: 1,
      headline: 'Screenplay accepted',
      detail: 'Writer: Ada Vane',
      next: {
        kind,
        label:
          kind === 'plan-auditions'
            ? 'Plan auditions at Casting'
            : "Assemble the picture's package at Casting",
        site: 'casting',
      },
      waiting: null,
      blocked: null,
    }
  }

  it('offers Development the Commission verb on exactly the legality the host requires', () => {
    const context = lotBuildingInspectorContext(baseSnapshot(), 'writers', null, null, board())
    expect(context.primaryActions).toEqual([
      { kind: 'commission', label: 'Commission a screenplay' },
    ])
  })

  it('offers NO verb when the screenplay board is withheld', () => {
    const context = lotBuildingInspectorContext(baseSnapshot(), 'writers', null, null, null)
    expect(context.primaryActions).toEqual([])
    // …and the panel still opens with everything else intact (the M1.5 guarantee).
    expect(context.status.length).toBeGreaterThan(0)
    expect(context.deepLabel).toBe('Development')
  })

  it('offers NO verb when the engine says commissioning is illegal', () => {
    // The "no writer on the roster" shape: the board publishes the availability itself.
    const context = lotBuildingInspectorContext(
      baseSnapshot(),
      'writers',
      null,
      null,
      board({ canStart: false }),
    )
    expect(context.primaryActions).toEqual([])
  })

  it('offers NO verb when both development slots are full', () => {
    // The board stops calling the Writers Room idle the moment capacity is constrained,
    // and the host's retained-commissioning interception requires that exact `idle`.
    for (const attention of ['capacity-constraint', 'active-work', 'review-required', 'ready-script']) {
      const context = lotBuildingInspectorContext(
        baseSnapshot(),
        'writers',
        null,
        null,
        board({ attention }),
      )
      expect(context.primaryActions, attention).toEqual([])
    }
  })

  it('offers NO verb on a legacy board', () => {
    const context = lotBuildingInspectorContext(
      baseSnapshot(),
      'writers',
      null,
      null,
      board({ mode: 'legacy' }),
    )
    expect(context.primaryActions).toEqual([])
  })

  it('names the picture in Casting’s audition verb, straight off the engine’s journey', () => {
    const context = lotBuildingInspectorContext(
      journeySnapshot(readyToPackage('plan-auditions')),
      'casting',
      null,
      null,
      board(),
    )
    expect(context.primaryActions).toEqual([
      { kind: 'plan-auditions', label: 'Plan auditions for A Season of Archipelago' },
    ])
  })

  it('offers the package verb when the engine says auditions are no longer the next step', () => {
    const context = lotBuildingInspectorContext(
      journeySnapshot(readyToPackage('open-package')),
      'casting',
      null,
      null,
      board(),
    )
    expect(context.primaryActions).toEqual([
      { kind: 'open-package', label: 'Open the picture’s package' },
    ])
  })

  it('offers Casting nothing when the journey is absent, malformed, or at another stage', () => {
    expect(lotBuildingInspectorContext(baseSnapshot(), 'casting', null, null, board())
      .primaryActions).toEqual([])
    expect(lotBuildingInspectorContext(journeySnapshot({ stage: 'ready-to-package' }), 'casting', null, null, board())
      .primaryActions).toEqual([])
    const drafting = {
      ...(readyToPackage('plan-auditions') as Record<string, unknown>),
      stage: 'drafting',
    }
    expect(lotBuildingInspectorContext(journeySnapshot(drafting), 'casting', null, null, board())
      .primaryActions).toEqual([])
  })

  it('never offers a verb the Development/Casting pair does not own', () => {
    const snapshot = journeySnapshot(readyToPackage('plan-auditions'))
    for (const id of ALL_BUILDING_IDS) {
      if (id === 'writers' || id === 'casting') continue
      expect(
        lotBuildingInspectorContext(snapshot, id, null, null, board()).primaryActions,
        id,
      ).toEqual([])
    }
  })

  it('keeps every action kind unique, so its testid and React key stay stable', () => {
    const snapshot = journeySnapshot(readyToPackage('plan-auditions'))
    for (const id of ALL_BUILDING_IDS) {
      const actions = lotBuildingInspectorContext(snapshot, id, null, null, board()).primaryActions
      const kinds = actions.map((action) => action.kind)
      expect(new Set(kinds).size, id).toBe(kinds.length)
      for (const action of actions) expect(action.label.trim().length).toBeGreaterThan(0)
    }
  })

  it('names the deep ghosts in the player’s words, never in screen names', () => {
    expect(LOT_DEEP_SCREEN_LABEL.writers).toBe('Development')
    expect(LOT_DEEP_SCREEN_LABEL.casting).toBe('Casting')
    for (const label of Object.values(LOT_DEEP_SCREEN_LABEL)) {
      expect(label).not.toBe('Assembly')
      expect(label).not.toBe('Casting Room')
    }
  })
})
