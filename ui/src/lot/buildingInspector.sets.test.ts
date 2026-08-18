// ── C2a-M2 — what a stage and a scenery shop SAY when a player clicks them ────
//
// The world paints a badge; this panel is where the same facts arrive as prose with a
// remedy attached. Two claims, and one of them is a repair:
//
//   1. a stage names the set built inside it, or says plainly that nothing is — and a
//      set too worn to shoot on says what to do about it;
//   2. a scenery shop with a crew building a set STOPS SAYING IT IS IDLE. The Studio
//      Calendar carries productions, screenplays and auditions and has never carried
//      sets, so before this a shop with a crew inside it reported "nothing is booked in
//      here this week" — a sentence that was not true at its state (G12).

import { describe, expect, it } from 'vitest'
import type {
  LotPlacedFacilityState,
  LotSetState,
  StudioLotSnapshot,
} from './snapshot/StudioLotSnapshot.ts'
import { lotBuildingInspectorContext } from './buildingInspector.ts'

function set(overrides: Partial<LotSetState> = {}): LotSetState {
  return {
    id: 'set-0',
    name: 'Graveyard',
    locationLabel: 'Graveyard',
    mountedOnFacilityId: 'facility-soundstage-07',
    status: 'standing',
    repairing: false,
    completesWeek: null,
    weeksRemaining: 0,
    quality: 62,
    condition: 91,
    novelty: 0.85,
    usable: true,
    sceneryFacilityId: null,
    ...overrides,
  }
}

function placedShop(overrides: Partial<LotPlacedFacilityState> = {}): LotPlacedFacilityState {
  const cells: { gx: number; gy: number }[] = []
  for (let gy = 20; gy <= 21; gy++) for (let gx = 3; gx <= 5; gx++) cells.push({ gx, gy })
  return {
    id: 6,
    blueprintId: 'scenery-shop',
    capability: 'set-scenery',
    name: 'Scenery Shop 2',
    facilityId: 'facility-scenery-shop-1',
    parcelId: 'west-lawn',
    origin: { gx: 3, gy: 20 },
    cells,
    status: 'operational',
    placedWeek: 20,
    completesWeek: 31,
    weeksRemaining: 0,
    progress01: 1,
    weeklyOperatingCost: 4_000,
    ...overrides,
  }
}

function snapshot(
  sets: LotSetState[] | undefined,
  placements: LotPlacedFacilityState[] = [],
): StudioLotSnapshot {
  return {
    studioName: 'Project Studio',
    week: 20,
    cash: 4_000_000,
    cashBand: 'stable',
    standing: 'finding-footing',
    standingValues: { awareness: 20, prestige: 20, confidence: 20 },
    publicityOffers: [],
    annexWork: null,
    ...(sets === undefined ? {} : { sets }),
    activeProductions: [],
    releasedFilms: [],
    releasePresence: 'none',
    latestReleaseTitle: null,
    people: [],
    buildings: [],
    selectedBuildingId: null,
    sceneSeed: 'inspector-sets',
    placement: {
      placements,
      parcels: [{ id: 'west-lawn', label: 'The west lawn' }],
    },
    property: {
      bounds: { width: 28, depth: 26 },
      buildings: placements.map((placed) => ({
        id: `placed-${String(placed.id)}`,
        label: placed.name,
        role: 'placed',
        origin: placed.origin,
        footprint: { width: 3, depth: 2 },
        placedFacilityId: placed.id,
        blueprintId: placed.blueprintId,
        capability: placed.capability,
        status: placed.status,
      })),
    },
  } as unknown as StudioLotSnapshot
}

const detailFor = (context: { facts: { key: string; detail: string }[] }, key: string): string | null =>
  context.facts.find((fact) => fact.key === key)?.detail ?? null

