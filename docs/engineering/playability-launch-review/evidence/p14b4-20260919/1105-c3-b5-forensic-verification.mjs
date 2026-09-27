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
export const MANIFEST = '1105-snapshot-manifest.json'
export const PATCH = '1105-semantic-intervention.patch'
export const RESULT = `${E}/1105-c3-b5-forensic-result.json`
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
// File-only proof of the separately approved wrapper adaptation and new lineage.
export function verifyAmendment(root) {
  const path = `${E}/1105-c3-b5-forensic-provenance.json`
  const bytes = readFileSync(regular(root, path)), protocol = JSON.parse(bytes), amendment = protocol.amendment
  assert.equal(protocol.protocol, '1105-single-busy-intervention-v1')
  assert.equal(amendment.baseProvenance.path, `${E}/1100-c3-b5-forensic-provenance.json`)
  assert.equal(amendment.baseProvenance.identity.sha256, 'c45ac0cc411df724aca1dbc603d622d2b9301a7855c5b6fef32ae6a7b877a1eb')
  const baseBytes = readFileSync(regular(root, amendment.baseProvenance.path))
  assert.deepEqual(identity(baseBytes), amendment.baseProvenance.identity)
  const base = JSON.parse(baseBytes)
  assert.deepEqual(Object.keys(protocol).filter(key => key !== 'amendment'), Object.keys(base))
  for (const key of Object.keys(base)) {
    if (['protocol', 'extraPaths', 'extras'].includes(key)) continue
    assert.deepEqual(protocol[key], base[key], `unchanged original protocol field:${key}`)
  }
  assert.equal(protocol.sourceFiles.length, 1660); assert.equal(protocol.extraPaths.length, 10)
  const addedCopied = [`${E}/1105-c3-b5-assignment-matcher.mjs`, `${E}/1105-c3-b5-assignment-matcher.d.mts`]
  const expectedPaths = base.extraPaths.map(value => value.replaceAll('1100', '1105'))
  expectedPaths.splice(-1, 0, ...addedCopied)
  assert.deepEqual(protocol.extraPaths, expectedPaths)
  assert.deepEqual(protocol.extras.map(row => row.path), protocol.extraPaths.slice(0, -1))
  for (const row of protocol.extras) assert.deepEqual(identity(readFileSync(regular(root, row.path))), row.identity)
  assert.equal(amendment.revisedSources.length, 4)
  assert.deepEqual(amendment.revisedSources.map(row => row.originalPath), [
    `${E}/1100-c3-b5-forensic.ts`, `${E}/1100-c3-b5-forensic-prepare.mjs`,
    `${E}/1100-c3-b5-forensic-typecheck.mjs`, `${E}/1100-c3-b5-forensic-verification.mjs`,
  ])
  const reconstructed = []
  for (const row of amendment.revisedSources) {
    const original = readFileSync(regular(root, row.originalPath), 'utf8')
    const revised = readFileSync(regular(root, row.revisedPath), 'utf8')
    assert.equal(row.revisedPath, row.originalPath.replaceAll('1100', '1105'))
    assert.deepEqual(identity(original), row.originalIdentity)
    assert.deepEqual(row.originalIdentity, base.extras.find(value => value.path === row.originalPath)?.identity)
    assert.deepEqual(identity(revised), row.revisedIdentity)
    let forward = original.replaceAll('1100', '1105')
    for (const edit of row.edits) {
      assert.ok(edit.name && edit.oldText && edit.newText)
      assert.equal(forward.split(edit.oldText).length, 2, `one forward adapter site:${edit.name}`)
      forward = forward.replace(edit.oldText, edit.newText)
    }
    assert.equal(forward, revised, 'complete revised source; no unlisted changed byte')
    let reverse = revised
    for (const edit of [...row.edits].reverse()) {
      assert.equal(reverse.split(edit.newText).length, 2, `one reverse adapter site:${edit.name}`)
      reverse = reverse.replace(edit.newText, edit.oldText)
    }
    reverse = reverse.replaceAll('1105', '1100')
    assert.equal(reverse, original, 'complete original producer/helper byte reconstruction')
    reconstructed.push({ path: row.originalPath, identity: identity(reverse) })
  }
  assert.deepEqual(amendment.hostOnlyInputs.map(row => row.path), [
    `${E}/1100-c3-b5-forensic-result.json`, `${E}/1105-c3-b5-assignment-matcher-controls.mjs`,
  ])
  for (const row of amendment.hostOnlyInputs) {
    assert.equal(protocol.extraPaths.includes(row.path), false, 'host-only evidence never enters simulation copy')
    assert.deepEqual(identity(readFileSync(regular(root, row.path))), row.identity)
  }
  const restoredProtocol = { ...protocol }
  delete restoredProtocol.amendment
  restoredProtocol.protocol = base.protocol
  restoredProtocol.extraPaths = base.extraPaths
  restoredProtocol.extras = base.extras
  assert.equal(JSON.stringify(restoredProtocol, null, 2) + '\n', baseBytes.toString('utf8'), 'complete original provenance reconstruction')
  assert.ok(readFileSync(regular(root, path)).equals(bytes))
  return { marker: 'C3_B5_WRAPPER_AMENDMENT_VERIFIED', provenance: identity(bytes), baseProvenance: identity(baseBytes),
    originalSourceReconstruction: reconstructed, copiedExtras: 10, hostOnlyInputs: amendment.hostOnlyInputs, gameplayCalls: 0 }
}

export function verifySnapshot(snapshot, expectedManifestSha, allowResult = false) {
  snapshot = realpathSync(snapshot)
  assert.match(expectedManifestSha, /^[a-f0-9]{64}$/)
  const manifestPath = regular(snapshot, MANIFEST), manifestBytes = readFileSync(manifestPath)
  assert.equal(identity(manifestBytes).sha256, expectedManifestSha, 'exact frozen snapshot manifest')
  const manifest = JSON.parse(manifestBytes)
  assert.equal(manifest.protocol, '1105-single-busy-intervention-v1')
  assert.equal(manifest.snapshotRoot, snapshot); assert.equal(manifest.sourceFiles.length, 1660)
  assert.ok(manifest.sourceFiles.length <= 2000)
  assert.equal(manifest.sourceFiles.reduce((sum, row) => sum + row.original.bytes, 0), 112446454)
  assert.ok(manifest.sourceFiles.reduce((sum, row) => sum + row.original.bytes, 0) <= 256 * 1024 ** 2)
  assert.equal(manifest.intervention.path, 'src/core/hollywoodTick.ts')
  assert.equal(manifest.intervention.original.sha256, '55bccdc4e2a0c62c1769ebcaf9e8d72f40cbf30d86729581ecc7d7a2ae93ddbe')
  assert.deepEqual(hostIdentity(manifest.hostRoot), manifest.hostSource, 'host HEAD/index/consumed bytes unchanged')
  assert.deepEqual(verifyAmendment(manifest.hostRoot).provenance, manifest.protocolIdentity)
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
  assert.deepEqual(verifyAmendment(manifest.hostRoot).provenance, manifest.protocolIdentity)
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
