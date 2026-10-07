// ── D-16 · statistics — ONE quantile definition for the whole lab ─────────────
// ANALYSIS ONLY. Never imported by src/core/** or ui/src/**.
//
// WHY THIS FILE EXISTS. A0 §5.4 found five re-implementations of "quantile" across
// the shipped harness fleet, using TWO incompatible index rules
// (`floor(q·n)` vs `floor(q·(n−1))`) that disagree at the tails. D-16 defines ONE.
//
// THE DEFINITION (documented, and the only one this lab uses):
//
//   quantile(xs, q) — LINEAR INTERPOLATION BETWEEN ORDER STATISTICS.
//   Sort ascending → s[0..n−1]. Let h = (n − 1) · q, lo = floor(h), frac = h − lo.
//   Result = s[lo] + frac · (s[lo+1] − s[lo])   (with s[n−1] used when lo = n−1).
//
//   This is the "type 7" / R-7 / NumPy-default estimator. Properties we rely on:
//     • q=0 → min, q=1 → max, q=0.5 → the usual median (mean of the two middles
//       for even n).
//     • Continuous in q, so a p90 does not jump by a whole order statistic when
//       one seed is added to the corpus.
//     • n = 1 → that single value for every q. n = 0 → NaN (loud, never silent 0).
//
// No unseeded entropy, no clock, no I/O. Pure functions only.

/** Ascending copy. Non-finite inputs are a caller error and throw loudly. */
function sortedAsc(xs: readonly number[]): number[] {
  const out: number[] = []
  for (const x of xs) {
    if (!Number.isFinite(x)) {
      throw new Error(`d16/stats: non-finite sample ${String(x)} — statistics must be computed on finite numbers`)
    }
    out.push(x)
  }
  out.sort((a, b) => a - b)
  return out
}

/**
 * The lab's single quantile. See the header for the exact formula.
 * @param q in [0,1]; values outside are clamped (a caller bug, but not fatal).
 * @returns NaN for an empty sample (never a silent 0).
 */
export function quantile(xs: readonly number[], q: number): number {
  const n = xs.length
  if (n === 0) return NaN
  const s = sortedAsc(xs)
  if (n === 1) return s[0]!
  const qq = q < 0 ? 0 : q > 1 ? 1 : q
  const h = (n - 1) * qq
  const lo = Math.floor(h)
  const frac = h - lo
  if (lo >= n - 1) return s[n - 1]!
  return s[lo]! + frac * (s[lo + 1]! - s[lo]!)
}

export function mean(xs: readonly number[]): number {
  if (xs.length === 0) return NaN
  let acc = 0
  for (const x of xs) acc += x
  return acc / xs.length
}

export function median(xs: readonly number[]): number {
  return quantile(xs, 0.5)
}
export function p10(xs: readonly number[]): number {
  return quantile(xs, 0.1)
}
export function p25(xs: readonly number[]): number {
  return quantile(xs, 0.25)
}
export function p75(xs: readonly number[]): number {
  return quantile(xs, 0.75)
}
export function p90(xs: readonly number[]): number {
  return quantile(xs, 0.9)
}

export type Summary = {
  n: number
  mean: number
  min: number
  p10: number
  p25: number
  median: number
  p75: number
  p90: number
  max: number
}

/** The lab's standard distribution row. Every emitted distribution uses THIS shape. */
export function summarize(xs: readonly number[]): Summary {
  const n = xs.length
  if (n === 0) {
    return { n: 0, mean: NaN, min: NaN, p10: NaN, p25: NaN, median: NaN, p75: NaN, p90: NaN, max: NaN }
  }
  const s = sortedAsc(xs)
  return {
    n,
    mean: mean(s),
    min: s[0]!,
    p10: quantile(s, 0.1),
    p25: quantile(s, 0.25),
    median: quantile(s, 0.5),
    p75: quantile(s, 0.75),
    p90: quantile(s, 0.9),
    max: s[n - 1]!,
  }
}

