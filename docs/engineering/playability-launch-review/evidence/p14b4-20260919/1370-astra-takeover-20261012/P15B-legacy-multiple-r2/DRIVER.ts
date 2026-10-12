// Scratch-only second multi-closure premise attempt. NOT EXECUTED; parent schedules a frozen candidate.
// Prior late-import6273 pass is reused; prior r01 insufficient-debit failure is preserved.
// Labelled debit/film-cost transaction controls, never natural gameplay acceptance.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { performance } from 'node:perf_hooks'
import { applyActions } from '/Users/zacheryspector/studio-specialists/p15b/src/core/actions.ts'
import { importSave, makeSave, migrateToLive, stableStringify } from '/Users/zacheryspector/studio-specialists/p15b/src/core/save.ts'
import { tick } from '/Users/zacheryspector/studio-specialists/p15b/src/core/tick.ts'
import type { GameState } from '/Users/zacheryspector/studio-specialists/p15b/src/core/types.ts'

const C = '/Users/zacheryspector/studio-specialists/p15b/'
const hash = (v: string | Buffer) => createHash('sha256').update(v).digest('hex')
const canon = (v: unknown) => stableStringify(v)
const helperSHA = '921a8e1e69f07dfc3e9d6bcaeef63e0493772adac6f3c3b3deebaa1cb0e8a060'
assert.equal(hash(readFileSync(C + 'tests/helpers/p15b-live.ts')), helperSHA, 'unchanged drain-constructor provenance')

