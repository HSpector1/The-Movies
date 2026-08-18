// ── C2a-M2 §3.1 — the world stops being hard-wired to two soundstages ─────────
//
// The defect this file is the acceptance surface for: until this milestone the lot
// answered "which bodies are stages" from a two-entry table, and a studio that built a
// third soundstage did not render it — `studioLotSnapshot` THREW. Four more closed
// vocabularies mirrored that table, so opening one and not the others would only have
// moved the throw.
//
// The rule everything else reads is here, and it is derived from two authorities: the
// engine's own `operations.facilities`, and the bodies the placement projection says
// stand for them. Three is the count that matters — two is where a "one extra"
// assumption hides and three is where it dies (the C1-M1b precedent, same family).
//
// The founding half is a REGRESSION surface: every assertion about `stage-a`/`stage-b`
// below is what the closed table already produced, and it must stay byte-identical.

import { describe, expect, it } from 'vitest'
import {
  FOUNDING_STAGE_BUILDING_IDS,
  deriveLotStageIdentities,
  isLotStageBuildingId,
  lotStageBuildingIds,
  lotStageIdentities,
  lotStageIdentityFor,
  type StageIdentityFacility,
  type StageIdentityPlacement,
} from './stageIdentity.ts'
import type { LotStageIdentity, StudioLotSnapshot } from './StudioLotSnapshot.ts'
import { StageAssignment } from './stageAssignment.ts'
import {
  activeStageBuildingId,
  journeyStageBuildingIds,
  journeyTargetBuildingId,
} from './firstFilmJourney.ts'

const LEGACY_ANNEX_PARCEL = 'expansion'

/** The five facilities every managed studio is founded with, in engine order. */
const FOUNDING_FACILITIES: StageIdentityFacility[] = [
  { id: 'facility-development-casting', name: 'Development & Casting', capability: 'development-casting' },
  { id: 'facility-post-building', name: 'Post Building', capability: 'post' },
  { id: 'facility-scenery-shop', name: 'Scenery Shop', capability: 'set-scenery' },
  { id: 'facility-soundstage-07', name: 'Soundstage 7', capability: 'soundstage' },
  { id: 'facility-soundstage-12', name: 'Soundstage 12', capability: 'soundstage' },
]

function builtStage(
  placementId: number,
  facilityId: string,
  status: StageIdentityPlacement['status'] = 'operational',
): StageIdentityPlacement {
  return { id: placementId, facilityId, parcelId: 'south-lawn', status }
}

function snapshot(overrides: Record<string, unknown> = {}): StudioLotSnapshot {
  return {
    studioName: 'Project Studio',
    week: 40,
    cash: 9_000_000,
    cashBand: 'stable',
    standing: 'established',
    standingValues: { awareness: 40, prestige: 50, confidence: 60 },
    publicityOffers: [],
    annexWork: null,
    activeProductions: [],
    releasedFilms: [],
    releasePresence: 'none',
    latestReleaseTitle: null,
    people: [],
    buildings: [],
    selectedBuildingId: null,
    sceneSeed: 'stage-identity',
    operationsMode: 'managed',
    stageAssignmentAuthority: 'engine',
    productionOperations: [],
    ...overrides,
  } as StudioLotSnapshot
}

