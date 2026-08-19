import { expect, test, type Page } from '@playwright/test'
import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { acknowledgeMigratedSaveNotice } from './helpers/save-migration-notice.ts'

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(here, '..', '..')
const fixtureFile = join(
  here,
  'world-first-scenery-load-in-v1',
  'week-30-nights-of-watchtower-stage-7-blocked.save.json',
)
const outDir = join(repoRoot, 'out', 'world-first-publicity-campaign-v1')

const ACTIVE_SESSION_KEY = 'project-studio.active-session.v4'
const LOT_FLAG_KEY = 'project-studio.flags.studio-lot-overview'
const HOLLYWOOD_FLAG_KEY = 'project-studio.flags.operation-hollywood'
const IDENTITY_PROOF_FLAG_KEY = 'project-studio.flags.studio-lot-identity-proof'
// M2-ENGINE (V12) RE-PIN — see `greenlight-production-formation-v1.spec.ts`. The governed
// blocked fixture was regenerated natively at the V12 boundary in `628d8ad`; this digest was
// its V11 value, so the integrity gate threw in `beforeAll` and the other five tests in this
// file never ran. Re-measured from the committed bytes, which
// `scripts/gen-world-first-scenery-load-in-fixtures.mts` reproduces byte-identically at HEAD.
const GOVERNED_FIXTURE_SHA256 = '34f062fdd44e3a7116731d214de5aaa2eb4d02af85b874764d5de1cf66229b22'
// C1-M1A (V13) RE-PIN — `0e97e0a` advanced the governed fixture to SaveFileV13; the digest
// above follows it at the same strength. The generator was advanced to the V13 boundary in
// this campaign and reproduces the committed bytes ("unchanged" at HEAD). No assertion moved.
const PERFORMANCE_EVIDENCE = process.env.PROJECT_STUDIO_PERFORMANCE_EVIDENCE === '1'

const HOLLYWOOD_DISTRICT_WIDTH = 1586
const HOLLYWOOD_DISTRICT_HEIGHT = 992
const HOLLYWOOD_CAMERA_BOUNDS = { x: -120, y: -90, width: 1826, height: 1172 } as const
const PUBLICITY_WORLD_POINT = { x: 1200, y: 320 } as const

const EXPECTED_OFFERS = [
  {
    tier: 'whisper',
    label: 'Whisper',
    cost: '$1,200,000',
    lift: '+1.18',
    pricePerPoint: '$1,013,926.36',
    tierCooldown: '8 weeks',
  },
  {
    tier: 'push',
    label: 'Push',
    cost: '$3,600,000',
    lift: '+1.97',
    pricePerPoint: '$1,825,067.45',
    tierCooldown: '12 weeks',
  },
  {
    tier: 'blitz',
    label: 'Blitz',
    cost: '$8,000,000',
    lift: '+2.76',
    pricePerPoint: '$2,896,932.46',
    tierCooldown: '20 weeks',
  },
] as const

mkdirSync(outDir, { recursive: true })

test.beforeAll(() => {
  const bytes = readFileSync(fixtureFile)
  expect(createHash('sha256').update(bytes).digest('hex')).toBe(GOVERNED_FIXTURE_SHA256)
})

async function seedPublicityLot(page: Page, identityProof = false, expectCanvas = true) {
  const save = readFileSync(fixtureFile, 'utf8')
  await page.addInitScript(
    ([sessionKey, saveJson, lotFlag, hollywoodFlag, identityFlag, proof]) => {
      localStorage.setItem(sessionKey as string, saveJson as string)
      // Absence exercises the adopted ordinary-player Studio Home and Hollywood defaults.
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
      identityProof,
    ] as const,
  )
  await page.goto('/')
  await expect(page.getByTestId('recovery-notice')).toContainText('Week 30')
  await expect(page.getByTestId('studio-lot-screen')).toBeVisible()
  await expect(page.getByTestId('hollywood-current-production')).toContainText(
    'Nights of Watchtower',
  )
  await expect(page.getByTestId('hollywood-production-blocker')).toContainText('blocked')
  if (expectCanvas) {
    await expect(page.getByTestId('studio-lot-canvas').locator('canvas')).toHaveCount(1)
  }
  await expect(page.getByText('Preparing the lot…', { exact: true })).toHaveCount(0)
  await page.waitForTimeout(1_200)
}

