// Post-export validation of the Blender-authored studio assets (independent of Blender).
// For every asset in manifests/studio-assets.json: the GLB parses, has >=1 mesh, its LOD0 tri
// count matches the manifest (+/-2), characters carry the full 65-joint UAL skeleton with skin
// weights, materials are present, and the collision proxy GLB exists & parses. Cross-checking
// the manifest against the actual bytes catches any dishonest/ stale manifest claim.
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { NodeIO } from '@gltf-transform/core'
import { ALL_EXTENSIONS } from '@gltf-transform/extensions'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS)
const manifest = JSON.parse(readFileSync(join(ROOT, 'manifests', 'studio-assets.json'), 'utf8'))
const abs = (u) => join(ROOT, 'public', u.replace(/^\//, ''))

function tris(doc) {
  let t = 0
  for (const m of doc.getRoot().listMeshes())
    for (const p of m.listPrimitives()) t += p.getIndices() ? p.getIndices().getCount() / 3 : 0
  return t
}

const rows = []
for (const a of manifest.assets) {
  const r = { id: a.id, ok: true, issues: [] }
  const file = abs(a.file)
  if (!existsSync(file)) { r.ok = false; r.issues.push('GLB missing'); rows.push(r); continue }
  try {
    const doc = await io.read(file)
    const root = doc.getRoot()
    if (root.listMeshes().length < 1) { r.ok = false; r.issues.push('no meshes') }
    const t = tris(doc)
    if (Math.abs(t - a.tris) > 2) { r.ok = false; r.issues.push(`tris ${t} != manifest ${a.tris}`) }
    if (root.listMaterials().length < 1) { r.ok = false; r.issues.push('no materials') }
    if (a.family === 'characters') {
      const skin = root.listSkins()[0]
      const joints = skin ? skin.listJoints().length : 0
      if (joints < 65) { r.ok = false; r.issues.push(`skin joints ${joints} < 65`) }
      const skinned = root.listMeshes().every((m) =>
        m.listPrimitives().every((p) => p.listSemantics().includes('JOINTS_0')))
      if (!skinned) { r.ok = false; r.issues.push('unskinned primitive') }
      r.joints = joints
    }
    // collision proxy
    if (a.collision?.file) {
      const cf = abs(a.collision.file)
      if (!existsSync(cf)) { r.ok = false; r.issues.push('collision GLB missing') }
      else { const cd = await io.read(cf); if (cd.getRoot().listMeshes().length < 1) { r.ok = false; r.issues.push('empty collision') } }
    }
    // LOD tiers: the manifest must not advertise a lodN_file that isn't on disk / doesn't parse
    for (const tier of [1, 2]) {
      const lf = a.lod?.[`lod${tier}_file`]
      if (lf) {
        const lp = abs(lf)
        if (!existsSync(lp)) { r.ok = false; r.issues.push(`LOD${tier} GLB missing`) }
        else {
          const ld = await io.read(lp)
          const lt = tris(ld)
          if (Math.abs(lt - a.lod[`lod${tier}_tris`]) > 2) { r.ok = false; r.issues.push(`LOD${tier} tris ${lt} != manifest ${a.lod[`lod${tier}_tris`]}`) }
          if (a.family === 'characters' && (ld.getRoot().listSkins()[0]?.listJoints().length ?? 0) < 65) { r.ok = false; r.issues.push(`LOD${tier} lost skeleton`) }
        }
      }
    }
    r.tris = t
  } catch (e) { r.ok = false; r.issues.push(String(e.message || e)) }
  rows.push(r)
}

const pass = rows.filter((r) => r.ok).length
writeFileSync(join(ROOT, 'manifests', 'studio-validation.json'),
  JSON.stringify({ tool: 'validate-studio', pass, fail: rows.length - pass, rows }, null, 2) + '\n')

console.log('id                                            tris   joints  ok  issues')
for (const r of rows)
  console.log(r.id.padEnd(44), String(r.tris ?? '').padStart(5), String(r.joints ?? '').padStart(6), '  ',
    r.ok ? 'OK' : 'XX', r.issues.join('; '))
console.log(`\nstudio validation: ${pass}/${rows.length} passed`)
if (pass < rows.length) process.exitCode = 1
