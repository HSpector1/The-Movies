// ── D-12 owner calibration P2 — gross scale + awareness-conditioned marketing ──
// Proves the two engine changes are economy-ENGAGED-gated (M0A byte-identical), applied exactly
// once, and produce the intended shape: a routine gross scale that leaves legs/schedule untouched,
// and a marketing capacity that rises with the film's pre-marketing awareness so returns diminish
// and a maximum campaign on a not-yet-visible film is wasted. Also a light integrated owner-route
// check that a competent studio no longer multiplies cash after four ordinary films.

import { describe, expect, it } from 'vitest'
import {
  computeBoxOffice,
  TUNING,
  generateWorld,
  beginFounding,
  applyActions,
  tick,
  busyTalentIds,
  canAfford,
  roleOVR,
  ROLE_TO_DISCIPLINE,
  FOUNDING_MINIMUMS,
} from '../src/core/index.js'
import type { SegmentId, CreativeRole, Talent, CastSlot, GameState } from '../src/core/index.js'
import { makeReceptionInputs } from './_fixtures.js'

const SCALE = TUNING.ECONOMY_BOX_OFFICE_SCALE

// Positional computeBoxOffice args (segments … shapeEffects) with a marketing override.
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
function flatAppeal(inp: ReturnType<typeof makeReceptionInputs>, v: number): Record<SegmentId, number> {
  const m = {} as Record<SegmentId, number>
  for (const s of inp.market.segments) m[s.id] = v
  return m
}

describe('D-12 P2 gross scale: economy-engaged, applied exactly once, legs untouched', () => {
  it('engaged opening/total = non-engaged × ECONOMY_BOX_OFFICE_SCALE (marketing=0 isolates the scale)', () => {
    const inp = makeReceptionInputs({})
    const appeal = flatAppeal(inp, 55)
    // At marketing=0 the marketingQuality is 0 under BOTH the legacy and awareness capacity models,
    // so the ONLY difference between engaged/non-engaged is the routine gross scale.
    const off = computeBoxOffice(appeal, ...common(inp, 0), appeal, false)
    const on = computeBoxOffice(appeal, ...common(inp, 0), appeal, true)
    expect(on.opening).toBeCloseTo(off.opening * SCALE, 3)
    expect(on.total).toBeCloseTo(off.total * SCALE, 3)
    // Legs (and its driver) are NEVER scaled — only opening/total move.
    expect(on.legs).toBe(off.legs)
    expect(on.weightedAudienceScore).toBe(off.weightedAudienceScore)
    // Conservation: total is still opening × legs after scaling.
    expect(on.total).toBeCloseTo(on.opening * on.legs, 2)
  })

  it('the default (engaged omitted) equals the legacy non-engaged path — M0A byte-identical', () => {
    const inp = makeReceptionInputs({})
    const appeal = flatAppeal(inp, 55)
    const dflt = computeBoxOffice(appeal, ...common(inp, 400_000), appeal)
    const off = computeBoxOffice(appeal, ...common(inp, 400_000), appeal, false)
    expect(dflt.total).toBe(off.total)
    expect(dflt.opening).toBe(off.opening)
    // Legacy marketing Hill: quality = m/(m + MARKETING_HALF_SATURATION); no gross scale.
    expect(off.marketingQuality).toBeCloseTo(400_000 / (400_000 + TUNING.MARKETING_HALF_SATURATION), 6)
    expect(off.marketingCapacity).toBe(TUNING.MARKETING_HALF_SATURATION)
  })
})

describe('D-12 P2 awareness-conditioned marketing', () => {
  it('efficient marketing capacity RISES with pre-marketing awareness', () => {
    const inp = makeReceptionInputs({})
    const low = computeBoxOffice(flatAppeal(inp, 12), ...common(inp, 400_000), flatAppeal(inp, 12), true)
    const high = computeBoxOffice(flatAppeal(inp, 88), ...common(inp, 400_000), flatAppeal(inp, 88), true)
    expect(high.preMarketingAwareness).toBeGreaterThan(low.preMarketingAwareness)
    expect(high.marketingCapacity).toBeGreaterThan(low.marketingCapacity)
    // Capacity is bounded by the tuned MIN/MAX.
    expect(low.marketingCapacity).toBeGreaterThanOrEqual(TUNING.MARKETING_CAPACITY_MIN - 1)
    expect(high.marketingCapacity).toBeLessThanOrEqual(TUNING.MARKETING_CAPACITY_MAX + 1)
  })

  it('gross is monotonic in marketing but the marginal reach per dollar DECLINES (engaged)', () => {
    const inp = makeReceptionInputs({})
    const appeal = flatAppeal(inp, 55)
    const box = (m: number) => computeBoxOffice(appeal, ...common(inp, m), appeal, true).total
    const t0 = box(100_000), t1 = box(400_000), t2 = box(1_000_000)
    expect(t1).toBeGreaterThan(t0) // more marketing never REDUCES expected gross
    expect(t2).toBeGreaterThan(t1)
    const marginalLow = (t1 - t0) / (400_000 - 100_000)
    const marginalHigh = (t2 - t1) / (1_000_000 - 400_000)
    expect(marginalHigh).toBeLessThan(marginalLow) // diminishing returns per marketing dollar
  })

  it('a low-awareness film is OVEREXTENDED by a maximum campaign; a high-awareness film absorbs it', () => {
    const inp = makeReceptionInputs({})
    const low = computeBoxOffice(flatAppeal(inp, 10), ...common(inp, 1_000_000), flatAppeal(inp, 10), true)
    const high = computeBoxOffice(flatAppeal(inp, 90), ...common(inp, 1_000_000), flatAppeal(inp, 90), true)
    // The low-awareness film's max campaign is well beyond its efficient capacity…
    expect(1_000_000 / low.marketingCapacity).toBeGreaterThan(2.5)
    // …while the high-awareness film's is much closer to (or within) capacity.
    expect(1_000_000 / high.marketingCapacity).toBeLessThan(1_000_000 / low.marketingCapacity)
  })
})

