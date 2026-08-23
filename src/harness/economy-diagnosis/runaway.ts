// Economy Diagnosis 02 — wealth-runaway causal reductions.
// Analysis only; consumes exact deterministic run records and emits compact aggregates.

import type { MacroRunCompact } from '../economy-truth-audit/macro.js'
import {
  MACRO_SLICE_WEEKS,
} from '../economy-truth-audit/macro.js'
import {
  distribution,
  pairedEffect,
  rate,
} from '../economy-truth-audit/statistics.js'
import type {
  Distribution,
  PairedEffect,
  RateEstimate,
} from '../economy-truth-audit/statistics.js'

export const DIAGNOSIS_RUNAWAY_SCHEMA_VERSION =
  'economy-diagnosis-runaway-v1' as const

export const P5 = 'P5_forecastProfitMax' as const
export const P6 = 'P6_forecastROIMax' as const
export const SELECTOR_MIDPOINT = 'D02_profitCostExponent_0_5' as const

function ledgerValue(row: MacroRunCompact, kind: string): number {
  return row.ledgerTotals[kind] ?? 0
}

function signedGroup(row: MacroRunCompact, kinds: readonly string[]): number {
  return kinds.reduce((sum, kind) => sum + ledgerValue(row, kind), 0)
}

const ACCOUNTING_GROUPS = {
  filmRevenue: ['studioRevenue', 'boxOffice'],
  productionAndFreelancers: ['production', 'freelancerFee'],
  payrollAndOverhead: ['payroll', 'overhead'],
  rosterTransactions: ['signingBonus', 'termination'],
  publicity: ['publicity'],
  constructionAndProperty: [
    'constructionCapex',
    'facilityDemolitionRefund',
    'facilityOpex',
    'setCapex',
    'setDemolitionRefund',
    'setMaintenance',
  ],
} as const

type AccountingGroup = keyof typeof ACCOUNTING_GROUPS

export type PairedAccountingGroup = {
  group: AccountingGroup
  signedDelta: Distribution
  meanShareOfMeanEndCashDelta: number | null
}

export type PairedPolicyAccounting = {
  identity:
    'paired P5-minus-P6 same-seed policy accounting decomposition; ledger groups are downstream mediators, not isolated causal effects'
  pairs: number
  endCash: PairedEffect
  groups: PairedAccountingGroup[]
  unclassifiedLedgerDelta: Distribution
  reconciliationResidual: Distribution
  maxAbsoluteReconciliationResidual: number
  pairedFilmMetrics: Record<
    'releases' | 'totalContribution' | 'committedCost' | 'studioRevenue' | 'meanMarketing' | 'meanLeadFame',
    PairedEffect
  >
}

function bySeed(
  rows: readonly MacroRunCompact[],
  policy: string,
  select: (row: MacroRunCompact) => number,
): Map<string, number> {
  return new Map(
    rows.filter((row) => row.policy === policy).map((row) => [row.seed, select(row)]),
  )
}

function pairRows(
  rows: readonly MacroRunCompact[],
): Array<{ seed: string; left: MacroRunCompact; right: MacroRunCompact }> {
  const left = new Map(rows.filter((row) => row.policy === P5).map((row) => [row.seed, row]))
  const right = new Map(rows.filter((row) => row.policy === P6).map((row) => [row.seed, row]))
  return [...left.keys()]
    .filter((seed) => right.has(seed))
    .sort()
    .map((seed) => ({ seed, left: left.get(seed)!, right: right.get(seed)! }))
}

