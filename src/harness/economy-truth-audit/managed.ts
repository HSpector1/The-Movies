// Project: Studio economy truth audit — current managed screenplay/casting/facility lens.
// Analysis only. Counterfactual slots are deliberately free and are never called purchases.

import { FACILITY_BLUEPRINTS } from '../../core/index.js'
import {
  FACILITIES_POLICY_IDS,
  runFacilitiesArm,
} from '../facilities/index.js'
import type {
  FacilitiesArmResult,
  FacilitiesPolicyId,
  FacilitiesSourceProvenance,
  FacilitiesWeeklyRow,
} from '../facilities/index.js'
import { distribution, pairedEffect, rate } from './statistics.js'
import type { Distribution, PairedEffect, RateEstimate } from './statistics.js'

export const MANAGED_SCHEMA_VERSION = 'economy-truth-managed-v1' as const
export const MANAGED_HORIZON_WEEKS = 260
export const MANAGED_SLICE_WEEKS = [104, 208, 260] as const
export const MANAGED_SEED_COUNT = 50

const ANNEX = FACILITY_BLUEPRINTS.find((blueprint) => blueprint.id === 'development-casting-annex')!
const HALL = FACILITY_BLUEPRINTS.find((blueprint) => blueprint.id === 'development-casting-hall')!

if (ANNEX === undefined || HALL === undefined) {
  throw new Error('economy truth audit: current facility catalog lacks Annex or Hall')
}

export function managedSeed(indexOneBased: number): string {
  if (!Number.isInteger(indexOneBased) || indexOneBased < 1) {
    throw new Error(`economy truth audit: invalid managed seed index ${String(indexOneBased)}`)
  }
  return `eta-managed-${String(indexOneBased).padStart(3, '0')}`
}

export type ManagedArmId = 'current' | 'free-plus-one-at-annex-open' | 'free-plus-two-at-hall-open'

export type ManagedSlice = {
  week: number
  cash: number
  ledgerTotal: number
  weeklyPayroll: number
  weeklyOverhead: number
  activeRunReceipts: number
  activeProductions: number
  releasedFilms: number
  activeContracts: number
}

export type ManagedArmCompact = {
  arm: ManagedArmId
  seed: string
  policyId: FacilitiesPolicyId
  finalCash: number
  minCash: number
  maxCash: number
  negativeCashWeeks: number
  longestNegativeCashStreak: number
  recoveredFromNegative: boolean
  releases: number
  greenlights: number
  scriptProjects: number
  castingSessions: number
  acceptedIntents: number
  rejectedIntents: number
  capacityRejectedIntents: number
  capacityRejectedByCapability: Record<string, number>
  productionHoldWeeks: number
  holdWeeksByCapability: Record<string, number>
  renewalAttempts: number
  renewalRejections: number
  initialRoster: Record<string, number>
  retainedAtExpiry: number | null
  developmentCasting: {
    capacitySlotWeeks: number
    occupiedSlotWeeks: number
    idleSlotWeeks: number
    fullWeeks: number
    longestFullStreak: number
    utilization: number | null
  }
  slices: Record<string, ManagedSlice>
}

export type ManagedCellCompact = {
  schemaVersion: typeof MANAGED_SCHEMA_VERSION
  seed: string
  policyId: FacilitiesPolicyId
  current: ManagedArmCompact
  plusOne: ManagedArmCompact
  plusTwo: ManagedArmCompact
}

function intervalRows(result: FacilitiesArmResult): FacilitiesWeeklyRow[] {
  return result.rows.filter((row) => row.sampleKind === 'interval-start')
}

function longestStreak(rows: readonly FacilitiesWeeklyRow[], predicate: (row: FacilitiesWeeklyRow) => boolean): number {
  let longest = 0
  let current = 0
  for (const row of rows) {
    current = predicate(row) ? current + 1 : 0
    longest = Math.max(longest, current)
  }
  return longest
}

