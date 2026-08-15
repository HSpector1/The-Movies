import {
  scriptProjectsBoard,
  studioDecision,
  studioLotSnapshot,
} from '../../engine/adapter.ts'
import type {
  CreativeRole,
  GameState,
  ScriptProjectActionView,
  ScriptProjectsReadModel,
} from '../../engine/adapter.ts'
import { operationalAnnexWorkContext } from './annexWork.ts'

export type LotScriptReviewTarget = {
  projectId: string
  title: string
}

export type LotScriptReviewAction = Extract<
  ScriptProjectActionView,
  { kind: 'acceptScript' | 'requestScriptRewrite' }
>

export type LotScriptReviewBlocker =
  ScriptProjectsReadModel['sections']['needsReview'][number]['blockers'][number]

type LotScriptReviewCapacity = ScriptProjectsReadModel['capacity']

export type LotScriptReviewContext = {
  kind: 'script-review'
  projectId: string
  title: string
  writer: {
    id: string
    name: string
    primaryRole: CreativeRole
  }
  reviewState: 'first-draft' | 'final-draft'
  assessment: {
    label: 'Est.'
    score: number
    band: 'Fragile' | 'Workable' | 'Promising' | 'Strong'
    strengths: string[]
    concerns: string[]
  }
  consequence: string
  blockers: LotScriptReviewBlocker[]
  legalActions: LotScriptReviewAction[]
}

export type LotScriptReviewSuccess =
  | {
      kind: 'accepted'
      projectId: string
      title: string
      writerName: string
      statusLabel: 'Ready to package'
    }
  | {
      kind: 'rewrite'
      projectId: string
      title: string
      writerName: string
      dueWeek: number
      facilityId: string
      facilityName: string
      slot: number
    }

const BOARD_KEYS = [
  'mode',
  'capacity',
  'sections',
  'commission',
  'packages',
  'nextDecision',
  'lotAttention',
] as const

const SECTION_KEYS = [
  'needsReview',
  'inDevelopment',
  'readyToPackage',
  'productionHistory',
] as const

const CARD_KEYS = [
  'projectId',
  'section',
  'title',
  'genre',
  'writer',
  'status',
  'lifecycleLabel',
  'rewriteCount',
  'dueWeek',
  'weeksUntilDecision',
  'productionId',
  'consequence',
  'assessment',
  'legalActions',
  'blockers',
] as const

const WRITER_KEYS = ['id', 'name', 'primaryRole'] as const
const ASSESSMENT_KEYS = ['label', 'score', 'band', 'strengths', 'concerns'] as const
const BLOCKER_KEYS = ['kind', 'headline', 'detail', 'remedy'] as const
const ACTION_KEYS = ['kind', 'projectId', 'label'] as const
const DECISION_WRAPPER_KEYS = ['kind', 'decision'] as const
const DECISION_KEYS = ['kind', 'projectId', 'title', 'legalActions'] as const
const TARGET_KEYS = ['projectId', 'title'] as const
const CONTEXT_KEYS = [
  'kind',
  'projectId',
  'title',
  'writer',
  'reviewState',
  'assessment',
  'consequence',
  'blockers',
  'legalActions',
] as const
const CAPACITY_KEYS = ['capacity', 'occupied', 'available', 'facilities'] as const
const CAPACITY_FACILITY_KEYS = [
  'facilityId',
  'facilityName',
  'capacity',
  'occupied',
  'available',
  'slots',
] as const
const CAPACITY_SLOT_KEYS = ['slot', 'occupant'] as const
const CAPACITY_OCCUPANT_KEYS = [
  'owner',
  'ownerId',
  'activity',
  'title',
  'label',
] as const

const BASE_DEVELOPMENT_FACILITY_ID = 'facility-development-casting'
const BASE_DEVELOPMENT_FACILITY_NAME = 'Development & Casting'
const ANNEX_DEVELOPMENT_FACILITY_ID = 'facility-development-casting-annex'
const ANNEX_DEVELOPMENT_FACILITY_NAME = 'Development & Casting Annex'

const GENRES = new Set([
  'comedy',
  'drama',
  'crime',
  'romance',
  'horror',
  'adventure',
])

const CREATIVE_ROLES = new Set<CreativeRole>([
  'writer',
  'director',
  'actor',
  'craft',
])

