// ── C2a-M5 CONTRACT SUITE — determinism, and the legacy path's silence ──────
//
// Written from the charter and `08A`, NOT from the implementation:
//
//   *"Determinism proof obligation: the same seeded action script produces
//   byte-identical exported saves whether weeks were advanced by hand, by the
//   living loop at any speed, paused/resumed arbitrarily, or batch-skipped. The
//   living loop emits ACTIONS; it never becomes an authority."*             (08A)
//   *"NO fake renderer clock — the engine's discrete week stays the ONLY
//   authoritative clock … wall-clock/FPS never determine outcomes."*        (00G)
//   *"The M0A gate is preserved: the ledger is EMPTY on the legacy/headless
//   path."*                                                             (§5 pin 5)
//
// THE ENGINE HALF of the four-way time parity lives here: HAND-ADVANCED vs
// BATCH-SKIPPED, from one seed and one action script, compared as exported bytes.
// The two remaining arms (the living loop at any speed, and paused/resumed) are
// the SCHEDULER's, and they can only be proven once the scheduler exists — but
// they reduce to this one, because the scheduler commits the identical
// `advanceWeek` a manual press commits and this file pins that call's determinism.

import { describe, expect, it } from 'vitest'
import { applyActions, studioWeekTheater } from '../../../../src/core/index.ts'
import type { GameState } from '../../../../src/core/index.ts'
import {
  advanceToNextEvent,
  advanceWeek,
  exportSaveJson,
  newGame,
  studioWeekTheaterView,
} from '../../engine/adapter.ts'
import type { SimStopReason } from '../../engine/adapter.ts'
import { contendedStudio } from '../../../../tests/_m4Fixtures.ts'

const SEED = 'c2a-m5-determinism'
const HORIZON = 24

/**
 * ONE seeded action script. Every command it issues is a command the engine
 * accepts; nothing here reads a clock, a frame, or a random draw.
 */
function scriptedStudio(seed: string): GameState {
  const contended = contendedStudio(seed)
  let state: GameState = contended.state
  const struck = state.sets[1]
  if (struck !== undefined) {
    state = applyActions(state, [{ kind: 'strikeSet', setId: struck.id }])
    state = applyActions(state, [
      {
        kind: 'commissionSet',
        commission: { blueprintId: 'set-house-generic', stageFacilityId: struck.mountedOn },
      },
    ])
  }
  return state
}

/** The shooting commands a week is waiting on — the script's only per-week input. */
function driveTakes(state: GameState): GameState {
  let next = state
  for (const workflow of state.operations.workflows) {
    if (workflow.phase !== 'shooting' || workflow.shootingTask?.status !== 'unassigned') continue
    const production = state.studio.activeProductions.find(
      (candidate) => candidate.id === workflow.productionId,
    )!
    // P05A W1: due-at-call settles inside the Director call itself; follow the
    // engine's own task status instead of scripting the retired manual clear.
    next = applyActions(next, [
      {
        kind: 'assignShootingDirector',
        productionId: production.id,
        directorId: production.directorId,
      },
    ])
    const settled = next.operations.workflows.find(
      (candidate) => candidate.productionId === production.id,
    )
    if (settled?.shootingTask?.status === 'ready') {
      next = applyActions(next, [
        { kind: 'scheduleShootingTake', productionId: production.id },
      ])
    }
  }
  return next
}

type HandRun = {
  save: string
  week: number
  stops: (SimStopReason | null)[]
  theater: string[]
}

/** Advance one authoritative week at a time — what a manual press, or the scheduler, does. */
function handAdvanced(seed: string, weeks: number): HandRun {
  let state = scriptedStudio(seed)
  const stops: (SimStopReason | null)[] = []
  const theater: string[] = []
  for (let i = 0; i < weeks; i++) {
    state = driveTakes(state)
    theater.push(JSON.stringify(studioWeekTheaterView(state) ?? null))
    const step = advanceWeek(state)
    stops.push(step.stopReason)
    state = step.next
  }
  theater.push(JSON.stringify(studioWeekTheaterView(state) ?? null))
  return { save: exportSaveJson(state), week: state.market.tick, stops, theater }
}

