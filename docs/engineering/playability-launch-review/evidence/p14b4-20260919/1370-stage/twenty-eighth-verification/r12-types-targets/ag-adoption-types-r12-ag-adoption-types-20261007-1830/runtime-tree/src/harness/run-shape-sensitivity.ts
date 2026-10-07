// ── RULING C (2026-07-26) shape-sensitivity study ─────────────────────────────
// Measures how threading the greenlight-LOCKED FilmShape through the D-9 talent
// weighting path (projectSkillWeights → effectiveSkill, RULING C) affects the sim,
// over a seeded corpus. Read-only over the PUBLIC core surface (no src/core
// internals, no unseeded entropy). Writes out/d9-dev/shape-sensitivity.json.
//
// For each seed, at tick 0 the Oracle candidate grid is generated. For the Oracle's
// PREFERRED package (max expected profit under its committed shape), we recompute the
// expected profit under EACH of the 36 legal shapes (holding concept/crew/cast/
// promise/budget FIXED) and measure:
//   - the frequency with which changing the shape changes the Oracle's preferred
//     CANDIDATE package (argmax over the whole grid, per-shape) — "shape flips the pick"
//   - the per-package talent-contribution (Σ effectiveSkill of writer+director+cast,
//     perceived) mean & variance BEFORE (a fixed baseline shape) and AFTER (each shape)
//   - the MAX observed shape-driven talent-contribution change on any package
//
// Build + run:  node dist/src/harness/run-shape-sensitivity.js [corpusSize]  (default 1000)

import { mkdirSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  generateWorld,
  generateCandidates,
  packageReceptionInputs,
  forecastCenters,
  computeBoxOffice,
  effectiveSkill,
  type GameState,
  type FilmShape,
  type CastSlot,
  type CandidatePackage,
} from '../core/index.js'
import { resolveShape } from '../core/shape.js'

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(here, '..', '..', '..')
const OUT_DIR = join(repoRoot, 'out', 'd9-dev')

const CAST_SLOTS: readonly CastSlot[] = ['lead', 'antagonist', 'support'] as const

// The 36 legal shapes, in fixed enumeration order.
const OPENINGS: FilmShape['opening'][] = ['immediateAction', 'slowSetup', 'mysteryHook']
const MIDPOINTS: FilmShape['midpoint'][] = ['reversal', 'escalation', 'revelation']
const ENDINGS: FilmShape['ending'][] = ['triumph', 'bittersweet', 'tragic', 'ambiguous']
const ALL_SHAPES: FilmShape[] = []
for (const opening of OPENINGS) for (const midpoint of MIDPOINTS) for (const ending of ENDINGS) {
  ALL_SHAPES.push({ opening, midpoint, ending })
}
// A fixed neutral "baseline" shape for the before/after comparison.
const BASELINE_SHAPE: FilmShape = { opening: 'mysteryHook', midpoint: 'reversal', ending: 'bittersweet' }

function seedFor(i: number): string {
  return `m0a-${String(i).padStart(4, '0')}`
}

// Expected profit of a package under a GIVEN shape (D-1 EV, deterministic core).
function evUnderShape(state: GameState, pkg: CandidatePackage, shape: FilmShape): number {
  const inp = packageReceptionInputs(state, pkg)
  const withShape = { ...inp, shape, shapeEffects: resolveShape(shape) }
  const { centers } = forecastCenters(withShape)
  const box = computeBoxOffice(
    centers,
    state.market.segments,
    state.market.baseMarketValue,
    state.studio.standing,
    withShape.promise,
    withShape.budget,
    withShape.shapeEffects,
  )
  let salaries = withShape.writer.salary + withShape.director.salary
  for (const slot of CAST_SLOTS) salaries += withShape.cast[slot].salary
  return box.total - pkg.budget.negative - pkg.budget.marketing - salaries
}

// Talent contribution of a package under a GIVEN shape = Σ perceived effectiveSkill
// of writer(writing) + director(directing) + each cast actor(acting), threaded with
// the shape (RULING C). A scalar proxy for "how much the talent path contributes".
function talentContribution(state: GameState, pkg: CandidatePackage, shape: FilmShape): number {
  const inp = packageReceptionInputs(state, pkg)
  const concept = inp.concept
  const se = resolveShape(shape)
  let sum = 0
  sum += effectiveSkill(inp.writer, 'writing', concept, undefined, se, inp.promise, 'perceived', shape)
  sum += effectiveSkill(inp.director, 'directing', concept, undefined, se, inp.promise, 'perceived', shape)
  for (const slot of CAST_SLOTS) {
    sum += effectiveSkill(inp.cast[slot], 'acting', concept, slot, se, inp.promise, 'perceived', shape)
  }
  return sum
}

// argmax-EV package index over the grid under a fixed shape (ties → first index).
function argmaxUnderShape(state: GameState, packages: CandidatePackage[], shape: FilmShape): number {
  let bestIdx = 0
  let bestEV = Number.NEGATIVE_INFINITY
  for (let i = 0; i < packages.length; i++) {
    const ev = evUnderShape(state, packages[i]!, shape)
    if (ev > bestEV) {
      bestEV = ev
      bestIdx = i
    }
  }
  return bestIdx
}

