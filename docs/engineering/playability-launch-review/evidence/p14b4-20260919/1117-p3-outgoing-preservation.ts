// 1116-A/B: future outgoing capture only. Parent executes once after final C.3.
// No rehearsal, fallback, seed search, state surgery or automatic retry.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, isAbsolute, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gunzipSync, gzipSync } from 'node:zlib'
import { BridgeSession } from '../../../../../bridge/session.ts'
import { PROJECTION_VERSION, PROTOCOL_VERSION, SCHEMA_ID, type ControlEnvelope } from '../../../../../bridge/protocol.ts'
import { canonicalJson } from '../../../../../bridge/schema/canonical.ts'
import { decodeBridgeRuntimeCheckpoint, encodeBridgeRuntimeCheckpoint, loadBridgeRuntimeCheckpoint,
  DEFAULT_BRIDGE_RUNTIME_CHECKPOINT_LIMITS, type BridgeRuntimeCheckpointLimits } from '../../../../../bridge/runtime-checkpoint.ts'
import { createBridgeRuntimeCoordinator, type BridgeRuntimeCoordinator } from '../../../../../bridge/runtime/runtime-coordinator.ts'
import type { BridgeCheckpointStore } from '../../../../../bridge/runtime/checkpoint-store.ts'
import { convertV38ToV37, exportSave, importSave, LIVE_SAVE_VERSION, makeSave, migrateToLive,
  validateSaveV31, validateSaveV32, validateSaveV37, validateSaveV38 } from '../../../../../src/core/save.ts'
import { tick } from '../../../../../src/core/tick.ts'
import type { GameState } from '../../../../../src/core/types.ts'

const E = 'docs/engineering/playability-launch-review/evidence/p14b4-20260919'
const ROOT = fileURLToPath(new URL('../../../../../', import.meta.url))
const SELF = `${E}/1117-p3-outgoing-preservation.ts`
const OUTPUT = 'tests/fixtures/p14/genuine-v38-pre-p3'
const SCHEMA = 'sha256:d59e144e4077f669804ca87dd6184ef23bd44c9d93e44eb795f2b66350926a4d'
const SOURCE = ['src', 'bridge', 'tests', 'generated', 'ui', 'scripts', 'package.json', 'package-lock.json',
  'tsconfig.json', 'tsconfig.bridge.json', 'tsconfig.src.json', 'vitest.config.ts', 'vitest.workspace.ts']
const MiB = 1024 * 1024
type Identity = { bytes: number; sha256: string }
const identity = (raw: string | Uint8Array): Identity => ({ bytes: typeof raw === 'string' ? Buffer.byteLength(raw) : raw.byteLength,
  sha256: createHash('sha256').update(raw).digest('hex') })
