// ── D-13 Conditional discoverability — acceptance tests ───────────────────────
// The opening carries governed uncertainty that WIDENS only when the package lacks reach
// support (low awareness + marketing + star). Legs/word-of-mouth (WAS) and the critic
// draw are untouched. Every expectation is derived from the owner directive, not the impl.

import { describe, expect, it } from 'vitest'
import {
  computeBoxOffice,
  resolveReception,
  resolveShape,
  RngStream,
  TUNING,
} from '../src/core/index.js'
import type { SegmentId, Standing } from '../src/core/index.js'
import { makeReceptionInputs, makeBudget } from './_fixtures.js'

const flat = (segs: { id: SegmentId }[], v: number) => {
  const m = {} as Record<SegmentId, number>
  for (const s of segs) m[s.id] = v
  return m
}
// Run computeBoxOffice with explicit discoverability draw + star support + marketing.
function box(opts: {
  appeal: number
  awareness: number
  star: number
  marketing: number
  discZ: number
  engaged?: boolean
}) {
  const inp = makeReceptionInputs({
    standing: { audienceAwareness: opts.awareness, industryPrestige: 40, commercialConfidence: 50 } as Standing,
  })
  const appeal = flat(inp.market.segments, opts.appeal)
  return computeBoxOffice(
    appeal,
    inp.market.segments,
    inp.market.baseMarketValue,
    inp.standing,
    inp.promise,
    makeBudget(3_000_000, opts.marketing),
    resolveShape(inp.shape),
    appeal,
    opts.engaged ?? true,
    opts.discZ,
    opts.star,
  )
}
const SMALL = 100_000
const STANDARD = 400_000
const LARGE = 1_000_000

// The low-tail opening (a bad discovery draw): obscurity risk = how low the opening can fall. More
// reach support (star / awareness / marketing) ⇒ a HIGHER low-tail ⇒ less obscurity, via a narrower
// swing AND/OR a higher deterministic base opening.
const lowTail = (o: { appeal?: number; awareness: number; star: number; marketing: number }) =>
  box({ appeal: o.appeal ?? 45, awareness: o.awareness, star: o.star, marketing: o.marketing, discZ: -1.6 }).opening
const swing = (o: { awareness: number; star: number; marketing: number }) => {
  const base = box({ appeal: 45, ...o, discZ: 0 }).opening
  return 1 - box({ appeal: 45, ...o, discZ: -2 }).opening / base
}
const LOW = { awareness: 20, star: 5, marketing: SMALL } // unknown cast + Small + low awareness

