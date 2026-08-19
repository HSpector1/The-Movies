import {
  findConcept,
  payrollSummary,
  studioDecision,
  studioDevelopment,
  studioLotSnapshot,
} from '../../engine/adapter.ts'
import type {
  ConstructionCompletionSummary,
  GameState,
  PeriodSummary,
  ProductionBoardCardView,
  SimResult,
  SimStopReason,
} from '../../engine/adapter.ts'
import { stage7ProductionDetailContext } from './stage7Production.ts'
import {
  FOUNDING_STAGE_SEVEN_BUILDING_ID,
  lotStageIdentityFor,
} from './stageIdentity.ts'
import type {
  BuildingId,
  LotProductionCommand,
  ProductionOperationsState,
} from './StudioLotSnapshot.ts'
import { placedBuildingId, placedFacilityIdOf } from './StudioLotSnapshot.ts'

export type LotNextEventStopReason = Exclude<SimStopReason, 'release' | 'limit'>

export type LotNextEventCompletedRun = {
  productionId: string
  title: string
}

export type LotNextEventWorldTarget =
  | { kind: 'script'; projectId: string; title: string; buildingId: 'writers' }
  | {
      kind: 'casting'
      sessionId: string
      projectId: string
      title: string
      buildingId: 'casting'
    }
  | {
      kind: 'production'
      productionId: string
      title: string
      /**
       * C2a-M2's recorded seam, CLOSED at C2a-M4 (WORLD-M2a's carried spec).
       *
       * `location` was a TWO-VALUE vocabulary — `stage-7`, and "the other one" —
       * and it could not survive a studio that BUILDS a third soundstage: the
       * rail printed "Soundstage 12" for a stage that is not Soundstage 12, and
       * App's world hop translated the same two values back into `stage-b` and
       * opened the wrong building. Both are G12 offences the moment §3.4's
       * buildable stages exist.
       *
       * The receipt now CARRIES the truth instead of re-deriving it: the exact
       * body the picture is on, and the engine's OWN name for its facility (§3.1
       * display-name ruling — the engine name is the single spoken authority).
       * `location` is kept beside them, unchanged and still validated, because
       * accepted receipts are written against it and a closed shape widens
       * additively or not at all.
       */
      location: 'stage-7' | 'stage-12-semantic'
      buildingId: BuildingId
      stageName: string
    }
  | {
      kind: 'run-completed'
      runs: LotNextEventCompletedRun[]
      buildingId: 'theater'
    }
  | { kind: 'cash'; buildingId: 'admin' }
  | { kind: 'contracts'; change: 'expired' | 'renewal'; buildingId: null }
  | {
      kind: 'construction'
      projectId: string
      facilityId: string
      name: string
      /**
       * WHICH facility completed (C1-M1b).
       *
       * `'expansion'` for the legacy Annex, exactly as before. For any other placement
       * it is that facility's own world id (`placed-<placementId>`), so the rail's
       * "show me" lands on the building that actually completed instead of pointing at
       * the Annex parcel — the truthful-but-neutral answer a player got when a facility
       * on the South Lawn finished and the world named the wrong ground.
       */
      buildingId: BuildingId
    }

export type LotNextEventReceipt = {
  fromWeek: number
  toWeek: number
  weeks: number
  stopReason: LotNextEventStopReason
  stopMessage: string
  summary: PeriodSummary
  cashNow: number
  completedRuns: LotNextEventCompletedRun[]
  constructionCompletion: ConstructionCompletionSummary | null
  target: LotNextEventWorldTarget
}

export type LotNextEventNeutralFeedback = {
  kind: 'next-event-neutral'
  toWeek: number
  cashNow: number
  stopMessage: string | null
  constructionCompletion: ConstructionCompletionSummary | null
}

export type LotCadenceFeedback =
  | {
      kind: 'week'
      week: number
      constructionCompletion: ConstructionCompletionSummary | null
    }
  | { kind: 'next-event-exact'; receipt: LotNextEventReceipt }
  | LotNextEventNeutralFeedback

const RECEIPT_KEYS = [
  'fromWeek',
  'toWeek',
  'weeks',
  'stopReason',
  'stopMessage',
  'summary',
  'cashNow',
  'completedRuns',
  'constructionCompletion',
  'target',
] as const

const SUMMARY_KEYS = [
  'fromWeek',
  'toWeekInclusive',
  'weeks',
  'payroll',
  'overhead',
  'studioRevenue',
  'boxOfficeLump',
  'production',
  'publicity',
  'construction',
  'otherCash',
  'netCash',
  'releases',
  'completedRuns',
] as const

const SUMMARY_MONEY_KEYS = [
  'payroll',
  'overhead',
  'studioRevenue',
  'boxOfficeLump',
  'production',
  'publicity',
  'construction',
  'otherCash',
  'netCash',
] as const

