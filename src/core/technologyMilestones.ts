import { TECHNOLOGY_CATALOGUE, type TechnologyCatalogueEntry } from './technologyCatalogue.js'
import { historyDraft, studioSubject, type StudioHistoryDraft } from './studioHistory.js'
import { economyEngaged } from './employment.js'
import type { GameState, StudioHistoryEvent } from './types.js'

export type TechnologyMilestone = Extract<StudioHistoryEvent, { kind: 'technologyMilestone' }>['milestone']
const MILESTONES: readonly TechnologyMilestone[] = ['researchable', 'commercialRelease']

function weekOf(entry: TechnologyCatalogueEntry, milestone: TechnologyMilestone): number {
  switch (milestone) {
    case 'researchable': return entry.researchableWeek
    case 'commercialRelease': return entry.commercialWeek
  }
}

/**
 * The technology catalogue owns dates; history records their reached boundary.
 * Null for an identity outside the catalogue: untrusted history never resolves to a date.
 */
export function technologyMilestoneWeek(technologyId: string, milestone: TechnologyMilestone): number | null {
  const entry = TECHNOLOGY_CATALOGUE.find(entry => entry.id === technologyId)
  return entry === undefined ? null : weekOf(entry, milestone)
}

/** Emit only the newly reached date, per catalogue entry. Loading after a milestone invents no history. */
export function technologyMilestoneDrafts(state: GameState, arrivalWeek: number): readonly StudioHistoryDraft[] {
  if (arrivalWeek !== state.market.tick + 1 || !state.hollywood || state.founding !== null || !economyEngaged(state) ||
    arrivalWeek <= state.technology.recordingStartedWeek || arrivalWeek < state.studioHistory.recordingStartedWeek) return []
  return TECHNOLOGY_CATALOGUE.flatMap((entry) => MILESTONES
    .filter((milestone) => weekOf(entry, milestone) === arrivalWeek)
    .map((milestone) => historyDraft({
      kind: 'technologyMilestone', week: arrivalWeek, subjects: studioSubject(),
      technologyId: entry.id, milestone,
    })))
}
