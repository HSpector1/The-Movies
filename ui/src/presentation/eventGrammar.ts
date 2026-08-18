// ── The cue grammar (PF1-M2) ─────────────────────────────────────────────────
//
// PRESENTATION REACTS TO TRUTH. PRESENTATION NEVER CREATES OR PERSISTS GAME TRUTH.
//
// This module is the whole of PF1's decision about which authoritative receipt earns
// which sound and which motion. It is PURE: no React, no timers, no audio service, no
// DOM, no storage, no RNG. It takes facts the engine already emitted and returns
// descriptors. Nothing here can change the world, and nothing here can be reached by a
// renderer tween, a `setTimeout`, or a value React inferred from current state.
//
// Two consequences the rest of the milestone depends on:
//
//   1. The tier table below is READABLE AS A TABLE. A reviewer arguing about restraint
//      argues with `PRIMARY_CUES`, not with eight call sites.
//   2. Exhaustiveness is a compile error, not a silence. `PRIMARY_CUES` is a
//      `Record<SimStopReason, …>`; an eleventh stop reason fails `tsc` before it can
//      ship as a moment nobody hears.
//
// M1 owns the sound vocabulary (`audio/tokens.ts`) and deliberately states no mapping.
// This is that mapping, and the only one.

import type { CueSoundToken } from '../audio/tokens.ts'
import type { SimResult, SimStopReason } from '../engine/adapter.ts'

/**
 * The closed motion vocabulary. Closed on purpose: a pinned tier table is only
 * checkable if the thing being pinned cannot quietly grow a new value.
 *
 * - `none`      — bookkeeping stays bookkeeping.
 * - `emphasis`  — a short, restrained acknowledgement on existing DOM chrome.
 * - `held-beat` — the reserved beat: a brief settle on the notice that already exists.
 * - `count-up`  — a figure travelling to its new value over a FIXED duration.
 *
 * Every one of the three non-`none` values is gated on reduced motion at the point of
 * use. Reduced motion plus muted audio must equal today's game exactly.
 */
export type CueMotion = 'none' | 'emphasis' | 'held-beat' | 'count-up'

/** Tier 1 memorable (reserved, few) · tier 2 minor · tier 3 none. */
export type CueTier = 1 | 2 | 3

/**
 * One punctuation descriptor.
 *
 * `id` is derived ONLY from receipt facts, never from a counter, a clock, or a random
 * draw — so the same seed and the same action script produce the same id sequence, and
 * so a caller can dedupe by identity without keeping a history.
 */
export type PresentationCue = {
  id: string
  tier: CueTier
  sound: CueSoundToken | null
  motion: CueMotion
}

/**
 * The player commits PF1 punctuates. Each one is a receipt the engine already accepted.
 *
 * PF1-M4 adds `founding`. The founding screen was firing `draft-accepted` — the receipt
 * for a screenplay a player accepts, weeks later, in the Writers' Room. The sound was
 * right (it is an ordinary commit) but the NAME was a lie about which moment it was, and
 * a cue id is derived from the kind, so the studio's own ledger read wrong. This is a
 * relabel: same family, same tier, same motion, nothing weakened.
 */
export type CommitKind =
  | 'commission'
  | 'build-commit'
  | 'move-commit'
  | 'demolish-commit'
  | 'auditions-planned'
  | 'draft-accepted'
  | 'founding'
  | 'publicity'
  | 'package-step'

/** The shape of a cue before its id is stamped with the week it belongs to. */
type CueShape = { tier: CueTier; sound: CueSoundToken | null; motion: CueMotion }

// ── THE TIER TABLE ───────────────────────────────────────────────────────────
//
// Tier 1 is reserved and small: a picture reaches audiences, a picture is formed, a
// building on the property is finished. Tier 2 is the ordinary working day. Tier 3 is
// silence, and `limit` — the safety cap firing without a governed event — is exactly
// that: a diagnostic, not a moment.

const PRIMARY_CUES: Record<SimStopReason, CueShape> = {
  release: { tier: 1, sound: 'sting-release', motion: 'held-beat' },
  constructionCompleted: { tier: 1, sound: 'sting-completion', motion: 'emphasis' },
  scriptReview: { tier: 2, sound: 'select', motion: 'emphasis' },
  castingReview: { tier: 2, sound: 'select', motion: 'emphasis' },
  productionDecision: { tier: 2, sound: 'select', motion: 'emphasis' },
  runCompleted: { tier: 2, sound: 'positive', motion: 'emphasis' },
  contractExpired: { tier: 2, sound: 'warning', motion: 'emphasis' },
  renewalWindow: { tier: 2, sound: 'warning', motion: 'emphasis' },
  cashNegative: { tier: 2, sound: 'warning', motion: 'emphasis' },
  limit: { tier: 3, sound: null, motion: 'none' },
}

