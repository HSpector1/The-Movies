// Unchanged Bridge compiler options plus explicit recording-amendment roots.
// No project module evaluation, emission, configuration edit or gameplay.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const root = fileURLToPath(new URL('../../../../../', import.meta.url))
const configPath = resolve(root, 'tsconfig.bridge.json')
const extraRoots = ['1098-c3-active-endurance-driver.ts', '1098-c3-observation-codec.ts',
  '1098-c3-recording-verification.ts'].map(name => fileURLToPath(new URL(name, import.meta.url)))
const hash = bytes => createHash('sha256').update(bytes).digest('hex')
const guardedPaths = [fileURLToPath(import.meta.url), configPath, ...extraRoots,
  fileURLToPath(new URL('1098-c3-recording-provenance.json', import.meta.url))]
const before = new Map(guardedPaths.map(path => [path, readFileSync(path)]))
const loaded = ts.readConfigFile(configPath, ts.sys.readFile)
assert.equal(loaded.error, undefined)
const parsed = ts.parseJsonConfigFileContent(loaded.config, ts.sys, root, undefined, configPath)
assert.equal(parsed.errors.length, 0)
assert.equal(parsed.options.noEmit, true)
const roots = [...new Set([...parsed.fileNames, ...extraRoots])]
const program = ts.createProgram(roots, parsed.options)
const diagnostics = ts.getPreEmitDiagnostics(program)
const files = program.getSourceFiles().map(file => resolve(file.fileName))
for (const path of [...extraRoots, resolve(root, 'bridge/testing/c3-active-endurance-observer.ts'),
  fileURLToPath(new URL('1052-c3-active-endurance-driver.ts', import.meta.url))]) {
  assert.ok(files.includes(path), 'actual compiler graph includes ' + path)
}
const host = { getCanonicalFileName: fileName => fileName, getCurrentDirectory: () => root,
  getNewLine: () => '\n' }
if (diagnostics.length) process.stdout.write(ts.formatDiagnostics(diagnostics, host))
for (const path of files) console.log(path)
for (const [path, bytes] of before) assert.ok(readFileSync(path).equals(bytes), 'unchanged guarded file: ' + path)
console.log(JSON.stringify({ marker: 'BRIDGE_PLUS_RECORDING_TYPE_GRAPH', typescript: ts.version,
  inputs: [...before].map(([path, bytes]) => ({ path, bytes: bytes.length, sha256: hash(bytes) })),
  roots: roots.length, sourceFiles: files.length, diagnostics: diagnostics.length, noEmit: true }))
process.exitCode = diagnostics.some(row => row.category === ts.DiagnosticCategory.Error) ? 2 : 0
