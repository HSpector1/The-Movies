// Parent execution only: one bounded exclusive source copy, no compilation or gameplay.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { lstatSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { SOURCE, E, MANIFEST, PATCH, identity, hostIdentity, regular, contained, verifySnapshot } from './1100-c3-b5-forensic-verification.mjs'

let retainedSnapshot = null
function main() {
  const args = process.argv.slice(2)
  assert.equal(args.length, 2); assert.equal(args[0], '--source-sha'); assert.match(args[1], /^[a-f0-9]{40}$/)
  const root = realpathSync(fileURLToPath(new URL('../../../../../', import.meta.url)))
  const source = hostIdentity(root); assert.equal(source.head, args[1]); assert.equal(source.untracked, '')
  const protocolPath = `${E}/1100-c3-b5-forensic-provenance.json`
  const protocolBytes = readFileSync(regular(root, protocolPath)), protocol = JSON.parse(protocolBytes)
  assert.equal(protocol.protocol, '1100-single-busy-intervention-v1')
  assert.equal(protocol.sourceFiles.length, 1660); assert.ok(protocol.sourceFiles.length <= 2000)
  assert.equal(protocol.sourceFiles.reduce((sum, row) => sum + row.identity.bytes, 0), 112446454)
  assert.ok(protocol.sourceFiles.reduce((sum, row) => sum + row.identity.bytes, 0) <= 256 * 1024 ** 2)
  const sourceNames = execFileSync('git', ['ls-files', '-z', '--', ...SOURCE], { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 ** 2 })
  assert.deepEqual(identity(sourceNames), protocol.sourceList)
  assert.deepEqual(sourceNames.split('\0').filter(Boolean), protocol.sourceFiles.map(row => row.path))
  assert.equal(protocol.intervention.path, 'src/core/hollywoodTick.ts')
  assert.equal(protocol.intervention.original.sha256, '55bccdc4e2a0c62c1769ebcaf9e8d72f40cbf30d86729581ecc7d7a2ae93ddbe')
  const original = readFileSync(regular(root, protocol.intervention.path), 'utf8')
  assert.deepEqual(identity(original), protocol.intervention.original)
  let transformed = original
  for (const edit of protocol.intervention.edits) {
    assert.equal(edit.newText, ''); assert.equal(transformed.split(edit.oldText).length, 2)
    assert.equal(original.slice(edit.originalStart, edit.originalEnd), edit.oldText)
    transformed = transformed.replace(edit.oldText, '')
  }
  assert.deepEqual(identity(transformed), protocol.intervention.transformed)
  assert.deepEqual(identity(protocol.intervention.patchText), protocol.intervention.patch)
  assert.equal(protocol.extraPaths.at(-1), protocolPath, 'self manifest is an explicit separately pinned extra')
  assert.deepEqual(protocol.extras.map(row => row.path), protocol.extraPaths.slice(0, -1))
  const extras = [...protocol.extras, { path: protocolPath, identity: identity(protocolBytes) }]
  assert.equal(new Set([...protocol.sourceFiles.map(row => row.path), ...extras.map(row => row.path)]).size,
    protocol.sourceFiles.length + extras.length, 'explicit source/extra sets disjoint and unique')
  for (const row of [...protocol.sourceFiles, ...extras])
    assert.deepEqual(identity(readFileSync(regular(root, row.path))), row.identity, `frozen input:${row.path}`)
  const dependencies = realpathSync(resolve(root, 'node_modules')); assert.ok(lstatSync(dependencies).isDirectory())

  const snapshot = realpathSync(mkdtempSync(resolve(tmpdir(), 'studio-c3-b5-forensic-')))
  retainedSnapshot = snapshot
  const write = (local, bytes) => {
    const path = contained(snapshot, local)
    mkdirSync(dirname(path), { recursive: true, mode: 0o700 }); writeFileSync(path, bytes, { flag: 'wx', mode: 0o600 })
  }
  let totalBytes = 0
  const sourceFiles = []
  for (const row of protocol.sourceFiles) {
    const sourceBytes = readFileSync(regular(root, row.path)); assert.deepEqual(identity(sourceBytes), row.identity)
    const copied = row.path === protocol.intervention.path ? Buffer.from(transformed) : sourceBytes
    totalBytes += copied.length; assert.ok(totalBytes <= 256 * 1024 ** 2)
    write(row.path, copied); sourceFiles.push({ path: row.path, original: row.identity, copied: identity(copied) })
  }
  for (const row of extras) {
    const bytes = readFileSync(regular(root, row.path)); assert.deepEqual(identity(bytes), row.identity)
    totalBytes += bytes.length; assert.ok(totalBytes <= 256 * 1024 ** 2, 'complete copied data remains bounded')
    write(row.path, bytes)
  }
  write(PATCH, protocol.intervention.patchText)
  symlinkSync(dependencies, resolve(snapshot, 'node_modules'), 'dir')
  const manifest = { protocol: protocol.protocol, createdAt: new Date().toISOString(), snapshotRoot: snapshot,
    hostRoot: root, hostSource: source, sourceList: protocol.sourceList, sourceFiles,
    extraPaths: protocol.extraPaths, extras, dependencies: { realPath: dependencies, sharedUnmodified: true },
    intervention: protocol.intervention, protocolIdentity: identity(protocolBytes),
    rules: { noGitDirectory: true, noCleanup: true, sourceFileCap: 2000, sourceByteCap: 256 * 1024 ** 2,
      maxTicks: 416, variants: 1, seed: 'p13b-s8-bridge-probe-01', tick: 'tick(state), default develop=false',
      noGameplayQualification: true, resultByteCap: 16 * 1024 ** 2, stdoutByteCap: 32 * 1024 } }
  const manifestBytes = JSON.stringify(manifest, null, 2) + '\n'
  assert.ok(Buffer.byteLength(manifestBytes) <= 16 * 1024 ** 2)
  write(MANIFEST, manifestBytes)
  const verified = verifySnapshot(snapshot, identity(manifestBytes).sha256, false)
  const output = JSON.stringify({ ...verified, marker: 'C3_B5_FORENSIC_COPY_PREPARED', preparationMarker: 'PREPARED_ONLY_NO_EXECUTION',
    snapshotRoot: snapshot, manifest: identity(manifestBytes), sourceFiles: sourceFiles.length, extras: extras.length,
    copiedBytes: totalBytes, intervention: protocol.intervention.transformed, noCleanup: true })
  assert.ok(Buffer.byteLength(output) <= 32 * 1024); console.log(output)
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main() }
  catch (error) {
    console.error(JSON.stringify({ marker: 'C3_B5_FORENSIC_COPY_REFUSED', retainedSnapshot, message: String(error).slice(0, 6000), noCleanup: true })); process.exitCode = 1
  }
}
