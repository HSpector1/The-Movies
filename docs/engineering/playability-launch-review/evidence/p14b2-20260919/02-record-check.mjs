import { spawnSync } from 'node:child_process'
import { appendFileSync, closeSync, existsSync, openSync, readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
const cwd = process.cwd()
const directory = `${cwd}/docs/engineering/playability-launch-review/evidence/p14b2-20260919`
const [name, command, ...args] = process.argv.slice(2)
if (!/^(01|02)[a-z0-9-]*$/.test(name ?? '') || !command) throw new Error('Expected scoped evidence name and command')
const git = (...args) => {
  const result = spawnSync('git', args, { cwd, encoding: 'utf8' })
  if (result.status !== 0) throw new Error(result.stderr)
  return result.stdout
}
const hash = (value) => createHash('sha256').update(value).digest('hex')
const identity = () => {
  const trackedDiff = git('diff', 'HEAD', '--binary', '--', 'src', 'bridge', 'tests', 'generated', 'ui')
  const untracked = git('ls-files', '--others', '--exclude-standard', '--', 'src', 'bridge', 'tests', 'generated', 'ui').trim().split('\n').filter(Boolean)
  return { trackedDiff, trackedDiffSha256: hash(trackedDiff), untrackedFiles: Object.fromEntries(untracked.map((path) => [path, hash(readFileSync(path))])) }
}
const before = identity()
const metadata = { sourceSha: git('rev-parse', 'HEAD').trim(), command: [command, ...args], node: process.version,
  start: new Date().toISOString(), end: null, exitCode: null, before }
const path = `${directory}/${name}`
if (existsSync(`${path}.txt`)) throw new Error('Refusing to overwrite existing evidence')
writeFileSync(`${path}.patch`, before.trackedDiff)
writeFileSync(`${path}.sources.json`, JSON.stringify(Object.fromEntries(Object.keys(before.untrackedFiles).map((file) => [file, readFileSync(file, 'utf8')])), null, 2) + '\n')
writeFileSync(`${path}.json`, JSON.stringify(metadata, null, 2) + '\n')
writeFileSync(`${path}.txt`, JSON.stringify(metadata) + '\n\n')
const fd = openSync(`${path}.txt`, 'a')
console.log(`START ${name}`)
const result = spawnSync(command, args, { cwd, stdio: ['ignore', fd, fd] })
closeSync(fd)
metadata.end = new Date().toISOString()
metadata.exitCode = result.status
metadata.signal = result.signal
metadata.after = identity()
metadata.fixedSource = JSON.stringify(before) === JSON.stringify(metadata.after)
appendFileSync(`${path}.txt`, `\n${JSON.stringify(metadata)}\n`)
writeFileSync(`${path}.json`, JSON.stringify(metadata, null, 2) + '\n')
console.log(`END ${name} exit=${result.status} fixedSource=${metadata.fixedSource}`)
process.exitCode = result.status ?? 1
