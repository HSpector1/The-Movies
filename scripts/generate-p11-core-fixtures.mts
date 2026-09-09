/** P11 public native scenarios. Diagnostic initial envelopes, never migration evidence. */
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { applyActions, generateWorld, tick, validateSave } from '../src/core/index.ts'
import type { Action, GameState } from '../src/core/index.ts'
import { exportSaveJson } from '../ui/src/engine/adapter.ts'
import { BridgeSession } from '../bridge/session.ts'
import { decodeBridgeRuntimeCheckpoint, encodeBridgeRuntimeCheckpoint, loadBridgeRuntimeCheckpoint } from '../bridge/runtime-checkpoint.ts'
import { BRIDGE_SCHEMA, PROJECTION_VERSION, PROTOCOL_VERSION, SCHEMA_ID } from '../bridge/protocol.ts'
import { parseWireValue } from '../bridge/schema/runtime.ts'

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
const OUTPUT = join(ROOT, 'ui/e2e/p11-core-v1')
const GENERATOR = 'scripts/generate-p11-core-fixtures.mts'
const sha = (bytes: string | Buffer) => createHash('sha256').update(bytes).digest('hex')
const sources = {
  sparse: { path: 'ui/e2e/p09-visual-oracle-v1/s2-p09-sparse-start.checkpoint.json', sha256: '10ecac7bbcd72ea07a1a8bf5c3655154f0cbb31b87666c7bb649fda903ed5647' },
  firstFilm: { path: 'ui/e2e/p09-visual-oracle-v1/s10-p09-first-film-released.checkpoint.json', sha256: '13e17c1d4d9670de6b2c288ca876e531e9f049d395e387085ca35f84ca879b61' },
  positive: { path: 'ui/e2e/p08-visual-oracle-v1/s2-p08-release-divergent.checkpoint.json', sha256: '4d08dd7caf77ec6a54bc4b6bbdd14b15aabf6a223e4689836194228d9135f891' },
  twins: { path: 'ui/e2e/p07-visual-oracle-v1/s6-p07-same-title-twins.checkpoint.json', sha256: '787124cc0e4f6104689984d9ede5e0c297483e3851704705bb01d56665e309b9' },
  legacy: { path: 'ui/e2e/p08-visual-oracle-v1/s8-p08-old-save-not-recorded.checkpoint.json', sha256: '0e17f48950b24dd03f2ff31a9f47039056dc0b7723340681911933c60169e960' },
} as const
type SourceKey = keyof typeof sources
type Trace = { kind: 'coreAction'; action: Action; beforeWeek: number; afterWeek: number }
  | { kind: 'tick'; count: number; fromWeek: number; toWeek: number; cashBefore: number; cashAfter: number }
type Scenario = {
  id: string; family: string; state: GameState; sourceKey: SourceKey | null; actions: Trace[];
  purpose: string; classification: string;
}
const originals = new Map<SourceKey, { state: GameState; sourceSchemaId: string; sourceSaveVersion: number; sourceSessionId: string; migratedFromProtocolVersion: number | null }>()

for (const [key, source] of Object.entries(sources) as [SourceKey, typeof sources[SourceKey]][]) {
  const raw = readFileSync(join(ROOT, source.path), 'utf8')
  assert.equal(sha(raw), source.sha256, `accepted source hash changed: ${source.path}`)
  const prior = JSON.parse(raw)
  const loaded = loadBridgeRuntimeCheckpoint(raw, undefined, () => `p11-source-hydration-${key}`)
  const session = BridgeSession.fromRuntimeCheckpoint(loaded.hydrated)
  originals.set(key, { state: session.gameState, sourceSchemaId: prior.schemaId,
    sourceSaveVersion: JSON.parse(prior.currentSaveJson).saveVersion, sourceSessionId: prior.sessionId,
    migratedFromProtocolVersion: loaded.migratedFromProtocolVersion })
}
const sourceState = (key: SourceKey): GameState => originals.get(key)!.state
const initialClassification = 'diagnostic initial envelope exported by BridgeSession after governed source hydration; not evidence of outer-checkpoint migration, saved-slot continuity or native input'

const scenarios: Scenario[] = []
const add = (id: string, family: string, sourceKey: SourceKey | null, state: GameState, purpose: string, actions: Trace[] = []) => {
  scenarios.push({ id, family, sourceKey, state, purpose, actions,
    classification: sourceKey === null ? 'diagnostic initial envelope from an unchanged generated world; no operating economy or finite-runway claim' : initialClassification })
}

add('s1-p11-preconstruction', 'construction-consequence', 'sparse', sourceState('sparse'),
  'Bare lot before its first paid Development & Casting Office. The real quote at (12,14) exposes immediate capital and the first Week 14→15 operating charge.')

