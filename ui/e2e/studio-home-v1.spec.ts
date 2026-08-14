// ── Studio Home V1: actual-browser adoption and return-context proof ───────────
//
// This suite proves both ordinary player entry paths: a fresh studio founded through the
// browser and a founded active-session recovery. Both must choose the world-first home,
// then preserve authoritative state through real lazy React + Phaser supporting routes.

import { expect, test, type Page } from '@playwright/test'
import { execSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(here, '..', '..')
const fixturePath = join(here, 'fixtures', 'empty.json')

const ACTIVE_SESSION_KEY = 'project-studio.active-session.v4'
const ACTIVE_SESSION_CORRUPT_KEY = 'project-studio.active-session.v4.corrupt'
const STUDIO_LOT_OVERVIEW_FLAG = 'project-studio.flags.studio-lot-overview'
const OPERATION_HOLLYWOOD_FLAG = 'project-studio.flags.operation-hollywood'

type SeedOptions = {
  overviewRollback?: boolean
  hollywoodRollback?: boolean
  observeDashboard?: boolean
}

test.beforeAll(() => {
  if (!existsSync(fixturePath)) {
    execSync('npx vite-node scripts/gen-lot-fixtures.mts', {
      cwd: repoRoot,
      stdio: 'inherit',
    })
  }
})

test.describe.configure({ timeout: 90_000 })

function foundedSave(): string {
  return readFileSync(fixturePath, 'utf8')
}

async function seedFoundedRecovery(page: Page, options: SeedOptions = {}) {
  await page.addInitScript(
    ({
      sessionKey,
      corruptKey,
      save,
      overviewKey,
      hollywoodKey,
      overviewRollback,
      hollywoodRollback,
      observeDashboard,
    }) => {
      localStorage.setItem(sessionKey, save)
      localStorage.removeItem(corruptKey)

      // Absence is the important ordinary-player case. Neither adopted feature needs a
      // positive `1`; these keys exist only when this test asks for an explicit rollback.
      localStorage.removeItem(overviewKey)
      localStorage.removeItem(hollywoodKey)
      if (overviewRollback) localStorage.setItem(overviewKey, '0')
      if (hollywoodRollback) localStorage.setItem(hollywoodKey, '0')

      if (observeDashboard) {
        const probedWindow = window as typeof window & {
          __studioHomeDashboardSeen?: boolean
        }
        probedWindow.__studioHomeDashboardSeen = false
        const recordDashboard = () => {
          if (document.querySelector('[data-testid="dash-week"]')) {
            probedWindow.__studioHomeDashboardSeen = true
          }
        }
        const startObserver = () => {
          if (!document.documentElement) {
            // Yield to HTML parsing. A recursive microtask here can starve creation of the
            // documentElement itself when this init script runs at the earliest Chromium hook.
            setTimeout(startObserver, 0)
            return
          }
          recordDashboard()
          new MutationObserver(recordDashboard).observe(document.documentElement, {
            childList: true,
            subtree: true,
          })
        }
        startObserver()
      }
    },
    {
      sessionKey: ACTIVE_SESSION_KEY,
      corruptKey: ACTIVE_SESSION_CORRUPT_KEY,
      save: foundedSave(),
      overviewKey: STUDIO_LOT_OVERVIEW_FLAG,
      hollywoodKey: OPERATION_HOLLYWOOD_FLAG,
      overviewRollback: options.overviewRollback === true,
      hollywoodRollback: options.hollywoodRollback === true,
      observeDashboard: options.observeDashboard === true,
    },
  )
}

function watchRuntime(page: Page) {
  const pageErrors: string[] = []
  const consoleErrors: string[] = []
  page.on('pageerror', (error) => pageErrors.push(String(error)))
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })
  return { pageErrors, consoleErrors }
}

async function expectLotReady(page: Page) {
  await expect(page.getByTestId('studio-lot-screen')).toBeVisible()
  await expect(page.getByTestId('lot-companion-nav')).toBeVisible()
  await expect(page.getByTestId('studio-lot-canvas').locator('canvas')).toHaveCount(1)
  await expect(page.locator('canvas')).toHaveCount(1)
  await expect(page.getByTestId('dev-error')).toHaveCount(0)
}

async function activeSessionBytes(page: Page): Promise<string> {
  const value = await page.evaluate(
    (key) => localStorage.getItem(key),
    ACTIVE_SESSION_KEY,
  )
  expect(value, 'a founded studio must retain its authoritative active-session save').not.toBeNull()
  return value!
}

