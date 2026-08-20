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
  'ui/e2e/world-first-scenery-load-in-v1/week-30-nights-of-watchtower-stage-7-ready.save.json',
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
  name: 'overview' | 'production' | 'production-close' | 'construction'
  fixture: string
  // Aliases intentionally name only existing renderer camera presets. See the docs
  // for the limitation: no separately named production-close/construction preset exists.
  cameraPreset: 'overview' | 'production' | 'theater'
}

const CAPTURES: readonly Capture[] = [
  { name: 'overview', fixture: productionFixture, cameraPreset: 'overview' },
  { name: 'production', fixture: productionFixture, cameraPreset: 'production' },
  { name: 'production-close', fixture: productionFixture, cameraPreset: 'production' },
  { name: 'construction', fixture: constructionFixture, cameraPreset: 'theater' },
]

type PngFacts = { width: number; height: number; byteLength: number; distinctSamples: number }

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

async function selectPreset(page: Page, preset: Capture['cameraPreset']): Promise<void> {
  const reached = await page.evaluate((requestedPreset) => {
    const view = (globalThis as typeof globalThis & {
      __projectStudio3dVisualRegressionView?: { camera?: (preset: string) => void; threeScene?: unknown }
    }).__projectStudio3dVisualRegressionView
    if (view?.threeScene === undefined || view.threeScene === null || typeof view.camera !== 'function') return false
    view.camera(requestedPreset)
    return true
  }, preset)
  expect(reached, `required camera preset ${preset} could not be reached`).toBe(true)
  // The 3D camera settles toward its preset. Reduced motion removes ambient actor motion;
  // this pause gives the camera's own interpolation a fixed, conservative completion window.
  await page.waitForTimeout(1_000)
}

test.describe.configure({ timeout: 300_000 })

test('capture canonical real-3D studio views', async ({ browser }) => {
  mkdirSync(outputDir, { recursive: true })
  const failures: string[] = []
  const screenshots: Array<{ name: string; path: string; cameraPreset: string; fixture: string }> = []

  for (const capture of CAPTURES) {
    const page = await browser.newPage({ viewport: VIEWPORT })
    page.on('pageerror', (error) => failures.push(`${capture.name}: page error: ${String(error)}`))
    page.on('console', (message) => {
      if (message.type() === 'error') failures.push(`${capture.name}: console error: ${message.text()}`)
    })
    await installFixture(page, capture.fixture)
    await waitForThreeReady(page)
    await selectPreset(page, capture.cameraPreset)

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
      cameraPreset: capture.cameraPreset,
      fixture: relative(repoRoot, capture.fixture),
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
    captures: screenshots,
  }, null, 2)}\n`)
})
