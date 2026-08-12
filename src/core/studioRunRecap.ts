// ── D-15 Studio Run Recap (studioRunRecap.ts) ─────────────────────────────────
// A pure, read-only, deterministic explanation of what happened to the studio over a
// run: capital story, film slate, talent development, strategy concentration, current
// position + recovery classification, inflection points, and prioritised warnings.
//
// It reconstructs everything from the live GameState (SaveFileV5.state) — it adds NO
// persistence, mutates NOTHING, advances NO RNG, and NEVER recomputes a film outcome or
// a D-14 career event. Money figures reuse the D-12 economyView math; talent figures
// aggregate the frozen careerEvents ledger. The sim never reads this.
//
// PRESENTATION BOUNDARY: this read-model returns STRUCTURED data (numbers + kinds +
// severities). It does NOT format money or compose player-facing sentences — the React
// screen does that with the shared money()/signed() formatters. (Owner D-15 review:
// "format at the read-model/UI boundary".)
//
// Canonical definitions (docs/D-12-economy-contract.md §3): Studio Revenue = blended
// share of theatrical gross; committed cost = negative + marketing + engaged freelancer
// fees; FILM CONTRIBUTION = Studio Revenue − committed cost (payroll & overhead NOT
// allocated per film, §8).

import type {
  GameState,
  FilmResult,
  TheatricalRun,
  TalentCareerEvent,
  Genre,
  FilmShape,
  Talent,
} from './types.js'
import { resolveShape } from './shape.js'
import { NEGATIVE_BUDGET_MULTIPLIERS, MARKETING_BUDGET_LEVELS } from './grid.js'
import { weeklyPayroll, freelancerFee, economyEngaged } from './employment.js'
import { allocateFixedCosts } from './fixedCostAllocation.js'
import {
  financeTotals,
  weeklyOverhead,
  weeklyBurn,
  runway,
  expectedWeeklyRunRevenue,
  commitmentPreview,
  regimeStudioShare,
} from './economyView.js'

// ── documented recap conventions (not engine invariants) ───────────────────────
/** Break-even band: a film whose |contribution| is within max($25k, 1% of its committed
 *  cost) returned a NEGLIGIBLE result — classified Break-even, not Profit/Loss. Chosen so a
 *  rounded-0%-ROI film (e.g. +$8k on a $10.9M commitment) is not framed as a success, while
 *  a meaningful positive/negative contribution never becomes break-even. */
const BREAKEVEN_ABS = 25_000
const BREAKEVEN_FRACTION = 0.01
/** A talent counted as "productive but under-recognized": meaningful work, little Star Power. */
const LOW_RECOGNITION_MIN_FILMS = 3
const LOW_RECOGNITION_MAX_STARGAIN = 0.5
/** A contributor is "recurring" if they worked on at least this many films. */
const RECURRING_TEAM_MIN_FILMS = 3
/** Star Power deltas within ±this are "negligible" (matches the D-14 audit's ±0.05 band). */
const SP_NEGLIGIBLE_BAND = 0.05
/** "typical recent" film commitment = median of this many most-recent releases. */
const TYPICAL_RECENT_WINDOW = 3
/** A "standard-budget film": the assembly's default budget grid + marketing, neutral shape demand.
 *  Represents "can I make a normal film?" (vs the bare-minimum cheapest greenlightable package). */
const STANDARD_NEG_MULT = 1.0 // NEGATIVE_BUDGET_MULTIPLIERS[1] — the assembly default
const STANDARD_DEMAND = 1.0 // neutral story-shape ambition
const STANDARD_MARKETING = 400_000 // MARKETING_BUDGET_LEVELS[1] — the assembly default
/** A film loss counted as "heavy" for headlines: worse than this × its commitment. */
const HEAVY_LOSS_FRACTION = 0.25
/** How many inflection points to surface by default (bounded, high-value only). */
const MAX_INFLECTION_POINTS = 7

export type FilmContributionClass = 'positive' | 'breakEven' | 'loss'
export type RecoveryPosition =
  | 'healthy'
  | 'constrained'
  | 'severe'
  | 'noNormalProduction'
  | 'incomplete'

/** Break-even band classifier (documented convention above). */
export function classifyContribution(contribution: number, committedCost: number): FilmContributionClass {
  const band = Math.max(BREAKEVEN_ABS, BREAKEVEN_FRACTION * Math.max(0, committedCost))
  if (Math.abs(contribution) <= band) return 'breakEven'
  return contribution > 0 ? 'positive' : 'loss'
}

export type RecapFilm = {
  productionId: string
  title: string
  genre: Genre | null
  releaseWeek: number
  lead: string | null
  committedCost: number | null
  studioRevenue: number | null // credited to date (reconciles with the ledger)
  projectedStudioRevenue: number | null // full-run share × gross (equals credited once completed)
  contribution: number | null // studioRevenue − committedCost (cash basis)
  roi: number | null
  forecastTotal: number | null
  realizedTotal: number
  totalVsForecast: number | null // realized / forecast (1 = on target)
  forecastCritic: number | null
  realizedCritic: number
  audience: number
  runStatus: TheatricalRun['status'] | 'none'
  classification: FilmContributionClass | 'unknown'
  heavyLoss: boolean
  // ── D-17A/T13 — ADDITIVE studio-economic view (Owner ruling R7) ──────────────
  // `contribution` above is unchanged and remains the DIRECT-cost figure (D-12 §3/§8:
  // Studio Revenue − committed cost; payroll and overhead are never folded into it). The
  // three fields below are the labelled MANAGERIAL layer R7 asks for, and they never
  // silently replace it.
  /** whole dollars of ACTUAL ledger payroll+overhead attributed to this film's occupancy. */
  allocatedFixedCost: number
  /** weeks of the run so far in which this film occupied the studio (production + run). */
  allocatedWeeks: number
  /** contribution − allocatedFixedCost. null exactly when contribution is null. */
  studioEconomicResult: number | null
  /** how the fixed cost was attributed — per-week pro-rata over the signed ledger. */
  allocationBasis: FixedCostAllocationBasis
}

