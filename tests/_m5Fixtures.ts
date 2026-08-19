// ── C2a-M5 fixtures — THE LIVING STUDIO, under pressure ─────────────────────
//
// §12-M5's hands-off gate asks ONE studio to demonstrate five things at once:
//
//   • two pictures in flight,
//   • ≥12 CONSECUTIVE unpaused weeks with zero player input,
//   • a queue that visibly DRAINS into freed capacity inside that run,
//   • a NOTIFY-class event that surfaces WITHOUT pausing, and
//   • an auto-pause on the FIRST PAUSE-class stop.
//
// Those five pull against each other, and finding a studio that carries all of
// them is an engine question, not a wish. The measurement behind this file:
//
//   THE PRODUCTION PIPELINE IS DECISION-DENSE. `TUNING.PRODUCTION_TICKS` is a
//   fixed six-phase walk, and it asks the player for a shooting decision at
//   Shooting entry and plays a Premiere at the end — both PAUSE-class. A picture
//   that is ADVANCING therefore pauses the loop inside four weeks, and no
//   arrangement of pictures, sets or stages moves that. (Measured at this HEAD:
//   development 1w → preProduction 1w → rehearsal 1w → shooting 2w with a
//   `productionDecision` on entry → postProduction 2w → releaseReady 1w →
//   `release`. The longest hands-off run with any picture advancing is 9 weeks,
//   on a lot waiting out an eight-week showpiece set build.)
//
//   A PICTURE THAT IS *WAITING* IS QUIET. A capacity blocker is a truthful
//   warning with NO player command behind it (`adapter.productionDecision`
//   says so in its own comment), so a company standing by for scenery stops
//   nothing. It is still visible, still costed, and still has its reason stated
//   on the Class-A queue surfaces — which is exactly the studio §4.1 describes
//   as "stalled only on NOTIFY-class facts [and keeping] running".
//
//   SO THE HANDS-OFF STUDIO IS A STUDIO IN TROUBLE. Every set struck, three
//   pictures greenlit against two Development & Casting rooms, a scenery shop
//   rising to fix it, and a bank balance that runs out before the shop opens.
//   The weeks pass, the queue drains into the room that frees, the shop opens
//   and says so without stopping anything, and then the money crosses zero and
//   the studio stops ITSELF with a stated reason — which is §4.1's own sentence:
//   *"`cashNegative` is PAUSE-class, so a genuinely failing studio always pauses
//   with a stated reason."*
//
// EVERYTHING HERE IS A PUBLIC ACTION except the opening bank balance, which is
// SET (`withCash`, the shipped fixture helper, which also writes its own ledger
// row). It is set because the fixture has to know the week the runway ends, and
// the honest way to know it is to calibrate against the engine rather than to
// guess: `livingStudioUnderPressure` walks the studio itself, reads the cash the
// engine actually spends, and picks the opening balance that puts the crossing
// on the week the caller asked for. Then it walks it AGAIN and refuses to hand
// back a studio that does not do what it just promised.

import { applyActions, queryPlacement, tick } from '../src/core/index.js'
import type { GameState, LotCell } from '../src/core/index.js'
import { contendedStudio, freePackage } from './_m4Fixtures.js'
import { withCash } from './contracts/_contractFixtures.js'

/**
 * The build that rises during the run. Eleven weeks
 * (`TUNING.SCENERY_SHOP_BUILD_WEEKS`), so its completion — a NOTIFY-class
 * `constructionCompleted` — lands INSIDE any run long enough to satisfy the
 * gate, and the assertion that it does is made by the caller, not assumed here.
 */
export const M5_PRESSURE_BUILD_BLUEPRINT = 'scenery-shop'

/** A balance large enough that nothing in the opening week is money-gated. */
const CALIBRATION_CASH = 500_000_000

/** How far the calibration walk looks. Longer than any run the gate asks for. */
const CALIBRATION_HORIZON = 120

/**
 * The first legal origin for `blueprintId`, scanning the grid in a FIXED order.
 *
 * Deterministic by construction: same state, same blueprint, same cell. The lot
 * is small enough that the scan is cheap, and asking the one placement authority
 * (`queryPlacement`) means the fixture can never author an illegal build.
 */
