import { describe, expect, it } from 'vitest'

import {
  PROTOCOL_VERSION,
  SCHEMA_ID,
  type ControlEnvelope,
  type SubmitIntentCommand,
} from '../bridge/protocol.ts'
import {
  BridgeRuntimeCheckpointCapacityError,
  LEGACY_BRIDGE_RUNTIME_PROTOCOL_VERSION,
  LEGACY_BRIDGE_RUNTIME_SCHEMA_ID,
  PREVIOUS_BRIDGE_RUNTIME_PROTOCOL_4_SCHEMA_ID,
  decodeBridgeRuntimeCheckpoint,
  encodeBridgeRuntimeCheckpoint,
} from '../bridge/runtime-checkpoint.ts'
import type { BridgeCheckpointStore } from '../bridge/runtime/checkpoint-store.ts'
import {
  BridgeRuntimeCoordinatorError,
  createBridgeRuntimeCoordinator,
} from '../bridge/runtime/runtime-coordinator.ts'
import { canonicalJson } from '../bridge/schema/canonical.ts'
import { BridgeSession, createBridgeInitialState } from '../bridge/session.ts'

type Deferred = {
  promise: Promise<void>
  resolve: () => void
}

function deferred(): Deferred {
  let resolve!: () => void
  const promise = new Promise<void>((complete) => { resolve = complete })
  return { promise, resolve }
}

class FakeCheckpointStore implements BridgeCheckpointStore {
  readonly checkpointPath = '/fake/project-studio-runtime.checkpoint.json'
  readonly writeAttempts: string[] = []
  closeCalls = 0
  writeBehavior: ((text: string, index: number) => Promise<void>) | null = null

  constructor(public contents: string | null) {}

  async read(): Promise<string | null> {
    return this.contents
  }

  async writeAtomic(text: string): Promise<void> {
    const index = this.writeAttempts.push(text) - 1
    if (this.writeBehavior !== null) await this.writeBehavior(text, index)
    this.contents = text
  }

  async close(): Promise<void> {
    this.closeCalls += 1
  }
}

type SessionFixture = {
  checkpointJson: string
  command: SubmitIntentCommand
  sessionId: string
}

function sessionFixture(name: string): SessionFixture {
  const sessionId = `runtime-coordinator-${name}`
  const session = new BridgeSession(createBridgeInitialState(name), sessionId)
  const intent = session.snapshot().availableIntents.find(
    (candidate) => candidate.kind === 'commissionScreenplay',
  )
  if (intent === undefined) throw new Error('Coordinator fixture omitted commission intent.')
  return {
    checkpointJson: encodeBridgeRuntimeCheckpoint(session.exportRuntimeCheckpoint()),
    command: {
      protocolVersion: PROTOCOL_VERSION,
      schemaId: SCHEMA_ID,
      sessionId,
      commandId: `runtime-coordinator-${name}-command`,
      expectedStateRevision: session.stateRevision,
      type: 'submitIntent',
      payload: { intentId: intent.intentId },
    },
    sessionId,
  }
}

