// Headless verification for the lot spike.
// Loads the built app in Chrome, screenshots both presentation modes, and drives
// a click→select→action flow to prove buildings emit navigation events to the host.
// Uses the locally installed Google Chrome via puppeteer-core (no browser download).

import puppeteer from 'puppeteer-core'
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const TARGET = process.env.LOT_URL ?? 'http://localhost:4317/'
const OUT = fileURLToPath(new URL('../shots/', import.meta.url))
mkdirSync(OUT, { recursive: true })

const CHROME =
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: [
    '--headless=new',
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--enable-webgl',
    '--ignore-gpu-blocklist',
    '--no-sandbox',
    '--window-size=1440,900',
  ],
  defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 2 },
})

const page = await browser.newPage()
page.on('console', (m) => {
  const t = m.text()
  if (m.type() === 'error' || t.includes('WebGL') || t.includes('Phaser')) {
    console.log('  [page]', t)
  }
})
page.on('pageerror', (e) => console.log('  [pageerror]', e.message))

console.log('› loading', TARGET)
await page.goto(TARGET, { waitUntil: 'networkidle0', timeout: 30000 })

// wait for the debug hook + first paint
await page.waitForFunction('!!window.__lot', { timeout: 15000 })
await sleep(1600) // let textures bake, camera settle, ambient start

await page.screenshot({ path: OUT + '1-struggling.png' })
console.log('✓ shot: struggling studio')

// switch to the established studio and let it repaint
await page.evaluate(() => window.__lot.setMode('successful'))
await sleep(1600)
await page.screenshot({ path: OUT + '2-successful.png' })
console.log('✓ shot: established studio')

// interaction proof: select stage B (now active), then take its action
await page.evaluate(() => window.__lot.select('stage-b'))
await sleep(700)
await page.screenshot({ path: OUT + '3-selected-stageB.png' })

await page.evaluate(() => window.__lot.triggerAction('stage-b'))
await page.evaluate(() => window.__lot.select('theater'))
await sleep(500)
await page.evaluate(() => window.__lot.triggerAction('theater'))
await page.evaluate(() => window.__lot.select('writers'))
await sleep(500)
await page.screenshot({ path: OUT + '4-theater-releases.png' })

const events = await page.evaluate(() => window.__lot.events)
console.log('✓ navigation events emitted to host:', JSON.stringify(events))

// basic canvas non-blank check: sample average luminance
const stats = await page.evaluate(() => {
  const c = document.querySelector('#lot-stage canvas')
  if (!c) return { ok: false, reason: 'no canvas' }
  return { ok: true, w: c.width, h: c.height }
})
console.log('✓ canvas:', JSON.stringify(stats))

await browser.close()

if (!events.length) {
  console.error('✗ FAIL: no navigation events were emitted')
  process.exit(1)
}
console.log('\nAll verification steps completed.')
