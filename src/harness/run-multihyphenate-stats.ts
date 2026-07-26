// ── RULING B (2026-07-26) multi-hyphenate generation distribution study ────────
// Measures the revised talent-generation distribution over a corpus of ≥10k
// generated talent. Read-only over the PUBLIC core surface (no src/core internals,
// no unseeded entropy). Writes out/d9-dev/multihyphenate-stats.json.
//
// Reports the RULING B 14-item list:
//   1. revised usable-secondary rate (a secondary discipline OVR ≥ 60)
//   2. rate by discipline PAIRING (primary → which secondary is usable)
//   3. %≥60 / ≥70 / ≥80 among secondary-discipline OVRs
//   4. % of talent with ≥2 usable secondaries
//   5. primary-OVR distribution (mean/var + histogram + quantiles)
//   6. secondary-OVR distribution (mean/var + histogram + quantiles)
//   7. role-rating correlations (primary OVR ↔ best-secondary OVR)
//   8. elite/generational counts (primary OVR ≥90 / ≥95 / ==99) — the no-inflation check
//   9. example multi-hyphenates (ids + the two disciplines + OVRs)
//  10. example capable-but-unproven talent (careerIdentity)
//
// Build + run:  node dist/src/harness/run-multihyphenate-stats.js [talentTarget]  (default 15000)

import { mkdirSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  generateWorld,
  roleOVR,
  careerIdentity,
  workHistoryCount,
  ROLE_TO_DISCIPLINE,
  DISCIPLINE_ORDER,
  TUNING,
  type Talent,
  type Discipline,
} from '../core/index.js'

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(here, '..', '..', '..')
const OUT_DIR = join(repoRoot, 'out', 'd9-dev')

const USABLE = TUNING.CAPABILITY_OVR_MIN // 60

function primaryDiscipline(t: Talent): Discipline {
  return ROLE_TO_DISCIPLINE[t.role]
}

type Accum = { n: number; sum: number; sumSq: number; vals: number[] }
function mkAccum(): Accum {
  return { n: 0, sum: 0, sumSq: 0, vals: [] }
}
function push(a: Accum, x: number): void {
  a.n++
  a.sum += x
  a.sumSq += x * x
  a.vals.push(x)
}
function stats(a: Accum): { n: number; mean: number; variance: number; sd: number; min: number; max: number; p50: number; p90: number; p99: number } {
  const mean = a.sum / a.n
  const variance = a.sumSq / a.n - mean * mean
  const sorted = a.vals.slice().sort((x, y) => x - y)
  const q = (p: number) => sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))]!
  return {
    n: a.n,
    mean: round(mean),
    variance: round(variance),
    sd: round(Math.sqrt(Math.max(0, variance))),
    min: sorted[0]!,
    max: sorted[sorted.length - 1]!,
    p50: q(0.5),
    p90: q(0.9),
    p99: q(0.99),
  }
}
function round(x: number): number {
  return Math.round(x * 1000) / 1000
}
// Pearson correlation of two paired arrays.
function pearson(xs: number[], ys: number[]): number {
  const n = xs.length
  let sx = 0, sy = 0, sxx = 0, syy = 0, sxy = 0
  for (let i = 0; i < n; i++) {
    sx += xs[i]!
    sy += ys[i]!
    sxx += xs[i]! * xs[i]!
    syy += ys[i]! * ys[i]!
    sxy += xs[i]! * ys[i]!
  }
  const cov = sxy / n - (sx / n) * (sy / n)
  const vx = sxx / n - (sx / n) ** 2
  const vy = syy / n - (sy / n) ** 2
  const d = Math.sqrt(vx * vy)
  return d === 0 ? 0 : round(cov / d)
}

