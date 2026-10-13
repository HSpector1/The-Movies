// ── LIVING TURN V1 — FOUR-WAY TIME PARITY (`08A`'s determinism obligation) ────
//
// *"the same seeded action script produces byte-identical exported saves whether
// weeks were advanced by hand, by the living loop at any speed, paused/resumed
// arbitrarily, or batch-skipped. The living loop emits ACTIONS; it never becomes
// an authority."*                            — `08A` §4, ratified at charter §4.1
//
// `m5-determinism.contract.test.ts` proved the two arms that need no scheduler
// (hand-advanced vs batch-skipped). This file proves the OTHER TWO, and then
// proves all four together, at the App seam where the scheduler actually lives:
//
//   (a) BY HAND         — the manual Advance verb, pressed once per week.
//   (b) BY THE LOOP     — one press of Roll and then nothing, at 1× and at 4×.
//   (c) PAUSED/RESUMED  — Roll, Hold, Roll, Hold … at arbitrary points, including
//                         half way through a witnessed week.
//   (d) BATCH-SKIPPED   — the fast-forward verb, at the engine, bounded to the
//                         same week so the comparison is like for like.
//
// FOUR EXPORTED SAVES, COMPARED AS BYTES. The wall clock is `vi.useFakeTimers()`,
// which is itself the statement of what the scheduler is: winding a mocked clock
// by a named number of milliseconds and getting the same bytes a player's own
// presses produce IS the proof that wall time decides nothing. Nothing in this
// file asserts a duration; it asserts an IDENTITY.
//
// THE STUDIO IS THE GATE'S OWN. `livingStudioUnderPressure` (tests/_m5Fixtures)
// owes sixteen consecutive unpaused weeks with no decision pending, which is what
// makes a hands-off parity run possible at all: an arm that had to answer a
// decision mid-run would be comparing two different action scripts.

import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { gunzipSync } from 'node:zlib'
import { createHash } from 'node:crypto'
import * as coreSave from '../../../src/core/save.ts'
import * as coreTick from '../../../src/core/tick.ts'
import { corporateNotices } from '../../../src/core/corporateNotices.ts'
import { contractLoan, loanMaxPrincipal } from '../../../src/core/studioLoan.ts'
import { studioWeeklyFixedCost } from '../../../src/core/powerRankingArchive.ts'
import { TUNING } from '../../../src/core/tuning.ts'
import { moneyExact } from '../format.ts'

import { studioWeekTheater } from '../../../src/core/index.ts'
import type { GameState } from '../../../src/core/index.ts'
import { livingStudioUnderPressure } from '../../../tests/_m5Fixtures.ts'
import { App } from '../App.tsx'
import { advanceToNextEvent, advanceWeek, exportSaveJson, type ActionOutcome } from '../engine/adapter.ts'
import { ACTIVE_SESSION_KEY, clearActiveSession, loadActiveSession, saveActiveSession } from '../engine/session.ts'
import { setOperationHollywoodOverride, setStudioLotOverviewOverride } from '../flags.ts'
import { livingTurnWeekMs } from './livingTurn.ts'
import { resetLotStageAssignment } from './snapshot/stageAssignment.ts'

// The renderer that genuinely PLAYS weeks — `playPresenceWeek` returns true — so
// the witnessed clock is the thing under test rather than a stub that never ticks.
const renderer = vi.hoisted(() => {
  const instances: FakeView[] = []
  class FakeView {
    snapshots: Array<{ week: number }> = []
    playedWeeks: number[] = []
    speeds: number[] = []
    destroyed = false
    constructor(options: { snapshot: { week: number }; onReady?: () => void }) {
      this.snapshots.push(options.snapshot)
      instances.push(this)
      queueMicrotask(() => options.onReady?.())
    }
    setSnapshot(snapshot: { week: number }) { this.snapshots.push(snapshot) }
    playPresenceWeek(week: number) { this.playedWeeks.push(week); return true }
    setPlaybackSpeed(speed: number) { this.speeds.push(speed); return true }
    skipPresencePlayback() { return false }
    select() {}
    clearSelection() {}
    clearHollywoodPersonSelection() {}
    clearHollywoodPlaceSelection() {}
    selectHollywoodPerson() {}
    selectHollywoodProduction() {}
    pause() {}
    resume() {}
    pauseVignettes() {}
    setReducedMotion() {}
    setIdentityMode() {}
    setSignageMasked() {}
    camera() {}
    showHollywoodPublicity() {}
    identityDebug() { return null }
    getDebugState() { return null }
    hollywoodPerformance() { return null }
    destroy() { this.destroyed = true }
  }
  return { FakeView, instances }
})

