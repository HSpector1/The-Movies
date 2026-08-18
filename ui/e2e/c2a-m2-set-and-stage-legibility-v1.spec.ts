// ── C2a-M2 — THE LEGIBILITY GATE: the set is named, and the stage is bought ──
//
// The §12-M2 gate asks one question in the browser, on the SHIPPED grid origin, and it
// is the Owner's own north star cut down to what M2 actually delivers:
//
//   "my writers create pictures, and I can physically watch multiple films compete for
//    real production resources"
//
// M2's half of that is the RESOURCE, made legible in the two places a player meets it:
//
//   1. AT THE DECISION. Before greenlighting, the package tells the player WHERE the
//      picture would be shot, names the set by name, prices it — quality, how well it
//      suits this picture, its condition, its freshness — and says what standing there
//      is worth to the finished film. Every number is the engine's; this spec computes
//      the same numbers from the same functions and then ALSO pins them literally, so a
//      surface that quietly stopped reading the engine cannot pass by agreeing with
//      itself.
//
//   2. ON THE GROUND. The studio buys a soundstage from the catalog, waits the sixteen
//      weeks it costs, and the building that comes up is a SOUNDSTAGE: it carries the
//      number the studio gave it, says what a soundstage does, says no picture is
//      shooting there, and says the one thing standing between it and a picture — that
//      no scenery is mounted on it yet. That last sentence is the professional-tycoon
//      floor (00F) at the exact moment a player looks at the thing they just paid for:
//      visible causality, and an obvious remedy.
//
// THE FIXTURES ARE BUILT, NOT INJECTED. Both are produced here through public Engine and
// adapter actions only — the `tycoon-build-catalog-v1.spec.ts` pattern — and each is
// proven to replay byte-identically through the live save boundary before the browser
// ever sees it. No hand-written state, and no save file frozen at some other version.
//
// LAW 25: this suite asserts no structural renderer tuple. Those belong to the specs that
// own their fixtures and re-measure them.

import { expect, test, type Locator, type Page } from '@playwright/test'
import {
  advanceWeek,
  castingSessionsBoard,
  commissionScriptAction,
  exportSaveJson,
  foundManagedStudioAction,
  foundingApplicantCards,
  importSaveJson,
  newGame,
  runScriptProjectAction,
  scriptProjectsBoard,
  signContractAction,
  startCastingSessionAction,
  studioLotSnapshot,
  studioPlacement,
  type CreativeRole,
  type GameState,
} from '../src/engine/adapter.ts'
import { packageSetPlan } from '../src/engine/sets.ts'
import {
  conditionWord,
  craftPoints,
  noveltyMultiplier,
  setDriverLines,
  setIdentityLine,
  setUpliftHeadline,
} from '../src/presentation/setVoice.ts'

/** The SHIPPED world. The 5178 origin is pinned to the retained plate and has no buildings. */
const GRID_BASE_URL = 'http://localhost:5179'

const ACTIVE_SESSION_KEY = 'project-studio.active-session.v4'
const ACTIVE_SESSION_CORRUPT_KEY = 'project-studio.active-session.v4.corrupt'
const LOT_FLAG_KEY = 'project-studio.flags.studio-lot-overview'
const HOLLYWOOD_FLAG_KEY = 'project-studio.flags.operation-hollywood'
const TYCOON_FLAG_KEY = 'project-studio.flags.tycoon-world'

const SEED = 'c2a-m2-legibility-v1'

/** The §3.4 Soundstage, and the open road-served ground the placement sweep cleared for it. */
const STAGE_BLUEPRINT = 'stage-standard'
const BUILD_PARCEL = 'south-lawn'

/** Founding, then sixteen weeks of construction through a real renderer, is not quick. */
test.describe.configure({ timeout: 300_000 })

// ── the fixtures, built through public actions only ──────────────────────────

const FOUNDING_COUNTS: Readonly<Record<CreativeRole, number>> = {
  actor: 3,
  director: 1,
  writer: 3,
  craft: 1,
}

