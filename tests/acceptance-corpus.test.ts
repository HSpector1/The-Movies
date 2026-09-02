// ── §15 acceptance — Phase-4 corpus pieces (INDEPENDENT, contract-derived) ─────
//
// SOURCE OF TRUTH: build-contract.md rev. 4 §15 + NORMATIVE docs/rev4-open-questions.md
// (M11 bounds scope, B28 four-quadrants, §15.7 replay/M14, M9 streams). Every
// expectation is derived from the CONTRACT. The bodies of broadcast.ts / tick.ts /
// the harness are NEVER read; imports come from the public surface (src/core/index.ts)
// and the two allowed reception/forecast helper modules whose *signatures* are
// re-exported through index.ts.
//
// Phase-2/3 already cover §15.3 (neutral stacking), §15.4 (promise ordering), §15.5
// (slot transform), §15.6 (forecast independence) and §15.7 replay. This file ADDS
// the Phase-4 pieces the brief assigns and does NOT duplicate those:
//   §15.1  corpus bounds (M11 corpus-observable terms) across all releases.
//   §15.2  four-quadrant — (i) UNIT recipes (B28 part i) + (ii) CORPUS reachability
//          (B28 part ii): each cell of (craft ≷ 55)×(cohesion ≷ 0.55) non-empty.
//   §15.7  replay WITH broadcast: full-year exportSave byte-identical INCLUDING the
//          (empty but byte-identical) broadcast copy, both agents.
//   Deterministic corpus reproduction: same seeds twice ⇒ identical outcomes.
//
// REPRESENTATIVE CORPUS: the harness runs the authoritative 1,000 seeds; here a
// modest 100-seed sample (both agents) is representative, with a generous timeout.
// Tune-proofing: any expected value that scales with a TUNING constant is COMPUTED
// from TUNING, never hard-coded.
//
// HARD RULES honoured: seeded RNG only (RngStream/stream); the forbidden unseeded
// literal never appears in this file; strict TS.

import { describe, expect, it } from 'vitest'
import {
  applyActions,
  castContribution,
  exportSave,
  generateWorld,
  magnitude,
  makeSave,
  OracleAgent,
  personaToExpression,
  RandomAgent,
  resolveReception,
  RngStream,
  safeCosine,
  tick,
  TUNING,
} from '../src/core/index.js'
import type {
  Agent,
  CastSlot,
  Expression,
  FilmResult,
  GameState,
  Persona,
  RoleRequirement,
  SegmentId,
  Talent,
} from '../src/core/index.js'
import type { ReceptionInputs } from '../src/core/reception.js'
import {
  INITIAL_STANDING_FIXTURE,
  makeConcept,
  makeMarket,
  makeReceptionInputs,
  makeShapeEffects,
  makeTalent,
  NEUTRAL_ERA,
  SEGMENT_SHARES,
} from './_fixtures.js'

const SEGMENT_IDS: SegmentId[] = ['youngAdult', 'family', 'adult', 'prestige']

// P06A (charter W1): a picture at remainingTicks===1 HOLDS until an explicit
// commitPictureToRelease — every driving fixture below must commit each
// ready picture before the tick that would otherwise have released it.
function commitReadyPictures(state: GameState): GameState {
  const committed = new Set(state.releaseAuthority.commitments.map((r) => r.productionId))
  const ready = state.studio.activeProductions.filter(
    (p) => p.remainingTicks === 1 && !committed.has(p.id),
  )
  if (ready.length === 0) return state
  return applyActions(
    state,
    ready.map((p) => ({ kind: 'commitPictureToRelease' as const, productionId: p.id })),
  )
}

// One full simulated year from generateWorld(seed) under `agent`.
function runYear(seed: string, agent: Agent): GameState {
  let state = generateWorld(seed)
  for (let t = 0; t < TUNING.TICKS_PER_YEAR; t++) {
    state = applyActions(state, agent.chooseActions(state))
    state = commitReadyPictures(state)
    state = tick(state)
  }
  return state
}

