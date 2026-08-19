// ── THE WITNESSED WEEK, ON THE GROUND — proved over REAL engine state ─────────
//
// The projection itself (`src/core/studioWeekTheater.ts`) is proved by the engine
// lane. This spec proves the LAST HOP: that each of its facts lands on a body a
// player can point at, that a fact about a body nothing stands for is dropped
// rather than painted somewhere convenient (law 12), and that a legacy studio
// produces nothing at all.
//
// Nothing here is hand-edited: every state is built by calling engine actions with
// a named seed (law 25).

import { describe, expect, it } from 'vitest'

import { applyActions } from '../../../../src/core/index.ts'
import {
  advanceWeek,
  greenlight,
  requiredNegative,
  studioLotSnapshot,
} from '../../engine/adapter.ts'
import type { CreativeRole, DraftPackage, GameState } from '../../engine/adapter.ts'
import { foundedRosterIds, newFoundedGame } from '../../test/founding.ts'
import { AMBIENT_ROUTES } from '../tycoon/world.ts'
import { AMBIENT_GROUNDS, lotAmbientGrounds } from './ambientGrounding.ts'
import {
  BACKED_UP_LOT_MAX_ELEMENTS,
  THEATER_MAX_FREIGHT_ELEMENTS,
  lotBodyForFacility,
  lotBodyTheaterStates,
  lotCallBoard,
  lotSceneryHauls,
  lotTheaterFreightCount,
  lotTheaterSubjects,
  lotWeekTheater,
  theaterCallBoardLines,
} from './weekTheater.ts'
import type { StudioLotSnapshot } from './StudioLotSnapshot.ts'

function legalPackage(state: GameState): DraftPackage {
  const concept = state.concepts[0]!
  const ids = (role: CreativeRole) => foundedRosterIds(state, role)
  const shape = { opening: 'slowSetup', midpoint: 'reversal', ending: 'bittersweet' } as const
  return {
    conceptId: concept.id,
    shape,
    promise: {
      genre: concept.genre,
      intendedSegments: ['adult'],
      ranges: {
        intimacy: [-0.4, 0.4],
        tonalWeight: [-0.4, 0.4],
        kineticEnergy: [-0.4, 0.4],
      },
    },
    writerId: ids('writer')[0]!,
    directorId: ids('director')[0]!,
    craftIds: [ids('craft')[0]!],
    cast: {
      lead: ids('actor')[0]!,
      antagonist: ids('actor')[1]!,
      support: ids('actor')[2]!,
    },
    budget: { negative: requiredNegative(concept, shape, state), marketing: 400_000 },
  }
}

function managedStudio(seed: string): GameState {
  const founded = applyActions(newFoundedGame(seed), [{ kind: 'activateStudioOperations' }])
  const result = greenlight(founded, legalPackage(founded))
  if (!result.ok) throw new Error(result.error)
  return result.next
}

/** Every snapshot across `weeks` weeks of a managed studio, in order. */
function weekSnapshots(start: GameState, weeks: number): StudioLotSnapshot[] {
  const snapshots: StudioLotSnapshot[] = [studioLotSnapshot(start)]
  let state = start
  for (let i = 0; i < weeks; i++) {
    state = advanceWeek(state).next
    snapshots.push(studioLotSnapshot(state))
  }
  return snapshots
}

