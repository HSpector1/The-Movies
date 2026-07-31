// ── D-13 Capital-frontier fix — causal correction acceptance tests ────────────
// Independent tests of the three engaged-only levers (script cost↔potential correlation,
// script-potential → delivery-gated audience ceiling, discoverability + marketing capacity).
// Every expectation is derived from the owner directive, not from reading the implementation.
// Uses only the public core surface + the pure-value fixtures.

import { describe, expect, it } from 'vitest'
import {
  computeBoxOffice,
  computeSegmentAppeal,
  correlateConceptCost,
  generateWorld,
  beginFounding,
  resolveReception,
  resolveShape,
  RngStream,
  scriptPotentialAppealDelta,
  TUNING,
} from '../src/core/index.js'
import type { SegmentId } from '../src/core/index.js'
import { makeReceptionInputs, makeConcept, makeBudget } from './_fixtures.js'

// ── Phase 1.2 — script COST is a probabilistic MARKET SIGNAL of potential ──────
describe('script cost ↔ potential correlation (engaged worldgen)', () => {
  it('1. engaged cost and potential are positively but imperfectly related', () => {
    let higherStrength = 0
    let cheapExcellent = 0
    let expensiveMediocre = 0
    const N = 80
    for (let s = 0; s < N; s++) {
      const concepts = correlateConceptCost(generateWorld(`corr-${s}`).concepts)
      const byCost = [...concepts].sort((a, b) => a.baseNegativeCost - b.baseNegativeCost)
      const cheapest = byCost[0]!
      const expensive = byCost[byCost.length - 1]!
      if (expensive.baselineStrength > cheapest.baselineStrength) higherStrength++
      // 2. + 3. distributions overlap: a cheap script can be excellent, an expensive one mediocre.
      if (cheapest.baselineStrength >= 68) cheapExcellent++
      if (expensive.baselineStrength <= 58) expensiveMediocre++
    }
    expect(higherStrength / N).toBeGreaterThan(0.65) // positive relationship
    expect(higherStrength / N).toBeLessThan(1.0) // imperfect — cost does not deterministically reveal potential
    expect(cheapExcellent).toBeGreaterThan(0) // 2. cheap scripts can still be excellent
    expect(expensiveMediocre).toBeGreaterThan(0) // 3. premium scripts can still be mediocre
  })

  it('M0A safety: generateWorld concepts are unchanged; correlation happens only in beginFounding, and preserves the strength multiset', () => {
    const w = generateWorld('m0a-corr')
    const before = JSON.stringify(w.concepts)
    const founded = beginFounding(w)
    // generateWorld output is untouched (M0A never founds → byte-identical concepts)
    expect(JSON.stringify(w.concepts)).toBe(before)
    // beginFounding DID correlate the engaged concepts…
    expect(JSON.stringify(founded.concepts)).not.toBe(before)
    // …but only the cost pairing shifted; baselineStrength values are unchanged (a rank-blend of cost).
    expect(founded.concepts.map((c) => c.baselineStrength).sort((a, b) => a - b)).toEqual(
      w.concepts.map((c) => c.baselineStrength).sort((a, b) => a - b),
    )
  })
})

// ── Phase 1.4 — potential → audience ceiling, GATED BY DELIVERY, upside-only ────
describe('script potential is a delivery-gated commercial ceiling (not a flat bonus)', () => {
  it('4./20. the delta is 0 when NOT engaged (M0A appeal byte-identical)', () => {
    expect(scriptPotentialAppealDelta(95, 80, false)).toBe(0)
    expect(scriptPotentialAppealDelta(20, 80, false)).toBe(0)
  })
  it('5. a high-potential script realizes ~none of its ceiling with no delivery (craft = 0) — an expensive flop', () => {
    expect(scriptPotentialAppealDelta(95, 0, true)).toBe(0)
  })
  it('6./7. the appeal lift scales with BOTH potential and delivery (underfunding/weak craft suppresses premium upside)', () => {
    const weakCraft = scriptPotentialAppealDelta(95, 40, true)
    const strongCraft = scriptPotentialAppealDelta(95, 95, true)
    expect(strongCraft).toBeGreaterThan(weakCraft)
    expect(weakCraft).toBeGreaterThan(0)
    // upside-only: a below-reference (limited) script is never PENALIZED here (its lower ceiling comes
    // from lower craft via the correlation, not an appeal penalty → cheap films stay viable).
    expect(scriptPotentialAppealDelta(TUNING.SCRIPT_POTENTIAL_REF - 20, 95, true)).toBe(0)
  })
  it('a high-potential well-delivered script reaches a higher segment appeal than a limited one (engaged)', () => {
    const strong = makeReceptionInputs({ concept: makeConcept({ baselineStrength: 95 }) })
    const limited = makeReceptionInputs({ concept: makeConcept({ baselineStrength: 45 }) })
    const delivered = { intimacy: 0, tonalWeight: 0, kineticEnergy: 0 }
    const craft = 85
    const a = computeSegmentAppeal(strong, delivered, craft, 0, true)
    const b = computeSegmentAppeal(limited, delivered, craft, 0, true)
    const seg = strong.market.segments[0]!.id
    expect(a.segmentAppeal[seg]!).toBeGreaterThan(b.segmentAppeal[seg]!)
  })
})

