// C.2-RM T0: real qualified Save37/projection51 producer, before52 source edits.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { gzipSync, gunzipSync } from 'node:zlib'
import { retirementRecordFor } from '../../../../../src/core/careerLifecycle.ts'
import { exportSave, importSave, LIVE_SAVE_VERSION, makeSave, migrateToLive } from '../../../../../src/core/save.ts'
import { advanceTo } from '../../../../../src/harness/p13a/fixtures.ts'
import { BridgeSession } from '../../../../../bridge/session.ts'
import { decodeBridgeRuntimeCheckpoint, encodeBridgeRuntimeCheckpoint, loadBridgeRuntimeCheckpoint } from '../../../../../bridge/runtime-checkpoint.ts'
import { PROJECTION_VERSION, PROTOCOL_VERSION, SCHEMA_ID } from '../../../../../bridge/protocol.ts'
import { canonicalJson } from '../../../../../bridge/schema/canonical.ts'

const sha = (bytes: string | Buffer): string => createHash('sha256').update(bytes).digest('hex')
const git = (...args: string[]): string => execFileSync('git', args, { encoding: 'utf8' }).trim()
const productionBaseSha = '697a60398f531abcbd1d6c643a55546fa5cd65d9'
const qualifiedSourceSha = '48a76a87bca624d6dff81118d5ecb6df56ca00d2'
const sourceSha = git('rev-parse', 'HEAD')
assert.equal(sourceSha, qualifiedSourceSha, 'producer runs at the published Scientist qualification')
const productionDiff = (): string => git('diff', productionBaseSha, '--', 'src', 'bridge', 'ui', 'generated', 'scripts')
assert.equal(productionDiff(), '')
assert.equal(LIVE_SAVE_VERSION, 37)
assert.equal(PROJECTION_VERSION, 51)
assert.equal(PROTOCOL_VERSION, 4)
assert.equal(SCHEMA_ID, 'sha256:a690e6f9e6f93f3a78f8eed8eaa20a1532a9ebd82812b0bc9414a04fdcb5968f')
const evidence = 'docs/engineering/playability-launch-review/evidence/p14b4-20260919'
for (const name of ['861-scientist-full-core', '867-scientist-repaired-boundary-cases',
  '868-scientist-final-root-ui-types', '869-scientist-final-bridge-types', '870-scientist-fu2-recheck']) {
  const record = JSON.parse(readFileSync(`${evidence}/${name}.json`, 'utf8'))
  assert.notEqual(record.end, null, `${name} must have closed`)
  assert.equal(record.fixedSource, true)
  assert.equal(record.exitCode, name.startsWith('861-') ? 1 : 0)
}
const input = 'tests/fixtures/p14/genuine-v33-c2-corpus/genuine-v33-c2-scientist.json.gz'
const inputBytes = readFileSync(input)
assert.equal(sha(inputBytes), '81a1136a90abc6b0c8ae88684ac379e9f3a6faeafe68b12acd26f3e8b0154714')
const inputJson = gunzipSync(inputBytes).toString('utf8')
assert.equal(sha(inputJson), 'fda192a00c71fa66284cc51a4e9e5e0a41b409e0919a1c0a050f79cb0904bd2f')
let state = migrateToLive(importSave(inputJson)).state
assert.equal(state.market.tick, 520)
assert.equal(state.talent.find(person => person.id === 't-sci-00')?.age, 61)
assert.equal(retirementRecordFor(state, 't-sci-00'), undefined)
const originalProvenance = state.talentProvenance.rows.find(row => row.personId === 't-sci-00')
const snapshots = new Map<number, string>()
for (const week of [617, 618, 669, 670]) {
  state = advanceTo(state, week)
  const raw = exportSave(makeSave(state))
  assert.equal(exportSave(importSave(raw)), raw, 'whole live-save validation/canonical round trip')
  assert.deepEqual(state.talentProvenance.rows.find(row => row.personId === 't-sci-00'), originalProvenance)
  const record = retirementRecordFor(state, 't-sci-00')
  if (week === 617) assert.equal(record, undefined)
  else {
    assert.ok(record)
    assert.equal(record.announcedWeek, 618)
    assert.equal(record.effectiveWeek, 670)
    assert.equal(record.status, week === 670 ? 'retired' : 'announced')
    if (week === 670) assert.equal(record.retiredWeek, 670)
  }
  snapshots.set(week, raw)
}
const savedSaveJson = snapshots.get(669)!
const session = BridgeSession.fromSaveJson(savedSaveJson, 'generated-c2rm-outgoing-runtime51')
const snapshot = session.snapshot()
const intent = snapshot.availableIntents.find(row => row.kind === 'advanceWeek')
assert.ok(intent, 'genuine669 must publish a real advanceWeek intent; never fabricate a journal')
const command = {
  protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId: snapshot.sessionId,
  expectedStateRevision: snapshot.stateRevision, commandId: 'generated-c2rm-669-to-670',
  type: 'submitIntent' as const, payload: { intentId: intent.intentId },
}
const response = session.command(command)
assert.equal(response.accepted, true)
assert.equal(session.gameState.market.tick, 670)
assert.equal(session.stateRevision, 1)
assert.equal(exportSave(makeSave(session.gameState)), snapshots.get(670))
const checkpoint = session.exportRuntimeCheckpoint()
assert.equal(checkpoint.journal.length, 1)
assert.equal(checkpoint.journal[0]!.commandId, command.commandId)
assert.equal(checkpoint.savedSaveJson, savedSaveJson)
assert.equal(checkpoint.currentSaveJson, snapshots.get(670))
assert.notEqual(checkpoint.currentSaveJson, checkpoint.savedSaveJson)
assert.equal(checkpoint.currentStateDigest, sha(checkpoint.currentSaveJson))
assert.equal(checkpoint.savedStateDigest, sha(savedSaveJson))
assert.equal(checkpoint.journalDigest, sha(canonicalJson(checkpoint.journal)))
const rawRuntime = encodeBridgeRuntimeCheckpoint(checkpoint)
assert.equal(encodeBridgeRuntimeCheckpoint(decodeBridgeRuntimeCheckpoint(rawRuntime).checkpoint), rawRuntime)
const loaded = loadBridgeRuntimeCheckpoint(rawRuntime, undefined, () => {
  throw new Error('current51 must reopen without migration')
})
assert.equal(loaded.migratedFromProtocolVersion, null)
const reopened = BridgeSession.fromRuntimeCheckpoint(loaded.hydrated)
assert.equal(encodeBridgeRuntimeCheckpoint(reopened.exportRuntimeCheckpoint()), rawRuntime)
assert.equal(canonicalJson(reopened.command(command)), canonicalJson(response))
assert.equal(reopened.stateRevision, 1)
assert.equal(encodeBridgeRuntimeCheckpoint(reopened.exportRuntimeCheckpoint()), rawRuntime)
assert.equal(git('rev-parse', 'HEAD'), sourceSha)
assert.equal(productionDiff(), '')
assert.equal(sha(readFileSync(input)), sha(inputBytes))

