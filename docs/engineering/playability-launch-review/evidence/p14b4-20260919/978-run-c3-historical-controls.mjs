// T0 recorder: new fixture artifacts are declared OUTPUTS, never input-source drift.
// Unlike run-fixed-source-c2, this records fixedExistingSource plus an exact output
// manifest check; it never labels a write-producing mint a normal fixedSource test.
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync, openSync, closeSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
const dir = fileURLToPath(new URL('.', import.meta.url))
const base = dir + '978-c3-historical-controls'
for (const suffix of ['.json', '.txt', '.patch']) if (existsSync(base + suffix)) throw new Error('Refusing to overwrite mint record')
const output = 'tests/fixtures/p14/genuine-pre38-validation-controls/'
if (existsSync(output)) throw new Error('Output corpus already exists; preserve it')
const expectedOutputs = ['MANIFEST.json', 'reproduced-v35-c4-cohort-week-week156.json.gz',
  'reproduced-v35-c4-all-statuses-week312.json.gz', 'reproduced-v35-c4-deep-deficit-week2652.json.gz',
  'reproduced-v37-writer-commissioned311-finishing312.json.gz'].map(name => output + name).sort()
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
const producer = dir + '975-A-c3-historical-controls-producer.ts', producerSha256 = sha(readFileSync(producer))
const recorderSha256 = sha(readFileSync(fileURLToPath(import.meta.url)))
if (producerSha256 !== '5de47c19d3c665e79590126c3c7155d517ef65fc3285a69a751a539cc355e161') throw new Error('Producer differs from frozen author handback')
const initial = identity()
if (initial.head !== 'c000479d6e888d3a02f5c2ff534f5dfcbb32af3f' || initial.untrackedInputs.length || initial.declaredOutputsPresent.length) throw new Error('Unchanged published input source required')
const archiveRoot = JSON.parse(readFileSync(dir + '977-c3-readonly-archive.json', 'utf8')).archiveRoot
const command = ['node_modules/.bin/vite-node', '--script', producer, '--archive-root', archiveRoot, '--write']
const report = { sourceSha: initial.head, testedDiffSha256: initial.diffSha256,
  archiveRoot, producerSha256, recorderSha256, command, declaredOutputs: expectedOutputs,
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
console.log(JSON.stringify({ name: '978-c3-historical-controls', exitCode: child.status, fixedExistingSource, exactDeclaredOutputs, outputs: outputFiles.length, start: report.start, end: report.end }))
process.exitCode = child.status === 0 && fixedExistingSource && exactDeclaredOutputs ? 0 : 1
