// P07A W7 — real-Owner-profile-copy journey (machine): the §9 release/reception/
// result arc on REAL data. Works only on an in-memory copy of the read-only
// baseline (same durable original the P06 journey pinned); proves the commit →
// authoritative release → IN THEATERS → result truth → save/load → run-complete
// → Film History lifecycle with the exact P07 semantics, then re-checks the
// baseline byte-identity. CORE primitives + the shipped adapter only — never a
// re-implementation of any verdict.
//
// RUN (repo root):  node_modules/.bin/vite-node scripts/p07-real-profile-journey.mts
// Expected: "=== P07 REAL-PROFILE JOURNEY: N passed, 0 failed ===".
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { execSync } from 'node:child_process'
import { importSaveJson, exportSaveJson, studioLotSnapshot, filmResultView } from './ui/src/engine/adapter.ts'
import { applyActions, tick, nextStudioDecision, stableStringify } from './src/core/index.ts'
import { releaseProjection } from './bridge/release.ts'

const BASELINE = '/Users/bruce/Project Studio Owner Profile Baselines/P06-campaign-start-20260901/bridge-runtime-v1.json'
const EXPECT_SHA = 'd949003e1874406170bfd3e7c8f4c6dc2dc92d24bb125376c435cdf21eec8b4b'

let pass = 0, fail = 0
function check(name: string, cond: boolean, detail: any = '') {
  if (cond) { pass++; console.log(`  ✓ ${name}`) }
  else { fail++; console.log(`  ✗ ${name} :: ${JSON.stringify(detail)}`) }
}
function driveOps(s: any): any {
  let dec = nextStudioDecision(s)
  let guard = 0
  while (dec !== null && dec.kind === 'productionOperation' && guard++ < 100) {
    s = applyActions(s, [dec.command]); dec = nextStudioDecision(s)
  }
  return s
}
const readyUncommitted = (s: any) =>
  releaseProjection(s).decisions.filter((d: any) => d.authorityState === 'ready-uncommitted' && d.legalCommit)
const cards = (s: any) => studioLotSnapshot(s).results ?? []
const cardOf = (s: any, id: string) => cards(s).find((c: any) => c.id === id)
const runOf = (s: any, id: string) => s.theatricalRuns.find((r: any) => r.productionId === id)

// ── 0. baseline (read-only) integrity ──
const raw = readFileSync(BASELINE, 'utf8')
check('baseline integrity sha256 matches recorded', createHash('sha256').update(raw).digest('hex') === EXPECT_SHA)
const outcome: any = importSaveJson(JSON.parse(raw).currentSaveJson)
check('import/migrate succeeded (no V17 required)', outcome.ok === true, outcome.error)
const state = outcome.state
check('migrated save is V16 (P07 adds NO save version)', JSON.parse(exportSaveJson(state)).saveVersion === 16)
check('zero result cards before any release (nothing shown early)', cards(state).length === 0, cards(state).length)

// ── 1. find a committable picture, commit, advance ONE authoritative week ──
console.log('\n[1] commit → the next authoritative week releases exactly that picture')
let j = state
for (let w = 0; w < 60 && readyUncommitted(j).length === 0; w++) { j = driveOps(j); j = tick(j) }
const ready = readyUncommitted(j)
check('a real picture reached Release Ready', ready.length > 0, ready.length)
const targetId = ready[0].productionId
check('no result card exists for the committed picture BEFORE release', cardOf(j, targetId) === undefined)
j = applyActions(j, [{ kind: 'commitPictureToRelease', productionId: targetId }])
check('still no result card after the commit itself (commit is not release)', cardOf(j, targetId) === undefined)
j = tick(j)
check('the release occurred on the next week', j.studio.releasedFilms.some((f: any) => f.productionId === targetId))
check('exactly one FilmResult for the picture', j.studio.releasedFilms.filter((f: any) => f.productionId === targetId).length === 1)
check('exactly one theatrical run opened', j.theatricalRuns.filter((r: any) => r.productionId === targetId).length === 1)

