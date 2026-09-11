import { openBridgeCheckpointStore } from '../../bridge/runtime/checkpoint-store.ts'
import { createBridgeRuntimeCoordinator } from '../../bridge/runtime/runtime-coordinator.ts'
import { CAMPAIGN_LIBRARY_MAX_BYTES } from '../../bridge/runtime/campaign-library.ts'
import { PROTOCOL_VERSION, SCHEMA_ID } from '../../bridge/protocol.ts'
import { Session } from 'node:inspector'
import { performance } from 'node:perf_hooks'
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { cpus, totalmem, platform, release, arch } from 'node:os'

const [directory, seedPath] = process.argv.slice(2)
mkdirSync(directory, { recursive: true })
const sha = value => createHash('sha256').update(value).digest('hex')
const assert = (value, message) => { if (!value) throw new Error(message) }
const seed = readFileSync(seedPath, 'utf8')
const report = { startedAt: new Date().toISOString(), completed: false, errors: [], phases: [], calls: [],
  input: { seedPath, bytes: Buffer.byteLength(seed), sha256: sha(seed) },
  runtime: { node: process.version, execArgv: process.execArgv },
  hardware: { platform: platform(), release: release(), arch: arch(), cpu: cpus()[0]?.model, logicalCpus: cpus().length, totalMemoryBytes: totalmem() },
  method: 'Diagnosis only: one unprofiled warmup load+Save then one CPU-profiled real load-ready+Save, each reset to identical retained generated three-record library bytes. Same production store/coordinator boundary as retained sampler. V8 CPU sampling1000us; wrapper timings on public store operations and coordinator/snapshot phases only. No runtime source changes, no acceptance percentiles, no HTTP/worker/native input measurement. Profile instrumentation adds overhead; inclusive costs overlap and must not be summed.' }
