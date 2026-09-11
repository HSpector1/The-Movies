import { openBridgeCheckpointStore } from '../../bridge/runtime/checkpoint-store.ts'
import { createBridgeRuntimeCoordinator } from '../../bridge/runtime/runtime-coordinator.ts'
import { CAMPAIGN_LIBRARY_MAX_BYTES, initialCampaignLibrary, encodeCampaignLibrary } from '../../bridge/runtime/campaign-library.ts'
import { DEFAULT_BRIDGE_RUNTIME_CHECKPOINT_LIMITS } from '../../bridge/runtime-checkpoint.ts'
import { BridgeSession } from '../../bridge/session.ts'
import { PROTOCOL_VERSION, SCHEMA_ID } from '../../bridge/protocol.ts'
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { performance } from 'node:perf_hooks'
import { setImmediate as yieldNow } from 'node:timers/promises'
import { cpus, totalmem, platform, release, arch } from 'node:os'
import { getHeapStatistics } from 'node:v8'

const [directory] = process.argv.slice(2)
const sha = value => createHash('sha256').update(value).digest('hex')
const assert = (value, message) => { if (!value) throw new Error(message) }
const report = { startedAt: new Date().toISOString(), completed: false, warmups: 3, repetitions: 20,
  retainedP12CompleteSaveP95Ms: 9577.754,
  percentile: 'nearest-rank observed p95 (sorted index ceil(.95*n)-1), empirical n20, no population guarantee',
  runtime: { node: process.version, executable: process.execPath, execArgv: process.execArgv, nodeOptionsPresent: !!process.env.NODE_OPTIONS },
  hardware: { platform: platform(), release: release(), arch: arch(), cpu: cpus()[0]?.model, logicalCpus: cpus().length, totalMemoryBytes: totalmem(), heapSizeLimit: getHeapStatistics().heap_size_limit },
  qualification: [
    'Retained production store/coordinator complete-Save sampler boundary. Standalone private process; excludes HTTP, worker postMessage, Unity/native input and engine-main placement.',
    'Each sample starts from identical generated three-record library bytes. Records were created by actual save/saveAs commands from the same generated6240-week world; this is not the retained8794-week historical three-record workload.',
    'Load-ready starts before store ownership acquisition and includes coordinator recovery and first production snapshot; excludes worker startup/message transport. Ordinary OS page cache; no cold-start claim.',
    'Complete Save starts at coordinator.campaign and ends at accepted durable response. Includes strict proposal/fork, production compression/encoding and atomic durable write; excludes prior catalogue read and later verification.',
    'No forced GC, heap flags, cache clearing or optimization. Memory endpoints are samples; OS high-water reported separately. Parent task may run other checks on the same machine; raw wall-clock samples are not isolated CPU attribution.',
    'No native frame performance or input responsiveness claim. All P12 original misses and unmeasured stress/transport qualifications remain open.' ],
  setup: [], loadReady: { warmups: [], samples: [] }, campaignSave: { warmups: [], samples: [] }, errors: [] }
const persist = () => writeFileSync(directory + '/store-progress.json', JSON.stringify(report, null, 2))
const measured = async fn => { const before = process.memoryUsage(), start = performance.now(), value = await fn(), elapsedMs = performance.now() - start, after = process.memoryUsage(); return { value, elapsedMs, heapBefore: before.heapUsed, heapAfter: after.heapUsed, rssBefore: before.rss, rssAfter: after.rss } }
const summary = phase => { const v = phase.samples.map(row => row.elapsedMs).sort((a,b) => a-b); return { n: v.length, medianMs: (v[(v.length-1)>>1]+v[v.length>>1])/2, p95Ms: v[Math.ceil(.95*v.length)-1], maxMs: v.at(-1), minMs: v[0] } }
const collect = (name, i, row) => { const { value, ...sample } = row; report[name][i < 0 ? 'warmups' : 'samples'].push({ sample: i < 0 ? i + 3 : i, ...sample }); persist(); console.log(JSON.stringify({ phase: name, sample: i, elapsedMs: sample.elapsedMs })) }
const root = directory + '/runtime', checkpoint = root + '/bridge-runtime-v1.json'
mkdirSync(root, { recursive: true, mode: 0o700 })
const openStore = () => openBridgeCheckpointStore(checkpoint, { runtimeRoot: root, maxBytes: CAMPAIGN_LIBRARY_MAX_BYTES })
let store = null, coordinator = null
const request = (catalogue, id, operation = 'save', label = null) => ({ protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID,
  commandId: id, sessionId: catalogue.sessionId, expectedStateRevision: catalogue.stateRevision,
  expectedCatalogueRevision: catalogue.catalogueRevision, expectedActiveCampaignId: catalogue.activeCampaignId,
  type: 'campaign', operation, campaignId: null, label, overwriteCampaignId: null, confirmDestructive: false, unsavedDisposition: 'requireClean' })