test('fresh Founding lands in Hollywood, commissions through its Writers Room, and restores the world object', async ({ page }) => {
  const runtime = watchRuntime(page)

  // Observe paints without touching any game state or feature-flag storage. A clean browser
  // context is the ordinary-player default; successful Founding must not detour through the
  // supporting Dashboard before making the Lot playable.
  await page.addInitScript(() => {
    const probedWindow = window as typeof window & {
      __freshFoundingDashboardSeen?: boolean
    }
    probedWindow.__freshFoundingDashboardSeen = false
    const recordDashboard = () => {
      if (document.querySelector('[data-testid="dash-week"]')) {
        probedWindow.__freshFoundingDashboardSeen = true
      }
    }
    const startObserver = () => {
      if (!document.documentElement) {
        setTimeout(startObserver, 0)
        return
      }
      recordDashboard()
      new MutationObserver(recordDashboard).observe(document.documentElement, {
        childList: true,
        subtree: true,
      })
    }
    startObserver()
  })

  await page.goto('/')
  await expect(page.getByTestId('new-game')).toBeVisible()
  await page.getByTestId('seed-input').fill('studio-home-fresh-founding')
  await page.getByTestId('new-game').click()
  await expect(page.getByTestId('found-studio')).toBeVisible()

  for (const [role, count] of [
    ['actor', 3],
    ['director', 1],
    ['writer', 1],
    ['craft', 1],
  ] as Array<[string, number]>) {
    await page.getByTestId(`founding-tab-${role}`).click()
    const group = page.getByTestId(`founding-group-${role}`)
    for (let signed = 0; signed < count; signed += 1) {
      await group.locator('button[data-testid^="founding-sign-"]').first().click()
    }
  }

  const found = page.getByTestId('found-studio')
  await expect(found).toBeEnabled()
  await found.click()

  const stableUrl = page.url()
  await expectLotReady(page)
  await expect(page.getByTestId('studio-lot-screen')).toHaveClass(/\blot-hollywood\b/)
  await expect(page.getByTestId('lot-studio-heading')).toBeFocused()
  await expect(page.getByTestId('dash-week')).toHaveCount(0)
  expect(await page.evaluate(
    ([overviewKey, hollywoodKey]) => [
      localStorage.getItem(overviewKey),
      localStorage.getItem(hollywoodKey),
    ],
    [STUDIO_LOT_OVERVIEW_FLAG, OPERATION_HOLLYWOOD_FLAG] as const,
  )).toEqual([null, null])
  expect(await page.evaluate(
    () => (window as typeof window & { __freshFoundingDashboardSeen?: boolean })
      .__freshFoundingDashboardSeen,
  )).toBe(false)

  // Enter Development from its physical world object. Current Founding is managed, so this
  // must open the real Writers Room rather than the migrated direct-assembly compatibility path.
  const writersBuilding = page.getByTestId('lot-nav-writers')
  await writersBuilding.focus()
  await writersBuilding.press('Enter')
  await expect(page.getByTestId('writers-room')).toBeVisible()
  await expect(page.getByTestId('writers-room-legacy')).toHaveCount(0)
  await expect(page.getByTestId('assembly-steps')).toHaveCount(0)
  await expect(page.getByTestId('script-capacity-summary')).toHaveText(
    '0 of 2 slots occupied · 2 available',
  )

  const beforeCommissionBytes = await activeSessionBytes(page)
  await page.getByTestId('commission-open').click()
  await expect(page.getByTestId('commission-panel')).toBeVisible()
  await expect(page.getByTestId('commission-submit')).toBeEnabled()
  await page.getByTestId('commission-submit').click()
  await expect(page.locator('[data-testid^="script-card-"]')).toHaveCount(1)
  await expect(page.getByTestId('script-capacity-summary')).toHaveText(
    '1 of 2 slots occupied · 1 available',
  )
  await expect.poll(() => activeSessionBytes(page)).not.toBe(beforeCommissionBytes)

  const commissionedBytes = await activeSessionBytes(page)
  const commissioned = JSON.parse(commissionedBytes) as {
    seed: string
    state: {
      market: { tick: number }
      scriptDevelopment: { mode: string; projects: unknown[] }
    }
  }
  expect(commissioned.seed).toBe('studio-home-fresh-founding')
  expect(commissioned.state.market.tick).toBe(0)
  expect(commissioned.state.scriptDevelopment.mode).toBe('managed')
  expect(commissioned.state.scriptDevelopment.projects).toHaveLength(1)

  // Back restores the exact originating world object as selected and focused. Navigation
  // remounts the renderer by design, while URL and authoritative save remain unchanged.
  await page.getByTestId('writers-room-back').click()
  await expectLotReady(page)
  await expect(page.getByTestId('lot-nav-writers')).toHaveAttribute('aria-current', 'true')
  await expect(page.getByTestId('lot-nav-writers')).toBeFocused()
  expect(page.url()).toBe(stableUrl)
  expect(await activeSessionBytes(page)).toBe(commissionedBytes)
  expect(await page.evaluate(
    () => (window as typeof window & { __freshFoundingDashboardSeen?: boolean })
      .__freshFoundingDashboardSeen,
  )).toBe(false)
  expect(runtime.pageErrors, runtime.pageErrors.join('\n')).toEqual([])
  expect(runtime.consoleErrors, runtime.consoleErrors.join('\n')).toEqual([])
})

