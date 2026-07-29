// Asset Lab 05B — validate the EXPORTED character GLBs (independent of Blender). Fails (exit 1)
// on: the Blender gate (face-on-back / disconnected / floating / bad height) recorded in the
// manifest, a non-identity mesh-node rotation (the (0,0,pi) hack), wrong skin-joint count, LOD
// skeleton/height inconsistency, or missing files. Pairs with the Blender-side geometric gate.
import { NodeIO } from '@gltf-transform/core'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const DIR = ROOT + 'public/assets/studio/characters/'
const man = JSON.parse(readFileSync(ROOT + 'manifests/characters-05b.json', 'utf8'))
const io = new NodeIO()

function heightY(doc) {
  const mesh = doc.getRoot().listMeshes()[0]
  let minY = 1e9, maxY = -1e9
  for (const p of mesh.listPrimitives()) {
    const pos = p.getAttribute('POSITION'); const n = pos.getCount(); const el = [0, 0, 0]
    for (let i = 0; i < n; i++) { pos.getElement(i, el); minY = Math.min(minY, el[1]); maxY = Math.max(maxY, el[1]) }
  }
  return maxY - minY
}

let fails = 0
for (const c of man.characters) {
  const issues = []
  if (!c.ok) issues.push(...(c.issues || ['blender validation gate failed']))
  const stem = c.file.split('/').pop().replace('.glb', '')
  const joints = []
  for (const suf of ['', '_LOD1', '_LOD2']) {
    let doc
    try { doc = await io.read(DIR + stem + suf + '.glb') } catch { issues.push(`missing ${stem}${suf}.glb`); continue }
    const root = doc.getRoot()
    const skin = root.listSkins()[0]
    joints.push(skin ? skin.listJoints().length : 0)
    const mnode = root.listNodes().find((n) => n.getMesh())
    const q = mnode.getRotation()
    if (Math.abs(q[0]) > 0.02 || Math.abs(q[1]) > 0.02 || Math.abs(q[2]) > 0.02 || Math.abs(q[3] - 1) > 0.02)
      issues.push(`${suf || 'LOD0'} mesh-node NOT identity (rot=[${q.map((x) => x.toFixed(2))}]) — possible orientation hack`)
    if (suf === '') {
      const h = heightY(doc)
      if (h < 1.70 || h > 1.95) issues.push(`height ${h.toFixed(3)} out of [1.70,1.95]`)
    }
  }
  if (joints.length && new Set(joints).size !== 1) issues.push(`LOD skeleton mismatch joints=${JSON.stringify(joints)}`)
  if (joints[0] !== 65) issues.push(`skin joints ${joints[0]} != 65`)
  const ok = issues.length === 0
  if (!ok) fails++
  console.log(`  ${stem.padEnd(26)} ${ok ? 'PASS' : 'FAIL ' + JSON.stringify(issues)}`)
}
console.log(`\nvalidate-characters: ${man.characters.length - fails} pass / ${fails} fail`)
process.exit(fails ? 1 : 0)
