// 1359-P: route L's genuine captures below the Campaign Legacy's save step (records 1359-C2, 1359-F2
// item 5; 1355-F Amendment 3 rules). Minted once at the last writer below the Legacy's step, before
// the Legacy's production lands, so C2, C3 and C4 of tests/p15c2-campaign-legacy-integration.test.ts
// (and C3b of the sibling patch) migrate genuine Save(STEP − 1) bytes. Modeled on
// 1355-stage/1355-P-p15a1-market-producer.ts: HEAD pin, unchanged-production probe, output-exists
// guard, gzip + sha256, MANIFEST. The route comes from tests/helpers/p15c2-route-l.ts, the SAME code
// the RED leaves run, so a capture and its leaf cannot drift apart.
//
// r4 (1359-C4 under 1359-F3): route L founds through the migration origin. The roster is signed and the
// draft closed before `initializeHollywood(…, 'migration')` at week 6188, so every captured state holds a
// closed draft (the route refuses an open one) and validates; r3's open draft did not (1359-X F-1). The
// capture paths, names and MANIFEST keys are unchanged.
//
// Parent executes once under the bounded recorder and guards; no rehearsal, seed search, state
// surgery or retry (the house rule). A failed premise throws with its own message and nothing is
// written: every write happens after every check.
//
// The step may be the shared P15 step or a separate later one (1359-A §10 item 4). Either way, run
// this at the last writer below the step the Legacy lands in; the leaves assert the MANIFEST's
// saveVersion is STEP − 1. A sibling root already landed below that step is captured as it stands.
// Run it at a HEAD that carries the RED patch (it imports the RED's route helper) and not the
// Legacy's production: the probe below refuses a tree whose fresh world already has the root.
//
// Placement: directly in E (docs/engineering/playability-launch-review/evidence/p14b4-20260919/), so
// the relative imports reach the repository root. Run with `npx tsx`.
//
// Outputs (nothing else is written):
//   tests/fixtures/p15/p15c2-route-l-captures/route-l-week-6239.json.gz
//   tests/fixtures/p15/p15c2-route-l-captures/route-l-week-6240.json.gz
//   tests/fixtures/p15/p15c2-route-l-captures/MANIFEST.json
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gunzipSync, gzipSync } from 'node:zlib'
import { exportSave, importSave, LIVE_SAVE_VERSION, makeSave } from '../../../../../src/core/save.ts'
import { generateWorld } from '../../../../../src/core/worldgen.ts'
import {
  CAPTURE_DIRECTORY, captureName, CAPTURE_WEEKS, FOUNDING_WEEK, ROUTE_SEED, routeAt, routeL,
} from '../../../../../tests/helpers/p15c2-route-l.ts'

const ROOT = fileURLToPath(new URL('../../../../../', import.meta.url))
const sha256 = (value: string | Uint8Array) => createHash('sha256').update(value).digest('hex')
const id = (raw: string | Uint8Array) => ({ bytes: typeof raw === 'string' ? Buffer.byteLength(raw) : raw.byteLength, sha256: sha256(raw) })
const json = (value: unknown) => JSON.stringify(value, null, 2) + '\n'
const out = (path: string, data: string | Uint8Array) => writeFileSync(resolve(ROOT, path), data, { flag: 'wx' })
const gz = (raw: string) => {
  const bytes = gzipSync(Buffer.from(raw, 'utf8'), { level: 9 })
  assert.equal(gunzipSync(bytes).toString('utf8'), raw)
  return bytes
}

// ── guards: a wrong tree refuses before any work ──────────────────────────────────
const head = process.env.P15C2_PRODUCER_HEAD ?? ''
assert.match(head, /^[0-9a-f]{40}$/, 'P15C2_PRODUCER_HEAD must name the published execution HEAD')
assert.equal(execFileSync('git', ['rev-parse', 'HEAD'], { cwd: ROOT, encoding: 'utf8' }).trim(), head, 'HEAD differs from P15C2_PRODUCER_HEAD')
assert.ok(!existsSync(resolve(ROOT, CAPTURE_DIRECTORY)), `refusing to overwrite ${CAPTURE_DIRECTORY}`)
// Unchanged production: the Legacy's step has not landed, so no world carries its root yet.
assert.ok(!Object.hasOwn(generateWorld(ROUTE_SEED), 'campaignLegacy'),
  'a fresh world carries `campaignLegacy`: the Legacy\'s save step has landed, so these would not be below-step captures')
const started = Date.now()

// ── route L, the leaves' own code ───────────────────────────────────────────────────
const route = routeL()
const founded = route.foundedAtFounding
assert.equal(founded.hollywood?.origin, 'migration', 'route L premise: a late founding migrates the industry')
assert.equal(founded.hollywood?.originWeek, FOUNDING_WEEK, `route L premise: the industry originates at week ${FOUNDING_WEEK}`)
assert.equal(founded.founding, null, 'route L premise: the founding draft is closed at the founding week (1359-F3)')
assert.ok(founded.studio.releasedFilms.length > 0, 'route L premise: the headless year released player films')
const captures = CAPTURE_WEEKS.map((week) => {
  const state = routeAt(week)
  assert.equal(state.market.tick, week, `route L premise: the founded state at week ${week}`)
  assert.ok(!Object.hasOwn(state, 'campaignLegacy'), `route L premise: no Legacy root at week ${week}`)
  const raw = exportSave(makeSave(state))
  assert.equal(exportSave(importSave(raw)), raw, `week ${week}: current writer round trip`)
  return { name: captureName(week), week, raw, bytes: gz(raw) }
})

// ── write (nothing above wrote a byte) ──────────────────────────────────────────────
mkdirSync(resolve(ROOT, CAPTURE_DIRECTORY), { recursive: true })
for (const capture of captures) out(`${CAPTURE_DIRECTORY}${capture.name}.json.gz`, capture.bytes)
const elapsedMs = Date.now() - started
out(`${CAPTURE_DIRECTORY}MANIFEST.json`, json({
  purpose: 'generated test campaigns only; never Owner saves',
  record: '1359-P r4',
  executionHead: head,
  saveVersion: LIVE_SAVE_VERSION,
  seed: ROUTE_SEED,
  route: `generateWorld('${ROUTE_SEED}'); one headless OracleAgent year; idle headless ticks to ${FOUNDING_WEEK}; `
    + 'founded through the migration origin (historical-control draft, minimum roster signed, foundStudio, then '
    + `initializeHollywood migration); natural ticks to weeks ${CAPTURE_WEEKS.join(' and ')}`,
  inputs: captures.map((capture) => ({ name: capture.name, week: capture.week, gzip: id(capture.bytes), decoded: id(capture.raw) })),
  routeMs: route.ms,
  elapsedMs,
}))
console.log(JSON.stringify({ captures: CAPTURE_DIRECTORY, weeks: CAPTURE_WEEKS, saveVersion: LIVE_SAVE_VERSION, routeMs: route.ms, elapsedMs }))
