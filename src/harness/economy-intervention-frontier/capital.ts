// Economy Intervention Frontier 03 — analysis-only optional capital ladders.
//
// These arms convert liquid cash into a separately journalled enterprise asset.
// They do not invent a production ledger kind, alter TUNING, or claim a particular
// building/capability benefit. The closed loop is intentionally conservative: the
// resource has no simulated financial return, while its cash conversion changes
// future affordability and policy choices. This measures scale and shape, not fun.

import type { Policy } from '../d16/policies.js'
import type { AnalysisCashPlan } from '../d16/driver.js'
import { runOne } from '../d16/driver.js'
import {
  MACRO_HORIZON_WEEKS,
  MACRO_SLICE_WEEKS,
  compactMacroRun,
} from '../economy-truth-audit/macro.js'
import type { MacroRunCompact } from '../economy-truth-audit/macro.js'
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

/** Audit 01's measured five-building estate, used as a reviewable scale unit. */
export const CAPITAL_ESTATE_EQUIVALENT = 4_380_000

export const CAPITAL_ARM_IDS = [
  'none',
  'four-rung-1-estate',
  'four-rung-5-estates',
  'two-rung-10-estates',
] as const

export type CapitalArmId = (typeof CAPITAL_ARM_IDS)[number]

export type CapitalArm = {
  id: CapitalArmId
  estateEquivalentsPerRung: number
  maxRungs: number
  minimumWeek: number
  cooldownWeeks: number
  reserveOpeningCash: boolean
  interpretation: string
}

export const CAPITAL_ARMS: readonly CapitalArm[] = [
  {
    id: 'none',
    estateEquivalentsPerRung: 0,
    maxRungs: 0,
    minimumWeek: 52,
    cooldownWeeks: 52,
    reserveOpeningCash: true,
    interpretation: 'Current liquid-cash authority; no analysis conversion.',
  },
  {
    id: 'four-rung-1-estate',
    estateEquivalentsPerRung: 1,
    maxRungs: 4,
    minimumWeek: 52,
    cooldownWeeks: 52,
    reserveOpeningCash: true,
    interpretation:
      'Four annual optional expansion rungs at the current measured estate scale.',
  },
  {
    id: 'four-rung-5-estates',
    estateEquivalentsPerRung: 5,
    maxRungs: 4,
    minimumWeek: 52,
    cooldownWeeks: 52,
    reserveOpeningCash: true,
    interpretation:
      'Four annual medium expansion rungs; twenty estate-equivalents at full uptake.',
  },
  {
    id: 'two-rung-10-estates',
    estateEquivalentsPerRung: 10,
    maxRungs: 2,
    minimumWeek: 52,
    cooldownWeeks: 104,
    reserveOpeningCash: true,
    interpretation:
      'Two lumpier expansion rungs with the same twenty-estate maximum as the medium ladder.',
  },
] as const

export function capitalArm(id: CapitalArmId): CapitalArm {
  const arm = CAPITAL_ARMS.find((candidate) => candidate.id === id)
  if (arm === undefined) throw new Error(`economy frontier capital: unknown arm ${id}`)
  return arm
}

export function createCapitalPlan(arm: CapitalArm): AnalysisCashPlan | undefined {
  if (arm.id === 'none') return undefined
  const rungCost = arm.estateEquivalentsPerRung * CAPITAL_ESTATE_EQUIVALENT
  let nextEligibleWeek = arm.minimumWeek
  return {
    id: arm.id,
    decide(view) {
      if (view.conversions >= arm.maxRungs || view.weeksElapsed < nextEligibleWeek) {
        return null
      }
      const reserve = arm.reserveOpeningCash ? view.openingCash : 0
      if (view.cash - rungCost < reserve) return null
      nextEligibleWeek = view.weeksElapsed + arm.cooldownWeeks
      return {
        amount: rungCost,
        label: `optional expansion rung ${String(view.conversions + 1)}: ${String(arm.estateEquivalentsPerRung)} measured-estate equivalents`,
      }
    },
  }
}

export type CapitalCell = {
  seed: string
  policy: string
  armId: CapitalArmId
  macro: MacroRunCompact
  rungCost: number
  rungsPurchased: number
  totalEnterpriseCapital: number
  enterpriseEndResources: number
  conversionWeeks: number[]
  shadowReconciliationOk: boolean
}

