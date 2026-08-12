// ── D-17A INDEPENDENT ADVERSARIAL TESTS — E. DISCOVERY EXPOSURE, SAME RULE ────
// Contract T6: "Fix the proxy that silently misses exposed packages by computing exposure
// with the same rule `resolveReception` uses (Lesson AC: same-rule parity, not a parallel
// approximation)." §6 fixes the operands: `computeBoxOffice(...).awarenessFactor` +
// `forecastCenters(...).starDraw` (the LINEAR draw, not `starDrawOpening`).
//
// The reference below is NOT read off filmPackage.ts. It is reception.ts's OWN rule
// (reception.ts:633-642), reassembled here from EXPORTED engine functions only:
//     reachSupport      = clamp(DISC_SUPPORT_AWARENESS·awarenessFactor
//                             + DISC_SUPPORT_STAR·clamp(starDraw/100,0,1), 0, 1)
//     discSupportShortfall = clamp((DISC_SUPPORT_THRESHOLD − reachSupport)
//                                  / DISC_SUPPORT_THRESHOLD, 0, 1)
//     exposed ⇔ discSupportShortfall > 0
// The RETIRED proxy (filmPackage.ts @ the D-16 base) is reproduced verbatim too, so the
// two fixtures below can be shown to be cases where it and the engine genuinely disagree
// — the packages it silently called supported.

import { describe, expect, it } from 'vitest'
import {
  clamp,
  computeBoxOffice,
  discoveryExposure,
  forecastCenters,
  resolveReception,
  RngStream,
  TUNING,
} from '../src/core/index.js'
import type { CastSlot, ReceptionInputs, Standing, Talent } from '../src/core/index.js'
import { makeBudget, makeReceptionInputs, makeTalent } from './_fixtures.js'

// ── the engine's own rule, on the engine's own exported operands ──────────────
function engineReachSupport(inp: ReceptionInputs): { reachSupport: number; shortfall: number; exposed: boolean } {
  const fc = forecastCenters(inp, true, true) // saturateFame + engaged: the production regime
  const box = computeBoxOffice(
    fc.centers,
    inp.market.segments,
    inp.market.baseMarketValue,
    inp.standing,
    inp.promise,
    inp.budget,
    inp.shapeEffects,
    fc.centersOpening,
    true, // engaged
    0, // no realized discovery draw — a read-model may never see one
    fc.starDraw, // the LINEAR star draw, exactly as resolveReception threads it
  )
  const reachSupport = clamp(
    TUNING.DISC_SUPPORT_AWARENESS * box.awarenessFactor +
      TUNING.DISC_SUPPORT_STAR * clamp(fc.starDraw / 100, 0, 1),
    0,
    1,
  )
  const shortfall = clamp(
    (TUNING.DISC_SUPPORT_THRESHOLD - reachSupport) / TUNING.DISC_SUPPORT_THRESHOLD,
    0,
    1,
  )
  return { reachSupport, shortfall, exposed: shortfall > 0 }
}

// ── the RETIRED proxy (filmPackage.ts @ d17-economy-truth-equilibrium base c679f88) ──
function retiredProxy(inp: ReceptionInputs): { reachSupport: number; exposed: boolean } {
  const fames = Object.values(inp.cast).map((t) => t.fame)
  const avgFame = fames.length ? fames.reduce((a, b) => a + b, 0) / fames.length : 0
  const small = inp.budget.marketing < TUNING.MARKETING_HALF_SATURATION
  const large = inp.budget.marketing >= 2 * TUNING.MARKETING_HALF_SATURATION
  const mktBump = small ? 0 : large ? 0.15 : 0.08 // the flat, capacity-blind bump
  const reachSupport = clamp(
    TUNING.DISC_SUPPORT_AWARENESS * clamp(inp.standing.audienceAwareness / 100 + mktBump, 0, 1) +
      TUNING.DISC_SUPPORT_STAR * clamp(avgFame / 100, 0, 1),
    0,
    1,
  )
  const shortfall = clamp(
    (TUNING.DISC_SUPPORT_THRESHOLD - reachSupport) / TUNING.DISC_SUPPORT_THRESHOLD,
    0,
    1,
  )
  return { reachSupport, exposed: shortfall > 0 }
}

