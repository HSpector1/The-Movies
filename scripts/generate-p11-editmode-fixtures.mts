/** Current TypeScript-authored parser fixtures; never a packaged/native capture. */
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gunzipSync } from 'node:zlib'
import { BridgeSession } from '../bridge/session.ts'
import { encodeBridgeRuntimeCheckpoint, loadBridgeRuntimeCheckpoint } from '../bridge/runtime-checkpoint.ts'
import { BRIDGE_SCHEMA, PROJECTION_VERSION, PROTOCOL_VERSION, SCHEMA_ID } from '../bridge/protocol.ts'
import { parseWireValue } from '../bridge/schema/runtime.ts'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const unity = resolve(process.argv[2] ?? join(root, '../The Movies - P11A Executive Finance Unity'))
const output = join(unity, 'Assets/Studio/Tests/EditMode/Fixtures')
const sha = (value: string | Buffer) => createHash('sha256').update(value).digest('hex')
const sparsePath = 'ui/e2e/p09-visual-oracle-v1/s2-p09-sparse-start.checkpoint.json'
const hiringPath = 'tests/fixtures/p20-before-hire.checkpoint.json.gz'
const sparse = readFileSync(join(root, sparsePath), 'utf8')
const hiring = gunzipSync(readFileSync(join(root, hiringPath))).toString('utf8')
assert.equal(sha(sparse), '10ecac7bbcd72ea07a1a8bf5c3655154f0cbb31b87666c7bb649fda903ed5647')
assert.equal(sha(hiring), '88049d4408573de3a36a56957c2b8d3aed36655b9b3dbadc68da7bef991a8510')
const hydrate = (bytes: string, name: string) => BridgeSession.fromRuntimeCheckpoint(
  loadBridgeRuntimeCheckpoint(bytes, undefined, () => `p11-editmode-${name}`).hydrated)
const sparseSession = hydrate(sparse, 'sparse')
const hiringSession = hydrate(hiring, 'hiring')
const before = [sparseSession, hiringSession].map(session => sha(encodeBridgeRuntimeCheckpoint(session.exportRuntimeCheckpoint())))
const snapshot = sparseSession.snapshot()
parseWireValue(BRIDGE_SCHEMA.$defs.StudioBridgeSnapshotResponse, snapshot)
const finance = snapshot.snapshot.finance
parseWireValue(BRIDGE_SCHEMA.$defs.StudioFinanceProjection, finance)
const placement = sparseSession.quote({ protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID,
  sessionId: sparseSession.sessionId, expectedStateRevision: sparseSession.stateRevision,
  commandId: 'p11-editmode-placement', type: 'quotePlacement',
  draft: { verb: 'build', blueprintId: 'development-casting-office', origin: { gx: 12, gy: 14 } } })
assert(placement.accepted)
assert(placement.quote.ok)
assert(placement.quote.financial)
assert.equal(placement.quote.financial.immediateCashChange, -1_500_000)
assert.equal(placement.quote.financial.laterBeginsWeek, 14)
parseWireValue(BRIDGE_SCHEMA.$defs.StudioBridgeQuoteResponse, placement)
const sign = hiringSession.quote({ protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID,
  sessionId: hiringSession.sessionId, expectedStateRevision: hiringSession.stateRevision,
  commandId: 'p11-editmode-standalone-hiring', type: 'quoteCasting',
  draft: { projectId: null, slateLead: null, slateAntagonist: null, slateSupport: null,
    directorId: null, castLead: null, castAntagonist: null, castSupport: null, craftLeadId: null,
    budgetNegative: null, budgetMarketing: null, kind: 'signActor', signTalentId: 't-wri-04', signTermWeeks: 52 } })
assert(sign.accepted)
assert.equal(sign.quote.kind, 'signContract')
assert.equal(sign.quote.projectId, null)
assert.equal(sign.quote.signTalentName, 'Gene Zaleski')
assert.equal(sign.quote.signTermWeeks, 52)
assert.equal(sign.quote.affordable, true)
parseWireValue(BRIDGE_SCHEMA.$defs.StudioBridgeQuoteResponse, sign)
assert.deepEqual([sparseSession, hiringSession].map(session => sha(encodeBridgeRuntimeCheckpoint(session.exportRuntimeCheckpoint()))), before,
  'diagnostic snapshot/quote observation changed gameplay, RNG, saved slot, revision or journal')

mkdirSync(output, { recursive: true })
const rows = [
  { file: 'p11-finance-projection.json', value: finance, source: sparsePath, sourceSha256: sha(sparse),
    operation: 'BridgeSession.snapshot().snapshot.finance; complete TS-authored component for otherwise synthetic bundle parser fixtures' },
  { file: 'p11-placement-quote.json', value: placement, source: sparsePath, sourceSha256: sha(sparse),
    operation: 'BridgeSession.quote(quotePlacement, development-casting-office, origin 12,14); actual current TypeScript producer result' },
  { file: 'p11-standalone-hiring-quote.json', value: sign, source: hiringPath, sourceSha256: sha(hiring),
    operation: 'BridgeSession.quote(quoteCasting/signActor, exact t-wri-04, 52 weeks); same frozen public source state as historical packaged projection21 quote' },
].map(({ value, ...row }) => {
  const bytes = `${JSON.stringify(value, null, 2)}\n`
  writeFileSync(join(output, row.file), bytes)
  return { ...row, sha256: sha(bytes), bytes: Buffer.byteLength(bytes) }
})
const manifest = { kind: 'p11-current-typescript-authored-editmode-parser-fixtures',
  classification: 'Current producer results after governed hydration of pinned public checkpoints; not HTTP/packaged/native captures, not migration evidence, not a coherent gameplay claim for composed synthetic Unity bundles.',
  generator: 'scripts/generate-p11-editmode-fixtures.mts',
  generatorSha256: sha(readFileSync(fileURLToPath(import.meta.url))),
  protocolVersion: PROTOCOL_VERSION, projectionVersion: PROJECTION_VERSION, schemaId: SCHEMA_ID,
  hydration: 'Unmodified historical outer bytes → loadBridgeRuntimeCheckpoint → BridgeSession.fromRuntimeCheckpoint',
  verification: { strictCurrentWire: true, observationPreservesCheckpointsAndRng: true, financialAmountsEdited: false,
    historicalHeadersRewritten: false, historicalCapturedQuoteFilesModified: false }, files: rows }
writeFileSync(join(output, 'p11-editmode-fixtures.manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`)
assert.equal(sha(readFileSync(join(root, sparsePath))), sha(sparse))
assert.equal(sha(gunzipSync(readFileSync(join(root, hiringPath)))), sha(hiring))
console.log(JSON.stringify({ output, projectionVersion: PROJECTION_VERSION, schemaId: SCHEMA_ID, files: rows }, null, 2))