/** The ONE attribution convention in use (see fixedCostAllocation.ts). Named so a screen can
 *  state its assumption, and so a future convention cannot arrive unlabelled. */
export type FixedCostAllocationBasis = 'ledgerProRata'

export type RecapTalent = {
  talentId: string
  name: string
  role: string
  filmCount: number
  assignments: number
  startOVR: number
  currentOVR: number
  ovrChange: number
  startStarPower: number
  currentStarPower: number
  starPowerChange: number
  largestStarPowerGain: number
  positiveStarEvents: number
  negligibleStarEvents: number
  negativeStarEvents: number
  productiveButUnderRecognized: boolean
}

export type ConcentrationEntry = { key: string; count: number; share: number }
export type RecurringMember = { talentId: string; name: string; role: string; count: number }

export type Concentration = {
  filmCount: number
  topGenre: ConcentrationEntry | null
  genreBreakdown: ConcentrationEntry[]
  topLead: ConcentrationEntry | null
  leadBreakdown: ConcentrationEntry[]
  recurringTeam: RecurringMember[]
  budget: {
    mean: number
    min: number
    max: number
    relativeSpread: number // (max−min)/mean; 0 = identical budgets
  } | null
  cadence: { firstWeek: number; lastWeek: number; avgWeeksBetween: number | null } | null
  note: string
}

export type PositionAffordability = {
  commitment: number
  affordable: boolean
  shortfall: number // 0 when affordable; else amount short
}

/** The mandatory immediate greenlight components (D-12 §3: negative + marketing + engaged
 *  freelancer fees). There is no separate script-acquisition cost in the current rules. */
export type PackageBreakdown = {
  negative: number // production commitment
  marketing: number // minimum required marketing
  freelancerFees: number // 0 when a legal all-contracted roster fills the film
}

export type CurrentPosition = {
  currentCash: number
  // The AUTHORITATIVE least-expensive greenlightable package (bare minimum: cheapest available
  // concept, lowest budget grid, minimum marketing, current contracted roster). Its `affordable`
  // is the SAME solvency gate the real greenlight action enforces (parity-tested).
  cheapest: PositionAffordability | null
  cheapestBreakdown: PackageBreakdown | null
  contractedRosterCanFieldFilm: boolean // false ⇒ the cheapest assumes hiring freelancers to fill gaps
  // A STANDARD-budget film of the cheapest concept (default budget + default marketing) — "can I make
  // a normal film?" For Week 86 this is unaffordable even though the bare minimum is not.
  standard: PositionAffordability | null
  standardBreakdown: PackageBreakdown | null
  typicalRecent: PositionAffordability | null // recent typical commitment (median of last 3)
  currentWeeklyPayroll: number
  currentWeeklyOverhead: number
  currentWeeklyBurn: number
  activeRunRevenue: number
  hasActiveRevenue: boolean
  netWeeklyCash: number // activeRunRevenue − burn (positive = earning)
  waitingHelps: boolean
  waitingAloneWorsens: boolean // no active revenue and burn > 0
  fixedCostRunwayWeeks: number | null // null = net-cash-positive ("—")
  weeksUntilFirstContractExpires: number | null
  weeksUntilLastContractExpires: number | null
  contractsOutliveRunway: boolean // cannot "wait out" contracts: expiry > fixed-cost runway
  recovery: RecoveryPosition
  recoveryReasons: string[]
}

export type InflectionKind =
  | 'openingBalance'
  | 'peakCash'
  | 'lowestCash'
  | 'firstLoss'
  | 'firstTypicalUnaffordable'
  | 'bestContribution'
  | 'worstContribution'
  | 'strongestDevelopment'

// Structured — the UI composes the player-facing sentence (with formatted money).
export type InflectionPoint = {
  kind: InflectionKind
  week: number | null // null when not week-anchored (opening balance, strongest development)
  value: number // a cash amount, contribution amount, or OVR delta depending on kind
  filmTitle?: string
  talentName?: string
}

export type RecapWarningCode =
  | 'standardFilmUnaffordable'
  | 'cashPositiveButNormalUnaffordable'
  | 'waitingBurnsCash'
  | 'oneMoreFailureNarrowsOptions'
  | 'contractsOutliveRunway'
  | 'noActiveRevenue'
  | 'repeatedLosses'
  | 'optionsBelowTypical'
  | 'highGenreConcentration'
  | 'highLeadConcentration'

export type WarningSeverity = 'important' | 'caution' | 'observation'

// Structured — the UI composes text + evidence from the recap's numeric fields.
export type RecapWarning = {
  code: RecapWarningCode
  severity: WarningSeverity
  priority: number // 1 = highest; the UI shows the top few as primary, the rest collapsed
}

export type RunSummary = {
  throughWeek: number
  startingCash: number
  currentCash: number
  cashChange: number
  releasedFilmCount: number
  profitableFilmCount: number
  breakEvenFilmCount: number
  lossFilmCount: number
  totalFilmContribution: number
  totalBoxOfficeGross: number
  totalStudioRevenue: number
  avgCriticScore: number | null
  avgAudienceScore: number | null
  bestFilm: { productionId: string; title: string; contribution: number } | null
  worstFilm: { productionId: string; title: string; contribution: number } | null
  longestLossStreak: number
}

