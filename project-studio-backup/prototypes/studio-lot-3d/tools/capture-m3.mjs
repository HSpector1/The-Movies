// M3 Gate-C evidence capture (coherent Meridian art slice). Drives the upgraded M1
// slice (index.html) via window.__spike in headless Chrome → shots-m3/. Canvas
// screenshots are UI-hidden; full-page include the dev overlay. Software WebGL — a
// coherence/behaviour record, NOT a hardware perf verdict (owner ~120 fps stands).
//   node tools/capture-m3.mjs   (with `npm run preview` running)

import puppeteer from 'puppeteer-core'
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const TARGET = process.env.SPIKE_URL ?? 'http://localhost:4319/'
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

await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 })
await page.goto(TARGET, { waitUntil: 'networkidle0', timeout: 40000 })
await page.waitForFunction('!!window.__spike', { timeout: 20000 })
await sleep(1800) // let the character rig + kit settle (preload)

const ev = (fn, ...a) => page.evaluate(fn, ...a)
const shotPage = async (n) => { await page.screenshot({ path: OUT + n }); console.log('  ✓', n) }
const shotCanvas = async (n) => { const c = await page.$('#root canvas'); await c.screenshot({ path: OUT + n }); console.log('  ✓', n) }

// ── hero framings (at a take moment: doors open, crew filming) ─────────────────
await ev(() => window.__spike.pauseVignette(true))
await ev(() => window.__spike.seekVignette(13))
await ev(() => window.__spike.camera('overview', true)); await sleep(600)
await shotPage('m3-01-overview-ui.png')
await shotCanvas('m3-02-overview.png')
await ev(() => window.__spike.camera('production', true)); await sleep(600)
await shotCanvas('m3-03-production.png')
await ev(() => window.__spike.camera('human', true)); await sleep(600)
await shotCanvas('m3-04-human-scale.png')

// ── hero-building close-ups (focus frames each landmark) ──────────────────────
for (const [id, n] of [['gate', 'm3-05-gate.png'], ['admin', 'm3-06-admin.png'], ['stage-a', 'm3-07-soundstage.png'], ['backlot', 'm3-08-backlot.png']]) {
  await ev((b) => window.__spike.focusBuilding(b, true), id); await sleep(700)
  await shotCanvas(n)
}

// ── production readability ────────────────────────────────────────────────────
// active production from overview (doors open, recording)
await ev(() => window.__spike.returnToOverview(true))
await ev(() => window.__spike.camera('overview', true))
await ev(() => window.__spike.seekVignette(13)); await sleep(500)
await shotCanvas('m3-09-active-production-overview.png')
// character entering the OPEN door (t≈16.2)
await ev(() => window.__spike.camera('production', true))
await ev(() => window.__spike.seekVignette(16.2)); await sleep(500)
await shotCanvas('m3-10-open-door-entry.png')
// character WAITING at the CLOSED door (t=4: doors shut, approacher waits — no pass-through)
await ev(() => window.__spike.seekVignette(4)); await sleep(400)
await shotCanvas('m3-15-closed-door-wait.png')
// vehicle en route (van on the service corridor)
await ev(() => window.__spike.camera('overview', true))
await ev(() => window.__spike.seekVignette(2.5)); await sleep(500)
await shotCanvas('m3-11-vehicle-route.png')
// crew roles (human-scale during the gather beat — cast spread on the apron)
await ev(() => window.__spike.camera('human', true))
await ev(() => window.__spike.seekVignette(8)); await sleep(500)
await shotCanvas('m3-12-character-roles.png')

// ── selection + card ──────────────────────────────────────────────────────────
await ev(() => window.__spike.selectDirector()); await sleep(400)
await ev(() => window.__spike.camera('human', true)); await sleep(500)
await shotPage('m3-13-character-selected.png')
await ev(() => window.__spike.focusBuilding('admin', true)); await sleep(500)
await shotPage('m3-14-building-selected.png')

// ── filming vignette recording (ordered frames) ───────────────────────────────
console.log('› vignette recording')
await ev(() => window.__spike.returnToOverview(true))
await ev(() => window.__spike.camera('production', true)); await sleep(400)
const vt = [1, 5, 8, 11, 12, 14, 18]
for (let i = 0; i < vt.length; i++) { await ev((t) => window.__spike.seekVignette(t), vt[i]); await sleep(200); await shotCanvas(`m3-vignette-${String(i + 1).padStart(2, '0')}.png`) }

// ── camera-transition recording (overview → production, animated) ─────────────
console.log('› camera-transition recording')
await ev(() => window.__spike.camera('overview', true)); await sleep(400)
await ev(() => window.__spike.camera('production', false)) // animated
for (let i = 0; i < 6; i++) { await sleep(170); await shotCanvas(`m3-camera-${String(i + 1).padStart(2, '0')}.png`) }

// ── reduced-motion (instant) demonstration ────────────────────────────────────
await ev(() => window.__spike.camera('overview', true)); await sleep(300)
await ev(() => window.__spike.camera('human', true)) // instant snap (no lerp)
await sleep(200)
await shotCanvas('m3-reduced-motion-instant.png')

// ── assertions (M3 regression: routing/portals/lifecycle preserved) ───────────
console.log('› assertions')
const results = []
const check = (n, c) => { results.push({ n, ok: !!c }); console.log(`   ${c ? '✓' : '✗'} ${n}`) }
const routes = await ev(() => window.__spike.validateRoutes())
if (!routes.ok) console.log('   route violations:', JSON.stringify(routes.violations.slice(0, 10)))
check('all authored routes clear (footprints + obstacles)', routes.ok)
check('vehicle route never enters a building', routes.vanClear)
check('stage entry only through the open door', routes.doorwayEntriesOnlyWhenOpen)
check('closed door blocks the approacher', routes.approacherBlockedWhenClosed)
check('character routes avoid vegetation footprints', routes.vegetationClear)
check('character routes avoid production-prop footprints', routes.propsClear)
check('apron crew spaced + obstacle-clear (no stacking)', routes.crewSpacingOk)
await ev(() => window.__spike.seekVignette(12))
const t1 = await ev(() => window.__spike.debugState().vignette.t)
check('deterministic vignette (seek 12 ⇒ 12)', t1 === 12)
await ev(() => window.__spike.recreate()); await sleep(1200)
const canvases = await ev(() => window.__spike.debugState().canvases)
check('destroy/recreate leaves exactly one canvas', canvases === 1)
check('no console/page errors (preload clean; rig + kit loaded)', !hadError)

const failed = results.filter((r) => !r.ok)
await browser.close()
if (failed.length) { console.error(`\n✗ ${failed.length} failed: ${failed.map((f) => f.n).join(', ')}`); process.exit(1) }
console.log('\n✓ all M3 evidence captured + assertions passed')
