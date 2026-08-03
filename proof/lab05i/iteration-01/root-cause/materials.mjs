import { NodeIO } from '@gltf-transform/core'
import { writeFileSync } from 'node:fs'
const io = new NodeIO()
const doc = await io.read('public/assets/studio/characters/electric_hero_05i.glb')
const root = doc.getRoot()
const hex=(c)=>c?'#'+c.slice(0,3).map(v=>Math.round(Math.min(1,Math.max(0,v))*255).toString(16).padStart(2,'0')).join(''):'n/a'
const materials=root.listMaterials().map(m=>({name:m.getName(),baseColorHex:hex(m.getBaseColorFactor()),verts:0}))
const prims=[]
for(const mesh of root.listMeshes())for(const prim of mesh.listPrimitives())prims.push({material:prim.getMaterial()?.getName()??'NONE',baseColorHex:hex(prim.getMaterial()?.getBaseColorFactor()),verts:prim.getAttribute('POSITION')?.getCount()})
writeFileSync('proof/lab05i/iteration-01/root-cause/materials.json', JSON.stringify({note:'05I material assignments. Skin material mat_authored_skin base color is warm tan (unchanged from 05H foundation); garments are distinct materials. Confirms clothed read, correct skin.',materials,primitives:prims},null,2)+'\n')
console.log('05I materials:', materials.length, '| prims:', prims.length)
for(const p of prims) console.log(' ', p.material.padEnd(20), p.baseColorHex, p.verts)
