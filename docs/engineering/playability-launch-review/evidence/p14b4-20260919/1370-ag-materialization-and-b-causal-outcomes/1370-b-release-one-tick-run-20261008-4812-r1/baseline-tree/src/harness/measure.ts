// ── M0A §14 measurement primitives ───────────────────────────────────────────
// Pure helpers shared by the run driver and the corpus aggregator. NO filesystem
// I/O here (that lives in run-corpus.ts); this module is deterministic arithmetic
// only. It sits under src/ so the hygiene grep scans it; it uses no unseeded
// entropy at all (the seeded-RNG rule).
//
// Everything here is a literal transcription of a rev. 4 operational definition —
// the clause each function serves is named in its doc comment. No thresholds are
// softened; the flag gates live in aggregate.ts, computed from these statistics.

import type { SegmentId } from '../core/index.js'
import { bandOf } from '../core/index.js'
import type { ForecastBand } from '../core/index.js'

// The four segments in the fixed worldgen order (used for stable iteration only).
export const SEGMENT_ORDER: readonly SegmentId[] = [
  'youngAdult',
  'family',
  'adult',
  'prestige',
] as const

// ── Sign of a scalar → {−, 0, +} as -1 | 0 | 1 (B25/B26 promise-axis signs) ────
// Exact zero maps to 0; the contract's "sign-vector of promise-axis-range
// midpoints" treats a midpoint sitting exactly on 0 as its own class.
export function signOf(x: number): -1 | 0 | 1 {
  if (x > 0) return 1
  if (x < 0) return -1
  return 0
}

// Midpoint of a [min,max] range (B25/B26 read the sign of the axis range midpoint).
export function rangeMidpoint(r: readonly [number, number]): number {
  return (r[0] + r[1]) / 2
}

// The three-axis promise sign vector (B26 "promise axis signs"; also the sign
// component of the B25 strategy signature). Order: intimacy, tonalWeight,
// kineticEnergy — the fixed contract axis order.
export type PromiseSignVector = readonly [(-1 | 0 | 1), (-1 | 0 | 1), (-1 | 0 | 1)]

export function promiseSignVector(ranges: {
  intimacy: readonly [number, number]
  tonalWeight: readonly [number, number]
  kineticEnergy: readonly [number, number]
}): PromiseSignVector {
  return [
    signOf(rangeMidpoint(ranges.intimacy)),
    signOf(rangeMidpoint(ranges.tonalWeight)),
    signOf(rangeMidpoint(ranges.kineticEnergy)),
  ]
}

// ── B25 strategy signature ────────────────────────────────────────────────────
// "An option = the strategy signature (shape triple, negativeLevel, marketingLevel,
// sign-vector of promise-axis-range midpoints)." Serialized to a stable string key
// so signatures can be counted in a Map.
export function strategySignature(pkg: {
  shape: { opening: string; midpoint: string; ending: string }
  negativeLevel: number
  marketingLevel: number
  promise: {
    ranges: {
      intimacy: readonly [number, number]
      tonalWeight: readonly [number, number]
      kineticEnergy: readonly [number, number]
    }
  }
}): string {
  const sv = promiseSignVector(pkg.promise.ranges)
  return [
    pkg.shape.opening,
    pkg.shape.midpoint,
    pkg.shape.ending,
    `n${pkg.negativeLevel}`,
    `m${pkg.marketingLevel}`,
    `s${sv[0]},${sv[1]},${sv[2]}`,
  ].join('|')
}

// ── B26 concentration tuple ───────────────────────────────────────────────────
// "(promise axis signs; budget level = the (negativeLevel, marketingLevel) pair;
// top-forecast cast = the exact cast triple of the highest-expectedTotal package)."
// Serialized to a stable string key.
export function concentrationTuple(input: {
  promiseSignVector: PromiseSignVector
  negativeLevel: number
  marketingLevel: number
  topForecastCast: { lead: string; antagonist: string; support: string }
}): string {
  const sv = input.promiseSignVector
  const c = input.topForecastCast
  return [
    `s${sv[0]},${sv[1]},${sv[2]}`,
    `n${input.negativeLevel},m${input.marketingLevel}`,
    `cast:${c.lead},${c.antagonist},${c.support}`,
  ].join('|')
}

// ── D-1 ROI ───────────────────────────────────────────────────────────────────
// ROI = profit / (negative + marketing + salaries), in DECIMAL fraction (0.15 =
// 15 ROI points). The B25 margin is reported in PERCENTAGE POINTS, so callers
// multiply the ROI difference by 100. cost = negative + marketing + salaries.
export function roiOf(profit: number, cost: number): number {
  // Guard against divide-by-zero; the ROI_COST_FLOOR exclusion (below) removes
  // sub-floor packages from ROI statistics before this is ever called on them,
  // but keep the guard so no NaN can leak into an aggregate.
  if (cost <= 0) return 0
  return profit / cost
}

// ── Pearson correlation (M6) ──────────────────────────────────────────────────
// Streaming-friendly accumulator for the pairwise Pearson r over paired samples
// (Δaware, Δprestige, Δconf). Accumulates sums so the corpus need not hold every
// delta triple in one array. Returns r for a given pair, or null if undefined
// (zero variance in either channel, or fewer than 2 samples).
export class PearsonAccumulator {
  private n = 0
  private sx = 0
  private sy = 0
  private sxx = 0
  private syy = 0
  private sxy = 0