describe('C2a-M2 — a stage names the set built inside it', () => {
  it('prints the set, its location and the three numbers a player weighs', () => {
    const context = lotBuildingInspectorContext(snapshot([set()]), 'stage-a', null, null)
    expect(detailFor(context, 'set:state')).toBe('Graveyard is standing, in good repair.')
    // The LOCATION is the term — "Graveyard", the studio's own word for the kind of
    // place — and the three numbers are the detail beside it.
    expect(context.facts.find((fact) => fact.key === 'set:stats')?.term).toBe('Graveyard')
    expect(detailFor(context, 'set:stats')).toBe('Quality 62 · Condition 91 · Freshness 85%')
  })

  it('says plainly when nothing is mounted, and what that costs', () => {
    const context = lotBuildingInspectorContext(snapshot([set()]), 'stage-b', null, null)
    expect(detailFor(context, 'set:state')).toBe(
      'No set is mounted here — nothing can be filmed on this stage until one is built.',
    )
    // Nothing to print stats about, and none are invented.
    expect(detailFor(context, 'set:stats')).toBeNull()
  })

  it('a set too worn to shoot on says what to do about it', () => {
    const context = lotBuildingInspectorContext(
      snapshot([set({ condition: 26, usable: false })]),
      'stage-a',
      null,
      null,
    )
    expect(detailFor(context, 'set:state')).toBe(
      'Graveyard is too worn to shoot on. Repair it before another picture can stand on it.',
    )
    // Still standing, so its numbers are still worth printing — that is how a player
    // sees the condition that caused the refusal.
    expect(detailFor(context, 'set:stats')).toContain('Condition 26')
  })

  it('counts the engine’s weeks while a set is going up, and tells build from repair', () => {
    const going = lotBuildingInspectorContext(
      snapshot([set({ status: 'under-construction', condition: 0, weeksRemaining: 3 })]),
      'stage-a',
      null,
      null,
    )
    expect(detailFor(going, 'set:state')).toBe('Graveyard is going up — 3 weeks to go.')
    const mending = lotBuildingInspectorContext(
      snapshot([set({ status: 'under-construction', repairing: true, condition: 30, weeksRemaining: 1 })]),
      'stage-a',
      null,
      null,
    )
    expect(detailFor(mending, 'set:state')).toBe('Graveyard is being repaired — 1 week to go.')
  })

  it('a snapshot with no sets root claims nothing about any stage', () => {
    // Fail-neutral: the engine has told this panel nothing, so "no set is mounted here"
    // would be a claim rather than a report.
    const context = lotBuildingInspectorContext(snapshot(undefined), 'stage-a', null, null)
    expect(context.facts.some((fact) => fact.key.startsWith('set:'))).toBe(false)
    // …and the sentence the founding stages have always said is untouched.
    expect(context.status).toBe('The stage is dark — no picture is shooting here.')
  })
})

describe('C2a-M2 — a shop with a crew in it stops reporting itself idle', () => {
  it('the founding Scenery & Post block names the work its crew holds', () => {
    const context = lotBuildingInspectorContext(
      snapshot([
        set({
          id: 'set-4',
          status: 'under-construction',
          condition: 0,
          weeksRemaining: 2,
          sceneryFacilityId: 'facility-scenery-shop',
        }),
      ]),
      'post',
      null,
      null,
    )
    expect(detailFor(context, 'scenery:facility-scenery-shop')).toBe(
      'The scenery crew is building Graveyard — 2 weeks to go.',
    )
    expect(context.status).toBe('The scenery crew is building Graveyard — 2 weeks to go.')
  })

  it('a shop the studio BUILT reports its own crew, and never the other shop’s', () => {
    const placed = placedShop()
    const context = lotBuildingInspectorContext(
      snapshot(
        [
          set({
            id: 'set-4',
            status: 'under-construction',
            condition: 0,
            weeksRemaining: 4,
            sceneryFacilityId: 'facility-scenery-shop-1',
          }),
        ],
        [placed],
      ),
      'placed-6',
      null,
      null,
    )
    expect(detailFor(context, 'scenery:facility-scenery-shop-1')).toBe(
      'The scenery crew is building Graveyard — 4 weeks to go.',
    )
    // THE REPAIR: with no Calendar in hand this said "Scenery Shop 2 is operational."
    // while a crew was inside it. It reports the work now.
    expect(context.status).toBe('Work is under way in Scenery Shop 2.')
    // The founding block is not doing this job and does not claim it.
    const founding = lotBuildingInspectorContext(
      snapshot(
        [
          set({
            id: 'set-4',
            status: 'under-construction',
            condition: 0,
            weeksRemaining: 4,
            sceneryFacilityId: 'facility-scenery-shop-1',
          }),
        ],
        [placed],
      ),
      'post',
      null,
      null,
    )
    expect(founding.facts.some((fact) => fact.key.startsWith('scenery:'))).toBe(false)
    expect(founding.status).toBe('The shop and the cutting rooms are quiet.')
  })

  it('a quiet shop still says it is quiet', () => {
    const context = lotBuildingInspectorContext(snapshot([set()], [placedShop()]), 'placed-6', null, null)
    expect(context.facts.some((fact) => fact.key.startsWith('scenery:'))).toBe(false)
    expect(context.status).toBe('Scenery Shop 2 is operational.')
  })
})
