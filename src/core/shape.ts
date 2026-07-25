// ── §4 Shape aggregation ─────────────────────────────────────────────────────
// The SHAPE_OPTIONS seed table (§4) and specificity() (given verbatim in §4),
// plus resolveShape() (phase 2) implemented verbatim per §4 with the aggregate
// clamps the section requires (three stacked options otherwise exceed every
// individual bound).

import { clamp, mean, product, sum, weightedMean } from './math.js'
import type {
  FilmShape,
  Promise as FilmPromise,
  SegmentId,
  ShapeEffects,
  ShapeOption,
} from './types.js'

// Seed table from §4 (`expression` as i, t, k). Keyed by every FilmShape slot value.
export const SHAPE_OPTIONS: Record<
  FilmShape['opening'] | FilmShape['midpoint'] | FilmShape['ending'],
  ShapeOption
> = {
  immediateAction: {
    expression: { intimacy: -0.3, tonalWeight: 0.0, kineticEnergy: 0.8 },
    openingReachMod: 12,
    craftMod: -4,
    budgetDemandMod: 1.2,
    originalityMod: -5,
    segmentAffinity: { youngAdult: 8, prestige: -6 },
  },
  slowSetup: {
    expression: { intimacy: 0.7, tonalWeight: 0.3, kineticEnergy: -0.6 },
    openingReachMod: -10,
    craftMod: 7,
    budgetDemandMod: 0.9,
    originalityMod: 3,
    segmentAffinity: { prestige: 9, youngAdult: -8 },
  },
  mysteryHook: {
    expression: { intimacy: -0.2, tonalWeight: 0.5, kineticEnergy: -0.1 },
    openingReachMod: 4,
    craftMod: 2,
    budgetDemandMod: 1.0,
    originalityMod: 6,
    segmentAffinity: { adult: 7, family: -5 },
  },
  reversal: {
    expression: { intimacy: 0.0, tonalWeight: 0.3, kineticEnergy: 0.2 },
    openingReachMod: 2,
    craftMod: 3,
    budgetDemandMod: 1.05,
    originalityMod: 5,
    segmentAffinity: { adult: 4 },
  },
  escalation: {
    expression: { intimacy: -0.1, tonalWeight: 0.0, kineticEnergy: 0.7 },
    openingReachMod: 8,
    craftMod: -2,
    budgetDemandMod: 1.15,
    originalityMod: -6,
    segmentAffinity: { youngAdult: 7, prestige: -4 },
  },
  revelation: {
    expression: { intimacy: 0.3, tonalWeight: 0.5, kineticEnergy: -0.3 },
    openingReachMod: -4,
    craftMod: 6,
    budgetDemandMod: 0.95,
    originalityMod: 7,
    segmentAffinity: { prestige: 6, family: -4 },
  },
  triumph: {
    expression: { intimacy: 0.6, tonalWeight: -0.3, kineticEnergy: 0.3 },
    openingReachMod: 10,
    craftMod: -5,
    budgetDemandMod: 1.0,
    originalityMod: -8,
    segmentAffinity: { family: 10, prestige: -8 },
  },
  bittersweet: {
    expression: { intimacy: 0.5, tonalWeight: 0.5, kineticEnergy: -0.2 },
    openingReachMod: -3,
    craftMod: 5,
    budgetDemandMod: 1.0,
    originalityMod: 4,
    segmentAffinity: { adult: 6 },
  },
  tragic: {
    expression: { intimacy: -0.1, tonalWeight: 0.9, kineticEnergy: -0.1 },
    openingReachMod: -8,
    craftMod: 8,
    budgetDemandMod: 1.0,
    originalityMod: 6,
    segmentAffinity: { prestige: 10, family: -10 },
  },
  ambiguous: {
    expression: { intimacy: -0.3, tonalWeight: 0.6, kineticEnergy: -0.4 },
    openingReachMod: -10,
    craftMod: 4,
    budgetDemandMod: 0.95,
    originalityMod: 10,
    segmentAffinity: { prestige: 7, youngAdult: -6, family: -8 },
  },
}

// §4 verbatim. Mean per-axis narrowness. NOT volume.
export function specificity(p: FilmPromise): number {
  const widths = [
    p.ranges.intimacy[1] - p.ranges.intimacy[0],
    p.ranges.tonalWeight[1] - p.ranges.tonalWeight[0],
    p.ranges.kineticEnergy[1] - p.ranges.kineticEnergy[0],
  ]
  return mean(widths.map((w) => 1 - clamp(w / 2, 0, 1)))
}

const ALL_SEGMENTS: SegmentId[] = ['youngAdult', 'family', 'adult', 'prestige']

// §4 helper: sum each segment's affinity across the three chosen options, filling
// absent affinities with 0 so every segment key is present.
function sumBySegment(options: ShapeOption[]): Record<SegmentId, number> {
  const out: Record<SegmentId, number> = {
    youngAdult: 0,
    family: 0,
    adult: 0,
    prestige: 0,
  }
  for (const o of options) {
    for (const seg of ALL_SEGMENTS) {
      out[seg] += o.segmentAffinity[seg] ?? 0
    }
  }
  return out
}

// §4 helper: clamp each segment's summed affinity into [lo, hi] across all four.
function clampEachSegment(
  affinity: Record<SegmentId, number>,
  lo: number,
  hi: number,
): Record<SegmentId, number> {
  return {
    youngAdult: clamp(affinity.youngAdult, lo, hi),
    family: clamp(affinity.family, lo, hi),
    adult: clamp(affinity.adult, lo, hi),
    prestige: clamp(affinity.prestige, lo, hi),
  }
}

// §4 verbatim. Aggregate three stacked options, each aggregate clamped to its
// stated bound (the section's own requirement: unclamped stacks exceed every
// individual bound).
export function resolveShape(shape: FilmShape): ShapeEffects {
  const o = [
    SHAPE_OPTIONS[shape.opening],
    SHAPE_OPTIONS[shape.midpoint],
    SHAPE_OPTIONS[shape.ending],
  ]
  return {
    expression: weightedMean([
      [o[0]!.expression, 0.3],
      [o[1]!.expression, 0.35],
      [o[2]!.expression, 0.35],
    ]),
    openingReachMod: clamp(
      o[0]!.openingReachMod + 0.5 * o[1]!.openingReachMod + 0.25 * o[2]!.openingReachMod,
      -15,
      15,
    ),
    craftMod: clamp(
      sum(o.map((x) => x.craftMod)),
      -10,
      10,
    ),
    budgetDemandMultiplier: clamp(
      product(o.map((x) => x.budgetDemandMod)),
      0.8,
      1.4,
    ),
    originalityMod: clamp(
      sum(o.map((x) => x.originalityMod)),
      -15,
      15,
    ),
    segmentAffinity: clampEachSegment(sumBySegment(o), -12, 12),
  }
}
