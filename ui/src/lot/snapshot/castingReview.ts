import {
  castingSessionsBoard,
  studioDecision,
} from '../../engine/adapter.ts'
import type {
  CastSlot,
  CastingCandidateView,
  CastingProjectView,
  CastingSessionsReadModel,
  CreativeRole,
  GameState,
  Genre,
} from '../../engine/adapter.ts'

export type LotCastingReviewTarget = {
  sessionId: string
  projectId: string
  title: string
}

export type LotCastingReviewAction = Extract<
  CastingProjectView['legalActions'][number],
  { kind: 'acknowledgeCastingSession' }
>

export type LotCastingReviewBlocker = NonNullable<
  CastingProjectView['packageAvailability']
>['blockers'][number]

export type LotCastingReviewPackageAvailability = {
  knownGatesClear: boolean
  writerAvailable: boolean
  staffingAvailable: boolean
  productionSlotAvailable: boolean
  developmentCastingSlotAvailable: boolean
  blockers: LotCastingReviewBlocker[]
}

export type LotCastingReviewEvidence = {
  talentId: string
  name: string
  label: 'Est.'
  estimate: number
  low: number
  high: number
  fit: { label: 'Fit'; score: number }
  available: boolean
  availabilityLabel: string
  strengths: string[]
  concerns: string[]
}

export type LotCastingReviewRole = {
  slot: CastSlot
  label: 'Lead' | 'Antagonist' | 'Support'
  evidence: [LotCastingReviewEvidence, LotCastingReviewEvidence]
}

export type LotCastingReviewContext = {
  kind: 'casting-review'
  sessionId: string
  projectId: string
  title: string
  genre: Genre
  writer: {
    id: string
    name: string
    primaryRole: CreativeRole
  }
  consequence: string
  roles: [LotCastingReviewRole, LotCastingReviewRole, LotCastingReviewRole]
  packageAvailability: LotCastingReviewPackageAvailability
  blockers: string[]
  action: LotCastingReviewAction
}

export type LotCastingReviewSuccess = {
  kind: 'blocked' | 'clear'
  sessionId: string
  projectId: string
  title: string
  writerName: string
  statusLabel: 'Casting review complete'
  blockers: LotCastingReviewBlocker[]
  openPackageAction: Extract<
    CastingProjectView['legalActions'][number],
    { kind: 'openPackage' }
  > | null
}

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
const EVIDENCE_KEYS = [
  'talentId',
  'name',
  'label',
  'estimate',
  'low',
  'high',
  'fit',
  'available',
  'availabilityLabel',
  'strengths',
  'concerns',
] as const
const FIT_KEYS = ['label', 'score'] as const
const PACKAGE_KEYS = [
  'knownGatesClear',
  'writerAvailable',
  'staffingAvailable',
  'productionSlotAvailable',
  'developmentCastingSlotAvailable',
  'blockers',
] as const
const BLOCKER_KEYS = ['kind', 'headline', 'detail', 'remedy'] as const
const ACKNOWLEDGE_ACTION_KEYS = [
  'kind',
  'sessionId',
  'projectId',
  'label',
  'opensPackage',
] as const
const SIMPLE_ACTION_KEYS = ['kind', 'projectId', 'label'] as const
const DECISION_WRAPPER_KEYS = ['kind', 'decision'] as const
const DECISION_KEYS = ['kind', 'sessionId', 'projectId', 'title'] as const
const TARGET_KEYS = ['sessionId', 'projectId', 'title'] as const
const ROLE_KEYS = ['slot', 'label', 'evidence'] as const
const CONTEXT_KEYS = [
  'kind',
  'sessionId',
  'projectId',
  'title',
  'genre',
  'writer',
  'consequence',
  'roles',
  'packageAvailability',
  'blockers',
  'action',
] as const

const REVIEW_CONSEQUENCE =
  'Review is immediate and always legal; results remain advisory and select no winner.'
const COMPLETE_CONSEQUENCE =
  'Historical audition evidence persists; current package legality still controls casting.'
const CASTING_RESULT_HALF_WIDTH = 6

