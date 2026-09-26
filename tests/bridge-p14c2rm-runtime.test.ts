// 875 RM-L/M: genuine outgoing51, two independent Save37 slots, actual old journal.
import { readFileSync } from 'node:fs'
import { describe, expect, it, vi } from 'vitest'
import { PROJECTION_VERSION, PROTOCOL_VERSION, SCHEMA_ID } from '../bridge/protocol.ts'
import { canonicalJson } from '../bridge/schema/canonical.ts'
import { decodeBridgeRuntimeCheckpoint, encodeBridgeRuntimeCheckpoint, loadBridgeRuntimeCheckpoint,
  SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS } from '../bridge/runtime-checkpoint.ts'
import { BridgeSession } from '../bridge/session.ts'
import { exportSave, LIVE_SAVE_VERSION, makeSave, validateSaveV37 } from '../src/core/save.js'
import { retirementRecordFor } from '../src/core/careerLifecycle.js'
import { OUTGOING_51, RUNTIME_51, SCI, readRuntime51, runtime51Artifact, sha } from './helpers/p14c2rm-fixtures.js'

type Historical = { format: string; checkpointVersion: number; protocolVersion: number; schemaId: string;
  sessionId: string; stateRevision: number; currentSaveJson: string; savedSaveJson: string;
  currentStateDigest: string; savedStateDigest: string; journalDigest: string;
  journal: { route: string; commandId: string; requestJson: string; responseJson: string }[] }
