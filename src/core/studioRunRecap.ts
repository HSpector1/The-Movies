// ── D-15 Studio Run Recap (studioRunRecap.ts) ─────────────────────────────────
// A pure, read-only, deterministic explanation of what happened to the studio over a
// run: capital story, film slate, talent development, strategy concentration, current
// position + recovery classification, inflection points, and bounded warnings.
//
// It reconstructs everything from the live GameState (SaveFileV5.state) — it adds NO
// persistence, mutates NOTHING, advances NO RNG, and NEVER recomputes a film outcome or
// a D-14 career event. Money figures reuse the D-12 economyView math (the single source
// of every dollar the UI shows); talent figures aggregate the frozen careerEvents ledger.
// The sim never reads this, exactly like economyView / talentSummary / filmPackage.
//
// Canonical definitions (docs/D-12-economy-contract.md §3): Studio Revenue = blended
// share of theatrical gross; committed cost = negative + marketing + engaged freelancer
// fees; FILM CONTRIBUTION = Studio Revenue − committed cost (payroll & overhead are NOT
// allocated per film, §8). Owner directive D-15 authorizes this read-only recap only.

import type {
  GameState,
  FilmResult,
  TheatricalRun,
  TalentCareerEvent,
  Genre,
  FilmShape,
  Talent,
} from './types.js'
import { TUNING } from './tuning.js'
import { resolveShape } from './shape.js'
import { NEGATIVE_BUDGET_MULTIPLIERS, MARKETING_BUDGET_LEVELS } from './grid.js'
import { weeklyPayroll } from './employment.js'
import {
  financeTotals,
  weeklyOverhead,
  weeklyBurn,
  runway,
  expectedWeeklyRunRevenue,
  commitmentPreview,
} from './economyView.js'

// ── documented recap conventions (not engine invariants) ───────────────────────
/** A talent counted as "productive but under-recognized": meaningful work, little Star Power. */
const LOW_RECOGNITION_MIN_FILMS = 3
const LOW_RECOGNITION_MAX_STARGAIN = 0.5
/** A contributor is "recurring" if they worked on at least this share of the slate. */
const RECURRING_TEAM_MIN_FILMS = 3
/** Star Power deltas within ±this are "negligible" (matches the D-14 audit's ±0.05 band). */
const SP_NEGLIGIBLE_BAND = 0.05
/** "typical recent" film commitment = median of this many most-recent releases. */
const TYPICAL_RECENT_WINDOW = 3
/** A film loss counted as "heavy" for headlines/inflections: worse than this × its commitment. */
const HEAVY_LOSS_FRACTION = 0.25
/** How many inflection points to surface by default (bounded, high-value only). */
const MAX_INFLECTION_POINTS = 6

export type FilmContributionClass = 'positive' | 'breakEven' | 'loss'
export type RecoveryPosition =
  | 'healthy'
  | 'constrained'
  | 'severe'
  | 'noNormalProduction'
  | 'incomplete'

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
}

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

export type CurrentPosition = {
  currentCash: number
  cheapest: PositionAffordability | null
  typicalRecent: PositionAffordability | null
  currentWeeklyPayroll: number
  currentWeeklyOverhead: number
  currentWeeklyBurn: number
  activeRunRevenue: number
  hasActiveRevenue: boolean
  netWeeklyCash: number // activeRunRevenue − burn (positive = earning)
  waitingHelps: boolean
  fixedCostRunwayWeeks: number | null // null = net-cash-positive ("—")
  weeksUntilFirstContractExpires: number | null
  weeksUntilLastContractExpires: number | null
  recovery: RecoveryPosition
  recoveryReasons: string[]
}

export type InflectionKind =
  | 'peakCash'
  | 'lowestCash'
  | 'firstLoss'
  | 'firstLossStreak'
  | 'firstTypicalUnaffordable'
  | 'bestContribution'
  | 'worstContribution'
  | 'strongestDevelopment'

export type InflectionPoint = {
  kind: InflectionKind
  week: number
  label: string
  value: number
  evidence: string
}

export type RecapWarningCode =
  | 'cashPositiveButNormalUnaffordable'
  | 'noActiveRevenue'
  | 'waitingBurnsCash'
  | 'optionsBelowTypical'
  | 'repeatedLosses'
  | 'highGenreConcentration'
  | 'highLeadConcentration'
  | 'oneMoreFailureNarrowsOptions'

