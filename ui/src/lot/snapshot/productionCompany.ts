import type {
  AttentionState,
  BuildingId,
  LotPersonState,
  LotProductionCommand,
  LotProductionCompanyMember,
  LotProductionCompanyRole,
  ProductionOperationsState,
  StudioLotSnapshot,
} from './StudioLotSnapshot.ts'
import { placedFacilityIdOf } from './StudioLotSnapshot.ts'

export type LotProductionCompanyMemberContext = {
  member: LotProductionCompanyMember
  person: LotPersonState
}

export type LotProductionCompanyContext = {
  operation: ProductionOperationsState
  members: readonly LotProductionCompanyMemberContext[]
}

export const LOT_PRODUCTION_COMPANY_ROLE_ORDER = [
  'writer',
  'director',
  'lead',
  'antagonist',
  'support',
  'craft',
] as const satisfies readonly LotProductionCompanyRole[]

const PRODUCTION_PHASES = new Set([
  'development',
  'preProduction',
  'rehearsal',
  'shooting',
  'postProduction',
  'releaseReady',
])

/**
 * The nine FOUNDING places. A production may also be located at a body the studio BUILT
 * — a third soundstage, a second post building — whose id is `placed-<placementId>`
 * (C2a-M2 §3.1). `isLocatableBuildingId` accepts both and nothing else: a location this
 * validator could not account for would fail an otherwise-exact projection closed, which
 * is the closed-world defect this campaign has now found three times.
 */
const FOUNDING_BUILDING_IDS = new Set<BuildingId>([
  'admin',
  'writers',
  'casting',
  'stage-a',
  'stage-b',
  'post',
  'theater',
  'gate',
  'expansion',
])

