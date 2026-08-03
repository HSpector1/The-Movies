// Asset Lab 05H FINAL OWNER REVIEW — package-completeness validator.
// Asserts the review package is STRUCTURALLY COMPLETE and HONESTLY LABELED (it does NOT judge whether the
// 05H asset is good — that is the owner's visual call from the evidence). Verifies: the mgmt camera group is
// wired, the required evidence exists (matched / human-scale / animation / LOD / management / performance),
// reduced-motion + resolution + value-comparison evidence exist, the perf JSON carries its honest labels, the
// sprite exists, and additive integrity (05G/05F/05E hero GLBs intact) holds. Exit 1 on any failure.
import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('..', import.meta.url)) + '/'
const REV = ROOT + 'proof/lab05h/final-owner-review/'
const fails = []
const ok = []
const req = (cond, msg) => { (cond ? ok : fails).push(msg) }
const countPng = (d) => { try { return readdirSync(REV + d).filter((f) => f.endsWith('.png')).length } catch { return 0 } }
const has = (p) => existsSync(p.startsWith('/') ? p : ROOT + p)

// 1) mgmt camera group wired into the harness
try {
  const cb = readFileSync(ROOT + 'src/lab/cameraBridge.ts', 'utf8')
  const mgmt = (cb.match(/'Mgmt\//g) || []).length
  req(/export const G_MGMT/.test(cb) && mgmt >= 8, `mgmt camera group wired (G_MGMT, ${mgmt} 'Mgmt/' refs)`)
  req(/kind: 'mgmt'/.test(cb) || /\| 'mgmt'/.test(cb), "GReviewKind includes 'mgmt'")
} catch { fails.push('cameraBridge.ts unreadable') }
try {
  const rh = readFileSync(ROOT + 'src/components/reviewHarness.tsx', 'utf8')
  req(/ManagementCameraRig/.test(rh) && /OrthographicCamera/.test(rh), 'ManagementCameraRig (orthographic iso) present')
  req(/SpriteWorker/.test(rh) && /useTexture\.preload/.test(rh), 'SpriteWorker present + sprite preloaded')
} catch { fails.push('reviewHarness.tsx unreadable') }

// 2) required evidence
req(countPng('matched-comparison') >= 6, `§4 matched-comparison >= 6 (${countPng('matched-comparison')})`)
req(countPng('human-scale') >= 12, `§5 human-scale poses+closeups >= 12 (${countPng('human-scale')})`)
for (const clip of ['idle', 'walk', 'talk', 'kneeling', 'pickup', 'sitting']) {
  req(has(`proof/lab05h/final-owner-review/animation/${clip}/front-3q.png`), `§6 animation/${clip}/front-3q.png`)
  req(countPng(`animation/${clip}/seq`) >= 12, `§6 animation/${clip}/seq frames >= 12 (${countPng(`animation/${clip}/seq`)})`)
}
req(countPng('lod') >= 3, `§7 lod at 3 distances (${countPng('lod')})`)
req(countPng('management-camera/vignettes') >= 8, `§8 mgmt vignettes >= 8 (${countPng('management-camera/vignettes')})`)
req(countPng('management-camera/value') >= 8, `§8 mgmt value comparison (05g/05h/sprite/none) >= 8 (${countPng('management-camera/value')})`)
req(countPng('management-camera/framing') >= 3, `§8 mgmt framing sweep >= 3 (${countPng('management-camera/framing')})`)
req(countPng('management-camera/reduced-motion') >= 2, `§8 reduced-motion evidence >= 2 (${countPng('management-camera/reduced-motion')})`)
req(countPng('management-camera/resolution') >= 5, `§8 resolution sweep >= 5 (${countPng('management-camera/resolution')})`)
req(countPng('blender-stills') >= 6, `blender supplementary stills >= 6 (${countPng('blender-stills')})`)
req(has('public/assets/studio/review/05h_sprite.png'), 'pre-rendered iso sprite present (public/assets/studio/review/05h_sprite.png)')

// 3) capture meta honest + console-error-free
try {
  const cm = JSON.parse(readFileSync(REV + 'capture-meta.json', 'utf8'))
  req(cm.consoleErrorFree === true && cm.errorCount === 0, `visual capture console-error-free (errorCount=${cm.errorCount})`)
  req(typeof cm.note === 'string' && /NOT a performance/i.test(cm.note), 'capture-meta labels software-raster as non-performance')
} catch { fails.push('capture-meta.json missing/unparseable') }

// 4) real-GPU perf JSON present + honest labels
try {
  const pf = JSON.parse(readFileSync(REV + 'performance/realgpu-performance.json', 'utf8'))
  req(!!pf.renderer, `perf renderer recorded: ${pf.renderer?.slice(0, 60)}`)
  req(Array.isArray(pf.scenarios) && pf.scenarios.length >= 6, `perf scenarios >= 6 (${pf.scenarios?.length})`)
  req(!!pf.labels && /VRAM/i.test(JSON.stringify(pf.labels)), 'perf JSON labels heap-vs-VRAM + owner-required VRAM step')
  req(!!pf.mountUnmountCycles, 'perf mount/unmount disposal cycles recorded')
} catch { fails.push('performance/realgpu-performance.json missing/unparseable') }

// 5) additive integrity — predecessor + 05H hero GLBs intact
const CH = 'public/assets/studio/characters/'
for (const g of ['electric_hero_05h.glb', 'electric_hero_05g.glb', 'electric_hero_05f.glb', 'Char_Electric_Heavy.glb']) {
  req(has(CH + g), `additive: ${g} intact`)
}

// 6) docs
for (const d of ['ASSET-LAB-05H-FINAL-OWNER-REVIEW.md', 'ASSET-LAB-05H-MANAGEMENT-CAMERA-ASSESSMENT.md', 'ASSET-LAB-05H-REAL-GPU-PERFORMANCE.md', 'ASSET-LAB-05H-FALLBACK-ASSESSMENT.md', 'ASSET-LAB-05H-FINAL-ART-PM-RECOMMENDATION.md']) {
  req(has('docs/' + d), `doc present: ${d}`)
}
req(has('proof/lab05h/final-owner-review/index.html'), 'owner review index present')

console.log(`\n05H REVIEW PACKAGE VALIDATION`)
for (const m of ok) console.log('  ✓ ' + m)
for (const m of fails) console.log('  ✗ ' + m)
console.log(`\n${ok.length} passed, ${fails.length} failed`)
if (fails.length) { console.log('05H_REVIEW_PACKAGE_VALIDATE_FAIL'); process.exit(1) }
console.log('05H_REVIEW_PACKAGE_VALIDATE_OK')
