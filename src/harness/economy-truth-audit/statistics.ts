// Economy truth audit statistics. Analysis-only; never imported by production code.

import { mean, quantile } from '../d16/stats.js'

export type Distribution = {
  n: number
  mean: number | null
  standardDeviation: number | null
  meanCi95: [number, number] | null
  min: number | null
  p05: number | null
  p10: number | null
  p25: number | null
  median: number | null
  p75: number | null
  p90: number | null
  p95: number | null
  max: number | null
}

export type RateEstimate = {
  count: number
  n: number
  rate: number | null
  wilson95: [number, number] | null
}

export type PairedEffect = {
  interpretation: 'paired seed delta (left minus right)'
  left: string
  right: string
  comparableSeeds: number
  delta: Distribution
  leftWins: number
  ties: number
  rightWins: number
  leftWinRate: RateEstimate
  exemplars: {
    minDelta: { seed: string; delta: number } | null
    maxDelta: { seed: string; delta: number } | null
    firstLeftWinSeed: string | null
    firstRightWinSeed: string | null
    firstTieSeed: string | null
  }
}

function finite(values: readonly number[]): number[] {
  const out: number[] = []
  for (const value of values) {
    if (!Number.isFinite(value)) {
      throw new Error(`economy truth audit: non-finite statistic ${String(value)}`)
    }
    out.push(value)
  }
  return out
}

/** Type-7 quantiles (the established D-16 definition) plus an analytic mean interval. */
export function distribution(values: readonly number[]): Distribution {
  const xs = finite(values)
  if (xs.length === 0) {
    return {
      n: 0,
      mean: null,
      standardDeviation: null,
      meanCi95: null,
      min: null,
      p05: null,
      p10: null,
      p25: null,
      median: null,
      p75: null,
      p90: null,
      p95: null,
      max: null,
    }
  }
  const average = mean(xs)
  let sumSquares = 0
  for (const value of xs) sumSquares += (value - average) ** 2
  const standardDeviation = xs.length < 2 ? 0 : Math.sqrt(sumSquares / (xs.length - 1))
  const halfWidth = xs.length < 2 ? 0 : 1.96 * standardDeviation / Math.sqrt(xs.length)
  return {
    n: xs.length,
    mean: average,
    standardDeviation,
    meanCi95: [average - halfWidth, average + halfWidth],
    min: quantile(xs, 0),
    p05: quantile(xs, 0.05),
    p10: quantile(xs, 0.1),
    p25: quantile(xs, 0.25),
    median: quantile(xs, 0.5),
    p75: quantile(xs, 0.75),
    p90: quantile(xs, 0.9),
    p95: quantile(xs, 0.95),
    max: quantile(xs, 1),
  }
}

/** Wilson score interval for a binomial rate; no unseeded bootstrap or clock. */
export function rate(count: number, n: number): RateEstimate {
  if (!Number.isInteger(count) || !Number.isInteger(n) || count < 0 || n < 0 || count > n) {
    throw new Error(`economy truth audit: invalid rate ${String(count)}/${String(n)}`)
  }
  if (n === 0) return { count, n, rate: null, wilson95: null }
  const p = count / n
  const z = 1.96
  const z2 = z * z
  const denominator = 1 + z2 / n
  const center = (p + z2 / (2 * n)) / denominator
  const half = z * Math.sqrt((p * (1 - p) + z2 / (4 * n)) / n) / denominator
  return { count, n, rate: p, wilson95: [Math.max(0, center - half), Math.min(1, center + half)] }
}

export function pairedEffect(
  left: string,
  right: string,
  leftValues: ReadonlyMap<string, number>,
  rightValues: ReadonlyMap<string, number>,
): PairedEffect {
  const seeds = [...leftValues.keys()].filter((seed) => rightValues.has(seed)).sort()
  const deltas = seeds.map((seed) => leftValues.get(seed)! - rightValues.get(seed)!)
  const leftWins = deltas.filter((value) => value > 0).length
  const ties = deltas.filter((value) => value === 0).length
  const entries = seeds.map((seed, index) => ({ seed, delta: deltas[index]! }))
  const ordered = [...entries].sort((a, b) => a.delta - b.delta || a.seed.localeCompare(b.seed))
  return {
    interpretation: 'paired seed delta (left minus right)',
    left,
    right,
    comparableSeeds: seeds.length,
    delta: distribution(deltas),
    leftWins,
    ties,
    rightWins: deltas.length - leftWins - ties,
    leftWinRate: rate(leftWins, deltas.length),
    exemplars: {
      minDelta: ordered[0] ?? null,
      maxDelta: ordered[ordered.length - 1] ?? null,
      firstLeftWinSeed: entries.find((entry) => entry.delta > 0)?.seed ?? null,
      firstRightWinSeed: entries.find((entry) => entry.delta < 0)?.seed ?? null,
      firstTieSeed: entries.find((entry) => entry.delta === 0)?.seed ?? null,
    },
  }
}
