// 1355-P r2 (record 1355-C2; 1355-F4 R2): the P15A.1 Wave 2 RED-commit pins (record 1355-C; 1355-A §4 "pins minted at the RED commit
// on unchanged production") and the one genuine capture below the P15 save step (1355-F Amendment 3),
// minted once at the last writer below the step, before any P15 production lands. Modeled on
// 1358-stage/1358-P-save43-producer.ts and 1344-P2-save42-week93-producer.ts (HEAD pin, output-exists
// guard, gzip + sha256, MANIFEST). Every route comes from tests/helpers/p15a1-market-route.ts, the SAME
// code the RED leaves run, so a pin and its leaf cannot drift apart.
//
// Parent executes once under the bounded recorder and guards; no rehearsal, seed search, state surgery
// or retry (the house rule). A failed route premise throws with its own message and nothing is written.
//
// r2: the guard reads `sharedMarket` alone, so other P15 roots below the step (the ranking archive and
// `p15Sequence`, which land first by 1355-F4's order) are tolerated; every pinned state strips every
// `P15_ROOTS` key (tests/helpers/p15-roots.ts, shared with 1356-C); the capture premise is the route
// helper's `capturePremise`, the one RED 16 leaf 2 asserts.
//
// Placement: directly in E (docs/engineering/playability-launch-review/evidence/p14b4-20260919/), so the
// relative imports reach the repository root. Run with `npx tsx`.
//
// Outputs:
//   tests/fixtures/p15/p15a1-market-pins/MANIFEST.json            reception digests, K2 digest, M0A digest, K1 entry
//   tests/fixtures/p15/p15a1-market-pins/k1-post-tick-week-<W>.json.gz
//   tests/fixtures/p15/genuine-below-p15-save-step/MANIFEST.json  (P15A1_CAPTURE_MODE=mint only; shared with 1356-C)
//   tests/fixtures/p15/genuine-below-p15-save-step/fresh-market-week-<M>.json.gz
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gunzipSync, gzipSync } from 'node:zlib'
import { exportSave, importSave, LIVE_SAVE_VERSION, makeSave } from '../../../../../src/core/save.ts'
import { tick } from '../../../../../src/core/tick.ts'
import type { GameState } from '../../../../../src/core/types.ts'
import {
  canon, CAPTURE_DIRECTORY, capturePremise, digest, keepKeys, kRoute, m0aRoute, M0A_ROUTE_SEED, MARKET_ROUTE_SEED,
  PIN_DIRECTORY, receptionPinCases, RIVAL_ROUTE_SEED, rivalRouteAt, runPinCase, sha256, type PinManifest,
} from '../../../../../tests/helpers/p15a1-market-route.ts'
import { stripP15 } from '../../../../../tests/helpers/p15-roots.ts'

const ROOT = fileURLToPath(new URL('../../../../../', import.meta.url))
const CAPTURE_FROM_WEEK = 30
const CAPTURE_CEILING_WEEK = 160 // the helper's ROUTE_CAP_WEEK

const id = (raw: string | Uint8Array) => ({ bytes: typeof raw === 'string' ? Buffer.byteLength(raw) : raw.byteLength, sha256: sha256(raw) })
const json = (value: unknown) => JSON.stringify(value, null, 2) + '\n'
const out = (path: string, data: string | Uint8Array) => writeFileSync(resolve(ROOT, path), data, { flag: 'wx' })
const gz = (raw: string) => {
  const bytes = gzipSync(Buffer.from(raw, 'utf8'), { level: 9 })
  assert.equal(gunzipSync(bytes).toString('utf8'), raw)
  return bytes
}

// ── guards ──────────────────────────────────────────────────────────────────────
const head = process.env.P15A1_PRODUCER_HEAD ?? ''
assert.match(head, /^[0-9a-f]{40}$/, 'P15A1_PRODUCER_HEAD must name the published execution HEAD')
assert.equal(execFileSync('git', ['rev-parse', 'HEAD'], { cwd: ROOT, encoding: 'utf8' }).trim(), head, 'HEAD differs from P15A1_PRODUCER_HEAD')
const mode = process.env.P15A1_CAPTURE_MODE ?? ''
assert.ok(mode === 'mint' || mode === 'skip',
  'P15A1_CAPTURE_MODE must be "mint" (this run mints the shared capture) or "skip" (another record minted it; this run verifies it)')
assert.ok(!existsSync(resolve(ROOT, PIN_DIRECTORY)), `refusing to overwrite ${PIN_DIRECTORY}`)
if (mode === 'mint') assert.ok(!existsSync(resolve(ROOT, CAPTURE_DIRECTORY)), `refusing to overwrite ${CAPTURE_DIRECTORY}`)
// Unchanged production for this wave: no market root yet (1355-A §4). Other P15 roots may exist below
// the step; every pinned state below strips them all (1355-F4 R2).
const probe = rivalRouteAt(1) as unknown as Record<string, unknown>
assert.ok(!Object.hasOwn(probe, 'sharedMarket'), 'a tick wrote `sharedMarket`: the P15A.1 step has landed, so these pins would not come from unchanged production')
const started = Date.now()

// ── RED 1: the reception seam's default path ─────────────────────────────────────
const reception = receptionPinCases().map((c) => ({ name: c.name, digest: digest(runPinCase(c)) }))

