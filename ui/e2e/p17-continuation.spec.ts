// ── P17 browser journey: a released original, a sequel with one featured guest, the lineage and meters ──
//
// Follows smoke.spec.ts: stable test ids, the release-commit affordance, the newspaper and release screens, and a
// save imported through the Start screen and continued. Featured appearances unlock at week 1872 (1956), which a
// browser campaign cannot reach inside any budget, so the fixture is the cameo route the core lane runs GREEN
// (tests/helpers/p17-cameo-route.ts, seed p17-cameo-booking-01): the headless world founded at week 1871 and ticked
// to the unlock. It is built in-spec with the real engine, proved byte-identical through export/import, and loaded
// through the visible import control. Nothing in the browser writes GameState; every step is a visible control.

import { test, expect, type Page } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { cameoRoute } from '../../tests/helpers/p17-cameo-route.ts'
import { exportSaveJson, importSaveJson } from '../src/engine/adapter.ts'
import { openAuthoritativePackage } from './helpers/managed-production.ts'

const SEED = 'p17-cameo-booking-01'
const STUDIO_LOT_OVERVIEW_FLAG = 'project-studio.flags.studio-lot-overview'
const MAX_RELEASE_WEEKS = 24
const shotsDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'screenshots')
mkdirSync(shotsDir, { recursive: true })

/** Built inside the test (not at collection), so the runner's listing pass does not pay the route twice. */
function fixture() {
  const route = cameoRoute(SEED)
  const bytes = exportSaveJson(route.world)
  const replay = importSaveJson(bytes)
  if (!replay.ok) throw new Error(`premise: the p17 fixture imports: ${replay.error}`)
  if (replay.converted || exportSaveJson(replay.state) !== bytes) throw new Error('premise: the p17 fixture replays byte-identically')
  return { route, bytes }
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript((key) => localStorage.setItem(key, '0'), STUDIO_LOT_OVERVIEW_FLAG)
})

async function shot(page: Page, name: string) {
  await page.screenshot({ path: join(shotsDir, `${name}.png`), fullPage: true })
}

/** Legacy wizard: the named concept, the first eligible person in every picker, then Review. */
async function packageToReview(page: Page, conceptId: string) {
  expect(await openAuthoritativePackage(page), 'premise: the 1956 studio assembles through the legacy wizard').toBe('legacy')
  await page.getByTestId(`concept-${conceptId}`).click()
  for (let i = 0; i < 3; i++) await page.getByTestId('assembly-next').click()
  await expect(page.getByTestId('step-talent')).toHaveClass(/active/)
  for (const picker of ['picker-writer', 'picker-director', 'picker-lead', 'picker-antagonist', 'picker-support', 'picker-craft']) {
    await page.getByTestId(picker).locator('button[aria-pressed]:not([disabled])').first().click()
  }
  await page.getByTestId('assembly-next').click() // → budget
  await page.getByTestId('assembly-next').click() // → review
  await expect(page.getByTestId('step-review')).toHaveClass(/active/)
}

/** Advance (committing at Release Ready) until a release card shows; returns its production id. */
async function advanceUntilRelease(page: Page): Promise<string> {
  for (let i = 0; i < MAX_RELEASE_WEEKS; i++) {
    const commit = page.getByTestId('release-commit')
    if (await commit.isVisible().catch(() => false)) await commit.click()
    const advance = page.getByTestId('advance-week')
    if (await advance.isVisible().catch(() => false)) await advance.click()
    const newspaper = page.getByTestId('newspaper-reveal')
    if (await newspaper.isVisible().catch(() => false)) await page.getByTestId('newspaper-continue').click()
    const releaseList = page.getByTestId('release-list')
    if (await releaseList.isVisible().catch(() => false)) {
      const cards = releaseList.locator('[data-testid^="release-card-"]')
      if ((await cards.count()) > 0) return (await cards.first().getAttribute('data-testid'))!.replace('release-card-', '')
      await page.getByTestId('release-continue').click()
    }
  }
  throw new Error(`premise: a release within ${MAX_RELEASE_WEEKS} weeks`)
}

