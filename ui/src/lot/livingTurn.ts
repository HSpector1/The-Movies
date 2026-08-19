// ── Living Turn V1 — the presentation scheduler, stated as a value ────────────
//
// THE LAW THIS MODULE OBEYS (charter §4.1; the full spec is
// `docs/c2-planning/08A-TIME-MODEL-DOCKET-ADDENDUM.md`).
//
//   The engine's discrete week is the ONLY authoritative clock. Nothing here
//   advances anything. This module answers three presentation questions and
//   nothing else:
//
//     1. how long is one witnessed week on screen at a chosen speed,
//     2. does a stop the ENGINE reported pause the loop or merely announce itself,
//     3. what does the studio SAY about a stop that did not pause it.
//
//   The stop ladder itself is never re-implemented here (§4.1, the LL EX rule):
//   the scheduler consumes `simStopFor` / `advanceWeek(...).stopReason` from
//   `ui/src/engine/adapter.ts`, which is the one ladder every consumer reads.
//   This module only PARTITIONS the values that ladder already produced.
//
// WHY A PARTITION AT ALL. Without it a busy studio pauses every week or two and
// the Owner's acceptance sentence — "I can stop touching controls and watch my
// studio visibly operate" — is defeated by the spec itself. `08A` §3 rules the
// split to the member, and the charter ratifies it at §4.1. It is reproduced here
// as data, with a compile-time `never` guard, so a future member of
// `SimStopReason` cannot be silently assigned to neither class.

import type { SimStopDetail, SimStopReason } from '../engine/adapter.ts'
import { PLAYBACK_BEAT_MS, PLAYBACK_DURATION_MS, PLAYBACK_LAST_BEAT } from './tycoon/playback.ts'

// ── The speed ladder ─────────────────────────────────────────────────────────

/**
 * The named ladder (§4.1): **1× / 2× / 4×**, ceiling 4×. These multiply the
 * PLAYBACK pacing and nothing else — no outcome anywhere in the game reads them,
 * which is the whole content of "wall-clock never determines outcomes".
 */
export const LIVING_TURN_SPEEDS = [1, 2, 4] as const

export type LivingTurnSpeed = (typeof LIVING_TURN_SPEEDS)[number]

/** The ceiling, named rather than spelled 4 at a call site. */
export const LIVING_TURN_MAX_SPEED: LivingTurnSpeed = 4

/**
 * Above this speed the witnessed (Class-B) beats collapse to their final
 * positions through the EXISTING reduced-motion path, while Class-A state stays
 * continuous — §4.1's "speed never yields half-played ceremonies". A 2.6-second
 * week cannot carry a nine-beat commute; rather than play it at a third of the
 * frames, the lot shows the settled truth and keeps the cadence.
 */
export const LIVING_TURN_WITNESSED_BEAT_CEILING: LivingTurnSpeed = 2

/** Is `n` one of the three speeds the ladder offers? */
export function isLivingTurnSpeed(n: number): n is LivingTurnSpeed {
  return (LIVING_TURN_SPEEDS as readonly number[]).includes(n)
}

/**
 * Wall time one witnessed week occupies at `speed`.
 *
 * 1× is the shipped played window exactly (`PLAYBACK_LAST_BEAT + 1` beats at
 * `PLAYBACK_BEAT_MS` = 10.35s); 2× and 4× divide it (≈5.2s, ≈2.6s), which are the
 * figures §4.1 states.
 */
export function livingTurnWeekMs(speed: LivingTurnSpeed): number {
  return PLAYBACK_DURATION_MS / speed
}

/** Wall time one engine beat occupies at `speed`. Derived, never a second constant. */
export function livingTurnBeatMs(speed: LivingTurnSpeed): number {
  return PLAYBACK_BEAT_MS / speed
}

/** True when `speed` collapses Class-B beats to final positions (§4.1). */
export function livingTurnCollapsesWitnessedBeats(speed: LivingTurnSpeed): boolean {
  return speed > LIVING_TURN_WITNESSED_BEAT_CEILING
}

/** The next speed up the ladder, or the ceiling. Presentation-only convenience. */
export function nextLivingTurnSpeed(speed: LivingTurnSpeed): LivingTurnSpeed {
  const index = LIVING_TURN_SPEEDS.indexOf(speed)
  return LIVING_TURN_SPEEDS[Math.min(index + 1, LIVING_TURN_SPEEDS.length - 1)] ?? speed
}

// ── The auto-pause partition ─────────────────────────────────────────────────

/**
 * PAUSE-class: the player's decision is genuinely required, or a ceremony plays.
 * The loop auto-pauses and the stop is surfaced EXACTLY as a manual advance
 * surfaces it today — no new surface, no new copy, no swallowed stop.
 */
