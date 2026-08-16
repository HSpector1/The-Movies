import {
  CASTING_SESSION_CONSEQUENCE,
  canonicalCastingSessionId,
  castingSessionsReadModel,
  makeSaveV11,
} from '../../../../src/core/index.ts'
import * as adapter from '../../engine/adapter.ts'
import type {
  CastingCandidateView,
  CastingProjectView,
  CastingSessionsReadModel,
  GameState,
  StartCastingSessionPayload,
} from '../../engine/adapter.ts'

type UnknownRecord = Record<PropertyKey, unknown>

type PlanAuditionsAction = {
  kind: 'planAuditions'
  projectId: string
  label: string
}

export type LotAuditionPlanningOpenAuthority = {
  hollywoodEnabled: boolean
  origin: 'lot-browse-talent'
  worldInputOwner: boolean
  originState: GameState
  currentState: GameState | null
  originScreen: object
  currentScreen: object
  originPresentation: object
  currentPresentation: object | null
}

export type LotAuditionPlanningContext = {
  kind: 'audition-planning'
  project: CastingProjectView
  firstFreeSlot: {
    facilityId: string
    facilityName: string
    capability: 'development-casting'
    slot: number
  }
  planAction: PlanAuditionsAction
}

export type LotAuditionPlanningRead = {
  role: 'lead' | 'antagonist' | 'support'
  talentId: string
  name: string
}

export type LotAuditionPlanningReceipt = {
  sessionId: string
  projectId: string
  title: string
  startedWeek: number
  dueWeek: number
  facilityId: string
  facilityName: string
  slot: number
  reads: [
    LotAuditionPlanningRead,
    LotAuditionPlanningRead,
    LotAuditionPlanningRead,
    LotAuditionPlanningRead,
    LotAuditionPlanningRead,
    LotAuditionPlanningRead,
  ]
}

const ROLE_ORDER = ['lead', 'antagonist', 'support'] as const
const GENRES = new Set(['comedy', 'drama', 'crime', 'romance', 'horror', 'adventure'])
const CREATIVE_ROLES = new Set(['writer', 'director', 'actor', 'craft'])

const BOARD_KEYS = ['mode', 'capacity', 'activation', 'sections', 'nextDecision'] as const
const ACTIVATION_KEYS = ['canActivate', 'label', 'blocker'] as const
const SECTION_KEYS = ['readyToPlan', 'auditioning', 'needsReview', 'history'] as const
const CARD_KEYS = [
  'projectId',
  'sessionId',
  'title',
  'genre',
  'writer',
  'status',
  'dueWeek',
  'weeksUntilDecision',
  'consequence',
  'candidates',
  'results',
  'packageAvailability',
  'legalActions',
  'blockers',
] as const
const WRITER_KEYS = ['id', 'name', 'primaryRole'] as const
const ROLE_RECORD_KEYS = ['lead', 'antagonist', 'support'] as const
const CANDIDATE_KEYS = [
  'id',
  'name',
  'primaryRole',
  'fit',
  'available',
  'availabilityLabel',
] as const
const FIT_KEYS = ['label', 'score'] as const
const ACTION_KEYS = ['kind', 'projectId', 'label'] as const
const PACKAGE_KEYS = [
  'knownGatesClear',
  'writerAvailable',
  'staffingAvailable',
  'productionSlotAvailable',
  'developmentCastingSlotAvailable',
  'blockers',
] as const
const BLOCKER_KEYS = ['kind', 'headline', 'detail', 'remedy'] as const
const CAPACITY_KEYS = ['capacity', 'occupied', 'available', 'facilities'] as const
const FACILITY_KEYS = [
  'facilityId',
  'facilityName',
  'capacity',
  'occupied',
  'available',
  'slots',
] as const
const SLOT_KEYS = ['slot', 'occupant'] as const
const OCCUPANT_KEYS = ['owner', 'ownerId', 'activity', 'title', 'label'] as const
const CONTEXT_KEYS = ['kind', 'project', 'firstFreeSlot', 'planAction'] as const
const FIRST_FREE_KEYS = ['facilityId', 'facilityName', 'capability', 'slot'] as const
const PAYLOAD_KEYS = ['projectId', 'slate'] as const
const SESSION_KEYS = [
  'id',
  'projectId',
  'status',
  'slate',
  'startedWeek',
  'dueWeek',
  'reservation',
  'results',
] as const
const RESERVATION_KEYS = ['sessionId', 'facilityId', 'capability', 'slot'] as const
const RECEIPT_KEYS = [
  'sessionId',
  'projectId',
  'title',
  'startedWeek',
  'dueWeek',
  'facilityId',
  'facilityName',
  'slot',
  'reads',
] as const
const READ_KEYS = ['role', 'talentId', 'name'] as const
const AUTHORITY_KEYS = [
  'hollywoodEnabled',
  'origin',
  'worldInputOwner',
  'originState',
  'currentState',
  'originScreen',
  'currentScreen',
  'originPresentation',
  'currentPresentation',
] as const

