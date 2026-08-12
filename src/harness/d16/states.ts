// ── D-16 · weekly financial-state classifier ─────────────────────────────────
// ANALYSIS ONLY. Never imported by src/core/** or ui/src/**.
//
// A0 §6.2: the shipped fleet tracks distress with three coarse scalars
// (`everNeg`, `minCash`, a 3-week stall counter). D-16 needs a per-week LABEL.
//
// THE LADDER — mutually exclusive, evaluated STRICTLY IN THIS ORDER, first match wins:
//
//   insolvent     cash < 0
//   noProduction  cash ≥ 0, the BARE-MINIMUM package is unaffordable
//   bareMinOnly   the bare-minimum package is affordable, the STANDARD package is not
//   constrained   the standard package is affordable, but post-commitment runway < 26 wk
//   healthy       the standard package is affordable AND post-commitment runway ≥ 26 wk
//
// Written top-down as insolvent → noProduction → bareMinOnly → constrained → healthy so
// the mutual exclusion is structural, not a convention. The brief lists the ladder in the
// opposite direction; the partition is identical.
//
// PARITY (Lesson AC). "Affordable" is NEVER a lookalike formula. Both package costs come
// from `d16/packages`, whose `committedCost` is built by the SAME rule the greenlight
// action charges, and affordability is `canAfford(state, committedCost)` — the exact
// function actions.ts:437 enforces.
//
// PARITY NOTE vs `studioRunRecap.position` (A2 §7.8). The engine's own recap models its
// STANDARD package with `STANDARD_DEMAND = 1.0`, a demand multiplier NO legal shape can
// produce (the 36 shapes yield 0.81225 … 1.38; the closest is 0.9975), and it ROUNDS the
// negative while `cheapestPackage` deliberately does not. D-16's standard package is a
// BUILDABLE shape (the legal shape whose demand is closest to 1.0) so that `states.ts`
// classifies against a film the player can actually greenlight. Consequence: D-16's
// `standard` cost differs from `recap.position.standard` by ≈0.25 % plus rounding. The
// recap's `cheapest` IS parity-tested upstream and D-16's bare minimum reproduces it
// (same concept, same min-demand shape, same 0.75× / $100k grid) — locked by states.test.ts.
//
// RUNWAY. `commitmentPreview(state, cost).postRunway` — the engine's own post-commitment
// runway (economyView.ts:117-136). `weeks === null` means net-cash-positive, which is
// treated as ≥ any threshold (infinite runway).

// EXCLUSIVITY IS NOT DISTRESS. The classifier prices its two reference packages with
// `ignoreBusy: true`, so "my roster is mid-shoot" is never reported as a financial state.
// That matches `studioRunRecap.position`, which reads `state.contracts` and never
// `busyTalentIds`. The packages it builds are COST references, never greenlit.

import { TUNING, canAfford } from '../../core/index.js'
import type { GameState } from '../../core/index.js'
import { STATE_PACKAGE_OPTIONS, bareMinimumPackage, packagePreview, standardPackage } from './packages.js'
import type { D16Package } from './packages.js'

/** The buffer a "healthy" studio must retain AFTER committing to a standard film. */
export const HEALTHY_RUNWAY_WEEKS = 26

export type FinancialState = 'healthy' | 'constrained' | 'bareMinOnly' | 'noProduction' | 'insolvent'

/** Fixed severity order, worst → best. Used for trajectory comparisons. */
export const STATE_SEVERITY: Record<FinancialState, number> = {
  insolvent: 0,
  noProduction: 1,
  bareMinOnly: 2,
  constrained: 3,
  healthy: 4,
}

export type StateAssessment = {
  state: FinancialState
  cash: number
  week: number
  bareMinimumCost: number | null
  bareMinimumAffordable: boolean
  standardCost: number | null
  standardAffordable: boolean
  /** post-commitment runway for the STANDARD package; null = net-cash-positive (infinite). */
  postStandardRunwayWeeks: number | null
  /** true when NO package could be assembled at all (roster cannot field a film). */
  cannotFieldFilm: boolean
}

