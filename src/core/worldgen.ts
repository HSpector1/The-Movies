// ── §9 World generation (rev. 4) ─────────────────────────────────────────────
// Pure, deterministic `seed → GameState`. Given the same seed string, this
// module produces byte-identical state every time (§15.7). It draws randomness
// ONLY from the derived 'worldgen' substream via `stream(seed, 'worldgen', key)`
// (rng.ts); it never touches or advances the sim stream nor the
// 'candidates' / 'agent' / 'forecast' streams.
//
// Purity: no React/DOM/async/I/O; no unseeded RNG, no `Date`/time, no UUIDs, no
// OS entropy, no filesystem enumeration. Word lists are static TS imports consumed
// in declared array order (data/wordlists.ts). Every `Record` below is built in a
// fixed declared field order so `Object.keys(...)` iteration (which reception /
// forecast rely on) is stable.
//
// ── Determinism scheme (delegated engineering choice — documented, not escalated)
//
// STREAM KEYING: one keyed substream PER ASPECT, so each aspect's draw sequence is
// independent of how many draws every other aspect made. Each stream is consumed in
// a FIXED, DOCUMENTED field-draw order; the entity index is NOT folded into the key
// (a single stream per aspect is walked once per entity in generation order). Keys:
//
//   talent-persona      : per talent i, in id order, draws
//                           actual.warmth, actual.gravity, actual.physicality,
//                           perceived-noise warmth, perceived-noise gravity,
//                           perceived-noise physicality      (6 draws → 3 gaussians)
//   talent-skill        : per talent i, one truncatedNormal
//   talent-fame         : per talent i, one truncatedNormal
//   talent-age          : per talent i, one truncatedNormal
//   talent-name         : per talent i, two uniforms (first-name idx, last-name idx)
//   concept-genre       : per concept j, one uniform (genre idx)
//   concept-strength    : per concept j, one truncatedNormal (baselineStrength)
//   concept-originality  : per concept j, one truncatedNormal (originalityRaw)
//   concept-cost        : per concept j, one truncatedNormal (baseNegativeCost)
//   concept-roles       : per concept j, per slot in [lead, antagonist, support]:
//                           target.warmth, target.gravity, target.physicality (uniform),
//                           tolerance (uniform)             (4 draws/slot → 12/concept)
//   concept-title       : per concept j, two uniforms (lead idx, noun idx)
//   market              : one uniform (baseMarketValue)
//
// Talent generation ORDER (the "generation order" the ids and per-entity draw
// sequence follow) is the role split laid out end to end: 12 writers, then 10
// directors, then 28 actors, then 10 craft (B9). Talent i (0-based) draws its
// fields from every talent-* stream on its i-th visit.
//
// ID SCHEME: role/type-prefixed, zero-padded decimal index in generation order.
//   talent : `t-<role3>-NN`  e.g. t-wri-00 … t-wri-11, t-dir-00 …, t-act-00 …, t-cra-00 …
//   concept: `c-NN`          e.g. c-00 … c-29
// Index is per-role-block for talent (resets at each role block) and global for
// concepts. Zero-padded to 2 digits (max block is 28 actors → indices 00..27).
// Ids are unique by construction; names/titles may collide harmlessly (id is key).

import { clamp } from './math.js'
import { stream } from './rng.js'
import { RngStream } from './rng.js'
import {
  INITIAL_STANDING,
  TUNING,
  WORLD_CONFIG,
} from './tuning.js'
import type {
  CastSlot,
  CulturalForce,
  EraConfig,
  FilmConcept,
  GameState,
  Genre,
  MarketState,
  Persona,
  RoleRequirement,
  Segment,
  SegmentId,
  Studio,
  Talent,
} from './types.js'
import {
  FIRST_NAMES,
  LAST_NAMES,
  TITLE_LEAD,
  TITLE_NOUN,
} from './data/wordlists.js'

// ── Fixed declared orders (drive Record insertion + array iteration) ─────────

// §5.3 / reception & forecast iterate Object.keys(forces); this insertion order
// is the contract's canonical force order and MUST be this sequence.
const FORCE_ORDER: readonly CulturalForce[] = [
  'escapism',
  'patriotism',
  'realism',
  'darkness',
  'optimism',
  'spectacle',
] as const

