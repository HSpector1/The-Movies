// ── C1-M6 — the SECOND ZONE, in a real browser ───────────────────────────────
//
// The browser half of claim 1. Its engine half is `tests/c1-m6-second-zone-by-data.
// test.ts`, and both take the SAME committed bytes — `ui/e2e/expanded-property-v1/
// week-0-south-yard-second-zone.save.json` — so the two are one claim rather than two
// stories that happen to agree.
//
// What is proved here, in the order a player would meet it:
//
//   1. the fixture LOADS. A savegame whose property is deeper than the one the product
//      ships boots into the shipped world with no renderer change and no error;
//   2. the new parcels appear in the COMPANION RAIL, and the zone's rules are live in
//      the UI: the road-served parcels offer Build here, the unserved one refuses with
//      the reason, the protected pad is not listed at all;
//   3. the BUILD CATALOG opens on new ground and quotes it;
//   4. the COMMIT succeeds, and the WORLD COMPOSES THE PLACED BODY on ground that did
//      not exist a property ago — and keeps composing it across a week.
//
// HOW IT IS ASSERTED, and why. Everything is read from the DOM, from the companion
// rail, from the renderer's own composed-world state, and from the autosaved session
// bytes put back through the engine. NOTHING is read from canvas pixels: no canvas
// digest, no structural tuple, no draw-call figure is claimed anywhere in this file.
// This fixture's world is deliberately NOT the pinned Week-0 studio — it has eight more
// rows of ground and a building nobody has built before — so a fingerprint of it would
// be a number with no meaning and a pin nobody could act on. The pinned tuples in
// `playwright.config.ts` belong to their own fixtures and are not touched.

import { expect, test, type Page } from '@playwright/test'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  exportSaveJson,
  importSaveJson,
  studioPlacement,
} from '../src/engine/adapter.ts'

const GRID_BASE_URL = 'http://localhost:5179'

const ACTIVE_SESSION_KEY = 'project-studio.active-session.v4'
const ACTIVE_SESSION_CORRUPT_KEY = 'project-studio.active-session.v4.corrupt'
const LOT_FLAG_KEY = 'project-studio.flags.studio-lot-overview'
const HOLLYWOOD_FLAG_KEY = 'project-studio.flags.operation-hollywood'
const TYCOON_FLAG_KEY = 'project-studio.flags.tycoon-world'
const IDENTITY_PROOF_FLAG_KEY = 'project-studio.flags.studio-lot-identity-proof'

const ANNEX_BLUEPRINT = 'development-casting-annex'
/** The second zone's two road-served build sites, its unserved ground, its blocked pad. */
const BUILD_PARCEL = 'south-yard-east'
const SECOND_PARCEL = 'south-yard-west'
const UNSERVED_PARCEL = 'south-yard-back'
const BLOCKED_PARCEL = 'south-yard-tank'

test.describe.configure({ timeout: 180_000 })

// ── the committed fixture, checked before it is used ─────────────────────────

const here = dirname(fileURLToPath(import.meta.url))
const fixtureDirectory = join(here, 'expanded-property-v1')
const FIXTURE_FILE = 'week-0-south-yard-second-zone.save.json'

type Manifest = {
  fixtures: {
    file: string
    byteLength: number
    sha256: string
    claim: { bounds: { width: number; depth: number }; zone: { addedParcels: string[] } }
  }[]
}

const manifest = JSON.parse(readFileSync(join(fixtureDirectory, 'manifest.json'), 'utf8')) as Manifest
const claimed = manifest.fixtures.find((entry) => entry.file === FIXTURE_FILE)!
const SECOND_ZONE_SAVE = readFileSync(join(fixtureDirectory, FIXTURE_FILE), 'utf8')

function verifiedFixture(): string {
  if (Buffer.byteLength(SECOND_ZONE_SAVE, 'utf8') !== claimed.byteLength) {
    throw new Error('the second-zone fixture is not the length its manifest claims')
  }
  if (createHash('sha256').update(SECOND_ZONE_SAVE, 'utf8').digest('hex') !== claimed.sha256) {
    throw new Error('the second-zone fixture does not hash to the digest its manifest claims')
  }
  const replay = importSaveJson(SECOND_ZONE_SAVE)
  if (!replay.ok || replay.converted || exportSaveJson(replay.state) !== SECOND_ZONE_SAVE) {
    throw new Error('the second-zone fixture does not replay byte-identically')
  }
  if (replay.state.property.bounds.depth !== claimed.claim.bounds.depth) {
    throw new Error('the second-zone fixture is not carrying the property its manifest describes')
  }
  return SECOND_ZONE_SAVE
}

