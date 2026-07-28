// ── D-12 final downside — legs retention, weak-film risk, forecast truth ──────
// The owner's final playtest showed: (a) a legs floor so high that weak delivery could not collapse
// a film (the "worst legal film" was a guaranteed profit); (b) three films sharing legs ≈ 2.82 by
// coincidence + overexposure cancellation. This suite proves the engaged retention reshape gives legs
// a real, floor-free response to delivered audience score, that the weakest package now carries real
// downside, and that stronger delivery retains better. All engaged-only (M0A byte-identical elsewhere).

import { describe, expect, it } from 'vitest'
import {
  computeBoxOffice,
  forecastProfitRange,
  TUNING,
} from '../src/core/index.js'
import type { SegmentId } from '../src/core/index.js'
import { makeReceptionInputs, makeShapeEffects, makeBudget, makeTalent } from './_fixtures.js'

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

// ── Legs response curve (engaged retention) ───────────────────────────────────
describe('D-12 final downside — engaged legs respond to delivered audience score', () => {
  // marketing=0 ⇒ no overexposure penalty ⇒ isolates the pure retention curve; flat appeal ⇒ WAS === v.
  const inp = makeReceptionInputs({})
  const engagedLegs = (was: number) => computeBoxOffice(flat(inp, was), ...common(inp, 0), flat(inp, was), true).legs
  const m0aLegs = (was: number) => computeBoxOffice(flat(inp, was), ...common(inp, 0), flat(inp, was), false).legs

  it('legs increase monotonically with WAS and are NOT pinned to a constant', () => {
    const curve = [30, 40, 46, 50, 55, 59, 65, 80].map(engagedLegs)
    for (let i = 1; i < curve.length; i++) expect(curve[i]!).toBeGreaterThan(curve[i - 1]!)
    // The owner's 2.82 collision was a coincidence, not a floor/plateau: distinct WAS → distinct legs.
    expect(engagedLegs(46)).not.toBeCloseTo(engagedLegs(55), 2)
  })

  it('a genuine bomb (very low WAS) opens and DIES — legs near the low engaged floor, well under the M0A 1.8', () => {
    expect(engagedLegs(20)).toBeLessThan(1.6) // a true bomb barely holds
    expect(engagedLegs(20)).toBeGreaterThanOrEqual(TUNING.LEGS_MIN_ENGAGED - 0.001)
    // The M0A curve keeps its frozen 1.8 floor; the engaged reshape is what allows collapse.
    expect(m0aLegs(20)).toBeGreaterThan(engagedLegs(20))
    expect(m0aLegs(20)).toBeGreaterThanOrEqual(TUNING.LEGS_MIN - 0.001)
  })

  it('weak delivery retains materially worse than strong delivery (word of mouth)', () => {
    const weak = engagedLegs(42)
    const strong = engagedLegs(66)
    expect(strong - weak).toBeGreaterThan(0.5) // a real retention gap, not the compressed linear curve
  })
})

