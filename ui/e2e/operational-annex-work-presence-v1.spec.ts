import { expect, test, type Page } from '@playwright/test'
import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(here, '..', '..')
const fixtureDir = join(here, 'world-first-operational-annex-work-presence-v1')
const governedPerformanceFixture = join(
  here,
  'world-first-scenery-load-in-v1',
  'week-30-nights-of-watchtower-stage-7-blocked.save.json',
)
const outDir = join(repoRoot, 'out', 'world-first-operational-annex-work-presence-v1')

const ACTIVE_SESSION_KEY = 'project-studio.active-session.v4'
const LOT_FLAG_KEY = 'project-studio.flags.studio-lot-overview'
const HOLLYWOOD_FLAG_KEY = 'project-studio.flags.operation-hollywood'
const IDENTITY_PROOF_FLAG_KEY = 'project-studio.flags.studio-lot-identity-proof'

const FIXTURES = {
  available: {
    file: 'week-13-operational-annex-available.save.json',
    sha256: '4026c51603afe35605a9d5a71391764cd6dfea3972ef3a8d20ef3b3987dc4652',
    week: 13,
  },
  scriptWorking: {
    file: 'week-13-operational-annex-script-working.save.json',
    sha256: 'cb49f61ac81d239b14db744fdc7b37b91ccd507e8f0e4a8fda56e802bd96bdc4',
    week: 13,
  },
  productionWorking: {
    file: 'week-14-operational-annex-production-development-working.save.json',
    sha256: 'd7213ae7c064ad59ac685a777042b0b237d9ce1c367a9af3b9d754cb25b8044e',
    week: 14,
  },
} as const

type FixtureKey = keyof typeof FIXTURES

const HOLLYWOOD_DISTRICT_WIDTH = 1586
const HOLLYWOOD_DISTRICT_HEIGHT = 992
const HOLLYWOOD_CAMERA_BOUNDS = { x: -120, y: -90, width: 1826, height: 1172 } as const
const ANNEX_WORLD_POINT = { x: 640, y: 790 } as const

const EXPECTED_DISPLAY_OBJECTS = 34
const EXPECTED_DYNAMIC_ACTORS = 15
const EXPECTED_DECODED_BYTES = 11_096_896
const EXPECTED_DRAW_CALLS = 1
const GENERATED_AND_VEHICLE_TEXTURE_BYTES = 163_064
const GOVERNED_PERFORMANCE_FIXTURE_SHA256 =
  '7534518e4db3970bb4ca988b0b0fa78975f5053ee67fd42377f69b80ebe711dc'

mkdirSync(outDir, { recursive: true })

test.beforeAll(() => {
  const manifest = JSON.parse(readFileSync(join(fixtureDir, 'manifest.json'), 'utf8'))
  expect(manifest.authority).toMatchObject({
    serialization: 'exportSaveJson / importSaveJson native SaveFileV11 boundary',
    importMode: 'native SaveFileV11; converted === false',
    deterministic: true,
    configuredHeldSave: false,
  })
  expect(manifest.fixtures.map((fixture: { claim: { contextState: string } }) => (
    fixture.claim.contextState
  ))).toEqual(['available', 'working', 'working'])

  for (const fixture of Object.values(FIXTURES)) {
    const bytes = readFileSync(join(fixtureDir, fixture.file))
    expect(createHash('sha256').update(bytes).digest('hex')).toBe(fixture.sha256)
  }
  expect(
    createHash('sha256').update(readFileSync(governedPerformanceFixture)).digest('hex'),
  ).toBe(GOVERNED_PERFORMANCE_FIXTURE_SHA256)

  const district = JSON.parse(readFileSync(
    join(here, '..', 'public', 'lot', 'hollywood', 'district-manifest.json'),
    'utf8',
  ))
  const roleAtlas = JSON.parse(readFileSync(
    join(here, '..', 'public', 'lot', 'hollywood', 'role-atlas-v1.json'),
    'utf8',
  ))
  expect(
    district.textureMemoryBytes +
      roleAtlas.atlasDecodedRgbaBytes +
      GENERATED_AND_VEHICLE_TEXTURE_BYTES,
  ).toBe(EXPECTED_DECODED_BYTES)
})

