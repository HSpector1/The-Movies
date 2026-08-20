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
  type AvailableIntentKind,
  type ControlEnvelope,
  type RejectionCode,
  type SubmitIntentCommand,
} from './protocol.ts'
import type {
  BridgeAcceptedCommandResponse,
  BridgeAcceptedSaveResponse,
  BridgeRejectedResponse,
  BridgeSnapshotEnvelope,
} from './schema/bridge-schema.ts'
import { projectStudioLotSnapshot } from './schema/runtime.ts'

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

export type PlayedIntent = {
  option: AvailableIntent
  beforeWeek: number
  afterWeek: number
  beforeDigest: string
  afterDigest: string
}

const AUTOMATED_INTENT_PRIORITY: readonly AvailableIntentKind[] = [
  'commissionScreenplay',
  'advanceWeek',
  'acceptScreenplay',
  'startAuditions',
  'acknowledgeAuditions',
  'greenlightPicture',
  'resolveProductionBlocker',
] as const

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
  return `intent-v2-${createHash('sha256')
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

function resolveAvailableIntents(state: GameState): IntentApplication[] {
  const stateDigest = authoritativeDigest(state)
  const snapshot = studioLotSnapshot(state)
  const journey = snapshot.firstFilmJourney
  if (journey === undefined) throw new Error('Current studio lot snapshot omitted firstFilmJourney.')
  const resolved: IntentApplication[] = []

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

  const next = journey.next
  if (next === null) return resolved

  if (next.kind === 'commission') {
    const board = scriptProjectsBoard(state)
    const concept = board.commission.concepts[0]
    const writer = board.commission.writers.find(
      (candidate) => candidate.available && candidate.primaryRole === 'writer',
    )
    if (board.commission.canStart && concept !== undefined && writer !== undefined) {
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
      const fields: Omit<AvailableIntent, 'intentId'> = {
        kind: 'commissionScreenplay',
        label: next.label,
        detail: `${concept.title} · ${writer.name} · ${board.commission.consequence}`,
        projectId: null,
        castingSessionId: null,
        productionId: null,
      }
      resolved.push({
        option: option(stateDigest, fields, { kind: 'commissionScript', payload }),
        apply: (current) => commissionScriptAction(current, payload),
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
    const board = scriptProjectsBoard(state)
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

  if (next.kind === 'plan-auditions' && journey.scriptProjectId !== null) {
    const project = allCastingProjects(state).find(
      (candidate) => candidate.projectId === journey.scriptProjectId &&
        candidate.legalActions.some((action) => action.kind === 'planAuditions'),
    )
    if (project !== undefined) {
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
      if (candidates.length === 3) {
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
          label: next.label,
          detail: `Camera-test slate: ${candidates.map((candidate) => candidate.name).join(', ')}.`,
          projectId: project.projectId,
          castingSessionId: null,
          productionId: null,
        }
        resolved.push({
          option: option(stateDigest, fields, { kind: 'startCastingSession', payload }),
          apply: (current) => startCastingSessionAction(current, payload),
        })
      }
    }
    return resolved
  }

  if (next.kind === 'audition-review' && journey.scriptProjectId !== null) {
    const project = allCastingProjects(state).find(
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

  if (next.kind === 'open-package' && journey.scriptProjectId !== null) {
    const board = scriptProjectsBoard(state)
    const packageView = board.packages.find(
      (candidate) => candidate.projectId === journey.scriptProjectId &&
        candidate.openAction !== null && candidate.availability.knownGatesClear,
    )
    const cast = castFromReviewedAuditions(state, journey.scriptProjectId)
    const director = studioPool(state, 'director').find((candidate) => candidate.available)
    const craft = studioPool(state, 'craft').find((candidate) => candidate.available)
    const concept = packageView === undefined ? undefined : findConcept(state, packageView.concept.id)
    if (
      packageView !== undefined && cast !== null && director !== undefined &&
      craft !== undefined && concept !== undefined
    ) {
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
          negative: requiredNegative(concept, packageView.lockedShape, state),
          marketing: 0,
        },
      }
      const fields: Omit<AvailableIntent, 'intentId'> = {
        kind: 'greenlightPicture',
        label: `Greenlight ${packageView.concept.title}`,
        detail:
          `Director ${director.name}; Lead ${cast.lead.name}; Antagonist ${cast.antagonist.name}; ` +
          `Support ${cast.support.name}; Production/Craft ${craft.name}.`,
        projectId: packageView.projectId,
        castingSessionId: cast.sessionId,
        productionId: null,
      }
      resolved.push({
        option: option(stateDigest, fields, { kind: 'greenlightScriptProject', pkg }),
        apply: (current) => greenlightScriptProject(current, packageView.projectId, pkg),
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
    const selected = AUTOMATED_INTENT_PRIORITY
      .map((kind) => candidates.find((candidate) => candidate.kind === kind))
      .find((candidate) => candidate !== undefined)
    if (selected === undefined) {
      throw new Error(
        `Bridge autoplay found no legal movie intent at Week ${String(state.market.tick)}: ` +
          studioLotSnapshot(state).firstFilmJourney?.headline,
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

function fingerprint(route: 'command' | 'save' | 'load', value: SubmitIntentCommand | ControlEnvelope): string {
  return createHash('sha256').update(route).update('\0').update(JSON.stringify(value)).digest('hex')
}

export class BridgeSession {
  readonly sessionId: string
  private state: GameState
  private revision = 0
  private readonly processed = new Map<string, { fingerprint: string; response: CachedResponse }>()
  private savedJson: string | null

  constructor(
    state = createBridgeInitialState(),
    sessionId: string = randomUUID(),
    savedJson: string | null = null,
  ) {
    this.state = state
    this.sessionId = sessionId
    this.savedJson = savedJson
  }

  static fromSaveJson(saveJson: string, sessionId: string = randomUUID()): BridgeSession {
    const imported = importSaveJson(saveJson)
    if (!imported.ok) throw new Error(imported.error)
    return new BridgeSession(imported.state, sessionId, saveJson)
  }

  get stateRevision(): number { return this.revision }
  get gameState(): GameState { return this.state }

  snapshot(): SnapshotEnvelope {
    const started = performance.now()
    const snapshot = projectStudioLotSnapshot(studioLotSnapshot(this.state))
    const intents = availableIntents(this.state)
    const partial = {
      protocolVersion: PROTOCOL_VERSION,
      schemaId: SCHEMA_ID,
      snapshotVersion: SNAPSHOT_VERSION,
      sessionId: this.sessionId,
      stateRevision: this.revision,
      gameWeek: this.state.market.tick,
      stateDigest: authoritativeDigest(this.state),
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
    const key = fingerprint('command', command)
    const prior = this.processed.get(command.commandId)
    if (prior !== undefined) {
      return prior.fingerprint === key
        ? prior.response as CommandResponse
        : this.reject(command.commandId, 'COMMAND_ID_REUSE', 'commandId was already used for a different envelope.', started)
    }
    if (command.expectedStateRevision !== this.revision) {
      const rejected = this.reject(
        command.commandId,
        'STALE_REVISION',
        `Intent expected revision ${String(command.expectedStateRevision)}; authority is revision ${String(this.revision)}.`,
        started,
      )
      this.remember(command.commandId, key, rejected)
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
      this.remember(command.commandId, key, rejected)
      return rejected
    }
    const outcome = caught(() => resolved.apply(this.state))
    if (!outcome.ok) {
      const rejected = this.reject(command.commandId, 'ENGINE_REJECTED', outcome.error, started)
      this.remember(command.commandId, key, rejected)
      return rejected
    }
    this.state = outcome.next
    this.revision++
    const accepted: AcceptedCommandResponse = {
      ...this.snapshot(),
      commandId: command.commandId,
      accepted: true,
      message: resolved.option.label,
      processingMs: performance.now() - started,
    }
    this.remember(command.commandId, key, accepted)
    return accepted
  }

  save(control: ControlEnvelope): SaveResponse {
    const started = performance.now()
    const guarded = this.guardControl('save', control, started)
    if (guarded !== null) return guarded as SaveResponse
    this.savedJson = exportSaveJson(this.state)
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
      saveJson: this.savedJson,
      processingMs: performance.now() - started,
    }
    this.remember(control.commandId, fingerprint('save', control), accepted)
    return accepted
  }

  load(control: ControlEnvelope): CommandResponse {
    const started = performance.now()
    const guarded = this.guardControl('load', control, started)
    if (guarded !== null) return guarded as CommandResponse
    const key = fingerprint('load', control)
    if (this.savedJson === null) {
      const rejected = this.reject(control.commandId, 'NO_SAVE', 'No authoritative bridge save exists.', started)
      this.remember(control.commandId, key, rejected)
      return rejected
    }
    const loaded = importSaveJson(this.savedJson)
    if (!loaded.ok) {
      const rejected = this.reject(control.commandId, 'SAVE_REJECTED', loaded.error, started)
      this.remember(control.commandId, key, rejected)
      return rejected
    }
    this.state = loaded.state
    this.revision++
    const accepted: AcceptedCommandResponse = {
      ...this.snapshot(),
      commandId: control.commandId,
      accepted: true,
      message: loaded.converted
        ? 'Authoritative save loaded and migrated by TypeScript.'
        : 'Authoritative TypeScript save loaded.',
      processingMs: performance.now() - started,
    }
    this.remember(control.commandId, key, accepted)
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
    const key = fingerprint(route, control)
    const prior = this.processed.get(control.commandId)
    if (prior !== undefined) {
      return prior.fingerprint === key
        ? prior.response
        : this.reject(control.commandId, 'COMMAND_ID_REUSE', 'commandId was already used for a different envelope.', started)
    }
    if (control.expectedStateRevision !== this.revision) {
      const rejected = this.reject(
        control.commandId,
        'STALE_REVISION',
        `Control expected revision ${String(control.expectedStateRevision)}; authority is revision ${String(this.revision)}.`,
        started,
      )
      this.remember(control.commandId, key, rejected)
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
    return {
      protocolVersion: PROTOCOL_VERSION,
      schemaId: SCHEMA_ID,
      sessionId: this.sessionId,
      commandId,
      accepted: false,
      reasonCode,
      message,
      stateRevision: this.revision,
      gameWeek: this.state.market.tick,
      stateDigest: authoritativeDigest(this.state),
      processingMs: performance.now() - started,
    }
  }

  private remember(commandId: string, key: string, response: CachedResponse): void {
    this.processed.set(commandId, { fingerprint: key, response })
    if (this.processed.size <= 256) return
    const oldest = this.processed.keys().next().value as string | undefined
    if (oldest !== undefined) this.processed.delete(oldest)
  }
}
