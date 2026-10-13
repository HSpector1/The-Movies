// Independent declaration BODY measurement, following preserved1358/1328 producers.
// No Vitest imports, gameplay ticks, expected-new-hash from a failure, or file writes.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { generateCsharpTypeDeclarations } from '/Users/zacheryspector/studio-specialists/p15b/scripts/bridge-contract-csharp.ts'
import { BRIDGE_CONTRACT_UNION_FIXTURES as FIXTURES } from '/Users/zacheryspector/studio-specialists/p15b/tests/fixtures/bridge-contract-union-fixtures.ts'
import { BRIDGE_SCHEMA, PROJECTION_VERSION, PROTOCOL_VERSION } from '/Users/zacheryspector/studio-specialists/p15b/bridge/schema/bridge-schema.ts'
import { schemaIdentity } from '/Users/zacheryspector/studio-specialists/p15b/bridge/schema/canonical.ts'

const root = '/Users/zacheryspector/studio-specialists/p15b'
assert.equal(resolve(process.cwd()), root, 'run from exact candidate clone')
const sha = (bytes: string | Uint8Array) => createHash('sha256').update(bytes).digest('hex')
const pinBytes = readFileSync(new URL('./INPUT-PINS.json', import.meta.url))
const expectedPin = process.env.P58_DECLARATION_INPUT_MANIFEST_SHA256
assert.ok(expectedPin && /^[0-9a-f]{64}$/.test(expectedPin), 'parent must independently pin input manifest')
assert.equal(sha(pinBytes), expectedPin, 'reviewed input manifest')
const pins = JSON.parse(pinBytes.toString('utf8')) as { inputs: Array<{ path: string; bytes: number; sha256: string }> }
const selfPath = fileURLToPath(import.meta.url), selfBefore = sha(readFileSync(selfPath))
function checkPins() {
  for (const pin of pins.inputs) {
    const bytes = readFileSync(resolve(root, pin.path))
    assert.equal(bytes.length, pin.bytes, `${pin.path}: size`)
    assert.equal(sha(bytes), pin.sha256, `${pin.path}: identity`)
  }
  assert.equal(sha(readFileSync(selfPath)), selfBefore, 'producer unchanged')
  assert.equal(sha(readFileSync(new URL('./INPUT-PINS.json', import.meta.url))), expectedPin, 'input pins unchanged')
}
checkPins()
const manifest = JSON.parse(readFileSync(resolve(root, 'generated/unity/project-studio-bridge.contract-manifest.json'), 'utf8'))
const currentSchema = 'sha256:13b7933fdd1e3dc9851dd08630e46efd43e70227f5e0c6f6cf130d885752ab74'
assert.equal(PROTOCOL_VERSION, 4); assert.equal(PROJECTION_VERSION, 58)
assert.equal(manifest.schemaId, currentSchema); assert.equal(schemaIdentity(BRIDGE_SCHEMA), currentSchema)
assert.deepEqual(JSON.parse(readFileSync(resolve(root, 'bridge/schema/project-studio-bridge.schema.json'), 'utf8')), BRIDGE_SCHEMA)
const whole = readFileSync(resolve(root, 'generated/unity/StudioBridgeDtos.Generated.cs'))
assert.equal(sha(whole), manifest.typescriptGeneratedContractSha256)
// Fixed literals are preserved original930/1358 positives. Only current F10/F11 prior
// declaration bodies are old candidate c83; NEW current values are measurements.
const prior = {
  F01_STRING_OR_NULL: '797f92b1f532d61f21dad93ba8fea8da02dd5104c4f744213c9832cb2c1f6bdd',
  F02_OBJECT_OR_NULL: '0fef8c834b895f9cf185af8f421357c642dc71984f1b4618a79eba9c4dd60e1f',
  F03_COMPATIBLE_OBJECTS: '99f44add260a66d0eab17a86d3f743110277292606dff073a90a354bad335c68',
  F04_DISCRIMINATED_OBJECTS: 'd878443418291974137b9affddf066d3b65d8d09286febebcafec35561a2fc5b',
  F09_ARRAY_ITEM_UNION: '7c1f83b70b0e82152821b0c4a5e59bdedcf901f639445b45ec7ef49010e2af1b',
  F10_CURRENT_QUOTE_UNIONS: 'c83fd0f4febb9f78753593c26b941de49b8772ec727600aa32a57b8f6bfb66cc',
  F11_CURRENT_COMMAND_UNION: 'c83fd0f4febb9f78753593c26b941de49b8772ec727600aa32a57b8f6bfb66cc',
  F12_P05_PRODUCTION_SENTINEL: '78d68a2d7670585946f79ebbfc449c85c8ad98ac381b422a8a9abea66702bde6',
} as const
const current = new Set<string>(['F10_CURRENT_QUOTE_UNIONS', 'F11_CURRENT_COMMAND_UNION'])
const identities: Record<string, { sha256: string; bytes: number; deterministic: boolean; priorSha256: string; matchesPrior: boolean }> = {}
let renders = 0
try {
  for (const name of Object.keys(prior) as Array<keyof typeof prior>) {
    const first = generateCsharpTypeDeclarations(FIXTURES[name].schema); renders++
    const second = generateCsharpTypeDeclarations(FIXTURES[name].schema); renders++
    assert.equal(second, first, `${name}: declaration rerender must be byte-exact`)
    const measured = sha(first)
    identities[name] = { sha256: measured, bytes: Buffer.byteLength(first, 'utf8'), deterministic: true,
      priorSha256: prior[name], matchesPrior: measured === prior[name] }
  }
  assert.equal(renders, 16)
  for (const name of Object.keys(prior)) if (!current.has(name)) assert.ok(identities[name]!.matchesPrior, `${name}: fixed positive changed`)
  assert.equal(identities.F10_CURRENT_QUOTE_UNIONS!.sha256, identities.F11_CURRENT_COMMAND_UNION!.sha256)
  assert.equal(identities.F10_CURRENT_QUOTE_UNIONS!.bytes, identities.F11_CURRENT_COMMAND_UNION!.bytes)
  assert.equal(identities.F10_CURRENT_QUOTE_UNIONS!.matchesPrior, false, 'adopted projection58 must change current declaration body')
} finally { checkPins() }
console.log(JSON.stringify({ producer: 'measure-p58-declarations.ts', producerSHA256: selfBefore,
  inputManifestSHA256: expectedPin, schemaId: currentSchema, protocolVersion: PROTOCOL_VERSION,
  projectionVersion: PROJECTION_VERSION, generatedWholeContract: { bytes: whole.length, sha256: sha(whole), isDeclarationBodyHash: false },
  identities, positiveFixtures: 8, fixedPositiveFixtures: 6, renders, actualTicks: 0,
  inputsAndProducerUnchanged: true, completion: 'ALL_EIGHT_POSITIVES_MEASURED_TWICE_SIX_FIXED_UNCHANGED',
  environment: { node: process.version, platform: process.platform, arch: process.arch } }, null, 2))