// ── Weak-film commercial risk (forecast truth) ────────────────────────────────
describe('D-12 final downside — the weakest legal package carries real downside', () => {
  const weakTalent = (role: 'writer' | 'director' | 'actor') => makeTalent({ role, skill: 22, fame: 4 })
  function weakInputs(negMult: number) {
    // A commercially-compatible ordinary shape, the weakest legal talent, small marketing, and the
    // owner's GENEROUS Production Budget. requiredNegative = base × budgetDemand × era.
    const se = makeShapeEffects({ budgetDemandMultiplier: 1.05 })
    const base = makeReceptionInputs({ shapeEffects: se })
    const req = base.concept.baseNegativeCost * se.budgetDemandMultiplier * base.era.costScale
    return makeReceptionInputs({
      shapeEffects: se,
      writer: weakTalent('writer'),
      director: weakTalent('director'),
      cast: { lead: weakTalent('actor'), antagonist: weakTalent('actor'), support: weakTalent('actor') },
      budget: makeBudget(Math.round(req * negMult), 100_000),
    })
  }
  const ctx = (inp: ReturnType<typeof makeReceptionInputs>) => ({
    seed: 'weak', productionId: 'p', directorId: inp.director.id, releasedFilms: [], concepts: [inp.concept],
    salaries: 0, saturateFame: true, engaged: true,
  })

  it('the forecast DOWNSIDE crosses below zero — it is no longer a guaranteed profit', () => {
    const inp = weakInputs(1.25) // Generous budget (the owner's Letters case)
    const range = forecastProfitRange(inp, ctx(inp))
    expect(range.profit.low).toBeLessThan(0) // downside contribution is negative
    // Expected contribution is not a large guaranteed profit relative to the commitment.
    expect(range.profit.expected).toBeLessThan(0.4 * range.committedCost)
  })

  it('Generous Production Budget cannot erase weak casting/Fit — downside stays negative', () => {
    const lean = forecastProfitRange(weakInputs(0.75), ctx(weakInputs(0.75)))
    const generous = forecastProfitRange(weakInputs(1.25), ctx(weakInputs(1.25)))
    // More money helps realization a little, but the weak package still has a negative downside.
    expect(generous.profit.low).toBeLessThan(0)
    expect(lean.profit.low).toBeLessThan(0)
  })

  it("Letters-from-Vineyard profile (mixed OVR/Fit, unproven) — forecast downside crosses zero", () => {
    // The owner's exact weak legal package: low, mixed OVR across roles, unproven, Generous budget, small
    // marketing. At greenlight the studio does not know future delivery, so the DOWNSIDE must be negative
    // (it must not appear guaranteed profitable) even though a favorable seed can still profit.
    const t = (role: 'writer' | 'director' | 'actor', skill: number) => makeTalent({ role, skill, fame: 4 })
    const se = makeShapeEffects({ budgetDemandMultiplier: 1.0 })
    const base = makeReceptionInputs({ shapeEffects: se })
    const req = base.concept.baseNegativeCost * se.budgetDemandMultiplier * base.era.costScale
    const inp = makeReceptionInputs({
      shapeEffects: se,
      writer: t('writer', 17),
      director: t('director', 34),
      cast: { lead: t('actor', 27), antagonist: t('actor', 36), support: t('actor', 44) },
      budget: makeBudget(Math.round(req * 1.25), 100_000), // Generous budget, Small marketing
    })
    const range = forecastProfitRange(inp, {
      seed: 'letters', productionId: 'p', directorId: inp.director.id, releasedFilms: [], concepts: [inp.concept],
      salaries: 0, saturateFame: true, engaged: true,
    })
    expect(range.profit.low).toBeLessThan(0) // downside is genuinely negative — NOT a guaranteed profit
    // Generous funding did not erase the talent/Fit risk: the downside is a meaningful loss.
    expect(range.profit.low).toBeLessThan(-0.1 * range.committedCost)
  })

  it('a STRONGER package (same concept, competent talent) has materially better economics', () => {
    const strongTalent = (role: 'writer' | 'director' | 'actor') => makeTalent({ role, skill: 70, fame: 25 })
    const se = makeShapeEffects({ budgetDemandMultiplier: 1.05 })
    const base = makeReceptionInputs({ shapeEffects: se })
    const req = base.concept.baseNegativeCost * se.budgetDemandMultiplier * base.era.costScale
    const strong = makeReceptionInputs({
      shapeEffects: se,
      writer: strongTalent('writer'), director: strongTalent('director'),
      cast: { lead: strongTalent('actor'), antagonist: strongTalent('actor'), support: strongTalent('actor') },
      budget: makeBudget(Math.round(req), 400_000),
    })
    const strongRange = forecastProfitRange(strong, ctx(strong))
    const weakRange = forecastProfitRange(weakInputs(1.25), ctx(weakInputs(1.25)))
    // Stronger delivery → stronger expected economics AND a higher downside floor than the weak film.
    expect(strongRange.profit.expected).toBeGreaterThan(weakRange.profit.expected)
    expect(strongRange.profit.low).toBeGreaterThan(weakRange.profit.low)
  })
})
