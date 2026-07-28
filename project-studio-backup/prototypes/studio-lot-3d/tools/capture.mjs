// Headless capture + assertions for the M1 gray-box slice (Gate A evidence).
// Drives the built app via window.__spike in headless Chrome; screenshots (canvas
// element = UI-hidden; full page = with dev UI) + ordered PNG frame sequences
// ("recordings") + perf + lifecycle + determinism + console-error check.
//   node tools/capture.mjs           (with `npm run preview` running)

import puppeteer from 'puppeteer-core'
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const TARGET = process.env.SPIKE_URL ?? 'http://localhost:4319/'
const OUT = fileURLToPath(new URL('../shots/', import.meta.url))
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
await sleep(1500)

const ev = (fn, ...a) => page.evaluate(fn, ...a)
const canvas = async () => page.$('#root canvas')
const shotPage = async (n) => { await page.screenshot({ path: OUT + n }); console.log('  ✓', n) }
const shotCanvas = async (n) => { const c = await canvas(); await c.screenshot({ path: OUT + n }); console.log('  ✓', n) }

// steady the scene for stills
await ev(() => window.__spike.pauseVignette(true))
await ev(() => window.__spike.seekVignette(13))            // a "take" moment
await ev(() => window.__spike.camera('overview', true)); await sleep(500)
await shotPage('m1-overview.png')
await shotCanvas('m1-overview-ui-hidden.png')

await ev(() => window.__spike.camera('production', true)); await sleep(500)
await shotCanvas('m1-production.png')

await ev(() => window.__spike.camera('human', true)); await sleep(500)
await shotCanvas('m1-human-scale.png')

await ev(() => window.__spike.focusBuilding('stage-a', true)); await sleep(700)
await shotPage('m1-building-selected.png')

await ev(() => window.__spike.selectDirector()); await sleep(400)
await ev(() => window.__spike.camera('human', true)); await sleep(500)
await shotPage('m1-character-selected.png')

// ── recordings (ordered PNG frames) ──────────────────────────────────────────
console.log('› recording: full vignette')
await ev(() => window.__spike.returnToOverview(true))
await ev(() => window.__spike.camera('production', true)); await sleep(400)
const vt = [1, 4, 7, 10, 12, 14, 18]
for (let i = 0; i < vt.length; i++) { await ev((t) => window.__spike.seekVignette(t), vt[i]); await sleep(180); await shotCanvas(`seq-vignette-${String(i + 1).padStart(2, '0')}.png`) }

console.log('› recording: overview → production camera move')
await ev(() => window.__spike.camera('overview', true)); await sleep(400)
await ev(() => window.__spike.camera('production', false)) // animated
for (let i = 0; i < 7; i++) { await sleep(160); await shotCanvas(`seq-camera-${String(i + 1).padStart(2, '0')}.png`) }

// ── Gate-A routing-correction evidence (vehicle + character routes) ───────────
console.log('› routing-correction evidence')
await ev(() => window.__spike.playVignette())
await ev(() => window.__spike.pauseVignette(true))
// 1. production vehicle mid-route (overview) — the van drives the service road that
//    runs IN FRONT of the stage; the stage footprint is clearly to its side, so the
//    delivery run completes without the vehicle crossing any building.
await ev(() => window.__spike.camera('overview', true))
await ev(() => window.__spike.seekVignette(2.5)); await sleep(400)
await shotCanvas('route-01-van-enroute-clear.png')
// 2. a character entering through the OPEN stage door (t=16.2, doorOpen window)
await ev(() => window.__spike.camera('production', true))
await ev(() => window.__spike.seekVignette(16.2)); await sleep(400)
await shotCanvas('route-02-entry-door-open.png')
// 3. a character STOPPED at the CLOSED door (t=4, approacher waits at the
//    threshold, doors shut, interior dark — no pass-through)
await ev(() => window.__spike.seekVignette(4)); await sleep(300)
await shotCanvas('route-03-blocked-door-closed.png')

// ── assertions / reports ─────────────────────────────────────────────────────
console.log('› assertions')
const results = []
const check = (n, c) => { results.push({ n, ok: !!c }); console.log(`   ${c ? '✓' : '✗'} ${n}`) }

check('ready intent fired', (await ev(() => window.__spike.intents.some((e) => e.type === 'ready'))))
check('building select sets selection + emits intent', (await ev(async () => { window.__spike.focusBuilding('admin', true); return window.__spike.debugState().selectedBuilding === 'admin' && window.__spike.intents.some((e) => e.type === 'building-selected') })))
check('character select sets selection + emits intent', (await ev(async () => { window.__spike.selectDirector(); return window.__spike.debugState().selectedCharacter === 'char-director' && window.__spike.intents.some((e) => e.type === 'character-selected') })))
check('return-to-overview emits intent', (await ev(async () => { window.__spike.returnToOverview(true); return window.__spike.intents.some((e) => e.type === 'return-to-overview') })))

// routing: authored vehicle + character routes never cross building footprints
// (except a character through the OPEN stage door). Deterministic — re-derived
// from the pure sampler + authored loops against the real footprints.
const routes = await ev(() => window.__spike.validateRoutes())
if (!routes.ok) console.log('   route violations:', JSON.stringify(routes.violations.slice(0, 8)))
check('vehicle route never enters a building', routes.vanClear)
check('stage entry only through the door while it is open', routes.doorwayEntriesOnlyWhenOpen)
check('closed door blocks the approaching character', routes.approacherBlockedWhenClosed)
check('ambient character loops clear of all footprints', routes.ambientClear)
check('all authored routes footprint-clear', routes.ok)

// determinism: same seek ⇒ same reported vignette time (pure sampler, no Math.random)
await ev(() => window.__spike.seekVignette(12))
const t1 = await ev(() => window.__spike.debugState().vignette.t)
await ev(() => { window.__spike.seekVignette(0); window.__spike.seekVignette(12) })
const t2 = await ev(() => window.__spike.debugState().vignette.t)
check('deterministic vignette clock (12s ⇒ 12s)', t1 === 12 && t2 === 12)

// perf: run unpaused a moment, read fps
await ev(() => window.__spike.playVignette())
await sleep(2500)
const fps = await ev(() => window.__spike.debugState().fps)
console.log(`   • measured fps (headless swiftshader): ${fps}`)

// lifecycle: destroy + recreate ⇒ exactly one canvas
await ev(() => window.__spike.recreate())
await sleep(1500)
const canvases = await ev(() => document.querySelectorAll('#root canvas').length)
check('destroy/recreate leaves exactly one canvas', canvases === 1)
check('no console/page errors', !hadError)

const failed = results.filter((r) => !r.ok)
await browser.close()
console.log(`\nfps=${fps}`)
if (failed.length) { console.error(`✗ ${failed.length} failed: ${failed.map((f) => f.n).join(', ')}`); process.exit(1) }
console.log('✓ all M1 assertions passed')
