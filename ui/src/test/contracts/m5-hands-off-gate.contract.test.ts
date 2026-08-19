// ── C2a-M5 §12-M5 — THE HANDS-OFF GATE, at the engine ───────────────────────
//
// The Owner's acceptance sentence for this milestone is *"I can stop touching
// controls and watch my studio visibly operate."* §12-M5 makes it mechanical:
//
//   *"a seeded save with two pictures in flight runs ≥12 consecutive unpaused
//   weeks with zero input, state advances exactly those weeks, the queue visibly
//   drains, auto-pause on the first PAUSE-class stop (run length asserted)."*
//
// The browser proof of that sentence is `ui/e2e/c2a-m5-living-turn-v1.spec.ts`.
// THIS file is its foundation: it pins, in the pure engine, that the studio the
// browser is handed genuinely owes every one of those facts — so a green browser
// run can never be a browser that simply did nothing for two minutes.
//
// The run length is MEASURED, never authored: every number below comes out of a
// hand-advanced walk of the same seeded state, using the identical `advanceWeek`
// the manual verb and the living loop both call.

import { describe, expect, it } from 'vitest'
import { advanceWeek, studioQueueBoard } from '../../engine/adapter.ts'
import type { SimStopReason } from '../../engine/adapter.ts'
import type { GameState } from '../../../../src/core/index.ts'
import { livingStudioUnderPressure } from '../../../../tests/_m5Fixtures.ts'

/**
 * §4.1's partition, restated from the CHARTER rather than imported from the
 * scheduler. The scheduler's own copy is proven total against `SimStopReason` by
 * a compile-time `never` guard in `ui/src/lot/livingTurn.ts`; writing the list
 * out again here means this file would notice if that partition ever quietly
 * moved a member from one class to the other.
 */
const PAUSE_CLASS: readonly SimStopReason[] = [
  'release',
  'scriptReview',
  'castingReview',
  'productionDecision',
  'cashNegative',
]

const SEED = 'c2a-m5-hands-off-gate'
/** The charter's own floor is 12; the fixture is built with room above it. */
const CHARTER_FLOOR = 12
const QUIET_WEEKS = 16

type Week = {
  /** 1-based: the nth week of the hands-off run. */
  n: number
  stopReason: SimStopReason | null
  pauses: boolean
  queued: number
  productions: number
  cash: number
}

/** Walk the studio by hand — one authoritative week at a time, zero input. */
function handsOff(start: GameState, weeks: number): { weeks: Week[]; end: GameState } {
  const out: Week[] = []
  let state = start
  for (let n = 1; n <= weeks; n += 1) {
    const step = advanceWeek(state)
    state = step.next
    out.push({
      n,
      stopReason: step.stopReason,
      pauses: step.stopReason !== null && PAUSE_CLASS.includes(step.stopReason),
      queued: state.productionQueue.length,
      productions: state.studio.activeProductions.length,
      cash: state.studio.cash,
    })
  }
  return { weeks: out, end: state }
}

const FIXTURE = livingStudioUnderPressure(SEED, QUIET_WEEKS)
const RUN = handsOff(FIXTURE.state, QUIET_WEEKS + 1)

describe('C2a-M5 §12-M5 — the studio the hands-off gate is run on', () => {
  it('starts with TWO pictures in flight and a THIRD greenlight waiting', () => {
    expect(FIXTURE.state.studio.activeProductions.length).toBe(2)
    expect(FIXTURE.state.productionQueue).toHaveLength(1)
    expect(FIXTURE.state.productionQueue[0]!.kind).toBe('greenlightScriptProject')
    // The waiter is READABLE — M4's law 2, which M5 must not have broken.
    const board = studioQueueBoard(FIXTURE.state)
    expect(board.waiters.length).toBeGreaterThanOrEqual(1)
    for (const waiter of board.waiters) {
      expect(waiter.title.length).toBeGreaterThan(0)
      expect(waiter.needs.label.length).toBeGreaterThan(0)
    }
  })

  it('is a MANAGED studio — the theater and the ladder are both live on it', () => {
    expect(FIXTURE.state.operations.mode).toBe('managed')
  })
})