function main(): void {
  const arg = process.argv[2]
  const talentTarget = arg === undefined ? 15000 : Number(arg)
  const t0 = Date.now()

  let nTalent = 0
  let withUsable = 0
  let withTwoPlus = 0
  let secGe60 = 0, secGe70 = 0, secGe80 = 0
  let secSlots = 0
  let capableUnprovenTalent = 0
  const primAccum = mkAccum()
  const secAccum = mkAccum()
  let primGe90 = 0, primGe95 = 0, primEq99 = 0
  let secGe90 = 0
  // primary → secondary usable-pairing counts.
  const pairing: Record<string, number> = {}
  // per-primary talent counts (denominator for pairing rates).
  const primaryCounts: Record<string, number> = {}
  // correlation samples: primary OVR vs best-secondary OVR.
  const primVals: number[] = []
  const bestSecVals: number[] = []
  // examples.
  const exampleMultiHyphenates: unknown[] = []
  const exampleCapableUnproven: unknown[] = []

  let world = 0
  while (nTalent < talentTarget) {
    const w = generateWorld(`mh-${world}`)
    world++
    for (const t of w.talent) {
      nTalent++
      const primary = primaryDiscipline(t)
      const primOVR = roleOVR(t, primary)
      push(primAccum, primOVR)
      if (primOVR >= 90) primGe90++
      if (primOVR >= 95) primGe95++
      if (primOVR >= 99) primEq99++
      primaryCounts[primary] = (primaryCounts[primary] ?? 0) + 1

      let usableCount = 0
      let bestSec = 0
      for (const d of DISCIPLINE_ORDER) {
        if (d === primary) continue
        const o = roleOVR(t, d)
        push(secAccum, o)
        secSlots++
        if (o > bestSec) bestSec = o
        if (o >= 60) { secGe60++; usableCount++; pairing[`${primary}->${d}`] = (pairing[`${primary}->${d}`] ?? 0) + 1 }
        if (o >= 70) secGe70++
        if (o >= 80) secGe80++
        if (o >= 90) secGe90++
      }
      primVals.push(primOVR)
      bestSecVals.push(bestSec)
      if (usableCount >= 1) {
        withUsable++
        if (exampleMultiHyphenates.length < 15) {
          const secs = DISCIPLINE_ORDER.filter((d) => d !== primary && roleOVR(t, d) >= 60).map((d) => ({ discipline: d, ovr: roleOVR(t, d) }))
          exampleMultiHyphenates.push({ id: t.id, primary, primaryOVR: primOVR, usableSecondaries: secs })
        }
      }
      if (usableCount >= 2) withTwoPlus++

      const ci = careerIdentity(t)
      if (ci.capableButUnprovenDisciplines.length > 0) {
        capableUnprovenTalent++
        if (exampleCapableUnproven.length < 10) {
          exampleCapableUnproven.push({
            id: t.id,
            primary,
            capableButUnproven: ci.capableButUnprovenDisciplines.map((d) => ({ discipline: d, ovr: roleOVR(t, d), workHistory: workHistoryCount(t, d) })),
            identityDisciplines: ci.identityDisciplines,
          })
        }
      }
    }
  }

  const elapsed = ((Date.now() - t0) / 1000).toFixed(1)

  // Pairing rates: share of each primary's talent that has a usable secondary in d.
  const pairingRates: Record<string, number> = {}
  for (const key of Object.keys(pairing)) {
    const primary = key.split('->')[0]!
    pairingRates[key] = round(pairing[key]! / (primaryCounts[primary] ?? 1))
  }

  const summary = {
    study: 'RULING B multi-hyphenate generation distribution',
    talentGenerated: nTalent,
    worldsUsed: world,
    usableSecondaryOVRMin: USABLE,
    // 1. usable-secondary rate.
    usableSecondaryRate: round(withUsable / nTalent),
    // 4. ≥2 usable secondaries.
    twoPlusUsableRate: round(withTwoPlus / nTalent),
    // 3. %≥60/≥70/≥80 among secondary slots.
    secondarySlotShares: {
      total: secSlots,
      ge60: round(secGe60 / secSlots),
      ge70: round(secGe70 / secSlots),
      ge80: round(secGe80 / secSlots),
      ge90: round(secGe90 / secSlots),
    },
    // 2. rate by discipline pairing (primary → usable secondary).
    pairingRates,
    // 5/6. primary and secondary OVR distributions.
    primaryOVR: stats(primAccum),
    secondaryOVR: stats(secAccum),
    // 7. role-rating correlation: primary OVR ↔ best-secondary OVR (modest expected).
    primaryToBestSecondaryCorrelation: pearson(primVals, bestSecVals),
    // 8. elite/generational counts — the no-inflation check vs the pre-retune baseline.
    eliteCounts: {
      primaryGe90: primGe90,
      primaryGe90Share: round(primGe90 / nTalent),
      primaryGe95: primGe95,
      primaryGe95Share: round(primGe95 / nTalent),
      primaryEq99: primEq99,
      secondaryGe90: secGe90,
    },
    // 9/10. examples.
    exampleMultiHyphenates,
    exampleCapableUnproven,
    capableButUnprovenTalentShare: round(capableUnprovenTalent / nTalent),
    elapsedSeconds: Number(elapsed),
  }

  mkdirSync(OUT_DIR, { recursive: true })
  writeFileSync(join(OUT_DIR, 'multihyphenate-stats.json'), JSON.stringify(summary, null, 2))
  console.log(`RULING B multi-hyphenate stats: ${nTalent} talent in ${elapsed}s`)
  console.log(`  usable-secondary rate (OVR≥60): ${(summary.usableSecondaryRate * 100).toFixed(2)}%`)
  console.log(`  primary OVR ≥90: ${primGe90} (${(summary.eliteCounts.primaryGe90Share * 100).toFixed(3)}%), ≥95: ${primGe95}, ==99: ${primEq99}`)
  console.log(`  summary: ${join(OUT_DIR, 'multihyphenate-stats.json')}`)
}

main()
