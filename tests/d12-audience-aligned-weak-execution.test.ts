// ── D-12 forecast causality — audienceAlignedWeakExecution ────────────────────────────────────────
// The owner's "Letters from Vineyard" greenlight forecast promised a blockbuster (expected gross
// $91.54M, expected profit ~$42M) for a film with weak Craft, low Fit, unproven talent and Weak
// Execution Confidence. Root cause: the ENGAGED "expected" gross was box office evaluated at a SINGLE
// noisy appeal sample (center + one gaussian offset, sigma largest for low-confidence films) run through
// CONVEX box office (opening ∝ appeal^APPEAL_CURVE_EXP, legs ∝ (WAS/100)^LEGS_RETENTION_EXP) — a positive
// draw inflated the central estimate into an optimistic outlier. The fix: the engaged central estimate is
// the DETERMINISTIC CENTER; uncertainty lives in the band + realized RNG. These tests lock that in.

import { describe, expect, it } from 'vitest'
import {
  computeForecast,
  forecastCenters,
  computeBoxOffice,
  forecastProfitRange,
  TUNING,
} from '../src/core/index.js'
import type { SegmentId } from '../src/core/index.js'
import { makeReceptionInputs, makeConcept, makeShapeEffects, makeBudget, makeTalent, makeMarket } from './_fixtures.js'

// A weak-execution team whose delivered creative direction happens to align with the biggest audience
// segment: low skill, unproven (low fame), low-cost concept, accessible shape (positive reach + affinity),
// GENEROUS budget, WIDE marketing. Perfect audience alignment is injected by matching the 'adult' segment
// taste to the delivered centroid (so segment fit is maximal — "strongly positive audience positioning").
function audienceAlignedWeakInputs(marketing = 1_500_000) {
  const weak = (role: 'writer' | 'director' | 'actor', skill: number) => makeTalent({ role, skill, fame: 5 })
  const shapeEffects = makeShapeEffects({
    openingReachMod: 4.25, craftMod: 0, budgetDemandMultiplier: 1.05,
    segmentAffinity: { youngAdult: 6, family: 4, adult: 8, prestige: 2 },
  })
  const concept = makeConcept({ baseNegativeCost: 3_000_000, baselineStrength: 35, originalityRaw: 45 })
  let inp = makeReceptionInputs({
    concept, shapeEffects,
    writer: weak('writer', 25), director: weak('director', 25),
    cast: { lead: weak('actor', 25), antagonist: weak('actor', 25), support: weak('actor', 25) },
    budget: makeBudget(Math.round(3_000_000 * 1.05 * 1.25), marketing), // Generous negative, Wide marketing
    standing: { audienceAwareness: 60, industryPrestige: 30, commercialConfidence: 40 },
  })
  // Pass 1: read the delivered centroid; make the biggest segment's taste MATCH it → maximal segment fit.
  let fc = forecastCenters(inp, true, true)
  const market = makeMarket()
  for (const seg of market.segments) if (seg.id === 'adult') seg.taste = { ...fc.core.delivered }
  inp = { ...inp, market }
  fc = forecastCenters(inp, true, true)
  return { inp, fc }
}
const ctxFor = (inp: ReturnType<typeof audienceAlignedWeakInputs>['inp'], engaged: boolean) => ({
  seed: 'aawe', productionId: 'p', directorId: inp.director.id, releasedFilms: [], concepts: [inp.concept],
  salaries: 0, saturateFame: engaged, engaged,
})

