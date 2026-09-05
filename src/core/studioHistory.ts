// ── P08A — Studio History: the studio's sparse, forward-recorded durable history ──
//
// WHAT THIS IS. A persisted, engine-appended root of the MEANINGFUL things that
// happened to the studio from an explicit recording boundary onward: every exact
// Standing change with its frozen before/after/source/driver facts, each film
// release and settled theatrical result, the founding fact where authoritative,
// and (once P09/P10 producers exist) exact facility and person milestones.
//
// It is an INDEX AND INTERPRETATION layer over exact source facts owned elsewhere
// (FilmResult, TheatricalRun, the ledger, careerEvents, placement). It is not a
// second simulation and it is never a simulation input.
//
// THE PINS:
//   1. APPENDED ONLY BY `src/core`, at the same boundary that produced the fact.
//   2. EXACT-ONCE AND DETERMINISTIC ORDER: rows are collected in a caller-owned
//      sink in pipeline order and stamped with a monotonic id at commit.
//   3. NO `seen`/`consumed` FIELD, EVER (two identical runs export identical bytes).
//   4. NOTHING BEFORE `recordingStartedWeek` IS RECONSTRUCTED. Old saves say
//      "Not recorded" for what happened before; migration invents nothing.
//   5. GATED ON THE ENGAGED ECONOMY (the same persisted, monotonic fact every
//      other player-only step in `tick` reads), so the headless M0A acceptance
//      corpus never appends a row and stays byte-identical.
//   6. SPARSE BY CONSTRUCTION. Only the families below are recorded; routine
//      weekly awareness settling receipts are kept in full for a bounded window
//      and then FOLDED into one exact per-window summary (aggregate provenance
//      kept; per-week detail is what the window trades). Milestones are permanent.
//   7. SIGNIFICANCE IS DECIDED HERE, deterministically, from the facts — never
//      by presentation, never by an opaque importance score.
//
// This module is pure: no RNG, no clock, no I/O.

import { economyEngaged } from './employment.js'
import { TUNING } from './tuning.js'
import type {
  GameState,
  Standing,
  StudioHistoryEvent,
  StudioHistorySignificance,
  StudioHistoryState,
  StudioHistorySubject,
} from './types.js'

/** Weeks of routine (weekly-settling) receipts retained in full before folding. */
export const HISTORY_ROUTINE_WINDOW_WEEKS = 52 as const

/** A Standing delta at or above this magnitude on any channel is a MAJOR history moment. */
export const HISTORY_STANDING_MAJOR_DELTA = 3 as const

/** The empty history a freshly generated world carries (recording begins at week 0). */
export function initialStudioHistory(): StudioHistoryState {
  return { recordingStartedWeek: 0, nextEventId: 0, rows: [] }
}

/**
 * The history a migrated (pre-P08) save receives: recording begins at the week
 * the save was migrated. NO row is invented for anything before it.
 */
export function migratedStudioHistory(currentWeek: number): StudioHistoryState {
  return { recordingStartedWeek: currentWeek, nextEventId: 0, rows: [] }
}

/** True when the studio was recording history at `week` (the honesty boundary). */
export function historyRecordedAt(history: StudioHistoryState, week: number): boolean {
  return week >= history.recordingStartedWeek
}

/** A DISTRIBUTIVE Omit: applied to each union member, so the discriminant survives. */
type DistributiveOmit<T, K extends keyof T> = T extends unknown ? Omit<T, K> : never

/** One draft: a row WITHOUT its `eventId` (the commit stamps identity). */
export type StudioHistoryDraft = DistributiveOmit<StudioHistoryEvent, 'eventId'>

/** A draft WITHOUT its significance (the classifier decides it). */
export type StudioHistoryFacts = DistributiveOmit<StudioHistoryDraft, 'significance'>

/**
 * The caller-owned collector a pipeline fills in deterministic order (the
 * `StudioEventSink` shape). The gate lives here: a disabled sink discards, so
 * every producer stays exactly the code it was on the headless path.
 */
export class StudioHistorySink {
  private readonly drafts: StudioHistoryDraft[] = []

  constructor(private readonly recording: boolean) {}

  get enabled(): boolean {
    return this.recording
  }

