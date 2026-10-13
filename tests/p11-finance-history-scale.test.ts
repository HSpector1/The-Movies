import { performance } from 'node:perf_hooks'
import { describe, expect, it } from 'vitest'
import { applyActions, generateWorld, makeSaveV18, stableStringify, tick } from '../src/core/index.js'
import { financeHistory, recordedFinancePeriod } from '../src/core/financeReport.js'

describe('P11 bounded history at long-save scale', () => {
  it('keeps a 6,240-advance real ledger exact with at most 52 weekly chart/text points', () => {
    // This is a week-count stress trajectory, not an invented calendar or an
    // economic tuning scenario. The engine permits unavoidable costs in the red.
    let state = applyActions({ ...generateWorld('p11-history-scale'), economyEngagedEver: true }, [{ kind: 'activateStudioOperations' }])
    for (let week = 0; week < 6_240; week++) state = tick(state)
    const saveBefore = stableStringify(makeSaveV18(state))
    const started = performance.now()
    const history = financeHistory(state)
    const queryMilliseconds = performance.now() - started
    const reportBytes = Buffer.byteLength(JSON.stringify(history))
    expect(state.ledger.length).toBeGreaterThanOrEqual(6_240)
    expect(history.windows.map(window => window.points.length)).toEqual([13, 52])
    for (const window of history.windows) {
      const period = window.period
      expect(period).not.toBeNull()
      if (period === null) throw new Error('A completed 6,240-advance history must contain a period')
      expect(period.complete).toBe(true)
      expect(period.closingCash).toBe(state.studio.cash)
      expect(period).toEqual(recordedFinancePeriod(state, period.fromWeek,
        period.toWeekInclusive, period.id, period.label))
      expect(window.points.at(-1)!.closingCash).toBe(state.studio.cash)
    }
    // Keep the original 110,000-byte bound on the pre-P15B report shape. The
    // three adopted loan/closure categories each add one 13- and one 52-point
    // series even on this no-loan trajectory. Bound those additions separately;
    // neither longer saves nor future category additions get an automatic allowance.
    const addedKinds: ReadonlySet<string> = new Set(['loanPrincipal', 'loanInstallment', 'claimPayment'])
    for (const window of history.windows) {
      const added = window.costSeries.filter(series => addedKinds.has(series.kind))
      expect(added.map(series => series.kind)).toEqual(['loanPrincipal', 'loanInstallment', 'claimPayment'])
      for (const series of added) {
        expect(series.periodAmount).toBe(0)
        expect(series.points).toHaveLength(window.windowWeeks)
        expect(series.points.map(point => point.week)).toEqual(window.points.map(point => point.fromWeek))
        expect(series.points.every(point => point.amount === 0 && point.coverage === 'complete' && point.notice === null)).toBe(true)
      }
    }
    const originalShapeBytes = Buffer.byteLength(JSON.stringify({ ...history,
      windows: history.windows.map(window => ({ ...window,
        costSeries: window.costSeries.filter(series => !addedKinds.has(series.kind)),
      })),
    }))
    expect(originalShapeBytes).toBeLessThan(110_000)
    // 65 bounded points plus two series headers per category: 4,500 bytes each.
    // This fixed allowance is only for the three named additions above.
    expect(reportBytes - originalShapeBytes).toBeLessThan(3 * 4_500)
    expect(queryMilliseconds).toBeLessThan(2_000)
    expect(stableStringify(makeSaveV18(state))).toBe(saveBefore)
    console.info(JSON.stringify({ proof: 'p11-week-history-scale', advances: 6_240,
      ledgerEntries: state.ledger.length, saveBytes: Buffer.byteLength(saveBefore),
      reportBytes, originalShapeBytes, addedSeriesBytes: reportBytes - originalShapeBytes, queryMilliseconds: Math.round(queryMilliseconds * 100) / 100 }))
  }, 60_000)
})