const GENRES = new Set<Genre>([
  'comedy',
  'drama',
  'crime',
  'romance',
  'horror',
  'adventure',
])
const CREATIVE_ROLES = new Set<CreativeRole>(['writer', 'director', 'actor', 'craft'])
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
const PACKAGE_BLOCKER_KINDS = new Set<LotCastingReviewBlocker['kind']>([
  'studio-founding',
  'facility-capacity',
  'writer-contract',
  'writer-assignment',
  'production-capacity',
  'package-staffing',
])
const CARD_STATUSES = new Set(['notStarted', 'auditioning', 'review', 'complete'])

const ROLE_ORDER: ReadonlyArray<{
  slot: CastSlot
  label: LotCastingReviewRole['label']
}> = [
  { slot: 'lead', label: 'Lead' },
  { slot: 'antagonist', label: 'Antagonist' },
  { slot: 'support', label: 'Support' },
]

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

function isNonNegativeSafeInteger(value: unknown): value is number {
  return Number.isSafeInteger(value) && (value as number) >= 0
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function isGenre(value: unknown): value is Genre {
  return typeof value === 'string' && GENRES.has(value as Genre)
}

function isCreativeRole(value: unknown): value is CreativeRole {
  return typeof value === 'string' && CREATIVE_ROLES.has(value as CreativeRole)
}

function sameClosedValue(left: unknown, right: unknown): boolean {
  if (Object.is(left, right)) return true
  if (Array.isArray(left) || Array.isArray(right)) {
    if (!Array.isArray(left) || !Array.isArray(right)) return false
    if (!hasCanonicalArrayKeys(left) || !hasCanonicalArrayKeys(right)) return false
    if (left.length !== right.length) return false
    return left.every((entry, index) => sameClosedValue(entry, right[index]))
  }
  if (!isPlainRecord(left) || !isPlainRecord(right)) return false
  const leftKeys = Reflect.ownKeys(left)
  const rightKeys = Reflect.ownKeys(right)
  return leftKeys.length === rightKeys.length &&
    leftKeys.every(
      (key) =>
        Object.prototype.hasOwnProperty.call(right, key) &&
        sameClosedValue(left[key], right[key]),
    )
}

function strings(value: unknown): string[] | null {
  if (!Array.isArray(value) || !hasCanonicalArrayKeys(value)) return null
  const copied: string[] = []
  for (const entry of value as unknown[]) {
    if (!isNonEmptyString(entry)) return null
    copied.push(entry)
  }
  return copied
}

function isWriter(value: unknown): value is LotCastingReviewContext['writer'] {
  return isPlainRecord(value) &&
    hasExactOwnKeys(value, WRITER_KEYS) &&
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.name) &&
    isCreativeRole(value.primaryRole)
}

function isFit(value: unknown): value is LotCastingReviewEvidence['fit'] {
  return isPlainRecord(value) &&
    hasExactOwnKeys(value, FIT_KEYS) &&
    value.label === 'Fit' &&
    isFiniteNumber(value.score)
}

function evidenceView(value: unknown): LotCastingReviewEvidence | null {
  if (
    !isPlainRecord(value) ||
    !hasExactOwnKeys(value, EVIDENCE_KEYS) ||
    !isNonEmptyString(value.talentId) ||
    !isNonEmptyString(value.name) ||
    value.label !== 'Est.' ||
    !isNonNegativeSafeInteger(value.estimate) ||
    value.estimate > 100 ||
    !isNonNegativeSafeInteger(value.low) ||
    !isNonNegativeSafeInteger(value.high) ||
    value.low !== Math.max(0, value.estimate - CASTING_RESULT_HALF_WIDTH) ||
    value.high !== Math.min(100, value.estimate + CASTING_RESULT_HALF_WIDTH) ||
    !isFit(value.fit) ||
    typeof value.available !== 'boolean' ||
    !isNonEmptyString(value.availabilityLabel)
  ) return null
  const strengths = strings(value.strengths)
  const concerns = strings(value.concerns)
  if (strengths === null || concerns === null) return null
  return {
    talentId: value.talentId,
    name: value.name,
    label: 'Est.',
    estimate: value.estimate,
    low: value.low,
    high: value.high,
    fit: { label: 'Fit', score: value.fit.score },
    available: value.available,
    availabilityLabel: value.availabilityLabel,
    strengths,
    concerns,
  }
}

