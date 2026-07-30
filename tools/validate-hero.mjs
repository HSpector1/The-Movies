// Asset Lab 05F — hero regression guard (Node side). Complements the Blender-side charvalidate that
// runs in build_hero_export (face −Y, 65 joints, height, grounded, no stray island). This checks the
// exported artifacts + manifest + budgets + that the 05E Electric was NOT overwritten + that the review
// harness cameras exist. It is a REGRESSION GUARD; it does not determine visual approval.
import { readFileSync, existsSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const CH = ROOT + 'public/assets/studio/characters/'
const fails = []
const ok = (c, m) => { if (!c) fails.push(m) }

// 1) hero GLBs exist + are non-trivial
for (const f of ['electric_hero_05f.glb', 'electric_hero_05f_LOD1.glb', 'electric_hero_05f_LOD2.glb', 'electric_hero_05f_COL.glb'])
  ok(existsSync(CH + f) && statSync(CH + f).size > 2000, `missing/empty hero GLB: ${f}`)

// 2) manifest: validation passed + budgets
const man = JSON.parse(readFileSync(ROOT + 'manifests/hero-05f.json', 'utf8'))
ok(man.ok === true, `hero validation not OK: ${JSON.stringify(man.issues)}`)
ok(man.height >= 1.70 && man.height <= 1.95, `height out of range: ${man.height}`)
ok(man.lod0_tris <= 18000, `LOD0 tris over budget: ${man.lod0_tris}`)
ok(man.lod0_tris > man.lod1_tris && man.lod1_tris > man.lod2_tris, 'LOD tris not monotonically decreasing')

// 3) 05E Electric GLBs still present (additive — not overwritten/removed)
for (const f of ['Char_Electric_Heavy.glb', 'Char_Electric_Heavy_LOD1.glb', 'Char_Electric_Heavy_LOD2.glb'])
  ok(existsSync(CH + f), `05E Electric GLB missing (must remain): ${f}`)

// 4) review-harness comparison cameras present (all 22 required 05F views wired in cameraBridge)
const bridge = readFileSync(ROOT + 'src/lab/cameraBridge.ts', 'utf8')
const REQUIRED = ['05E Electric — Front', '05F Hero — Front', '05E Electric — Back', '05F Hero — Back',
  'Side-by-Side Front', 'Side-by-Side Back', 'Side-by-Side Three-Quarter', 'Pelvis Front Comparison',
  'Pelvis Back Comparison', 'Vest Comparison', 'Shoulder Comparison', 'Hand Comparison', 'Boot Comparison',
  'Walk Comparison', 'Talk Comparison', 'Kneeling Comparison', 'Pickup Comparison', 'Sitting Comparison',
  '05F LOD Comparison', 'Management Distance Comparison', 'Human Scale Comparison', 'Wireframe Comparison']
for (const c of REQUIRED) ok(bridge.includes(`'${c}'`), `review camera missing: ${c}`)

// 5) evidence present
for (const d of ['baseline', 'iteration-01', 'iteration-06', 'final', 'runtime'])
  ok(existsSync(ROOT + `proof/lab05f/${d}`), `evidence dir missing: proof/lab05f/${d}`)

console.log(`hero: LOD0/1/2 = ${man.lod0_tris}/${man.lod1_tris}/${man.lod2_tris} tris  height=${man.height}  islands=${man.islands}`)
if (fails.length) { console.log('HERO_VALIDATE_FAIL\n  - ' + fails.join('\n  - ')); process.exit(1) }
console.log(`HERO_VALIDATE_OK — ${REQUIRED.length} review cameras, additive (05E Electric intact), budgets in range`)