function firstLegalOrigin(state: GameState, blueprintId: string): LotCell {
  for (let gy = 0; gy < 32; gy += 1) {
    for (let gx = 0; gx < 32; gx += 1) {
      if (queryPlacement(state, { blueprintId, origin: { gx, gy } }).ok) return { gx, gy }
    }
  }
  throw new Error(`c2a-m5 fixture: no legal origin for "${blueprintId}" on this lot`)
}

/**
 * The studio, before its bank balance is set: two pictures in flight, a third
 * greenlight WAITING for a Development & Casting room, every set struck so no
 * picture can reach a stage, and a scenery shop rising to end the drought.
 */
function pressuredStudio(seed: string): GameState {
  const contended = contendedStudio(seed)
  let state: GameState = contended.state
  const third = contended.readyProjectIds[0]
  if (third === undefined) {
    throw new Error('c2a-m5 fixture: the contended studio owes a third screenplay to greenlight')
  }
  // THE THIRD PICTURE. Both Development & Casting rooms are held, so this
  // greenlight is not refused — it QUEUES, which is the waiter the gate watches
  // drain (M4's front-door law, unchanged).
  state = applyActions(state, [
    { kind: 'greenlightScriptProject', production: freePackage(state, third) },
  ])
  if (state.productionQueue.length !== 1) {
    throw new Error('c2a-m5 fixture: the third greenlight should be WAITING, not refused')
  }
  // EVERY SET STRUCK. A picture that reaches rehearsal entry now finds a free
  // stage with no scenery on it — the `set-unavailable` arm — and waits there,
  // costed and visible, without ever asking the player for a decision.
  for (const set of state.sets) {
    state = applyActions(state, [{ kind: 'strikeSet', setId: set.id }])
  }
  if (state.sets.some((set) => set.status === 'standing')) {
    throw new Error('c2a-m5 fixture: a standing set survived the strike')
  }
  // THE REMEDY, UNDER CONSTRUCTION. Eleven weeks of visible work, and a
  // NOTIFY-class completion at the end of them.
  const origin = firstLegalOrigin(state, M5_PRESSURE_BUILD_BLUEPRINT)
  state = applyActions(state, [
    { kind: 'placeFacility', placement: { blueprintId: M5_PRESSURE_BUILD_BLUEPRINT, origin } },
  ])
  return state
}

/** Walk `weeks` weeks with the SAME call the manual verb and the loop both make. */
function walk(state: GameState, weeks: number): GameState[] {
  const out: GameState[] = []
  let current = state
  for (let i = 0; i < weeks; i += 1) {
    current = tick(current, { develop: true })
    out.push(current)
  }
  return out
}

export type LivingStudioFixture = {
  /** The seeded save the gate starts from. */
  state: GameState
  /** Consecutive unpaused weeks this studio owes a hands-off loop. */
  quietWeeks: number
  /** Weeks in, counting from `state`, that the waiting greenlight leaves the queue. */
  queueDrainsAfter: number
  /** Weeks in that the scenery shop opens — a NOTIFY-class stop that pauses nothing. */
  buildCompletesAfter: number
}

/**
 * A studio that runs `quietWeeks` consecutive unpaused weeks and then stops
 * ITSELF because the money ran out.
 *
 * THE CALIBRATION, STATED. The opening balance is not authored: the studio is
 * walked once on an unlimited balance to read what the engine actually spends,
 * and the balance is then set to one penny less than the cumulative spend at
 * `quietWeeks + 1` — so the crossing happens on that week and on no earlier one.
 * The walk is then REPEATED against the calibrated studio and every promise in
 * the returned record is checked. A fixture that cannot keep its promise throws
 * here rather than becoming a vacuous test somewhere else.
 */
