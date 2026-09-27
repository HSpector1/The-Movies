// Explicit parent-operated maintenance only. Node stdlib; no project imports,
// tests, compiler, gameplay, reset, index writes or automatic next operation.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, lstatSync, readFileSync, realpathSync, writeFileSync } from 'node:fs'
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const E = 'docs/engineering/playability-launch-review/evidence/p14b4-20260919'
const ROOT = realpathSync(fileURLToPath(new URL('../../../../../', import.meta.url)))
const SELF = relative(ROOT, fileURLToPath(import.meta.url)).split(sep).join('/')
const PROTOCOL = 'c3-reviewed-maintenance-1093-1096-1110-v1'
const SOURCE = ['src', 'bridge', 'tests', 'generated', 'ui', 'scripts', 'package.json', 'package-lock.json',
  'tsconfig.json', 'tsconfig.bridge.json', 'tsconfig.src.json', 'vitest.config.ts', 'vitest.workspace.ts']
const MODES = ['preflight', 'apply1093', 'apply1096', 'apply1110', 'verify-final', 'argv']
const STAGES = [
  { id: '1093', directory: `${E}/1093-c3-maintenance-stage`, count: 37, changed: 37,
    manifest: { bytes: 18545, sha256: '68a42bbae2a04d92f8778621e5e37efc7e891cf1ea62f5a738108c22497a57ea' },
    patch: { bytes: 73024, sha256: 'c1ee31f0059ca11b6c94b7bb72469683ee4193782e1f3f78bc9e840cd061f00b' } },
  { id: '1096', directory: `${E}/1096-c3-remaining-stage`, count: 62, changed: 60,
    manifest: { bytes: 142004, sha256: 'b8bb99baaa1a904059850f4778bce112affdfff9e0b6f2c8c54021013116f78a' },
    patch: { bytes: 99034, sha256: '91307a13f624a797c1bfff4909bc73fd74f5928edc5b9fc668a754b5099cb17e' } },
  { id: '1110', directory: `${E}/1110-c3-b5-three-pin-stage`, count: 1, changed: 1,
    manifest: { bytes: 6314, sha256: 'd56d265f76a060be9ae07734b43cf1208e9001d4a5e8fe8f155e6d374ad572a4' },
    patch: { bytes: 1537, sha256: '223f9dd43767b4d592160118b68901a231773339acc283a56c720dd9a690efa8' } },
]
const FORCE_ORDER = [
  ['src/core/forecast.ts', 20511, '13add49ffbcf0811b56de03c3978e0122c0f901226b405a76359b8b8fda6ae04'],
  ['src/core/reception.ts', 36818, 'bd8418a714819a1b9e4401f0cadd843ce0698615610d663b611c833c1bb9713b'],
  ['src/core/tuning.ts', 136827, 'bd6da50cf43ad7ec56ca1891ead4d6850ed2b03ecbdd853a06be5e3fbb70a541'],
  ['src/core/worldgen.ts', 35782, 'ddee41b2181a94c5085aa3255ead4af627f443353cc63a064062d47780520417'],
  ['tests/p14c3-force-order.test.ts', 17550, 'baff4328fec99d7ed5c59072ea01172e733b6a46bb56be30d1952999e11b63c6'],
]
const sha = bytes => createHash('sha256').update(bytes).digest('hex')
const identity = bytes => ({ bytes: bytes.length, sha256: sha(bytes) })
const jsonBytes = value => Buffer.from(JSON.stringify(value, null, 2) + '\n')
const sort = values => [...values].sort()
const nul = bytes => bytes.toString('utf8').split('\0').filter(Boolean)
function safePath(path, mustExist = true) {
  assert.equal(typeof path, 'string')
  assert.ok(!isAbsolute(path) && !path.includes('\\') && !path.includes('\0'), `relative path: ${path}`)
  assert.ok(path.split('/').every(part => part !== '' && part !== '.' && part !== '..'), `normalized path: ${path}`)
  let current = ROOT
  const parts = path.split('/')
  for (let i = 0; i < parts.length; i++) {
    current = resolve(current, parts[i])
    if (!mustExist && i === parts.length - 1 && !existsSync(current)) break
    assert.ok(!lstatSync(current).isSymbolicLink(), `no symlink: ${path}`)
  }
  return current
}
function bytes(path) {
  const absolute = safePath(path)
  assert.ok(lstatSync(absolute).isFile(), `regular file: ${path}`)
  return readFileSync(absolute)
}
function pinned(path, expected) {
  const raw = bytes(path)
  assert.deepEqual(identity(raw), expected, `exact identity: ${path}`)
  return raw
}
function git(args) {
  return execFileSync('git', args, { cwd: ROOT, env: { ...process.env, GIT_OPTIONAL_LOCKS: '0' },
    maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] })
}
function putExclusive(path, raw) {
  const absolute = safePath(path, false)
  assert.ok(!existsSync(absolute), `exclusive output: ${path}`)
  writeFileSync(absolute, raw, { flag: 'wx' })
  return { path, ...identity(raw) }
}
function targetPath(path) {
  assert.ok(path.startsWith('tests/') && /\.(?:ts|tsx)$/.test(path), `test-only target: ${path}`)
  safePath(path)
  return path
}
function patchPaths(raw) {
  const text = raw.toString('utf8')
  assert.ok(!/^(?:new file mode|deleted file mode|old mode|new mode|rename |copy |GIT binary patch|Binary files)/m.test(text),
    'ordinary text modification patches only')
  const old = [...text.matchAll(/^--- a\/(.+)$/gm)].map(match => targetPath(match[1]))
  const next = [...text.matchAll(/^\+\+\+ b\/(.+)$/gm)].map(match => targetPath(match[1]))
  assert.deepEqual(old, next, 'patch old/new path identity')
  assert.equal(new Set(old).size, old.length, 'unique patch sections')
  return sort(old)
}
function loadBundle() {
  const guards = new Map()
  function guard(path, expected) {
    const raw = pinned(path, expected)
    guards.set(path, expected)
    return raw
  }
  const stages = STAGES.map(spec => {
    const manifestPath = `${spec.directory}/manifest.json`
    const patchPath = `${spec.directory}/maintenance.patch`
    const manifest = JSON.parse(guard(manifestPath, spec.manifest))
    const patch = guard(patchPath, spec.patch)
    assert.equal(manifest.files.length, spec.count)
    const files = manifest.files.map(row => {
      const path = targetPath(row.path)
      const baseline = row.baselineIdentity ?? { bytes: row.baselineBytes, sha256: row.baselineSha256 }
      const staged = row.stagedIdentity ?? { bytes: row.stagedBytes, sha256: row.stagedSha256 }
      const baseBytes = guard(`${spec.directory}/baseline/${path}`, baseline)
      const nextBytes = guard(`${spec.directory}/staged/${path}`, staged)
      return { path, baseline, staged, changed: !baseBytes.equals(nextBytes), row }
    })
    assert.equal(new Set(files.map(row => row.path)).size, spec.count)
    const changed = files.filter(row => row.changed).map(row => row.path)
    assert.equal(changed.length, spec.changed)
    assert.deepEqual(patchPaths(patch), sort(changed), `${spec.id} exact patch path set`)
    return { ...spec, manifest, files, patchPath }
  })
  const [a, b, c] = stages
  const first = new Map(a.files.map(row => [row.path, row]))
  const second = new Map(b.files.map(row => [row.path, row]))
  const overlaps = b.files.filter(row => first.has(row.path))
  assert.equal(overlaps.length, 9)
  assert.equal(b.files.filter(row => !first.has(row.path)).length, 53)
  const original = new Map(a.files.map(row => [row.path, row.baseline]))
  for (const row of b.files) {
    const prior = first.get(row.path)
    if (prior) {
      assert.equal(row.row.baseKind, 'FIRST_1093_STAGED_CANDIDATE')
      assert.equal(row.row.baseSource, `${a.directory}/staged/${row.path}`)
      assert.deepEqual(row.baseline, prior.staged)
      assert.equal(row.row.liveSha256, prior.baseline.sha256)
    } else {
      assert.equal(row.row.baseKind, 'UNCHANGED_LIVE_BYTES')
      assert.equal(row.row.baseSource, row.path)
      assert.equal(row.row.liveSha256, row.baseline.sha256)
      original.set(row.path, row.baseline)
    }
  }
  assert.equal(original.size, 90)
  assert.equal(c.files[0].path, 'tests/bridge-p14b5-relationships.test.ts')
  assert.deepEqual(c.files[0].baseline, second.get(c.files[0].path).staged)
  assert.equal(c.files[0].row.baseSource, `${b.directory}/staged/${c.files[0].path}`)
  assert.deepEqual(c.files[0].row.liveIdentity, first.get(c.files[0].path).baseline)
  assert.deepEqual(c.files[0].row.first1093Identity, first.get(c.files[0].path).staged)
  let reconstructed = bytes(`${c.directory}/baseline/${c.files[0].path}`).toString('utf8')
  assert.equal(c.files[0].row.literalChanges.length, 3)
  for (const change of c.files[0].row.literalChanges) {
    assert.equal(change.occurrences, 1)
    assert.equal(reconstructed.split(change.old).length - 1, 1)
    assert.equal(Buffer.byteLength(reconstructed.slice(0, reconstructed.indexOf(change.old))), change.baselineByteOffset)
    assert.equal(change.old.length, change.new.length)
    reconstructed = reconstructed.replace(change.old, change.new)
  }
  assert.ok(Buffer.from(reconstructed).equals(bytes(`${c.directory}/staged/${c.files[0].path}`)), 'exact three-pin substitution only')
  for (const authority of c.manifest.authority) guard(authority.path, authority.identity)
  guard(`${E}/914-c2rm-legacy-selection.json`, { bytes: 30457, sha256: 'aa0a45521227f87ae0251fa0c859504956a46a3bdaa0a5088cbd79e80bfc6bd5' })
  const selection = JSON.parse(guard(`${E}/1084-A-c3-remaining-current-boundary-selection.json`,
    { bytes: 6047, sha256: '5605f05ab20740da83d72dc7e63e22da0ed7d4f51bfca1205b574681e16c135e' }))
  const commands = a.manifest.verificationGroups.map(row => ({ group: row.record, argv: row.command,
    manifest: `${a.directory}/manifest.json`, member: `verificationGroups[record=${row.record}].command` }))
  assert.deepEqual(commands.map(row => row.group), ['1086/1052', '1048', '1049', '1051'])
  commands.push({ group: '1053', argv: b.manifest.verificationCommandForParent,
    manifest: `${b.directory}/manifest.json`, member: 'verificationCommandForParent' })
  commands.push({ group: '1110', argv: c.manifest.verificationCommandForParent,
    manifest: `${c.directory}/manifest.json`, member: 'verificationCommandForParent' })
  assert.deepEqual(b.manifest.verificationCommandForParent, selection.command, 'unchanged 1084/1053 selection')
  for (const row of commands) assert.ok(Array.isArray(row.argv) && row.argv.length > 0 && row.argv.every(arg => typeof arg === 'string'))
  const phases = [original]
  for (const stage of stages) {
    const next = new Map(phases.at(-1))
    for (const row of stage.files) {
      assert.deepEqual(next.get(row.path), row.baseline, `${stage.id} layered preimage: ${row.path}`)
      next.set(row.path, row.staged)
    }
    phases.push(next)
  }
  const changedAt = phase => sort([...phases[phase]].filter(([path, value]) => value.sha256 !== original.get(path).sha256).map(([path]) => path))
  assert.deepEqual(phases.map((_, phase) => changedAt(phase).length), [0, 37, 90, 90])
  for (const [path, length, digest] of FORCE_ORDER) guard(path, { bytes: length, sha256: digest })
  guards.set(SELF, identity(bytes(SELF)))
  return { stages, guards, commands, phases, changedAt, union: sort(original.keys()), overlap: sort(overlaps.map(row => row.path)) }
}
function recheck(bundle) {
  for (const [path, expected] of bundle.guards) pinned(path, expected)
}
function sourceSnapshot() {
  assert.equal(git(['rev-parse', '--show-toplevel']).toString('utf8').trim(), ROOT)
  const names = sort(nul(git(['ls-files', '-z', '--', ...SOURCE])))
  assert.equal(new Set(names).size, names.length)
  const inventory = names.map(path => ({ path, ...identity(bytes(path)) }))
  const untracked = sort(nul(git(['ls-files', '--others', '--exclude-standard', '-z', '--', ...SOURCE])))
  assert.deepEqual(untracked, [], 'no untracked consumed source')
  assert.deepEqual(nul(git(['diff', '--cached', '--name-only', '-z', '--', ...SOURCE])), [], 'no staged consumed delta')
  return { head: git(['rev-parse', 'HEAD']).toString('utf8').trim(),
    index: identity(git(['ls-files', '--stage', '-z'])),
    inventory, inventoryIdentity: identity(jsonBytes(inventory)),
    changedPaths: sort(nul(git(['diff', '--no-ext-diff', '--name-only', '-z', 'HEAD', '--', ...SOURCE]))) }
}
function assertPhase(bundle, snapshot, phase, preflight = null) {
  const actual = new Map(snapshot.inventory.map(({ path, ...value }) => [path, value]))
  for (const [path, expected] of bundle.phases[phase]) assert.deepEqual(actual.get(path), expected, `live phase ${phase}: ${path}`)
  assert.deepEqual(snapshot.changedPaths, bundle.changedAt(phase), `measured consumed diff path set at phase ${phase}`)
  if (preflight) {
    const baseline = preflight.after.inventory
    assert.deepEqual(snapshot.inventory.map(row => row.path), baseline.map(row => row.path), 'unchanged consumed path inventory')
    const targets = new Set(bundle.union)
    assert.deepEqual(snapshot.inventory.filter(row => !targets.has(row.path)), baseline.filter(row => !targets.has(row.path)),
      'all production, fixtures, generators, UI and other tests preserved')
  }
}
function assertStableBoundary(before, after) {
  assert.equal(after.head, before.head, 'actual HEAD unchanged within operation')
  assert.deepEqual(after.index, before.index, 'index unchanged within operation')
}
function options() {
  const args = process.argv.slice(2)
  assert.equal(args.length, 4, 'usage: node <script> --mode <explicit-mode> --output-prefix <E/1115-unique-prefix>')
  assert.equal(args[0], '--mode')
  assert.ok(MODES.includes(args[1]), 'known explicit mode; no default action')
  assert.equal(args[2], '--output-prefix')
  const prefix = args[3]
  assert.equal(dirname(prefix), E)
  assert.match(prefix.slice(E.length + 1), /^1115-[a-zA-Z0-9][a-zA-Z0-9-]*$/)
  return { mode: args[1], prefix }
}
function main() {
  const { mode, prefix } = options()
  const output = suffix => `${prefix}.${mode}.${suffix}`
  for (const suffix of ['started.json', 'json', 'patch']) assert.ok(!existsSync(safePath(output(suffix), false)), `unused output: ${output(suffix)}`)
  const self = identity(bytes(SELF))
  const started = { protocol: PROTOCOL, mode, prefix, startedAt: new Date().toISOString(), producer: { path: SELF, ...self } }
  const startIdentity = putExclusive(output('started.json'), jsonBytes(started))
  const report = { ...started, startRecord: startIdentity, status: 'FAIL', commandsExecuted: [] }
  try {
    const bundle = loadBundle()
    report.guardedArtifacts = [...bundle.guards].map(([path, value]) => ({ path, ...value }))
    report.unionPaths = bundle.union
    report.overlapPaths = bundle.overlap
    report.before = sourceSnapshot()
    let phase = 0
    let preflight = null
    if (mode !== 'preflight' && mode !== 'argv') {
      const required = ['preflight', 'apply1093', 'apply1096', 'apply1110']
      const preceding = mode === 'verify-final' ? 4 : required.indexOf(mode)
      assert.ok(preceding > 0)
      report.priorAudits = []
      for (const priorMode of required.slice(0, preceding)) {
        const path = `${prefix}.${priorMode}.json`
        const raw = bytes(path)
        const prior = JSON.parse(raw)
        assert.equal(prior.protocol, PROTOCOL)
        assert.equal(prior.mode, priorMode)
        assert.equal(prior.prefix, prefix)
        assert.equal(prior.status, 'PASS')
        assert.deepEqual(prior.producer, { path: SELF, ...self })
        pinned(prior.startRecord.path, { bytes: prior.startRecord.bytes, sha256: prior.startRecord.sha256 })
        if (prior.patch) pinned(prior.patch.path, { bytes: prior.patch.bytes, sha256: prior.patch.sha256 })
        for (const linked of prior.priorAudits ?? []) pinned(linked.path, { bytes: linked.bytes, sha256: linked.sha256 })
        report.priorAudits.push({ path, ...identity(raw) })
        if (priorMode === 'preflight') preflight = prior
      }
      phase = mode === 'verify-final' ? 3 : preceding - 1
      assertPhase(bundle, report.before, phase, preflight)
    } else if (mode === 'preflight') {
      assertPhase(bundle, report.before, 0)
    }
    if (mode.startsWith('apply')) {
      const stage = bundle.stages[phase]
      assert.equal(mode, `apply${stage.id}`)
      const check = ['apply', '--check', stage.patchPath]
      report.commandsExecuted.push({ argv: ['git', ...check], startedAt: new Date().toISOString() })
      git(check)
      const ready = sourceSnapshot()
      assertStableBoundary(report.before, ready)
      assert.deepEqual(ready.inventory, report.before.inventory, 'check did not change source')
      assertPhase(bundle, ready, phase, preflight)
      recheck(bundle)
      const apply = ['apply', stage.patchPath]
      report.commandsExecuted.push({ argv: ['git', ...apply], startedAt: new Date().toISOString() })
      git(apply)
      phase++
    }
    report.after = sourceSnapshot()
    assertStableBoundary(report.before, report.after)
    if (mode === 'argv') {
      assert.deepEqual(report.after.inventory, report.before.inventory, 'argv extraction is read-only')
      assert.deepEqual(report.after.changedPaths, report.before.changedPaths)
      report.groups = bundle.commands
      report.execution = 'ARGV_ONLY_NOT_EXECUTED'
    } else {
      assertPhase(bundle, report.after, phase, preflight)
      if (mode === 'preflight') assert.deepEqual(report.after.inventory, report.before.inventory)
      report.phaseAfter = phase
    }
    recheck(bundle)
    if (report.priorAudits) for (const prior of report.priorAudits) pinned(prior.path, { bytes: prior.bytes, sha256: prior.sha256 })
    report.patch = putExclusive(output('patch'), git(['diff', '--no-ext-diff', '--binary', '--no-renames', 'HEAD', '--', ...SOURCE]))
    const finalBoundary = sourceSnapshot()
    assert.deepEqual(finalBoundary, report.after, 'unchanged source, actual HEAD and index through audit capture')
    recheck(bundle)
    report.status = 'PASS'
  } catch (error) {
    report.error = { name: error?.name ?? 'Error', message: error?.message ?? String(error) }
    try { report.failureBoundary = sourceSnapshot() } catch (boundaryError) {
      report.failureBoundaryError = boundaryError?.message ?? String(boundaryError)
    }
    // Never roll back or continue a partially applied operation. Preserve its
    // actual delta and require attribution under a new output prefix.
    if (!existsSync(safePath(output('patch'), false))) {
      try { report.patch = putExclusive(output('patch'), git(['diff', '--no-ext-diff', '--binary', '--no-renames', 'HEAD', '--', ...SOURCE])) }
      catch (patchError) { report.patchError = patchError?.message ?? String(patchError) }
    }
    process.exitCode = 1
  }
  report.closedAt = new Date().toISOString()
  const audit = putExclusive(output('json'), jsonBytes(report))
  console.log(JSON.stringify({ marker: 'C3_REVIEWED_MAINTENANCE', mode, status: report.status, audit,
    phaseAfter: report.phaseAfter ?? null, commandsExecuted: report.commandsExecuted.map(row => row.argv),
    ...(mode === 'argv' && report.status === 'PASS' ? { groups: report.groups } : {}) }))
}

main()
