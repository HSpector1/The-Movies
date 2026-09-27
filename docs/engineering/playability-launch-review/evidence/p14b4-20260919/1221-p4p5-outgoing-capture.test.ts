// 1219-A/B and1220-C: new outgoing39/54 evidence, never a repeat of1171/1117.
// Dedicated Vitest context; parent alone executes. No cleanup, retries or fallback.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { isAbsolute, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gunzipSync, gzipSync } from 'node:zlib'
import { it, vi } from 'vitest'
import * as core from '../../../../../src/core/index.js'
import { bound, firstFilm, secondFilm, afterTakeCancellation, counters, outcomeCounters,
  continuityCounters, rivalCounters } from '../../../../../tests/helpers/p14p3-fixtures.js'
import { activeContract } from '../../../../../src/core/employment.js'
import { exportSave, importSave, LIVE_SAVE_VERSION, makeSave, stableStringify, validateSaveV39 } from '../../../../../src/core/save.js'
import type { GameState, ProfessionalPromise } from '../../../../../src/core/types.js'
import { BridgeSession } from '../../../../../bridge/session.ts'
import { PROJECTION_VERSION, PROTOCOL_VERSION, SCHEMA_ID, validateCommand, validateControl, validateQuote } from '../../../../../bridge/protocol.ts'
import { BRIDGE_SCHEMA } from '../../../../../bridge/schema/bridge-schema.ts'
import { parseWireValue } from '../../../../../bridge/schema/runtime.ts'
import { canonicalJson } from '../../../../../bridge/schema/canonical.ts'
import { decodeBridgeRuntimeCheckpoint, loadBridgeRuntimeCheckpoint, DEFAULT_BRIDGE_RUNTIME_CHECKPOINT_LIMITS,
  type BridgeRuntimeCheckpointLimits } from '../../../../../bridge/runtime-checkpoint.ts'
import { createBridgeRuntimeCoordinator, type BridgeRuntimeCoordinator } from '../../../../../bridge/runtime/runtime-coordinator.ts'
import type { BridgeCheckpointStore } from '../../../../../bridge/runtime/checkpoint-store.ts'

const E = 'docs/engineering/playability-launch-review/evidence/p14b4-20260919'
const ROOT = fileURLToPath(new URL('../../../../../', import.meta.url))
const STEM = `${E}/1221-p4p5-outgoing-capture`
const SOURCE_MANIFEST = `${E}/1221-p4p5-outgoing-source-manifest.json`
const OUTPUT = `${E}/1221-p4p5-outgoing-capture`
const OUTPUT_NAMES = ['director-bound-week52.json.gz', 'director-earned-week61.json.gz',
  'director-satisfied-week78.json.gz', 'director-canceled-work-week61.json.gz',
  'director-waived-week61.json.gz', 'runtime54-waiver-current61-saved61.json.gz', 'MANIFEST.json'] as const
const SOURCE = ['src', 'bridge', 'tests', 'generated', 'ui', 'scripts', 'package.json', 'package-lock.json',
  'tsconfig.json', 'tsconfig.bridge.json', 'tsconfig.src.json', 'vitest.config.ts', 'vitest.workspace.ts']
const DOC_INPUTS = [`${STEM}.config.ts`, `${STEM}.test.ts`, `${STEM}.tsconfig.json`,
  `${E}/1218-A-p4p5-source-boundary-preparation.md`, `${E}/1218-B-p4p5-source-boundary-review.md`,
  `${E}/1219-A-p4p5-preservation-test-proposal.md`, `${E}/1219-B-p4p5-preservation-plan-review.md`,
  `${E}/1220-C-p4p5-preservation-release.md`]
const INPUT_MANIFEST = 'tests/fixtures/p14/genuine-v37-c3-corpus/MANIFEST.json'
const INPUT_GZIP = 'tests/fixtures/p14/genuine-v37-c3-corpus/genuine-v37-c3-created-week0.json.gz'
const IMMUTABLE_INPUTS = [INPUT_MANIFEST, INPUT_GZIP,
  `${E}/1171-p3-current45-capture/MANIFEST.json`,
  `${E}/1171-p3-current45-capture/genuine-v39-p3-market-week45.json.gz`]
const HELPER = 'tests/helpers/p14p3-fixtures.ts'
const ORIGINAL_TEST = 'tests/p14p3-directing-promises.test.ts'
const clone = <T>(value: T): T => structuredClone(value)

