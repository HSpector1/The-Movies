// ── Gate D1: Studio Lot Playwright journeys + responsive/state evidence ───────
// Ten focused journeys through the real app (Phaser boots for real). State is seeded
// via native SaveFileV11 fixtures (the app's session-recovery path) so hard-to-click states
// (two concurrent productions, a release) are deterministic. Evidence screenshots are
// written under out/gate-d1-evidence/final/.
//
// Fixtures are engine-built (scripts/gen-lot-fixtures.mts) and gitignored; they are
// regenerated here if missing, so the suite is self-contained.

import { test, expect, type Page } from '@playwright/test'
import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { acknowledgeMigratedSaveNotice } from './helpers/save-migration-notice.ts'

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(here, '..', '..')
const fixturesDir = join(here, 'fixtures')
const sceneryLoadInFixturesDir = join(here, 'world-first-scenery-load-in-v1')
const outDir = join(repoRoot, 'out', 'gate-d1-evidence', 'final')
mkdirSync(outDir, { recursive: true })

const ACTIVE_SESSION_KEY = 'project-studio.active-session.v4'
const FLAG_KEY = 'project-studio.flags.studio-lot-overview'
const OPERATION_HOLLYWOOD_FLAG_KEY = 'project-studio.flags.operation-hollywood'
const HOLLYWOOD_DISTRICT_WIDTH = 1586
const HOLLYWOOD_DISTRICT_HEIGHT = 992
const HOLLYWOOD_CAMERA_BOUNDS = { x: -120, y: -90, width: 1826, height: 1172 } as const
const SCENERY_LOAD_IN_WORLD_POINT = { x: 390, y: 584 } as const

test.beforeAll(() => {
  const names = ['empty', 'one', 'two', 'released']
  if (!names.every((n) => existsSync(join(fixturesDir, `${n}.json`)))) {
    execSync('npx vite-node scripts/gen-lot-fixtures.mts', { cwd: repoRoot, stdio: 'inherit' })
  }
  const sceneryLoadInNames = [
    'week-30-nights-of-watchtower-stage-7-blocked.save.json',
    'week-30-nights-of-watchtower-stage-7-ready.save.json',
  ]
  if (!sceneryLoadInNames.every((name) => existsSync(join(sceneryLoadInFixturesDir, name)))) {
    execSync('npx vite-node scripts/gen-world-first-scenery-load-in-fixtures.mts', {
      cwd: repoRoot,
      stdio: 'inherit',
    })
  }
})

function fixture(name: string): string {
  return readFileSync(join(fixturesDir, `${name}.json`), 'utf8')
}

/** Seed a studio and the exact overview/Hollywood presentation gates before app load. */
async function seed(
  page: Page,
  fixtureName: string,
  opts: { flag?: boolean; hollywood?: boolean } = {},
) {
  const save = fixture(fixtureName)
  await page.addInitScript(
    ([key, json, flagKey, flagOn, hollywoodFlag, hollywoodOn]) => {
      try {
        localStorage.setItem(key as string, json as string)
        localStorage.setItem(flagKey as string, flagOn ? '1' : '0')
        // Gate-D1 evidence predates Operation Hollywood and must keep its procedural control.
        localStorage.setItem(hollywoodFlag as string, hollywoodOn ? '1' : '0')
      } catch { /* ignore */ }
    },
    [
      ACTIVE_SESSION_KEY,
      save,
      FLAG_KEY,
      opts.flag !== false,
      OPERATION_HOLLYWOOD_FLAG_KEY,
      opts.hollywood === true,
    ] as const,
  )
  await page.goto('/')
  if (opts.flag === false) await expect(page.getByTestId('dash-week')).toBeVisible()
  else await expect(page.getByTestId('studio-lot-screen')).toBeVisible()
}

type SceneryLoadInFixture = 'blocked' | 'ready'

/** Restore one native SaveFileV11 scenery state and enable the player-facing Hollywood lot. */
async function seedSceneryLoadIn(page: Page, state: SceneryLoadInFixture) {
  const save = readFileSync(join(
    sceneryLoadInFixturesDir,
    `week-30-nights-of-watchtower-stage-7-${state}.save.json`,
  ), 'utf8')
  await page.addInitScript(
    ([sessionKey, json, lotFlag, hollywoodFlag]) => {
      try {
        localStorage.setItem(sessionKey as string, json as string)
        localStorage.setItem(lotFlag as string, '1')
        localStorage.setItem(hollywoodFlag as string, '1')
      } catch { /* ignore */ }
    },
    [ACTIVE_SESSION_KEY, save, FLAG_KEY, OPERATION_HOLLYWOOD_FLAG_KEY] as const,
  )
  await page.goto('/')
  await expect(page.getByTestId('recovery-notice')).toContainText('Week 30')
  await expect(page.getByTestId('studio-lot-screen')).toBeVisible()
}

