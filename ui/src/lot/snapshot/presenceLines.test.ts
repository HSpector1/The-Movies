// ── Presence on the Lot V1 — what the inspectors say, proven from the snapshot ─
//
// The panel must keep working whatever presence does: the milestone's fail-neutral law
// is that a withheld person claims NO presence line, never a wrong one, and never a
// blank where an M1.5 employment fact used to be.

import { describe, expect, it } from 'vitest'
import {
  ALL_BUILDING_IDS,
  LOT_PRESENCE_STATIC_BEAT,
  type LotPresenceBeat,
  type LotPresencePerson,
  type StudioLotSnapshot,
} from './StudioLotSnapshot.ts'
import {
  lotFacilityPresenceOccupants,
  lotPersonPresenceLine,
  presenceCreditLabel,
} from './presenceLines.ts'

function workWeek(working: 'at-site' | 'waiting'): LotPresenceBeat[] {
  const beats: LotPresenceBeat[] = []
  for (let i = 0; i < 10; i++) {
    if (i < 1) beats.push('home')
    else if (i === 1) beats.push('travel')
    else if (i <= 8) beats.push(working)
    else beats.push('home')
  }
  return beats
}

function person(overrides: Partial<LotPresencePerson> = {}): LotPresencePerson {
  return {
    talentId: 'talent-w',
    name: 'Ada Vane',
    creativeRole: 'writer',
    engagement: 'script',
    credit: 'writer',
    ownerId: 'script-1',
    facilityId: 'facility-development-casting',
    slot: 0,
    beats: workWeek('at-site'),
    blockedReason: null,
    facilityName: 'Development & Casting',
    workTitle: 'A Season of Archipelago',
    activity: 'drafting',
    ...overrides,
  }
}

function snapshot(people: LotPresencePerson[] | null): StudioLotSnapshot {
  return {
    studioName: 'Project Studio',
    week: 3,
    cash: 1_000_000,
    cashBand: 'stable',
    standing: 'finding-footing',
    standingValues: { awareness: 10, prestige: 10, confidence: 10 },
    publicityOffers: [],
    annexWork: null,
    activeProductions: [],
    releasedFilms: [],
    releasePresence: 'none',
    latestReleaseTitle: null,
    people: [],
    buildings: ALL_BUILDING_IDS.map((id) => ({ id, available: true })),
    selectedBuildingId: null,
    sceneSeed: 'presence-lines-spec',
    operationsMode: 'managed',
    stageAssignmentAuthority: 'engine',
    productionOperations: [],
    ...(people === null
      ? {}
      : {
          presence: {
            week: 3,
            beatsPerWeek: 10,
            staticBeat: LOT_PRESENCE_STATIC_BEAT,
            people,
            withheldTalentIds: [],
          },
        }),
  } as StudioLotSnapshot
}

