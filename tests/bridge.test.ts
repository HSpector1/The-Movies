import { createHash } from 'node:crypto'

import { describe, expect, it } from 'vitest'

import {
  AVAILABLE_INTENT_KEYS,
  BRIDGE_CONTRACT,
  PROTOCOL_VERSION,
  SCHEMA_ID,
  SNAPSHOT_VERSION,
  validateCommand,
  validateControl,
  type AvailableIntent,
  type AvailableIntentKind,
  type ControlEnvelope,
} from '../bridge/protocol.ts'
import {
  BridgeSession,
  applyAvailableIntent,
  authoritativeDigest,
  availableIntents,
  createBridgeBootstrap,
  createBridgeInitialState,
  playNextMovieThroughAvailableIntents,
  type CommandResponse,
} from '../bridge/session.ts'
import { exportSaveJson, studioLotSnapshot } from '../ui/src/engine/adapter.ts'

const PLAYER_PRIORITY: readonly AvailableIntentKind[] = [
  'commissionScreenplay',
  'advanceWeek',
  'acceptScreenplay',
  'startAuditions',
  'acknowledgeAuditions',
  'greenlightPicture',
  'resolveProductionBlocker',
] as const

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
  const candidates = session.snapshot().availableIntents.filter(
    (candidate) => candidate.kind !== 'startConstruction' && candidate.kind !== 'requestRewrite',
  )
  const selected = PLAYER_PRIORITY
    .map((kind) => candidates.find((candidate) => candidate.kind === kind))
    .find((candidate) => candidate !== undefined)
  if (selected === undefined) {
    throw new Error(
      `No playable movie intent at revision ${String(session.stateRevision)}: ` +
        session.snapshot().snapshot.firstFilmJourney?.headline,
    )
  }
  return selected
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

function expectOrderedSubsequence<T>(actual: readonly T[], expected: readonly T[]): void {
  let at = 0
  for (const value of actual) if (value === expected[at]) at++
  expect(at).toBe(expected.length)
}

