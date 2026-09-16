// R3-N4-DATA-06 — governed generator for the PlayMode suite's one embedded
// wire (`GeneratedWireGzip` in
// Assets/Studio/Tests/PlayMode/StudioLaboratoryBootstrapOrderTests.cs).
//
// This does not run a native review. It re-derives the exact public
// projection the bridge would have published for the SAME already-generated
// source record, before any input, through the CURRENT bridge/session.ts
// snapshot() pipeline (which now migrates the campaign to projectionVersion
// 31). That is the only way to know what a live projection-31 driver would
// hand Unity for this record without launching a new native run.
//
// Source: the seven-record review library named by the original run's own
// provenance file (P13A worktree, read-only, `synthetic-checkpoint-
// provenance.json` in
// Evidence/P13A/early-2026-09-11T20-17-08-939Z/), selecting the one record
// whose *checkpoint-internal* sessionId is
// "p13a-generated-research-active-laboratory-01" (the library's own record
// id is an unrelated storage UUID minted by initialCampaignLibrary when the
// library was assembled — see that provenance file's "method" field).
//
// Usage: vite-node scripts/gen-playmode-embedded-wire.mts <unity-root>
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import { resolve } from 'node:path'
import { execFileSync } from 'node:child_process'

import { loadCampaignLibrary } from '../bridge/runtime/campaign-library.ts'
import { loadBridgeRuntimeCheckpoint, DEFAULT_BRIDGE_RUNTIME_CHECKPOINT_LIMITS as limits } from '../bridge/runtime-checkpoint.ts'
import { BridgeSession } from '../bridge/session.ts'
import { SCHEMA_ID, PROJECTION_VERSION } from '../bridge/protocol.ts'

const sha = (raw: string | Buffer) => createHash('sha256').update(raw).digest('hex')

// ── Fixed source identity (read-only; lives outside this worktree) ─────────
const SOURCE_LIBRARY = '/Users/bruce/The Movies - P13A Synchronized Sound TS/artifacts/p13a/review-library/generated-review-library.json'
const SOURCE_LIBRARY_SHA256 = 'e65fe9c9c7da9b2c9cb42046b9c6210243139b01139f349839f2e5a17ee0f8ff'
const SOURCE_LIBRARY_BYTES = 1959182
const TARGET_SESSION_ID = 'p13a-generated-research-active-laboratory-01'
const ORIGINAL_RUN_ID = 'early-2026-09-11T20-17-08-939Z'
const ORIGINAL_RUN_BASELINE = '/Users/bruce/The Movies - P13A Synchronized Sound Unity/Evidence/P13A/' + ORIGINAL_RUN_ID + '/public-snapshot-before-player.json'

const unityRoot = process.argv[2]
if (!unityRoot) throw new Error('usage: gen-playmode-embedded-wire.mts <unity-root>')
const testFile = resolve(unityRoot, 'Assets/Studio/Tests/PlayMode/StudioLaboratoryBootstrapOrderTests.cs')
const manifestFile = resolve(unityRoot, 'Assets/Studio/Tests/PlayMode/generated-wire.manifest.json')
if (!existsSync(testFile)) throw new Error(`Unity test file not found: ${testFile}`)

// ── Load the source review library through the CURRENT bridge ─────────────
const libraryBytes = readFileSync(SOURCE_LIBRARY)
if (sha(libraryBytes) !== SOURCE_LIBRARY_SHA256) throw new Error(`STOP: source library sha256 mismatch, got ${sha(libraryBytes)}`)
if (libraryBytes.length !== SOURCE_LIBRARY_BYTES) throw new Error(`STOP: source library byte length mismatch, got ${libraryBytes.length}`)

const loadedLibrary = loadCampaignLibrary(libraryBytes.toString('utf8'), limits)
console.error(`library: ${loadedLibrary.library.records.length} records, activeCampaignId=${loadedLibrary.library.activeCampaignId}`)

