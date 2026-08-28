import type {
  BuildingId,
  LotPersonState,
  LotProductionCompanyRole,
  LotProductionPhase,
  LotShootingTaskStatus,
  ProductionOperationsState,
  StudioLotSnapshot,
} from './StudioLotSnapshot.ts'
import {
  activeProductionCompanyContexts,
  hasProductionCompanyProjectionClaim,
} from './productionCompany.ts'

type PersonProductionWorkBase = {
  person: LotPersonState
  productionRole: LotProductionCompanyRole
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
        | 'malformed-company-projection'
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
  if (!Array.isArray(snapshot.people)) {
    return { kind: 'unavailable', person: null, reason: 'missing-person' }
  }
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

  const operations = Array.isArray(snapshot.productionOperations)
    ? snapshot.productionOperations
    : []
  const hasPopulatedCompanyProjection = hasProductionCompanyProjectionClaim(snapshot)
  const companyContexts = managedAuthority
    ? activeProductionCompanyContexts(snapshot)
    : null

  if (companyContexts !== null) {
    if (person.authority === 'studio-roster') {
      return person.productionId === null && person.productionTitle === null
        ? { kind: 'roster', person }
        : { kind: 'unavailable', person, reason: 'contradictory-person' }
    }

    const companyMatches = companyContexts.flatMap((context) =>
      context.members
        .filter((memberContext) => memberContext.person.id === person.id)
        .map((memberContext) => ({ context, ...memberContext })),
    )
    // P04A.2 — a person may appear on several pictures at once ONLY as a writer
    // CREDIT, never as a seat (the projection refuses a repeated seat outright).
    // Several credits are one person with several credits, not the hostile
    // last-write-wins ambiguity this selector exists to fail closed on, so they
    // must not resolve to `ambiguous-assignment`. Prefer a real seat; failing
    // that, take the credit on the picture the person's own record names.
    const resolvedMatches = (() => {
      if (companyMatches.length <= 1) return companyMatches
      const seats = companyMatches.filter(
        (candidate) => candidate.member.productionRole !== 'writer',
      )
      if (seats.length > 0) return seats
      return companyMatches.filter(
        (candidate) => candidate.context.operation.productionId === person.productionId,
      )
    })()
    if (resolvedMatches.length !== 1) {
      return { kind: 'unavailable', person, reason: 'ambiguous-assignment' }
    }
    const match = resolvedMatches[0]!
    if (
      match.person !== person ||
      person.productionId === null ||
      person.productionTitle === null ||
      match.member.talentId !== person.id ||
      match.member.name !== person.name ||
      match.member.presentationRole !== person.role ||
      match.context.operation.productionId !== person.productionId ||
      match.context.operation.title !== person.productionTitle
    ) {
      return { kind: 'unavailable', person, reason: 'stale-assignment' }
    }

    return {
      kind: 'managed-production',
      person,
      productionRole: match.member.productionRole,
      productionId: match.context.operation.productionId,
      productionTitle: match.context.operation.title,
      phase: match.context.operation.phase,
      phaseLabel: match.context.operation.phaseLabel,
      productionStatusLabel: match.context.operation.statusLabel,
      productionWeeksRemaining: match.context.operation.weeksRemaining,
      directorTaskStatus:
        match.member.productionRole === 'director' ? match.context.operation.taskStatus : null,
      productionFacilities: {
        buildingId: match.context.operation.locationBuildingId,
        facilityLabel: match.context.operation.facilityLabel,
      },
    }
  }

  if (hasPopulatedCompanyProjection) {
    return { kind: 'unavailable', person, reason: 'malformed-company-projection' }
  }

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
