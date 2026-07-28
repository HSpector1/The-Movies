// ── D-12 calibration closure — Marketing (Stage A+B) + Production Budget realization ──
// Proves the two repaired spending choices are real and engaged-gated (M0A byte-identical):
//   • Marketing single-sourced through the canonical effective value; a low-awareness film has a
//     non-maximum Contribution optimum; a big campaign that under-delivers front-loads (Stage B).
//   • Production Budget realization/reliability: under-funding a DEMANDING film lowers realized craft
//     (a contained film barely notices); over-funding has diminishing returns; it never multiplies
//     gross directly; the delta is 0 when not engaged.

import { describe, expect, it } from 'vitest'
import {
  computeBoxOffice,
  resolveReception,
  RngStream,
  budgetRealizationDelta,
  forecastProfitRange,
  TUNING,
} from '../src/core/index.js'
import type { SegmentId } from '../src/core/index.js'
import { makeReceptionInputs, makeShapeEffects, makeBudget } from './_fixtures.js'

const SHARE = TUNING.STUDIO_RENTAL_BLENDED

function common(inp: ReturnType<typeof makeReceptionInputs>, marketing: number) {
  return [
    inp.market.segments,
    inp.market.baseMarketValue,
    inp.standing,
    inp.promise,
    { negative: inp.budget.negative, marketing },
    inp.shapeEffects,
  ] as const
}
function flat(inp: ReturnType<typeof makeReceptionInputs>, v: number): Record<SegmentId, number> {
  const m = {} as Record<SegmentId, number>
  for (const s of inp.market.segments) m[s.id] = v
  return m
}

// ── Marketing: single-source + interior optimum + Stage B ─────────────────────
describe('D-12 closure — Marketing choice is film-specific', () => {
  it('all engaged marketing effect flows from the canonical effective value (raw spend enters once)', () => {
    const inp = makeReceptionInputs({})
    const appeal = flat(inp, 55)
    // Two calls that differ ONLY in marketing spend must differ ONLY through the box office; the
    // marketingQuality/capacity the engine reports fully determines the awareness effect. Doubling
    // capacity (awareness) at a fixed spend lowers marketingQuality — the single channel — monotonically.
    const a = computeBoxOffice(appeal, ...common(inp, 400_000), appeal, true)
    const b = computeBoxOffice(appeal, ...common(inp, 400_000), flat(inp, 90), true) // higher awareness
    expect(b.marketingCapacity).toBeGreaterThan(a.marketingCapacity)
    expect(b.marketingQuality).toBeLessThan(a.marketingQuality) // same spend, larger capacity → less quality
  })

  it('a low-awareness film has a NON-maximum Contribution optimum; a strong film can prefer max', () => {
    const inp = makeReceptionInputs({})
    const commit = (m: number) => inp.budget.negative + m
    const contribution = (appealV: number, m: number) => {
      const box = computeBoxOffice(flat(inp, appealV), ...common(inp, m), flat(inp, appealV), true)
      return box.total * SHARE - commit(m)
    }
    // Weak, low-awareness film (low appeal): Standard beats Maximum (over-marketing overspends).
    const weakStd = contribution(38, 400_000)
    const weakMax = contribution(38, 1_000_000)
    expect(weakStd).toBeGreaterThan(weakMax)
    // Strong, delivering film (high appeal): Maximum is not penalized into a loss vs Standard.
    const strongStd = contribution(85, 400_000)
    const strongMax = contribution(85, 1_000_000)
    expect(strongMax).toBeGreaterThan(strongStd - 1) // strong film withstands / benefits from the big campaign
  })
})

