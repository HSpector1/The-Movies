// Pipeline script (contract §9: "glTF optimization where practical").
// Converts each curated Downtown .gltf (external .bin + shared PNG textures) into a
// self-contained, geometry-optimized .glb in public/assets/downtown/.
// Optimizations are pure-JS (dedup + prune + weld) — no Blender, no native binaries (§9).
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { NodeIO } from '@gltf-transform/core'
import { ALL_EXTENSIONS } from '@gltf-transform/extensions'
import { dedup, prune, weld, textureCompress } from '@gltf-transform/functions'
import sharp from 'sharp'
import { PUBLIC_ASSETS, MANIFESTS } from './lib.mjs'

const MAX_TEX = 1024 // downscale PBR maps for the lab (materials proof needs texture, not 4K)

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS)
const curation = JSON.parse(readFileSync(join(MANIFESTS, 'curation.json'), 'utf8'))
const OUT = join(PUBLIC_ASSETS, 'downtown')
mkdirSync(OUT, { recursive: true })

const results = []
for (const d of curation.downtown) {
  if (!existsSync(d.src)) { results.push({ name: d.name, ok: false, error: 'source missing' }); continue }
  try {
    const doc = await io.read(d.src)
    await doc.transform(
      dedup(), weld(), prune(),
      textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [MAX_TEX, MAX_TEX] }),
    )
    const glb = await io.writeBinary(doc)
    const outFile = join(OUT, d.name + '.glb')
    writeFileSync(outFile, glb)
    // Approximate source footprint: the .gltf + its .bin (textures are shared across the kit).
    const bin = d.src.replace(/\.gltf$/, '.bin')
    const srcBytes = statSync(d.src).size + (existsSync(bin) ? statSync(bin).size : 0)
    results.push({ name: d.name, role: d.role, ok: true, srcBytesGltfBin: srcBytes, glbBytes: glb.length })
  } catch (err) {
    results.push({ name: d.name, ok: false, error: String(err && err.message || err) })
  }
}

const ok = results.filter((r) => r.ok)
writeFileSync(join(MANIFESTS, 'optimization.json'), JSON.stringify({
  tool: 'optimize-gltf',
  pipeline: ['dedup', 'weld', 'prune', `textureCompress(webp, max ${MAX_TEX}px, sharp)`],
  engine: '@gltf-transform + sharp (local, no Blender, no native archive binaries)',
  converted: ok.length, failed: results.length - ok.length, results,
}, null, 2) + '\n')

console.log('name                             role         glb(KB)   ok')
for (const r of results) {
  console.log(r.name.padEnd(32), (r.role || '').padEnd(12), r.ok ? String((r.glbBytes / 1024).toFixed(1)).padStart(8) : '     err', ' ' + (r.ok ? 'ok' : r.error))
}
console.log(`\nconverted ${ok.length}/${results.length} Downtown glTF -> self-contained GLB (public/assets/downtown/)`)
if (ok.length < results.length) process.exitCode = 1
