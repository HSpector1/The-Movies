import { createHash, randomUUID } from 'node:crypto'
import { performance } from 'node:perf_hooks'

import {
  acknowledgeCastingSessionAction,
  advanceWeek,
  castingSessionsBoard,
  commissionScriptAction,
  exportSaveJson,
  findConcept,
  foundManagedStudioAction,
  foundingApplicantCards,
  greenlightScriptProject,
  importSaveJson,
  newGame,
  nextIncompleteProfession,
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
  GameState,
} from '../ui/src/engine/adapter.ts'
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
  BridgeRejectedResponse,
  BridgeSnapshotEnvelope,
} from './schema/bridge-schema.ts'
import { projectStudioProjectionBundle } from './schema/runtime.ts'

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

function castFromReviewedAuditions(state: GameState, projectId: string) {
  const project = allCastingProjects(state).find((candidate) => candidate.projectId === projectId)
  if (project?.results === null || project?.results === undefined) return null
  const used = new Set<string>()
  const pick = (slot: 'lead' | 'antagonist' | 'support'): { id: string; name: string } | null => {
    const candidate = project.results?.[slot].find(
      (entry) => entry.available && !used.has(entry.talentId),
    )
    if (candidate === undefined) return null
    used.add(candidate.talentId)
    return { id: candidate.talentId, name: candidate.name }
  }
  const lead = pick('lead')
  const antagonist = pick('antagonist')
  const support = pick('support')
  return lead === null || antagonist === null || support === null
    ? null
    : { lead, antagonist, support, sessionId: project.sessionId }
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

function resolveAvailableIntents(state: GameState): IntentApplication[] {
  const stateDigest = authoritativeDigest(state)
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
    const cast = castFromReviewedAuditions(state, packageView.projectId)
    const director = studioPool(state, 'director').find((candidate) => candidate.available)
    const craft = studioPool(state, 'craft').find((candidate) => candidate.available)
    const packageConcept = findConcept(state, packageView.concept.id)
    if (
      cast === null || director === undefined || craft === undefined || packageConcept === undefined
    ) continue
    const pkg: DraftPackage = {
      conceptId: packageView.concept.id,
      shape: packageView.lockedShape,
      promise: packageView.lockedPromise,
      writerId: packageView.writer.id,
      directorId: director.id,
      craftIds: [craft.id],
      cast: {
        lead: cast.lead.id,
        antagonist: cast.antagonist.id,
        support: cast.support.id,
      },
      budget: {
        negative: requiredNegative(packageConcept, packageView.lockedShape, state),
        marketing: 0,
      },
    }
    const capacityDetail = capacityOnly ? packageView.availability.blockers[0]?.detail ?? '' : ''
    const fields: Omit<AvailableIntent, 'intentId'> = {
      kind: 'greenlightPicture',
      label: `Greenlight ${packageView.concept.title}`,
      detail:
        `Director ${director.name}; Lead ${cast.lead.name}; Antagonist ${cast.antagonist.name}; ` +
        `Support ${cast.support.name}; Production/Craft ${craft.name}.` +
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

  const next = journey.next
  if (next === null) return resolved
  if (
    next.kind === 'commission' ||
    next.kind === 'plan-auditions' ||
    next.kind === 'open-package'
  ) return resolved

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
    const imported = importSaveJson(saveJson)
    if (!imported.ok) throw new Error(imported.error)
    return new BridgeSession(imported.state, sessionId, exportSaveJson(imported.state))
  }

  static createRuntime(
    limits: BridgeRuntimeCheckpointLimits = DEFAULT_BRIDGE_RUNTIME_CHECKPOINT_LIMITS,
  ): BridgeSession {
    return new BridgeSession(undefined, undefined, null, { limits })
  }

  static fromRuntimeCheckpoint(
    hydrated: HydratedBridgeRuntimeCheckpoint,
    limits: BridgeRuntimeCheckpointLimits = DEFAULT_BRIDGE_RUNTIME_CHECKPOINT_LIMITS,
  ): BridgeSession {
    const imported = importSaveJson(hydrated.checkpoint.currentSaveJson)
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
    const imported = importSaveJson(currentSaveJson)
    if (!imported.ok) throw new Error(imported.error)
    return new BridgeSession(imported.state, randomUUID(), this.savedJson, { limits })
  }

  private snapshotFor(state: GameState, revision: number): SnapshotEnvelope {
    const started = performance.now()
    const snapshot = projectStudioProjectionBundle(studioLotSnapshot(state))
    const intents = availableIntents(state)
    const partial = {
      protocolVersion: PROTOCOL_VERSION,
      schemaId: SCHEMA_ID,
      snapshotVersion: SNAPSHOT_VERSION,
      sessionId: this.sessionId,
      stateRevision: revision,
      gameWeek: state.market.tick,
      stateDigest: authoritativeDigest(state),
      snapshot,
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
    const resolved = resolveAvailableIntents(this.state).find(
      (candidate) => candidate.option.intentId === command.payload.intentId,
    )
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
    this.commitEntry(entry)
    return accepted
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
    const loaded = importSaveJson(this.savedJson)
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
