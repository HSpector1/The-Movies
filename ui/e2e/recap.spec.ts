// ── D-15 Studio Run Recap — Playwright journey + owner evidence ───────────────
// Loads a real SaveFileV5 fixture (scripts/gen-recap-fixtures.mts) with a concentrated
// multi-film slate, opens the recap from the Dashboard, verifies the sections + a11y, and
// captures owner-review screenshots (laptop resolutions + 125% zoom). Clean console.

import { test, expect, type Page } from '@playwright/test'
import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(here, '..', '..')
const fixturesDir = join(here, 'fixtures')
const outDir = join(repoRoot, 'out', 'd15-recap-evidence')
mkdirSync(outDir, { recursive: true })
const SESSION_KEY = 'project-studio.active-session.v4'

test.beforeAll(() => {
  if (!existsSync(join(fixturesDir, 'recap-run.json'))) {
    execSync('npx vite-node scripts/gen-recap-fixtures.mts', { cwd: repoRoot, stdio: 'inherit' })
  }
})

async function seedAndOpen(page: Page): Promise<string[]> {
  const errors: string[] = []
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text())
  })
  page.on('pageerror', (e) => errors.push(e.message))
  const save = readFileSync(join(fixturesDir, 'recap-run.json'), 'utf8')
  await page.addInitScript(
    ([key, json]) => {
      try {
        localStorage.setItem(key as string, json as string)
      } catch {
        /* ignore */
      }
    },
    [SESSION_KEY, save] as const,
  )
  await page.goto('/')
  await expect(page.getByTestId('dash-week')).toBeVisible()
  await page.getByTestId('open-recap').click()
  await expect(page.getByTestId('studio-run-recap')).toBeVisible()
  return errors
}

const shot = (page: Page, name: string) => page.screenshot({ path: join(outDir, `${name}.png`), fullPage: true })

test('recap: sections render, slate present, current position + warnings, clean console', async ({ page }) => {
  const errors = await seedAndOpen(page)

  // all six sections
  for (const id of ['summary', 'capital', 'films', 'talent', 'concentration', 'position']) {
    await expect(page.getByTestId(`recap-section-${id}`)).toBeVisible()
  }
  // headline facts
  await expect(page.getByTestId('recap-through-week')).toBeVisible()
  await expect(page.getByTestId('recap-total-contribution')).toBeVisible()
  await expect(page.getByTestId('recap-recovery')).toBeVisible()
  // cash chart (default) with an accessible label; the 86-row table is NOT open by default
  await expect(page.getByTestId('recap-cash-chart')).toBeVisible()
  await expect(page.getByTestId('recap-cash-chart').getByRole('img')).toHaveAttribute('aria-label', /Cash history through week/)
  await expect(page.getByTestId('recap-cash-timeline')).toBeHidden() // inside a collapsed <details>
  // the film slate has at least one film row
  await expect(page.locator('[data-testid^="recap-film-prod-"]').first()).toBeVisible()
  // current position distinguishes cheapest vs typical affordability
  await expect(page.getByTestId('recap-cheapest')).toBeVisible()
  await expect(page.getByTestId('recap-typical')).toBeVisible()
  // methodology collapsed; at most three primary warnings
  await expect(page.getByTestId('recap-methodology')).toBeVisible()
  const primaryWarnings = page.getByTestId('recap-warnings').locator(':scope > li')
  expect(await primaryWarnings.count()).toBeLessThanOrEqual(3)

  await shot(page, '01-recap-full')

  // no console errors while viewing
  expect(errors, `console errors: ${errors.join(' | ')}`).toEqual([])
})

async function assertLayoutSound(page: Page) {
  // no horizontal PAGE overflow
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  expect(overflow, `horizontal overflow ${overflow}px`).toBeLessThanOrEqual(1)
  // chart annotations stay inside the SVG (no clipped "Opening $20.00M")
  const svg = page.getByTestId('recap-cash-chart').locator('svg')
  const svgBox = await svg.boundingBox()
  for (const label of ['Opening', 'Now']) {
    const t = svg.locator('text', { hasText: label }).first()
    const b = await t.boundingBox()
    if (b && svgBox) {
      expect(b.x, `${label} label left`).toBeGreaterThanOrEqual(svgBox.x - 1)
      expect(b.x + b.width, `${label} label right`).toBeLessThanOrEqual(svgBox.x + svgBox.width + 1)
    }
  }
}

test('recap: laptop resolutions + 125% zoom evidence (labels in bounds, no overflow)', async ({ page }) => {
  await seedAndOpen(page)
  for (const [w, h] of [
    [1440, 900],
    [1366, 768],
    [1280, 720],
  ] as const) {
    await page.setViewportSize({ width: w, height: h })
    await expect(page.getByTestId('recap-section-position')).toBeVisible()
    await assertLayoutSound(page)
    await shot(page, `02-recap-${w}x${h}`)
  }
  // 125% browser zoom (page-level) — layout must remain usable
  await page.setViewportSize({ width: 1280, height: 720 })
  await page.evaluate(() => {
    ;(document.body.style as unknown as { zoom: string }).zoom = '1.25'
  })
  await expect(page.getByTestId('studio-run-recap')).toBeVisible()
  await assertLayoutSound(page)
  await shot(page, '03-recap-zoom-125')
})

test('recap: keyboard — Back returns to the Dashboard', async ({ page }) => {
  await seedAndOpen(page)
  const back = page.getByTestId('recap-back')
  await back.focus()
  await expect(back).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.getByTestId('dash-week')).toBeVisible()
  await expect(page.getByTestId('studio-run-recap')).toHaveCount(0)
})
