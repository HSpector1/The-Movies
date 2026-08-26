// ── studioEvents — the studio's own domain history (charter §5) ──────────────
//
// WHAT THIS IS. A persisted, engine-appended ledger of the meaningful things that
// happened to this studio: a picture wrapped, a building opened, a set went up, a
// premiere played. It is the answer to a question the UI has been asking by
// re-deriving it seventeen different ways — "what changed since I last looked?" —
// and re-deriving it is why a reload loses the answer.
//
// THE PINS (§5, adjudicated; each one is load-bearing, none is decoration):
//
//   1. APPENDED ONLY BY `src/core`. The adapter is the boundary layer, not the
//      engine. Nothing outside this package writes a row.
//
//   2. DOMAIN HISTORY ONLY (owner ruling `00E`.15, binding). Authoritative facts
//      about the studio — never a toast, an animation cue, a sound trigger, or
//      hover chatter. A 120-year save is not a presentation archive. If a row
//      cannot justify itself as history, it does not belong here.
//
//   3. WITNESS, NEVER INPUT. Nothing in the simulation reads this log to decide
//      anything. The ONE exception is `persistedProductionIds` (law 20), which
//      walks Tier D so a retired identity can never be re-minted.
//
//   4. TWO TIERS, and the tier is a property of the KIND:
//        Tier D — identity-bearing, PERMANENT: premiere, wrapped,
//                 constructionCompleted, setBuilt, setRetired.
//        Tier W — WINDOWED by `TUNING.STUDIO_EVENT_WINDOW_WEEKS`: reservation
//                 grants/releases, phase entries, scenery arrivals, queue
//                 admissions and expiries.
//      Compaction is a PURE FUNCTION of `market.tick`, so two identical
//      playthroughs compact identically. `nextSeq` never rewinds — compaction
//      removes rows, it never renumbers them.
//
//   5. NO `seen` / `consumed` FIELD, EVER. Exact-once delivery is
//      "idempotent above a cursor", and the cursor lives OUTSIDE GameState. A
//      consumption marker written here would make two identical runs export
//      different bytes, which is the one thing the save format may never do.
//
//   6. EMPTY ON THE LEGACY/HEADLESS PATH. The gate is `operations.mode ===
//      'managed'`. A world with no studio operations has no studio history, so
//      the M0A acceptance corpus stays byte-identical without re-baselining.
//
//   7. WINDOWING APPLIES HERE ONLY. The cash `state.ledger` is permanent history
//      and is never pruned (`00B`.5).
//
// This module is pure: no RNG, no clock, no I/O. The one mutable thing it offers
// is a caller-owned collector (`StudioEventSink`) that a pipeline step fills in
// order and the pipeline stamps at the end — the same accumulator shape `tick`
// already uses for the cash ledger.

import { TUNING } from './tuning.js'
import type {
  ProductionPhase,
  StudioEvent,
  StudioEventKind,
  StudioEventLog,
} from './types.js'

/**
 * The permanent tier. These rows carry identity — a production, a film, a
 * building, a set — and an identity that vanishes from history is an identity the
 * engine could hand out twice.
 */
export const TIER_D_STUDIO_EVENT_KINDS: readonly StudioEventKind[] = Object.freeze([
  'wrapped',
  'premiere',
  'constructionCompleted',
  'setBuilt',
  'setRetired',
]) as readonly StudioEventKind[]

/** True when the kind is permanent. Everything else is windowed. */
export function isTierDStudioEventKind(kind: StudioEventKind): boolean {
  return TIER_D_STUDIO_EVENT_KINDS.includes(kind)
}

/** The empty log every legacy, headless, and freshly generated world carries. */
export function emptyStudioEventLog(): StudioEventLog {
  return { nextSeq: 0, rows: [] }
}

/**
 * One fact, stated by the producer that observed it, WITHOUT its `seq` or `week`.
 *
 * Sequence and week are not the producer's business: `seq` is the log's ordering
 * authority and `week` is the authoritative clock, and letting a producer invent
 * either is how two of them disagree. The recording boundary stamps both.
 */
export type StudioEventDraft =
  | { kind: 'wrapped'; productionId: string; stageFacilityId: string; setId: string | null }
  | { kind: 'premiere'; filmId: string }
  | { kind: 'constructionCompleted'; placementId: string }
  | { kind: 'setBuilt'; setId: string }
  | { kind: 'setRetired'; setId: string; refund: number }
  | { kind: 'reservationGranted'; ownerId: string; resourceKey: string }
  | { kind: 'reservationReleased'; ownerId: string; resourceKey: string }
  | { kind: 'phaseEntered'; productionId: string; phase: ProductionPhase }
  | { kind: 'sceneryArrived'; productionId: string }
  | { kind: 'queueAdmitted'; entryKind: string; ordinal: number }
  | {
      kind: 'queueIntentExpired'
      entryKind: string
      ordinal: number
      reason: string
      // P04A: the subject's identity, captured via `queueEntrySubjectId(entry)`
      // BEFORE the entry is removed from the queue — at both the dequeue-expiry
      // site (queueAdmission.ts) and the cancel site (actions.ts). `null` only
      // for events migrated forward from a pre-V15 save, which recorded no such
      // identity and must never have one guessed for it.
      subjectId: string | null
    }