  add(x: number, y: number): void {
    this.n += 1
    this.sx += x
    this.sy += y
    this.sxx += x * x
    this.syy += y * y
    this.sxy += x * y
  }

  get count(): number {
    return this.n
  }

  // Pearson r. null when undefined (n<2 or a channel has zero variance).
  correlation(): number | null {
    const n = this.n
    if (n < 2) return null
    const covN = n * this.sxy - this.sx * this.sy
    const varX = n * this.sxx - this.sx * this.sx
    const varY = n * this.syy - this.sy * this.sy
    if (varX <= 0 || varY <= 0) return null
    return covN / Math.sqrt(varX * varY)
  }
}

// ── §15.1 bounds tracking ─────────────────────────────────────────────────────
// A bounded term with a declared [min,max] range (M11 scope). Tracks the observed
// corpus min/max and flags any excursion beyond an epsilon tolerance (floating
// point can nudge a clamp's endpoint by ~1e-9). The tolerance is applied only to
// the RANGE test, never to the reported observed extremes.
export const BOUNDS_EPSILON = 1e-6

export type BoundSpec = { name: string; min: number; max: number }

export class BoundTracker {
  readonly spec: BoundSpec
  observedMin = Number.POSITIVE_INFINITY
  observedMax = Number.NEGATIVE_INFINITY
  count = 0
  // Reproduction: the first seed+agent that produced an out-of-range value.
  firstViolationSeed: string | null = null
  firstViolationAgent: string | null = null
  firstViolationValue: number | null = null

  constructor(spec: BoundSpec) {
    this.spec = spec
  }

  observe(value: number, seed: string, agent: string): void {
    this.count += 1
    if (value < this.observedMin) this.observedMin = value
    if (value > this.observedMax) this.observedMax = value
    const out = value < this.spec.min - BOUNDS_EPSILON || value > this.spec.max + BOUNDS_EPSILON
    if (out && this.firstViolationSeed === null) {
      this.firstViolationSeed = seed
      this.firstViolationAgent = agent
      this.firstViolationValue = value
    }
  }

  get inRange(): boolean {
    return this.firstViolationSeed === null
  }
}

// ── §15.2 four-quadrant cell ──────────────────────────────────────────────────
// (craft ≷ 55) × (cohesion ≷ 0.55). The four cell keys; a film lands in exactly
// one. "high" = strictly greater than the split; the split value itself lands in
// the "low" cell (a fixed, deterministic convention — the corpus check only needs
// all four non-empty, and the split is a measure-zero event on real values).
export type QuadrantCell = 'lowCraft_lowCohesion' | 'lowCraft_highCohesion' | 'highCraft_lowCohesion' | 'highCraft_highCohesion'

export const CRAFT_SPLIT = 55
export const COHESION_SPLIT = 0.55

export function quadrantOf(craft: number, cohesion: number): QuadrantCell {
  const highCraft = craft > CRAFT_SPLIT
  const highCoh = cohesion > COHESION_SPLIT
  if (highCraft && highCoh) return 'highCraft_highCohesion'
  if (highCraft && !highCoh) return 'highCraft_lowCohesion'
  if (!highCraft && highCoh) return 'lowCraft_highCohesion'
  return 'lowCraft_lowCohesion'
}

// ── D-2 asymmetric standing profiles ──────────────────────────────────────────
// End-of-run standing. high = ≥60, low = ≤40 (absolute). The FOUR profiles named
// in §14 / D-2, each a (high, low) channel pair. A profile "occurs" for a run if
// its pair holds at end of run. Multiple profiles may occur for one run.
export type StandingTriple = {
  audienceAwareness: number
  industryPrestige: number
  commercialConfidence: number
}

const HIGH = 60
const LOW = 40

function isHigh(v: number): boolean {
  return v >= HIGH
}
function isLow(v: number): boolean {
  return v <= LOW
}

// The four profiles, in the §14 declared order. Keys are stable identifiers used
// in the summary.
export const STANDING_PROFILES = [
  'prestigeHigh_awarenessLow',
  'awarenessHigh_prestigeLow',
  'confidenceHigh_prestigeLow',
  'confidenceLow_awarenessHigh',
] as const
export type StandingProfileKey = (typeof STANDING_PROFILES)[number]

// Which of the four profiles occur for a given end-of-run standing.
export function profilesOccurring(s: StandingTriple): Set<StandingProfileKey> {
  const out = new Set<StandingProfileKey>()
  // §14 / D-2 verbatim: (prestige high & awareness low), (awareness high &
  // prestige low), (confidence high & prestige low), (confidence low & awareness
  // high).
  if (isHigh(s.industryPrestige) && isLow(s.audienceAwareness)) out.add('prestigeHigh_awarenessLow')
  if (isHigh(s.audienceAwareness) && isLow(s.industryPrestige)) out.add('awarenessHigh_prestigeLow')
  if (isHigh(s.commercialConfidence) && isLow(s.industryPrestige)) out.add('confidenceHigh_prestigeLow')
  if (isLow(s.commercialConfidence) && isHigh(s.audienceAwareness)) out.add('confidenceLow_awarenessHigh')
  return out
}

// ── M8 forecast band helper ───────────────────────────────────────────────────
// Reuse the core's §7 band thresholds (<40 weak | 40–70 mixed | >70 strong) via
// the public bandOf export, so the harness never re-implements a core threshold.
export function forecastBandOf(score: number): ForecastBand {
  return bandOf(score)
}
