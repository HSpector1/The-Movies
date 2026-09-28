// 1306: genuine outgoing Save40 inputs for the R2/R3 Save41 increment (1305-A/F), minted at the last Save40
// writer before the writer moves. Parent executes once under the bounded recorder and guards; no rehearsal,
// seed search, state surgery or retry. Reads no fixture payload; writes only its own new output directory.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gunzipSync, gzipSync } from 'node:zlib'
import { PROJECTION_VERSION, SCHEMA_ID } from '../../../../../bridge/protocol.ts'
import { advanceTo, p13aGeneratedStudio } from '../../../../../src/harness/p13a/fixtures.ts'
import { exportSave, importSave, LIVE_SAVE_VERSION, makeSave, validateSaveV40 } from '../../../../../src/core/save.ts'

const ROOT = fileURLToPath(new URL('../../../../../', import.meta.url))
const OUTPUT = 'tests/fixtures/p14/genuine-v40-pre-r3'
const INPUTS = [
  { name: 'genuine-v40-r3-outgoing-week110', seed: 'r3-outgoing-v40-01', week: 110 },
  { name: 'genuine-v40-r3-research-week265', seed: 'p13b-s8-bridge-probe-01', week: 265 },
] as const
const id = (raw: string | Uint8Array) => ({ bytes: typeof raw === 'string' ? Buffer.byteLength(raw) : raw.byteLength,
  sha256: createHash('sha256').update(raw).digest('hex') })
const json = (value: unknown) => JSON.stringify(value, null, 2) + '\n'
const out = (path: string, data: string | Uint8Array) => writeFileSync(resolve(ROOT, path), data, { flag: 'wx' })

assert.equal(LIVE_SAVE_VERSION, 40, 'this producer is only valid while the live writer is Save40')
const head = process.env.P14_SAVE40_PRODUCER_HEAD ?? ''
assert.match(head, /^[0-9a-f]{40}$/, 'P14_SAVE40_PRODUCER_HEAD must name the published execution HEAD')
assert.ok(!existsSync(resolve(ROOT, OUTPUT)), `refusing to overwrite ${OUTPUT}`)
mkdirSync(resolve(ROOT, OUTPUT), { recursive: false })

const rows = []
for (const input of INPUTS) {
  const started = Date.now()
  const state = advanceTo(p13aGeneratedStudio(input.seed), input.week)
  const raw = exportSave(validateSaveV40(makeSave(state)))
  assert.equal(exportSave(importSave(raw)), raw, 'current writer round trip')
  const gz = gzipSync(Buffer.from(raw, 'utf8'), { level: 9 })
  assert.equal(gunzipSync(gz).toString('utf8'), raw)
  const businesses = state.hollywood?.businesses ?? []
  assert.ok(businesses.length > 0, 'a Save40 R3 input needs entered rivals')
  const facts = {
    week: state.market.tick, rivals: businesses.length,
    financePeriods: businesses.map(b => ({ studioId: b.studioId, periods: b.account.periods.length })),
    activeRivalEmployment: state.hollywood!.activeEmploymentOrdinals.filter(i => state.hollywood!.employment[i]!.studioId !== state.hollywood!.playerStudioId).length,
    rivalTerminationReceipts: state.hollywood!.receipts.filter(r => r.kind === 'employment' && r.reason === 'termination' && r.studioId !== state.hollywood!.playerStudioId).length,
  }
  assert.equal(facts.rivalTerminationReceipts, 0, 'Save40 law admits no rival termination')
  out(`${OUTPUT}/${input.name}.json.gz`, gz)
  const provenance = {
    purpose: 'generated test campaigns only; never Owner saves', record: '1306', plan: ['1305-A', '1305-F'],
    producer: 'docs/engineering/playability-launch-review/evidence/p14b4-20260919/1306-save40-outgoing-producer.ts',
    executionHead: head, saveVersion: LIVE_SAVE_VERSION, projectionVersion: PROJECTION_VERSION, schemaId: SCHEMA_ID,
    route: `p13aGeneratedStudio('${input.seed}') then advanceTo(${String(input.week)}); no player action`,
    gzip: id(gz), decoded: id(raw), facts, elapsedMs: Date.now() - started,
  }
  out(`${OUTPUT}/${input.name}.provenance.json`, json(provenance))
  rows.push({ name: input.name, gzip: provenance.gzip, decoded: provenance.decoded, facts })
}
out(`${OUTPUT}/MANIFEST.json`, json({ purpose: 'generated test campaigns only; never Owner saves', record: '1306',
  executionHead: head, saveVersion: 40, inputs: rows }))
console.log(JSON.stringify({ output: OUTPUT, inputs: rows.map(r => ({ name: r.name, gzip: r.gzip, facts: r.facts })) }))
