import { describe, expect, it } from 'vitest'

import { distribution, pairedEffect, rate } from './statistics.js'

describe('economy truth audit statistics', () => {
  it('uses the established type-7 quantiles and finite analytic summaries', () => {
    const result = distribution([1, 2, 3, 4])
    expect(result.n).toBe(4)
    expect(result.median).toBe(2.5)
    expect(result.p10).toBeCloseTo(1.3)
    expect(result.meanCi95?.[0]).toBeLessThan(result.mean!)
    expect(result.meanCi95?.[1]).toBeGreaterThan(result.mean!)
  })

  it('reports Wilson uncertainty without inventing an estimate for an empty cell', () => {
    expect(rate(0, 0)).toEqual({ count: 0, n: 0, rate: null, wilson95: null })
    const result = rate(50, 100)
    expect(result.rate).toBe(0.5)
    expect(result.wilson95?.[0]).toBeCloseTo(0.4038, 3)
    expect(result.wilson95?.[1]).toBeCloseTo(0.5962, 3)
  })

  it('pairs on the exact shared seed intersection', () => {
    const result = pairedEffect(
      'a',
      'b',
      new Map([['s2', 8], ['s1', 5], ['left-only', 99]]),
      new Map([['s1', 3], ['s2', 8], ['right-only', 99]]),
    )
    expect(result.comparableSeeds).toBe(2)
    expect(result.delta.median).toBe(1)
    expect(result.leftWins).toBe(1)
    expect(result.ties).toBe(1)
    expect(result.exemplars.minDelta).toEqual({ seed: 's2', delta: 0 })
    expect(result.exemplars.maxDelta).toEqual({ seed: 's1', delta: 2 })
  })
})
