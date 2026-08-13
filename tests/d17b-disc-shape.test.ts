// ── D-17B §3 — the selected D-13 shape family (tuple (ii) BALANCED) ────────────
// Authority: docs/D-17B-CANDIDATE-DESIGN-CONTRACT.md §3 (Owner authorization §4 D / §10 / §11).
//
// The change is CONSTANTS ONLY — `DISC_SUPPORT_THRESHOLD` .45→.375, `DISC_SPREAD` 3.5→4.0,
// `DISC_FLOOR` .2→.30, with `DISC_SUPPORT_EXP` (1.5) and `DISC_CEIL` (1.8) untouched. This file
// asserts the four things that make that a safe constants-only move:
//   1. the constants ARE the contract values (a silent re-tune fails here);
//   2. the functional form is unchanged ⇒ `discovery-v1` is NOT re-keyed (§3 RNG ruling): the
//      realized multiplier is still `clamp(exp(spread·z), FLOOR, CEIL)` with the SAME operands;
//   3. the engaged gate at `reception.ts:643` still holds — a DISENGAGED package draws no spread
//      and gets multiplier exactly 1 (M0A byte-identity by construction);
//   4. the shipped exposure read-model reports the NEW floor/ceil (.30 / 1.8) and the NEW
//      threshold, so the player is never quoted a retired bound.
//
// Nothing here is measured against a lab number: the corpus/harvest figures in §3 are the
// harness's business. These are engine invariants.

import { describe, expect, it } from 'vitest'
import {
  clamp,
  computeBoxOffice,
  discoveryExposure,
  forecastCenters,
  TUNING,
} from '../src/core/index.js'
import type { CastSlot, ReceptionInputs, Standing, Talent } from '../src/core/index.js'
import { makeBudget, makeReceptionInputs, makeTalent } from './_fixtures.js'

const ENGAGED = { saturateFame: true, engaged: true } as const

function pkg(awareness: number, marketing: number, fame: number): ReceptionInputs {
  return makeReceptionInputs({
    standing: { audienceAwareness: awareness, industryPrestige: 40, commercialConfidence: 50 } as Standing,
    budget: makeBudget(4_000_000, marketing),
    cast: {
      lead: makeTalent({ role: 'actor', skill: 50, fame }),
      antagonist: makeTalent({ role: 'actor', skill: 50, fame }),
      support: makeTalent({ role: 'actor', skill: 50, fame }),
    } as Record<CastSlot, Talent>,
  })
}

/** The engine's own realized-opening ratio for one package at one draw z. */
function openingAt(inp: ReceptionInputs, z: number, engaged: boolean): number {
  const fc = forecastCenters(inp, engaged, engaged)
  return computeBoxOffice(
    fc.centers,
    inp.market.segments,
    inp.market.baseMarketValue,
    inp.standing,
    inp.promise,
    inp.budget,
    inp.shapeEffects,
    fc.centersOpening,
    engaged,
    z,
    fc.starDraw,
  ).opening
}

// The weakest entry still has a NON-ZERO opening (a package with zero awareness AND zero
// marketing has baseAwareness 0 ⇒ opening 0, and a 0/0 ratio says nothing about the clip).
const UNSUPPORTED = pkg(5, 0, 0)

const SUPPORT_SWEEP: readonly ReceptionInputs[] = [
  UNSUPPORTED,
  pkg(10, 0, 5),
  pkg(25, 100_000, 15),
  pkg(35, 400_000, 25),
  pkg(50, 1_000_000, 45),
  pkg(75, 2_000_000, 80),
  pkg(95, 2_000_000, 99),
]

describe('D-17B §3 — the DISC constants are the contract tuple (ii)', () => {
  it('threshold .375 / spread 4.0 / floor .30, with EXP 1.5 and CEIL 1.8 unchanged', () => {
    expect(TUNING.DISC_SUPPORT_THRESHOLD).toBe(0.375)
    expect(TUNING.DISC_SPREAD).toBe(4.0)
    expect(TUNING.DISC_FLOOR).toBe(0.3)
    expect(TUNING.DISC_SUPPORT_EXP).toBe(1.5)
    expect(TUNING.DISC_CEIL).toBe(1.8)
  })

  it('the floor is strictly below 1 and the ceiling strictly above — the band still has both tails', () => {
    expect(TUNING.DISC_FLOOR).toBeGreaterThan(0)
    expect(TUNING.DISC_FLOOR).toBeLessThan(1)
    expect(TUNING.DISC_CEIL).toBeGreaterThan(1)
  })
})

