// Parent lane only. Existing Bridge options; no emit/config change/gameplay.
import assert from 'node:assert/strict'
import { readFileSync, realpathSync } from 'node:fs'
import { resolve, sep } from 'node:path'
import ts from 'typescript'
import { E, identity, verifySnapshot } from './1105-c3-b5-forensic-verification.mjs'

const args = process.argv.slice(2)
assert.equal(args.length, 4); assert.equal(args[0], '--snapshot-root'); assert.equal(args[2], '--manifest-sha')
const root = realpathSync(args[1]), before = verifySnapshot(root, args[3], false)
const configPath = resolve(root, 'tsconfig.bridge.json'), configuration = readFileSync(configPath)
const addedRoot = resolve(root, E, '1105-c3-b5-forensic.ts')
const loaded = ts.readConfigFile(configPath, ts.sys.readFile); assert.equal(loaded.error, undefined)
const parsed = ts.parseJsonConfigFileContent(loaded.config, ts.sys, root, undefined, configPath)
assert.equal(parsed.errors.length, 0); assert.equal(parsed.options.noEmit, true)
const roots = [...new Set([...parsed.fileNames, addedRoot])]
const program = ts.createProgram(roots, parsed.options), diagnostics = ts.getPreEmitDiagnostics(program)
const files = program.getSourceFiles().map(file => resolve(file.fileName))
for (const path of [addedRoot, resolve(root, E, '1105-c3-b5-assignment-matcher.d.mts'), resolve(root, 'bridge/testing/c3-active-endurance-observer.ts'),
  resolve(root, E, '1052-c3-active-endurance-driver.ts')]) assert.ok(files.includes(path), 'required copied compiler root')
const dependencies = realpathSync(resolve(root, 'node_modules'))
for (const path of files) {
  const actual = realpathSync(path)
  assert.ok(actual.startsWith(root + sep) || actual.startsWith(dependencies + sep), 'all project imports stay within snapshot; only installed dependencies shared')
}
const host = { getCanonicalFileName: fileName => fileName, getCurrentDirectory: () => root, getNewLine: () => '\n' }
assert.ok(readFileSync(configPath).equals(configuration))
assert.deepEqual(verifySnapshot(root, args[3], false), before)
const summary = JSON.stringify({ marker: 'C3_B5_FORENSIC_TYPE_GRAPH', configuration: identity(configuration), roots: roots.length,
  sourceFiles: files.length, completeGraphIdentity: identity(JSON.stringify(files)),
  requiredRoots: [addedRoot, resolve(root, E, '1105-c3-b5-assignment-matcher.d.mts'), resolve(root, 'bridge/testing/c3-active-endurance-observer.ts'), resolve(root, E, '1052-c3-active-endurance-driver.ts')],
  allProjectImportsConfinedToSnapshot: true, diagnostics: diagnostics.length, snapshot: before, gameplayCalls: 0, emittedFiles: 0 })
const output = (diagnostics.length ? ts.formatDiagnostics(diagnostics, host) : '') + summary + '\n'
assert.ok(Buffer.byteLength(output) <= 32 * 1024, 'compiler diagnostics cap; no truncation')
process.stdout.write(output)
process.exitCode = diagnostics.some(row => row.category === ts.DiagnosticCategory.Error) ? 2 : 0
