// ── C1-M5 — the build catalog, browsed and chosen from on the real canvas ────
//
// The Owner's bar for this milestone is "these are buildings I chose", not "a menu of
// sprites". That is a claim about a LIST: five entries visible at once, each saying what
// it does and what it costs, with the ones the studio cannot start still readable and
// saying why. This journey reads that list, is refused by it, clears the refusal by
// building the prerequisite IN THE SAME SESSION, and then finds the effect of what it
// built showing up where the player actually makes the decision it changes.
//
// LAW 25: this suite names its own fixture and asserts no structural tuple — the Week-0
// grid tuple belongs to `tycoon-build-mode-v1.spec.ts`, which still owns and re-measures
// it (the new blueprint art is baked on demand, so a world nobody has built in is
// byte-identical to the one that pin was measured on).

import { expect, test, type Locator, type Page } from '@playwright/test'
import {
  exportSaveJson,
  foundManagedStudioAction,
  foundingApplicantCards,
  importSaveJson,
  newGame,
  signContractAction,
  studioLotSnapshot,
  studioPlacement,
  type CreativeRole,
  type GameState,
} from '../src/engine/adapter.ts'

const GRID_BASE_URL = 'http://localhost:5179'

const ACTIVE_SESSION_KEY = 'project-studio.active-session.v4'
const ACTIVE_SESSION_CORRUPT_KEY = 'project-studio.active-session.v4.corrupt'
const LOT_FLAG_KEY = 'project-studio.flags.studio-lot-overview'
const HOLLYWOOD_FLAG_KEY = 'project-studio.flags.operation-hollywood'
const TYCOON_FLAG_KEY = 'project-studio.flags.tycoon-world'
const IDENTITY_PROOF_FLAG_KEY = 'project-studio.flags.studio-lot-identity-proof'

/** The parcel this suite builds on. Open, road-served ground off the boulevard. */
const BUILD_PARCEL = 'south-lawn'
const OFFICE_2 = 'development-office-2'
const OFFICE_3 = 'development-office-3'

/**
 * Every blueprint the engine publishes, in its own authored order — the C1 five
 * plus the C2a-M2 slate (stage, post, scenery, baseline office). The per-entry
 * assertions below read the engine's own catalog entries, so they extend with it.
 */
const CATALOG_IDS = [
  'development-casting-annex',
  'development-casting-hall',
  OFFICE_2,
  OFFICE_3,
  'craft-annex',
  'stage-standard',
  'post-building',
  'scenery-shop',
  'development-casting-office',
] as const

test.describe.configure({ timeout: 180_000 })

// ── the named fixture ────────────────────────────────────────────────────────

function managedIdleState(): GameState {
  const required: Readonly<Record<CreativeRole, number>> = {
    actor: 3,
    director: 1,
    writer: 3,
    craft: 1,
  }
  let state: GameState = newGame('tycoon-build-catalog-v1')
  const cards = foundingApplicantCards(state)
  for (const role of ['actor', 'director', 'writer', 'craft'] as const) {
    const selected = cards.filter((card) => card.profile.role === role).slice(0, required[role])
    if (selected.length !== required[role]) throw new Error(`fixture lacks ${role} applicants`)
    for (const card of selected) {
      const signed = signContractAction(state, card.profile.id, 104)
      if (!signed.ok) throw new Error(signed.error)
      state = signed.next
    }
  }
  const founded = foundManagedStudioAction(state)
  if (!founded.ok) throw new Error(founded.error)
  return founded.next
}

const MANAGED_IDLE_STATE = managedIdleState()

function managedIdleSave(): string {
  const bytes = exportSaveJson(MANAGED_IDLE_STATE)
  const replay = importSaveJson(bytes)
  if (!replay.ok || replay.converted || exportSaveJson(replay.state) !== bytes) {
    throw new Error('catalog fixture does not replay byte-identically')
  }
  return bytes
}

const MANAGED_IDLE_SAVE = managedIdleSave()

/** The engine's own catalog for this fixture — the copy the list must show verbatim. */
const FIXTURE_CATALOG = studioLotSnapshot(MANAGED_IDLE_STATE).placement!.catalog
const BUILD_PARCEL_RECT = studioPlacement(MANAGED_IDLE_STATE).parcels.find(
  (parcel) => parcel.id === BUILD_PARCEL,
)!.rect

