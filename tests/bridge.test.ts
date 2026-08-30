import { createHash } from 'node:crypto'

import { describe, expect, it } from 'vitest'

import {
  AVAILABLE_INTENT_KEYS,
  BRIDGE_CONTRACT,
  PROTOCOL_VERSION,
  REJECTION_CATEGORIES,
  REJECTION_CODES,
  SCHEMA_ID,
  SNAPSHOT_VERSION,
  validateCommand,
  validateControl,
  type AvailableIntent,
  type AvailableIntentKind,
  type ControlEnvelope,
  type RejectionCategory,
  type RejectionCode,
} from '../bridge/protocol.ts'
import {
  BridgeSession,
  applyAvailableIntent,
  authoritativeDigest,
  availableIntents,
  createBridgeBootstrap,
  createBridgeInitialState,
  createManagedBridgeState,
  playNextMovieThroughAvailableIntents,
  selectJourneyIntent,
  type CommandResponse,
} from '../bridge/session.ts'
import {
  castingSessionsReadModel,
  scriptCapacityView,
  scriptProjectsReadModel,
} from '../src/core/index.ts'
import { exportSaveJson, studioLotSnapshot } from '../ui/src/engine/adapter.ts'
import { contendedGreenlightStudio, contendedStudio } from './_m4Fixtures.ts'

function command(
  session: BridgeSession,
  intentId: string,
  commandId: string,
  revision = session.stateRevision,
  sessionId = session.sessionId,
) {
  return {
    protocolVersion: PROTOCOL_VERSION,
    schemaId: SCHEMA_ID,
    sessionId,
    commandId,
    expectedStateRevision: revision,
    type: 'submitIntent' as const,
    payload: { intentId },
  }
}

function control(
  session: BridgeSession,
  commandId: string,
  revision = session.stateRevision,
  sessionId = session.sessionId,
): ControlEnvelope {
  return {
    protocolVersion: PROTOCOL_VERSION,
    schemaId: SCHEMA_ID,
    sessionId,
    commandId,
    expectedStateRevision: revision,
  }
}

function submit(
  session: BridgeSession,
  intent: AvailableIntent,
  commandId: string,
  revision = session.stateRevision,
  sessionId = session.sessionId,
): CommandResponse {
  const parsed = validateCommand(command(session, intent.intentId, commandId, revision, sessionId))
  if (!parsed.ok) throw new Error(parsed.message)
  return session.command(parsed.command)
}

function chooseMovieIntent(session: BridgeSession): AvailableIntent {
  const snapshot = session.snapshot()
  const selected = selectJourneyIntent(
    snapshot.availableIntents,
    snapshot.snapshot.journeyNotices.firstFilmJourney,
  )
  if (selected === undefined) {
    throw new Error(
      `No playable movie intent at revision ${String(session.stateRevision)}: ` +
        snapshot.snapshot.journeyNotices.firstFilmJourney?.headline,
    )
  }
  return selected
}

function advanceUntilQueueEntryLeaves(
  session: BridgeSession,
  isStillQueued: () => boolean,
  commandPrefix: string,
): AvailableIntentKind[] {
  const kinds: AvailableIntentKind[] = []
  for (let guard = 0; guard < 32; guard++) {
    if (!isStillQueued()) return kinds
    const intent = chooseMovieIntent(session)
    expect(
      ['advanceWeek', 'resolveProductionBlocker'],
      'a queued picture may wait or clear an authoritative production blocker, never resubmit',
    ).toContain(intent.kind)
    const result = submit(session, intent, `${commandPrefix}-${String(guard)}`)
    expect(result.accepted).toBe(true)
    if (!result.accepted) throw new Error(result.message)
    kinds.push(intent.kind)
  }
  throw new Error(`${commandPrefix}: queued intent did not leave the queue within 32 commands.`)
}

function advanceSessionMovieToRelease(
  session: BridgeSession,
  releasedBefore: number,
  pollCount = 0,
): { kinds: AvailableIntentKind[]; commandCount: number } {
  const kinds: AvailableIntentKind[] = []
  let commandCount = 0
  for (let guard = 0; guard < 128; guard++) {
    if (session.gameState.studio.releasedFilms.length > releasedBefore) {
      return { kinds, commandCount }
    }
    for (let index = 0; index < pollCount; index++) session.snapshot()
    const intent = chooseMovieIntent(session)
    const result = submit(session, intent, `movie-command-${String(commandCount)}`)
    expect(result.accepted).toBe(true)
    kinds.push(intent.kind)
    commandCount++
  }
  throw new Error('Session movie playthrough exceeded its guard.')
}

function advanceToGreenlightChoices(session: BridgeSession): AvailableIntent[] {
  for (let guard = 0; guard < 32; guard++) {
    const snapshot = session.snapshot()
    const choices = snapshot.availableIntents.filter(
      (candidate) => candidate.kind === 'greenlightPicture',
    )
    if (choices.length > 0) return choices
    const intent = chooseMovieIntent(session)
    const result = submit(session, intent, `cast-choice-setup-${String(guard)}`)
    expect(result.accepted).toBe(true)
    if (!result.accepted) throw new Error(result.message)
  }
  throw new Error('Movie did not reach player cast selection within 32 commands.')
}

function expectOrderedSubsequence<T>(actual: readonly T[], expected: readonly T[]): void {
  let at = 0
  for (const value of actual) if (value === expected[at]) at++
  expect(at).toBe(expected.length)
}

