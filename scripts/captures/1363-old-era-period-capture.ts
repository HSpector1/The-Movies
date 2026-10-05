// Genuine original-engine V26 continuation: exactly three default ticks, 309→312.
// Installed only after review; no current gameplay or synthetic state repair.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { lstatSync, mkdirSync, readFileSync, readdirSync, realpathSync, writeFileSync } from 'node:fs'
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync, gunzipSync } from 'node:zlib'
import type { GameStateV26 } from '../../src/core/types.js'
import type { SaveFileV26 } from '../../src/core/save.js'

const GENERATING_HEAD = 'ce6945d58257f70c1b222a8c00e06038db73f6e4'
const INPUT = 'tests/fixtures/p13b/legacy-v26-sound-mid-deployment-309.json.gz'
const PROVENANCE = 'tests/fixtures/p13b/PROVENANCE.md'
const INPUT_RAW_SHA = '11ef05be4131d3d3c4a19484f31e79cb50fa1936868f96ace7d0d18ea86e2d72'
const PRODUCER = 'scripts/captures/1363-old-era-period-capture.ts'
const CONFIG = 'scripts/captures/1363-old-era-period-capture.config.ts'
const WATCHDOG = 'scripts/captures/1363-old-era-period-watchdog.py'
const TYPES = 'scripts/captures/tsconfig.1363-old-era-period-capture.json'
const OUTPUT = '/Users/zacheryspector/studio-scratch/1363-old-era-period-capture-01'
const CAPTURE = 'genuine-v26-sound-mid-deployment-week312.json.gz'
const SOURCE = ['src', 'bridge', 'tests', 'ui', 'generated', 'scripts', 'package.json', 'package-lock.json',
  'vitest.config.ts', 'vitest.workspace.ts', 'tsconfig.json', 'tsconfig.bridge.json', 'tsconfig.src.json']
const EXCLUDED = ['tests/fixtures/', 'ui/e2e/', 'ui/public/']
const PATHS = [...SOURCE, ...EXCLUDED.map(prefix => ':(exclude)' + prefix.slice(0, -1))]
const allowed = (path: string) => !EXCLUDED.some(prefix => path.startsWith(prefix))
const sha = (value: string | Uint8Array) => createHash('sha256').update(value).digest('hex')
const required = (name: string): string => { const value = process.env[name]; assert.ok(value, 'required environment: ' + name); return value }
const pin = (name: string): string => { const value = required(name); assert.match(value, /^[0-9a-f]{64}$/); return value }
const inside = (child: string, parent: string) => child === parent || child.startsWith(parent + sep)
function exists(path: string): boolean {
  try { lstatSync(path); return true } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return false
    throw error
  }
}
function noSymlinkPath(path: string): void {
  assert.ok(isAbsolute(path))
  let at = path
  while (true) {
    assert.ok(!lstatSync(at).isSymbolicLink(), 'symlink path component: ' + at)
    const parent = dirname(at)
    if (parent === at) break
    at = parent
  }
}
type ArchivedSave = {
  LIVE_SAVE_VERSION: number
  makeSave(state: GameStateV26): SaveFileV26
  validateSaveV26(value: unknown): SaveFileV26
  stableStringify(value: unknown): string
  exportSave(value: SaveFileV26): string
  importSave(value: string): unknown
}
class Absent extends Error {}
const started = new Date().toISOString(), startedMs = Date.now()
const bound = () => assert.ok(Date.now() - startedMs <= 300_000, 'five-minute internal elapsed bound exceeded')
let outputRoot: string | undefined
let ticks = 0
let evidence: Record<string, unknown> = { started, generatingHead: GENERATING_HEAD,
  declaredBound: { startWeek: 309, ticks: 3, endWeek: 312, timeoutMs: 300_000 } }

