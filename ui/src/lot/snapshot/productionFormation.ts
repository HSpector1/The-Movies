import { TUNING, type GameState } from '../../../../src/core/index.ts'
import type {
  AttentionState,
  BuildingId,
  LotPersonState,
  LotProductionCommand,
  ProductionOperationsState,
  StudioLotSnapshot,
} from './StudioLotSnapshot.ts'
import { placedFacilityIdOf } from './StudioLotSnapshot.ts'
import { lotPersonWorkContext } from './personWork.ts'

export type GreenlightFormationReceipt = {
  productionId: string
  directorId: string
  leadId: string
  greenlightWeek: number
  scriptProjectId: string | null
}

export type ProductionFormationContext = {
  operation: ProductionOperationsState
  director: LotPersonState
  lead: LotPersonState
  receipt: GreenlightFormationReceipt
}

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function sameValue(left: unknown, right: unknown): boolean {
  if (Object.is(left, right)) return true
  if (Array.isArray(left) || Array.isArray(right)) {
    if (!Array.isArray(left) || !Array.isArray(right) || left.length !== right.length) {
      return false
    }
    return left.every((value, index) => sameValue(value, right[index]))
  }
  if (!isRecord(left) || !isRecord(right)) return false
  const leftKeys = Object.keys(left).sort()
  const rightKeys = Object.keys(right).sort()
  return leftKeys.length === rightKeys.length &&
    leftKeys.every(
      (key, index) => key === rightKeys[index] && sameValue(left[key], right[key]),
    )
}

function uniqueByStringField(
  rows: readonly unknown[],
  field: string,
): Map<string, Record<string, unknown>> | null {
  const byId = new Map<string, Record<string, unknown>>()
  for (const value of rows) {
    if (!isRecord(value)) return null
    const row = value
    const id = row[field]
    if (!isNonEmptyString(id) || byId.has(id)) return null
    byId.set(id, row)
  }
  return byId
}

function samePriorRows(
  before: Map<string, Record<string, unknown>>,
  after: Map<string, Record<string, unknown>>,
): boolean {
  for (const [id, prior] of before) {
    const current = after.get(id)
    if (current === undefined || !sameValue(prior, current)) return false
  }
  return true
}

function sameExcept(
  left: Record<string, unknown>,
  right: Record<string, unknown>,
  excluded: ReadonlySet<string>,
): boolean {
  const leftRest = Object.fromEntries(
    Object.entries(left).filter(([key]) => !excluded.has(key)),
  )
  const rightRest = Object.fromEntries(
    Object.entries(right).filter(([key]) => !excluded.has(key)),
  )
  return sameValue(leftRest, rightRest)
}

function linkedScriptProjectId(
  before: GameState,
  after: GameState,
  productionId: string,
): string | null | undefined {
  if (before.scriptDevelopment.mode !== after.scriptDevelopment.mode) return undefined

  if (before.scriptDevelopment.mode === 'legacy') {
    return sameValue(before.scriptDevelopment, after.scriptDevelopment) ? null : undefined
  }
  if (after.scriptDevelopment.mode !== 'managed') return undefined
  if (
    !Array.isArray(before.scriptDevelopment.projects) ||
    !Array.isArray(after.scriptDevelopment.projects) ||
    after.scriptDevelopment.projects.length !== before.scriptDevelopment.projects.length
  ) return undefined

  const beforeProjects = uniqueByStringField(
    before.scriptDevelopment.projects,
    'id',
  )
  const afterProjects = uniqueByStringField(
    after.scriptDevelopment.projects,
    'id',
  )
  if (beforeProjects === null || afterProjects === null) return undefined

  let linkedId: string | null = null
  const linkFields = new Set(['status', 'productionId'])
  for (const [id, prior] of beforeProjects) {
    const current = afterProjects.get(id)
    if (current === undefined) return undefined
    if (sameValue(prior, current)) continue
    if (
      linkedId !== null ||
      prior.status !== 'ready' ||
      prior.productionId !== null ||
      current.status !== 'inProduction' ||
      current.productionId !== productionId ||
      !sameExcept(prior, current, linkFields)
    ) return undefined
    linkedId = id
  }
  return linkedId === null ? undefined : linkedId
}

