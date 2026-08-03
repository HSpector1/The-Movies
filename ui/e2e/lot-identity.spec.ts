// ── D1-A: Studio Identity Visual Proof — evidence capture (Concept A core slice) ──
// Boots the REAL app (Phaser renders for real) with BOTH the lot-overview and the
// identity-proof flags on, and captures the 16 owner-required evidence shots using the
// dev review selector (Current D1 baseline · Concept A · Fallback · Reduced-motion).
// State is seeded via the same engine-built SaveFileV4 fixtures as the Gate D1 suite, so
// every shown state (both stages lit, a release, a financial-pressure warning) is
// authoritative, not mocked. Also asserts a clean console and no identity-resource leak
// across repeated open/close. Screenshots land in out/d1a-identity-evidence/.

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

/** Seed a studio + both flags before the app loads, then open the app. */
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
  await expect(page.getByTestId('lot-review-mode')).toBeVisible() // identity review bar present
  await page.waitForTimeout(1300) // Phaser boot + first identity paint
}

/** Switch the dev review selector and let Phaser repaint. */
async function review(page: Page, key: 'baseline' | 'concept-a' | 'fallback' | 'reduced') {
  await page.getByTestId(`lot-review-${key}`).click()
  await page.waitForTimeout(700)
}

const shot = (page: Page, name: string) => page.screenshot({ path: join(outDir, `${name}.png`) })

// ── 1–4: responsive overviews + zoom (Concept A, richest state = a release) ──────
test('overviews at 1920x1080, 1366x768, 1280x720, and 125% zoom (Concept A)', async ({ page }) => {
  await seed(page, 'released')
  await openLot(page)
  // default selector is Concept A
  await expect(page.getByTestId('lot-review-concept-a')).toHaveAttribute('aria-pressed', 'true')

  for (const [label, w, h] of [
    ['1920x1080', 1920, 1080],
    ['1366x768', 1366, 768],
    ['1280x720', 1280, 720],
  ] as const) {
    await page.setViewportSize({ width: w, height: h })
    await page.waitForTimeout(500)
    await shot(page, `overview-${label}`)
  }

  await page.setViewportSize({ width: 1366, height: 768 })
  await page.evaluate(() => { document.documentElement.style.zoom = '1.25' })
  await page.waitForTimeout(500)
  await shot(page, 'overview-zoom125')
  await page.evaluate(() => { document.documentElement.style.zoom = '1' })
})

// ── 5: Gate selected ─────────────────────────────────────────────────────────────
test('gate selected (identity wordmark + emblem + selection ring)', async ({ page }) => {
  await seed(page, 'released')
  await openLot(page)
  await page.getByTestId('lot-nav-gate').click() // routes to overview + records selection
  await expect(page.getByTestId('dash-week')).toBeVisible()
  await page.getByTestId('open-studio-lot').click() // back into the lot
  await expect(page.getByTestId('studio-lot-screen')).toBeVisible()
  await expect(page.getByTestId('lot-nav-gate')).toHaveAttribute('aria-current', 'true')
  await page.waitForTimeout(900)
  await shot(page, 'gate-selected')
})

// ── 6–8: stage occupancy identity treatments ────────────────────────────────────
test('Stage A active (one production)', async ({ page }) => {
  await seed(page, 'one')
  await openLot(page)
  await shot(page, 'stage-a-active')
})

test('Stage B active (evidenced within the authentic two-stage state, Stage B selected)', async ({ page }) => {
  await seed(page, 'two')
  await openLot(page)
  await page.getByTestId('lot-nav-stage-b').click()
  await page.getByTestId('open-studio-lot').click()
  await expect(page.getByTestId('lot-nav-stage-b')).toHaveAttribute('aria-current', 'true')
  await page.waitForTimeout(900)
  await shot(page, 'stage-b-active')
})

test('Both stages active', async ({ page }) => {
  await seed(page, 'two')
  await openLot(page)
  await shot(page, 'both-stages-active')
})

// ── 9: theater release presence ──────────────────────────────────────────────────
test('theater release presence (marquee title + RELEASE badge)', async ({ page }) => {
  await seed(page, 'released')
  await openLot(page)
  await shot(page, 'theater-release')
})

// ── 10: warning state (financial pressure on Administration) ─────────────────────
test('warning state (Administration ATTENTION badge)', async ({ page }) => {
  await seed(page, 'warn')
  await openLot(page)
  expect(await page.getByTestId('lot-nav-admin').getAttribute('data-attention')).toBe('warning')
  await shot(page, 'warning-state')
})

// ── 11: reduced-motion mode ──────────────────────────────────────────────────────
test('reduced-motion mode (Concept A, motion frozen; marquee bulbs static)', async ({ page }) => {
  await seed(page, 'two')
  await openLot(page)
  await review(page, 'reduced')
  await shot(page, 'reduced-motion')
})

// ── 12: identity failure fallback ────────────────────────────────────────────────
test('identity failure fallback (base lot survives, nav + selection intact)', async ({ page }) => {
  await seed(page, 'released')
  await openLot(page)
  await review(page, 'fallback')
  // Every destination is still present + operable in the fallback.
  await expect(page.locator('[data-testid^="lot-nav-"][data-attention]')).toHaveCount(9)
  await shot(page, 'identity-fallback')
})

// ── 13: keyboard focus (focus-visible brass ring on a review control + nav) ──────
test('keyboard focus treatment', async ({ page }) => {
  await seed(page, 'empty')
  await openLot(page)
  const item = page.getByTestId('lot-nav-writers')
  await item.focus()
  await expect(item).toBeFocused()
  await shot(page, 'keyboard-focus')
})

// ── 14: companion navigation (accessible truth alongside identity) ───────────────
test('companion navigation panel', async ({ page }) => {
  await seed(page, 'two')
  await openLot(page)
  await expect(page.getByTestId('lot-companion-nav')).toBeVisible()
  await shot(page, 'companion-nav')
})

// ── 15: performance panel ────────────────────────────────────────────────────────
test('performance panel (fps · objects · identity object count)', async ({ page }) => {
  await seed(page, 'two')
  await openLot(page)
  await expect(page.getByTestId('lot-perf-panel')).toBeVisible()
  await expect(page.getByTestId('lot-perf-panel')).toContainText('fps')
  await shot(page, 'performance-panel')
})

// ── 16: baseline vs Concept A comparison (same state, both modes) ────────────────
test('baseline vs Concept A comparison', async ({ page }) => {
  await seed(page, 'released')
  await openLot(page)
  await review(page, 'baseline')
  await shot(page, 'comparison-baseline')
  await review(page, 'concept-a')
  await shot(page, 'comparison-concept-a')
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
    await page.waitForTimeout(800) // Phaser boots + builds identity on first Concept-A apply
    expect(await page.locator('canvas').count()).toBe(1)
    await page.getByTestId('lot-return-dashboard').click()
    await expect(page.getByTestId('dash-week')).toBeVisible()
    await page.waitForTimeout(300)
    expect(await page.locator('canvas').count()).toBe(0) // scene (and all identity objects) destroyed
  }
  expect(errors, errors.join('\n')).toEqual([])
})
