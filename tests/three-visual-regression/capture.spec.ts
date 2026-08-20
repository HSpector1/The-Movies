// Canonical 3D visual-regression capture. This is intentionally a capture harness,
// not a pixel-diff spec: its only visual assertions establish that real, non-blank
// 1600×900 renderer output was produced from the documented deterministic saves.

import { expect, test, type Page } from '@playwright/test'
import { execFileSync } from 'node:child_process'
import { inflateSync } from 'node:zlib'
import { mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(here, '..', '..')
const outputDir = join(repoRoot, 'out', 'visual-regression')
const productionFixture = join(
  repoRoot,
  'ui/e2e/live-week-advance-v1/week-30-nights-of-watchtower-stage-7-scheduled.save.json',
)
const constructionFixture = join(
  repoRoot,
  'ui/e2e/live-week-advance-v1/week-11-annex-progress-then-completion.save.json',
)

const ACTIVE_SESSION_KEY = 'project-studio.active-session.v4'
const ACTIVE_SESSION_CORRUPT_KEY = 'project-studio.active-session.v4.corrupt'
const THREE_LOT_LS_KEY = 'project-studio.flags.three-lot'
const VIEWPORT = { width: 1600, height: 900 } as const

type Capture = {
  name: 'overview' | 'production' | 'hero-stage-medium' | 'hero-stage-close' | 'construction' | 'backlot'
  fixture: string
  framing:
    | { kind: 'preset'; preset: 'overview' | 'production' }
    | { kind: 'building'; buildingId: string; scale: number; yaw?: number }
    | { kind: 'set'; buildingId: string; scale: number; yaw?: number }
}

const CAPTURES: readonly Capture[] = [
  { name: 'overview', fixture: productionFixture, framing: { kind: 'preset', preset: 'overview' } },
  { name: 'production', fixture: productionFixture, framing: { kind: 'preset', preset: 'production' } },
  { name: 'hero-stage-medium', fixture: productionFixture, framing: { kind: 'building', buildingId: 'stage-a', scale: 3.15 } },
  { name: 'hero-stage-close', fixture: productionFixture, framing: { kind: 'building', buildingId: 'stage-a', scale: 5.15 } },
  { name: 'construction', fixture: constructionFixture, framing: { kind: 'building', buildingId: 'expansion', scale: 4.1, yaw: -1.5 } },
  { name: 'backlot', fixture: productionFixture, framing: { kind: 'set', buildingId: 'stage-a', scale: 4.05 } },
]

type ThreePerformance = {
  rendererKind?: string
  frameSampleCount: number
  fps: number
  onePercentLowFps: number
  p99FrameMs: number
  worstFrameMs: number
  displayObjects: number
  dynamicActors: number
  drawCalls: number
  textureCount?: number
}

type PngFacts = { width: number; height: number; byteLength: number; distinctSamples: number }
type BrowserGraphics = {
  userAgent: string
  platform: string
  hardwareConcurrency: number
  webglVendor: string
  webglRenderer: string
}

function be32(buffer: Buffer, offset: number): number {
  return buffer.readUInt32BE(offset)
}

/** Read enough of a non-interlaced RGBA/RGB PNG to reject an empty one-colour canvas. */
function pngFacts(bytes: Buffer): PngFacts {
  expect(bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))).toBe(true)
  let cursor = 8
  let width = 0
  let height = 0
  let colorType = -1
  const idat: Buffer[] = []
  while (cursor < bytes.length) {
    const length = be32(bytes, cursor)
    const type = bytes.toString('ascii', cursor + 4, cursor + 8)
    const dataStart = cursor + 8
    const dataEnd = dataStart + length
    if (dataEnd + 4 > bytes.length) throw new Error('PNG chunk extends beyond file')
    if (type === 'IHDR') {
      width = be32(bytes, dataStart)
      height = be32(bytes, dataStart + 4)
      const bitDepth = bytes[dataStart + 8]
      colorType = bytes[dataStart + 9]
      if (bitDepth !== 8 || (colorType !== 2 && colorType !== 6)) {
        throw new Error(`unsupported PNG layout: bit depth ${String(bitDepth)}, colour type ${String(colorType)}`)
      }
    } else if (type === 'IDAT') idat.push(bytes.subarray(dataStart, dataEnd))
    else if (type === 'IEND') break
    cursor = dataEnd + 4
  }
  if (width === 0 || height === 0 || idat.length === 0) throw new Error('PNG lacks image data')

  const channels = colorType === 6 ? 4 : 3
  const stride = width * channels
  const raw = inflateSync(Buffer.concat(idat))
  if (raw.length !== height * (stride + 1)) throw new Error('unexpected PNG scanline length')
  const previous = Buffer.alloc(stride)
  const current = Buffer.alloc(stride)
  const samples = new Set<string>()
  let offset = 0
  for (let y = 0; y < height; y++) {
    const filter = raw[offset++]!
    for (let x = 0; x < stride; x++) {
      const value = raw[offset++]!
      const left = x >= channels ? current[x - channels]! : 0
      const up = previous[x]!
      const upLeft = x >= channels ? previous[x - channels]! : 0
      let reconstructed: number
      if (filter === 0) reconstructed = value
      else if (filter === 1) reconstructed = (value + left) & 255
      else if (filter === 2) reconstructed = (value + up) & 255
      else if (filter === 3) reconstructed = (value + Math.floor((left + up) / 2)) & 255
      else if (filter === 4) {
        const p = left + up - upLeft
        const pa = Math.abs(p - left)
        const pb = Math.abs(p - up)
        const pc = Math.abs(p - upLeft)
        reconstructed = (value + (pa <= pb && pa <= pc ? left : pb <= pc ? up : upLeft)) & 255
      } else throw new Error(`unsupported PNG filter ${String(filter)}`)
      current[x] = reconstructed
    }
    // Sparse sampling keeps this smoke check quick while still detecting a blank canvas.
    for (let x = 0; x < stride; x += channels * 97) {
      samples.add(Array.from(current.subarray(x, x + Math.min(channels, 3))).join(','))
    }
    current.copy(previous)
  }
  return { width, height, byteLength: bytes.length, distinctSamples: samples.size }
}

