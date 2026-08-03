// ── D1-A: Studio Identity Visual Proof — evidence (Concept A visual-hierarchy revision) ──
// Boots the REAL app (Phaser renders for real) with BOTH the lot-overview and identity-proof
// flags on, and captures the owner-required evidence using the dev review selector. Matched
// baseline-vs-revised pairs use identical viewport, fixture (seed) and framing — only the
// review mode differs. State is seeded via the same engine-built SaveFileV4 fixtures as the
// Gate D1 suite, so every shown state is authoritative. Also asserts a clean console and no
// identity-resource leak. Screenshots land in out/d1a-identity-evidence/.

import { test, expect, type Page } from '@playwright/test'
import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(here, '..', '..')
const fixturesDir = join(here, 'fixtures')
const outDir = join(repoRoot, 'out', 'd1a-identity-evidence')
mkdirSync(outDir, { recursive: true })

const ACTIVE_SESSION_KEY = 'project-studio.active-session.v4'
const OVERVIEW_FLAG = 'project-studio.flags.studio-lot-overview'
const IDENTITY_FLAG = 'project-studio.flags.studio-lot-identity-proof'

test.beforeAll(() => {
  const names = ['empty', 'one', 'two', 'released', 'warn']
  if (!names.every((n) => existsSync(join(fixturesDir, `${n}.json`)))) {
    execSync('npx vite-node scripts/gen-lot-fixtures.mts', { cwd: repoRoot, stdio: 'inherit' })
  }
})

function fixture(name: string): string {
  return readFileSync(join(fixturesDir, `${name}.json`), 'utf8')
}

async function seed(page: Page, fixtureName: string) {
  const save = fixture(fixtureName)
  await page.addInitScript(
    ([key, json, f1, f2]) => {
      try {
        localStorage.setItem(key as string, json as string)
        localStorage.setItem(f1 as string, '1')
        localStorage.setItem(f2 as string, '1')
      } catch { /* ignore */ }
    },
    [ACTIVE_SESSION_KEY, save, OVERVIEW_FLAG, IDENTITY_FLAG] as const,
  )
  await page.goto('/')
  await expect(page.getByTestId('dash-week')).toBeVisible()
}

async function openLot(page: Page) {
  await page.getByTestId('open-studio-lot').click()
  await expect(page.getByTestId('studio-lot-screen')).toBeVisible()
  await expect(page.getByTestId('lot-review-mode')).toBeVisible()
  await page.waitForTimeout(1300)
}

async function review(page: Page, key: 'baseline' | 'concept-a' | 'fallback' | 'reduced') {
  await page.getByTestId(`lot-review-${key}`).click()
  await page.waitForTimeout(700)
}

const shot = (page: Page, name: string) => page.screenshot({ path: join(outDir, `${name}.png`) })

// ── 1–4: matched baseline-vs-revised Concept A at every viewport + 125% zoom ─────
test('matched baseline vs revised Concept A at 1920, 1366, 1280, and 125% zoom', async ({ page }) => {
  await seed(page, 'released')
  await openLot(page)
  const settings = [
    ['1920', 1920, 1080, 1],
    ['1366', 1366, 768, 1],
    ['1280', 1280, 720, 1],
    ['zoom125', 1366, 768, 1.25],
  ] as const
  for (const [label, w, h, zoom] of settings) {
    await page.setViewportSize({ width: w, height: h })
    await page.evaluate((z) => { document.documentElement.style.zoom = String(z) }, zoom)
    await page.waitForTimeout(400)
    // identical viewport/state/seed/framing — only the review mode changes.
    await review(page, 'baseline')
    await shot(page, `overview-${label}-baseline`)
    await review(page, 'concept-a')
    await shot(page, `overview-${label}-conceptA`)
  }
  await page.evaluate(() => { document.documentElement.style.zoom = '1' })
})

// ── 5: gate overview / 6: gate selected ─────────────────────────────────────────
test('gate overview + gate selected (banner + PS emblem, then selection ring)', async ({ page }) => {
  await seed(page, 'released')
  await openLot(page)
  await shot(page, 'gate-overview')
  await page.getByTestId('lot-nav-gate').click()
  await expect(page.getByTestId('dash-week')).toBeVisible()
  await page.getByTestId('open-studio-lot').click()
  await expect(page.getByTestId('lot-nav-gate')).toHaveAttribute('aria-current', 'true')
  await page.waitForTimeout(900)
  await shot(page, 'gate-selected')
})

