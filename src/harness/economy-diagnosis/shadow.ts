// Economy Diagnosis 02 — open-loop cash-pressure counterfactuals.
//
// These interventions are deliberately a SHADOW ledger. They consume the exact
// frozen Audit-01 cash/ledger slices but never mutate GameState, production
// constants, policy choices, RNG, or the production ledger. That makes them
// useful causal-sufficiency screens ("would a cost of this class be large enough?")
// while placing a hard limit on interpretation: they do not estimate behavioral
// feedback after affordability or package choices change.

import {
  MACRO_SLICE_WEEKS,
} from '../economy-truth-audit/macro.js'
import type { MacroRunCompact } from '../economy-truth-audit/macro.js'
import { distribution, rate } from '../economy-truth-audit/statistics.js'
import type {
  Distribution,
  RateEstimate,
} from '../economy-truth-audit/statistics.js'

export const DIAGNOSIS_SHADOW_SCHEMA_VERSION =
  'economy-diagnosis-shadow-v1' as const

/** Audit 01's established 3x-opening-cash threshold. */
export const RICH_CASH_THRESHOLD = 60_000_000

/** The measured C1 five-building estate price used only as a scale control. */
export const MEASURED_C1_ESTATE_CAPEX = 4_380_000

export type ShadowIntervention =
  | { id: 'neutral'; family: 'neutral' }
  | {
      id: 'measured-capital-envelope'
      family: 'one-time-capital'
      amount: typeof MEASURED_C1_ESTATE_CAPEX
    }
  | {
      id: 'global-payroll-overhead-match'
      family: 'payroll-overhead'
      richOnly: false
      multiplier: 1
    }
  | {
      id: 'rich-payroll-overhead-match'
      family: 'payroll-overhead'
      richOnly: true
      multiplier: 1
    }
  | { id: 'rich-positive-margin-share-25'; family: 'positive-margin-share'; rate: 0.25 }
  | { id: 'rich-positive-margin-share-50'; family: 'positive-margin-share'; rate: 0.5 }
  | { id: 'rich-cash-stock-charge-25'; family: 'cash-stock'; rate: 0.25 }
  | { id: 'rich-cash-stock-charge-50'; family: 'cash-stock'; rate: 0.5 }

export const SHADOW_INTERVENTIONS: readonly ShadowIntervention[] = [
  { id: 'neutral', family: 'neutral' },
  {
    id: 'measured-capital-envelope',
    family: 'one-time-capital',
    amount: MEASURED_C1_ESTATE_CAPEX,
  },
  {
    id: 'global-payroll-overhead-match',
    family: 'payroll-overhead',
    richOnly: false,
    multiplier: 1,
  },
  {
    id: 'rich-payroll-overhead-match',
    family: 'payroll-overhead',
    richOnly: true,
    multiplier: 1,
  },
  {
    id: 'rich-positive-margin-share-25',
    family: 'positive-margin-share',
    rate: 0.25,
  },
  {
    id: 'rich-positive-margin-share-50',
    family: 'positive-margin-share',
    rate: 0.5,
  },
  { id: 'rich-cash-stock-charge-25', family: 'cash-stock', rate: 0.25 },
  { id: 'rich-cash-stock-charge-50', family: 'cash-stock', rate: 0.5 },
] as const

type ShadowSample = {
  week: number
  productionCash: number
  shadowCashBeforeCharge: number
  charge: number
  shadowCash: number
  payrollOverheadSpend: number
  filmContribution: number
}

export type ShadowRun = {
  seed: string
  policy: string
  interventionId: ShadowIntervention['id']
  openingCash: number
  productionEndCash: number
  shadowEndCash: number
  totalCharge: number
  maxShadowCash: number
  sampledRunaway: boolean
  endAboveRichThreshold: boolean
  endNegative: boolean
  belowOpening: boolean
  treatmentActivated: boolean
  samples: ShadowSample[]
}

function ledgerValue(totals: Readonly<Record<string, number>>, kind: string): number {
  return totals[kind] ?? 0
}

function intervalValue(
  current: Readonly<Record<string, number>>,
  previous: Readonly<Record<string, number>>,
  kinds: readonly string[],
): number {
  return kinds.reduce(
    (sum, kind) => sum + ledgerValue(current, kind) - ledgerValue(previous, kind),
    0,
  )
}

function chargeFor(
  intervention: ShadowIntervention,
  input: {
    shadowCash: number
    payrollOverheadSpend: number
    filmContribution: number
    capitalAlreadyCharged: boolean
  },
): number {
  switch (intervention.family) {
    case 'neutral':
      return 0
    case 'one-time-capital':
      return !input.capitalAlreadyCharged && input.shadowCash > RICH_CASH_THRESHOLD
        ? intervention.amount
        : 0
    case 'payroll-overhead':
      return !intervention.richOnly || input.shadowCash > RICH_CASH_THRESHOLD
        ? intervention.multiplier * input.payrollOverheadSpend
        : 0
    case 'positive-margin-share':
      return input.shadowCash > RICH_CASH_THRESHOLD
        ? intervention.rate * Math.max(0, input.filmContribution)
        : 0
    case 'cash-stock':
      return intervention.rate * Math.max(0, input.shadowCash - RICH_CASH_THRESHOLD)
  }
}

/**
 * Replay only the signed cash flows from the production arm and append a separate
 * shadow charge at the established 52-week samples. Production decisions remain
 * open-loop and unchanged by construction.
 */
