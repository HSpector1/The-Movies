import { openBridgeCheckpointStore } from '../../bridge/runtime/checkpoint-store.ts'
import { createBridgeRuntimeCoordinator } from '../../bridge/runtime/runtime-coordinator.ts'
import { CAMPAIGN_LIBRARY_MAX_BYTES, initialCampaignLibrary, encodeCampaignLibrary } from '../../bridge/runtime/campaign-library.ts'
import { DEFAULT_BRIDGE_RUNTIME_CHECKPOINT_LIMITS } from '../../bridge/runtime-checkpoint.ts'
import { BridgeSession } from '../../bridge/session.ts'
import { PROTOCOL_VERSION, SCHEMA_ID } from '../../bridge/protocol.ts'
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'

const [directory, savePath] = process.argv.slice(2)
mkdirSync(directory, { recursive: true })
const sha = value => createHash('sha256').update(value).digest('hex')
const assert = (value, message) => { if (!value) throw new Error(message) }
const report = { startedAt: new Date().toISOString(), completed: false,
  qualification: 'One actual generated-endurance campaign library load, snapshot and durable Save preflight. Functional result only; no performance sample, p95 or quiet-window claim.', errors: [] }
const root = directory + '/runtime', checkpointPath = root + '/bridge-runtime-v1.json'
mkdirSync(root, { recursive: true, mode: 0o700 })
let store = null, coordinator = null
try {
  const save = readFileSync(savePath, 'utf8')
  report.input = { savePath, bytes: Buffer.byteLength(save), sha256: sha(save) }
  const session = BridgeSession.fromSaveJson(save)
  const originalCheckpoint = session.exportRuntimeCheckpointEncoded(DEFAULT_BRIDGE_RUNTIME_CHECKPOINT_LIMITS).encoded
  // Exercise the real single-profile import into a named library. The original
  // generated checkpoint is retained by that existing production conversion.
  const seed = await encodeCampaignLibrary(initialCampaignLibrary(session, DEFAULT_BRIDGE_RUNTIME_CHECKPOINT_LIMITS, originalCheckpoint))
  store = await openBridgeCheckpointStore(checkpointPath, { runtimeRoot: root, maxBytes: CAMPAIGN_LIBRARY_MAX_BYTES })
  await store.writeAtomic(seed)
  coordinator = await createBridgeRuntimeCoordinator({ store, campaigns: { durable: true, regime: 'endowed' }, fatal: error => report.errors.push({ fatal: String(error) }) })
  const snapshot = await coordinator.read(value => value.snapshot())
  const catalogue = await coordinator.campaignLibrary()
  assert(snapshot.gameWeek === 6240 && catalogue.campaigns.length === 1, 'Unexpected endurance authority')
  const response = await coordinator.campaign({ protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID,
    commandId: 'p13a-endurance-preflight-save', sessionId: catalogue.sessionId, expectedStateRevision: catalogue.stateRevision,
    expectedCatalogueRevision: catalogue.catalogueRevision, expectedActiveCampaignId: catalogue.activeCampaignId,
    type: 'campaign', operation: 'save', campaignId: null, label: null, overwriteCampaignId: null, confirmDestructive: false, unsavedDisposition: 'requireClean' })
  assert(response.accepted && response.stateDigest === snapshot.stateDigest && response.gameWeek === snapshot.gameWeek, 'Preflight Save rejected or changed world')
  report.authority = { gameWeek: snapshot.gameWeek, stateDigest: snapshot.stateDigest, acceptedSave: response.accepted, catalogueRevision: response.catalogueRevision }
  report.completed = true
} catch (error) { report.errors.push({ message: error.message, stack: error.stack }); process.exitCode = 1 }
finally {
  try { if (coordinator) await coordinator.close(); else if (store) await store.close() } catch (error) { report.errors.push({ cleanup: String(error) }); report.completed = false; process.exitCode = 1 }
  report.finishedAt = new Date().toISOString(); report.lockAbsent = !existsSync(checkpointPath + '.lock')
  writeFileSync(directory + '/preflight-report.json', JSON.stringify(report, null, 2)); console.log(JSON.stringify(report))
}
