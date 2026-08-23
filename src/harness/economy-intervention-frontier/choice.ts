// Economy Intervention Frontier 03 — analysis-only film-choice frontier.
//
// This is deliberately a P5 clone everywhere except its visible package-choice
// rule.  It uses the established founding roster, maintenance/renewal law, full
// roster-scoped package universe, affordability gate, and D17B macro runner.
// Nothing here is imported by production code.

import type { Action } from '../../core/index.js'
import { runOne } from '../d16/driver.js'
import type { AnalysisCashPlan, RunRecord } from '../d16/driver.js'
import type { D16Package, PackageEvaluation } from '../d16/packages.js'
import { forecastProfitMax, maintenanceActions } from '../d16/policies.js'
import type { PlayerCtx, PlayerPolicy } from '../d16/policies.js'
import type { PlayerView } from '../d16/view.js'
import {
  MACRO_HORIZON_WEEKS,
  MACRO_SLICE_WEEKS,
  compactMacroRun,
} from '../economy-truth-audit/macro.js'
import type { MacroRunCompact } from '../economy-truth-audit/macro.js'
import { distribution, pairedEffect, rate } from '../economy-truth-audit/statistics.js'
import type { Distribution, PairedEffect, RateEstimate } from '../economy-truth-audit/statistics.js'

export const CHOICE_FRONTIER_SCHEMA_VERSION =
  'economy-intervention-choice-v1' as const

/**
 * A deliberately small set of player-explainable decision cards.  There is no
 * fitted or hidden score: each card can be described in one sentence in the UI.
 */
export const CHOICE_ARMS = [
  'D03_absoluteProfitBaseline',
  'D03_downsideBudget_0_5',
  'D03_downsideBudget_1',
  'D03_nearBestProfit_80_leastCapital',
  'D03_nearBestProfit_80_leastCapital_activeFallback',
  'D03_downsideHalf_nearBest80_leastCapital_activeFallback',
  'D03_nearBestProfit_60_leastCapital',
  'D03_runwayReserve_52',
] as const

export type ChoiceArm = (typeof CHOICE_ARMS)[number]

type ChoiceRule =
  | { kind: 'absoluteProfit' }
  | { kind: 'downsideBudget'; maximumLowLossShare: 0.5 | 1 }
  | {
      kind: 'nearBestLeastCapital'
      retainPositiveProfit: 0.8 | 0.6
      /** What a player does when every affordable package forecasts a loss. */
      nonPositiveFallback: 'abstain' | 'highestForecastContribution'
    }
  | {
      kind: 'downsideNearBestLeastCapital'
      maximumLowLossShare: 0.5
      retainPositiveProfit: 0.8
    }
  | { kind: 'runwayReserve'; minimumWeeks: 52 }

export type ChoiceArmDefinition = {
  arm: ChoiceArm
  playerFacingRule: string
  rule: ChoiceRule
}