const ASSESSMENT_BANDS = new Set([
  'Fragile',
  'Workable',
  'Promising',
  'Strong',
])

const BLOCKER_KINDS = new Set([
  'script-mode',
  'operations-mode',
  'studio-founding',
  'facility-capacity',
  'writer-contract',
  'writer-assignment',
  'production-capacity',
  'package-staffing',
  'casting-session',
  'no-concepts',
  'no-writers',
])

const CARD_STATUSES = new Set([
  'drafting',
  'review',
  'rewriting',
  'ready',
  'inProduction',
  'produced',
])

const ALL_ACTION_KINDS = new Set([
  'acceptScript',
  'requestScriptRewrite',
  'planAuditions',
  'openPackage',
])

function isPlainRecord(value: unknown): value is Record<PropertyKey, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false
  const prototype = Object.getPrototypeOf(value)
  return prototype === Object.prototype || prototype === null
}

function hasExactOwnKeys(
  value: Record<PropertyKey, unknown>,
  expected: readonly string[],
): boolean {
  const actual = Reflect.ownKeys(value)
  return actual.length === expected.length &&
    expected.every((key) => Object.prototype.hasOwnProperty.call(value, key))
}

function hasCanonicalArrayKeys(value: readonly unknown[]): boolean {
  const keys = Reflect.ownKeys(value)
  if (keys.length !== value.length + 1 || !keys.includes('length')) return false
  for (let index = 0; index < value.length; index += 1) {
    if (!Object.prototype.hasOwnProperty.call(value, String(index))) return false
  }
  return true
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isNullableNonEmptyString(value: unknown): value is string | null {
  return value === null || isNonEmptyString(value)
}

function isNullableNonNegativeSafeInteger(value: unknown): value is number | null {
  return value === null || (Number.isSafeInteger(value) && (value as number) >= 0)
}

function isNonNegativeSafeInteger(value: unknown): value is number {
  return Number.isSafeInteger(value) && (value as number) >= 0
}

function isCanonicalStringArray(value: unknown): value is string[] {
  if (!Array.isArray(value) || !hasCanonicalArrayKeys(value)) return false
  for (const entry of value as unknown[]) {
    if (!isNonEmptyString(entry)) return false
  }
  return true
}

function isWriter(value: unknown): value is LotScriptReviewContext['writer'] {
  return isPlainRecord(value) &&
    hasExactOwnKeys(value, WRITER_KEYS) &&
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.name) &&
    typeof value.primaryRole === 'string' &&
    CREATIVE_ROLES.has(value.primaryRole as CreativeRole)
}

function isAssessment(value: unknown): value is LotScriptReviewContext['assessment'] {
  return isPlainRecord(value) &&
    hasExactOwnKeys(value, ASSESSMENT_KEYS) &&
    value.label === 'Est.' &&
    typeof value.score === 'number' &&
    Number.isFinite(value.score) &&
    typeof value.band === 'string' &&
    ASSESSMENT_BANDS.has(value.band) &&
    isCanonicalStringArray(value.strengths) &&
    isCanonicalStringArray(value.concerns)
}

function isBlocker(value: unknown): value is LotScriptReviewBlocker {
  return isPlainRecord(value) &&
    hasExactOwnKeys(value, BLOCKER_KEYS) &&
    typeof value.kind === 'string' &&
    BLOCKER_KINDS.has(value.kind) &&
    isNonEmptyString(value.headline) &&
    isNonEmptyString(value.detail) &&
    isNonEmptyString(value.remedy)
}

function blockers(value: unknown): LotScriptReviewBlocker[] | null {
  if (!Array.isArray(value) || !hasCanonicalArrayKeys(value)) return null
  const result: LotScriptReviewBlocker[] = []
  for (const candidate of value as unknown[]) {
    if (!isBlocker(candidate)) return null
    result.push({
      kind: candidate.kind,
      headline: candidate.headline,
      detail: candidate.detail,
      remedy: candidate.remedy,
    })
  }
  return result
}

