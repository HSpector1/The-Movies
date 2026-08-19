// ── The production queue — Phase-Gate Admission (charter §3.3) ───────────────
//
// C2a-M4. THE CAP IS GONE, so a front door that used to refuse a fully-legal,
// fully-funded, fully-staffed picture because a room was busy now ADMITS it and
// makes it wait. This module owns the waiting: the row, the ordinal, the order,
// and the one question every front door asks before it commits ("is there a
// Development & Casting slot free right now?").
//
// Three laws, from §3.3, and every one of them is a law about honesty rather than
// about scheduling:
//
//   * NOTHING IS HELD WHILE QUEUED. A queue row is an intent, not a claim: no
//     reservation, no cash, no talent lock, no minted concept id. That is what
//     makes an expired intent free — it orphans nothing, because it took nothing.
//   * THE PAYLOAD IS PERSISTED WHOLE AND REVALIDATED AT DEQUEUE. A row is not
//     trusted because it was legal when it was admitted; it is re-put to the
//     engine's own refusals at the moment the slot is granted, and an intent that
//     is no longer legal drops with a Tier-W `queueIntentExpired` row that states
//     the engine's own reason.
//   * THE ORDER IS LONGEST-WAITING-FIRST, ORDINAL TIE-BREAK. Deterministic, no
//     clock, no timestamp race — the two terms are integers in the save file.
//
// This module is pure: no RNG, no clock, no I/O. It knows what a queue row IS and
// what order the rows are in; it does not know how to COMMIT one. That is the
// commit authority's job (`actions.ts`), because a queued verb and a played verb
// must be the same verb — one implementation, or the queue quietly becomes a
// second game.

import { facilitySlotKey, occupiedResourceSlots } from './occupancy.js'
import type {
  CommissionOriginalScreenplayPayload,
  CommissionScriptPayload,
  FacilityCapability,
  GameState,
  GreenlightScriptProjectPayload,
  ProductionQueueEntry,
  StartCastingSessionPayload,
  StudioOperations,
} from './types.js'

/**
 * The capability every front door contends for.
 *
 * All four arms — a pool commission, an original commission, an audition, and a
 * greenlight's production workflow — take exactly one `development-casting` slot
 * at the moment they commit. So there is ONE queue, not four, and the row at its
 * head is genuinely the next thing the studio will start.
 */
export const QUEUE_GATE_CAPABILITY: FacilityCapability = 'development-casting'

/**
 * THE ONE QUEUEABLE REFUSAL.
 *
 * A capacity refusal at a front door is the ONLY refusal that becomes a wait; a
 * picture with no writer, no cash, or no legal package is still refused, loudly
 * and immediately, at the moment it is asked for. So the capacity refusal is a
 * NAMED TYPE rather than a string a caller has to recognise — the front door
 * catches this and nothing else, and the dequeue does the same, which is what
 * keeps "queue, don't magically forbid" from quietly becoming "queue everything".
 *
 * It is thrown by the three allocators that own the gate (`scriptDevelopment`,
 * `castingSessions`, `operations`) and it stays a plain `Error` subclass, so
 * every existing catch site, message assertion and harness abort reads exactly
 * what it read before.
 */
export class QueueableCapacityRefusal extends Error {
  readonly capability: FacilityCapability
  constructor(message: string, capability: FacilityCapability = QUEUE_GATE_CAPABILITY) {
    super(message)
    this.name = 'QueueableCapacityRefusal'
    this.capability = capability
  }
}

/**
 * The first free Development & Casting slot, from the ONE union producer — the
 * same walk (facilities ascending by id, slots ascending) that
 * `allocateScriptReservation`, `allocateCastingReservation` and `allocateForPhase`
 * all perform, asked as a question instead of as a claim.
 *
 * Asking through `occupiedResourceSlots` rather than re-deriving the occupancy is
 * the whole point: a front door that decides "queue or commit" from a different
 * view than the allocator's would queue a picture the allocator would have
 * admitted, or admit one it then refuses.
 */
export function freeGateSlot(state: GameState): { facilityId: string; slot: number } | null {
  const occupied = occupiedResourceSlots(state)
  const facilities = state.operations.facilities
    .filter((facility) => facility.capability === QUEUE_GATE_CAPABILITY)
    .slice()
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
  for (const facility of facilities) {
    for (let slot = 0; slot < facility.capacity; slot++) {
      if (occupied.has(facilitySlotKey(facility.id, slot))) continue
      return { facilityId: facility.id, slot }
    }
  }
  return null
}

/** True while a front door may commit immediately rather than queue. */
export function gateSlotAvailable(state: GameState): boolean {
  return freeGateSlot(state) !== null
}

