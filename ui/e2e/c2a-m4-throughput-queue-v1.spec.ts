// ── C2a-M4 §12-M4 — THROUGHPUT, in a real browser ────────────────────────────
//
// The campaign's north star is the Owner's own sentence: *"…I can physically
// watch multiple films compete for real production resources."* M4 deletes the
// two-film cap (owner law 1) and replaces it with a QUEUE that owner law 2 says
// the player must be able to READ. This spec asks both halves of that on the
// SHIPPED grid world, with fixtures built through public actions only.
//
//   G16 — THE QUEUE IS ON A SCREEN. Three pictures are greenlit on a lot with two
//   Development & Casting rooms. The third is not refused: it QUEUES, and the
//   Studio Calendar's queue panel says WHAT IS WAITING, WHAT IT NEEDS, WHO HAS
//   IT and WHEN IT FREES, and offers remedies that carry a price and a duration.
//   Then the weeks are advanced, a room frees, the queue DRAINS into the third
//   picture, and the panel empties honestly.
//
//   F4 (§10) — THE COMMISSION VERB STOPS DEMANDING AN IDLE BOARD. A studio with
//   a screenplay already being written and a second room free commissions the
//   next one from the world, and its witness card appears. Before this milestone
//   the workspace published nothing at all while any other work was in flight.
//
// THE FIXTURES ARE BUILT, NOT INJECTED (the `c2a-m2` / `c2a-m3` pattern), and
// each is proven to replay byte-identically through the live save boundary
// before the browser sees it.

import { expect, test, type Page } from '@playwright/test'
import {
  advanceWeek,
  commissionScriptAction,
  exportSaveJson,
  findConcept,
  foundManagedStudioAction,
  foundingApplicantCards,
  greenlightScriptProject,
  importSaveJson,
  newGame,
  requiredNegative,
  runScriptProjectAction,
  scriptProjectsBoard,
  signContractAction,
  studioQueueBoard,
  type CreativeRole,
  type DraftPackage,
  type GameState,
} from '../src/engine/adapter.ts'

/** The SHIPPED world. The 5178 origin is pinned to the retained plate. */
const GRID_BASE_URL = 'http://localhost:5179'

const ACTIVE_SESSION_KEY = 'project-studio.active-session.v4'
const ACTIVE_SESSION_CORRUPT_KEY = 'project-studio.active-session.v4.corrupt'
const LOT_FLAG_KEY = 'project-studio.flags.studio-lot-overview'
const HOLLYWOOD_FLAG_KEY = 'project-studio.flags.operation-hollywood'
const TYCOON_FLAG_KEY = 'project-studio.flags.tycoon-world'

const SEED = 'c2a-m4-throughput-queue-v1'

/** Founding, three screenplays and three greenlights through a real renderer is not quick. */
test.describe.configure({ timeout: 300_000 })

// ── the fixtures, built through public actions only ──────────────────────────

/**
 * Deep enough to staff THREE pictures at once — three directors, three craft
 * leads, nine actors, and a writer for each screenplay. The queue this spec is
 * about must be a ROOM shortage, not a roster shortage: if the third greenlight
 * were refused for want of a director, it would never reach the front door whose
 * behaviour is the subject.
 */
const FOUNDING_COUNTS: Readonly<Record<CreativeRole, number>> = {
  actor: 9,
  director: 3,
  writer: 5,
  craft: 3,
}

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

function contracted(state: GameState, role: CreativeRole) {
  return state.contracts
    .map((contract) => state.talent.find((person) => person.id === contract.talentId))
    .filter((person): person is NonNullable<typeof person> => person?.role === role)
}

/** Commission one screenplay, taking the first free room and an unused writer. */
function commissionOne(state: GameState): GameState {
  const usedWriters = new Set(state.scriptDevelopment.projects.map((project) => project.writerId))
  const usedConcepts = new Set(state.scriptDevelopment.projects.map((project) => project.conceptId))
  const concept = state.concepts.find((candidate) => !usedConcepts.has(candidate.id))
  const writer = scriptProjectsBoard(state).commission.writers.find(
    (candidate) =>
      candidate.available && candidate.primaryRole === 'writer' && !usedWriters.has(candidate.id),
  )
  if (concept === undefined || writer === undefined) throw new Error('fixture: nothing to commission')
  const outcome = commissionScriptAction(state, {
    conceptId: concept.id,
    writerId: writer.id,
    shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' },
    promise: {
      genre: concept.genre,
      intendedSegments: ['adult'],
      ranges: { intimacy: [-0.5, 0.5], tonalWeight: [-0.5, 0.5], kineticEnergy: [-0.5, 0.5] },
    },
  })
  if (!outcome.ok) throw new Error(outcome.error)
  return outcome.next
}