// ── RED 10 / 11: K1 and K2 on the held-slate route ─────────────────────────────────
const { k1, k2 } = kRoute()
const k2Post = tick(k2.pre)
const k2Keys = Object.keys(stripP15(k2Post)).sort()
const k1Post = tick(k1.pre)
const k1Keys = Object.keys(stripP15(k1Post)).sort()
const k1Raw = canon(keepKeys(k1Post, k1Keys))
const k1Name = `k1-post-tick-week-${k1.week}`
const k1Gz = gz(k1Raw)

// ── RED 17: the disengaged world ───────────────────────────────────────────────────
const m0a = m0aRoute()
const m0aLast = m0a[m0a.length - 1]!
const m0aKeys = Object.keys(stripP15(m0aLast)).sort()

// ── RED 16: the genuine capture below the step (rival-only route, natural ticks) ────────
// Stopping rule: the first week M >= 30 that meets RED 16's ramp premise (`capturePremise`, asserted
// again by RED 16 leaf 2): a rival release in [M-25, M-1] and an in-flight rival picture of its genre
// releasing inside that release's 26 weeks.
type CaptureFacts = NonNullable<ReturnType<typeof capturePremise>>
function readCaptureManifest(): { saveVersion: number; inputs: { name: string; gzip: { bytes: number; sha256: string }; decoded: { bytes: number; sha256: string } }[] } {
  return JSON.parse(readFileSync(resolve(ROOT, CAPTURE_DIRECTORY, 'MANIFEST.json'), 'utf8'))
}

let capture: { name: string; bytes: Buffer; raw: string; facts: CaptureFacts } | null = null
if (mode === 'mint') {
  let facts: CaptureFacts | null = null
  for (let week = CAPTURE_FROM_WEEK; week <= CAPTURE_CEILING_WEEK && facts === null; week++) facts = capturePremise(rivalRouteAt(week))
  // Every reader's premise in this one run (1355-F4): 1356-C's capture leaf needs only a genuine
  // below-step save with an industry, which this capture is.
  assert.ok(facts !== null, `route premise failed: seed "${RIVAL_ROUTE_SEED}" reached no capture week in [${CAPTURE_FROM_WEEK}, ${CAPTURE_CEILING_WEEK}]`)
  const raw = exportSave(makeSave(rivalRouteAt(facts.week)))
  assert.equal(exportSave(importSave(raw)), raw, 'current writer round trip')
  capture = { name: `fresh-market-week-${facts.week}`, bytes: gz(raw), raw, facts }
} else {
  // Another record minted the shared capture: verify it meets RED 16's need before pinning anything.
  const manifest = readCaptureManifest()
  assert.equal(manifest.saveVersion, LIVE_SAVE_VERSION, `${CAPTURE_DIRECTORY} holds Save${manifest.saveVersion}, not the live Save${LIVE_SAVE_VERSION}`)
  const usable = manifest.inputs.filter((input) => {
    const bytes = readFileSync(resolve(ROOT, CAPTURE_DIRECTORY, `${input.name}.json.gz`))
    assert.equal(sha256(bytes), input.gzip.sha256, `${input.name}: gzip sha256 differs from its MANIFEST`)
    const state = (importSave(gunzipSync(bytes).toString('utf8')) as unknown as { state: GameState }).state
    return capturePremise(state) !== null
  })
  assert.ok(usable.length > 0, `${CAPTURE_DIRECTORY}: no input has a recent rival release and an in-flight production of its genre (RED 16 needs one)`)
}

// ── write (nothing above wrote a byte) ────────────────────────────────────────────────
mkdirSync(resolve(ROOT, PIN_DIRECTORY), { recursive: true })
out(`${PIN_DIRECTORY}${k1Name}.json.gz`, k1Gz)
const pins: PinManifest & { purpose: string; executionHead: string; seeds: Record<string, string>; elapsedMs: number } = {
  purpose: 'generated test pins only; never Owner saves',
  record: '1355-P',
  executionHead: head,
  saveVersion: LIVE_SAVE_VERSION,
  seeds: { market: MARKET_ROUTE_SEED, rival: RIVAL_ROUTE_SEED, m0a: M0A_ROUTE_SEED },
  reception,
  k2: { week: k2.week, keys: k2Keys, digest: digest(keepKeys(k2Post, k2Keys)) },
  k1: { week: k1.week, committed: k1.committed, keys: k1Keys, capture: { name: k1Name, gzip: id(k1Gz), decoded: id(k1Raw) } },
  m0a: { weeks: m0a.length, keys: m0aKeys, digest: digest(keepKeys(m0aLast, m0aKeys)) },
  elapsedMs: 0,
}
if (capture !== null) {
  mkdirSync(resolve(ROOT, CAPTURE_DIRECTORY), { recursive: true })
  out(`${CAPTURE_DIRECTORY}${capture.name}.json.gz`, capture.bytes)
  out(`${CAPTURE_DIRECTORY}MANIFEST.json`, json({
    purpose: 'generated test campaigns only; never Owner saves', record: '1355-P', executionHead: head,
    saveVersion: LIVE_SAVE_VERSION, route: `initializeHollywood(generateWorld('${RIVAL_ROUTE_SEED}'), 'fresh'); natural ticks to week ${capture.facts.week}`,
    inputs: [{ name: capture.name, gzip: id(capture.bytes), decoded: id(capture.raw), facts: capture.facts }],
  }))
}
pins.elapsedMs = Date.now() - started
out(`${PIN_DIRECTORY}MANIFEST.json`, json(pins))
console.log(JSON.stringify({ pins: PIN_DIRECTORY, k1: { week: k1.week, committed: k1.committed }, k2: k2.week,
  m0aWeeks: m0a.length, capture: capture === null ? 'verified existing' : capture.facts, elapsedMs: pins.elapsedMs }))
