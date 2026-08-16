import { expect, test, type Locator, type Page } from '@playwright/test'
import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(here, '..', '..')
const fixture = join(
  here,
  'world-first-scenery-load-in-v1',
  'week-30-nights-of-watchtower-stage-7-blocked.save.json',
)
const outDir = join(repoRoot, 'out', 'world-first-studio-gate-talent-arrival-v1')

const ACTIVE_SESSION_KEY = 'project-studio.active-session.v4'
const LOT_FLAG_KEY = 'project-studio.flags.studio-lot-overview'
const HOLLYWOOD_FLAG_KEY = 'project-studio.flags.operation-hollywood'
const IDENTITY_PROOF_FLAG_KEY = 'project-studio.flags.studio-lot-identity-proof'
// M2-ENGINE (V12) RE-PIN — see `greenlight-production-formation-v1.spec.ts`. The governed
// blocked fixture was regenerated natively at the V12 boundary in `628d8ad`; this digest was
// its V11 value, so the integrity gate threw in `beforeAll` and the other six tests in this
// file never ran. Re-measured from the committed bytes, which
// `scripts/gen-world-first-scenery-load-in-fixtures.mts` reproduces byte-identically at HEAD.
const FIXTURE_SHA256 = 'cb0c58f8f84a1d2e46737c3806eb70decb9fad33bf66b36d34e348d6f5c5af79'
const EXPECTED_DECODED_BYTES = 11_096_896
const PERFORMANCE_EVIDENCE = process.env.PROJECT_STUDIO_PERFORMANCE_EVIDENCE === '1'

const HOLLYWOOD_DISTRICT_WIDTH = 1586
const HOLLYWOOD_DISTRICT_HEIGHT = 992
const HOLLYWOOD_CAMERA_BOUNDS = { x: -120, y: -90, width: 1826, height: 1172 } as const
const GATE_WORLD_POINT = { x: 1300, y: 760 } as const

mkdirSync(outDir, { recursive: true })

test.beforeAll(() => {
  expect(createHash('sha256').update(readFileSync(fixture)).digest('hex')).toBe(FIXTURE_SHA256)
})

function captureRuntimeErrors(page: Page): string[] {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  return errors
}

