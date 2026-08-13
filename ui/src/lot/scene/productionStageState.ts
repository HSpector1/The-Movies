import type { ProductionCard } from '../snapshot/StudioLotSnapshot'

/**
 * The visual state of a soundstage is not the same thing as its REC light.
 * A managed production can reserve a stage for rehearsal or wait there for a
 * player/capacity decision while no take is recording. Keep those states
 * visibly occupied so the lot never contradicts the engine's reservation.
 */
export type ProductionStageVisualState =
  | 'closed'
  | 'vacant'
  | 'reserved'
  | 'decision-required'
  | 'recording'

export function productionStageVisualState(
  available: boolean,
  production: ProductionCard | null,
): ProductionStageVisualState {
  if (!available) return 'closed'
  if (production === null) return 'vacant'
  if (production.stageState === 'decision-required') return 'decision-required'
  return production.active ? 'recording' : 'reserved'
}

export function productionStageStatusLabel(
  production: ProductionCard,
  state: ProductionStageVisualState,
): string {
  if (state === 'decision-required') return 'DECISION REQUIRED'
  if (state === 'reserved') return 'STAGE RESERVED'
  return production.genre
}