function captureRuntimeErrors(page: Page): string[] {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  return errors
}

async function seedAnnexLot(
  page: Page,
  fixtureKey: FixtureKey,
  options: { identityProof?: boolean; expectCanvas?: boolean } = {},
) {
  const fixture = FIXTURES[fixtureKey]
  const save = readFileSync(join(fixtureDir, fixture.file), 'utf8')
  await page.addInitScript(
    ([sessionKey, saveJson, lotFlag, hollywoodFlag, identityFlag, proof]) => {
      localStorage.setItem(sessionKey as string, saveJson as string)
      // Absence exercises the shipped ordinary-player Studio Home and Hollywood defaults.
      localStorage.removeItem(lotFlag as string)
      localStorage.removeItem(hollywoodFlag as string)
      if (proof) localStorage.setItem(identityFlag as string, '1')
      else localStorage.removeItem(identityFlag as string)
    },
    [
      ACTIVE_SESSION_KEY,
      save,
      LOT_FLAG_KEY,
      HOLLYWOOD_FLAG_KEY,
      IDENTITY_PROOF_FLAG_KEY,
      options.identityProof === true,
    ] as const,
  )
  await page.goto('/')
  await expect(page.getByTestId('recovery-notice')).toContainText(`Week ${fixture.week}`)
  await expect(page.getByTestId('studio-lot-screen')).toBeVisible()
  if (options.expectCanvas !== false) {
    await expect(page.getByTestId('studio-lot-canvas').locator('canvas')).toHaveCount(1)
  }
  await expect(page.getByText('Preparing the lot…', { exact: true })).toHaveCount(0)
  await page.waitForTimeout(1_200)
}

async function seedGovernedPerformanceLot(page: Page) {
  const save = readFileSync(governedPerformanceFixture, 'utf8')
  await page.addInitScript(
    ([sessionKey, saveJson, lotFlag, hollywoodFlag, identityFlag]) => {
      localStorage.setItem(sessionKey as string, saveJson as string)
      localStorage.removeItem(lotFlag as string)
      localStorage.removeItem(hollywoodFlag as string)
      localStorage.setItem(identityFlag as string, '1')
    },
    [ACTIVE_SESSION_KEY, save, LOT_FLAG_KEY, HOLLYWOOD_FLAG_KEY, IDENTITY_PROOF_FLAG_KEY] as const,
  )
  await page.goto('/')
  await expect(page.getByTestId('recovery-notice')).toContainText('Week 30')
  await expect(page.getByTestId('studio-lot-screen')).toBeVisible()
  await expect(page.getByTestId('hollywood-current-production')).toContainText(
    'Nights of Watchtower',
  )
  await expect(page.getByTestId('studio-lot-canvas').locator('canvas')).toHaveCount(1)
  await expect(page.getByText('Preparing the lot…', { exact: true })).toHaveCount(0)
  await page.waitForTimeout(1_200)
}

async function activeSessionBytes(page: Page): Promise<string> {
  const value = await page.evaluate((key) => localStorage.getItem(key), ACTIVE_SESSION_KEY)
  expect(value).not.toBeNull()
  return value!
}

