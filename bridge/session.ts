import { createHash, randomUUID } from 'node:crypto'
import { performance } from 'node:perf_hooks'

import {
  acknowledgeCastingSessionAction,
  advanceWeek,
  castingSessionsBoard,
  commissionScriptAction,
  exportSaveJson,
  financeCard,
  findConcept,
  findTalent,
  foundManagedStudioAction,
  foundingApplicantCards,
  foundingApplicantRows,
  foundingBudgetRemaining,
  foundingProgress,
  foundingRunwayPreview,
  greenlightScriptProject,
  newGame,
  nextIncompleteProfession,
  offerObligation,
  payrollSummary,
  requiredNegative,
  runProductionCommand,
  runScriptProjectAction,
  scriptProjectsBoard,
  signContractAction,
  startCastingSessionAction,
  startDevelopmentCastingAnnexAction,
  studioDecision,
  studioDevelopment,
  studioLotSnapshot,
  studioPool,
} from '../ui/src/engine/adapter.ts'
import type {
  ActionOutcome,
  DraftPackage,
  FoundingApplicantRow,
  GameState,
} from '../ui/src/engine/adapter.ts'
import { importSave, migrateToV15 } from '../src/core/index.js'
import {
  PROTOCOL_VERSION,
  SCHEMA_ID,
  SNAPSHOT_VERSION,
  type AvailableIntent,
  type ControlEnvelope,
  type Rejection,
  type RejectionCode,
  type SubmitIntentCommand,
} from './protocol.ts'
import {
  BridgeRuntimeCheckpointCapacityError,
  BridgeRuntimeCheckpointHistoryFullError,
  createBridgeRuntimeCheckpoint,
  createBridgeRuntimeJournalEntry,
  DEFAULT_BRIDGE_RUNTIME_CHECKPOINT_LIMITS,
  type BridgeRuntimeCheckpointLimits,
  type BridgeRuntimeCheckpointV1,
  type BridgeRuntimeJournalEntryV1,
  type BridgeRuntimeJournalRoute,
  type HydratedBridgeRuntimeCheckpoint,
  type HydratedBridgeRuntimeJournalEntry,
} from './runtime-checkpoint.ts'
import { canonicalJson } from './schema/canonical.ts'
import type {
  BridgeAcceptedCommandResponse,
  BridgeAcceptedSaveResponse,
  BridgeCastingDraftPayload,
  BridgeCastingQuoteSnapshot,
  BridgeCommissionDraftPayload,
  BridgeCommissionQuoteSnapshot,
  BridgeFoundingArrivalSnapshot,
  BridgeFoundingSnapshot,
  BridgeQuoteCastingRequest,
  BridgeQuoteCommissionRequest,
  BridgeQuoteRequest,
  BridgeQuoteResponse,
  BridgeRejectedResponse,
  BridgeSnapshotEnvelope,
  BridgeTreasurySnapshot,
} from './schema/bridge-schema.ts'
import { projectStudioProjectionBundle } from './schema/runtime.ts'
import {
  commissionQuoteSnapshot,
  developmentProjection,
  draftToEngine,
} from './development.ts'
import { castingDraftToEngine, castingProjection, castingQuoteSnapshot } from './casting.ts'

type ImportOutcome =
  | { ok: true; state: GameState; converted: boolean }
  | { ok: false; error: string }

// P04A (§2.5) STEP 0: the bridge's live-boundary save import, routed to the
// live V15 migrator. `ui/src/engine/adapter.ts`'s own `importSaveJson` remains
// hard-wired to `migrateToV14` (out of this lane's allowed files — the ui/**
// boundary is off-limits here), so this local, contract-identical wrapper is
// the bridge-owned half of the "one coordinated change" §2.5 describes: same
// `ImportOutcome` shape, same semantics, migrating to V15 (the current
// `GameState` live shape) instead of the now-historical V14.
function importSaveJsonV15(json: string): ImportOutcome {
  try {
    const save = importSave(json)
    const converted = save.saveVersion !== 15
    return { ok: true, state: migrateToV15(save).state, converted }
  } catch (error) {
    return { ok: false, error: (error as Error).message }
  }
}

type IntentApplication = {
  option: AvailableIntent
  apply: (state: GameState) => ActionOutcome
}

export type SnapshotMetrics = BridgeSnapshotEnvelope['metrics']
export type SnapshotEnvelope = BridgeSnapshotEnvelope
export type AcceptedCommandResponse = BridgeAcceptedCommandResponse
export type RejectedResponse = BridgeRejectedResponse

export type CommandResponse = AcceptedCommandResponse | RejectedResponse

export type AcceptedSaveResponse = BridgeAcceptedSaveResponse

export type SaveResponse = AcceptedSaveResponse | RejectedResponse
type CachedResponse = CommandResponse | SaveResponse

export type AcceptedQuoteResponse = BridgeQuoteResponse
export type QuoteResponse = AcceptedQuoteResponse | RejectedResponse
/** The accepted quote envelope, narrowed to exactly one family's `quote` payload. */
export type AcceptedQuoteResponseFor<TQuote> = Omit<BridgeQuoteResponse, 'quote'> & { quote: TQuote }

/**
 * One minted quote: valid for exactly the state that quoted it. A single
 * cap-16 map shared by both families — `quotedIntentFor()`/clear-on-command/
 * clear-on-load stay generic over intentId regardless of which family minted it.
 */
type PendingQuote =
  | {
      family: 'commission'
      draft: BridgeCommissionDraftPayload
      stateDigest: string
      kind: 'commissionScreenplay' | 'commissionOriginalScreenplay'
      commitLabel: string
    }
  | {
      family: 'casting'
      draft: BridgeCastingDraftPayload
      stateDigest: string
      kind: 'startAuditions' | 'greenlightPicture'
      commitLabel: string
    }

type RuntimeEntry = {
  entry: BridgeRuntimeJournalEntryV1
}

type BridgeSessionRuntimeState = {
  revision: number
  journal: readonly HydratedBridgeRuntimeJournalEntry[]
  limits: BridgeRuntimeCheckpointLimits
}

export type PlayedIntent = {
  option: AvailableIntent
  beforeWeek: number
  afterWeek: number
  beforeDigest: string
  afterDigest: string
}

type JourneyIntentContext = {
  next: { kind: string } | null
  scriptProjectId: string | null
  productionId: string | null
}

/** Follow the authoritative journey while other legal concurrent choices remain visible. */
export function selectJourneyIntent(
  candidates: readonly AvailableIntent[],
  journey: JourneyIntentContext | null | undefined,
): AvailableIntent | undefined {
  if (journey?.next === null || journey?.next === undefined) return undefined
  const project = (kind: AvailableIntent['kind']) => candidates.find(
    (candidate) => candidate.kind === kind && candidate.projectId === journey.scriptProjectId,
  )
  switch (journey.next.kind) {
    case 'commission':
      return candidates.find((candidate) => candidate.kind === 'commissionScreenplay')
    case 'advance-week':
      return candidates.find((candidate) => candidate.kind === 'advanceWeek')
    case 'script-review':
      return project('acceptScreenplay') ?? project('requestRewrite')
    case 'plan-auditions':
      return project('startAuditions')
    case 'audition-review':
      return project('acknowledgeAuditions')
    case 'open-package':
      return project('greenlightPicture')
    case 'resolve-production':
      return candidates.find(
        (candidate) =>
          candidate.kind === 'resolveProductionBlocker' &&
          candidate.productionId === journey.productionId,
      )
    default:
      return undefined
  }
}

function requireSuccess(outcome: ActionOutcome, operation: string): GameState {
  if (!outcome.ok) throw new Error(`${operation}: ${outcome.error}`)
  return outcome.next
}