function isPlainRecord(value: unknown): value is UnknownRecord {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false
  const prototype = Object.getPrototypeOf(value)
  return prototype === Object.prototype || prototype === null
}

function hasExactOwnKeys(value: UnknownRecord, expected: readonly string[]): boolean {
  const actual = Reflect.ownKeys(value)
  return actual.length === expected.length &&
    expected.every((key) => Object.prototype.hasOwnProperty.call(value, key))
}

function hasCanonicalArrayKeys(value: readonly unknown[]): boolean {
  const keys = Reflect.ownKeys(value)
  if (keys.length !== value.length + 1 || !keys.includes('length')) return false
  for (let index = 0; index < value.length; index += 1) {
    if (!Object.prototype.hasOwnProperty.call(value, String(index))) return false
    const descriptor = Object.getOwnPropertyDescriptor(value, String(index))
    if (descriptor === undefined || !('value' in descriptor) || !descriptor.enumerable) return false
  }
  return true
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isNonNegativeSafeInteger(value: unknown): value is number {
  return Number.isSafeInteger(value) && (value as number) >= 0
}

function closedKeys(value: UnknownRecord): string[] | null {
  const keys = Reflect.ownKeys(value)
  if (keys.some((key) => typeof key !== 'string')) return null
  for (const key of keys as string[]) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key)
    if (descriptor === undefined || !('value' in descriptor) || !descriptor.enumerable) return null
  }
  return (keys as string[]).slice().sort()
}

function sameClosedValue(
  left: unknown,
  right: unknown,
  seen = new WeakMap<object, object>(),
): boolean {
  if (Object.is(left, right)) return true
  if (Array.isArray(left) || Array.isArray(right)) {
    if (
      !Array.isArray(left) ||
      !Array.isArray(right) ||
      !hasCanonicalArrayKeys(left) ||
      !hasCanonicalArrayKeys(right) ||
      left.length !== right.length
    ) return false
    const prior = seen.get(left)
    if (prior !== undefined) return prior === right
    seen.set(left, right)
    return left.every((value, index) => sameClosedValue(value, right[index], seen))
  }
  if (!isPlainRecord(left) || !isPlainRecord(right)) return false
  const prior = seen.get(left)
  if (prior !== undefined) return prior === right
  seen.set(left, right)
  const leftKeys = closedKeys(left)
  const rightKeys = closedKeys(right)
  if (
    leftKeys === null ||
    rightKeys === null ||
    leftKeys.length !== rightKeys.length ||
    !leftKeys.every((key, index) => key === rightKeys[index])
  ) return false
  return leftKeys.every((key) => sameClosedValue(left[key], right[key], seen))
}

function sameClosedFieldsExcept(
  left: unknown,
  right: unknown,
  excluded: ReadonlySet<string>,
): boolean {
  if (!isPlainRecord(left) || !isPlainRecord(right)) return false
  const leftKeys = closedKeys(left)
  const rightKeys = closedKeys(right)
  if (leftKeys === null || rightKeys === null) return false
  const retainedLeft = leftKeys.filter((key) => !excluded.has(key))
  const retainedRight = rightKeys.filter((key) => !excluded.has(key))
  return retainedLeft.length === retainedRight.length && retainedLeft.every(
    (key, index) => key === retainedRight[index] && sameClosedValue(left[key], right[key]),
  )
}

function isClosedCanonicalState(state: GameState): boolean {
  return sameClosedValue(state, makeSaveV11(state).state)
}

function uniqueById(rows: unknown): Map<string, UnknownRecord> | null {
  if (!Array.isArray(rows) || !hasCanonicalArrayKeys(rows)) return null
  const result = new Map<string, UnknownRecord>()
  for (const row of rows as unknown[]) {
    if (!isPlainRecord(row) || !isNonEmptyString(row.id) || result.has(row.id)) return null
    result.set(row.id, row)
  }
  return result
}

function uniqueName(
  rows: Map<string, UnknownRecord>,
  selectedId: string,
): string | null {
  const selected = rows.get(selectedId)
  const name = selected?.name
  if (!isNonEmptyString(name)) return null
  let count = 0
  for (const row of rows.values()) {
    if (!isNonEmptyString(row.name)) return null
    if (row.name === name) count += 1
  }
  return count === 1 ? name : null
}

