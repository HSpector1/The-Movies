/** P11 public native scenarios. Diagnostic initial envelopes, never migration evidence. */
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { applyActions, beginFounding, contractOffer, FOUNDING_MINIMUMS, generateWorld, tick, validateSave, scriptProjectsReadModel } from '../src/core/index.ts'
import type { Action, GameState } from '../src/core/index.ts'
import { castingDraftToEngine, castingProjection } from '../bridge/casting.ts'
import type { BridgeCastingDraftPayload } from '../bridge/schema/bridge-schema.ts'
import { exportSaveJson, productionBoard, productionDecision, runProductionCommand } from '../ui/src/engine/adapter.ts'
import { BridgeSession } from '../bridge/session.ts'
import { decodeBridgeRuntimeCheckpoint, encodeBridgeRuntimeCheckpoint, loadBridgeRuntimeCheckpoint } from '../bridge/runtime-checkpoint.ts'
import { BRIDGE_SCHEMA, PROJECTION_VERSION, PROTOCOL_VERSION, SCHEMA_ID } from '../bridge/protocol.ts'
import { parseWireValue } from '../bridge/schema/runtime.ts'

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
// Preserve authentic projection24/v1 and core25/v2; ready26 has its own corpus.
const OUTPUT = join(ROOT, 'ui/e2e/p11-core-v3')
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
  | { kind: 'coreOperation'; operation: string; beforeWeek: number; afterWeek: number }
  | { kind: 'bridgeDraft'; draft: BridgeCastingDraftPayload; beforeWeek: number; afterWeek: number }
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
    classification: sourceKey === null ? 'diagnostic initial envelope from generateWorld and listed core actions/ticks; not native-input, saved-slot-continuity or migration evidence' : initialClassification })
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

// Ready extensions: actual owner actions and ticks, with no edited financial amounts.
let ready = sourceState('firstFilm')
const readyTrace: Trace[] = []
const readyAct = (action: Action) => {
  const beforeWeek = ready.market.tick
  ready = applyActions(ready, [action]); readyTrace.push({ kind: 'coreAction', action, beforeWeek, afterWeek: ready.market.tick })
}
const readyTick = () => {
  const before = ready; ready = tick(ready)
  readyTrace.push({ kind: 'tick', count: 1, fromWeek: before.market.tick, toWeek: ready.market.tick,
    cashBefore: before.studio.cash, cashAfter: ready.studio.cash })
}
const commission = scriptProjectsReadModel(ready).commission
const concept = commission.concepts[0]!, writer = commission.writers.find(w => w.available)!
assert(concept && writer, 'public first-film studio lacks a legal commission')
readyAct({ kind: 'commissionScript', project: { conceptId: concept.id, writerId: writer.id,
  shape: { opening: 'mysteryHook', midpoint: 'revelation', ending: 'bittersweet' },
  promise: { genre: concept.genre, intendedSegments: ['adult'],
    ranges: { intimacy: [-0.5,0.5], tonalWeight: [-0.5,0.5], kineticEnergy: [-0.5,0.5] } } } })
const projectId = ready.scriptDevelopment.projects.at(-1)!.id
readyTick()
assert.equal(ready.scriptDevelopment.projects.find(p => p.id === projectId)?.status, 'review')
add('s9-p11-development-review', 'ready-development', 'firstFilm', ready,
  'Exact newly commissioned screenplay awaiting review, before any production identity or budget commitment. Finance routes to its retained read-only Development detail.', [...readyTrace])
readyAct({ kind: 'acceptScript', projectId })
const casting = castingProjection(ready).board!.projects.find(p => p.projectId === projectId)!
const actors = casting.leadCandidates.filter(p => p.available).slice(0,3).map(p => p.talentId)
assert.equal(actors.length,3)
readyAct({ kind: 'startCastingSession', session: { projectId,
  slate: { lead: [actors[0]!,actors[1]!], antagonist: [actors[0]!,actors[2]!], support: [actors[1]!,actors[2]!] } } })