const json = (value: unknown) => JSON.stringify(value, null, 2) + '\n'
function pathOf(path: string): string {
  assert.ok(!isAbsolute(path) && !path.includes('\\') && path.split('/').every(part => part && part !== '.' && part !== '..'))
  return resolve(ROOT, path)
}
function read(path: string): Buffer {
  const absolute = pathOf(path)
  assert.ok(lstatSync(absolute).isFile() && !lstatSync(absolute).isSymbolicLink(), `regular input: ${path}`)
  return readFileSync(absolute)
}
function git(...args: string[]): string {
  return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * MiB,
    env: { ...process.env, GIT_OPTIONAL_LOCKS: '0' } })
}
const sort = (values: readonly string[]) => [...values].sort()
const nul = (value: string) => value.split('\0').filter(Boolean)
function source() {
  const paths = sort(nul(git('ls-files', '-z', '--', ...SOURCE)))
  const files = paths.map(path => ({ path, ...identity(read(path)) }))
  return { head: git('rev-parse', 'HEAD').trim(), index: identity(git('ls-files', '--stage', '-z')),
    diff: identity(git('diff', '--no-ext-diff', '--binary', 'HEAD', '--', ...SOURCE)),
    untracked: sort(nul(git('ls-files', '--others', '--exclude-standard', '-z', '--', ...SOURCE))),
    files, filesIdentity: identity(json(files)) }
}
function record(value: unknown): Record<string, unknown> {
  assert.ok(value !== null && typeof value === 'object' && !Array.isArray(value))
  return value as Record<string, unknown>
}
const INPUTS = {
  natural: { path: 'tests/fixtures/p14/genuine-v37-c3-corpus/genuine-v37-c3-preretirement-week207.json.gz', version: 37, week: 207,
    gzip: { bytes: 174595, sha256: '926de1b20fa0cba9b822c05f542f0a3949c7e4b21560c2fa508b6fa3168af5a0' },
    raw: { bytes: 1687696, sha256: 'd6ad88d432b3ec75fbf6a2843493240d4007892c8230aea1f9a2350adc8c1045' } },
  p2: { path: 'tests/fixtures/p14/genuine-v31-pre-b7/genuine-v31-bound-open-p2-lead.json.gz', version: 31, week: 52,
    gzip: { bytes: 88896, sha256: 'fcf9beaec5cf8e266d8018a979c1a9aa555976b54075e436fc9b9feafbd65018' },
    raw: { bytes: 750349, sha256: '9b01ca9a91aea1a8022827e9cf748c04b64f25666f407b955d2f59fddbb6b495' } },
  history: { path: 'tests/fixtures/p14/genuine-v31-pre-b7/genuine-v31-kept-and-broken.json.gz', version: 31, week: 61,
    gzip: { bytes: 97081, sha256: '57362b7e282d8ba85f377b558fea50397ac134531e02de8159541775f0172841' },
    raw: { bytes: 821651, sha256: '734f671b4617ffb2899ef2326ac8dff00358878be8adbc77f2a2b28d99f010d1' } },
  waiver: { path: 'tests/fixtures/p14/genuine-v32-pre-b8/genuine-v32-owes-two-p1.json.gz', version: 32, week: 104,
    gzip: { bytes: 119037, sha256: '56f629994f48ea5949a5dad5da44af5bba8ee2943451a05badd3bc4d98793daa' },
    raw: { bytes: 1007365, sha256: 'ccd30fdf7bd2f379bf44d150e03529b1c83f02086d79812800f4a255c766ea6d' } },
} as const
const FIXED: readonly { path: string; expected: Identity }[] = [
  { path: `${E}/1116-A-p3-outgoing-preservation-plan.md`, expected: { bytes: 14055, sha256: '70fc0fd92af64dde449b8770310bdc12b74b43defb8efb984f5d0a7599bd11b9' } },
  { path: `${E}/1116-B-p3-outgoing-preservation-plan-review.md`, expected: { bytes: 9051, sha256: '9c678d569d1edd15104c55316cf23d858f87c77a1cdd527cbda98f02949dd379' } },
  { path: 'tests/fixtures/p14/genuine-v37-c3-corpus/MANIFEST.json', expected: { bytes: 32532, sha256: 'b3a3251ae7b3df96a1e2a615991744c5d1e5966a095424693f086a1581244294' } },
  { path: 'tests/fixtures/p14/genuine-v31-pre-b7/MANIFEST.json', expected: { bytes: 57343, sha256: 'e48480c30d4dab1775e1728f5e254443dc4343727efb4130ca17cce9166284c7' } },
  { path: 'tests/fixtures/p14/genuine-v32-pre-b8/MANIFEST.json', expected: { bytes: 4257, sha256: '75977bce35eeb14558c1a2ddb153599e3f8109931c385e98c725b641b7dead14' } },
  { path: 'tests/fixtures/p14/genuine-v31-pre-b7/genuine-v31-bound-open-p2-lead.provenance.json', expected: { bytes: 7977, sha256: '2d7da970a321d877c87862c156026956b6990811e17c08b77b11c976609a28b8' } },
  { path: 'tests/fixtures/p14/genuine-v31-pre-b7/genuine-v31-kept-and-broken.provenance.json', expected: { bytes: 8386, sha256: 'f5136cfedc68ee79944af5045de88139b4cc4d3f9072dc05d0ba439aab2da3c5' } },
  { path: 'tests/fixtures/p14/genuine-v32-pre-b8/genuine-v32-owes-two-p1.provenance.json', expected: { bytes: 6192, sha256: 'e09dd2add10332117738b39aaadcb9117975ea8d47e873d75eb94eda765f8b24' } },
]
const FILENAMES = [
  'genuine-v38-p3-migrated-week207.json.gz', 'genuine-v38-p3-natural-week208.json.gz',
  'runtime53-current208-saved207.json.gz', 'genuine-v38-p3-bound-p2-lead-week52.json.gz',
  'genuine-v38-p3-kept-broken-week61.json.gz', 'genuine-v38-p3-before-waiver-week104.json.gz',
  'genuine-v38-p3-after-waiver-week104.json.gz', 'runtime53-waiver-current104-saved104.json.gz',
] as const
type Filename = typeof FILENAMES[number]
function argumentsForRun() {
  const args = process.argv.slice(2)
  assert.equal(args.length, 8, 'explicit --expected-head H --qualification PATH --qualification-sha256 SHA --audit-prefix PREFIX required')
  assert.deepEqual(args.filter((_, i) => i % 2 === 0), ['--expected-head', '--qualification', '--qualification-sha256', '--audit-prefix'])
  const [expectedHead, qualification, qualificationSha256, auditPrefix] = [args[1]!, args[3]!, args[5]!, args[7]!]
  assert.match(expectedHead, /^[a-f0-9]{40}$/); assert.match(qualificationSha256, /^[a-f0-9]{64}$/)
  assert.equal(dirname(qualification), E); pathOf(qualification)
  assert.equal(dirname(auditPrefix), E); assert.match(auditPrefix.slice(E.length + 1), /^1117-[a-zA-Z0-9-]+$/)
  return { expectedHead, qualification, qualificationSha256, auditPrefix }
}
const run = argumentsForRun()
const startedAt = new Date().toISOString()
const producer = identity(read(SELF))
const audits = { started: `${run.auditPrefix}.started.json`, result: `${run.auditPrefix}.json` }
for (const path of Object.values(audits)) assert.equal(existsSync(pathOf(path)), false, 'exclusive audit: ' + path)
writeFileSync(pathOf(audits.started), json({ status: 'STARTED', producer, run, startedAt }), { flag: 'wx' })
const counts = { tickReserved: 0, tickCompleted: 0, routeReserved: 0, routeCompleted: 0,
  newAccepted: 0, duplicateAccepted: 0, quoteReserved: 0, quoteCompleted: 0,
  coordinatorCreations: 0, freshFactories: 0, storeCloses: 0 }