async function seedGateLot(
  page: Page,
  options: { identityProof?: boolean; expectCanvas?: boolean } = {},
) {
  const save = readFileSync(fixture, 'utf8')
  await page.addInitScript(
    ([sessionKey, saveJson, lotFlag, hollywoodFlag, proofFlag, proof]) => {
      localStorage.setItem(sessionKey as string, saveJson as string)
      // Absence exercises the shipped ordinary-player world-first defaults.
      localStorage.removeItem(lotFlag as string)
      localStorage.removeItem(hollywoodFlag as string)
      if (proof) localStorage.setItem(proofFlag as string, '1')
      else localStorage.removeItem(proofFlag as string)
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
  await expect(page.getByTestId('recovery-notice')).toContainText('Week 30')
  await expect(page.getByTestId('studio-lot-screen')).toBeVisible()
  if (options.expectCanvas !== false) {
    await expect(page.getByTestId('studio-lot-canvas').locator('canvas')).toHaveCount(1)
  }
  await expect(page.getByText('Preparing the lot…', { exact: true })).toHaveCount(0)
  await page.getByTestId('recovery-dismiss').click()
  await page.waitForTimeout(1_200)
}

async function activeSessionBytes(page: Page): Promise<string> {
  const value = await page.evaluate((key) => localStorage.getItem(key), ACTIVE_SESSION_KEY)
  expect(value).not.toBeNull()
  return value!
}

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

async function activateSemanticGate(page: Page) {
  const gate = page.getByTestId('lot-nav-gate')
  await gate.focus()
  await expect(gate).toBeFocused()
  await gate.press('Enter')
  await expect(page.getByTestId('hollywood-gate-context')).toBeVisible()
}

async function chooseFirstGateCandidate(page: Page) {
  const buttons = page.locator('[data-testid^="hollywood-gate-select-"]')
  expect(await buttons.count()).toBeGreaterThan(0)
  expect(await buttons.evaluateAll((nodes) => nodes.map(
    (node) => node.getAttribute('aria-pressed'),
  ))).toEqual(Array.from({ length: await buttons.count() }, () => 'false'))
  const button = buttons.first()
  await expect(button).toHaveAttribute('aria-pressed', 'false')
  const testId = await button.getAttribute('data-testid')
  expect(testId).not.toBeNull()
  const talentId = testId!.replace('hollywood-gate-select-', '')
  const name = ((await button.locator('span').textContent()) ?? '').trim()
  const profession = ((await button.locator('small').textContent()) ?? '').trim()
  expect(name).not.toBe('')
  expect(profession).not.toBe('')
  await button.click()
  await expect(page.getByTestId('hollywood-gate-visitor-heading')).toHaveText(name)
  await expect(button).toHaveAttribute('aria-pressed', 'true')
  return { button, talentId, name, profession }
}

async function expectStructuralTelemetry(
  performance: Locator,
  expected: { objects: number; actors: number },
) {
  await expect(performance).toHaveAttribute('data-frame-samples', '240', { timeout: 20_000 })
  await expect(performance).toHaveAttribute('data-display-objects', String(expected.objects))
  await expect(performance).toHaveAttribute('data-dynamic-actors', String(expected.actors))
  await expect(performance).toHaveAttribute('data-decoded-bytes', String(EXPECTED_DECODED_BYTES))
  await expect(performance).toHaveAttribute('data-draw-calls', '1')
}

test('physical Studio Gate establishes one visitor, profile, exact Hiring terms, and fresh return', async ({ page }) => {
  const runtimeErrors = captureRuntimeErrors(page)
  await page.setViewportSize({ width: 1366, height: 768 })
  await seedGateLot(page)
  const stableUrl = page.url()
  const beforeBytes = await activeSessionBytes(page)
  const lot = page.getByTestId('studio-lot-screen')
  const canvas = page.getByTestId('studio-lot-canvas').locator('canvas')

  await expect(page.getByTestId('hollywood-gate-context')).toHaveCount(0)
  await clickHollywoodWorldPoint(page, GATE_WORLD_POINT)
  await expect(page.getByTestId('hollywood-gate-heading')).toHaveText('Studio Gate')
  await expect(page.getByTestId('hollywood-gate-physical-status')).toContainText(
    'Selected in the living lot',
  )
  await expect(page.getByTestId('hollywood-gate-visitor')).toHaveCount(0)

  const candidate = await chooseFirstGateCandidate(page)
  const visitor = page.getByTestId('hollywood-gate-visitor')
  await expect(visitor).toContainText(candidate.profession)
  await expect(visitor).toContainText('Free agent')
  await expect(canvas).toBeVisible()
  expect(await activeSessionBytes(page)).toBe(beforeBytes)
  await page.screenshot({ path: join(outDir, '01-physical-gate-selected-visitor.png') })

  const profile = page.getByTestId(`hollywood-gate-open-profile-${candidate.talentId}`)
  await profile.click()
  await expect(page.getByTestId('talent-profile-name')).toHaveText(candidate.name)
  await expect(lot).toHaveAttribute('inert', '')
  await expect(canvas).toBeVisible()
  expect(page.url()).toBe(stableUrl)
  expect(await activeSessionBytes(page)).toBe(beforeBytes)
  await page.screenshot({ path: join(outDir, '02-profile-over-same-live-lot.png') })

  await page.getByTestId('talent-profile-close').click()
  await expect(page.getByTestId('talent-profile')).toHaveCount(0)
  await expect(profile).toBeFocused()
  const hiring = page.getByTestId(`hollywood-gate-open-hiring-${candidate.talentId}`)
  await hiring.click()
  await expect(page.getByTestId(`hiring-card-heading-${candidate.talentId}`)).toBeFocused()
  await expect(page.getByTestId(`hiring-card-${candidate.talentId}`)).toContainText(candidate.name)
  expect(page.url()).toBe(stableUrl)
  expect(await activeSessionBytes(page)).toBe(beforeBytes)

  await page.getByTestId('hiring-back').click()
  await expect(page.getByTestId('hollywood-gate-visitor-heading')).toHaveText(candidate.name)
  await expect(page.getByTestId('hollywood-gate-visitor-heading')).toBeFocused()
  await expect(canvas).toHaveCount(1)
  expect(page.url()).toBe(stableUrl)
  expect(await activeSessionBytes(page)).toBe(beforeBytes)
  await page.screenshot({ path: join(outDir, '03-hiring-back-retained-fresh-visitor.png') })
  expect(runtimeErrors, runtimeErrors.join('\n')).toEqual([])
})

test('Engine-accepted signing returns to a neutral Gate without successor substitution', async ({ page }) => {
  const runtimeErrors = captureRuntimeErrors(page)
  await seedGateLot(page)
  const beforeBytes = await activeSessionBytes(page)
  await activateSemanticGate(page)
  const candidate = await chooseFirstGateCandidate(page)
  await page.getByTestId(`hollywood-gate-open-hiring-${candidate.talentId}`).click()
  const card = page.getByTestId(`hiring-card-${candidate.talentId}`)
  await expect(card).toBeVisible()

  const runways = card.locator('[data-testid^="offer-runway-"]')
  let affordableSign: Locator | null = null
  for (let index = 0; index < await runways.count(); index += 1) {
    const runway = runways.nth(index)
    if (((await runway.textContent()) ?? '').includes('exceeds current cash')) continue
    const runwayId = await runway.getAttribute('data-testid')
    expect(runwayId).not.toBeNull()
    affordableSign = page.getByTestId(runwayId!.replace('offer-runway-', 'hiring-sign-'))
    break
  }
  expect(affordableSign, 'the governed fixture must retain one affordable current offer').not.toBeNull()
  await affordableSign!.click()

  await expect(card).toHaveCount(0)
  await expect(page.getByTestId('hiring-contract-heading')).toBeFocused()
  const acceptedBytes = await activeSessionBytes(page)
  expect(acceptedBytes).not.toBe(beforeBytes)
  await page.getByTestId('hiring-back').click()

  await expect(page.getByTestId('hollywood-gate-context')).toBeVisible()
  await expect(page.getByTestId('hollywood-gate-visitor')).toHaveCount(0)
  await expect(page.getByTestId(`hollywood-gate-select-${candidate.talentId}`)).toHaveCount(0)
  await expect(page.getByTestId('hollywood-gate-heading')).toBeFocused()
  const signed = await page.evaluate(([key, talentId]) => {
    const save = JSON.parse(localStorage.getItem(key as string) ?? '{}') as {
      state?: { contracts?: Array<{ talentId?: string }> }
    }
    return save.state?.contracts?.some((contract) => contract.talentId === talentId) ?? false
  }, [ACTIVE_SESSION_KEY, candidate.talentId] as const)
  expect(signed).toBe(true)
  await page.screenshot({ path: join(outDir, '04-signing-neutral-gate-no-substitution.png') })
  expect(runtimeErrors, runtimeErrors.join('\n')).toEqual([])
})

test('renderer rejection retains complete reduced-motion semantic Gate play', async ({ page }) => {
  const runtimeErrors = captureRuntimeErrors(page)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.route('**/src/lot/StudioLotView.ts*', (route) => route.fulfill({
    status: 200,
    contentType: 'application/javascript',
    body: 'export class StudioLotView { constructor() { throw new Error("governed renderer rejection") } }',
  }))
  await seedGateLot(page, { expectCanvas: false })
  const beforeBytes = await activeSessionBytes(page)
  await expect(page.getByTestId('lot-canvas-fallback')).toBeVisible()
  await activateSemanticGate(page)
  const candidate = await chooseFirstGateCandidate(page)

  await expect(page.getByTestId('hollywood-gate-physical-status')).toContainText(
    'physical Gate is unavailable',
  )
  await expect(page.getByTestId('hollywood-gate-visitor')).toContainText('Free agent')
  await page.getByTestId(`hollywood-gate-open-profile-${candidate.talentId}`).click()
  await expect(page.getByTestId('talent-profile-name')).toHaveText(candidate.name)
  await page.getByTestId('talent-profile-close').click()
  await page.getByTestId(`hollywood-gate-open-hiring-${candidate.talentId}`).click()
  await expect(page.getByTestId(`hiring-card-heading-${candidate.talentId}`)).toBeFocused()
  await page.getByTestId('hiring-back').click()
  await expect(page.getByTestId('hollywood-gate-visitor-heading')).toBeFocused()
  expect(await activeSessionBytes(page)).toBe(beforeBytes)
  await page.screenshot({ path: join(outDir, '05-renderer-rejection-semantic-gate.png') })
  expect(runtimeErrors, runtimeErrors.join('\n')).toEqual([])
})

test('Gate visitor controls remain playable at governed viewports and maximum world zoom', async ({ page }) => {
  const runtimeErrors = captureRuntimeErrors(page)
  await seedGateLot(page)
  await activateSemanticGate(page)
  const candidate = await chooseFirstGateCandidate(page)

  for (const [label, width, height] of [
    ['1920x1080', 1920, 1080],
    ['1366x768', 1366, 768],
    ['1024x768', 1024, 768],
    ['960x540', 960, 540],
  ] as const) {
    await page.setViewportSize({ width, height })
    const action = page.getByTestId(`hollywood-gate-open-hiring-${candidate.talentId}`)
    await action.scrollIntoViewIfNeeded()
    await expect(action).toBeVisible()
    const box = await action.boundingBox()
    expect(box, `Gate Hiring action @ ${label}`).not.toBeNull()
    expect(box!.width).toBeGreaterThanOrEqual(44)
    expect(box!.height).toBeGreaterThanOrEqual(44)
    expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth))
      .toBe(false)
  }

  await page.setViewportSize({ width: 1366, height: 768 })
  const canvas = page.getByTestId('studio-lot-canvas').locator('canvas')
  const canvasBox = await canvas.boundingBox()
  expect(canvasBox).not.toBeNull()
  await canvas.hover({ position: { x: canvasBox!.width / 2, y: canvasBox!.height / 2 } })
  for (let step = 0; step < 12; step += 1) await page.mouse.wheel(0, -600)
  await expect(page.getByTestId(`hollywood-gate-open-hiring-${candidate.talentId}`)).toBeVisible()

  await page.setViewportSize({ width: 960, height: 540 })
  await page.evaluate(() => {
    document.documentElement.style.zoom = '2'
    window.scrollTo(0, 0)
  })
  const magnified = page.getByTestId(`hollywood-gate-open-profile-${candidate.talentId}`)
  await magnified.scrollIntoViewIfNeeded()
  await expect(magnified).toBeVisible()
  await magnified.click({ trial: true })
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth))
    .toBe(false)
  await page.screenshot({ path: join(outDir, '06-responsive-maximum-zoom-and-200-percent.png') })
  expect(runtimeErrors, runtimeErrors.join('\n')).toEqual([])
})