export type CapitalStory = {
  openingBalance: number // cash BEFORE any commitments (= INITIAL_CASH); the run's true peak start
  startingCash: number // == openingBalance (kept for clarity)
  currentCash: number
  totalCommitments: number
  totalStudioRevenue: number
  totalFilmContribution: number
  totalPayroll: number
  totalOverhead: number
  currentWeeklyPayroll: number
  currentWeeklyOverhead: number
  currentWeeklyBurn: number
  // ── D-17A/T13 — the fixed-cost attribution's own reconciliation (R7 safeguard) ──
  // These three ALWAYS satisfy totalAllocatedFixedCost + idleFixedCost === totalLedgerFixedCost,
  // and the screen shows the identity as a visible line. `totalAllocatedFixedCost` covers every
  // production the studio has occupied the lot with, including films still in flight — so it can
  // exceed the sum over `films` (which lists released titles only).
  totalAllocatedFixedCost: number
  idleFixedCost: number // weeks with nothing in production and nothing in release
  totalLedgerFixedCost: number // === totalPayroll + totalOverhead
  fixedCostAllocationBasis: FixedCostAllocationBasis
  // END-OF-WEEK cash (running balance AFTER each week's ledger). The opening balance above
  // is the pre-commitment start; these are post-ledger week closes.
  cashTimeline: { week: number; cash: number }[]
}

export type StudioRunRecap = {
  engaged: boolean
  summary: RunSummary
  capital: CapitalStory
  films: RecapFilm[]
  talent: RecapTalent[]
  talentHighlights: {
    strongestDeveloper: string | null // talentId
    largestCraftImprovement: string | null
    largestStarPowerImprovement: string | null
  }
  concentration: Concentration
  position: CurrentPosition
  inflectionPoints: InflectionPoint[]
  warnings: RecapWarning[] // sorted by priority (highest first)
  evidenceLimitations: string[]
}

// ── small pure helpers ──────────────────────────────────────────────────────────
function round2(n: number): number {
  return Math.round(n * 100) / 100
}
function mean(xs: number[]): number | null {
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null
}
function median(xs: number[]): number | null {
  if (!xs.length) return null
  const s = [...xs].sort((a, b) => a - b)
  const m = Math.floor(s.length / 2)
  return s.length % 2 ? s[m]! : (s[m - 1]! + s[m]!) / 2
}

/** committed cost of one released film = −Σ ledger[production|freelancerFee] for its id
 *  (D-12 §3: negative + marketing + engaged freelancer fees). */
function filmCommittedCost(state: GameState, productionId: string): number {
  let c = 0
  for (const e of state.ledger) {
    if (e.productionId === productionId && (e.kind === 'production' || e.kind === 'freelancerFee')) {
      c -= e.amount
    }
  }
  return c
}

/** share-weighted audience score (matches the UI's filmAudienceScore). */
function filmAudienceScore(state: GameState, film: FilmResult): number {
  let was = 0
  for (const seg of state.market.segments) was += seg.share * (film.segmentScores[seg.id] ?? 0)
  return was
}

/** The cheapest available concept's baseNegativeCost. All concepts are always available
 *  (selectConcepts === state.concepts), so this is the authoritative cheapest concept. */
function minConceptBaseNeg(state: GameState): number | null {
  if (!state.concepts.length) return null
  let m = Infinity
  for (const c of state.concepts) m = Math.min(m, c.baseNegativeCost)
  return isFinite(m) ? m : null
}

/** Whether the current contracted roster can legally field a film (writer + director + 3 distinct
 *  actors + 1 craft) — so the cheapest package needs no freelancer fees at greenlight. */
export function contractedRosterCanField(state: GameState): boolean {
  const roleOf = new Map(state.talent.map((t) => [t.id, t.role]))
  const roles = state.contracts.map((c) => roleOf.get(c.talentId))
  const n = (r: string) => roles.filter((x) => x === r).length
  return n('writer') >= 1 && n('director') >= 1 && n('actor') >= 3 && n('craft') >= 1
}

/** Minimum freelancer fees to fill the roles the contracted roster cannot cover (cheapest available
 *  freelancer per missing role). Returns null if a role cannot be filled at all (no such freelancer). */
function minFreelancerFill(state: GameState): number | null {
  const roleOf = new Map(state.talent.map((t) => [t.id, t]))
  const contractedByRole = (r: string) => state.contracts.filter((c) => roleOf.get(c.talentId)?.role === r).length
  const need: Record<string, number> = {
    writer: Math.max(0, 1 - contractedByRole('writer')),
    director: Math.max(0, 1 - contractedByRole('director')),
    actor: Math.max(0, 3 - contractedByRole('actor')),
    craft: Math.max(0, 1 - contractedByRole('craft')),
  }
  const contractedIds = new Set(state.contracts.map((c) => c.talentId))
  let total = 0
  for (const [role, count] of Object.entries(need)) {
    if (count <= 0) continue
    const fees = state.talent
      .filter((t) => t.role === role && !contractedIds.has(t.id))
      .map((t) => freelancerFee(t))
      .sort((a, b) => a - b)
    if (fees.length < count) return null // cannot field this role at all
    for (let i = 0; i < count; i++) total += fees[i]!
  }
  return total
}

/** AUTHORITATIVE least-expensive greenlightable package = the exact immediate cash the real greenlight
 *  action charges (D-12 §3: negative + marketing + engaged freelancer fees). Bare minimum: cheapest
 *  concept, lowest budget grid (0.75×), minimum marketing, min-demand shape, current roster (contracted
 *  fill is free; otherwise the cheapest freelancer fill). Parity-tested against greenlight(). Returns
 *  null if no package can be assembled. */
