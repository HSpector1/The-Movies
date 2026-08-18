// ── Audition evidence carried to the moment of choice ────────────────────────
// The 00F Movie #2 gate asks every surface to answer WHAT HAPPENED, WHY IT
// MATTERS, WHAT DO I DO NEXT. At the casting → package seam the middle answer used
// to evaporate: the Camera-test evidence card renders above the pickers, and then
// the pickers list the whole assignable roster with no mark on the two people who
// actually read for that role. The player walked from "these two read for Lead"
// into thirty indistinguishable names.
//
// This module carries the persisted session evidence — which the engine already
// stores and already projects through `CastingProjectView.results` — down to the
// candidate card, per role. It invents nothing: every number here is the engine's
// own observation, the same one the evidence card shows.
//
// THE ENGINE'S LAW SURVIVES: auditions are EVIDENCE, NOT COMMITMENT. A read is a
// badge and an observation on the card, never a pre-selection, never a filter, and
// never a reason a non-auditioned candidate is unavailable.

import type { CastSlot, CastingProjectView } from '../engine/adapter.ts'

/** One person's persisted read for ONE role. Engine observation only. */
export type AuditionRead = {
  talentId: string
  /** The engine's point observation for this read. */
  estimate: number
  /** The engine's observed band for this read. */
  low: number
  high: number
  /**
   * The Fit the camera-test evidence card shows for this read — the studio's Fit
   * metric taken against the SCREENPLAY's own shape and promise. The picker card's
   * own Fit badge is taken against the package as it stands right now, so the two
   * can legitimately differ once the player edits the package. Both are true; the
   * copy below never lets them be mistaken for one number.
   */
  fit: number
}

/** Every read persisted for one role, by talent id. */
export type SlotAuditionReads = ReadonlyMap<string, AuditionRead>

export type PackageAuditionReads = Readonly<Record<CastSlot, SlotAuditionReads>>

const SLOTS: readonly CastSlot[] = ['lead', 'antagonist', 'support']

/**
 * Reads persisted for this picture's casting session, per role — or null when the
 * picture has no completed session (a picture packaged without auditions, which
 * stays entirely legal).
 */
export function auditionReadsForPackage(
  project: CastingProjectView | undefined,
): PackageAuditionReads | null {
  if (project === undefined || project.results === null) return null
  const results = project.results
  const bySlot = {} as Record<CastSlot, SlotAuditionReads>
  for (const slot of SLOTS) {
    const reads = new Map<string, AuditionRead>()
    for (const evidence of results[slot]) {
      reads.set(evidence.talentId, {
        talentId: evidence.talentId,
        estimate: evidence.estimate,
        low: evidence.low,
        high: evidence.high,
        fit: evidence.fit.score,
      })
    }
    bySlot[slot] = reads
  }
  return bySlot
}

// ── Copy (presentation constants; no engine numbers are named here) ───────────
export const AUDITIONED_BADGE = 'Auditioned'
export const AUDITIONED_GROUP_LABEL = 'Read for this role'
export const NOT_AUDITIONED_GROUP_LABEL = 'Did not read for this role'

/**
 * "Read for Lead — Est. 62, observed range 55–69, camera-test Fit 71."
 *
 * `packageFit` is the Fit THIS card is showing for the package as it stands. When it
 * differs from the Fit recorded with the camera test, the sentence says so rather than
 * leaving the player with two numbers called Fit and no account of the difference.
 * Formatted exactly as the card's own badge formats it, so the two always agree.
 */
export function auditionReadSentence(
  roleTitle: string,
  read: AuditionRead,
  packageFit?: number,
): string {
  const sentence = `Read for ${roleTitle} — Est. ${String(read.estimate)}, observed range ${String(read.low)}–${String(read.high)}, camera-test Fit ${String(read.fit)}.`
  if (packageFit === undefined) return sentence
  const shown = packageFit.toFixed(0)
  if (shown === String(read.fit)) return sentence
  return `${sentence} This package now reads Fit ${shown} for the role.`
}

/** The honest counterpart. Never a warning; not auditioning is not a defect. */
export function notAuditionedSentence(roleTitle: string): string {
  return `Did not read for ${roleTitle}. No camera-test evidence for this role.`
}

/**
 * States what the grouping is and, in the same breath, what it is not. Counted over
 * the candidates ACTUALLY LISTED, so the sentence stays true under any filter.
 */
export function auditionGroupingNote(roleTitle: string, listedReadCount: number): string {
  return `${String(listedReadCount)} of the candidates below read for ${roleTitle}, listed first. A read is evidence, not a choice — any legal candidate below can still take the role.`
}
