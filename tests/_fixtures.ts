// PHASE-2 test fixtures. NOT a test file (no `.test.` in name — vitest ignores it).
//
// Fixture VALUES are inputs the test author is free to choose (per the task brief);
// EXPECTATIONS asserted against them are derived from the contract only. Nothing here
// copies a value out of src/core; these are minimal §2-typed worlds constructed from
// the declared types (see src/core/index.ts exported names/signatures).

import type {
  Budget,
  CastSlot,
  Ceilings,
  Discipline,
  DisciplineSkills,
  EraConfig,
  Expression,
  FilmConcept,
  FilmShape,
  Genre,
  GenreExperience,
  MarketState,
  Persona,
  Promise as FilmPromise,
  RoleRequirement,
  Segment,
  SegmentId,
  ShapeEffects,
  SkillProfiles,
  Standing,
  Talent,
  WorkHistory,
} from '../src/core/index.js'
import { DISCIPLINE_ORDER, GENRE_ORDER, SKILL_ORDER, TUNING } from '../src/core/index.js'
import type { ReceptionInputs } from '../src/core/reception.js'

export const ZERO: Expression = { intimacy: 0, tonalWeight: 0, kineticEnergy: 0 }
export const ZERO_PERSONA: Persona = { warmth: 0, gravity: 0, physicality: 0 }

// A single fixed "locked" FilmShape for fixtures that do not otherwise care which
// shape a film was greenlit with (RULING C threads the raw shape everywhere). Any
// legal shape is acceptable here; a flat-skill talent's project-weighted mean is the
// flat value regardless of which skills a shape emphasizes, so this default is
// behaviorally neutral for the generalist fixtures the phase-2 tests use. Tests that
// exercise shape sensitivity pass their own `shape`.
export const LOCKED_SHAPE: FilmShape = {
  opening: 'slowSetup',
  midpoint: 'revelation',
  ending: 'bittersweet',
}

// A neutral era with costScale 1.0 (B10) so requiredNegative = baseNegativeCost * shapeMult.
export const NEUTRAL_ERA: EraConfig = {
  soundRequired: true,
  televisionCompetition: false,
  censorship: 'none',
  costScale: 1.0,
}

// Segment tastes / shares per §9 + D-5. Shares sum to 1 (youngAdult .30, family .25,
// adult .30, prestige .15). Tastes are the D-5 SEGMENT_TASTES table — but the tuning
// module is the authoritative source, so we read TUNING.SEGMENT_TASTES to build the
// Segment[] (this is a declared constant re-exported through index.ts, not simulation
// logic; using it keeps the fixture consistent with whatever the tuned table holds).
const TASTES = (TUNING as unknown as {
  SEGMENT_TASTES: Record<SegmentId, Expression>
}).SEGMENT_TASTES

export const SEGMENT_SHARES: Record<SegmentId, number> = {
  youngAdult: 0.3,
  family: 0.25,
  adult: 0.3,
  prestige: 0.15,
}

export function makeSegments(): Segment[] {
  const ids: SegmentId[] = ['youngAdult', 'family', 'adult', 'prestige']
  return ids.map((id) => ({ id, share: SEGMENT_SHARES[id], taste: { ...TASTES[id] } }))
}

// Neutral market: forces all 50 (§9), fixed segments, chosen baseMarketValue.
export function makeMarket(over: Partial<MarketState> = {}): MarketState {
  return {
    tick: 0,
    forces: {
      escapism: 50,
      patriotism: 50,
      realism: 50,
      darkness: 50,
      optimism: 50,
      spectacle: 50,
    },
    segments: makeSegments(),
    baseMarketValue: 50_000_000,
    competingSlate: [],
    ...over,
  }
}

export const INITIAL_STANDING_FIXTURE: Standing = {
  audienceAwareness: 40,
  industryPrestige: 40,
  commercialConfidence: 50,
}

// ── D-9 talent scaffolding for fixtures ──────────────────────────────────────
// The old scalar `skill` becomes the FLAT value of all six skills in every
// discipline (actual + perceived). Because projectSkillWeights normalize to Σ=1
// and starting genre experience is 0 (expBonus 0), `effectiveSkill(...)` on such
// a flat talent equals exactly the flat value on ANY project — so every phase-2/3
// fixture that meant "a talent of skill N" keeps its exact contract-derived
// expected values under D-9's effectiveSkill substitution (the D-9.0 invariant:
// effectiveSkill ∈ [0,100] centered on the old scalar). This is an INPUT choice,
// not an assertion; nothing here is copied from src/core.