const operations: { label: string; request: unknown; response: Identity; duplicate: boolean }[] = []
const payloads: { filename: Filename; raw: string; lineage: string }[] = []
const facts: Record<string, unknown> = {}
let phase = 'preflight', failure: string | null = null, cleanupFailure: string | null = null
let before: ReturnType<typeof source> | null = null, after: ReturnType<typeof source> | null = null
let runtime: BridgeRuntimeCoordinator | null = null
let runtimeClosed = false
let outputStarted = false
const written: { path: string; bytes: number; sha256: string }[] = []
const inputGuards = new Map<string, Identity>()
function pin(path: string, expected: Identity): Buffer {
  const raw = read(path); assert.deepEqual(identity(raw), expected, path)
  inputGuards.set(path, expected); return raw
}
function full(state: GameState): string {
  const save = makeSave(state)
  assert.equal(save.saveVersion, 38); assert.equal(validateSaveV38(save), save)
  const raw = exportSave(save)
  assert.equal(exportSave(validateSaveV38(JSON.parse(raw))), raw)
  return raw
}
function capture(filename: Filename, raw: string, lineage: string) {
  assert.ok(!payloads.some(row => row.filename === filename))
  assert.ok(Buffer.byteLength(raw) <= 16 * MiB)
  payloads.push({ filename, raw, lineage })
}
function migrated(which: keyof typeof INPUTS) {
  const input = INPUTS[which]
  const raw = gunzipSync(pin(input.path, input.gzip)).toString('utf8')
  assert.deepEqual(identity(raw), input.raw)
  const value: unknown = JSON.parse(raw)
  const old = input.version === 37 ? validateSaveV37(value) : input.version === 32 ? validateSaveV32(value) : validateSaveV31(value)
  assert.equal(old.state.market.tick, input.week); assert.equal(exportSave(old), raw)
  const state = migrateToLive(importSave(raw)).state
  assert.equal(state.market.tick, input.week); full(state)
  const oldState = record(record(value).state)
  const oldPromises = oldState.promises
  assert.ok(Array.isArray(oldPromises))
  assert.deepEqual(state.promises, oldPromises.map(p => ({ ...record(p), supersededByPromiseId: record(p).supersededByPromiseId ?? null })))
  assert.deepEqual(state.firstTakes, oldState.firstTakes)
  assert.deepEqual(state.talentMarket.receipts, record(oldState.talentMarket).receipts)
  assert.deepEqual(state.relationships, oldState.relationships)
  assert.equal(state.careerLifecycle.transitionBoundaryWeek, input.week)
  assert.equal(state.careerLifecycle.professionAnchors.length, state.talent.length)
  assert.ok(state.careerLifecycle.professionAnchors.every(row => row.kind === 'existing' && row.recordedWeek === input.week))
  assert.deepEqual(state.careerLifecycle.professionChanges, [])
  assert.deepEqual(state.careerLifecycle.transitionEvaluations, [])
  return { state, raw }
}
function reserveTick() { assert.ok(counts.tickReserved < 2); counts.tickReserved++ }
function reserveRoute() { assert.ok(counts.routeReserved < 6); counts.routeReserved++ }
function accepted(label: string, request: unknown, response: { accepted: boolean }, responseJson: string, duplicate = false) {
  assert.equal(response.accepted, true, label)
  counts.routeCompleted++; if (duplicate) counts.duplicateAccepted++; else counts.newAccepted++
  operations.push({ label, request, response: identity(responseJson), duplicate })
}
function control(sessionId: string, stateRevision: number, commandId: string): ControlEnvelope {
  return { protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId, expectedStateRevision: stateRevision, commandId }
}
function checkpoint(raw: string, currentWeek: number, savedWeek: number) {
  const decoded = decodeBridgeRuntimeCheckpoint(raw)
  assert.equal(encodeBridgeRuntimeCheckpoint(decoded.checkpoint), raw)
  const loaded = loadBridgeRuntimeCheckpoint(raw, undefined, () => { throw new Error('current 53 cannot invoke migration factory') })
  assert.equal(loaded.migratedFromProtocolVersion, null)
  assert.equal(encodeBridgeRuntimeCheckpoint(loaded.hydrated.checkpoint), raw)
  const cp = decoded.checkpoint
  assert.equal(cp.schemaId, SCHEMA); assert.equal(cp.protocolVersion, 4)
  assert.equal(decoded.currentSave.state.market.tick, currentWeek); assert.ok(decoded.savedSave)
  assert.equal(decoded.savedSave.state.market.tick, savedWeek)
  assert.equal(full(decoded.currentSave.state), cp.currentSaveJson)
  assert.equal(full(decoded.savedSave.state), cp.savedSaveJson)
  assert.equal(identity(cp.currentSaveJson).sha256, cp.currentStateDigest)
  assert.ok(cp.savedSaveJson); assert.equal(identity(cp.savedSaveJson).sha256, cp.savedStateDigest)
  assert.equal(identity(canonicalJson(cp.journal)).sha256, cp.journalDigest)
  return decoded
}
function choices(state: GameState) {
  for (const [personId, target] of [['authored-0000', 'director'], ['authored-0001', 'writer']] as const) {
    assert.equal(state.talent.find(row => row.id === personId)?.role, target)
    const changes = state.careerLifecycle.professionChanges.filter(row => row.personId === personId)
    const evaluations = state.careerLifecycle.transitionEvaluations.filter(row => row.personId === personId)
    assert.equal(changes.length, 1); assert.equal(changes[0]!.week, 208)
    assert.equal(changes[0]!.from, 'actor'); assert.equal(changes[0]!.to, target)
    assert.equal(evaluations.length, 1); assert.equal(evaluations[0]!.week, 208)
    assert.equal(evaluations[0]!.outcome, 'chosen'); assert.equal(evaluations[0]!.selected, target)
    assert.equal(state.careerLifecycle.records.find(row => row.personId === personId && row.profession === 'actor')?.retiredWeek, 208)
  }
}
function runtimeFacts(decoded: ReturnType<typeof decodeBridgeRuntimeCheckpoint>) {
  const cp = decoded.checkpoint
  assert.ok(cp.savedSaveJson && decoded.savedSave)
  return { sessionId: cp.sessionId, stateRevision: cp.stateRevision,
    currentWeek: decoded.currentSave.state.market.tick, savedWeek: decoded.savedSave.state.market.tick,
    currentSave: identity(cp.currentSaveJson), savedSave: identity(cp.savedSaveJson), journalDigest: cp.journalDigest,
    journal: cp.journal.map(row => ({ route: row.route, commandId: row.commandId,
      request: identity(row.requestJson), response: identity(row.responseJson) })) }
}
class MemoryStore implements BridgeCheckpointStore {
  checkpointPath = '/synthetic/1117-outgoing-preservation.json'
  writes = 0
  closed = false
  constructor(public contents: string | null = null) {}
  async read() { assert.equal(this.closed, false); return this.contents }
  async writeAtomic(text: string) { assert.equal(this.closed, false); this.contents = text; this.writes++ }
  async close() { assert.equal(this.closed, false); this.closed = true; counts.storeCloses++ }
}
let store = new MemoryStore()
function sourceAndInputGuard(expectedOutputs: readonly string[]) {
  assert.ok(before)
  const current = source()
  assert.deepEqual({ ...current, untracked: [] }, { ...before, untracked: [] }, 'existing source, HEAD and index unchanged')
  assert.deepEqual(current.untracked, sort(expectedOutputs), 'only exact declared new fixture outputs')
  for (const [path, expected] of inputGuards) assert.deepEqual(identity(read(path)), expected, 'unchanged input: ' + path)
  assert.deepEqual(identity(read(SELF)), producer, 'producer unchanged')
  after = current
}

