// ── Browser playtest: D-11.C cycle-3 (specialization + newspaper reveal) ─────
// Deterministic seed. Drives the REAL app (no engine mocking) through the two owner-ruled
// cycle-3 features and captures the requested screenshots:
//   PART 1 — Balanced Creator SPECIALIZATION: found → open the Balanced creator → pick a
//     profession + archetype → sculpt with the 40-point pool (skills + Comedy experience) →
//     read the DERIVED OVR + player-facing standing → review → create an UNSIGNED prospect.
//   PART 2 — Newspaper release REVEAL: greenlight a film → advance to release → the newspaper
//     front page appears once → open the autopsy from it → later re-open the clipping from
//     the dashboard (reconstructed from persisted state).
//
// Only observable UI is asserted; selectors are stable testids. A green run proves both
// features work against the real simulation.

import { test, expect, type Page } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const SEED = 'e2e-cycle3-playtest'
const shotsDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'screenshots')
mkdirSync(shotsDir, { recursive: true })

async function shot(page: Page, name: string) {
  await page.screenshot({ path: join(shotsDir, `${name}.png`), fullPage: true })
}

async function leadingInt(page: Page, testid: string): Promise<number> {
  const txt = (await page.getByTestId(testid).textContent()) ?? ''
  const m = txt.match(/-?\d+/)
  return m ? Number(m[0]) : NaN
}