describe('BridgeRuntimeCoordinator', () => {
  it('atomically persists a state-preserving protocol-3 rollover before becoming ready', async () => {
    const fixture = sessionFixture('protocol-3-upgrade')
    const current = decodeBridgeRuntimeCheckpoint(fixture.checkpointJson).checkpoint
    const legacyJson = `${canonicalJson({
      ...current,
      protocolVersion: LEGACY_BRIDGE_RUNTIME_PROTOCOL_VERSION,
      schemaId: LEGACY_BRIDGE_RUNTIME_SCHEMA_ID,
    })}\n`
    const store = new FakeCheckpointStore(legacyJson)
    const coordinator = await createBridgeRuntimeCoordinator({ store, fatal: () => undefined })

    expect(store.writeAttempts).toHaveLength(1)
    const migrated = decodeBridgeRuntimeCheckpoint(store.contents ?? '').checkpoint
    expect(migrated.sessionId).not.toBe(current.sessionId)
    expect(migrated.stateRevision).toBe(0)
    expect(migrated.currentSaveJson).toBe(current.currentSaveJson)
    expect(migrated.currentStateDigest).toBe(current.currentStateDigest)
    expect(migrated.savedSaveJson).toBe(current.savedSaveJson)
    expect(migrated.journal).toEqual([])
    const snapshot = await coordinator.read((session) => session.snapshot())
    expect(snapshot.sessionId).toBe(migrated.sessionId)
    expect(snapshot.stateDigest).toBe(current.currentStateDigest)
    await coordinator.close()
  })

  it('preserves protocol-3 bytes when the migration checkpoint commit fails', async () => {
    const fixture = sessionFixture('protocol-3-write-failure')
    const current = decodeBridgeRuntimeCheckpoint(fixture.checkpointJson).checkpoint
    const legacyJson = `${canonicalJson({
      ...current,
      protocolVersion: LEGACY_BRIDGE_RUNTIME_PROTOCOL_VERSION,
      schemaId: LEGACY_BRIDGE_RUNTIME_SCHEMA_ID,
    })}\n`
    const store = new FakeCheckpointStore(legacyJson)
    store.writeBehavior = async () => { throw new Error('migration write failed') }
    const fatals: unknown[] = []

    await expect(createBridgeRuntimeCoordinator({
      store,
      fatal: (error) => { fatals.push(error) },
    })).rejects.toThrow(/migration write failed/)
    expect(store.contents).toBe(legacyJson)
    expect(store.writeAttempts).toHaveLength(1)
    expect(store.closeCalls).toBe(1)
    expect(fatals).toHaveLength(1)
  })

  it('atomically rolls the previous protocol-4 schema into a fresh replay session', async () => {
    const fixture = sessionFixture('protocol-4-schema-upgrade')
    const current = decodeBridgeRuntimeCheckpoint(fixture.checkpointJson).checkpoint
    const priorJson = `${canonicalJson({
      ...current,
      schemaId: PREVIOUS_BRIDGE_RUNTIME_PROTOCOL_4_SCHEMA_ID,
    })}\n`
    const store = new FakeCheckpointStore(priorJson)
    const coordinator = await createBridgeRuntimeCoordinator({ store, fatal: () => undefined })

    expect(store.writeAttempts).toHaveLength(1)
    const migrated = decodeBridgeRuntimeCheckpoint(store.contents ?? '').checkpoint
    expect(migrated.sessionId).not.toBe(current.sessionId)
    expect(migrated.stateRevision).toBe(0)
    expect(migrated.currentSaveJson).toBe(current.currentSaveJson)
    expect(migrated.currentStateDigest).toBe(current.currentStateDigest)
    expect(migrated.savedSaveJson).toBe(current.savedSaveJson)
    expect(migrated.journal).toEqual([])
    const snapshot = await coordinator.read((session) => session.snapshot())
    expect(snapshot.sessionId).toBe(migrated.sessionId)
    expect(snapshot.stateDigest).toBe(current.currentStateDigest)
    await coordinator.close()
  })

  it('keeps prior protocol-4 bytes when its schema rollover commit fails', async () => {
    const fixture = sessionFixture('protocol-4-schema-write-failure')
    const current = decodeBridgeRuntimeCheckpoint(fixture.checkpointJson).checkpoint
    const priorJson = `${canonicalJson({
      ...current,
      schemaId: PREVIOUS_BRIDGE_RUNTIME_PROTOCOL_4_SCHEMA_ID,
    })}\n`
    const store = new FakeCheckpointStore(priorJson)
    store.writeBehavior = async () => { throw new Error('schema migration write failed') }
    const fatals: unknown[] = []

    await expect(createBridgeRuntimeCoordinator({
      store,
      fatal: (error) => { fatals.push(error) },
    })).rejects.toThrow(/schema migration write failed/)
    expect(store.contents).toBe(priorJson)
    expect(store.writeAttempts).toHaveLength(1)
    expect(store.closeCalls).toBe(1)
    expect(fatals).toHaveLength(1)
  })

  it('persists a fresh runtime checkpoint before becoming ready', async () => {
    const writeStarted = deferred()
    const releaseWrite = deferred()
    const store = new FakeCheckpointStore(null)
    store.writeBehavior = async () => {
      writeStarted.resolve()
      await releaseWrite.promise
    }
    const fatals: unknown[] = []

    const opening = createBridgeRuntimeCoordinator({
      store,
      fatal: (error) => { fatals.push(error) },
    })
    let ready = false
    void opening.then(() => { ready = true })

    await writeStarted.promise
    expect(ready).toBe(false)
    expect(store.contents).toBeNull()

    releaseWrite.resolve()
    const coordinator = await opening
    expect(ready).toBe(true)
    expect(store.contents).not.toBeNull()
    const persisted = decodeBridgeRuntimeCheckpoint(store.contents ?? '').checkpoint
    const snapshot = await coordinator.read((session) => session.snapshot())
    expect(persisted).toMatchObject({
      sessionId: snapshot.sessionId,
      stateRevision: 0,
      savedSaveJson: null,
      savedStateDigest: null,
      journal: [],
    })
    expect(persisted.currentStateDigest).toBe(snapshot.stateDigest)
    expect(snapshot.gameWeek).toBe(0)
    expect(snapshot.snapshot.lot.week).toBe(0)
    expect(snapshot.snapshot.productions.activeProductions).toEqual([])
    expect(snapshot.snapshot.releaseResults.releasedFilms).toEqual([])
    expect(snapshot.snapshot.journeyNotices.firstFilmJourney).toMatchObject({
      stage: 'no-picture',
      beat: 'no-picture',
      ordinal: 1,
      next: { kind: 'commission' },
    })
    expect(snapshot.availableIntents).not.toHaveLength(0)
    expect(snapshot.availableIntents.every(
      (intent) => intent.kind === 'signFoundingContract',
    )).toBe(true)
    expect(fatals).toEqual([])
    await coordinator.close()
  })

  it('does not expose a first-seen dispatch to its caller or a queued read before commit', async () => {
    const fixture = sessionFixture('commit-boundary')
    const writeStarted = deferred()
    const releaseWrite = deferred()
    const store = new FakeCheckpointStore(fixture.checkpointJson)
    store.writeBehavior = async () => {
      writeStarted.resolve()
      await releaseWrite.promise
    }
    const fatals: unknown[] = []
    const coordinator = await createBridgeRuntimeCoordinator({
      store,
      fatal: (error) => { fatals.push(error) },
    })

    const dispatched = coordinator.dispatch('command', fixture.command)
    const read = coordinator.read((session) => session.snapshot())
    let dispatchSettled = false
    let readSettled = false
    void dispatched.then(() => { dispatchSettled = true }, () => { dispatchSettled = true })
    void read.then(() => { readSettled = true }, () => { readSettled = true })

    await writeStarted.promise
    expect(dispatchSettled).toBe(false)
    expect(readSettled).toBe(false)
    expect(store.contents).toBe(fixture.checkpointJson)

    releaseWrite.resolve()
    const result = await dispatched
    const snapshot = await read
    expect(result.firstSeen).toBe(true)
    expect(result.response.accepted).toBe(true)
    expect(result.responseJson).toBe(canonicalJson(result.response))
    expect(snapshot.stateRevision).toBe(result.response.stateRevision)
    expect(store.writeAttempts).toHaveLength(1)
    expect(decodeBridgeRuntimeCheckpoint(store.contents ?? '').checkpoint.journal).toHaveLength(1)

    const replay = await coordinator.dispatch('command', fixture.command)
    expect(replay.firstSeen).toBe(false)
    expect(replay.responseJson).toBe(result.responseJson)
    expect(replay.response).toEqual(result.response)
    expect(store.writeAttempts).toHaveLength(1)
    expect(fatals).toEqual([])
    await coordinator.close()
  })

  it('restores logical identity, revision, and the exact historical response', async () => {
    const fixture = sessionFixture('restore')
    const firstStore = new FakeCheckpointStore(fixture.checkpointJson)
    const first = await createBridgeRuntimeCoordinator({ store: firstStore, fatal: () => undefined })
    const original = await first.dispatch('command', fixture.command)
    const persisted = firstStore.contents
    expect(persisted).not.toBeNull()
    await first.close()

    const restoredStore = new FakeCheckpointStore(persisted)
    const restored = await createBridgeRuntimeCoordinator({
      store: restoredStore,
      fatal: () => undefined,
    })
    const restoredState = await restored.read((session) => ({
      sessionId: session.sessionId,
      stateRevision: session.stateRevision,
      runtimeJournalSize: session.runtimeJournalSize,
      digest: session.snapshot().stateDigest,
    }))
    const persistedCheckpoint = decodeBridgeRuntimeCheckpoint(persisted ?? '').checkpoint
    expect(restoredState).toMatchObject({
      sessionId: fixture.sessionId,
      stateRevision: original.response.stateRevision,
      runtimeJournalSize: 1,
      digest: persistedCheckpoint.currentStateDigest,
    })

    const replay = await restored.dispatch('command', fixture.command)
    expect(replay).toEqual({
      response: original.response,
      responseJson: original.responseJson,
      firstSeen: false,
    })
    expect(restoredStore.writeAttempts).toEqual([])
    await restored.close()
  })

  it('poisons queued and later reads when a checkpoint commit fails without replacing prior bytes', async () => {
    const fixture = sessionFixture('commit-failure')
    const failure = new Error('checkpoint device is full')
    const store = new FakeCheckpointStore(fixture.checkpointJson)
    store.writeBehavior = async () => { throw failure }
    const fatals: unknown[] = []
    const coordinator = await createBridgeRuntimeCoordinator({
      store,
      fatal: (error) => { fatals.push(error) },
    })

    const dispatched = coordinator.dispatch('command', fixture.command)
    const queuedRead = coordinator.read((session) => session.snapshot())
    await Promise.all([
      expect(dispatched).rejects.toBe(failure),
      expect(queuedRead).rejects.toBe(failure),
    ])
    expect(store.contents).toBe(fixture.checkpointJson)
    expect(store.writeAttempts).toHaveLength(1)
    expect(fatals).toEqual([failure])

    await expect(coordinator.read((session) => session.stateRevision)).rejects.toBe(failure)
    expect(fatals).toEqual([failure])
    await coordinator.close()
    expect(store.closeCalls).toBe(1)
  })

  it('rolls full journals without changing current or explicitly saved game authority', async () => {
    const fixture = sessionFixture('journal-rollover')
    const store = new FakeCheckpointStore(fixture.checkpointJson)
    const fatals: unknown[] = []
    const limits = {
      maxCheckpointBytes: 64 * 1024 * 1024,
      maxJournalEntries: 1,
      maxJournalBytes: 32 * 1024 * 1024,
    }
    const coordinator = await createBridgeRuntimeCoordinator({
      store,
      fatal: (error) => { fatals.push(error) },
      checkpointLimits: limits,
    })

    const initialState = await coordinator.read((session) => session.snapshot())
    const saveRequest: ControlEnvelope = {
      protocolVersion: PROTOCOL_VERSION,
      schemaId: SCHEMA_ID,
      sessionId: initialState.sessionId,
      commandId: 'journal-rollover-save',
      expectedStateRevision: initialState.stateRevision,
    }
    const acceptedSave = await coordinator.dispatch('save', saveRequest)
    if (!acceptedSave.response.accepted) throw new Error(acceptedSave.response.message)
    expect(acceptedSave.firstSeen).toBe(true)
    const exactReplay = await coordinator.dispatch('save', saveRequest)
    expect(exactReplay.responseJson).toBe(acceptedSave.responseJson)
    expect(exactReplay.firstSeen).toBe(false)

    const rolled = await coordinator.dispatch('command', fixture.command)
    expect(rolled).toMatchObject({
      firstSeen: false,
      sessionRolledOver: true,
      response: {
        accepted: false,
        reasonCode: 'SESSION_MISMATCH',
        stateRevision: 0,
        stateDigest: initialState.stateDigest,
      },
    })

    const persisted = decodeBridgeRuntimeCheckpoint(store.contents ?? '', limits).checkpoint
    expect(persisted).toMatchObject({
      stateRevision: 0,
      currentStateDigest: initialState.stateDigest,
      savedSaveJson: acceptedSave.response.saveJson,
      savedStateDigest: acceptedSave.response.stateDigest,
      journal: [],
    })
    expect(persisted.sessionId).not.toBe(initialState.sessionId)
    expect(store.writeAttempts).toHaveLength(2)
    expect(fatals).toEqual([])

    const resumedCommand = await coordinator.dispatch('command', {
      ...fixture.command,
      sessionId: persisted.sessionId,
      commandId: 'journal-rollover-resumed-command',
      expectedStateRevision: 0,
    })
    expect(resumedCommand).toMatchObject({ firstSeen: true, response: { accepted: true } })
    const mutatedState = await coordinator.read((session) => session.snapshot())
    expect(mutatedState.stateDigest).not.toBe(initialState.stateDigest)

    const loadRequest: ControlEnvelope = {
      protocolVersion: PROTOCOL_VERSION,
      schemaId: SCHEMA_ID,
      sessionId: mutatedState.sessionId,
      commandId: 'journal-rollover-load',
      expectedStateRevision: mutatedState.stateRevision,
    }
    const loadRollover = await coordinator.dispatch('load', loadRequest)
    expect(loadRollover).toMatchObject({
      firstSeen: false,
      sessionRolledOver: true,
      response: {
        accepted: false,
        reasonCode: 'SESSION_MISMATCH',
        stateRevision: 0,
        stateDigest: mutatedState.stateDigest,
      },
    })
    const persistedAfterLoadRollover = decodeBridgeRuntimeCheckpoint(store.contents ?? '', limits).checkpoint
    expect(persistedAfterLoadRollover).toMatchObject({
      stateRevision: 0,
      currentStateDigest: mutatedState.stateDigest,
      savedSaveJson: acceptedSave.response.saveJson,
      savedStateDigest: initialState.stateDigest,
      journal: [],
    })

    const resumedLoad = await coordinator.dispatch('load', {
      ...loadRequest,
      sessionId: persistedAfterLoadRollover.sessionId,
      commandId: 'journal-rollover-resumed-load',
      expectedStateRevision: 0,
    })
    expect(resumedLoad).toMatchObject({
      firstSeen: true,
      response: {
        accepted: true,
        stateRevision: 1,
        stateDigest: initialState.stateDigest,
      },
    })
    expect(await coordinator.read((session) => session.snapshot())).toMatchObject({
      stateRevision: 1,
      stateDigest: initialState.stateDigest,
    })
    expect(store.writeAttempts).toHaveLength(5)
    expect(fatals).toEqual([])
    await coordinator.close()
  })

  it('poisons instead of rolling when one entry cannot fit an empty journal', async () => {
    const fixture = sessionFixture('intrinsic-entry-capacity')
    const store = new FakeCheckpointStore(fixture.checkpointJson)
    const fatals: unknown[] = []
    const coordinator = await createBridgeRuntimeCoordinator({
      store,
      fatal: (error) => { fatals.push(error) },
      checkpointLimits: {
        maxCheckpointBytes: 64 * 1024 * 1024,
        maxJournalEntries: 0,
        maxJournalBytes: 32 * 1024 * 1024,
      },
    })

    const failure = await coordinator.dispatch('command', fixture.command).then(
      () => null,
      (error: unknown) => error,
    )
    expect(failure).toBeInstanceOf(BridgeRuntimeCheckpointCapacityError)
    expect(failure).toMatchObject({ checkpointPath: 'checkpoint.journal' })
    expect(fatals).toEqual([failure])
    expect(store.contents).toBe(fixture.checkpointJson)
    expect(store.writeAttempts).toEqual([])

    await expect(coordinator.read((session) => session.snapshot())).rejects.toBe(failure)
    expect(fatals).toEqual([failure])
    await coordinator.close()
  })

  it('drains accepted work before releasing the store and rejects work added after close', async () => {
    const fixture = sessionFixture('close-drain')
    const writeStarted = deferred()
    const releaseWrite = deferred()
    const store = new FakeCheckpointStore(fixture.checkpointJson)
    store.writeBehavior = async () => {
      writeStarted.resolve()
      await releaseWrite.promise
    }
    const fatals: unknown[] = []
    const coordinator = await createBridgeRuntimeCoordinator({
      store,
      fatal: (error) => { fatals.push(error) },
    })

    const dispatched = coordinator.dispatch('command', fixture.command)
    await writeStarted.promise
    const closing = coordinator.close()
    let closeSettled = false
    void closing.then(() => { closeSettled = true }, () => { closeSettled = true })

    expect(closeSettled).toBe(false)
    expect(store.closeCalls).toBe(0)
    await expect(coordinator.read((session) => session.stateRevision)).rejects.toMatchObject({
      name: 'BridgeRuntimeCoordinatorError',
      code: 'CLOSED',
    } satisfies Partial<BridgeRuntimeCoordinatorError>)

    releaseWrite.resolve()
    await expect(dispatched).resolves.toMatchObject({ firstSeen: true })
    await closing
    expect(store.closeCalls).toBe(1)
    expect(fatals).toEqual([])
    expect(coordinator.close()).toBe(closing)
  })
})