// M4 — the six genres, in fixed order, indexed uniformly.
const GENRE_ORDER: readonly Genre[] = [
  'comedy',
  'drama',
  'crime',
  'romance',
  'horror',
  'adventure',
] as const

// B11 — every concept always gets exactly these three slots, in this order.
const SLOT_ORDER: readonly CastSlot[] = ['lead', 'antagonist', 'support'] as const

// D-5 — segment order + shares (shares sum to 1); taste = TUNING.SEGMENT_TASTES[id].
const SEGMENT_ORDER: readonly { id: SegmentId; share: number }[] = [
  { id: 'youngAdult', share: 0.3 },
  { id: 'family', share: 0.25 },
  { id: 'adult', share: 0.3 },
  { id: 'prestige', share: 0.15 },
] as const

// B9 — role split, laid out in generation order. `prefix` is the 3-letter id tag.
const ROLE_BLOCKS: readonly { role: Talent['role']; prefix: string; count: number }[] = [
  { role: 'writer', prefix: 'wri', count: 12 },
  { role: 'director', prefix: 'dir', count: 10 },
  { role: 'actor', prefix: 'act', count: 28 },
  { role: 'craft', prefix: 'cra', count: 10 },
] as const

// ── B7 salaryCurve ───────────────────────────────────────────────────────────
// salary = SALARY_BASE + SALARY_SKILL_COEF·(skill/100)² + SALARY_FAME_COEF·(fame/100)²
// (fame-dominant, convex — see B7). Exported: also used by §10 authored talent.
export function salaryCurve(skill: number, fame: number): number {
  const s = skill / 100
  const f = fame / 100
  return TUNING.SALARY_BASE + TUNING.SALARY_SKILL_COEF * s * s + TUNING.SALARY_FAME_COEF * f * f
}

// Zero-pad an index to 2 digits (max generated block/global index is < 100).
function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n)
}

// ── Talent generation (§9, B9, B7, N3) ───────────────────────────────────────
function generateTalent(seed: string): Talent[] {
  const persona = stream(seed, 'worldgen', 'talent-persona')
  const skillS = stream(seed, 'worldgen', 'talent-skill')
  const fameS = stream(seed, 'worldgen', 'talent-fame')
  const ageS = stream(seed, 'worldgen', 'talent-age')
  const nameS = stream(seed, 'worldgen', 'talent-name')

  const talent: Talent[] = []
  for (const block of ROLE_BLOCKS) {
    for (let idx = 0; idx < block.count; idx++) {
      // persona: actual axes ~ uniform(-1,1); perceived = clamp(actual + N(0,0.25), -1, 1)
      const actual: Persona = {
        warmth: persona.uniform(-1, 1),
        gravity: persona.uniform(-1, 1),
        physicality: persona.uniform(-1, 1),
      }
      const perceived: Persona = {
        warmth: clamp(actual.warmth + persona.gaussian(0, 0.25), -1, 1),
        gravity: clamp(actual.gravity + persona.gaussian(0, 0.25), -1, 1),
        physicality: clamp(actual.physicality + persona.gaussian(0, 0.25), -1, 1),
      }

      const skill = skillS.truncatedNormal(60, 15, 20, 95)
      const fame = fameS.truncatedNormal(40, 22, 0, 95)
      const age = ageS.truncatedNormal(38, 10, 20, 70)

      const first = FIRST_NAMES[Math.floor(nameS.next() * FIRST_NAMES.length)]!
      const last = LAST_NAMES[Math.floor(nameS.next() * LAST_NAMES.length)]!

      talent.push({
        id: `t-${block.prefix}-${pad2(idx)}`,
        name: `${first} ${last}`,
        role: block.role,
        age,
        actual,
        perceived,
        skill,
        fame,
        salary: salaryCurve(skill, fame),
        authored: false,
      })
    }
  }
  return talent
}

