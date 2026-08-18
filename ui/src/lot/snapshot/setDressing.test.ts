// ── C2a-M2 §3.1/§4.2 — what the property says about what is standing on it ────
//
// Three claims, and the whole of the world's set legibility rests on them:
//
//   1. every stage says what is on it — INCLUDING a stage with nothing on it, which is
//      the single most actionable fact about a studio that cannot start a picture;
//   2. the words are the studio's own and the JUDGEMENTS are the engine's: the "too worn
//      to shoot on" line follows `usable`, never a threshold this module re-derives;
//   3. set work is ATTRIBUTED to the shop the engine assigned, never broadcast to every
//      shop on the lot.

import { describe, expect, it } from 'vitest'
import type {
  LotSetState,
  LotStageIdentity,
  LotWeekEvent,
  StudioLotSnapshot,
} from './StudioLotSnapshot.ts'
import {
  LOT_SET_CONDITION_GOOD_AT_LEAST,
  lotSetDressingFor,
  lotSetDressings,
  lotSetMountedOn,
  lotSetWorkByShop,
  lotWeekEvents,
} from './setDressing.ts'

const STAGE_SEVEN: LotStageIdentity = {
  facilityId: 'facility-soundstage-07',
  facilityName: 'Soundstage 7',
  buildingId: 'stage-a',
  origin: 'founding',
  standing: true,
}

const STAGE_TWELVE: LotStageIdentity = {
  facilityId: 'facility-soundstage-12',
  facilityName: 'Soundstage 12',
  buildingId: 'stage-b',
  origin: 'founding',
  standing: true,
}

function set(overrides: Partial<LotSetState> = {}): LotSetState {
  return {
    id: 'set-0',
    name: 'Stage 7 House Set',
    locationLabel: 'Generic Interior',
    mountedOnFacilityId: 'facility-soundstage-07',
    status: 'standing',
    repairing: false,
    completesWeek: null,
    weeksRemaining: 0,
    quality: 45,
    condition: 100,
    novelty: 1,
    usable: true,
    sceneryFacilityId: null,
    ...overrides,
  }
}

function snapshot(
  sets: LotSetState[],
  stages: LotStageIdentity[] = [STAGE_SEVEN, STAGE_TWELVE],
  weekEvents: LotWeekEvent[] = [],
): StudioLotSnapshot {
  return {
    studioName: 'Project Studio',
    week: 12,
    cash: 5_000_000,
    cashBand: 'stable',
    standing: 'finding-footing',
    standingValues: { awareness: 20, prestige: 20, confidence: 20 },
    publicityOffers: [],
    annexWork: null,
    stages,
    sets,
    weekEvents,
    activeProductions: [],
    releasedFilms: [],
    releasePresence: 'none',
    latestReleaseTitle: null,
    people: [],
    buildings: [],
    selectedBuildingId: null,
    sceneSeed: 'set-dressing',
  } as unknown as StudioLotSnapshot
}

