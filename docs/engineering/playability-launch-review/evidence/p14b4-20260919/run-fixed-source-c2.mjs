// Fixed-source run recorder for P14C.2 (the 772 record shape: .json, .patch, .txt).
// usage: node docs/engineering/playability-launch-review/evidence/p14b4-20260919/run-fixed-source-c2.mjs <NNN-name> <command> [args...]
// Records the source identity and the tested working diff at START and END, runs the
// command with its output to <NNN-name>.txt, and marks fixedSource false if HEAD, the
// tested diff or the untracked source list moved during the run. Refuses to overwrite.
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { closeSync, existsSync, openSync, writeFileSync } from 'node:fs'

const [name, command, ...args] = process.argv.slice(2)
if (!name || !/^\d{3}[a-z0-9-]*$/.test(name) || !command) throw new Error('usage: <NNN-name> <command> [args...]')
const dir = new URL('.', import.meta.url).pathname
const base = `${dir}${name}`
for (const ext of ['.json', '.patch', '.txt']) if (existsSync(base + ext)) throw new Error(`refusing to overwrite ${name}${ext}`)
const git = (...a) => {
  const r = spawnSync('git', a, { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 })
  if (r.status !== 0) throw new Error(`git ${a.join(' ')}: ${r.stderr}`)
  return r.stdout
}
const SOURCE = ['src', 'bridge', 'tests', 'ui', 'generated', 'scripts', 'package.json', 'package-lock.json',
  'vitest.config.ts', 'vitest.workspace.ts', 'tsconfig.json', 'tsconfig.bridge.json', 'tsconfig.src.json']
const identity = () => {
  const diff = git('diff', 'HEAD', '--binary', '--', ...SOURCE)
  return {
    sha: git('rev-parse', 'HEAD').trim(),
    diff,
    diffSha: createHash('sha256').update(diff).digest('hex'),
    untracked: git('ls-files', '--others', '--exclude-standard', '--', ...SOURCE).split('\n').filter(Boolean),
  }
}
const start = identity()
writeFileSync(base + '.patch', start.diff)
const record = {
  sourceSha: start.sha, testedDiffSha256: start.diffSha, untrackedSource: start.untracked,
  command: [command, ...args], node: process.version, start: new Date().toISOString(),
  end: null, exitCode: null, signal: null, error: null,
}
writeFileSync(base + '.json', JSON.stringify(record, null, 2) + '\n')
writeFileSync(base + '.txt', JSON.stringify(record) + '\n\n')
const fd = openSync(base + '.txt', 'a')
const run = spawnSync(command, args, { stdio: ['ignore', fd, fd] })
closeSync(fd)
const end = identity()
Object.assign(record, {
  end: new Date().toISOString(), exitCode: run.status, signal: run.signal, error: run.error?.message ?? null,
  sourceShaAtEnd: end.sha, testedDiffSha256AtEnd: end.diffSha, untrackedSourceAtEnd: end.untracked,
})
record.fixedSource = end.sha === start.sha && end.diffSha === start.diffSha
  && JSON.stringify(end.untracked) === JSON.stringify(start.untracked)
writeFileSync(base + '.json', JSON.stringify(record, null, 2) + '\n')
console.log(JSON.stringify({ name, exitCode: record.exitCode, fixedSource: record.fixedSource, start: record.start, end: record.end }))
process.exitCode = record.fixedSource ? 0 : 2
