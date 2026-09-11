import { BridgeSession } from '../../bridge/session.ts'
import { initialCampaignLibrary, encodeCampaignLibrary, loadCampaignLibrary, CAMPAIGN_LIBRARY_MAX_BYTES, CAMPAIGN_LIBRARY_MAX_RECORDS } from '../../bridge/runtime/campaign-library.ts'
import { DEFAULT_BRIDGE_RUNTIME_CHECKPOINT_LIMITS } from '../../bridge/runtime-checkpoint.ts'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
const [directory, acceptedDirectory] = process.argv.slice(2)
mkdirSync(directory, { recursive: true })
const sha = value => createHash('sha256').update(value).digest('hex')
const assert = (value, message) => { if (!value) throw new Error(message) }
const report = { startedAt: new Date().toISOString(), completed: false,
  method: 'Generated fixture assembly at exact accepted592e926: each storage UUID and checkpoint is minted by initialCampaignLibrary from an actual generated accepted save. Only truthful labels and the bounded record collection are authored for this fixture. The complete assembled library is validated by accepted loadCampaignLibrary. No player action or user campaign is claimed.',
  inputs: [], records: [], errors: [] }
try {
  const raw = Object.fromEntries([6240, 316].map(week => {
    const text = readFileSync(acceptedDirectory + '/week-' + week + '.save.json', 'utf8')
    const save = JSON.parse(text)
    assert(save.saveVersion === 19 && save.state.market.tick === week, 'Wrong accepted source stage')
    report.inputs.push({ week, bytes: Buffer.byteLength(text), sha256: sha(text) })
    return [week, text]
  }))
  let library
  const records = []
  for (let i = 0; i < CAMPAIGN_LIBRARY_MAX_RECORDS; i++) {
    const week = i === 0 ? 6240 : 316
    const session = BridgeSession.fromSaveJson(raw[week])
    const original = session.exportRuntimeCheckpointEncoded(DEFAULT_BRIDGE_RUNTIME_CHECKPOINT_LIMITS).encoded
    const minted = initialCampaignLibrary(session, DEFAULT_BRIDGE_RUNTIME_CHECKPOINT_LIMITS, original)
    assert(minted.records.length === 1, 'Expected one exact generated recovered record')
    const record = { ...minted.records[0], label: 'Generated accepted week ' + week + ' record ' + String(i + 1).padStart(2, '0') }
    records.push(record)
    report.records.push({ id: record.id, label: record.label, week, checkpointBytes: Buffer.byteLength(record.checkpointJson), checkpointSha256: sha(record.checkpointJson) })
    library ??= minted
  }
  library = { ...library, records }
  assert(new Set(records.map(record => record.id)).size === 32, 'Storage identities must be distinct')
  const encoded = await encodeCampaignLibrary(library)
  const checked = loadCampaignLibrary(encoded, DEFAULT_BRIDGE_RUNTIME_CHECKPOINT_LIMITS)
  assert(!checked.changed && checked.library.records.length === 32, 'Accepted library must already be canonical')
  const decodedBytes = [library.workingCheckpointJson, library.legacyCheckpointJson ?? '', ...records.map(record => record.checkpointJson)].reduce((total, text) => total + Buffer.byteLength(text), 0)
  assert(decodedBytes <= 1024 * 1024 * 1024 && Buffer.byteLength(encoded) <= CAMPAIGN_LIBRARY_MAX_BYTES, 'Fixture exceeds unchanged storage bounds')
  report.library = { encodedBytes: Buffer.byteLength(encoded), decodedCheckpointBytes: decodedBytes, sha256: sha(encoded), records: 32,
    encodedLimitBytes: CAMPAIGN_LIBRARY_MAX_BYTES, decodedLimitBytes: 1024 * 1024 * 1024,
    activeCampaignId: library.activeCampaignId, legacyCheckpointSha256: sha(library.legacyCheckpointJson),
    qualification: 'One retained legacy-original checkpoint and one working checkpoint also count toward decoded aggregate bytes. This is one6240 plus31x316 stored records, not32x6240.' }
  writeFileSync(directory + '/accepted-library32.json', encoded)
  report.completed = true
} catch (error) { report.errors.push({ message: error.message, stack: error.stack }); process.exitCode = 1 }
finally { report.finishedAt = new Date().toISOString(); writeFileSync(directory + '/fixture-report.json', JSON.stringify(report, null, 2)); console.log(JSON.stringify(report)) }
