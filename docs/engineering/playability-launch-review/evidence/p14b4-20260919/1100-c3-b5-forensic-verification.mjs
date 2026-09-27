// Snapshot/host byte verification only. No project evaluation or writes.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { lstatSync, readFileSync, readdirSync, realpathSync } from 'node:fs'
import { relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

export const SOURCE = ['src', 'bridge', 'tests', 'generated', 'ui', 'scripts', 'package.json', 'package-lock.json',
  'tsconfig.json', 'tsconfig.bridge.json', 'tsconfig.src.json', 'vitest.config.ts', 'vitest.workspace.ts']
export const E = 'docs/engineering/playability-launch-review/evidence/p14b4-20260919'
export const MANIFEST = '1100-snapshot-manifest.json'
export const PATCH = '1100-semantic-intervention.patch'
export const RESULT = `${E}/1100-c3-b5-forensic-result.json`
export const identity = bytes => ({ bytes: Buffer.byteLength(bytes), sha256: createHash('sha256').update(bytes).digest('hex') })
export function hostIdentity(root) {
  const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 ** 2 })
  return { head: git('rev-parse', 'HEAD').trim(), diff: identity(git('diff', '--no-ext-diff', '--binary', 'HEAD', '--', ...SOURCE)),
    tracked: identity(git('ls-files', '--stage', '--', ...SOURCE)), untracked: git('ls-files', '--others', '--exclude-standard', '--', ...SOURCE).trim() }
}
export function contained(root, local) {
  assert.ok(typeof local === 'string' && local && !local.includes('\0'))
  const full = resolve(root, local), rel = relative(root, full)
  assert.ok(rel && !rel.startsWith(`..${sep}`) && rel !== '..' && !rel.startsWith(sep), 'path confined to explicit root')
  return full
}
export function regular(root, local) {
  const full = contained(root, local), parts = relative(root, full).split(sep)
  let cursor = root
  for (const part of parts) { cursor = resolve(cursor, part); assert.equal(lstatSync(cursor).isSymbolicLink(), false, 'source/extra symlink refused') }
  assert.ok(lstatSync(full).isFile()); return full
}
export function verifySnapshot(snapshot, expectedManifestSha, allowResult = false) {
  snapshot = realpathSync(snapshot)
  assert.match(expectedManifestSha, /^[a-f0-9]{64}$/)
  const manifestPath = regular(snapshot, MANIFEST), manifestBytes = readFileSync(manifestPath)
  assert.equal(identity(manifestBytes).sha256, expectedManifestSha, 'exact frozen snapshot manifest')
  const manifest = JSON.parse(manifestBytes)
  assert.equal(manifest.protocol, '1100-single-busy-intervention-v1')
  assert.equal(manifest.snapshotRoot, snapshot); assert.equal(manifest.sourceFiles.length, 1660)
  assert.ok(manifest.sourceFiles.length <= 2000)
  assert.equal(manifest.sourceFiles.reduce((sum, row) => sum + row.original.bytes, 0), 112446454)
  assert.ok(manifest.sourceFiles.reduce((sum, row) => sum + row.original.bytes, 0) <= 256 * 1024 ** 2)
  assert.equal(manifest.intervention.path, 'src/core/hollywoodTick.ts')
  assert.equal(manifest.intervention.original.sha256, '55bccdc4e2a0c62c1769ebcaf9e8d72f40cbf30d86729581ecc7d7a2ae93ddbe')
  assert.deepEqual(hostIdentity(manifest.hostRoot), manifest.hostSource, 'host HEAD/index/consumed bytes unchanged')
  const gitNames = execFileSync('git', ['ls-files', '-z', '--', ...SOURCE], { cwd: manifest.hostRoot, encoding: 'utf8', maxBuffer: 64 * 1024 ** 2 })
  assert.deepEqual(identity(gitNames), manifest.sourceList)
  assert.deepEqual(gitNames.split('\0').filter(Boolean), manifest.sourceFiles.map(row => row.path))
  assert.equal(new Set(manifest.sourceFiles.map(row => row.path)).size, 1660)
  const expected = new Set([MANIFEST, PATCH, 'node_modules'])
  let unchanged = 0
  for (const row of manifest.sourceFiles) {
    assert.equal(expected.has(row.path), false); expected.add(row.path)
    const hostBytes = readFileSync(regular(manifest.hostRoot, row.path)), copied = readFileSync(regular(snapshot, row.path))
    assert.deepEqual(identity(hostBytes), row.original)
    assert.deepEqual(identity(copied), row.copied)
    if (row.path !== manifest.intervention.path) { assert.ok(copied.equals(hostBytes)); unchanged++ }
  }
  assert.equal(unchanged, 1659)
  assert.deepEqual(manifest.extras.map(row => row.path), manifest.extraPaths)
  for (const row of manifest.extras) {
    assert.equal(expected.has(row.path), false); expected.add(row.path)
    assert.deepEqual(identity(readFileSync(regular(manifest.hostRoot, row.path))), row.identity)
    assert.deepEqual(identity(readFileSync(regular(snapshot, row.path))), row.identity)
  }
  const hostOriginal = readFileSync(regular(manifest.hostRoot, manifest.intervention.path), 'utf8')
  let transformed = hostOriginal
  for (const edit of manifest.intervention.edits) {
    assert.equal(transformed.split(edit.oldText).length, 2, 'one exact intervention site')
    assert.equal(edit.newText, '', 'only qualified import/comment/loop removal')
    transformed = transformed.replace(edit.oldText, edit.newText)
  }
  const copiedText = readFileSync(regular(snapshot, manifest.intervention.path), 'utf8')
  assert.equal(copiedText, transformed)
  assert.deepEqual(identity(transformed), manifest.intervention.transformed)
  const reconstructed = []
  let cursor = 0, transformedCursor = 0
  for (const edit of manifest.intervention.edits) {
    const unchangedText = hostOriginal.slice(cursor, edit.originalStart)
    assert.equal(transformed.slice(transformedCursor, transformedCursor + unchangedText.length), unchangedText)
    reconstructed.push(unchangedText, edit.oldText)
    cursor = edit.originalEnd; transformedCursor += unchangedText.length
  }
  assert.equal(transformed.slice(transformedCursor), hostOriginal.slice(cursor))
  reconstructed.push(transformed.slice(transformedCursor)); assert.equal(reconstructed.join(''), hostOriginal)
  assert.deepEqual(identity(readFileSync(regular(snapshot, PATCH))), manifest.intervention.patch)
  const modules = resolve(snapshot, 'node_modules')
  assert.equal(lstatSync(modules).isSymbolicLink(), true)
  assert.equal(realpathSync(modules), manifest.dependencies.realPath)
  assert.equal(realpathSync(resolve(manifest.hostRoot, 'node_modules')), manifest.dependencies.realPath)
  const found = []
  const visit = current => {
    for (const name of readdirSync(current).sort()) {
      const full = resolve(current, name), local = relative(snapshot, full), stat = lstatSync(full)
      if (local === 'node_modules') { found.push(local); continue }
      assert.equal(stat.isSymbolicLink(), false, 'no other copied symlink')
      if (stat.isDirectory()) { assert.notEqual(name, '.git'); visit(full) }
      else { assert.ok(stat.isFile()); found.push(local) }
    }
  }
  visit(snapshot)
  if (allowResult && found.includes(RESULT)) { expected.add(RESULT); assert.ok(lstatSync(regular(snapshot, RESULT)).size <= 16 * 1024 ** 2) }
  assert.deepEqual(found.sort(), [...expected].sort(), 'complete bounded snapshot inventory')
  assert.deepEqual(identity(readFileSync(manifestPath)), identity(manifestBytes), 'manifest unchanged')
  assert.deepEqual(hostIdentity(manifest.hostRoot), manifest.hostSource)
  return { marker: 'C3_B5_FORENSIC_SNAPSHOT_VERIFIED', manifest: identity(manifestBytes), snapshotRoot: snapshot,
    hostSource: manifest.hostSource, sourceFiles: 1660, unchangedSourceFiles: unchanged, extras: manifest.extras.length,
    intervention: manifest.intervention.transformed, gameplayCalls: 0 }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2)
    assert.equal(args.length, 6); assert.equal(args[0], '--snapshot-root'); assert.equal(args[2], '--manifest-sha'); assert.equal(args[4], '--allow-result')
    assert.ok(args[5] === 'true' || args[5] === 'false')
    console.log(JSON.stringify(verifySnapshot(args[1], args[3], args[5] === 'true')))
  } catch (error) {
    console.error(JSON.stringify({ marker: 'C3_B5_FORENSIC_SNAPSHOT_REFUSED', message: String(error).slice(0, 6000) })); process.exitCode = 1
  }
}