readyTick()
const castingSession = ready.castingSessions.sessions.find(s => s.projectId === projectId)!
readyAct({ kind: 'acknowledgeCastingSession', sessionId: castingSession.id })
add('s10-p11-ready-package', 'ready-package-and-material-actions', 'firstFilm', ready,
  'Actual completed and acknowledged camera tests; exact Ready package for a live Greenlight quote. Current public hiring and releasable roster routes remain with their existing owners.', [...readyTrace])
const packageReady = ready, packageReadyTrace = [...readyTrace]
const packageView = castingProjection(ready).board!.projects.find(p => p.projectId === projectId)!
const chosenActors = packageView.leadCandidates.filter(p => p.available)
const draft: BridgeCastingDraftPayload = { kind: 'greenlightPackage', projectId,
  slateLead: null, slateAntagonist: null, slateSupport: null,
  directorId: packageView.directorCandidates.find(p => p.available)!.talentId,
  craftLeadId: packageView.craftCandidates.find(p => p.available)!.talentId,
  castLead: chosenActors[0]!.talentId, castAntagonist: chosenActors[1]!.talentId, castSupport: chosenActors[2]!.talentId,
  budgetNegative: packageView.negativeOptions[0]!.amount, budgetMarketing: packageView.marketingOptions[0]!.amount,
  signTalentId: null, signTermWeeks: null }
const conversion = castingDraftToEngine(ready,draft)
assert(conversion.ok)
const beforeGreenlight = ready
const outcome = conversion.apply(ready)
assert(outcome.ok)
ready = outcome.next
readyTrace.push({ kind: 'bridgeDraft', draft, beforeWeek: beforeGreenlight.market.tick, afterWeek: ready.market.tick })
const productionId = ready.studio.activeProductions.at(-1)!.id
add('s11-p11-in-production', 'ready-production', 'firstFilm', ready,
  'The exact screenplay after actual Greenlight admission: one real production ID, original paid commitments and unknown commercial return.', [...readyTrace])
for (let guard = 0; guard < 40 && ready.studio.activeProductions.find(p => p.id === productionId)!.remainingTicks > 3; guard++) {
  const decision = productionDecision(ready)
  if (decision?.command) {
    const beforeWeek = ready.market.tick, result = runProductionCommand(ready,decision.command)
    assert(result.ok); ready = result.next
    readyTrace.push({ kind:'coreOperation', operation: JSON.stringify(decision.command), beforeWeek, afterWeek: ready.market.tick })
  } else readyTick()
}
assert.equal(productionBoard(ready).cards.find(p => p.productionId === productionId)?.phase,'postProduction',
  'real production did not reach Post; inspect the authoritative blocker rather than edit phase')
add('s12-p11-post-production', 'ready-post', 'firstFilm', ready,
  'Actual production progression into Post after existing shooting decisions; remaining production time is a phase countdown, not an invented release date.', [...readyTrace])
while (ready.studio.activeProductions.find(p=>p.id===productionId)!.remainingTicks > 1) readyTick()
add('s13-p11-release-ready', 'ready-release-decision', 'firstFilm', ready,
  'Actual Release Ready decision with no release commitment. Finance sorts this authoritative unresolved decision first and opens the exact production.', [...readyTrace])

let contracts = beginFounding(generateWorld('p11-ready-contract-window', { regime:'endowed' }))
const contractTrace: Trace[] = [{ kind:'coreOperation',operation:'beginFounding(generateWorld(seed, endowed))',beforeWeek:0,afterWeek:0 }]
const contractAct = (action: Action) => {
  const beforeWeek=contracts.market.tick; contracts=applyActions(contracts,[action])
  contractTrace.push({kind:'coreAction',action,beforeWeek,afterWeek:contracts.market.tick})
}
for (const role of ['actor','director','writer','craft'] as const) {
  const applicants=contracts.founding!.applicantIds.map(id=>contracts.talent.find(t=>t.id===id)!).filter(t=>t.role===role)
    .sort((a,b)=>contractOffer(contracts,a.id,52).annualSalary-contractOffer(contracts,b.id,52).annualSalary)
  for (const person of applicants.slice(0,FOUNDING_MINIMUMS[role])) contractAct({kind:'signContract',talentId:person.id,termWeeks:52})
}
for (const action of [{kind:'foundStudio'},{kind:'activateStudioOperations'},{kind:'activateScriptDevelopment'},{kind:'activateCastingSessions'}] as const) contractAct(action)
const contractStart=contracts
while (contracts.market.tick<41) contracts=tick(contracts)
contractTrace.push({kind:'tick',count:41,fromWeek:0,toWeek:41,cashBefore:contractStart.studio.cash,cashAfter:contracts.studio.cash})
assert(contracts.studio.cash>0)
add('s14-p11-renewal-window', 'ready-contract-actions', null, contracts,
  'Actual founded52-week contracts at Week41, after the Week40 renewal opening. Cash remains positive through real unavoidable costs; supports legal renewal, release and standalone hiring through their existing quote owners.',contractTrace)

