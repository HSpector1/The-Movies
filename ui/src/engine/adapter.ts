// ── Engine adapter — the ONE boundary crossing ───────────────────────────────
// This is the ONLY module in the UI that imports the simulation core, and it does
// so ONLY through the public surface `src/core/index.ts`. No UI component imports
// src/core/* directly; no simulation formula is re-implemented here. Every value
// the UI shows comes from CALLING the engine and reading its outputs.
//
// Responsibilities centralized here:
//   • newGame / dashboard selectors
//   • assembly data (shape/promise/budget grids, tuning, cast weights, world cfg)
//   • eligibility helpers that MIRROR applyActions' legality (so the UI can disable
//     illegal options and explain why — the engine remains the sole enforcer)
//   • required-negative + salary sums + total committed cost
//   • previewForecast (pre-greenlight, deterministic, greenlight-info only)
//   • greenlight / createTalent (surface engine validation as DATA, never crashes)
//   • advanceWeek with a pre-tick snapshot for the autopsy
//   • explainRelease — autopsy reconstruction via the PUBLIC resolveReception
//   • save export/import with loud catchable rejection
//   • information-integrity helpers (perceived persona only; never `actual`)
//
// The core is pure and deterministic; this adapter adds no randomness of its own
// (no Math.random anywhere) and never mutates GameState outside engine actions.

import {
  // world + actions + tick
  generateWorld,
  applyActions,
  tick,
  // reception (autopsy) + forecast (preview)
  resolveReception,
  computeForecast,
  resolveShape,
  RngStream,
  // shape / grid data
  SHAPE_OPTIONS,
  NEGATIVE_BUDGET_MULTIPLIERS,
  MARKETING_BUDGET_LEVELS,
  PROMISE_WIDTHS,
  PROMISE_CENTERS,
  rangeFrom,
  // constants
  TUNING,
  CAST_WEIGHT,
  WORLD_CONFIG,
  ROLE_TO_DISCIPLINE,
  DISCIPLINE_ORDER,
  GENRE_ORDER,
  SKILL_ORDER,
  personaToExpression,
  // D-9.14 authored creation-budget data (costs + ceiling bands + start OVR). These
  // are read-only constant tables from the frozen core; the UI reads them to PREVIEW
  // budget spend and tier bands. The engine remains the sole validator (createTalent).
  AUTHORED_TIER_COST,
  AUTHORED_TIER_RANGE,
  AUTHORED_START_OVR,
  // D-9 read-only talent summaries (the ONLY talent-ability surface the UI shows;
  // NEVER recompute from raw actual skills — always call these public functions).
  roleOVR,
  roleTier,
  projectFit,
  expectedPerformance,
  temperamentSummary,
  expectedPotentialTier,
  expectedPotentialRange,
  workEthicLabel,
  workHistoryCount,
  genreExperience,
  ageRunwayMult,
  // RULING B (2026-07-26): capability vs credited career identity + RULING A per-release
  // development summary. Both are read-only engine summaries — never recomputed in the UI.
  careerIdentity,
  developmentReport,
  projectSkillWeights,
  // Phase 5.1 CYCLE 3 — Film Package READ-ONLY assessment helpers. Pure, deterministic,
  // never read by the sim. The UI calls these so it NEVER reinvents a §5/§7/D-9 formula.
  creativeCohesion,
  packageFit,
  executionConfidence,
  forecastProfitRange,
  greenlightAssessment,
  risksMaterialized,
  packageDelta,
  // save
  makeSave,
  exportSave,
  importSave,
  loadSave,
  importLegacyV1,
} from '../../../src/core/index.ts'
import type {
  GameState,
  Talent,
  FilmConcept,
  FilmShape,
  Promise as FilmPromise,
  Budget,
  CastSlot,
  SegmentId,
  Genre,
  Standing,
  Production,
  FilmResult,
  Forecast,
  ReceptionInputs,
  AuthoredTalentInput,
  Persona,
  CreativeRole,
  Discipline,
  PotentialTier,
  PerformanceBand,
  SkillBias,
  CareerIdentity,
  DisciplineStanding,
  SaveFile,
  SaveFileV2,
  // Film Package assessment result/input types (READ-ONLY summaries).
  CreativeCohesion,
  AssignmentFit,
  PackageFit,
  ExecutionConfidence,
  ForecastProfitRange,
  GreenlightAssessment,
  PreTickSnapshot,
  RisksMaterialized,
  PackageDelta,
  PackageSide,
} from '../../../src/core/index.ts'

// Re-export the core types the UI needs, so components import types from the
// adapter (still a single boundary — components never reach into src/core).
export type {
  GameState,
  Talent,
  FilmConcept,
  FilmShape,
  FilmPromise,
  Budget,
  CastSlot,
  SegmentId,
  Genre,
  Standing,
  Production,
  FilmResult,
  Forecast,
  AuthoredTalentInput,
  Persona,
  CreativeRole,
  Discipline,
  PotentialTier,
  PerformanceBand,
  SkillBias,
  CareerIdentity,
  DisciplineStanding,
  // Film Package assessment types re-exported through the single boundary.
  CreativeCohesion,
  AssignmentFit,
  PackageFit,
  ExecutionConfidence,
  ForecastProfitRange,
  GreenlightAssessment,
  RisksMaterialized,
  PackageDelta,
}

export const CAST_SLOTS: readonly CastSlot[] = ['lead', 'antagonist', 'support']
export const SEGMENT_ORDER: readonly SegmentId[] = ['youngAdult', 'family', 'adult', 'prestige']
export const PROMISE_AXES = ['intimacy', 'tonalWeight', 'kineticEnergy'] as const
export type PromiseAxis = (typeof PROMISE_AXES)[number]

// The four D-9 disciplines, in the core's fixed display order (acting → writing →
// directing → craft). Re-exported so Hub/profile screens iterate a single source.
export const DISCIPLINES: readonly Discipline[] = DISCIPLINE_ORDER
export { GENRE_ORDER, ROLE_TO_DISCIPLINE }

// The discipline a role practises by default (its PRIMARY). Cross-role assignment
// (D-9.9) lets any talent be *considered* in any discipline; this is only the home.
export function primaryDiscipline(role: CreativeRole): Discipline {
  return ROLE_TO_DISCIPLINE[role]
}

// Human labels for disciplines (display only).
export const DISCIPLINE_LABEL: Record<Discipline, string> = {
  acting: 'Actor',
  writing: 'Writer',
  directing: 'Director',
  craft: 'Craft',
}

// Re-export the raw assembly data (read-only) the assembly screens render.
export {
  SHAPE_OPTIONS,
  NEGATIVE_BUDGET_MULTIPLIERS,
  MARKETING_BUDGET_LEVELS,
  PROMISE_WIDTHS,
  PROMISE_CENTERS,
  rangeFrom,
  TUNING,
  CAST_WEIGHT,
  WORLD_CONFIG,
  // The shared shape-weighting path (RULING C) + shape resolver — re-exported through the
  // single boundary so tests can independently verify the UI reasons match the engine's
  // own weighting (never a UI reimplementation). Display/verification use only.
  resolveShape,
  projectSkillWeights,
}

// ── New game ─────────────────────────────────────────────────────────────────
export function newGame(seed: string): GameState {
  return generateWorld(seed)
}

// ── Dashboard selectors ──────────────────────────────────────────────────────
export function selectWeek(state: GameState): number {
  return state.market.tick
}
export function selectCash(state: GameState): number {
  return state.studio.cash
}
export function selectStanding(state: GameState): Standing {
  return state.studio.standing
}
export function selectActiveProductions(state: GameState): Production[] {
  return state.studio.activeProductions
}
export function selectReleasedFilms(state: GameState): FilmResult[] {
  return state.studio.releasedFilms
}
export function selectConcepts(state: GameState): FilmConcept[] {
  return state.concepts
}

// The three standing channels with player-facing labels + one-line meanings (D-6).
export type StandingChannel = {
  key: keyof Standing
  label: string
  meaning: string
  value: number
}
export function standingChannels(state: GameState): StandingChannel[] {
  const s = state.studio.standing
  return [
    {
      key: 'audienceAwareness',
      label: 'Audience Awareness',
      meaning: 'How visible and culturally noticeable the studio is (driven by reach).',
      value: s.audienceAwareness,
    },
    {
      key: 'industryPrestige',
      label: 'Industry Prestige',
      meaning: 'How critically respected the studio is (driven by critic scores).',
      value: s.industryPrestige,
    },
    {
      key: 'commercialConfidence',
      label: 'Commercial Confidence',
      meaning: 'How much financiers trust the studio with money (driven by ROI).',
      value: s.commercialConfidence,
    },
  ]
}

// ── Talent pools + information integrity ─────────────────────────────────────
// The player sees `perceived` persona, fame, salary, role, availability, and the
// contract-public `skill` (a legacy scalar proxy = primary-discipline perceived
// OVR). The engine's `actual` persona and raw actual skills/true ceilings are
// NEVER surfaced here. Rich D-9 summaries (per-discipline OVRs, temperament,
// potential, work ethic) are exposed via the Hub selectors below, all derived from
// PUBLIC engine functions (never recomputed from hidden actual skills).
export type PlayerVisibleTalent = {
  id: string
  name: string
  role: CreativeRole
  age: number
  perceived: Persona // NEVER actual
  skill: number // contract-public known ability (primary perceived OVR proxy)
  fame: number
  salary: number
  authored: boolean
  available: boolean // not engaged in an active production
  engagedIn: string | null // productionId if unavailable, else null
}

function engagedTalentIds(state: GameState): Map<string, string> {
  const busy = new Map<string, string>()
  for (const prod of state.studio.activeProductions) {
    busy.set(prod.writerId, prod.id)
    busy.set(prod.directorId, prod.id)
    for (const slot of CAST_SLOTS) busy.set(prod.cast[slot], prod.id)
    for (const cid of prod.craftIds) busy.set(cid, prod.id)
  }
  return busy
}

// Project a core Talent to the player-visible shape (perceived only, never actual).
export function toPlayerVisible(t: Talent, engaged: Map<string, string>): PlayerVisibleTalent {
  const engagedIn = engaged.get(t.id) ?? null
  return {
    id: t.id,
    name: t.name,
    role: t.role,
    age: t.age,
    perceived: t.perceived, // information integrity: perceived, NOT actual
    skill: t.skill,
    fame: t.fame,
    salary: t.salary,
    authored: t.authored,
    available: engagedIn === null,
    engagedIn,
  }
}

