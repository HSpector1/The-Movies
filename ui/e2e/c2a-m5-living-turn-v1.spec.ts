// ── C2a-M5 §12-M5 — THE LIVING STUDIO, in a real browser ─────────────────────
//
// The Owner's acceptance sentence for this milestone is *"I can stop touching
// controls and watch my studio visibly operate."* This spec is that sentence with
// a stopwatch taken away from it: it presses ONE control, then reads the
// authoritative week off the DOM as the studio works.
//
//   THE LOOP RUNS. Roll, touch nothing, and the engine's own week advances.
//   THE PACE IS A PACE. At 4× the same untouched studio covers more weeks in the
//     same wall time — and the pace changes nothing else.
//   HOLD HOLDS. Paused, the week does not move, however long you leave it.
//   THE PARTITION HOLDS. A PAUSE-class stop pauses the loop BY ITSELF and says
//     which stop did it; a NOTIFY-class stop does not, and reaches the bulletin.
//   THE GATE, WHOLE (§12-M5). One seeded save with two pictures in flight runs
//     TWELVE-PLUS consecutive unpaused weeks on ONE press, its queue drains into
//     freed capacity while it runs, a NOTIFY-class event reaches the player
//     without stopping anything, and the loop then stops ITSELF on the FIRST
//     PAUSE-class stop. Run length asserted, not merely an eventual pause.
//   AND THE WEEK IS A WEEK. One played week at 1× is measured against the wall
//     clock — the ONE place a stopwatch belongs, because "10.35s at 1×" is a
//     claim about presentation, not about the world.
//
// TELEMETRY, NOT TIMING. Every assertion reads `data-week` / `data-mode` /
// `data-paused-by` off the transport, so nothing here races an animation. The
// browser runs with reduced motion emulated, which is also the honest test of
// `08A` §4: under reduced motion the BEATS collapse and the CADENCE continues.
//
// THE FIXTURE IS BUILT, NOT INJECTED (the `c2a-m2`/`m3`/`m4` pattern) and is
// proven to replay byte-identically through the live save boundary first.

import { expect, test, type Page } from '@playwright/test'
import { livingStudioUnderPressure } from '../../tests/_m5Fixtures.ts'
import {
  advanceWeek,
  exportSaveJson,
  findConcept,
  foundManagedStudioAction,
  foundingApplicantCards,
  greenlightScriptProject,
  importSaveJson,
  newGame,
  requiredNegative,
  productionDecision,
  runProductionCommand,
  runScriptProjectAction,
  scriptProjectsBoard,
  signContractAction,
  studioQueueBoard,
  commissionScriptAction,
  type CreativeRole,
  type DraftPackage,
  type GameState,
  type SimStopReason,
} from '../src/engine/adapter.ts'

/** The SHIPPED world. The 5178 origin is pinned to the retained plate. */
const GRID_BASE_URL = 'http://localhost:5179'

const ACTIVE_SESSION_KEY = 'project-studio.active-session.v4'
const ACTIVE_SESSION_CORRUPT_KEY = 'project-studio.active-session.v4.corrupt'
const LOT_FLAG_KEY = 'project-studio.flags.studio-lot-overview'
const HOLLYWOOD_FLAG_KEY = 'project-studio.flags.operation-hollywood'
const TYCOON_FLAG_KEY = 'project-studio.flags.tycoon-world'

const SEED = 'c2a-m5-living-turn-v1'

/** One week is 10.35s at 1×. A studio left to work is not a quick test. */
test.describe.configure({ timeout: 300_000 })

