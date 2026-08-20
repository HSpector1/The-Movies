import {
  applyActions,
  stableStringify,
} from '../../../../src/core/index.ts'
import type {
  Action,
  CommissionOriginalScreenplayPayload,
  CommissionScriptPayload,
  GameState,
  ProductionQueueEntry,
} from '../../../../src/core/index.ts'

export type LotCommissionQueueReceipt = {
  kind: 'screenplay-commission-queued'
  ordinal: number
  queuedWeek: number
  subject:
    | { kind: 'market'; conceptId: string; title: string }
    | { kind: 'original'; writerId: string }
}

export type LotGreenlightQueueReceipt = {
  kind: 'greenlight-queued'
  ordinal: number
  queuedWeek: number
  scriptProjectId: string
  title: string
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0
}

function isNonNegativeSafeInteger(value: unknown): value is number {
  return Number.isSafeInteger(value) && (value as number) >= 0
}

function sameClosedValue(left: unknown, right: unknown): boolean {
  return stableStringify(left) === stableStringify(right)
}

function appendedQueueEntry(
  before: GameState,
  after: GameState,
): ProductionQueueEntry | null {
  if (
    before === after ||
    !Array.isArray(before.productionQueue) ||
    !Array.isArray(after.productionQueue) ||
    after.productionQueue.length !== before.productionQueue.length + 1
  ) return null
  for (let index = 0; index < before.productionQueue.length; index += 1) {
    if (!sameClosedValue(before.productionQueue[index], after.productionQueue[index])) return null
  }
  return after.productionQueue.at(-1) ?? null
}

/**
 * Re-run the pure TypeScript action and require the whole successor to agree.
 * The UI therefore witnesses queue admission without reproducing queue, event, or
 * legality rules, and any malformed/partial successor fails closed.
 */
function isExactActionSuccessor(before: GameState, after: GameState, action: Action): boolean {
  const expected = applyActions(before, [action])
  return sameClosedValue(expected, after)
}

function uniqueConceptTitle(state: GameState, conceptId: string): string | null {
  const matches = state.concepts.filter((concept) => concept.id === conceptId)
  const title = matches.length === 1 ? matches[0]?.title : null
  return isNonEmptyString(title) ? title : null
}

/** Prove that this exact market-premise request, and nothing else, joined the queue. */
export function acceptedQueuedScreenplayCommissionReceipt(
  before: GameState,
  after: GameState,
  payload: CommissionScriptPayload,
): LotCommissionQueueReceipt | null {
  try {
    const entry = appendedQueueEntry(before, after)
    if (
      entry?.kind !== 'commissionScript' ||
      !isNonNegativeSafeInteger(entry.ordinal) ||
      !isNonNegativeSafeInteger(entry.queuedWeek) ||
      entry.queuedWeek !== before.market.tick ||
      !sameClosedValue(entry.payload, payload) ||
      !isExactActionSuccessor(before, after, { kind: 'commissionScript', project: payload })
    ) return null
    const title = uniqueConceptTitle(before, payload.conceptId)
    if (title === null) return null
    return {
      kind: 'screenplay-commission-queued',
      ordinal: entry.ordinal,
      queuedWeek: entry.queuedWeek,
      subject: { kind: 'market', conceptId: payload.conceptId, title },
    }
  } catch {
    return null
  }
}

/** Prove an original request joined the queue without claiming a not-yet-minted screenplay. */
export function acceptedQueuedOriginalCommissionReceipt(
  before: GameState,
  after: GameState,
  payload: CommissionOriginalScreenplayPayload,
): LotCommissionQueueReceipt | null {
  try {
    const entry = appendedQueueEntry(before, after)
    if (
      entry?.kind !== 'commissionOriginalScreenplay' ||
      !isNonNegativeSafeInteger(entry.ordinal) ||
      !isNonNegativeSafeInteger(entry.queuedWeek) ||
      entry.queuedWeek !== before.market.tick ||
      !isNonEmptyString(payload.writerId) ||
      !sameClosedValue(entry.payload, payload) ||
      !isExactActionSuccessor(
        before,
        after,
        { kind: 'commissionOriginalScreenplay', screenplay: payload },
      )
    ) return null
    return {
      kind: 'screenplay-commission-queued',
      ordinal: entry.ordinal,
      queuedWeek: entry.queuedWeek,
      subject: { kind: 'original', writerId: payload.writerId },
    }
  } catch {
    return null
  }
}

/**
 * Prove an exact Ready-screenplay package joined the queue. No production identity
 * exists at this boundary, so the receipt deliberately carries only project truth.
 */
export function acceptedQueuedGreenlightReceipt(
  before: GameState,
  after: GameState,
  scriptProjectId: string,
): LotGreenlightQueueReceipt | null {
  try {
    const entry = appendedQueueEntry(before, after)
    if (
      entry?.kind !== 'greenlightScriptProject' ||
      !isNonEmptyString(scriptProjectId) ||
      entry.scriptProjectId !== scriptProjectId ||
      entry.payload.projectId !== scriptProjectId ||
      !isNonNegativeSafeInteger(entry.ordinal) ||
      !isNonNegativeSafeInteger(entry.queuedWeek) ||
      entry.queuedWeek !== before.market.tick ||
      !isExactActionSuccessor(
        before,
        after,
        { kind: 'greenlightScriptProject', production: entry.payload },
      )
    ) return null
    const projects = before.scriptDevelopment.projects.filter(
      (project) => project.id === scriptProjectId,
    )
    const project = projects.length === 1 ? projects[0] : null
    if (project === null) return null
    const title = uniqueConceptTitle(before, project.conceptId)
    if (title === null) return null
    return {
      kind: 'greenlight-queued',
      ordinal: entry.ordinal,
      queuedWeek: entry.queuedWeek,
      scriptProjectId,
      title,
    }
  } catch {
    return null
  }
}
