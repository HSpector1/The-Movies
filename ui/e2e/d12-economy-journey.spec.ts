// ── Browser playtest: D-12 weekly theatrical economy journey ──────────────────
// Deterministic seed. Drives the REAL app through the D-12 financial UX end to end:
//   • Dashboard Finances card (current-commitments runway) + "Sim to next event";
//   • Assembly Release Strategy (break-even gross + solvency gate on the greenlight);
//   • Sim-to-Next-Event advancing to the release (the newspaper reveal);
//   • the theatrical run appearing In theaters, paying Studio Revenue weekly;
//   • the releases table Studio Rev column (rental share of gross, < full gross).
// Only observable UI is asserted; selectors are stable testids.

import { test, expect, type Page } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { enterPackageTalentStep, openAuthoritativePackage } from './helpers/managed-production.ts'

const SEED = 'e2e-d12-economy'
const STUDIO_LOT_OVERVIEW_FLAG = 'project-studio.flags.studio-lot-overview'
const shotsDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'screenshots')
mkdirSync(shotsDir, { recursive: true })

test.beforeEach(async ({ page }) => {
  await page.addInitScript((key) => localStorage.setItem(key, '0'), STUDIO_LOT_OVERVIEW_FLAG)
})
async function shot(page: Page, name: string) {
  await page.screenshot({ path: join(shotsDir, `${name}.png`), fullPage: true })
}
async function signInTab(page: Page, role: string, n: number) {
  await page.getByTestId(`founding-tab-${role}`).click()
  const group = page.getByTestId(`founding-group-${role}`)
  for (let i = 0; i < n; i++) await group.locator('button[data-testid^="founding-sign-"]').first().click()
}

async function resolveProductionCommands(page: Page) {
  for (let guard = 0; guard < 8; guard++) {
    const command = page.locator('button[data-testid^="production-command-"]:visible').first()
    if ((await command.count()) === 0) return
    await expect(command).toBeEnabled()
    await command.click()
  }
  await expect(page.locator('button[data-testid^="production-command-"]:visible')).toHaveCount(0)
}

test('D-12: finances card, release-strategy gate, sim-to-event, theatrical run + Studio Rev', async ({ page }) => {
  test.setTimeout(120_000)

  // ── Found a studio. ─────────────────────────────────────────────────────────
  await page.goto('/')
  await page.getByTestId('seed-input').fill(SEED)
  await page.getByTestId('new-game').click()
  await expect(page.getByTestId('found-studio')).toBeVisible()
  await signInTab(page, 'actor', 3)
  await signInTab(page, 'director', 1)
  await signInTab(page, 'writer', 1)
  await signInTab(page, 'craft', 1)
  await page.getByTestId('found-studio').click()
  await expect(page.getByTestId('dash-week')).toBeVisible()

  // ══ Dashboard: Finances card + Sim-to-Next-Event + empty In-theaters ════════
  await expect(page.getByTestId('finances-card')).toBeVisible()
  await expect(page.getByTestId('fin-runway')).toBeVisible()
  await expect(page.getByTestId('fin-burn')).toBeVisible()
  await expect(page.getByTestId('sim-to-event')).toBeVisible()
  await expect(page.getByTestId('no-runs')).toBeVisible() // nothing in theaters yet
  await shot(page, 'd12-1-dashboard-finances')

  // ══ Assemble a film → Release Strategy (break-even + solvency gate) ═════════
  const authority = await openAuthoritativePackage(page)
  await enterPackageTalentStep(page, authority)
  const pickers = [
    ...(authority === 'legacy' ? ['picker-writer'] : []),
    'picker-director',
    'picker-lead',
    'picker-antagonist',
    'picker-support',
    'picker-craft',
  ]
  for (const picker of pickers) {
    await page.getByTestId(picker).locator('button[aria-pressed]:not([disabled])').first().click()
  }
  await page.getByTestId('assembly-next').click() // → budget
  await page.getByTestId('assembly-next').click() // → review
  // Release Strategy panel: break-even gross, cash-after, solvency gate = Pass (D-12 C1: the gate
  // reads Pass/Blocked, with capital exposure surfaced separately rather than a single "Affordable" tick).
  await expect(page.getByTestId('release-breakeven')).toBeVisible()
  await expect(page.getByTestId('release-cash-after')).toBeVisible()
  await expect(page.getByTestId('release-gate')).toContainText('Pass')
  await expect(page.getByTestId('release-exposure')).toBeVisible()
  await shot(page, 'd12-2-release-strategy')
  await expect(page.getByTestId('greenlight')).toBeEnabled()
  await page.getByTestId('greenlight').click()
  await expect(page.getByTestId('dash-week')).toBeVisible()

  // ══ Sim to next event → the film releases (newspaper), then to the autopsy ══
  let released = false
  for (let i = 0; i < 8 && !released; i++) {
    // Managed productions stop unattended simulation at visible player decisions.
    // Resolve that exact command chain before asking the engine for the next event.
    await resolveProductionCommands(page)
    const sim = page.getByTestId('sim-to-event')
    await expect(sim).toBeEnabled()
    await sim.click()
    const news = page.getByTestId('newspaper-reveal')
    if (await news.isVisible().catch(() => false)) {
      await shot(page, 'd12-3-release-newspaper')
      await page.getByTestId('newspaper-open-autopsy').click()
      await expect(page.getByTestId('autopsy')).toBeVisible()
      await page.getByTestId('autopsy-back').click()
      released = true
      continue
    }
    // A non-release stop shows the weekly summary; continue back to the dashboard.
    const cont = page.getByTestId('period-continue')
    if (await cont.isVisible().catch(() => false)) {
      await expect(page.getByTestId('period-summary')).toBeVisible()
      await cont.click()
    }
  }
  expect(released, 'Sim to next event should reach the release and open the newspaper').toBe(true)
  await expect(page.getByTestId('dash-week')).toBeVisible()

  // ══ Back on the dashboard: an active theatrical run + Studio Rev column ══════
  await expect(page.getByTestId('theatrical-runs')).toBeVisible()
  await expect(page.locator('[data-testid^="run-"]').first()).toBeVisible()
  // The run panel shows a total Studio Revenue figure.
  await expect(page.locator('[data-testid$="-total"]').first()).toBeVisible()
  // Finances now reports at least one film in theaters.
  await expect(page.getByTestId('fin-active-runs')).toContainText('1')
  // The releases table carries a Studio Rev cell (rental share of the gross).
  const studioRev = page.locator('[data-testid$="-studiorev"]').first()
  await expect(studioRev).toBeVisible()
  await expect(studioRev).toContainText('$')
  await shot(page, 'd12-4-theatrical-run-and-studiorev')
})
