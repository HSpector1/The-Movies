import { describe, expect, it } from 'vitest'
import { runOne } from '../d16/driver.js'
import { forecastProfitMax, forecastROIMax } from '../d16/policies.js'
import { MACRO_HORIZON_WEEKS, MACRO_SLICE_WEEKS } from '../economy-truth-audit/macro.js'
import { profitCostExponentPolicy, runSelectorRecord } from './selector.js'

function comparable(record: ReturnType<typeof runOne>): unknown {
  return {
    endCash: record.endCash,
    films: record.films,
    slices: record.slices,
    ledgerTotals: record.ledgerTotals,
    rejectedActions: record.rejectedActions,
    rosterWallHit: record.rosterWallHit,
    rosterWallWeek: record.rosterWallWeek,
    episodes: record.episodes,
  }
}

function established(seed: string, policy: typeof forecastProfitMax): ReturnType<typeof runOne> {
  return runOne({
    seed,
    policy,
    horizonWeeks: MACRO_HORIZON_WEEKS,
    sliceWeeks: MACRO_SLICE_WEEKS,
    checkpointEvery: 26,
    productionD17b: true,
    awarenessStats: true,
    captureLedgerAtSlices: true,
  })
}

describe('economy diagnosis selector frontier', () => {
  it('uses the established P5 founding and roster law for every exponent', () => {
    for (const exponent of [0, 0.5, 1] as const) {
      const policy = profitCostExponentPolicy(exponent)
      expect(policy.founding).toEqual(forecastProfitMax.founding)
      expect(policy.roster).toEqual(forecastProfitMax.roster)
    }
  })

  it('exponent 0 is behavior-identical to P5', () => {
    const seed = 'economy-diagnosis-selector-endpoint-p5'
    expect(comparable(runSelectorRecord(seed, 0))).toEqual(
      comparable(established(seed, forecastProfitMax)),
    )
  })

  it('exponent 1 is behavior-identical to P6', () => {
    const seed = 'economy-diagnosis-selector-endpoint-p6'
    expect(comparable(runSelectorRecord(seed, 1))).toEqual(
      comparable(established(seed, forecastROIMax)),
    )
  })
})