export const LIVING_TURN_PAUSE_CLASS = [
  'release',
  'scriptReview',
  'castingReview',
  'productionDecision',
  'cashNegative',
] as const

/**
 * NOTIFY-class: the studio tells you and keeps working. These reach the player
 * through the attention channel below and through the played week's own beats.
 */
export const LIVING_TURN_NOTIFY_CLASS = [
  'wrap',
  'runCompleted',
  'constructionCompleted',
  'contractExpired',
  'renewalWindow',
] as const

export type LivingTurnStopClass = 'pause' | 'notify'

/**
 * Which class a stop belongs to.
 *
 * TOTALITY. Every member of `SimStopReason` is listed exactly once below, and the
 * final `never` assignment makes a future member a COMPILE error rather than a
 * silent default. That is the point of writing the partition as a switch instead
 * of two array lookups.
 *
 * `limit` — the 520-week batch safety guard — is the one member the living loop
 * can never receive: `simStopFor` never returns it (asserted in the engine's own
 * contract suite), because the guard is a property of the BATCH VERB and the loop
 * commits one tick at a time. It is classified `pause` anyway, because if the
 * impossible ever happened the honest response is to stop and let the player look.
 */
export function livingTurnStopClass(reason: SimStopReason): LivingTurnStopClass {
  switch (reason) {
    case 'release':
    case 'scriptReview':
    case 'castingReview':
    case 'productionDecision':
    case 'cashNegative':
      return 'pause'
    case 'wrap':
    case 'runCompleted':
    case 'constructionCompleted':
    case 'contractExpired':
    case 'renewalWindow':
      return 'notify'
    case 'limit':
      return 'pause'
    default: {
      const exhaustive: never = reason
      return exhaustive
    }
  }
}

/** Does this stop halt the living loop? `null` (an ordinary week) never does. */
export function livingTurnPausesOn(reason: SimStopReason | null): boolean {
  return reason !== null && livingTurnStopClass(reason) === 'pause'
}

// ── The attention channel (NOTIFY-class, in the studio's own voice) ───────────

/**
 * One thing the studio noticed and did not stop for.
 *
 * The voice is filmmaking, never engine (`00F`, the tycoon floor). It is
 * deliberately NOT the batch verb's "Stopped at Week N: …" sentence: nothing
 * stopped, so saying so would be a lie about the thing the player is watching.
 */
export type LivingTurnNotice = {
  /** Stable within a week; ascending across weeks. Used as a React key only. */
  key: string
  week: number
  reason: SimStopReason
  /** One sentence. Titles, never ids (`00F`). */
  headline: string
}

/** How many notices the bulletin retains. Older ones fall off the bottom. */
export const LIVING_TURN_NOTICE_LIMIT = 6

function list(xs: readonly string[]): string {
  if (xs.length <= 1) return xs[0] ?? ''
  return `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]!}`
}

/**
 * What the studio says about a NOTIFY-class stop on `week`.
 *
 * Every fact comes off the ENGINE's own stop payload — the wrapped pictures, the
 * completed runs, the completion summary the adapter already wrote. Nothing is
 * inferred from current state, because a completed run leaves no trace to read
 * after the fact (the same reason `stopMessage` exists on the batch receipt).
 *
 * Returns `[]` for a PAUSE-class stop: those are surfaced by the surfaces that
 * already own them, and a bulletin line would be a second announcement of one
 * event.
 */
export function livingTurnNoticesFor(
  week: number,
  reason: SimStopReason,
  detail: SimStopDetail | null,
): LivingTurnNotice[] {
  if (livingTurnStopClass(reason) !== 'notify') return []
  const key = `${String(week)}:${reason}`
  const one = (headline: string): LivingTurnNotice[] => [{ key, week, reason, headline }]
  switch (reason) {
    case 'wrap': {
      const titles = (detail?.wrapped ?? []).map((w) => w.title).filter((t) => t.length > 0)
      if (titles.length === 0) return one('Principal photography wrapped.')
      const stages = (detail?.wrapped ?? []).map((w) => w.stageName).filter((s) => s.length > 0)
      // One picture on a named stage is the legible case; anything else stays plain.
      if (titles.length === 1 && stages.length === 1) {
        return one(`Principal photography wrapped on ${titles[0]!} — ${stages[0]!} is clearing.`)
      }
      return one(`Principal photography wrapped on ${list(titles)}.`)
    }
    case 'runCompleted': {
      const titles = (detail?.completedRuns ?? []).map((r) => r.title).filter((t) => t.length > 0)
      if (titles.length === 0) return one('A picture finished its theatrical run.')
      return one(
        `${list(titles)} finished ${titles.length > 1 ? 'their theatrical runs' : 'its theatrical run'}.`,
      )
    }
    case 'constructionCompleted': {
      const completion = detail?.constructionCompletion ?? null
      return one(completion === null ? 'A committed build is finished.' : completion.message)
    }
    case 'contractExpired':
      return one('A talent contract ended.')
    case 'renewalWindow':
      return one('A contract renewal window opened.')
    default:
      return []
  }
}

