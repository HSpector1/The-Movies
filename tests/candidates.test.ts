// ── §13 candidate generator — INDEPENDENT contract-derived tests ─────────────
//
// SOURCE OF TRUTH: build-contract.md rev. 4 §13 + NORMATIVE docs/rev4-open-questions.md
// (wins on conflict). Every expectation below is derived from the contract text, NOT
// from candidates.ts. The bodies of candidates.ts / agents.ts / tick.ts / actions.ts
// are NEVER read; we import ONLY the public surface (src/core/index.ts).
//
// Contract basis used here:
//   §13            — the finite grid: NEGATIVE_BUDGET_MULTIPLIERS, MARKETING_BUDGET_LEVELS,
//                    PROMISE_WIDTHS/CENTERS, rangeFrom, CANDIDATE_CONFIG.
//   B18/B19        — package shape + enumeration: sample 5 writers, 5 directors, 8 actors
//                    per slot, 6 shapes, 8 promises; drop same-actor-twice packages (M16);
//                    uniform-sample WITHOUT REPLACEMENT down to 500 distinct packages;
//                    both agents receive the identical 500.
//   B21            — intendedSegments = [argmax_s expectedSegmentAppeal] (single segment).
//   M3             — budget.negative = multiplier × requiredNegative, where
//                    requiredNegative = concept.baseNegativeCost × shape.budgetDemandMultiplier
//                    × era.costScale; marketing ∈ MARKETING_BUDGET_LEVELS.
//   M4             — promise.genre === concept.genre.
//   M16            — 3 distinct actor ids per package; busy talent excluded from candidates.
//   M9             — draws come from stream(seed,'candidates',tick); state.rngState is the
//                    sim stream and is NEVER touched by candidate generation.

import { describe, expect, it } from 'vitest'
import {
  applyActions,
  CANDIDATE_CONFIG,
  forecastCenters,
  generateCandidates,
  generateWorld,
  MARKETING_BUDGET_LEVELS,
  NEGATIVE_BUDGET_MULTIPLIERS,
  packageReceptionInputs,
  resolveShape,
  stableStringify,
} from '../src/core/index.js'
import type {
  Action,
  CandidatePackage,
  CastSlot,
  FilmConcept,
  GameState,
  Production,
  SegmentId,
  Talent,
} from '../src/core/index.js'

// Fixed segment order for B21 argmax tie-break, per the task brief / §2 SegmentId union.
const SEGMENT_ORDER: SegmentId[] = ['youngAdult', 'family', 'adult', 'prestige']

// Derive the argmax segment of a forecast-centers map by the fixed segment order
// (first max in youngAdult,family,adult,prestige order). Contract-independent helper:
// pure argmax over a Record we recompute from the PUBLIC forecastCenters pipeline.
function argmaxSegment(centers: Record<SegmentId, number>): SegmentId {
  let best: SegmentId = SEGMENT_ORDER[0]
  let bestVal = -Infinity
  for (const s of SEGMENT_ORDER) {
    if (centers[s] > bestVal) {
      bestVal = centers[s]
      best = s
    }
  }
  return best
}

function conceptById(state: GameState, id: string): FilmConcept {
  const c = state.concepts.find((x) => x.id === id)
  if (!c) throw new Error(`concept not found: ${id}`)
  return c
}

describe('§13 generateCandidates — count, determinism, distinctness (B18/B19)', () => {
  it('returns exactly CANDIDATE_CONFIG.maxPackagesPerDecision (500) packages', () => {
    const state = generateWorld('cand-count-1')
    // Fresh world: tick 0, 0 active productions ⇒ full eligibility (B3/N3).
    expect(state.market.tick).toBe(0)
    expect(state.studio.activeProductions).toHaveLength(0)

    const pkgs = generateCandidates(state, 0)
    expect(pkgs).toHaveLength(CANDIDATE_CONFIG.maxPackagesPerDecision)
    expect(CANDIDATE_CONFIG.maxPackagesPerDecision).toBe(500)
  })

  it('is deterministic: same (state,tick) ⇒ byte-identical package list', () => {
    const state = generateWorld('cand-det-1')
    const a = generateCandidates(state, 0)
    const b = generateCandidates(state, 0)
    // Byte-identity of the whole ordered list (B18: seeded sampling, replay-exact).
    expect(stableStringify(a)).toBe(stableStringify(b))
  })

  it('a different tick draws a different candidate set (M9: keyed on tick)', () => {
    const state = generateWorld('cand-det-2')
    const t0 = generateCandidates(state, 0)
    const t1 = generateCandidates(state, 1)
    // stream(seed,'candidates',tick) is keyed on tick ⇒ different draw. Not identical.
    expect(stableStringify(t1)).not.toBe(stableStringify(t0))
  })

  it('the 500 packages are pairwise distinct by content (B19: WITHOUT replacement)', () => {
    const state = generateWorld('cand-distinct-1')
    const pkgs = generateCandidates(state, 0)
    const set = new Set(pkgs.map((p) => stableStringify(p)))
    // B19: "Uniform-sample the remainder down to maxPackagesPerDecision = 500 WITHOUT
    // REPLACEMENT (500 distinct packages)." If this fails, DO NOT weaken — report it:
    // it can mean duplicate promise-triples are being treated as distinct grid
    // coordinates (an adjudication point for the auditor/owner).
    expect(set.size).toBe(500)
  })
})