export type ClassifyOptions = {
  /** reuse already-computed packages (the driver builds them once per week). */
  bareMinimum?: D16Package | null
  standard?: D16Package | null
  healthyRunwayWeeks?: number
}

export function assessFinancialState(state: GameState, opts: ClassifyOptions = {}): StateAssessment {
  const threshold = opts.healthyRunwayWeeks ?? HEALTHY_RUNWAY_WEEKS
  const bare = opts.bareMinimum !== undefined ? opts.bareMinimum : bareMinimumPackage(state, STATE_PACKAGE_OPTIONS)
  const std = opts.standard !== undefined ? opts.standard : standardPackage(state, STATE_PACKAGE_OPTIONS)
  const cash = state.studio.cash
  const week = state.market.tick

  const bareCost = bare?.committedCost ?? null
  const stdCost = std?.committedCost ?? null
  const bareAffordable = bare !== null && bare !== undefined && canAfford(state, bare.committedCost).ok
  const stdAffordable = std !== null && std !== undefined && canAfford(state, std.committedCost).ok
  const postStandardRunwayWeeks =
    std !== null && std !== undefined ? packagePreview(state, std).postRunway.weeks : null

  let label: FinancialState
  if (cash < 0) label = 'insolvent'
  else if (!bareAffordable) label = 'noProduction'
  else if (!stdAffordable) label = 'bareMinOnly'
  else if (postStandardRunwayWeeks !== null && postStandardRunwayWeeks < threshold) label = 'constrained'
  else label = 'healthy'

  return {
    state: label,
    cash,
    week,
    bareMinimumCost: bareCost,
    bareMinimumAffordable: bareAffordable,
    standardCost: stdCost,
    standardAffordable: stdAffordable,
    postStandardRunwayWeeks,
    cannotFieldFilm: bare === null || bare === undefined,
  }
}

export function classifyFinancialState(state: GameState, opts: ClassifyOptions = {}): FinancialState {
  return assessFinancialState(state, opts).state
}

// ── run-level episode derivation ─────────────────────────────────────────────

export type StateSeriesPoint = { week: number; state: FinancialState; cash: number }

export type EpisodeSummary = {
  /** first week the STANDARD package was unaffordable (state worse than `constrained`). */
  distressEntryWeek: number | null
  /** first week AFTER distress entry at which the run is `healthy` again. */
  recoveryWeek: number | null
  /** first week AFTER distress entry at which the run reaches `constrained` (or better). */
  partialRecoveryWeek: number | null
  weeksToRecovery: number | null
  weeksToPartialRecovery: number | null
  recovered: boolean
  partiallyRecovered: boolean
  /** ended in noProduction/insolvent AND cash trajectory over the final quarter is ≤ 0. */
  terminalDecline: boolean
  /** cash ever reached ≥ 3 × the run's OWN opening cash (see `runawayCash`). */
  runawaySuccess: boolean
  /** the threshold `runawaySuccess` was measured against — emitted so it is never implicit. */
  runawayThreshold: number
  weeksInsolvent: number
  weeksNoProduction: number
  weeksBareMinOnly: number
  weeksConstrained: number
  weeksHealthy: number
  minCash: number
  maxCash: number
  endCash: number
  endState: FinancialState | null
}

/** How many times its opening cash a run must reach to count as a runaway success. */
export const RUNAWAY_MULTIPLE = 3

/**
 * Cash ≥ this is a runaway success.
 *
 * B2-M6 FIX: this used to be `export const RUNAWAY_CASH = 3 * TUNING.INITIAL_CASH`, frozen
 * at MODULE LOAD — i.e. before `withTuningOverrides` opens its scope. `INITIAL_CASH` is the
 * FIRST entry of `TUNING_ALLOWLIST` and a sanctioned sweep, so the constant silently
 * corrupted `runawaySuccess`/`runawayRate` on exactly the run it was designed for. A
 * FUNCTION reads `TUNING` at call time, so the override binds.
 *
 * It also takes the run's OWN opening cash (B2-C10): a run resumed from the Week-86 save
 * opens at $2.83M and must not be measured against a $60M bar derived from a start it never
 * had. For a fresh run `openingCash === TUNING.INITIAL_CASH` (founding signing bonuses draw
 * the recruitment fund, not cash — `types.ts:348-349`), so the default is unchanged.
 */
