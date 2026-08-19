// Phase-1 test: TUNING completeness and contract-declared named constants.
//
// Every expected value here is derived from docs/build-contract.md §16 + §5.1 +
// §5.2 + §6, and docs/rev4-open-questions.md §4 (new TUNING entries) + D-5
// (SEGMENT_TASTES table). No value is copied from implementation.
//
// CLAUDE.md convention: "assert every §16 key at its exact contract value."

import { describe, it, expect } from 'vitest'
import {
  TUNING,
  CAST_WEIGHT,
  SLOT_TRANSFORM,
  INITIAL_STANDING,
} from '../src/core/index.js'

describe('§16 TUNING — original keys at their exact contract values', () => {
  // Source: build-contract.md §16.
  const expected: Record<string, number> = {
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
  }

  for (const [key, value] of Object.entries(expected)) {
    it(`${key} === ${value}`, () => {
      expect((TUNING as Record<string, unknown>)[key]).toBe(value)
    })
  }
})

describe('rev. 4 §4 — new TUNING entries at their exact contract values', () => {
  // Source: rev4-open-questions.md §4.
  const expectedScalars: Record<string, number> = {
    TICKS_PER_YEAR: 52,
    PRODUCTION_TICKS: 8,
    // MAX_CONCURRENT_PRODUCTIONS is RETIRED here and proved ABSENT below —
    // C2a-M4 / charter §11.8 item 8, owner law 1 (`00E`.3: capacity and
    // reservations limit throughput; a global movie counter does not).
    // `rev4-open-questions.md:297/:663`, the source this table cites, is ruled
    // annotated-historical by the same item.
    AGENT_MAX_SLATE: 2,
    INITIAL_CASH: 20_000_000,
    SALARY_BASE: 25_000,
    SALARY_SKILL_COEF: 150_000,
    SALARY_FAME_COEF: 600_000,
    ROI_COST_FLOOR: 500_000,
  }

  for (const [key, value] of Object.entries(expectedScalars)) {
    it(`${key} === ${value}`, () => {
      expect((TUNING as Record<string, unknown>)[key]).toBe(value)
    })
  }

  // THE NAMED SUCCESSOR (§11.8 item 8): the deleted constant is not merely
  // unasserted, it is asserted GONE — a cap re-added by hand would fail here —
  // and the one policy constant that inherited its number is asserted present.
  it('MAX_CONCURRENT_PRODUCTIONS is ABSENT from TUNING (owner law 1 — deleted, never raised)', () => {
    expect(Object.prototype.hasOwnProperty.call(TUNING, 'MAX_CONCURRENT_PRODUCTIONS')).toBe(false)
    expect((TUNING as Record<string, unknown>).MAX_CONCURRENT_PRODUCTIONS).toBeUndefined()
  })

  it('FORECAST_SIGMA === { high: 5, medium: 10, low: 16 }', () => {
    // Source: B17 / §4 — kept sigma, changed widths.
    expect((TUNING as Record<string, unknown>).FORECAST_SIGMA).toEqual({
      high: 5,
      medium: 10,
      low: 16,
    })
  })

  it('CONFIDENCE_INTERVAL_WIDTH === { high: 7, medium: 11, low: 14 }', () => {
    // Source: B17 — widths changed to make bands reachable.
    expect((TUNING as Record<string, unknown>).CONFIDENCE_INTERVAL_WIDTH).toEqual({
      high: 7,
      medium: 11,
      low: 14,
    })
  })

  it('SEGMENT_TASTES === D-5 table exactly (12 numbers)', () => {
    // Source: rev4-open-questions.md D-5 starting values, (intimacy, tonalWeight, kineticEnergy).
    expect((TUNING as Record<string, unknown>).SEGMENT_TASTES).toEqual({
      youngAdult: { intimacy: -0.45, tonalWeight: -0.30, kineticEnergy: 0.75 },
      family: { intimacy: 0.55, tonalWeight: -0.55, kineticEnergy: 0.20 },
      adult: { intimacy: -0.20, tonalWeight: 0.45, kineticEnergy: -0.15 },
      prestige: { intimacy: 0.40, tonalWeight: 0.70, kineticEnergy: -0.40 },
    })
  })
})

describe('§6 INITIAL_STANDING', () => {
  it('=== { audienceAwareness: 40, industryPrestige: 40, commercialConfidence: 50 }', () => {
    // Source: build-contract.md §6.
    expect(INITIAL_STANDING).toEqual({
      audienceAwareness: 40,
      industryPrestige: 40,
      commercialConfidence: 50,
    })
  })
})

describe('§5.1 CAST_WEIGHT', () => {
  it('=== { lead: 1.0, antagonist: 0.6, support: 0.35 }', () => {
    // Source: build-contract.md §5.1.
    expect(CAST_WEIGHT).toEqual({ lead: 1.0, antagonist: 0.6, support: 0.35 })
  })
})

describe('§5.2 SLOT_TRANSFORM', () => {
  it('antagonist === { intimacy: -1, tonalWeight: 1, kineticEnergy: 1 }', () => {
    // Source: build-contract.md §5.2 — axis-specific negation of intimacy only.
    expect(SLOT_TRANSFORM.antagonist).toEqual({
      intimacy: -1,
      tonalWeight: 1,
      kineticEnergy: 1,
    })
  })

  it('lead and support are the identity transform (all axes +1)', () => {
    // Source: build-contract.md §5.2 table.
    expect(SLOT_TRANSFORM.lead).toEqual({ intimacy: 1, tonalWeight: 1, kineticEnergy: 1 })
    expect(SLOT_TRANSFORM.support).toEqual({ intimacy: 1, tonalWeight: 1, kineticEnergy: 1 })
  })
})