// ── fixtures ─────────────────────────────────────────────────────────────────
type PkgSpec = {
  awareness: number
  marketing: number
  /** cast fame by billing: lead, antagonist, support. */
  fames: readonly [number, number, number]
}

function pkg(o: PkgSpec): ReceptionInputs {
  return makeReceptionInputs({
    standing: { audienceAwareness: o.awareness, industryPrestige: 40, commercialConfidence: 50 } as Standing,
    budget: makeBudget(4_000_000, o.marketing),
    cast: {
      lead: makeTalent({ role: 'actor', skill: 50, fame: o.fames[0] }),
      antagonist: makeTalent({ role: 'actor', skill: 50, fame: o.fames[1] }),
      support: makeTalent({ role: 'actor', skill: 50, fame: o.fames[2] }),
    } as Record<CastSlot, Talent>,
  })
}

const ENGAGED = { saturateFame: true, engaged: true } as const

// (i) a famous SUPPORT player carrying an unknown lead: the unweighted cast mean looks
//     healthy, but CAST_WEIGHT (lead 1.0 / antagonist 0.6 / support 0.35) says the film
//     has almost no star draw where it counts.
const TOP_HEAVY_SUPPORT = { awareness: 55, marketing: 400_000, fames: [2, 2, 99] } as const
// (ii) a low-awareness studio buying a MAXIMUM campaign: the proxy's flat +0.15 bump says
//     the spend bought reach; the engine's awareness-conditioned capacity says most of it
//     never converts.
const CAPACITY_COLLAPSED = { awareness: 45, marketing: 2_000_000, fames: [30, 30, 30] } as const

// ═════════════════════════════════════════════════════════════════════════════
describe('D-17A/E — discoveryExposure agrees with the engine RULE, not an approximation', () => {
  it.each([
    ['top-heavy support cast', TOP_HEAVY_SUPPORT],
    ['capacity-collapsed max campaign', CAPACITY_COLLAPSED],
  ])('%s: the retired proxy said SUPPORTED, the engine rule says EXPOSED', (_label, spec) => {
    const inp = pkg(spec)
    const truth = engineReachSupport(inp)
    const proxy = retiredProxy(inp)

    // the adversarial precondition: the two genuinely disagree on this package
    expect(proxy.exposed).toBe(false)
    expect(truth.exposed).toBe(true)

    const view = discoveryExposure(inp, ENGAGED)
    expect(view.exposed).toBe(truth.exposed) // the read-model sides with the engine
    expect(view.reachSupport).toBe(truth.reachSupport)
    expect(view.shortfall).toBe(truth.shortfall)
  })

  it('matches the engine rule EXACTLY across a swept grid of awareness × marketing × fame shapes', () => {
    const shapes: (readonly [number, number, number])[] = [
      [0, 0, 0],
      [2, 2, 99],
      [99, 2, 2],
      [30, 30, 30],
      [60, 10, 10],
      [10, 10, 60],
      [80, 80, 80],
      [45, 20, 5],
    ]
    for (const awareness of [0, 15, 35, 55, 75, 95]) {
      for (const marketing of [0, 100_000, 400_000, 1_000_000, 2_000_000]) {
        for (const fames of shapes) {
          const inp = pkg({ awareness, marketing, fames })
          const truth = engineReachSupport(inp)
          const view = discoveryExposure(inp, ENGAGED)
          expect(view.reachSupport).toBe(truth.reachSupport)
          expect(view.shortfall).toBe(truth.shortfall)
          expect(view.exposed).toBe(truth.exposed)
          expect(view.exposed).toBe(view.shortfall > 0) // exposure IS the sign of the shortfall
        }
      }
    }
  })

  it('the operand really is the CAST_WEIGHTED draw: moving fame from support to lead changes exposure', () => {
    const famousSupport = pkg({ awareness: 55, marketing: 400_000, fames: [2, 2, 99] })
    const famousLead = pkg({ awareness: 55, marketing: 400_000, fames: [99, 2, 2] })
    // identical unweighted cast mean, opposite billing
    const mean = (i: ReceptionInputs) => Object.values(i.cast).reduce((a, t) => a + t.fame, 0) / 3
    expect(mean(famousSupport)).toBe(mean(famousLead))
    expect(retiredProxy(famousSupport).reachSupport).toBe(retiredProxy(famousLead).reachSupport)

    const s = discoveryExposure(famousSupport, ENGAGED)
    const l = discoveryExposure(famousLead, ENGAGED)
    expect(l.reachSupport).toBeGreaterThan(s.reachSupport)
    expect(s.exposed).toBe(true)
    expect(l.exposed).toBe(false)
  })

  it('the awareness operand really is the awarenessFactor: a max campaign at low awareness stays exposed', () => {
    const low = pkg({ awareness: 8, marketing: 2_000_000, fames: [20, 20, 20] })
    const view = discoveryExposure(low, ENGAGED)
    expect(view.exposed).toBe(true)
    expect(retiredProxy(low).reachSupport).toBeGreaterThan(view.reachSupport) // the flat bump overstates
  })
})

