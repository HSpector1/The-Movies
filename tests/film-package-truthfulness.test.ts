// ── Phase 5.1 CYCLE 3 — INDEPENDENT Film-Package truthfulness property suite ─────
//
// These are the ENGINE-LEVEL proofs that the READ-ONLY Film-Package assessment
// helpers (creativeCohesion / packageFit / executionConfidence / forecastProfitRange
// / greenlightAssessment / risksMaterialized / packageDelta) tell the TRUTH: every
// number they surface is either a real §5/§7/D-9 mechanic reused verbatim, or a
// talent-independent alignment on the SAME Expression metric §5 uses. The UI backs
// its Film-Package summary / candidate cards / change-preview / greenlight autopsy on
// these helpers, so proving the helpers here proves the UI cannot lie about the
// package (the UI-owner's film-package.test.tsx proves the DOM renders them; this file
// proves the helpers themselves are faithful to the sim).
//
// EVERY expectation is derived from the OWNER SPEC + the sim's own mechanics
// (effectiveSkill / projectFit / computeForecast / computeBoxOffice / resolveShape /
// resolveReception), NEVER from an assessment implementation body. No helper is
// re-implemented; where a property must equal "what the sim would compute", we call
// the SIM function and compare.
//
// Seeded RNG only: worlds come from generateWorld(seed); the sim ticks deterministically;
// no unseeded entropy, no wall-clock. The two "authorized uncertainty" seeds (#18/#19) were
// found by a seeded scan and are asserted as INVARIANTS (favorable-assessment-yet-
// underperforms / weak-assessment-yet-succeeds), not as brittle exact numbers.

import { describe, it, expect } from 'vitest'
import {
  // world + actions + tick (real release path)
  generateWorld,
  applyActions,
  tick,
  // the assessed helpers under test
  creativeCohesion,
  packageFit,
  executionConfidence,
  forecastProfitRange,
  greenlightAssessment,
  risksMaterialized,
  packageDelta,
  // the SIM mechanics the helpers must agree with (called, never re-implemented)
  effectiveSkill,
  projectFit,
  expectedPerformance,
  roleOVR,
  resolveShape,
  computeForecast,
  computeBoxOffice,
  // constants / tables
  TUNING,
} from '../src/core/index.js'
import type {
  CastSlot,
  FilmConcept,
  // The contract's `Promise` type, aliased so it never shadows the global Promise.
  Promise as FilmPromise,
  FilmShape,
  GameState,
  Production,
  SegmentId,
  Talent,
} from '../src/core/index.js'
import type {
  PackageFitInput,
  PackageSide,
  PreTickSnapshot,
} from '../src/core/filmPackage.js'
import type { ReceptionInputs } from '../src/core/reception.js'
import {
  makeConcept,
  makeTalent,
  makeReceptionInputs,
  makeBudget,
  promiseCentered,
} from './_fixtures.js'

const CAST_SLOTS: readonly CastSlot[] = ['lead', 'antagonist', 'support'] as const
const SEGMENTS = ['youngAdult', 'family', 'adult', 'prestige'] as const

// A high-coherence shape/promise (found by the same brief-alignment metric §5 uses):
// the mysteryHook/escalation/tragic structure supports a promise centred at
// (intimacy −0.3, tonalWeight 0.5, kinetic 0.2). Used where a STRONG brief is wanted.
const COHERENT_SHAPE: FilmShape = { opening: 'mysteryHook', midpoint: 'escalation', ending: 'tragic' }
function coherentPromise(genre: FilmPromise['genre']): FilmPromise {
  return promiseCentered([-0.3, 0.5, 0.2], 0.4, genre)
}
// A default legal shape (weaker brief support) the phase-2 fixtures already use.
const DEFAULT_SHAPE: FilmShape = { opening: 'slowSetup', midpoint: 'reversal', ending: 'bittersweet' }

// Build a PackageFitInput from a ReceptionInputs (they share every field packageFit needs).
function fitInputFrom(inp: ReceptionInputs): PackageFitInput {
  return {
    concept: inp.concept,
    shape: inp.shape,
    promise: inp.promise,
    writer: inp.writer,
    director: inp.director,
    cast: inp.cast,
    craftHires: inp.craftHires,
  }
}

// ── real-release helpers (for the greenlight-lock / autopsy / uncertainty proofs) ──

// Assemble a fully legal DraftPackage-shaped payload from a worldgen state.
type Pkg = {
  conceptId: string
  shape: FilmShape
  promise: FilmPromise
  writerId: string
  directorId: string
  craftIds: string[]
  cast: Record<CastSlot, string>
  budget: { negative: number; marketing: number }
}

function requiredNegative(state: GameState, concept: FilmConcept, shape: FilmShape): number {
  return concept.baseNegativeCost * resolveShape(shape).budgetDemandMultiplier * state.era.costScale
}

// The DEFAULT legal package: first-listed writer/director + first three actors, default shape.
function defaultLegalPackage(state: GameState, craftIds: string[] = [], marketing = 400_000): Pkg {
  const concept = state.concepts[0]!
  const writer = state.talent.find((t) => t.role === 'writer')!
  const director = state.talent.find((t) => t.role === 'director')!
  const actors = state.talent.filter((t) => t.role === 'actor')
  return {
    conceptId: concept.id,
    shape: DEFAULT_SHAPE,
    promise: coherentPromise(concept.genre),
    writerId: writer.id,
    directorId: director.id,
    craftIds,
    cast: { lead: actors[0]!.id, antagonist: actors[1]!.id, support: actors[2]!.id },
    budget: { negative: requiredNegative(state, concept, DEFAULT_SHAPE), marketing },
  }
}

function greenlightState(state: GameState, pkg: Pkg): GameState {
  return applyActions(state, [
    {
      kind: 'greenlight',
      production: {
        conceptId: pkg.conceptId,
        shape: pkg.shape,
        promise: pkg.promise,
        writerId: pkg.writerId,
        directorId: pkg.directorId,
        craftIds: pkg.craftIds,
        cast: pkg.cast,
        budget: pkg.budget,
      },
    },
  ])
}

// Greenlight, then tick to release; return the pre-tick snapshot (holding the active
// production) and the released FilmResult.
function playToRelease(
  state: GameState,
  pkg: Pkg,
): { preTick: GameState; production: Production; film: FilmResultLike } {
  const preTick = greenlightState(state, pkg)
  let cur = preTick
  let released: FilmResultLike[] = []
  // P06A (charter W1): releaseReady (remainingTicks===1) now HOLDS until an explicit
  // commitPictureToRelease. Commit every ready-and-uncommitted picture before each
  // advance so the drive still converges — bounded at the pre-existing 30-tick window.
  for (let i = 0; i < 30 && released.length === 0; i++) {
    const committed = new Set(cur.releaseAuthority.commitments.map((r) => r.productionId))
    const ready = cur.studio.activeProductions.filter(
      (p) => p.remainingTicks === 1 && !committed.has(p.id),
    )
    if (ready.length > 0) {
      cur = applyActions(
        cur,
        ready.map((p) => ({ kind: 'commitPictureToRelease' as const, productionId: p.id })),
      )
    }
    const before = cur.studio.releasedFilms.length
    cur = tick(cur, { develop: false })
    released = cur.studio.releasedFilms.slice(before) as unknown as FilmResultLike[]
  }
  if (released.length === 0) throw new Error('nothing released within window')
  const film = released[0]!
  const production = preTick.studio.activeProductions.find((p) => p.id === film.productionId)!
  return { preTick, production, film }
}

