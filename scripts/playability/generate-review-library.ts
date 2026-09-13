import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync, realpathSync, lstatSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { BridgeSession } from '../../bridge/session.ts'
import { SCHEMA_ID } from '../../bridge/protocol.ts'
import { DEFAULT_BRIDGE_RUNTIME_CHECKPOINT_LIMITS as limits, loadBridgeRuntimeCheckpoint } from '../../bridge/runtime-checkpoint.ts'
import { CAMPAIGN_LIBRARY_FORMAT, initialCampaignLibrary, encodeCampaignLibrary, loadCampaignLibrary, type CampaignLibrary } from '../../bridge/runtime/campaign-library.ts'

// Review setup, following the accepted P13A composer. It extracts unchanged
// engine checkpoints from pinned generated evidence, then mints catalogue IDs
// and labels. This is not proof of a player Save As or native game progression.
const ts = '/Users/bruce/The Movies - Playability Interaction TS'
assert.equal(realpathSync(process.cwd()), ts)
const root = join(ts, 'Evidence/Playability-Interaction-01/fixtures')
const scenarios = [
  ['early/manifest.json', '01 Early studio', '1e40b1f9ac73050fbcc3ab79326c926de9d291e98ad13304056d19d69763506c', 12],
  ['native-casting-ack-run57-01/generated-review-ack-run57.checkpoint.json.manifest.json', '02 Casting decisions', '0fd8880207dbde2e1f17f6357cae2780d4254d07cbd6258b1360a298189dad54', 15],
  ['native-post-start-run16/manifest.json', '03 Production and people', 'b9b066e97cb0ef7ea868aae6dd192df0b6298f9e70c1358749d8c4184c0b1499', 19],
  ['native-research-complete-run4/manifest.json', '04 Research and installation', 'ff99264ef012f8df4418cf2f397c3205cbb389b7a098460ce56cc65b169bfb3f', 327],
  ['native-set-completed-run43/manifest.json', '05 Completed set', '4c3bb07996c3dc759a063bca059ea6387ee20f9f1d99b1379fb2f8b700dd7a5d', 333],
  ['native-released-run21-01/manifest.json', '06 Film result and history', 'c9826e4a27c80eb7dfa7ddb6c112146616e141b9bc516c4cc3f589c759d7b426', 35],
] as const
const directory = join(ts, 'artifacts/playability-interaction-01/review-library-01')
assert.equal(existsSync(directory), false, 'Immutable review output must be absent')
const sha = (value: string | Buffer) => createHash('sha256').update(value).digest('hex')
function regular(path: string) {
  assert.ok(path.startsWith(root + '/'))
  assert.equal(realpathSync(path), path)
  const s = lstatSync(path); assert.ok(s.isFile() && !s.isSymbolicLink())
  return readFileSync(path)
}
let library: CampaignLibrary | undefined
const sources: { label: string; path: string; sha256: string; bytes: number; manifest: string; manifestSha256: string; extractedCheckpointSha256: string; extractedCheckpointBytes: number; recordId: string; week: number; stateDigest: string }[] = []
for (const [manifestRel, label, expectedHash, expectedWeek] of scenarios) {
  const manifestPath = join(root, manifestRel), manifestBytes = regular(manifestPath), p = JSON.parse(manifestBytes.toString())
  assert.equal(p.kind, 'p13a-generated-evidence/v1'); assert.equal(p.source, 'live engine generated fixture; no user campaign input')
  assert.equal(p.schemaId, SCHEMA_ID)
  const original = regular(p.checkpoint)
  assert.equal(sha(original), expectedHash); assert.equal(p.sha256, expectedHash); assert.equal(p.bytes, original.length)
  const text = original.toString(), encoded = JSON.parse(text)
  let checkpoint = text
  if (encoded.format === CAMPAIGN_LIBRARY_FORMAT) {
    const checked = loadCampaignLibrary(text, limits)
    assert.equal(checked.changed, false, 'Generated source library already canonical')
    checkpoint = checked.library.workingCheckpointJson
  }
  const session = BridgeSession.fromRuntimeCheckpoint(loadBridgeRuntimeCheckpoint(checkpoint, limits).hydrated, limits)
  assert.equal(session.gameState.market.tick, expectedWeek)
  const minted = initialCampaignLibrary(session, limits, checkpoint)
  const record = { ...minted.records[0]!, label }
  assert.ok(record.id); assert.equal(record.checkpointJson, checkpoint, 'No engine checkpoint alteration during review setup')
  assert.equal(minted.workingCheckpointJson, checkpoint)
  if (!library) library = { ...minted, records: [record] }
  else library.records.push(record)
  sources.push({ label, path: p.checkpoint, sha256: expectedHash, bytes: original.length, manifest: manifestPath, manifestSha256: sha(manifestBytes),
    extractedCheckpointSha256: sha(checkpoint), extractedCheckpointBytes: Buffer.byteLength(checkpoint), recordId: record.id, week: expectedWeek, stateDigest: session.snapshot().stateDigest })
}
assert.ok(library); assert.equal(new Set(library.records.map(r => r.id)).size, scenarios.length)
const encoded = await encodeCampaignLibrary(library), checked = loadCampaignLibrary(encoded, limits)
assert.equal(checked.changed, false); assert.equal(checked.library.records.length, scenarios.length)
for (const source of sources) {
  const record = checked.library.records.find(r => r.id === source.recordId)!
  assert.equal(record.label, source.label); assert.equal(sha(record.checkpointJson), source.extractedCheckpointSha256)
}
const checkpoint = join(directory, 'generated-review-library.json')
const manifest = { kind: 'p13a-generated-evidence/v1', source: 'live engine generated fixture; no user campaign input', scenario: 'playability-review-library',
  method: 'Six unchanged generated working engine checkpoints. Source libraries remain immutable, including original receipts/inactive records. Only this new review catalogue collection, labels and storage UUIDs are authored through the accepted initialCampaignLibrary helper. No native Save As, game action or migration is claimed by setup.',
  checkpoint, sha256: sha(encoded), bytes: Buffer.byteLength(encoded), schemaId: SCHEMA_ID, saveVersion: 20, activeCampaignId: library.activeCampaignId,
  week: checked.session.gameState.market.tick, stateDigest: checked.session.snapshot().stateDigest, sources, generatorSha256: sha(readFileSync(resolve('scripts/playability/generate-review-library.ts'))) }
mkdirSync(directory, { recursive: true, mode: 0o700 })
writeFileSync(checkpoint, encoded, { flag: 'wx', mode: 0o600 })
writeFileSync(join(directory, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n', { flag: 'wx', mode: 0o600 })
console.log(JSON.stringify(manifest, null, 2))