test('selected visitor holds exact frozen structural cost after a fresh 120 + 240 frame window', async ({ page }) => {
  const runtimeErrors = captureRuntimeErrors(page)
  await page.setViewportSize({ width: 1920, height: 1080 })
  await seedGateLot(page, { identityProof: true })
  const beforeBytes = await activeSessionBytes(page)
  const performance = page.getByTestId('hollywood-performance')
  // M1.5 RE-MEASURE (accepted, not a regression): `eebbefd` moved roster presence into
  // `studioLotSnapshot`, so the ten contracted employees this governed fixture's single
  // picture does not claim now stand on the retained plate too — one dynamic actor and two
  // display objects each, 42/19 → 62/29. `expectStructuralTelemetry` still pins decoded bytes
  // and the single draw call unchanged, which is what proves the delta is people, not a leak.
  await expectStructuralTelemetry(performance, { objects: 62, actors: 29 })
  const initialWindow = Number(await performance.getAttribute('data-telemetry-window'))

  await activateSemanticGate(page)
  await chooseFirstGateCandidate(page)
  await expect.poll(async () => {
    const window = Number(await performance.getAttribute('data-telemetry-window'))
    const samples = Number(await performance.getAttribute('data-frame-samples'))
    return window > initialWindow && samples < 240
  }, {
    message: 'visitor selection must begin a visibly fresh sustained telemetry window',
    timeout: 5_000,
  }).toBe(true)
  await expectStructuralTelemetry(performance, { objects: 63, actors: 30 })
  expect(await activeSessionBytes(page)).toBe(beforeBytes)
  await page.screenshot({ path: join(outDir, '07-selected-visitor-structural-headless.png') })
  expect(runtimeErrors, runtimeErrors.join('\n')).toEqual([])
})