/** A real player founding path: public applicant cards, offers, and managed founding action. */
export function createManagedBridgeState(seed = 'current-game-unity-adoption-v2'): GameState {
  let state = newGame(seed)
  for (let guard = 0; guard < 64; guard++) {
    const role = nextIncompleteProfession(state)
    if (role === null) break
    const card = foundingApplicantCards(state).find(
      (candidate) => candidate.profile.role === role &&
        !state.contracts.some((contract) => contract.talentId === candidate.profile.id),
    )
    if (card === undefined) throw new Error(`Bridge founding has no available ${role} applicant.`)
    const offer = [...card.employment.offerOptions].sort((a, b) => b.termWeeks - a.termWeeks)[0]
    if (offer === undefined) throw new Error(`Bridge founding applicant ${card.profile.id} has no legal offer.`)
    state = requireSuccess(
      signContractAction(state, card.profile.id, offer.termWeeks),
      `sign ${card.profile.id}`,
    )
  }
  if (nextIncompleteProfession(state) !== null) throw new Error('Bridge founding did not reach required coverage.')

  // The gate's two-picture proof crosses a freelancer-market refresh between Movie #2's
  // camera tests and package.  Found one additional Actor through the same public offer
  // action so all three named roles remain genuinely contract-backed; the bridge still
  // asks the engine to validate the offer and later re-reads availability before greenlight.
  const additionalActor = foundingApplicantCards(state).find(
    (candidate) => candidate.profile.role === 'actor' &&
      !state.contracts.some((contract) => contract.talentId === candidate.profile.id),
  )
  if (additionalActor === undefined) {
    throw new Error('Bridge founding has no additional Actor applicant for the two-picture proof.')
  }
  const actorOffer = [...additionalActor.employment.offerOptions]
    .sort((a, b) => b.termWeeks - a.termWeeks)[0]
  if (actorOffer === undefined) {
    throw new Error(`Bridge founding applicant ${additionalActor.profile.id} has no legal offer.`)
  }
  state = requireSuccess(
    signContractAction(state, additionalActor.profile.id, actorOffer.termWeeks),
    `sign additional Actor ${additionalActor.profile.id}`,
  )
  return requireSuccess(foundManagedStudioAction(state), 'found managed studio')
}

export function authoritativeDigest(state: GameState): string {
  return createHash('sha256').update(exportSaveJson(state)).digest('hex')
}

function opaqueIntentId(stateDigest: string, descriptor: unknown): string {
  return `intent-v${String(PROTOCOL_VERSION)}-${createHash('sha256')
    .update(stateDigest)
    .update('\0')
    .update(JSON.stringify(descriptor))
    .digest('hex')}`
}

function option(
  stateDigest: string,
  fields: Omit<AvailableIntent, 'intentId'>,
  hiddenAction: unknown,
): AvailableIntent {
  return {
    intentId: opaqueIntentId(stateDigest, { fields, hiddenAction }),
    ...fields,
  }
}

function caught(operation: () => ActionOutcome): ActionOutcome {
  try {
    return operation()
  } catch (error) {
    return { ok: false, error: (error as Error).message }
  }
}

function advanceOutcome(state: GameState): ActionOutcome {
  return caught(() => ({ ok: true, next: advanceWeek(state).next }))
}

function allCastingProjects(state: GameState) {
  const board = castingSessionsBoard(state)
  return [
    ...board.sections.readyToPlan,
    ...board.sections.auditioning,
    ...board.sections.needsReview,
    ...board.sections.history,
  ]
}

function castsFromReviewedAuditions(state: GameState, projectId: string) {
  const project = allCastingProjects(state).find((candidate) => candidate.projectId === projectId)
  if (project?.results === null || project?.results === undefined || project.sessionId === null) return []
  const results = project.results
  const casts: Array<{
    lead: (typeof results.lead)[number]
    antagonist: (typeof results.antagonist)[number]
    support: (typeof results.support)[number]
    sessionId: string
  }> = []
  const seen = new Set<string>()
  for (const lead of results.lead.filter((entry) => entry.available)) {
    for (const antagonist of results.antagonist.filter((entry) => entry.available)) {
      for (const support of results.support.filter((entry) => entry.available)) {
        if (
          lead.talentId === antagonist.talentId ||
          lead.talentId === support.talentId ||
          antagonist.talentId === support.talentId
        ) continue
        const identity = `${lead.talentId}\0${antagonist.talentId}\0${support.talentId}`
        if (seen.has(identity)) continue
        seen.add(identity)
        casts.push({ lead, antagonist, support, sessionId: project.sessionId })
      }
    }
  }
  return casts
}

function auditionEvidenceLine(
  role: 'Lead' | 'Antagonist' | 'Support',
  evidence: {
    name: string
    estimate: number
    low: number
    high: number
    fit: { score: number }
    strengths: string[]
    concerns: string[]
  },
): string {
  const observations: string[] = []
  if (evidence.strengths[0] !== undefined) observations.push(`Strength: ${evidence.strengths[0]}`)
  if (evidence.concerns[0] !== undefined) observations.push(`Concern: ${evidence.concerns[0]}`)
  if (observations.length === 0) {
    observations.push('This camera test is evidence, not a performance guarantee.')
  }
  return `${role} ${evidence.name}: Est. ${String(evidence.estimate)}, observed range ` +
    `${String(evidence.low)}-${String(evidence.high)}, Fit ${String(evidence.fit.score)}. ` +
    observations.join(' ')
}

function hasOnlyQueueableCapacityBlockers(
  blockers: readonly { kind: string }[],
): boolean {
  return blockers.length > 0 && blockers.every((blocker) => blocker.kind === 'facility-capacity')
}

function pushIfAccepted(
  state: GameState,
  resolved: IntentApplication[],
  candidate: IntentApplication,
): void {
  if (candidate.apply(state).ok) resolved.push(candidate)
}

function acceptedIntentMessage(
  fallback: string,
  before: GameState,
  after: GameState,
): string {
  const priorOrdinals = new Set(before.productionQueue.map((entry) => entry.ordinal))
  const admitted = after.productionQueue.find((entry) => !priorOrdinals.has(entry.ordinal))
  if (admitted === undefined) return fallback
  switch (admitted.kind) {
    case 'commissionScript':
    case 'commissionOriginalScreenplay':
      return 'Screenplay commission joined the Development & Casting queue. No writer, project identity, or cost is committed until capacity reaches it and TypeScript revalidates it.'
    case 'startCastingSession':
      return 'Auditions joined the Development & Casting queue. No actor was reserved or paid while the camera-test request waits.'
    case 'greenlightScriptProject':
      return 'Greenlight joined the Development & Casting queue. No production identity, budget, or talent commitment exists until capacity reaches the package and TypeScript revalidates it.'
  }
}

const FOUNDING_OFFER_TERM_WEEKS = 104

function exactDollars(value: number): string {
  const rounded = Math.round(value)
  const sign = rounded < 0 ? '-' : ''
  const digits = String(Math.abs(rounded)).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return `${sign}$${digits}`
}

function foundingRoleLabel(role: FoundingApplicantRow['role']): string {
  switch (role) {
    case 'actor': return 'actor'
    case 'director': return 'director'
    case 'writer': return 'writer'
    case 'craft': return 'production/craft lead'
  }
}

function foundingRunwayLabel(state: GameState): string {
  const runway = foundingRunwayPreview(state)
  return runway.infinite ? 'unlimited at current commitments' : `${String(runway.weeks)} weeks`
}