/** A managed studio the ordinary way: sign the founding roster, open the doors. */
function foundedStudio(): GameState {
  let state: GameState = newGame(SEED)
  const cards = foundingApplicantCards(state)
  for (const role of ['actor', 'director', 'writer', 'craft'] as const) {
    const chosen = cards
      .filter((card) => card.profile.role === role)
      .slice(0, FOUNDING_COUNTS[role])
    if (chosen.length !== FOUNDING_COUNTS[role]) throw new Error(`fixture lacks ${role} applicants`)
    for (const card of chosen) {
      const signed = signContractAction(state, card.profile.id, 104)
      if (!signed.ok) throw new Error(signed.error)
      state = signed.next
    }
  }
  const founded = foundManagedStudioAction(state)
  if (!founded.ok) throw new Error(founded.error)
  return founded.next
}

/**
 * …and the same studio one screenplay and one set of camera tests later, stopped at the
 * moment the results come in. One click from here opens the package, which is the surface
 * this gate is about.
 */
function studioAtAuditionResults(): GameState {
  let state = foundedStudio()

  const board = scriptProjectsBoard(state)
  const concept = board.commission.concepts[0]!
  const writer = board.commission.writers.find(
    (candidate) => candidate.available && candidate.primaryRole === 'writer',
  )!
  const commissioned = commissionScriptAction(state, {
    conceptId: concept.id,
    writerId: writer.id,
    shape: { opening: 'immediateAction', midpoint: 'revelation', ending: 'bittersweet' },
    promise: {
      genre: concept.genre,
      intendedSegments: ['adult'],
      ranges: {
        intimacy: [-0.4, 0.4],
        tonalWeight: [-0.4, 0.4],
        kineticEnergy: [-0.4, 0.4],
      },
    },
  })
  if (!commissioned.ok) throw new Error(commissioned.error)
  state = advanceWeek(commissioned.next).next

  const accept = scriptProjectsBoard(state).sections.needsReview[0]!.legalActions.find(
    (action) => action.kind === 'acceptScript',
  )
  if (accept === undefined) throw new Error('fixture: the screenplay cannot be accepted')
  const accepted = runScriptProjectAction(state, accept)
  if (!accepted.ok) throw new Error(accepted.error)
  state = accepted.next

  const row = castingSessionsBoard(state).sections.readyToPlan[0]!
  const available = (role: 'lead' | 'antagonist' | 'support'): string[] =>
    row.candidates[role].filter((person) => person.available).map((person) => person.id)
  const lead = available('lead')
  const antagonist = available('antagonist')
  const support = available('support')
  const started = startCastingSessionAction(state, {
    projectId: row.projectId,
    // Two reads per role, three distinct people in all — the smallest legal slate.
    slate: {
      lead: [lead[0]!, lead[1]!],
      antagonist: [antagonist[0]!, antagonist[1]!],
      support: [support[0]!, support[2]!],
    },
  })
  if (!started.ok) throw new Error(started.error)
  return advanceWeek(started.next).next
}

/** A fixture is only a fixture if the live save boundary can carry it there and back. */
function nativeSave(state: GameState, label: string): string {
  const bytes = exportSaveJson(state)
  const replay = importSaveJson(bytes)
  if (!replay.ok) throw new Error(`${label}: ${replay.error}`)
  if (replay.converted) throw new Error(`${label} is not a current save`)
  if (exportSaveJson(replay.state) !== bytes) throw new Error(`${label} does not replay`)
  return bytes
}

const FOUNDED_STATE = foundedStudio()
const FOUNDED_SAVE = nativeSave(FOUNDED_STATE, 'the founded studio')

const RESULTS_STATE = studioAtAuditionResults()
const RESULTS_SAVE = nativeSave(RESULTS_STATE, 'the audition-results studio')

