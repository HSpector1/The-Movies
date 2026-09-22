// Installed after T0 KEEP and exact remote preservation a76242f2f4bdfda98e38ec706e3110ad6a9bb957.
// Original inert-draft commentary below is retained as provenance; actual RED recorded separately.
// INERT / UNEXECUTED. Intended tests/bridge-p14b4-runtime47-compatibility.test.ts.
// Read-only source: c06db6eae2a1350317c018c6f108d115dcba7b19, Save29/projection46/rules3.
// Install only AFTER independent T0 KEEP and exact remote fixture-checkpoint publication.
// Actual old bytes are pinned below; no preservation-publication SHA is invented.
// Future RED: migrateToV30 is the planned save API; current-format expectations are
// literal Save30/projection47. No collection/body outcome has been executed here.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { PROJECTION_VERSION, PROTOCOL_VERSION, SCHEMA_ID } from '../bridge/protocol.ts'
import { canonicalJson } from '../bridge/schema/canonical.ts'
import {
  encodeBridgeRuntimeCheckpoint, loadBridgeRuntimeCheckpoint,
  SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS,
} from '../bridge/runtime-checkpoint.ts'
import { BridgeSession } from '../bridge/session.ts'
import { exportSave, importSave, LIVE_SAVE_VERSION, migrateToV31, validateSaveV29 } from '../src/core/save.js'

