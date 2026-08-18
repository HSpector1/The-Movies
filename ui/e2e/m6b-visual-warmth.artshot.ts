// ── C1-M6b art-review capture (NOT a spec) ───────────────────────────────────
//
// Deliberately named `*.artshot.ts` so the shipped Playwright config — which matches
// `*.spec.ts` — never picks it up. It asserts nothing about the art: it only stands the
// world up in five states and photographs it, so the PM can perform the review.

import { expect, test, type Locator, type Page } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import {
  advanceWeek,
  exportSaveJson,
  foundManagedStudioAction,
  foundingApplicantCards,
  newGame,
  placeFacilityAction,
  placementQuote,
  studioPlacement,
  signContractAction,
  type CreativeRole,
  type GameState,
  type PlacementRequest,
} from '../src/engine/adapter.ts'

const BASE_URL = process.env.M6B_BASE_URL ?? 'http://localhost:5181'
const OUT_DIR =
  process.env.M6B_OUT_DIR ??
  '/private/tmp/claude-501/-Users-bruce-The-Movies---Autonomous-Marathon/66a9f1d5-efd0-4849-8a32-3f18ec703801/scratchpad/m6-art'

const ACTIVE_SESSION_KEY = 'project-studio.active-session.v4'
const ACTIVE_SESSION_CORRUPT_KEY = 'project-studio.active-session.v4.corrupt'
const LOT_FLAG_KEY = 'project-studio.flags.studio-lot-overview'
const HOLLYWOOD_FLAG_KEY = 'project-studio.flags.operation-hollywood'
const TYCOON_FLAG_KEY = 'project-studio.flags.tycoon-world'

const BUILD_PARCEL = 'south-lawn'
const OFFICE_BLUEPRINT = 'development-office-2'

test.describe.configure({ timeout: 300_000 })

mkdirSync(OUT_DIR, { recursive: true })

// ── fixtures, built by calling the engine's own actions ──────────────────────

function managedIdle(): GameState {
  const required: Readonly<Record<CreativeRole, number>> = {
    actor: 3,
    director: 1,
    writer: 1,
    craft: 1,
  }
  let state: GameState = newGame('c1-m6b-visual-warmth')
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

/** The first legal placement of a named blueprint on the South Lawn. */
function requestOn(state: GameState, blueprintId: string): PlacementRequest {
  const parcel = studioPlacement(state).parcels.find((p) => p.id === BUILD_PARCEL)
  if (parcel === undefined) throw new Error('south-lawn parcel is absent')
  for (let gy = parcel.rect.y0; gy <= parcel.rect.y1; gy++) {
    for (let gx = parcel.rect.x0; gx <= parcel.rect.x1; gx++) {
      const request = { blueprintId, origin: { gx, gy } }
      if (placementQuote(state, request).ok) return request
    }
  }
  throw new Error(`no legal origin for ${blueprintId} on ${BUILD_PARCEL}`)
}

function place(state: GameState, blueprintId: string): GameState {
  const committed = placeFacilityAction(state, requestOn(state, blueprintId))
  if (!committed.ok) throw new Error(committed.error)
  return committed.next
}

function advance(state: GameState, weeks: number): GameState {
  let current = state
  for (let i = 0; i < weeks; i++) current = advanceWeek(current).next
  return current
}

const IDLE = managedIdle()
const PLACED = place(IDLE, OFFICE_BLUEPRINT)
const PLACED_ORIGIN = studioPlacement(PLACED).placements.at(-1)!.cells[0]!
/** A studio mid-build: the construction site body, at a readable fraction of done. */
const BUILDING = advance(PLACED, 4)
/** The same studio after the office is finished: an operational placed facility. */
const OPERATIONAL = advance(PLACED, 9)

const SAVE_IDLE = exportSaveJson(IDLE)
const SAVE_BUILDING = exportSaveJson(BUILDING)
const SAVE_OPERATIONAL = exportSaveJson(OPERATIONAL)

// ── harness ───────────────────────────────────────────────────────────────────

/** The same route-rewrite seam the accepted grid specs use to reach the live renderer. */
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

async function seed(page: Page, save: string): Promise<void> {
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
  }, {
    sessionKey: ACTIVE_SESSION_KEY,
    corruptKey: ACTIVE_SESSION_CORRUPT_KEY,
    lotFlag: LOT_FLAG_KEY,
    hollywoodFlag: HOLLYWOOD_FLAG_KEY,
    tycoonFlag: TYCOON_FLAG_KEY,
    save,
  })
  // Reduced motion freezes the ambient crowd, which is what makes a capture stable.
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto(`${BASE_URL}/`)
  await expect(page.getByTestId('studio-lot-screen')).toBeVisible({ timeout: 60_000 })
  await expect(page.getByTestId('studio-lot-canvas').locator('canvas')).toHaveCount(1)
  await expect(page.getByText('Preparing the lot…', { exact: true })).toHaveCount(0)
  await page.waitForTimeout(1_800)
}

async function shot(page: Page, name: string): Promise<void> {
  await page.screenshot({ path: join(OUT_DIR, `${name}.png`) })
}