function strictCapacityProjection(value: unknown): LotScriptReviewCapacity | null {
  if (
    !isPlainRecord(value) ||
    !hasExactOwnKeys(value, CAPACITY_KEYS) ||
    !isNonNegativeSafeInteger(value.capacity) ||
    !isNonNegativeSafeInteger(value.occupied) ||
    !isNonNegativeSafeInteger(value.available) ||
    !Array.isArray(value.facilities) ||
    !hasCanonicalArrayKeys(value.facilities)
  ) return null

  const facilityIds = new Set<string>()
  let totalCapacity = 0
  let totalOccupied = 0
  for (const facility of value.facilities as unknown[]) {
    if (
      !isPlainRecord(facility) ||
      !hasExactOwnKeys(facility, CAPACITY_FACILITY_KEYS) ||
      !isNonEmptyString(facility.facilityId) ||
      facilityIds.has(facility.facilityId) ||
      !isNonEmptyString(facility.facilityName) ||
      !isNonNegativeSafeInteger(facility.capacity) ||
      !isNonNegativeSafeInteger(facility.occupied) ||
      !isNonNegativeSafeInteger(facility.available) ||
      facility.available !== facility.capacity - facility.occupied ||
      !Array.isArray(facility.slots) ||
      !hasCanonicalArrayKeys(facility.slots) ||
      facility.slots.length !== facility.capacity
    ) return null
    facilityIds.add(facility.facilityId)

    let occupied = 0
    for (let index = 0; index < facility.slots.length; index += 1) {
      const slot = facility.slots[index] as unknown
      if (
        !isPlainRecord(slot) ||
        !hasExactOwnKeys(slot, CAPACITY_SLOT_KEYS) ||
        slot.slot !== index
      ) return null
      if (slot.occupant === null) continue
      occupied += 1
      const occupant = slot.occupant
      if (
        !isPlainRecord(occupant) ||
        !hasExactOwnKeys(occupant, CAPACITY_OCCUPANT_KEYS) ||
        (occupant.owner !== 'production' &&
          occupant.owner !== 'script' &&
          occupant.owner !== 'casting') ||
        !isNonEmptyString(occupant.ownerId) ||
        (occupant.activity !== 'development' &&
          occupant.activity !== 'preProduction' &&
          occupant.activity !== 'drafting' &&
          occupant.activity !== 'rewriting' &&
          occupant.activity !== 'auditioning') ||
        !isNonEmptyString(occupant.title) ||
        !isNonEmptyString(occupant.label)
      ) return null
    }
    if (occupied !== facility.occupied) return null
    totalCapacity += facility.capacity
    totalOccupied += occupied
  }
  if (
    totalCapacity !== value.capacity ||
    totalOccupied !== value.occupied ||
    value.available !== value.capacity - value.occupied
  ) return null
  return value as unknown as LotScriptReviewCapacity
}

function sameCapacityProjection(
  left: LotScriptReviewCapacity,
  right: LotScriptReviewCapacity,
): boolean {
  if (
    left.capacity !== right.capacity ||
    left.occupied !== right.occupied ||
    left.available !== right.available ||
    left.facilities.length !== right.facilities.length
  ) return false
  return left.facilities.every((facility, facilityIndex) => {
    const candidate = right.facilities[facilityIndex]
    if (
      candidate === undefined ||
      facility.facilityId !== candidate.facilityId ||
      facility.facilityName !== candidate.facilityName ||
      facility.capacity !== candidate.capacity ||
      facility.occupied !== candidate.occupied ||
      facility.available !== candidate.available ||
      facility.slots.length !== candidate.slots.length
    ) return false
    return facility.slots.every((slot, slotIndex) => {
      const other = candidate.slots[slotIndex]
      if (other === undefined || slot.slot !== other.slot) return false
      if (slot.occupant === null || other.occupant === null) {
        return slot.occupant === other.occupant
      }
      return slot.occupant.owner === other.occupant.owner &&
        slot.occupant.ownerId === other.occupant.ownerId &&
        slot.occupant.activity === other.occupant.activity &&
        slot.occupant.title === other.occupant.title &&
        slot.occupant.label === other.occupant.label
    })
  })
}

function isAnyProjectAction(value: unknown, projectId: string): boolean {
  return isPlainRecord(value) &&
    hasExactOwnKeys(value, ACTION_KEYS) &&
    typeof value.kind === 'string' &&
    ALL_ACTION_KINDS.has(value.kind) &&
    isNonEmptyString(value.projectId) &&
    value.projectId === projectId &&
    isNonEmptyString(value.label)
}

function isReviewAction(value: unknown, projectId: string): value is LotScriptReviewAction {
  return isAnyProjectAction(value, projectId) &&
    isPlainRecord(value) &&
    (value.kind === 'acceptScript' || value.kind === 'requestScriptRewrite')
}