export function runawayCash(openingCash: number = TUNING.INITIAL_CASH): number {
  return RUNAWAY_MULTIPLE * openingCash
}

export type EpisodeOptions = {
  /** cash threshold for `runawaySuccess`. Defaults to `runawayCash()` read at CALL time. */
  runawayCash?: number
}

/**
 * Derive the episode structure from a weekly (or sampled) state series.
 * DISTRESS = the standard package is unaffordable, i.e. state ∈ {bareMinOnly,
 * noProduction, insolvent}. RECOVERY = reaching `healthy` after that; PARTIAL =
 * reaching `constrained` or better. Both are measured from the FIRST distress entry.
 */
export function summarizeEpisodes(
  series: readonly StateSeriesPoint[],
  opts: EpisodeOptions = {},
): EpisodeSummary {
  const runawayThreshold = opts.runawayCash ?? runawayCash()
  const counts: Record<FinancialState, number> = {
    healthy: 0,
    constrained: 0,
    bareMinOnly: 0,
    noProduction: 0,
    insolvent: 0,
  }
  let distressEntryWeek: number | null = null
  let recoveryWeek: number | null = null
  let partialRecoveryWeek: number | null = null
  let minCash = Infinity
  let maxCash = -Infinity

  for (const pt of series) {
    counts[pt.state] += 1
    if (pt.cash < minCash) minCash = pt.cash
    if (pt.cash > maxCash) maxCash = pt.cash
    const distressed = STATE_SEVERITY[pt.state] <= STATE_SEVERITY.bareMinOnly
    if (distressed && distressEntryWeek === null) distressEntryWeek = pt.week
    if (distressEntryWeek !== null && pt.week > distressEntryWeek) {
      if (partialRecoveryWeek === null && STATE_SEVERITY[pt.state] >= STATE_SEVERITY.constrained) {
        partialRecoveryWeek = pt.week
      }
      if (recoveryWeek === null && pt.state === 'healthy') recoveryWeek = pt.week
    }
  }

  const last = series.length > 0 ? series[series.length - 1]! : null
  const endState = last?.state ?? null
  const endCash = last?.cash ?? NaN

  // terminal decline: ends in noProduction/insolvent AND the final-quarter cash slope ≤ 0.
  // The lookback index is strictly BEFORE the last point (at least one step back), so a
  // 4-point series does not compare the last point with itself and read a slope of 0.
  let terminalDecline = false
  if (endState !== null && STATE_SEVERITY[endState] <= STATE_SEVERITY.noProduction && series.length >= 2) {
    const back = Math.max(1, Math.floor(series.length / 4))
    const from = series[Math.max(0, series.length - 1 - back)]!
    terminalDecline = endCash - from.cash <= 0
  }

  return {
    distressEntryWeek,
    recoveryWeek,
    partialRecoveryWeek,
    weeksToRecovery: distressEntryWeek !== null && recoveryWeek !== null ? recoveryWeek - distressEntryWeek : null,
    weeksToPartialRecovery:
      distressEntryWeek !== null && partialRecoveryWeek !== null ? partialRecoveryWeek - distressEntryWeek : null,
    recovered: recoveryWeek !== null,
    partiallyRecovered: partialRecoveryWeek !== null,
    terminalDecline,
    runawaySuccess: series.length > 0 && maxCash >= runawayThreshold,
    runawayThreshold,
    weeksInsolvent: counts.insolvent,
    weeksNoProduction: counts.noProduction,
    weeksBareMinOnly: counts.bareMinOnly,
    weeksConstrained: counts.constrained,
    weeksHealthy: counts.healthy,
    minCash: series.length > 0 ? minCash : NaN,
    maxCash: series.length > 0 ? maxCash : NaN,
    endCash,
    endState,
  }
}