describe('§13 per-package invariants — cast, genre, budget (M16/M4/M3)', () => {
  const state = generateWorld('cand-invariants-1')
  const pkgs = generateCandidates(state, 0)

  it('every package assigns 3 DISTINCT actor ids (M16)', () => {
    for (const p of pkgs) {
      const ids = [p.cast.lead, p.cast.antagonist, p.cast.support]
      expect(new Set(ids).size).toBe(3)
    }
  })

  it('promise.genre === concept.genre for every package (M4)', () => {
    for (const p of pkgs) {
      const concept = conceptById(state, p.conceptId)
      expect(p.promise.genre).toBe(concept.genre)
    }
  })

  it('craftIds is always [] in M0A (D-4 — no craft dimension)', () => {
    for (const p of pkgs) {
      expect(p.craftIds).toEqual([])
    }
  })

  it('budget.negative === multiplier × requiredNegative and marketing ∈ MARKETING_BUDGET_LEVELS (M3)', () => {
    // Sample the first 60 packages: recompute requiredNegative from the concept + shape
    // + era per §5.1 / M3, independently of candidates.ts.
    const sample = pkgs.slice(0, 60)
    for (const p of sample) {
      const concept = conceptById(state, p.conceptId)
      const shapeEffects = resolveShape(p.shape)
      const requiredNegative =
        concept.baseNegativeCost * shapeEffects.budgetDemandMultiplier * state.era.costScale
      const expectedNegative = NEGATIVE_BUDGET_MULTIPLIERS[p.negativeLevel] * requiredNegative

      // FP tolerance: budgetDemandMultiplier is a product of clamped mods.
      expect(Math.abs(p.budget.negative - expectedNegative)).toBeLessThan(1e-6)

      // marketing must be one of the three declared levels, indexed by marketingLevel.
      expect(MARKETING_BUDGET_LEVELS).toContain(p.budget.marketing as number)
      expect(p.budget.marketing).toBe(MARKETING_BUDGET_LEVELS[p.marketingLevel])
    }
  })
})

describe('§13 B21 — intendedSegments is the single argmax segment', () => {
  const state = generateWorld('cand-b21-1')
  const pkgs = generateCandidates(state, 0)

  it('intendedSegments has length 1 and equals the argmax of forecastCenters (recomputed via the PUBLIC pipeline)', () => {
    // Sample the first 40 packages to keep runtime sane; recompute the deterministic
    // segment centers via the PUBLIC forecastCenters(packageReceptionInputs(...)).
    const sample = pkgs.slice(0, 40)
    for (const p of sample) {
      expect(p.promise.intendedSegments).toHaveLength(1)
      const inputs = packageReceptionInputs(state, p)
      const centers = forecastCenters(inputs).centers
      const expected = argmaxSegment(centers)
      expect(p.promise.intendedSegments[0]).toBe(expected)
    }
  })
})