/** Expose the existing public camera() method without changing the tracked renderer. */
function instrumentLotViewModule(source: string): string {
  const marker = 'constructor(opts) {\n    this.opts = opts;'
  if (!source.includes(marker)) throw new Error('3D capture harness: StudioLotView instrumentation marker is absent')
  return source.replace(
    marker,
    `constructor(opts) {
    globalThis.__projectStudio3dVisualRegressionView = this;
    this.opts = opts;`,
  )
}

async function installFixture(page: Page, fixturePath: string): Promise<void> {
  const save = readFileSync(fixturePath, 'utf8')
  await page.route('**/src/lot/StudioLotView.ts*', async (route) => {
    const response = await route.fetch()
    await route.fulfill({ response, body: instrumentLotViewModule(await response.text()) })
  })
  await page.addInitScript(({ save: session, sessionKey, corruptKey, threeLotKey }) => {
    localStorage.setItem(sessionKey, session)
    localStorage.removeItem(corruptKey)
    localStorage.setItem(threeLotKey, '1')
  }, {
    save,
    sessionKey: ACTIVE_SESSION_KEY,
    corruptKey: ACTIVE_SESSION_CORRUPT_KEY,
    threeLotKey: THREE_LOT_LS_KEY,
  })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  // A Three asset may keep the browser's `load` event open even while the React
  // host and renderer are usable. Readiness is asserted explicitly below.
  await page.goto('/', { waitUntil: 'domcontentloaded' })
}

async function waitForThreeReady(page: Page): Promise<void> {
  await expect(page.getByTestId('studio-lot-screen')).toBeVisible({ timeout: 60_000 })
  const canvas = page.getByTestId('studio-lot-canvas').locator('canvas')
  await expect(canvas).toHaveCount(1, { timeout: 60_000 })
  await expect(page.getByText('Preparing the lot…', { exact: true })).toHaveCount(0, { timeout: 60_000 })
  await expect.poll(() => page.evaluate(() => {
    const view = (globalThis as typeof globalThis & {
      __projectStudio3dVisualRegressionView?: { useThree?: boolean; threeScene?: unknown }
    }).__projectStudio3dVisualRegressionView
    return view?.useThree === true && view.threeScene !== undefined && view.threeScene !== null
  }), { timeout: 60_000 }).toBe(true)
}