const MiB = 1024 * 1024
type Identity = { bytes: number; sha256: string }
type FileIdentity = Identity & { path: string }
type SourceManifest = {
  kind: '1221-p4p5-outgoing-source-manifest'; version: 1; preparationHead: string;
  sourcePaths: string[]; files: FileIdentity[]; docs: FileIdentity[];
  immutableInputs: FileIdentity[]; rawInput: Identity;
}
const json = (value: unknown): string => JSON.stringify(value, null, 2) + '\n'
const identify = (value: string | Uint8Array): Identity => ({
  bytes: typeof value === 'string' ? Buffer.byteLength(value) : value.byteLength,
  sha256: createHash('sha256').update(value).digest('hex'),
})
const sorted = (values: readonly string[]): string[] => [...values].sort()
const splitNul = (value: string): string[] => value.split('\0').filter(Boolean)
function absolute(path: string): string {
  assert.ok(!isAbsolute(path) && !path.includes('\\')
    && path.split('/').every(part => part !== '' && part !== '.' && part !== '..'), 'safe repository-relative path')
  return resolve(ROOT, path)
}
function read(path: string): Buffer {
  const at = absolute(path), stat = lstatSync(at)
  assert.ok(stat.isFile() && !stat.isSymbolicLink(), `regular input: ${path}`)
  return readFileSync(at)
}
function git(...args: string[]): string {
  return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * MiB,
    env: { ...process.env, GIT_OPTIONAL_LOCKS: '0' } })
}
function file(path: string): FileIdentity { return { path, ...identify(read(path)) } }
function checkIdentity(actual: Identity, expected: Identity, label: string): void {
  assert.equal(actual.bytes, expected.bytes, `${label}: bytes`)
  assert.equal(actual.sha256, expected.sha256, `${label}: SHA256`)
}
function sameFiles(actual: FileIdentity[], expected: FileIdentity[], label: string): void {
  assert.deepEqual(actual.map(row => row.path), expected.map(row => row.path), `${label}: ordered paths`)
  for (let i = 0; i < actual.length; i++) checkIdentity(actual[i]!, expected[i]!, `${label}: ${actual[i]!.path}`)
}
function snapshot() {
  const paths = sorted(splitNul(git('ls-files', '-z', '--', ...SOURCE)))
  assert.equal(new Set(paths).size, paths.length, 'unique consumed paths')
  const indexPath = git('rev-parse', '--git-path', 'index').trim()
  const indexAt = isAbsolute(indexPath) ? indexPath : resolve(ROOT, indexPath)
  assert.ok(lstatSync(indexAt).isFile() && !lstatSync(indexAt).isSymbolicLink(), 'regular Git index')
  return {
    head: git('rev-parse', 'HEAD').trim(),
    index: identify(readFileSync(indexAt)), stagedEntries: identify(git('ls-files', '--stage', '-z')),
    diff: identify(git('diff', '--no-ext-diff', '--binary', 'HEAD', '--', ...SOURCE)),
    untracked: sorted(splitNul(git('ls-files', '--others', '--exclude-standard', '-z', '--', ...SOURCE))),
    files: paths.map(file), docs: sorted([...DOC_INPUTS, SOURCE_MANIFEST]).map(file),
  }
}
type Snapshot = ReturnType<typeof snapshot>
function unchanged(before: Snapshot, after: Snapshot): void {
  assert.equal(after.head, before.head, 'HEAD unchanged')
  checkIdentity(after.index, before.index, 'raw Git index unchanged')
  checkIdentity(after.stagedEntries, before.stagedEntries, 'Git stage entries unchanged')
  checkIdentity(after.diff, before.diff, 'consumed diff unchanged')
  assert.deepEqual(after.untracked, before.untracked, 'consumed untracked unchanged')
  sameFiles(after.files, before.files, 'consumed source unchanged')
  sameFiles(after.docs, before.docs, 'manual docs/config/manifest inputs unchanged')
}
function compact(value: Snapshot) {
  return { head: value.head, index: value.index, stagedEntries: value.stagedEntries, diff: value.diff,
    untracked: value.untracked, fileCount: value.files.length, files: identify(json(value.files)), docs: value.docs }
}
function allCounters() {
  return { player: counters(), outcomes: outcomeCounters(), continuity: continuityCounters(), rival: rivalCounters() }
}
function exactCounters(expectedPlayer: number): void {
  assert.equal(counters().actualTicks, expectedPlayer, 'exact unchanged-helper player calls')
  assert.equal(outcomeCounters().total, expectedPlayer)
  assert.ok(outcomeCounters().branches.every(row => row.actualTicks === 0), 'zero outcome branch advances')
  assert.equal(continuityCounters().lifecycleCalls, 0); assert.equal(continuityCounters().total, expectedPlayer)
  assert.equal(rivalCounters().rivalCalls, 0); assert.equal(rivalCounters().total, expectedPlayer)
}
function manifestFrom(raw: Buffer): SourceManifest {
  assert.ok(raw.byteLength <= MiB, 'source manifest <=1MiB')
  const value = JSON.parse(raw.toString('utf8')) as SourceManifest
  assert.equal(value.kind, '1221-p4p5-outgoing-source-manifest'); assert.equal(value.version, 1)
  assert.match(value.preparationHead, /^[a-f0-9]{40}$/)
  assert.deepEqual(value.sourcePaths, SOURCE, 'exact consumed source scope')
  for (const rows of [value.files, value.docs, value.immutableInputs]) {
    assert.ok(Array.isArray(rows))
    for (const row of rows) {
      absolute(row.path); assert.ok(Number.isSafeInteger(row.bytes) && row.bytes > 0)
      assert.match(row.sha256, /^[a-f0-9]{64}$/)
    }
    assert.deepEqual(rows.map(row => row.path), sorted(rows.map(row => row.path)), 'manifest rows sorted')
    assert.equal(new Set(rows.map(row => row.path)).size, rows.length)
  }
  assert.deepEqual(value.docs.map(row => row.path), sorted(DOC_INPUTS))
  assert.deepEqual(value.immutableInputs.map(row => row.path), sorted(IMMUTABLE_INPUTS))
  return value
}

