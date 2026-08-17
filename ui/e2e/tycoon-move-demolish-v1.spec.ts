// ── C1-M3b — Move & Demolish V1, on the real canvas ──────────────────────────
//
// Unit-green is not done (campaign law). Everything below happens in the shipped grid
// world: a facility the studio built is picked up, carried across the property with its
// ghost painting per-cell verdicts, put down, and later taken down — and the surfaces
// that were pointing at it are checked afterwards, because a dangling identity is this
// campaign's twice-found defect family.
//
// LAW 25: this suite names its OWN fixtures and measures nothing belonging to another.
// It asserts no structural tuple: it is a behaviour journey, and the Week-0 grid tuple
// belongs to `tycoon-build-mode-v1.spec.ts`, which still owns and re-measures it.

import { expect, test, type Locator, type Page } from '@playwright/test'
import {
  advanceWeek,
  commissionScriptAction,
  exportSaveJson,
  foundManagedStudioAction,
  foundingApplicantCards,
  importSaveJson,
  newGame,
  placeFacilityAction,
  placementQuote,
  scriptProjectsBoard,
  signContractAction,
  studioPlacement,
  type CommissionScriptPayload,
  type CreativeRole,
  type GameState,
  type PlacementRequest,
} from '../src/engine/adapter.ts'

const GRID_BASE_URL = 'http://localhost:5179'

const ACTIVE_SESSION_KEY = 'project-studio.active-session.v4'
const ACTIVE_SESSION_CORRUPT_KEY = 'project-studio.active-session.v4.corrupt'
const LOT_FLAG_KEY = 'project-studio.flags.studio-lot-overview'
const HOLLYWOOD_FLAG_KEY = 'project-studio.flags.operation-hollywood'
const TYCOON_FLAG_KEY = 'project-studio.flags.tycoon-world'
const IDENTITY_PROOF_FLAG_KEY = 'project-studio.flags.studio-lot-identity-proof'

const ANNEX_BLUEPRINT = 'development-casting-annex'

test.describe.configure({ timeout: 180_000 })

// ── the named fixtures ───────────────────────────────────────────────────────
//
// Built by calling adapter actions in-spec with named seeds. Nothing is hand-edited:
// the placement is committed and completed by the engine, and the engagement in the
// second fixture is a screenplay the studio actually commissioned into that facility
// once the founding Development & Casting slots were full.

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

/** The first LEGAL placement on a parcel that is not the legacy Annex pad. */
function firstLegalRequest(state: GameState, skip: readonly string[] = []): PlacementRequest {
  const view = studioPlacement(state)
  const blueprint = view.catalog.find((entry) => entry.blueprintId === ANNEX_BLUEPRINT)
  if (blueprint === undefined) throw new Error('the Annex blueprint is not in the catalog')
  for (const parcel of view.parcels) {
    if (parcel.id === 'expansion' || skip.includes(parcel.id)) continue
    for (let gy = parcel.rect.y0; gy <= parcel.rect.y1; gy++) {
      for (let gx = parcel.rect.x0; gx <= parcel.rect.x1; gx++) {
        const request = { blueprintId: blueprint.blueprintId, origin: { gx, gy } }
        if (placementQuote(state, request).ok) return request
      }
    }
  }
  throw new Error('no legal placement remains')
}

/** A managed studio with ONE operational facility the studio built. */
function standingFacilityState(seed: string): GameState {
  const founded = managedStudio(seed)
  const committed = placeFacilityAction(founded, firstLegalRequest(founded))
  if (!committed.ok) throw new Error(committed.error)
  let state = committed.next
  const completesWeek = studioPlacement(state).placements[0]!.completesWeek
  while (state.market.tick < completesWeek) state = advanceWeek(state).next
  if (studioPlacement(state).placements[0]!.status !== 'operational') {
    throw new Error('fixture facility never completed')
  }
  return state
}