// Drive a year and collect (a) every released FilmResult and (b) every distinct
// forecast snapshot observed on active productions across the run.
function collectYear(
  seed: string,
  agent: Agent,
): { releases: FilmResult[]; snapshots: GameState['studio']['activeProductions'][number]['forecastSnapshot'][] } {
  let state = generateWorld(seed)
  const snapshots: GameState['studio']['activeProductions'][number]['forecastSnapshot'][] = []
  const seen = new Set<string>()
  for (let t = 0; t < TUNING.TICKS_PER_YEAR; t++) {
    state = applyActions(state, agent.chooseActions(state))
    // Capture snapshots of active productions (each computed at greenlight).
    for (const p of state.studio.activeProductions) {
      if (!seen.has(p.id)) {
        seen.add(p.id)
        snapshots.push(p.forecastSnapshot)
      }
    }
    state = commitReadyPictures(state)
    state = tick(state)
  }
  return { releases: state.studio.releasedFilms, snapshots }
}

// weightedAudienceScore = Σ_s share·segmentScore (§5.5) — corpus-observable from a
// released FilmResult's segmentScores and the fixed §9 shares.
function weightedAudienceScore(f: FilmResult): number {
  return SEGMENT_IDS.reduce((acc, id) => acc + SEGMENT_SHARES[id] * f.segmentScores[id], 0)
}

const AGENTS: Array<[string, Agent]> = [
  ['Oracle', OracleAgent],
  ['Random', RandomAgent],
]

// A representative sample of seeds. 100 distinct seeds × both agents.
const CORPUS_SEEDS = Array.from({ length: 100 }, (_, i) => `m0a-corpus-${String(i + 1).padStart(4, '0')}`)

// ─────────────────────────────────────────────────────────────────────────────
// §15.1 bounds — every M11 corpus-observable bounded term stays in range.
// ─────────────────────────────────────────────────────────────────────────────
describe('§15.1 bounds (M11) — every bounded term in range across the representative corpus', () => {
  it('craft, cohesion, criticScore, segmentScores, WAS, and forecast low/high/estimate/center ∈ range', () => {
    const IN01 = (v: number) => v >= 0 && v <= 1
    const IN0100 = (v: number) => v >= 0 && v <= 100
    let releaseCount = 0
    let snapshotSegCount = 0

    for (const [, agent] of AGENTS) {
      for (const seed of CORPUS_SEEDS) {
        const { releases, snapshots } = collectYear(`${seed}-bounds`, agent)
        for (const f of releases) {
          releaseCount++
          expect(IN0100(f.craft)).toBe(true) // craft ∈ [0,100]
          expect(IN01(f.cohesion)).toBe(true) // cohesion ∈ [0,1]
          expect(IN0100(f.criticScore)).toBe(true) // criticScore ∈ [0,100] (clamped)
          for (const id of SEGMENT_IDS) {
            expect(IN0100(f.segmentScores[id])).toBe(true) // each segmentScore ∈ [0,100]
          }
          expect(IN0100(weightedAudienceScore(f))).toBe(true) // WAS ∈ [0,100]
        }
        for (const snap of snapshots) {
          for (const seg of snap.segments) {
            snapshotSegCount++
            // forecast low/high/estimate/center ∈ [0,100] (§7 clamps).
            expect(IN0100(seg.low)).toBe(true)
            expect(IN0100(seg.high)).toBe(true)
            expect(IN0100(seg.estimate)).toBe(true)
            expect(IN0100(seg.center)).toBe(true)
          }
        }
      }
    }
    // Guard against a vacuous pass.
    expect(releaseCount).toBeGreaterThan(0)
    expect(snapshotSegCount).toBeGreaterThan(0)
  }, 60_000)
})

