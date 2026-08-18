// ── Studio Home V1: actual-browser adoption and return-context proof ───────────
//
// This suite proves both ordinary player entry paths: a fresh studio founded through the
// browser and a founded active-session recovery. Both must choose the world-first home,
// then preserve authoritative state through real lazy React + Phaser supporting routes.

import { expect, test, type ElementHandle, type Page } from '@playwright/test'
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

async function foundFreshStudio(page: Page, seed: string) {
  await page.goto('/')
  await expect(page.getByTestId('new-game')).toBeVisible()
  await page.getByTestId('seed-input').fill(seed)
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
  await expectLotReady(page)
}

async function captureLotDomIdentity(page: Page) {
  const lot = await page.getByTestId('studio-lot-screen').elementHandle()
  const canvasMount = await page.getByTestId('studio-lot-canvas').elementHandle()
  const canvas = await page.getByTestId('studio-lot-canvas').locator('canvas').elementHandle()
  if (lot === null || canvasMount === null || canvas === null) {
    throw new Error('Studio Lot identity capture requires one connected Lot, mount, and canvas.')
  }
  return { lot, canvasMount, canvas }
}

async function expectCurrentNode(
  handle: ElementHandle<Node>,
  selector: string,
) {
  expect(await handle.evaluate(
    (node, currentSelector) =>
      node.isConnected && document.querySelector(currentSelector) === node,
    selector,
  )).toBe(true)
}

async function expectSameLotDomIdentity(
  identity: Awaited<ReturnType<typeof captureLotDomIdentity>>,
) {
  await expectCurrentNode(identity.lot, '[data-testid="studio-lot-screen"]')
  await expectCurrentNode(identity.canvasMount, '[data-testid="studio-lot-canvas"]')
  await expectCurrentNode(identity.canvas, '[data-testid="studio-lot-canvas"] canvas')
}

async function expectDisconnectedLotDomIdentity(
  identity: Awaited<ReturnType<typeof captureLotDomIdentity>>,
) {
  for (const handle of [identity.lot, identity.canvasMount, identity.canvas]) {
    expect(await handle.evaluate((node) => node.isConnected)).toBe(false)
  }
}

