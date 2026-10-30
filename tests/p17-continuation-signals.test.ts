// ── P17 Recognition / Momentum / Fatigue — canonical rev02 §5.2/§5.3/§8/§9/§11 calculator REDs ──
//
// Authority: canonical revision 02 at f2eff6356fca3e6d5287e690bf2404867d638906
// (docs/research/p17-independent-verification-01/P17-INDEPENDENT-VERIFICATION-REPORT.md) §5.2 (kernel),
// §5.3 (awareness input, remake/reboot comparison, continuity credit), §5.4 (paper Cases A–G, R, R2),
// §5.5 (spam probe), §9 (SubProperty seed), §11 (continuity multiplier); the P17 continuation charter r2
// (1370-ae-restart-checkpoint/p17-continuation-prep-r2-5020e56e-20261008) RED item (2); Owner choices in
// P17-RECOVERED-SPECIFICATION-STATE.md (0.35 quality-qualified floor; healthy reboot legal; dormant
// DirectSequel is not a sixth type). Expected numbers are the report's §5.4 table values (one decimal), so
// every assertion carries a ±0.06 band for the report's own rounding; nothing is copied from src/core.
//
// Paper convention (§5.4): expectedTotal $150M flat; a film "(c/a, k×)" has critic c, audience a and a
// realized total of k × $150M. Momentum is unclamped.

import { describe, expect, it } from 'vitest'
import {
  awarenessInput,
  branchBand,
  composeInheritedAwareness,
  continuationAwareness,
  continuityMultiplier,
  emptyMeter,
  emptyMomentum,
  fatigueAt,
  hookTransferFraction,
  isContinuityOpen,
  momentumAt,
  P17_CONTINUATION_TYPES,
  qualityOf,
  reach01,
  rebootComparison,
  recognitionAt,
  recognitionReported,
  registerBranchRelease,
  registerRelease,
  remakeComparison,
  seedSubPropertyMeter,
  similarityOf,
  surpriseOf,
  type BranchMomentum,
  type PropertyMeter,
  type ReleaseFacts,
} from '../src/core/continuationSignals.js'
import { TUNING } from '../src/core/tuning.js'

const EXPECTED = 150_000_000

function film(id: string, week: number, critic: number, audience: number, mult: number): ReleaseFacts {
  return { installmentId: id, week, critic01: critic / 100, audience01: audience / 100, total: mult * EXPECTED, expectedTotal: EXPECTED }
}

/** One property release: R/F on the meter, M on the branch, in the canonical order. */
function release(meter: PropertyMeter, branch: BranchMomentum, facts: ReleaseFacts, similarity: number) {
  return {
    meter: registerRelease(meter, facts, { similarity }),
    branch: registerBranchRelease(branch, facts),
  }
}

describe('P17 continuation signals — canonical inputs (§5.2)', () => {
  it('five continuation types and their similarity buckets', () => {
    expect([...P17_CONTINUATION_TYPES]).toEqual(['directSequel', 'prequel', 'remake', 'reboot', 'spinOff'])
    expect(similarityOf('directSequel')).toBe(0.9)
    expect(similarityOf('prequel')).toBe(0.9)
    expect(similarityOf('remake')).toBe(0.7)
    expect(similarityOf('reboot')).toBe(0.6)
    expect(similarityOf('spinOff')).toBe(0.5)
  })

  it('quality blend, reach and surprise are the §5.2 definitions', () => {
    expect(qualityOf(0.85, 0.8)).toBeCloseTo(0.825, 12)
    expect(reach01(2.2 * EXPECTED)).toBeCloseTo(330 / 340, 12)
    expect(reach01(0)).toBe(0)
    // the same half-saturation helper starPower.ts uses — reused, not duplicated
    expect(reach01(TUNING.STAR_POWER_REACH_HALF)).toBeCloseTo(0.5, 12)
    expect(surpriseOf(2.2 * EXPECTED, EXPECTED, 0.825)).toBeCloseTo(0.925, 12)
    // clamped to [-1, 1]
    expect(surpriseOf(2.5 * EXPECTED, EXPECTED, 0.89)).toBe(1)
    expect(surpriseOf(0, EXPECTED, 0)).toBe(-1)
    // no locked forecast ⇒ comparator 1 (the computeStarPowerDelta precedent): surprise is quality alone
    expect(surpriseOf(5 * EXPECTED, null, 0.5)).toBe(0)
  })
})

