// Emits the production supervisor, HTTP engine and sole runtime worker as
// self-contained Node ESM bundles with an
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

// Bind the engine executable to the exact worker bytes, not merely a neighboring self-described manifest.
await build({absWorkingDir:repositoryRoot,entryPoints:{'runtime-worker':'bridge/runtime/worker-entry.ts'},bundle:true,platform:'node',format:'esm',target:'node24',outdir:outDirectory,outExtension:{'.js':'.mjs'},sourcemap:true,logLevel:'silent'})
const workerSha256=createHash('sha256').update(readFileSync(path.join(outDirectory,'runtime-worker.mjs'))).digest('hex')
const compiledSourceHashes = new Map()
const sourceBindingPlugin = {
  name: 'bind-compiled-source',
  setup(build) {
    build.onLoad({ filter: /\.(?:[cm]?[jt]sx?|json)$/ }, (args) => {
      const contents = readFileSync(args.path)
      compiledSourceHashes.set(path.relative(repositoryRoot, args.path), createHash('sha256').update(contents).digest('hex'))
      const extension = path.extname(args.path)
      const loader = extension === '.json' ? 'json' : extension === '.tsx' ? 'tsx' : extension === '.jsx' ? 'jsx' : extension.endsWith('ts') ? 'ts' : 'js'
      return { contents, loader }
    })
  },
}
const result = await build({
  plugins: [sourceBindingPlugin],
  define:{__PROJECT_STUDIO_RUNTIME_WORKER_SHA256__:JSON.stringify(workerSha256)},
  absWorkingDir: repositoryRoot,
  entryPoints: {
    studio: 'bridge/supervisor/cli-packaged.ts',
    engine: 'bridge/server.ts',
    'runtime-worker': 'bridge/runtime/worker-entry.ts',
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

if(createHash('sha256').update(readFileSync(path.join(outDirectory,'runtime-worker.mjs'))).digest('hex')!==workerSha256)throw new Error('Runtime worker changed between binding and final package build.')
const workerOutput=Object.entries(result.metafile.outputs).find(([name])=>name.endsWith('runtime-worker.mjs'))?.[1]
if(!workerOutput)throw new Error('Worker build output is missing.')
const workerSources = Object.keys(workerOutput.inputs).sort().map(name => {
  const sha256 = compiledSourceHashes.get(name)
  if (!sha256 || sha256 !== createHash('sha256').update(readFileSync(path.join(repositoryRoot, name))).digest('hex')) throw new Error('Worker source changed while building; repeat the build after edits finish.')
  return { path: name, sha256 }
})
writeFileSync(path.join(outDirectory,'runtime-worker-source.json'),JSON.stringify({version:1,sha256:createHash('sha256').update(readFileSync(path.join(outDirectory,'runtime-worker.mjs'))).digest('hex'),sources:workerSources},null,2))

for (const name of ['studio.mjs', 'engine.mjs', 'runtime-worker.mjs']) {
  const filePath = path.join(outDirectory, name)
  const bytes = readFileSync(filePath)
  const digest = createHash('sha256').update(bytes).digest('hex')
  console.log(
    `[build:studio] ${name} bytes=${String(statSync(filePath).size)} sha256=${digest}`,
  )
}
console.log(`[build:studio] emitted ${outDirectory}`)
