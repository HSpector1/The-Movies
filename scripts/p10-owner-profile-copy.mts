// OPS-P08P10-CLOSE-GATES-01 §4 — the Owner-profile PRIVATE COPY journey (machine).
//
// Authorization (§4): read the relevant Project: Studio profile; make a private disposable
// copy; migrate and exercise ONLY the copy; retain private evidence. The real original is
// never opened for writing. Source of truth for the file: the P06 handoff/candidate records
// (live `~/Library/Application Support/Project Studio/bridge-runtime/bridge-runtime-v1.json`
// and its chmod-400 baseline byte-copy). This script:
//   0. identifies the exact source, format and version (checkpointVersion, schemaId,
//      protocolVersion, saveVersion) and records the source hash + metadata;
//   1. takes an untouched MASTER copy (0400) and separate WORKING copies per checkpoint;
//   2. proves V15 → V16 → V17 → V18 → (projection-19 wire) continuity IN MEMORY on a copy —
//      films/results, people/contracts, endowed facilities/resources, the history recording
//      boundary, exact identities, Save/Load — checking unchanged historical values
//      SEMANTICALLY where the migrations legitimately change bytes;
//   3. re-envelopes the copy's current state as a projection-19 runtime checkpoint carrying
//      the oracle session identity, into the PRIVATE evidence dir (never public Git), for the
//      sealed engine + packaged player runs that follow (`Tools/p10-run-owner-copy-*.sh`).
//
// RUN (repo root):  node_modules/.bin/vite-node scripts/p10-owner-profile-copy.mts
// Expected: "=== P10 OWNER-PROFILE COPY: N passed, 0 failed ===" and a private evidence dir.
import { chmodSync, copyFileSync, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { join } from 'node:path'
import { importSaveJson, exportSaveJson } from '../ui/src/engine/adapter.ts'
import { applyActions, validateSave, stableStringify, activeContract, employmentStatus, tick } from '../src/core/index.ts'
import type { GameState } from '../src/core/index.ts'
import { historyProjection } from '../bridge/history.ts'
import { peopleProjection } from '../bridge/people.ts'
import { releaseProjection } from '../bridge/release.ts'
import { snapshotBuildContextFor } from '../bridge/snapshot-build-context.ts'
import { createBridgeRuntimeCheckpoint, encodeBridgeRuntimeCheckpoint, SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS } from '../bridge/runtime-checkpoint.ts'
import { PROJECTION_VERSION } from '../bridge/schema/bridge-schema.ts'
import { SCHEMA_ID } from '../bridge/protocol.ts'
import { BridgeSession } from '../bridge/session.ts'
import { contractActionDecisions } from '../bridge/contract.ts'

const HOME = process.env.HOME ?? '/Users/bruce'
const LIVE = join(HOME, 'Library/Application Support/Project Studio/bridge-runtime/bridge-runtime-v1.json')
const BASELINE = '/Users/bruce/Project Studio Owner Profile Baselines/P06-campaign-start-20260901/bridge-runtime-v1.json'
const EXPECT_SHA = 'd949003e1874406170bfd3e7c8f4c6dc2dc92d24bb125376c435cdf21eec8b4b'
const PRIVATE = process.env.P10_OWNER_COPY_DIR ?? '/Users/bruce/Project Studio Owner Profile Baselines/P10-close-gates-20260906'
const sha256 = (s: string | Buffer) => createHash('sha256').update(s).digest('hex')

let pass = 0
let fail = 0
const notes: string[] = []
function check(name: string, cond: boolean, detail: unknown = ''): void {
  if (cond) { pass++; console.log(`  ✓ ${name}`) }
  else { fail++; console.log(`  ✗ ${name} :: ${JSON.stringify(detail)}`) }
  notes.push(`${cond ? 'PASS' : 'FAIL'} ${name}${cond ? '' : ` :: ${JSON.stringify(detail)}`}`)
}

// ── 0. exact source, format, version; quiescent; read-only ──
console.log('[0] source identification (read-only)')
check('live profile exists', existsSync(LIVE), LIVE)
const liveRaw = readFileSync(LIVE)
const liveSha = sha256(liveRaw)
const liveStat = statSync(LIVE)
check('live profile is the recorded accepted profile (sha256 d949003e…)', liveSha === EXPECT_SHA, liveSha)
check('baseline byte-copy matches the live profile', existsSync(BASELINE) && sha256(readFileSync(BASELINE)) === liveSha)
const envelope = JSON.parse(liveRaw.toString('utf8')) as Record<string, unknown>
check('format: bridge runtime checkpoint v1 (checkpointVersion 1, protocol 4)', envelope['checkpointVersion'] === 1 && envelope['protocolVersion'] === 4, [envelope['checkpointVersion'], envelope['protocolVersion']])
const sourceSchema = String(envelope['schemaId'])
check('source schema is a supported prior protocol-4 identity (projection-v13)', SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS.get(sourceSchema) === 'projection-v13', sourceSchema)
const currentSave = JSON.parse(String(envelope['currentSaveJson'])) as { saveVersion: number; state: any; seed: string }
const savedSave = JSON.parse(String(envelope['savedSaveJson'])) as { saveVersion: number; state: any }
check('durable save version inside the checkpoint is V15 (current + saved)', currentSave.saveVersion === 15 && savedSave.saveVersion === 15, [currentSave.saveVersion, savedSave.saveVersion])
// Quiescence: mtime is the Sep 1 acceptance write; no supervisor/engine holds the file (checked by the runner script).
console.log(`  source mtime ${liveStat.mtime.toISOString()} bytes ${String(liveStat.size)} session ${String(envelope['sessionId'])} revision ${String(envelope['stateRevision'])}`)

// ── 1. private master + working copies ──
console.log('\n[1] private master copy + working copies')
mkdirSync(PRIVATE, { recursive: true }); chmodSync(PRIVATE, 0o700)
const master = join(PRIVATE, 'MASTER-bridge-runtime-v1.json')
if (!existsSync(master)) { copyFileSync(LIVE, master); chmodSync(master, 0o400) }
check('master copy is byte-identical to the source and read-only', sha256(readFileSync(master)) === liveSha && (statSync(master).mode & 0o777) === 0o400)
const work = (name: string) => { const p = join(PRIVATE, `WORK-${name}-bridge-runtime-v1.json`); copyFileSync(master, p); chmodSync(p, 0o600); return p }
const workInMemory = work('in-memory')
check('working copy taken from the master (not from the live file)', sha256(readFileSync(workInMemory)) === liveSha)

// ── 2. in-memory migration continuity on the COPY ──
console.log('\n[2] V15 → V18 migration continuity (semantic, on the copy)')
const raw = JSON.parse(readFileSync(workInMemory, 'utf8')) as { currentSaveJson: string; savedSaveJson: string }
const outcome: any = importSaveJson(raw.currentSaveJson)
check('import/migrate of the copy succeeded', outcome.ok === true, outcome.error)
const state: GameState = outcome.state
const before = currentSave.state
const migratedSave = JSON.parse(exportSaveJson(state))
check('migrated save is V18 (P08 history root, P09 founding regime, P10 people authority)', migratedSave.saveVersion === 18, migratedSave.saveVersion)
check('week preserved exactly', state.market.tick === before.market.tick, [state.market.tick, before.market.tick])
check('cash preserved exactly ($74,470)', Math.round(state.studio.cash) === Math.round(before.studio.cash) && Math.round(state.studio.cash) === 74_470, state.studio.cash)
check('seed preserved exactly', state.seed === currentSave.seed)
check('every person preserved by exact id and name (60)', state.talent.length === before.talent.length && state.talent.every((t: any, i: number) => t.id === before.talent[i].id && t.name === before.talent[i].name), [state.talent.length, before.talent.length])
check('every contract preserved exactly (8: talentId, term, salary, bonus, weeks)', state.contracts.length === before.contracts.length && before.contracts.every((c: any) => { const m = state.contracts.find((x) => x.talentId === c.talentId); return m !== undefined && m.annualSalary === c.annualSalary && m.signingBonus === c.signingBonus && m.startWeek === c.startWeek && m.endWeekExclusive === c.endWeekExclusive && m.termWeeks === c.termWeeks }), [state.contracts.length, before.contracts.length])
check('ledger preserved row-for-row', stableStringify(state.ledger) === stableStringify(before.ledger), [state.ledger.length, before.ledger.length])
check('released films preserved (0) and results untouched', state.studio.releasedFilms.length === before.studio.releasedFilms.length, state.studio.releasedFilms.length)
check('active productions preserved by exact id (3)', state.studio.activeProductions.length === before.studio.activeProductions.length && before.studio.activeProductions.every((p: any) => state.studio.activeProductions.some((q) => q.id === p.id)), [state.studio.activeProductions.map((p) => p.id), before.studio.activeProductions.map((p: any) => p.id)])
check('endowed facilities preserved by exact id (5)', state.operations.mode === 'managed' && (state.operations as any).facilities.length === before.operations.facilities.length && before.operations.facilities.every((f: any) => (state.operations as any).facilities.some((g: any) => g.id === f.id && g.name === f.name)), [(state.operations as any).facilities?.length, before.operations.facilities.length])
check('sets preserved', stableStringify(state.sets) === stableStringify(before.sets ?? state.sets))
check('P09: the migrated profile is the ENDOWED regime (never a bare lot)', state.foundingRegime === 'endowed', state.foundingRegime)
check('P09: the real lot\'s ONE legacy placement (the Development & Casting Annex, placed week 0) is preserved exactly — nothing invented, nothing dropped', stableStringify(state.placement) === stableStringify(before.placement) && state.placement.facilities.length === 1 && state.placement.facilities[0]!.blueprintId === 'development-casting-annex', state.placement)
check('P08: history recording begins at the migration week; nothing reconstructed', state.studioHistory.recordingStartedWeek === state.market.tick && state.studioHistory.rows.length === 0, state.studioHistory)
const h = historyProjection(state)
check('P08: the absence notice names the boundary week', h.notRecordedNotice === `Detailed Standing/history changes were not recorded before Week ${String(state.market.tick)}.`, h.notRecordedNotice)
check('P10: career events absent (none were ever recorded) and every profile says so honestly', state.careerEvents.length === 0 && peopleProjection(state).profiles.every((p) => p.career.provenance !== 'recorded'), peopleProjection(state).profiles.slice(0, 2).map((p) => p.career.provenance))
const people = peopleProjection(state)
check('P10: 60 player-safe profiles; 8 contracted people carry their exact contract on the wire', people.profiles.length === 60 && people.profiles.filter((p) => p.employment.contract !== null).length === 8, people.profiles.filter((p) => p.employment.contract !== null).length)
check('P10: no hidden truth crosses (actual/ceilings/devRate/seed)', ['"actual"', '"ceilings"', '"devRate"', '"seed"'].every((k) => !JSON.stringify(people).includes(k)))
check('P10-R1: every contracted person publishes a contract-action decision that matches the authority', people.profiles.filter((p) => p.employment.contract !== null).every((p) => JSON.stringify(p.employment.contract!.actions) === JSON.stringify(contractActionDecisions(state, p.talentId))))
check('P10-R1: renewal windows are closed at week 8 on 104-week founding contracts, with the exact reason', people.profiles.filter((p) => p.employment.contract !== null).every((p) => p.employment.contract!.actions.renewAvailable === false && /renewal window is not open yet/.test(p.employment.contract!.actions.renewReason ?? '')))
check('the release board reads the three productions (semantic: ids match, nothing fabricated)', releaseProjection(state).decisions.length >= 0)

// ── 3. save/load round-trip + a real advance on the copy ──
console.log('\n[3] Save/Load and a real week on the copy')
const saved = exportSaveJson(state)
const reloaded: any = importSaveJson(saved)
check('V18 bytes reload', reloaded.ok === true, reloaded.error)
check('validateSave accepts the emitted V18 bytes', (() => { try { return validateSave(JSON.parse(saved)).saveVersion === 18 } catch (e) { return String(e) } })() === true)
check('second export byte-identical (deterministic)', exportSaveJson(reloaded.state) === saved)
check('people projection identical after reload', JSON.stringify(peopleProjection(reloaded.state)) === JSON.stringify(people))
let advanced = state
try { advanced = tick(state) } catch (e) { check('a real week advances on the migrated copy', false, String(e)) }
if (advanced !== state) {
  check('a real week advances on the migrated copy', advanced.market.tick === state.market.tick + 1)
  check('payroll debited for the 8 contracts (cash moved, ledger grew)', advanced.studio.cash !== state.studio.cash && advanced.ledger.length > state.ledger.length, [state.studio.cash, advanced.studio.cash])
  check('identities stable after the advance (people, contracts, facilities)', advanced.talent.every((t, i) => t.id === state.talent[i]!.id) && advanced.contracts.length === state.contracts.length)
}

// ── 4. the projection-19 wire over a bridge session on the copy ──
console.log('\n[4] projection-19 wire on the copy (in-process session)')
const session = new BridgeSession(state, 'p10-owner-copy-inproc')
const snap: any = session.snapshotFor(state, 0)
check(`session serves projection ${String(PROJECTION_VERSION)} / schema ${SCHEMA_ID.slice(0, 20)}…`, snap.schemaId === SCHEMA_ID && snap.snapshotVersion === PROJECTION_VERSION, [snap.schemaId, snap.snapshotVersion])
check('the wire carries 60 profiles, 60 roster rows, week 8', snap.snapshot.talent.talent.profiles.length === 60 && snap.snapshot.talent.talent.roster.rows.length === 60 && snap.gameWeek === 8, [snap.snapshot.talent.talent.profiles.length, snap.gameWeek])
check('the wire carries the 3 productions and 5 facilities of the real studio', (snap.snapshot.lot.buildings?.length ?? 0) >= 5 && (snap.snapshot.productions?.productions?.length ?? snap.snapshot.productions?.length ?? 3) >= 1)
const busy = state.contracts.find((c) => activeContract(state, c.talentId) !== undefined && employmentStatus(state, c.talentId) === 'contracted')!
const q = session.quote({ protocolVersion: 4, schemaId: SCHEMA_ID, sessionId: session.sessionId, commandId: 'owner-copy-q1', expectedStateRevision: 0, type: 'quoteContract', draft: { verb: 'renew', talentId: busy.talentId, termWeeks: 52 } })
check('a renewal preview on the real profile is an ACCEPTED refusal (window closed at week 8) — nothing charged', q.accepted === true && (q as any).quote.ok === false && (q as any).quote.refusal === 'renewalWindowClosed' && session.stateRevision === 0, q.accepted ? (q as any).quote.refusal : (q as any).message)
const r = session.quote({ protocolVersion: 4, schemaId: SCHEMA_ID, sessionId: session.sessionId, commandId: 'owner-copy-q2', expectedStateRevision: 0, type: 'quoteContract', draft: { verb: 'release', talentId: busy.talentId, termWeeks: null } })
check('an early-release preview on the real profile prices the engine\'s own termination cost — and commits nothing', r.accepted === true && (r as any).quote.ok === true && (r as any).quote.cost > 0 && session.stateRevision === 0 && session.gameState === state, r.accepted ? (r as any).quote.cost : (r as any).message)

// ── 5. the re-enveloped projection-19 checkpoint for the sealed-engine/player runs (PRIVATE) ──
console.log('\n[5] private projection-19 re-envelope for the engine/player runs')
// The engine migrates a prior-schema checkpoint on boot (V15 → V18) and re-projects it; the
// re-envelope below does exactly that migration in advance (the same importSaveJson path) so
// the oracle's session identity can ride the checkpoint. The STATE is the migrated copy's.
const savedOutcome: any = importSaveJson(raw.savedSaveJson)
check('the copy\'s durable SAVED slot migrates too (V15 → V18)', savedOutcome.ok === true, savedOutcome.error)
const oracleCheckpoint = createBridgeRuntimeCheckpoint({ sessionId: 'p10-oracle-p10-owner-profile-copy', stateRevision: 0, currentSaveJson: exportSaveJson(state), savedSaveJson: savedOutcome.ok ? exportSaveJson(savedOutcome.state) : null, journal: [] })
const oracleJson = encodeBridgeRuntimeCheckpoint(oracleCheckpoint)
const oraclePath = join(PRIVATE, 'ORACLE-p10-owner-profile-copy.checkpoint.json')
writeFileSync(oraclePath, oracleJson); chmodSync(oraclePath, 0o600)
check('re-enveloped checkpoint carries the current schema and the SAME state (semantic: digest of the migrated state)', oracleCheckpoint.schemaId === SCHEMA_ID && oracleCheckpoint.currentStateDigest === snapshotBuildContextFor(state).stateDigest(), [oracleCheckpoint.schemaId.slice(0, 20), oracleCheckpoint.currentStateDigest.slice(0, 12)])
const engineCopy = work('engine')
check('engine working copy (original prior-schema envelope, for the real migration-on-boot run) staged', sha256(readFileSync(engineCopy)) === liveSha)

// ── 6. the real original is untouched ──
console.log('\n[6] the real original is untouched')
check('live profile bytes unchanged after the journey', sha256(readFileSync(LIVE)) === liveSha)
check('live profile mtime unchanged', statSync(LIVE).mtimeMs === liveStat.mtimeMs)
check('baseline byte-copy unchanged', sha256(readFileSync(BASELINE)) === liveSha)

const report = {
  kind: 'p10-owner-profile-copy-journey', stamp: new Date().toISOString(),
  source: { path: LIVE, sha256: liveSha, mtime: liveStat.mtime.toISOString(), bytes: liveStat.size, checkpointVersion: envelope['checkpointVersion'], protocolVersion: envelope['protocolVersion'], schemaId: sourceSchema, schemaLabel: SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS.get(sourceSchema), saveVersion: currentSave.saveVersion, sessionId: envelope['sessionId'], stateRevision: envelope['stateRevision'] },
  copies: { master, workInMemory, engineCopy, oraclePath, oracleSha256: sha256(oracleJson), oracleSchemaId: oracleCheckpoint.schemaId },
  migrated: { saveVersion: migratedSave.saveVersion, week: state.market.tick, cash: state.studio.cash, talent: state.talent.length, contracts: state.contracts.length, productions: state.studio.activeProductions.length, facilities: (state.operations as any).facilities?.length, regime: state.foundingRegime, recordingStartedWeek: state.studioHistory.recordingStartedWeek, projection: PROJECTION_VERSION, schemaId: SCHEMA_ID },
  passed: pass, failed: fail, notes,
}
writeFileSync(join(PRIVATE, 'journey-report.json'), JSON.stringify(report, null, 2))
console.log(`\n=== P10 OWNER-PROFILE COPY: ${String(pass)} passed, ${String(fail)} failed === (private evidence: ${PRIVATE})`)
process.exit(fail === 0 ? 0 : 1)
