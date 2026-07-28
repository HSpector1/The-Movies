// ── §6 Standing — owner ruling D-6: behavioral + cause-isolation tests ───────
//
// Under D-6 the three standing channels have SETTLED MEANINGS, and every
// expectation below is derived from those MEANINGS — never from the formula
// (the body of src/core/standing.ts is NEVER read). We import ONLY the public
// surface (src/core/index.ts).
//
// D-6 channel meanings (the ONLY thing these tests encode):
//
//   Audience Awareness = PUBLIC VISIBILITY.
//     PRIMARY driver  : absolute REACH = boxOffice.total / baseMarketValue.
//     SECONDARY driver: star attention (mean cast fame / 100).
//     Does NOT respond to forecast surprise. Higher reach ⇒ awareness rises;
//     very low reach ⇒ awareness flat or falls; a widely-seen flop still raises
//     awareness; a tiny profitable film does not.
//
//   Industry Prestige = ARTISTIC RESPECT.
//     SOLE driver: absolute criticScore vs a REACHABLE neutral benchmark.
//     Does NOT respond to box office, profit, star fame, or forecast surprise.
//     Higher criticScore ⇒ prestige rises; low criticScore ⇒ prestige falls.
//
//   Commercial Confidence = FINANCIAL TRUST.
//     PRIMARY drivers: realized ROI = (boxOffice.total − committedCost)/committedCost,
//       where committedCost = actualNegative + marketing + salaries; AND budget
//       discipline (over-funding overrun = (actualNegative − requiredNegative)/
//       requiredNegative penalizes it).
//     Does NOT respond to absolute reach and does NOT reuse the awareness signal.
//     Higher ROI ⇒ confidence rises; a money-loser ⇒ confidence falls; over-funding
//     ⇒ confidence penalized.
//
// The three channels MUST be able to move in DIFFERENT directions after the same
// release. The (dormant) ReleaseBenchmarks / forecast values move NOTHING.
//
// We PREFER directional / relative assertions (sign of each channel's change,
// one channel vs another) so the tests survive constant re-tuning; the per-release
// caps are read from TUNING.

import { describe, expect, it } from 'vitest'
import { TUNING } from '../src/core/index.js'
import { updateStanding } from '../src/core/index.js'
import type {
  FilmResult,
  ReleaseBenchmarks,
  SegmentId,
  Standing,
  StandingContext,
} from '../src/core/index.js'

// ── minimal builders (all values are INPUTS, never copied expectations) ────────

// A type-complete FilmResult where updateStanding reads ONLY boxOffice.total and
// criticScore; the rest is declared-shape filler.
function makeResult(over: { total?: number; criticScore?: number } = {}): FilmResult {
  const segScores = {
    youngAdult: 50,
    family: 50,
    adult: 50,
    prestige: 50,
  } as Record<SegmentId, number>
  const total = over.total ?? 0
  const criticScore = over.criticScore ?? 50
  return {
    productionId: 'p-1',
    releaseTick: 8,
    delivered: { intimacy: 0, tonalWeight: 0, kineticEnergy: 0 },
    cohesion: 0.5,
    craft: 50,
    criticMean: criticScore,
    criticSigma: 4,
    criticScore,
    reviewVariance: 0,
    segmentScores: segScores,
    boxOffice: { opening: 0, total },
    conceptId: 'concept-1',
    directorId: 'd-1',
  }
}

// ReleaseBenchmarks are DORMANT under D-6 (updateStanding no longer reads them);
// any finite values suffice.
function bench(over: Partial<ReleaseBenchmarks> = {}): ReleaseBenchmarks {
  return {
    expectedOpening: over.expectedOpening ?? 1,
    expectedTotal: over.expectedTotal ?? 1,
    expectedCriticScore: over.expectedCriticScore ?? 50,
  }
}

