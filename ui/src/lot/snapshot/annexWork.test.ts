import { describe, expect, it } from 'vitest'
import {
  operationalAnnexWorkContext,
  type LotAnnexWork,
  type LotAnnexWorkOccupant,
} from './annexWork.ts'
import type {
  BuildingState,
  StudioLotSnapshot,
} from './StudioLotSnapshot.ts'

const AVAILABLE_ANNEX: LotAnnexWork = {
  facilityId: 'facility-development-casting-annex',
  facilityName: 'Development & Casting Annex',
  capability: 'development-casting',
  capacity: 1,
  occupied: 0,
  available: 1,
  slot: 0,
  occupant: null,
}

const OPERATIONAL_BUILDING: BuildingState = {
  id: 'expansion',
  available: true,
  attention: 'positive',
  constructionStatus: 'operational',
  constructionProgress01: 1,
  constructionProgressText: 'Operational since Week 13',
}

function snapshot(
  annexWork: LotAnnexWork | null = AVAILABLE_ANNEX,
  buildings: BuildingState[] = [OPERATIONAL_BUILDING],
): StudioLotSnapshot {
  return {
    studioName: 'PROJECT: STUDIO',
    week: 13,
    cash: 1_000_000,
    cashBand: 'stable',
    standing: 'finding-footing',
    standingValues: { awareness: 40, prestige: 40, confidence: 40 },
    publicityOffers: [],
    annexWork,
    activeProductions: [],
    releasedFilms: [],
    releasePresence: 'none',
    latestReleaseTitle: null,
    people: [],
    buildings,
    selectedBuildingId: null,
    sceneSeed: 'annex-selector',
    operationsMode: 'managed',
    stageAssignmentAuthority: 'engine',
    productionOperations: [],
  }
}

function occupied(occupant: LotAnnexWorkOccupant): LotAnnexWork {
  return { ...AVAILABLE_ANNEX, occupied: 1, available: 0, occupant }
}

function hostileWork(value: unknown): LotAnnexWork {
  return value as LotAnnexWork
}

