// ── LIVING TURN V1 — THE SCHEDULER, PROVED AT THE APP SEAM ────────────────────
//
// The Owner's acceptance sentence is "I can stop touching controls and watch my
// studio visibly operate", and this file is the mechanical form of it: press one
// control ONCE and then assert that the authoritative week keeps changing, at the
// pace the ladder names, and that it stops exactly where the charter says.
//
// EVERY expectation here is MEASURED off a hand-advanced twin — never authored. The
// wall clock is `vi.useFakeTimers()`, which is itself the honest statement of what
// the scheduler is: a pacing device with no authority. Advancing a mocked clock by
// a named number of milliseconds and getting byte-identical saves to the ones a
// player's own presses produce IS the proof that wall time decides nothing.

import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { applyActions } from '../../../src/core/index.ts'
import { App } from '../App.tsx'
import {
  advanceWeek,
  exportSaveJson,
  greenlight,
  productionDecision,
  requiredNegative,
  runProductionCommand,
} from '../engine/adapter.ts'
import type { CreativeRole, DraftPackage, GameState, SimStopReason } from '../engine/adapter.ts'
import { clearActiveSession, loadActiveSession, saveActiveSession } from '../engine/session.ts'
import { setOperationHollywoodOverride, setStudioLotOverviewOverride } from '../flags.ts'
import { foundedRosterIds, newFoundedGame } from '../test/founding.ts'
import { livingTurnStopClass, livingTurnWeekMs } from './livingTurn.ts'
import { resetLotStageAssignment } from './snapshot/stageAssignment.ts'

// The renderer this suite installs DOES play weeks (`playPresenceWeek` returns
// true) — the only difference from the other lot harnesses, and the difference
// that makes the witnessed clock the thing under test.
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

function legalPackage(state: GameState): DraftPackage {
  const concept = state.concepts[0]!
  const ids = (role: CreativeRole) => foundedRosterIds(state, role)
  const shape = { opening: 'slowSetup', midpoint: 'reversal', ending: 'bittersweet' } as const
  return {
    conceptId: concept.id,
    shape,
    promise: {
      genre: concept.genre,
      intendedSegments: ['adult'],
      ranges: {
        intimacy: [-0.4, 0.4],
        tonalWeight: [-0.4, 0.4],
        kineticEnergy: [-0.4, 0.4],
      },
    },
    writerId: ids('writer')[0]!,
    directorId: ids('director')[0]!,
    craftIds: [ids('craft')[0]!],
    cast: {
      lead: ids('actor')[0]!,
      antagonist: ids('actor')[1]!,
      support: ids('actor')[2]!,
    },
    budget: { negative: requiredNegative(concept, shape, state), marketing: 400_000 },
  }
}

/** An operating studio with one picture greenlit — work genuinely in flight. */
function operatingStudio(seed: string): GameState {
  const founded = applyActions(newFoundedGame(seed), [{ kind: 'activateStudioOperations' }])
  const result = greenlight(founded, legalPackage(founded))
  if (!result.ok) throw new Error(result.error)
  return result.next
}

/** Answer every production decision the board is currently offering. */
function answerBoard(state: GameState): GameState {
  let next = state
  for (let guard = 0; guard < 8; guard++) {
    const command = productionDecision(next)?.command
    if (command === null || command === undefined) return next
    const result = runProductionCommand(next, command)
    if (!result.ok) return next
    next = result.next
  }
  return next
}

/**
 * Walk a studio forward BY HAND — answering decisions exactly as a player would —
 * until `done` is satisfied, and hand back the state one week before it. Every
 * expectation in this file is anchored on a walk like this, so the test asserts
 * what the ENGINE does, not what the author hoped it would do.
 */
function walkToWeekBefore(
  start: GameState,
  done: (step: ReturnType<typeof advanceWeek>) => boolean,
  limit = 120,
): GameState {
  let state = start
  for (let weeks = 0; weeks < limit; weeks++) {
    const answered = answerBoard(state)
    const step = advanceWeek(answered)
    if (done(step)) return answered
    state = step.next
  }
  throw new Error('the walk never reached the week it was looking for')
}