function foundingOfferDetail(
  row: FoundingApplicantRow,
  offer: FoundingApplicantRow['card']['employment']['offerOptions'][number],
  after: GameState,
): string {
  const obligation = offerObligation(offer)
  const strengths = row.topStrengths.length > 0
    ? row.topStrengths.join(', ')
    : 'No standout signal surfaced'
  const concern = row.primaryConcern ?? 'No primary concern surfaced'
  return `Perceived OVR ${String(row.ovr)} (${row.ovrTier}); potential ` +
    `${row.potentialTier} up to ${String(row.potentialHigh)}; work ethic ${row.workEthicLabel}. ` +
    `Strengths: ${strengths}. Concern: ${concern}. ` +
    `Annual salary ${exactDollars(offer.annualSalary)}; signing bonus ` +
    `${exactDollars(offer.signingBonus)}; guaranteed salary ` +
    `${exactDollars(obligation.guaranteedComp)}; total obligation ` +
    `${exactDollars(obligation.total)}; weekly salary ${exactDollars(obligation.weeklySalary)}. ` +
    `Projected weekly payroll after signing ${exactDollars(payrollSummary(after).weeklyPayroll)}; ` +
    `recruitment fund after signing ${exactDollars(foundingBudgetRemaining(after))}; ` +
    `projected founding runway ${foundingRunwayLabel(after)}.`
}

type FoundingResolution = {
  intents: IntentApplication[]
  projection: BridgeFoundingSnapshot
}

/**
 * LL-CP9. Founding intents and the read-only founding-arrival view come from ONE
 * resolution pass, so every projected arrival's intentId matches an emitted intent
 * by construction — Unity never parses prose to bind an offer to a person.
 *
 * THE PLAYER'S FOUNDING LAW IS THE ENGINE'S: Core coverage (3 Actors / 1 Director /
 * 1 Writer / 1 Production-Craft Lead) makes foundStudio legal, and the bridge emits
 * it the moment coverage is met. The reserve Actor the automated two-picture proof
 * wants is an OPTIONAL post-coverage offer wave — automation that needs a reserve
 * signs one deliberately; a player may found without it.
 */
function resolveFounding(
  state: GameState,
  stateDigest: string,
): FoundingResolution | null {
  if (state.founding === null) return null

  const progress = foundingProgress(state)
  const requiredRole = progress.find((entry) => !entry.met)?.role ?? null
  const actorProgress = progress.find((entry) => entry.role === 'actor')
  if (actorProgress === undefined) throw new Error('Founding progress omitted Actors.')

  const resolved: IntentApplication[] = []
  const arrivals: BridgeFoundingArrivalSnapshot[] = []
  const reserveWave = requiredRole === null && actorProgress.extra === 0
  const offerRole = requiredRole ?? (reserveWave ? 'actor' : null)
  if (offerRole !== null) {
    for (const row of foundingApplicantRows(state, offerRole)) {
      if (row.signed) continue
      const offer = row.card.employment.offerOptions.find(
        (candidate) => candidate.termWeeks === FOUNDING_OFFER_TERM_WEEKS,
      )
      if (offer === undefined) continue
      const preview = signContractAction(state, row.id, FOUNDING_OFFER_TERM_WEEKS)
      if (!preview.ok) continue
      const fields: Omit<AvailableIntent, 'intentId'> = {
        kind: 'signFoundingContract',
        label: `Offer ${row.name} a 2-year ${foundingRoleLabel(row.role)} contract`,
        detail:
          (reserveWave
            ? 'Optional reserve Actor: founding is already legal without this signing. '
            : '') + foundingOfferDetail(row, offer, preview.next),
        projectId: null,
        castingSessionId: null,
        productionId: null,
      }
      const intentOption = option(stateDigest, fields, {
        kind: 'signContract',
        talentId: row.id,
        termWeeks: FOUNDING_OFFER_TERM_WEEKS,
      })
      resolved.push({
        option: intentOption,
        apply: (current) => signContractAction(current, row.id, FOUNDING_OFFER_TERM_WEEKS),
      })
      const obligation = offerObligation(offer)
      const after = preview.next
      const runwayAfter = foundingRunwayPreview(after)
      arrivals.push({
        talentId: row.id,
        name: row.name,
        role: row.role,
        roleLabel: foundingRoleLabel(row.role),
        ovr: row.ovr,
        ovrTier: row.ovrTier,
        fame: row.fame,
        potentialTier: row.potentialTier,
        potentialHigh: row.potentialHigh,
        workEthic: row.workEthic,
        workEthicLabel: row.workEthicLabel,
        standingPct: row.standingPct,
        standingTier: row.standing,
        // The engine ages talent continuously; the person's stated age is completed years.
        age: Math.floor(row.age),
        topStrengths: row.topStrengths,
        primaryConcern: row.primaryConcern,
        topGenreLabel: row.topGenreLabel,
        topGenreExperience: row.topGenreExperience,
        topGenreTied: row.topGenreTied,
        secondGenreLabel: row.secondGenreLabel,
        secondGenreExperience: row.secondGenreExperience,
        weeklySalary: obligation.weeklySalary,
        annualSalary: offer.annualSalary,
        signingBonus: offer.signingBonus,
        guaranteedComp: obligation.guaranteedComp,
        totalObligation: obligation.total,
        termWeeks: offer.termWeeks,
        reserve: reserveWave,
        intentId: intentOption.intentId,
        payrollAfterWeekly: payrollSummary(after).weeklyPayroll,
        fundAfter: foundingBudgetRemaining(after),
        runwayAfterWeeks: runwayAfter.weeks,
        runwayAfterInfinite: runwayAfter.infinite,
      })
    }
  }

  if (requiredRole === null) {
    const rosterSentence = actorProgress.extra > 0
      ? 'The roster includes a reserve Actor for two-picture continuity. '
      : ''
    const fields: Omit<AvailableIntent, 'intentId'> = {
      kind: 'foundStudio',
      label: 'START A STUDIO',
      detail:
        `Founding coverage: ${progress.map((entry) =>
          `${entry.label} ${String(entry.count)}/${String(entry.min)}`).join('; ')}. ` +
        `Weekly payroll ${exactDollars(payrollSummary(state).weeklyPayroll)}; recruitment fund ` +
        `${exactDollars(foundingBudgetRemaining(state))}; projected runway ` +
        `${foundingRunwayLabel(state)}. ${rosterSentence}Accepting opens the operational studio lot.`,
        projectId: null,
        castingSessionId: null,
        productionId: null,
    }
    pushIfAccepted(state, resolved, {
      option: option(stateDigest, fields, { kind: 'foundManagedStudio' }),
      apply: (current) => foundManagedStudioAction(current),
    })
  }

  const projectedRunway = foundingRunwayPreview(state)
  // The signed roster, in signing order — the engine's contracts joined to
  // its own talent records. A missing talent record is a structural fault;
  // fail closed to the id rather than inventing a name.
  const signed = state.contracts.map((contract) => {
    const talent = findTalent(state, contract.talentId)
    return {
      name: talent?.name ?? contract.talentId,
      roleLabel: talent === undefined ? 'unknown' : foundingRoleLabel(talent.role),
    }
  })
  const projection: BridgeFoundingSnapshot = {
    waveRole: offerRole,
    waveRoleLabel: offerRole === null ? null : foundingRoleLabel(offerRole),
    waveReserve: reserveWave,
    arrivals,
    signed,
    progress: progress.map((entry) => ({
      role: entry.role,
      label: entry.label,
      count: entry.count,
      min: entry.min,
      met: entry.met,
    })),
    recruitmentFund: foundingBudgetRemaining(state),
    projectedWeeklyPayroll: payrollSummary(state).weeklyPayroll,
    projectedRunwayWeeks: projectedRunway.weeks,
    projectedRunwayInfinite: projectedRunway.infinite,
    readyToFound: requiredRole === null,
  }
  return { intents: resolved, projection }
}