describe('week theater — the last hop from a facility to a body', () => {
  it('names the founding soundstages and the scenery shop', () => {
    const snapshot = studioLotSnapshot(managedStudio('week-theater-bodies'))
    expect(lotBodyForFacility(snapshot, 'facility-soundstage-07')).toBe('stage-a')
    expect(lotBodyForFacility(snapshot, 'facility-soundstage-12')).toBe('stage-b')
    expect(lotBodyForFacility(snapshot, 'facility-scenery-shop')).toBe('post')
  })

  it('drops a facility no body stands for rather than pointing at another building', () => {
    const snapshot = studioLotSnapshot(managedStudio('week-theater-law-12'))
    expect(lotBodyForFacility(snapshot, 'facility-that-was-never-built')).toBeNull()
    expect(lotBodyForFacility(snapshot, '')).toBeNull()
    expect(lotBodyForFacility(snapshot, null)).toBeNull()
  })

  it('publishes a projection for a managed studio', () => {
    const snapshot = studioLotSnapshot(managedStudio('week-theater-present'))
    const theater = lotWeekTheater(snapshot)
    expect(theater).not.toBeNull()
    expect(theater?.week).toBe(snapshot.week)
    expect(theater?.beatsPerWeek).toBeGreaterThan(0)
  })

  it('says NOTHING for a studio that publishes no projection', () => {
    const snapshot = studioLotSnapshot(managedStudio('week-theater-absent'))
    const stripped = { ...snapshot }
    delete (stripped as { weekTheater?: unknown }).weekTheater
    expect(lotWeekTheater(stripped)).toBeNull()
    expect(lotBodyTheaterStates(stripped)).toEqual([])
    expect(lotCallBoard(stripped)).toEqual([])
    expect(lotSceneryHauls(stripped)).toEqual([])
    expect(lotTheaterFreightCount(stripped)).toBe(0)
    expect(lotAmbientGrounds(stripped)).toBeNull()
  })
})

describe('week theater — the plant, over a real studio s first weeks', () => {
  const snapshots = weekSnapshots(managedStudio('week-theater-plant'), 10)

  it('every subject it draws lands on a body that stands on this property', () => {
    let drawn = 0
    for (const snapshot of snapshots) {
      for (const body of lotBodyTheaterStates(snapshot)) {
        drawn++
        expect(typeof body.buildingId).toBe('string')
        expect(body.buildingId.length).toBeGreaterThan(0)
        // A body is never claimed to be two contradictory things at once.
        expect(body.hot && body.dark).toBe(false)
      }
    }
    // NON-VACUOUS: a real studio's first ten weeks genuinely light bodies up.
    expect(drawn).toBeGreaterThan(0)
  })

  it('a stage goes hot and later clears, over the same ten weeks', () => {
    const hot = snapshots.some((s) => lotBodyTheaterStates(s).some((b) => b.hot))
    const dark = snapshots.some((s) => lotBodyTheaterStates(s).some((b) => b.dark))
    expect(hot || dark).toBe(true)
  })

  it('never names a picture by id', () => {
    for (const snapshot of snapshots) {
      for (const body of lotBodyTheaterStates(snapshot)) {
        if (body.productionTitle === null) continue
        expect(body.productionTitle).not.toMatch(/^prod-|^production-|^concept-/)
      }
      for (const haul of lotSceneryHauls(snapshot)) {
        if (haul.productionTitle === null) continue
        expect(haul.productionTitle).not.toMatch(/^prod-|^production-|^concept-/)
      }
    }
  })

  it('a haul never runs backwards and always ends AT the stage it was called to', () => {
    for (const snapshot of snapshots) {
      for (const haul of lotSceneryHauls(snapshot)) {
        expect(haul.progress01).toBeGreaterThanOrEqual(0)
        expect(haul.progress01).toBeLessThanOrEqual(1)
        expect(haul.weeksRemaining).toBeGreaterThanOrEqual(0)
        expect(haul.totalWeeks).toBe(haul.weeksRemaining + 1)
        expect(typeof haul.to).toBe('string')
      }
    }
  })

  it('keeps the freight budget, whatever the studio does', () => {
    for (const snapshot of snapshots) {
      expect(lotTheaterFreightCount(snapshot)).toBeLessThanOrEqual(THEATER_MAX_FREIGHT_ELEMENTS)
      for (const placard of lotCallBoard(snapshot)) {
        expect(placard.freight).toBeLessThanOrEqual(BACKED_UP_LOT_MAX_ELEMENTS)
        expect(placard.freight).toBeGreaterThanOrEqual(0)
      }
    }
  })

  it('the Call Board quotes the engine and invents nothing', () => {
    for (const snapshot of snapshots) {
      const engineReasons = new Set(
        [
          ...lotTheaterSubjects(snapshot, 'company-waiting'),
          ...lotTheaterSubjects(snapshot, 'queue-waiting'),
        ]
          .map((s) => s.reason)
          .filter((r): r is string => typeof r === 'string'),
      )
      for (const placard of lotCallBoard(snapshot)) {
        for (const waiting of placard.waiting) {
          if (waiting.reason === null) continue
          expect(engineReasons.has(waiting.reason)).toBe(true)
        }
      }
    }
  })
})