/** smoke.spec.ts's continue step: one real week, walking any newspaper or release screen back to the Dashboard. */
async function continueOneWeek(page: Page) {
  const before = Number(await page.getByTestId('dash-week').textContent())
  expect(Number.isSafeInteger(before), 'premise: the Dashboard shows a whole week').toBe(true)
  const continuedWeek = String(before + 1)
  await expect(page.getByTestId('advance-week')).toBeEnabled()
  await page.getByTestId('advance-week').click()
  for (let transition = 0; transition < 3; transition++) {
    let destination = 'pending'
    await expect.poll(async () => {
      if (await page.getByTestId('newspaper-reveal').isVisible()) destination = 'newspaper'
      else if (await page.getByTestId('release-list').isVisible()) destination = 'release'
      else if (await page.getByTestId('dash-week').isVisible()
        && (await page.getByTestId('dash-week').textContent()) === continuedWeek) destination = 'dashboard'
      else destination = 'pending'
      return destination
    }).not.toBe('pending')
    if (destination === 'dashboard') break
    await page.getByTestId(destination === 'newspaper' ? 'newspaper-continue' : 'release-continue').click()
  }
  await expect(page.getByTestId('dash-week')).toHaveText(continuedWeek)
}

test('P17 journey: release an original, greenlight its sequel with a featured guest, release it, read lineage and meters', async ({ page }) => {
  test.setTimeout(240_000)
  const { route, bytes } = fixture()
  const [CONCEPT_A, CONCEPT_B] = [route.world.concepts[0]!, route.world.concepts[1]!]

  // (1) Import the 1956 studio through the Start screen and continue it one real week.
  await page.goto('/')
  await expect(page.getByTestId('new-game')).toBeVisible()
  await page.getByTestId('import-text').fill(bytes)
  await page.getByTestId('import-save').click()
  await expect(page.getByTestId('dash-week')).toHaveText(String(route.world.market.tick))
  await expect(page.getByTestId('seed-label')).toContainText(SEED)
  await continueOneWeek(page)
  await expect(page.getByTestId('seed-label')).toContainText(SEED)

  // (2) An original: no property with released work yet, so no continuation is offered; guests are available.
  await packageToReview(page, CONCEPT_A.id)
  await expect(page.getByTestId('continuation-none')).toBeVisible()
  await expect(page.getByTestId('guest-panel')).toBeVisible()
  await expect(page.getByTestId('guest-unavailable')).toHaveCount(0)
  await page.getByTestId('greenlight').click()
  await expect(page.getByTestId('active-list')).toBeVisible()
  const originalId = await advanceUntilRelease(page)
  await shot(page, 'p17-1-original-released')
  await page.getByTestId('release-continue').click()
  await expect(page.getByTestId('dash-week')).toBeVisible()

  // (3) The sequel: the core's directSequel of the original under the held title, with one featured guest.
  await packageToReview(page, CONCEPT_B.id)
  const sequel = page.getByTestId(`continuation-choice-directSequel-${originalId}`)
  await expect(sequel).toBeEnabled()
  await expect(page.getByTestId(`continuation-choice-directSequel-${originalId}-quote`)).toContainText('Relies on the held title')
  await sequel.check()
  const guests = page.locator('input[data-testid^="guest-feature-"]:not([disabled])')
  expect(await guests.count(), 'premise: at least one eligible featured guest').toBeGreaterThan(0)
  await guests.first().check()
  await expect(page.getByTestId('guest-cost-total')).toContainText('(1 guest)')
  await shot(page, 'p17-2-sequel-review')
  await page.getByTestId('greenlight').click()

  // (4) The production screen: the reserved appearance, its retained-charge disclosure and the cancel control.
  await expect(page.getByTestId('featured-bookings')).toBeVisible()
  await expect(page.locator('[data-testid^="booking-cancel-disclosure-"]').first()).toContainText('retains')
  await expect(page.locator('button[data-testid^="booking-cancel-"]').first()).toBeEnabled()
  await shot(page, 'p17-3-booking-reserved')

  // (5) Release the sequel and read its outcome from the core records.
  const sequelId = await advanceUntilRelease(page)
  expect(sequelId).not.toBe(originalId)
  await expect(page.getByTestId(`release-lineage-${sequelId}`)).toContainText(`Direct sequel of ${CONCEPT_A.title}`)
  await expect(page.getByTestId(`release-meters-${sequelId}`)).toBeVisible()
  await expect(page.locator(`[data-testid^="release-guest-"]`).first()).toContainText('credited')
  await page.getByTestId(`release-continuation-${sequelId}`).scrollIntoViewIfNeeded()
  await shot(page, 'p17-4-sequel-outcome')
})