export function talentByRole(state: GameState, role: CreativeRole): PlayerVisibleTalent[] {
  const engaged = engagedTalentIds(state)
  return state.talent
    .filter((t) => t.role === role)
    .map((t) => toPlayerVisible(t, engaged))
}

export function findTalent(state: GameState, id: string): Talent | undefined {
  return state.talent.find((t) => t.id === id)
}
export function findConcept(state: GameState, id: string): FilmConcept | undefined {
  return state.concepts.find((c) => c.id === id)
}

// ── Eligibility helpers — mirror applyActions legality (M16 / B3) ─────────────
// The engine is the sole enforcer; these mirror its rules so the UI can DISABLE
// illegal options and EXPLAIN why in plain English before greenlight is attempted.
export type Ineligibility = { eligible: false; reason: string }
export type Eligible = { eligible: true }
export type Eligibility = Eligible | Ineligibility

// A talent is selectable for a role slot if: right role, not engaged in any active
// production, and (for cast) distinct across the three cast slots already chosen.
export function talentEligibility(
  talent: PlayerVisibleTalent,
  wantRole: CreativeRole,
  chosenElsewhere: string[],
): Eligibility {
  if (talent.role !== wantRole) {
    return { eligible: false, reason: `Wrong role — this is a ${talent.role}, needs a ${wantRole}.` }
  }
  if (!talent.available) {
    return {
      eligible: false,
      reason: `Already engaged in production ${talent.engagedIn} — busy until it releases.`,
    }
  }
  if (chosenElsewhere.includes(talent.id)) {
    return { eligible: false, reason: 'Already assigned to another slot on this film.' }
  }
  return { eligible: true }
}

// Concurrency: greenlight is legal only under the production cap (B3/M16.6).
export function canGreenlightMore(state: GameState): boolean {
  return state.studio.activeProductions.length < TUNING.MAX_CONCURRENT_PRODUCTIONS
}

// ── Cost helpers (engine formulas, called not re-derived) ─────────────────────
// requiredNegative = baseNegativeCost · shape budgetDemandMultiplier · era.costScale.
export function requiredNegative(concept: FilmConcept, shape: FilmShape, state: GameState): number {
  return (
    concept.baseNegativeCost * resolveShape(shape).budgetDemandMultiplier * state.era.costScale
  )
}

// Sum of the salaries of the engaged talent (writer + director + all cast + craft).
export function salarySum(state: GameState, pkg: DraftPackageIds): number {
  let total = 0
  const w = findTalent(state, pkg.writerId)
  const d = findTalent(state, pkg.directorId)
  if (w) total += w.salary
  if (d) total += d.salary
  for (const slot of CAST_SLOTS) {
    const id = pkg.cast[slot]
    if (id) {
      const t = findTalent(state, id)
      if (t) total += t.salary
    }
  }
  for (const cid of pkg.craftIds ?? []) {
    const t = findTalent(state, cid)
    if (t) total += t.salary
  }
  return total
}

// Total committed cost at greenlight = negative + marketing + Σ salaries (D-1).
export function totalCommittedCost(state: GameState, pkg: DraftPackage): number {
  return pkg.budget.negative + pkg.budget.marketing + salarySum(state, pkg)
}

// ── Draft package (ungreenlit UI selections) ─────────────────────────────────
// Ids only — resolved against GameState at use. Mirrors the greenlight action's
// `production` payload (minus id/startTick/remainingTicks/forecastSnapshot).
export type DraftPackageIds = {
  writerId: string
  directorId: string
  cast: Record<CastSlot, string>
  craftIds?: string[]
}
export type DraftPackage = DraftPackageIds & {
  conceptId: string
  shape: FilmShape
  promise: FilmPromise
  budget: Budget
}

// Assemble the §5 ReceptionInputs a forecast/reception reads, resolving all ids to
// core Talent + concept from state. Throws a legible error if an id is unresolved
// (the caller guards, but this keeps the failure loud, not silent).
function assembleReceptionInputs(state: GameState, pkg: DraftPackage): ReceptionInputs {
  const concept = findConcept(state, pkg.conceptId)
  if (!concept) throw new Error(`Unknown conceptId "${pkg.conceptId}"`)
  const writer = findTalent(state, pkg.writerId)
  if (!writer) throw new Error(`Unknown writerId "${pkg.writerId}"`)
  const director = findTalent(state, pkg.directorId)
  if (!director) throw new Error(`Unknown directorId "${pkg.directorId}"`)
  const cast = {} as Record<CastSlot, Talent>
  for (const slot of CAST_SLOTS) {
    const t = findTalent(state, pkg.cast[slot])
    if (!t) throw new Error(`Unknown cast.${slot} id "${pkg.cast[slot]}"`)
    cast[slot] = t
  }
  const craftHires: Talent[] = (pkg.craftIds ?? []).map((id) => {
    const t = findTalent(state, id)
    if (!t) throw new Error(`Unknown craft id "${id}"`)
    return t
  })
  return {
    concept,
    // RULING C (2026-07-26): supply the raw draft FilmShape so the shared engine
    // path (projectSkillWeights) weights skills identically to the greenlight/release.
    shape: pkg.shape,
    shapeEffects: resolveShape(pkg.shape),
    promise: pkg.promise,
    budget: pkg.budget,
    writer,
    director,
    cast,
    craftHires,
    market: state.market,
    standing: state.studio.standing,
    era: state.era,
  }
}

// The predicted production id the greenlight will assign (§3 M1: prod-<tick pad4>).
export function predictedProductionId(state: GameState): string {
  return `prod-${String(state.market.tick).padStart(4, '0')}`
}

// ── Forecast PREVIEW (pre-greenlight) ────────────────────────────────────────
// Deterministic and EQUAL to what applyActions stores at greenlight: same inputs,
// same predicted id, same derived forecast stream. Uses only greenlight-available
// info. This is the ONLY freshly-computed forecast the UI shows; active/released
// productions display their STORED forecastSnapshot instead.
export function previewForecast(state: GameState, pkg: DraftPackage): Forecast {
  const inp = assembleReceptionInputs(state, pkg)
  return computeForecast(inp, {
    seed: state.seed,
    productionId: predictedProductionId(state),
    directorId: pkg.directorId,
    releasedFilms: state.studio.releasedFilms,
    concepts: state.concepts,
  })
}

// ── Greenlight (validation errors surfaced as DATA) ──────────────────────────
export type ActionOutcome =
  | { ok: true; next: GameState }
  | { ok: false; error: string }