  append(draft: StudioHistoryDraft): void {
    if (!this.recording) return
    this.drafts.push(draft)
  }

  drain(): readonly StudioHistoryDraft[] {
    return this.drafts
  }
}

export function disabledStudioHistorySink(): StudioHistorySink {
  return new StudioHistorySink(false)
}

export function standingDeltas(before: Standing, after: Standing): Standing {
  return {
    audienceAwareness: after.audienceAwareness - before.audienceAwareness,
    industryPrestige: after.industryPrestige - before.industryPrestige,
    commercialConfidence: after.commercialConfidence - before.commercialConfidence,
  }
}

export function standingChanged(before: Standing, after: Standing): boolean {
  return (
    before.audienceAwareness !== after.audienceAwareness ||
    before.industryPrestige !== after.industryPrestige ||
    before.commercialConfidence !== after.commercialConfidence
  )
}

function maxAbsDelta(deltas: Standing): number {
  return Math.max(
    Math.abs(deltas.audienceAwareness),
    Math.abs(deltas.industryPrestige),
    Math.abs(deltas.commercialConfidence),
  )
}

/**
 * The deterministic significance model (P08-REQ-008). Decided from the facts on
 * the draft; presentation may EMPHASIZE by class, never reclassify.
 *
 *   landmark — the studio's defining moments: founding, the first film ever released.
 *   major    — a later release; a Standing change of ≥ HISTORY_STANDING_MAJOR_DELTA
 *              on any channel; a completed facility.
 *   standard — a settled theatrical run; a publicity campaign; a smaller release-driven
 *              Standing change; a committed/moved/demolished facility; a career milestone.
 *   routine  — weekly awareness settling (bounded, then folded).
 */
export function classifyHistorySignificance(
  draft: StudioHistoryFacts,
): StudioHistorySignificance {
  switch (draft.kind) {
    case 'studioFounded':
      return 'landmark'
    case 'filmReleased':
      return draft.firstRelease ? 'landmark' : 'major'
    case 'theatricalRunCompleted':
      return 'standard'
    case 'standingChanged':
      if (draft.source.kind === 'awarenessDrift') return 'routine'
      if (draft.source.kind === 'publicity') return 'standard'
      return maxAbsDelta(draft.deltas) >= HISTORY_STANDING_MAJOR_DELTA ? 'major' : 'standard'
    case 'standingDriftFolded':
      return 'routine'
    case 'facilityCompleted':
      return 'major'
    case 'facilityCommitted':
    case 'facilityDemolished':
    case 'facilityMoved':
      return 'standard'
    case 'careerMilestone':
      return 'standard'
    default: {
      const _exhaustive: never = draft
      throw new Error(`classifyHistorySignificance: unknown kind ${JSON.stringify(_exhaustive)}`)
    }
  }
}

/** Build a complete draft: the caller supplies facts; significance is decided here. */
export function historyDraft(draft: StudioHistoryFacts): StudioHistoryDraft {
  return { ...draft, significance: classifyHistorySignificance(draft) } as StudioHistoryDraft
}

/**
 * Every row carries its OWN subject array and its OWN Standing copies. Sharing a
 * reference between rows (or with the live `studio.standing`) is refused by the
 * UI's identity-consistent canonical-state comparison, and a clone is what a
 * frozen historical fact should be anyway.
 */
export function studioSubject(): StudioHistorySubject[] {
  return [{ kind: 'studio' }]
}

export function cloneStanding(standing: Standing): Standing {
  return {
    audienceAwareness: standing.audienceAwareness,
    industryPrestige: standing.industryPrestige,
    commercialConfidence: standing.commercialConfidence,
  }
}

export function filmSubject(productionId: string): readonly StudioHistorySubject[] {
  return [{ kind: 'film', productionId }]
}

/**
 * Stamp and append everything a sink collected, in append order, then fold any
 * routine rows that have aged past the window. `nextEventId` only ever counts up.
 */
export function commitStudioHistory(
  history: StudioHistoryState,
  sink: StudioHistorySink,
  currentWeek: number,
): StudioHistoryState {
  const collected = sink.drain()
  if (collected.length === 0) return foldRoutineHistory(history, currentWeek)
  return appendStudioHistory(history, collected, currentWeek)
}