/** Append notices to the retained bulletin, newest last, bounded. */
export function withLivingTurnNotices(
  retained: readonly LivingTurnNotice[],
  added: readonly LivingTurnNotice[],
): LivingTurnNotice[] {
  if (added.length === 0) return retained as LivingTurnNotice[]
  const merged = [...retained, ...added]
  return merged.slice(Math.max(0, merged.length - LIVING_TURN_NOTICE_LIMIT))
}

// ── The loop's own presentation state ────────────────────────────────────────

export type LivingTurnMode = 'paused' | 'running'

/**
 * Everything the scheduler knows. NONE of it is game truth and none of it is ever
 * persisted (`00B`.6: `market.tick` remains the authoritative integer week; Living
 * Turn V1 persists no intra-week position).
 */
export type LivingTurnRun = {
  mode: LivingTurnMode
  speed: LivingTurnSpeed
  /** The engine stop that auto-paused the loop, or null. */
  pausedBy: SimStopReason | null
  notices: LivingTurnNotice[]
}

export const INITIAL_LIVING_TURN: LivingTurnRun = {
  mode: 'paused',
  speed: 1,
  pausedBy: null,
  notices: [],
}

export type LivingTurnCommand =
  | { kind: 'play' }
  | { kind: 'pause' }
  | { kind: 'speed'; speed: LivingTurnSpeed }
  | { kind: 'dismiss-notices' }

/** Apply a player command. Pure; the caller owns when the clock actually runs. */
export function livingTurnAfterCommand(
  run: LivingTurnRun,
  command: LivingTurnCommand,
): LivingTurnRun {
  switch (command.kind) {
    case 'play':
      // Pressing play clears the stop that paused us: the player has seen it and
      // asked the studio to carry on.
      return run.mode === 'running' && run.pausedBy === null
        ? run
        : { ...run, mode: 'running', pausedBy: null }
    case 'pause':
      return run.mode === 'paused' ? run : { ...run, mode: 'paused' }
    case 'speed':
      return run.speed === command.speed ? run : { ...run, speed: command.speed }
    case 'dismiss-notices':
      return run.notices.length === 0 ? run : { ...run, notices: [] }
    default: {
      const exhaustive: never = command
      return exhaustive
    }
  }
}

/**
 * Apply the engine's verdict on one committed week: PAUSE-class halts the loop and
 * records what halted it; NOTIFY-class is announced and the loop keeps running.
 */
export function livingTurnAfterCommit(
  run: LivingTurnRun,
  week: number,
  reason: SimStopReason | null,
  detail: SimStopDetail | null,
): LivingTurnRun {
  if (reason === null) return run
  if (livingTurnStopClass(reason) === 'pause') {
    return { ...run, mode: 'paused', pausedBy: reason }
  }
  const added = livingTurnNoticesFor(week, reason, detail)
  if (added.length === 0) return run
  return { ...run, notices: withLivingTurnNotices(run.notices, added) }
}

// ── The witnessed-week clock, as arithmetic ──────────────────────────────────

/**
 * How much of the witnessed week is left, in wall ms, given the fraction already
 * consumed. Speed changes mid-week are exact because the retained quantity is a
 * FRACTION of the week, not a count of milliseconds: switching 1× → 4× half way
 * through leaves half a week at the new pace, not five seconds at the old one.
 */
export function livingTurnRemainingMs(consumed01: number, speed: LivingTurnSpeed): number {
  const clamped = Number.isFinite(consumed01) ? Math.min(1, Math.max(0, consumed01)) : 0
  return livingTurnWeekMs(speed) * (1 - clamped)
}

/** The fraction of the week `elapsedMs` at `speed` represents, clamped to [0,1]. */
export function livingTurnConsumed01(elapsedMs: number, speed: LivingTurnSpeed): number {
  if (!Number.isFinite(elapsedMs) || elapsedMs <= 0) return 0
  return Math.min(1, elapsedMs / livingTurnWeekMs(speed))
}

/**
 * The number of beats the played window covers. Exported so a test can prove the
 * scheduler's week and the renderer's played window are the same window and not
 * two constants that happen to agree today.
 */
export const LIVING_TURN_PLAYED_BEATS = PLAYBACK_LAST_BEAT + 1
