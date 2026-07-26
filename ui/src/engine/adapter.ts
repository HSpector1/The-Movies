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
  personaToExpression,
  // save
  makeSave,
  exportSave,
  importSave,
  loadSave,
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
}

export const CAST_SLOTS: readonly CastSlot[] = ['lead', 'antagonist', 'support']
export const SEGMENT_ORDER: readonly SegmentId[] = ['youngAdult', 'family', 'adult', 'prestige']
export const PROMISE_AXES = ['intimacy', 'tonalWeight', 'kineticEnergy'] as const
export type PromiseAxis = (typeof PROMISE_AXES)[number]

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
// contract-public `skill`. The engine's `actual` persona is NEVER surfaced here.
export type PlayerVisibleTalent = {
  id: string
  name: string
  role: CreativeRole
  age: number
  perceived: Persona // NEVER actual
  skill: number // contract-public known ability
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

// ── Create talent (§10) ──────────────────────────────────────────────────────
export function createTalent(state: GameState, input: AuthoredTalentInput): ActionOutcome {
  try {
    const next = applyActions(state, [{ kind: 'createTalent', talent: input }])
    return { ok: true, next }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

// Contract-disclosed authored starting values (§10 / §16).
export const AUTHORED_START = {
  skill: TUNING.AUTHORED_START_SKILL,
  fame: TUNING.AUTHORED_START_FAME,
}

// ── Advance one week (with pre-tick snapshot for the autopsy) ─────────────────
// BEFORE calling tick we snapshot the pre-tick state so the autopsy can be
// reconstructed (standing, market, concepts, talent, era, and each active
// production incl. its forecastSnapshot). GameState is a plain immutable value the
// core rebuilds by spreads, so the reference we hold is a faithful pre-tick
// snapshot (the core never mutates it in place).
export type AdvanceResult = {
  preTick: GameState
  next: GameState
  released: FilmResult[]
}
export function advanceWeek(state: GameState): AdvanceResult {
  const preTick = state // pre-tick snapshot (immutable; tick returns a fresh state)
  const next = tick(state)
  // Newly-released films = the entries appended to releasedFilms this tick.
  const before = state.studio.releasedFilms.length
  const released = next.studio.releasedFilms.slice(before)
  return { preTick, next, released }
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
export function exportSaveJson(state: GameState): string {
  return exportSave(makeSave(state))
}

export type ImportOutcome =
  | { ok: true; state: GameState }
  | { ok: false; error: string }

export function importSaveJson(json: string): ImportOutcome {
  try {
    const save = importSave(json)
    const loaded = loadSave(save)
    return { ok: true, state: loaded.state }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

// ── Small display helpers (formatting only — no simulation logic) ─────────────
export function personaAsExpression(p: Persona): { intimacy: number; tonalWeight: number; kineticEnergy: number } {
  return personaToExpression(p)
}
