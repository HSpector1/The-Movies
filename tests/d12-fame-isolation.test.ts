// ── D-12 fame OPENING-REACH ISOLATION — explicit proof ────────────────────────
// The Hill saturation must govern ONLY the Fame-driven component of opening reach — never
// legs, audience response, or critic. This suite proves, for otherwise-identical inputs:
//   • saturated vs linear reception → legs, weightedAudienceScore, segmentScores, and
//     criticScore are BYTE-IDENTICAL; only `opening` (and hence `total`) changes;
//   • the opening-appeal channel (which the K constant modulates via fameReach) drives
//     `opening` but NOT `legs` — so changing K moves opening while legs stay fixed.
// Numeric K-sweep (25/35/50/65/80/100) is the balance harness's job (Stage A); this proves
// the STRUCTURAL isolation the sweep relies on.

import { describe, expect, it } from 'vitest'
import { computeBoxOffice, resolveReception, RngStream } from '../src/core/index.js'
import type { CastSlot, SegmentId, Talent } from '../src/core/index.js'
import { makeReceptionInputs, makeTalent } from './_fixtures.js'

function highFameInputs(fame: number) {
  const cast = {
    lead: makeTalent({ role: 'actor', skill: 55, fame }),
    antagonist: makeTalent({ role: 'actor', skill: 55, fame }),
    support: makeTalent({ role: 'actor', skill: 55, fame }),
  } as Record<CastSlot, Talent>
  return makeReceptionInputs({ cast })
}

describe('D-12: fame saturation changes OPENING but never legs / audience / critic', () => {
  it('a high-fame cast: saturated opening is LOWER, but legs/WAS/segments/critic are identical', () => {
    const inp = highFameInputs(90)
    const linear = resolveReception(inp, RngStream.fromSeed('iso'), false)
    const saturated = resolveReception(inp, RngStream.fromSeed('iso'), true)

    // Legs and its drivers are UNTOUCHED by the saturation.
    expect(saturated.legs).toBe(linear.legs)
    expect(saturated.weightedAudienceScore).toBe(linear.weightedAudienceScore)
    expect(saturated.segmentScores).toEqual(linear.segmentScores) // linear segment appeal
    expect(saturated.criticScore).toBe(linear.criticScore) // same sim draw, unchanged
    expect(saturated.starDraw).toBe(linear.starDraw) // stored/linear Star Power unchanged

    // Only OPENING changes — a high-fame roster saturates to LESS opening reach.
    expect(saturated.opening).toBeLessThan(linear.opening)
    expect(saturated.total).toBeCloseTo(saturated.opening * saturated.legs, 2)
    expect(saturated.total).toBeLessThan(linear.total) // total differs ONLY via opening
  })

  it('the effect flattens fame (below the K crossover, low fame saturates to MORE opening)', () => {
    const low = highFameInputs(20)
    const linear = resolveReception(low, RngStream.fromSeed('iso-low'), false)
    const saturated = resolveReception(low, RngStream.fromSeed('iso-low'), true)
    // fameReach(20)=0.29 > 20/100 → low-fame opening rises; legs still identical.
    expect(saturated.legs).toBe(linear.legs)
    expect(saturated.opening).toBeGreaterThan(linear.opening)
  })
})

describe('D-12: the opening-appeal channel (K-modulated) drives opening but not legs', () => {
  it('two different opening appeals (as two K values would produce) → same legs, different opening', () => {
    const inp = highFameInputs(50)
    const segs = inp.market.segments
    const legsAppeal = {} as Record<SegmentId, number>
    const openingHi = {} as Record<SegmentId, number>
    const openingLo = {} as Record<SegmentId, number>
    for (const s of segs) {
      legsAppeal[s.id] = 60 // the legs/audience appeal (fixed)
      openingHi[s.id] = 60 // as a large K (little saturation) would leave it
      openingLo[s.id] = 40 // as a small K (strong saturation) would lower it
    }
    const common = [segs, inp.market.baseMarketValue, inp.standing, inp.promise, inp.budget, inp.shapeEffects] as const
    const hi = computeBoxOffice(legsAppeal, ...common, openingHi)
    const lo = computeBoxOffice(legsAppeal, ...common, openingLo)

    expect(hi.legs).toBe(lo.legs) // legs depends ONLY on the (fixed) legs appeal
    expect(hi.weightedAudienceScore).toBe(lo.weightedAudienceScore)
    expect(lo.opening).toBeLessThan(hi.opening) // opening tracks the opening appeal (K)
    // When opening appeal === legs appeal (no saturation), opening is the legacy value.
    const legacy = computeBoxOffice(legsAppeal, ...common)
    expect(legacy.opening).toBe(hi.opening)
  })
})