function full(state: GameState, week: number): string {
  assert.equal(state.market.tick, week)
  const before = stableStringify(state), rng = stableStringify(state.rngState)
  const save = makeSave(state)
  assert.equal(LIVE_SAVE_VERSION, 39); assert.equal(save.saveVersion, 39)
  assert.equal(validateSaveV39(save), save)
  const raw = exportSave(save)
  assert.ok(Buffer.byteLength(raw) <= 16 * MiB, 'raw save artifact <=16MiB')
  assert.equal(exportSave(validateSaveV39(JSON.parse(raw))), raw)
  assert.equal(exportSave(importSave(raw)), raw)
  assert.equal(stableStringify(state), before); assert.equal(stableStringify(state.rngState), rng)
  return raw
}
function root(state: GameState, promiseId: string): ProfessionalPromise {
  const row = state.promises.find(candidate => candidate.promiseId === promiseId); assert.ok(row)
  assert.equal(row.family, 'DIRECTING_COUNT')
  assert.ok('kind' in row.predicate && row.predicate.kind === 'directorCount')
  return row
}
function outcome(state: GameState, row: ProfessionalPromise): void {
  assert.notEqual(row.outcome, null); assert.notEqual(row.outcomeEventId, null)
  const receipts = state.talentMarket.receipts.filter(receipt => receipt.eventId === row.outcomeEventId)
  assert.equal(receipts.length, 1)
  assert.equal(receipts[0]!.kind, 'promiseOutcome'); assert.equal(receipts[0]!.week, row.outcomeWeek)
  assert.equal(receipts[0]!.talentId, row.beneficiaryPersonId); assert.equal(receipts[0]!.studioId, row.issuerStudioId)
}
type TickCounts = { attempted: number; reserved: number; invoked: number; verified: number; cap: 78 }
type RuntimeCounts = { quotes: number; dispatchInvocations: number; firstSeen: number; duplicates: number;
  restarts: number; freshFactories: number; advanceInvocations: number }
