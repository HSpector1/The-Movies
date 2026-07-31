// Asset Lab 05G — hero regression guard (Node side). Complements the Blender-side charvalidate that
// runs in build_hero_export_05g (face -Y, 65 joints, height, grounded, no stray island). This checks the
// exported 05G artifacts + manifest + budgets + that the 05F hero AND 05E Electric were NOT overwritten
// (additive) + that the 05G review-harness comparison cameras exist. REGRESSION GUARD; it does not
// determine visual approval (the owner's real-GPU M3 pass does).
import { readFileSync, existsSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const CH = ROOT + 'public/assets/studio/characters/'
const fails = []
const ok = (c, m) => { if (!c) fails.push(m) }

// 1) 05G hero GLBs exist + are non-trivial
for (const f of ['electric_hero_05g.glb', 'electric_hero_05g_LOD1.glb', 'electric_hero_05g_LOD2.glb', 'electric_hero_05g_COL.glb'])
  ok(existsSync(CH + f) && statSync(CH + f).size > 2000, `missing/empty 05G hero GLB: ${f}`)

// 2) manifest: Blender-side validation passed + budgets + monotonic LODs
const man = JSON.parse(readFileSync(ROOT + 'manifests/hero-05g.json', 'utf8'))
ok(man.ok === true, `05G hero validation not OK: ${JSON.stringify(man.issues)}`)
ok(man.milestone === 'asset-lab-05g', `manifest milestone not asset-lab-05g: ${man.milestone}`)
ok(man.height >= 1.70 && man.height <= 1.95, `height out of range: ${man.height}`)
ok(man.lod0_tris <= 18000, `LOD0 tris over budget: ${man.lod0_tris}`)
ok(man.lod0_tris > man.lod1_tris && man.lod1_tris > man.lod2_tris, 'LOD tris not monotonically decreasing')

// 3) ADDITIVE: the accepted 05F hero GLBs remain present (never overwritten/removed)
for (const f of ['electric_hero_05f.glb', 'electric_hero_05f_LOD1.glb', 'electric_hero_05f_LOD2.glb'])
  ok(existsSync(CH + f), `05F hero GLB missing (must remain — 05G is additive): ${f}`)
// ...and so do the 05E Electric GLBs
for (const f of ['Char_Electric_Heavy.glb', 'Char_Electric_Heavy_LOD1.glb', 'Char_Electric_Heavy_LOD2.glb'])
  ok(existsSync(CH + f), `05E Electric GLB missing (must remain): ${f}`)

// 4) 05G review-harness comparison cameras present (the 25 named 05G views wired in cameraBridge)
const bridge = readFileSync(ROOT + 'src/lab/cameraBridge.ts', 'utf8')
const REQUIRED = [
  '05G/05F Hero — Front', '05G/05G Hero — Front', '05G/05F Hero — Back', '05G/05G Hero — Back',
  '05G/Side-by-Side Front', '05G/Side-by-Side Back', '05G/Side-by-Side Side', '05G/Side-by-Side Three-Quarter',
  '05G/Shoulder Front', '05G/Shoulder Back', '05G/Vest Front', '05G/Vest Back', '05G/Vest Side',
  '05G/Pelvis Front', '05G/Pelvis Back', '05G/Pelvis Side',
  '05G/Walk', '05G/Talk', '05G/Kneeling', '05G/Pickup', '05G/Sitting',
  '05G/LOD', '05G/Management Distance', '05G/Human Scale', '05G/Wireframe']
for (const c of REQUIRED) ok(bridge.includes(`'${c}'`), `05G review camera missing: ${c}`)
// the runtime must load the 05G hero GLB + dispatch the 05G view kinds
const harness = readFileSync(ROOT + 'src/components/reviewHarness.tsx', 'utf8')
ok(harness.includes('electric_hero_05g.glb'), 'reviewHarness does not reference the 05G hero GLB')
for (const k of ['hero05gcompare', 'hero05gsingle', 'hero05glod'])
  ok(harness.includes(k), `reviewHarness does not dispatch 05G kind: ${k}`)

// 5) evidence present (before + three iterations + final + runtime)
for (const d of ['baseline', 'iteration-01', 'iteration-02', 'iteration-03', 'final', 'runtime'])
  ok(existsSync(ROOT + `proof/lab05g/${d}`), `evidence dir missing: proof/lab05g/${d}`)

console.log(`05G hero: LOD0/1/2 = ${man.lod0_tris}/${man.lod1_tris}/${man.lod2_tris} tris  height=${man.height}  islands=${man.islands}`)
if (fails.length) { console.log('HERO_05G_VALIDATE_FAIL\n  - ' + fails.join('\n  - ')); process.exit(1) }
console.log(`HERO_05G_VALIDATE_OK — ${REQUIRED.length} review cameras, additive (05F hero + 05E Electric intact), budgets in range`)