describe('C2a-M2 — every stage says what is standing on it', () => {
  it('a bare stage says so, because that is the fact that stops a picture', () => {
    const dressing = lotSetDressingFor(snapshot([set()]), 'stage-b')
    expect(dressing?.state).toBe('no-set')
    expect(dressing?.lines).toEqual(['NO SET MOUNTED'])
  })

  it('a stage that was emptied THIS WEEK says why', () => {
    const struck = set({ id: 'set-9', status: 'retired', mountedOnFacilityId: 'facility-soundstage-12' })
    const dressing = lotSetDressingFor(
      snapshot([set(), struck], [STAGE_SEVEN, STAGE_TWELVE], [{ kind: 'setRetired', setId: 'set-9' }]),
      'stage-b',
    )
    expect(dressing?.state).toBe('no-set')
    expect(dressing?.lines).toEqual(['NO SET MOUNTED', 'SET STRUCK THIS WEEK'])
  })

  it('names the set, its state and its repair, in the studio’s own words', () => {
    const fresh = lotSetDressingFor(snapshot([set({ name: 'Graveyard' })]), 'stage-a')
    expect(fresh?.state).toBe('standing')
    expect(fresh?.lines).toEqual(['GRAVEYARD · STANDING · GOOD REPAIR'])

    // One wear step below the named boundary: still usable, and it says so honestly.
    const worn = lotSetDressingFor(
      snapshot([set({ name: 'Graveyard', condition: LOT_SET_CONDITION_GOOD_AT_LEAST - 1 })]),
      'stage-a',
    )
    expect(worn?.state).toBe('worn')
    expect(worn?.lines).toEqual(['GRAVEYARD · STANDING · SHOWING WEAR'])
  })

  it('follows the ENGINE’s usable flag, never a threshold of its own', () => {
    // Condition well above the presentation boundary, but the engine says NO. The
    // engine wins, and the line carries the remedy.
    const dressing = lotSetDressingFor(
      snapshot([set({ name: 'Graveyard', condition: 99, usable: false })]),
      'stage-a',
    )
    expect(dressing?.state).toBe('needs-repair')
    expect(dressing?.lines).toEqual(['GRAVEYARD · TOO WORN TO SHOOT ON · REPAIR IT'])
  })

  it('tells a first build apart from a repair, and counts the engine’s weeks', () => {
    const building = lotSetDressingFor(
      snapshot([
        set({
          name: 'Graveyard',
          status: 'under-construction',
          repairing: false,
          condition: 0,
          weeksRemaining: 3,
          completesWeek: 15,
        }),
      ]),
      'stage-a',
    )
    expect(building?.state).toBe('building')
    expect(building?.lines).toEqual(['GRAVEYARD · GOING UP · 3 WEEKS'])

    const repairing = lotSetDressingFor(
      snapshot([
        set({
          name: 'Graveyard',
          status: 'under-construction',
          repairing: true,
          condition: 30,
          weeksRemaining: 1,
          completesWeek: 13,
        }),
      ]),
      'stage-a',
    )
    expect(repairing?.state).toBe('repairing')
    expect(repairing?.lines).toEqual(['GRAVEYARD · IN REPAIR · 1 WEEK'])
  })

  it('marks the week a set went up', () => {
    const dressing = lotSetDressingFor(
      snapshot([set({ id: 'set-4', name: 'Graveyard' })], undefined, [
        { kind: 'setBuilt', setId: 'set-4' },
      ]),
      'stage-a',
    )
    expect(dressing?.state).toBe('new')
    expect(dressing?.lines).toEqual(['GRAVEYARD · STANDING · BUILT THIS WEEK'])
  })

  it('a wrap is the stage’s own news, under the dressing line', () => {
    const dressing = lotSetDressingFor(
      snapshot([set({ name: 'Graveyard', condition: 91 })], undefined, [
        {
          kind: 'wrapped',
          title: 'Ravine',
          stageFacilityId: 'facility-soundstage-07',
          setId: 'set-0',
        },
      ]),
      'stage-a',
    )
    expect(dressing?.lines).toEqual([
      'GRAVEYARD · STANDING · GOOD REPAIR',
      'RAVINE WRAPPED HERE THIS WEEK',
    ])
    // …and it is the WRAPPING stage's news, nobody else's.
    expect(lotSetDressingFor(snapshot([set()], undefined, [
      { kind: 'wrapped', title: 'Ravine', stageFacilityId: 'facility-soundstage-07', setId: null },
    ]), 'stage-b')?.lines).toEqual(['NO SET MOUNTED'])
  })

  it('a stage still under construction has no dressing to report', () => {
    const site: LotStageIdentity = { ...STAGE_TWELVE, standing: false }
    expect(lotSetDressings(snapshot([set()], [STAGE_SEVEN, site]))).toHaveLength(1)
    expect(lotSetDressingFor(snapshot([set()], [STAGE_SEVEN, site]), 'stage-b')).toBeNull()
  })

  it('withholds rather than guesses: two live sets on one stage name neither', () => {
    const doubled = snapshot([set({ id: 'set-0' }), set({ id: 'set-1' })])
    expect(lotSetMountedOn(doubled, 'facility-soundstage-07')).toBeNull()
    expect(lotSetDressingFor(doubled, 'stage-a')?.state).toBe('no-set')
  })

  it('a retired set is not mounted on anything', () => {
    expect(lotSetMountedOn(snapshot([set({ status: 'retired' })]), 'facility-soundstage-07')).toBeNull()
  })
})