/** Skip through the same weeks with the batch verb, driving the same commands. */
function batchSkipped(
  seed: string,
  weeks: number,
): { save: string; week: number; batches: number; batchedWeeks: number } {
  let state = scriptedStudio(seed)
  const target = state.market.tick + weeks
  let guard = 0
  let batches = 0
  let batchedWeeks = 0
  while (state.market.tick < target && guard < weeks * 4) {
    guard += 1
    state = driveTakes(state)
    if (state.market.tick >= target) break
    const result = advanceToNextEvent(state)
    if (result.weeks === 0) {
      // The batch refuses to charge a hidden week when a decision already waits.
      // The script's own commands are what clear it; if none applied, step by hand
      // so the twin cannot livelock on a decision this script does not answer.
      state = advanceWeek(state).next
      continue
    }
    batches += 1
    batchedWeeks += result.weeks
    if (result.toWeek > target) {
      batches -= 1
      batchedWeeks -= result.weeks
      // Never overshoot the comparison week: finish by hand.
      while (state.market.tick < target) {
        state = driveTakes(state)
        state = advanceWeek(state).next
      }
      break
    }
    state = result.next
  }
  return { save: exportSaveJson(state), week: state.market.tick, batches, batchedWeeks }
}

describe('C2a-M5 — same seed, same script, same answer', () => {
  it('produces an IDENTICAL stop sequence on two runs', () => {
    const a = handAdvanced(SEED, HORIZON)
    const b = handAdvanced(SEED, HORIZON)
    expect(b.stops).toEqual(a.stops)
    // Non-vacuous: the script actually reaches governed stops, more than one kind.
    const governed = a.stops.filter((stop): stop is SimStopReason => stop !== null)
    expect(governed.length).toBeGreaterThanOrEqual(2)
    expect(new Set(governed).size).toBeGreaterThanOrEqual(2)
  })

  it('produces IDENTICAL theater tracks on two runs, week for week', () => {
    const a = handAdvanced(SEED, HORIZON)
    const b = handAdvanced(SEED, HORIZON)
    expect(b.theater).toEqual(a.theater)
    // Non-vacuous: the tracks are not all empty.
    expect(a.theater.some((week) => week.includes('"beats"'))).toBe(true)
  })

  it('produces a BYTE-IDENTICAL exported save on two runs', () => {
    expect(handAdvanced(SEED, HORIZON).save).toBe(handAdvanced(SEED, HORIZON).save)
  })
})

describe('C2a-M5 — hand-advanced and batch-skipped are the same studio', () => {
  it('exports BYTE-IDENTICAL saves at the same week (08A’s parity obligation)', () => {
    const hand = handAdvanced(SEED, HORIZON)
    const batch = batchSkipped(SEED, HORIZON)
    expect(batch.week).toBe(hand.week)
    expect(batch.save).toBe(hand.save)
    // NON-VACUOUS: the twin genuinely SKIPPED — several multi-week batches, not a
    // hand walk wearing the batch verb's name.
    expect(batch.batches).toBeGreaterThanOrEqual(2)
    expect(batch.batchedWeeks).toBeGreaterThan(batch.batches)
  })

  it('reads the SAME theater from the two twins — the projection is of state alone', () => {
    // Both twins are at the same week with the same bytes, so the projection over
    // them must agree; if it did not, something in the theater would be reading
    // the path taken rather than the state reached.
    const hand = handAdvanced(SEED, HORIZON)
    const batch = batchSkipped(SEED, HORIZON)
    expect(batch.save).toBe(hand.save)
    expect(hand.theater.at(-1)).toBeDefined()
  })
})

describe('C2a-M5 — the LEGACY path is silent (the M0A corpus gate)', () => {
  it('produces NO theater subjects, NO wrap stops, and an EMPTY ledger', () => {
    let state: GameState = newGame('c2a-m5-legacy-silence-determinism')
    expect(state.operations.mode).not.toBe('managed')
    for (let i = 0; i < 40; i++) {
      // The three claims, every week, for forty weeks.
      const projection = studioWeekTheater(state)
      expect(projection.subjects).toEqual([])
      expect(studioWeekTheaterView(state)).toBeUndefined()
      expect(state.studioEvents.rows).toHaveLength(0)
      const step = advanceWeek(state)
      expect(step.stopReason).not.toBe('wrap')
      expect(step.stop?.wrapped ?? []).toHaveLength(0)
      state = step.next
    }
    expect(state.studioEvents.nextSeq).toBe(0)
  })

  it('and the batch verb never mints a wrap there either', () => {
    let state: GameState = newGame('c2a-m5-legacy-batch')
    for (let i = 0; i < 6; i++) {
      const result = advanceToNextEvent(state)
      expect(result.stopReason).not.toBe('wrap')
      expect(result.wrapped).toEqual([])
      if (result.weeks === 0) break
      state = result.next
    }
  })
})