describe('P17 paper histories (§5.4) — the seven cases reproduce', () => {
  it('Case A breakout: R 80.1 → 79.7 → 75.1, M 92.5 → 82.4 → 16.4, F 0', () => {
    const { meter, branch } = release(emptyMeter(0), emptyMomentum(0), film('f1', 0, 85, 80, 2.2), 0.9)
    expect(recognitionAt(meter, 0)).toBeCloseTo(80.1, 1)
    expect(momentumAt(branch, 0)).toBeCloseTo(92.5, 1)
    expect(fatigueAt(meter, 0)).toBe(0)
    expect(Math.abs(recognitionAt(meter, 4) - 79.7)).toBeLessThan(0.06)
    expect(Math.abs(momentumAt(branch, 4) - 82.4)).toBeLessThan(0.06)
    expect(Math.abs(recognitionAt(meter, 60) - 75.1)).toBeLessThan(0.06)
    expect(Math.abs(momentumAt(branch, 60) - 16.4)).toBeLessThan(0.06)
    expect(fatigueAt(meter, 60)).toBe(0)
  })

  it('Case C hit then flop: the flop adds no Recognition, swings Momentum negative, builds real Fatigue', () => {
    const a = release(emptyMeter(0), emptyMomentum(0), film('f1', 0, 90, 88, 2.5), 0.9)
    expect(Math.abs(recognitionAt(a.meter, 0) - 86.7)).toBeLessThan(0.06)
    expect(momentumAt(a.branch, 0)).toBeCloseTo(100, 6)
    const b = release(a.meter, a.branch, film('f2', 78, 45, 40, 0.6), 0.9)
    expect(Math.abs(recognitionAt(b.meter, 78) - 79.8)).toBeLessThan(0.06) // passive decay only
    expect(Math.abs(momentumAt(b.branch, 78) - -17.0)).toBeLessThan(0.06)
    expect(Math.abs(fatigueAt(b.meter, 78) - 51.8)).toBeLessThan(0.06)
    expect(branchBand(b.branch, b.meter, 78)).toBe('cooling')
    // rest to week 130: F pays down on the 104-week clock (last quality 0.425 ⇒ base rate)
    expect(Math.abs(recognitionAt(b.meter, 130) - 75.5)).toBeLessThan(0.06)
    expect(Math.abs(momentumAt(b.branch, 130) - -3.8)).toBeLessThan(0.06)
    expect(Math.abs(fatigueAt(b.meter, 130) - 36.6)).toBeLessThan(0.06)
    expect(branchBand(b.branch, b.meter, 130)).toBe('active')
    // the peak is anchored: the flop never pulls rPeak down
    expect(b.meter.peakInstallmentId).toBe('f1')
    expect(Math.abs(b.meter.rPeak - 86.7)).toBeLessThan(0.06)
  })

  it('Case D rapid mediocrity: band flips to COOLING on Fatigue alone with Momentum flat', () => {
    let s = release(emptyMeter(0), emptyMomentum(0), film('f1', 0, 57, 55, 0.9), 0.9)
    expect(Math.abs(recognitionAt(s.meter, 0) - 12.5)).toBeLessThan(0.06)
    expect(Math.abs(momentumAt(s.branch, 0) - 1.0)).toBeLessThan(0.06)
    expect(fatigueAt(s.meter, 0)).toBe(0) // the property's first-ever film is exempt
    expect(branchBand(s.branch, s.meter, 0)).toBe('active')
    s = release(s.meter, s.branch, film('f2', 40, 57, 55, 0.9), 0.9)
    expect(Math.abs(recognitionAt(s.meter, 40) - 14.3)).toBeLessThan(0.06)
    expect(Math.abs(momentumAt(s.branch, 40) - 1.3)).toBeLessThan(0.06)
    expect(Math.abs(fatigueAt(s.meter, 40) - 39.6)).toBeLessThan(0.06)
    expect(branchBand(s.branch, s.meter, 40)).toBe('active')
    s = release(s.meter, s.branch, film('f3', 80, 57, 55, 0.9), 0.9)
    expect(Math.abs(recognitionAt(s.meter, 80) - 16.0)).toBeLessThan(0.06)
    expect(Math.abs(momentumAt(s.branch, 80) - 1.4)).toBeLessThan(0.06)
    expect(Math.abs(fatigueAt(s.meter, 80) - 68.5)).toBeLessThan(0.06)
    expect(branchBand(s.branch, s.meter, 80)).toBe('cooling')
    s = release(s.meter, s.branch, film('f4', 120, 57, 55, 0.9), 0.9)
    expect(Math.abs(recognitionAt(s.meter, 120) - 17.7)).toBeLessThan(0.06)
    expect(momentumAt(s.branch, 120)).toBeGreaterThan(1.4)
    expect(momentumAt(s.branch, 120)).toBeLessThan(1.5)
    expect(Math.abs(fatigueAt(s.meter, 120) - 89.6)).toBeLessThan(0.06)
    expect(branchBand(s.branch, s.meter, 120)).toBe('cooling')
  })

  it('Case E 20-year dormancy: R 83.7 → 63.4 → 48.1 → 29.3 (the 0.35 floor binds); M and F recover', () => {
    const { meter, branch } = release(emptyMeter(0), emptyMomentum(0), film('f1', 0, 88, 85, 2.0), 0.9)
    expect(Math.abs(recognitionAt(meter, 0) - 83.7)).toBeLessThan(0.06)
    expect(Math.abs(momentumAt(branch, 0) - 86.5)).toBeLessThan(0.06)
    expect(Math.abs(recognitionReported(meter, 260) - 63.4)).toBeLessThan(0.06)
    expect(Math.abs(recognitionReported(meter, 520) - 48.1)).toBeLessThan(0.06)
    expect(recognitionAt(meter, 1040)).toBeLessThan(29)
    expect(Math.abs(recognitionReported(meter, 1040) - 29.3)).toBeLessThan(0.06)
    expect(momentumAt(branch, 1040)).toBeLessThan(0.000001)
    expect(fatigueAt(meter, 1040)).toBe(0)
    expect(branchBand(branch, meter, 1040)).toBe('revivalCandidate')
  })

  it('Case F successful reboot after E: R 29.3 → 83.3 on the SAME property; new continuity M 0 → 62.5; F 0', () => {
    const e = release(emptyMeter(0), emptyMomentum(0), film('f1', 0, 88, 85, 2.0), 0.9)
    const rebootBranch = emptyMomentum(1040)
    const f = release(e.meter, rebootBranch, film('f2', 1040, 85, 80, 1.6), 0.6)
    expect(Math.abs(recognitionReported(f.meter, 1040) - 83.3)).toBeLessThan(0.06)
    expect(f.meter.peakInstallmentId).toBe('f2')
    expect(Math.abs(momentumAt(f.branch, 1040) - 62.5)).toBeLessThan(0.06)
    expect(momentumAt(e.branch, 1040)).toBeLessThan(0.000001) // the old continuity's Momentum is its own
    expect(fatigueAt(f.meter, 1040)).toBe(0) // q ≥ 0.75 ⇒ satiation gate 0
    expect(branchBand(f.branch, f.meter, 1040)).toBe('active') // never ACTIVE AGAIN on a brand-new branch
    expect(branchBand(e.branch, f.meter, 1040)).toBe('revivalCandidate')
  })

  it('Case G failed reboot: identical pre-release read to F; R unchanged 29.3, M −36.0, property F 36.6', () => {
    const e = release(emptyMeter(0), emptyMomentum(0), film('f1', 0, 88, 85, 2.0), 0.9)
    const before = {
      r: recognitionReported(e.meter, 1040),
      f: fatigueAt(e.meter, 1040),
      aware: awarenessInput({ recognition: recognitionReported(e.meter, 1040), momentum: 0, fatigue: fatigueAt(e.meter, 1040) }),
    }
    const g = release(e.meter, emptyMomentum(1040), film('f2', 1040, 40, 38, 0.5), 0.6)
    expect(Math.abs(before.r - 29.3)).toBeLessThan(0.06)
    expect(Math.abs(recognitionReported(g.meter, 1040) - 29.3)).toBeLessThan(0.06) // a failure adds nothing
    expect(g.meter.peakInstallmentId).toBe('f1')
    expect(Math.abs(momentumAt(g.branch, 1040) - -36.0)).toBeLessThan(0.06)
    expect(Math.abs(fatigueAt(g.meter, 1040) - 36.6)).toBeLessThan(0.06)
    expect(branchBand(g.branch, g.meter, 1040)).toBe('cooling')
    // property-wide Fatigue: the OLD continuity reads it too — awareness 0.234 → 0.191
    expect(Math.abs(before.aware - 0.234)).toBeLessThan(0.002)
    const after = awarenessInput({ recognition: recognitionReported(g.meter, 1040), momentum: 0, fatigue: fatigueAt(g.meter, 1040) })
    expect(Math.abs(after - 0.191)).toBeLessThan(0.002)
  })

  it('Case R remake comparison: ×0.67 at 2 years, ×0.89 at 10, ×0.99 at 30 — a continuous fade, no 20-year lock', () => {
    const qRef = qualityOf(0.88, 0.85)
    expect(Math.abs(1 - remakeComparison(qRef, 104) - 0.67)).toBeLessThan(0.006)
    expect(Math.abs(1 - remakeComparison(qRef, 520) - 0.89)).toBeLessThan(0.006)
    expect(Math.abs(1 - remakeComparison(qRef, 1560) - 0.99)).toBeLessThan(0.006)
    expect(remakeComparison(qRef, 1040)).toBeGreaterThan(remakeComparison(qRef, 1041))
  })

  it('Case R2 reboot partial comparison: fires only for a strong (q ≥ 0.65) AND recent (< 416 wk) prior film', () => {
    expect(rebootComparison(0.62, 260)).toBe(0) // TASM-like: not strong
    expect(Math.abs(1 - rebootComparison(0.8, 260) - 0.92)).toBeLessThan(0.006) // fires
    expect(rebootComparison(0.4, 208)).toBe(0) // Casino-Royale-like
    expect(rebootComparison(0.8, 468)).toBe(0) // not recent
    expect(rebootComparison(0.8, 416)).toBe(0) // boundary: 416 is not < 416
    expect(rebootComparison(0.8, 415)).toBeGreaterThan(0)
  })

  it('spam probe (§5.5): twenty mediocre releases at 15-week cadence — R gated well below 100, F unbounded, awareness no better than a fresh mediocre original', () => {
    let meter = emptyMeter(0)
    let branch = emptyMomentum(0)
    for (let i = 0; i < 20; i++) {
      const s = release(meter, branch, film(`m${i}`, i * 15, 57, 55, 0.9), 0.9)
      meter = s.meter
      branch = s.branch
    }
    const week = 19 * 15
    // rev02 §5.5 R3 probe 1, to the report's rounding: Recognition 43 (gated), its durable floor 15, Fatigue 318
    expect(Math.round(recognitionReported(meter, week))).toBe(43)
    expect(Math.round(TUNING.P17_RECOGNITION_FLOOR_FRACTION * meter.rPeak)).toBe(15)
    expect(Math.round(fatigueAt(meter, week))).toBe(318) // no per-count cap anywhere
    const aware = awarenessInput({ recognition: recognitionReported(meter, week), momentum: momentumAt(branch, week), fatigue: fatigueAt(meter, week) })
    expect(aware).toBeGreaterThanOrEqual(0.1) // the report's 0.10–0.18 band
    expect(aware).toBeLessThanOrEqual(0.18)
    // twenty GOOD releases build a franchise with zero Fatigue
    let good = emptyMeter(0)
    for (let i = 0; i < 20; i++) good = registerRelease(good, film(`g${i}`, i * 15, 80, 78, 1.3), { similarity: 0.9 })
    expect(recognitionReported(good, week)).toBeGreaterThan(95)
    expect(fatigueAt(good, week)).toBe(0)
  })

  it('founding exemption applies only to the StoryProperty\'s first-ever film (C5): a spin-off\'s founding film accrues', () => {
    // Case B: the spin-off SubProperty's 74.5-quality film sits 0.005 under the satiation gate → 0.6375
    const parent = registerRelease(registerRelease(emptyMeter(0), film('f1', 0, 90, 88, 2.4), { similarity: 0.9 }), film('f2', 52, 90, 88, 2.4), { similarity: 0.9 })
    expect(fatigueAt(parent, 92)).toBe(0) // both smash films clear the 0.75 gate
    const sub = seedSubPropertyMeter(parent, 1.0, 91)
    expect(sub.releaseCount).toBe(0)
    const afterSpin = registerRelease(sub, film('f3', 92, 75, 74, 1.4), { similarity: 0.5 })
    expect(Math.abs(fatigueAt(afterSpin, 92) - 0.6375)).toBeLessThan(0.0005)
    // the parent property's own Fatigue is NOT touched by the spin-off's accrual
    expect(fatigueAt(parent, 92)).toBe(0)
  })
})