/** Click an authored district coordinate through the fitted Phaser camera. */
async function clickHollywoodWorldPoint(page: Page, point: { x: number; y: number }) {
  const canvas = page.getByTestId('studio-lot-canvas').locator('canvas')
  const box = await canvas.boundingBox()
  expect(box, 'the live Hollywood canvas must have a box').not.toBeNull()
  const zoom = Math.min(
    box!.width / HOLLYWOOD_DISTRICT_WIDTH,
    box!.height / HOLLYWOOD_DISTRICT_HEIGHT,
  )
  const cameraWidth = box!.width / zoom
  const cameraHeight = box!.height / zoom
  const fittedScroll = (
    desired: number,
    boundStart: number,
    boundSize: number,
    cameraSize: number,
  ) => cameraSize >= boundSize
    ? boundStart
    : Math.max(boundStart, Math.min(boundStart + boundSize - cameraSize, desired))
  const scrollX = fittedScroll(
    HOLLYWOOD_DISTRICT_WIDTH / 2 - cameraWidth / 2,
    HOLLYWOOD_CAMERA_BOUNDS.x,
    HOLLYWOOD_CAMERA_BOUNDS.width,
    cameraWidth,
  )
  const scrollY = fittedScroll(
    HOLLYWOOD_DISTRICT_HEIGHT / 2 - cameraHeight / 2,
    HOLLYWOOD_CAMERA_BOUNDS.y,
    HOLLYWOOD_CAMERA_BOUNDS.height,
    cameraHeight,
  )
  await canvas.click({
    position: {
      x: (point.x - scrollX) * zoom,
      y: (point.y - scrollY) * zoom,
    },
  })
}

async function activateSemanticAnnex(page: Page) {
  const annexDestination = page.getByTestId('lot-nav-expansion')
  await annexDestination.focus()
  await expect(annexDestination).toBeFocused()
  await annexDestination.press('Enter')
}

async function expectStructuralTelemetry(
  page: Page,
  expected: { displayObjects: number; dynamicActors: number },
) {
  const performance = page.getByTestId('hollywood-performance')
  await expect(performance).toHaveAttribute('data-frame-samples', '240', { timeout: 20_000 })
  const telemetry = (await performance.textContent()) ?? ''
  const values = telemetry.match(
    /^(\d+) fps · (\d+) fps 1% low · (\d+) objects · (\d+) actors · ([\d.]+) MB decoded .+ · ([\d.]+) ms p99 · ([\d.]+) ms worst .+ · (\d+) draws$/,
  )
  expect(values, telemetry).not.toBeNull()
  expect(Number(values![3])).toBe(expected.displayObjects)
  expect(Number(values![4])).toBe(expected.dynamicActors)
  expect(Number(values![5])).toBe(
    Math.round((EXPECTED_DECODED_BYTES / 1024 / 1024) * 10) / 10,
  )
  expect(Number(values![8])).toBe(EXPECTED_DRAW_CALLS)
  return performance
}

test('physical Operational Annex exposes exact native Available truth in the living lot', async ({ page }) => {
  const runtimeErrors = captureRuntimeErrors(page)
  await page.setViewportSize({ width: 1366, height: 768 })
  await seedAnnexLot(page, 'available')
  await page.getByTestId('recovery-dismiss').click()
  const beforeBytes = await activeSessionBytes(page)
  const canvas = page.getByTestId('studio-lot-canvas').locator('canvas')
  await canvas.evaluate((node) => node.setAttribute('data-annex-mount', 'original'))

  await expect(page.getByTestId('lot-annex-context')).toHaveCount(0)
  await clickHollywoodWorldPoint(page, ANNEX_WORLD_POINT)
  await expect(page.getByTestId('lot-annex-context')).toBeVisible()
  await expect(page.getByTestId('lot-nav-expansion')).toHaveAttribute('aria-current', 'true')
  await expect(page.getByTestId('lot-annex-status')).toContainText('Operational')
  await expect(page.getByTestId('lot-annex-status')).toContainText(
    'Completed in Week 13. Current Annex slot use: 0 of 1.',
  )
  await expect(page.getByTestId('lot-annex-work-available')).toContainText('0 / 1')
  await expect(page.getByTestId('lot-annex-work-available')).toContainText('Available')
  await expect(page.getByTestId('lot-annex-work-occupied')).toHaveCount(0)
  await expect(page.getByTestId('lot-annex-open-work-details')).toHaveCount(0)
  await expect(canvas).toHaveAttribute('data-annex-mount', 'original')
  await page.screenshot({ path: join(outDir, '01-physical-operational-available-1366x768.png') })

  expect(await activeSessionBytes(page)).toBe(beforeBytes)
  expect(runtimeErrors, runtimeErrors.join('\n')).toEqual([])
})

