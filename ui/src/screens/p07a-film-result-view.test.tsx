// P07A W1 — filmResultView: the canonical three-channel result read-model.
//
// Proves it is DERIVED from already-persisted state (no new persistence / no V17),
// keeps critics / audience / business as three INDEPENDENT channels (D3), and keeps
// BOX OFFICE GROSS distinct from STUDIO REVENUE (D2). Hand-built minimal state so the
// derivation is exercised without a full game bootstrap.

import { describe, it, expect } from 'vitest'
import { filmResultView } from '../engine/adapter.ts'
import type { GameState } from '../engine/adapter.ts'
import type { FilmResult } from '../../../src/core/index.ts'

const film: FilmResult = {
  productionId: 'prod-A',
  releaseTick: 40,
  delivered: { spectacle: 0, story: 0, craft: 0, mood: 0, edge: 0 } as never,
  cohesion: 60,
  craft: 65,
  criticMean: 74,
  criticSigma: 6,
  criticScore: 75, // → band 'hit' (<80), tier 'strong' (70..85), stars 4 (75/20=3.75, ×2=7.5, round=8, /2=4)
  reviewVariance: 5,
  segmentScores: { youngAdult: 80, family: 40, adult: 60, prestige: 20 } as never,
  boxOffice: { opening: 1000, total: 5000 },
  conceptId: 'concept-A',
  directorId: 'dir-A',
}

// GROSS total 5000; studioShare 0.52 ⇒ STUDIO REVENUE 2600 (distinct from gross).
const state = {
  market: {
    segments: [
      { id: 'youngAdult', share: 0.3 },
      { id: 'family', share: 0.25 },
      { id: 'adult', share: 0.3 },
      { id: 'prestige', share: 0.15 },
    ],
  },
  theatricalRuns: [
    {
      productionId: 'prod-A',
      conceptId: 'concept-A',
      releaseTick: 40,
      totalWeeks: 6,
      weekIndex: 6,
      weeklyGross: [2000, 1500, 800, 400, 200, 100], // Σ = 5000 = boxOffice.total
      studioShare: 0.52,
      cumulativeGrossPaid: 5000,
      cumulativeStudioRevenuePaid: 2600,
      economyModelVersion: 1,
      status: 'completed',
    },
  ],
  ledger: [
    { productionId: 'prod-A', kind: 'production', amount: -1500 },
    { productionId: 'prod-A', kind: 'freelancerFee', amount: -500 }, // committed cost = 2000
  ],
} as unknown as GameState

describe('P07A filmResultView — three independent channels', () => {
  const v = filmResultView(state, film)

  it('critic channel: score + stars + band + tier (canonical verdicts)', () => {
    expect(v.critic.score).toBe(75)
    expect(v.critic.stars).toBe(4)
    expect(v.critic.band).toBe('hit')
    expect(v.critic.tier).toBe('strong')
  })

  it('audience channel: share-weighted aggregate + tier + per-segment (never a single quality score)', () => {
    // 0.3*80 + 0.25*40 + 0.3*60 + 0.15*20 = 24 + 10 + 18 + 3 = 55
    expect(v.audience.aggregate).toBeCloseTo(55, 6)
    expect(v.audience.tier).toBe('divided') // 45..57
    expect(v.audience.perSegment.youngAdult).toBe(80)
    expect(v.audience.perSegment.prestige).toBe(20)
  })

  it('business channel: GROSS distinct from STUDIO REVENUE (D2)', () => {
    expect(v.business.boxOfficeGrossTotal).toBe(5000)
    expect(v.business.studioRevenueTotal).toBeCloseTo(2600, 6) // 5000 * 0.52
    expect(v.business.studioRevenueTotal).not.toBe(v.business.boxOfficeGrossTotal)
    expect(v.business.committedCost).toBe(2000)
    expect(v.business.contribution).toBeCloseTo(600, 6) // 2600 − 2000
    expect(v.business.projected).toBe(false) // completed run
    expect(v.business.resultLabel).toBe('Profit')
    expect(v.business.runStatus).toBe('completed')
    expect(v.business.studioRevenuePaidToDate).toBe(2600)
  })

  it('three channels are independent — critic hit, audience divided, business profit can coexist', () => {
    expect(v.critic.band).toBe('hit')
    expect(v.audience.tier).toBe('divided')
    expect(v.business.contribution).toBeGreaterThan(0)
  })
})

describe('P07A filmResultView — legacy film with no theatrical run (fully settled, no fabrication)', () => {
  const legacyState = { ...state, theatricalRuns: [] } as unknown as GameState
  const v = filmResultView(legacyState, film)
  it('falls back to gross as studio revenue and marks the run settled (paid==total)', () => {
    expect(v.business.studioRevenueTotal).toBe(5000) // no run ⇒ full-gross fallback
    expect(v.business.studioRevenuePaidToDate).toBe(5000)
    expect(v.business.runStatus).toBe('none')
    expect(v.business.projected).toBe(false)
  })
})
