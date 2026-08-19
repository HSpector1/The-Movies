import { expect, test, type Page } from '@playwright/test'
import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { exportSaveJson, type GameState } from '../src/engine/adapter.ts'
import { loadPinnedSaveV13Fixture } from '../src/test/pinnedSaveFixture.ts'

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(here, '..', '..')
const blockedFixture = join(
  here,
  'world-first-scenery-load-in-v1',
  'week-30-nights-of-watchtower-stage-7-blocked.save.json',
)
const readyFixture = join(
  here,
  'world-first-scenery-load-in-v1',
  'week-30-nights-of-watchtower-stage-7-ready.save.json',
)
const scheduledFixture = join(
  here,
  'live-week-advance-v1',
  'week-30-nights-of-watchtower-stage-7-scheduled.save.json',
)
const outDir = join(repoRoot, 'out', 'world-first-stage7-production-detail-handoff-v1')

const ACTIVE_SESSION_KEY = 'project-studio.active-session.v4'
const LOT_FLAG_KEY = 'project-studio.flags.studio-lot-overview'
const HOLLYWOOD_FLAG_KEY = 'project-studio.flags.operation-hollywood'
// M2-ENGINE (V12) RE-PIN — see `greenlight-production-formation-v1.spec.ts`. All three
// governed saves were regenerated natively at the V12 boundary in `628d8ad`; these digests
// were their V11 values, so the integrity gate threw in `beforeAll` and the other four tests
// in this file never ran. Re-measured from the committed bytes, which
// `scripts/gen-world-first-scenery-load-in-fixtures.mts` and
// `scripts/gen-live-week-advance-fixtures.mts` reproduce byte-identically at HEAD.
//
// C1-M1A (V13) RE-PIN — the SAME situation, one save boundary later, and the same repair.
// `0e97e0a` advanced the fixture corpus to SaveFileV13; these constants kept their V12
// values, so the gate threw again and the other four tests were "did not run". Both
// generators were themselves advanced to the V13 boundary in this campaign and reproduce
// every committed byte ("unchanged" on a clean tree at HEAD). Same strength, no assertion
// below moved.
const BLOCKED_SHA256 = '34f062fdd44e3a7116731d214de5aaa2eb4d02af85b874764d5de1cf66229b22'
const READY_SHA256 = 'db1950a818577c46280773b8b5f83433fc0c9207f659ca07b5adcb7da8d4d133'
const SCHEDULED_SHA256 = 'd5c2a7edd4b0c53ddd82c49a55f62029d1f7923733e37f1d3c00987fe5c42c9f'
const PRODUCTION_ID = 'prod-0026'
const PRODUCTION_TITLE = 'Nights of Watchtower'

const HOLLYWOOD_DISTRICT_WIDTH = 1586
const HOLLYWOOD_DISTRICT_HEIGHT = 992
const HOLLYWOOD_CAMERA_BOUNDS = { x: -120, y: -90, width: 1826, height: 1172 } as const
const STAGE_7_STATUS_POINT = { x: 740, y: 405 } as const

mkdirSync(outDir, { recursive: true })

test.beforeAll(() => {
  expect(createHash('sha256').update(readFileSync(blockedFixture)).digest('hex'))
    .toBe(BLOCKED_SHA256)
  expect(createHash('sha256').update(readFileSync(readyFixture)).digest('hex'))
    .toBe(READY_SHA256)
  expect(createHash('sha256').update(readFileSync(scheduledFixture)).digest('hex'))
    .toBe(SCHEDULED_SHA256)
})

function captureRuntimeErrors(page: Page): string[] {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  return errors
}