// Context with sensible neutral defaults. baseMarketValue governs reach together
// with boxOffice.total; marketing + salaries + actualNegative are the committed
// cost; requiredNegative is the discipline reference.
function ctxOf(
  over: {
    fames?: [number, number, number]
    actualNegative?: number
    requiredNegative?: number
    baseMarketValue?: number
    marketing?: number
    salaries?: number
  } = {},
): StandingContext {
  const f = over.fames ?? [0, 0, 0]
  return {
    castFames: { lead: f[0], antagonist: f[1], support: f[2] },
    actualNegative: over.actualNegative ?? 1_000_000,
    requiredNegative: over.requiredNegative ?? 1_000_000,
    baseMarketValue: over.baseMarketValue ?? 1_000_000,
    marketing: over.marketing ?? 400_000,
    salaries: over.salaries ?? 600_000,
  }
}

// committedCost = actualNegative + marketing + salaries — the D-6 confidence base.
function committedCost(ctx: StandingContext): number {
  return ctx.actualNegative + ctx.marketing + ctx.salaries
}

// prev standing mid-range so BOTH up and down are observable (far from 0/100).
const MID: Standing = {
  audienceAwareness: 50,
  industryPrestige: 50,
  commercialConfidence: 50,
}

function deltas(prev: Standing, out: Standing) {
  return {
    dAware: out.audienceAwareness - prev.audienceAwareness,
    dPrestige: out.industryPrestige - prev.industryPrestige,
    dConf: out.commercialConfidence - prev.commercialConfidence,
  }
}

// ── Reach / benchmark anchors derived from the D-6 MEANINGS + TUNING pivots ─────
//
// Awareness reach is "absolute reach vs a reachable neutral". To land clearly on
// the HIGH-reach side we make boxOffice.total ≈ baseMarketValue (reach ≈ 1: a film
// seen by essentially the whole market). To land clearly LOW we make boxOffice.total
// a small fraction of baseMarketValue (reach ≪ 1). We do NOT depend on the exact
// pivot value, only that reach≈1 is high and reach≈0.05 is low.
const MARKET = 1_000_000
const HIGH_REACH_TOTAL = MARKET // reach ≈ 1.0  → widely seen
const LOW_REACH_TOTAL = 50_000 // reach ≈ 0.05 → barely seen

// Prestige benchmark is REACHABLE from both sides (D-6). criticScore well above it
// ⇒ prestige rises; well below ⇒ falls. We straddle it generously.
const HIGH_CRITIC = 90
const LOW_CRITIC = 15
const NEUTRAL_CRITIC = TUNING.PRESTIGE_CRITIC_BENCHMARK // on-benchmark ⇒ ~no prestige move

// ═══════════════════════════════════════════════════════════════════════════════
// BEHAVIORAL CASES — assert the SIGN of each channel's change from the D-6 meaning
// ═══════════════════════════════════════════════════════════════════════════════