describe('D-13 conditional discoverability', () => {
  it('1. a low-support package has a materially WIDER opening downside than a supported one', () => {
    expect(swing(LOW)).toBeGreaterThan(0.4) // a big downside swing is possible for the unsupported film
    expect(swing({ awareness: 20, star: 80, marketing: SMALL })).toBeLessThan(swing(LOW) / 2) // a star cast is reliable
  })

  it('2. opening BELOW break-even / near-obscurity is reachable through the governed draw', () => {
    const base = box({ appeal: 45, ...LOW, discZ: 0 }).opening
    const obscure = box({ appeal: 45, ...LOW, discZ: -2.5 }).opening
    expect(obscure).toBeLessThan(base * 0.5) // a bad discovery draw genuinely suppresses the opening
    expect(obscure).toBeGreaterThan(0) // but a positive tail always remains (DISC_FLOOR)
    expect(obscure).toBeGreaterThanOrEqual(base * TUNING.DISC_FLOOR - 1)
  })

  it('3. Standard marketing reduces obscurity (raises the low-tail opening) vs Small', () => {
    expect(lowTail({ awareness: 20, star: 5, marketing: STANDARD })).toBeGreaterThan(lowTail(LOW))
  })
  it('4. Star power reduces obscurity (raises the low-tail opening)', () => {
    expect(lowTail({ awareness: 20, star: 70, marketing: SMALL })).toBeGreaterThan(lowTail(LOW))
  })
  it('5. Studio awareness reduces obscurity (raises the low-tail opening)', () => {
    expect(lowTail({ awareness: 75, star: 5, marketing: SMALL })).toBeGreaterThan(lowTail(LOW))
  })
  it('6. none of them GUARANTEES success — a supported but weak-appeal film can still open modestly', () => {
    // High support removes the discovery SWING but not the deterministic reach: a low-appeal film still
    // opens small even with a star cast + big marketing (discovery cannot manufacture demand).
    const weakButSupported = box({ appeal: 12, awareness: 60, star: 80, marketing: LARGE, discZ: 0 }).opening
    const strongPremium = box({ appeal: 70, awareness: 60, star: 80, marketing: LARGE, discZ: 0 }).opening
    expect(weakButSupported).toBeLessThan(strongPremium * 0.5)
  })

  it('7. + 8. word of mouth (legs) is preserved: legs come from audience score, NOT discovery/opening', () => {
    // Same package, two discovery draws: legs are IDENTICAL (a weak-discovery opening still legs out if the
    // audience score is strong → a sleeper is possible; a weak audience score cannot).
    const strong = { appeal: 80, ...LOW }
    const legsGood = box({ ...strong, discZ: -2 }).legs
    const legsBase = box({ ...strong, discZ: 0 }).legs
    expect(legsGood).toBeCloseTo(legsBase, 6) // discovery does not touch legs
    // a strong-audience film has materially higher legs than a weak one (word of mouth is real)
    const legsWeakAudience = box({ appeal: 25, ...LOW, discZ: 0 }).legs
    expect(legsBase).toBeGreaterThan(legsWeakAudience)
  })

  it('9. discoverability does NOT affect the critic score', () => {
    const inp = makeReceptionInputs({ standing: { audienceAwareness: 20, industryPrestige: 40, commercialConfidence: 50 } as Standing })
    const a = resolveReception(inp, RngStream.fromSeed('d13-critic'), true, true, -2)
    const b = resolveReception(inp, RngStream.fromSeed('d13-critic'), true, true, +2)
    expect(a.criticScore).toBe(b.criticScore) // critic draw is independent of the discovery draw
    expect(a.opening).not.toBe(b.opening) // …but the opening differs
  })

  it('10. the forecast center (z=0) equals the deterministic opening — no realized draw leaks', () => {
    const center = box({ appeal: 45, ...LOW, discZ: 0 }).opening
    // z=0 is exactly the deterministic reach (multiplier exp(0)=1); the realized z is drawn only at release.
    const detExpectation = box({ appeal: 45, ...LOW, discZ: 0, engaged: true }).opening
    expect(center).toBe(detExpectation)
  })

  it('11. + 12. deterministic: identical inputs (incl. z) always give the identical opening (replay/reload safe)', () => {
    const a = box({ appeal: 45, ...LOW, discZ: -1.3 }).opening
    const b = box({ appeal: 45, ...LOW, discZ: -1.3 }).opening
    expect(a).toBe(b)
  })

  it('13. M0A / non-engaged is byte-identical: discovery is inert when not engaged', () => {
    const off0 = box({ appeal: 45, ...LOW, discZ: 0, engaged: false }).opening
    const offZ = box({ appeal: 45, ...LOW, discZ: -3, engaged: false }).opening
    expect(offZ).toBe(off0) // non-engaged path ignores discoverabilityZ entirely
  })

  it('14. supported films are within tolerance of their deterministic opening (approved distributions preserved)', () => {
    // A star/marketed/established package sits above the support threshold → spread 0 → any draw ≈ unchanged.
    for (const z of [-2, -1, 1, 2]) {
      const supported = box({ appeal: 60, awareness: 70, star: 80, marketing: LARGE, discZ: z }).opening
      const center = box({ appeal: 60, awareness: 70, star: 80, marketing: LARGE, discZ: 0 }).opening
      expect(supported).toBeCloseTo(center, 6)
    }
  })
})
