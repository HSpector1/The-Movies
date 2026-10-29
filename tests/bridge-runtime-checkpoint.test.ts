import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import {managedStudio as createManagedBridgeState} from './contracts/_contractFixtures.js'
import { createHash } from 'node:crypto'

import { describe, expect, it } from 'vitest'

import {
  BRIDGE_RUNTIME_CHECKPOINT_FORMAT,
  BRIDGE_RUNTIME_CHECKPOINT_VERSION,
  BridgeRuntimeCheckpointError,
  LEGACY_BRIDGE_RUNTIME_PROTOCOL_VERSION,
  LEGACY_BRIDGE_RUNTIME_SCHEMA_ID,
  PREVIOUS_BRIDGE_RUNTIME_PROTOCOL_4_SCHEMA_ID,
  SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS,
  appendBridgeRuntimeJournalEntry,
  createBridgeRuntimeCheckpoint,
  createBridgeRuntimeJournalEntry,
  decodeBridgeRuntimeCheckpoint,
  encodeBridgeRuntimeCheckpoint,
  hydrateBridgeRuntimeCheckpoint,
  loadBridgeRuntimeCheckpoint,
  type BridgeRuntimeCheckpointLimits,
  type BridgeRuntimeCheckpointV1,
  type BridgeRuntimeJournalEntryV1,
} from '../bridge/runtime-checkpoint.ts'
import {
  PROTOCOL_VERSION,
  SCHEMA_ID,
  type ControlEnvelope,
  type SubmitIntentCommand,
} from '../bridge/protocol.ts'
import {
  BridgeSession,
  createBridgeInitialState,
} from '../bridge/session.ts'
import { canonicalJson } from '../bridge/schema/canonical.ts'
import { exportSaveJson } from '../ui/src/engine/adapter.ts'
import { LIVE_SAVE_VERSION, exportSave, makeSaveV14 } from '../src/core/index.js'
import * as shipped47Save from '../src/core/save.js'
import { accepted45 } from './helpers/1368-recovery-witnesses.js'