// ── light integrated owner-route check (real engine) ──────────────────────────
const ROLES: CreativeRole[] = ['actor', 'director', 'writer', 'craft']
function bestOf(list: Talent[], role: CreativeRole): Talent[] {
  const ovr = (t: Talent) => roleOVR(t, ROLE_TO_DISCIPLINE[role])
  return [...list].sort((a, b) => ovr(b) + b.fame - (ovr(a) + a.fame))
}
function foundCompetent(seed: string): GameState {
  let s = beginFounding(generateWorld(seed))
  const pool = s.founding!.applicantIds.map((id) => s.talent.find((t) => t.id === id)!)
  const counts: Record<CreativeRole, number> = { actor: 6, director: 2, writer: 2, craft: 2 }
  for (const role of ROLES) {
    for (const t of bestOf(pool.filter((p) => p.role === role), role).slice(0, Math.max(FOUNDING_MINIMUMS[role], counts[role]))) {
      s = applyActions(s, [{ kind: 'signContract', talentId: t.id, termWeeks: 208 }])
    }
  }
  return applyActions(s, [{ kind: 'foundStudio' }])
}
function fourFilms(seed: string): { multiple: number; contributions: number[] } {
  let s = foundCompetent(seed)
  const committed: Record<string, number> = {}
  let conceptIdx = 0
  for (let wk = 0; wk < 120; wk++) {
    while (s.studio.activeProductions.length < TUNING.MAX_CONCURRENT_PRODUCTIONS && Object.keys(committed).length < 4) {
      const busy = busyTalentIds(s)
      const free = (role: CreativeRole) =>
        bestOf(s.contracts.map((c) => s.talent.find((t) => t.id === c.talentId)!).filter((t) => t.role === role && !busy.has(t.id)), role)
      const w = free('writer')[0], d = free('director')[0], a = free('actor'), c = free('craft')[0]
      if (!w || !d || !c || a.length < 3) break
      const concept = s.concepts[conceptIdx % s.concepts.length]!
      const negative = Math.round(concept.baseNegativeCost)
      const marketing = 400_000
      if (!canAfford(s, negative + marketing).ok) break
      s = applyActions(s, [{ kind: 'greenlight', production: {
        conceptId: concept.id,
        shape: { opening: 'slowSetup', midpoint: 'reversal', ending: 'bittersweet' },
        promise: { genre: concept.genre, intendedSegments: ['adult'], ranges: { intimacy: [-0.4, 0.4], tonalWeight: [-0.4, 0.4], kineticEnergy: [-0.4, 0.4] } },
        writerId: w.id, directorId: d.id, cast: { lead: a[0]!.id, antagonist: a[1]!.id, support: a[2]!.id } as Record<CastSlot, string>, craftIds: [c.id],
        budget: { negative, marketing },
      } }])
      committed[s.studio.activeProductions[s.studio.activeProductions.length - 1]!.id] = negative + marketing
      conceptIdx++
    }
    s = tick(s, { develop: true })
    const ids = Object.keys(committed)
    if (ids.length >= 4 && ids.every((id) => { const r = s.theatricalRuns.find((x) => x.productionId === id); return r && r.status !== 'active' })) break
  }
  const contributions = Object.keys(committed).map((id) => {
    const run = s.theatricalRuns.find((r) => r.productionId === id)!
    return run.weeklyGross.reduce((x, y) => x + y, 0) * run.studioShare - committed[id]!
  })
  return { multiple: s.studio.cash / TUNING.INITIAL_CASH, contributions }
}

describe('D-12 P2 owner route: four ordinary films no longer multiply cash', () => {
  it('a competent studio ends four films meaningfully constrained, with real losses', () => {
    // This route is SKILLED efficient play: best talent + efficient $400k marketing + both slots — the
    // upper end of competent outcomes (the "skill-reward" ceiling of the awareness-conditioned marketing).
    // Even so it stays well under the pre-P2 ~2.9–3.0× this policy produced and below the 3–4× breakout;
    // the owner's DESCRIBED high-marketing route (a $1M splurge, now deliberately inefficient) lands ~1.4×.
    const runs = Array.from({ length: 12 }, (_, i) => fourFilms(`p2-route-${i}`))
    const multiples = runs.map((r) => r.multiple).sort((a, b) => a - b)
    const median = multiples[Math.floor(multiples.length / 2)]!
    // Money is meaningfully constrained: the four-film outcome no longer multiplies cash toward the
    // 3–4× breakout, yet the studio remains recoverable (not wiped out).
    expect(median).toBeLessThan(2.25)
    expect(median).toBeGreaterThan(0.4)
    // Losses are real: across the sample at least one film loses money, and at least one run finishes
    // below its starting cash.
    const allFilms = runs.flatMap((r) => r.contributions)
    expect(allFilms.some((c) => c < 0)).toBe(true)
    expect(runs.some((r) => r.multiple < 1)).toBe(true)
  })
})