test('GPU evidence run meets every frozen selected-visitor wall-clock budget', async ({ page }) => {
  test.skip(
    !PERFORMANCE_EVIDENCE,
    'Set PROJECT_STUDIO_PERFORMANCE_EVIDENCE=1 only in a quiescent GPU-accelerated evidence browser.',
  )
  await page.setViewportSize({ width: 1920, height: 1080 })
  await seedGateLot(page, { identityProof: true })
  const performance = page.getByTestId('hollywood-performance')
  const initialWindow = Number(await performance.getAttribute('data-telemetry-window'))
  await activateSemanticGate(page)
  await chooseFirstGateCandidate(page)
  await expect.poll(async () => Number(
    await performance.getAttribute('data-telemetry-window'),
  )).toBeGreaterThan(initialWindow)
  await expectStructuralTelemetry(performance, { objects: 63, actors: 30 })

  const metric = async (name: string) => Number(await performance.getAttribute(name))
  expect(await metric('data-fps')).toBeGreaterThanOrEqual(50)
  expect(await metric('data-one-percent-low-fps')).toBeGreaterThanOrEqual(30)
  expect(await metric('data-p99-frame-ms')).toBeLessThanOrEqual(33.4)
  expect(await metric('data-worst-frame-ms')).toBeLessThanOrEqual(33.4)
  expect(await metric('data-average-update-ms')).toBeLessThanOrEqual(1)
  expect(await metric('data-worst-update-ms')).toBeLessThanOrEqual(5)
  await page.screenshot({ path: join(outDir, '08-selected-visitor-gpu-absolute.png') })
})

