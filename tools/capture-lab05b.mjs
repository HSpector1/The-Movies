// Asset Lab 05B runtime proof — Scene G with the CORRECTED crew. Headless Chrome + SwiftShader
// (DIAGNOSTIC ONLY — software rendering, not target-hardware acceptance). Review cameras framed so
// "front" is genuinely the crew front (+Z side, looking -Z) and "back" is genuinely the back.
//   npx vite --port 4321 --strictPort   (in another shell), then:  node tools/capture-lab05b.mjs
import puppeteer from 'puppeteer-core'
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const TARGET = process.env.LAB_URL ?? 'http://localhost:4321/'
const OUT = fileURLToPath(new URL('../proof/lab05b/runtime/', import.meta.url))
const CHROME = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
mkdirSync(OUT, { recursive: true })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// crew stand at z ~ 10.6-12.6 facing +Z. Camera on the +Z side (z>13) looking -Z sees their FRONTS.
const G = {
  crewFront: [[0, 3.0, 22], [0, 1.5, 11]],   // Crew Lineup Front (faces toward camera)
  crew3q:    [[11, 3.6, 20], [0, 1.5, 11]],   // Crew Three-Quarter
  crewBack:  [[0, 3.0, 0.5], [0, 1.5, 11]],   // Crew Lineup Back (hair, no faces)
  human:     [[-2.5, 1.7, 16.5], [-3.0, 1.5, 11]], // Human Scale (PA close)
  overview:  [[20, 12, 30], [0, 3, 8]],
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
await page.goto(TARGET, { waitUntil: 'networkidle0', timeout: 60000 })
await page.waitForFunction('!!window.__lab', { timeout: 30000 })
const renderer = await page.evaluate(() => { try { const c = document.createElement('canvas'); const gl = c.getContext('webgl'); const ext = gl.getExtension('WEBGL_debug_renderer_info'); return ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : 'unknown' } catch { return 'unavailable' } })
console.log('  renderer:', renderer)
const call = (fn, ...a) => page.evaluate((f, args) => window.__lab[f](...args), fn, a)
const set = (k, v) => call('set', k, v)
const view = (v) => call('view', v[0], v[1])
const shot = async (n) => { const c = await page.$('#root canvas'); await c.screenshot({ path: OUT + n }); console.log('  ✓', n) }
const getStats = () => page.evaluate(() => window.__lab.getStats())
async function toScene(k, settle = 3600) { await call('setScene', k); await sleep(400); await page.waitForFunction('window.__lab.ready()', { timeout: 60000 }).catch(() => console.log('  (ready timeout ' + k + ')')); await sleep(settle) }

await toScene('G', 3800)
await set('showCharacters', true); await set('softShadows', false); await set('postFx', false); await set('showHud', false); await sleep(800)
const loadMs = Date.now() - t0

await view(G.crewFront); await sleep(1200); await shot('01-crew-front.png')
await view(G.crew3q);    await sleep(900);  await shot('02-crew-3q.png')
await view(G.crewBack);  await sleep(900);  await shot('03-crew-back.png')
await view(G.human);     await sleep(900);  await shot('04-human-scale.png')
await view(G.overview);  await sleep(1000); await shot('05-overview.png')
// animation is live: sample crew front at two times
await view(G.crewFront); await sleep(200); await shot('06-anim-t0.png'); await sleep(1600); await shot('07-anim-t1.png')

const perf = []
const sample = async (label) => { const s = await getStats(); perf.push({ label, ...s }); console.log(`  perf[${label}] fps=${s.fps} draws=${s.drawCalls} tris=${s.sceneTriangles} meshes=${s.sceneMeshes}`) }
await view(G.overview); await sleep(1200); await sample('G/overview')
await set('showHud', true); await sleep(400); await shot('08-panel.png')

writeFileSync(OUT + 'performance-lab05b.json', JSON.stringify({
  tool: 'capture-lab05b', note: 'DIAGNOSTIC ONLY — headless SwiftShader software rendering, NOT target-hardware acceptance.',
  renderer, consoleErrorFree: !hadError, viewport: { width: 1600, height: 1000, dpr: 2 }, initialLoadMs: loadMs, samples: perf,
}, null, 2) + '\n')
console.log('\nwrote proof/lab05b/runtime/performance-lab05b.json ; loadMs=' + loadMs + ' ; console-error-free:', !hadError)
await browser.close()
process.exit(hadError ? 2 : 0)
