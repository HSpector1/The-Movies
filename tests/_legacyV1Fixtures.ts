// AGENT D fixtures — deterministic OLD-SHAPE (pre-D-9) SaveFileV1 builders.
//
// NOT a test file (no `.test.` in the name — vitest ignores it). Every value here
// is a CHOSEN INPUT (the task brief licenses fixture inputs); nothing is copied out
// of src/core, and no expectation lives here. These build legacy V1 saves whose
// talent are the scalar TalentV1 shape (`{...,skill,fame,...}` with NO `skills`
// record), so the V1→V2 conversion under test has genuine old-shape input to migrate.
//
// Determinism: talent field values are produced by a tiny local deterministic
// hash of the talent id (seeded, no unseeded entropy, no wall clock) so the corpus is
// reproducible run-to-run without importing any core RNG. This keeps the fixtures
// self-contained (task: shared helpers live in this file only).

import { makeSaveV1 } from '../src/core/save.js'
import type { GameStateV1, SaveFileV1, TalentV1 } from '../src/core/save.js'
import type {
  BroadcastItem,
  CreativeRole,
  EraConfig,
  FilmConcept,
  MarketState,
  Persona,
  Segment,
} from '../src/core/index.js'

// ── A tiny deterministic string→[0,1) hash (fixtures only; NOT the core RNG) ────
// FNV-1a fold + a mix, purely for building a reproducible fixture corpus. It never
// touches state.rngState and is never used to derive any expectation.
function hash01(s: string): number {
  let h = 0x811c9dc5 >>> 0
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  // final avalanche
  h ^= h >>> 16
  h = Math.imul(h, 0x21f0aaad) >>> 0
  h ^= h >>> 15
  return (h >>> 0) / 4294967296
}

// A deterministic sequence of [0,1) values from an id + counter.
function draws(id: string, n: number): number[] {
  return Array.from({ length: n }, (_, i) => hash01(`${id}#${i}`))
}

const ROLES: CreativeRole[] = ['writer', 'director', 'actor', 'craft']

// ── Old-shape talent (TalentV1: scalar `skill`, NO `skills` record) ─────────────
// `skill` is chosen deterministically across the full 1..99 range so the corpus
// exercises low/mid/high ability. Persona axes vary per id (temperament to be
// preserved exactly through migration).
export function makeLegacyTalent(over: Partial<TalentV1> & { id: string }): TalentV1 {
  const id = over.id
  const [d0, d1, d2, d3, d4, d5] = draws(id, 6)
  const role: CreativeRole = over.role ?? ROLES[Math.floor(d0! * ROLES.length)]!
  const actual: Persona = over.actual ?? {
    warmth: Math.round((d1! * 2 - 1) * 100) / 100,
    gravity: Math.round((d2! * 2 - 1) * 100) / 100,
    physicality: Math.round((d3! * 2 - 1) * 100) / 100,
  }
  return {
    id,
    name: over.name ?? `Legacy ${id}`,
    role,
    age: over.age ?? 20 + Math.floor(d4! * 45), // 20..64
    actual,
    // perceived temperament slightly off from actual (still a chosen input)
    perceived: over.perceived ?? {
      warmth: actual.warmth,
      gravity: actual.gravity,
      physicality: actual.physicality,
    },
    skill: over.skill ?? 1 + Math.floor(d5! * 98), // 1..98 scalar ability
    fame: over.fame ?? Math.floor(hash01(`${id}#fame`) * 100),
    salary: over.salary ?? 50_000 + Math.floor(hash01(`${id}#sal`) * 2_000_000),
    authored: over.authored ?? false,
  }
}

// Fixed, minimal, valid supporting world pieces (chosen inputs). None carry talent.
const SEGMENTS: Segment[] = [
  { id: 'youngAdult', share: 0.3, taste: { intimacy: -0.45, tonalWeight: -0.3, kineticEnergy: 0.75 } },
  { id: 'family', share: 0.25, taste: { intimacy: 0.55, tonalWeight: -0.55, kineticEnergy: 0.2 } },
  { id: 'adult', share: 0.3, taste: { intimacy: -0.2, tonalWeight: 0.45, kineticEnergy: -0.15 } },
  { id: 'prestige', share: 0.15, taste: { intimacy: 0.4, tonalWeight: 0.7, kineticEnergy: -0.4 } },
]

