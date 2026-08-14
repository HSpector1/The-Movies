import type {
  BuildingId,
  LotPersonState,
  LotProductionPhase,
  LotShootingTaskStatus,
  ProductionOperationsState,
  StudioLotSnapshot,
} from './StudioLotSnapshot.ts'

type PersonProductionWorkBase = {
  person: LotPersonState
  productionRole: 'director' | 'lead'
  productionId: string
  productionTitle: string
  phase: LotProductionPhase
  phaseLabel: string
  productionStatusLabel: string
  productionWeeksRemaining: number
  directorTaskStatus: LotShootingTaskStatus | null
}

export type LotPersonWorkContext =
  | (PersonProductionWorkBase & {
      kind: 'managed-production'
      productionFacilities: {
        buildingId: BuildingId
        facilityLabel: string
      }
    })
  | (PersonProductionWorkBase & {
      kind: 'legacy-production'
      productionFacilities: null
    })
  | {
      kind: 'roster'
      person: LotPersonState
    }
  | {
      kind: 'unavailable'
      person: LotPersonState | null
      reason:
        | 'missing-person'
        | 'duplicate-person'
        | 'unsupported-provenance'
        | 'contradictory-person'
        | 'missing-participant-projection'
        | 'ambiguous-assignment'
        | 'stale-assignment'
        | 'unsupported-authority'
    }

type ParticipantMatch = {
  operation: ProductionOperationsState
  role: 'director' | 'lead'
  name: string
}

/**
 * Resolve one exact person-to-picture context from the Lot's public snapshot.
 * This selector deliberately collects every participant match before accepting
 * one; hostile last-write-wins participant data therefore fails closed.
 */
export function lotPersonWorkContext(
  snapshot: StudioLotSnapshot,
  personId: string,
): LotPersonWorkContext {
  const people = snapshot.people.filter((candidate) => candidate.id === personId)
  if (people.length === 0) {
    return { kind: 'unavailable', person: null, reason: 'missing-person' }
  }
  const person = people[0]!
  if (people.length !== 1) {
    return { kind: 'unavailable', person, reason: 'duplicate-person' }
  }

  const managedAuthority =
    snapshot.operationsMode === 'managed' && snapshot.stageAssignmentAuthority === 'engine'
  const legacyAuthority =
    (snapshot.operationsMode === undefined || snapshot.operationsMode === 'legacy') &&
    (snapshot.stageAssignmentAuthority === undefined ||
      snapshot.stageAssignmentAuthority === 'presentation')
  if (!managedAuthority && !legacyAuthority) {
    return { kind: 'unavailable', person, reason: 'unsupported-authority' }
  }

  if (person.authority === 'district-managed') {
    return { kind: 'unavailable', person, reason: 'unsupported-provenance' }
  }

  const operations = snapshot.productionOperations ?? []
  const hasCompleteParticipantProjection = operations.every(
    (operation) => operation.leadId !== undefined && operation.leadName !== undefined,
  )

  if (person.authority === 'studio-roster') {
    if (person.productionId !== null || person.productionTitle !== null) {
      return { kind: 'unavailable', person, reason: 'contradictory-person' }
    }
    if (
      !hasCompleteParticipantProjection ||
      (snapshot.productionOperations === undefined && snapshot.activeProductions.length > 0)
    ) {
      return { kind: 'unavailable', person, reason: 'missing-participant-projection' }
    }
    const rosterMatches = operations.filter(
      (operation) => operation.directorId === person.id || operation.leadId === person.id,
    )
    return rosterMatches.length === 0
      ? { kind: 'roster', person }
      : { kind: 'unavailable', person, reason: 'contradictory-person' }
  }

  if (person.productionId === null || person.productionTitle === null) {
    return { kind: 'unavailable', person, reason: 'contradictory-person' }
  }

  if (snapshot.productionOperations === undefined || !hasCompleteParticipantProjection) {
    return { kind: 'unavailable', person, reason: 'missing-participant-projection' }
  }

  const productionRows = operations.filter(
    (operation) => operation.productionId === person.productionId,
  )
  if (productionRows.length !== 1) {
    return { kind: 'unavailable', person, reason: 'ambiguous-assignment' }
  }

  const matches: ParticipantMatch[] = []
  for (const operation of operations) {
    if (operation.directorId === person.id) {
      matches.push({ operation, role: 'director', name: operation.directorName })
    }
    if (operation.leadId === person.id) {
      matches.push({ operation, role: 'lead', name: operation.leadName! })
    }
  }
  if (matches.length !== 1) {
    return { kind: 'unavailable', person, reason: 'ambiguous-assignment' }
  }

  const match = matches[0]!
  const expectedRole = person.role === 'director' ? 'director' : 'lead'
  if (
    match.role !== expectedRole ||
    match.name !== person.name ||
    match.operation.productionId !== person.productionId ||
    match.operation.title !== person.productionTitle
  ) {
    return { kind: 'unavailable', person, reason: 'stale-assignment' }
  }

  const base: PersonProductionWorkBase = {
    person,
    productionRole: match.role,
    productionId: match.operation.productionId,
    productionTitle: match.operation.title,
    phase: match.operation.phase,
    phaseLabel: match.operation.phaseLabel,
    productionStatusLabel: match.operation.statusLabel,
    productionWeeksRemaining: match.operation.weeksRemaining,
    directorTaskStatus: match.role === 'director' ? match.operation.taskStatus : null,
  }

  if (managedAuthority) {
    if (match.operation.phase === 'legacy') {
      return { kind: 'unavailable', person, reason: 'unsupported-authority' }
    }
    return {
      ...base,
      kind: 'managed-production',
      productionFacilities: {
        buildingId: match.operation.locationBuildingId,
        facilityLabel: match.operation.facilityLabel,
      },
    }
  }

  if (legacyAuthority && match.operation.phase === 'legacy') {
    return { ...base, kind: 'legacy-production', productionFacilities: null }
  }

  return { kind: 'unavailable', person, reason: 'unsupported-authority' }
}