function treasuryOf(state: GameState): BridgeTreasurySnapshot {
  const finance = financeCard(state)
  return {
    cash: finance.cash,
    weeklyBurn: finance.weeklyBurn,
    weeklyPayroll: finance.weeklyPayroll,
    netWeeklyCash: finance.netWeeklyCash,
    runwayWeeks: finance.runway.weeks,
    runwayInfinite: finance.runway.infinite,
  }
}

function resolveAvailableIntents(state: GameState): IntentApplication[] {
  const stateDigest = authoritativeDigest(state)
  const founding = resolveFounding(state, stateDigest)
  if (founding !== null) return founding.intents
  const snapshot = studioLotSnapshot(state)
  const journey = snapshot.firstFilmJourney
  if (journey === undefined) throw new Error('Current studio lot snapshot omitted firstFilmJourney.')
  const resolved: IntentApplication[] = []
  const board = scriptProjectsBoard(state)
  const castingProjects = allCastingProjects(state)
  const queuedCommissionConceptIds = new Set(
    state.productionQueue.flatMap((entry) =>
      entry.kind === 'commissionScript' ? [entry.payload.conceptId] : [],
    ),
  )
  const queuedCommissionWriterIds = new Set(
    state.productionQueue.flatMap((entry) =>
      entry.kind === 'commissionScript' || entry.kind === 'commissionOriginalScreenplay'
        ? [entry.payload.writerId]
        : [],
    ),
  )
  const queuedCastingProjectIds = new Set(
    state.productionQueue.flatMap((entry) =>
      entry.kind === 'startCastingSession' ? [entry.payload.projectId] : [],
    ),
  )
  const queuedGreenlightProjectIds = new Set(
    state.productionQueue.flatMap((entry) =>
      entry.kind === 'greenlightScriptProject' ? [entry.scriptProjectId] : [],
    ),
  )

  const construction = studioDevelopment(state)
  if (construction.canStart) {
    const fields: Omit<AvailableIntent, 'intentId'> = {
      kind: 'startConstruction',
      label: `Start ${construction.name}`,
      detail: construction.consequence,
      projectId: null,
      castingSessionId: null,
      productionId: null,
    }
    resolved.push({
      option: option(stateDigest, fields, { kind: 'startDevelopmentCastingAnnex' }),
      apply: (current) => startDevelopmentCastingAnnexAction(current),
    })
  }

  // Front-door choices are independent of the one guided picture. The read model
  // says what is actionable; the discarded preflight lets the authoritative action
  // distinguish the one queueable capacity refusal from every real illegality.
  const commissionCapacityOnly = hasOnlyQueueableCapacityBlockers(board.commission.blockers)
  const concept = board.commission.concepts.find(
    (candidate) => !queuedCommissionConceptIds.has(candidate.id),
  )
  const writer = board.commission.writers.find(
    (candidate) =>
      candidate.available &&
      candidate.primaryRole === 'writer' &&
      !queuedCommissionWriterIds.has(candidate.id),
  )
  if (
    (board.commission.canStart || commissionCapacityOnly) &&
    concept !== undefined &&
    writer !== undefined
  ) {
    const payload = {
      conceptId: concept.id,
      writerId: writer.id,
      shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' } as const,
      promise: {
        genre: concept.genre,
        intendedSegments: ['adult', 'prestige'] as Array<'adult' | 'prestige'>,
        ranges: {
          intimacy: [-0.4, 0.6] as [number, number],
          tonalWeight: [0, 0.8] as [number, number],
          kineticEnergy: [-0.7, 0.2] as [number, number],
        },
      },
    }
    const capacityDetail = commissionCapacityOnly
      ? board.commission.blockers[0]?.detail ?? ''
      : ''
    const fields: Omit<AvailableIntent, 'intentId'> = {
      kind: 'commissionScreenplay',
      label:
        journey.next?.kind === 'commission'
          ? journey.next.label
          : `Commission ${concept.title}`,
      detail: commissionCapacityOnly
        ? `${concept.title} · ${writer.name}. If accepted, this commission joins the ` +
          `Development & Casting queue and holds nothing until revalidation. ${capacityDetail}`
        : `${concept.title} · ${writer.name} · ${board.commission.consequence}`,
      projectId: null,
      castingSessionId: null,
      productionId: null,
    }
    pushIfAccepted(state, resolved, {
      option: option(stateDigest, fields, { kind: 'commissionScript', payload }),
      apply: (current) => commissionScriptAction(current, payload),
    })
  }

  for (const project of castingProjects) {
    if (
      queuedCastingProjectIds.has(project.projectId) ||
      !project.legalActions.some((action) => action.kind === 'planAuditions')
    ) continue
    // This is a fixed bootstrap player choice, not a legality rule. Prefer the public
    // read model's contract-backed availability presentation so a one-week camera test
    // does not knowingly rely on a transient freelancer-market appearance.
    const candidates = project.candidates.lead
      .filter((candidate) => candidate.available)
      .map((candidate, ordinal) => ({ candidate, ordinal }))
      .sort((left, right) => {
        const leftContracted = left.candidate.availabilityLabel.startsWith('Studio-contracted')
        const rightContracted = right.candidate.availabilityLabel.startsWith('Studio-contracted')
        return leftContracted === rightContracted
          ? left.ordinal - right.ordinal
          : leftContracted ? -1 : 1
      })
      .slice(0, 3)
      .map(({ candidate }) => candidate)
    if (candidates.length !== 3) continue
    const payload = {
      projectId: project.projectId,
      slate: {
        lead: [candidates[0]!.id, candidates[1]!.id] as [string, string],
        antagonist: [candidates[0]!.id, candidates[2]!.id] as [string, string],
        support: [candidates[1]!.id, candidates[2]!.id] as [string, string],
      },
    }
    const fields: Omit<AvailableIntent, 'intentId'> = {
      kind: 'startAuditions',
      label:
        journey.next?.kind === 'plan-auditions' && journey.scriptProjectId === project.projectId
          ? journey.next.label
          : `Plan auditions for ${project.title}`,
      detail:
        `Camera-test slate: ${candidates.map((candidate) => candidate.name).join(', ')}.` +
        (project.blockers.length === 0 ? '' : ` ${project.blockers.join(' ')}`),
      projectId: project.projectId,
      castingSessionId: null,
      productionId: null,
    }
    pushIfAccepted(state, resolved, {
      option: option(stateDigest, fields, { kind: 'startCastingSession', payload }),
      apply: (current) => startCastingSessionAction(current, payload),
    })
  }

  for (const packageView of board.packages) {
    if (queuedGreenlightProjectIds.has(packageView.projectId)) continue
    const capacityOnly = hasOnlyQueueableCapacityBlockers(packageView.availability.blockers)
    if (
      packageView.openAction === null ||
      (!packageView.availability.knownGatesClear && !capacityOnly)
    ) continue
    const casts = castsFromReviewedAuditions(state, packageView.projectId)
    const director = studioPool(state, 'director').find((candidate) => candidate.available)
    const craft = studioPool(state, 'craft').find((candidate) => candidate.available)
    const packageConcept = findConcept(state, packageView.concept.id)
    if (
      casts.length === 0 || director === undefined || craft === undefined || packageConcept === undefined
    ) continue
    const capacityDetail = capacityOnly ? packageView.availability.blockers[0]?.detail ?? '' : ''
    for (const cast of casts) {
      const pkg: DraftPackage = {
        conceptId: packageView.concept.id,
        shape: packageView.lockedShape,
        promise: packageView.lockedPromise,
        writerId: packageView.writer.id,
        directorId: director.id,
        craftIds: [craft.id],
        cast: {
          lead: cast.lead.talentId,
          antagonist: cast.antagonist.talentId,
          support: cast.support.talentId,
        },
        budget: {
          negative: requiredNegative(packageConcept, packageView.lockedShape, state),
          marketing: 0,
        },
      }
      const fields: Omit<AvailableIntent, 'intentId'> = {
        kind: 'greenlightPicture',
        label:
          `Lead ${cast.lead.name} / Antagonist ${cast.antagonist.name} / ` +
          `Support ${cast.support.name} - greenlight ${packageView.concept.title}`,
        detail:
          `${auditionEvidenceLine('Lead', cast.lead)} ` +
          `${auditionEvidenceLine('Antagonist', cast.antagonist)} ` +
          `${auditionEvidenceLine('Support', cast.support)} ` +
          `Director ${director.name}; Production/Craft ${craft.name}.` +
          (capacityDetail === '' ? '' : ` ${capacityDetail}`),
        projectId: packageView.projectId,
        castingSessionId: cast.sessionId,
        productionId: null,
      }
      pushIfAccepted(state, resolved, {
        option: option(stateDigest, fields, { kind: 'greenlightScriptProject', pkg }),
        apply: (current) => greenlightScriptProject(current, packageView.projectId, pkg),
      })
    }
  }

  const next = journey.next
  if (next === null) return resolved
  if (next.kind === 'commission') return resolved

  // Ready-to-package family: the screenplay is accepted and camera tests have not
  // been planned (`plan-auditions`), the finished package has not been opened
  // (`open-package`), or packaging is blocked (`review-casting-blocker`). The
  // guided next step above still points at Casting — that guidance is untouched —
  // but Living Time's one authoritative clock must not go dead here: a player
  // legitimately wants a week to pass while browsing candidates (weekly
  // freelancer-market rotation), while a queued greenlight ages toward admission,
  // or during the P04A staleness window. The ordinary advanceWeek control is
  // published alongside the casting-oriented intents above, gated by the same
  // decision-pause law every other branch below already honors: nothing publishes
  // while the studio is actually stopped on a decision (`studioDecision`).
  if (
    next.kind === 'plan-auditions' ||
    next.kind === 'open-package' ||
    next.kind === 'review-casting-blocker'
  ) {
    if (studioDecision(state) === null) {
      const fields: Omit<AvailableIntent, 'intentId'> = {
        kind: 'advanceWeek',
        label: 'No action is required this week — advance the week',
        detail: journey.waiting?.reason ?? journey.detail ?? 'Advance the authoritative studio week.',
        projectId: journey.scriptProjectId,
        castingSessionId: null,
        productionId: journey.productionId,
      }
      resolved.push({
        option: option(stateDigest, fields, { kind: 'advanceWeek' }),
        apply: advanceOutcome,
      })
    }
    return resolved
  }

  if (next.kind === 'advance-week') {
    const fields: Omit<AvailableIntent, 'intentId'> = {
      kind: 'advanceWeek',
      label: next.label,
      detail: journey.waiting?.reason ?? journey.detail ?? 'Advance the authoritative studio week.',
      projectId: journey.scriptProjectId,
      castingSessionId: null,
      productionId: journey.productionId,
    }
    resolved.push({
      option: option(stateDigest, fields, { kind: 'advanceWeek' }),
      apply: advanceOutcome,
    })
    return resolved
  }

  if (next.kind === 'script-review' && journey.scriptProjectId !== null) {
    const decision = board.nextDecision
    if (decision?.projectId === journey.scriptProjectId) {
      for (const action of decision.legalActions) {
        const kind = action.kind === 'acceptScript' ? 'acceptScreenplay' : 'requestRewrite'
        const fields: Omit<AvailableIntent, 'intentId'> = {
          kind,
          label: action.label,
          detail: `${decision.title} · ${journey.whyItMatters}`,
          projectId: action.projectId,
          castingSessionId: null,
          productionId: null,
        }
        resolved.push({
          option: option(stateDigest, fields, action),
          apply: (current) => runScriptProjectAction(current, action),
        })
      }
    }
    return resolved
  }

  if (next.kind === 'audition-review' && journey.scriptProjectId !== null) {
    const project = castingProjects.find(
      (candidate) => candidate.projectId === journey.scriptProjectId && candidate.status === 'review',
    )
    const action = project?.legalActions.find(
      (candidate) => candidate.kind === 'acknowledgeCastingSession',
    )
    if (project !== undefined && action?.kind === 'acknowledgeCastingSession') {
      const reads = project.results === null
        ? 0
        : Object.values(project.results).reduce((sum, entries) => sum + entries.length, 0)
      const fields: Omit<AvailableIntent, 'intentId'> = {
        kind: 'acknowledgeAuditions',
        label: action.label,
        detail: `${String(reads)} authoritative camera-test reads reviewed for ${project.title}.`,
        projectId: action.projectId,
        castingSessionId: action.sessionId,
        productionId: null,
      }
      resolved.push({
        option: option(stateDigest, fields, action),
        apply: (current) => acknowledgeCastingSessionAction(current, action.sessionId),
      })
    }
    return resolved
  }

  if (next.kind === 'resolve-production' && journey.productionId !== null) {
    const decision = studioDecision(state)
    if (
      decision?.kind === 'productionDecision' &&
      decision.decision.productionId === journey.productionId &&
      decision.decision.command !== null
    ) {
      const command = decision.decision.command
      const fields: Omit<AvailableIntent, 'intentId'> = {
        kind: 'resolveProductionBlocker',
        label: next.label,
        detail: decision.decision.blocker?.detail ?? decision.decision.statusLabel,
        projectId: journey.scriptProjectId,
        castingSessionId: null,
        productionId: command.productionId,
      }
      resolved.push({
        option: option(stateDigest, fields, command),
        apply: (current) => runProductionCommand(current, command),
      })
    }
  }

  return resolved
}

