// 1170-A/B/C: one new current39 capture. No rehearsal, rescue or automatic retry.
// Execute only through the adjacent isolated Vitest config and parent recorder.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { isAbsolute, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gunzipSync, gzipSync } from 'node:zlib'
import { it } from 'vitest'
import { at45, counters, outcomeCounters, continuityCounters, rivalCounters } from '../../../../../tests/helpers/p14p3-fixtures.js'
import { caseForTalent, retirementRecordFor } from '../../../../../src/core/index.js'
import { activeContract } from '../../../../../src/core/employment.js'
import { exportSave, importSave, LIVE_SAVE_VERSION, makeSave, stableStringify, validateSaveV39 } from '../../../../../src/core/save.js'

const E = 'docs/engineering/playability-launch-review/evidence/p14b4-20260919'
const ROOT = fileURLToPath(new URL('../../../../../', import.meta.url))
const STEM = `${E}/1171-p3-current45-capture`
const SOURCE_MANIFEST = `${E}/1171-p3-current45-source-manifest.json`
const OUTPUT = `${E}/1171-p3-current45-capture`
const GZIP_NAME = 'genuine-v39-p3-market-week45.json.gz'
const OUTPUT_NAMES = [GZIP_NAME, 'MANIFEST.json'] as const
const SOURCE = ['src', 'bridge', 'tests', 'generated', 'ui', 'scripts', 'package.json', 'package-lock.json',
  'tsconfig.json', 'tsconfig.bridge.json', 'tsconfig.src.json', 'vitest.config.ts', 'vitest.workspace.ts']
const DOC_INPUTS = [`${STEM}.config.ts`, `${STEM}.test.ts`, `${STEM}.tsconfig.json`,
  `${E}/1170-A-p3-bridge-runtime-plan.md`, `${E}/1170-B-p3-current45-capture-plan-review.md`,
  `${E}/1170-C-p3-bridge-parent-adoption.md`]
const INPUT_MANIFEST = 'tests/fixtures/p14/genuine-v37-c3-corpus/MANIFEST.json'
const INPUT_GZIP = 'tests/fixtures/p14/genuine-v37-c3-corpus/genuine-v37-c3-created-week0.json.gz'
const HELPER = 'tests/helpers/p14p3-fixtures.ts'
const ORIGINAL_TEST = 'tests/p14p3-directing-promises.test.ts'
const MiB = 1024 * 1024
type Identity = { bytes: number; sha256: string }
type FileIdentity = Identity & { path: string }
type SourceManifest = {
  kind: '1171-current45-source-manifest'; version: 1; preparationHead: string;
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
  assert.equal(counters().actualTicks, expectedPlayer, 'exact player calls')
  assert.equal(outcomeCounters().playerCalls, expectedPlayer)
  assert.equal(outcomeCounters().total, expectedPlayer)
  assert.ok(outcomeCounters().branches.every(row => row.actualTicks === 0 && row.startWeek === null), 'no outcome branches')
  assert.equal(continuityCounters().lifecycleCalls, 0, 'no lifecycle calls')
  assert.equal(continuityCounters().total, expectedPlayer)
  assert.equal(rivalCounters().rivalCalls, 0, 'no rival calls')
  assert.equal(rivalCounters().total, expectedPlayer)
}
function manifestFrom(raw: Buffer): SourceManifest {
  assert.ok(raw.byteLength <= MiB, 'source manifest <=1MiB')
  const value = JSON.parse(raw.toString('utf8')) as SourceManifest
  assert.equal(value.kind, '1171-current45-source-manifest'); assert.equal(value.version, 1)
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
  assert.deepEqual(value.immutableInputs.map(row => row.path), sorted([INPUT_MANIFEST, INPUT_GZIP]))
  return value
}