export function pairedRunawayAccounting(
  rows: readonly MacroRunCompact[],
): PairedPolicyAccounting {
  const pairs = pairRows(rows)
  if (pairs.length === 0) throw new Error('economy diagnosis runaway: no P5/P6 pairs')
  const endCash = pairedEffect(
    P5,
    P6,
    bySeed(rows, P5, (row) => row.endCash),
    bySeed(rows, P6, (row) => row.endCash),
  )
  const meanCashDelta = endCash.delta.mean

  const groups: PairedAccountingGroup[] = (
    Object.keys(ACCOUNTING_GROUPS) as AccountingGroup[]
  ).map((group) => {
    const deltas = pairs.map(
      ({ left, right }) =>
        signedGroup(left, ACCOUNTING_GROUPS[group]) -
        signedGroup(right, ACCOUNTING_GROUPS[group]),
    )
    const summary = distribution(deltas)
    return {
      group,
      signedDelta: summary,
      meanShareOfMeanEndCashDelta:
        meanCashDelta === null || meanCashDelta === 0 || summary.mean === null
          ? null
          : summary.mean / meanCashDelta,
    }
  })

  const classifiedKinds = new Set<string>(Object.values(ACCOUNTING_GROUPS).flat())
  const unclassified = pairs.map(({ left, right }) => {
    const kinds = new Set([
      ...Object.keys(left.ledgerTotals),
      ...Object.keys(right.ledgerTotals),
    ])
    let delta = 0
    for (const kind of kinds) {
      if (classifiedKinds.has(kind)) continue
      delta += ledgerValue(left, kind) - ledgerValue(right, kind)
    }
    return delta
  })
  const residuals = pairs.map(({ left, right }, index) => {
    const groupDelta = groups.reduce(
      (sum, group) =>
        sum +
        (signedGroup(left, ACCOUNTING_GROUPS[group.group]) -
          signedGroup(right, ACCOUNTING_GROUPS[group.group])),
      0,
    )
    const cashDelta = left.endCash - right.endCash
    return cashDelta - groupDelta - unclassified[index]!
  })

  const pairedMetric = (
    label: string,
    select: (row: MacroRunCompact) => number,
  ): PairedEffect =>
    pairedEffect(label, P6, bySeed(rows, P5, select), bySeed(rows, P6, select))

  return {
    identity:
      'paired P5-minus-P6 same-seed policy accounting decomposition; ledger groups are downstream mediators, not isolated causal effects',
    pairs: pairs.length,
    endCash,
    groups,
    unclassifiedLedgerDelta: distribution(unclassified),
    reconciliationResidual: distribution(residuals),
    maxAbsoluteReconciliationResidual: Math.max(...residuals.map(Math.abs)),
    pairedFilmMetrics: {
      releases: pairedMetric('P5 releases', (row) => row.filmsReleased),
      totalContribution: pairedMetric(
        'P5 total contribution',
        (row) => row.moviePortfolio.totalContribution,
      ),
      committedCost: pairedMetric(
        'P5 committed cost',
        (row) => row.moviePortfolio.totalCommittedCost,
      ),
      studioRevenue: pairedMetric(
        'P5 studio revenue',
        (row) => row.moviePortfolio.totalStudioRevenue,
      ),
      meanMarketing: pairedMetric(
        'P5 mean marketing',
        (row) => row.moviePortfolio.meanMarketing ?? 0,
      ),
      meanLeadFame: pairedMetric(
        'P5 mean lead fame',
        (row) => row.moviePortfolio.meanLeadFame ?? 0,
      ),
    },
  }
}

export type RunawayStratum = {
  label: 'runaway' | 'not-runaway'
  runs: number
  endCash: Distribution
  maxCash: Distribution
  revenue: Distribution
  productionAndFreelancerSpend: Distribution
  payrollAndOverheadSpend: Distribution
  totalContribution: Distribution
  contributionPerFilm: Distribution
  releases: Distribution
  portfolioRoi: Distribution
  meanMarketing: Distribution
  meanLeadFame: Distribution
  audienceAt260: Distribution
  rosterWall: RateEstimate
  terminalDecline: RateEstimate
}

