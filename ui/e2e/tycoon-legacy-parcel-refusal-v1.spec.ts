// ── C1-M8 — the Annex's ground refuses a building, in the shipped world ──────
//
// THE DEFECT (red-team, C1-M8): the move flow roams the whole property by design,
// and nothing stopped a player carrying a building they had paid for onto the
// legacy Annex Expansion Parcel. The world said the ground was legal, the commit
// was accepted, and then the building CEASED TO EXIST on screen: no body, no
// label, no inspector, neither verb, no way to demolish it, the Annex contract
// permanently unstartable, and the weekly operating cost still billed. No error.
//
// This spec is the browser half of the fix (the engine half is
// `tests/legacy-parcel-ground.test.ts`). Unit-green is not done — campaign law —
// so everything below happens on the real canvas, in the shipped flow, with the
// same keyboard the player has:
//
//   • the ghost carried onto that pad reads REFUSED, in the studio's own words,
//     with the commit control disabled;
//   • Escape puts the building back down and the session bytes are unchanged;
//   • the building is still standing where it was, still selectable, still
//     offering BOTH verbs — it was never anywhere else;
//   • and the Annex contract still answers for its own ground: Vacant, startable.
//
// LAW 25: this suite names its own fixtures and measures no structural tuple.

import { expect, test, type Locator, type Page } from '@playwright/test'
import {
  advanceWeek,
  exportSaveJson,
  foundManagedStudioAction,
  foundingApplicantCards,
  importSaveJson,
  newGame,
  placeFacilityAction,
  placementQuote,
  signContractAction,
  studioDevelopment,
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

/** A building with no business on the Annex's ground: an ordinary office. */
const OFFICE_2 = 'development-office-2'
/** The legacy Annex Expansion Parcel's own origin. */
const LEGACY_ORIGIN = { gx: 7, gy: 15 }
/** Ordinary open ground the same building may legally be carried to. */
const WEST_LAWN = { gx: 0, gy: 9 }
/** The studio's words when that ground is asked for. Pinned verbatim. */
const REFUSAL = 'This ground is held for the studio’s Annex contract.'

test.describe.configure({ timeout: 180_000 })

// ── the named fixture ────────────────────────────────────────────────────────

const COUNTS: Readonly<Record<CreativeRole, number>> = {
  actor: 3,
  director: 1,
  writer: 3,
  craft: 1,
}

function managedStudio(seed: string): GameState {
  let state: GameState = newGame(seed)
  const cards = foundingApplicantCards(state)
  for (const role of ['actor', 'director', 'writer', 'craft'] as const) {
    const selected = cards.filter((card) => card.profile.role === role).slice(0, COUNTS[role])
    if (selected.length !== COUNTS[role]) throw new Error(`fixture lacks ${role} applicants`)
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

/** A Development Office II, bought and completed on the south lawn. */
function standingOfficeState(seed: string): GameState {
  const founded = managedStudio(seed)
  const parcel = studioPlacement(founded).parcels.find((candidate) => candidate.id === 'south-lawn')
  if (parcel === undefined) throw new Error('the south lawn is missing from the property')
  let request: { blueprintId: string; origin: { gx: number; gy: number } } | null = null
  for (let gy = parcel.rect.y0; gy <= parcel.rect.y1 && request === null; gy++) {
    for (let gx = parcel.rect.x0; gx <= parcel.rect.x1 && request === null; gx++) {
      const candidate = { blueprintId: OFFICE_2, origin: { gx, gy } }
      if (placementQuote(founded, candidate).ok) request = candidate
    }
  }
  if (request === null) throw new Error('no legal office site on the south lawn')
  const committed = placeFacilityAction(founded, request)
  if (!committed.ok) throw new Error(committed.error)
  let state = committed.next
  const completesWeek = studioPlacement(state).placements[0]!.completesWeek
  while (state.market.tick < completesWeek) state = advanceWeek(state).next
  if (studioPlacement(state).placements[0]!.status !== 'operational') {
    throw new Error('fixture office never completed')
  }
  // The premise of the whole spec: this ground is free and the contract is startable.
  if (studioDevelopment(state).status !== 'vacant') throw new Error('fixture Annex is not vacant')
  return state
}

function saveOf(state: GameState): string {
  const bytes = exportSaveJson(state)
  const replay = importSaveJson(bytes)
  if (!replay.ok || replay.converted || exportSaveJson(replay.state) !== bytes) {
    throw new Error('fixture does not replay byte-identically')
  }
  return bytes
}

const STANDING_STATE = standingOfficeState('tycoon-legacy-parcel-refusal-v1')
const STANDING_SAVE = saveOf(STANDING_STATE)
const STANDING_PLACEMENT = studioPlacement(STANDING_STATE).placements[0]!
const STANDING_WORLD_ID = `placed-${String(STANDING_PLACEMENT.id)}`

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
    save: STANDING_SAVE,
  })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto(`${GRID_BASE_URL}/`)
  await expect(page.getByTestId('studio-lot-screen')).toBeVisible()
  await expect(page.getByTestId('studio-lot-canvas').locator('canvas')).toHaveCount(1)
  await expect(page.getByText('Preparing the lot…', { exact: true })).toHaveCount(0)
  await expect(page.getByTestId('dev-error')).toHaveCount(0)
  // The guidance card's expanded body reaches over ground this journey uses.
  await page.getByTestId('lot-picture-guidance-toggle').click()
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

type GridDebug = {
  selectedPlaceId: string | null
  buildModeParcelId: string | null
  movingPlacementId: number | null
  previewOrigin: { gx: number; gy: number } | null
  previewOk: boolean | null
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

/** The front corner of the standing facility — ground nothing behind it covers. */
function frontCellOf(cells: readonly { gx: number; gy: number }[]) {
  return [...cells].sort((a, b) => a.gx + a.gy - (b.gx + b.gy)).at(-1)!
}

/**
 * Walk the carried ghost to an exact origin with the keyboard pad the player has.
 * No pixel guessing: the pad publishes the draft origin it is holding.
 */
async function nudgeOriginTo(page: Page, target: { gx: number; gy: number }): Promise<void> {
  const pad = page.getByTestId('lot-build-origin')
  for (let guard = 0; guard < 120; guard++) {
    const gx = Number(await pad.getAttribute('data-origin-gx'))
    const gy = Number(await pad.getAttribute('data-origin-gy'))
    if (gx === target.gx && gy === target.gy) return
    if (gx < target.gx) await pad.press('ArrowRight')
    else if (gx > target.gx) await pad.press('ArrowLeft')
    else if (gy < target.gy) await pad.press('ArrowDown')
    else await pad.press('ArrowUp')
  }
  throw new Error('could not walk the ghost to the target origin')
}

// ── the journey ──────────────────────────────────────────────────────────────

test('a building carried onto the Annex pad is refused, and stays where it was', async ({
  page,
}) => {
  const runtime = watchRuntime(page)
  await seed(page)

  const before = await sessionState(page)
  const placed = studioPlacement(before).placements[0]!
  const bytesBefore = await page.evaluate((key) => localStorage.getItem(key), ACTIVE_SESSION_KEY)
  const worldBefore = await gridDebug(page)

  // ── the building is real: a body, its own panel, and BOTH verbs ──
  const front = frontCellOf(placed.cells)
  await clickCell(page, front.gx, front.gy)
  await expect(page.getByTestId(`lot-building-inspector-${STANDING_WORLD_ID}`)).toBeVisible()
  await expect(page.getByTestId('lot-building-inspector-primary-move')).toBeEnabled()
  await expect(page.getByTestId('lot-building-inspector-primary-demolish')).toBeEnabled()
  await expect(page.getByTestId('lot-building-inspector-primary-demolish')).toContainText(
    'refund $300,000',
  )

  // ── picked up and carried onto the Annex's ground ──
  await page.getByTestId('lot-building-inspector-primary-move').click()
  await expect(page.getByTestId('lot-move-flow')).toBeVisible()
  await nudgeOriginTo(page, LEGACY_ORIGIN)
  await expect(page.getByTestId('lot-build-origin-cell')).toHaveText('7, 15')

  // THE WORLD REFUSES IT, in the studio's own words, with the commit shut.
  const verdict = page.getByTestId('lot-build-verdict')
  await expect(verdict).toHaveAttribute('data-ok', 'false')
  await expect(verdict).toHaveText(REFUSAL)
  await expect(page.getByTestId('lot-build-commit')).toBeDisabled()
  const carried = await gridDebug(page)
  expect(carried.previewOrigin).toEqual(LEGACY_ORIGIN)
  expect(carried.previewOk).toBe(false)
  expect(carried.movingPlacementId).toBe(placed.id)

  // A disabled commit commits nothing, even when clicked through.
  await page.getByTestId('lot-build-commit').click({ force: true }).catch(() => undefined)
  await expect(page.getByTestId('lot-move-flow')).toBeVisible()
  expect((await sessionState(page)).placement.facilities[0]!.origin).toEqual(placed.origin)

  // ── ESCAPE puts it back down, byte-neutral ──
  await page.getByTestId('lot-build-origin').press('Escape')
  await expect(page.getByTestId('lot-move-flow')).toHaveCount(0)
  expect(await page.evaluate((key) => localStorage.getItem(key), ACTIVE_SESSION_KEY)).toBe(
    bytesBefore,
  )

  // ── the building never went anywhere: body, panel, and both verbs again ──
  const after = await sessionState(page)
  const unchanged = studioPlacement(after).placements[0]!
  expect(unchanged.id).toBe(placed.id)
  expect(unchanged.parcelId).toBe(placed.parcelId)
  expect(unchanged.origin).toEqual(placed.origin)
  expect(after.studio.cash).toBe(before.studio.cash)

  const standing = await gridDebug(page)
  expect(standing.movingPlacementId).toBeNull()
  expect(standing.placedFacilityIds).toEqual([placed.id])
  // The world looks exactly as it did: same bodies, same labels, nothing dropped.
  expect(standing.placementLabels).toEqual(worldBefore.placementLabels)
  expect(standing.placedFacilityIds).toEqual(worldBefore.placedFacilityIds)

  await clickCell(page, 4, 3) // take the selection away, then come back to it
  await expect(page.getByTestId('lot-building-inspector-writers')).toBeVisible()
  await clickCell(page, front.gx, front.gy)
  await expect(page.getByTestId(`lot-building-inspector-${STANDING_WORLD_ID}`)).toBeVisible()
  await expect(page.getByTestId('lot-building-inspector-primary-move')).toBeEnabled()
  await expect(page.getByTestId('lot-building-inspector-primary-demolish')).toBeEnabled()

  // ── and the ground answers for its OWN contract, truthfully ──
  const contract = studioDevelopment(after)
  expect(contract.status).toBe('vacant')
  expect(contract.canStart).toBe(true)
  const annexRow = page.getByTestId('lot-nav-expansion')
  await annexRow.focus()
  await annexRow.press('Enter')
  await expect(page.getByTestId('lot-annex-context')).toBeVisible()
  await expect(page.getByTestId('lot-annex-status')).toContainText('Vacant')
  await expect(page.getByTestId('lot-annex-build')).toBeEnabled()

  expect(runtime.pageErrors).toEqual([])
  expect(runtime.consoleErrors).toEqual([])
})

// ── the same ground, asked for a second time, in the other direction ─────────

test('the refusal is the ground talking, not the building — the same move lands elsewhere', async ({
  page,
}) => {
  const runtime = watchRuntime(page)
  await seed(page)
  const before = await sessionState(page)
  const placed = studioPlacement(before).placements[0]!

  const front = frontCellOf(placed.cells)
  await clickCell(page, front.gx, front.gy)
  await page.getByTestId('lot-building-inspector-primary-move').click()
  await expect(page.getByTestId('lot-move-flow')).toBeVisible()

  // On the pad: refused, with the reservation's sentence.
  await nudgeOriginTo(page, LEGACY_ORIGIN)
  await expect(page.getByTestId('lot-build-verdict')).toHaveText(REFUSAL)

  // Carried on to the west lawn — ordinary open ground — and it is legal again,
  // with the studio's ordinary sentence back. The rule is about the GROUND, and it
  // stops exactly where that ground does.
  await nudgeOriginTo(page, WEST_LAWN)
  const verdict = page.getByTestId('lot-build-verdict')
  await expect(verdict).toHaveAttribute('data-ok', 'true')
  await expect(verdict).not.toHaveText(REFUSAL)
  await expect(page.getByTestId('lot-build-commit')).toBeEnabled()

  // Committed there, the move behaves exactly as it always has: free, instant,
  // identity intact — the fix took nothing away from the verb.
  await page.getByTestId('lot-build-commit').click()
  await expect(page.getByTestId('lot-move-flow')).toHaveCount(0)
  const after = await sessionState(page)
  const moved = studioPlacement(after).placements[0]!
  expect(moved.origin).toEqual(WEST_LAWN)
  expect(moved.parcelId).toBe('west-lawn')
  expect(moved.id).toBe(placed.id)
  expect(moved.facilityId).toBe(placed.facilityId)
  expect(moved.status).toBe('operational')
  expect(after.studio.cash).toBe(before.studio.cash)
  expect((await gridDebug(page)).placedFacilityIds).toEqual([placed.id])
  // The Annex contract is untouched by any of it.
  expect(studioDevelopment(after).canStart).toBe(true)

  expect(runtime.pageErrors).toEqual([])
  expect(runtime.consoleErrors).toEqual([])
})
