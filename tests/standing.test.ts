// ── §6 Standing — INDEPENDENT contract-derived unit tests ────────────────────
//
// Every expected value here is hand-derived from build-contract.md rev. 4 §6 and
// the NORMATIVE resolutions (docs/rev4-open-questions.md, B12/M2). NOTHING is copied
// from src/core/standing.ts (its body is never read). We import ONLY the public
// surface (src/core/index.ts).
//
// §6 formulas under test (verbatim):
//   commercialSurprise = clamp((total - expectedTotal)/max(expectedTotal,1), -1, 1)
//   normalizedStarAttention = clamp(mean(cast fame)/100, 0, 1)
//   normalizedBudgetOverrun = clamp((actualNegative - requiredNegative)/max(requiredNegative,1), 0, 1)
//   awarenessDelta  = clamp(6*surprise + 2*normStarAttention, -8, 8)
//   prestigeDelta   = clamp((criticScore - 60)/8, -7, 7)
//   confidenceDelta = clamp(5*surprise - 2*normBudgetOverrun, -8, 8)
//   audienceAwareness    = clamp(prev + awarenessDelta,  0, 100)
//   industryPrestige     = clamp(prev + prestigeDelta,   0, 100)
//   commercialConfidence = clamp(prev + confidenceDelta, 0, 100)

import { describe, expect, it } from 'vitest'
import { updateStanding } from '../src/core/index.js'
import type {
  FilmResult,
  ReleaseBenchmarks,
  SegmentId,
  Standing,
  StandingContext,
} from '../src/core/index.js'

// ── minimal builders (values chosen by the test author; expectations derived) ──

// A FilmResult with only the §6-relevant fields varying. The other fields are
// declared-shape filler the standing update never reads (§6 reads box office total,
// criticScore, and — via ctx — cast fames + negatives). Values are inputs, not
// expectations.
function makeResult(over: {
  total?: number
  criticScore?: number
} = {}): FilmResult {
  const segScores = {
    youngAdult: 50,
    family: 50,
    adult: 50,
    prestige: 50,
  } as Record<SegmentId, number>
  return {
    productionId: 'p-1',
    releaseTick: 8,
    delivered: { intimacy: 0, tonalWeight: 0, kineticEnergy: 0 },
    cohesion: 0.5,
    craft: 50,
    criticMean: over.criticScore ?? 60,
    criticSigma: 4,
    criticScore: over.criticScore ?? 60,
    reviewVariance: 0,
    segmentScores: segScores,
    boxOffice: { opening: 0, total: over.total ?? 0 },
    conceptId: 'concept-1',
    directorId: 'd-1',
  }
}

function bench(expectedTotal: number): ReleaseBenchmarks {
  // expectedOpening / expectedCriticScore are dormant in updateStanding (§6 reads
  // expectedTotal only), so any finite values suffice for those two.
  return { expectedOpening: 1, expectedTotal, expectedCriticScore: 60 }
}

function ctxOf(over: {
  fames?: [number, number, number]
  actualNegative?: number
  requiredNegative?: number
} = {}): StandingContext {
  const f = over.fames ?? [0, 0, 0]
  return {
    castFames: { lead: f[0], antagonist: f[1], support: f[2] },
    actualNegative: over.actualNegative ?? 1_000_000,
    requiredNegative: over.requiredNegative ?? 1_000_000,
  }
}

// prev standing far from every clamp edge so a delta shows through cleanly.
const MID: Standing = { audienceAwareness: 50, industryPrestige: 50, commercialConfidence: 50 }

const EPS = 1e-9