/** Fraction of samples satisfying a predicate. NaN for an empty sample. */
export function rateOf<T>(xs: readonly T[], pred: (x: T) => boolean): number {
  if (xs.length === 0) return NaN
  let k = 0
  for (const x of xs) if (pred(x)) k += 1
  return k / xs.length
}

// ── paired-seed machinery ────────────────────────────────────────────────────
// A2/A17 hazard H2: derived streams are keyed by productionId/tick, so two policy
// arms run on the SAME seed share their forecast/discovery noise. That makes
// per-seed pairing the right comparison and independent-sample tests the wrong one.

/** One (seed → value) column. Seeds not present in BOTH columns are dropped. */
export function pairedDeltas(
  a: ReadonlyMap<string, number>,
  b: ReadonlyMap<string, number>,
): { seeds: string[]; deltas: number[] } {
  const seeds = [...a.keys()].filter((s) => b.has(s)).sort()
  const deltas = seeds.map((s) => a.get(s)! - b.get(s)!)
  return { seeds, deltas }
}

/** Fraction of shared seeds on which column `a` strictly beats column `b`. */
export function pairedWinRate(
  a: ReadonlyMap<string, number>,
  b: ReadonlyMap<string, number>,
): number {
  const { deltas } = pairedDeltas(a, b)
  return rateOf(deltas, (d) => d > 0)
}

/**
 * Win-share matrix over policies: for each seed, the policy with the strictly
 * highest value wins; exact ties are split evenly among the tied policies so the
 * shares always sum to 1. Policy iteration order is the sorted key order, so the
 * result is independent of insertion order.
 *
 * NO COMPARABLE SEEDS ⇒ **NaN for every policy, never 0.** B2-C3 makes a caller drop a
 * contaminated run from a column, and a column that ends up empty empties the intersection.
 * Returning zeros there would print a table of "0 %" that sums to 0 and reads like a
 * measured result; NaN renders as `n/a` and forces the reader to notice.
 * `comparableSeedCount` reports the intersection size so the coverage is always stateable.
 */
export function comparableSeedCount(columns: ReadonlyMap<string, ReadonlyMap<string, number>>): number {
  const policies = [...columns.keys()].sort()
  if (policies.length === 0) return 0
  const first = columns.get(policies[0]!)!
  return [...first.keys()].filter((s) => policies.every((p) => columns.get(p)!.has(s))).length
}

export function winShares(columns: ReadonlyMap<string, ReadonlyMap<string, number>>): Record<string, number> {
  const policies = [...columns.keys()].sort()
  if (policies.length === 0) return {}
  // seeds present in EVERY column (a fair comparison needs the same seed set)
  const first = columns.get(policies[0]!)!
  const seeds = [...first.keys()]
    .filter((s) => policies.every((p) => columns.get(p)!.has(s)))
    .sort()
  const wins: Record<string, number> = {}
  for (const p of policies) wins[p] = seeds.length === 0 ? NaN : 0
  if (seeds.length === 0) return wins
  for (const seed of seeds) {
    let best = -Infinity
    for (const p of policies) {
      const v = columns.get(p)!.get(seed)!
      if (v > best) best = v
    }
    const tied = policies.filter((p) => columns.get(p)!.get(seed)! === best)
    for (const p of tied) wins[p] = wins[p]! + 1 / tied.length
  }
  for (const p of policies) wins[p] = wins[p]! / seeds.length
  return wins
}

/** Streaming accumulator so a 1000-seed corpus never holds 1000 full series. */
export class Accumulator {
  private readonly xs: number[] = []
  add(x: number): void {
    this.xs.push(x)
  }
  get count(): number {
    return this.xs.length
  }
  values(): readonly number[] {
    return this.xs
  }
  summary(): Summary {
    return summarize(this.xs)
  }
}