export function applyShadowIntervention(
  row: MacroRunCompact,
  intervention: ShadowIntervention,
): ShadowRun {
  let productionCash = row.openingCash
  let shadowCash = row.openingCash
  let previousLedger: Readonly<Record<string, number>> = {}
  let totalCharge = 0
  let capitalAlreadyCharged = false
  const samples: ShadowSample[] = []
  const observedShadowCash = [shadowCash]

  for (const week of MACRO_SLICE_WEEKS) {
    const slice = row.slices[String(week)]
    if (slice === undefined) {
      throw new Error(
        `economy diagnosis shadow: ${row.seed}/${row.policy} lacks Week ${String(week)}`,
      )
    }
    const productionFlow = slice.cash - productionCash
    productionCash = slice.cash
    shadowCash += productionFlow

    // The frozen direct-package macro has no managed facilities. This measure is
    // intentionally payroll + base/per-contract overhead, not complete facility-
    // inclusive operating cost.
    const payrollOverheadSpend = -intervalValue(
      slice.ledgerTotals,
      previousLedger,
      ['payroll', 'overhead'],
    )
    const filmContribution = intervalValue(
      slice.ledgerTotals,
      previousLedger,
      ['studioRevenue', 'boxOffice', 'production', 'freelancerFee'],
    )
    const shadowCashBeforeCharge = shadowCash
    const charge = chargeFor(intervention, {
      shadowCash,
      payrollOverheadSpend,
      filmContribution,
      capitalAlreadyCharged,
    })
    if (!Number.isFinite(charge) || charge < 0) {
      throw new Error(`economy diagnosis shadow: invalid charge ${String(charge)}`)
    }
    if (intervention.family === 'one-time-capital' && charge > 0) {
      capitalAlreadyCharged = true
    }
    shadowCash -= charge
    totalCharge += charge
    observedShadowCash.push(shadowCash)
    samples.push({
      week,
      productionCash,
      shadowCashBeforeCharge,
      charge,
      shadowCash,
      payrollOverheadSpend,
      filmContribution,
    })
    previousLedger = slice.ledgerTotals
  }

  const shadowEndCash = shadowCash
  return {
    seed: row.seed,
    policy: row.policy,
    interventionId: intervention.id,
    openingCash: row.openingCash,
    productionEndCash: row.endCash,
    shadowEndCash,
    totalCharge,
    maxShadowCash: Math.max(...observedShadowCash),
    sampledRunaway: observedShadowCash.some((cash) => cash >= RICH_CASH_THRESHOLD),
    endAboveRichThreshold: shadowEndCash >= RICH_CASH_THRESHOLD,
    endNegative: shadowEndCash < 0,
    belowOpening: shadowEndCash < row.openingCash,
    treatmentActivated: totalCharge > 0,
    samples,
  }
}

export type ShadowPolicySummary = {
  policy: string
  runs: number
  shadowEndCash: Distribution
  cashDelta: Distribution
  totalCharge: Distribution
  maxShadowCash: Distribution
  sampledRunaway: RateEstimate
  endAboveRichThreshold: RateEstimate
  endNegative: RateEstimate
  belowOpening: RateEstimate
  treatmentActivated: RateEstimate
}

function summarizePolicy(rows: readonly ShadowRun[]): ShadowPolicySummary {
  const policy = rows[0]?.policy
  if (policy === undefined || rows.some((row) => row.policy !== policy)) {
    throw new Error('economy diagnosis shadow: mixed or empty policy summary')
  }
  return {
    policy,
    runs: rows.length,
    shadowEndCash: distribution(rows.map((row) => row.shadowEndCash)),
    cashDelta: distribution(
      rows.map((row) => row.shadowEndCash - row.productionEndCash),
    ),
    totalCharge: distribution(rows.map((row) => row.totalCharge)),
    maxShadowCash: distribution(rows.map((row) => row.maxShadowCash)),
    sampledRunaway: rate(rows.filter((row) => row.sampledRunaway).length, rows.length),
    endAboveRichThreshold: rate(
      rows.filter((row) => row.endAboveRichThreshold).length,
      rows.length,
    ),
    endNegative: rate(rows.filter((row) => row.endNegative).length, rows.length),
    belowOpening: rate(rows.filter((row) => row.belowOpening).length, rows.length),
    treatmentActivated: rate(
      rows.filter((row) => row.treatmentActivated).length,
      rows.length,
    ),
  }
}

export type ShadowInterventionSummary = {
  intervention: ShadowIntervention
  runs: number
  policies: ShadowPolicySummary[]
  zeroChargeRuns: number
  zeroChargeIdentityFailures: number
}

export function aggregateShadowIntervention(
  baselineRows: readonly MacroRunCompact[],
  intervention: ShadowIntervention,
): ShadowInterventionSummary {
  const shadowRows = baselineRows.map((row) => applyShadowIntervention(row, intervention))
  const policies = [...new Set(shadowRows.map((row) => row.policy))].sort()
  const zeroCharge = shadowRows.filter((row) => row.totalCharge === 0)
  return {
    intervention,
    runs: shadowRows.length,
    policies: policies.map((policy) =>
      summarizePolicy(shadowRows.filter((row) => row.policy === policy)),
    ),
    zeroChargeRuns: zeroCharge.length,
    zeroChargeIdentityFailures: zeroCharge.filter(
      (row) => row.shadowEndCash !== row.productionEndCash,
    ).length,
  }
}
