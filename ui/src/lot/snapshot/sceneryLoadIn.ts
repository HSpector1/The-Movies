import type {
  BuildingId,
  ProductionOperationsState,
  StudioLotSnapshot,
} from './StudioLotSnapshot'
import { isLotStageBuildingId, FOUNDING_STAGE_SEVEN_BUILDING_ID } from './stageIdentity.ts'

/**
 * The only two Engine projections that Scenery & Service may own on the lot.
 *
 * `blocked` is the existing load-in intervention. `ready` is deliberately kept
 * in the same context after an accepted clear so the player can dispatch the
 * freshly projected take-scheduling command without leaving the live lot.
 */
export type SceneryLoadInContext = {
  state: 'blocked' | 'ready'
  operation: ProductionOperationsState
}

/**
 * Select the exact scenery interaction on ONE named stage from an authoritative
 * lot snapshot. This selector is intentionally stricter than a generic stage
 * lookup: every provenance, location, phase, task, blocker, command, and
 * production-id relationship must agree, otherwise the world affordance fails
 * closed.
 *
 * ── C2a-M4, THE PM RULING (M3 checkpoint) ──────────────────────────────────
 *
 * C2a-M2 recorded this selector's narrowness as a decision and refused to open
 * it: "opening the load-in affordance to every stage is a ruled change that
 * belongs with the queue surface that will own N-stage intervention." That is
 * this milestone, and the ruling is made — *the Movie #2 gate demands production
 * blocking be legible on every stage the player builds.*
 *
 * The widening is ADDITIVE: the stage is a PARAMETER, and `sceneryLoadInContext`
 * is this same selector bound to the founding Soundstage 7, so every Stage-7
 * assertion in the accepted specs is answered by the code path it always was.
 * The stage asked about must be a soundstage THIS studio has (law 12).
 */
export function stageSceneryLoadInContext(
  snapshot: StudioLotSnapshot,
  buildingId: BuildingId,
): SceneryLoadInContext | null {
  if (
    snapshot.operationsMode !== 'managed' ||
    snapshot.stageAssignmentAuthority !== 'engine' ||
    !Array.isArray(snapshot.productionOperations) ||
    !isLotStageBuildingId(snapshot, buildingId)
  ) {
    return null
  }

  const onStage = snapshot.productionOperations.filter(
    (operation) => operation?.locationBuildingId === buildingId,
  )
  if (onStage.length !== 1) return null

  const operation = onStage[0]!
  if (operation.phase !== 'shooting') return null

  const command = operation.currentCommand
  if (
    operation.taskStatus === 'blocked' &&
    operation.blocker?.kind === 'scenery-load-in' &&
    command?.kind === 'clearSceneryLoadIn' &&
    command.productionId === operation.productionId
  ) {
    return { state: 'blocked', operation }
  }

  if (
    operation.taskStatus === 'ready' &&
    operation.blocker?.kind === 'take-scheduling' &&
    command?.kind === 'scheduleShootingTake' &&
    command.productionId === operation.productionId
  ) {
    return { state: 'ready', operation }
  }

  return null
}

/** The founding Soundstage 7's own load-in context — the selector above, bound. */
export function sceneryLoadInContext(
  snapshot: StudioLotSnapshot,
): SceneryLoadInContext | null {
  return stageSceneryLoadInContext(snapshot, FOUNDING_STAGE_SEVEN_BUILDING_ID)
}

/**
 * The one stage on this lot with a scenery interaction right now, Stage 7 first.
 *
 * THE PM RULING'S ACTUAL DELIVERY for load-in: a picture on a stage the studio
 * BUILT gets its scenery affordance. Soundstage 7 keeps precedence, so every
 * state that resolved to a Stage-7 context still resolves to exactly that one;
 * a built stage is reached only when Soundstage 7 has nothing to say, and two
 * built stages with competing interventions resolve to NOTHING rather than to a
 * guess — the same withholding this selector has always preferred.
 */
export function anyStageSceneryLoadInContext(
  snapshot: StudioLotSnapshot,
  stageBuildingIds: readonly BuildingId[],
): SceneryLoadInContext | null {
  const stage7 = sceneryLoadInContext(snapshot)
  if (stage7 !== null) return stage7
  const others = stageBuildingIds
    .filter((id) => id !== FOUNDING_STAGE_SEVEN_BUILDING_ID)
    .map((id) => stageSceneryLoadInContext(snapshot, id))
    .filter((context): context is SceneryLoadInContext => context !== null)
  return others.length === 1 ? others[0]! : null
}
