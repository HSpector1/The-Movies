import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { BridgeSession } from '../bridge/session.ts'
import { SCHEMA_ID } from '../bridge/protocol.ts'
import { DEFAULT_BRIDGE_RUNTIME_CHECKPOINT_LIMITS, loadBridgeRuntimeCheckpoint } from '../bridge/runtime-checkpoint.ts'
import { initialCampaignLibrary, encodeCampaignLibrary, loadCampaignLibrary, type CampaignLibrary } from '../bridge/runtime/campaign-library.ts'

// Review setup only. Every world is an unchanged, previously generated engine checkpoint.
// The authored labels and minted storage UUIDs are not evidence of player Save As actions.
const scenarios = [
  ['research-active', '01 Funded research', '151c8c14e1ec6f33a9d8f91c4049af00f53c15da1b11bd82e471b194923d1cff', 261],
  ['research-complete', '02 Invention ready', 'c211d7a08cc87e672965f4d8cf8fdf48a27282a624f7c0a30871030b4ea6abc8', 303],
  ['production-choice', '03 First sound film choice', 'e9fb1d326653419b4bcd92e4e29ffdb99f83b26c701a149857c7eda87425c9f3', 315],
  ['sound-filming', '04 Sound filming locked', '99b69cb59cd4fd57bf1112089bd4bfc8175ef87b16e12400f5340887333e3db4', 319],
  ['commercial-entry', '05 Commercial sound without a Lab', '95e2f20c69e4bc83242a1f4f9e1a96c6ce8eb3bb493a36d4660ac30d40ea6c94', 416],
  ['research-entry', '06 Hire your Scientist', '43dd8df76be4f86c5a7c42904ba01488001a10c4554828d939daf3c9769ed226', 260],
  ['early', '07 Early Laboratory', '38734468eeb69f4ee998f0006b7599d60e3eceb3ecd6cb98454271119ebe224b', 12],
] as const
const directory = resolve(process.argv[2] ?? 'artifacts/p13a/review-library')
const checkpoint = resolve(directory, 'generated-review-library.json')
const manifestPath = resolve(directory, 'manifest.json')
if (existsSync(checkpoint) || existsSync(manifestPath)) throw new Error('Review fixture already exists; immutable output will not be overwritten')
const sha = (value: string) => createHash('sha256').update(value).digest('hex')
const limits = DEFAULT_BRIDGE_RUNTIME_CHECKPOINT_LIMITS
let library: CampaignLibrary | undefined
const sources: { scenario: string; label: string; path: string; sha256: string; bytes: number; manifestSha256: string; recordId: string; week: number; stateDigest: string }[] = []
for (const [scenario, label, expectedSha256, expectedWeek] of scenarios) {
  const path = resolve('artifacts/p13a', scenario, 'generated-laboratory.checkpoint.json')
  const original = readFileSync(path, 'utf8')
  const provenanceBytes = readFileSync(resolve('artifacts/p13a', scenario, 'manifest.json'), 'utf8')
  const provenance = JSON.parse(provenanceBytes)
  if (provenance.kind !== 'p13a-generated-evidence/v1' || provenance.source !== 'live engine generated fixture; no user campaign input'
    || provenance.checkpoint !== path || provenance.sha256 !== sha(original) || provenance.sha256 !== expectedSha256
    || provenance.bytes !== Buffer.byteLength(original) || provenance.week !== expectedWeek
    || provenance.schemaId !== SCHEMA_ID || (provenance.scenario !== undefined && provenance.scenario !== scenario)) throw new Error('Original generated fixture provenance does not match: ' + scenario)
  const session = BridgeSession.fromRuntimeCheckpoint(loadBridgeRuntimeCheckpoint(original, limits).hydrated, limits)
  const minted = initialCampaignLibrary(session, limits, original)
  // The earliest immutable manifests predate the optional scenario/digest metadata.
  // Every source is pinned above and its embedded digest is validated by the production loader.
  if (minted.records.length !== 1 || minted.records[0]!.checkpointJson !== original || session.gameState.market.tick !== expectedWeek
    || session.snapshot().stateDigest !== JSON.parse(original).currentStateDigest
    || (provenance.stateDigest !== undefined && session.snapshot().stateDigest !== provenance.stateDigest)) {
    throw new Error('Review setup changed the actual generated checkpoint: ' + scenario)
  }
  const record = { ...minted.records[0]!, label }
  if (!library) library = { ...minted, records: [record] }
  else library.records.push(record)
  sources.push({ scenario, label, path, sha256: sha(original), bytes: Buffer.byteLength(original), manifestSha256: sha(provenanceBytes),
    recordId: record.id, week: session.gameState.market.tick, stateDigest: session.snapshot().stateDigest })
}
if (!library || new Set(library.records.map(record => record.id)).size !== scenarios.length) throw new Error('Missing or duplicate generated review records')
const encoded = await encodeCampaignLibrary(library)
const checked = loadCampaignLibrary(encoded, limits)
if (checked.changed || checked.library.records.length !== scenarios.length) throw new Error('Review library is not already canonical')
for (const source of sources) {
  const record = checked.library.records.find(row => row.id === source.recordId)
  if (!record || sha(record.checkpointJson) !== source.sha256 || record.label !== source.label) throw new Error('Review library changed a source record')
}
const manifest = {
  kind: 'p13a-generated-evidence/v1', source: 'live engine generated fixture; no user campaign input', scenario: 'review-library',
  method: 'Seven unchanged previously generated engine checkpoints. Current initialCampaignLibrary mints storage UUIDs; only catalogue labels and record collection are authored. Full production loadCampaignLibrary validation preserves each exact source checkpoint. No player campaign operation is claimed by this setup.',
  checkpoint, sha256: sha(encoded), bytes: Buffer.byteLength(encoded), schemaId: SCHEMA_ID, saveVersion: 20,
  activeCampaignId: library.activeCampaignId, week: checked.session.gameState.market.tick, stateDigest: checked.session.snapshot().stateDigest,
  sources, generatorSha256: sha(readFileSync(resolve('scripts/p13a-generate-review-library.ts'), 'utf8')),
}
mkdirSync(directory, { recursive: true })
writeFileSync(checkpoint, encoded, { flag: 'wx' })
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', { flag: 'wx' })
console.log(JSON.stringify(manifest, null, 2))
