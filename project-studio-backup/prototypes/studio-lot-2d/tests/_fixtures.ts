// PHASE-2 test fixtures. NOT a test file (no `.test.` in name — vitest ignores it).
//
// Fixture VALUES are inputs the test author is free to choose (per the task brief);
// EXPECTATIONS asserted against them are derived from the contract only. Nothing here
// copies a value out of src/core; these are minimal §2-typed worlds constructed from
// the declared types (see src/core/index.ts exported names/signatures).

import type {
  Budget,
  CastSlot,
  EraConfig,
  Expression,
  FilmConcept,
  MarketState,
  Persona,
  Promise as FilmPromise,
  RoleRequirement,
  Segment,
  SegmentId,
  ShapeEffects,
  Standing,
  Talent,
} from '../src/core/index.js'
import { TUNING } from '../src/core/index.js'
import type { ReceptionInputs } from '../src/core/reception.js'

export const ZERO: Expression = { intimacy: 0, tonalWeight: 0, kineticEnergy: 0 }
export const ZERO_PERSONA: Persona = { warmth: 0, gravity: 0, physicality: 0 }

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

let talentSeq = 0
export function makeTalent(over: Partial<Talent> = {}): Talent {
  talentSeq += 1
  const actual = over.actual ?? { ...ZERO_PERSONA }
  return {
    id: over.id ?? `t${talentSeq}`,
    name: over.name ?? `Talent ${talentSeq}`,
    role: over.role ?? 'actor',
    age: over.age ?? 40,
    actual,
    perceived: over.perceived ?? { ...actual },
    skill: over.skill ?? 50,
    fame: over.fame ?? 0,
    salary: over.salary ?? 100_000,
    authored: over.authored ?? false,
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
