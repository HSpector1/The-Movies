// OPS-P08P10-OWNER-UX-01: actual predecessor compatibility at the coordinator boundary.
// Requires the two frozen gzip byte copies in tests/fixtures/ and both UX producers.
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { describe, expect, it } from 'vitest'
import { PROTOCOL_VERSION, PROJECTION_VERSION, SCHEMA_ID } from '../bridge/protocol.ts'
import {
  decodeBridgeRuntimeCheckpoint,
  encodeBridgeRuntimeCheckpoint,
  loadBridgeRuntimeCheckpoint,
  SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS,
  type BridgeRuntimeCheckpointV1,
} from '../bridge/runtime-checkpoint.ts'
import { canonicalJson } from '../bridge/schema/canonical.ts'
import { BridgeSession } from '../bridge/session.ts'
import type { BridgeCheckpointStore } from '../bridge/runtime/checkpoint-store.ts'
import { createBridgeRuntimeCoordinator } from '../bridge/runtime/runtime-coordinator.ts'

// Independent historical literal: generated DTO header at accepted recovery engine
// source 91e760f328adcfd62de6ae576dcb959612af09e3, corroborated by both frozen inputs.
// Never derive the predecessor identity from the implementation registry/current schema.
const P20_SCHEMA = 'sha256:d3338cb713385cc23414e6a17293a5900871764f0eeaed19698e17634e74740b'
const sha = (value: string) => createHash('sha256').update(value).digest('hex')
const readFrozen = (name: string) => gunzipSync(readFileSync(new URL(`./fixtures/${name}`, import.meta.url))).toString('utf8')
const beforeBytes = readFrozen('p20-before-hire.checkpoint.json.gz')
const afterBytes = readFrozen('p20-after-hire.checkpoint.json.gz')
const old = (bytes: string) => JSON.parse(bytes) as BridgeRuntimeCheckpointV1
const before = old(beforeBytes)
const after = old(afterBytes)

// CONSTRUCTED OUTER CHECKPOINT, explicitly not a claimed capture of an old run:
// use the genuine R12 current state/journal and the earlier genuine Week105 save
// as its distinct manual slot. This isolates the loader's independent-slot law.
// Neither gameplay state nor old request/response body is rebuilt or restamped.
const distinctBytes = `${canonicalJson({
  ...after, savedSaveJson: before.currentSaveJson, savedStateDigest: before.currentStateDigest,
})}\n`
const cases = [
  { name: 'frozen Week105 null slot', bytes: beforeBytes },
  { name: 'frozen R12 Week106 null slot and genuine two-command journal', bytes: afterBytes },
  { name: 'constructed distinct-slot envelope from frozen Week106/current and Week105/saved bytes', bytes: distinctBytes },
]

class MemoryStore implements BridgeCheckpointStore {
  readonly checkpointPath = '/in-memory/owner-ux-projection20.checkpoint.json'
  readonly writes: string[] = []
  closeCalls = 0
  failWrite = false
  constructor(public contents: string) {}
  async read() { return this.contents }
  async writeAtomic(contents: string) {
    this.writes.push(contents)
    if (this.failWrite) throw new Error('owner-ux migration write failure')
    this.contents = contents
  }
  async close() { this.closeCalls += 1 }
}

