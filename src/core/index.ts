// ── Public API (phase 1) ─────────────────────────────────────────────────────
// The test author imports ONLY from here. Re-exports the phase-1 surface:
// §2 declarations, the §2.1 vector math, §16 TUNING + named constants, §4 shape
// declarations, §13 grid declarations, the seeded RNG (M9), and §17 save.
//
// Phase-2+ logic (applyActions, tick, reception, forecast, agents, worldgen,
// broadcast) is intentionally absent — those phases add their exports here.

// §2 / §7 / §8 / §10 types
export type {
  Genre,
  SegmentId,
  CulturalForce,
  CreativeRole,
  CastSlot,
  Range,
  Persona,
  Expression,
  Talent,
  RoleRequirement,
  FilmConcept,
  FilmShape,
  ShapeOption,
  ShapeEffects,
  Promise,
  Budget,
  Production,
  FilmResult,
  Standing,
  Segment,
  CompetingRelease,
  MarketState,
  EraConfig,
  Studio,
  GameState,
  Action,
  AuthoredTalentInput,
  Confidence,
  ForecastBand,
  ForecastFactorKey,
  SegmentForecast,
  Forecast,
  BroadcastFacts,
  BroadcastItem,
  CoverageContext,
} from './types.js'

// §2.1 vector math + EPSILON
export {
  EPSILON,
  personaToExpression,
  magnitude,
  dot,
  distance,
  personaDistance,
  safeCosine,
} from './vector.js'

// numeric primitives used by contract formulas (phase-1 subset)
export { clamp, mean } from './math.js'

// §16 TUNING + contract-declared named constants
export {
  TUNING,
  CAST_WEIGHT,
  SLOT_TRANSFORM,
  ROLE_WEIGHT,
  FORCE_VECTORS,
  INITIAL_STANDING,
  WORLD_CONFIG,
} from './tuning.js'

// §4 shape declarations
export { SHAPE_OPTIONS, specificity } from './shape.js'

// §13 grid declarations
export {
  NEGATIVE_BUDGET_MULTIPLIERS,
  MARKETING_BUDGET_LEVELS,
  PROMISE_WIDTHS,
  PROMISE_CENTERS,
  rangeFrom,
  CANDIDATE_CONFIG,
} from './grid.js'

// seeded RNG (M9)
export { RngStream, stream } from './rng.js'
export type { RngPurpose } from './rng.js'

// §17 save
export {
  stableStringify,
  deepEqual,
  validateSave,
  makeSave,
  loadSave,
  exportSave,
  importSave,
} from './save.js'
export type { SaveFileV1 } from './save.js'