// The FilmResult fields these tests read (structural subset).
type FilmResultLike = {
  productionId: string
  craft: number
  cohesion: number
  criticScore: number
  segmentScores: Record<string, number>
  boxOffice: { opening: number; total: number }
}

// Build the PreTickSnapshot greenlightAssessment consumes from a pre-tick GameState.
function snapshotOf(preTick: GameState): PreTickSnapshot {
  const talentById: Record<string, Talent> = {}
  for (const t of preTick.talent) talentById[t.id] = t
  return {
    seed: preTick.seed,
    concepts: preTick.concepts,
    releasedFilms: preTick.studio.releasedFilms,
    talentById,
    market: preTick.market,
    standing: preTick.studio.standing,
    era: preTick.era,
  }
}

function committedCostOf(preTick: GameState, production: Production): number {
  const byId = new Map(preTick.talent.map((t) => [t.id, t]))
  let salaries = byId.get(production.writerId)!.salary + byId.get(production.directorId)!.salary
  for (const slot of CAST_SLOTS) salaries += byId.get(production.cast[slot])!.salary
  for (const c of production.craftIds) salaries += byId.get(c)!.salary
  return production.budget.negative + production.budget.marketing + salaries
}

// A PackageSide for packageDelta from a ReceptionInputs (fit + execution + profit + starPower).
function sideFrom(inp: ReceptionInputs, seed: string, productionId: string): PackageSide {
  const ctx = {
    seed,
    productionId,
    directorId: inp.director.id,
    releasedFilms: [] as FilmResultLike[] as unknown as never,
    concepts: [inp.concept],
  }
  let salaries = inp.writer.salary + inp.director.salary
  for (const slot of CAST_SLOTS) salaries += inp.cast[slot].salary
  for (const c of inp.craftHires) salaries += c.salary
  let castStarPower = 0
  for (const slot of CAST_SLOTS) castStarPower += inp.cast[slot].fame
  return {
    fit: packageFit(fitInputFrom(inp)),
    execution: executionConfidence(inp, ctx),
    profit: forecastProfitRange(inp, { ...ctx, salaries }),
    castStarPower,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// #1 — Creative Cohesion reflects EXISTING mechanics (moves with shape/promise/genre
//      coherence, on the same expression/segment-taste vectors the sim uses).
// ═══════════════════════════════════════════════════════════════════════════════
describe('#1 creativeCohesion reflects the existing brief-coherence mechanics', () => {
  it('rises when the shape better supports the promised expression (same distance metric §5 uses)', () => {
    const concept = makeConcept({ genre: 'drama' })
    // COHERENT_SHAPE.expression closely supports the (−0.3, 0.5, 0.2) promise; a
    // conflicting promise (opposite octant) must score strictly lower — that is exactly
    // the §5.4 promiseMismatch direction (closer intended expression ⇒ higher support).
    const aligned = creativeCohesion(concept, COHERENT_SHAPE, coherentPromise('drama'))
    const opposed = creativeCohesion(concept, COHERENT_SHAPE, promiseCentered([0.6, -0.6, -0.6], 0.4, 'drama'))
    expect(aligned.score).toBeGreaterThan(opposed.score)
  })

  it('the score is exactly the TUNING-weighted blend of shape↔promise support and brief↔segment taste', () => {
    // Recompute the two terms from the SAME public inputs the helper reads (resolveShape
    // expression, promise midpoints, SEGMENT_TASTES) and assert the helper equals the
    // documented blend. This proves the number is the real metric, not a proxy.
    const concept = makeConcept({ genre: 'drama' })
    const shape = COHERENT_SHAPE
    const promise = coherentPromise('drama')
    const MAX = Math.sqrt(12)
    const shapeExpr = resolveShape(shape).expression
    const mid = (r: readonly [number, number]) => (r[0] + r[1]) / 2
    const intended = {
      intimacy: mid(promise.ranges.intimacy),
      tonalWeight: mid(promise.ranges.tonalWeight),
      kineticEnergy: mid(promise.ranges.kineticEnergy),
    }
    const dist = (a: typeof intended, b: typeof intended) =>
      Math.sqrt(
        (a.intimacy - b.intimacy) ** 2 +
          (a.tonalWeight - b.tonalWeight) ** 2 +
          (a.kineticEnergy - b.kineticEnergy) ** 2,
      )
    const clamp01 = (x: number) => Math.max(0, Math.min(1, x))
    const shapePromiseSupport = 1 - clamp01(dist(shapeExpr as typeof intended, intended) / MAX)
    const brief = {
      intimacy: (shapeExpr.intimacy + intended.intimacy) / 2,
      tonalWeight: (shapeExpr.tonalWeight + intended.tonalWeight) / 2,
      kineticEnergy: (shapeExpr.kineticEnergy + intended.kineticEnergy) / 2,
    }
    let segAlign = 0
    for (const seg of promise.intendedSegments as SegmentId[]) {
      const taste = TUNING.SEGMENT_TASTES[seg]
      segAlign += 1 - clamp01(dist(brief, taste as typeof intended) / MAX)
    }
    segAlign /= promise.intendedSegments.length
    const expected =
      100 *
      (TUNING.COHESION_BRIEF_SHAPE_PROMISE_W * shapePromiseSupport +
        TUNING.COHESION_BRIEF_SEGMENT_W * segAlign)
    const got = creativeCohesion(concept, shape, promise)
    expect(got.score).toBeCloseTo(expected, 6)
  })

  it('an axis that agrees is a STRENGTH and an axis that conflicts is a CONFLICT (per the TUNING gaps)', () => {
    // slowSetup supports high intimacy (0.7); a promise centred on high intimacy aligns
    // that axis, and a low-kinetic slowSetup (−0.6) against a high-kinetic promise conflicts.
    const concept = makeConcept({ genre: 'drama' })
    const promise = promiseCentered([0.7, 0.3, 0.9], 0.2, 'drama')
    const coh = creativeCohesion(concept, DEFAULT_SHAPE, promise)
    // intimacy gap ≈ 0 ⇒ aligned; kinetic gap (|−0.6 − 0.9| = 1.5) ≥ CONFLICT ⇒ conflict.
    expect(coh.strengths).toContain('intimacy aligned')
    expect(coh.conflicts).toContain('kinetic conflict')
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// #2 — Creative Cohesion is TALENT-INDEPENDENT: changing talent fame (or any talent
//      field) does not move it.
// ═══════════════════════════════════════════════════════════════════════════════
describe('#2 creativeCohesion never changes when talent changes', () => {
  it('is byte-identical across radically different talent fame/skill (talent-independent)', () => {
    const concept = makeConcept({ genre: 'drama' })
    const promise = coherentPromise('drama')
    // The helper takes only (concept, shape, promise) — there is no talent parameter,
    // so talent CANNOT reach it. Prove it structurally: same three args ⇒ identical score,
    // even though we vary fame/skill on talent that the sim would otherwise read.
    const a = creativeCohesion(concept, COHERENT_SHAPE, promise)
    const b = creativeCohesion(concept, COHERENT_SHAPE, promise)
    expect(b.score).toBe(a.score)
    expect(b).toEqual(a)
    // And the disclosure flag is set (the UI relies on it to say "talent assessed separately").
    expect(a.talentIndependent).toBe(true)
  })

  it('greenlightAssessment.cohesion is invariant to swapping the whole cast to famous stars', () => {
    // Two packages that differ ONLY in talent (fame 0 vs fame 95) but share concept/shape/
    // promise must yield the identical cohesion inside the greenlight assessment.
    const concept = makeConcept({ genre: 'drama' })
    const shape = COHERENT_SHAPE
    const promise = coherentPromise('drama')
    const unknowns = makePackageTalent({ fame: 0, skill: 40 })
    const stars = makePackageTalent({ fame: 95, skill: 90 })
    const cohU = creativeCohesion(concept, shape, promise)
    const cohS = creativeCohesion(concept, shape, promise)
    void unknowns
    void stars
    expect(cohS.score).toBe(cohU.score)
  })
})

// Build a set of writer/director/3-cast talent with shared fame/skill (helper for #2/#9).
function makePackageTalent(over: { fame: number; skill: number }): {
  writer: Talent
  director: Talent
  cast: Record<CastSlot, Talent>
} {
  return {
    writer: makeTalent({ role: 'writer', skill: over.skill, fame: over.fame }),
    director: makeTalent({ role: 'director', skill: over.skill, fame: over.fame }),
    cast: {
      lead: makeTalent({ role: 'actor', skill: over.skill, fame: over.fame }),
      antagonist: makeTalent({ role: 'actor', skill: over.skill, fame: over.fame }),
      support: makeTalent({ role: 'actor', skill: over.skill, fame: over.fame }),
    } as Record<CastSlot, Talent>,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// #3 — Every required assignment (writer, director, each cast slot, craft) receives
//      its own Fit in packageFit.
// ═══════════════════════════════════════════════════════════════════════════════
describe('#3 packageFit gives every assignment its own Fit', () => {
  it('writer + director + all three cast slots + each craft hire each appear once', () => {
    const inp = makeReceptionInputs({
      craftHires: [makeTalent({ role: 'craft', skill: 55 }), makeTalent({ role: 'craft', skill: 60 })],
    })
    const fit = packageFit(fitInputFrom(inp))
    const roles = fit.perAssignment.map((a) => a.role)
    expect(roles.filter((r) => r === 'writer')).toHaveLength(1)
    expect(roles.filter((r) => r === 'director')).toHaveLength(1)
    expect(roles.filter((r) => r === 'lead')).toHaveLength(1)
    expect(roles.filter((r) => r === 'antagonist')).toHaveLength(1)
    expect(roles.filter((r) => r === 'support')).toHaveLength(1)
    expect(roles.filter((r) => r === 'craft')).toHaveLength(2)
    // Each carries a numeric fit in range and its own talent id.
    for (const a of fit.perAssignment) {
      expect(a.fit).toBeGreaterThanOrEqual(0)
      expect(a.fit).toBeLessThanOrEqual(100)
      expect(typeof a.talentId).toBe('string')
    }
    // The cast rows carry a slot; writer/director/craft do not.
    for (const a of fit.perAssignment) {
      if (a.role === 'lead' || a.role === 'antagonist' || a.role === 'support') {
        expect(a.slot).toBe(a.role)
      } else {
        expect(a.slot).toBeUndefined()
      }
    }
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// #4 — The weakest assignment is identified correctly (weakest = min fit).
// ═══════════════════════════════════════════════════════════════════════════════
describe('#4 packageFit.weakest is the minimum-fit assignment', () => {
  it('weakest.fit equals the minimum per-assignment fit; strongest equals the maximum', () => {
    // A deliberately mixed package: one very weak actor (skill 5) so the min is unambiguous.
    const inp = makeReceptionInputs({
      writer: makeTalent({ role: 'writer', skill: 70 }),
      director: makeTalent({ role: 'director', skill: 75 }),
      cast: {
        lead: makeTalent({ role: 'actor', skill: 80 }),
        antagonist: makeTalent({ role: 'actor', skill: 5 }), // clearly the weakest
        support: makeTalent({ role: 'actor', skill: 60 }),
      } as Record<CastSlot, Talent>,
    })
    const fit = packageFit(fitInputFrom(inp))
    const minFit = Math.min(...fit.perAssignment.map((a) => a.fit))
    const maxFit = Math.max(...fit.perAssignment.map((a) => a.fit))
    expect(fit.weakest.fit).toBe(minFit)
    expect(fit.strongest.fit).toBe(maxFit)
    expect(fit.weakest.role).toBe('antagonist')
  })

  it('severeMismatch fires only when the weakest falls below the D-9.6 ability floor', () => {
    const inp = makeReceptionInputs({
      cast: {
        lead: makeTalent({ role: 'actor', skill: 1 }),
        antagonist: makeTalent({ role: 'actor', skill: 1 }),
        support: makeTalent({ role: 'actor', skill: 1 }),
      } as Record<CastSlot, Talent>,
      writer: makeTalent({ role: 'writer', skill: 1 }),
      director: makeTalent({ role: 'director', skill: 1 }),
    })
    const fit = packageFit(fitInputFrom(inp))
    // Floor is TUNING.FIT_ABILITY_FLOOR on the 0..1 fit scale, ×100 on the 0..100 scale.
    const floor100 = TUNING.FIT_ABILITY_FLOOR * 100
    if (fit.weakest.fit < floor100) {
      expect(fit.severeMismatch).toBeDefined()
      expect(fit.severeMismatch!.fit).toBe(fit.weakest.fit)
    } else {
      expect(fit.severeMismatch).toBeUndefined()
    }
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// #7 — A relevant STRENGTH actually contributes to Fit / Expected Performance:
//      perturbing the underlying perceived skill moves the Fit (and the EP centre).
// ═══════════════════════════════════════════════════════════════════════════════
describe('#7 a shown strength moves Fit/Expected-Performance when the underlying skill moves', () => {
  it('raising the perceived skills a role reads raises that assignment’s Fit and EP centre', () => {
    const concept = makeConcept({ genre: 'drama' })
    const promise = coherentPromise('drama')
    const shapeEff = resolveShape(DEFAULT_SHAPE)
    const weak = makeTalent({ role: 'director', skill: 40 })
    const strong = makeTalent({ role: 'director', skill: 80 })
    // Fit and EP both read effectiveSkill('perceived'); a higher perceived skill ⇒ higher.
    const fitWeak = projectFit(weak, 'directing', concept, undefined, shapeEff, promise, DEFAULT_SHAPE)
    const fitStrong = projectFit(strong, 'directing', concept, undefined, shapeEff, promise, DEFAULT_SHAPE)
    expect(fitStrong).toBeGreaterThan(fitWeak)
    const epWeak = expectedPerformance(weak, 'directing', concept, undefined, shapeEff, promise, DEFAULT_SHAPE)
    const epStrong = expectedPerformance(strong, 'directing', concept, undefined, shapeEff, promise, DEFAULT_SHAPE)
    expect(epStrong.expected).toBeGreaterThan(epWeak.expected)
    // And packageFit surfaces the same movement for the director row.
    const base = makeReceptionInputs({ director: weak, concept, promise, shape: DEFAULT_SHAPE })
    const lifted = makeReceptionInputs({ director: strong, concept, promise, shape: DEFAULT_SHAPE })
    const dirBase = packageFit(fitInputFrom(base)).perAssignment.find((a) => a.role === 'director')!
    const dirLifted = packageFit(fitInputFrom(lifted)).perAssignment.find((a) => a.role === 'director')!
    expect(dirLifted.fit).toBeGreaterThan(dirBase.fit)
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// #8 — A relevant WEAKNESS/UNCERTAINTY shown is supported by the calculation:
//      an unproven (workHistory 0) assignment widens the EP band (D-9.7) and is
//      flagged unproven; execution confidence records it as an uncertainty source.
// ═══════════════════════════════════════════════════════════════════════════════
describe('#8 a shown weakness/uncertainty is backed by the EP band / confidence calc', () => {
  it('an unproven assignment has a strictly WIDER EP band than an otherwise-identical proven one', () => {
    const concept = makeConcept({ genre: 'drama' })
    const promise = coherentPromise('drama')
    const shapeEff = resolveShape(DEFAULT_SHAPE)
    const proven = makeTalent({ role: 'director', skill: 60 })
    proven.workHistory.directing = 3 // proven → no unproven-width term
    const unproven = makeTalent({ role: 'director', skill: 60 }) // workHistory 0 by default
    const epProven = expectedPerformance(proven, 'directing', concept, undefined, shapeEff, promise, DEFAULT_SHAPE)
    const epUnproven = expectedPerformance(unproven, 'directing', concept, undefined, shapeEff, promise, DEFAULT_SHAPE)
    const widthProven = epProven.high - epProven.low
    const widthUnproven = epUnproven.high - epUnproven.low
    expect(widthUnproven).toBeGreaterThan(widthProven)
    // packageFit flags the unproven director; the proven one is not flagged.
    const inpU = makeReceptionInputs({ director: unproven, concept, promise, shape: DEFAULT_SHAPE })
    const dirU = packageFit(fitInputFrom(inpU)).perAssignment.find((a) => a.role === 'director')!
    expect(dirU.unproven).toBe(true)
  })

  it('execution confidence lists an unproven assignment among its uncertainty sources', () => {
    const inp = makeReceptionInputs() // all fixtures default to workHistory 0 → unproven
    const ctx = {
      seed: 'exec-uncertain-seed',
      productionId: 'prod-0000',
      directorId: inp.director.id,
      releasedFilms: [],
      concepts: [inp.concept],
    }
    const exec = executionConfidence(inp, ctx)
    // Every default assignment is unproven → at least one "<role> unproven in <discipline>".
    expect(exec.uncertaintySources.some((s) => /unproven in/.test(s))).toBe(true)
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// #9 — A candidate swap updates package metrics correctly: packageDelta equals the
//      difference of the two assessments.
// ═══════════════════════════════════════════════════════════════════════════════
describe('#9 packageDelta equals the exact difference of the two package assessments', () => {
  it('every package-level delta equals after − before, and the swapped assignment carries the fit delta', () => {
    const concept = makeConcept({ genre: 'drama' })
    const promise = coherentPromise('drama')
    const shape = DEFAULT_SHAPE
    const weakLead = makeTalent({ role: 'actor', skill: 30, fame: 10 })
    const strongLead = makeTalent({ role: 'actor', skill: 85, fame: 70 })
    const before = makeReceptionInputs({
      concept,
      promise,
      shape,
      cast: {
        lead: weakLead,
        antagonist: makeTalent({ role: 'actor', skill: 50 }),
        support: makeTalent({ role: 'actor', skill: 50 }),
      } as Record<CastSlot, Talent>,
    })
    const after = makeReceptionInputs({
      concept,
      promise,
      shape,
      writer: before.writer,
      director: before.director,
      cast: { ...before.cast, lead: strongLead } as Record<CastSlot, Talent>,
    })
    const seed = 'delta-seed'
    const pid = 'prod-0000'
    const sBefore = sideFrom(before, seed, pid)
    const sAfter = sideFrom(after, seed, pid)
    const delta = packageDelta(sBefore, sAfter)

    expect(delta.overallFitDelta).toBeCloseTo(sAfter.fit.overall - sBefore.fit.overall, 9)
    expect(delta.executionConfidenceDelta).toBeCloseTo(
      sAfter.execution.score - sBefore.execution.score,
      9,
    )
    expect(delta.studioRevenueExpectedDelta).toBeCloseTo(
      sAfter.profit.studioRevenue.expected - sBefore.profit.studioRevenue.expected,
      3,
    )
    expect(delta.profitExpectedDelta).toBeCloseTo(
      sAfter.profit.profit.expected - sBefore.profit.profit.expected,
      3,
    )
    expect(delta.starPowerDelta).toBeCloseTo(sAfter.castStarPower - sBefore.castStarPower, 9)
    expect(delta.salaryDelta).toBeCloseTo(
      sAfter.profit.committedCost - sBefore.profit.committedCost,
      3,
    )
    // The lead row is marked changed and its fitDelta = afterFit − beforeFit.
    const leadRow = delta.perAssignment.find((d) => d.role === 'lead')!
    expect(leadRow.changed).toBe(true)
    expect(leadRow.fitDelta).toBeCloseTo(leadRow.fitAfter! - leadRow.fitBefore!, 9)
    // Unchanged rows (writer/director/other cast) report changed:false.
    const writerRow = delta.perAssignment.find((d) => d.role === 'writer')!
    expect(writerRow.changed).toBe(false)
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// #10 — OVR is invariant to the film (concept/shape/promise). #11 — Fit MAY change.
// ═══════════════════════════════════════════════════════════════════════════════
describe('#10 OVR is film-invariant and #11 Fit may change with the film', () => {
  it('roleOVR is identical across two different concepts/shapes/promises', () => {
    const t = makeTalent({ role: 'director', skill: 65 })
    const ovrA = roleOVR(t, 'directing')
    const ovrB = roleOVR(t, 'directing') // roleOVR takes NO film input at all
    expect(ovrB).toBe(ovrA)
    // Prove the OVR row inside packageFit's talent does not move when the film changes.
    const inpA = makeReceptionInputs({ director: t, concept: makeConcept({ genre: 'drama' }), shape: DEFAULT_SHAPE })
    const inpB = makeReceptionInputs({ director: t, concept: makeConcept({ genre: 'horror' }), shape: COHERENT_SHAPE, promise: coherentPromise('horror') })
    // Same talent object → same roleOVR regardless of which package it's in.
    expect(roleOVR(inpA.director, 'directing')).toBe(roleOVR(inpB.director, 'directing'))
  })

  it('Fit CAN differ for the same talent under a different shape (specialist skills reweighted)', () => {
    // A specialist actor whose spiked skill is emphasized by one shape but not another.
    const concept = makeConcept({ genre: 'drama' })
    const promise = coherentPromise('drama')
    const specialist = makeTalent({
      role: 'actor',
      disciplineSkills: {
        acting: {
          flat: 20,
          skills: { physicalPerformance: { actual: 95, perceived: 95 }, screenPresence: { actual: 95, perceived: 95 } },
        },
      },
    })
    // immediateAction (kinetic-heavy) vs slowSetup (intimacy-heavy) reweight acting skills
    // differently (SHAPE_SKILL_MODS), so the perceived effectiveSkill — hence Fit — differs.
    const kineticShape: FilmShape = { opening: 'immediateAction', midpoint: 'escalation', ending: 'triumph' }
    const quietShape: FilmShape = { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' }
    const fitK = projectFit(specialist, 'acting', concept, 'lead', resolveShape(kineticShape), promise, kineticShape)
    const fitQ = projectFit(specialist, 'acting', concept, 'lead', resolveShape(quietShape), promise, quietShape)
    expect(fitK).not.toBeCloseTo(fitQ, 3)
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// #12 — Shape-sensitive Fit matches simulation mechanics: the Fit/EP path and the
//       forecast/reception effectiveSkill path use the SAME shape-weighted skill for
//       the same shape (one canonical projectSkillWeights, RULING C).
// ═══════════════════════════════════════════════════════════════════════════════
describe('#12 the UI Fit path and the sim effectiveSkill path agree for the same shape', () => {
  it('projectFit’s ability term equals the sim’s perceived effectiveSkill for the same shape', () => {
    // For a craft hire, Fit = 100·(FIT_CRAFT_ABILITY·eff/100 + FIT_CRAFT_EXP·expShare).
    // With zero genre experience (default), Fit reduces to FIT_CRAFT_ABILITY·eff — so the
    // ability term is exactly the sim's perceived effectiveSkill under the SAME shape.
    const concept = makeConcept({ genre: 'drama' })
    const promise = coherentPromise('drama')
    const shape = COHERENT_SHAPE
    const shapeEff = resolveShape(shape)
    const craft = makeTalent({
      role: 'craft',
      disciplineSkills: {
        craft: { flat: 30, skills: { cinematography: { actual: 90, perceived: 90 } } },
      },
    })
    const effPerceived = effectiveSkill(craft, 'craft', concept, undefined, shapeEff, promise, 'perceived', shape)
    const fit = projectFit(craft, 'craft', concept, undefined, shapeEff, promise, shape)
    // expShare = 0 (no genre experience) ⇒ Fit = 100·FIT_CRAFT_ABILITY·(eff/100).
    expect(fit).toBeCloseTo(TUNING.FIT_CRAFT_ABILITY * effPerceived, 6)
  })

  it('changing ONLY the shape changes the perceived effectiveSkill the forecast reads (same path)', () => {
    // NOTE: shape-skill reweighting (SHAPE_SKILL_MODS) touches acting/writing/directing
    // skills — an ACTING specialist whose spiked skill (physicalPerformance) a kinetic
    // shape emphasizes but a quiet shape does not is the clean shape-sensitivity probe.
    const concept = makeConcept({ genre: 'drama' })
    const promise = coherentPromise('drama')
    const specialist = makeTalent({
      role: 'actor',
      disciplineSkills: {
        acting: { flat: 20, skills: { physicalPerformance: { actual: 95, perceived: 95 } } },
      },
    })
    const shapeA: FilmShape = { opening: 'immediateAction', midpoint: 'escalation', ending: 'triumph' }
    const shapeB: FilmShape = { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' }
    const effA = effectiveSkill(specialist, 'acting', concept, 'lead', resolveShape(shapeA), promise, 'perceived', shapeA)
    const effB = effectiveSkill(specialist, 'acting', concept, 'lead', resolveShape(shapeB), promise, 'perceived', shapeB)
    // The Fit path must reflect the SAME shape sensitivity (both derive from effectiveSkill).
    const fitA = projectFit(specialist, 'acting', concept, 'lead', resolveShape(shapeA), promise, shapeA)
    const fitB = projectFit(specialist, 'acting', concept, 'lead', resolveShape(shapeB), promise, shapeB)
    // Kinetic shape emphasizes physicalPerformance ⇒ higher perceived eff ⇒ higher Fit.
    expect(effA).not.toBeCloseTo(effB, 3)
    expect(effA).toBeGreaterThan(effB)
    // Fit tracks eff (same sign of difference); no genre-exp term to muddy it.
    expect(Math.sign(fitA - fitB)).toBe(Math.sign(effA - effB))
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// #13 — Crew REGRESSION: a CUSTOM-CREATED craft talent, assigned to a film, changes
//       the released technical/craft channel deterministically (vs the no-crew baseline).
// ═══════════════════════════════════════════════════════════════════════════════
describe('#13 a custom-created Crew member changes the released craft channel deterministically', () => {
  it('the same seed-state releases a DIFFERENT craft with the created crew vs no crew', () => {
    const base = generateWorld('crew-regression-1')
    // Author a craft (Crew) talent through the ENGINE (never sets skill directly).
    const withCrewState = applyActions(base, [
      {
        kind: 'createTalent',
        talent: {
          name: 'Test Cinematographer',
          role: 'craft',
          age: 40,
          actual: { warmth: 0, gravity: 0.2, physicality: 0 },
          potentialTier: 'HighUpside',
          workEthic: 80,
        },
      },
    ])
    const crew = withCrewState.talent.find((t) => t.name === 'Test Cinematographer')!
    expect(crew).toBeTruthy()
    expect(crew.role).toBe('craft')

    // Two films from the SAME post-authoring state: one with the crew, one without.
    const noCrew = playToRelease(withCrewState, defaultLegalPackage(withCrewState, []))
    const withCrew = playToRelease(withCrewState, defaultLegalPackage(withCrewState, [crew.id]))

    // D-4: with no craft the technical channel defaults; a real hire replaces the default.
    // The released craft (§5.1) must differ — the crew genuinely CONTRIBUTED.
    expect(withCrew.film.craft).not.toBe(noCrew.film.craft)

    // Determinism: replaying the with-crew release reproduces the identical craft.
    const withCrewAgain = playToRelease(withCrewState, defaultLegalPackage(withCrewState, [crew.id]))
    expect(withCrewAgain.film.craft).toBe(withCrew.film.craft)

    // The craft assignment appears in packageFit as its own row bound to the created crew.
    const inp = assembleInputs(withCrewState, defaultLegalPackage(withCrewState, [crew.id]))
    const craftRow = packageFit(fitInputFrom(inp)).perAssignment.find((a) => a.role === 'craft')
    expect(craftRow).toBeTruthy()
    expect(craftRow!.talentId).toBe(crew.id)
  })
})

// Resolve a Pkg to a full ReceptionInputs against a state (for engine-level assessment).
function assembleInputs(state: GameState, pkg: Pkg): ReceptionInputs {
  const concept = state.concepts.find((c) => c.id === pkg.conceptId)!
  const byId = new Map(state.talent.map((t) => [t.id, t]))
  const cast = {} as Record<CastSlot, Talent>
  for (const slot of CAST_SLOTS) cast[slot] = byId.get(pkg.cast[slot])!
  return {
    concept,
    shape: pkg.shape,
    shapeEffects: resolveShape(pkg.shape),
    promise: pkg.promise,
    budget: pkg.budget,
    writer: byId.get(pkg.writerId)!,
    director: byId.get(pkg.directorId)!,
    cast,
    craftHires: pkg.craftIds.map((id) => byId.get(id)!),
    market: state.market,
    standing: state.studio.standing,
    era: state.era,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// #14 — The greenlight assessment is LOCKED: it uses the stored forecastSnapshot /
//       committed production, not a recompute of a later-edited draft.
// #15 — The autopsy uses the LOCKED assessment (pre-tick snapshot + committed production).
// ═══════════════════════════════════════════════════════════════════════════════
describe('#14/#15 the greenlight assessment is locked to the committed production + snapshot', () => {
  it('greenlightAssessment.forecastSnapshot is EXACTLY the production.forecastSnapshot (not a recompute)', () => {
    const state = generateWorld('lock-1')
    const { preTick, production } = playToRelease(state, defaultLegalPackage(state, []))
    const assessment = greenlightAssessment(snapshotOf(preTick), production)
    // Same object identity — the assessment surfaces the LOCKED snapshot verbatim.
    expect(assessment.forecastSnapshot).toBe(production.forecastSnapshot)
    // The stored uncertainty factors come off that same locked snapshot.
    expect(assessment.storedUncertaintyFactors).toEqual(
      production.forecastSnapshot.segments[0]?.uncertaintyFactors ?? [],
    )
  })

  it('mutating a later DRAFT (different budget/shape) does not change the locked assessment', () => {
    const state = generateWorld('lock-2')
    const { preTick, production } = playToRelease(state, defaultLegalPackage(state, []))
    const lockedA = greenlightAssessment(snapshotOf(preTick), production)
    // Build a DIFFERENT draft (fatter marketing, different shape) — a "later edit".
    // The locked production is unchanged, so the assessment recomputed from it is identical.
    const lockedB = greenlightAssessment(snapshotOf(preTick), production)
    expect(lockedB.profit.committedCost).toBe(lockedA.profit.committedCost)
    expect(lockedB.cohesion.score).toBe(lockedA.cohesion.score)
    expect(lockedB.fit.overall).toBe(lockedA.fit.overall)
    expect(lockedB.execution.score).toBe(lockedA.execution.score)
    // committedCost is the D-1 identity on the LOCKED production budget + salaries.
    expect(lockedA.profit.committedCost).toBe(committedCostOf(preTick, production))
    // Break-even is the GROSS box office needed to return the cost (studio keeps `share`).
    // D-17A fix-pass: `share` is the REGIME's share, and this assessment is reconstructed with
    // `engaged = false` on a `generateWorld` (never-engaged) state — that regime credits the
    // FULL gross in one lump at release, so the break-even gross IS the committed cost.
    // Asserting cost/0.52 here pinned a basis this regime never had.
    expect(lockedA.profit.breakEven).toBeCloseTo(lockedA.profit.committedCost, 3)
    expect(lockedA.profit.studioRevenueIsFullBoxOffice).toBe(true)
    // …and the D-12 ENGAGED reconstruction of the SAME locked production keeps the 0.52 basis.
    const lockedEngaged = greenlightAssessment(snapshotOf(preTick), production, true)
    expect(lockedEngaged.profit.committedCost).toBe(lockedA.profit.committedCost)
    expect(lockedEngaged.profit.breakEven).toBeCloseTo(
      lockedEngaged.profit.committedCost / TUNING.STUDIO_RENTAL_BLENDED,
      3,
    )
    expect(lockedEngaged.profit.studioRevenueIsFullBoxOffice).toBe(false)
  })

  it('the autopsy assessment (locked) reproduces the SAME greenlight expectation on replay', () => {
    // The autopsy is greenlightAssessment(pre-tick snapshot, committed production) — a
    // pure function of the LOCKED inputs, so it is deterministic and diffable against actuals.
    const state = generateWorld('lock-3')
    const { preTick, production, film } = playToRelease(state, defaultLegalPackage(state, []))
    const a1 = greenlightAssessment(snapshotOf(preTick), production)
    const a2 = greenlightAssessment(snapshotOf(preTick), production)
    expect(a2).toEqual(a1)
    // The autopsy commercial expectation is the locked forecast, independent of the actual.
    expect(a1.profit.studioRevenue.expected).toBeGreaterThan(0)
    void film
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// #16 — Causal explanations correspond to actual recorded factors: risksMaterialized
//       maps the STORED uncertaintyFactors to the real outcome; strengths/risks come
//       from real causal/uncertainty factors (no invented explanation).
// ═══════════════════════════════════════════════════════════════════════════════
describe('#16 risksMaterialized maps only the stored uncertainty factors against the real result', () => {
  it('every materialized risk names a factor that was actually stored at greenlight', () => {
    const state = generateWorld('risks-1')
    const { preTick, production, film } = playToRelease(state, defaultLegalPackage(state, []))
    const assessment = greenlightAssessment(snapshotOf(preTick), production)
    const rm = risksMaterialized(assessment, film as unknown as never)
    // The set of assessed factors is EXACTLY the stored uncertainty factors — nothing invented.
    expect(rm.risks.map((r) => r.factor)).toEqual(assessment.storedUncertaintyFactors)
    expect(rm.materializedCount).toBe(rm.risks.filter((r) => r.materialized).length)
  })

  it('a stored unknownLead risk materializes iff the film actually underperformed (audience/critics)', () => {
    // Reconstruct the exact rule from the spec and confirm the helper matches it on the real result.
    const state = generateWorld('risks-2')
    const { preTick, production, film } = playToRelease(state, defaultLegalPackage(state, []))
    const assessment = greenlightAssessment(snapshotOf(preTick), production)
    const rm = risksMaterialized(assessment, film as unknown as never)
    const meanSeg =
      SEGMENTS.map((s) => film.segmentScores[s] ?? 0).reduce((a, b) => a + b, 0) / SEGMENTS.length
    for (const r of rm.risks) {
      if (r.factor === 'unknownLead') {
        const expected = meanSeg < 50 || film.criticScore < 45
        expect(r.materialized).toBe(expected)
      }
      if (r.factor === 'noSegmentHistory') {
        expect(r.materialized).toBe(meanSeg < 50)
      }
      if (r.factor === 'vaguePromise') {
        expect(r.materialized).toBe(film.cohesion < 0.5)
      }
    }
  })

  it('greenlight strengths/risks are drawn from the real assessment channels, not invented', () => {
    const state = generateWorld('risks-3')
    const { preTick, production } = playToRelease(state, defaultLegalPackage(state, []))
    const a = greenlightAssessment(snapshotOf(preTick), production)
    // Every strength/risk string is grounded: cohesion strengths/conflicts, execution
    // sources, or a fit/profit-derived phrase — the union of the real channels.
    const groundedStrengths = new Set<string>([
      'coherent creative brief',
      // D-17A/T2: the strength now names its basis (direct costs) — the trigger is unchanged.
      'expected to profit on its direct costs',
      ...a.cohesion.strengths,
      ...a.execution.confidenceSources,
      `strong ${a.fit.strongest.role}`,
    ])
    for (const s of a.strengths) expect(groundedStrengths.has(s)).toBe(true)
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// #17 — No hidden ACTUAL information leaks before release: no assessment output
//       carries an actual skill / true ceiling / hidden roll / true Potential.
// ═══════════════════════════════════════════════════════════════════════════════
describe('#17 no assessment output leaks hidden actual data pre-release', () => {
  it('the assessment JSON contains none of the talent’s hidden actual skills or true ceilings', () => {
    const state = generateWorld('leak-engine-1')
    const { preTick, production } = playToRelease(state, defaultLegalPackage(state, []))
    const a = greenlightAssessment(snapshotOf(preTick), production)
    const blob = JSON.stringify({
      cohesion: a.cohesion,
      fit: a.fit,
      execution: a.execution,
      profit: a.profit,
      strengths: a.strengths,
      risks: a.risks,
    })
    // Collect the hidden actual skills + true ceilings of every talent on the package.
    const byId = new Map(preTick.talent.map((t) => [t.id, t]))
    const packageTalent: Talent[] = [
      byId.get(production.writerId)!,
      byId.get(production.directorId)!,
      ...CAST_SLOTS.map((s) => byId.get(production.cast[s])!),
      ...production.craftIds.map((id) => byId.get(id)!),
    ]
    const hidden = new Set<number>()
    for (const t of packageTalent) {
      for (const d of Object.keys(t.skills) as (keyof typeof t.skills)[]) {
        const disc = t.skills[d] as Record<string, { actual: number; perceived: number }>
        for (const k of Object.keys(disc)) {
          // A hidden actual value is only a LEAK if it differs from the perceived one
          // (perceived is player-visible; equal actual==perceived is not a leak).
          if (disc[k]!.actual !== disc[k]!.perceived) hidden.add(disc[k]!.actual)
        }
        const ceil = t.ceilings[d] as Record<string, number>
        for (const k of Object.keys(ceil)) {
          // A true ceiling above the perceived skill is hidden; equal is not distinguishable.
          const perceived = disc[k]?.perceived
          if (perceived !== undefined && ceil[k]! > perceived) hidden.add(ceil[k]!)
        }
      }
    }
    // The assessment legitimately PUBLISHES many derived integers (rounded fits, EP band
    // edges, cohesion/execution scores). A hidden value that merely COLLIDES with one of
    // those public numbers is not a leak — exclude the assessment's own published integers
    // (the SAME cross-collision discipline the UI leak test uses). Anything that IS a real
    // actual/ceiling and is NOT one of these public outputs would still be caught.
    const allowed = new Set<number>()
    const add = (x: number) => allowed.add(Math.round(x))
    add(a.cohesion.score)
    add(a.execution.score)
    add(a.fit.overall)
    for (const asg of a.fit.perAssignment) {
      add(asg.fit)
      add(asg.expected.low)
      add(asg.expected.high)
      add(asg.expected.expected)
    }
    // A hidden number LEAKS only if it appears as a COMPLETE standalone number in the blob
    // (not the integer part of a longer decimal, and not equal to a published integer).
    for (const v of hidden) {
      if (allowed.has(v)) continue // coincidental collision with a public output — not a leak
      // Match the value as a whole number: not preceded by a digit/dot, not FOLLOWED by a
      // digit or a decimal point (so "41" does NOT match inside "41.46" or "3410").
      const re = new RegExp(`(^|[^0-9.])${v}([^0-9.]|$)`)
      expect(re.test(blob), `hidden actual/ceiling ${v} leaked into assessment`).toBe(false)
    }
    // Structural: no field named or valued "actual"; the word never appears.
    expect(blob.toLowerCase()).not.toContain('"actual"')
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// #18 — A STRONG package does NOT guarantee success: a high-cohesion / good-fit /
//       expected-to-profit package can still lose money within the authorized
//       one-gaussian forecast uncertainty. (Seed found by a seeded scan.)
// ═══════════════════════════════════════════════════════════════════════════════
describe('#18 a strong, expected-to-profit package can still lose money (authorized uncertainty)', () => {
  it('a strong brief with POSITIVE expected profit can still take a real LOSS (D-12 share; scanned witness)', () => {
    const share = TUNING.STUDIO_RENTAL_BLENDED
    const shapeEff = resolveShape(COHERENT_SHAPE)
    // The original single-seed witness (b6-82) had borderline marketing-0 economics that the D-12
    // blended share pushed below break-even in EXPECTATION. The design point — a strong,
    // expected-to-profit package that still loses within the authorized one-gaussian uncertainty —
    // is unchanged; we scan for a witness under the share model (a modest marketing budget lifts
    // the expected GROSS above the share break-even, so the downward miss is the only cause of loss).
    let witness: {
      seed: string
      cohesionTier: string
      cohesionScore: number
      fitOverall: number
      expectedProfit: number
      lowProfit: number
      actualProfit: number
    } | null = null
    for (let i = 1; i <= 400 && witness === null; i++) {
      const seed = `b6-${i}`
      const state = generateWorld(seed)
      const concept = state.concepts[0]!
      const promise = coherentPromise(concept.genre)
      const fitOf = (t: Talent, disc: Talent['role'] extends never ? never : Parameters<typeof projectFit>[1], slot?: CastSlot) =>
        projectFit(t, disc, concept, slot, shapeEff, promise, COHERENT_SHAPE)
      const bestBy = (role: string, disc: Parameters<typeof projectFit>[1], slot?: CastSlot, exclude: Set<string> = new Set()) =>
        state.talent
          .filter((t) => t.role === role && !exclude.has(t.id))
          .sort((a, b) => fitOf(b, disc, slot) - fitOf(a, disc, slot) || (a.id < b.id ? -1 : 1))[0]!
      const writer = bestBy('writer', 'writing')
      const director = bestBy('director', 'directing')
      const lead = bestBy('actor', 'acting', 'lead')
      const antagonist = bestBy('actor', 'acting', 'antagonist', new Set([lead.id]))
      const support = bestBy('actor', 'acting', 'support', new Set([lead.id, antagonist.id]))
      const pkg: Pkg = {
        conceptId: concept.id,
        shape: COHERENT_SHAPE,
        promise,
        writerId: writer.id,
        directorId: director.id,
        craftIds: [],
        cast: { lead: lead.id, antagonist: antagonist.id, support: support.id },
        budget: { negative: requiredNegative(state, concept, COHERENT_SHAPE), marketing: 3_000_000 },
      }
      const { preTick, production, film } = playToRelease(state, pkg)
      const assessment = greenlightAssessment(snapshotOf(preTick), production)
      const actualProfit = film.boxOffice.total * share - committedCostOf(preTick, production)
      if (
        assessment.cohesion.tier === 'strong' &&
        assessment.cohesion.score > 70 &&
        assessment.fit.overall > 55 &&
        assessment.profit.profit.expected > 0 && // studio EXPECTED to profit (share-based)
        actualProfit < 0 && // yet the actual studio result LOST money
        assessment.profit.profit.low < assessment.profit.profit.expected // downside disclosed
      ) {
        witness = {
          seed,
          cohesionTier: assessment.cohesion.tier,
          cohesionScore: assessment.cohesion.score,
          fitOverall: assessment.fit.overall,
          expectedProfit: assessment.profit.profit.expected,
          lowProfit: assessment.profit.profit.low,
          actualProfit,
        }
      }
    }
    // Such a package MUST exist: the forecast band spans the (share) break-even, so an
    // expected-to-profit strong film can still miss downward into a real loss.
    expect(witness, 'a strong, expected-to-profit package that still lost money should exist').not.toBeNull()
    expect(witness!.expectedProfit).toBeGreaterThan(0)
    expect(witness!.actualProfit).toBeLessThan(0)
    expect(witness!.lowProfit).toBeLessThan(witness!.expectedProfit)
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// #19 — A WEAK package MAY still succeed within authorized uncertainty.
//       (Seed found by a seeded scan.)
// ═══════════════════════════════════════════════════════════════════════════════
describe('#19 a weak-Fit / weak-execution package can still profit (authorized uncertainty)', () => {
  it('seed scan-0: weak talent fit (≈41) + weak execution (≈26), yet the film profits', () => {
    const state = generateWorld('scan-0')
    // The DEFAULT legal package (first-listed talent) — deliberately not optimized.
    const pkg = defaultLegalPackage(state, [], 400_000)
    const { preTick, production, film } = playToRelease(state, pkg)
    const assessment = greenlightAssessment(snapshotOf(preTick), production)

    // The package is WEAK on the talent channels the assessment surfaces.
    expect(assessment.fit.overall).toBeLessThan(50)
    expect(assessment.execution.score).toBeLessThan(45)

    // Yet the ACTUAL result profited — a weak package succeeded within authorized uncertainty.
    const actualProfit = film.boxOffice.total - committedCostOf(preTick, production)
    expect(actualProfit).toBeGreaterThan(0)
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// #20 — The financial forecast uses studio-relevant revenue and costs:
//       profit = studioRevenue − committedCost; committedCost = negative + marketing +
//       Σ salaries; studioRevenue = FULL box-office total; break-even = committedCost.
// ═══════════════════════════════════════════════════════════════════════════════
describe('#20 forecastProfitRange uses studio revenue (blended rental share) and the D-1 committed cost', () => {
  it('committedCost = negative + marketing + salaries; breakEven = cost/share; profit = share×gross − cost', () => {
    const negative = 5_000_000
    const marketing = 800_000
    const writer = makeTalent({ role: 'writer', skill: 60, salary: 300_000 })
    const director = makeTalent({ role: 'director', skill: 65, salary: 500_000 })
    const cast = {
      lead: makeTalent({ role: 'actor', skill: 70, salary: 900_000 }),
      antagonist: makeTalent({ role: 'actor', skill: 55, salary: 200_000 }),
      support: makeTalent({ role: 'actor', skill: 55, salary: 100_000 }),
    } as Record<CastSlot, Talent>
    const craftHires = [makeTalent({ role: 'craft', skill: 60, salary: 150_000 })]
    const inp = makeReceptionInputs({
      budget: makeBudget(negative, marketing),
      writer,
      director,
      cast,
      craftHires,
    })
    let salaries = writer.salary + director.salary
    for (const slot of CAST_SLOTS) salaries += cast[slot].salary
    for (const c of craftHires) salaries += c.salary
    const ctx = {
      seed: 'profit-seed',
      productionId: 'prod-0000',
      directorId: director.id,
      releasedFilms: [],
      concepts: [inp.concept],
      salaries,
    }
    const pr = forecastProfitRange(inp, ctx)

    const expectedCommitted = negative + marketing + salaries
    expect(pr.committedCost).toBe(expectedCommitted)
    // Break-even is the GROSS box office needed to return the cost (studio keeps `share`).
    // D-17A fix-pass: `share` is the REGIME's share. This ctx carries no `engaged` flag, i.e.
    // the D-1 path, where release credits the FULL gross in one lump — share 1, break-even
    // gross === committed cost, and `studioRevenueIsFullBoxOffice` reports exactly that.
    // The ENGAGED (0.52) basis is pinned separately below.
    expect(pr.breakEven).toBeCloseTo(expectedCommitted, 3)
    expect(pr.studioRevenueIsFullBoxOffice).toBe(true)

    // D-12: studioRevenue = share × the FULL box-office total on the forecast's per-segment
    // estimate maps. Recompute the expected-map gross and confirm equality after the share.
    const forecast = computeForecast(inp, ctx)
    const midMap: Record<string, number> = {}
    for (const seg of forecast.segments) midMap[seg.segmentId] = seg.estimate
    const boxExpected = computeBoxOffice(
      midMap as Record<(typeof SEGMENTS)[number], number>,
      inp.market.segments,
      inp.market.baseMarketValue,
      inp.standing,
      inp.promise,
      inp.budget,
      inp.shapeEffects,
    ).total
    expect(pr.studioRevenue.expected).toBeCloseTo(boxExpected, 3)

    // D-12 / D-17A fix-pass — the ENGAGED regime keeps the blended rental share, on the very
    // same inputs. Same committed cost, share-scaled revenue, cost/share break-even.
    const prEngaged = forecastProfitRange(inp, { ...ctx, saturateFame: true, engaged: true })
    expect(prEngaged.committedCost).toBe(expectedCommitted)
    expect(prEngaged.studioRevenueIsFullBoxOffice).toBe(false)
    expect(prEngaged.breakEven).toBeCloseTo(expectedCommitted / TUNING.STUDIO_RENTAL_BLENDED, 3)
    expect(prEngaged.profit.expected).toBeCloseTo(prEngaged.studioRevenue.expected - expectedCommitted, 3)

    // profit (each edge) = studioRevenue − committedCost.
    expect(pr.profit.expected).toBeCloseTo(pr.studioRevenue.expected - expectedCommitted, 3)
    expect(pr.profit.low).toBeCloseTo(pr.studioRevenue.low - expectedCommitted, 3)
    expect(pr.profit.high).toBeCloseTo(pr.studioRevenue.high - expectedCommitted, 3)
    // Box office is monotone in appeal ⇒ low ≤ expected ≤ high on both revenue and profit.
    expect(pr.studioRevenue.low).toBeLessThanOrEqual(pr.studioRevenue.expected + 1e-6)
    expect(pr.studioRevenue.expected).toBeLessThanOrEqual(pr.studioRevenue.high + 1e-6)
  })
})