async function openLot(page: Page) {
  if (!(await page.getByTestId('studio-lot-screen').isVisible().catch(() => false))) {
    const back = page.getByTestId('back-to-studio-lot')
    if (await back.isVisible().catch(() => false)) await back.click()
    else await page.getByTestId('open-studio-lot').click()
  }
  await expect(page.getByTestId('studio-lot-screen')).toBeVisible()
  await expect(page.getByTestId('lot-companion-nav')).toBeVisible()
  await page.waitForTimeout(1200) // Phaser boot + first paint
}

async function openSceneryLoadInLot(page: Page) {
  // Studio Home is lazy. After a hard reload the recovery notice can paint before the
  // Lot chunk resolves, so await the authoritative home instead of interpreting that
  // brief loading interval as a Dashboard-root session.
  await expect(page.getByTestId('studio-lot-screen')).toBeVisible()
  await expect(page.getByTestId('hollywood-current-production')).toContainText('Nights of Watchtower')
  await expect(page.getByTestId('studio-lot-canvas').locator('canvas')).toHaveCount(1)
  await expect(page.getByText('Preparing the lot…', { exact: true })).toHaveCount(0)
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
  // Phaser constrains the centred overview to its declared world bounds. At the
  // 1280x720 management viewport the canvas is wider than those bounds, so the
  // camera is intentionally pinned at x=-120 rather than remaining centred.
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

const shot = (page: Page, name: string) => page.screenshot({ path: join(outDir, `${name}.png`) })
const attentionOf = (page: Page, id: string) => page.getByTestId(`lot-nav-${id}`).getAttribute('data-attention')

// ── Journey 1 — fresh-studio empty lot (+ all required viewports) ─────────────
test('1. empty lot renders with all nine destinations, at every supported viewport', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(String(e)))
  await seed(page, 'empty')
  await openLot(page)

  await expect(page.locator('[data-testid^="lot-nav-"][data-attention]')).toHaveCount(9)
  // Empty early-game: both stages available; theater has no releases yet.
  expect(await attentionOf(page, 'stage-a')).toBe('empty')
  expect(await attentionOf(page, 'stage-b')).toBe('empty')
  await expect(page.getByTestId('lot-nav-theater-state')).toContainText('No releases yet')
  await expect(page.getByTestId('lot-nav-writers-state')).toContainText('Assemble a film')

  const viewports = [
    ['1920x1080', 1920, 1080],
    ['1440x900', 1440, 900],
    ['1366x768', 1366, 768],
    ['1280x720', 1280, 720],
    ['1024x768', 1024, 768],
  ] as const
  for (const [label, w, h] of viewports) {
    await page.setViewportSize({ width: w, height: h })
    await page.waitForTimeout(350)
    // Every core destination must be reachable/visible in the companion nav at every viewport.
    await expect(page.getByTestId('lot-nav-gate')).toBeVisible()
    await expect(page.getByTestId('lot-nav-theater')).toBeVisible()
    await shot(page, `empty-${label}`)
  }
  // 125% browser zoom (emulated) at 1366x768.
  await page.setViewportSize({ width: 1366, height: 768 })
  await page.evaluate(() => { document.documentElement.style.zoom = '1.25' })
  await page.waitForTimeout(350)
  await shot(page, 'empty-1366x768-zoom125')
  await page.evaluate(() => { document.documentElement.style.zoom = '1' })

  expect(errors, errors.join('\n')).toEqual([])
})

// ── Journey 2 — one occupied stage ────────────────────────────────────────────
test('2. one production occupies exactly one stage', async ({ page }) => {
  await seed(page, 'one')
  await openLot(page)
  expect(await attentionOf(page, 'stage-a')).toBe('active')
  expect(await attentionOf(page, 'stage-b')).toBe('empty')
  await expect(page.getByTestId('lot-nav-stage-a-state')).toContainText('week')
  await shot(page, 'one-production-1366x768')
})