// D-17A/T4: EXPORTED (math untouched) so `economyView.affordabilityScopes` can promote the same
// package to the Dashboard and Assembly instead of re-deriving it. One builder, one answer.
export function cheapestPackage(state: GameState): PackageBreakdown | null {
  const minBaseNeg = minConceptBaseNeg(state)
  if (minBaseNeg == null) return null
  const fees = contractedRosterCanField(state) ? 0 : minFreelancerFill(state)
  if (fees == null) return null
  // UNROUNDED and grouped EXACTLY like the action (requiredNegative = base×demand×scale, then ×mult),
  // so the recap's all-in equals the greenlight action's totalCommittedCost to the bit (parity-tested).
  const requiredNegative = minBaseNeg * minBudgetDemandMultiplier() * state.era.costScale
  const negative = NEGATIVE_BUDGET_MULTIPLIERS[0]! * requiredNegative
  return { negative, marketing: MARKETING_BUDGET_LEVELS[0]!, freelancerFees: fees }
}

/** A STANDARD-budget film of the cheapest concept: default budget grid (1.0×), neutral shape demand,
 *  default marketing — "can I make a normal film?" (what the assembly opens with). */
export function standardPackage(state: GameState): PackageBreakdown | null {
  const minBaseNeg = minConceptBaseNeg(state)
  if (minBaseNeg == null) return null
  const fees = contractedRosterCanField(state) ? 0 : minFreelancerFill(state)
  if (fees == null) return null
  const negative = Math.round(STANDARD_NEG_MULT * minBaseNeg * STANDARD_DEMAND * state.era.costScale)
  return { negative, marketing: STANDARD_MARKETING, freelancerFees: fees }
}

/** The exact immediate cash a greenlight charges for a package (D-12 §3). D-17A/T4: exported. */
export function packageAllIn(b: PackageBreakdown): number {
  return b.negative + b.marketing + b.freelancerFees
}

/** The "recent typical" commitment: median committed cost of the last TYPICAL_RECENT_WINDOW
 *  releases (newest first, positive only); null before anything has released. D-17A/T4: extracted
 *  so the recap position and `economyView.affordabilityScopes` share ONE derivation rather than
 *  two that agree by coincidence. Value-identical to the previous inline computation. */
export function recentTypicalCommitment(state: GameState): number | null {
  const recent = [...state.studio.releasedFilms]
    .sort((a, b) => b.releaseTick - a.releaseTick)
    .map((f) => round2(filmCommittedCost(state, f.productionId)))
    .filter((c) => c > 0)
    .slice(0, TYPICAL_RECENT_WINDOW)
  return median(recent)
}

const OPENINGS: FilmShape['opening'][] = ['immediateAction', 'slowSetup', 'mysteryHook']
const MIDPOINTS: FilmShape['midpoint'][] = ['reversal', 'escalation', 'revelation']
const ENDINGS: FilmShape['ending'][] = ['triumph', 'bittersweet', 'tragic', 'ambiguous']

/** Minimum budgetDemandMultiplier achievable across all 36 legal story shapes (real
 *  resolveShape; shape-only, concept-independent). */
function minBudgetDemandMultiplier(): number {
  let min = Infinity
  for (const opening of OPENINGS) {
    for (const midpoint of MIDPOINTS) {
      for (const ending of ENDINGS) {
        const m = resolveShape({ opening, midpoint, ending }).budgetDemandMultiplier
        if (m < min) min = m
      }
    }
  }
  return min
}