describe('Current-game Unity adoption bridge', () => {
  it('pins protocol v2/projection v3 and fingerprints nested lot, journey, and exact intent fields', () => {
    expect(PROTOCOL_VERSION).toBe(2)
    expect(SNAPSHOT_VERSION).toBe(3)
    expect(SCHEMA_ID).toMatch(/^sha256:[0-9a-f]{64}$/)
    expect(Object.keys(
      BRIDGE_CONTRACT.$defs.StudioBridgeIntentOption.properties as Record<string, unknown>,
    )).toEqual(
      AVAILABLE_INTENT_KEYS,
    )
    expect(BRIDGE_CONTRACT.$defs.StudioLotSnapshot.additionalProperties).toBe(false)
    expect(BRIDGE_CONTRACT.$defs.StudioFirstFilmJourneySnapshot.required).toEqual(
      expect.arrayContaining(['productionId', 'scriptProjectId', 'ordinal', 'next', 'blocked']),
    )
    expect(BRIDGE_CONTRACT.$defs.StudioPlacedFacilitySnapshot.required).toEqual(
      expect.arrayContaining(['facilityId', 'status', 'completesWeek', 'progress01']),
    )

    const session = new BridgeSession(createBridgeInitialState('bridge-contract-v2'), 'contract')
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
    expect(validateCommand({ ...valid, protocolVersion: 1 })).toMatchObject({
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
    expect(kinds.filter((kind) => kind === 'resolveProductionBlocker').length).toBeGreaterThanOrEqual(3)
    for (const played of bootstrap.movieOneIntents) {
      expect(played.afterDigest).not.toBe(played.beforeDigest)
      expect(played.option.intentId).toMatch(/^intent-v2-[0-9a-f]{64}$/)
    }
  })

  it('plays exact Movie #2 end to end with current guidance, identities, blockers, and construction visible', () => {
    const session = new BridgeSession(
      createBridgeInitialState('bridge-movie-two-e2e'),
      'movie-two-session',
    )
    const initial = session.snapshot()
    expect(initial.snapshot.firstFilmJourney).toMatchObject({
      stage: 'released',
      ordinal: 1,
      next: { kind: 'commission' },
    })
    expect(initial.snapshot.property?.buildings.length).toBeGreaterThan(0)
    expect(initial.snapshot.stages?.length).toBeGreaterThanOrEqual(2)
    expect(initial.snapshot.sets?.length).toBeGreaterThanOrEqual(2)
    expect(initial.snapshot.people.length).toBeGreaterThan(0)
    expect(initial.snapshot.releasedFilms).toHaveLength(1)

    const construction = initial.availableIntents.find((intent) => intent.kind === 'startConstruction')
    expect(construction).toBeDefined()
    const constructionResult = submit(session, construction!, 'movie-two-construction')
    expect(constructionResult.accepted).toBe(true)
    if (!constructionResult.accepted) throw new Error(constructionResult.message)
    expect(
      constructionResult.snapshot.placement?.placements.some(
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
      const journey = before.snapshot.firstFilmJourney
      if (journey === undefined) throw new Error('Missing current guidance.')
      beats.add(journey.beat)
      if (session.gameState.studio.releasedFilms.length > releasedBefore) break

      const intent = chooseMovieIntent(session)
      if (movieTwoProjectId !== null && intent.projectId !== null) {
        expect(intent.projectId).toBe(movieTwoProjectId)
      }
      if (intent.kind === 'resolveProductionBlocker') {
        const operation = before.snapshot.productionOperations?.find(
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

      const afterJourney = result.snapshot.firstFilmJourney
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
    const journey = released.snapshot.firstFilmJourney
    expect(session.gameState.studio.releasedFilms).toHaveLength(releasedBefore + 1)
    expect(journey).toMatchObject({
      stage: 'released',
      beat: 'released',
      ordinal: 2,
      scriptProjectId: movieTwoProjectId,
      productionId: movieTwoProductionId,
      headline: 'PICTURE RELEASED',
    })
    expect(released.snapshot.releasedFilms.some((film) => film.id === movieTwoProductionId)).toBe(true)
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
    expect([...blockerKinds]).toEqual(expect.arrayContaining([
      'director-dispatch',
      'scenery-load-in',
      'take-scheduling',
    ]))
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
    expect(greenlightDetail).toMatch(/Director .+; Lead .+; Antagonist .+; Support .+; Production\/Craft .+\./)
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
    expect(reused).toMatchObject({ accepted: false, reasonCode: 'COMMAND_ID_REUSE' })
    const digestAfterAccept = authoritativeDigest(session.gameState)
    expect(reused.stateDigest).toBe(digestAfterAccept)

    const wrongSession = submit(session, currentIntent, 'one-command', session.stateRevision, 'other-session')
    expect(wrongSession).toMatchObject({ accepted: false, reasonCode: 'SESSION_MISMATCH' })
    expect(wrongSession.stateDigest).toBe(digestAfterAccept)

    const stale = submit(session, currentIntent, 'stale-command', 0)
    expect(stale).toMatchObject({ accepted: false, reasonCode: 'STALE_REVISION' })
    expect(stale.stateDigest).toBe(digestAfterAccept)

    const forgedParsed = validateCommand(command(session, 'intent-v2-forged', 'forged-command'))
    if (!forgedParsed.ok) throw new Error(forgedParsed.message)
    const forged = session.command(forgedParsed.command)
    expect(forged).toMatchObject({ accepted: false, reasonCode: 'INTENT_NOT_AVAILABLE' })
    expect(forged.stateDigest).toBe(digestAfterAccept)
    expect(authoritativeDigest(session.gameState)).toBe(digestAfterAccept)

    const invalidJsonShape = session.protocolReject(null, 'INVALID_JSON', 'Malformed JSON')
    expect(invalidJsonShape.stateDigest).toBe(digestAfterAccept)
    expect(Object.keys(invalidJsonShape).sort()).toEqual([
      'accepted', 'commandId', 'gameWeek', 'message', 'processingMs', 'protocolVersion',
      'reasonCode', 'schemaId', 'sessionId', 'stateDigest', 'stateRevision',
    ].sort())
  })

  it('uses opaque exact identities rather than titles and invalidates every prior-state intent', () => {
    const session = new BridgeSession(createBridgeInitialState('bridge-identity-routing'), 'identity')
    const commission = session.snapshot().availableIntents.find(
      (intent) => intent.kind === 'commissionScreenplay',
    )!
    const commissionResult = submit(session, commission, 'commission')
    expect(commissionResult.accepted).toBe(true)
    if (!commissionResult.accepted) throw new Error(commissionResult.message)
    const projectId = commissionResult.snapshot.firstFilmJourney?.scriptProjectId
    const title = commissionResult.snapshot.firstFilmJourney?.pictureTitle
    expect(projectId).toMatch(/^script-/)
    expect(title).toBeTruthy()

    const advance = commissionResult.availableIntents.find((intent) => intent.kind === 'advanceWeek')!
    expect(advance.projectId).toBe(projectId)
    const wire = JSON.stringify(command(session, advance.intentId, 'advance'))
    expect(wire).toContain(advance.intentId)
    expect(wire).not.toContain(title!)

    const oldCommission = submit(session, commission, 'old-intent-new-command')
    expect(oldCommission).toMatchObject({ accepted: false, reasonCode: 'INTENT_NOT_AVAILABLE' })
    expect(session.snapshot().snapshot.firstFilmJourney?.scriptProjectId).toBe(projectId)
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
    expect(reconnected.snapshot().snapshot.people.map((person) => person.id)).toEqual(
      loaded.snapshot.people.map((person) => person.id),
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
    expect(applyAvailableIntent(state, 'intent-v2-not-real')).toMatchObject({ ok: false })
    expect(exportSaveJson(state)).toBe(before)
  })
})

function createHashForTest(value: string): string {
  // The bridge digest is intentionally the hash of canonical current save bytes.
  return createHash('sha256').update(value).digest('hex')
}
