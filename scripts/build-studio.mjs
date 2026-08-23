// Emits the production studio package: the supervisor (studio.mjs) and the
// TypeScript engine (engine.mjs) as self-contained node ESM bundles with an
// esbuild metafile for the packaged-graph audit. No development loader is
// present in the emitted graph.
import { createHash } from 'node:crypto'
import { readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'

const repositoryRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const outDirectory = path.join(repositoryRoot, 'dist', 'studio')

rmSync(outDirectory, { recursive: true, force: true })

const result = await build({
  absWorkingDir: repositoryRoot,
  entryPoints: {
    studio: 'bridge/supervisor/cli-packaged.ts',
    engine: 'bridge/server.ts',
  },
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node24',
  outdir: outDirectory,
  outExtension: { '.js': '.mjs' },
  sourcemap: true,
  metafile: true,
  logLevel: 'silent',
})

if (result.errors.length > 0) {
  for (const error of result.errors) console.error(error)
  process.exit(1)
}

writeFileSync(
  path.join(outDirectory, 'meta.json'),
  JSON.stringify(result.metafile, null, 2),
)

for (const name of ['studio.mjs', 'engine.mjs']) {
  const filePath = path.join(outDirectory, name)
  const bytes = readFileSync(filePath)
  const digest = createHash('sha256').update(bytes).digest('hex')
  console.log(
    `[build:studio] ${name} bytes=${String(statSync(filePath).size)} sha256=${digest}`,
  )
}
console.log(`[build:studio] emitted ${outDirectory}`)
