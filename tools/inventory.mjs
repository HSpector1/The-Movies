// Pipeline script (contract §9: "asset inventory"; §3: record types, sizes, models,
// textures, animations, dimensions, material counts, bounds, scale, conversion status).
// Walks sources/extracted, parses every glTF/GLB with @gltf-transform, probes FBX/DDS/MSH
// headers with local readers, and emits manifests/source-assets.json.
import { writeFileSync, mkdirSync } from 'node:fs'
import { join, basename, relative as rel } from 'node:path'
import { NodeIO } from '@gltf-transform/core'
import { ALL_EXTENSIONS } from '@gltf-transform/extensions'
import {
  EXTRACTED, MANIFESTS, walk, ext, classify, ddsInfo, fbxInfo, mshTextureRefs, round, fileBytes,
} from './lib.mjs'

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS)

const PACKS = {
  'downtown-city-megakit': { id: 'downtown', provenance: 'CC0', author: 'Quaternius' },
  'universal-animation-library': { id: 'animation', provenance: 'CC0', author: 'Quaternius' },
  'fbx-props': { id: 'props', provenance: 'LICENSE-UNCLEAR', author: 'unknown (no license file in archive)' },
  wintersets: { id: 'wintersets', provenance: 'DO-NOT-USE', author: 'Zapster (legacy The Movies mod)' },
}

/** Rich analysis of a glTF/GLB via gltf-transform. */
async function analyzeGltf(file) {
  const doc = await io.read(file)
  const root = doc.getRoot()
  let tris = 0, verts = 0
  const min = [Infinity, Infinity, Infinity]
  const max = [-Infinity, -Infinity, -Infinity]
  for (const mesh of root.listMeshes()) {
    for (const prim of mesh.listPrimitives()) {
      const pos = prim.getAttribute('POSITION')
      if (pos) {
        verts += pos.getCount()
        const idx = prim.getIndices()
        tris += (idx ? idx.getCount() : pos.getCount()) / 3
        const lo = pos.getMin([]) , hi = pos.getMax([])
        for (let i = 0; i < 3; i++) { if (lo[i] < min[i]) min[i] = lo[i]; if (hi[i] > max[i]) max[i] = hi[i] }
      }
    }
  }
  const size = min[0] === Infinity ? null : [round(max[0] - min[0]), round(max[1] - min[1]), round(max[2] - min[2])]
  const animations = root.listAnimations().map((a) => {
    let dur = 0
    for (const s of a.listSamplers()) { const inp = s.getInput(); if (inp) { const m = inp.getMax([])[0]; if (m > dur) dur = m } }
    return { name: a.getName() || '(unnamed)', duration: round(dur) }
  })
  return {
    meshes: root.listMeshes().length,
    materials: root.listMaterials().length,
    textures: root.listTextures().length,
    skins: root.listSkins().length,
    animations,
    triangles: Math.round(tris),
    vertices: verts,
    localSizeMeters: size,
  }
}

const files = walk(EXTRACTED)
const packResults = {}

for (const f of files) {
  const relPath = rel(EXTRACTED, f)
  const packDir = relPath.split('/')[0]
  const meta = PACKS[packDir] || { id: packDir, provenance: 'LICENSE-UNCLEAR', author: 'unknown' }
  const e = ext(f)
  const cat = classify(e)
  const rec = { path: relPath, ext: e, category: cat, bytes: fileBytes(f) }

  try {
    if (e === 'gltf' || e === 'glb') { rec.gltf = await analyzeGltf(f); rec.conversionStatus = 'runtime-ready (glTF/GLB)' }
    else if (e === 'fbx') { rec.fbx = fbxInfo(f); rec.conversionStatus = 'load-direct-or-convert (FBX)' }
    else if (e === 'dds') { rec.dds = ddsInfo(f); rec.conversionStatus = 'texture loadable (DDSLoader)' }
    else if (e === 'msh') { rec.msh = { textureRefs: mshTextureRefs(f) }; rec.conversionStatus = 'BLOCKED (proprietary Lionhead mesh; no public spec)' }
    else if (cat === 'texture') rec.conversionStatus = 'texture'
    else rec.conversionStatus = 'n/a'
  } catch (err) {
    rec.error = String(err && err.message || err)
    rec.conversionStatus = 'parse-error'
  }

  ;(packResults[packDir] ||= { ...meta, dir: packDir, files: [] }).files.push(rec)
}

// Roll up per-pack summaries.
const packs = Object.values(packResults).map((pk) => {
  const byCat = {}
  const byExt = {}
  for (const f of pk.files) { byCat[f.category] = (byCat[f.category] || 0) + 1; byExt[f.ext] = (byExt[f.ext] || 0) + 1 }
  const models = pk.files.filter((f) => f.gltf || f.fbx)
  const allAnims = pk.files.flatMap((f) => (f.gltf?.animations || []).map((a) => ({ ...a, file: f.path })))
  return {
    id: pk.id, dir: pk.dir, provenance: pk.provenance, author: pk.author,
    totalFiles: pk.files.length, byCategory: byCat, byExt,
    modelCount: models.length,
    animationCount: allAnims.length,
    animations: allAnims,
    files: pk.files,
  }
})

mkdirSync(MANIFESTS, { recursive: true })
writeFileSync(join(MANIFESTS, 'source-assets.json'), JSON.stringify({ tool: 'inventory', generatedFromDir: 'sources/extracted', packs }, null, 2) + '\n')

console.log('PACK                         files  models  anims  provenance')
for (const pk of packs) {
  console.log(pk.dir.padEnd(28), String(pk.totalFiles).padStart(5), String(pk.modelCount).padStart(7), String(pk.animationCount).padStart(6), '  ' + pk.provenance)
}
console.log('\n--- animation clips discovered (Universal Animation Library) ---')
const anims = packs.find((p) => p.id === 'animation')
if (anims) for (const a of anims.animations) console.log('  ' + a.name.padEnd(28), a.duration + 's', ' <-', basename(a.file))
const errs = packs.flatMap((pk) => pk.files.filter((f) => f.error).map((f) => `${f.path}: ${f.error}`))
console.log(`\nparse errors: ${errs.length}`)
for (const e of errs.slice(0, 8)) console.log('  ! ' + e)
console.log('\nwrote manifests/source-assets.json')
