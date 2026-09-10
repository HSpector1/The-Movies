import {migrateToCurrentControl} from './_historicalCurrent.js'
import { describe, expect, it } from 'vitest'
import { applyActions, beginFounding, commitPlacement, FOUNDING_MINIMUMS, generateWorld, tick, stableStringify, makeSaveV10, TUNING } from '../src/core/index.js'
import type { CastSlot, CreativeRole, GameState } from '../src/core/index.js'
import { financeHistory, financeOverview, recordedFinanceEntries, recordedFinancePeriod } from '../src/core/financeReport.js'

const studio = () => applyActions({ ...generateWorld('p11-periods'), economyEngagedEver: true }, [{ kind: 'activateStudioOperations' }])

function realFilmJourney(): GameState[] {
  let state = beginFounding(generateWorld('p11-fractional-receipts'))
  const applicants = state.founding!.applicantIds.map(id => state.talent.find(t => t.id === id)!)
  for (const role of ['actor', 'director', 'writer', 'craft'] as const) {
    for (const talent of applicants.filter(t => t.role === role).slice(0, FOUNDING_MINIMUMS[role])) {
      state = applyActions(state, [{ kind: 'signContract', talentId: talent.id, termWeeks: 156 }])
    }
  }
  state = applyActions(state, [{ kind: 'foundStudio' }])
  const roster = (role: CreativeRole) => state.contracts.map(c => state.talent.find(t => t.id === c.talentId)!).filter(t => t.role === role)
  const actors = roster('actor')
  const concept = state.concepts[0]!
  state = applyActions(state, [{ kind: 'greenlight', production: {
    conceptId: concept.id, shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' },
    promise: { genre: concept.genre, intendedSegments: ['adult'], ranges: { intimacy: [-0.5, 0.5], tonalWeight: [-0.5, 0.5], kineticEnergy: [-0.5, 0.5] } },
    writerId: roster('writer')[0]!.id, directorId: roster('director')[0]!.id,
    cast: { lead: actors[0]!.id, antagonist: actors[1]!.id, support: actors[2]!.id } as Record<CastSlot, string>,
    craftIds: [roster('craft')[0]!.id], budget: { negative: concept.baseNegativeCost, marketing: 100_000 },
  } }])
  const states = [state]
  for (let i = 0; i < 40; i++) {
    const ready = state.studio.activeProductions.filter(p => p.remainingTicks === 1)
    state = applyActions(state, ready.map(p => ({ kind: 'commitPictureToRelease' as const, productionId: p.id })))
    state = tick(state)
    states.push(state)
  }
  expect(state.studio.releasedFilms).toHaveLength(1)
  return states
}

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
    let state = migrateToCurrentControl(legacy).state
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
  it('does not infer old complete weeks from the absence of a cash checkpoint', () => {
    const native = studio()
    const legacy = makeSaveV10({ ...native, market: { ...native.market, tick: 20 } })
    let state = migrateToCurrentControl(legacy).state
    expect(state.cashLedgerCheckpoint).toBeUndefined() // reconciled old cash does not imply recorded history
    expect(state.studioHistory.recordingStartedWeek).toBe(20)
    expect(financeOverview(state).firstCompleteWeek).toBe(21)
    const unrecorded = recordedFinancePeriod(state, 0, 19, 'old', 'Old')
    expect(unrecorded).toMatchObject({ complete: false, coverage: 'unavailable', openingCash: null, closingCash: null })
    expect(unrecorded.notice).toContain('Earlier cash movements were not recorded')
    state = tick(state) as typeof state
    expect(financeOverview(state).lastPeriod).toMatchObject({ fromWeek: 20, complete: false, coverage: 'partial' })
    const boundaryCash = state.studio.cash
    state = tick(state) as typeof state
    expect(financeOverview(state).lastPeriod).toMatchObject({ fromWeek: 21, complete: true, openingCash: boundaryCash, closingCash: state.studio.cash })
    const windows = financeHistory(state).windows
    expect(windows.every(w => w.period!.complete === false && w.period!.openingCash === null)).toBe(true)
    expect(windows[1]!.points.find(p => p.fromWeek === 19)).toMatchObject({ coverage: 'unavailable', closingCash: null })
    expect(windows[1]!.points.find(p => p.fromWeek === 20)).toMatchObject({ coverage: 'partial', closingCash: null })
    expect(windows[1]!.points.find(p => p.fromWeek === 21)).toMatchObject({ coverage: 'complete', closingCash: state.studio.cash })
  })
  it('preserves literal ordered closing Cash over real fractional film receipt intervals', () => {
    const states = realFilmJourney()
    const final = states.at(-1)!
    const before = stableStringify(final)
    expect(final.ledger.some(e => e.kind === 'studioRevenue' && !Number.isInteger(e.amount))).toBe(true)
    let regroupingWouldChangeCash = false
    for (let from = 1; from < final.market.tick; from++) {
      for (let to = from; to < final.market.tick; to++) {
        const period = recordedFinancePeriod(final, from, to, 'interval', 'Interval')
        expect(period.openingCash).toBe(states[from]!.studio.cash)
        expect(period.closingCash).toBe(states[to + 1]!.studio.cash)
        if (period.openingCash! + period.netCash !== period.closingCash) regroupingWouldChangeCash = true
        const orderedClosing = final.ledger.filter(e => e.week >= from && e.week <= to)
          .reduce((cash, entry) => cash + entry.amount, period.openingCash!)
        expect(period.closingCash).toBe(orderedClosing)
      }
    }
    expect(regroupingWouldChangeCash).toBe(true) // this fixture would catch opening + a regrouped sum
    const history = financeHistory(final)
    expect(history.defaultWindowWeeks).toBe(13)
    expect(history.windows.map(w => w.points.length)).toEqual([13, 40])
    expect(history.windows.map(w => w.label)).toEqual(['Last 13 completed weeks', '40 of 52 completed weeks available'])
    for (const window of history.windows) {
      const actual = recordedFinancePeriod(final, window.period!.fromWeek, window.period!.toWeekInclusive, window.period!.id, window.period!.label)
      expect(window.period).toEqual(actual)
      for (const point of window.points) {
        expect(point).toEqual(recordedFinancePeriod(final, point.fromWeek, point.toWeekInclusive, point.id, point.label))
        expect(point.closingCash).toBe(states[point.toWeekInclusive + 1]!.studio.cash)
      }
    }
    const entries = recordedFinanceEntries(final, 0, final.market.tick, 0, 3, 'studioRevenue')
    expect(entries.rows).toHaveLength(3)
    expect(entries.hasMore).toBe(true)
    for (const row of entries.rows) {
      expect(row.amount).toBe(final.ledger[row.ledgerIndex]!.amount)
      expect(row.productionId).toBe(final.studio.releasedFilms[0]!.productionId)
      expect(row.talentId).toBeNull()
    }
    const nextEntries = recordedFinanceEntries(final, 0, final.market.tick, 3, 3, 'studioRevenue')
    expect(nextEntries.rows[0]!.ledgerIndex).toBeGreaterThan(entries.rows.at(-1)!.ledgerIndex)
    expect(stableStringify(final)).toBe(before)
  })
  it('has no finished week at founding and publishes explicit current-pace states', () => {
    expect(financeOverview(studio()).lastPeriod).toBeNull()
    const state = studio()
    expect(financeOverview(state).runwayState).toBe('finite')
    const red = financeOverview({...state, studio:{...state.studio,cash:-100}})
    expect(red.runwayState).toBe('inRed')
    expect(red.runwayWeeks).toBeNull()
    expect(red.runwayLabel).toBe('In the red')
    const history = financeHistory(state)
    expect(history.windows.every(w => w.points.length === 0 && w.period === null)).toBe(true)
    expect(history.windows.every(w => w.label === 'No completed weeks yet')).toBe(true)
    expect(recordedFinancePeriod(state, 0, 1, 'future', 'Future')).toMatchObject({ complete: false, openingCash: null, closingCash: null })
  })
})
