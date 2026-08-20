import { createHash } from 'node:crypto'

import { describe, expect, it } from 'vitest'

import {
  BRIDGE_RUNTIME_CHECKPOINT_FORMAT,
  BRIDGE_RUNTIME_CHECKPOINT_VERSION,
  BridgeRuntimeCheckpointError,
  appendBridgeRuntimeJournalEntry,
  createBridgeRuntimeCheckpoint,
  createBridgeRuntimeJournalEntry,
  decodeBridgeRuntimeCheckpoint,
  encodeBridgeRuntimeCheckpoint,
  hydrateBridgeRuntimeCheckpoint,
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

describe('BridgeRuntimeCheckpointV1', () => {
  it('encodes one exact closed canonical shape with one LF and hydrates stable V14 bytes', () => {
    const source = fixture()
    const encoded = encodeBridgeRuntimeCheckpoint(source.checkpoint)
    expect(encoded.endsWith('\n')).toBe(true)
    expect(encoded.endsWith('\n\n')).toBe(false)
    expect(encoded).not.toContain('\r')
    expect(encoded).toBe(`${canonicalJson(source.checkpoint)}\n`)

    const hydrated = decodeBridgeRuntimeCheckpoint(encoded)
    expect(hydrated.checkpoint).toEqual(source.checkpoint)
    expect(encodeBridgeRuntimeCheckpoint(hydrated.checkpoint)).toBe(encoded)
    expect(hydrated.currentSave.saveVersion).toBe(14)
    expect(hydrated.savedSave?.saveVersion).toBe(14)
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

  it('requires untouched canonical V14 current and explicit-save bytes with exact digests', () => {
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
    })).toThrow(/canonical V14 save bytes exactly/)

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

  it('validates an accepted save response V14 payload and digest before journaling it', () => {
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
