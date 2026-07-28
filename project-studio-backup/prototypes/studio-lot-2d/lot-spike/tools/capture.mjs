// Deterministic pass-2 capture + verification harness.
// Drives the built app in headless Chrome (via the local Google Chrome install)
// through the window.__lot debug hook, captures a named set of screenshots at
// fixed viewports/camera presets, and runs interaction/leak assertions.
//
// Usage:
//   node tools/capture.mjs before   # baseline set (works against old hook)
//   node tools/capture.mjs after    # full pass-2 set + assertions
//   node tools/capture.mjs verify   # assertions only, no image spam

import puppeteer from 'puppeteer-core'
import { mkdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const MODE = process.argv[2] ?? 'after'
const TARGET = process.env.LOT_URL ?? 'http://localhost:4317/'
const OUT = fileURLToPath(new URL('../shots/pass-2/', import.meta.url))
mkdirSync(OUT, { recursive: true })

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: [
    '--headless=new',
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--enable-unsafe-swiftshader',
    '--enable-webgl',
    '--ignore-gpu-blocklist',
    '--no-sandbox',
  ],
})

let hadError = false
const page = await browser.newPage()
page.on('pageerror', (e) => {
  hadError = true
  console.log('  [pageerror]', e.message)
})
page.on('console', (m) => {
  if (m.type() === 'error') {
    const t = m.text()
    if (t.includes('favicon') || t.includes('404')) return
    hadError = true
    console.log('  [console.error]', t)
  }
})

async function boot(vw, vh, dsf = 2) {
  await page.setViewport({ width: vw, height: vh, deviceScaleFactor: dsf })
  await page.goto(TARGET, { waitUntil: 'networkidle0', timeout: 30000 })
  await page.waitForFunction('!!window.__lot', { timeout: 15000 })
  await sleep(1500)
}

async function has(fn) {
  return page.evaluate(fn)
}

async function shot(name) {
  await page.screenshot({ path: OUT + name })
  console.log('  ✓', name)
}

async function setMode(k) {
  await page.evaluate((m) => window.__lot.setMode(m), k)
  await sleep(1300)
}

async function camera(preset) {
  const ok = await has(() => typeof window.__lot.camera === 'function')
  if (ok) {
    await page.evaluate((p) => window.__lot.camera(p), preset)
    await sleep(700)
  }
}

async function select(id) {
  await page.evaluate((b) => window.__lot.select(b), id)
  await sleep(500)
}

async function composite(out, a, b) {
  const uri = (f) => 'data:image/png;base64,' + readFileSync(OUT + f).toString('base64')
  const html = `<!doctype html><html><head><style>
    *{margin:0;box-sizing:border-box}
    body{background:#1a130c;font-family:Georgia,serif}
    .row{display:flex;gap:10px;padding:10px}
    .col{flex:1}
    .cap{color:#f4ead4;font-size:20px;padding:8px 4px;letter-spacing:.5px}
    img{width:100%;display:block;border:1px solid rgba(202,162,90,.4);border-radius:6px}
  </style></head><body><div class="row">
    <div class="col"><div class="cap">${a[1]}</div><img src="${uri(a[0])}"></div>
    <div class="col"><div class="cap">${b[1]}</div><img src="${uri(b[0])}"></div>
  </div></body></html>`
  await page.setViewport({ width: 2000, height: 680, deviceScaleFactor: 1 })
  await page.setContent(html, { waitUntil: 'load' })
  await sleep(200)
  await page.screenshot({ path: OUT + out })
  console.log('  ✓', out)
}

// ── shot sets ────────────────────────────────────────────────────────────────

if (MODE === 'before') {
  console.log('› BEFORE baseline set')
  await boot(1440, 900)
  await setMode('struggling')
  await shot('before-struggling-overview.png')
  await setMode('successful')
  await shot('before-established-overview.png')
  await boot(1920, 1080)
  await setMode('successful')
  await shot('baseline-1920-established.png')
  await boot(1024, 640)
  await setMode('successful')
  await shot('baseline-small-established.png')
}

