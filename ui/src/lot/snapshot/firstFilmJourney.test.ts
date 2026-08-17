// ── Semantic journey site → physical lot address ──────────────────────────────
//
// The engine names a DESTINATION ('development'), never a building. This maps that name
// onto the exact `BuildingId` vocabulary the world and the companion navigation share,
// and refuses to trust a projection whose shape it cannot verify. The base snapshot is
// the real adapter's, so the building ids asserted here are the ones the lot actually
// paints — not a hand-authored guess.

import { describe, expect, it } from 'vitest'
import {
  applyActions,
  beginFounding,
  FOUNDING_MINIMUMS,
  generateWorld,
} from '../../../../src/core/index.ts'
import type { CreativeRole, GameState } from '../../../../src/core/index.ts'
import { studioLotSnapshot } from '../../engine/adapter.ts'
import { ALL_BUILDING_IDS } from './StudioLotSnapshot.ts'
import type { ProductionOperationsState, StudioLotSnapshot } from './StudioLotSnapshot.ts'
import {
  activeStageBuildingId,
  firstFilmJourneyContext,
  isFirstFilmJourneyView,
  journeyTargetBuildingId,
  JOURNEY_SITE_BUILDING,
  JOURNEY_STAGE_BUILDING_IDS,
} from './firstFilmJourney.ts'
import type { FirstFilmJourneyView, JourneySite } from './firstFilmJourney.ts'

function foundManagedStudio(seed: string): GameState {
  let state = beginFounding(generateWorld(seed))
  const pool = state.founding!.applicantIds.map((id) => state.talent.find((t) => t.id === id)!)
  const byRole = (role: CreativeRole, n: number) => pool.filter((t) => t.role === role).slice(0, n)
  const toSign = [
    ...byRole('actor', FOUNDING_MINIMUMS.actor),
    ...byRole('director', FOUNDING_MINIMUMS.director),
    ...byRole('writer', FOUNDING_MINIMUMS.writer),
    ...byRole('craft', FOUNDING_MINIMUMS.craft),
  ]
  for (const talent of toSign) {
    state = applyActions(state, [{ kind: 'signContract', talentId: talent.id, termWeeks: 156 }])
  }
  return applyActions(applyActions(state, [{ kind: 'foundStudio' }]), [
    { kind: 'activateStudioOperations' },
  ])
}

const baseSnapshot: StudioLotSnapshot = studioLotSnapshot(foundManagedStudio('journey-map-001'))

function operationOn(productionId: string, stage: 'stage-a' | 'stage-b'): ProductionOperationsState {
  return {
    productionId,
    title: `Picture ${productionId}`,
    phase: 'shooting',
    phaseLabel: 'Shooting',
    weeksRemaining: 4,
    progress01: 0.5,
    locationBuildingId: stage,
    facilityLabel: 'Soundstage',
    directorId: 'director-1',
    directorName: 'A Director',
    taskStatus: null,
    statusLabel: 'Shooting',
    blocker: null,
    attention: 'active',
    currentCommand: null,
  }
}

function withOperations(operations: ProductionOperationsState[]): StudioLotSnapshot {
  return { ...baseSnapshot, operationsMode: 'managed', stageAssignmentAuthority: 'engine', productionOperations: operations }
}

function view(overrides: Partial<FirstFilmJourneyView> = {}): FirstFilmJourneyView {
  return {
    stage: 'drafting',
    pictureTitle: 'A Season of Archipelago',
    ordinal: 1,
    headline: 'Screenplay — drafting',
    detail: 'Writer: Lauren Ravel · Due Week 1',
    next: { kind: 'commission', label: 'Commission a screenplay at Development', site: 'development' },
    waiting: null,
    blocked: null,
    ...overrides,
  }
}