describe('person presence line', () => {
  it('quotes the exact sentence the milestone asked for', () => {
    const line = lotPersonPresenceLine(snapshot([person()]), 'talent-w')
    expect(line?.kind).toBe('at-site')
    expect(line?.line).toBe('Drafting A Season of Archipelago at Development & Casting, slot 1')
    expect(line?.creditLabel).toBe('Writer')
    expect(line?.slotNumber).toBe(1)
  })

  it('prints the slot as a HUMAN number, not the engine index', () => {
    expect(lotPersonPresenceLine(snapshot([person({ slot: 1 })]), 'talent-w')?.line).toContain(
      'slot 2',
    )
  })

  it('quotes the engine’s own blocker reason verbatim for a queued person', () => {
    const line = lotPersonPresenceLine(
      snapshot([
        person({
          engagement: 'production',
          credit: 'lead',
          ownerId: 'production-1',
          facilityId: 'facility-soundstage-07',
          beats: workWeek('waiting'),
          blockedReason: 'awaiting soundstage capacity to enter rehearsal',
          facilityName: 'Soundstage 7',
          workTitle: 'A Season of Archipelago',
          activity: 'rehearsal',
        }),
      ]),
      'talent-w',
    )
    expect(line?.kind).toBe('waiting')
    expect(line?.line).toBe('Waiting — awaiting soundstage capacity to enter rehearsal')
    expect(line?.blockedReason).toBe('awaiting soundstage capacity to enter rehearsal')
  })

  it('states an unclaimed week honestly instead of leaving it blank', () => {
    const line = lotPersonPresenceLine(
      snapshot([
        person({
          engagement: 'roster',
          credit: null,
          ownerId: null,
          facilityId: null,
          slot: null,
          beats: Array.from({ length: 10 }, () => 'home' as LotPresenceBeat),
          facilityName: null,
          workTitle: null,
          activity: null,
        }),
      ]),
      'talent-w',
    )
    expect(line?.kind).toBe('roster')
    expect(line?.line).toBe('On the studio roster this week — no workplace is claimed for them.')
  })

  it('claims NOTHING for a person the engine withheld — fail-neutral', () => {
    // The engine's withholding shows up as absence from `people`, which is exactly the
    // shape the adapter mirrors. The panel simply prints no presence line.
    expect(lotPersonPresenceLine(snapshot([person()]), 'talent-withheld')).toBeNull()
  })

  it('claims nothing when the snapshot carries no presence at all (legacy mode)', () => {
    expect(lotPersonPresenceLine(snapshot(null), 'talent-w')).toBeNull()
  })

  it('claims nothing when one id appears twice — contradictory truth', () => {
    expect(
      lotPersonPresenceLine(snapshot([person(), person({ slot: 1 })]), 'talent-w'),
    ).toBeNull()
  })

  it('degrades to what is PROVEN when the Calendar join did not agree', () => {
    const unjoined = person({ facilityName: null, workTitle: null, activity: null })
    const line = lotPersonPresenceLine(snapshot([unjoined]), 'talent-w')
    expect(line?.kind).toBe('at-site')
    expect(line?.line).toBe('At work this week as Writer, slot 1')
    expect(line?.workTitle).toBeNull()
    // …and never prints a title it cannot prove.
    expect(line?.line).not.toContain('Archipelago')
  })

  it('keeps the facility when only the occupant strings are missing', () => {
    const line = lotPersonPresenceLine(
      snapshot([person({ workTitle: null, activity: null })]),
      'talent-w',
    )
    expect(line?.line).toBe('At work at Development & Casting, slot 1')
  })

  it('names every credit the engine can emit', () => {
    for (const credit of [
      'writer',
      'director',
      'lead',
      'antagonist',
      'support',
      'craft',
      'auditionee',
    ] as const) {
      expect(presenceCreditLabel(credit)).not.toBeNull()
    }
    expect(presenceCreditLabel(null)).toBeNull()
  })
})

describe('facility presence occupants', () => {
  const roster = [
    person(),
    person({ talentId: 'talent-d', name: 'Ida Cross', credit: 'director', slot: 1 }),
    person({
      talentId: 'talent-q',
      name: 'Rex Hale',
      credit: 'lead',
      facilityId: 'facility-soundstage-07',
      beats: workWeek('waiting'),
      blockedReason: 'awaiting soundstage capacity to enter rehearsal',
    }),
    person({
      talentId: 'talent-home',
      name: 'June Pell',
      engagement: 'roster',
      credit: null,
      ownerId: null,
      facilityId: null,
      slot: null,
      beats: Array.from({ length: 10 }, () => 'home' as LotPresenceBeat),
    }),
  ]

  it('lists who is at the named facilities, by name and credit', () => {
    const here = lotFacilityPresenceOccupants(snapshot(roster), [
      'facility-development-casting',
      'facility-development-casting-annex',
    ])
    expect(here.map((occupant) => `${occupant.name} · ${occupant.creditLabel ?? ''}`)).toEqual([
      'Ada Vane · Writer',
      'Ida Cross · Director',
    ])
    expect(here.every((occupant) => !occupant.waiting)).toBe(true)
  })

  it('marks a queued person as waiting outside rather than inside', () => {
    const here = lotFacilityPresenceOccupants(snapshot(roster), ['facility-soundstage-07'])
    expect(here).toHaveLength(1)
    expect(here[0]).toMatchObject({ name: 'Rex Hale', waiting: true })
  })

  it('never lists a person with no workplace claim, and never a wrong building', () => {
    expect(lotFacilityPresenceOccupants(snapshot(roster), ['facility-post-building'])).toEqual([])
    expect(
      lotFacilityPresenceOccupants(snapshot(roster), ['facility-development-casting']).some(
        (occupant) => occupant.talentId === 'talent-home',
      ),
    ).toBe(false)
  })

  it('lists nobody when the snapshot carries no presence', () => {
    expect(lotFacilityPresenceOccupants(snapshot(null), ['facility-development-casting'])).toEqual(
      [],
    )
  })
})