function isCandidate(value: unknown): value is CastingCandidateView {
  return isPlainRecord(value) &&
    hasExactOwnKeys(value, CANDIDATE_KEYS) &&
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.name) &&
    isCreativeRole(value.primaryRole) &&
    isFit(value.fit) &&
    typeof value.available === 'boolean' &&
    isNonEmptyString(value.availabilityLabel)
}

function blockerView(value: unknown): LotCastingReviewBlocker | null {
  if (
    !isPlainRecord(value) ||
    !hasExactOwnKeys(value, BLOCKER_KEYS) ||
    typeof value.kind !== 'string' ||
    !BLOCKER_KINDS.has(value.kind) ||
    !isNonEmptyString(value.headline) ||
    !isNonEmptyString(value.detail) ||
    !isNonEmptyString(value.remedy)
  ) return null
  return {
    kind: value.kind as LotCastingReviewBlocker['kind'],
    headline: value.headline,
    detail: value.detail,
    remedy: value.remedy,
  }
}

function packageView(value: unknown): LotCastingReviewPackageAvailability | null {
  if (
    !isPlainRecord(value) ||
    !hasExactOwnKeys(value, PACKAGE_KEYS) ||
    typeof value.knownGatesClear !== 'boolean' ||
    typeof value.writerAvailable !== 'boolean' ||
    typeof value.staffingAvailable !== 'boolean' ||
    typeof value.productionSlotAvailable !== 'boolean' ||
    typeof value.developmentCastingSlotAvailable !== 'boolean' ||
    !Array.isArray(value.blockers) ||
    !hasCanonicalArrayKeys(value.blockers)
  ) return null
  const blockers: LotCastingReviewBlocker[] = []
  for (const candidate of value.blockers as unknown[]) {
    const blocker = blockerView(candidate)
    if (blocker === null || !PACKAGE_BLOCKER_KINDS.has(blocker.kind)) return null
    blockers.push(blocker)
  }
  if (value.knownGatesClear !== (blockers.length === 0)) return null
  const blockerKinds = new Set(blockers.map((blocker) => blocker.kind))
  if (
    value.writerAvailable !==
      !(blockerKinds.has('writer-contract') || blockerKinds.has('writer-assignment')) ||
    value.staffingAvailable !== !blockerKinds.has('package-staffing') ||
    value.productionSlotAvailable !== !blockerKinds.has('production-capacity') ||
    value.developmentCastingSlotAvailable !== !blockerKinds.has('facility-capacity')
  ) return null
  return {
    knownGatesClear: value.knownGatesClear,
    writerAvailable: value.writerAvailable,
    staffingAvailable: value.staffingAvailable,
    productionSlotAvailable: value.productionSlotAvailable,
    developmentCastingSlotAvailable: value.developmentCastingSlotAvailable,
    blockers,
  }
}

function acknowledgeAction(
  value: unknown,
  sessionId?: string,
  projectId?: string,
): LotCastingReviewAction | null {
  if (
    !isPlainRecord(value) ||
    !hasExactOwnKeys(value, ACKNOWLEDGE_ACTION_KEYS) ||
    value.kind !== 'acknowledgeCastingSession' ||
    !isNonEmptyString(value.sessionId) ||
    !isNonEmptyString(value.projectId) ||
    !isNonEmptyString(value.label) ||
    typeof value.opensPackage !== 'boolean' ||
    (sessionId !== undefined && value.sessionId !== sessionId) ||
    (projectId !== undefined && value.projectId !== projectId)
  ) return null
  return {
    kind: 'acknowledgeCastingSession',
    sessionId: value.sessionId,
    projectId: value.projectId,
    label: value.label,
    opensPackage: value.opensPackage,
  }
}