function reviewActions(value: unknown, projectId: string): LotScriptReviewAction[] | null {
  if (!Array.isArray(value) || !hasCanonicalArrayKeys(value)) return null
  if (value.length < 1 || value.length > 2) return null

  const result: LotScriptReviewAction[] = []
  for (const candidate of value as unknown[]) {
    if (!isReviewAction(candidate, projectId)) return null
    result.push({
      kind: candidate.kind,
      projectId: candidate.projectId,
      label: candidate.label,
    })
  }

  // Core order is part of the action token: Accept is always first and a legal
  // final rewrite, when present, is second. Never sort or choose a winner here.
  if (result[0]!.kind !== 'acceptScript') return null
  if (result.length === 2 && result[1]!.kind !== 'requestScriptRewrite') return null
  return result
}

function sameActionArray(
  left: readonly LotScriptReviewAction[],
  right: readonly LotScriptReviewAction[],
): boolean {
  return left.length === right.length && left.every(
    (action, index) => sameLotScriptReviewAction(action, right[index] ?? null),
  )
}

function isGenericCardEnvelope(value: unknown, section: string): value is Record<PropertyKey, unknown> {
  if (
    !isPlainRecord(value) ||
    !hasExactOwnKeys(value, CARD_KEYS) ||
    !isNonEmptyString(value.projectId) ||
    !isNonEmptyString(value.title) ||
    value.section !== section ||
    typeof value.genre !== 'string' ||
    !GENRES.has(value.genre) ||
    !isWriter(value.writer) ||
    typeof value.status !== 'string' ||
    !CARD_STATUSES.has(value.status) ||
    !isNonEmptyString(value.lifecycleLabel) ||
    (value.rewriteCount !== 0 && value.rewriteCount !== 1) ||
    !isNullableNonNegativeSafeInteger(value.dueWeek) ||
    !isNullableNonNegativeSafeInteger(value.weeksUntilDecision) ||
    !isNullableNonEmptyString(value.productionId) ||
    !isNonEmptyString(value.consequence) ||
    (value.assessment !== null && !isAssessment(value.assessment)) ||
    !Array.isArray(value.legalActions) ||
    !hasCanonicalArrayKeys(value.legalActions) ||
    !Array.isArray(value.blockers) ||
    !hasCanonicalArrayKeys(value.blockers)
  ) return false

  const actionKinds = new Set<string>()
  for (const action of value.legalActions as unknown[]) {
    if (
      !isAnyProjectAction(action, value.projectId) ||
      !isPlainRecord(action) ||
      typeof action.kind !== 'string' ||
      actionKinds.has(action.kind)
    ) return false
    actionKinds.add(action.kind)
  }
  return blockers(value.blockers) !== null
}

function reviewDecision(value: unknown): {
  projectId: string
  title: string
  legalActions: LotScriptReviewAction[]
} | null {
  if (
    !isPlainRecord(value) ||
    !hasExactOwnKeys(value, DECISION_KEYS) ||
    value.kind !== 'scriptReview' ||
    !isNonEmptyString(value.projectId) ||
    !isNonEmptyString(value.title)
  ) return null
  const actions = reviewActions(value.legalActions, value.projectId)
  if (actions === null) return null
  return {
    projectId: value.projectId,
    title: value.title,
    legalActions: actions,
  }
}

function sameDecision(
  left: { projectId: string; title: string; legalActions: LotScriptReviewAction[] },
  right: { projectId: string; title: string; legalActions: LotScriptReviewAction[] },
): boolean {
  return left.projectId === right.projectId &&
    left.title === right.title &&
    sameActionArray(left.legalActions, right.legalActions)
}

function isTarget(value: unknown): value is LotScriptReviewTarget {
  return isPlainRecord(value) &&
    hasExactOwnKeys(value, TARGET_KEYS) &&
    isNonEmptyString(value.projectId) &&
    isNonEmptyString(value.title)
}

