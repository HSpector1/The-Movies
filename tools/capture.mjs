// Evidence capture (contract §12). Drives the running Asset Lab in headless Chrome via
// window.__lab (mirrors the frozen 3D spike's window.__spike pattern) and writes proof/*.png
// plus proof/performance.json. Requires `npm run preview` (or dev) serving on :4320.
//   node tools/capture.mjs
import puppeteer from 'puppeteer-core'
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const TARGET = process.env.LAB_URL ?? 'http://localhost:4320/'
const OUT = fileURLToPath(new URL('../proof/', import.meta.url))
const CHROME = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
mkdirSync(OUT, { recursive: true })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--headless=new', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
    '--enable-webgl', '--ignore-gpu-blocklist', '--no-sandbox'],
})
let hadError = false
const page = await browser.newPage()
page.on('pageerror', (e) => { hadError = true; console.log('  [pageerror]', e.message) })
page.on('console', (m) => {
  if (m.type() === 'error') { const t = m.text(); if (!/favicon|404/.test(t)) { hadError = true; console.log('  [console.error]', t) } }
})
await page.setViewport({ width: 1600, height: 1000, deviceScaleFactor: 2 })
await page.goto(TARGET, { waitUntil: 'networkidle0', timeout: 45000 })
await page.waitForFunction('!!window.__lab', { timeout: 20000 })

const call = (fn, ...a) => page.evaluate((f, args) => window.__lab[f](...args), fn, a)
const shotCanvas = async (n) => { const c = await page.$('#root canvas'); await c.screenshot({ path: OUT + n }); console.log('  ✓', n) }
const shotPage = async (n) => { await page.screenshot({ path: OUT + n }); console.log('  ✓', n) }
const getStats = () => page.evaluate(() => window.__lab.getStats())

async function scene(key, { settle = 1600, timeout = 45000 } = {}) {
  await call('setScene', key)
  await sleep(400)
  await page.waitForFunction('window.__lab.ready()', { timeout }).catch(() => console.log('  (ready timeout on scene ' + key + ')'))
  await sleep(settle)
}
const view = (pos, tgt) => call('view', pos, tgt)

const perf = []
async function recordPerf(label) { const s = await getStats(); perf.push({ label, ...s }); console.log(`  perf[${label}] fps=${s.fps} draws=${s.drawCalls} tris=${s.triangles} geos=${s.geometries} texs=${s.textures} loaded=${s.loadedAssets}/${s.totalAssets}`) }

// ---- Scene A: studio-lot (Downtown CC0) ----
await scene('A', { settle: 2200 })
await view([34, 46, 44], [0, 0, -5]); await sleep(900) // aerial 3/4 (view() applies reliably on the initial scene)
await recordPerf('A/overview')
await shotCanvas('01-lot-overview.png')

await view([6.5, 2.2, 4.6], [4.5, 1.0, -0.5]); await sleep(900)
await shotCanvas('02-human-scale.png')

await view([8.5, 5.5, -12], [0, 1.4, -20]); await sleep(900)
await shotCanvas('03-modular-architecture.png')

await view([7, 3.6, 15], [0, 0.3, -1]); await sleep(900)
await shotCanvas('04-road-sidewalk.png')

// bonus: wireframe dev control
await call('set', 'wireframe', true); await view([34, 46, 44], [0, 0, -5]); await sleep(900)
await shotCanvas('09-wireframe.png')
await call('set', 'wireframe', false)

// ---- Scene B: furnished set (FBX props, LICENSE-UNCLEAR) ----
await scene('B', { settle: 2000 })
await call('setCamera', 'overview'); await sleep(800)
await recordPerf('B/overview')
await shotCanvas('05-furnished-set.png')
await shotPage('08-provenance-status.png') // HUD shows LICENSE-UNCLEAR active + legend

// ---- Scene C: animation viewer (CC0 character) ----
await scene('C', { settle: 1600 })
await call('setCamera', 'overview')
await call('setClip', 'Walk_Loop'); await sleep(1200)
await recordPerf('C/walk')
await shotCanvas('06-animation-viewer.png')
await shotPage('07-performance-panel.png')   // HUD shows renderer stats

writeFileSync(OUT + 'performance.json', JSON.stringify({
  tool: 'capture', note: 'Diagnostic only — SwiftShader headless, NOT target-hardware acceptance (§8).',
  viewport: { width: 1600, height: 1000, dpr: 2 }, renderer: 'ANGLE/SwiftShader (software)', samples: perf,
}, null, 2) + '\n')
console.log('\nwrote proof/performance.json ; console-error-free:', !hadError)
await browser.close()
process.exit(hadError ? 2 : 0)