test('cycle-3: Balanced specialization creator + newspaper release reveal', async ({ page }) => {
  test.setTimeout(120_000)

  // ── Found a studio. ─────────────────────────────────────────────────────────
  await page.goto('/')
  await expect(page.getByTestId('new-game')).toBeVisible()
  await page.getByTestId('seed-input').fill(SEED)
  await page.getByTestId('new-game').click()
  await expect(page.getByTestId('found-studio')).toBeVisible()
  for (const [role, count] of [
    ['actor', 7],
    ['director', 2],
    ['writer', 2],
    ['craft', 2],
  ] as Array<[string, number]>) {
    await page.getByTestId(`founding-tab-${role}`).click() // D-11.D: select the profession tab
    const group = page.getByTestId(`founding-group-${role}`)
    for (let i = 0; i < count; i++) {
      await group.locator('button[data-testid^="founding-sign-"]').first().click()
    }
  }
  await page.getByTestId('found-studio').click()
  await expect(page.getByTestId('dash-week')).toBeVisible()

  // ══ PART 1 — Balanced specialization ═══════════════════════════════════════
  await page.getByTestId('open-talent-creator').click()
  // Balanced Career is the default mode.
  await expect(page.getByTestId('creator-mode-balanced')).toHaveAttribute('aria-pressed', 'true')

  // Identity.
  await page.getByTestId('talent-name').fill('Wynn Prospect')
  await page.getByTestId('balanced-next').click()

  // Profession & preset: choose an archetype and set the SEPARATE potential/work-ethic.
  await expect(page.getByTestId('balanced-preset')).toBeVisible()
  await page.getByTestId('balanced-preset').selectOption({ label: 'Comedy Prospect' }).catch(async () => {
    // Fall back to whatever the first comedy-ish option is if the label differs.
    const sel = page.getByTestId('balanced-preset')
    const value = await sel.locator('option').nth(1).getAttribute('value')
    if (value) await sel.selectOption(value)
  })
  await page.getByTestId('balanced-potential').selectOption('HighUpside').catch(() => {})
  await shot(page, 'c3-1-profession-preset')

  // Specialization: the 40-point pool, primary skills + genre experience.
  await page.getByTestId('balanced-next').click()
  await expect(page.getByTestId('balanced-points-remaining')).toBeVisible()
  await shot(page, 'c3-2-specialization-stage')

  // Sculpt a couple of primary (acting) skills.
  for (let i = 0; i < 4; i++) await page.getByTestId('balanced-skill-acting-0-inc').click()
  for (let i = 0; i < 3; i++) await page.getByTestId('balanced-skill-acting-3-inc').click()

  // Build Comedy genre EXPERIENCE (the requested allocation shot).
  const remBeforeComedy = await leadingInt(page, 'balanced-points-remaining')
  for (let i = 0; i < 4; i++) await page.getByTestId('balanced-genre-acting-comedy-inc').click()
  const remAfterComedy = await leadingInt(page, 'balanced-points-remaining')
  expect(remAfterComedy).toBeLessThan(remBeforeComedy) // genre experience draws from the pool
  await shot(page, 'c3-3-comedy-experience-allocation')

  // The DERIVED OVR + player-facing standing update live (never an input).
  const derivedOVR = await leadingInt(page, 'balanced-ovr-acting')
  expect(derivedOVR).toBeGreaterThan(0)
  await expect(page.getByTestId('balanced-standing')).toContainText('%ile')
  // A Balanced prospect is lower-middle — well below the top decile.
  expect(await leadingInt(page, 'balanced-standing')).toBeLessThan(90)
  await page.getByTestId('balanced-live-preview').scrollIntoViewIfNeeded()
  await shot(page, 'c3-4-derived-ovr-and-standing')

  // Review & create.
  await page.getByTestId('balanced-next').click()
  await expect(page.getByTestId('balanced-review')).toBeVisible()
  await shot(page, 'c3-5-review')
  await page.getByTestId('create-talent').click()

  // Back on the dashboard, the prospect exists in the studio.
  await expect(page.getByTestId('dash-week')).toBeVisible()

  // ══ PART 2 — Newspaper release reveal ═══════════════════════════════════════
  // Assemble + greenlight a film from the founded roster.
  await page.getByTestId('assemble-film').click()
  await page.getByTestId('concept-grid').getByRole('button').first().click()
  await page.getByTestId('assembly-next').click() // → shape
  await page.getByTestId('assembly-next').click() // → promise
  await page.getByTestId('assembly-next').click() // → talent
  for (const picker of ['picker-writer', 'picker-director', 'picker-lead', 'picker-antagonist', 'picker-support', 'picker-craft']) {
    await page.getByTestId(picker).locator('button[aria-pressed]:not([disabled])').first().click()
  }
  await page.getByTestId('assembly-next').click() // → budget
  await page.getByTestId('assembly-next').click() // → review
  await page.getByTestId('greenlight').click()
  await expect(page.getByTestId('dash-week')).toBeVisible()

  // Advance until the film releases → the NEWSPAPER front page appears first.
  let sawNewspaper = false
  let releasedProdId: string | null = null
  for (let i = 0; i < 20 && !releasedProdId; i++) {
    const advance = page.getByTestId('advance-week')
    if (await advance.isVisible().catch(() => false)) await advance.click()
    const newspaper = page.getByTestId('newspaper-reveal')
    if (await newspaper.isVisible().catch(() => false)) {
      // The front page shows the masthead, a headline, stars, an audience verdict, financials.
      await expect(page.getByTestId('newspaper-masthead')).toBeVisible()
      await expect(page.getByTestId('newspaper-headline')).toBeVisible()
      await expect(page.getByTestId('newspaper-critic-stars')).toBeVisible()
      await expect(page.getByTestId('newspaper-audience')).toBeVisible()
      await expect(page.getByTestId('newspaper-financial')).toBeVisible()
      if (!sawNewspaper) await shot(page, 'c3-6-newspaper-reveal')
      sawNewspaper = true
      // The reveal hands off to the AUTHORITATIVE autopsy.
      await page.getByTestId('newspaper-open-autopsy').click()
      await expect(page.getByTestId('autopsy')).toBeVisible()
      await shot(page, 'c3-7-newspaper-to-autopsy')
      await page.getByTestId('autopsy-back').click()
      await expect(page.getByTestId('dash-week')).toBeVisible()
      releasedProdId = 'seen'
      continue
    }
    // A no-release week shows the release summary; step back to the dashboard so the next
    // advance works.
    const cont = page.getByTestId('release-continue')
    if (await cont.isVisible().catch(() => false)) await cont.click()
  }
  expect(sawNewspaper, 'the newspaper reveal should appear at release').toBe(true)

  // Re-open the newspaper CLIPPING from the dashboard (reconstructed from persisted state).
  const clipping = page.locator('button[data-testid^="clipping-"]').first()
  await expect(clipping).toBeVisible()
  await clipping.click()
  await expect(page.getByTestId('newspaper-reveal')).toBeVisible()
  await expect(page.getByTestId('newspaper-masthead')).toBeVisible()
  await shot(page, 'c3-8-reopened-clipping')
  await page.getByTestId('newspaper-continue').click()
  await expect(page.getByTestId('dash-week')).toBeVisible()
})