const SECOND_ZONE_STATE = importSaveJson(verifiedFixture())
if (!SECOND_ZONE_STATE.ok) throw new Error('the second-zone fixture failed to import')
/** The ENGINE's own answer for the parcel this spec builds on. No coordinate is authored. */
const BUILD_PARCEL_RECT = studioPlacement(SECOND_ZONE_STATE.state).parcels.find(
  (parcel) => parcel.id === BUILD_PARCEL,
)!.rect

// ── renderer instrumentation ─────────────────────────────────────────────────
//
// The same route-rewrite seam `tycoon-build-mode-v1.spec.ts` established. It gives this
// spec a handle on the live `StudioLotView`, which is how "the world composed the body"
// is read as STATE — which bodies the scene is holding, and what their captions say —
// rather than as pixels.

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

type GridDebug = {
  selectedParcelId: string | null
  buildModeParcelId: string | null
  previewOrigin: { gx: number; gy: number } | null
  previewOk: boolean | null
  parcelZoneIds: string[]
  placedFacilityIds: number[]
  placementLabels: string[]
}

async function gridDebug(page: Page): Promise<GridDebug> {
  const debug = await page.evaluate(() => {
    const root = globalThis as typeof globalThis & {
      __projectStudioGridWorld?: { tycoonDebugState(): unknown }
    }
    return root.__projectStudioGridWorld?.tycoonDebugState() ?? null
  })
  if (debug === null) throw new Error('the grid world renderer is not instrumented')
  return debug as GridDebug
}

async function gridProjection(page: Page): Promise<{ lotWidth: number; lotDepth: number }> {
  const projection = await page.evaluate(() => {
    const root = globalThis as typeof globalThis & {
      __projectStudioGridWorld?: { worldProjection(): unknown }
    }
    return root.__projectStudioGridWorld?.worldProjection() ?? null
  })
  if (projection === null) throw new Error('the grid world camera is unavailable')
  return projection as { lotWidth: number; lotDepth: number }
}

