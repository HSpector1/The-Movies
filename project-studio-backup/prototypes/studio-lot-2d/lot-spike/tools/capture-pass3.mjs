// Pass-3 evidence + assertions for the vignette / inspection system.
// Screenshots (deterministic via forced vignettes + phase seeks), two ordered
// PNG frame sequences, and a headless assertion suite. Uses the local Chrome.
//
//   node tools/capture-pass3.mjs shots    # screenshots + frame sequences
//   node tools/capture-pass3.mjs verify   # assertions only

import puppeteer from 'puppeteer-core'
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const MODE = process.argv[2] ?? 'shots'
const TARGET = process.env.LOT_URL ?? 'http://localhost:4317/'
const OUT = fileURLToPath(new URL('../shots/pass-3/', import.meta.url))
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
page.on('console', (m) => {
  if (m.type() !== 'error') return
  const t = m.text()
  if (t.includes('favicon') || t.includes('404')) return
  hadError = true
  console.log('  [console.error]', t)
})

const ev = (fn, ...a) => page.evaluate(fn, ...a)
async function boot(vw = 1440, vh = 900, dsf = 2) {
  await page.setViewport({ width: vw, height: vh, deviceScaleFactor: dsf })
  await page.goto(TARGET, { waitUntil: 'networkidle0', timeout: 30000 })
  await page.waitForFunction('!!window.__lot', { timeout: 15000 })
  await sleep(1200)
}
const setMode = async (k) => { await ev((m) => window.__lot.setMode(m), k); await sleep(900) }
const camera = async (p) => { await ev((c) => window.__lot.camera(c), p); await sleep(500) }
const pause = async (p) => ev((b) => window.__lot.pauseVignettes(b), p)
const force = async (k, ph) => { const r = await ev((kk, pp) => window.__lot.forceVignette(kk, pp), k, ph); await sleep(400); return r }
const seek = async (t) => { await ev((tt) => window.__lot.seekVignette(tt), t); await sleep(120) }
const shot = async (n) => { await page.screenshot({ path: OUT + n }); console.log('  ✓', n) }

if (MODE === 'shots') {
  console.log('› pass-3 screenshots')
  await boot()
  await setMode('successful')
  await pause(true)
  await camera('production')

  await force('production-arrival', 'start'); await shot('production-arrival-start.png')
  await force('production-arrival', 'action'); await shot('production-arrival-action.png')
  await force('production-arrival', 'complete'); await shot('production-arrival-complete.png')
  await force('stage-preparation', 'action'); await shot('stage-preparation.png')
  await force('filming-beat', 'action'); await shot('filming-beat.png')

  // studio reactions
  await setMode('celebration'); await pause(true); await camera('theater')
  await force('studio-reaction', 'action'); await shot('studio-celebration.png')
  await setMode('disappointment'); await pause(true); await camera('theater')
  await force('studio-reaction', 'action'); await shot('studio-disappointment.png')

  // ambient character hover / select / building priority
  await setMode('successful'); await pause(true); await camera('production')
  await force('filming-beat', 'action')
  let pos = await ev(() => window.__lot.firstInspectableScreen())
  if (pos) {
    await page.mouse.move(pos.x, pos.y)
    await sleep(250)
    await shot('ambient-character-hover.png')
    await page.mouse.click(pos.x, pos.y)
    await sleep(300)
    await shot('ambient-character-selected.png')
    // now select a building — it must supersede the character card
    await ev(() => window.__lot.select('stage-a'))
    await sleep(300)
    await shot('building-selection-over-character.png')
  } else {
    console.log('  ! no inspectable character found for hover/select shots')
  }

  // small viewport
  await boot(1024, 640, 2)
  await setMode('successful'); await pause(true); await camera('production')
  await force('filming-beat', 'action'); await shot('vignette-small-viewport.png')

  // quiet period (fresh boot, paused, nothing forced)
  await boot()
  await setMode('successful'); await pause(true); await camera('overview')
  await shot('quiet-period-overview.png')

  // ── frame sequences (ordered PNGs) ─────────────────────────────────────────
  console.log('› frame sequences')
  await boot(1280, 800, 1)
  await setMode('successful'); await pause(true); await camera('production')
  await force('production-arrival', 'start')
  const arrTimes = [0.5, 2, 3.5, 6, 8.5, 11, 13]
  for (let i = 0; i < arrTimes.length; i++) { await seek(arrTimes[i]); await shot(`seq-arrival-${String(i + 1).padStart(2, '0')}.png`) }
  await force('stage-preparation', 'start')
  const prepTimes = [0.5, 2.5, 5, 6.5, 8.5, 11]
  for (let i = 0; i < prepTimes.length; i++) { await seek(prepTimes[i]); await shot(`seq-preparation-${String(i + 1).padStart(2, '0')}.png`) }
}

