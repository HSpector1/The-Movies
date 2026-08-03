import { NodeIO } from '@gltf-transform/core'
import { writeFileSync } from 'node:fs'
const io = new NodeIO()
const doc = await io.read('public/assets/studio/characters/electric_hero_05h.glb')
const root = doc.getRoot()
const hex = (c) => c ? '#' + c.slice(0,3).map(v=>Math.round(Math.min(1,Math.max(0,v))*255).toString(16).padStart(2,'0')).join('') : 'n/a'
const materials = root.listMaterials().map(m => ({ name:m.getName(), baseColorHex:hex(m.getBaseColorFactor()), baseColor:m.getBaseColorFactor().map(v=>+v.toFixed(3)), metallic:+m.getMetallicFactor().toFixed(2), roughness:+m.getRoughnessFactor().toFixed(2) }))
const prims = []
for (const mesh of root.listMeshes()) for (const prim of mesh.listPrimitives()) prims.push({ mesh:mesh.getName(), material:prim.getMaterial()?.getName()??'NONE', baseColorHex:hex(prim.getMaterial()?.getBaseColorFactor()), verts:prim.getAttribute('POSITION')?.getCount() })
const out = { note:'Root-cause of the 05H appearance. The SKIN material (mat_authored_skin) base color is WARM TAN #e8b58f, NOT blue. The blue-grey torso/arms are mat_h_shirt (#475c75), a fitted work shirt. The face reads cool because of the harness fill lighting, not the material. An earlier skin-tint isolation test in this review was flawed (blue-grey world kept) and its material-blue conclusion is retracted.', materials, primitives:prims }
writeFileSync('proof/lab05h/final-owner-review/root-cause/materials.json', JSON.stringify(out,null,2)+'\n')
console.log('wrote materials.json:', materials.length, 'materials,', prims.length, 'primitives')
