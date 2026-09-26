// T0 recorder: new fixture artifacts are declared OUTPUTS, never input-source drift.
// Unlike run-fixed-source-c2, this records fixedExistingSource plus an exact output
// manifest check; it never labels a write-producing mint a normal fixedSource test.
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync, openSync, closeSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
const dir = fileURLToPath(new URL('.', import.meta.url))
const base = dir + '953-c3-t0-preservation'
for (const suffix of ['.json', '.txt', '.patch']) if (existsSync(base + suffix)) throw new Error('Refusing to overwrite mint record')
const output = 'tests/fixtures/p14/genuine-v37-c3-corpus/'
if (existsSync(output)) throw new Error('Output corpus already exists; preserve it')
const expectedOutputs = ['MANIFEST.json', 'genuine-v37-c3-created-week0.json.gz',
  'genuine-v37-c3-three-real-releases.json.gz', 'genuine-v37-c3-preannouncement-week103.json.gz',
  'genuine-v37-c3-announced-week104.json.gz', 'genuine-v37-c3-preretirement-week207.json.gz',
  'genuine-v37-c3-retired-week208.json.gz', 'genuine-v37-c3-postretirement-week209.json.gz',
  'genuine-v37-c3-runtime-current208.json.gz', 'runtime52-current208-saved207.json.gz'].map(name => output + name).sort()
const sha = bytes => createHash('sha256').update(bytes).digest('hex')
const git = (...args) => {
  const r = spawnSync('git', args, { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 })
  if (r.status !== 0) throw new Error(r.stderr)
  return r.stdout
}
const consumed = ['src', 'bridge', 'tests', 'ui', 'generated', 'scripts', 'package.json', 'package-lock.json',
  'vitest.config.ts', 'vitest.workspace.ts', 'tsconfig.json', 'tsconfig.bridge.json', 'tsconfig.src.json']
const identity = () => {
  const patch = git('diff', '--no-ext-diff', 'HEAD', '--binary', '--', ...consumed)
  const untracked = git('ls-files', '--others', '--exclude-standard', '--', ...consumed).split('\n').filter(Boolean).sort()
  return { head: git('rev-parse', 'HEAD').trim(), patch, diffSha256: sha(patch),
    untrackedInputs: untracked.filter(path => !expectedOutputs.includes(path)),
    declaredOutputsPresent: untracked.filter(path => expectedOutputs.includes(path)) }
}
const producer = dir + '951-c3-t0-preservation-producer.ts', producerSha256 = sha(readFileSync(producer))
const recorderSha256 = sha(readFileSync(fileURLToPath(import.meta.url)))
if (producerSha256 !== 'aba3b5c101a1982e2994ce69de0e78633a16d499ebe6cb26bdcc31875235bb4c') throw new Error('Producer differs from frozen author handback')
const initial = identity()
if (initial.head !== '1f44aa505c0d677430451ab5fcacaf5e0ce205d6' || initial.patch || initial.untrackedInputs.length || initial.declaredOutputsPresent.length) throw new Error('Unchanged published input source required')
const command = ['node_modules/.bin/vite-node', producer, '--write']
const report = { sourceSha: initial.head, testedDiffSha256: initial.diffSha256,
  producerSha256, recorderSha256, command, declaredOutputs: expectedOutputs,
  sourceAccounting: 'Existing consumed files and undeclared untracked inputs must remain fixed; only these newly generated outputs may appear.',
  start: new Date().toISOString(), end: null, exitCode: null }
writeFileSync(base + '.patch', initial.patch)
writeFileSync(base + '.json', JSON.stringify(report, null, 2) + '\n')
writeFileSync(base + '.txt', JSON.stringify(report) + '\n\n')
const fd = openSync(base + '.txt', 'a')
const child = spawnSync(command[0], command.slice(1), { stdio: ['ignore', fd, fd] })
closeSync(fd)
const final = identity()
const fixedExistingSource = initial.head === final.head && initial.diffSha256 === final.diffSha256
  && JSON.stringify(initial.untrackedInputs) === JSON.stringify(final.untrackedInputs)
  && producerSha256 === sha(readFileSync(producer))
  && recorderSha256 === sha(readFileSync(fileURLToPath(import.meta.url)))
const exactDeclaredOutputs = JSON.stringify(final.declaredOutputsPresent) === JSON.stringify(expectedOutputs)
const outputFiles = final.declaredOutputsPresent.map(path => {
  const bytes = readFileSync(path)
  return { path, bytes: bytes.length, sha256: sha(bytes) }
})
Object.assign(report, { end: new Date().toISOString(), exitCode: child.status, signal: child.signal,
  error: child.error?.message ?? null, sourceShaAtEnd: final.head, testedDiffSha256AtEnd: final.diffSha256,
  untrackedInputsAtEnd: final.untrackedInputs, fixedExistingSource, exactDeclaredOutputs, outputFiles })
writeFileSync(base + '.json', JSON.stringify(report, null, 2) + '\n')
console.log(JSON.stringify({ name: '953-c3-t0-preservation', exitCode: child.status, fixedExistingSource, exactDeclaredOutputs, outputs: outputFiles.length, start: report.start, end: report.end }))
process.exitCode = child.status === 0 && fixedExistingSource && exactDeclaredOutputs ? 0 : 1