it('captures only the genuine current39 at45 prefix once', () => {
  const started = new Date().toISOString()
  let phase = 'preflight', before: Snapshot | null = null, finalGuard: Snapshot | null = null
  const written: FileIdentity[] = []
  try {
    const expectedHead = process.env.P3_CAPTURE_EXPECTED_HEAD
    const expectedManifestSha = process.env.P3_CAPTURE_SOURCE_MANIFEST_SHA256
    assert.match(expectedHead ?? '', /^[a-f0-9]{40}$/, 'parent supplies actual published HEAD')
    assert.match(expectedManifestSha ?? '', /^[a-f0-9]{64}$/, 'parent supplies reviewed source-manifest hash')
    const manifestRaw = read(SOURCE_MANIFEST)
    assert.equal(identify(manifestRaw).sha256, expectedManifestSha, 'external source-manifest pin')
    const manifest = manifestFrom(manifestRaw)
    before = snapshot()
    assert.equal(before.head, expectedHead, 'actual execution HEAD')
    checkIdentity(before.diff, identify(''), 'clean consumed source')
    assert.deepEqual(before.untracked, [], 'no untracked consumed input')
    sameFiles(before.files, manifest.files, 'frozen source manifest')
    sameFiles(before.docs.filter(row => row.path !== SOURCE_MANIFEST), manifest.docs, 'frozen manual docs')
    for (const row of manifest.immutableInputs) checkIdentity(file(row.path), row, 'immutable input')
    checkIdentity(file(HELPER), { bytes: 78674, sha256: '389112bde75ccaab9e2d155a1df6e6dc279b78c7d6d531a582b04f27be5fba83' }, 'unchanged helper')
    checkIdentity(file(ORIGINAL_TEST), { bytes: 77197, sha256: '3371570a015bcc3723ec7d6f4d85f8207bbb5cba9458e0036e538037736b455d' }, 'unchanged test')
    assert.equal(file(INPUT_MANIFEST).sha256, 'b3a3251ae7b3df96a1e2a615991744c5d1e5966a095424693f086a1581244294')
    assert.equal(file(INPUT_GZIP).sha256, '0ce43de9abe897631f415f94ac79e584b87d6001c8bb4b5c37fccf3dcb8204a2')
    const inputRaw = gunzipSync(read(INPUT_GZIP), { maxOutputLength: 16 * MiB })
    checkIdentity(identify(inputRaw), manifest.rawInput, 'immutable raw input')
    assert.equal(identify(inputRaw).sha256, '215b61730393abc8bc28b747d7d79bf9dcb65d2b03f17aa97b96880bc720fa23')
    assert.equal(existsSync(absolute(OUTPUT)), false, 'exclusive never-reused output directory')
    exactCounters(0); assert.deepEqual(counters().cachedPhases, [], 'fresh helper process')
    console.info('1171-P3-CAPTURE-START ' + JSON.stringify({ started, source: compact(before),
      sourceManifest: identify(manifestRaw), output: OUTPUT, tickCap: 45 }))

    phase = 'actual-at45'
    const actual = at45() // The only route call; all gameplay remains inside this unchanged prefix.
    exactCounters(45)
    assert.deepEqual(counters().cachedPhases, ['created0', 'managedEmpty8', 'ready10', 'cases45']
      .map(name => ({ name, completed: true })), 'only four completed prefix caches')
    const state = actual.state
    assert.equal(state.market.tick, 45); assert.equal(actual.actorId, 'authored-0006')
    assert.equal(actual.directorId, 'authored-0007')
    assert.deepEqual(actual.concepts, ['c-00', 'c-01', 'c-02'])
    assert.equal(state.scriptDevelopment.mode, 'managed')
    assert.deepEqual(state.studio.activeProductions, [])
    assert.ok(Number.isFinite(state.studio.cash) && state.studio.cash > 0, 'actual positive cash, no funding')
    assert.equal(actual.projectIds.length, 2); assert.equal(new Set(actual.projectIds).size, 2)
    assert.ok(state.hollywood, 'actual initialized Hollywood')
    const factsBefore = stableStringify(state), rngBefore = stableStringify(state.rngState)
    const subjects = ([actual.actorId, actual.directorId] as const).map((id, index) => {
      const person = state.talent.find(row => row.id === id); assert.ok(person)
      const role = index === 0 ? 'actor' : 'director'
      assert.equal(person.role, role)
      assert.equal(retirementRecordFor(state, id), undefined, 'subject has no current retirement record')
      const contract = activeContract(state, id); assert.ok(contract)
      assert.equal(contract.startWeek, 0); assert.equal(contract.endWeekExclusive, 52); assert.equal(contract.termWeeks, 52)
      const kase = caseForTalent(state, id); assert.ok(kase)
      assert.equal(kase.openedWeek, 40); assert.equal(kase.decisionWeek, 52)
      assert.equal(kase.status, 'proposals_open')
      const storedCases = state.talentMarket.cases.filter(row => row.talentId === id
        && row.contractId === kase.contractId && row.openedWeek === kase.openedWeek
        && row.subjectStudioId === kase.subjectStudioId)
      assert.equal(storedCases.length, 1, 'unique actual dated case')
      assert.equal(storedCases[0]!.variant, 'expiry'); assert.equal(storedCases[0]!.outcome, null)
      const anchor = state.careerLifecycle.professionAnchors.find(row => row.personId === id)
      assert.deepEqual(anchor, { personId: id, profession: role, kind: 'entrant', recordedWeek: 0 })
      const provenance = state.talentProvenance.rows.find(row => row.personId === id)
      assert.deepEqual(provenance, { personId: id, kind: 'authored_exact_week', entryWeek: 0,
        ageAtEntry: index === 0 ? 68 : 30 })
      assert.equal(state.talentMarket.proposals.filter(row => row.talentId === id
        && row.issuerStudioId === state.hollywood!.playerStudioId).length, 0, 'prefix has no player proposal')
      return { id, role, contract, marketCase: kase, anchor, provenance }
    })
    const projects = actual.projectIds.map((id, index) => {
      const project = state.scriptDevelopment.projects.find(row => row.id === id); assert.ok(project)
      assert.equal(project.status, 'ready'); assert.equal(project.productionId, null)
      assert.equal(project.conceptId, actual.concepts[index]); assert.equal(project.writerId, 'authored-0003')
      return { id, conceptId: project.conceptId, writerId: project.writerId, status: project.status,
        productionId: project.productionId, commissionedWeek: project.commissionedWeek }
    })
    phase = 'full39-proof'
    assert.equal(LIVE_SAVE_VERSION, 39)
    const save = makeSave(state)
    assert.equal(save.saveVersion, 39); assert.equal(validateSaveV39(save), save)
    const raw = exportSave(save)
    assert.ok(Buffer.byteLength(raw) <= 16 * MiB, 'raw save <=16MiB')
    assert.ok(exportSave(validateSaveV39(JSON.parse(raw))) === raw, 'strict39 canonical roundtrip')
    assert.ok(exportSave(importSave(raw)) === raw, 'public import/export canonical roundtrip')
    assert.ok(stableStringify(state) === factsBefore, 'reads/serialization preserve complete state')
    assert.ok(stableStringify(state.rngState) === rngBefore, 'reads/serialization preserve RNG')
    const zipped = gzipSync(Buffer.from(raw), { level: 9 })
    assert.ok(zipped.byteLength <= 16 * MiB, 'gzip <=16MiB')
    assert.ok(gunzipSync(zipped, { maxOutputLength: 16 * MiB }).toString('utf8') === raw, 'lossless gzip')
    exactCounters(45)
    unchanged(before, snapshot())

    phase = 'exclusive-gzip'
    mkdirSync(absolute(OUTPUT)) // No recursive create: parent E exists; an existing output always refuses.
    const gzipPath = `${OUTPUT}/${GZIP_NAME}`
    writeFileSync(absolute(gzipPath), zipped, { flag: 'wx' })
    written.push({ path: gzipPath, ...identify(zipped) })
    checkIdentity(file(gzipPath), identify(zipped), 'exact persisted gzip')
    assert.deepEqual(readdirSync(absolute(OUTPUT)).sort(), [GZIP_NAME], 'only declared first output')

    phase = 'final-source-guard'
    finalGuard = snapshot(); unchanged(before, finalGuard)
    exactCounters(45)
    const complete = {
      kind: 'genuine-current39-p3-market-week45', version: 1, status: 'COMPLETE',
      started, completed: new Date().toISOString(), actualExecutionHead: before.head,
      preparationHead: manifest.preparationHead, node: process.version,
      sourceManifest: { path: SOURCE_MANIFEST, ...identify(manifestRaw) },
      sourceBefore: compact(before), sourceAfter: compact(finalGuard), sourceGuardPassed: true,
      inputs: manifest.immutableInputs, rawInput: manifest.rawInput,
      output: { filename: GZIP_NAME, saveVersion: 39, week: 45, raw: identify(raw), gzip: identify(zipped) },
      declaredOutputNames: OUTPUT_NAMES, counts: allCounters(),
      facts: { actorId: actual.actorId, directorId: actual.directorId, playerStudioId: state.hollywood.playerStudioId,
        cash: state.studio.cash, talentCount: state.talent.length, subjects, projects, rngState: state.rngState },
      initialization: 'Newly reproduced on actual execution source from immutable outgoing37 week0 through unchanged public at45 prefix. Two public subjects/hires, set, two pool scripts and45 develop:true ticks; no funding or alternate route. The producer adds no explicit quote/proposal/attachment/binding outside the unchanged prefix and preserves every ordinary automatic market effect.',
      qualification: 'Requires this complete manifest, matching gzip, successful parent-recorded test and fixed-source closure. Incomplete outputs are retained and never reused.',
      guardBoundary: 'All gameplay, validation and gzip persistence precede final source/input/index guard. This manifest is the final authoritative write; parent recorder independently guards through process closure.',
    }
    const completeRaw = json(complete)
    assert.ok(Buffer.byteLength(completeRaw) <= MiB, 'output manifest <=1MiB')
    assert.equal(existsSync(absolute(`${OUTPUT}/MANIFEST.json`)), false, 'exclusive final manifest')
    phase = 'exclusive-final-manifest'
    writeFileSync(absolute(`${OUTPUT}/MANIFEST.json`), completeRaw, { flag: 'wx' })
    // No later fallible artifact checks: exact writes above and parent closure qualify the pair.
    console.info('1171-P3-CAPTURE-COMPLETE ' + JSON.stringify({ output: OUTPUT, week: 45, actualTicks: 45,
      raw: identify(raw), gzip: identify(zipped), manifest: identify(completeRaw), sourceHead: before.head }))
  } catch (error) {
    // Preserve every incomplete own output and the first cause. Never cleanup or retry.
    let guardFailure: string | null = null
    let retainedOutputNames: string[] | null = null
    try { if (before) { finalGuard = snapshot(); unchanged(before, finalGuard) } }
    catch (guardError) { guardFailure = String(guardError).slice(0, 6000) }
    try { retainedOutputNames = existsSync(absolute(OUTPUT)) ? readdirSync(absolute(OUTPUT)).sort() : [] }
    catch { /* First failure remains authoritative if output inspection also fails. */ }
    console.info('1171-P3-CAPTURE-FAILED ' + JSON.stringify({ started, failed: new Date().toISOString(), phase,
      error: String(error).slice(0, 6000), guardFailure, counts: allCounters(), written, retainedOutputNames,
      outputDirectoryExists: existsSync(absolute(OUTPUT)), retainedIncompleteOutputs: true,
      qualification: 'FAILED; do not use or overwrite outputs' }))
    throw error
  }
}, 60_000)