export const CHOICE_ARM_DEFINITIONS: Readonly<Record<ChoiceArm, ChoiceArmDefinition>> = {
  D03_absoluteProfitBaseline: {
    arm: 'D03_absoluteProfitBaseline',
    playerFacingRule: 'Choose the affordable package with the highest forecast profit.',
    rule: { kind: 'absoluteProfit' },
  },
  D03_downsideBudget_0_5: {
    arm: 'D03_downsideBudget_0_5',
    playerFacingRule:
      'Choose the highest forecast profit only when the low forecast loses no more than half the committed cost.',
    rule: { kind: 'downsideBudget', maximumLowLossShare: 0.5 },
  },
  D03_downsideBudget_1: {
    arm: 'D03_downsideBudget_1',
    playerFacingRule:
      'Choose the highest forecast profit only when the low forecast loses no more than the committed cost.',
    rule: { kind: 'downsideBudget', maximumLowLossShare: 1 },
  },
  D03_nearBestProfit_80_leastCapital: {
    arm: 'D03_nearBestProfit_80_leastCapital',
    playerFacingRule:
      'Among packages keeping at least 80% of the best positive forecast profit, choose the least capital-intensive.',
    rule: {
      kind: 'nearBestLeastCapital',
      retainPositiveProfit: 0.8,
      nonPositiveFallback: 'abstain',
    },
  },
  D03_nearBestProfit_80_leastCapital_activeFallback: {
    arm: 'D03_nearBestProfit_80_leastCapital_activeFallback',
    playerFacingRule:
      'Among packages keeping at least 80% of the best positive forecast profit, choose the least capital-intensive; if none forecasts a profit, choose the least-bad affordable package.',
    rule: {
      kind: 'nearBestLeastCapital',
      retainPositiveProfit: 0.8,
      nonPositiveFallback: 'highestForecastContribution',
    },
  },
  D03_downsideHalf_nearBest80_leastCapital_activeFallback: {
    arm: 'D03_downsideHalf_nearBest80_leastCapital_activeFallback',
    playerFacingRule:
      'Prefer packages whose low forecast loses no more than half their committed cost; among those keeping at least 80% of the best positive forecast profit, choose the least capital-intensive; if none qualifies, choose the least-bad affordable package.',
    rule: {
      kind: 'downsideNearBestLeastCapital',
      maximumLowLossShare: 0.5,
      retainPositiveProfit: 0.8,
    },
  },
  D03_nearBestProfit_60_leastCapital: {
    arm: 'D03_nearBestProfit_60_leastCapital',
    playerFacingRule:
      'Among packages keeping at least 60% of the best positive forecast profit, choose the least capital-intensive.',
    rule: {
      kind: 'nearBestLeastCapital',
      retainPositiveProfit: 0.6,
      nonPositiveFallback: 'abstain',
    },
  },
  D03_runwayReserve_52: {
    arm: 'D03_runwayReserve_52',
    playerFacingRule:
      'Choose the highest forecast profit only if the commitment leaves at least 52 weeks of current-commitment runway.',
    rule: { kind: 'runwayReserve', minimumWeeks: 52 },
  },
}

export type ChoiceCandidate = {
  /** Stable package id; this is the final deterministic tie-break. */
  id: string
  committedCost: number
  /** Player-visible low edge of the forecast contribution band. */
  forecastLow: number
  /** Player-visible forecast profit centre. */
  forecastCenter: number
  /** The player-visible post-commitment current-commitment runway. */
  postRunwayWeeks: number | null
  postRunwayInfinite: boolean
}

export type ChoiceDecisionReason =
  | 'selected'
  | 'noAffordablePackage'
  | 'noPositiveProfit'
  | 'criterionRejected'

export type ChoiceDecision = {
  selected: ChoiceCandidate | null
  reason: ChoiceDecisionReason
  qualifyingCandidates: number
}

function greaterThenStableId(
  left: ChoiceCandidate,
  right: ChoiceCandidate | null,
  score: (candidate: ChoiceCandidate) => number,
): boolean {
  if (right === null) return true
  const difference = score(left) - score(right)
  return difference > 0 || (difference === 0 && left.id < right.id)
}

function maxCenter(candidates: readonly ChoiceCandidate[]): ChoiceCandidate | null {
  let best: ChoiceCandidate | null = null
  for (const candidate of candidates) {
    if (greaterThenStableId(candidate, best, (entry) => entry.forecastCenter)) best = candidate
  }
  return best
}

function leastCapital(candidates: readonly ChoiceCandidate[]): ChoiceCandidate | null {
  let best: ChoiceCandidate | null = null
  for (const candidate of candidates) {
    if (
      best === null ||
      candidate.committedCost < best.committedCost ||
      (candidate.committedCost === best.committedCost && candidate.id < best.id)
    ) {
      best = candidate
    }
  }
  return best
}

/**
 * Pure, player-information-only decision kernel. `candidates` must already have
 * passed the authoritative affordability gate; no GameState is accepted here.
 */
