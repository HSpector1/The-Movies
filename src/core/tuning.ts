// ── §16 TUNING + rev. 4 additions ────────────────────────────────────────────
// One exported TUNING object: every §16 entry at its contract value, PLUS the
// rev. 4 "New TUNING entries" (docs/rev4-open-questions.md §4) and the two
// constants moved in per B17 (FORECAST_SIGMA, CONFIDENCE_INTERVAL_WIDTH) at their
// B17-revised values, and SEGMENT_TASTES per D-5.
//
// Other contract-declared constants (CAST_WEIGHT, ROLE_WEIGHT, SLOT_TRANSFORM,
// FORCE_VECTORS, INITIAL_STANDING, WORLD_CONFIG, the §13 grids) live as their own
// named exports below — the contract declares them outside §16.

import type { CastSlot, CulturalForce, Expression, SegmentId, Standing } from './types.js'

export const TUNING = {
  // §16 verbatim
  COHESION_CAP: 16,
  COHESION_SMOOTH_LO: 0.35,
  COHESION_SMOOTH_HI: 0.85,
  EXPECTED_EXPRESSION: 0.55,
  EXPRESSION_FLOOR: 0.65,
  CENTROID_MIN_MAGNITUDE: 0.15,
  CRITIC_SIGMA_BASE: 4,
  ORIGINALITY_MAX_BONUS: 12,
  DERIVATIVENESS_MAX_PENALTY: 4,
  PROMISE_MAX_BONUS: 12,
  PROMISE_PENALTY_MAX: 18,
  MARKETING_HALF_SATURATION: 400_000,
  APPEAL_CURVE_EXP: 1.8,
  LEGS_MIN: 1.8,
  LEGS_MAX: 4.0,
  AUTHORED_START_SKILL: 35,
  AUTHORED_START_FAME: 5,
  BROADCAST_THRESHOLD: 0.45,
  BROADCAST_COOLDOWN_K: 0.7,
  BROADCAST_WINDOW: 6,

  // rev. 4 §4 new TUNING entries
  TICKS_PER_YEAR: 52,
  PRODUCTION_TICKS: 8,
  MAX_CONCURRENT_PRODUCTIONS: 2,
  INITIAL_CASH: 20_000_000,
  SALARY_BASE: 25_000,
  SALARY_SKILL_COEF: 150_000,
  SALARY_FAME_COEF: 600_000,
  ROI_COST_FLOOR: 500_000,

  // moved into TUNING per B17, at B17-revised values
  FORECAST_SIGMA: { high: 5, medium: 10, low: 16 },
  CONFIDENCE_INTERVAL_WIDTH: { high: 7, medium: 11, low: 14 },

  // per D-5 — twelve numbers the tuning loop may adjust (intimacy, tonalWeight, kineticEnergy)
  SEGMENT_TASTES: {
    youngAdult: { intimacy: -0.45, tonalWeight: -0.3, kineticEnergy: 0.75 },
    family: { intimacy: 0.55, tonalWeight: -0.55, kineticEnergy: 0.2 },
    adult: { intimacy: -0.2, tonalWeight: 0.45, kineticEnergy: -0.15 },
    prestige: { intimacy: 0.4, tonalWeight: 0.7, kineticEnergy: -0.4 },
  } as Record<SegmentId, Expression>,
} as const

// ── §5.1 cast weighting ──────────────────────────────────────────────────────
export const CAST_WEIGHT: Record<CastSlot, number> = { lead: 1.0, antagonist: 0.6, support: 0.35 }

// ── §5.2 expressive contribution weighting ───────────────────────────────────
// Axis-specific, NOT whole-vector negation. Antagonistic contrast reverses
// relational warmth; it does not reverse tone or kinetics.
export const SLOT_TRANSFORM: Record<CastSlot, Expression> = {
  lead: { intimacy: 1, tonalWeight: 1, kineticEnergy: 1 },
  antagonist: { intimacy: -1, tonalWeight: 1, kineticEnergy: 1 },
  support: { intimacy: 1, tonalWeight: 1, kineticEnergy: 1 },
}

// Contributor set for the centroid: writer, director, cast slots, shape.
export const ROLE_WEIGHT = {
  writer: 1.0,
  director: 1.6,
  lead: 1.4,
  antagonist: 0.8,
  support: 0.5,
  shape: 1.2,
} as const

// ── §5.3 cultural-force tuning vectors ───────────────────────────────────────
export const FORCE_VECTORS: Record<CulturalForce, Expression> = {
  escapism: { intimacy: 0.2, tonalWeight: -0.6, kineticEnergy: 0.4 },
  patriotism: { intimacy: 0.1, tonalWeight: 0.5, kineticEnergy: 0.4 },
  realism: { intimacy: 0.5, tonalWeight: 0.4, kineticEnergy: -0.4 },
  darkness: { intimacy: -0.3, tonalWeight: 0.8, kineticEnergy: 0.0 },
  optimism: { intimacy: 0.6, tonalWeight: -0.4, kineticEnergy: 0.1 },
  spectacle: { intimacy: -0.4, tonalWeight: 0.1, kineticEnergy: 0.9 },
}

// ── §6 standing ──────────────────────────────────────────────────────────────
export const INITIAL_STANDING: Standing = {
  audienceAwareness: 40,
  industryPrestige: 40,
  commercialConfidence: 50,
}

// ── §9 world generation config ───────────────────────────────────────────────
export const WORLD_CONFIG = {
  talentCount: 60,
  conceptCount: 30,
  marketValueRange: [20_000_000, 80_000_000] as [number, number],
} as const