export function availableIntents(state: GameState): AvailableIntent[] {
  return resolveAvailableIntents(state).map((entry) => entry.option)
}

export function applyAvailableIntent(state: GameState, intentId: string): ActionOutcome {
  const resolved = resolveAvailableIntents(state).find((entry) => entry.option.intentId === intentId)
  return resolved === undefined
    ? { ok: false, error: 'Intent is not available in the current authoritative state.' }
    : caught(() => resolved.apply(state))
}

export function playNextMovieThroughAvailableIntents(
  initial: GameState,
): { state: GameState; played: PlayedIntent[] } {
  let state = initial
  const releasedBefore = state.studio.releasedFilms.length
  const played: PlayedIntent[] = []
  for (let guard = 0; guard < 128; guard++) {
    if (state.studio.releasedFilms.length > releasedBefore) return { state, played }
    const candidates = availableIntents(state).filter((candidate) => candidate.kind !== 'startConstruction')
    const journey = studioLotSnapshot(state).firstFilmJourney
    const selected = selectJourneyIntent(candidates, journey)
    if (selected === undefined) {
      throw new Error(
        `Bridge autoplay found no legal movie intent at Week ${String(state.market.tick)}: ` +
          journey?.headline,
      )
    }
    const beforeWeek = state.market.tick
    const beforeDigest = authoritativeDigest(state)
    state = requireSuccess(applyAvailableIntent(state, selected.intentId), selected.kind)
    played.push({
      option: selected,
      beforeWeek,
      afterWeek: state.market.tick,
      beforeDigest,
      afterDigest: authoritativeDigest(state),
    })
  }
  throw new Error('Bridge autoplay exceeded its bounded Movie release guard.')
}

export function createBridgeBootstrap(seed = 'current-game-unity-adoption-v2'): {
  state: GameState
  movieOneIntents: PlayedIntent[]
} {
  const managed = createManagedBridgeState(seed)
  const movieOne = playNextMovieThroughAvailableIntents(managed)
  return { state: movieOne.state, movieOneIntents: movieOne.played }
}

