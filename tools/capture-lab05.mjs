// Asset Lab 05 evidence capture — BLENDER ART VERTICAL SLICE (Scene G). The set + crew are
// 100% Blender-authored; crew play CC0 clips retargeted onto the 65-bone rig. Headless Chrome +
// SwiftShader, driving window.__lab. Deterministic core look.
//   node tools/capture-lab05.mjs      (needs `npm run preview` on :4320)
import puppeteer from 'puppeteer-core'
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const TARGET = process.env.LAB_URL ?? 'http://localhost:4320/'
const OUT = fileURLToPath(new URL('../proof/lab05/', import.meta.url))
const CHROME = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
mkdirSync(OUT, { recursive: true })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// three.js-space camera presets (Blender +Y front -> three +Z; apron/crew at +Z)
const G = {
  overview: [[24, 14, 32], [0, 3, 4]],
  front:    [[0, 7, 30], [0, 4, 2]],
  crew:     [[0.5, 3.0, 19], [-0.5, 1.4, 10.5]],
  stage:    [[-16, 11, 20], [0, 6, 0]],
  gate:     [[0, 9, 34], [0, 4, 12]],
  tower:    [[-24, 12, 14], [-14, 6, 2]],
  human:    [[2, 1.75, 16.5], [-1, 1.45, 10.5]],
}

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
async function toScene(k, settle = 3200) { await call('setScene', k); await sleep(400); await page.waitForFunction('window.__lab.ready()', { timeout: 45000 }).catch(() => console.log('  (ready timeout ' + k + ')')); await sleep(settle) }

await toScene('G', 3600)
await set('softShadows', false); await set('postFx', false); await set('showHud', false); await sleep(700)
const loadMs = Date.now() - t0
await view(G.overview); await sleep(1200); await shot('01-overview.png')
await view(G.front);    await sleep(900);  await shot('02-front.png')
await view(G.stage);    await sleep(900);  await shot('03-soundstage.png')
await view(G.crew);     await sleep(1400); await shot('04-crew-working.png')   // crew mid-animation
await view(G.gate);     await sleep(900);  await shot('05-gate.png')
await view(G.tower);    await sleep(900);  await shot('06-water-tower.png')
await view(G.human);    await sleep(900);  await shot('07-human-scale.png')

// silhouette + layer breakdown
await view(G.overview); await set('wireframe', true); await sleep(1100); await shot('08-wireframe.png'); await set('wireframe', false)
await set('showCharacters', false); await sleep(900); await shot('09-set-only.png')
await set('showCharacters', true); await sleep(600); await shot('10-set-plus-crew.png')

// animation proof: same crew view sampled at two times to show clips are LIVE (not a static pose)
await view(G.crew); await sleep(200); await shot('11-anim-t0.png'); await sleep(1500); await shot('12-anim-t1.png')

// perf
const perf = []
const sample = async (label) => { const s = await getStats(); perf.push({ label, ...s, renderer, isSoftware }); console.log(`  perf[${label}] fps=${s.fps} draws=${s.drawCalls} sceneTris=${s.sceneTriangles} meshes=${s.sceneMeshes}`) }
await view(G.overview); await sleep(1400); await sample('G/overview-all')
await set('showCharacters', false); await sleep(1400); await sample('G/set-only')
await set('showCharacters', true); await sleep(600)
await set('showHud', true); await sleep(400)         // HUD back on for the panel evidence shot
await shotPage('13-panel.png')

writeFileSync(OUT + 'performance-lab05.json', JSON.stringify({
  tool: 'capture-lab05', note: 'Diagnostic only — headless SwiftShader software rendering, NOT target-hardware acceptance.',
  renderer, isSoftware, consoleErrorFree: !hadError, viewport: { width: 1600, height: 1000, dpr: 2 }, initialLoadMs: loadMs, samples: perf,
}, null, 2) + '\n')
console.log('\nwrote proof/lab05/performance-lab05.json ; loadMs=' + loadMs + ' ; console-error-free:', !hadError)
await browser.close()
process.exit(hadError ? 2 : 0)