// ── Journey 3 — two occupied stages, independently truthful ───────────────────
test('3. two productions occupy Stage A and Stage B independently', async ({ page }) => {
  await seed(page, 'two')
  await openLot(page)
  expect(await attentionOf(page, 'stage-a')).toBe('active')
  expect(await attentionOf(page, 'stage-b')).toBe('active')
  // Independent state text (each stage shows its own film's remaining weeks).
  await expect(page.getByTestId('lot-nav-stage-a-state')).toContainText('week')
  await expect(page.getByTestId('lot-nav-stage-b-state')).toContainText('week')
  await shot(page, 'two-productions-1366x768')
})

// ── Journey 4 — attention state (financial/decision). D1 has no engine
//    decision-required; assert the honest truth + capture the attention model. ──
test('4. no decision-required is fabricated in D1; attention reflects authoritative state', async ({ page }) => {
  await seed(page, 'one')
  await openLot(page)
  const decisionCount = await page.locator('[data-testid^="lot-nav-"][data-attention="decision-required"]').count()
  expect(decisionCount).toBe(0) // phases 1-4 expose no per-production decision
  // Administration reflects the finance read model (healthy here → not a warning).
  expect(['normal', 'warning']).toContain(await attentionOf(page, 'admin'))
  await shot(page, 'attention-model-1366x768')
})

// ── Journey 5 — theater with a released film present ───────────────────────────
test('5. theater shows a truthful release presence', async ({ page }) => {
  await seed(page, 'released')
  await openLot(page)
  const theaterState = await page.getByTestId('lot-nav-theater-state').textContent()
  expect(theaterState).not.toContain('No releases yet')
  expect(['active', 'recently-completed', 'normal']).toContain(await attentionOf(page, 'theater'))
  await shot(page, 'theater-release-1366x768')
})

// ── Journey 6 — lot → React navigation ────────────────────────────────────────
test('6. activating a lot destination routes to the existing React screen', async ({ page }) => {
  await seed(page, 'empty')
  await openLot(page)
  await page.getByTestId('lot-nav-writers').click() // Development → Assemble a Film
  await expect(page.getByTestId('assembly-steps')).toBeVisible()
  await shot(page, 'lot-to-react-assembly')
})

// ── Journey 7 — React → lot return with selection restored ────────────────────
test('7. returning to the lot restores the previously selected building', async ({ page }) => {
  await seed(page, 'empty')
  await openLot(page)
  await page.getByTestId('lot-nav-admin').click() // Administration → Dashboard, records selection
  await expect(page.getByTestId('dash-week')).toBeVisible()
  await page.getByTestId('back-to-studio-lot').click()
  await expect(page.getByTestId('studio-lot-screen')).toBeVisible()
  await expect(page.getByTestId('lot-nav-admin')).toHaveAttribute('aria-current', 'true')
  await page.waitForTimeout(600)
  await shot(page, 'return-selection-restored-1366x768')
})

// ── Journey 8 — keyboard companion navigation ─────────────────────────────────
test('8. companion navigation is keyboard-operable', async ({ page }) => {
  await seed(page, 'empty')
  await openLot(page)
  const item = page.getByTestId('lot-nav-writers')
  await item.focus()
  await expect(item).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.getByTestId('assembly-steps')).toBeVisible()
})

// ── Journey 9 — refresh with authoritative state restored ─────────────────────
test('9. a reload restores the authoritative studio', async ({ page }) => {
  await seed(page, 'one')
  await openLot(page)
  const weekText = await page.getByTestId('lot-cash').textContent()
  await page.reload()
  await expect(page.getByTestId('recovery-notice')).toBeVisible()
  // Studio Home restores directly against the same authoritative state.
  await expect(page.getByTestId('studio-lot-screen')).toBeVisible()
  await expect(page.getByTestId('lot-cash')).toHaveText(weekText ?? '')
})

// ── Journey 10 — feature flag OFF leaves the app unchanged ─────────────────────
test('10. with the flag off there is no lot entry and the app is unchanged', async ({ page }) => {
  await seed(page, 'empty', { flag: false })
  await expect(page.getByTestId('open-studio-lot')).toHaveCount(0) // no entry point
  // The normal app still works: advance a week.
  await expect(page.getByTestId('advance-week')).toBeVisible()
  await shot(page, 'flag-off-dashboard')
})

