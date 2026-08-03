// Asset Lab 05I — Iteration-1 validator. Asserts the corrected hero exports are valid + additive (05H/05G
// byte-unchanged), the harness is wired, and the required Iteration-1 evidence exists. Exit 1 on any failure.
import { NodeIO } from '@gltf-transform/core'
import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('..', import.meta.url)) + '/'
const CH = ROOT + 'public/assets/studio/characters/'
const io = new NodeIO()
const fails = [], ok = []
const req = (c, m) => (c ? ok : fails).push(m)
const sha = (p) => createHash('sha256').update(readFileSync(p)).digest('hex')
const has = (p) => existsSync(ROOT + p)
const countPng = (d) => { try { return readdirSync(ROOT + d).filter((f) => f.endsWith('.png')).length } catch { return 0 } }

// 1) 05I GLBs exist + parse + skinned + 65 joints
for (const suf of ['', '_LOD1', '_LOD2', '_COL']) {
  const p = CH + `electric_hero_05i${suf}.glb`
  req(existsSync(p), `electric_hero_05i${suf}.glb exists`)
}
try {
  const doc = await io.read(CH + 'electric_hero_05i.glb')
  const skins = doc.getRoot().listSkins()
  const joints = skins[0]?.listJoints().length ?? 0
  req(joints === 65, `05I LOD0 skeleton = 65 joints (${joints})`)
  const meshes = doc.getRoot().listMeshes().length
  req(meshes >= 1, `05I LOD0 has a mesh (${meshes})`)
} catch (e) { fails.push('05I LOD0 GLB unparseable: ' + e.message) }

// 2) manifest sane
try {
  const m = JSON.parse(readFileSync(ROOT + 'manifests/hero-05i.json', 'utf8'))
  req(m.ok === true, `05I manifest ok=true (issues: ${JSON.stringify(m.issues)})`)
  req(m.milestone === 'asset-lab-05i', 'manifest milestone = asset-lab-05i')
  req(m.bones === 65, `manifest bones = 65 (${m.bones})`)
  req(m.lod0_tris <= 26000, `LOD0 tris <= 26000 (${m.lod0_tris})`)
  req(m.lod0_tris >= m.lod1_tris && m.lod1_tris >= m.lod2_tris, `LODs monotonic (${m.lod0_tris}/${m.lod1_tris}/${m.lod2_tris})`)
  req(1.70 <= m.height && m.height <= 1.95, `height in [1.70,1.95] (${m.height})`)
} catch (e) { fails.push('hero-05i.json missing/unparseable: ' + e.message) }

// 3) ADDITIVE — 05H unchanged (known sha), 05G/05F/05E present
req(has('public/assets/studio/characters/electric_hero_05h.glb') &&
  sha(CH + 'electric_hero_05h.glb') === '86971e47b6f9f978b0c86ecdc5501f3ca8d1c1a7280d23e707b224a2e78b1b04',
  '05H GLB byte-UNCHANGED (sha256 86971e47…)')
for (const g of ['electric_hero_05g.glb', 'electric_hero_05f.glb', 'Char_Electric_Heavy.glb'])
  req(existsSync(CH + g), `additive: ${g} intact`)

// 4) harness wired
try {
  const cb = readFileSync(ROOT + 'src/lab/cameraBridge.ts', 'utf8')
  req(/export const G_HERO_05I/.test(cb) && (cb.match(/'05I\//g) || []).length >= 25, `25+ 05I review cameras (${(cb.match(/'05I\//g) || []).length})`)
  req(/hero05icompare|hero05ilod/.test(cb), 'GReviewKind has 05I kinds')
  const rh = readFileSync(ROOT + 'src/components/reviewHarness.tsx', 'utf8')
  req(/electric_hero_05i\.glb/.test(rh) && /Hero05ICompare/.test(rh), 'reviewHarness references 05I + Hero05ICompare')
  req(/state\.neutralEval/.test(rh), 'neutral eval-light wired (§7)')
} catch { fails.push('harness source unreadable') }

// 5) evidence — Iteration 1 (preserved) + Iteration 2 (final)
req(countPng('proof/lab05i/iteration-01/runtime') >= 24, `Iter1 runtime evidence preserved (${countPng('proof/lab05i/iteration-01/runtime')})`)
req(countPng('proof/lab05i/iteration-02/runtime') >= 24, `Iter2 runtime evidence >= 24 (${countPng('proof/lab05i/iteration-02/runtime')})`)
req(countPng('proof/lab05i/iteration-02/real-gpu') >= 5, `Iter2 real-GPU close-ups >= 5 (${countPng('proof/lab05i/iteration-02/real-gpu')})`)
req(countPng('proof/lab05i/iteration-02/blender') >= 10, `Iter2 Blender renders present (${countPng('proof/lab05i/iteration-02/blender')})`)
req(has('proof/lab05i/iteration-02/root-cause-materials.json'), 'Iter2 material dump present')
try {
  const cm = JSON.parse(readFileSync(ROOT + 'proof/lab05i/iteration-02/runtime/capture-meta.json', 'utf8'))
  req(cm.consoleErrorFree === true, `Iter2 runtime capture console-error-free (errorCount=${cm.errorCount})`)
} catch { fails.push('Iter2 runtime capture-meta.json missing') }

// 6) docs + index
for (const d of ['ASSET-LAB-05I-BRIEF.md', 'ASSET-LAB-05I-ITERATION-LOG.md', 'ASSET-LAB-05I-OWNER-REVIEW-GUIDE.md',
  'ASSET-LAB-05I-ITERATION-1-REPORT.md', 'ASSET-LAB-05I-ITERATION-2-REPORT.md', 'ASSET-LAB-05I-FINAL-REPORT.md'])
  req(has('docs/' + d), `doc present: ${d}`)
req(has('proof/lab05i/iteration-01/index.html'), 'Iter1 review index preserved')
req(has('proof/lab05i/iteration-02/index.html'), 'Iter2 owner review index present')

console.log('\n05I ITERATION-1 VALIDATION')
for (const m of ok) console.log('  ✓ ' + m)
for (const m of fails) console.log('  ✗ ' + m)
console.log(`\n${ok.length} passed, ${fails.length} failed`)
if (fails.length) { console.log('05I_VALIDATE_FAIL'); process.exit(1) }
console.log('05I_VALIDATE_OK')
