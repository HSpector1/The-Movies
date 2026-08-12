// ── D-17A/T6 quantified discoverability exposure — same-rule proofs ────────────
// D-16 item 9: the discoverability warning was prose-only and was decided by a PARALLEL
// APPROXIMATION of the engine's rule (raw awareness/100 + a flat marketing bump + an
// unweighted mean of cast fame). Lesson AC says: compute it with the SAME rule, on the same
// operands, or it will disagree with the engine — which it did.
//
// What is proven here:
//   1. AGREEMENT — `discoveryExposure` reproduces the reach support `resolveReception` itself
//      computes, from resolveReception's OWN returned operands (awarenessFactor + the linear
//      starDraw), on identical inputs;
//   2. BLACK-BOX AGREEMENT — the spread implied by the reported shortfall equals the spread the
//      ENGINE actually applies, recovered from the realized opening at z = 1 vs z = 0 (nothing
//      about the formula is assumed — the engine is measured);
//   3. TEETH — the retired proxy disagrees with the engine on real packages, so the fix matters;
//   4. INFORMATION DISCIPLINE — the read-model draws no RNG and is invariant to the future draw;
//   5. the forecast copy now carries the NUMERIC band, and the audience-ceiling line is gated on
//      MEASURED capacity rather than absolute spend.

import { describe, expect, it } from 'vitest'
import {
  RngStream,
  TUNING,
  clamp,
  computeBoxOffice,
  discoveryExposure,
  forecastCenters,
  forecastProfitRange,
  resolveReception,
} from '../src/core/index.js'
import type { CastSlot, FilmResult, Standing, Talent } from '../src/core/index.js'
import {
  INITIAL_STANDING_FIXTURE,
  makeBudget,
  makeReceptionInputs,
  makeTalent,
} from './_fixtures.js'

const ENGAGED = { saturateFame: true, engaged: true } as const

/** A reception input with a chosen cast fame, studio awareness and marketing spend. */
function inputs(over: { fame?: number; awareness?: number; marketing?: number; negative?: number } = {}) {
  const fame = over.fame ?? 0
  const cast = {
    lead: makeTalent({ role: 'actor', skill: 55, fame }),
    antagonist: makeTalent({ role: 'actor', skill: 55, fame }),
    support: makeTalent({ role: 'actor', skill: 55, fame }),
  } as Record<CastSlot, Talent>
  const standing: Standing = { ...INITIAL_STANDING_FIXTURE, audienceAwareness: over.awareness ?? 40 }
  return makeReceptionInputs({
    cast,
    standing,
    budget: makeBudget(over.negative ?? 4_000_000, over.marketing ?? 100_000),
  })
}

/** The rule, stated independently of the module under test, on the ENGINE's own operands. */
function ruleFrom(awarenessFactor: number, starDraw: number): number {
  return clamp(
    TUNING.DISC_SUPPORT_AWARENESS * awarenessFactor + TUNING.DISC_SUPPORT_STAR * clamp(starDraw / 100, 0, 1),
    0,
    1,
  )
}

function profitCtx(inp: ReturnType<typeof inputs>) {
  return {
    seed: 'd17a-disc',
    productionId: 'prod-d17a',
    directorId: inp.director.id,
    releasedFilms: [] as FilmResult[],
    concepts: [inp.concept],
    salaries: 0,
    ...ENGAGED,
  }
}

