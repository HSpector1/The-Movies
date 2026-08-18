// ── The dispatcher (PF1-M2) ──────────────────────────────────────────────────
//
// The thin imperative edge between the pure grammar and the one audio service. Every
// function here does exactly three things, in order: derive cues from an authoritative
// receipt, play the ones that carry a sound, and hand the cues back so the caller can
// drive DOM motion with the same descriptors the sound came from.
//
// IT HOLDS NO STATE. Not a seen-set, not a last-id, not a counter. Exact-once is a
// property of WHERE these are called — the existing single-owner announcement gates,
// each of which already consumes its receipt exactly once and already refuses stale,
// duplicate and state-mismatched claims. A memo in this module would be a second,
// weaker copy of that discipline, and the two would eventually disagree.
//
// Because it holds no state it also cannot fire on load or hydration: nothing here runs
// unless a call site runs, and no call site is a mount effect.

import {
  cueForActionCommit,
  cueForFormation,
  cueForRefusal,
  cueForWeekAdvance,
  cuesForAdvanceWeek,
  cuesForSimResult,
} from './eventGrammar.ts'
import type { CommitKind, PresentationCue } from './eventGrammar.ts'
import type { SimResult } from '../engine/adapter.ts'
import { getAudioService } from '../audio/audioService.ts'

/**
 * Play whatever the cues carry. A cue with `sound: null` is silence by design (tier 3),
 * not a missing asset, so it reaches the service not at all.
 *
 * The service itself drops cues before the autoplay unlock and while muted, so there is
 * no gate to duplicate here.
 */
function emit(cues: PresentationCue[]): PresentationCue[] {
  const service = getAudioService()
  for (const c of cues) {
    if (c.sound !== null) service.playCue(c.sound)
  }
  return cues
}

/** A governed stop: `advanceToNextEvent` came back with a reason. */
export function punctuateSimResult(result: SimResult): PresentationCue[] {
  return emit(cuesForSimResult(result))
}

/** A single-week Advance: a release, a completion, or a quiet tick. */
export function punctuateAdvanceWeek(result: {
  toWeek: number
  released: readonly unknown[]
  constructionCompletion: unknown
}): PresentationCue[] {
  return emit(cuesForAdvanceWeek(result))
}

/** A commit the engine accepted. */
export function punctuateCommit(kind: CommitKind, week: number): PresentationCue[] {
  return emit([cueForActionCommit(kind, week)])
}

/** A refusal surfaced to the player. */
export function punctuateRefusal(week: number): PresentationCue[] {
  return emit([cueForRefusal(week)])
}

/** PICTURE FORMED, at the formation-witness publish gate. */
export function punctuateFormation(week: number): PresentationCue[] {
  return emit([cueForFormation(week)])
}

/** A week advance with no governed stop at all. */
export function punctuateWeekAdvance(week: number): PresentationCue[] {
  return emit([cueForWeekAdvance(week)])
}
