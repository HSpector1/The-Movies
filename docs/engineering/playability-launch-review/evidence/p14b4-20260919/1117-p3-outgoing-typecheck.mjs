// Parent-operated, no-evaluation compiler guard. No emission/options changes.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

assert.equal(process.argv.length, 2, 'no compiler options or alternate roots accepted')
const root = fileURLToPath(new URL('../../../../../', import.meta.url))
const self = fileURLToPath(import.meta.url)
const producer = fileURLToPath(new URL('1117-p3-outgoing-preservation.ts', import.meta.url))
const original1052 = fileURLToPath(new URL('1052-c3-active-endurance-driver.ts', import.meta.url))
const config = resolve(root, 'tsconfig.bridge.json')
const sha = value => createHash('sha256').update(value).digest('hex')
const sourcePaths = ['src', 'bridge', 'tests', 'generated', 'ui', 'scripts', 'package.json', 'package-lock.json',
  'tsconfig.json', 'tsconfig.bridge.json', 'tsconfig.src.json', 'vitest.config.ts', 'vitest.workspace.ts']
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024,
  env: { ...process.env, GIT_OPTIONAL_LOCKS: '0' } })
const source = () => {
  const names = git('ls-files', '-z', '--', ...sourcePaths).split('\0').filter(Boolean).sort()
  return { head: git('rev-parse', 'HEAD').trim(), indexSha256: sha(git('ls-files', '--stage', '-z')),
    diffSha256: sha(git('diff', '--no-ext-diff', '--binary', 'HEAD', '--', ...sourcePaths)),
    untracked: git('ls-files', '--others', '--exclude-standard', '-z', '--', ...sourcePaths),
    files: names.map(path => ({ path, sha256: sha(readFileSync(resolve(root, path))) })) }
}
const guarded = [self, producer, config, original1052,
  fileURLToPath(new URL('1116-A-p3-outgoing-preservation-plan.md', import.meta.url)),
  fileURLToPath(new URL('1116-B-p3-outgoing-preservation-plan-review.md', import.meta.url))]
const before = new Map(guarded.map(path => [path, readFileSync(path)]))
const beforeSource = source()
const loaded = ts.readConfigFile(config, ts.sys.readFile)
assert.equal(loaded.error, undefined)
const parsed = ts.parseJsonConfigFileContent(loaded.config, ts.sys, root, undefined, config)
assert.equal(parsed.errors.length, 0); assert.equal(parsed.options.noEmit, true)
const roots = [...new Set([...parsed.fileNames, producer])]
const program = ts.createProgram(roots, parsed.options)
const diagnostics = ts.getPreEmitDiagnostics(program)
const files = program.getSourceFiles().map(file => resolve(file.fileName))
for (const path of [producer, original1052, resolve(root, 'bridge/session.ts'), resolve(root, 'src/core/save.ts'),
  resolve(root, 'bridge/runtime-checkpoint.ts'), resolve(root, 'bridge/runtime/runtime-coordinator.ts')]) {
  assert.ok(files.includes(path), 'actual compiler graph includes ' + path)
}
const host = { getCanonicalFileName: name => name, getCurrentDirectory: () => root, getNewLine: () => '\n' }
if (diagnostics.length) process.stdout.write(ts.formatDiagnostics(diagnostics, host))
for (const path of files) console.log(path)
for (const [path, raw] of before) assert.ok(readFileSync(path).equals(raw), 'unchanged explicit compiler input: ' + path)
assert.deepEqual(source(), beforeSource, 'consumed source, HEAD and index unchanged')
console.log(JSON.stringify({ marker: 'BRIDGE_PLUS_OUTGOING_38_53_PRODUCER_TYPES', roots: roots.length,
  sourceFiles: files.length, diagnostics: diagnostics.length, typescript: ts.version, noEmit: true,
  sourceHead: beforeSource.head, inputs: [...before].map(([path, raw]) => ({ path, bytes: raw.length, sha256: sha(raw) })) }))
process.exitCode = diagnostics.some(row => row.category === ts.DiagnosticCategory.Error) ? 2 : 0
