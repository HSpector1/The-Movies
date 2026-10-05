// 1362-O item 9: NEW reproduction with immutable archived c000479d Save37 code.
// Install at scripts/captures/1367-extension-capture.ts after independent review.
// No current gameplay, fixture repair, authority stripping or synthetic facts.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, realpathSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync, gunzipSync } from 'node:zlib'
import type { GameStateV37 } from '../../src/core/types.js'
import type { SaveFileV35, SaveFileV36, SaveFileV37 } from '../../src/core/save.js'

const GENERATING_HEAD = 'c000479d6e888d3a02f5c2ff534f5dfcbb32af3f'
const INPUT = 'tests/fixtures/p14/genuine-v35-c2b-corpus/genuine-v35-c2b-contract-gap-freeagent-expiry.json.gz'
const INPUT_MANIFEST = 'tests/fixtures/p14/genuine-v35-c2b-corpus/MANIFEST.json'
const INPUT_GZIP_SHA = 'f35bd6868904b9b6308e27400ce862d503951c904e4e8007ee25003f187ffee4'
const CORPUS = 'genuine-v36-downgrade-extension-controls'
const PRODUCER = 'scripts/captures/1367-extension-capture.ts'
const CONFIG = 'scripts/captures/1367-extension-capture.config.ts'
const PERSON = 'authored-0000'
const ISSUER = 'studio-d7df6c8e-player'
const CONTRACT = ISSUER + ':contract:' + PERSON + ':0:player-24'
const PROPOSAL = { talentId: PERSON, issuerStudioId: ISSUER, termWeeks: 58, premiumTier: 1.1 }
// Exact automatic-read scope of run-bounded-source-c2.mjs. Manual capture
// inputs below are separately named/hash-bound and are never expanded by this guard.
const SOURCE = ['src', 'bridge', 'tests', 'ui', 'generated', 'scripts', 'package.json', 'package-lock.json',
  'vitest.config.ts', 'vitest.workspace.ts', 'tsconfig.json', 'tsconfig.bridge.json', 'tsconfig.src.json']
const EXCLUDED_PREFIXES = ['tests/fixtures/', 'ui/e2e/', 'ui/public/']
const allowed = (path: string): boolean => !EXCLUDED_PREFIXES.some(prefix => path.startsWith(prefix))
// Apply exclusions inside Git as well as filtering its output, so untracked
// discovery does not automatically descend into excluded payload directories.
const SOURCE_PATHSPECS = [...SOURCE, ...EXCLUDED_PREFIXES.map(prefix => ':(exclude)' + prefix.slice(0, -1))]
const sha = (value: string | Uint8Array): string => createHash('sha256').update(value).digest('hex')
const started = new Date().toISOString()
const startedMs = Date.now()
const required = (name: string): string => {
  const value = process.env[name]
  assert.ok(value, 'required environment: ' + name)
  return value
}
const bound = (): void => assert.ok(Date.now() - startedMs <= 300_000, 'execution time exceeded five-minute bound')
const inside = (child: string, parent: string): boolean => child === parent || child.startsWith(parent + sep)
const pathEntryExists = (path: string): boolean => {
  try { lstatSync(path); return true } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return false
    throw error
  }
}
class Absent extends Error {}
type ArchiveSave = {
  LIVE_SAVE_VERSION: number
  makeSave(state: GameStateV37): SaveFileV37
  validateSaveV35(input: unknown): SaveFileV35
  validateSaveV36(input: unknown): SaveFileV36
  validateSaveV37(input: unknown): SaveFileV37
  convertV37ToV36(input: SaveFileV37): SaveFileV36
  convertV36ToV35(input: SaveFileV36): SaveFileV35
  migrateToLive(input: SaveFileV35): SaveFileV37
  stableStringify(input: unknown): string
  exportSave(input: unknown): string
  importSave(input: string): unknown
}
let outputRoot: string | undefined
let ticks = 0
let evidence: Record<string, unknown> = { started, generatingHead: GENERATING_HEAD, declaredBound: { startWeek: 52, openWeek: 92, usedWeek: 98, ticks: 46 } }