describe('§6 commercialSurprise → the three deltas', () => {
  // surprise = clamp((total - expectedTotal)/max(expectedTotal,1), -1, 1)

  it('surprise = +1 (total >> expectedTotal): saturates the positive side', () => {
    // total=200, expectedTotal=100 → (100)/100 = 1.0 (already at the +1 cap edge; any
    // larger ratio still clamps to +1). Use fames=0 to isolate surprise in awareness,
    // overrun=0 to isolate surprise in confidence.
    const r = makeResult({ total: 200, criticScore: 60 })
    const out = updateStanding(MID, r, bench(100), ctxOf({ fames: [0, 0, 0] }))
    // awarenessDelta = 6*1 + 2*0 = 6 → 50+6 = 56
    expect(out.audienceAwareness).toBeCloseTo(56, 9)
    // confidenceDelta = 5*1 - 2*0 = 5 → 50+5 = 55
    expect(out.commercialConfidence).toBeCloseTo(55, 9)
    // prestige untouched by surprise; criticScore 60 → delta 0 → 50
    expect(out.industryPrestige).toBeCloseTo(50, 9)
  })

  it('surprise clamps at +1 even for a huge overshoot', () => {
    // total = 10x expected → raw ratio 9, clamp to +1. Same deltas as the exact-+1 case.
    const r = makeResult({ total: 1_000, criticScore: 60 })
    const out = updateStanding(MID, r, bench(100), ctxOf({ fames: [0, 0, 0] }))
    expect(out.audienceAwareness).toBeCloseTo(56, 9) // 6*1
    expect(out.commercialConfidence).toBeCloseTo(55, 9) // 5*1
  })

  it('surprise = -1 (total = 0): saturates the negative side', () => {
    // total=0, expectedTotal=100 → -100/100 = -1.
    const r = makeResult({ total: 0, criticScore: 60 })
    const out = updateStanding(MID, r, bench(100), ctxOf({ fames: [0, 0, 0] }))
    // awarenessDelta = 6*(-1) + 2*0 = -6 → 50-6 = 44
    expect(out.audienceAwareness).toBeCloseTo(44, 9)
    // confidenceDelta = 5*(-1) - 2*0 = -5 → 50-5 = 45
    expect(out.commercialConfidence).toBeCloseTo(45, 9)
    expect(out.industryPrestige).toBeCloseTo(50, 9)
  })

  it('surprise interior value (+0.30): deltas scale linearly', () => {
    // total=130, expectedTotal=100 → 30/100 = 0.30. fames=0, overrun=0.
    const r = makeResult({ total: 130, criticScore: 60 })
    const out = updateStanding(MID, r, bench(100), ctxOf({ fames: [0, 0, 0] }))
    // awarenessDelta = 6*0.30 + 0 = 1.8 → 51.8
    expect(out.audienceAwareness).toBeCloseTo(51.8, 9)
    // confidenceDelta = 5*0.30 - 0 = 1.5 → 51.5
    expect(out.commercialConfidence).toBeCloseTo(51.5, 9)
  })

  it('expectedTotal guarded by max(.,1): expectedTotal=0 → denominator 1', () => {
    // total=0.5, expectedTotal=0 → (0.5-0)/max(0,1)=0.5 surprise.
    const r = makeResult({ total: 0.5, criticScore: 60 })
    const out = updateStanding(MID, r, bench(0), ctxOf({ fames: [0, 0, 0] }))
    // awarenessDelta = 6*0.5 = 3 → 53
    expect(out.audienceAwareness).toBeCloseTo(53, 9)
  })
})