/** Append drafts (already ordered) and fold. Pure. */
export function appendStudioHistory(
  history: StudioHistoryState,
  drafts: readonly StudioHistoryDraft[],
  currentWeek: number,
): StudioHistoryState {
  if (drafts.length === 0) return foldRoutineHistory(history, currentWeek)
  let eventId = history.nextEventId
  const lastWeek = history.rows.length > 0 ? history.rows[history.rows.length - 1]!.week : -1
  const rows: StudioHistoryEvent[] = [...history.rows]
  for (const draft of drafts) {
    if (!Number.isInteger(draft.week) || draft.week < history.recordingStartedWeek) {
      throw new Error(
        `studioHistory: refusing to record week ${String(draft.week)} before the recording boundary ` +
          `(week ${String(history.recordingStartedWeek)})`,
      )
    }
    if (draft.week < lastWeek) {
      throw new Error(
        `studioHistory: refusing to record week ${String(draft.week)} behind the last recorded week ${String(lastWeek)}`,
      )
    }
    rows.push({ eventId, ...draft } as StudioHistoryEvent)
    eventId += 1
  }
  return foldRoutineHistory({ ...history, nextEventId: eventId, rows }, currentWeek)
}

/**
 * Fold routine weekly-settling receipts older than the window into one exact
 * per-window summary row. A PURE function of `currentWeek`: same history, same
 * week, same answer on every replay. Milestone rows are never touched;
 * `nextEventId` never rewinds (a folded row takes a NEW id, and the ids of the
 * rows it replaced are simply never reused — exactly the compaction discipline
 * `studioEvents` already keeps).
 *
 * Folding is deterministic about WHICH rows it covers: every routine
 * `standingChanged` row whose week is ≤ currentWeek − HISTORY_ROUTINE_WINDOW_WEEKS,
 * grouped by the HISTORY_ROUTINE_WINDOW_WEEKS-wide bucket its week falls in
 * (bucket = floor(week / window)). A bucket is folded only when it is entirely
 * behind the window, so a fold never splits a bucket across two commits.
 */
export function foldRoutineHistory(
  history: StudioHistoryState,
  currentWeek: number,
): StudioHistoryState {
  const window = HISTORY_ROUTINE_WINDOW_WEEKS
  const horizon = currentWeek - window
  if (!history.rows.some((row) => row.kind === 'standingChanged' && row.significance === 'routine' && row.week <= horizon)) {
    return history
  }
  // Group foldable routine rows by bucket; a bucket is foldable only when every
  // week it could contain is ≤ horizon (bucketEnd ≤ horizon).
  const buckets = new Map<number, StudioHistoryEvent[]>()
  for (const row of history.rows) {
    if (row.kind !== 'standingChanged' || row.significance !== 'routine') continue
    const bucket = Math.floor(row.week / window)
    const bucketEnd = bucket * window + window - 1
    if (bucketEnd > horizon) continue
    const list = buckets.get(bucket) ?? []
    list.push(row)
    buckets.set(bucket, list)
  }
  if (buckets.size === 0) return history
  const folded = new Set<number>()
  const summaries: StudioHistoryEvent[] = []
  let eventId = history.nextEventId
  for (const bucket of [...buckets.keys()].sort((a, b) => a - b)) {
    const list = buckets.get(bucket)!
    for (const row of list) folded.add(row.eventId)
    const first = list[0]! as Extract<StudioHistoryEvent, { kind: 'standingChanged' }>
    const last = list[list.length - 1]! as Extract<StudioHistoryEvent, { kind: 'standingChanged' }>
    summaries.push({
      eventId,
      week: last.week,
      kind: 'standingDriftFolded',
      significance: 'routine',
      subjects: studioSubject(),
      weekStart: first.week,
      weekEnd: last.week,
      count: list.length,
      before: cloneStanding(first.before),
      after: cloneStanding(last.after),
      deltas: standingDeltas(first.before, last.after),
      formulaVersion: last.formulaVersion,
    })
    eventId += 1
  }
  // Keep rows in append order: surviving rows, then the summaries (whose weeks are
  // all ≤ horizon, i.e. ≤ every surviving routine row's week; milestone rows may be
  // older, which is fine — order is by eventId, and the timeline sorts by week).
  const kept = history.rows.filter((row) => !folded.has(row.eventId))
  return { ...history, nextEventId: eventId, rows: [...kept, ...summaries] }
}