vi.mock('./StudioLotView.ts', () => ({ StudioLotView: renderer.FakeView }))

// Capture the real mounted panel's owner callback; its rendered UI and core authority stay real.
const loanOwners = vi.hoisted(() => ({ callbacks: [] as Array<(principal: number) => ActionOutcome> }))
vi.mock('../components/CorporateConditionPanel.tsx', async importOriginal => {
  const actual = await importOriginal<typeof import('../components/CorporateConditionPanel.tsx')>()
  return { ...actual, CorporateConditionPanel: (props: Parameters<typeof actual.CorporateConditionPanel>[0]) => {
    loanOwners.callbacks.push(props.onTakeLoan)
    return <actual.CorporateConditionPanel {...props} />
  } }
})


const SEED = 'c2a-m5-four-way-parity'
/** Comfortably inside the fixture's quiet runway, and past the charter's floor. */
const WEEKS = 12
const FIXTURE = livingStudioUnderPressure(SEED, 16)

/**
 * Vitest's default per-test budget is 5s. Every arm below mounts the whole App
 * and then winds a mocked clock through twelve witnessed weeks in 500ms chunks —
 * roughly 250 `act` boundaries, each of which flushes React — and the combined
 * test does that twice. MEASURED: 1.1–2.6s per arm run alone, 5.1s under a full
 * parallel suite, which is how the default first bit. The budget is raised, not
 * the work reduced: nothing here is waiting on wall time, it is doing work.
 */
const MOUNTED_ARM_TIMEOUT_MS = 60_000

/**
 * Mount the Lot on the REAL clock, then take the clock over.
 *
 * The lazy Lot chunk resolves through the module loader, not a timer, so it must
 * be awaited BEFORE the fake clock exists — otherwise the mount waits forever on
 * a promise no `advanceTimersByTime` can reach.
 */
async function mountLot(state: GameState) {
  saveActiveSession(state)
  render(<App />)
  // 10_000ms is the U1 M1 value (1335-A/1335-C), validated under full-suite load for three
  // sibling mount-race files (livingTurn.scheduler, WorldFirstLotNativeCastingReviewApp,
  // WorldFirstLotNativeNextEventApp), not a direct worst-case measurement for this file --
  // RTL's findBy failure reports no elapsed time. The recorded UI gate after this change is
  // the confirmation step, per 1337-B note 2. Stays strictly before `vi.useFakeTimers()`.
  await screen.findByTestId('studio-lot-screen', {}, { timeout: 10_000 })
  await waitFor(() => expect(renderer.instances).toHaveLength(1))
  vi.useFakeTimers()
  // @testing-library's fake-timer support keys off a global `jest` carrying
  // `advanceTimersByTime`; Vitest's equivalent is `vi`. The clock is Vitest's —
  // this only tells the library where the crank is.
  vi.stubGlobal('jest', {
    advanceTimersByTime: (ms: number) => {
      vi.advanceTimersByTime(ms)
    },
  })
}

/**
 * Spend `ms` of wall time the way a browser would, inside React's act().
 *
 * Short chunks on purpose: a commit re-arms the next week's clock from inside a
 * React effect, and an effect only flushes at an `act` boundary. Chunks shorter
 * than the fastest week (2,587.5ms at 4×) make every boundary its own flush.
 */