// ── Concept generation (§9, M4, B8, B11, N3) ─────────────────────────────────
function generateConcepts(seed: string): FilmConcept[] {
  const genreS = stream(seed, 'worldgen', 'concept-genre')
  const strengthS = stream(seed, 'worldgen', 'concept-strength')
  const originalityS = stream(seed, 'worldgen', 'concept-originality')
  const costS = stream(seed, 'worldgen', 'concept-cost')
  const rolesS = stream(seed, 'worldgen', 'concept-roles')
  const titleS = stream(seed, 'worldgen', 'concept-title')

  const concepts: FilmConcept[] = []
  for (let j = 0; j < WORLD_CONFIG.conceptCount; j++) {
    const genre = GENRE_ORDER[Math.floor(genreS.next() * GENRE_ORDER.length)]!
    const baselineStrength = strengthS.truncatedNormal(60, 15, 20, 95)
    const originalityRaw = originalityS.truncatedNormal(55, 20, 5, 100)
    // B8 — baseNegativeCost
    const baseNegativeCost = costS.truncatedNormal(4_500_000, 1_500_000, 2_000_000, 9_000_000)

    // roleRequirements built in FIXED slot order (B11): target axes uniform(-1,1),
    // tolerance uniform(0.8, 1.8).
    const roleRequirements = {} as Record<CastSlot, RoleRequirement>
    for (const slot of SLOT_ORDER) {
      const target: Persona = {
        warmth: rolesS.uniform(-1, 1),
        gravity: rolesS.uniform(-1, 1),
        physicality: rolesS.uniform(-1, 1),
      }
      const tolerance = rolesS.uniform(0.8, 1.8)
      roleRequirements[slot] = { target, tolerance }
    }

    const lead = TITLE_LEAD[Math.floor(titleS.next() * TITLE_LEAD.length)]!
    const noun = TITLE_NOUN[Math.floor(titleS.next() * TITLE_NOUN.length)]!

    concepts.push({
      id: `c-${pad2(j)}`,
      title: `${lead} ${noun}`,
      genre,
      baselineStrength,
      originalityRaw,
      baseNegativeCost,
      requiredSlots: [...SLOT_ORDER],
      roleRequirements,
    })
  }
  return concepts
}

// ── Market generation (§9, D-5, N3) ──────────────────────────────────────────
function generateMarket(seed: string): MarketState {
  // forces: all 50, built in FIXED force order (insertion order matters).
  const forces = {} as Record<CulturalForce, number>
  for (const force of FORCE_ORDER) {
    forces[force] = 50
  }

  // segments: fixed order + shares; taste = TUNING.SEGMENT_TASTES[id] (D-5).
  const segments: Segment[] = SEGMENT_ORDER.map(({ id, share }) => ({
    id,
    share,
    taste: TUNING.SEGMENT_TASTES[id],
  }))

  const marketS = stream(seed, 'worldgen', 'market')
  const [lo, hi] = WORLD_CONFIG.marketValueRange
  const baseMarketValue = marketS.uniform(lo, hi)

  return {
    tick: 0,
    forces,
    segments,
    baseMarketValue,
    competingSlate: [],
  }
}

// ── §9 entry point ───────────────────────────────────────────────────────────
export function generateWorld(seed: string): GameState {
  // era (B10): neutral era; the three non-costScale fields are inert data here.
  const era: EraConfig = {
    soundRequired: true,
    televisionCompetition: false,
    censorship: 'none',
    costScale: 1.0,
  }

  // studio (D-1, N3): INITIAL_CASH, INITIAL_STANDING, empty production/library.
  const studio: Studio = {
    cash: TUNING.INITIAL_CASH,
    standing: { ...INITIAL_STANDING },
    activeProductions: [],
    releasedFilms: [],
  }

  return {
    seed,
    // The INITIAL sim-stream state. Worldgen does NOT consume this stream; it
    // draws only from derived 'worldgen' substreams, so this is fromSeed's exact
    // starting state (nothing has advanced it).
    rngState: RngStream.fromSeed(seed).serialize(),
    market: generateMarket(seed),
    era,
    studio,
    talent: generateTalent(seed),
    concepts: generateConcepts(seed),
    broadcastItems: [],
    coverageContexts: [],
  }
}
