import { describe, expect, it } from 'vitest'
import {
  applyActions,
  generateWorld,
  studioRunRecap,
  tick,
  type GameState,
} from '../../core/index.js'
import { TUNING } from '../../core/tuning.js'
import { measureFixedCostGap } from './fixed-cost-gap.js'
import { runFixedCostGapWitness } from './fixed-cost-gap.js'

function managedStudio(seed: string): GameState {
  const engaged: GameState = { ...generateWorld(seed), economyEngagedEver: true }
  return applyActions(engaged, [{ kind: 'activateStudioOperations' }])
}

describe('fixed-cost attribution gap', () => {
  it('emits a deterministic compact reproduction witness', () => {
    const left = runFixedCostGapWitness()
    const right = runFixedCostGapWitness()
    expect(left).toEqual(right)
    expect(left.omittedFacilityOpex).toBe(TUNING.PLACEMENT_ANNEX_WEEKLY_OPERATING_COST)
    expect(left.recapTotalLedgerFixedCost).toBe(left.allocatorTotal)
  })

  it('detects facilityOpex omitted by allocator and studio recap after a real placement', () => {
    let state = managedStudio('economy-truth-audit-fixed-cost-gap')
    state = applyActions(state, [
      {
        kind: 'placeFacility',
        placement: {
          blueprintId: 'development-casting-annex',
          origin: { gx: 7, gy: 15 },
        },
      },
    ])

    // The public placement action commits a 13-week build. The first operating
    // charge is on the next advance after the facility flips operational.
    for (let i = 0; i < TUNING.PLACEMENT_ANNEX_BUILD_WEEKS + 1; i++) state = tick(state)

    expect(state.placement.facilities).toHaveLength(1)
    expect(state.placement.facilities[0]?.status).toBe('operational')
    expect(state.ledger.filter((entry) => entry.kind === 'facilityOpex')).toEqual([
      {
        week: TUNING.PLACEMENT_ANNEX_BUILD_WEEKS,
        kind: 'facilityOpex',
        amount: -TUNING.PLACEMENT_ANNEX_WEEKLY_OPERATING_COST,
        note: expect.any(String),
      },
    ])

    const report = measureFixedCostGap(state)
    const weeks = TUNING.PLACEMENT_ANNEX_BUILD_WEEKS + 1
    const expectedOverhead = weeks * TUNING.OVERHEAD_BASE
    const expectedFacilityOpex = TUNING.PLACEMENT_ANNEX_WEEKLY_OPERATING_COST

    expect(report.allocatorByKind).toEqual({
      payroll: 0,
      overhead: expectedOverhead,
      facilityOpex: 0,
    })
    expect(report.ledgerByKind).toEqual({
      payroll: 0,
      overhead: expectedOverhead,
      facilityOpex: expectedFacilityOpex,
    })
    expect(report.allocatorTotal).toBe(expectedOverhead)
    expect(report.completeLedgerFixedOperatingSpend).toBe(
      expectedOverhead + expectedFacilityOpex,
    )
    expect(report.gap).toBe(expectedFacilityOpex)

    const opexWeek = report.weekly.find(
      (row) => row.week === TUNING.PLACEMENT_ANNEX_BUILD_WEEKS,
    )
    expect(opexWeek).toEqual({
      week: TUNING.PLACEMENT_ANNEX_BUILD_WEEKS,
      allocatorBasis: TUNING.OVERHEAD_BASE,
      ledgerByKind: {
        payroll: 0,
        overhead: TUNING.OVERHEAD_BASE,
        facilityOpex: TUNING.PLACEMENT_ANNEX_WEEKLY_OPERATING_COST,
      },
      completeLedgerFixedOperatingSpend:
        TUNING.OVERHEAD_BASE + TUNING.PLACEMENT_ANNEX_WEEKLY_OPERATING_COST,
      gap: TUNING.PLACEMENT_ANNEX_WEEKLY_OPERATING_COST,
    })

    // The recap consumes the same allocator basis, so its reported ledger fixed
    // cost agrees with payroll+overhead while the complete ledger is higher.
    const recap = studioRunRecap(state)
    expect(recap.capital.totalLedgerFixedCost).toBe(report.allocatorTotal)
    expect(recap.capital.totalLedgerFixedCost).toBeLessThan(
      report.completeLedgerFixedOperatingSpend,
    )
  })
})
