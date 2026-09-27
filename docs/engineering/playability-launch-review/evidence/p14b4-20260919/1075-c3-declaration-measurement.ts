// 1074 proposal, parent-released after e6475aca. Read-only, zero gameplay.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { generateCsharpTypeDeclarations } from '../../../../../scripts/bridge-contract-csharp.ts'
import { BRIDGE_CONTRACT_UNION_FIXTURES as FIXTURES } from '../../../../../tests/fixtures/bridge-contract-union-fixtures.ts'
import { BRIDGE_SCHEMA, PROJECTION_VERSION, PROTOCOL_VERSION } from '../../../../../bridge/schema/bridge-schema.ts'
import { schemaIdentity } from '../../../../../bridge/schema/canonical.ts'

const EXPECTED_HEAD = 'e6475aca1ef3bdfd593d660743ebc311981836cc'
const CURRENT_SCHEMA = 'sha256:d59e144e4077f669804ca87dd6184ef23bd44c9d93e44eb795f2b66350926a4d'
const root = new URL('../../../../../', import.meta.url)
const sha = (value: string | Uint8Array) => createHash('sha256').update(value).digest('hex')
const read = (path: string) => readFileSync(new URL(path, root))
const git = (...args: string[]) => execFileSync('git', args,
  { cwd: fileURLToPath(root), encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
const sourcePaths = ['src', 'bridge', 'tests', 'generated', 'ui', 'scripts', 'package.json', 'package-lock.json',
  'tsconfig.json', 'tsconfig.bridge.json', 'tsconfig.src.json', 'vitest.config.ts', 'vitest.workspace.ts']
const sourceIdentity = () => ({ head: git('rev-parse', 'HEAD').trim(),
  diffSha256: sha(git('diff', '--no-ext-diff', '--binary', 'HEAD', '--', ...sourcePaths)),
  untracked: git('ls-files', '--others', '--exclude-standard', '--', ...sourcePaths).trim() })
const inputPaths = ['scripts/bridge-contract-csharp.ts', 'scripts/generate-bridge-contract.ts',
  'bridge/schema/canonical.ts', 'bridge/schema/dsl.ts', 'bridge/schema/bridge-schema.ts',
  'bridge/schema/industry-schema.ts', 'bridge/schema/intent-schema.ts',
  'tests/fixtures/bridge-contract-union-fixtures.ts', 'tests/bridge-contract-generator.test.ts',
  'generated/unity/StudioBridgeDtos.Generated.cs', 'generated/unity/project-studio-bridge.contract-manifest.json',
  'bridge/schema/project-studio-bridge.schema.json', 'package.json', 'package-lock.json']
const inputHashes = () => Object.fromEntries(inputPaths.map(path => [path, sha(read(path))]))
const sourceBefore = sourceIdentity(), inputsBefore = inputHashes()
const producerSha256 = sha(readFileSync(fileURLToPath(import.meta.url)))
assert.equal(sourceBefore.head, EXPECTED_HEAD)
assert.equal(sourceBefore.untracked, '', 'all consumed source must be recorded')
assert.equal(PROTOCOL_VERSION, 4); assert.equal(PROJECTION_VERSION, 53)
assert.equal(schemaIdentity(BRIDGE_SCHEMA), CURRENT_SCHEMA)
const manifestBytes = read('generated/unity/project-studio-bridge.contract-manifest.json')
assert.equal(sha(manifestBytes), '2fd375c17b183e12c714f0f6a4ee438c4cd4c890084ca33207d0c56582f4321e')
const manifest = JSON.parse(manifestBytes.toString('utf8'))
assert.equal(manifest.protocolVersion, 4); assert.equal(manifest.projectionVersion, 53)
assert.equal(manifest.schemaId, CURRENT_SCHEMA)
const wholeCsharp = read('generated/unity/StudioBridgeDtos.Generated.cs')
assert.equal(wholeCsharp.length, 860452)
assert.equal(sha(wholeCsharp), 'c727219216f5f71cb35e9b6116b7288da0d0343810e9cee447c5216988ce48b7')
assert.equal(manifest.typescriptGeneratedContractSha256, sha(wholeCsharp))
const schemaFile = read('bridge/schema/project-studio-bridge.schema.json')
assert.equal(schemaFile.length, 393733)
assert.equal(sha(schemaFile), '31d58dbbbf09992703dc221d7a3c3d235cb0e9b185e0212599e334d8c7219fde')
assert.deepEqual(JSON.parse(schemaFile.toString('utf8')), BRIDGE_SCHEMA)

// Existing independent literals from930 and the pre-maintenance exact-pin test.
// None is calculated from a render or copied from a failure message.
const prior = {
  F01_STRING_OR_NULL: '797f92b1f532d61f21dad93ba8fea8da02dd5104c4f744213c9832cb2c1f6bdd',
  F02_OBJECT_OR_NULL: '0fef8c834b895f9cf185af8f421357c642dc71984f1b4618a79eba9c4dd60e1f',
  F03_COMPATIBLE_OBJECTS: '99f44add260a66d0eab17a86d3f743110277292606dff073a90a354bad335c68',
  F04_DISCRIMINATED_OBJECTS: 'd878443418291974137b9affddf066d3b65d8d09286febebcafec35561a2fc5b',
  F09_ARRAY_ITEM_UNION: '7c1f83b70b0e82152821b0c4a5e59bdedcf901f639445b45ec7ef49010e2af1b',
  F10_CURRENT_QUOTE_UNIONS: '90a51d9518fb9e8a2d09cb096204a0f98b35ec481c638a8e4ff033c8ea56ad52',
  F11_CURRENT_COMMAND_UNION: '90a51d9518fb9e8a2d09cb096204a0f98b35ec481c638a8e4ff033c8ea56ad52',
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
  assert.ok(identities[name].matchesPrior, `${name}: fixed positive changed outside C.3 scope`)
assert.equal(identities.F10_CURRENT_QUOTE_UNIONS.sha256, identities.F11_CURRENT_COMMAND_UNION.sha256)
assert.equal(identities.F10_CURRENT_QUOTE_UNIONS.bytes, identities.F11_CURRENT_COMMAND_UNION.bytes)
assert.equal(identities.F10_CURRENT_QUOTE_UNIONS.matchesPrior, false, 'new DTOs must change whole-current declarations')
assert.deepEqual(sourceIdentity(), sourceBefore, 'source/HEAD drift')
assert.deepEqual(inputHashes(), inputsBefore, 'measurement-input drift')
assert.equal(sha(readFileSync(fileURLToPath(import.meta.url))), producerSha256, 'producer drift')
const output = JSON.stringify({ producer: '1075-c3-declaration-measurement.ts', producerSha256,
  source: sourceBefore, sourceAndInputsUnchanged: true, inputsSha256: inputsBefore,
  protocolVersion: PROTOCOL_VERSION, projectionVersion: PROJECTION_VERSION, schemaId: CURRENT_SCHEMA,
  generatedCsharp: { bytes: wholeCsharp.length, sha256: sha(wholeCsharp), isDeclarationBodyHash: false },
  identities, positiveFixtures: 8, fixedPositiveFixtures: 6, renders, actualTicks: 0,
  completion: 'ALL_EIGHT_POSITIVES_MEASURED_TWICE_SIX_FIXED_UNCHANGED',
  environment: { node: process.version, platform: process.platform, arch: process.arch } }, null, 2)
assert.ok(Buffer.byteLength(output, 'utf8') <= 1024 * 1024)
console.log(output)