function uniqueTitle(
  rows: Map<string, UnknownRecord>,
  selectedId: string,
): string | null {
  const selected = rows.get(selectedId)
  const title = selected?.title
  if (!isNonEmptyString(title)) return null
  let count = 0
  for (const row of rows.values()) {
    if (!isNonEmptyString(row.title)) return null
    if (row.title === title) count += 1
  }
  return count === 1 ? title : null
}

function isCandidate(value: unknown): value is CastingCandidateView {
  return isPlainRecord(value) &&
    hasExactOwnKeys(value, CANDIDATE_KEYS) &&
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.name) &&
    value.primaryRole === 'actor' &&
    isPlainRecord(value.fit) &&
    hasExactOwnKeys(value.fit, FIT_KEYS) &&
    value.fit.label === 'Fit' &&
    typeof value.fit.score === 'number' &&
    Number.isFinite(value.fit.score) &&
    value.available === true &&
    isNonEmptyString(value.availabilityLabel)
}

function isPackageAvailability(value: unknown): boolean {
  if (!isPlainRecord(value) || !hasExactOwnKeys(value, PACKAGE_KEYS)) return false
  for (const key of PACKAGE_KEYS.slice(0, 5)) {
    if (typeof value[key] !== 'boolean') return false
  }
  if (!Array.isArray(value.blockers) || !hasCanonicalArrayKeys(value.blockers)) return false
  return (value.blockers as unknown[]).every((blocker) =>
    isPlainRecord(blocker) &&
    hasExactOwnKeys(blocker, BLOCKER_KEYS) &&
    isNonEmptyString(blocker.kind) &&
    isNonEmptyString(blocker.headline) &&
    isNonEmptyString(blocker.detail) &&
    isNonEmptyString(blocker.remedy),
  )
}

function strictPlanAction(value: unknown, projectId: string): PlanAuditionsAction | null {
  if (
    !isPlainRecord(value) ||
    !hasExactOwnKeys(value, ACTION_KEYS) ||
    value.kind !== 'planAuditions' ||
    value.projectId !== projectId ||
    value.label !== 'Plan auditions'
  ) return null
  return { kind: 'planAuditions', projectId, label: 'Plan auditions' }
}

function strictCard(
  state: GameState,
  value: unknown,
): { project: CastingProjectView; action: PlanAuditionsAction } | null {
  if (
    !isPlainRecord(value) ||
    !hasExactOwnKeys(value, CARD_KEYS) ||
    !isNonEmptyString(value.projectId) ||
    value.sessionId !== null ||
    !isNonEmptyString(value.title) ||
    typeof value.genre !== 'string' ||
    !GENRES.has(value.genre) ||
    !isPlainRecord(value.writer) ||
    !hasExactOwnKeys(value.writer, WRITER_KEYS) ||
    !isNonEmptyString(value.writer.id) ||
    !isNonEmptyString(value.writer.name) ||
    typeof value.writer.primaryRole !== 'string' ||
    !CREATIVE_ROLES.has(value.writer.primaryRole) ||
    value.status !== 'notStarted' ||
    value.dueWeek !== null ||
    value.weeksUntilDecision !== null ||
    value.consequence !== CASTING_SESSION_CONSEQUENCE ||
    value.results !== null ||
    !isPackageAvailability(value.packageAvailability) ||
    !Array.isArray(value.blockers) ||
    !hasCanonicalArrayKeys(value.blockers) ||
    value.blockers.length !== 0 ||
    !isPlainRecord(value.candidates) ||
    !hasExactOwnKeys(value.candidates, ROLE_RECORD_KEYS) ||
    !Array.isArray(value.legalActions) ||
    !hasCanonicalArrayKeys(value.legalActions)
  ) return null

  const stateProjects = uniqueById(state.scriptDevelopment.projects)
  const concepts = uniqueById(state.concepts)
  const talent = uniqueById(state.talent)
  if (stateProjects === null || concepts === null || talent === null) return null
  const sourceProject = stateProjects.get(value.projectId)
  if (
    sourceProject === undefined ||
    sourceProject.status !== 'ready' ||
    !isNonEmptyString(sourceProject.conceptId) ||
    !isNonEmptyString(sourceProject.writerId) ||
    sourceProject.writerId !== value.writer.id
  ) return null
  const concept = concepts.get(sourceProject.conceptId)
  const writer = talent.get(sourceProject.writerId)
  if (
    concept === undefined ||
    writer === undefined ||
    uniqueTitle(concepts, sourceProject.conceptId) !== value.title ||
    concept.genre !== value.genre ||
    uniqueName(talent, sourceProject.writerId) !== value.writer.name ||
    writer.role !== value.writer.primaryRole
  ) return null

  let ids: string[] | null = null
  for (const role of ROLE_ORDER) {
    const candidates = value.candidates[role]
    if (
      !Array.isArray(candidates) ||
      !hasCanonicalArrayKeys(candidates) ||
      candidates.length < 3
    ) return null
    const roleIds: string[] = []
    let prior: string | null = null
    for (const candidate of candidates as unknown[]) {
      if (!isCandidate(candidate) || roleIds.includes(candidate.id)) return null
      if (prior !== null && candidate.id <= prior) return null
      const person = talent.get(candidate.id)
      if (
        person === undefined ||
        person.role !== 'actor' ||
        person.id === sourceProject.writerId ||
        uniqueName(talent, candidate.id) !== candidate.name
      ) return null
      roleIds.push(candidate.id)
      prior = candidate.id
    }
    if (ids === null) ids = roleIds
    else if (
      ids.length !== roleIds.length ||
      !ids.every((id, index) => id === roleIds[index])
    ) return null
  }
  if (ids === null || new Set(ids).size < 3) return null

  const projectId = value.projectId
  const plan = (value.legalActions as unknown[])
    .map((action) => strictPlanAction(action, projectId))
    .filter((action): action is PlanAuditionsAction => action !== null)
  if (plan.length !== 1) return null
  let openPackageCount = 0
  for (const action of value.legalActions as unknown[]) {
    if (strictPlanAction(action, projectId) !== null) continue
    if (
      !isPlainRecord(action) ||
      !hasExactOwnKeys(action, ACTION_KEYS) ||
      action.kind !== 'openPackage' ||
      action.projectId !== projectId ||
      action.label !== 'Open package'
    ) return null
    openPackageCount += 1
  }
  if (openPackageCount > 1 || value.legalActions.length !== 1 + openPackageCount) return null
  return {
    project: structuredClone(value) as CastingProjectView,
    action: plan[0]!,
  }
}