describe('C2a-M2 — set work is attributed to the shop doing it', () => {
  it('names the work at the shop the engine assigned, and nowhere else', () => {
    const work = lotSetWorkByShop(
      snapshot([
        set({
          id: 'set-4',
          name: 'Graveyard',
          status: 'under-construction',
          weeksRemaining: 2,
          sceneryFacilityId: 'facility-scenery-shop',
        }),
        set({
          id: 'set-5',
          name: 'City Street',
          status: 'under-construction',
          repairing: true,
          weeksRemaining: 1,
          sceneryFacilityId: 'facility-craft-annex-1',
        }),
      ]),
    )
    expect(work.get('facility-scenery-shop')?.line).toBe('BUILDING GRAVEYARD · 2 WEEKS')
    expect(work.get('facility-craft-annex-1')?.line).toBe('REPAIRING CITY STREET · 1 WEEK')
    expect(work.get('facility-post-building')).toBeUndefined()
  })

  it('counts rather than picks when one shop holds more than one job', () => {
    const work = lotSetWorkByShop(
      snapshot([
        set({ id: 'set-4', status: 'under-construction', sceneryFacilityId: 'facility-scenery-shop' }),
        set({ id: 'set-5', status: 'under-construction', sceneryFacilityId: 'facility-scenery-shop' }),
      ]),
    )
    expect(work.get('facility-scenery-shop')?.line).toBe('2 SETS UNDER WAY')
    expect(work.get('facility-scenery-shop')?.sets).toHaveLength(2)
  })

  it('a set whose shop the engine could not name points at no building at all', () => {
    const work = lotSetWorkByShop(
      snapshot([set({ status: 'under-construction', sceneryFacilityId: null })]),
    )
    expect(work.size).toBe(0)
  })

  it('a standing set is not work', () => {
    expect(lotSetWorkByShop(snapshot([set({ sceneryFacilityId: 'facility-scenery-shop' })])).size).toBe(0)
  })
})

describe('C2a-M2 — a snapshot that carries none of this claims none of it', () => {
  it('an older presentation fixture with no sets root reports nothing', () => {
    const bare = { ...snapshot([]) } as Record<string, unknown>
    delete bare.sets
    delete bare.weekEvents
    const legacy = bare as unknown as StudioLotSnapshot
    expect(lotWeekEvents(legacy)).toEqual([])
    // Every stage still reports — and reports the truth, which is that nothing is on it.
    expect(lotSetDressings(legacy).map((dressing) => dressing.lines)).toEqual([
      ['NO SET MOUNTED'],
      ['NO SET MOUNTED'],
    ])
  })

  it('a malformed row is dropped, not printed', () => {
    const hostile = snapshot([set()], undefined, [
      { kind: 'wrapped', title: '', stageFacilityId: 'facility-soundstage-07', setId: null },
      { kind: 'setBuilt', setId: '' },
    ] as LotWeekEvent[])
    expect(lotWeekEvents(hostile)).toEqual([])
    expect(lotSetDressingFor(hostile, 'stage-a')?.lines).toEqual([
      'STAGE 7 HOUSE SET · STANDING · GOOD REPAIR',
    ])
  })
})
