// Actual unchanged Bridge compiler options plus one explicit evidence root.
// No project module is evaluated and no configuration or emitted file is written.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const root = fileURLToPath(new URL('../../../../../', import.meta.url))
const configPath = resolve(root, 'tsconfig.bridge.json')
const extraRoot = fileURLToPath(new URL('./1094-c3-b5-receipt-attribution.ts', import.meta.url))
const hash = bytes => createHash('sha256').update(bytes).digest('hex')
const configBefore = readFileSync(configPath), producerBefore = readFileSync(extraRoot)
const loaded = ts.readConfigFile(configPath, ts.sys.readFile)
assert.equal(loaded.error, undefined)
const parsed = ts.parseJsonConfigFileContent(loaded.config, ts.sys, root, undefined, configPath)
assert.equal(parsed.errors.length, 0)
assert.equal(parsed.options.noEmit, true)
const roots = [...new Set([...parsed.fileNames, extraRoot])]
const program = ts.createProgram(roots, parsed.options)
const diagnostics = ts.getPreEmitDiagnostics(program)
const files = program.getSourceFiles().map(file => resolve(file.fileName))
for (const path of [extraRoot, resolve(root, 'bridge/testing/c3-active-endurance-observer.ts'),
  fileURLToPath(new URL('./1052-c3-active-endurance-driver.ts', import.meta.url))]) {
  assert.ok(files.includes(path), 'actual compiler graph includes ' + path)
}
const host = { getCanonicalFileName: fileName => fileName, getCurrentDirectory: () => root,
  getNewLine: () => '\n' }
if (diagnostics.length) process.stdout.write(ts.formatDiagnostics(diagnostics, host))
for (const path of files) console.log(path)
assert.ok(readFileSync(configPath).equals(configBefore), 'Bridge configuration unchanged')
assert.ok(readFileSync(extraRoot).equals(producerBefore), 'evidence producer unchanged')
console.log(JSON.stringify({ marker: 'BRIDGE_PLUS_B5_TYPE_GRAPH', typescript: ts.version,
  configuration: { path: configPath, sha256: hash(configBefore) },
  addedRoot: { path: extraRoot, sha256: hash(producerBefore) }, roots: roots.length,
  sourceFiles: files.length, diagnostics: diagnostics.length, noEmit: true }))
process.exitCode = diagnostics.some(row => row.category === ts.DiagnosticCategory.Error) ? 2 : 0