// The library's own record.id is a storage UUID minted by initialCampaignLibrary
// when the review library was assembled (see file header) — none of the seven
// records' hydrated checkpoints carry the descriptive session id themselves.
// The driver that ran the original native review instead selected the ACTIVE
// record (library.activeCampaignId — "01 Funded research", week 261, matching
// the source provenance's top-level activeCampaignId/week) and opened it under
// a descriptive session name for that scenario. Reproduce that exactly: select
// the active record's state, then re-session it under the same descriptive id.
for (const record of loadedLibrary.library.records) {
  const hydrated = loadBridgeRuntimeCheckpoint(record.checkpointJson, limits).hydrated
  const candidate = BridgeSession.fromRuntimeCheckpoint(hydrated, limits)
  console.error(`  record id=${record.id} label=${JSON.stringify(record.label)} sessionId=${candidate.sessionId} week=${candidate.gameState.market.tick}`)
}
const activeRecord = loadedLibrary.library.records.find((r) => r.id === loadedLibrary.library.activeCampaignId)
if (activeRecord === undefined) throw new Error('STOP: source library has no active record')
if (activeRecord.label !== '01 Funded research') throw new Error(`STOP: active record label is "${activeRecord.label}", expected "01 Funded research"`)
const activeHydrated = loadBridgeRuntimeCheckpoint(activeRecord.checkpointJson, limits).hydrated
const activeCandidate = BridgeSession.fromRuntimeCheckpoint(activeHydrated, limits)
if (activeCandidate.gameState.market.tick !== 261) throw new Error(`STOP: active record week is ${activeCandidate.gameState.market.tick}, expected 261`)
// Cross-check against loadCampaignLibrary's own returned working session (built
// from the library's workingCheckpointJson) — it must agree on the same state.
if (loadedLibrary.session.snapshot().stateDigest !== activeCandidate.snapshot().stateDigest) {
  throw new Error('STOP: library workingCheckpointJson session disagrees with the active record checkpoint')
}
const targetSession: BridgeSession = new BridgeSession(activeCandidate.gameState, TARGET_SESSION_ID)

// ── Emit the projection-31 public snapshot, exactly as the bridge would
// hand it to Unity before any input (no command dispatched on this session) ─
const snapshot = targetSession.snapshot()
if (snapshot.snapshotVersion !== PROJECTION_VERSION) throw new Error(`STOP: emitted snapshotVersion ${snapshot.snapshotVersion} !== current PROJECTION_VERSION ${PROJECTION_VERSION}`)
if (snapshot.schemaId !== SCHEMA_ID) throw new Error(`STOP: emitted schemaId does not match current SCHEMA_ID`)
console.error(`emitted: sessionId=${snapshot.sessionId} snapshotVersion=${snapshot.snapshotVersion} gameWeek=${snapshot.gameWeek} stateDigest=${snapshot.stateDigest}`)

// ── Identity diff against the original run's own recorded public snapshot ──
if (!existsSync(ORIGINAL_RUN_BASELINE)) throw new Error(`STOP: original run baseline not found: ${ORIGINAL_RUN_BASELINE}`)
const baseline = JSON.parse(readFileSync(ORIGINAL_RUN_BASELINE, 'utf8'))

function idsOf(obj: unknown, key: string): Set<string> {
  const found = new Set<string>()
  const walk = (v: unknown) => {
    if (Array.isArray(v)) { for (const e of v) walk(e); return }
    if (v && typeof v === 'object') {
      for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
        if (k === key && typeof val === 'string') found.add(val)
        else walk(val)
      }
    }
  }
  walk(obj)
  return found
}
function setEq(a: Set<string>, b: Set<string>): { equal: boolean; onlyA: string[]; onlyB: string[] } {
  const onlyA = [...a].filter((x) => !b.has(x)).sort()
  const onlyB = [...b].filter((x) => !a.has(x)).sort()
  return { equal: onlyA.length === 0 && onlyB.length === 0, onlyA, onlyB }
}

const identityKeys = ['talentId', 'facilityId', 'productionId'] as const
const identityReport: Record<string, ReturnType<typeof setEq>> = {}
let identityFailed = false
for (const key of identityKeys) {
  const result = setEq(idsOf(baseline.snapshot, key), idsOf(snapshot.snapshot, key))
  identityReport[key] = result
  if (!result.equal) identityFailed = true
}
const weeksMatch = baseline.gameWeek === snapshot.gameWeek
if (!weeksMatch) identityFailed = true

