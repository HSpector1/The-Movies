// Asset Lab 05I Iteration 1 — capture the matched 05H↔05I comparison evidence (owner ruling §5).
// Renders the SHIPPED electric_hero_05i.glb next to 05h in the runtime harness. Headless Chrome +
// SwiftShader = deterministic VISUAL/geometry proof (same convention as 05E–05H); real-GPU close-ups +
// perf are captured separately by perf-05h-realgpu-style runs. Run:
//   npx vite --port 4321 --strictPort   (another shell), then:  node tools/capture-05i-review.mjs
import puppeteer from 'puppeteer-core'
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const TARGET = process.env.LAB_URL ?? 'http://localhost:4321/'
const OUT = process.env.OUT_DIR ?? fileURLToPath(new URL('../proof/lab05i/iteration-01/runtime/', import.meta.url))
const CHROME = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
mkdirSync(OUT, { recursive: true })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const slug = (s) => s.replace('05I/', '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

// the 25 owner-required views (15 static + 6 clips + 3 distances + wireframe) — from G_HERO_05I_ORDER
const VIEWS = [
  '05I/05H Hero — Front', '05I/05I Hero — Front', '05I/Side-by-Side Front', '05I/Side-by-Side Rear',
  '05I/Side-by-Side Left', '05I/Side-by-Side Right', '05I/Front Three-Quarter', '05I/Rear Three-Quarter',
  '05I/Face', '05I/Shoulder & Neck', '05I/Shirt & Vest Front', '05I/Vest Side & Wrap', '05I/Pelvis & Seat',
  '05I/Boots & Feet', '05I/Hard Hat', '05I/Walk', '05I/Talk', '05I/Kneeling', '05I/Pickup', '05I/Sitting',
  '05I/LOD', '05I/Human Distance', '05I/Moderate Distance', '05I/Management Distance',
]
const ANIM = new Set(['05I/Walk', '05I/Talk', '05I/Kneeling', '05I/Pickup', '05I/Sitting'])
const NEUTRAL = ['05I/Side-by-Side Front', '05I/Shirt & Vest Front', '05I/Face']   // §7 neutral-light material review

const browser = await puppeteer.launch({
  executablePath: CHROME, headless: 'new',
  args: ['--headless=new', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--enable-webgl', '--ignore-gpu-blocklist', '--no-sandbox'],
})
let hadError = false
const page = await browser.newPage()
page.on('pageerror', (e) => { hadError = true; console.log('  [pageerror]', e.message) })
page.on('console', (m) => { if (m.type() === 'error') { const t = m.text(); if (!/favicon|404/.test(t)) { hadError = true; console.log('  [console.error]', t) } } })
await page.setViewport({ width: 1600, height: 1000, deviceScaleFactor: 2 })
const call = (fn, ...a) => page.evaluate((f, args) => window.__lab[f](...args), fn, a)
const set = (k, v) => call('set', k, v)
const shot = async (n) => { const c = await page.$('#root canvas'); await c.screenshot({ path: OUT + n }); console.log('  ✓', n) }

await page.goto(TARGET, { waitUntil: 'networkidle0', timeout: 60000 })
await page.waitForFunction('!!window.__lab', { timeout: 30000 })
const renderer = await page.evaluate(() => { try { const c = document.createElement('canvas'); const g = c.getContext('webgl'); const e = g.getExtension('WEBGL_debug_renderer_info'); return e ? g.getParameter(e.UNMASKED_RENDERER_WEBGL) : '?' } catch { return '?' } })
console.log('renderer:', renderer)
await call('setScene', 'G'); await sleep(500)
await page.waitForFunction('window.__lab.ready()', { timeout: 60000 }).catch(() => console.log('  (ready timeout)'))
await set('showHud', false)

for (const v of VIEWS) { await call('setReview', v); await sleep(ANIM.has(v) ? 1500 : 1100); await shot(`${String(VIEWS.indexOf(v) + 1).padStart(2, '0')}-${slug(v)}.png`) }
// wireframe / topology-honesty view (#15 required)
await set('wireframe', true); await call('setReview', '05I/Wireframe'); await sleep(1100); await shot('25-wireframe.png'); await set('wireframe', false)
// §7 neutral-light material review
await set('neutralEval', true)
for (const v of NEUTRAL) { await call('setReview', v); await sleep(1100); await shot(`neutral-${slug(v)}.png`) }
await set('neutralEval', false)

const errCount = await page.evaluate(() => window.__lab.getErrorCount())
writeFileSync(OUT + 'capture-meta.json', JSON.stringify({
  renderer, isSoftware: /swiftshader|software|llvmpipe/i.test(renderer),
  note: 'Visual/geometry proof under SwiftShader software raster (deterministic). Real-GPU close-ups captured separately.',
  consoleErrorFree: !hadError && errCount === 0, errorCount: errCount,
}, null, 2) + '\n')
console.log(`\nrenderer=${renderer}\nconsole-error-free: ${!hadError && errCount === 0} (errorCount=${errCount})`)
await browser.close()
if (hadError || errCount > 0) process.exit(1)