export function chooseChoiceCandidate(
  arm: ChoiceArm,
  candidates: readonly ChoiceCandidate[],
): ChoiceDecision {
  if (candidates.length === 0) {
    return { selected: null, reason: 'noAffordablePackage', qualifyingCandidates: 0 }
  }
  const rule = CHOICE_ARM_DEFINITIONS[arm].rule
  if (rule.kind === 'absoluteProfit') {
    return {
      selected: maxCenter(candidates),
      reason: 'selected',
      qualifyingCandidates: candidates.length,
    }
  }
  if (rule.kind === 'downsideBudget') {
    const qualifying = candidates.filter(
      (candidate) => candidate.forecastLow >= -rule.maximumLowLossShare * candidate.committedCost,
    )
    return qualifying.length === 0
      ? { selected: null, reason: 'criterionRejected', qualifyingCandidates: 0 }
      : { selected: maxCenter(qualifying), reason: 'selected', qualifyingCandidates: qualifying.length }
  }
  if (rule.kind === 'nearBestLeastCapital') {
    const bestPositive = Math.max(...candidates.map((candidate) => candidate.forecastCenter))
    if (!(bestPositive > 0)) {
      if (rule.nonPositiveFallback === 'highestForecastContribution') {
        return {
          selected: maxCenter(candidates),
          reason: 'selected',
          qualifyingCandidates: candidates.length,
        }
      }
      return { selected: null, reason: 'noPositiveProfit', qualifyingCandidates: 0 }
    }
    const qualifying = candidates.filter(
      (candidate) => candidate.forecastCenter >= bestPositive * rule.retainPositiveProfit,
    )
    return {
      selected: leastCapital(qualifying),
      reason: 'selected',
      qualifyingCandidates: qualifying.length,
    }
  }
  if (rule.kind === 'downsideNearBestLeastCapital') {
    const downsideQualified = candidates.filter(
      (candidate) => candidate.forecastLow >= -rule.maximumLowLossShare * candidate.committedCost,
    )
    const bestPositive =
      downsideQualified.length === 0
        ? Number.NEGATIVE_INFINITY
        : Math.max(...downsideQualified.map((candidate) => candidate.forecastCenter))
    if (!(bestPositive > 0)) {
      return {
        selected: maxCenter(candidates),
        reason: 'selected',
        qualifyingCandidates: candidates.length,
      }
    }
    const qualifying = downsideQualified.filter(
      (candidate) => candidate.forecastCenter >= bestPositive * rule.retainPositiveProfit,
    )
    return {
      selected: leastCapital(qualifying),
      reason: 'selected',
      qualifyingCandidates: qualifying.length,
    }
  }
  const qualifying = candidates.filter(
    (candidate) =>
      candidate.postRunwayInfinite ||
      (candidate.postRunwayWeeks !== null && candidate.postRunwayWeeks >= rule.minimumWeeks),
  )
  return qualifying.length === 0
    ? { selected: null, reason: 'criterionRejected', qualifyingCandidates: 0 }
    : { selected: maxCenter(qualifying), reason: 'selected', qualifyingCandidates: qualifying.length }
}

export type ChoiceSelectionDiagnostic = {
  week: number
  packageId: string
  forecastLow: number
  forecastCenter: number
  committedCost: number
  marketing: number
  qualifyingCandidates: number
}

export type ChoiceDiagnostics = {
  arm: ChoiceArm
  decisionOpportunities: number
  eligibleFailures: {
    noAffordablePackage: number
    noPositiveProfit: number
    criterionRejected: number
  }
  selections: ChoiceSelectionDiagnostic[]
  marketingDiversity: {
    distinctBudgets: number
    hhi: number | null
    byBudget: Record<string, number>
  }
}

type ChoiceDiagnosticsMemo = {
  decisionOpportunities: number
  noAffordablePackage: number
  noPositiveProfit: number
  criterionRejected: number
  selections: ChoiceSelectionDiagnostic[]
}

