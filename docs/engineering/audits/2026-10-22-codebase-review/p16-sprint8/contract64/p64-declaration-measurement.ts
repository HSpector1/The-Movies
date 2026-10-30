// S7 all-eight/twice producer adapted to64/external location. Committed consumed source remains mandatory.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { generateCsharpTypeDeclarations } from '/Users/zacheryspector/studio-scratch/p16-retained-writing-20261026-wt/scripts/bridge-contract-csharp.ts'
import { BRIDGE_CONTRACT_UNION_FIXTURES as FIXTURES } from '/Users/zacheryspector/studio-scratch/p16-retained-writing-20261026-wt/tests/fixtures/bridge-contract-union-fixtures.ts'
import { BRIDGE_SCHEMA, PROJECTION_VERSION, PROTOCOL_VERSION } from '/Users/zacheryspector/studio-scratch/p16-retained-writing-20261026-wt/bridge/schema/bridge-schema.ts'
import { schemaIdentity } from '/Users/zacheryspector/studio-scratch/p16-retained-writing-20261026-wt/bridge/schema/canonical.ts'

const EXPECTED_HEAD = process.env.P64_DECLARATION_EXPECTED_HEAD
assert.ok(EXPECTED_HEAD && /^[0-9a-f]{40}$/.test(EXPECTED_HEAD), 'the lane must supply the measured HEAD')
const root = new URL('file:///Users/zacheryspector/studio-scratch/p16-retained-writing-20261026-wt/')
const sha = (value: string | Uint8Array) => createHash('sha256').update(value).digest('hex')
const read = (path: string) => readFileSync(new URL(path, root))
const git = (...args: string[]) => execFileSync('git', ['-c', 'gc.auto=0', '-c', 'maintenance.auto=0', '--no-optional-locks', ...args],
  { cwd: fileURLToPath(root), encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
const sourcePaths = ['src', 'bridge', 'tests', 'generated', 'ui', 'scripts', 'package.json', 'package-lock.json']
const sourceIdentity = () => ({ head: git('rev-parse', 'HEAD').trim(),
  diffSha256: sha(git('diff', '--no-ext-diff', '--binary', 'HEAD', '--', ...sourcePaths)),
  untracked: git('ls-files', '--others', '--exclude-standard', '--', ...sourcePaths).trim() })
const sourceBefore = sourceIdentity()
assert.equal(sourceBefore.head, EXPECTED_HEAD, 'measured HEAD')
assert.equal(sourceBefore.diffSha256, sha(''), 'consumed source must be committed (regenerated files included)')
assert.equal(sourceBefore.untracked, '', 'consumed source must be tracked')
assert.equal(PROTOCOL_VERSION, 4); assert.equal(PROJECTION_VERSION, 64)
const schemaId = schemaIdentity(BRIDGE_SCHEMA)
const manifestBytes = read('generated/unity/project-studio-bridge.contract-manifest.json')
const manifest = JSON.parse(manifestBytes.toString('utf8'))
assert.equal(manifest.protocolVersion, 4); assert.equal(manifest.projectionVersion, 64)
assert.equal(manifest.schemaId, schemaId, 'the committed manifest names the live schema')
const wholeCsharp = read('generated/unity/StudioBridgeDtos.Generated.cs')
assert.equal(manifest.typescriptGeneratedContractSha256, sha(wholeCsharp), 'the committed manifest hashes the committed C#')
const schemaFile = read('bridge/schema/project-studio-bridge.schema.json')
assert.deepEqual(JSON.parse(schemaFile.toString('utf8')), BRIDGE_SCHEMA, 'the committed schema file is the live schema')

// Six fixed literals (930, unchanged since) and the prior F10/F11 pin (F40, projection 58/61 era) as the test pins them
// at ac3ab27c. Only the F10/F11 output identities are measurements here.
const prior = {
  F01_STRING_OR_NULL: '797f92b1f532d61f21dad93ba8fea8da02dd5104c4f744213c9832cb2c1f6bdd',
  F02_OBJECT_OR_NULL: '0fef8c834b895f9cf185af8f421357c642dc71984f1b4618a79eba9c4dd60e1f',
  F03_COMPATIBLE_OBJECTS: '99f44add260a66d0eab17a86d3f743110277292606dff073a90a354bad335c68',
  F04_DISCRIMINATED_OBJECTS: 'd878443418291974137b9affddf066d3b65d8d09286febebcafec35561a2fc5b',
  F09_ARRAY_ITEM_UNION: '7c1f83b70b0e82152821b0c4a5e59bdedcf901f639445b45ec7ef49010e2af1b',
  F10_CURRENT_QUOTE_UNIONS: 'df9a088d4edd52652fc4eab583a83b36c667a50d3fd14d0be4715eadeb2a6f74',
  F11_CURRENT_COMMAND_UNION: 'df9a088d4edd52652fc4eab583a83b36c667a50d3fd14d0be4715eadeb2a6f74',
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
  assert.ok(identities[name].matchesPrior, `${name}: fixed positive changed outside the projection 62 scope`)
assert.equal(identities.F10_CURRENT_QUOTE_UNIONS.sha256, identities.F11_CURRENT_COMMAND_UNION.sha256)
assert.equal(identities.F10_CURRENT_QUOTE_UNIONS.bytes, identities.F11_CURRENT_COMMAND_UNION.bytes)
assert.equal(identities.F10_CURRENT_QUOTE_UNIONS.matchesPrior, false, 'the absorption promise/market quote facts change the whole-current declarations')
assert.deepEqual(sourceIdentity(), sourceBefore, 'source/HEAD drift during the measurement')
console.log(JSON.stringify({ producer: 'p64-declaration-measurement.ts', producerSha256: sha(readFileSync(fileURLToPath(import.meta.url))),
  priorMeasurement: 'Independent committed projection63 measurement at0e0cdfde (df9a088d4edd…)', source: sourceBefore,
  protocolVersion: PROTOCOL_VERSION, projectionVersion: PROJECTION_VERSION, schemaId,
  manifest: { bytes: manifestBytes.length, sha256: sha(manifestBytes) },
  generatedCsharp: { bytes: wholeCsharp.length, sha256: sha(wholeCsharp), isDeclarationBodyHash: false },
  schemaFile: { bytes: schemaFile.length, sha256: sha(schemaFile) },
  identities, positiveFixtures: 8, fixedPositiveFixtures: 6, renders, actualTicks: 0,
  completion: 'ALL_EIGHT_POSITIVES_MEASURED_TWICE_SIX_FIXED_UNCHANGED',
  environment: { node: process.version, platform: process.platform, arch: process.arch } }, null, 2))
