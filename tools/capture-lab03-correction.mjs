// Asset Lab 03 — final owner-correction evidence. Captures the 7 required shots into
// proof/lab03/final-owner-correction/. Headless Chrome + SwiftShader, driving window.__lab.
//   node tools/capture-lab03-correction.mjs      (needs `npm run preview` on :4320)
import puppeteer from 'puppeteer-core'
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const TARGET = process.env.LAB_URL ?? 'http://localhost:4320/'
const OUT = fileURLToPath(new URL('../proof/lab03/final-owner-correction/', import.meta.url))
const CHROME = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
mkdirSync(OUT, { recursive: true })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const V = {
  heroOverview: [[23, 9, 27], [-2, 6, 3]],
  loadingBay: [[-3.5, 5, 23], [-3.5, 5, 6]],
  crewStandWalk: [[0.5, 2.0, 16], [-2.2, 1.55, 12.5]],   // electrician standing (yellow hat) + PA walking beyond
  crewRepairPickup: [[-5.2, 1.7, 14.5], [-7.6, 1.15, 12.2]], // gaffer kneeling (repair) close — hat follows bent head
  meridianMount: [[14, 10.4, 15], [7, 9.3, 6]],     // MERIDIAN plaque mounting depth
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

await page.goto(TARGET, { waitUntil: 'networkidle0', timeout: 45000 })
await page.waitForFunction('!!window.__lab', { timeout: 20000 })
const call = (fn, ...a) => page.evaluate((f, args) => window.__lab[f](...args), fn, a)
const set = (k, v) => call('set', k, v)
const view = (v) => call('view', v[0], v[1])
const shot = async (n) => { const c = await page.$('#root canvas'); await c.screenshot({ path: OUT + n }); console.log('  ✓', n) }
const shotPage = async (n) => { await page.screenshot({ path: OUT + n }); console.log('  ✓', n) }

await call('setScene', 'E'); await sleep(500)
await page.waitForFunction('window.__lab.ready()', { timeout: 45000 }).catch(() => console.log('  (ready timeout)'))
await set('softShadows', false); await set('postFx', false); await sleep(2600)

// 1-5: corrected 3D views (deterministic core look)
await view(V.heroOverview); await sleep(900); await shot('1-hero-overview.png')
await view(V.loadingBay); await sleep(800); await shot('2-loading-bay.png')
await view(V.crewStandWalk); await sleep(1200); await shot('3-hardhats-standing-walking.png')
await view(V.crewRepairPickup); await sleep(1200); await shot('4-hardhats-repair-kneeling.png')
await view(V.meridianMount); await sleep(800); await shot('5-meridian-sign-mounting.png')

const statsOff = await page.evaluate(() => window.__lab.getStats())
console.log('  stats (postFx OFF):', JSON.stringify({ drawCalls: statsOff.drawCalls, triangles: statsOff.triangles, sceneTriangles: statsOff.sceneTriangles, sceneMeshes: statsOff.sceneMeshes, renderer: statsOff.renderer, isSoftware: statsOff.isSoftware }))

// taller viewport so the full DevPanel (Renderer Stats + Lights + notes) fits in the page shots
await page.setViewport({ width: 1500, height: 1500, deviceScaleFactor: 1.5 }); await sleep(600)

// 6: Renderer Stats panel WITH Post FX ON — proves draw calls/triangles no longer collapse to 1
await view(V.heroOverview); await set('postFx', true); await sleep(2800)
const statsOn = await page.evaluate(() => window.__lab.getStats())
console.log('  stats (postFx ON):', JSON.stringify({ drawCalls: statsOn.drawCalls, triangles: statsOn.triangles, sceneTriangles: statsOn.sceneTriangles, postFx: statsOn.postFx }))
await shotPage('6-renderer-stats-postfx.png')
await set('postFx', false); await sleep(600)

// 7: lighting-control state — Key/Ambient at 0 with the clarifying note; scene stays lit via Sky+IBL+ACES
await set('keyLight', 0); await set('ambientLight', 0); await sleep(1400); await shotPage('7-lighting-control-state.png')
await set('keyLight', 3.0); await set('ambientLight', 0.6)
console.log('\nfinal-owner-correction: console-error-free:', !hadError)
await browser.close()
process.exit(hadError ? 2 : 0)
