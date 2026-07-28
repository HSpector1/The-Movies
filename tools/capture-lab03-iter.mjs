// Asset Lab 03 refinement-loop capture. Shoots the 5 named inspection views into
// proof/lab03/iteration-<NN>/ using the deterministic core look (softShadows + postFx OFF).
//   ITER=01 node tools/capture-lab03-iter.mjs      (needs `npm run preview` on :4320)
import puppeteer from 'puppeteer-core'
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const ITER = process.env.ITER ?? '01'
const TARGET = process.env.LAB_URL ?? 'http://localhost:4320/'
const OUT = fileURLToPath(new URL(`../proof/lab03/iteration-${ITER}/`, import.meta.url))
const CHROME = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
mkdirSync(OUT, { recursive: true })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// The five required inspection framings (+ a wide overview page for the panel/stats).
const V = {
  '1-overview': [[34, 20, 42], [-2, 5, -1]],       // Hero Soundstage Overview (composition + lot context)
  '2-front': [[0, 10, 37], [0, 8.5, -2]],          // Soundstage Front (elevation)
  '3-loading-bay': [[3, 5.5, 23], [-3, 3.5, 6]],   // Loading Bay (doors + dock)
  '4-courtyard': [[12, 4.5, 22], [-2, 1.5, 9]],    // Courtyard Production (apron)
  '5-human-scale': [[1.5, 1.75, 16], [-3, 1.5, 8]],// Human Scale
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
const renderer = await page.evaluate(() => { try { const c = document.createElement('canvas'); const gl = c.getContext('webgl'); const ext = gl.getExtension('WEBGL_debug_renderer_info'); return ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : 'unknown' } catch { return 'unavailable' } })
const call = (fn, ...a) => page.evaluate((f, args) => window.__lab[f](...args), fn, a)
const set = (k, v) => call('set', k, v)
const view = (v) => call('view', v[0], v[1])
const shot = async (n) => { const c = await page.$('#root canvas'); await c.screenshot({ path: OUT + n }); console.log('  ✓', n) }

await call('setScene', 'E'); await sleep(500)
await page.waitForFunction('window.__lab.ready()', { timeout: 45000 }).catch(() => console.log('  (ready timeout)'))
await set('softShadows', false); await set('postFx', false); await sleep(2600)

for (const [name, v] of Object.entries(V)) { await view(v); await sleep(900); await shot(name + '.png') }

const stats = await page.evaluate(() => window.__lab.getStats())
writeFileSync(OUT + 'stats.json', JSON.stringify({ iteration: ITER, renderer, ...stats }, null, 2) + '\n')
console.log(`\niteration-${ITER}: tris=${stats.triangles} draws=${stats.drawCalls} ; console-error-free:`, !hadError)
await browser.close()
process.exit(hadError ? 2 : 0)
