// 840 S11: actual outgoing projection50 artifacts, produced BEFORE the Scientist
// amendment (824 and842). No restamped fixture, invented history or new producer.
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { describe, expect, it, vi } from 'vitest'
import { PROJECTION_VERSION, PROTOCOL_VERSION, SCHEMA_ID } from '../bridge/protocol.ts'
import { canonicalJson } from '../bridge/schema/canonical.ts'
import { decodeBridgeRuntimeCheckpoint, encodeBridgeRuntimeCheckpoint, loadBridgeRuntimeCheckpoint,
  SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS } from '../bridge/runtime-checkpoint.ts'
import { BridgeSession } from '../bridge/session.ts'
import { exportSave, importSave, LIVE_SAVE_VERSION, makeSave, migrateToLive, validateSaveV36 } from '../src/core/save.js'

const OUTGOING_50 = 'sha256:e2d354dcbae1a6dc93a2367756512c14243b11be202a26107de0c81a4f3e0698'
const sha = (value: string | Uint8Array): string => createHash('sha256').update(value).digest('hex')
const CASES = [
  {
    name: '842 Scientist', directory: 'genuine-v36-scientist-corpus', filename: 'runtime50-current521-saved520.json.gz',
    gzip: '60c0d7c39a467923fc4a6305a5499e39f5ffa227871d63b62dc892fcb0aeb9cc',
    raw: '9c5e414c2c9ca6672113984813a69ae2d041347e6d21b04550e26edc1a75e8d6',
    manifest: '949058d997b6ad151318a2e71cb3898011188e8b669c50bbd01217bd01b34722',
    producer: 'd2b872bd2feebb84e3da8d1e7502518370565a73a138093cbd949cb77899fe92',
    source: '84f1d9a8bf283ca06a3fe5235e475238a04f57e5', currentWeek: 521, savedWeek: 520,
    current: 'd40e00e4f7ea574ccab02380d48f37e569b6303412031ab4d19e4fa11a3e9c6e',
    saved: '762560f9a3d9512cacfd162b1a7bd7b91571f9990b3009b14bc1b4a123e57f9e',
  },
  {
    name: '824 retained retirement', directory: 'genuine-projection50-runtime-c2rm', filename: 'runtime50-current53-saved52.json.gz',
    gzip: '7e41f92f721a63bee56b7639e4c29208c06f363c0c0d04529419101ed99b17a4',
    raw: 'a8aedc10cad88773fd9523d4d134083b04128158591bca9ba3bca0f81106d58e',
    manifest: '7f5de7c8117c83ad94393b0cb0835fd824cfb34366a18449c5156dc70f1c11fb',
    producer: '2566eb8a4173f0b6ddc67e24adf62ec47b4f1601ed548062e39b6aa25a0884ef',
    source: '9b170660398e605be149994400bf092415c78a07', currentWeek: 53, savedWeek: 52,
    current: '039df75bb16b35c546628db0e2a1f07dcb9399ef1d6859239f4415df2af6cc37',
    saved: '4c5cffe4cab7aa5f4947cc38508e4015be906a7a895feb2d8527fce518ed7813',
  },
] as const
type Fixture = (typeof CASES)[number]
type HistoricalCheckpoint = {
  format: string; checkpointVersion: number; protocolVersion: number; schemaId: string
  sessionId: string; stateRevision: number; currentSaveJson: string; savedSaveJson: string
  currentStateDigest: string; savedStateDigest: string; journalDigest: string
  journal: { route: string; commandId: string; requestJson: string; responseJson: string }[]
}
const artifact = (fixture: Fixture, filename: string = fixture.filename) =>
  new URL(`./fixtures/p14/${fixture.directory}/${filename}`, import.meta.url)
function readFixture(fixture: Fixture): { raw: string; prior: HistoricalCheckpoint } {
  const compressed = readFileSync(artifact(fixture))
  expect(sha(compressed)).toBe(fixture.gzip)
  const raw = gunzipSync(compressed).toString('utf8')
  expect(sha(raw)).toBe(fixture.raw)
  const prior: HistoricalCheckpoint = JSON.parse(raw)
  expect(canonicalJson(prior) + '\n').toBe(raw)
  return { raw, prior }
}