describe('journeyTargetBuildingId — the renderer owns the physical address', () => {
  it('maps every fixed site to a building the lot actually has', () => {
    const cases: Array<[JourneySite, string]> = [
      ['development', 'writers'],
      ['casting', 'casting'],
      ['post', 'post'],
      ['admin', 'admin'],
    ]
    for (const [site, expected] of cases) {
      const id = journeyTargetBuildingId(site, baseSnapshot)
      expect(id).toBe(expected)
      expect(ALL_BUILDING_IDS).toContain(id)
      // The world paints exactly these nine ids; a site that named anything else would
      // be inventing physical world from a semantic destination.
      expect(baseSnapshot.buildings.map((building) => building.id)).toContain(id)
    }
    expect(Object.values(JOURNEY_SITE_BUILDING).every((id) => ALL_BUILDING_IDS.includes(id))).toBe(true)
  })

  it('addresses no building when the step names no site', () => {
    expect(journeyTargetBuildingId(null, baseSnapshot)).toBeNull()
  })

  it('sends "stage" to the soundstage the operations projection proves', () => {
    const snapshot = withOperations([operationOn('prod-1', 'stage-b')])
    expect(activeStageBuildingId(snapshot)).toBe('stage-b')
    expect(journeyTargetBuildingId('stage', snapshot)).toBe('stage-b')
  })

  it('falls back to the first stage when no production determines one', () => {
    const empty = withOperations([])
    expect(activeStageBuildingId(empty)).toBeNull()
    expect(journeyTargetBuildingId('stage', empty)).toBe(JOURNEY_STAGE_BUILDING_IDS[0])
    expect(journeyTargetBuildingId('stage', empty)).toBe('stage-a')
  })

  it('treats two pictures on two stages as undetermined rather than guessing', () => {
    const ambiguous = withOperations([
      operationOn('prod-2', 'stage-b'),
      operationOn('prod-1', 'stage-a'),
    ])
    expect(activeStageBuildingId(ambiguous)).toBeNull()
    expect(journeyTargetBuildingId('stage', ambiguous)).toBe('stage-a')
  })

  it('still determines the stage when two pictures share one soundstage', () => {
    const shared = withOperations([
      operationOn('prod-1', 'stage-b'),
      operationOn('prod-2', 'stage-b'),
    ])
    expect(activeStageBuildingId(shared)).toBe('stage-b')
  })

  it('ignores operations that are not located on a soundstage', () => {
    const offStage = withOperations([
      { ...operationOn('prod-1', 'stage-a'), locationBuildingId: 'writers' },
    ])
    expect(activeStageBuildingId(offStage)).toBeNull()
  })

  it('survives a snapshot whose operations projection is absent or hostile', () => {
    const absent = { ...baseSnapshot } as unknown as StudioLotSnapshot
    delete (absent as { productionOperations?: unknown }).productionOperations
    expect(activeStageBuildingId(absent)).toBeNull()
    const hostile = {
      ...baseSnapshot,
      productionOperations: [null, 'stage-a', { locationBuildingId: 'stage-z' }],
    } as unknown as StudioLotSnapshot
    expect(activeStageBuildingId(hostile)).toBeNull()
    expect(journeyTargetBuildingId('stage', hostile)).toBe('stage-a')
  })
})

describe('firstFilmJourneyContext — absent and malformed are different facts', () => {
  it('reports ABSENT when the snapshot carries no projection', () => {
    // `studioLotSnapshot` always emits the journey; hand-authored presentation fixtures
    // predate it, and those are the snapshots this branch exists for.
    const withoutJourney = { ...baseSnapshot } as unknown as StudioLotSnapshot
    delete (withoutJourney as { firstFilmJourney?: unknown }).firstFilmJourney
    expect(firstFilmJourneyContext(withoutJourney)).toEqual({ kind: 'absent' })
  })

  it('reads the projection the real adapter puts on the snapshot', () => {
    const context = firstFilmJourneyContext(baseSnapshot)
    expect(context.kind).toBe('view')
  })

  it('reports the engine view verbatim when the projection is well formed', () => {
    const projected = view()
    // The adapter attaches this field; the leaf snapshot TYPE stays a pure leaf module,
    // so the projection is read structurally rather than declared there.
    const snapshot = { ...baseSnapshot, firstFilmJourney: projected } as unknown as StudioLotSnapshot
    expect(firstFilmJourneyContext(snapshot)).toEqual({ kind: 'view', view: projected })
  })

  it('reports MALFORMED rather than pretending nothing was projected', () => {
    for (const broken of [
      null,
      {},
      { ...view(), stage: 'daydreaming' },
      { ...view(), ordinal: 0 },
      { ...view(), ordinal: 1.5 },
      { ...view(), headline: '   ' },
      { ...view(), pictureTitle: '' },
      { ...view(), next: { kind: 'commission', label: 'Go', site: 'catering' } },
      { ...view(), next: { kind: 'teleport', label: 'Go', site: 'casting' } },
      { ...view(), next: { kind: 'commission', label: 'Go' } },
      { ...view(), waiting: { untilWeek: -1, reason: 'soon' } },
      { ...view(), waiting: { reason: 'soon' } },
      { ...view(), blocked: { reason: 'x', code: 7 } },
      { ...view(), surprise: true },
    ]) {
      const snapshot = { ...baseSnapshot, firstFilmJourney: broken } as unknown as StudioLotSnapshot
      expect(firstFilmJourneyContext(snapshot)).toEqual({ kind: 'malformed' })
    }
  })

  it('accepts every legal shape of the frozen contract', () => {
    expect(isFirstFilmJourneyView(view())).toBe(true)
    expect(isFirstFilmJourneyView(view({ pictureTitle: null, detail: null, next: null }))).toBe(true)
    expect(isFirstFilmJourneyView(view({ next: { kind: 'advance-week', label: 'Wait', site: null } }))).toBe(true)
    expect(isFirstFilmJourneyView(view({ waiting: { untilWeek: 0, reason: 'the draft is due' } }))).toBe(true)
    expect(isFirstFilmJourneyView(view({ blocked: { reason: 'No writer is under contract.' } }))).toBe(true)
    expect(isFirstFilmJourneyView(view({ ordinal: 12, stage: 'released' }))).toBe(true)
  })
})
