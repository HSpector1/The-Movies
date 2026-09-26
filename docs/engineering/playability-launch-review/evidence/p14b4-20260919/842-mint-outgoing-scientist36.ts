// One-shot T0 for 840. Run AFTER fixed-source 837 finishes, BEFORE Scientist edits.
// Uses actual outgoing Save36/projection50 producers; never relabels a new world.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { gzipSync, gunzipSync } from 'node:zlib'
import { exportSave, importSave, LIVE_SAVE_VERSION, makeSave, migrateToLive } from '../../../../../src/core/save.ts'
import { tick } from '../../../../../src/core/tick.ts'
import { createBridgeRuntimeCheckpoint, decodeBridgeRuntimeCheckpoint, encodeBridgeRuntimeCheckpoint } from '../../../../../bridge/runtime-checkpoint.ts'
import { PROJECTION_VERSION, PROTOCOL_VERSION } from '../../../../../bridge/schema/bridge-schema.ts'
import { SCHEMA_ID } from '../../../../../bridge/protocol.ts'

const sha = (bytes: string | Buffer): string => createHash('sha256').update(bytes).digest('hex')
const git = (...args: string[]): string => execFileSync('git', args, { encoding: 'utf8' }).trim()
const base = '84f1d9a8bf283ca06a3fe5235e475238a04f57e5'
const sourceSha = git('rev-parse', 'HEAD')
const sourceDiff = (): string => git('diff', base, '--', 'src', 'bridge', 'generated')
assert.equal(sourceDiff(), '', 'outgoing production must still equal C.2c source84f')
assert.equal(LIVE_SAVE_VERSION, 36)
assert.equal(PROJECTION_VERSION, 50)
assert.equal(PROTOCOL_VERSION, 4)
const fullRun = JSON.parse(readFileSync('docs/engineering/playability-launch-review/evidence/p14b4-20260919/837-c2c-full-core.json', 'utf8'))
assert.notEqual(fullRun.end, null, 'never mint test fixtures while recorded837 is running')
assert.equal(fullRun.fixedSource, true)
const input = 'tests/fixtures/p14/genuine-v33-c2-corpus/genuine-v33-c2-scientist.json.gz'
const bytes = readFileSync(input)
assert.equal(sha(bytes), '81a1136a90abc6b0c8ae88684ac379e9f3a6faeafe68b12acd26f3e8b0154714')
const inputJson = gunzipSync(bytes).toString('utf8')
assert.equal(sha(inputJson), 'fda192a00c71fa66284cc51a4e9e5e0a41b409e0919a1c0a050f79cb0904bd2f')
const saved = migrateToLive(importSave(inputJson))
const current = makeSave(tick(saved.state))
assert.equal(saved.state.market.tick, 520)
assert.equal(current.state.market.tick, 521)
assert.equal(saved.state.talent.find(person => person.id === 't-sci-00')?.age, 61)
assert.equal(saved.state.careerLifecycle.records.some(record => record.profession === 'scientist'), false)
assert.deepEqual(saved.state.technology, JSON.parse(inputJson).state.technology)
const savedSaveJson = exportSave(saved)
const currentSaveJson = exportSave(current)
const raw = encodeBridgeRuntimeCheckpoint(createBridgeRuntimeCheckpoint({
  sessionId: 'generated-scientist-outgoing-runtime50', stateRevision: 0,
  currentSaveJson, savedSaveJson, journal: [],
}))
const decoded = decodeBridgeRuntimeCheckpoint(raw)
assert.equal(decoded.checkpoint.currentSaveJson, currentSaveJson)
assert.equal(decoded.checkpoint.savedSaveJson, savedSaveJson)
assert.notEqual(currentSaveJson, savedSaveJson)
assert.equal(decoded.checkpoint.schemaId, SCHEMA_ID)
assert.equal(git('rev-parse', 'HEAD'), sourceSha)
assert.equal(sourceDiff(), '')
const out = 'tests/fixtures/p14/genuine-v36-scientist-corpus'
assert.equal(existsSync(out), false, 'refuse to overwrite any preserved fixture directory')
mkdirSync(out)
const artifacts = [
  { filename: 'genuine-v36-scientist-week520.json.gz', raw: savedSaveJson, kind: 'save' },
  { filename: 'genuine-v36-scientist-week521.json.gz', raw: currentSaveJson, kind: 'save' },
  { filename: 'runtime50-current521-saved520.json.gz', raw, kind: 'runtimeCheckpoint' },
].map(({ filename, raw: payload, kind }) => {
  const compressed = gzipSync(payload, { level: 9 })
  writeFileSync(`${out}/${filename}`, compressed, { flag: 'wx' })
  return { filename, kind, uncompressedSha256: sha(payload), compressedSha256: sha(compressed),
    byteLength: Buffer.byteLength(payload), compressedByteLength: compressed.length }
})
const producer = 'docs/engineering/playability-launch-review/evidence/p14b4-20260919/842-mint-outgoing-scientist36.ts'
const manifest = { generatedAt: new Date().toISOString(), sourceSha, productionBaseSha: base,
  producer, producerSha256: sha(readFileSync(producer)), input,
  inputCompressedSha256: sha(bytes), inputUncompressedSha256: sha(inputJson),
  saveVersion: saved.saveVersion, projectionVersion: PROJECTION_VERSION, protocolVersion: PROTOCOL_VERSION,
  schemaId: SCHEMA_ID, savedWeek: 520, currentWeek: 521, journalEntries: 0, runtimeStateRevision: 0,
  description: 'Actual outgoing Save36 converter and tick, then projection50 create/encode/decode. Genuine V33 input and research history preserved; two independent current/saved slots. No Scientist amendment or relabeling.', artifacts }
writeFileSync(`${out}/MANIFEST.json`, JSON.stringify(manifest, null, 2) + '\n', { flag: 'wx' })
console.log(JSON.stringify(manifest, null, 2))