// Queue preview: fill real Development & Casting capacity with other work,
// hiring another writer through the current action only if the free roster needs one.
let queueReady = packageReady
const queueTrace = [...packageReadyTrace]
const queueAct = (action: Action) => {
  const beforeWeek=queueReady.market.tick; queueReady=applyActions(queueReady,[action])
  queueTrace.push({kind:'coreAction',action,beforeWeek,afterWeek:queueReady.market.tick})
}
for (let guard=0;guard<8 && scriptProjectsReadModel(queueReady).capacity.available>0;guard++) {
  let options=scriptProjectsReadModel(queueReady).commission
  let nextWriter=options.writers.find(w=>w.available)
  if (!nextWriter) {
    const hire=castingProjection(queueReady).board!.hiringCandidates.find(p=>p.role==='writer')
    assert(hire,'No public writer available to fill the committed queue fixture')
    queueAct({kind:'signContract',talentId:hire.talentId,termWeeks:hire.offers[0]!.termWeeks})
    options=scriptProjectsReadModel(queueReady).commission; nextWriter=options.writers.find(w=>w.available)
  }
  const nextConcept=options.concepts[0]!
  assert(nextWriter && nextConcept)
  queueAct({kind:'commissionScript',project:{conceptId:nextConcept.id,writerId:nextWriter.id,
    shape:{opening:'mysteryHook',midpoint:'revelation',ending:'bittersweet'},
    promise:{genre:nextConcept.genre,intendedSegments:['adult'],ranges:{intimacy:[-0.5,0.5],tonalWeight:[-0.5,0.5],kineticEnergy:[-0.5,0.5]}}}})
}
assert.equal(scriptProjectsReadModel(queueReady).capacity.available,0)
const queueConversion=castingDraftToEngine(queueReady,draft)
assert(queueConversion.ok)
const queueOutcome=queueConversion.apply(queueReady)
assert(queueOutcome.ok)
assert.equal(queueOutcome.next.studio.cash,queueReady.studio.cash)
assert.equal(queueOutcome.next.studio.activeProductions.length,queueReady.studio.activeProductions.length)
assert.equal(queueOutcome.next.productionQueue.length,queueReady.productionQueue.length+1)
add('s15-p11-greenlight-queue-ready','ready-queued-greenlight','firstFilm',queueReady,
  'Ready script-0001 has acknowledged camera tests, while real newly commissioned screenplay work occupies all Development & Casting slots. Greenlight is legal as an intent: its quote and commit change no Cash or production identity until admission.',queueTrace)

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
      firstCompleteWeek: finance.firstCompleteWeek, coverageNotice: finance.coverageNotice,
      portfolio: finance.portfolio.rows.map(r=>({id:r.id,projectId:r.projectId,productionId:r.productionId,title:r.title,phase:r.phase,commitmentState:r.commitmentState,hasDecisionOrBlocker:r.hasDecisionOrBlocker})),
      upcoming: finance.upcoming.windows.map(w=>({windowWeeks:w.windowWeeks,rows:w.rows.map(r=>({id:r.id,week:r.week,kind:r.kind})),remainingRows:w.remainingRows})),
      historyWindows: finance.history.windows.map(w=>({windowWeeks:w.windowWeeks,pointCount:w.points.length,coverage:w.period?.coverage??null})) },
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