test('default founded recovery opens the Hollywood Lot first and preserves truth through world/panel returns', async ({ page }) => {
  const runtime = watchRuntime(page)
  const lotModuleRequests: string[] = []
  page.on('request', (request) => {
    if (/\/src\/lot\/StudioLotScreen\.tsx$/.test(new URL(request.url()).pathname)) {
      lotModuleRequests.push(request.url())
    }
  })
  await seedFoundedRecovery(page, { observeDashboard: true })

  await page.goto('/')
  const stableUrl = page.url()
  await expectLotReady(page)

  // Clean/default means no positive feature overrides. The adopted gates alone choose the
  // primary world and its Hollywood presentation.
  await expect(page.getByTestId('recovery-notice')).toContainText('Recovered your studio from Week 0.')
  await expect(page.getByTestId('studio-lot-screen')).toHaveClass(/\blot-hollywood\b/)
  await expect(page.getByTestId('hollywood-production-idle')).toBeVisible()
  await expect(page.getByTestId('dash-week')).toHaveCount(0)
  expect(await page.evaluate(
    ([overviewKey, hollywoodKey]) => [
      localStorage.getItem(overviewKey),
      localStorage.getItem(hollywoodKey),
    ],
    [STUDIO_LOT_OVERVIEW_FLAG, OPERATION_HOLLYWOOD_FLAG] as const,
  )).toEqual([null, null])
  expect(await page.evaluate(
    () => (window as typeof window & { __studioHomeDashboardSeen?: boolean })
      .__studioHomeDashboardSeen,
  )).toBe(false)
  expect(lotModuleRequests.length, 'the adopted Studio Home should fetch its lazy Lot screen').toBeGreaterThan(0)

  // The Lot owns one semantic H1 and canonical Studio Home entry moves focus there.
  const homeHeading = page.getByRole('heading', { level: 1, name: 'PROJECT: STUDIO' })
  await expect(homeHeading).toHaveCount(1)
  await expect(page.getByTestId('lot-studio-heading')).toBeFocused()

  const baselineBytes = await activeSessionBytes(page)

  // The global Lot affordance opens the supporting Dashboard; its exact Back action returns
  // to the same live-world home context (a deliberate Phaser remount, never a URL route).
  await expect(page.getByTestId('lot-return-dashboard')).toHaveAccessibleName('Open Dashboard')
  await page.getByTestId('lot-return-dashboard').click()
  await expect(page.getByTestId('dash-week')).toBeVisible()
  await expect(page.getByTestId('back-to-studio-lot')).toHaveAccessibleName('Back to Studio Lot')
  await expect(page.getByTestId('open-studio-lot')).toHaveCount(0)
  expect(page.url()).toBe(stableUrl)
  expect(await activeSessionBytes(page)).toBe(baselineBytes)

  await page.getByTestId('back-to-studio-lot').click()
  await expectLotReady(page)
  await expect(page.getByTestId('lot-studio-heading')).toBeFocused()
  expect(page.url()).toBe(stableUrl)
  expect(await activeSessionBytes(page)).toBe(baselineBytes)

  // A building-origin deep route remembers the exact world object. Returning from the
  // Assembly surface restores both its selection and keyboard focus in the companion view.
  const writersBuilding = page.getByTestId('lot-nav-writers')
  await writersBuilding.focus()
  await expect(writersBuilding).toBeFocused()
  await writersBuilding.press('Enter')
  await expect(page.getByTestId('assembly-steps')).toBeVisible()
  expect(page.url()).toBe(stableUrl)
  expect(await activeSessionBytes(page)).toBe(baselineBytes)
  await page.getByTestId('assembly-back-dashboard').click()
  await expectLotReady(page)
  await expect(page.getByTestId('lot-nav-writers')).toHaveAttribute('aria-current', 'true')
  await expect(page.getByTestId('lot-nav-writers')).toBeFocused()
  expect(await activeSessionBytes(page)).toBe(baselineBytes)

  // Deep Dashboard children inherit the same Lot root. For this unchanged fixture, the save
  // exported there must match the autosave captured before navigation byte-for-byte.
  await page.getByTestId('lot-return-dashboard').click()
  await page.getByTestId('open-saves').click()
  await expect(page.getByTestId('export-text')).toBeVisible()
  expect(await page.getByTestId('export-text').inputValue()).toBe(baselineBytes)
  await page.getByTestId('saves-back').click()
  await expectLotReady(page)
  await expect(page.getByTestId('lot-studio-heading')).toBeFocused()

  // Exercise multiple ordinary Lot ↔ Dashboard cycles. Each return owns exactly one live
  // Phaser canvas; no router state or authoritative save byte changes accumulate.
  for (let cycle = 0; cycle < 3; cycle += 1) {
    await page.getByTestId('lot-return-dashboard').click()
    await expect(page.getByTestId('dash-week')).toBeVisible()
    await page.getByTestId('back-to-studio-lot').click()
    await expectLotReady(page)
    expect(page.url()).toBe(stableUrl)
    expect(await activeSessionBytes(page)).toBe(baselineBytes)
  }

  expect(runtime.pageErrors, runtime.pageErrors.join('\n')).toEqual([])
  expect(runtime.consoleErrors, runtime.consoleErrors.join('\n')).toEqual([])
})

