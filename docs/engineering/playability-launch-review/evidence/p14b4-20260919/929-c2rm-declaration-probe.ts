// 929: independent, read-only declaration-body measurement. Parent owns execution.
// Run only after 927 closes, from the repository root:
// node_modules/.bin/vite-node docs/engineering/playability-launch-review/evidence/p14b4-20260919/929-c2rm-declaration-probe.ts
// Prior identities are copied from the existing exact-pin test, never from failure output.
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { generateCsharpTypeDeclarations } from '../../../../../scripts/bridge-contract-csharp.ts'
import { BRIDGE_CONTRACT_UNION_FIXTURES as FIXTURES } from '../../../../../tests/fixtures/bridge-contract-union-fixtures.ts'
import { PROJECTION_VERSION } from '../../../../../bridge/schema/bridge-schema.ts'

const EXPECTED_SOURCE_HEAD = '12485a3c491f52c817cf50e86ca86f6786fa396b'
const root = new URL('../../../../../', import.meta.url)
const sha = (bytes: string | Uint8Array): string => createHash('sha256').update(bytes).digest('hex')
const head = (): string => execFileSync('git', ['rev-parse', 'HEAD'], {
  cwd: fileURLToPath(root), encoding: 'utf8',
}).trim()
const sourceHead = head()
if (sourceHead !== EXPECTED_SOURCE_HEAD) throw new Error(`Unexpected source HEAD: ${sourceHead}`)
if (PROJECTION_VERSION !== 52) throw new Error(`Unexpected projection: ${PROJECTION_VERSION}`)

const sourcePaths = [
  'scripts/bridge-contract-csharp.ts',
  'bridge/schema/canonical.ts',
  'bridge/schema/dsl.ts',
  'bridge/schema/bridge-schema.ts',
  'bridge/schema/industry-schema.ts',
  'bridge/schema/intent-schema.ts',
  'tests/fixtures/bridge-contract-union-fixtures.ts',
  'tests/bridge-contract-generator.test.ts',
] as const
const sourceHashes = (): Record<string, string> => Object.fromEntries(
  sourcePaths.map(path => [path, sha(readFileSync(new URL(path, root)))]),
)
const sourceSha256 = sourceHashes()
const producerSha256 = sha(readFileSync(fileURLToPath(import.meta.url)))
const prior = {
  F01_STRING_OR_NULL: '797f92b1f532d61f21dad93ba8fea8da02dd5104c4f744213c9832cb2c1f6bdd',
  F02_OBJECT_OR_NULL: '0fef8c834b895f9cf185af8f421357c642dc71984f1b4618a79eba9c4dd60e1f',
  F03_COMPATIBLE_OBJECTS: '99f44add260a66d0eab17a86d3f743110277292606dff073a90a354bad335c68',
  F04_DISCRIMINATED_OBJECTS: 'd878443418291974137b9affddf066d3b65d8d09286febebcafec35561a2fc5b',
  F09_ARRAY_ITEM_UNION: '7c1f83b70b0e82152821b0c4a5e59bdedcf901f639445b45ec7ef49010e2af1b',
  F10_CURRENT_QUOTE_UNIONS: '2f2fefaac16b113695e169f8c9cd4aba3ad453f3e78f20e3fdbaa602bbb2eb0e',
  F11_CURRENT_COMMAND_UNION: '2f2fefaac16b113695e169f8c9cd4aba3ad453f3e78f20e3fdbaa602bbb2eb0e',
  F12_P05_PRODUCTION_SENTINEL: '78d68a2d7670585946f79ebbfc449c85c8ad98ac381b422a8a9abea66702bde6',
} as const
type PositiveName = keyof typeof prior
const current = new Set<PositiveName>(['F10_CURRENT_QUOTE_UNIONS', 'F11_CURRENT_COMMAND_UNION'])
const identities = {} as Record<PositiveName, {
  sha256: string; bytes: number; deterministic: true; priorSha256: string; matchesPrior: boolean
}>

for (const name of Object.keys(prior) as PositiveName[]) {
  const schema = FIXTURES[name].schema
  const first = generateCsharpTypeDeclarations(schema)
  const second = generateCsharpTypeDeclarations(schema)
  if (first !== second) throw new Error(`${name}: nondeterministic declaration body`)
  const measured = sha(first)
  identities[name] = {
    sha256: measured, bytes: Buffer.byteLength(first, 'utf8'), deterministic: true,
    priorSha256: prior[name], matchesPrior: measured === prior[name],
  }
}

if (head() !== sourceHead || JSON.stringify(sourceHashes()) !== JSON.stringify(sourceSha256)
  || sha(readFileSync(fileURLToPath(import.meta.url))) !== producerSha256) {
  throw new Error('HEAD, measured source inputs or producer changed during measurement')
}
console.log(JSON.stringify({
  probe: '929-c2rm-declaration-probe.ts', sourceHead, producerSha256, sourceSha256,
  projectionVersion: PROJECTION_VERSION,
  environment: { node: process.version, platform: process.platform, arch: process.arch },
  identities,
}, null, 2))

for (const name of Object.keys(prior) as PositiveName[]) {
  if (!current.has(name) && !identities[name].matchesPrior) {
    throw new Error(`${name}: fixed positive fixture changed outside the C.2-RM schema scope`)
  }
}
if (identities.F10_CURRENT_QUOTE_UNIONS.sha256 !== identities.F11_CURRENT_COMMAND_UNION.sha256
  || identities.F10_CURRENT_QUOTE_UNIONS.bytes !== identities.F11_CURRENT_COMMAND_UNION.bytes) {
  throw new Error('F10 and F11 no longer render identical whole-current-schema declarations')
}
if (identities.F10_CURRENT_QUOTE_UNIONS.matchesPrior) {
  throw new Error('Whole-current-schema declarations did not reflect the required new DTOs')
}