export type RecapWarning = {
  code: RecapWarningCode
  severity: 'info' | 'caution' | 'serious'
  text: string
  evidence: string
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
  startingCash: number
  currentCash: number
  totalCommitments: number
  totalStudioRevenue: number
  totalFilmContribution: number
  totalPayroll: number
  totalOverhead: number
  currentWeeklyPayroll: number
  currentWeeklyOverhead: number
  currentWeeklyBurn: number
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
  warnings: RecapWarning[]
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
 *  (D-12 §3: negative + marketing + engaged freelancer fees). Mirrors the UI's
 *  filmCommittedCost, kept in core so the recap is self-contained and pure. */
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

/** The theoretically cheapest legal production commitment RIGHT NOW: the lowest-cost
 *  available concept at the minimum budget grid (0.75× negative, minimum marketing) and
 *  the lowest-demand story shape, with a fully-contracted roster (talent cost 0). A
 *  documented recap convention — there is no engine budget floor (grid.ts is UI
 *  discretization). Returns null if there are no concepts. */
function cheapestLegalCommitment(state: GameState): number | null {
  if (!state.concepts.length) return null
  let minBaseNeg = Infinity
  for (const c of state.concepts) minBaseNeg = Math.min(minBaseNeg, c.baseNegativeCost)
  if (!isFinite(minBaseNeg)) return null
  const minDemand = minBudgetDemandMultiplier()
  const negative = NEGATIVE_BUDGET_MULTIPLIERS[0]! * minBaseNeg * minDemand * state.era.costScale
  return Math.round(negative) + MARKETING_BUDGET_LEVELS[0]!
}

const OPENINGS: FilmShape['opening'][] = ['immediateAction', 'slowSetup', 'mysteryHook']
const MIDPOINTS: FilmShape['midpoint'][] = ['reversal', 'escalation', 'revelation']
const ENDINGS: FilmShape['ending'][] = ['triumph', 'bittersweet', 'tragic', 'ambiguous']

/** Minimum budgetDemandMultiplier achievable across all 36 legal story shapes, via the
 *  real resolveShape (no hardcoded constant). Shape-only, so concept-independent. */
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

  // ── C. film slate (chronological) ──
  const releasedSorted = [...state.studio.releasedFilms].sort((a, b) => a.releaseTick - b.releaseTick)
  const films: RecapFilm[] = releasedSorted.map((f) => {
    const concept = conceptById.get(f.conceptId)
    const commit = filmCommittedCost(state, f.productionId)
    const run = runByProd.get(f.productionId)
    const studioRevenue = run ? run.cumulativeStudioRevenuePaid : null
    const projected = run
      ? run.weeklyGross.reduce((a, b) => a + b, 0) * run.studioShare
      : f.boxOffice.total * TUNING.STUDIO_RENTAL_BLENDED
    const contribution = studioRevenue != null ? studioRevenue - commit : null
    const roi = contribution != null && commit > 0 ? contribution / commit : null
    const forecastTotal = f.forecast?.expectedTotal ?? null
    const cls: FilmContributionClass | 'unknown' =
      contribution == null ? 'unknown' : contribution > 0 ? 'positive' : contribution < 0 ? 'loss' : 'breakEven'
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
    }
  })

  const profitableFilmCount = films.filter((f) => f.classification === 'positive').length
  const breakEvenFilmCount = films.filter((f) => f.classification === 'breakEven').length
  const lossFilmCount = films.filter((f) => f.classification === 'loss').length

  // longest consecutive loss streak (by release order)
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

  // ── B. capital story (cumulative cash timeline from the signed ledger) ──
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

  // ── inflection points (bounded) ──
  const inflectionPoints = computeInflections(cashTimeline, films, talent, position, startingCash)

  // ── warnings ──
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
  evidenceLimitations.push(
    'Cheapest-legal and typical-recent commitments are recap conventions (no engine budget floor; no stored per-film budget), computed deterministically as documented.',
  )

  return {
    engaged: state.contracts.length > 0 || state.theatricalRuns.length > 0 || films.length > 0,
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

  // recurring team: any credited participant appearing in ≥ RECURRING_TEAM_MIN_FILMS films
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

  const cheapestCommit = cheapestLegalCommitment(state)
  const cheapest: PositionAffordability | null =
    cheapestCommit != null ? affordabilityOf(state, cheapestCommit) : null

  // typical recent = median commitment of the most recent releases (reconstructed from ledger)
  const recentCommits = [...films]
    .sort((a, b) => b.releaseWeek - a.releaseWeek)
    .map((f) => f.committedCost)
    .filter((c): c is number => c != null && c > 0)
    .slice(0, TYPICAL_RECENT_WINDOW)
  const typicalCommit = median(recentCommits)
  const typicalRecent: PositionAffordability | null =
    typicalCommit != null ? affordabilityOf(state, typicalCommit) : null

  const expiries = state.contracts.map((c) => c.endWeekExclusive - state.market.tick).filter((w) => w > 0)

  const { recovery, reasons } = classifyRecovery({
    films,
    cheapest,
    typicalRecent,
    hasActiveRevenue,
    netWeeklyCash,
    runwayWeeks: rw.weeks,
  })

  return {
    currentCash: round2(currentCash),
    cheapest,
    typicalRecent,
    currentWeeklyPayroll: round2(curPayroll),
    currentWeeklyOverhead: round2(curOverhead),
    currentWeeklyBurn: round2(curBurn),
    activeRunRevenue: round2(activeRunRevenue),
    hasActiveRevenue,
    netWeeklyCash: round2(netWeeklyCash),
    waitingHelps: netWeeklyCash >= 0,
    fixedCostRunwayWeeks: rw.weeks,
    weeksUntilFirstContractExpires: expiries.length ? Math.min(...expiries) : null,
    weeksUntilLastContractExpires: expiries.length ? Math.max(...expiries) : null,
    recovery,
    recoveryReasons: reasons,
  }
}