const SPEND_CHUNK_MS = 500
async function spend(ms: number) {
  let left = ms
  while (left > 0) {
    const chunk = Math.min(left, SPEND_CHUNK_MS)
    // eslint-disable-next-line no-await-in-loop
    await act(async () => {
      await vi.advanceTimersByTimeAsync(chunk)
    })
    left -= chunk
  }
}

/**
 * Spend `weeks` witnessed weeks at `speed`, plus one flush chunk per week.
 *
 * The slack is NAMED rather than fudged: each commit re-arms its successor at the
 * end of the chunk it landed in, so a run of N weeks trails the ideal boundary by
 * at most N × SPEND_CHUNK_MS — far less than one further week at any pace, so the
 * slack can never buy an extra week.
 */
async function spendWeeks(weeks: number, speed: 1 | 2 | 4 = 1) {
  await spend(weeks * livingTurnWeekMs(speed) + weeks * SPEND_CHUNK_MS)
}

function shownWeek(): number {
  const brand = screen.getByTestId('lot-studio-heading').parentElement?.textContent ?? ''
  const match = /Week (\d+)/.exec(brand)
  if (match === null) throw new Error(`no week in the lot brand: ${brand}`)
  return Number(match[1])
}

/** The bytes the SHELL wrote down — the studio the player would reload into. */
function sessionSave(): string {
  const restored = loadActiveSession()
  if (!restored.ok) throw new Error(`no active session: ${restored.reason}`)
  return exportSaveJson(restored.state)
}

// ── (a) BY HAND, at the engine — the reference every arm is compared to ───────

function handAdvanced(start: GameState, weeks: number): string {
  let state = start
  for (let i = 0; i < weeks; i += 1) state = advanceWeek(state).next
  return exportSaveJson(state)
}

// ── (d) BATCH-SKIPPED — the fast-forward verb, bounded to the same week ───────

function batchSkipped(
  start: GameState,
  weeks: number,
): { save: string; batches: number; batchedWeeks: number } {
  const target = start.market.tick + weeks
  let state = start
  let batches = 0
  let batchedWeeks = 0
  let guard = 0
  while (state.market.tick < target && guard < weeks * 4) {
    guard += 1
    const result = advanceToNextEvent(state)
    if (result.weeks === 0 || result.toWeek > target) {
      // Never overshoot the comparison week, and never livelock on a stop this
      // script does not answer: finish the remainder by hand.
      while (state.market.tick < target) state = advanceWeek(state).next
      break
    }
    batches += 1
    batchedWeeks += result.weeks
    state = result.next
  }
  return { save: exportSaveJson(state), batches, batchedWeeks }
}

beforeEach(() => {
  localStorage.clear()
  resetLotStageAssignment()
  renderer.instances.length = 0
  loanOwners.callbacks.length = 0
  setStudioLotOverviewOverride(true)
  setOperationHollywoodOverride(true)
})

