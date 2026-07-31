// Asset Lab 05G — capture the in-engine 05F-hero <-> 05G-hero comparison harness (Scene-G "05G Hero"
// group) + a sustained-FPS probe. Headless Chrome + SwiftShader is DIAGNOSTIC ONLY (software raster);
// real-hardware acceptance is the owner's Apple M3 pass. Run:
//   npx vite --port 4321 --strictPort   (another shell), then:  node tools/capture-lab05g-review.mjs
import puppeteer from 'puppeteer-core'
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const TARGET = process.env.LAB_URL ?? 'http://localhost:4321/'
const OUT = process.env.OUT_DIR ?? fileURLToPath(new URL('../proof/lab05g/runtime/', import.meta.url))
const CHROME = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
mkdirSync(OUT, { recursive: true })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

const VIEWS = [
  '05G/05F Hero — Front', '05G/05G Hero — Front', '05G/05F Hero — Back', '05G/05G Hero — Back',
  '05G/Side-by-Side Front', '05G/Side-by-Side Back', '05G/Side-by-Side Side', '05G/Side-by-Side Three-Quarter',
  '05G/Shoulder Front', '05G/Shoulder Back', '05G/Vest Front', '05G/Vest Back', '05G/Vest Side',
  '05G/Pelvis Front', '05G/Pelvis Back', '05G/Pelvis Side',
  '05G/Walk', '05G/Talk', '05G/Kneeling', '05G/Pickup', '05G/Sitting',
  '05G/LOD', '05G/Management Distance', '05G/Human Scale',
]
const ANIM = new Set(['05G/Walk', '05G/Talk', '05G/Kneeling', '05G/Pickup', '05G/Sitting'])
const PERF = ['05G/Side-by-Side Front', '05G/Walk', '05G/LOD']

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
await call('setScene', 'G'); await sleep(500)
await page.waitForFunction('window.__lab.ready()', { timeout: 60000 }).catch(() => console.log('  (ready timeout)'))

// clean comparison shots (HUD off; in-canvas labels still render)
await set('showHud', false)
for (const v of VIEWS) {
  await call('setReview', v)
  await sleep(ANIM.has(v) ? 1500 : 1100)
  await shotCanvas(`${String(VIEWS.indexOf(v) + 1).padStart(2, '0')}-${slug(v)}.png`)
}
// wireframe comparison
await set('wireframe', true); await call('setReview', '05G/Wireframe'); await sleep(1100)
await shotCanvas('25-wireframe-comparison.png'); await set('wireframe', false)
// status/performance panel (HUD on) on the side-by-side
await call('setReview', '05G/Side-by-Side Front'); await set('showHud', true); await sleep(900)
await shotFull('26-review-status-panel.png')

// sustained-FPS probe (>=20s). SwiftShader => FPS diagnostic; draws/tris are meaningful.
await set('showHud', false)
const perf = { renderer, isSoftware: /swiftshader|software|llvmpipe/i.test(renderer), note: 'SwiftShader software raster — FPS is DIAGNOSTIC ONLY, not Apple M3 acceptance.', views: {} }
for (const v of PERF) {
  await call('setReview', v); await sleep(1500)
  console.log(`  perf-probe ${v} (20s)...`)
  const r = await page.evaluate((secs) => window.__lab.perfProbe(secs), 20)
  perf.views[v] = r
  console.log(`    fps min/median/steady=${r.min}/${r.median}/${r.steadyState} draws=${r.drawCalls} tris/frame=${r.triangles}`)
}
writeFileSync(OUT + 'performance.json', JSON.stringify(perf, null, 2) + '\n')
const errCount = await page.evaluate(() => window.__lab.getErrorCount())
console.log(`\nwrote ${OUT} ; console-error-free: ${!hadError && errCount === 0} (errorCount=${errCount})`)
await browser.close()