function affordabilityOf(state: GameState, commitment: number): PositionAffordability {
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
  typicalRecent: PositionAffordability | null
  hasActiveRevenue: boolean
  netWeeklyCash: number
  runwayWeeks: number | null
}): { recovery: RecoveryPosition; reasons: string[] } {
  const reasons: string[] = []
  if (!inp.films.length || inp.cheapest == null) {
    return {
      recovery: 'incomplete',
      reasons: ['No released films or economy data yet — nothing to summarize about capital position.'],
    }
  }
  const cheapestOk = inp.cheapest.affordable
  const typicalOk = inp.typicalRecent?.affordable ?? false
  const waitingHelps = inp.netWeeklyCash >= 0

  if (!cheapestOk) {
    reasons.push('The cheapest legal production is not currently affordable — no normal production is available.')
    if (!inp.hasActiveRevenue) reasons.push('No active theatrical run is generating additional revenue.')
    return { recovery: 'noNormalProduction', reasons }
  }
  reasons.push('The cheapest legal production is affordable — a legal action exists.')
  if (typicalOk && waitingHelps) {
    reasons.push('A film at your recent typical commitment is affordable and cash is not shrinking — position is healthy.')
    return { recovery: 'healthy', reasons }
  }
  if (!typicalOk) reasons.push('A film at your recent typical commitment is NOT affordable.')
  if (!inp.hasActiveRevenue) reasons.push('No active theatrical run is generating additional revenue.')
  if (!waitingHelps) reasons.push('Waiting reduces cash each week under current commitments.')

  const severe = !typicalOk && !inp.hasActiveRevenue && inp.runwayWeeks != null
  if (severe) {
    reasons.push('Recovery depends on cheaper films and time — a reasonable path exists but is constrained.')
    return { recovery: 'severe', reasons }
  }
  reasons.push('The position is constrained but recoverable (active revenue or a long runway supports recovery).')
  return { recovery: 'constrained', reasons }
}

// ── inflection points (bounded, high-value) ──────────────────────────────────────
function computeInflections(
  cashTimeline: { week: number; cash: number }[],
  films: RecapFilm[],
  talent: RecapTalent[],
  position: CurrentPosition,
  startingCash: number,
): InflectionPoint[] {
  const pts: InflectionPoint[] = []
  if (cashTimeline.length) {
    const peak = cashTimeline.reduce((a, b) => (b.cash > a.cash ? b : a), { week: 0, cash: startingCash })
    const trough = cashTimeline.reduce((a, b) => (b.cash < a.cash ? b : a))
    pts.push({
      kind: 'peakCash',
      week: peak.week,
      label: 'Highest cash',
      value: peak.cash,
      evidence: `Cash peaked at week ${peak.week}.`,
    })
    pts.push({
      kind: 'lowestCash',
      week: trough.week,
      label: 'Lowest cash',
      value: trough.cash,
      evidence: `Cash bottomed at week ${trough.week}.`,
    })
    // first week cash fell below the typical-recent commitment (normal production unaffordable)
    const typical = position.typicalRecent?.commitment
    if (typical != null) {
      const crossed = cashTimeline.find((c) => c.cash < typical)
      if (crossed)
        pts.push({
          kind: 'firstTypicalUnaffordable',
          week: crossed.week,
          label: 'Normal production became unaffordable',
          value: crossed.cash,
          evidence: `Cash first fell below the typical recent commitment (~${Math.round(typical)}) at week ${crossed.week}.`,
        })
    }
  }
  const firstLoss = films.find((f) => f.classification === 'loss')
  if (firstLoss)
    pts.push({
      kind: 'firstLoss',
      week: firstLoss.releaseWeek,
      label: 'First loss film',
      value: firstLoss.contribution ?? 0,
      evidence: `"${firstLoss.title}" (week ${firstLoss.releaseWeek}) was the first loss.`,
    })
  const withContribution = films.filter((f) => f.contribution != null)
  if (withContribution.length) {
    const worst = withContribution.reduce((a, b) => (b.contribution! < a.contribution! ? b : a))
    pts.push({
      kind: 'worstContribution',
      week: worst.releaseWeek,
      label: 'Worst film contribution',
      value: worst.contribution!,
      evidence: `"${worst.title}" contributed ${Math.round(worst.contribution!)}.`,
    })
    const best = withContribution.reduce((a, b) => (b.contribution! > a.contribution! ? b : a))
    pts.push({
      kind: 'bestContribution',
      week: best.releaseWeek,
      label: 'Best film contribution',
      value: best.contribution!,
      evidence: `"${best.title}" contributed ${Math.round(best.contribution!)}.`,
    })
  }
  const topDev = talent.length ? talent.reduce((a, b) => (b.ovrChange > a.ovrChange ? b : a)) : null
  if (topDev && topDev.ovrChange > 0)
    pts.push({
      kind: 'strongestDevelopment',
      week: 0,
      label: 'Strongest talent development',
      value: topDev.ovrChange,
      evidence: `${topDev.name} improved by +${topDev.ovrChange} OVR across ${topDev.filmCount} films.`,
    })
  return pts.slice(0, MAX_INFLECTION_POINTS)
}