function isGenericAction(value: unknown): boolean {
  if (!isPlainRecord(value) || !isNonEmptyString(value.kind)) return false
  if (value.kind === 'acknowledgeCastingSession') return acknowledgeAction(value) !== null
  return hasExactOwnKeys(value, SIMPLE_ACTION_KEYS) &&
    (value.kind === 'planAuditions' || value.kind === 'openPackage') &&
    isNonEmptyString(value.projectId) &&
    isNonEmptyString(value.label)
}

function isRoleRecord(value: unknown, member: (entry: unknown) => boolean): boolean {
  if (!isPlainRecord(value) || !hasExactOwnKeys(value, ROLE_RECORD_KEYS)) return false
  for (const slot of ROLE_RECORD_KEYS) {
    const rows = value[slot]
    if (!Array.isArray(rows) || !hasCanonicalArrayKeys(rows)) return false
    if (!(rows as unknown[]).every(member)) return false
  }
  return true
}

function isGenericCard(value: unknown): value is CastingProjectView {
  if (
    !isPlainRecord(value) ||
    !hasExactOwnKeys(value, CARD_KEYS) ||
    !isNonEmptyString(value.projectId) ||
    (value.sessionId !== null && !isNonEmptyString(value.sessionId)) ||
    !isNonEmptyString(value.title) ||
    !isGenre(value.genre) ||
    !isWriter(value.writer) ||
    typeof value.status !== 'string' ||
    !CARD_STATUSES.has(value.status) ||
    (value.dueWeek !== null && !isNonNegativeSafeInteger(value.dueWeek)) ||
    (value.weeksUntilDecision !== null && !isNonNegativeSafeInteger(value.weeksUntilDecision)) ||
    !isNonEmptyString(value.consequence) ||
    !isRoleRecord(value.candidates, isCandidate) ||
    (value.results !== null && !isRoleRecord(value.results, (entry) => evidenceView(entry) !== null)) ||
    (value.packageAvailability !== null && packageView(value.packageAvailability) === null) ||
    !Array.isArray(value.legalActions) ||
    !hasCanonicalArrayKeys(value.legalActions) ||
    !(value.legalActions as unknown[]).every(isGenericAction)
  ) return false
  const blockers = strings(value.blockers)
  if (blockers === null) return false
  if (value.status === 'notStarted') {
    return value.sessionId === null && value.dueWeek === null && value.weeksUntilDecision === null && value.results === null
  }
  if (value.status === 'auditioning') {
    return value.sessionId !== null && value.dueWeek !== null && value.weeksUntilDecision !== null && value.results === null
  }
  return value.sessionId !== null && value.dueWeek === null && value.weeksUntilDecision === null && value.results !== null
}

function strictBoard(value: unknown): CastingSessionsReadModel | null {
  if (
    !isPlainRecord(value) ||
    !hasExactOwnKeys(value, BOARD_KEYS) ||
    (value.mode !== 'legacy' && value.mode !== 'managed') ||
    !isPlainRecord(value.activation) ||
    !hasExactOwnKeys(value.activation, ACTIVATION_KEYS) ||
    typeof value.activation.canActivate !== 'boolean' ||
    !isNonEmptyString(value.activation.label) ||
    (value.activation.blocker !== null && !isNonEmptyString(value.activation.blocker)) ||
    !isPlainRecord(value.sections) ||
    !hasExactOwnKeys(value.sections, SECTION_KEYS)
  ) return null

  const projectIds = new Set<string>()
  const sessionIds = new Set<string>()
  for (const section of SECTION_KEYS) {
    const cards = value.sections[section]
    if (!Array.isArray(cards) || !hasCanonicalArrayKeys(cards)) return null
    let priorSessionId: string | null = null
    for (const candidate of cards as unknown[]) {
      if (!isGenericCard(candidate)) return null
      if (projectIds.has(candidate.projectId)) return null
      projectIds.add(candidate.projectId)
      if (candidate.sessionId !== null) {
        if (sessionIds.has(candidate.sessionId)) return null
        sessionIds.add(candidate.sessionId)
        if (
          section === 'needsReview' &&
          priorSessionId !== null &&
          candidate.sessionId <= priorSessionId
        ) return null
        priorSessionId = candidate.sessionId
      }
      if (section === 'readyToPlan' && candidate.status !== 'notStarted') return null
      if (section === 'auditioning' && candidate.status !== 'auditioning') return null
      if (section === 'needsReview' && candidate.status !== 'review') return null
      if (section === 'history' && candidate.status !== 'complete') return null
    }
  }
  if (value.nextDecision !== null && decisionView(value.nextDecision) === null) return null
  return value as unknown as CastingSessionsReadModel
}

