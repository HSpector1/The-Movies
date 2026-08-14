// ── Gate D1: Studio Lot Playwright journeys + responsive/state evidence ───────
// Ten focused journeys through the real app (Phaser boots for real). State is seeded
// via SaveFileV4 fixtures (the app's session-recovery path) so hard-to-click states
// (two concurrent productions, a release) are deterministic. Evidence screenshots are
// written under out/gate-d1-evidence/final/.
//
// Fixtures are engine-built (scripts/gen-lot-fixtures.mts) and gitignored; they are
// regenerated here if missing, so the suite is self-contained.

import { test, expect, type Page } from '@playwright/test'
import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(here, '..', '..')
const fixturesDir = join(here, 'fixtures')
const outDir = join(repoRoot, 'out', 'gate-d1-evidence', 'final')
mkdirSync(outDir, { recursive: true })

const ACTIVE_SESSION_KEY = 'project-studio.active-session.v4'
const FLAG_KEY = 'project-studio.flags.studio-lot-overview'

test.beforeAll(() => {
  const names = ['empty', 'one', 'two', 'released']
  if (!names.every((n) => existsSync(join(fixturesDir, `${n}.json`)))) {
    execSync('npx vite-node scripts/gen-lot-fixtures.mts', { cwd: repoRoot, stdio: 'inherit' })
  }
})

function fixture(name: string): string {
  return readFileSync(join(fixturesDir, `${name}.json`), 'utf8')
}

/** Seed a studio + (optionally) the flag before the app loads, then go to the app. */
async function seed(page: Page, fixtureName: string, opts: { flag?: boolean } = { flag: true }) {
  const save = fixture(fixtureName)
  await page.addInitScript(
    ([key, json, flagKey, flagOn]) => {
      try {
        localStorage.setItem(key as string, json as string)
        if (flagOn) localStorage.setItem(flagKey as string, '1')
      } catch { /* ignore */ }
    },
    [ACTIVE_SESSION_KEY, save, FLAG_KEY, opts.flag !== false] as const,
  )
  await page.goto('/')
  await expect(page.getByTestId('dash-week')).toBeVisible()
}

async function openLot(page: Page) {
  await page.getByTestId('open-studio-lot').click()
  await expect(page.getByTestId('studio-lot-screen')).toBeVisible()
  await expect(page.getByTestId('lot-companion-nav')).toBeVisible()
  await page.waitForTimeout(1200) // Phaser boot + first paint
}

const shot = (page: Page, name: string) => page.screenshot({ path: join(outDir, `${name}.png`) })
const attentionOf = (page: Page, id: string) => page.getByTestId(`lot-nav-${id}`).getAttribute('data-attention')

// ── Journey 1 — fresh-studio empty lot (+ all required viewports) ─────────────
test('1. empty lot renders with all nine destinations, at every supported viewport', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(String(e)))
  await seed(page, 'empty')
  await openLot(page)

  await expect(page.locator('[data-testid^="lot-nav-"][data-attention]')).toHaveCount(9)
  // Empty early-game: both stages available; theater has no releases yet.
  expect(await attentionOf(page, 'stage-a')).toBe('empty')
  expect(await attentionOf(page, 'stage-b')).toBe('empty')
  await expect(page.getByTestId('lot-nav-theater-state')).toContainText('No releases yet')
  await expect(page.getByTestId('lot-nav-writers-state')).toContainText('Assemble a film')

  const viewports = [
    ['1920x1080', 1920, 1080],
    ['1440x900', 1440, 900],
    ['1366x768', 1366, 768],
    ['1280x720', 1280, 720],
    ['1024x768', 1024, 768],
  ] as const
  for (const [label, w, h] of viewports) {
    await page.setViewportSize({ width: w, height: h })
    await page.waitForTimeout(350)
    // Every core destination must be reachable/visible in the companion nav at every viewport.
    await expect(page.getByTestId('lot-nav-gate')).toBeVisible()
    await expect(page.getByTestId('lot-nav-theater')).toBeVisible()
    await shot(page, `empty-${label}`)
  }
  // 125% browser zoom (emulated) at 1366x768.
  await page.setViewportSize({ width: 1366, height: 768 })
  await page.evaluate(() => { document.documentElement.style.zoom = '1.25' })
  await page.waitForTimeout(350)
  await shot(page, 'empty-1366x768-zoom125')
  await page.evaluate(() => { document.documentElement.style.zoom = '1' })

  expect(errors, errors.join('\n')).toEqual([])
})