test('fresh Founding retains the exact Hollywood Lot through cancel and accepted screenplay commission', async ({ page }) => {
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

  await foundFreshStudio(page, 'studio-home-fresh-founding')
  const stableUrl = page.url()
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

  // Idle managed Development owns a retained commission form. Opening it cannot replace any
  // part of the player's world: the exact Lot root, Phaser mount, and canvas stay connected.
  const initialIdentity = await captureLotDomIdentity(page)
  const baselineBytes = await activeSessionBytes(page)
  const writersBuilding = page.getByTestId('lot-nav-writers')
  await writersBuilding.focus()
  await writersBuilding.press('Enter')
  await expect(page.getByTestId('lot-commission-workspace')).toBeVisible()
  await expect(page.getByTestId('commission-panel')).toBeVisible()
  await expect(page.getByTestId('writers-room')).toHaveCount(0)
  await expect(page.getByTestId('assembly-steps')).toHaveCount(0)
  await expect(page.getByTestId('studio-lot-screen')).toHaveJSProperty('inert', true)
  await expectSameLotDomIdentity(initialIdentity)
  expect(await activeSessionBytes(page)).toBe(baselineBytes)
  expect(await page.evaluate(() =>
    document.activeElement?.closest('[data-testid="lot-commission-workspace"]') !== null,
  )).toBe(true)

  // Explicit cancel is byte-neutral and restores the exact Development opener only after the
  // world's inert boundary has been removed. No renderer or canvas is reconstructed.
  await page.getByTestId('lot-commission-workspace-close').click()
  await expect(page.getByTestId('lot-commission-workspace')).toHaveCount(0)
  await expect(page.getByTestId('studio-lot-screen')).not.toHaveAttribute('inert', '')
  await expectSameLotDomIdentity(initialIdentity)
  await expect(page.getByTestId('lot-nav-writers')).toHaveAttribute('aria-current', 'true')
  await expect(page.getByTestId('lot-nav-writers')).toBeFocused()
  expect(await activeSessionBytes(page)).toBe(baselineBytes)

  // The retained form's deliberate deep-management escape hatch remains the canonical full
  // Writers' Room. Choosing it closes the retained owner and deliberately remounts on return.
  await page.getByTestId('lot-nav-writers').press('Enter')
  await expect(page.getByTestId('lot-commission-workspace')).toBeVisible()
  await expectSameLotDomIdentity(initialIdentity)
  await page.getByTestId('lot-commission-workspace-details').click()
  await expect(page.getByTestId('writers-room')).toBeVisible()
  await expect(page.getByTestId('writers-room-legacy')).toHaveCount(0)
  await expect(page.getByTestId('lot-commission-workspace')).toHaveCount(0)
  await expect(page.getByTestId('studio-lot-screen')).toHaveCount(0)
  await expect(page.getByTestId('studio-lot-canvas')).toHaveCount(0)
  await expectDisconnectedLotDomIdentity(initialIdentity)
  expect(await activeSessionBytes(page)).toBe(baselineBytes)

  await page.getByTestId('writers-room-back').click()
  await expectLotReady(page)
  await expect(page.getByTestId('lot-nav-writers')).toHaveAttribute('aria-current', 'true')
  await expect(page.getByTestId('lot-nav-writers')).toBeFocused()
  const commissionIdentity = await captureLotDomIdentity(page)

  // Re-enter the governed retained path. Capture the explicit form payload before submit, then
  // prove the exact Engine project, save footprint, save-before-witness ordering, and same world.
  await page.getByTestId('lot-nav-writers').press('Enter')
  await expect(page.getByTestId('lot-commission-workspace')).toBeVisible()
  await expectSameLotDomIdentity(commissionIdentity)
  const conceptSelect = page.getByTestId('script-concept')
  const writerSelect = page.getByTestId('script-writer')
  const conceptId = await conceptSelect.inputValue()
  const writerId = await writerSelect.inputValue()
  const title = (await conceptSelect.locator('option:checked').textContent())!.split(' — ')[0]!
  const writerName = (await writerSelect.locator('option:checked').textContent())!.split(' — ')[0]!
  const beforeCommissionBytes = await activeSessionBytes(page)
  const beforeCommission = JSON.parse(beforeCommissionBytes) as {
    state: {
      market: { tick: number }
      studio: { cash: number }
      rngState: string
      ledger: unknown[]
      concepts: Array<{ id: string; genre: string }>
      scriptDevelopment: { mode: string; projects: unknown[] }
    }
  }
  await page.evaluate((sessionKey) => {
    const probedWindow = window as typeof window & {
      __screenplayCommissionWitnessSave?: string | null
    }
    probedWindow.__screenplayCommissionWitnessSave = null
    const observer = new MutationObserver(() => {
      if (
        probedWindow.__screenplayCommissionWitnessSave === null &&
        document.querySelector('[data-testid="lot-screenplay-commission-witness"]')
      ) {
        probedWindow.__screenplayCommissionWitnessSave = localStorage.getItem(sessionKey)
        observer.disconnect()
      }
    })
    observer.observe(document.documentElement, { childList: true, subtree: true })
  }, ACTIVE_SESSION_KEY)

  await expect(page.getByTestId('commission-submit')).toBeEnabled()
  await page.getByTestId('commission-submit').click()
  const witness = page.getByTestId('lot-screenplay-commission-witness')
  await expect(witness).toBeVisible()
  await expect(page.getByTestId('lot-commission-workspace')).toHaveCount(0)
  await expect(page.getByTestId('studio-lot-screen')).not.toHaveAttribute('inert', '')
  await expectSameLotDomIdentity(commissionIdentity)
  await expect(witness).toHaveAttribute('data-project-id', 'script-0000')
  await expect(witness.getByRole('heading', { level: 3, name: title })).toBeFocused()
  await expect(page.getByTestId('lot-screenplay-commission-feedback')).toContainText(
    'Drafting is underway',
  )
  await expect(page.getByTestId('lot-screenplay-commission-facts')).toContainText(writerName)
  await expect(page.getByTestId('lot-screenplay-commission-facts')).toContainText('Week 0')
  await expect(page.getByTestId('lot-screenplay-commission-facts')).toContainText('Week 1')
  await expect(page.getByTestId('lot-screenplay-commission-facts')).toContainText(
    'Development & Casting',
  )
  await expect(
    page.getByTestId('lot-screenplay-commission-facts').locator('dd').nth(4),
  ).toHaveText('1')
  await expect(page.getByTestId('lot-screenplay-commission-open-details')).toBeVisible()
  await expect(page.getByTestId('lot-nav-writers')).toHaveAttribute('aria-current', 'true')

  const commissionedBytes = await activeSessionBytes(page)
  const commissioned = JSON.parse(commissionedBytes) as {
    seed: string
    state: {
      market: { tick: number }
      studio: { cash: number }
      rngState: string
      ledger: unknown[]
      scriptDevelopment: {
        mode: string
        projects: Array<{
          id: string
          conceptId: string
          writerId: string
          shape: { opening: string; midpoint: string; ending: string }
          promise: {
            genre: string
            intendedSegments: string[]
            ranges: Record<string, [number, number]>
          }
          status: string
          rewriteCount: number
          commissionedWeek: number
          dueWeek: number | null
          assessment: unknown
          reservation: {
            projectId: string
            facilityId: string
            capability: string
            slot: number
          } | null
          productionId: string | null
        }>
      }
    }
  }
  expect(commissionedBytes).not.toBe(beforeCommissionBytes)
  expect(await page.evaluate(() =>
    (window as typeof window & { __screenplayCommissionWitnessSave?: string | null })
      .__screenplayCommissionWitnessSave,
  )).toBe(commissionedBytes)
  expect(commissioned.seed).toBe('studio-home-fresh-founding')
  expect(commissioned.state.market.tick).toBe(0)
  expect(commissioned.state.market.tick).toBe(beforeCommission.state.market.tick)
  expect(commissioned.state.studio.cash).toBe(beforeCommission.state.studio.cash)
  expect(commissioned.state.rngState).toBe(beforeCommission.state.rngState)
  expect(commissioned.state.ledger).toEqual(beforeCommission.state.ledger)
  expect(commissioned.state.scriptDevelopment.mode).toBe('managed')
  expect(commissioned.state.scriptDevelopment.projects).toHaveLength(1)
  expect(commissioned.state.scriptDevelopment.projects[0]).toEqual({
    id: 'script-0000',
    conceptId,
    writerId,
    shape: {
      opening: 'slowSetup',
      midpoint: 'reversal',
      ending: 'bittersweet',
    },
    promise: {
      genre: beforeCommission.state.concepts.find((concept) => concept.id === conceptId)!.genre,
      intendedSegments: ['adult'],
      ranges: {
        intimacy: [-0.65, 0.15000000000000002],
        tonalWeight: [-0.65, 0.15000000000000002],
        kineticEnergy: [-0.65, 0.15000000000000002],
      },
    },
    status: 'drafting',
    rewriteCount: 0,
    commissionedWeek: 0,
    dueWeek: 1,
    assessment: null,
    reservation: {
      projectId: 'script-0000',
      facilityId: 'facility-development-casting',
      capability: 'development-casting',
      slot: 0,
    },
    productionId: null,
  })
  expect(page.url()).toBe(stableUrl)
  expect(await activeSessionBytes(page)).toBe(commissionedBytes)
  expect(await page.evaluate(
    () => (window as typeof window & { __freshFoundingDashboardSeen?: boolean })
      .__freshFoundingDashboardSeen,
  )).toBe(false)
  expect(runtime.pageErrors, runtime.pageErrors.join('\n')).toEqual([])
  expect(runtime.consoleErrors, runtime.consoleErrors.join('\n')).toEqual([])
})