/** Prove a hands-off stretch is genuinely quiet: no PAUSE-class stop inside it. */
function quietStretch(start: GameState, weeks: number): GameState {
  let state = start
  for (let i = 0; i < weeks; i++) {
    const step = advanceWeek(state)
    if (step.stopReason !== null && livingTurnStopClass(step.stopReason) === 'pause') {
      throw new Error(`the stretch was not quiet: ${step.stopReason} at week ${String(i + 1)}`)
    }
    state = step.next
  }
  return state
}

/** How many weeks a hands-off run gets before the FIRST PAUSE-class stop. */
function pauseClassRunway(start: GameState): {
  weeks: number
  reason: SimStopReason
  at: GameState
} {
  let state = start
  for (let weeks = 1; weeks <= 120; weeks++) {
    const step = advanceWeek(state)
    state = step.next
    if (step.stopReason !== null && livingTurnStopClass(step.stopReason) === 'pause') {
      return { weeks, reason: step.stopReason, at: state }
    }
  }
  throw new Error('expected a PAUSE-class stop inside 120 weeks')
}

/**
 * Mount the Lot on the REAL clock, then take the clock over.
 *
 * The lazy Lot chunk is resolved by the module loader, not by a timer, so it must
 * be awaited before the fake clock exists — otherwise the mount waits forever on a
 * promise no `advanceTimersByTime` can reach. Everything the scheduler does happens
 * after this point, and all of it is on the mocked clock.
 */
async function mountLot(state: GameState) {
  saveActiveSession(state)
  render(<App />)
  await screen.findByTestId('studio-lot-screen')
  await waitFor(() => expect(renderer.instances).toHaveLength(1))
  vi.useFakeTimers()
  // @testing-library's fake-timer support keys off a global `jest` carrying
  // `advanceTimersByTime`; Vitest's equivalent is `vi`. Without this shim every
  // `waitFor` in a fake-timer test hangs on a clock nobody is winding. The clock
  // itself is Vitest's — this only tells the library where the crank is.
  vi.stubGlobal('jest', {
    advanceTimersByTime: (ms: number) => {
      vi.advanceTimersByTime(ms)
    },
  })
  return renderer.instances[0]!
}