describe('D-12 forecast causality — audienceAlignedWeakExecution', () => {
  // (1) Forecast decomposition: the ENGAGED expected gross is box office at the CENTER, not a noisy sample.
  it('the engaged central estimate equals the deterministic center (the noisy offset is removed)', () => {
    const { inp, fc } = audienceAlignedWeakInputs()
    const f = computeForecast(inp, { seed: 'aawe', productionId: 'p', directorId: inp.director.id, releasedFilms: [], concepts: [inp.concept] }, true, true)
    for (const seg of f.segments) {
      expect(seg.estimate).toBeCloseTo(seg.center, 6) // engaged: estimate === center (no bias)
      expect(seg.opening.estimate).toBeCloseTo(seg.opening.center, 6)
    }
    // Expected gross equals box office at the center appeal — the honest deterministic expectation.
    const boCenter = computeBoxOffice(fc.centers, inp.market.segments, inp.market.baseMarketValue, inp.standing,
      inp.promise, inp.budget, inp.shapeEffects, fc.centersOpening, true)
    expect(f.expectedTotal).toBeCloseTo(boCenter.total, 2)
  })

  // M0A byte-identity: the NON-engaged path keeps the noisy offset (estimate ≠ center for low confidence).
  it('the non-engaged (M0A) path is unchanged — the offset still biases the central estimate', () => {
    const { inp } = audienceAlignedWeakInputs()
    const f = computeForecast(inp, { seed: 'aawe', productionId: 'p', directorId: inp.director.id, releasedFilms: [], concepts: [inp.concept] }, false, false)
    // A low-confidence unproven film draws a non-zero offset → at least one segment estimate differs from center.
    const anyOffset = f.segments.some((s) => Math.abs(s.estimate - s.center) > 1e-6)
    expect(anyOffset).toBe(true)
  })

  // (2) Downside crosses below zero AND (3) positioning cannot guarantee extreme gross.
  it('downside Contribution is negative and the expected is NOT a guaranteed blockbuster profit', () => {
    const { inp } = audienceAlignedWeakInputs()
    const range = forecastProfitRange(inp, ctxFor(inp, true))
    expect(range.profit.low).toBeLessThan(0) // honest negative downside
    // Expected Contribution is near break-even, not an enormous guaranteed profit (the owner saw ~+$42M).
    expect(range.profit.expected).toBeLessThan(4_000_000)
    // Segment positioning alone cannot conjure a blockbuster: expected gross stays bounded for weak delivery.
    const f = computeForecast(inp, { seed: 'aawe', productionId: 'p', directorId: inp.director.id, releasedFilms: [], concepts: [inp.concept] }, true, true)
    expect(f.expectedTotal).toBeLessThan(25_000_000) // weak-craft central estimate ≈ $11M, never ~$91M
  })

  // (4) Overextended WIDE marketing is applied in the live preview (engaged overexposure bites legs).
  it('overextended Wide marketing incurs the engaged overexposure penalty in the forecast', () => {
    const { inp, fc } = audienceAlignedWeakInputs(1_500_000)
    const bo = computeBoxOffice(fc.centers, inp.market.segments, inp.market.baseMarketValue, inp.standing,
      inp.promise, inp.budget, inp.shapeEffects, fc.centersOpening, true)
    expect(bo.overexposure).toBeGreaterThan(0) // a wide campaign beyond capacity is over-exposed
    // The legs are BELOW the un-penalized engaged retention curve for the same WAS → marketing didn't buy free demand.
    const unpenalizedLegs =
      TUNING.LEGS_MIN_ENGAGED +
      (TUNING.LEGS_MAX - TUNING.LEGS_MIN_ENGAGED) * Math.pow(bo.weightedAudienceScore / 100, TUNING.LEGS_RETENTION_EXP)
    expect(bo.legs).toBeLessThan(unpenalizedLegs)
  })

  // (5) Expected legs respond to expected delivery — a weaker WAS retains worse than a stronger one.
  it('expected legs increase with expected delivery (audience score), not with positioning alone', () => {
    const { inp, fc } = audienceAlignedWeakInputs()
    const flat = (v: number): Record<SegmentId, number> => {
      const m = {} as Record<SegmentId, number>
      for (const s of inp.market.segments) m[s.id] = v
      return m
    }
    const legsAt = (was: number) =>
      computeBoxOffice(flat(was), inp.market.segments, inp.market.baseMarketValue, inp.standing, inp.promise,
        { negative: inp.budget.negative, marketing: 0 }, inp.shapeEffects, flat(was), true).legs
    expect(legsAt(fc.core.craft > 0 ? 40 : 40)).toBeLessThan(legsAt(70)) // weak delivery → materially weaker legs
  })
})