describe('§6 awarenessDelta = clamp(6*surprise + 2*normStarAttention, -8, 8)', () => {
  // normStarAttention = clamp(mean(3 cast fames)/100, 0, 1)

  it('hits the +8 clamp: surprise=+1, fames all 100 → 6+2 = 8', () => {
    // raw = 6*1 + 2*1 = 8 (exactly the cap edge).
    const r = makeResult({ total: 200, criticScore: 60 })
    const out = updateStanding(MID, r, bench(100), ctxOf({ fames: [100, 100, 100] }))
    expect(out.audienceAwareness).toBeCloseTo(58, 9) // 50 + 8
  })

  it('clamps at +8 when the raw sum would exceed it', () => {
    // surprise clamps to +1 (total=10x), fames=100 → raw would be 8 exactly; push
    // past by nothing available in the formula, so instead prove the cap binds by
    // construction: even the max attainable raw (6*1 + 2*1 = 8) equals the cap, never
    // exceeds it. A separate interior case below shows the sub-cap regime.
    const r = makeResult({ total: 5_000, criticScore: 60 })
    const out = updateStanding(MID, r, bench(100), ctxOf({ fames: [100, 100, 100] }))
    expect(out.audienceAwareness).toBeCloseTo(58, 9)
  })

  it('hits the -8 clamp: surprise=-1, fames=0 gives -6; need extra negative — so cap is -8 by formula, verify -6 floor of star term', () => {
    // With surprise=-1 and fames=0: raw = -6. The star term is >= 0 always, so the
    // most-negative attainable awarenessDelta is -6 (star attention cannot push it
    // below -6). Assert -6, and that it never dips under the -8 clamp bound.
    const r = makeResult({ total: 0, criticScore: 60 })
    const out = updateStanding(MID, r, bench(100), ctxOf({ fames: [0, 0, 0] }))
    expect(out.audienceAwareness).toBeCloseTo(44, 9) // 50 - 6
    expect(out.audienceAwareness).toBeGreaterThanOrEqual(50 - 8 - EPS)
  })

  it('normStarAttention clamps to 1 for fames >100-equivalent mean; mean of [100,100,100]=100 → 1.0', () => {
    // surprise=0 isolates the star term: awarenessDelta = 2*1 = 2.
    const r = makeResult({ total: 100, criticScore: 60 }) // total=expected → surprise 0
    const out = updateStanding(MID, r, bench(100), ctxOf({ fames: [100, 100, 100] }))
    expect(out.audienceAwareness).toBeCloseTo(52, 9) // 50 + 2*1
  })

  it('normStarAttention interior: mean fame 60 → 0.6; surprise 0 → delta 1.2', () => {
    // mean([90,60,30]) = 60 → norm 0.6 → 2*0.6 = 1.2.
    const r = makeResult({ total: 100, criticScore: 60 })
    const out = updateStanding(MID, r, bench(100), ctxOf({ fames: [90, 60, 30] }))
    expect(out.audienceAwareness).toBeCloseTo(51.2, 9)
  })

  it('channel clamp at 100: prev near 100, positive delta cannot exceed 100', () => {
    const near100: Standing = { audienceAwareness: 97, industryPrestige: 50, commercialConfidence: 50 }
    const r = makeResult({ total: 200, criticScore: 60 }) // surprise +1
    // awarenessDelta = 6 + 2 = 8 → 97+8 = 105 → clamp 100
    const out = updateStanding(near100, r, bench(100), ctxOf({ fames: [100, 100, 100] }))
    expect(out.audienceAwareness).toBe(100)
  })

  it('channel clamp at 0: prev near 0, negative delta cannot go below 0', () => {
    const near0: Standing = { audienceAwareness: 3, industryPrestige: 50, commercialConfidence: 50 }
    const r = makeResult({ total: 0, criticScore: 60 }) // surprise -1
    // awarenessDelta = -6 → 3-6 = -3 → clamp 0
    const out = updateStanding(near0, r, bench(100), ctxOf({ fames: [0, 0, 0] }))
    expect(out.audienceAwareness).toBe(0)
  })
})

describe('§6 prestigeDelta = clamp((criticScore - 60)/8, -7, 7)', () => {
  it('criticScore = 60 → delta 0 (the literal 60 anchor)', () => {
    const r = makeResult({ total: 100, criticScore: 60 }) // surprise 0 so other channels quiet
    const out = updateStanding(MID, r, bench(100), ctxOf())
    expect(out.industryPrestige).toBeCloseTo(50, 9)
  })

  it('criticScore = 100 → +5 (NOTE: the +7 cap is unreachable for criticScore<=100)', () => {
    // (100-60)/8 = 40/8 = 5.0. The +7 cap needs criticScore = 116, impossible (0..100),
    // so 5 is the attainable maximum; assert 5 AND that it respects the +7 bound.
    const r = makeResult({ total: 100, criticScore: 100 })
    const out = updateStanding(MID, r, bench(100), ctxOf())
    expect(out.industryPrestige).toBeCloseTo(55, 9) // 50 + 5
    expect(out.industryPrestige - 50).toBeLessThanOrEqual(7 + EPS) // clamp bound holds
    expect(out.industryPrestige - 50).toBeCloseTo(5, 9) // and it is 5, not 7
  })

  it('criticScore = 0 → clamp binds at -7', () => {
    // (0-60)/8 = -7.5 → clamp to -7.
    const r = makeResult({ total: 100, criticScore: 0 })
    const out = updateStanding(MID, r, bench(100), ctxOf())
    expect(out.industryPrestige).toBeCloseTo(43, 9) // 50 - 7
  })

  it('criticScore = 84 → interior +3', () => {
    // (84-60)/8 = 24/8 = 3.
    const r = makeResult({ total: 100, criticScore: 84 })
    const out = updateStanding(MID, r, bench(100), ctxOf())
    expect(out.industryPrestige).toBeCloseTo(53, 9)
  })

  it('industryPrestige channel clamps to [0,100]: near-100 with +5', () => {
    const near100: Standing = { audienceAwareness: 50, industryPrestige: 98, commercialConfidence: 50 }
    const r = makeResult({ total: 100, criticScore: 100 })
    const out = updateStanding(near100, r, bench(100), ctxOf())
    expect(out.industryPrestige).toBe(100) // 98 + 5 = 103 → clamp 100
  })

  it('industryPrestige channel clamps at 0: near-0 with -7', () => {
    const near0: Standing = { audienceAwareness: 50, industryPrestige: 4, commercialConfidence: 50 }
    const r = makeResult({ total: 100, criticScore: 0 })
    const out = updateStanding(near0, r, bench(100), ctxOf())
    expect(out.industryPrestige).toBe(0) // 4 - 7 = -3 → clamp 0
  })
})

