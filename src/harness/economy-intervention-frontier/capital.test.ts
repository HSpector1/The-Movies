import { describe, expect, it } from 'vitest'
import { forecastProfitMax } from '../d16/policies.js'
import {
  CAPITAL_ESTATE_EQUIVALENT,
  capitalArm,
  createCapitalPlan,
  runCapitalCell,
} from './capital.js'

describe('economy intervention frontier capital ladder', () => {
  it('buys only after the gate while preserving one opening bankroll', () => {
    const plan = createCapitalPlan(capitalArm('four-rung-5-estates'))!
    const rung = 5 * CAPITAL_ESTATE_EQUIVALENT
    expect(
      plan.decide({
        week: 51,
        weeksElapsed: 51,
        cash: 100_000_000,
        openingCash: 20_000_000,
        totalConverted: 0,
        conversions: 0,
      }),
    ).toBeNull()
    expect(
      plan.decide({
        week: 52,
        weeksElapsed: 52,
        cash: 20_000_000 + rung - 1,
        openingCash: 20_000_000,
        totalConverted: 0,
        conversions: 0,
      }),
    ).toBeNull()
    expect(
      plan.decide({
        week: 52,
        weeksElapsed: 52,
        cash: 20_000_000 + rung,
        openingCash: 20_000_000,
        totalConverted: 0,
        conversions: 0,
      })?.amount,
    ).toBe(rung)
  })

  it('keeps the neutral production run uninstrumented and reconciled', () => {
    const cell = runCapitalCell('eta-macro-0001', forecastProfitMax, 'none')
    expect(cell.macro.reconciliationOk).toBe(true)
    expect(cell.totalEnterpriseCapital).toBe(0)
    expect(cell.enterpriseEndResources).toBe(cell.macro.endCash)
    expect(cell.conversionWeeks).toEqual([])
  })

  it('journals every closed-loop conversion and conserves enterprise resources', () => {
    const cell = runCapitalCell(
      'eta-macro-0002',
      forecastProfitMax,
      'four-rung-1-estate',
    )
    expect(cell.shadowReconciliationOk).toBe(true)
    expect(cell.totalEnterpriseCapital).toBe(
      cell.rungsPurchased * CAPITAL_ESTATE_EQUIVALENT,
    )
    expect(cell.enterpriseEndResources).toBe(
      cell.macro.endCash + cell.totalEnterpriseCapital,
    )
  })
})