function decisionView(value: unknown): LotCastingReviewTarget | null {
  if (
    !isPlainRecord(value) ||
    !hasExactOwnKeys(value, DECISION_KEYS) ||
    value.kind !== 'castingReview' ||
    !isNonEmptyString(value.sessionId) ||
    !isNonEmptyString(value.projectId) ||
    !isNonEmptyString(value.title)
  ) return null
  return {
    sessionId: value.sessionId,
    projectId: value.projectId,
    title: value.title,
  }
}

function currentDecision(value: unknown): LotCastingReviewTarget | null {
  if (
    !isPlainRecord(value) ||
    !hasExactOwnKeys(value, DECISION_WRAPPER_KEYS) ||
    value.kind !== 'castingReview'
  ) return null
  return decisionView(value.decision)
}

function isTarget(value: unknown): value is LotCastingReviewTarget {
  return isPlainRecord(value) &&
    hasExactOwnKeys(value, TARGET_KEYS) &&
    isNonEmptyString(value.sessionId) &&
    isNonEmptyString(value.projectId) &&
    isNonEmptyString(value.title)
}

function sameTarget(left: LotCastingReviewTarget, right: LotCastingReviewTarget): boolean {
  return left.sessionId === right.sessionId &&
    left.projectId === right.projectId &&
    left.title === right.title
}

function selectedRoles(card: CastingProjectView): LotCastingReviewContext['roles'] | null {
  if (card.results === null) return null
  const roles: LotCastingReviewRole[] = []
  const unique = new Set<string>()
  for (const definition of ROLE_ORDER) {
    const candidates = card.candidates[definition.slot] as unknown
    const results = card.results[definition.slot] as unknown
    if (
      !Array.isArray(candidates) ||
      !hasCanonicalArrayKeys(candidates) ||
      candidates.length !== 2 ||
      !Array.isArray(results) ||
      !hasCanonicalArrayKeys(results) ||
      results.length !== 2
    ) return null
    const evidence: LotCastingReviewEvidence[] = []
    for (let index = 0; index < 2; index += 1) {
      const candidate = candidates[index]
      const result = evidenceView(results[index])
      if (
        !isCandidate(candidate) ||
        candidate.primaryRole !== 'actor' ||
        result === null ||
        candidate.id !== result.talentId ||
        candidate.name !== result.name ||
        candidate.fit.label !== result.fit.label ||
        !Object.is(candidate.fit.score, result.fit.score) ||
        candidate.available !== result.available ||
        candidate.availabilityLabel !== result.availabilityLabel
      ) return null
      evidence.push(result)
      unique.add(result.talentId)
    }
    if (evidence[0]!.talentId === evidence[1]!.talentId) return null
    roles.push({
      slot: definition.slot,
      label: definition.label,
      evidence: [evidence[0]!, evidence[1]!],
    })
  }
  if (unique.size < 3) return null
  return roles as LotCastingReviewContext['roles']
}

function cardSummaryBlockers(card: CastingProjectView): string[] | null {
  return strings(card.blockers)
}

function actionMatchesPackage(
  action: LotCastingReviewAction,
  availability: LotCastingReviewPackageAvailability,
  summaryBlockers: readonly string[],
): boolean {
  const headlines = availability.blockers.map((blocker) => blocker.headline)
  if (
    headlines.length !== summaryBlockers.length ||
    !headlines.every((headline, index) => headline === summaryBlockers[index])
  ) return false
  if (availability.knownGatesClear) {
    return availability.blockers.length === 0 &&
      summaryBlockers.length === 0 &&
      action.opensPackage === true &&
      action.label === 'Take results to Package'
  }
  return availability.blockers.length > 0 &&
    summaryBlockers.length > 0 &&
    action.opensPackage === false &&
    action.label === 'Finish casting review'
}

