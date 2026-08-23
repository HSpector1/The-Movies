import { describe, expect, it } from 'vitest'
import { runCombinationCell } from './combination.js'

describe('economy intervention frontier combinations', () => {
  it('keeps choice and capital journals deterministic and reconciled', () => {
    const left = runCombinationCell(
      'eta-macro-0002',
      'D03_nearBestProfit_80_leastCapital',
      'four-rung-1-estate',
    )
    const right = runCombinationCell(
      'eta-macro-0002',
      'D03_nearBestProfit_80_leastCapital',
      'four-rung-1-estate',
    )
    expect(left).toEqual(right)
    expect(left.macro.reconciliationOk).toBe(true)
    expect(left.shadowReconciliationOk).toBe(true)
    expect(left.choiceDiagnostics.arm).toBe(
      'D03_nearBestProfit_80_leastCapital',
    )
  })
})