const COMMIT_CUES: Record<CommitKind, CueShape> = {
  commission: { tier: 2, sound: 'commit', motion: 'emphasis' },
  // Construction started is its own family — the studio breaking ground does not sound
  // like signing a form.
  'build-commit': { tier: 2, sound: 'construction-started', motion: 'emphasis' },
  'move-commit': { tier: 2, sound: 'commit', motion: 'emphasis' },
  'demolish-commit': { tier: 2, sound: 'commit', motion: 'emphasis' },
  'auditions-planned': { tier: 2, sound: 'commit', motion: 'emphasis' },
  'draft-accepted': { tier: 2, sound: 'commit', motion: 'emphasis' },
  // The same row as every generic commit: signing a founding contract is the studio
  // accepting a signature, not one of the three reserved beats.
  founding: { tier: 2, sound: 'commit', motion: 'emphasis' },
  publicity: { tier: 2, sound: 'commit', motion: 'emphasis' },
  'package-step': { tier: 2, sound: 'commit', motion: 'emphasis' },
}

/** A refusal is heard, never animated: motion on a blocked action reads as progress. */
const REFUSAL_CUE: CueShape = { tier: 2, sound: 'refusal', motion: 'none' }

/** PICTURE FORMED. One of the three reserved beats. */
const FORMATION_CUE: CueShape = { tier: 1, sound: 'sting-greenlight', motion: 'held-beat' }

/** A week passing with nothing governed to say: the world acknowledging time, quietly. */
const WEEK_ADVANCE_CUE: CueShape = { tier: 2, sound: 'select', motion: 'none' }

function cue(id: string, shape: CueShape): PresentationCue {
  return { id, tier: shape.tier, sound: shape.sound, motion: shape.motion }
}

/**
 * The cues one governed stop earns.
 *
 * TOTAL over `SimStopReason` — every member has a row, `limit` included, and its row is
 * silence rather than an omission.
 *
 * CO-TICK LAW (`adapter.ts:2236-2240`): construction completion is ORTHOGONAL to the
 * primary stop reason. When a building finishes on the same tick as a release, a
 * decision, a run ending, a cash crossing or a contract boundary, the primary event
 * keeps its established priority AND the completion is still carried — exactly once.
 * When the completion IS the stop reason, the two candidates carry the same id and
 * collapse to one; that is what makes "never two" a property of identity rather than of
 * a branch somebody has to remember to write.
 *
 * The result is ordered: primary first, then the orthogonal completion.
 */
export function cuesForSimResult(result: SimResult): PresentationCue[] {
  const primary = cue(`${result.stopReason}:${String(result.toWeek)}`, PRIMARY_CUES[result.stopReason])
  if (result.constructionCompletion === null) return [primary]
  const completion = cue(
    `constructionCompleted:${String(result.toWeek)}`,
    PRIMARY_CUES.constructionCompleted,
  )
  return completion.id === primary.id ? [primary] : [primary, completion]
}

/**
 * The cues one ORDINARY single-week advance earns.
 *
 * `advanceWeek` returns an `AdvanceResult`, not a `SimResult`: a plain Advance carries no
 * `SimStopReason` at all, because it never asked the engine to stop for anything. It can
 * still be the tick a picture reaches audiences on, and it can still be the tick a
 * building is finished on — and those are tier-1 moments whichever button produced them.
 *
 * So the priority order is READ FROM the adapter's own (`adapter.ts:2369-2375`): a
 * release outranks everything; a completion is carried orthogonally; a week with neither
 * is a quiet tick. This function exists so that priority lives in the grammar, stated
 * once, rather than being re-derived at a call site inside `App.tsx`.
 *
 * NOTE (PF1-M2, flagged for the PM): this is an ADDITIVE export beyond the frozen M2
 * interface. It manufactures no event — every input is a field `advanceWeek` already
 * returned — and it changes no frozen signature.
 */
export function cuesForAdvanceWeek(result: {
  toWeek: number
  released: readonly unknown[]
  constructionCompletion: unknown
}): PresentationCue[] {
  const week = String(result.toWeek)
  const completion =
    result.constructionCompletion === null || result.constructionCompletion === undefined
      ? null
      : cue(`constructionCompleted:${week}`, PRIMARY_CUES.constructionCompleted)
  if (result.released.length > 0) {
    const primary = cue(`release:${week}`, PRIMARY_CUES.release)
    return completion === null ? [primary] : [primary, completion]
  }
  if (completion !== null) return [completion]
  return [cueForWeekAdvance(result.toWeek)]
}

/** The receipt for a commit the engine accepted. */
export function cueForActionCommit(kind: CommitKind, week: number): PresentationCue {
  return cue(`commit:${kind}:${String(week)}`, COMMIT_CUES[kind])
}

/** The studio declining, out loud. Fires once per surfaced refusal, never per retry tick. */
export function cueForRefusal(week: number): PresentationCue {
  return cue(`refusal:${String(week)}`, REFUSAL_CUE)
}

/** PICTURE FORMED — fired at the formation-witness publish gate, never on rehydration. */
export function cueForFormation(week: number): PresentationCue {
  return cue(`formation:${String(week)}`, FORMATION_CUE)
}

/** One week, nothing governed. Law 3: a multi-week batch is one stop, never per-week theater. */
export function cueForWeekAdvance(week: number): PresentationCue {
  return cue(`week-advance:${String(week)}`, WEEK_ADVANCE_CUE)
}