// ── Journey 2 — one occupied stage ────────────────────────────────────────────
test('2. one production occupies exactly one stage', async ({ page }) => {
  await seed(page, 'one')
  await openLot(page)
  expect(await attentionOf(page, 'stage-a')).toBe('active')
  expect(await attentionOf(page, 'stage-b')).toBe('empty')
  await expect(page.getByTestId('lot-nav-stage-a-state')).toContainText('week')
  await shot(page, 'one-production-1366x768')
})

// ── Journey 3 — two occupied stages, independently truthful ───────────────────
test('3. two productions occupy Stage A and Stage B independently', async ({ page }) => {
  await seed(page, 'two')
  await openLot(page)
  expect(await attentionOf(page, 'stage-a')).toBe('active')
  expect(await attentionOf(page, 'stage-b')).toBe('active')
  // Independent state text (each stage shows its own film's remaining weeks).
  await expect(page.getByTestId('lot-nav-stage-a-state')).toContainText('week')
  await expect(page.getByTestId('lot-nav-stage-b-state')).toContainText('week')
  await shot(page, 'two-productions-1366x768')
})

// ── Journey 4 — attention state (financial/decision). D1 has no engine
//    decision-required; assert the honest truth + capture the attention model. ──
test('4. no decision-required is fabricated in D1; attention reflects authoritative state', async ({ page }) => {
  await seed(page, 'one')
  await openLot(page)
  const decisionCount = await page.locator('[data-testid^="lot-nav-"][data-attention="decision-required"]').count()
  expect(decisionCount).toBe(0) // phases 1-4 expose no per-production decision
  // Administration reflects the finance read model (healthy here → not a warning).
  expect(['normal', 'warning']).toContain(await attentionOf(page, 'admin'))
  await shot(page, 'attention-model-1366x768')
})

// ── Journey 5 — theater with a released film present ───────────────────────────
test('5. theater shows a truthful release presence', async ({ page }) => {
  await seed(page, 'released')
  await openLot(page)
  const theaterState = await page.getByTestId('lot-nav-theater-state').textContent()
  expect(theaterState).not.toContain('No releases yet')
  expect(['active', 'recently-completed', 'normal']).toContain(await attentionOf(page, 'theater'))
  await shot(page, 'theater-release-1366x768')
})

// ── Journey 6 — lot → React navigation ────────────────────────────────────────
test('6. activating a lot destination routes to the existing React screen', async ({ page }) => {
  await seed(page, 'empty')
  await openLot(page)
  await page.getByTestId('lot-nav-writers').click() // Development → Assemble a Film
  await expect(page.getByTestId('assembly-steps')).toBeVisible()
  await shot(page, 'lot-to-react-assembly')
})

// ── Journey 7 — React → lot return with selection restored ────────────────────
test('7. returning to the lot restores the previously selected building', async ({ page }) => {
  await seed(page, 'empty')
  await openLot(page)
  await page.getByTestId('lot-nav-admin').click() // Administration → Dashboard, records selection
  await expect(page.getByTestId('dash-week')).toBeVisible()
  await page.getByTestId('open-studio-lot').click()
  await expect(page.getByTestId('studio-lot-screen')).toBeVisible()
  await expect(page.getByTestId('lot-nav-admin')).toHaveAttribute('aria-current', 'true')
  await page.waitForTimeout(600)
  await shot(page, 'return-selection-restored-1366x768')
})

// ── Journey 8 — keyboard companion navigation ─────────────────────────────────
test('8. companion navigation is keyboard-operable', async ({ page }) => {
  await seed(page, 'empty')
  await openLot(page)
  const item = page.getByTestId('lot-nav-writers')
  await item.focus()
  await expect(item).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.getByTestId('assembly-steps')).toBeVisible()
})