async function seed(page: Page): Promise<void> {
  await page.route('**/src/lot/StudioLotView.ts*', async (route) => {
    const response = await route.fetch()
    await route.fulfill({ response, body: instrumentRendererSource(await response.text()) })
  })
  await page.addInitScript((config) => {
    localStorage.setItem(config.sessionKey, config.save)
    localStorage.removeItem(config.corruptKey)
    // The three player gates stay on their SHIPPED DEFAULTS: this proves the world an
    // ordinary player boots into, handed a savegame with a bigger property.
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
    save: SECOND_ZONE_SAVE,
  })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto(`${GRID_BASE_URL}/`)
  await expect(page.getByTestId('studio-lot-screen')).toBeVisible()
  await expect(page.getByTestId('studio-lot-canvas').locator('canvas')).toHaveCount(1)
  await expect(page.getByText('Preparing the lot…', { exact: true })).toHaveCount(0)
  await expect(page.getByTestId('dev-error')).toHaveCount(0)
  // Readiness only — the world has committed its first frame. No figure from this
  // panel is asserted anywhere in this file.
  await expect(page.getByTestId('hollywood-performance')).not.toHaveAttribute('data-draw-calls', '0', {
    timeout: 30_000,
  })
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

/** Fold the picture-guidance card with the player's own control, if it is on the stage. */
async function foldGuidance(page: Page): Promise<void> {
  const toggle = page.getByTestId('lot-picture-guidance-toggle')
  if ((await toggle.count()) === 0) return
  if ((await toggle.getAttribute('aria-expanded')) === 'true') await toggle.click()
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
}

/** Open a parcel from the COMPANION RAIL — the keyboard path, never the canvas. */
async function openParcel(page: Page, parcelId: string): Promise<void> {
  const row = page.getByTestId(`lot-nav-parcel-${parcelId}`)
  await row.focus()
  await expect(row).toBeFocused()
  await row.press('Enter')
  await expect(page.getByTestId(`lot-parcel-inspector-${parcelId}`)).toBeVisible()
}

async function sessionState(page: Page) {
  const value = await page.evaluate((key) => localStorage.getItem(key), ACTIVE_SESSION_KEY)
  if (value === null) throw new Error('active session is missing')
  const imported = importSaveJson(value)
  if (!imported.ok) throw new Error(imported.error)
  // The autosaved session is a real save: it re-exports to exactly what it was.
  expect(exportSaveJson(imported.state)).toBe(value)
  return imported.state
}

// ── 1. THE FIXTURE LOADS, AND THE ZONE IS THERE ──────────────────────────────

test('a savegame with a second zone boots into the shipped world and names the new ground', async ({
  page,
}) => {
  const runtime = watchRuntime(page)
  await seed(page)

  // The renderer adopted the property the SAVE described, not the founding constants.
  const projection = await gridProjection(page)
  expect(projection.lotWidth).toBe(28)
  expect(projection.lotDepth).toBe(34)

  // The new parcels are addressable ground in the world, alongside the founding ones.
  const debug = await gridDebug(page)
  expect(debug.parcelZoneIds).toContain(BUILD_PARCEL)
  expect(debug.parcelZoneIds).toContain(SECOND_PARCEL)
  expect(debug.parcelZoneIds).toContain(UNSERVED_PARCEL)
  // Blocked ground never gets a hotspot — nothing may ever be built on it.
  expect(debug.parcelZoneIds).not.toContain(BLOCKED_PARCEL)
  // …and the founding zone is entirely intact underneath it.
  for (const founding of ['south-lawn', 'west-lawn', 'north-lawn', 'north-back-lot']) {
    expect(debug.parcelZoneIds).toContain(founding)
  }

  // THE COMPANION RAIL — every new parcel has its own row, with its own state line.
  await expect(page.getByTestId('lot-companion-nav')).toBeVisible()
  for (const parcelId of [BUILD_PARCEL, SECOND_PARCEL, UNSERVED_PARCEL]) {
    await expect(page.getByTestId(`lot-nav-parcel-${parcelId}`)).toBeVisible()
    await expect(page.getByTestId(`lot-nav-parcel-${parcelId}-state`)).not.toBeEmpty()
  }
  await expect(page.getByTestId(`lot-nav-parcel-${BLOCKED_PARCEL}`)).toHaveCount(0)
  await expect(page.getByTestId(`lot-nav-parcel-${BUILD_PARCEL}`)).toContainText('South Yard East')

  expect(runtime.pageErrors).toEqual([])
  expect(runtime.consoleErrors).toEqual([])
})

// ── 2. THE ZONE'S RULES ARE LIVE IN THE UI ───────────────────────────────────

test('the new zone carries the same rules the founding lot does, in the same words', async ({
  page,
}) => {
  const runtime = watchRuntime(page)
  await seed(page)
  await foldGuidance(page)

  // A road-served parcel offers the build.
  await openParcel(page, BUILD_PARCEL)
  await expect(page.getByTestId(`lot-parcel-inspector-${BUILD_PARCEL}`)).toHaveAttribute(
    'data-parcel-status',
    'vacant',
  )
  await expect(page.getByTestId('lot-parcel-inspector-facts')).toContainText(
    'trucks can reach this site',
  )
  await expect(page.getByTestId(`lot-parcel-build-${BUILD_PARCEL}`)).toBeVisible()

  // The unserved parcel on the SAME new ground refuses, with the reason — exactly as
  // `north-back-lot` does on the founding lot.
  await openParcel(page, UNSERVED_PARCEL)
  await expect(page.getByTestId('lot-parcel-build-blocked')).toContainText('no road frontage')
  await expect(page.getByTestId(`lot-parcel-build-${UNSERVED_PARCEL}`)).toHaveCount(0)

  expect(runtime.pageErrors).toEqual([])
  expect(runtime.consoleErrors).toEqual([])
})

// ── 3 + 4. CATALOG → COMMIT → THE WORLD COMPOSES THE BODY ────────────────────

test('the studio builds on ground that did not exist, and the world composes the body', async ({
  page,
}) => {
  const runtime = watchRuntime(page)
  await seed(page)
  await foldGuidance(page)

  await openParcel(page, BUILD_PARCEL)
  expect((await gridDebug(page)).selectedParcelId).toBe(BUILD_PARCEL)

  // ── the catalog, opened on the new zone ──
  await page.getByTestId(`lot-parcel-build-${BUILD_PARCEL}`).click()
  await expect(page.getByTestId('lot-build-catalog')).toBeVisible()
  const entry = page.getByTestId(`lot-build-blueprint-${ANNEX_BLUEPRINT}`)
  await expect(entry).toContainText('Development & Casting Annex')
  await expect(entry).toContainText('$780,000')

  // ── the quote, taken on new ground ──
  const beforeGhost = await sessionState(page)
  expect(studioPlacement(beforeGhost).placements).toHaveLength(0)
  await entry.click()
  await expect(page.getByTestId('lot-build-quote')).toContainText('$780,000')
  await expect(page.getByTestId('lot-build-verdict')).toHaveAttribute('data-ok', 'true')
  const ghosted = await gridDebug(page)
  expect(ghosted.buildModeParcelId).toBe(BUILD_PARCEL)
  expect(ghosted.previewOk).toBe(true)
  // The ghost starts at the ENGINE's own origin for this parcel — the new zone's.
  expect(ghosted.previewOrigin).toEqual({ gx: BUILD_PARCEL_RECT.x0, gy: BUILD_PARCEL_RECT.y0 })
  await expect(page.getByTestId('lot-build-origin')).toHaveAttribute(
    'data-origin-gy',
    String(BUILD_PARCEL_RECT.y0),
  )
  // A ghost is a UI-only layer: not one byte of the session moved.
  expect(exportSaveJson(await sessionState(page))).toBe(exportSaveJson(beforeGhost))

  // ── the commit ──
  await expect(page.getByTestId('lot-build-commit')).toBeEnabled()
  await page.getByTestId('lot-build-commit').click()

  await expect(page.getByTestId('lot-build-receipt')).toContainText(
    '$780,000 committed to Development & Casting Annex',
  )
  await expect(page.getByTestId('lot-build-receipt')).toContainText('completes in Week 13')
  await expect(page.getByTestId(`lot-parcel-inspector-${BUILD_PARCEL}`)).toHaveAttribute(
    'data-parcel-status',
    'building',
  )
  await expect(page.getByTestId('lot-parcel-inspector-status')).toContainText('under construction')

  // ── THE WORLD COMPOSED THE BODY, on ground that did not exist a property ago ──
  const built = await gridDebug(page)
  expect(built.placedFacilityIds).toEqual([1])
  expect(built.placementLabels).toEqual(['DEVELOPMENT & CASTING ANNEX · 13 WEEKS LEFT'])
  expect(built.buildModeParcelId).toBeNull()
  expect(built.previewOrigin).toBeNull()

  // …and the ENGINE agrees, in the autosaved session the App owner wrote.
  const afterCommit = await sessionState(page)
  const placements = studioPlacement(afterCommit).placements
  expect(placements).toHaveLength(1)
  expect(placements[0]!.parcelId).toBe(BUILD_PARCEL)
  expect(placements[0]!.origin).toEqual({ gx: BUILD_PARCEL_RECT.x0, gy: BUILD_PARCEL_RECT.y0 })
  expect(placements[0]!.status).toBe('underConstruction')
  expect(afterCommit.property.bounds).toEqual({ width: 28, depth: 34 })
  expect(afterCommit.studio.cash).toBe(beforeGhost.studio.cash - 780_000)

  // ── and it stays composed across a week ──
  await page.getByTestId('lot-advance-week').click()
  await expect(page.locator('.lot-sub')).toHaveText(/Week 1$/)
  const advanced = await gridDebug(page)
  expect(advanced.placedFacilityIds).toEqual([1])
  expect(advanced.placementLabels).toEqual(['DEVELOPMENT & CASTING ANNEX · 12 WEEKS LEFT'])

  // The COMPANION RAIL followed it: the parcel that carries the building reads as
  // building, and the other new parcel is still open ground.
  await expect(page.getByTestId(`lot-nav-parcel-${BUILD_PARCEL}-state`)).toContainText(
    'Development & Casting Annex is under construction — 1 of 13 weeks done, 12 to go.',
  )
  await openParcel(page, SECOND_PARCEL)
  await expect(page.getByTestId(`lot-parcel-inspector-${SECOND_PARCEL}`)).toHaveAttribute(
    'data-parcel-status',
    'vacant',
  )

  expect(runtime.pageErrors).toEqual([])
  expect(runtime.consoleErrors).toEqual([])
})