/** The engine's own answer to "where would this picture be shot, and what is that worth". */
const PACKAGE_GENRE = scriptProjectsBoard(FOUNDED_STATE).commission.concepts[0]!.genre
const SET_PLAN = packageSetPlan(RESULTS_STATE, PACKAGE_GENRE)
const PLANNED_SET = SET_PLAN.planned!

/** The catalog row for the Soundstage, as the engine publishes it. */
const STAGE_ENTRY = studioLotSnapshot(FOUNDED_STATE).placement!.catalog.find(
  (row) => row.blueprintId === STAGE_BLUEPRINT,
)!

// ── harness ──────────────────────────────────────────────────────────────────

function watchRuntime(page: Page) {
  const pageErrors: string[] = []
  const consoleErrors: string[] = []
  page.on('pageerror', (error) => pageErrors.push(String(error)))
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })
  return { pageErrors, consoleErrors }
}

/** Expose the live grid renderer so a spec can turn a grid cell into a screen point. */
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
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto(`${GRID_BASE_URL}/`)
  await expect(page.getByTestId('studio-lot-screen')).toBeVisible()
  await expect(page.getByTestId('studio-lot-canvas').locator('canvas')).toHaveCount(1)
  await expect(page.getByText('Preparing the lot…', { exact: true })).toHaveCount(0)
  await expect(page.getByTestId('dev-error')).toHaveCount(0)
}

/** The guidance card is a real card over the world; fold it before clicking past it. */
async function foldGuidance(page: Page): Promise<void> {
  const toggle = page.getByTestId('lot-picture-guidance-toggle')
  if ((await toggle.count()) === 0) return
  if ((await toggle.getAttribute('aria-expanded')) === 'true') await toggle.click()
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
}

