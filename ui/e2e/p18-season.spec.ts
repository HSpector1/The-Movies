// ── P18 browser journey: commission a limited-series season, advance to its first credited unit ──
//
// Follows p17-continuation.spec.ts: stable test ids, a save imported through the Start screen, and real weeks walked
// through the newspaper and release screens. The fixture is the P18 route the core lane runs GREEN
// (tests/helpers/p18-season-world.ts, seed p18-sprint12-season-01): two idle film crews, the player's P16 property, the
// operational synchronized-sound chain and six idle contracted people, about 440 real ticks. It is built in-spec with the
// real engine, proved byte-identical through export/import, and loaded through the visible import control. Nothing in
// the browser writes GameState; every step is a visible control.

import { test, expect, type Page } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildSeasonWorld, SEED } from '../../tests/helpers/p18-season-world.ts'
import { exportSaveJson, importSaveJson } from '../src/engine/adapter.ts'

const STUDIO_LOT_OVERVIEW_FLAG = 'project-studio.flags.studio-lot-overview'
const MAX_WEEKS_TO_FIRST_UNIT = 4
const shotsDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'screenshots')
mkdirSync(shotsDir, { recursive: true })

/** Built inside the test (not at collection), so the runner's listing pass does not pay the route twice. */
function fixture() {
  const route = buildSeasonWorld()
  const bytes = exportSaveJson(route.state)
  const replay = importSaveJson(bytes)
  if (!replay.ok) throw new Error(`premise: the p18 fixture imports: ${replay.error}`)
  if (replay.converted || exportSaveJson(replay.state) !== bytes) throw new Error('premise: the p18 fixture replays byte-identically')
  return { route, bytes }
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript((key) => localStorage.setItem(key, '0'), STUDIO_LOT_OVERVIEW_FLAG)
})

async function shot(page: Page, name: string) {
  await page.screenshot({ path: join(shotsDir, `${name}.png`), fullPage: true })
}

/** One real week from the Dashboard (p17-continuation.spec.ts's poll per screen), back on the Dashboard. */
async function advanceWeek(page: Page) {
  const before = Number(await page.getByTestId('dash-week').textContent())
  expect(Number.isSafeInteger(before), 'premise: the Dashboard shows a whole week').toBe(true)
  const continuedWeek = String(before + 1)
  await expect(page.getByTestId('advance-week')).toBeEnabled()
  await page.getByTestId('advance-week').click()
  for (let transition = 0; transition < 4; transition++) {
    let destination = 'pending'
    await expect.poll(async () => {
      if (await page.getByTestId('newspaper-reveal').isVisible()) destination = 'newspaper'
      else if (await page.getByTestId('release-list').isVisible()) destination = 'release'
      else if (await page.getByTestId('dash-week').isVisible()
        && (await page.getByTestId('dash-week').textContent()) === continuedWeek) destination = 'dashboard'
      else destination = 'pending'
      return destination
    }).not.toBe('pending')
    if (destination === 'dashboard') return
    if (destination === 'newspaper') await page.getByTestId('newspaper-continue').click()
    else await page.getByTestId('release-continue').click()
  }
  throw new Error(`premise: week ${continuedWeek} settles within four screens`)
}

test('P18 journey: commission a season from Assembly, advance to its first credited unit, read the Dashboard row', async ({ page }) => {
  test.setTimeout(240_000)
  const { route, bytes } = fixture()

  // (1) Import the studio through the Start screen.
  await page.goto('/')
  await expect(page.getByTestId('new-game')).toBeVisible()
  await page.getByTestId('import-text').fill(bytes)
  await page.getByTestId('import-save').click()
  await expect(page.getByTestId('dash-week')).toHaveText(String(route.state.market.tick))
  await expect(page.getByTestId('seed-label')).toContainText(SEED)
  await expect(page.locator('[data-testid^="season-row-"]')).toHaveCount(0)

  // (2) Assembly: open the season panel; the empty title is refused by name, then the quote admits the season.
  await page.getByTestId('assemble-film').click()
  await page.getByTestId('season-open').click()
  await expect(page.getByTestId('season-quote')).toContainText('Work floor (twelve units): $300,000')
  await expect(page.getByTestId('season-refusal')).toContainText('a new series needs a non-empty title')
  await expect(page.getByTestId('season-commission')).toBeDisabled()
  await page.getByTestId('season-title').fill('The Long Night')
  await expect(page.getByTestId('season-refusal')).toHaveCount(0)
  await expect(page.getByTestId('season-commission')).toBeEnabled()
  await shot(page, 'p18-1-season-quote')
  await page.getByTestId('season-commission').click()

  // (3) Back on the Dashboard: the live season row, no unit credited yet, the cancel offered.
  await expect(page.getByTestId('dash-week')).toBeVisible()
  const progress = page.locator('[data-testid^="season-progress-"]')
  await expect(progress).toHaveCount(1)
  await expect(progress).toContainText('Season scripts · 0 of 12 units credited')
  await expect(page.locator('button[data-testid^="season-cancel-"]')).toHaveCount(1)

  // (4) Real weeks until the first credited unit; the row shows 1 unit.
  for (let week = 0; week < MAX_WEEKS_TO_FIRST_UNIT; week++) {
    if (((await progress.textContent()) ?? '').includes('1 of 12 units credited')) break
    await advanceWeek(page)
  }
  await expect(progress).toContainText('1 of 12 units credited')
  await progress.scrollIntoViewIfNeeded()
  await shot(page, 'p18-2-first-unit')
})
