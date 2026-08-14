import type {
  AttentionState,
  LotProductionCommand,
  ProductionOperationsState,
  StudioLotSnapshot,
} from './StudioLotSnapshot.ts'

export type Stage7ProductionOwnerIntent = {
  productionId: string
  locationBuildingId: 'stage-a'
}

export type Stage7ProductionDetailContext = {
  operation: ProductionOperationsState
  ownerIntent: Stage7ProductionOwnerIntent
}

const TASK_STATUSES = new Set([
  'unassigned',
  'blocked',
  'ready',
  'scheduled',
  'completed',
])

const ATTENTION_STATES = new Set<AttentionState>([
  'normal',
  'active',
  'positive',
  'warning',
  'decision-required',
  'empty',
  'future',
  'recently-completed',
])

const BLOCKER_KINDS = new Set([
  'facility-capacity',
  'director-dispatch',
  'scenery-load-in',
  'take-scheduling',
])

const COMMAND_KINDS = new Set([
  'assignShootingDirector',
  'clearSceneryLoadIn',
  'scheduleShootingTake',
])

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function hasValidBlocker(value: unknown): boolean {
  if (value === null) return true
  return isRecord(value) &&
    typeof value.kind === 'string' &&
    BLOCKER_KINDS.has(value.kind) &&
    isNonEmptyString(value.headline) &&
    isNonEmptyString(value.detail)
}

function hasValidCommand(
  value: unknown,
  productionId: string,
  directorId: string,
): boolean {
  if (value === null) return true
  if (
    !isRecord(value) ||
    typeof value.kind !== 'string' ||
    !COMMAND_KINDS.has(value.kind) ||
    value.productionId !== productionId ||
    !isNonEmptyString(value.label)
  ) return false

  return value.kind !== 'assignShootingDirector' || value.directorId === directorId
}

/**
 * Select the one structurally valid Engine-owned Soundstage 7 production.
 *
 * This is deliberately a validation boundary, not a second production rules
 * engine. It validates the closed projection shape and identity relationships,
 * but does not infer blocker/command legality from phase or task status.
 */
export function stage7ProductionDetailContext(
  snapshot: StudioLotSnapshot,
): Stage7ProductionDetailContext | null {
  if (
    snapshot.operationsMode !== 'managed' ||
    snapshot.stageAssignmentAuthority !== 'engine' ||
    !Array.isArray(snapshot.productionOperations)
  ) return null

  const operations: unknown[] = snapshot.productionOperations
  const stage7 = operations.filter(
    (operation): operation is Record<string, unknown> =>
      isRecord(operation) && operation.locationBuildingId === 'stage-a',
  )
  if (stage7.length !== 1) return null

  const operation = stage7[0]!
  if (
    !isNonEmptyString(operation.productionId) ||
    !isNonEmptyString(operation.title) ||
    (operation.phase !== 'rehearsal' && operation.phase !== 'shooting') ||
    !isNonEmptyString(operation.phaseLabel) ||
    !Number.isSafeInteger(operation.weeksRemaining) ||
    (operation.weeksRemaining as number) < 0 ||
    typeof operation.progress01 !== 'number' ||
    !Number.isFinite(operation.progress01) ||
    operation.progress01 < 0 ||
    operation.progress01 > 1 ||
    operation.locationBuildingId !== 'stage-a' ||
    !isNonEmptyString(operation.facilityLabel) ||
    !isNonEmptyString(operation.directorId) ||
    !isNonEmptyString(operation.directorName) ||
    (operation.taskStatus !== null &&
      (typeof operation.taskStatus !== 'string' || !TASK_STATUSES.has(operation.taskStatus))) ||
    !isNonEmptyString(operation.statusLabel) ||
    typeof operation.attention !== 'string' ||
    !ATTENTION_STATES.has(operation.attention as AttentionState) ||
    !hasValidBlocker(operation.blocker) ||
    !hasValidCommand(
      operation.currentCommand,
      operation.productionId,
      operation.directorId,
    )
  ) return null

  const hasLeadId = operation.leadId !== undefined
  const hasLeadName = operation.leadName !== undefined
  if (
    hasLeadId !== hasLeadName ||
    (hasLeadId &&
      (!isNonEmptyString(operation.leadId) || !isNonEmptyString(operation.leadName)))
  ) return null

  const duplicateIdentityCount = operations.filter(
    (candidate) => isRecord(candidate) && candidate.productionId === operation.productionId,
  ).length
  if (duplicateIdentityCount !== 1) return null

  const exactOperation = operation as ProductionOperationsState
  return {
    operation: exactOperation,
    ownerIntent: {
      productionId: exactOperation.productionId,
      locationBuildingId: 'stage-a',
    },
  }
}

function sameBlocker(
  left: ProductionOperationsState['blocker'],
  right: ProductionOperationsState['blocker'],
): boolean {
  if (left === null || right === null) return left === right
  return left.kind === right.kind &&
    left.headline === right.headline &&
    left.detail === right.detail
}

function sameCommand(
  left: LotProductionCommand | null,
  right: LotProductionCommand | null,
): boolean {
  if (left === null || right === null) return left === right
  if (
    left.kind !== right.kind ||
    left.productionId !== right.productionId ||
    left.label !== right.label
  ) return false
  return left.kind !== 'assignShootingDirector' ||
    (right.kind === 'assignShootingDirector' && left.directorId === right.directorId)
}

/** Field-exact rendered-token comparison required before a deep handoff. */
export function sameStage7ProductionDetailContext(
  left: Stage7ProductionDetailContext | null,
  right: Stage7ProductionDetailContext | null,
): boolean {
  if (left === null || right === null) return left === right

  const leftOperation = left.operation
  const rightOperation = right.operation
  return left.ownerIntent.productionId === right.ownerIntent.productionId &&
    left.ownerIntent.locationBuildingId === right.ownerIntent.locationBuildingId &&
    leftOperation.productionId === rightOperation.productionId &&
    leftOperation.locationBuildingId === rightOperation.locationBuildingId &&
    leftOperation.title === rightOperation.title &&
    leftOperation.phase === rightOperation.phase &&
    leftOperation.phaseLabel === rightOperation.phaseLabel &&
    leftOperation.weeksRemaining === rightOperation.weeksRemaining &&
    leftOperation.progress01 === rightOperation.progress01 &&
    leftOperation.facilityLabel === rightOperation.facilityLabel &&
    leftOperation.directorId === rightOperation.directorId &&
    leftOperation.directorName === rightOperation.directorName &&
    leftOperation.leadId === rightOperation.leadId &&
    leftOperation.leadName === rightOperation.leadName &&
    leftOperation.taskStatus === rightOperation.taskStatus &&
    leftOperation.statusLabel === rightOperation.statusLabel &&
    leftOperation.attention === rightOperation.attention &&
    sameBlocker(leftOperation.blocker, rightOperation.blocker) &&
    sameCommand(leftOperation.currentCommand, rightOperation.currentCommand)
}
