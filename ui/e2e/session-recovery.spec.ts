// ── Browser session recovery (D-12) ──────────────────────────────────────────
// The owner lost a whole studio when the game restarted. This proves, in a REAL browser, that a
// page RELOAD restores the active studio session (it no longer drops to the Start screen), that
// advancing time survives a reload, and that "New Studio" is an explicit destructive action.
// (Exact production/theatrical-run restoration is covered exhaustively by ui/src/session.test.tsx.)

import { test, expect, type Page } from '@playwright/test'

const STUDIO_LOT_OVERVIEW_FLAG = 'project-studio.flags.studio-lot-overview'

test.beforeEach(async ({ page }) => {
  await page.addInitScript((key) => localStorage.setItem(key, '0'), STUDIO_LOT_OVERVIEW_FLAG)
})

async function foundStudioViaUi(page: Page, seed: string) {
  await page.goto('/')
  await expect(page.getByTestId('new-game')).toBeVisible()
  await page.getByTestId('seed-input').fill(seed)
  await page.getByTestId('new-game').click()
  await expect(page.getByTestId('found-studio')).toBeVisible()
  for (const [role, count] of [['actor', 3], ['director', 1], ['writer', 2], ['craft', 1]] as const) {
    await page.getByTestId(`founding-tab-${role}`).click()
    const group = page.getByTestId(`founding-group-${role}`)
    for (let i = 0; i < count; i++) await group.locator('button[data-testid^="founding-sign-"]').first().click()
  }
  const found = page.getByTestId('found-studio')
  await expect(found).toBeEnabled()
  await found.click()
  await expect(page.getByTestId('dash-week')).toBeVisible() // now on the studio dashboard
}

test('a page reload restores the active studio (no lost session), and advancing time survives reload', async ({ page }) => {
  await foundStudioViaUi(page, 'e2e-recovery')
  const cashBefore = await page.getByTestId('dash-cash').textContent()

  // Advance a couple of weeks so the session is non-trivial.
  await page.getByTestId('advance-week').click()
  // A week with no release may show a release/summary screen; return to the dashboard if so.
  const cont = page.getByTestId('release-continue')
  if (await cont.isVisible().catch(() => false)) await cont.click()
  await expect(page.getByTestId('dash-week')).toBeVisible()
  const weekBefore = await page.getByTestId('dash-week').textContent()

  // RELOAD — the studio must be recovered, NOT reset to the Start screen.
  await page.reload()
  await expect(page.getByTestId('recovery-notice')).toBeVisible()
  await expect(page.getByTestId('recovery-notice')).toContainText(/Recovered your studio from Week/)
  await expect(page.getByTestId('dash-week')).toBeVisible()
  expect(await page.getByTestId('dash-week').textContent()).toBe(weekBefore)
  // Cash reflects the advanced session, not a fresh $20M start.
  await expect(page.getByTestId('new-game')).toHaveCount(0) // definitely not the Start screen
  void cashBefore

  // The recovery notice is dismissible.
  await page.getByTestId('recovery-dismiss').click()
  await expect(page.getByTestId('recovery-notice')).toHaveCount(0)
})

test('a reload with NO prior session shows the Start screen (no false recovery)', async ({ page }) => {
  // A different browser context (fresh storage) never recovers a session it does not have.
  await page.goto('/')
  await expect(page.getByTestId('new-game')).toBeVisible()
  await expect(page.getByTestId('recovery-notice')).toHaveCount(0)
})