function closedCardShape(value: unknown): value is CastingProjectView {
  if (
    !isPlainRecord(value) ||
    !hasExactOwnKeys(value, CARD_KEYS) ||
    !isNonEmptyString(value.projectId) ||
    value.sessionId !== null ||
    !isNonEmptyString(value.title) ||
    typeof value.genre !== 'string' ||
    !GENRES.has(value.genre) ||
    !isPlainRecord(value.writer) ||
    !hasExactOwnKeys(value.writer, WRITER_KEYS) ||
    !isNonEmptyString(value.writer.id) ||
    !isNonEmptyString(value.writer.name) ||
    typeof value.writer.primaryRole !== 'string' ||
    !CREATIVE_ROLES.has(value.writer.primaryRole) ||
    value.status !== 'notStarted' ||
    value.dueWeek !== null ||
    value.weeksUntilDecision !== null ||
    value.consequence !== CASTING_SESSION_CONSEQUENCE ||
    value.results !== null ||
    !isPackageAvailability(value.packageAvailability) ||
    !Array.isArray(value.blockers) ||
    !hasCanonicalArrayKeys(value.blockers) ||
    value.blockers.length !== 0 ||
    !isPlainRecord(value.candidates) ||
    !hasExactOwnKeys(value.candidates, ROLE_RECORD_KEYS) ||
    !Array.isArray(value.legalActions) ||
    !hasCanonicalArrayKeys(value.legalActions)
  ) return false

  let candidateIds: string[] | null = null
  for (const role of ROLE_ORDER) {
    const candidates = value.candidates[role]
    if (!Array.isArray(candidates) || !hasCanonicalArrayKeys(candidates) || candidates.length < 3) {
      return false
    }
    const ids: string[] = []
    let prior: string | null = null
    for (const candidate of candidates as unknown[]) {
      if (!isCandidate(candidate) || ids.includes(candidate.id)) return false
      if (prior !== null && candidate.id <= prior) return false
      ids.push(candidate.id)
      prior = candidate.id
    }
    if (candidateIds === null) candidateIds = ids
    else if (
      candidateIds.length !== ids.length ||
      !candidateIds.every((id, index) => id === ids[index])
    ) return false
  }
  if (candidateIds === null || candidateIds.length < 3) return false

  let plans = 0
  let packages = 0
  for (const action of value.legalActions as unknown[]) {
    if (strictPlanAction(action, value.projectId) !== null) {
      plans += 1
      continue
    }
    if (
      !isPlainRecord(action) ||
      !hasExactOwnKeys(action, ACTION_KEYS) ||
      action.kind !== 'openPackage' ||
      action.projectId !== value.projectId ||
      action.label !== 'Open package'
    ) return false
    packages += 1
  }
  return plans === 1 && packages <= 1 && value.legalActions.length === plans + packages
}