class Store implements BridgeCheckpointStore {
  checkpointPath = '/synthetic/1221-p4p5-outgoing-checkpoint.json'
  writes = 0; closed = false; closes = 0
  constructor(public contents: string | null = null) {}
  async read() { assert.equal(this.closed, false); return this.contents }
  async writeAtomic(text: string) { assert.equal(this.closed, false); this.writes++; this.contents = text }
  async close() { assert.equal(this.closed, false); this.closed = true; this.closes++ }
}
function stored(store: Store) {
  assert.ok(store.contents)
  const decoded = decodeBridgeRuntimeCheckpoint(store.contents)
  assert.equal(decoded.checkpoint.schemaId, SCHEMA_ID)
  assert.equal(full(decoded.currentSave.state, 61), decoded.checkpoint.currentSaveJson)
  if (decoded.savedSave !== null) assert.equal(full(decoded.savedSave.state, 61), decoded.checkpoint.savedSaveJson)
  return decoded
}
async function captureRuntime(initial: GameState, originalId: string, counts: RuntimeCounts, ticks: TickCounts) {
  const initialRaw = full(initial, 61), original = clone(root(initial, originalId))
  assert.equal(original.progress, 1); assert.equal(original.outcome, null)
  const initialContract = activeContract(initial, original.beneficiaryPersonId); assert.ok(initialContract)
  assert.equal(initialContract.startWeek, 52); assert.equal(initialContract.endWeekExclusive, 156)
  const stores: Store[] = [], cleanupErrors: string[] = []
  const authority: { fresh: BridgeSession | null } = { fresh: null }
  let runtime: BridgeRuntimeCoordinator | null = null, store = new Store()
  let failed = false, failure: unknown
  let captured: { raw: string; waivedRaw: string; facts: Record<string, unknown> } | undefined
  const options = (target: Store) => ({ store: target, fatal: (error: unknown) => { throw error },
    createFreshSession: (limits: BridgeRuntimeCheckpointLimits) => {
      counts.freshFactories++; assert.equal(counts.freshFactories, 1)
      assert.deepEqual(limits, DEFAULT_BRIDGE_RUNTIME_CHECKPOINT_LIMITS)
      authority.fresh = new BridgeSession(clone(initial), '1221-p4p5-outgoing', null, { limits })
      return authority.fresh
    } })
  try {
    stores.push(store); runtime = await createBridgeRuntimeCoordinator(options(store))
    const start = stored(store)
    assert.equal(start.checkpoint.currentSaveJson, initialRaw); assert.equal(start.savedSave, null)
    assert.equal(start.checkpoint.journal.length, 0)
    const control = await runtime.read(session => ({ protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID,
      sessionId: session.sessionId, expectedStateRevision: session.stateRevision, commandId: '1221-save-earned61' }))
    const save = validateControl(control); assert.ok(save.ok, save.ok ? '' : save.message)
    counts.dispatchInvocations++
    const saved = await runtime.dispatch('save', save.control)
    assert.equal(saved.firstSeen, true); counts.firstSeen++
    assert.equal(saved.response.accepted, true)
    const savedCheckpoint = stored(store)
    assert.equal(savedCheckpoint.checkpoint.currentSaveJson, initialRaw)
    assert.equal(savedCheckpoint.checkpoint.savedSaveJson, initialRaw)
    assert.equal(savedCheckpoint.checkpoint.journal.length, 1)

    const beforeQuote = store.contents, writesBeforeQuote = store.writes
    assert.ok(authority.fresh, 'actual session retained from the real fresh-session factory')
    const liveBeforeQuote = full(authority.fresh.gameState, 61)
    const quoteRequest = await runtime.read(session => ({ protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID,
      sessionId: session.sessionId, expectedStateRevision: session.stateRevision, commandId: '1221-quote-waiver61',
      type: 'quoteWaivePromise', draft: { promiseId: originalId, substitute: {
        family: 'DIRECTING_COUNT', count: 1, windowStartWeek: 62, dueWeekExclusive: 104 } } }))
    const parsedQuote = validateQuote(quoteRequest); assert.ok(parsedQuote.ok, parsedQuote.ok ? '' : parsedQuote.message)
    counts.quotes++
    const quoted = await runtime.read(session => session.quote(parsedQuote.quote))
    assert.ok(quoted.accepted, quoted.accepted ? '' : quoted.message)
    assert.deepEqual(parseWireValue(BRIDGE_SCHEMA.$defs.StudioBridgeQuoteResponse, quoted), quoted)
    assert.equal(quoted.quote.kind, 'waivePromise'); assert.ok(quoted.quote.kind === 'waivePromise')
    assert.equal(quoted.quote.ok, true); assert.equal(quoted.quote.refusalReason, null)
    assert.equal(quoted.quote.qualifyingRole, 'director'); assert.equal(quoted.quote.seatClass, null)
    assert.equal(quoted.quote.count, 1); assert.equal(quoted.quote.windowStartWeek, 62)
    assert.equal(quoted.quote.dueWeekExclusive, 104); assert.equal(quoted.quote.promiseId, originalId)
    assert.equal(store.contents, beforeQuote); assert.equal(store.writes, writesBeforeQuote)
    assert.equal(full(authority.fresh.gameState, 61), liveBeforeQuote, 'quote preserves live complete input, not only store bytes')
    // Complete persisted authority is unchanged by the quote; only its real emitted intent is submitted.
    assert.equal(stored(store).checkpoint.currentSaveJson, initialRaw)
    const commandEnvelope = await runtime.read(session => ({ protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID,
      sessionId: session.sessionId, expectedStateRevision: session.stateRevision, commandId: '1221-commit-waiver61',
      type: 'submitIntent', payload: { intentId: quoted.quote.intentId } }))
    const command = validateCommand(commandEnvelope); assert.ok(command.ok, command.ok ? '' : command.message)
    counts.dispatchInvocations++
    const committed = await runtime.dispatch('command', command.command)
    assert.equal(committed.firstSeen, true); counts.firstSeen++
    assert.equal(committed.response.accepted, true)
    const changed = stored(store), current = changed.currentSave.state
    assert.equal(changed.checkpoint.savedSaveJson, initialRaw)
    assert.notEqual(changed.checkpoint.currentSaveJson, initialRaw)
    assert.equal(changed.checkpoint.stateRevision, 1)
    const old = root(current, originalId)
    assert.equal(old.outcome, 'WAIVED'); assert.equal(old.outcomeWeek, 61)
    assert.equal(old.progress, original.progress); assert.deepEqual(old.evidenceRefs, original.evidenceRefs)
    assert.deepEqual(old.predicate, original.predicate); assert.equal(old.contractId, original.contractId)
    assert.equal(old.version, original.version); assert.deepEqual(old.feasibilityReceipt, original.feasibilityReceipt)
    assert.ok(old.supersededByPromiseId); outcome(current, old)
    const successor = root(current, old.supersededByPromiseId)
    assert.deepEqual(successor.predicate, { kind: 'directorCount', count: 1 })
    assert.equal(successor.contractId, original.contractId); assert.equal(successor.issuerStudioId, original.issuerStudioId)
    assert.equal(successor.beneficiaryPersonId, original.beneficiaryPersonId)
    assert.equal(successor.version, 6); assert.equal(successor.feasibilityReceipt.rulesVersion, 6)
    assert.equal(successor.feasibilityReceipt.classification, 'REASONABLY_ACHIEVABLE')
    assert.equal(successor.feasibilityReceipt.bottleneck, null); assert.equal(successor.feasibilityReceipt.week, 61)
    assert.equal(successor.windowStartWeek, 62); assert.equal(successor.dueWeekExclusive, 104)
    assert.equal(successor.progress, 0); assert.deepEqual(successor.evidenceRefs, []); assert.equal(successor.outcome, null)
    assert.equal(successor.supersededByPromiseId, null)
    assert.deepEqual(current.firstTakes, initial.firstTakes)
    assert.deepEqual(current.promises.filter(row => row.promiseId !== originalId && row.promiseId !== successor.promiseId),
      initial.promises.filter(row => row.promiseId !== originalId))
    const { promises: _newPromises, talentMarket: newMarket, ...otherCurrent } = current
    const { promises: _oldPromises, talentMarket: oldMarket, ...otherInitial } = initial
    assert.deepEqual(otherCurrent, otherInitial)
    const { receipts: newReceipts, ...marketCurrent } = newMarket
    const { receipts: oldReceipts, ...marketInitial } = oldMarket
    assert.deepEqual(marketCurrent, marketInitial)
    assert.deepEqual(newReceipts.slice(0, oldReceipts.length), oldReceipts)
    assert.equal(newReceipts.length, oldReceipts.length + 1)
    assert.deepEqual(activeContract(current, original.beneficiaryPersonId), initialContract)

    const journal = changed.checkpoint.journal
    assert.equal(journal.length, 2); assert.deepEqual(journal.map(row => row.route), ['save', 'command'])
    assert.equal(journal[0]!.requestJson, canonicalJson(save.control))
    assert.equal(journal[0]!.responseJson, saved.responseJson)
    assert.equal(journal[1]!.requestJson, canonicalJson(command.command))
    assert.equal(journal[1]!.responseJson, committed.responseJson)
    assert.equal(saved.responseJson, canonicalJson(saved.response))
    assert.equal(committed.responseJson, canonicalJson(committed.response))
    let beforeReplay = store.contents, writesBeforeReplay = store.writes
    counts.dispatchInvocations++
    const saveReplay = await runtime.dispatch('save', save.control)
    assert.equal(saveReplay.firstSeen, false); counts.duplicates++
    assert.equal(saveReplay.responseJson, saved.responseJson)
    assert.equal(store.contents, beforeReplay); assert.equal(store.writes, writesBeforeReplay)

    const durable = store.contents; assert.ok(durable)
    await runtime.close(); runtime = null
    assert.equal(store.closed, true); assert.equal(store.closes, 1)
    counts.restarts++; store = new Store(durable); stores.push(store)
    runtime = await createBridgeRuntimeCoordinator(options(store))
    assert.equal(counts.freshFactories, 1); assert.equal(store.contents, durable)
    const restarted = stored(store)
    assert.deepEqual(restarted.checkpoint, changed.checkpoint)
    beforeReplay = store.contents; writesBeforeReplay = store.writes
    counts.dispatchInvocations++
    const commandReplay = await runtime.dispatch('command', command.command)
    assert.equal(commandReplay.firstSeen, false); counts.duplicates++
    assert.equal(commandReplay.responseJson, committed.responseJson)
    assert.equal(store.contents, beforeReplay); assert.equal(store.writes, writesBeforeReplay)
    assert.equal(full(initial, 61), initialRaw)
    assert.equal(ticks.invoked, 78); assert.equal(ticks.verified, 78)
    assert.deepEqual(counts, { quotes: 1, dispatchInvocations: 4, firstSeen: 2, duplicates: 2,
      restarts: 1, freshFactories: 1, advanceInvocations: 0 })
    const loaded = loadBridgeRuntimeCheckpoint(durable)
    assert.equal(loaded.migratedFromProtocolVersion, null)
    assert.deepEqual(loaded.hydrated.checkpoint, changed.checkpoint)
    captured = { raw: durable, waivedRaw: changed.checkpoint.currentSaveJson,
      facts: { originalId, successorId: successor.promiseId, contractId: original.contractId,
        original: old, successor, actualWeek: 61, savedRaw: identify(initialRaw), currentRaw: identify(changed.checkpoint.currentSaveJson),
        stateRevision: changed.checkpoint.stateRevision, sessionId: changed.checkpoint.sessionId,
        journalDigest: changed.checkpoint.journalDigest,
        journal: journal.map((entry, index) => ({ artifact: OUTPUT_NAMES[5], index,
          route: entry.route, commandId: entry.commandId, request: identify(entry.requestJson), response: identify(entry.responseJson) })),
        duplicateSaveResponseEqual: true, duplicateWaiverResponseEqual: true, duplicateWrites: 0,
        checkpointSource: 'Actual coordinator store bytes; full canonical request/response authority remains in its journal.' } }
  } catch (error) { failed = true; failure = error }
  finally {
    if (runtime !== null) {
      try { await runtime.close() } catch (error) { cleanupErrors.push(String(error).slice(0, 3000)) }
    }
    for (const owner of stores) if (!owner.closed || owner.closes !== 1)
      cleanupErrors.push(`store ownership: closed=${String(owner.closed)} closes=${String(owner.closes)}`)
  }
  if (cleanupErrors.length) console.info('1221-P4P5-CLEANUP-FAILED ' + JSON.stringify({ cleanupErrors }))
  if (failed) throw failure
  assert.deepEqual(cleanupErrors, [], 'both actual store owners closed once')
  assert.ok(captured)
  return { ...captured, storeOwners: stores.map((owner, index) => ({ index, writes: owner.writes,
    closed: owner.closed, closes: owner.closes })) }
}