describe('operationalAnnexWorkContext', () => {
  it('accepts exact Available truth independent of unrelated building order and mutates nothing', () => {
    const snap = snapshot(AVAILABLE_ANNEX, [
      { id: 'gate', available: true },
      OPERATIONAL_BUILDING,
      { id: 'admin', available: true },
    ])
    const before = JSON.stringify(snap)

    const context = operationalAnnexWorkContext(snap)

    expect(context).toEqual({
      state: 'available',
      annexWork: AVAILABLE_ANNEX,
      occupant: null,
      ownerIntent: null,
    })
    expect(context?.annexWork).toBe(AVAILABLE_ANNEX)
    expect(JSON.stringify(snap)).toBe(before)
  })

  it.each([
    ['script', 'script-1', 'Draft One', 'drafting'],
    ['script', 'script-2', 'Rewrite One', 'rewriting'],
    ['casting', 'casting-1', 'Casting One', 'auditioning'],
    ['production', 'prod-1', 'Development One', 'development'],
    ['production', 'prod-2', 'Pre-production One', 'preProduction'],
  ] as const)(
    'accepts exact Working %s/%s identity and activity',
    (owner, ownerId, title, activity) => {
      const production = owner === 'production'
      const occupant: LotAnnexWorkOccupant = {
        owner,
        ownerId,
        title,
        activity,
        workState: 'working',
        statusLabel: production ? 'On schedule' : null,
        blocker: null,
      }
      const context = operationalAnnexWorkContext(snapshot(occupied(occupant)))

      expect(context).toMatchObject({
        state: 'working',
        occupant,
        ownerIntent: { owner, ownerId },
      })
    },
  )

  it('accepts only an exact production capacity Held context', () => {
    const occupant: LotAnnexWorkOccupant = {
      owner: 'production',
      ownerId: 'prod-held',
      title: 'Held Picture',
      activity: 'preProduction',
      workState: 'held',
      statusLabel: 'Held for facility capacity',
      blocker: {
        kind: 'facility-capacity',
        headline: 'Rehearsal held for Soundstage',
        detail: 'No soundstage slot was available.',
      },
    }

    expect(operationalAnnexWorkContext(snapshot(occupied(occupant)))).toMatchObject({
      state: 'held',
      occupant,
      ownerIntent: { owner: 'production', ownerId: 'prod-held' },
    })
  })

  it.each([
    [{ ...OPERATIONAL_BUILDING, available: false }],
    [{ ...OPERATIONAL_BUILDING, constructionStatus: 'building' as const }],
    [{ ...OPERATIONAL_BUILDING, constructionProgress01: 0.99 }],
    [{ ...OPERATIONAL_BUILDING, constructionProgressText: 'Operational' }],
    [{ ...OPERATIONAL_BUILDING, constructionProgressText: 'Operational since Week 0' }],
    [{ ...OPERATIONAL_BUILDING, constructionProgressText: 'Operational since Week 12' }],
    [{ ...OPERATIONAL_BUILDING, constructionProgressText: 'Operational since Week 14' }],
    [{ ...OPERATIONAL_BUILDING, constructionProgressText: 'Operational since Week 013' }],
    [OPERATIONAL_BUILDING, { ...OPERATIONAL_BUILDING }],
  ])('rejects missing or contradictory physical Operational truth %#', (...buildings) => {
    expect(operationalAnnexWorkContext(snapshot(AVAILABLE_ANNEX, buildings))).toBeNull()
  })

  it('rejects Operational presentation outside managed engine authority or a safe current week', () => {
    const legacy = {
      ...snapshot(),
      operationsMode: 'legacy',
      stageAssignmentAuthority: 'presentation',
    } as StudioLotSnapshot
    const presentationOwned = {
      ...snapshot(),
      stageAssignmentAuthority: 'presentation',
    } as unknown as StudioLotSnapshot
    const fractionalWeek = { ...snapshot(), week: 13.5 }
    const unsafeWeek = { ...snapshot(), week: Number.MAX_SAFE_INTEGER + 1 }

    for (const hostile of [legacy, presentationOwned, fractionalWeek, unsafeWeek]) {
      expect(operationalAnnexWorkContext(hostile)).toBeNull()
    }
  })

  it.each([
    null,
    { ...AVAILABLE_ANNEX, facilityId: 'facility-lookalike' },
    { ...AVAILABLE_ANNEX, facilityName: 'Annex' },
    { ...AVAILABLE_ANNEX, capability: 'soundstage' },
    { ...AVAILABLE_ANNEX, capacity: 2 },
    { ...AVAILABLE_ANNEX, slot: 1 },
    { ...AVAILABLE_ANNEX, occupied: 0, available: 0 },
    { ...AVAILABLE_ANNEX, occupied: 0, available: 1, occupant: { owner: 'script' } },
    { ...AVAILABLE_ANNEX, occupied: 1, available: 0, occupant: null },
  ])('rejects malformed or contradictory Annex row %#', (work) => {
    expect(
      operationalAnnexWorkContext(snapshot(work === null ? null : hostileWork(work))),
    ).toBeNull()
  })

  it.each([
    {
      owner: 'script', ownerId: '', title: 'Title', activity: 'drafting',
      workState: 'working', statusLabel: null, blocker: null,
    },
    {
      owner: 'script', ownerId: 'script-1', title: ' ', activity: 'drafting',
      workState: 'working', statusLabel: null, blocker: null,
    },
    {
      owner: 'script', ownerId: 'script-1', title: 'Title', activity: 'auditioning',
      workState: 'working', statusLabel: null, blocker: null,
    },
    {
      owner: 'casting', ownerId: 'casting-1', title: 'Title', activity: 'auditioning',
      workState: 'held', statusLabel: 'Held', blocker: null,
    },
    {
      owner: 'production', ownerId: 'prod-1', title: 'Title', activity: 'shooting',
      workState: 'working', statusLabel: 'On schedule', blocker: null,
    },
    {
      owner: 'production', ownerId: 'prod-1', title: 'Title', activity: 'development',
      workState: 'working', statusLabel: null, blocker: null,
    },
    {
      owner: 'production', ownerId: 'prod-1', title: 'Title', activity: 'development',
      workState: 'working', statusLabel: 'On schedule',
      blocker: { kind: 'facility-capacity', headline: 'Held', detail: 'No slot' },
    },
    {
      owner: 'production', ownerId: 'prod-1', title: 'Title', activity: 'preProduction',
      workState: 'held', statusLabel: ' ',
      blocker: { kind: 'facility-capacity', headline: 'Held', detail: 'No slot' },
    },
    {
      owner: 'production', ownerId: 'prod-1', title: 'Title', activity: 'preProduction',
      workState: 'held', statusLabel: 'Held',
      blocker: { kind: 'facility-capacity', headline: '', detail: 'No slot' },
    },
    {
      owner: 'production', ownerId: 'prod-1', title: 'Title', activity: 'preProduction',
      workState: 'held', statusLabel: 'Held',
      blocker: { kind: 'director-dispatch', headline: 'Call', detail: 'Call director' },
    },
  ])('rejects hostile occupant/status combinations %#', (occupant) => {
    expect(
      operationalAnnexWorkContext(
        snapshot(occupied(occupant as unknown as LotAnnexWorkOccupant)),
      ),
    ).toBeNull()
  })

  it('never treats same-title owners as the same identity', () => {
    const first = occupied({
      owner: 'script',
      ownerId: 'script-first',
      title: 'Shared Title',
      activity: 'drafting',
      workState: 'working',
      statusLabel: null,
      blocker: null,
    })
    const second = occupied({
      ...first.occupant!,
      ownerId: 'script-second',
    })

    expect(operationalAnnexWorkContext(snapshot(first))?.ownerIntent).toEqual({
      owner: 'script', ownerId: 'script-first',
    })
    expect(operationalAnnexWorkContext(snapshot(second))?.ownerIntent).toEqual({
      owner: 'script', ownerId: 'script-second',
    })
  })
})
