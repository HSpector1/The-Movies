// ── Concept A ORDINARY-PLAYER enablement — player-clean evidence ──────────────────
// Owner ruling: Concept A is the default player-facing identity, and the development review
// tooling is a SEPARATE default-OFF capability. These captures boot the REAL app as an ordinary
// player would experience it: ONLY the lot-overview flag is set (so the lot is reachable) — the
// identity-proof/review flag is deliberately NOT set, so Concept A must appear via the player
// default with NO review chrome. Real Phaser, seeded SaveFileV4 fixtures (authoritative state).
// Screenshots land in out/player-enablement-evidence/.

import { test, expect, type Page } from '@playwright/test'
import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(here, '..', '..')
const fixturesDir = join(here, 'fixtures')
const outDir = join(repoRoot, 'out', 'player-enablement-evidence')
mkdirSync(outDir, { recursive: true })

const ACTIVE_SESSION_KEY = 'project-studio.active-session.v4'
const OVERVIEW_FLAG = 'project-studio.flags.studio-lot-overview'
const IDENTITY_PROOF_FLAG = 'project-studio.flags.studio-lot-identity-proof' // dev review (default OFF)
const IDENTITY_PLAYER_KEY = 'project-studio.flags.studio-lot-identity' // player rollback ('0' = baseline)

test.beforeAll(() => {
  const names = ['empty', 'one', 'two', 'released', 'warn']
  if (!names.every((n) => existsSync(join(fixturesDir, `${n}.json`)))) {
    execSync('npx vite-node scripts/gen-lot-fixtures.mts', { cwd: repoRoot, stdio: 'inherit' })
  }
})

const fixture = (name: string) => readFileSync(join(fixturesDir, `${name}.json`), 'utf8')

/** Ordinary player: sets ONLY the overview flag (lot reachable). Never sets the proof flag unless
 *  `devReview` is explicitly requested. `rollback` sets the player identity rollback ('0'=baseline). */
async function seedPlayer(page: Page, fixtureName: string, opts: { rollback?: boolean; devReview?: boolean } = {}) {
  const save = fixture(fixtureName)
  await page.addInitScript(
    ([sessionKey, json, overviewFlag, proofFlag, playerKey, rollback, devReview]) => {
      try {
        localStorage.setItem(sessionKey as string, json as string)
        localStorage.setItem(overviewFlag as string, '1')
        if (devReview) localStorage.setItem(proofFlag as string, '1')
        else localStorage.removeItem(proofFlag as string)
        if (rollback) localStorage.setItem(playerKey as string, '0')
        else localStorage.removeItem(playerKey as string)
      } catch { /* ignore */ }
    },
    [ACTIVE_SESSION_KEY, save, OVERVIEW_FLAG, IDENTITY_PROOF_FLAG, IDENTITY_PLAYER_KEY, !!opts.rollback, !!opts.devReview] as const,
  )
  await page.goto('/')
  await expect(page.getByTestId('dash-week')).toBeVisible()
}

/** Open the lot and assert it is player-clean: NO development chrome of any kind. */
async function openLotClean(page: Page) {
  await page.getByTestId('open-studio-lot').click()
  await expect(page.getByTestId('studio-lot-screen')).toBeVisible()
  await expect(page.getByTestId('lot-review-mode')).toHaveCount(0)
  await expect(page.getByTestId('lot-perf-panel')).toHaveCount(0)
  await expect(page.getByTestId('lot-review-hide')).toHaveCount(0)
  await expect(page.getByTestId('lot-review-show')).toHaveCount(0)
  await page.waitForTimeout(1300)
}

const shot = (page: Page, name: string) => page.screenshot({ path: join(outDir, `${name}.png`) })

test('quiet studio — player-clean Concept A across required viewports (01-04)', async ({ page }) => {
  await seedPlayer(page, 'empty')
  await openLotClean(page)
  for (const [label, w, h, zoom] of [
    ['01-quiet-1920x1080', 1920, 1080, 1],
    ['02-quiet-1366x768', 1366, 768, 1],
    ['03-quiet-1280x720', 1280, 720, 1],
    ['04-quiet-zoom125', 1366, 768, 1.25],
  ] as const) {
    await page.setViewportSize({ width: w, height: h })
    await page.evaluate((z) => { document.documentElement.style.zoom = String(z) }, zoom)
    await page.waitForTimeout(450)
    await shot(page, label)
  }
  await page.evaluate(() => { document.documentElement.style.zoom = '1' })
})

