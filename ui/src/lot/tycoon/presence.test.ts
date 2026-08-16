// ── Presence on the Lot V1 — the translation, proven without a renderer ───────
//
// `presence.ts` is the only place an ENGINE FACILITY ID becomes a point on the 28×26
// property. Everything it claims is checkable here: which body a facility is, where a
// worker stands, where a queue forms, who is counted on a sign, and — the law that
// matters most — that an unmapped facility moves nobody at all.

import { describe, expect, it } from 'vitest'
import type {
  LotPlacedFacilityState,
  LotPresenceBeat,
  LotPresencePerson,
  LotPresenceProjection,
} from '../snapshot/StudioLotSnapshot.ts'
import { LOT_PRESENCE_STATIC_BEAT } from '../snapshot/StudioLotSnapshot.ts'
import {
  PRESENCE_FACILITY_PLACE,
  presenceOccupantCounts,
  presencePath,
  presenceStands,
  presenceWaiting,
  resolvePresenceSite,
  stanceForBeat,
  type PresencePersonHome,
} from './presence.ts'
import {
  PLACE_BY_BUILDING,
  PRESENCE_ROUTES,
  presenceQueueSlotOffset,
  presenceSiteSlotOffset,
} from './world.ts'

const DIRECTOR_HOME = { gx: 10.5, gy: 5.9 }
const TALENT_HOME = { gx: 5.4, gy: 11.9 }

/** The engine's own beat shape: home… → travel → work through beat 8 → home. */
function workWeek(departure: number, working: 'at-site' | 'waiting'): LotPresenceBeat[] {
  const beats: LotPresenceBeat[] = []
  for (let i = 0; i < 10; i++) {
    if (i < departure) beats.push('home')
    else if (i === departure) beats.push('travel')
    else if (i <= 8) beats.push(working)
    else beats.push('home')
  }
  return beats
}

function homeWeek(): LotPresenceBeat[] {
  return Array.from({ length: 10 }, () => 'home' as LotPresenceBeat)
}

function person(overrides: Partial<LotPresencePerson> = {}): LotPresencePerson {
  return {
    talentId: 'talent-1',
    name: 'Ada Vane',
    creativeRole: 'writer',
    engagement: 'script',
    credit: 'writer',
    ownerId: 'script-1',
    facilityId: 'facility-development-casting',
    slot: 0,
    beats: workWeek(1, 'at-site'),
    blockedReason: null,
    facilityName: 'Development & Casting',
    workTitle: 'A Season of Archipelago',
    activity: 'drafting',
    ...overrides,
  }
}

function projection(people: LotPresencePerson[]): LotPresenceProjection {
  return {
    week: 3,
    beatsPerWeek: 10,
    staticBeat: LOT_PRESENCE_STATIC_BEAT,
    people,
    withheldTalentIds: [],
  }
}

function homes(
  entries: [string, PresencePersonHome][] = [['talent-1', { role: 'talent', home: TALENT_HOME }]],
): Map<string, PresencePersonHome> {
  return new Map(entries)
}

function placedAnnex(overrides: Partial<LotPlacedFacilityState> = {}): LotPlacedFacilityState {
  return {
    id: 1,
    blueprintId: 'development-casting-annex',
    name: 'Development & Casting Annex 2',
    facilityId: 'facility-development-casting-annex-2',
    parcelId: 'south-lawn',
    origin: { gx: 3, gy: 19 },
    cells: [
      { gx: 3, gy: 19 },
      { gx: 4, gy: 19 },
      { gx: 5, gy: 19 },
      { gx: 3, gy: 20 },
      { gx: 4, gy: 20 },
      { gx: 5, gy: 20 },
    ],
    status: 'operational',
    placedWeek: 1,
    completesWeek: 14,
    weeksRemaining: 0,
    progress01: 1,
    weeklyOperatingCost: 3_500,
    ...overrides,
  }
}