function compactArm(result: FacilitiesArmResult, arm: ManagedArmId): ManagedArmCompact {
  const rows = intervalRows(result)
  const developmentCasting = result.summary.capability['development-casting']
  const firstNegative = rows.findIndex((row) => row.cash < 0)
  const recoveredFromNegative =
    firstNegative >= 0 && rows.slice(firstNegative + 1).some((row) => row.cash >= 0)
  const retained = result.summary.staffingStratum.retainedAtExpiryTalentIds
  const slices: Record<string, ManagedSlice> = {}
  for (const week of MANAGED_SLICE_WEEKS) {
    const row = result.rows.find((candidate) => candidate.week === week)
    if (row === undefined) throw new Error(`economy truth audit: managed slice ${String(week)} missing`)
    slices[String(week)] = {
      week: row.week,
      cash: row.cash,
      ledgerTotal: row.ledgerTotal,
      weeklyPayroll: row.weeklyPayroll,
      weeklyOverhead: row.weeklyOverhead,
      activeRunReceipts: row.activeRunReceipts,
      activeProductions: row.activeProductions,
      releasedFilms: row.releasedFilms,
      activeContracts: row.activeContracts,
    }
  }
  return {
    arm,
    seed: result.seed,
    policyId: result.policyId,
    finalCash: result.summary.finalCash,
    minCash: Math.min(...result.rows.map((row) => row.cash)),
    maxCash: Math.max(...result.rows.map((row) => row.cash)),
    negativeCashWeeks: rows.filter((row) => row.cash < 0).length,
    longestNegativeCashStreak: longestStreak(rows, (row) => row.cash < 0),
    recoveredFromNegative,
    releases: result.summary.releases,
    greenlights: result.summary.greenlights,
    scriptProjects: result.summary.scriptProjects,
    castingSessions: result.summary.castingSessions,
    acceptedIntents: result.summary.acceptedIntents,
    rejectedIntents: result.summary.rejectedIntents,
    capacityRejectedIntents: result.summary.capacityRejectedIntents,
    capacityRejectedByCapability: result.summary.capacityRejectedIntentsByCapability,
    productionHoldWeeks: result.summary.productionHoldWeeks,
    holdWeeksByCapability: result.summary.productionHoldWeeksByCapability,
    renewalAttempts: result.summary.renewalAttempts,
    renewalRejections: result.summary.renewalRejections,
    initialRoster: result.summary.initialRoster,
    retainedAtExpiry: retained === null ? null : retained.length,
    developmentCasting: {
      capacitySlotWeeks: developmentCasting.capacitySlotWeeks,
      occupiedSlotWeeks: developmentCasting.occupiedSlotWeeks,
      idleSlotWeeks: developmentCasting.idleSlotWeeks,
      fullWeeks: developmentCasting.fullWeeks,
      longestFullStreak: developmentCasting.longestFullStreak,
      utilization:
        developmentCasting.capacitySlotWeeks === 0
          ? null
          : developmentCasting.occupiedSlotWeeks / developmentCasting.capacitySlotWeeks,
    },
    slices,
  }
}

export function runManagedCell(
  seed: string,
  policyId: FacilitiesPolicyId,
  source: FacilitiesSourceProvenance,
): ManagedCellCompact {
  const current = runFacilitiesArm({
    seed,
    policyId,
    mode: 'current',
    horizonWeeks: MANAGED_HORIZON_WEEKS,
    source,
  })
  const plusOne = runFacilitiesArm({
    seed,
    policyId,
    mode: 'counterfactual',
    capacityDelta: 1,
    availableWeek: ANNEX.buildWeeks,
    horizonWeeks: MANAGED_HORIZON_WEEKS,
    source,
  })
  const plusTwo = runFacilitiesArm({
    seed,
    policyId,
    mode: 'counterfactual',
    capacityDelta: 2,
    availableWeek: HALL.buildWeeks,
    horizonWeeks: MANAGED_HORIZON_WEEKS,
    source,
  })
  return {
    schemaVersion: MANAGED_SCHEMA_VERSION,
    seed,
    policyId,
    current: compactArm(current, 'current'),
    plusOne: compactArm(plusOne, 'free-plus-one-at-annex-open'),
    plusTwo: compactArm(plusTwo, 'free-plus-two-at-hall-open'),
  }
}

function arms(cells: readonly ManagedCellCompact[], pick: (cell: ManagedCellCompact) => ManagedArmCompact): ManagedArmCompact[] {
  return cells.map(pick)
}

function column(rows: readonly ManagedArmCompact[], select: (row: ManagedArmCompact) => number): Map<string, number> {
  return new Map(rows.map((row) => [row.seed, select(row)]))
}

export type ManagedArmSummary = {
  finalCash: Distribution
  minCash: Distribution
  maxCash: Distribution
  releases: Distribution
  greenlights: Distribution
  negativeCashWeeks: Distribution
  longestNegativeCashStreak: Distribution
  everNegative: RateEstimate
  recoveredAmongEverNegative: RateEstimate
  renewalRejections: Distribution
  retainedAtExpiry: Distribution
  capacityRejectedIntents: Distribution
  developmentCastingRejections: Distribution
  productionHoldWeeks: Distribution
  developmentCastingUtilization: Distribution
  developmentCastingIdleSlotWeeks: Distribution
  slices: Record<string, {
    cash: Distribution
    weeklyPayroll: Distribution
    weeklyOverhead: Distribution
    activeRunReceipts: Distribution
    activeProductions: Distribution
    releases: Distribution
    activeContracts: Distribution
  }>
}