function newDiagnosticsMemo(): ChoiceDiagnosticsMemo {
  return {
    decisionOpportunities: 0,
    noAffordablePackage: 0,
    noPositiveProfit: 0,
    criterionRejected: 0,
    selections: [],
  }
}

function finalizeDiagnostics(arm: ChoiceArm, memo: ChoiceDiagnosticsMemo): ChoiceDiagnostics {
  const byBudget: Record<string, number> = {}
  for (const selected of memo.selections) {
    const key = String(selected.marketing)
    byBudget[key] = (byBudget[key] ?? 0) + 1
  }
  const total = memo.selections.length
  const shares = Object.values(byBudget).map((count) => count / total)
  return {
    arm,
    decisionOpportunities: memo.decisionOpportunities,
    eligibleFailures: {
      noAffordablePackage: memo.noAffordablePackage,
      noPositiveProfit: memo.noPositiveProfit,
      criterionRejected: memo.criterionRejected,
    },
    selections: memo.selections.map((selection) => ({ ...selection })),
    marketingDiversity: {
      distinctBudgets: Object.keys(byBudget).length,
      hhi: total === 0 ? null : shares.reduce((sum, share) => sum + share * share, 0),
      byBudget,
    },
  }
}

function greenlightAction(pkg: D16Package): Action {
  return {
    kind: 'greenlight',
    production: {
      conceptId: pkg.conceptId,
      shape: pkg.shape,
      promise: pkg.promise,
      writerId: pkg.writerId,
      directorId: pkg.directorId,
      craftIds: [...pkg.craftIds],
      cast: { ...pkg.cast },
      budget: { ...pkg.budget },
    },
  }
}

type CandidateWithPackage = ChoiceCandidate & {
  pkg: D16Package
  evaluation: PackageEvaluation
}

function candidateFor(
  pkg: D16Package,
  evaluation: PackageEvaluation,
  ctx: PlayerCtx,
  includeRunway: boolean,
): CandidateWithPackage {
  const preview = includeRunway ? ctx.preview(pkg) : null
  return {
    id: pkg.id,
    pkg,
    evaluation,
    committedCost: pkg.committedCost,
    forecastLow: evaluation.profit.profit.low,
    forecastCenter: evaluation.centerProfit,
    postRunwayWeeks: preview?.postRunway.weeks ?? null,
    postRunwayInfinite: preview?.postRunway.infinite ?? false,
  }
}

function choiceDecision(
  arm: ChoiceArm,
  policy: PlayerPolicy,
  view: PlayerView,
  ctx: PlayerCtx,
  memo: ChoiceDiagnosticsMemo,
): Action[] {
  const maintenance = maintenanceActions(view, policy.roster)
  if (maintenance.length > 0) return maintenance
  if (view.activeProductions.length >= ctx.maxConcurrent) return []

  memo.decisionOpportunities += 1
  const includeRunway = CHOICE_ARM_DEFINITIONS[arm].rule.kind === 'runwayReserve'
  const candidates: CandidateWithPackage[] = []
  for (const pkg of ctx.packages().packages) {
    // Match P5's authoritative affordability-first evaluation order exactly.
    if (!ctx.affordable(pkg)) continue
    candidates.push(candidateFor(pkg, ctx.evaluate(pkg), ctx, includeRunway))
  }
  const decision = chooseChoiceCandidate(arm, candidates)
  if (decision.selected === null) {
    if (decision.reason === 'noAffordablePackage') memo.noAffordablePackage += 1
    else if (decision.reason === 'noPositiveProfit') memo.noPositiveProfit += 1
    else memo.criterionRejected += 1
    return []
  }
  const selected = candidates.find((candidate) => candidate.id === decision.selected!.id)
  if (selected === undefined) throw new Error(`choice frontier: selected package ${decision.selected.id} disappeared`)
  memo.selections.push({
    week: ctx.week,
    packageId: selected.id,
    forecastLow: selected.forecastLow,
    forecastCenter: selected.forecastCenter,
    committedCost: selected.committedCost,
    marketing: selected.pkg.marketing,
    qualifyingCandidates: decision.qualifyingCandidates,
  })
  return [greenlightAction(selected.pkg)]
}