// Build one discipline's six SkillPairs, in SKILL_ORDER, from a flat value (or an
// explicit per-skill override for the specialist/generalist D-9 tests). Values
// clamped to the 1..99 professional-skill range (D-9.1).
function flatDisciplineSkills(
  discipline: Discipline,
  actualVal: number,
  perceivedVal: number,
  overrides?: Partial<Record<string, { actual?: number; perceived?: number }>>,
): DisciplineSkills {
  const clampSkill = (v: number) => Math.max(1, Math.min(99, v))
  const out: DisciplineSkills = {}
  for (const key of SKILL_ORDER[discipline]) {
    const o = overrides?.[key]
    out[key] = {
      actual: clampSkill(o?.actual ?? actualVal),
      perceived: clampSkill(o?.perceived ?? perceivedVal),
    }
  }
  return out
}

// A per-discipline flat-skill spec for building specialists/generalists in tests.
export type SkillSpec = {
  // flat value applied to every skill of this discipline (actual == perceived).
  flat?: number
  // explicit per-skill overrides (by skill-name key), actual/perceived.
  skills?: Partial<Record<string, { actual?: number; perceived?: number }>>
}

let talentSeq = 0
export function makeTalent(
  over: Partial<Talent> & {
    // D-9 fixture controls (all optional). `skill` (legacy) fills the PRIMARY
    // discipline flat; `disciplineSkills` overrides specific disciplines; the rest
    // let a test set ceilings / workEthic / genre experience precisely.
    disciplineSkills?: Partial<Record<Discipline, SkillSpec>>
    ceilingFlat?: number | Partial<Record<Discipline, number>>
    workEthic?: number
    genreExpFlat?: number
  } = {},
): Talent {
  talentSeq += 1
  const actual = over.actual ?? { ...ZERO_PERSONA }
  const role = over.role ?? 'actor'
  const flat = over.skill ?? 50

  // Build all 24 skills. Every discipline defaults to `flat` (a flat generalist);
  // `disciplineSkills` overrides chosen disciplines (specialist profiles).
  const skills = {} as SkillProfiles
  for (const d of DISCIPLINE_ORDER) {
    const spec = over.disciplineSkills?.[d]
    const dFlat = spec?.flat ?? flat
    skills[d] = flatDisciplineSkills(d, dFlat, dFlat, spec?.skills)
  }

  // Ceilings default to the current actual skill (no headroom) unless a test asks
  // for a higher flat ceiling; always floored at the actual and capped 99 (D-9.10).
  const ceilings = {} as Ceilings
  for (const d of DISCIPLINE_ORDER) {
    const perDisc =
      typeof over.ceilingFlat === 'object' ? over.ceilingFlat[d] : over.ceilingFlat
    const cRec: Record<string, number> = {}
    for (const key of SKILL_ORDER[d]) {
      const a = skills[d][key]!.actual
      cRec[key] = Math.max(a, Math.min(99, perDisc ?? a))
    }
    ceilings[d] = cRec as Ceilings[Discipline]
  }

  // Genre experience: default 0 (a first-timer → expBonus 0), or a flat value.
  const genreExperience = {} as GenreExperience
  for (const d of DISCIPLINE_ORDER) {
    const g = {} as Record<Genre, { actual: number; perceived: number }>
    for (const genre of GENRE_ORDER) {
      const v = over.genreExpFlat ?? 0
      g[genre] = { actual: v, perceived: v }
    }
    genreExperience[d] = g
  }

  const workHistory = {} as WorkHistory
  for (const d of DISCIPLINE_ORDER) workHistory[d] = 0

  const devRate = { acting: 1, writing: 1, directing: 1, craft: 1 }

  return {
    id: over.id ?? `t${talentSeq}`,
    name: over.name ?? `Talent ${talentSeq}`,
    role,
    age: over.age ?? 40,
    actual,
    perceived: over.perceived ?? { ...actual },
    fame: over.fame ?? 0,
    salary: over.salary ?? 100_000,
    authored: over.authored ?? false,
    skills: over.skills ?? skills,
    ceilings: over.ceilings ?? ceilings,
    devRate: over.devRate ?? devRate,
    workEthic: over.workEthic ?? 60,
    genreExperience: over.genreExperience ?? genreExperience,
    workHistory: over.workHistory ?? workHistory,
    // legacy proxy: kept for shape only, not read by §5/§7. Fixtures set it to the
    // flat value so any legacy consumer sees a comparable scalar.
    skill: over.skill ?? flat,
  }
}

