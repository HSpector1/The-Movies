// Asset Lab 02 evidence capture (contract §10) + performance configs (§9). Stored SEPARATELY
// from Lab 01 evidence, in proof/lab02/. Headless Chrome + SwiftShader, driving window.__lab.
//   node tools/capture-lab02.mjs      (needs `npm run preview` on :4320)
import puppeteer from 'puppeteer-core'
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const TARGET = process.env.LAB_URL ?? 'http://localhost:4320/'
const OUT = fileURLToPath(new URL('../proof/lab02/', import.meta.url))
const CHROME = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
mkdirSync(OUT, { recursive: true })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// Scene-D framings (mirror src/lab/cameraBridge.ts + a few extra for evidence).
const V = {
  overview: [[42, 34, 48], [2, 2, -1]],
  entrance: [[1, 6, 42], [-2, 4, 18]],
  office: [[-4, 6, 13], [-15, 3.5, 1]],
  soundstage: [[-8, 11, 8], [8, 6, -14]],
  courtyard: [[17, 8, 23], [3, 1.5, 2]],
  human: [[-3.5, 1.75, 11], [3, 1.4, 2]],
  workers: [[-4, 2.6, 11], [3, 1.3, 1]],
  backlot: [[13, 7, 3], [24, 3, -12]],
  lab01overview: [[34, 46, 44], [0, 0, -5]],
  materialA: [[7, 2.6, 5], [0, 0.3, -2]],
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

// GPU / renderer detection (§9)
const renderer = await page.evaluate(() => {
  try { const c = document.createElement('canvas'); const gl = c.getContext('webgl'); const ext = gl.getExtension('WEBGL_debug_renderer_info'); return ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : 'unknown' } catch { return 'unavailable' }
})
const isSoftware = /swiftshader|software|llvmpipe/i.test(renderer)
console.log('  renderer:', renderer, '=> software:', isSoftware)

const call = (fn, ...a) => page.evaluate((f, args) => window.__lab[f](...args), fn, a)
const set = (k, v) => call('set', k, v)
const view = (name) => call('view', V[name][0], V[name][1])
const shotCanvas = async (n) => { const c = await page.$('#root canvas'); await c.screenshot({ path: OUT + n }); console.log('  ✓', n) }
const shotPage = async (n) => { await page.screenshot({ path: OUT + n }); console.log('  ✓', n) }
const getStats = () => page.evaluate(() => window.__lab.getStats())

async function toScene(key, settle = 2200) {
  await call('setScene', key); await sleep(400)
  await page.waitForFunction('window.__lab.ready()', { timeout: 45000 }).catch(() => console.log('  (ready timeout ' + key + ')'))
  await sleep(settle)
}

// ---- Scene D: the studio greybox ----
await toScene('D', 2600)
const loadMs = Date.now() - t0
await view('overview'); await sleep(1000); await shotCanvas('01-studio-overview.png')
await view('entrance'); await sleep(800); await shotCanvas('02-entrance.png')
await view('office'); await sleep(800); await shotCanvas('03-office.png')
await view('soundstage'); await sleep(800); await shotCanvas('04-soundstage.png')
await view('courtyard'); await sleep(800); await shotCanvas('05-courtyard.png')
await view('human'); await sleep(800); await shotCanvas('06-human-scale.png')
await view('workers'); await sleep(1200); await shotCanvas('07-workers.png')
await view('backlot'); await sleep(800); await shotCanvas('08-backlot.png')
await view('overview'); await sleep(500); await shotPage('10-performance-panel.png')
await set('wireframe', true); await view('overview'); await sleep(900); await shotCanvas('11-wireframe.png'); await set('wireframe', false)

// ---- performance configs (§9) ----
const perf = []
const sample = async (label, animActive) => { const s = await getStats(); perf.push({ label, ...s, activeAnimations: animActive, renderer, isSoftware }); console.log(`  perf[${label}] fps=${s.fps} draws=${s.drawCalls} tris=${s.triangles} geos=${s.geometries} texs=${s.textures} loaded=${s.loadedAssets}`) }
await view('overview'); await sleep(600); await sample('D/overview-all', 9)
await set('showCharacters', false); await sleep(700); await sample('D/overview-no-characters', 0)
await set('showCharacters', true); await set('showShadows', false); await sleep(700); await sample('D/overview-no-shadows', 9)
await set('showShadows', true); await view('human'); await sleep(700); await sample('D/human-scale', 9)
// scene-switch timing
const swT = Date.now(); await call('setScene', 'A'); await page.waitForFunction('window.__lab.ready()', { timeout: 30000 }).catch(() => {}); await sleep(200)
const switchMs = Date.now() - swT

// ---- material before/after (Scene A now uses the vertex-color fix) ----
await view('materialA'); await sleep(900); await shotCanvas('09-material-after.png')
await view('lab01overview'); await sleep(900); await shotCanvas('12-lab01-overview.png')

writeFileSync(OUT + 'performance-lab02.json', JSON.stringify({
  tool: 'capture-lab02',
  note: 'Diagnostic only — headless SwiftShader software rendering, NOT target-hardware acceptance (§9). Real-GPU numbers require an owner-observed run.',
  renderer, isSoftware, viewport: { width: 1600, height: 1000, dpr: 2 },
  initialLoadMs: loadMs, sceneSwitchMs: switchMs, samples: perf,
}, null, 2) + '\n')
console.log('\nwrote proof/lab02/performance-lab02.json ; loadMs=' + loadMs + ' switchMs=' + switchMs + ' ; console-error-free:', !hadError)
await browser.close()
process.exit(hadError ? 2 : 0)
