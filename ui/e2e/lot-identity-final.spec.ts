// ── D1-A: FINAL CLEAN owner evidence (production-adoption package) ────────────────
// The approved Concept A, captured for the joint merge review with the review overlay HIDDEN
// (the owner judges the lot at the production camera, no dev chrome), except the one shot that
// documents the performance panel. Real Phaser, seeded native SaveFileV11 fixtures. Output lands in
// out/d1a-identity-evidence/final-clean/. Matched baseline-vs-Concept-A use identical state.

import { test, expect, type Page } from '@playwright/test'
import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(here, '..', '..')
const fixturesDir = join(here, 'fixtures')
const outDir = join(repoRoot, 'out', 'd1a-identity-evidence', 'final-clean')
mkdirSync(outDir, { recursive: true })

const ACTIVE_SESSION_KEY = 'project-studio.active-session.v4'
const OVERVIEW_FLAG = 'project-studio.flags.studio-lot-overview'
const IDENTITY_FLAG = 'project-studio.flags.studio-lot-identity-proof'
const OPERATION_HOLLYWOOD_FLAG = 'project-studio.flags.operation-hollywood'

test.beforeAll(() => {
  const names = ['empty', 'one', 'two', 'released', 'warn']
  if (!names.every((n) => existsSync(join(fixturesDir, `${n}.json`)))) {
    execSync('npx vite-node scripts/gen-lot-fixtures.mts', { cwd: repoRoot, stdio: 'inherit' })
  }
})

const fixture = (name: string) => readFileSync(join(fixturesDir, `${name}.json`), 'utf8')

async function seed(page: Page, fixtureName: string) {
  const save = fixture(fixtureName)
  await page.addInitScript(
    ([key, json, f1, f2, hollywoodFlag]) => {
      try {
        localStorage.setItem(key as string, json as string)
        localStorage.setItem(f1 as string, '1')
        localStorage.setItem(f2 as string, '1')
        localStorage.setItem(hollywoodFlag as string, '0')
      } catch { /* ignore */ }
    },
    [ACTIVE_SESSION_KEY, save, OVERVIEW_FLAG, IDENTITY_FLAG, OPERATION_HOLLYWOOD_FLAG] as const,
  )
  await page.goto('/')
  await expect(page.getByTestId('studio-lot-screen')).toBeVisible()
}

async function openLot(page: Page) {
  await expect(page.getByTestId('studio-lot-screen')).toBeVisible()
  await expect(page.getByTestId('lot-review-mode')).toBeVisible()
  await page.waitForTimeout(1300)
}

async function setMode(page: Page, key: 'baseline' | 'concept-a' | 'fallback' | 'reduced') {
  await page.getByTestId(`lot-review-${key}`).click()
  await page.waitForTimeout(700)
}

/** Hide the dev overlay for a clean production-camera capture. */
async function hideOverlay(page: Page) {
  await page.getByTestId('lot-review-hide').click()
  await expect(page.getByTestId('lot-review-mode')).toHaveCount(0)
  await page.waitForTimeout(350)
}

const shot = (page: Page, name: string) => page.screenshot({ path: join(outDir, `${name}.png`) })

// baseline vs approved Concept A (identical state), plus the responsive Concept A set, all clean
test('baseline + approved Concept A overviews + responsive set (overlay hidden)', async ({ page }) => {
  await seed(page, 'released')
  await openLot(page)

  await setMode(page, 'baseline')
  await hideOverlay(page)
  await shot(page, '01-overview-baseline')

  await page.getByTestId('lot-review-show').click()
  await setMode(page, 'concept-a')
  await hideOverlay(page)
  await shot(page, '02-overview-conceptA')

  for (const [label, w, h, zoom] of [
    ['03-conceptA-1920x1080', 1920, 1080, 1],
    ['04-conceptA-1366x768', 1366, 768, 1],
    ['05-conceptA-1280x720', 1280, 720, 1],
    ['06-conceptA-zoom125', 1366, 768, 1.25],
  ] as const) {
    await page.setViewportSize({ width: w, height: h })
    await page.evaluate((z) => { document.documentElement.style.zoom = String(z) }, zoom)
    await page.waitForTimeout(450)
    await shot(page, label)
  }
  await page.evaluate(() => { document.documentElement.style.zoom = '1' })
})

test('gate, stage A/B, theater (release + no release), selected building — clean', async ({ page }) => {
  // Gate + Stage A/B + Theater-with-release come from the two-stage / released states.
  await seed(page, 'released')
  await openLot(page)
  await setMode(page, 'concept-a')
  await hideOverlay(page)
  await shot(page, '07-gate')
  await shot(page, '09-theater-release')

  // selected building (Stage A) — clean
  await page.getByTestId('lot-review-show').click()
  await page.getByTestId('lot-nav-gate').click()
  await expect(page.getByTestId('dash-week')).toBeVisible()
  await page.getByTestId('back-to-studio-lot').click()
  await expect(page.getByTestId('lot-nav-gate')).toHaveAttribute('aria-current', 'true')
  await setMode(page, 'concept-a')
  await hideOverlay(page)
  await shot(page, '11-selected-building')
})

test('stage A/B facades + both stages active — clean', async ({ page }) => {
  await seed(page, 'two')
  await openLot(page)
  await setMode(page, 'concept-a')
  await hideOverlay(page)
  await shot(page, '08-stage-ab')
})

test('theater with no release — clean', async ({ page }) => {
  await seed(page, 'empty')
  await openLot(page)
  await setMode(page, 'concept-a')
  await hideOverlay(page)
  await shot(page, '10-theater-no-release')
})

test('warning state — clean', async ({ page }) => {
  await seed(page, 'warn')
  await openLot(page)
  expect(await page.getByTestId('lot-nav-admin').getAttribute('data-attention')).toBe('warning')
  await setMode(page, 'concept-a')
  await hideOverlay(page)
  await shot(page, '12-warning')
})

test('reduced motion — clean', async ({ page }) => {
  await seed(page, 'two')
  await openLot(page)
  await setMode(page, 'reduced')
  await hideOverlay(page)
  await shot(page, '13-reduced-motion')
})

test('failed-identity fallback — clean', async ({ page }) => {
  await seed(page, 'released')
  await openLot(page)
  await setMode(page, 'fallback')
  await expect(page.locator('[data-testid^="lot-nav-"][data-attention]')).toHaveCount(9)
  await hideOverlay(page)
  await shot(page, '14-fallback')
})

test('companion navigation — clean', async ({ page }) => {
  await seed(page, 'two')
  await openLot(page)
  await setMode(page, 'concept-a')
  await hideOverlay(page)
  await expect(page.getByTestId('lot-companion-nav')).toBeVisible()
  await shot(page, '15-companion-nav')
})

test('performance panel (overlay visible — the one documented exception)', async ({ page }) => {
  await seed(page, 'two')
  await openLot(page)
  await expect(page.getByTestId('lot-perf-panel')).toContainText('fps')
  await shot(page, '16-performance-panel')
})
