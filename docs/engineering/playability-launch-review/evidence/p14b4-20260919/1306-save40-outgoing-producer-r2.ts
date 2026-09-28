// 1306: genuine outgoing Save40 inputs for the R2/R3 Save41 increment (1305-A/F), minted at the last Save40
// writer before the writer moves. Parent executes once under the bounded recorder and guards; no rehearsal,
// seed search, state surgery or retry. Reads no fixture payload; writes only its own new output directory.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gunzipSync, gzipSync } from 'node:zlib'
import { PROJECTION_VERSION, SCHEMA_ID } from '../../../../../bridge/protocol.ts'
import { advanceTo, p13aGeneratedStudio } from '../../../../../src/harness/p13a/fixtures.ts'
import { applyActions } from '../../../../../src/core/actions.ts'
import { hiringMarketIds } from '../../../../../src/core/employment.ts'
import { commitPlacement } from '../../../../../src/core/placement.ts'
import { RIVAL_RESEARCH_RECEIPT_KINDS } from '../../../../../src/core/hollywoodTypes.ts'
import type { GameState } from '../../../../../src/core/types.ts'
import { exportSave, importSave, LIVE_SAVE_VERSION, makeSave, validateSaveV40 } from '../../../../../src/core/save.ts'

const ROOT = fileURLToPath(new URL('../../../../../', import.meta.url))
const OUTPUT = 'tests/fixtures/p14/genuine-v40-pre-r3'
// Week 110: one genuine public player sign (week 0, first Actor in the hiring market, 208 weeks) and release
// (week 60, unseated), so the player's existing ledger `termination` coexists with rival finance (1306-B change 2).
function playerReleaseRoute(): GameState {
  let state = p13aGeneratedStudio('r3-outgoing-v40-01')
  const actorId = hiringMarketIds(state, 0).find(id => state.talent.find(t => t.id === id)?.role === 'actor')
  assert.ok(actorId !== undefined, 'route premise: an Actor in the week-0 hiring market')
  state = applyActions(state, [{ kind: 'signContract', talentId: actorId, termWeeks: 208 }])
  state = applyActions(advanceTo(state, 60), [{ kind: 'releaseTalent', talentId: actorId }])
  return advanceTo(state, 110)
}
// Week 265: the measured S8 route exactly (tests/bridge-p13b-s8-rivals.test.ts:26-44): one player Research
// Laboratory committed at week 0, then natural advance (1306-B change 1).
function researchRoute(): GameState {
  return advanceTo(commitPlacement(p13aGeneratedStudio('p13b-s8-bridge-probe-01'),
    { blueprintId: 'research-laboratory', origin: { gx: 0, gy: 9 } }), 265)
}
const INPUTS = [
  { name: 'genuine-v40-r3-outgoing-week110', build: playerReleaseRoute,
    route: "p13aGeneratedStudio('r3-outgoing-v40-01'); week 0 signContract first hiring-market Actor 208 weeks; advanceTo(60); releaseTalent; advanceTo(110)" },
  { name: 'genuine-v40-r3-research-week265', build: researchRoute,
    route: "commitPlacement(p13aGeneratedStudio('p13b-s8-bridge-probe-01'), research-laboratory at gx0 gy9); advanceTo(265)" },
] as const
const id = (raw: string | Uint8Array) => ({ bytes: typeof raw === 'string' ? Buffer.byteLength(raw) : raw.byteLength,
  sha256: createHash('sha256').update(raw).digest('hex') })
const json = (value: unknown) => JSON.stringify(value, null, 2) + '\n'
const out = (path: string, data: string | Uint8Array) => writeFileSync(resolve(ROOT, path), data, { flag: 'wx' })

assert.equal(LIVE_SAVE_VERSION, 40, 'this producer is only valid while the live writer is Save40')
const head = process.env.P14_SAVE40_PRODUCER_HEAD ?? ''
assert.match(head, /^[0-9a-f]{40}$/, 'P14_SAVE40_PRODUCER_HEAD must name the published execution HEAD')
assert.equal(execFileSync('git', ['rev-parse', 'HEAD'], { cwd: ROOT, encoding: 'utf8' }).trim(), head, 'HEAD differs from P14_SAVE40_PRODUCER_HEAD')
assert.ok(!existsSync(resolve(ROOT, OUTPUT)), `refusing to overwrite ${OUTPUT}`)
mkdirSync(resolve(ROOT, OUTPUT), { recursive: false })

const rows = []
for (const input of INPUTS) {
  const started = Date.now()
  const state = input.build()
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
    playerTerminationLedgerRows: state.ledger.filter(row => row.kind === 'termination').length,
    playerTerminationReceipts: state.hollywood!.receipts.filter(r => r.kind === 'employment' && r.reason === 'termination' && r.studioId === state.hollywood!.playerStudioId).length,
    rivalResearchReceipts: Object.fromEntries(RIVAL_RESEARCH_RECEIPT_KINDS.map(kind => [kind, state.hollywood!.receipts.filter(r => r.kind === kind).length])),
    rivalTechnologyProjects: (state.technology?.projects ?? []).filter(p => p.studioId !== state.hollywood!.playerStudioId).length,
  }
  if (input.name.endsWith('week110')) assert.ok(facts.playerTerminationLedgerRows === 1 && facts.playerTerminationReceipts === 1, 'route premise: one player termination')
  if (input.name.endsWith('week265')) assert.ok(Object.values(facts.rivalResearchReceipts).every(n => n > 0) && facts.rivalTechnologyProjects > 0, 'route premise: measured S8 rival research facts')
  assert.equal(facts.rivalTerminationReceipts, 0, 'Save40 law admits no rival termination')
  out(`${OUTPUT}/${input.name}.json.gz`, gz)
  const provenance = {
    purpose: 'generated test campaigns only; never Owner saves', record: '1306', plan: ['1305-A', '1305-F'],
    producer: 'docs/engineering/playability-launch-review/evidence/p14b4-20260919/1306-save40-outgoing-producer-r2.ts',
    executionHead: head, saveVersion: LIVE_SAVE_VERSION, projectionVersion: PROJECTION_VERSION, schemaId: SCHEMA_ID,
    route: input.route,
    gzip: id(gz), decoded: id(raw), facts, elapsedMs: Date.now() - started,
  }
  out(`${OUTPUT}/${input.name}.provenance.json`, json(provenance))
  rows.push({ name: input.name, gzip: provenance.gzip, decoded: provenance.decoded, facts })
}
out(`${OUTPUT}/MANIFEST.json`, json({ purpose: 'generated test campaigns only; never Owner saves', record: '1306',
  executionHead: head, saveVersion: 40, inputs: rows }))
console.log(JSON.stringify({ output: OUTPUT, inputs: rows.map(r => ({ name: r.name, gzip: r.gzip, facts: r.facts })) }))