/** Accept whatever is waiting to be read, or move a week. */
function settleScreenplays(state: GameState, until: number): GameState {
  let current = state
  for (let guard = 0; guard < 40; guard += 1) {
    const board = scriptProjectsBoard(current)
    if (board.sections.readyToPackage.length >= until) return current
    const review = board.sections.needsReview[0]
    if (review !== undefined) {
      const accept = review.legalActions.find((action) => action.kind === 'acceptScript')
      if (accept === undefined) throw new Error('fixture: a review offers no acceptance')
      const accepted = runScriptProjectAction(current, accept)
      if (!accepted.ok) throw new Error(accepted.error)
      current = accepted.next
      continue
    }
    current = advanceWeek(current).next
  }
  throw new Error('fixture: the screenplays never settled')
}

/** Greenlight the Nth accepted screenplay with its own director, craft lead and cast. */
function greenlightLane(state: GameState, lane: number): GameState {
  const locked = scriptProjectsBoard(state).packages[0]
  if (locked === undefined) throw new Error('fixture: no accepted screenplay to greenlight')
  const concept = findConcept(state, locked.concept.id)
  if (concept === undefined) throw new Error('fixture: the accepted screenplay has no concept')
  const directors = contracted(state, 'director').slice(lane)
  const actors = contracted(state, 'actor').slice(lane * 3)
  const crafts = contracted(state, 'craft').slice(lane)
  const draft: DraftPackage = {
    conceptId: locked.concept.id,
    shape: locked.lockedShape,
    promise: locked.lockedPromise,
    writerId: locked.writer.id,
    directorId: directors[0]!.id,
    cast: { lead: actors[0]!.id, antagonist: actors[1]!.id, support: actors[2]!.id },
    craftIds: [crafts[0]!.id],
    budget: {
      negative: requiredNegative(concept, locked.lockedShape, state),
      marketing: 100_000,
    },
  }
  const outcome = greenlightScriptProject(state, locked.projectId, draft)
  if (!outcome.ok) throw new Error(outcome.error)
  return outcome.next
}

/**
 * THE SUBJECT: two pictures in flight holding both Development & Casting rooms,
 * and a THIRD greenlight that the lot could not start — waiting in the queue,
 * holding nothing.
 */
function studioWithAQueuedThirdPicture(): GameState {
  let state = foundedStudio(SEED)
  // Two rooms, so two screenplays at a time; the third follows as they clear.
  state = commissionOne(state)
  state = commissionOne(state)
  state = settleScreenplays(state, 2)
  state = commissionOne(state)
  state = settleScreenplays(state, 3)
  for (const lane of [0, 1, 2]) state = greenlightLane(state, lane)
  if (state.studio.activeProductions.length !== 2) {
    throw new Error('fixture: the lot should have started exactly two pictures')
  }
  if (state.productionQueue.length !== 1) {
    throw new Error('fixture: the third greenlight should be WAITING, not refused')
  }
  return state
}