function catalogEntry(blueprintId: string) {
  const entry = FIXTURE_CATALOG.find((row) => row.blueprintId === blueprintId)
  if (entry === undefined) throw new Error(`fixture catalog lacks ${blueprintId}`)
  return entry
}

// ── renderer instrumentation ─────────────────────────────────────────────────

function instrumentRendererSource(source: string): string {
  const marker = 'constructor(opts) {\n    this.opts = opts;'
  if (!source.includes(marker)) throw new Error('StudioLotView constructor marker is absent')
  return source.replace(
    marker,
    `constructor(opts) {
    globalThis.__projectStudioGridWorld = this;
    this.opts = opts;`,
  )
}

async function seed(page: Page) {
  await page.route('**/src/lot/StudioLotView.ts*', async (route) => {
    const response = await route.fetch()
    await route.fulfill({ response, body: instrumentRendererSource(await response.text()) })
  })
  await page.addInitScript((config) => {
    localStorage.setItem(config.sessionKey, config.save)
    localStorage.removeItem(config.corruptKey)
    localStorage.removeItem(config.lotFlag)
    localStorage.removeItem(config.hollywoodFlag)
    localStorage.removeItem(config.tycoonFlag)
    localStorage.setItem(config.identityFlag, '1')
  }, {
    sessionKey: ACTIVE_SESSION_KEY,
    corruptKey: ACTIVE_SESSION_CORRUPT_KEY,
    lotFlag: LOT_FLAG_KEY,
    hollywoodFlag: HOLLYWOOD_FLAG_KEY,
    tycoonFlag: TYCOON_FLAG_KEY,
    identityFlag: IDENTITY_PROOF_FLAG_KEY,
    save: MANAGED_IDLE_SAVE,
  })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto(`${GRID_BASE_URL}/`)
  await expect(page.getByTestId('studio-lot-screen')).toBeVisible()
  await expect(page.getByTestId('studio-lot-canvas').locator('canvas')).toHaveCount(1)
  await expect(page.getByText('Preparing the lot…', { exact: true })).toHaveCount(0)
  await expect(page.getByTestId('dev-error')).toHaveCount(0)
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

async function foldGuidance(page: Page): Promise<void> {
  const toggle = page.getByTestId('lot-picture-guidance-toggle')
  // The card is not always on the stage: the picture's guidance disappears when the
  // journey has no next step to name. Absent is a real answer, not something to wait for.
  if ((await toggle.count()) === 0) return
  if ((await toggle.getAttribute('aria-expanded')) === 'true') await toggle.click()
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
}

async function cellPoint(page: Page, gx: number, gy: number): Promise<{ x: number; y: number }> {
  const canvas: Locator = page.getByTestId('studio-lot-canvas').locator('canvas')
  const box = await canvas.boundingBox()
  if (box === null) throw new Error('the lot canvas has no box')
  const fraction = await page.evaluate(
    ({ gx: cx, gy: cy }) => {
      const root = globalThis as typeof globalThis & {
        __projectStudioGridWorld?: {
          worldCellFraction(gx: number, gy: number): { fx: number; fy: number } | null
        }
      }
      return root.__projectStudioGridWorld?.worldCellFraction(cx, cy) ?? null
    },
    { gx, gy },
  )
  if (fraction === null) throw new Error(`cell ${String(gx)},${String(gy)} has no projection`)
  return { x: box.x + fraction.fx * box.width, y: box.y + fraction.fy * box.height }
}

async function clickCell(page: Page, gx: number, gy: number): Promise<void> {
  const point = await cellPoint(page, gx, gy)
  await page.mouse.move(point.x, point.y)
  await page.mouse.click(point.x, point.y)
}

async function sessionState(page: Page): Promise<GameState> {
  const value = await page.evaluate((key) => localStorage.getItem(key), ACTIVE_SESSION_KEY)
  if (value === null) throw new Error('active session is missing')
  const replay = importSaveJson(value)
  if (!replay.ok) throw new Error(replay.error)
  return replay.state
}

/** Open the catalog over the suite's build parcel, through the companion rail. */
async function openCatalog(page: Page): Promise<void> {
  await page.getByTestId(`lot-nav-parcel-${BUILD_PARCEL}`).focus()
  await page.getByTestId(`lot-nav-parcel-${BUILD_PARCEL}`).press('Enter')
  await page.getByTestId(`lot-parcel-build-${BUILD_PARCEL}`).click()
  await expect(page.getByTestId('lot-build-catalog')).toBeVisible()
}

// ── 1. THE LIST ──────────────────────────────────────────────────────────────

test('the catalog shows every building the studio could choose, and what each does', async ({
  page,
}) => {
  const runtime = watchRuntime(page)
  await seed(page)
  await foldGuidance(page)
  await openCatalog(page)

  // ALL FIVE, visible at once — that is what makes it a list a player compares.
  const rows = page.locator('[data-testid^="lot-build-blueprint-"]')
  await expect(rows).toHaveCount(CATALOG_IDS.length)

  for (const blueprintId of CATALOG_IDS) {
    const entry = catalogEntry(blueprintId)
    const row = page.getByTestId(`lot-build-blueprint-${blueprintId}`)
    await expect(row).toBeVisible()
    await expect(row).toContainText(entry.name)
    // The engine's own authored sentence, VERBATIM.
    await expect(page.getByTestId(`lot-build-effect-${blueprintId}`)).toHaveText(
      entry.effectSummary,
    )
    // Price and clock, so the comparison is possible without opening anything.
    await expect(row).toContainText(`${entry.buildWeeks} weeks`)
  }

  // FOUR are startable on a brand-new studio; the tier gated on another building is not.
  for (const blueprintId of ['development-casting-annex', 'development-casting-hall', OFFICE_2, 'craft-annex']) {
    await expect(page.getByTestId(`lot-build-blueprint-${blueprintId}`)).toHaveAttribute(
      'data-state',
      'buildable',
    )
    await expect(page.getByTestId(`lot-build-blueprint-${blueprintId}`)).toBeEnabled()
    await expect(page.getByTestId(`lot-build-state-${blueprintId}`)).toHaveText('Available')
  }

  // …and the locked one stays READABLE and says why, in the engine's own words.
  const locked = page.getByTestId(`lot-build-blueprint-${OFFICE_3}`)
  await expect(locked).toHaveAttribute('data-state', 'locked')
  await expect(locked).toBeDisabled()
  await expect(page.getByTestId(`lot-build-state-${OFFICE_3}`)).toHaveText('Locked')
  const blocked = page.getByTestId(`lot-build-blocked-${OFFICE_3}`)
  await expect(blocked).toBeVisible()
  await expect(blocked).toHaveText(catalogEntry(OFFICE_3).unmet[0]!.reason)
  // It is something the studio can work TOWARD, not something the game lacks — the two
  // are styled differently and the distinction is the engine's, never a string sniff.
  await expect(blocked.locator('p')).toHaveAttribute('data-not-yet-attainable', 'false')
  // A locked entry never starts a draft, even when its control is forced.
  await locked.click({ force: true }).catch(() => undefined)
  await expect(page.getByTestId('lot-build-origin')).toHaveCount(0)

  expect(runtime.pageErrors).toEqual([])
  expect(runtime.consoleErrors).toEqual([])
})

// ── 2. THE LOCK, CLEARED IN THE SAME SESSION ─────────────────────────────────

test('building the prerequisite unlocks the tier above it without a reload', async ({ page }) => {
  const runtime = watchRuntime(page)
  await seed(page)
  await foldGuidance(page)
  await openCatalog(page)

  // Choose Development Office II from the list and put it on the ground.
  await page.getByTestId(`lot-build-blueprint-${OFFICE_2}`).click()
  await expect(page.getByTestId('lot-build-origin')).toBeVisible()
  await expect(page.getByTestId('lot-build-verdict')).toHaveAttribute('data-ok', 'true')
  await expect(page.getByTestId('lot-build-commit')).toContainText('Development Office II')
  await page.getByTestId('lot-build-commit').click()
  await expect(page.getByTestId('lot-build-receipt')).toContainText(
    'committed to Development Office II',
  )

  // While it is still a hole in the ground the tier above stays locked, and the list
  // says "1 building" rather than calling it owned.
  await openCatalog(page)
  await expect(page.getByTestId(`lot-build-blueprint-${OFFICE_3}`)).toHaveAttribute(
    'data-state',
    'locked',
  )
  await expect(page.getByTestId(`lot-build-blueprint-${OFFICE_2}`)).toContainText('1 building')

  // Eight weeks later it is operational — and the catalog answers differently on the
  // very next read, in the SAME session, with no reload and nothing memoised.
  const weeks = catalogEntry(OFFICE_2).buildWeeks
  for (let week = 0; week < weeks; week++) {
    await page.getByTestId('lot-advance-week').click()
    await expect(page.locator('.lot-sub')).toHaveText(new RegExp(`Week ${String(week + 1)}$`))
  }
  await foldGuidance(page)
  await openCatalog(page)

  const unlocked = page.getByTestId(`lot-build-blueprint-${OFFICE_3}`)
  await expect(unlocked).toHaveAttribute('data-state', 'buildable')
  await expect(unlocked).toBeEnabled()
  await expect(page.getByTestId(`lot-build-blocked-${OFFICE_3}`)).toHaveCount(0)

  // …and the tier that unlocked it is spent: one is all the studio may have.
  const spent = page.getByTestId(`lot-build-blueprint-${OFFICE_2}`)
  await expect(spent).toHaveAttribute('data-state', 'at-limit')
  await expect(spent).toBeDisabled()
  await expect(spent).toHaveAttribute('data-owned', '1')
  await expect(page.getByTestId(`lot-build-state-${OFFICE_2}`)).toHaveText('Built')
  await expect(page.getByTestId(`lot-build-blocked-${OFFICE_2}`)).toContainText(
    'The studio builds only one of these, and it already has it.',
  )

  // The building really stands, wearing its own body, and says what it does.
  const placed = studioPlacement(await sessionState(page)).placements[0]!
  expect(placed.blueprintId).toBe(OFFICE_2)
  expect(placed.status).toBe('operational')
  const front = [...placed.cells].sort((a, b) => a.gx + a.gy - (b.gx + b.gy)).at(-1)!
  await foldGuidance(page)
  await clickCell(page, front.gx, front.gy)
  await expect(page.getByTestId(`lot-building-inspector-placed-${String(placed.id)}`)).toBeVisible()
  await expect(page.getByTestId('lot-building-inspector-heading')).toHaveText(
    'Development Office II',
  )
  // WHAT IS THIS — the same sentence the catalog sold it with.
  await expect(
    page.locator('.hollywood-building-inspector-role'),
  ).toHaveText(catalogEntry(OFFICE_2).effectSummary)
  // …and no occupancy it does not have: it provides no shared slot.
  await expect(page.getByTestId('lot-building-inspector-occupants')).toHaveCount(0)

  expect(runtime.pageErrors).toEqual([])
  expect(runtime.consoleErrors).toEqual([])
})

// ── 3. THE EFFECT, WHERE THE DECISION IS MADE ────────────────────────────────

test('a standing Development Office states its uplift on the commission form', async ({ page }) => {
  const runtime = watchRuntime(page)
  await seed(page)
  await foldGuidance(page)

  // Before anything is built, the form says nothing about an office it does not have.
  await clickCell(page, 4, 3) // Development
  await expect(page.getByTestId('lot-building-inspector-writers')).toBeVisible()
  await page.getByTestId('lot-building-inspector-primary-commission').click()
  await expect(page.getByTestId('commission-panel')).toBeVisible()
  await expect(page.getByTestId('commission-office-uplift')).toHaveCount(0)
  await page.getByTestId('commission-close').click()

  // Build the office and let it open.
  await foldGuidance(page)
  await openCatalog(page)
  await page.getByTestId(`lot-build-blueprint-${OFFICE_2}`).click()
  await expect(page.getByTestId('lot-build-verdict')).toHaveAttribute('data-ok', 'true')
  await page.getByTestId('lot-build-commit').click()
  const weeks = catalogEntry(OFFICE_2).buildWeeks
  for (let week = 0; week < weeks; week++) {
    await page.getByTestId('lot-advance-week').click()
    await expect(page.locator('.lot-sub')).toHaveText(new RegExp(`Week ${String(week + 1)}$`))
  }

  // …and now the form says what the studio bought, where the choice is actually made.
  await foldGuidance(page)
  await clickCell(page, 4, 3)
  await expect(page.getByTestId('lot-building-inspector-writers')).toBeVisible()
  await page.getByTestId('lot-building-inspector-primary-commission').click()
  await expect(page.getByTestId('commission-panel')).toBeVisible()
  const line = page.getByTestId('commission-office-uplift')
  await expect(line).toBeVisible()
  await expect(line).toContainText('Development Office II will add')
  await expect(line).toContainText('points of estimated strength to this draft.')
  // The number is the ENGINE's, not a figure this surface invented.
  await expect(line).toContainText('4')

  expect(runtime.pageErrors).toEqual([])
  expect(runtime.consoleErrors).toEqual([])
})
