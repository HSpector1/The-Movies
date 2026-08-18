// ── C1-M7 — THE GOLDEN PATH: one studio, one browser, the whole campaign loop ─
//
// Campaign 1 shipped in six milestones, each proved by its own spec on its own fixture.
// This is the one that proves they compose: ONE continuous session, on the SHIPPED
// DEFAULT world with every player gate on its shipped default, walking the loop a real
// owner walks — read the catalog, be refused by it, buy a building, watch it go up in
// physical time, use the thing it changed, pick it up, take it down, and then start the
// studio's SECOND picture without reloading anything.
//
// There is no `page.goto` after the opening one and no fixture swap: every act below
// inherits the world the act before it left standing. That is the claim. A milestone
// that passes alone and breaks its neighbour is exactly what a golden path is for.
//
// LAW 24: the fixture is built by calling adapter actions in-spec with a NAMED SEED and
// injected through `page.addInitScript` into the live session key. Nothing is hand-edited.
// LAW 25: this suite names its own fixture and asserts NO structural tuple — it is a
// behaviour journey. The Week-0 grid tuple belongs to `tycoon-build-mode-v1.spec.ts`,
// which still owns and re-measures it. No canvas digest is taken anywhere.

import { expect, test, type Locator, type Page } from '@playwright/test'
import { assessFirstDraft } from '../../src/core/index.ts'
import {
  exportSaveJson,
  foundManagedStudioAction,
  foundingApplicantCards,
  importSaveJson,
  newGame,
  placementQuote,
  signContractAction,
  studioLotSnapshot,
  studioPlacement,
  type CreativeRole,
  type GameState,
} from '../src/engine/adapter.ts'

/** The SHIPPED world's own origin (see the quarantine note in `playwright.config.ts`). */
const GRID_BASE_URL = 'http://localhost:5179'

const ACTIVE_SESSION_KEY = 'project-studio.active-session.v4'
const ACTIVE_SESSION_CORRUPT_KEY = 'project-studio.active-session.v4.corrupt'
const LOT_FLAG_KEY = 'project-studio.flags.studio-lot-overview'
const HOLLYWOOD_FLAG_KEY = 'project-studio.flags.operation-hollywood'
const TYCOON_FLAG_KEY = 'project-studio.flags.tycoon-world'
const IDENTITY_PROOF_FLAG_KEY = 'project-studio.flags.studio-lot-identity-proof'

/** Open, road-served ground off the boulevard — the parcel this journey builds on. */
const BUILD_PARCEL = 'south-lawn'
const OFFICE_2 = 'development-office-2'
const OFFICE_3 = 'development-office-3'
const CRAFT_ANNEX = 'craft-annex'

/**
 * Every blueprint the studio's catalog holds, in the engine's authored order.
 *
 * C2a-M2 appended the §3.4 slate — a soundstage, a post building, a scenery shop and a
 * second development office — to the C1 five. This journey is about the C1 LOOP, not
 * about the catalog's length, so the list is widened to what the engine actually
 * publishes rather than pinned to the count it happened to have in C1. The entries this
 * act really reads are named one by one below and are unchanged.
 */
const CATALOG_IDS = [
  'development-casting-annex',
  'development-casting-hall',
  OFFICE_2,
  OFFICE_3,
  CRAFT_ANNEX,
  'stage-standard',
  'post-building',
  'scenery-shop',
  'development-casting-office',
] as const

/** Development stands at grid (3,2)–(5,3); (4,3) is its own ground. */
const DEVELOPMENT_CELL = { gx: 4, gy: 3 }

// The whole campaign loop in one browser, including a picture carried to greenlight.
test.describe.configure({ timeout: 900_000 })

// ── the named fixture ────────────────────────────────────────────────────────
//
// A founded, managed, Week-0 studio. Three writers rather than one so that "the studio
// commissioned a second screenplay" is never quietly a story about a thin roster, and
// three actors because the smallest legal audition slate needs exactly three.

const FOUNDING_COUNTS: Readonly<Record<CreativeRole, number>> = {
  actor: 3,
  director: 1,
  writer: 3,
  craft: 1,
}