function contextIsClosed(value: unknown): value is LotScriptReviewContext {
  if (
    !isPlainRecord(value) ||
    !hasExactOwnKeys(value, CONTEXT_KEYS) ||
    value.kind !== 'script-review' ||
    !isNonEmptyString(value.projectId) ||
    !isNonEmptyString(value.title) ||
    !isWriter(value.writer) ||
    (value.reviewState !== 'first-draft' && value.reviewState !== 'final-draft') ||
    !isAssessment(value.assessment) ||
    !isNonEmptyString(value.consequence)
  ) return false

  const copiedBlockers = blockers(value.blockers)
  const copiedActions = reviewActions(value.legalActions, value.projectId)
  return copiedBlockers !== null && copiedActions !== null
}

/**
 * Rebuild the one exact, player-safe screenplay review from current Engine truth.
 *
 * This validates the adapter's closed read models; it never inspects raw screenplay
 * state, infers rewrite legality, repairs ordering, chooses among identities, or
 * mutates the supplied GameState. Any malformed or ambiguous projection fails
 * neutrally.
 */
export function currentLotScriptReviewContext(
  state: GameState,
  target?: LotScriptReviewTarget,
): LotScriptReviewContext | null {
  try {
    if (target !== undefined && !isTarget(target)) return null

    const current = studioDecision(state) as unknown
    if (
      !isPlainRecord(current) ||
      !hasExactOwnKeys(current, DECISION_WRAPPER_KEYS) ||
      current.kind !== 'scriptReview'
    ) return null
    const currentDecision = reviewDecision(current.decision)
    if (currentDecision === null) return null

    const projected = scriptProjectsBoard(state) as unknown
    if (
      !isPlainRecord(projected) ||
      !hasExactOwnKeys(projected, BOARD_KEYS) ||
      projected.mode !== 'managed' ||
      !isPlainRecord(projected.sections) ||
      !hasExactOwnKeys(projected.sections, SECTION_KEYS)
    ) return null

    const boardDecision = reviewDecision(projected.nextDecision)
    if (boardDecision === null || !sameDecision(currentDecision, boardDecision)) return null

    let selected: Record<PropertyKey, unknown> | null = null
    const identities = new Set<string>()
    for (const section of SECTION_KEYS) {
      const sectionCards = projected.sections[section]
      if (!Array.isArray(sectionCards) || !hasCanonicalArrayKeys(sectionCards)) return null
      for (const candidate of sectionCards as unknown[]) {
        if (!isGenericCardEnvelope(candidate, section)) return null
        if (identities.has(candidate.projectId as string)) return null
        identities.add(candidate.projectId as string)
        if (section === 'needsReview' && candidate.projectId === currentDecision.projectId) {
          if (selected !== null) return null
          selected = candidate
        }
      }
    }

    if (
      selected === null ||
      selected.projectId !== currentDecision.projectId ||
      selected.title !== currentDecision.title ||
      selected.section !== 'needsReview' ||
      selected.status !== 'review' ||
      selected.lifecycleLabel !== 'Needs review' ||
      (selected.rewriteCount !== 0 && selected.rewriteCount !== 1) ||
      selected.dueWeek !== null ||
      selected.weeksUntilDecision !== null ||
      selected.productionId !== null ||
      !isWriter(selected.writer) ||
      !isAssessment(selected.assessment)
    ) return null

    const selectedActions = reviewActions(selected.legalActions, currentDecision.projectId)
    const selectedBlockers = blockers(selected.blockers)
    if (
      selectedActions === null ||
      selectedBlockers === null ||
      !sameActionArray(selectedActions, currentDecision.legalActions)
    ) return null

    if (
      target !== undefined &&
      (target.projectId !== currentDecision.projectId || target.title !== currentDecision.title)
    ) return null

    return {
      kind: 'script-review',
      projectId: currentDecision.projectId,
      title: currentDecision.title,
      writer: {
        id: selected.writer.id,
        name: selected.writer.name,
        primaryRole: selected.writer.primaryRole,
      },
      reviewState: selected.rewriteCount === 0 ? 'first-draft' : 'final-draft',
      assessment: {
        label: 'Est.',
        score: selected.assessment.score,
        band: selected.assessment.band,
        strengths: [...selected.assessment.strengths],
        concerns: [...selected.assessment.concerns],
      },
      consequence: selected.consequence as string,
      blockers: selectedBlockers,
      legalActions: selectedActions,
    }
  } catch {
    return null
  }
}

/**
 * Prove the narrow successor copy shown after an App-accepted Lot action.
 * A failed presentation proof never rejects or rolls back the Engine successor;
 * callers fall back to neutral success copy instead.
 */
