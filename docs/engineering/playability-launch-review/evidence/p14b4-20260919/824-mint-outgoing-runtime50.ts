// One-shot outgoing runtime preservation before any C.2c/Scientist/C.2-RM source change.
// Run with the repository's installed vite-node, from the repository root.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { gzipSync, gunzipSync } from 'node:zlib'
import { exportSave, makeSave, migrateToLive } from '../../../../../src/core/save.ts'
import { tick } from '../../../../../src/core/tick.ts'
import { createBridgeRuntimeCheckpoint, decodeBridgeRuntimeCheckpoint, encodeBridgeRuntimeCheckpoint } from '../../../../../bridge/runtime-checkpoint.ts'
import { PROJECTION_VERSION, PROTOCOL_VERSION } from '../../../../../bridge/schema/bridge-schema.ts'
import { SCHEMA_ID } from '../../../../../bridge/protocol.ts'

const sha = (bytes: string | Buffer): string => createHash('sha256').update(bytes).digest('hex')
const git = (...args: string[]): string => execFileSync('git', args, { encoding: 'utf8' }).trim()
const sourceSha = git('rev-parse', 'HEAD')
assert.equal(sourceSha, '9b170660398e605be149994400bf092415c78a07')
assert.equal(git('diff', 'HEAD', '--', 'src', 'bridge', 'generated'), '')
assert.equal(PROJECTION_VERSION, 50)
assert.equal(PROTOCOL_VERSION, 4)
const input = 'tests/fixtures/p14/genuine-v35-c2b-corpus/genuine-v35-c2b-contract-at-effective-week.json.gz'
const inputBytes = readFileSync(input)
assert.equal(sha(inputBytes), 'c339695f855e2daf97be959a7a0c75a6ccae72878dc070aef25da4890d694bf3')
const saved = migrateToLive(JSON.parse(gunzipSync(inputBytes).toString('utf8')))
const current = makeSave(tick(saved.state))
const savedSaveJson = exportSave(saved)
const currentSaveJson = exportSave(current)
assert.equal(saved.state.market.tick, 52)
assert.equal(current.state.market.tick, 53)
assert.notEqual(savedSaveJson, currentSaveJson)
const checkpoint = createBridgeRuntimeCheckpoint({
  sessionId: 'generated-c2rm-outgoing-runtime50', stateRevision: 0,
  currentSaveJson, savedSaveJson, journal: [],
})
const raw = encodeBridgeRuntimeCheckpoint(checkpoint)
const decoded = decodeBridgeRuntimeCheckpoint(raw)
assert.equal(decoded.checkpoint.currentSaveJson, currentSaveJson)
assert.equal(decoded.checkpoint.savedSaveJson, savedSaveJson)
assert.equal(decoded.checkpoint.schemaId, SCHEMA_ID)
assert.equal(git('rev-parse', 'HEAD'), sourceSha)
assert.equal(git('diff', 'HEAD', '--', 'src', 'bridge', 'generated'), '')
const out = 'tests/fixtures/p14/genuine-projection50-runtime-c2rm'
assert.equal(existsSync(out), false, 'refuse to overwrite any preserved fixture directory')
mkdirSync(out)
const compressed = gzipSync(raw, { level: 9 })
writeFileSync(`${out}/runtime50-current53-saved52.json.gz`, compressed, { flag: 'wx' })
const producer = 'docs/engineering/playability-launch-review/evidence/p14b4-20260919/824-mint-outgoing-runtime50.ts'
const manifest = {
  generatedAt: new Date().toISOString(), sourceSha, producer, producerSha256: sha(readFileSync(producer)),
  description: 'Actual projection-50 checkpoint producer, canonical live conversion of genuine V35 source; current advanced by real tick, saved slot retained independently. Synthetic public test campaign only.',
  input, inputCompressedSha256: sha(inputBytes), projectionVersion: PROJECTION_VERSION,
  protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, saveVersion: saved.saveVersion,
  currentWeek: current.state.market.tick, savedWeek: saved.state.market.tick,
  currentSaveSha256: sha(currentSaveJson), savedSaveSha256: sha(savedSaveJson),
  filename: 'runtime50-current53-saved52.json.gz', uncompressedSha256: sha(raw),
  compressedSha256: sha(compressed), byteLength: Buffer.byteLength(raw), compressedByteLength: compressed.length,
  journalEntries: 0, runtimeStateRevision: 0, verification: 'Actual create/encode/decode; both slots equal their own canonical source and differ from each other; source and HEAD fixed.',
}
writeFileSync(`${out}/MANIFEST.json`, JSON.stringify(manifest, null, 2) + '\n', { flag: 'wx' })
console.log(JSON.stringify(manifest, null, 2))
