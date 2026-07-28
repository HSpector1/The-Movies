// Asset Lab 03 evidence capture — HERO soundstage (Scene E) + greybox⇄hero comparison.
// Stored SEPARATELY from Lab 01/02 evidence, in proof/lab03/. Headless Chrome + SwiftShader,
// driving window.__lab. Deterministic shots keep the software-fragile enhancers (PCSS soft
// shadows, post FX) OFF; the zero-dependency core hero look carries the deliverable.
//   node tools/capture-lab03.mjs      (needs `npm run preview` on :4320)
import puppeteer from 'puppeteer-core'
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const TARGET = process.env.LAB_URL ?? 'http://localhost:4320/'
const OUT = fileURLToPath(new URL('../proof/lab03/', import.meta.url))
const CHROME = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
mkdirSync(OUT, { recursive: true })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// Scene-E framings (mirror src/lab/cameraBridge.ts E_VIEWS + a few evidence extras).
const E = {
  hero: [[23, 9, 27], [-2, 6, 3]],
  overview: [[34, 20, 42], [-2, 5, -1]],
  doors: [[-3.5, 5, 23], [-3.5, 5, 6]],
  apron: [[11, 4, 21], [-3, 1.5, 9]],
  roofline: [[19, 16, 19], [0, 11, -3]],
  human: [[1.5, 1.75, 16], [-3, 1.5, 8]],
  surface: [[-8.5, 3.5, 13], [-4, 4, 6]],   // procedural-PBR close-up (corrugated wall + door)
  detail: [[-9, 3.2, 12], [-3, 3, 6]],       // red-eye / man-door / conduit detail
  crew: [[4, 2.4, 20], [7, 1.4, 15]],        // video-village crew
}
const D = {
  soundstage: [[-8, 11, 8], [8, 6, -14]],    // greybox Stage 1 (Lab 02) for the comparison
  overview: [[42, 34, 48], [2, 2, -1]],
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
await page.goto(TARGET, { waitUntil: 'networkidle0', timeout: 45000 })
await page.waitForFunction('!!window.__lab', { timeout: 20000 })

const renderer = await page.evaluate(() => {
  try { const c = document.createElement('canvas'); const gl = c.getContext('webgl'); const ext = gl.getExtension('WEBGL_debug_renderer_info'); return ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : 'unknown' } catch { return 'unavailable' }
})
const isSoftware = /swiftshader|software|llvmpipe/i.test(renderer)
console.log('  renderer:', renderer, '=> software:', isSoftware)

const call = (fn, ...a) => page.evaluate((f, args) => window.__lab[f](...args), fn, a)
const set = (k, v) => call('set', k, v)
const view = (v) => call('view', v[0], v[1])
const shot = async (n) => { const c = await page.$('#root canvas'); await c.screenshot({ path: OUT + n }); console.log('  ✓', n) }
const shotPage = async (n) => { await page.screenshot({ path: OUT + n }); console.log('  ✓', n) }
const getStats = () => page.evaluate(() => window.__lab.getStats())

async function toScene(key, settle = 2400) {
  await call('setScene', key); await sleep(400)
  await page.waitForFunction('window.__lab.ready()', { timeout: 45000 }).catch(() => console.log('  (ready timeout ' + key + ')'))
  await sleep(settle)
}

// ---- Scene E — HERO soundstage, deterministic core look (soft shadows + post FX OFF) ----
await toScene('E', 2800)
await set('softShadows', false); await set('postFx', false); await sleep(600)
const loadMs = Date.now() - t0
await view(E.hero); await sleep(1100); await shot('01-hero.png')
await view(E.doors); await sleep(800); await shot('02-doors.png')
await view(E.apron); await sleep(800); await shot('03-apron.png')
await view(E.roofline); await sleep(800); await shot('04-roofline.png')
await view(E.surface); await sleep(800); await shot('05-surface-pbr.png')
await view(E.detail); await sleep(800); await shot('06-warning-light-detail.png')
await view(E.crew); await sleep(1200); await shot('07-crew.png')
await view(E.human); await sleep(800); await shot('08-human-scale.png')
await view(E.overview); await sleep(800); await shot('09-overview.png')

// ---- fidelity-layer breakdown (what each layer contributes) ----
await view(E.hero); await set('showApron', false); await sleep(900); await shot('10-building-only.png')
await set('showApron', true); await set('showShadows', false); await sleep(900); await shot('11-no-shadows.png')
await set('showShadows', true); await set('wireframe', true); await sleep(900); await shot('12-wireframe.png'); await set('wireframe', false)

// ---- greybox (D) ⇄ hero (E) comparison ----
await view(E.hero); await sleep(600); await shot('13-hero-E.png')
await toScene('D', 2400); await view(D.soundstage); await sleep(1000); await shot('14-greybox-D.png')
await toScene('E', 2200)

// ---- performance samples (core look) ----
// Longer settle per sample: SwiftShader runs ~2-3 fps, so stats need several frames to reflect a
// toggle. building-only turns crew AND apron OFF for a true bespoke-building triangle count.
const perf = []
const sample = async (label, anim) => { const s = await getStats(); perf.push({ label, ...s, activeAnimations: anim, renderer, isSoftware }); console.log(`  perf[${label}] fps=${s.fps} draws=${s.drawCalls} tris=${s.triangles} geos=${s.geometries} texs=${s.textures}`) }
await view(E.hero); await sleep(1500); await sample('E/hero-all', 6)
await set('showCharacters', false); await sleep(1500); await sample('E/no-crew', 0)
await set('showApron', false); await sleep(1500); await sample('E/building-only', 0)   // crew AND apron OFF = bespoke building only
await set('showCharacters', true); await set('showApron', true); await set('showShadows', false); await sleep(1500); await sample('E/no-shadows', 6)
await set('showShadows', true); await sleep(400)
await shotPage('15-panel.png')

// ---- optional PCSS soft-shadow evidence (global shader patch; guarded) ----
try {
  await set('softShadows', true); await view(E.hero); await sleep(1400); await shot('16-soft-shadows.png')
  await set('softShadows', false)
} catch (e) { console.log('  (soft-shadow shot skipped:', e.message, ')') }

// ---- optional POST-FX evidence (N8AO + bloom + vignette + SMAA; software-fragile; guarded) ----
// Post FX is a real-GPU enhancement. This attempt shows whether the composer even survives
// SwiftShader; console errors it raises are reported separately and do NOT fail the core run.
const preFxError = hadError
try {
  await set('postFx', true); await view(E.hero); await sleep(2200); await shot('17-postfx.png')
  await set('postFx', false); await sleep(400)
  if (hadError && !preFxError) console.log('  (NOTE: post-fx raised console errors under SwiftShader — expected; it is a real-GPU feature)')
} catch (e) { console.log('  (post-fx shot skipped:', e.message, ')') }
// Do not let a software-only post-fx failure flip the deterministic core-look verdict.
hadError = preFxError

writeFileSync(OUT + 'performance-lab03.json', JSON.stringify({
  tool: 'capture-lab03',
  note: 'Diagnostic only — headless SwiftShader software rendering, NOT target-hardware acceptance. Real-GPU numbers require an owner-observed run. Post FX (bloom/AO) and PCSS soft shadows are real-GPU enhancements, OFF for the deterministic core-look shots.',
  renderer, isSoftware, viewport: { width: 1600, height: 1000, dpr: 2 },
  initialLoadMs: loadMs, samples: perf,
}, null, 2) + '\n')
console.log('\nwrote proof/lab03/performance-lab03.json ; loadMs=' + loadMs + ' ; console-error-free:', !hadError)
await browser.close()
process.exit(hadError ? 2 : 0)
