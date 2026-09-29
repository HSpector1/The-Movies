// 1328: independently measure projection56 declarations (1327-A, cluster C12); no gameplay or source writes.
// Producer 1193 and its recorded output 1196 remain historical authority, never edited or rerun here.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import { generateCsharpTypeDeclarations } from '../../../../../scripts/bridge-contract-csharp.ts'
import { BRIDGE_CONTRACT_UNION_FIXTURES as FIXTURES } from '../../../../../tests/fixtures/bridge-contract-union-fixtures.ts'
import { BRIDGE_SCHEMA, PROJECTION_VERSION, PROTOCOL_VERSION } from '../../../../../bridge/schema/bridge-schema.ts'
import { schemaIdentity } from '../../../../../bridge/schema/canonical.ts'

const EXPECTED_HEAD = process.env.P56_DECLARATION_EXPECTED_HEAD
assert.ok(EXPECTED_HEAD && /^[0-9a-f]{40}$/.test(EXPECTED_HEAD), 'parent must supply the actual published HEAD')
const EXPECTED_MANIFEST = process.env.P56_DECLARATION_SOURCE_MANIFEST_SHA256
assert.ok(EXPECTED_MANIFEST && /^[0-9a-f]{64}$/.test(EXPECTED_MANIFEST), 'parent must pin the reviewed source manifest')
// Read from the checked-in generated/unity/project-studio-bridge.contract-manifest.json at 57b7bee9, not computed here.
const CURRENT_SCHEMA = 'sha256:349b2d3ec0614f2c9a6c481888e826651c230c6bcc9c84b2b13a82b566bfcec1'
const root = new URL('../../../../../', import.meta.url)
const sha = (value: string | Uint8Array) => createHash('sha256').update(value).digest('hex')
const read = (path: string) => readFileSync(new URL(path, root))
const git = (...args: string[]) => execFileSync('git', args,
  { cwd: fileURLToPath(root), encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
const sourcePaths = ['src', 'bridge', 'tests', 'generated', 'ui', 'scripts', 'package.json', 'package-lock.json',
  'tsconfig.json', 'tsconfig.bridge.json', 'tsconfig.src.json', 'vitest.config.ts', 'vitest.workspace.ts']
const indexBytes = () => readFileSync(resolve(fileURLToPath(root), git('rev-parse', '--git-path', 'index').trim()))
const sourceIdentity = () => ({ head: git('rev-parse', 'HEAD').trim(), indexSha256: sha(indexBytes()),
  diffSha256: sha(git('diff', '--no-ext-diff', '--binary', 'HEAD', '--', ...sourcePaths)),
  untracked: git('ls-files', '--others', '--exclude-standard', '--', ...sourcePaths).trim() })
const inputPaths = ['scripts/bridge-contract-csharp.ts', 'scripts/generate-bridge-contract.ts',
  'bridge/schema/canonical.ts', 'bridge/schema/dsl.ts', 'bridge/schema/bridge-schema.ts',
  'bridge/schema/industry-schema.ts', 'bridge/schema/intent-schema.ts',
  'tests/fixtures/bridge-contract-union-fixtures.ts', 'tests/bridge-contract-generator.test.ts',
  'generated/unity/StudioBridgeDtos.Generated.cs', 'generated/unity/project-studio-bridge.contract-manifest.json',
  'bridge/schema/project-studio-bridge.schema.json', 'package.json', 'package-lock.json',
  'docs/engineering/playability-launch-review/evidence/p14b4-20260919/1193-p3-declaration-measurement.ts',
  'docs/engineering/playability-launch-review/evidence/p14b4-20260919/1196-p3-declaration-measurement.txt',
  'docs/engineering/playability-launch-review/evidence/p14b4-20260919/1196-p3-declaration-measurement.json']
const inputHashes = () => Object.fromEntries(inputPaths.map(path => [path, sha(read(path))]))
type FilePin = { path: string; bytes: number; sha256: string }
const sourceManifestPath = new URL('./1328-p56-declaration-source-manifest.json', import.meta.url)
const sourceManifestBytes = readFileSync(sourceManifestPath)
assert.equal(sha(sourceManifestBytes), EXPECTED_MANIFEST, 'reviewed source-manifest identity')
const sourceManifest = JSON.parse(sourceManifestBytes.toString('utf8')) as {
  manifestVersion: number; inputs: FilePin[]; producer: FilePin; compilerConfig: FilePin
}
assert.equal(sourceManifest.manifestVersion, 1)
assert.deepEqual(sourceManifest.inputs.map(row => row.path), inputPaths, 'exact fixed measurement input list')
function assertPin(pin: FilePin): void {
  const bytes = read(pin.path)
  assert.equal(bytes.length, pin.bytes, `${pin.path}: byte size`)
  assert.equal(sha(bytes), pin.sha256, `${pin.path}: input identity`)
}
function assertAllPins(): void {
  for (const pin of [...sourceManifest.inputs, sourceManifest.producer, sourceManifest.compilerConfig]) assertPin(pin)
  assert.equal(sha(readFileSync(sourceManifestPath)), EXPECTED_MANIFEST, 'source-manifest drift')
}
assertAllPins()
const sourceBefore = sourceIdentity(), inputsBefore = inputHashes()
const producerSha256 = sha(readFileSync(fileURLToPath(import.meta.url)))
assert.equal(sourceBefore.head, EXPECTED_HEAD)
assert.equal(sourceBefore.untracked, '', 'all consumed source must be recorded')
assert.equal(sourceBefore.diffSha256, sha(''), 'published consumed source must be clean')
assert.equal(PROTOCOL_VERSION, 4); assert.equal(PROJECTION_VERSION, 56)
assert.equal(schemaIdentity(BRIDGE_SCHEMA), CURRENT_SCHEMA)
const manifestBytes = read('generated/unity/project-studio-bridge.contract-manifest.json')
assert.equal(sha(manifestBytes), '5839cedba12ba78f61f3f7c96019c98846c16a3ad0b45cc0f2940a76f611083e')
const manifest = JSON.parse(manifestBytes.toString('utf8'))
assert.equal(manifest.protocolVersion, 4); assert.equal(manifest.projectionVersion, 56)
assert.equal(manifest.schemaId, CURRENT_SCHEMA)
const wholeCsharp = read('generated/unity/StudioBridgeDtos.Generated.cs')
assert.equal(wholeCsharp.length, 887448)
assert.equal(sha(wholeCsharp), '8414a793393e3e4cbbc08c5cc157da55d164930c9bee538c7a3e6ca621913fe6')
assert.equal(manifest.typescriptGeneratedContractSha256, sha(wholeCsharp))
const schemaFile = read('bridge/schema/project-studio-bridge.schema.json')
assert.equal(schemaFile.length, 402347)
assert.equal(sha(schemaFile), '8b9ba6571a13a8c823c2a20b967340c34b638b8d7ac05ae599b4b5a6b330240a')
assert.deepEqual(JSON.parse(schemaFile.toString('utf8')), BRIDGE_SCHEMA)

// Six fixed independent literals from930; current-body prior pins from recorded1196 (projection54).
// Only the old F10/F11 baseline is pinned: their new output identities are measurements.
// None is calculated from a render or copied from a failure message.
const prior = {
  F01_STRING_OR_NULL: '797f92b1f532d61f21dad93ba8fea8da02dd5104c4f744213c9832cb2c1f6bdd',
  F02_OBJECT_OR_NULL: '0fef8c834b895f9cf185af8f421357c642dc71984f1b4618a79eba9c4dd60e1f',
  F03_COMPATIBLE_OBJECTS: '99f44add260a66d0eab17a86d3f743110277292606dff073a90a354bad335c68',
  F04_DISCRIMINATED_OBJECTS: 'd878443418291974137b9affddf066d3b65d8d09286febebcafec35561a2fc5b',
  F09_ARRAY_ITEM_UNION: '7c1f83b70b0e82152821b0c4a5e59bdedcf901f639445b45ec7ef49010e2af1b',
  F10_CURRENT_QUOTE_UNIONS: 'a9708ee36cb26c7a5fd48662c0bf705c364a42feeb796ade78a36432add3c092',
  F11_CURRENT_COMMAND_UNION: 'a9708ee36cb26c7a5fd48662c0bf705c364a42feeb796ade78a36432add3c092',
  F12_P05_PRODUCTION_SENTINEL: '78d68a2d7670585946f79ebbfc449c85c8ad98ac381b422a8a9abea66702bde6',
} as const
type Name = keyof typeof prior
const current = new Set<Name>(['F10_CURRENT_QUOTE_UNIONS', 'F11_CURRENT_COMMAND_UNION'])
const identities = {} as Record<Name, { sha256: string; bytes: number; deterministic: true; priorSha256: string; matchesPrior: boolean }>
let renders = 0
for (const name of Object.keys(prior) as Name[]) {
  const first = generateCsharpTypeDeclarations(FIXTURES[name].schema); renders++
  const second = generateCsharpTypeDeclarations(FIXTURES[name].schema); renders++
  assert.equal(first, second, `${name}: double render must be identical`)
  identities[name] = { sha256: sha(first), bytes: Buffer.byteLength(first, 'utf8'), deterministic: true,
    priorSha256: prior[name], matchesPrior: sha(first) === prior[name] }
}
assert.equal(renders, 16)
for (const name of Object.keys(prior) as Name[]) if (!current.has(name))
  assert.ok(identities[name].matchesPrior, `${name}: fixed positive changed outside projection55/56 scope`)
assert.equal(identities.F10_CURRENT_QUOTE_UNIONS.sha256, identities.F11_CURRENT_COMMAND_UNION.sha256)
assert.equal(identities.F10_CURRENT_QUOTE_UNIONS.bytes, identities.F11_CURRENT_COMMAND_UNION.bytes)
assert.equal(identities.F10_CURRENT_QUOTE_UNIONS.matchesPrior, false, 'projection55/56 DTOs must change whole-current declarations')
assert.deepEqual(sourceIdentity(), sourceBefore, 'source/HEAD drift')
assert.deepEqual(inputHashes(), inputsBefore, 'measurement-input drift')
assert.equal(sha(readFileSync(fileURLToPath(import.meta.url))), producerSha256, 'producer drift')
assertAllPins()
const output = JSON.stringify({ producer: '1328-p56-declaration-measurement.ts', producerSha256,
  sourceManifestSha256: EXPECTED_MANIFEST, priorMeasurement: '1196-p3-declaration-measurement',
  source: sourceBefore, sourceAndInputsUnchanged: true, inputsSha256: inputsBefore,
  protocolVersion: PROTOCOL_VERSION, projectionVersion: PROJECTION_VERSION, schemaId: CURRENT_SCHEMA,
  generatedCsharp: { bytes: wholeCsharp.length, sha256: sha(wholeCsharp), isDeclarationBodyHash: false },
  identities, positiveFixtures: 8, fixedPositiveFixtures: 6, renders, actualTicks: 0,
  completion: 'ALL_EIGHT_POSITIVES_MEASURED_TWICE_SIX_FIXED_UNCHANGED',
  environment: { node: process.version, platform: process.platform, arch: process.arch } }, null, 2)
assert.ok(Buffer.byteLength(output, 'utf8') <= 1024 * 1024)
console.log(output)