// ── Extra evidence: world-native legacy Annex inspection + reduced motion ─────
test('E. legacy Annex remains inspect-only in the mounted lot', async ({ page }) => {
  await seed(page, 'empty')
  await openLot(page)
  expect(await attentionOf(page, 'expansion')).toBe('future')
  await page.getByTestId('lot-nav-expansion').click()
  await expect(page.getByTestId('lot-annex-context')).toBeVisible()
  await expect(page.getByTestId('lot-annex-status')).toContainText('Unavailable')
  await expect(page.getByTestId('lot-annex-legacy-copy')).toContainText(
    'Studio Development becomes available after managed studio operations are activated.',
  )
  await expect(page.getByTestId('lot-annex-build')).toHaveCount(0)
  await expect(page.getByTestId('studio-lot-screen')).toBeVisible()
  await shot(page, 'annex-legacy-world-context-1366x768')
})

test('E2. reduced-motion mode', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await seed(page, 'two')
  await openLot(page)
  await shot(page, 'reduced-motion-1366x768')
  // Companion navigation + states remain fully readable under reduced motion.
  await expect(page.locator('[data-testid^="lot-nav-"][data-attention]')).toHaveCount(9)
})

// ── Real-DOM lifecycle: repeated open/close leaves exactly one live <canvas> ───
// (Complements the mocked component test: this asserts the REAL Phaser teardown.)
test('L. repeated lot open/close leaves no orphaned canvas', async ({ page }) => {
  await seed(page, 'empty')
  for (let i = 0; i < 3; i++) {
    await openLot(page)
    await page.waitForTimeout(700) // Phaser boots + attaches its canvas
    expect(await page.locator('canvas').count()).toBe(1)
    await page.getByTestId('lot-return-dashboard').click()
    await expect(page.getByTestId('dash-week')).toBeVisible()
    await page.waitForTimeout(300)
    expect(await page.locator('canvas').count()).toBe(0) // destroyed on unmount
  }
})

// ── All nine destinations fit without scrolling at the required short viewports ─
test('R. all nine destinations are visible by default at 1366x768 and 1280x720', async ({ page }) => {
  await seed(page, 'empty')
  await openLot(page)
  const ids = ['gate', 'admin', 'casting', 'writers', 'stage-a', 'stage-b', 'post', 'theater', 'expansion']
  for (const [label, w, h] of [['1366x768', 1366, 768], ['1280x720', 1280, 720]] as const) {
    await page.setViewportSize({ width: w, height: h })
    await page.waitForTimeout(300)
    for (const id of ids) {
      // in-viewport, not merely in-DOM: the item's box must sit within the viewport height.
      const box = await page.getByTestId(`lot-nav-${id}`).boundingBox()
      expect(box, `${id} @ ${label} has a box`).not.toBeNull()
      expect(box!.y + box!.height, `${id} bottom within ${label}`).toBeLessThanOrEqual(h + 1)
      expect(box!.y, `${id} top within ${label}`).toBeGreaterThanOrEqual(0)
    }
    await shot(page, `nav-fit-${label}`)
  }
})

// ── World-First Scenery Load-In V1 ───────────────────────────────────────────
// These journeys restore the dedicated native SaveFileV11 fixtures. They exercise
// the ordinary-player Hollywood surface: Engine truth changes; the lot only selects,
// dispatches the field-exact projected command, and acknowledges accepted outcomes.

