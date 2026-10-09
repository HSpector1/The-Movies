// ── D-17A/T3 retrospective fixed-cost allocation (fixedCostAllocation.ts) ──────
// A PURE, deterministic, read-only managerial attribution: it spreads the studio's ACTUAL
// weekly fixed cost (ledger `payroll` + `overhead`) across the films that were occupying the
// studio that week. No I/O, no RNG, no mutation; the sim never reads it. It is a MANAGERIAL
// measure, not an engine invariant: D-12 §8 still says payroll and overhead are never folded
// into a film's Contribution, and `contribution` is untouched.
//
// WHY IT EXISTS (Owner ruling R7): the player-facing headline break-even is studio-economic,
// so a film's result has to be readable against the fixed cost the studio actually paid while
// that film was being made and released. R7's safeguard is the hard part, and it is the whole
// design of this module:
//
//   RECONCILIATION INVARIANT — over ANY window,
//       Σ per-film allocated  +  unallocated idle burn  ===  Σ ledger payroll+overhead
//   exactly, in whole dollars. Not "to the cent": to the DOLLAR, with `===`.
//
// Three decisions make that invariant true rather than approximately true:
//
//   C1 — THE LEDGER IS THE ONLY SOURCE. The per-week fixed cost is read from the signed
//        ledger (`−Σ amounts of kind payroll|overhead at week w`) and is NEVER recomputed
//        from the current contracts. A formula-based variant is provably wrong: during a
//        founding draft the tick charges nothing (tick.ts:465/:476) while `weeklyPayroll`
//        still prices the signed roster, so the formula would attribute money that was never
//        spent. A negative-control test proves that variant FAILS this invariant.
//   C2 — INTEGER DOLLARS END TO END. Equal split with largest-remainder: `base = ⌊F(w)/n⌋`
//        to every occupant, then +1 to the first `r = F(w) − n·base` of them in ascending
//        `productionId` order (plain `<`, the same ordering rule as tick.ts:141). No floats,
//        so no rounding drift can open a gap between the parts and the whole.
//   C3 — IDLE BURN IS REPORTED, NEVER SMEARED. Weeks with no film in production and no film
//        in release carry their fixed cost into `idle`. Spreading idle weeks over unrelated
//        films is exactly the kind of invented convention R7 forbids.
//
// WINDOW CONVENTION (declared, not derived) — a film occupies the studio for:
//   • its PRODUCTION window  [releaseTick − PRODUCTION_TICKS, releaseTick − 1] (8 weeks), and
//   • its THEATRICAL RUN     [releaseTick, releaseTick + totalWeeks − 1].
// THE RELEASE WEEK BELONGS TO THE RUN, not to production — the engine credits a release's
// first weekly gross in the same tick it opens the run (tick.ts step 3.5), so week
// `releaseTick` is a run week. The two windows are therefore adjacent and never overlap.
// A production still IN FLIGHT uses its stored `startTick` for the same 8-week span,
// truncated at the end of the requested window (the later weeks have not happened yet).
// A released film with no theatrical-run record (legacy/pre-D-12) contributes its production
// window only — there is no run to attribute. A legacy run is taken exactly as stored
// (`totalWeeks: 1`), never re-modelled. A window start is clamped at week 0.

import type { GameState } from './types.js'
import { TUNING } from './tuning.js'

/** An inclusive week range. */
export type AllocationWindow = { from: number; to: number }

/** One week of studio occupancy: what the studio actually paid, and who was occupying it. */
export type WeeklyOccupancy = {
  week: number
  /** ACTUAL fixed cost charged that week, whole dollars, positive = spent (ledger-derived). */
  fixedCost: number
  /** productionIds active that week; order is irrelevant (this module sorts). */
  activeProductionIds: readonly string[]
}

export type FilmFixedCostAllocation = {
  /** whole dollars of ledger payroll+overhead attributed to this film inside the window. */
  allocated: number
  /** weeks INSIDE the window in which this film occupied the studio (production or run). */
  allocatedWeeks: number
}

export type FixedCostAllocation = {
  window: AllocationWindow
  /** keyed by productionId, inserted in ascending productionId order (deterministic). */
  perFilm: Record<string, FilmFixedCostAllocation>
  /** fixed cost of weeks with NO occupant — reported, never smeared across films. */
  idle: number
  /** Σ ledger payroll+overhead over the window. `Σ perFilm.allocated + idle === total`. */
  total: number
}

const ASC = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0)

/**
 * Split one week's fixed cost across its occupants: equal shares, largest remainder, ascending
 * productionId. Returns entries in that same order. Σ of the shares === `fixedCost` EXACTLY for
 * any integer input (including a negative one — `Math.floor` + the derived remainder conserve
 * in both directions), which is what makes the window invariant hold by construction.
 */
export function partitionWeeklyFixedCost(
  fixedCost: number,
  activeProductionIds: readonly string[],
): { productionId: string; share: number }[] {
  const ids = [...new Set(activeProductionIds)].sort(ASC)
  const n = ids.length
  if (n === 0) return []
  if (!Number.isInteger(fixedCost)) {
    throw new Error(
      `fixedCostAllocation: fixed cost must be whole dollars to partition exactly (got ${String(fixedCost)})`,
    )
  }
  const base = Math.floor(fixedCost / n)
  const remainder = fixedCost - base * n // 0 ≤ remainder < n
  return ids.map((productionId, i) => ({ productionId, share: i < remainder ? base + 1 : base }))
}