export function acceptedLotScriptReviewSuccess(
  rendered: LotScriptReviewContext,
  action: LotScriptReviewAction,
  before: GameState,
  next: GameState,
): LotScriptReviewSuccess | null {
  try {
    if (!contextIsClosed(rendered) || !sameLotScriptReviewAction(action, action)) return null
    const priorContext = currentLotScriptReviewContext(before, {
      projectId: rendered.projectId,
      title: rendered.title,
    })
    if (
      priorContext === null ||
      !sameLotScriptReviewContext(rendered, priorContext) ||
      before.market.tick !== next.market.tick ||
      before.studio.cash !== next.studio.cash ||
      before.rngState !== next.rngState
    ) return null
    const ownedActions = rendered.legalActions.filter(
      (candidate) => candidate.kind === action.kind,
    )
    if (
      ownedActions.length !== 1 ||
      !sameLotScriptReviewAction(ownedActions[0]!, action)
    ) return null

    const priorProjected = scriptProjectsBoard(before) as unknown
    const projected = scriptProjectsBoard(next) as unknown
    if (
      !isPlainRecord(priorProjected) ||
      !hasExactOwnKeys(priorProjected, BOARD_KEYS) ||
      priorProjected.mode !== 'managed' ||
      !isPlainRecord(projected) ||
      !hasExactOwnKeys(projected, BOARD_KEYS) ||
      projected.mode !== 'managed' ||
      !isPlainRecord(projected.sections) ||
      !hasExactOwnKeys(projected.sections, SECTION_KEYS)
    ) return null
    const priorCapacity = strictCapacityProjection(priorProjected.capacity)
    const capacity = strictCapacityProjection(projected.capacity)
    if (priorCapacity === null || capacity === null) return null

    let successor: Record<PropertyKey, unknown> | null = null
    const identities = new Set<string>()
    for (const section of SECTION_KEYS) {
      const cards = projected.sections[section]
      if (!Array.isArray(cards) || !hasCanonicalArrayKeys(cards)) return null
      for (const candidate of cards as unknown[]) {
        if (!isGenericCardEnvelope(candidate, section)) return null
        const projectId = candidate.projectId as string
        if (identities.has(projectId)) return null
        identities.add(projectId)
        if (projectId === rendered.projectId) successor = candidate
      }
    }

    if (
      successor === null ||
      successor.projectId !== rendered.projectId ||
      successor.title !== rendered.title ||
      !isWriter(successor.writer) ||
      successor.writer.id !== rendered.writer.id ||
      successor.writer.name !== rendered.writer.name ||
      successor.writer.primaryRole !== rendered.writer.primaryRole ||
      !isAssessment(successor.assessment) ||
      successor.assessment.label !== rendered.assessment.label ||
      successor.assessment.score !== rendered.assessment.score ||
      successor.assessment.band !== rendered.assessment.band ||
      !sameStringArray(successor.assessment.strengths, rendered.assessment.strengths) ||
      !sameStringArray(successor.assessment.concerns, rendered.assessment.concerns)
    ) return null

    if (action.kind === 'acceptScript') {
      if (
        successor.section !== 'readyToPackage' ||
        successor.status !== 'ready' ||
        successor.lifecycleLabel !== 'Ready to package' ||
        successor.rewriteCount !== (rendered.reviewState === 'first-draft' ? 0 : 1) ||
        successor.dueWeek !== null ||
        successor.weeksUntilDecision !== null ||
        successor.productionId !== null ||
        !sameCapacityProjection(priorCapacity, capacity)
      ) return null
      return {
        kind: 'accepted',
        projectId: rendered.projectId,
        title: rendered.title,
        writerName: rendered.writer.name,
        statusLabel: 'Ready to package',
      }
    }

    if (
      successor.section !== 'inDevelopment' ||
      successor.status !== 'rewriting' ||
      successor.rewriteCount !== 1 ||
      !isNonNegativeSafeInteger(successor.dueWeek) ||
      !isNonNegativeSafeInteger(successor.weeksUntilDecision) ||
      successor.weeksUntilDecision !== 1 ||
      successor.productionId !== null
    ) return null

    const matches: Array<{
      facilityId: string
      facilityName: string
      slot: number
    }> = []
    for (const facility of capacity.facilities) {
      for (let index = 0; index < facility.slots.length; index += 1) {
        const slot = facility.slots[index]!
        if (slot.occupant === null) continue
        const occupant = slot.occupant
        if (occupant.owner === 'script' && occupant.ownerId === rendered.projectId) {
          if (occupant.activity !== 'rewriting' || occupant.title !== rendered.title) return null
          matches.push({
            facilityId: facility.facilityId,
            facilityName: facility.facilityName,
            slot: index,
          })
        }
      }
    }
    if (matches.length !== 1) return null
    const match = matches[0]!
    if (
      match.facilityId === BASE_DEVELOPMENT_FACILITY_ID
        ? match.facilityName !== BASE_DEVELOPMENT_FACILITY_NAME
        : match.facilityId === ANNEX_DEVELOPMENT_FACILITY_ID
          ? match.facilityName !== ANNEX_DEVELOPMENT_FACILITY_NAME || match.slot !== 0
          : true
    ) return null
    if (match.facilityId === ANNEX_DEVELOPMENT_FACILITY_ID) {
      const annex = operationalAnnexWorkContext(studioLotSnapshot(next))
      if (
        annex?.state !== 'working' ||
        annex.ownerIntent?.owner !== 'script' ||
        annex.ownerIntent.ownerId !== rendered.projectId ||
        annex.occupant?.owner !== 'script' ||
        annex.occupant.ownerId !== rendered.projectId ||
        annex.occupant.activity !== 'rewriting' ||
        annex.occupant.title !== rendered.title ||
        annex.annexWork.facilityId !== match.facilityId ||
        annex.annexWork.facilityName !== match.facilityName ||
        annex.annexWork.slot !== match.slot
      ) return null
    }

    return {
      kind: 'rewrite',
      projectId: rendered.projectId,
      title: rendered.title,
      writerName: rendered.writer.name,
      dueWeek: successor.dueWeek,
      facilityId: match.facilityId,
      facilityName: match.facilityName,
      slot: match.slot,
    }
  } catch {
    return null
  }
}