test('scenery load-in enters from the physical yard and semantic problem, then clears and schedules in one live lot', async ({ page }) => {
  await seedSceneryLoadIn(page, 'blocked')
  await openSceneryLoadInLot(page)

  const originalUrl = page.url()
  const canvas = page.getByTestId('studio-lot-canvas').locator('canvas')
  await canvas.evaluate((node) => node.setAttribute('data-scenery-load-in-mount', 'original'))

  // Physical world entry: click the manifest-authoritative service-yard load-in anchor.
  await expect(page.getByTestId('hollywood-scenery-load-in-context')).toHaveCount(0)
  await clickHollywoodWorldPoint(page, SCENERY_LOAD_IN_WORLD_POINT)
  await expect(page.getByTestId('hollywood-scenery-load-in-context')).toContainText('Scenery & Service')
  await expect(page.getByTestId('hollywood-scenery-load-in-route')).toContainText('Nights of Watchtower')
  await expect(page.getByTestId('hollywood-scenery-load-in-route')).toContainText('Soundstage 7 + Scenery Shop')
  await expect(page.getByTestId('hollywood-scenery-load-in-status')).toContainText('blocked')
  await shot(page, 'scenery-load-in-physical-entry-blocked')

  // Leave that context without leaving the world, then enter through the visible problem.
  await page.getByTestId('hollywood-select-person-t-dir-01').click()
  await expect(page.getByTestId('hollywood-scenery-load-in-context')).toHaveCount(0)
  const problem = page.getByTestId('hollywood-production-blocker')
  await expect(problem).toHaveAttribute('data-world-problem', 'service-yard')
  await problem.click()
  const clear = page.getByTestId('hollywood-production-command-clearSceneryLoadIn')
  await expect(clear).toBeFocused()
  const sweepWindowStarted = await page.evaluate(() => performance.now())
  await clear.click()

  // The authoritative replacement is immediately ready and exposes the next legal action.
  await expect(page.getByTestId('hollywood-scenery-load-in-status')).toContainText('ready')
  const schedule = page.getByTestId('hollywood-production-command-scheduleShootingTake')
  await expect(schedule).toBeEnabled()
  await expect(schedule).toBeFocused()
  await expect(canvas).toHaveAttribute('data-scenery-load-in-mount', 'original')
  await schedule.click()
  const sweepWindowElapsed = await page.evaluate(
    (started) => performance.now() - started,
    sweepWindowStarted,
  )
  expect(sweepWindowElapsed, 'Schedule lands during the 1200ms cosmetic sweep').toBeLessThan(1200)
  await expect(page.getByTestId('hollywood-scenery-load-in-context')).toHaveCount(0)
  await expect(page.getByTestId('hollywood-task-status-prod-0026')).toContainText('scheduled')
  await page.waitForTimeout(1250)
  await expect(page.getByTestId('hollywood-activity-message')).toHaveCount(0)
  await expect(page.getByTestId('studio-lot-screen')).toBeVisible()
  await expect(canvas).toHaveAttribute('data-scenery-load-in-mount', 'original')
  expect(page.url()).toBe(originalUrl)
  await shot(page, 'scenery-load-in-cleared-and-scheduled')
})

test('scenery load-in direct ready reload paints ready truth without replaying delivery', async ({ page }) => {
  await seedSceneryLoadIn(page, 'ready')
  await openSceneryLoadInLot(page)

  await expect(page.locator('.hollywood-activity')).toHaveCount(0)
  await clickHollywoodWorldPoint(page, SCENERY_LOAD_IN_WORLD_POINT)
  await expect(page.getByTestId('hollywood-scenery-load-in-context')).toContainText('Delivered')
  await expect(page.getByTestId('hollywood-scenery-load-in-status')).toContainText('ready')
  await expect(page.getByTestId('hollywood-production-command-scheduleShootingTake')).toBeEnabled()
  await expect(page.locator('.hollywood-activity')).toHaveCount(0)

  // A direct SaveFileV11 reload is authoritative ready state, not a blocked→ready event.
  await page.reload()
  await expect(page.getByTestId('recovery-notice')).toContainText('Week 30')
  await openSceneryLoadInLot(page)
  await expect(page.locator('.hollywood-activity')).toHaveCount(0)
  await clickHollywoodWorldPoint(page, SCENERY_LOAD_IN_WORLD_POINT)
  await expect(page.getByTestId('hollywood-scenery-load-in-context')).toContainText('Delivered')
  await expect(page.getByTestId('hollywood-production-command-scheduleShootingTake')).toBeFocused()
  await expect(page.locator('.hollywood-activity')).toHaveCount(0)
})

test('scenery load-in semantic command path survives renderer construction failure', async ({ page }) => {
  // Abort only the lazy renderer module. The React companion remains the complete path.
  await page.route('**/src/lot/StudioLotView.ts*', (route) => route.abort())
  await seedSceneryLoadIn(page, 'blocked')
  await expect(page.getByTestId('studio-lot-screen')).toBeVisible()
  await expect(page.getByTestId('lot-canvas-fallback')).toBeVisible()
  await expect(page.getByTestId('studio-lot-canvas').locator('canvas')).toHaveCount(0)

  const serviceYard = page.getByTestId('lot-nav-service-yard')
  await expect(serviceYard).toBeVisible()
  await serviceYard.focus()
  await page.keyboard.press('Enter')
  await expect(page.getByTestId('hollywood-scenery-load-in-context')).toContainText('Blocked')
  await expect(page.getByTestId('hollywood-production-command-clearSceneryLoadIn')).toBeFocused()
  await page.keyboard.press('Space')
  await expect(page.getByTestId('hollywood-scenery-load-in-context')).toContainText('Delivered')
  const schedule = page.getByTestId('hollywood-production-command-scheduleShootingTake')
  await expect(schedule).toBeFocused()
  await schedule.click()
  await expect(page.getByTestId('hollywood-scenery-load-in-context')).toHaveCount(0)
  await expect(page.getByTestId('hollywood-task-status-prod-0026')).toContainText('scheduled')
  await expect(page.getByTestId('studio-lot-screen')).toBeVisible()
  await shot(page, 'scenery-load-in-renderer-fallback')
})

