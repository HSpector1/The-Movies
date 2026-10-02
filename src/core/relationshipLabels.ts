// ── HIS-014 — relationship labels, derived on read (P14B relationship slice A) ──
//
// A PURE read: no write, no RNG, no time. Authority: 1340-O HIS-014; 1347-A §2.4 as
// amended by 1347-F Amendment 1 and its "qualifying pictures" note. A label cites
// its evidence and decorates the existing tier; it has no skill, trust, chemistry or
// closeness effect of its own, and no engine path reads this module. Professional
// Rivals needs the competitions log and lands with slice B.

import { distinctActingFirstTakes } from './professionTransitions.js'
import type { GameState } from './types.js'

/** HIS-014: "the same director directed an actor's first three qualifying
 * pictures". An Owner definition, not tuning. */
export const MENTOR_FIRST_PICTURES = 3

export type MentorEvidence = { directorId: string; productionIds: readonly [string, string, string]; entryWeek: number }

/**
 * Mentor(D, A). A must be named in a `CohortReceipt`: the receipt creates A's id, so
 * A's recorded first takes from its week on are A's complete picture history
 * (1347-F Amendment 1). A's first three qualifying pictures (distinct productions
 * whose recorded first take seats A in any cast slot, in `distinctActingFirstTakes`
 * order) must all have director D. Genesis, authored-start, rival-entry and pre-V35
 * people hold no receipt, so their early careers lie outside the record and the
 * label is absent, never guessed. Genre experience is not read either way.
 */
export function mentorEvidence(state: GameState, actorId: string): MentorEvidence | null {
  const receipt = state.careerLifecycle.cohorts.find((cohort) => cohort.personIds.includes(actorId))
  if (receipt === undefined) return null
  const takes = distinctActingFirstTakes(state, actorId, state.market.tick)
  if (takes.length < MENTOR_FIRST_PICTURES) return null
  const [first, second, third] = takes
  if (first.week < receipt.week) {
    throw new Error(`mentorEvidence: ${actorId} holds a first take at week ${String(first.week)}, before the cohort receipt that created them at week ${String(receipt.week)}`)
  }
  if (second.directorId !== first.directorId || third.directorId !== first.directorId) return null
  return { directorId: first.directorId, productionIds: [first.productionId, second.productionId, third.productionId], entryWeek: receipt.week }
}