/** …and the same studio with real work reserved INSIDE that facility. */
function engagedFacilityState(seed: string): GameState {
  let state = standingFacilityState(seed)
  for (let attempt = 0; attempt < 4; attempt++) {
    const board = scriptProjectsBoard(state)
    const concept = board.commission.concepts[0]
    const writer = board.commission.writers.find((candidate) => candidate.available)
    if (concept === undefined || writer === undefined) break
    const outcome = commissionScriptAction(state, {
      conceptId: concept.id,
      writerId: writer.id,
      shape: { opening: 'slowSetup', midpoint: 'reversal', ending: 'bittersweet' },
      promise: {
        genre: concept.genre,
        intendedSegments: ['adult'],
        ranges: {
          intimacy: [-0.65, 0.15],
          tonalWeight: [-0.65, 0.15],
          kineticEnergy: [-0.65, 0.15],
        },
      },
    } as CommissionScriptPayload)
    if (!outcome.ok) break
    state = outcome.next
  }
  const facilityId = studioPlacement(state).placements[0]!.facilityId
  const held = state.scriptDevelopment.projects.some(
    (project) => project.reservation?.facilityId === facilityId,
  )
  if (!held) throw new Error('fixture never engaged the placed facility')
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

const STANDING_STATE = standingFacilityState('tycoon-move-demolish-v1')
const STANDING_SAVE = saveOf(STANDING_STATE)
const STANDING_PLACEMENT = studioPlacement(STANDING_STATE).placements[0]!
const STANDING_WORLD_ID = `placed-${String(STANDING_PLACEMENT.id)}`

const ENGAGED_STATE = engagedFacilityState('tycoon-move-demolish-engaged-v1')
const ENGAGED_SAVE = saveOf(ENGAGED_STATE)
const ENGAGED_WORLD_ID = `placed-${String(studioPlacement(ENGAGED_STATE).placements[0]!.id)}`

/**
 * A legal destination on DIFFERENT ground, chosen by the engine's own quote.
 *
 * Deliberately the SOUTH LAWN: open, road-served ground on the boulevard whose cells no
 * other building's silhouette covers, so the moved body can be clicked afterwards. A
 * destination is a fixture choice like any other — the engine still decides whether it
 * is legal, and the quote is what this spec reads.
 */
const MOVE_DESTINATION = (() => {
  const view = studioPlacement(STANDING_STATE)
  const parcel = view.parcels.find((candidate) => candidate.id === 'south-lawn')!
  for (let gy = parcel.rect.y0; gy <= parcel.rect.y1; gy++) {
    for (let gx = parcel.rect.x0; gx <= parcel.rect.x1; gx++) {
      if (placementQuote(STANDING_STATE, { blueprintId: ANNEX_BLUEPRINT, origin: { gx, gy } }).ok) {
        return { gx, gy }
      }
    }
  }
  throw new Error('no legal move destination on the south lawn')
})()

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

async function seed(page: Page, save: string = STANDING_SAVE) {
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
    save,
  })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto(`${GRID_BASE_URL}/`)
  await expect(page.getByTestId('studio-lot-screen')).toBeVisible()
  await expect(page.getByTestId('studio-lot-canvas').locator('canvas')).toHaveCount(1)
  await expect(page.getByText('Preparing the lot…', { exact: true })).toHaveCount(0)
  await expect(page.getByTestId('dev-error')).toHaveCount(0)
  // The picture-guidance card's expanded body reaches over part of the open ground this
  // journey uses. Fold it with the same control the player has.
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

/** Select the built facility on the canvas and land its own in-world panel. */
async function selectStandingFacility(page: Page): Promise<void> {
  const state = await sessionState(page)
  const placed = studioPlacement(state).placements[0]!
  const front = frontCellOf(placed.cells)
  await clickCell(page, front.gx, front.gy)
  await expect(page.getByTestId(`lot-building-inspector-${STANDING_WORLD_ID}`)).toBeVisible()
}

// ── 1. MOVE ──────────────────────────────────────────────────────────────────