// ── 7: Stage A/B comparison / 8: both stages active ─────────────────────────────
test('Stage A/B facade comparison + both stages active', async ({ page }) => {
  await seed(page, 'two')
  await openLot(page)
  await shot(page, 'stage-ab-comparison')
  await shot(page, 'both-stages-active') // same authentic two-stage state, both lit
})

// ── 9: theater with a released title ─────────────────────────────────────────────
test('theater marquee with a released title', async ({ page }) => {
  await seed(page, 'released')
  await openLot(page)
  await shot(page, 'theater-released')
})

// ── 10: theater with no release (static THEATER marquee) ─────────────────────────
test('theater marquee with no release (static THEATER)', async ({ page }) => {
  await seed(page, 'empty')
  await openLot(page)
  await expect(page.getByTestId('lot-nav-theater-state')).toContainText('No releases yet')
  await shot(page, 'theater-no-release')
})

// ── 11: warning state (financial pressure on Administration) ─────────────────────
test('warning state (Administration ATTENTION badge)', async ({ page }) => {
  await seed(page, 'warn')
  await openLot(page)
  expect(await page.getByTestId('lot-nav-admin').getAttribute('data-attention')).toBe('warning')
  await shot(page, 'warning-state')
})

// ── 12: reduced-motion state ─────────────────────────────────────────────────────
test('reduced-motion state (Concept A, motion frozen)', async ({ page }) => {
  await seed(page, 'two')
  await openLot(page)
  await review(page, 'reduced')
  await shot(page, 'reduced-motion')
})

// ── 13: fallback mode ────────────────────────────────────────────────────────────
test('fallback mode (base lot survives, nav intact)', async ({ page }) => {
  await seed(page, 'released')
  await openLot(page)
  await review(page, 'fallback')
  await expect(page.locator('[data-testid^="lot-nav-"][data-attention]')).toHaveCount(9)
  await shot(page, 'fallback')
})

// ── 14: clean overview with the review controls hidden ───────────────────────────
test('clean overview with the review overlay hidden', async ({ page }) => {
  await seed(page, 'released')
  await openLot(page)
  await review(page, 'concept-a')
  await page.getByTestId('lot-review-hide').click() // remove the overlay for a clean judgment
  await expect(page.getByTestId('lot-review-mode')).toHaveCount(0)
  await expect(page.getByTestId('lot-review-show')).toBeVisible()
  await page.waitForTimeout(300)
  await shot(page, 'clean-overview-hidden')
})

// ── 15: performance panel ────────────────────────────────────────────────────────
test('performance panel (fps · objects · identity object count)', async ({ page }) => {
  await seed(page, 'two')
  await openLot(page)
  await expect(page.getByTestId('lot-perf-panel')).toBeVisible()
  await expect(page.getByTestId('lot-perf-panel')).toContainText('fps')
  await shot(page, 'performance-panel')
})

// ── Console cleanliness across every review mode ─────────────────────────────────
test('no console errors while cycling all review modes over a live state', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(`pageerror: ${String(e)}`))
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`console.error: ${m.text()}`) })
  await seed(page, 'released')
  await openLot(page)
  for (const key of ['baseline', 'concept-a', 'fallback', 'reduced', 'concept-a'] as const) {
    // eslint-disable-next-line no-await-in-loop
    await review(page, key)
  }
  expect(errors, errors.join('\n')).toEqual([])
})

// ── No new identity-resource leak across repeated open/close ─────────────────────
test('repeated open/close with identity on leaves no orphaned canvas', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(String(e)))
  await seed(page, 'two')
  for (let i = 0; i < 3; i++) {
    await page.getByTestId('open-studio-lot').click()
    await expect(page.getByTestId('studio-lot-screen')).toBeVisible()
    await page.waitForTimeout(800)
    expect(await page.locator('canvas').count()).toBe(1)
    await page.getByTestId('lot-return-dashboard').click()
    await expect(page.getByTestId('dash-week')).toBeVisible()
    await page.waitForTimeout(300)
    expect(await page.locator('canvas').count()).toBe(0)
  }
  expect(errors, errors.join('\n')).toEqual([])
})
