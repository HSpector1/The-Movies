import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { describe, expect, it } from 'vitest'
import { SCHEMA_ID } from '../bridge/protocol.ts'
import { loadBridgeRuntimeCheckpoint, SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS } from '../bridge/runtime-checkpoint.ts'
import { BridgeSession } from '../bridge/session.ts'
import { exportSave, importSave, migrateToV32 } from '../src/core/save.js'

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
    // 600-T2 (record 600, C9/C10): the live writer stamps Save30, so "slot bytes
    // unchanged" held only while live = 29 and is a moved premise. The invariant
    // kept, per slot: the hydrated bytes ARE the governed V29->V30 migration of
    // that slot's OWN genuine V29 bytes, which differ from the source by the
    // version tag alone (no restamped root, receipt, digest or week), and each
    // digest is the digest of exactly those bytes. Pattern: runtime47 :191-205.
    // 662-T2 (P14B.5, R-VERSION): the live writer now stamps Save31; the governed
    // V29->V31 migration of each slot differs from its source by the version tag
    // AND the EMPTY relationship root alone (nothing recomputed, plan :725-781).
    // 735-T (P14B.7, R-VERSION): the live writer now stamps Save32; the governed
    // V29->V32 migration of each slot differs from its source by the version tag,
    // the EMPTY relationship root, AND `supersededByPromiseId: null` on every
    // existing promise (nothing else recomputed).
    const sha = (v: string) => createHash('sha256').update(v).digest('hex')
    const addedFields = (promise: Record<string, unknown>) => ({ ...promise, supersededByPromiseId: null })
    for (const slot of ['currentSaveJson', 'savedSaveJson'] as const) {
      const governed = migrateToV32(importSave(before[slot]))
      expect(governed.saveVersion).toBe(32)
      const source = JSON.parse(before[slot])
      expect(JSON.parse(exportSave(governed))).toEqual({ ...source, saveVersion: 32, state: { ...source.state,
        relationships: [], promises: (source.state.promises as Record<string, unknown>[]).map(addedFields) } })
      expect(after[slot]).toBe(exportSave(governed))
    }
    expect(after.currentStateDigest).toBe(sha(after.currentSaveJson))
    expect(after.savedStateDigest).toBe(sha(after.savedSaveJson!))
    expect(after.currentSaveJson).not.toBe(after.savedSaveJson)
    const session = BridgeSession.fromRuntimeCheckpoint(loaded.hydrated)
    expect(session.gameState.market.tick).toBe(12)
    expect(session.snapshot().savedSlot?.gameWeek).toBe(11)
  })
})