function strictFirstFreeSlot(
  state: GameState,
  value: unknown,
): LotAuditionPlanningContext['firstFreeSlot'] | null {
  if (
    !isPlainRecord(value) ||
    !hasExactOwnKeys(value, CAPACITY_KEYS) ||
    !isNonNegativeSafeInteger(value.capacity) ||
    !isNonNegativeSafeInteger(value.occupied) ||
    !isNonNegativeSafeInteger(value.available) ||
    value.capacity !== value.occupied + value.available ||
    value.available <= 0 ||
    !Array.isArray(value.facilities) ||
    !hasCanonicalArrayKeys(value.facilities)
  ) return null
  const stateFacilities = uniqueById(state.operations.facilities)
  if (stateFacilities === null) return null
  let capacity = 0
  let occupied = 0
  let first: LotAuditionPlanningContext['firstFreeSlot'] | null = null
  let priorFacilityId: string | null = null
  for (const facility of value.facilities as unknown[]) {
    if (
      !isPlainRecord(facility) ||
      !hasExactOwnKeys(facility, FACILITY_KEYS) ||
      !isNonEmptyString(facility.facilityId) ||
      !isNonEmptyString(facility.facilityName) ||
      (priorFacilityId !== null && facility.facilityId <= priorFacilityId) ||
      !isNonNegativeSafeInteger(facility.capacity) ||
      facility.capacity <= 0 ||
      !isNonNegativeSafeInteger(facility.occupied) ||
      !isNonNegativeSafeInteger(facility.available) ||
      facility.capacity !== facility.occupied + facility.available ||
      !Array.isArray(facility.slots) ||
      !hasCanonicalArrayKeys(facility.slots) ||
      facility.slots.length !== facility.capacity
    ) return null
    const source = stateFacilities.get(facility.facilityId)
    if (
      source === undefined ||
      source.capability !== 'development-casting' ||
      source.capacity !== facility.capacity ||
      uniqueName(stateFacilities, facility.facilityId) !== facility.facilityName
    ) return null
    let facilityOccupied = 0
    for (let index = 0; index < facility.slots.length; index += 1) {
      const slot = facility.slots[index]
      if (!isPlainRecord(slot) || !hasExactOwnKeys(slot, SLOT_KEYS) || slot.slot !== index) {
        return null
      }
      if (slot.occupant === null) {
        if (first === null) {
          first = {
            facilityId: facility.facilityId,
            facilityName: facility.facilityName,
            capability: 'development-casting',
            slot: index,
          }
        }
      } else {
        if (
          !isPlainRecord(slot.occupant) ||
          !hasExactOwnKeys(slot.occupant, OCCUPANT_KEYS) ||
          (slot.occupant.owner !== 'production' &&
            slot.occupant.owner !== 'script' &&
            slot.occupant.owner !== 'casting') ||
          !isNonEmptyString(slot.occupant.ownerId) ||
          !isNonEmptyString(slot.occupant.activity) ||
          !isNonEmptyString(slot.occupant.title) ||
          !isNonEmptyString(slot.occupant.label)
        ) return null
        facilityOccupied += 1
      }
    }
    if (
      facility.occupied !== facilityOccupied ||
      facility.available !== facility.capacity - facilityOccupied
    ) return null
    capacity += facility.capacity
    occupied += facilityOccupied
    priorFacilityId = facility.facilityId
  }
  if (value.capacity !== capacity || value.occupied !== occupied || first === null) return null
  return first
}

function strictContextForState(state: GameState): LotAuditionPlanningContext | null {
  if (
    !isClosedCanonicalState(state) ||
    state.founding !== null ||
    state.economyEngagedEver !== true ||
    state.operations.mode !== 'managed' ||
    state.scriptDevelopment.mode !== 'managed' ||
    state.castingSessions.mode !== 'managed' ||
    !Array.isArray(state.castingSessions.sessions) ||
    !hasCanonicalArrayKeys(state.castingSessions.sessions) ||
    state.castingSessions.sessions.length !== 0
  ) return null

  const projected = adapter.castingSessionsBoard(state) as unknown
  const canonical = castingSessionsReadModel(state) as unknown
  if (!sameClosedValue(projected, canonical)) return null
  if (
    !isPlainRecord(projected) ||
    !hasExactOwnKeys(projected, BOARD_KEYS) ||
    projected.mode !== 'managed' ||
    !isPlainRecord(projected.activation) ||
    !hasExactOwnKeys(projected.activation, ACTIVATION_KEYS) ||
    projected.activation.canActivate !== false ||
    projected.activation.label !== 'Casting Sessions active' ||
    projected.activation.blocker !== null ||
    !isPlainRecord(projected.sections) ||
    !hasExactOwnKeys(projected.sections, SECTION_KEYS) ||
    projected.nextDecision !== null
  ) return null
  for (const section of SECTION_KEYS) {
    const rows = projected.sections[section]
    if (!Array.isArray(rows) || !hasCanonicalArrayKeys(rows)) return null
    if (section === 'readyToPlan' ? rows.length !== 1 : rows.length !== 0) return null
  }
  const readyToPlan = projected.sections.readyToPlan
  if (!Array.isArray(readyToPlan)) return null
  const card = strictCard(state, readyToPlan[0])
  const firstFreeSlot = strictFirstFreeSlot(state, projected.capacity)
  if (card === null || firstFreeSlot === null) return null
  return {
    kind: 'audition-planning',
    project: card.project,
    firstFreeSlot,
    planAction: card.action,
  }
}

