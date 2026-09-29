// 1344-P: genuine outgoing Save42 inputs for the rival-shelving Save43 increment (1344-A/F), minted at the last Save42
// writer before the writer moves. Route: the natural stall measured in 1329-A (seed p13a-core-causal-01, ticks only).
// Parent executes once under the bounded recorder and guards; no rehearsal, seed search, state surgery or retry. Reads
// no fixture payload; writes only its own new output directory. Pattern: 1314-save41-casting-outgoing-producer-r2.ts.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gunzipSync, gzipSync } from 'node:zlib'
import { PROJECTION_VERSION, SCHEMA_ID } from '../../../../../bridge/protocol.ts'
import { p13aGeneratedStudio } from '../../../../../src/harness/p13a/fixtures.ts'
import { tick } from '../../../../../src/core/tick.ts'
import type { GameState } from '../../../../../src/core/types.ts'
import { exportSave, importSave, LIVE_SAVE_VERSION, makeSave, validateSaveV42 } from '../../../../../src/core/save.ts'

const ROOT = fileURLToPath(new URL('../../../../../', import.meta.url))
const OUTPUT = 'tests/fixtures/p14/genuine-v42-pre-shelving'
const SEED = 'p13a-core-causal-01'
const WEEKS = [100, 130] as const

const id = (raw: string | Uint8Array) => ({ bytes: typeof raw === 'string' ? Buffer.byteLength(raw) : raw.byteLength,
  sha256: createHash('sha256').update(raw).digest('hex') })
const json = (value: unknown) => JSON.stringify(value, null, 2) + '\n'
const out = (path: string, data: string | Uint8Array) => writeFileSync(resolve(ROOT, path), data, { flag: 'wx' })

assert.equal(LIVE_SAVE_VERSION, 42, 'this producer is only valid while the live writer is Save42')
const head = process.env.P14_SAVE42_PRODUCER_HEAD ?? ''
assert.match(head, /^[0-9a-f]{40}$/, 'P14_SAVE42_PRODUCER_HEAD must name the published execution HEAD')
assert.equal(execFileSync('git', ['rev-parse', 'HEAD'], { cwd: ROOT, encoding: 'utf8' }).trim(), head, 'HEAD differs from P14_SAVE42_PRODUCER_HEAD')
assert.ok(!existsSync(resolve(ROOT, OUTPUT)), `refusing to overwrite ${OUTPUT}`)

// Per-rival facts the shelving tests read: which screenplays are ready and active, and whether a production runs.
function rivalFacts(state: GameState) {
  return (state.hollywood?.businesses ?? []).map(b => ({
    studioId: b.studioId,
    cash: b.account.cash,
    productions: b.productions.length,
    activeScriptOrdinals: [...b.activeScriptOrdinals],
    statuses: b.development.projects.map(p => p.status),
    readyActive: b.activeScriptOrdinals.filter(i => b.development.projects[i]!.status === 'ready').length,
    films: state.hollywood!.films.filter(f => f.studioId === b.studioId).length,
  }))
}

const started = Date.now()
let state = p13aGeneratedStudio(SEED)
const captured: { week: number; state: GameState }[] = []
for (let week = 0; week <= WEEKS[WEEKS.length - 1]; week++) {
  if ((WEEKS as readonly number[]).includes(state.market.tick)) captured.push({ week: state.market.tick, state })
  if (week < WEEKS[WEEKS.length - 1]) state = tick(state)
}
assert.deepEqual(captured.map(c => c.week), [...WEEKS], 'route premise: both weeks reached by natural ticks')

mkdirSync(resolve(ROOT, OUTPUT), { recursive: false })
const rows = []
for (const { week, state: s } of captured) {
  const name = `genuine-v42-rival-stall-week-${week}`
  const raw = exportSave(validateSaveV42(makeSave(s)))
  assert.equal(exportSave(importSave(raw)), raw, 'current writer round trip')
  const gz = gzipSync(Buffer.from(raw, 'utf8'), { level: 9 })
  assert.equal(gunzipSync(gz).toString('utf8'), raw)
  const rivals = rivalFacts(s)
  const stalled = rivals.filter(r => r.productions === 0 && r.readyActive === 2 && r.activeScriptOrdinals.length === 2)
  const facts = { week: s.market.tick, rivals, stalledStudioIds: stalled.map(r => r.studioId),
    firstTakes: s.firstTakes.length, industryFilms: s.hollywood?.films.length ?? 0 }
  // 1329-A measured r01 holding two ready screenplays and no production from about week 110.
  if (week === 130) assert.ok(stalled.length >= 1, 'route premise: at week 130 a rival holds two ready screenplays and no production')
  out(`${OUTPUT}/${name}.json.gz`, gz)
  const provenance = {
    purpose: 'generated test campaigns only; never Owner saves', record: '1344', plan: ['1344-A', '1344-F'], finding: '1329-A',
    producer: 'docs/engineering/playability-launch-review/evidence/p14b4-20260919/1344-P-save42-rival-stall-producer.ts',
    executionHead: head, saveVersion: LIVE_SAVE_VERSION, projectionVersion: PROJECTION_VERSION, schemaId: SCHEMA_ID,
    route: `p13aGeneratedStudio('${SEED}'); natural ticks only; saved at week ${week}`, gzip: id(gz), decoded: id(raw), facts,
  }
  out(`${OUTPUT}/${name}.provenance.json`, json(provenance))
  rows.push({ name, gzip: provenance.gzip, decoded: provenance.decoded, facts: { week: facts.week, stalledStudioIds: facts.stalledStudioIds } })
}
out(`${OUTPUT}/MANIFEST.json`, json({ purpose: 'generated test campaigns only; never Owner saves', record: '1344',
  executionHead: head, saveVersion: 42, elapsedMs: Date.now() - started, inputs: rows }))
console.log(JSON.stringify({ output: OUTPUT, inputs: rows }))