test('supporting-Dashboard no-release Advance returns to the Lot and focuses the world control', async ({ page }) => {
  const runtime = watchRuntime(page)
  await seedFoundedRecovery(page)
  await page.goto('/')
  const stableUrl = page.url()
  await expectLotReady(page)

  const before = JSON.parse(await activeSessionBytes(page)) as {
    seed: string
    state: { market: { tick: number } }
  }
  await page.getByTestId('lot-return-dashboard').click()
  await expect(page.getByTestId('dash-week')).toHaveText(String(before.state.market.tick))
  await page.getByTestId('advance-week').click()

  await expectLotReady(page)
  await expect(page.getByTestId('lot-advance-week')).toBeFocused()
  await expect(page.getByTestId('lot-week-update-announcement')).toHaveText(
    `Week ${before.state.market.tick + 1}. Studio Lot updated.`,
  )
  const after = JSON.parse(await activeSessionBytes(page)) as {
    seed: string
    state: { market: { tick: number } }
  }
  expect(after.seed).toBe(before.seed)
  expect(after.state.market.tick).toBe(before.state.market.tick + 1)
  expect(page.url()).toBe(stableUrl)
  expect(runtime.pageErrors, runtime.pageErrors.join('\n')).toEqual([])
  expect(runtime.consoleErrors, runtime.consoleErrors.join('\n')).toEqual([])
})

test('overview rollback keeps the Dashboard root and never requests the lazy Lot screen', async ({ page }) => {
  const runtime = watchRuntime(page)
  const lotModuleRequests: string[] = []
  page.on('request', (request) => {
    if (/\/src\/lot\/StudioLotScreen\.tsx$/.test(new URL(request.url()).pathname)) {
      lotModuleRequests.push(request.url())
    }
  })
  await seedFoundedRecovery(page, { overviewRollback: true })
  await page.goto('/')

  await expect(page.getByTestId('recovery-notice')).toContainText('Recovered your studio from Week 0.')
  await expect(page.getByTestId('dash-week')).toHaveText('0')
  await expect(page.getByTestId('studio-lot-screen')).toHaveCount(0)
  await expect(page.getByTestId('studio-lot-lazy-loading')).toHaveCount(0)
  await expect(page.getByTestId('open-studio-lot')).toHaveCount(0)
  await expect(page.getByTestId('back-to-studio-lot')).toHaveCount(0)
  await expect(page.locator('canvas')).toHaveCount(0)
  expect(lotModuleRequests).toEqual([])
  expect(await page.evaluate(
    (key) => localStorage.getItem(key),
    STUDIO_LOT_OVERVIEW_FLAG,
  )).toBe('0')
  expect(runtime.pageErrors, runtime.pageErrors.join('\n')).toEqual([])
  expect(runtime.consoleErrors, runtime.consoleErrors.join('\n')).toEqual([])
})

test('Hollywood rollback keeps the Studio Lot as home with the legacy presentation', async ({ page }) => {
  const runtime = watchRuntime(page)
  await seedFoundedRecovery(page, { hollywoodRollback: true })
  await page.goto('/')

  await expectLotReady(page)
  await expect(page.getByTestId('recovery-notice')).toContainText('Recovered your studio from Week 0.')
  await expect(page.getByTestId('studio-lot-screen')).not.toHaveClass(/\blot-hollywood\b/)
  await expect(page.getByTestId('hollywood-current-production')).toHaveCount(0)
  await expect(page.getByTestId('hollywood-production-idle')).toHaveCount(0)
  await expect(page.getByTestId('lot-studio-heading')).toBeFocused()
  expect(await page.evaluate(
    ([overviewKey, hollywoodKey]) => [
      localStorage.getItem(overviewKey),
      localStorage.getItem(hollywoodKey),
    ],
    [STUDIO_LOT_OVERVIEW_FLAG, OPERATION_HOLLYWOOD_FLAG] as const,
  )).toEqual([null, '0'])
  expect(runtime.pageErrors, runtime.pageErrors.join('\n')).toEqual([])
  expect(runtime.consoleErrors, runtime.consoleErrors.join('\n')).toEqual([])
})
