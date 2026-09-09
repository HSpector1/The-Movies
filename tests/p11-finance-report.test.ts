import { describe, expect, it } from 'vitest'
import { applyActions, commitPlacement, generateWorld, tick, stableStringify, makeSaveV10, migrateToV18, TUNING } from '../src/core/index.js'
import { financeOverview, recordedFinancePeriod } from '../src/core/financeReport.js'

const studio = () => applyActions({ ...generateWorld('p11-periods'), economyEngagedEver: true }, [{ kind: 'activateStudioOperations' }])
describe('P11 recorded cash and current-pace report', () => {
  it('reconciles last completed week independently from current-week capital spending', () => {
    let state = tick(studio())
    const previousCash = state.studio.cash
    state = commitPlacement(state, { blueprintId: 'development-casting-annex', origin: {gx: 7, gy: 15} })
    const before = stableStringify(state)
    const report = financeOverview(state)
    expect(report.cash).toBe(state.studio.cash)
    expect(report.lastPeriod!.openingCash).toBe(TUNING.INITIAL_CASH)
    expect(report.lastPeriod!.closingCash).toBe(previousCash)
    expect(report.lastPeriod!.categories.some(c => c.kind === 'constructionCapex')).toBe(false)
    expect(report.currentPeriod.openingCash).toBe(previousCash)
    expect(report.currentPeriod.closingCash).toBe(state.studio.cash)
    for (const p of [report.lastPeriod!, report.currentPeriod]) {
      expect(p.complete).toBe(true)
      expect(p.openingCash! + p.categories.reduce((sum,c) => sum+c.amount,0)).toBe(p.closingCash)
    }
    expect(stableStringify(state)).toBe(before)
  })
  it('refuses invented pre-checkpoint balances and marks the first recorded week partial', () => {
    const native = studio()
    const legacy = makeSaveV10({ ...native, market: { ...native.market, tick: 20 } })
    legacy.state.studio.cash = 17_654_321 // legal pre-checkpoint cash; migration must preserve it without invented rows
    let state = migrateToV18(legacy).state
    expect(financeOverview(state).firstCompleteWeek).toBeNull()
    state = tick(state) as typeof state
    const partial = financeOverview(state)
    expect(partial.firstCompleteWeek).toBe(21)
    expect(partial.lastPeriod!.complete).toBe(false)
    expect(partial.lastPeriod!.openingCash).toBeNull()
    expect(partial.lastPeriod!.closingCash).toBeNull()
    const boundaryCash = state.studio.cash
    state = tick(state) as typeof state
    const complete = financeOverview(state).lastPeriod!
    expect(complete.complete).toBe(true)
    expect(complete.openingCash).toBe(boundaryCash)
    expect(complete.closingCash).toBe(state.studio.cash)
    expect(recordedFinancePeriod(state, 0, 21, 'old', 'Old').complete).toBe(false)
  })
  it('has no finished week at founding and publishes explicit current-pace states', () => {
    expect(financeOverview(studio()).lastPeriod).toBeNull()
    const state = studio()
    expect(financeOverview(state).runwayState).toBe('finite')
    const red = financeOverview({...state, studio:{...state.studio,cash:-100}})
    expect(red.runwayState).toBe('inRed')
    expect(red.runwayWeeks).toBeNull()
    expect(red.runwayLabel).toBe('In the red')
  })
})