export function greenlight(state: GameState, pkg: DraftPackage): ActionOutcome {
  try {
    const next = applyActions(state, [
      {
        kind: 'greenlight',
        production: {
          conceptId: pkg.conceptId,
          shape: pkg.shape,
          promise: pkg.promise,
          writerId: pkg.writerId,
          directorId: pkg.directorId,
          craftIds: pkg.craftIds ?? [],
          cast: pkg.cast,
          budget: pkg.budget,
        },
      },
    ])
    return { ok: true, next }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

// ── Create talent (§10 / D-9.14) ─────────────────────────────────────────────
// AuthoredTalentInput now carries the D-9.14 creation-budget fields (potentialTier,
// workEthic, optional skillBias/secondaryDiscipline). Agent C owns the creator
// redesign; this adapter is the stable seam — the engine remains the sole validator
// and surfaces any budget/range rejection as DATA (never a crash).
export function createTalent(state: GameState, input: AuthoredTalentInput): ActionOutcome {
  try {
    const next = applyActions(state, [{ kind: 'createTalent', talent: input }])
    return { ok: true, next }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

// Contract-disclosed authored starting values (§10 / D-9.14 / §16). Authored talent
// starts UNKNOWN: fame is fixed at AUTHORED_START_FAME and its primary skills center
// on AUTHORED_START_OVR (the displayed OVR is derived from those, not a fixed number
// — the player never sets skill or fame directly). The default creation-budget
// selections a minimal creator can pass through. Agent C may replace the UI that
// chooses these; the shape stays.
export const AUTHORED_START = {
  fame: TUNING.AUTHORED_START_FAME,
  skillCenter: TUNING.AUTHORED_START_SKILL, // primary skill CENTER (not the shown OVR)
  defaultPotentialTier: 'Steady' as PotentialTier,
  defaultWorkEthic: TUNING.GEN_WE_MEAN,
}

// The authored potential tiers the creator may offer (GenerationalUpside is authored-
// only; worldgen never produces it). Ordered ascending by creation-budget cost.
export const AUTHORED_POTENTIAL_TIERS: readonly PotentialTier[] = [
  'Limited',
  'Steady',
  'Promising',
  'HighUpside',
  'ExceptionalUpside',
  'GenerationalUpside',
]

// The fixed creation pool (D-9.14). Re-exported so the UI meter reads the same
// number the engine validates against.
export const AUTHORED_BUDGET = TUNING.AUTHORED_BUDGET

// Re-export the tier cost + ceiling-OVR band tables and the authored start OVR so the
// creator can (a) preview each tier's budget cost and ceiling band and (b) show the
// honest low starting OVR. Read-only constants from the frozen core.
export { AUTHORED_TIER_COST, AUTHORED_TIER_RANGE, AUTHORED_START_OVR }

// Player-facing metadata per authored potential tier: budget cost, the ceiling-OVR
// band shown to the player (a hidden/uncertain estimate — never a promise), a human
// label, and a one-line qualitative band. `ceilingLow/High` come straight from
// AUTHORED_TIER_RANGE; they describe the tier's CEILING (upside), never current skill.
export type AuthoredTierInfo = {
  tier: PotentialTier
  label: string
  cost: number
  ceilingLow: number
  ceilingHigh: number
  band: string // qualitative one-liner
}
const TIER_LABEL: Record<PotentialTier, string> = {
  Limited: 'Limited',
  Steady: 'Steady',
  Promising: 'Promising',
  HighUpside: 'High Upside',
  ExceptionalUpside: 'Exceptional Upside',
  GenerationalUpside: 'Generational Upside',
}
const TIER_BAND: Record<PotentialTier, string> = {
  Limited: 'A capped pro — little room to grow beyond a modest ceiling.',
  Steady: 'A dependable career ceiling — solid, rarely spectacular.',
  Promising: 'Real room to develop into a strong professional.',
  HighUpside: 'Could grow into a standout with development and the right work.',
  ExceptionalUpside: 'Rare upside — a potential top-tier talent if developed.',
  GenerationalUpside: 'The highest ceiling the studio can author. Extremely costly.',
}
export function authoredTierInfo(tier: PotentialTier): AuthoredTierInfo {
  const [low, high] = AUTHORED_TIER_RANGE[tier]
  return {
    tier,
    label: TIER_LABEL[tier],
    cost: AUTHORED_TIER_COST[tier],
    ceilingLow: low,
    ceilingHigh: high,
    band: TIER_BAND[tier],
  }
}
export function authoredTierTable(): AuthoredTierInfo[] {
  return AUTHORED_POTENTIAL_TIERS.map(authoredTierInfo)
}

// ── Creation-budget preview (MIRRORS the engine's authoredTotalCost, D-9.14) ──
// This reproduces the engine's cost arithmetic EXACTLY so the UI can show live spend
// and disable an over-budget submit. It is a preview only: `createTalent` (the
// engine) is the sole authority and will itself reject an over-budget request loudly.
// If these ever diverge, the engine wins — the UI simply becomes conservative or the
// engine rejects; either way no illegal talent is created.
//   cost(tier)      = AUTHORED_TIER_COST[tier]                       (Limited 5 … Generational 45)
//   cost(workEthic) = AUTHORED_WE_COST (30) · (workEthic / 99)       (linear)
//   cost(bias)      = AUTHORED_BIAS_COST (20) · magnitude            (0 when no bias)
//   cost(secondary) = secondaryDiscipline ? AUTHORED_SECONDARY_COST (20) : 0
export type BudgetLine = { key: 'tier' | 'workEthic' | 'bias' | 'secondary'; label: string; cost: number }
export type BudgetPreview = {
  lines: BudgetLine[]
  total: number
  budget: number
  remaining: number // budget − total (may be negative)
  overBudget: boolean // total > budget → the engine will reject
}
export type BudgetInput = {
  potentialTier: PotentialTier
  workEthic: number
  biasMagnitude: number // 0 when no bias emphasis is chosen
  hasSecondary: boolean
}
export function previewCreationBudget(input: BudgetInput): BudgetPreview {
  const tierCost = AUTHORED_TIER_COST[input.potentialTier]
  const weCost = TUNING.AUTHORED_WE_COST * (input.workEthic / 99)
  const biasCost = TUNING.AUTHORED_BIAS_COST * Math.max(0, Math.min(1, input.biasMagnitude))
  const secondaryCost = input.hasSecondary ? TUNING.AUTHORED_SECONDARY_COST : 0
  const lines: BudgetLine[] = [
    { key: 'tier', label: `Potential (${TIER_LABEL[input.potentialTier]})`, cost: tierCost },
    { key: 'workEthic', label: `Work ethic (${input.workEthic})`, cost: weCost },
    { key: 'bias', label: 'Skill emphasis', cost: biasCost },
    { key: 'secondary', label: 'Secondary discipline', cost: secondaryCost },
  ]
  const total = tierCost + weCost + biasCost + secondaryCost
  const budget = TUNING.AUTHORED_BUDGET
  return { lines, total, budget, remaining: budget - total, overBudget: total > budget }
}

// ── Creative Temperament presets (D-9.8) — persona ONLY, never ability ────────
// A preset is a persona triple (warmth/gravity/physicality ∈ [−1,1]). Applying one
// sets ONLY the temperament axes; it grants NO skill, potential, or work-ethic bonus
// and costs NO budget (temperament is free and cosmetic-to-ability). The player may
// still hand-tune the axes after picking a preset (or skip presets entirely).
export type TemperamentPreset = {
  key: string
  label: string
  persona: Persona
  blurb: string
}
export const AUTHORED_TEMPERAMENT_PRESETS: readonly TemperamentPreset[] = [
  { key: 'balanced', label: 'Balanced', persona: { warmth: 0, gravity: 0, physicality: 0 }, blurb: 'Even, versatile presence with no strong pull.' },
  { key: 'warm-dramatic', label: 'Warm Dramatic', persona: { warmth: 0.7, gravity: 0.6, physicality: -0.3 }, blurb: 'Serious, warm presence that lands intimate dramas.' },
  { key: 'stoic-intense', label: 'Stoic Intense', persona: { warmth: -0.7, gravity: 0.7, physicality: 0.2 }, blurb: 'Cold, grave presence with a controlled edge.' },
  { key: 'kinetic-comic', label: 'Kinetic Comic', persona: { warmth: 0.5, gravity: -0.7, physicality: 0.8 }, blurb: 'Playful, warm presence with explosive energy.' },
  { key: 'cool-physical', label: 'Cool Physical', persona: { warmth: -0.3, gravity: -0.2, physicality: 0.8 }, blurb: 'Reserved, light presence that reads through movement.' },
  { key: 'quiet-subtle', label: 'Quiet Subtle', persona: { warmth: 0.2, gravity: 0.3, physicality: -0.7 }, blurb: 'Still, warm presence — understated and interior.' },
]

// Preview the honest STARTING role-OVR of an authored talent, computed by the ENGINE
// (not a UI re-derivation). Authored talent begin at LOW skills near AUTHORED_START_OVR
// (35) — but roleOVR applies weakness/breadth penalties, so the actual starting OVR is
// much lower than 35, and always FAR below the tier's ceiling band. This exists to make
// the creator honest: the chosen tier is a hidden CEILING, not current ability.
//
// Implementation: build a THROWAWAY authored talent on the current state through the
// public createTalent, read roleOVR of the constructed person, and discard the state.
// This uses only the engine + public summary functions — never a UI skill formula. The
// bias affects the starting skill spread (specialist ⇒ one skill up, the rest down), so
// the preview reflects the real effect of the emphasis choice. If the throwaway build is
// somehow rejected (it never should be — a name/age are supplied and only budget-neutral
// fields are set), fall back to the low AUTHORED_START_OVR floor.
export function previewAuthoredStartOVR(
  state: GameState,
  role: CreativeRole,
  bias: SkillBias | undefined,
): number {
  const probe: AuthoredTalentInput = {
    name: '__preview__',
    role,
    age: 30,
    actual: { warmth: 0, gravity: 0, physicality: 0 },
    potentialTier: 'Steady', // ceiling does not affect starting skills / starting OVR
    workEthic: 50, // WE never affects current OVR (D-9.11)
    ...(bias ? { skillBias: bias } : {}),
  }
  const out = createTalent(state, probe)
  if (!out.ok) return AUTHORED_START_OVR
  const discipline = primaryDiscipline(role)
  const created = out.next.talent.find((t) => t.name === '__preview__' && t.authored)
  if (!created) return AUTHORED_START_OVR
  return roleOVR(created, discipline)
}

// The six primary-discipline skill labels for a role's discipline, in SKILL_ORDER —
// so the specialist-bias picker can name the skill it spikes. Display only.
export const AUTHORED_SKILL_LABELS: Record<Discipline, readonly string[]> = {
  acting: ['Acting Technique', 'Emotional Range', 'Dialogue Delivery', 'Comic Timing', 'Physical Performance', 'Screen Presence'],
  writing: ['Story Structure', 'Character Development', 'Dialogue', 'Originality', 'Narrative Pacing', 'Rewriting'],
  directing: ['Visual Storytelling', 'Performance Direction', 'Tone Control', 'Directing Pacing', 'Production Management', 'Adaptability'],
  craft: ['Cinematography', 'Editing', 'Production Design', 'Sound & Music', 'Effects Execution', 'Technical Coordination'],
}

// ── Advance one week (with pre-tick snapshot for the autopsy) ─────────────────
// BEFORE calling tick we snapshot the pre-tick state so the autopsy can be
// reconstructed (standing, market, concepts, talent, era, and each active
// production incl. its forecastSnapshot). GameState is a plain immutable value the
// core rebuilds by spreads, so the reference we hold is a faithful pre-tick
// snapshot (the core never mutates it in place).
//
// RULING A (2026-07-26) — DEVELOPMENT ON IN NORMAL PLAY. The week-advance ticks the
// engine with { develop: true } so every performer on a released film develops in the
// discipline they worked. The engine guarantees development happens EXACTLY ONCE per
// release, inside this single tick; the UI advances one tick per week and replaces the
// authoritative GameState with the result (never re-ticks on re-render/reload), so
// development is never re-applied or double-counted. (The official M0A corpus stays
// dev-OFF — that is the harness, not the UI; the harness is untouched.)
export type AdvanceResult = {
  preTick: GameState
  next: GameState
  released: FilmResult[]
}
export function advanceWeek(state: GameState): AdvanceResult {
  const preTick = state // pre-tick snapshot (immutable; tick returns a fresh state)
  const next = tick(state, { develop: true }) // RULING A: development ON in normal play
  // Newly-released films = the entries appended to releasedFilms this tick.
  const before = state.studio.releasedFilms.length
  const released = next.studio.releasedFilms.slice(before)
  return { preTick, next, released }
}

// ── RULING A — Per-release development summary (built by DIFFING before→after) ──
// After a develop-ON week, for EVERY talent who participated in a released film show a
// clear, truthful development summary. This is built by SNAPSHOTTING the participating
// talent from the PRE-TICK state and diffing against the POST-TICK state (the engine
// applied development exactly once inside `tick`; the UI only reads the two immutable
// snapshots — it NEVER re-runs or re-applies development). The lines come from the
// engine's `developmentReport(before, after)`; the WE/Potential explanation lines are
// emitted ONLY when the calculation actually used them (see below). The engine's
// once-per-release guarantee plus this diff-of-snapshots means reloading/re-rendering
// can never double-count: the summary is a pure function of (preTick, next, film).
//
// Information integrity: NEVER reveals exact hidden ceilings, hidden development rolls,
// or true Potential. It reports only skill DELTAS (already visible-grade changes), role
// OVR before→after (a public perceived summary), genre-experience gains, and qualitative
// WE/approaching-range prose — no ceiling value, no roll, no true-potential number.

// One participant's development on one released film.
export type ParticipantDevelopment = {
  talentId: string
  name: string
  discipline: Discipline
  disciplineLabel: string // "Actor" / "Writer" / ...
  ovrBefore: number // role OVR (perceived) in the performed discipline, before
  ovrAfter: number // ... after
  lines: string[] // developmentReport(before, after) — skill rises, OVR change, exp gains
  professionalSkillRose: boolean // any professional-skill delta > 0 (a real skill line exists)
  // Truthful, qualitative notes — present ONLY when the calc actually used the factor.
  notes: string[]
}

// One released film's full development summary (all its participants).
export type ReleaseDevelopment = {
  productionId: string
  conceptTitle: string
  participants: ParticipantDevelopment[]
}

// The disciplines a released production's roles map to, in the SAME fixed order the
// engine's DEVELOPMENT step (tick step 6) walks: writer→writing, director→directing,
// cast lead/antagonist/support→acting, craft hires→craft.
function releaseParticipants(prod: Production): { id: string; discipline: Discipline }[] {
  const out: { id: string; discipline: Discipline }[] = [
    { id: prod.writerId, discipline: 'writing' },
    { id: prod.directorId, discipline: 'directing' },
  ]
  for (const slot of CAST_SLOTS) out.push({ id: prod.cast[slot], discipline: 'acting' })
  for (const cid of prod.craftIds) out.push({ id: cid, discipline: 'craft' })
  return out
}

// Whether a developmentReport line describes a PROFESSIONAL-SKILL rise (e.g.
// "Dialogue Delivery +1") vs a role-OVR line ("Actor OVR 62 → 63") or a genre-exp line
// ("Comedy acting experience +2"). Skill lines end in "+<n>" and are neither an OVR line
// (contains "OVR") nor an experience line (contains "experience").
function isProfessionalSkillLine(line: string): boolean {
  return /\+\d+$/.test(line) && !line.includes('OVR') && !line.includes('experience')
}

// Build one participant's development, diffing the before/after talent objects.
// `seed` is the run seed, needed only for the PUBLIC potential-estimate band used by
// the truthful "approaching the estimated range" note (never exposes the true ceiling).
function buildParticipantDevelopment(
  before: Talent,
  after: Talent,
  discipline: Discipline,
  seed: string,
): ParticipantDevelopment {
  const lines = developmentReport(before, after)
  const professionalSkillRose = lines.some(isProfessionalSkillLine)
  const ovrBefore = roleOVR(before, discipline)
  const ovrAfter = roleOVR(after, discipline)

  // Truthful WE/Potential explanation — emitted ONLY when the calculation MATERIALLY
  // used the factor, judged by observable before→after facts (never by reading hidden
  // rolls/ceilings/true potential):
  //   • Work Ethic: the development magnitude is WE-modulated (D-9.8 weMult / land-bias),
  //     so a Driven+ work ethic that produced a real professional-skill rise is a truthful
  //     "helped convert this assignment" note. We show it only when BOTH a rise happened
  //     AND the talent's work ethic is at/above the "Driven" band (≥70) — i.e. WE plausibly
  //     lifted the conversion. When WE is low but a rise still happened, we do NOT claim WE
  //     helped (it did not materially drive it).
  //   • Approaching-range: when the discipline's current OVR has reached/entered the studio's
  //     VISIBLE estimated potential band (i.e. little visible headroom remains), development
  //     naturally tails off — a truthful "approaching the studio's estimated range" note. This
  //     reads only the PUBLIC expectedPotentialRange band + the PUBLIC current OVR; it never
  //     exposes the true (hidden) ceiling.
  const notes: string[] = []
  const we = after.workEthic
  if (professionalSkillRose && we >= WORK_ETHIC_DRIVEN_MIN) {
    notes.push(
      `${workEthicLabel(we)} work ethic helped convert this assignment into lasting improvement.`,
    )
  }
  // Approaching-range note: when the AFTER current OVR has reached at least the LOW edge of
  // the studio's VISIBLE estimated potential band, visible headroom is nearly spent and
  // development tails off. Truthful, qualitative, reads only public band + public OVR.
  const band = expectedPotentialRange(after, discipline, seed)
  if (ovrAfter >= band.low) {
    notes.push(
      'Current ability is approaching the studio’s estimated development range for this discipline.',
    )
  }
  return {
    talentId: after.id,
    name: after.name,
    discipline,
    disciplineLabel: DISCIPLINE_LABEL[discipline],
    ovrBefore,
    ovrAfter,
    lines,
    professionalSkillRose,
    notes,
  }
}

// The Work-Ethic band (Driven, D-9.11 ≥70) at/above which WE plausibly lifts conversion.
const WORK_ETHIC_DRIVEN_MIN = 70

// buildReleaseDevelopment(preTick, next, released): the per-release development summary
// for the develop-ON week. Reads ONLY the two immutable snapshots (no re-tick). For each
// released film we resolve its participants from the PRE-TICK production (still present
// in preTick.studio.activeProductions before RELEASE removed it), snapshot each one's
// BEFORE talent from preTick and AFTER talent from `next`, and diff. A participant whose
// after-object is identical (===) to before (untouched by development) still appears with
// a truthful "No measurable professional-skill increase." line. Films present only in an
// imported prior-session save (no pre-tick production) are skipped (no fabricated summary).
export function buildReleaseDevelopment(
  preTick: GameState,
  next: GameState,
  released: FilmResult[],
): ReleaseDevelopment[] {
  const beforeById = new Map<string, Talent>()
  for (const t of preTick.talent) beforeById.set(t.id, t)
  const afterById = new Map<string, Talent>()
  for (const t of next.talent) afterById.set(t.id, t)

  const out: ReleaseDevelopment[] = []
  for (const film of released) {
    const prod = preTick.studio.activeProductions.find((p) => p.id === film.productionId)
    if (!prod) continue // released-in-imported-save: no participants to diff, skip
    const concept = findConcept(preTick, prod.conceptId)
    const participants: ParticipantDevelopment[] = []
    for (const { id, discipline } of releaseParticipants(prod)) {
      const before = beforeById.get(id)
      const after = afterById.get(id)
      if (!before || !after) continue // craft with no hire etc. — nothing to develop
      participants.push(buildParticipantDevelopment(before, after, discipline, preTick.seed))
    }
    out.push({
      productionId: prod.id,
      conceptTitle: concept?.title ?? prod.conceptId,
      participants,
    })
  }
  return out
}

// ── Autopsy reconstruction (every formula stays in the engine) ───────────────
// Reconstruct the §5 ReceptionInputs from the PRE-TICK state and call the PUBLIC
// resolveReception. The DETERMINISTIC fields match the real release exactly (same
// inputs). The two SAMPLED fields (criticScore, reviewVariance) are re-drawn by a
// fresh resolveReception, so we OVERRIDE them with the STORED filmResult values.
// Standing deltas = filmResult's tick post-standing minus pre-tick standing (we
// hold both). Box office equals filmResult.boxOffice by determinism.
export type AutopsyView = {
  productionId: string
  conceptTitle: string
  // forecast vs result
  forecast: Forecast
  // craft breakdown (§5.1)
  scriptStrength: number
  directorExecution: number
  castExecution: number
  technical: number
  budgetAdequacy: number
  requiredNegative: number
  craft: number
  // cohesion + contributions (§5.2)
  contributions: Record<'writer' | 'director' | 'lead' | 'antagonist' | 'support' | 'shape', ContributionView>
  delivered: { intimacy: number; tonalWeight: number; kineticEnergy: number }
  directionalAgreement: number
  expressiveStrength: number
  cohesion: number
  // critic (§5.3) — deterministic mean/sigma + STORED sampled score/variance
  forceAlignment: number
  originalityRaw: number
  cohesionContribution: number
  originalityContribution: number
  timelinessContribution: number
  criticMean: number
  criticSigma: number
  criticScore: number // STORED (sampled)
  reviewVariance: number // STORED (sampled)
  // segment appeal (§5.4)
  promiseMismatch: number
  mismatchPenalty: number
  starDraw: number
  segmentFit: Record<SegmentId, number>
  segmentAppeal: Record<SegmentId, number>
  // box office (§5.5)
  awarenessFactor: number
  weightedAudienceScore: number
  openingReachMult: number
  boxOffice: { opening: number; total: number }
  legs: number
  // money
  committedCost: number
  profit: number
  // standing (§6 D-6) — the deltas and WHY each channel moved
  standingBefore: Standing
  standingAfter: Standing
  standingDeltas: Standing
  standingWhy: {
    awareness: string
    prestige: string
    confidence: string
  }
}

export type ContributionView = {
  role: string
  vector: { intimacy: number; tonalWeight: number; kineticEnergy: number }
}

// Rebuild the exact ReceptionInputs the tick used (pre-tick market/standing/era,
// resolved talent/concept, resolveShape(production.shape), craftHires:[]).
function autopsyReceptionInputs(preTick: GameState, prod: Production): ReceptionInputs {
  const concept = findConcept(preTick, prod.conceptId)
  if (!concept) throw new Error(`autopsy: unknown conceptId "${prod.conceptId}"`)
  const writer = preTick.talent.find((t) => t.id === prod.writerId)
  if (!writer) throw new Error(`autopsy: unknown writerId "${prod.writerId}"`)
  const director = preTick.talent.find((t) => t.id === prod.directorId)
  if (!director) throw new Error(`autopsy: unknown directorId "${prod.directorId}"`)
  const cast = {} as Record<CastSlot, Talent>
  for (const slot of CAST_SLOTS) {
    const t = preTick.talent.find((x) => x.id === prod.cast[slot])
    if (!t) throw new Error(`autopsy: unknown cast.${slot} id "${prod.cast[slot]}"`)
    cast[slot] = t
  }
  const craftHires: Talent[] = prod.craftIds.map((id) => {
    const t = preTick.talent.find((x) => x.id === id)
    if (!t) throw new Error(`autopsy: unknown craft id "${id}"`)
    return t
  })
  return {
    concept,
    // RULING C (2026-07-26): the production's LOCKED shape — the autopsy reconstructs
    // §5 through the SAME shared shape path the release used (no recompute divergence).
    shape: prod.shape,
    shapeEffects: resolveShape(prod.shape),
    promise: prod.promise,
    budget: prod.budget,
    writer,
    director,
    cast,
    craftHires,
    market: preTick.market,
    standing: preTick.studio.standing,
    era: preTick.era,
  }
}

export function explainRelease(
  preTick: GameState,
  postTickStanding: Standing,
  filmResult: FilmResult,
): AutopsyView {
  // The production is in preTick.studio.activeProductions (removed at RELEASE).
  const prod = preTick.studio.activeProductions.find((p) => p.id === filmResult.productionId)
  if (!prod) {
    throw new Error(`autopsy: production "${filmResult.productionId}" not in pre-tick active list`)
  }
  const concept = findConcept(preTick, prod.conceptId)
  const inp = autopsyReceptionInputs(preTick, prod)

  // Call the PUBLIC resolveReception with a throwaway stream — the deterministic
  // fields match the real release; only the sampled critic draw differs (we ignore
  // its criticScore/reviewVariance and use the STORED filmResult values).
  const r = resolveReception(inp, RngStream.fromSeed(`autopsy::${filmResult.productionId}`))

  const contributions: AutopsyView['contributions'] = {
    writer: { role: 'Writer', vector: r.contributions.writer },
    director: { role: 'Director', vector: r.contributions.director },
    lead: { role: 'Lead', vector: r.contributions.lead },
    antagonist: { role: 'Antagonist', vector: r.contributions.antagonist },
    support: { role: 'Support', vector: r.contributions.support },
    shape: { role: 'Shape', vector: r.contributions.shape },
  }

  const committedCost = prod.budget.negative + prod.budget.marketing + salarySumForProduction(preTick, prod)
  const profit = filmResult.boxOffice.total - committedCost

  const standingBefore = preTick.studio.standing
  const standingDeltas: Standing = {
    audienceAwareness: postTickStanding.audienceAwareness - standingBefore.audienceAwareness,
    industryPrestige: postTickStanding.industryPrestige - standingBefore.industryPrestige,
    commercialConfidence: postTickStanding.commercialConfidence - standingBefore.commercialConfidence,
  }

  // WHY each channel moved (the D-6 inputs, described — engine values, not formulas
  // re-run in the UI).
  const reach = filmResult.boxOffice.total / Math.max(preTick.market.baseMarketValue, 1)
  const roi = profit / Math.max(committedCost, TUNING.CONFIDENCE_COST_FLOOR)
  const standingWhy = {
    awareness: `Reach was ${(reach * 100).toFixed(0)}% of the available market; awareness follows box-office reach, plus star attention.`,
    prestige: `Critic score ${filmResult.criticScore.toFixed(1)} vs the reachable benchmark of ${TUNING.PRESTIGE_CRITIC_BENCHMARK}; prestige follows critical achievement only.`,
    confidence: `ROI was ${(roi * 100).toFixed(0)}% on the committed cost; confidence follows profitability and budget discipline.`,
  }

  return {
    productionId: prod.id,
    conceptTitle: concept?.title ?? prod.conceptId,
    forecast: prod.forecastSnapshot,
    scriptStrength: r.scriptStrength,
    directorExecution: r.directorExecution,
    castExecution: r.castExecution,
    technical: r.technical,
    budgetAdequacy: r.budgetAdequacy,
    requiredNegative: r.requiredNegative,
    craft: r.craft,
    contributions,
    delivered: r.delivered,
    directionalAgreement: r.directionalAgreement,
    expressiveStrength: r.expressiveStrength,
    cohesion: r.cohesion,
    forceAlignment: r.forceAlignment,
    originalityRaw: r.originalityRaw,
    cohesionContribution: r.cohesionContribution,
    originalityContribution: r.originalityContribution,
    timelinessContribution: r.timelinessContribution,
    criticMean: r.criticMean,
    criticSigma: r.criticSigma,
    criticScore: filmResult.criticScore, // STORED sampled value (not the re-draw)
    reviewVariance: filmResult.reviewVariance, // STORED sampled value
    promiseMismatch: r.promiseMismatch,
    mismatchPenalty: r.mismatchPenalty,
    starDraw: r.starDraw,
    segmentFit: r.segmentFit,
    segmentAppeal: r.segmentAppeal,
    awarenessFactor: r.awarenessFactor,
    weightedAudienceScore: r.weightedAudienceScore,
    openingReachMult: r.openingReachMult,
    boxOffice: filmResult.boxOffice, // equals r.opening/r.total by determinism
    legs: r.legs,
    committedCost,
    profit,
    standingBefore,
    standingAfter: postTickStanding,
    standingDeltas,
    standingWhy,
  }
}

// Salary sum for an already-greenlit Production (writer + director + cast + craft).
function salarySumForProduction(state: GameState, prod: Production): number {
  let total = 0
  const w = state.talent.find((t) => t.id === prod.writerId)
  const d = state.talent.find((t) => t.id === prod.directorId)
  if (w) total += w.salary
  if (d) total += d.salary
  for (const slot of CAST_SLOTS) {
    const t = state.talent.find((x) => x.id === prod.cast[slot])
    if (t) total += t.salary
  }
  for (const cid of prod.craftIds) {
    const t = state.talent.find((x) => x.id === cid)
    if (t) total += t.salary
  }
  return total
}

// Remaining weeks of an active production, for the dashboard.
export function remainingWeeks(prod: Production): number {
  return prod.remainingTicks
}

// ── Saves ────────────────────────────────────────────────────────────────────
// New games always save as the D-9 SaveFileV2 (makeSave === makeSaveV2). The V2
// envelope's state.talent is the multi-discipline Talent[]; the UI only ever loads a
// GameState (never a GameStateV1) — a legacy V1 import is converted first (below).
export function exportSaveJson(state: GameState): string {
  return exportSave(makeSave(state))
}

export type ImportOutcome =
  | { ok: true; state: GameState; converted: boolean }
  | { ok: false; error: string }

// Import a save. Accepts BOTH the current V2 envelope and (via convertV1ToV2) a
// legacy V1 envelope, converting the latter deterministically. `converted` tells the
// caller a V1 save was upgraded to V2 so the UI can inform the player (their original
// V1 file is never overwritten — this returns a fresh V2 state).
export function importSaveJson(json: string): ImportOutcome {
  try {
    const save: SaveFile = importSave(json)
    const loaded = loadSave(save)
    if (loaded.saveVersion === 2) {
      return { ok: true, state: loaded.state, converted: false }
    }
    // Legacy V1: convert to V2 in place (the input string/file is untouched).
    const v2: SaveFileV2 = importLegacyV1(json)
    return { ok: true, state: v2.state, converted: true }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

// Explicit "Import a legacy V1 save" affordance (D-9.15). Parses a legacy V1 JSON
// string, converts it deterministically to a V2 GameState, and reports success so the
// UI can clearly tell the player the save was converted. Rejects anything that is not
// a valid V1 save as DATA. The player's original V1 file is never overwritten.
export function importLegacyV1SaveJson(json: string): ImportOutcome {
  try {
    const v2 = importLegacyV1(json)
    return { ok: true, state: v2.state, converted: true }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

// ── Small display helpers (formatting only — no simulation logic) ─────────────
export function personaAsExpression(p: Persona): { intimacy: number; tonalWeight: number; kineticEnergy: number } {
  return personaToExpression(p)
}

// ═══════════════════════════════════════════════════════════════════════════════
// TALENT HUB — read-only browsable roster + profile + Fit comparison + cross-role.
//
// INFORMATION-INTEGRITY CONTRACT (critical). Everything below is derived EXCLUSIVELY
// from the engine's PUBLIC summary functions (roleOVR / roleTier / projectFit /
// expectedPerformance / temperamentSummary / expectedPotentialTier|Range /
// workEthicLabel / workHistoryCount / genreExperience). The Hub NEVER reads a
// talent's hidden `actual` skills, NEVER reads a true ceiling, and NEVER recomputes
// ability from raw skills. It surfaces only:
//   • role OVRs (from PERCEIVED skills) + tier labels — invariant to the film,
//   • Creative Temperament (persona presentation, NOT ability),
//   • the VISIBLE Potential estimate tier + range (never the true ceiling),
//   • Work Ethic label (development-only; never framed as current quality),
//   • perceived genre experience,
//   • Project Fit (perceived) + Expected Performance band — film/slot specific.
// ═══════════════════════════════════════════════════════════════════════════════

// One discipline's read-only summary for a talent (all values from PUBLIC fns).
export type DisciplineSummary = {
  discipline: Discipline
  label: string
  isPrimary: boolean
  ovr: number // roleOVR (perceived) — film-invariant
  tier: string // roleTier(ovr)
  potentialTier: string // VISIBLE estimate tier (never the true ceiling)
  potentialLow: number // visible estimate band low (OVR)
  potentialHigh: number // visible estimate band high (OVR)
  workHistory: number // completed productions in this discipline this run
  unproven: boolean // workHistory === 0 → "Unproven in this role"
}

// Perceived genre experience for a (discipline, genre) — display only.
export type GenreExperienceCell = {
  genre: Genre
  perceived: number // 0..100 perceived experience (never actual)
}

// A full read-only profile for one talent (the Hub row + the profile view share it).
export type TalentProfile = {
  id: string
  name: string
  role: CreativeRole
  primaryDiscipline: Discipline
  age: number
  fame: number
  salary: number
  authored: boolean
  available: boolean
  engagedIn: string | null
  perceived: Persona // NEVER actual
  temperament: string // temperamentSummary(perceived) — persona, not ability
  workEthic: number // visible 1..99
  workEthicLabel: string // workEthicLabel(workEthic)
  disciplines: DisciplineSummary[] // all four, primary first-flagged
  // perceived genre experience per (discipline, genre) — the primary discipline's
  // row is the most relevant; all four are provided for the profile view.
  genreExperience: Record<Discipline, GenreExperienceCell[]>
  // RULING B (2026-07-26): CAPABILITY vs credited CAREER IDENTITY. A discipline with a
  // usable OVR (≥ CAPABILITY_OVR_MIN) but NO credits (workHistory === 0) is "Capable but
  // Unproven" — never shown as an established "Actor / Writer". A discipline joins the
  // career-identity label only with a demonstrated credit. Both are shown truthfully; no
  // fabricated credits. From the engine's careerIdentity (OVR on perceived, no hidden data).
  careerIdentity: CareerIdentity
}

// Build the per-discipline summary from PUBLIC engine functions only.
function disciplineSummary(t: Talent, d: Discipline, seed: string, primary: Discipline): DisciplineSummary {
  const ovr = roleOVR(t, d)
  const range = expectedPotentialRange(t, d, seed)
  const wh = workHistoryCount(t, d)
  return {
    discipline: d,
    label: DISCIPLINE_LABEL[d],
    isPrimary: d === primary,
    ovr,
    tier: roleTier(ovr),
    potentialTier: expectedPotentialTier(t, d, seed),
    potentialLow: range.low,
    potentialHigh: range.high,
    workHistory: wh,
    unproven: wh === 0,
  }
}

// Project a core Talent to the full read-only Hub profile. `engaged` maps a talent id
// to the production it is busy in (null when free).
export function toTalentProfile(t: Talent, seed: string, engaged: Map<string, string>): TalentProfile {
  const primary = ROLE_TO_DISCIPLINE[t.role]
  const engagedIn = engaged.get(t.id) ?? null
  const genreExp = {} as Record<Discipline, GenreExperienceCell[]>
  for (const d of DISCIPLINE_ORDER) {
    genreExp[d] = GENRE_ORDER.map((g) => ({
      genre: g,
      perceived: genreExperience(t, d, g, 'perceived'), // PERCEIVED only
    }))
  }
  return {
    id: t.id,
    name: t.name,
    role: t.role,
    primaryDiscipline: primary,
    age: t.age,
    fame: t.fame,
    salary: t.salary,
    authored: t.authored,
    available: engagedIn === null,
    engagedIn,
    perceived: t.perceived, // information integrity: perceived, NOT actual
    temperament: temperamentSummary(t.perceived), // persona presentation, not ability
    workEthic: t.workEthic,
    workEthicLabel: workEthicLabel(t.workEthic),
    disciplines: DISCIPLINE_ORDER.map((d) => disciplineSummary(t, d, seed, primary)),
    genreExperience: genreExp,
    careerIdentity: careerIdentity(t), // RULING B: capability vs credited identity
  }
}

// A human career-identity LABEL from the engine's careerIdentity (display only).
// Built ONLY from PROVEN disciplines (usable OVR + a real credit), joined with " / "
// in DISCIPLINE_ORDER. When the talent has no proven discipline yet (a fresh run, no
// releases), the label is empty and the UI shows the primary discipline as their home
// with a "not yet proven" qualifier — never a fabricated credit.
export function careerIdentityLabel(ci: CareerIdentity): string {
  return ci.identityDisciplines.map((d) => DISCIPLINE_LABEL[d]).join(' / ')
}

// The "Capable but Unproven" disciplines as human labels (display only).
export function capableButUnprovenLabels(ci: CareerIdentity): string[] {
  return ci.capableButUnprovenDisciplines.map((d) => DISCIPLINE_LABEL[d])
}

// Re-export the raw careerIdentity fn + a state-keyed selector (single boundary).
export { careerIdentity }
export function talentCareerIdentity(state: GameState, id: string): CareerIdentity | undefined {
  const t = findTalent(state, id)
  return t ? careerIdentity(t) : undefined
}

// The whole roster as read-only Hub profiles (ascending talent id = worldgen order).
export function talentHubRoster(state: GameState): TalentProfile[] {
  const engaged = engagedTalentIds(state)
  return state.talent.map((t) => toTalentProfile(t, state.seed, engaged))
}

// A single talent's profile, or undefined if the id is unknown.
export function talentProfile(state: GameState, id: string): TalentProfile | undefined {
  const t = findTalent(state, id)
  if (!t) return undefined
  const engaged = engagedTalentIds(state)
  return toTalentProfile(t, state.seed, engaged)
}

// ── Cross-role assessment (D-9.9) ─────────────────────────────────────────────
// A person may be CONSIDERED for any discipline. When they have no work history in
// that discipline (workHistory === 0) they are "Unproven in this role" and their
// Expected Performance band is WIDER (D-9.7's EP_UNPROVEN_WIDTH bump). This surfaces
// exactly that — for a specific concept/slot/promise/shape (Fit is film-specific).
export type CrossRoleAssessment = {
  talentId: string
  discipline: Discipline
  disciplineLabel: string
  ovr: number // film-invariant OVR in this discipline
  tier: string
  fit: number // projectFit — film/assignment specific (0..100)
  performance: PerformanceBand // expectedPerformance {low, high, expected}
  unproven: boolean // no work history in this discipline
  bandWidth: number // high - low (wider when unproven / genre-inexperienced)
}

// Assess ONE talent in ONE discipline for a specific assignment. `slot` applies only
// to acting; leave undefined for writing/directing/craft. All values come from the
// PUBLIC projectFit / expectedPerformance / roleOVR — never from actual skills.
export function crossRoleAssessment(
  state: GameState,
  talentId: string,
  discipline: Discipline,
  conceptId: string,
  slot: CastSlot | undefined,
  promise: FilmPromise,
  shape: FilmShape,
): CrossRoleAssessment {
  const t = findTalent(state, talentId)
  if (!t) throw new Error(`crossRoleAssessment: unknown talent "${talentId}"`)
  const concept = findConcept(state, conceptId)
  if (!concept) throw new Error(`crossRoleAssessment: unknown concept "${conceptId}"`)
  const se = resolveShape(shape)
  const ovr = roleOVR(t, discipline)
  const fit = projectFit(t, discipline, concept, slot, se, promise, shape)
  const perf = expectedPerformance(t, discipline, concept, slot, se, promise, shape)
  const unproven = workHistoryCount(t, discipline) === 0
  return {
    talentId,
    discipline,
    disciplineLabel: DISCIPLINE_LABEL[discipline],
    ovr,
    tier: roleTier(ovr),
    fit,
    performance: perf,
    unproven,
    bandWidth: perf.high - perf.low,
  }
}

// ── RULING C — Shape-sensitive Fit / Expected-Performance explanations ────────
// The core threads the LOCKED FilmShape into the sim; the UI Fit/EP already call the
// shared engine helpers (projectFit/expectedPerformance) WITH `shape`, so display and
// outcome use the SAME formula. This builds the human REASONS that make shape-sensitive
// factors visible — and it derives them from the SAME shared engine function the sim
// uses (projectSkillWeights), NOT a UI reimplementation of any shape weighting.
//
// Method (fully shared-path, truthful):
//   1. wShape  = projectSkillWeights(discipline, concept, slot, shapeEffects, promise, shape)
//   2. wNoShape= projectSkillWeights(discipline, concept, slot, shapeEffects, promise) // no shape
//   Both are the engine's canonical weighting fn. A skill is SHAPE-EMPHASIZED when the
//   locked shape lifts its project weight by ≥ SHAPE_EMPHASIS_MIN, and SHAPE-DEEMPHASIZED
//   when it drops it by that much. Only those skills are shape-material — so a reason is
//   shown ONLY when the calculation materially uses shape (per the ruling).
//   3. For each shape-material skill, classify the talent's PERCEIVED strength qualitatively
//   (Strong / a concern) and emit a plain-English reason (e.g. "Strong Dialogue Delivery
//   suits this dialogue-heavy opening"; "Narrative Pacing is a concern for the chosen
//   ending structure"). No internal table names, no raw hidden values, no raw skill numbers.
//
// The shape descriptor ("this dialogue-heavy opening") comes from the chosen shape slots,
// not an internal table name. Perceived skills drive the Strong/concern call (never actual).

// Perceived strength thresholds for the qualitative Strong/concern call (display only).
const SKILL_STRONG_MIN = 70 // perceived skill ≥ this reads as a Strong suit
const SKILL_CONCERN_MAX = 45 // perceived skill ≤ this reads as a concern
// A shape must shift a skill's normalized project weight by at least this to be "material".
const SHAPE_EMPHASIS_MIN = 0.02

// Human skill labels (display only), keyed by the engine's skill keys.
const SKILL_LABEL: Record<string, string> = {
  actingTechnique: 'Acting Technique',
  emotionalRange: 'Emotional Range',
  dialogueDelivery: 'Dialogue Delivery',
  comicTiming: 'Comic Timing',
  physicalPerformance: 'Physical Performance',
  screenPresence: 'Screen Presence',
  storyStructure: 'Story Structure',
  characterDevelopment: 'Character Development',
  dialogue: 'Dialogue',
  originality: 'Originality',
  narrativePacing: 'Narrative Pacing',
  rewriting: 'Rewriting',
  visualStorytelling: 'Visual Storytelling',
  performanceDirection: 'Performance Direction',
  toneControl: 'Tone Control',
  directingPacing: 'Directing Pacing',
  productionManagement: 'Production Management',
  adaptability: 'Adaptability',
  cinematography: 'Cinematography',
  editing: 'Editing',
  productionDesign: 'Production Design',
  soundAndMusic: 'Sound & Music',
  effectsExecution: 'Effects Execution',
  technicalCoordination: 'Technical Coordination',
}

// Plain-English descriptors for the shape slot that a shape-material skill is tied to.
// These name the CHOSEN structure ("dialogue-heavy opening"), never an internal table.
const OPENING_DESC: Record<string, string> = {
  immediateAction: 'action-forward opening',
  slowSetup: 'slow, character-led opening',
  mysteryHook: 'mystery-hook opening',
}
const MIDPOINT_DESC: Record<string, string> = {
  reversal: 'mid-film reversal',
  escalation: 'mid-film escalation',
  revelation: 'mid-film revelation',
}
const ENDING_DESC: Record<string, string> = {
  triumph: 'triumphant ending',
  tragic: 'tragic ending',
  bittersweet: 'bittersweet ending',
  ambiguous: 'ambiguous ending',
}

// A generic shape descriptor naming the chosen structure (opening / midpoint / ending),
// never an internal table. Used in the reason text so the shape-sensitivity is legible.
function shapeDescriptor(shape: FilmShape): string {
  const opening = OPENING_DESC[shape.opening] ?? 'chosen opening'
  const midpoint = MIDPOINT_DESC[shape.midpoint] ?? 'chosen midpoint'
  const ending = ENDING_DESC[shape.ending] ?? 'chosen ending'
  return `${opening}, ${midpoint} and ${ending}`
}

export type ShapeReason = {
  skill: string // engine skill key
  skillLabel: string // human label
  kind: 'suits' | 'concern' // strength suits the emphasis, or weakness is a concern
  text: string // the full plain-English reason
}

// shapeFitReasons: the shape-sensitive Fit/EP reasons for one talent in one discipline on
// one film. Empty when the shape does not materially move any skill the talent is notably
// strong/weak in (so reasons appear ONLY when shape materially matters). Uses ONLY the
// shared projectSkillWeights engine fn + perceived skills — no reimplemented weighting.
export function shapeFitReasons(
  state: GameState,
  talentId: string,
  discipline: Discipline,
  conceptId: string,
  slot: CastSlot | undefined,
  promise: FilmPromise,
  shape: FilmShape,
): ShapeReason[] {
  const t = findTalent(state, talentId)
  if (!t) return []
  const concept = findConcept(state, conceptId)
  if (!concept) return []
  const se = resolveShape(shape)
  const wShape = projectSkillWeights(discipline, concept, slot, se, promise, shape)
  const wNoShape = projectSkillWeights(discipline, concept, slot, se, promise) // shape omitted
  const keys = SKILL_ORDER[discipline]
  const desc = shapeDescriptor(shape)

  const reasons: ShapeReason[] = []
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]!
    const delta = wShape[i]! - wNoShape[i]!
    if (delta < SHAPE_EMPHASIS_MIN) continue // shape does not materially emphasize this skill
    // perceived strength (never actual). Reading the perceived value is display-grade.
    const perceived = t.skills[discipline][key]!.perceived
    const label = SKILL_LABEL[key] ?? key
    if (perceived >= SKILL_STRONG_MIN) {
      reasons.push({
        skill: key,
        skillLabel: label,
        kind: 'suits',
        text: `Strong ${label} suits the chosen structure (${desc}).`,
      })
    } else if (perceived <= SKILL_CONCERN_MAX) {
      reasons.push({
        skill: key,
        skillLabel: label,
        kind: 'concern',
        text: `${label} is a concern for the chosen structure (${desc}).`,
      })
    }
  }
  return reasons
}

// ── Fit comparison (D-9.3 / D-9.6) ────────────────────────────────────────────
// For a chosen discipline + assignment (concept/slot/promise/shape), rank the pool by
// BOTH OVR and Fit, exposing the re-ranking (a lower-OVR specialist can out-Fit a
// higher-OVR generalist on a matching film). `ovrRank`/`fitRank` are 1-based; the
// re-rank delta (`ovrRank − fitRank`) is positive when Fit promotes them above OVR.
export type FitComparisonRow = {
  talentId: string
  name: string
  available: boolean
  ovr: number
  ovrTier: string
  fit: number
  unproven: boolean // no work history in the assessed discipline
  performance: PerformanceBand
  ovrRank: number // 1 = highest OVR
  fitRank: number // 1 = highest Fit
  promotedByFit: boolean // fitRank < ovrRank (Fit ranks them higher than OVR does)
}

export type FitComparison = {
  discipline: Discipline
  disciplineLabel: string
  conceptId: string
  conceptTitle: string
  slot: CastSlot | undefined
  rows: FitComparisonRow[] // ordered by Fit descending (the recommended order)
  // A concrete specialist-beats-generalist example when one exists (the highest-Fit
  // talent is NOT the highest-OVR talent), else null.
  specialistUpset: { fitLeaderId: string; ovrLeaderId: string } | null
}

// Rank a talent pool for an assignment. `pool` is the set of talent ids to consider
// (e.g. the acting pool for a cast slot, or ANY pool for cross-role consideration).
export function fitComparison(
  state: GameState,
  discipline: Discipline,
  conceptId: string,
  slot: CastSlot | undefined,
  promise: FilmPromise,
  shape: FilmShape,
  poolIds: string[],
): FitComparison {
  const concept = findConcept(state, conceptId)
  if (!concept) throw new Error(`fitComparison: unknown concept "${conceptId}"`)
  const se = resolveShape(shape)
  const engaged = engagedTalentIds(state)

  type Row = Omit<FitComparisonRow, 'ovrRank' | 'fitRank' | 'promotedByFit'>
  const base: Row[] = []
  for (const id of poolIds) {
    const t = findTalent(state, id)
    if (!t) continue
    const ovr = roleOVR(t, discipline)
    base.push({
      talentId: id,
      name: t.name,
      available: !engaged.has(id),
      ovr,
      ovrTier: roleTier(ovr),
      fit: projectFit(t, discipline, concept, slot, se, promise, shape),
      unproven: workHistoryCount(t, discipline) === 0,
      performance: expectedPerformance(t, discipline, concept, slot, se, promise, shape),
    })
  }

  // OVR ranking (ties broken by id for determinism) → 1-based ovrRank per id.
  const byOvr = [...base].sort((a, b) => b.ovr - a.ovr || a.talentId.localeCompare(b.talentId))
  const ovrRankOf = new Map<string, number>()
  byOvr.forEach((r, i) => ovrRankOf.set(r.talentId, i + 1))

  // Fit ranking (ties broken by id) → 1-based fitRank; this is the display order.
  const byFit = [...base].sort((a, b) => b.fit - a.fit || a.talentId.localeCompare(b.talentId))

  const rows: FitComparisonRow[] = byFit.map((r, i) => {
    const fitRank = i + 1
    const ovrRank = ovrRankOf.get(r.talentId)!
    return { ...r, ovrRank, fitRank, promotedByFit: fitRank < ovrRank }
  })

  const fitLeaderId = byFit[0]?.talentId
  const ovrLeaderId = byOvr[0]?.talentId
  const specialistUpset =
    fitLeaderId !== undefined && ovrLeaderId !== undefined && fitLeaderId !== ovrLeaderId
      ? { fitLeaderId, ovrLeaderId }
      : null

  return {
    discipline,
    disciplineLabel: DISCIPLINE_LABEL[discipline],
    conceptId,
    conceptTitle: concept.title,
    slot,
    rows,
    specialistUpset,
  }
}

// The ids of the talent pool whose PRIMARY role matches a discipline (the natural
// candidates), plus a helper to get EVERY talent id (for cross-role consideration).
export function primaryPoolIds(state: GameState, discipline: Discipline): string[] {
  return state.talent.filter((t) => ROLE_TO_DISCIPLINE[t.role] === discipline).map((t) => t.id)
}
export function allTalentIds(state: GameState): string[] {
  return state.talent.map((t) => t.id)
}

// Re-export the raw D-9 summary functions (display-only) so tests and any future
// Hub component can assert against them directly, still through the single boundary.
// These read PERCEIVED skills / VISIBLE potential only — never hidden actuals.
export {
  roleOVR,
  roleTier,
  projectFit,
  expectedPerformance,
  temperamentSummary,
  expectedPotentialTier,
  expectedPotentialRange,
  workEthicLabel,
  workHistoryCount,
  genreExperience,
  ageRunwayMult,
}

// ═══════════════════════════════════════════════════════════════════════════════
// FILM PACKAGE ASSESSMENT — the single boundary for the CYCLE-3 Film Package summary,
// candidate cards, change-preview and greenlight autopsy. Every value below is a CALL
// into the frozen core's READ-ONLY filmPackage helpers (creativeCohesion / packageFit /
// executionConfidence / forecastProfitRange / packageDelta / greenlightAssessment /
// risksMaterialized). NO §5/§7/D-9 formula is re-implemented here; this file only
// RESOLVES the DraftPackage's talent ids to core Talent and assembles the input shape
// each helper expects, then returns the helper's output verbatim. Perceived-only:
// creativeCohesion is talent-independent; the others read PERCEIVED talent summaries.
// ═══════════════════════════════════════════════════════════════════════════════

// The Film Package result types (CreativeCohesion / PackageFit / …) are re-exported
// from the single `export type {…}` block at the top of this file. Here we add the one
// remaining type the UI renders (MoneyRange) and re-export the raw creativeCohesion fn
// (talent-independent — usable before any talent is chosen) for tests to assert against.
export type { MoneyRange } from '../../../src/core/index.ts'
export { creativeCohesion }

// A partial cast (the assembly draft may not have chosen every slot yet). Only fully
// resolved slots are passed to packageFit; the rest are reported as `unfilled`.
type PartialCast = Partial<Record<CastSlot, Talent>>

// Resolve the fully-chosen talent of a DraftPackage. Cast slots that are unset (null)
// are simply omitted — packageFit tolerates a partial cast and reports `unfilled`.
// Writer/director must be present for the fit/execution/profit summaries (the caller
// guards); creativeCohesion needs NONE of them (talent-independent).
function resolveDraftTalent(
  state: GameState,
  pkg: DraftPackage,
): {
  concept: FilmConcept
  writer: Talent
  director: Talent
  cast: PartialCast
  craftHires: Talent[]
} {
  const concept = findConcept(state, pkg.conceptId)
  if (!concept) throw new Error(`assess: unknown conceptId "${pkg.conceptId}"`)
  const writer = findTalent(state, pkg.writerId)
  if (!writer) throw new Error(`assess: unknown writerId "${pkg.writerId}"`)
  const director = findTalent(state, pkg.directorId)
  if (!director) throw new Error(`assess: unknown directorId "${pkg.directorId}"`)
  const cast: PartialCast = {}
  for (const slot of CAST_SLOTS) {
    const id = pkg.cast[slot]
    if (!id) continue
    const t = findTalent(state, id)
    if (t) cast[slot] = t
  }
  const craftHires: Talent[] = (pkg.craftIds ?? []).map((id) => {
    const t = findTalent(state, id)
    if (!t) throw new Error(`assess: unknown craft id "${id}"`)
    return t
  })
  return { concept, writer, director, cast, craftHires }
}

// #1 Creative Cohesion — TALENT-INDEPENDENT. Needs only concept+shape+promise; can be
// shown before any talent is chosen. Direct passthrough to the core helper.
export function assessCreativeCohesion(
  concept: FilmConcept,
  shape: FilmShape,
  promise: FilmPromise,
): CreativeCohesion {
  return creativeCohesion(concept, shape, promise)
}

// #2 Talent Fit — per-assignment Fit (writer/director/each cast slot/craft) + overall +
// strongest + weakest + severeMismatch + unfilled. Passthrough to core packageFit with
// the resolved talent. Requires writer+director resolved (the summary is shown from the
// talent step onward). Cast slots not yet chosen appear in `unfilled`.
export function assessPackageFit(state: GameState, pkg: DraftPackage): PackageFit {
  const { concept, writer, director, cast, craftHires } = resolveDraftTalent(state, pkg)
  return packageFit({
    concept,
    shape: pkg.shape,
    promise: pkg.promise,
    writer,
    director,
    cast: cast as Record<CastSlot, Talent>, // packageFit tolerates missing slots (→ unfilled)
    craftHires,
  })
}

// Assemble the §5 ReceptionInputs the execution/profit helpers read, from a FULLY
// assembled DraftPackage (all cast slots chosen). Throws (loudly) if a slot is missing —
// the caller guards with `pkg` completeness. Identical shape to assembleReceptionInputs.
function assembleFullReceptionInputs(state: GameState, pkg: DraftPackage): ReceptionInputs {
  return assembleReceptionInputs(state, pkg)
}

// #3 Execution Confidence — PERCEIVED-only aggregate. Needs the full ReceptionInputs +
// forecast context. Passthrough to core executionConfidence.
export function assessExecutionConfidence(
  state: GameState,
  pkg: DraftPackage,
): ExecutionConfidence {
  const inp = assembleFullReceptionInputs(state, pkg)
  return executionConfidence(inp, {
    seed: state.seed,
    productionId: predictedProductionId(state),
    directorId: pkg.directorId,
    releasedFilms: state.studio.releasedFilms,
    concepts: state.concepts,
  })
}

// #4 Commercial Outlook — studio-revenue + profit RANGE. `studioRevenueIsFullBoxOffice`
// is surfaced so the UI shows the full-box-office disclosure. Passthrough to core
// forecastProfitRange; salaries summed from the same resolved talent.
export function assessProfitRange(state: GameState, pkg: DraftPackage): ForecastProfitRange {
  const inp = assembleFullReceptionInputs(state, pkg)
  const salaries = salarySum(state, pkg)
  return forecastProfitRange(inp, {
    seed: state.seed,
    productionId: predictedProductionId(state),
    directorId: pkg.directorId,
    releasedFilms: state.studio.releasedFilms,
    concepts: state.concepts,
    salaries,
  })
}

// A `PackageSide` (fit+execution+profit+castStarPower) for one fully-assembled draft —
// the input to packageDelta. Cast star power = Σ cast fame (0..300). Reads perceived
// fame only (never actual). Returns null when the draft is not fully assembled.
function packageSideFor(state: GameState, pkg: DraftPackage): PackageSide {
  const fit = assessPackageFit(state, pkg)
  const execution = assessExecutionConfidence(state, pkg)
  const profit = assessProfitRange(state, pkg)
  let castStarPower = 0
  for (const slot of CAST_SLOTS) {
    const t = findTalent(state, pkg.cast[slot])
    if (t) castStarPower += t.fame
  }
  return { fit, execution, profit, castStarPower }
}

// #6 Change preview — the pure diff of two fully-assembled drafts (before → after a
// select/swap). Passthrough to core packageDelta. Only REAL computed deltas.
export function assessPackageDelta(
  state: GameState,
  before: DraftPackage,
  after: DraftPackage,
): PackageDelta {
  return packageDelta(packageSideFor(state, before), packageSideFor(state, after))
}

// ── Per-assignment candidate card (redesigned TalentPicker) ────────────────────
// Everything a candidate card shows for ONE talent in ONE assignment, all from PUBLIC
// engine summaries (never actual skills / true ceilings). Reuses crossRoleAssessment
// (Fit + Expected Performance + unproven), roleOVR, genreExperience, and shapeFitReasons
// (the shared projectSkillWeights path). `strengths`/`weakness` are the top assignment-
// relevant perceived-skill reads (shape-material where shape matters). NOTHING here reads
// the hidden `actual` layer.
export type CandidateCard = {
  talentId: string
  name: string
  authored: boolean
  available: boolean
  engagedIn: string | null
  discipline: Discipline
  slot: CastSlot | undefined
  ovr: number // role-specific OVR (perceived) for THIS assignment's discipline
  ovrTier: string
  fit: number // projectFit for THIS assignment (0..100)
  performance: PerformanceBand // expectedPerformance {low, high, expected}
  bandWidth: number
  starPower: number // fame (0..100)
  salary: number
  age: number
  genreExp: number // perceived genre experience for this discipline+genre
  unproven: boolean // cross-role / first job in this discipline
  strengths: string[] // top assignment-relevant reasons the talent SUITS this assignment
  weakness: string | null // the most important assignment-relevant concern (or null)
  // "Capable but Unproven" — a usable OVR with no credit in this discipline.
  capableButUnproven: boolean
  // ── Phase 5.1 CYCLE 3 (owner-ruling filters) — two PERCEIVED-only classification flags ──
  // multiHyphenate: the talent's credited/capable CAREER IDENTITY spans MORE than their
  // primary discipline — i.e. at least one NON-primary discipline is CAPABLE (roleOVR ≥
  // CAPABILITY_OVR_MIN = 60), from the engine's careerIdentity summary (perceived OVR, no
  // hidden data). This is the honest "writer-director", "actor-writer" reading: someone who
  // could genuinely carry a second discipline, not merely their one home.
  multiHyphenate: boolean
  // specialist: a PEAKED perceived-skill profile in THIS assignment's discipline — the
  // talent's single best perceived skill in the discipline exceeds the discipline's own
  // perceived-skill MEAN by at least SPECIALIST_PEAK_MIN points. A spiky profile (one
  // standout suit above an otherwise-flat set) reads as a specialist; an even, generalist
  // profile does not. Computed ONLY from PERCEIVED skills (the player-visible layer the
  // adapter already reads for shapeFitReasons) — never from hidden actual skills.
  specialist: boolean
}

// Perceived thresholds for the qualitative strong/concern read on a card (display only;
// mirror the shapeFitReasons thresholds). Reads PERCEIVED skills only.
const CARD_CAPABILITY_MIN = 50 // a usable OVR floor for "capable but unproven"

// A talent's single best perceived skill in a discipline must exceed the discipline's
// perceived-skill MEAN by at least this many points to read as a "specialist" (a peaked,
// spiky profile). Named threshold — never an inline magic number in the picker.
const SPECIALIST_PEAK_MIN = 12

// specialistInDiscipline: does the talent have a PEAKED perceived-skill profile in this
// discipline? True when max(perceived skill) − mean(perceived skills) ≥ SPECIALIST_PEAK_MIN.
// Reads ONLY the PERCEIVED skill layer (t.skills[discipline][key].perceived) — the same
// player-visible values shapeFitReasons reads; never the hidden `actual` layer.
function specialistInDiscipline(t: Talent, discipline: Discipline): boolean {
  const keys = SKILL_ORDER[discipline] // always the discipline's 6 perceived skills
  let sum = 0
  let max = -Infinity
  for (const key of keys) {
    const perceived = t.skills[discipline][key]!.perceived
    sum += perceived
    if (perceived > max) max = perceived
  }
  const mean = sum / keys.length
  return max - mean >= SPECIALIST_PEAK_MIN
}

// multiHyphenateOf: does the talent's career identity span a CAPABLE non-primary discipline?
// True when careerIdentity reports at least one discipline other than the primary with a
// usable OVR (capable ≡ roleOVR ≥ CAPABILITY_OVR_MIN = 60). Perceived OVR only (no hidden data).
function multiHyphenateOf(t: Talent): boolean {
  const ci = careerIdentity(t)
  return ci.disciplines.some((d) => d.discipline !== ci.primary && d.capable)
}

export function assignmentCard(
  state: GameState,
  discipline: Discipline,
  conceptId: string,
  slot: CastSlot | undefined,
  promise: FilmPromise,
  shape: FilmShape,
  talentId: string,
): CandidateCard {
  const t = findTalent(state, talentId)
  if (!t) throw new Error(`assignmentCard: unknown talent "${talentId}"`)
  const concept = findConcept(state, conceptId)
  if (!concept) throw new Error(`assignmentCard: unknown concept "${conceptId}"`)
  const engaged = engagedTalentIds(state)
  const engagedIn = engaged.get(talentId) ?? null

  const cross = crossRoleAssessment(state, talentId, discipline, conceptId, slot, promise, shape)
  const reasons = shapeFitReasons(state, talentId, discipline, conceptId, slot, promise, shape)
  const strengths = reasons.filter((r) => r.kind === 'suits').map((r) => r.text).slice(0, 3)
  const firstConcern = reasons.find((r) => r.kind === 'concern')
  const genreExp = genreExperience(t, discipline, concept.genre, 'perceived')

  return {
    talentId,
    name: t.name,
    authored: t.authored,
    available: engagedIn === null,
    engagedIn,
    discipline,
    slot,
    ovr: cross.ovr,
    ovrTier: cross.tier,
    fit: cross.fit,
    performance: cross.performance,
    bandWidth: cross.bandWidth,
    starPower: t.fame,
    salary: t.salary,
    age: t.age,
    genreExp,
    unproven: cross.unproven,
    strengths,
    weakness: firstConcern ? firstConcern.text : null,
    capableButUnproven: cross.unproven && cross.ovr >= CARD_CAPABILITY_MIN,
    multiHyphenate: multiHyphenateOf(t),
    specialist: specialistInDiscipline(t, discipline),
  }
}

// #5/#6 Greenlight assessment — the LOCKED greenlight-time PERCEIVED assessment, rebuilt
// deterministically from a pre-tick snapshot + the locked Production, for the autopsy to
// diff against actuals. Passthrough to core greenlightAssessment: this adapter only
// assembles the PreTickSnapshot from the pre-tick GameState (never live/mutable state).
export function assessGreenlight(
  preTick: GameState,
  production: Production,
): GreenlightAssessment {
  const talentById: Record<string, Talent> = {}
  for (const t of preTick.talent) talentById[t.id] = t
  const snapshot: PreTickSnapshot = {
    seed: preTick.seed,
    concepts: preTick.concepts,
    releasedFilms: preTick.studio.releasedFilms,
    talentById,
    market: preTick.market,
    standing: preTick.studio.standing,
    era: preTick.era,
  }
  return greenlightAssessment(snapshot, production)
}

// #6 risksMaterialized — map each stored greenlight uncertainty factor to whether it BIT,
// from the LOCKED assessment + the ACTUAL FilmResult. Passthrough to the core helper.
export function assessRisksMaterialized(
  assessment: GreenlightAssessment,
  actualResult: FilmResult,
): RisksMaterialized {
  return risksMaterialized(assessment, actualResult)
}

// ── Autopsy compare — the LOCKED greenlight expectation vs the ACTUAL result ────
// For a film released THIS session (its pre-tick snapshot is retained by the UI), build
// the greenlight-time PERCEIVED assessment (cohesion / fit-by-assignment / execution /
// commercial forecast / strengths / risks) from the LOCKED production, and map which of
// the identified risks MATERIALIZED against the actual FilmResult. Both are passthroughs
// to the core helpers — nothing is recomputed here. Returns null if the production is not
// in the pre-tick active list (a film released inside an imported save has no snapshot).
export type AutopsyCompare = {
  assessment: GreenlightAssessment
  risks: RisksMaterialized
}
export function autopsyCompare(
  preTick: GameState,
  filmResult: FilmResult,
): AutopsyCompare | null {
  const prod = preTick.studio.activeProductions.find((p) => p.id === filmResult.productionId)
  if (!prod) return null // released-in-imported-save: no locked production to assess
  const assessment = assessGreenlight(preTick, prod)
  const risks = assessRisksMaterialized(assessment, filmResult)
  return { assessment, risks }
}

// Re-export the AutopsyCompare's constituent result types (single boundary).
export type { AutopsyCompare as AutopsyCompareView }