/** Drive the live camera directly — presentation only; it commits nothing. */
async function camera(page: Page, gx: number, gy: number, zoom: number): Promise<void> {
  await page.evaluate(
    ({ gx, gy, zoom }) => {
      const root = globalThis as typeof globalThis & {
        __projectStudioGridWorld?: {
          tycoonScene?: {
            cameras: {
              main: { setZoom: (z: number) => void; centerOn: (x: number, y: number) => void }
            }
          }
        }
      }
      const scene = root.__projectStudioGridWorld?.tycoonScene
      if (!scene) throw new Error('tycoon scene handle is absent')
      scene.cameras.main.setZoom(zoom)
      scene.cameras.main.centerOn((gx - gy) * 64, (gx + gy) * 32)
    },
    { gx, gy, zoom },
  )
  await page.waitForTimeout(800)
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

async function foldGuidance(page: Page): Promise<void> {
  const toggle = page.getByTestId('lot-picture-guidance-toggle')
  if ((await toggle.count()) === 0) return
  if ((await toggle.getAttribute('aria-expanded')) === 'true') await toggle.click()
}

// ── the five captures ─────────────────────────────────────────────────────────

test('a — whole property at the home camera', async ({ page }) => {
  await seed(page, SAVE_IDLE)
  await shot(page, 'a-whole-property-home')
})

test('b — mid zoom on the founding cluster, the stages, and the backlot', async ({ page }) => {
  await seed(page, SAVE_IDLE)
  await camera(page, 6, 7, 1.05)
  await shot(page, 'b1-founding-cluster')
  await camera(page, 20, 8, 0.95)
  await shot(page, 'b2-stages-and-avenue')
  await camera(page, 23, 19, 1.0)
  await shot(page, 'b3-backlot-and-service-yard')
  await camera(page, 10, 22, 1.15)
  await shot(page, 'b4-gate-and-boulevard')
})

test('c — a close read of a placed facility and its sign', async ({ page }) => {
  await seed(page, SAVE_OPERATIONAL)
  await camera(page, PLACED_ORIGIN.gx + 1.5, PLACED_ORIGIN.gy + 1, 1.55)
  await shot(page, 'c1-placed-facility-close')
  await camera(page, PLACED_ORIGIN.gx + 1.5, PLACED_ORIGIN.gy + 1, 1.0)
  await shot(page, 'c2-placed-facility-in-context')
  await camera(page, 13.5, 12.5, 0.6)
  await shot(page, 'c3-whole-property-with-facility')
})

test('d — the placement ghost over the warmed ground', async ({ page }) => {
  await seed(page, SAVE_IDLE)
  await foldGuidance(page)
  const inside = await cellPoint(page, 4, 20)
  await page.mouse.click(inside.x, inside.y)
  await expect(page.getByTestId(`lot-parcel-inspector-${BUILD_PARCEL}`)).toBeVisible()
  await page.getByTestId(`lot-parcel-build-${BUILD_PARCEL}`).click()
  await expect(page.getByTestId('lot-build-catalog')).toBeVisible()
  await page.getByTestId(`lot-build-blueprint-${OFFICE_BLUEPRINT}`).click()
  await expect(page.getByTestId('lot-build-verdict')).toBeVisible()
  await page.waitForTimeout(600)
  await shot(page, 'd1-placement-ghost-home')
  await camera(page, 5.5, 20.5, 1.35)
  await page.waitForTimeout(500)
  await shot(page, 'd2-placement-ghost-close')
  // …and the same ghost standing where it is NOT legal, for the refusal colour.
  const onRoad = await cellPoint(page, 9, 21)
  await page.mouse.move(onRoad.x, onRoad.y)
  await page.waitForTimeout(600)
  await shot(page, 'd3-placement-ghost-refused')
})

test('e — the construction-site body', async ({ page }) => {
  await seed(page, SAVE_BUILDING)
  await camera(page, PLACED_ORIGIN.gx + 1.5, PLACED_ORIGIN.gy + 1, 1.45)
  await shot(page, 'e1-construction-site')
  await camera(page, PLACED_ORIGIN.gx + 1.5, PLACED_ORIGIN.gy + 1, 0.9)
  await shot(page, 'e2-construction-site-in-context')
})

// ── the structural reading, for the PM's re-pin wave ─────────────────────────
//
// NOT a pin, and deliberately not comparable with either accepted grid tuple: this is
// THIS file's own fixture, and law 25 says a tuple belongs to the fixture it was measured
// on. It exists so the report can state the DIRECTION and MAGNITUDE of the move the
// dressing pass causes, rather than guessing at it.

test('measure — the structural tuple of this pass, on this fixture', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('project-studio.flags.studio-lot-identity-proof', '1')
  })
  await seed(page, SAVE_IDLE)
  const panel = page.getByTestId('hollywood-performance')
  await expect(panel).toBeVisible({ timeout: 30_000 })
  await expect(panel).not.toHaveAttribute('data-draw-calls', '0', { timeout: 30_000 })
  const tuple = await panel.evaluate((node) => ({
    displayObjects: Number(node.getAttribute('data-display-objects')),
    dynamicActors: Number(node.getAttribute('data-dynamic-actors')),
    decodedBytes: Number(node.getAttribute('data-decoded-bytes')),
    drawCalls: Number(node.getAttribute('data-draw-calls')),
  }))
  console.log('M6B_STRUCTURE', JSON.stringify(tuple))
})