// ── main ──────────────────────────────────────────────────────────────────────
export function studioRunRecap(state: GameState): StudioRunRecap {
  const throughWeek = state.market.tick
  const totals = financeTotals(state)
  const startingCash = state.studio.cash - totals.net // reconciliation invariant == INITIAL_CASH
  const currentCash = state.studio.cash

  const totalCommitments = -(totals.production + totals.freelancerFee) // §3 committed cost
  const totalStudioRevenue = totals.studioRevenue
  const totalFilmContribution = totalStudioRevenue - totalCommitments
  const totalPayroll = -totals.payroll
  const totalOverhead = -totals.overhead

  const runByProd = new Map(state.theatricalRuns.map((r) => [r.productionId, r]))
  const conceptById = new Map(state.concepts.map((c) => [c.id, c]))
  const talentById = new Map(state.talent.map((t) => [t.id, t]))

  // D-17A/T13 — the managerial fixed-cost attribution over the whole run so far. It reconciles
  // to the ledger by construction (fixedCostAllocation.ts); the recap simply reports it.
  const allocation = allocateFixedCosts(state)

  // ── C. film slate (chronological) ──
  const releasedSorted = [...state.studio.releasedFilms].sort((a, b) => a.releaseTick - b.releaseTick)
  const films: RecapFilm[] = releasedSorted.map((f) => {
    const concept = conceptById.get(f.conceptId)
    const commit = filmCommittedCost(state, f.productionId)
    const run = runByProd.get(f.productionId)
    const studioRevenue = run ? run.cumulativeStudioRevenuePaid : null
    // D-17A FIX-PASS: with no run record the share is the REGIME's, not a constant. On the
    // never-engaged (D-1) path no run is ever opened and release credits the FULL gross, so
    // 0.52 reported barely half of it — and disagreed with `releaseScorecard`, which already
    // falls back to the full gross for the same film. Identical (0.52) for an engaged studio.
    const projected = run
      ? run.weeklyGross.reduce((a, b) => a + b, 0) * run.studioShare
      : f.boxOffice.total * regimeStudioShare(state)
    const contribution = studioRevenue != null ? studioRevenue - commit : null
    const roi = contribution != null && commit > 0 ? contribution / commit : null
    const forecastTotal = f.forecast?.expectedTotal ?? null
    const cls: FilmContributionClass | 'unknown' =
      contribution == null ? 'unknown' : classifyContribution(contribution, commit)
    const alloc = allocation.perFilm[f.productionId] ?? { allocated: 0, allocatedWeeks: 0 }
    return {
      productionId: f.productionId,
      title: concept?.title ?? f.conceptId,
      genre: concept?.genre ?? null,
      releaseWeek: f.releaseTick,
      lead: f.participants?.cast.lead?.name ?? null,
      committedCost: round2(commit),
      studioRevenue: studioRevenue != null ? round2(studioRevenue) : null,
      projectedStudioRevenue: round2(projected),
      contribution: contribution != null ? round2(contribution) : null,
      roi: roi != null ? round2(roi) : null,
      forecastTotal: forecastTotal != null ? round2(forecastTotal) : null,
      realizedTotal: round2(f.boxOffice.total),
      totalVsForecast: forecastTotal ? round2(f.boxOffice.total / forecastTotal) : null,
      forecastCritic: f.forecast?.expectedCriticScore ?? null,
      realizedCritic: round2(f.criticScore),
      audience: round2(filmAudienceScore(state, f)),
      runStatus: run ? run.status : 'none',
      classification: cls,
      heavyLoss: contribution != null && commit > 0 && contribution < -HEAVY_LOSS_FRACTION * commit,
      allocatedFixedCost: alloc.allocated,
      allocatedWeeks: alloc.allocatedWeeks,
      studioEconomicResult: contribution != null ? round2(contribution - alloc.allocated) : null,
      allocationBasis: 'ledgerProRata',
    }
  })

  const profitableFilmCount = films.filter((f) => f.classification === 'positive').length
  const breakEvenFilmCount = films.filter((f) => f.classification === 'breakEven').length
  const lossFilmCount = films.filter((f) => f.classification === 'loss').length

  // longest consecutive loss streak (break-even and profit both break a streak)
  let longestLossStreak = 0
  let cur = 0
  for (const f of films) {
    if (f.classification === 'loss') {
      cur += 1
      longestLossStreak = Math.max(longestLossStreak, cur)
    } else cur = 0
  }

  const withContribution = films.filter((f) => f.contribution != null)
  const bestFilm = withContribution.length
    ? withContribution.reduce((a, b) => (b.contribution! > a.contribution! ? b : a))
    : null
  const worstFilm = withContribution.length
    ? withContribution.reduce((a, b) => (b.contribution! < a.contribution! ? b : a))
    : null

  const summary: RunSummary = {
    throughWeek,
    startingCash: round2(startingCash),
    currentCash: round2(currentCash),
    cashChange: round2(currentCash - startingCash),
    releasedFilmCount: films.length,
    profitableFilmCount,
    breakEvenFilmCount,
    lossFilmCount,
    totalFilmContribution: round2(totalFilmContribution),
    totalBoxOfficeGross: round2(films.reduce((a, f) => a + f.realizedTotal, 0)),
    totalStudioRevenue: round2(totalStudioRevenue),
    avgCriticScore: films.length ? round2(mean(films.map((f) => f.realizedCritic))!) : null,
    avgAudienceScore: films.length ? round2(mean(films.map((f) => f.audience))!) : null,
    bestFilm: bestFilm
      ? { productionId: bestFilm.productionId, title: bestFilm.title, contribution: bestFilm.contribution! }
      : null,
    worstFilm: worstFilm
      ? { productionId: worstFilm.productionId, title: worstFilm.title, contribution: worstFilm.contribution! }
      : null,
    longestLossStreak,
  }

  // ── B. capital story (END-OF-WEEK cash from the signed ledger; opening balance separate) ──
  const byWeek = new Map<number, number>()
  for (const e of state.ledger) byWeek.set(e.week, (byWeek.get(e.week) ?? 0) + e.amount)
  const weeks = [...byWeek.keys()].sort((a, b) => a - b)
  let running = startingCash
  const cashTimeline: { week: number; cash: number }[] = []
  for (const w of weeks) {
    running += byWeek.get(w)!
    cashTimeline.push({ week: w, cash: round2(running) })
  }

  const curPayroll = weeklyPayroll(state)
  const curOverhead = weeklyOverhead(state)
  const curBurn = weeklyBurn(state)

  const capital: CapitalStory = {
    openingBalance: round2(startingCash),
    startingCash: round2(startingCash),
    currentCash: round2(currentCash),
    totalCommitments: round2(totalCommitments),
    totalStudioRevenue: round2(totalStudioRevenue),
    totalFilmContribution: round2(totalFilmContribution),
    totalPayroll: round2(totalPayroll),
    totalOverhead: round2(totalOverhead),
    currentWeeklyPayroll: round2(curPayroll),
    currentWeeklyOverhead: round2(curOverhead),
    currentWeeklyBurn: round2(curBurn),
    totalAllocatedFixedCost: Object.values(allocation.perFilm).reduce((s, f) => s + f.allocated, 0),
    idleFixedCost: allocation.idle,
    totalLedgerFixedCost: allocation.total,
    fixedCostAllocationBasis: 'ledgerProRata',
    cashTimeline,
  }

  // ── D. talent development (aggregate frozen careerEvents; NO recompute) ──
  const eventsByTalent = new Map<string, TalentCareerEvent[]>()
  for (const e of state.careerEvents) {
    const arr = eventsByTalent.get(e.talentId) ?? []
    arr.push(e)
    eventsByTalent.set(e.talentId, arr)
  }
  const talent: RecapTalent[] = []
  for (const [talentId, evsRaw] of eventsByTalent) {
    const evs = [...evsRaw].sort((a, b) => a.releaseWeek - b.releaseWeek)
    const first = evs[0]!
    const last = evs[evs.length - 1]!
    const t: Talent | undefined = talentById.get(talentId)
    const currentStarPower = t ? t.fame : last.starPowerAfter
    const spDeltas = evs.map((e) => e.starPowerDelta)
    talent.push({
      talentId,
      name: t?.name ?? talentId,
      role: t?.role ?? first.role,
      filmCount: new Set(evs.map((e) => e.filmId)).size,
      assignments: evs.length,
      startOVR: first.ovrBefore,
      currentOVR: last.ovrAfter,
      ovrChange: last.ovrAfter - first.ovrBefore,
      startStarPower: round2(first.starPowerBefore),
      currentStarPower: round2(currentStarPower),
      starPowerChange: round2(currentStarPower - first.starPowerBefore),
      largestStarPowerGain: round2(Math.max(0, ...spDeltas)),
      positiveStarEvents: spDeltas.filter((d) => d > SP_NEGLIGIBLE_BAND).length,
      negligibleStarEvents: spDeltas.filter((d) => Math.abs(d) <= SP_NEGLIGIBLE_BAND).length,
      negativeStarEvents: spDeltas.filter((d) => d < -SP_NEGLIGIBLE_BAND).length,
      productiveButUnderRecognized:
        evs.length >= LOW_RECOGNITION_MIN_FILMS &&
        currentStarPower - first.starPowerBefore < LOW_RECOGNITION_MAX_STARGAIN,
    })
  }
  talent.sort((a, b) => b.assignments - a.assignments || b.ovrChange - a.ovrChange)

  const pick = (sel: (t: RecapTalent) => number): string | null =>
    talent.length ? talent.reduce((a, b) => (sel(b) > sel(a) ? b : a)).talentId : null
  const talentHighlights = {
    strongestDeveloper: pick((t) => t.ovrChange),
    largestCraftImprovement: talent.filter((t) => t.role === 'craft').length
      ? talent.filter((t) => t.role === 'craft').reduce((a, b) => (b.ovrChange > a.ovrChange ? b : a)).talentId
      : pick((t) => t.ovrChange),
    largestStarPowerImprovement: pick((t) => t.starPowerChange),
  }

  // ── E. strategy concentration ──
  const concentration = computeConcentration(state, films)

  // ── F. current position + recovery ──
  const position = computePosition(state, films, curBurn, curPayroll, curOverhead)

  // ── inflection points (bounded, structured) ──
  const inflectionPoints = computeInflections(capital, films, talent, position, startingCash)

  // ── warnings (structured + prioritised) ──
  const warnings = computeWarnings(summary, position, concentration)

  // ── honest limitations ──
  const evidenceLimitations: string[] = []
  const anyActive = state.theatricalRuns.some((r) => r.status === 'active')
  if (anyActive)
    evidenceLimitations.push(
      'One or more theatrical runs are still active; their Studio Revenue and contribution are shown to date, with the projected full-run total alongside.',
    )
  if (films.some((f) => f.runStatus === 'none'))
    evidenceLimitations.push(
      'One or more released films have no theatrical-run record (legacy/pre-D-12); their Studio Revenue could not be reconstructed and is shown as unavailable.',
    )

  return {
    // D-17A/R2 — the ONE authoritative regime fact (persisted, monotonic). The former
    // ad-hoc predicate (contracts ∨ runs ∨ films) went false for a founded studio that
    // had not yet released and had let its contracts lapse.
    engaged: economyEngaged(state),
    summary,
    capital,
    films,
    talent,
    talentHighlights,
    concentration,
    position,
    inflectionPoints,
    warnings,
    evidenceLimitations,
  }
}

