import type {
  ProductionOperationsState,
  StudioLotSnapshot,
} from './StudioLotSnapshot'

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
 * Select the exact Soundstage 7 scenery interaction from an authoritative lot
 * snapshot. This selector is intentionally stricter than a generic stage lookup:
 * every provenance, location, phase, task, blocker, command, and production-id
 * relationship must agree, otherwise the world affordance fails closed.
 */
export function sceneryLoadInContext(
  snapshot: StudioLotSnapshot,
): SceneryLoadInContext | null {
  if (
    snapshot.operationsMode !== 'managed' ||
    snapshot.stageAssignmentAuthority !== 'engine' ||
    !Array.isArray(snapshot.productionOperations)
  ) {
    return null
  }

  const stage7 = snapshot.productionOperations.filter(
    (operation) => operation?.locationBuildingId === 'stage-a',
  )
  if (stage7.length !== 1) return null

  const operation = stage7[0]!
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
