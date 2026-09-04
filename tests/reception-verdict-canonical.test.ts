// P07A W0 — characterization tests for the canonical reception-verdict module.
//
// These pin the PRE-P07A shipped behavior verbatim (thresholds unchanged) so the
// convergence refactor (lot band, newspaper critic/audience tiers, duplicated
// finance helpers → src/core/receptionVerdict.ts) is proven behavior-preserving.
// Boundary values are asserted on both sides of every threshold.

import { describe, it, expect } from 'vitest'
import {
  criticStars,
  criticBand,
  criticTier,
  audienceTier,
  aggregateAudienceScore,
  filmAudienceScore,
  filmCommittedCost,
} from '../src/core/receptionVerdict.js'

describe('canonical criticBand (was ui adapter lotReceptionBand: 40/60/80)', () => {
  it('classifies at boundaries', () => {
    expect(criticBand(0)).toBe('flop')
    expect(criticBand(39.999)).toBe('flop')
    expect(criticBand(40)).toBe('mixed')
    expect(criticBand(59.999)).toBe('mixed')
    expect(criticBand(60)).toBe('hit')
    expect(criticBand(79.999)).toBe('hit')
    expect(criticBand(80)).toBe('smash')
    expect(criticBand(100)).toBe('smash')
  })
})

describe('canonical criticTier (was newspaper.ts: 35/55/70/85)', () => {
  it('classifies at boundaries', () => {
    expect(criticTier(0)).toBe('pan')
    expect(criticTier(34.999)).toBe('pan')
    expect(criticTier(35)).toBe('mixed')
    expect(criticTier(54.999)).toBe('mixed')
    expect(criticTier(55)).toBe('favorable')
    expect(criticTier(69.999)).toBe('favorable')
    expect(criticTier(70)).toBe('strong')
    expect(criticTier(84.999)).toBe('strong')
    expect(criticTier(85)).toBe('rave')
    expect(criticTier(100)).toBe('rave')
  })
})

describe('canonical audienceTier (was newspaper.ts: 30/45/57/72)', () => {
  it('classifies at boundaries', () => {
    expect(audienceTier(0)).toBe('hated')
    expect(audienceTier(29.999)).toBe('hated')
    expect(audienceTier(30)).toBe('disliked')
    expect(audienceTier(44.999)).toBe('disliked')
    expect(audienceTier(45)).toBe('divided')
    expect(audienceTier(56.999)).toBe('divided')
    expect(audienceTier(57)).toBe('liked')
    expect(audienceTier(71.999)).toBe('liked')
    expect(audienceTier(72)).toBe('loved')
    expect(audienceTier(100)).toBe('loved')
  })
})

describe('canonical criticStars (0-5 half-star from 0-100)', () => {
  it('maps + clamps in half steps', () => {
    expect(criticStars(0)).toBe(0)
    expect(criticStars(10)).toBe(0.5)
    expect(criticStars(50)).toBe(2.5)
    expect(criticStars(90)).toBe(4.5)
    expect(criticStars(100)).toBe(5)
    expect(criticStars(200)).toBe(5) // clamp high
    expect(criticStars(-20)).toBe(0) // clamp low
  })
})

describe('canonical aggregateAudienceScore', () => {
  const seg = { youngAdult: 80, family: 40, adult: 60, prestige: 20 } as Record<string, number>
  it('share-weights and falls back to a plain mean when shares are absent', () => {
    const shares = { youngAdult: 0.5, family: 0.5, adult: 0, prestige: 0 } as Record<string, number>
    // (80*0.5 + 40*0.5) / 1 = 60
    expect(aggregateAudienceScore(seg as never, shares as never)).toBeCloseTo(60, 6)
    const noShares = { youngAdult: 0, family: 0, adult: 0, prestige: 0 } as Record<string, number>
    // plain mean of 80,40,60,20 = 50
    expect(aggregateAudienceScore(seg as never, noShares as never)).toBeCloseTo(50, 6)
  })
})

describe('canonical filmAudienceScore + filmCommittedCost (consolidated dups)', () => {
  it('share-weights segment scores over market segments', () => {
    const state = {
      market: { segments: [
        { id: 'youngAdult', share: 0.5 },
        { id: 'family', share: 0.5 },
      ] },
    } as never
    const film = { segmentScores: { youngAdult: 80, family: 40 } } as never
    // 0.5*80 + 0.5*40 = 60
    expect(filmAudienceScore(state, film)).toBeCloseTo(60, 6)
  })
  it('sums negated production + freelancerFee ledger entries for the exact id only', () => {
    const state = {
      ledger: [
        { productionId: 'prod-A', kind: 'production', amount: -1000 },
        { productionId: 'prod-A', kind: 'freelancerFee', amount: -200 },
        { productionId: 'prod-A', kind: 'boxOffice', amount: 5000 }, // ignored (not a cost kind)
        { productionId: 'prod-B', kind: 'production', amount: -9999 }, // ignored (other id)
      ],
    } as never
    expect(filmCommittedCost(state, 'prod-A')).toBe(1200)
    expect(filmCommittedCost(state, 'prod-B')).toBe(9999)
    expect(filmCommittedCost(state, 'prod-Z')).toBe(0)
  })
})
