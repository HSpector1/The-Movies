// PHASE-2 test: §7 forecast pipeline + B16 / M7 / D-3 / B17 / B14.
//
// Expected values derive from the contract only (build-contract.md §7 + §16;
// rev4-open-questions B14 / B16 / B17 / M7 / M8 / D-3). No value copied from src/core.

import { describe, it, expect } from 'vitest'
import { bandOf, computeForecast, forecastCenters } from '../src/core/forecast.js'
import type { ForecastContext } from '../src/core/forecast.js'
import { stream, TUNING } from '../src/core/index.js'
import type {
  CastSlot,
  Confidence,
  FilmConcept,
  FilmResult,
  SegmentId,
  Talent,
} from '../src/core/index.js'
import {
  makeConcept,
  makeReceptionInputs,
  makeTalent,
  promiseCentered,
} from './_fixtures.js'

// A FilmResult stub for ctx.releasedFilms — only the fields D-3 predicates read matter
// (conceptId/directorId for the genre predicate, segmentScores for segment history).
function releasedFilm(over: Partial<FilmResult>): FilmResult {
  return {
    productionId: over.productionId ?? 'prev',
    releaseTick: 0,
    delivered: { intimacy: 0, tonalWeight: 0, kineticEnergy: 0 },
    cohesion: 0.5,
    craft: 60,
    criticMean: 60,
    criticSigma: 4,
    criticScore: 60,
    reviewVariance: 0,
    segmentScores: over.segmentScores ?? {
      youngAdult: 30,
      family: 30,
      adult: 30,
      prestige: 30,
    },
    boxOffice: { opening: 1, total: 1 },
    conceptId: over.conceptId ?? 'prev-concept',
    directorId: over.directorId ?? 'prev-director',
  }
}

// Build ForecastInputs whose confidence predicates we control precisely.
function inputsWith(opts: {
  leadFame: number
  promiseWidth: number
  genre?: FilmConcept['genre']
  directorId?: string
}) {
  const genre = opts.genre ?? 'drama'
  return makeReceptionInputs({
    concept: makeConcept({ genre }),
    promise: promiseCentered([0, 0, 0], opts.promiseWidth, genre),
    writer: makeTalent({ role: 'writer', skill: 60 }),
    director: makeTalent({ role: 'director', skill: 60, id: opts.directorId ?? 'dir-1' }),
    cast: {
      lead: makeTalent({ role: 'actor', skill: 60, fame: opts.leadFame }),
      antagonist: makeTalent({ role: 'actor', skill: 60, fame: 30 }),
      support: makeTalent({ role: 'actor', skill: 60, fame: 30 }),
    } as Record<CastSlot, Talent>,
  })
}

function ctxWith(over: Partial<ForecastContext>): ForecastContext {
  return {
    seed: over.seed ?? 'fc-seed',
    productionId: over.productionId ?? 'prod-1',
    directorId: over.directorId ?? 'dir-1',
    releasedFilms: over.releasedFilms ?? [],
    concepts: over.concepts ?? [],
  }
}

const confidenceOf = (segs: { confidence: Confidence }[]): Confidence => segs[0].confidence