/** A fresh policy owns a fresh memo: no diagnostic state can cross a run boundary. */
export function choicePolicy(arm: ChoiceArm, memo: ChoiceDiagnosticsMemo = newDiagnosticsMemo()): PlayerPolicy {
  const policy: PlayerPolicy = {
    name: arm,
    kind: 'player',
    disengagementIntended: false,
    description: `Intervention-frontier P5 clone. ${CHOICE_ARM_DEFINITIONS[arm].playerFacingRule}`,
    founding: structuredClone(forecastProfitMax.founding),
    roster: structuredClone(forecastProfitMax.roster),
    decide(view, ctx) {
      return choiceDecision(arm, policy, view, ctx, memo)
    },
  }
  return policy
}

export function runChoiceRecord(
  seed: string,
  arm: ChoiceArm,
  analysisCashPlan?: AnalysisCashPlan,
): { record: RunRecord; diagnostics: ChoiceDiagnostics } {
  const memo = newDiagnosticsMemo()
  const record = runOne({
    seed,
    policy: choicePolicy(arm, memo),
    horizonWeeks: MACRO_HORIZON_WEEKS,
    sliceWeeks: MACRO_SLICE_WEEKS,
    checkpointEvery: 26,
    productionD17b: true,
    awarenessStats: true,
    captureLedgerAtSlices: true,
    ...(analysisCashPlan === undefined ? {} : { analysisCashPlan }),
  })
  return { record, diagnostics: finalizeDiagnostics(arm, memo) }
}

/** Macro endpoint plus compact, selection-time evidence for the same deterministic run. */
export type ChoiceRunCompact = MacroRunCompact & {
  choiceDiagnostics: ChoiceDiagnostics
}

export function runChoiceCell(seed: string, arm: ChoiceArm): ChoiceRunCompact {
  const { record, diagnostics } = runChoiceRecord(seed, arm)
  return { ...compactMacroRun(record), choiceDiagnostics: diagnostics }
}

export type ChoiceArmSummary = {
  arm: ChoiceArm
  runs: number
  endCash: Distribution
  maxCash: Distribution
  releases: Distribution
  noProductionWeeks: Distribution
  engagedWeekFraction: Distribution
  totalContribution: Distribution
  portfolioRoi: Distribution
  movieProfitRate: RateEstimate
  meanCommittedCost: Distribution
  meanMarketing: Distribution
  meanLeadFame: Distribution
  genreCount: Distribution
  genreHhi: Distribution
  runawayRate: RateEstimate
  distressRate: RateEstimate
  negativeEndingRate: RateEstimate
  terminalDeclineRate: RateEstimate
  durableRecoveryAt103AmongDistressed: RateEstimate
  rosterWallRate: RateEstimate
  reconciliationFailures: number
  unstaffableWeeks: Distribution
  selectedForecastLow: Distribution
  selectedForecastCenter: Distribution
  selectedCommittedCost: Distribution
  selectedMarketingHhi: Distribution
  decisionFailureRate: RateEstimate
}

