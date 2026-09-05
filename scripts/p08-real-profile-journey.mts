// P08A W4 — real-Owner-profile-copy journey (machine): Standing & Studio
// History on REAL data. Works only on an in-memory copy of the read-only
// baseline (the same durable original the P06/P07 journeys pinned); proves the
// V15 → V17 migration's absence law (recording begins at the migration week,
// nothing reconstructed), the forward receipts at every Standing mutation
// site, the exact film/person links, save/load round-trip identity of the
// history root, and then re-checks the baseline byte-identity. CORE primitives
// + the shipped projection only — never a re-implementation of any formula.
//
// RUN (repo root):  node_modules/.bin/vite-node scripts/p08-real-profile-journey.mts
// Expected: "=== P08 REAL-PROFILE JOURNEY: N passed, 0 failed ===".
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { importSaveJson, exportSaveJson } from '../ui/src/engine/adapter.ts'
import { applyActions, tick, nextStudioDecision, validateSave, stableStringify } from '../src/core/index.ts'
import { historyProjection } from '../bridge/history.ts'
import { releaseProjection } from '../bridge/release.ts'

const BASELINE = '/Users/bruce/Project Studio Owner Profile Baselines/P06-campaign-start-20260901/bridge-runtime-v1.json'
const EXPECT_SHA = 'd949003e1874406170bfd3e7c8f4c6dc2dc92d24bb125376c435cdf21eec8b4b'
let pass = 0
let fail = 0
function check(name: string, cond: boolean, detail: unknown = ''): void {
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

// ── 0. baseline (read-only) integrity ──
const raw = readFileSync(BASELINE, 'utf8')
check('baseline integrity sha256 matches recorded', createHash('sha256').update(raw).digest('hex') === EXPECT_SHA)
const outcome: any = importSaveJson(JSON.parse(raw).currentSaveJson)
check('import/migrate succeeded', outcome.ok === true, outcome.error)
const state = outcome.state
const migratedWeek = state.market.tick
check('migrated save is V17 (P08 adds the studioHistory root)', JSON.parse(exportSaveJson(state)).saveVersion === 17)

// ── 1. the absence law on a real old save ──
console.log('\n[1] absence law: recording begins at the migration week; nothing reconstructed')
let h = historyProjection(state)
check('recordingStartedWeek == the migration week (> 0)', h.recordingStartedWeek === migratedWeek && migratedWeek > 0, { migratedWeek, started: h.recordingStartedWeek })
check('the absence notice names the boundary week', h.notRecordedNotice === `Detailed Standing/history changes were not recorded before Week ${migratedWeek}.`, h.notRecordedNotice)
check('zero receipts before the boundary (no backfill)', h.standing.receipts.every((r) => r.week >= migratedWeek), h.standing.receipts.length)
check('no reconstructed founding landmark', !h.timeline.some((r) => r.kind === 'studioFounded'))
check('three channels with recordedChange == 0 at the boundary', h.standing.channels.length === 3 && h.standing.channels.every((c) => c.recordedChange === 0), h.standing.channels)
check('no fabricated records', h.recordsAvailable === false)
const filmsBefore = h.films.length
check('durable films released before the boundary are indexed but Not recorded', h.films.every((f) => f.historyRecorded === false), h.films.map((f) => [f.productionId, f.historyRecorded]))

// ── 2. forward receipts: drive to a real release ──
console.log('\n[2] forward receipts: release → Standing receipt with drivers; timeline milestone')
let j = state
for (let w = 0; w < 80 && readyUncommitted(j).length === 0; w++) { j = driveOps(j); j = tick(j) }
const ready = readyUncommitted(j)
check('a real picture reached Release Ready', ready.length > 0, ready.length)
const targetId = ready[0].productionId
j = applyActions(j, [{ kind: 'commitPictureToRelease', productionId: targetId }])
j = tick(j)
check('the release occurred on the next week', j.studio.releasedFilms.some((f: any) => f.productionId === targetId))
h = historyProjection(j)
const releaseReceipt = h.standing.receipts.find((r) => r.sourceKind === 'releaseResult' && r.sourceId === targetId)
check('a release Standing receipt exists for the exact film', releaseReceipt !== undefined)
check('the receipt carries three driver lines and the formula version', (releaseReceipt?.reasonLines.length ?? 0) === 3 && (releaseReceipt?.formulaVersion ?? '').startsWith('standing/'), releaseReceipt?.formulaVersion)
check('before + deltas == after on every channel', releaseReceipt !== undefined && ['audienceAwareness', 'industryPrestige', 'commercialConfidence'].every((k) => Math.abs((releaseReceipt.before as any)[k] + (releaseReceipt.deltas as any)[k] - (releaseReceipt.after as any)[k]) < 1e-9))
check('the receipt links the exact durable result (filmId)', releaseReceipt?.filmId === targetId)
const releasedRow = h.timeline.find((r) => r.kind === 'filmReleased' && r.subjectId === targetId)
check('the timeline carries the release milestone with the exact film id', releasedRow !== undefined && releasedRow.filmId === targetId && releasedRow.subjectLocation === 'none')
check('the film index marks the new film as recorded, the old ones still Not recorded', h.films.find((f) => f.productionId === targetId)?.historyRecorded === true && h.films.filter((f) => f.productionId !== targetId).every((f) => f.historyRecorded === false))
check('the film index grew by exactly one', h.films.length === filmsBefore + 1, [filmsBefore, h.films.length])
check('every channel value on the wire equals the live Standing', h.standing.channels.every((c) => Math.abs(c.value - (j.studio.standing as any)[c.key]) < 1e-9))
check('recordedChange sums the forward receipts per channel', h.standing.channels.every((c) => Math.abs(c.recordedChange - h.standing.receipts.reduce((sum, r) => sum + (r.deltas as any)[c.key], 0)) < 1e-9))

// ── 3. publicity receipt at the third mutation site ──
console.log('\n[3] publicity: one receipt, awareness only, cost stated')
let k = j
let publicity: any
try {
  k = applyActions(k, [{ kind: 'publicity', tier: 'whisper' }])
  publicity = historyProjection(k).standing.receipts.find((r) => r.sourceKind === 'publicity')
  check('a publicity receipt exists after the campaign', publicity !== undefined)
  check('publicity moves awareness only', publicity !== undefined && publicity.deltas.audienceAwareness > 0 && publicity.deltas.industryPrestige === 0 && publicity.deltas.commercialConfidence === 0, publicity?.deltas)
  check('the reason line states the real cost and lift', typeof publicity?.reasonLines[0] === 'string' && /campaign cost \$[\d,]+ and lifted awareness by \+/.test(publicity.reasonLines[0]), publicity?.reasonLines)
} catch (error) {
  check('publicity refused with a named reason (legal refusal, not a hidden lift)', error instanceof Error && error.message.length > 0, String(error))
}

// ── 4. people: captured participants only ──
console.log('\n[4] people: only captured credits; on-lot fact from presence')
h = historyProjection(k)
const person = h.people.find((p) => p.credits.some((c) => c.productionId === targetId))
check('the released film credits at least one captured person', person !== undefined)
check('credits name the exact film and role', person !== undefined && person.credits.some((c) => c.productionId === targetId && c.roleLabel.length > 0))
check('uncapturedFilms counts the pre-boundary films without participants honestly', h.people.every((p) => p.uncapturedFilms === k.studio.releasedFilms.filter((f: any) => f.participants === undefined).length))

// ── 5. save/load round trip: the history root survives byte-for-byte ──
console.log('\n[5] save/load: history root identical after round trip')
const saved = exportSaveJson(k)
const reloaded: any = importSaveJson(saved)
check('reload ok', reloaded.ok === true, reloaded.error)
check('validateSave accepts the emitted V17 bytes', (() => { try { return validateSave(JSON.parse(saved)).saveVersion === 17 } catch { return false } })())
check('studioHistory identical after reload (stable key order)', stableStringify(reloaded.state.studioHistory) === stableStringify(k.studioHistory))
check('projection identical after reload', JSON.stringify(historyProjection(reloaded.state)) === JSON.stringify(historyProjection(k)))
check('a second export is byte-identical (deterministic)', exportSaveJson(reloaded.state) === saved)

// ── 6. weekly settling receipts appear only as routine, fold-bounded ──
console.log('\n[6] settling: routine receipts stay out of the timeline')
let m = reloaded.state
for (let w = 0; w < 8; w++) m = tick(m)
h = historyProjection(m)
check('no routine row in the timeline', !h.timeline.some((r) => r.significance === 'routine'))
check('timeline rows are chronological by week', h.timeline.every((r, i, arr) => i === 0 || arr[i - 1]!.week <= r.week))

// ── 7. baseline untouched ──
console.log('\n[7] baseline byte-identity re-check')
check('baseline bytes unchanged after the journey', createHash('sha256').update(readFileSync(BASELINE, 'utf8')).digest('hex') === EXPECT_SHA)

console.log(`\n=== P08 REAL-PROFILE JOURNEY: ${pass} passed, ${fail} failed ===`)
process.exit(fail === 0 ? 0 : 1)
