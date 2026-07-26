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

// numeric primitives used by contract formulas
export { clamp, mean, lerp, smoothstep, remap, weightedMean, sum, product } from './math.js'

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

// §4 shape declarations + resolveShape (phase 2)
export { SHAPE_OPTIONS, specificity, resolveShape } from './shape.js'

// §5 reception pipeline (phase 2)
export {
  resolveReception,
  buildFilmResult,
  roleFit,
  castContribution,
  computeSegmentAppeal,
  computeBoxOffice,
} from './reception.js'
export type { ReceptionInputs, ReceptionResult } from './reception.js'

// §7 forecast pipeline (phase 2) + the deterministic forecast-center helper
// (§15.6's behavioral-independence tests use it; the contract itself defines the
// deterministic center in §7/B16).
export { computeForecast, forecastCenters, bandOf } from './forecast.js'
export type { ForecastInputs, ForecastContext, ForecastCenters } from './forecast.js'

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

// §9 world generation (phase 3) + the §10-shared salary curve (B7)
export { generateWorld, salaryCurve } from './worldgen.js'

// §3 applyActions (phase 3) — greenlight / cancel / createTalent
export { applyActions } from './actions.js'

// §6 standing (phase 3) — the three-channel updateStanding (B12 context param)
export { updateStanding } from './standing.js'
export type { ReleaseBenchmarks, StandingContext } from './standing.js'

// §3 tick (phase 3) — the fixed-order PRODUCTION→RELEASE→RECEPTION→STANDING→BROADCAST pipeline
export { tick } from './tick.js'

// §8 broadcast (phase 4) — the minimal deterministic broadcast core (B22/B23/B24/M10).
// Public entry + facts/ranking/template helpers for the test author, plus the two
// release template ids and their renderer.
export {
  evaluateReleaseBroadcast,
  deriveFacts,
  rankRelease,
  editorialRelevance,
  renderReleaseTemplate,
  releaseTemplateId,
  RELEASE_BETTER_TEMPLATE_ID,
  RELEASE_WORSE_TEMPLATE_ID,
} from './broadcast.js'
export type { ReleaseBroadcastInputs, RankingBreakdown } from './broadcast.js'

// §13 candidate generator (phase 3, step 4) — the finite, deterministic,
// agent-independent decision grid (B18/B19/B21).
export { generateCandidates, packageReceptionInputs } from './candidates.js'
export type { CandidatePackage } from './candidates.js'

// §13 agents (phase 3, step 4) — RandomAgent + OracleAgent over the shared grid
// (ruling #3/#4, D-1).
export { RandomAgent, OracleAgent } from './agents.js'
export type { Agent } from './agents.js'

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
