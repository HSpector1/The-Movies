import type {
  AttentionState,
  BuildingId,
  LotProductionCommand,
  ProductionOperationsState,
  StudioLotSnapshot,
} from './StudioLotSnapshot.ts'
// ── C2a-M4, THE PM RULING (M3 checkpoint, recorded under the Owner's delegated
// authority): the Soundstage-7-sealed shooting-take affordance WIDENS TO N STAGES.
//
// C2a-M2 recorded this narrowness deliberately and refused to open it under cover
// of a rendering milestone: "opening the Stage 7 detail handoff to every stage is
// a ruled change, not a rendering one." It is ruled now — *the Movie #2 gate
// demands production blocking be legible on every stage the player builds* — and
// this is that change.
//
// The widening is ADDITIVE, and the shape of it matters. The selector is
// PARAMETERISED by the stage it is asked about; `stage7ProductionDetailContext`
// is that same selector bound to the founding body, so every Stage-7 assertion
// its accepted specs make is answered by the same code path it always was. What
// is NEW is that a picture on a stage the studio BUILT can be asked about at all.
import { isLotStageBuildingId, FOUNDING_STAGE_SEVEN_BUILDING_ID } from './stageIdentity.ts'

export type Stage7ProductionOwnerIntent = {
  productionId: string
  /**
   * C2a-M4: `'stage-a'` before the ruling. It is the body the picture is actually
   * on now — still `'stage-a'` for every Soundstage 7 intent, and the studio's own
   * `placed-*` body for a picture on a stage it built.
   */
  locationBuildingId: BuildingId
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
 * Select the one structurally valid Engine-owned production on ONE named stage.
 *
 * This is deliberately a validation boundary, not a second production rules
 * engine. It validates the closed projection shape and identity relationships,
 * but does not infer blocker/command legality from phase or task status.
 *
 * C2a-M4 (the PM ruling): the stage is a PARAMETER, and it must be a soundstage
 * body THIS studio has — a body that is not one of its stages claims no place on
 * the property (law 12), so it is refused rather than searched for.
 */
export function stageProductionDetailContext(
  snapshot: StudioLotSnapshot,
  buildingId: BuildingId,
): Stage7ProductionDetailContext | null {
  if (
    snapshot.operationsMode !== 'managed' ||
    snapshot.stageAssignmentAuthority !== 'engine' ||
    !Array.isArray(snapshot.productionOperations) ||
    !isLotStageBuildingId(snapshot, buildingId)
  ) return null

  const operations: unknown[] = snapshot.productionOperations
  const onStage = operations.filter(
    (operation): operation is Record<string, unknown> =>
      isRecord(operation) && operation.locationBuildingId === buildingId,
  )
  if (onStage.length !== 1) return null

  const operation = onStage[0]!
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
    operation.locationBuildingId !== buildingId ||
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
      locationBuildingId: buildingId,
    },
  }
}

/**
 * The founding Soundstage 7's own context — the selector above, bound.
 *
 * Kept by NAME because every accepted D1-B spec, every handoff receipt and App's
 * `stage-7-production` entry focus are written against Soundstage 7 in
 * particular. Binding rather than re-implementing is what keeps those assertions
 * measuring the same code they always measured.
 */
export function stage7ProductionDetailContext(
  snapshot: StudioLotSnapshot,
): Stage7ProductionDetailContext | null {
  return stageProductionDetailContext(snapshot, FOUNDING_STAGE_SEVEN_BUILDING_ID)
}

/**
 * The one stage on this lot with a detail context right now, Soundstage 7 first.
 *
 * THE PM RULING'S ACTUAL DELIVERY: a picture on a stage the studio BUILT gets the
 * same take affordance as a picture on Soundstage 7. Stage 7 keeps precedence, so
 * every state that had a Stage-7 context still resolves to exactly that context;
 * a stage the studio built is reached only when Soundstage 7 has nothing to say.
 * When two built stages both qualify the world says NOTHING, which is the same
 * withholding this selector has always preferred to a guess.
 */
export function anyStageProductionDetailContext(
  snapshot: StudioLotSnapshot,
  stageBuildingIds: readonly BuildingId[],
): Stage7ProductionDetailContext | null {
  const stage7 = stage7ProductionDetailContext(snapshot)
  if (stage7 !== null) return stage7
  const others = stageBuildingIds
    .filter((id) => id !== FOUNDING_STAGE_SEVEN_BUILDING_ID)
    .map((id) => stageProductionDetailContext(snapshot, id))
    .filter((context): context is Stage7ProductionDetailContext => context !== null)
  return others.length === 1 ? others[0]! : null
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