async function seedStage7Lot(
  page: Page,
  state: 'blocked' | 'scheduled',
  expectCanvas = true,
) {
  const save = readFileSync(state === 'blocked' ? blockedFixture : scheduledFixture, 'utf8')
  await page.addInitScript(
    ([sessionKey, saveJson, lotFlag, hollywoodFlag]) => {
      localStorage.setItem(sessionKey as string, saveJson as string)
      // Absence exercises the shipped ordinary-player world-first defaults.
      localStorage.removeItem(lotFlag as string)
      localStorage.removeItem(hollywoodFlag as string)
    },
    [ACTIVE_SESSION_KEY, save, LOT_FLAG_KEY, HOLLYWOOD_FLAG_KEY] as const,
  )
  await page.goto('/')
  await expect(page.getByTestId('recovery-notice')).toContainText('Week 30')
  await expect(page.getByTestId('studio-lot-screen')).toBeVisible()
  await expect(page.getByTestId('hollywood-current-production')).toContainText(PRODUCTION_TITLE)
  if (expectCanvas) {
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

/**
 * V14 boundary follow-up (C2a-M1) — the exact bytes a live app must hold once the Board's
 * one existing command has been accepted on the governed blocked studio.
 *
 * This assertion used to read `readyFixture` straight off disk. It cannot any more, and the
 * reason is NOT that the app drifted: `readyFixture` is a committed SaveFileV13 artefact and
 * a running app writes SaveFileV14. The rule this file follows is the one `5b36cac`/`4ef9297`
 * established in `ui/src/test/pinnedSaveFixture.ts` — the frozen artefact stays frozen (the
 * `beforeAll` digest above still names its committed bytes, unchanged), and the live question
 * is asked of the live format.
 *
 * `loadPinnedSaveV13Fixture` is what makes that safe rather than looser. Before returning a
 * state it proves the file is untampered, that it migrates, that the FROZEN writer `makeSaveV13`
 * puts every V13 byte back in order, and that the migrated V14 artefact reloads as native. And
 * `makeSaveV13` refuses outright any state that has moved off the endowed sets, queued a
 * production, or recorded screenplay provenance — so a successful projection is itself a
 * positive claim that those three V14 roots are untouched here, which reading a V13 file
 * never asserted at all.
 *
 * The single V14 root the frozen file has no room for is the studio-event log, which
 * `convertV13ToV14` deliberately leaves EMPTY rather than manufacture. A live studio that has
 * just accepted this command has recorded exactly one row for it, so the row is named here in
 * full and asserted, rather than tolerated: a second row, a different week, a different
 * production, or a missing row all fail this equality. Same exact-bytes claim as before,
 * over strictly more of the save.
 */
function freshReadySuccessorBytes(): string {
  const ready = loadPinnedSaveV13Fixture(readyFixture)
  const studioEvents: GameState['studioEvents'] = {
    nextSeq: 1,
    rows: [{ seq: 0, week: 30, kind: 'sceneryArrived', productionId: PRODUCTION_ID }],
  }
  return exportSaveJson({ ...ready, studioEvents })
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

async function activateSemanticStage7(page: Page) {
  const stage7 = page.getByTestId('lot-nav-stage-a')
  await stage7.focus()
  await expect(stage7).toBeFocused()
  await stage7.press('Enter')
}

test('physical Stage 7 opens the exact Board card and returns fresh byte-neutrally', async ({ page }) => {
  const runtimeErrors = captureRuntimeErrors(page)
  await page.setViewportSize({ width: 1366, height: 768 })
  await seedStage7Lot(page, 'blocked')
  const stableUrl = page.url()
  const beforeBytes = await activeSessionBytes(page)

  // Studio Desk orientation is informative, not proof of world selection.
  await expect(page.getByTestId(`hollywood-open-production-details-${PRODUCTION_ID}`))
    .toHaveCount(0)
  await clickHollywoodWorldPoint(page, STAGE_7_STATUS_POINT)

  const detail = page.getByTestId(`hollywood-open-production-details-${PRODUCTION_ID}`)
  await expect(page.getByTestId('hollywood-stage7-production-heading')).toContainText(
    PRODUCTION_TITLE,
  )
  await expect(detail).toHaveAccessibleName(
    `Open Production Board details · ${PRODUCTION_TITLE}`,
  )
  const worldCommand = page.getByTestId('hollywood-production-command-clearSceneryLoadIn')
  expect(await worldCommand.evaluate((command, detailTestId) => {
    const deep = document.querySelector(`[data-testid="${detailTestId}"]`)
    return deep !== null && Boolean(
      command.compareDocumentPosition(deep) & Node.DOCUMENT_POSITION_FOLLOWING,
    )
  }, `hollywood-open-production-details-${PRODUCTION_ID}`)).toBe(true)
  await page.screenshot({ path: join(outDir, '01-physical-stage7-detail-action-1366x768.png') })

  await detail.click()
  await expect(page.getByTestId('production-board')).toBeVisible()
  await expect(page.getByTestId(`active-${PRODUCTION_ID}`)).toContainText(PRODUCTION_TITLE)
  await expect(page.getByTestId(
    `production-command-clearSceneryLoadIn-${PRODUCTION_ID}`,
  )).toBeFocused()
  expect(page.url()).toBe(stableUrl)
  expect(await activeSessionBytes(page)).toBe(beforeBytes)

  await page.getByTestId('back-to-studio-lot').click()
  await expect(page.getByTestId('hollywood-stage7-production-heading')).toBeFocused()
  await expect(page.getByTestId(`hollywood-open-production-details-${PRODUCTION_ID}`))
    .toBeVisible()
  await expect(page.getByTestId('studio-lot-canvas').locator('canvas')).toHaveCount(1)
  expect(page.url()).toBe(stableUrl)
  expect(await activeSessionBytes(page)).toBe(beforeBytes)
  expect(runtimeErrors, runtimeErrors.join('\n')).toEqual([])
})

test('one existing Board command returns to the fresh ready Stage 7 successor', async ({ page }) => {
  const runtimeErrors = captureRuntimeErrors(page)
  await seedStage7Lot(page, 'blocked')
  await activateSemanticStage7(page)
  await page.getByTestId(`hollywood-open-production-details-${PRODUCTION_ID}`).click()

  await page.getByTestId(`production-command-clearSceneryLoadIn-${PRODUCTION_ID}`).click()
  await expect(page.getByTestId(
    `production-command-scheduleShootingTake-${PRODUCTION_ID}`,
  )).toBeFocused()
  const acceptedBytes = await activeSessionBytes(page)
  expect(acceptedBytes).toBe(freshReadySuccessorBytes())

  await page.getByTestId('back-to-studio-lot').click()
  await expect(page.getByTestId('hollywood-stage7-production-heading')).toBeFocused()
  await expect(page.getByTestId(`hollywood-task-status-${PRODUCTION_ID}`)).toContainText('ready')
  await expect(page.getByTestId('hollywood-production-command-scheduleShootingTake'))
    .toBeVisible()
  await expect(page.getByTestId(`hollywood-open-production-details-${PRODUCTION_ID}`))
    .toBeVisible()
  expect(await activeSessionBytes(page)).toBe(acceptedBytes)
  await page.screenshot({ path: join(outDir, '02-board-command-fresh-ready-return.png') })
  expect(runtimeErrors, runtimeErrors.join('\n')).toEqual([])
})

test('scheduled Stage 7 focuses Board status and survives semantic keyboard return under renderer rejection', async ({ page }) => {
  const runtimeErrors = captureRuntimeErrors(page)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.route('**/src/lot/StudioLotView.ts*', (route) => route.fulfill({
    status: 200,
    contentType: 'application/javascript',
    body: 'export class StudioLotView { constructor() { throw new Error("governed renderer rejection") } }',
  }))
  await seedStage7Lot(page, 'scheduled', false)
  const beforeBytes = await activeSessionBytes(page)
  await expect(page.getByTestId('lot-canvas-fallback')).toBeVisible()
  await activateSemanticStage7(page)

  const detail = page.getByTestId(`hollywood-open-production-details-${PRODUCTION_ID}`)
  await detail.focus()
  await detail.press('Enter')
  await expect(page.getByTestId(`production-status-${PRODUCTION_ID}`)).toBeFocused()
  await expect(page.getByTestId(`production-status-${PRODUCTION_ID}`)).toContainText(
    'Take scheduled',
  )
  await page.getByTestId('back-to-studio-lot').click()
  await expect(page.getByTestId('hollywood-stage7-production-heading')).toBeFocused()
  await expect(page.getByTestId('lot-canvas-fallback')).toBeVisible()
  await expect(page.getByTestId(`hollywood-task-status-${PRODUCTION_ID}`)).toContainText(
    'scheduled',
  )
  expect(await activeSessionBytes(page)).toBe(beforeBytes)
  await page.screenshot({ path: join(outDir, '03-renderer-rejection-semantic-return.png') })
  expect(runtimeErrors, runtimeErrors.join('\n')).toEqual([])
})

test('Stage 7 detail action remains reachable at governed viewports, max world zoom, and CSS magnification', async ({ page }) => {
  const runtimeErrors = captureRuntimeErrors(page)
  await seedStage7Lot(page, 'blocked')
  await activateSemanticStage7(page)

  for (const [label, width, height] of [
    ['1920x1080', 1920, 1080],
    ['1366x768', 1366, 768],
    ['1024x768', 1024, 768],
    ['960x540', 960, 540],
  ] as const) {
    await page.setViewportSize({ width, height })
    await page.evaluate(() => {
      document.documentElement.style.zoom = '1'
      window.scrollTo(0, 0)
    })
    const detail = page.getByTestId(`hollywood-open-production-details-${PRODUCTION_ID}`)
    await detail.scrollIntoViewIfNeeded()
    await expect(detail).toBeVisible()
    await expect(page.getByTestId('hollywood-current-production')).toBeVisible()
    await expect(page.getByTestId('studio-lot-canvas').locator('canvas')).toBeVisible()
    const box = await detail.boundingBox()
    expect(box, `detail action @ ${label}`).not.toBeNull()
    expect(box!.width).toBeGreaterThanOrEqual(44)
    expect(box!.height).toBeGreaterThanOrEqual(44)
    expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth))
      .toBe(false)
    await page.screenshot({ path: join(outDir, `responsive-${label}.png`) })
  }

  await page.setViewportSize({ width: 1366, height: 768 })
  const canvas = page.getByTestId('studio-lot-canvas').locator('canvas')
  const canvasBox = await canvas.boundingBox()
  expect(canvasBox).not.toBeNull()
  await canvas.hover({ position: { x: canvasBox!.width / 2, y: canvasBox!.height / 2 } })
  for (let step = 0; step < 12; step += 1) await page.mouse.wheel(0, -600)
  await expect(page.getByTestId(`hollywood-open-production-details-${PRODUCTION_ID}`))
    .toBeVisible()
  await page.screenshot({ path: join(outDir, 'responsive-maximum-world-zoom.png') })

  await page.setViewportSize({ width: 960, height: 540 })
  await page.evaluate(() => {
    document.documentElement.style.zoom = '2'
    window.scrollTo(0, 0)
  })
  const detail = page.getByTestId(`hollywood-open-production-details-${PRODUCTION_ID}`)
  await detail.scrollIntoViewIfNeeded()
  await expect(detail).toBeVisible()
  await detail.click({ trial: true })
  await expect(page.getByTestId('hollywood-stage7-production-heading')).toContainText(
    PRODUCTION_TITLE,
  )
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth))
    .toBe(false)
  await page.screenshot({ path: join(outDir, 'responsive-960x540-css-magnification.png') })
  await page.evaluate(() => { document.documentElement.style.zoom = '1' })
  expect(runtimeErrors, runtimeErrors.join('\n')).toEqual([])
})

