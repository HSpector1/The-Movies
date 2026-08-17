// ── Tycoon Build Mode V1 — the FIRST grid-world browser coverage ─────────────
//
// The M1 quarantine note in `playwright.config.ts` records the debt this file pays:
// every existing browser spec is pinned to the retained painted plate, because its
// helpers convert PAINTED-DISTRICT PIXELS into screen points and its structural
// fingerprints belong to that renderer. Neither can be re-baselined in place. So this
// suite runs against the SHIPPED DEFAULT world on its own origin (`GRID_BASE_URL`),
// brings its own grid → screen click helper derived from the live camera transform,
// and records its own freshly measured tuples under its own fixture name (law 25).
//
// Four proofs, in the order a player meets them:
//   1. BOOT      — a fresh managed studio opens onto the whole property, at operations
//                  reading distance, with every building's name painted on the canvas.
//   2. INSPECT   — clicking a building in the CANVAS lands its in-world panel and
//                  navigates nowhere (M1.5's world-first law, proved in a real browser).
//   3. BUILD     — a parcel click → catalog → ghost + quote → commit → a construction
//                  site painted on those cells → thirteen advances → an operational
//                  building, its capacity, and its weekly running cost.
//   4. CAMERA    — one grammar for the camera: a selection pans and never zooms, and
//                  the whole property is always one named control (or `R`) away.