/** A studio with one screenplay being written and the other room standing free. */
function studioWithWorkInFlight(): GameState {
  return commissionOne(foundedStudio(`${SEED}-f4`))
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

const QUEUED_STATE = studioWithAQueuedThirdPicture()
const QUEUED_SAVE = nativeSave(QUEUED_STATE, 'the queued-third-picture studio')
/** The engine's own row for the waiter, so the browser is measured against it. */
const QUEUED_WAITER = studioQueueBoard(QUEUED_STATE).waiters[0]!

const IN_FLIGHT_STATE = studioWithWorkInFlight()
const IN_FLIGHT_SAVE = nativeSave(IN_FLIGHT_STATE, 'the work-in-flight studio')
const IN_FLIGHT_WRITER = scriptProjectsBoard(IN_FLIGHT_STATE).commission.writers.find(
  (candidate) => candidate.available && candidate.primaryRole === 'writer',
)!

// ── harness ──────────────────────────────────────────────────────────────────

function watchRuntime(page: Page) {
  const pageErrors: string[] = []
  page.on('pageerror', (error) => pageErrors.push(String(error)))
  return { pageErrors }
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
  await expect(page.getByTestId('dev-error')).toHaveCount(0)
}

/** The Studio Calendar is a deep surface, opened from the Dashboard's own preview. */
async function openCalendar(page: Page): Promise<void> {
  await page.getByTestId('lot-return-dashboard').click()
  await expect(page.getByTestId('dash-week')).toBeVisible()
  await page.getByTestId('open-studio-calendar').click()
  await expect(page.getByTestId('studio-calendar')).toBeVisible()
}

/** Leave the calendar and stand where the week can be advanced. */
async function backToDashboard(page: Page): Promise<void> {
  await page.getByTestId('calendar-back').click()
  if (await page.getByTestId('studio-lot-screen').isVisible().catch(() => false)) {
    await page.getByTestId('lot-return-dashboard').click()
  }
  await expect(page.getByTestId('dash-week')).toBeVisible()
}

/** One deliberate week, dismissing whatever interstitial the tick routes through. */
async function advanceOneWeekFromDashboard(page: Page): Promise<void> {
  await page.getByTestId('advance-week').click()
  await page.waitForTimeout(150)
  for (let guard = 0; guard < 6; guard += 1) {
    if (await page.getByTestId('dash-week').isVisible().catch(() => false)) return
    if (await page.getByTestId('studio-lot-screen').isVisible().catch(() => false)) {
      await page.getByTestId('lot-return-dashboard').click()
      await expect(page.getByTestId('dash-week')).toBeVisible()
      return
    }
    let clicked = false
    for (const id of ['newspaper-continue', 'release-continue', 'autopsy-close', 'autopsy-back']) {
      const control = page.getByTestId(id)
      if (await control.isVisible().catch(() => false)) {
        await control.click()
        await page.waitForTimeout(150)
        clicked = true
        break
      }
    }
    if (!clicked) throw new Error('advance: no known way back to the dashboard')
  }
  throw new Error('advance: never returned to the dashboard')
}

async function sessionState(page: Page): Promise<GameState> {
  const value = await page.evaluate((key) => localStorage.getItem(key), ACTIVE_SESSION_KEY)
  if (value === null) throw new Error('active session is missing')
  const replay = importSaveJson(value)
  if (!replay.ok) throw new Error(replay.error)
  return replay.state
}

// ── G16 — the queue is on a screen, and it drains ────────────────────────────

test('the third picture WAITS, says why, and starts the week a room frees', async ({ page }) => {
  const runtime = watchRuntime(page)
  await seed(page, QUEUED_SAVE)

  // The Dashboard's own summary carries the queue's headline fact before the
  // player goes anywhere deep.
  await page.getByTestId('lot-return-dashboard').click()
  await expect(page.getByTestId('dash-week')).toBeVisible()
  await expect(page.getByTestId('calendar-preview-queue')).toHaveText(/1 waiting/)

  await page.getByTestId('open-studio-calendar').click()
  await expect(page.getByTestId('studio-calendar')).toBeVisible()

  const panel = page.getByTestId('studio-queue')
  await expect(panel).toBeVisible()
  await expect(page.getByTestId('studio-queue-count')).toHaveText('1 waiting')

  const waiterId = QUEUED_WAITER.id
  const row = page.getByTestId(`queue-waiter-${waiterId}`)
  await expect(row).toBeVisible()

  // ── ALL FOUR OF OWNER LAW 2's FACTS, non-empty ────────────────────────────
  // 1. WHAT IS WAITING — the picture, by the name the studio calls it.
  await expect(page.getByTestId(`queue-waiter-title-${waiterId}`)).toHaveText(QUEUED_WAITER.title)
  // 2. WHAT IT NEEDS — a room, in the studio's words.
  await expect(page.getByTestId(`queue-waiter-needs-${waiterId}`)).toContainText(
    'Development & Casting',
  )
  // 3 + 4. WHO HAS IT, and WHEN IT FREES — one sentence per holder, each naming
  // the picture, the room it is in, and the week it gives that room back.
  const holders = page.getByTestId(`queue-waiter-holders-${waiterId}`)
  expect(QUEUED_WAITER.occupiedBy.length).toBeGreaterThan(0)
  for (const occupant of QUEUED_WAITER.occupiedBy) {
    await expect(holders).toContainText(occupant.title)
  }
  await expect(holders).toContainText(/frees in \d+ week/)

  // ── THE REMEDIES ARE ACTIONABLE, WITH A PRICE AND A DURATION ──────────────
  const remedies = page.getByTestId(`queue-remedies-${waiterId}`)
  await expect(remedies).toContainText('What relieves it')
  const build = QUEUED_WAITER.remedies.find((remedy) => remedy.kind === 'build-blueprint')
  if (build === undefined || build.kind !== 'build-blueprint') {
    throw new Error('the engine offers no build remedy for a room shortage')
  }
  const buildRow = page.getByTestId(
    `queue-remedy-${waiterId}-build-${build.catalog}-${build.blueprintId}`,
  )
  await expect(buildRow).toContainText(build.label)
  await expect(buildRow).toContainText(/\$/)
  await expect(buildRow).toContainText(new RegExp(`ready in ${String(build.weeks)} week`))
  await expect(
    page.getByTestId(`queue-remedy-act-${waiterId}-build-${build.catalog}-${build.blueprintId}`),
  ).toBeEnabled()

  const wait = QUEUED_WAITER.remedies.find(
    (remedy) => remedy.kind === 'wait-for-holder' && remedy.freesInWeeks !== null,
  )
  if (wait === undefined || wait.kind !== 'wait-for-holder') {
    throw new Error('the engine offers no wait remedy for an occupied room')
  }
  // A wait remedy states the WEEK, because a player plans against a date.
  await expect(page.getByTestId(`queue-remedy-${waiterId}-wait-${wait.ownerId}`)).toContainText(
    `Week ${String(QUEUED_STATE.market.tick + (wait.freesInWeeks ?? 0))}`,
  )

  // THE TYCOON FLOOR: no engine id, no capability token, no blocker kind.
  const panelText = (await panel.textContent()) ?? ''
  expect(panelText).not.toContain('facility-')
  expect(panelText).not.toContain('development-casting')
  expect(panelText).not.toContain('script-00')
  expect(panelText).not.toContain('prod-00')
  expect(panelText).not.toContain('undefined')

  // ── THE QUEUE DRAINS, AND THE PANEL EMPTIES HONESTLY ──────────────────────
  await backToDashboard(page)
  for (let week = 0; week < 6; week += 1) {
    await advanceOneWeekFromDashboard(page)
    const live = await sessionState(page)
    if (live.productionQueue.length === 0) break
  }
  const drained = await sessionState(page)
  expect(drained.productionQueue).toHaveLength(0)
  // The waiter did not vanish — it STARTED. The lot is running three pictures on
  // a lot that could once run two.
  expect(drained.studio.activeProductions.length).toBe(3)

  await page.getByTestId('open-studio-calendar').click()
  await expect(page.getByTestId('studio-calendar')).toBeVisible()
  await expect(page.getByTestId('studio-queue-count')).toHaveText('Clear')
  await expect(page.getByTestId('studio-queue-empty')).toBeVisible()
  await expect(page.getByTestId('studio-queue-waiters')).toHaveCount(0)

  expect(runtime.pageErrors).toEqual([])
})

// ── F4 (§10) — commissioning while other work is in flight ───────────────────

test('the world commissions the next screenplay while one is already being written', async ({
  page,
}) => {
  const runtime = watchRuntime(page)
  await seed(page, IN_FLIGHT_SAVE)

  // The precondition that used to silence this workspace: a draft is out, so the
  // screenplay board is BUSY — and a second Development & Casting room is free.
  const before = await sessionState(page)
  expect(before.scriptDevelopment.projects.length).toBe(1)
  expect(scriptProjectsBoard(before).lotAttention.kind).not.toBe('idle')
  expect(scriptProjectsBoard(before).capacity.available).toBeGreaterThan(0)

  const opener = page.getByTestId('lot-nav-writers')
  await opener.focus()
  await opener.press('Enter')
  const verb = page.getByTestId('lot-building-inspector-primary-commission')
  await expect(verb).toHaveText('Commission a screenplay')
  await verb.click()
  await expect(page.getByTestId('lot-commission-workspace')).toBeVisible()
  await page.getByTestId('script-writer').selectOption(IN_FLIGHT_WRITER.id)
  await page.getByTestId('commission-submit').click()

  // F4: the receipt is published, and the world says whose picture it is and
  // which room it went into. Before this milestone the workspace fell silent
  // here and the player was left with no witness at all.
  const witness = page.getByTestId('lot-screenplay-commission-witness')
  await expect(witness).toBeVisible()
  await expect(witness).toContainText(IN_FLIGHT_WRITER.name)

  const after = await sessionState(page)
  expect(after.scriptDevelopment.projects.length).toBe(2)
  expect(after.productionQueue).toHaveLength(0)

  expect(runtime.pageErrors).toEqual([])
})