function stratum(label: RunawayStratum['label'], rows: readonly MacroRunCompact[]): RunawayStratum {
  return {
    label,
    runs: rows.length,
    endCash: distribution(rows.map((row) => row.endCash)),
    maxCash: distribution(rows.map((row) => row.maxCash)),
    revenue: distribution(rows.map((row) => signedGroup(row, ['studioRevenue', 'boxOffice']))),
    productionAndFreelancerSpend: distribution(
      rows.map((row) => -signedGroup(row, ['production', 'freelancerFee'])),
    ),
    payrollAndOverheadSpend: distribution(
      rows.map((row) => -signedGroup(row, ['payroll', 'overhead'])),
    ),
    totalContribution: distribution(
      rows.map((row) => row.moviePortfolio.totalContribution),
    ),
    contributionPerFilm: distribution(
      rows
        .filter((row) => row.moviePortfolio.completedFilms > 0)
        .map(
          (row) =>
            row.moviePortfolio.totalContribution /
            row.moviePortfolio.completedFilms,
        ),
    ),
    releases: distribution(rows.map((row) => row.filmsReleased)),
    portfolioRoi: distribution(
      rows
        .map((row) => row.moviePortfolio.portfolioRoi)
        .filter((value): value is number => value !== null),
    ),
    meanMarketing: distribution(
      rows
        .map((row) => row.moviePortfolio.meanMarketing)
        .filter((value): value is number => value !== null),
    ),
    meanLeadFame: distribution(
      rows
        .map((row) => row.moviePortfolio.meanLeadFame)
        .filter((value): value is number => value !== null),
    ),
    audienceAt260: distribution(rows.map((row) => row.slices['260']!.audienceAwareness)),
    rosterWall: rate(rows.filter((row) => row.rosterWallHit).length, rows.length),
    terminalDecline: rate(rows.filter((row) => row.terminalDecline).length, rows.length),
  }
}

export function p5RunawayStrata(rows: readonly MacroRunCompact[]): RunawayStratum[] {
  const p5 = rows.filter((row) => row.policy === P5)
  return [
    stratum('runaway', p5.filter((row) => row.runawaySuccess)),
    stratum('not-runaway', p5.filter((row) => !row.runawaySuccess)),
  ]
}

export type SelectorPolicySummary = {
  policy: string
  runs: number
  endCash: Distribution
  maxCash: Distribution
  totalContribution: Distribution
  releases: Distribution
  portfolioRoi: Distribution
  meanCommittedCost: Distribution
  meanMarketing: Distribution
  runaway: RateEstimate
  distress: RateEstimate
  durableRecoveryAt103AmongDistressed: RateEstimate
  rosterWall: RateEstimate
  terminalDecline: RateEstimate
  endNegative: RateEstimate
}

function selectorPolicySummary(rows: readonly MacroRunCompact[]): SelectorPolicySummary {
  const policy = rows[0]?.policy
  if (policy === undefined || rows.some((row) => row.policy !== policy)) {
    throw new Error('economy diagnosis selector: mixed or empty policy summary')
  }
  const distressed = rows.filter((row) => row.distressEntryWeek !== null)
  const numeric = (
    select: (row: MacroRunCompact) => number | null,
  ): number[] =>
    rows.map(select).filter((value): value is number => value !== null)
  return {
    policy,
    runs: rows.length,
    endCash: distribution(rows.map((row) => row.endCash)),
    maxCash: distribution(rows.map((row) => row.maxCash)),
    totalContribution: distribution(
      rows.map((row) => row.moviePortfolio.totalContribution),
    ),
    releases: distribution(rows.map((row) => row.filmsReleased)),
    portfolioRoi: distribution(numeric((row) => row.moviePortfolio.portfolioRoi)),
    meanCommittedCost: distribution(
      numeric((row) => row.moviePortfolio.meanCommittedCost),
    ),
    meanMarketing: distribution(numeric((row) => row.moviePortfolio.meanMarketing)),
    runaway: rate(rows.filter((row) => row.runawaySuccess).length, rows.length),
    distress: rate(distressed.length, rows.length),
    durableRecoveryAt103AmongDistressed: rate(
      distressed.filter((row) => row.durableRecoveryAt103 === true).length,
      distressed.length,
    ),
    rosterWall: rate(rows.filter((row) => row.rosterWallHit).length, rows.length),
    terminalDecline: rate(rows.filter((row) => row.terminalDecline).length, rows.length),
    endNegative: rate(rows.filter((row) => row.endCash < 0).length, rows.length),
  }
}