async function selectFraming(page: Page, framing: Capture['framing']): Promise<void> {
  const reached = await page.evaluate((requestedFraming) => {
    const view = (globalThis as typeof globalThis & {
      __projectStudio3dVisualRegressionView?: {
        camera?: (preset: string) => void
        frameBuilding?: (buildingId: string, scale: number) => boolean
        frameMountedSet?: (buildingId: string, scale: number) => boolean
        threeScene?: {
          frameBuilding?: (buildingId: string, scale: number, yaw: number) => boolean
          frameMountedSet?: (buildingId: string, scale: number, yaw: number) => boolean
        }
      }
    }).__projectStudio3dVisualRegressionView
    if (view?.threeScene === undefined || view.threeScene === null) return false
    if (requestedFraming.kind === 'preset') {
      if (typeof view.camera !== 'function') return false
      view.camera(requestedFraming.preset)
      return true
    }
    if (requestedFraming.kind === 'set') {
      if (requestedFraming.yaw !== undefined && typeof view.threeScene.frameMountedSet === 'function') {
        return view.threeScene.frameMountedSet(
          requestedFraming.buildingId,
          requestedFraming.scale,
          requestedFraming.yaw,
        )
      }
      return typeof view.frameMountedSet === 'function' &&
        view.frameMountedSet(requestedFraming.buildingId, requestedFraming.scale)
    }
    if (requestedFraming.yaw !== undefined && typeof view.threeScene.frameBuilding === 'function') {
      return view.threeScene.frameBuilding(
        requestedFraming.buildingId,
        requestedFraming.scale,
        requestedFraming.yaw,
      )
    }
    return typeof view.frameBuilding === 'function' &&
      view.frameBuilding(requestedFraming.buildingId, requestedFraming.scale)
  }, framing)
  expect(reached, `required camera framing ${JSON.stringify(framing)} could not be reached`).toBe(true)
  // The 3D camera settles toward its preset. Reduced motion removes ambient actor motion;
  // this pause gives the camera's own interpolation a fixed, conservative completion window.
  await page.waitForTimeout(1_000)
}

async function measureThree(page: Page): Promise<ThreePerformance> {
  const reset = await page.evaluate(() => {
    const view = (globalThis as typeof globalThis & {
      __projectStudio3dVisualRegressionView?: { resetHollywoodPerformance?: () => void }
    }).__projectStudio3dVisualRegressionView
    if (typeof view?.resetHollywoodPerformance !== 'function') return false
    view.resetHollywoodPerformance()
    return true
  })
  expect(reset, 'Three performance window could not be reset').toBe(true)
  await page.waitForTimeout(4_000)
  const measured = await page.evaluate(() => {
    const view = (globalThis as typeof globalThis & {
      __projectStudio3dVisualRegressionView?: { hollywoodPerformance?: () => ThreePerformance | null }
    }).__projectStudio3dVisualRegressionView
    return view?.hollywoodPerformance?.() ?? null
  })
  expect(measured, 'Three performance stats were unavailable').not.toBeNull()
  expect(measured?.rendererKind).toBe('three-3d')
  // Chromium's headless software renderer may be deliberately throttled. A headed
  // evidence run fills the full 240-frame window; CI only needs a non-trivial sample.
  expect(measured?.frameSampleCount ?? 0).toBeGreaterThan(12)
  expect(measured?.fps ?? 0).toBeGreaterThan(0)
  expect(measured?.drawCalls ?? 0).toBeGreaterThan(0)
  expect(measured?.textureCount ?? 0).toBeGreaterThan(0)
  return measured!
}