function admit(s: GameState) {
  const before = canon(s)
  try { makeSave(s) }
  finally { assert.equal(canon(s), before, 'full reader mutated input') }
}
// Existing p15b-live drainPlayer constructor; amount preserves fractional cash.
function drainPlayer(s: GameState): GameState {
  const amount = Math.floor(s.studio.cash) + 1
  assert(Number.isInteger(amount) && amount > 0)
  return { ...s, studio: { ...s.studio, cash: s.studio.cash - amount }, ledger: [...s.ledger,
    { week: s.market.tick, kind: 'publicity', amount: -amount, note: 'p15b test drain' }] }
}
// Existing p15b-live drainRival transaction shape: actual settled film, project and finance period agree.
function drainRival(s: GameState, studioId: string): GameState {
  const amount = 10_000_000
  const h = s.hollywood; assert(h)
  const index = h.businesses.findIndex(b => b.studioId === studioId)
  const b = h.businesses[index]; assert(b)
  const produced = b.projects.findIndex(p => p.productionId !== null && h.films.some(f =>
    f.filmId === p.productionId && f.provenance === 'simulation/v1' && f.settledWeek !== null))
  assert(produced >= 0, `${studioId} has no settled film to charge`)
  const cost = b.projects[produced]!
  const last = b.account.periods.length - 1; assert(last >= 0)
  const periods = b.account.periods.map((p, i) => i === last
    ? { ...p, movements: { ...p.movements, production: p.movements.production - amount }, closing: p.closing - amount } : p)
  const business = { ...b, account: { ...b.account, cash: b.account.cash - amount, periods },
    projects: b.projects.map((p, i) => i === produced ? { ...p, production: p.production + amount } : p) }
  assert(business.account.cash < 0, `${studioId} fixed debit does not establish negative cash`)
  const films = h.films.map(f => f.filmId === cost.productionId && f.provenance === 'simulation/v1'
    ? { ...f, directCommitment: f.directCommitment + amount } : f)
  return { ...s, hollywood: { ...h, films, businesses: h.businesses.map((x, i) => i === index ? business : x) } }
}
function summary(s: GameState) {
  return { week: s.market.tick, player: s.hollywood?.playerStudioId, cash: s.studio.cash,
    recordedFromWeek: s.campaignLegacy.recordedFromWeek, conditionRecordedFromWeek: s.corporateCondition.recordedFromWeek,
    conditions: s.corporateCondition.studios.map(r => ({ studioId: r.studioId, condition: r.condition })),
    closures: s.studioClosure.closures.map(r => ({ studioId: r.studioId, closureId: r.closureId,
      week: r.closureWeek, sequence: r.p15DomainSequence, endOfRun: r.endOfRun })),
    official: s.campaignLegacy.official, ended: s.campaignLegacy.endOfRun,
    sequenceNext: s.p15Sequence.next, stateSHA256: hash(canon(s)) }
}
function lateCapture(): GameState {
  const base = C + 'tests/fixtures/p15/p15c2-route-l-captures/'
  const m = JSON.parse(readFileSync(base + 'MANIFEST.json', 'utf8')) as {
    saveVersion: number; inputs: { name: string; week: number; gzip: { bytes: number; sha256: string }; decoded: { bytes: number; sha256: string } }[] }
  assert.equal(m.saveVersion, 44)
  const row = m.inputs.find(r => r.name === 'route-l-week-6240'); assert(row); assert.equal(row.week, 6240)
  const gz = readFileSync(base + row.name + '.json.gz')
  assert.equal(gz.byteLength, row.gzip.bytes); assert.equal(hash(gz), row.gzip.sha256)
  const raw = gunzipSync(gz)
  assert.equal(raw.byteLength, row.decoded.bytes); assert.equal(hash(raw), row.decoded.sha256)
  const save = importSave(raw.toString('utf8')); assert.equal(save.saveVersion, 44)
  return migrateToLive(save).state as GameState
}
function earlyCapture(): GameState {
  const gz = readFileSync(C + 'tests/fixtures/p14/genuine-v42-pre-shelving/genuine-v42-rival-stall-week-130.json.gz')
  assert.equal(gz.byteLength, 121262); assert.equal(hash(gz), 'af45c8a0efb9a56ac9ff4c16244509d59b49a02370f8390769c79b133d7238f6')
  const raw = gunzipSync(gz)
  assert.equal(raw.byteLength, 1096270); assert.equal(hash(raw), 'f0bf1f76552347f590b54cafefc5704a436f63de49c6782e9bb9a582f28f1425')
  const save = importSave(raw.toString('utf8')); assert.equal(save.saveVersion, 42)
  return migrateToLive(save).state as GameState
}
const results: Record<string, unknown>[] = []
function measure(label: string, budget: number, body: (row: Record<string, unknown>, started: number) => void) {
  const started = performance.now(); const row: Record<string, unknown> = { label, budgetMs: budget }; results.push(row)
  try { body(row, started); row.passed = true }
  catch (e) { row.passed = false; row.error = e instanceof Error ? e.stack : String(e); process.exitCode = 1 }
  finally { row.elapsedMs = performance.now() - started; row.budgetPassed = Number(row.elapsedMs) <= budget
    if (!row.budgetPassed) { row.passed = false; process.exitCode = 1 } }
}
measure('Genuine130 migrated capture with constructed player and two settled-rival debits', 120_000, (row, started) => {
  const source = earlyCapture(); const sourceBytes = canon(source); admit(source); assert.equal(source.market.tick, 130)
  row.baseline = summary(source); row.baselineAdmitted = true
  const talentId = source.freeAgents[0]; assert(talentId)
  let state = applyActions(source, [{ kind: 'signContract', talentId, termWeeks: 52 }]); admit(state)
  const h = state.hollywood; assert(h)
  // Select an existing settled rival the unchanged fixed debit can actually make negative.
  const candidates = h.businesses.filter(b => b.studioId !== h.playerStudioId && b.account.cash < 10_000_000 && b.projects.some(p =>
    p.productionId !== null && h.films.some(f => f.filmId === p.productionId && f.provenance === 'simulation/v1' && f.settledWeek !== null)))
    .map(b => b.studioId).sort()
  const r04 = 'studio-aca408ec-r04'; assert(candidates.includes(r04))
  const other = candidates.find(id => id !== r04); assert(other, 'no second settled rival below the fixed debit; do not fabricate film or cash')
  const targets = [h.playerStudioId, r04, other].sort(); row.targets = targets
  state = drainRival(drainRival(drainPlayer(state), r04), other); admit(state)
  row.drained = summary(state); row.drainedAdmitted = true
  while (state.market.tick < 163 && !state.studioClosure.closures.some(c => c.studioId === h.playerStudioId)) {
    assert(performance.now() - started <= 120_000, 'existing FIXTURE_MS elapsed budget')
    const prior = canon(state); const next = tick(state); assert.equal(canon(state), prior); state = next
  }
  row.final = summary(state); admit(state); row.finalAdmitted = true
  assert.equal(canon(source), sourceBytes, 'original migrated capture unchanged')
  const rows = state.studioClosure.closures.filter(c => targets.includes(c.studioId))
  assert.deepEqual(rows.map(c => c.studioId), targets, 'all three actual closures, ascending studio ID')
  assert(rows.every(c => c.closureWeek === 163), 'actual simultaneous closure premise absent; no history shift')
  assert.equal(state.market.tick, 163)
})
console.log(JSON.stringify({ classification: 'Constructed transaction premises only; no natural gameplay/Legacy acceptance', helperSHA256: helperSHA, results }, null, 2))