export function livingStudioUnderPressure(seed: string, quietWeeks: number): LivingStudioFixture {
  if (!Number.isInteger(quietWeeks) || quietWeeks < 1) {
    throw new Error('c2a-m5 fixture: quietWeeks must be a positive integer')
  }
  if (quietWeeks + 1 > CALIBRATION_HORIZON) {
    throw new Error('c2a-m5 fixture: quietWeeks exceeds the calibration horizon')
  }
  const base = pressuredStudio(seed)
  const startWeek = base.market.tick

  // ── read what the engine spends, on a balance that gates nothing ───────────
  const rich = withCash(base, CALIBRATION_CASH)
  const richWalk = walk(rich, quietWeeks + 1)
  const spentBy = (week: number): number =>
    CALIBRATION_CASH - (richWalk[week - 1]?.studio.cash ?? CALIBRATION_CASH)
  const opening = Math.round(spentBy(quietWeeks + 1)) - 1
  if (opening <= 0) {
    throw new Error('c2a-m5 fixture: this studio does not spend enough to run out of money')
  }

  const state = withCash(base, opening)
  const proof = walk(state, quietWeeks + 1)

  // ── and then check every promise, against the calibrated studio ────────────
  const queueDrainsAfter = proof.findIndex((week) => week.productionQueue.length === 0) + 1
  if (queueDrainsAfter < 1 || queueDrainsAfter > quietWeeks) {
    throw new Error(
      `c2a-m5 fixture: the queue must drain INSIDE the quiet run (drained after ${String(queueDrainsAfter)} of ${String(quietWeeks)})`,
    )
  }
  const drained = proof[queueDrainsAfter - 1]!
  if (drained.studio.activeProductions.length !== 3) {
    throw new Error('c2a-m5 fixture: the waiting greenlight did not become a picture in flight')
  }
  const placed = state.placement.facilities[state.placement.facilities.length - 1]!
  const buildCompletesAfter = placed.completesWeek - startWeek
  if (buildCompletesAfter < 1 || buildCompletesAfter > quietWeeks) {
    throw new Error(
      `c2a-m5 fixture: the build must open INSIDE the quiet run (opens after ${String(buildCompletesAfter)} of ${String(quietWeeks)})`,
    )
  }
  for (let i = 0; i < quietWeeks; i += 1) {
    if (proof[i]!.studio.cash < 0) {
      throw new Error(`c2a-m5 fixture: the money ran out early, on week ${String(i + 1)}`)
    }
  }
  if (proof[quietWeeks]!.studio.cash >= 0) {
    throw new Error('c2a-m5 fixture: the money never ran out')
  }
  if (state.studio.activeProductions.length !== 2) {
    throw new Error('c2a-m5 fixture: the gate wants TWO pictures in flight at the start')
  }
  return { state, quietWeeks, queueDrainsAfter, buildCompletesAfter }
}

/**
 * The week BEFORE principal photography wraps — the NOTIFY-class stop the
 * pressured studio above can never reach, because none of its pictures ever gets
 * to a stage.
 *
 * Wrap is `wrap`: NOTIFY-class, so the loop is meant to say so and KEEP WORKING.
 * Seeing that happen is a different thing from seeing a queue drain, and it needs
 * a different studio — one whose pictures are shooting.
 *
 * The wrap is detected from the ENGINE's own Tier-D ledger rather than from a
 * phase count: the week whose next tick appends a `wrapped` row IS the week
 * before the wrap, by the engine's definition and not by this file's.
 */
export function studioTheWeekBeforeWrap(seed: string): GameState {
  let state: GameState = contendedStudio(seed).state
  for (let weeks = 0; weeks < 40; weeks += 1) {
    // Answer only the shooting commands the week is actually waiting on. This is
    // what a player does at the board; nothing here is a fixture shortcut.
    for (const workflow of state.operations.workflows) {
      if (workflow.phase !== 'shooting' || workflow.shootingTask?.status !== 'unassigned') continue
      const production = state.studio.activeProductions.find(
        (candidate) => candidate.id === workflow.productionId,
      )
      if (production === undefined) continue
      state = applyActions(state, [
        {
          kind: 'assignShootingDirector',
          productionId: production.id,
          directorId: production.directorId,
        },
        { kind: 'clearSceneryLoadIn', productionId: production.id },
        { kind: 'scheduleShootingTake', productionId: production.id },
      ])
    }
    const before = state.studioEvents.rows.length
    const next = tick(state, { develop: true })
    if (next.studioEvents.rows.slice(before).some((row) => row.kind === 'wrapped')) return state
    state = next
  }
  throw new Error('c2a-m5 fixture: no picture wrapped inside forty weeks')
}