test.describe('effective 200% browser-zoom layout proxy', () => {
  test.use({ viewport: { width: 480, height: 270 }, deviceScaleFactor: 2 })

  test('keeps the world action reachable in the 480 CSS-pixel mobile branch', async ({ page }) => {
    const runtimeErrors = captureRuntimeErrors(page)
    await seedStage7Lot(page, 'blocked')
    await activateSemanticStage7(page)

    expect(await page.evaluate(() => ({
      innerWidth: window.innerWidth,
      compactLayout: window.matchMedia('(max-width: 720px)').matches,
      scrollWidth: document.documentElement.scrollWidth,
    }))).toEqual({
      innerWidth: 480,
      compactLayout: true,
      scrollWidth: 480,
    })

    const detail = page.getByTestId(`hollywood-open-production-details-${PRODUCTION_ID}`)
    await detail.scrollIntoViewIfNeeded()
    await expect(detail).toBeVisible()
    const box = await detail.boundingBox()
    expect(box).not.toBeNull()
    expect(box!.width).toBeGreaterThanOrEqual(44)
    expect(box!.height).toBeGreaterThanOrEqual(44)
    await detail.click({ trial: true })
    await expect(page.getByTestId('hollywood-stage7-production-heading')).toContainText(
      PRODUCTION_TITLE,
    )
    await page.screenshot({ path: join(outDir, 'responsive-effective-browser-zoom-200.png') })
    expect(runtimeErrors, runtimeErrors.join('\n')).toEqual([])
  })
})