try {
  const save = readFileSync(directory + '/week-6240.save.json', 'utf8')
  report.save = { bytes: Buffer.byteLength(save), sha256: sha(save) }
  const session = BridgeSession.fromSaveJson(save)
  const initial = await encodeCampaignLibrary(initialCampaignLibrary(session, DEFAULT_BRIDGE_RUNTIME_CHECKPOINT_LIMITS, null))
  store = await openStore(); await store.writeAtomic(initial)
  coordinator = await createBridgeRuntimeCoordinator({ store, campaigns: { durable: true, regime: 'endowed' }, fatal: error => report.errors.push({ fatal: String(error) }) })
  for (let i = 0; i < 3; i++) {
    const catalogue = await coordinator.campaignLibrary()
    const response = await coordinator.campaign(request(catalogue, 'generated-library-record-' + i, 'saveAs', 'Generated endurance ' + (i + 1)))
    assert(response.accepted, 'Generated library record refused: ' + response.reasonCode)
  }
  const seed = await store.read()
  report.library = { bytes: Buffer.byteLength(seed), sha256: sha(seed), catalogue: await coordinator.campaignLibrary() }
  assert(report.library.catalogue.campaigns.length === 3, 'Expected three actual named campaign records')
  writeFileSync(directory + '/fixed-generated-library.json', seed)
  await coordinator.close(); coordinator = null; store = null
  let authority = null
  for (let i = -3; i < 20; i++) {
    const reset = await measured(async () => { store = await openStore(); await store.writeAtomic(seed); assert(sha(readFileSync(checkpoint)) === report.library.sha256, 'Seed reset changed bytes'); await store.close(); store = null })
    report.setup.push({ sample: i, resetMs: reset.elapsedMs })
    const loading = await measured(async () => { store = await openStore(); coordinator = await createBridgeRuntimeCoordinator({ store, campaigns: { durable: true, regime: 'endowed' }, fatal: error => report.errors.push({ fatal: String(error) }) }); return coordinator.read(s => s.snapshot()) })
    const snapshot = loading.value
    authority ??= { gameWeek: snapshot.gameWeek, stateDigest: snapshot.stateDigest }
    assert(snapshot.gameWeek === 6240 && snapshot.stateDigest === authority.stateDigest, 'Loaded authority changed')
    collect('loadReady', i, loading)
    const catalogue = await coordinator.campaignLibrary()
    const saving = await measured(() => coordinator.campaign(request(catalogue, 'generated-complete-save-' + (i + 3))))
    assert(saving.value.accepted, 'Save refused: ' + saving.value.reasonCode)
    assert(saving.value.gameWeek === 6240 && saving.value.stateDigest === authority.stateDigest, 'Save changed authoritative state')
    assert(saving.value.catalogueRevision === catalogue.catalogueRevision + 1, 'Save catalogue revision mismatch')
    const after = await coordinator.campaignLibrary()
    for (const before of catalogue.campaigns) {
      const row = after.campaigns.find(entry => entry.id === before.id)
      assert(JSON.stringify({ ...row, revision: before.revision }) === JSON.stringify(before), 'Unexpected campaign metadata change')
      assert(row.revision === before.revision + (before.id === catalogue.activeCampaignId ? 1 : 0), 'Wrong campaign revision')
    }
    collect('campaignSave', i, { ...saving, checkpointBytes: statSync(checkpoint).size, checkpointSha256: sha(readFileSync(checkpoint)) })
    await coordinator.close(); coordinator = null; store = null
    assert(!existsSync(checkpoint + '.lock'), 'Owned store left lock')
    await yieldNow()
  }
  report.authority = authority; report.completed = true
} catch (error) { report.errors.push({ message: error.message, stack: error.stack }); process.exitCode = 1 }
finally {
  try { if (coordinator) await coordinator.close(); else if (store) await store.close() } catch (error) { report.errors.push({ cleanup: String(error) }); report.completed = false; process.exitCode = 1 }
  report.finishedAt = new Date().toISOString(); report.lockAbsent = !existsSync(checkpoint + '.lock')
  report.memory = { ...process.memoryUsage(), highWaterRssKiB: process.resourceUsage().maxRSS }
  for (const name of ['loadReady', 'campaignSave']) report[name].summary = summary(report[name])
  persist(); writeFileSync(directory + '/store-report.json', JSON.stringify(report, null, 2)); console.log(JSON.stringify({ completed: report.completed, loadReady: report.loadReady.summary, campaignSave: report.campaignSave.summary, errors: report.errors }))
}