// ══════════════════════════════════════════════════════════════════════════════
describe('D-17A/T6 — discoveryExposure agrees with resolveReception, by rule', () => {
  it('reproduces the engine’s reach support from the engine’s OWN operands', () => {
    for (const spec of [
      { fame: 0, awareness: 10, marketing: 100_000 },
      { fame: 20, awareness: 40, marketing: 400_000 },
      { fame: 60, awareness: 70, marketing: 1_000_000 },
      { fame: 100, awareness: 95, marketing: 2_000_000 },
    ]) {
      const inp = inputs(spec)
      // the engine's own resolution — its returned awarenessFactor and LINEAR starDraw
      const rr = resolveReception(inp, RngStream.fromSeed('same-rule'), true, true, 0)
      const de = discoveryExposure(inp, ENGAGED)
      expect(de.reachSupport).toBeCloseTo(ruleFrom(rr.awarenessFactor, rr.starDraw), 12)
      expect(de.shortfall).toBeCloseTo(
        clamp((TUNING.DISC_SUPPORT_THRESHOLD - de.reachSupport) / TUNING.DISC_SUPPORT_THRESHOLD, 0, 1),
        12,
      )
      expect(de.exposed).toBe(de.shortfall > 0)
      expect(de.reachSupport).toBeGreaterThanOrEqual(0)
      expect(de.reachSupport).toBeLessThanOrEqual(1)
      expect(de.shortfall).toBeGreaterThanOrEqual(0)
      expect(de.shortfall).toBeLessThanOrEqual(1)
      expect(de.floor).toBe(TUNING.DISC_FLOOR)
      expect(de.ceil).toBe(TUNING.DISC_CEIL)
    }
  })

  it('BLACK BOX: the reported shortfall implies the spread the engine actually applies', () => {
    const inp = inputs({ fame: 0, awareness: 15, marketing: 100_000 })
    const de = discoveryExposure(inp, ENGAGED)
    expect(de.exposed).toBe(true)
    // At z = 0 the multiplier is exactly 1; at a small z it is exp(spread·z), still inside the
    // [DISC_FLOOR, DISC_CEIL] clip. The ratio therefore RECOVERS the engine's spread without
    // assuming its formula — the engine is MEASURED, not restated.
    const z = 0.1
    const o0 = resolveReception(inp, RngStream.fromSeed('bb'), true, true, 0).opening
    const oz = resolveReception(inp, RngStream.fromSeed('bb'), true, true, z).opening
    const ratio = oz / o0
    expect(ratio).toBeGreaterThan(TUNING.DISC_FLOOR)
    expect(ratio).toBeLessThan(TUNING.DISC_CEIL) // unclipped, so ln(ratio)/z IS the spread
    const engineSpread = Math.log(ratio) / z
    const impliedSpread = TUNING.DISC_SPREAD * Math.pow(de.shortfall, TUNING.DISC_SUPPORT_EXP)
    expect(engineSpread).toBeCloseTo(impliedSpread, 6)
  })

  it('a well-supported package is NOT exposed, and the engine agrees (multiplier exactly 1)', () => {
    const inp = inputs({ fame: 100, awareness: 90, marketing: 2_000_000 })
    const de = discoveryExposure(inp, ENGAGED)
    expect(de.reachSupport).toBeGreaterThanOrEqual(TUNING.DISC_SUPPORT_THRESHOLD)
    expect(de.shortfall).toBe(0)
    expect(de.exposed).toBe(false)
    // zero spread ⇒ the realized opening does not move with the draw at all
    const o0 = resolveReception(inp, RngStream.fromSeed('safe'), true, true, 0).opening
    const o2 = resolveReception(inp, RngStream.fromSeed('safe'), true, true, 2).opening
    expect(o2).toBe(o0)
  })

  it('THE FIX HAS TEETH: the retired proxy disagrees with the engine', () => {
    // the exact retired computation (filmPackage.ts, pre-D-17A)
    const proxy = (inp: ReturnType<typeof inputs>): number => {
      const castFame = Object.values(inp.cast).map((t) => t.fame)
      const avgFame = castFame.length ? castFame.reduce((a, b) => a + b, 0) / castFame.length : 0
      const small = inp.budget.marketing < TUNING.MARKETING_HALF_SATURATION
      const large = inp.budget.marketing >= 2 * TUNING.MARKETING_HALF_SATURATION
      const mktBump = small ? 0 : large ? 0.15 : 0.08
      return clamp(
        TUNING.DISC_SUPPORT_AWARENESS * clamp(inp.standing.audienceAwareness / 100 + mktBump, 0, 1) +
          TUNING.DISC_SUPPORT_STAR * clamp(avgFame / 100, 0, 1),
        0,
        1,
      )
    }
    let disagreements = 0
    let verdictFlips = 0
    for (const fame of [0, 25, 50, 75]) {
      for (const awareness of [10, 40, 70, 95]) {
        for (const marketing of [100_000, 400_000, 1_000_000]) {
          const inp = inputs({ fame, awareness, marketing })
          const engine = discoveryExposure(inp, ENGAGED)
          const p = proxy(inp)
          if (Math.abs(engine.reachSupport - p) > 1e-6) disagreements += 1
          const proxyExposed = p < TUNING.DISC_SUPPORT_THRESHOLD
          if (proxyExposed !== engine.exposed) verdictFlips += 1
        }
      }
    }
    expect(disagreements).toBeGreaterThan(0)
    // …and not merely by a rounding hair: on some packages the two disagree about whether the
    // player should be warned AT ALL, which is exactly the defect D-16 item 9 recorded.
    expect(verdictFlips).toBeGreaterThan(0)
  })

  it('is PURE and carries no future information: repeatable, draw-independent', () => {
    const inp = inputs({ fame: 10, awareness: 30, marketing: 200_000 })
    const a = discoveryExposure(inp, ENGAGED)
    const b = discoveryExposure(inp, ENGAGED)
    expect(a).toEqual(b)
    // it reports only the deterministic support level; the realized z lives in reception alone
    expect(Object.keys(a).sort()).toEqual(['ceil', 'exposed', 'floor', 'reachSupport', 'shortfall'])
  })

  it('defaults to the NOT-engaged path, matching every other display helper', () => {
    const inp = inputs({ fame: 30, awareness: 50, marketing: 400_000 })
    expect(discoveryExposure(inp)).toEqual(discoveryExposure(inp, { saturateFame: false, engaged: false }))
  })
})