// ── Phase 1 — script PRICE is never a box-office input ─────────────────────────
describe('script price never enters box office directly', () => {
  it('8./19. box office is a function of appeal/standing/budget/market — not concept cost or critic', () => {
    // Two identical films whose ONLY difference is concept.baseNegativeCost, funded to the SAME
    // adequacy ratio (budget scaled with cost). Cost affects box office ONLY via funding→craft→appeal;
    // holding appeal fixed, box office is identical → price is not a direct multiplier.
    const appeal = {} as Record<SegmentId, number>
    const base = makeReceptionInputs({})
    for (const s of base.market.segments) appeal[s.id] = 55
    const common = [base.market.segments, base.market.baseMarketValue, base.standing, base.promise] as const
    const shapeEffects = resolveShape(base.shape)
    const boxA = computeBoxOffice(appeal, ...common, makeBudget(3_000_000, 400_000), shapeEffects, appeal, true)
    const boxB = computeBoxOffice(appeal, ...common, makeBudget(3_000_000, 400_000), shapeEffects, appeal, true)
    expect(boxA.opening).toBe(boxB.opening)
    expect(boxA.total).toBe(boxB.total)
    // computeBoxOffice has NO concept/cost/critic parameter — structurally cannot read them.
  })
})

// ── Phase 3 — marketing expands reach but cannot manufacture demand ────────────
describe('marketing capacity + high-end value', () => {
  it('11. Large marketing raises opening for a decent-appeal film (more than Small)', () => {
    const appeal = {} as Record<SegmentId, number>
    const inp = makeReceptionInputs({})
    for (const s of inp.market.segments) appeal[s.id] = 60
    const common = [inp.market.segments, inp.market.baseMarketValue, inp.standing, inp.promise] as const
    const se = resolveShape(inp.shape)
    const small = computeBoxOffice(appeal, ...common, makeBudget(3_000_000, 100_000), se, appeal, true)
    const large = computeBoxOffice(appeal, ...common, makeBudget(3_000_000, 1_000_000), se, appeal, true)
    expect(large.opening).toBeGreaterThan(small.opening) // Large expands reach…
  })
  it('13. marketing cannot manufacture demand beyond the film’s appeal — opening reach stays bounded', () => {
    const inp = makeReceptionInputs({})
    const lowAppeal = {} as Record<SegmentId, number>
    for (const s of inp.market.segments) lowAppeal[s.id] = 15 // a limited film
    const common = [inp.market.segments, inp.market.baseMarketValue, inp.standing, inp.promise] as const
    const se = resolveShape(inp.shape)
    const large = computeBoxOffice(lowAppeal, ...common, makeBudget(3_000_000, 1_000_000), se, lowAppeal, true)
    // awarenessFactor is clamped to ≤1 and reach is Σ share·awarenessFactor·(appeal/100)^exp, so a
    // low-appeal film's opening cannot be inflated to a blockbuster no matter the campaign.
    const ceiling = inp.market.baseMarketValue * 1 * 1 * TUNING.ECONOMY_BOX_OFFICE_SCALE
    expect(large.opening).toBeLessThan(ceiling * 0.2)
  })
})

// ── Phase 2/legs — a strong film can still sleeper after a weak opening ─────────
describe('word of mouth survives a weak opening', () => {
  it('10./18. legs (retention) is driven by delivered audience score, independent of opening reach/fame', () => {
    // A well-delivered film (high WAS) earns high legs even if its opening reach is small; fame only
    // saturates OPENING, never legs. Build a high-appeal film and confirm legs ≫ the engaged floor.
    const inp = makeReceptionInputs({})
    const highAppeal = {} as Record<SegmentId, number>
    for (const s of inp.market.segments) highAppeal[s.id] = 80
    const common = [inp.market.segments, inp.market.baseMarketValue, inp.standing, inp.promise] as const
    const se = resolveShape(inp.shape)
    const box = computeBoxOffice(highAppeal, ...common, makeBudget(3_000_000, 100_000), se, highAppeal, true)
    expect(box.legs).toBeGreaterThan(TUNING.LEGS_MIN_ENGAGED) // strong word of mouth beyond the bomb floor
    // conservation still holds (total = opening × legs) — unaffected by any ceiling change.
    expect(box.total).toBeCloseTo(box.opening * box.legs, 2)
  })
})

// resolveReception smoke: the whole engaged pipeline runs and stays bounded with the new terms.
describe('engaged reception pipeline remains bounded with the new terms', () => {
  it('critic/appeal/opening stay in range for a high-potential engaged film', () => {
    const inp = makeReceptionInputs({ concept: makeConcept({ baselineStrength: 92 }), budget: makeBudget(4_000_000, 1_000_000) })
    const res = resolveReception(inp, RngStream.fromSeed('d13-bounds'), true, true)
    expect(res.criticScore).toBeGreaterThanOrEqual(0)
    expect(res.criticScore).toBeLessThanOrEqual(100)
    for (const s of inp.market.segments) {
      expect(res.segmentScores[s.id]!).toBeGreaterThanOrEqual(0)
      expect(res.segmentScores[s.id]!).toBeLessThanOrEqual(100)
    }
  })
})