function summarizeArm(rows: readonly ManagedArmCompact[]): ManagedArmSummary {
  const everNegative = rows.filter((row) => row.negativeCashWeeks > 0)
  const retained = rows.flatMap((row) => row.retainedAtExpiry === null ? [] : [row.retainedAtExpiry])
  const utilization = rows.flatMap((row) => row.developmentCasting.utilization === null ? [] : [row.developmentCasting.utilization])
  return {
    finalCash: distribution(rows.map((row) => row.finalCash)),
    minCash: distribution(rows.map((row) => row.minCash)),
    maxCash: distribution(rows.map((row) => row.maxCash)),
    releases: distribution(rows.map((row) => row.releases)),
    greenlights: distribution(rows.map((row) => row.greenlights)),
    negativeCashWeeks: distribution(rows.map((row) => row.negativeCashWeeks)),
    longestNegativeCashStreak: distribution(rows.map((row) => row.longestNegativeCashStreak)),
    everNegative: rate(everNegative.length, rows.length),
    recoveredAmongEverNegative: rate(everNegative.filter((row) => row.recoveredFromNegative).length, everNegative.length),
    renewalRejections: distribution(rows.map((row) => row.renewalRejections)),
    retainedAtExpiry: distribution(retained),
    capacityRejectedIntents: distribution(rows.map((row) => row.capacityRejectedIntents)),
    developmentCastingRejections: distribution(rows.map((row) => row.capacityRejectedByCapability['development-casting'] ?? 0)),
    productionHoldWeeks: distribution(rows.map((row) => row.productionHoldWeeks)),
    developmentCastingUtilization: distribution(utilization),
    developmentCastingIdleSlotWeeks: distribution(rows.map((row) => row.developmentCasting.idleSlotWeeks)),
    slices: Object.fromEntries(MANAGED_SLICE_WEEKS.map((week) => {
      const samples = rows.map((row) => row.slices[String(week)]!)
      return [String(week), {
        cash: distribution(samples.map((sample) => sample.cash)),
        weeklyPayroll: distribution(samples.map((sample) => sample.weeklyPayroll)),
        weeklyOverhead: distribution(samples.map((sample) => sample.weeklyOverhead)),
        activeRunReceipts: distribution(samples.map((sample) => sample.activeRunReceipts)),
        activeProductions: distribution(samples.map((sample) => sample.activeProductions)),
        releases: distribution(samples.map((sample) => sample.releasedFilms)),
        activeContracts: distribution(samples.map((sample) => sample.activeContracts)),
      }]
    })),
  }
}

export type ManagedPolicyAggregate = {
  policyId: FacilitiesPolicyId
  runsPerArm: number
  actualInitialRoster: Record<string, Distribution>
  current: ManagedArmSummary
  freePlusOne: ManagedArmSummary
  freePlusTwo: ManagedArmSummary
  freePlusOneEffects: {
    finalCash: PairedEffect
    releases: PairedEffect
    developmentCastingRejections: PairedEffect
  }
  freePlusTwoEffects: {
    finalCash: PairedEffect
    releases: PairedEffect
    developmentCastingRejections: PairedEffect
  }
  roughOptimisticPaymentBounds: {
    interpretation: 'free-capacity cash delta minus catalog capex and undiscounted post-opening opex; non-causal, not purchase ROI'
    annex: Distribution
    hall: Distribution
  }
  exemplars: {
    currentMinEndCash: { seed: string; value: number }
    currentMaxEndCash: { seed: string; value: number }
    firstCurrentNegativeSeed: string | null
    firstCurrentRenewalRejectionSeed: string | null
  }
}

function managedExtreme(
  rows: readonly ManagedArmCompact[],
  direction: 'min' | 'max',
): { seed: string; value: number } {
  const ordered = [...rows].sort((a, b) =>
    (direction === 'min' ? a.finalCash - b.finalCash : b.finalCash - a.finalCash) ||
    a.seed.localeCompare(b.seed),
  )
  return { seed: ordered[0]!.seed, value: ordered[0]!.finalCash }
}