/**
 * Validate the exact immediate before/after footprint of one Engine-accepted
 * managed greenlight. This is event provenance only: it does not predict an ID,
 * recompute price/legality, or treat the studio seed as identity.
 */
export function acceptedGreenlightFormationReceipt(
  before: GameState,
  after: GameState,
): GreenlightFormationReceipt | null {
  if (
    before === after ||
    before.operations.mode !== 'managed' ||
    after.operations.mode !== 'managed' ||
    before.seed !== after.seed ||
    !Number.isSafeInteger(before.market.tick) ||
    before.market.tick < 0 ||
    before.market.tick !== after.market.tick ||
    before.rngState !== after.rngState ||
    !Array.isArray(before.talent) ||
    !Array.isArray(after.talent) ||
    !Array.isArray(before.studio.activeProductions) ||
    !Array.isArray(after.studio.activeProductions) ||
    after.studio.activeProductions.length !== before.studio.activeProductions.length + 1
  ) return null

  const beforeProductions = uniqueByStringField(
    before.studio.activeProductions,
    'id',
  )
  const afterProductions = uniqueByStringField(
    after.studio.activeProductions,
    'id',
  )
  if (
    beforeProductions === null ||
    afterProductions === null ||
    !samePriorRows(beforeProductions, afterProductions)
  ) return null

  const addedProductionIds = [...afterProductions.keys()].filter(
    (id) => !beforeProductions.has(id),
  )
  if (addedProductionIds.length !== 1) return null
  const productionId = addedProductionIds[0]!
  const production = afterProductions.get(productionId)!
  const directorId = production.directorId
  const cast = production.cast
  const leadId = isRecord(cast) ? cast.lead : undefined
  if (
    production.startTick !== before.market.tick ||
    production.remainingTicks !== TUNING.PRODUCTION_TICKS ||
    !isNonEmptyString(directorId) ||
    !isNonEmptyString(leadId) ||
    directorId === leadId
  ) return null

  for (const personId of [directorId, leadId]) {
    const beforePeople = (before.talent as unknown[]).filter(
      (person) => isRecord(person) && person.id === personId,
    )
    const afterPeople = (after.talent as unknown[]).filter(
      (person) => isRecord(person) && person.id === personId,
    )
    if (
      beforePeople.length !== 1 ||
      afterPeople.length !== 1 ||
      !sameValue(beforePeople[0], afterPeople[0])
    ) return null
  }

  if (
    !Array.isArray(before.operations.facilities) ||
    !Array.isArray(after.operations.facilities) ||
    !Array.isArray(before.operations.workflows) ||
    !Array.isArray(after.operations.workflows) ||
    after.operations.workflows.length !== before.operations.workflows.length + 1
  ) return null

  const beforeFacilities = uniqueByStringField(
    before.operations.facilities,
    'id',
  )
  const afterFacilities = uniqueByStringField(
    after.operations.facilities,
    'id',
  )
  const beforeWorkflows = uniqueByStringField(
    before.operations.workflows,
    'productionId',
  )
  const afterWorkflows = uniqueByStringField(
    after.operations.workflows,
    'productionId',
  )
  if (
    beforeFacilities === null ||
    afterFacilities === null ||
    beforeFacilities.size !== afterFacilities.size ||
    !samePriorRows(beforeFacilities, afterFacilities) ||
    beforeWorkflows === null ||
    afterWorkflows === null ||
    !samePriorRows(beforeWorkflows, afterWorkflows)
  ) return null

  const addedWorkflowIds = [...afterWorkflows.keys()].filter(
    (id) => !beforeWorkflows.has(id),
  )
  if (addedWorkflowIds.length !== 1 || addedWorkflowIds[0] !== productionId) return null
  const workflow = afterWorkflows.get(productionId)!
  if (
    workflow.phase !== 'development' ||
    workflow.shootingTask !== null ||
    workflow.blocker !== null ||
    !Array.isArray(workflow.reservations) ||
    workflow.reservations.length !== 1
  ) return null

  const reservation = workflow.reservations[0]
  if (!isRecord(reservation)) return null
  const facility = isNonEmptyString(reservation.facilityId)
    ? afterFacilities.get(reservation.facilityId)
    : undefined
  if (
    reservation.productionId !== productionId ||
    reservation.phase !== 'development' ||
    reservation.capability !== 'development-casting' ||
    facility === undefined ||
    !isNonEmptyString(facility.name) ||
    facility.capability !== 'development-casting' ||
    !Number.isSafeInteger(facility.capacity) ||
    (facility.capacity as number) <= 0 ||
    !Number.isSafeInteger(reservation.slot) ||
    (reservation.slot as number) < 0 ||
    (reservation.slot as number) >= (facility.capacity as number)
  ) return null

  if (
    !Array.isArray(before.ledger) ||
    !Array.isArray(after.ledger) ||
    after.ledger.length <= before.ledger.length ||
    !before.ledger.every((row, index) => sameValue(row, after.ledger[index]))
  ) return null
  const appendedLedger = after.ledger.slice(before.ledger.length)
  const productionRows = appendedLedger.filter((row) => row.kind === 'production')
  if (
    productionRows.length !== 1 ||
    productionRows[0]!.productionId !== productionId ||
    productionRows[0]!.week !== before.market.tick ||
    appendedLedger.some(
      (row) =>
        (row.kind !== 'production' && row.kind !== 'freelancerFee') ||
        row.productionId !== productionId ||
        row.week !== before.market.tick ||
        !Number.isFinite(row.amount) ||
        row.amount >= 0 ||
        !isNonEmptyString(row.note) ||
        (row.kind === 'freelancerFee' && !isNonEmptyString(row.talentId)),
    )
  ) return null

  const scriptProjectId = linkedScriptProjectId(before, after, productionId)
  if (scriptProjectId === undefined) return null

  return {
    productionId,
    directorId,
    leadId,
    greenlightWeek: before.market.tick,
    scriptProjectId,
  }
}