async function browserGraphics(page: Page): Promise<BrowserGraphics> {
  return page.evaluate(() => {
    type WebGlLike = {
      VENDOR: number
      RENDERER: number
      getExtension: (name: string) => { UNMASKED_VENDOR_WEBGL: number; UNMASKED_RENDERER_WEBGL: number } | null
      getParameter: (parameter: number) => unknown
    }
    const browser = globalThis as unknown as {
      document: {
        querySelector: (selector: string) => { getContext: (type: string) => WebGlLike | null } | null
      }
      navigator: { userAgent: string; platform: string; hardwareConcurrency: number }
    }
    const canvas = browser.document.querySelector('[data-testid="studio-lot-canvas"] canvas')
    const gl = canvas?.getContext('webgl2') ?? canvas?.getContext('webgl') ?? null
    const debug = gl?.getExtension('WEBGL_debug_renderer_info') ?? null
    return {
      userAgent: browser.navigator.userAgent,
      platform: browser.navigator.platform,
      hardwareConcurrency: browser.navigator.hardwareConcurrency,
      webglVendor: gl === null
        ? 'unavailable'
        : String(gl.getParameter(debug?.UNMASKED_VENDOR_WEBGL ?? gl.VENDOR)),
      webglRenderer: gl === null
        ? 'unavailable'
        : String(gl.getParameter(debug?.UNMASKED_RENDERER_WEBGL ?? gl.RENDERER)),
    }
  })
}

test.describe.configure({ timeout: 300_000 })

test('capture canonical real-3D studio views', async ({ browser }) => {
  mkdirSync(outputDir, { recursive: true })
  const failures: string[] = []
  let graphics: BrowserGraphics | null = null
  const screenshots: Array<{
    name: string
    path: string
    framing: Capture['framing']
    fixture: string
    performance: ThreePerformance
  }> = []

  for (const capture of CAPTURES) {
    const page = await browser.newPage({ viewport: VIEWPORT })
    page.on('pageerror', (error) => failures.push(`${capture.name}: page error: ${String(error)}`))
    page.on('console', (message) => {
      if (message.type() === 'error') failures.push(`${capture.name}: console error: ${message.text()}`)
    })
    await installFixture(page, capture.fixture)
    await waitForThreeReady(page)
    graphics ??= await browserGraphics(page)
    await selectFraming(page, capture.framing)
    const performance = await measureThree(page)

    const canvasFacts = pngFacts(Buffer.from(await page.getByTestId('studio-lot-canvas').locator('canvas').screenshot()))
    expect(canvasFacts.byteLength, `${capture.name}: 3D canvas screenshot is trivial`).toBeGreaterThan(20_000)
    expect(canvasFacts.distinctSamples, `${capture.name}: 3D canvas appears blank`).toBeGreaterThan(32)

    const screenshotPath = join(outputDir, `${capture.name}.png`)
    await page.screenshot({ path: screenshotPath })
    const facts = pngFacts(readFileSync(screenshotPath))
    expect(facts.width, `${capture.name}: screenshot width`).toBe(VIEWPORT.width)
    expect(facts.height, `${capture.name}: screenshot height`).toBe(VIEWPORT.height)
    expect(facts.byteLength, `${capture.name}: screenshot is trivial`).toBeGreaterThan(20_000)
    expect(facts.distinctSamples, `${capture.name}: screenshot appears blank`).toBeGreaterThan(32)
    expect(statSync(screenshotPath).isFile(), `${capture.name}: screenshot was not written`).toBe(true)
    screenshots.push({
      name: capture.name,
      path: relative(repoRoot, screenshotPath),
      framing: capture.framing,
      fixture: relative(repoRoot, capture.fixture),
      performance,
    })
    await page.close()
  }

  expect(failures, failures.join('\n')).toEqual([])
  const head = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: repoRoot, encoding: 'utf8' }).trim()
  writeFileSync(join(outputDir, 'manifest.json'), `${JSON.stringify({
    gitHead: head,
    timestamp: new Date().toISOString(),
    viewport: VIEWPORT,
    rendererFlag: { VITE_THREE_LOT: '1' },
    browserGraphics: graphics,
    captures: screenshots,
  }, null, 2)}\n`)
})