let capital = sourceState('sparse')
const capitalActions: Trace[] = []
function act(action: Action): void {
  const beforeWeek = capital.market.tick
  capital = applyActions(capital, [action])
  capitalActions.push({ kind: 'coreAction', action, beforeWeek, afterWeek: capital.market.tick })
}
act({ kind: 'placeFacility', placement: { blueprintId: 'development-casting-office', origin: { gx: 12, gy: 14 } } })
const beforeOfficeAdvance = capital
for (let week = 0; week < 14; week++) capital = tick(capital)
capitalActions.push({ kind: 'tick', count: 14, fromWeek: beforeOfficeAdvance.market.tick, toWeek: capital.market.tick,
  cashBefore: beforeOfficeAdvance.studio.cash, cashAfter: capital.studio.cash })
for (const [blueprintId, gx, gy] of [
  ['development-casting-office', 2, 2], ['scenery-shop', 16, 14], ['stage-standard', 26, 4], ['post-building', 30, 14],
] as const) act({ kind: 'placeFacility', placement: { blueprintId, origin: { gx, gy } } })
assert.equal(capital.placement.facilities.filter(f => f.status === 'operational').length, 1)
assert.equal(capital.placement.facilities.filter(f => f.status === 'underConstruction').length, 4)
add('s2-p11-capital-heavy', 'capital-heavy', 'sparse', capital,
  'One paid operational office and four paid rising facilities, including the second office. Select current week to see the actual capital commitments.', capitalActions)

add('s3-p11-ongoing-deficit', 'ongoing-deficit', 'firstFilm', sourceState('firstFilm'),
  'Completed first theatrical run, six active employees and four operational facilities; recurring costs remain after receipts finish.')

let red = sourceState('firstFilm')
const redStart = red
let negativeAdvances = 0
while (red.studio.cash >= 0 && negativeAdvances < 1_000) { red = tick(red); negativeAdvances++ }
assert(red.studio.cash < 0, 'real unavoidable charges did not reach the in-red state within the bounded trajectory')
add('s4-p11-in-red', 'in-red', 'firstFilm', red,
  'The same first-film studio after unavoidable operating costs exhaust its cash. Contracts expire through the real tick law; no cash or salary was edited.',
  [{ kind: 'tick', count: negativeAdvances, fromWeek: redStart.market.tick, toWeek: red.market.tick, cashBefore: redStart.studio.cash, cashAfter: red.studio.cash }])

add('s5-p11-steady', 'steady-no-finite-runway', null, generateWorld('p11-core-steady-v1'),
  'Fresh unengaged world: no contracts, active runs or recurring charges. Shows steady current pace with no numerical infinity; it is not an operating-studio viability claim.')

add('s6-p11-positive-long-payroll', 'positive-and-payroll-scroll', 'positive', sourceState('positive'),
  'Accepted public P08 diagnostic studio with two active runs and 21 current employees. Existing accepted amounts are carried unchanged; no money is added for P11.')

add('s7-p11-same-title-active-settled', 'film-identity-and-scroll', 'twins', sourceState('twins'),
  'Accepted public P07 diagnostic studio with exact same-title identities, two settled films and one active run. Three Film Economics cards and 21 employees support real scroll proof.')

add('s8-p11-incomplete-history', 'migrated-incomplete-history', 'legacy', sourceState('legacy'),
  'Accepted P08 old-save trajectory with a genuine recording boundary; governed outer hydration preserves that boundary and never reconstructs earlier cash movements.')