if (MODE === 'after' || MODE === 'verify') {
  console.log('› AFTER / verify set')
  await boot(1440, 900)

  if (MODE === 'after') {
    await setMode('struggling')
    await camera('overview')
    await shot('after-struggling-overview.png')

    await setMode('successful')
    await camera('overview')
    await shot('after-established-overview.png')

    await select('stage-a')
    await shot('established-active-stage-selected.png')

    await setMode('struggling')
    await camera('overview')
    await select('stage-b')
    await shot('struggling-inactive-stage-selected.png')

    await setMode('successful')
    await camera('overview')
    await select('writers')
    await shot('writers-building-selected.png')
    await select('casting')
    await shot('casting-office-selected.png')
    await select('theater')
    await shot('screening-theater-selected.png')

    await page.evaluate(() => window.__lot.clearSelection?.())
    await camera('production')
    await shot('close-production-activity.png')

    await camera('entrance')
    await shot('entrance-hero.png')

    await camera('wide')
    await shot('zoomed-out-full-lot.png')

    // small viewport
    await boot(1024, 640)
    await setMode('successful')
    await camera('overview')
    await shot('small-viewport.png')

    // side-by-side comparisons (composited from the saved PNGs)
    await composite(
      'struggling-vs-established-comparison.png',
      ['after-struggling-overview.png', 'Small, struggling studio'],
      ['after-established-overview.png', 'Established studio'],
    )
    await composite(
      'active-vs-idle-stage-comparison.png',
      ['established-active-stage-selected.png', 'Active stage — shooting'],
      ['struggling-inactive-stage-selected.png', 'Idle / closed stage'],
    )
  }

  // ── assertions (run in both after + verify) ────────────────────────────────
  console.log('› assertions')
  hadError = false // ignore any noise from the compositing tool pages above
  await boot(1440, 900)
  const results = []
  const check = (name, cond) => {
    results.push({ name, ok: !!cond })
    console.log(`   ${cond ? '✓' : '✗'} ${name}`)
  }

  await setMode('struggling')
  check('struggling fixture loads', await has(() => !!document.querySelector('#lot-stage canvas')))
  const strugglingActive = await has(() => window.__lot.debugState?.().activeTags ?? -1)
  await setMode('successful')
  const establishedActive = await has(() => window.__lot.debugState?.().activeTags ?? -1)
  check('fixture switching changes active production count', establishedActive > strugglingActive)

  // hover/select/deselect + nav events
  await select('stage-a')
  check('selection sets selected building', await has(() => window.__lot.debugState?.().selected === 'stage-a'))
  await page.evaluate(() => window.__lot.triggerAction('stage-a'))
  check('navigation action reaches host', await has(() => window.__lot.events.length > 0))
  await page.evaluate(() => window.__lot.clearSelection())
  check('deselect clears selection', await has(() => window.__lot.debugState?.().selected === null))

  // repeated snapshot updates do not duplicate tags/agents
  const before = await has(() => window.__lot.debugState?.().displayObjects ?? -1)
  await page.evaluate(() => {
    for (let i = 0; i < 6; i++) window.__lot.setMode(i % 2 ? 'successful' : 'struggling')
    window.__lot.setMode('successful')
  })
  await sleep(600)
  const after = await has(() => window.__lot.debugState?.().displayObjects ?? -1)
  check('repeated snapshot updates do not leak display objects', before < 0 || Math.abs(after - before) <= 3)

  // destroy + recreate does not leak canvases
  await page.evaluate(() => window.__lot.recreate?.())
  await sleep(800)
  const canvases = await has(() => document.querySelectorAll('#lot-stage canvas').length)
  check('destroy/recreate leaves exactly one canvas', canvases === 1)

  check('no page/console errors', !hadError)

  const failed = results.filter((r) => !r.ok)
  await browser.close()
  if (failed.length) {
    console.error(`\n✗ ${failed.length} assertion(s) failed:`, failed.map((f) => f.name).join(', '))
    process.exit(1)
  }
  console.log('\n✓ all assertions passed')
  process.exit(0)
}

await browser.close()
console.log('done')
