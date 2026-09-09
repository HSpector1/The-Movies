/** New diagnostic envelopes from intact public v3 states; never rewrite old headers. */
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, mkdirSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { BridgeSession } from '../bridge/session.ts'
import { encodeBridgeRuntimeCheckpoint, loadBridgeRuntimeCheckpoint } from '../bridge/runtime-checkpoint.ts'
import { BRIDGE_SCHEMA, PROJECTION_VERSION, SCHEMA_ID } from '../bridge/protocol.ts'
import { parseWireValue } from '../bridge/schema/runtime.ts'
import { validateSave } from '../src/core/index.ts'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const sourceDir = 'ui/e2e/p11-core-v3', output = join(root, 'ui/e2e/p11-core-v4')
const sha = (bytes: string | Buffer) => createHash('sha256').update(bytes).digest('hex')
const manifestBytes = readFileSync(join(root, sourceDir, 'manifest.json'))
assert.equal(sha(manifestBytes), '8823e118d74b56ca08a746fb025fd66bd3dfe899d97eea26b4bc55d6e036c4d2')
const predecessor = JSON.parse(manifestBytes.toString())
assert.equal(PROJECTION_VERSION, 27)
assert(!existsSync(output), 'A new public corpus destination is required')
mkdirSync(output)
const fixtures = predecessor.fixtures.map((row: any) => {
  const raw = readFileSync(join(root, sourceDir, row.files.checkpoint), 'utf8')
  const save = readFileSync(join(root, sourceDir, row.files.save), 'utf8')
  assert.equal(sha(raw), row.files.checkpointSha256)
  assert.equal(sha(save), row.files.saveSha256)
  const loaded = loadBridgeRuntimeCheckpoint(raw, undefined, () => `p11-v4-hydration-${row.id}`)
  assert.equal(loaded.migratedFromProtocolVersion, 4)
  const hydrated = BridgeSession.fromRuntimeCheckpoint(loaded.hydrated)
  // A newly exported diagnostic session preserves the original fixture's known
  // initial session identity; this is not a migrated runtime continuity receipt.
  const session = new BridgeSession(hydrated.gameState, row.sessionId)
  const snapshot = session.snapshot()
  parseWireValue(BRIDGE_SCHEMA.$defs.StudioBridgeSnapshotResponse, snapshot)
  const checkpoint = session.exportRuntimeCheckpoint()
  assert.equal(checkpoint.currentSaveJson, save)
  assert.equal(validateSave(JSON.parse(save)).saveVersion, 18)
  assert.equal(checkpoint.savedSaveJson, null)
  assert.equal(checkpoint.stateRevision, 0)
  assert.deepEqual(checkpoint.journal, [])
  const bytes = encodeBridgeRuntimeCheckpoint(checkpoint)
  writeFileSync(join(output, row.files.checkpoint), bytes)
  writeFileSync(join(output, row.files.save), save)
  if (row.id === 's16-p11-long-portfolio') {
    writeFileSync(join(output, 'p11-long-portfolio-finance-projection.json'), JSON.stringify(snapshot.snapshot.finance, null, 2) + '\n')
  }
  assert.equal(sha(readFileSync(join(root, sourceDir, row.files.checkpoint))), row.files.checkpointSha256)
  return { ...row, envelopeClassification: 'New projection27 diagnostic initial envelope after governed hydration of exact public projection26 bytes; unchanged save/state, not native input or saved-slot continuity evidence.',
    predecessor: { path: `${sourceDir}/${row.files.checkpoint}`, sha256: row.files.checkpointSha256, schemaId: predecessor.schemaId,
      manifestSha256: sha(manifestBytes), originalOriginAndActionsRetained: true },
    files: { ...row.files, checkpointSha256: sha(bytes) },
    verification: { ...row.verification, originalStateAndSaveBytesUnchanged: true, governedPredecessorHydration: true } }
})
const manifest = { ...predecessor, generator: 'scripts/migrate-p11-current-fixtures.mts',
  generatorSha256: sha(readFileSync(fileURLToPath(import.meta.url))), projectionVersion: PROJECTION_VERSION, schemaId: SCHEMA_ID,
  authority: 'Current diagnostic checkpoint exporter after genuine public predecessor hydration. All original state/save bytes, origins and actions retained; no header rewrite or new gameplay/migration continuity claim.',
  predecessorManifest: { path: `${sourceDir}/manifest.json`, sha256: sha(manifestBytes) }, fixtures }
// Original measured timings stay explicitly at their original projection26
// source paths. The new component is a current read of the same real state.
manifest.supplementalGenerators = predecessor.supplementalGenerators.map((entry: any) => ({ ...entry,
  measurement: `${sourceDir}/${entry.measurement}`, financeComponent: `${sourceDir}/${entry.financeComponent}`,
  classification: 'Historical projection26 actual-trajectory measurement; not remeasured or relabelled by this projection27 export.' }))
manifest.currentLongPortfolioComponent = { path: 'p11-long-portfolio-finance-projection.json',
  sha256: sha(readFileSync(join(output, 'p11-long-portfolio-finance-projection.json'))),
  classification: 'Current projection27 Finance component from unchanged real S16 state; no new trajectory/timing claim.' }
writeFileSync(join(output, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n')
assert.equal(sha(readFileSync(join(root, sourceDir, 'manifest.json'))), sha(manifestBytes))
console.log(JSON.stringify({ fixtureCount: fixtures.length, schemaId: SCHEMA_ID, projectionVersion: PROJECTION_VERSION,
  manifestSha256: sha(readFileSync(join(output, 'manifest.json'))), output, allSaveBytesUnchanged: true }))
