// Direct packaged dependency audit of the emitted studio package. Reads the
// esbuild metafile written by scripts/build-studio.mjs and fails closed unless
// the emitted graph is exactly first-party TypeScript plus node builtins:
// zero node_modules inputs, no development loader, no UI-side dependencies.
import { createHash } from 'node:crypto'
import { readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repositoryRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const outDirectory = path.join(repositoryRoot, 'dist', 'studio')
const violations = []

let metafile
try {
  metafile = JSON.parse(readFileSync(path.join(outDirectory, 'meta.json'), 'utf8'))
} catch (error) {
  console.error(
    `[audit:studio-packaged] missing or unreadable metafile: ${error.message}; ` +
      'run npm run build:studio first',
  )
  process.exit(1)
}

const FIRST_PARTY_PREFIXES = ['bridge/', 'src/', 'ui/src/']
const FORBIDDEN_SEGMENTS = ['vite', 'vite-node', 'vitest', 'react', 'react-dom', 'three', 'phaser']

const inputs = Object.keys(metafile.inputs ?? {})
if (inputs.length === 0) violations.push('metafile lists zero inputs')
const prefixCounts = new Map()
for (const input of inputs) {
  const segments = input.split('/')
  if (segments.includes('node_modules')) {
    violations.push(`node_modules input in emitted graph: ${input}`)
  }
  if (!FIRST_PARTY_PREFIXES.some((prefix) => input.startsWith(prefix))) {
    violations.push(`input outside first-party roots: ${input}`)
  }
  for (const segment of segments) {
    if (FORBIDDEN_SEGMENTS.includes(segment.toLowerCase())) {
      violations.push(`forbidden dependency segment "${segment}" in input: ${input}`)
    }
  }
  const prefix = FIRST_PARTY_PREFIXES.find((candidate) => input.startsWith(candidate)) ?? 'other'
  prefixCounts.set(prefix, (prefixCounts.get(prefix) ?? 0) + 1)
}

const outputs = metafile.outputs ?? {}
const requiredOutputs = ['dist/studio/studio.mjs', 'dist/studio/engine.mjs']
for (const required of requiredOutputs) {
  const record = Object.entries(outputs).find(([name]) => name.endsWith(required))
  if (record === undefined) {
    violations.push(`metafile missing required output ${required}`)
    continue
  }
  const filePath = path.join(repositoryRoot, required)
  let size = 0
  try {
    size = statSync(filePath).size
  } catch {
    violations.push(`emitted output missing on disk: ${required}`)
    continue
  }
  if (size < 10_000) violations.push(`emitted output implausibly small (${String(size)} bytes): ${required}`)
  for (const importRecord of record[1].imports ?? []) {
    if (importRecord.external === true && !importRecord.path.startsWith('node:')) {
      violations.push(`non-builtin external import "${importRecord.path}" in ${required}`)
    }
  }
  const digest = createHash('sha256').update(readFileSync(filePath)).digest('hex')
  console.log(
    `[audit:studio-packaged] ${required} bytes=${String(size)} sha256=${digest}`,
  )
}

for (const [prefix, count] of [...prefixCounts.entries()].sort()) {
  console.log(`[audit:studio-packaged] inputs ${prefix} count=${String(count)}`)
}
console.log(`[audit:studio-packaged] total inputs=${String(inputs.length)}`)

if (violations.length > 0) {
  for (const violation of violations) {
    console.error(`[audit:studio-packaged] VIOLATION: ${violation}`)
  }
  process.exit(1)
}
console.log('[audit:studio-packaged] PASS: emitted graph is first-party + node builtins only')
