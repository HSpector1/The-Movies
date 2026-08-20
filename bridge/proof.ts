import {
  BridgeSession,
  applyAvailableIntent,
  authoritativeDigest,
  createBridgeBootstrap,
  playNextMovieThroughAvailableIntents,
  selectJourneyIntent,
  type AcceptedCommandResponse,
  type SnapshotEnvelope,
} from './session.ts'
import {
  PROTOCOL_VERSION,
  SCHEMA_ID,
  SNAPSHOT_VERSION,
  type AvailableIntent,
  type AvailableIntentKind,
  type ControlEnvelope,
  type SubmitIntentCommand,
} from './protocol.ts'
import { exportSaveJson } from '../ui/src/engine/adapter.ts'

type EvidenceCapture = ReturnType<typeof evidenceCapture>

function command(
  session: BridgeSession,
  option: AvailableIntent,
  commandId: string,
): SubmitIntentCommand {
  return {
    protocolVersion: PROTOCOL_VERSION,
    schemaId: SCHEMA_ID,
    sessionId: session.sessionId,
    commandId,
    expectedStateRevision: session.stateRevision,
    type: 'submitIntent',
    payload: { intentId: option.intentId },
  }
}

function control(session: BridgeSession, commandId: string): ControlEnvelope {
  return {
    protocolVersion: PROTOCOL_VERSION,
    schemaId: SCHEMA_ID,
    sessionId: session.sessionId,
    commandId,
    expectedStateRevision: session.stateRevision,
  }
}

function submit(
  session: BridgeSession,
  option: AvailableIntent,
  commandId: string,
): AcceptedCommandResponse {
  const response = session.command(command(session, option, commandId))
  if (!response.accepted) {
    throw new Error(`${response.reasonCode}: ${response.message}`)
  }
  return response
}

function selectMovieIntent(snapshot: SnapshotEnvelope): AvailableIntent {
  const selected = selectJourneyIntent(
    snapshot.availableIntents,
    snapshot.snapshot.journeyNotices.firstFilmJourney,
  )
  if (selected === undefined) {
    throw new Error(
      `No legal movie intent at revision ${String(snapshot.stateRevision)} / ` +
        `${snapshot.snapshot.journeyNotices.firstFilmJourney?.headline ?? 'missing journey'}.`,
    )
  }
  return selected
}

function evidenceCapture(snapshot: SnapshotEnvelope) {
  return {
    revision: snapshot.stateRevision,
    week: snapshot.gameWeek,
    digest: snapshot.stateDigest,
    payloadBytes: snapshot.metrics.payloadBytes,
    serializationMs: snapshot.metrics.serializationMs,
    journey: snapshot.snapshot.journeyNotices.firstFilmJourney,
    availableIntents: snapshot.availableIntents.map((option) => ({
      kind: option.kind,
      projectId: option.projectId,
      castingSessionId: option.castingSessionId,
      productionId: option.productionId,
    })),
    buildings: snapshot.snapshot.lot.property?.buildings.map((building) => ({
      id: building.id,
      label: building.label,
      role: building.role,
      status: building.status,
    })) ?? [],
    stages: snapshot.snapshot.lot.stages?.map((stage) => ({
      facilityId: stage.facilityId,
      facilityName: stage.facilityName,
      buildingId: stage.buildingId,
    })) ?? [],
    sets: snapshot.snapshot.lot.sets?.map((set) => ({
      id: set.id,
      name: set.name,
      locationLabel: set.locationLabel,
      status: set.status,
    })) ?? [],
    people: snapshot.snapshot.people.people.map((person) => ({
      id: person.id,
      name: person.name,
      role: person.role,
      productionId: person.productionId,
    })),
    construction: snapshot.snapshot.construction.placement?.placements
      .filter((placement) => placement.status === 'underConstruction')
      .map((placement) => ({
        id: placement.id,
        name: placement.name,
        status: placement.status,
        completesWeek: placement.completesWeek,
        progress01: placement.progress01,
      })) ?? [],
    productionOperations: snapshot.snapshot.productions.productionOperations?.map((operation) => ({
      productionId: operation.productionId,
      title: operation.title,
      phase: operation.phase,
      taskStatus: operation.taskStatus,
      blocker: operation.blocker,
      currentCommand: operation.currentCommand,
    })) ?? [],
    releasedFilms: snapshot.snapshot.releaseResults.releasedFilms,
  }
}

const seed = process.env.PROJECT_STUDIO_BRIDGE_PROOF_SEED ?? 'current-game-unity-adoption-v2'
const bootstrap = createBridgeBootstrap(seed)
const session = new BridgeSession(bootstrap.state, 'current-game-adoption-proof')
const captures: Record<string, EvidenceCapture> = {
  wholeLot: evidenceCapture(session.snapshot()),
}
const productionBlockers: EvidenceCapture[] = []
const sequence: Array<{
  commandId: string
  kind: AvailableIntentKind
  label: string
  detail: string
  projectId: string | null
  castingSessionId: string | null
  productionId: string | null
  acceptedRevision: number
  week: number
  digest: string
}> = []
const timings: Array<{ processingMs: number; serializationMs: number; payloadBytes: number }> = []