function contextIsClosed(value: unknown): value is LotAuditionPlanningContext {
  if (
    !isPlainRecord(value) ||
    !hasExactOwnKeys(value, CONTEXT_KEYS) ||
    value.kind !== 'audition-planning' ||
    !closedCardShape(value.project) ||
    !isPlainRecord(value.firstFreeSlot) ||
    !hasExactOwnKeys(value.firstFreeSlot, FIRST_FREE_KEYS) ||
    !isNonEmptyString(value.firstFreeSlot.facilityId) ||
    !isNonEmptyString(value.firstFreeSlot.facilityName) ||
    value.firstFreeSlot.capability !== 'development-casting' ||
    !isNonNegativeSafeInteger(value.firstFreeSlot.slot) ||
    strictPlanAction(value.planAction, value.project.projectId) === null ||
    !(value.project.legalActions as unknown[]).some((action) =>
      sameClosedValue(action, value.planAction),
    )
  ) return false
  return true
}

/**
 * Prove the exact current Lot-origin owner and return the sole legal first-session
 * planner context. The complete board is checked against Core and then closed
 * field-by-field; this selector never chooses the first plausible card.
 */
export function currentLotAuditionPlanningContext(
  authority: LotAuditionPlanningOpenAuthority,
): LotAuditionPlanningContext | null {
  try {
    if (
      !isPlainRecord(authority) ||
      !hasExactOwnKeys(authority, AUTHORITY_KEYS) ||
      authority.hollywoodEnabled !== true ||
      authority.origin !== 'lot-browse-talent' ||
      authority.worldInputOwner !== true ||
      authority.originState !== authority.currentState ||
      authority.originScreen !== authority.currentScreen ||
      authority.originPresentation !== authority.currentPresentation ||
      !isPlainRecord(authority.originScreen) ||
      authority.originScreen.kind !== 'lot' ||
      typeof authority.originPresentation !== 'object' ||
      authority.originPresentation === null
    ) return null
    return strictContextForState(authority.originState)
  } catch {
    return null
  }
}

/** Exact closed comparator for stale-workspace revalidation. */
export function sameLotAuditionPlanningContext(
  left: LotAuditionPlanningContext | null,
  right: LotAuditionPlanningContext | null,
): boolean {
  try {
    if (left === null || right === null) return left === right
    return contextIsClosed(left) && contextIsClosed(right) && sameClosedValue(left, right)
  } catch {
    return false
  }
}

/** Close and validate one explicit six-read payload against one exact context. */
export function lotAuditionPlanningPayload(
  context: LotAuditionPlanningContext,
  value: unknown,
): StartCastingSessionPayload | null {
  try {
    if (
      !contextIsClosed(context) ||
      !isPlainRecord(value) ||
      !hasExactOwnKeys(value, PAYLOAD_KEYS) ||
      value.projectId !== context.project.projectId ||
      !isPlainRecord(value.slate) ||
      !hasExactOwnKeys(value.slate, ROLE_RECORD_KEYS)
    ) return null
    const slate = {} as StartCastingSessionPayload['slate']
    const unique = new Set<string>()
    for (const role of ROLE_ORDER) {
      const pair = value.slate[role]
      const candidates = context.project.candidates[role]
      if (
        !Array.isArray(pair) ||
        !hasCanonicalArrayKeys(pair) ||
        pair.length !== 2 ||
        !isNonEmptyString(pair[0]) ||
        !isNonEmptyString(pair[1]) ||
        pair[0] === pair[1] ||
        !candidates.some((candidate) => candidate.available && candidate.id === pair[0]) ||
        !candidates.some((candidate) => candidate.available && candidate.id === pair[1])
      ) return null
      slate[role] = [pair[0], pair[1]]
      unique.add(pair[0])
      unique.add(pair[1])
    }
    if (unique.size < 3) return null
    return { projectId: context.project.projectId, slate }
  } catch {
    return null
  }
}