function roleView(value: unknown, expected: typeof ROLE_ORDER[number]): LotCastingReviewRole | null {
  if (
    !isPlainRecord(value) ||
    !hasExactOwnKeys(value, ROLE_KEYS) ||
    value.slot !== expected.slot ||
    value.label !== expected.label ||
    !Array.isArray(value.evidence) ||
    !hasCanonicalArrayKeys(value.evidence) ||
    value.evidence.length !== 2
  ) return null
  const first = evidenceView(value.evidence[0])
  const second = evidenceView(value.evidence[1])
  if (first === null || second === null || first.talentId === second.talentId) return null
  return { slot: expected.slot, label: expected.label, evidence: [first, second] }
}

function contextIsClosed(value: unknown): value is LotCastingReviewContext {
  if (
    !isPlainRecord(value) ||
    !hasExactOwnKeys(value, CONTEXT_KEYS) ||
    value.kind !== 'casting-review' ||
    !isNonEmptyString(value.sessionId) ||
    !isNonEmptyString(value.projectId) ||
    !isNonEmptyString(value.title) ||
    !isGenre(value.genre) ||
    !isWriter(value.writer) ||
    value.consequence !== REVIEW_CONSEQUENCE ||
    !Array.isArray(value.roles) ||
    !hasCanonicalArrayKeys(value.roles) ||
    value.roles.length !== ROLE_ORDER.length
  ) return false
  const roleValues = value.roles as unknown[]
  const roles = ROLE_ORDER.map((expected, index) => roleView(roleValues[index], expected))
  if (roles.some((role) => role === null)) return false
  const unique = new Set(
    roles.flatMap((role) => role!.evidence.map((entry) => entry.talentId)),
  )
  if (unique.size < 3) return false
  const availability = packageView(value.packageAvailability)
  const blockers = strings(value.blockers)
  const action = acknowledgeAction(value.action, value.sessionId, value.projectId)
  return availability !== null &&
    blockers !== null &&
    action !== null &&
    actionMatchesPackage(action, availability, blockers)
}

/**
 * Rebuild the one exact player-safe Casting review from current Engine truth.
 * Malformed or ambiguous adapter output fails neutral; this selector never
 * chooses by title or array accident and never inspects hidden audition truth.
 */
export function currentLotCastingReviewContext(
  state: GameState,
  target?: LotCastingReviewTarget,
): LotCastingReviewContext | null {
  try {
    if (target !== undefined && !isTarget(target)) return null
    if (state.castingSessions.mode !== 'managed' || state.scriptDevelopment.mode !== 'managed') {
      return null
    }

    const current = currentDecision(studioDecision(state) as unknown)
    if (current === null) return null
    if (target !== undefined && !sameTarget(current, target)) return null

    const board = strictBoard(castingSessionsBoard(state) as unknown)
    if (board === null || board.mode !== 'managed') return null
    const boardDecision = decisionView(board.nextDecision as unknown)
    if (boardDecision === null || !sameTarget(current, boardDecision)) return null

    const reviewCards = board.sections.needsReview
    if (reviewCards.length === 0 || reviewCards[0]!.sessionId !== current.sessionId) return null
    const matches = reviewCards.filter(
      (card) => card.sessionId === current.sessionId && card.projectId === current.projectId,
    )
    if (matches.length !== 1) return null
    const card = matches[0]!
    if (
      card.title !== current.title ||
      card.status !== 'review' ||
      card.dueWeek !== null ||
      card.weeksUntilDecision !== null ||
      card.consequence !== REVIEW_CONSEQUENCE ||
      card.packageAvailability === null ||
      card.results === null
    ) return null

    const roles = selectedRoles(card)
    const availability = packageView(card.packageAvailability)
    const blockers = cardSummaryBlockers(card)
    if (
      roles === null ||
      availability === null ||
      blockers === null ||
      card.legalActions.length !== 1
    ) return null
    const action = acknowledgeAction(
      card.legalActions[0],
      current.sessionId,
      current.projectId,
    )
    if (action === null || !actionMatchesPackage(action, availability, blockers)) return null

    return {
      kind: 'casting-review',
      sessionId: current.sessionId,
      projectId: current.projectId,
      title: current.title,
      genre: card.genre,
      writer: {
        id: card.writer.id,
        name: card.writer.name,
        primaryRole: card.writer.primaryRole,
      },
      consequence: REVIEW_CONSEQUENCE,
      roles,
      packageAvailability: availability,
      blockers,
      action,
    }
  } catch {
    return null
  }
}