describe('P17 SubProperty seed (§9)', () => {
  it('transfer fraction 0.38 + 0.27·hookWeight; R_sp = fraction·R_parent; F_sp = 0.5·F_parent; M_sp = 0; parent never consumed', () => {
    expect(hookTransferFraction(1.0)).toBeCloseTo(0.65, 12)
    expect(hookTransferFraction(0)).toBeCloseTo(0.38, 12)
    expect(hookTransferFraction(0.5)).toBeCloseTo(0.515, 12)
    let parent = registerRelease(emptyMeter(0), film('f1', 0, 85, 80, 2.2), { similarity: 0.9 })
    parent = registerRelease(parent, film('f2', 60, 45, 40, 0.6), { similarity: 0.9 })
    const rParent = recognitionReported(parent, 100)
    const fParent = fatigueAt(parent, 100)
    expect(fParent).toBeGreaterThan(0)
    const sub = seedSubPropertyMeter(parent, 0.6, 100)
    expect(recognitionReported(sub, 100)).toBeCloseTo((0.38 + 0.27 * 0.6) * rParent, 6)
    expect(fatigueAt(sub, 100)).toBeCloseTo(0.5 * fParent, 6)
    expect(recognitionReported(parent, 100)).toBe(rParent) // not consumed
    // the seeded recognition decays and floors like any other
    expect(recognitionReported(sub, 100 + 650)).toBeLessThan(recognitionReported(sub, 100))
    expect(recognitionReported(sub, 100 + 6500)).toBeCloseTo(0.35 * recognitionReported(sub, 100), 6)
  })
})