test('05 one active production (Stage A busy, Stage B idle) — player-clean', async ({ page }) => {
  await seedPlayer(page, 'one')
  await openLotClean(page)
  await shot(page, '05-one-production')
})

test('06 two active productions — player-clean', async ({ page }) => {
  await seedPlayer(page, 'two')
  await openLotClean(page)
  await shot(page, '06-two-productions')
})

test('07 theater release — player-clean', async ({ page }) => {
  await seedPlayer(page, 'released')
  await openLotClean(page)
  await shot(page, '07-theater-release')
})

test('08 warning / attention — player-clean', async ({ page }) => {
  await seedPlayer(page, 'warn')
  await openLotClean(page)
  expect(await page.getByTestId('lot-nav-admin').getAttribute('data-attention')).toBe('warning')
  await shot(page, '08-warning')
})

test('09 selected building — player-clean', async ({ page }) => {
  await seedPlayer(page, 'released')
  await openLotClean(page)
  await page.getByTestId('lot-nav-gate').click() // records selection + routes to dashboard
  await expect(page.getByTestId('dash-week')).toBeVisible()
  await page.getByTestId('open-studio-lot').click() // reopen; selection restored
  await expect(page.getByTestId('studio-lot-screen')).toBeVisible()
  await expect(page.getByTestId('lot-nav-gate')).toHaveAttribute('aria-current', 'true')
  await expect(page.getByTestId('lot-review-mode')).toHaveCount(0) // still player-clean
  await page.waitForTimeout(600)
  await shot(page, '09-selected-building')
})

test('10 reduced motion (OS preference) — player-clean', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await seedPlayer(page, 'two')
  await openLotClean(page)
  await expect(page.getByTestId('studio-lot-screen')).toHaveClass(/lot-reduced-motion/)
  await shot(page, '10-reduced-motion')
})

test('11 identity-render fallback — base lot + all nine destinations survive', async ({ page }) => {
  // A player cannot manually trigger a render failure, so the fault is induced via the dev review
  // 'fallback' mode; the captured OUTCOME (base lot + full companion nav, nothing stranded) is
  // exactly what a player sees if Concept A fails to draw. Overlay hidden for the clean view.
  await seedPlayer(page, 'released', { devReview: true })
  await page.getByTestId('open-studio-lot').click()
  await expect(page.getByTestId('lot-review-mode')).toBeVisible()
  await page.getByTestId('lot-review-fallback').click()
  await page.waitForTimeout(500)
  await expect(page.locator('[data-testid^="lot-nav-"][data-attention]')).toHaveCount(9)
  await page.getByTestId('lot-review-hide').click()
  await page.waitForTimeout(350)
  await shot(page, '11-fallback')
})

test('12 explicit player-identity rollback → baseline, no dev chrome', async ({ page }) => {
  await seedPlayer(page, 'released', { rollback: true })
  await openLotClean(page)
  await shot(page, '12-rollback-baseline')
})

test('13 development-review flag ON — review controls available only in dev mode', async ({ page }) => {
  await seedPlayer(page, 'two', { devReview: true })
  await page.getByTestId('open-studio-lot').click()
  await expect(page.getByTestId('studio-lot-screen')).toBeVisible()
  await expect(page.getByTestId('lot-review-mode')).toBeVisible() // dev tooling present
  await expect(page.getByTestId('lot-perf-panel')).toContainText('fps')
  await page.waitForTimeout(600)
  await shot(page, '13-dev-review-on')
})

test('14 development-review flag OFF again — clean Concept A restored for the player', async ({ page }) => {
  await seedPlayer(page, 'two') // proof flag not set → player path
  await openLotClean(page)
  await shot(page, '14-dev-review-off-clean')
})
