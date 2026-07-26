// ── Browser smoke: the full playable loop in a REAL browser ──────────────────
// Deterministic seed. Drives the app through: start → assemble a legal film
// (concept, shape, promise, writer, director, 3 distinct cast, budgets) → greenlight
// → advance weeks until release → open the autopsy → export the save → start a new
// game and import it → assert the visible state matches. Captures 7 screenshots.
//
// Selectors are stable roles/labels/testids, never fragile CSS.

import { test, expect, type Page } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const SEED = 'e2e-browser-smoke'
const shotsDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'screenshots')
mkdirSync(shotsDir, { recursive: true })

async function shot(page: Page, name: string) {
  await page.screenshot({ path: join(shotsDir, `${name}.png`), fullPage: true })
}

async function startNewGame(page: Page, seed: string) {
  await page.goto('/')
  await expect(page.getByTestId('new-game')).toBeVisible()
  await page.getByTestId('seed-input').fill(seed)
}

// Assemble a legal film through the wizard, choosing the first eligible option in
// each picker so the package is always legal (distinct cast enforced by the UI).
async function assembleLegalFilm(page: Page) {
  await page.getByTestId('assemble-film').click()
  await expect(page.getByTestId('assembly-steps')).toBeVisible()

  // Concept: first concept card.
  const conceptGrid = page.getByTestId('concept-grid')
  await conceptGrid.getByRole('button').first().click()
  await page.getByTestId('assembly-next').click() // → shape

  await page.getByTestId('assembly-next').click() // → promise (defaults valid)
  await page.getByTestId('assembly-next').click() // → talent (default segment chosen)

  // Talent: first ENABLED option in each picker.
  for (const picker of ['picker-writer', 'picker-director', 'picker-lead', 'picker-antagonist', 'picker-support']) {
    const enabled = page.getByTestId(picker).getByRole('button').and(page.locator(':not([disabled])')).first()
    await enabled.click()
  }
  await shot(page, '2-assembly-talent')
  await page.getByTestId('assembly-next').click() // → budget

  await expect(page.getByTestId('forecast-display')).toBeVisible()
  await expect(page.getByTestId('required-negative')).toBeVisible()
  await shot(page, '3-budget-forecast')
  await page.getByTestId('assembly-next').click() // → review
}

test('full playable loop: assemble → greenlight → release → autopsy → save round-trip', async ({ page }) => {
  test.setTimeout(120_000)

  // (1) Start / new game.
  await startNewGame(page, SEED)
  await shot(page, '1-start-new-game')
  await page.getByTestId('new-game').click()
  await expect(page.getByTestId('dash-week')).toHaveText('0')

  // (2) + (3) Assembly flow + budget/forecast review (screens captured inside).
  await assembleLegalFilm(page)

  // Greenlight the film.
  await page.getByTestId('greenlight').click()

  // (4) Dashboard with an active production.
  await expect(page.getByTestId('active-list')).toBeVisible()
  await shot(page, '4-dashboard-active-production')

  // Advance weeks until a release appears (walk the release screen each week).
  let releaseCardTestId: string | null = null
  for (let i = 0; i < 20 && !releaseCardTestId; i++) {
    const advance = page.getByTestId('advance-week')
    if (await advance.isVisible().catch(() => false)) {
      await advance.click()
    }
    const releaseList = page.getByTestId('release-list')
    if (await releaseList.isVisible().catch(() => false)) {
      const cards = releaseList.locator('[data-testid^="release-card-"]')
      if ((await cards.count()) > 0) {
        releaseCardTestId = await cards.first().getAttribute('data-testid')
      } else {
        // Nothing released this week — continue back to the dashboard.
        await page.getByTestId('release-continue').click()
      }
    }
  }
  expect(releaseCardTestId, 'a film should release within the window').not.toBeNull()

  // (5) Release result screen.
  await shot(page, '5-release-result')

  // (5b) RULING A — the per-release development summary is shown on the release screen for
  // every participating talent (development is ON in normal play). Capture it explicitly.
  const prodId0 = releaseCardTestId!.replace('release-card-', '')
  await expect(page.getByTestId(`development-summary-${prodId0}`)).toBeVisible()
  await page.getByTestId(`development-summary-${prodId0}`).scrollIntoViewIfNeeded()
  await shot(page, '8-development-summary')

  // (6) Open the full autopsy from the release card.
  const prodId = releaseCardTestId!.replace('release-card-', '')
  await page.getByTestId(`open-autopsy-${prodId}`).click()
  await expect(page.getByTestId('autopsy')).toBeVisible()
  // The sampled review variance is present (never hidden).
  await expect(page.getByTestId('autopsy-reviewvariance')).toBeVisible()
  await expect(page.getByTestId('autopsy-criticmean')).toBeVisible()
  await shot(page, '6-autopsy')

  // Back to the studio, then capture the state to round-trip through a save.
  await page.getByTestId('autopsy-back').click()
  await expect(page.getByTestId('dash-week')).toBeVisible()

  // (RULING B) Talent Hub — capability vs credited career identity. After a release, the
  // performing disciplines can read as credited; capable-but-unproven disciplines read as
  // such. Capture the roster, then a profile (with the career-identity panel).
  await page.getByTestId('open-talent-hub').click()
  await expect(page.getByTestId('hub-roster')).toBeVisible()
  await shot(page, '9-talent-hub')
  // Open the first profile to show the career-identity panel + shape-sensitive Fit.
  await page.getByTestId('hub-roster').getByRole('button').first().click()
  await expect(page.getByTestId('hub-career-identity')).toBeVisible()
  await shot(page, '10-talent-hub-profile')
  await page.getByTestId('hub-back').click()
  await expect(page.getByTestId('dash-week')).toBeVisible()

  const weekBefore = await page.getByTestId('dash-week').textContent()
  const cashBefore = await page.getByTestId('dash-cash').textContent()
  const prestigeBefore = await page.getByTestId('standing-industryPrestige').textContent()

  // Export the save from the Saves screen.
  await page.getByTestId('open-saves').click()
  const saveJson = await page.getByTestId('export-text').inputValue()
  expect(saveJson.length).toBeGreaterThan(100)

  // (7) Talent creator screenshot (reachable from the dashboard).
  await page.getByTestId('saves-back').click()
  await page.getByTestId('open-talent-creator').click()
  await expect(page.getByTestId('authored-disclosure')).toBeVisible()
  await shot(page, '7-talent-creator')
  await page.getByTestId('talent-creator-back').click()

  // Start a NEW game (different seed), then import the exported save.
  await page.getByTestId('open-saves').click()
  await page.getByTestId('restart-game').click()
  await expect(page.getByTestId('new-game')).toBeVisible()
  await page.getByTestId('seed-input').fill('a-totally-different-seed')
  await page.getByTestId('import-text').fill(saveJson)
  await page.getByTestId('import-save').click()

  // The imported studio's visible state matches what we exported.
  await expect(page.getByTestId('dash-week')).toHaveText(weekBefore ?? '')
  await expect(page.getByTestId('dash-cash')).toHaveText(cashBefore ?? '')
  await expect(page.getByTestId('standing-industryPrestige')).toContainText(
    (prestigeBefore ?? '').trim().slice(0, 2),
  )
  // The seed label reflects the RESTORED studio seed, not the throwaway seed typed.
  await expect(page.getByTestId('seed-label')).toContainText(SEED)
})
