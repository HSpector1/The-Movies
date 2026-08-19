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

import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { studioWeekTheater } from '../../../src/core/index.ts'
import type { GameState } from '../../../src/core/index.ts'
import { livingStudioUnderPressure } from '../../../tests/_m5Fixtures.ts'
import { App } from '../App.tsx'
import { advanceToNextEvent, advanceWeek, exportSaveJson } from '../engine/adapter.ts'
import { clearActiveSession, loadActiveSession, saveActiveSession } from '../engine/session.ts'
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

const SEED = 'c2a-m5-four-way-parity'
/** Comfortably inside the fixture's quiet runway, and past the charter's floor. */
const WEEKS = 12
const FIXTURE = livingStudioUnderPressure(SEED, 16)

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
  await screen.findByTestId('studio-lot-screen')
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
  setStudioLotOverviewOverride(true)
  setOperationHollywoodOverride(true)
})

afterEach(() => {
  cleanup()
  clearActiveSession()
  localStorage.clear()
  resetLotStageAssignment()
  renderer.instances.length = 0
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
  })

  it('(b) by the living loop at 1× — one press of Roll, then nothing at all', async () => {
    await mountLot(FIXTURE.state)
    const week0 = shownWeek()
    fireEvent.click(screen.getByTestId('lot-transport-toggle'))
    await spendWeeks(WEEKS)
    await waitFor(() => expect(shownWeek()).toBe(week0 + WEEKS))
    // The loop never paused: no PAUSE-class stop is owed inside this run.
    expect(screen.getByTestId('lot-transport')).toHaveAttribute('data-mode', 'running')
    expect(sessionSave()).toBe(handAdvanced(FIXTURE.state, WEEKS))
  })

  it('(b′) by the living loop at 4× — the same weeks, a quarter of the wall time', async () => {
    await mountLot(FIXTURE.state)
    const week0 = shownWeek()
    fireEvent.click(screen.getByTestId('lot-transport-speed-4'))
    fireEvent.click(screen.getByTestId('lot-transport-toggle'))
    await spendWeeks(WEEKS, 4)
    await waitFor(() => expect(shownWeek()).toBe(week0 + WEEKS))
    expect(sessionSave()).toBe(handAdvanced(FIXTURE.state, WEEKS))
  })

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
  })

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
  })
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