describe('§13 B19 — sampling caps across the 500 packages', () => {
  const state = generateWorld('cand-caps-1')
  const pkgs = generateCandidates(state, 0)

  it('respects the per-dimension sampling caps (writers≤5, directors≤5, shapes≤6, actors/slot≤8; levels ∈ {0,1,2})', () => {
    const writers = new Set<string>()
    const directors = new Set<string>()
    const shapes = new Set<string>()
    const leads = new Set<string>()
    const antagonists = new Set<string>()
    const supports = new Set<string>()

    for (const p of pkgs) {
      writers.add(p.writerId)
      directors.add(p.directorId)
      shapes.add(stableStringify(p.shape))
      leads.add(p.cast.lead)
      antagonists.add(p.cast.antagonist)
      supports.add(p.cast.support)

      // B18 metadata: negativeLevel/marketingLevel index into the 3-length grids.
      expect([0, 1, 2]).toContain(p.negativeLevel)
      expect([0, 1, 2]).toContain(p.marketingLevel)
    }

    // B18/B19: 5 writers, 5 directors sampled per decision; 6 of the 36 shapes;
    // 8 actors per slot. These bound the DISTINCT values that can appear across 500.
    expect(writers.size).toBeLessThanOrEqual(CANDIDATE_CONFIG.maxWritersPerConcept) // 5
    expect(directors.size).toBeLessThanOrEqual(CANDIDATE_CONFIG.maxDirectorsPerConcept) // 5
    expect(shapes.size).toBeLessThanOrEqual(6)
    expect(leads.size).toBeLessThanOrEqual(CANDIDATE_CONFIG.maxActorsPerSlot) // 8
    expect(antagonists.size).toBeLessThanOrEqual(CANDIDATE_CONFIG.maxActorsPerSlot) // 8
    expect(supports.size).toBeLessThanOrEqual(CANDIDATE_CONFIG.maxActorsPerSlot) // 8
  })
})

describe('§13/M16 — busy talent is excluded from candidate generation', () => {
  // Build a state with one active production, then generate candidates on that state.
  // No returned package may use any talent id engaged in the active production.
  // requiredNegative per §5.1; funded exactly to requirement (overrun 0).
  const SHAPE = { opening: 'slowSetup', midpoint: 'reversal', ending: 'bittersweet' } as const

  function firstOfRole(pool: Talent[], role: Talent['role'], skip: Set<string>): Talent {
    const t = pool.find((x) => x.role === role && !skip.has(x.id))
    if (!t) throw new Error(`no free ${role}`)
    skip.add(t.id)
    return t
  }

  it('none of the 500 packages uses any talent id busy in an active production', () => {
    const world = generateWorld('cand-busy-1')
    const shapeEffects = resolveShape(SHAPE)

    const skip = new Set<string>()
    const writer = firstOfRole(world.talent, 'writer', skip)
    const director = firstOfRole(world.talent, 'director', skip)
    const lead = firstOfRole(world.talent, 'actor', skip)
    const antagonist = firstOfRole(world.talent, 'actor', skip)
    const support = firstOfRole(world.talent, 'actor', skip)
    const concept = world.concepts[0]

    const requiredNegative =
      concept.baseNegativeCost * shapeEffects.budgetDemandMultiplier * world.era.costScale

    const production: Omit<
      Production,
      'id' | 'startTick' | 'remainingTicks' | 'forecastSnapshot'
    > = {
      conceptId: concept.id,
      shape: SHAPE,
      promise: {
        genre: concept.genre, // M4
        intendedSegments: ['adult'],
        ranges: { intimacy: [-1, 1], tonalWeight: [-1, 1], kineticEnergy: [-1, 1] },
      },
      writerId: writer.id,
      directorId: director.id,
      craftIds: [],
      cast: { lead: lead.id, antagonist: antagonist.id, support: support.id } as Record<
        CastSlot,
        string
      >,
      budget: { negative: requiredNegative, marketing: MARKETING_BUDGET_LEVELS[0] },
    }
    const action: Action = { kind: 'greenlight', production }
    const withActive = applyActions(world, [action])
    expect(withActive.studio.activeProductions).toHaveLength(1)

    const busy = new Set<string>([
      writer.id,
      director.id,
      lead.id,
      antagonist.id,
      support.id,
    ])

    // Generate candidates on the state that now has one active production.
    const pkgs = generateCandidates(withActive, withActive.market.tick)
    for (const p of pkgs) {
      expect(busy.has(p.writerId)).toBe(false)
      expect(busy.has(p.directorId)).toBe(false)
      expect(busy.has(p.cast.lead)).toBe(false)
      expect(busy.has(p.cast.antagonist)).toBe(false)
      expect(busy.has(p.cast.support)).toBe(false)
    }
  })
})

describe('§13/M9 — candidate generation never touches the sim stream', () => {
  it('state.rngState is unchanged after generateCandidates (state not mutated)', () => {
    const state = generateWorld('cand-purity-1')
    const before = state.rngState
    // Call repeatedly across ticks: the sim stream (state.rngState) must stay frozen —
    // candidate draws use stream(seed,'candidates',tick), not the sim stream.
    for (let t = 0; t < 5; t++) {
      generateCandidates(state, t)
    }
    expect(state.rngState).toBe(before)
  })
})

// A trivial reference to CandidatePackage keeps the type import load-bearing.
const _typeGuard: (p: CandidatePackage) => string = (p) => p.conceptId
void _typeGuard
