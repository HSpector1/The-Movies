// P06A — real-Owner-profile-copy journey (machine). Migrate the real V15 profile
// to V16, prove the hold law and the full Wrap→…→Commit→dispatch flow on REAL
// data using CORE primitives, round-trip Save/Load, and prove the durable
// original is never mutated. Works only on an in-memory copy; the on-disk
// baseline is read-only and its sha256 is re-checked at the end.
//
// RUN (imports are repo-root-relative, so run from the repo root with vite-node,
// NOT tsx — tsx cannot resolve the `.ts` extensions these modules import):
//   cd "/Users/bruce/The Movies - P06A Impl TS"
//   node_modules/.bin/vite-node scripts/p06-real-profile-journey.mts
// Expected: "=== REAL-PROFILE JOURNEY: 25 passed, 0 failed ===".
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { execSync } from 'node:child_process'
import { importSaveJson, exportSaveJson } from './ui/src/engine/adapter.ts'
import { applyActions, tick, nextStudioDecision } from './src/core/index.ts'
import { releaseProjection } from './bridge/release.ts'

const BASELINE = '/Users/bruce/Project Studio Owner Profile Baselines/P06-campaign-start-20260901/bridge-runtime-v1.json'
const EXPECT_SHA = 'd949003e1874406170bfd3e7c8f4c6dc2dc92d24bb125376c435cdf21eec8b4b'

let pass = 0, fail = 0
function check(name: string, cond: boolean, detail: any = '') {
  if (cond) { pass++; console.log(`  ✓ ${name}`) }
  else { fail++; console.log(`  ✗ ${name} :: ${JSON.stringify(detail)}`) }
}
/** drive every pending production OPERATION (never a release commit), then return. */
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

// ── 0. read the baseline (read-only) and confirm integrity ──
const raw = readFileSync(BASELINE, 'utf8')
check('baseline integrity sha256 matches recorded', createHash('sha256').update(raw).digest('hex') === EXPECT_SHA)
const v15Json = JSON.parse(raw).currentSaveJson
const v15 = JSON.parse(v15Json)
check('baseline is a pre-P06 V15 save', v15.saveVersion === 15, v15.saveVersion)
check('baseline carries no releaseAuthority', !('releaseAuthority' in (v15.state ?? v15)))

// ── 1. migrate V15 → V16 (governed) ──
console.log('\n[1] migrate real profile V15 → V16')
const outcome: any = importSaveJson(v15Json)
check('import/migrate succeeded', outcome.ok === true, outcome.error)
check('import reports converted (was not already V16)', outcome.converted === true)
const state = outcome.state
check('migrated save is V16', JSON.parse(exportSaveJson(state)).saveVersion === 16)
check('migrated state has an empty releaseAuthority', state.releaseAuthority?.commitments?.length === 0, state.releaseAuthority)
check('the real profile\'s 3 productions survived migration', state.studio.activeProductions.length === 3, state.studio.activeProductions.length)
check('tick preserved at 8', state.market.tick === 8, state.market.tick)
check('0 films released at migration', state.studio.releasedFilms.length === 0)

// ── 2. HOLD LAW on real data: advance without committing → nothing auto-releases ──
console.log('\n[2] hold law — advance weeks, never commit; nothing may auto-release')
let held = state, sawReady = false
for (let w = 0; w < 45 && held.studio.activeProductions.length > 0; w++) {
  held = driveOps(held)
  if (readyUncommitted(held).length > 0) sawReady = true
  held = tick(held)                       // advance; NEVER commit
  if (held.studio.releasedFilms.length > 0) break
}
check('at least one picture reached Release Ready during the hold walk', sawReady)
check('NOTHING auto-released while never committing (hold law on real data)', held.studio.releasedFilms.length === 0, held.studio.releasedFilms.length)
const heldReady = readyUncommitted(held)
check('a picture is sitting Release Ready + uncommitted at the end of the hold walk', heldReady.length > 0, heldReady.length)

// ── 3. commit advances no time; the next tick dispatches exactly it ──
console.log('\n[3] commit advances no time; the next tick releases exactly the committed picture')
if (heldReady.length > 0) {
  const target = heldReady[0].productionId
  const wk = held.market.tick
  const committed = applyActions(held, [{ kind: 'commitPictureToRelease', productionId: target }])
  check('commit advances no time', committed.market.tick === wk, [wk, committed.market.tick])
  check('exactly one commitment row', committed.releaseAuthority.commitments.length === 1, committed.releaseAuthority.commitments.length)
  check('commitment names the exact production', committed.releaseAuthority.commitments[0].productionId === target)
  const before = committed.studio.releasedFilms.length
  const after = tick(committed)
  check('the next tick releases exactly one more film', after.studio.releasedFilms.length === before + 1, after.studio.releasedFilms.length - before)
  check('the committed picture is no longer active (dispatched)', !after.studio.activeProductions.some((p: any) => p.id === target))
  check('the commitment row was pruned after release', after.releaseAuthority.commitments.length === 0, after.releaseAuthority.commitments.length)
}

// ── 4. full journey: commit-driven walk from migration reaches a release ──
console.log('\n[4] full commit-driven journey from the migrated real profile reaches a release')
let j = state, everCommitted = false
for (let w = 0; w < 60 && j.studio.releasedFilms.length === 0; w++) {
  j = driveOps(j)
  for (const d of readyUncommitted(j)) { j = applyActions(j, [{ kind: 'commitPictureToRelease', productionId: d.productionId }]); everCommitted = true }
  j = tick(j)
}
check('the journey released a film on real data', j.studio.releasedFilms.length > 0, j.studio.releasedFilms.length)
check('a commit was required before any release (no auto-release)', everCommitted)

// ── 5. Save/Load round-trip on the post-journey state ──
console.log('\n[5] Save / Load round-trip')
const savedJson = exportSaveJson(j)
const reloaded: any = importSaveJson(savedJson)
check('reload succeeded', reloaded.ok === true, reloaded.error)
check('reloaded save re-exports byte-identically', exportSaveJson(reloaded.state) === savedJson)

// ── 6. the durable original is untouched ──
console.log('\n[6] the durable original is untouched')
check('baseline sha256 unchanged after the whole journey', createHash('sha256').update(readFileSync(BASELINE, 'utf8')).digest('hex') === EXPECT_SHA)
check('baseline still read-only', execSync(`stat -f '%Sp' '${BASELINE}'`).toString().trim().startsWith('-r--'))

console.log(`\n=== REAL-PROFILE JOURNEY: ${pass} passed, ${fail} failed ===`)
if (fail > 0) process.exit(1)