async function activeSessionBytes(page: Page): Promise<string> {
  const value = await page.evaluate((key) => localStorage.getItem(key), ACTIVE_SESSION_KEY)
  expect(value).not.toBeNull()
  return value!
}

/** Click an authored district coordinate through the real fitted Phaser camera. */
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

async function expectExactOfferCards(page: Page) {
  await expect(page.getByTestId('hollywood-publicity-offers')).toBeVisible()
  for (const offer of EXPECTED_OFFERS) {
    const card = page.getByTestId(`hollywood-publicity-${offer.tier}`)
    await expect(card).toContainText(offer.label)
    await expect(card).toContainText(offer.cost)
    await expect(card).toContainText(offer.lift)
    await expect(card).toContainText(offer.pricePerPoint)
    await expect(card).toContainText(offer.tierCooldown)
    await expect(card).toContainText('6 weeks')
    await expect(card).toContainText('Available now in Week 30.')
    await expect(page.getByTestId(`hollywood-publicity-run-${offer.tier}`)).toBeEnabled()
  }
}

async function activateSemanticAdministration(page: Page) {
  const administration = page.getByTestId('lot-nav-admin')
  await administration.focus()
  await expect(administration).toBeFocused()
  await administration.press('Enter')
}

function normalizedAfterPublicity(after: Record<string, any>, before: Record<string, any>) {
  const normalized = structuredClone(after)
  normalized.state.studio.cash = before.state.studio.cash
  normalized.state.studio.standing.audienceAwareness =
    before.state.studio.standing.audienceAwareness
  normalized.state.ledger = structuredClone(before.state.ledger)
  normalized.state.publicity = structuredClone(before.state.publicity)
  return normalized
}

function overlapArea(
  first: { x: number; y: number; width: number; height: number },
  second: { x: number; y: number; width: number; height: number },
) {
  const width = Math.max(
    0,
    Math.min(first.x + first.width, second.x + second.width) - Math.max(first.x, second.x),
  )
  const height = Math.max(
    0,
    Math.min(first.y + first.height, second.y + second.height) - Math.max(first.y, second.y),
  )
  return width * height
}