// Prepare and validate every payload before creating the new fixture directory.
const prepared = [...snapshots].map(([week, raw]) => ({
  filename: `genuine-v37-scientist-week${week}.json.gz`, raw, kind: 'save',
}))
prepared.push({ filename: 'runtime51-current670-saved669.json.gz', raw: rawRuntime, kind: 'runtimeCheckpoint' })
const artifacts = prepared.map(({ filename, raw, kind }) => {
  const compressed = gzipSync(raw, { level: 9 })
  assert.equal(gunzipSync(compressed).toString('utf8'), raw)
  return { filename, kind, compressed, uncompressedSha256: sha(raw), compressedSha256: sha(compressed),
    byteLength: Buffer.byteLength(raw), compressedByteLength: compressed.length }
})
const producer = `${evidence}/872-mint-outgoing-runtime51.ts`
const manifest = {
  generatedAt: new Date().toISOString(), sourceSha, qualifiedSourceSha, productionBaseSha,
  producer, producerSha256: sha(readFileSync(producer)), input,
  inputCompressedSha256: sha(inputBytes), inputUncompressedSha256: sha(inputJson),
  saveVersion: LIVE_SAVE_VERSION, projectionVersion: PROJECTION_VERSION, protocolVersion: PROTOCOL_VERSION,
  schemaId: SCHEMA_ID, savedWeek: 669, currentWeek: 670, journalEntries: 1, runtimeStateRevision: 1,
  currentStateDigest: checkpoint.currentStateDigest, savedStateDigest: checkpoint.savedStateDigest,
  journalDigest: checkpoint.journalDigest,
  description: 'Genuine V33 continuation under qualified Save37/projection51, no age/history edits. Real public advance command straddles Scientist announcement618/E670: saved669 announced, current670 retired. Actual nonempty journal and exact current-schema duplicate replay.',
  command, artifacts: artifacts.map(({ compressed: _bytes, ...metadata }) => metadata),
}
const out = 'tests/fixtures/p14/genuine-projection51-runtime-c2rm'
assert.equal(existsSync(out), false, 'never overwrite preserved fixtures')
mkdirSync(out)
for (const artifact of artifacts) writeFileSync(`${out}/${artifact.filename}`, artifact.compressed, { flag: 'wx' })
writeFileSync(`${out}/MANIFEST.json`, JSON.stringify(manifest, null, 2) + '\n', { flag: 'wx' })
console.log(JSON.stringify(manifest, null, 2))