test('keyboard and reduced motion preserve exact script Working handoff and fresh Annex return', async ({ page }) => {
  const runtimeErrors = captureRuntimeErrors(page)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await seedAnnexLot(page, 'scriptWorking')
  await page.getByTestId('recovery-dismiss').click()
  await expect(page.getByTestId('studio-lot-screen')).toHaveClass(/lot-reduced-motion/)
  const stableUrl = page.url()
  const beforeBytes = await activeSessionBytes(page)

  await activateSemanticAnnex(page)
  await expect(page.getByTestId('lot-annex-current-work-heading')).toBeFocused()
  const work = page.getByTestId('lot-annex-work-occupied')
  await expect(work).toContainText('1 / 1')
  await expect(work).toContainText('Occupied')
  await expect(work).toContainText('Working')
  await expect(work).toContainText('Screenplay')
  await expect(work).toContainText('The Silent Widow')
  await expect(work).toContainText('Drafting')
  await expect(page.getByTestId('lot-annex-work-blocker')).toHaveCount(0)

  const openWriters = page.getByTestId('lot-annex-open-work-details')
  await expect(openWriters).toHaveText('Open Writers Room · The Silent Widow')
  await openWriters.focus()
  await openWriters.press('Enter')
  await expect(page.getByTestId('writers-room')).toBeVisible()
  await expect(page.getByTestId('script-card-script-0002')).toContainText('The Silent Widow')
  await expect(page.getByTestId('script-status-script-0002')).toContainText('Drafting')
  await expect(page.getByTestId('script-status-script-0002')).toBeFocused()
  expect(page.url()).toBe(stableUrl)
  expect(await activeSessionBytes(page)).toBe(beforeBytes)

  await page.getByTestId('writers-room-back').click()
  await expect(page.getByTestId('lot-annex-context')).toBeVisible()
  await expect(page.getByTestId('lot-annex-current-work-heading')).toBeFocused()
  await expect(page.getByTestId('lot-annex-status')).toContainText(
    'Completed in Week 13. Current Annex slot use: 1 of 1.',
  )
  await expect(page.getByTestId('lot-annex-work-occupied')).toContainText('The Silent Widow')
  await expect(page.getByTestId('studio-lot-canvas').locator('canvas')).toHaveCount(1)
  expect(page.url()).toBe(stableUrl)
  expect(await activeSessionBytes(page)).toBe(beforeBytes)
  await page.screenshot({ path: join(outDir, '02-script-working-return-reduced-motion.png') })
  expect(runtimeErrors, runtimeErrors.join('\n')).toEqual([])
})