export function createBridgeInitialState(seed = 'current-game-unity-adoption-v2'): GameState {
  return createBridgeBootstrap(seed).state
}

function rejectionFacts(
  reasonCode: RejectionCode,
): Rejection {
  switch (reasonCode) {
    case 'INVALID_JSON':
      return {
        category: 'request-invalid',
        blocker: 'The request body is not valid JSON.',
        currentHolder: null,
        remedy: 'Reconnect to the local engine. If this repeats, relaunch the documented compatible build and inspect the bridge log.',
      }
    case 'INVALID_COMMAND':
    case 'INVALID_CONTROL':
      return {
        category: 'request-invalid',
        blocker: 'The request does not match the current closed bridge envelope.',
        currentHolder: null,
        remedy: 'Reconnect to the local engine. If this repeats, relaunch the documented compatible build and inspect the bridge log.',
      }
    case 'PROTOCOL_MISMATCH':
    case 'SCHEMA_MISMATCH':
      return {
        category: 'contract-incompatible',
        blocker: 'The client contract is incompatible with the running TypeScript authority.',
        currentHolder: null,
        remedy: 'Stop both local processes and launch the documented compatible Project: Studio engine and client pair.',
      }
    case 'SESSION_MISMATCH':
      return {
        category: 'session-mismatch',
        blocker: 'The request belongs to a different bridge session.',
        currentHolder: null,
        remedy: 'Reconnect to the local engine and retry from the current studio state.',
      }
    case 'STALE_REVISION':
      return {
        category: 'state-stale',
        blocker: 'The authoritative state changed after this command was prepared.',
        currentHolder: null,
        remedy: 'Refresh the studio and try the action again from the current state.',
      }
    case 'COMMAND_ID_REUSE':
      return {
        category: 'command-conflict',
        blocker: 'This commandId is already bound to a different request envelope.',
        currentHolder: null,
        remedy: 'Wait for the original action result. If the interface remains out of sync, reconnect to the local engine.',
      }
    case 'INTENT_NOT_AVAILABLE':
      return {
        category: 'intent-unavailable',
        blocker: 'This exact intent is not available in the current authoritative state.',
        currentHolder: null,
        remedy: 'Refresh the studio and choose one of the actions available in the current state.',
      }
    case 'ENGINE_REJECTED':
      return {
        category: 'authority-refusal',
        blocker: 'The authoritative TypeScript engine refused the submitted intent.',
        currentHolder: null,
        remedy: 'Follow the current blocker guidance, refresh the studio, and try the action again.',
      }
    case 'NO_SAVE':
      return {
        category: 'save-state',
        blocker: 'No authoritative bridge save exists.',
        currentHolder: null,
        remedy: 'Create an authoritative save before requesting a load.',
      }
    case 'SAVE_REJECTED':
      return {
        category: 'save-state',
        blocker: 'The stored authoritative save did not pass TypeScript validation.',
        currentHolder: null,
        remedy: 'Keep the current studio state and load a compatible Project: Studio save.',
      }
  }
}

export class BridgeSession {
  readonly sessionId: string
  private state: GameState
  private revision: number
  /**
   * P03A commission quotes, keyed by minted intentId. Session-transient by
   * design: every entry is digest-bound to the exact state that quoted it, so
   * any accepted command or load invalidates the whole map, and a process
   * restart simply forgets quotes the client must re-request. Never journaled.
   */
  private readonly pendingQuotes = new Map<string, PendingQuote>()
  private readonly processed = new Map<string, RuntimeEntry>()
  private readonly journal: BridgeRuntimeJournalEntryV1[]
  private savedJson: string | null
  private readonly runtimeLimits: BridgeRuntimeCheckpointLimits

  constructor(
    state = createBridgeInitialState(),
    sessionId: string = randomUUID(),
    savedJson: string | null = null,
    runtime: Partial<BridgeSessionRuntimeState> = {},
  ) {
    this.state = state
    this.sessionId = sessionId
    this.savedJson = savedJson
    this.revision = runtime.revision ?? 0
    this.runtimeLimits = runtime.limits ?? DEFAULT_BRIDGE_RUNTIME_CHECKPOINT_LIMITS
    this.journal = []
    for (const hydrated of runtime.journal ?? []) {
      const entry = {
        route: hydrated.route,
        commandId: hydrated.commandId,
        requestJson: hydrated.requestJson,
        responseJson: hydrated.responseJson,
      }
      this.journal.push(entry)
      this.processed.set(entry.commandId, { entry })
    }
  }

  static fromSaveJson(saveJson: string, sessionId: string = randomUUID()): BridgeSession {
    const imported = importSaveJsonV15(saveJson)
    if (!imported.ok) throw new Error(imported.error)
    return new BridgeSession(imported.state, sessionId, exportSaveJson(imported.state))
  }

  static createRuntime(
    limits: BridgeRuntimeCheckpointLimits = DEFAULT_BRIDGE_RUNTIME_CHECKPOINT_LIMITS,
  ): BridgeSession {
    return new BridgeSession(newGame('current-game-unity-adoption-v2'), undefined, null, { limits })
  }

  static fromRuntimeCheckpoint(
    hydrated: HydratedBridgeRuntimeCheckpoint,
    limits: BridgeRuntimeCheckpointLimits = DEFAULT_BRIDGE_RUNTIME_CHECKPOINT_LIMITS,
  ): BridgeSession {
    const imported = importSaveJsonV15(hydrated.checkpoint.currentSaveJson)
    if (!imported.ok) throw new Error(imported.error)
    return new BridgeSession(
      imported.state,
      hydrated.checkpoint.sessionId,
      hydrated.checkpoint.savedSaveJson,
      {
        revision: hydrated.checkpoint.stateRevision,
        journal: hydrated.journal,
        limits,
      },
    )
  }

  get stateRevision(): number { return this.revision }
  get gameState(): GameState { return this.state }
  get runtimeJournalSize(): number { return this.journal.length }

  snapshot(): SnapshotEnvelope {
    return this.snapshotFor(this.state, this.revision)
  }

  exportRuntimeCheckpoint(): BridgeRuntimeCheckpointV1 {
    return createBridgeRuntimeCheckpoint({
      sessionId: this.sessionId,
      stateRevision: this.revision,
      currentSaveJson: exportSaveJson(this.state),
      savedSaveJson: this.savedJson,
      journal: this.journal,
    }, this.runtimeLimits)
  }

  rolloverRuntime(
    limits: BridgeRuntimeCheckpointLimits = this.runtimeLimits,
  ): BridgeSession {
    const currentSaveJson = exportSaveJson(this.state)
    const imported = importSaveJsonV15(currentSaveJson)
    if (!imported.ok) throw new Error(imported.error)
    return new BridgeSession(imported.state, randomUUID(), this.savedJson, { limits })
  }

  private snapshotFor(state: GameState, revision: number): SnapshotEnvelope {
    const started = performance.now()
    // P03A/P04A: the Development and Casting boards ride the broad selector
    // result into the bundle at the bridge boundary, so the browser's own
    // snapshot stays untouched.
    const snapshot = projectStudioProjectionBundle({
      ...studioLotSnapshot(state),
      development: developmentProjection(state),
      casting: castingProjection(state),
    })
    const stateDigest = authoritativeDigest(state)
    // One founding resolution serves both surfaces, so an arrival's intentId can
    // never disagree with the availableIntents list of the same envelope.
    const founding = resolveFounding(state, stateDigest)
    const intents = founding === null
      ? availableIntents(state)
      : founding.intents.map((entry) => entry.option)
    const partial = {
      protocolVersion: PROTOCOL_VERSION,
      schemaId: SCHEMA_ID,
      snapshotVersion: SNAPSHOT_VERSION,
      sessionId: this.sessionId,
      stateRevision: revision,
      gameWeek: state.market.tick,
      stateDigest,
      snapshot,
      founding: founding === null ? null : founding.projection,
      treasury: treasuryOf(state),
      availableIntents: intents,
    }
    const serializationMs = performance.now() - started
    const payloadBytes = Buffer.byteLength(JSON.stringify(partial), 'utf8')
    return { ...partial, metrics: { payloadBytes, serializationMs } }
  }

