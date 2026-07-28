// Asset Lab 04 evidence capture — REFINED STUDIO LOT (Scene F) + greybox⇄refined comparison.
// Stored SEPARATELY in proof/lab04/. Headless Chrome + SwiftShader, driving window.__lab.
// Deterministic core look (softShadows + postFx OFF).
//   node tools/capture-lab04.mjs      (needs `npm run preview` on :4320)
import puppeteer from 'puppeteer-core'
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const TARGET = process.env.LAB_URL ?? 'http://localhost:4320/'
const OUT = fileURLToPath(new URL('../proof/lab04/', import.meta.url))
const CHROME = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
mkdirSync(OUT, { recursive: true })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const F = {
  overview: [[90, 46, 96], [-4, 7, -10]],
  entrance: [[0, 9, 58], [0, 6, 6]],
  stagerow: [[54, 27, 24], [2, 9, -20]],
  avenue: [[58, 9, 13], [-38, 4, -2]],
  backlot: [[54, 15, 6], [40, 4, -14]],
  commissary: [[42, 13, 34], [22, 4, 12]],
  watertower: [[-14, 17, 8], [-42, 9, -16]],
  mill: [[-34, 15, -6], [-40, 8, -27]],   // south, elevated → the sawtooth north-light ridge in silhouette
  human: [[9, 1.75, 22], [0, 1.5, 10]],
}
const D = { overview: [[42, 34, 48], [2, 2, -1]] }   // Lab 02 greybox lot for comparison

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

const t0 = Date.now()
await page.goto(TARGET, { waitUntil: 'networkidle0', timeout: 45000 })
await page.waitForFunction('!!window.__lab', { timeout: 20000 })
const renderer = await page.evaluate(() => { try { const c = document.createElement('canvas'); const gl = c.getContext('webgl'); const ext = gl.getExtension('WEBGL_debug_renderer_info'); return ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : 'unknown' } catch { return 'unavailable' } })
const isSoftware = /swiftshader|software|llvmpipe/i.test(renderer)
console.log('  renderer:', renderer, '=> software:', isSoftware)
const call = (fn, ...a) => page.evaluate((f, args) => window.__lab[f](...args), fn, a)
const set = (k, v) => call('set', k, v)
const view = (v) => call('view', v[0], v[1])
const shot = async (n) => { const c = await page.$('#root canvas'); await c.screenshot({ path: OUT + n }); console.log('  ✓', n) }
const shotPage = async (n) => { await page.screenshot({ path: OUT + n }); console.log('  ✓', n) }
const getStats = () => page.evaluate(() => window.__lab.getStats())
async function toScene(k, settle = 2800) { await call('setScene', k); await sleep(400); await page.waitForFunction('window.__lab.ready()', { timeout: 45000 }).catch(() => console.log('  (ready timeout ' + k + ')')); await sleep(settle) }

// ---- Scene F — refined lot (deterministic core look) ----
await toScene('F', 3000)
await set('softShadows', false); await set('postFx', false); await sleep(700)
const loadMs = Date.now() - t0
await view(F.overview); await sleep(1100); await shot('01-overview.png')
await view(F.entrance); await sleep(900); await shot('02-entrance.png')
await view(F.stagerow); await sleep(900); await shot('03-stage-row.png')
await view(F.avenue); await sleep(900); await shot('04-avenue.png')
await view(F.backlot); await sleep(900); await shot('05-backlot.png')
await view(F.commissary); await sleep(900); await shot('06-commissary.png')
await view(F.watertower); await sleep(900); await shot('07-water-tower.png')
await view(F.mill); await sleep(900); await shot('08-mill.png')
await view(F.human); await sleep(900); await shot('09-human-scale.png')

// ---- silhouette proof (wireframe) + layer breakdown ----
await view(F.overview); await set('wireframe', true); await sleep(1100); await shot('10-wireframe.png'); await set('wireframe', false)
await set('showDressing', false); await set('showCharacters', false); await sleep(900); await shot('11-architecture-only.png')
await set('showDressing', true); await set('showCharacters', true); await sleep(300)

// ---- greybox (D) ⇄ refined (F) comparison ----
await shot('12-refined-F.png')
await toScene('D', 2400); await view(D.overview); await sleep(1000); await shot('13-greybox-D.png')
await toScene('F', 2400)

// ---- perf ----
const perf = []
const sample = async (label) => { const s = await getStats(); perf.push({ label, ...s, renderer, isSoftware }); console.log(`  perf[${label}] fps=${s.fps} draws=${s.drawCalls} sceneTris=${s.sceneTriangles} meshes=${s.sceneMeshes}`) }
await view(F.overview); await sleep(1400); await sample('F/overview-all')
await set('showCharacters', false); await sleep(1400); await sample('F/no-crew')
await set('showDressing', false); await set('showLandscaping', false); await sleep(1400); await sample('F/architecture-only')
await set('showCharacters', true); await set('showDressing', true); await set('showLandscaping', true); await sleep(400)
await shotPage('14-panel.png')

writeFileSync(OUT + 'performance-lab04.json', JSON.stringify({
  tool: 'capture-lab04', note: 'Diagnostic only — headless SwiftShader software rendering, NOT target-hardware acceptance. Post FX/PCSS off for the deterministic core-look shots.',
  renderer, isSoftware, viewport: { width: 1600, height: 1000, dpr: 2 }, initialLoadMs: loadMs, samples: perf,
}, null, 2) + '\n')
console.log('\nwrote proof/lab04/performance-lab04.json ; loadMs=' + loadMs + ' ; console-error-free:', !hadError)
await browser.close()
process.exit(hadError ? 2 : 0)