function aggregatePolicy(cells: readonly ManagedCellCompact[], policyId: FacilitiesPolicyId): ManagedPolicyAggregate {
  const selected = cells.filter((cell) => cell.policyId === policyId)
  const current = arms(selected, (cell) => cell.current)
  const plusOne = arms(selected, (cell) => cell.plusOne)
  const plusTwo = arms(selected, (cell) => cell.plusTwo)
  const delta = (
    left: readonly ManagedArmCompact[],
    right: readonly ManagedArmCompact[],
    select: (row: ManagedArmCompact) => number,
    leftName: string,
  ): PairedEffect => pairedEffect(leftName, 'current', column(left, select), column(right, select))
  const annexCashDeltas = plusOne.map((row, index) =>
    row.finalCash - current[index]!.finalCash - ANNEX.capex - ANNEX.weeklyOperatingCost * (MANAGED_HORIZON_WEEKS - ANNEX.buildWeeks),
  )
  const hallCashDeltas = plusTwo.map((row, index) =>
    row.finalCash - current[index]!.finalCash - HALL.capex - HALL.weeklyOperatingCost * (MANAGED_HORIZON_WEEKS - HALL.buildWeeks),
  )
  const roles = ['actor', 'director', 'writer', 'craft']
  return {
    policyId,
    runsPerArm: selected.length,
    actualInitialRoster: Object.fromEntries(roles.map((role) => [role, distribution(current.map((row) => row.initialRoster[role] ?? 0))])),
    current: summarizeArm(current),
    freePlusOne: summarizeArm(plusOne),
    freePlusTwo: summarizeArm(plusTwo),
    freePlusOneEffects: {
      finalCash: delta(plusOne, current, (row) => row.finalCash, 'free-plus-one'),
      releases: delta(plusOne, current, (row) => row.releases, 'free-plus-one'),
      developmentCastingRejections: delta(plusOne, current, (row) => row.capacityRejectedByCapability['development-casting'] ?? 0, 'free-plus-one'),
    },
    freePlusTwoEffects: {
      finalCash: delta(plusTwo, current, (row) => row.finalCash, 'free-plus-two'),
      releases: delta(plusTwo, current, (row) => row.releases, 'free-plus-two'),
      developmentCastingRejections: delta(plusTwo, current, (row) => row.capacityRejectedByCapability['development-casting'] ?? 0, 'free-plus-two'),
    },
    roughOptimisticPaymentBounds: {
      interpretation: 'free-capacity cash delta minus catalog capex and undiscounted post-opening opex; non-causal, not purchase ROI',
      annex: distribution(annexCashDeltas),
      hall: distribution(hallCashDeltas),
    },
    exemplars: {
      currentMinEndCash: managedExtreme(current, 'min'),
      currentMaxEndCash: managedExtreme(current, 'max'),
      firstCurrentNegativeSeed: [...current].sort((a, b) => a.seed.localeCompare(b.seed)).find((row) => row.negativeCashWeeks > 0)?.seed ?? null,
      firstCurrentRenewalRejectionSeed: [...current].sort((a, b) => a.seed.localeCompare(b.seed)).find((row) => row.renewalRejections > 0)?.seed ?? null,
    },
  }
}

export type ManagedAggregate = {
  schemaVersion: typeof MANAGED_SCHEMA_VERSION
  experiment: {
    identity: 'ETA-MANAGED-50x260-v1'
    evidenceClass: 'current managed screenplay/casting/operations path plus free capacity sensitivity'
    seedCount: number
    seeds: { first: string; last: string }
    horizonWeeks: number
    slices: readonly number[]
    policyIds: readonly FacilitiesPolicyId[]
    counterfactuals: {
      annex: { availableWeek: number; capacity: number; capex: number; weeklyOperatingCost: number }
      hall: { availableWeek: number; capacity: number; capex: number; weeklyOperatingCost: number }
    }
  }
  validation: { cells: number; uniqueSeeds: number; missingCells: number }
  policies: ManagedPolicyAggregate[]
}

export function aggregateManaged(cells: readonly ManagedCellCompact[]): ManagedAggregate {
  const seeds = [...new Set(cells.map((cell) => cell.seed))].sort()
  return {
    schemaVersion: MANAGED_SCHEMA_VERSION,
    experiment: {
      identity: 'ETA-MANAGED-50x260-v1',
      evidenceClass: 'current managed screenplay/casting/operations path plus free capacity sensitivity',
      seedCount: seeds.length,
      seeds: { first: seeds[0] ?? '', last: seeds[seeds.length - 1] ?? '' },
      horizonWeeks: MANAGED_HORIZON_WEEKS,
      slices: MANAGED_SLICE_WEEKS,
      policyIds: FACILITIES_POLICY_IDS,
      counterfactuals: {
        annex: {
          availableWeek: ANNEX.buildWeeks,
          capacity: ANNEX.capacity,
          capex: ANNEX.capex,
          weeklyOperatingCost: ANNEX.weeklyOperatingCost,
        },
        hall: {
          availableWeek: HALL.buildWeeks,
          capacity: HALL.capacity,
          capex: HALL.capex,
          weeklyOperatingCost: HALL.weeklyOperatingCost,
        },
      },
    },
    validation: {
      cells: cells.length,
      uniqueSeeds: seeds.length,
      missingCells: seeds.length * FACILITIES_POLICY_IDS.length - cells.length,
    },
    policies: FACILITIES_POLICY_IDS.map((policyId) => aggregatePolicy(cells, policyId)),
  }
}
