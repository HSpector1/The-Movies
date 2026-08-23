// Economy Diagnosis 02 — fixed-operating read-model blast-radius witness.
// Analysis only. This reproduces, but does not repair, the Audit-01 Annex gap.

import {
  TUNING,
  applyActions,
  commitmentPreview,
  financeTotals,
  financeView,
  generateWorld,
  periodSummary,
  prospectiveCycleFixedCost,
  runway,
  studioRunRecap,
  tick,
  weeklyPlacementOperatingCost,
} from '../../core/index.js'
import type { GameState } from '../../core/index.js'
import {
  measureFixedCostGap,
} from '../economy-truth-audit/fixed-cost-gap.js'

export const DIAGNOSIS_FIXED_COST_SCHEMA_VERSION =
  'economy-diagnosis-fixed-cost-v1' as const

function annexWitnessState(seed: string): GameState {
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
  for (let week = 0; week < TUNING.PLACEMENT_ANNEX_BUILD_WEEKS + 1; week++) {
    state = tick(state)
  }
  return state
}
export type FixedCostBlastRadiusWitness = {
  identity: 'D02-FIXED-COST-BLAST-RADIUS-ANNEX-1W-v1'
  seed: string
  operationalFacilityOpexWeeks: number
  facilityOpexPerWeek: number
  allocation: {
    allocatorTotal: number
    completeLedgerFixedOperatingSpend: number
    omittedFacilityOpex: number
    recapTotalLedgerFixedCost: number
    recapTotalAllocatedPlusIdle: number
  }
  currentRecurringBurn: {
    weeklyBurnReported: number
    financeViewWeeklyBurn: number
    actualNextWeekFixedOperatingOutflow: number
    omittedFacilityOpex: number
    displayedRunwayWeeks: number | null
    completeRunwayWeeks: number | null
  }
  prospectiveCycle: {
    weeks: number
    reportedFixedCost: number
    completeFixedCost: number
    omittedFacilityOpex: number
    commitmentPreviewWeeklyBurn: number
  }
  correctPaths: {
    cashDeltaFromOpening: number
    ledgerNet: number
    cashReconciliationDelta: number
    financeTotalsOverheadSpend: number
    periodSummaryOverheadSpend: number
    recapTotalOverheadSpend: number
  }
}

/**
 * One real Annex, one charged operating week, no roster and no film. This keeps
 * the exact $3,500 omission isolated from payroll, occupancy and film outcomes.
 */
export function runFixedCostBlastRadiusWitness(
  seed = 'economy-diagnosis-fixed-cost-blast-radius',
): FixedCostBlastRadiusWitness {
  const state = annexWitnessState(seed)
  const gap = measureFixedCostGap(state)
  const recap = studioRunRecap(state)
  const totals = financeTotals(state)
  const period = periodSummary(state, 0, state.market.tick - 1)
  const view = financeView(state)
  const facilityOpexPerWeek = weeklyPlacementOperatingCost(state.placement)
  const actualNextWeekFixedOperatingOutflow =
    view.weeklyBurn + facilityOpexPerWeek
  const displayed = runway(state)
  const completeRunwayWeeks =
    actualNextWeekFixedOperatingOutflow <= 0
      ? null
      : Math.floor(state.studio.cash / actualNextWeekFixedOperatingOutflow)
  const cycle = prospectiveCycleFixedCost(state)
  const completeCycleFixedCost =
    cycle.amount + cycle.weeks * facilityOpexPerWeek
  const preview = commitmentPreview(state, 0)
  const ledgerNet = state.ledger.reduce((sum, entry) => sum + entry.amount, 0)
  return {
    identity: 'D02-FIXED-COST-BLAST-RADIUS-ANNEX-1W-v1',
    seed,
    operationalFacilityOpexWeeks: gap.weekly.filter(
      (week) => week.ledgerByKind.facilityOpex > 0,
    ).length,
    facilityOpexPerWeek,
    allocation: {
      allocatorTotal: gap.allocatorTotal,
      completeLedgerFixedOperatingSpend: gap.completeLedgerFixedOperatingSpend,
      omittedFacilityOpex: gap.gap,
      recapTotalLedgerFixedCost: recap.capital.totalLedgerFixedCost,
      recapTotalAllocatedPlusIdle:
        recap.capital.totalAllocatedFixedCost + recap.capital.idleFixedCost,
    },
    currentRecurringBurn: {
      weeklyBurnReported: view.weeklyBurn,
      financeViewWeeklyBurn: view.weeklyBurn,
      actualNextWeekFixedOperatingOutflow,
      omittedFacilityOpex:
        actualNextWeekFixedOperatingOutflow - view.weeklyBurn,
      displayedRunwayWeeks: displayed.weeks,
      completeRunwayWeeks,
    },
    prospectiveCycle: {
      weeks: cycle.weeks,
      reportedFixedCost: cycle.amount,
      completeFixedCost: completeCycleFixedCost,
      omittedFacilityOpex: completeCycleFixedCost - cycle.amount,
      commitmentPreviewWeeklyBurn: preview.postWeeklyBurn,
    },
    correctPaths: {
      cashDeltaFromOpening: state.studio.cash - TUNING.INITIAL_CASH,
      ledgerNet,
      cashReconciliationDelta:
        state.studio.cash - (TUNING.INITIAL_CASH + ledgerNet),
      financeTotalsOverheadSpend: -totals.overhead,
      periodSummaryOverheadSpend: -period.overhead,
      recapTotalOverheadSpend: recap.capital.totalOverhead,
    },
  }
}