  command(command: SubmitIntentCommand): CommandResponse {
    const started = performance.now()
    if (command.sessionId !== this.sessionId) {
      return this.reject(command.commandId, 'SESSION_MISMATCH', 'Command belongs to a different bridge session.', started)
    }
    const prior = this.priorResponse('command', command, started)
    if (prior !== null) return prior as CommandResponse
    if (command.expectedStateRevision !== this.revision) {
      const rejected = this.reject(
        command.commandId,
        'STALE_REVISION',
        `Intent expected revision ${String(command.expectedStateRevision)}; authority is revision ${String(this.revision)}.`,
        started,
      )
      this.remember('command', command, rejected)
      return rejected
    }
    const resolved =
      resolveAvailableIntents(this.state).find(
        (candidate) => candidate.option.intentId === command.payload.intentId,
      ) ?? this.quotedIntentFor(command.payload.intentId)
    if (resolved === undefined) {
      const rejected = this.reject(
        command.commandId,
        'INTENT_NOT_AVAILABLE',
        'Intent was not emitted by the current authoritative TypeScript state.',
        started,
      )
      this.remember('command', command, rejected)
      return rejected
    }
    const before = this.state
    const outcome = caught(() => resolved.apply(before))
    if (!outcome.ok) {
      const rejected = this.reject(command.commandId, 'ENGINE_REJECTED', outcome.error, started)
      this.remember('command', command, rejected)
      return rejected
    }
    const nextRevision = this.revision + 1
    const accepted: AcceptedCommandResponse = {
      ...this.snapshotFor(outcome.next, nextRevision),
      commandId: command.commandId,
      accepted: true,
      message: acceptedIntentMessage(resolved.option.label, before, outcome.next),
      processingMs: performance.now() - started,
    }
    const entry = this.prepareEntry(
      'command',
      command,
      accepted,
      outcome.next,
      nextRevision,
      this.savedJson,
    )
    this.state = outcome.next
    this.revision = nextRevision
    // Every quote was digest-bound to the state this command just replaced.
    this.pendingQuotes.clear()
    this.commitEntry(entry)
    return accepted
  }

  /**
   * Resolve a quote-minted commission OR casting intent. The quote is honored
   * only against the EXACT state that minted it (digest equality on top of the
   * revision guard the caller already passed); the draft is re-converted
   * against the live board so the engine's own front doors decide legality at
   * commit time. C# never sees or constructs the payload.
   */
  private quotedIntentFor(intentId: string): IntentApplication | undefined {
    const pending = this.pendingQuotes.get(intentId)
    if (pending === undefined) return undefined
    if (pending.stateDigest !== authoritativeDigest(this.state)) return undefined
    const fields = {
      kind: pending.kind,
      label: pending.commitLabel,
      detail: '',
      projectId: pending.family === 'casting' ? pending.draft.projectId : null,
      castingSessionId: null,
      productionId: null,
    } as const
    const conversion = pending.family === 'commission'
      ? draftToEngine(this.state, pending.draft)
      : castingDraftToEngine(this.state, pending.draft)
    if (!conversion.ok) {
      return {
        option: { intentId, ...fields },
        apply: () => ({ ok: false, error: conversion.error }),
      }
    }
    return { option: { intentId, ...fields }, apply: conversion.apply }
  }

  /** Session-mismatch/stale-revision envelope guard shared by both quote families. */
  private quoteGuard(
    request: { sessionId: string; commandId: string; expectedStateRevision: number },
    started: number,
  ): RejectedResponse | null {
    if (request.sessionId !== this.sessionId) {
      return this.reject(
        request.commandId,
        'SESSION_MISMATCH',
        'Quote belongs to a different bridge session.',
        started,
      )
    }
    if (request.expectedStateRevision !== this.revision) {
      return this.reject(
        request.commandId,
        'STALE_REVISION',
        `Quote expected revision ${String(request.expectedStateRevision)}; authority is revision ${String(this.revision)}.`,
        started,
      )
    }
    return null
  }

  /** A small bound keeps an abandoned workspace from growing the map; the oldest quote is the least likely to be committed. */
  private capPendingQuotes(): void {
    if (this.pendingQuotes.size > 16) {
      const oldest = this.pendingQuotes.keys().next().value
      if (oldest !== undefined) this.pendingQuotes.delete(oldest)
    }
  }

  private mintQuoteResponse<TQuote>(
    request: { commandId: string },
    started: number,
    stateDigest: string,
    quote: TQuote,
  ): AcceptedQuoteResponseFor<TQuote> {
    return {
      protocolVersion: PROTOCOL_VERSION,
      schemaId: SCHEMA_ID,
      sessionId: this.sessionId,
      commandId: request.commandId,
      accepted: true,
      stateRevision: this.revision,
      gameWeek: this.state.market.tick,
      stateDigest,
      quote,
      processingMs: performance.now() - started,
    }
  }

  /**
   * Validate a commission or casting draft against the live state, mint the
   * ONE opaque commit intent, and answer with the TypeScript-authored
   * consequence summary. A quote mutates nothing — the revision is unchanged,
   * nothing is journaled, and the preflight successor is discarded whole.
   * Dispatches on `request.type`; overloaded so a caller that already knows
   * which family it asked for gets that family's quote type back narrowed,
   * with no cast.
   */
  quote(request: BridgeQuoteCommissionRequest): AcceptedQuoteResponseFor<BridgeCommissionQuoteSnapshot> | RejectedResponse
  quote(request: BridgeQuoteCastingRequest): AcceptedQuoteResponseFor<BridgeCastingQuoteSnapshot> | RejectedResponse
  quote(request: BridgeQuoteRequest): QuoteResponse
  quote(request: BridgeQuoteRequest): QuoteResponse {
    const started = performance.now()
    const guarded = this.quoteGuard(request, started)
    if (guarded !== null) return guarded

    if (request.type === 'quoteCommission') {
      const conversion = draftToEngine(this.state, request.draft)
      if (!conversion.ok) {
        return this.reject(request.commandId, 'ENGINE_REJECTED', conversion.error, started)
      }
      const preflight = caught(() => conversion.apply(this.state))
      if (!preflight.ok) {
        return this.reject(request.commandId, 'ENGINE_REJECTED', preflight.error, started)
      }
      const stateDigest = authoritativeDigest(this.state)
      const intentId = opaqueIntentId(stateDigest, { commissionDraft: request.draft })
      const quote = commissionQuoteSnapshot(
        this.state,
        request.draft,
        conversion,
        preflight.next,
        intentId,
      )
      this.pendingQuotes.set(intentId, {
        family: 'commission',
        draft: request.draft,
        stateDigest,
        kind: conversion.kind,
        commitLabel: quote.commitLabel,
      })
      this.capPendingQuotes()
      return this.mintQuoteResponse(request, started, stateDigest, quote)
    }

    const conversion = castingDraftToEngine(this.state, request.draft)
    if (!conversion.ok) {
      return this.reject(request.commandId, 'ENGINE_REJECTED', conversion.error, started)
    }
    const preflight = caught(() => conversion.apply(this.state))
    if (!preflight.ok) {
      return this.reject(request.commandId, 'ENGINE_REJECTED', preflight.error, started)
    }
    const stateDigest = authoritativeDigest(this.state)
    const intentId = opaqueIntentId(stateDigest, { castingDraft: request.draft })
    const quote = castingQuoteSnapshot(
      this.state,
      request.draft,
      conversion,
      preflight.next,
      intentId,
    )
    this.pendingQuotes.set(intentId, {
      family: 'casting',
      draft: request.draft,
      stateDigest,
      kind: conversion.kind,
      commitLabel: quote.commitLabel,
    })
    this.capPendingQuotes()
    return this.mintQuoteResponse(request, started, stateDigest, quote)
  }