function sha256(value: string): string {
  return createHash('sha256').update(value, 'utf8').digest('hex')
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

type Fixture = {
  checkpoint: BridgeRuntimeCheckpointV1
  commandEntry: BridgeRuntimeJournalEntryV1
  saveEntry: BridgeRuntimeJournalEntryV1
  currentSaveJson: string
  savedSaveJson: string
}

function fixture(): Fixture {
  const session = new BridgeSession(
    createBridgeInitialState('bridge-runtime-checkpoint'),
    'bridge-runtime-checkpoint-session',
  )
  const option = session.snapshot().availableIntents.find(
    (candidate) => candidate.kind === 'commissionScreenplay',
  )
  if (option === undefined) throw new Error('Checkpoint fixture omitted commission intent.')
  const command: SubmitIntentCommand = {
    protocolVersion: PROTOCOL_VERSION,
    schemaId: SCHEMA_ID,
    sessionId: session.sessionId,
    commandId: 'checkpoint-command',
    expectedStateRevision: session.stateRevision,
    type: 'submitIntent',
    payload: { intentId: option.intentId },
  }
  const commandResponse = session.command(command)
  if (!commandResponse.accepted) throw new Error(commandResponse.message)
  const commandEntry = createBridgeRuntimeJournalEntry('command', command, commandResponse)

  const saveControl: ControlEnvelope = {
    protocolVersion: PROTOCOL_VERSION,
    schemaId: SCHEMA_ID,
    sessionId: session.sessionId,
    commandId: 'checkpoint-save',
    expectedStateRevision: session.stateRevision,
  }
  const saveResponse = session.save(saveControl)
  if (!saveResponse.accepted) throw new Error(saveResponse.message)
  const saveEntry = createBridgeRuntimeJournalEntry('save', saveControl, saveResponse)
  const currentSaveJson = exportSaveJson(session.gameState)
  const checkpoint = createBridgeRuntimeCheckpoint({
    sessionId: session.sessionId,
    stateRevision: session.stateRevision,
    currentSaveJson,
    savedSaveJson: saveResponse.saveJson,
    journal: [commandEntry, saveEntry],
  })
  return {
    checkpoint,
    commandEntry,
    saveEntry,
    currentSaveJson,
    savedSaveJson: saveResponse.saveJson,
  }
}

function protocol3Bytes(checkpoint: BridgeRuntimeCheckpointV1): string {
  const journal = checkpoint.journal.map((entry) => {
    const request = JSON.parse(entry.requestJson) as Record<string, unknown>
    const response = JSON.parse(entry.responseJson) as Record<string, unknown>
    request.protocolVersion = LEGACY_BRIDGE_RUNTIME_PROTOCOL_VERSION
    request.schemaId = LEGACY_BRIDGE_RUNTIME_SCHEMA_ID
    response.protocolVersion = LEGACY_BRIDGE_RUNTIME_PROTOCOL_VERSION
    response.schemaId = LEGACY_BRIDGE_RUNTIME_SCHEMA_ID
    return {
      ...entry,
      requestJson: canonicalJson(request),
      responseJson: canonicalJson(response),
    }
  })
  const legacy = {
    ...checkpoint,
    protocolVersion: LEGACY_BRIDGE_RUNTIME_PROTOCOL_VERSION,
    schemaId: LEGACY_BRIDGE_RUNTIME_SCHEMA_ID,
    journalDigest: sha256(canonicalJson(journal)),
    journal,
  }
  return `${canonicalJson(legacy)}\n`
}

function previousProtocol4Bytes(checkpoint: BridgeRuntimeCheckpointV1): string {
  const journal = checkpoint.journal.map((entry) => {
    const request = JSON.parse(entry.requestJson) as Record<string, unknown>
    const response = JSON.parse(entry.responseJson) as Record<string, unknown>
    request.schemaId = PREVIOUS_BRIDGE_RUNTIME_PROTOCOL_4_SCHEMA_ID
    response.schemaId = PREVIOUS_BRIDGE_RUNTIME_PROTOCOL_4_SCHEMA_ID
    return {
      ...entry,
      requestJson: canonicalJson(request),
      responseJson: canonicalJson(response),
    }
  })
  return `${canonicalJson({
    ...checkpoint,
    schemaId: PREVIOUS_BRIDGE_RUNTIME_PROTOCOL_4_SCHEMA_ID,
    journalDigest: sha256(canonicalJson(journal)),
    journal,
  })}\n`
}

// ── P04A REOPEN fixtures: genuine old-shape prior protocol-4 checkpoints ────
// Built from real V14 saves (minted with the exported `makeSaveV14`, never the
// Owner's real profile) plus wholly opaque journal bodies, so these exercise
// the unified prior-import path exactly as a real durable checkpoint written
// under an old protocol-4 schema would be shaped: the save slots are genuine,
// versioned save bytes; the journal is deliberately NOT current-contract-
// shaped, because the new import path must never parse it.
//
// Seeded with `createManagedBridgeState` (founding resolved, no picture
// played through to release) rather than `createBridgeInitialState` — a
// genuine prior-era protocol-4 world predates the `releaseCommitted` studio
// event kind, so its state can never legally contain a release drive. Using
// the full first-movie playthrough here would mint a `releaseCommitted` row
// that the frozen V14 validator correctly refuses.
function v14CurrentSaveJson(seed: string): string {
  return exportSave(makeSaveV14(createManagedBridgeState(seed)))
}

function opaqueJournalEntry(commandId: string, tag: string): BridgeRuntimeJournalEntryV1 {
  return {
    route: 'command',
    commandId,
    requestJson: canonicalJson({ opaqueHistoricalRequest: tag, commandId }),
    responseJson: canonicalJson({ opaqueHistoricalResponse: tag, commandId }),
  }
}

type PriorProtocol4Fixture = {
  schemaId: string
  sessionId: string
  stateRevision: number
  currentSaveJson: string
  savedSaveJson: string | null
  journal: readonly BridgeRuntimeJournalEntryV1[]
}

function priorProtocol4Bytes(fixture: PriorProtocol4Fixture): string {
  const currentStateDigest = sha256(fixture.currentSaveJson)
  const savedStateDigest = fixture.savedSaveJson === null ? null : sha256(fixture.savedSaveJson)
  const journal = [...fixture.journal]
  const checkpoint = {
    format: BRIDGE_RUNTIME_CHECKPOINT_FORMAT,
    checkpointVersion: BRIDGE_RUNTIME_CHECKPOINT_VERSION,
    protocolVersion: PROTOCOL_VERSION,
    schemaId: fixture.schemaId,
    sessionId: fixture.sessionId,
    stateRevision: fixture.stateRevision,
    currentSaveJson: fixture.currentSaveJson,
    currentStateDigest,
    savedSaveJson: fixture.savedSaveJson,
    savedStateDigest,
    journalDigest: sha256(canonicalJson(journal)),
    journal,
  }
  return `${canonicalJson(checkpoint)}\n`
}

const V4_SCHEMA_ID = 'sha256:f84ae77ec59a0d7ca7cdd89115456504ddecbde2c6e3839936e4951bd65bce61'
// Relationship slice B (1358-N P2): the outgoing projection-56 identity, the checked-in
// contract-manifest schemaId before the projection-57 bump (5245072a).
const OUTGOING_56 = 'sha256:349b2d3ec0614f2c9a6c481888e826651c230c6bcc9c84b2b13a82b566bfcec1'

describe('BridgeRuntimeCheckpointV1', () => {
  it('forward-migrates protocol 3 by preserving both V15 slots and discarding incompatible replay bytes', () => {
    const source = fixture()
    const legacyBytes = protocol3Bytes(source.checkpoint)
    expect(() => decodeBridgeRuntimeCheckpoint(legacyBytes)).toThrow(/protocolVersion/)

    const loaded = loadBridgeRuntimeCheckpoint(
      legacyBytes,
      undefined,
      () => 'runtime-protocol-4-session',
    )
    expect(loaded.migratedFromProtocolVersion).toBe(3)
    expect(loaded.hydrated.checkpoint).toMatchObject({
      protocolVersion: PROTOCOL_VERSION,
      schemaId: SCHEMA_ID,
      sessionId: 'runtime-protocol-4-session',
      stateRevision: 0,
      currentSaveJson: source.currentSaveJson,
      savedSaveJson: source.savedSaveJson,
      journal: [],
    })
    expect(loaded.hydrated.checkpoint.currentStateDigest).toBe(sha256(source.currentSaveJson))
    expect(loaded.hydrated.checkpoint.savedStateDigest).toBe(sha256(source.savedSaveJson))
    expect(loaded.hydrated.currentSave.saveVersion).toBe(LIVE_SAVE_VERSION)
    expect(loaded.hydrated.savedSave?.saveVersion).toBe(LIVE_SAVE_VERSION)
    expect(() => decodeBridgeRuntimeCheckpoint(
      encodeBridgeRuntimeCheckpoint(loaded.hydrated.checkpoint),
    )).not.toThrow()

    const corrupted = JSON.parse(legacyBytes) as Record<string, unknown>
    corrupted.journalDigest = '0'.repeat(64)
    expect(() => loadBridgeRuntimeCheckpoint(
      `${canonicalJson(corrupted)}\n`,
      undefined,
      () => 'runtime-protocol-4-session',
    )).toThrow(/journalDigest/)
  })

  it('rolls the previous protocol-4 schema forward without changing either V15 save slot', () => {
    const source = fixture()
    const priorBytes = previousProtocol4Bytes(source.checkpoint)
    expect(() => decodeBridgeRuntimeCheckpoint(priorBytes)).toThrow(/schemaId/)

    const loaded = loadBridgeRuntimeCheckpoint(
      priorBytes,
      undefined,
      () => 'runtime-current-schema-session',
    )
    expect(loaded.migratedFromProtocolVersion).toBe(PROTOCOL_VERSION)
    expect(loaded.hydrated.checkpoint).toMatchObject({
      protocolVersion: PROTOCOL_VERSION,
      schemaId: SCHEMA_ID,
      sessionId: 'runtime-current-schema-session',
      stateRevision: 0,
      currentSaveJson: source.currentSaveJson,
      currentStateDigest: sha256(source.currentSaveJson),
      savedSaveJson: source.savedSaveJson,
      savedStateDigest: sha256(source.savedSaveJson),
      journal: [],
    })
    expect(loaded.hydrated.currentSave.saveVersion).toBe(LIVE_SAVE_VERSION)
    expect(loaded.hydrated.savedSave?.saveVersion).toBe(LIVE_SAVE_VERSION)

    const corrupted = JSON.parse(priorBytes) as Record<string, unknown>
    corrupted.journalDigest = '0'.repeat(64)
    expect(() => loadBridgeRuntimeCheckpoint(
      `${canonicalJson(corrupted)}\n`,
      undefined,
      () => 'runtime-current-schema-session',
    )).toThrow(/journalDigest/)
  })

  it('rolls an authentic previous protocol-4 checkpoint with no explicit save slot', () => {
    const source = new BridgeSession(
      createBridgeInitialState('bridge-runtime-checkpoint-prior-p4-unsaved'),
      'bridge-runtime-checkpoint-prior-p4-unsaved-session',
    ).exportRuntimeCheckpoint()
    expect(source.savedSaveJson).toBeNull()
    expect(source.savedStateDigest).toBeNull()

    const loaded = loadBridgeRuntimeCheckpoint(
      previousProtocol4Bytes(source),
      undefined,
      () => 'runtime-current-schema-unsaved-session',
    )
    expect(loaded.migratedFromProtocolVersion).toBe(PROTOCOL_VERSION)
    expect(loaded.hydrated.checkpoint).toMatchObject({
      protocolVersion: PROTOCOL_VERSION,
      schemaId: SCHEMA_ID,
      sessionId: 'runtime-current-schema-unsaved-session',
      stateRevision: 0,
      currentSaveJson: source.currentSaveJson,
      currentStateDigest: source.currentStateDigest,
      savedSaveJson: null,
      savedStateDigest: null,
      journal: [],
    })
    expect(loaded.hydrated.savedSave).toBeNull()
  })

  it('rejects an impossible open-founding state attributed to the previous protocol-4 runtime', () => {
    const rawFounding = BridgeSession.createRuntime().exportRuntimeCheckpoint()
    const impossiblePriorBytes = previousProtocol4Bytes(rawFounding)

    expect(() => loadBridgeRuntimeCheckpoint(
      impossiblePriorBytes,
      undefined,
      () => 'runtime-impossible-founding-session',
    )).toThrow(/previous protocol-4 production authority cannot contain an open founding draft/)
  })

  it('encodes one exact closed canonical shape with one LF and hydrates stable V15 bytes', () => {
    const source = fixture()
    const encoded = encodeBridgeRuntimeCheckpoint(source.checkpoint)
    expect(encoded.endsWith('\n')).toBe(true)
    expect(encoded.endsWith('\n\n')).toBe(false)
    expect(encoded).not.toContain('\r')
    expect(encoded).toBe(`${canonicalJson(source.checkpoint)}\n`)

    const hydrated = decodeBridgeRuntimeCheckpoint(encoded)
    expect(hydrated.checkpoint).toEqual(source.checkpoint)
    expect(encodeBridgeRuntimeCheckpoint(hydrated.checkpoint)).toBe(encoded)
    expect(hydrated.currentSave.saveVersion).toBe(LIVE_SAVE_VERSION)
    expect(hydrated.savedSave?.saveVersion).toBe(LIVE_SAVE_VERSION)
    expect(hydrated.checkpoint.currentSaveJson).toBe(source.currentSaveJson)
    expect(hydrated.checkpoint.savedSaveJson).toBe(source.savedSaveJson)
    expect(hydrated.checkpoint.currentStateDigest).toBe(sha256(source.currentSaveJson))
    expect(hydrated.checkpoint.savedStateDigest).toBe(sha256(source.savedSaveJson))
    expect(hydrated.checkpointBytes).toBe(Buffer.byteLength(encoded, 'utf8'))
    expect(hydrated.journal.map((entry) => entry.route)).toEqual(['command', 'save'])

    expect(Object.keys(hydrated.checkpoint).sort()).toEqual([
      'checkpointVersion',
      'currentSaveJson',
      'currentStateDigest',
      'format',
      'journal',
      'journalDigest',
      'protocolVersion',
      'savedSaveJson',
      'savedStateDigest',
      'schemaId',
      'sessionId',
      'stateRevision',
    ])
    expect(hydrated.checkpoint).toMatchObject({
      format: BRIDGE_RUNTIME_CHECKPOINT_FORMAT,
      checkpointVersion: BRIDGE_RUNTIME_CHECKPOINT_VERSION,
      protocolVersion: PROTOCOL_VERSION,
      schemaId: SCHEMA_ID,
    })
    expect(JSON.parse(source.currentSaveJson)).not.toHaveProperty('journal')
  })

  it('requires canonical checkpoint bytes followed by exactly one LF', () => {
    const checkpoint = fixture().checkpoint
    const canonical = encodeBridgeRuntimeCheckpoint(checkpoint)
    expect(() => decodeBridgeRuntimeCheckpoint(canonical.trimEnd())).toThrow(/exactly one LF/)
    expect(() => decodeBridgeRuntimeCheckpoint(canonical.replace(/\n$/, '\r\n'))).toThrow(/exactly one LF/)
    expect(() => decodeBridgeRuntimeCheckpoint(` ${canonical}`)).toThrow(/canonical JSON/)
    expect(() => decodeBridgeRuntimeCheckpoint(`${canonical}\n`)).toThrow(/exactly one LF/)
  })

  it('rejects missing and additional roots plus incompatible format, version, protocol, and schema', () => {
    const checkpoint = fixture().checkpoint
    const extra = { ...checkpoint, timestamp: 'not-authorized' }
    expect(() => hydrateBridgeRuntimeCheckpoint(extra)).toThrow(/unknown field "timestamp"/)
    const hidden = clone(checkpoint) as BridgeRuntimeCheckpointV1 & { secret?: string }
    Object.defineProperty(hidden, 'secret', { value: 'not-authorized', enumerable: false })
    expect(() => hydrateBridgeRuntimeCheckpoint(hidden)).toThrow(/unknown field "secret"/)

    const missing = clone(checkpoint) as Partial<BridgeRuntimeCheckpointV1>
    delete missing.sessionId
    expect(() => hydrateBridgeRuntimeCheckpoint(missing)).toThrow(/missing required field "sessionId"/)
    expect(() => hydrateBridgeRuntimeCheckpoint({ ...checkpoint, format: 'other' })).toThrow(/checkpoint\.format/)
    expect(() => hydrateBridgeRuntimeCheckpoint({ ...checkpoint, checkpointVersion: 2 })).toThrow(/checkpointVersion/)
    expect(() => hydrateBridgeRuntimeCheckpoint({ ...checkpoint, protocolVersion: 99 })).toThrow(/protocolVersion/)
    expect(() => hydrateBridgeRuntimeCheckpoint({ ...checkpoint, schemaId: 'sha256:wrong' })).toThrow(/schemaId/)
    expect(Object.keys(checkpoint).some((key) => /time|secret|token|path/i.test(key))).toBe(false)
  })

  it('requires untouched canonical V15 current and explicit-save bytes with exact digests', () => {
    const checkpoint = fixture().checkpoint
    expect(() => hydrateBridgeRuntimeCheckpoint({
      ...checkpoint,
      currentStateDigest: '0'.repeat(64),
    })).toThrow(/does not match currentSaveJson/)
    expect(() => hydrateBridgeRuntimeCheckpoint({
      ...checkpoint,
      savedStateDigest: 'f'.repeat(64),
    })).toThrow(/does not match savedSaveJson/)
    expect(() => hydrateBridgeRuntimeCheckpoint({
      ...checkpoint,
      savedSaveJson: null,
    })).toThrow(/must be null exactly/)
    expect(() => hydrateBridgeRuntimeCheckpoint({
      ...checkpoint,
      savedSaveJson: null,
      savedStateDigest: null,
    })).toThrow(/latest accepted save journal response/)
    expect(() => createBridgeRuntimeCheckpoint({
      sessionId: checkpoint.sessionId,
      stateRevision: checkpoint.stateRevision,
      currentSaveJson: checkpoint.currentSaveJson,
      savedSaveJson: null,
      journal: [fixture().commandEntry],
    })).not.toThrow()

    const differentSavedJson = exportSaveJson(createBridgeInitialState('checkpoint-different-save'))
    expect(() => hydrateBridgeRuntimeCheckpoint({
      ...checkpoint,
      savedSaveJson: differentSavedJson,
      savedStateDigest: sha256(differentSavedJson),
    })).toThrow(/latest accepted save journal response/)

    const nonCanonicalSave = `${checkpoint.currentSaveJson}\n`
    expect(() => createBridgeRuntimeCheckpoint({
      sessionId: checkpoint.sessionId,
      stateRevision: checkpoint.stateRevision,
      currentSaveJson: nonCanonicalSave,
      savedSaveJson: checkpoint.savedSaveJson,
      journal: checkpoint.journal,
      // 1327-C sweep (C15, S8 form): the live save version moved past V38; the
      // guard's own message is version-aware (`bridge/runtime-checkpoint.ts:501`,
      // `must preserve the canonical V${LIVE_SAVE_VERSION} save bytes exactly`).
      // The refused-non-canonical-bytes premise still holds, only the number
      // in its own message moved with the live version.
    })).toThrow(new RegExp(`canonical V${LIVE_SAVE_VERSION} save bytes exactly`)) // 1370-AR r3: the message is built from LIVE_SAVE_VERSION (bridge/runtime-checkpoint.ts)

    const forgedSave = JSON.parse(checkpoint.currentSaveJson) as Record<string, unknown>
    forgedSave['bridgeJournal'] = []
    expect(() => createBridgeRuntimeCheckpoint({
      sessionId: checkpoint.sessionId,
      stateRevision: checkpoint.stateRevision,
      currentSaveJson: canonicalJson(forgedSave),
      savedSaveJson: checkpoint.savedSaveJson,
      journal: checkpoint.journal,
    })).toThrow(/unknown field "bridgeJournal"/)
  })

  it('validates route-specific requests, responses, identity, session, revision, and canonical JSON', () => {
    const source = fixture()
    const checkpoint = source.checkpoint
    expect(() => hydrateBridgeRuntimeCheckpoint({
      ...checkpoint,
      journal: [{ ...source.commandEntry, route: 'save' }],
    })).toThrow(/save request contract/)
    expect(() => hydrateBridgeRuntimeCheckpoint({
      ...checkpoint,
      journal: [{ ...source.commandEntry, commandId: 'different' }],
    })).toThrow(/commandId does not match/)

    const wrongSessionRequest = JSON.parse(source.commandEntry.requestJson) as Record<string, unknown>
    wrongSessionRequest['sessionId'] = 'different-session'
    expect(() => hydrateBridgeRuntimeCheckpoint({
      ...checkpoint,
      journal: [{ ...source.commandEntry, requestJson: canonicalJson(wrongSessionRequest) }],
    })).toThrow(/request sessionId/)

    const wrongSessionResponse = JSON.parse(source.commandEntry.responseJson) as Record<string, unknown>
    wrongSessionResponse['sessionId'] = 'different-session'
    expect(() => hydrateBridgeRuntimeCheckpoint({
      ...checkpoint,
      journal: [{ ...source.commandEntry, responseJson: canonicalJson(wrongSessionResponse) }],
    })).toThrow(/response sessionId/)

    const wrongSchemaRequest = JSON.parse(source.commandEntry.requestJson) as Record<string, unknown>
    wrongSchemaRequest['schemaId'] = 'sha256:different-request-schema'
    expect(() => hydrateBridgeRuntimeCheckpoint({
      ...checkpoint,
      journal: [{ ...source.commandEntry, requestJson: canonicalJson(wrongSchemaRequest) }],
    })).toThrow(/request schemaId/)

    const wrongSchemaResponse = JSON.parse(source.commandEntry.responseJson) as Record<string, unknown>
    wrongSchemaResponse['schemaId'] = 'sha256:different-response-schema'
    expect(() => hydrateBridgeRuntimeCheckpoint({
      ...checkpoint,
      journal: [{ ...source.commandEntry, responseJson: canonicalJson(wrongSchemaResponse) }],
    })).toThrow(/response schemaId/)

    const wrongRevision = JSON.parse(source.commandEntry.responseJson) as Record<string, unknown>
    wrongRevision['stateRevision'] = 0
    expect(() => hydrateBridgeRuntimeCheckpoint({
      ...checkpoint,
      journal: [{ ...source.commandEntry, responseJson: canonicalJson(wrongRevision) }],
    })).toThrow(/response revision does not match/)

    expect(() => hydrateBridgeRuntimeCheckpoint({
      ...checkpoint,
      journal: [{ ...source.commandEntry, requestJson: ` ${source.commandEntry.requestJson}` }],
    })).toThrow(/canonical JSON/)
    expect(() => hydrateBridgeRuntimeCheckpoint({
      ...checkpoint,
      journal: [{ ...source.commandEntry, unexpected: true }],
    })).toThrow(/unknown field "unexpected"/)

    const wrongCurrentDigest = JSON.parse(source.commandEntry.responseJson) as Record<string, unknown>
    wrongCurrentDigest['stateDigest'] = 'f'.repeat(64)
    expect(() => hydrateBridgeRuntimeCheckpoint({
      ...checkpoint,
      journal: [{ ...source.commandEntry, responseJson: canonicalJson(wrongCurrentDigest) }],
    })).toThrow(/current checkpoint state at the same revision/)

    const wrongCurrentWeek = JSON.parse(source.commandEntry.responseJson) as Record<string, unknown>
    wrongCurrentWeek['gameWeek'] = (wrongCurrentWeek['gameWeek'] as number) + 1
    expect(() => hydrateBridgeRuntimeCheckpoint({
      ...checkpoint,
      journal: [{ ...source.commandEntry, responseJson: canonicalJson(wrongCurrentWeek) }],
    })).toThrow(/current checkpoint state at the same revision/)
  })

  it('binds exact historical bytes and rejection semantics to their original route', () => {
    const source = fixture()
    const tamperedResponse = JSON.parse(source.commandEntry.responseJson) as Record<string, unknown>
    tamperedResponse['message'] = 'Schema-valid but not the response that was committed.'
    expect(() => hydrateBridgeRuntimeCheckpoint({
      ...source.checkpoint,
      journal: [{
        ...source.commandEntry,
        responseJson: canonicalJson(tamperedResponse),
      }, source.saveEntry],
    })).toThrow(/journalDigest.*canonical journal bytes/)

    const noSaveSession = new BridgeSession(
      createBridgeInitialState('bridge-runtime-route-rejection'),
      'bridge-runtime-route-rejection',
    )
    const noSaveControl: ControlEnvelope = {
      protocolVersion: PROTOCOL_VERSION,
      schemaId: SCHEMA_ID,
      sessionId: noSaveSession.sessionId,
      commandId: 'route-rejection',
      expectedStateRevision: 0,
    }
    const noSave = noSaveSession.load(noSaveControl)
    if (noSave.accepted) throw new Error('Expected no-save rejection fixture.')
    const loadEntry = createBridgeRuntimeJournalEntry('load', noSaveControl, noSave)
    const rebound = { ...loadEntry, route: 'save' as const }
    expect(() => createBridgeRuntimeCheckpoint({
      sessionId: noSaveSession.sessionId,
      stateRevision: 0,
      currentSaveJson: exportSaveJson(noSaveSession.gameState),
      savedSaveJson: null,
      journal: [rebound],
    })).toThrow(/NO_SAVE is not a journalable save rejection/)
  })

  it('rejects duplicate identities and revision-regressing journal order', () => {
    const source = fixture()
    expect(() => hydrateBridgeRuntimeCheckpoint({
      ...source.checkpoint,
      journal: [source.commandEntry, source.commandEntry],
    })).toThrow(/duplicates an earlier journal identity/)
    const newerRequest = JSON.parse(source.commandEntry.requestJson) as Record<string, unknown>
    newerRequest['commandId'] = 'checkpoint-newer-command'
    newerRequest['expectedStateRevision'] = 1
    const newerResponse = JSON.parse(source.commandEntry.responseJson) as Record<string, unknown>
    newerResponse['commandId'] = 'checkpoint-newer-command'
    newerResponse['stateRevision'] = 2
    const newerEntry: BridgeRuntimeJournalEntryV1 = {
      route: 'command',
      commandId: 'checkpoint-newer-command',
      requestJson: canonicalJson(newerRequest),
      responseJson: canonicalJson(newerResponse),
    }
    expect(() => hydrateBridgeRuntimeCheckpoint({
      ...source.checkpoint,
      stateRevision: 2,
      journal: [newerEntry, source.commandEntry],
    })).toThrow(/response revisions must be non-decreasing/)
  })

  it('binds the root revision to the terminal journal response', () => {
    const source = fixture()
    expect(() => hydrateBridgeRuntimeCheckpoint({
      ...source.checkpoint,
      stateRevision: source.checkpoint.stateRevision + 1,
    })).toThrow(/stateRevision.*terminal journal response revision/)

    const fresh = new BridgeSession(
      createBridgeInitialState('bridge-runtime-empty-revision'),
      'bridge-runtime-empty-revision',
    ).exportRuntimeCheckpoint()
    expect(fresh.journal).toHaveLength(0)
    expect(() => hydrateBridgeRuntimeCheckpoint({
      ...fresh,
      stateRevision: 1,
    })).toThrow(/stateRevision.*must be 0 when the journal is empty/)
  })

  it('returns a normalized prospective append only after identity and capacity validation', () => {
    const source = fixture()
    const base = createBridgeRuntimeCheckpoint({
      sessionId: source.checkpoint.sessionId,
      stateRevision: source.checkpoint.stateRevision,
      currentSaveJson: source.currentSaveJson,
      savedSaveJson: source.savedSaveJson,
      journal: [source.commandEntry],
    })
    const appended = appendBridgeRuntimeJournalEntry(base, source.saveEntry)
    expect(appended.journal).toEqual([source.commandEntry, source.saveEntry])
    expect(() => appendBridgeRuntimeJournalEntry(appended, source.saveEntry)).toThrow(/duplicates/)
    expect(() => appendBridgeRuntimeJournalEntry(base, source.saveEntry, {
      maxCheckpointBytes: 64 * 1024 * 1024,
      maxJournalEntries: 1,
      maxJournalBytes: 32 * 1024 * 1024,
    })).toThrow(/maximum is 1/)
    expect(base.journal).toEqual([source.commandEntry])
  })

  it('enforces injectable entry, journal-byte, and checkpoint-byte bounds before hydration', () => {
    const source = fixture()
    const encoded = encodeBridgeRuntimeCheckpoint(source.checkpoint)
    const hydrated = decodeBridgeRuntimeCheckpoint(encoded)
    const limits = (
      overrides: Partial<BridgeRuntimeCheckpointLimits>,
    ): BridgeRuntimeCheckpointLimits => ({
      maxCheckpointBytes: 64 * 1024 * 1024,
      maxJournalEntries: 512,
      maxJournalBytes: 32 * 1024 * 1024,
      ...overrides,
    })

    expect(() => hydrateBridgeRuntimeCheckpoint(
      source.checkpoint,
      limits({ maxJournalEntries: 1 }),
    )).toThrow(/maximum is 1/)
    expect(() => hydrateBridgeRuntimeCheckpoint(
      source.checkpoint,
      limits({ maxJournalBytes: hydrated.journalBytes - 1 }),
    )).toThrow(/checkpoint\.journal: uses/)
    expect(() => decodeBridgeRuntimeCheckpoint(
      encoded,
      limits({ maxCheckpointBytes: Buffer.byteLength(encoded, 'utf8') - 1 }),
    )).toThrow(/checkpoint: uses/)
    expect(() => hydrateBridgeRuntimeCheckpoint(
      source.checkpoint,
      limits({ maxJournalEntries: 2, maxJournalBytes: hydrated.journalBytes }),
    )).not.toThrow()
  })

  it('validates an accepted save response V15 payload and digest before journaling it', () => {
    const source = fixture()
    const badResponse = JSON.parse(source.saveEntry.responseJson) as Record<string, unknown>
    badResponse['stateDigest'] = '0'.repeat(64)
    expect(() => hydrateBridgeRuntimeCheckpoint({
      ...source.checkpoint,
      journal: [
        source.commandEntry,
        { ...source.saveEntry, responseJson: canonicalJson(badResponse) },
      ],
    })).toThrow(/accepted save response digest/)
  })

  it('surfaces a typed checkpoint error with the exact failing path', () => {
    try {
      hydrateBridgeRuntimeCheckpoint({})
      throw new Error('Expected checkpoint validation to fail.')
    } catch (error) {
      expect(error).toBeInstanceOf(BridgeRuntimeCheckpointError)
      expect((error as BridgeRuntimeCheckpointError).checkpointPath).toBe('checkpoint')
    }
  })
})

describe('P04A REOPEN — enumerated prior protocol-4 checkpoint import', () => {
  it('preserves both actual accepted P12 founding slots through the P13 save migration', () => {
    const savedSaveJson = gunzipSync(readFileSync(new URL('./fixtures/p13a/accepted-v19.json.gz', import.meta.url))).toString('utf8')
    const currentSaveJson = gunzipSync(readFileSync(new URL('./fixtures/p13a/accepted-v19-hired.json.gz', import.meta.url))).toString('utf8')
    expect(currentSaveJson).not.toBe(savedSaveJson)
    const prior = priorProtocol4Bytes({
      schemaId: 'sha256:8b2569b1f925bedf214ee556841fe28b61e544f1f13bb4741c84a0a318e81a85',
      sessionId: 'native-p12-before-upgrade', stateRevision: 1,
      currentSaveJson, savedSaveJson, journal: [],
    })
    const loaded = loadBridgeRuntimeCheckpoint(prior, undefined, () => 'native-p12-after-upgrade')
    expect(loaded.hydrated.checkpoint).toMatchObject({
      stateRevision: 0, schemaId: SCHEMA_ID,
      sessionId: 'native-p12-after-upgrade', journal: [],
    })
    expect(loaded.hydrated.currentSave.state.founding).not.toBeNull()
    expect(loaded.hydrated.savedSave!.state.founding).not.toBeNull()
    expect(loaded.hydrated.currentSave.state.contracts).toEqual(JSON.parse(currentSaveJson).state.contracts)
    expect(loaded.hydrated.savedSave!.state.contracts).toEqual(JSON.parse(savedSaveJson).state.contracts)
    expect(loaded.hydrated.currentSave.state.technology.projects).toEqual([])
    expect(loaded.hydrated.savedSave!.state.technology.projects).toEqual([])
    expect(loaded.hydrated.currentSave.state.studio.cash).toBe(JSON.parse(currentSaveJson).state.studio.cash)
    const encoded = encodeBridgeRuntimeCheckpoint(loaded.hydrated.checkpoint)
    expect(loadBridgeRuntimeCheckpoint(encoded).migratedFromProtocolVersion).toBeNull()
  })

  it('migrates a v4-identity (f84ae77e) checkpoint with a V14 current save and an opaque 2-entry journal', () => {
    const seedState = createManagedBridgeState('prior-p4-v4-basic')
    const currentSaveJson = exportSave(makeSaveV14(seedState))
    const priorBytes = priorProtocol4Bytes({
      schemaId: V4_SCHEMA_ID,
      sessionId: 'prior-v4-basic-session',
      stateRevision: 21,
      currentSaveJson,
      savedSaveJson: null,
      journal: [
        opaqueJournalEntry('prior-command-1', 'alpha'),
        opaqueJournalEntry('prior-command-2', 'beta'),
      ],
    })

    const loaded = loadBridgeRuntimeCheckpoint(priorBytes, undefined, () => 'fresh-v4-basic-session')

    // (6)/(7) fresh session + revision-0 laws.
    expect(loaded.migratedFromProtocolVersion).toBe(PROTOCOL_VERSION)
    expect(loaded.hydrated.checkpoint.sessionId).toBe('fresh-v4-basic-session')
    expect(loaded.hydrated.checkpoint.sessionId).not.toBe('prior-v4-basic-session')
    expect(loaded.hydrated.checkpoint.stateRevision).toBe(0)
    expect(loaded.hydrated.checkpoint.journal).toEqual([])

    // save now V16, digests recomputed correctly.
    expect(loaded.hydrated.checkpoint.schemaId).toBe(SCHEMA_ID)
    expect(loaded.hydrated.currentSave.saveVersion).toBe(LIVE_SAVE_VERSION)
    expect(loaded.hydrated.checkpoint.currentStateDigest)
      .toBe(sha256(loaded.hydrated.checkpoint.currentSaveJson))

    // (4) V14 -> V16 content preservation, field-level.
    expect(loaded.hydrated.currentSave.state.market.tick).toBe(seedState.market.tick)
    expect(loaded.hydrated.currentSave.state.studio.cash).toBe(seedState.studio.cash)
    expect(loaded.hydrated.currentSave.state.founding).toBeNull()
  })

  it('preserves and migrates a non-null savedSaveJson slot for a prior protocol-4 identity', () => {
    const currentState = createManagedBridgeState('prior-p4-v4-saved-current')
    const savedState = createManagedBridgeState('prior-p4-v4-saved-saved')
    const currentSaveJson = exportSave(makeSaveV14(currentState))
    const savedSaveJson = exportSave(makeSaveV14(savedState))
    const priorBytes = priorProtocol4Bytes({
      schemaId: V4_SCHEMA_ID,
      sessionId: 'prior-v4-saved-session',
      stateRevision: 3,
      currentSaveJson,
      savedSaveJson,
      journal: [opaqueJournalEntry('prior-saved-command', 'gamma')],
    })

    const loaded = loadBridgeRuntimeCheckpoint(priorBytes, undefined, () => 'fresh-v4-saved-session')

    expect(loaded.migratedFromProtocolVersion).toBe(PROTOCOL_VERSION)
    expect(loaded.hydrated.checkpoint.savedSaveJson).not.toBeNull()
    expect(loaded.hydrated.savedSave?.saveVersion).toBe(LIVE_SAVE_VERSION)
    expect(loaded.hydrated.savedSave?.state.market.tick).toBe(savedState.market.tick)
    expect(loaded.hydrated.savedSave?.state.studio.cash).toBe(savedState.studio.cash)
    expect(loaded.hydrated.checkpoint.savedStateDigest)
      .toBe(sha256(loaded.hydrated.checkpoint.savedSaveJson ?? ''))
    // currentSaveJson also preserved+migrated, independent of the saved slot.
    expect(loaded.hydrated.currentSave.state.market.tick).toBe(currentState.market.tick)
  })

  it.each(Array.from(SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS.entries()))(
    'accepts and migrates the enumerated %s (%s) identity',
    (schemaId, era) => {
      if (era === 'projection-v63') {
        // Actual source9c public save command; no edited header/journal or save slots.
        const compressed = readFileSync(new URL('./fixtures/p16/genuine-projection63-runtime/outgoing63.checkpoint.json.gz', import.meta.url))
        expect(createHash('sha256').update(compressed).digest('hex')).toBe('f24ac06cc84661015383792be732551e1647543106cd91483a3efac2fb892c26')
        const raw = gunzipSync(compressed).toString('utf8')
        expect(sha256(raw)).toBe('e699c9b066da20ca4c46498215bca841afa5ddc9e9e571d6c3586520d0e0df65')
        const original = JSON.parse(raw) as BridgeRuntimeCheckpointV1, before = canonicalJson(original)
        expect(schemaId).toBe('sha256:23a3092f1aadae0a5796fcfab93af36fe5551260685cdc2df128a93e670e24c1')
        expect(original).toMatchObject({ schemaId, protocolVersion: 4, stateRevision: 0,
          sessionId: 'p16-authentic-outgoing63-session' })
        expect(original.journal).toHaveLength(1)
        expect(original.journal[0]).toMatchObject({ route: 'save', commandId: 'outgoing63-real-save' })
        expect(JSON.parse(original.journal[0]!.responseJson)).toMatchObject({ accepted: true, schemaId })
        expect(original.savedSaveJson).not.toBeNull()
        for (const slot of [original.currentSaveJson, original.savedSaveJson!]) {
          expect(sha256(slot)).toBe('e62846b41b09e95fe1e6d139a0d8e7af3b1f3179606dbf61446746dbdd0f64ba')
          // The genuine fixture's own bytes: P16 Save49 (it predates P17). Its pin is the fixture's and does not move.
          expect(JSON.parse(slot)).toMatchObject({ saveVersion: 49, state: { market: { tick: 0 } } })
        }
        let sessions = 0
        const loaded = loadBridgeRuntimeCheckpoint(raw, undefined, () => { sessions += 1; return 'fresh-session-projection-v63' })
        expect(sessions).toBe(1)
        expect(loaded.migratedFromProtocolVersion).toBe(PROTOCOL_VERSION)
        expect(loaded.hydrated.checkpoint).toMatchObject({ schemaId: SCHEMA_ID, protocolVersion: PROTOCOL_VERSION,
          sessionId: 'fresh-session-projection-v63', stateRevision: 0, journal: [], journalDigest: sha256('[]') })
        expect(loaded.hydrated.journal).toEqual([])
        // P17 (Save50): the actual Save49 slots are no longer live. The canonical chain lifts each through the P17 step,
        // which changes the version alone (no franchise exists), so the state is the fixture's and the digests are new.
        const lifted = (slot: string) => exportSaveJson(shipped47Save.migrateToLive(shipped47Save.importSave(slot)).state)
        expect(loaded.hydrated.checkpoint.currentSaveJson).toBe(lifted(original.currentSaveJson))
        expect(loaded.hydrated.checkpoint.savedSaveJson).toBe(lifted(original.savedSaveJson!))
        expect(loaded.hydrated.currentSave).toEqual({ ...JSON.parse(original.currentSaveJson), saveVersion: LIVE_SAVE_VERSION })
        expect(loaded.hydrated.savedSave).toEqual({ ...JSON.parse(original.savedSaveJson!), saveVersion: LIVE_SAVE_VERSION })
        expect(loaded.hydrated.checkpoint.currentStateDigest).toBe(sha256(loaded.hydrated.checkpoint.currentSaveJson))
        expect(loaded.hydrated.checkpoint.savedStateDigest).toBe(sha256(loaded.hydrated.checkpoint.savedSaveJson ?? ''))
        expect(loaded.hydrated.checkpoint.currentStateDigest).not.toBe(original.currentStateDigest)
        const encoded = encodeBridgeRuntimeCheckpoint(loaded.hydrated.checkpoint)
        const reopened = loadBridgeRuntimeCheckpoint(encoded, undefined, () => { throw new Error('current69 must not migrate again') })
        expect(reopened.migratedFromProtocolVersion).toBeNull()
        expect(encodeBridgeRuntimeCheckpoint(reopened.hydrated.checkpoint)).toBe(encoded)
        expect(canonicalJson(original)).toBe(before)
        return
      }
      const seedState = createManagedBridgeState(`prior-p4-each-${era}`)
      const currentSaveJson = exportSave(makeSaveV14(seedState))
      const priorBytes = priorProtocol4Bytes({
        schemaId,
        sessionId: `prior-session-${era}`,
        stateRevision: 0,
        currentSaveJson,
        savedSaveJson: null,
        journal: [],
      })

      const loaded = loadBridgeRuntimeCheckpoint(priorBytes, undefined, () => `fresh-session-${era}`)
      expect(loaded.migratedFromProtocolVersion).toBe(PROTOCOL_VERSION)
      expect(loaded.hydrated.checkpoint.schemaId).toBe(SCHEMA_ID)
      expect(loaded.hydrated.checkpoint.stateRevision).toBe(0)
      expect(loaded.hydrated.checkpoint.journal).toEqual([])
      expect(loaded.hydrated.currentSave.saveVersion).toBe(LIVE_SAVE_VERSION)
    },
  )

  it('fails closed on a duplicate commandId, a wrong journalDigest, and non-canonical bytes', () => {
    const currentSaveJson = v14CurrentSaveJson('prior-p4-journal-integrity')

    const duplicateBytes = priorProtocol4Bytes({
      schemaId: V4_SCHEMA_ID,
      sessionId: 'prior-v4-dup-session',
      stateRevision: 0,
      currentSaveJson,
      savedSaveJson: null,
      journal: [
        opaqueJournalEntry('same-command-id', 'one'),
        opaqueJournalEntry('same-command-id', 'two'),
      ],
    })
    expect(() => loadBridgeRuntimeCheckpoint(duplicateBytes)).toThrow(/duplicates an earlier journal identity/)

    const validBytes = priorProtocol4Bytes({
      schemaId: V4_SCHEMA_ID,
      sessionId: 'prior-v4-digest-session',
      stateRevision: 0,
      currentSaveJson,
      savedSaveJson: null,
      journal: [opaqueJournalEntry('journal-digest-command', 'one')],
    })
    const corruptedDigest = JSON.parse(validBytes) as Record<string, unknown>
    corruptedDigest['journalDigest'] = '0'.repeat(64)
    expect(() => loadBridgeRuntimeCheckpoint(`${canonicalJson(corruptedDigest)}\n`))
      .toThrow(/journalDigest/)

    expect(() => loadBridgeRuntimeCheckpoint(` ${validBytes}`)).toThrow(/canonical JSON/)
    expect(() => loadBridgeRuntimeCheckpoint(validBytes.trimEnd())).toThrow(/exactly one LF/)
  })

  it('re-hydrates the migrated output via the normal current-schema path (write-read round trip, idempotent)', () => {
    const currentSaveJson = v14CurrentSaveJson('prior-p4-roundtrip')
    const priorBytes = priorProtocol4Bytes({
      schemaId: V4_SCHEMA_ID,
      sessionId: 'prior-v4-roundtrip-session',
      stateRevision: 5,
      currentSaveJson,
      savedSaveJson: null,
      journal: [opaqueJournalEntry('roundtrip-command', 'one')],
    })

    const loaded = loadBridgeRuntimeCheckpoint(priorBytes, undefined, () => 'fresh-v4-roundtrip-session')
    const encoded = encodeBridgeRuntimeCheckpoint(loaded.hydrated.checkpoint)

    // (8) migrated output re-hydrates via the normal path.
    const decoded = decodeBridgeRuntimeCheckpoint(encoded)
    expect(decoded.checkpoint).toEqual(loaded.hydrated.checkpoint)

    // (9) idempotence: loading the migrated bytes again takes the NORMAL
    // (non-migrating) path, because the output is already current-schema —
    // running the import twice is impossible by construction.
    const reloaded = loadBridgeRuntimeCheckpoint(encoded)
    expect(reloaded.migratedFromProtocolVersion).toBeNull()
    expect(reloaded.hydrated.checkpoint).toEqual(loaded.hydrated.checkpoint)

    // (10) current-schema checkpoint bytes unchanged by a load/store round trip.
    expect(encodeBridgeRuntimeCheckpoint(reloaded.hydrated.checkpoint)).toBe(encoded)
  })

  it('fails closed on an unknown protocol-4 schemaId with the exact current message', () => {
    const currentSaveJson = v14CurrentSaveJson('prior-p4-unknown-schema')
    const unknownBytes = priorProtocol4Bytes({
      schemaId: 'sha256:' + 'ab'.repeat(32),
      sessionId: 'prior-unknown-session',
      stateRevision: 0,
      currentSaveJson,
      savedSaveJson: null,
      journal: [],
    })
    expect(() => loadBridgeRuntimeCheckpoint(unknownBytes))
      .toThrow(/does not match the running TypeScript bridge schema/)
  })

  it('fails closed on malformed prior protocol-4 checkpoint bytes', () => {
    const currentSaveJson = v14CurrentSaveJson('prior-p4-malformed')
    const validBytes = priorProtocol4Bytes({
      schemaId: V4_SCHEMA_ID,
      sessionId: 'prior-malformed-session',
      stateRevision: 0,
      currentSaveJson,
      savedSaveJson: null,
      journal: [],
    })

    // Truncated JSON.
    expect(() => loadBridgeRuntimeCheckpoint(validBytes.slice(0, -5))).toThrow(/not valid JSON/)

    // Missing a required root key.
    const missingKey = JSON.parse(validBytes) as Record<string, unknown>
    delete missingKey['journalDigest']
    expect(() => loadBridgeRuntimeCheckpoint(`${canonicalJson(missingKey)}\n`))
      .toThrow(/missing required field "journalDigest"/)

    // Unknown extra root key.
    const extraKey = { ...(JSON.parse(validBytes) as Record<string, unknown>), notAuthorized: true }
    expect(() => loadBridgeRuntimeCheckpoint(`${canonicalJson(extraKey)}\n`))
      .toThrow(/unknown field "notAuthorized"/)

    // Malformed journal entry (wrong keys).
    const badJournalEntry = JSON.parse(validBytes) as Record<string, unknown>
    badJournalEntry['journal'] = [{ route: 'command', commandId: 'x' }]
    expect(() => loadBridgeRuntimeCheckpoint(`${canonicalJson(badJournalEntry)}\n`))
      .toThrow(/missing required field/)
  })

  it('rejects an impossible open-founding state on either migrated save slot', () => {
    const founding = BridgeSession.createRuntime().exportRuntimeCheckpoint()
    const foundingState = JSON.parse(founding.currentSaveJson) as { state: { founding: unknown } }
    expect(foundingState.state.founding).not.toBeNull()

    const priorBytes = priorProtocol4Bytes({
      schemaId: V4_SCHEMA_ID,
      sessionId: 'prior-founding-session',
      stateRevision: 0,
      currentSaveJson: founding.currentSaveJson,
      savedSaveJson: null,
      journal: [],
    })
    expect(() => loadBridgeRuntimeCheckpoint(priorBytes))
      .toThrow(/previous protocol-4 production authority cannot contain an open founding draft/)
  })

  it('never parses journal request/response bodies for a prior protocol-4 identity', () => {
    // The journal bodies below are NOT current-contract-shaped at all (no
    // route-matching command/response fields BRIDGE_SCHEMA would recognize).
    // If the import path ever hydrated them, this would throw; it must not.
    const currentSaveJson = v14CurrentSaveJson('prior-p4-opaque-journal')
    const priorBytes = priorProtocol4Bytes({
      schemaId: V4_SCHEMA_ID,
      sessionId: 'prior-opaque-session',
      stateRevision: 99,
      currentSaveJson,
      savedSaveJson: null,
      journal: [
        {
          route: 'save',
          commandId: 'totally-opaque-1',
          requestJson: canonicalJson('not even an object'),
          responseJson: canonicalJson({ nothing: 'to see here' }),
        },
      ],
    })
    const loaded = loadBridgeRuntimeCheckpoint(priorBytes, undefined, () => 'fresh-opaque-session')
    expect(loaded.migratedFromProtocolVersion).toBe(PROTOCOL_VERSION)
    expect(loaded.hydrated.checkpoint.journal).toEqual([])
  })
})

// ── P04A REOPEN hostile-review hardening ─────────────────────────────────────
// The exact mechanism that bricked the Owner's profile was the acceptance
// boundary drifting out of sync with the running schema. These pins make both
// failure directions loud at test time.
describe('prior protocol-4 acceptance boundary pins', () => {
  it('never contains the RUNNING schema identity (re-migration must be impossible)', () => {
    // If a future projection bump ever leaves the current identity inside the
    // map, every launch would silently re-migrate: journal wiped, revision
    // reset, session re-minted — on every start. This pin makes that loud.
    expect(SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS.has(SCHEMA_ID)).toBe(false)
  })

  it('contains exactly the independently pinned historical protocol-4 identities', () => {
    // Load-bearing completeness: iterating the map cannot catch a wrong or
    // missing hash; these literals were re-derived independently from the
    // generated-header history during hostile review. A projection bump must
    // consciously append its OUTGOING identity here — the P04A reopen
    // happened because v9/v10 never were. P05A W2 appended the outgoing
    // projection-v11 identity per the schema-bump law; the W2 correction wave
    // (range-review F2, the canonical $id URN bump) appended the WIP-branch
    // intermediate v12-stale-urn identity the same way.
    // P05A.3 appended the outgoing projection-v12 identity (a6f37459…) when
    // v13 put the hiring market on the casting wire. P06A W2 appended the
    // outgoing projection-v13 identity (0474ceaf…) when the W2 contract mint
    // moved the running schema to V16 / projection-14. P08A W2 appended the
    // outgoing projection-v15 identity (ddce1c39…, the P07-accepted schema) when
    // the Standing & Studio History section moved the running schema to
    // V17 / projection-16. P09 W1 appended the outgoing projection-v16 identity
    // (85a6d125…, the P08 core checkpoint schema) when the placement quote
    // family and the founding regime moved the running schema to V18 /
    // projection-17. P10A W0 appended the outgoing projection-v17 identity (18de162d…,
    // the P09 core checkpoint schema) when the Talent section moved the running schema to
    // projection-18. P10-R1 appended the outgoing projection-v18 identity (ea5d645f…, the
    // P10 person-route candidate schema) when the contract actions / contract quote family
    // moved the running schema to projection-19.
    // AUD-001: P07 missed the outgoing P06 projection-v14 identity. Its literal
    // comes from the accepted receipt and frozen P06 checkpoint, independently
    // exercised by bridge-p06-checkpoint-recovery.test.ts.
    // Recovery projection20 registers the outgoing projection19 header frozen
    // at recovery base1b5eb8f08c81c7d9c639058c3e28b21b9c1f8e84.
    expect([...SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS.keys()].sort()).toEqual([
      // P14B.6 (700-T2): the outgoing projection-48 identity — the checked-in
      // contract-manifest schemaId before the projection-49 bump (ad49031f^), also
      // pinned independently by bridge-p14b4-runtime47-compatibility.test.ts.
      'sha256:00c0075bef257634956da7d16d117a145d203047e7169c643156b7971c4c7fec',
      'sha256:01f15efc8fc33fd810b051242857385ca23b5e1c775b357db1bfe5a70e907e1e',
      'sha256:0285e92f32c27cd2960df802b3f7ea156a15372f05001ad1f4964c2f25db55b5',
      'sha256:0474ceafd6c148f329fe99eac328c79ed0b0caf906e0f7442b7f3cf0fe40cb4f',
      // Actual published outgoing58 remains supported beneath current62.
      'sha256:13b7933fdd1e3dc9851dd08630e46efd43e70227f5e0c6f6cf130d885752ab74',
      'sha256:15033cf9ca43be65abcb25fc6f910f9487ac23056090126ec7d3e2353f6ce587',
      'sha256:18de162d1a9da3034378f71cec3d3b3f109ea91df8c1a8d40469924108b36e78',
      'sha256:1bad05a95c284e64ceaef54c276f2dd0ccad8ca3ef1b12198068bb61b85198c9',
      // Authentic P11 projection24, also retained byte-for-byte in p11-core-v1 fixtures.
      'sha256:204a71924bd8c2e8ae9af47591226894b3e42f62457da3cc20ed6b106ede611a',
      // Authentic outgoing ready26: d906's generated header and unchanged v3 corpus.
      'sha256:23a3092f1aadae0a5796fcfab93af36fe5551260685cdc2df128a93e670e24c1', // actual original-runtime outgoing63
      'sha256:2b339a6a8b3e5add0726b7eaac9ce8746e235d8b6111a6816f890ff56afdffd1',
      // Projection63 retains authentic generated outgoing62.
      'sha256:2b94e6df66cd5b45e398861c8130085434d4bb9c4d0cf9bdcb97607699799604',
      // R2/R3: genuine1307 outgoing55 current111/saved110 checkpoint.
      'sha256:2c377b6fa3c559eee753e7a9d91d4956399cca1a5693edb15adb3de7c4f27158',
      // Relationship slice B: outgoing56, 349b2d3e… (OUTGOING_56 above).
      OUTGOING_56,
      'sha256:510f08e4a551827a30e0f3d93bbe09fa5ddadbd39366b4dcfa93530500c7979c',
      // Sprint 11 (review S1): the P16 build's current64, prior beneath current65 (its genuine capture below).
      'sha256:57f12ee28d21aa47c7514afa1c058105a10f10a9e76d400d664e97c23dc90272',
      // P14B.4 (record 600): the outgoing projection-46 identity — the checked-in
      // contract-manifest schemaId before the projection-47 bump (47b2bbf4^), also
      // pinned independently by bridge-p14b4-runtime47-compatibility.test.ts.
      'sha256:584bdd8565030f049d548b1af4fcbf8c517ca7c9150016736f632f1ef8fcb98c',
      // P18 Sprint 12: outgoing66 (the P17 checkpoint's identity), prior beneath current67 (its genuine capture below).
      'sha256:589380869e1329a8027b8339b88646761ce6d791376df5fd793e77ae9dd3b96a',
      // Genuine outgoing projection45: e37cd23 generated header and preserved runtime checkpoint.
      'sha256:5b2a4ca93d930e90a288db55bb5cc3fdc8eea070ef51fa1450a193a325bd755d',
      // P14B.8: the outgoing projection-49 identity — the checked-in contract-manifest
      // schemaId before the projection-50 bump, also pinned independently by
      // bridge-p14b4-runtime47-compatibility.test.ts.
      'sha256:60af24c58bc4bea8f04e7fc818f8401daeadd87da91252e60cfcf3ee028d8e1b',
      'sha256:625377a2804a681da3be209da02850e221ae33ac5f58b727f6395736ad607ad1',
      // P16 (candidate current200): outgoing59, the F40 manifest identity bridge-contract-generator.test.ts pins.
      'sha256:6347433150a8ed3988573840bfa22621d5f5aa35b3d053b25ff5e6700ad02dcd',
      'sha256:6a2c01feaf02c931a8c41bbf2090f8af003b89a492d77135d7aab2b42a8d3dc9',
      // P14B.5 (662-T2): the outgoing projection-47 identity — the checked-in
      // contract-manifest schemaId before the projection-48 bump (040651b4^), also
      // pinned independently by bridge-p14b4-runtime47-compatibility.test.ts.
      'sha256:6f6b48805aadcf14d456614d87bf1571eb1ce0d9aa0bc44f604e7976f4f85538',
      'sha256:71529afdcb8e5cf645ab136efb9685256da0039e86d989bfab97b7b2cc5d9a8b',
      // Actual shipped projection57, independent of unlanded candidate57 identity.
      C17_SHIPPED_OUTGOING_57,
      // P16: outgoing61, the candidate's generated C# header (PATCH.diff d59d331b).
      'sha256:7d23fdb9a710175afb88208170cfe5692510febe06fb898a3ccd95edc9c53306',
      'sha256:7e3af4db0d3d18cdeaab00082e0034f304a9141f46ea87e9e64e5a99d985483c',
      'sha256:80f2f0fcd14d1b25e713c2624286a6c05a98c53ea5cfcb2b47612f8c030f5e47',
      'sha256:85a6d125960dce49b4775f842d7b56d7360c81cef3638cd819057c79c99f0236',
      'sha256:8b2569b1f925bedf214ee556841fe28b61e544f1f13bb4741c84a0a318e81a85',
      // P18 Sprint 13 slice B: outgoing67 (the Sprint 12 checkpoint's identity), prior beneath current68 (its genuine capture below).
      'sha256:8bd45eec049c6105ed2efee3899cfbb2a440c1b40f536a899b332ffbde3003f0',
      // P16: outgoing60; the candidate's registry is its only record in this repository.
      'sha256:8bf350135c7a8b69b4fc2258d1082f452047d37964d0d58b6cc8ceefc87153e4',
      'sha256:92317ec179456cdc5bd5cc7c4ca47dd066b768a9e2e45519f1263ef921a211a4',
      'sha256:97940e51e0566bed80231b223e5b7303a45d62db8d698f693e525eb244775211',
      // P4/P5: genuine1221 outgoing54 current-waived/saved-earned slots.
      'sha256:9c5bba3fcc58e857fe57e33623a86f096cd04e00547bea8f2dae3a656025b302',
      'sha256:a481d14f3810ffbafcba2bbf509db7340263f3f0fd665a059507a1567d98923d',
      // 875: genuine outgoing projection51, preserved in the pre-bump C.2-RM runtime corpus.
      'sha256:a690e6f9e6f93f3a78f8eed8eaa20a1532a9ebd82812b0bc9414a04fdcb5968f',
      'sha256:a6f374596e956800f9547ad538fdd859c01bda3460aac8b877279c67686c6f4b',
      'sha256:b779faa92227bd1f2e623ad04d0899c87e7ddc60ce43f9ae9c39a7626c20a83d',
      // Projection69 (playtest-response slice): outgoing68 (the b3c179b0 snapshot's identity), prior beneath current69 (its genuine capture below).
      'sha256:b91efc9c632b2503a0f5ca0f33a243164e97775b2c13f566746ba004d7835851',
      'sha256:ba9cd199704f66d375585d0bec2128c950618a3ba6a8cf0845a5550fde41659f',
      'sha256:be7ed660d04ed9b1056f48e946f86f26c10cab42b950a273d57ad9cba372f5bb',
      // Native R05 preview12 manifest/DTO, before the Profile date-label addition.
      'sha256:c6ab1b2f181b7cbbd1b873a276f0be0516a505f258c3c9ad996042e43e096712',
      // R3-N7-SIM-01: the outgoing projection-31 identity, appended when the
      // read-only operationsEvents section moved the running schema to 32.
      'sha256:c9c07d6febe4afee7f7c27c991acdfa1c86b6c3a7f5dff8528d7fa5ad72e43a1',
      'sha256:c9dad9f3d8bb94445db1a5425d90db3f9894da9354f47a07992ff96261cfc399',
      'sha256:d3338cb713385cc23414e6a17293a5900871764f0eeaed19698e17634e74740b',
      // Sprint 11 slice B: outgoing65, prior beneath current66 (its genuine capture below).
      'sha256:d57642ad971a0682ae587c8d9c73fdf8b251f28749dd156e53a5c8487b4e6df8',
      // P3: genuine1117 outgoing53 natural and waiver checkpoints.
      'sha256:d59e144e4077f669804ca87dd6184ef23bd44c9d93e44eb795f2b66350926a4d',
      'sha256:ddce1c399ac4ff58327b296a0600428ac3f3346b84f3639e66e48e53a65fbe99',
      // R3-N4-SIM-20: the outgoing projection-30 identity (4dd667dc's generated header),
      // appended when the batched N4/N5/N6 read-model deltas moved the running schema to 31.
      'sha256:e2d354dcbae1a6dc93a2367756512c14243b11be202a26107de0c81a4f3e0698', // 840: genuine outgoing projection50 (824/842)
      'sha256:e64a3b659e4247b98631f1caa1f0e9eb0b6016aac92b0f46be590360ff9cee48',
      'sha256:ea5d645f34a472f4710b9273b225d6f15433d6d17ae8ed1af3c03686a225c8c4',
      'sha256:eb95add0fc06a54d19998c4707dd0b0ba861a22cfee6d8e6631499beeea18e25',
      // C.3: genuine outgoing52 preserved in953 before the current53 cutover.
      'sha256:f036ccdd62c4ac2a700a27796631e1c4f8c85f9cccfb14ac6850083fb8dba5f2',
      'sha256:f84ae77ec59a0d7ca7cdd89115456504ddecbde2c6e3839936e4951bd65bce61',
      // Authentic P11 core25, preserved in the v2 public corpus and copied core control.
      'sha256:fe9bf4558dc12abc5f258ba8b8f581242e06361cfbae8ae31d8c676f6c7a6460',
    ])
  })
})

// Append to EXISTING tests/bridge-runtime-checkpoint.test.ts; bindings in IMPORTS.txt.
// Constructed in-memory checkpoint control using admitted historical capture slots.
// This is NOT a captured production57 checkpoint or a new genuine restart record.
const C17_SHIPPED_OUTGOING_57 = 'sha256:74826ef419bfa816647b3de156de3e24fb50327879e207c844c1e1a12b9c1253'

// Sprint 11, review S1: the bridge schema id does not depend on the save version. The P16 build (a5a66c27) and the P17
// build share the current64 identity, so a checkpoint the P16 build wrote carries Save49 slots under it, and the
// current-schema path refuses them as non-live. Projection 65 registers 64 prior: those slots lift to Save50 through the
// canonical chain, and a current-schema checkpoint carrying a non-live save is still refused by name.
const P16_BUILD_OUTGOING_64 = 'sha256:57f12ee28d21aa47c7514afa1c058105a10f10a9e76d400d664e97c23dc90272'
function loadOutcome(bytes: string, sessionId: string): { loaded: ReturnType<typeof loadBridgeRuntimeCheckpoint> } | { refused: string } {
  try {
    return { loaded: loadBridgeRuntimeCheckpoint(bytes, undefined, () => sessionId) }
  } catch (error) {
    return { refused: (error as Error).message }
  }
}
// The bytes the P16 build writes for a franchise-free state: the real P17 downgrade step is version-only until a franchise exists.
const p16BuildSaveJson = (state: Parameters<typeof shipped47Save.makeSave>[0]): string =>
  exportSave(shipped47Save.convertV50ToV49(shipped47Save.convertV51ToV50(shipped47Save.makeSave(state))))
const liftedSaveJson = (slot: string): string => exportSaveJson(shipped47Save.migrateToLive(shipped47Save.importSave(slot)).state)

describe('Sprint 11 S1 — P16-build current64 checkpoints with Save49 slots take the governed prior path', () => {
  it('accepts a current64 checkpoint with real Save49 slots and lifts each to the live save with fresh digests (refused as V49 at the parent)', () => {
    const current = createManagedBridgeState('s1-p16-current64-current')
    const saved = createManagedBridgeState('s1-p16-current64-saved')
    const currentSaveJson = p16BuildSaveJson(current)
    const savedSaveJson = p16BuildSaveJson(saved)
    for (const slot of [currentSaveJson, savedSaveJson]) expect(JSON.parse(slot)).toMatchObject({ saveVersion: 49 })
    const bytes = priorProtocol4Bytes({
      schemaId: P16_BUILD_OUTGOING_64,
      sessionId: 'p16-build-current64-session',
      stateRevision: 2,
      currentSaveJson,
      savedSaveJson,
      journal: [opaqueJournalEntry('p16-build-command', 'one'), opaqueJournalEntry('p16-build-save', 'two')],
    })
    const outcome = loadOutcome(bytes, 'fresh-after-p16-current64')
    expect(outcome).not.toHaveProperty('refused')
    if (!('loaded' in outcome)) return
    const { loaded } = outcome
    expect(SCHEMA_ID).not.toBe(P16_BUILD_OUTGOING_64)
    expect(SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS.get(P16_BUILD_OUTGOING_64)).toBe('projection-v64')
    expect(loaded.migratedFromProtocolVersion).toBe(PROTOCOL_VERSION)
    expect(loaded.hydrated.checkpoint).toMatchObject({ schemaId: SCHEMA_ID, protocolVersion: PROTOCOL_VERSION,
      sessionId: 'fresh-after-p16-current64', stateRevision: 0, journal: [], journalDigest: sha256('[]') })
    expect(loaded.hydrated.journal).toEqual([])
    // Version-only lift: the state is the P16 bytes' own, the version is live and both digests are recomputed.
    expect(loaded.hydrated.currentSave).toEqual({ ...JSON.parse(currentSaveJson), saveVersion: LIVE_SAVE_VERSION })
    expect(loaded.hydrated.savedSave).toEqual({ ...JSON.parse(savedSaveJson), saveVersion: LIVE_SAVE_VERSION })
    expect(loaded.hydrated.checkpoint.currentSaveJson).toBe(liftedSaveJson(currentSaveJson))
    expect(loaded.hydrated.checkpoint.savedSaveJson).toBe(liftedSaveJson(savedSaveJson))
    expect(loaded.hydrated.checkpoint.currentStateDigest).toBe(sha256(loaded.hydrated.checkpoint.currentSaveJson))
    expect(loaded.hydrated.checkpoint.savedStateDigest).toBe(sha256(loaded.hydrated.checkpoint.savedSaveJson ?? ''))
    expect(loaded.hydrated.checkpoint.currentStateDigest).not.toBe(sha256(currentSaveJson))
    expect(loaded.hydrated.checkpoint.savedStateDigest).not.toBe(sha256(savedSaveJson))
    // The migrated checkpoint is current: it reopens without a second migration and re-encodes byte for byte.
    const encoded = encodeBridgeRuntimeCheckpoint(loaded.hydrated.checkpoint)
    const reopened = loadBridgeRuntimeCheckpoint(encoded, undefined, () => { throw new Error('current69 must not migrate again') })
    expect(reopened.migratedFromProtocolVersion).toBeNull()
    expect(encodeBridgeRuntimeCheckpoint(reopened.hydrated.checkpoint)).toBe(encoded)
  })

  it('accepts the genuine P16-build capture (a5a66c27 public save route) and lifts both Save49 slots to the live save', () => {
    // Pins measured from the actual capture at a5a66c27 (tools/capture64.ts; OUTGOING64-RECEIPT.json beside the fixture).
    const compressed = readFileSync(new URL('./fixtures/p16/genuine-projection64-runtime/outgoing64.checkpoint.json.gz', import.meta.url))
    expect(createHash('sha256').update(compressed).digest('hex')).toBe('495174bd6c33748948375b3fd3a800dce9f876e42a194fc8d8047a6ca0d4e440')
    const raw = gunzipSync(compressed).toString('utf8')
    expect(sha256(raw)).toBe('927b4d01caf5b186b6cdc7b3429dc5900d10aaf4888779ca4d57674b46039a5d')
    const original = JSON.parse(raw) as BridgeRuntimeCheckpointV1, before = canonicalJson(original)
    expect(original).toMatchObject({ schemaId: P16_BUILD_OUTGOING_64, protocolVersion: 4, stateRevision: 0,
      sessionId: 'p16-authentic-outgoing64-session' })
    expect(original.journal).toHaveLength(1)
    expect(original.journal[0]).toMatchObject({ route: 'save', commandId: 'outgoing64-real-save' })
    expect(JSON.parse(original.journal[0]!.responseJson)).toMatchObject({ accepted: true, schemaId: P16_BUILD_OUTGOING_64 })
    expect(original.savedSaveJson).not.toBeNull()
    for (const slot of [original.currentSaveJson, original.savedSaveJson!]) {
      expect(sha256(slot)).toBe('1965758c2f253842c348956bb95074479c99a7b3ae5077bdbb965ff5e4d56d75')
      expect(JSON.parse(slot)).toMatchObject({ saveVersion: 49, state: { market: { tick: 0 } } })
    }
    const outcome = loadOutcome(raw, 'fresh-session-projection-v64')
    expect(outcome).not.toHaveProperty('refused')
    if (!('loaded' in outcome)) return
    const { loaded } = outcome
    expect(loaded.migratedFromProtocolVersion).toBe(PROTOCOL_VERSION)
    expect(loaded.hydrated.checkpoint).toMatchObject({ schemaId: SCHEMA_ID, protocolVersion: PROTOCOL_VERSION,
      sessionId: 'fresh-session-projection-v64', stateRevision: 0, journal: [], journalDigest: sha256('[]') })
    expect(loaded.hydrated.checkpoint.currentSaveJson).toBe(liftedSaveJson(original.currentSaveJson))
    expect(loaded.hydrated.checkpoint.savedSaveJson).toBe(liftedSaveJson(original.savedSaveJson!))
    expect(loaded.hydrated.currentSave).toEqual({ ...JSON.parse(original.currentSaveJson), saveVersion: LIVE_SAVE_VERSION })
    expect(loaded.hydrated.savedSave).toEqual({ ...JSON.parse(original.savedSaveJson!), saveVersion: LIVE_SAVE_VERSION })
    expect(loaded.hydrated.checkpoint.currentStateDigest).toBe(sha256(loaded.hydrated.checkpoint.currentSaveJson))
    expect(loaded.hydrated.checkpoint.savedStateDigest).toBe(sha256(loaded.hydrated.checkpoint.savedSaveJson ?? ''))
    expect(loaded.hydrated.checkpoint.currentStateDigest).not.toBe(original.currentStateDigest)
    expect(canonicalJson(original)).toBe(before)
  })

  // Inherited limit, recorded rather than widened (review should-fix 3): the prior path refuses any migrated slot with an
  // open founding draft unless it is the R05/P12 native draft (runtime-checkpoint.ts nativeR05Draft). A P16-build checkpoint
  // saved mid-founding is therefore refused with the historical "cannot contain" message, and a P17-build 64 checkpoint
  // saved mid-founding, which loaded on the current path before projection 65, is refused the same way. The same bytes
  // under the running schema still load. Widening nativeR05Draft is out of this slice.
  it('refuses a mid-founding P16-build (Save49) or P17-build (Save50) current64 checkpoint on the prior path; the running schema still loads it', () => {
    const founding = BridgeSession.createRuntime().exportRuntimeCheckpoint()
    expect((JSON.parse(founding.currentSaveJson) as { state: { founding: unknown } }).state.founding).not.toBeNull()
    const p16SaveJson = exportSave(shipped47Save.convertV50ToV49(shipped47Save.convertV51ToV50(shipped47Save.migrateToLive(shipped47Save.importSave(founding.currentSaveJson)))))
    expect(JSON.parse(p16SaveJson)).toMatchObject({ saveVersion: 49 })
    // P18 (review should-fix 8): the P17 build wrote Save50; derive its slot through the live step as the P16 slot is.
    const p17SaveJson = exportSave(shipped47Save.convertV51ToV50(shipped47Save.migrateToLive(shipped47Save.importSave(founding.currentSaveJson))))
    expect(JSON.parse(p17SaveJson)).toMatchObject({ saveVersion: 50 })
    for (const [build, currentSaveJson] of [['p16', p16SaveJson], ['p17', p17SaveJson]] as const) {
      const bytes = priorProtocol4Bytes({ schemaId: P16_BUILD_OUTGOING_64, sessionId: `${build}-mid-founding-64`, stateRevision: 0,
        currentSaveJson, savedSaveJson: null, journal: [] })
      expect(() => loadBridgeRuntimeCheckpoint(bytes, undefined, () => `${build}-mid-founding-fresh`))
        .toThrow('checkpoint.currentSaveJson: previous protocol-4 production authority cannot contain an open founding draft')
    }
    const current = loadBridgeRuntimeCheckpoint(encodeBridgeRuntimeCheckpoint(founding), undefined, () => { throw new Error('a current checkpoint must not migrate') })
    expect(current.migratedFromProtocolVersion).toBeNull()
    expect(current.hydrated.checkpoint.currentSaveJson).toBe(founding.currentSaveJson)
  })

  it('still refuses a current-schema checkpoint that carries a non-live Save49 slot, by name, without the prior path', () => {
    const bytes = priorProtocol4Bytes({
      schemaId: SCHEMA_ID,
      sessionId: 'forged-current-save49-session',
      stateRevision: 0,
      currentSaveJson: p16BuildSaveJson(createManagedBridgeState('s1-forged-current-save49')),
      savedSaveJson: null,
      journal: [],
    })
    expect(() => loadBridgeRuntimeCheckpoint(bytes, undefined, () => { throw new Error('a current-schema checkpoint must not take the prior path') }))
      .toThrow(`checkpoint.currentSaveJson: must be a current V${String(LIVE_SAVE_VERSION)} save, received V49`)
  })
})

// Sprint 11 slice B: projection 66 registered the outgoing65 identity while Save50 was live, so its slots were live then.
// P18 Sprint 12: Save51 is live, so the same Save50 slots now lift version-only through migrateToLive on the governed
// prior path; the capture's own bytes and pins do not move.
const OUTGOING_65 = 'sha256:d57642ad971a0682ae587c8d9c73fdf8b251f28749dd156e53a5c8487b4e6df8'
describe('Sprint 11 slice B — the outgoing65 capture takes the governed prior path', () => {
  it('accepts the genuine projection-65 capture (2b1a5b4b public save route) and lifts both Save50 slots to Save51, version only', () => {
    // Pins measured from the actual capture at 2b1a5b4b (producer docs/engineering/audits/2026-10-22-codebase-review/
    // p16-sprint11/bridge-slice-b/tools/capture65.ts; OUTGOING65-RECEIPT.json beside the fixture).
    const compressed = readFileSync(new URL('./fixtures/bridge/genuine-projection65-runtime/outgoing65.checkpoint.json.gz', import.meta.url))
    expect(createHash('sha256').update(compressed).digest('hex')).toBe('71769a1eb690fd21d8294cc62569d730e6b549e54270edce4bc8405513207a84')
    const raw = gunzipSync(compressed).toString('utf8')
    expect(sha256(raw)).toBe('fcc07f9d61376abae825f79dadd5f12d4e38166a9d5490336a2a83d8eb2df382')
    const original = JSON.parse(raw) as BridgeRuntimeCheckpointV1, before = canonicalJson(original)
    expect(original).toMatchObject({ schemaId: OUTGOING_65, protocolVersion: 4, stateRevision: 0, sessionId: 'p17-authentic-outgoing65-session' })
    expect(original.journal).toHaveLength(1)
    expect(original.journal[0]).toMatchObject({ route: 'save', commandId: 'outgoing65-real-save' })
    expect(JSON.parse(original.journal[0]!.responseJson)).toMatchObject({ accepted: true, schemaId: OUTGOING_65 })
    expect(original.savedSaveJson).not.toBeNull()
    for (const slot of [original.currentSaveJson, original.savedSaveJson!]) {
      expect(sha256(slot)).toBe('d8510590b44432ea5e481ee955536604f61f8b837ae8c2ad60adb2395df222f4')
      // The genuine fixture's own bytes: P17 Save50 (it predates P18). Its pin is the fixture's and does not move.
      expect(JSON.parse(slot)).toMatchObject({ saveVersion: 50, state: { market: { tick: 0 } } })
    }
    const outcome = loadOutcome(raw, 'fresh-session-projection-v65')
    expect(outcome).not.toHaveProperty('refused')
    if (!('loaded' in outcome)) return
    const { loaded } = outcome
    expect(SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS.get(OUTGOING_65)).toBe('projection-v65')
    expect(loaded.migratedFromProtocolVersion).toBe(PROTOCOL_VERSION)
    expect(loaded.hydrated.checkpoint).toMatchObject({ schemaId: SCHEMA_ID, protocolVersion: PROTOCOL_VERSION,
      sessionId: 'fresh-session-projection-v65', stateRevision: 0, journal: [], journalDigest: sha256('[]') })
    // Version-only lift: the state is the capture's own, the version is 51 and both digests are recomputed.
    expect(loaded.hydrated.currentSave).toEqual({ ...JSON.parse(original.currentSaveJson), saveVersion: 51 })
    expect(loaded.hydrated.savedSave).toEqual({ ...JSON.parse(original.savedSaveJson!), saveVersion: 51 })
    expect(loaded.hydrated.checkpoint.currentSaveJson).toBe(liftedSaveJson(original.currentSaveJson))
    expect(loaded.hydrated.checkpoint.savedSaveJson).toBe(liftedSaveJson(original.savedSaveJson!))
    expect(loaded.hydrated.checkpoint.currentStateDigest).toBe(sha256(loaded.hydrated.checkpoint.currentSaveJson))
    expect(loaded.hydrated.checkpoint.savedStateDigest).toBe(sha256(loaded.hydrated.checkpoint.savedSaveJson ?? ''))
    expect(loaded.hydrated.checkpoint.currentStateDigest).not.toBe(original.currentStateDigest)
    const encoded = encodeBridgeRuntimeCheckpoint(loaded.hydrated.checkpoint)
    const reopened = loadBridgeRuntimeCheckpoint(encoded, undefined, () => { throw new Error('current69 must not migrate again') })
    expect(reopened.migratedFromProtocolVersion).toBeNull()
    expect(canonicalJson(original)).toBe(before)
  })
})

// P18 Sprint 12: projection 67 registers the outgoing66 identity, the P17 technical checkpoint's (ecbc42c9) and the P18
// candidate's alike, because the bridge schema folds no save version. A checkpoint written under 66 carries Save50 slots;
// with Save51 live the current-schema path refuses them by name, and the governed prior path lifts each version-only.
const OUTGOING_66 = 'sha256:589380869e1329a8027b8339b88646761ce6d791376df5fd793e77ae9dd3b96a'
describe('P18 Sprint 12 — the outgoing66 capture takes the governed prior path', () => {
  it('accepts the genuine projection-66 capture (ecbc42c9 public save route) and lifts both Save50 slots to Save51, version only', () => {
    // Pins measured from the actual capture in an immutable snapshot of ecbc42c9 (producer docs/engineering/audits/
    // 2026-10-22-codebase-review/p18-sprint12/bridge-step/tools/capture66.ts; OUTGOING66-RECEIPT.json beside the fixture).
    const compressed = readFileSync(new URL('./fixtures/bridge/genuine-projection66-runtime/outgoing66.checkpoint.json.gz', import.meta.url))
    expect(createHash('sha256').update(compressed).digest('hex')).toBe('1249f8d58f8aa784b4540bcb1e6a4cbf58421054cb0858c7ee7d5d4affabb659')
    const raw = gunzipSync(compressed).toString('utf8')
    expect(sha256(raw)).toBe('19cb33dd891302ec0f8dcbe6515306c4ec163f441fc98e5fc2c46188592c1028')
    const original = JSON.parse(raw) as BridgeRuntimeCheckpointV1, before = canonicalJson(original)
    expect(original).toMatchObject({ schemaId: OUTGOING_66, protocolVersion: 4, stateRevision: 0, sessionId: 'p17-authentic-outgoing66-session' }) // the fixture's own value (the receipt brief said p18-…)
    expect(original.journal).toHaveLength(1)
    expect(original.journal[0]).toMatchObject({ route: 'save', commandId: 'outgoing66-real-save' })
    expect(JSON.parse(original.journal[0]!.responseJson)).toMatchObject({ accepted: true, schemaId: OUTGOING_66 })
    expect(original.savedSaveJson).not.toBeNull()
    for (const slot of [original.currentSaveJson, original.savedSaveJson!]) {
      expect(sha256(slot)).toBe('12daac5bf0277515773166e3ab42f7e2c8bbf34fff558afc02f5f15f4b7a69f9')
      expect(JSON.parse(slot)).toMatchObject({ saveVersion: 50, state: { market: { tick: 0 } } })
    }
    expect(SCHEMA_ID).not.toBe(OUTGOING_66)
    const outcome = loadOutcome(raw, 'fresh-session-projection-v66')
    expect(outcome).not.toHaveProperty('refused')
    if (!('loaded' in outcome)) return
    const { loaded } = outcome
    expect(SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS.get(OUTGOING_66)).toBe('projection-v66')
    expect(loaded.migratedFromProtocolVersion).toBe(PROTOCOL_VERSION)
    expect(loaded.hydrated.checkpoint).toMatchObject({ schemaId: SCHEMA_ID, protocolVersion: PROTOCOL_VERSION,
      sessionId: 'fresh-session-projection-v66', stateRevision: 0, journal: [], journalDigest: sha256('[]') })
    expect(loaded.hydrated.journal).toEqual([])
    expect(loaded.hydrated.currentSave).toEqual({ ...JSON.parse(original.currentSaveJson), saveVersion: 51 })
    expect(loaded.hydrated.savedSave).toEqual({ ...JSON.parse(original.savedSaveJson!), saveVersion: 51 })
    expect(loaded.hydrated.checkpoint.currentSaveJson).toBe(liftedSaveJson(original.currentSaveJson))
    expect(loaded.hydrated.checkpoint.savedSaveJson).toBe(liftedSaveJson(original.savedSaveJson!))
    expect(loaded.hydrated.checkpoint.currentStateDigest).toBe(sha256(loaded.hydrated.checkpoint.currentSaveJson))
    expect(loaded.hydrated.checkpoint.savedStateDigest).toBe(sha256(loaded.hydrated.checkpoint.savedSaveJson ?? ''))
    expect(loaded.hydrated.checkpoint.currentStateDigest).not.toBe(original.currentStateDigest)
    const encoded = encodeBridgeRuntimeCheckpoint(loaded.hydrated.checkpoint)
    const reopened = loadBridgeRuntimeCheckpoint(encoded, undefined, () => { throw new Error('current69 must not migrate again') })
    expect(reopened.migratedFromProtocolVersion).toBeNull()
    expect(encodeBridgeRuntimeCheckpoint(reopened.hydrated.checkpoint)).toBe(encoded)
    expect(canonicalJson(original)).toBe(before)
  })

  it('still refuses a current-schema checkpoint that carries a non-live Save50 slot, by name, without the prior path', () => {
    const save50Json = exportSave(shipped47Save.convertV51ToV50(shipped47Save.makeSave(createManagedBridgeState('p18-forged-current-save50'))))
    expect(JSON.parse(save50Json)).toMatchObject({ saveVersion: 50 })
    const bytes = priorProtocol4Bytes({ schemaId: SCHEMA_ID, sessionId: 'forged-current-save50-session', stateRevision: 0,
      currentSaveJson: save50Json, savedSaveJson: null, journal: [] })
    expect(() => loadBridgeRuntimeCheckpoint(bytes, undefined, () => { throw new Error('a current-schema checkpoint must not take the prior path') }))
      .toThrow(`checkpoint.currentSaveJson: must be a current V${String(LIVE_SAVE_VERSION)} save, received V50`)
  })
})

// P18 Sprint 13 slice B: projection 68 registers the outgoing67 identity, the Sprint 12 checkpoint's (31fdb366) and the
// slice A candidate's (d174d667) alike. Save51 stays live, so the governed prior path is identity on both slots.
const OUTGOING_67 = 'sha256:8bd45eec049c6105ed2efee3899cfbb2a440c1b40f536a899b332ffbde3003f0'
describe('P18 Sprint 13 slice B — the outgoing67 capture takes the governed prior path', () => {
  it('accepts the genuine projection-67 capture (31fdb366 public save route) and keeps both live Save51 slots byte for byte', () => {
    // Pins measured from the actual capture in an immutable snapshot of 31fdb366 (producer docs/engineering/audits/
    // 2026-10-22-codebase-review/p18-sprint13/bridge-step/tools/capture67.ts; OUTGOING67-RECEIPT.json beside the fixture).
    const compressed = readFileSync(new URL('./fixtures/bridge/genuine-projection67-runtime/outgoing67.checkpoint.json.gz', import.meta.url))
    expect(compressed).toHaveLength(164463)
    expect(createHash('sha256').update(compressed).digest('hex')).toBe('b8b013d1ec5918477546e9df70bffed99bc964da9867e12534af63f7c5a6bc34')
    const raw = gunzipSync(compressed).toString('utf8')
    expect(sha256(raw)).toBe('f96bd3c96101fad5eaceba2741e5076683eb49aafec54e1f080458ebbe63e565')
    const original = JSON.parse(raw) as BridgeRuntimeCheckpointV1, before = canonicalJson(original)
    expect(original).toMatchObject({ schemaId: OUTGOING_67, protocolVersion: 4, stateRevision: 0, sessionId: 'p17-authentic-outgoing67-session' }) // the fixture's own value
    expect(original.journal).toHaveLength(1)
    expect(original.journal[0]).toMatchObject({ route: 'save', commandId: 'outgoing67-real-save' })
    expect(JSON.parse(original.journal[0]!.responseJson)).toMatchObject({ accepted: true, schemaId: OUTGOING_67 })
    expect(original.savedSaveJson).not.toBeNull()
    for (const slot of [original.currentSaveJson, original.savedSaveJson!]) {
      expect(sha256(slot)).toBe('dddb4f8d1bba53e3839412450bbb509442fc006fcbb3b7869775fd0a3e321d87')
      expect(JSON.parse(slot)).toMatchObject({ saveVersion: LIVE_SAVE_VERSION, state: { market: { tick: 0 } } })
    }
    expect(LIVE_SAVE_VERSION).toBe(51)
    expect(SCHEMA_ID).not.toBe(OUTGOING_67)
    const outcome = loadOutcome(raw, 'fresh-session-projection-v67')
    expect(outcome).not.toHaveProperty('refused')
    if (!('loaded' in outcome)) return
    const { loaded } = outcome
    expect(SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS.get(OUTGOING_67)).toBe('projection-v67')
    expect(loaded.migratedFromProtocolVersion).toBe(PROTOCOL_VERSION)
    expect(loaded.hydrated.checkpoint).toMatchObject({ schemaId: SCHEMA_ID, protocolVersion: PROTOCOL_VERSION,
      sessionId: 'fresh-session-projection-v67', stateRevision: 0, journal: [], journalDigest: sha256('[]') })
    expect(loaded.hydrated.journal).toEqual([])
    // Already live: the canonical chain is identity, so both slots and both digests are the capture's own.
    expect(loaded.hydrated.checkpoint.currentSaveJson).toBe(original.currentSaveJson)
    expect(loaded.hydrated.checkpoint.savedSaveJson).toBe(original.savedSaveJson)
    expect(loaded.hydrated.checkpoint.currentStateDigest).toBe(original.currentStateDigest)
    expect(loaded.hydrated.checkpoint.savedStateDigest).toBe(original.savedStateDigest)
    const encoded = encodeBridgeRuntimeCheckpoint(loaded.hydrated.checkpoint)
    const reopened = loadBridgeRuntimeCheckpoint(encoded, undefined, () => { throw new Error('current69 must not migrate again') })
    expect(reopened.migratedFromProtocolVersion).toBeNull()
    expect(encodeBridgeRuntimeCheckpoint(reopened.hydrated.checkpoint)).toBe(encoded)
    expect(canonicalJson(original)).toBe(before)
  })
})

// Projection69 (playtest-response slice, Owner decision 7c): the television cancellation cause gains the tick's automatic
// `rights` and `participant` cancellations on authority loss (contract §4, §7). Protocol 4 and Save51 unchanged, so the
// prior lift is identity. Projection 69 registers the outgoing68 identity, the immutable snapshot b3c179b0's
// (tag p18-sprint16-playtest-candidate-r2-20261028).
const OUTGOING_68 = 'sha256:b91efc9c632b2503a0f5ca0f33a243164e97775b2c13f566746ba004d7835851'
describe('Projection69 playtest-response slice — the outgoing68 capture takes the governed prior path', () => {
  it('accepts the genuine projection-68 capture (b3c179b0 public save route) and keeps both live Save51 slots byte for byte', () => {
    // Pins measured from the actual capture in an immutable snapshot of b3c179b0 (producer docs/engineering/audits/
    // 2026-10-22-codebase-review/playtest-response/bridge-step/tools/capture68.ts in the records repository;
    // OUTGOING68-RECEIPT.json beside the fixture).
    const compressed = readFileSync(new URL('./fixtures/bridge/genuine-projection68-runtime/outgoing68.checkpoint.json.gz', import.meta.url))
    expect(compressed).toHaveLength(164277)
    expect(createHash('sha256').update(compressed).digest('hex')).toBe('401e54b96c85e15e16f70d5b3e45c82812c0dd40b98f763632ce265316b55fae')
    const raw = gunzipSync(compressed).toString('utf8')
    expect(sha256(raw)).toBe('df0ada1aba7c726cfeb6a48632b5bb4f4696c97042116cb642ea93641078c172')
    const original = JSON.parse(raw) as BridgeRuntimeCheckpointV1, before = canonicalJson(original)
    expect(original).toMatchObject({ schemaId: OUTGOING_68, protocolVersion: 4, stateRevision: 0, sessionId: 'p18-authentic-outgoing68-session' }) // the fixture's own value
    expect(original.journal).toHaveLength(1)
    expect(original.journal[0]).toMatchObject({ route: 'save', commandId: 'outgoing68-real-save' })
    expect(JSON.parse(original.journal[0]!.responseJson)).toMatchObject({ accepted: true, schemaId: OUTGOING_68 })
    expect(original.savedSaveJson).not.toBeNull()
    for (const slot of [original.currentSaveJson, original.savedSaveJson!]) {
      expect(sha256(slot)).toBe('eba432b4a7e98d512bd24c104e6c2ef7ed1e4db9f2433828b90dd9dbc115476b')
      expect(JSON.parse(slot)).toMatchObject({ saveVersion: LIVE_SAVE_VERSION, state: { market: { tick: 0 } } })
    }
    expect(LIVE_SAVE_VERSION).toBe(51)
    expect(SCHEMA_ID).not.toBe(OUTGOING_68)
    const outcome = loadOutcome(raw, 'fresh-session-projection-v68')
    expect(outcome).not.toHaveProperty('refused')
    if (!('loaded' in outcome)) return
    const { loaded } = outcome
    expect(SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS.get(OUTGOING_68)).toBe('projection-v68')
    expect(loaded.migratedFromProtocolVersion).toBe(PROTOCOL_VERSION)
    expect(loaded.hydrated.checkpoint).toMatchObject({ schemaId: SCHEMA_ID, protocolVersion: PROTOCOL_VERSION,
      sessionId: 'fresh-session-projection-v68', stateRevision: 0, journal: [], journalDigest: sha256('[]') })
    expect(loaded.hydrated.journal).toEqual([])
    // Already live: the canonical chain is identity, so both slots and both digests are the capture's own.
    expect(loaded.hydrated.checkpoint.currentSaveJson).toBe(original.currentSaveJson)
    expect(loaded.hydrated.checkpoint.savedSaveJson).toBe(original.savedSaveJson)
    expect(loaded.hydrated.checkpoint.currentStateDigest).toBe(original.currentStateDigest)
    expect(loaded.hydrated.checkpoint.savedStateDigest).toBe(original.savedStateDigest)
    const encoded = encodeBridgeRuntimeCheckpoint(loaded.hydrated.checkpoint)
    const reopened = loadBridgeRuntimeCheckpoint(encoded, undefined, () => { throw new Error('current69 must not migrate again') })
    expect(reopened.migratedFromProtocolVersion).toBeNull()
    expect(encodeBridgeRuntimeCheckpoint(reopened.hydrated.checkpoint)).toBe(encoded)
    expect(canonicalJson(original)).toBe(before)
  })
})

describe('C17 shipped projection57 carry-forward', () => {
  it('registers the actual shipped projection57 identity, independently of map iteration', () => {
    expect(SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS.get(C17_SHIPPED_OUTGOING_57)).toBe('projection-v57')
    expect(C17_SHIPPED_OUTGOING_57).not.toBe(SCHEMA_ID)
  })

  it('independently migrates two admitted Save47 slots under actual shipped57 and discards opaque prior journal', () => {
    // Reuse retained actual Save45 captures and PUBLIC lawful migration. No Save48
    // projection, header retag, cash edit or manufactured receipt enters these slots.
    const current45 = accepted45('research').old
    const saved45 = accepted45('baseline265').old
    expect(current45.state.market.tick).toBe(267)
    expect(saved45.state.market.tick).toBe(265)
    const original45 = [shipped47Save.stableStringify(current45), shipped47Save.stableStringify(saved45)]
    const current47 = shipped47Save.migrateToV47(current45)
    const saved47 = shipped47Save.migrateToV47(saved45)
    expect(shipped47Save.stableStringify(current45)).toBe(original45[0])
    expect(shipped47Save.stableStringify(saved45)).toBe(original45[1])
    expect(current47.saveVersion).toBe(47)
    expect(saved47.saveVersion).toBe(47)
    const before47 = [shipped47Save.stableStringify(current47), shipped47Save.stableStringify(saved47)]
    expect(shipped47Save.validateSaveV47(current47)).toBe(current47)
    expect(shipped47Save.validateSaveV47(saved47)).toBe(saved47)
    expect(shipped47Save.stableStringify(current47)).toBe(before47[0])
    expect(shipped47Save.stableStringify(saved47)).toBe(before47[1])
    const currentSaveJson = shipped47Save.exportSave(current47)
    const savedSaveJson = shipped47Save.exportSave(saved47)
    expect(currentSaveJson).not.toBe(savedSaveJson)
    const expectedCurrent = shipped47Save.migrateToLive(shipped47Save.importSave(currentSaveJson))
    const expectedSaved = shipped47Save.migrateToLive(shipped47Save.importSave(savedSaveJson))
    const priorBytes = priorProtocol4Bytes({
      schemaId: C17_SHIPPED_OUTGOING_57,
      sessionId: 'constructed-shipped57-session',
      stateRevision: 17,
      currentSaveJson,
      savedSaveJson,
      journal: [opaqueJournalEntry('constructed-shipped57-command', 'actual57-opaque-unit-control')],
    })
    const loaded = loadBridgeRuntimeCheckpoint(priorBytes, undefined, () => 'fresh-shipped57-unit-session')
    expect(loaded.migratedFromProtocolVersion).toBe(PROTOCOL_VERSION)
    expect(loaded.hydrated.checkpoint).toMatchObject({
      schemaId: SCHEMA_ID, protocolVersion: PROTOCOL_VERSION,
      sessionId: 'fresh-shipped57-unit-session', stateRevision: 0, journal: [],
    })
    expect(loaded.hydrated.journal).toEqual([])
    // Whole envelopes, not a clock-only or current-slot copied-to-saved check.
    expect(loaded.hydrated.currentSave).toEqual(expectedCurrent)
    expect(loaded.hydrated.savedSave).toEqual(expectedSaved)
    expect(loaded.hydrated.currentSave.saveVersion).toBe(LIVE_SAVE_VERSION)
    expect(loaded.hydrated.savedSave?.saveVersion).toBe(LIVE_SAVE_VERSION)
    expect(loaded.hydrated.currentSave.state.market.tick).toBe(267)
    expect(loaded.hydrated.savedSave?.state.market.tick).toBe(265)
    expect(loaded.hydrated.checkpoint.currentStateDigest).toBe(sha256(loaded.hydrated.checkpoint.currentSaveJson))
    expect(loaded.hydrated.checkpoint.savedStateDigest).toBe(sha256(loaded.hydrated.checkpoint.savedSaveJson!))
    const encoded = encodeBridgeRuntimeCheckpoint(loaded.hydrated.checkpoint)
    const reloaded = loadBridgeRuntimeCheckpoint(encoded)
    expect(reloaded.migratedFromProtocolVersion).toBeNull()
    expect(reloaded.hydrated.checkpoint).toEqual(loaded.hydrated.checkpoint)
    expect(encodeBridgeRuntimeCheckpoint(reloaded.hydrated.checkpoint)).toBe(encoded)
    expect(shipped47Save.stableStringify(current47)).toBe(before47[0])
    expect(shipped47Save.stableStringify(saved47)).toBe(before47[1])
  })
})