// ── E. concentration ────────────────────────────────────────────────────────────
function computeConcentration(state: GameState, films: RecapFilm[]): Concentration {
  const n = films.length
  const tally = (keys: (string | null)[]): ConcentrationEntry[] => {
    const m = new Map<string, number>()
    for (const k of keys) if (k) m.set(k, (m.get(k) ?? 0) + 1)
    return [...m.entries()]
      .map(([key, count]) => ({ key, count, share: n ? count / n : 0 }))
      .sort((a, b) => b.count - a.count)
  }
  const genreBreakdown = tally(films.map((f) => f.genre))
  const leadBreakdown = tally(films.map((f) => f.lead))

  const perTalentFilms = new Map<string, { name: string; role: string; films: Set<string> }>()
  const talentById = new Map(state.talent.map((t) => [t.id, t]))
  for (const f of state.studio.releasedFilms) {
    const p = f.participants
    if (!p) continue
    const parts = [p.writer, p.director, p.cast.lead, p.cast.antagonist, p.cast.support, ...p.craft]
    for (const part of parts) {
      if (!part) continue
      const rec = perTalentFilms.get(part.talentId) ?? {
        name: part.name || talentById.get(part.talentId)?.name || part.talentId,
        role: part.role,
        films: new Set<string>(),
      }
      rec.films.add(f.productionId)
      perTalentFilms.set(part.talentId, rec)
    }
  }
  const recurringTeam: RecurringMember[] = [...perTalentFilms.entries()]
    .filter(([, r]) => r.films.size >= RECURRING_TEAM_MIN_FILMS)
    .map(([talentId, r]) => ({ talentId, name: r.name, role: r.role, count: r.films.size }))
    .sort((a, b) => b.count - a.count)

  const commits = films.map((f) => f.committedCost).filter((c): c is number => c != null && c > 0)
  const budgetMean = commits.length ? commits.reduce((a, b) => a + b, 0) / commits.length : 0
  const budget = commits.length
    ? {
        mean: round2(budgetMean),
        min: round2(Math.min(...commits)),
        max: round2(Math.max(...commits)),
        relativeSpread: budgetMean ? round2((Math.max(...commits) - Math.min(...commits)) / budgetMean) : 0,
      }
    : null

  const weeksReleased = films.map((f) => f.releaseWeek).sort((a, b) => a - b)
  const cadence = weeksReleased.length
    ? {
        firstWeek: weeksReleased[0]!,
        lastWeek: weeksReleased[weeksReleased.length - 1]!,
        avgWeeksBetween:
          weeksReleased.length > 1
            ? round2((weeksReleased[weeksReleased.length - 1]! - weeksReleased[0]!) / (weeksReleased.length - 1))
            : null,
      }
    : null

  return {
    filmCount: n,
    topGenre: genreBreakdown[0] ?? null,
    genreBreakdown,
    topLead: leadBreakdown[0] ?? null,
    leadBreakdown,
    recurringTeam,
    budget,
    cadence,
    note: 'Concentration is neutral on its own — it means the slate leaned on the same assumptions, so outcomes tend to share the same reach and taste variance rather than diversifying it.',
  }
}