  save(control: ControlEnvelope): SaveResponse {
    const started = performance.now()
    const guarded = this.guardControl('save', control, started)
    if (guarded !== null) return guarded as SaveResponse
    const savedJson = exportSaveJson(this.state)
    const accepted: AcceptedSaveResponse = {
      protocolVersion: PROTOCOL_VERSION,
      schemaId: SCHEMA_ID,
      sessionId: this.sessionId,
      commandId: control.commandId,
      accepted: true,
      message: 'Authoritative TypeScript save captured.',
      stateRevision: this.revision,
      gameWeek: this.state.market.tick,
      stateDigest: authoritativeDigest(this.state),
      saveJson: savedJson,
      processingMs: performance.now() - started,
    }
    const entry = this.prepareEntry(
      'save',
      control,
      accepted,
      this.state,
      this.revision,
      savedJson,
    )
    this.savedJson = savedJson
    this.commitEntry(entry)
    return accepted
  }

  load(control: ControlEnvelope): CommandResponse {
    const started = performance.now()
    const guarded = this.guardControl('load', control, started)
    if (guarded !== null) return guarded as CommandResponse
    if (this.savedJson === null) {
      const rejected = this.reject(control.commandId, 'NO_SAVE', 'No authoritative bridge save exists.', started)
      this.remember('load', control, rejected)
      return rejected
    }
    const loaded = importSaveJsonV15(this.savedJson)
    if (!loaded.ok) {
      const rejected = this.reject(control.commandId, 'SAVE_REJECTED', loaded.error, started)
      this.remember('load', control, rejected)
      return rejected
    }
    const nextRevision = this.revision + 1
    const accepted: AcceptedCommandResponse = {
      ...this.snapshotFor(loaded.state, nextRevision),
      commandId: control.commandId,
      accepted: true,
      message: loaded.converted
        ? 'Authoritative save loaded and migrated by TypeScript.'
        : 'Authoritative TypeScript save loaded.',
      processingMs: performance.now() - started,
    }
    const entry = this.prepareEntry(
      'load',
      control,
      accepted,
      loaded.state,
      nextRevision,
      this.savedJson,
    )
    this.state = loaded.state
    this.revision = nextRevision
    // Loading replaces the state every pending quote was digest-bound to.
    this.pendingQuotes.clear()
    this.commitEntry(entry)
    return accepted
  }

  protocolReject(
    commandId: string | null,
    reasonCode: RejectionCode,
    message: string,
    started = performance.now(),
  ): RejectedResponse {
    return this.reject(commandId, reasonCode, message, started)
  }

  private guardControl(
    route: 'save' | 'load',
    control: ControlEnvelope,
    started: number,
  ): CachedResponse | null {
    if (control.sessionId !== this.sessionId) {
      return this.reject(control.commandId, 'SESSION_MISMATCH', 'Control belongs to a different bridge session.', started)
    }
    const prior = this.priorResponse(route, control, started)
    if (prior !== null) return prior
    if (control.expectedStateRevision !== this.revision) {
      const rejected = this.reject(
        control.commandId,
        'STALE_REVISION',
        `Control expected revision ${String(control.expectedStateRevision)}; authority is revision ${String(this.revision)}.`,
        started,
      )
      if (route === 'save') this.remember('save', control, rejected)
      else this.remember('load', control, rejected)
      return rejected
    }
    return null
  }

  private reject(
    commandId: string | null,
    reasonCode: RejectionCode,
    message: string,
    started: number,
  ): RejectedResponse {
    const diagnosticMessage = message.trim().length === 0
      ? 'The TypeScript authority rejected the request.'
      : message
    return {
      protocolVersion: PROTOCOL_VERSION,
      schemaId: SCHEMA_ID,
      sessionId: this.sessionId,
      commandId,
      accepted: false,
      reasonCode,
      rejection: rejectionFacts(reasonCode),
      message: diagnosticMessage,
      stateRevision: this.revision,
      gameWeek: this.state.market.tick,
      stateDigest: authoritativeDigest(this.state),
      processingMs: performance.now() - started,
    }
  }

  private priorResponse(
    route: BridgeRuntimeJournalRoute,
    request: SubmitIntentCommand | ControlEnvelope,
    started: number,
  ): CachedResponse | null {
    const prior = this.processed.get(request.commandId)
    if (prior === undefined) return null
    if (prior.entry.route !== route || prior.entry.requestJson !== canonicalJson(request)) {
      return this.reject(
        request.commandId,
        'COMMAND_ID_REUSE',
        'commandId was already used for a different envelope.',
        started,
      )
    }
    return JSON.parse(prior.entry.responseJson) as CachedResponse
  }

  private remember(
    route: 'command',
    request: SubmitIntentCommand,
    response: CommandResponse,
  ): void
  private remember(
    route: 'save',
    request: ControlEnvelope,
    response: SaveResponse,
  ): void
  private remember(
    route: 'load',
    request: ControlEnvelope,
    response: CommandResponse,
  ): void
  private remember(
    route: BridgeRuntimeJournalRoute,
    request: SubmitIntentCommand | ControlEnvelope,
    response: CachedResponse,
  ): void {
    const entry = this.prepareEntry(
      route,
      request,
      response,
      this.state,
      this.revision,
      this.savedJson,
    )
    this.commitEntry(entry)
  }

  private prepareEntry(
    route: BridgeRuntimeJournalRoute,
    request: SubmitIntentCommand | ControlEnvelope,
    response: CachedResponse,
    nextState: GameState,
    nextRevision: number,
    nextSavedJson: string | null,
  ): BridgeRuntimeJournalEntryV1 {
    let entry: BridgeRuntimeJournalEntryV1
    if (route === 'command') {
      entry = createBridgeRuntimeJournalEntry(
        route,
        request as SubmitIntentCommand,
        response as CommandResponse,
      )
    } else if (route === 'save') {
      entry = createBridgeRuntimeJournalEntry(
        route,
        request as ControlEnvelope,
        response as SaveResponse,
      )
    } else {
      entry = createBridgeRuntimeJournalEntry(
        route,
        request as ControlEnvelope,
        response as CommandResponse,
      )
    }
    const checkpointInput = {
      sessionId: this.sessionId,
      stateRevision: nextRevision,
      currentSaveJson: exportSaveJson(nextState),
      savedSaveJson: nextSavedJson,
    }
    let prospective: BridgeRuntimeCheckpointV1
    try {
      prospective = createBridgeRuntimeCheckpoint({
        ...checkpointInput,
        journal: [...this.journal, entry],
      }, this.runtimeLimits)
    } catch (error) {
      if (!(error instanceof BridgeRuntimeCheckpointCapacityError) || this.journal.length === 0) {
        throw error
      }

      // Only history pressure is recoverable by rollover. Prove the candidate fits alone first.
      createBridgeRuntimeCheckpoint({
        ...checkpointInput,
        journal: [entry],
      }, this.runtimeLimits)
      throw new BridgeRuntimeCheckpointHistoryFullError(error)
    }
    return prospective.journal[prospective.journal.length - 1]!
  }

  private commitEntry(entry: BridgeRuntimeJournalEntryV1): void {
    this.journal.push(entry)
    this.processed.set(entry.commandId, { entry })
  }
}
