/**
 * Presentation-only progress inside the open Package workspace.
 *
 * These facts describe the player's current, uncommitted form choices. They are
 * deliberately not GameState, never saved, and disappear when the workspace
 * closes. The authoritative production still begins only when Core accepts the
 * greenlight action.
 */
export type PackageJourneyStep = 'casting' | 'budget' | 'greenlight'

export type PackageJourneyProgress = {
  projectId: string
  pictureTitle: string
  step: PackageJourneyStep
  selectedRoleCount: number
  requiredRoleCount: number
  missingRoles: string[]
  castComplete: boolean
  chosenSummary: string | null
}

export function samePackageJourneyProgress(
  left: PackageJourneyProgress | null,
  right: PackageJourneyProgress | null,
): boolean {
  if (left === right) return true
  if (left === null || right === null) return false
  return (
    left.projectId === right.projectId &&
    left.pictureTitle === right.pictureTitle &&
    left.step === right.step &&
    left.selectedRoleCount === right.selectedRoleCount &&
    left.requiredRoleCount === right.requiredRoleCount &&
    left.castComplete === right.castComplete &&
    left.chosenSummary === right.chosenSummary &&
    left.missingRoles.length === right.missingRoles.length &&
    left.missingRoles.every((role, index) => role === right.missingRoles[index])
  )
}
