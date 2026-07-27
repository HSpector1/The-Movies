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
  previewCustomTalent,
  previewBalancedTalent,
  balancedBoostDiscipline,
  BALANCED_ARCHETYPES,
  offerForTalent,
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
  migrateToV4,
  importLegacyV2ToV4,
  importLegacyV1ToV4,
  // ── D-11 employment / contracts / roster / freelancer market ──
  beginFounding,
  employmentEngaged,
  employmentStatus,
  isContracted,
  activeContract,
  contractOfferOptions,
  freelancerFee,
  freelancerMarketIds,
  hiringMarketIds,
  weeklyPayroll,
  annualPayroll,
  terminationCost,
  guaranteedComp,
  renewalWindowOpen,
  rosterTalent,
  rosterCoverage,
  foundingMinimumsMet,
  foundingGaps,
  FOUNDING_MINIMUMS,
  // D-11.C newspaper release reveal (pure derivation)
  buildNewspaper,
  criticStars,
  audienceTier,
  NEWSPAPER_MASTHEAD,
  // D-12 financial read models (the SINGLE money source; pure, mirrors the engine)
  financeView,
  activeRunViews,
  commitmentPreview as coreCommitmentPreview,
  periodSummary as corePeriodSummary,
  breakEvenGross,
} from '../../../src/core/index.ts'
import { money, factorLabel } from '../format.ts'
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
  FilmParticipant,
  FilmParticipants,
  Forecast,
  ReceptionInputs,
  AuthoredTalentInput,
  CustomTalentInput,
  BalancedTalentInput,
  ArchetypePreset,
  NewspaperView,
  CriticRating,
  AudienceTier,
  Persona,
  CreativeRole,
  Discipline,
  PotentialTier,
  PerformanceBand,
  SkillBias,
  CareerIdentity,
  DisciplineStanding,
  SaveFile,
  // ── D-11 employment types ──
  Contract,
  LedgerEntry,
  EmploymentStatus,
  FoundingState,
  ContractOffer,
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
  // ── D-12 financial read-model types ──
  FinanceView,
  RunView,
  CommitmentPreview,
  PeriodSummary,
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
  FilmParticipant,
  FilmParticipants,
  Forecast,
  AuthoredTalentInput,
  CustomTalentInput,
  Persona,
  CreativeRole,
  Discipline,
  PotentialTier,
  PerformanceBand,
  SkillBias,
  CareerIdentity,
  DisciplineStanding,
  // D-11 employment types re-exported through the single boundary.
  Contract,
  LedgerEntry,
  EmploymentStatus,
  FoundingState,
  ContractOffer,
  // D-11.C creator + newspaper types
  BalancedTalentInput,
  ArchetypePreset,
  NewspaperView,
  CriticRating,
  AudienceTier,
  // Film Package assessment types re-exported through the single boundary.
  CreativeCohesion,
  AssignmentFit,
  PackageFit,
  ExecutionConfidence,
  ForecastProfitRange,
  GreenlightAssessment,
  RisksMaterialized,
  PackageDelta,
  // D-12 financial read-model types re-exported through the single boundary.
  FinanceView,
  RunView,
  CommitmentPreview,
  PeriodSummary,
}

export const CAST_SLOTS: readonly CastSlot[] = ['lead', 'antagonist', 'support']
export const SEGMENT_ORDER: readonly SegmentId[] = ['youngAdult', 'family', 'adult', 'prestige']
export const PROMISE_AXES = ['intimacy', 'tonalWeight', 'kineticEnergy'] as const
export type PromiseAxis = (typeof PROMISE_AXES)[number]