function strictReceipt(value: unknown): value is LotAuditionPlanningReceipt {
  if (
    !isPlainRecord(value) ||
    !hasExactOwnKeys(value, RECEIPT_KEYS) ||
    !isNonEmptyString(value.sessionId) ||
    !isNonEmptyString(value.projectId) ||
    !isNonEmptyString(value.title) ||
    !isNonNegativeSafeInteger(value.startedWeek) ||
    !isNonNegativeSafeInteger(value.dueWeek) ||
    value.dueWeek !== value.startedWeek + 1 ||
    !isNonEmptyString(value.facilityId) ||
    !isNonEmptyString(value.facilityName) ||
    !isNonNegativeSafeInteger(value.slot) ||
    !Array.isArray(value.reads) ||
    !hasCanonicalArrayKeys(value.reads) ||
    value.reads.length !== 6
  ) return false
  for (let index = 0; index < value.reads.length; index += 1) {
    const read = value.reads[index]
    const role = ROLE_ORDER[Math.floor(index / 2)]
    if (
      !isPlainRecord(read) ||
      !hasExactOwnKeys(read, READ_KEYS) ||
      read.role !== role ||
      !isNonEmptyString(read.talentId) ||
      !isNonEmptyString(read.name)
    ) return false
    if (index % 2 === 1 && value.reads[index - 1]!.talentId === read.talentId) return false
  }
  return new Set(value.reads.map((read) => read.talentId)).size >= 3
}

function readsFor(
  context: LotAuditionPlanningContext,
  payload: StartCastingSessionPayload,
): LotAuditionPlanningReceipt['reads'] | null {
  const reads: LotAuditionPlanningRead[] = []
  for (const role of ROLE_ORDER) {
    for (const talentId of payload.slate[role]) {
      const matches = context.project.candidates[role].filter(
        (candidate) => candidate.id === talentId && candidate.available,
      )
      if (matches.length !== 1) return null
      reads.push({ role, talentId, name: matches[0]!.name })
    }
  }
  return reads.length === 6
    ? reads as LotAuditionPlanningReceipt['reads']
    : null
}

/** Prove the exact immediate Engine successor of one explicit camera-test slate. */
export function acceptedLotAuditionPlanningReceipt(
  before: GameState,
  after: GameState,
  payload: StartCastingSessionPayload,
): LotAuditionPlanningReceipt | null {
  try {
    if (
      before === after ||
      !isClosedCanonicalState(before) ||
      !isClosedCanonicalState(after) ||
      before.seed !== after.seed ||
      before.market.tick !== after.market.tick ||
      before.rngState !== after.rngState ||
      before.operations.mode !== 'managed' ||
      after.operations.mode !== 'managed' ||
      before.scriptDevelopment.mode !== 'managed' ||
      after.scriptDevelopment.mode !== 'managed' ||
      before.castingSessions.mode !== 'managed' ||
      after.castingSessions.mode !== 'managed' ||
      before.construction.mode !== 'managed' ||
      after.construction.mode !== 'managed' ||
      !sameClosedFieldsExcept(before, after, new Set(['castingSessions']))
    ) return null
    const context = strictContextForState(before)
    if (context === null) return null
    const closedPayload = lotAuditionPlanningPayload(context, payload)
    if (closedPayload === null) return null
    const reads = readsFor(context, closedPayload)
    if (reads === null) return null

    const priorCasting = before.castingSessions as unknown
    const nextCasting = after.castingSessions as unknown
    if (
      !isPlainRecord(priorCasting) ||
      !isPlainRecord(nextCasting) ||
      !hasExactOwnKeys(priorCasting, ['mode', 'sessions']) ||
      !hasExactOwnKeys(nextCasting, ['mode', 'sessions']) ||
      priorCasting.mode !== nextCasting.mode ||
      !Array.isArray(priorCasting.sessions) ||
      !hasCanonicalArrayKeys(priorCasting.sessions) ||
      !Array.isArray(nextCasting.sessions) ||
      !hasCanonicalArrayKeys(nextCasting.sessions) ||
      priorCasting.sessions.length !== 0 ||
      nextCasting.sessions.length !== 1
    ) return null
    const session = nextCasting.sessions[0]
    const sessionId = canonicalCastingSessionId(priorCasting.sessions.length)
    if (
      !isPlainRecord(session) ||
      !hasExactOwnKeys(session, SESSION_KEYS) ||
      session.id !== sessionId ||
      session.projectId !== closedPayload.projectId ||
      session.status !== 'auditioning' ||
      !sameClosedValue(session.slate, closedPayload.slate) ||
      session.startedWeek !== before.market.tick ||
      session.dueWeek !== before.market.tick + 1 ||
      session.results !== null ||
      !isPlainRecord(session.reservation) ||
      !hasExactOwnKeys(session.reservation, RESERVATION_KEYS) ||
      session.reservation.sessionId !== sessionId ||
      session.reservation.facilityId !== context.firstFreeSlot.facilityId ||
      session.reservation.capability !== context.firstFreeSlot.capability ||
      session.reservation.slot !== context.firstFreeSlot.slot
    ) return null

    return {
      sessionId,
      projectId: closedPayload.projectId,
      title: context.project.title,
      startedWeek: before.market.tick,
      dueWeek: before.market.tick + 1,
      facilityId: context.firstFreeSlot.facilityId,
      facilityName: context.firstFreeSlot.facilityName,
      slot: context.firstFreeSlot.slot,
      reads,
    }
  } catch {
    return null
  }
}