test('Hollywood rollback keeps managed Development in the standalone Writers Room remount path', async ({ page }) => {
  const runtime = watchRuntime(page)
  await page.addInitScript((hollywoodKey) => {
    localStorage.setItem(hollywoodKey, '0')
  }, OPERATION_HOLLYWOOD_FLAG)
  await foundFreshStudio(page, 'studio-home-hollywood-rollback-managed')

  await expect(page.getByTestId('studio-lot-screen')).not.toHaveClass(/\blot-hollywood\b/)
  const baselineBytes = await activeSessionBytes(page)
  const initialIdentity = await captureLotDomIdentity(page)
  const writersBuilding = page.getByTestId('lot-nav-writers')
  await writersBuilding.focus()
  await writersBuilding.press('Enter')

  await expect(page.getByTestId('writers-room')).toBeVisible()
  await expect(page.getByTestId('writers-room-legacy')).toHaveCount(0)
  await expect(page.getByTestId('lot-commission-workspace')).toHaveCount(0)
  await expect(page.getByTestId('studio-lot-screen')).toHaveCount(0)
  await expect(page.getByTestId('studio-lot-canvas')).toHaveCount(0)
  await expectDisconnectedLotDomIdentity(initialIdentity)
  expect(await activeSessionBytes(page)).toBe(baselineBytes)

  await page.getByTestId('writers-room-back').click()
  await expectLotReady(page)
  await expect(page.getByTestId('lot-nav-writers')).toHaveAttribute('aria-current', 'true')
  await expect(page.getByTestId('lot-nav-writers')).toBeFocused()
  expect(await activeSessionBytes(page)).toBe(baselineBytes)
  expect(await page.evaluate(
    (key) => localStorage.getItem(key),
    OPERATION_HOLLYWOOD_FLAG,
  )).toBe('0')
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
  // PF1-M3 re-pin (Owner-approved, charter §5-M3): a routine same-format restore continues,
  // it does not "recover"; alarm language is reserved for the corrupt-quarantine path.
  await expect(page.getByTestId('recovery-notice')).toContainText('Continuing your studio — Week 0.')
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
  const classicIdentity = await captureLotDomIdentity(page)
  const writersBuilding = page.getByTestId('lot-nav-writers')
  await writersBuilding.focus()
  await expect(writersBuilding).toBeFocused()
  await writersBuilding.press('Enter')
  await expect(page.getByTestId('assembly-steps')).toBeVisible()
  await expect(page.getByTestId('lot-commission-workspace')).toHaveCount(0)
  await expect(page.getByTestId('studio-lot-screen')).toHaveCount(0)
  await expectDisconnectedLotDomIdentity(classicIdentity)
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
  // PF1-M3 VOICE PASS re-pin (charter §3): the week notice reads "Week N on the lot." since M2
  // promoted the region to visible. The assertion is unchanged in kind — the notice must carry
  // the exact post-advance week — only the wording moved.
  await expect(page.getByTestId('lot-week-update-announcement')).toHaveText(
    `Week ${before.state.market.tick + 1} on the lot.`,
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

  // PF1-M3 re-pin (Owner-approved, charter §5-M3): a routine same-format restore continues,
  // it does not "recover"; alarm language is reserved for the corrupt-quarantine path.
  await expect(page.getByTestId('recovery-notice')).toContainText('Continuing your studio — Week 0.')
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
  // PF1-M3 re-pin (Owner-approved, charter §5-M3): a routine same-format restore continues,
  // it does not "recover"; alarm language is reserved for the corrupt-quarantine path.
  await expect(page.getByTestId('recovery-notice')).toContainText('Continuing your studio — Week 0.')
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