function artifact(): { raw: string; prior: Historical } {
  const raw = readRuntime51(), prior: Historical = JSON.parse(raw)
  expect(canonicalJson(prior) + '\n').toBe(raw)
  return { raw, prior }
}
describe('C.2-RM genuine projection51 recovery', () => {
  it('preserves the real producer, actual nonempty journal and independent announced669/retired670 slots', () => {
    const { prior } = artifact()
    const manifest = JSON.parse(readFileSync(runtime51Artifact('MANIFEST.json'), 'utf8'))
    expect(manifest).toMatchObject({ sourceSha: RUNTIME_51.source, qualifiedSourceSha: RUNTIME_51.source,
      producerSha256: RUNTIME_51.producer, saveVersion: 37, projectionVersion: 51,
      protocolVersion: 4, schemaId: OUTGOING_51, savedWeek: 669, currentWeek: 670,
      journalEntries: 1, runtimeStateRevision: 1 })
    expect(prior).toMatchObject({ schemaId: OUTGOING_51, protocolVersion: 4, stateRevision: 1,
      currentStateDigest: RUNTIME_51.current, savedStateDigest: RUNTIME_51.saved, journalDigest: RUNTIME_51.journal })
    expect(prior.journal).toHaveLength(1)
    expect(JSON.parse(prior.journal[0]!.requestJson)).toEqual(manifest.command)
    expect(JSON.parse(prior.journal[0]!.responseJson)).toMatchObject({ accepted: true })
    expect(sha(canonicalJson(prior.journal))).toBe(RUNTIME_51.journal)
    for (const [slot, week, status] of [['currentSaveJson', 670, 'retired'], ['savedSaveJson', 669, 'announced']] as const) {
      const old = validateSaveV37(JSON.parse(prior[slot]))
      expect(old.state.market.tick).toBe(week)
      expect(retirementRecordFor(old.state, SCI)).toMatchObject({ announcedWeek: 618, effectiveWeek: 670, status })
      expect(exportSave(old)).toBe(prior[slot])
      expect(sha(prior[slot])).toBe(slot === 'currentSaveJson' ? RUNTIME_51.current : RUNTIME_51.saved)
    }
  })

  it('steps projection once to52 while retaining Save37/protocol4 and enumerating actual outgoing51 exactly once', () => {
    expect(PROJECTION_VERSION).toBe(52)
    expect(PROTOCOL_VERSION).toBe(4)
    expect(LIVE_SAVE_VERSION).toBe(37)
    expect(SCHEMA_ID).not.toBe(OUTGOING_51)
    expect(SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS.get(OUTGOING_51)).toBe('projection-v51')
    expect(SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS.has(SCHEMA_ID)).toBe(false)
  })

  it('lifts both slots byte-exactly but resets old journal/revision/session authority, then reopens52 without migration', () => {
    const { raw, prior } = artifact(), factory = vi.fn(() => 'c2rm-current52')
    const loaded = loadBridgeRuntimeCheckpoint(raw, undefined, factory)
    expect(loaded.migratedFromProtocolVersion).toBe(4)
    expect(factory).toHaveBeenCalledTimes(1)
    const checkpoint = loaded.hydrated.checkpoint
    expect(checkpoint).toEqual({ ...prior, schemaId: SCHEMA_ID, sessionId: 'c2rm-current52', stateRevision: 0,
      journal: [], journalDigest: sha('[]') })
    expect(loaded.hydrated.journal).toEqual([])
    const session = BridgeSession.fromRuntimeCheckpoint(loaded.hydrated)
    expect(session.gameState.market.tick).toBe(670)
    expect(session.snapshot().savedSlot?.gameWeek).toBe(669)
    expect(exportSave(makeSave(session.gameState))).toBe(prior.currentSaveJson)
    const encoded = encodeBridgeRuntimeCheckpoint(session.exportRuntimeCheckpoint())
    const noSecondMigration = vi.fn(() => { throw new Error('Current52 must not migrate twice') })
    const reopened = loadBridgeRuntimeCheckpoint(encoded, undefined, noSecondMigration)
    expect(reopened.migratedFromProtocolVersion).toBeNull()
    expect(noSecondMigration).not.toHaveBeenCalled()
    expect(encodeBridgeRuntimeCheckpoint(reopened.hydrated.checkpoint)).toBe(encoded)
    expect(readRuntime51()).toBe(raw)
  })

  it('rejects the old command identity and replays only a new52 saved-slot LOAD receipt after restart', () => {
    const { raw, prior } = artifact()
    const loaded = loadBridgeRuntimeCheckpoint(raw, undefined, () => 'c2rm-load669')
    expect(loaded.migratedFromProtocolVersion).toBe(4)
    const session = BridgeSession.fromRuntimeCheckpoint(loaded.hydrated)
    const before = exportSave(makeSave(session.gameState))
    expect(session.command(JSON.parse(prior.journal[0]!.requestJson))).toMatchObject({ accepted: false })
    expect(exportSave(makeSave(session.gameState))).toBe(before)
    const request = { protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId: session.sessionId,
      expectedStateRevision: session.stateRevision, commandId: 'c2rm-new52-load669' }
    const receipt = session.load(request)
    expect(receipt.accepted).toBe(true)
    expect(session.gameState.market.tick).toBe(669)
    expect(retirementRecordFor(session.gameState, SCI)?.status).toBe('announced')
    expect(exportSave(makeSave(session.gameState))).toBe(prior.savedSaveJson)
    const recovered = BridgeSession.fromRuntimeCheckpoint(decodeBridgeRuntimeCheckpoint(
      encodeBridgeRuntimeCheckpoint(session.exportRuntimeCheckpoint())))
    expect(canonicalJson(recovered.load(request))).toBe(canonicalJson(receipt))
    expect(recovered.stateRevision).toBe(1)
    expect(recovered.exportRuntimeCheckpoint().journal.some(entry => entry.commandId === prior.journal[0]!.commandId)).toBe(false)
    expect(readRuntime51()).toBe(raw)
  })

  it.each(['currentSaveJson', 'savedSaveJson'] as const)('rejects invalid %s through whole-save validation before creating a new session', slot => {
    const { raw, prior } = artifact(), corrupt = structuredClone(prior)
    const inner = JSON.parse(corrupt[slot])
    inner.state.talent.find((person: { id: string }) => person.id === SCI).age += 1
    corrupt[slot] = canonicalJson(inner)
    if (slot === 'currentSaveJson') corrupt.currentStateDigest = sha(corrupt[slot])
    else corrupt.savedStateDigest = sha(corrupt[slot])
    const factory = vi.fn(() => 'invalid-slot-must-not-create')
    expect(() => loadBridgeRuntimeCheckpoint(canonicalJson(corrupt) + '\n', undefined, factory)).toThrow(/age|provenance/i)
    expect(factory).not.toHaveBeenCalled()
    expect(readRuntime51()).toBe(raw)
  })

  it('refuses unknown schema, corrupted digest and a reused prior session id without touching the artifact', () => {
    const { raw, prior } = artifact()
    for (const corrupted of [{ ...prior, schemaId: 'sha256:' + 'ab'.repeat(32) },
      { ...prior, savedStateDigest: '0'.repeat(64) }, { ...prior, journalDigest: '0'.repeat(64) }]) {
      const factory = vi.fn(() => 'invalid-envelope-must-not-create')
      expect(() => loadBridgeRuntimeCheckpoint(canonicalJson(corrupted) + '\n', undefined, factory)).toThrow(/schema|digest/i)
      expect(factory).not.toHaveBeenCalled()
    }
    expect(() => loadBridgeRuntimeCheckpoint(raw, undefined, () => prior.sessionId)).toThrow(/must differ/)
    expect(readRuntime51()).toBe(raw)
  })

  it('keeps independently recovered Save As branches isolated despite identical PersonIds and source bytes', () => {
    const raw = readRuntime51()
    const first = BridgeSession.fromRuntimeCheckpoint(loadBridgeRuntimeCheckpoint(raw, undefined, () => 'c2rm-branch-a').hydrated)
    const second = BridgeSession.fromRuntimeCheckpoint(loadBridgeRuntimeCheckpoint(raw, undefined, () => 'c2rm-branch-b').hydrated)
    expect(first.load({ protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId: first.sessionId,
      expectedStateRevision: first.stateRevision, commandId: 'a-load' }).accepted).toBe(true)
    expect(first.gameState.market.tick).toBe(669)
    expect(second.gameState.market.tick).toBe(670)
    expect(retirementRecordFor(first.gameState, SCI)?.status).toBe('announced')
    expect(retirementRecordFor(second.gameState, SCI)?.status).toBe('retired')
    expect(second.stateRevision).toBe(0)
    expect(second.exportRuntimeCheckpoint().journal).toEqual([])
  })
})