test('scenery load-in reduced motion acknowledges accepted delivery immediately', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await seedSceneryLoadIn(page, 'blocked')
  await openSceneryLoadInLot(page)
  await expect(page.getByTestId('studio-lot-screen')).toHaveClass(/lot-reduced-motion/)

  await page.getByTestId('hollywood-production-blocker').click()
  await page.getByTestId('hollywood-production-command-clearSceneryLoadIn').click()
  await expect(page.getByTestId('hollywood-scenery-load-in-status')).toContainText('ready')
  await expect(page.getByTestId('hollywood-production-command-scheduleShootingTake')).toBeEnabled()
  await expect(page.locator('.hollywood-activity')).toHaveText(
    'Nights of Watchtower scenery reached Soundstage 7. The shooting take is ready to schedule.',
  )
  await page.getByTestId('hollywood-production-command-scheduleShootingTake').click()
  await expect(page.getByTestId('hollywood-scenery-load-in-context')).toHaveCount(0)
  await expect(page.getByTestId('hollywood-task-status-prod-0026')).toContainText('scheduled')
  await expect(page.getByTestId('hollywood-activity-message')).toHaveCount(0)
  await shot(page, 'scenery-load-in-reduced-motion')
})

test('generic physical service yard remains inspectable without exact scenery authority', async ({ page }) => {
  await seed(page, 'empty', { hollywood: true })
  await openLot(page)

  await expect(page.getByTestId('lot-nav-service-yard')).toHaveCount(0)
  await clickHollywoodWorldPoint(page, SCENERY_LOAD_IN_WORLD_POINT)
  await expect(page.getByTestId('hollywood-scenery-load-in-context')).toHaveCount(0)
  await expect(page.getByTestId('hollywood-inspector')).toContainText('SELECTED PLACE')
  await expect(page.getByTestId('hollywood-inspector')).toContainText('Scenery & Service')
})

