// ── The inserted admission step (charter §3.3) ───────────────────────────────
//
// C2a-M4, tick step 1.05. INSERTION, NOT A REORDERING — D-12 §9's ratified rule,
// the same one steps 1.5/1.6/1.7 land under (`tick.ts:18`). It sits AFTER
// production allocation and BEFORE construction completion, and both halves of
// that position are load-bearing:
//
//   * AFTER production allocation, so a slot released this week by a picture
//     moving on — or by the resource-release law letting a wrapped picture drop
//     the stage it no longer needs — is visible to the queue in the SAME visible
//     week. The player who watches a film wrap and the next one start that same
//     week is watching the truth.
//   * BEFORE construction completion, so a building that opens during this
//     advance contributes nothing to it. A site is still a site for the week it
//     finishes in; that law has held since V11 and the queue does not get to
//     break it.
//
// HEAD-OF-LINE, DELIBERATELY. All four arms contend for the one Development &
// Casting slot, so the queue is ONE queue and the row at its head is genuinely
// next. When the head cannot be granted, admission stops for the week rather than
// serving the row behind it: a queue that lets later intents overtake is not a
// queue, it is a lottery with a waiting room.

import { commitQueuedIntent } from './actions.js'
import {
  gateSlotAvailable,
  queueInPriorityOrder,
  removeQueueEntry,
} from './productionQueue.js'
import type { StudioEventSink } from './studioEvents.js'
import type { GameState } from './types.js'

export type QueueAdmissionResult = {
  state: GameState
  /** Ordinals granted this week, in the order they were granted. */
  granted: readonly number[]
  /** Ordinals dropped at revalidation this week, in the order they were dropped. */
  expired: readonly number[]
}

/**
 * Grant every queued intent this week's capacity can carry, longest-waiting-first.
 *
 * REVALIDATION IS THE COMMIT ITSELF (§3.3). An intent is not trusted because it
 * was legal when it was admitted: it is put to the engine's own verb against the
 * state of THIS week, and if the engine refuses it for any reason other than the
 * slot it is waiting for, the intent expires and the engine's own sentence is the
 * stated reason on its Tier-W row. Nothing was held while it waited, so nothing
 * is released when it drops.
 */
export function admitQueuedIntents(
  state: GameState,
  week: number,
  events: StudioEventSink,
): QueueAdmissionResult {
  const granted: number[] = []
  const expired: number[] = []
  if (state.operations.mode !== 'managed' || state.productionQueue.length === 0) {
    return { state, granted, expired }
  }

  let next = state
  for (const entry of queueInPriorityOrder(state.productionQueue)) {
    // The gate, asked of the state as it stands after every grant so far: two
    // intents can be admitted in one week if two slots came free in one week.
    if (!gateSlotAvailable(next)) break
    const result = commitQueuedIntent(next, entry, week, events)
    if (result.outcome === 'granted') {
      next = {
        ...result.state,
        productionQueue: removeQueueEntry(result.state.productionQueue, entry.ordinal),
      }
      granted.push(entry.ordinal)
      continue
    }
    if (result.outcome === 'expired') {
      events.append({
        kind: 'queueIntentExpired',
        entryKind: entry.kind,
        ordinal: entry.ordinal,
        reason: result.reason,
      })
      next = { ...next, productionQueue: removeQueueEntry(next.productionQueue, entry.ordinal) }
      expired.push(entry.ordinal)
      continue
    }
    // 'waiting' — the gate said there was a slot and the verb disagreed. Keep the
    // row exactly where it is and stop: the head of a queue does not lose its
    // place to the row behind it.
    break
  }
  return { state: next, granted, expired }
}
