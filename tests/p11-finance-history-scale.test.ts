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
    // Keep the original110k pre-P15B shape. Named P15B and P16 additions each have
    // independent bounded65-point/two-header allowances; future kinds get none.
    const p15bKinds = ['loanPrincipal', 'loanInstallment', 'claimPayment'] as const
    const p16Kinds = ['rightsConsideration', 'dueDiligenceFee', 'acquisitionOutlay'] as const
    const p15bSet: ReadonlySet<string> = new Set(p15bKinds)
    const p16Set: ReadonlySet<string> = new Set(p16Kinds)
    const f40Kinds = ['estatePurchase'] as const
    const f40Set: ReadonlySet<string> = new Set(f40Kinds)
    for (const window of history.windows) {
      for (const kinds of [p15bKinds, p16Kinds, f40Kinds]) {
        const set: ReadonlySet<string> = new Set(kinds)
        const added = window.costSeries.filter(series => set.has(series.kind))
        expect(added.map(series => series.kind)).toEqual([...kinds])
        for (const series of added) {
          expect(series.periodAmount).toBe(0)
          expect(series.points).toHaveLength(window.windowWeeks)
          expect(series.points.map(point => point.week)).toEqual(window.points.map(point => point.fromWeek))
          expect(series.points.every(point => point.amount === 0 && point.coverage === 'complete' && point.notice === null)).toBe(true)
        }
      }
    }
    // Independent F40 intermediate: remove exactly its one series, retain prior P16/P15B.
    const preF40ShapeBytes = Buffer.byteLength(JSON.stringify({ ...history,
      windows: history.windows.map(window => ({ ...window,
        costSeries: window.costSeries.filter(series => !f40Set.has(series.kind)),
      })),
    }))
    // Independent predecessor intermediate: remove exactly P16 and newest F40.
    const predecessorShapeBytes = Buffer.byteLength(JSON.stringify({ ...history,
      windows: history.windows.map(window => ({ ...window,
        costSeries: window.costSeries.filter(series => !p16Set.has(series.kind) && !f40Set.has(series.kind)),
      })),
    }))
    const originalShapeBytes = Buffer.byteLength(JSON.stringify({ ...history,
      windows: history.windows.map(window => ({ ...window,
        costSeries: window.costSeries.filter(series => !p15bSet.has(series.kind) && !p16Set.has(series.kind) && !f40Set.has(series.kind)),
      })),
    }))
    expect(originalShapeBytes).toBeLessThan(110_000)
    expect(predecessorShapeBytes - originalShapeBytes).toBeLessThan(3 * 4_500)
    expect(preF40ShapeBytes - predecessorShapeBytes).toBeLessThan(3 * 4_500)
    expect(reportBytes - preF40ShapeBytes).toBeLessThan(4_500)
    expect(queryMilliseconds).toBeLessThan(2_000)
    expect(stableStringify(makeSaveV18(state))).toBe(saveBefore)
    console.info(JSON.stringify({ proof: 'p11-week-history-scale', advances: 6_240,
      ledgerEntries: state.ledger.length, saveBytes: Buffer.byteLength(saveBefore),
      reportBytes, originalShapeBytes, predecessorShapeBytes, p15bSeriesBytes: predecessorShapeBytes - originalShapeBytes, preF40ShapeBytes, p16SeriesBytes: preF40ShapeBytes - predecessorShapeBytes, f40SeriesBytes: reportBytes - preF40ShapeBytes, queryMilliseconds: Math.round(queryMilliseconds * 100) / 100 }))
  }, 60_000)
})
