// Project: Studio economy truth audit — D-16/D-17B direct-package macro lens.
// Analysis only. The fidelity boundary is explicit in the aggregate and report: this path
// exercises current economy formulas and legal direct greenlights, not managed facilities.

import { runOne } from '../d16/driver.js'
import type { RunRecord } from '../d16/driver.js'
import {
  ALL_POLICIES,
  PUBLICITY_POLICIES,
  policyByName,
} from '../d16/policies.js'
import type { Policy } from '../d16/policies.js'
import { distribution, pairedEffect, rate } from './statistics.js'
import type { Distribution, PairedEffect, RateEstimate } from './statistics.js'

export const MACRO_SCHEMA_VERSION = 'economy-truth-macro-v1' as const
export const MACRO_HORIZON_WEEKS = 260
export const MACRO_SLICE_WEEKS = [52, 104, 156, 208, 260] as const
export const MACRO_SEED_COUNT = 1_000

export const NORMAL_PLAYER_POLICY_NAMES = ALL_POLICIES
  .filter((policy) => policy.kind === 'player' && !['P15', 'P16'].includes(policy.name.split('_')[0]!))
  .map((policy) => policy.name)

export const DIAGNOSTIC_POLICY_NAMES = [
  'P14_oracleEV',
  'P15_exploitDisengage',
  'P16_doNothing',
  'Q7_publicitySpamAdversary',
] as const

export const MACRO_POLICY_NAMES = [
  ...ALL_POLICIES.map((policy) => policy.name),
  ...PUBLICITY_POLICIES.map((policy) => policy.name),
] as const

export function macroSeed(indexOneBased: number): string {
  if (!Number.isInteger(indexOneBased) || indexOneBased < 1) {
    throw new Error(`economy truth audit: invalid macro seed index ${String(indexOneBased)}`)
  }
  return `eta-macro-${String(indexOneBased).padStart(4, '0')}`
}

export type MacroSlice = {
  week: number
  cash: number
  state: string
  filmsReleased: number
  audienceAwareness: number
  weeklyBurn: number
  ledgerTotals: Record<string, number>
}

export type MacroRunCompact = {
  schemaVersion: typeof MACRO_SCHEMA_VERSION
  seed: string
  policy: string
  policyKind: string
  horizonWeeks: number
  openingCash: number
  endCash: number
  minCash: number
  maxCash: number
  filmsReleased: number
  filmsGreenlit: number
  foundingHires: number
  engagedWeekFraction: number
  reconciliationOk: boolean
  rejectedActions: number
  unstaffableWeeks: number
  rosterWallHit: boolean
  rosterWallWeek: number | null
  distressEntryWeek: number | null
  recoveryWeek: number | null
  weeksToRecovery: number | null
  terminalDecline: boolean
  runawaySuccess: boolean
  weeksInsolvent: number
  weeksNoProduction: number
  weeksBareMinOnly: number
  weeksConstrained: number
  weeksHealthy: number
  durableRecoveryAt26: boolean | null
  durableRecoveryAt52: boolean | null
  durableRecoveryAt103: boolean | null
  publicitySpend: number
  publicityCount: number
  ledgerTotals: Record<string, number>
  slices: Record<string, MacroSlice>
  moviePortfolio: {
    completedFilms: number
    profitableFilms: number
    lossFilms: number
    totalCommittedCost: number
    totalStudioRevenue: number
    totalContribution: number
    portfolioRoi: number | null
    meanCommittedCost: number | null
    meanNegative: number | null
    meanMarketing: number | null
    meanLeadFame: number | null
    meanLeadOvr: number | null
    meanCritic: number | null
    genreCount: number
    genreHhi: number | null
    largestGenreShare: number | null
  }
}