describe('D-6 behavioral: each channel moves in the direction its MEANING dictates', () => {
  it('1. widely-seen critical failure → Awareness ↑, Prestige ↓, Confidence per ROI', () => {
    // High reach (total ≈ market) makes the studio famous even though critics pan it.
    // Build it as a MONEY-LOSER: committedCost well above revenue ⇒ ROI < 0 ⇒ Confidence ↓.
    const ctx = ctxOf({ baseMarketValue: MARKET, actualNegative: 3_000_000, marketing: 1_000_000, salaries: 1_000_000 })
    const r = makeResult({ total: HIGH_REACH_TOTAL, criticScore: LOW_CRITIC })
    // ROI = (1.0M − 5.0M)/5.0M < 0 (money-loser) → Confidence must FALL.
    expect(r.boxOffice.total).toBeLessThan(committedCost(ctx))
    const { dAware, dPrestige, dConf } = deltas(MID, updateStanding(MID, r, bench(), ctx))
    expect(dAware).toBeGreaterThan(0) // widely seen ⇒ more visible
    expect(dPrestige).toBeLessThan(0) // panned ⇒ less respected
    expect(dConf).toBeLessThan(0) // lost money ⇒ less trusted
  })

  it('2. acclaimed financial failure → Prestige ↑, Confidence ↓, Awareness per reach', () => {
    // Great reviews, but a money-LOSER (total < committedCost). Give it high reach so
    // awareness also rises — proves prestige/confidence diverge from awareness.
    const ctx = ctxOf({ baseMarketValue: MARKET, actualNegative: 4_000_000, marketing: 1_000_000, salaries: 1_000_000 })
    const r = makeResult({ total: HIGH_REACH_TOTAL, criticScore: HIGH_CRITIC })
    expect(r.boxOffice.total).toBeLessThan(committedCost(ctx)) // money-loser
    const { dAware, dPrestige, dConf } = deltas(MID, updateStanding(MID, r, bench(), ctx))
    expect(dPrestige).toBeGreaterThan(0) // acclaimed ⇒ more respected
    expect(dConf).toBeLessThan(0) // lost money ⇒ less trusted
    expect(dAware).toBeGreaterThan(0) // widely seen ⇒ more visible
  })

  it('3. profitable disciplined sleeper → Confidence ↑, Awareness rises little, Prestige per critics', () => {
    // Modest reach (low), strong ROI (total ≫ committedCost), no over-funding.
    // Confidence must rise; awareness should move only modestly vs a mass hit (case 1).
    const cheapCost = ctxOf({
      baseMarketValue: MARKET,
      actualNegative: 200_000,
      requiredNegative: 200_000, // funded exactly to requirement → overrun 0
      marketing: 100_000,
      salaries: 100_000, // committedCost = 400k
    })
    const r = makeResult({ total: LOW_REACH_TOTAL * 20, criticScore: NEUTRAL_CRITIC }) // total 1.0M ≫ 400k cost
    expect(r.boxOffice.total).toBeGreaterThan(committedCost(cheapCost)) // profitable
    const { dAware, dConf } = deltas(MID, updateStanding(MID, r, bench(), cheapCost))
    expect(dConf).toBeGreaterThan(0) // strong ROI, no overrun ⇒ more trusted

    // Awareness of this sleeper (reach = 1.0M/1.0M ≈ 1? no — total here is 1.0M vs
    // market 1.0M). Keep the sleeper's reach genuinely modest by raising its market.
    const sleeperCtx = ctxOf({
      baseMarketValue: 20_000_000, // huge available market → this film reaches a small slice
      actualNegative: 200_000,
      requiredNegative: 200_000,
      marketing: 100_000,
      salaries: 100_000,
    })
    const sleeper = updateStanding(MID, makeResult({ total: 1_000_000, criticScore: NEUTRAL_CRITIC }), bench(), sleeperCtx)
    const massHitCtx = ctxOf({ baseMarketValue: MARKET, actualNegative: 200_000, marketing: 100_000, salaries: 100_000 })
    const massHit = updateStanding(MID, makeResult({ total: HIGH_REACH_TOTAL, criticScore: NEUTRAL_CRITIC }), bench(), massHitCtx)
    const dAwareSleeper = sleeper.audienceAwareness - MID.audienceAwareness
    const dAwareMass = massHit.audienceAwareness - MID.audienceAwareness
    // A tiny-slice film raises awareness LESS than a whole-market hit.
    expect(dAwareMass).toBeGreaterThan(dAwareSleeper)
    void dAware // (the same-market sleeper's awareness is only sanity-referenced)
  })

  it('4. expensive blockbuster disappointment → Awareness ↑, Confidence ↓, Prestige per critics', () => {
    // High reach (widely seen) but a money-loser because the cost was enormous.
    const ctx = ctxOf({ baseMarketValue: MARKET, actualNegative: 8_000_000, marketing: 3_000_000, salaries: 4_000_000 })
    const r = makeResult({ total: HIGH_REACH_TOTAL, criticScore: NEUTRAL_CRITIC })
    expect(r.boxOffice.total).toBeLessThan(committedCost(ctx)) // huge cost ⇒ loss
    const { dAware, dConf } = deltas(MID, updateStanding(MID, r, bench(), ctx))
    expect(dAware).toBeGreaterThan(0) // widely seen ⇒ more visible
    expect(dConf).toBeLessThan(0) // enormous cost, lost money ⇒ less trusted
  })

  it('5. star-driven flop → Awareness may rise (visibility/star), Prestige ↓, Confidence ↓', () => {
    // Famous cast + high reach make it visible; poor critics and poor financials.
    const ctx = ctxOf({
      fames: [100, 100, 100],
      baseMarketValue: MARKET,
      actualNegative: 3_000_000,
      marketing: 1_000_000,
      salaries: 2_000_000,
    })
    const r = makeResult({ total: HIGH_REACH_TOTAL, criticScore: LOW_CRITIC })
    expect(r.boxOffice.total).toBeLessThan(committedCost(ctx)) // money-loser
    const { dAware, dPrestige, dConf } = deltas(MID, updateStanding(MID, r, bench(), ctx))
    expect(dAware).toBeGreaterThan(0) // visibility + star attention
    expect(dPrestige).toBeLessThan(0) // panned
    expect(dConf).toBeLessThan(0) // lost money
  })

  it('6. low-budget prestige success → Prestige ↑, Confidence ≥ 0, Awareness ≪ a mass hit', () => {
    // Acclaimed AND profitable, but limited reach (small slice of a big market).
    const ctx = ctxOf({
      baseMarketValue: 20_000_000, // big market → limited reach
      actualNegative: 150_000,
      requiredNegative: 150_000, // no overrun
      marketing: 100_000,
      salaries: 100_000, // committedCost = 350k
    })
    const r = makeResult({ total: 1_500_000, criticScore: HIGH_CRITIC }) // profitable (1.5M ≫ 350k)
    expect(r.boxOffice.total).toBeGreaterThan(committedCost(ctx))
    const out = updateStanding(MID, r, bench(), ctx)
    const { dAware, dPrestige, dConf } = deltas(MID, out)
    expect(dPrestige).toBeGreaterThan(0) // acclaimed
    expect(dConf).toBeGreaterThanOrEqual(0) // profitable, disciplined ⇒ not penalized

    // Compare its awareness gain against a genuine mass hit (case-1-style whole-market reach).
    const massHitCtx = ctxOf({ baseMarketValue: MARKET, actualNegative: 3_000_000, marketing: 1_000_000, salaries: 1_000_000 })
    const massHit = updateStanding(MID, makeResult({ total: HIGH_REACH_TOTAL, criticScore: LOW_CRITIC }), bench(), massHitCtx)
    const dAwareMass = massHit.audienceAwareness - MID.audienceAwareness
    expect(dAwareMass).toBeGreaterThan(dAware) // limited reach ⇒ materially less awareness
  })

  it('7. channels diverge: one release moves the three deltas in DIFFERENT signs', () => {
    // Constructed to give Awareness ↑ (high reach), Prestige ↓ (panned),
    // Confidence ↓ (money-loser) — three distinct simultaneous directions.
    const ctx = ctxOf({ baseMarketValue: MARKET, actualNegative: 3_000_000, marketing: 1_000_000, salaries: 1_500_000 })
    const r = makeResult({ total: HIGH_REACH_TOTAL, criticScore: LOW_CRITIC })
    const { dAware, dPrestige, dConf } = deltas(MID, updateStanding(MID, r, bench(), ctx))
    expect(dAware).toBeGreaterThan(0)
    expect(dPrestige).toBeLessThan(0)
    expect(dConf).toBeLessThan(0)
    // Awareness sign differs from the other two (the core divergence proof).
    expect(Math.sign(dAware)).not.toBe(Math.sign(dPrestige))
    expect(Math.sign(dAware)).not.toBe(Math.sign(dConf))
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// CAUSE-ISOLATION — PAIRS identical except one input; ONLY the intended channel moves
// ═══════════════════════════════════════════════════════════════════════════════

describe('D-6 cause-isolation: each authorized driver moves ONLY its own channel', () => {
  it('changing ONLY criticScore → ONLY Prestige changes (awareness & confidence identical)', () => {
    // Everything fixed; sweep criticScore across the benchmark. Prestige must be the
    // ONLY channel that differs between the two runs.
    const ctx = ctxOf({ baseMarketValue: MARKET, actualNegative: 1_000_000, marketing: 400_000, salaries: 600_000 })
    const lo = updateStanding(MID, makeResult({ total: 700_000, criticScore: LOW_CRITIC }), bench(), ctx)
    const hi = updateStanding(MID, makeResult({ total: 700_000, criticScore: HIGH_CRITIC }), bench(), ctx)
    expect(hi.audienceAwareness).toBe(lo.audienceAwareness) // reach identical
    expect(hi.commercialConfidence).toBe(lo.commercialConfidence) // ROI identical
    expect(hi.industryPrestige).toBeGreaterThan(lo.industryPrestige) // ONLY prestige moved (and rose)
  })

  it('changing ONLY reach (via baseMarketValue, holding revenue/cost/critics/fame fixed) → ONLY Awareness changes', () => {
    // Reach = boxOffice.total / baseMarketValue. Vary baseMarketValue ONLY: revenue,
    // committed cost (ROI), criticScore and fame are all held byte-identical, so ONLY
    // awareness may move. Smaller market ⇒ higher reach ⇒ higher awareness.
    const common = { actualNegative: 1_000_000, requiredNegative: 1_000_000, marketing: 400_000, salaries: 600_000 }
    const r = makeResult({ total: 800_000, criticScore: NEUTRAL_CRITIC })
    const bigMarket = updateStanding(MID, r, bench(), ctxOf({ ...common, baseMarketValue: 20_000_000 })) // reach ≈ 0.04
    const smallMarket = updateStanding(MID, r, bench(), ctxOf({ ...common, baseMarketValue: 900_000 })) // reach ≈ 0.9
    expect(smallMarket.industryPrestige).toBe(bigMarket.industryPrestige) // critics unchanged
    expect(smallMarket.commercialConfidence).toBe(bigMarket.commercialConfidence) // ROI unchanged (cost/revenue fixed)
    expect(smallMarket.audienceAwareness).toBeGreaterThan(bigMarket.audienceAwareness) // ONLY awareness moved
  })

  it('changing ONLY profitability/cost (holding reach, critics, fame fixed) → ONLY Confidence changes', () => {
    // Hold reach (total & baseMarketValue fixed), criticScore, and fame. Vary committed
    // cost via marketing + salaries, and vary discipline via requiredNegative. ONLY
    // confidence may move.
    const r = makeResult({ total: 5_000_000, criticScore: NEUTRAL_CRITIC })
    const market = 5_000_000 // reach = 5M/5M = 1.0 in BOTH runs
    const profitable = updateStanding(
      MID,
      r,
      bench(),
      ctxOf({ baseMarketValue: market, actualNegative: 500_000, requiredNegative: 500_000, marketing: 100_000, salaries: 100_000 }),
    ) // committedCost 700k ⇒ ROI ≫ 0
    const lossMaking = updateStanding(
      MID,
      r,
      bench(),
      ctxOf({ baseMarketValue: market, actualNegative: 8_000_000, requiredNegative: 500_000, marketing: 2_000_000, salaries: 2_000_000 }),
    ) // committedCost 12M ⇒ ROI < 0, and massive over-funding overrun
    expect(profitable.audienceAwareness).toBe(lossMaking.audienceAwareness) // reach identical
    expect(profitable.industryPrestige).toBe(lossMaking.industryPrestige) // critics identical
    expect(profitable.commercialConfidence).toBeGreaterThan(lossMaking.commercialConfidence) // ONLY confidence moved

    // And discipline in isolation: same revenue/cost/reach/critics, only requiredNegative
    // (the over-funding reference) differs → only confidence may move.
    const disciplined = updateStanding(
      MID,
      r,
      bench(),
      ctxOf({ baseMarketValue: market, actualNegative: 2_000_000, requiredNegative: 2_000_000, marketing: 100_000, salaries: 100_000 }),
    ) // overrun 0
    const overFunded = updateStanding(
      MID,
      r,
      bench(),
      ctxOf({ baseMarketValue: market, actualNegative: 2_000_000, requiredNegative: 1_000_000, marketing: 100_000, salaries: 100_000 }),
    ) // overrun = (2M−1M)/1M = 1.0 ; identical committedCost & revenue ⇒ identical ROI
    expect(overFunded.audienceAwareness).toBe(disciplined.audienceAwareness)
    expect(overFunded.industryPrestige).toBe(disciplined.industryPrestige)
    expect(overFunded.commercialConfidence).toBeLessThan(disciplined.commercialConfidence) // over-funding penalized
  })

  it('changing ONLY star fame → Awareness moves (small, authorized secondary); Prestige & Confidence identical', () => {
    // Fame is awareness's SECONDARY contributor only. Hold reach, critics, ROI fixed;
    // vary fame from 0 to 100. Awareness may move (small); the other two must not.
    const ctx = { baseMarketValue: MARKET, actualNegative: 1_000_000, requiredNegative: 1_000_000, marketing: 400_000, salaries: 600_000 }
    const r = makeResult({ total: 700_000, criticScore: NEUTRAL_CRITIC })
    const noFame = updateStanding(MID, r, bench(), ctxOf({ ...ctx, fames: [0, 0, 0] }))
    const famous = updateStanding(MID, r, bench(), ctxOf({ ...ctx, fames: [100, 100, 100] }))
    expect(famous.industryPrestige).toBe(noFame.industryPrestige) // critics unchanged
    expect(famous.commercialConfidence).toBe(noFame.commercialConfidence) // ROI unchanged
    expect(famous.audienceAwareness).toBeGreaterThan(noFame.audienceAwareness) // fame lifts awareness
    // Secondary means SMALL: the fame-only lift must be less than a full reach swing
    // (reach term is the PRIMARY driver). Compare fame's lift to a big reach lift.
    const fameLift = famous.audienceAwareness - noFame.audienceAwareness
    const highReach = updateStanding(MID, makeResult({ total: MARKET, criticScore: NEUTRAL_CRITIC }), bench(), ctxOf({ ...ctx, fames: [0, 0, 0] }))
    const lowReach = updateStanding(MID, makeResult({ total: 30_000, criticScore: NEUTRAL_CRITIC }), bench(), ctxOf({ ...ctx, fames: [0, 0, 0] }))
    const reachSwing = highReach.audienceAwareness - lowReach.audienceAwareness
    expect(fameLift).toBeLessThan(reachSwing) // secondary < primary
  })

  it('changing ONLY the dormant ReleaseBenchmarks/forecast values → NO channel changes (D-6 dropped forecast surprise)', () => {
    // Same FilmResult + same ctx; ONLY the forecast benchmarks differ (wildly). If any
    // channel moved, the implementation would still be reading forecast surprise.
    const ctx = ctxOf({ baseMarketValue: MARKET, actualNegative: 1_000_000, marketing: 400_000, salaries: 600_000 })
    const r = makeResult({ total: 800_000, criticScore: 70 })
    const lowExpect = updateStanding(MID, r, bench({ expectedTotal: 1, expectedOpening: 1, expectedCriticScore: 1 }), ctx)
    const highExpect = updateStanding(MID, r, bench({ expectedTotal: 999_999_999, expectedOpening: 999_999, expectedCriticScore: 100 }), ctx)
    expect(highExpect).toStrictEqual(lowExpect) // forecast is dormant → nothing moves
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// BOUNDS / CAPS — channels stay in [0,100]; per-release delta within its cap
// ═══════════════════════════════════════════════════════════════════════════════

describe('D-6 bounds: [0,100] clamping and per-release delta caps', () => {
  // Extreme releases used to probe both the positive and negative caps.
  const HUGE_POS_CTX = ctxOf({
    fames: [100, 100, 100],
    baseMarketValue: 500_000, // reach = 5.0M/500k = 10 → far above "fully visible"
    actualNegative: 500_000,
    requiredNegative: 5_000_000, // under-funded → no overrun penalty
    marketing: 100_000,
    salaries: 100_000, // tiny cost vs 5M revenue → ROI enormous
  })
  const HUGE_NEG_CTX = ctxOf({
    fames: [0, 0, 0],
    baseMarketValue: 100_000_000, // reach ≈ 0 → awareness pushed down hard
    actualNegative: 50_000_000,
    requiredNegative: 1_000_000, // massive over-funding
    marketing: 10_000_000,
    salaries: 10_000_000, // committedCost ≫ revenue → ROI deeply negative
  })
  const posResult = makeResult({ total: 5_000_000, criticScore: 100 })
  const negResult = makeResult({ total: 10_000, criticScore: 0 })

  it('per-release |Δ| of each channel never exceeds its TUNING cap (positive extreme)', () => {
    const { dAware, dPrestige, dConf } = deltas(MID, updateStanding(MID, posResult, bench(), HUGE_POS_CTX))
    expect(Math.abs(dAware)).toBeLessThanOrEqual(TUNING.AWARENESS_DELTA_CAP + 1e-9)
    expect(Math.abs(dPrestige)).toBeLessThanOrEqual(TUNING.PRESTIGE_DELTA_CAP + 1e-9)
    expect(Math.abs(dConf)).toBeLessThanOrEqual(TUNING.CONFIDENCE_DELTA_CAP + 1e-9)
    // and the direction is up on every channel for this all-good release
    expect(dAware).toBeGreaterThan(0)
    expect(dPrestige).toBeGreaterThan(0)
    expect(dConf).toBeGreaterThan(0)
  })

  it('per-release |Δ| of each channel never exceeds its TUNING cap (negative extreme)', () => {
    const { dAware, dPrestige, dConf } = deltas(MID, updateStanding(MID, negResult, bench(), HUGE_NEG_CTX))
    expect(Math.abs(dAware)).toBeLessThanOrEqual(TUNING.AWARENESS_DELTA_CAP + 1e-9)
    expect(Math.abs(dPrestige)).toBeLessThanOrEqual(TUNING.PRESTIGE_DELTA_CAP + 1e-9)
    expect(Math.abs(dConf)).toBeLessThanOrEqual(TUNING.CONFIDENCE_DELTA_CAP + 1e-9)
    expect(dAware).toBeLessThan(0)
    expect(dPrestige).toBeLessThan(0)
    expect(dConf).toBeLessThan(0)
  })

  it('starting near 100 clamps to ≤ 100 on an all-good release', () => {
    const near100: Standing = { audienceAwareness: 99, industryPrestige: 99, commercialConfidence: 99 }
    const out = updateStanding(near100, posResult, bench(), HUGE_POS_CTX)
    expect(out.audienceAwareness).toBeLessThanOrEqual(100)
    expect(out.industryPrestige).toBeLessThanOrEqual(100)
    expect(out.commercialConfidence).toBeLessThanOrEqual(100)
    expect(out.audienceAwareness).toBeGreaterThanOrEqual(99) // rose but capped
    expect(out.industryPrestige).toBeGreaterThanOrEqual(99)
    expect(out.commercialConfidence).toBeGreaterThanOrEqual(99)
  })

  it('starting near 0 clamps to ≥ 0 on an all-bad release', () => {
    const near0: Standing = { audienceAwareness: 1, industryPrestige: 1, commercialConfidence: 1 }
    const out = updateStanding(near0, negResult, bench(), HUGE_NEG_CTX)
    expect(out.audienceAwareness).toBeGreaterThanOrEqual(0)
    expect(out.industryPrestige).toBeGreaterThanOrEqual(0)
    expect(out.commercialConfidence).toBeGreaterThanOrEqual(0)
    expect(out.audienceAwareness).toBeLessThanOrEqual(1) // fell but floored
    expect(out.industryPrestige).toBeLessThanOrEqual(1)
    expect(out.commercialConfidence).toBeLessThanOrEqual(1)
  })

  it('output values always land inside [0,100] across a spread of releases', () => {
    const cases: Array<{ total: number; critic: number; ctx: StandingContext }> = [
      { total: 5_000_000, critic: 100, ctx: HUGE_POS_CTX },
      { total: 10_000, critic: 0, ctx: HUGE_NEG_CTX },
      { total: 800_000, critic: 50, ctx: ctxOf() },
      { total: 0, critic: 45, ctx: ctxOf({ baseMarketValue: MARKET }) },
    ]
    const starts: Standing[] = [
      { audienceAwareness: 0, industryPrestige: 0, commercialConfidence: 0 },
      { audienceAwareness: 100, industryPrestige: 100, commercialConfidence: 100 },
      MID,
    ]
    for (const start of starts) {
      for (const c of cases) {
        const out = updateStanding(start, makeResult({ total: c.total, criticScore: c.critic }), bench(), c.ctx)
        for (const v of [out.audienceAwareness, out.industryPrestige, out.commercialConfidence]) {
          expect(v).toBeGreaterThanOrEqual(0)
          expect(v).toBeLessThanOrEqual(100)
        }
      }
    }
  })
})