/**
 * Spend `ms` of wall time the way a browser would, inside React's act().
 *
 * It advances in SHORT chunks on purpose. A commit re-arms the next week's clock
 * from inside a React effect, and an effect only flushes at an `act` boundary — so
 * winding the mocked clock a whole fortnight in one call would fire one timer and
 * register the next one already in the past. Chunks shorter than the fastest week
 * (2,587.5ms at 4×) make every boundary its own flush, which is exactly what a real
 * browser frame loop does.
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
 * end of the chunk it landed in, so a run of N weeks can trail the ideal boundary
 * by at most N × SPEND_CHUNK_MS. That is far less than one further week at any
 * pace (2,587.5ms at the fastest), so "exactly N weeks passed" stays an exact
 * assertion — the slack can never buy an extra week.
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

describe('Living Turn V1 — the transport', () => {
  it('offers hold/roll and the whole pace ladder, paused at 1x', async () => {
    await mountLot(operatingStudio('living-turn-transport'))
    const transport = screen.getByTestId('lot-transport')
    expect(transport).toHaveAttribute('data-mode', 'paused')
    expect(transport).toHaveAttribute('data-speed', '1')
    expect(screen.getByTestId('lot-transport-toggle')).toHaveAttribute('aria-pressed', 'false')
    for (const speed of [1, 2, 4]) {
      expect(screen.getByTestId(`lot-transport-speed-${String(speed)}`)).toBeInTheDocument()
    }
    expect(screen.getByTestId('lot-transport-speed-1')).toHaveAttribute('aria-pressed', 'true')
    // The manual verbs survive unchanged (§4.1: Advance is demoted from required
    // heartbeat to option — it is not removed).
    expect(screen.getByTestId('lot-advance-week')).toBeInTheDocument()
    expect(screen.getByTestId('lot-sim-to-next-event')).toBeInTheDocument()
  })

  it('speaks about the studio, never about a scheduler', async () => {
    await mountLot(operatingStudio('living-turn-voice'))
    const toggle = screen.getByTestId('lot-transport-toggle')
    expect(toggle.getAttribute('aria-label')).toBe(
      'Let the studio work — the weeks run on their own',
    )
    fireEvent.click(toggle)
    expect(screen.getByTestId('lot-transport-toggle').getAttribute('aria-label')).toBe(
      'Hold the studio — stop the weeks',
    )
    for (const speed of [1, 2, 4]) {
      const label = screen
        .getByTestId(`lot-transport-speed-${String(speed)}`)
        .getAttribute('aria-label')
      expect(label).toBeTruthy()
      expect(label).not.toMatch(/tick|sim|scheduler|playback|engine|ms\b|fps/i)
    }
  })
})

describe('Living Turn V1 — time flows while unpaused (the Owner s acceptance)', () => {
  it('commits ONE authoritative week per witnessed week and nothing else', async () => {
    await mountLot(operatingStudio('living-turn-cadence'))
    const week0 = shownWeek()

    fireEvent.click(screen.getByTestId('lot-transport-toggle'))
    expect(screen.getByTestId('lot-transport')).toHaveAttribute('data-mode', 'running')

    // Nothing has happened yet: the first week is still being witnessed.
    await spend(livingTurnWeekMs(1) - 50)
    expect(shownWeek()).toBe(week0)

    // …and it lands on the beat.
    await spend(100)
    await waitFor(() => expect(shownWeek()).toBe(week0 + 1))

    for (let i = 2; i <= 3; i++) {
      await spendWeeks(1)
      await waitFor(() => expect(shownWeek()).toBe(week0 + i))
    }
  })

  it('runs 12 consecutive weeks with ZERO input and lands byte-identically', async () => {
    // A studio with a picture IN THEATRES: money moving every week, a theatrical
    // run completing mid-flight (NOTIFY-class), and no decision owed. This is the
    // gate's hands-off proof — the run length is measured, not hoped for.
    const start = walkToWeekBefore(operatingStudio('living-turn-hands-off'), (step) =>
      step.released.length > 0,
    )
    const shipped = advanceWeek(start).next
    // Non-vacuous by construction: this throws if any of the twelve weeks would
    // have paused the loop, so the run below is a genuine hands-off stretch.
    const byHand = quietStretch(shipped, 12)

    await mountLot(shipped)
    const week0 = shownWeek()
    fireEvent.click(screen.getByTestId('lot-transport-toggle'))
    // ONE control, touched ONCE. Everything after this is the studio working.
    await spendWeeks(12)

    await waitFor(() => expect(shownWeek()).toBe(week0 + 12))
    expect(screen.getByTestId('lot-transport')).toHaveAttribute('data-mode', 'running')
    await waitFor(() => {
      const restored = loadActiveSession()
      expect(restored.ok).toBe(true)
      if (!restored.ok) return
      expect(exportSaveJson(restored.state)).toBe(exportSaveJson(byHand))
    })
  })

  it('speed changes the PACE and nothing else — 4x is four weeks in one week s time', async () => {
    const start = walkToWeekBefore(operatingStudio('living-turn-speed'), (step) =>
      step.released.length > 0,
    )
    const shipped = advanceWeek(start).next
    await mountLot(shipped)
    const week0 = shownWeek()
    fireEvent.click(screen.getByTestId('lot-transport-speed-4'))
    expect(screen.getByTestId('lot-transport')).toHaveAttribute('data-speed', '4')
    expect(renderer.instances[0]!.speeds.at(-1)).toBe(4)
    fireEvent.click(screen.getByTestId('lot-transport-toggle'))

    // Four weeks inside the wall time ONE week takes at 1×.
    await spendWeeks(4, 4)
    await waitFor(() => expect(shownWeek()).toBe(week0 + 4))

    let byHand = shipped
    for (let i = 0; i < 4; i++) byHand = advanceWeek(byHand).next
    await waitFor(() => {
      const restored = loadActiveSession()
      expect(restored.ok).toBe(true)
      if (!restored.ok) return
      expect(exportSaveJson(restored.state)).toBe(exportSaveJson(byHand))
    })
  })

  it('holding stops the weeks, and the studio stays exactly where it was', async () => {
    const start = walkToWeekBefore(operatingStudio('living-turn-hold'), (step) =>
      step.released.length > 0,
    )
    await mountLot(advanceWeek(start).next)
    const week0 = shownWeek()
    fireEvent.click(screen.getByTestId('lot-transport-toggle'))
    await spendWeeks(2)
    await waitFor(() => expect(shownWeek()).toBe(week0 + 2))

    fireEvent.click(screen.getByTestId('lot-transport-toggle'))
    expect(screen.getByTestId('lot-transport')).toHaveAttribute('data-mode', 'paused')
    const held = shownWeek()
    await spend(livingTurnWeekMs(1) * 6)
    expect(shownWeek()).toBe(held)
  })

  it('a hidden tab is a held studio — living time never advances what nobody watches', async () => {
    const start = walkToWeekBefore(operatingStudio('living-turn-hidden'), (step) =>
      step.released.length > 0,
    )
    await mountLot(advanceWeek(start).next)
    const week0 = shownWeek()
    fireEvent.click(screen.getByTestId('lot-transport-toggle'))

    const hidden = vi.spyOn(document, 'hidden', 'get').mockReturnValue(true)
    await act(async () => {
      document.dispatchEvent(new Event('visibilitychange'))
    })
    await spend(livingTurnWeekMs(1) * 4)
    expect(shownWeek()).toBe(week0)

    hidden.mockReturnValue(false)
    await act(async () => {
      document.dispatchEvent(new Event('visibilitychange'))
    })
    await spendWeeks(1)
    await waitFor(() => expect(shownWeek()).toBe(week0 + 1))
  })
})

describe('Living Turn V1 — the partition, at the seam', () => {
  it('auto-pauses on the FIRST PAUSE-class stop, at exactly the hand-advanced week', async () => {
    const start = operatingStudio('living-turn-pause-class')
    const runway = pauseClassRunway(start)
    expect(livingTurnStopClass(runway.reason)).toBe('pause')

    await mountLot(start)
    const week0 = shownWeek()
    fireEvent.click(screen.getByTestId('lot-transport-toggle'))
    // Generous: a whole extra runway of wall time. If the partition leaked, the
    // studio would be far past its stop by the time this returns.
    await spendWeeks(runway.weeks * 2 + 4)

    await waitFor(() =>
      expect(screen.getByTestId('lot-transport')).toHaveAttribute('data-mode', 'paused'),
    )
    expect(shownWeek()).toBe(week0 + runway.weeks)
    const restored = loadActiveSession()
    expect(restored.ok).toBe(true)
    if (restored.ok) expect(exportSaveJson(restored.state)).toBe(exportSaveJson(runway.at))
  })

  it('a NOTIFY-class wrap reaches the bulletin and the loop keeps working', async () => {
    const start = walkToWeekBefore(
      operatingStudio('living-turn-notify'),
      (step) => step.stopReason === 'wrap',
    )
    expect(advanceWeek(start).stopReason).toBe('wrap')

    await mountLot(start)
    const week0 = shownWeek()
    fireEvent.click(screen.getByTestId('lot-transport-toggle'))
    await spendWeeks(2)

    await waitFor(() => expect(screen.getByTestId('lot-living-turn-bulletin')).toBeInTheDocument())
    expect(screen.getByTestId('lot-living-turn-bulletin')).toHaveTextContent(
      /Principal photography wrapped/,
    )
    expect(screen.getByTestId('lot-living-turn-bulletin')).not.toHaveTextContent(/Stopped at Week/)
    // The loop did NOT stop for it.
    expect(screen.getByTestId('lot-transport')).toHaveAttribute('data-mode', 'running')
    expect(shownWeek()).toBeGreaterThan(week0 + 1)
  })

  it('the bulletin clears on request', async () => {
    const start = walkToWeekBefore(
      operatingStudio('living-turn-notify-clear'),
      (step) => step.stopReason === 'wrap',
    )
    await mountLot(start)
    fireEvent.click(screen.getByTestId('lot-advance-week'))
    await waitFor(() => expect(screen.getByTestId('lot-living-turn-bulletin')).toBeInTheDocument())
    fireEvent.click(screen.getByTestId('lot-living-turn-bulletin-dismiss'))
    expect(screen.queryByTestId('lot-living-turn-bulletin')).not.toBeInTheDocument()
  })
})

describe('Living Turn V1 — the loop cannot stall silently, and the batch verb holds it', () => {
  it('re-arms the week on screen when the cadence channel is cleared under a running loop', async () => {
    const start = walkToWeekBefore(operatingStudio('living-turn-rearm'), (step) =>
      step.released.length > 0,
    )
    await mountLot(advanceWeek(start).next)
    const week0 = shownWeek()
    fireEvent.click(screen.getByTestId('lot-transport-toggle'))
    await spendWeeks(1)
    await waitFor(() => expect(shownWeek()).toBe(week0 + 1))

    // Open a deep surface and come straight back: the Lot's cadence channel is
    // cleared on the way through, which used to leave the transport saying
    // "running" over a studio that had quietly stopped.
    fireEvent.click(screen.getByTestId('lot-return-dashboard'))
    await waitFor(() => expect(screen.getByTestId('dash-week')).toBeInTheDocument())
    const backToLot =
      screen.queryByTestId('back-to-studio-lot') ?? screen.getByTestId('open-studio-lot')
    fireEvent.click(backToLot)
    await waitFor(() => expect(screen.getByTestId('studio-lot-screen')).toBeInTheDocument())

    const back = shownWeek()
    await spendWeeks(1)
    await waitFor(() => expect(shownWeek()).toBe(back + 1))
  })

  it('the batch verb HOLDS the studio — a skipped batch was never witnessed time', async () => {
    const start = walkToWeekBefore(operatingStudio('living-turn-batch-holds'), (step) =>
      step.released.length > 0,
    )
    await mountLot(advanceWeek(start).next)
    fireEvent.click(screen.getByTestId('lot-transport-toggle'))
    expect(screen.getByTestId('lot-transport')).toHaveAttribute('data-mode', 'running')
    const batch = screen.getByTestId('lot-sim-to-next-event')
    // The verb is only the subject when it is genuinely available; a disabled
    // control proves nothing about what running it does.
    expect(batch).toBeEnabled()
    fireEvent.click(batch)
    await waitFor(() =>
      expect(screen.getByTestId('lot-transport')).toHaveAttribute('data-mode', 'paused'),
    )
  })
})

describe('Living Turn V1 — the release week plays before its surfaces take over', () => {
  it('the shipping week is witnessed, and the release surface follows it', async () => {
    const start = walkToWeekBefore(operatingStudio('living-turn-release-hole'), (step) =>
      step.released.length > 0,
    )
    await mountLot(start)
    const view = renderer.instances[0]!
    const playedBefore = view.playedWeeks.length
    fireEvent.click(screen.getByTestId('lot-advance-week'))

    // THE HOLE, CLOSED: the lot is still mounted and the shipping week is PLAYING.
    await waitFor(() => expect(view.playedWeeks).toHaveLength(playedBefore + 1))
    expect(screen.getByTestId('studio-lot-screen')).toBeInTheDocument()

    // …and when the played week settles, the release surfaces take over.
    await spendWeeks(1)
    await waitFor(() => expect(screen.queryByTestId('studio-lot-screen')).not.toBeInTheDocument())
  })
})
