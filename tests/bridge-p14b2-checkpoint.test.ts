import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { describe, expect, it } from 'vitest'
import { SCHEMA_ID } from '../bridge/protocol.ts'
import { loadBridgeRuntimeCheckpoint, SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS } from '../bridge/runtime-checkpoint.ts'
import { BridgeSession } from '../bridge/session.ts'

// Genuine e37cd23 projection45 export, not a current checkpoint with restamped ID.
const OUTGOING_45 = 'sha256:5b2a4ca93d930e90a288db55bb5cc3fdc8eea070ef51fa1450a193a325bd755d'
const bytes = gunzipSync(readFileSync(new URL('./fixtures/p14/genuine-projection45-runtime.checkpoint.json.gz', import.meta.url))).toString('utf8')
describe('P14B.2 outgoing projection45 runtime compatibility (Save29 unchanged)', () => {
  it('pins actual historical source bytes and the literal outgoing schema registry entry', () => {
    expect(createHash('sha256').update(bytes).digest('hex')).toBe('433629e8aa3f9e6ebbbaf331a63fa307ffe61a03c9a48257b3a8ca3f61a02fc8')
    const before = JSON.parse(bytes)
    expect(before.schemaId).toBe(OUTGOING_45)
    expect(before.journal).toHaveLength(3)
    expect(JSON.parse(before.currentSaveJson).saveVersion).toBe(29)
    expect(JSON.parse(before.savedSaveJson).saveVersion).toBe(29)
    expect(JSON.parse(before.currentSaveJson).state.market.tick).toBe(12)
    expect(JSON.parse(before.savedSaveJson).state.market.tick).toBe(11)
    expect(SCHEMA_ID).not.toBe(OUTGOING_45)
    expect(SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS.get(OUTGOING_45)).toBe('projection-v45')
  })
  it('opens genuine45 with a new session while preserving both distinct gameplay slots byte-for-byte', () => {
    const before = JSON.parse(bytes)
    const loaded = loadBridgeRuntimeCheckpoint(bytes, undefined, () => 'p14b2-current-session')
    expect(loaded.migratedFromProtocolVersion).toBe(4)
    const after = loaded.hydrated.checkpoint
    expect(after.schemaId).toBe(SCHEMA_ID)
    expect(after.sessionId).toBe('p14b2-current-session')
    expect(after.stateRevision).toBe(0)
    expect(after.journal).toEqual([])
    expect(after.currentSaveJson).toBe(before.currentSaveJson)
    expect(after.savedSaveJson).toBe(before.savedSaveJson)
    expect(after.currentStateDigest).toBe(before.currentStateDigest)
    expect(after.savedStateDigest).toBe(before.savedStateDigest)
    expect(after.currentSaveJson).not.toBe(after.savedSaveJson)
    const session = BridgeSession.fromRuntimeCheckpoint(loaded.hydrated)
    expect(session.gameState.market.tick).toBe(12)
    expect(session.snapshot().savedSlot?.gameWeek).toBe(11)
  })
})
