import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'

import { describe, expect, it } from 'vitest'

import {
  SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS,
  decodeBridgeRuntimeCheckpoint,
  loadBridgeRuntimeCheckpoint,
  type BridgeRuntimeCheckpointV1,
} from '../bridge/runtime-checkpoint.ts'
import { SCHEMA_ID } from '../bridge/protocol.ts'
import { canonicalJson } from '../bridge/schema/canonical.ts'
import type { BridgeCheckpointStore } from '../bridge/runtime/checkpoint-store.ts'
import { createBridgeRuntimeCoordinator } from '../bridge/runtime/runtime-coordinator.ts'
import { importSave, type SaveFileV18 } from '../src/core/save.js'

// Independent historical authority, not taken from the implementation allowlist:
// P07-OWNER-ACCEPTANCE-RECEIPT.md at 2753e18ba8fb5f65b936c22cde9531646fecc6cd,
// P06 schema/versions rows. Do not replace this with the current SCHEMA_ID.
const P06_SCHEMA_ID = 'sha256:71529afdcb8e5cf645ab136efb9685256da0039e86d989bfab97b7b2cc5d9a8b'
const readyBytes = readFileSync(
  new URL('../ui/e2e/p06-visual-oracle-v1/s4-release-ready.checkpoint.json', import.meta.url),
  'utf8',
)
// Produced once by the actual P06 BridgeSession at accepted P06 commit
// 050b98ee15d83883b209b4e0700a06e064a4eb60: load the frozen Ready checkpoint,
// save command `aud001-p06-save-ready`, then commit exact prod-0000 through
// `aud001-p06-commit`. The P06 decoder validated the full two-entry journal.
// Compression preserves those exact bytes; tests never recreate old data by
// stamping a prior schema onto a current session or current save builder.
const committedBytes = gunzipSync(readFileSync(
  new URL('./fixtures/p06-recovery.checkpoint.json.gz', import.meta.url),
)).toString('utf8')

const predecessors = [
  { name: 'Ready with no explicit save', bytes: readyBytes, journalLength: 0 },
  { name: 'Committed with distinct Ready save and genuine P06 journal', bytes: committedBytes, journalLength: 2 },
]

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex')
}

function previous(bytes: string): BridgeRuntimeCheckpointV1 {
  return JSON.parse(bytes) as BridgeRuntimeCheckpointV1
}

function expectPreservedGameplay(beforeJson: string, after: SaveFileV18): void {
  const before = importSave(beforeJson)
  expect(before.saveVersion).toBe(16)
  // Assert every old root, including IDs, commitment, cash/ledger, week and RNG,
  // against the frozen input. Only the two authorized V16→V18 additions differ.
  // Comparing with migrateToV18's own output would not prove preservation.
  expect(after).toEqual({
    saveVersion: 18,
    seed: before.seed,
    state: {
      ...before.state,
      studioHistory: { recordingStartedWeek: before.state.market.tick, nextEventId: 0, rows: [] },
      foundingRegime: 'endowed',
    },
    broadcastCache: before.broadcastCache,
  })
}

class MemoryCheckpointStore implements BridgeCheckpointStore {
  readonly checkpointPath = '/in-memory/p06-recovery.checkpoint.json'
  readonly writes: string[] = []
  closeCalls = 0
  writeError: Error | null = null

  constructor(public contents: string) {}

  async read(): Promise<string> { return this.contents }
  async writeAtomic(text: string): Promise<void> {
    this.writes.push(text)
    if (this.writeError !== null) throw this.writeError
    this.contents = text
  }
  async close(): Promise<void> { this.closeCalls += 1 }
}