test('a building the studio built is picked up, carried, and put down again', async ({ page }) => {
  const runtime = watchRuntime(page)
  await seed(page)
  const before = await sessionState(page)
  const placed = studioPlacement(before).placements[0]!
  const cashBefore = before.studio.cash

  await selectStandingFacility(page)
  const moveVerb = page.getByTestId('lot-building-inspector-primary-move')
  await expect(moveVerb).toBeEnabled()
  await expect(page.getByTestId('lot-building-inspector-primary-demolish')).toContainText(
    '$390,000',
  )

  // ── picked up: the ghost is live and the world knows which body it is carrying ──
  await moveVerb.click()
  await expect(page.getByTestId('lot-move-flow')).toBeVisible()
  await expect(page.getByTestId('lot-move-flow-heading')).toContainText('Moving')
  await expect(page.getByTestId('lot-move-flow-heading')).toContainText(placed.name)
  const carried = await gridDebug(page)
  expect(carried.movingPlacementId).toBe(placed.id)
  // It ROAMS: a move is bounded by the property, not by the parcel it stands on.
  expect(carried.buildModeParcelId).toBeNull()
  // It starts exactly where the building already stands, and standing still is legal —
  // which is only true because the mover's own cells are excluded from its own quote.
  expect(carried.previewOrigin).toEqual({ gx: placed.origin.gx, gy: placed.origin.gy })
  expect(carried.previewOk).toBe(true)
  await expect(page.getByTestId('lot-build-verdict')).toHaveAttribute('data-ok', 'true')
  // Nothing has moved yet: the body is still standing on its own ground.
  expect((await sessionState(page)).placement.facilities[0]!.origin).toEqual(placed.origin)

  // ── carried over ground it may NOT stand on: the ghost says so, per cell ──
  const courtyard = studioPlacement(before).parcels.find((p) => p.id === 'courtyard')!
  await clickCell(page, courtyard.rect.x0, courtyard.rect.y0)
  await expect(page.getByTestId('lot-build-verdict')).toHaveAttribute('data-ok', 'false')
  await expect(page.getByTestId('lot-build-commit')).toBeDisabled()
  const overProtected = await gridDebug(page)
  expect(overProtected.previewOk).toBe(false)
  expect(overProtected.previewOrigin).toEqual({ gx: courtyard.rect.x0, gy: courtyard.rect.y0 })

  // ── ESCAPE puts it back down, byte-neutral ──
  const bytesBeforeCancel = await page.evaluate(
    (key) => localStorage.getItem(key),
    ACTIVE_SESSION_KEY,
  )
  await page.getByTestId('lot-build-origin').press('Escape')
  await expect(page.getByTestId('lot-move-flow')).toHaveCount(0)
  const cancelled = await gridDebug(page)
  expect(cancelled.movingPlacementId).toBeNull()
  expect(cancelled.previewOrigin).toBeNull()
  expect(await page.evaluate((key) => localStorage.getItem(key), ACTIVE_SESSION_KEY)).toBe(
    bytesBeforeCancel,
  )
  // The building is still selected, and still standing where it was.
  await expect(page.getByTestId(`lot-building-inspector-${STANDING_WORLD_ID}`)).toBeVisible()

  // ── RE-ENTERED after the cancel, and committed on legal ground ──
  await page.getByTestId('lot-building-inspector-primary-move').click()
  await expect(page.getByTestId('lot-move-flow')).toBeVisible()
  await clickCell(page, MOVE_DESTINATION.gx, MOVE_DESTINATION.gy)
  await expect(page.getByTestId('lot-build-verdict')).toHaveAttribute('data-ok', 'true')
  expect((await gridDebug(page)).previewOrigin).toEqual(MOVE_DESTINATION)
  await page.getByTestId('lot-build-commit').click()

  // ── put down: receipt names the facility AND the ground it now stands on ──
  await expect(page.getByTestId('lot-move-flow')).toHaveCount(0)
  const receipt = page.getByTestId('lot-building-receipt')
  await expect(receipt).toContainText(placed.name)
  await expect(receipt).toContainText('moved to the South Lawn.')

  const after = await sessionState(page)
  const moved = studioPlacement(after).placements[0]!
  expect(moved.origin).toEqual(MOVE_DESTINATION)
  // IDENTITY PRESERVED: a move is a change of address, not a rebuild — so the same
  // world id still names it, and the panel the player is looking at is still its own.
  expect(moved.id).toBe(placed.id)
  expect(moved.facilityId).toBe(placed.facilityId)
  expect(moved.status).toBe('operational')
  // A move is not a re-purchase.
  expect(after.studio.cash).toBe(cashBefore)
  await expect(page.getByTestId(`lot-building-inspector-${STANDING_WORLD_ID}`)).toBeVisible()
  expect((await gridDebug(page)).placedFacilityIds).toEqual([placed.id])

  // The body really moved on the canvas: it answers on its NEW ground…
  const newFront = frontCellOf(moved.cells)
  await clickCell(page, 4, 3) // Development, to take the rail away from the facility
  await expect(page.getByTestId('lot-building-inspector-writers')).toBeVisible()
  await clickCell(page, newFront.gx, newFront.gy)
  await expect(page.getByTestId(`lot-building-inspector-${STANDING_WORLD_ID}`)).toBeVisible()
  expect((await gridDebug(page)).selectedPlaceId).toBe(STANDING_WORLD_ID)

  expect(runtime.pageErrors).toEqual([])
  expect(runtime.consoleErrors).toEqual([])
})