/**
 * Whether this state's front doors queue at all.
 *
 * A legacy or headless studio has no facilities and no workflows, and its
 * greenlights never touch the allocation authority — so it has nothing to wait
 * for and nothing to wait in. Its refusals stay refusals.
 */
export function queueingActive(operations: StudioOperations): boolean {
  return operations.mode === 'managed'
}

/**
 * The next ordinal, derived from the queue itself.
 *
 * V14 (§8.1) carries the queue and no counter beside it, and the save validator
 * requires the ordinals of the live rows to be STRICTLY ASCENDING — the ordinal
 * is the fairness guarantee AMONG THE ROWS THAT ARE WAITING, which is the only
 * population it ever orders. So the successor of the last row is the whole rule,
 * and a drained queue starts again at 0 without ordering anything differently.
 */
export function nextQueueOrdinal(queue: readonly ProductionQueueEntry[]): number {
  const last = queue[queue.length - 1]
  return last === undefined ? 0 : last.ordinal + 1
}

/** Append an intent at the back of the queue, stamped with its ordinal and week. */
function appendIntent(
  queue: readonly ProductionQueueEntry[],
  row: Omit<ProductionQueueEntry, 'ordinal' | 'queuedWeek'> & Record<string, unknown>,
  week: number,
): readonly ProductionQueueEntry[] {
  return [
    ...queue,
    { ...row, ordinal: nextQueueOrdinal(queue), queuedWeek: week } as ProductionQueueEntry,
  ]
}

export function queueCommissionScript(
  queue: readonly ProductionQueueEntry[],
  payload: CommissionScriptPayload,
  week: number,
): readonly ProductionQueueEntry[] {
  return appendIntent(queue, { kind: 'commissionScript', payload }, week)
}

export function queueCommissionOriginalScreenplay(
  queue: readonly ProductionQueueEntry[],
  payload: CommissionOriginalScreenplayPayload,
  week: number,
): readonly ProductionQueueEntry[] {
  return appendIntent(queue, { kind: 'commissionOriginalScreenplay', payload }, week)
}

export function queueStartCastingSession(
  queue: readonly ProductionQueueEntry[],
  payload: StartCastingSessionPayload,
  week: number,
): readonly ProductionQueueEntry[] {
  return appendIntent(queue, { kind: 'startCastingSession', payload }, week)
}

export function queueGreenlightScriptProject(
  queue: readonly ProductionQueueEntry[],
  scriptProjectId: string,
  payload: GreenlightScriptProjectPayload,
  week: number,
): readonly ProductionQueueEntry[] {
  return appendIntent(
    queue,
    { kind: 'greenlightScriptProject', scriptProjectId, payload },
    week,
  )
}

/**
 * THE QUEUE ORDER (§3.3): longest-waiting-first, ordinal tie-break.
 *
 * Both terms are integers already in the save file, so the order is a function of
 * state and nothing else — no clock, no insertion-time race, no lexical id hazard.
 * The ordinal breaks ties by admission order, which is what makes two intents
 * queued in the same week resolve in the order the player made them.
 */
export function queueInPriorityOrder(
  queue: readonly ProductionQueueEntry[],
): readonly ProductionQueueEntry[] {
  return [...queue].sort((a, b) => a.queuedWeek - b.queuedWeek || a.ordinal - b.ordinal)
}

/** Remove one row by ordinal. Ordinals are unique, so this removes exactly one. */
export function removeQueueEntry(
  queue: readonly ProductionQueueEntry[],
  ordinal: number,
): readonly ProductionQueueEntry[] {
  return queue.filter((entry) => entry.ordinal !== ordinal)
}

/** How many weeks this intent has been waiting, as of `week`. Never negative. */
export function queueWaitWeeks(entry: ProductionQueueEntry, week: number): number {
  return Math.max(0, week - entry.queuedWeek)
}

/**
 * What this intent is, in the studio's own words — the WHAT WAITS half of law 2.
 *
 * Kept beside the row rather than in a screen, because the Call Board, the queue
 * panel and the event log must all call the same thing by the same name.
 */
export function queueEntryLabel(entry: ProductionQueueEntry): string {
  switch (entry.kind) {
    case 'commissionScript':
      return 'Screenplay commission'
    case 'commissionOriginalScreenplay':
      return 'Original screenplay commission'
    case 'startCastingSession':
      return 'Casting session'
    case 'greenlightScriptProject':
      return 'Greenlight'
  }
}

/** The identity a queue row names, for a surface that has to say WHICH one. */
export function queueEntrySubjectId(entry: ProductionQueueEntry): string {
  switch (entry.kind) {
    case 'commissionScript':
      return entry.payload.conceptId
    case 'commissionOriginalScreenplay':
      return entry.payload.writerId
    case 'startCastingSession':
      return entry.payload.projectId
    case 'greenlightScriptProject':
      return entry.scriptProjectId
  }
}