afterEach(() => {
  cleanup()
  clearActiveSession()
  localStorage.clear()
  resetLotStageAssignment()
  renderer.instances.length = 0
  loanOwners.callbacks.length = 0
  vi.useRealTimers()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('C2a-M5 — four-way time parity: the same twelve weeks, four ways', () => {
  it('(a) by hand at the seam — the manual verb, pressed twelve times', async () => {
    await mountLot(FIXTURE.state)
    const week0 = shownWeek()
    for (let i = 0; i < WEEKS; i += 1) {
      fireEvent.click(screen.getByTestId('lot-advance-week'))
      // eslint-disable-next-line no-await-in-loop
      await act(async () => {
        await vi.advanceTimersByTimeAsync(SPEND_CHUNK_MS)
      })
    }
    await waitFor(() => expect(shownWeek()).toBe(week0 + WEEKS))
    expect(sessionSave()).toBe(handAdvanced(FIXTURE.state, WEEKS))
  }, MOUNTED_ARM_TIMEOUT_MS)

  it('(b) by the living loop at 1× — one press of Roll, then nothing at all', async () => {
    await mountLot(FIXTURE.state)
    const week0 = shownWeek()
    fireEvent.click(screen.getByTestId('lot-transport-toggle'))
    await spendWeeks(WEEKS)
    await waitFor(() => expect(shownWeek()).toBe(week0 + WEEKS))
    // The loop never paused: no PAUSE-class stop is owed inside this run.
    expect(screen.getByTestId('lot-transport')).toHaveAttribute('data-mode', 'running')
    expect(sessionSave()).toBe(handAdvanced(FIXTURE.state, WEEKS))
  }, MOUNTED_ARM_TIMEOUT_MS)

  it('(b′) by the living loop at 4× — the same weeks, a quarter of the wall time', async () => {
    await mountLot(FIXTURE.state)
    const week0 = shownWeek()
    fireEvent.click(screen.getByTestId('lot-transport-speed-4'))
    fireEvent.click(screen.getByTestId('lot-transport-toggle'))
    await spendWeeks(WEEKS, 4)
    await waitFor(() => expect(shownWeek()).toBe(week0 + WEEKS))
    expect(sessionSave()).toBe(handAdvanced(FIXTURE.state, WEEKS))
  }, MOUNTED_ARM_TIMEOUT_MS)

  it('(c) paused and resumed arbitrarily, including mid-week', async () => {
    await mountLot(FIXTURE.state)
    const week0 = shownWeek()
    const toggle = () => screen.getByTestId('lot-transport-toggle')

    // Roll for three weeks…
    fireEvent.click(toggle())
    await spendWeeks(3)
    await waitFor(() => expect(shownWeek()).toBe(week0 + 3))

    // …spend HALF of the fourth week, then Hold in the middle of it. A partly
    // witnessed week commits nothing: the engine's week is integral and the
    // scheduler holds no fraction of it (`00B`.6 — Living Turn V1 persists no
    // intra-week position), so the studio must sit exactly where it was.
    await spend(livingTurnWeekMs(1) / 2)
    fireEvent.click(toggle())
    expect(screen.getByTestId('lot-transport')).toHaveAttribute('data-mode', 'paused')
    expect(shownWeek()).toBe(week0 + 3)
    await spend(livingTurnWeekMs(1) * 3)
    expect(shownWeek()).toBe(week0 + 3)

    // Resume at a different pace, hold again, resume again — the pace and the
    // pauses are presentation, and presentation decides nothing.
    fireEvent.click(screen.getByTestId('lot-transport-speed-2'))
    fireEvent.click(toggle())
    expect(screen.getByTestId('lot-transport')).toHaveAttribute('data-mode', 'running')
    await spendWeeks(4, 2)
    await waitFor(() => expect(shownWeek()).toBe(week0 + 7))

    fireEvent.click(toggle())
    await spend(livingTurnWeekMs(2) * 2)
    expect(shownWeek()).toBe(week0 + 7)

    fireEvent.click(screen.getByTestId('lot-transport-speed-4'))
    fireEvent.click(toggle())
    await spendWeeks(WEEKS - 7, 4)
    await waitFor(() => expect(shownWeek()).toBe(week0 + WEEKS))

    expect(sessionSave()).toBe(handAdvanced(FIXTURE.state, WEEKS))
  }, MOUNTED_ARM_TIMEOUT_MS)

  it('(d) batch-skipped — and the skip is genuine, not a hand walk in disguise', () => {
    const batch = batchSkipped(FIXTURE.state, WEEKS)
    expect(batch.save).toBe(handAdvanced(FIXTURE.state, WEEKS))
    // NON-VACUOUS: at least one batch covered more than one week.
    expect(batch.batches).toBeGreaterThanOrEqual(1)
    expect(batch.batchedWeeks).toBeGreaterThan(batch.batches)
  })
})

describe('C2a-M5 — and the four are one studio', () => {
  it('exports FOUR byte-identical saves from four different ways of spending time', async () => {
    const byHand = handAdvanced(FIXTURE.state, WEEKS)
    const byBatch = batchSkipped(FIXTURE.state, WEEKS).save

    await mountLot(FIXTURE.state)
    const week0 = shownWeek()
    fireEvent.click(screen.getByTestId('lot-transport-toggle'))
    await spendWeeks(WEEKS)
    await waitFor(() => expect(shownWeek()).toBe(week0 + WEEKS))
    const byLoop = sessionSave()

    cleanup()
    clearActiveSession()
    localStorage.clear()
    resetLotStageAssignment()
    renderer.instances.length = 0
  loanOwners.callbacks.length = 0
    vi.useRealTimers()

    await mountLot(FIXTURE.state)
    const week0b = shownWeek()
    const toggle = () => screen.getByTestId('lot-transport-toggle')
    fireEvent.click(toggle())
    await spendWeeks(5)
    await waitFor(() => expect(shownWeek()).toBe(week0b + 5))
    fireEvent.click(toggle())
    await spend(livingTurnWeekMs(1) * 4)
    fireEvent.click(toggle())
    await spendWeeks(WEEKS - 5)
    await waitFor(() => expect(shownWeek()).toBe(week0b + WEEKS))
    const byPauseResume = sessionSave()

    // The whole obligation, in one assertion.
    expect(new Set([byHand, byLoop, byPauseResume, byBatch]).size).toBe(1)
  }, MOUNTED_ARM_TIMEOUT_MS * 2)
})

describe('C2a-M5 — the theater is evidence, and evidence changes nothing (G8.1/G8.2)', () => {
  it('runs byte-identically with the theater READ every week and with it never read', () => {
    // "Theater ON" is the projection actually being taken, every week, the way the
    // renderer takes it; "theater OFF" is the same weeks with it never taken at
    // all. If reading the plant could move the plant, these would diverge.
    let on: GameState = FIXTURE.state
    let off: GameState = FIXTURE.state
    let subjectsSeen = 0
    const kinds = new Set<string>()
    for (let i = 0; i < WEEKS; i += 1) {
      const projection = studioWeekTheater(on)
      subjectsSeen += projection.subjects.length
      for (const subject of projection.subjects) kinds.add(subject.kind)
      on = advanceWeek(on).next
      off = advanceWeek(off).next
    }
    expect(exportSaveJson(on)).toBe(exportSaveJson(off))
    // …and the RNG never moved either (G8.2: presentation consumes zero RNG).
    expect(JSON.stringify(on.rngState)).toBe(JSON.stringify(off.rngState))
    // NON-VACUOUS: the enabled arm genuinely had a plant to describe, and it
    // described more than one kind of thing.
    expect(subjectsSeen).toBeGreaterThan(0)
    expect(kinds.size).toBeGreaterThanOrEqual(2)
  })
})

// Proposed append to ui/src/lot/livingTurn.parity.test.tsx, reusing its existing renderer/mountLot/spend/sessionSave.
// No copied App/renderer harness. Existing MOUNTED_ARM_TIMEOUT_MS60s unchanged.
// Add import namespace coreSave from '../../../src/core/save.ts', coreTick from '../../../src/core/tick.ts',
// readFileSync/resolve/gunzipSync/createHash, corporateNotices, contractLoan/loanMaxPrincipal/studioWeeklyFixedCost, TUNING and moneyExact/within.
// Namespaced imports avoid colliding with existing core/adapter identifiers.
// This helper is a labelled fixture control, not a new gameplay route.
function wave5FixtureAt(week: number): GameState {
  const gz = readFileSync(resolve(process.cwd(), 'tests/fixtures/p14/genuine-v42-pre-shelving/genuine-v42-rival-stall-week-130.json.gz'))
  expect(createHash('sha256').update(gz).digest('hex')).toBe('af45c8a0efb9a56ac9ff4c16244509d59b49a02370f8390769c79b133d7238f6')
  const initial = coreSave.migrateToLive(coreSave.importSave(gunzipSync(gz).toString('utf8'))).state as GameState
  expect(() => coreSave.makeSave(initial), 'baseline admission before debit').not.toThrow()
  const amount = Math.floor(initial.studio.cash) + 1
  let state: GameState = { ...initial, studio: { ...initial.studio, cash: initial.studio.cash - amount }, ledger: [...initial.ledger,
    { week: initial.market.tick, kind: 'publicity', amount: -amount, note: 'p15b test drain' }] }
  expect(() => coreSave.makeSave(state), 'labelled debit must admit before ticking').not.toThrow()
  while (state.market.tick < week) state = coreTick.tick(state)
  expect(() => coreSave.makeSave(state)).not.toThrow(); return state
}
it('Wave5 mounted warning presents terms before lawful loan commit and autosaves one receipt', async () => {
  const initial = wave5FixtureAt(134)
  const fixed = studioWeeklyFixedCost(initial, initial.hollywood!.playerStudioId)
  const principal = TUNING.LOAN_AMOUNT_STEP
  expect(loanMaxPrincipal(fixed)).toBeGreaterThan(principal) // C17: this case must exercise a real nonmaximum legal choice.
  const terms = contractLoan(principal, fixed, initial.market.tick)
  await mountLot(initial)
  expect(screen.getByText(corporateNotices(initial).find(n => n.id === 'corporate-warning')!.message)).toBeVisible()
  // Existing core permits each positive step up to actual maximum; no new loan gameplay authority.
  const principalChoice = screen.getByRole('combobox', { name: /loan principal/i })
  await act(async () => { fireEvent.change(principalChoice, { target: { value: String(principal) } }) })
  const offer = screen.getByRole('region', { name: /studio loan offer/i }) // proposed bounded accessible offer owner
  expect(within(offer).getByText(moneyExact(terms.principal), { exact: true })).toBeVisible()
  expect(within(offer).getByText(moneyExact(terms.total), { exact: true })).toBeVisible()
  const schedule = screen.getByRole('table', { name: /studio loan repayment schedule/i })
  const rows = within(schedule).getAllByRole('row').slice(1)
  expect(rows).toHaveLength(terms.installments.length)
  for (const [i, amount] of terms.installments.entries()) {
    expect(within(rows[i]!).getByText(`Week ${initial.market.tick + i + 1}`, { exact: true })).toBeVisible()
    expect(within(rows[i]!).getByText(moneyExact(amount), { exact: true })).toBeVisible()
  }
  await act(async () => { fireEvent.click(screen.getByRole('button', { name: /take.*studio loan/i })) })
  const restored = loadActiveSession(); expect(restored.ok).toBe(true)
  if (!restored.ok) throw new Error(restored.reason)
  expect(restored.state.studio.cash).toBe(initial.studio.cash + terms.principal)
  expect(restored.state.corporateCondition.loans.filter(l => l.studioId === initial.hollywood!.playerStudioId)).toHaveLength(1)
  expect(screen.queryByRole('button', { name: /take.*studio loan/i })).toBeNull()
}, MOUNTED_ARM_TIMEOUT_MS)
it('Wave5 living loop commits terminal once and keeps history/export accessible without operating verbs', async () => {
  const initial = wave5FixtureAt(162)
  const expected = coreTick.tick(initial, { develop: true }); const c = expected.studioClosure.closures.find(c => c.studioId === expected.hollywood!.playerStudioId)!
  expect(c.closureWeek).toBe(163)
  await mountLot(initial)
  await act(async () => { fireEvent.click(screen.getByTestId('lot-transport-toggle')) })
  await spendWeeks(3) // Existing witnessed fake-clock pacing; no independent simulation scheduler.
  const terminalSession = loadActiveSession(); expect(terminalSession.ok).toBe(true)
  if (!terminalSession.ok) throw new Error(terminalSession.reason)
  expect(() => coreSave.makeSave(terminalSession.state)).not.toThrow()
  expect(terminalSession.state.market.tick).toBe(163)
  expect(sessionSave()).toBe(exportSaveJson(expected))
  expect(screen.getByText(corporateNotices(expected).find(n => n.id === 'corporate-closed')!.message)).toBeVisible()
  expect(screen.getByTestId('lot-advance-week')).toBeDisabled()
  const saved = sessionSave(); await spendWeeks(3); expect(sessionSave()).toBe(saved)
  // Retained history/save navigation stays available; no operating command hidden behind a stale overlay.
  expect(screen.getByTestId('lot-open-saves')).not.toBeDisabled()
  expect(screen.queryByRole('button', { name: /take.*studio loan/i })).toBeNull()
  const restored = loadActiveSession(); expect(restored.ok).toBe(true)
  if (!restored.ok) throw new Error(restored.reason)
  expect(() => coreSave.makeSave(restored.state)).not.toThrow()
}, MOUNTED_ARM_TIMEOUT_MS)
// Remaining host obligation: drive actual SavedStudio import/reload UI and confirm an unsupported due-only
// draft refuses BEFORE replacing an existing active session. Adapter-only import assertions are not that host proof.


it('Wave5 stale mounted loan callback refuses changed owner terms without session writes', async () => {
  const initial = wave5FixtureAt(134)
  await mountLot(initial)
  const oldLoan = loanOwners.callbacks.at(-1)
  expect(oldLoan, 'actual warning panel callback must be captured').toBeDefined()
  const principal = TUNING.LOAN_AMOUNT_STEP
  const oldTerms = contractLoan(principal, studioWeeklyFixedCost(initial, initial.hollywood!.playerStudioId), 134)
  await act(async () => { fireEvent.click(screen.getByTestId('lot-advance-week')) })
  const current = loadActiveSession(); expect(current.ok).toBe(true)
  if (!current.ok) throw new Error(current.reason)
  expect(current.state.market.tick).toBe(135)
  expect(() => coreSave.makeSave(current.state)).not.toThrow()
  const newTerms = contractLoan(principal, studioWeeklyFixedCost(current.state, current.state.hollywood!.playerStudioId), 135)
  expect(newTerms.contractedWeek).not.toBe(oldTerms.contractedWeek)
  expect(loanMaxPrincipal(studioWeeklyFixedCost(current.state, current.state.hollywood!.playerStudioId))).toBeGreaterThanOrEqual(principal)
  expect(within(screen.getByRole('table', { name: 'Studio loan repayment schedule' })).getByText('Week 136')).toBeVisible()
  expect(screen.getByRole('region', { name: 'Studio loan offer' })).toBeVisible()
  expect(loanOwners.callbacks.at(-1)).not.toBe(oldLoan)
  const ownerBytes = JSON.stringify(current.state)
  const saveBytes = sessionSave()
  const storedBytes = localStorage.getItem(ACTIVE_SESSION_KEY)
  expect(storedBytes).not.toBeNull()
  const writes = vi.spyOn(Storage.prototype, 'setItem')
  try {
    const outcomes: ActionOutcome[] = []
    await act(async () => { outcomes.push(oldLoan!(principal)) })
    expect(outcomes).toHaveLength(1)
    const result = outcomes[0]!
    expect(result.ok, 'old displayed terms cannot authorize a later owner loan').toBe(false)
    if (!result.ok) expect(result.error).toMatch(/stale.*loan|loan.*stale|loan.*offer.*changed|loan.*terms.*changed/i)
    const after = loadActiveSession(); expect(after.ok).toBe(true)
    if (!after.ok) throw new Error(after.reason)
    expect(JSON.stringify(after.state)).toBe(ownerBytes)
    expect(sessionSave()).toBe(saveBytes)
    expect(localStorage.getItem(ACTIVE_SESSION_KEY)).toBe(storedBytes)
    expect(writes.mock.calls.filter(([key]) => key === ACTIVE_SESSION_KEY)).toHaveLength(0)
  } finally { writes.mockRestore() }
}, MOUNTED_ARM_TIMEOUT_MS)