describe('P17 awareness input (§5.3) and the one P07 entry', () => {
  it('awarenessInput = clamp(0.8·R/100 + 0.2·max(M,0)/100, 0, 1) × (1 − 0.5·min(F,100)/100)', () => {
    expect(awarenessInput({ recognition: 100, momentum: 100, fatigue: 0 })).toBe(1)
    expect(awarenessInput({ recognition: 80, momentum: -50, fatigue: 0 })).toBeCloseTo(0.64, 12) // negative M removes only the tailwind
    expect(awarenessInput({ recognition: 80, momentum: 20, fatigue: 100 })).toBeCloseTo(0.68 * 0.5, 12)
    expect(awarenessInput({ recognition: 80, momentum: 20, fatigue: 300 })).toBeCloseTo(0.68 * 0.5, 12) // F discount saturates at 100
    expect(awarenessInput({ recognition: 0, momentum: 0, fatigue: 0 })).toBe(0)
  })

  it('composeInheritedAwareness applies the comparison discount and the continuity multiplier once each, clamped to [0,1]', () => {
    const base = awarenessInput({ recognition: 80, momentum: 20, fatigue: 0 })
    expect(composeInheritedAwareness({ recognition: 80, momentum: 20, fatigue: 0, comparison01: 0, continuityCredit: null })).toBeCloseTo(base, 12)
    expect(composeInheritedAwareness({ recognition: 80, momentum: 20, fatigue: 0, comparison01: 0.33, continuityCredit: null })).toBeCloseTo(base * 0.67, 12)
    expect(composeInheritedAwareness({ recognition: 80, momentum: 20, fatigue: 0, comparison01: 0, continuityCredit: 0.467 })).toBeCloseTo(base * (0.75 + 0.25 * 0.467), 12)
    for (const r of [0, 50, 100]) for (const m of [-100, 0, 100]) for (const f of [0, 60, 400]) for (const c of [0, 0.5, 1]) {
      const v = composeInheritedAwareness({ recognition: r, momentum: m, fatigue: f, comparison01: c, continuityCredit: 0 })
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThanOrEqual(1)
    }
  })

  it('continuity multiplier 0.75 + 0.25·credit; no association ⇒ exactly 1', () => {
    expect(continuityMultiplier(null)).toBe(1)
    expect(continuityMultiplier(1)).toBe(1)
    expect(continuityMultiplier(0)).toBe(0.75)
    expect(continuityMultiplier(0.467)).toBeCloseTo(0.867, 3)
  })

  it('continuationAwareness: absent input is the caller\'s own branch; present input raises studio awareness by probabilistic OR, never above 100', () => {
    expect(continuationAwareness(40, 0)).toBe(40)
    expect(continuationAwareness(40, 1)).toBe(100)
    expect(continuationAwareness(100, 0.5)).toBe(100)
    expect(continuationAwareness(40, 0.5)).toBeCloseTo(70, 12)
    for (const a of [0, 13, 40, 77, 100]) for (const i of [0, 0.25, 0.8, 1]) {
      const v = continuationAwareness(a, i)
      expect(v).toBeGreaterThanOrEqual(a)
      expect(v).toBeLessThanOrEqual(100)
    }
  })
})

