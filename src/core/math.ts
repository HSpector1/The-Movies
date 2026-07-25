// ── Numeric primitives the contract references by name ───────────────────────
// The contract's formulas call clamp/mean/lerp/etc. by name. Phase 1 built the
// clamp/mean subset (§4 specificity). Phase 2 (§5–§7) adds the rest of the named
// primitive set: lerp, smoothstep, remap, weightedMean (over Expressions), sum,
// product. All are pure and stateless; no I/O, no randomness.

import type { Expression } from './types.js'

// clamp a value into [lo, hi].
export function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v
}

// arithmetic mean; empty input is undefined behaviour in the contract's usages
// (every caller passes a fixed non-empty list), so it is not guarded here.
export function mean(xs: number[]): number {
  let s = 0
  for (const x of xs) s += x
  return s / xs.length
}

// Linear interpolation. lerp(a, b, 0) = a, lerp(a, b, 1) = b. t is NOT clamped —
// the contract's callers (§5.2 cohesion, §5.3 originalityContribution) pass t
// already in [0,1], so unclamped is the faithful reading.
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

// Hermite smoothstep. Returns 0 for x ≤ lo, 1 for x ≥ hi, and the smooth
// 3t²−2t³ Hermite interpolation between. Used by §5.3 cohesionContribution.
export function smoothstep(lo: number, hi: number, x: number): number {
  if (hi <= lo) return x < lo ? 0 : 1
  const t = clamp((x - lo) / (hi - lo), 0, 1)
  return t * t * (3 - 2 * t)
}

// Linear remap of v from [inLo, inHi] onto [outLo, outHi]. Used by §5.3
// originalityContribution / derivativeness penalty. Not clamped — callers pass
// max(0, …) pre-clamped inputs so v stays inside [inLo, inHi].
export function remap(
  v: number,
  inLo: number,
  inHi: number,
  outLo: number,
  outHi: number,
): number {
  if (inHi === inLo) return outLo
  return outLo + ((v - inLo) * (outHi - outLo)) / (inHi - inLo)
}

// Component-wise weighted mean over Expressions. Each entry is [vector, weight];
// axes are averaged independently with weights normalized by their sum. Used by
// §4 resolveShape's expression aggregation (weights 0.30/0.35/0.35).
export function weightedMean(entries: Array<[Expression, number]>): Expression {
  let wi = 0
  let wt = 0
  let wk = 0
  let wsum = 0
  for (const [e, w] of entries) {
    wi += e.intimacy * w
    wt += e.tonalWeight * w
    wk += e.kineticEnergy * w
    wsum += w
  }
  return { intimacy: wi / wsum, tonalWeight: wt / wsum, kineticEnergy: wk / wsum }
}

// Sum of a list. Empty list = 0 (additive identity).
export function sum(xs: number[]): number {
  let s = 0
  for (const x of xs) s += x
  return s
}

// Product of a list. Empty list = 1 (multiplicative identity).
export function product(xs: number[]): number {
  let p = 1
  for (const x of xs) p *= x
  return p
}
