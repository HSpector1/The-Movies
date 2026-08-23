// Analysis-only evidence for the fixed-cost attribution gap.
//
// `allocateFixedCosts` is intentionally a managerial read model, not an engine
// mutation. Its current basis is ledger payroll + overhead. The live engine also
// records placed-facility operating cost as `facilityOpex`; this detector keeps
// the allocator basis and the complete fixed-operating ledger basis side by side.

import {
  allocateFixedCosts,
  ledgerFixedCostByWeek,
  type AllocationWindow,
} from '../../core/fixedCostAllocation.js'
import { applyActions } from '../../core/actions.js'
import { studioRunRecap } from '../../core/studioRunRecap.js'
import { tick } from '../../core/tick.js'
import { TUNING } from '../../core/tuning.js'
import { generateWorld } from '../../core/worldgen.js'
import type { GameState } from '../../core/types.js'

export const FIXED_OPERATING_KINDS = ['payroll', 'overhead', 'facilityOpex'] as const
export type FixedOperatingKind = (typeof FIXED_OPERATING_KINDS)[number]

export type FixedOperatingKindTotals = Record<FixedOperatingKind, number>

export type FixedCostGapWeek = {
  week: number
  /** The existing allocator's basis: payroll + overhead only. */
  allocatorBasis: number
  /** Complete fixed-operating spend from all three ledger kinds. */
  ledgerByKind: FixedOperatingKindTotals
  completeLedgerFixedOperatingSpend: number
  /** Complete spend minus the existing allocator basis. */
  gap: number
}

export type FixedCostGapReport = {
  window: AllocationWindow
  /** `allocateFixedCosts(state, window).total`; payroll + overhead only. */
  allocatorTotal: number
  /** Complete ledger fixed-operating spend, including facilityOpex. */
  completeLedgerFixedOperatingSpend: number
  /** Complete spend minus allocator total. */
  gap: number
  allocatorByKind: FixedOperatingKindTotals
  ledgerByKind: FixedOperatingKindTotals
  weekly: FixedCostGapWeek[]
}

function emptyKindTotals(): FixedOperatingKindTotals {
  return { payroll: 0, overhead: 0, facilityOpex: 0 }
}

function spendForLedgerAmount(amount: number, kind: FixedOperatingKind, week: number): number {
  if (!Number.isInteger(amount)) {
    throw new Error(
      `fixed-cost-gap: ledger ${kind} at week ${String(week)} is not a whole-dollar amount (${String(amount)})`,
    )
  }
  return -amount
}

/**
 * Compare the current managerial allocator with the complete fixed-operating
 * ledger basis over an inclusive window. This function is pure and analysis-only.
 */
export function measureFixedCostGap(
  state: GameState,
  window: AllocationWindow = { from: 0, to: state.market.tick - 1 },
): FixedCostGapReport {
  const allocation = allocateFixedCosts(state, window)
  const allocatorByKind = emptyKindTotals()
  const ledgerByKind = emptyKindTotals()
  const weekly = [] as FixedCostGapWeek[]
  const allocatorByWeek = ledgerFixedCostByWeek(state)

  for (let week = window.from; week <= window.to; week++) {
    const byKind = emptyKindTotals()
    for (const entry of state.ledger) {
      if (entry.week !== week) continue
      if (!FIXED_OPERATING_KINDS.includes(entry.kind as FixedOperatingKind)) continue
      const kind = entry.kind as FixedOperatingKind
      const spend = spendForLedgerAmount(entry.amount, kind, week)
      byKind[kind] += spend
      ledgerByKind[kind] += spend
    }

    const complete = byKind.payroll + byKind.overhead + byKind.facilityOpex
    const allocatorBasis = allocatorByWeek.get(week) ?? 0
    weekly.push({
      week,
      allocatorBasis,
      ledgerByKind: byKind,
      completeLedgerFixedOperatingSpend: complete,
      gap: complete - allocatorBasis,
    })
  }

  allocatorByKind.payroll = ledgerByKind.payroll
  allocatorByKind.overhead = ledgerByKind.overhead
  const completeLedgerFixedOperatingSpend =
    ledgerByKind.payroll + ledgerByKind.overhead + ledgerByKind.facilityOpex

  return {
    window,
    allocatorTotal: allocation.total,
    completeLedgerFixedOperatingSpend,
    gap: completeLedgerFixedOperatingSpend - allocation.total,
    allocatorByKind,
    ledgerByKind,
    weekly,
  }
}

export type FixedCostGapWitness = {
  identity: 'ETA-FIXED-COST-GAP-ANNEX-1W-v1'
  seed: string
  fixtureBoundary: string
  operationalFacilityOpexWeeks: number
  allocatorTotal: number
  recapTotalLedgerFixedCost: number
  completeLedgerFixedOperatingSpend: number
  omittedFacilityOpex: number
  report: FixedCostGapReport
}

/**
 * Exact reproduction used by the audit artifact. The fixture starts in the persisted founded
 * economy and activates managed operations through the public action, then places and advances
 * the real Annex through the real action/tick path. It deliberately carries no roster so the
 * one-week omission is isolated from payroll.
 */
export function runFixedCostGapWitness(
  seed = 'economy-truth-audit-fixed-cost-gap',
): FixedCostGapWitness {
  const engaged: GameState = { ...generateWorld(seed), economyEngagedEver: true }
  let state = applyActions(engaged, [{ kind: 'activateStudioOperations' }])
  state = applyActions(state, [
    {
      kind: 'placeFacility',
      placement: {
        blueprintId: 'development-casting-annex',
        origin: { gx: 7, gy: 15 },
      },
    },
  ])
  for (let week = 0; week < TUNING.PLACEMENT_ANNEX_BUILD_WEEKS + 1; week++) state = tick(state)
  const report = measureFixedCostGap(state)
  const recap = studioRunRecap(state)
  return {
    identity: 'ETA-FIXED-COST-GAP-ANNEX-1W-v1',
    seed,
    fixtureBoundary:
      'persisted founded-economy fixture; public managed-operations activation, placement action, and production tick path',
    operationalFacilityOpexWeeks: 1,
    allocatorTotal: report.allocatorTotal,
    recapTotalLedgerFixedCost: recap.capital.totalLedgerFixedCost,
    completeLedgerFixedOperatingSpend: report.completeLedgerFixedOperatingSpend,
    omittedFacilityOpex: report.gap,
    report,
  }
}