describe('presence — which body a facility is', () => {
  it('maps every founding engine facility onto a real place on the property', () => {
    for (const [facilityId, buildingId] of Object.entries(PRESENCE_FACILITY_PLACE)) {
      expect(PLACE_BY_BUILDING[buildingId].buildingId).toBe(buildingId)
      const site = resolvePresenceSite(facilityId, [])
      expect(site?.kind).toBe('place')
      if (site?.kind !== 'place') throw new Error('expected an authored place')
      expect(site.buildingId).toBe(buildingId)
    }
  })

  it('stands development work at Development, the building whose sign names it', () => {
    const site = resolvePresenceSite('facility-development-casting', [])
    expect(site?.kind === 'place' && site.buildingId).toBe('writers')
    expect(site?.work).toEqual(PLACE_BY_BUILDING.writers.anchors.work)
    expect(site?.wait).toEqual(PLACE_BY_BUILDING.writers.anchors.wait)
  })

  it('gives an UNMAPPED facility no body at all rather than borrowing one', () => {
    expect(resolvePresenceSite('facility-invented-screening-room', [])).toBeNull()
  })

  it('reads a placed annex off the cells the engine says it occupies', () => {
    const placed = placedAnnex()
    const site = resolvePresenceSite(placed.facilityId, [placed])
    expect(site?.kind).toBe('placed')
    if (site?.kind !== 'placed') throw new Error('expected a placed site')
    expect(site.placedId).toBe(1)
    // In front of the footprint's +gy face, never on top of it.
    expect(site.work.gx).toBeCloseTo(4.5, 6)
    expect(site.work.gy).toBeGreaterThan(20)
    expect(site.wait.gy).toBeGreaterThan(site.work.gy)
    // Its commute re-uses an AUTHORED road route rather than inventing new geometry.
    expect(PRESENCE_ROUTES.talent[site.routeTo]).toBeDefined()
  })

  it('leaves the legacy fixed parcel to the expansion place that already paints it', () => {
    const legacy = placedAnnex({
      facilityId: 'facility-development-casting-annex',
      parcelId: 'expansion',
    })
    const site = resolvePresenceSite('facility-development-casting-annex', [legacy])
    expect(site?.kind === 'place' && site.buildingId).toBe('expansion')
  })

  it('withholds a site claimed by more than one placement', () => {
    const a = placedAnnex({ id: 1 })
    const b = placedAnnex({ id: 2 })
    expect(resolvePresenceSite(a.facilityId, [a, b])).toBeNull()
  })
})

describe('presence — where the week stands people', () => {
  it('stands a claimed person at their site, on their co-location slot', () => {
    const stands = presenceStands(
      projection([person()]),
      [],
      homes(),
      LOT_PRESENCE_STATIC_BEAT,
    )
    expect(stands).toHaveLength(1)
    const stand = stands[0]!
    expect(stand.stance).toBe('at-site')
    const anchor = PLACE_BY_BUILDING.writers.anchors.work!
    const offset = presenceSiteSlotOffset(0)
    expect(stand.destination).toEqual({
      gx: anchor.gx + offset.gx,
      gy: anchor.gy + offset.gy,
    })
  })

  it('keeps a roster week at the home zone and claims no site', () => {
    const stands = presenceStands(
      projection([
        person({
          engagement: 'roster',
          credit: null,
          ownerId: null,
          facilityId: null,
          slot: null,
          beats: homeWeek(),
          facilityName: null,
          workTitle: null,
          activity: null,
        }),
      ]),
      [],
      homes(),
      LOT_PRESENCE_STATIC_BEAT,
    )
    expect(stands[0]).toMatchObject({ stance: 'home', site: null, destination: null })
    expect(stands[0]!.path).toEqual([TALENT_HOME])
  })

  it('keeps a person at home when their facility has no body on the property', () => {
    const stands = presenceStands(
      projection([person({ facilityId: 'facility-invented-screening-room' })]),
      [],
      homes(),
      LOT_PRESENCE_STATIC_BEAT,
    )
    expect(stands[0]).toMatchObject({ stance: 'home', site: null, destination: null })
  })

  it('clusters waiting people OUTSIDE the site, in a queue, never on the door', () => {
    const queue = ['talent-1', 'talent-2', 'talent-3'].map((talentId, index) =>
      person({
        talentId,
        name: `Queued ${String(index)}`,
        engagement: 'production',
        credit: 'lead',
        ownerId: 'production-1',
        facilityId: 'facility-soundstage-07',
        slot: 0,
        beats: workWeek(1, 'waiting'),
        blockedReason: 'awaiting soundstage capacity to enter rehearsal',
      }),
    )
    const stands = presenceStands(
      projection(queue),
      [],
      homes(queue.map((p) => [p.talentId, { role: 'talent', home: TALENT_HOME }])),
      LOT_PRESENCE_STATIC_BEAT,
    )
    const stage = PLACE_BY_BUILDING['stage-a']
    expect(stands.map((stand) => stand.stance)).toEqual(['waiting', 'waiting', 'waiting'])
    stands.forEach((stand, index) => {
      const offset = presenceQueueSlotOffset(index)
      expect(stand.destination).toEqual({
        gx: stage.anchors.wait!.gx + offset.gx,
        gy: stage.anchors.wait!.gy + offset.gy,
      })
      // …and never on the door itself.
      expect(stand.destination).not.toEqual(stage.anchors.work)
      expect(stand.blockedReason).toBe('awaiting soundstage capacity to enter rehearsal')
    })
    // Three distinct standing points: a queue is a line of people, not a stack.
    expect(new Set(stands.map((s) => `${String(s.destination!.gx)},${String(s.destination!.gy)}`)).size).toBe(3)
  })

  it('gives every co-located worker at one site a distinct point', () => {
    const company = ['a', 'b', 'c', 'd'].map((suffix) =>
      person({
        talentId: `talent-${suffix}`,
        engagement: 'production',
        credit: 'support',
        ownerId: 'production-1',
        facilityId: 'facility-soundstage-12',
      }),
    )
    const stands = presenceStands(
      projection(company),
      [],
      homes(company.map((p) => [p.talentId, { role: 'talent', home: TALENT_HOME }])),
      LOT_PRESENCE_STATIC_BEAT,
    )
    const points = stands.map((s) => `${String(s.destination!.gx)},${String(s.destination!.gy)}`)
    expect(new Set(points).size).toBe(4)
  })

  it('ignores a person the renderer does not draw, and never invents a home for them', () => {
    const stands = presenceStands(projection([person()]), [], new Map(), LOT_PRESENCE_STATIC_BEAT)
    expect(stands).toEqual([])
  })

  it('is a pure function of its inputs — identical calls, identical answers', () => {
    const input = projection([person(), person({ talentId: 'talent-2', slot: 1 })])
    const people = homes([
      ['talent-1', { role: 'talent', home: TALENT_HOME }],
      ['talent-2', { role: 'director', home: DIRECTOR_HOME }],
    ])
    const first = presenceStands(input, [], people, LOT_PRESENCE_STATIC_BEAT)
    const second = presenceStands(input, [], people, LOT_PRESENCE_STATIC_BEAT)
    expect(JSON.stringify(second)).toBe(JSON.stringify(first))
  })

  it('survives an absent projection without moving anyone', () => {
    expect(presenceStands(null, [], homes(), 5)).toEqual([])
    expect(presenceStands(undefined, [], homes(), 5)).toEqual([])
  })
})