test('scenery load-in remains reachable across governed viewports and maximum world zoom', async ({ page }) => {
  const productWarnings: string[] = []
  const productErrors: string[] = []
  const failedRequests: string[] = []
  page.on('console', (message) => {
    const text = message.text()
    if (message.type() === 'error') productErrors.push(text)
    if (
      message.type() === 'warning' &&
      !/GL Driver Message|GPU stall due to ReadPixels/i.test(text)
    ) productWarnings.push(text)
  })
  page.on('pageerror', (error) => productErrors.push(error.message))
  page.on('requestfailed', (request) => {
    failedRequests.push(`${request.method()} ${request.url()} — ${request.failure()?.errorText ?? 'failed'}`)
  })

  await page.setViewportSize({ width: 1280, height: 720 })
  await seedSceneryLoadIn(page, 'blocked')
  await openSceneryLoadInLot(page)
  // V14 boundary follow-up (C2a-M1). The seeded fixture is a committed SaveFileV13 artefact,
  // so the app now — correctly — raises its migrated-save acknowledgement above the lot. That
  // banner is 92.5px of dismissible chrome stacked on a `min-height: 100vh` screen, which is
  // 92.5px of lot pushed below the fold at EVERY viewport below. Acknowledging it is what a
  // player does, and it is what makes the loop below measure the lot rather than the notice.
  // The helper asserts the banner was there and that Dismiss clears it — two claims this
  // journey never made while a V13 fixture was the current format.
  await acknowledgeMigratedSaveNotice(page)

  for (const [label, width, height] of [
    ['1280x720', 1280, 720],
    ['1366x768', 1366, 768],
    ['1440x900', 1440, 900],
    ['1920x1080', 1920, 1080],
    ['1536x864', 1536, 864],
    ['1024x768', 1024, 768],
    ['960x540', 960, 540],
  ] as const) {
    await page.setViewportSize({ width, height })
    await page.evaluate(() => window.scrollTo(0, 0))
    const serviceYard = page.getByTestId('lot-nav-service-yard')
    await serviceYard.focus()
    await expect(serviceYard).toBeVisible()
    const serviceBox = await serviceYard.boundingBox()
    expect(serviceBox, `service-yard @ ${label} has a box`).not.toBeNull()
    expect(serviceBox!.x, `service-yard left within ${label}`).toBeGreaterThanOrEqual(0)
    expect(serviceBox!.x + serviceBox!.width, `service-yard right within ${label}`).toBeLessThanOrEqual(width + 1)
    expect(serviceBox!.y, `service-yard top within ${label}`).toBeGreaterThanOrEqual(0)
    expect(serviceBox!.y + serviceBox!.height, `service-yard bottom within ${label}`).toBeLessThanOrEqual(height + 1)
    await page.keyboard.press('Enter')

    const command = page.getByTestId('hollywood-production-command-clearSceneryLoadIn')
    await expect(command).toBeFocused()
    await command.scrollIntoViewIfNeeded()
    await expect(command).toBeVisible()
    const commandBox = await command.boundingBox()
    expect(commandBox, `command @ ${label} has a box`).not.toBeNull()
    expect(commandBox!.x, `command left within ${label}`).toBeGreaterThanOrEqual(0)
    expect(commandBox!.x + commandBox!.width, `command right within ${label}`).toBeLessThanOrEqual(width + 1)
    expect(commandBox!.y, `command top within ${label}`).toBeGreaterThanOrEqual(0)
    expect(commandBox!.y + commandBox!.height, `command bottom within ${label}`).toBeLessThanOrEqual(height + 1)

    const productionBox = await page.getByTestId('hollywood-current-production').boundingBox()
    const contextBox = await page.getByTestId('hollywood-scenery-load-in-context').boundingBox()
    expect(productionBox, `production @ ${label} has a box`).not.toBeNull()
    expect(contextBox, `scenery context @ ${label} has a box`).not.toBeNull()
    expect(contextBox!.x, `context left within ${label}`).toBeGreaterThanOrEqual(0)
    expect(contextBox!.x + contextBox!.width, `context right within ${label}`).toBeLessThanOrEqual(width + 1)
    expect(contextBox!.y, `context top within ${label}`).toBeGreaterThanOrEqual(0)
    expect(contextBox!.y + contextBox!.height, `context bottom within ${label}`).toBeLessThanOrEqual(height + 1)
    const overlapWidth = Math.max(
      0,
      Math.min(productionBox!.x + productionBox!.width, contextBox!.x + contextBox!.width) -
        Math.max(productionBox!.x, contextBox!.x),
    )
    const overlapHeight = Math.max(
      0,
      Math.min(productionBox!.y + productionBox!.height, contextBox!.y + contextBox!.height) -
        Math.max(productionBox!.y, contextBox!.y),
    )
    expect(overlapWidth * overlapHeight, `production/context overlap @ ${label}`).toBe(0)
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth),
      `page-level horizontal overflow @ ${label}`,
    ).toBe(false)
    await shot(page, `scenery-load-in-responsive-${label}`)
  }

  // Phaser clamps repeated wheel-up input at 1.85× fitted zoom. DOM management
  // remains reachable while the world itself is at the authored maximum.
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.evaluate(() => window.scrollTo(0, 0))
  const canvas = page.getByTestId('studio-lot-canvas').locator('canvas')
  const canvasBox = await canvas.boundingBox()
  expect(canvasBox).not.toBeNull()
  await canvas.hover({ position: { x: canvasBox!.width / 2, y: canvasBox!.height / 2 } })
  for (let step = 0; step < 12; step++) await page.mouse.wheel(0, -600)
  await expect(page.getByTestId('hollywood-scenery-load-in-context')).toContainText(
    'Nights of Watchtower',
  )
  await expect(page.getByTestId('hollywood-production-command-clearSceneryLoadIn')).toBeVisible()
  await expect(canvas).toHaveCount(1)
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(false)
  await shot(page, 'scenery-load-in-maximum-world-zoom')

  await page.waitForTimeout(250)
  expect(productWarnings, 'zero product warnings across governed viewports').toEqual([])
  expect(productErrors, 'zero product errors across governed viewports').toEqual([])
  expect(failedRequests, 'zero failed requests across governed viewports').toEqual([])
})