describe('C2a-M5 §12-M5 — the run length, measured', () => {
  it(`runs at least the charter's ${String(CHARTER_FLOOR)} consecutive unpaused weeks`, () => {
    const quiet = RUN.weeks.slice(0, QUIET_WEEKS)
    expect(quiet).toHaveLength(QUIET_WEEKS)
    expect(QUIET_WEEKS).toBeGreaterThanOrEqual(CHARTER_FLOOR)
    for (const week of quiet) {
      expect(
        week.pauses,
        `week ${String(week.n)} would have paused the loop with "${String(week.stopReason)}"`,
      ).toBe(false)
    }
  })

  it('advances EXACTLY those weeks — no week is skipped and none is doubled', () => {
    const start = FIXTURE.state.market.tick
    let state = FIXTURE.state
    for (let n = 1; n <= QUIET_WEEKS; n += 1) {
      state = advanceWeek(state).next
      expect(state.market.tick).toBe(start + n)
    }
  })

  it('auto-pauses on the FIRST PAUSE-class stop, and that stop is the money', () => {
    const first = RUN.weeks.find((week) => week.pauses)
    expect(first).toBeDefined()
    expect(first!.n).toBe(QUIET_WEEKS + 1)
    // §4.1: "`cashNegative` is PAUSE-class, so a genuinely failing studio always
    // pauses with a stated reason." This studio is that studio.
    expect(first!.stopReason).toBe('cashNegative')
    expect(RUN.weeks[QUIET_WEEKS - 1]!.cash).toBeGreaterThanOrEqual(0)
    expect(first!.cash).toBeLessThan(0)
  })

  it('reproduces the whole run from the same seed, week for week', () => {
    const again = handsOff(livingStudioUnderPressure(SEED, QUIET_WEEKS).state, QUIET_WEEKS + 1)
    expect(again.weeks).toEqual(RUN.weeks)
  })
})

describe('C2a-M5 §12-M5 — what the player watches happen', () => {
  it('DRAINS the queue into freed capacity, inside the run and with zero input', () => {
    const before = RUN.weeks[FIXTURE.queueDrainsAfter - 2]
    const drained = RUN.weeks[FIXTURE.queueDrainsAfter - 1]!
    // Before: a picture waiting and two in flight. After: nothing waiting and
    // three in flight — the freed Development & Casting room took the waiter.
    expect(before?.queued ?? FIXTURE.state.productionQueue.length).toBe(1)
    expect(before?.productions ?? FIXTURE.state.studio.activeProductions.length).toBe(2)
    expect(drained.queued).toBe(0)
    expect(drained.productions).toBe(3)
    expect(drained.pauses).toBe(false)
    expect(FIXTURE.queueDrainsAfter).toBeLessThanOrEqual(QUIET_WEEKS)
    // …and it stays drained: a queue that empties and refills would make the
    // browser's single reading meaningless.
    for (const week of RUN.weeks.slice(FIXTURE.queueDrainsAfter - 1, QUIET_WEEKS)) {
      expect(week.queued).toBe(0)
      expect(week.productions).toBe(3)
    }
  })

  it('surfaces a NOTIFY-class stop INSIDE the run without pausing it', () => {
    const notified = RUN.weeks.filter((week) => week.stopReason !== null && !week.pauses)
    expect(notified.length).toBeGreaterThanOrEqual(1)
    for (const week of notified) {
      expect(week.n).toBeLessThanOrEqual(QUIET_WEEKS)
      expect(week.pauses).toBe(false)
    }
    // The named one: the scenery shop opening, on the week its own clock says.
    const completion = RUN.weeks.find((week) => week.stopReason === 'constructionCompleted')
    expect(completion).toBeDefined()
    expect(completion!.n).toBe(FIXTURE.buildCompletesAfter)
  })

  it('keeps the M4 queue laws intact throughout — every waiter still reads', () => {
    let state = FIXTURE.state
    for (let n = 1; n <= QUIET_WEEKS; n += 1) {
      const board = studioQueueBoard(state)
      for (const waiter of board.waiters) {
        // G16's four law-2 facts, non-empty, for every waiter, every week:
        // WHAT is waiting, WHAT it needs, WHAT holds it (or why nothing does),
        // and WHAT relieves it.
        expect(waiter.title.length).toBeGreaterThan(0)
        expect(waiter.needs.label.length).toBeGreaterThan(0)
        expect(waiter.headline.length).toBeGreaterThan(0)
        expect(waiter.detail.length).toBeGreaterThan(0)
        expect(waiter.occupiedBy.length + waiter.remedies.length).toBeGreaterThan(0)
      }
      state = advanceWeek(state).next
    }
  })
})