describe('D-17A/E — the reported band is the governed clip, and no draw leaks into it', () => {
  it('floor/ceil are exactly TUNING.DISC_FLOOR / TUNING.DISC_CEIL on every package', () => {
    for (const spec of [TOP_HEAVY_SUPPORT, CAPACITY_COLLAPSED, { awareness: 90, marketing: 2_000_000, fames: [90, 90, 90] } as const]) {
      const view = discoveryExposure(pkg(spec), ENGAGED)
      expect(view.floor).toBe(TUNING.DISC_FLOOR)
      expect(view.ceil).toBe(TUNING.DISC_CEIL)
    }
  })

  it('is bounded and monotone in the three support channels', () => {
    const base = { awareness: 30, marketing: 100_000, fames: [10, 10, 10] } as const
    const b = discoveryExposure(pkg(base), ENGAGED)
    expect(b.reachSupport).toBeGreaterThanOrEqual(0)
    expect(b.reachSupport).toBeLessThanOrEqual(1)
    expect(b.shortfall).toBeGreaterThanOrEqual(0)
    expect(b.shortfall).toBeLessThanOrEqual(1)

    const moreAwareness = discoveryExposure(pkg({ ...base, awareness: 70 }), ENGAGED)
    const moreMarketing = discoveryExposure(pkg({ ...base, marketing: 1_000_000 }), ENGAGED)
    const moreStar = discoveryExposure(pkg({ ...base, fames: [80, 80, 80] }), ENGAGED)
    for (const better of [moreAwareness, moreMarketing, moreStar]) {
      expect(better.reachSupport).toBeGreaterThan(b.reachSupport)
      expect(better.shortfall).toBeLessThan(b.shortfall)
    }
  })

  it('is a pure read-model: no RNG, no realized draw, identical on repeated calls', () => {
    const inp = pkg(TOP_HEAVY_SUPPORT)
    const a = discoveryExposure(inp, ENGAGED)
    const b = discoveryExposure(inp, ENGAGED)
    expect(b).toEqual(a)

    // The realized release draws z from an isolated stream; the read-model must equal the
    // z = 0 centre and be unmoved by what the release would have drawn.
    const rel = resolveReception(inp, RngStream.fromSeed('adv-e-sim'), true, true, -2.5)
    const relCentre = resolveReception(inp, RngStream.fromSeed('adv-e-sim'), true, true, 0)
    expect(rel.opening).not.toBe(relCentre.opening) // the draw really does move the opening…
    expect(discoveryExposure(inp, ENGAGED)).toEqual(a) // …and the read-model never saw it
  })

  it('reports the same reachSupport the REALIZED reception computed, when perceived === actual', () => {
    // The fixtures' talent carry perceived === actual skills, so the forecast-side operands and
    // the realized-side operands are the same numbers — the same-rule identity is then testable
    // against resolveReception's OWN outputs, end to end.
    for (const spec of [TOP_HEAVY_SUPPORT, CAPACITY_COLLAPSED]) {
      const inp = pkg(spec)
      const realized = resolveReception(inp, RngStream.fromSeed('adv-e-realized'), true, true, 0)
      const realizedSupport = clamp(
        TUNING.DISC_SUPPORT_AWARENESS * realized.awarenessFactor +
          TUNING.DISC_SUPPORT_STAR * clamp(realized.starDraw / 100, 0, 1),
        0,
        1,
      )
      expect(discoveryExposure(inp, ENGAGED).reachSupport).toBe(realizedSupport)
    }
  })
})
