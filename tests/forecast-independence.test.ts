// PHASE-2 test: §15.6 forecast independence — BEHAVIORAL ONLY.
//
// No module mocks, no stubbing of internals, no coupling to call structure. Every
// assertion is over public exports (computeForecast / forecastCenters / resolveReception
// / RngStream / stream). The claims come from build-contract.md §7 + §15.6 and
// rev4-open-questions M9. No value copied from src/core.

import { describe, it, expect } from 'vitest'
import { computeForecast, forecastCenters } from '../src/core/forecast.js'
import type { ForecastContext, ForecastInputs } from '../src/core/forecast.js'
import { resolveReception } from '../src/core/reception.js'
import { RngStream, stream, TUNING } from '../src/core/index.js'
import type { CastSlot, FilmResult, SegmentId, Talent } from '../src/core/index.js'
import {
  makeConcept,
  makeReceptionInputs,
  makeTalent,
  widePromise,
} from './_fixtures.js'

function inputs(): ForecastInputs {
  return makeReceptionInputs({
    concept: makeConcept({ genre: 'drama' }),
    promise: widePromise('drama'),
    writer: makeTalent({ role: 'writer', skill: 62 }),
    director: makeTalent({ role: 'director', skill: 58, id: 'dir-1' }),
    cast: {
      lead: makeTalent({ role: 'actor', skill: 64, fame: 55 }),
      antagonist: makeTalent({ role: 'actor', skill: 60, fame: 40 }),
      support: makeTalent({ role: 'actor', skill: 58, fame: 35 }),
    } as Record<CastSlot, Talent>,
  })
}

function ctx(over: Partial<ForecastContext> = {}): ForecastContext {
  return {
    seed: over.seed ?? 'indep-seed',
    productionId: over.productionId ?? 'prod-1',
    directorId: over.directorId ?? 'dir-1',
    releasedFilms: over.releasedFilms ?? [],
    concepts: over.concepts ?? [],
  }
}

const centersOf = (segs: { segmentId: SegmentId; center: number }[]) =>
  Object.fromEntries(segs.map((s) => [s.segmentId, s.center])) as Record<SegmentId, number>