describe('C2a-M2 — a studio has as many soundstages as it has BUILT', () => {
  it('reproduces the founding two exactly, in engine facility order', () => {
    expect(deriveLotStageIdentities(FOUNDING_FACILITIES, [], LEGACY_ANNEX_PARCEL)).toEqual([
      {
        facilityId: 'facility-soundstage-07',
        facilityName: 'Soundstage 7',
        buildingId: 'stage-a',
        origin: 'founding',
        standing: true,
      },
      {
        facilityId: 'facility-soundstage-12',
        facilityName: 'Soundstage 12',
        buildingId: 'stage-b',
        origin: 'founding',
        standing: true,
      },
    ])
  })

  it('gives a THIRD, FOURTH and FIFTH soundstage its own body and the engine’s own name', () => {
    const facilities: StageIdentityFacility[] = [
      ...FOUNDING_FACILITIES,
      { id: 'facility-soundstage-3', name: 'Soundstage 3', capability: 'soundstage' },
      { id: 'facility-soundstage-4', name: 'Soundstage 4', capability: 'soundstage' },
      { id: 'facility-soundstage-5', name: 'Soundstage 5', capability: 'soundstage' },
    ]
    const placements = [
      builtStage(7, 'facility-soundstage-3'),
      builtStage(9, 'facility-soundstage-4'),
      builtStage(11, 'facility-soundstage-5'),
    ]

    const derived = deriveLotStageIdentities(facilities, placements, LEGACY_ANNEX_PARCEL)

    expect(derived.map((stage) => stage.buildingId)).toEqual([
      'stage-a',
      'stage-b',
      'placed-7',
      'placed-9',
      'placed-11',
    ])
    // The engine facility name is the single spoken authority (§3.1); nothing invents one.
    expect(derived.map((stage) => stage.facilityName)).toEqual([
      'Soundstage 7',
      'Soundstage 12',
      'Soundstage 3',
      'Soundstage 4',
      'Soundstage 5',
    ])
    expect(derived.map((stage) => stage.origin)).toEqual([
      'founding',
      'founding',
      'placed',
      'placed',
      'placed',
    ])
    // Five distinct bodies. A duplicate here is the closed-table defect returning.
    expect(new Set(derived.map((stage) => stage.buildingId)).size).toBe(5)
  })

  it('names a soundstage still under construction, and says no body stands there yet', () => {
    const derived = deriveLotStageIdentities(
      [...FOUNDING_FACILITIES, { id: 'facility-soundstage-3', name: 'Soundstage 3', capability: 'soundstage' }],
      [builtStage(4, 'facility-soundstage-3', 'underConstruction')],
      LEGACY_ANNEX_PARCEL,
    )

    expect(derived[2]).toEqual({
      facilityId: 'facility-soundstage-3',
      facilityName: 'Soundstage 3',
      buildingId: 'placed-4',
      origin: 'placed',
      standing: false,
    })
    expect(derived.filter((stage) => stage.standing).map((stage) => stage.buildingId)).toEqual([
      'stage-a',
      'stage-b',
    ])
  })

  it('claims no place for a soundstage with no body on the property (law 12)', () => {
    const derived = deriveLotStageIdentities(
      [...FOUNDING_FACILITIES, { id: 'facility-soundstage-3', name: 'Soundstage 3', capability: 'soundstage' }],
      [],
      LEGACY_ANNEX_PARCEL,
    )

    expect(derived.map((stage) => stage.buildingId)).toEqual(['stage-a', 'stage-b'])
  })

  it('withholds a facility two placements both claim, rather than picking one', () => {
    const derived = deriveLotStageIdentities(
      [...FOUNDING_FACILITIES, { id: 'facility-soundstage-3', name: 'Soundstage 3', capability: 'soundstage' }],
      [builtStage(4, 'facility-soundstage-3'), builtStage(5, 'facility-soundstage-3')],
      LEGACY_ANNEX_PARCEL,
    )

    expect(derived.map((stage) => stage.buildingId)).toEqual(['stage-a', 'stage-b'])
  })

  it('is a question about SOUNDSTAGES, not about placements', () => {
    const derived = deriveLotStageIdentities(
      [
        ...FOUNDING_FACILITIES,
        { id: 'facility-post-building-2', name: 'Post Building 2', capability: 'post' },
        { id: 'facility-scenery-shop-2', name: 'Scenery Shop 2', capability: 'set-scenery' },
      ],
      [builtStage(2, 'facility-post-building-2'), builtStage(3, 'facility-scenery-shop-2')],
      LEGACY_ANNEX_PARCEL,
    )

    expect(derived.map((stage) => stage.buildingId)).toEqual(['stage-a', 'stage-b'])
  })

  it('leaves the legacy Annex parcel to the `expansion` place that already owns it', () => {
    const derived = deriveLotStageIdentities(
      [...FOUNDING_FACILITIES, { id: 'facility-soundstage-3', name: 'Soundstage 3', capability: 'soundstage' }],
      [{ id: 4, facilityId: 'facility-soundstage-3', parcelId: LEGACY_ANNEX_PARCEL, status: 'operational' }],
      LEGACY_ANNEX_PARCEL,
    )

    // The parcel body is not a first-class placed body, and there is no other body for
    // this facility — so it claims no place at all rather than two owners for one ground.
    expect(derived.map((stage) => stage.buildingId)).toEqual(['stage-a', 'stage-b'])
  })

  it('yields nothing at all for legacy operations, which hold no facilities', () => {
    expect(deriveLotStageIdentities([], [], LEGACY_ANNEX_PARCEL)).toEqual([])
  })
})