describe('Owner UX outgoing projection20 migration', () => {
  it('pins genuine prior bytes, source identity, actual journal, and constructed-case provenance', () => {
    expect(sha(beforeBytes)).toBe('88049d4408573de3a36a56957c2b8d3aed36655b9b3dbadc68da7bef991a8510')
    expect(sha(afterBytes)).toBe('a02fd2ac61c4dab71327cc685d0649da005c43f3834e47366f63a46318dfd10b')
    expect(PROTOCOL_VERSION).toBe(4)
    expect(PROJECTION_VERSION).toBe(29)
    expect(SCHEMA_ID).not.toBe(P20_SCHEMA)
    expect(SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS.get(P20_SCHEMA)).toBe('projection-v20')
    expect(SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS.has(SCHEMA_ID)).toBe(false)
    for (const checkpoint of [before, after]) {
      expect(checkpoint.schemaId).toBe(P20_SCHEMA)
      expect(JSON.parse(checkpoint.currentSaveJson).saveVersion).toBe(18)
      expect(checkpoint.savedSaveJson).toBeNull()
      expect(checkpoint.savedStateDigest).toBeNull()
      expect(sha(checkpoint.currentSaveJson)).toBe(checkpoint.currentStateDigest)
    }
    expect(before.stateRevision).toBe(0)
    expect(before.journal).toEqual([])
    expect(after.stateRevision).toBe(2)
    expect(after.journal.map(row => [row.route, row.commandId])).toEqual([
      ['command', '14d24671750646e198cb71f38b913124'],
      ['command', '4cbf039f201340cdaa246d619d7802e1'],
    ])
    expect(after.currentStateDigest).toBe('4f83f354594cd3b9f457e233d05a2c39c321fce339f2d9b01d3f706a5c381954')
    expect(after.journalDigest).toBe('6fd40cbc30689004316b3f206a3881f63561b88865c46db89cb06c5deb714c37')
    expect(JSON.parse(before.currentSaveJson).state.market.tick).toBe(105)
    expect(JSON.parse(after.currentSaveJson).state.market.tick).toBe(106)
    for (const entry of after.journal) {
      const request = JSON.parse(entry.requestJson)
      const response = JSON.parse(entry.responseJson)
      expect(request.schemaId).toBe(P20_SCHEMA)
      expect(response.schemaId).toBe(P20_SCHEMA)
      expect(response.snapshotVersion).toBe(20)
      expect(response.accepted).toBe(true)
      expect(response).not.toHaveProperty('savedSlot')
      expect(response.snapshot.talent.talent.profiles[0]).not.toHaveProperty('genreExperience')
    }
    const constructed = old(distinctBytes)
    expect(constructed.currentSaveJson).toBe(after.currentSaveJson)
    expect(constructed.savedSaveJson).toBe(before.currentSaveJson)
    expect(constructed.currentSaveJson).not.toBe(constructed.savedSaveJson)
    expect(constructed.journal).toEqual(after.journal)
  })

  it.each(cases)('migrates $name without changing either V18 gameplay slot', fixture => {
    const predecessor = old(fixture.bytes)
    const loaded = loadBridgeRuntimeCheckpoint(fixture.bytes, undefined, () => 'owner-ux-new-schema-session')
    const next = loaded.hydrated.checkpoint
    expect(loaded.migratedFromProtocolVersion).toBe(4)
    expect(next.schemaId).toBe(SCHEMA_ID)
    expect(next.sessionId).toBe('owner-ux-new-schema-session')
    expect(next.sessionId).not.toBe(predecessor.sessionId)
    expect(next.stateRevision).toBe(0)
    expect(next.journal).toEqual([])
    expect(loaded.hydrated.journal).toEqual([])
    // P12 adds only the governed Hollywood root at each slot's own week.
    for(const [beforeJson,afterJson,afterDigest] of [[predecessor.currentSaveJson,next.currentSaveJson,next.currentStateDigest],[predecessor.savedSaveJson,next.savedSaveJson,next.savedStateDigest]]){
      if(beforeJson===null){expect(afterJson).toBeNull();expect(afterDigest).toBeNull();continue}
      const before=JSON.parse(beforeJson),after=JSON.parse(afterJson!)
      expect(after.saveVersion).toBe(20)
      const {hollywood,...oldRoots}=after.state
      expect(oldRoots).toEqual(before.state)
      expect(hollywood).toMatchObject({origin:'migration',originWeek:before.state.market.tick,films:[],careerEvents:[]})
      expect(afterJson).not.toBe(beforeJson);expect(afterDigest).toBe(sha(afterJson!));expect(afterDigest).not.toBe(sha(beforeJson))
    }
    const current = BridgeSession.fromRuntimeCheckpoint(loaded.hydrated).snapshot()
    expect(current.gameWeek).toBe(JSON.parse(predecessor.currentSaveJson).state.market.tick)
    expect(current.savedSlot).toEqual(predecessor.savedSaveJson === null ? null : {
      studioName: 'PROJECT: STUDIO', gameWeek: JSON.parse(predecessor.savedSaveJson).state.market.tick,
    })
  })

  it.each(cases)('persists $name once, then preserves the new session on restart', async fixture => {
    const store = new MemoryStore(fixture.bytes)
    const fatals: unknown[] = []
    const coordinator = await createBridgeRuntimeCoordinator({ store, fatal: error => fatals.push(error) })
    let firstSnapshot: ReturnType<BridgeSession['snapshot']> | undefined
    try {
      expect(store.writes).toHaveLength(1)
      expect(fatals).toEqual([])
      firstSnapshot = await coordinator.read(session => session.snapshot())
      expect(firstSnapshot.sessionId).not.toBe(old(fixture.bytes).sessionId)
      expect(firstSnapshot.stateRevision).toBe(0)
    } finally { await coordinator.close() }
    const persisted = store.contents
    const second = new MemoryStore(persisted)
    const restarted = await createBridgeRuntimeCoordinator({ store: second, fatal: error => fatals.push(error) })
    try {
      expect(second.writes).toEqual([])
      expect(second.contents).toBe(persisted)
      const snapshot = await restarted.read(session => session.snapshot())
      expect(snapshot.sessionId).toBe(firstSnapshot!.sessionId)
      expect(snapshot.stateRevision).toBe(0)
      expect(snapshot.stateDigest).toBe(firstSnapshot!.stateDigest)
      expect(snapshot.savedSlot).toEqual(firstSnapshot!.savedSlot)
      expect(fatals).toEqual([])
    } finally { await restarted.close() }
    expect(store.closeCalls).toBe(1)
    expect(second.closeCalls).toBe(1)
  })

  it('preserves current-schema journal/session and exact Save retries after real published advance', () => {
    const migrated = loadBridgeRuntimeCheckpoint(afterBytes, undefined, () => 'owner-ux-current-session')
    const s = BridgeSession.fromRuntimeCheckpoint(migrated.hydrated)
    const saveRequest = { protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId: s.sessionId,
      expectedStateRevision: s.stateRevision, commandId: 'owner-ux-new-save' }
    const save = s.save(saveRequest)
    if (!save.accepted) throw new Error(save.message)
    const advance = s.snapshot().availableIntents.find(option => option.kind === 'advanceWeek')
    if (advance === undefined) throw new Error('No legal published advance in the preserved recovery state.')
    const response = s.command({ ...saveRequest, commandId: 'owner-ux-new-advance',
      type: 'submitIntent', payload: { intentId: advance.intentId } })
    if (!response.accepted) throw new Error(response.message)
    expect(response.gameWeek).toBe(107)
    const bytes = encodeBridgeRuntimeCheckpoint(s.exportRuntimeCheckpoint())
    const reopened = loadBridgeRuntimeCheckpoint(bytes, undefined, () => { throw new Error('Unexpected repeat migration') })
    expect(reopened.migratedFromProtocolVersion).toBeNull()
    expect(reopened.hydrated.checkpoint.sessionId).toBe(s.sessionId)
    expect(reopened.hydrated.checkpoint.stateRevision).toBe(1)
    expect(reopened.hydrated.checkpoint.journal).toEqual(s.exportRuntimeCheckpoint().journal)
    expect(reopened.hydrated.checkpoint.currentSaveJson).toBe(s.exportRuntimeCheckpoint().currentSaveJson)
    expect(reopened.hydrated.checkpoint.savedSaveJson).toBe(save.saveJson)
    expect(reopened.hydrated.checkpoint.currentSaveJson).not.toBe(save.saveJson)
    const recovered = BridgeSession.fromRuntimeCheckpoint(reopened.hydrated)
    expect(recovered.snapshot().savedSlot).toEqual({ studioName: 'PROJECT: STUDIO', gameWeek: 106 })
    expect(recovered.save(saveRequest)).toEqual(save)
    expect(encodeBridgeRuntimeCheckpoint(recovered.exportRuntimeCheckpoint())).toBe(bytes)
    expect(decodeBridgeRuntimeCheckpoint(bytes).checkpoint.journal).toHaveLength(2)
  })

  it('refuses unknown identity or corrupted saved-slot digest without publishing or writing authority', async () => {
    for (const { changes, error } of [
      { changes: { schemaId: `sha256:${'f'.repeat(64)}` }, error: /checkpoint.schemaId/ },
      { changes: { savedStateDigest: '0'.repeat(64) }, error: /checkpoint.savedStateDigest/ },
    ]) {
      const bytes = `${canonicalJson({ ...old(distinctBytes), ...changes })}\n`
      const store = new MemoryStore(bytes)
      const fatals: unknown[] = []
      await expect(createBridgeRuntimeCoordinator({ store, fatal: error => fatals.push(error) })).rejects.toThrow(error)
      expect(store.writes).toEqual([])
      expect(store.contents).toBe(bytes)
      expect(store.closeCalls).toBe(1)
      expect(fatals).toHaveLength(1)
    }
  })

  it('leaves both predecessor slots and journal intact when migration persistence fails', async () => {
    const store = new MemoryStore(distinctBytes)
    store.failWrite = true
    const fatals: unknown[] = []
    await expect(createBridgeRuntimeCoordinator({ store, fatal: error => fatals.push(error) }))
      .rejects.toThrow('owner-ux migration write failure')
    expect(store.writes).toHaveLength(1)
    expect(store.contents).toBe(distinctBytes)
    expect(store.closeCalls).toBe(1)
    expect(fatals).toHaveLength(1)
  })
})