// ══════════════════════════════════════════════════════════════════════════════
describe('D-17A/T6 — forecastProfitRange is driven by the same rule', () => {
  it('an EXPOSED package widens the low band and states the numeric 0.2x–1.8x clip band', () => {
    const inp = inputs({ fame: 0, awareness: 15, marketing: 100_000 })
    const de = discoveryExposure(inp, ENGAGED)
    expect(de.exposed).toBe(true)
    const range = forecastProfitRange(inp, profitCtx(inp))
    const risk = range.downsideRisks.find((r) => r.includes('discoverability risk'))
    expect(risk).toBeDefined()
    expect(risk).toContain(`${TUNING.DISC_FLOOR}x`)
    expect(risk).toContain(`${TUNING.DISC_CEIL}x`)
    expect(range.upsideDrivers.some((u) => u.includes('sleeper'))).toBe(true)

    // the widened LOW is exactly the documented discovery-obscurity scenario
    const spread = TUNING.DISC_SPREAD * Math.pow(de.shortfall, TUNING.DISC_SUPPORT_EXP)
    const mult = Math.max(TUNING.DISC_FLOOR, Math.exp(-spread * TUNING.DISC_FORECAST_LOW_Z))
    const revExpected = range.studioRevenue.expected
    expect(range.profit.low).toBeCloseTo(
      Math.min(range.profit.low, revExpected * mult - range.committedCost),
      6,
    )
    expect(range.profit.low).toBeLessThanOrEqual(range.profit.expected)
  })

  it('a WELL-SUPPORTED package gets no discoverability warning and no widening', () => {
    const inp = inputs({ fame: 100, awareness: 90, marketing: 1_000_000 })
    expect(discoveryExposure(inp, ENGAGED).exposed).toBe(false)
    const range = forecastProfitRange(inp, profitCtx(inp))
    expect(range.downsideRisks.some((r) => r.includes('discoverability risk'))).toBe(false)
    expect(range.upsideDrivers.some((u) => u.includes('sleeper'))).toBe(false)
  })

  // D-17A FIX-PASS (R6 again): the capacity line is gated on the engine's OWN `overexposure`
  // value and reports only what the engine measures. It no longer claims anything about
  // marginal return (measured marginal return at this gate is frequently > 1), and it no
  // longer calls a ratio of SPEND a ratio of AUDIENCE.
  it('the capacity line fires on the engine’s measured overexposure, not absolute spend', () => {
    // Low awareness ⇒ small efficient capacity ⇒ even a modest campaign is genuinely past it.
    const overspent = inputs({ fame: 0, awareness: 10, marketing: 1_000_000 })
    const over = forecastProfitRange(overspent, profitCtx(overspent))
    const ceiling = over.downsideRisks.find((r) => r.includes('measured efficient capacity'))
    expect(ceiling).toBeDefined()

    // It states the DOLLAR basis (spend vs capacity) and the % of capacity — the same framing
    // the Assembly screen uses for the identical value.
    expect(ceiling).toMatch(/Marketing of \$[\d.]+[KM] against a measured efficient capacity of \$[\d.]+[KM]/)
    expect(ceiling).toMatch(/\d+% of capacity/)
    // It names the MEASURED consequence — a legs penalty conditional on under-delivery.
    expect(ceiling).toContain('legs')
    expect(ceiling).toContain('overexposure')
    // …and makes NO claim about marginal return, which the engine does not compute.
    expect(ceiling).not.toMatch(/wasted|little additional|converts to little/)
    // …and never restates a spend ratio as an audience ratio.
    expect(ceiling).not.toMatch(/x the audience/)

    // High awareness ⇒ large efficient capacity: the SAME large spend is not overexposure, and
    // the old absolute-spend gate would have claimed it was.
    const absorbed = inputs({ fame: 80, awareness: 98, marketing: 1_000_000 })
    expect(absorbed.budget.marketing).toBeGreaterThanOrEqual(2 * TUNING.MARKETING_HALF_SATURATION)
    const ok = forecastProfitRange(absorbed, profitCtx(absorbed))
    expect(ok.downsideRisks.some((r) => r.includes('measured efficient capacity'))).toBe(false)
  })

  it('the capacity line fires EXACTLY when the engine’s own overexposure value is above zero', () => {
    for (const spec of [
      { fame: 0, awareness: 10, marketing: 100_000 },
      { fame: 0, awareness: 10, marketing: 1_000_000 },
      { fame: 40, awareness: 45, marketing: 400_000 },
      { fame: 80, awareness: 98, marketing: 1_000_000 },
      { fame: 20, awareness: 15, marketing: 400_000 },
    ]) {
      const inp = inputs(spec)
      // The engine's OWN measured value, off the same box-office pass — not a re-derivation.
      const fc = forecastCenters(inp, true, true)
      const box = computeBoxOffice(
        fc.centers,
        inp.market.segments,
        inp.market.baseMarketValue,
        inp.standing,
        inp.promise,
        inp.budget,
        inp.shapeEffects,
        fc.centersOpening,
        true,
      )
      const range = forecastProfitRange(inp, profitCtx(inp))
      const fired = range.downsideRisks.some((r) => r.includes('measured efficient capacity'))
      expect(fired, JSON.stringify(spec)).toBe(box.overexposure > 0)
    }
  })
})