function average(values: readonly number[]): number | null {
  if (values.length === 0) return null
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function compactPortfolio(record: RunRecord): MacroRunCompact['moviePortfolio'] {
  const films = record.films.filter(
    (film) =>
      film.releaseWeek !== null &&
      film.studioRevenue !== null &&
      film.contribution !== null &&
      film.realizedCritic !== null,
  )
  const totalCommittedCost = films.reduce((sum, film) => sum + film.committedCost, 0)
  const totalStudioRevenue = films.reduce((sum, film) => sum + film.studioRevenue!, 0)
  const totalContribution = films.reduce((sum, film) => sum + film.contribution!, 0)
  const genres = new Map<string, number>()
  for (const film of films) genres.set(film.genre, (genres.get(film.genre) ?? 0) + 1)
  const shares = [...genres.values()].map((count) => count / films.length)
  return {
    completedFilms: films.length,
    profitableFilms: films.filter((film) => film.contribution! > 0).length,
    lossFilms: films.filter((film) => film.contribution! < 0).length,
    totalCommittedCost,
    totalStudioRevenue,
    totalContribution,
    portfolioRoi: totalCommittedCost === 0 ? null : totalContribution / totalCommittedCost,
    meanCommittedCost: average(films.map((film) => film.committedCost)),
    meanNegative: average(films.map((film) => film.negative)),
    meanMarketing: average(films.map((film) => film.marketing)),
    meanLeadFame: average(films.map((film) => film.leadFame)),
    meanLeadOvr: average(films.map((film) => film.leadOVR)),
    meanCritic: average(films.map((film) => film.realizedCritic!)),
    genreCount: genres.size,
    genreHhi: films.length === 0 ? null : shares.reduce((sum, share) => sum + share * share, 0),
    largestGenreShare: films.length === 0 ? null : Math.max(...shares),
  }
}

export function compactMacroRun(record: RunRecord): MacroRunCompact {
  const slices: Record<string, MacroSlice> = {}
  for (const week of MACRO_SLICE_WEEKS) {
    const source = record.slices[String(week)]
    if (source === undefined) continue
    if (source.ledgerTotals === undefined) {
      throw new Error(`economy truth audit: ${record.seed}/${record.policy} slice ${String(week)} lacks ledger capture`)
    }
    slices[String(week)] = {
      week: source.week,
      cash: source.cash,
      state: source.state,
      filmsReleased: source.filmsReleased,
      audienceAwareness: source.audienceAwareness,
      weeklyBurn: source.weeklyBurn,
      ledgerTotals: source.ledgerTotals,
    }
  }
  return {
    schemaVersion: MACRO_SCHEMA_VERSION,
    seed: record.seed,
    policy: record.policy,
    policyKind: record.policyKind,
    horizonWeeks: record.horizonWeeks,
    openingCash: record.openingCash,
    endCash: record.endCash,
    minCash: record.episodes.minCash,
    maxCash: record.episodes.maxCash,
    filmsReleased: record.filmsReleased,
    filmsGreenlit: record.filmsGreenlit,
    foundingHires: record.foundingHires,
    engagedWeekFraction: record.engagedWeekFraction,
    reconciliationOk: record.reconciliationOk,
    rejectedActions: record.rejectedActions,
    unstaffableWeeks: record.unstaffableWeeks,
    rosterWallHit: record.rosterWallHit === true,
    rosterWallWeek: record.rosterWallWeek ?? null,
    distressEntryWeek: record.episodes.distressEntryWeek,
    recoveryWeek: record.episodes.recoveryWeek,
    weeksToRecovery: record.episodes.weeksToRecovery,
    terminalDecline: record.episodes.terminalDecline,
    runawaySuccess: record.episodes.runawaySuccess,
    weeksInsolvent: record.episodes.weeksInsolvent,
    weeksNoProduction: record.episodes.weeksNoProduction,
    weeksBareMinOnly: record.episodes.weeksBareMinOnly,
    weeksConstrained: record.episodes.weeksConstrained,
    weeksHealthy: record.episodes.weeksHealthy,
    durableRecoveryAt26: record.durableRecovery?.at26 ?? null,
    durableRecoveryAt52: record.durableRecovery?.at52 ?? null,
    durableRecoveryAt103: record.durableRecovery?.at103 ?? null,
    publicitySpend: record.publicity?.spend ?? 0,
    publicityCount: record.publicity?.count ?? 0,
    ledgerTotals: record.ledgerTotals,
    slices,
    moviePortfolio: compactPortfolio(record),
  }
}

export function runMacroCell(seed: string, policy: Policy): MacroRunCompact {
  return compactMacroRun(
    runOne({
      seed,
      policy,
      horizonWeeks: MACRO_HORIZON_WEEKS,
      sliceWeeks: MACRO_SLICE_WEEKS,
      checkpointEvery: 26,
      productionD17b: true,
      awarenessStats: true,
      captureLedgerAtSlices: true,
    }),
  )
}

export function resolveMacroPolicies(names: readonly string[]): Policy[] {
  const policies = names.map((name) => policyByName(name))
  if (new Set(policies.map((policy) => policy.name)).size !== policies.length) {
    throw new Error('economy truth audit: macro policies must be unique')
  }
  return policies
}

function ledgerValue(totals: Readonly<Record<string, number>>, kind: string): number {
  return totals[kind] ?? 0
}

function positiveRevenue(totals: Readonly<Record<string, number>>): number {
  return ledgerValue(totals, 'studioRevenue') + ledgerValue(totals, 'boxOffice')
}

function outflow(totals: Readonly<Record<string, number>>, kinds: readonly string[]): number {
  return -kinds.reduce((sum, kind) => sum + Math.min(0, ledgerValue(totals, kind)), 0)
}

function valuesOf(
  rows: readonly MacroRunCompact[],
  select: (row: MacroRunCompact) => number | null,
): number[] {
  const values: number[] = []
  for (const row of rows) {
    const value = select(row)
    if (value !== null) values.push(value)
  }
  return values
}

export type MacroHorizonSummary = {
  cash: Distribution
  cashMultiple: Distribution
  filmsReleased: Distribution
  audienceAwareness: Distribution
  weeklyBurn: Distribution
  studioRevenue: Distribution
  productionAndFreelancerSpend: Distribution
  payroll: Distribution
  overhead: Distribution
  publicity: Distribution
  endNegative: RateEstimate
  belowOpeningCash: RateEstimate
}

export type MacroPolicySummary = {
  policy: string
  policyKind: string
  runs: number
  horizons: Record<string, MacroHorizonSummary>
  endCash: Distribution
  minCash: Distribution
  maxCash: Distribution
  cashGainFromWeek208To260: Distribution
  filmsReleased: Distribution
  portfolioRoi: Distribution
  totalContribution: Distribution
  meanCommittedCost: Distribution
  meanMarketing: Distribution
  meanLeadFame: Distribution
  meanLeadOvr: Distribution
  movieProfitRate: RateEstimate
  genreCount: Distribution
  genreHhi: Distribution
  largestGenreShare: Distribution
  distressEntry: RateEstimate
  durableRecoveryAt103AmongDistressed: RateEstimate
  terminalDecline: RateEstimate
  runawaySuccess: RateEstimate
  rosterWall: RateEstimate
  endBelowOpening: RateEstimate
  weeksInsolvent: Distribution
  weeksNoProduction: Distribution
  weeksBareMinOnly: Distribution
  weeksConstrained: Distribution
  weeksHealthy: Distribution
  engagedWeekFraction: Distribution
  rejectedActions: Distribution
  unstaffableWeeks: Distribution
  publicitySpend: Distribution
  publicityCount: Distribution
  exemplars: {
    minEndCash: { seed: string; value: number }
    maxEndCash: { seed: string; value: number }
    maxObservedCash: { seed: string; value: number }
    firstDistressSeed: string | null
    firstRosterWallSeed: string | null
    firstRunawaySeed: string | null
    firstTerminalDeclineSeed: string | null
  }
}

function extreme(
  rows: readonly MacroRunCompact[],
  select: (row: MacroRunCompact) => number,
  direction: 'min' | 'max',
): { seed: string; value: number } {
  const ordered = [...rows].sort((a, b) => {
    const delta = select(a) - select(b)
    return (direction === 'min' ? delta : -delta) || a.seed.localeCompare(b.seed)
  })
  return { seed: ordered[0]!.seed, value: select(ordered[0]!) }
}

function horizonSummary(rows: readonly MacroRunCompact[], week: number): MacroHorizonSummary {
  const slices = rows.map((row) => ({ row, slice: row.slices[String(week)]! }))
  if (slices.some(({ slice }) => slice === undefined)) {
    throw new Error(`economy truth audit: incomplete macro slice ${String(week)}`)
  }
  return {
    cash: distribution(slices.map(({ slice }) => slice.cash)),
    cashMultiple: distribution(slices.map(({ row, slice }) => slice.cash / row.openingCash)),
    filmsReleased: distribution(slices.map(({ slice }) => slice.filmsReleased)),
    audienceAwareness: distribution(slices.map(({ slice }) => slice.audienceAwareness)),
    weeklyBurn: distribution(slices.map(({ slice }) => slice.weeklyBurn)),
    studioRevenue: distribution(slices.map(({ slice }) => positiveRevenue(slice.ledgerTotals))),
    productionAndFreelancerSpend: distribution(
      slices.map(({ slice }) => outflow(slice.ledgerTotals, ['production', 'freelancerFee'])),
    ),
    payroll: distribution(slices.map(({ slice }) => outflow(slice.ledgerTotals, ['payroll']))),
    overhead: distribution(slices.map(({ slice }) => outflow(slice.ledgerTotals, ['overhead']))),
    publicity: distribution(slices.map(({ slice }) => outflow(slice.ledgerTotals, ['publicity']))),
    endNegative: rate(slices.filter(({ slice }) => slice.cash < 0).length, slices.length),
    belowOpeningCash: rate(
      slices.filter(({ row, slice }) => slice.cash < row.openingCash).length,
      slices.length,
    ),
  }
}

function policySummary(rows: readonly MacroRunCompact[]): MacroPolicySummary {
  const policy = rows[0]?.policy
  if (policy === undefined || rows.some((row) => row.policy !== policy)) {
    throw new Error('economy truth audit: policy summary received a mixed or empty cell')
  }
  const distressed = rows.filter((row) => row.distressEntryWeek !== null)
  const completedFilms = rows.reduce((sum, row) => sum + row.moviePortfolio.completedFilms, 0)
  const profitableFilms = rows.reduce((sum, row) => sum + row.moviePortfolio.profitableFilms, 0)
  return {
    policy,
    policyKind: rows[0]!.policyKind,
    runs: rows.length,
    horizons: Object.fromEntries(MACRO_SLICE_WEEKS.map((week) => [String(week), horizonSummary(rows, week)])),
    endCash: distribution(rows.map((row) => row.endCash)),
    minCash: distribution(rows.map((row) => row.minCash)),
    maxCash: distribution(rows.map((row) => row.maxCash)),
    cashGainFromWeek208To260: distribution(
      rows.map((row) => row.slices['260']!.cash - row.slices['208']!.cash),
    ),
    filmsReleased: distribution(rows.map((row) => row.filmsReleased)),
    portfolioRoi: distribution(valuesOf(rows, (row) => row.moviePortfolio.portfolioRoi)),
    totalContribution: distribution(rows.map((row) => row.moviePortfolio.totalContribution)),
    meanCommittedCost: distribution(valuesOf(rows, (row) => row.moviePortfolio.meanCommittedCost)),
    meanMarketing: distribution(valuesOf(rows, (row) => row.moviePortfolio.meanMarketing)),
    meanLeadFame: distribution(valuesOf(rows, (row) => row.moviePortfolio.meanLeadFame)),
    meanLeadOvr: distribution(valuesOf(rows, (row) => row.moviePortfolio.meanLeadOvr)),
    movieProfitRate: rate(profitableFilms, completedFilms),
    genreCount: distribution(rows.map((row) => row.moviePortfolio.genreCount)),
    genreHhi: distribution(valuesOf(rows, (row) => row.moviePortfolio.genreHhi)),
    largestGenreShare: distribution(valuesOf(rows, (row) => row.moviePortfolio.largestGenreShare)),
    distressEntry: rate(distressed.length, rows.length),
    durableRecoveryAt103AmongDistressed: rate(
      distressed.filter((row) => row.durableRecoveryAt103 === true).length,
      distressed.length,
    ),
    terminalDecline: rate(rows.filter((row) => row.terminalDecline).length, rows.length),
    runawaySuccess: rate(rows.filter((row) => row.runawaySuccess).length, rows.length),
    rosterWall: rate(rows.filter((row) => row.rosterWallHit).length, rows.length),
    endBelowOpening: rate(rows.filter((row) => row.endCash < row.openingCash).length, rows.length),
    weeksInsolvent: distribution(rows.map((row) => row.weeksInsolvent)),
    weeksNoProduction: distribution(rows.map((row) => row.weeksNoProduction)),
    weeksBareMinOnly: distribution(rows.map((row) => row.weeksBareMinOnly)),
    weeksConstrained: distribution(rows.map((row) => row.weeksConstrained)),
    weeksHealthy: distribution(rows.map((row) => row.weeksHealthy)),
    engagedWeekFraction: distribution(rows.map((row) => row.engagedWeekFraction)),
    rejectedActions: distribution(rows.map((row) => row.rejectedActions)),
    unstaffableWeeks: distribution(rows.map((row) => row.unstaffableWeeks)),
    publicitySpend: distribution(rows.map((row) => row.publicitySpend)),
    publicityCount: distribution(rows.map((row) => row.publicityCount)),
    exemplars: {
      minEndCash: extreme(rows, (row) => row.endCash, 'min'),
      maxEndCash: extreme(rows, (row) => row.endCash, 'max'),
      maxObservedCash: extreme(rows, (row) => row.maxCash, 'max'),
      firstDistressSeed: [...rows].sort((a, b) => a.seed.localeCompare(b.seed)).find((row) => row.distressEntryWeek !== null)?.seed ?? null,
      firstRosterWallSeed: [...rows].sort((a, b) => a.seed.localeCompare(b.seed)).find((row) => row.rosterWallHit)?.seed ?? null,
      firstRunawaySeed: [...rows].sort((a, b) => a.seed.localeCompare(b.seed)).find((row) => row.runawaySuccess)?.seed ?? null,
      firstTerminalDeclineSeed: [...rows].sort((a, b) => a.seed.localeCompare(b.seed)).find((row) => row.terminalDecline)?.seed ?? null,
    },
  }
}

export type WinShareCell = {
  comparableSeeds: number
  shares: Record<string, number>
}

function winShares(rows: readonly MacroRunCompact[], policies: readonly string[], week: number): WinShareCell {
  const byPolicy = new Map<string, Map<string, number>>()
  for (const policy of policies) byPolicy.set(policy, new Map())
  for (const row of rows) {
    const column = byPolicy.get(row.policy)
    const slice = row.slices[String(week)]
    if (column !== undefined && slice !== undefined) column.set(row.seed, slice.cash)
  }
  const first = byPolicy.get(policies[0]!)
  const seeds = first === undefined
    ? []
    : [...first.keys()].filter((seed) => policies.every((policy) => byPolicy.get(policy)?.has(seed) === true)).sort()
  const wins = Object.fromEntries(policies.map((policy) => [policy, 0])) as Record<string, number>
  for (const seed of seeds) {
    const best = Math.max(...policies.map((policy) => byPolicy.get(policy)!.get(seed)!))
    const tied = policies.filter((policy) => byPolicy.get(policy)!.get(seed)! === best)
    for (const policy of tied) wins[policy] += 1 / tied.length
  }
  if (seeds.length > 0) for (const policy of policies) wins[policy] /= seeds.length
  return { comparableSeeds: seeds.length, shares: wins }
}

export type TwoWayVariance = {
  policies: number
  seeds: number
  observations: number
  totalSumSquares: number
  seedShare: number | null
  policyShare: number | null
  interactionShare: number | null
}

function twoWayVariance(rows: readonly MacroRunCompact[], policies: readonly string[], week: number): TwoWayVariance {
  const selected = rows.filter((row) => policies.includes(row.policy))
  const seeds = [...new Set(selected.map((row) => row.seed))].sort()
  const matrix = new Map(selected.map((row) => [`${row.seed}\u0000${row.policy}`, row.slices[String(week)]!.cash]))
  if (seeds.some((seed) => policies.some((policy) => !matrix.has(`${seed}\u0000${policy}`)))) {
    throw new Error(`economy truth audit: incomplete two-way macro matrix at week ${String(week)}`)
  }
  const all = [...matrix.values()]
  const grand = all.reduce((sum, value) => sum + value, 0) / all.length
  const seedMeans = new Map(seeds.map((seed) => [seed, policies.reduce((sum, policy) => sum + matrix.get(`${seed}\u0000${policy}`)!, 0) / policies.length]))
  const policyMeans = new Map(policies.map((policy) => [policy, seeds.reduce((sum, seed) => sum + matrix.get(`${seed}\u0000${policy}`)!, 0) / seeds.length]))
  let total = 0
  let seedSs = 0
  let policySs = 0
  let interactionSs = 0
  for (const value of all) total += (value - grand) ** 2
  for (const value of seedMeans.values()) seedSs += policies.length * (value - grand) ** 2
  for (const value of policyMeans.values()) policySs += seeds.length * (value - grand) ** 2
  for (const seed of seeds) {
    for (const policy of policies) {
      const residual = matrix.get(`${seed}\u0000${policy}`)! - seedMeans.get(seed)! - policyMeans.get(policy)! + grand
      interactionSs += residual ** 2
    }
  }
  return {
    policies: policies.length,
    seeds: seeds.length,
    observations: all.length,
    totalSumSquares: total,
    seedShare: total === 0 ? null : seedSs / total,
    policyShare: total === 0 ? null : policySs / total,
    interactionShare: total === 0 ? null : interactionSs / total,
  }
}

function pairedAt(
  rows: readonly MacroRunCompact[],
  left: string,
  right: string,
  week: number,
): PairedEffect {
  const column = (policy: string): Map<string, number> => new Map(
    rows
      .filter((row) => row.policy === policy)
      .map((row) => [row.seed, row.slices[String(week)]!.cash]),
  )
  return pairedEffect(left, right, column(left), column(right))
}

export type MacroAggregate = {
  schemaVersion: typeof MACRO_SCHEMA_VERSION
  experiment: {
    identity: 'ETA-MACRO-1000x260-PQ-v1'
    evidenceClass: 'current direct-package economy law; managed construction/production path excluded'
    seedCount: number
    seeds: { first: string; last: string }
    horizonWeeks: number
    slices: readonly number[]
    policies: { name: string; kind: string; description: string }[]
  }
  validation: {
    runs: number
    uniqueSeeds: number
    reconciliationFailures: number
    missingCells: number
  }
  policySummaries: MacroPolicySummary[]
  normalPlayerCashWinShares: Record<string, WinShareCell>
  normalPlayerVariance: Record<string, TwoWayVariance>
  pairedCashEffects: Record<string, Record<string, PairedEffect>>
}

const STRATEGY_PAIRS = [
  ['P1_cheapestViable', 'P4_premiumAmbitious'],
  ['P2_conservativeStandard', 'P3_standardCadence'],
  ['P3_standardCadence', 'P7_starDriven'],
  ['P5_forecastProfitMax', 'P6_forecastROIMax'],
  ['P8_developmentFarm', 'P1_cheapestViable'],
  ['P9_freelancerLean', 'P1_cheapestViable'],
  ['P10_lowBurnWaiter', 'P3_standardCadence'],
  ['P11_adaptiveBalanced', 'P3_standardCadence'],
  ['P12_standardMinMkt', 'P13_standardMaxMkt'],
  ['Q0_neverPublicize', 'P3_standardCadence'],
  ['Q1_publicizeAtLowAwareness', 'Q0_neverPublicize'],
  ['Q2_publicizeBeforeEveryRelease', 'Q0_neverPublicize'],
  ['Q3_publicityROIDisciplined', 'P5_forecastProfitMax'],
  ['Q4_maximumPublicity', 'Q0_neverPublicize'],
  ['Q5_emergencyPublicity', 'Q0_neverPublicize'],
  ['Q6_awarenessMaintenance', 'Q0_neverPublicize'],
  ['Q7_publicitySpamAdversary', 'Q0_neverPublicize'],
] as const

export function aggregateMacro(rows: readonly MacroRunCompact[]): MacroAggregate {
  const policies = MACRO_POLICY_NAMES.map((name) => policyByName(name))
  const seeds = [...new Set(rows.map((row) => row.seed))].sort()
  const expectedCells = seeds.length * policies.length
  const byPolicy = new Map<string, MacroRunCompact[]>()
  for (const policy of policies) byPolicy.set(policy.name, [])
  for (const row of rows) byPolicy.get(row.policy)?.push(row)
  const normal = [...NORMAL_PLAYER_POLICY_NAMES]
  const pairEffects: Record<string, Record<string, PairedEffect>> = {}
  for (const [left, right] of STRATEGY_PAIRS) {
    const key = `${left}__minus__${right}`
    pairEffects[key] = Object.fromEntries(
      MACRO_SLICE_WEEKS.map((week) => [String(week), pairedAt(rows, left, right, week)]),
    )
  }
  return {
    schemaVersion: MACRO_SCHEMA_VERSION,
    experiment: {
      identity: 'ETA-MACRO-1000x260-PQ-v1',
      evidenceClass: 'current direct-package economy law; managed construction/production path excluded',
      seedCount: seeds.length,
      seeds: { first: seeds[0] ?? '', last: seeds[seeds.length - 1] ?? '' },
      horizonWeeks: MACRO_HORIZON_WEEKS,
      slices: MACRO_SLICE_WEEKS,
      policies: policies.map((policy) => ({ name: policy.name, kind: policy.kind, description: policy.description })),
    },
    validation: {
      runs: rows.length,
      uniqueSeeds: seeds.length,
      reconciliationFailures: rows.filter((row) => !row.reconciliationOk).length,
      missingCells: expectedCells - rows.length,
    },
    policySummaries: policies.map((policy) => policySummary(byPolicy.get(policy.name)!)),
    normalPlayerCashWinShares: Object.fromEntries(
      MACRO_SLICE_WEEKS.map((week) => [String(week), winShares(rows, normal, week)]),
    ),
    normalPlayerVariance: Object.fromEntries(
      MACRO_SLICE_WEEKS.map((week) => [String(week), twoWayVariance(rows, normal, week)]),
    ),
    pairedCashEffects: pairEffects,
  }
}
