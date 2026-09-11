#!/usr/bin/env node
// Preparation only: invoke explicitly after Root's causal critique/review.
// Never builds, launches, stops, pushes, creates a profile, or reads user campaigns.
import { readFileSync, writeFileSync, readdirSync, lstatSync, realpathSync, mkdirSync, chmodSync, copyFileSync, constants } from 'node:fs'
import { resolve, join, relative, isAbsolute, dirname, basename, sep } from 'node:path'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'

const required = ['--manifest', '--verification', '--review-library', '--review-manifest', '--output']
const values = new Map()
for (let i = 2; i < process.argv.length; i += 2) {
  const key = process.argv[i], value = process.argv[i + 1]
  if (!required.includes(key) || values.has(key) || !value || value.startsWith('--')) throw Error('Required explicit options: ' + required.join(' <absolute-path> ') + ' <absent-output-directory>')
  values.set(key, value)
}
for (const key of required) if (!values.has(key)) throw Error('Missing ' + key)
const fail = message => { throw Error(message) }
const shaBytes = bytes => createHash('sha256').update(bytes).digest('hex')
const regular = path => {
  if (!isAbsolute(path) || /[\r\n\0]/.test(path) || path.split(sep).some(part => part.toLowerCase() === 'privateprofile')) fail('Only explicit immutable non-profile paths are permitted')
  const exact = resolve(path), actual = realpathSync(exact), stat = lstatSync(exact)
  if (actual !== exact || stat.isSymbolicLink() || !stat.isFile()) fail('Expected exact regular immutable file: ' + exact)
  return { path: exact, bytes: readFileSync(exact), stat }
}
const json = path => { const file = regular(path); return { ...file, value: JSON.parse(file.bytes.toString('utf8')) } }
const ownedDirectory = path => {
  if (!isAbsolute(path) || /[\r\n\0]/.test(path) || path.split(sep).some(part => part.toLowerCase() === 'privateprofile')) fail('Unsafe directory path')
  const exact = resolve(path), stat = lstatSync(exact)
  if (realpathSync(exact) !== exact || !stat.isDirectory() || stat.isSymbolicLink() || stat.uid !== process.getuid()) fail('Expected owned real directory: ' + path)
  return exact
}
const digestMatches = (file, expected, label) => { if (!/^[a-f0-9]{64}$/.test(expected) || shaBytes(file.bytes) !== expected) fail(label + ' digest mismatch') }
const git = (root, ...args) => execFileSync('git', ['-C', root, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()
const manifest = json(values.get('--manifest')), verification = json(values.get('--verification'))
const m = manifest.value, v = verification.value
if (m.schema !== 'p04a1-build-manifest/1' || m.typescript?.dirty !== false || m.unity?.dirty !== false) fail('Explicit build manifest must bind a clean source pair')
if (v.result !== 'PASS' || v.verificationMode !== 'seal' || v.typescriptCommit !== m.typescript.sha || v.unityCommit !== m.unity.sha || !Number.isSafeInteger(v.protocolVersion) || !Number.isSafeInteger(v.projectionVersion) || !/^sha256:[a-f0-9]{64}$/.test(v.schemaId) || !/^[a-f0-9]{64}$/.test(v.generatedContractSha256) || !/^[a-f0-9]{40}$/.test(v.typescriptGeneratedContractGitBlob) || v.typescriptGeneratedContractGitBlob !== v.unityGeneratedContractGitBlob) fail('Paired verification does not certify this exact source/contract pair')
const ts = ownedDirectory(m.typescript.repo), unity = ownedDirectory(m.unity.repo)
for (const [root, binding] of [[ts, m.typescript], [unity, m.unity]]) {
  if (!/^[a-f0-9]{40}$/.test(binding.sha) || git(root, 'rev-parse', 'HEAD') !== binding.sha || git(root, 'branch', '--show-current') !== binding.branch || git(root, 'status', '--porcelain') !== '') fail('Source identity or clean status changed: ' + root)
}
const output = resolve(values.get('--output'))
if (!isAbsolute(values.get('--output')) || /[\r\n\0]/.test(output) || output.split(sep).some(part => part.toLowerCase() === 'privateprofile')) fail('Output must be an explicit new non-profile directory')
ownedDirectory(dirname(output))
for (const root of [ts, unity]) { const r = relative(root, output); if (r === '' || (!r.startsWith('..' + sep) && !isAbsolute(r))) fail('Package output must be outside source worktrees') }
try { lstatSync(output); fail('Output already exists; never overwrite or adopt a package/profile') } catch (error) { if (error.code !== 'ENOENT') throw error }
const appName = 'Project Studio Visual Spike.app', executableRel = appName + '/Contents/MacOS/Project Studio - Unity Visual Spike'
const app = ownedDirectory(m.player.app), expectedApp = join(unity, 'Builds/macOS', appName)
if (app !== expectedApp || resolve(m.player.executable) !== join(app, 'Contents/MacOS/Project Studio - Unity Visual Spike')) fail('Manifest must bind the exact standard isolated Unity build')
const appExecutable = regular(m.player.executable)
if (!(appExecutable.stat.mode & 0o111)) fail('Player executable is not executable')
digestMatches(appExecutable, m.player.executableSha256, 'Player')
digestMatches(regular(join(app, 'Contents/Resources/Data/Managed/Assembly-CSharp.dll')), m.player.assemblyCSharpSha256, 'Player assembly')
const runtime = ownedDirectory(join(ts, 'dist/studio'))
digestMatches(regular(join(runtime, 'engine.mjs')), m.typescript.engineBundleSha256, 'Engine')
digestMatches(regular(join(runtime, 'runtime-worker.mjs')), m.typescript.runtimeWorkerSha256, 'Worker')
digestMatches(regular(join(runtime, 'runtime-worker-source.json')), m.typescript.runtimeWorkerSourceManifestSha256, 'Worker source manifest')
const contract = json(join(ts, 'generated/unity/project-studio-bridge.contract-manifest.json')).value
if (contract.protocolVersion !== v.protocolVersion || contract.projectionVersion !== v.projectionVersion || contract.schemaId !== v.schemaId) fail('Current generated contract differs from paired verification')
const library = regular(values.get('--review-library')), provenance = json(values.get('--review-manifest')), p = provenance.value
const generatedRoot = join(ts, 'artifacts/p13a') + sep
if (!library.path.startsWith(generatedRoot) || !provenance.path.startsWith(generatedRoot) || p.kind !== 'p13a-generated-evidence/v1' || p.source !== 'live engine generated fixture; no user campaign input' || p.scenario !== 'review-library' || p.checkpoint !== library.path || p.bytes !== library.bytes.length || p.bytes > 256 * 1024 * 1024 || p.sha256 !== shaBytes(library.bytes) || p.schemaId !== v.schemaId || p.saveVersion !== 20 || !Array.isArray(p.sources) || p.sources.length !== 7) fail('Review-library provenance does not bind exact generated immutable bytes')
for (const source of p.sources) {
  if (typeof source.path !== 'string' || !source.path.startsWith(generatedRoot)) fail('Review source is outside generated P13 evidence')
  const original = regular(source.path)
  digestMatches(original, source.sha256, 'Original generated review source')
  if (original.bytes.length !== source.bytes) fail('Original generated review source size differs')
}
// Build a complete immutable inventory before making the destination. No source
// symlink is followed and no PrivateProfile directory is read or copied.
const payload = new Map()
const add = (name, bytes, mode, source = null) => {
  if (isAbsolute(name) || name !== relative(output, resolve(output, name)) || name.startsWith('..') || name.split('/').some(part => part.toLowerCase() === 'privateprofile') || /[\r\n\0]/.test(name) || payload.has(name)) fail('Unsafe or duplicate package entry: ' + name)
  payload.set(name, { bytes, mode: mode & 0o777, source, sha256: shaBytes(bytes) })
}
const copyTreePlan = (directory, prefix) => {
  ownedDirectory(directory)
  for (const entry of readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    if (entry.name.toLowerCase() === 'privateprofile') fail('Mutable profile cannot be traversed as payload')
    const path = join(directory, entry.name), target = prefix + '/' + entry.name
    if (entry.isDirectory()) copyTreePlan(path, target)
    else { if (!entry.isFile()) fail('Non-regular package source: ' + path); const f = regular(path); add(target, f.bytes, f.stat.mode, f.path) }
  }
}
copyTreePlan(app, appName)
copyTreePlan(runtime, 'runtime')
for (const name of ['studio.mjs', 'engine.mjs', 'runtime-worker.mjs', 'runtime-worker-source.json']) if (!payload.has('runtime/' + name)) fail('Missing emitted runtime payload: ' + name)
// This is the accepted immutable PLAY launcher verbatim except its P13A label.
const launcher = '#!/bin/zsh\nset -eu\npackage_root="${0:A:h}"\ncd "$package_root"\nshasum -a 256 -c PACKAGE-SHA256.txt >/dev/null || { print -u2 -- \'The P13A package differs from its recorded bytes.\'; exit 1; }\nif [[ -x /opt/homebrew/bin/node ]]; then\n  node_executable=/opt/homebrew/bin/node\nelse\n  node_executable="$(command -v node 2>/dev/null || true)"\nfi\n[[ -n "$node_executable" ]] || { print -u2 -- \'Node.js is required to run this local game.\'; exit 1; }\nexec "$node_executable" "$package_root/runtime/studio.mjs" --unity-app "$package_root/Project Studio Visual Spike.app" --profile-root "$package_root/PrivateProfile" "$@"\n'
add('PLAY_PROJECT_STUDIO.command', Buffer.from(launcher), 0o755)
add('build-manifest.json', manifest.bytes, 0o600, manifest.path)
add('paired-contract-verification.json', verification.bytes, 0o600, verification.path)
add('ReviewSetup/generated-review-library.json', library.bytes, 0o600, library.path)
add('ReviewSetup/source-manifest.json', provenance.bytes, 0o600, provenance.path)
const copiedProvenance = { ...p, checkpoint: join(output, 'ReviewSetup/generated-review-library.json'), packaging: { kind: 'exact immutable byte copy', originalCheckpoint: library.path, originalManifest: provenance.path, originalManifestSha256: shaBytes(provenance.bytes) } }
add('ReviewSetup/manifest.json', Buffer.from(JSON.stringify(copiedProvenance, null, 2) + '\n'), 0o600)
const packaging = { kind: 'p13a-candidate-package/v1', createdAt: new Date().toISOString(), status: 'assembled; not launched or accepted', typescriptCommit: m.typescript.sha, unityCommit: m.unity.sha, buildManifestSha256: shaBytes(manifest.bytes), pairedVerificationSha256: shaBytes(verification.bytes), reviewLibrarySha256: p.sha256, immutableReviewManifest: 'ReviewSetup/manifest.json', privateProfile: 'absent; first synthetic admission remains owned by the existing guarded p13a-native-preview tool', launcherBasis: 'accepted P12A PLAY_PROJECT_STUDIO.command; only package error label changed', payload: [...payload].map(([path, f]) => ({ path, bytes: f.bytes.length, sha256: f.sha256, source: f.source })) }
add('package-assembly.json', Buffer.from(JSON.stringify(packaging, null, 2) + '\n'), 0o600)
// All refusals above precede output creation. A later I/O failure leaves a visibly
// incomplete new directory; no cleanup can remove or replace an existing path.
mkdirSync(output, { mode: 0o700 })
for (const [name, file] of payload) {
  const destination = join(output, name)
  mkdirSync(dirname(destination), { recursive: true, mode: 0o700 })
  writeFileSync(destination, file.bytes, { flag: 'wx', mode: file.mode })
  chmodSync(destination, file.mode)
  digestMatches(regular(destination), file.sha256, 'Copied ' + name)
}
const checksum = [...payload].sort(([a], [b]) => a.localeCompare(b)).map(([name, f]) => f.sha256 + '  ' + name).join('\n') + '\n'
writeFileSync(join(output, 'PACKAGE-SHA256.txt'), checksum, { flag: 'wx', mode: 0o600 })
console.log(JSON.stringify({ completed: true, launched: false, privateProfileCreated: false, output, immutableFiles: payload.size, checksumSha256: shaBytes(checksum), sourcePair: { typescript: m.typescript.sha, unity: m.unity.sha }, reviewLibrarySha256: p.sha256 }))