test.describe('effective 200% browser-zoom layout proxy', () => {
  test.use({ viewport: { width: 480, height: 270 }, deviceScaleFactor: 2 })

  test('keeps the Gate visitor and both supporting actions reachable in the mobile branch', async ({ page }) => {
    const runtimeErrors = captureRuntimeErrors(page)
    await seedGateLot(page)
    await activateSemanticGate(page)
    const candidate = await chooseFirstGateCandidate(page)
    expect(await page.evaluate(() => ({
      innerWidth: window.innerWidth,
      compactLayout: window.matchMedia('(max-width: 720px)').matches,
      scrollWidth: document.documentElement.scrollWidth,
    }))).toEqual({ innerWidth: 480, compactLayout: true, scrollWidth: 480 })

    for (const testId of [
      `hollywood-gate-open-profile-${candidate.talentId}`,
      `hollywood-gate-open-hiring-${candidate.talentId}`,
    ]) {
      const action = page.getByTestId(testId)
      await action.scrollIntoViewIfNeeded()
      await expect(action).toBeVisible()
      const box = await action.boundingBox()
      expect(box).not.toBeNull()
      expect(box!.width).toBeGreaterThanOrEqual(44)
      expect(box!.height).toBeGreaterThanOrEqual(44)
      await action.click({ trial: true })
    }
    await page.screenshot({ path: join(outDir, '09-effective-browser-zoom-200.png') })
    expect(runtimeErrors, runtimeErrors.join('\n')).toEqual([])
  })
})