test('native production Working is embodied by the physical Annex and opens the exact Dashboard card', async ({ page }) => {
  const runtimeErrors = captureRuntimeErrors(page)
  await page.setViewportSize({ width: 1366, height: 768 })
  await seedAnnexLot(page, 'productionWorking')
  await page.getByTestId('recovery-dismiss').click()
  const stableUrl = page.url()
  const beforeBytes = await activeSessionBytes(page)

  const productionSelector = page.getByTestId('hollywood-select-production-prod-0014-1')
  await expect(productionSelector).toContainText('Empire of Stranger')
  await expect(productionSelector).toContainText('Development & Casting Annex')
  await productionSelector.click()
  await expect(page.getByTestId('hollywood-current-production')).toContainText('Empire of Stranger')
  await expect(page.getByTestId('hollywood-current-production')).toContainText(
    'Development & Casting Annex',
  )

  await clickHollywoodWorldPoint(page, ANNEX_WORLD_POINT)
  const work = page.getByTestId('lot-annex-work-occupied')
  await expect(work).toContainText('1 / 1')
  await expect(work).toContainText('Working')
  await expect(work).toContainText('Production')
  await expect(work).toContainText('Empire of Stranger')
  await expect(work).toContainText('Development')
  await expect(work).toContainText('On schedule')
  await expect(page.getByTestId('lot-annex-work-blocker')).toHaveCount(0)
  await page.screenshot({ path: join(outDir, '03-production-working-physical-expansion.png') })

  await page.getByTestId('lot-annex-open-work-details').click()
  await expect(page.getByTestId('production-board')).toBeVisible()
  const card = page.getByTestId('active-prod-0014-1')
  await expect(card).toContainText('Empire of Stranger')
  await expect(page.getByTestId('production-facility-prod-0014-1')).toContainText(
    'Development & Casting Annex',
  )
  await expect(page.getByTestId('production-status-prod-0014-1')).toContainText('On schedule')
  await expect(page.getByTestId('production-status-prod-0014-1')).toBeFocused()
  expect(page.url()).toBe(stableUrl)
  expect(await activeSessionBytes(page)).toBe(beforeBytes)

  await page.getByTestId('back-to-studio-lot').click()
  await expect(page.getByTestId('lot-annex-current-work-heading')).toBeFocused()
  await expect(page.getByTestId('lot-annex-work-occupied')).toContainText('Empire of Stranger')
  await expect(page.getByTestId('studio-lot-canvas').locator('canvas')).toHaveCount(1)
  expect(page.url()).toBe(stableUrl)
  expect(await activeSessionBytes(page)).toBe(beforeBytes)
  expect(runtimeErrors, runtimeErrors.join('\n')).toEqual([])
})

test('renderer rejection retains complete semantic script Working parity', async ({ page }) => {
  await page.route('**/src/lot/StudioLotView.ts*', (route) => route.abort())
  await seedAnnexLot(page, 'scriptWorking', { expectCanvas: false })
  await page.getByTestId('recovery-dismiss').click()
  await expect(page.getByTestId('lot-canvas-fallback')).toBeVisible()
  await expect(page.getByTestId('studio-lot-canvas').locator('canvas')).toHaveCount(0)

  await activateSemanticAnnex(page)
  await expect(page.getByTestId('lot-annex-context')).toBeVisible()
  await expect(page.getByTestId('lot-annex-work-occupied')).toContainText('1 / 1')
  await expect(page.getByTestId('lot-annex-work-occupied')).toContainText('The Silent Widow')
  await page.getByTestId('lot-annex-open-work-details').click()
  await expect(page.getByTestId('writers-room')).toBeVisible()
  await expect(page.getByTestId('script-card-script-0002')).toContainText('The Silent Widow')
  await page.getByTestId('writers-room-back').click()
  await expect(page.getByTestId('lot-annex-current-work-heading')).toBeFocused()
  await expect(page.getByTestId('lot-annex-work-occupied')).toContainText('The Silent Widow')
  await page.screenshot({ path: join(outDir, '04-renderer-rejection-script-working.png') })
})

