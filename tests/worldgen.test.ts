// ── §9 World generation — INDEPENDENT contract-derived tests ──────────────────
//
// Every expectation here is derived from `docs/build-contract.md` rev. 4 and the
// NORMATIVE `docs/rev4-open-questions.md` (which wins on conflict), NOT from the
// worldgen implementation. No value is copied out of src/core/worldgen.ts or
// src/core/data/*; the only symbols imported are the public phase-1/phase-3
// surface re-exported from src/core/index.ts.
//
// Contract clauses exercised:
//   §9 (worldgen distributions) · §2.5 (world/state shapes) · §6 INITIAL_STANDING
//   B6/D-5 (SEGMENT_TASTES) · B7 (salaryCurve) · B8 (baseNegativeCost) ·
//   B9 (role split) · B10/N1 (era) · B11 (requiredSlots) · M4 (genre) ·
//   N3 (worldgen initials) · WORLD_CONFIG (counts/marketValueRange) · M9 (stream
//   isolation) · §15.7 (byte-identical replay).

import { describe, it, expect } from 'vitest'
import type {
  Genre,
  CastSlot,
  CulturalForce,
  SegmentId,
  Expression,
} from '../src/core/index.js'
import {
  generateWorld,
  salaryCurve,
  TUNING,
  WORLD_CONFIG,
  INITIAL_STANDING,
  RngStream,
  stableStringify,
  deepEqual,
  EPSILON,
} from '../src/core/index.js'

// ── seeds ─────────────────────────────────────────────────────────────────────
// Seeded only (the hygiene test forbids the nondeterministic-RNG literal). Corpus
// seeds use the N8 convention m0a-0001 … m0a-NNNN.
function seed(n: number): string {
  return `m0a-${String(n).padStart(4, '0')}`
}
const SEEDS = Array.from({ length: 100 }, (_, i) => seed(i + 1))

// The four SegmentId values in the §9 / D-5 fixed order.
const SEGMENT_ORDER: SegmentId[] = ['youngAdult', 'family', 'adult', 'prestige']
// The §9 fixed shares.
const SEGMENT_SHARES: Record<SegmentId, number> = {
  youngAdult: 0.3,
  family: 0.25,
  adult: 0.3,
  prestige: 0.15,
}
const GENRES: Genre[] = ['comedy', 'drama', 'crime', 'romance', 'horror', 'adventure']
const CAST_SLOTS: CastSlot[] = ['lead', 'antagonist', 'support']
const FORCE_KEYS: CulturalForce[] = [
  'escapism',
  'patriotism',
  'realism',
  'darkness',
  'optimism',
  'spectacle',
]
const PERSONA_AXES = ['warmth', 'gravity', 'physicality'] as const

// TUNING.SEGMENT_TASTES is contract DATA (D-5), re-exported through index.ts. The
// tuning-module type is loose, so read it the way the phase-2 fixtures already do.
const SEGMENT_TASTES = (
  TUNING as unknown as { SEGMENT_TASTES: Record<SegmentId, Expression> }
).SEGMENT_TASTES

// Derivable salary bound from B7: salary = SALARY_BASE + SALARY_SKILL_COEF·(skill/100)²
// + SALARY_FAME_COEF·(fame/100)². Both squared terms ∈ [0,1] since skill,fame ∈ [0,95] ⊂
// [0,100], so salary ∈ [SALARY_BASE, SALARY_BASE + SALARY_SKILL_COEF + SALARY_FAME_COEF].
const SALARY_MIN = TUNING.SALARY_BASE
const SALARY_MAX = TUNING.SALARY_BASE + TUNING.SALARY_SKILL_COEF + TUNING.SALARY_FAME_COEF

// One world reused by structural single-seed blocks; multi-seed loops regenerate.
const WORLD = generateWorld(seed(1))

// ── §9 counts + B9 role split ──────────────────────────────────────────────────
describe('worldgen — talent/concept counts (WORLD_CONFIG, §9) + role split (B9)', () => {
  it('generates exactly WORLD_CONFIG.talentCount (60) talent', () => {
    expect(WORLD.talent.length).toBe(WORLD_CONFIG.talentCount)
    expect(WORLD.talent.length).toBe(60)
  })

  it('generates exactly WORLD_CONFIG.conceptCount (30) concepts', () => {
    expect(WORLD.concepts.length).toBe(WORLD_CONFIG.conceptCount)
    expect(WORLD.concepts.length).toBe(30)
  })

  it('splits roles exactly 12 writer / 10 director / 28 actor / 10 craft (B9)', () => {
    const counts = { writer: 0, director: 0, actor: 0, craft: 0 }
    for (const t of WORLD.talent) counts[t.role] += 1
    expect(counts).toEqual({ writer: 12, director: 10, actor: 28, craft: 10 })
  })

  it('holds the role split across many seeds', () => {
    for (const s of SEEDS) {
      const counts = { writer: 0, director: 0, actor: 0, craft: 0 }
      for (const t of generateWorld(s).talent) counts[t.role] += 1
      expect(counts).toEqual({ writer: 12, director: 10, actor: 28, craft: 10 })
    }
  })
})

