// ── Fixture snapshots ─────────────────────────────────────────────────────────
// Two hand-authored StudioLotSnapshots that stand in for what the host will one
// day compute from GameState. They exist so the spike can DEMONSTRATE that the
// same StudioLotView, fed two different fact-bags, paints two visibly different
// lots. They contain no logic — just facts.

import type { StudioLotSnapshot, BuildingId, BuildingState } from './StudioLotSnapshot'
import { ALL_BUILDING_IDS } from './StudioLotSnapshot'

/** Helper: build a full building list, defaulting to available + normal dressing. */
function buildings(
  overrides: Partial<Record<BuildingId, Omit<BuildingState, 'id'>>>,
): BuildingState[] {
  return ALL_BUILDING_IDS.map((id) => ({ id, available: true, ...overrides[id] }))
}

/**
 * A small, struggling studio in its first year.
 * Quiet lot: one film limping through a stage, the second stage dark, casting and
 * post not yet open, plain dressing, no recent hits. The expansion pads are empty
 * dirt — the promise of a bigger lot.
 */
export const STRUGGLING_STUDIO: StudioLotSnapshot = {
  studioName: 'Meridian Pictures',
  week: 14,
  standing: 'struggling',
  cashBand: 'tight',
  activeProductions: [
    {
      id: 'prod-1',
      title: 'The Last Streetcar',
      genre: 'Drama',
      stageId: 'stage-a',
      progress01: 0.35,
      weeksRemaining: 6,
      active: true,
    },
  ],
  releasedFilms: [
    { id: 'rel-1', title: 'Dust & Nickels', reception: 'flop', weeksAgo: 9 },
  ],
  buildings: buildings({
    admin: { available: true, underDressed: true },
    writers: { available: true, underDressed: true },
    casting: { available: false, underDressed: true }, // not yet staffed
    'stage-a': { available: true, underDressed: true },
    'stage-b': { available: false, underDressed: true }, // dark stage
    post: { available: false, underDressed: true }, // outsourced for now
    theater: { available: true, underDressed: true },
    gate: { available: true, underDressed: true },
    expansion: { available: true, underDressed: true },
  }),
  selectedBuildingId: null,
  sceneSeed: 'meridian-y1-quiet',
}

/**
 * An established, thriving studio.
 * Both stages lit and shooting, casting + post open and busy, banners up, a hit
 * on the marquee. Fuller dressing, more visible activity. Same buildings, same
 * layout — just a richer set of facts.
 */
export const SUCCESSFUL_STUDIO: StudioLotSnapshot = {
  studioName: 'Meridian Pictures',
  week: 138,
  standing: 'prestige',
  cashBand: 'flush',
  activeProductions: [
    {
      id: 'prod-a',
      title: 'Gilded Horizon',
      genre: 'Adventure',
      stageId: 'stage-a',
      progress01: 0.72,
      weeksRemaining: 3,
      active: true,
    },
    {
      id: 'prod-b',
      title: 'A Quiet Verdict',
      genre: 'Crime',
      stageId: 'stage-b',
      progress01: 0.28,
      weeksRemaining: 8,
      active: true,
    },
  ],
  releasedFilms: [
    { id: 'rel-a', title: 'Midnight Republic', reception: 'smash', weeksAgo: 4 },
    { id: 'rel-b', title: 'The Copper Coast', reception: 'hit', weeksAgo: 11 },
    { id: 'rel-c', title: 'Paper Lanterns', reception: 'mixed', weeksAgo: 22 },
  ],
  buildings: buildings({
    // All open, all fully dressed (no underDressed flag → richer look).
  }),
  selectedBuildingId: null,
  sceneSeed: 'meridian-y3-thriving',
}

/** Menu of the demo snapshots the host can toggle between. */
export const FIXTURES = {
  struggling: STRUGGLING_STUDIO,
  successful: SUCCESSFUL_STUDIO,
} as const

export type FixtureKey = keyof typeof FIXTURES