/** Compact summaries for the report; raw run corpora remain outside Git. */
export function aggregateChoiceRuns(rows: readonly ChoiceRunCompact[]): ChoiceArmSummary[] {
  const byArm = new Map<ChoiceArm, ChoiceRunCompact[]>()
  for (const row of rows) {
    const group = byArm.get(row.choiceDiagnostics.arm)
    if (group === undefined) byArm.set(row.choiceDiagnostics.arm, [row])
    else group.push(row)
  }
  return [...byArm.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([arm, group]) => {
      const selections = group.flatMap((row) => row.choiceDiagnostics.selections)
      const failures = group.reduce(
        (sum, row) =>
          sum +
          row.choiceDiagnostics.eligibleFailures.noAffordablePackage +
          row.choiceDiagnostics.eligibleFailures.noPositiveProfit +
          row.choiceDiagnostics.eligibleFailures.criterionRejected,
        0,
      )
      const opportunities = group.reduce((sum, row) => sum + row.choiceDiagnostics.decisionOpportunities, 0)
      const distressed = group.filter((row) => row.distressEntryWeek !== null)
      const completedFilms = group.reduce(
        (sum, row) => sum + row.moviePortfolio.completedFilms,
        0,
      )
      const profitableFilms = group.reduce(
        (sum, row) => sum + row.moviePortfolio.profitableFilms,
        0,
      )
      return {
        arm,
        runs: group.length,
        endCash: distribution(group.map((row) => row.endCash)),
        maxCash: distribution(group.map((row) => row.maxCash)),
        releases: distribution(group.map((row) => row.filmsReleased)),
        noProductionWeeks: distribution(group.map((row) => row.weeksNoProduction)),
        engagedWeekFraction: distribution(group.map((row) => row.engagedWeekFraction)),
        totalContribution: distribution(group.map((row) => row.moviePortfolio.totalContribution)),
        portfolioRoi: distribution(
          group
            .map((row) => row.moviePortfolio.portfolioRoi)
            .filter((value): value is number => value !== null),
        ),
        movieProfitRate: rate(profitableFilms, completedFilms),
        meanCommittedCost: distribution(
          group
            .map((row) => row.moviePortfolio.meanCommittedCost)
            .filter((value): value is number => value !== null),
        ),
        meanMarketing: distribution(
          group
            .map((row) => row.moviePortfolio.meanMarketing)
            .filter((value): value is number => value !== null),
        ),
        genreCount: distribution(group.map((row) => row.moviePortfolio.genreCount)),
        genreHhi: distribution(
          group
            .map((row) => row.moviePortfolio.genreHhi)
            .filter((value): value is number => value !== null),
        ),
        meanLeadFame: distribution(
          group
            .map((row) => row.moviePortfolio.meanLeadFame)
            .filter((value): value is number => value !== null),
        ),
        runawayRate: rate(group.filter((row) => row.runawaySuccess).length, group.length),
        distressRate: rate(distressed.length, group.length),
        negativeEndingRate: rate(group.filter((row) => row.endCash < 0).length, group.length),
        terminalDeclineRate: rate(group.filter((row) => row.terminalDecline).length, group.length),
        durableRecoveryAt103AmongDistressed: rate(
          distressed.filter((row) => row.durableRecoveryAt103 === true).length,
          distressed.length,
        ),
        rosterWallRate: rate(group.filter((row) => row.rosterWallHit).length, group.length),
        reconciliationFailures: group.filter((row) => !row.reconciliationOk).length,
        unstaffableWeeks: distribution(group.map((row) => row.unstaffableWeeks)),
        selectedForecastLow: distribution(selections.map((selection) => selection.forecastLow)),
        selectedForecastCenter: distribution(selections.map((selection) => selection.forecastCenter)),
        selectedCommittedCost: distribution(selections.map((selection) => selection.committedCost)),
        selectedMarketingHhi: distribution(
          group
            .map((row) => row.choiceDiagnostics.marketingDiversity.hhi)
            .filter((value): value is number => value !== null),
        ),
        decisionFailureRate: rate(failures, opportunities),
      }
    })
}

/** Paired same-seed metric helper; the caller chooses a report-labelled endpoint. */
export function pairedChoiceEffect(
  rows: readonly ChoiceRunCompact[],
  left: ChoiceArm,
  right: ChoiceArm,
  metric: (row: ChoiceRunCompact) => number,
): PairedEffect {
  const values = (arm: ChoiceArm) =>
    new Map(rows.filter((row) => row.choiceDiagnostics.arm === arm).map((row) => [row.seed, metric(row)]))
  return pairedEffect(left, right, values(left), values(right))
}