/** A draft plus the week its own domain calls authoritative (see `StudioEventSink`). */
type StampedDraft = { draft: StudioEventDraft; week: number }

/**
 * The caller-owned collector a pipeline step fills.
 *
 * WHY A SINK AND NOT A RETURN VALUE. The producers are deep inside the allocation
 * path — `allocateForPhase` refuses or grants five different ways — and threading
 * an events array back out through every arm would rewrite functions this
 * milestone is contractually required to leave behaviour-identical. A sink is the
 * accumulator `tick` already uses for the cash ledger: caller-owned, filled in
 * deterministic call order, never read by the simulation.
 *
 * THE GATE LIVES HERE. `disabledStudioEventSink()` is a real sink that discards,
 * so a legacy/headless caller passes one and every producer downstream stays
 * exactly the code it was — no `if (managed)` sprinkled through the engine.
 */
export class StudioEventSink {
  private readonly drafts: StampedDraft[] = []

  constructor(
    /** The week the recording context is in. Producers inherit it. */
    private readonly baseWeek: number,
    /** False for the legacy/headless path: every append is discarded. */
    private readonly recording: boolean,
  ) {}

  /** True when this sink will keep what it is given. */
  get enabled(): boolean {
    return this.recording
  }

  /**
   * Record one fact.
   *
   * `week` overrides the sink's base week for the rare producer whose own domain
   * already owns an authoritative week — a placed facility's `completesWeek` is
   * the week the building opened, and stamping the row a week earlier would make
   * the log disagree with the record it describes.
   */
  append(draft: StudioEventDraft, week?: number): void {
    if (!this.recording) return
    this.drafts.push({ draft, week: week ?? this.baseWeek })
  }

  /** Everything recorded, in append order. */
  drain(): readonly StampedDraft[] {
    return this.drafts
  }
}

/** The sink a legacy or headless caller passes. It keeps nothing. */
export function disabledStudioEventSink(): StudioEventSink {
  return new StudioEventSink(0, false)
}

/**
 * Stamp and append everything a sink collected, then compact.
 *
 * `seq` is assigned in append order from `nextSeq`, which only ever counts up.
 * Compaction runs immediately afterwards over the SAME week, so the log a caller
 * gets back is already at its steady-state size for that week.
 */
export function commitStudioEvents(
  log: StudioEventLog,
  sink: StudioEventSink,
  compactionWeek: number,
): StudioEventLog {
  const collected = sink.drain()
  if (collected.length === 0) return compactStudioEvents(log, compactionWeek)
  let seq = log.nextSeq
  const rows: StudioEvent[] = [...log.rows]
  for (const { draft, week } of collected) {
    rows.push({ seq, week, ...draft } as StudioEvent)
    seq += 1
  }
  return compactStudioEvents({ nextSeq: seq, rows }, compactionWeek)
}

/**
 * Drop every Tier-W row older than the retention window. A PURE function of the
 * authoritative week: same log, same week, same answer, on every machine and
 * every replay.
 *
 * The window is INCLUSIVE of the current week and the `STUDIO_EVENT_WINDOW_WEEKS
 * - 1` weeks before it, so a window of 26 keeps exactly half a year of operating
 * chatter. Tier D is never touched, and `nextSeq` is carried through untouched:
 * compaction removes rows, it never renumbers them.
 *
 * A week BEFORE the log's own rows (a forged or rewound clock) is refused rather
 * than silently deleting the whole log.
 */
export function compactStudioEvents(log: StudioEventLog, week: number): StudioEventLog {
  if (log.rows.length === 0) return log
  const oldestKeptWeek = week - (TUNING.STUDIO_EVENT_WINDOW_WEEKS - 1)
  const kept = log.rows.filter(
    (row) => isTierDStudioEventKind(row.kind) || row.week >= oldestKeptWeek,
  )
  if (kept.length === log.rows.length) return log
  return { nextSeq: log.nextSeq, rows: kept }
}

/**
 * Every production identity this log has ever recorded. Walked by
 * `persistedProductionIds` (law 20) and by nothing else in `src/core` — that
 * exclusivity is the "witness, never input" pin, and it has its own invariant
 * test.
 *
 * Only Tier D contributes, because only Tier D is permanent: an identity whose
 * only trace was a windowed row would become re-mintable the week that row aged
 * out. Queue rows never carry a production id by construction, so there is
 * nothing to walk on the Tier-W side.
 */
export function studioEventProductionIds(log: StudioEventLog | undefined): string[] {
  const ids: string[] = []
  // `undefined` is a legitimate input, not a defect: `persistedProductionIds`
  // runs inside invariants the save validators apply to FROZEN pre-V14
  // fragments, and a state that predates this root reserves no identities.
  for (const row of log?.rows ?? []) {
    if (row.kind === 'wrapped') ids.push(row.productionId)
    else if (row.kind === 'premiere') ids.push(row.filmId)
  }
  return ids
}