/**
 * The public-boundary invariants (validated at save boundaries and tick entry;
 * every violation THROWS — fail closed, never repair silently):
 *   H1 rows are in strictly ascending eventId order, all < nextEventId;
 *   H2 no row precedes the recording boundary;
 *   H3 every standingChanged row's deltas equal after − before exactly;
 *   H4 every folded row covers weekStart ≤ weekEnd and count ≥ 1;
 *   H5 numbers are finite.
 */
export function assertStudioHistoryInvariants(history: StudioHistoryState, context: string): void {
  if (!Number.isInteger(history.recordingStartedWeek) || history.recordingStartedWeek < 0) {
    throw new Error(`${context}: studioHistory.recordingStartedWeek is malformed`)
  }
  if (!Number.isInteger(history.nextEventId) || history.nextEventId < 0) {
    throw new Error(`${context}: studioHistory.nextEventId is malformed`)
  }
  let previousId = -1
  for (const row of history.rows) {
    if (!Number.isInteger(row.eventId) || row.eventId <= previousId) {
      throw new Error(`${context}: studioHistory rows out of ascending eventId order at ${String(row.eventId)}`)
    }
    if (row.eventId >= history.nextEventId) {
      throw new Error(`${context}: studioHistory row ${String(row.eventId)} is not below nextEventId`)
    }
    if (!Number.isInteger(row.week) || row.week < history.recordingStartedWeek) {
      throw new Error(`${context}: studioHistory row ${String(row.eventId)} precedes the recording boundary`)
    }
    previousId = row.eventId
    if (row.kind === 'standingChanged') {
      const expected = standingDeltas(row.before, row.after)
      for (const key of ['audienceAwareness', 'industryPrestige', 'commercialConfidence'] as const) {
        if (!Number.isFinite(row.before[key]) || !Number.isFinite(row.after[key]) || row.deltas[key] !== expected[key]) {
          throw new Error(`${context}: studioHistory row ${String(row.eventId)} carries deltas that do not equal after − before`)
        }
      }
    }
    if (row.kind === 'standingDriftFolded') {
      if (row.weekStart > row.weekEnd || row.count < 1 || row.weekEnd !== row.week) {
        throw new Error(`${context}: studioHistory folded row ${String(row.eventId)} is malformed`)
      }
    }
  }
}

// ── read-only selectors (pure; the projection layer composes these) ──────────

/** The chronology: rows sorted by week, then eventId (deterministic). */
export function studioHistoryChronology(history: StudioHistoryState): readonly StudioHistoryEvent[] {
  return [...history.rows].sort((a, b) => (a.week - b.week) || (a.eventId - b.eventId))
}

/** Every recorded Standing receipt (routine included) in chronology order. */
export function standingReceipts(
  history: StudioHistoryState,
): readonly Extract<StudioHistoryEvent, { kind: 'standingChanged' | 'standingDriftFolded' }>[] {
  return studioHistoryChronology(history).filter(
    (row): row is Extract<StudioHistoryEvent, { kind: 'standingChanged' | 'standingDriftFolded' }> =>
      row.kind === 'standingChanged' || row.kind === 'standingDriftFolded',
  )
}

/** The main-timeline rows: everything except routine detail (P08-REQ-007). */
export function studioHistoryTimeline(history: StudioHistoryState): readonly StudioHistoryEvent[] {
  return studioHistoryChronology(history).filter((row) => row.significance !== 'routine')
}

/** Whether a given state is recording (the same gate `tick` uses). */
export function studioHistoryRecording(state: GameState): boolean {
  return economyEngaged(state)
}

export const HISTORY_TUNING_ECHO = Object.freeze({
  routineWindowWeeks: HISTORY_ROUTINE_WINDOW_WEEKS,
  majorStandingDelta: HISTORY_STANDING_MAJOR_DELTA,
  eventWindowWeeks: TUNING.STUDIO_EVENT_WINDOW_WEEKS,
})