function sameStringArray(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length && left.every((entry, index) => entry === right[index])
}

/** Closed-field comparison for one rendered action token. */
export function sameLotScriptReviewAction(
  left: LotScriptReviewAction | null,
  right: LotScriptReviewAction | null,
): boolean {
  try {
    if (left === null || right === null) return left === right
    if (!isPlainRecord(left) || !isPlainRecord(right)) return false
    if (!hasExactOwnKeys(left, ACTION_KEYS) || !hasExactOwnKeys(right, ACTION_KEYS)) return false
    if (!isReviewAction(left, left.projectId) || !isReviewAction(right, right.projectId)) {
      return false
    }
    return left.kind === right.kind &&
      left.projectId === right.projectId &&
      left.label === right.label
  } catch {
    return false
  }
}

/** Closed-field comparison for stale-state/deep-return revalidation. */
export function sameLotScriptReviewContext(
  left: LotScriptReviewContext | null,
  right: LotScriptReviewContext | null,
): boolean {
  try {
    if (left === null || right === null) return left === right
    if (!contextIsClosed(left) || !contextIsClosed(right)) return false
    return left.kind === right.kind &&
      left.projectId === right.projectId &&
      left.title === right.title &&
      left.writer.id === right.writer.id &&
      left.writer.name === right.writer.name &&
      left.writer.primaryRole === right.writer.primaryRole &&
      left.reviewState === right.reviewState &&
      left.assessment.label === right.assessment.label &&
      left.assessment.score === right.assessment.score &&
      left.assessment.band === right.assessment.band &&
      left.assessment.strengths.length === right.assessment.strengths.length &&
      left.assessment.strengths.every(
        (entry, index) => entry === right.assessment.strengths[index],
      ) &&
      left.assessment.concerns.length === right.assessment.concerns.length &&
      left.assessment.concerns.every(
        (entry, index) => entry === right.assessment.concerns[index],
      ) &&
      left.consequence === right.consequence &&
      left.blockers.length === right.blockers.length &&
      left.blockers.every((blocker, index) => {
        const other = right.blockers[index]
        return other !== undefined &&
          blocker.kind === other.kind &&
          blocker.headline === other.headline &&
          blocker.detail === other.detail &&
          blocker.remedy === other.remedy
      }) &&
      sameActionArray(left.legalActions, right.legalActions)
  } catch {
    return false
  }
}
