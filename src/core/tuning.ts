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

  // ── §6 standing, owner ruling D-6 (2026-07-26) ─────────────────────────────
  // Named constants for the three-channel update. Every value is normalized against
  // the STEP-1 per-release corpus distributions (200 seeds × 2 agents, 4000
  // releases; evidence in out/d6/step1-releases.jsonl). No magic number is inlined
  // in standing.ts; these are the only knobs.
  //
  // Awareness (reach primary, star secondary). reach = boxOffice.total /
  // baseMarketValue; SCALE = the reach that reads as "fully visible" (≈ pooled p90
  // reach 0.90). NEUTRAL = the normalized-reach pivot (0.58 ⇒ a film at ~0.58 of the
  // "fully visible" reach contributes ~0 from the reach term); below it the reach
  // term is negative so a low-reach studio stays low-awareness. WEIGHTs set so a
  // high-reach slate (Oracle, reach_norm ≈ 0.9) climbs each release (→ ≥60 over ten)
  // while a low-reach slate (Random, reach_norm ≈ 0.47) hovers near its start.
  AWARENESS_REACH_SCALE: 0.9, // reach value read as "fully visible" (pooled p90)
  AWARENESS_REACH_NEUTRAL: 0.58, // normalized-reach pivot (0..1); below → negative reach term
  AWARENESS_REACH_WEIGHT: 7, // primary reach coefficient (delta points per unit)
  AWARENESS_STAR_WEIGHT: 1.2, // secondary star-attention coefficient (delta points per unit)
  AWARENESS_DELTA_CAP: 6, // per-release |ΔaudienceAwareness| cap

  // Prestige (absolute critic achievement). BENCHMARK sits near the pooled
  // criticScore median (46.5) so it is REACHABLE from both sides — the prior fixed
  // 60 was above ~p90, so prestige could only fall. SCALE 1.2 makes a criticScore
  // ~2.4 above the benchmark give ~+2/release; a critic gap ≥12 saturates the ±10 cap.
  PRESTIGE_CRITIC_BENCHMARK: 45, // reachable neutral benchmark (≈ criticScore median)
  PRESTIGE_CRITIC_SCALE: 1.2, // criticScore points per one prestige delta point
  PRESTIGE_DELTA_CAP: 10, // per-release |ΔindustryPrestige| cap

  // Confidence (ROI primary, budget discipline penalty). ROI = profit /
  // max(cost, floor); ROI_SCALE = the ROI at which roiSignal saturates to 1
  // (≈ Oracle median ROI 5). DISCIPLINE_WEIGHT prices the over-funding fraction
  // (overrun ∈ {0, 0.25} in the corpus). COST_FLOOR guards the ROI denominator
  // (min observed committed cost ≈ 2.5M, so the 500k floor is a pure guard, matching
  // D-1's ROI_COST_FLOOR rationale). No absolute-reach term; no reuse of the
  // awareness surprise signal.
  CONFIDENCE_ROI_SCALE: 5, // ROI at which roiSignal saturates to ±1
  CONFIDENCE_ROI_WEIGHT: 4, // primary ROI coefficient (delta points per unit roiSignal)
  CONFIDENCE_DISCIPLINE_WEIGHT: 4, // over-funding penalty coefficient (delta points per unit overrun)
  CONFIDENCE_COST_FLOOR: 500_000, // ROI-denominator floor (currency); pure guard
  CONFIDENCE_DELTA_CAP: 5, // per-release |ΔcommercialConfidence| cap

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
