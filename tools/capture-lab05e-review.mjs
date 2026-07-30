// Asset Lab 05E — OWNER REVIEW HARNESS capture. Drives every Scene-G character-review camera and
// records the evidence set + a sustained-FPS probe. Headless Chrome + SwiftShader is DIAGNOSTIC
// ONLY (software raster) — real-hardware acceptance is the owner's Apple M3 pass. Run:
//   npx vite --port 4321 --strictPort   (another shell), then:  node tools/capture-lab05e-review.mjs
import puppeteer from 'puppeteer-core'
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const TARGET = process.env.LAB_URL ?? 'http://localhost:4321/'
const OUT = process.env.OUT_DIR ?? fileURLToPath(new URL('../proof/lab05e/review-harness/', import.meta.url))
const CHROME = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
mkdirSync(OUT, { recursive: true })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

const VIEWS = [
  'Crew Lineup Front', 'Crew Lineup Back', 'Crew Lineup Left', 'Crew Lineup Right',
  'Crew Three-Quarter Front', 'Crew Three-Quarter Back', 'Role Comparison',
  'Faces and Hair', 'Hands', 'Feet and Shoes', 'Torso and Vest', 'Pelvis and Hips — Front', 'Pelvis and Hips — Back',
  'Walk', 'Idle Talking', 'Kneeling', 'Pickup', 'Sitting',
  'LOD0 Comparison', 'LOD1 Comparison', 'LOD2 Comparison',
  'Management Distance', 'Human Scale', 'Refined Lot Scale Reference', 'Full Scene Overview',
]
const PERF_VIEWS = ['Full Scene Overview', 'Crew Lineup Front', 'Walk', 'LOD0 Comparison']

const browser = await puppeteer.launch({
  executablePath: CHROME, headless: 'new',
  args: ['--headless=new', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
    '--enable-webgl', '--ignore-gpu-blocklist', '--no-sandbox'],
})
let hadError = false
const page = await browser.newPage()
page.on('pageerror', (e) => { hadError = true; console.log('  [pageerror]', e.message) })
page.on('console', (m) => { if (m.type() === 'error') { const t = m.text(); if (!/favicon|404/.test(t)) { hadError = true; console.log('  [console.error]', t) } } })
await page.setViewport({ width: 1600, height: 1000, deviceScaleFactor: 2 })

const call = (fn, ...a) => page.evaluate((f, args) => window.__lab[f](...args), fn, a)
const set = (k, v) => call('set', k, v)
const shotCanvas = async (n) => { const c = await page.$('#root canvas'); await c.screenshot({ path: OUT + n }); console.log('  ✓', n) }
const shotFull = async (n) => { await page.screenshot({ path: OUT + n }); console.log('  ✓', n) }

console.log('loading', TARGET)
await page.goto(TARGET, { waitUntil: 'networkidle0', timeout: 60000 })
await page.waitForFunction('!!window.__lab', { timeout: 30000 })
const renderer = await page.evaluate(() => { try { const c = document.createElement('canvas'); const gl = c.getContext('webgl'); const ext = gl.getExtension('WEBGL_debug_renderer_info'); return ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : 'unknown' } catch { return 'unavailable' } })
console.log('  renderer:', renderer)

await call('setScene', 'G')
await sleep(500)
await page.waitForFunction('window.__lab.ready()', { timeout: 60000 }).catch(() => console.log('  (ready timeout)'))

// ---- evidence set: every review camera, clean (HUD off; in-canvas labels still render) ----
await set('showHud', false)
for (const v of VIEWS) {
  await call('setReview', v)
  await sleep(v === 'Walk' || v === 'Idle Talking' || v === 'Pickup' || v === 'Kneeling' || v === 'Sitting' ? 1500 : 1100)
  await shotCanvas(`${String(VIEWS.indexOf(v) + 1).padStart(2, '0')}-${slug(v)}.png`)
}

// ---- status/performance panel shot (HUD on) on a lineup ----
await call('setReview', 'Crew Lineup Front')
await set('showHud', true)
await sleep(900)
await shotFull('26-review-status-panel.png')

// ---- sustained-FPS probe (>=20s per view). SwiftShader => diagnostic; draws/tris are meaningful ----
await set('showHud', false)
const perf = { renderer, isSoftware: /swiftshader|software|llvmpipe/i.test(renderer), note: 'SwiftShader software raster — FPS is DIAGNOSTIC ONLY, not Apple M3 acceptance. draw calls / triangles are hardware-independent.', views: {} }
for (const v of PERF_VIEWS) {
  await call('setReview', v)
  await sleep(1500)
  console.log(`  perf-probe ${v} (20s)...`)
  const r = await page.evaluate((secs) => window.__lab.perfProbe(secs), 20)
  perf.views[v] = r
  console.log(`    fps min/median/steady = ${r.min}/${r.median}/${r.steadyState} · draws=${r.drawCalls} tris/frame=${r.triangles}`)
}
writeFileSync(OUT + 'performance.json', JSON.stringify(perf, null, 2) + '\n')

const errCount = await page.evaluate(() => window.__lab.getErrorCount())
console.log(`\nwrote ${OUT} ; console-error-free: ${!hadError && errCount === 0} (in-page errorCount=${errCount})`)
await browser.close()