export type SelectorFrontier = {
  identity: 'D02-SELECTOR-EXPONENT-0-0.5-1-1000x260-v2'
  policies: SelectorPolicySummary[]
  pairedCashEffects: Record<string, Record<string, PairedEffect>>
  validation: {
    seeds: number
    missingCells: number
    reconciliationFailures: number
    endpointAuthority: 'frozen Audit-01 P5/P6 rows used after corpus-wide normalized endpoint equivalence'
    endpointEquivalence: {
      checked: number
      failures: number
      firstFailure: string | null
    }
  }
}

const SELECTOR_PROFIT_ENDPOINT = 'D02_profitCostExponent_0'
const SELECTOR_ROI_ENDPOINT = 'D02_profitCostExponent_1'

function normalizedEndpoint(
  row: MacroRunCompact,
  authorityPolicy: typeof P5 | typeof P6,
): string {
  return JSON.stringify({ ...row, policy: authorityPolicy })
}

export function aggregateSelectorFrontier(
  baselineRows: readonly MacroRunCompact[],
  selectorRows: readonly MacroRunCompact[],
): SelectorFrontier {
  const endpointByKey = new Map(
    selectorRows
      .filter(
        (row) =>
          row.policy === SELECTOR_PROFIT_ENDPOINT ||
          row.policy === SELECTOR_ROI_ENDPOINT,
      )
      .map((row) => [`${row.seed}\u0000${row.policy}`, row]),
  )
  let endpointChecked = 0
  const endpointFailures: string[] = []
  for (const authority of baselineRows.filter(
    (row) => row.policy === P5 || row.policy === P6,
  )) {
    const endpointPolicy =
      authority.policy === P5 ? SELECTOR_PROFIT_ENDPOINT : SELECTOR_ROI_ENDPOINT
    const endpoint = endpointByKey.get(`${authority.seed}\u0000${endpointPolicy}`)
    endpointChecked++
    if (
      endpoint === undefined ||
      normalizedEndpoint(endpoint, authority.policy as typeof P5 | typeof P6) !==
        JSON.stringify(authority)
    ) {
      endpointFailures.push(`${authority.seed}/${authority.policy}`)
    }
  }
  const selected = [
    ...baselineRows.filter((row) => row.policy === P5 || row.policy === P6),
    ...selectorRows.filter((row) => row.policy === SELECTOR_MIDPOINT),
  ]
  const policies = [P5, SELECTOR_MIDPOINT, P6] as const
  const seeds = [...new Set(selected.map((row) => row.seed))].sort()
  const effects: Record<string, Record<string, PairedEffect>> = {}
  for (const [left, right] of [
    [P5, SELECTOR_MIDPOINT],
    [SELECTOR_MIDPOINT, P6],
    [P5, P6],
  ] as const) {
    effects[`${left}__minus__${right}`] = Object.fromEntries(
      MACRO_SLICE_WEEKS.map((week) => [
        String(week),
        pairedEffect(
          left,
          right,
          bySeed(selected, left, (row) => row.slices[String(week)]!.cash),
          bySeed(selected, right, (row) => row.slices[String(week)]!.cash),
        ),
      ]),
    )
  }
  return {
    identity: 'D02-SELECTOR-EXPONENT-0-0.5-1-1000x260-v2',
    policies: policies.map((policy) =>
      selectorPolicySummary(selected.filter((row) => row.policy === policy)),
    ),
    pairedCashEffects: effects,
    validation: {
      seeds: seeds.length,
      missingCells: seeds.length * policies.length - selected.length,
      reconciliationFailures: selected.filter((row) => !row.reconciliationOk).length,
      endpointAuthority:
        'frozen Audit-01 P5/P6 rows used after corpus-wide normalized endpoint equivalence',
      endpointEquivalence: {
        checked: endpointChecked,
        failures: endpointFailures.length,
        firstFailure: endpointFailures[0] ?? null,
      },
    },
  }
}
