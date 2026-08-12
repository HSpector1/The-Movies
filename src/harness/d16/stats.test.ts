// Colocated spec for the D-16 statistics module. Run with:
//   npx vitest run --config src/harness/d16/vitest.d16.config.ts

import { describe, it, expect } from 'vitest'
import {
  Accumulator,
  comparableSeedCount,
  mean,
  median,
  p10,
  p90,
  pairedDeltas,
  pairedWinRate,
  quantile,
  rateOf,
  summarize,
  winShares,
} from './stats.js'

describe('d16/stats — the single quantile definition', () => {
  it('is exact on the order statistics for q = 0, 0.25, 0.5, 0.75, 1 with n = 5', () => {
    const xs = [1, 2, 3, 4, 5]
    expect(quantile(xs, 0)).toBe(1)
    expect(quantile(xs, 0.25)).toBe(2)
    expect(quantile(xs, 0.5)).toBe(3)
    expect(quantile(xs, 0.75)).toBe(4)
    expect(quantile(xs, 1)).toBe(5)
  })

  it('interpolates linearly between order statistics', () => {
    // n = 2 ⇒ h = q; q = 0.1 sits 10 % of the way from 0 to 10.
    expect(quantile([0, 10], 0.1)).toBeCloseTo(1, 12)
    expect(quantile([0, 10], 0.9)).toBeCloseTo(9, 12)
    // n = 4, q = 0.5 ⇒ h = 1.5 ⇒ midpoint of s[1], s[2] — the usual even-n median.
    expect(quantile([1, 2, 3, 4], 0.5)).toBe(2.5)
  })

  it('is order-independent (it sorts) and does not mutate its input', () => {
    const xs = [5, 1, 4, 2, 3]
    const copy = [...xs]
    expect(quantile(xs, 0.5)).toBe(3)
    expect(xs).toEqual(copy)
  })

  // ── tail cases ──
  it('returns the single value for every q when n = 1', () => {
    for (const q of [0, 0.1, 0.5, 0.9, 1]) expect(quantile([42], q)).toBe(42)
  })

  it('returns NaN for an empty sample — never a silent 0', () => {
    expect(Number.isNaN(quantile([], 0.5))).toBe(true)
    expect(Number.isNaN(mean([]))).toBe(true)
    expect(Number.isNaN(rateOf([], () => true))).toBe(true)
    const s = summarize([])
    expect(s.n).toBe(0)
    expect(Number.isNaN(s.median)).toBe(true)
  })

  it('clamps q outside [0,1] instead of producing out-of-range indices', () => {
    expect(quantile([1, 2, 3], -1)).toBe(1)
    expect(quantile([1, 2, 3], 2)).toBe(3)
  })

  it('handles negative and duplicated values, and a constant sample', () => {
    expect(quantile([-5, -5, -5], 0.9)).toBe(-5)
    expect(median([-3, -1, 0, 1, 3])).toBe(0)
    expect(p10([-10, 0, 10])).toBeCloseTo(-8, 12)
    expect(p90([-10, 0, 10])).toBeCloseTo(8, 12)
  })

  it('throws loudly on a non-finite sample rather than returning NaN silently', () => {
    expect(() => quantile([1, NaN, 3], 0.5)).toThrow(/non-finite/)
    expect(() => summarize([1, Infinity], )).toThrow(/non-finite/)
  })

  it('summarize returns the standard row with monotone quantiles', () => {
    const xs = Array.from({ length: 100 }, (_, i) => i + 1)
    const s = summarize(xs)
    expect(s.n).toBe(100)
    expect(s.min).toBe(1)
    expect(s.max).toBe(100)
    expect(s.p10).toBeLessThan(s.p25)
    expect(s.p25).toBeLessThan(s.median)
    expect(s.median).toBeLessThan(s.p75)
    expect(s.p75).toBeLessThan(s.p90)
    expect(s.mean).toBeCloseTo(50.5, 12)
  })
})

describe('d16/stats — paired-seed helpers', () => {
  it('pairs only on shared seeds and preserves sorted seed order', () => {
    const a = new Map([['s2', 10], ['s1', 5], ['s3', 1]])
    const b = new Map([['s1', 1], ['s2', 20]])
    const { seeds, deltas } = pairedDeltas(a, b)
    expect(seeds).toEqual(['s1', 's2'])
    expect(deltas).toEqual([4, -10])
    expect(pairedWinRate(a, b)).toBe(0.5)
  })

  it('winShares splits exact ties evenly and always sums to 1', () => {
    const cols = new Map([
      ['A', new Map([['s1', 10], ['s2', 5]])],
      ['B', new Map([['s1', 10], ['s2', 1]])],
    ])
    const w = winShares(cols)
    expect(w['A']).toBeCloseTo(0.75, 12) // 0.5 on the tie + 1 on s2
    expect(w['B']).toBeCloseTo(0.25, 12)
    expect((w['A'] ?? 0) + (w['B'] ?? 0)).toBeCloseTo(1, 12)
  })

  it('winShares only counts seeds present in EVERY column', () => {
    const cols = new Map([
      ['A', new Map([['s1', 10], ['s2', 5]])],
      ['B', new Map([['s1', 1]])],
    ])
    const w = winShares(cols)
    expect(w['A']).toBe(1)
    expect(w['B']).toBe(0)
    expect(comparableSeedCount(cols)).toBe(1)
  })

  // B2-C3: a column emptied by the engagement-cliff filter must make the matrix LOUD,
  // not print a table of "0 %" that reads like a measured tie.
  it('winShares is NaN for every policy when no seed is comparable, and says so', () => {
    const cols = new Map([
      ['A', new Map([['s1', 10]])],
      ['B', new Map<string, number>()],
    ])
    expect(comparableSeedCount(cols)).toBe(0)
    const w = winShares(cols)
    expect(Number.isNaN(w['A']!)).toBe(true)
    expect(Number.isNaN(w['B']!)).toBe(true)
  })

  it('Accumulator streams without holding a second copy of the distribution', () => {
    const acc = new Accumulator()
    for (let i = 1; i <= 9; i++) acc.add(i)
    expect(acc.count).toBe(9)
    expect(acc.summary().median).toBe(5)
  })
})