describe('P17 bands and open continuities (§5.2, §10) — derived, never stored', () => {
  it('NEW / ACTIVE / ACTIVE AGAIN / COOLING / DORMANT / REVIVAL CANDIDATE from (M, F, release gaps) only', () => {
    const meter = registerRelease(emptyMeter(0), film('f1', 0, 85, 80, 2.0), { similarity: 0.9 })
    expect(branchBand(emptyMomentum(0), meter, 0)).toBe('new')
    const b1 = registerBranchRelease(emptyMomentum(0), film('f1', 0, 85, 80, 2.0))
    expect(branchBand(b1, meter, 10)).toBe('active')
    expect(branchBand(b1, meter, 160)).toBe('revivalCandidate') // ≥150 weeks, R_reported ≥ 25
    const faded = registerRelease(emptyMeter(0), film('w', 0, 57, 55, 0.9), { similarity: 0.9 })
    const bw = registerBranchRelease(emptyMomentum(0), film('w', 0, 57, 55, 0.9))
    expect(branchBand(bw, faded, 160)).toBe('dormant') // R_reported < 25
    // a dormant DirectSequel returning: prior gap ≥ 150, release < 26 weeks old, M ≥ 0 ⇒ ACTIVE AGAIN, then plain ACTIVE
    const b2 = registerBranchRelease(b1, film('f2', 300, 80, 78, 1.3))
    expect(b2.priorGapWeeks).toBe(300)
    expect(branchBand(b2, meter, 310)).toBe('activeAgain')
    expect(branchBand(b2, meter, 330)).toBe('active')
    // a brand-new reboot branch has a null prior gap and reads plain ACTIVE, never ACTIVE AGAIN
    const rb = registerBranchRelease(emptyMomentum(300), film('r1', 300, 80, 78, 1.3))
    expect(rb.priorGapWeeks).toBeNull()
    expect(branchBand(rb, meter, 310)).toBe('active')
  })

  it('a continuity is open while NEW or fewer than 150 weeks past its last release', () => {
    const b = registerBranchRelease(emptyMomentum(0), film('f1', 0, 85, 80, 2.0))
    expect(isContinuityOpen(b, false, 149)).toBe(true)
    expect(isContinuityOpen(b, false, 150)).toBe(false)
    expect(isContinuityOpen(b, true, 1000)).toBe(true) // a greenlit, unreleased installment keeps it open
    expect(isContinuityOpen(emptyMomentum(0), false, 5)).toBe(false) // never released, nothing in flight: not open
  })
})