describe('§6 confidenceDelta = clamp(5*surprise - 2*normBudgetOverrun, -8, 8)', () => {
  // normBudgetOverrun = clamp((actualNegative - requiredNegative)/max(requiredNegative,1), 0, 1)

  it('overrun = 0 (actualNegative = requiredNegative): confidence moves on surprise only', () => {
    // surprise = +0.30 (total 130 / exp 100), overrun 0 → 5*0.30 - 0 = 1.5.
    const r = makeResult({ total: 130, criticScore: 60 })
    const out = updateStanding(MID, r, bench(100), ctxOf({ actualNegative: 1_000_000, requiredNegative: 1_000_000 }))
    expect(out.commercialConfidence).toBeCloseTo(51.5, 9)
  })

  it('overrun = 1 (actualNegative = 2x requiredNegative): -2 penalty term at full', () => {
    // (2M - 1M)/max(1M,1) = 1 → overrun clamps at 1. surprise 0 (total=exp) → 5*0 - 2*1 = -2.
    const r = makeResult({ total: 100, criticScore: 60 })
    const out = updateStanding(MID, r, bench(100), ctxOf({ actualNegative: 2_000_000, requiredNegative: 1_000_000 }))
    expect(out.commercialConfidence).toBeCloseTo(48, 9) // 50 - 2
  })

  it('overrun clamps at 1 for actualNegative far above requiredNegative', () => {
    // 10M vs 1M → raw ratio 9 → clamp 1. Same -2 term. surprise +1 → 5*1 - 2*1 = 3.
    const r = makeResult({ total: 200, criticScore: 60 })
    const out = updateStanding(MID, r, bench(100), ctxOf({ actualNegative: 10_000_000, requiredNegative: 1_000_000 }))
    expect(out.commercialConfidence).toBeCloseTo(53, 9) // 50 + 3
  })

  it('overrun floors at 0 for underfunding (actualNegative < requiredNegative)', () => {
    // actual 0.5M, required 1M → (−0.5M)/1M = −0.5 → clamp to 0. surprise 0 → delta 0.
    const r = makeResult({ total: 100, criticScore: 60 })
    const out = updateStanding(MID, r, bench(100), ctxOf({ actualNegative: 500_000, requiredNegative: 1_000_000 }))
    expect(out.commercialConfidence).toBeCloseTo(50, 9)
  })

  it('hits the -8 confidence clamp: surprise=-1 and full overrun → 5*(-1) - 2*1 = -7 (>= -8 bound)', () => {
    const r = makeResult({ total: 0, criticScore: 60 }) // surprise -1
    const out = updateStanding(MID, r, bench(100), ctxOf({ actualNegative: 2_000_000, requiredNegative: 1_000_000 }))
    expect(out.commercialConfidence).toBeCloseTo(43, 9) // 50 - 7
    expect(out.commercialConfidence).toBeGreaterThanOrEqual(50 - 8 - EPS)
  })

  it('commercialConfidence channel clamps to [0,100]', () => {
    const near0: Standing = { audienceAwareness: 50, industryPrestige: 50, commercialConfidence: 5 }
    const r = makeResult({ total: 0, criticScore: 60 }) // surprise -1
    // delta = 5*(-1) - 2*1 = -7 → 5-7 = -2 → clamp 0
    const out = updateStanding(near0, r, bench(100), ctxOf({ actualNegative: 2_000_000, requiredNegative: 1_000_000 }))
    expect(out.commercialConfidence).toBe(0)
  })

  it('requiredNegative guarded by max(.,1): requiredNegative=0 → denominator 1', () => {
    // actual 1, required 0 → (1-0)/max(0,1)=1 → overrun 1. surprise 0 → -2.
    const r = makeResult({ total: 100, criticScore: 60 })
    const out = updateStanding(MID, r, bench(100), ctxOf({ actualNegative: 1, requiredNegative: 0 }))
    expect(out.commercialConfidence).toBeCloseTo(48, 9)
  })
})

