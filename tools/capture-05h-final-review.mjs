// Asset Lab 05H FINAL OWNER REVIEW — comprehensive visual evidence capture (§4 matched, §5 human-scale,
// §6 animation, §7 LOD, §8 fixed-isometric management camera). Renders the SHIPPED 05H GLB in the runtime
// harness (the same neutral-review env used for the 05E/05F/05G reviews). Headless Chrome + SwiftShader is
// DIAGNOSTIC/VISUAL software raster — this is a GEOMETRY & APPEARANCE proof, NOT a performance measurement
// (real-GPU perf is perf-05h-realgpu.mjs). Honest evidence: it shows defects as faithfully as strengths.
//
// Run:  npx vite --port 4321 --strictPort   (another shell), then:  node tools/capture-05h-final-review.mjs
import puppeteer from 'puppeteer-core'
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const TARGET = process.env.LAB_URL ?? 'http://localhost:4321/'
const ROOT = fileURLToPath(new URL('../proof/lab05h/final-owner-review/', import.meta.url))
const CHROME = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const dir = (d) => { const p = ROOT + d + '/'; mkdirSync(p, { recursive: true }); return p }

const browser = await puppeteer.launch({
  executablePath: CHROME, headless: 'new',
  args: ['--headless=new', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--enable-webgl', '--ignore-gpu-blocklist', '--no-sandbox'],
})
let hadError = false
const page = await browser.newPage()
page.on('pageerror', (e) => { hadError = true; console.log('  [pageerror]', e.message) })
page.on('console', (m) => { if (m.type() === 'error') { const t = m.text(); if (!/favicon|404/.test(t)) { hadError = true; console.log('  [console.error]', t) } } })
const call = (fn, ...a) => page.evaluate((f, args) => window.__lab[f](...args), fn, a)
const set = (k, v) => call('set', k, v)
const view = (pos, tgt) => call('view', pos, tgt)
const shotTo = async (d, n) => { const c = await page.$('#root canvas'); await c.screenshot({ path: dir(d) + n }); console.log('  ✓', d + '/' + n) }

await page.setViewport({ width: 1600, height: 1000, deviceScaleFactor: 2 })
console.log('loading', TARGET)
await page.goto(TARGET, { waitUntil: 'networkidle0', timeout: 60000 })
await page.waitForFunction('!!window.__lab', { timeout: 30000 })
const renderer = await page.evaluate(() => { try { const c = document.createElement('canvas'); const gl = c.getContext('webgl'); const e = gl.getExtension('WEBGL_debug_renderer_info'); return e ? gl.getParameter(e.UNMASKED_RENDERER_WEBGL) : '?' } catch { return '?' } })
console.log('  renderer:', renderer)
await call('setScene', 'G'); await sleep(500)
await page.waitForFunction('window.__lab.ready()', { timeout: 60000 }).catch(() => console.log('  (ready timeout)'))
await set('showHud', false)

// ---------- §4 MATCHED 05G↔05H comparison: 6 matched framings on the same compare scene ----------
console.log('\n§4 matched-comparison')
await call('setReview', '05H/Side-by-Side Front'); await sleep(1000)
const MATCHED = [
  ['front.png', [0, 1.35, 5.2], [0, 0.95, 0]],
  ['rear.png', [0, 1.35, -5.2], [0, 0.95, 0]],
  ['left-side.png', [-5.6, 1.35, 0.6], [0, 0.95, 0]],
  ['right-side.png', [5.6, 1.35, 0.6], [0, 0.95, 0]],
  ['front-three-quarter.png', [4.6, 2.1, 5.0], [0, 0.95, 0]],
  ['rear-three-quarter.png', [-4.6, 2.1, -5.0], [0, 0.95, 0]],
]
for (const [n, pos, tgt] of MATCHED) { await view(pos, tgt); await sleep(700); await shotTo('matched-comparison', n) }

// ---------- §5 HUMAN-SCALE: pose set (available clips) + structural close-ups ----------
console.log('\n§5 human-scale')
const HUMAN_POSES = [
  ['pose-neutral-idle.png', '05H/05H Hero — Front'],
  ['pose-walk.png', '05H/Walk'], ['pose-talk.png', '05H/Talk'],
  ['pose-kneeling.png', '05H/Kneeling'], ['pose-pickup.png', '05H/Pickup'], ['pose-seated.png', '05H/Sitting'],
]
for (const [n, v] of HUMAN_POSES) { await call('setReview', v); await sleep(1200); await shotTo('human-scale', n) }
const CLOSEUPS = [
  ['closeup-shoulder-front.png', '05H/Shoulder Front'], ['closeup-shoulder-back.png', '05H/Shoulder Back'],
  ['closeup-vest-front.png', '05H/Vest Front'], ['closeup-vest-side.png', '05H/Vest Side'],
  ['closeup-pelvis-front.png', '05H/Pelvis Front'], ['closeup-pelvis-back.png', '05H/Pelvis Back'],
  ['closeup-hand.png', '05H/Hand'], ['closeup-boot.png', '05H/Boot'],
]
for (const [n, v] of CLOSEUPS) { await call('setReview', v); await sleep(1000); await shotTo('human-scale', n) }

// ---------- §6 ANIMATION: 6 clips, front-3q + side + a live frame sequence per clip ----------
console.log('\n§6 animation')
const CLIPS = [
  ['idle', '05H/05H Hero — Front', null], ['walk', '05H/Walk', 'Walk_Loop'], ['talk', '05H/Talk', 'Idle_Talking_Loop'],
  ['kneeling', '05H/Kneeling', 'Fixing_Kneeling'], ['pickup', '05H/Pickup', 'PickUp_Table'], ['sitting', '05H/Sitting', 'Sitting_Idle_Loop'],
]
for (const [name, v] of CLIPS) {
  await call('setReview', v); await sleep(1200)
  await shotTo('animation/' + name, 'front-3q.png')
  await view([5.4, 1.5, 1.2], [0, 0.95, 0]); await sleep(700); await shotTo('animation/' + name, 'side.png')
  await view([4.4, 1.8, 5.2], [-0.1, 0.95, 0]); await sleep(400)
  for (let i = 0; i < 20; i++) { await sleep(90); await shotTo('animation/' + name + '/seq', `f${String(i).padStart(2, '0')}.png`) }
}

// ---------- §7 LOD at three distances ----------
console.log('\n§7 lod')
await call('setReview', '05H/LOD'); await sleep(1200)
for (const [n, pos, tgt] of [
  ['lod-human-distance.png', [0, 1.45, 6.0], [0, 0.95, 0]],
  ['lod-moderate-distance.png', [0, 1.7, 9.5], [0, 0.95, 0]],
  ['lod-management-distance.png', [0, 2.2, 15], [0, 0.95, 0]],
]) { await view(pos, tgt); await sleep(700); await shotTo('lod', n) }

// ---------- §8 MANAGEMENT CAMERA (Question B) ----------
console.log('\n§8 management-camera')
const MGMT_VIEWS = ['Mgmt/One Worker + Stage', 'Mgmt/Two Workers + Cart', 'Mgmt/Four Workers + Stage',
  'Mgmt/Walking Service Area', 'Mgmt/Seated Worker', 'Mgmt/Kneeling Worker', 'Mgmt/Four Workers (Iso 30°)', 'Mgmt/Four Workers (Iso 45°)']
const slug = (s) => s.replace('Mgmt/', '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
// per-vignette, default worker (05h)
await set('mgmtWorker', ''); await set('mgmtZoomMul', 1); await set('reducedMotion', false)
for (const v of MGMT_VIEWS) { await call('setReview', v); await sleep(1300); await shotTo('management-camera/vignettes', slug(v) + '.png') }
// value comparison — worker source on 2 representative vignettes
for (const v of ['Mgmt/Four Workers + Stage', 'Mgmt/One Worker + Stage']) {
  for (const w of ['', '05g', 'sprite', 'none']) {
    await set('mgmtWorker', w); await call('setReview', v); await sleep(1300)
    await shotTo('management-camera/value', `${slug(v)}--${w || '05h'}.png`)
  }
}
await set('mgmtWorker', '')
// framing sweep on the busiest vignette
for (const [lbl, m] of [['wide', 0.55], ['default', 1], ['tight', 1.7]]) {
  await set('mgmtZoomMul', m); await call('setReview', 'Mgmt/Four Workers + Stage'); await sleep(1200)
  await shotTo('management-camera/framing', `four-${lbl}.png`)
}
await set('mgmtZoomMul', 1)
// reduced-motion vs normal (static freeze)
for (const rm of [false, true]) {
  await set('reducedMotion', rm); await call('setReview', 'Mgmt/Walking Service Area'); await sleep(1300)
  await shotTo('management-camera/reduced-motion', `walk-${rm ? 'reduced' : 'normal'}.png`)
}
await set('reducedMotion', false)
// resolution sweep (true pixels: dpr 1 at each resolution; 125% = dpr 1.25 on a 1536-wide layout)
console.log('  resolution sweep')
const RES = [[1920, 1080, 1, '1920x1080'], [1440, 900, 1, '1440x900'], [1366, 768, 1, '1366x768'], [1280, 720, 1, '1280x720'], [1536, 864, 1.25, '125pct-zoom']]
for (const [w, h, d, tag] of RES) {
  await page.setViewport({ width: w, height: h, deviceScaleFactor: d })
  await call('setReview', 'Mgmt/Four Workers + Stage'); await sleep(1100)
  await shotTo('management-camera/resolution', `four-${tag}.png`)
}
await page.setViewport({ width: 1600, height: 1000, deviceScaleFactor: 2 })

const errCount = await page.evaluate(() => window.__lab.getErrorCount())
writeFileSync(ROOT + 'capture-meta.json', JSON.stringify({
  renderer, isSoftware: /swiftshader|software|llvmpipe/i.test(renderer),
  note: 'Visual/geometry proof under SwiftShader software raster (deterministic). NOT a performance measurement; see performance/ for real-GPU (Apple M3 Max) results.',
  consoleErrorFree: !hadError && errCount === 0, errorCount: errCount,
}, null, 2) + '\n')
console.log(`\nrenderer=${renderer}\nconsole-error-free: ${!hadError && errCount === 0} (errorCount=${errCount})`)
await browser.close()
if (hadError || errCount > 0) process.exit(1)