// ── §9 talent field ranges + B7 salary ────────────────────────────────────────
describe('worldgen — talent field bounds (§9, B7, N3)', () => {
  const inRange = (v: number, lo: number, hi: number) => v >= lo && v <= hi

  it('every talent satisfies §9 bounds across many seeds (truncation/clamp exercised)', () => {
    for (const s of SEEDS) {
      for (const t of generateWorld(s).talent) {
        // skill ~ truncatedNormal(60,15,20,95)
        expect(inRange(t.skill, 20, 95)).toBe(true)
        // fame ~ truncatedNormal(40,22,0,95)
        expect(inRange(t.fame, 0, 95)).toBe(true)
        // age ~ truncatedNormal(38,10,20,70)
        expect(inRange(t.age, 20, 70)).toBe(true)
        // actual axes ~ uniform(-1,1)
        for (const ax of PERSONA_AXES) expect(inRange(t.actual[ax], -1, 1)).toBe(true)
        // perceived axes ~ clamp(actual + normal(0,0.25), -1, 1)
        for (const ax of PERSONA_AXES) expect(inRange(t.perceived[ax], -1, 1)).toBe(true)
        // N3: generated talent authored = false
        expect(t.authored).toBe(false)
        // salary within derivable B7 bound
        expect(inRange(t.salary, SALARY_MIN, SALARY_MAX)).toBe(true)
      }
    }
  })

  it('salary equals salaryCurve(skill, fame) recomputed (B7 — public export reuse)', () => {
    for (const s of SEEDS) {
      for (const t of generateWorld(s).talent) {
        expect(t.salary).toBe(salaryCurve(t.skill, t.fame))
      }
    }
  })
})

// ── §9 concept field ranges + B8/B11/M4 ───────────────────────────────────────
describe('worldgen — concept field bounds (§9, B8, B11, M4)', () => {
  const inRange = (v: number, lo: number, hi: number) => v >= lo && v <= hi

  it('every concept satisfies its contract bounds across many seeds', () => {
    for (const s of SEEDS) {
      for (const c of generateWorld(s).concepts) {
        // M4: genre uniform over the six
        expect(GENRES).toContain(c.genre)
        // baselineStrength ~ truncatedNormal(60,15,20,95)
        expect(inRange(c.baselineStrength, 20, 95)).toBe(true)
        // originalityRaw ~ truncatedNormal(55,20,5,100)
        expect(inRange(c.originalityRaw, 5, 100)).toBe(true)
        // B8: baseNegativeCost ~ truncatedNormal(4.5M,1.5M,2M,9M)
        expect(inRange(c.baseNegativeCost, 2_000_000, 9_000_000)).toBe(true)
        // B11: requiredSlots always exactly the three slots in order
        expect(c.requiredSlots).toEqual(['lead', 'antagonist', 'support'])
        // roleRequirements has all three slots
        for (const slot of CAST_SLOTS) {
          const rr = c.roleRequirements[slot]
          expect(rr).toBeDefined()
          // target ~ uniform(-1,1)
          for (const ax of PERSONA_AXES) expect(inRange(rr.target[ax], -1, 1)).toBe(true)
          // tolerance ~ uniform(0.8, 1.8)
          expect(inRange(rr.tolerance, 0.8, 1.8)).toBe(true)
        }
      }
    }
  })

  it('every genre value appears somewhere in a moderately large corpus (M4 uniform)', () => {
    const seen = new Set<Genre>()
    for (const s of SEEDS) for (const c of generateWorld(s).concepts) seen.add(c.genre)
    for (const g of GENRES) expect(seen.has(g)).toBe(true)
  })
})

