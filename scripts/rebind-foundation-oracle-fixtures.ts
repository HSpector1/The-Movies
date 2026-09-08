// Fixture-only tooling: validate governed predecessor migration, then create an
// explicit synthetic oracle session. Never edits source fixtures or real profiles.
// vite-node scripts/rebind-foundation-oracle-fixtures.ts --public-output <new-dir>
//   --private-input <authorized-oracle-copy> --private-output <new-private-dir>
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync, chmodSync } from 'node:fs'
import { resolve, join, sep } from 'node:path'
import { createHash } from 'node:crypto'
import assert from 'node:assert/strict'
import { loadBridgeRuntimeCheckpoint, createBridgeRuntimeCheckpoint, encodeBridgeRuntimeCheckpoint, decodeBridgeRuntimeCheckpoint } from '../bridge/runtime-checkpoint.ts'
import { SCHEMA_ID, PROJECTION_VERSION } from '../bridge/protocol.ts'
const args = process.argv.slice(2)
function argument(name: string) { const i = args.indexOf(name); assert.ok(i >= 0 && args[i + 1], `missing ${name}`); return resolve(args[i + 1]!) }
const publicOutput = argument('--public-output'), privateInput = argument('--private-input'), privateOutput = argument('--private-output')
assert.equal(PROJECTION_VERSION, 20)
assert.ok(publicOutput !== privateOutput && !publicOutput.startsWith(privateOutput + sep) && !privateOutput.startsWith(publicOutput + sep), 'public/private outputs must be disjoint')
assert.ok(!existsSync(publicOutput) && !existsSync(privateOutput), 'outputs must be NEW directories')
assert.ok(existsSync(privateInput), 'required authorized private fixture missing')
const sha = (s: string) => createHash('sha256').update(s).digest('hex')
const priorSchema = 'sha256:6a2c01feaf02c931a8c41bbf2090f8af003b89a492d77135d7aab2b42a8d3dc9'
const sets = [ ['p08','ui/e2e/p08-visual-oracle-v1-p19',8], ['p09','ui/e2e/p09-visual-oracle-v1-p19',12], ['p10','ui/e2e/p10-visual-oracle-v1',6] ] as const
function rebind(input: string, expectedSession: string) {
  const bytes = readFileSync(input, 'utf8'), raw = JSON.parse(bytes)
  assert.equal(raw.schemaId, priorSchema, 'expected frozen P19 fixture')
  assert.equal(raw.sessionId, expectedSession, 'unexpected oracle session')
  const migrationSession = `migration-proof-${sha(bytes).slice(0, 24)}`
  const loaded = loadBridgeRuntimeCheckpoint(bytes, undefined, () => migrationSession)
  assert.equal(loaded.migratedFromProtocolVersion, 4)
  const migrated = loaded.hydrated.checkpoint
  assert.equal(migrated.sessionId, migrationSession)
  assert.equal(migrated.stateRevision, 0)
  assert.deepEqual(migrated.journal, [])
  const envelope = createBridgeRuntimeCheckpoint({ sessionId: raw.sessionId, stateRevision: 0, currentSaveJson: migrated.currentSaveJson, savedSaveJson: migrated.savedSaveJson, journal: [] })
  const output = encodeBridgeRuntimeCheckpoint(envelope)
  const decoded = decodeBridgeRuntimeCheckpoint(output).checkpoint
  assert.equal(decoded.schemaId, SCHEMA_ID)
  assert.equal(decoded.currentSaveJson, migrated.currentSaveJson)
  assert.equal(decoded.savedSaveJson, migrated.savedSaveJson)
  // These frozen P19 fixture slots already carry current durable V18 meaning.
  assert.deepEqual(JSON.parse(decoded.currentSaveJson), JSON.parse(raw.currentSaveJson))
  assert.deepEqual(decoded.savedSaveJson === null ? null : JSON.parse(decoded.savedSaveJson), raw.savedSaveJson === null ? null : JSON.parse(raw.savedSaveJson))
  assert.equal(decoded.sessionId, raw.sessionId)
  assert.equal(decoded.stateRevision, 0)
  assert.deepEqual(decoded.journal, [])
  assert.equal(readFileSync(input, 'utf8'), bytes, 'source bytes changed')
  return { output, receipt: { inputSha256: sha(bytes), outputSha256: sha(output), priorSchema: raw.schemaId, schemaId: SCHEMA_ID, sessionId: raw.sessionId, gameWeek: JSON.parse(decoded.currentSaveJson).state.market.tick, currentMeaningPreserved: true, savedMeaningPreserved: true, savedSlotNull: decoded.savedSaveJson === null, governedMigrationChecked: true, syntheticOracleSession: true } }
}
// Validate all inputs before writing any outputs.
const prepared = sets.flatMap(([family, dir, count]) => {
  const files = readdirSync(dir).filter(f => f.endsWith('.checkpoint.json')).sort()
  assert.equal(files.length, count, `${family} count`)
  return files.map(file => ({ family, file, ...rebind(join(dir, file), `${family}-oracle-${file.replace(/^s\d+-/, '').replace(/\.checkpoint\.json$/, '')}`) }))
})
assert.equal(prepared.length, 26)
const owner = rebind(privateInput, 'p10-oracle-p10-owner-profile-copy')
mkdirSync(publicOutput, { mode: 0o700 }); mkdirSync(privateOutput, { mode: 0o700 })
for (const family of ['p08','p09','p10']) mkdirSync(join(publicOutput, family), { mode: 0o700 })
for (const fixture of prepared) writeFileSync(join(publicOutput, fixture.family, fixture.file), fixture.output, { mode: 0o600 })
writeFileSync(join(publicOutput, 'manifest.json'), JSON.stringify({ schemaId: SCHEMA_ID, fixtures: prepared.map(({ family, file, receipt }) => ({ family, file, ...receipt })) }, null, 2) + '\n')
writeFileSync(join(privateOutput, 'ORACLE-p10-owner-profile-copy.checkpoint.json'), owner.output, { mode: 0o600 })
writeFileSync(join(privateOutput, 'binding.json'), JSON.stringify(owner.receipt, null, 2) + '\n', { mode: 0o600 })
chmodSync(publicOutput, 0o700); chmodSync(privateOutput, 0o700)
console.log('PASS: 26 public + 1 authorized private oracle copies; governed migration and both V18 slot meanings checked; source bytes unchanged. No product/runtime launch.')
