import { SYNCHRONIZED_SOUND } from './technology.js'
import { historyDraft, studioSubject, type StudioHistoryDraft } from './studioHistory.js'
import { economyEngaged } from './employment.js'
import type { GameState, StudioHistoryEvent } from './types.js'

export type TechnologyMilestone = Extract<StudioHistoryEvent, { kind: 'technologyMilestone' }>['milestone']

/** The technology catalogue owns dates; history records their reached boundary. */
export function technologyMilestoneWeek(milestone: TechnologyMilestone): number {
  switch (milestone) {
    case 'researchable': return SYNCHRONIZED_SOUND.researchableWeek
    case 'commercialRelease': return SYNCHRONIZED_SOUND.commercialWeek
  }
}

/** Emit only the newly reached date. Loading after a milestone invents no history. */
export function technologyMilestoneDrafts(state: GameState, arrivalWeek: number): readonly StudioHistoryDraft[] {
  if (arrivalWeek !== state.market.tick + 1 || !state.hollywood || state.founding !== null || !economyEngaged(state) ||
    arrivalWeek <= state.technology.recordingStartedWeek || arrivalWeek < state.studioHistory.recordingStartedWeek) return []
  const milestones: readonly TechnologyMilestone[] = ['researchable', 'commercialRelease']
  return milestones.filter((milestone) => technologyMilestoneWeek(milestone) === arrivalWeek).map((milestone) => historyDraft({
    kind: 'technologyMilestone', week: arrivalWeek, subjects: studioSubject(),
    technologyId: SYNCHRONIZED_SOUND.id, milestone,
  }))
}
