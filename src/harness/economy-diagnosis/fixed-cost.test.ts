import { describe, expect, it } from 'vitest'
import { TUNING } from '../../core/index.js'
import { runFixedCostBlastRadiusWitness } from './fixed-cost.js'

describe('economy diagnosis fixed-cost blast radius', () => {
  it('reproduces the allocator/recap omission without a cash or finance-total error', () => {
    const witness = runFixedCostBlastRadiusWitness()
    expect(witness.operationalFacilityOpexWeeks).toBe(1)
    expect(witness.allocation.omittedFacilityOpex).toBe(
      TUNING.PLACEMENT_ANNEX_WEEKLY_OPERATING_COST,
    )
    expect(witness.allocation.recapTotalLedgerFixedCost).toBe(
      witness.allocation.allocatorTotal,
    )
    expect(witness.allocation.recapTotalAllocatedPlusIdle).toBe(
      witness.allocation.allocatorTotal,
    )
    expect(witness.correctPaths.cashReconciliationDelta).toBe(0)
    expect(witness.correctPaths.cashDeltaFromOpening).toBe(
      witness.correctPaths.ledgerNet,
    )
    expect(witness.correctPaths.financeTotalsOverheadSpend).toBe(
      witness.correctPaths.periodSummaryOverheadSpend,
    )
    expect(witness.correctPaths.financeTotalsOverheadSpend).toBe(
      witness.correctPaths.recapTotalOverheadSpend,
    )
  })

  it('shows the same facility opex omitted from runway and cycle-fixed-cost previews', () => {
    const witness = runFixedCostBlastRadiusWitness()
    expect(witness.currentRecurringBurn.omittedFacilityOpex).toBe(
      TUNING.PLACEMENT_ANNEX_WEEKLY_OPERATING_COST,
    )
    expect(witness.currentRecurringBurn.financeViewWeeklyBurn).toBe(
      witness.currentRecurringBurn.weeklyBurnReported,
    )
    expect(witness.prospectiveCycle.commitmentPreviewWeeklyBurn).toBe(
      witness.currentRecurringBurn.weeklyBurnReported,
    )
    expect(witness.prospectiveCycle.omittedFacilityOpex).toBe(
      witness.prospectiveCycle.weeks *
        TUNING.PLACEMENT_ANNEX_WEEKLY_OPERATING_COST,
    )
    expect(witness.currentRecurringBurn.displayedRunwayWeeks).toBeGreaterThan(
      witness.currentRecurringBurn.completeRunwayWeeks!,
    )
  })
})