const OUTGOING_46 = 'sha256:584bdd8565030f049d548b1af4fcbf8c517ca7c9150016736f632f1ef8fcb98c'
const PINS = {
  gzip: '3db0599c6e183140b79c83880eb967dde37aecc0d178a85d192283893ea0cc34',
  raw: 'e344be06db6794e9d1523c036befb4180595564ef8a3fb6e6062328e477e7699',
  provenance: '1bc6d6a2ca7a05ad6fd8fc89d308de42225477c98b33781a428f9690926c1935',
  manifest: 'f18c475922e70602b6dfe6ac86cd6d448484b4b6aa480abf65733061e41c4de8',
  current: '281663eeb15c5da0c63b005e956c6b7392ab05690652e9f52c1636f88a80817e',
  saved: '03017370f16d9d2cf211f5653650a6d41452f73f0e8b96bb4aa154a6a946f4ca',
  journal: '1db0ff145cc82b8451499709c51f37c53afc41f9a7fc8facf435b1b9aa2ff5b0',
  tested: '89b5ad2cfc6947ea07fb043ef5b23eba38d7dbde',
  published: 'c06db6eae2a1350317c018c6f108d115dcba7b19',
  closeout: '6f6e425314107a7f0050739becb5f97adede58de94d7631a6f5bf25de8abfc81',
  minter: '58e3a9554026089616f96c309cc4dc1ad6b909c87936c9c129165fb77c96c5b6',
} as const
// All 34 accepted predecessor literal pins, plus the independently minted outgoing46,
// (P14B.5) the independently minted outgoing47 and (P14B.6) the independently minted outgoing48.
// Do not derive this expected list from the registry. Missing32–44 are a separate backlog.
const EXPECTED_PRIOR_IDS = [
  // P14B.6 (700-T2 sweep): the OUTGOING projection-48 identity — the checked-in
  // contract-manifest schemaId before the projection-49 bump (ad49031f^), read
  // independently (tests/fixtures/p14/genuine-projection48-runtime/MANIFEST.json).
  'sha256:00c0075bef257634956da7d16d117a145d203047e7169c643156b7971c4c7fec',
  'sha256:01f15efc8fc33fd810b051242857385ca23b5e1c775b357db1bfe5a70e907e1e',
  'sha256:0285e92f32c27cd2960df802b3f7ea156a15372f05001ad1f4964c2f25db55b5',
  'sha256:0474ceafd6c148f329fe99eac328c79ed0b0caf906e0f7442b7f3cf0fe40cb4f',
  'sha256:15033cf9ca43be65abcb25fc6f910f9487ac23056090126ec7d3e2353f6ce587',
  'sha256:18de162d1a9da3034378f71cec3d3b3f109ea91df8c1a8d40469924108b36e78',
  'sha256:1bad05a95c284e64ceaef54c276f2dd0ccad8ca3ef1b12198068bb61b85198c9',
  'sha256:204a71924bd8c2e8ae9af47591226894b3e42f62457da3cc20ed6b106ede611a',
  'sha256:2b339a6a8b3e5add0726b7eaac9ce8746e235d8b6111a6816f890ff56afdffd1',
  'sha256:510f08e4a551827a30e0f3d93bbe09fa5ddadbd39366b4dcfa93530500c7979c',
  'sha256:584bdd8565030f049d548b1af4fcbf8c517ca7c9150016736f632f1ef8fcb98c',
  'sha256:5b2a4ca93d930e90a288db55bb5cc3fdc8eea070ef51fa1450a193a325bd755d',
  'sha256:625377a2804a681da3be209da02850e221ae33ac5f58b727f6395736ad607ad1',
  'sha256:6a2c01feaf02c931a8c41bbf2090f8af003b89a492d77135d7aab2b42a8d3dc9',
  // P14B.5 (662-T2 sweep): the OUTGOING projection-47 identity — the checked-in
  // contract-manifest schemaId before the projection-48 bump (040651b4^), read
  // independently (tests/fixtures/p14/genuine-projection47-runtime/MANIFEST.json).
  'sha256:6f6b48805aadcf14d456614d87bf1571eb1ce0d9aa0bc44f604e7976f4f85538',
  'sha256:71529afdcb8e5cf645ab136efb9685256da0039e86d989bfab97b7b2cc5d9a8b',
  'sha256:7e3af4db0d3d18cdeaab00082e0034f304a9141f46ea87e9e64e5a99d985483c',
  'sha256:80f2f0fcd14d1b25e713c2624286a6c05a98c53ea5cfcb2b47612f8c030f5e47',
  'sha256:85a6d125960dce49b4775f842d7b56d7360c81cef3638cd819057c79c99f0236',
  'sha256:8b2569b1f925bedf214ee556841fe28b61e544f1f13bb4741c84a0a318e81a85',
  'sha256:92317ec179456cdc5bd5cc7c4ca47dd066b768a9e2e45519f1263ef921a211a4',
  'sha256:97940e51e0566bed80231b223e5b7303a45d62db8d698f693e525eb244775211',
  'sha256:a481d14f3810ffbafcba2bbf509db7340263f3f0fd665a059507a1567d98923d',
  'sha256:a6f374596e956800f9547ad538fdd859c01bda3460aac8b877279c67686c6f4b',
  'sha256:b779faa92227bd1f2e623ad04d0899c87e7ddc60ce43f9ae9c39a7626c20a83d',
  'sha256:ba9cd199704f66d375585d0bec2128c950618a3ba6a8cf0845a5550fde41659f',
  'sha256:be7ed660d04ed9b1056f48e946f86f26c10cab42b950a273d57ad9cba372f5bb',
  'sha256:c6ab1b2f181b7cbbd1b873a276f0be0516a505f258c3c9ad996042e43e096712',
  'sha256:c9c07d6febe4afee7f7c27c991acdfa1c86b6c3a7f5dff8528d7fa5ad72e43a1',
  'sha256:c9dad9f3d8bb94445db1a5425d90db3f9894da9354f47a07992ff96261cfc399',
  'sha256:d3338cb713385cc23414e6a17293a5900871764f0eeaed19698e17634e74740b',
  'sha256:ddce1c399ac4ff58327b296a0600428ac3f3346b84f3639e66e48e53a65fbe99',
  'sha256:e64a3b659e4247b98631f1caa1f0e9eb0b6016aac92b0f46be590360ff9cee48',
  'sha256:ea5d645f34a472f4710b9273b225d6f15433d6d17ae8ed1af3c03686a225c8c4',
  'sha256:eb95add0fc06a54d19998c4707dd0b0ba861a22cfee6d8e6631499beeea18e25',
  'sha256:f84ae77ec59a0d7ca7cdd89115456504ddecbde2c6e3839936e4951bd65bce61',
  'sha256:fe9bf4558dc12abc5f258ba8b8f581242e06361cfbae8ae31d8c676f6c7a6460',
] as const
type HistoricalCheckpoint = {
  format: string; checkpointVersion: number; protocolVersion: number; schemaId: string
  sessionId: string; stateRevision: number
  currentSaveJson: string; savedSaveJson: string
  currentStateDigest: string; savedStateDigest: string; journalDigest: string
  journal: { route: string; commandId: string; requestJson: string; responseJson: string }[]
}
const artifact = (name: string) => new URL('./fixtures/p14/genuine-projection46-runtime/' + name, import.meta.url)
const sha = (value: string | Uint8Array) => createHash('sha256').update(value).digest('hex')
let raw: string
let prior: HistoricalCheckpoint