function packageIdentity(pkg: CandidatePackage): string {
  return [pkg.conceptId, pkg.writerId, pkg.directorId, pkg.cast.lead, pkg.cast.antagonist, pkg.cast.support].join('#')
}

type Accum = { n: number; sum: number; sumSq: number }
function push(a: Accum, x: number): void {
  a.n++
  a.sum += x
  a.sumSq += x * x
}
function meanVar(a: Accum): { mean: number; variance: number } {
  const mean = a.sum / a.n
  return { mean, variance: a.sumSq / a.n - mean * mean }
}

function main(): void {
  const arg = process.argv[2]
  const corpusSize = arg === undefined ? 1000 : Number(arg)
  const t0 = Date.now()

  // Before (baseline shape) and after (per-shape) talent-contribution accumulators,
  // over the Oracle's preferred package on each seed.
  const before: Accum = { n: 0, sum: 0, sumSq: 0 }
  const afterAll: Accum = { n: 0, sum: 0, sumSq: 0 }

  let seedsWherePickFlips = 0 // ≥1 of the 36 shapes changes the grid-wide argmax pick
  let totalSeeds = 0
  let maxContribChange = 0
  let maxContribChangeSeed = ''
  // Distribution of how many DISTINCT preferred packages appear across the 36 shapes.
  const distinctPickCounts: number[] = []

  for (let i = 1; i <= corpusSize; i++) {
    const seed = seedFor(i)
    const state = generateWorld(seed)
    const packages = generateCandidates(state, 0)
    if (packages.length === 0) continue
    totalSeeds++

    // The Oracle's preferred package under the baseline shape.
    const baseIdx = argmaxUnderShape(state, packages, BASELINE_SHAPE)
    const basePkg = packages[baseIdx]!
    const baseContrib = talentContribution(state, basePkg, BASELINE_SHAPE)
    push(before, baseContrib)

    // How the preferred CANDIDATE (grid-wide argmax) moves across the 36 shapes.
    const pickIds = new Set<string>()
    let flipped = false
    for (const shape of ALL_SHAPES) {
      const idx = argmaxUnderShape(state, packages, shape)
      pickIds.add(packageIdentity(packages[idx]!))
      if (packageIdentity(packages[idx]!) !== packageIdentity(basePkg)) flipped = true

      // Talent contribution of the BASELINE package under this shape (before/after).
      const contrib = talentContribution(state, basePkg, shape)
      push(afterAll, contrib)
      const change = Math.abs(contrib - baseContrib)
      if (change > maxContribChange) {
        maxContribChange = change
        maxContribChangeSeed = seed
      }
    }
    if (flipped) seedsWherePickFlips++
    distinctPickCounts.push(pickIds.size)
  }

  const elapsed = ((Date.now() - t0) / 1000).toFixed(1)
  const beforeStats = meanVar(before)
  const afterStats = meanVar(afterAll)
  const meanDistinctPicks =
    distinctPickCounts.reduce((s, x) => s + x, 0) / Math.max(1, distinctPickCounts.length)

  const summary = {
    study: 'RULING C shape sensitivity',
    developmentMode: 'off (uses the deterministic forecast core, D-1 EV)',
    corpusSize,
    seedsMeasured: totalSeeds,
    baselineShape: BASELINE_SHAPE,
    shapesEnumerated: ALL_SHAPES.length,
    // Frequency with which changing the shape changes the Oracle's preferred candidate.
    preferredCandidateFlip: {
      seedsWhereSomeShapeFlipsThePick: seedsWherePickFlips,
      shareOfSeeds: totalSeeds > 0 ? seedsWherePickFlips / totalSeeds : 0,
      meanDistinctPreferredPackagesAcross36Shapes: meanDistinctPicks,
    },
    // Before/after mean & variance of talent contribution (baseline package).
    talentContribution: {
      beforeBaselineShape: beforeStats,
      afterAcrossAllShapes: afterStats,
      maxObservedShapeDrivenContributionChange: maxContribChange,
      maxChangeSeed: maxContribChangeSeed,
    },
    elapsedSeconds: Number(elapsed),
  }

  mkdirSync(OUT_DIR, { recursive: true })
  writeFileSync(join(OUT_DIR, 'shape-sensitivity.json'), JSON.stringify(summary, null, 2))
  console.log(`RULING C shape sensitivity: ${totalSeeds} seeds × 36 shapes in ${elapsed}s`)
  console.log(`  pick flips on ${(summary.preferredCandidateFlip.shareOfSeeds * 100).toFixed(1)}% of seeds`)
  console.log(`  max shape-driven talent-contribution change: ${maxContribChange.toFixed(3)}`)
  console.log(`  summary: ${join(OUT_DIR, 'shape-sensitivity.json')}`)
}

main()