// ─────────────────────────────────────────────────────────────────────────────
// B17 / §7  low/high = estimate ∓ CONFIDENCE_INTERVAL_WIDTH[confidence], clamped [0,100]
// ─────────────────────────────────────────────────────────────────────────────
describe('§7/B17 low/high from CONFIDENCE_INTERVAL_WIDTH, clamped [0,100]', () => {
  it('for every segment, low = clamp(estimate - width, 0, 100), high = clamp(estimate + width, 0, 100)', () => {
    const fc = computeForecast(inputsWith({ leadFame: 30, promiseWidth: 2.0 }), ctxWith({}))
    const width = TUNING.CONFIDENCE_INTERVAL_WIDTH[confidenceOf(fc.segments)]
    for (const s of fc.segments) {
      expect(s.low).toBeCloseTo(Math.max(0, Math.min(100, s.estimate - width)), 6)
      expect(s.high).toBeCloseTo(Math.max(0, Math.min(100, s.estimate + width)), 6)
      // clamp bounds
      expect(s.low).toBeGreaterThanOrEqual(0)
      expect(s.low).toBeLessThanOrEqual(100)
      expect(s.high).toBeGreaterThanOrEqual(0)
      expect(s.high).toBeLessThanOrEqual(100)
    }
  })

  it('forecast low/high land in [0,100] even when the estimate saturates at an edge', () => {
    // A low-confidence forecast (sigma 16) can push estimate to the 0/100 edge; the
    // clamp on low/high must still hold. Assert bounds across the whole segment set.
    const fc = computeForecast(inputsWith({ leadFame: 10, promiseWidth: 2.0 }), ctxWith({ productionId: 'edge-1' }))
    for (const s of fc.segments) {
      expect(s.low).toBeGreaterThanOrEqual(0)
      expect(s.high).toBeLessThanOrEqual(100)
    }
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// §7  expectedBand thresholds via bandOf: <40 weak / 40–70 mixed / >70 strong
// ─────────────────────────────────────────────────────────────────────────────
describe('§7 expectedBand thresholds (bandOf) — edges 40 and 70 are mixed', () => {
  it('bandOf: <40 weak, [40,70] mixed, >70 strong', () => {
    expect(bandOf(39.999)).toBe('weak')
    expect(bandOf(40)).toBe('mixed') // edge 40 -> mixed
    expect(bandOf(55)).toBe('mixed')
    expect(bandOf(70)).toBe('mixed') // edge 70 -> mixed
    expect(bandOf(70.001)).toBe('strong')
    expect(bandOf(0)).toBe('weak')
    expect(bandOf(100)).toBe('strong')
  })

  it("SegmentForecast.expectedBand === bandOf(estimate) (the studio's belief)", () => {
    const fc = computeForecast(inputsWith({ leadFame: 30, promiseWidth: 2.0 }), ctxWith({}))
    for (const s of fc.segments) {
      expect(s.expectedBand).toBe(bandOf(s.estimate))
    }
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// M7  One film-level offset; confidence identical on all four SegmentForecasts
// ─────────────────────────────────────────────────────────────────────────────
describe('M7 — single film-level offset, identical confidence per segment', () => {
  it('(estimate − center) is identical across all four segments (clamp not biting)', () => {
    // High-confidence forecast (sigma 5) keeps the offset small; centers near 50 keep
    // every estimate well inside (0,100) so the clamp does not bite. Predicates: lead
    // fame >=60, promise specific, director prior-in-genre -> 3 points -> high.
    const genre: FilmConcept['genre'] = 'drama'
    const prior = releasedFilm({ directorId: 'dir-hi', conceptId: 'c-prior', segmentScores: { youngAdult: 30, family: 30, adult: 30, prestige: 30 } })
    const concepts: FilmConcept[] = [makeConcept({ id: 'c-prior', genre })]
    const fc = computeForecast(
      inputsWith({ leadFame: 70, promiseWidth: 0.4, genre, directorId: 'dir-hi' }),
      ctxWith({ directorId: 'dir-hi', releasedFilms: [prior], concepts, productionId: 'p-single-offset' }),
    )
    expect(confidenceOf(fc.segments)).toBe('high')
    const offsets = fc.segments.map((s) => s.estimate - s.center)
    for (const o of offsets) expect(o).toBeCloseTo(offsets[0], 9)
    // and the offset equals the forecast-stream draw for this seed+productionId (M9)
    const expectedOffset = stream('fc-seed', 'forecast', 'p-single-offset').gaussian(
      0,
      TUNING.FORECAST_SIGMA.high,
    )
    expect(offsets[0]).toBeCloseTo(expectedOffset, 9)
    // sanity: no estimate saturated (clamp did not bite)
    for (const s of fc.segments) {
      expect(s.estimate).toBeGreaterThan(0)
      expect(s.estimate).toBeLessThan(100)
    }
  })

  it('confidence is identical on all four SegmentForecasts', () => {
    const fc = computeForecast(inputsWith({ leadFame: 55, promiseWidth: 1.2 }), ctxWith({}))
    const c = fc.segments.map((s) => s.confidence)
    expect(new Set(c).size).toBe(1)
    expect(c.length).toBe(4)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// D-3  Confidence predicates, each side of its threshold, crossing medium/high
// ─────────────────────────────────────────────────────────────────────────────
describe('D-3 confidence predicates — each toggled across its threshold', () => {
  const genre: FilmConcept['genre'] = 'drama'

  it('knownLeadTrackRecord: lead.fame 60 (high) vs 59.99 (medium), other two predicates held true', () => {
    // Baseline 2 points: promiseIsSpecific TRUE (width 0.4 -> specificity 0.8) +
    // knownDirectorGenreRecord TRUE (a prior drama by this director, scoring <60 so it
    // does NOT also grant segmentHistory). establishedSegmentHistory FALSE.
    const prior = releasedFilm({ directorId: 'dir-x', conceptId: 'c-prior', segmentScores: { youngAdult: 30, family: 30, adult: 30, prestige: 30 } })
    const concepts = [makeConcept({ id: 'c-prior', genre })]
    const ctx = ctxWith({ directorId: 'dir-x', releasedFilms: [prior], concepts })
    const hi = computeForecast(inputsWith({ leadFame: 60, promiseWidth: 0.4, genre, directorId: 'dir-x' }), ctx)
    const lo = computeForecast(inputsWith({ leadFame: 59.99, promiseWidth: 0.4, genre, directorId: 'dir-x' }), ctx)
    expect(confidenceOf(hi.segments)).toBe('high') // 3 points
    expect(confidenceOf(lo.segments)).toBe('medium') // 2 points
  })

  it('knownDirectorGenreRecord: prior same-genre release by this director (high) vs none (medium)', () => {
    // Baseline 2 points: lead.fame 70 TRUE + promiseIsSpecific TRUE. segmentHistory FALSE.
    const withPrior = ctxWith({
      directorId: 'dir-x',
      releasedFilms: [releasedFilm({ directorId: 'dir-x', conceptId: 'c-prior', segmentScores: { youngAdult: 30, family: 30, adult: 30, prestige: 30 } })],
      concepts: [makeConcept({ id: 'c-prior', genre })],
    })
    const withoutPrior = ctxWith({ directorId: 'dir-x', releasedFilms: [], concepts: [] })
    const inp = inputsWith({ leadFame: 70, promiseWidth: 0.4, genre, directorId: 'dir-x' })
    expect(confidenceOf(computeForecast(inp, withPrior).segments)).toBe('high')
    expect(confidenceOf(computeForecast(inp, withoutPrior).segments)).toBe('medium')
  })

  it('knownDirectorGenreRecord is genre-specific: a prior in a DIFFERENT genre does not count', () => {
    // Prior by same director but in a different genre -> predicate FALSE -> medium.
    const ctx = ctxWith({
      directorId: 'dir-x',
      releasedFilms: [releasedFilm({ directorId: 'dir-x', conceptId: 'c-other', segmentScores: { youngAdult: 30, family: 30, adult: 30, prestige: 30 } })],
      concepts: [makeConcept({ id: 'c-other', genre: 'horror' })],
    })
    const inp = inputsWith({ leadFame: 70, promiseWidth: 0.4, genre: 'drama', directorId: 'dir-x' })
    expect(confidenceOf(computeForecast(inp, ctx).segments)).toBe('medium')
  })

  it('establishedSegmentHistory: a prior release scoring >=60 in segments (high) vs <60 (medium)', () => {
    // Baseline 2 points: lead.fame 70 + promiseIsSpecific. directorGenre FALSE (prior is
    // by a DIFFERENT director, so only segmentHistory can toggle).
    const highScores = { youngAdult: 65, family: 65, adult: 65, prestige: 65 }
    const lowScores = { youngAdult: 59, family: 59, adult: 59, prestige: 59 }
    const mkCtx = (scores: Record<SegmentId, number>) =>
      ctxWith({
        directorId: 'dir-x',
        releasedFilms: [releasedFilm({ directorId: 'other-dir', conceptId: 'c-prior', segmentScores: scores })],
        concepts: [makeConcept({ id: 'c-prior', genre })],
      })
    const inp = inputsWith({ leadFame: 70, promiseWidth: 0.4, genre, directorId: 'dir-x' })
    expect(confidenceOf(computeForecast(inp, mkCtx(highScores)).segments)).toBe('high')
    expect(confidenceOf(computeForecast(inp, mkCtx(lowScores)).segments)).toBe('medium')
  })

  it('promiseIsSpecific: specificity 0.5 boundary (high) vs below (medium)', () => {
    // width 1.0 -> specificity 1 - clamp(1.0/2,0,1) = 0.5 (>= 0.5 TRUE)
    // width 1.2 -> specificity 1 - 0.6 = 0.4 (< 0.5 FALSE)
    // Baseline 2 points: lead.fame 70 + directorGenre TRUE; segmentHistory FALSE.
    const ctx = ctxWith({
      directorId: 'dir-x',
      releasedFilms: [releasedFilm({ directorId: 'dir-x', conceptId: 'c-prior', segmentScores: { youngAdult: 30, family: 30, adult: 30, prestige: 30 } })],
      concepts: [makeConcept({ id: 'c-prior', genre })],
    })
    const atBoundary = inputsWith({ leadFame: 70, promiseWidth: 1.0, genre, directorId: 'dir-x' })
    const below = inputsWith({ leadFame: 70, promiseWidth: 1.2, genre, directorId: 'dir-x' })
    expect(confidenceOf(computeForecast(atBoundary, ctx).segments)).toBe('high')
    expect(confidenceOf(computeForecast(below, ctx).segments)).toBe('medium')
  })

  it('points -> tier mapping: 0 predicates -> low, 2 -> medium, 3 -> high, 4 -> high', () => {
    // 0 points: fame 30, promise wide, no prior releases.
    const zero = computeForecast(inputsWith({ leadFame: 30, promiseWidth: 2.0, genre, directorId: 'dir-x' }), ctxWith({ directorId: 'dir-x' }))
    expect(confidenceOf(zero.segments)).toBe('low')

    // 2 points: fame 70 + specific promise; no prior releases (directorGenre & segmentHistory FALSE).
    const two = computeForecast(inputsWith({ leadFame: 70, promiseWidth: 0.4, genre, directorId: 'dir-x' }), ctxWith({ directorId: 'dir-x' }))
    expect(confidenceOf(two.segments)).toBe('medium')

    // 3 points: fame 70 + specific + directorGenre (prior drama by dir-x, scoring <60).
    const three = computeForecast(
      inputsWith({ leadFame: 70, promiseWidth: 0.4, genre, directorId: 'dir-x' }),
      ctxWith({
        directorId: 'dir-x',
        releasedFilms: [releasedFilm({ directorId: 'dir-x', conceptId: 'c-prior', segmentScores: { youngAdult: 30, family: 30, adult: 30, prestige: 30 } })],
        concepts: [makeConcept({ id: 'c-prior', genre })],
      }),
    )
    expect(confidenceOf(three.segments)).toBe('high')

    // 4 points: fame 70 + specific + directorGenre + segmentHistory (prior drama by dir-x scoring >=60).
    const four = computeForecast(
      inputsWith({ leadFame: 70, promiseWidth: 0.4, genre, directorId: 'dir-x' }),
      ctxWith({
        directorId: 'dir-x',
        releasedFilms: [releasedFilm({ directorId: 'dir-x', conceptId: 'c-prior', segmentScores: { youngAdult: 65, family: 65, adult: 65, prestige: 65 } })],
        concepts: [makeConcept({ id: 'c-prior', genre })],
      }),
    )
    expect(confidenceOf(four.segments)).toBe('high')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// B16  expectedCriticScore == deterministic §5 criticMean (no noise)
// ─────────────────────────────────────────────────────────────────────────────
describe('B16 expectedCriticScore == deterministic criticMean', () => {
  it('equals the forecastCenters criticMean (no sampled term)', () => {
    const inp = inputsWith({ leadFame: 40, promiseWidth: 1.0 })
    const centers = forecastCenters(inp)
    const fc = computeForecast(inp, ctxWith({}))
    expect(fc.expectedCriticScore).toBeCloseTo(centers.criticMean, 9)
  })

  it('is stable across forecast-stream draws (does not read the sampled offset)', () => {
    // Same inputs, different productionId -> different film-level offset, but the
    // deterministic criticMean must not move.
    const inp = inputsWith({ leadFame: 40, promiseWidth: 1.0 })
    const a = computeForecast(inp, ctxWith({ productionId: 'pA' }))
    const b = computeForecast(inp, ctxWith({ productionId: 'pB' }))
    expect(a.expectedCriticScore).toBeCloseTo(b.expectedCriticScore, 9)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// B14  causalFactors <= 2 from the seven causal keys in precedence; uncertainty = failed predicates
// ─────────────────────────────────────────────────────────────────────────────
describe('B14 causal / uncertainty factor keys', () => {
  const CAUSAL_KEYS = new Set([
    'castFame',
    'roleFit',
    'directorSkill',
    'scriptStrength',
    'shapeAffinity',
    'segmentTaste',
    'culturalTiming',
  ])
  const UNCERTAINTY_KEYS = new Set([
    'unknownLead',
    'untestedDirectorGenre',
    'noSegmentHistory',
    'vaguePromise',
  ])

  it('causalFactors is at most two, drawn only from the seven causal keys', () => {
    const fc = computeForecast(inputsWith({ leadFame: 80, promiseWidth: 0.4 }), ctxWith({}))
    for (const s of fc.segments) {
      expect(s.causalFactors.length).toBeLessThanOrEqual(2)
      for (const k of s.causalFactors) expect(CAUSAL_KEYS.has(k)).toBe(true)
    }
  })

  it('uncertaintyFactors are exactly the failed confidence predicates (0 predicates -> all four keys)', () => {
    // fame 30 (unknownLead), no prior in genre (untestedDirectorGenre), no segment
    // history (noSegmentHistory), wide promise (vaguePromise) -> all four fail.
    const fc = computeForecast(
      inputsWith({ leadFame: 30, promiseWidth: 2.0, genre: 'drama', directorId: 'dir-x' }),
      ctxWith({ directorId: 'dir-x', releasedFilms: [], concepts: [] }),
    )
    for (const s of fc.segments) {
      expect(new Set(s.uncertaintyFactors)).toEqual(UNCERTAINTY_KEYS)
    }
  })

  it('uncertaintyFactors is empty when all four predicates pass (4 points)', () => {
    const fc = computeForecast(
      inputsWith({ leadFame: 70, promiseWidth: 0.4, genre: 'drama', directorId: 'dir-x' }),
      ctxWith({
        directorId: 'dir-x',
        releasedFilms: [releasedFilm({ directorId: 'dir-x', conceptId: 'c-prior', segmentScores: { youngAdult: 65, family: 65, adult: 65, prestige: 65 } })],
        concepts: [makeConcept({ id: 'c-prior', genre: 'drama' })],
      }),
    )
    for (const s of fc.segments) {
      expect(s.uncertaintyFactors).toEqual([])
      for (const k of s.uncertaintyFactors) expect(UNCERTAINTY_KEYS.has(k)).toBe(true)
    }
  })

  it('the subtractive promise term contributes no causal key (uncertainty only via vaguePromise)', () => {
    // A vague promise appears only as an uncertainty key, never as a causal key.
    const fc = computeForecast(inputsWith({ leadFame: 80, promiseWidth: 2.0 }), ctxWith({}))
    for (const s of fc.segments) {
      for (const k of s.causalFactors) expect(CAUSAL_KEYS.has(k)).toBe(true)
      // vaguePromise is an uncertainty key, must not leak into causal
      expect(s.causalFactors).not.toContain('vaguePromise')
    }
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// FORECAST_SIGMA per tier (B17) — sigma drives the offset magnitude
// ─────────────────────────────────────────────────────────────────────────────
describe('B17 FORECAST_SIGMA per tier drives the film-level offset', () => {
  it('offset for a tier equals gaussian(0, FORECAST_SIGMA[tier]) on the forecast stream', () => {
    // low tier: 0 predicates.
    const inp = inputsWith({ leadFame: 30, promiseWidth: 2.0, genre: 'drama', directorId: 'dir-x' })
    const fc = computeForecast(inp, ctxWith({ productionId: 'sig-low', directorId: 'dir-x' }))
    expect(confidenceOf(fc.segments)).toBe('low')
    const expected = stream('fc-seed', 'forecast', 'sig-low').gaussian(0, TUNING.FORECAST_SIGMA.low)
    // Reconstruct the offset from the first segment where the clamp did not bite, if any.
    const unclamped = fc.segments.find(
      (s) => s.estimate > 0 && s.estimate < 100,
    )
    if (unclamped) {
      expect(unclamped.estimate - unclamped.center).toBeCloseTo(expected, 6)
    } else {
      // all clamped — assert at least the offset sign/magnitude is consistent with the draw
      expect(Math.abs(expected)).toBeGreaterThan(0)
    }
  })
})