export function runCapitalCell(
  seed: string,
  policy: Policy,
  armId: CapitalArmId,
): CapitalCell {
  const arm = capitalArm(armId)
  const analysisCashPlan = createCapitalPlan(arm)
  const record = runOne({
    seed,
    policy,
    horizonWeeks: MACRO_HORIZON_WEEKS,
    sliceWeeks: MACRO_SLICE_WEEKS,
    checkpointEvery: 26,
    productionD17b: true,
    awarenessStats: true,
    captureLedgerAtSlices: true,
    ...(analysisCashPlan === undefined ? {} : { analysisCashPlan }),
  })
  const journal = record.analysisCash
  if (analysisCashPlan === undefined && journal !== undefined) {
    throw new Error('economy frontier capital: neutral arm unexpectedly emitted a journal')
  }
  if (analysisCashPlan !== undefined && journal?.planId !== arm.id) {
    throw new Error('economy frontier capital: missing or mismatched analysis journal')
  }
  const totalEnterpriseCapital = journal?.totalConverted ?? 0
  return {
    seed,
    policy: policy.name,
    armId,
    macro: compactMacroRun(record),
    rungCost: arm.estateEquivalentsPerRung * CAPITAL_ESTATE_EQUIVALENT,
    rungsPurchased: journal?.conversions.length ?? 0,
    totalEnterpriseCapital,
    enterpriseEndResources: record.endCash + totalEnterpriseCapital,
    conversionWeeks: journal?.conversions.map((entry) => entry.week) ?? [],
    shadowReconciliationOk: journal?.shadowReconciliationOk ?? record.reconciliationOk,
  }
}

export type CapitalArmSummary = {
  armId: CapitalArmId
  policy: string
  runs: number
  endCash: Distribution
  maxLiquidCash: Distribution
  enterpriseEndResources: Distribution
  enterpriseCapital: Distribution
  rungsPurchased: Distribution
  firstConversionWeekAmongActivated: Distribution
  lastConversionWeekAmongActivated: Distribution
  releases: Distribution
  noProductionWeeks: Distribution
  engagedWeekFraction: Distribution
  weeksInsolvent: Distribution
  unstaffableWeeks: Distribution
  meanMarketing: Distribution
  meanLeadFame: Distribution
  publicitySpend: Distribution
  publicityCount: Distribution
  liquidRunaway: RateEstimate
  enterpriseEndAboveRunawayThreshold: RateEstimate
  distress: RateEstimate
  durableRecoveryAt103AmongDistressed: RateEstimate
  endNegative: RateEstimate
  terminalDecline: RateEstimate
  rosterWall: RateEstimate
  treatmentActivated: RateEstimate
  reconciliationFailures: number
}

export type CapitalPairedEffects = {
  armId: Exclude<CapitalArmId, 'none'>
  policy: string
  endCashVsCurrent: PairedEffect
  enterpriseResourcesVsCurrentCash: PairedEffect
  releasesVsCurrent: PairedEffect
  noProductionWeeksVsCurrent: PairedEffect
}

function nonNull(values: readonly (number | null)[]): number[] {
  return values.filter((value): value is number => value !== null)
}

