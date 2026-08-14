// ── Browser playtest: D-11.D cycle-4A (founding UX + film-flow clarity + autopsy) ─
// Deterministic seed. Drives the REAL app through the non-financial Cycle-4A corrections
// and captures the requested screenshots:
//   • clearer creator terminology (Starting Skill Profile / Career Potential / Work Ethic);
//   • profession-based founding tabs (Actors; Writers showing 1 of 1 — the one-writer min);
//   • restrained applicant sorting + filtering;
//   • the accessible default autopsy (result / worked / hurt / grade) with the technical
//     report collapsed under Advanced Analysis, then expanded.
// (Release Strategy, Sim-to-Next-Event, and weekly cash-flow are the D-12 economy milestone,
// out of Cycle-4A scope.) Only observable UI is asserted; selectors are stable testids.

import { test, expect, type Page } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  enterPackageTalentStep,
  openAuthoritativePackage,
} from './helpers/managed-production.ts'

const SEED = 'e2e-cycle4-playtest'
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
  for (let i = 0; i < n; i++) {
    await group.locator('button[data-testid^="founding-sign-"]').first().click()
  }
}

async function resolveProductionCommands(page: Page) {
  for (let guard = 0; guard < 8; guard++) {
    const command = page.locator('button[data-testid^="production-command-"]:visible').first()
    if ((await command.count()) === 0) return
    await command.click()
  }
  await expect(page.locator('button[data-testid^="production-command-"]:visible')).toHaveCount(0)
}

test('cycle-4A: founding tabs + sort/filter + one-writer + accessible autopsy', async ({ page }) => {
  test.setTimeout(120_000)

  // ── Start a new game → the founding screen. ─────────────────────────────────
  await page.goto('/')
  await page.getByTestId('seed-input').fill(SEED)
  await page.getByTestId('new-game').click()
  await expect(page.getByTestId('found-studio')).toBeVisible()

  // ══ Founding: profession tabs, sorting, filtering ══════════════════════════
  await page.getByTestId('founding-tab-actor').click()
  await expect(page.getByTestId('founding-group-actor')).toBeVisible()
  await shot(page, 'c4-2-founding-actor-tab')

  // Sorting uses a real field (switch to Star Power, then back to OVR).
  await page.getByTestId('founding-sort').selectOption('fame')
  await shot(page, 'c4-4-applicant-sorting')
  await page.getByTestId('founding-sort').selectOption('ovr')

  // Filtering behind one expandable control.
  await page.getByTestId('founding-filters-toggle').click()
  await expect(page.getByTestId('founding-filters')).toBeVisible()
  await page.getByTestId('founding-filter-minovr').fill('40')
  await shot(page, 'c4-5-applicant-filtering')
  await page.getByTestId('founding-filters-clear').click()
  await page.getByTestId('founding-filters-toggle').click() // collapse again

  // ══ One-writer founding: sign the minimum roster via the tabs ══════════════
  await signInTab(page, 'actor', 3)
  await signInTab(page, 'director', 1)
  await signInTab(page, 'writer', 1) // ONE writer — the D-11.D minimum
  // The Writers tab reads 1 of 1 required (met).
  await page.getByTestId('founding-tab-writer').click()
  await expect(page.getByTestId('founding-tab-progress')).toContainText('1 of 1 required')
  await expect(page.getByTestId('founding-coverage-writer')).toContainText('1/1')
  await shot(page, 'c4-3-founding-writer-tab')
  await signInTab(page, 'craft', 1)

  // Found the studio with a single writer.
  await expect(page.getByTestId('found-studio')).toBeEnabled()
  await page.getByTestId('found-studio').click()
  await expect(page.getByTestId('dash-week')).toBeVisible()

  // ══ Creator terminology (Starting Skill Profile / Career Potential) ════════
  await page.getByTestId('open-talent-creator').click()
  await expect(page.getByTestId('creator-mode-balanced')).toHaveAttribute('aria-pressed', 'true')
  await page.getByTestId('talent-name').fill('Terminology Check')
  await page.getByTestId('balanced-next').click() // → profession & preset
  await expect(page.getByTestId('creator-concept-legend')).toBeVisible()
  await expect(page.getByText('Starting Skill Profile').first()).toBeVisible()
  await expect(page.getByText('Career Potential').first()).toBeVisible()
  await shot(page, 'c4-1-creator-terminology')
  // Finish creating the prospect (returns to the dashboard).
  await page.getByTestId('balanced-next').click() // → specialization
  await page.getByTestId('balanced-next').click() // → review
  await page.getByTestId('create-talent').click()
  await expect(page.getByTestId('dash-week')).toBeVisible()

  // ══ Make a film, release it, open the ACCESSIBLE autopsy ═══════════════════
  const authority = await openAuthoritativePackage(page)
  await enterPackageTalentStep(page, authority)
  const pickers = ['picker-director', 'picker-lead', 'picker-antagonist', 'picker-support', 'picker-craft']
  if (authority === 'legacy') pickers.unshift('picker-writer')
  for (const picker of pickers) {
    await page.getByTestId(picker).locator('button[aria-pressed]:not([disabled])').first().click()
  }
  await page.getByTestId('assembly-next').click() // → budget
  await page.getByTestId('assembly-next').click() // → review
  await page.getByTestId('greenlight').click()
  await expect(page.getByTestId('dash-week')).toBeVisible()

  // Advance until the film releases; dismiss the newspaper, open the autopsy.
  let released = false
  for (let i = 0; i < 20 && !released; i++) {
    await resolveProductionCommands(page)
    const advance = page.getByTestId('advance-week')
    if (await advance.isVisible().catch(() => false)) await advance.click()
    const news = page.getByTestId('newspaper-reveal')
    if (await news.isVisible().catch(() => false)) {
      await page.getByTestId('newspaper-open-autopsy').click()
      released = true
      continue
    }
    // A no-release week shows the release summary; dismiss it back to the dashboard.
    const cont = page.getByTestId('release-continue')
    if (await cont.isVisible().catch(() => false)) await cont.click()
  }
  expect(released, 'the film should release and open the newspaper → autopsy').toBe(true)
  await expect(page.getByTestId('autopsy')).toBeVisible()

  // The ACCESSIBLE default: result + worked/hurt + decision grade, no raw sigma up top.
  await expect(page.getByTestId('autopsy-summary')).toBeVisible()
  await expect(page.getByTestId('autopsy-grade')).toBeVisible()
  await expect(page.getByTestId('autopsy-worked')).toBeVisible()
  await expect(page.getByTestId('autopsy-hurt')).toBeVisible()
  // The technical report is collapsed by default.
  await expect(page.getByTestId('autopsy-criticmean')).toBeHidden()
  await shot(page, 'c4-6-simple-autopsy')
  await shot(page, 'c4-7-advanced-collapsed')

  // Expand Advanced Analysis → the full technical report is preserved.
  await page.getByTestId('autopsy-advanced-toggle').click()
  await expect(page.getByTestId('autopsy-criticmean')).toBeVisible()
  await expect(page.getByTestId('autopsy-reviewvariance')).toBeVisible()
  await expect(page.getByTestId('autopsy-greenlight-compare')).toBeVisible()
  await shot(page, 'c4-8-advanced-expanded')
})