describe('presence — the commute', () => {
  it('runs home → the authored road route → the exact standing point', () => {
    const stands = presenceStands(projection([person()]), [], homes(), LOT_PRESENCE_STATIC_BEAT)
    const stand = stands[0]!
    const interior = PRESENCE_ROUTES.talent.writers!
    expect(stand.path[0]).toEqual(TALENT_HOME)
    expect(stand.path.at(-1)).toEqual(stand.destination)
    expect(stand.path.slice(1, -1)).toEqual([...interior])
  })

  it('degrades to a straight approach when a site has no authored route', () => {
    const site = {
      kind: 'placed' as const,
      placedId: 9,
      routeTo: 'theater' as const,
      work: { gx: 12, gy: 12 },
      wait: { gx: 13, gy: 13 },
    }
    // Every authored place HAS a route, so this is the defensive arm only: a route
    // table entry that is somehow absent must still produce a usable two-point path.
    const path = presencePath('talent', TALENT_HOME, { ...site, routeTo: 'theater' }, site.work)
    expect(path[0]).toEqual(TALENT_HOME)
    expect(path.at(-1)).toEqual(site.work)
  })
})

describe('presence — the occupant count on the sign', () => {
  it('counts everyone the engine puts AT a place, including uncontracted people', () => {
    const counts = presenceOccupantCounts(
      projection([
        person(),
        person({ talentId: 'talent-2', slot: 1 }),
        person({
          talentId: 'talent-3',
          engagement: 'casting',
          credit: 'auditionee',
          ownerId: 'casting-1',
          facilityId: 'facility-soundstage-07',
        }),
      ]),
      [],
    )
    expect(counts.byBuilding.get('writers')).toBe(2)
    expect(counts.byBuilding.get('stage-a')).toBe(1)
    expect(counts.byPlacement.size).toBe(0)
  })

  it('never counts a queued person as being inside the building', () => {
    const counts = presenceOccupantCounts(
      projection([person({ beats: workWeek(1, 'waiting'), blockedReason: 'awaiting x' })]),
      [],
    )
    expect(counts.byBuilding.size).toBe(0)
    expect(presenceWaiting(projection([person({ beats: workWeek(1, 'waiting') })]))).toHaveLength(1)
  })

  it('counts a placed annex against its own placement, not a building', () => {
    const placed = placedAnnex()
    const counts = presenceOccupantCounts(
      projection([person({ facilityId: placed.facilityId })]),
      [placed],
    )
    expect(counts.byBuilding.size).toBe(0)
    expect(counts.byPlacement.get(1)).toBe(1)
  })
})

describe('presence — beats', () => {
  it('reads exactly the engine vocabulary and treats travel as not-yet-arrived', () => {
    expect(stanceForBeat('home')).toBe('home')
    expect(stanceForBeat('travel')).toBe('home')
    expect(stanceForBeat('at-site')).toBe('at-site')
    expect(stanceForBeat('waiting')).toBe('waiting')
    expect(stanceForBeat(undefined)).toBe('home')
  })

  it('puts the static beat inside the window where every claimed person has arrived', () => {
    const beats = workWeek(2, 'at-site')
    expect(beats[LOT_PRESENCE_STATIC_BEAT]).toBe('at-site')
    // …for every legal departure the engine can stagger to.
    for (const departure of [0, 1, 2]) {
      expect(workWeek(departure, 'at-site')[LOT_PRESENCE_STATIC_BEAT]).toBe('at-site')
    }
  })
})
