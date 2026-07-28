// Pipeline script (contract §9: "manifest generation"). Produces the RUNTIME catalog the
// viewer app consumes, merging curation roles with inventory facts (bounds/tris/provenance).
// Also separates reusable (CC0) from prototype-only (LICENSE-UNCLEAR) outputs (§13).
// Writes manifests/runtime-assets.json (deliverable) + public/runtime-assets.json (served).
import { readFileSync, writeFileSync, existsSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { PUBLIC_ASSETS, MANIFESTS, ROOT } from './lib.mjs'

const curation = JSON.parse(readFileSync(join(MANIFESTS, 'curation.json'), 'utf8'))
const source = JSON.parse(readFileSync(join(MANIFESTS, 'source-assets.json'), 'utf8'))
const dtFiles = source.packs.find((p) => p.id === 'downtown').files
const animPack = source.packs.find((p) => p.id === 'animation')

const gltfFor = (name) => dtFiles.find((f) => f.ext === 'gltf' && f.path.endsWith('/' + name + '.gltf'))?.gltf
const url = (rel) => '/assets/' + rel
const kb = (f) => existsSync(f) ? Number((statSync(f).size / 1024).toFixed(1)) : null

const assets = []

// Downtown (CC0, reusable) — GLB produced by optimize-gltf
for (const d of curation.downtown) {
  const g = gltfFor(d.name)
  const file = join(PUBLIC_ASSETS, 'downtown', d.name + '.glb')
  assets.push({
    id: 'downtown/' + d.name, pack: 'downtown', kind: 'glb', url: url('downtown/' + d.name + '.glb'),
    role: d.role, note: d.note, provenance: 'CC0', author: 'Quaternius', reuse: 'reusable',
    sizeMeters: g?.localSizeMeters ?? null, triangles: g?.triangles ?? null, materials: g?.materials ?? null,
    present: existsSync(file), fileKB: kb(file),
  })
}

// Props (LICENSE-UNCLEAR, prototype-only) — FBX loaded directly
for (const pr of curation.props) {
  const file = join(PUBLIC_ASSETS, 'props', pr.name + '.fbx')
  assets.push({
    id: 'props/' + pr.name, pack: 'props', kind: 'fbx', url: url('props/' + pr.name + '.fbx'),
    role: 'furniture', provenance: 'LICENSE-UNCLEAR', author: 'unknown', reuse: 'prototype-only',
    present: existsSync(file), fileKB: kb(file),
  })
}

// Animation (CC0, reusable) — GLB with skinned character + 43 clips
const allClips = (animPack.files.find((f) => f.path.endsWith('UAL1_Standard.glb'))?.gltf.animations || [])
for (const a of curation.animation) {
  const file = join(PUBLIC_ASSETS, 'animation', a.file)
  assets.push({
    id: 'animation/' + a.name, pack: 'animation', kind: 'glb', url: url('animation/' + a.file),
    role: 'character', rootMotion: a.rootMotion, provenance: 'CC0', author: 'Quaternius', reuse: 'reusable',
    clipCount: allClips.length, present: existsSync(file), fileKB: kb(file),
  })
}

const manifest = {
  tool: 'build-manifest',
  scale: { unit: 'meter', adultHeight: 1.8, note: 'Downtown + character authored at 1 unit = 1 m (validated).' },
  roleClipMap: curation.roleClipMap,
  clips: allClips,
  counts: {
    total: assets.length,
    reusable: assets.filter((a) => a.reuse === 'reusable').length,
    prototypeOnly: assets.filter((a) => a.reuse === 'prototype-only').length,
    present: assets.filter((a) => a.present).length,
  },
  provenanceExcluded: [{ pack: 'wintersets', provenance: 'DO-NOT-USE', reason: 'legacy Lionhead The Movies IP; redistribution restricted; kept for archaeology only, never loaded at runtime.' }],
  assets,
}

writeFileSync(join(MANIFESTS, 'runtime-assets.json'), JSON.stringify(manifest, null, 2) + '\n')
writeFileSync(join(ROOT, 'public', 'runtime-assets.json'), JSON.stringify(manifest, null, 2) + '\n')

console.log(`runtime assets: ${manifest.counts.total} (${manifest.counts.reusable} reusable / ${manifest.counts.prototypeOnly} prototype-only), present=${manifest.counts.present}`)
console.log(`clips exposed: ${allClips.length}; required roles mapped: ${Object.keys(curation.roleClipMap).length}`)
console.log('wrote manifests/runtime-assets.json + public/runtime-assets.json')
