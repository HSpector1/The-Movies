// ── P17 — the ONE optional continuation input on ReceptionInputs/ForecastInputs ──
//
// Authority: canonical rev02 §5.3 (one optional field read at lock and at release), §7 (expectations
// live in the locked forecast; no second multiplier; legs/critic untouched), §17 (P07 keeps the formula;
// P17 supplies a value); charter r2 §"Recognition, Momentum, Fatigue and the one reception seam" and
// RED item (3): same field at forecast lock and actual release; later intervening release changes the
// live input without rewriting the forecast; no future result; no double expectation/legs/quality/
// Standing effect; absent input is bit-identical to the predecessor path.
//
// Predecessor pins: `tests/fixtures/p17/seam-predecessor-pins.json` was produced by
// scripts-free `vite-node` evaluation of the UNMODIFIED reception/forecast at base
// 6510c971bed8079f7ca02e528b224988de092c87 (see the package RED-FIRST-EVIDENCE.md). The absent-input
// leaves assert equality to those bytes.

import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { computeForecast, forecastCenters, type ForecastContext } from '../src/core/forecast.js'
import { computeBoxOffice, resolveReception, type ReceptionInputs } from '../src/core/reception.js'
import { stream } from '../src/core/rng.js'
import { updateStanding, type StandingContext } from '../src/core/standing.js'
import { makeReceptionInputs, makeTalent } from './_fixtures.js'

const PINS = JSON.parse(readFileSync(new URL('./fixtures/p17/seam-predecessor-pins.json', import.meta.url), 'utf8')) as {
  seed: string
  reception: { opening: number; total: number; criticScore: number; legs: number; awarenessFactor: number }
  receptionEngaged: { opening: number; total: number; legs: number }
  forecast: { expectedOpening: number; expectedTotal: number; expectedCriticScore: number }
}

function fixture(): ReceptionInputs {
  return makeReceptionInputs({
    cast: {
      lead: makeTalent({ id: 'lead', role: 'actor', skill: 60, fame: 70 }),
      antagonist: makeTalent({ id: 'ant', role: 'actor', skill: 55, fame: 30 }),
      support: makeTalent({ id: 'sup', role: 'actor', skill: 50, fame: 10 }),
    },
    writer: makeTalent({ id: 'writer', role: 'writer', skill: 60 }),
    director: makeTalent({ id: 'director', role: 'director', skill: 65 }),
    standing: { audienceAwareness: 40, industryPrestige: 40, commercialConfidence: 50 },
  })
}

const ctx: ForecastContext = { seed: 'p17-seam', productionId: 'prod-1', directorId: 'director', releasedFilms: [], concepts: [] }

describe('P17 seam — absent input is the predecessor path, bit for bit', () => {
  it('resolveReception without the field reproduces the predecessor pins (M0A and engaged)', () => {
    const r = resolveReception(fixture(), stream(PINS.seed, 'hollywood-v1', 'pin:reception'))
    expect(r.opening).toBe(PINS.reception.opening)
    expect(r.total).toBe(PINS.reception.total)
    expect(r.criticScore).toBe(PINS.reception.criticScore)
    expect(r.legs).toBe(PINS.reception.legs)
    expect(r.awarenessFactor).toBe(PINS.reception.awarenessFactor)
    const e = resolveReception(fixture(), stream(PINS.seed, 'hollywood-v1', 'pin:reception'), true, true, 0.25)
    expect(e.opening).toBe(PINS.receptionEngaged.opening)
    expect(e.total).toBe(PINS.receptionEngaged.total)
    expect(e.legs).toBe(PINS.receptionEngaged.legs)
  })

  it('computeForecast without the field reproduces the predecessor pins', () => {
    const f = computeForecast(fixture(), ctx)
    expect(f.expectedOpening).toBe(PINS.forecast.expectedOpening)
    expect(f.expectedTotal).toBe(PINS.forecast.expectedTotal)
    expect(f.expectedCriticScore).toBe(PINS.forecast.expectedCriticScore)
  })

  it('an explicitly undefined field is the absent path too', () => {
    const a = resolveReception(fixture(), stream('x', 'hollywood-v1', 'a'))
    const b = resolveReception({ ...fixture(), inheritedAwareness01: undefined } as unknown as ReceptionInputs, stream('x', 'hollywood-v1', 'a'))
    expect(JSON.stringify(b)).toBe(JSON.stringify(a))
  })
})

