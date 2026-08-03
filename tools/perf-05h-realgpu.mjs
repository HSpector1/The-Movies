// Asset Lab 05H FINAL OWNER REVIEW — REAL-GPU performance harness (§9).
// Measures the renderer COST of live skinned 3D on the OWNER'S ACTUAL HARDWARE (this machine = Apple M3 Max,
// the acceptance hardware the 05H docs defer to). It deliberately does NOT force SwiftShader: it first tries
// GPU-accelerated headless, reads back WEBGL_debug_renderer_info, and if that is software it relaunches a
// HEADED (visible) window so WebGL runs on real Metal. The renderer string is recorded as proof.
//
// HONEST LABELS: FPS + draw calls + triangles + three.js GPU-resource COUNTS (geometries/textures/programs)
// are Builder-measured. JS HEAP (performance.memory) is heap, NOT GPU VRAM. GPU VRAM is not observable from
// JS — it is an OWNER-REQUIRED manual reading (Chrome ⋮ → More Tools → Task Manager → GPU Memory column);
// exact steps are emitted in the JSON. Run: npx vite --port 4321 --strictPort (another shell), then this.
import puppeteer from 'puppeteer-core'
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const TARGET = process.env.LAB_URL ?? 'http://localhost:4321/'
const OUT = fileURLToPath(new URL('../proof/lab05h/final-owner-review/performance/', import.meta.url))
const CHROME = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
mkdirSync(OUT, { recursive: true })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const MACHINE = { model: 'MacBook Pro (Mac15,9)', chip: 'Apple M3 Max', cores: '16 (12P/4E)', memoryGB: 128, os: 'macOS 26.5.1', metal: 'Metal 4', chrome: '150.0.7871.187' }