try {
  assert.equal(existsSync(pathOf(OUTPUT)), false, 'never overwrite or reuse a fixture directory')
  before = source()
  assert.equal(before.head, run.expectedHead); assert.deepEqual(before.diff, identity(''))
  assert.deepEqual(before.untracked, [])
  assert.equal(LIVE_SAVE_VERSION, 38); assert.equal(PROJECTION_VERSION, 53); assert.equal(PROTOCOL_VERSION, 4); assert.equal(SCHEMA_ID, SCHEMA)
  assert.deepEqual(DEFAULT_BRIDGE_RUNTIME_CHECKPOINT_LIMITS,
    { maxCheckpointBytes: 192 * MiB, maxJournalEntries: 512, maxJournalBytes: 64 * MiB })
  for (const row of FIXED) pin(row.path, row.expected)
  const qualification = read(run.qualification)
  assert.equal(identity(qualification).sha256, run.qualificationSha256)
  inputGuards.set(run.qualification, identity(qualification))

  phase = 'zero-tick-p2-and-terminal-history'
  const p2 = migrated('p2').state
  assert.equal(p2.promises.length, 1); assert.equal(p2.firstTakes.length, 20); assert.equal(p2.talentMarket.receipts.length, 3)
  const lead = p2.promises[0]!
  assert.equal(lead.promiseId, 'promise-0'); assert.equal(lead.version, 4)
  assert.equal(lead.family, 'LEAD_OR_SIGNIFICANT_ROLE_COUNT')
  assert.deepEqual(lead.predicate, { kind: 'castRoleCount', count: 1, seatClass: 'lead' })
  assert.equal(lead.windowStartWeek, 52); assert.equal(lead.dueWeekExclusive, 92); assert.equal(lead.outcome, null)
  assert.ok(lead.contractId && p2.hollywood?.employment.some(row => row.contractId === lead.contractId))
  capture(FILENAMES[3], full(p2), 'genuine V31 week52 -> actual current migration; zero ticks, unchanged P2')
  const history = migrated('history').state
  assert.equal(history.promises.length, 2); assert.equal(history.firstTakes.length, 25); assert.equal(history.talentMarket.receipts.length, 8)
  for (const [id, outcome, progress] of [['promise-0', 'SATISFIED', 1], ['promise-1', 'BROKEN', 0]] as const) {
    const row = history.promises.find(p => p.promiseId === id); assert.ok(row)
    assert.equal(row.outcome, outcome); assert.equal(row.outcomeWeek, 61); assert.equal(row.progress, progress)
    assert.equal(history.talentMarket.receipts.filter(receipt => receipt.eventId === row.outcomeEventId).length, 1)
  }
  assert.deepEqual(history.promises[0]!.evidenceRefs, ['first-take-event-24']); assert.deepEqual(history.promises[1]!.evidenceRefs, [])
  capture(FILENAMES[4], full(history), 'genuine V31 week61 -> actual current migration; preserved P1 kept/broken facts')
  facts.historical = { p2: p2.promises, keptBroken: history.promises }

  phase = 'natural207-admission-and-save'
  const natural = migrated('natural')
  assert.equal(exportSave(convertV38ToV37(makeSave(natural.state))), natural.raw)
  assert.equal(natural.state.promises.length, 59); assert.equal(natural.state.firstTakes.length, 85)
  assert.ok(natural.state.promises.every(row => row.family === 'APPEARANCE_COUNT' && row.outcome === null && !('kind' in row.predicate)))
  assert.equal(natural.state.careerLifecycle.cohorts.length, 3); assert.equal(natural.state.careerLifecycle.records.length, 2)
  for (const id of ['authored-0000', 'authored-0001']) {
    const row = natural.state.careerLifecycle.records.find(row => row.personId === id); assert.ok(row)
    assert.equal(row.profession, 'actor'); assert.equal(row.status, 'announced'); assert.equal(row.effectiveWeek, 208)
  }
  const raw207 = full(natural.state); capture(FILENAMES[0], raw207, 'genuine V37 week207 -> actual Save38 migration')
  const options = (target: MemoryStore) => ({ store: target, fatal: (error: unknown) => { throw error },
    createFreshSession: (limits: BridgeRuntimeCheckpointLimits) => {
      counts.freshFactories++; assert.equal(counts.freshFactories, 1); assert.deepEqual(limits, DEFAULT_BRIDGE_RUNTIME_CHECKPOINT_LIMITS)
      return new BridgeSession(natural.state, '1117-natural-207', null, { limits })
    } })
  counts.coordinatorCreations++; runtime = await createBridgeRuntimeCoordinator(options(store))
  const first = await runtime.read(session => session.snapshot())
  const saveRequest = control(first.sessionId, first.stateRevision, '1117-natural-save207')
  reserveRoute(); const saved = await runtime.dispatch('save', saveRequest)
  accepted('natural/save207', saveRequest, saved.response, saved.responseJson); assert.equal(saved.firstSeen, true)
  assert.ok(store.contents); const at207 = checkpoint(store.contents, 207, 207)
  assert.equal(at207.checkpoint.currentSaveJson, raw207); assert.equal(at207.checkpoint.savedSaveJson, raw207)
  assert.deepEqual(at207.checkpoint.journal.map(row => row.route), ['save'])

  phase = 'actual-coordinator-207-to208'
  const snap = await runtime.read(session => session.snapshot())
  const advance = snap.availableIntents.find(row => row.kind === 'advanceWeek'); assert.ok(advance)
  const advanceRequest = { ...control(snap.sessionId, snap.stateRevision, '1117-natural-advance208'), type: 'submitIntent' as const,
    payload: { intentId: advance.intentId } }
  reserveRoute(); reserveTick(); const advanced = await runtime.dispatch('command', advanceRequest)
  accepted('natural/advance208', advanceRequest, advanced.response, advanced.responseJson); assert.equal(advanced.firstSeen, true)
  assert.ok(store.contents); const runtimeRaw = store.contents
  const at208 = checkpoint(runtimeRaw, 208, 207); counts.tickCompleted++; choices(at208.currentSave.state)
  assert.equal(at208.checkpoint.savedSaveJson, raw207)
  assert.notEqual(at208.checkpoint.currentSaveJson, at208.checkpoint.savedSaveJson)
  assert.deepEqual(at208.checkpoint.journal.map(row => [row.route, row.commandId]), [['save', saveRequest.commandId], ['command', advanceRequest.commandId]])
  assert.equal(at208.checkpoint.journal[0]!.requestJson, canonicalJson(saveRequest)); assert.equal(at208.checkpoint.journal[0]!.responseJson, saved.responseJson)
  assert.equal(at208.checkpoint.journal[1]!.requestJson, canonicalJson(advanceRequest)); assert.equal(at208.checkpoint.journal[1]!.responseJson, advanced.responseJson)

  phase = 'independent-core-207-to208'
  const independent = migrated('natural').state
  assert.equal(full(independent), raw207)
  reserveTick(); const direct = tick(independent, { develop: true }); counts.tickCompleted++
  choices(direct); assert.equal(full(direct), at208.checkpoint.currentSaveJson, 'complete canonical current-source continuation parity')
  capture(FILENAMES[1], at208.checkpoint.currentSaveJson, 'actual current Bridge advance207->208; independent develop:true tick matches')
  capture(FILENAMES[2], runtimeRaw, 'actual coordinator SAVE207 and advance208, distinct slots and real journal')
  facts.natural = { records: at208.currentSave.state.careerLifecycle.records,
    changes: at208.currentSave.state.careerLifecycle.professionChanges, evaluations: at208.currentSave.state.careerLifecycle.transitionEvaluations,
    promises: at208.currentSave.state.promises.length, firstTakes: at208.currentSave.state.firstTakes.length,
    marketReceipts: at208.currentSave.state.talentMarket.receipts.length, parity: 'PASS', original37ParityRecord: 'preserved FAIL in original manifest' }

  phase = 'actual-coordinator-restart-and-duplicate'
  await runtime.close(); assert.equal(store.closed, true); runtime = null
  store = new MemoryStore(runtimeRaw)
  counts.coordinatorCreations++; runtime = await createBridgeRuntimeCoordinator(options(store))
  assert.equal(store.contents, runtimeRaw); assert.equal(store.writes, 0); assert.equal(counts.freshFactories, 1)
  reserveRoute(); const replay = await runtime.dispatch('command', advanceRequest)
  accepted('natural/replayed-advance', advanceRequest, replay.response, replay.responseJson, true)
  assert.equal(replay.firstSeen, false); assert.equal(replay.responseJson, advanced.responseJson)
  assert.equal(store.contents, runtimeRaw); assert.equal(store.writes, 0)
  assert.equal(checkpoint(store.contents!, 208, 207).checkpoint.stateRevision, at208.checkpoint.stateRevision)
  facts.naturalRuntime = { ...runtimeFacts(at208), duplicateFirstSeen: replay.firstSeen,
    restartStoreWrites: store.writes, restoredExactCheckpoint: true }
  await runtime.close(); assert.equal(store.closed, true); runtime = null; runtimeClosed = true

  phase = 'waiver-input-and-real-save'
  const owed = migrated('waiver').state
  assert.equal(owed.promises.length, 1); assert.equal(owed.firstTakes.length, 40); assert.equal(owed.talentMarket.receipts.length, 3)
  const original = owed.promises[0]!
  assert.equal(original.promiseId, 'promise-0'); assert.equal(original.family, 'APPEARANCE_COUNT')
  assert.deepEqual(original.predicate, { count: 2 }); assert.equal(original.progress, 0); assert.deepEqual(original.evidenceRefs, [])
  assert.equal(original.version, 4); assert.equal(original.outcome, null); assert.equal(original.supersededByPromiseId, null)
  assert.equal(original.windowStartWeek, 104); assert.equal(original.dueWeekExclusive, 194)
  assert.equal(original.contractId, 'studio-aca408ec-player:contract:t-act-09:104:player-30')
  assert.equal(original.issuerStudioId, owed.hollywood?.playerStudioId)
  const rawBefore = full(owed)
  const beforeWaiver = validateSaveV38(JSON.parse(rawBefore)).state
  const originalSnapshot = beforeWaiver.promises[0]!
  const session = new BridgeSession(owed, '1117-actual-waiver', null, { limits: DEFAULT_BRIDGE_RUNTIME_CHECKPOINT_LIMITS })
  const waiverSaveRequest = control(session.sessionId, session.stateRevision, '1117-waiver-save104')
  reserveRoute(); const waiverSave = session.save(waiverSaveRequest)
  accepted('waiver/save104', waiverSaveRequest, waiverSave, canonicalJson(waiverSave))
  assert.equal(full(session.gameState), rawBefore)
  capture(FILENAMES[5], rawBefore, 'genuine V32 owes-two -> actual current migration; before new public waiver')

  phase = 'actual-public-waiver'
  assert.ok(counts.quoteReserved < 1); counts.quoteReserved++
  const quoteRequest = { ...control(session.sessionId, session.stateRevision, '1117-waiver-quote'), type: 'quoteWaivePromise' as const,
    draft: { promiseId: 'promise-0', substitute: { family: 'APPEARANCE_COUNT' as const, count: 2, windowStartWeek: 105, dueWeekExclusive: 165 } } }
  const quoted = session.quote(quoteRequest)
  assert.ok(quoted.accepted && quoted.quote.kind === 'waivePromise')
  assert.equal(quoted.quote.ok, true); assert.equal(quoted.quote.refusalReason, null); assert.ok(quoted.quote.intentId)
  counts.quoteCompleted++; assert.equal(full(session.gameState), rawBefore, 'quote authority purity')
  const waiverRequest = { ...control(session.sessionId, session.stateRevision, '1117-waiver-commit'), type: 'submitIntent' as const,
    payload: { intentId: quoted.quote.intentId } }
  reserveRoute(); const waivedResponse = session.command(waiverRequest)
  accepted('waiver/commit', waiverRequest, waivedResponse, canonicalJson(waivedResponse))
  const afterWaiver = session.gameState, rawAfter = full(afterWaiver)
  assert.equal(afterWaiver.market.tick, 104); assert.equal(afterWaiver.promises.length, 2)
  const waived = afterWaiver.promises.find(row => row.promiseId === 'promise-0')!
  const successor = afterWaiver.promises.find(row => row.promiseId === 'promise-1')!
  assert.equal(waived.outcome, 'WAIVED'); assert.equal(waived.outcomeWeek, 104); assert.equal(waived.supersededByPromiseId, 'promise-1')
  assert.equal(waived.progress, originalSnapshot.progress); assert.deepEqual(waived.evidenceRefs, originalSnapshot.evidenceRefs)
  for (const key of Object.keys(originalSnapshot).filter(key => !['outcome', 'outcomeWeek', 'outcomeCause', 'outcomeEventId', 'supersededByPromiseId'].includes(key))) {
    assert.deepEqual(record(waived)[key], record(originalSnapshot)[key], 'waiver preserves original field: ' + key)
  }
  assert.equal(successor.contractId, originalSnapshot.contractId); assert.equal(successor.outcome, null)
  assert.equal(successor.beneficiaryPersonId, originalSnapshot.beneficiaryPersonId)
  assert.equal(successor.issuerStudioId, originalSnapshot.issuerStudioId)
  assert.equal(successor.version, 4); assert.equal(successor.feasibilityReceipt.rulesVersion, 4)
  assert.equal(successor.family, 'APPEARANCE_COUNT'); assert.deepEqual(successor.predicate, { count: 2 })
  assert.equal(successor.windowStartWeek, 105); assert.equal(successor.dueWeekExclusive, 165)
  assert.equal(successor.progress, 0); assert.deepEqual(successor.evidenceRefs, [])
  assert.deepEqual(afterWaiver.firstTakes, beforeWaiver.firstTakes)
  assert.deepEqual(afterWaiver.talentMarket.receipts.slice(0, beforeWaiver.talentMarket.receipts.length), beforeWaiver.talentMarket.receipts)
  assert.equal(afterWaiver.talentMarket.receipts.length, beforeWaiver.talentMarket.receipts.length + 1)
  assert.equal(afterWaiver.talentMarket.receipts.filter(row => row.eventId === waived.outcomeEventId).length, 1)
  capture(FILENAMES[6], rawAfter, 'one actual current public waiver after genuine V32 migration; newly created link, not an old captured fact')
  const waiverRuntime = encodeBridgeRuntimeCheckpoint(session.exportRuntimeCheckpoint())
  const waiverDecoded = checkpoint(waiverRuntime, 104, 104)
  assert.equal(waiverDecoded.checkpoint.currentSaveJson, rawAfter); assert.equal(waiverDecoded.checkpoint.savedSaveJson, rawBefore)
  assert.notEqual(rawAfter, rawBefore)
  assert.deepEqual(waiverDecoded.checkpoint.journal.map(row => [row.route, row.commandId]), [['save', waiverSaveRequest.commandId], ['command', waiverRequest.commandId]])
  assert.equal(waiverDecoded.checkpoint.journal[0]!.requestJson, canonicalJson(waiverSaveRequest))
  assert.equal(waiverDecoded.checkpoint.journal[0]!.responseJson, canonicalJson(waiverSave))
  assert.equal(waiverDecoded.checkpoint.journal[1]!.requestJson, canonicalJson(waiverRequest))
  assert.equal(waiverDecoded.checkpoint.journal[1]!.responseJson, canonicalJson(waivedResponse))
  const reopened = BridgeSession.fromRuntimeCheckpoint(waiverDecoded)
  reserveRoute(); const repeated = reopened.command(waiverRequest)
  accepted('waiver/replayed-command', waiverRequest, repeated, canonicalJson(repeated), true)
  assert.equal(canonicalJson(repeated), canonicalJson(waivedResponse)); assert.equal(full(reopened.gameState), rawAfter)
  assert.equal(encodeBridgeRuntimeCheckpoint(reopened.exportRuntimeCheckpoint()), waiverRuntime)
  facts.waiverRuntime = { ...runtimeFacts(waiverDecoded), duplicateRestoredExactCheckpoint: true }
  capture(FILENAMES[7], waiverRuntime, 'actual SAVE before waiver and one public waiver command; same-week distinct slots, real journal and duplicate replay')
  facts.waiver = { input: originalSnapshot, quoteRequest, quote: quoted.quote, original: waived, successor,
    limitation: 'Count2/progress0 proves a real link, not partly served waiver behavior or old P3.' }
  assert.deepEqual(counts, { tickReserved: 2, tickCompleted: 2, routeReserved: 6, routeCompleted: 6,
    newAccepted: 4, duplicateAccepted: 2, quoteReserved: 1, quoteCompleted: 1,
    coordinatorCreations: 2, freshFactories: 1, storeCloses: 2 })
  assert.equal(runtimeClosed, true)
} catch (error) {
  failure = error instanceof Error ? error.message : String(error)
} finally {
  if (runtime !== null) {
    try { await runtime.close(); assert.equal(store.closed, true); runtime = null }
    catch (error) { cleanupFailure = error instanceof Error ? error.message : String(error) }
  }
}

