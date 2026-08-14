import type {
  LotAnnexWork,
  LotAnnexWorkBlocker,
  LotAnnexWorkContext,
  LotAnnexWorkOccupant,
  LotAnnexWorkOwnerIntent,
  StudioLotSnapshot,
} from './StudioLotSnapshot.ts'

export type {
  LotAnnexWork,
  LotAnnexWorkBlocker,
  LotAnnexWorkContext,
  LotAnnexWorkOccupant,
  LotAnnexWorkOwnerIntent,
} from './StudioLotSnapshot.ts'

const ANNEX_FACILITY_ID = 'facility-development-casting-annex'
const ANNEX_FACILITY_NAME = 'Development & Casting Annex'
const ANNEX_CAPABILITY = 'development-casting'
const OPERATIONAL_PROGRESS_TEXT = /^Operational since Week (0|[1-9]\d*)$/

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function ownerIntent(occupant: LotAnnexWorkOccupant): LotAnnexWorkOwnerIntent {
  switch (occupant.owner) {
    case 'production':
      return { owner: 'production', ownerId: occupant.ownerId }
    case 'script':
      return { owner: 'script', ownerId: occupant.ownerId }
    case 'casting':
      return { owner: 'casting', ownerId: occupant.ownerId }
  }
}

function validProductionBlocker(value: unknown): value is LotAnnexWorkBlocker {
  return (
    isRecord(value) &&
    value.kind === 'facility-capacity' &&
    isNonEmptyString(value.headline) &&
    isNonEmptyString(value.detail)
  )
}

/**
 * Resolve the one exact operational Annex context from the Lot projection.
 *
 * This selector is deliberately fail-closed. It validates projected identity,
 * construction, capacity, owner/activity, and Working/Held status agreement. It
 * never calls Core, chooses a facility, infers a queue, or mutates the snapshot.
 */
export function operationalAnnexWorkContext(
  snapshot: StudioLotSnapshot,
): LotAnnexWorkContext | null {
  if (
    snapshot.operationsMode !== 'managed' ||
    snapshot.stageAssignmentAuthority !== 'engine' ||
    !Number.isSafeInteger(snapshot.week)
  ) return null
  if (!Array.isArray(snapshot.buildings)) return null
  const expansionRows = (snapshot.buildings as unknown[]).filter(
    (building): building is Record<string, unknown> =>
      isRecord(building) && building.id === 'expansion',
  )
  if (expansionRows.length !== 1) return null

  const expansion = expansionRows[0]!
  const completionMatch =
    typeof expansion.constructionProgressText === 'string'
      ? OPERATIONAL_PROGRESS_TEXT.exec(expansion.constructionProgressText)
      : null
  if (
    expansion.available !== true ||
    expansion.constructionStatus !== 'operational' ||
    expansion.constructionProgress01 !== 1 ||
    completionMatch === null
  ) {
    return null
  }
  const completedWeek = Number(completionMatch[1])
  if (
    !Number.isSafeInteger(completedWeek) ||
    completedWeek < 13 ||
    completedWeek > snapshot.week
  ) return null

  const projected = snapshot.annexWork as unknown
  if (
    !isRecord(projected) ||
    projected.facilityId !== ANNEX_FACILITY_ID ||
    projected.facilityName !== ANNEX_FACILITY_NAME ||
    projected.capability !== ANNEX_CAPABILITY ||
    projected.capacity !== 1 ||
    projected.slot !== 0 ||
    (projected.occupied !== 0 && projected.occupied !== 1) ||
    (projected.available !== 0 && projected.available !== 1) ||
    projected.occupied + projected.available !== 1
  ) {
    return null
  }

  const annexWork = projected as LotAnnexWork
  if (annexWork.occupied === 0) {
    if (annexWork.available !== 1 || annexWork.occupant !== null) return null
    return { state: 'available', annexWork, occupant: null, ownerIntent: null }
  }

  if (annexWork.available !== 0 || !isRecord(annexWork.occupant)) return null
  const occupant = annexWork.occupant
  if (!isNonEmptyString(occupant.ownerId) || !isNonEmptyString(occupant.title)) return null

  const validActivity =
    (occupant.owner === 'production' &&
      (occupant.activity === 'development' || occupant.activity === 'preProduction')) ||
    (occupant.owner === 'script' &&
      (occupant.activity === 'drafting' || occupant.activity === 'rewriting')) ||
    (occupant.owner === 'casting' && occupant.activity === 'auditioning')
  if (!validActivity) return null

  if (occupant.owner !== 'production') {
    if (
      occupant.workState !== 'working' ||
      occupant.statusLabel !== null ||
      occupant.blocker !== null
    ) {
      return null
    }
    return {
      state: 'working',
      annexWork,
      occupant: occupant as LotAnnexWorkOccupant & { workState: 'working' },
      ownerIntent: ownerIntent(occupant as LotAnnexWorkOccupant),
    }
  }

  if (!isNonEmptyString(occupant.statusLabel)) return null
  if (occupant.workState === 'working' && occupant.blocker === null) {
    return {
      state: 'working',
      annexWork,
      occupant: occupant as LotAnnexWorkOccupant & { workState: 'working' },
      ownerIntent: { owner: 'production', ownerId: occupant.ownerId },
    }
  }
  if (occupant.workState === 'held' && validProductionBlocker(occupant.blocker)) {
    return {
      state: 'held',
      annexWork,
      occupant: occupant as LotAnnexWorkOccupant & {
        owner: 'production'
        workState: 'held'
        statusLabel: string
        blocker: LotAnnexWorkBlocker
      },
      ownerIntent: { owner: 'production', ownerId: occupant.ownerId },
    }
  }

  return null
}