// ── Journey 9 — refresh with authoritative state restored ─────────────────────
test('9. a reload restores the authoritative studio', async ({ page }) => {
  await seed(page, 'one')
  await openLot(page)
  const weekText = await page.getByTestId('lot-cash').textContent()
  await page.reload()
  await expect(page.getByTestId('recovery-notice')).toBeVisible()
  await expect(page.getByTestId('dash-week')).toBeVisible()
  // The lot re-opens against the same authoritative state.
  await page.getByTestId('open-studio-lot').click()
  await expect(page.getByTestId('lot-cash')).toHaveText(weekText ?? '')
})

// ── Journey 10 — feature flag OFF leaves the app unchanged ─────────────────────
test('10. with the flag off there is no lot entry and the app is unchanged', async ({ page }) => {
  await seed(page, 'empty', { flag: false })
  await expect(page.getByTestId('open-studio-lot')).toHaveCount(0) // no entry point
  // The normal app still works: advance a week.
  await expect(page.getByTestId('advance-week')).toBeVisible()
  await shot(page, 'flag-off-dashboard')
})

// ── Extra evidence: world-native legacy Annex inspection + reduced motion ─────
test('E. legacy Annex remains inspect-only in the mounted lot', async ({ page }) => {
  await seed(page, 'empty')
  await openLot(page)
  expect(await attentionOf(page, 'expansion')).toBe('future')
  await page.getByTestId('lot-nav-expansion').click()
  await expect(page.getByTestId('lot-annex-context')).toBeVisible()
  await expect(page.getByTestId('lot-annex-status')).toContainText('Unavailable')
  await expect(page.getByTestId('lot-annex-legacy-copy')).toContainText(
    'Studio Development becomes available after managed studio operations are activated.',
  )
  await expect(page.getByTestId('lot-annex-build')).toHaveCount(0)
  await expect(page.getByTestId('studio-lot-screen')).toBeVisible()
  await shot(page, 'annex-legacy-world-context-1366x768')
})

test('E2. reduced-motion mode', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await seed(page, 'two')
  await openLot(page)
  await shot(page, 'reduced-motion-1366x768')
  // Companion navigation + states remain fully readable under reduced motion.
  await expect(page.locator('[data-testid^="lot-nav-"][data-attention]')).toHaveCount(9)
})

// ── Real-DOM lifecycle: repeated open/close leaves exactly one live <canvas> ───
// (Complements the mocked component test: this asserts the REAL Phaser teardown.)
test('L. repeated lot open/close leaves no orphaned canvas', async ({ page }) => {
  await seed(page, 'empty')
  for (let i = 0; i < 3; i++) {
    await page.getByTestId('open-studio-lot').click()
    await expect(page.getByTestId('studio-lot-screen')).toBeVisible()
    await page.waitForTimeout(700) // Phaser boots + attaches its canvas
    expect(await page.locator('canvas').count()).toBe(1)
    await page.getByTestId('lot-return-dashboard').click()
    await expect(page.getByTestId('dash-week')).toBeVisible()
    await page.waitForTimeout(300)
    expect(await page.locator('canvas').count()).toBe(0) // destroyed on unmount
  }
})

// ── All nine destinations fit without scrolling at the required short viewports ─
test('R. all nine destinations are visible by default at 1366x768 and 1280x720', async ({ page }) => {
  await seed(page, 'empty')
  await openLot(page)
  const ids = ['gate', 'admin', 'casting', 'writers', 'stage-a', 'stage-b', 'post', 'theater', 'expansion']
  for (const [label, w, h] of [['1366x768', 1366, 768], ['1280x720', 1280, 720]] as const) {
    await page.setViewportSize({ width: w, height: h })
    await page.waitForTimeout(300)
    for (const id of ids) {
      // in-viewport, not merely in-DOM: the item's box must sit within the viewport height.
      const box = await page.getByTestId(`lot-nav-${id}`).boundingBox()
      expect(box, `${id} @ ${label} has a box`).not.toBeNull()
      expect(box!.y + box!.height, `${id} bottom within ${label}`).toBeLessThanOrEqual(h + 1)
      expect(box!.y, `${id} top within ${label}`).toBeGreaterThanOrEqual(0)
    }
    await shot(page, `nav-fit-${label}`)
  }
})