describe('AUD-001 — frozen P06 checkpoint recovery', () => {
  it('pins the predecessor bytes and schema independently of the running contract', () => {
    expect(sha256(readyBytes)).toBe('74e4f4a7b2eda36b1f08a29d44a227f697c2aa768ee04218f1ff508ce91f8c13')
    expect(sha256(committedBytes)).toBe('d9e08202cd40188d7a8f7c66282bfcde35a676ae45f09257072b0709985b7bb0')
    for (const fixture of predecessors) {
      const old = previous(fixture.bytes)
      expect(fixture.bytes).toBe(`${canonicalJson(old)}\n`)
      expect(old.schemaId).toBe(P06_SCHEMA_ID)
      expect(old.journal).toHaveLength(fixture.journalLength)
      for (const entry of old.journal) {
        expect(JSON.parse(entry.requestJson).schemaId).toBe(P06_SCHEMA_ID)
        expect(JSON.parse(entry.responseJson).schemaId).toBe(P06_SCHEMA_ID)
        expect(JSON.parse(entry.responseJson).accepted).toBe(true)
      }
    }
    const committed = previous(committedBytes)
    expect(committed.journal.map((entry) => entry.route)).toEqual(['save', 'command'])
    expect(committed.stateRevision).toBe(1)
    expect(committed.savedSaveJson).toBe(previous(readyBytes).currentSaveJson)
    expect(committed.currentSaveJson).not.toBe(committed.savedSaveJson)
    expect(SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS.get(P06_SCHEMA_ID)).toBe('projection-v14')
    expect(SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS.has(SCHEMA_ID)).toBe(false)
  })

  it.each(predecessors)('loads $name through the governed predecessor path', (fixture) => {
    const old = previous(fixture.bytes)
    const loaded = loadBridgeRuntimeCheckpoint(fixture.bytes, undefined, () => 'aud001-new-session')
    expect(loaded.migratedFromProtocolVersion).toBe(4)
    expect(loaded.hydrated.checkpoint.schemaId).toBe(SCHEMA_ID)
    expect(loaded.hydrated.checkpoint.sessionId).toBe('aud001-new-session')
    expect(loaded.hydrated.checkpoint.sessionId).not.toBe(old.sessionId)
    expect(loaded.hydrated.checkpoint.stateRevision).toBe(0)
    expect(loaded.hydrated.journal).toEqual([])
    expect(loaded.hydrated.checkpoint.journal).toEqual([])
    expectPreservedGameplay(old.currentSaveJson, loaded.hydrated.currentSave)
    if (old.savedSaveJson === null) {
      expect(loaded.hydrated.savedSave).toBeNull()
      expect(loaded.hydrated.checkpoint.savedSaveJson).toBeNull()
      expect(loaded.hydrated.checkpoint.savedStateDigest).toBeNull()
    } else {
      expect(loaded.hydrated.savedSave).not.toBeNull()
      expectPreservedGameplay(old.savedSaveJson, loaded.hydrated.savedSave!)
      expect(loaded.hydrated.checkpoint.savedSaveJson).not.toBe(loaded.hydrated.checkpoint.currentSaveJson)
    }
  })

  it.each(predecessors)('persists $name once and reopens without remigration', async (fixture) => {
    const store = new MemoryCheckpointStore(fixture.bytes)
    const fatals: unknown[] = []
    const coordinator = await createBridgeRuntimeCoordinator({
      store,
      fatal: (error) => { fatals.push(error) },
    })
    try {
      expect(store.writes).toHaveLength(1)
      expect(fatals).toEqual([])
      const migrated = decodeBridgeRuntimeCheckpoint(store.contents)
      expect(migrated.checkpoint.sessionId).not.toBe(previous(fixture.bytes).sessionId)
      expect(migrated.checkpoint.stateRevision).toBe(0)
      expect(migrated.checkpoint.journal).toEqual([])
      const snapshot = await coordinator.read((session) => session.snapshot())
      expect(snapshot.sessionId).toBe(migrated.checkpoint.sessionId)
      expect(snapshot.stateDigest).toBe(migrated.checkpoint.currentStateDigest)
    } finally {
      await coordinator.close()
    }

    const persisted = store.contents
    const restartedStore = new MemoryCheckpointStore(persisted)
    const restarted = await createBridgeRuntimeCoordinator({
      store: restartedStore,
      fatal: (error) => { fatals.push(error) },
    })
    try {
      expect(loadBridgeRuntimeCheckpoint(persisted).migratedFromProtocolVersion).toBeNull()
      expect(restartedStore.writes).toEqual([])
      expect(restartedStore.contents).toBe(persisted)
      const snapshot = await restarted.read((session) => session.snapshot())
      expect(snapshot.sessionId).toBe(previous(persisted).sessionId)
      expect(snapshot.stateDigest).toBe(previous(persisted).currentStateDigest)
      expect(snapshot.stateRevision).toBe(0)
      expect(fatals).toEqual([])
    } finally {
      await restarted.close()
    }
    expect(store.closeCalls).toBe(1)
    expect(restartedStore.closeCalls).toBe(1)
  })

  it.each([
    { name: 'unknown schema', changes: { schemaId: `sha256:${'f'.repeat(64)}` }, error: /checkpoint.schemaId/ },
    { name: 'future protocol', changes: { protocolVersion: 5 }, error: /checkpoint.protocolVersion/ },
    { name: 'future checkpoint format', changes: { checkpointVersion: 2 }, error: /checkpoint.checkpointVersion/ },
    { name: 'corrupt state digest', changes: { currentStateDigest: '0'.repeat(64) }, error: /checkpoint.currentStateDigest/ },
  ])('rejects $name before writing or exposing authority', async ({ changes, error }) => {
    const bytes = `${canonicalJson({ ...previous(committedBytes), ...changes })}\n`
    const store = new MemoryCheckpointStore(bytes)
    const fatals: unknown[] = []
    await expect(createBridgeRuntimeCoordinator({
      store,
      fatal: (reason) => { fatals.push(reason) },
    })).rejects.toThrow(error)
    expect(store.writes).toEqual([])
    expect(store.contents).toBe(bytes)
    expect(store.closeCalls).toBe(1)
    expect(fatals).toHaveLength(1)
  })

  it('preserves the predecessor if the migration write fails', async () => {
    const store = new MemoryCheckpointStore(committedBytes)
    store.writeError = new Error('audit migration write refused')
    const fatals: unknown[] = []
    await expect(createBridgeRuntimeCoordinator({
      store,
      fatal: (reason) => { fatals.push(reason) },
    })).rejects.toThrow('audit migration write refused')
    expect(store.writes).toHaveLength(1)
    expect(store.contents).toBe(committedBytes)
    expect(store.closeCalls).toBe(1)
    expect(fatals).toHaveLength(1)
  })

  it('refuses a future gameplay save inside a recognized predecessor before writing', async () => {
    const old = previous(committedBytes)
    const currentSaveJson = canonicalJson({ ...JSON.parse(old.currentSaveJson), saveVersion: 99 })
    const bytes = `${canonicalJson({ ...old, currentSaveJson, currentStateDigest: sha256(currentSaveJson) })}\n`
    const store = new MemoryCheckpointStore(bytes)
    const fatals: unknown[] = []
    await expect(createBridgeRuntimeCoordinator({
      store,
      fatal: (reason) => { fatals.push(reason) },
    })).rejects.toThrow(/unknown saveVersion 99/)
    expect(store.writes).toEqual([])
    expect(store.contents).toBe(bytes)
    expect(store.closeCalls).toBe(1)
    expect(fatals).toHaveLength(1)
  })
})