import { expect, test, type Locator, type Page } from '@playwright/test'
import { createHash } from 'node:crypto'
import {
  exportSaveJson,
  foundManagedStudioAction,
  foundingApplicantCards,
  importSaveJson,
  newGame,
  signContractAction,
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

const ANNEX_BLUEPRINT = 'development-casting-annex'
/** The parcel this suite builds on. Open, road-served ground off the boulevard. */
const BUILD_PARCEL = 'south-lawn'

test.describe.configure({ timeout: 180_000 })

// ── the named fixture ────────────────────────────────────────────────────────
//
// LAW 25: name the fixture, measure fresh windows. This is the GRID-WORLD MANAGED-IDLE
// fixture — a founded, managed, Week-0 studio built by calling adapter actions in-spec
// with a named seed. Nothing is hand-edited; cash and roster are whatever the engine
// produced. Its structural tuple below belongs to THIS fixture and no other.

function gridManagedIdleState(): GameState {
  const required: Readonly<Record<CreativeRole, number>> = {
    actor: 3,
    director: 1,
    writer: 1,
    craft: 1,
  }
  let state: GameState = newGame('tycoon-build-mode-v1')
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

function gridManagedIdleSave(): string {
  const bytes = exportSaveJson(GRID_MANAGED_IDLE_STATE)
  const replay = importSaveJson(bytes)
  if (!replay.ok || replay.converted || exportSaveJson(replay.state) !== bytes) {
    throw new Error('grid managed-idle fixture does not replay byte-identically')
  }
  return bytes
}

const GRID_MANAGED_IDLE_STATE = gridManagedIdleState()
const GRID_MANAGED_IDLE_SAVE = gridManagedIdleSave()
/** The engine's own answer for the parcel this suite builds on. */
const BUILD_PARCEL_RECT = studioPlacement(GRID_MANAGED_IDLE_STATE).parcels.find(
  (parcel) => parcel.id === BUILD_PARCEL,
)!.rect

// ── renderer instrumentation ─────────────────────────────────────────────────
//
// The grid → screen helper has to come from the LIVE CAMERA, not from a re-derivation
// of the transform in the spec (that is precisely the mistake the plate helpers made).
// `StudioLotView` already exposes `worldCellFraction`, so the spec only needs a handle
// on the view instance: the same route-rewrite seam `audition-planning-current-break-
// audit.spec.ts` established, adding one assignment and changing nothing else.

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

type SeedOptions = { save?: string }

async function seed(page: Page, options: SeedOptions = {}) {
  await page.route('**/src/lot/StudioLotView.ts*', async (route) => {
    const response = await route.fetch()
    await route.fulfill({ response, body: instrumentRendererSource(await response.text()) })
  })
  await page.addInitScript((config) => {
    localStorage.setItem(config.sessionKey, config.save)
    localStorage.removeItem(config.corruptKey)
    // The three player gates stay on their SHIPPED DEFAULTS — absence, not a positive
    // `1` — because this suite exists to prove the world an ordinary player boots into.
    localStorage.removeItem(config.lotFlag)
    localStorage.removeItem(config.hollywoodFlag)
    localStorage.removeItem(config.tycoonFlag)
    // The renderer telemetry panel is dev-review chrome; this suite reads it as evidence.
    localStorage.setItem(config.identityFlag, '1')
  }, {
    sessionKey: ACTIVE_SESSION_KEY,
    corruptKey: ACTIVE_SESSION_CORRUPT_KEY,
    lotFlag: LOT_FLAG_KEY,
    hollywoodFlag: HOLLYWOOD_FLAG_KEY,
    tycoonFlag: TYCOON_FLAG_KEY,
    identityFlag: IDENTITY_PROOF_FLAG_KEY,
    save: options.save ?? GRID_MANAGED_IDLE_SAVE,
  })
  // Reduced motion freezes the ambient crowd, which is what lets a canvas capture be
  // compared frame to frame at all. It is also a real supported player setting.
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto(`${GRID_BASE_URL}/`)
  await expect(page.getByTestId('studio-lot-screen')).toBeVisible()
  await expect(page.getByTestId('studio-lot-canvas').locator('canvas')).toHaveCount(1)
  await expect(page.getByText('Preparing the lot…', { exact: true })).toHaveCount(0)
  await expect(page.getByTestId('dev-error')).toHaveCount(0)
  await expect(page.getByTestId('hollywood-performance')).toBeVisible()
  // Draw-call telemetry only begins sampling after the renderer's warm-up window, so a
  // structural read taken before it would honestly report zero. Wait for the first
  // committed frame rather than asserting a number the instrument has not measured yet.
  await expect(page.getByTestId('hollywood-performance')).not.toHaveAttribute(
    'data-draw-calls',
    '0',
    { timeout: 30_000 },
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

// ── the grid → screen click helper ───────────────────────────────────────────

type GridDebug = {
  selectedPlaceId: string | null
  selectedParcelId: string | null
  buildModeParcelId: string | null
  previewOrigin: { gx: number; gy: number } | null
  previewOk: boolean | null
  parcelZoneIds: string[]
  placedFacilityIds: number[]
  lodBand: 'institution' | 'operations' | 'people'
  visibleBuildingLabels: number
  placementLabels: string[]
}

type GridProjection = {
  lotWidth: number
  lotDepth: number
  tileWidth: number
  tileHeight: number
  zoom: number
  worldView: { x: number; y: number; width: number; height: number }
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

async function gridProjection(page: Page): Promise<GridProjection> {
  const projection = await page.evaluate(() => {
    const root = globalThis as typeof globalThis & {
      __projectStudioGridWorld?: { worldProjection(): unknown }
    }
    return root.__projectStudioGridWorld?.worldProjection() ?? null
  })
  if (projection === null) throw new Error('the grid world camera is unavailable')
  return projection as GridProjection
}

/**
 * Where a named GRID CELL lands on screen right now.
 *
 * The fraction comes from the renderer's own camera (`worldCellFraction`, which divides
 * the cell centre by the live `worldView`), so the helper cannot drift from the camera
 * the way a spec-side re-derivation of the isometric transform would. The spec only
 * multiplies it by the canvas' real bounding box.
 */
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
  expect(fraction.fx, `cell ${String(gx)},${String(gy)} is off screen horizontally`).toBeGreaterThan(0)
  expect(fraction.fx).toBeLessThan(1)
  expect(fraction.fy, `cell ${String(gx)},${String(gy)} is off screen vertically`).toBeGreaterThan(0)
  expect(fraction.fy).toBeLessThan(1)
  return { x: box.x + fraction.fx * box.width, y: box.y + fraction.fy * box.height }
}

async function clickCell(page: Page, gx: number, gy: number): Promise<void> {
  const point = await cellPoint(page, gx, gy)
  await page.mouse.move(point.x, point.y)
  await page.mouse.click(point.x, point.y)
}

async function canvasHash(page: Page): Promise<string> {
  const shot = await page.getByTestId('studio-lot-canvas').locator('canvas').screenshot()
  return createHash('sha256').update(shot).digest('hex')
}

async function structure(page: Page) {
  return page.getByTestId('hollywood-performance').evaluate((node) => ({
    displayObjects: Number(node.getAttribute('data-display-objects')),
    dynamicActors: Number(node.getAttribute('data-dynamic-actors')),
    decodedBytes: Number(node.getAttribute('data-decoded-bytes')),
    drawCalls: Number(node.getAttribute('data-draw-calls')),
  }))
}

async function sessionBytes(page: Page): Promise<string> {
  const value = await page.evaluate((key) => localStorage.getItem(key), ACTIVE_SESSION_KEY)
  if (value === null) throw new Error('active session is missing')
  return value
}

// ── 1. BOOT ──────────────────────────────────────────────────────────────────

test('a fresh managed studio boots onto the whole grid property, labelled and readable', async ({
  page,
}) => {
  const runtime = watchRuntime(page)
  await seed(page)

  // The grid world, not the plate: the plate renderer has no parcel substrate at all.
  const debug = await gridDebug(page)
  expect(debug.parcelZoneIds).toEqual([
    'backlot-apron',
    'north-back-lot',
    'north-court',
    'north-lawn',
    'south-lawn',
    'stage-south',
    'west-lawn',
  ])
  expect(debug.placedFacilityIds).toEqual([])

  // WHOLE-PROPERTY FRAMING: the default camera shows the entire 28×26 lot. The world's
  // extent in screen pixels is (W+D)·halfTile wide and (W+D)·halfTile tall.
  const projection = await gridProjection(page)
  expect(projection.lotWidth).toBe(28)
  expect(projection.lotDepth).toBe(26)
  const lotPixelWidth = (projection.lotWidth + projection.lotDepth) * (projection.tileWidth / 2)
  const lotPixelHeight = (projection.lotWidth + projection.lotDepth) * (projection.tileHeight / 2)
  expect(projection.worldView.width).toBeGreaterThanOrEqual(lotPixelWidth)
  expect(projection.worldView.height).toBeGreaterThanOrEqual(lotPixelHeight)

  // …and it is the OPERATIONS reading distance, so every building wears its name.
  expect(debug.lodBand).toBe('operations')
  expect(debug.visibleBuildingLabels).toBe(8) // nine places; the Annex parcel carries its own caption

  // The companion names every destination on the same property, buildings and ground.
  await expect(page.getByTestId('lot-companion-nav')).toBeVisible()
  for (const parcelId of debug.parcelZoneIds) {
    await expect(page.getByTestId(`lot-nav-parcel-${parcelId}`)).toBeVisible()
  }
  // …and it is the REVEAL-ON-FOCUS semantic companion the grid world ships: clipped
  // out of the visual layout, and fully operable from the keyboard alone. Every parcel
  // is reachable there, which is the non-pointer path this milestone owes the canvas.
  const groundRow = page.getByTestId(`lot-nav-parcel-${BUILD_PARCEL}`)
  await groundRow.focus()
  await expect(groundRow).toBeFocused()
  await expect(page.locator('.lot-companion')).toHaveCSS('position', 'static')
  await groundRow.press('Enter')
  await expect(page.getByTestId(`lot-parcel-inspector-${BUILD_PARCEL}`)).toBeVisible()
  await expect(page.getByTestId('lot-parcel-inspector-heading')).toBeFocused()

  // STRUCTURAL TUPLE — fixture: "grid managed-idle, Week 0, whole-property framing".
  // Freshly measured for this world at this fixture. It is NOT comparable with the
  // plate's 30/13/11,096,896 tuple: a different world, measured on purpose.
  const measured = await structure(page)
  expect(measured).toEqual(GRID_MANAGED_IDLE_STRUCTURE)

  expect(runtime.pageErrors).toEqual([])
  expect(runtime.consoleErrors).toEqual([])
})

// ── 2. INSPECT ───────────────────────────────────────────────────────────────

test('clicking a building in the canvas lands its in-world panel and navigates nowhere', async ({
  page,
}) => {
  const runtime = watchRuntime(page)
  await seed(page)

  // Stage 7 stands at grid (17,2)–(20,5). Click its own ground, through the helper.
  await clickCell(page, 18, 3)

  await expect(page.getByTestId('lot-building-inspector-stage-a')).toBeVisible()
  await expect(page.getByTestId('lot-building-inspector-status')).toContainText(
    'no picture is shooting here',
  )
  // No navigation: the lot is still the mounted screen, and no deep surface opened.
  await expect(page.getByTestId('studio-lot-screen')).toBeVisible()
  await expect(page.getByTestId('dash-week')).toHaveCount(0)
  await expect(page.getByTestId('casting-room')).toHaveCount(0)
  expect((await gridDebug(page)).selectedPlaceId).toBe('stage-7')

  // The Theater is a different place and lands its own panel, still in the world.
  await clickCell(page, 4, 17)
  await expect(page.getByTestId('lot-building-inspector-theater')).toBeVisible()
  await expect(page.getByTestId('studio-lot-screen')).toBeVisible()

  expect(runtime.pageErrors).toEqual([])
  expect(runtime.consoleErrors).toEqual([])
})

// ── 3. BUILD ─────────────────────────────────────────────────────────────────

test('the whole build loop runs in the world: parcel → catalog → ghost → commit → operational', async ({
  page,
}) => {
  const runtime = watchRuntime(page)
  await seed(page)

  // ── the parcel, clicked on the canvas ──
  const inside = {
    gx: BUILD_PARCEL_RECT.x0 + 1,
    gy: BUILD_PARCEL_RECT.y0 + 1,
  }
  await clickCell(page, inside.gx, inside.gy)
  await expect(page.getByTestId(`lot-parcel-inspector-${BUILD_PARCEL}`)).toBeVisible()
  await expect(page.getByTestId(`lot-parcel-inspector-${BUILD_PARCEL}`)).toHaveAttribute(
    'data-parcel-status',
    'vacant',
  )
  await expect(page.getByTestId('lot-parcel-inspector-facts')).toContainText(
    'trucks can reach this site',
  )
  expect((await gridDebug(page)).selectedParcelId).toBe(BUILD_PARCEL)

  // ── the catalog ──
  await page.getByTestId(`lot-parcel-build-${BUILD_PARCEL}`).click()
  await expect(page.getByTestId('lot-build-catalog')).toBeVisible()
  const entry = page.getByTestId(`lot-build-blueprint-${ANNEX_BLUEPRINT}`)
  await expect(entry).toContainText('Development & Casting Annex')
  await expect(entry).toContainText('$780,000')
  await expect(entry).toContainText('13 weeks')

  // ── the ghost, painted on the world from a live query ──
  const beforeGhost = await sessionBytes(page)
  await entry.click()
  await expect(page.getByTestId('lot-build-quote')).toContainText('$780,000')
  await expect(page.getByTestId('lot-build-quote')).toContainText('$3,500 once operational')
  await expect(page.getByTestId('lot-build-quote')).toContainText('+1 shared slot')
  await expect(page.getByTestId('lot-build-verdict')).toHaveAttribute('data-ok', 'true')
  const ghosted = await gridDebug(page)
  expect(ghosted.buildModeParcelId).toBe(BUILD_PARCEL)
  expect(ghosted.previewOk).toBe(true)
  expect(ghosted.previewOrigin).toEqual({ gx: BUILD_PARCEL_RECT.x0, gy: BUILD_PARCEL_RECT.y0 })
  // A ghost is a UI-only layer: not one byte of the session moved.
  expect(await sessionBytes(page)).toBe(beforeGhost)

  // ── keyboard-driven origin nudging, the non-pointer path ──
  const pad = page.getByTestId('lot-build-origin')
  await pad.focus()
  await pad.press('ArrowRight')
  await expect(pad).toHaveAttribute('data-origin-gx', String(BUILD_PARCEL_RECT.x0 + 1))
  await pad.press('ArrowDown')
  await expect(pad).toHaveAttribute('data-origin-gy', String(BUILD_PARCEL_RECT.y0 + 1))
  expect((await gridDebug(page)).previewOrigin).toEqual({
    gx: BUILD_PARCEL_RECT.x0 + 1,
    gy: BUILD_PARCEL_RECT.y0 + 1,
  })

  // ── pointer-driven origin, through the same helper ──
  await page.mouse.move(...(await pointOf(page, BUILD_PARCEL_RECT.x0, BUILD_PARCEL_RECT.y0)))
  await expect(pad).toHaveAttribute('data-origin-gx', String(BUILD_PARCEL_RECT.x0))
  await expect(pad).toHaveAttribute('data-origin-gy', String(BUILD_PARCEL_RECT.y0))

  // ── commit ──
  // The canvas capture is a LIVENESS witness, not a determinism claim: a composited
  // WebGL surface is not guaranteed byte-stable frame to frame even under reduced
  // motion, so the proof that the site actually painted is the structural one below
  // (the placement's own caption object, named from truth). This only catches a world
  // that did not repaint at all.
  const stillCanvas = await canvasHash(page)
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

  // The SAME mounted world now paints a construction site on those cells.
  const built = await gridDebug(page)
  expect(built.placedFacilityIds).toEqual([1])
  expect(built.buildModeParcelId).toBeNull()
  expect(built.previewOrigin).toBeNull()
  expect(built.placementLabels).toEqual(['DEVELOPMENT & CASTING ANNEX · 13 WEEKS LEFT'])
  expect(await canvasHash(page)).not.toBe(stillCanvas)

  // The commit went through the App owner and autosaved: the session moved.
  const afterCommit = await sessionBytes(page)
  expect(afterCommit).not.toBe(beforeGhost)
  const replay = importSaveJson(afterCommit)
  expect(replay.ok).toBe(true)
  if (!replay.ok) throw new Error(replay.error)
  expect(exportSaveJson(replay.state)).toBe(afterCommit)
  expect(studioPlacement(replay.state).placements).toHaveLength(1)

  // ── thirteen advances ──
  for (let week = 0; week < 13; week++) {
    await page.getByTestId('lot-advance-week').click()
    await expect(page.locator('.lot-sub')).toHaveText(new RegExp(`Week ${String(week + 1)}$`))
  }

  // The panel stayed open across all thirteen advances and simply became true.
  await expect(page.getByTestId(`lot-parcel-inspector-${BUILD_PARCEL}`)).toHaveAttribute(
    'data-parcel-status',
    'operational',
  )

  // …and the parcel keeps its own hit area under the facility it now carries. Cell
  // (3,22) is chosen deliberately: the far corner of this parcel passes UNDER the Studio
  // Gate's silhouette, and a building always wins an overlap with ground (law 10's
  // precedence, not a defect) — so the proof uses ground the gate does not cover.
  await clickCell(page, 4, 17) // the Theater, to take the rail away from the parcel
  await expect(page.getByTestId('lot-building-inspector-theater')).toBeVisible()
  // The picture-guidance card owns the desk's corner of the screen and, expanded at this
  // viewport, its body reaches down over part of the South Lawn. Fold it to its header
  // with the same control the player has, so this proof keeps using the exact ground it
  // was written for — and so the fold is proven to actually give the world back.
  await page.getByTestId('lot-picture-guidance-toggle').click()
  await expect(page.getByTestId('lot-picture-guidance-toggle')).toHaveAttribute(
    'aria-expanded',
    'false',
  )
  await clickCell(page, BUILD_PARCEL_RECT.x0, BUILD_PARCEL_RECT.y1)
  await expect(page.getByTestId(`lot-parcel-inspector-${BUILD_PARCEL}`)).toHaveAttribute(
    'data-parcel-status',
    'operational',
  )
  await expect(page.getByTestId('lot-parcel-inspector-status')).toContainText('is operational')
  await expect(page.getByTestId('lot-parcel-inspector-facts')).toContainText('$3,500/week')
  const finished = await gridDebug(page)
  expect(finished.placementLabels).toEqual(['DEVELOPMENT & CASTING ANNEX · OPERATIONAL'])

  // ── a SECOND annex, on different ground ──
  // The V11 single-Annex cap was marathon law; the conversion mission supersedes it.
  // Both facilities must stand on the property at once, in two states, in two panels.
  const secondParcel = 'west-lawn'
  await page.getByTestId(`lot-nav-parcel-${secondParcel}`).focus()
  await page.getByTestId(`lot-nav-parcel-${secondParcel}`).press('Enter')
  await page.getByTestId(`lot-parcel-build-${secondParcel}`).click()
  await page.getByTestId(`lot-build-blueprint-${ANNEX_BLUEPRINT}`).click()
  await expect(page.getByTestId('lot-build-verdict')).toHaveAttribute('data-ok', 'true')
  const beforeSecond = await canvasHash(page)
  await page.getByTestId('lot-build-commit').click()
  await expect(page.getByTestId('lot-build-receipt')).toContainText('completes in Week 26')

  const both = await gridDebug(page)
  expect(both.placedFacilityIds).toEqual([1, 2])
  // Both captions are painted on the world at once, in their two different states.
  // (`placementLabels` is sorted for stability, so the second annex sorts first.)
  expect(both.placementLabels).toEqual([
    'DEVELOPMENT & CASTING ANNEX 2 · 13 WEEKS LEFT',
    'DEVELOPMENT & CASTING ANNEX · OPERATIONAL',
  ])
  expect(await canvasHash(page)).not.toBe(beforeSecond)
  await expect(page.getByTestId(`lot-parcel-inspector-${secondParcel}`)).toHaveAttribute(
    'data-parcel-status',
    'building',
  )
  // …and the first one is still standing, operational, on its own ground.
  await clickCell(page, BUILD_PARCEL_RECT.x0, BUILD_PARCEL_RECT.y1)
  await expect(page.getByTestId(`lot-parcel-inspector-${BUILD_PARCEL}`)).toHaveAttribute(
    'data-parcel-status',
    'operational',
  )

  // The capacity the studio actually gained shows on the shared facility itself.
  await clickCell(page, 4, 3) // Development, at grid (3,2)–(5,3)
  await expect(page.getByTestId('lot-building-inspector-writers')).toBeVisible()
  await expect(page.getByTestId('lot-building-inspector-facts')).toContainText(
    'Development & Casting Annex',
  )

  expect(runtime.pageErrors).toEqual([])
  expect(runtime.consoleErrors).toEqual([])
})

async function pointOf(page: Page, gx: number, gy: number): Promise<[number, number]> {
  const point = await cellPoint(page, gx, gy)
  return [point.x, point.y]
}

// ── 4. CAMERA GRAMMAR ────────────────────────────────────────────────────────
//
// The red-team finding this pays off: `focusPlace` answered a selection by setting zoom
// to TWICE the whole-property fit and re-centring, but only for the three plate-era
// retained contexts that route through it (Administration/publicity, the Gate, the
// Annex). M1.5's generic building inspectors changed the camera not at all. Two grammars
// for one gesture — and the doubled zoom discarded whatever framing the player had
// arranged, with no player-facing way back (the reset lived on an undocumented `R`
// against an aria-hidden canvas).
//
// One grammar now: selection PANS, never zooms, and one visible control always returns
// the whole property. Both halves proved here on the shipped world, in a real browser.

/** Zoom the live camera in by dispatching real wheel events at a canvas point. */
async function wheelZoomIn(page: Page, notches: number): Promise<void> {
  await page.evaluate((count) => {
    const canvas = document.querySelector<HTMLCanvasElement>(
      '[data-testid="studio-lot-canvas"] canvas',
    )
    if (canvas === null) throw new Error('the lot canvas is absent')
    const box = canvas.getBoundingClientRect()
    for (let i = 0; i < count; i++) {
      canvas.dispatchEvent(new WheelEvent('wheel', {
        deltaY: -120,
        clientX: box.x + box.width / 2,
        clientY: box.y + box.height / 2,
        bubbles: true,
        cancelable: true,
      }))
    }
  }, notches)
}

test('a selection pans the camera and never zooms it, and the whole property is one control away', async ({
  page,
}) => {
  const runtime = watchRuntime(page)
  await seed(page)

  // The opening framing: the whole graded property, at the reading distance BOOT chose.
  const opening = await gridProjection(page)
  const untouchedSession = await sessionBytes(page)

  // ── the player takes the camera somewhere of their own ──
  await wheelZoomIn(page, 6)
  const chosen = await gridProjection(page)
  expect(chosen.zoom).toBeGreaterThan(opening.zoom)

  // ── (a) the Gate: a plate-era retained context, the exact `focusPlace` route ──
  // Its arch straddles the boulevard at grid (8,23)–(10,23).
  await clickCell(page, 9, 23)
  await expect(page.getByTestId('hollywood-gate-context')).toBeVisible()
  // THE REPAIR. Before it, this selection set zoom to twice the whole-property fit —
  // roughly a third of the studio thrown off-screen without asking.
  expect((await gridProjection(page)).zoom).toBe(chosen.zoom)

  // ── (b) Administration: the other retained context on the same route ──
  // The office block stands at grid (9,2)–(11,4).
  await clickCell(page, 10, 3)
  await expect(page.getByTestId('studio-lot-screen')).toBeVisible()
  expect((await gridProjection(page)).zoom).toBe(chosen.zoom)

  // ── (c) an ordinary M1.5 inspector, which never moved the camera — still doesn't ──
  await clickCell(page, 4, 17) // the Theater
  await expect(page.getByTestId('lot-building-inspector-theater')).toBeVisible()
  expect((await gridProjection(page)).zoom).toBe(chosen.zoom)

  // ── (d) THE WAY BACK, in the world, with a name and a shortcut ──
  const wholeProperty = page.getByTestId('lot-camera-home')
  await expect(wholeProperty).toBeVisible()
  await expect(wholeProperty).toHaveText(/Whole property/)
  await expect(wholeProperty).toHaveAttribute('aria-keyshortcuts', 'R')
  await expect(wholeProperty).toHaveAccessibleName(
    'Show the whole property. Keyboard shortcut R.',
  )
  await wholeProperty.click()
  expect(await gridProjection(page)).toEqual(opening)
  // …and it commanded the camera and nothing else: the panel the player was reading is
  // still open, and not one byte of the session moved.
  await expect(page.getByTestId('lot-building-inspector-theater')).toBeVisible()
  expect(await sessionBytes(page)).toBe(untouchedSession)

  // ── (e) the shortcut the control names is the shortcut the world answers ──
  await wheelZoomIn(page, 4)
  expect((await gridProjection(page)).zoom).toBeGreaterThan(opening.zoom)
  await page.keyboard.press('r')
  await expect
    .poll(async () => (await gridProjection(page)).zoom)
    .toBe(opening.zoom)
  expect(await gridProjection(page)).toEqual(opening)
  expect(await sessionBytes(page)).toBe(untouchedSession)

  // ── (f) a recovery control has to survive the conditions a player gets lost in ──
  //
  // Law 26's governed compact viewports and effective 200% zoom, checked with REAL
  // pointer hits: Playwright's click fails outright if anything covers the control, so
  // "it still reframes the world" is at the same time the proof that nothing occludes it
  // and that its hit target is acquirable. The framing it restores is measured PER
  // VIEWPORT rather than compared to the 1280×900 one — the whole-property fit is a
  // function of the canvas box, and at a small enough box it meets the world's absolute
  // minimum zoom, which is a fact about the camera, not a failure of the control.
  const reframes = async (label: string) => {
    await expect(wholeProperty, label).toBeVisible()
    const hit = await wholeProperty.boundingBox()
    if (hit === null) throw new Error(`${label}: the whole-property control has no box`)
    // A target a pointer can actually acquire, wholly inside the viewport it belongs to.
    expect(hit.width, label).toBeGreaterThanOrEqual(24)
    expect(hit.height, label).toBeGreaterThanOrEqual(24)
    expect(hit.x, label).toBeGreaterThanOrEqual(0)
    expect(hit.y, label).toBeGreaterThanOrEqual(0)
    await wholeProperty.click()
    const framed = await gridProjection(page)
    await wheelZoomIn(page, 5)
    expect((await gridProjection(page)).zoom, label).toBeGreaterThan(framed.zoom)
    await wholeProperty.click()
    await expect.poll(async () => (await gridProjection(page)).zoom, { message: label })
      .toBe(framed.zoom)
    expect(await gridProjection(page), label).toEqual(framed)
  }
  for (const viewport of [{ width: 960, height: 540 }, { width: 1280, height: 720 }]) {
    await page.setViewportSize(viewport)
    await reframes(`${viewport.width}×${viewport.height}`)
  }
  await page.evaluate(() => { document.documentElement.style.zoom = '2' })
  await reframes('effective 200% zoom')
  await page.evaluate(() => { document.documentElement.style.zoom = '1' })

  expect(runtime.pageErrors).toEqual([])
  expect(runtime.consoleErrors).toEqual([])
})

// The freshly measured tuple for the grid managed-idle fixture. Filled from a real run
// (see the report accompanying this milestone); a change here is a real change in what
// the world costs to draw, not a re-baseline of convenience.
//
// M3-UI RE-PIN — one object, one named reason. Presence on the Lot V1 adds exactly one
// display object to this world: `tier:presence-queue`, the SINGLE shared Graphics layer
// that paints the ground cue under every waiting queue (one layer for the whole
// property, deliberately not one object per person). Nothing else moved — the same 14
// dynamic actors, the same 8,545,720 decoded bytes and the same 4 draw calls, which is
// what proves the delta is that one layer and not a renderer leak. Presence MOVES
// existing bodies; it creates none, which the presence suite's own Week-0/Week-1 tuples
// prove across a whole week playback.
const GRID_MANAGED_IDLE_STRUCTURE = {
  displayObjects: 173,
  dynamicActors: 14,
  decodedBytes: 8_545_720,
  drawCalls: 4,
}