// ─────────────────────────────────────────────────────────────────────────────
// §15.2 four-quadrant — UNIT recipes (B28 part i).
// ─────────────────────────────────────────────────────────────────────────────
//
// Every §5.1 input pinned per B28: shape injected with craftMod 0 (via makeShapeEffects);
// budget.negative = requiredNegative (= baseNegativeCost·1.0·1.0) ⇒ budgetAdequacy = 87.0;
// no craft hires ⇒ technical = 40. Skills/baselineStrength/roleFit set per recipe.
//
// roleFit is set by displacing req.target from actual on the intimacy/warmth axis by
// (1−roleFit)·tolerance ⇒ personaDistance = that displacement ⇒ roleFit exact.
describe('§15.2 four-quadrant UNIT recipes (B28 part i)', () => {
  function personaOf(e: { i: number; t: number; k: number }): Persona {
    return { warmth: e.i, gravity: e.t, physicality: e.k }
  }

  function reqFor(actual: Persona, roleFit: number, tolerance = 1.0): RoleRequirement {
    const shift = (1 - roleFit) * tolerance
    return {
      target: { warmth: actual.warmth + shift, gravity: actual.gravity, physicality: actual.physicality },
      tolerance,
    }
  }

  type Recipe = {
    personas: Record<'writer' | 'director' | 'lead' | 'antagonist' | 'support', Persona>
    shapeExpr: Expression
    skill: number
    baseline: number
    roleFit: number
  }

  function buildInputs(r: Recipe): ReceptionInputs {
    const concept = makeConcept({
      baselineStrength: r.baseline,
      baseNegativeCost: 4_000_000,
      roleRequirements: {
        lead: reqFor(r.personas.lead, r.roleFit),
        antagonist: reqFor(r.personas.antagonist, r.roleFit),
        support: reqFor(r.personas.support, r.roleFit),
      } as Record<CastSlot, RoleRequirement>,
    })
    // B28 pin: budget.negative = requiredNegative ⇒ budgetAdequacy 87.0.
    const requiredNegative = concept.baseNegativeCost * 1.0 * NEUTRAL_ERA.costScale
    const shapeEffects = makeShapeEffects({
      expression: r.shapeExpr,
      craftMod: 0,
      budgetDemandMultiplier: 1.0,
    })
    const mkT = (p: Persona, role: Talent['role']): Talent =>
      makeTalent({ actual: p, skill: r.skill, role, fame: 0 })
    return makeReceptionInputs({
      concept,
      shapeEffects,
      budget: { negative: requiredNegative, marketing: TUNING.MARKETING_HALF_SATURATION },
      writer: mkT(r.personas.writer, 'writer'),
      director: mkT(r.personas.director, 'director'),
      cast: {
        lead: mkT(r.personas.lead, 'actor'),
        antagonist: mkT(r.personas.antagonist, 'actor'),
        support: mkT(r.personas.support, 'actor'),
      } as Record<CastSlot, Talent>,
      craftHires: [], // technical = 40
      market: makeMarket(),
      standing: { ...INITIAL_STANDING_FIXTURE },
      era: NEUTRAL_ERA,
    })
  }

  // Six aligned contributions: direction d, magnitude ≈ 0.6. The antagonist SLOT
  // transform negates intimacy, so its persona pre-negates intimacy ⇒ its
  // CONTRIBUTION aligns with d (pairwise cosine ≥ 0.9 across all six).
  function alignedPersonas(d: {
    i: number
    t: number
    k: number
  }): Recipe['personas'] {
    const p = personaOf(d)
    const antag: Persona = { warmth: -d.i, gravity: d.t, physicality: d.k }
    return { writer: { ...p }, director: { ...p }, lead: { ...p }, antagonist: antag, support: { ...p } }
  }

  const ALIGNED_DIR = { i: 0.35, t: 0.35, k: 0.35 } // |vector| = √(3·0.35²) ≈ 0.606

  // Helper: the six contribution vectors (§5.2) for a recipe's personas.
  function contributions(personas: Recipe['personas']): Record<string, Expression> {
    return {
      writer: personaToExpression(personas.writer),
      director: personaToExpression(personas.director),
      lead: castContribution(personas.lead, 'lead'),
      antagonist: castContribution(personas.antagonist, 'antagonist'),
      support: castContribution(personas.support, 'support'),
    }
  }
  function minPairwiseCosine(personas: Recipe['personas']): number {
    const cs = contributions(personas)
    const keys = Object.keys(cs)
    let min = Infinity
    for (let i = 0; i < keys.length; i++) {
      for (let j = i + 1; j < keys.length; j++) {
        min = Math.min(min, safeCosine(cs[keys[i]!]!, cs[keys[j]!]!))
      }
    }
    return min
  }

  // Recipes -------------------------------------------------------------------
  const uniformDull: Recipe = {
    personas: alignedPersonas(ALIGNED_DIR),
    shapeExpr: { intimacy: ALIGNED_DIR.i, tonalWeight: ALIGNED_DIR.t, kineticEnergy: ALIGNED_DIR.k },
    skill: 30,
    baseline: 35,
    roleFit: 0.5,
  }
  const uniformCapable: Recipe = {
    personas: alignedPersonas(ALIGNED_DIR),
    shapeExpr: { intimacy: ALIGNED_DIR.i, tonalWeight: ALIGNED_DIR.t, kineticEnergy: ALIGNED_DIR.k },
    skill: 85,
    baseline: 75,
    roleFit: 0.9,
  }
  // Opposed vectors: some pairwise contribution cosine ≤ −0.5.
  const talentedContradictory: Recipe = {
    personas: {
      writer: { warmth: 0.5, gravity: 0.5, physicality: 0.5 },
      director: { warmth: -0.5, gravity: -0.5, physicality: -0.5 },
      lead: { warmth: 0.5, gravity: 0.5, physicality: 0.5 },
      antagonist: { warmth: 0.5, gravity: -0.5, physicality: -0.5 },
      support: { warmth: -0.5, gravity: -0.5, physicality: -0.5 },
    },
    shapeExpr: { intimacy: 0.5, tonalWeight: -0.5, kineticEnergy: 0.5 },
    skill: 85,
    baseline: 75,
    roleFit: 0.9,
  }
  // Scattered cast, aligned director + shape.
  const variedStructured: Recipe = {
    personas: {
      writer: { warmth: 0.3, gravity: -0.2, physicality: 0.6 },
      director: { warmth: 0.5, gravity: 0.5, physicality: 0.5 },
      lead: { warmth: -0.4, gravity: 0.5, physicality: -0.3 },
      antagonist: { warmth: 0.2, gravity: 0.1, physicality: 0.7 },
      support: { warmth: 0.6, gravity: -0.5, physicality: 0.0 },
    },
    shapeExpr: { intimacy: 0.5, tonalWeight: 0.5, kineticEnergy: 0.5 },
    skill: 60,
    baseline: 55,
    roleFit: 0.7,
  }

  // A fresh seeded stream per recipe (the §5.3 critic draw doesn't touch craft or
  // cohesion, both fully deterministic, but resolveReception requires a stream).
  function resolve(r: Recipe) {
    return resolveReception(buildInputs(r), RngStream.fromSeed('quadrant-unit'))
  }

  const dull = resolve(uniformDull)
  const capable = resolve(uniformCapable)
  const contra = resolve(talentedContradictory)
  const varied = resolve(variedStructured)

  it('recipe preconditions: aligned recipes have pairwise cosine ≥ 0.9; contradictory has some ≤ −0.5; dull magnitudes ≈ 0.6', () => {
    expect(minPairwiseCosine(uniformDull.personas)).toBeGreaterThanOrEqual(0.9)
    expect(minPairwiseCosine(uniformCapable.personas)).toBeGreaterThanOrEqual(0.9)
    expect(minPairwiseCosine(talentedContradictory.personas)).toBeLessThanOrEqual(-0.5)
    // dull contribution magnitudes ≈ 0.6 (B28: "magnitudes ≈ 0.6").
    const cs = contributions(uniformDull.personas)
    for (const k of Object.keys(cs)) {
      expect(magnitude(cs[k]!)).toBeCloseTo(0.606, 2)
    }
  })

  it('uniform+dull → craft ≤ 42 AND cohesion ≥ 0.75', () => {
    expect(dull.craft).toBeLessThanOrEqual(42)
    expect(dull.cohesion).toBeGreaterThanOrEqual(0.75)
  })

  it('uniform+capable → craft ≥ 72 AND cohesion ≥ 0.75', () => {
    expect(capable.craft).toBeGreaterThanOrEqual(72)
    expect(capable.cohesion).toBeGreaterThanOrEqual(0.75)
  })

  it('talented+contradictory → craft ≥ 72 AND cohesion ≤ 0.35', () => {
    expect(contra.craft).toBeGreaterThanOrEqual(72)
    expect(contra.cohesion).toBeLessThanOrEqual(0.35)
  })

  it('varied+structured → craft ∈ [50,68] AND cohesion ∈ [0.45,0.68]', () => {
    expect(varied.craft).toBeGreaterThanOrEqual(50)
    expect(varied.craft).toBeLessThanOrEqual(68)
    expect(varied.cohesion).toBeGreaterThanOrEqual(0.45)
    expect(varied.cohesion).toBeLessThanOrEqual(0.68)
  })

  it('distinguishability: every pair differs by ≥ 10 craft points OR ≥ 0.20 cohesion', () => {
    const recipes = [
      ['dull', dull],
      ['capable', capable],
      ['contra', contra],
      ['varied', varied],
    ] as const
    for (let i = 0; i < recipes.length; i++) {
      for (let j = i + 1; j < recipes.length; j++) {
        const [ni, a] = recipes[i]!
        const [nj, b] = recipes[j]!
        const craftGap = Math.abs(a.craft - b.craft)
        const cohGap = Math.abs(a.cohesion - b.cohesion)
        expect(
          craftGap >= 10 || cohGap >= 0.2,
          `${ni} vs ${nj}: craftGap=${craftGap.toFixed(2)} cohGap=${cohGap.toFixed(3)}`,
        ).toBe(true)
      }
    }
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// §15.2 four-quadrant — CORPUS reachability (B28 part ii).
// ─────────────────────────────────────────────────────────────────────────────
describe('§15.2 four-quadrant CORPUS reachability (B28 part ii)', () => {
  it('at least one released film in EACH cell of (craft ≷ 55) × (cohesion ≷ 0.55)', () => {
    // cells keyed "craftHigh,cohHigh".
    const cells = { 'H,H': 0, 'H,L': 0, 'L,H': 0, 'L,L': 0 }
    for (const [, agent] of AGENTS) {
      for (const seed of CORPUS_SEEDS) {
        const state = runYear(`${seed}-quad`, agent)
        for (const f of state.studio.releasedFilms) {
          const cH = f.craft > 55 ? 'H' : 'L'
          const kH = f.cohesion > 0.55 ? 'H' : 'L'
          cells[`${cH},${kH}` as keyof typeof cells]++
        }
      }
    }
    expect(cells['H,H']).toBeGreaterThan(0)
    expect(cells['H,L']).toBeGreaterThan(0)
    expect(cells['L,H']).toBeGreaterThan(0)
    expect(cells['L,L']).toBeGreaterThan(0)
  }, 60_000)
})

// ─────────────────────────────────────────────────────────────────────────────
// §15.7 replay WITH broadcast — byte-identical exportSave INCLUDING the broadcast
// copy (which is [] but must be byte-identical), both agents.
// ─────────────────────────────────────────────────────────────────────────────
describe('§15.7 replay WITH broadcast — byte-identical SaveFileV1 incl. broadcast copy', () => {
  for (const [name, agent] of AGENTS) {
    it(`${name}: two full-year runs (same seed) ⇒ byte-identical exportSave; broadcast copy is [] and identical`, () => {
      const seed = `replay-bcast-${name}`
      const a = runYear(seed, agent)
      const b = runYear(seed, agent)
      const saveA = makeSave(a)
      const saveB = makeSave(b)
      // The broadcast copy is empty (broadcast is inert in the M0A corpus)...
      expect(a.broadcastItems).toEqual([])
      expect((saveA as unknown as { broadcastCache: unknown[] }).broadcastCache).toEqual([])
      // ...and the full serialized SaveFileV1 (state + broadcast copy) is byte-identical.
      expect(exportSave(saveA)).toBe(exportSave(saveB))
    })
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// Deterministic corpus reproduction — same seeds twice ⇒ identical outcomes.
// ─────────────────────────────────────────────────────────────────────────────
describe('deterministic corpus reproduction — identical per-run outcomes on a re-run', () => {
  it('end standing + releasedFilms reproduce identically across a small sample (both agents)', () => {
    const sample = ['repro-1', 'repro-2', 'repro-3', 'repro-4', 'repro-5']
    for (const [, agent] of AGENTS) {
      for (const seed of sample) {
        const a = runYear(seed, agent)
        const b = runYear(seed, agent)
        expect(a.studio.standing).toEqual(b.studio.standing)
        expect(a.studio.releasedFilms).toEqual(b.studio.releasedFilms)
        // sanity: the run actually released films
        expect(a.studio.releasedFilms.length).toBeGreaterThan(0)
      }
    }
  }, 30_000)
})