/** Field-exact comparison for App's independent callback check. */
export function sameGreenlightFormationReceipt(
  left: GreenlightFormationReceipt | null,
  right: GreenlightFormationReceipt | null,
): boolean {
  if (left === null || right === null) return left === right
  return left.productionId === right.productionId &&
    left.directorId === right.directorId &&
    left.leadId === right.leadId &&
    left.greenlightWeek === right.greenlightWeek &&
    left.scriptProjectId === right.scriptProjectId
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

function completeFormationOperation(
  value: unknown,
  receipt: GreenlightFormationReceipt,
): value is ProductionOperationsState {
  if (!isRecord(value)) return false
  return value.productionId === receipt.productionId &&
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
    value.directorId === receipt.directorId &&
    isNonEmptyString(value.directorName) &&
    value.leadId === receipt.leadId &&
    isNonEmptyString(value.leadName) &&
    receipt.directorId !== receipt.leadId &&
    (value.taskStatus === null ||
      (typeof value.taskStatus === 'string' && TASK_STATUSES.has(value.taskStatus))) &&
    isNonEmptyString(value.statusLabel) &&
    hasValidBlocker(value.blocker) &&
    typeof value.attention === 'string' &&
    ATTENTION_STATES.has(value.attention as AttentionState) &&
    hasValidCommand(value.currentCommand, receipt.productionId, receipt.directorId)
}

function validReceipt(receipt: GreenlightFormationReceipt): boolean {
  return isNonEmptyString(receipt.productionId) &&
    isNonEmptyString(receipt.directorId) &&
    isNonEmptyString(receipt.leadId) &&
    receipt.directorId !== receipt.leadId &&
    Number.isSafeInteger(receipt.greenlightWeek) &&
    receipt.greenlightWeek >= 0 &&
    (receipt.scriptProjectId === null || isNonEmptyString(receipt.scriptProjectId))
}

function completeFormationPerson(value: unknown): value is LotPersonState {
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

/** Resolve one exact current operation plus its exact Director and Lead people. */
export function productionFormationContext(
  snapshot: StudioLotSnapshot,
  receipt: GreenlightFormationReceipt,
): ProductionFormationContext | null {
  if (
    !validReceipt(receipt) ||
    snapshot.operationsMode !== 'managed' ||
    snapshot.stageAssignmentAuthority !== 'engine' ||
    !Array.isArray(snapshot.productionOperations) ||
    !Array.isArray(snapshot.people)
  ) return null

  const seenOperationIds = new Set<string>()
  for (const operation of snapshot.productionOperations as unknown[]) {
    if (!isRecord(operation) || !isNonEmptyString(operation.productionId)) return null
    if (seenOperationIds.has(operation.productionId)) return null
    seenOperationIds.add(operation.productionId)
  }
  const operations = (snapshot.productionOperations as unknown[]).filter(
    (operation) => isRecord(operation) && operation.productionId === receipt.productionId,
  )
  if (operations.length !== 1 || !completeFormationOperation(operations[0], receipt)) return null
  const operation = operations[0]

  const people = snapshot.people as unknown[]
  if (!people.every(completeFormationPerson)) return null
  const directors = people.filter((person) => person.id === receipt.directorId)
  const leads = people.filter((person) => person.id === receipt.leadId)
  if (directors.length !== 1 || leads.length !== 1) return null
  const director = directors[0]!
  const lead = leads[0]!
  if (
    director.role !== 'director' ||
    lead.role !== 'talent' ||
    director.authority !== 'active-production' ||
    lead.authority !== 'active-production' ||
    director.productionId !== receipt.productionId ||
    lead.productionId !== receipt.productionId ||
    director.productionTitle !== operation.title ||
    lead.productionTitle !== operation.title ||
    director.name !== operation.directorName ||
    lead.name !== operation.leadName
  ) return null

  const directorWork = lotPersonWorkContext(snapshot, receipt.directorId)
  const leadWork = lotPersonWorkContext(snapshot, receipt.leadId)
  if (
    directorWork.kind !== 'managed-production' ||
    directorWork.person !== director ||
    directorWork.productionRole !== 'director' ||
    directorWork.productionId !== operation.productionId ||
    directorWork.productionTitle !== operation.title ||
    directorWork.phase !== operation.phase ||
    directorWork.phaseLabel !== operation.phaseLabel ||
    directorWork.productionStatusLabel !== operation.statusLabel ||
    directorWork.productionWeeksRemaining !== operation.weeksRemaining ||
    directorWork.directorTaskStatus !== operation.taskStatus ||
    directorWork.productionFacilities.buildingId !== operation.locationBuildingId ||
    directorWork.productionFacilities.facilityLabel !== operation.facilityLabel ||
    leadWork.kind !== 'managed-production' ||
    leadWork.person !== lead ||
    leadWork.productionRole !== 'lead' ||
    leadWork.productionId !== operation.productionId ||
    leadWork.productionTitle !== operation.title ||
    leadWork.phase !== operation.phase ||
    leadWork.phaseLabel !== operation.phaseLabel ||
    leadWork.productionStatusLabel !== operation.statusLabel ||
    leadWork.productionWeeksRemaining !== operation.weeksRemaining ||
    leadWork.directorTaskStatus !== null ||
    leadWork.productionFacilities.buildingId !== operation.locationBuildingId ||
    leadWork.productionFacilities.facilityLabel !== operation.facilityLabel
  ) return null

  return { operation, director, lead, receipt }
}

/** Initial-only gate: accepted week, Development, and governed full countdown. */
export function initialProductionFormationContext(
  snapshot: StudioLotSnapshot,
  receipt: GreenlightFormationReceipt,
): ProductionFormationContext | null {
  const context = productionFormationContext(snapshot, receipt)
  if (
    context === null ||
    snapshot.week !== receipt.greenlightWeek ||
    context.operation.phase !== 'development' ||
    context.operation.weeksRemaining !== TUNING.PRODUCTION_TICKS
  ) return null
  return context
}