test('Annex work remains usable at 960x540, maximum world zoom, and 200% page zoom', async ({ page }) => {
  const runtimeErrors = captureRuntimeErrors(page)
  await seedAnnexLot(page, 'productionWorking')
  await page.getByTestId('recovery-dismiss').click()
  await activateSemanticAnnex(page)
  await page.setViewportSize({ width: 960, height: 540 })
  await page.evaluate(() => window.scrollTo(0, 0))

  const context = page.getByTestId('lot-annex-context')
  const production = page.getByTestId('hollywood-production-idle')
  const people = page.getByRole('group', { name: 'Named studio people' })
  const canvas = page.getByTestId('studio-lot-canvas').locator('canvas')
  await expect(context).toBeVisible()
  await expect(production).toBeVisible()
  await expect(people).toBeVisible()
  await expect(canvas).toBeVisible()
  await expect(page.getByTestId('lot-annex-current-work-heading')).toBeVisible()
  const contextBox = await context.boundingBox()
  expect(contextBox).not.toBeNull()
  expect(contextBox!.x).toBeGreaterThanOrEqual(0)
  expect(contextBox!.x + contextBox!.width).toBeLessThanOrEqual(961)
  expect(contextBox!.y).toBeGreaterThanOrEqual(0)
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(false)
  const deepAction = page.getByTestId('lot-annex-open-work-details')
  await deepAction.scrollIntoViewIfNeeded()
  await expect(deepAction).toBeVisible()
  const actionBox = await deepAction.boundingBox()
  expect(actionBox).not.toBeNull()
  expect(actionBox!.width).toBeGreaterThanOrEqual(44)
  expect(actionBox!.height).toBeGreaterThanOrEqual(44)
  await page.screenshot({ path: join(outDir, '05-responsive-960x540.png') })

  const canvasBox = await canvas.boundingBox()
  expect(canvasBox).not.toBeNull()
  await canvas.hover({ position: { x: canvasBox!.width / 2, y: canvasBox!.height / 2 } })
  for (let step = 0; step < 12; step += 1) await page.mouse.wheel(0, -600)
  await deepAction.scrollIntoViewIfNeeded()
  await expect(deepAction).toBeVisible()
  await expect(page.getByTestId('lot-annex-work-occupied')).toContainText('Empire of Stranger')
  await page.screenshot({ path: join(outDir, '06-maximum-world-zoom.png') })

  await page.evaluate(() => {
    document.documentElement.style.zoom = '2'
    window.scrollTo(0, 0)
  })
  await deepAction.scrollIntoViewIfNeeded()
  await expect(deepAction).toBeVisible()
  await deepAction.click({ trial: true })
  await expect(page.getByTestId('lot-annex-work-occupied')).toContainText('1 / 1')
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(false)
  await page.screenshot({ path: join(outDir, '07-responsive-960x540-zoom200.png') })
  await page.evaluate(() => { document.documentElement.style.zoom = '1' })
  expect(runtimeErrors, runtimeErrors.join('\n')).toEqual([])
})

test('native script Working telemetry records its truthful population-dependent 30/13 structure', async ({ page }) => {
  const runtimeErrors = captureRuntimeErrors(page)
  await page.setViewportSize({ width: 1920, height: 1080 })
  await seedAnnexLot(page, 'scriptWorking', { identityProof: true })
  await page.getByTestId('recovery-dismiss').click()
  await activateSemanticAnnex(page)
  await expect(page.getByTestId('lot-annex-work-occupied')).toContainText('The Silent Widow')
  await expectStructuralTelemetry(page, { displayObjects: 30, dynamicActors: 13 })
  await page.screenshot({ path: join(outDir, '08-native-script-working-telemetry-1920x1080.png') })
  expect(runtimeErrors, runtimeErrors.join('\n')).toEqual([])
})

test('governed one-production reference retains the frozen exact 34/15 Hollywood tuple', async ({ page }) => {
  const runtimeErrors = captureRuntimeErrors(page)
  await page.setViewportSize({ width: 1920, height: 1080 })
  await seedGovernedPerformanceLot(page)
  await page.getByTestId('recovery-dismiss').click()
  await expect(page.getByTestId('hollywood-production-blocker')).toContainText('blocked')
  await expectStructuralTelemetry(page, {
    displayObjects: EXPECTED_DISPLAY_OBJECTS,
    dynamicActors: EXPECTED_DYNAMIC_ACTORS,
  })
  await page.screenshot({ path: join(outDir, '09-governed-structural-telemetry-1920x1080.png') })
  expect(runtimeErrors, runtimeErrors.join('\n')).toEqual([])
})