test('physical Administration campaign acts once in the live lot and returns fresh from Dashboard', async ({ page }) => {
  const runtimeErrors: string[] = []
  page.on('pageerror', (error) => runtimeErrors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') runtimeErrors.push(message.text())
  })

  await page.setViewportSize({ width: 1366, height: 768 })
  await seedPublicityLot(page)
  const stableUrl = page.url()
  const beforeBytes = await activeSessionBytes(page)
  const before = JSON.parse(beforeBytes)
  const canvas = page.getByTestId('studio-lot-canvas').locator('canvas')
  await canvas.evaluate((node) => node.setAttribute('data-publicity-mount', 'original'))

  await expect(page.getByTestId('hollywood-publicity-context')).toHaveCount(0)
  await clickHollywoodWorldPoint(page, PUBLICITY_WORLD_POINT)
  await expect(page.getByTestId('hollywood-publicity-context')).toBeVisible()
  await expect(page.getByTestId('hollywood-publicity-physical-status')).toContainText(
    'Selected in the living lot at Administration & Publicity.',
  )
  await expect(page.getByTestId('hollywood-publicity-status')).toContainText(
    'Audience Awareness 36.47',
  )
  await expectExactOfferCards(page)
  await expect(page.getByTestId('hollywood-production-blocker')).toContainText('blocked')
  await page.screenshot({ path: join(outDir, '01-physical-selection-1366x768.png') })

  await page.getByTestId('hollywood-publicity-run-whisper').click()
  await expect(page.getByTestId('hollywood-activity-message')).toContainText(
    'Whisper publicity accepted · $1,200,000 · immediate awareness +1.18',
  )
  await expect(page.getByTestId('hollywood-publicity-status')).toContainText(
    'Audience Awareness 37.65',
  )
  for (const tier of ['whisper', 'push', 'blitz'] as const) {
    await expect(page.getByTestId(`hollywood-publicity-run-${tier}`)).toBeDisabled()
  }
  await expect(page.getByTestId('hollywood-publicity-whisper-offer-status')).toContainText(
    'Cooldown: available again in Week 38.',
  )
  await expect(page.getByTestId('hollywood-publicity-push-offer-status')).toContainText(
    'Cooldown: available again in Week 36.',
  )
  await expect(page.getByTestId('hollywood-publicity-blitz-offer-status')).toContainText(
    'Cooldown: available again in Week 36.',
  )
  await expect(page.getByTestId('hollywood-production-blocker')).toContainText('blocked')
  await expect(canvas).toHaveAttribute('data-publicity-mount', 'original')
  expect(page.url()).toBe(stableUrl)

  await expect.poll(async () => {
    const parsed = JSON.parse(await activeSessionBytes(page))
    return parsed.state.publicity.lastUsedWeek
  }).toBe(30)
  const afterBytes = await activeSessionBytes(page)
  const after = JSON.parse(afterBytes)
  expect(after.state.studio.cash).toBe(9_960_898.29)
  expect(after.state.studio.standing.audienceAwareness).toBe(37.65280611873517)
  expect(after.state.publicity).toEqual({
    byTier: { blitz: null, push: null, whisper: 30 },
    lastUsedWeek: 30,
  })
  expect(after.state.ledger).toHaveLength(63)
  expect(after.state.ledger.at(-1)).toEqual({
    amount: -1_200_000,
    kind: 'publicity',
    note: 'publicity: whisper',
    week: 30,
  })
  expect(after.state.ledger.at(-1)).not.toHaveProperty('productionId')
  expect(normalizedAfterPublicity(after, before)).toEqual(before)

  // A disabled post-success offer cannot create a second action or successor.
  await page.getByTestId('hollywood-publicity-run-push').dispatchEvent('click')
  await page.waitForTimeout(100)
  expect(await activeSessionBytes(page)).toBe(afterBytes)
  await page.screenshot({ path: join(outDir, '02-whisper-accepted-stage7-intact.png') })

  await page.getByTestId('hollywood-publicity-open-dashboard').click()
  await expect(page.getByTestId('publicity-panel')).toBeVisible()
  await expect(page.getByTestId('publicity-awareness')).toContainText('37.65 / 100')
  for (const tier of ['whisper', 'push', 'blitz'] as const) {
    await expect(page.getByTestId(`buy-publicity-${tier}`)).toBeDisabled()
  }
  await expect(page.getByTestId('back-to-studio-lot')).toBeVisible()
  expect(page.url()).toBe(stableUrl)
  expect(await activeSessionBytes(page)).toBe(afterBytes)

  await page.getByTestId('back-to-studio-lot').click()
  await expect(page.getByTestId('hollywood-publicity-context')).toBeVisible()
  await expect(page.getByTestId('hollywood-publicity-run-whisper')).toBeDisabled()
  await expect(page.getByTestId('hollywood-activity-message')).toHaveCount(0)
  await expect(page.getByTestId('hollywood-production-blocker')).toContainText('blocked')
  await expect(page.getByTestId('studio-lot-canvas').locator('canvas')).toHaveCount(1)
  expect(page.url()).toBe(stableUrl)
  expect(await activeSessionBytes(page)).toBe(afterBytes)
  expect(runtimeErrors, runtimeErrors.join('\n')).toEqual([])
})