mkdirSync(OUTPUT, { recursive: true })
const manifestRows = scenarios.map(scenario => {
  const saveBefore = exportSaveJson(scenario.state)
  assert.equal(validateSave(JSON.parse(saveBefore)).saveVersion, 18)
  const session = new BridgeSession(scenario.state, `p11-core-${scenario.id}`)
  const snapshot = session.snapshot()
  parseWireValue(BRIDGE_SCHEMA.$defs.StudioBridgeSnapshotResponse, snapshot)
  const finance = snapshot.snapshot.finance.finance
  const checkpoint = session.exportRuntimeCheckpoint()
  const encoded = encodeBridgeRuntimeCheckpoint(checkpoint)
  const decoded = decodeBridgeRuntimeCheckpoint(encoded)
  assert.equal(decoded.checkpoint.currentSaveJson, saveBefore)
  assert.equal(decoded.checkpoint.savedSaveJson, null)
  assert.equal(decoded.checkpoint.stateRevision, 0)
  assert.deepEqual(decoded.checkpoint.journal, [])
  assert.equal(exportSaveJson(scenario.state), saveBefore, `${scenario.id}: observation mutated gameplay or RNG`)
  assert.equal(finance.cash, scenario.state.studio.cash)
  if (scenario.id === 's2-p11-capital-heavy') {
    assert(finance.currentPeriod.categories.some(c => c.kind === 'constructionCapex' && c.amount < 0))
    assert(finance.facilities.some(f => f.status === 'operational'))
    assert(finance.facilities.some(f => f.status === 'underConstruction'))
  }
  if (scenario.id === 's3-p11-ongoing-deficit') assert.equal(finance.runwayState, 'finite')
  if (scenario.id === 's4-p11-in-red') { assert.equal(finance.runwayState, 'inRed'); assert.equal(finance.runwayWeeks, null) }
  if (scenario.id === 's5-p11-steady') { assert.equal(finance.runwayState, 'steady'); assert.equal(finance.runwayWeeks, null) }
  if (scenario.id === 's6-p11-positive-long-payroll') { assert.equal(finance.runwayState, 'positive'); assert(finance.employees.length >= 20); assert.equal(finance.runwayWeeks, null) }
  if (scenario.id === 's7-p11-same-title-active-settled') {
    assert(finance.films.some(f => f.status === 'settled'))
    assert(finance.films.some(f => f.status === 'releasing'))
    assert(finance.films.some(f => finance.films.some(other => other.title === f.title && other.productionId !== f.productionId)))
  }
  if (scenario.id === 's8-p11-incomplete-history') { assert(scenario.state.studioHistory.recordingStartedWeek > 0); assert(finance.coverageNotice !== null) }
  const checkpointName = `${scenario.id}.checkpoint.json`
  const saveName = `${scenario.id}.save.json`
  writeFileSync(join(OUTPUT, checkpointName), encoded)
  writeFileSync(join(OUTPUT, saveName), saveBefore)
  const origin = scenario.sourceKey === null ? { kind: 'generateWorld', seed: scenario.state.seed }
    : { kind: 'accepted-public-checkpoint', ...sources[scenario.sourceKey],
      sourceSchemaId: originals.get(scenario.sourceKey)!.sourceSchemaId,
      sourceSaveVersion: originals.get(scenario.sourceKey)!.sourceSaveVersion,
      hydration: 'loadBridgeRuntimeCheckpoint → BridgeSession.fromRuntimeCheckpoint',
      governedMigrationObserved: originals.get(scenario.sourceKey)!.migratedFromProtocolVersion !== null }
  return { id: scenario.id, family: scenario.family, purpose: scenario.purpose,
    envelopeClassification: scenario.classification, origin, actions: scenario.actions,
    files: { checkpoint: checkpointName, checkpointSha256: sha(encoded), save: saveName, saveSha256: sha(saveBefore) },
    sessionId: checkpoint.sessionId, stateRevision: checkpoint.stateRevision,
    finance: { week: finance.asOfWeek, cash: finance.cash, weeklyOperatingCost: finance.weeklyOperatingCost,
      netWeeklyCashflow: finance.netWeeklyCashflow, runwayState: finance.runwayState, runwayLabel: finance.runwayLabel,
      runwayWeeks: finance.runwayWeeks, employees: finance.employees.length,
      facilities: finance.facilities.map(f => ({ placementId: f.placementId, buildingId: f.buildingId, name: f.name, status: f.status, completesWeek: f.completesWeek })),
      films: finance.films.map(f => ({ productionId: f.productionId, title: f.title, status: f.status })),
      firstCompleteWeek: finance.firstCompleteWeek, coverageNotice: finance.coverageNotice },
    verification: { currentSaveValidated: true, strictWireParsed: true, currentCheckpointDecoded: true,
      observationPreservesSaveAndRng: true, addedCash: 0, editedFinancialAmounts: 0, sourceBytesUnchanged: true } }
})
for (const source of Object.values(sources)) assert.equal(sha(readFileSync(join(ROOT, source.path))), source.sha256)
const manifest = { kind: 'p11-core-public-native-fixtures', generator: GENERATOR,
  generatorSha256: sha(readFileSync(join(ROOT, GENERATOR))), repositoryCommit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: ROOT, encoding: 'utf8' }).trim(),
  protocolVersion: PROTOCOL_VERSION, projectionVersion: PROJECTION_VERSION, schemaId: SCHEMA_ID, saveVersion: 18,
  authority: 'New diagnostic initial checkpoints generated by the current BridgeSession exporter. Historical fixture headers are never edited. These artifacts support native proof but do not themselves prove native input, user-save continuity or packaged migration.',
  fixtureCount: manifestRows.length, fixtures: manifestRows }
writeFileSync(join(OUTPUT, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n')
console.log(JSON.stringify({ kind: manifest.kind, fixtureCount: manifestRows.length, projectionVersion: PROJECTION_VERSION,
  schemaId: SCHEMA_ID, output: OUTPUT, families: manifestRows.map(row => ({ id: row.id, family: row.family, week: row.finance.week, runwayState: row.finance.runwayState })) }, null, 2))