const ERA: EraConfig = {
  soundRequired: true,
  televisionCompetition: false,
  censorship: 'none',
  costScale: 1.0,
}

const CONCEPT: FilmConcept = {
  id: 'c1',
  title: 'Legacy Film',
  genre: 'drama',
  baselineStrength: 60,
  originalityRaw: 55,
  baseNegativeCost: 4_500_000,
  requiredSlots: ['lead', 'antagonist', 'support'],
  roleRequirements: {
    lead: { target: { warmth: 0.2, gravity: 0.1, physicality: 0 }, tolerance: 1.2 },
    antagonist: { target: { warmth: -0.3, gravity: 0.4, physicality: 0.1 }, tolerance: 1.2 },
    support: { target: { warmth: 0.1, gravity: 0, physicality: 0.2 }, tolerance: 1.2 },
  },
}

function makeMarket(tick: number): MarketState {
  return {
    tick,
    forces: { escapism: 50, patriotism: 50, realism: 50, darkness: 50, optimism: 50, spectacle: 50 },
    segments: SEGMENTS.map((s) => ({ ...s, taste: { ...s.taste } })),
    baseMarketValue: 40_000_000,
    competingSlate: [],
  }
}

// Build a legacy GameStateV1 (old-shape talent) with the given seed + talent list.
// `rngState` is a CHOSEN, non-trivial string (must round-trip as 4 uint32 words so a
// resumed run can deserialize it) — the conversion must carry it through UNCHANGED.
export function makeLegacyStateV1(opts: {
  seed: string
  talent: TalentV1[]
  rngState?: string
  broadcastItems?: BroadcastItem[]
  tick?: number
}): GameStateV1 {
  const broadcastItems = opts.broadcastItems ?? []
  return {
    seed: opts.seed,
    // Four uint32 words — a legitimate serialized sfc32 state (chosen, deterministic).
    rngState: opts.rngState ?? '123456789,2345678901,3456789012,987654321',
    market: makeMarket(opts.tick ?? 8),
    era: { ...ERA },
    studio: {
      cash: 20_000_000,
      standing: { audienceAwareness: 40, industryPrestige: 40, commercialConfidence: 50 },
      activeProductions: [],
      releasedFilms: [],
    },
    talent: opts.talent,
    concepts: [{ ...CONCEPT }],
    broadcastItems,
    coverageContexts: [],
  }
}

// A validated legacy V1 save from a seed + talent list.
export function makeLegacySaveV1(opts: {
  seed: string
  talent: TalentV1[]
  rngState?: string
  broadcastItems?: BroadcastItem[]
}): SaveFileV1 {
  return makeSaveV1(makeLegacyStateV1(opts))
}

// A reproducible corpus of `n` old-shape talent for statistical assertions.
// Ids are stable (`m<index>`) so the migrate streams (keyed by id) are reproducible.
export function makeLegacyCorpus(n: number, prefix = 'm'): TalentV1[] {
  return Array.from({ length: n }, (_, i) => makeLegacyTalent({ id: `${prefix}${i}` }))
}

// Reduce a NEW-shape Talent down to the OLD scalar TalentV1 shape (drop all D-9
// fields). Used to build a legacy V1 whose roster is guaranteed castable (a full
// generated world reduced to old-shape) so a resumed run has valid candidates.
// The legacy `skill` is taken from the retained scalar proxy the new shape carries.
export function toLegacyTalent(t: {
  id: string
  name: string
  role: CreativeRole
  age: number
  actual: Persona
  perceived: Persona
  skill: number
  fame: number
  salary: number
  authored: boolean
}): TalentV1 {
  return {
    id: t.id,
    name: t.name,
    role: t.role,
    age: t.age,
    actual: { ...t.actual },
    perceived: { ...t.perceived },
    skill: t.skill,
    fame: t.fame,
    salary: t.salary,
    authored: t.authored,
  }
}

// A corpus where every talent has a FIXED skill and FIXED role — lets a test isolate
// the "primary-discipline skill-mean ≈ old.skill" metric at a chosen skill level and
// still get 6 varied per-skill draws per talent (variation comes from the migrate SD).
export function makeFixedSkillCorpus(
  n: number,
  skill: number,
  role: CreativeRole,
  prefix = 'fx',
): TalentV1[] {
  return Array.from({ length: n }, (_, i) =>
    makeLegacyTalent({ id: `${prefix}-${role}-${skill}-${i}`, skill, role }),
  )
}
