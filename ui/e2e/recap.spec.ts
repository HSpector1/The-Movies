// ── D-15 Studio Run Recap — Playwright journey + owner evidence ───────────────
// Loads a real native SaveFileV12 fixture (scripts/gen-recap-fixtures.mts) with a concentrated
// multi-film slate, opens the recap from the Dashboard, verifies the sections + a11y, and
// captures owner-review screenshots (laptop resolutions + 125% zoom). Clean console.

import { test, expect, type Page } from '@playwright/test'
import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(here, '..', '..')
const fixturesDir = join(here, 'fixtures')
const outDir = join(repoRoot, 'out', 'd15-recap-evidence')
mkdirSync(outDir, { recursive: true })
const SESSION_KEY = 'project-studio.active-session.v4'
const STUDIO_LOT_OVERVIEW_FLAG = 'project-studio.flags.studio-lot-overview'

test.beforeAll(() => {
  // The fixture is generated and gitignored. Always replace any developer-local copy so
  // this journey cannot silently exercise stale migrated bytes or the former fabricated cash.
  execFileSync(
    join(repoRoot, 'node_modules', '.bin', 'vite-node'),
    ['scripts/gen-recap-fixtures.mts'],
    { cwd: repoRoot, stdio: 'inherit' },
  )

  // Enforce the authority claimed by this suite before a browser imports the fixture.
  const fixture = JSON.parse(readFileSync(join(fixturesDir, 'recap-run.json'), 'utf8')) as {
    saveVersion: number
    state: {
      cashLedgerCheckpoint?: unknown
      ledger: Array<{ amount: number }>
      studio: { cash: number }
    }
  }
  // M2-ENGINE (V12): `makeSave` emits SaveFileV12 since `5d35d26`/`3d0349d`, so the generator
  // this hook just re-ran writes a native V12 envelope. The pin follows the accepted current
  // save version rather than the retired one — same strength, still an exact equality.
  expect(fixture.saveVersion).toBe(12)
  expect(fixture.state.cashLedgerCheckpoint).toBeUndefined()
  expect(
    fixture.state.ledger.reduce((cash, entry) => cash + entry.amount, 20_000_000),
  ).toBe(fixture.state.studio.cash)
})

test.beforeEach(async ({ page }) => {
  await page.addInitScript((key) => localStorage.setItem(key, '0'), STUDIO_LOT_OVERVIEW_FLAG)
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
  // Exact native Engine outcome: four loss-making releases through Week 56.
  await expect(page.getByTestId('recap-through-week')).toHaveText('Week 56')
  await expect(page.getByTestId('recap-film-count')).toHaveText('4')
  await expect(page.getByTestId('recap-pbl-count')).toHaveText('0 / 0 / 4')
  await expect(page.getByTestId('recap-total-contribution')).toHaveText('-$12.00M')
  // cash chart (default) with an accessible label; the weekly table is NOT open by default
  await expect(page.getByTestId('recap-cash-chart')).toBeVisible()
  await expect(page.getByTestId('recap-cash-chart').getByRole('img')).toHaveAttribute('aria-label', /Cash history through week/)
  await expect(page.getByTestId('recap-cash-timeline')).toBeHidden() // inside a collapsed <details>
  // the film slate has at least one film row
  await expect(page.locator('[data-testid^="recap-film-prod-"]').first()).toBeVisible()
  // The real ledger lands in a constrained-but-recoverable position: low-cost packages
  // remain legal, while the recent-normal commitment and waiting strategy do not.
  await expect(page.getByTestId('recap-recovery')).toHaveText('Constrained but recoverable')
  await expect(page.getByTestId('recap-current-cash')).toHaveText('$3,699,090')
  await expect(page.getByTestId('recap-cheapest')).toContainText(
    '$1,950,004 — affordable',
  )
  await expect(page.getByTestId('recap-standard')).toContainText(
    '$3,413,156 — affordable',
  )
  await expect(page.getByTestId('recap-typical')).toContainText(
    '$5,500,000 — short $1,800,910',
  )
  await expect(page.getByTestId('recap-waiting')).toContainText('-$77K / wk')

  // Methodology stays collapsed and the exact read-model warning order is preserved across
  // the three primary items and the six secondary observations.
  await expect(page.getByTestId('recap-methodology')).toBeVisible()
  const primaryWarnings = page.getByTestId('recap-warnings').locator(':scope > li')
  const secondaryWarnings = page.getByTestId('recap-secondary-warnings').locator(':scope > li')
  const warningCodes = [
    'cashPositiveButNormalUnaffordable',
    'waitingBurnsCash',
    'oneMoreFailureNarrowsOptions',
    'contractsOutliveRunway',
    'noActiveRevenue',
    'repeatedLosses',
    'optionsBelowTypical',
    'highGenreConcentration',
    'highLeadConcentration',
  ] as const
  await expect(primaryWarnings).toHaveCount(3)
  await expect(secondaryWarnings).toHaveCount(6)
  await expect(page.getByTestId('recap-more-observations')).toHaveText(
    'More strategic observations (6)',
  )
  for (const [index, code] of warningCodes.entries()) {
    const warning = index < 3 ? primaryWarnings.nth(index) : secondaryWarnings.nth(index - 3)
    await expect(warning).toHaveAttribute(
      'data-testid',
      `recap-warning-${code}`,
    )
  }

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