// ── §9 / §2.5 market ──────────────────────────────────────────────────────────
describe('worldgen — market (§9, §2.5, D-5, N3, N11)', () => {
  it('market.tick === 0 (N3)', () => {
    expect(WORLD.market.tick).toBe(0)
  })

  it('forces has all six CulturalForce keys, each === 50 (§9 neutral baseline)', () => {
    const forces = WORLD.market.forces
    expect(Object.keys(forces).sort()).toEqual([...FORCE_KEYS].sort())
    for (const f of FORCE_KEYS) expect(forces[f]).toBe(50)
  })

  it('has 4 segments in fixed order with fixed shares (§9)', () => {
    const segs = WORLD.market.segments
    expect(segs.length).toBe(4)
    expect(segs.map((s) => s.id)).toEqual(SEGMENT_ORDER)
    for (const s of segs) expect(s.share).toBe(SEGMENT_SHARES[s.id])
  })

  it('segment shares sum to 1 within EPSILON (§2.5)', () => {
    const total = WORLD.market.segments.reduce((a, s) => a + s.share, 0)
    expect(Math.abs(total - 1)).toBeLessThan(EPSILON)
  })

  it('each segment taste deep-equals TUNING.SEGMENT_TASTES[id] (D-5)', () => {
    for (const s of WORLD.market.segments) {
      expect(deepEqual(s.taste, SEGMENT_TASTES[s.id])).toBe(true)
    }
  })

  it('baseMarketValue ~ uniform(marketValueRange) ∈ [20M, 80M) across many seeds', () => {
    const [lo, hi] = WORLD_CONFIG.marketValueRange
    expect([lo, hi]).toEqual([20_000_000, 80_000_000])
    for (const s of SEEDS) {
      const v = generateWorld(s).market.baseMarketValue
      // uniform(lo, hi): closed at lo, open at hi.
      expect(v).toBeGreaterThanOrEqual(lo)
      expect(v).toBeLessThan(hi)
    }
  })

  it('competingSlate deep-equals [] (N3/N11 — competition inert)', () => {
    expect(WORLD.market.competingSlate).toEqual([])
  })
})

// ── §9 / B10 era ──────────────────────────────────────────────────────────────
describe('worldgen — era (B10/N1)', () => {
  it('era deep-equals the neutral B10 config', () => {
    expect(WORLD.era).toEqual({
      soundRequired: true,
      televisionCompetition: false,
      censorship: 'none',
      costScale: 1.0,
    })
  })
})

// ── §9 / §2.5 studio ──────────────────────────────────────────────────────────
describe('worldgen — studio (§9, §6, D-1, N3)', () => {
  it('cash === TUNING.INITIAL_CASH (D-1)', () => {
    expect(WORLD.studio.cash).toBe(
      (TUNING as unknown as { INITIAL_CASH: number }).INITIAL_CASH,
    )
  })

  it('standing deep-equals INITIAL_STANDING (§6/§9)', () => {
    expect(WORLD.studio.standing).toEqual(INITIAL_STANDING)
    // and the contract's literal §6 values, derived independently
    expect(INITIAL_STANDING).toEqual({
      audienceAwareness: 40,
      industryPrestige: 40,
      commercialConfidence: 50,
    })
  })

  it('activeProductions and releasedFilms both [] (N3)', () => {
    expect(WORLD.studio.activeProductions).toEqual([])
    expect(WORLD.studio.releasedFilms).toEqual([])
  })
})

// ── §2.5 GameState top-level ──────────────────────────────────────────────────
describe('worldgen — GameState top-level (§2.5, N3)', () => {
  it('seed echoes the input for several seeds', () => {
    for (const s of [seed(1), seed(7), seed(42), 'arbitrary-seed', '']) {
      expect(generateWorld(s).seed).toBe(s)
    }
  })

  it('broadcastItems and coverageContexts both [] (N3)', () => {
    expect(WORLD.broadcastItems).toEqual([])
    expect(WORLD.coverageContexts).toEqual([])
  })
})

// ── §9 / §15.7 determinism ─────────────────────────────────────────────────────
describe('worldgen — determinism & isolation (§9, §15.7, M9)', () => {
  it('same seed → byte-identical world (stableStringify equality) for several seeds', () => {
    for (const s of [seed(1), seed(2), seed(50), 'zzz']) {
      expect(stableStringify(generateWorld(s))).toBe(stableStringify(generateWorld(s)))
    }
  })

  it('different seeds do not all produce the identical serialized world', () => {
    const serialized = SEEDS.slice(0, 20).map((s) => stableStringify(generateWorld(s)))
    const distinct = new Set(serialized)
    // At minimum two distinct seeds must differ — worldgen is seed-sensitive.
    expect(distinct.size).toBeGreaterThan(1)
  })

  it('two specific distinct seeds yield meaningfully different worlds', () => {
    expect(stableStringify(generateWorld(seed(1)))).not.toBe(
      stableStringify(generateWorld(seed(2))),
    )
  })

  it('worldgen does NOT consume the sim stream: rngState === fresh sim-stream serialize (M9)', () => {
    // M9: state.rngState carries ONLY reception-time sampling. Worldgen must draw
    // from a DERIVED stream, leaving the sim stream at its initial position. So a
    // just-generated world's rngState must equal an untouched RngStream.fromSeed(seed).
    for (const s of [seed(1), seed(3), seed(9), seed(75), 'stream-check']) {
      expect(generateWorld(s).rngState).toBe(RngStream.fromSeed(s).serialize())
    }
  })
})