beforeAll(() => {
  // Integrity prerequisites, not evidence that any future migration body passed.
  const compressed = readFileSync(artifact('genuine-projection46-runtime.checkpoint.json.gz'))
  expect(sha(compressed)).toBe(PINS.gzip)
  raw = gunzipSync(compressed).toString('utf8')
  expect(sha(raw)).toBe(PINS.raw)
  const provenanceBytes = readFileSync(artifact('genuine-projection46-runtime.provenance.json'))
  const manifestBytes = readFileSync(artifact('MANIFEST.json'))
  expect(sha(provenanceBytes)).toBe(PINS.provenance)
  expect(sha(manifestBytes)).toBe(PINS.manifest)
  prior = JSON.parse(raw)
  expect(canonicalJson(prior) + '\n').toBe(raw)
})

describe('P14B4 genuine outgoing46 runtime compatibility — future Save30/projection47', () => {
  it('pins genuine original46 artifact, producer authority, and two SAME-week DIFFERENT slots', () => {
    const provenance = JSON.parse(readFileSync(artifact('genuine-projection46-runtime.provenance.json'), 'utf8'))
    const manifest = JSON.parse(readFileSync(artifact('MANIFEST.json'), 'utf8'))
    expect(provenance.authority).toMatchObject({
      testedSourceSha: PINS.tested, publishedRecoverySha: PINS.published,
      closeoutSha256: PINS.closeout, schemaId: OUTGOING_46,
      projectionVersion: 46, protocolVersion: 4, saveVersion: 29, promiseRulesVersion: 3,
    })
    expect(provenance.observedHeadSha).toBe(PINS.published)
    expect(provenance.minterSha256).toBe(PINS.minter)
    expect(provenance.sourceFiles).toMatchObject({
      'src/core/save.ts': '84f5e5310d923823a38638791638bd08a4c34808f0957e6ec6185d73636886c6',
      'src/core/promises.ts': 'de64e957381b1b33bf1d2789d976326fc3f54277035fc2059a2c3d5ea0899a0a',
      'bridge/session.ts': '4bc3f027c06590bb998eb707e4f8255c502639f04ea858b5d713c6585cb6f6ee',
      'bridge/runtime-checkpoint.ts': 'f6dcdacdad633717071c4cbc45a3aad8c4b76cefa54fe6284a3b3f24f51a0f80',
      'bridge/protocol.ts': '71b920d90ce9a54214c7dd82208a168bd71cab9be60efa11d2ae3a81d7e0b7fa',
      'bridge/schema/bridge-schema.ts': '9e9b6605e52aeac46cb010842ab7813174556b6562ffea2724578c5fceb8e9d6',
      'generated/unity/StudioBridgeDtos.Generated.cs': '1b5c7e889ffe3454858afa8960b4a4c099d88cfe25a9553212ba67f11a4c3268',
      'ui/src/engine/adapter.ts': 'f6df18258f62767f706fad5b517fc47e72caf4779ff4678a08b3f4358657e2d7',
    })
    expect(manifest.authority).toEqual(provenance.authority)
    expect(manifest.fixtures).toHaveLength(1)
    expect(manifest.fixtures[0]).toMatchObject({ compressedSha256: PINS.gzip,
      uncompressedSha256: PINS.raw, currentSaveSha256: PINS.current, savedSaveSha256: PINS.saved })
    expect(prior).toMatchObject({ format: 'project-studio-bridge-runtime-checkpoint',
      checkpointVersion: 1, protocolVersion: 4, schemaId: OUTGOING_46,
      sessionId: 'p14b4-genuine-outgoing46', stateRevision: 1 })
    expect(prior.journal.map(({ route, commandId }) => ({ route, commandId }))).toEqual([
      { route: 'save', commandId: 'save-current-p1' },
      { route: 'command', commandId: 'commit-withdraw' },
    ])
    expect(sha(canonicalJson(prior.journal))).toBe(PINS.journal)
    expect(prior.journalDigest).toBe(PINS.journal)
    expect(sha(prior.currentSaveJson)).toBe(PINS.current)
    expect(sha(prior.savedSaveJson)).toBe(PINS.saved)
    expect(prior.currentStateDigest).toBe(PINS.current)
    expect(prior.savedStateDigest).toBe(PINS.saved)
    expect(prior.currentSaveJson).not.toBe(prior.savedSaveJson)
    const current = validateSaveV29(JSON.parse(prior.currentSaveJson))
    const saved = validateSaveV29(JSON.parse(prior.savedSaveJson))
    expect(current.saveVersion).toBe(29)
    expect(saved.saveVersion).toBe(29)
    expect(current.state.market.tick).toBe(45)
    expect(saved.state.market.tick).toBe(45)
    expect(exportSave(current)).toBe(prior.currentSaveJson)
    expect(exportSave(saved)).toBe(prior.savedSaveJson)
    expect(current.state.promises).toEqual(saved.state.promises)
    expect(current.state.promises.find((p) => p.promiseId === 'promise-0')).toMatchObject({
      version: 3, family: 'APPEARANCE_COUNT', predicate: { count: 1 }, contractId: null,
      beneficiaryPersonId: 't-act-09', issuerStudioId: 'studio-aca408ec-player',
      windowStartWeek: 52, dueWeekExclusive: 92, outcome: null,
      feasibilityReceipt: { rulesVersion: 3, week: 45, inputsDigest: '049e3acd7af916bc' },
    })
    const savedAttachment = saved.state.talentMarket.proposals.filter((p) => p.promises.includes('promise-0'))
    expect(savedAttachment).toHaveLength(1)
    expect(savedAttachment[0]!.digest).toBe('19e1ce0ad4681452')
    expect(current.state.talentMarket.proposals.filter((p) => p.promises.includes('promise-0'))).toEqual([])
  })

  it('requires literal projection49/Save31 and exact 37 prior IDs, excluding the running identity', () => {
    expect(PROTOCOL_VERSION).toBe(4)
    expect(PROJECTION_VERSION).toBe(49)
    expect(LIVE_SAVE_VERSION).toBe(31)
    expect(SCHEMA_ID).not.toBe(OUTGOING_46)
    expect(SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS.has(SCHEMA_ID)).toBe(false)
    expect([...SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS.keys()].sort()).toEqual(EXPECTED_PRIOR_IDS)
    expect(SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS.get(OUTGOING_46)).toBe('projection-v46')
  })

  it('refuses an explicitly corrupted UNKNOWN outer identity without invoking migration', () => {
    // Negative corruption only, never represented as a genuine restamped fixture.
    const unknown = 'sha256:' + 'ab'.repeat(32)
    expect(SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS.has(unknown)).toBe(false)
    expect(SCHEMA_ID).not.toBe(unknown)
    const corrupted = canonicalJson({ ...prior, schemaId: unknown }) + '\n'
    const createSession = vi.fn(() => 'must-not-create-a-session')
    expect(() => loadBridgeRuntimeCheckpoint(corrupted, undefined, createSession))
      .toThrow(/does not match the running TypeScript bridge schema/)
    expect(createSession).not.toHaveBeenCalled()
    expect(sha(raw)).toBe(PINS.raw)
  })

  it.each(['currentSaveJson', 'savedSaveJson'] as const)('migrates %s from its OWN genuine V29 state, preserving exact material/history', (slot) => {
    const old = validateSaveV29(JSON.parse(prior[slot]))
    const oldBytes = exportSave(old)
    const expected = migrateToV31(importSave(prior[slot]))
    expect(expected.saveVersion).toBe(31)
    const loaded = loadBridgeRuntimeCheckpoint(raw, undefined, () => 'p14b4-new47-' + slot)
    expect(loaded.migratedFromProtocolVersion).toBe(4)
    const actualBytes = loaded.hydrated.checkpoint[slot]
    assert.ok(typeof actualBytes === 'string')
    expect(actualBytes).toBe(exportSave(expected))
    const actual = importSave(actualBytes)
    if (actual.saveVersion !== 31) throw new Error('Future behavior RED: slot did not reach governed Save31')
    expect(actual.state.market.tick).toBe(45)
    expect(actual.state.promises).toEqual(old.state.promises)
    expect(actual.state.firstTakes).toEqual(old.state.firstTakes)
    expect(actual.state.talentMarket).toEqual(old.state.talentMarket)
    expect(actual.state.hollywood).toEqual(old.state.hollywood)
    expect(exportSave(old)).toBe(oldBytes)
    expect(loaded.hydrated.checkpoint.currentSaveJson).not.toBe(loaded.hydrated.checkpoint.savedSaveJson)
    expect(sha(raw)).toBe(PINS.raw)
  })

  it('resets ONLY prior runtime authority, then reopens current47 without a second migration', () => {
    const createSession = vi.fn(() => 'p14b4-current47-session')
    const loaded = loadBridgeRuntimeCheckpoint(raw, undefined, createSession)
    expect(createSession).toHaveBeenCalledTimes(1)
    expect(loaded.migratedFromProtocolVersion).toBe(4)
    const current = exportSave(migrateToV31(importSave(prior.currentSaveJson)))
    const saved = exportSave(migrateToV31(importSave(prior.savedSaveJson)))
    const after = loaded.hydrated.checkpoint
    // Expected object only: no fabricated/restamped checkpoint is fed to migration.
    expect(after).toEqual({ ...prior, schemaId: SCHEMA_ID,
      sessionId: 'p14b4-current47-session', stateRevision: 0,
      currentSaveJson: current, currentStateDigest: sha(current),
      savedSaveJson: saved, savedStateDigest: sha(saved),
      journal: [], journalDigest: sha('[]') })
    expect(after.sessionId).not.toBe(prior.sessionId)
    expect(after.currentSaveJson).not.toBe(after.savedSaveJson)
    const session = BridgeSession.fromRuntimeCheckpoint(loaded.hydrated)
    expect(session.gameState.market.tick).toBe(45)
    expect(session.snapshot().savedSlot?.gameWeek).toBe(45)
    const bytes = encodeBridgeRuntimeCheckpoint(after)
    expect(encodeBridgeRuntimeCheckpoint(session.exportRuntimeCheckpoint())).toBe(bytes)
    const neverRemigrate = vi.fn(() => { throw new Error('current schema must not re-migrate') })
    const reopened = loadBridgeRuntimeCheckpoint(bytes, undefined, neverRemigrate)
    expect(reopened.migratedFromProtocolVersion).toBeNull()
    expect(neverRemigrate).not.toHaveBeenCalled()
    expect(encodeBridgeRuntimeCheckpoint(reopened.hydrated.checkpoint)).toBe(bytes)
    expect(sha(raw)).toBe(PINS.raw)
  })
})