async function main(): Promise<void> {
  const requestedRepo = resolve(process.cwd())
  noSymlinkPath(requestedRepo)
  const repo = realpathSync(requestedRepo)
  const git = (...args: string[]) => execFileSync('git', args, { cwd: repo, encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024, env: { ...process.env, GIT_OPTIONAL_LOCKS: '0' } })
  assert.equal(realpathSync(git('rev-parse', '--show-toplevel').trim()), repo, 'run from repository top level')
  const currentHead = required('P1363_OLD_PERIOD_CURRENT_HEAD')
  assert.match(currentHead, /^[0-9a-f]{40}$/)
  assert.equal(git('rev-parse', 'HEAD').trim(), currentHead)
  assert.equal(realpathSync(fileURLToPath(import.meta.url)), join(repo, PRODUCER))
  const namedFiles = [PRODUCER, CONFIG, WATCHDOG, TYPES, INPUT, PROVENANCE, 'src/core/save.ts', 'package.json', 'package-lock.json']
  for (const path of namedFiles) {
    git('ls-files', '--error-unmatch', '--', path)
    noSymlinkPath(join(repo, path))
    assert.ok(lstatSync(join(repo, path)).isFile(), 'named input must be regular')
  }
  const producerSha = sha(readFileSync(join(repo, PRODUCER)))
  const configSha = sha(readFileSync(join(repo, CONFIG)))
  const watchdogSha = sha(readFileSync(join(repo, WATCHDOG)))
  const typesSha = sha(readFileSync(join(repo, TYPES)))
  assert.equal(producerSha, pin('P1363_OLD_PERIOD_PRODUCER_SHA256'))
  assert.equal(configSha, pin('P1363_OLD_PERIOD_CONFIG_SHA256'))
  assert.equal(watchdogSha, pin('P1363_OLD_PERIOD_WATCHDOG_SHA256'))
  assert.equal(typesSha, pin('P1363_OLD_PERIOD_TYPES_SHA256'))
  const identity = () => {
    const included = git('ls-files', '--', ...PATHS).split('\n').filter(Boolean).filter(allowed).sort()
    assert.ok(included.length > 0)
    return { head: git('rev-parse', 'HEAD').trim(),
      scope: { roots: SOURCE, included, excludedAutomaticReadPrefixes: EXCLUDED, authorizedManualInputsSeparate: true },
      diffSha256: sha(git('diff', '--no-ext-diff', 'HEAD', '--binary', '--', ...included)),
      untracked: git('ls-files', '--others', '--exclude-standard', '--', ...PATHS).split('\n').filter(Boolean).filter(allowed).sort(),
      indexSha256: sha(readFileSync(resolve(repo, git('rev-parse', '--git-path', 'index').trim()))),
      stageEntriesSha256: sha(git('ls-files', '--stage', '-z')) }
  }
  const sourceBefore = identity()
  assert.equal(sourceBefore.diffSha256, sha(''), 'bounded current source must be clean')
  assert.deepEqual(sourceBefore.untracked, [], 'no untracked consumed source/helpers')

  const archiveArg = required('P1363_OLD_PERIOD_ARCHIVE_ROOT')
  assert.ok(isAbsolute(archiveArg)); noSymlinkPath(archiveArg)
  const archive = realpathSync(archiveArg)
  assert.ok(!inside(archive, repo) && !inside(repo, archive), 'archive/current trees must be disjoint')
  const rows = git('ls-tree', '-r', '-z', GENERATING_HEAD, '--', 'src').split('\0').filter(Boolean).map(entry => {
    const match = /^(100644|100755) blob ([0-9a-f]{40})\t(.+)$/.exec(entry)
    assert.ok(match, 'archive requires original ordinary source blobs')
    return { path: match[3]!, gitBlob: match[2]! }
  })
  assert.ok(rows.length > 0)
  const archiveIdentity = () => {
    noSymlinkPath(archive)
    const actual: string[] = []
    const walk = (path: string): void => {
      const stat = lstatSync(path)
      assert.ok(!stat.isSymbolicLink(), 'archive contains a symlink')
      if (stat.isDirectory()) for (const name of readdirSync(path).sort()) walk(join(path, name))
      else { assert.ok(stat.isFile(), 'archive contains nonregular source'); actual.push(relative(archive, path).split(sep).join('/')) }
    }
    walk(join(archive, 'src'))
    assert.deepEqual(actual.sort(), rows.map(row => row.path).sort(), 'no added or omitted archived source file')
    const files = rows.map(row => {
      const data = readFileSync(join(archive, row.path))
      assert.equal(createHash('sha1').update('blob ' + data.length + '\0').update(data).digest('hex'), row.gitBlob, row.path)
      return { ...row, sha256: sha(data) }
    })
    return { generatingHead: GENERATING_HEAD, files, filesSha256: sha(JSON.stringify(files)), fileCount: files.length }
  }
  const archivedBefore = archiveIdentity()
  assert.equal(archivedBefore.filesSha256, pin('P1363_OLD_PERIOD_ARCHIVE_SHA256'))
  const compressedInput = readFileSync(join(repo, INPUT))
  const gzipInputSha = sha(compressedInput)
  assert.equal(gzipInputSha, pin('P1363_OLD_PERIOD_INPUT_GZIP_SHA256'))
  const inputRaw = gunzipSync(compressedInput).toString('utf8')
  assert.equal(sha(inputRaw), INPUT_RAW_SHA)
  const provenanceSha = sha(readFileSync(join(repo, PROVENANCE)))
  assert.equal(provenanceSha, pin('P1363_OLD_PERIOD_INPUT_PROVENANCE_SHA256'))
  const dependencies = ['package.json', 'package-lock.json', 'node_modules/vite/package.json', 'node_modules/vite-node/package.json']
    .map(path => { noSymlinkPath(join(repo, path)); return { path, sha256: sha(readFileSync(join(repo, path))) } })
  assert.equal(required('P1363_OLD_PERIOD_OUTPUT'), OUTPUT, 'new attempt/output naming requires explicit review')
  assert.ok(!exists(OUTPUT), 'output already exists, including dangling symlink; no overwrite or cleanup')
  noSymlinkPath(dirname(OUTPUT))
  assert.equal(realpathSync(dirname(OUTPUT)), dirname(OUTPUT))
  for (const source of [repo, archive]) assert.ok(!inside(OUTPUT, source) && !inside(source, OUTPUT), 'output/source must be disjoint')
  mkdirSync(OUTPUT)
  outputRoot = OUTPUT
  evidence = { ...evidence, currentValidationHead: currentHead, producer: PRODUCER, producerSha256: producerSha,
    config: CONFIG, configSha256: configSha, watchdog: WATCHDOG, watchdogSha256: watchdogSha,
    types: TYPES, typesSha256: typesSha,
    sourceIdentityBefore: sourceBefore, archivedBefore, archiveRoot: archive, outputRoot,
    input: { path: INPUT, gzipSha256: gzipInputSha, rawSha256: INPUT_RAW_SHA, gzipBytes: compressedInput.length,
      rawBytes: Buffer.byteLength(inputRaw), provenancePath: PROVENANCE, provenanceSha256: provenanceSha },
    dependencies, command: process.argv, nodeVersion: process.version,
    declaredOutputs: [CAPTURE, 'MANIFEST.json', 'RESULT.json'] }
  const postflight = () => {
    bound(); assert.deepEqual(identity(), sourceBefore, 'current source/index changed')
    assert.deepEqual(archiveIdentity(), archivedBefore, 'archived source changed')
    for (const path of namedFiles) noSymlinkPath(join(repo, path))
    assert.equal(sha(readFileSync(join(repo, PRODUCER))), producerSha)
    assert.equal(sha(readFileSync(join(repo, CONFIG))), configSha)
    assert.equal(sha(readFileSync(join(repo, WATCHDOG))), watchdogSha)
    assert.equal(sha(readFileSync(join(repo, TYPES))), typesSha)
    assert.equal(sha(readFileSync(join(repo, INPUT))), gzipInputSha)
    assert.equal(sha(readFileSync(join(repo, PROVENANCE))), provenanceSha)
    for (const row of dependencies) { noSymlinkPath(join(repo, row.path)); assert.equal(sha(readFileSync(join(repo, row.path))), row.sha256) }
  }
  const old: ArchivedSave = await import('/@fs/' + join(archive, 'src/core/save.ts'))
  const { tick }: { tick(state: GameStateV26): GameStateV26 } = await import('/@fs/' + join(archive, 'src/core/tick.ts'))
  const current: typeof import('../../src/core/save.js') = await import('/@fs/' + join(repo, 'src/core/save.ts'))
  assert.equal(old.LIVE_SAVE_VERSION, 26)
  assert.equal(current.LIVE_SAVE_VERSION, 45, 'requires explicit refresh at a later current validation era')
  const parsedInput: unknown = JSON.parse(inputRaw)
  const inputBytes = old.stableStringify(parsedInput)
  const input = old.validateSaveV26(parsedInput)
  assert.equal(input, parsedInput, 'archived reader must return the original admitted envelope')
  assert.equal(old.stableStringify(parsedInput), inputBytes, 'first archived reader mutated input')
  assert.equal(current.validateSaveV26(input), input)
  assert.equal(old.stableStringify(input), inputBytes, 'current reader mutated input')
  assert.equal(input.state.market.tick, 309)
  let state = input.state
  const boundaries: { week: number; envelopeSha256: string; stateSha256: string }[] = []
  const validateBoundary = (expected: number): SaveFileV26 => {
    bound(); assert.equal(state.market.tick, expected)
    const before = old.stableStringify(state)
    const envelope = old.makeSave(state)
    assert.equal(envelope.saveVersion, 26)
    const envelopeBytes = old.stableStringify(envelope)
    assert.equal(old.validateSaveV26(envelope), envelope)
    assert.equal(old.stableStringify(envelope), envelopeBytes, 'archived boundary reader mutated envelope')
    assert.equal(current.validateSaveV26(envelope), envelope)
    assert.equal(old.stableStringify(envelope), envelopeBytes, 'current boundary reader mutated envelope')
    assert.equal(old.stableStringify(state), before, 'boundary writers/readers mutated source state')
    boundaries.push({ week: expected, envelopeSha256: sha(envelopeBytes), stateSha256: sha(before) })
    return envelope
  }
  validateBoundary(309)
  for (const expected of [310, 311, 312]) {
    bound(); assert.ok(ticks < 3)
    const previous = state, before = old.stableStringify(previous)
    state = tick(previous) // actual archived default tick; no actions, options or current-engine tick
    ticks++
    assert.equal(old.stableStringify(previous), before, 'archived tick mutated its input')
    validateBoundary(expected)
    assert.equal(old.stableStringify(input), inputBytes, 'original parsed save mutated')
  }
  assert.equal(ticks, 3)
  const previousYearOwners = state.hollywood?.businesses.filter(b => {
    const last = b.account.periods.at(-1)
    return last !== undefined && Math.floor(last.fromWeek / 52) < 6 && last.throughWeek < 312
  }).map(b => b.studioId) ?? []
  evidence = { ...evidence, boundaries, observedWeek: state.market.tick, previousYearOwners }
  if (previousYearOwners.length === 0) {
    postflight()
    throw new Absent('Exact three-tick route supplies no rival with a previous-year period at week 312')
  }
  const finalStateBytes = old.stableStringify(state)
  const final = old.makeSave(state)
  assert.equal(old.stableStringify(state), finalStateBytes, 'final writer mutated state')
  const finalBytes = old.stableStringify(final)
  assert.equal(old.validateSaveV26(final), final)
  assert.equal(old.stableStringify(final), finalBytes, 'final archived reader mutated envelope')
  assert.equal(current.validateSaveV26(final), final)
  assert.equal(old.stableStringify(final), finalBytes, 'final current reader mutated envelope')
  const raw = old.exportSave(final)
  assert.equal(old.stableStringify(final), finalBytes, 'archived export mutated final envelope')
  const imported = old.importSave(raw)
  const importedBytes = old.stableStringify(imported)
  const reloaded = old.validateSaveV26(imported)
  assert.equal(reloaded, imported)
  assert.equal(old.stableStringify(imported), importedBytes, 'archived reader mutated imported envelope')
  assert.equal(current.validateSaveV26(reloaded), reloaded)
  assert.equal(old.stableStringify(reloaded), importedBytes, 'current reader mutated imported envelope')
  assert.equal(old.exportSave(reloaded), raw)
  assert.equal(old.stableStringify(reloaded), importedBytes, 'archived re-export mutated imported envelope')
  const currentParsed: unknown = JSON.parse(raw)
  const currentParsedBytes = old.stableStringify(currentParsed)
  const currentRead = current.validateSaveV26(currentParsed)
  assert.equal(currentRead, currentParsed)
  assert.equal(old.stableStringify(currentParsed), currentParsedBytes, 'current codec reader mutated envelope')
  assert.equal(current.exportSave(currentRead), raw)
  assert.equal(old.stableStringify(currentRead), currentParsedBytes, 'current export mutated envelope')
  assert.equal(old.stableStringify(final), finalBytes)
  assert.equal(old.stableStringify(state), finalStateBytes)
  assert.equal(old.stableStringify(input), inputBytes)
  const compressed = gzipSync(raw, { level: 9 })
  assert.equal(gunzipSync(compressed).toString('utf8'), raw)
  postflight()
  const capture = { name: CAPTURE, gzipSha256: sha(compressed), rawSha256: sha(raw),
    gzipBytes: compressed.length, rawBytes: Buffer.byteLength(raw) }
  const manifest = { format: '1363-old-era-period-capture/v1', generatedAt: new Date().toISOString(),
    generatingHead: GENERATING_HEAD, currentValidationHead: currentHead,
    producerSha256: producerSha, configSha256: configSha, watchdogSha256: watchdogSha, typesSha256: typesSha,
    archivedSourceFilesSha256: archivedBefore.filesSha256, sourceSaveVersion: 26,
    startWeek: 309, ticks, week: 312, inputRawSha256: INPUT_RAW_SHA,
    input: evidence.input, capture, boundaries, previousYearOwners,
    route: 'Original ce6945d Save26 writer/input; exactly tick(state) three times, public26 validation at 309/310/311/312; no current gameplay or state edits.',
    limitation: 'Produces an old-period boundary input only; actual affordable V27 laboratory admission remains the separate reviewed test prerequisite.' }
  const manifestText = JSON.stringify(manifest, null, 2) + '\n'
  writeFileSync(join(OUTPUT, CAPTURE), compressed, { flag: 'wx' })
  assert.equal(sha(readFileSync(join(OUTPUT, CAPTURE))), capture.gzipSha256)
  writeFileSync(join(OUTPUT, 'MANIFEST.json'), manifestText, { flag: 'wx' })
  assert.equal(sha(readFileSync(join(OUTPUT, 'MANIFEST.json'))), sha(manifestText))
  postflight()
  assert.deepEqual(readdirSync(OUTPUT).sort(), [CAPTURE, 'MANIFEST.json'].sort())
  const result = { ...evidence, status: 'MINTED', ticks, ended: new Date().toISOString(), elapsedMs: Date.now() - startedMs,
    sourceIdentityAfter: identity(), archivedSourceFilesSha256After: archivedBefore.filesSha256,
    capture, manifestSha256: sha(manifestText) }
  writeFileSync(join(OUTPUT, 'RESULT.json'), JSON.stringify(result, null, 2) + '\n', { flag: 'wx' })
  process.stdout.write(JSON.stringify({ status: 'MINTED', ticks, output: OUTPUT, capture, manifestSha256: sha(manifestText) }) + '\n')
}
try { await main() }
catch (error) {
  const result = { ...evidence, status: error instanceof Absent ? 'ABSENT' : 'EXECUTION_ERROR', ticks,
    ended: new Date().toISOString(), elapsedMs: Date.now() - startedMs,
    error: error instanceof Error ? { name: error.name, message: error.message, stack: error.stack } : String(error),
    instruction: 'No overwrite or repair. Execution errors/partial artifacts are not an absent witness or a successful capture.' }
  if (outputRoot && !exists(join(outputRoot, 'RESULT.json'))) writeFileSync(join(outputRoot, 'RESULT.json'), JSON.stringify(result, null, 2) + '\n', { flag: 'wx' })
  process.stderr.write(JSON.stringify(result) + '\n')
  process.exitCode = error instanceof Absent ? 2 : 1
}
