import { build } from 'esbuild'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { resolve } from 'node:path'

const [sourceRoot, outputDirectory, entryName] = process.argv.slice(2)
mkdirSync(outputDirectory, { recursive: true })
const source = readFileSync(new URL('./' + entryName + '.mjs', import.meta.url), 'utf8')
const result = await build({ stdin: { contents: source, resolveDir: resolve(sourceRoot, 'scripts/p13a'), sourcefile: entryName + '.mjs', loader: 'js' },
  bundle: true, platform: 'node', format: 'esm', target: 'node22', write: false, metafile: true,
  banner: { js: "import{createRequire as p13aCreateRequire}from'node:module';const require=p13aCreateRequire(import.meta.url);" } })
const sha = value => createHash('sha256').update(value).digest('hex')
const product = result.outputFiles[0].contents
writeFileSync(outputDirectory + '/' + entryName + '.mjs', product)
const inputs = Object.keys(result.metafile.inputs).filter(path => path !== entryName + '.mjs' && !path.endsWith('/' + entryName + '.mjs')).map(path => {
  const absolutePath = resolve(path); return { path: absolutePath, sha256: sha(readFileSync(absolutePath)) }
})
writeFileSync(outputDirectory + '/' + entryName + '-binding.json', JSON.stringify({ builtAt: new Date().toISOString(), sourceRoot,
  branch: execFileSync('git', ['branch', '--show-current'], { cwd: sourceRoot, encoding: 'utf8' }).trim(),
  head: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: sourceRoot, encoding: 'utf8' }).trim(),
  status: execFileSync('git', ['status', '--short'], { cwd: sourceRoot, encoding: 'utf8' }),
  harnessSourceSha256: sha(source), bundleSha256: sha(product), bundleBytes: product.length, inputs }, null, 2))
console.log(JSON.stringify({ sourceRoot, entryName, bundleBytes: product.length, bundleSha256: sha(product), inputCount: inputs.length }))