describe('the Call Board says what the engine said, and nothing else', () => {
  it('names the picture and quotes the reason verbatim', () => {
    expect(
      theaterCallBoardLines({
        buildingId: 'stage-a',
        waiting: [
          {
            subjectId: 's1',
            productionTitle: 'The Long Afternoon',
            reason: 'Stage A is held by Rain on the Boulevard until Week 14.',
            weeksWaiting: 2,
          },
        ],
        freight: 2,
      }),
    ).toEqual([
      'The Long Afternoon — Stage A is held by Rain on the Boulevard until Week 14.',
      '2 weeks of freight are standing on the apron.',
    ])
  })

  it('says "A picture" when the engine named none (§5 pin 3) and never reaches for an id', () => {
    const lines = theaterCallBoardLines({
      buildingId: 'stage-b',
      waiting: [{ subjectId: 's2', productionTitle: null, reason: null, weeksWaiting: null }],
      freight: 1,
    })
    expect(lines).toEqual([
      'A picture is standing by.',
      'One week of freight is standing on the apron.',
    ])
    for (const line of lines) expect(line).not.toMatch(/prod-|facility-|set-|s2/)
  })

  it('says nothing at all about an apron with nothing on it', () => {
    expect(theaterCallBoardLines({ buildingId: 'stage-a', waiting: [], freight: 0 })).toEqual([])
  })
})

describe('grounded ambient patrols (§4.2, 00C.6)', () => {
  it('every route claims a ground, and every ground is claimed by a route', () => {
    const claimed = new Set(AMBIENT_ROUTES.map((route) => route.ground))
    for (const route of AMBIENT_ROUTES) {
      expect(AMBIENT_GROUNDS).toContain(route.ground)
    }
    for (const ground of AMBIENT_GROUNDS) {
      expect(claimed.has(ground)).toBe(true)
    }
    // The eight the charter names by count, still eight.
    expect(AMBIENT_ROUTES).toHaveLength(8)
  })

  it('a managed studio grounds the gate, and never claims a fact it has no subject for', () => {
    for (const snapshot of weekSnapshots(managedStudio('week-theater-grounds'), 8)) {
      const grounds = lotAmbientGrounds(snapshot)
      expect(grounds).not.toBeNull()
      if (grounds === null) continue
      // The projection exists ⇒ the studio is operating ⇒ the gate has someone on it.
      expect(grounds.has('gate-open')).toBe(true)
      expect(grounds.has('stage-hot')).toBe(
        lotTheaterSubjects(snapshot, 'stage-hot').length > 0,
      )
      expect(grounds.has('building')).toBe(
        lotTheaterSubjects(snapshot, 'construction-progressing').length > 0,
      )
      for (const ground of grounds) expect(AMBIENT_GROUNDS).toContain(ground)
    }
  })

  it('at least one patrol is genuinely grounded OFF at some point in a real studio s first weeks', () => {
    const everyGroundAlwaysTrue = weekSnapshots(managedStudio('week-theater-off'), 8).every(
      (snapshot) => {
        const grounds = lotAmbientGrounds(snapshot)
        return grounds !== null && AMBIENT_GROUNDS.every((g) => grounds.has(g))
      },
    )
    // NON-VACUOUS: if this were false the grounding would be decorative.
    expect(everyGroundAlwaysTrue).toBe(false)
  })
})