const FOUNDING_COUNTS: Readonly<Record<CreativeRole, number>> = {
  actor: 4,
  director: 2,
  writer: 2,
  craft: 2,
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

function commissionOne(state: GameState): GameState {
  const usedConcepts = new Set(state.scriptDevelopment.projects.map((p) => p.conceptId))
  const concept = state.concepts.find((candidate) => !usedConcepts.has(candidate.id))
  const writer = scriptProjectsBoard(state).commission.writers.find(
    (candidate) => candidate.available && candidate.primaryRole === 'writer',
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

function settleOneScreenplay(state: GameState): GameState {
  let current = state
  for (let guard = 0; guard < 40; guard += 1) {
    const board = scriptProjectsBoard(current)
    if (board.packages.length > 0) return current
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
  throw new Error('fixture: the screenplay never settled')
}

function greenlightFirst(state: GameState): GameState {
  const locked = scriptProjectsBoard(state).packages[0]
  if (locked === undefined) throw new Error('fixture: no accepted screenplay to greenlight')
  const concept = findConcept(state, locked.concept.id)
  if (concept === undefined) throw new Error('fixture: the accepted screenplay has no concept')
  const directors = contracted(state, 'director')
  const actors = contracted(state, 'actor')
  const crafts = contracted(state, 'craft')
  const draft: DraftPackage = {
    conceptId: locked.concept.id,
    shape: locked.lockedShape,
    promise: locked.lockedPromise,
    writerId: locked.writer.id,
    directorId: directors[0]!.id,
    cast: { lead: actors[0]!.id, antagonist: actors[1]!.id, support: actors[2]!.id },
    craftIds: [crafts[0]!.id],
    budget: { negative: requiredNegative(concept, locked.lockedShape, state), marketing: 100_000 },
  }
  const outcome = greenlightScriptProject(state, locked.projectId, draft)
  if (!outcome.ok) throw new Error(outcome.error)
  return outcome.next
}

/** A studio with a picture genuinely in production — work for the loop to advance. */
function studioWithAPictureInFlight(): GameState {
  return greenlightFirst(settleOneScreenplay(commissionOne(foundedStudio(SEED))))
}

function nativeSave(state: GameState, label: string): string {
  const bytes = exportSaveJson(state)
  const replay = importSaveJson(bytes)
  if (!replay.ok) throw new Error(`${label}: ${replay.error}`)
  if (replay.converted) throw new Error(`${label} is not a current save`)
  if (exportSaveJson(replay.state) !== bytes) throw new Error(`${label} does not replay`)
  return bytes
}

const PAUSE_CLASS: readonly SimStopReason[] = [
  'release',
  'scriptReview',
  'castingReview',
  'productionDecision',
  'cashNegative',
]

/**
 * THE HAND-ADVANCED TWIN. How many weeks this studio gets before the ladder hands
 * back a PAUSE-class stop, measured with the ordinary single-week verb. The browser
 * is asserted against THIS, so the expectation is the engine's and not the author's.
 */
function pauseClassRunway(start: GameState): { weeks: number; reason: SimStopReason } {
  let state = start
  for (let weeks = 1; weeks <= 60; weeks += 1) {
    const step = advanceWeek(state)
    state = step.next
    if (step.stopReason !== null && PAUSE_CLASS.includes(step.stopReason)) {
      return { weeks, reason: step.stopReason }
    }
  }
  throw new Error('fixture: no PAUSE-class stop inside sixty weeks')
}

/** Answer every production decision the board is currently offering. */
function answerBoard(state: GameState): GameState {
  let next = state
  for (let guard = 0; guard < 8; guard += 1) {
    const command = productionDecision(next)?.command
    if (command === null || command === undefined) return next
    const outcome = runProductionCommand(next, command)
    if (!outcome.ok) return next
    next = outcome.next
  }
  return next
}

/**
 * A studio with a picture IN THEATRES: money moving every week, a theatrical run
 * to complete, and no decision owed for a long stretch. This is the fixture the
 * hands-off phases need — a studio that owes a decision every fourth week cannot
 * demonstrate a pace.
 */
function studioWithAPictureInTheatres(): GameState {
  let state = studioWithAPictureInFlight()
  for (let weeks = 0; weeks < 90; weeks += 1) {
    const answered = answerBoard(state)
    const step = advanceWeek(answered)
    state = step.next
    if (step.released.length > 0) return state
  }
  throw new Error('fixture: the picture never reached audiences')
}

/** No PAUSE-class stop inside `weeks`. Throws rather than let a phase go vacuous. */
function assertQuiet(start: GameState, weeks: number): void {
  let state = start
  for (let i = 0; i < weeks; i += 1) {
    const step = advanceWeek(state)
    if (step.stopReason !== null && PAUSE_CLASS.includes(step.stopReason)) {
      throw new Error(`fixture: the stretch was not quiet (${step.stopReason} at +${String(i + 1)})`)
    }
    state = step.next
  }
}

const IN_FLIGHT_STATE = studioWithAPictureInFlight()
const IN_FLIGHT_SAVE = nativeSave(IN_FLIGHT_STATE, 'the picture-in-flight studio')
const RUNWAY = pauseClassRunway(IN_FLIGHT_STATE)
const START_WEEK = IN_FLIGHT_STATE.market.tick

const QUIET_STATE = studioWithAPictureInTheatres()
const QUIET_SAVE = nativeSave(QUIET_STATE, 'the picture-in-theatres studio')
const QUIET_WEEK = QUIET_STATE.market.tick
/** The hands-off phases below spend at most this many weeks; prove they are free. */
const QUIET_WEEKS_NEEDED = 12
assertQuiet(QUIET_STATE, QUIET_WEEKS_NEEDED)

// ── §12-M5's gate fixture: the whole sentence, on ONE studio ─────────────────
//
// Two pictures in flight, a third greenlight waiting for a Development & Casting
// room, every set struck so no picture can reach a stage and ask for a decision,
// a scenery shop rising to end the drought, and a bank balance calibrated to run
// out AFTER the run the gate asks for. Built and self-verified in
// `tests/_m5Fixtures.ts`; its engine-side contract is pinned by
// `ui/src/test/contracts/m5-hands-off-gate.contract.test.ts`, so a green browser
// run here can never be a browser that simply did nothing for a minute.
const GATE_QUIET_WEEKS = 16
const GATE = livingStudioUnderPressure('c2a-m5-hands-off-gate', GATE_QUIET_WEEKS)
const GATE_SAVE = nativeSave(GATE.state, 'the living studio under pressure')
const GATE_WEEK = GATE.state.market.tick
/** The charter's own floor. The fixture clears it with room; this is the claim. */
const CHARTER_HANDS_OFF_FLOOR = 12
/** The stop the hand-advanced twin says ends this run, and the week it ends on. */
const GATE_STOP = pauseClassRunway(GATE.state)

/**
 * The NOTIFY-class sentence the twin says this run produces, taken VERBATIM off
 * the engine's own stop payload. Asserting the browser prints this exact string
 * is what stops the bulletin check from passing on an empty box.
 */
const GATE_NOTIFY_LINE = ((): string => {
  let state = GATE.state
  for (let weeks = 1; weeks <= GATE.quietWeeks; weeks += 1) {
    const step = advanceWeek(state)
    state = step.next
    const message = step.stop?.constructionCompletion?.message ?? null
    if (step.stopReason === 'constructionCompleted' && message !== null) return message
  }
  throw new Error('fixture: the run produced no NOTIFY-class construction completion')
})()

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
  // Reduced motion is the deterministic arm AND the honest one: `08A` §4 says the
  // beats collapse to final positions while the CADENCE continues, and this spec
  // is about the cadence.
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto(`${GRID_BASE_URL}/`)
  await expect(page.getByTestId('studio-lot-screen')).toBeVisible()
  await expect(page.getByTestId('dev-error')).toHaveCount(0)
}

const transport = (page: Page) => page.getByTestId('lot-transport')

async function currentWeek(page: Page): Promise<number> {
  const value = await transport(page).getAttribute('data-week')
  return Number(value)
}

/**
 * The studio the BROWSER is actually holding, read back through the same session
 * payload a reload would restore from — `saveActiveSession` writes exactly
 * `exportSaveJson(state)`, so this is the authoritative state and not a UI
 * reconstruction of it. Used to ask the engine's own queue projection what the
 * running studio did, without touching a single control to find out.
 */
async function liveState(page: Page) {
  const raw = await page.evaluate((key) => localStorage.getItem(key), ACTIVE_SESSION_KEY)
  if (raw === null) throw new Error('the browser has no active session')
  const restored = importSaveJson(raw)
  if (!restored.ok) throw new Error(`the browser's session will not load: ${restored.error}`)
  return restored.state
}

/**
 * Wait for the transport to report `week`, WITHOUT touching anything, and hand
 * back how long the wall clock says it took.
 *
 * This is the one place a stopwatch belongs in this spec. Everywhere else the
 * week is read off telemetry precisely so nothing races an animation; here the
 * duration IS the claim under test (§4.1: one witnessed week is 10.35s at 1×).
 */
async function timeToReachWeek(page: Page, week: number, timeout: number): Promise<number> {
  const startedAt = Date.now()
  await page.waitForFunction(
    (target) =>
      document.querySelector('[data-testid="lot-transport"]')?.getAttribute('data-week') ===
      String(target),
    week,
    { timeout, polling: 50 },
  )
  return Date.now() - startedAt
}

test.describe('C2a-M5 — Living Turn V1 in the browser', () => {
  test('the studio works while you watch, and works faster when you say so', async ({ page }) => {
    const runtime = watchRuntime(page)
    await seed(page, QUIET_SAVE)

    // ── the transport is there, in the studio's voice, and nothing is running ──
    await expect(transport(page)).toHaveAttribute('data-mode', 'paused')
    await expect(transport(page)).toHaveAttribute('data-speed', '1')
    await expect(transport(page)).toHaveAttribute('data-week', String(QUIET_WEEK))
    await expect(transport(page)).toHaveAttribute('data-paused-by', 'none')
    // The manual verbs survive (§4.1: Advance is demoted from required heartbeat
    // to option — it is not removed).
    await expect(page.getByTestId('lot-advance-week')).toBeVisible()
    await expect(page.getByTestId('lot-sim-to-next-event')).toBeVisible()

    // ── ONE press, and the studio starts working ─────────────────────────────
    await page.getByTestId('lot-transport-toggle').click()
    await expect(transport(page)).toHaveAttribute('data-mode', 'running')
    // A week is 10.35s at 1×; nothing is touched between here and the assertion.
    await expect(transport(page)).toHaveAttribute('data-week', String(QUIET_WEEK + 1), {
      timeout: 25_000,
    })

    // ── the pace is a pace ───────────────────────────────────────────────────
    await page.getByTestId('lot-transport-speed-4').click()
    await expect(transport(page)).toHaveAttribute('data-speed', '4')
    const beforeSpeed = await currentWeek(page)
    // Four more weeks at 4×, inside the wall time ONE week takes at 1×. Asserted
    // with room to breathe: what is proved is that the pace CHANGED, not a
    // stopwatch reading.
    await expect(transport(page)).toHaveAttribute('data-week', String(beforeSpeed + 4), {
      timeout: 25_000,
    })

    // ── hold holds ───────────────────────────────────────────────────────────
    await page.getByTestId('lot-transport-toggle').click()
    await expect(transport(page)).toHaveAttribute('data-mode', 'paused')
    const held = await currentWeek(page)
    // Six 4× weeks of wall time. If the loop leaked, this could not stay still.
    await page.waitForTimeout(16_000)
    expect(await currentWeek(page)).toBe(held)
    await expect(transport(page)).toHaveAttribute('data-mode', 'paused')
    expect(held - QUIET_WEEK).toBeLessThanOrEqual(QUIET_WEEKS_NEEDED)

    expect(runtime.pageErrors).toEqual([])
  })

  test('the loop stops ITSELF on a PAUSE-class stop, and says what stopped it', async ({ page }) => {
    const runtime = watchRuntime(page)
    await seed(page, IN_FLIGHT_SAVE)
    await expect(transport(page)).toHaveAttribute('data-week', String(START_WEEK))

    // Fastest pace, so the runway is spent in seconds rather than minutes. The
    // pace changes nothing about WHERE the studio stops — that is the point.
    await page.getByTestId('lot-transport-speed-4').click()
    await page.getByTestId('lot-transport-toggle').click()
    await expect(transport(page)).toHaveAttribute('data-mode', 'running')

    // The hand-advanced twin says this studio owes a PAUSE-class stop after
    // RUNWAY.weeks. The browser must land on exactly that week, BY ITSELF, with
    // the engine's own reason on it.
    await expect(transport(page)).toHaveAttribute('data-mode', 'paused', { timeout: 120_000 })
    await expect(transport(page)).toHaveAttribute('data-week', String(START_WEEK + RUNWAY.weeks))
    await expect(transport(page)).toHaveAttribute('data-paused-by', RUNWAY.reason)

    // …and it STAYS stopped: a PAUSE-class stop is not a hiccup.
    await page.waitForTimeout(9_000)
    expect(await currentWeek(page)).toBe(START_WEEK + RUNWAY.weeks)
    await expect(transport(page)).toHaveAttribute('data-mode', 'paused')

    expect(runtime.pageErrors).toEqual([])
  })
})

// ── §12-M5's gate, whole, on one studio and one press ────────────────────────

test.describe('C2a-M5 §12-M5 — the hands-off proof', () => {
  test('two pictures in flight, ONE press, and the studio runs itself', async ({ page }) => {
    const runtime = watchRuntime(page)

    // THE STUDIO, BEFORE ANYONE TOUCHES IT. Two pictures in flight and a third
    // greenlight waiting for a room — the engine's own words, read here so the
    // browser assertions below are anchored to a state and not to a hope.
    expect(GATE.state.studio.activeProductions).toHaveLength(2)
    expect(GATE.state.productionQueue).toHaveLength(1)
    expect(studioQueueBoard(GATE.state).waiters.length).toBeGreaterThanOrEqual(1)
    expect(GATE.quietWeeks).toBeGreaterThanOrEqual(CHARTER_HANDS_OFF_FLOOR)
    expect(GATE.queueDrainsAfter).toBeLessThanOrEqual(CHARTER_HANDS_OFF_FLOOR)
    expect(GATE_STOP.weeks).toBe(GATE.quietWeeks + 1)

    await seed(page, GATE_SAVE)
    await expect(transport(page)).toHaveAttribute('data-week', String(GATE_WEEK))
    await expect(transport(page)).toHaveAttribute('data-mode', 'paused')
    await expect(transport(page)).toHaveAttribute('data-paused-by', 'none')

    // ── ONE press. Nothing else is touched for the rest of this test. ────────
    await page.getByTestId('lot-transport-speed-4').click()
    await page.getByTestId('lot-transport-toggle').click()
    await expect(transport(page)).toHaveAttribute('data-mode', 'running')

    // ── THE RUN LENGTH, ASSERTED ─────────────────────────────────────────────
    // Reaching this week with ZERO further input IS the twelve-consecutive-week
    // claim: had the loop paused on any week before it, nothing would have
    // restarted it and the week would have stopped where it stopped.
    await expect(transport(page)).toHaveAttribute(
      'data-week',
      String(GATE_WEEK + CHARTER_HANDS_OFF_FLOOR),
      { timeout: 120_000 },
    )
    await expect(transport(page)).toHaveAttribute('data-mode', 'running')
    await expect(transport(page)).toHaveAttribute('data-paused-by', 'none')

    // ── THE QUEUE DRAINED INTO FREED CAPACITY, WHILE IT RAN ──────────────────
    // Read from the studio the browser is actually holding, through the engine's
    // own queue projection. The waiting greenlight is gone from the queue and is
    // now a third picture in flight — a room freed and the queue took it.
    const running = await liveState(page)
    expect(running.productionQueue).toHaveLength(0)
    expect(running.studio.activeProductions).toHaveLength(3)
    expect(studioQueueBoard(running).summary.waitingIntents).toBe(0)

    // ── A NOTIFY-CLASS EVENT SURFACED, AND STOPPED NOTHING ───────────────────
    // The scenery shop opened on its own clock. The studio said so on the
    // bulletin, in its own voice, and kept working.
    const bulletin = page.getByTestId('lot-living-turn-bulletin')
    await expect(bulletin).toBeVisible()
    // The ENGINE's own sentence, verbatim — never a re-worded one, and never an
    // empty box that a `toBeVisible` would have accepted.
    await expect(bulletin).toContainText(GATE_NOTIFY_LINE)
    // …and NOT the batch verb's sentence: nothing stopped, so saying so would be
    // a lie about the thing the player is watching (§4.1, the NOTIFY voice).
    await expect(bulletin).not.toHaveText(/Stopped at Week/)
    await expect(transport(page)).toHaveAttribute('data-mode', 'running')

    // ── AND THEN IT STOPS ITSELF, ON THE FIRST PAUSE-CLASS STOP ──────────────
    // The hand-advanced twin says the money crosses zero on exactly this week.
    await expect(transport(page)).toHaveAttribute('data-mode', 'paused', { timeout: 120_000 })
    await expect(transport(page)).toHaveAttribute(
      'data-week',
      String(GATE_WEEK + GATE_STOP.weeks),
    )
    await expect(transport(page)).toHaveAttribute('data-paused-by', GATE_STOP.reason)
    expect(GATE_STOP.reason).toBe('cashNegative')

    // …and it stays stopped, with nobody touching it.
    await page.waitForTimeout(9_000)
    expect(await currentWeek(page)).toBe(GATE_WEEK + GATE_STOP.weeks)
    await expect(transport(page)).toHaveAttribute('data-mode', 'paused')

    expect(runtime.pageErrors).toEqual([])
  })

  test('a played week at 1× is a played week — measured against the wall clock', async ({
    page,
  }) => {
    const runtime = watchRuntime(page)
    await seed(page, GATE_SAVE)
    await expect(transport(page)).toHaveAttribute('data-speed', '1')

    // §4.1 names the figure: the shipped nine-beat playback, 10.35s at 1×. Every
    // other assertion in this spec deliberately refuses a stopwatch; this one
    // needs it, because the claim IS a duration. ±20% is the tolerance, and the
    // polling interval (50ms) is far inside it.
    const expected = 10_350
    const tolerance = expected * 0.2
    await page.getByTestId('lot-transport-toggle').click()
    const elapsed = await timeToReachWeek(page, GATE_WEEK + 1, 40_000)
    expect(elapsed).toBeGreaterThan(expected - tolerance)
    expect(elapsed).toBeLessThan(expected + tolerance)

    // …and it is a CADENCE, not one lucky week: the second week takes the same.
    const second = await timeToReachWeek(page, GATE_WEEK + 2, 40_000)
    expect(second).toBeGreaterThan(expected - tolerance)
    expect(second).toBeLessThan(expected + tolerance)

    expect(runtime.pageErrors).toEqual([])
  })
})