const root = directory + '/runtime', checkpoint = root + '/bridge-runtime-v1.json'
mkdirSync(root, { recursive: true, mode: 0o700 })
const inspector = new Session(); inspector.connect()
const post = (method, params = {}) => new Promise((resolve, reject) => inspector.post(method, params, (error, result) => error ? reject(error) : resolve(result)))
let phase = 'setup', store = null, coordinator = null
const call = async (name, fn) => { const start = performance.now(); try { return await fn() } finally { report.calls.push({ phase, name, elapsedMs: performance.now() - start }) } }
const open = async () => {
  const owned = await call('store.open', () => openBridgeCheckpointStore(checkpoint, { runtimeRoot: root, maxBytes: CAMPAIGN_LIBRARY_MAX_BYTES }))
  return { checkpointPath: owned.checkpointPath,
    read: () => call('store.read', () => owned.read()),
    writeAtomic: value => call('store.writeAtomic', () => owned.writeAtomic(value)),
    close: () => call('store.close', () => owned.close()) }
}
const cpuSummary = profile => {
  const nodes = new Map(profile.nodes.map(node => [node.id, node])), parent = new Map()
  for (const node of profile.nodes) for (const child of node.children ?? []) parent.set(child, node.id)
  const totals = new Map(), keyFor = node => JSON.stringify([node.callFrame.functionName, node.callFrame.url, node.callFrame.lineNumber, node.callFrame.columnNumber])
  const rowFor = node => { const key = keyFor(node); let row = totals.get(key); if (!row) { row = { ...node.callFrame, selfMs: 0, inclusiveMs: 0, leafSamples: 0 }; totals.set(key, row) } return row }
  for (let i = 0; i < (profile.samples?.length ?? 0); i++) {
    const duration = (profile.timeDeltas?.[i] ?? 0) / 1000, leaf = nodes.get(profile.samples[i]); if (!leaf) continue
    const row = rowFor(leaf); row.selfMs += duration; row.leafSamples++
    let id = leaf.id; const counted = new Set()
    while (id !== undefined) { const node = nodes.get(id); if (!node) break; const key = keyFor(node); if (!counted.has(key)) { rowFor(node).inclusiveMs += duration; counted.add(key) } id = parent.get(id) }
  }
  const rows = [...totals.values()]
  return { durationMs: (profile.endTime - profile.startTime) / 1000, sampledMs: (profile.timeDeltas ?? []).reduce((a,b) => a+b,0)/1000, samples: profile.samples?.length ?? 0,
    bySelf: rows.slice().sort((a,b) => b.selfMs-a.selfMs), byInclusive: rows.slice().sort((a,b) => b.inclusiveMs-a.inclusiveMs) }
}
const measured = async (name, profiled, fn) => {
  phase = name
  if (profiled) await post('Profiler.start')
  const before = process.memoryUsage(), start = performance.now()
  let value
  try { value = await fn() }
  finally {
    const elapsedMs = performance.now() - start, after = process.memoryUsage()
    const row = { name, profiled, elapsedMs, memoryBefore: before, memoryAfter: after }
    if (profiled) { const { profile } = await post('Profiler.stop'); const file = name + '.cpuprofile'; writeFileSync(directory + '/' + file, JSON.stringify(profile)); row.profileFile = file; row.cpu = cpuSummary(profile) }
    report.phases.push(row); writeFileSync(directory + '/profile-progress.json', JSON.stringify(report, null, 2)); console.log(JSON.stringify({ name, profiled, elapsedMs }))
  }
  return value
}
try {
  await post('Profiler.enable'); await post('Profiler.setSamplingInterval', { interval: 1000 })
  let authority = null
  for (const profiled of [false, true]) {
    phase = 'reset'; store = await open(); await store.writeAtomic(seed); await store.close(); store = null
    const prefix = profiled ? '' : 'warmup-'
    const snapshot = await measured(prefix+'load-ready', profiled, async () => {
      store = await open()
      coordinator = await call('coordinator.recovery', () => createBridgeRuntimeCoordinator({ store, campaigns: { durable: true, regime: 'endowed' }, fatal: error => report.errors.push({ fatal: String(error) }) }))
      return call('coordinator.firstSnapshot', () => coordinator.read(session => session.snapshot()))
    })
    authority ??= { week: snapshot.gameWeek, digest: snapshot.stateDigest }
    assert(snapshot.gameWeek === 6240 && snapshot.stateDigest === authority.digest, 'Loaded authority changed')
    phase = 'catalogue'; const catalogue = await coordinator.campaignLibrary()
    assert(catalogue.campaigns.length === 3, 'Expected three retained records')
    const saved = await measured(prefix+'complete-save', profiled, () => coordinator.campaign({ protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID,
      commandId: 'p13a-correction-cpu-save', sessionId: catalogue.sessionId, expectedStateRevision: catalogue.stateRevision,
      expectedCatalogueRevision: catalogue.catalogueRevision, expectedActiveCampaignId: catalogue.activeCampaignId,
      type: 'campaign', operation: 'save', campaignId: null, label: null, overwriteCampaignId: null, confirmDestructive: false, unsavedDisposition: 'requireClean' }))
    assert(saved.accepted && saved.stateDigest === authority.digest && saved.gameWeek === 6240 && saved.catalogueRevision === catalogue.catalogueRevision+1, 'Save changed or refused authority')
    phase = 'verification'; const after = await coordinator.campaignLibrary()
    for (const prior of catalogue.campaigns) { const next = after.campaigns.find(row => row.id === prior.id); assert(next.revision === prior.revision + (prior.id === catalogue.activeCampaignId ? 1 : 0) && JSON.stringify({ ...next, revision: prior.revision }) === JSON.stringify(prior), 'Unexpected record change') }
    if (profiled) report.membershipCounts = await coordinator.read(session => {
      const state = session.gameState
      if (!state.technology) return { technologyPresent: false }
      let historicalSearches = 0, filmPredicateVisits = 0
      for (const p of state.technology.productions) {
        if (p.studioId === state.hollywood.playerStudioId) continue
        const business = state.hollywood.businesses.find(b => b.studioId === p.studioId)
        if (business?.productions.some(f => f.id === p.productionId)) continue
        historicalSearches++
        for (const film of state.hollywood.films) { filmPredicateVisits++; if (film.studioId === p.studioId && film.filmId === p.productionId) break }
      }
      return { technologyPresent: true, technologyProductions: state.technology.productions.length, hollywoodFilms: state.hollywood.films.length, historicalSearches, filmPredicateVisits,
        qualification: 'Exact read-only count of the stopped validateTechnology historical membership short-circuit algorithm on this generated state, outside timed/profiled phases. This is predicate visits per validation, not a count of validation calls.' }
    })
    phase = 'cleanup'; await coordinator.close(); coordinator = null; store = null
    assert(!existsSync(checkpoint + '.lock'), 'Owned lock remains')
  }
  assert(sha(readFileSync(seedPath)) === report.input.sha256, 'Original generated fixture changed')
  report.authority = authority; report.completed = true
} catch (error) { report.errors.push({ message: error.message, stack: error.stack }); process.exitCode = 1 }
finally {
  try { if (coordinator) await coordinator.close(); else if (store) await store.close() } catch (error) { report.errors.push({ cleanup: String(error) }); process.exitCode = 1; report.completed = false }
  inspector.disconnect(); report.finishedAt = new Date().toISOString(); report.lockAbsent = !existsSync(checkpoint + '.lock')
  writeFileSync(directory + '/profile-report.json', JSON.stringify(report, null, 2)); console.log(JSON.stringify({ completed: report.completed, phases: report.phases.map(({ name, elapsedMs }) => ({name,elapsedMs})), membershipCounts: report.membershipCounts, errors: report.errors }))
}