/** Closed receipt comparator for App ownership and one-shot world consumption. */
export function sameLotAuditionPlanningReceipt(
  left: LotAuditionPlanningReceipt | null,
  right: LotAuditionPlanningReceipt | null,
): boolean {
  try {
    if (left === null || right === null) return left === right
    return strictReceipt(left) && strictReceipt(right) && sameClosedValue(left, right)
  } catch {
    return false
  }
}

/** Revalidate the durable session/reservation/read facts named by a live receipt. */
export function currentLotAuditionPlanningReceipt(
  state: GameState,
  receipt: LotAuditionPlanningReceipt,
): LotAuditionPlanningReceipt | null {
  try {
    if (
      !strictReceipt(receipt) ||
      !isClosedCanonicalState(state) ||
      state.operations.mode !== 'managed' ||
      state.scriptDevelopment.mode !== 'managed' ||
      state.castingSessions.mode !== 'managed' ||
      state.construction.mode !== 'managed' ||
      state.market.tick !== receipt.startedWeek
    ) return null
    const sessions = uniqueById(state.castingSessions.sessions)
    const projects = uniqueById(state.scriptDevelopment.projects)
    const concepts = uniqueById(state.concepts)
    const talent = uniqueById(state.talent)
    const facilities = uniqueById(state.operations.facilities)
    if (
      sessions === null ||
      projects === null ||
      concepts === null ||
      talent === null ||
      facilities === null
    ) return null
    const session = sessions.get(receipt.sessionId)
    const project = projects.get(receipt.projectId)
    if (
      session === undefined ||
      project === undefined ||
      session.projectId !== receipt.projectId ||
      session.status !== 'auditioning' ||
      session.startedWeek !== receipt.startedWeek ||
      session.dueWeek !== receipt.dueWeek ||
      session.results !== null ||
      !isPlainRecord(session.reservation) ||
      session.reservation.sessionId !== receipt.sessionId ||
      session.reservation.facilityId !== receipt.facilityId ||
      session.reservation.capability !== 'development-casting' ||
      session.reservation.slot !== receipt.slot ||
      !isNonEmptyString(project.conceptId) ||
      uniqueTitle(concepts, project.conceptId) !== receipt.title ||
      uniqueName(facilities, receipt.facilityId) !== receipt.facilityName ||
      !isPlainRecord(session.slate) ||
      !hasExactOwnKeys(session.slate, ROLE_RECORD_KEYS)
    ) return null
    let index = 0
    for (const role of ROLE_ORDER) {
      const pair = session.slate[role]
      if (
        !Array.isArray(pair) ||
        !hasCanonicalArrayKeys(pair) ||
        pair.length !== 2 ||
        pair[0] === pair[1]
      ) return null
      for (const talentId of pair) {
        const read = receipt.reads[index]
        if (
          read === undefined ||
          read.role !== role ||
          read.talentId !== talentId ||
          uniqueName(talent, talentId) !== read.name ||
          talent.get(talentId)?.role !== 'actor'
        ) return null
        index += 1
      }
    }

    const projected = adapter.castingSessionsBoard(state) as unknown
    const canonical = castingSessionsReadModel(state) as unknown
    if (!sameClosedValue(projected, canonical)) return null
    const board = projected as CastingSessionsReadModel
    const matches = board.sections.auditioning.filter(
      (card) => card.sessionId === receipt.sessionId && card.projectId === receipt.projectId,
    )
    if (
      matches.length !== 1 ||
      matches[0]!.title !== receipt.title ||
      matches[0]!.dueWeek !== receipt.dueWeek
    ) return null
    return structuredClone(receipt)
  } catch {
    return null
  }
}