const COMPLETION_KEYS = [
  'projectId',
  'facilityId',
  'name',
  'completedWeek',
  'message',
] as const

const COMPLETED_RUN_KEYS = ['productionId', 'title'] as const

const OPERATION_KEYS = [
  'productionId',
  'title',
  'phase',
  'phaseLabel',
  'weeksRemaining',
  'progress01',
  'locationBuildingId',
  'facilityLabel',
  'directorId',
  'directorName',
  'leadId',
  'leadName',
  'taskStatus',
  'statusLabel',
  'blocker',
  'attention',
  'currentCommand',
] as const

const OPERATION_COMPANY_KEYS = [
  ...OPERATION_KEYS,
  'companyMembers',
] as const

const EXACT_STOP_REASONS = new Set<LotNextEventStopReason>([
  'scriptReview',
  'castingReview',
  'productionDecision',
  'constructionCompleted',
  'runCompleted',
  'contractExpired',
  'renewalWindow',
  'cashNegative',
])

function isRecord(value: unknown): value is Record<PropertyKey, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function hasExactOwnKeys(
  value: Record<PropertyKey, unknown>,
  expected: readonly string[],
): boolean {
  const actual = Reflect.ownKeys(value)
  return actual.length === expected.length &&
    expected.every((key) => Object.prototype.hasOwnProperty.call(value, key))
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isNonNegativeSafeInteger(value: unknown): value is number {
  return Number.isSafeInteger(value) && (value as number) >= 0
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function hasCanonicalArrayKeys(value: readonly unknown[]): boolean {
  const keys = Reflect.ownKeys(value)
  if (keys.length !== value.length + 1 || !keys.includes('length')) return false
  for (let index = 0; index < value.length; index += 1) {
    if (!Object.prototype.hasOwnProperty.call(value, String(index))) return false
  }
  return true
}

function sameClosedValue(left: unknown, right: unknown): boolean {
  if (Object.is(left, right)) return true
  if (Array.isArray(left) || Array.isArray(right)) {
    if (!Array.isArray(left) || !Array.isArray(right)) return false
    const leftKeys = Reflect.ownKeys(left)
    const rightKeys = Reflect.ownKeys(right)
    return leftKeys.length === rightKeys.length &&
      leftKeys.every(
        (key) =>
          Object.prototype.hasOwnProperty.call(right, key) &&
          sameClosedValue(left[key as keyof typeof left], right[key as keyof typeof right]),
      )
  }
  if (!isRecord(left) || !isRecord(right)) return false
  const leftKeys = Reflect.ownKeys(left)
  const rightKeys = Reflect.ownKeys(right)
  return leftKeys.length === rightKeys.length &&
    leftKeys.every(
      (key) =>
        Object.prototype.hasOwnProperty.call(right, key) &&
        sameClosedValue(left[key], right[key]),
    )
}

function isCompletedRun(value: unknown): value is LotNextEventCompletedRun {
  return isRecord(value) &&
    hasExactOwnKeys(value, COMPLETED_RUN_KEYS) &&
    isNonEmptyString(value.productionId) &&
    isNonEmptyString(value.title)
}

function completedRuns(value: unknown): LotNextEventCompletedRun[] | null {
  if (!Array.isArray(value) || !hasCanonicalArrayKeys(value)) return null
  const rows: LotNextEventCompletedRun[] = []
  const ids = new Set<string>()
  for (const candidate of value as unknown[]) {
    if (!isCompletedRun(candidate) || ids.has(candidate.productionId)) return null
    ids.add(candidate.productionId)
    rows.push({ productionId: candidate.productionId, title: candidate.title })
  }
  return rows
}

function isSummaryShape(value: unknown): value is PeriodSummary {
  if (!isRecord(value) || !hasExactOwnKeys(value, SUMMARY_KEYS)) return false
  for (const key of ['fromWeek', 'toWeekInclusive', 'weeks', 'releases', 'completedRuns'] as const) {
    if (!isNonNegativeSafeInteger(value[key])) return false
  }
  for (const key of SUMMARY_MONEY_KEYS) {
    if (!isFiniteNumber(value[key])) return false
  }
  return true
}

function validSummaryFor(
  value: unknown,
  fromWeek: number,
  toWeek: number,
  weeks: number,
  completedRunCount: number,
): value is PeriodSummary {
  return isSummaryShape(value) &&
    value.fromWeek === fromWeek &&
    value.toWeekInclusive === toWeek - 1 &&
    value.weeks === weeks &&
    value.releases === 0 &&
    value.completedRuns === completedRunCount
}

function copySummary(summary: PeriodSummary): PeriodSummary {
  return {
    fromWeek: summary.fromWeek,
    toWeekInclusive: summary.toWeekInclusive,
    weeks: summary.weeks,
    payroll: summary.payroll,
    overhead: summary.overhead,
    studioRevenue: summary.studioRevenue,
    boxOfficeLump: summary.boxOfficeLump,
    production: summary.production,
    publicity: summary.publicity,
    construction: summary.construction,
    otherCash: summary.otherCash,
    netCash: summary.netCash,
    releases: summary.releases,
    completedRuns: summary.completedRuns,
  }
}

function isCompletionShape(value: unknown): value is ConstructionCompletionSummary {
  return isRecord(value) &&
    hasExactOwnKeys(value, COMPLETION_KEYS) &&
    isNonEmptyString(value.projectId) &&
    isNonEmptyString(value.facilityId) &&
    isNonEmptyString(value.name) &&
    isNonNegativeSafeInteger(value.completedWeek) &&
    isNonEmptyString(value.message)
}

function copyCompletion(
  completion: ConstructionCompletionSummary,
): ConstructionCompletionSummary {
  return {
    projectId: completion.projectId,
    facilityId: completion.facilityId,
    name: completion.name,
    completedWeek: completion.completedWeek,
    message: completion.message,
  }
}

/**
 * Independently validate the optional Annex completion co-event.
 *
 * This deliberately does not depend on primary-receipt acceptance, allowing one
 * exact completion notice to survive a neutral primary event without preserving
 * any failed target or summary claim.
 */
export function acceptedLotNextEventConstructionCompletion(
  renderedBefore: GameState,
  result: SimResult,
): ConstructionCompletionSummary | null {
  try {
    const completion: unknown = result.constructionCompletion
    if (
      !isCompletionShape(completion) ||
      completion.completedWeek !== result.toWeek ||
      renderedBefore === result.next ||
      typeof renderedBefore.seed !== 'string' ||
      renderedBefore.seed !== result.preTick.seed ||
      renderedBefore.seed !== result.next.seed ||
      !isNonNegativeSafeInteger(renderedBefore.market.tick) ||
      !isNonNegativeSafeInteger(result.fromWeek) ||
      result.fromWeek !== renderedBefore.market.tick ||
      !isNonNegativeSafeInteger(result.toWeek) ||
      !isNonNegativeSafeInteger(result.weeks) ||
      result.weeks <= 0 ||
      !isNonNegativeSafeInteger(result.preTick.market.tick) ||
      result.preTick.market.tick !== result.toWeek - 1 ||
      result.next.market.tick !== result.toWeek ||
      result.weeks !== result.toWeek - result.fromWeek
    ) return null

    const prior = studioDevelopment(result.preTick)
    const current = studioDevelopment(result.next)
    if (
      prior.mode !== 'managed' ||
      prior.status !== 'building' ||
      current.mode !== 'managed' ||
      current.status !== 'operational' ||
      prior.parcelId !== 'expansion' ||
      current.parcelId !== 'expansion' ||
      prior.projectId !== completion.projectId ||
      current.projectId !== completion.projectId ||
      prior.facilityId !== completion.facilityId ||
      current.facilityId !== completion.facilityId ||
      prior.name !== completion.name ||
      current.name !== completion.name ||
      prior.completedWeek !== null ||
      prior.dueWeek !== completion.completedWeek ||
      prior.remainingAdvances !== 1 ||
      current.completedWeek !== completion.completedWeek ||
      current.dueWeek !== completion.completedWeek ||
      current.currentWeek !== completion.completedWeek ||
      current.remainingAdvances !== 0 ||
      current.completedAdvances !== current.durationWeeks ||
      current.completedCapacityGain !== 1
    ) return null

    return copyCompletion(completion)
  } catch {
    return null
  }
}

function exactDecisionPayloads(
  result: SimResult,
  reason: LotNextEventStopReason,
): boolean {
  return (
    (reason === 'scriptReview') === (result.scriptDecision !== null) &&
    (reason === 'castingReview') === (result.castingDecision !== null) &&
    (reason === 'productionDecision') === (result.productionDecision !== null)
  )
}

function isExactOperationForCard(
  value: unknown,
  card: ProductionBoardCardView,
): value is ProductionOperationsState {
  if (!isRecord(value)) return false
  const operationKeys = Object.prototype.hasOwnProperty.call(value, 'companyMembers')
    ? OPERATION_COMPANY_KEYS
    : OPERATION_KEYS
  if (!hasExactOwnKeys(value, operationKeys)) return false
  if (
    value.productionId !== card.productionId ||
    value.title !== card.title ||
    value.phase !== 'shooting' ||
    value.phase !== card.phase ||
    value.phaseLabel !== card.phaseLabel ||
    value.weeksRemaining !== card.weeksRemaining ||
    !isNonNegativeSafeInteger(value.weeksRemaining) ||
    !isFiniteNumber(value.progress01) ||
    value.progress01 < 0 ||
    value.progress01 > 1 ||
    (value.locationBuildingId !== 'stage-a' && value.locationBuildingId !== 'stage-b') ||
    value.facilityLabel !== card.currentFacility ||
    value.directorId !== card.director.id ||
    value.directorName !== card.director.name ||
    !isNonEmptyString(value.leadId) ||
    !isNonEmptyString(value.leadName) ||
    value.taskStatus !== card.shootingTaskStatus ||
    value.statusLabel !== card.statusLabel ||
    value.attention !== 'decision-required' ||
    card.command === null ||
    !sameClosedValue(value.currentCommand, card.command)
  ) return false

  if (value.blocker === null || card.blocker === null || !isRecord(value.blocker)) {
    return false
  }
  return hasExactOwnKeys(value.blocker, ['kind', 'headline', 'detail']) &&
    value.blocker.kind === card.blocker.kind &&
    value.blocker.headline === card.blocker.headline &&
    value.blocker.detail === card.blocker.detail
}

function productionTarget(
  state: GameState,
  card: ProductionBoardCardView,
): Extract<LotNextEventWorldTarget, { kind: 'production' }> | null {
  if (!isNonEmptyString(card.productionId) || !isNonEmptyString(card.title)) return null
  const snapshot = studioLotSnapshot(state)
  if (
    snapshot.operationsMode !== 'managed' ||
    snapshot.stageAssignmentAuthority !== 'engine' ||
    !Array.isArray(snapshot.productionOperations)
  ) return null

  const seen = new Set<string>()
  for (const candidate of snapshot.productionOperations as unknown[]) {
    if (!isRecord(candidate) || !isNonEmptyString(candidate.productionId)) return null
    if (seen.has(candidate.productionId)) return null
    seen.add(candidate.productionId)
  }
  const matches = (snapshot.productionOperations as unknown[]).filter(
    (candidate) => isRecord(candidate) && candidate.productionId === card.productionId,
  )
  if (matches.length !== 1 || !isExactOperationForCard(matches[0], card)) return null
  const operation = matches[0]

  // C2a-M2 §3.1's RECORDED SEAM, CLOSED (C2a-M4, WORLD-M2a's carried spec).
  //
  // The stage this picture is on is now READ from the derived stage identities —
  // the same authority the world, the companion rail and the presence layer read —
  // rather than sorted into "Soundstage 7" and "everything else". A body that is
  // not one of THIS studio's soundstages still produces no target at all: that
  // silence was never about the founding two, it was about not naming a place the
  // studio does not have.
  const identity = lotStageIdentityFor(snapshot, operation.locationBuildingId)
  if (identity === null || !isNonEmptyString(identity.facilityName)) return null
  if (operation.locationBuildingId === FOUNDING_STAGE_SEVEN_BUILDING_ID) {
    const stage7 = stage7ProductionDetailContext(snapshot)
    if (stage7 === null || stage7.operation !== operation) return null
    return {
      kind: 'production',
      productionId: card.productionId,
      title: card.title,
      location: 'stage-7',
      buildingId: identity.buildingId,
      stageName: identity.facilityName,
    }
  }
  return {
    kind: 'production',
    productionId: card.productionId,
    title: card.title,
    // Unchanged for every state that could reach it before: the founding
    // Soundstage 12, and now every stage the studio has built beside it. The
    // NAME and the BODY no longer come from this discriminant.
    location: 'stage-12-semantic',
    buildingId: identity.buildingId,
    stageName: identity.facilityName,
  }
}

function exactRunTransition(
  result: SimResult,
  rows: readonly LotNextEventCompletedRun[],
): boolean {
  const endedRuns = result.preTick.theatricalRuns.filter((prior) => {
    if (prior.status !== 'active') return false
    const current = result.next.theatricalRuns.filter(
      (candidate) => candidate.productionId === prior.productionId,
    )
    return current.length === 1 && current[0]!.status !== 'active'
  })
  if (
    endedRuns.length !== rows.length ||
    endedRuns.some((run, index) => run.productionId !== rows[index]?.productionId)
  ) return false

  for (const row of rows) {
    const priorRuns = result.preTick.theatricalRuns.filter(
      (run) => run.productionId === row.productionId,
    )
    const currentRuns = result.next.theatricalRuns.filter(
      (run) => run.productionId === row.productionId,
    )
    const films = result.next.studio.releasedFilms.filter(
      (film) => film.productionId === row.productionId,
    )
    if (priorRuns.length !== 1 || currentRuns.length !== 1 || films.length !== 1) return false
    const prior = priorRuns[0]!
    const current = currentRuns[0]!
    const film = films[0]!
    if (
      prior.status !== 'active' ||
      current.status !== 'completed' ||
      prior.conceptId !== current.conceptId ||
      film.conceptId !== current.conceptId ||
      prior.releaseTick !== current.releaseTick ||
      prior.totalWeeks !== current.totalWeeks ||
      prior.weekIndex !== prior.totalWeeks - 1 ||
      current.weekIndex !== current.totalWeeks ||
      current.releaseTick + current.totalWeeks !== result.toWeek
    ) return false

    const matchingConcepts = result.next.concepts.filter(
      (concept) => concept.id === current.conceptId,
    )
    if (matchingConcepts.length > 1) return false
    const title = findConcept(result.next, current.conceptId)?.title ?? current.conceptId
    if (title !== row.title) return false
  }
  return true
}

/** The legacy Annex parcel id, which the accepted receipt contract keys on verbatim. */
const LEGACY_EXPANSION_BUILDING_ID = 'expansion'

/**
 * WHICH world id the completed facility is (C1-M1b).
 *
 * Read off the placement root itself — the authority that owns the fact — and matched by
 * the completion's own `projectId`, which `constructionCompletionsBetween` copied from
 * that same record. A placement on the LEGACY parcel keeps being named `expansion`
 * exactly as the accepted Annex receipt requires; everything else is named as itself.
 *
 * Null when the placement cannot be identified: a receipt that cannot say what finished
 * is withheld, never pointed at a building that did not (laws 6 / 21).
 */
function completedBuildingId(
  next: GameState,
  completion: ConstructionCompletionSummary,
): BuildingId | null {
  const facilities: unknown = (next as unknown as Record<string, unknown>).placement
  const placements =
    isRecord(facilities) && Array.isArray(facilities.facilities) ? facilities.facilities : null
  if (placements === null) return null
  const matches = placements.filter(
    (placed): placed is Record<string, unknown> =>
      isRecord(placed) && placed.projectId === completion.projectId,
  )
  if (matches.length !== 1) return null
  const only = matches[0]!
  if (only.parcelId === LEGACY_EXPANSION_BUILDING_ID) return LEGACY_EXPANSION_BUILDING_ID
  return isNonNegativeSafeInteger(only.id) ? placedBuildingId(only.id) : null
}

function targetFor(
  result: SimResult,
  rows: LotNextEventCompletedRun[],
  completion: ConstructionCompletionSummary | null,
): LotNextEventWorldTarget | null {
  const reason = result.stopReason as LotNextEventStopReason
  switch (reason) {
    case 'scriptReview': {
      const current = studioDecision(result.next)
      if (
        current?.kind !== 'scriptReview' ||
        result.scriptDecision === null ||
        !sameClosedValue(result.scriptDecision, current.decision) ||
        !isNonEmptyString(current.decision.projectId) ||
        !isNonEmptyString(current.decision.title) ||
        result.next.scriptDevelopment.mode !== 'managed' ||
        result.next.scriptDevelopment.projects.filter(
          (project) => project.id === current.decision.projectId,
        ).length !== 1
      ) return null
      return {
        kind: 'script',
        projectId: current.decision.projectId,
        title: current.decision.title,
        buildingId: 'writers',
      }
    }
    case 'castingReview': {
      const current = studioDecision(result.next)
      if (
        current?.kind !== 'castingReview' ||
        result.castingDecision === null ||
        !sameClosedValue(result.castingDecision, current.decision) ||
        !isNonEmptyString(current.decision.sessionId) ||
        !isNonEmptyString(current.decision.projectId) ||
        !isNonEmptyString(current.decision.title) ||
        result.next.castingSessions.mode !== 'managed' ||
        result.next.castingSessions.sessions.filter(
          (session) =>
            session.id === current.decision.sessionId &&
            session.projectId === current.decision.projectId,
        ).length !== 1 ||
        result.next.castingSessions.sessions.filter(
          (session) => session.id === current.decision.sessionId,
        ).length !== 1 ||
        result.next.scriptDevelopment.mode !== 'managed' ||
        result.next.scriptDevelopment.projects.filter(
          (project) => project.id === current.decision.projectId,
        ).length !== 1
      ) return null
      return {
        kind: 'casting',
        sessionId: current.decision.sessionId,
        projectId: current.decision.projectId,
        title: current.decision.title,
        buildingId: 'casting',
      }
    }
    case 'productionDecision': {
      const current = studioDecision(result.next)
      if (
        current?.kind !== 'productionDecision' ||
        result.productionDecision === null ||
        !sameClosedValue(result.productionDecision, current.decision)
      ) return null
      return productionTarget(result.next, current.decision)
    }
    case 'runCompleted':
      if (studioDecision(result.next) !== null || rows.length === 0 || !exactRunTransition(result, rows)) {
        return null
      }
      return {
        kind: 'run-completed',
        runs: rows.map((row) => ({ ...row })),
        buildingId: 'theater',
      }
    case 'cashNegative':
      if (
        studioDecision(result.next) !== null ||
        !isFiniteNumber(result.preTick.studio.cash) ||
        result.preTick.studio.cash < 0 ||
        result.next.studio.cash >= 0
      ) return null
      return { kind: 'cash', buildingId: 'admin' }
    case 'contractExpired': {
      if (studioDecision(result.next) !== null) return null
      const prior = payrollSummary(result.preTick)
      const current = payrollSummary(result.next)
      if (prior.contractCount <= current.contractCount) return null
      return { kind: 'contracts', change: 'expired', buildingId: null }
    }
    case 'renewalWindow': {
      if (studioDecision(result.next) !== null) return null
      const prior = payrollSummary(result.preTick)
      const current = payrollSummary(result.next)
      if (
        prior.contractCount !== current.contractCount ||
        current.upcomingRenewals <= prior.upcomingRenewals
      ) return null
      return { kind: 'contracts', change: 'renewal', buildingId: null }
    }
    case 'constructionCompleted': {
      if (studioDecision(result.next) !== null || completion === null) return null
      const buildingId = completedBuildingId(result.next, completion)
      if (buildingId === null) return null
      return {
        kind: 'construction',
        projectId: completion.projectId,
        facilityId: completion.facilityId,
        name: completion.name,
        buildingId,
      }
    }
    default:
      return null
  }
}

/** Build one strict, session-only receipt from one already-completed adapter call. */
export function acceptedLotNextEventReceipt(
  renderedBefore: GameState,
  result: SimResult,
): LotNextEventReceipt | null {
  try {
    if (
      renderedBefore === result.next ||
      typeof renderedBefore.seed !== 'string' ||
      renderedBefore.seed !== result.preTick.seed ||
      renderedBefore.seed !== result.next.seed ||
      !isNonNegativeSafeInteger(result.fromWeek) ||
      !isNonNegativeSafeInteger(result.toWeek) ||
      !isNonNegativeSafeInteger(result.weeks) ||
      result.weeks <= 0 ||
      result.fromWeek !== renderedBefore.market.tick ||
      result.toWeek !== result.next.market.tick ||
      result.weeks !== result.toWeek - result.fromWeek ||
      result.preTick.market.tick !== result.toWeek - 1 ||
      result.stopReason === 'release' ||
      result.stopReason === 'limit' ||
      !EXACT_STOP_REASONS.has(result.stopReason as LotNextEventStopReason) ||
      result.guardHit !== false ||
      !Array.isArray(result.released) ||
      !hasCanonicalArrayKeys(result.released) ||
      result.released.length !== 0 ||
      !isNonEmptyString(result.stopMessage) ||
      !isFiniteNumber(result.next.studio.cash)
    ) return null

    const reason = result.stopReason as LotNextEventStopReason
    if (!exactDecisionPayloads(result, reason)) return null

    const rows = completedRuns(result.completedRuns)
    if (
      rows === null ||
      (reason === 'runCompleted' ? rows.length === 0 : rows.length !== 0) ||
      !validSummaryFor(result.summary, result.fromWeek, result.toWeek, result.weeks, rows.length)
    ) return null

    const completion = acceptedLotNextEventConstructionCompletion(renderedBefore, result)
    if (
      (result.constructionCompletion !== null && completion === null) ||
      (reason === 'constructionCompleted' && completion === null)
    ) return null

    const target = targetFor(result, rows, completion)
    if (target === null) return null

    const receipt: LotNextEventReceipt = {
      fromWeek: result.fromWeek,
      toWeek: result.toWeek,
      weeks: result.weeks,
      stopReason: reason,
      stopMessage: result.stopMessage,
      summary: copySummary(result.summary),
      cashNow: result.next.studio.cash,
      completedRuns: rows.map((row) => ({ ...row })),
      constructionCompletion: completion,
      target,
    }
    return isLotNextEventReceipt(receipt) ? receipt : null
  } catch {
    return null
  }
}

function isTarget(value: unknown): value is LotNextEventWorldTarget {
  if (!isRecord(value) || !isNonEmptyString(value.kind)) return false
  switch (value.kind) {
    case 'script':
      return hasExactOwnKeys(value, ['kind', 'projectId', 'title', 'buildingId']) &&
        isNonEmptyString(value.projectId) &&
        isNonEmptyString(value.title) &&
        value.buildingId === 'writers'
    case 'casting':
      return hasExactOwnKeys(value, ['kind', 'sessionId', 'projectId', 'title', 'buildingId']) &&
        isNonEmptyString(value.sessionId) &&
        isNonEmptyString(value.projectId) &&
        isNonEmptyString(value.title) &&
        value.buildingId === 'casting'
    case 'production':
      // C2a-M4: two members added, both required. A receipt minted before this
      // widening carries neither and is rejected as the stale shape it is —
      // which is what a CLOSED receipt is for.
      return hasExactOwnKeys(value, [
        'kind',
        'productionId',
        'title',
        'location',
        'buildingId',
        'stageName',
      ]) &&
        isNonEmptyString(value.productionId) &&
        isNonEmptyString(value.title) &&
        (value.location === 'stage-7' || value.location === 'stage-12-semantic') &&
        isNonEmptyString(value.buildingId) &&
        isNonEmptyString(value.stageName)
    case 'run-completed': {
      if (!hasExactOwnKeys(value, ['kind', 'runs', 'buildingId']) || value.buildingId !== 'theater') {
        return false
      }
      const rows = completedRuns(value.runs)
      return rows !== null && rows.length > 0
    }
    case 'cash':
      return hasExactOwnKeys(value, ['kind', 'buildingId']) && value.buildingId === 'admin'
    case 'contracts':
      return hasExactOwnKeys(value, ['kind', 'change', 'buildingId']) &&
        (value.change === 'expired' || value.change === 'renewal') &&
        value.buildingId === null
    case 'construction':
      return hasExactOwnKeys(value, ['kind', 'projectId', 'facilityId', 'name', 'buildingId']) &&
        isNonEmptyString(value.projectId) &&
        isNonEmptyString(value.facilityId) &&
        isNonEmptyString(value.name) &&
        isNonEmptyString(value.buildingId) &&
        (value.buildingId === LEGACY_EXPANSION_BUILDING_ID ||
          placedFacilityIdOf(value.buildingId) !== null)
    default:
      return false
  }
}

function isLotNextEventReceipt(value: unknown): value is LotNextEventReceipt {
  if (
    !isRecord(value) ||
    !hasExactOwnKeys(value, RECEIPT_KEYS) ||
    !isNonNegativeSafeInteger(value.fromWeek) ||
    !isNonNegativeSafeInteger(value.toWeek) ||
    !isNonNegativeSafeInteger(value.weeks) ||
    value.weeks <= 0 ||
    value.weeks !== value.toWeek - value.fromWeek ||
    typeof value.stopReason !== 'string' ||
    !EXACT_STOP_REASONS.has(value.stopReason as LotNextEventStopReason) ||
    !isNonEmptyString(value.stopMessage) ||
    !isFiniteNumber(value.cashNow) ||
    !isTarget(value.target)
  ) return false

  const rows = completedRuns(value.completedRuns)
  if (
    rows === null ||
    !validSummaryFor(value.summary, value.fromWeek, value.toWeek, value.weeks, rows.length) ||
    (value.constructionCompletion !== null &&
      (!isCompletionShape(value.constructionCompletion) ||
        value.constructionCompletion.completedWeek !== value.toWeek))
  ) return false

  const reason = value.stopReason as LotNextEventStopReason
  const target = value.target
  if (reason === 'scriptReview' && target.kind !== 'script') return false
  if (reason === 'castingReview' && target.kind !== 'casting') return false
  if (reason === 'productionDecision' && target.kind !== 'production') return false
  if (reason === 'runCompleted') {
    if (target.kind !== 'run-completed' || rows.length === 0 || !sameClosedValue(rows, target.runs)) {
      return false
    }
  } else if (rows.length !== 0) return false
  if (reason === 'cashNegative' && target.kind !== 'cash') return false
  if (
    reason === 'contractExpired' &&
    (target.kind !== 'contracts' || target.change !== 'expired')
  ) return false
  if (
    reason === 'renewalWindow' &&
    (target.kind !== 'contracts' || target.change !== 'renewal')
  ) return false
  if (reason === 'constructionCompleted') {
    const completion = value.constructionCompletion
    if (
      target.kind !== 'construction' ||
      completion === null ||
      target.projectId !== completion.projectId ||
      target.facilityId !== completion.facilityId ||
      target.name !== completion.name ||
      completion.completedWeek !== value.toWeek
    ) return false
  } else if (target.kind === 'construction') return false
  return true
}

/** Complete closed-shape comparison; malformed values never compare equal. */
export function sameLotNextEventReceipt(
  left: LotNextEventReceipt,
  right: LotNextEventReceipt,
): boolean {
  try {
    return isLotNextEventReceipt(left) &&
      isLotNextEventReceipt(right) &&
      sameClosedValue(left, right)
  } catch {
    return false
  }
}

/** Complete comparison for the flat Engine-projected command union. */
export function sameLotNextEventProductionCommand(
  left: LotProductionCommand,
  right: LotProductionCommand,
): boolean {
  try {
    return sameClosedValue(left, right)
  } catch {
    return false
  }
}

/**
 * Rebuild the one still-current production command named by an exact receipt.
 * Callers must separately own App-session object identity; this selector proves
 * current decision/card/operation/location truth without trusting cached command copy.
 */
export function currentLotNextEventProductionCommand(
  state: GameState,
  receipt: LotNextEventReceipt,
): LotProductionCommand | null {
  try {
    if (!isLotNextEventReceipt(receipt) || receipt.target.kind !== 'production') return null
    const current = studioDecision(state)
    if (
      current?.kind !== 'productionDecision' ||
      current.decision.productionId !== receipt.target.productionId ||
      current.decision.title !== receipt.target.title ||
      current.decision.command === null
    ) return null
    const target = productionTarget(state, current.decision)
    if (
      target === null ||
      target.productionId !== receipt.target.productionId ||
      target.title !== receipt.target.title ||
      target.location !== receipt.target.location ||
      target.buildingId !== receipt.target.buildingId ||
      target.stageName !== receipt.target.stageName
    ) return null
    return current.decision.command
  } catch {
    return null
  }
}

/**
 * Build the deliberately reduced neutral arm after a valid adapter successor.
 * It never copies a summary, target, completed-run identity, or decision payload.
 */
export function lotNextEventNeutralFeedback(
  renderedBefore: GameState,
  result: SimResult,
): LotNextEventNeutralFeedback | null {
  try {
    const toWeek = result.next.market.tick
    const cashNow = result.next.studio.cash
    if (
      renderedBefore === result.next ||
      typeof renderedBefore.seed !== 'string' ||
      renderedBefore.seed !== result.preTick.seed ||
      renderedBefore.seed !== result.next.seed ||
      !isNonNegativeSafeInteger(renderedBefore.market.tick) ||
      !isNonNegativeSafeInteger(result.fromWeek) ||
      result.fromWeek !== renderedBefore.market.tick ||
      !isNonNegativeSafeInteger(toWeek) ||
      !isNonNegativeSafeInteger(result.toWeek) ||
      result.toWeek !== toWeek ||
      !isNonNegativeSafeInteger(result.weeks) ||
      result.weeks <= 0 ||
      result.weeks !== result.toWeek - result.fromWeek ||
      !isNonNegativeSafeInteger(result.preTick.market.tick) ||
      result.preTick.market.tick !== result.toWeek - 1 ||
      result.stopReason === 'release' ||
      result.stopReason === 'limit' ||
      !EXACT_STOP_REASONS.has(result.stopReason as LotNextEventStopReason) ||
      result.guardHit !== false ||
      !Array.isArray(result.released) ||
      !hasCanonicalArrayKeys(result.released) ||
      result.released.length !== 0 ||
      !isFiniteNumber(cashNow)
    ) return null
    return {
      kind: 'next-event-neutral',
      toWeek,
      cashNow,
      stopMessage: isNonEmptyString(result.stopMessage) ? result.stopMessage : null,
      constructionCompletion: acceptedLotNextEventConstructionCompletion(renderedBefore, result),
    }
  } catch {
    return null
  }
}

/** Validate and build the one deliberate primitive-only 520-week guard result. */
export function acceptedLotNextEventGuardNeutral(
  renderedBefore: GameState,
  result: SimResult,
): LotNextEventNeutralFeedback | null {
  try {
    if (
      result.stopReason !== 'limit' ||
      result.guardHit !== true ||
      result.preTick !== renderedBefore ||
      renderedBefore === result.next ||
      typeof renderedBefore.seed !== 'string' ||
      renderedBefore.seed !== result.next.seed ||
      !isNonNegativeSafeInteger(result.fromWeek) ||
      !isNonNegativeSafeInteger(result.toWeek) ||
      result.fromWeek !== renderedBefore.market.tick ||
      result.toWeek !== result.next.market.tick ||
      result.weeks !== 520 ||
      result.toWeek - result.fromWeek !== 520 ||
      !Array.isArray(result.released) ||
      !hasCanonicalArrayKeys(result.released) ||
      result.released.length !== 0 ||
      !Array.isArray(result.completedRuns) ||
      !hasCanonicalArrayKeys(result.completedRuns) ||
      result.completedRuns.length !== 0 ||
      result.productionDecision !== null ||
      result.scriptDecision !== null ||
      result.castingDecision !== null ||
      result.constructionCompletion !== null ||
      studioDecision(result.next) !== null
    ) return null

    const toWeek = result.next.market.tick
    const cashNow = result.next.studio.cash
    if (!isNonNegativeSafeInteger(toWeek) || !isFiniteNumber(cashNow)) return null
    return {
      kind: 'next-event-neutral',
      toWeek,
      cashNow,
      stopMessage: isNonEmptyString(result.stopMessage) ? result.stopMessage : null,
      constructionCompletion: null,
    }
  } catch {
    return null
  }
}