async function advanceOneWeek(page: Page, to: number): Promise<void> {
  await page.getByTestId('lot-advance-week').click()
  await expect(page.locator('.lot-sub')).toHaveText(new RegExp(`Week ${String(to)}$`))
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

// ── 1. AT THE DECISION — the package names the set and prices it ─────────────

test('the package names the set the picture would stand on, and what standing there is worth', async ({
  page,
}) => {
  const runtime = watchRuntime(page)
  await seed(page, RESULTS_SAVE)

  // The results are in, and the world says so where the work happened.
  await expect(page.getByTestId('lot-nav-casting')).toHaveAttribute(
    'data-attention',
    'decision-required',
  )
  // …and the guidance card names the one next step, which is how a player gets there.
  const next = page.getByTestId('lot-picture-guidance-next')
  await expect(next).toHaveText('Review audition results at Casting')
  await next.click()
  const review = page.getByTestId('lot-casting-review-panel')
  await expect(review).toBeVisible()

  // …and the studio takes them straight to the package, without leaving the lot.
  const toPackage = review.locator(
    '[data-testid^="lot-casting-review-action-acknowledgeCastingSession-"]',
  )
  await expect(toPackage).toHaveText('Take results to Package')
  await toPackage.click()
  await expect(page.getByTestId('lot-package-workspace')).toBeVisible()
  await expect(page.getByTestId('step-talent')).toHaveClass(/active/)

  // Fill the slate the ordinary way, with whoever the picker offers first.
  for (const picker of [
    'picker-director',
    'picker-lead',
    'picker-antagonist',
    'picker-support',
    'picker-craft',
  ]) {
    const choice = page.getByTestId(picker).locator('button[aria-pressed]:not([disabled])').first()
    await choice.scrollIntoViewIfNeeded()
    await choice.click()
  }
  await page.getByTestId('assembly-next').click()
  await expect(page.getByTestId('step-budget')).toHaveClass(/active/)
  await page.getByTestId('assembly-next').click()
  await expect(page.getByTestId('step-review')).toHaveClass(/active/)

  // ── THE PHYSICAL PANEL — the whole point of the milestone ─────────────────
  const panel = page.getByTestId('pkg-set')
  await panel.scrollIntoViewIfNeeded()
  await expect(panel).toBeVisible()

  // IT NAMES THE SET, and the stage it stands on. Literally, and as the engine says it.
  await expect(page.getByTestId('pkg-set-identity')).toHaveText(setIdentityLine(PLANNED_SET))
  await expect(page.getByTestId('pkg-set-identity')).toContainText('Stage 7 House Set')
  await expect(page.getByTestId('pkg-set-identity')).toContainText('Soundstage 7')
  expect(PLANNED_SET.setId).toBe('set-0')
  expect(PLANNED_SET.stageFacilityId).toBe('facility-soundstage-07')

  // …and it says what standing there is WORTH, in craft and in opening.
  await expect(page.getByTestId('pkg-set-uplift-value')).toHaveText(
    `${craftPoints(PLANNED_SET.upliftPoints)} craft · ${noveltyMultiplier(PLANNED_SET.noveltyFactor)} opening`,
  )
  await expect(page.getByTestId('pkg-set-uplift-value')).toHaveText('+4.7 craft · ×1.00 opening')
  await expect(page.getByTestId('pkg-set-uplift-headline')).toHaveText(
    setUpliftHeadline(PLANNED_SET, SET_PLAN.maxUplift),
  )
  await expect(page.getByTestId('pkg-set-uplift-share')).toContainText('47%')

  // ── THE FOUR READINGS the gate names, each with its number and its remedy ──
  const drivers = new Map(setDriverLines(PLANNED_SET, SET_PLAN).map((line) => [line.key, line]))
  expect([...drivers.keys()]).toEqual(['quality', 'fit', 'condition', 'novelty'])

  for (const [key, reading, effect] of [
    ['quality', '45 of 100', '+2.7 craft'],
    ['fit', '50%', '+2.0 craft'],
    ['condition', '100 of 100 · Sound', null],
    ['novelty', '100%', '×1.00 opening'],
  ] as Array<[string, string, string | null]>) {
    const row = page.getByTestId(`pkg-set-driver-${key}`)
    await expect(row, `${key} is missing from the package`).toBeVisible()
    const line = drivers.get(key)!
    // The engine's own reading, and the literal number, so agreement is not enough.
    expect(line.reading, `${key} reading`).toBe(reading)
    expect(line.effect, `${key} effect`).toBe(effect)
    await expect(row).toContainText(reading)
    if (effect !== null) await expect(row).toContainText(effect)
    await expect(row).toContainText(line.label)
    // …and something the player can DO about it (00F: an obvious remedy).
    await expect(page.getByTestId(`pkg-set-response-${key}`)).toHaveText(line.response)
    expect(line.response.length, `${key} offers no response`).toBeGreaterThan(0)
  }

  // Condition and freshness are stated in the badge too, in a word.
  await expect(page.getByTestId('pkg-set-condition-badge')).toHaveText(
    conditionWord(PLANNED_SET.conditionBand),
  )
  await expect(page.getByTestId('pkg-set-condition-badge')).toHaveText('Sound')

  // The remedy the panel points at is a REAL catalogue entry, priced and timed.
  expect(SET_PLAN.bestBuildable?.name).toBe('Jungle Clearing')
  await expect(page.getByTestId('pkg-set-response-fit')).toContainText('Jungle Clearing')
  await expect(page.getByTestId('pkg-set-response-fit')).toContainText('Scenery Shop')

  // Reading the package changed nothing: the studio is exactly where it was.
  await page.getByTestId('lot-package-workspace-close').click()
  await expect(page.getByTestId('lot-package-workspace')).toHaveCount(0)
  await expect(page.getByTestId('studio-lot-screen')).toBeVisible()

  expect(runtime.pageErrors).toEqual([])
  expect(runtime.consoleErrors).toEqual([])
})

// ── 2. ON THE GROUND — the studio buys a stage, and the stage speaks ─────────

test('the studio commissions a Soundstage, and the stage it built says what it is', async ({
  page,
}) => {
  const runtime = watchRuntime(page)
  await seed(page, FOUNDED_SAVE)
  await foldGuidance(page)

  // The catalog offers a soundstage, priced, timed, and saying what it does.
  await page.getByTestId(`lot-nav-parcel-${BUILD_PARCEL}`).focus()
  await page.getByTestId(`lot-nav-parcel-${BUILD_PARCEL}`).press('Enter')
  await page.getByTestId(`lot-parcel-build-${BUILD_PARCEL}`).click()
  await expect(page.getByTestId('lot-build-catalog')).toBeVisible()

  const row = page.getByTestId(`lot-build-blueprint-${STAGE_BLUEPRINT}`)
  await expect(row).toBeVisible()
  await expect(row).toContainText('Soundstage')
  await expect(row).toContainText(`${String(STAGE_ENTRY.buildWeeks)} weeks`)
  await expect(page.getByTestId(`lot-build-effect-${STAGE_BLUEPRINT}`)).toHaveText(
    STAGE_ENTRY.effectSummary,
  )
  // The engine's own sentence tells a player what a stage is FOR, including the set law.
  expect(STAGE_ENTRY.effectSummary).toContain('a set must stand on a stage')
  await expect(row).toHaveAttribute('data-state', 'buildable')

  // Put it on the open ground the sweep cleared for a 4×4.
  await row.click()
  await expect(page.getByTestId('lot-build-origin')).toBeVisible()
  await expect(page.getByTestId('lot-build-verdict')).toHaveAttribute('data-ok', 'true')
  await expect(page.getByTestId('lot-build-commit')).toContainText('Soundstage')
  await page.getByTestId('lot-build-commit').click()
  await expect(page.getByTestId('lot-build-receipt')).toContainText('committed to Soundstage')

  // Sixteen weeks of construction, one week at a time, the way the player pays for it.
  for (let week = 1; week <= STAGE_ENTRY.buildWeeks; week += 1) {
    await advanceOneWeek(page, week)
  }

  // The stage really stands, and the ENGINE says so — a third soundstage on the lot.
  const state = await sessionState(page)
  const placed = studioPlacement(state).placements.find(
    (entry) => entry.blueprintId === STAGE_BLUEPRINT,
  )!
  expect(placed.status).toBe('operational')
  const stages = studioLotSnapshot(state).stages!
  expect(stages).toHaveLength(3)
  expect(stages.at(-1)).toMatchObject({
    facilityId: placed.facilityId,
    buildingId: `placed-${String(placed.id)}`,
    origin: 'placed',
    standing: true,
  })

  // ── THE SIGN SPEAKS ───────────────────────────────────────────────────────
  await foldGuidance(page)
  const front = [...placed.cells].sort((a, b) => a.gx + a.gy - (b.gx + b.gy)).at(-1)!
  await clickCell(page, front.gx, front.gy)

  const inspector = page.getByTestId(`lot-building-inspector-placed-${String(placed.id)}`)
  await expect(inspector).toBeVisible()

  // It carries the number the studio gave it — not "stage-standard", not "facility-stage-1".
  await expect(page.getByTestId('lot-building-inspector-heading')).toHaveText('Soundstage 1')
  expect(placed.name).toBe('Soundstage 1')

  // It says what a soundstage does — the same sentence the catalog sold it with.
  await expect(inspector.locator('.hollywood-building-inspector-role')).toHaveText(
    STAGE_ENTRY.effectSummary,
  )

  // It says nothing is shooting here, in the words its founding siblings use…
  await expect(inspector).toContainText('The stage is dark — no picture is shooting here.')

  // …and it says the ONE thing standing between it and a picture, with the remedy in it.
  // This is the professional floor at the moment a player looks at what they just bought:
  // a bare stage that said only "Available" would be true and useless.
  await expect(inspector).toContainText(
    'No set is mounted here — nothing can be filmed on this stage until one is built.',
  )

  // It is a real facility with real capacity and a real bill, stated plainly.
  await expect(inspector).toContainText('0/1 slot in use')
  await expect(inspector).toContainText('South Lawn')

  expect(runtime.pageErrors).toEqual([])
  expect(runtime.consoleErrors).toEqual([])
})
