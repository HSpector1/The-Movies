// Append to EXISTING tests/bridge-runtime-checkpoint.test.ts; bindings in IMPORTS.txt.
// Constructed in-memory checkpoint control using admitted historical capture slots.
// This is NOT a captured production57 checkpoint or a new genuine restart record.
const C17_SHIPPED_OUTGOING_57 = 'sha256:74826ef419bfa816647b3de156de3e24fb50327879e207c844c1e1a12b9c1253'

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