const construction = session.snapshot().availableIntents.find(
  (option) => option.kind === 'startConstruction',
)
if (construction === undefined) throw new Error('Movie #2 gate did not expose legal construction.')
const headlessConstruction = applyAvailableIntent(bootstrap.state, construction.intentId)
if (!headlessConstruction.ok) throw new Error(headlessConstruction.error)
const constructionResponse = submit(session, construction, 'proof-construction')
captures.construction = evidenceCapture(constructionResponse)
sequence.push({
  commandId: constructionResponse.commandId,
  kind: construction.kind,
  label: construction.label,
  detail: construction.detail,
  projectId: construction.projectId,
  castingSessionId: construction.castingSessionId,
  productionId: construction.productionId,
  acceptedRevision: constructionResponse.stateRevision,
  week: constructionResponse.gameWeek,
  digest: constructionResponse.stateDigest,
})
timings.push({
  processingMs: constructionResponse.processingMs,
  serializationMs: constructionResponse.metrics.serializationMs,
  payloadBytes: constructionResponse.metrics.payloadBytes,
})

const releasedBefore = session.gameState.studio.releasedFilms.length
for (let guard = 0; guard < 128; guard++) {
  if (session.gameState.studio.releasedFilms.length > releasedBefore) break
  const before = session.snapshot()
  const selected = selectMovieIntent(before)
  if (selected.kind === 'resolveProductionBlocker') {
    productionBlockers.push(evidenceCapture(before))
  }
  const response = submit(session, selected, `proof-movie-two-${String(guard).padStart(3, '0')}`)
  sequence.push({
    commandId: response.commandId,
    kind: selected.kind,
    label: selected.label,
    detail: selected.detail,
    projectId: selected.projectId,
    castingSessionId: selected.castingSessionId,
    productionId: selected.productionId,
    acceptedRevision: response.stateRevision,
    week: response.gameWeek,
    digest: response.stateDigest,
  })
  timings.push({
    processingMs: response.processingMs,
    serializationMs: response.metrics.serializationMs,
    payloadBytes: response.metrics.payloadBytes,
  })
  const beat = response.snapshot.journeyNotices.firstFilmJourney?.beat
  if (beat === 'screenplay-ready') captures.screenplayReady ??= evidenceCapture(response)
  if (beat === 'auditions-reviewed') captures.auditionsReviewed ??= evidenceCapture(response)
  if (selected.kind === 'greenlightPicture') captures.rolesSelectedGreenlight = evidenceCapture(response)
  if (beat === 'shooting') captures.shooting ??= evidenceCapture(response)
  if (beat === 'post-production') captures.postProduction ??= evidenceCapture(response)
  if (beat === 'released') captures.releasedMovieTwo = evidenceCapture(response)
}
if (session.gameState.studio.releasedFilms.length !== releasedBefore + 1) {
  throw new Error('Movie #2 did not release inside the bounded legal-intent proof.')
}
captures.productionBlocker = productionBlockers[0]!

const finalSave = session.save(control(session, 'proof-save'))
if (!finalSave.accepted) throw new Error(`${finalSave.reasonCode}: ${finalSave.message}`)
const beforeMutationDigest = finalSave.stateDigest
const nextPictureIntent = selectMovieIntent(session.snapshot())
const mutated = submit(session, nextPictureIntent, 'proof-post-save-mutation')
const load = session.load(control(session, 'proof-load'))
if (!load.accepted) throw new Error(`${load.reasonCode}: ${load.message}`)
const reconnect = BridgeSession.fromSaveJson(finalSave.saveJson, 'fresh-proof-reconnect')

const direct = playNextMovieThroughAvailableIntents(headlessConstruction.next)
const directSave = exportSaveJson(direct.state)
const processingValues = timings.map((timing) => timing.processingMs)
const serializationValues = timings.map((timing) => timing.serializationMs)

const proof = {
  protocolVersion: PROTOCOL_VERSION,
  snapshotVersion: SNAPSHOT_VERSION,
  schemaId: SCHEMA_ID,
  seed,
  movieOne: {
    releasedAtWeek: bootstrap.state.market.tick,
    intentKinds: bootstrap.movieOneIntents.map((played) => played.option.kind),
    digestAtMovieTwoGate: authoritativeDigest(bootstrap.state),
  },
  movieTwo: {
    exactSequence: sequence,
    blockerCaptures: productionBlockers,
    finalWeek: load.gameWeek,
    finalDigest: load.stateDigest,
  },
  captures,
  determinism: {
    canonicalSaveBytes: Buffer.byteLength(finalSave.saveJson, 'utf8'),
    canonicalSaveDigest: finalSave.stateDigest,
    changedAfterPostSaveMutation: mutated.stateDigest !== beforeMutationDigest,
    loadRestoredDigest: load.stateDigest === finalSave.stateDigest,
    reconnectDigest: reconnect.snapshot().stateDigest,
    reconnectMatches: reconnect.snapshot().stateDigest === finalSave.stateDigest,
    exportImportExportByteIdentical: exportSaveJson(reconnect.gameState) === finalSave.saveJson,
    headlessSaveDigest: authoritativeDigest(direct.state),
    bridgeAndHeadlessByteIdentical: directSave === finalSave.saveJson,
  },
  performance: {
    commandCount: timings.length,
    snapshotPayloadBytesMax: Math.max(...timings.map((timing) => timing.payloadBytes)),
    processingMsMean:
      processingValues.reduce((sum, value) => sum + value, 0) / processingValues.length,
    processingMsMax: Math.max(...processingValues),
    serializationMsMean:
      serializationValues.reduce((sum, value) => sum + value, 0) / serializationValues.length,
    serializationMsMax: Math.max(...serializationValues),
  },
}

console.log(JSON.stringify(proof, null, 2))