it('captures genuine outgoing39 Director authority and current54 replay once', async () => {
  const started = new Date().toISOString()
  let phase = 'preflight', before: Snapshot | null = null
  let restoreTick: (() => void) | null = null
  const ticks: TickCounts = { attempted: 0, reserved: 0, invoked: 0, verified: 0, cap: 78 }
  const runtimeCounts: RuntimeCounts = { quotes: 0, dispatchInvocations: 0, firstSeen: 0, duplicates: 0,
    restarts: 0, freshFactories: 0, advanceInvocations: 0 }
  const written: FileIdentity[] = []
  try {
    const expectedHead = process.env.P4P5_CAPTURE_EXPECTED_HEAD
    const expectedManifestSha = process.env.P4P5_CAPTURE_SOURCE_MANIFEST_SHA256
    assert.match(expectedHead ?? '', /^[a-f0-9]{40}$/, 'actual parent-published execution HEAD required')
    assert.match(expectedManifestSha ?? '', /^[a-f0-9]{64}$/, 'reviewed external source-manifest pin required')
    const manifestRaw = read(SOURCE_MANIFEST)
    assert.equal(identify(manifestRaw).sha256, expectedManifestSha)
    const manifest = manifestFrom(manifestRaw)
    before = snapshot(); assert.equal(before.head, expectedHead)
    checkIdentity(before.diff, identify(''), 'clean consumed source')
    assert.deepEqual(before.untracked, [])
    sameFiles(before.files, manifest.files, 'frozen consumed source')
    sameFiles(before.docs.filter(row => row.path !== SOURCE_MANIFEST), manifest.docs, 'frozen manual inputs')
    for (const input of manifest.immutableInputs) checkIdentity(file(input.path), input, 'immutable input')
    checkIdentity(file(HELPER), { bytes: 78674,
      sha256: '389112bde75ccaab9e2d155a1df6e6dc279b78c7d6d531a582b04f27be5fba83' }, 'unchanged helper')
    checkIdentity(file(ORIGINAL_TEST), { bytes: 98958,
      sha256: '1bcbbe03552f5815c3e88fc1f0937ef51f37d7b84ca0f3bd8fd693f5058e2e16' }, 'unchanged test')
    assert.equal(file(INPUT_MANIFEST).sha256, 'b3a3251ae7b3df96a1e2a615991744c5d1e5966a095424693f086a1581244294')
    assert.equal(file(INPUT_GZIP).sha256, '0ce43de9abe897631f415f94ac79e584b87d6001c8bb4b5c37fccf3dcb8204a2')
    const inputRaw = gunzipSync(read(INPUT_GZIP), { maxOutputLength: 16 * MiB })
    checkIdentity(identify(inputRaw), manifest.rawInput, 'immutable raw week0')
    assert.equal(identify(inputRaw).sha256, '215b61730393abc8bc28b747d7d79bf9dcb65d2b03f17aa97b96880bc720fa23')
    assert.equal(PROJECTION_VERSION, 54); assert.equal(PROTOCOL_VERSION, 4)
    assert.equal(SCHEMA_ID, 'sha256:9c5bba3fcc58e857fe57e33623a86f096cd04e00547bea8f2dae3a656025b302')
    assert.equal(LIVE_SAVE_VERSION, 39)
    assert.equal(existsSync(absolute(OUTPUT)), false, 'exclusive new output directory')
    exactCounters(0); assert.deepEqual(counters().cachedPhases, [])
    assert.ok(outcomeCounters().branches.every(row => row.startWeek === null))
    const actualTick = core.tick
    const spy = vi.spyOn(core, 'tick').mockImplementation((...args) => {
      ticks.attempted++
      assert.ok(ticks.reserved < ticks.cap, 'refuse the79th real tick before invocation')
      ticks.reserved++; ticks.invoked++
      const next = actualTick(...args)
      assert.equal(next.market.tick, args[0].market.tick + 1, 'verified actual one-week advance')
      ticks.verified++; return next
    })
    restoreTick = () => spy.mockRestore()
    console.info('1221-P4P5-CAPTURE-START ' + JSON.stringify({ started, source: compact(before),
      sourceManifest: identify(manifestRaw), output: OUTPUT, tickCap: 78, runtimeAdvanceCap: 0 }))

    phase = 'actual-bound52'
    const boundInput = bound(); exactCounters(52)
    const boundRaw = full(boundInput.state, 52), boundRoot = root(boundInput.state, boundInput.promiseId)
    assert.equal(boundInput.actorId, 'authored-0006')
    assert.deepEqual(boundRoot.predicate, { kind: 'directorCount', count: 2 })
    assert.equal(boundRoot.version, 6); assert.equal(boundRoot.progress, 0); assert.equal(boundRoot.outcome, null)
    assert.deepEqual(boundRoot.evidenceRefs, []); assert.ok(boundRoot.contractId)
    assert.equal(boundRoot.windowStartWeek, 52); assert.equal(boundRoot.dueWeekExclusive, 112)
    const employment = boundInput.state.hollywood!.employment.find(row => row.contractId === boundRoot.contractId)
    assert.ok(employment); assert.equal(employment.studioId, boundRoot.issuerStudioId)
    assert.equal(employment.terms.talentId, boundInput.actorId)
    assert.equal(employment.terms.startWeek, 52); assert.equal(employment.terms.endWeekExclusive, 156)

    phase = 'actual-first-film65'
    const first = firstFilm(); exactCounters(65)
    assert.equal(first.first.take.week, 61); assert.equal(first.first.released.market.tick, 65)
    const earnedRaw = full(first.first.afterTake, 61), earnedRoot = root(first.first.afterTake, first.promiseId)
    assert.equal(earnedRoot.progress, 1); assert.equal(earnedRoot.outcome, null)
    assert.deepEqual(earnedRoot.evidenceRefs, [first.first.take.eventId])
    assert.equal(first.first.take.directorId, first.actorId)
    assert.equal(first.first.take.studioId, boundRoot.issuerStudioId)
    assert.equal(earnedRoot.contractId, boundRoot.contractId)
    assert.deepEqual(earnedRoot.feasibilityReceipt, boundRoot.feasibilityReceipt)
    assert.equal(earnedRoot.version, boundRoot.version)

    phase = 'actual-second-film78'
    const second = secondFilm(); exactCounters(78)
    assert.equal(second.second.take.week, 74); assert.equal(second.second.released.market.tick, 78)
    const satisfiedRaw = full(second.state, 78), satisfied = root(second.state, second.promiseId)
    assert.equal(satisfied.progress, 2); assert.equal(satisfied.outcome, 'SATISFIED')
    assert.equal(satisfied.outcomeWeek, 74); assert.equal(satisfied.supersededByPromiseId, null)
    assert.equal(new Set([first.first.take.productionId, second.second.take.productionId]).size, 2)
    assert.deepEqual(satisfied.evidenceRefs, [first.first.take.eventId, second.second.take.eventId])
    assert.equal(second.second.take.directorId, first.actorId); assert.equal(second.second.take.studioId, boundRoot.issuerStudioId)
    for (const take of [first.first.take, second.second.take]) {
      assert.ok(take.week >= satisfied.windowStartWeek && take.week < satisfied.dueWeekExclusive)
      assert.deepEqual(second.state.firstTakes.filter(row => row.eventId === take.eventId), [take])
      assert.equal(second.state.studio.releasedFilms.filter(row => row.productionId === take.productionId).length, 1)
    }
    assert.deepEqual(satisfied.feasibilityReceipt, boundRoot.feasibilityReceipt)
    assert.equal(satisfied.version, boundRoot.version); assert.equal(satisfied.contractId, boundRoot.contractId)
    outcome(second.state, satisfied)

    phase = 'actual-zero-advance-cancellation'
    const canceled = afterTakeCancellation(); exactCounters(78)
    const canceledRaw = full(canceled.after, 61)
    assert.equal(full(canceled.before, 61), earnedRaw)
    assert.equal(canceled.after.studio.activeProductions.some(row => row.id === first.first.productionId), false)
    assert.deepEqual(canceled.after.firstTakes, first.first.afterTake.firstTakes)
    assert.deepEqual(root(canceled.after, first.promiseId), earnedRoot)
    const returned = canceled.after.scriptDevelopment.projects.find(row => row.id === first.projectIds[0]); assert.ok(returned)
    assert.equal(returned.status, 'ready'); assert.equal(returned.productionId, null)
    assert.deepEqual(outcomeCounters().branches.map(row => ({ name: row.name, ticks: row.actualTicks, start: row.startWeek })), [
      { name: 'cancelBefore', ticks: 0, start: null }, { name: 'cancelAfter', ticks: 0, start: 61 },
      { name: 'waiver', ticks: 0, start: null }])

    phase = 'actual-runtime-save-waive-replay'
    const runtime = await captureRuntime(clone(first.first.afterTake), first.promiseId, runtimeCounts, ticks)
    exactCounters(78)
    assert.deepEqual(ticks, { attempted: 78, reserved: 78, invoked: 78, verified: 78, cap: 78 })
    assert.deepEqual(counters().cachedPhases, ['created0', 'managedEmpty8', 'ready10', 'cases45', 'attached45',
      'bound52', 'firstFilm', 'secondFilm', 'cancelAfterTake'].map(name => ({ name, completed: true })))
    assert.equal(full(boundInput.state, 52), boundRaw)
    assert.equal(full(first.first.afterTake, 61), earnedRaw)
    assert.equal(full(second.state, 78), satisfiedRaw)
    restoreTick(); restoreTick = null

    phase = 'bounded-artifact-preparation'
    const raws = [boundRaw, earnedRaw, satisfiedRaw, canceledRaw, runtime.waivedRaw, runtime.raw]
    const outputs = raws.map((raw, index) => {
      assert.ok(Buffer.byteLength(raw) <= 16 * MiB, 'each raw artifact <=16MiB')
      const compressed = gzipSync(Buffer.from(raw), { level: 9 })
      assert.ok(compressed.byteLength <= 16 * MiB, 'each gzip <=16MiB')
      assert.equal(gunzipSync(compressed, { maxOutputLength: 16 * MiB }).toString('utf8'), raw)
      return { filename: OUTPUT_NAMES[index]!, compressed, raw: identify(raw), gzip: identify(compressed) }
    })
    assert.equal(outputs.length, 6)
    unchanged(before, snapshot())
    phase = 'exclusive-artifacts'
    mkdirSync(absolute(OUTPUT))
    let outputBytes = 0
    const writeExclusive = (filename: string, data: string | Uint8Array): void => {
      assert.ok((OUTPUT_NAMES as readonly string[]).includes(filename))
      assert.ok(written.length + 1 <= OUTPUT_NAMES.length, 'prospective seven-file cap')
      assert.ok(outputBytes + identify(data).bytes <= 128 * MiB, 'prospective directory byte cap')
      const path = `${OUTPUT}/${filename}`
      writeFileSync(absolute(path), data, { flag: 'wx' })
      outputBytes += identify(data).bytes; written.push({ path, ...identify(data) })
    }
    for (const output of outputs) {
      writeExclusive(output.filename, output.compressed)
      checkIdentity(file(`${OUTPUT}/${output.filename}`), output.gzip, 'persisted exact gzip')
    }
    assert.deepEqual(readdirSync(absolute(OUTPUT)).sort(), outputs.map(output => output.filename).sort())
    phase = 'final-source-guard'
    const after = snapshot(); unchanged(before, after); exactCounters(78)
    for (const input of manifest.immutableInputs) checkIdentity(file(input.path), input, 'final immutable input')
    const complete = {
      kind: 'genuine-outgoing39-director-and-runtime54', version: 1, status: 'COMPLETE',
      started, completed: new Date().toISOString(), actualExecutionHead: before.head,
      preparationHead: manifest.preparationHead, node: process.version,
      sourceManifest: { path: SOURCE_MANIFEST, ...identify(manifestRaw) },
      sourceBefore: compact(before), sourceAfter: compact(after), sourceGuardPassed: true,
      immutableInputs: manifest.immutableInputs, rawInput: manifest.rawInput,
      schema: { saveVersion: 39, protocolVersion: PROTOCOL_VERSION, projectionVersion: PROJECTION_VERSION, schemaId: SCHEMA_ID },
      declaredOutputNames: OUTPUT_NAMES,
      outputs: outputs.map(({ filename, raw, gzip }) => ({ filename, raw, gzip })),
      counters: { ticks, helper: allCounters(), runtime: runtimeCounts }, runtime: { ...runtime.facts, storeOwners: runtime.storeOwners },
      core: { personId: first.actorId, promiseId: first.promiseId, contractId: boundRoot.contractId,
        projectIds: first.projectIds, bound: boundRoot, earned: earnedRoot, satisfied,
        firstTake: first.first.take, secondTake: second.second.take,
        firstReleaseWeek: 65, secondReleaseWeek: 78, cancellationWeek: 61,
        returnedProject: { id: returned.id, status: returned.status, productionId: returned.productionId } },
      bounds: { actualTickCap: 78, runtimeAdvanceCap: 0, rawArtifactBytes: 16 * MiB,
        outputManifestBytes: MiB, directoryBytes: 128 * MiB, runtimeLimits: DEFAULT_BRIDGE_RUNTIME_CHECKPOINT_LIMITS },
      scope: 'New current39/54 capture from unchanged helper. Ordinary automatic effects retained. No P4/P5 activation, fact backfill, alternate seed, funding, added crew or runtime advance.',
      journalAuthority: 'Full canonical request/response strings live once in the actual runtime checkpoint journal; manifest index/route/commandId/byte/hash joins preserve exact authority without duplication.',
      qualification: 'Requires successful parent-recorded capture/fixed-source closure, these exact outputs and independent review. Incomplete outputs remain failed and are never reused.',
      guardBoundary: 'All work, both store closes and six artifact checks precede this final manifest write; parent recorder guards through process closure.',
    }
    const completeRaw = json(complete)
    assert.ok(Buffer.byteLength(completeRaw) <= MiB, 'manifest <=1MiB')
    assert.equal(existsSync(absolute(`${OUTPUT}/MANIFEST.json`)), false)
    assert.ok(outputBytes + Buffer.byteLength(completeRaw) <= 128 * MiB)
    assert.equal(written.length + 1, 7)
    phase = 'exclusive-final-manifest'
    writeExclusive('MANIFEST.json', completeRaw)
    // The success manifest is the final authoritative write; no later fallible artifact checks.
    console.info('1221-P4P5-CAPTURE-COMPLETE ' + JSON.stringify({ output: OUTPUT, sourceHead: before.head,
      actualTicks: ticks.invoked, runtimeAdvances: 0, outputFiles: 7, outputBytes,
      manifest: identify(completeRaw), counters: runtimeCounts }))
  } catch (error) {
    let guardFailure: string | null = null, restoreFailure: string | null = null
    if (restoreTick !== null) { try { restoreTick() } catch (restoreError) { restoreFailure = String(restoreError).slice(0, 3000) } }
    try { if (before) unchanged(before, snapshot()) } catch (guardError) { guardFailure = String(guardError).slice(0, 6000) }
    let retainedOutputNames: string[] | null = null
    try { retainedOutputNames = existsSync(absolute(OUTPUT)) ? readdirSync(absolute(OUTPUT)).sort() : [] } catch { /* retain original cause */ }
    console.info('1221-P4P5-CAPTURE-FAILED ' + JSON.stringify({ started, failed: new Date().toISOString(), phase,
      error: String(error).slice(0, 6000), guardFailure, restoreFailure, ticks, runtime: runtimeCounts,
      helper: allCounters(), written, retainedOutputNames, retainedIncompleteOutputs: true,
      qualification: 'FAILED; preserve original cause and incomplete outputs, no retry or overwrite' }))
    throw error
  }
}, 60_000)
