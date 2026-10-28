// ── P17 Shape A — the two optional guest inputs on ReceptionInputs/ForecastInputs and the Standing context ──
//
// Authority: 1367-stage/p17-prep/P17-CAMEO-CONTRACT.md §3 (publicity replaces the OPENING star term once; the linear
// starDraw, legs and quality read no guest fame; performance enters castExecution at 0.10, never cohesion; Standing
// takes the same delta once through the existing star attention) and §6 items 2-4. The adopted P17 decisions this
// slice must preserve: quality stays distinct from inherited awareness, and franchise R/M/F reads only quality (critic
// and audience scores), so a guest's fame can never move Recognition, Momentum or the property-wide Fatigue a reboot
// inherits.
//
// RED-first at the parent 2c50c9df: imports only predecessor modules; the parent ignores both fields and the context
// key, so every "moves" assertion fails there by assertion. The "absent is byte-identical" leaves are GREEN at both.

import { describe, expect, it } from 'vitest'
import { computeForecast, forecastCenters, type ForecastContext } from '../src/core/forecast.js'
import { resolveReception, type ReceptionInputs } from '../src/core/reception.js'
import { stream } from '../src/core/rng.js'
import { updateStanding, type StandingContext } from '../src/core/standing.js'
import { makeReceptionInputs, makeTalent } from './_fixtures.js'

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
const DELTA = { youngAdult: 0.08, family: 0.08, adult: 0.12, prestige: 0.12 }
const withGuests = (extra: Record<string, unknown>): ReceptionInputs => ({ ...fixture(), ...extra }) as unknown as ReceptionInputs
const ctx: ForecastContext = { seed: 'p17-cameo-seam', productionId: 'prod-1', directorId: 'director', releasedFilms: [], concepts: [] }

describe('P17 Shape A seam — absent and empty guests are the predecessor path, byte for byte', () => {
  it('no field, an explicitly undefined field and an empty execution list resolve identically', () => {
    const a = resolveReception(fixture(), stream('x', 'hollywood-v1', 'a'), true, true, 0.3)
    for (const extra of [{ cameoPublicityDelta: undefined, cameoExecutions: undefined }, { cameoExecutions: [] }]) {
      expect(JSON.stringify(resolveReception(withGuests(extra), stream('x', 'hollywood-v1', 'a'), true, true, 0.3))).toBe(JSON.stringify(a))
    }
    expect(JSON.stringify(computeForecast(withGuests({ cameoExecutions: [] }), ctx, true, true))).toBe(JSON.stringify(computeForecast(fixture(), ctx, true, true)))
  })
})

describe('P17 Shape A seam — fame enters once, at opening; quality never reads it', () => {
  it('publicity raises the opening and the total; legs, critic, craft, cohesion, audience score, linear starDraw and segment scores stay put', () => {
    const plain = resolveReception(fixture(), stream('x', 'hollywood-v1', 'b'))
    const known = resolveReception(withGuests({ cameoPublicityDelta: DELTA }), stream('x', 'hollywood-v1', 'b'))
    expect(known.opening).toBeGreaterThan(plain.opening)
    expect(known.total).toBeGreaterThan(plain.total)
    expect(known.legs).toBe(plain.legs)
    expect(known.criticScore).toBe(plain.criticScore)
    expect(known.criticMean).toBe(plain.criticMean)
    expect(known.craft).toBe(plain.craft)
    expect(known.cohesion).toBe(plain.cohesion)
    expect(known.weightedAudienceScore).toBe(plain.weightedAudienceScore)
    expect(known.starDraw).toBe(plain.starDraw)
    expect(JSON.stringify(known.segmentScores)).toBe(JSON.stringify(plain.segmentScores))
  })

  it('an off-segment guest who displaces better-fit names lowers the opening honestly; quality is still untouched', () => {
    const plain = resolveReception(fixture(), stream('x', 'hollywood-v1', 'c'))
    const negative = resolveReception(withGuests({ cameoPublicityDelta: { youngAdult: -0.1, family: -0.1, adult: -0.1, prestige: -0.1 } }), stream('x', 'hollywood-v1', 'c'))
    expect(negative.opening).toBeLessThan(plain.opening)
    expect(negative.criticScore).toBe(plain.criticScore)
    expect(negative.weightedAudienceScore).toBe(plain.weightedAudienceScore)
  })

  it('a poor guest performance lowers craft slightly through castExecution; cohesion and the principals\' role fit do not move', () => {
    const plain = resolveReception(fixture(), stream('x', 'hollywood-v1', 'd'))
    const poor = resolveReception(withGuests({ cameoExecutions: [0] }), stream('x', 'hollywood-v1', 'd'))
    expect(poor.craft).toBeLessThan(plain.craft)
    expect(plain.craft - poor.craft).toBeLessThan(10)
    expect(poor.cohesion).toBe(plain.cohesion)
    const fp = computeForecast(fixture(), ctx)
    const fg = computeForecast(withGuests({ cameoExecutions: [0], cameoPublicityDelta: DELTA }), ctx)
    expect(fg.expectedCriticScore).toBeLessThan(fp.expectedCriticScore)
    expect(fg.expectedOpening).not.toBe(fp.expectedOpening)
    // the persisted role-fit causal read stays the three principals' alone
    expect(forecastCenters(withGuests({ cameoExecutions: [0] })).core.castWeightedRoleFit).toBe(forecastCenters(fixture()).core.castWeightedRoleFit)
  })

  it('publicity alone never moves the forecast\'s quality bar', () => {
    const fp = computeForecast(fixture(), ctx)
    const fg = computeForecast(withGuests({ cameoPublicityDelta: DELTA }), ctx)
    expect(fg.expectedOpening).toBeGreaterThan(fp.expectedOpening)
    expect(fg.expectedCriticScore).toBe(fp.expectedCriticScore)
  })
})

describe('P17 Shape A seam — Standing takes the guests\' attention once, through the existing driver', () => {
  const standing = { audienceAwareness: 40, industryPrestige: 40, commercialConfidence: 50 }
  const sctx: StandingContext = { castFames: { lead: 30, antagonist: 20, support: 10 }, actualNegative: 4_000_000, requiredNegative: 4_000_000, baseMarketValue: 20_000_000, marketing: 400_000, salaries: 300_000, engaged: true }
  const r = resolveReception(fixture(), stream('x', 'hollywood-v1', 'e'))
  const film = { productionId: 'p', releaseTick: 1, delivered: r.delivered, cohesion: r.cohesion, craft: r.craft, criticMean: r.criticMean, criticSigma: r.criticSigma, criticScore: r.criticScore, reviewVariance: r.reviewVariance, segmentScores: r.segmentScores, boxOffice: { opening: r.opening, total: r.total }, conceptId: 'c', directorId: 'd' }
  const bench = { expectedOpening: r.opening, expectedTotal: r.total, expectedCriticScore: r.criticScore }

  it('an absent delta is the predecessor expression; a positive delta raises awareness and nothing else', () => {
    const base = updateStanding(standing, film, bench, sctx)
    expect(JSON.stringify(updateStanding(standing, film, bench, { ...sctx, cameoAttentionDelta: undefined } as unknown as StandingContext))).toBe(JSON.stringify(base))
    const lifted = updateStanding(standing, film, bench, { ...sctx, cameoAttentionDelta: 0.3 } as unknown as StandingContext)
    expect(lifted.audienceAwareness).toBeGreaterThan(base.audienceAwareness)
    expect(lifted.industryPrestige).toBe(base.industryPrestige)
    expect(lifted.commercialConfidence).toBe(base.commercialConfidence)
  })
})
