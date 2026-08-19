// ── C2a-M3 §12-M3 LEGIBILITY — "a writer goes to work and eventually hands me a
//    new movie" ──────────────────────────────────────────────────────────────
//
// The Owner's own sentence, asked in a real browser on the SHIPPED grid world.
// The milestone's gate names two things a player must be able to SEE — "the board
// shows 'An Original Screenplay by ‹writer›' and the generated title before and
// after rename" — and this spec walks the whole verb chain that produces them:
//
//   1. COMMISSION AN ORIGINAL, in the live Lot's own commission workspace. Not a
//      premise bought from the market — a genre, a creative shape, and one of the
//      studio's own contracted writers. The form states how many weeks it will
//      take BEFORE the commitment, in the engine's own number.
//   2. THE TITLE ARRIVES. The studio's writers name the picture, and when they
//      hand the draft in the world says so in the fantasy's own words:
//      "‹Writer› delivers ‘TITLE’."
//   3. RENAME IT, without ceremony — one field, one button.
//   4. PROVENANCE ON THE BOARD, and the renamed picture live everywhere, while
//      the working title the writers gave it stands beside it as the record.
//   5. THE RENAMED TITLE ON THE PACKAGE, with the credit, and — joined to M2's own
//      set panel — what the SCRIPT calls for: the locations its beats ask for.
//
// THE FIXTURES ARE BUILT, NOT INJECTED. Both are produced through public Engine
// and adapter actions only (the `c2a-m2-set-and-stage-legibility-v1` pattern) and
// each is proven to replay byte-identically through the live save boundary before
// the browser sees it. No hand-written state, and no save frozen at some other
// version.
//
// LAW 25: this suite asserts no structural renderer tuple. Those belong to the
// specs that own their fixtures and re-measure them.

import { expect, test, type Page } from '@playwright/test'
import {
  advanceWeek,
  castingSessionsBoard,
  exportSaveJson,
  foundManagedStudioAction,
  foundingApplicantCards,
  importSaveJson,
  newGame,
  runScriptProjectAction,
  scriptProjectsBoard,
  signContractAction,
  startCastingSessionAction,
  type CreativeRole,
  type GameState,
} from '../src/engine/adapter.ts'
import {
  commissionOriginalScreenplayAction,
  originalDraftEstimate,
  renameScreenplayAction,
  screenplayIdentityForProject,
} from '../src/engine/screenplay.ts'

/** The SHIPPED world. The 5178 origin is pinned to the retained plate. */
const GRID_BASE_URL = 'http://localhost:5179'

const ACTIVE_SESSION_KEY = 'project-studio.active-session.v4'
const ACTIVE_SESSION_CORRUPT_KEY = 'project-studio.active-session.v4.corrupt'
const LOT_FLAG_KEY = 'project-studio.flags.studio-lot-overview'
const HOLLYWOOD_FLAG_KEY = 'project-studio.flags.operation-hollywood'
const TYCOON_FLAG_KEY = 'project-studio.flags.tycoon-world'

const SEED = 'c2a-m3-renewable-screenplay-v1'
const RENAMED_TITLE = 'The Long Way Down'
const DIRECTION = 'crime'

/** Founding, a real draft, a real audition, and a real renderer is not quick. */
test.describe.configure({ timeout: 300_000 })

// ── the fixtures, built through public actions only ──────────────────────────

const FOUNDING_COUNTS: Readonly<Record<CreativeRole, number>> = {
  actor: 3,
  director: 1,
  writer: 3,
  craft: 1,
}