console.error('identity report:', JSON.stringify({ ...identityReport, weeksMatch, baselineWeek: baseline.gameWeek, emittedWeek: snapshot.gameWeek }, null, 2))
if (identityFailed) {
  throw new Error('STOP: identity sets differ between the original run baseline and the re-derived projection-31 snapshot — see identity report above. Not committing.')
}

// ── Encode: canonical JSON -> gzip -> base64 ────────────────────────────────
const json = JSON.stringify(snapshot)
const gz = gzipSync(Buffer.from(json, 'utf8'))
const b64 = gz.toString('base64')
const wireSha256 = sha(Buffer.from(json, 'utf8'))

// ── Rewrite ONLY the GeneratedWireGzip literal + its provenance header ─────
let source = readFileSync(testFile, 'utf8')

const headerRe = /\/\/ The exact generated research-active public projection from native run\n\s*\/\/ early-[0-9T:Z.-]+\. No game state or chronology is authored here\.\n\s*\/\/ It is embedded so the regression does not depend on ignored local evidence\./
const newHeader =
  `// The exact projection-31 public projection re-derived (no native run) from the\n` +
  `    // same already-generated source record (session ${TARGET_SESSION_ID}) that\n` +
  `    // produced native run ${ORIGINAL_RUN_ID}. No game state or\n` +
  `    // chronology is authored here; see generated-wire.manifest.json alongside this file.`
if (!headerRe.test(source)) throw new Error('STOP: could not locate the expected provenance header comment to rewrite')
source = source.replace(headerRe, newHeader)

const literalRe = /private const string GeneratedWireGzip =\n(?:\s*"[^"]*"\s*\+?\n)+\s*"[^"]*";/
const literalMatch = source.match(literalRe)
if (!literalMatch) throw new Error('STOP: could not locate the GeneratedWireGzip literal to rewrite')
const lines: string[] = []
for (let i = 0; i < b64.length; i += 116) lines.push(b64.slice(i, i + 116))
const rebuilt =
  'private const string GeneratedWireGzip =\n' +
  lines.map((line, i) => `            "${line}"${i === lines.length - 1 ? ';' : ' +'}`).join('\n')
source = source.replace(literalRe, rebuilt)

const sha256Re = /Is\.EqualTo\("[0-9a-f]{64}"\), "Embedded generated projection changed\."\);/
if (!sha256Re.test(source)) throw new Error('STOP: could not locate the embedded sha256 assertion to rewrite')
source = source.replace(sha256Re, `Is.EqualTo("${wireSha256}"), "Embedded generated projection changed.");`)

// ── Manifest sidecar ────────────────────────────────────────────────────────
const generatorPath = resolve('scripts/gen-playmode-embedded-wire.mts')
const generatorSha256 = sha(readFileSync(generatorPath))
const sourceCommit = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()
const manifest = {
  kind: 'r3n4-data-06-generated-wire-manifest/v1',
  sourceLibrary: SOURCE_LIBRARY,
  sourceLibrarySha256: SOURCE_LIBRARY_SHA256,
  sourceLibraryBytes: SOURCE_LIBRARY_BYTES,
  recordSessionId: TARGET_SESSION_ID,
  originalRunId: ORIGINAL_RUN_ID,
  originalRunBaseline: ORIGINAL_RUN_BASELINE,
  projectionVersion: snapshot.snapshotVersion,
  schemaId: snapshot.schemaId,
  gameWeek: snapshot.gameWeek,
  stateDigest: snapshot.stateDigest,
  wireSha256,
  generator: 'scripts/gen-playmode-embedded-wire.mts',
  generatorSha256,
  generatorSourceCommit: sourceCommit,
  identityReport,
  provenance:
    're-derived from the same source record before any input; no native run. ' +
    'Loaded generated-review-library.json (P13A worktree, read-only) through the current ' +
    'TS worktree loadCampaignLibrary/BridgeSession, selected the record whose checkpoint-internal ' +
    'sessionId equals recordSessionId, and emitted BridgeSession.snapshot() with no command dispatched.',
}
writeFileSync(testFile, source)
writeFileSync(manifestFile, JSON.stringify(manifest, null, 2) + '\n')

console.log(JSON.stringify({ result: 'PASS', testFile, manifestFile, wireSha256, gameWeek: snapshot.gameWeek, stateDigest: snapshot.stateDigest, identityReport }, null, 2))