export function aggregateCapitalRuns(
  cells: readonly CapitalCell[],
): CapitalArmSummary[] {
  const keys = [...new Set(cells.map((cell) => `${cell.armId}\u0000${cell.policy}`))].sort()
  return keys.map((key) => {
    const [armId, policy] = key.split('\u0000') as [CapitalArmId, string]
    const group = cells.filter(
      (cell) => cell.armId === armId && cell.policy === policy,
    )
    const distressed = group.filter((cell) => cell.macro.distressEntryWeek !== null)
    return {
      armId,
      policy,
      runs: group.length,
      endCash: distribution(group.map((cell) => cell.macro.endCash)),
      maxLiquidCash: distribution(group.map((cell) => cell.macro.maxCash)),
      enterpriseEndResources: distribution(
        group.map((cell) => cell.enterpriseEndResources),
      ),
      enterpriseCapital: distribution(
        group.map((cell) => cell.totalEnterpriseCapital),
      ),
      rungsPurchased: distribution(group.map((cell) => cell.rungsPurchased)),
      firstConversionWeekAmongActivated: distribution(
        group.flatMap((cell) =>
          cell.conversionWeeks[0] === undefined ? [] : [cell.conversionWeeks[0]],
        ),
      ),
      lastConversionWeekAmongActivated: distribution(
        group.flatMap((cell) => {
          const last = cell.conversionWeeks[cell.conversionWeeks.length - 1]
          return last === undefined ? [] : [last]
        }),
      ),
      releases: distribution(group.map((cell) => cell.macro.filmsReleased)),
      noProductionWeeks: distribution(
        group.map((cell) => cell.macro.weeksNoProduction),
      ),
      engagedWeekFraction: distribution(
        group.map((cell) => cell.macro.engagedWeekFraction),
      ),
      weeksInsolvent: distribution(group.map((cell) => cell.macro.weeksInsolvent)),
      unstaffableWeeks: distribution(group.map((cell) => cell.macro.unstaffableWeeks)),
      meanMarketing: distribution(
        nonNull(group.map((cell) => cell.macro.moviePortfolio.meanMarketing)),
      ),
      meanLeadFame: distribution(
        nonNull(group.map((cell) => cell.macro.moviePortfolio.meanLeadFame)),
      ),
      publicitySpend: distribution(group.map((cell) => cell.macro.publicitySpend)),
      publicityCount: distribution(group.map((cell) => cell.macro.publicityCount)),
      liquidRunaway: rate(
        group.filter((cell) => cell.macro.runawaySuccess).length,
        group.length,
      ),
      enterpriseEndAboveRunawayThreshold: rate(
        group.filter((cell) => cell.enterpriseEndResources >= 60_000_000).length,
        group.length,
      ),
      distress: rate(distressed.length, group.length),
      durableRecoveryAt103AmongDistressed: rate(
        distressed.filter((cell) => cell.macro.durableRecoveryAt103 === true)
          .length,
        distressed.length,
      ),
      endNegative: rate(
        group.filter((cell) => cell.macro.endCash < 0).length,
        group.length,
      ),
      terminalDecline: rate(
        group.filter((cell) => cell.macro.terminalDecline).length,
        group.length,
      ),
      rosterWall: rate(
        group.filter((cell) => cell.macro.rosterWallHit).length,
        group.length,
      ),
      treatmentActivated: rate(
        group.filter((cell) => cell.rungsPurchased > 0).length,
        group.length,
      ),
      reconciliationFailures: group.filter(
        (cell) =>
          !cell.macro.reconciliationOk || !cell.shadowReconciliationOk,
      ).length,
    }
  })
}

export function pairedCapitalEffects(
  cells: readonly CapitalCell[],
  baselineRows: readonly MacroRunCompact[],
): CapitalPairedEffects[] {
  const groups = [...new Set(cells
    .filter((cell) => cell.armId !== 'none')
    .map((cell) => `${cell.armId}\u0000${cell.policy}`))].sort()
  return groups.map((key) => {
    const [armId, policy] = key.split('\u0000') as [
      Exclude<CapitalArmId, 'none'>,
      string,
    ]
    const treated = cells.filter(
      (cell) => cell.armId === armId && cell.policy === policy,
    )
    const baseline = baselineRows.filter((row) => row.policy === policy)
    const map = <T>(rows: readonly T[], seed: (row: T) => string, value: (row: T) => number) =>
      new Map(rows.map((row) => [seed(row), value(row)]))
    const baselineMap = (value: (row: MacroRunCompact) => number) =>
      map(baseline, (row) => row.seed, value)
    const treatedMap = (value: (cell: CapitalCell) => number) =>
      map(treated, (cell) => cell.seed, value)
    return {
      armId,
      policy,
      endCashVsCurrent: pairedEffect(
        `${policy}/${armId}`,
        `${policy}/current`,
        treatedMap((cell) => cell.macro.endCash),
        baselineMap((row) => row.endCash),
      ),
      enterpriseResourcesVsCurrentCash: pairedEffect(
        `${policy}/${armId}/enterprise-resources`,
        `${policy}/current/cash`,
        treatedMap((cell) => cell.enterpriseEndResources),
        baselineMap((row) => row.endCash),
      ),
      releasesVsCurrent: pairedEffect(
        `${policy}/${armId}`,
        `${policy}/current`,
        treatedMap((cell) => cell.macro.filmsReleased),
        baselineMap((row) => row.filmsReleased),
      ),
      noProductionWeeksVsCurrent: pairedEffect(
        `${policy}/${armId}`,
        `${policy}/current`,
        treatedMap((cell) => cell.macro.weeksNoProduction),
        baselineMap((row) => row.weeksNoProduction),
      ),
    }
  })
}
