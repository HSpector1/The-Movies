// Fixture snapshot — an established Meridian studio with one active production on
// Stage A. Fixture data only; the renderer computes no gameplay.
import type { StudioLotSnapshot } from '../types/snapshot'

export const MERIDIAN_ESTABLISHED: StudioLotSnapshot = {
  studioName: 'MERIDIAN PICTURES',
  standing: 'established',
  activeProductions: [
    {
      id: 'prod-a',
      title: 'Gilded Horizon',
      genre: 'Adventure',
      stageId: 'stage-a',
      progress01: 0.62,
      weeksRemaining: 4,
      active: true,
    },
  ],
  buildings: [
    { id: 'gate', available: true },
    { id: 'admin', available: true },
    { id: 'stage-a', available: true },
    { id: 'theater', available: true },
    { id: 'writers', available: true },
    { id: 'casting', available: true },
    { id: 'backlot', available: true },
  ],
  sceneSeed: 'meridian-3d-slice',
}