test('campaign panel remains reachable beside Stage 7 at governed viewports, max world zoom, and 200% page zoom', async ({ page }) => {
  await seedPublicityLot(page)
  await page.getByTestId('recovery-dismiss').click()
  await expect(page.getByTestId('recovery-notice')).toHaveCount(0)
  // V14 boundary follow-up (C2a-M1), and the same reason this journey already clears the
  // recovery notice one line above. The seeded fixture is a committed SaveFileV13 artefact, so
  // the app now — correctly — raises its migrated-save acknowledgement too: 92.5px of
  // dismissible chrome above a `min-height: 100vh` lot, which put exactly that much of the
  // campaign panel below the fold at every viewport measured below. The helper asserts the
  // banner was raised and that Dismiss clears it, so the migration is proved rather than
  // stepped around.
  await acknowledgeMigratedSaveNotice(page)
  await activateSemanticAdministration(page)
  await expect(page.getByTestId('hollywood-publicity-context')).toBeVisible()

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
    const context = page.getByTestId('hollywood-publicity-context')
    const production = page.getByTestId('hollywood-current-production')
    const people = page.getByRole('group', { name: 'Named studio people' })
    await expect(context).toBeVisible()
    await expect(production).toBeVisible()
    await expect(people).toBeVisible()
    const contextBox = await context.boundingBox()
    const productionBox = await production.boundingBox()
    const peopleBox = await people.boundingBox()
    expect(contextBox, `campaign context @ ${label} has a box`).not.toBeNull()
    expect(productionBox, `Stage 7 status @ ${label} has a box`).not.toBeNull()
    expect(peopleBox, `named people @ ${label} has a box`).not.toBeNull()
    expect(contextBox!.x).toBeGreaterThanOrEqual(0)
    expect(contextBox!.x + contextBox!.width).toBeLessThanOrEqual(width + 1)
    expect(contextBox!.y).toBeGreaterThanOrEqual(0)
    expect(contextBox!.y + contextBox!.height).toBeLessThanOrEqual(height + 1)
    expect(overlapArea(contextBox!, productionBox!), `campaign/Stage 7 overlap @ ${label}`).toBe(0)
    expect(overlapArea(contextBox!, peopleBox!), `campaign/people overlap @ ${label}`).toBe(0)
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth),
      `page-level horizontal overflow @ ${label}`,
    ).toBe(false)
    for (const tier of ['whisper', 'push', 'blitz'] as const) {
      const action = page.getByTestId(`hollywood-publicity-run-${tier}`)
      await action.scrollIntoViewIfNeeded()
      await expect(action).toBeVisible()
      const box = await action.boundingBox()
      expect(box, `${tier} target @ ${label} has a box`).not.toBeNull()
      expect(box!.width).toBeGreaterThanOrEqual(44)
      expect(box!.height).toBeGreaterThanOrEqual(44)
    }
    await page.screenshot({ path: join(outDir, `responsive-${label}.png`) })
  }

  // DOM management remains operable while the living world is at its authored max zoom.
  await page.setViewportSize({ width: 1366, height: 768 })
  const canvas = page.getByTestId('studio-lot-canvas').locator('canvas')
  const canvasBox = await canvas.boundingBox()
  expect(canvasBox).not.toBeNull()
  await canvas.hover({ position: { x: canvasBox!.width / 2, y: canvasBox!.height / 2 } })
  for (let step = 0; step < 12; step += 1) await page.mouse.wheel(0, -600)
  await expect(page.getByTestId('hollywood-publicity-run-whisper')).toBeVisible()
  await expect(page.getByTestId('hollywood-production-blocker')).toContainText('blocked')
  await page.screenshot({ path: join(outDir, 'responsive-maximum-world-zoom.png') })

  // The governed 200% stress may scroll inside the panel; every offer remains reachable.
  await page.setViewportSize({ width: 960, height: 540 })
  await page.evaluate(() => {
    document.documentElement.style.zoom = '2'
    window.scrollTo(0, 0)
  })
  for (const tier of ['whisper', 'push', 'blitz'] as const) {
    const action = page.getByTestId(`hollywood-publicity-run-${tier}`)
    await action.scrollIntoViewIfNeeded()
    await expect(action).toBeVisible()
  }
  await expect(page.getByTestId('hollywood-publicity-open-dashboard')).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(false)
  await page.screenshot({ path: join(outDir, 'responsive-960x540-zoom200.png') })
  await page.evaluate(() => { document.documentElement.style.zoom = '1' })
})

test('keyboard and reduced motion preserve exact-once world action semantics', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await seedPublicityLot(page)
  await expect(page.getByTestId('studio-lot-screen')).toHaveClass(/lot-reduced-motion/)

  const administration = page.getByTestId('lot-nav-admin')
  await administration.focus()
  await page.keyboard.press('Enter')
  const whisper = page.getByTestId('hollywood-publicity-run-whisper')
  await expect(whisper).toBeFocused()
  await whisper.press('Enter')
  await expect(page.getByTestId('hollywood-activity-message')).toContainText(
    'Whisper publicity accepted',
  )
  await expect.poll(async () => {
    const save = JSON.parse(await activeSessionBytes(page))
    return save.state.ledger.filter((entry: { kind: string }) => entry.kind === 'publicity').length
  }).toBe(1)
  await whisper.press('Enter')
  await page.waitForTimeout(100)
  const save = JSON.parse(await activeSessionBytes(page))
  expect(save.state.ledger.filter((entry: { kind: string }) => entry.kind === 'publicity')).toHaveLength(1)
  await expect(page.getByTestId('hollywood-production-blocker')).toContainText('blocked')
})