// ── 2. DEMOLISH ──────────────────────────────────────────────────────────────

test('a building is taken down for its refund, and nothing is left pointing at it', async ({
  page,
}) => {
  const runtime = watchRuntime(page)
  await seed(page)
  const before = await sessionState(page)
  const placed = studioPlacement(before).placements[0]!
  const cashBefore = before.studio.cash

  await selectStandingFacility(page)

  // ── the confirm is in the WORLD, beside the building it names ──
  await page.getByTestId('lot-building-inspector-primary-demolish').click()
  const confirm = page.getByTestId('lot-demolish-confirm')
  await expect(confirm).toBeVisible()
  await expect(confirm).toHaveAttribute('data-placement-id', String(placed.id))
  await expect(page.getByTestId('lot-demolish-confirm-heading')).toContainText(placed.name)
  await expect(page.getByTestId('lot-demolish-confirm-heading')).toContainText(
    'The studio recovers $390,000.',
  )

  // ── cancelling is byte-neutral, and the building is still there ──
  const bytesBeforeCancel = await page.evaluate(
    (key) => localStorage.getItem(key),
    ACTIVE_SESSION_KEY,
  )
  await page.getByTestId('lot-demolish-confirm-cancel').click()
  await expect(page.getByTestId('lot-demolish-confirm')).toHaveCount(0)
  expect(await page.evaluate((key) => localStorage.getItem(key), ACTIVE_SESSION_KEY)).toBe(
    bytesBeforeCancel,
  )
  expect((await gridDebug(page)).placedFacilityIds).toEqual([placed.id])

  // ── and then taken down for real ──
  await page.getByTestId('lot-building-inspector-primary-demolish').click()
  await page.getByTestId('lot-demolish-confirm-accept').click()

  // The receipt names the facility and the credit, in the standing grammar.
  const receipt = page.getByTestId('lot-build-receipt')
  await expect(receipt).toContainText(placed.name.toUpperCase())
  await expect(receipt).toContainText('DEMOLISHED — $390,000 recovered')

  const after = await sessionState(page)
  expect(studioPlacement(after).placements).toHaveLength(0)
  expect(after.studio.cash).toBe(cashBefore + 390_000)

  // THE BODY IS GONE from the world, and no surface is left pointing at it.
  const debug = await gridDebug(page)
  expect(debug.placedFacilityIds).toEqual([])
  expect(debug.placementLabels).toEqual([])
  expect(debug.selectedPlaceId).not.toBe(STANDING_WORLD_ID)
  await expect(page.getByTestId(`lot-building-inspector-${STANDING_WORLD_ID}`)).toHaveCount(0)
  // The player lands on the ground that survived — a real thing, and what changed.
  await expect(page.getByTestId(`lot-parcel-inspector-${placed.parcelId}`)).toHaveAttribute(
    'data-parcel-status',
    'vacant',
  )

  // No debris and no cleanup theater: it is buildable ground again, immediately.
  await expect(page.getByTestId(`lot-parcel-build-${placed.parcelId}`)).toBeEnabled()

  // …and a FRESH SNAPSHOT arriving over the demolition finds nothing dangling. This is
  // the orphan case that matters: the week advances, every surface repaints from truth
  // that no longer contains the body, and none of them may resurrect its identity.
  await page.getByTestId('lot-advance-week').click()
  await expect(page.locator('.lot-sub')).toContainText(`Week ${String(after.market.tick + 1)}`)
  await expect(page.getByTestId('dev-error')).toHaveCount(0)
  await expect(page.getByTestId(`lot-building-inspector-${STANDING_WORLD_ID}`)).toHaveCount(0)
  const repainted = await gridDebug(page)
  expect(repainted.placedFacilityIds).toEqual([])
  expect(repainted.placementLabels).toEqual([])
  expect(repainted.selectedPlaceId).not.toBe(STANDING_WORLD_ID)
  expect(repainted.movingPlacementId).toBeNull()

  expect(runtime.pageErrors).toEqual([])
  expect(runtime.consoleErrors).toEqual([])
})