// ─────────────────────────────────────────────────────────────────────────────
// 1. Deterministic centers for identical production state and seed
// ─────────────────────────────────────────────────────────────────────────────
describe('§15.6 (1) forecast centers deterministic for identical state + seed', () => {
  it('two forecasts with identical inputs and ctx produce identical centers', () => {
    const a = computeForecast(inputs(), ctx())
    const b = computeForecast(inputs(), ctx())
    expect(centersOf(a.segments)).toEqual(centersOf(b.segments))
  })

  it('forecastCenters helper is a pure function of inputs (identical inputs -> identical)', () => {
    const a = forecastCenters(inputs())
    const b = forecastCenters(inputs())
    expect(a.centers).toEqual(b.centers)
    expect(a.criticMean).toBeCloseTo(b.criticMean, 12)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 2. Consuming the simulation stream before forecasting does not change the forecast
// ─────────────────────────────────────────────────────────────────────────────
describe('§15.6 (2) consuming the sim stream first does not change the forecast', () => {
  it('draining a sim RngStream before computeForecast leaves the forecast unchanged', () => {
    const baseline = computeForecast(inputs(), ctx())
    // Burn a lot of sim-stream entropy (as if many receptions ran first).
    const sim = RngStream.fromSeed('sim-stream')
    for (let i = 0; i < 5000; i++) sim.gaussian(0, 4)
    const after = computeForecast(inputs(), ctx())
    expect(after.segments.map((s) => s.estimate)).toEqual(
      baseline.segments.map((s) => s.estimate),
    )
    expect(centersOf(after.segments)).toEqual(centersOf(baseline.segments))
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 3. Generating a forecast does not advance or alter the simulation stream
// ─────────────────────────────────────────────────────────────────────────────
describe('§15.6 (3) computeForecast does not advance the sim stream', () => {
  it('sim stream serialization is identical before and after computeForecast', () => {
    const sim = RngStream.fromSeed('sim-stream')
    const before = sim.serialize()
    computeForecast(inputs(), ctx())
    const after = sim.serialize()
    expect(after).toBe(before)
  })

  it('a reception driven by a sim stream is byte-identical whether or not a forecast ran between', () => {
    // Run reception with a fresh stream; then run it again with a fresh stream but a
    // forecast interposed. If the forecast touched the sim stream the criticScore would
    // diverge. It must not.
    const inpR = makeReceptionInputs({})
    const withoutForecast = resolveReception(inpR, RngStream.fromSeed('shared'))
    const s2 = RngStream.fromSeed('shared')
    computeForecast(inputs(), ctx())
    const withForecast = resolveReception(inpR, s2)
    expect(withForecast.criticScore).toBe(withoutForecast.criticScore)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 4. Changing only realized-release sampling state does not change the forecast
// 5. Forecast values do not depend on previously sampled critic scores / realized results
// ─────────────────────────────────────────────────────────────────────────────
describe('§15.6 (4/5) forecast ignores realized sampling outcomes', () => {
  it('running reception with wildly different sampled outcomes leaves the forecast identical', () => {
    const baseline = computeForecast(inputs(), ctx())

    // Sample two receptions with very different critic draws (different seeds).
    const recInputs = makeReceptionInputs({})
    const rA = resolveReception(recInputs, RngStream.fromSeed('critic-draw-A'))
    const rB = resolveReception(recInputs, RngStream.fromSeed('critic-draw-Z-wildly-different'))
    // Confirm the two realized draws actually differ (so the test has teeth).
    expect(rA.criticScore).not.toBe(rB.criticScore)

    // Forecast again after each — must be byte-identical to baseline regardless.
    const afterA = computeForecast(inputs(), ctx())
    const afterB = computeForecast(inputs(), ctx())
    expect(afterA.segments.map((s) => s.estimate)).toEqual(baseline.segments.map((s) => s.estimate))
    expect(afterB.segments.map((s) => s.estimate)).toEqual(baseline.segments.map((s) => s.estimate))
    expect(afterA.expectedCriticScore).toBeCloseTo(baseline.expectedCriticScore, 12)
  })

  it('forecast is identical whether ctx.releasedFilms carries extreme or empty realized results', () => {
    // D-3 predicates read releasedFilms only to COUNT history (fame/genre/segment>=60),
    // never to read realized opening/total/critic magnitudes into the estimate. A prior
    // release with absurd box office and critic score, but the SAME predicate truth
    // values, must not move the centers/estimates.
    const genre = 'drama' as const
    // Two priors that both grant the same predicates (same director, same genre, same
    // >=60 segment scores) but wildly different realized magnitudes.
    const mkPrior = (mult: number): FilmResult => ({
      productionId: `prev-${mult}`,
      releaseTick: 0,
      delivered: { intimacy: 0, tonalWeight: 0, kineticEnergy: 0 },
      cohesion: 0.5,
      craft: 60,
      criticMean: 60,
      criticSigma: 4,
      criticScore: 30 + 40 * (mult % 2), // varies, must not matter
      reviewVariance: 0,
      segmentScores: { youngAdult: 70, family: 70, adult: 70, prestige: 70 },
      boxOffice: { opening: 1_000 * mult, total: 1_000_000_000 * mult },
      conceptId: 'c-prior',
      directorId: 'dir-1',
    })
    const concepts = [makeConcept({ id: 'c-prior', genre })]
    const cheap = computeForecast(inputs(), ctx({ releasedFilms: [mkPrior(1)], concepts }))
    const blockbuster = computeForecast(inputs(), ctx({ releasedFilms: [mkPrior(1000)], concepts }))
    expect(centersOf(cheap.segments)).toEqual(centersOf(blockbuster.segments))
    expect(cheap.segments.map((s) => s.estimate)).toEqual(blockbuster.segments.map((s) => s.estimate))
    expect(cheap.segments.map((s) => s.confidence)).toEqual(blockbuster.segments.map((s) => s.confidence))
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 6. Dedicated forecast stream: same offset for same seed+productionId, different for a
//    different productionId
// ─────────────────────────────────────────────────────────────────────────────
describe('§15.6 (6) dedicated forecast stream keyed by seed + productionId', () => {
  it('same seed + productionId -> identical film-level offset', () => {
    const a = computeForecast(inputs(), ctx({ seed: 'S', productionId: 'pid-A' }))
    const b = computeForecast(inputs(), ctx({ seed: 'S', productionId: 'pid-A' }))
    // Same centers (deterministic) and same estimates (same offset) -> identical estimates.
    expect(a.segments.map((s) => s.estimate)).toEqual(b.segments.map((s) => s.estimate))
    // And the offset matches the dedicated forecast stream draw (M9).
    const offset = a.segments[0].estimate - a.segments[0].center
    const expected = stream('S', 'forecast', 'pid-A').gaussian(
      0,
      TUNING.FORECAST_SIGMA[a.segments[0].confidence],
    )
    // Only assert equality where the clamp did not bite.
    if (a.segments[0].estimate > 0 && a.segments[0].estimate < 100) {
      expect(offset).toBeCloseTo(expected, 6)
    }
  })

  it('different productionId (same seed) -> different film-level offset', () => {
    const a = computeForecast(inputs(), ctx({ seed: 'S', productionId: 'pid-A' }))
    const b = computeForecast(inputs(), ctx({ seed: 'S', productionId: 'pid-B' }))
    // Centers are identical (same production inputs); estimates differ because the
    // offset is keyed by productionId.
    expect(centersOf(a.segments)).toEqual(centersOf(b.segments))
    const offA = a.segments[0].estimate - a.segments[0].center
    const offB = b.segments[0].estimate - b.segments[0].center
    expect(offA).not.toBeCloseTo(offB, 6)
  })

  it('same productionId, different seed -> different offset', () => {
    const a = computeForecast(inputs(), ctx({ seed: 'seed-1', productionId: 'pid-A' }))
    const b = computeForecast(inputs(), ctx({ seed: 'seed-2', productionId: 'pid-A' }))
    expect(centersOf(a.segments)).toEqual(centersOf(b.segments))
    const offA = a.segments[0].estimate - a.segments[0].center
    const offB = b.segments[0].estimate - b.segments[0].center
    expect(offA).not.toBeCloseTo(offB, 6)
  })
})