/** Exact closed-field comparator for the sole Casting review action token. */
export function sameLotCastingReviewAction(
  left: LotCastingReviewAction | null,
  right: LotCastingReviewAction | null,
): boolean {
  try {
    if (left === null || right === null) return left === right
    const validLeft = acknowledgeAction(left)
    const validRight = acknowledgeAction(right)
    return validLeft !== null && validRight !== null && sameClosedValue(validLeft, validRight)
  } catch {
    return false
  }
}

/** Exact closed-field comparator for stale state, gesture, and deep-return checks. */
export function sameLotCastingReviewContext(
  left: LotCastingReviewContext | null,
  right: LotCastingReviewContext | null,
): boolean {
  try {
    if (left === null || right === null) return left === right
    return contextIsClosed(left) && contextIsClosed(right) && sameClosedValue(left, right)
  } catch {
    return false
  }
}

function sameStateExceptCastingReviewStatus(
  before: GameState,
  next: GameState,
  target: LotCastingReviewTarget,
): boolean {
  if (!isPlainRecord(before) || !isPlainRecord(next)) return false
  const beforeKeys = Reflect.ownKeys(before)
  const nextKeys = Reflect.ownKeys(next)
  if (
    beforeKeys.length !== nextKeys.length ||
    !beforeKeys.every((key) => Object.prototype.hasOwnProperty.call(next, key))
  ) return false
  for (const key of beforeKeys) {
    if (key === 'castingSessions') continue
    if (!sameClosedValue(before[key as keyof GameState], next[key as keyof GameState])) return false
  }

  const priorCasting = before.castingSessions as unknown
  const nextCasting = next.castingSessions as unknown
  if (
    !isPlainRecord(priorCasting) ||
    !isPlainRecord(nextCasting) ||
    !hasExactOwnKeys(priorCasting, ['mode', 'sessions']) ||
    !hasExactOwnKeys(nextCasting, ['mode', 'sessions']) ||
    priorCasting.mode !== nextCasting.mode ||
    !Array.isArray(priorCasting.sessions) ||
    !Array.isArray(nextCasting.sessions) ||
    !hasCanonicalArrayKeys(priorCasting.sessions) ||
    !hasCanonicalArrayKeys(nextCasting.sessions) ||
    priorCasting.sessions.length !== nextCasting.sessions.length
  ) return false

  let changed = 0
  for (let index = 0; index < priorCasting.sessions.length; index += 1) {
    const prior = priorCasting.sessions[index]
    const current = nextCasting.sessions[index]
    if (!isPlainRecord(prior) || !isPlainRecord(current)) return false
    const priorKeys = Reflect.ownKeys(prior)
    const currentKeys = Reflect.ownKeys(current)
    if (
      priorKeys.length !== currentKeys.length ||
      !priorKeys.every((key) => Object.prototype.hasOwnProperty.call(current, key))
    ) return false
    const isTargetSession =
      prior.id === target.sessionId &&
      prior.projectId === target.projectId
    if (isTargetSession) {
      if (
        current.id !== target.sessionId ||
        current.projectId !== target.projectId ||
        prior.status !== 'review' ||
        current.status !== 'complete' ||
        prior.dueWeek !== null ||
        current.dueWeek !== null ||
        prior.reservation !== null ||
        current.reservation !== null
      ) return false
      for (const key of priorKeys) {
        if (key === 'status') continue
        if (!sameClosedValue(prior[key], current[key])) return false
      }
      changed += 1
    } else if (!sameClosedValue(prior, current)) {
      return false
    }
  }
  return changed === 1
}