describe('C.2 Scientist S11: genuine outgoing50 runtime compatibility', () => {
  it.each(CASES)('$name original artifact, canonical independent slots and producer authority remain exact', fixture => {
    const { prior } = readFixture(fixture)
    const manifestBytes = readFileSync(artifact(fixture, 'MANIFEST.json'))
    expect(sha(manifestBytes)).toBe(fixture.manifest)
    expect(JSON.parse(manifestBytes.toString('utf8'))).toMatchObject({ sourceSha: fixture.source,
      producerSha256: fixture.producer, saveVersion: 36, projectionVersion: 50, protocolVersion: 4,
      schemaId: OUTGOING_50, currentWeek: fixture.currentWeek, savedWeek: fixture.savedWeek,
      journalEntries: 0, runtimeStateRevision: 0 })
    expect(prior).toMatchObject({ protocolVersion: 4, schemaId: OUTGOING_50, stateRevision: 0, journal: [] })
    expect(sha(prior.currentSaveJson)).toBe(fixture.current)
    expect(sha(prior.savedSaveJson)).toBe(fixture.saved)
    expect(prior.currentStateDigest).toBe(fixture.current)
    expect(prior.savedStateDigest).toBe(fixture.saved)
    expect(prior.currentSaveJson).not.toBe(prior.savedSaveJson)
    for (const [slot, week] of [['currentSaveJson', fixture.currentWeek], ['savedSaveJson', fixture.savedWeek]] as const) {
      const frozen = validateSaveV36(JSON.parse(prior[slot]))
      expect(frozen.state.market.tick).toBe(week)
      expect(exportSave(frozen)).toBe(prior[slot])
      expect(frozen.state.careerLifecycle.records.some(record => record.profession === 'scientist')).toBe(false)
    }
  })

  it('requires literal projection51/Save37, registers actual outgoing50, and excludes the running identity from prior schemas', () => {
    expect(PROTOCOL_VERSION).toBe(4)
    expect(PROJECTION_VERSION).toBe(51)
    expect(LIVE_SAVE_VERSION).toBe(37)
    expect(SCHEMA_ID).not.toBe(OUTGOING_50)
    expect(SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS.get(OUTGOING_50)).toBe('projection-v50')
    expect(SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS.has(SCHEMA_ID)).toBe(false)
  })

  it.each(CASES)('$name migrates each authoritative slot at its OWN week with exact canonical state, identity and history', fixture => {
    const { raw, prior } = readFixture(fixture)
    const createSession = vi.fn(() => `c2s-${fixture.currentWeek}-governed`)
    const loaded = loadBridgeRuntimeCheckpoint(raw, undefined, createSession)
    expect(loaded.migratedFromProtocolVersion).toBe(4)
    expect(createSession).toHaveBeenCalledTimes(1)
    for (const [slot, week] of [['currentSaveJson', fixture.currentWeek], ['savedSaveJson', fixture.savedWeek]] as const) {
      const old = validateSaveV36(JSON.parse(prior[slot]))
      const actualJson = loaded.hydrated.checkpoint[slot]
      expect(typeof actualJson).toBe('string')
      const actual = importSave(actualJson!)
      expect(actual.saveVersion).toBe(37)
      expect(actual.state.market.tick).toBe(week)
      // Independent preservation oracle: semantic version changes NO state bytes,
      // not merely selected fields that could hide lost research or extension work.
      expect(canonicalJson(actual.state)).toBe(canonicalJson(old.state))
      expect(actualJson).toBe(exportSave(migrateToLive(importSave(prior[slot]))))
      expect(exportSave(old)).toBe(prior[slot])
    }
    expect(loaded.hydrated.currentSave.state.market.tick).toBe(fixture.currentWeek)
    expect(loaded.hydrated.savedSave!.state.market.tick).toBe(fixture.savedWeek)
    expect(loaded.hydrated.checkpoint.currentSaveJson).not.toBe(loaded.hydrated.checkpoint.savedSaveJson)
    expect(sha(raw)).toBe(fixture.raw)
    expect(readFixture(fixture).raw).toBe(raw)
  })

  it('842 starts a fresh logical session and reopens current51 without another migration; genuine journal was empty, not fabricated', () => {
    const { raw, prior } = readFixture(CASES[0])
    expect(() => decodeBridgeRuntimeCheckpoint(raw)).toThrow(/schemaId/)
    const createSession = vi.fn(() => 'c2s-scientist-current51')
    const loaded = loadBridgeRuntimeCheckpoint(raw, undefined, createSession)
    expect(createSession).toHaveBeenCalledTimes(1)
    expect(loaded.migratedFromProtocolVersion).toBe(4)
    const current = exportSave(migrateToLive(importSave(prior.currentSaveJson)))
    const saved = exportSave(migrateToLive(importSave(prior.savedSaveJson)))
    const after = loaded.hydrated.checkpoint
    // This expected object is never offered as an alleged historical checkpoint.
    expect(after).toEqual({ ...prior, schemaId: SCHEMA_ID, sessionId: 'c2s-scientist-current51', stateRevision: 0,
      currentSaveJson: current, currentStateDigest: sha(current), savedSaveJson: saved, savedStateDigest: sha(saved),
      journal: [], journalDigest: sha('[]') })
    expect(after.sessionId).not.toBe(prior.sessionId)
    expect(loaded.hydrated.journal).toEqual([])
    const session = BridgeSession.fromRuntimeCheckpoint(loaded.hydrated)
    expect(session.gameState.market.tick).toBe(521)
    expect(session.snapshot().savedSlot?.gameWeek).toBe(520)
    const encoded = encodeBridgeRuntimeCheckpoint(after)
    expect(encodeBridgeRuntimeCheckpoint(session.exportRuntimeCheckpoint())).toBe(encoded)
    const neverRemigrate = vi.fn(() => { throw new Error('Current-schema checkpoint must not migrate twice') })
    const reopened = loadBridgeRuntimeCheckpoint(encoded, undefined, neverRemigrate)
    expect(reopened.migratedFromProtocolVersion).toBeNull()
    expect(neverRemigrate).not.toHaveBeenCalled()
    expect(encodeBridgeRuntimeCheckpoint(reopened.hydrated.checkpoint)).toBe(encoded)
    expect(readFixture(CASES[0]).raw).toBe(raw)
  })

  it('842 real saved-slot LOAD restores520 from current521 and replays only its NEW-schema receipt, never prior runtime authority', () => {
    const { raw, prior } = readFixture(CASES[0])
    const loaded = loadBridgeRuntimeCheckpoint(raw, undefined, () => 'c2s-load-saved520')
    expect(loaded.migratedFromProtocolVersion).toBe(4)
    const session = BridgeSession.fromRuntimeCheckpoint(loaded.hydrated)
    const checkpointBefore = encodeBridgeRuntimeCheckpoint(loaded.hydrated.checkpoint)
    expect(session.gameState.market.tick).toBe(521)
    const control = { protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId: session.sessionId,
      expectedStateRevision: session.stateRevision, commandId: 'new51-load-saved520' }
    const response = session.load(control)
    expect(response.accepted).toBe(true)
    expect(session.gameState.market.tick).toBe(520)
    expect(exportSave(makeSave(session.gameState))).toBe(exportSave(migrateToLive(importSave(prior.savedSaveJson))))
    expect(session.stateRevision).toBe(1)
    const recovered = BridgeSession.fromRuntimeCheckpoint(decodeBridgeRuntimeCheckpoint(
      encodeBridgeRuntimeCheckpoint(session.exportRuntimeCheckpoint())))
    expect(canonicalJson(recovered.load(control))).toBe(canonicalJson(response))
    expect(recovered.stateRevision).toBe(1)
    expect(encodeBridgeRuntimeCheckpoint(loaded.hydrated.checkpoint)).toBe(checkpointBefore)
    expect(readFixture(CASES[0]).raw).toBe(raw)
  })

  it.each(['currentSaveJson', 'savedSaveJson'] as const)('842 invalid %s refuses before creating a replacement session and leaves original bytes recoverable', slot => {
    const { raw, prior } = readFixture(CASES[0])
    // Deliberate negative corruption of a detached transport input. Digest is
    // updated so this reaches the inner WHOLE-save validator, not the hash gate.
    const corrupt = structuredClone(prior)
    const inner = JSON.parse(corrupt[slot])
    inner.state.talent.find((person: { id: string }) => person.id === 't-sci-00').age += 1
    corrupt[slot] = canonicalJson(inner)
    if (slot === 'currentSaveJson') corrupt.currentStateDigest = sha(corrupt[slot])
    else corrupt.savedStateDigest = sha(corrupt[slot])
    const factory = vi.fn(() => 'must-not-create-session-for-invalid-slot')
    expect(() => loadBridgeRuntimeCheckpoint(canonicalJson(corrupt) + '\n', undefined, factory)).toThrow(/age|provenance/i)
    expect(factory).not.toHaveBeenCalled()
    expect(readFixture(CASES[0]).raw).toBe(raw)
    expect(canonicalJson(prior) + '\n').toBe(raw)
  })

  it('842 refuses unknown outer schema, damaged slot digest, and reused logical session without altering preserved source', () => {
    const { raw, prior } = readFixture(CASES[0])
    for (const corrupted of [
      { ...prior, schemaId: 'sha256:' + 'ab'.repeat(32) },
      { ...prior, savedStateDigest: '0'.repeat(64) },
    ]) {
      const factory = vi.fn(() => 'must-not-create-session-for-invalid-envelope')
      expect(() => loadBridgeRuntimeCheckpoint(canonicalJson(corrupted) + '\n', undefined, factory)).toThrow(/schema|digest/i)
      expect(factory).not.toHaveBeenCalled()
    }
    expect(() => loadBridgeRuntimeCheckpoint(raw, undefined, () => prior.sessionId)).toThrow(/must differ/)
    expect(readFixture(CASES[0]).raw).toBe(raw)
  })
})
