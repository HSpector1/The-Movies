// P07A W2 — the rich release-results DTO (StudioFilmResultSnapshot) and its mapper.
//
// Proves the wire mapper `filmResultSnapshot` stays EXACTLY aligned with the schema DTO
// (no silent drift), that the three channels are carried independently, and that BOX
// OFFICE GROSS is distinct from STUDIO REVENUE on the wire (D2/D3/D5 — money lives here,
// in the result projection, not on the rail rows).

import { describe, it, expect } from 'vitest'
import { filmResultSnapshot } from '../engine/adapter.ts'
import type { GameState } from '../engine/adapter.ts'
import type { FilmResult } from '../../../src/core/index.ts'
import { schemaDefinition } from '../../../bridge/schema/runtime.ts'

const film: FilmResult = {
  productionId: 'prod-A',
  releaseTick: 40,
  delivered: { spectacle: 0, story: 0, craft: 0, mood: 0, edge: 0 } as never,
  cohesion: 60,
  craft: 65,
  criticMean: 74,
  criticSigma: 6,
  criticScore: 75,
  reviewVariance: 5,
  segmentScores: { youngAdult: 80, family: 40, adult: 60, prestige: 20 } as never,
  boxOffice: { opening: 1000, total: 5000 },
  conceptId: 'concept-A',
  directorId: 'dir-A',
}
const state = {
  market: {
    tick: 46,
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
      weeklyGross: [2000, 1500, 800, 400, 200, 100],
      studioShare: 0.52,
      cumulativeGrossPaid: 5000,
      cumulativeStudioRevenuePaid: 2600,
      economyModelVersion: 1,
      status: 'completed',
    },
  ],
  ledger: [
    { productionId: 'prod-A', kind: 'production', amount: -1500 },
    { productionId: 'prod-A', kind: 'freelancerFee', amount: -500 },
  ],
  concepts: [{ id: 'concept-A', title: 'The Quiet Hour' }],
} as unknown as GameState

describe('P07A W2 — StudioFilmResultSnapshot mapper ↔ schema alignment', () => {
  const snap = filmResultSnapshot(state, film, 46) as Record<string, unknown>
  const schema = schemaDefinition('StudioFilmResultSnapshot') as unknown as {
    properties: Record<string, unknown>
  }

  it('mapper output keys exactly match the schema DTO properties (no drift)', () => {
    expect(Object.keys(snap).sort()).toEqual(Object.keys(schema.properties).sort())
  })

  it('carries the three independent channels', () => {
    expect(snap.criticScore).toBe(75)
    expect(snap.criticBand).toBe('hit')
    expect(snap.criticTier).toBe('strong')
    expect(snap.audienceTier).toBe('divided')
    expect(Array.isArray(snap.audiencePerSegment)).toBe(true)
    expect((snap.audiencePerSegment as unknown[]).length).toBe(4)
  })

  it('keeps BOX OFFICE GROSS distinct from STUDIO REVENUE on the wire (D2/D5)', () => {
    expect(snap.boxOfficeGrossTotal).toBe(5000)
    expect(snap.studioRevenueTotal).toBeCloseTo(2600, 6)
    expect(snap.boxOfficeGrossTotal).not.toBe(snap.studioRevenueTotal)
    expect(snap.title).toBe('The Quiet Hour')
    expect(snap.weeksAgo).toBe(6) // 46 − 40
  })
})