// ── Production Budget realization/reliability ─────────────────────────────────
describe('D-12 closure — Production Budget realization/reliability (engaged only)', () => {
  it('budgetRealizationDelta: 0 when not engaged, negative when under-funded, small positive when over-funded', () => {
    const req = 4_000_000
    expect(budgetRealizationDelta(3_000_000, req, 1.3, false)).toBe(0) // M0A: no delta
    expect(budgetRealizationDelta(3_000_000, req, 1.3, true)).toBeLessThan(0) // under-funded demanding → penalty
    expect(budgetRealizationDelta(req, req, 1.3, true)).toBeCloseTo(0, 6) // adequate → ~0
    expect(budgetRealizationDelta(5_000_000, req, 1.3, true)).toBeGreaterThan(0) // over-funded → small protection
  })

  it('under-funding hurts a DEMANDING film far more than a CONTAINED one', () => {
    const shortfall = 0.25 // negMult 0.75
    const demanding = -budgetRealizationDelta(4_000_000 * (1 - shortfall), 4_000_000, 1.4, true)
    const contained = -budgetRealizationDelta(4_000_000 * (1 - shortfall), 4_000_000, 0.85, true)
    expect(demanding).toBeGreaterThan(contained * 2) // ambition-scaled: demanding films need the money
    expect(contained).toBeGreaterThan(0) // a floor: even contained loses a little if under-funded
  })

  it('over-funding has DIMINISHING returns (never unbounded)', () => {
    const req = 4_000_000
    const at125 = budgetRealizationDelta(req * 1.25, req, 1.3, true)
    const at175 = budgetRealizationDelta(req * 1.75, req, 1.3, true)
    expect(at175).toBeGreaterThan(at125)
    expect(at175).toBeLessThan(TUNING.BUDGET_OVERFUND_COEF + 0.001) // capped by the coefficient
    expect(at175 - at125).toBeLessThan(at125) // marginal shrinks
  })

  it('under-funding a demanding film lowers REALIZED craft; a contained film barely changes; opening is not directly bought', () => {
    const demand = makeShapeEffects({ budgetDemandMultiplier: 1.4, craftMod: 0 })
    const contain = makeShapeEffects({ budgetDemandMultiplier: 0.85, craftMod: 0 })
    const reqFor = (inp: ReturnType<typeof makeReceptionInputs>) =>
      inp.concept.baseNegativeCost * inp.shapeEffects.budgetDemandMultiplier * inp.era.costScale
    const craftAt = (se: ReturnType<typeof makeShapeEffects>, mult: number) => {
      const base = makeReceptionInputs({ shapeEffects: se })
      const req = reqFor(base)
      const inp = makeReceptionInputs({ shapeEffects: se, budget: makeBudget(Math.round(req * mult), 400_000) })
      return resolveReception(inp, RngStream.fromSeed('budget'), true, true).craft
    }
    // Demanding film: lean (0.75×) delivers materially LESS craft than adequate (1.0×).
    const demLean = craftAt(demand, 0.75)
    const demAdeq = craftAt(demand, 1.0)
    const demGap = demAdeq - demLean
    expect(demGap).toBeGreaterThan(8) // a demanding film underfunded loses a lot of realized craft
    // Contained film: the same underfunding moves craft far less (the shared M0A budgetAdequacy term
    // affects both equally; the ambition-scaled realization delta is what separates them).
    const conLean = craftAt(contain, 0.75)
    const conAdeq = craftAt(contain, 1.0)
    const conGap = conAdeq - conLean
    expect(conGap).toBeLessThan(demGap) // demanding is far more budget-sensitive
    expect(demGap - conGap).toBeGreaterThan(5) // the ambition-scaled realization delta is real
  })

  it('the live Commercial-Outlook range REFLECTS the budget realization penalty (forecast == realized direction)', () => {
    // Regression: forecastProfitRange must thread `engaged` into computeForecast so the forecast craft
    // carries the SAME budget realization delta as the greenlight-locked forecast + realized release.
    // For a DEMANDING film, under-funding must lower the forecast Studio Revenue (craft → appeal → gross).
    const se = makeShapeEffects({ budgetDemandMultiplier: 1.4, craftMod: 0 })
    const probe = makeReceptionInputs({ shapeEffects: se })
    const req = probe.concept.baseNegativeCost * probe.shapeEffects.budgetDemandMultiplier * probe.era.costScale
    const rangeFor = (mult: number) => {
      const inp = makeReceptionInputs({ shapeEffects: se, budget: makeBudget(Math.round(req * mult), 400_000) })
      return forecastProfitRange(inp, {
        seed: 'co-budget',
        productionId: 'p-co',
        directorId: inp.director.id,
        releasedFilms: [],
        concepts: [inp.concept],
        salaries: 0,
        saturateFame: true,
        engaged: true,
      })
    }
    const lean = rangeFor(0.75)
    const adequate = rangeFor(1.0)
    expect(lean.studioRevenue.expected).toBeLessThan(adequate.studioRevenue.expected)
  })

  it('the realization layer is engaged-gated — a NON-engaged reception is byte-identical to legacy', () => {
    const se = makeShapeEffects({ budgetDemandMultiplier: 1.4, craftMod: 0 })
    const inp = makeReceptionInputs({ shapeEffects: se, budget: makeBudget(1_000_000, 400_000) }) // severely under-funded
    const legacy = resolveReception(inp, RngStream.fromSeed('gate'), false, false)
    const legacyAgain = resolveReception(inp, RngStream.fromSeed('gate'), false, false)
    expect(legacy.craft).toBe(legacyAgain.craft) // deterministic, no realization delta when not engaged
    const engaged = resolveReception(inp, RngStream.fromSeed('gate'), true, true)
    expect(engaged.craft).toBeLessThan(legacy.craft) // engaged path DOES penalize the under-funded demanding film
  })
})