// ── 2. IN THEATERS truth on the wire (the rail row + DETAILS source) ──
console.log('\n[2] IN THEATERS: the wire card the rail row and the result workspace consume')
const live = cardOf(j, targetId)
check('the result card is on the wire', live !== undefined)
check('runStatus active (the rail IN THEATERS filter)', live?.runStatus === 'active', live?.runStatus)
check('projected while live', live?.projected === true)
check('the projected result label speaks projection', typeof live?.resultLabel === 'string' && live.resultLabel.startsWith('Projected'), live?.resultLabel)

// ── 3. the three channels are present and independent ──
console.log('\n[3] CRITICS / AUDIENCE / BUSINESS — three channels, no universal score')
const film = j.studio.releasedFilms.find((f: any) => f.productionId === targetId)!
const view = filmResultView(j, film)
check('critic channel present (score+stars+band+tier)',
  typeof view.critic.score === 'number' && typeof view.critic.stars === 'number' &&
  typeof view.critic.band === 'string' && typeof view.critic.tier === 'string')
check('audience channel present (aggregate+tier+segments)',
  typeof view.audience.aggregate === 'number' && typeof view.audience.tier === 'string' &&
  view.audience.perSegment !== undefined)
check('business gross distinct from studio revenue',
  view.business.boxOfficeGrossTotal > view.business.studioRevenueTotal,
  [view.business.boxOfficeGrossTotal, view.business.studioRevenueTotal])
check('no universal quality field on the view',
  !('quality' in (view as any)) && !('overall' in (view as any)) && !('movieQuality' in (view as any)))

// ── 4. Save / Load mid-run preserves the exact result truth ──
console.log('\n[4] Save/Load mid-run: the results projection survives byte-identically')
const savedJson = exportSaveJson(j)
const reloaded: any = importSaveJson(savedJson)
check('reload succeeded', reloaded.ok === true, reloaded.error)
check('reloaded results projection byte-identical',
  stableStringify(cards(reloaded.state)) === stableStringify(cards(j)))
check('reloaded save re-exports byte-identically', exportSaveJson(reloaded.state) === savedJson)

// ── 5. run to completion: leaves the active rail, stays in Film History ──
console.log('\n[5] run complete: off the active rail, durable in the results projection, FINAL language')
let done = j
for (let w = 0; w < 20 && runOf(done, targetId)?.status !== 'completed'; w++) done = tick(done)
check('the run completed', runOf(done, targetId)?.status === 'completed', runOf(done, targetId)?.status)
const final = cardOf(done, targetId)
check('the result remains durably inspectable after completion', final !== undefined)
check('runStatus completed (leaves the IN THEATERS rail filter)', final?.runStatus === 'completed')
check('final label, never projected', final !== undefined && !final.resultLabel.startsWith('Projected'), final?.resultLabel)
check('gross fully banked at completion',
  final !== undefined && Math.abs(final.grossPaidToDate - final.boxOfficeGrossTotal) < 1e-3,
  [final?.grossPaidToDate, final?.boxOfficeGrossTotal])

// ── 6. identity + scope guards ──
console.log('\n[6] identity + scope')
const titles = cards(done).map((c: any) => c.title)
check('this real profile has no same-title collision (twins proven fixture-side)',
  new Set(titles).size === titles.length, titles)
const snapshotKeys = Object.keys(studioLotSnapshot(done))
check('no P08 awards / Hollywood Wire surface on the lot snapshot',
  !snapshotKeys.some((k) => /award|wire|radio/i.test(k)), snapshotKeys.filter((k) => /award|wire|radio/i.test(k)))

// ── 7. the durable original is untouched ──
console.log('\n[7] the durable original is untouched')
check('baseline sha256 unchanged after the whole journey',
  createHash('sha256').update(readFileSync(BASELINE, 'utf8')).digest('hex') === EXPECT_SHA)
check('baseline still read-only', execSync(`stat -f '%Sp' '${BASELINE}'`).toString().trim().startsWith('-r--'))

console.log(`\n=== P07 REAL-PROFILE JOURNEY: ${pass} passed, ${fail} failed ===`)
if (fail > 0) process.exit(1)