// ── 3. THE REFUSAL A PLAYER CAN READ ─────────────────────────────────────────

test('live work holding a facility disables both verbs and says what holds it', async ({
  page,
}) => {
  const runtime = watchRuntime(page)
  await seed(page, ENGAGED_SAVE)

  const state = await sessionState(page)
  const placed = studioPlacement(state).placements[0]!
  const held = state.scriptDevelopment.projects.find(
    (project) => project.reservation?.facilityId === placed.facilityId,
  )
  expect(held).toBeDefined()

  const front = frontCellOf(placed.cells)
  await clickCell(page, front.gx, front.gy)
  await expect(page.getByTestId(`lot-building-inspector-${ENGAGED_WORLD_ID}`)).toBeVisible()

  // BOTH verbs are present and DISABLED — the player can see what the studio could do
  // here, and why it cannot right now. Absence would teach nothing.
  const move = page.getByTestId('lot-building-inspector-primary-move')
  const demolish = page.getByTestId('lot-building-inspector-primary-demolish')
  await expect(move).toBeVisible()
  await expect(move).toBeDisabled()
  await expect(demolish).toBeVisible()
  await expect(demolish).toBeDisabled()

  // …and the reason is bound to each control, in the standing blocked-state grammar.
  for (const kind of ['move', 'demolish']) {
    const reason = page.getByTestId(`lot-building-inspector-reason-${kind}`)
    await expect(reason).toBeVisible()
    await expect(reason).toContainText(`${placed.name} is reserved by`)
    await expect(reason).toContainText('drafting a screenplay')
    // Never an engine word or an engine id in a sentence a player reads.
    await expect(reason).not.toContainText('facilityEngaged')
    await expect(reason).not.toContainText('facility-')
    await expect(reason).not.toContainText('script-')
    await expect(page.getByTestId(`lot-building-inspector-primary-${kind}`)).toHaveAttribute(
      'aria-describedby',
      `lot-building-inspector-reason-${kind}`,
    )
  }

  // A disabled verb commits nothing, and neither flow can be entered behind it.
  await move.click({ force: true }).catch(() => undefined)
  await expect(page.getByTestId('lot-move-flow')).toHaveCount(0)
  await demolish.click({ force: true }).catch(() => undefined)
  await expect(page.getByTestId('lot-demolish-confirm')).toHaveCount(0)
  expect((await gridDebug(page)).placedFacilityIds).toEqual([placed.id])

  expect(runtime.pageErrors).toEqual([])
  expect(runtime.consoleErrors).toEqual([])
})