const GPU_ARGS = ['--enable-webgl', '--ignore-gpu-blocklist', '--enable-gpu-rasterization', '--use-angle=metal', '--no-sandbox']
const isSoftware = (r) => /swiftshader|software|llvmpipe|angle \(google/i.test(r)

async function launch(headless) {
  return puppeteer.launch({ executablePath: CHROME, headless, args: [...(headless ? [] : []), ...GPU_ARGS, '--js-flags=--expose-gc'] })
}
async function rendererOf(browser) {
  const p = await browser.newPage()
  const r = await p.evaluate(() => { try { const c = document.createElement('canvas'); const gl = c.getContext('webgl') || c.getContext('experimental-webgl'); const e = gl.getExtension('WEBGL_debug_renderer_info'); return e ? gl.getParameter(e.UNMASKED_RENDERER_WEBGL) : 'no-ext' } catch (err) { return 'error:' + err.message } })
  await p.close()
  return r
}

// pick the launch mode that yields a real GPU renderer
let browser = await launch('new')
let renderer = await rendererOf(browser)
let mode = 'headless-new'
if (isSoftware(renderer)) {
  console.log('  headless renderer is software (', renderer, ') — relaunching HEADED for real Metal')
  await browser.close()
  browser = await launch(false)
  renderer = await rendererOf(browser)
  mode = 'headed'
}
console.log('  launch mode:', mode, '| renderer:', renderer, '| software?', isSoftware(renderer))

const page = await browser.newPage()
let hadError = false
page.on('pageerror', (e) => { hadError = true; console.log('  [pageerror]', e.message) })
page.on('console', (m) => { if (m.type() === 'error') { const t = m.text(); if (!/favicon|404/.test(t)) { hadError = true; console.log('  [console.error]', t) } } })
await page.setViewport({ width: 1600, height: 1000, deviceScaleFactor: 2 })
await page.goto(TARGET, { waitUntil: 'networkidle0', timeout: 60000 })
await page.waitForFunction('!!window.__lab', { timeout: 30000 })
await page.evaluate((f) => window.__lab.setScene(f), 'G')
await sleep(600)
await page.waitForFunction('window.__lab.ready()', { timeout: 60000 }).catch(() => {})
await page.evaluate(() => window.__lab.set('showHud', false))

const heapMB = () => page.evaluate(() => { try { if (window.gc) window.gc() } catch {} ; return performance.memory ? +(performance.memory.usedJSHeapSize / 1048576).toFixed(1) : null })
const stats = () => page.evaluate(() => window.__lab.getStats())
async function scenario(label, view, secs = 8) {
  await page.evaluate((v) => window.__lab.setReview(v), view)
  await sleep(1800)
  const heapBefore = await heapMB()
  const probe = await page.evaluate((s) => window.__lab.perfProbe(s), secs)
  const st = await stats()
  const heapAfter = await heapMB()
  const row = { label, view, fps: { min: probe.min, median: probe.median, steadyState: probe.steadyState, max: probe.max, samples: probe.samples },
    drawCalls: st.drawCalls, triangles: st.triangles, geometries: st.geometries, textures: st.textures, programs: st.programs,
    sceneMeshes: st.sceneMeshes, heapMB_before: heapBefore, heapMB_after: heapAfter }
  console.log(`  ${label}: fps ${probe.min}/${probe.median}/${probe.steadyState} draws=${st.drawCalls} tris=${st.triangles} geo=${st.geometries} tex=${st.textures} heap=${heapAfter}MB`)
  return row
}

console.log('\nscenarios:')
const scenarios = []
scenarios.push(await scenario('1 worker (LOD0, static idle)', 'Mgmt/One Worker + Stage'))
scenarios.push(await scenario('2 workers (LOD0)', 'Mgmt/Two Workers + Cart'))
scenarios.push(await scenario('4 workers (LOD0)', 'Mgmt/Four Workers + Stage'))
scenarios.push(await scenario('LOD trio (1x LOD0 + 1x LOD1 + 1x LOD2)', '05H/LOD'))
scenarios.push(await scenario('2 heroes animated — Walk', '05H/Walk'))
scenarios.push(await scenario('2 heroes animated — Talk', '05H/Talk'))
scenarios.push(await scenario('2 heroes animated — Kneeling', '05H/Kneeling'))
scenarios.push(await scenario('2 heroes animated — Pickup', '05H/Pickup'))
scenarios.push(await scenario('2 heroes animated — Sitting', '05H/Sitting'))
scenarios.push(await scenario('side-by-side static (2 heroes)', '05H/Side-by-Side Front'))

// mount/unmount disposal cycles: review (heavy) <-> production overview (unmounts the review area)
console.log('\nmount/unmount disposal cycles (heap + GPU-resource counts should return to baseline):')
const cycles = []
const baseline = { heapMB: await (async () => { await page.evaluate(() => window.__lab.setReview('Full Scene Overview')); await sleep(1500); return heapMB() })(), stats: await stats() }
for (let i = 0; i < 6; i++) {
  await page.evaluate(() => window.__lab.setReview('05H/Walk')); await sleep(1200)
  const on = { heapMB: await heapMB(), ...(await stats()) }
  await page.evaluate(() => window.__lab.setReview('Full Scene Overview')); await sleep(1200)
  const off = { heapMB: await heapMB(), ...(await stats()) }
  cycles.push({ cycle: i + 1, mounted_heapMB: on.heapMB, mounted_geometries: on.geometries, mounted_textures: on.textures, unmounted_heapMB: off.heapMB, unmounted_geometries: off.geometries, unmounted_textures: off.textures })
  console.log(`  cycle ${i + 1}: mounted heap=${on.heapMB}MB geo=${on.geometries} tex=${on.textures} -> unmounted heap=${off.heapMB}MB geo=${off.geometries} tex=${off.textures}`)
}

const errCount = await page.evaluate(() => window.__lab.getErrorCount())
const result = {
  machine: MACHINE, launchMode: mode, renderer, isSoftwareRenderer: isSoftware(renderer),
  measured: 'Builder-measured on the owner\'s actual Apple M3 Max via browser automation (not a hand-run owner session).',
  labels: {
    builderMeasured: ['fps (rolling, app rAF)', 'drawCalls/frame', 'triangles/frame', 'three.js geometries/textures/programs counts', 'JS heap (performance.memory.usedJSHeapSize)'],
    heapCaveat: 'heapMB is JavaScript heap, NOT GPU VRAM. three.js geometries/textures are RESOURCE COUNTS, not bytes.',
    ownerRequired: 'GPU VRAM in bytes is not observable from JS. OWNER STEP: Chrome menu ⋮ -> More Tools -> Task Manager -> right-click header -> enable "GPU Memory"; read the tab\'s GPU Memory with a mgmt view vs Full Scene Overview.',
    unavailable: 'Per-frame GPU time / shader-compile stalls require chrome://tracing or the DevTools Performance panel (owner-run); not captured here.',
    fpsNote: mode === 'headed' ? 'Headed window on a ProMotion display may cap rAF at up to 120 Hz; steadyState is the meaningful number.' : 'headless',
  },
  scenarios, mountUnmountCycles: { baselineHeapMB: baseline.heapMB, baselineGeometries: baseline.stats.geometries, baselineTextures: baseline.stats.textures, cycles },
  consoleErrorFree: !hadError && errCount === 0, errorCount: errCount,
}
writeFileSync(OUT + 'realgpu-performance.json', JSON.stringify(result, null, 2) + '\n')
console.log(`\nwrote ${OUT}realgpu-performance.json | console-error-free: ${!hadError && errCount === 0}`)
await browser.close()