export function req(target: Persona, tolerance: number): RoleRequirement {
  return { target: { ...target }, tolerance }
}

export function makeConcept(over: Partial<FilmConcept> = {}): FilmConcept {
  const target = { ...ZERO_PERSONA }
  return {
    id: over.id ?? 'concept-1',
    title: over.title ?? 'Untitled',
    genre: over.genre ?? 'drama',
    baselineStrength: over.baselineStrength ?? 50,
    originalityRaw: over.originalityRaw ?? 50,
    baseNegativeCost: over.baseNegativeCost ?? 4_000_000,
    requiredSlots: over.requiredSlots ?? ['lead', 'antagonist', 'support'],
    roleRequirements:
      over.roleRequirements ??
      ({
        lead: req(target, 1.0),
        antagonist: req(target, 1.0),
        support: req(target, 1.0),
      } as Record<CastSlot, RoleRequirement>),
  }
}

// A ShapeEffects with all-zero expression and zero mods — lets a test inject exactly
// the shape contribution it wants (M12 injection license: no legal SHAPE_OPTIONS combo
// yields {0,0,0}, so the injection is part of the test, not the game).
export function makeShapeEffects(over: Partial<ShapeEffects> = {}): ShapeEffects {
  return {
    expression: over.expression ?? { ...ZERO },
    openingReachMod: over.openingReachMod ?? 0,
    craftMod: over.craftMod ?? 0,
    budgetDemandMultiplier: over.budgetDemandMultiplier ?? 1.0,
    originalityMod: over.originalityMod ?? 0,
    segmentAffinity: over.segmentAffinity ?? {
      youngAdult: 0,
      family: 0,
      adult: 0,
      prestige: 0,
    },
  }
}

export function widePromise(genre: FilmPromise['genre'] = 'drama'): FilmPromise {
  return {
    genre,
    intendedSegments: ['adult'],
    ranges: { intimacy: [-1, 1], tonalWeight: [-1, 1], kineticEnergy: [-1, 1] },
  }
}

// Promise with all three axes centered on `c` with half-width `w/2` (width `w`), clamped.
export function promiseCentered(
  centers: [number, number, number],
  width: number,
  genre: FilmPromise['genre'] = 'drama',
): FilmPromise {
  const half = width / 2
  const clampR = (c: number): [number, number] => [
    Math.max(-1, c - half),
    Math.min(1, c + half),
  ]
  return {
    genre,
    intendedSegments: ['adult'],
    ranges: {
      intimacy: clampR(centers[0]),
      tonalWeight: clampR(centers[1]),
      kineticEnergy: clampR(centers[2]),
    },
  }
}

export function makeBudget(negative: number, marketing: number): Budget {
  return { negative, marketing }
}

// Assemble a full ReceptionInputs. Callers override the pieces they care about.
export function makeReceptionInputs(over: {
  concept?: FilmConcept
  shape?: FilmShape
  shapeEffects?: ShapeEffects
  promise?: FilmPromise
  budget?: Budget
  writer?: Talent
  director?: Talent
  cast?: Record<CastSlot, Talent>
  craftHires?: Talent[]
  market?: MarketState
  standing?: Standing
  era?: EraConfig
} = {}): ReceptionInputs {
  return {
    concept: over.concept ?? makeConcept(),
    shape: over.shape ?? LOCKED_SHAPE,
    shapeEffects: over.shapeEffects ?? makeShapeEffects(),
    promise: over.promise ?? widePromise(),
    budget: over.budget ?? makeBudget(4_000_000, TUNING.MARKETING_HALF_SATURATION),
    writer: over.writer ?? makeTalent({ role: 'writer', skill: 50 }),
    director: over.director ?? makeTalent({ role: 'director', skill: 50 }),
    cast:
      over.cast ??
      ({
        lead: makeTalent({ role: 'actor', skill: 50 }),
        antagonist: makeTalent({ role: 'actor', skill: 50 }),
        support: makeTalent({ role: 'actor', skill: 50 }),
      } as Record<CastSlot, Talent>),
    craftHires: over.craftHires ?? [],
    market: over.market ?? makeMarket(),
    standing: over.standing ?? { ...INITIAL_STANDING_FIXTURE },
    era: over.era ?? NEUTRAL_ERA,
  }
}