function openPackageAction(
  value: unknown,
  projectId: string,
): Extract<
  CastingProjectView['legalActions'][number],
  { kind: 'openPackage' }
> | null {
  if (
    !isPlainRecord(value) ||
    !hasExactOwnKeys(value, SIMPLE_ACTION_KEYS) ||
    value.kind !== 'openPackage' ||
    value.projectId !== projectId ||
    value.label !== 'Open package'
  ) return null
  return { kind: 'openPackage', projectId, label: 'Open package' }
}

/**
 * Prove the complete successor after one App-accepted acknowledgement.
 * Failure affects presentation/navigation only; it never invalidates or rolls
 * back a valid Engine successor.
 */
export function acceptedLotCastingReviewSuccess(
  rendered: LotCastingReviewContext,
  action: LotCastingReviewAction,
  before: GameState,
  next: GameState,
): LotCastingReviewSuccess | null {
  try {
    if (!contextIsClosed(rendered) || !sameLotCastingReviewAction(action, rendered.action)) {
      return null
    }
    const target: LotCastingReviewTarget = {
      sessionId: rendered.sessionId,
      projectId: rendered.projectId,
      title: rendered.title,
    }
    const prior = currentLotCastingReviewContext(before, target)
    if (
      prior === null ||
      !sameLotCastingReviewContext(rendered, prior) ||
      !sameStateExceptCastingReviewStatus(before, next, target)
    ) return null

    const board = strictBoard(castingSessionsBoard(next) as unknown)
    if (board === null || board.mode !== 'managed') return null
    const matches = board.sections.history.filter(
      (card) => card.sessionId === target.sessionId && card.projectId === target.projectId,
    )
    if (matches.length !== 1) return null
    const successor = matches[0]!
    if (
      successor.title !== target.title ||
      successor.genre !== rendered.genre ||
      successor.status !== 'complete' ||
      successor.dueWeek !== null ||
      successor.weeksUntilDecision !== null ||
      successor.consequence !== COMPLETE_CONSEQUENCE ||
      successor.writer.id !== rendered.writer.id ||
      successor.writer.name !== rendered.writer.name ||
      successor.writer.primaryRole !== rendered.writer.primaryRole ||
      successor.packageAvailability === null
    ) return null
    const roles = selectedRoles(successor)
    const availability = packageView(successor.packageAvailability)
    const summaryBlockers = cardSummaryBlockers(successor)
    if (
      roles === null ||
      availability === null ||
      summaryBlockers === null ||
      !sameClosedValue(roles, rendered.roles) ||
      !sameClosedValue(availability, rendered.packageAvailability) ||
      !sameClosedValue(summaryBlockers, rendered.blockers)
    ) return null

    const current = studioDecision(next)
    if (
      current?.kind === 'castingReview' &&
      current.decision.sessionId === target.sessionId
    ) return null

    if (action.opensPackage) {
      if (
        !availability.knownGatesClear ||
        availability.blockers.length !== 0 ||
        summaryBlockers.length !== 0 ||
        successor.legalActions.length !== 1
      ) return null
      const open = openPackageAction(successor.legalActions[0], target.projectId)
      if (open === null) return null
      return {
        kind: 'clear',
        sessionId: target.sessionId,
        projectId: target.projectId,
        title: target.title,
        writerName: rendered.writer.name,
        statusLabel: 'Casting review complete',
        blockers: [],
        openPackageAction: open,
      }
    }

    if (
      availability.knownGatesClear ||
      availability.blockers.length === 0 ||
      successor.legalActions.length !== 0
    ) return null
    return {
      kind: 'blocked',
      sessionId: target.sessionId,
      projectId: target.projectId,
      title: target.title,
      writerName: rendered.writer.name,
      statusLabel: 'Casting review complete',
      blockers: availability.blockers.map((blocker) => ({ ...blocker })),
      openPackageAction: null,
    }
  } catch {
    return null
  }
}
