import { describe, expect, it } from 'vitest'
import type { MacroRunCompact } from '../economy-truth-audit/macro.js'
import { pairedRunawayAccounting } from './runaway.js'

function row(seed: string, policy: 'P5_forecastProfitMax' | 'P6_forecastROIMax', scale: number): MacroRunCompact {
  const openingCash = 20_000_000
  const ledgerTotals = {
    studioRevenue: 100 * scale,
    production: -50 * scale,
    payroll: -10 * scale,
    overhead: -5 * scale,
  }
  const endCash = openingCash + Object.values(ledgerTotals).reduce((sum, value) => sum + value, 0)
  const slice = {
    week: 260,
    cash: endCash,
    state: 'healthy',
    filmsReleased: 10,
    audienceAwareness: 50,
    weeklyBurn: 15,
    ledgerTotals,
  }
  return {
    schemaVersion: 'economy-truth-macro-v1', seed, policy, policyKind: 'player',
    horizonWeeks: 260, openingCash, endCash, minCash: openingCash, maxCash: endCash,
    filmsReleased: 10, filmsGreenlit: 10, foundingHires: 7, engagedWeekFraction: 1,
    reconciliationOk: true, rejectedActions: 0, unstaffableWeeks: 0,
    rosterWallHit: false, rosterWallWeek: null, distressEntryWeek: null,
    recoveryWeek: null, weeksToRecovery: null, terminalDecline: false,
    runawaySuccess: false, weeksInsolvent: 0, weeksNoProduction: 0,
    weeksBareMinOnly: 0, weeksConstrained: 0, weeksHealthy: 260,
    durableRecoveryAt26: null, durableRecoveryAt52: null, durableRecoveryAt103: null,
    publicitySpend: 0, publicityCount: 0, ledgerTotals,
    slices: { '52': { ...slice, week: 52 }, '104': { ...slice, week: 104 }, '156': { ...slice, week: 156 }, '208': { ...slice, week: 208 }, '260': slice },
    moviePortfolio: {
      completedFilms: 10, profitableFilms: 10, lossFilms: 0,
      totalCommittedCost: 50 * scale, totalStudioRevenue: 100 * scale,
      totalContribution: 50 * scale, portfolioRoi: 1, meanCommittedCost: 5 * scale,
      meanNegative: 4 * scale, meanMarketing: 1 * scale, meanLeadFame: 50,
      meanLeadOvr: 50, meanCritic: 50, genreCount: 2, genreHhi: 0.5,
      largestGenreShare: 0.5,
    },
  }
}

describe('economy diagnosis runaway reductions', () => {
  it('reconciles the paired cash delta exactly to classified ledger deltas', () => {
    const summary = pairedRunawayAccounting([
      row('seed-a', 'P5_forecastProfitMax', 2),
      row('seed-a', 'P6_forecastROIMax', 1),
      row('seed-b', 'P5_forecastProfitMax', 3),
      row('seed-b', 'P6_forecastROIMax', 1),
    ])
    expect(summary.pairs).toBe(2)
    expect(summary.maxAbsoluteReconciliationResidual).toBe(0)
    expect(summary.unclassifiedLedgerDelta.max).toBe(0)
  })
})