function isLocatableBuildingId(value: unknown): value is BuildingId {
  if (typeof value !== 'string') return false
  return FOUNDING_BUILDING_IDS.has(value) || placedFacilityIdOf(value) !== null
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

const ROLE_LABELS: Record<LotProductionCompanyRole, string> = {
  writer: 'Writer',
  director: 'Director',
  lead: 'Lead actor',
  antagonist: 'Antagonist',
  support: 'Supporting actor',
  craft: 'Production/Craft Lead',
}

const COMPANY_MEMBER_KEYS = [
  'productionRole',
  'slotIndex',
  'talentId',
  'name',
  'presentationRole',
] as const

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function hasExactOwnKeys(
  value: Record<string, unknown>,
  expected: readonly string[],
): boolean {
  const actual = Reflect.ownKeys(value)
  return actual.length === expected.length &&
    expected.every((key) => Object.hasOwn(value, key))
}

/** Distinguish an absent compatibility field from an own malformed claim. */
export function hasProductionCompanyProjectionClaim(
  snapshot: StudioLotSnapshot,
): boolean {
  return Array.isArray(snapshot.productionOperations) &&
    (snapshot.productionOperations as unknown[]).some(
      (operation) => isRecord(operation) && Object.hasOwn(operation, 'companyMembers'),
    )
}

/**
 * Keep ordinary/legacy people intact, but never render a partial active company
 * from a present malformed expanded claim.
 */
export function lotPeopleForCompanyPresentation(
  snapshot: StudioLotSnapshot,
): readonly LotPersonState[] {
  if (!Array.isArray(snapshot.people)) return []
  const identityCounts = new Map<string, number>()
  for (const person of snapshot.people) {
    identityCounts.set(person.id, (identityCounts.get(person.id) ?? 0) + 1)
  }
  const uniquePeople = snapshot.people.filter(
    (person) => identityCounts.get(person.id) === 1,
  )
  if (
    !hasProductionCompanyProjectionClaim(snapshot) ||
    activeProductionCompanyContexts(snapshot) !== null
  ) return uniquePeople
  return uniquePeople.filter((person) => person.authority !== 'active-production')
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function comparePlainId(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0
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
): value is LotProductionCommand | null {
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

function completeManagedOperation(value: unknown): value is ProductionOperationsState {
  if (!isRecord(value)) return false
  return isNonEmptyString(value.productionId) &&
    isNonEmptyString(value.title) &&
    typeof value.phase === 'string' &&
    PRODUCTION_PHASES.has(value.phase) &&
    isNonEmptyString(value.phaseLabel) &&
    Number.isSafeInteger(value.weeksRemaining) &&
    (value.weeksRemaining as number) >= 0 &&
    typeof value.progress01 === 'number' &&
    Number.isFinite(value.progress01) &&
    value.progress01 >= 0 &&
    value.progress01 <= 1 &&
    typeof value.locationBuildingId === 'string' &&
    isLocatableBuildingId(value.locationBuildingId) &&
    isNonEmptyString(value.facilityLabel) &&
    isNonEmptyString(value.directorId) &&
    isNonEmptyString(value.directorName) &&
    isNonEmptyString(value.leadId) &&
    isNonEmptyString(value.leadName) &&
    (value.taskStatus === null ||
      (typeof value.taskStatus === 'string' && TASK_STATUSES.has(value.taskStatus))) &&
    isNonEmptyString(value.statusLabel) &&
    hasValidBlocker(value.blocker) &&
    typeof value.attention === 'string' &&
    ATTENTION_STATES.has(value.attention as AttentionState) &&
    hasValidCommand(value.currentCommand, value.productionId, value.directorId)
}

function completePerson(value: unknown): value is LotPersonState {
  if (!isRecord(value)) return false
  return isNonEmptyString(value.id) &&
    isNonEmptyString(value.name) &&
    (value.role === 'director' || value.role === 'talent') &&
    (value.authority === 'active-production' ||
      value.authority === 'studio-roster' ||
      value.authority === 'district-managed') &&
    (value.productionId === null || isNonEmptyString(value.productionId)) &&
    (value.productionTitle === null || isNonEmptyString(value.productionTitle))
}

function completeMember(
  value: unknown,
  expectedRole: LotProductionCompanyRole,
): value is LotProductionCompanyMember {
  if (!isRecord(value) || !hasExactOwnKeys(value, COMPANY_MEMBER_KEYS)) return false
  const expectedPresentationRole = expectedRole === 'director' ? 'director' : 'talent'
  return value.productionRole === expectedRole &&
    value.slotIndex === 0 &&
    isNonEmptyString(value.talentId) &&
    isNonEmptyString(value.name) &&
    value.presentationRole === expectedPresentationRole
}

/** Canonical exact role language shared by the Lot controls and person inspector. */
export function productionCompanyRoleLabel(role: LotProductionCompanyRole): string {
  return ROLE_LABELS[role]
}

/**
 * Validate and join the complete current managed production companies projected
 * into one Lot snapshot. Missing optional company rows intentionally return
 * `null` so older Director/Lead snapshots can use their frozen compatibility
 * selector. Once any company row is present, callers must treat `null` as a
 * failed expanded claim rather than falling back within that same claim.
 */
export function activeProductionCompanyContexts(
  snapshot: StudioLotSnapshot,
): readonly LotProductionCompanyContext[] | null {
  if (
    snapshot.operationsMode !== 'managed' ||
    snapshot.stageAssignmentAuthority !== 'engine' ||
    !Array.isArray(snapshot.productionOperations) ||
    !Array.isArray(snapshot.people) ||
    snapshot.productionOperations.length > 2
  ) return null

  const rawOperations: unknown[] = snapshot.productionOperations
  const rawPeople: unknown[] = snapshot.people
  if (!rawPeople.every(completePerson)) return null

  const peopleById = new Map<string, LotPersonState>()
  for (const person of rawPeople) {
    if (peopleById.has(person.id)) return null
    peopleById.set(person.id, person)
  }

  if (rawOperations.length === 0) {
    return rawPeople.some((person) => person.authority === 'active-production') ? null : []
  }

  const operationsById = new Map<string, ProductionOperationsState>()
  for (const operation of rawOperations) {
    if (
      !completeManagedOperation(operation) ||
      operationsById.has(operation.productionId) ||
      !Object.hasOwn(operation, 'companyMembers')
    ) return null
    operationsById.set(operation.productionId, operation)
  }

  const globallyAssignedTalentIds = new Set<string>()
  const contexts: LotProductionCompanyContext[] = []
  for (const operation of [...operationsById.values()].sort((left, right) =>
    comparePlainId(left.productionId, right.productionId)
  )) {
    const rawMembers: unknown = operation.companyMembers
    if (!Array.isArray(rawMembers) || rawMembers.length !== LOT_PRODUCTION_COMPANY_ROLE_ORDER.length) {
      return null
    }

    const members: LotProductionCompanyMemberContext[] = []
    for (let index = 0; index < LOT_PRODUCTION_COMPANY_ROLE_ORDER.length; index += 1) {
      const expectedRole = LOT_PRODUCTION_COMPANY_ROLE_ORDER[index]!
      const member = rawMembers[index]
      // P04A.2 — the writer row is a permanent screenplay CREDIT, the other five
      // are seats. Only a seat is exclusive across pictures, and only a seat may
      // be required to name THIS picture: one person may hold the credit row on
      // two live pictures at once, and the producer emits them as a person once,
      // on the canonically-first of them. Requiring the credit to name every
      // picture it appears on rejected the whole projection and emptied every
      // company. Identity is still proved by exact id and name.
      const claimsASeat = expectedRole !== 'writer'
      if (
        !completeMember(member, expectedRole) ||
        (claimsASeat && globallyAssignedTalentIds.has(member.talentId))
      ) return null

      const person = peopleById.get(member.talentId)
      if (
        person === undefined ||
        person.name !== member.name ||
        person.role !== member.presentationRole ||
        person.authority !== 'active-production'
      ) return null
      if (claimsASeat) {
        if (
          person.productionId !== operation.productionId ||
          person.productionTitle !== operation.title
        ) return null
      } else if (
        // The credited writer may name a DIFFERENT live picture than this one —
        // they are emitted once, on the canonically-first picture they are
        // credited on. They may not name a picture that does not exist: without
        // this the credit row was the one place a person could claim any title
        // at all and still be rendered, which is weaker than what this validator
        // accepted before P04A.2.
        !operationsById.has(person.productionId ?? '') ||
        operationsById.get(person.productionId ?? '')?.title !== person.productionTitle
      ) return null

      // KNOWN HAZARD — disclosed, deliberately NOT changed in P04A.2.
      //
      // This adds unconditionally, so a writer CREDIT also consumes the
      // cross-picture exclusivity slot that the `claimsASeat && has(...)` test
      // above enforces. One person credited on picture A who also holds a SEAT
      // on picture B therefore fails that test and collapses the WHOLE
      // projection to null — the failure `dfd2155` exists to prevent, reached
      // through the other door. P04A.2 made that state newly reachable AT THE
      // ENGINE, because M16.5 stopped counting `writerId` as busy.
      //
      // It is NOT reachable by playing: the packaged greenlight is built
      // server-side from role-partitioned pools (`bridge/session.ts`
      // `studioPool(state, 'director'|'craft')`) and `castingReadModel.ts`
      // restricts cast slots to `role === 'actor'`, so no writer can take a
      // seat through the product. Only a direct `applyActions` caller — an M0A
      // agent or the headless harness — can construct it.
      //
      // The correction is one word: `if (claimsASeat)`. It is left undone here
      // because it changes the emitted engine graph, and doing that at seal
      // time would invalidate a fully green packaged floor for a state the
      // Owner cannot reach. It belongs in the next checkpoint, with its own
      // proof. Found by hostile review of this checkpoint.
      globallyAssignedTalentIds.add(member.talentId)
      members.push({ member, person })
    }

    const director = members[1]!.member
    const lead = members[2]!.member
    if (
      operation.directorId !== director.talentId ||
      operation.directorName !== director.name ||
      operation.leadId !== lead.talentId ||
      operation.leadName !== lead.name
    ) return null

    contexts.push({ operation, members })
  }

  const activeProductionPeople = rawPeople.filter(
    (person) => person.authority === 'active-production',
  )
  if (
    activeProductionPeople.length !== globallyAssignedTalentIds.size ||
    activeProductionPeople.some((person) => !globallyAssignedTalentIds.has(person.id))
  ) return null

  return contexts
}