describe('Current-game Unity adoption bridge', () => {
  it('pins protocol v4/projection v8 and fingerprints named projections and exact intent fields', () => {
    expect(PROTOCOL_VERSION).toBe(4)
    expect(SNAPSHOT_VERSION).toBe(11)
    expect(SCHEMA_ID).toMatch(/^sha256:[0-9a-f]{64}$/)
    expect(Object.keys(
      BRIDGE_CONTRACT.$defs.StudioBridgeIntentOption.properties as Record<string, unknown>,
    )).toEqual(
      AVAILABLE_INTENT_KEYS,
    )
    expect(BRIDGE_CONTRACT.$defs.StudioProjectionBundle.additionalProperties).toBe(false)
    expect(BRIDGE_CONTRACT.$defs.StudioProjectionBundle.required).toEqual([
      'casting',
      'construction',
      'development',
      'journeyNotices',
      'lot',
      'people',
      'productions',
      'releaseResults',
    ])
    expect(BRIDGE_CONTRACT.$defs.StudioFirstFilmJourneySnapshot.required).toEqual(
      expect.arrayContaining(['productionId', 'scriptProjectId', 'ordinal', 'next', 'blocked']),
    )
    expect(BRIDGE_CONTRACT.$defs.StudioPlacedFacilitySnapshot.required).toEqual(
      expect.arrayContaining(['facilityId', 'status', 'completesWeek', 'progress01']),
    )

    const session = new BridgeSession(createBridgeInitialState('bridge-contract-v4'), 'contract')
    for (const intent of session.snapshot().availableIntents) {
      expect(Object.keys(intent).sort()).toEqual([...AVAILABLE_INTENT_KEYS].sort())
    }

    const emitted = session.snapshot().availableIntents[0]!
    const valid = command(session, emitted.intentId, 'valid')
    expect(validateCommand(valid).ok).toBe(true)
    expect(validateCommand({ ...valid, extra: true })).toMatchObject({
      ok: false,
      reasonCode: 'INVALID_COMMAND',
    })
    expect(validateCommand({ ...valid, protocolVersion: 2 })).toMatchObject({
      ok: false,
      reasonCode: 'PROTOCOL_MISMATCH',
    })
    expect(validateCommand({ ...valid, schemaId: 'sha256:old' })).toMatchObject({
      ok: false,
      reasonCode: 'SCHEMA_MISMATCH',
    })
    expect(validateCommand({ ...valid, payload: { intentId: emitted.intentId, guessed: true } })).toMatchObject({
      ok: false,
      reasonCode: 'INVALID_COMMAND',
    })
    expect(validateControl({ ...control(session, 'save'), unknown: true })).toMatchObject({
      ok: false,
      reasonCode: 'INVALID_CONTROL',
    })
  })

  it('keeps the managed runtime fixture at Week 0 before Picture #1', () => {
    const state = createManagedBridgeState('bridge-managed-cold-profile')
    const snapshot = studioLotSnapshot(state)
    const roles = state.contracts.map(
      (contract) => state.talent.find((person) => person.id === contract.talentId)?.role,
    )

    expect(state.market.tick).toBe(0)
    expect(state.founding).toBeNull()
    expect(state.operations).toMatchObject({ mode: 'managed', workflows: [] })
    expect(state.construction).toMatchObject({ mode: 'managed', projects: [] })
    expect(state.placement).toMatchObject({ mode: 'managed', facilities: [] })
    expect(state.scriptDevelopment).toMatchObject({ mode: 'managed', projects: [] })
    expect(state.castingSessions).toMatchObject({ mode: 'managed', sessions: [] })
    expect(state.operations.facilities).toHaveLength(5)
    expect(state.sets).toHaveLength(2)
    expect(state.productionQueue).toEqual([])
    expect(state.studio.activeProductions).toEqual([])
    expect(state.studio.releasedFilms).toEqual([])

    expect(state.contracts).toHaveLength(7)
    expect(state.contracts.every((contract) => contract.termWeeks === 208)).toBe(true)
    expect(roles).not.toContain(undefined)
    expect(roles.filter((role) => role === 'actor')).toHaveLength(4)
    expect(roles.filter((role) => role === 'director')).toHaveLength(1)
    expect(roles.filter((role) => role === 'writer')).toHaveLength(1)
    expect(roles.filter((role) => role === 'craft')).toHaveLength(1)

    expect(snapshot.firstFilmJourney).toMatchObject({
      stage: 'no-picture',
      beat: 'no-picture',
      productionId: null,
      scriptProjectId: null,
      pictureTitle: null,
      ordinal: 1,
      headline: 'START A PICTURE',
      next: { kind: 'commission' },
      waiting: null,
      blocked: null,
    })
    expect(availableIntents(state).map((intent) => intent.kind)).toEqual(
      expect.arrayContaining(['commissionScreenplay', 'startConstruction']),
    )
  })

  it('bootstraps through real founding and legal intents, releasing Movie #1 at the Movie #2 gate', () => {
    const bootstrap = createBridgeBootstrap('bridge-bootstrap-proof')
    const snapshot = studioLotSnapshot(bootstrap.state)
    expect(bootstrap.state.studio.releasedFilms).toHaveLength(1)
    expect(bootstrap.state.studio.activeProductions).toHaveLength(0)
    expect(snapshot.firstFilmJourney).toMatchObject({
      stage: 'released',
      beat: 'released',
      ordinal: 1,
      next: { kind: 'commission' },
    })
    const kinds = bootstrap.movieOneIntents.map((entry) => entry.option.kind)
    expect(kinds.filter((kind) => kind === 'commissionScreenplay')).toHaveLength(1)
    expect(bootstrap.state.productionQueue).toEqual([])
    expectOrderedSubsequence(kinds, [
      'commissionScreenplay',
      'advanceWeek',
      'acceptScreenplay',
      'startAuditions',
      'advanceWeek',
      'acknowledgeAuditions',
      'greenlightPicture',
      'resolveProductionBlocker',
      'advanceWeek',
    ])
    // P05A W1: the walk resolves exactly TWO production commands per movie —
    // the Director call (which settles the due-at-call load-in inside its own
    // transaction) and the take schedule. The manual clear no longer exists on
    // a current picture.
    expect(kinds.filter((kind) => kind === 'resolveProductionBlocker').length).toBe(2)
    for (const played of bootstrap.movieOneIntents) {
      expect(played.afterDigest).not.toBe(played.beforeDigest)
      expect(played.option.intentId).toMatch(/^intent-v4-[0-9a-f]{64}$/)
    }
  })

  it('plays exact Movie #2 end to end with current guidance, identities, blockers, and construction visible', () => {
    const session = new BridgeSession(
      createBridgeInitialState('bridge-movie-two-e2e'),
      'movie-two-session',
    )
    const initial = session.snapshot()
    expect(initial.snapshot.journeyNotices.firstFilmJourney).toMatchObject({
      stage: 'released',
      ordinal: 1,
      next: { kind: 'commission' },
    })
    expect(initial.snapshot.lot.property?.buildings.length).toBeGreaterThan(0)
    expect(initial.snapshot.lot.stages?.length).toBeGreaterThanOrEqual(2)
    expect(initial.snapshot.lot.sets?.length).toBeGreaterThanOrEqual(2)
    expect(initial.snapshot.people.people.length).toBeGreaterThan(0)
    expect(initial.snapshot.releaseResults.releasedFilms).toHaveLength(1)

    const construction = initial.availableIntents.find((intent) => intent.kind === 'startConstruction')
    expect(construction).toBeDefined()
    const constructionResult = submit(session, construction!, 'movie-two-construction')
    expect(constructionResult.accepted).toBe(true)
    if (!constructionResult.accepted) throw new Error(constructionResult.message)
    expect(
      constructionResult.snapshot.construction.placement?.placements.some(
        (placed) => placed.status === 'underConstruction',
      ),
    ).toBe(true)

    const releasedBefore = session.gameState.studio.releasedFilms.length
    const beats = new Set<string>()
    const blockerKinds = new Set<string>()
    const intentKinds: AvailableIntentKind[] = ['startConstruction']
    let movieTwoProjectId: string | null = null
    let movieTwoCastingSessionId: string | null = null
    let movieTwoProductionId: string | null = null
    let greenlightDetail = ''
    let commandIndex = 0

    for (let guard = 0; guard < 128; guard++) {
      const before = session.snapshot()
      const journey = before.snapshot.journeyNotices.firstFilmJourney
      if (journey === undefined) throw new Error('Missing current guidance.')
      beats.add(journey.beat)
      if (session.gameState.studio.releasedFilms.length > releasedBefore) break

      const intent = chooseMovieIntent(session)
      if (movieTwoProjectId !== null && intent.projectId !== null) {
        expect(intent.projectId).toBe(movieTwoProjectId)
      }
      if (intent.kind === 'resolveProductionBlocker') {
        const operation = before.snapshot.productions.productionOperations?.find(
          (candidate) => candidate.productionId === movieTwoProductionId,
        )
        if (operation?.blocker !== null && operation?.blocker !== undefined) {
          blockerKinds.add(operation.blocker.kind)
        }
      }
      if (intent.kind === 'greenlightPicture') greenlightDetail = intent.detail

      const result = submit(session, intent, `movie-two-${String(commandIndex)}`)
      expect(result.accepted).toBe(true)
      if (!result.accepted) throw new Error(result.message)
      intentKinds.push(intent.kind)
      commandIndex++

      const afterJourney = result.snapshot.journeyNotices.firstFilmJourney
      if (afterJourney?.scriptProjectId !== null && afterJourney?.scriptProjectId !== undefined) {
        movieTwoProjectId ??= afterJourney.scriptProjectId
      }
      if (intent.kind === 'acknowledgeAuditions') {
        movieTwoCastingSessionId = intent.castingSessionId
        expect(afterJourney?.beat).toBe('auditions-reviewed')
      }
      if (intent.kind === 'greenlightPicture') {
        expect(intent.projectId).toBe(movieTwoProjectId)
        expect(intent.castingSessionId).toBe(movieTwoCastingSessionId)
        movieTwoProductionId = afterJourney?.productionId ?? null
        expect(movieTwoProductionId).not.toBeNull()
        expect(afterJourney).toMatchObject({
          ordinal: 2,
          scriptProjectId: movieTwoProjectId,
          productionId: movieTwoProductionId,
          beat: 'greenlit',
        })
      }
    }

    const released = session.snapshot()
    const journey = released.snapshot.journeyNotices.firstFilmJourney
    expect(session.gameState.studio.releasedFilms).toHaveLength(releasedBefore + 1)
    expect(journey).toMatchObject({
      stage: 'released',
      beat: 'released',
      ordinal: 2,
      scriptProjectId: movieTwoProjectId,
      productionId: movieTwoProductionId,
      headline: 'PICTURE RELEASED',
    })
    expect(released.snapshot.releaseResults.releasedFilms.some((film) => film.id === movieTwoProductionId)).toBe(true)
    expect([...beats]).toEqual(expect.arrayContaining([
      'screenplay-writing',
      'screenplay-review',
      'screenplay-ready',
      'auditions-running',
      'auditions-ready',
      'auditions-reviewed',
      'greenlit',
      'pre-production',
      'load-in',
      'shooting',
      'post-production',
      'release-ready',
    ]))
    // P05A W1: the founding-lot trip is due at the Director call and settles
    // inside that transaction, so no polled snapshot ever shows the
    // scenery-load-in blocker on this walk — only the two decision states.
    expect([...blockerKinds]).toEqual(expect.arrayContaining([
      'director-dispatch',
      'take-scheduling',
    ]))
    expect([...blockerKinds]).not.toContain('scenery-load-in')
    expectOrderedSubsequence(intentKinds, [
      'startConstruction',
      'commissionScreenplay',
      'advanceWeek',
      'acceptScreenplay',
      'startAuditions',
      'advanceWeek',
      'acknowledgeAuditions',
      'greenlightPicture',
      'resolveProductionBlocker',
      'advanceWeek',
    ])
    expect(greenlightDetail).toMatch(/Lead .+: Est\. \d+, observed range \d+-\d+, Fit \d+\./)
    expect(greenlightDetail).toMatch(/Antagonist .+: Est\. \d+, observed range \d+-\d+, Fit \d+\./)
    expect(greenlightDetail).toMatch(/Support .+: Est\. \d+, observed range \d+-\d+, Fit \d+\./)
    expect(greenlightDetail).toMatch(/Director .+; Production\/Craft .+\./)
    expect(intentKinds.filter((kind) => kind === 'commissionScreenplay')).toHaveLength(1)
  })

  it('makes the player choose a distinct evidenced cast before greenlight', () => {
    const session = new BridgeSession(
      createBridgeInitialState('bridge-player-cast-choice'),
      'player-cast-choice',
    )
    const choices = advanceToGreenlightChoices(session)
    const readySnapshot = session.snapshot()
    const castingProject = castingSessionsReadModel(session.gameState).sections.history.find(
      (candidate) => candidate.projectId === choices[0]?.projectId,
    )
    expect(castingProject?.results).not.toBeNull()
    const availableByRole = {
      lead: new Set(castingProject?.results?.lead.filter((entry) => entry.available).map((entry) => entry.talentId)),
      antagonist: new Set(castingProject?.results?.antagonist.filter((entry) => entry.available).map((entry) => entry.talentId)),
      support: new Set(castingProject?.results?.support.filter((entry) => entry.available).map((entry) => entry.talentId)),
    }
    expect(choices.length).toBeGreaterThanOrEqual(2)
    expect(new Set(choices.map((choice) => choice.intentId)).size).toBe(choices.length)
    expect(new Set(choices.map((choice) => choice.label)).size).toBe(choices.length)
    expect(choices.some((choice) => choice.detail.includes('Strength: '))).toBe(true)
    expect(choices.some((choice) => choice.detail.includes('Concern: '))).toBe(true)
    const { metrics: _readyMetrics, ...readyAuthority } = readySnapshot
    const { metrics: _polledMetrics, ...polledAuthority } = session.snapshot()
    expect(polledAuthority).toEqual(readyAuthority)
    for (const choice of choices) {
      expect(choice.label).toMatch(
        /^Lead .+ \/ Antagonist .+ \/ Support .+ - greenlight .+$/,
      )
      expect(choice.detail).toMatch(/Lead .+: Est\. \d+, observed range \d+-\d+, Fit \d+\./)
      expect(choice.detail).toMatch(/Antagonist .+: Est\. \d+, observed range \d+-\d+, Fit \d+\./)
      expect(choice.detail).toMatch(/Support .+: Est\. \d+, observed range \d+-\d+, Fit \d+\./)
      expect(choice.castingSessionId).not.toBeNull()
    }

    const readySave = exportSaveJson(session.gameState)
    const casts = choices.map((choice, index) => {
      const branch = BridgeSession.fromSaveJson(readySave, `player-cast-branch-${String(index)}`)
      const result = submit(branch, choice, `player-cast-choice-${String(index)}`)
      expect(result.accepted).toBe(true)
      if (!result.accepted) throw new Error(result.message)
      const production = branch.gameState.studio.activeProductions.at(-1)
      expect(production).toBeDefined()
      const names = new Map(branch.gameState.talent.map((talent) => [talent.id, talent.name]))
      const label = choice.label.match(
        /^Lead (.+) \/ Antagonist (.+) \/ Support (.+) - greenlight (.+)$/,
      )
      expect(label).not.toBeNull()
      expect(production?.cast).toBeDefined()
      if (production === undefined || label === null) throw new Error('Greenlight did not create its labeled cast.')
      expect(new Set(Object.values(production.cast)).size).toBe(3)
      expect(availableByRole.lead.has(production.cast.lead)).toBe(true)
      expect(availableByRole.antagonist.has(production.cast.antagonist)).toBe(true)
      expect(availableByRole.support.has(production.cast.support)).toBe(true)
      expect(label.slice(1, 4)).toEqual([
        names.get(production.cast.lead),
        names.get(production.cast.antagonist),
        names.get(production.cast.support),
      ])
      return production?.cast
    })
    expect(new Set(casts.map((cast) => JSON.stringify(cast))).size).toBe(choices.length)
  })

  it('rejects stale, forged, wrong-session, and reused command identities without changing truth', () => {
    const session = new BridgeSession(createBridgeInitialState('bridge-rejections'), 'rejections')
    const before = session.snapshot()
    const commission = before.availableIntents.find((intent) => intent.kind === 'commissionScreenplay')!
    const acceptedCommand = command(session, commission.intentId, 'one-command')
    const parsed = validateCommand(acceptedCommand)
    if (!parsed.ok) throw new Error(parsed.message)
    const accepted = session.command(parsed.command)
    expect(accepted.accepted).toBe(true)
    const duplicate = session.command(parsed.command)
    expect(duplicate).toEqual(accepted)
    expect(session.stateRevision).toBe(1)

    const currentIntent = chooseMovieIntent(session)
    const reused = submit(session, currentIntent, 'one-command')
    expect(reused).toMatchObject({
      accepted: false,
      reasonCode: 'COMMAND_ID_REUSE',
      rejection: {
        category: 'command-conflict',
        blocker: expect.stringMatching(/already bound/i),
        currentHolder: null,
        remedy: expect.stringMatching(/reconnect/i),
      },
    })
    const digestAfterAccept = authoritativeDigest(session.gameState)
    expect(reused.stateDigest).toBe(digestAfterAccept)

    const wrongSession = submit(session, currentIntent, 'one-command', session.stateRevision, 'other-session')
    expect(wrongSession).toMatchObject({
      accepted: false,
      reasonCode: 'SESSION_MISMATCH',
      rejection: {
        category: 'session-mismatch',
        blocker: expect.stringMatching(/different bridge session/i),
        currentHolder: null,
        remedy: expect.stringMatching(/reconnect/i),
      },
    })
    expect(wrongSession.stateDigest).toBe(digestAfterAccept)

    const stale = submit(session, currentIntent, 'stale-command', 0)
    expect(stale).toMatchObject({
      accepted: false,
      reasonCode: 'STALE_REVISION',
      rejection: {
        category: 'state-stale',
        blocker: expect.stringMatching(/authoritative state changed/i),
        currentHolder: null,
        remedy: expect.stringMatching(/refresh/i),
      },
    })
    expect(stale.stateDigest).toBe(digestAfterAccept)
    expect(submit(session, currentIntent, 'stale-command', 0)).toEqual(stale)

    const forgedParsed = validateCommand(command(session, 'intent-v4-forged', 'forged-command'))
    if (!forgedParsed.ok) throw new Error(forgedParsed.message)
    const forged = session.command(forgedParsed.command)
    expect(forged).toMatchObject({
      accepted: false,
      reasonCode: 'INTENT_NOT_AVAILABLE',
      rejection: {
        category: 'intent-unavailable',
        blocker: expect.stringMatching(/exact intent is not available/i),
        currentHolder: null,
        remedy: expect.stringMatching(/actions available/i),
      },
    })
    expect(forged.stateDigest).toBe(digestAfterAccept)
    expect(authoritativeDigest(session.gameState)).toBe(digestAfterAccept)

    const invalidJsonShape = session.protocolReject(null, 'INVALID_JSON', 'Malformed JSON')
    expect(invalidJsonShape.stateDigest).toBe(digestAfterAccept)
    expect(Object.keys(invalidJsonShape).sort()).toEqual([
      'accepted', 'commandId', 'gameWeek', 'message', 'processingMs', 'protocolVersion',
      'reasonCode', 'rejection', 'schemaId', 'sessionId', 'stateDigest', 'stateRevision',
    ].sort())
    expect(invalidJsonShape.rejection).toEqual({
      category: 'request-invalid',
      blocker: 'The request body is not valid JSON.',
      currentHolder: null,
      remedy: 'Reconnect to the local engine. If this repeats, relaunch the documented compatible build and inspect the bridge log.',
    })
  })

  it('maps every rejection code to closed TypeScript-owned facts', () => {
    const session = new BridgeSession(createBridgeInitialState('bridge-rejection-facts'), 'facts')
    const categories: Record<RejectionCode, RejectionCategory> = {
      INVALID_JSON: 'request-invalid',
      INVALID_COMMAND: 'request-invalid',
      INVALID_CONTROL: 'request-invalid',
      PROTOCOL_MISMATCH: 'contract-incompatible',
      SCHEMA_MISMATCH: 'contract-incompatible',
      SESSION_MISMATCH: 'session-mismatch',
      STALE_REVISION: 'state-stale',
      COMMAND_ID_REUSE: 'command-conflict',
      INTENT_NOT_AVAILABLE: 'intent-unavailable',
      ENGINE_REJECTED: 'authority-refusal',
      NO_SAVE: 'save-state',
      SAVE_REJECTED: 'save-state',
    }
    expect(Object.keys(categories)).toEqual(REJECTION_CODES)
    expect(new Set(Object.values(categories))).toEqual(new Set(REJECTION_CATEGORIES))

    for (const reasonCode of REJECTION_CODES) {
      const rejected = session.protocolReject('facts-command', reasonCode, 'Authoritative detail.')
      expect(rejected.accepted).toBe(false)
      expect(rejected.rejection.category).toBe(categories[reasonCode])
      expect(Object.keys(rejected.rejection).sort()).toEqual([
        'blocker', 'category', 'currentHolder', 'remedy',
      ])
      expect(rejected.rejection.blocker === null || rejected.rejection.blocker.length > 0).toBe(true)
      expect(
        rejected.rejection.currentHolder === null || rejected.rejection.currentHolder.length > 0,
      ).toBe(true)
      expect(rejected.rejection.remedy === null || rejected.rejection.remedy.length > 0).toBe(true)
      expect(rejected.rejection.currentHolder).toBeNull()
      if (reasonCode === 'ENGINE_REJECTED' || reasonCode === 'SAVE_REJECTED') {
        expect(rejected.message).toBe('Authoritative detail.')
        expect(rejected.rejection.blocker).not.toBe(rejected.message)
      }
    }
  })

  it('uses opaque exact identities rather than titles and invalidates every prior-state intent', () => {
    const session = new BridgeSession(createBridgeInitialState('bridge-identity-routing'), 'identity')
    const commission = session.snapshot().availableIntents.find(
      (intent) => intent.kind === 'commissionScreenplay',
    )!
    const commissionResult = submit(session, commission, 'commission')
    expect(commissionResult.accepted).toBe(true)
    if (!commissionResult.accepted) throw new Error(commissionResult.message)
    const projectId = commissionResult.snapshot.journeyNotices.firstFilmJourney?.scriptProjectId
    const title = commissionResult.snapshot.journeyNotices.firstFilmJourney?.pictureTitle
    expect(projectId).toMatch(/^script-/)
    expect(title).toBeTruthy()

    const advance = commissionResult.availableIntents.find((intent) => intent.kind === 'advanceWeek')!
    expect(advance.projectId).toBe(projectId)
    const wire = JSON.stringify(command(session, advance.intentId, 'advance'))
    expect(wire).toContain(advance.intentId)
    expect(wire).not.toContain(title!)

    const oldCommission = submit(session, commission, 'old-intent-new-command')
    expect(oldCommission).toMatchObject({ accepted: false, reasonCode: 'INTENT_NOT_AVAILABLE' })
    expect(session.snapshot().snapshot.journeyNotices.firstFilmJourney?.scriptProjectId).toBe(projectId)
  })

  it('protects save/load controls and reconstructs a fresh reconnect session byte-for-byte', () => {
    const session = new BridgeSession(createBridgeInitialState('bridge-recovery'), 'save-origin')
    const saved = session.save(control(session, 'save-1'))
    expect(saved.accepted).toBe(true)
    if (!saved.accepted) throw new Error(saved.message)
    expect(saved.stateDigest).toBe(authoritativeDigest(session.gameState))
    expect(createHashForTest(saved.saveJson)).toBe(saved.stateDigest)

    const commission = session.snapshot().availableIntents.find(
      (intent) => intent.kind === 'commissionScreenplay',
    )!
    expect(submit(session, commission, 'after-save').accepted).toBe(true)
    expect(authoritativeDigest(session.gameState)).not.toBe(saved.stateDigest)

    const staleLoad = session.load(control(session, 'stale-load', 0))
    expect(staleLoad).toMatchObject({ accepted: false, reasonCode: 'STALE_REVISION' })
    const loaded = session.load(control(session, 'load-1'))
    expect(loaded.accepted).toBe(true)
    if (!loaded.accepted) throw new Error(loaded.message)
    expect(loaded.stateDigest).toBe(saved.stateDigest)
    expect(session.stateRevision).toBe(2)
    expect(session.load(control(session, 'load-1', 1))).toEqual(loaded)

    const reconnected = BridgeSession.fromSaveJson(saved.saveJson, 'fresh-reconnect')
    expect(reconnected.sessionId).not.toBe(session.sessionId)
    expect(reconnected.snapshot().stateDigest).toBe(saved.stateDigest)
    expect(exportSaveJson(reconnected.gameState)).toBe(saved.saveJson)
    expect(reconnected.snapshot().snapshot.people.people.map((person) => person.id)).toEqual(
      loaded.snapshot.people.people.map((person) => person.id),
    )

    const oldSessionIntent = session.snapshot().availableIntents[0]!
    const wrongSession = submit(reconnected, oldSessionIntent, 'old-session', 0, session.sessionId)
    expect(wrongSession).toMatchObject({ accepted: false, reasonCode: 'SESSION_MISMATCH' })
  })

  it('matches direct headless save bytes/digests and is independent of polling cadence', () => {
    const seed = 'bridge-determinism-parity'
    const initialA = createBridgeInitialState(seed)
    const initialB = createBridgeInitialState(seed)
    expect(exportSaveJson(initialA)).toBe(exportSaveJson(initialB))
    expect(authoritativeDigest(initialA)).toBe(authoritativeDigest(initialB))

    const headless = playNextMovieThroughAvailableIntents(initialA)
    const quiet = new BridgeSession(initialB, 'quiet')
    const busy = new BridgeSession(createBridgeInitialState(seed), 'busy')
    const releasedBefore = quiet.gameState.studio.releasedFilms.length
    const quietRun = advanceSessionMovieToRelease(quiet, releasedBefore)
    const busyRun = advanceSessionMovieToRelease(busy, releasedBefore, 12)

    expect(quietRun.kinds).toEqual(busyRun.kinds)
    expect(exportSaveJson(quiet.gameState)).toBe(exportSaveJson(headless.state))
    expect(exportSaveJson(busy.gameState)).toBe(exportSaveJson(headless.state))
    expect(authoritativeDigest(quiet.gameState)).toBe(authoritativeDigest(headless.state))
    expect(authoritativeDigest(busy.gameState)).toBe(authoritativeDigest(headless.state))
  })

  it('keeps read-only polling and failed direct intent application save-neutral', () => {
    const state = createBridgeInitialState('bridge-read-neutral')
    const before = exportSaveJson(state)
    const first = availableIntents(state)
    for (let index = 0; index < 200; index++) {
      expect(availableIntents(state)).toEqual(first)
      studioLotSnapshot(state)
    }
    expect(exportSaveJson(state)).toBe(before)
    expect(applyAvailableIntent(state, 'intent-v4-not-real')).toMatchObject({ ok: false })
    expect(exportSaveJson(state)).toBe(before)
  })

  it('keeps every named projection and root authority token stable across identical polls', () => {
    const session = new BridgeSession(
      createBridgeInitialState('bridge-atomic-poll-stability'),
      'atomic-poll-stability',
    )
    const saveBefore = exportSaveJson(session.gameState)
    const first = session.snapshot()
    const second = session.snapshot()
    expect(second.snapshot).toEqual(first.snapshot)
    expect(second.availableIntents).toEqual(first.availableIntents)
    expect(second.stateRevision).toBe(first.stateRevision)
    expect(second.stateDigest).toBe(first.stateDigest)
    expect(second.gameWeek).toBe(first.snapshot.lot.week)
    expect(second.gameWeek).toBe(first.snapshot.construction.placement.currentWeek)
    expect(exportSaveJson(session.gameState)).toBe(saveBefore)

    const commission = second.availableIntents.find((intent) => intent.kind === 'commissionScreenplay')
    if (commission === undefined) throw new Error('Atomic poll fixture omitted commission intent.')
    const accepted = submit(session, commission, 'atomic-poll-command')
    expect(accepted.accepted).toBe(true)
    if (!accepted.accepted) throw new Error(accepted.message)
    expect(accepted.stateRevision).toBe(first.stateRevision + 1)
    expect(accepted.snapshot.lot.week).toBe(accepted.gameWeek)
    expect(accepted.snapshot.construction.placement.currentWeek).toBe(accepted.gameWeek)
  })

  it('emits and admits a screenplay commission when both authoritative slots are occupied', () => {
    const contended = contendedStudio('bridge-queue-commission')
    const session = new BridgeSession(contended.state, 'queue-commission')
    const before = session.gameState
    expect(scriptCapacityView(before)).toMatchObject({ occupied: 2, available: 0 })
    const commission = scriptProjectsReadModel(before).commission
    expect(commission.blockers.map((blocker) => blocker.kind)).toEqual(['facility-capacity'])
    const expectedConceptId = commission.concepts[0]!.id
    const expectedWriterId = commission.writers.find(
      (writer) => writer.available && writer.primaryRole === 'writer',
    )!.id

    const snapshot = session.snapshot()
    expect(snapshot.snapshot.journeyNotices.firstFilmJourney?.next?.kind).toBe('plan-auditions')
    expect(snapshot.availableIntents.some(
      (candidate) =>
        candidate.kind === 'startAuditions' &&
        candidate.projectId === snapshot.snapshot.journeyNotices.firstFilmJourney?.scriptProjectId,
    )).toBe(true)
    const intent = snapshot.availableIntents.find(
      (candidate) => candidate.kind === 'commissionScreenplay',
    )
    expect(
      intent,
      'capacity may queue a legal commission, but must not hide its intent',
    ).toBeDefined()
    if (intent === undefined) throw new Error('Bridge omitted queue-admissible commission intent.')

    const result = submit(session, intent, 'queue-commission-command')
    expect(result.accepted).toBe(true)
    expect(result).not.toHaveProperty('rejection')
    if (!result.accepted) throw new Error(result.message)
    expect(result.message).toMatch(/Screenplay commission joined the Development & Casting queue/i)
    expect(result.message).toMatch(/No writer, project identity, or cost is committed/i)
    expect(intent.detail).toMatch(/joins the Development & Casting queue and holds nothing/i)
    expect(intent.detail).not.toMatch(/One week passes while the writer/i)
    expect(session.gameState.productionQueue).toMatchObject([
      {
        kind: 'commissionScript',
        ordinal: 0,
        queuedWeek: before.market.tick,
      },
    ])
    expect(session.gameState.productionQueue).toHaveLength(1)
    const queued = session.gameState.productionQueue[0]
    expect(queued?.kind === 'commissionScript' ? queued.payload : null).toMatchObject({
      conceptId: expectedConceptId,
      writerId: expectedWriterId,
    })
    expect(session.gameState.scriptDevelopment.projects).toEqual(before.scriptDevelopment.projects)
    expect(session.gameState.operations.workflows).toEqual(before.operations.workflows)
    expect(session.gameState.studio.activeProductions).toEqual(before.studio.activeProductions)
    expect(session.gameState.studio.cash).toBe(before.studio.cash)
    expect(session.gameState.ledger).toEqual(before.ledger)

    const firstQueued = session.gameState.productionQueue[0]
    if (firstQueued?.kind !== 'commissionScript') throw new Error('Expected queued commission.')
    const followup = result.availableIntents.find(
      (candidate) => candidate.kind === 'commissionScreenplay',
    )
    expect(followup, 'another physical-capacity choice may remain, but not the same default').toBeDefined()
    const followupResult = submit(session, followup!, 'queue-commission-followup')
    expect(followupResult.accepted).toBe(true)
    const secondQueued = session.gameState.productionQueue[1]
    if (secondQueued?.kind !== 'commissionScript') throw new Error('Expected second queued commission.')
    expect(secondQueued.payload.conceptId).not.toBe(firstQueued.payload.conceptId)
    expect(secondQueued.payload.writerId).not.toBe(firstQueued.payload.writerId)
  })

  it('emits and admits exact-project auditions when both authoritative slots are occupied', () => {
    const contended = contendedStudio('bridge-queue-auditions')
    const targetProjectId = contended.readyProjectIds[0]!
    const session = new BridgeSession(contended.state, 'queue-auditions')
    const before = session.gameState
    expect(scriptCapacityView(before)).toMatchObject({ occupied: 2, available: 0 })
    const casting = castingSessionsReadModel(before).sections.readyToPlan.find(
      (project) => project.projectId === targetProjectId,
    )
    expect(casting).toBeDefined()
    expect(casting?.candidates.lead.length).toBeGreaterThanOrEqual(3)
    expect(casting?.blockers).toHaveLength(1)
    expect(casting?.blockers[0]).toMatch(/Development & Casting slot.*queue/i)

    const intent = session.snapshot().availableIntents.find(
      (candidate) => candidate.kind === 'startAuditions' && candidate.projectId === targetProjectId,
    )
    expect(
      intent,
      'capacity may queue legal auditions, but must not hide the exact project intent',
    ).toBeDefined()
    if (intent === undefined) throw new Error('Bridge omitted queue-admissible audition intent.')

    const result = submit(session, intent, 'queue-auditions-command')
    expect(result.accepted).toBe(true)
    expect(result).not.toHaveProperty('rejection')
    if (!result.accepted) throw new Error(result.message)
    expect(result.message).toMatch(/Auditions joined the Development & Casting queue/i)
    expect(result.message).toMatch(/No actor was reserved or paid/i)
    expect(intent.projectId).toBe(targetProjectId)
    expect(session.gameState.productionQueue).toMatchObject([
      {
        kind: 'startCastingSession',
        ordinal: 0,
        queuedWeek: before.market.tick,
        payload: { projectId: targetProjectId },
      },
    ])
    expect(session.gameState.productionQueue).toHaveLength(1)
    expect(session.gameState.scriptDevelopment.projects).toEqual(before.scriptDevelopment.projects)
    expect(session.gameState.castingSessions.sessions).toEqual(before.castingSessions.sessions)
    expect(session.gameState.operations.workflows).toEqual(before.operations.workflows)
    expect(session.gameState.studio.activeProductions).toEqual(before.studio.activeProductions)
    expect(session.gameState.studio.cash).toBe(before.studio.cash)
    expect(session.gameState.ledger).toEqual(before.ledger)
    expect(result.availableIntents.some(
      (candidate) => candidate.kind === 'startAuditions' && candidate.projectId === targetProjectId,
    )).toBe(false)

    const queuedJourney = result.snapshot.journeyNotices.firstFilmJourney
    expect(queuedJourney).toMatchObject({
      stage: 'ready-to-package',
      beat: 'screenplay-ready',
      scriptProjectId: targetProjectId,
      next: { kind: 'advance-week' },
    })
    expect(queuedJourney?.waiting?.reason).toMatch(/revalidated.*advance the week/i)
    expect(selectJourneyIntent(result.availableIntents, queuedJourney)?.kind).toBe('advanceWeek')

    const saved = session.save(control(session, 'queue-auditions-save'))
    expect(saved.accepted).toBe(true)
    if (!saved.accepted) throw new Error(saved.message)
    const recovered = BridgeSession.fromSaveJson(saved.saveJson, 'queue-auditions-recovered')
    expect(recovered.snapshot().snapshot.journeyNotices.firstFilmJourney).toEqual(queuedJourney)
    const played = advanceUntilQueueEntryLeaves(
      recovered,
      () => recovered.gameState.productionQueue.some(
        (entry) =>
          entry.kind === 'startCastingSession' && entry.payload.projectId === targetProjectId,
      ),
      'queue-auditions-wait',
    )
    expect(played).toContain('advanceWeek')
    expect(played).not.toContain('startAuditions')
    expect(recovered.gameState.castingSessions.sessions.find(
      (castingSession) => castingSession.projectId === targetProjectId,
    )).toMatchObject({ status: 'auditioning' })

    for (let guard = 0; guard < 16; guard++) {
      const castingSession = recovered.gameState.castingSessions.sessions.find(
        (candidate) => candidate.projectId === targetProjectId,
      )
      if (castingSession?.status === 'review') break
      const nextIntent = chooseMovieIntent(recovered)
      const nextResult = submit(recovered, nextIntent, `queue-auditions-results-${String(guard)}`)
      expect(nextResult.accepted).toBe(true)
      if (!nextResult.accepted) throw new Error(nextResult.message)
    }
    const review = recovered.gameState.castingSessions.sessions.find(
      (castingSession) => castingSession.projectId === targetProjectId,
    )
    expect(review).toMatchObject({ status: 'review' })
    const acknowledge = chooseMovieIntent(recovered)
    expect(acknowledge).toMatchObject({
      kind: 'acknowledgeAuditions',
      projectId: targetProjectId,
      castingSessionId: review?.id,
    })
    expect(submit(recovered, acknowledge, 'queue-auditions-acknowledge').accepted).toBe(true)
    expect(recovered.gameState.castingSessions.sessions.find(
      (castingSession) => castingSession.projectId === targetProjectId,
    )).toMatchObject({ status: 'complete' })
  })

  it('emits and admits an evidenced exact-project greenlight without committing the package', () => {
    const contended = contendedGreenlightStudio('bridge-queue-greenlight')
    const session = new BridgeSession(contended.state, 'queue-greenlight')
    const before = session.gameState
    expect(scriptCapacityView(before)).toMatchObject({ occupied: 2, available: 0 })
    expect(before.castingSessions.sessions.find(
      (casting) => casting.id === contended.targetCastingSessionId,
    )).toMatchObject({ projectId: contended.targetProjectId, status: 'complete' })
    const packageView = scriptProjectsReadModel(before).packages.find(
      (candidate) => candidate.projectId === contended.targetProjectId,
    )
    expect(packageView?.openAction?.projectId).toBe(contended.targetProjectId)
    expect(packageView?.availability.blockers.map((blocker) => blocker.kind)).toEqual([
      'facility-capacity',
    ])

    const intent = session.snapshot().availableIntents.find(
      (candidate) =>
        candidate.kind === 'greenlightPicture' &&
        candidate.projectId === contended.targetProjectId,
    )
    expect(
      intent,
      'capacity may queue a legal greenlight, but must not hide its exact project intent',
    ).toBeDefined()
    if (intent === undefined) throw new Error('Bridge omitted queue-admissible greenlight intent.')

    const result = submit(session, intent, 'queue-greenlight-command')
    expect(result.accepted).toBe(true)
    expect(result).not.toHaveProperty('rejection')
    if (!result.accepted) throw new Error(result.message)
    expect(result.message).toMatch(/Greenlight joined the Development & Casting queue/i)
    expect(result.message).toMatch(/No production identity, budget, or talent commitment exists/i)
    expect(intent.projectId).toBe(contended.targetProjectId)
    expect(intent.castingSessionId).toBe(contended.targetCastingSessionId)
    expect(session.gameState.productionQueue).toMatchObject([
      {
        kind: 'greenlightScriptProject',
        ordinal: 0,
        queuedWeek: before.market.tick,
        scriptProjectId: contended.targetProjectId,
        payload: { projectId: contended.targetProjectId },
      },
    ])
    expect(session.gameState.productionQueue).toHaveLength(1)
    expect(session.gameState.scriptDevelopment.projects).toEqual(before.scriptDevelopment.projects)
    expect(session.gameState.castingSessions.sessions).toEqual(before.castingSessions.sessions)
    expect(session.gameState.operations.workflows).toEqual(before.operations.workflows)
    expect(session.gameState.studio.activeProductions).toEqual(before.studio.activeProductions)
    expect(session.gameState.studio.cash).toBe(before.studio.cash)
    expect(session.gameState.ledger).toEqual(before.ledger)
    expect(result.availableIntents.some(
      (candidate) =>
        candidate.kind === 'greenlightPicture' && candidate.projectId === contended.targetProjectId,
    )).toBe(false)

    const queuedJourney = result.snapshot.journeyNotices.firstFilmJourney
    expect(queuedJourney).toMatchObject({
      stage: 'ready-to-package',
      beat: 'auditions-reviewed',
      scriptProjectId: contended.targetProjectId,
      next: { kind: 'advance-week' },
    })
    expect(queuedJourney?.waiting?.reason).toMatch(/revalidated.*advance the week/i)
    expect(selectJourneyIntent(result.availableIntents, queuedJourney)?.kind).toBe('advanceWeek')

    const queued = session.gameState.productionQueue.find(
      (entry) =>
        entry.kind === 'greenlightScriptProject' &&
        entry.scriptProjectId === contended.targetProjectId,
    )
    if (queued?.kind !== 'greenlightScriptProject') {
      throw new Error('Expected exact-project queued greenlight payload.')
    }
    const queuedPayload = queued.payload
    const played = advanceUntilQueueEntryLeaves(
      session,
      () => session.gameState.productionQueue.some(
        (entry) =>
          entry.kind === 'greenlightScriptProject' &&
          entry.scriptProjectId === contended.targetProjectId,
      ),
      'queue-greenlight-wait',
    )
    expect(played).toContain('advanceWeek')
    expect(played).not.toContain('greenlightPicture')
    const project = session.gameState.scriptDevelopment.projects.find(
      (candidate) => candidate.id === contended.targetProjectId,
    )
    expect(project).toMatchObject({ status: 'inProduction' })
    const production = session.gameState.studio.activeProductions.find(
      (candidate) => candidate.id === project?.productionId,
    )
    expect(production).toMatchObject({
      directorId: queuedPayload.directorId,
      craftIds: queuedPayload.craftIds,
      cast: queuedPayload.cast,
      budget: queuedPayload.budget,
    })
  })

  it('publishes advanceWeek through the ready-to-package family and withholds it at a casting-review decision stop', () => {
    const session = new BridgeSession(
      createBridgeInitialState('bridge-rtp-advance-week'),
      'rtp-advance-week',
    )
    let sawPlanAuditions = false
    let sawAuditionReview = false
    let sawOpenPackage = false
    for (let guard = 0; guard < 64 && !sawOpenPackage; guard++) {
      const before = session.snapshot()
      const journey = before.snapshot.journeyNotices.firstFilmJourney
      const advanceIntent = before.availableIntents.find((intent) => intent.kind === 'advanceWeek')
      if (journey?.next?.kind === 'plan-auditions') {
        sawPlanAuditions = true
        expect(
          advanceIntent,
          'advanceWeek must stay available while ready-to-package, before any casting session',
        ).toBeDefined()
      } else if (journey?.next?.kind === 'open-package') {
        sawOpenPackage = true
        expect(
          advanceIntent,
          'advanceWeek must stay available while ready-to-package, after a complete casting session',
        ).toBeDefined()
      } else if (journey?.next?.kind === 'audition-review') {
        sawAuditionReview = true
        expect(
          advanceIntent,
          'advanceWeek must remain withheld at a casting-review decision stop',
        ).toBeUndefined()
      }
      const intent = chooseMovieIntent(session)
      const result = submit(session, intent, `rtp-advance-week-${String(guard)}`)
      expect(result.accepted).toBe(true)
      if (!result.accepted) throw new Error(result.message)
    }
    expect(sawPlanAuditions, 'walkthrough never reached plan-auditions').toBe(true)
    expect(sawAuditionReview, 'walkthrough never reached audition-review').toBe(true)
    expect(sawOpenPackage, 'walkthrough never reached open-package').toBe(true)
  })

  it('keeps advanceWeek available while a greenlight sits queued for Development & Casting capacity', () => {
    const contended = contendedGreenlightStudio('bridge-rtp-queued-greenlight-advance-week')
    const session = new BridgeSession(contended.state, 'rtp-queued-greenlight-advance-week')
    const intent = session.snapshot().availableIntents.find(
      (candidate) =>
        candidate.kind === 'greenlightPicture' &&
        candidate.projectId === contended.targetProjectId,
    )
    expect(intent).toBeDefined()
    if (intent === undefined) throw new Error('Bridge omitted queue-admissible greenlight intent.')

    const result = submit(session, intent, 'rtp-queued-greenlight-advance-week-command')
    expect(result.accepted).toBe(true)
    if (!result.accepted) throw new Error(result.message)

    const queuedJourney = result.snapshot.journeyNotices.firstFilmJourney
    expect(queuedJourney?.next?.kind).toBe('advance-week')
    expect(
      result.availableIntents.some((candidate) => candidate.kind === 'advanceWeek'),
      'advanceWeek must remain available while a greenlight sits queued',
    ).toBe(true)
  })

  it('never lets an ambient concurrent commission bypass a guided blocker', () => {
    const ambient: AvailableIntent = {
      intentId: 'intent-v4-ambient',
      kind: 'commissionScreenplay',
      label: 'Commission another screenplay',
      detail: 'A concurrent physical-capacity choice.',
      projectId: null,
      castingSessionId: null,
      productionId: null,
    }
    expect(selectJourneyIntent([ambient], {
      next: { kind: 'review-casting-blocker' },
      scriptProjectId: 'script-blocked',
      productionId: null,
    })).toBeUndefined()
  })
})

function createHashForTest(value: string): string {
  // The bridge digest is intentionally the hash of canonical current save bytes.
  return createHash('sha256').update(value).digest('hex')
}