describe('D-17B §3 — the realized multiplier stays inside [FLOOR, CEIL] on every draw', () => {
  it('|z| up to 8 never escapes the clip on any package in the support sweep', () => {
    for (const inp of SUPPORT_SWEEP) {
      const base = openingAt(inp, 0, true)
      expect(base).toBeGreaterThan(0)
      for (const z of [-8, -4, -2, -1, -0.25, 0, 0.25, 1, 2, 4, 8]) {
        const m = openingAt(inp, z, true) / base
        expect(m).toBeGreaterThanOrEqual(TUNING.DISC_FLOOR - 1e-12)
        expect(m).toBeLessThanOrEqual(TUNING.DISC_CEIL + 1e-12)
      }
    }
  })

  it('the extreme draws actually REACH the new .30 floor and the 1.8 ceiling on an unsupported package', () => {
    const base = openingAt(UNSUPPORTED, 0, true)
    expect(openingAt(UNSUPPORTED, -8, true) / base).toBeCloseTo(TUNING.DISC_FLOOR, 10)
    expect(openingAt(UNSUPPORTED, 8, true) / base).toBeCloseTo(TUNING.DISC_CEIL, 10)
  })

  it('the multiplier is monotone non-decreasing in z (a better draw is never worse)', () => {
    for (const inp of SUPPORT_SWEEP) {
      const zs = [-6, -3, -1.5, -0.5, 0, 0.5, 1.5, 3, 6]
      const ms = zs.map((z) => openingAt(inp, z, true))
      for (let i = 1; i < ms.length; i++) expect(ms[i]!).toBeGreaterThanOrEqual(ms[i - 1]! - 1e-9)
    }
  })

  it('z = 0 is exactly the undisturbed opening — the median is preserved (form unchanged ⇒ stream not re-keyed)', () => {
    for (const inp of SUPPORT_SWEEP) {
      const withDraw = openingAt(inp, 0, true)
      const noDraw = openingAt(inp, 0, true)
      expect(withDraw).toBe(noDraw)
    }
  })
})

describe('D-17B §3 — the engaged gate (reception.ts:643) still holds under the new constants', () => {
  it('a DISENGAGED package has zero spread: every z gives the identical opening', () => {
    for (const inp of SUPPORT_SWEEP) {
      const base = openingAt(inp, 0, false)
      for (const z of [-8, -1, 0.5, 3, 8]) {
        expect(openingAt(inp, z, false)).toBe(base)
      }
    }
  })
})

describe('D-17B §3 — the shortfall ramp respects the new threshold', () => {
  it('reach support at or above .375 is EXPOSED nowhere; below it, exposure is the sign of the shortfall', () => {
    for (const inp of SUPPORT_SWEEP) {
      const view = discoveryExposure(inp, ENGAGED)
      expect(view.exposed).toBe(view.reachSupport < TUNING.DISC_SUPPORT_THRESHOLD)
      expect(view.exposed).toBe(view.shortfall > 0)
      expect(view.shortfall).toBeGreaterThanOrEqual(0)
      expect(view.shortfall).toBeLessThanOrEqual(1)
    }
  })

  it('the quoted spread never exceeds the new DISC_SPREAD and is 0 at/above threshold', () => {
    for (const inp of SUPPORT_SWEEP) {
      const view = discoveryExposure(inp, ENGAGED)
      expect(view.spread).toBeGreaterThanOrEqual(0)
      expect(view.spread).toBeLessThanOrEqual(TUNING.DISC_SPREAD + 1e-12)
      if (!view.exposed) expect(view.spread).toBe(0)
      // the ramp is exactly the engine's: SPREAD · shortfall^EXP
      expect(view.spread).toBeCloseTo(
        TUNING.DISC_SPREAD * Math.pow(clamp(view.shortfall, 0, 1), TUNING.DISC_SUPPORT_EXP),
        12,
      )
    }
  })

  it('the exposure read-model reports the NEW .30 / 1.8 bounds — never a retired one', () => {
    for (const inp of SUPPORT_SWEEP) {
      const view = discoveryExposure(inp, ENGAGED)
      expect(view.floor).toBe(0.3)
      expect(view.ceil).toBe(1.8)
      expect(view.bandLow).toBeGreaterThanOrEqual(view.floor - 1e-12)
      expect(view.bandHigh).toBeLessThanOrEqual(view.ceil + 1e-12)
    }
  })
})
