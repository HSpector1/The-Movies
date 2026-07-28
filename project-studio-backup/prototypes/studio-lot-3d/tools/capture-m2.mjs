// Headless capture + assertions for the M2 asset-compatibility survey (Gate B
// evidence). Drives m2.html via window.__m2 in headless Chrome. Captures the sample
// lineup (original ↔ Meridian restyle), close-ups, the rigged character animating,
// and reads measured bounding boxes (scale-compatibility). Software WebGL — this is
// a correctness/coherence check, NOT a hardware perf verdict.
//   node tools/capture-m2.mjs   (with `npm run preview` running)

import puppeteer from 'puppeteer-core'
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const TARGET = (process.env.SPIKE_URL ?? 'http://localhost:4319/') + 'm2.html'
const OUT = fileURLToPath(new URL('../shots-m2/', import.meta.url))
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
await page.waitForFunction('!!window.__m2', { timeout: 20000 })
const ev = (fn, ...a) => page.evaluate(fn, ...a)
const canvas = async () => page.$('canvas')
const shot = async (n) => { const c = await canvas(); await c.screenshot({ path: OUT + n }); console.log('  ✓', n) }

// wait until all 7 sample assets have reported a measured bounding box (= loaded)
await page.waitForFunction('window.__m2 && Object.keys(window.__m2.state().measures).length >= 7', { timeout: 30000 }).catch(() => {})
await sleep(2500) // troika text + textures settle

// ── lineup: original vs Meridian restyle ──────────────────────────────────────
await ev(() => window.__m2.setView('lineup'))
await ev(() => window.__m2.setRestyle(false)); await sleep(1600)
await shot('m2-01-lineup-original.png')
await ev(() => window.__m2.setRestyle(true)); await sleep(1600)
await shot('m2-02-lineup-meridian.png')

// ── close-ups (Meridian) ──────────────────────────────────────────────────────
await ev(() => window.__m2.setView('closeBuilding')); await sleep(1800)
await shot('m2-03-close-building-meridian.png')
await ev(() => window.__m2.setView('closeVehicle')); await sleep(1800)
await shot('m2-04-close-vehicle-meridian.png')
await ev(() => window.__m2.setView('closeCrew')); await sleep(1800)
await shot('m2-05-close-crew-meridian.png')

// ── rigged character: animation proof (walk cycle, a few frames apart) ─────────
console.log('› character animation (walk)')
await ev(() => window.__m2.setClip('walk')); await sleep(600)
for (let i = 0; i < 5; i++) { await sleep(220); await shot(`m2-anim-walk-${String(i + 1).padStart(2, '0')}.png`) }
// a gesture clip too
await ev(() => window.__m2.setClip('gesture')); await sleep(900)
await shot('m2-06-crew-gesture.png')

// ── recognition probe: same family composed as a studio-corner, from overview ──
// Directly tests the owner's binding Gate-A concern (does the world read as a movie
// studio, not a fire station?). A survey probe — NOT the M3 art pass.
console.log('› studio recognition probe (overview)')
await ev(() => window.__m2.setMode('studio'))
await ev(() => window.__m2.setView('studioOverview')); await sleep(2400)
await ev(() => window.__m2.setRestyle(false)); await sleep(1700)
await shot('m2-07-studio-overview-original.png')
await ev(() => window.__m2.setRestyle(true)); await sleep(1700)
await shot('m2-08-studio-overview-meridian.png')
await ev(() => window.__m2.setView('studioGround')); await sleep(2100)
await shot('m2-09-studio-ground-meridian.png')

// ── assertions / reports ──────────────────────────────────────────────────────
console.log('› assertions')
const results = []
const check = (n, c) => { results.push({ n, ok: !!c }); console.log(`   ${c ? '✓' : '✗'} ${n}`) }

const st = await ev(() => window.__m2.state())
console.log('   measured heights (m):')
for (const [k, d] of Object.entries(st.measures)) console.log(`     ${k}: ${d[0]}×${d[1]}×${d[2]}`)
console.log(`   rig clips (${st.clips.length}): ${st.clips.slice(0, 12).join(', ')}${st.clips.length > 12 ? ' …' : ''}`)
console.log(`   fps (headless swiftshader — SOFTWARE FLOOR, not a hardware verdict): ${st.fps}`)

check('all 7 sample assets imported (measured)', Object.keys(st.measures).length >= 7)
check('every asset has non-zero size', Object.values(st.measures).every((d) => d[0] > 0 && d[1] > 0 && d[2] > 0))
check('rigged character carries animation clips', st.clips.length > 0)
check('required motion clips present (idle/walk/gesture/carry/react)', ['idle', 'walk', 'emote-yes', 'holding-both', 'emote-no'].every((c) => st.clips.includes(c)))
check('fps meter reports a positive rate (software floor)', st.fps > 0)
check('no console/page errors', !hadError)

const failed = results.filter((r) => !r.ok)
await browser.close()
if (failed.length) { console.error(`\n✗ ${failed.length} failed: ${failed.map((f) => f.n).join(', ')}`); process.exit(1) }
console.log('\n✓ all M2 assertions passed')
