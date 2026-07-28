// ── D-12 studio economy — pure, deterministic derivations ─────────────────────
// The mathematical heart of the theatrical-run economy: the weekly gross SCHEDULE
// (conserves opening×legs, changes only the timing), the Hill FAME→opening-reach
// saturation, and the TheatricalRun builders (open at release; legacy migration).
//
// No RNG, no wall-clock, no state mutation. Every value is a pure function of its
// inputs + TUNING. The gross total is never rerolled — the schedule redistributes the
// existing `opening × legs` over weeks, so a released film's run is byte-stable.

import { clamp } from './math.js'
import { TUNING } from './tuning.js'
import type { FilmResult, TheatricalRun } from './types.js'

// ── Fame → opening-reach saturation (Hill / half-saturation; D-12.7, owner ruling) ─
// Concave, monotone, no hard cap. Represents ONLY the fame-driven component of opening
// reach; NOT normalized to 1.0 at fame 100 (fame 100 → 0.67 at K=50). Deterministic.
export function fameReach(fame: number): number {
  const f = clamp(fame, 0, 100)
  return f / (f + TUNING.FAME_REACH_HALF_SAT)
}

// ── Weekly gross schedule (D-12.5) ────────────────────────────────────────────
// Distributes the SAME gross (opening × legs) over THEATRICAL_WEEKS weeks. Week 1 gross
// ≡ `opening` (exactly); weeks 2..N distribute `opening × (legs − 1)` on a geometric
// hold derived from legs, floored to keep a visible tail, then renormalized so the tail
// sums exactly to `opening × (legs − 1)`. Therefore Σ weeklyGross === opening × legs
// (conserved; the terminal FilmResult.boxOffice.total is unchanged). No RNG.
export function theatricalSchedule(opening: number, legs: number): number[] {
  const N = Math.max(1, TUNING.THEATRICAL_WEEKS)
  const gross = opening * legs
  if (N === 1 || legs <= 1) {
    const s = new Array(N).fill(0)
    s[0] = gross
    return s
  }
  const tailTotal = opening * (legs - 1) // distributed over weeks 1..N-1; week 0 = opening
  const hold = TUNING.THEATRICAL_HOLD_BASE + TUNING.THEATRICAL_HOLD_LEGS_COEF * (legs - TUNING.LEGS_MIN)
  const floor = TUNING.THEATRICAL_TAIL_FLOOR * gross
  // Geometric decay across the tail weeks, floored (shape influence), then renormalized to
  // conserve `tailTotal` exactly. Week 0 stays exactly `opening`.
  let tail: number[] = []
  for (let w = 1; w < N; w++) tail.push(Math.pow(hold, w - 1))
  const rawSum = tail.reduce((a, b) => a + b, 0)
  tail = tail.map((r) => Math.max((r / rawSum) * tailTotal, floor))
  const flooredSum = tail.reduce((a, b) => a + b, 0)
  tail = tail.map((g) => (g / flooredSum) * tailTotal)
  return [opening, ...tail]
}

// ── TheatricalRun builders ────────────────────────────────────────────────────
// Open a NEW D-12 run at release from the locked opening + legs. status 'active',
// weekIndex 0 — its first week is paid by tick step 3.5 in the same overall tick.
export function openTheatricalRun(
  film: FilmResult,
  opening: number,
  legs: number,
  releaseTick: number,
): TheatricalRun {
  const weeklyGross = theatricalSchedule(opening, legs)
  return {
    productionId: film.productionId,
    conceptId: film.conceptId,
    releaseTick,
    totalWeeks: weeklyGross.length,
    weekIndex: 0,
    weeklyGross,
    studioShare: TUNING.STUDIO_RENTAL_BLENDED,
    cumulativeGrossPaid: 0,
    cumulativeStudioRevenuePaid: 0,
    economyModelVersion: TUNING.ECONOMY_MODEL_VERSION,
    status: 'active',
  }
}

// A migrated V3 release: a legacyCompleted placeholder. It already received the FULL
// gross once under V3, so it is recorded (never repaid) at studioShare 1.0 / model 0.
export function legacyTheatricalRun(film: FilmResult): TheatricalRun {
  const gross = film.boxOffice.total
  return {
    productionId: film.productionId,
    conceptId: film.conceptId,
    releaseTick: film.releaseTick,
    totalWeeks: 1,
    weekIndex: 1, // finished
    weeklyGross: [gross],
    studioShare: 1.0, // legacy full-gross model
    cumulativeGrossPaid: gross,
    cumulativeStudioRevenuePaid: gross, // the amount ACTUALLY credited under V3 (full gross)
    economyModelVersion: 0,
    status: 'legacyCompleted',
  }
}
