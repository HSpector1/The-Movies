// Headless capture + assertions for the M3 scale-reference lineup (owner's first M3
// task: prove the crew is no longer oversized). Drives m3-scale.html via
// window.__m3scale in headless Chrome. Software WebGL — a scale/correctness check,
// NOT a hardware perf verdict.
//   node tools/capture-m3-scale.mjs   (with `npm run preview` running)

import puppeteer from 'puppeteer-core'
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const TARGET = (process.env.SPIKE_URL ?? 'http://localhost:4319/') + 'm3-scale.html'
const OUT = fileURLToPath(new URL('../shots-m3/', import.meta.url))
mkdirSync(OUT, { recursive: true })
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--headless=new', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--enable-webgl', '--ignore-gpu-blocklist', '--no-sandbox'],
})
let hadError = false
const page = await browser.newPage()
page.on('pageerror', (e) => { hadError = true; console.log('  [pageerror]', e.message) })
page.on('console', (m) => { if (m.type() === 'error') { const t = m.text(); if (!t.includes('favicon') && !t.includes('404')) { hadError = true; console.log('  [console.error]', t) } } })

await page.setViewport({ width: 1600, height: 900, deviceScaleFactor: 2 })
await page.goto(TARGET, { waitUntil: 'networkidle0', timeout: 45000 })
await page.waitForFunction('!!window.__m3scale', { timeout: 20000 })
const ev = (fn, ...a) => page.evaluate(fn, ...a)
const shot = async (n) => { const c = await page.$('canvas'); await c.screenshot({ path: OUT + n }); console.log('  ✓', n) }

await page.waitForFunction('window.__m3scale && window.__m3scale.measure().adultScaled != null', { timeout: 30000 }).catch(() => {})
await sleep(2500)

// idle lineup
await ev(() => window.__m3scale.setClip('idle')); await sleep(1400)
await shot('m3-scale-01-lineup-idle.png')
// walk (ground-contact check while animating)
await ev(() => window.__m3scale.setClip('walk')); await sleep(1000)
await shot('m3-scale-02-adult-walk.png')
// carry (carried-prop / pose check)
await ev(() => window.__m3scale.setClip('carry')); await sleep(1000)
await shot('m3-scale-03-adult-carry.png')

// ── assertions / report ───────────────────────────────────────────────────────
console.log('› assertions')
const results = []
const check = (n, c) => { results.push({ n, ok: !!c }); console.log(`   ${c ? '✓' : '✗'} ${n}`) }
const m = await ev(() => window.__m3scale.measure())
console.log('   measured (m):', JSON.stringify({ adultNative: m.adultNative, adultScaled: m.adultScaled, rootScale: m.rootScale, van: m.van, car: m.car }))

check('adult native height read (~2.7 m)', m.adultNative > 2.3 && m.adultNative < 3.2)
check('adult NORMALIZED to ~1.8 m (0.25 m tol)', Math.abs(m.adultScaled - 1.8) <= 0.25)
check('adult shorter than the 2.2 m doorway', m.adultScaled < 2.2)
check('adult shorter than the production van', m.van != null && m.adultScaled < m.van)
check('adult taller than / near the car roofline', m.car != null && m.adultScaled >= m.car - 0.2)
check('root scale ≈ 0.67 (0.6–0.72)', m.rootScale >= 0.6 && m.rootScale <= 0.72)
check('no console/page errors', !hadError)

const failed = results.filter((r) => !r.ok)
await browser.close()
if (failed.length) { console.error(`\n✗ ${failed.length} failed: ${failed.map((f) => f.n).join(', ')}`); process.exit(1) }
console.log('\n✓ all M3 scale-reference assertions passed')