function foundedStudio(seed: string): GameState {
  let state: GameState = newGame(seed)
  const cards = foundingApplicantCards(state)
  for (const role of ['actor', 'director', 'writer', 'craft'] as const) {
    const selected = cards
      .filter((card) => card.profile.role === role)
      .slice(0, FOUNDING_COUNTS[role])
    if (selected.length !== FOUNDING_COUNTS[role]) throw new Error(`fixture lacks ${role} applicants`)
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

const FOUNDED_STATE = foundedStudio('c1-golden-path-v1')

function foundedSave(): string {
  const bytes = exportSaveJson(FOUNDED_STATE)
  const replay = importSaveJson(bytes)
  if (!replay.ok || replay.converted || exportSaveJson(replay.state) !== bytes) {
    throw new Error('the golden-path fixture does not replay byte-identically')
  }
  return bytes
}

const FOUNDED_SAVE = foundedSave()

/** The engine's own catalog for this fixture — the copy every surface must show verbatim. */
const FIXTURE_CATALOG = studioLotSnapshot(FOUNDED_STATE).placement!.catalog

function catalogEntry(blueprintId: string) {
  const entry = FIXTURE_CATALOG.find((row) => row.blueprintId === blueprintId)
  if (entry === undefined) throw new Error(`fixture catalog lacks ${blueprintId}`)
  return entry
}

const OFFICE_2_ENTRY = catalogEntry(OFFICE_2)

const BUILD_PARCEL_RECT = studioPlacement(FOUNDED_STATE).parcels.find(
  (parcel) => parcel.id === BUILD_PARCEL,
)!.rect

/** Protected ground the studio may never build on — the courtyard plaza. */
const PROTECTED_RECT = studioPlacement(FOUNDED_STATE).parcels.find(
  (parcel) => parcel.id === 'courtyard',
)!.rect

// ── renderer instrumentation (the established route-rewrite seam) ────────────

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
    // The three player gates stay on their SHIPPED DEFAULTS — absence, never a `1`.
    localStorage.removeItem(config.lotFlag)
    localStorage.removeItem(config.hollywoodFlag)
    localStorage.removeItem(config.tycoonFlag)
    // Renderer telemetry is dev-review chrome; this suite only uses its debug bridge.
    localStorage.setItem(config.identityFlag, '1')
  }, {
    sessionKey: ACTIVE_SESSION_KEY,
    corruptKey: ACTIVE_SESSION_CORRUPT_KEY,
    lotFlag: LOT_FLAG_KEY,
    hollywoodFlag: HOLLYWOOD_FLAG_KEY,
    tycoonFlag: TYCOON_FLAG_KEY,
    identityFlag: IDENTITY_PROOF_FLAG_KEY,
    save: FOUNDED_SAVE,
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

type GridDebug = {
  selectedPlaceId: string | null
  selectedParcelId: string | null
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

async function sessionBytes(page: Page): Promise<string> {
  const value = await page.evaluate((key) => localStorage.getItem(key), ACTIVE_SESSION_KEY)
  if (value === null) throw new Error('active session is missing')
  return value
}

async function sessionState(page: Page): Promise<GameState> {
  const replay = importSaveJson(await sessionBytes(page))
  if (!replay.ok) throw new Error(replay.error)
  return replay.state
}

/**
 * Put the picture-guidance card in a named state with the player's own control.
 *
 * Its expanded body reaches over part of the south lawn at this viewport, so canvas work
 * folds it; its "next step" button lives INSIDE that body, so guidance navigation opens
 * it again. Idempotent, because the card re-expands whenever the next step changes.
 */
async function setGuidance(page: Page, expanded: boolean): Promise<void> {
  const toggle = page.getByTestId('lot-picture-guidance-toggle')
  if ((await toggle.count()) === 0) {
    if (expanded) throw new Error('the picture-guidance card is not on the stage')
    return
  }
  if ((await toggle.getAttribute('aria-expanded')) !== String(expanded)) await toggle.click()
  await expect(toggle).toHaveAttribute('aria-expanded', String(expanded))
}

/** Take the picture's named next step from the card that names it. */
async function takeGuidanceStep(page: Page, label: string): Promise<void> {
  await setGuidance(page, true)
  const next = page.getByTestId('lot-picture-guidance-next')
  await expect(next).toHaveText(label)
  await next.click()
}

/** Advance exactly one visible week, waiting for the desk to say so. */
async function advanceOneWeek(page: Page, toWeek: number): Promise<void> {
  await page.getByTestId('lot-advance-week').click()
  await expect(page.locator('.lot-sub')).toHaveText(new RegExp(`Week ${String(toWeek)}$`))
}

/** Open the build catalog over a parcel, through the keyboard-reachable companion rail. */
async function openCatalog(page: Page, parcelId: string): Promise<void> {
  await page.getByTestId(`lot-nav-parcel-${parcelId}`).focus()
  await page.getByTestId(`lot-nav-parcel-${parcelId}`).press('Enter')
  await page.getByTestId(`lot-parcel-build-${parcelId}`).click()
  await expect(page.getByTestId('lot-build-catalog')).toBeVisible()
}

/** The front corner of a footprint — the cell nothing behind it covers. */
function frontCellOf(cells: readonly { gx: number; gy: number }[]) {
  return [...cells].sort((a, b) => a.gx + a.gy - (b.gx + b.gy)).at(-1)!
}

/** Open the retained commissioning workspace from Development's own verb. */
async function openCommissionWorkspace(page: Page): Promise<void> {
  await setGuidance(page, false)
  await clickCell(page, DEVELOPMENT_CELL.gx, DEVELOPMENT_CELL.gy)
  await expect(page.getByTestId('lot-building-inspector-writers')).toBeVisible()
  await page.getByTestId('lot-building-inspector-primary-commission').click()
  await expect(page.getByTestId('lot-commission-workspace')).toBeVisible()
  await expect(page.getByTestId('commission-panel')).toBeVisible()
}

/** Two reads per role from a three-actor roster — the smallest legal slate. */
async function selectLegalSlate(page: Page): Promise<void> {
  const actorIds = await page
    .getByTestId('casting-slate-lead')
    .locator('button[data-testid^="casting-candidate-lead-"]:not([disabled])')
    .evaluateAll((nodes) =>
      nodes
        .slice(0, 3)
        .map((node) => node.getAttribute('data-testid')!.replace(/^casting-candidate-lead-/, '')),
    )
  expect(actorIds, 'a founded roster fields three actors').toHaveLength(3)
  const slate: Record<'lead' | 'antagonist' | 'support', [string, string]> = {
    lead: [actorIds[0]!, actorIds[1]!],
    antagonist: [actorIds[0]!, actorIds[1]!],
    support: [actorIds[0]!, actorIds[2]!],
  }
  for (const [role, ids] of Object.entries(slate) as Array<
    ['lead' | 'antagonist' | 'support', [string, string]]
  >) {
    for (const id of ids) {
      const candidate = page.getByTestId(`casting-candidate-${role}-${id}`)
      await candidate.scrollIntoViewIfNeeded()
      await candidate.click()
      await expect(candidate).toHaveAttribute('aria-pressed', 'true')
    }
  }
}

async function chooseFirstEligible(page: Page, pickerTestId: string): Promise<void> {
  const button = page
    .getByTestId(pickerTestId)
    .locator('button[aria-pressed]:not([disabled])')
    .first()
  await button.scrollIntoViewIfNeeded()
  await expect(button).toBeVisible()
  await button.click()
  await expect(button).toHaveAttribute('aria-pressed', 'true')
}

/** The stored draft assessment of one screenplay project, read from the live session. */
function projectAssessment(state: GameState, projectId: string) {
  const project = state.scriptDevelopment.projects.find((candidate) => candidate.id === projectId)
  if (project === undefined) throw new Error(`the session holds no project "${projectId}"`)
  return project
}

/**
 * What this exact draft would have been worth with NO development office standing.
 *
 * The engine's own first-draft assessor, called with the neutral uplift, on the concept,
 * writer, shape and promise the session actually stored. Nothing here re-implements a
 * formula: the counterfactual is the same function the tick runs, minus the building.
 */
function assessmentWithoutOffice(state: GameState, projectId: string) {
  const project = projectAssessment(state, projectId)
  const concept = state.concepts.find((candidate) => candidate.id === project.conceptId)
  const writer = state.talent.find((candidate) => candidate.id === project.writerId)
  if (concept === undefined || writer === undefined) {
    throw new Error(`the session cannot resolve the sources of "${projectId}"`)
  }
  return assessFirstDraft(concept, writer, project.shape, project.promise, 0)
}

test('the whole Campaign 1 loop holds in one studio, in one browser, with no reload', async ({
  page,
}) => {
  const runtime = watchRuntime(page)

  // ══ ACT 1 — A FRESH STUDIO, FOUNDED IN-SPEC AND BOOTED ONCE ════════════════
  await seed(page)
  const founded = await sessionState(page)
  expect(founded.market.tick).toBe(0)
  expect(studioPlacement(founded).placements).toEqual([])
  expect((await gridDebug(page)).placedFacilityIds).toEqual([])
  const foundingCash = founded.studio.cash

  // ══ ACT 2 — THE CATALOG, COMPARED ═════════════════════════════════════════
  //
  // A list a player reads BEFORE spending: five entries at once, each saying what it does
  // in the engine's own authored sentence, with the tier it has not earned still readable.
  await setGuidance(page, false)
  await openCatalog(page, BUILD_PARCEL)
  await expect(page.locator('[data-testid^="lot-build-blueprint-"]')).toHaveCount(
    CATALOG_IDS.length,
  )

  // TWO AVAILABLE ENTRIES, read the way a player compares them: the effect sentence
  // verbatim from the engine, the price, and the clock.
  for (const blueprintId of [OFFICE_2, CRAFT_ANNEX]) {
    const entry = catalogEntry(blueprintId)
    const row = page.getByTestId(`lot-build-blueprint-${blueprintId}`)
    await expect(row).toHaveAttribute('data-state', 'buildable')
    await expect(row).toBeEnabled()
    await expect(page.getByTestId(`lot-build-state-${blueprintId}`)).toHaveText('Available')
    await expect(page.getByTestId(`lot-build-effect-${blueprintId}`)).toHaveText(
      entry.effectSummary,
    )
    await expect(row).toContainText(`${entry.buildWeeks} weeks`)
  }

  // …and the tier gated on a building the studio does not have is LOCKED and says why,
  // in the engine's own bound sentence.
  const lockedRow = page.getByTestId(`lot-build-blueprint-${OFFICE_3}`)
  await expect(lockedRow).toHaveAttribute('data-state', 'locked')
  await expect(lockedRow).toBeDisabled()
  await expect(page.getByTestId(`lot-build-state-${OFFICE_3}`)).toHaveText('Locked')
  const lockReason = page.getByTestId(`lot-build-blocked-${OFFICE_3}`)
  await expect(lockReason).toHaveText('Requires an operational Development Office II.')
  expect(catalogEntry(OFFICE_3).unmet[0]!.reason).toBe(
    'Requires an operational Development Office II.',
  )
  // The refusal is BOUND to the control it refuses, not a loose sentence below it.
  await expect(lockedRow).toHaveAttribute('aria-describedby', `lot-build-blocked-${OFFICE_3}`)

  // ══ ACT 3 — A REAL REFUSAL, EXPERIENCED AND BYTE-NEUTRAL ══════════════════
  //
  // Forcing the locked control is the hostile version of "the player clicked it anyway".
  // The catalog must refuse it in the pinned vocabulary and change NOTHING.
  const bytesBeforeRefusal = await sessionBytes(page)
  await lockedRow.click({ force: true }).catch(() => undefined)
  await expect(page.getByTestId('lot-build-origin')).toHaveCount(0)
  await expect(lockReason).toHaveText('Requires an operational Development Office II.')
  expect(await sessionBytes(page)).toBe(bytesBeforeRefusal)
  const refused = await gridDebug(page)
  expect(refused.previewOrigin).toBeNull()
  expect(refused.placedFacilityIds).toEqual([])

  // ══ ACT 4 — THE STUDIO BUYS A BUILDING ════════════════════════════════════
  await page.getByTestId(`lot-build-blueprint-${OFFICE_2}`).click()

  // The quote: the engine's price, clock, running cost and the capacity it does NOT add.
  const quote = page.getByTestId('lot-build-quote')
  await expect(quote).toContainText('$600,000')
  await expect(quote).toContainText('$2,500 once operational')
  await expect(quote).toContainText('+0 shared slots')
  await expect(page.getByTestId('lot-build-verdict')).toHaveAttribute('data-ok', 'true')
  await expect(page.getByTestId('lot-build-commit')).toContainText(
    'Build Development Office II · $600,000',
  )

  // The GHOST is a UI-only layer: it painted on the world and moved no byte of state.
  const ghosted = await gridDebug(page)
  expect(ghosted.buildModeParcelId).toBe(BUILD_PARCEL)
  expect(ghosted.previewOk).toBe(true)
  expect(ghosted.previewOrigin).toEqual({ gx: BUILD_PARCEL_RECT.x0, gy: BUILD_PARCEL_RECT.y0 })
  expect(await sessionBytes(page)).toBe(bytesBeforeRefusal)

  await page.getByTestId('lot-build-commit').click()
  await expect(page.getByTestId('lot-build-receipt')).toContainText(
    '$600,000 committed to Development Office II',
  )
  await expect(page.getByTestId('lot-build-receipt')).toContainText('completes in Week 8')

  // EXACTLY $600,000, charged by the engine and autosaved by the app.
  const committed = await sessionState(page)
  expect(committed.studio.cash).toBe(foundingCash - 600_000)
  expect(committed.studio.cash).toBe(foundingCash - OFFICE_2_ENTRY.cost)
  const placedAtCommit = studioPlacement(committed).placements
  expect(placedAtCommit).toHaveLength(1)
  const office = placedAtCommit[0]!
  expect(office.blueprintId).toBe(OFFICE_2)
  expect(office.status).toBe('underConstruction')
  expect(office.completesWeek).toBe(8)
  const officeWorldId = `placed-${String(office.id)}`

  // …and the site is PHYSICALLY in the world, wearing its own weeks-left caption.
  const building = await gridDebug(page)
  expect(building.placedFacilityIds).toEqual([office.id])
  expect(building.placementLabels).toEqual(['DEVELOPMENT OFFICE II · 8 WEEKS LEFT'])
  expect(building.previewOrigin).toBeNull()

  // ══ ACT 5 — CONSTRUCTION IS PHYSICAL TIME ═════════════════════════════════
  //
  // Eight visible weeks, each one a real advance. Nothing is skipped and nothing is
  // simulated in a batch: the caption counts down on the canvas while they pass.
  for (let week = 1; week <= OFFICE_2_ENTRY.buildWeeks; week++) {
    await advanceOneWeek(page, week)
    const left = OFFICE_2_ENTRY.buildWeeks - week
    if (left > 0) {
      expect((await gridDebug(page)).placementLabels).toEqual([
        `DEVELOPMENT OFFICE II · ${String(left)} ${left === 1 ? 'WEEK' : 'WEEKS'} LEFT`,
      ])
    }
  }

  // THE COMPLETION TOAST. This facility adds no shared slot, and the C1-M6 adapter fix
  // says so by SAYING NOTHING about slots — its first exercise on the golden path.
  const toast = page.getByTestId('annex-completion-summary')
  await expect(toast).toBeVisible()
  await expect(toast.locator('p')).toHaveText('Development Office II is Operational in Week 8.')
  await expect(toast).not.toContainText('slot')
  await expect(toast).not.toContainText('0 shared')

  // The body on the canvas flipped with it.
  expect((await gridDebug(page)).placementLabels).toEqual([
    'DEVELOPMENT OFFICE II · OPERATIONAL',
  ])
  const opened = await sessionState(page)
  expect(studioPlacement(opened).placements[0]!.status).toBe('operational')
  expect(studioPlacement(opened).weeklyOperatingCost).toBe(OFFICE_2_ENTRY.weeklyOperatingCost)

  // ══ ACT 6 — THE BUILDING CHANGES THE DECISION IT WAS SOLD ON ══════════════
  await openCommissionWorkspace(page)
  await expect(page.getByTestId('commission-office-uplift')).toHaveText(
    'Development Office II will add 4 points of estimated strength to this draft.',
  )
  await page.getByTestId('commission-submit').click()
  await expect(page.getByTestId('lot-screenplay-commission-witness')).toBeVisible()

  const commissioned = await sessionState(page)
  expect(commissioned.scriptDevelopment.projects).toHaveLength(1)
  const firstProjectId = commissioned.scriptDevelopment.projects[0]!.id

  // One week of real drafting, and the assessment is WRITTEN.
  await advanceOneWeek(page, 9)
  const drafted = await sessionState(page)
  const firstDraft = projectAssessment(drafted, firstProjectId)
  expect(firstDraft.status).toBe('review')
  expect(firstDraft.assessment).not.toBeNull()

  // ENGINE-VISIBLE TRUTH, not copy: the stored draft is exactly four points above what
  // the same writer, concept, shape and promise would have produced with no office.
  const withoutOffice = assessmentWithoutOffice(drafted, firstProjectId)
  expect(firstDraft.assessment!.actualStrength - withoutOffice.actualStrength).toBeCloseTo(4, 10)
  expect(firstDraft.assessment!.perceivedStrength - withoutOffice.perceivedStrength).toBeCloseTo(
    4,
    10,
  )

  // The studio takes the draft.
  await takeGuidanceStep(page, 'Review the screenplay at Development')
  const review = page.getByTestId('lot-script-review-panel')
  await expect(review).toBeVisible()
  await review.getByRole('button', { name: /^Accept / }).click()
  await expect(page.getByTestId('lot-script-review-success')).toBeVisible()

  // ══ ACT 7 — THE BUILDING IS PICKED UP AND CARRIED ═════════════════════════
  await setGuidance(page, false)
  const standing = studioPlacement(await sessionState(page)).placements[0]!
  const standingFront = frontCellOf(standing.cells)
  await clickCell(page, standingFront.gx, standingFront.gy)
  await expect(page.getByTestId(`lot-building-inspector-${officeWorldId}`)).toBeVisible()
  await expect(page.getByTestId('lot-building-inspector-heading')).toHaveText(
    'Development Office II',
  )

  const moveVerb = page.getByTestId('lot-building-inspector-primary-move')
  await expect(moveVerb).toBeEnabled()
  await moveVerb.click()
  await expect(page.getByTestId('lot-move-flow')).toBeVisible()
  expect((await gridDebug(page)).movingPlacementId).toBe(standing.id)

  // A SECOND REAL REFUSAL, experienced in the world: the ghost carried onto protected
  // ground answers in the pinned per-cell vocabulary, and commits nothing.
  const bytesCarrying = await sessionBytes(page)
  await clickCell(page, PROTECTED_RECT.x0, PROTECTED_RECT.y0)
  const verdict = page.getByTestId('lot-build-verdict')
  await expect(verdict).toHaveAttribute('data-ok', 'false')
  await expect(verdict).toHaveText('This ground is protected — the studio does not build on it.')
  await expect(page.getByTestId('lot-build-commit')).toBeDisabled()
  expect(await sessionBytes(page)).toBe(bytesCarrying)

  // …and then put down on ground the engine calls legal. The destination is the engine's
  // answer, asked with the mover's own id, never a coordinate this spec invented.
  const carrying = await sessionState(page)
  // Searched along the parcel's ROAD-SIDE row first, furthest cell first: the deepest
  // corner of this parcel stands directly behind the Studio Gate's arch and a building
  // always wins an overlap with the ground behind it (shift law 10's precedence, not a
  // defect), so a destination is chosen on ground the moved body can still be clicked on.
  const destination = (() => {
    for (let gy = BUILD_PARCEL_RECT.y0; gy <= BUILD_PARCEL_RECT.y1; gy++) {
      for (let gx = BUILD_PARCEL_RECT.x1; gx >= BUILD_PARCEL_RECT.x0; gx--) {
        if (gx === standing.origin.gx && gy === standing.origin.gy) continue
        const answer = placementQuote(
          carrying,
          { blueprintId: OFFICE_2, origin: { gx, gy } },
          { movingPlacementId: standing.id },
        )
        if (answer.ok) return { gx, gy }
      }
    }
    throw new Error('the engine offers no legal move destination on this parcel')
  })()

  const ledgerBeforeMove = JSON.stringify(carrying.ledger)
  const cashBeforeMove = carrying.studio.cash
  await clickCell(page, destination.gx, destination.gy)
  await expect(verdict).toHaveAttribute('data-ok', 'true')
  expect((await gridDebug(page)).previewOrigin).toEqual(destination)
  await page.getByTestId('lot-build-commit').click()
  await expect(page.getByTestId('lot-move-flow')).toHaveCount(0)
  await expect(page.getByTestId('lot-building-receipt')).toContainText('moved to the South Lawn.')

  const moved = await sessionState(page)
  const movedOffice = studioPlacement(moved).placements[0]!
  expect(movedOffice.origin).toEqual(destination)
  // A MOVE IS A CHANGE OF ADDRESS: same identity, same status, no money, no ledger row.
  expect(movedOffice.id).toBe(standing.id)
  expect(movedOffice.facilityId).toBe(standing.facilityId)
  expect(movedOffice.status).toBe('operational')
  expect(moved.studio.cash).toBe(cashBeforeMove)
  expect(JSON.stringify(moved.ledger)).toBe(ledgerBeforeMove)

  // The world followed the building: the same caption, on new ground, still answering.
  expect((await gridDebug(page)).placementLabels).toEqual([
    'DEVELOPMENT OFFICE II · OPERATIONAL',
  ])
  const movedFront = frontCellOf(movedOffice.cells)
  await clickCell(page, DEVELOPMENT_CELL.gx, DEVELOPMENT_CELL.gy) // take the rail away
  await expect(page.getByTestId('lot-building-inspector-writers')).toBeVisible()
  await setGuidance(page, false)
  await clickCell(page, movedFront.gx, movedFront.gy)
  await expect(page.getByTestId(`lot-building-inspector-${officeWorldId}`)).toBeVisible()
  expect((await gridDebug(page)).selectedPlaceId).toBe(officeWorldId)

  // ══ ACT 8 — THE BUILDING COMES DOWN, AND THE SCREENPLAY SURVIVES IT ═══════
  //
  // Deliberately AFTER the commission: an assessment is written once and is permanent,
  // so demolishing the office that raised it may not un-write a single point of it.
  const assessmentBeforeDemolition = JSON.stringify(
    projectAssessment(moved, firstProjectId).assessment,
  )
  const demolishVerb = page.getByTestId('lot-building-inspector-primary-demolish')
  await expect(demolishVerb).toBeEnabled()
  await expect(demolishVerb).toContainText('$300,000')
  await demolishVerb.click()
  await expect(page.getByTestId('lot-demolish-confirm')).toBeVisible()
  await expect(page.getByTestId('lot-demolish-confirm-heading')).toContainText(
    'The studio recovers $300,000.',
  )
  const cashBeforeDemolition = moved.studio.cash
  await page.getByTestId('lot-demolish-confirm-accept').click()

  await expect(page.getByTestId('lot-build-receipt')).toContainText('DEVELOPMENT OFFICE II')
  await expect(page.getByTestId('lot-build-receipt')).toContainText(
    'DEMOLISHED — $300,000 recovered',
  )

  const demolished = await sessionState(page)
  expect(studioPlacement(demolished).placements).toHaveLength(0)
  expect(demolished.studio.cash).toBe(cashBeforeDemolition + 300_000)
  // EXACTLY HALF the capital the studio paid, in the engine's own catalog figures.
  expect((demolished.studio.cash - cashBeforeDemolition) * 2).toBe(OFFICE_2_ENTRY.cost)
  expect(studioPlacement(demolished).weeklyOperatingCost).toBe(0)
  const cleared = await gridDebug(page)
  expect(cleared.placedFacilityIds).toEqual([])
  expect(cleared.placementLabels).toEqual([])

  // THE SCREENPLAY IS UNTOUCHED. Not "close enough" — byte-identical.
  expect(JSON.stringify(projectAssessment(demolished, firstProjectId).assessment)).toBe(
    assessmentBeforeDemolition,
  )

  // ══ ACT 9 — THE STUDIO'S SECOND PICTURE, IN THE SAME BROWSER ══════════════
  //
  // The twice-found defect family lives here: one-shot-per-studio workflows, re-entry
  // after cancellation, stale identity. So the first picture is carried out of
  // development the way a player carries it — auditions, casting review, package,
  // greenlight — and then the commissioning workflow is entered AGAIN.
  await takeGuidanceStep(page, 'Plan auditions at Casting')
  await expect(page.getByTestId('lot-audition-workspace')).toBeVisible()
  await selectLegalSlate(page)
  await page.getByTestId('casting-start').click()
  await expect(page.getByTestId('lot-audition-planning-witness')).toBeVisible()

  await advanceOneWeek(page, 10)
  await takeGuidanceStep(page, 'Review audition results at Casting')
  const castingReview = page.getByTestId('lot-casting-review-panel')
  await expect(castingReview).toBeVisible()
  await castingReview
    .locator('[data-testid^="lot-casting-review-action-acknowledgeCastingSession-"]')
    .click()

  await expect(page.getByTestId('lot-package-workspace')).toBeVisible()
  for (const picker of [
    'picker-director',
    'picker-lead',
    'picker-antagonist',
    'picker-support',
    'picker-craft',
  ]) {
    await chooseFirstEligible(page, picker)
  }
  await page.getByTestId('assembly-next').click()
  await expect(page.getByTestId('step-budget')).toHaveClass(/active/)
  await page.getByTestId('assembly-next').click()
  await expect(page.getByTestId('step-review')).toHaveClass(/active/)
  await expect(page.getByTestId('greenlight')).toBeEnabled()
  await page.getByTestId('greenlight').click()
  await expect(page.getByTestId('hollywood-production-formation-witness')).toHaveText(
    'PICTURE FORMED',
  )
  await expect(page.getByTestId('studio-lot-screen')).toBeVisible()

  // ── the workflow is RE-ENTERED, not re-created ──
  await openCommissionWorkspace(page)
  // The office is gone, so the sentence it earned is gone too — the effects authority is
  // read live, never cached. What it already wrote is still written (asserted above).
  await expect(page.getByTestId('commission-office-uplift')).toHaveCount(0)

  // ── CANCEL, byte-neutral, and then come back to it ──
  const bytesBeforeCancel = await sessionBytes(page)
  await page.getByTestId('lot-commission-workspace-close').click()
  await expect(page.getByTestId('lot-commission-workspace')).toHaveCount(0)
  await expect(page.getByTestId('studio-lot-screen')).toBeVisible()
  await expect(page.getByTestId('writers-room')).toHaveCount(0)
  expect(await sessionBytes(page)).toBe(bytesBeforeCancel)

  await openCommissionWorkspace(page)
  await page.getByTestId('commission-submit').click()
  await expect(page.getByTestId('lot-screenplay-commission-witness')).toBeVisible()

  const twoPictures = await sessionState(page)
  expect(twoPictures.scriptDevelopment.projects).toHaveLength(2)
  const secondProjectId = twoPictures.scriptDevelopment.projects.find(
    (project) => project.id !== firstProjectId,
  )!.id
  expect(secondProjectId).not.toBe(firstProjectId)

  // …and it drafts for real, with no uplift, because the office is no longer standing.
  await advanceOneWeek(page, 11)
  const secondDrafted = await sessionState(page)
  const secondDraft = projectAssessment(secondDrafted, secondProjectId)
  expect(secondDraft.status).toBe('review')
  expect(secondDraft.assessment).not.toBeNull()
  const secondControl = assessmentWithoutOffice(secondDrafted, secondProjectId)
  expect(secondDraft.assessment!.actualStrength).toBeCloseTo(secondControl.actualStrength, 10)
  expect(secondDraft.assessment!.perceivedStrength).toBeCloseTo(
    secondControl.perceivedStrength,
    10,
  )

  // The FIRST picture's stored draft is still exactly what it was written as.
  expect(JSON.stringify(projectAssessment(secondDrafted, firstProjectId).assessment)).toBe(
    assessmentBeforeDemolition,
  )

  // The whole journey ran in ONE world, and nothing threw on the way.
  await expect(page.getByTestId('dev-error')).toHaveCount(0)
  expect(runtime.pageErrors).toEqual([])
  expect(runtime.consoleErrors).toEqual([])
})