describe('P17 seam — the field enters exactly once, through awareness, at opening', () => {
  it('a known property opens higher and grosses more; legs, critic, craft, cohesion and audience score are untouched', () => {
    const plain = resolveReception(fixture(), stream('x', 'hollywood-v1', 'b'))
    const known = resolveReception({ ...fixture(), inheritedAwareness01: 0.8 }, stream('x', 'hollywood-v1', 'b'))
    expect(known.opening).toBeGreaterThan(plain.opening)
    expect(known.total).toBeGreaterThan(plain.total)
    expect(known.awarenessFactor).toBeGreaterThan(plain.awarenessFactor)
    expect(known.legs).toBe(plain.legs)
    expect(known.criticScore).toBe(plain.criticScore)
    expect(known.criticMean).toBe(plain.criticMean)
    expect(known.craft).toBe(plain.craft)
    expect(known.cohesion).toBe(plain.cohesion)
    expect(known.weightedAudienceScore).toBe(plain.weightedAudienceScore)
    expect(known.starDraw).toBe(plain.starDraw)
    expect(JSON.stringify(known.segmentScores)).toBe(JSON.stringify(plain.segmentScores))
    // monotone in the input, saturating at the awareness ceiling
    const more = resolveReception({ ...fixture(), inheritedAwareness01: 1 }, stream('x', 'hollywood-v1', 'b'))
    expect(more.opening).toBeGreaterThanOrEqual(known.opening)
    expect(more.awarenessFactor).toBeLessThanOrEqual(1)
  })

  it('computeBoxOffice applies the input once: zero is a no-op in value, absent is a no-op in bytes', () => {
    const inp = fixture()
    const appeal = { youngAdult: 60, family: 55, adult: 65, prestige: 50 }
    const base = computeBoxOffice(appeal, inp.market.segments, inp.market.baseMarketValue, inp.standing, inp.promise, inp.budget, inp.shapeEffects)
    const zero = computeBoxOffice(appeal, inp.market.segments, inp.market.baseMarketValue, inp.standing, inp.promise, inp.budget, inp.shapeEffects, appeal, false, 0, 0, 1, 1, 0)
    expect(zero.opening).toBeCloseTo(base.opening, 6)
    const absent = computeBoxOffice(appeal, inp.market.segments, inp.market.baseMarketValue, inp.standing, inp.promise, inp.budget, inp.shapeEffects, appeal, false, 0, 0, 1, 1, undefined)
    expect(absent.opening).toBe(base.opening)
    const full = computeBoxOffice(appeal, inp.market.segments, inp.market.baseMarketValue, inp.standing, inp.promise, inp.budget, inp.shapeEffects, appeal, false, 0, 0, 1, 1, 1)
    expect(full.preMarketingAwareness).toBeGreaterThan(base.preMarketingAwareness)
    expect(full.baseAwareness).toBeGreaterThan(base.baseAwareness)
  })

  it('the forecast reads the same field with the same formula: a continuation\'s locked bar is higher, its band width unchanged', () => {
    const plain = computeForecast(fixture(), ctx)
    const known = computeForecast({ ...fixture(), inheritedAwareness01: 0.8 }, ctx)
    expect(known.expectedOpening).toBeGreaterThan(plain.expectedOpening)
    expect(known.expectedTotal).toBeGreaterThan(plain.expectedTotal)
    expect(known.expectedCriticScore).toBe(plain.expectedCriticScore) // no quality gift
    for (let i = 0; i < plain.segments.length; i++) {
      expect(known.segments[i]!.estimate).toBe(plain.segments[i]!.estimate) // appeal untouched
      expect(known.segments[i]!.high - known.segments[i]!.low).toBe(plain.segments[i]!.high - plain.segments[i]!.low)
    }
    // deterministic centers never read the field: the same centers either way
    expect(JSON.stringify(forecastCenters({ ...fixture(), inheritedAwareness01: 0.8 }).centers)).toBe(JSON.stringify(forecastCenters(fixture()).centers))
  })

  it('lock then live: an intervening change moves the live read; Standing reacts to realized reach only (the locked forecast\'s carry to the released film: p17-r2-managed T04)', () => {
    // the property flopped between greenlight and release: the live input is lower
    const live = resolveReception({ ...fixture(), inheritedAwareness01: 0.4 }, stream('x', 'hollywood-v1', 'c'))
    const liveHigh = resolveReception({ ...fixture(), inheritedAwareness01: 0.8 }, stream('x', 'hollywood-v1', 'c'))
    expect(live.total).toBeLessThan(liveHigh.total)
    expect(live.criticScore).toBe(liveHigh.criticScore) // the field moves awareness, never quality
    // Standing has no continuation source: identical FilmResults move Standing identically regardless of the field
    const standing = { audienceAwareness: 40, industryPrestige: 40, commercialConfidence: 50 }
    const sctx: StandingContext = { castFames: { lead: 70, antagonist: 30, support: 10 }, actualNegative: 4_000_000, requiredNegative: 4_000_000, baseMarketValue: 20_000_000, marketing: 400_000, salaries: 300_000, engaged: false }
    const film = { productionId: 'p', releaseTick: 1, delivered: live.delivered, cohesion: live.cohesion, craft: live.craft, criticMean: live.criticMean, criticSigma: live.criticSigma, criticScore: live.criticScore, reviewVariance: live.reviewVariance, segmentScores: live.segmentScores, boxOffice: { opening: live.opening, total: live.total }, conceptId: 'c', directorId: 'd' }
    expect(JSON.stringify(updateStanding(standing, film, { expectedOpening: 1, expectedTotal: 1, expectedCriticScore: 1 }, sctx))).toBe(JSON.stringify(updateStanding(standing, film, { expectedOpening: 9, expectedTotal: 9, expectedCriticScore: 9 }, sctx)))
  })
})