// ── F. current position + recovery classification ────────────────────────────────
function computePosition(
  state: GameState,
  films: RecapFilm[],
  curBurn: number,
  curPayroll: number,
  curOverhead: number,
): CurrentPosition {
  const currentCash = state.studio.cash
  const activeRunRevenue = expectedWeeklyRunRevenue(state)
  const hasActiveRevenue = state.theatricalRuns.some((r) => r.status === 'active') && activeRunRevenue > 0
  const netWeeklyCash = activeRunRevenue - curBurn
  const rw = runway(state)

  // AUTHORITATIVE bare-minimum greenlightable package (same solvency gate as the greenlight action).
  const cheapestBreakdown = cheapestPackage(state)
  const cheapest: PositionAffordability | null =
    cheapestBreakdown != null ? affordabilityOf(state, packageAllIn(cheapestBreakdown)) : null
  const contractedRosterCanFieldFilm = contractedRosterCanField(state)

  // A STANDARD (normally-funded) film of the cheapest concept — "can I make a normal film?"
  const standardBreakdown = standardPackage(state)
  const standard: PositionAffordability | null =
    standardBreakdown != null ? affordabilityOf(state, packageAllIn(standardBreakdown)) : null

  // D-17A/T4: the shared derivation (value-identical to the previous inline one).
  const typicalCommit = recentTypicalCommitment(state)
  const typicalRecent: PositionAffordability | null =
    typicalCommit != null ? affordabilityOf(state, typicalCommit) : null

  const expiries = state.contracts.map((c) => c.endWeekExclusive - state.market.tick).filter((w) => w > 0)
  const weeksUntilFirstContractExpires = expiries.length ? Math.min(...expiries) : null
  const weeksUntilLastContractExpires = expiries.length ? Math.max(...expiries) : null
  const waitingAloneWorsens = !hasActiveRevenue && curBurn > 0
  const contractsOutliveRunway =
    weeksUntilLastContractExpires != null && rw.weeks != null && weeksUntilLastContractExpires > rw.weeks

  const { recovery, reasons } = classifyRecovery({
    films,
    cheapest,
    standard,
    typicalRecent,
    hasActiveRevenue,
    netWeeklyCash,
    runwayWeeks: rw.weeks,
    contractsOutliveRunway,
  })

  return {
    currentCash: round2(currentCash),
    cheapest,
    cheapestBreakdown: cheapestBreakdown
      ? { negative: cheapestBreakdown.negative, marketing: cheapestBreakdown.marketing, freelancerFees: cheapestBreakdown.freelancerFees }
      : null,
    contractedRosterCanFieldFilm,
    standard,
    standardBreakdown: standardBreakdown
      ? { negative: standardBreakdown.negative, marketing: standardBreakdown.marketing, freelancerFees: standardBreakdown.freelancerFees }
      : null,
    typicalRecent,
    currentWeeklyPayroll: round2(curPayroll),
    currentWeeklyOverhead: round2(curOverhead),
    currentWeeklyBurn: round2(curBurn),
    activeRunRevenue: round2(activeRunRevenue),
    hasActiveRevenue,
    netWeeklyCash: round2(netWeeklyCash),
    waitingHelps: netWeeklyCash >= 0,
    waitingAloneWorsens,
    fixedCostRunwayWeeks: rw.weeks,
    weeksUntilFirstContractExpires,
    weeksUntilLastContractExpires,
    contractsOutliveRunway,
    recovery,
    recoveryReasons: reasons,
  }
}

// D-17A/T4: EXPORTED (math untouched) — the one place a "can I commit this much?" answer is
// derived, always through the engine's own gate via `commitmentPreview`.
export function affordabilityOf(state: GameState, commitment: number): PositionAffordability {
  const preview = commitmentPreview(state, commitment)
  return {
    commitment: Math.round(commitment),
    affordable: preview.affordable,
    shortfall: preview.affordable ? 0 : Math.round(Math.max(0, -preview.cashAfter)),
  }
}

