// Asset Lab 05H — authored-base hero regression guard (Node side). Complements the Blender-side
// validate in build_hero_export_05h (face -Y, 65 joints, height, grounded, no stray island).
// Checks the exported 05H artifacts + manifest + budgets, that 05E/05F/05G were NOT overwritten
// (additive), that the 05H comparison cameras + dispatch exist, and that provenance is preserved.
// REGRESSION GUARD; visual approval is the owner's real-GPU M3 pass.
import { readFileSync, existsSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const CH = ROOT + 'public/assets/studio/characters/'
const fails = []
const ok = (c, m) => { if (!c) fails.push(m) }

// 1) 05H hero GLBs exist + are non-trivial
for (const f of ['electric_hero_05h.glb', 'electric_hero_05h_LOD1.glb', 'electric_hero_05h_LOD2.glb', 'electric_hero_05h_COL.glb'])
  ok(existsSync(CH + f) && statSync(CH + f).size > 2000, `missing/empty 05H hero GLB: ${f}`)

// 2) manifest: Blender-side validation passed + budgets + monotonic LODs + 65 joints
const man = JSON.parse(readFileSync(ROOT + 'manifests/hero-05h.json', 'utf8'))
ok(man.ok === true, `05H hero validation not OK: ${JSON.stringify(man.issues)}`)
ok(man.milestone === 'asset-lab-05h', `manifest milestone not asset-lab-05h: ${man.milestone}`)
ok(man.bones === 65, `expected 65 joints, got ${man.bones}`)
ok(man.height >= 1.70 && man.height <= 1.95, `height out of range: ${man.height}`)
ok(man.lod0_tris <= 26000, `LOD0 tris over budget: ${man.lod0_tris}`)   // authored base + garment shells
ok(man.lod0_tris > man.lod1_tris && man.lod1_tris > man.lod2_tris, 'LOD tris not monotonically decreasing')

// 3) ADDITIVE: 05G, 05F, and 05E Electric GLBs all remain present (never overwritten/removed)
for (const f of ['electric_hero_05g.glb', 'electric_hero_05f.glb', 'Char_Electric_Heavy.glb'])
  ok(existsSync(CH + f), `prior hero/role GLB missing (05H must be additive): ${f}`)

// 4) provenance preserved (CC0 license + machine record + committed base mesh)
for (const f of ['licenses/asset-lab-05h/CC0-1.0.txt', 'licenses/asset-lab-05h/PROVENANCE.json',
                 'licenses/asset-lab-05h/human_base_male_stylized_cc0.glb'])
  ok(existsSync(ROOT + f), `provenance evidence missing: ${f}`)
const prov = JSON.parse(readFileSync(ROOT + 'licenses/asset-lab-05h/PROVENANCE.json', 'utf8'))
ok(prov.license?.id === 'CC0-1.0', `provenance license not CC0-1.0: ${prov.license?.id}`)
ok(prov.provenance_verdict?.startsWith('PASS'), `provenance verdict not PASS: ${prov.provenance_verdict}`)

// 5) 05H review-harness comparison cameras present (the 27 named 05H views wired in cameraBridge)
const bridge = readFileSync(ROOT + 'src/lab/cameraBridge.ts', 'utf8')
const REQUIRED = [
  '05H/05G Hero — Front', '05H/05H Hero — Front', '05H/05G Hero — Back', '05H/05H Hero — Back',
  '05H/Side-by-Side Front', '05H/Side-by-Side Back', '05H/Side-by-Side Side', '05H/Side-by-Side Three-Quarter',
  '05H/Shoulder Front', '05H/Shoulder Back', '05H/Vest Front', '05H/Vest Back', '05H/Vest Side',
  '05H/Pelvis Front', '05H/Pelvis Back', '05H/Pelvis Side', '05H/Hand', '05H/Boot',
  '05H/Walk', '05H/Talk', '05H/Kneeling', '05H/Pickup', '05H/Sitting',
  '05H/LOD', '05H/Management Distance', '05H/Human Scale', '05H/Wireframe']
for (const c of REQUIRED) ok(bridge.includes(`'${c}'`), `05H review camera missing: ${c}`)
const harness = readFileSync(ROOT + 'src/components/reviewHarness.tsx', 'utf8')
ok(harness.includes('electric_hero_05h.glb'), 'reviewHarness does not reference the 05H hero GLB')
for (const k of ['hero05hcompare', 'hero05hsingle', 'hero05hlod'])
  ok(harness.includes(k), `reviewHarness does not dispatch 05H kind: ${k}`)

// 6) evidence present
for (const d of ['workflow-audit', 'iteration-01', 'iteration-02'])
  ok(existsSync(ROOT + `proof/lab05h/${d}`), `evidence dir missing: proof/lab05h/${d}`)

console.log(`05H hero: LOD0/1/2 = ${man.lod0_tris}/${man.lod1_tris}/${man.lod2_tris} tris  height=${man.height}  bones=${man.bones}`)
if (fails.length) { console.log('HERO_05H_VALIDATE_FAIL\n  - ' + fails.join('\n  - ')); process.exit(1) }
console.log(`HERO_05H_VALIDATE_OK — ${REQUIRED.length} review cameras, additive (05G/05F/05E intact), CC0 provenance PASS, budgets in range`)