test('renderer rejection retains complete semantic campaign action parity', async ({ page }) => {
  await page.route('**/src/lot/StudioLotView.ts*', (route) => route.abort())
  await seedPublicityLot(page, false, false)
  await expect(page.getByTestId('lot-canvas-fallback')).toBeVisible()
  await expect(page.getByTestId('studio-lot-canvas').locator('canvas')).toHaveCount(0)

  await page.getByTestId('lot-nav-admin').click()
  await expect(page.getByTestId('hollywood-publicity-physical-status')).toContainText(
    'physical office is unavailable in this renderer',
  )
  await expectExactOfferCards(page)
  await page.getByTestId('hollywood-publicity-run-push').click()
  await expect(page.getByTestId('hollywood-activity-message')).toContainText(
    'Push publicity accepted',
  )
  await expect.poll(async () => {
    const save = JSON.parse(await activeSessionBytes(page))
    return save.state.publicity.byTier.push
  }).toBe(30)
  const save = JSON.parse(await activeSessionBytes(page))
  expect(save.state.studio.cash).toBe(7_560_898.289999999)
  expect(save.state.studio.standing.audienceAwareness).toBe(38.4418180537896)
  expect(save.state.ledger.at(-1)).toEqual({
    amount: -3_600_000,
    kind: 'publicity',
    note: 'publicity: push',
    week: 30,
  })
  await expect(page.getByTestId('hollywood-production-blocker')).toContainText('blocked')
  await page.screenshot({ path: join(outDir, 'renderer-fallback-push-accepted.png') })
})

async function collectGovernedTelemetry(page: Page) {
  await page.setViewportSize({ width: 1920, height: 1080 })
  await seedPublicityLot(page, true)
  await page.getByTestId('recovery-dismiss').click()
  const performance = page.getByTestId('hollywood-performance')
  const initialWindow = Number(await performance.getAttribute('data-telemetry-window'))
  await activateSemanticAdministration(page)
  await expect(page.getByTestId('hollywood-publicity-context')).toBeVisible()

  await expect.poll(async () => {
    const window = Number(await performance.getAttribute('data-telemetry-window'))
    const samples = Number(await performance.getAttribute('data-frame-samples'))
    return window > initialWindow && samples < 240
  }, {
    message: 'campaign mount must start a visibly fresh post-panel telemetry window',
    timeout: 5_000,
  }).toBe(true)
  await expect(performance).toHaveAttribute('data-frame-samples', '240', { timeout: 20_000 })
  const telemetry = (await performance.textContent()) ?? ''
  const values = telemetry.match(
    /^(\d+) fps · (\d+) fps 1% low · (\d+) objects · (\d+) actors · ([\d.]+) MB decoded .+ · ([\d.]+) ms p99 · ([\d.]+) ms worst .+ · (\d+) draws$/,
  )
  expect(values, telemetry).not.toBeNull()

  return { performance, telemetry, values: values! }
}

test('warm Hollywood telemetry completes 240 frames and the exact structural budgets', async ({ page }) => {
  const { performance, values } = await collectGovernedTelemetry(page)

  // M1.5 RE-MEASURE (accepted, not a regression): `eebbefd` moved roster presence into
  // `studioLotSnapshot`, so the ten contracted employees this governed fixture's single
  // picture does not claim now stand on the retained plate too — one dynamic actor and two
  // display objects each, 42/19 → 62/29. Decoded MB and the single draw call are unchanged,
  // which is what proves the delta is people and not a renderer leak.
  expect(Number(values![3])).toBe(62)
  expect(Number(values![4])).toBe(29)
  expect(Number(values![5])).toBe(10.6)
  expect(Number(values![8])).toBe(1)
  await expect(performance).toHaveAttribute('data-frame-samples', '240')
  await expect(page.getByTestId('hollywood-production-blocker')).toContainText('blocked')
  await page.screenshot({ path: join(outDir, 'telemetry-structural-headless-1920x1080.png') })
})

test('GPU evidence run meets every frozen Hollywood wall-clock budget', async ({ page }) => {
  test.skip(
    !PERFORMANCE_EVIDENCE,
    'Set PROJECT_STUDIO_PERFORMANCE_EVIDENCE=1 only in a quiescent GPU-accelerated evidence browser.',
  )

  const { values } = await collectGovernedTelemetry(page)
  expect(Number(values![1])).toBeGreaterThanOrEqual(50)
  expect(Number(values![2])).toBeGreaterThanOrEqual(30)
  expect(Number(values![6])).toBeLessThanOrEqual(33.4)
  expect(Number(values![7])).toBeLessThanOrEqual(33.4)
  await expect(page.getByTestId('hollywood-production-blocker')).toContainText('blocked')
  await page.screenshot({ path: join(outDir, 'telemetry-absolute-1920x1080.png') })
})