function classifyRecovery(inp: {
  films: RecapFilm[]
  cheapest: PositionAffordability | null
  standard: PositionAffordability | null
  typicalRecent: PositionAffordability | null
  hasActiveRevenue: boolean
  netWeeklyCash: number
  runwayWeeks: number | null
  contractsOutliveRunway: boolean
}): { recovery: RecoveryPosition; reasons: string[] } {
  const reasons: string[] = []
  if (!inp.films.length || inp.cheapest == null) {
    return {
      recovery: 'incomplete',
      reasons: ['No released films or economy data yet — there is nothing to summarize about capital position.'],
    }
  }
  const cheapestOk = inp.cheapest.affordable
  const standardOk = inp.standard?.affordable ?? false
  const typicalOk = inp.typicalRecent?.affordable ?? false
  const waitingHelps = inp.netWeeklyCash >= 0

  // No film at all — not even the bare-minimum greenlightable package.
  if (!cheapestOk) {
    reasons.push('No currently available film package is affordable — even the least-expensive greenlightable package exceeds current cash.')
    if (!inp.hasActiveRevenue) reasons.push('No active theatrical run is generating revenue.')
    return { recovery: 'noNormalProduction', reasons }
  }
  if (standardOk && typicalOk && waitingHelps) {
    reasons.push('A normally-funded film and a film at your recent typical commitment are both affordable, and cash is not shrinking — the position is healthy.')
    return { recovery: 'healthy', reasons }
  }

  // A bare-minimum production is affordable, but a normal/typical film is not.
  reasons.push('Only a bare-minimum production is affordable: the least-expensive greenlightable package (cheapest concept, lowest budget, minimum marketing) fits your cash.')
  if (!standardOk) reasons.push('A standard-budget film is NOT affordable — a normally-funded production exceeds current cash.')
  else if (!typicalOk) reasons.push('A film at your recent typical commitment is NOT affordable.')
  if (!waitingHelps) reasons.push('Waiting alone worsens the position — fixed costs reduce cash every week.')
  if (!inp.hasActiveRevenue) reasons.push('No active theatrical run is generating revenue, so nothing offsets that weekly drain.')
  if (inp.contractsOutliveRunway)
    reasons.push('You cannot wait for current contracts to expire: they end after the cash would run out under current fixed costs.')
  reasons.push('A bare-minimum film being possible is not a strong recovery path — recovery would require an underfunded film to succeed before fixed costs consume the remaining cash. No recovery mechanic (loans/financing) exists in the current rules.')

  const severe = !standardOk && !inp.hasActiveRevenue && !waitingHelps && inp.runwayWeeks != null
  return { recovery: severe ? 'severe' : 'constrained', reasons }
}

// ── inflection points (bounded, structured — UI composes sentences) ──────────────
function computeInflections(
  capital: CapitalStory,
  films: RecapFilm[],
  talent: RecapTalent[],
  position: CurrentPosition,
  openingBalance: number,
): InflectionPoint[] {
  const pts: InflectionPoint[] = []
  const timeline = capital.cashTimeline

  // Opening balance is always the first key moment and the true starting peak.
  pts.push({ kind: 'openingBalance', week: null, value: round2(openingBalance) })

  if (timeline.length) {
    // Peak: only surface a separate peak if some END-OF-WEEK cash exceeded the opening balance.
    const peak = timeline.reduce((a, b) => (b.cash > a.cash ? b : a))
    if (peak.cash > openingBalance + 0.5) pts.push({ kind: 'peakCash', week: peak.week, value: peak.cash })

    const trough = timeline.reduce((a, b) => (b.cash < a.cash ? b : a))
    pts.push({ kind: 'lowestCash', week: trough.week, value: trough.cash })

    // First END-OF-WEEK close below the recent-typical commitment (normal production unaffordable).
    const typical = position.typicalRecent?.commitment
    if (typical != null) {
      const crossed = timeline.find((c) => c.cash < typical)
      if (crossed) pts.push({ kind: 'firstTypicalUnaffordable', week: crossed.week, value: crossed.cash })
    }
  }

  const firstLoss = films.find((f) => f.classification === 'loss')
  if (firstLoss)
    pts.push({ kind: 'firstLoss', week: firstLoss.releaseWeek, value: firstLoss.contribution ?? 0, filmTitle: firstLoss.title })

  const withContribution = films.filter((f) => f.contribution != null)
  if (withContribution.length) {
    const worst = withContribution.reduce((a, b) => (b.contribution! < a.contribution! ? b : a))
    pts.push({ kind: 'worstContribution', week: worst.releaseWeek, value: worst.contribution!, filmTitle: worst.title })
    const best = withContribution.reduce((a, b) => (b.contribution! > a.contribution! ? b : a))
    pts.push({ kind: 'bestContribution', week: best.releaseWeek, value: best.contribution!, filmTitle: best.title })
  }

  const topDev = talent.length ? talent.reduce((a, b) => (b.ovrChange > a.ovrChange ? b : a)) : null
  if (topDev && topDev.ovrChange > 0)
    pts.push({ kind: 'strongestDevelopment', week: null, value: topDev.ovrChange, talentName: topDev.name })

  return pts.slice(0, MAX_INFLECTION_POINTS)
}

// ── warnings (structured + prioritised; the UI formats text/evidence & shows top few) ──
function computeWarnings(
  summary: RunSummary,
  position: CurrentPosition,
  concentration: Concentration,
): RecapWarning[] {
  const w: RecapWarning[] = []
  const push = (code: RecapWarningCode, severity: WarningSeverity, priority: number) => w.push({ code, severity, priority })

  const cashPositive = position.currentCash > 0
  const standardUnaffordable = position.standard ? !position.standard.affordable : false
  const typicalUnaffordable = position.typicalRecent ? !position.typicalRecent.affordable : false
  const cheapestOk = position.cheapest?.affordable ?? false

  // The honest headline: a NORMALLY-funded film is out of reach (the bare-minimum package may still fit).
  if (cashPositive && standardUnaffordable) push('standardFilmUnaffordable', 'important', 1)
  if (cashPositive && typicalUnaffordable) push('cashPositiveButNormalUnaffordable', 'caution', 2)
  if (position.waitingAloneWorsens) push('waitingBurnsCash', 'caution', 3)
  if (typicalUnaffordable && summary.lossFilmCount >= 1) push('oneMoreFailureNarrowsOptions', 'caution', 4)
  if (position.contractsOutliveRunway) push('contractsOutliveRunway', 'caution', 5)
  if (!position.hasActiveRevenue) push('noActiveRevenue', 'caution', 6)
  if (summary.longestLossStreak >= 2) push('repeatedLosses', 'caution', 7)
  if (cheapestOk && typicalUnaffordable) push('optionsBelowTypical', 'observation', 8)
  if (concentration.topGenre && concentration.topGenre.share >= 0.6) push('highGenreConcentration', 'observation', 9)
  if (concentration.topLead && concentration.topLead.share >= 0.6) push('highLeadConcentration', 'observation', 10)

  return w.sort((a, b) => a.priority - b.priority)
}