async function main(): Promise<void> {
  const repo = realpathSync(process.cwd())
  const git = (...args: string[]): string => execFileSync('git', args, {
    cwd: repo, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, env: { ...process.env, GIT_OPTIONAL_LOCKS: '0' },
  })
  assert.equal(realpathSync(git('rev-parse', '--show-toplevel').trim()), repo, 'run from the actual repository root')
  const currentHead = required('P1367_CURRENT_HEAD')
  assert.match(currentHead, /^[0-9a-f]{40}$/)
  assert.equal(git('rev-parse', 'HEAD').trim(), currentHead)
  const thisPath = realpathSync(fileURLToPath(import.meta.url))
  assert.equal(thisPath, realpathSync(join(repo, PRODUCER)))
  for (const path of [PRODUCER, CONFIG, INPUT, INPUT_MANIFEST, 'package.json', 'package-lock.json', 'src/core/save.ts']) {
    git('ls-files', '--error-unmatch', '--', path)
    assert.ok(!lstatSync(join(repo, path)).isSymbolicLink(), 'no symlink consumed file: ' + path)
  }
  const producerSha = sha(readFileSync(thisPath))
  assert.equal(producerSha, required('P1367_PRODUCER_SHA256'))
  const configSha = sha(readFileSync(join(repo, CONFIG)))
  assert.equal(configSha, required('P1367_CONFIG_SHA256'))
  const identity = () => {
    const paths = git('ls-files', '--', ...SOURCE_PATHSPECS).split('\n').filter(Boolean).filter(allowed).sort()
    assert.ok(paths.length > 0, 'no authorized source paths')
    const testedDiff = git('diff', '--no-ext-diff', 'HEAD', '--binary', '--', ...paths)
    return {
      head: git('rev-parse', 'HEAD').trim(),
      scope: { sourceRoots: SOURCE, excludedAutomaticReadPrefixes: EXCLUDED_PREFIXES,
        includedPaths: paths, authorizedManualInputsSeparate: true },
      diffSha256: sha(testedDiff), // Never embed source or full binary diff in RESULT.
      untracked: git('ls-files', '--others', '--exclude-standard', '--', ...SOURCE_PATHSPECS)
        .split('\n').filter(Boolean).filter(allowed).sort(),
      // Index identity is metadata only; no excluded payload is opened by these reads.
      indexSha256: sha(readFileSync(resolve(repo, git('rev-parse', '--git-path', 'index').trim()))),
      stageEntriesSha256: sha(git('ls-files', '--stage', '-z')),
    }
  }
  const initialIdentity = identity()
  assert.equal(initialIdentity.diffSha256, sha(''), 'bounded tracked gameplay source must be clean')
  assert.deepEqual(initialIdentity.untracked, [], 'no undeclared consumed source/helpers')

  const archiveRoot = realpathSync(required('P1367_ARCHIVE_ROOT'))
  assert.ok(!inside(archiveRoot, repo) && !inside(repo, archiveRoot), 'archive and current source must be disjoint')
  const archiveRows = git('ls-tree', '-r', '-z', GENERATING_HEAD, '--', 'src').split('\0').filter(Boolean).map(entry => {
    const match = /^(100644|100755) blob ([0-9a-f]{40})\t(.+)$/.exec(entry)
    assert.ok(match, 'only ordinary original source blobs')
    return { path: match[3]!, gitBlob: match[2]! }
  })
  assert.ok(archiveRows.length > 0)
  function archiveIdentity() {
    const actual: string[] = []
    function walk(path: string): void {
      assert.ok(!lstatSync(path).isSymbolicLink(), 'archive source contains a symlink')
      if (lstatSync(path).isDirectory()) for (const name of readdirSync(path).sort()) walk(join(path, name))
      else {
        assert.ok(lstatSync(path).isFile(), 'archive source must be regular')
        actual.push(relative(archiveRoot, path).split(sep).join('/'))
      }
    }
    walk(join(archiveRoot, 'src'))
    assert.deepEqual(actual.sort(), archiveRows.map(row => row.path).sort(), 'no extra archived source/helper')
    const files = archiveRows.map(row => {
      const data = readFileSync(join(archiveRoot, row.path))
      assert.equal(createHash('sha1').update('blob ' + data.length + '\0').update(data).digest('hex'), row.gitBlob, row.path)
      return { ...row, sha256: sha(data) }
    })
    return { generatingHead: GENERATING_HEAD, fileCount: files.length, filesSha256: sha(JSON.stringify(files)), files }
  }
  const archivedBefore = archiveIdentity()
  assert.equal(archivedBefore.filesSha256, required('P1367_ARCHIVE_FILES_SHA256'), 'independently recorded archive identity')
  const inputCompressed = readFileSync(join(repo, INPUT))
  assert.equal(sha(inputCompressed), INPUT_GZIP_SHA)
  const rawInput = gunzipSync(inputCompressed).toString('utf8')
  const manifestBytes = readFileSync(join(repo, INPUT_MANIFEST))
  assert.equal(sha(manifestBytes), required('P1367_INPUT_MANIFEST_SHA256'))
  const inputProof = { path: INPUT, gzipSha256: INPUT_GZIP_SHA, rawSha256: sha(rawInput),
    manifestPath: INPUT_MANIFEST, manifestSha256: sha(manifestBytes) }
  const dependencyFiles = ['package.json', 'package-lock.json', 'node_modules/vite/package.json', 'node_modules/vite-node/package.json']
    .map(path => ({ path, sha256: sha(readFileSync(join(repo, path))) }))
  const requestedOutput = resolve(required('P1367_OUTPUT'))
  assert.ok(!pathEntryExists(requestedOutput), 'output path must not exist, including a dangling symlink; never overwrite or clean up')
  const outputParent = realpathSync(dirname(requestedOutput))
  const actualOutput = join(outputParent, relative(dirname(requestedOutput), requestedOutput))
  assert.equal(actualOutput, requestedOutput, 'output path must have no symlink ancestors')
  assert.ok(!inside(actualOutput, repo) && !inside(actualOutput, archiveRoot)
    && !inside(repo, actualOutput) && !inside(archiveRoot, actualOutput), 'outputs must be disjoint from both source trees')
  mkdirSync(actualOutput)
  outputRoot = actualOutput
  evidence = { ...evidence, currentValidationHead: currentHead, producer: PRODUCER, producerSha256: producerSha,
    config: CONFIG, configSha256: configSha, sourceIdentityBefore: initialIdentity, archivedBefore,
    inputProof, dependencyFiles, command: process.argv, proposal: { week: 92, ...PROPOSAL },
    declaredOutputs: [CORPUS + '/MANIFEST.json', CORPUS + '/reproduced-v36-extension-open-week92.json.gz',
      CORPUS + '/reproduced-v36-extension-used-week98.json.gz', 'RESULT.json'],
    archiveRoot, outputRoot, nodeVersion: process.version }

  const postflight = (): void => {
    bound()
    assert.deepEqual(identity(), initialIdentity, 'current source changed during capture')
    assert.deepEqual(archiveIdentity(), archivedBefore, 'archive changed during capture')
    assert.equal(sha(readFileSync(thisPath)), producerSha)
    assert.equal(sha(readFileSync(join(repo, CONFIG))), configSha)
    assert.equal(sha(readFileSync(join(repo, INPUT))), INPUT_GZIP_SHA)
    assert.equal(sha(readFileSync(join(repo, INPUT_MANIFEST))), inputProof.manifestSha256)
    for (const row of dependencyFiles) assert.equal(sha(readFileSync(join(repo, row.path))), row.sha256)
  }
  // Same explicit filesystem SSR import mechanism as the reviewed 975-A producer.
  const loadOld = (name: string) => import('/@fs/' + join(archiveRoot, 'src/core/' + name + '.ts'))
  const old: ArchiveSave = await loadOld('save')
  const { tick }: { tick(state: GameStateV37): GameStateV37 } = await loadOld('tick')
  const { submitProposal }: { submitProposal(state: GameStateV37, proposal: typeof PROPOSAL): GameStateV37 } = await loadOld('talentMarket')
  const current: typeof import('../../src/core/save.js') = await import('/@fs/' + join(repo, 'src/core/save.ts'))
  assert.equal(old.LIVE_SAVE_VERSION, 37)
  assert.equal(current.LIVE_SAVE_VERSION, 45, 'refresh producer at another validation-era predecessor')
  let routeFailure: Absent | undefined
  type Capture = { filename: string; raw: string; facts: unknown }
  const captures: Capture[] = []
  try {
    const source35 = old.validateSaveV35(JSON.parse(rawInput))
    current.validateSaveV35(source35)
    assert.equal(source35.state.market.tick, 52)
    assert.equal(source35.state.hollywood?.playerStudioId, ISSUER)
    const sourceBytes = old.stableStringify(source35)
    const initial = old.migrateToLive(source35)
    assert.equal(initial.saveVersion, 37)
    old.validateSaveV37(initial)
    current.validateSaveV37(initial)
    assert.equal(old.stableStringify(source35), sourceBytes, 'migration cannot mutate historical input')
    let state = initial.state
    const original = state.careerLifecycle.records.find(row => row.personId === PERSON)
    assert.ok(original, 'named input holds its actual retirement record')
    assert.equal(original.extensionUsed, false)
    assert.equal(original.announcedWeek, 52)
    assert.equal(original.effectiveWeek, 104)
    assert.ok(state.hollywood?.employment.some(row => row.contractId === CONTRACT), 'named historical interval exists')
    const advance = (week: number): void => {
      assert.ok(week === 92 || week === 98)
      while (state.market.tick < week) {
        bound()
        assert.ok(ticks < 46)
        const input = state, before = old.stableStringify(input), priorWeek = input.market.tick
        state = tick(input) // archived ordinary default tick; no injected actions/options
        assert.equal(old.stableStringify(input), before, 'original tick mutated its input')
        assert.equal(state.market.tick, priorWeek + 1)
        ticks++
      }
      assert.equal(state.market.tick, week)
      old.validateSaveV37(old.makeSave(state))
    }
    const capture = (week: 92 | 98, usedExpected: boolean): void => {
      const save37 = old.makeSave(state)
      old.validateSaveV37(save37)
      current.validateSaveV37(save37)
      const record = state.careerLifecycle.records.find(row => row.personId === PERSON)
      const cases = state.talentMarket.cases.filter(row => row.variant === 'retirementExtension')
      const used = state.careerLifecycle.records.filter(row => row.extensionUsed)
      const kase = cases.find(row => row.contractId === CONTRACT)
      evidence = { ...evidence, lastObserved: { week, record, cases, used } }
      if (!record || !kase || record.extensionUsed !== usedExpected || cases.length !== 1
        || used.length !== (usedExpected ? 1 : 0) || (usedExpected && kase.outcome !== 'settled')
        || (!usedExpected && kase.outcome !== null)) {
        throw new Absent('Exact original route did not produce the required ' + (usedExpected ? 'used' : 'open') + ' extension witness at ' + week)
      }
      if (state.careerLifecycle.records.some(row => row.profession === 'scientist')) {
        throw new Absent('Exact route holds Scientist authority and cannot lawfully project to V36 at ' + week)
      }
      const save36 = old.convertV37ToV36(save37)
      old.validateSaveV36(save36)
      current.validateSaveV36(save36) // positive admission BEFORE either negative assertion
      const before = old.stableStringify(save36)
      const expected = 'migrateToV35: cannot downgrade SaveFileV36 or discard the retirement extension — it holds 1 retirementExtension case(s) and '
        + (usedExpected ? '1' : '0') + ' used extension(s) (first: ' + PERSON + '), and V35 has nowhere to record the one final extension'
      for (const downgrade of [() => old.convertV36ToV35(save36), () => current.convertV36ToV35(save36)]) {
        let message: string | undefined
        try { downgrade() } catch (error) { assert.ok(error instanceof Error); message = error.message }
        assert.equal(message, expected, 'intended own-era first refusal')
        assert.equal(old.stableStringify(save36), before)
      }
      const raw = old.exportSave(save36)
      assert.equal(old.exportSave(old.importSave(raw)), raw)
      assert.equal(current.exportSave(current.validateSaveV36(JSON.parse(raw))), raw)
      captures.push({ filename: usedExpected ? 'reproduced-v36-extension-used-week98.json.gz' : 'reproduced-v36-extension-open-week92.json.gz',
        raw, facts: { week, payloadSaveVersion: 36, archivedRuntimeSaveVersion: 37, personId: PERSON,
          record, extensionCase: kase, expectedRefusal: expected,
          settlementEmployment: state.hollywood!.employment.filter(row => row.terms.talentId === PERSON),
          projectedFrom37Sha256: sha(old.exportSave(save37)), rawSha256: sha(raw) } })
    }
    advance(92)
    capture(92, false)
    const beforeOffer = old.stableStringify(state), offerInput = state
    state = submitProposal(state, PROPOSAL)
    assert.equal(old.stableStringify(offerInput), beforeOffer, 'proposal mutated historical input')
    old.validateSaveV37(old.makeSave(state))
    advance(98)
    capture(98, true)
    assert.equal(ticks, 46)
    assert.equal(captures.length, 2)
  } catch (error) {
    if (error instanceof Absent) routeFailure = error
    else throw error
  }
  postflight() // any identity/execution error remains ERROR, even after a semantic absence
  if (routeFailure) {
    writeFileSync(join(outputRoot, 'RESULT.json'), JSON.stringify({ ...evidence, status: 'ABSENT',
      reason: routeFailure.message, ticks, ended: new Date().toISOString(), minted: [] }, null, 2) + '\n', { flag: 'wx' })
    process.exitCode = 2
    return
  }
  const artifacts = captures.map(row => {
    const compressed = gzipSync(row.raw, { level: 9 })
    assert.equal(gunzipSync(compressed).toString('utf8'), row.raw)
    return { ...row, compressed, rawSha256: sha(row.raw), gzipSha256: sha(compressed) }
  })
  const manifest = { format: 'genuine-v36-extension-controls/v1', generatedAt: new Date().toISOString(),
    generatingHead: GENERATING_HEAD, currentValidationHead: currentHead, producerSha256: producerSha,
    configSha256: configSha, archiveFilesSha256: archivedBefore.filesSha256, input: inputProof,
    ticks, proposal: { week: 92, ...PROPOSAL }, description: 'New original-engine reproduction; not an earlier capture date or current-engine gameplay.',
    artifacts: artifacts.map(({ raw: _raw, compressed: _compressed, ...metadata }) => metadata) }
  const corpusPath = join(outputRoot, CORPUS)
  mkdirSync(corpusPath)
  const fileProofs: { path: string; sha256: string }[] = []
  for (const artifact of artifacts) {
    const path = join(corpusPath, artifact.filename)
    writeFileSync(path, artifact.compressed, { flag: 'wx' })
    assert.equal(sha(readFileSync(path)), artifact.gzipSha256)
    fileProofs.push({ path: CORPUS + '/' + artifact.filename, sha256: artifact.gzipSha256 })
  }
  const manifestText = JSON.stringify(manifest, null, 2) + '\n'
  writeFileSync(join(corpusPath, 'MANIFEST.json'), manifestText, { flag: 'wx' })
  fileProofs.push({ path: CORPUS + '/MANIFEST.json', sha256: sha(manifestText) })
  postflight()
  assert.deepEqual(readdirSync(corpusPath).sort(), ['MANIFEST.json', ...artifacts.map(row => row.filename)].sort())
  writeFileSync(join(outputRoot, 'RESULT.json'), JSON.stringify({ ...evidence, status: 'MINTED',
    ticks, ended: new Date().toISOString(), sourceIdentityAfter: identity(), archiveFilesSha256After: archivedBefore.filesSha256,
    files: fileProofs }, null, 2) + '\n', { flag: 'wx' })
}
try {
  await main()
} catch (error) {
  const failure = { ...evidence, status: 'EXECUTION_ERROR', ticks, ended: new Date().toISOString(),
    error: error instanceof Error ? { name: error.name, message: error.message, stack: error.stack } : String(error),
    instruction: 'Do not adopt partial artifacts or classify this as ABSENT.' }
  if (outputRoot && !existsSync(join(outputRoot, 'RESULT.json'))) {
    writeFileSync(join(outputRoot, 'RESULT.json'), JSON.stringify(failure, null, 2) + '\n', { flag: 'wx' })
  }
  process.stderr.write(JSON.stringify(failure) + '\n')
  process.exitCode = 1
}