let manifestIdentity: Identity | null = null
if (failure === null && cleanupFailure === null) {
  try {
    phase = 'prepare-exclusive-nine-artifact-mint'
    sourceAndInputGuard([])
    assert.deepEqual(sort(payloads.map(row => row.filename)), sort(FILENAMES))
    assert.ok(payloads.reduce((total, row) => total + Buffer.byteLength(row.raw), 0) <= 64 * MiB)
    const artifacts = payloads.map(row => {
      const compressed = gzipSync(row.raw, { level: 9 })
      assert.equal(gunzipSync(compressed).toString('utf8'), row.raw)
      return { ...row, compressed, rawIdentity: identity(row.raw), gzipIdentity: identity(compressed) }
    })
    assert.ok(artifacts.reduce((total, row) => total + row.compressed.length, 0) <= 16 * MiB)
    const manifest = { status: 'CAPTURED_OUTGOING_AUTHORITY_NOT_P3_QUALIFICATION', generatedAt: new Date().toISOString(),
      sourceHead: run.expectedHead, qualification: { path: run.qualification, sha256: run.qualificationSha256 },
      sourceBefore: before, producer: { path: SELF, ...producer }, saveVersion: 38, projectionVersion: 53, protocolVersion: 4, schemaId: SCHEMA,
      inputs: INPUTS, pinnedInputs: [...inputGuards].map(([path, expected]) => ({ path, ...expected })),
      limits: DEFAULT_BRIDGE_RUNTIME_CHECKPOINT_LIMITS, counters: counts, operations, facts,
      artifacts: artifacts.map(({ raw: _raw, compressed: _compressed, ...metadata }) => metadata),
      outputNames: [...FILENAMES, 'MANIFEST.json'], storage: 'actual raw-checkpoint coordinator; injected in-memory store, no real-disk/native/latency claim',
      cleanup: 'both coordinator-owned stores closed before fixture output creation',
      historicalLimit: 'Original V37 development provenance and twelve-digest parity FAIL remain immutable; no old P3 or old waiver link fabricated.',
      environment: { node: process.version, platform: process.platform, arch: process.arch } }
    const manifestRaw = json(manifest); assert.ok(Buffer.byteLength(manifestRaw) <= MiB)
    assert.equal(existsSync(pathOf(OUTPUT)), false); sourceAndInputGuard([])
    mkdirSync(pathOf(OUTPUT)); outputStarted = true
    for (const row of artifacts) {
      const path = `${OUTPUT}/${row.filename}`
      writeFileSync(pathOf(path), row.compressed, { flag: 'wx' })
      assert.deepEqual(identity(read(path)), row.gzipIdentity)
      written.push({ path, ...row.gzipIdentity })
    }
    sourceAndInputGuard(artifacts.map(row => `${OUTPUT}/${row.filename}`))
    const manifestPath = `${OUTPUT}/MANIFEST.json`
    writeFileSync(pathOf(manifestPath), manifestRaw, { flag: 'wx' }); manifestIdentity = identity(manifestRaw)
    assert.deepEqual(identity(read(manifestPath)), manifestIdentity); written.push({ path: manifestPath, ...manifestIdentity })
    assert.deepEqual(sort(readdirSync(pathOf(OUTPUT))), sort([...FILENAMES, 'MANIFEST.json']))
    sourceAndInputGuard([...FILENAMES, 'MANIFEST.json'].map(name => `${OUTPUT}/${name}`))
    phase = 'complete'
  } catch (error) { failure = error instanceof Error ? error.message : String(error) }
}
if (failure !== null || cleanupFailure !== null) {
  try { sourceAndInputGuard(outputStarted ? readdirSync(pathOf(OUTPUT)).map(name => `${OUTPUT}/${name}`) : []) }
  catch (error) { facts.finalGuardFailure = error instanceof Error ? error.message : String(error) }
  process.exitCode = 1
}
const result = { status: failure === null && cleanupFailure === null ? 'PASS' : 'FAIL', phase, startedAt, closedAt: new Date().toISOString(),
  run, producer, sourceBefore: before, sourceAfter: after, counts, operations, failure, cleanupFailure, facts,
  outputStarted, written, manifestIdentity, limitation: 'Capture only; all earlier failures and qualification limits remain.' }
writeFileSync(pathOf(audits.result), json(result), { flag: 'wx' })
console.log(JSON.stringify({ marker: 'OUTGOING_38_53_CAPTURE', status: result.status, phase, counts,
  audit: { path: audits.result, ...identity(read(audits.result)) }, written, failure, cleanupFailure }))