// ── assertions (shots + verify) ──────────────────────────────────────────────
console.log('› assertions')
hadError = false
await boot()
const results = []
const check = (n, c) => { results.push({ n, ok: !!c }); console.log(`   ${c ? '✓' : '✗'} ${n}`) }

// fixtures load
for (const k of ['struggling', 'successful', 'celebration', 'disappointment']) {
  await setMode(k)
  check(`fixture "${k}" loads`, await ev(() => !!document.querySelector('#lot-stage canvas')))
}

// each vignette can be forced deterministically; one at a time
await setMode('successful'); await pause(true)
for (const k of ['production-arrival', 'stage-preparation', 'filming-beat']) {
  const ok = await force(k, 'action')
  const ds = await ev(() => window.__lot.debugState())
  check(`vignette "${k}" runs (one active)`, ok && ds.vignette?.active === k && ds.vignette?.actors > 0)
}
await setMode('celebration'); await pause(true)
{
  const ok = await force('studio-reaction', 'action')
  const ds = await ev(() => window.__lot.debugState())
  check('vignette "studio-reaction" runs', ok && ds.vignette?.active === 'studio-reaction')
}

// cooldown: forcing filming-beat twice still yields a clean single active
await setMode('successful'); await pause(true)
await force('filming-beat', 'action')
await force('filming-beat', 'action')
{
  const ds = await ev(() => window.__lot.debugState())
  check('re-force keeps exactly one active vignette', ds.vignette?.active === 'filming-beat' && ds.poolInUse <= 4)
}

// snapshot replacement cancels the active vignette + frees actors
await ev(() => window.__lot.setMode('struggling'))
await sleep(500)
{
  const ds = await ev(() => window.__lot.debugState())
  check('snapshot switch cancels vignette + frees pool', ds.poolInUse === 0)
}

// no duplicate actors after repeated snapshots
await ev(() => { for (let i = 0; i < 6; i++) window.__lot.setMode(i % 2 ? 'successful' : 'struggling'); window.__lot.setMode('successful') })
await sleep(700)
check('repeated snapshots do not strand pool actors', (await ev(() => window.__lot.debugState())).poolInUse <= 6)

// character inspection: hover + select + building priority
await setMode('successful'); await pause(true); await camera('production')
await force('filming-beat', 'action')
const cpos = await ev(() => window.__lot.firstInspectableScreen())
check('an inspectable character is present', !!cpos)
if (cpos) {
  await page.mouse.click(cpos.x, cpos.y)
  await sleep(250)
  check('character selection shows a card', !!(await ev(() => window.__lot.character)))
  check('character selection clears building selection', (await ev(() => window.__lot.debugState())).selected === null)
  await ev(() => window.__lot.select('stage-a'))
  await sleep(200)
  const ds = await ev(() => window.__lot.debugState())
  check('building selection supersedes character', ds.selected === 'stage-a' && ds.characterActive === false)
}

// far zoom: characters not inspectable
await camera('wide')
await sleep(300)
{
  const before = await ev(() => window.__lot.character)
  const p2 = await ev(() => window.__lot.firstInspectableScreen())
  if (p2) { await page.mouse.click(p2.x, p2.y); await sleep(150) }
  check('far zoom does not inspect characters', (await ev(() => window.__lot.character)) === before)
}

// destroy/recreate leaves exactly one canvas
await ev(() => window.__lot.recreate())
await sleep(900)
check('destroy/recreate leaves one canvas', (await ev(() => document.querySelectorAll('#lot-stage canvas').length)) === 1)

check('no console/page errors', !hadError)

const failed = results.filter((r) => !r.ok)
await browser.close()
if (failed.length) { console.error(`\n✗ ${failed.length} failed:`, failed.map((f) => f.n).join(', ')); process.exit(1) }
console.log('\n✓ all pass-3 assertions passed')