/** Allocate an explicit occupancy series over a window. The pure core of the allocator. */
export function allocateFixedCostSeries(
  series: readonly WeeklyOccupancy[],
  window: AllocationWindow,
): FixedCostAllocation {
  const acc = new Map<string, FilmFixedCostAllocation>()
  let idle = 0
  let total = 0
  for (const w of series) {
    if (w.week < window.from || w.week > window.to) continue
    total += w.fixedCost
    const parts = partitionWeeklyFixedCost(w.fixedCost, w.activeProductionIds)
    if (parts.length === 0) {
      idle += w.fixedCost
      continue
    }
    for (const { productionId, share } of parts) {
      const cur = acc.get(productionId) ?? { allocated: 0, allocatedWeeks: 0 }
      cur.allocated += share
      cur.allocatedWeeks += 1
      acc.set(productionId, cur)
    }
  }
  const perFilm: Record<string, FilmFixedCostAllocation> = {}
  for (const id of [...acc.keys()].sort(ASC)) perFilm[id] = acc.get(id)!
  return { window, perFilm, idle, total }
}

/** −Σ ledger payroll+overhead per week (positive = spent). Weeks with no entry are absent. */
export function ledgerFixedCostByWeek(state: GameState): Map<number, number> {
  const byWeek = new Map<number, number>()
  for (const e of state.ledger) {
    if (e.kind !== 'payroll' && e.kind !== 'overhead') continue
    if (!Number.isInteger(e.amount)) {
      throw new Error(
        `fixedCostAllocation: ledger ${e.kind} at week ${String(e.week)} is not a whole dollar amount (${String(e.amount)}); the integer partition would not reconcile`,
      )
    }
    byWeek.set(e.week, (byWeek.get(e.week) ?? 0) - e.amount)
  }
  return byWeek
}

/**
 * The declared occupancy of every film the studio has made — production window plus theatrical
 * run, per the convention in this file's header. Inclusive `[from, to]` weeks, start clamped at
 * 0. Exported so the convention itself is testable and so a negative control can reuse the
 * occupancy while deliberately substituting a WRONG cost basis.
 */
export function filmOccupancyWindows(state: GameState): { productionId: string; from: number; to: number }[] {
  const out: { productionId: string; from: number; to: number }[] = []

  // In-flight productions: the stored greenlight tick starts the same 8-week span. The tail
  // beyond "now" has not happened; the window intersection in `fixedCostOccupancy` truncates it.
  for (const p of state.studio.activeProductions) {
    out.push({
      productionId: p.id,
      from: Math.max(0, p.startTick),
      to: p.startTick + TUNING.PRODUCTION_TICKS - 1,
    })
  }

  // Released films: production window, plus the run window when a run record exists.
  const runByProd = new Map(state.theatricalRuns.map((r) => [r.productionId, r]))
  const seen = new Set<string>()
  for (const f of state.studio.releasedFilms) {
    seen.add(f.productionId)
    const run = runByProd.get(f.productionId)
    out.push({
      productionId: f.productionId,
      from: Math.max(0, f.releaseTick - TUNING.PRODUCTION_TICKS),
      // no run record ⇒ production window only (the release week belongs to the run)
      to: run ? f.releaseTick + run.totalWeeks - 1 : f.releaseTick - 1,
    })
  }
  // Defensive: a run whose film is absent from `releasedFilms` (never produced by the engine,
  // but the read-model must not silently drop ledger occupancy if a save ever carries one).
  for (const r of state.theatricalRuns) {
    if (seen.has(r.productionId)) continue
    out.push({
      productionId: r.productionId,
      from: Math.max(0, r.releaseTick - TUNING.PRODUCTION_TICKS),
      to: r.releaseTick + r.totalWeeks - 1,
    })
  }

  out.sort((a, b) => ASC(a.productionId, b.productionId) || a.from - b.from)
  return out
}

/** The per-week (actual cost, occupants) series for a window — the input `allocateFixedCosts` uses. */
export function fixedCostOccupancy(state: GameState, window: AllocationWindow): WeeklyOccupancy[] {
  const cost = ledgerFixedCostByWeek(state)
  const windows = filmOccupancyWindows(state)
  const out: WeeklyOccupancy[] = []
  for (let w = window.from; w <= window.to; w++) {
    const active: string[] = []
    for (const f of windows) if (f.from <= w && w <= f.to) active.push(f.productionId)
    out.push({ week: w, fixedCost: cost.get(w) ?? 0, activeProductionIds: active })
  }
  return out
}

/**
 * THE retrospective allocator. Default window = `[0, state.market.tick − 1]`: every week the
 * studio has actually lived through (the current tick has not been charged yet).
 *
 * Guarantees, all property-tested: integer dollars; non-negative shares for the engine's own
 * (always-debit) fixed costs; zero allocation outside a film's occupancy; window additivity;
 * and `Σ perFilm.allocated + idle === total` exactly, over any window.
 */
export function allocateFixedCosts(state: GameState, window?: AllocationWindow): FixedCostAllocation {
  const win = window ?? { from: 0, to: state.market.tick - 1 }
  return allocateFixedCostSeries(fixedCostOccupancy(state, win), win)
}