// ── warnings (bounded, evidence-linked, non-deterministic about future randomness) ──
function computeWarnings(
  summary: RunSummary,
  position: CurrentPosition,
  concentration: Concentration,
): RecapWarning[] {
  const w: RecapWarning[] = []
  const cashPositive = position.currentCash > 0
  const normalUnaffordable = position.typicalRecent ? !position.typicalRecent.affordable : false

  if (cashPositive && normalUnaffordable)
    w.push({
      code: 'cashPositiveButNormalUnaffordable',
      severity: 'serious',
      text: 'Cash is positive, but a film at your recent typical commitment is not affordable. "Cash positive" is not the same as "able to finance your next normal film."',
      evidence: `Cash ${Math.round(position.currentCash)} vs typical recent commitment ${position.typicalRecent?.commitment ?? '—'}.`,
    })
  if (!position.hasActiveRevenue)
    w.push({
      code: 'noActiveRevenue',
      severity: 'caution',
      text: 'No active theatrical run is generating additional revenue right now.',
      evidence: 'No theatrical run is in its paying weeks.',
    })
  if (!position.waitingHelps)
    w.push({
      code: 'waitingBurnsCash',
      severity: 'caution',
      text: `Waiting reduces cash by about ${Math.round(-position.netWeeklyCash)} per week under current commitments.`,
      evidence: `Net weekly cash ${Math.round(position.netWeeklyCash)} (revenue ${Math.round(position.activeRunRevenue)} − burn ${Math.round(position.currentWeeklyBurn)}).`,
    })
  if (position.cheapest && position.typicalRecent && position.cheapest.affordable && !position.typicalRecent.affordable)
    w.push({
      code: 'optionsBelowTypical',
      severity: 'info',
      text: 'Your affordable film options are materially below your recent typical commitment.',
      evidence: `Cheapest legal ~${position.cheapest.commitment} affordable; typical ~${position.typicalRecent.commitment} short by ${position.typicalRecent.shortfall}.`,
    })
  if (summary.longestLossStreak >= 2)
    w.push({
      code: 'repeatedLosses',
      severity: 'caution',
      text: `Repeated losses: ${summary.lossFilmCount} of ${summary.releasedFilmCount} films lost money, with a streak of ${summary.longestLossStreak} in a row.`,
      evidence: `${summary.lossFilmCount} loss films; longest streak ${summary.longestLossStreak}.`,
    })
  if (concentration.topGenre && concentration.topGenre.share >= 0.6)
    w.push({
      code: 'highGenreConcentration',
      severity: 'info',
      text: `High genre concentration: ${Math.round(concentration.topGenre.share * 100)}% of releases were ${concentration.topGenre.key}. This concentrates exposure to the same audience assumptions.`,
      evidence: `${concentration.topGenre.count}/${concentration.filmCount} ${concentration.topGenre.key}.`,
    })
  if (concentration.topLead && concentration.topLead.share >= 0.6)
    w.push({
      code: 'highLeadConcentration',
      severity: 'info',
      text: `High lead concentration: ${concentration.topLead.key} led ${concentration.topLead.count} of ${concentration.filmCount} releases.`,
      evidence: `${concentration.topLead.count}/${concentration.filmCount} led by ${concentration.topLead.key}.`,
    })
  if (normalUnaffordable && summary.lossFilmCount >= 1)
    w.push({
      code: 'oneMoreFailureNarrowsOptions',
      severity: 'caution',
      text: 'Another loss similar to your recent losses would reduce normal production options further.',
      evidence: 'Normal production is already unaffordable; further losses shrink the affordable set.',
    })
  return w
}