// The four D-9 disciplines, in the core's fixed display order (acting → writing →
// directing → craft). Re-exported so Hub/profile screens iterate a single source.
export const DISCIPLINES: readonly Discipline[] = DISCIPLINE_ORDER
export { GENRE_ORDER, ROLE_TO_DISCIPLINE, SKILL_ORDER, balancedBoostDiscipline }

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
// A new PLAYER game opens in the founding draft (D-11.2): generateWorld builds the
// employment-free world, beginFounding selects the bounded applicant pool and seeds
// the recruitment fund. The player hires an initial roster, then founds the studio.
export function newGame(seed: string): GameState {
  return beginFounding(generateWorld(seed))
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

// Committed TALENT cost of a package at greenlight. Under D-11 (employment engaged),
// contracted talent cost nothing at greenlight (they are on weekly payroll) and each
// freelancer costs a one-film fee — so this sums assignmentProjectCost per assigned
// id (0 for contracted, freelancerFee for freelancers). In the legacy open-pool mode
// it sums per-production salaries (D-1). This is the "salaries" input the profit
// range and the Budget step read, so the break-even reflects real project cost.
export function salarySum(state: GameState, pkg: DraftPackageIds): number {
  let total = 0
  total += assignmentProjectCost(state, pkg.writerId)
  total += assignmentProjectCost(state, pkg.directorId)
  for (const slot of CAST_SLOTS) {
    const id = pkg.cast[slot]
    if (id) total += assignmentProjectCost(state, id)
  }
  for (const cid of pkg.craftIds ?? []) total += assignmentProjectCost(state, cid)
  return total
}

// Total committed cost at greenlight = negative + marketing + Σ committed talent cost.
// (D-1 in legacy mode; D-11.10 freelancer-fee economics when employment is engaged.)
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
  // D-12: match applyGreenlight — saturate fame→opening reach when the economy is engaged.
  return computeForecast(
    inp,
    {
      seed: state.seed,
      productionId: predictedProductionId(state),
      directorId: pkg.directorId,
      releasedFilms: state.studio.releasedFilms,
      concepts: state.concepts,
    },
    employmentEngaged(state),
  )
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

// ── D-11.A Full Custom creation ──────────────────────────────────────────────
// Execute the Full-Custom create (engine validates/clamps; errors surface as DATA).
export function createCustomTalent(state: GameState, input: CustomTalentInput): ActionOutcome {
  try {
    const next = applyActions(state, [{ kind: 'createCustomTalent', talent: input }])
    return { ok: true, next }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

// Live preview for the Full-Custom editor: OVR is DERIVED from the edited skills (never
// an input), and the contract terms are estimated from a preview talent that is NOT yet
// in the world. Fit is deliberately absent (film/assignment-dependent, D-11.A A3).
export type CustomOvrPreview = { discipline: Discipline; label: string; ovr: number; tier: string; isPrimary: boolean }
export type CustomTalentPreview = {
  primaryDiscipline: Discipline
  disciplines: CustomOvrPreview[]
  offers: ContractOffer[] // estimated 1/2/3/4-year offers (salary demand + signing bonus)
}
export function customTalentPreview(state: GameState, input: CustomTalentInput): CustomTalentPreview {
  const t = previewCustomTalent(input, state.seed)
  const primary = primaryDiscipline(t.role)
  const disciplines = DISCIPLINE_ORDER.map((d) => {
    const ovr = roleOVR(t, d)
    return { discipline: d, label: DISCIPLINE_LABEL[d], ovr, tier: roleTier(ovr), isPrimary: d === primary }
  })
  const offers = TUNING.CONTRACT_TERM_OPTIONS.map((term) =>
    offerForTalent(state.seed, t, term, state.market.tick),
  )
  return { primaryDiscipline: primary, disciplines, offers }
}

// ── D-11.C Balanced-Career specialization creation ───────────────────────────
// The archetype presets (their authoritative baseline profiles) for the creator UI.
export function balancedArchetypes(): readonly ArchetypePreset[] {
  return BALANCED_ARCHETYPES
}
export const SPECIALIZATION_POINTS = TUNING.BALANCED_CREATOR_SPECIALIZATION_POINTS
export const BALANCED_SKILL_FLOOR = TUNING.BALANCED_CREATOR_SKILL_FLOOR

export function createBalancedTalent(state: GameState, input: BalancedTalentInput): ActionOutcome {
  try {
    const next = applyActions(state, [{ kind: 'createBalancedTalent', talent: input }])
    return { ok: true, next }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

// Points spent across skills + genre in a Balanced allocation.
function balancedPointsUsed(input: BalancedTalentInput): number {
  let used = 0
  const sk = input.allocation.skills
  if (sk) for (const d of DISCIPLINE_ORDER) for (const v of sk[d] ?? []) used += Math.max(0, v)
  const ge = input.allocation.genre
  if (ge) for (const d of DISCIPLINE_ORDER) {
    const row = ge[d]
    if (row) for (const g of GENRE_ORDER) used += Math.max(0, row[g] ?? 0)
  }
  return used
}

// D-11.C (percentile amendment) — a created talent's RELATIVE STANDING within the current
// world's working-age, signable, matching-primary-profession population (the benchmark the
// calibration uses). Percentile = fraction of that population with a lower primary OVR.
export function disciplineOVRPercentile(state: GameState, discipline: Discipline, ovr: number): number {
  const pop = state.talent
    .filter((t) => primaryDiscipline(t.role) === discipline)
    .map((t) => roleOVR(t, discipline))
  if (pop.length === 0) return 0
  const below = pop.filter((v) => v < ovr).length
  return Math.round((below / pop.length) * 100)
}
// Plain-language standing tier from a percentile (approximate; a sampled estimate).
export function standingTier(percentile: number): string {
  if (percentile < 15) return 'Raw Prospect'
  if (percentile < 35) return 'Developmental Professional'
  if (percentile < 55) return 'Capable Working Talent'
  if (percentile < 75) return 'Solid Professional'
  if (percentile < 90) return 'Established Professional'
  if (percentile < 97) return 'Major Talent'
  return 'Elite Talent'
}

// Live Balanced preview: derived OVRs (never an input), estimated contract offers, the
// specialization-point accounting, and the player-facing RELATIVE STANDING (percentile +
// tier) within the working population. Fit is deliberately absent (film-dependent).
export type BalancedTalentPreview = {
  primaryDiscipline: Discipline
  disciplines: CustomOvrPreview[]
  offers: ContractOffer[]
  pointsUsed: number
  pointsRemaining: number
  primaryOVR: number
  primaryPercentile: number
  standing: string
}
export function balancedTalentPreview(state: GameState, input: BalancedTalentInput): BalancedTalentPreview {
  const t = previewBalancedTalent(input, state.seed)
  const primary = primaryDiscipline(t.role)
  const disciplines = DISCIPLINE_ORDER.map((d) => {
    const ovr = roleOVR(t, d)
    return { discipline: d, label: DISCIPLINE_LABEL[d], ovr, tier: roleTier(ovr), isPrimary: d === primary }
  })
  const offers = TUNING.CONTRACT_TERM_OPTIONS.map((term) =>
    offerForTalent(state.seed, t, term, state.market.tick),
  )
  const pointsUsed = balancedPointsUsed(input)
  const primaryOVR = roleOVR(t, primary)
  const primaryPercentile = disciplineOVRPercentile(state, primary, primaryOVR)
  return {
    primaryDiscipline: primary,
    disciplines,
    offers,
    pointsUsed,
    pointsRemaining: SPECIALIZATION_POINTS - pointsUsed,
    primaryOVR,
    primaryPercentile,
    standing: standingTier(primaryPercentile),
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

// ── D-12 financial read models (thin selectors over the pure core economyView) ─
// The UI reads money ONLY through these — never recomputing a formula. Each wraps a
// pure core function (financeView / activeRunViews / commitmentPreview / periodSummary).
export function financeCard(state: GameState): FinanceView {
  return financeView(state)
}
export function theatricalRuns(state: GameState): RunView[] {
  return activeRunViews(state)
}
// The Studio Revenue a released film has earned / will earn for the studio (share × total
// gross) — read off its theatrical run, uniformly for active / completed / legacy runs.
// null only for a legacy film with no run record at all (pre-D-12 imported save).
export function studioRevenueForFilm(state: GameState, productionId: string): number | null {
  const run = state.theatricalRuns.find((r) => r.productionId === productionId)
  if (!run) return null
  return run.weeklyGross.reduce((a, b) => a + b, 0) * run.studioShare
}
export function commitmentPreview(state: GameState, amount: number): CommitmentPreview {
  return coreCommitmentPreview(state, amount)
}
// Break-even theatrical gross for a committed cost (Studio Revenue = share × gross).
export { breakEvenGross }

// ── D-12 Sim to Next Event (contract §18) ──────────────────────────────────────
// Advance week-by-week through the REAL engine (never editing the week number), stopping
// AFTER the tick in which a blocking event occurs: a film releases, a theatrical run ends,
// a contract expires or enters its renewal window, or cash crosses below zero. Ordinary
// weekly earnings accrue silently and are reported as one aggregate `summary` (periodSummary
// over the ticks processed). A reloaded skip equals continuous play because every step is a
// plain `tick`. `preTick` is the state just before the STOPPING tick, so a stop-on-release
// hands off to the identical autopsy/development path as a single Advance (the stop tick is
// exactly one tick after `preTick`).
export type SimStopReason = 'release' | 'runCompleted' | 'contractExpired' | 'renewalWindow' | 'cashNegative' | 'limit'
export type SimResult = {
  preTick: GameState // state immediately BEFORE the stopping tick (release autopsy/development)
  next: GameState // final state after the sim
  released: FilmResult[] // films released on the stopping tick (empty unless stopReason==='release')
  fromWeek: number
  toWeek: number
  weeks: number
  stopReason: SimStopReason
  summary: PeriodSummary
}
const SIM_CAP = 260 // backstop; a studio with a production always releases well before this

export function advanceToNextEvent(state: GameState): SimResult {
  const fromWeek = state.market.tick
  let cur = state
  let preStop = state
  let released: FilmResult[] = []
  let stopReason: SimStopReason = 'limit'
  for (let i = 0; i < SIM_CAP; i++) {
    const before = cur
    const beforeReleases = before.studio.releasedFilms.length
    const beforeContracts = before.contracts.length
    const beforeCompleted = before.theatricalRuns.filter((r) => r.status === 'completed').length
    const beforeRenewals = before.contracts.filter((c) => renewalWindowOpen(c, before.market.tick)).length
    const after = tick(before, { develop: true })
    cur = after
    // Stop-condition checks on the post-tick state (the FIRST that fires wins).
    const newReleases = after.studio.releasedFilms.slice(beforeReleases)
    if (newReleases.length > 0) {
      stopReason = 'release'
      released = newReleases
      preStop = before
      break
    }
    if (after.studio.cash < 0 && before.studio.cash >= 0) {
      stopReason = 'cashNegative'
      preStop = before
      break
    }
    if (after.theatricalRuns.filter((r) => r.status === 'completed').length > beforeCompleted) {
      stopReason = 'runCompleted'
      preStop = before
      break
    }
    if (after.contracts.length < beforeContracts) {
      stopReason = 'contractExpired'
      preStop = before
      break
    }
    if (after.contracts.filter((c) => renewalWindowOpen(c, after.market.tick)).length > beforeRenewals) {
      stopReason = 'renewalWindow'
      preStop = before
      break
    }
  }
  const toWeek = cur.market.tick
  // Ledger entries + releaseTick are stamped with the PRE-increment week, so the ticks
  // processed span weeks [fromWeek, toWeek − 1] (tick.ts:114/437).
  const summary = corePeriodSummary(cur, fromWeek, Math.max(fromWeek, toWeek - 1))
  return { preTick: preStop, next: cur, released, fromWeek, toWeek, weeks: toWeek - fromWeek, stopReason, summary }
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
  // D-11.A — the film's OWN immutable participant record (frozen at greenlight). Present
  // for films made in an engaged game; absent for legacy/M0A films (autopsy then omits
  // the participant list). NEVER reflects current roster/employment/other films.
  participants?: FilmParticipants
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
  studioRevenue: number // D-12: blended rental share of gross (what the studio banks); profit = this − cost
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

  const committedCost = productionCommittedCost(preTick, prod)
  // D-12: the studio banks its blended rental SHARE of the gross (a UI session release is always
  // the engaged path, so run.totalStudioRevenue === gross × STUDIO_RENTAL_BLENDED). Profit and ROI
  // are on Studio Revenue, not the full box office.
  const studioRevenue = filmResult.boxOffice.total * TUNING.STUDIO_RENTAL_BLENDED
  const profit = studioRevenue - committedCost

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
    // D-11.A — the film's OWN frozen participants (prefer the released record; fall back
    // to the locked production's captured record). Immutable; never current state.
    ...(filmResult.participants ?? prod.participants
      ? { participants: filmResult.participants ?? prod.participants }
      : {}),
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
    studioRevenue, // D-12: blended rental share of gross (what the studio actually banks)
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

// The committed cost of an already-greenlit production — the EXACT amount debited,
// read from the ledger (production + freelancerFee entries for this production, which
// already include negative + marketing). Truthful under both D-11 (contracted talent
// cost 0 at greenlight; freelancers a one-film fee) and legacy D-1 (negative +
// marketing + salaries in one production entry). Falls back to budget + salaries for a
// pre-existing production carried in from a converted legacy save (no ledger entries).
function productionCommittedCost(state: GameState, prod: Production): number {
  const fromLedger = state.ledger
    .filter((e) => e.productionId === prod.id && (e.kind === 'production' || e.kind === 'freelancerFee'))
    .reduce((a, e) => a - e.amount, 0)
  if (fromLedger > 0) return fromLedger
  return prod.budget.negative + prod.budget.marketing + salarySumForProduction(state, prod)
}

// Remaining weeks of an active production, for the dashboard.
export function remainingWeeks(prod: Production): number {
  return prod.remainingTicks
}

// ── Saves ────────────────────────────────────────────────────────────────────
// New games save as the D-11 SaveFileV3 (makeSave === makeSaveV3). The V3 envelope's
// state carries the employment surface (founding/contracts/ledger/freeAgents). Legacy
// V2 and V1 imports are converted deterministically to V3 (originals never touched).
export function exportSaveJson(state: GameState): string {
  return exportSave(makeSave(state))
}

export type ImportOutcome =
  | { ok: true; state: GameState; converted: boolean }
  | { ok: false; error: string }

// Import a save. Accepts V3 (current), V2 (→ convertV2ToV3), and V1 (→ V2 → V3), all
// deterministic. `converted` tells the caller a legacy save was upgraded so the UI can
// inform the player — their original file is never overwritten (a fresh V3 is returned).
export function importSaveJson(json: string): ImportOutcome {
  try {
    const save: SaveFile = importSave(json)
    // D-12: migrate any known version up to the live V4 shape (adds theatricalRuns; for a
    // migrated V3, released films become legacyCompleted runs — recorded, never repaid).
    const converted = save.saveVersion !== 4
    return { ok: true, state: migrateToV4(save).state, converted }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

// Explicit "Import a legacy V2 save" affordance (D-11.16). Converts a V2 JSON string
// deterministically to a V3 GameState. Rejects non-V2 input as DATA. Original untouched.
export function importLegacyV2SaveJson(json: string): ImportOutcome {
  try {
    return { ok: true, state: importLegacyV2ToV4(json).state, converted: true }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

// Explicit "Import a legacy V1 save" affordance (D-9.15/D-11.16). Converts a V1 JSON
// string deterministically to a V3 GameState (via V2). Rejects non-V1 input as DATA.
export function importLegacyV1SaveJson(json: string): ImportOutcome {
  try {
    return { ok: true, state: importLegacyV1ToV4(json).state, converted: true }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// D-11 — Studio Employment, Contracts, Roster, Freelancer Market
// Action wrappers (validation surfaced as DATA) + read-only selectors/cards. Every
// value comes from the PUBLIC engine employment helpers; nothing is recomputed here.
// ═══════════════════════════════════════════════════════════════════════════════

// ── actions ──
export function foundStudioAction(state: GameState): ActionOutcome {
  try {
    return { ok: true, next: applyActions(state, [{ kind: 'foundStudio' }]) }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}
export function signContractAction(state: GameState, talentId: string, termWeeks: number): ActionOutcome {
  try {
    return { ok: true, next: applyActions(state, [{ kind: 'signContract', talentId, termWeeks }]) }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}
export function renewContractAction(state: GameState, talentId: string, termWeeks: number): ActionOutcome {
  try {
    return { ok: true, next: applyActions(state, [{ kind: 'renewContract', talentId, termWeeks }]) }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}
export function releaseTalentAction(state: GameState, talentId: string): ActionOutcome {
  try {
    return { ok: true, next: applyActions(state, [{ kind: 'releaseTalent', talentId }]) }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

// ── engagement / founding selectors ──
export function isEmploymentEngaged(state: GameState): boolean {
  return employmentEngaged(state)
}
export function selectFounding(state: GameState): FoundingState | null {
  return state.founding
}
export function foundingBudgetRemaining(state: GameState): number {
  const f = state.founding
  return f ? f.budget - f.spentBonus : 0
}
export function canFoundStudio(state: GameState): boolean {
  return state.founding !== null && foundingMinimumsMet(state)
}
export type CoverageRow = { role: CreativeRole; label: string; count: number; min: number; met: boolean }
const ROLE_LABEL: Record<CreativeRole, string> = {
  actor: 'Actors',
  director: 'Directors',
  writer: 'Writers',
  craft: 'Production/Craft Leads',
}
export function foundingCoverage(state: GameState): CoverageRow[] {
  const cov = rosterCoverage(state)
  const gaps = foundingGaps(state)
  return (['actor', 'director', 'writer', 'craft'] as CreativeRole[]).map((role) => ({
    role,
    label: ROLE_LABEL[role],
    count: cov[role],
    min: FOUNDING_MINIMUMS[role],
    met: gaps[role] === 0,
  }))
}

// ── employment info (status + contract + offers + fee) for one talent ──
export type ContractInfo = {
  annualSalary: number
  weeklySalary: number
  signingBonus: number
  startWeek: number
  endWeekExclusive: number
  termWeeks: number
  remainingWeeks: number
  terminationCost: number
  renewalOpen: boolean
}
export type EmploymentInfo = {
  status: EmploymentStatus
  contract: ContractInfo | null
  offerOptions: ContractOffer[] // populated when signable (founding pool / hiring market)
  freelancerFee: number | null // populated when an available freelancer
}
export function employmentInfo(state: GameState, talentId: string): EmploymentInfo {
  const week = state.market.tick
  const status = employmentStatus(state, talentId)
  const c = activeContract(state, talentId)
  const contract: ContractInfo | null = c
    ? {
        annualSalary: c.annualSalary,
        weeklySalary: Math.round(c.annualSalary / TUNING.TICKS_PER_YEAR),
        signingBonus: c.signingBonus,
        startWeek: c.startWeek,
        endWeekExclusive: c.endWeekExclusive,
        termWeeks: c.termWeeks,
        remainingWeeks: Math.max(0, c.endWeekExclusive - week),
        terminationCost: terminationCost(c, week),
        renewalOpen: renewalWindowOpen(c, week),
      }
    : null
  const t = findTalent(state, talentId)
  const signable =
    status === 'freeAgent' ||
    (state.founding !== null && state.founding.applicantIds.includes(talentId) && c === undefined)
  const offerOptions = signable ? contractOfferOptions(state, talentId) : []
  const fee = status === 'availableFreelancer' && t ? freelancerFee(t) : null
  return { status, contract, offerOptions, freelancerFee: fee }
}

// ── employment cards (a rich TalentProfile + employment info) ──
export type EmploymentCard = { profile: TalentProfile; employment: EmploymentInfo }
function employmentCard(state: GameState, id: string): EmploymentCard {
  return { profile: talentProfile(state, id)!, employment: employmentInfo(state, id) }
}

// The studio roster (contracted talent), stable order.
export function rosterCards(state: GameState): EmploymentCard[] {
  return rosterTalent(state).map((t) => employmentCard(state, t.id))
}
// The founding applicant pool (draft), in draft order.
export function foundingApplicantCards(state: GameState): EmploymentCard[] {
  const f = state.founding
  if (f === null) return []
  return f.applicantIds.map((id) => employmentCard(state, id))
}
// The rotating hiring (contract) market — free agents + fresh signable talent.
export function hiringMarketCards(state: GameState): EmploymentCard[] {
  return hiringMarketIds(state).map((id) => employmentCard(state, id))
}
// The rotating freelancer market (available freelancers).
export function freelancerMarketCards(state: GameState): EmploymentCard[] {
  return freelancerMarketIds(state).map((id) => employmentCard(state, id))
}

// ── Cycle 4A (D-11.D): founding applicant DISCOVERY — sort / filter / progress ─
// A restrained, sortable/filterable read model over the founding pool. Every field is
// derived from the EXISTING profile/employment adapters (no new sim, no new state, no
// per-skill exposure). Pure functions so sorting/filtering truthfulness is unit-testable.
const POTENTIAL_RANK: Record<PotentialTier, number> = Object.fromEntries(
  AUTHORED_POTENTIAL_TIERS.map((t, i) => [t, i]),
) as Record<PotentialTier, number>

export type FoundingSortKey =
  | 'ovr'
  | 'fame'
  | 'potential'
  | 'workEthic'
  | 'salary'
  | 'signingBonus'
  | 'value'
  | 'age'
export type FoundingProfileFilter = 'any' | 'specialist' | 'multiHyphenate'
export type FoundingFilters = {
  minOVR: number
  potential: PotentialTier | 'any' // primary Career Potential at least this rank
  maxSalary: number | null
  minFame: number
  profile: FoundingProfileFilter
  createdOnly: boolean
  affordableOnly: boolean
}
export const FOUNDING_FILTERS_NONE: FoundingFilters = {
  minOVR: 0,
  potential: 'any',
  maxSalary: null,
  minFame: 0,
  profile: 'any',
  createdOnly: false,
  affordableOnly: false,
}
export type FoundingApplicantRow = {
  card: EmploymentCard
  id: string
  name: string
  role: CreativeRole
  signed: boolean
  ovr: number
  ovrTier: string
  fame: number
  potentialTier: PotentialTier
  potentialRank: number
  potentialHigh: number
  workEthic: number
  workEthicLabel: string
  annualSalary: number // representative ask (offers share annual salary; cheapest bonus's row)
  signingBonus: number // cheapest offer's signing bonus (the recruitment-fund cost to sign)
  age: number
  authored: boolean
  multiHyphenate: boolean
  affordable: boolean // cheapest signing bonus ≤ remaining recruitment fund
  value: number // relevant OVR per $M annual ask (documented heuristic; higher = better value)
  standing: string // approximate market standing (percentile tier)
  standingPct: number
  topStrengths: string[] // up to 2 qualitative strengths from STORED signals (no raw skills)
  primaryConcern: string | null
}

function assignmentText(a: { role: string; slot?: string | null }): string {
  return a.slot ? `${a.role} (${a.slot})` : a.role
}
function foundingRowOf(state: GameState, card: EmploymentCard, fundRemaining: number): FoundingApplicantRow {
  const p = card.profile
  const primary = p.disciplines.find((d) => d.isPrimary) ?? p.disciplines[0]!
  const pt = primary.potentialTier as PotentialTier // DisciplineSummary types it as a string
  // Cheapest offer = the smallest signing bonus (its annual salary is the recurring ask).
  const cheapest = card.employment.offerOptions.reduce<ContractOffer | null>(
    (best, o) => (best === null || o.signingBonus < best.signingBonus ? o : best),
    null,
  )
  const annualSalary = cheapest?.annualSalary ?? 0
  const signingBonus = cheapest?.signingBonus ?? 0
  const t = findTalent(state, p.id)
  const multiHyphenate = t ? multiHyphenateOf(t) : false
  const standingPct = disciplineOVRPercentile(state, primary.discipline, primary.ovr)
  const value = annualSalary > 0 ? +(primary.ovr / (annualSalary / 1_000_000)).toFixed(1) : primary.ovr

  // Qualitative strengths / concern — from STORED profile signals only (restrained; no skills).
  const strengths: string[] = []
  if (primary.ovr >= 60) strengths.push(`Strong ${primary.label.toLowerCase()} (${primary.tier})`)
  if (p.fame >= 40) strengths.push('Recognized name')
  if (POTENTIAL_RANK[pt] >= POTENTIAL_RANK.HighUpside) strengths.push('High ceiling')
  if (p.workEthic >= 75) strengths.push('Strong work ethic')
  if (multiHyphenate) strengths.push('Multi-hyphenate')

  let primaryConcern: string | null = null
  if (primary.unproven) primaryConcern = 'Unproven — no credits yet'
  else if (p.fame < 10) primaryConcern = 'Little audience draw'
  else if (p.workEthic < 40) primaryConcern = 'Low work ethic'
  else if (POTENTIAL_RANK[pt] <= POTENTIAL_RANK.Limited) primaryConcern = 'Limited ceiling'
  else if (p.age >= 55) primaryConcern = 'Late career'

  return {
    card,
    id: p.id,
    name: p.name,
    role: p.role,
    signed: card.employment.status === 'contracted',
    ovr: primary.ovr,
    ovrTier: primary.tier,
    fame: p.fame,
    potentialTier: pt,
    potentialRank: POTENTIAL_RANK[pt],
    potentialHigh: primary.potentialHigh,
    workEthic: p.workEthic,
    workEthicLabel: p.workEthicLabel,
    annualSalary,
    signingBonus,
    age: p.age,
    authored: p.authored,
    multiHyphenate,
    affordable: signingBonus <= fundRemaining,
    value,
    standing: standingTier(standingPct),
    standingPct,
    topStrengths: strengths.slice(0, 2),
    primaryConcern,
  }
}

// All founding applicants (optionally one profession), enriched.
export function foundingApplicantRows(state: GameState, role?: CreativeRole): FoundingApplicantRow[] {
  const fund = foundingBudgetRemaining(state)
  return foundingApplicantCards(state)
    .filter((c) => role === undefined || c.profile.role === role)
    .map((c) => foundingRowOf(state, c, fund))
}

// Pure sort. Descending for quality keys, ascending for age/salary/signingBonus. A
// deterministic id tiebreak keeps ordering stable (never fame-alone).
const FOUNDING_SORT_ASC: Record<FoundingSortKey, boolean> = {
  ovr: false,
  fame: false,
  potential: false,
  workEthic: false,
  value: false,
  salary: true,
  signingBonus: true,
  age: true,
}
export function sortFoundingRows(rows: FoundingApplicantRow[], key: FoundingSortKey): FoundingApplicantRow[] {
  const val = (r: FoundingApplicantRow): number => {
    switch (key) {
      case 'ovr':
        return r.ovr
      case 'fame':
        return r.fame
      case 'potential':
        return r.potentialRank * 1000 + r.potentialHigh
      case 'workEthic':
        return r.workEthic
      case 'salary':
        return r.annualSalary
      case 'signingBonus':
        return r.signingBonus
      case 'value':
        return r.value
      case 'age':
        return r.age
    }
  }
  const asc = FOUNDING_SORT_ASC[key]
  return [...rows].sort((a, b) => {
    const d = asc ? val(a) - val(b) : val(b) - val(a)
    return d !== 0 ? d : a.id < b.id ? -1 : a.id > b.id ? 1 : 0
  })
}

// Pure filter. Applied uniformly (profession is already narrowed by foundingApplicantRows).
export function filterFoundingRows(rows: FoundingApplicantRow[], f: FoundingFilters): FoundingApplicantRow[] {
  return rows.filter((r) => {
    if (r.ovr < f.minOVR) return false
    if (f.potential !== 'any' && r.potentialRank < POTENTIAL_RANK[f.potential]) return false
    if (f.maxSalary !== null && r.annualSalary > f.maxSalary) return false
    if (r.fame < f.minFame) return false
    if (f.profile === 'specialist' && r.multiHyphenate) return false
    if (f.profile === 'multiHyphenate' && !r.multiHyphenate) return false
    if (f.createdOnly && !r.authored) return false
    if (f.affordableOnly && !r.affordable) return false
    return true
  })
}

// Per-profession founding progress (count / min / met / optional-extra) + the next
// still-incomplete profession, for the tab flow.
export type FoundingProgress = {
  role: CreativeRole
  label: string
  count: number
  min: number
  met: boolean
  extra: number
}
export function foundingProgress(state: GameState): FoundingProgress[] {
  return foundingCoverage(state).map((c) => ({
    role: c.role,
    label: c.label,
    count: c.count,
    min: c.min,
    met: c.met,
    extra: Math.max(0, c.count - c.min),
  }))
}
export function nextIncompleteProfession(state: GameState): CreativeRole | null {
  const p = foundingProgress(state).find((x) => !x.met)
  return p ? p.role : null
}

// ── payroll & runway summary (D-11.19) ──
export type PayrollSummary = {
  cash: number
  weeklyPayroll: number
  annualPayroll: number
  signingBonusesPaid: number // recruitment fund + operating bonuses, informational
  projectedObligations: number // Σ remaining guaranteed salary across active contracts
  upcomingRenewals: number // contracts currently in their renewal window
  runwayWeeks: number | null // cash / weeklyPayroll (null = no payroll → unbounded)
  contractCount: number
}
export function payrollSummary(state: GameState): PayrollSummary {
  const week = state.market.tick
  const weekly = weeklyPayroll(state)
  let projected = 0
  let renewals = 0
  for (const c of state.contracts) {
    projected += guaranteedComp(c, week)
    if (renewalWindowOpen(c, week)) renewals += 1
  }
  const operatingBonuses = state.ledger
    .filter((e) => e.kind === 'signingBonus')
    .reduce((a, e) => a - e.amount, 0)
  const foundingBonuses = state.founding ? state.founding.spentBonus : 0
  return {
    cash: state.studio.cash,
    weeklyPayroll: weekly,
    annualPayroll: annualPayroll(state),
    signingBonusesPaid: operatingBonuses + foundingBonuses,
    projectedObligations: projected,
    upcomingRenewals: renewals,
    runwayWeeks: weekly > 0 ? Math.floor(state.studio.cash / weekly) : null,
    contractCount: state.contracts.length,
  }
}

// ── assembly candidate sources (D-11.11) ──
// When employment is engaged, film assembly draws from the studio roster first and
// available freelancers second; unavailable global talent is excluded. When NOT
// engaged (a converted legacy save that never signed), fall back to the global pool.
export type FreelancerCandidate = { talent: PlayerVisibleTalent; fee: number }
export function studioPool(state: GameState, role: CreativeRole): PlayerVisibleTalent[] {
  if (!employmentEngaged(state)) return talentByRole(state, role)
  const engaged = engagedTalentIds(state)
  return rosterTalent(state)
    .filter((t) => t.role === role)
    .map((t) => toPlayerVisible(t, engaged))
}
export function freelancerPool(state: GameState, role: CreativeRole): FreelancerCandidate[] {
  if (!employmentEngaged(state)) return []
  const engaged = engagedTalentIds(state)
  return freelancerMarketIds(state)
    .map((id) => findTalent(state, id)!)
    .filter((t) => t.role === role)
    .map((t) => ({ talent: toPlayerVisible(t, engaged), fee: freelancerFee(t) }))
}
// The per-assignment cost of a chosen talent: 0 if contracted (payroll), else the
// freelancer fee (a direct project cost). Used by the Budget step to show real cost.
export function assignmentProjectCost(state: GameState, talentId: string): number {
  if (!employmentEngaged(state)) {
    const t = findTalent(state, talentId)
    return t ? t.salary : 0 // legacy open-pool: salary is the per-production cost (D-1)
  }
  if (isContracted(state, talentId)) return 0
  const t = findTalent(state, talentId)
  return t ? freelancerFee(t) : 0
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
    // D-12: same economy gate as the greenlight-locked forecast (actions.ts) and realized
    // release — the live Commercial-Outlook opening uses the SAME §7 Hill fame path.
    saturateFame: employmentEngaged(state),
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

// ── Cycle 4A (D-11.D): the ACCESSIBLE default autopsy ────────────────────────
// A concise, plain-language read of a released film, synthesized ENTIRELY from the
// already-computed AutopsyView + the locked AutopsyCompare. Every line maps to a stored
// mechanic (identified strengths, materialized risks, Fit strongest/weakest, cohesion,
// forecast delta, promise mismatch, audience score) — no invented recommendations. The
// full technical report is preserved verbatim under "Advanced Analysis"; this is only the
// default surface, readable in a few seconds by a non-expert.
const AUDIENCE_REACTION: Record<ReturnType<typeof audienceTier>, string> = {
  hated: 'Audiences hated it',
  disliked: 'Audiences disliked it',
  divided: 'Audiences were divided',
  liked: 'Audiences liked it',
  loved: 'Audiences loved it',
}
export type AutopsyGrade =
  | 'Good film, good investment'
  | 'Creative success, commercial failure'
  | 'Commercial hit, critical disappointment'
  | 'Weak film, poor investment'
export type AccessibleAutopsy = {
  conceptTitle: string
  criticScore: number
  criticStars: number
  audienceLabel: string
  revenue: number
  profit: number
  profitable: boolean
  expectedCritic: number
  expectedTotal: number
  whatWorked: string[]
  whatHurt: string[]
  biggestSurprise: string
  lessons: string[]
  grade: AutopsyGrade
}
export function accessibleAutopsy(view: AutopsyView, compare: AutopsyCompare | null): AccessibleAutopsy {
  const profit = view.profit
  const profitable = profit >= 0
  const critic = view.criticScore
  const total = view.boxOffice.total
  const expCritic = view.forecast.expectedCriticScore
  const expTotal = view.forecast.expectedTotal
  const round0 = (n: number) => Math.round(n)
  // Same two REAL axes the greenlight verdict uses (film quality × investment), in the
  // owner's decision-grade vocabulary. cohesion ≥ 0.5 OR critic ≥ 55 = a "good film".
  const filmStrong = view.cohesion >= 0.5 || critic >= 55
  const grade: AutopsyGrade = filmStrong
    ? profitable
      ? 'Good film, good investment'
      : 'Creative success, commercial failure'
    : profitable
      ? 'Commercial hit, critical disappointment'
      : 'Weak film, poor investment'

  const fit = compare?.assessment.fit
  const strongest = fit?.strongest
  const weakest = fit?.weakest

  const worked: string[] = []
  if (critic >= 70) worked.push(`Critics responded well — a ${round0(critic)}/100 review.`)
  if (view.cohesion >= 0.6) worked.push('The film felt coherent — its makers pulled in the same direction.')
  if (strongest && strongest.fit >= 65)
    worked.push(`${strongest.talentName} was an excellent fit as ${assignmentText(strongest)}.`)
  if (total > expTotal * 1.1) worked.push('It outperformed its box-office forecast.')
  if (profitable && profit >= 3_000_000) worked.push(`It turned a healthy profit of ${money(profit)}.`)
  for (const s of compare?.assessment.strengths ?? []) {
    if (worked.length >= 3) break
    worked.push(s)
  }

  const hurt: string[] = []
  if (critic < 45) hurt.push(`Critics were unimpressed — a ${round0(critic)}/100 review.`)
  if (view.cohesion < 0.4) hurt.push('The film pulled in different directions — low creative cohesion.')
  if (weakest && weakest.fit < 45)
    hurt.push(`${weakest.talentName} was a stretch as ${assignmentText(weakest)}.`)
  if (view.promiseMismatch >= 0.5) hurt.push('The delivered film drifted from what was promised.')
  if (!profitable) hurt.push(`It lost ${money(Math.abs(profit))} against its committed cost.`)
  else if (total < expTotal * 0.9) hurt.push('It came in under its box-office forecast.')
  for (const r of compare?.risks.risks ?? []) {
    if (hurt.length >= 3) break
    if (r.materialized) hurt.push(`${factorLabel(r.factor)}: ${r.detail}`)
  }

  const boxRel = expTotal > 0 ? Math.abs(total - expTotal) / expTotal : 0
  const criticRel = expCritic > 0 ? Math.abs(critic - expCritic) / expCritic : 0
  let biggestSurprise: string
  if (boxRel >= criticRel && boxRel > 0.12) {
    biggestSurprise =
      total >= expTotal
        ? `Box office beat the forecast — ${money(total)} vs an expected ${money(expTotal)}.`
        : `Box office fell short — ${money(total)} vs an expected ${money(expTotal)}.`
  } else if (criticRel > 0.1) {
    biggestSurprise =
      critic >= expCritic
        ? `Critics were kinder than expected — ${round0(critic)} vs a forecast ${round0(expCritic)}.`
        : `Critics were harsher than expected — ${round0(critic)} vs a forecast ${round0(expCritic)}.`
  } else {
    biggestSurprise = 'The film landed close to its forecast — no major surprises.'
  }

  const lessons: string[] = []
  if (weakest && weakest.fit < 45)
    lessons.push(`Match talent to the material — ${weakest.talentName}'s Fit was the weak link.`)
  if (view.promiseMismatch >= 0.5) lessons.push('Keep the delivered film close to the promise you market.')
  if (filmStrong && !profitable) lessons.push('A well-made film still has to clear its budget to pay off.')
  if (!filmStrong && profitable)
    lessons.push('Commercial success and critical acclaim are separate outcomes.')
  if (lessons.length === 0)
    lessons.push(
      profitable
        ? 'A disciplined package delivered a sound result.'
        : 'The economics did not work this time — revisit budget or Fit.',
    )

  return {
    conceptTitle: view.conceptTitle,
    criticScore: critic,
    criticStars: criticStars(critic),
    audienceLabel: AUDIENCE_REACTION[audienceTier(view.weightedAudienceScore)],
    revenue: total,
    profit,
    profitable,
    expectedCritic: expCritic,
    expectedTotal: expTotal,
    whatWorked: worked.slice(0, 3),
    whatHurt: hurt.slice(0, 3),
    biggestSurprise,
    lessons: lessons.slice(0, 2),
    grade,
  }
}

// ── D-11.A post-reload film record ────────────────────────────────────────────
// After a save/reload the per-session pre-tick snapshot is gone, so the FULL autopsy
// (which reconstructs reception from the production) cannot run. But the film's
// IMMUTABLE participant record + its result persist on the FilmResult (V3), so we can
// still show WHO made the film and how it did — the identity the owner needs preserved.
// Committed cost is recovered from the persisted ledger. Returns null for legacy films
// with no participant record (autopsy then remains session-only).
export type FilmRecordView = {
  productionId: string
  conceptTitle: string
  participants: FilmParticipants
  criticScore: number
  boxOffice: { opening: number; total: number }
  committedCost: number
  studioRevenue: number // D-12: blended rental share of gross (from the run); full gross for legacy
  profit: number
}
export function filmRecordView(state: GameState, film: FilmResult): FilmRecordView | null {
  if (!film.participants) return null
  const concept = findConcept(state, film.conceptId)
  const committedCost = state.ledger
    .filter((e) => e.productionId === film.productionId && (e.kind === 'production' || e.kind === 'freelancerFee'))
    .reduce((a, e) => a - e.amount, 0)
  // D-12: profit is on Studio Revenue (the run's blended rental share); a pre-D-12 legacy film
  // with no run falls back to full gross.
  const studioRevenue = studioRevenueForFilm(state, film.productionId) ?? film.boxOffice.total
  return {
    productionId: film.productionId,
    conceptTitle: concept?.title ?? film.conceptId,
    participants: film.participants,
    criticScore: film.criticScore,
    boxOffice: film.boxOffice,
    committedCost,
    studioRevenue,
    profit: studioRevenue - committedCost,
  }
}

// ── D-11.C newspaper release reveal ──────────────────────────────────────────
// The film's press clipping, derived ENTIRELY from its persisted record (+ ledger cost
// + concept title + segment shares). Reconstructs identically after save/reload; tied to
// the correct film; immutable to later change. Returns null for a legacy film with no
// participant record. Re-exports the pure core helper `buildNewspaper` via the boundary.
export function releaseNewspaper(state: GameState, film: FilmResult): NewspaperView | null {
  if (film.participants === undefined) return null
  const concept = findConcept(state, film.conceptId)
  const committedCost = state.ledger
    .filter((e) => e.productionId === film.productionId && (e.kind === 'production' || e.kind === 'freelancerFee'))
    .reduce((a, e) => a - e.amount, 0)
  const segmentShares: Record<SegmentId, number> = {} as Record<SegmentId, number>
  for (const s of state.market.segments) segmentShares[s.id] = s.share
  // D-12: the film's ACTUAL Studio Revenue (blended rental share × gross) from its theatrical run.
  const studioRevenue = studioRevenueForFilm(state, film.productionId)
  return buildNewspaper({
    film,
    conceptTitle: concept?.title ?? film.conceptId,
    committedCost,
    segmentShares,
    ...(studioRevenue !== null ? { studioRevenue } : {}),
    week: film.releaseTick,
  })
}
export { criticStars, NEWSPAPER_MASTHEAD }
