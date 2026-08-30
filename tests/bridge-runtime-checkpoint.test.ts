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
import { exportSave, makeSaveV14 } from '../src/core/index.js'

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

function v14CurrentSaveJson(seed: string): string {
  return exportSave(makeSaveV14(createBridgeInitialState(seed)))
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
    expect(loaded.hydrated.currentSave.saveVersion).toBe(15)
    expect(loaded.hydrated.savedSave?.saveVersion).toBe(15)
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
    expect(loaded.hydrated.currentSave.saveVersion).toBe(15)
    expect(loaded.hydrated.savedSave?.saveVersion).toBe(15)

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
    expect(hydrated.currentSave.saveVersion).toBe(15)
    expect(hydrated.savedSave?.saveVersion).toBe(15)
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
    })).toThrow(/canonical V15 save bytes exactly/)

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
  it('migrates a v4-identity (f84ae77e) checkpoint with a V14 current save and an opaque 2-entry journal', () => {
    const seedState = createBridgeInitialState('prior-p4-v4-basic')
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

    // save now V15, digests recomputed correctly.
    expect(loaded.hydrated.checkpoint.schemaId).toBe(SCHEMA_ID)
    expect(loaded.hydrated.currentSave.saveVersion).toBe(15)
    expect(loaded.hydrated.checkpoint.currentStateDigest)
      .toBe(sha256(loaded.hydrated.checkpoint.currentSaveJson))

    // (4) V14 -> V15 content preservation, field-level.
    expect(loaded.hydrated.currentSave.state.market.tick).toBe(seedState.market.tick)
    expect(loaded.hydrated.currentSave.state.studio.cash).toBe(seedState.studio.cash)
    expect(loaded.hydrated.currentSave.state.founding).toBeNull()
  })

  it('preserves and migrates a non-null savedSaveJson slot for a prior protocol-4 identity', () => {
    const currentState = createBridgeInitialState('prior-p4-v4-saved-current')
    const savedState = createBridgeInitialState('prior-p4-v4-saved-saved')
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
    expect(loaded.hydrated.savedSave?.saveVersion).toBe(15)
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
      const seedState = createBridgeInitialState(`prior-p4-each-${era}`)
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
      expect(loaded.hydrated.currentSave.saveVersion).toBe(15)
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

  it('is exactly the ten historical protocol-4 identities, pinned as literals', () => {
    // Load-bearing completeness: iterating the map cannot catch a wrong or
    // missing hash; these literals were re-derived independently from the
    // generated-header history during hostile review. A projection bump must
    // consciously append its OUTGOING identity here — the P04A reopen
    // happened because v9/v10 never were. P05A W2 appended the outgoing
    // projection-v11 identity per the schema-bump law.
    expect([...SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS.keys()].sort()).toEqual([
      'sha256:01f15efc8fc33fd810b051242857385ca23b5e1c775b357db1bfe5a70e907e1e',
      'sha256:0285e92f32c27cd2960df802b3f7ea156a15372f05001ad1f4964c2f25db55b5',
      'sha256:15033cf9ca43be65abcb25fc6f910f9487ac23056090126ec7d3e2353f6ce587',
      'sha256:510f08e4a551827a30e0f3d93bbe09fa5ddadbd39366b4dcfa93530500c7979c',
      'sha256:7e3af4db0d3d18cdeaab00082e0034f304a9141f46ea87e9e64e5a99d985483c',
      'sha256:80f2f0fcd14d1b25e713c2624286a6c05a98c53ea5cfcb2b47612f8c030f5e47',
      'sha256:92317ec179456cdc5bd5cc7c4ca47dd066b768a9e2e45519f1263ef921a211a4',
      'sha256:ba9cd199704f66d375585d0bec2128c950618a3ba6a8cf0845a5550fde41659f',
      'sha256:be7ed660d04ed9b1056f48e946f86f26c10cab42b950a273d57ad9cba372f5bb',
      'sha256:f84ae77ec59a0d7ca7cdd89115456504ddecbde2c6e3839936e4951bd65bce61',
    ])
  })
})