describe('P17 tuning — every bounded term is a named TUNING entry inside its stated range', () => {
  it('ranges', () => {
    const t = TUNING
    expect(t.P17_RECOGNITION_HALF_LIFE_WEEKS).toBe(650)
    expect(t.P17_RECOGNITION_RESIDUAL_WEIGHT).toBeGreaterThan(0)
    expect(t.P17_RECOGNITION_RESIDUAL_WEIGHT).toBeLessThan(1)
    expect(t.P17_RECOGNITION_FLOOR_FRACTION).toBe(0.35) // Owner choice
    expect(t.P17_RECOGNITION_GATE_LO).toBe(0.5)
    expect(t.P17_RECOGNITION_GATE_SPAN).toBe(0.25)
    expect(t.P17_MOMENTUM_HALF_LIFE_WEEKS).toBe(24)
    expect(t.P17_FATIGUE_SATIATION_Q).toBe(0.75)
    expect(t.P17_FATIGUE_SATIATION_SPAN).toBe(0.1)
    expect(t.P17_FATIGUE_HALF_LIFE_BASE_WEEKS).toBe(104)
    expect(t.P17_FATIGUE_PAYDOWN_COEF).toBe(1.5)
    expect(t.P17_SIMILARITY.directSequel).toBe(0.9)
    expect(t.P17_SIMILARITY.prequel).toBe(0.9)
    expect(t.P17_AWARENESS_RECOGNITION_WEIGHT + t.P17_AWARENESS_MOMENTUM_WEIGHT).toBeCloseTo(1, 12)
    expect(t.P17_FATIGUE_AWARENESS_WEIGHT).toBe(0.5)
    expect(t.P17_REMAKE_COMPARISON_WEIGHT).toBe(0.5)
    expect(t.P17_REMAKE_HALF_LIFE_WEEKS).toBe(260)
    expect(t.P17_REBOOT_PARTIAL_WEIGHT).toBe(0.4)
    expect(t.P17_REBOOT_REF_RECENT_WEEKS).toBe(416)
    expect(t.P17_REBOOT_REF_STRONG_Q).toBe(0.65)
    expect(t.P17_CONTINUITY_CREDIT_FLOOR).toBe(0.75)
    expect(t.P17_RECAST_RETENTION).toBe(0.35)
    expect(t.P17_ASSOCIATION_CAP).toBe(4)
    expect(t.P17_MIN_APPEARANCES_FOR_MAJOR).toBe(2)
    expect(t.P17_MAX_OPEN_CONTINUITIES).toBe(3)
    expect(t.P17_DORMANT_WEEKS).toBe(150)
    expect(t.P17_REVIVAL_R_BAR).toBe(25)
    expect(t.P17_MOMENTUM_COOL).toBe(-5)
    expect(t.P17_FATIGUE_HOT).toBe(60)
    expect(t.P17_REACT_WINDOW_WEEKS).toBe(26)
    expect(t.P17_MAX_LIVE_SUBPROPERTIES).toBe(3)
    expect(t.P17_SPINOFF_TRANSFER_BASE).toBe(0.38)
    expect(t.P17_SPINOFF_TRANSFER_HOOK_COEF).toBe(0.27)
    expect(t.P17_SPINOFF_FATIGUE_INHERIT).toBe(0.5)
    expect(t.P17_HOOK_WEIGHT_DEFAULT).toBe(0.5)
    for (const w of Object.values(t.P17_ROLE_IMPORTANCE)) {
      expect(w).toBeGreaterThan(0)
      expect(w).toBeLessThanOrEqual(1)
    }
    expect((t.P17_ROLE_IMPORTANCE as Record<string, number>).craft).toBeUndefined() // craft excluded
  })
})