describe('§6/§14 differentiation: the three channels move on DIFFERENT causes', () => {
  it('a release that moves ONLY awareness materially (high surprise+fame, neutral critics, no overrun)', () => {
    // surprise +1, fames 100 → awarenessDelta = +8 (big). criticScore = 60 → prestigeDelta 0.
    // confidence also gets 5*surprise here, so to isolate awareness we neutralize the
    // commercial channel of confidence by holding surprise's confidence contribution
    // against the fact that prestige (the critic channel) is the one we prove untouched:
    // this case shows awareness >> prestige (prestige is exactly flat).
    const r = makeResult({ total: 200, criticScore: 60 })
    const out = updateStanding(MID, r, bench(100), ctxOf({ fames: [100, 100, 100] }))
    const dAware = out.audienceAwareness - MID.audienceAwareness
    const dPrestige = out.industryPrestige - MID.industryPrestige
    expect(dAware).toBeCloseTo(8, 9) // moved a lot
    expect(dPrestige).toBeCloseTo(0, 9) // critic channel untouched by commercial success
    expect(Math.abs(dAware)).toBeGreaterThan(Math.abs(dPrestige) + 5)
  })

  it('a release that moves ONLY prestige materially (great reviews, on-benchmark box office, no fame)', () => {
    // total = expectedTotal → surprise 0 → awarenessDelta = 2*normStar; with fames 0 → 0,
    // and confidenceDelta = 5*0 - 2*0 = 0. criticScore 100 → prestigeDelta +5.
    const r = makeResult({ total: 100, criticScore: 100 })
    const out = updateStanding(MID, r, bench(100), ctxOf({ fames: [0, 0, 0], actualNegative: 1_000_000, requiredNegative: 1_000_000 }))
    const dAware = out.audienceAwareness - MID.audienceAwareness
    const dPrestige = out.industryPrestige - MID.industryPrestige
    const dConf = out.commercialConfidence - MID.commercialConfidence
    expect(dPrestige).toBeCloseTo(5, 9) // moved a lot
    expect(dAware).toBeCloseTo(0, 9) // awareness untouched by critics
    expect(dConf).toBeCloseTo(0, 9) // confidence untouched by critics
    expect(Math.abs(dPrestige)).toBeGreaterThan(Math.abs(dAware) + 4)
    expect(Math.abs(dPrestige)).toBeGreaterThan(Math.abs(dConf) + 4)
  })

  it('critic score alone does not touch awareness or confidence (orthogonality)', () => {
    // Vary criticScore across [0,100] with box office pinned on-benchmark and no fame/overrun:
    // awareness and confidence deltas stay 0 while prestige sweeps.
    for (const cs of [0, 30, 60, 84, 100]) {
      const r = makeResult({ total: 100, criticScore: cs })
      const out = updateStanding(MID, r, bench(100), ctxOf({ fames: [0, 0, 0], actualNegative: 1_000_000, requiredNegative: 1_000_000 }))
      expect(out.audienceAwareness).toBeCloseTo(50, 9)
      expect(out.commercialConfidence).toBeCloseTo(50, 9)
    }
  })
})
