// 700 — independent re-derivation of the F10/F11/F12 C# declaration-body identities after P14B.6.
//
// DISCIPLINE (the pin's own rule, tests/bridge-contract-generator.test.ts:670-677): "Value computed
// once by the generator ... not by this test against itself." So this probe computes the hashes from
// the generator and the live schema, and the test owner copies them from THIS log — never from a
// failure message. The 662-T2 precedent did the same through `662-T2-gen-hash.log`.
//
// Run from the repository root:
//   node_modules/.bin/vite-node docs/engineering/playability-launch-review/evidence/p14b4-20260919/700-gen-hash-probe.ts
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { generateCsharpTypeDeclarations } from '../../../../../scripts/bridge-contract-csharp.ts'
import { BRIDGE_CONTRACT_UNION_FIXTURES as FIXTURES } from '../../../../../tests/fixtures/bridge-contract-union-fixtures.ts'
import { PROJECTION_VERSION } from '../../../../../bridge/schema/bridge-schema.ts'

const sha = (v: string): string => createHash('sha256').update(v).digest('hex')
console.log('PROBE700_SELF', JSON.stringify({
  selfScriptSha256: sha(readFileSync(fileURLToPath(import.meta.url), 'utf8')),
  projectionVersion: PROJECTION_VERSION,
  nodeVersion: process.version, platform: process.platform, arch: process.arch,
}))

// Determinism first: the generator must render byte-identically twice, or an identity is meaningless.
const NAMES = ['F10_CURRENT_QUOTE_UNIONS', 'F11_CURRENT_COMMAND_UNION', 'F12_P05_PRODUCTION_SENTINEL'] as const
const out: Record<string, { sha256: string; bytes: number; deterministic: boolean }> = {}
for (const name of NAMES) {
  const schema = FIXTURES[name].schema
  const first = generateCsharpTypeDeclarations(schema)
  const second = generateCsharpTypeDeclarations(schema)
  out[name] = { sha256: sha(first), bytes: Buffer.byteLength(first, 'utf8'), deterministic: second === first }
  if (second !== first) throw new Error(`${name}: generator is NOT deterministic; an identity pin would be meaningless`)
  console.log(`  ${name.padEnd(30)} ${out[name].sha256}  ${String(out[name].bytes).padStart(7)} bytes`)
}

// The frozen subset MUST NOT move. B.6 added $defs to the running schema; F12 is the P05 sentinel and
// is independent of them. If this assertion ever fails, the change reached further than B.6's scope.
const F12_FROZEN = '78d68a2d7670585946f79ebbfc449c85c8ad98ac381b422a8a9abea66702bde6'
const f12Moved = out.F12_P05_PRODUCTION_SENTINEL!.sha256 !== F12_FROZEN
console.log(`  F12 frozen sentinel unchanged: ${String(!f12Moved)}`)
if (f12Moved) throw new Error('F12_P05_PRODUCTION_SENTINEL MOVED — B.6 reached outside its scope')
console.log(`JSON ${JSON.stringify({ probe: '700-gen-hash-probe.ts', projectionVersion: PROJECTION_VERSION, identities: out, f12Frozen: F12_FROZEN })}`)