describe('C2a-M2 — reading the stages off a snapshot', () => {
  const THIRD: LotStageIdentity = {
    facilityId: 'facility-soundstage-3',
    facilityName: 'Soundstage 3',
    buildingId: 'placed-7',
    origin: 'placed',
    standing: true,
  }

  it('falls back to the founding two when a snapshot names no stages', () => {
    const snap = snapshot()
    expect(lotStageBuildingIds(snap)).toEqual(FOUNDING_STAGE_BUILDING_IDS)
    expect(lotStageIdentities(snap).map((stage) => stage.facilityName)).toEqual([
      'Soundstage 7',
      'Soundstage 12',
    ])
  })

  it('reads three stages when the snapshot carries three', () => {
    const snap = snapshot({
      stages: [...lotStageIdentities(snapshot())].concat(THIRD),
    })
    expect(lotStageBuildingIds(snap)).toEqual(['stage-a', 'stage-b', 'placed-7'])
    expect(isLotStageBuildingId(snap, 'placed-7')).toBe(true)
    expect(isLotStageBuildingId(snap, 'placed-9')).toBe(false)
    expect(isLotStageBuildingId(snap, 'post')).toBe(false)
    expect(lotStageIdentityFor(snap, 'placed-7')).toEqual(THIRD)
    expect(lotStageIdentityFor(snap, 'post')).toBeNull()
  })

  it('names neither of two identities claiming one body', () => {
    const snap = snapshot({ stages: [THIRD, { ...THIRD, facilityId: 'facility-soundstage-4' }] })
    expect(lotStageIdentityFor(snap, 'placed-7')).toBeNull()
  })
})

describe('C2a-M2 — the vocabularies that mirrored the closed table', () => {
  const stages: LotStageIdentity[] = [
    ...lotStageIdentities(snapshot()),
    {
      facilityId: 'facility-soundstage-3',
      facilityName: 'Soundstage 3',
      buildingId: 'placed-7',
      origin: 'placed',
      standing: true,
    },
  ]

  it('the first-film journey addresses a third stage the picture is provably in', () => {
    const snap = snapshot({
      stages,
      productionOperations: [
        {
          productionId: 'prod-1',
          title: 'Ravine',
          phase: 'shooting',
          phaseLabel: 'Principal photography',
          weeksRemaining: 4,
          progress01: 0.5,
          locationBuildingId: 'placed-7',
          facilityLabel: 'Soundstage 3',
          directorId: 'dir-1',
          directorName: 'A Director',
          taskStatus: 'scheduled',
          statusLabel: 'Shooting on Soundstage 3',
          blocker: null,
          attention: 'active',
          currentCommand: null,
        },
      ],
    })

    expect(journeyStageBuildingIds(snap)).toEqual(['stage-a', 'stage-b', 'placed-7'])
    expect(activeStageBuildingId(snap)).toBe('placed-7')
    expect(journeyTargetBuildingId('stage', snap)).toBe('placed-7')
  })

  it('the journey still points at the studio’s FIRST stage when none is determined', () => {
    // Not `[0]` of a hand-written pair: the first entry of the DERIVED list, which is
    // the engine's own facility order — for any pre-Flip studio, Soundstage 7.
    expect(journeyTargetBuildingId('stage', snapshot({ stages }))).toBe('stage-a')
    expect(journeyTargetBuildingId('stage', snapshot())).toBe('stage-a')
  })

  it('the journey addresses no building at all for a studio with no soundstage', () => {
    expect(journeyTargetBuildingId('stage', snapshot({ stages: [] }))).toBeNull()
  })

  it('the legacy display resolver seats a third picture on a third stage', () => {
    // Legacy mode is where this resolver runs. Given a studio whose snapshot names three
    // stages, three pictures take three slots — where the two-slot table dropped one
    // onto the adapter's own choice and two cards fought over one body.
    const cards = ['prod-1', 'prod-2', 'prod-3'].map((id, index) => ({
      id,
      title: `Picture ${String(index + 1)}`,
      genre: 'Drama',
      stageId: 'stage-a',
      progress01: 0.25,
      weeksRemaining: 6,
      active: true,
    }))
    const snap = snapshot({
      stages,
      operationsMode: 'legacy',
      stageAssignmentAuthority: 'presentation',
      activeProductions: cards,
      buildings: [
        { id: 'stage-a', available: true, attention: 'empty', attentionReason: 'Available' },
        { id: 'stage-b', available: true, attention: 'empty', attentionReason: 'Available' },
        { id: 'placed-7', available: true, attention: 'empty', attentionReason: 'Available' },
      ],
    })

    const resolved = new StageAssignment().resolve(snap)

    expect(resolved.activeProductions.map((card) => card.stageId)).toEqual([
      'stage-a',
      'stage-b',
      'placed-7',
    ])
  })
})