/** A managed studio the ordinary way: sign the founding roster, open the doors. */
function foundedStudio(seed: string): GameState {
  let state: GameState = newGame(seed)
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

function firstAvailableWriter(state: GameState): { id: string; name: string } {
  const writer = scriptProjectsBoard(state).commission.writers.find(
    (candidate) => candidate.available && candidate.primaryRole === 'writer',
  )
  if (writer === undefined) throw new Error('fixture: no writer is available')
  return { id: writer.id, name: writer.name }
}

/**
 * …and the same studio with an ORIGINAL screenplay written, accepted, RENAMED, and
 * one set of camera tests back. One click from here opens the package.
 */
function studioAtAuditionResults(): {
  state: GameState
  workingTitle: string
  writerName: string
} {
  let state = foundedStudio(`${SEED}-package`)
  const writer = firstAvailableWriter(state)
  const commissioned = commissionOriginalScreenplayAction(state, {
    writerId: writer.id,
    genre: DIRECTION,
    shape: { opening: 'immediateAction', midpoint: 'revelation', ending: 'bittersweet' },
    promise: {
      genre: DIRECTION,
      intendedSegments: ['adult'],
      ranges: { intimacy: [-0.4, 0.4], tonalWeight: [-0.4, 0.4], kineticEnergy: [-0.4, 0.4] },
    },
  })
  if (!commissioned.ok) throw new Error(commissioned.error)
  state = commissioned.next
  const projectId = state.scriptDevelopment.projects.at(-1)!.id
  const identity = screenplayIdentityForProject(state, projectId)
  if (identity === null) throw new Error('fixture: the minted screenplay has no identity')
  const workingTitle = identity.title

  // The writers take as many weeks as the ENGINE says they take.
  for (let week = 0; week < 12; week += 1) {
    if (scriptProjectsBoard(state).sections.needsReview.length > 0) break
    state = advanceWeek(state).next
  }
  const accept = scriptProjectsBoard(state).sections.needsReview[0]?.legalActions.find(
    (action) => action.kind === 'acceptScript',
  )
  if (accept === undefined) throw new Error('fixture: the screenplay cannot be accepted')
  const accepted = runScriptProjectAction(state, accept)
  if (!accepted.ok) throw new Error(accepted.error)
  state = accepted.next

  const renamed = renameScreenplayAction(state, identity.conceptId, RENAMED_TITLE)
  if (!renamed.ok) throw new Error(renamed.error)
  state = renamed.next

  const row = castingSessionsBoard(state).sections.readyToPlan[0]!
  const available = (role: 'lead' | 'antagonist' | 'support'): string[] =>
    row.candidates[role].filter((person) => person.available).map((person) => person.id)
  const lead = available('lead')
  const antagonist = available('antagonist')
  const support = available('support')
  const started = startCastingSessionAction(state, {
    projectId: row.projectId,
    slate: {
      lead: [lead[0]!, lead[1]!],
      antagonist: [antagonist[0]!, antagonist[1]!],
      support: [support[0]!, support[2]!],
    },
  })
  if (!started.ok) throw new Error(started.error)
  return { state: advanceWeek(started.next).next, workingTitle, writerName: writer.name }
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

const FOUNDED_STATE = foundedStudio(SEED)
const FOUNDED_SAVE = nativeSave(FOUNDED_STATE, 'the founded studio')
const FOUNDED_WRITER = firstAvailableWriter(FOUNDED_STATE)
/** The engine's own clock for this studio, this writer, this creative direction. */
const DRAFT_ESTIMATE = originalDraftEstimate(FOUNDED_STATE, {
  writerId: FOUNDED_WRITER.id,
  genre: DIRECTION,
})

const RESULTS = studioAtAuditionResults()
const RESULTS_SAVE = nativeSave(RESULTS.state, 'the audition-results studio')
const RESULTS_SCREENPLAY = screenplayIdentityForProject(
  RESULTS.state,
  RESULTS.state.scriptDevelopment.projects.at(-1)!.id,
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

async function seed(page: Page, save: string): Promise<void> {
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

/** The guidance card is a real card over the world; fold it before working past it. */
async function foldGuidance(page: Page): Promise<void> {
  const toggle = page.getByTestId('lot-picture-guidance-toggle')
  if ((await toggle.count()) === 0) return
  if ((await toggle.getAttribute('aria-expanded')) === 'true') await toggle.click()
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
}

async function sessionState(page: Page): Promise<GameState> {
  const value = await page.evaluate((key) => localStorage.getItem(key), ACTIVE_SESSION_KEY)
  if (value === null) throw new Error('active session is missing')
  const replay = importSaveJson(value)
  if (!replay.ok) throw new Error(replay.error)
  return replay.state
}

/** Select Development in the live world, the way the companion rail offers it. */
async function openDevelopment(page: Page): Promise<void> {
  const opener = page.getByTestId('lot-nav-writers')
  await opener.focus()
  await expect(opener).toBeFocused()
  await opener.press('Enter')
}

/** …and take the verb Development is offering, which opens the retained workspace. */
async function openCommissionWorkspace(page: Page): Promise<void> {
  await openDevelopment(page)
  const verb = page.getByTestId('lot-building-inspector-primary-commission')
  await expect(verb).toHaveText('Commission a screenplay')
  await verb.click()
  await expect(page.getByTestId('lot-commission-workspace')).toBeVisible()
  await expect(page.getByTestId('commission-panel')).toBeVisible()
}

// ── 1. THE WHOLE CHAIN — commission, deliver, rename, credit ─────────────────

test('a writer goes to work, hands over a titled picture, and the studio may retitle it', async ({
  page,
}) => {
  const runtime = watchRuntime(page)
  await seed(page, FOUNDED_SAVE)
  await foldGuidance(page)

  // ── COMMISSION AN ORIGINAL, in the live Lot's own workspace ───────────────
  await openCommissionWorkspace(page)

  // The market path is the default while the market still has premises to sell.
  await expect(page.getByTestId('script-concept')).toBeVisible()
  await page.getByTestId('script-source-original').check()

  // …and choosing the studio's own writers asks for a DIRECTION, not a premise.
  await expect(page.getByTestId('script-concept')).toHaveCount(0)
  await page.getByTestId('script-direction').selectOption(DIRECTION)
  await page.getByTestId('script-writer').selectOption(FOUNDED_WRITER.id)

  // THE FORM STATES THE CLOCK BEFORE THE COMMITMENT (`00E`.9), in the engine's
  // own weeks — and this spec computes the same number from the same function.
  await expect(page.getByTestId('commission-writing-weeks')).toHaveText(
    `An original at this office: about ${String(DRAFT_ESTIMATE.weeks)} ${
      DRAFT_ESTIMATE.weeks === 1 ? 'week' : 'weeks'
    } of writing.`,
  )
  await expect(page.getByTestId('commission-pace-note')).toHaveText(DRAFT_ESTIMATE.pace)
  await expect(page.getByTestId('commission-consequence')).toContainText(
    DRAFT_ESTIMATE.consequence,
  )

  await expect(page.getByTestId('commission-submit')).toHaveText(
    'Commission an original screenplay',
  )
  await page.getByTestId('commission-submit').click()
  await expect(page.getByTestId('lot-commission-workspace')).toHaveCount(0)

  // ── THE TITLE EXISTS THE MOMENT THE COMMISSION COMMITS ────────────────────
  const commissioned = await sessionState(page)
  expect(commissioned.scriptDevelopment.projects).toHaveLength(1)
  const projectId = commissioned.scriptDevelopment.projects[0]!.id
  const minted = screenplayIdentityForProject(commissioned, projectId)!
  expect(minted.provenance.origin).toBe('original')
  expect(minted.provenance.writerName).toBe(FOUNDED_WRITER.name)
  expect(minted.provenance.generatedTitle).toBe(minted.title)
  expect(minted.conceptId.startsWith('concept-orig-')).toBe(true)
  const workingTitle = minted.title

  // ── THE WRITER GOES TO WORK, AND THE DRAFT COMES IN ───────────────────────
  const dueWeek = commissioned.scriptDevelopment.projects[0]!.dueWeek!
  expect(dueWeek).toBe(DRAFT_ESTIMATE.weeks)
  for (let week = 1; week <= dueWeek; week += 1) {
    await page.getByTestId('lot-advance-week').click()
    await expect(page.locator('.lot-sub')).toHaveText(new RegExp(`Week ${String(week)}$`))
  }

  // The world says a decision is waiting where the work happened.
  await expect(page.getByTestId('lot-nav-writers')).toHaveAttribute(
    'data-attention',
    'decision-required',
  )
  await openDevelopment(page)
  const review = page.getByTestId('lot-script-review-panel')
  await expect(review).toBeVisible()

  // ── THE FANTASY, IN THE FANTASY'S OWN WORDS ───────────────────────────────
  await expect(review.getByTestId('lot-script-review-delivery')).toHaveText(
    `${FOUNDED_WRITER.name} delivers ‘${workingTitle}’.`,
  )
  await expect(review.getByTestId('lot-script-review-provenance-label')).toHaveText(
    `An Original Screenplay by ${FOUNDED_WRITER.name}`,
  )
  // Nothing has been retitled, so nothing claims it has.
  await expect(review.getByTestId('lot-script-review-working-title')).toHaveCount(0)

  // ── RENAME IT, WITHOUT CEREMONY ───────────────────────────────────────────
  await review.getByTestId('lot-script-review-open-details').click()
  await expect(page.getByTestId('writers-room')).toBeVisible()

  // THE BOARD SHOWS THE CREDIT AND THE GENERATED TITLE — the §12-M3 gate, before.
  await expect(page.getByTestId(`script-provenance-label-${projectId}`)).toHaveText(
    `An Original Screenplay by ${FOUNDED_WRITER.name}`,
  )
  await expect(page.getByTestId(`script-title-moment-${projectId}`)).toHaveText(
    `${FOUNDED_WRITER.name} delivers ‘${workingTitle}’.`,
  )

  await page.getByTestId(`script-rename-open-${projectId}`).click()
  await page.getByTestId(`script-rename-input-${projectId}`).fill(RENAMED_TITLE)
  await page.getByTestId(`script-rename-save-${projectId}`).click()

  // …AND AFTER. The new title is live, and the working title stands as the record.
  await expect(page.getByTestId(`script-card-${projectId}`)).toContainText(RENAMED_TITLE)
  await expect(page.getByTestId(`script-title-moment-${projectId}`)).toHaveText(
    `${FOUNDED_WRITER.name} delivers ‘${RENAMED_TITLE}’.`,
  )
  await expect(page.getByTestId(`script-working-title-${projectId}`)).toHaveText(
    `Written as ‘${workingTitle}’.`,
  )
  await expect(page.getByTestId(`script-provenance-label-${projectId}`)).toHaveText(
    `An Original Screenplay by ${FOUNDED_WRITER.name}`,
  )

  // The ENGINE agrees, and identity never moved: one field written, one week stamped.
  const renamed = await sessionState(page)
  const after = screenplayIdentityForProject(renamed, projectId)!
  expect(after.title).toBe(RENAMED_TITLE)
  expect(after.conceptId).toBe(minted.conceptId)
  expect(after.provenance.generatedTitle).toBe(workingTitle)
  expect(after.provenance.renamed).toBe(true)
  expect(renamed.concepts).toHaveLength(commissioned.concepts.length)

  expect(runtime.pageErrors).toEqual([])
  expect(runtime.consoleErrors).toEqual([])
})

// ── 2. AT THE DECISION — the renamed picture, its credit, and its demand ─────

test('the package carries the renamed title, the credit, and what the script calls for', async ({
  page,
}) => {
  const runtime = watchRuntime(page)
  await seed(page, RESULTS_SAVE)

  // The results are in, and the guidance card names the one next step.
  const next = page.getByTestId('lot-picture-guidance-next')
  await expect(next).toHaveText('Review audition results at Casting')
  await next.click()
  const review = page.getByTestId('lot-casting-review-panel')
  await expect(review).toBeVisible()

  const toPackage = review.locator(
    '[data-testid^="lot-casting-review-action-acknowledgeCastingSession-"]',
  )
  await expect(toPackage).toHaveText('Take results to Package')
  await toPackage.click()
  await expect(page.getByTestId('lot-package-workspace')).toBeVisible()
  await expect(page.getByTestId('step-talent')).toHaveClass(/active/)

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

  // ── THE RENAMED TITLE, at the moment the money is committed ───────────────
  await expect(page.getByTestId('lot-package-workspace')).toContainText(RENAMED_TITLE)

  // ── THE CREDIT ────────────────────────────────────────────────────────────
  const credit = page.getByTestId('pkg-screenplay-credit')
  await credit.scrollIntoViewIfNeeded()
  await expect(page.getByTestId('pkg-screenplay-origin')).toHaveText('Original')
  await expect(credit).toHaveText(`An Original Screenplay by ${RESULTS.writerName}`)
  await expect(page.getByTestId('pkg-screenplay-working-title')).toHaveText(
    `Written as ‘${RESULTS.workingTitle}’.`,
  )

  // ── WHAT THE SCRIPT CALLS FOR — the beat structure IS the set demand ──────
  const demand = page.getByTestId('pkg-set-demand')
  await demand.scrollIntoViewIfNeeded()
  await expect(demand).toBeVisible()
  expect(RESULTS_SCREENPLAY.requiredSets.length).toBeGreaterThan(0)
  for (const row of RESULTS_SCREENPLAY.requiredSets) {
    const line = page.getByTestId(`pkg-set-demand-${row.setType}`)
    await expect(line).toContainText(`The script calls for ${row.label}`)
    for (const beat of row.beats) await expect(line).toContainText(beat)
    await expect(page.getByTestId(`pkg-set-demand-standing-${row.setType}`)).toHaveText(
      row.standing ? 'Standing' : 'Not built',
    )
  }

  // FIT AND DEMAND ARE ADVISORY (§3.1/§3.5): the greenlight is not blocked by a
  // location the studio has not built, and the panel never says it is.
  await expect(page.getByTestId('pkg-set-advisory')).toBeVisible()
  await expect(page.getByTestId('greenlight')).toBeEnabled()

  // Reading the package changed nothing: the studio is exactly where it was.
  await page.getByTestId('lot-package-workspace-close').click()
  await expect(page.getByTestId('lot-package-workspace')).toHaveCount(0)
  await expect(page.getByTestId('studio-lot-screen')).toBeVisible()

  expect(runtime.pageErrors).toEqual([])
  expect(runtime.consoleErrors).toEqual([])
})
