import { describe, expect, it } from 'vitest'
import type { MacroRunCompact, MacroSlice } from '../economy-truth-audit/macro.js'
import {
  MEASURED_C1_ESTATE_CAPEX,
  RICH_CASH_THRESHOLD,
  SHADOW_INTERVENTIONS,
  applyShadowIntervention,
} from './shadow.js'

function slice(week: number, cash: number, ledgerTotals: Record<string, number>): MacroSlice {
  return {
    week,
    cash,
    state: 'healthy',
    filmsReleased: week / 13,
    audienceAwareness: 50,
    weeklyBurn: 100,
    ledgerTotals,
  }
}

function fixture(cashes: readonly number[]): MacroRunCompact {
  const weeks = [52, 104, 156, 208, 260]
  const slices = Object.fromEntries(
    weeks.map((week, index) => [
      String(week),
      slice(week, cashes[index]!, {
        studioRevenue: (index + 1) * 20_000_000,
        production: -(index + 1) * 10_000_000,
        payroll: -(index + 1) * 1_000_000,
        overhead: -(index + 1) * 500_000,
      }),
    ]),
  )
  return {
    schemaVersion: 'economy-truth-macro-v1',
    seed: 'shadow-fixture',
    policy: 'fixture',
    policyKind: 'player',
    horizonWeeks: 260,
    openingCash: 20_000_000,
    endCash: cashes[4]!,
    minCash: Math.min(20_000_000, ...cashes),
    maxCash: Math.max(20_000_000, ...cashes),
    filmsReleased: 20,
    filmsGreenlit: 20,
    foundingHires: 7,
    engagedWeekFraction: 1,
    reconciliationOk: true,
    rejectedActions: 0,
    unstaffableWeeks: 0,
    rosterWallHit: false,
    rosterWallWeek: null,
    distressEntryWeek: null,
    recoveryWeek: null,
    weeksToRecovery: null,
    terminalDecline: false,
    runawaySuccess: true,
    weeksInsolvent: 0,
    weeksNoProduction: 0,
    weeksBareMinOnly: 0,
    weeksConstrained: 0,
    weeksHealthy: 260,
    durableRecoveryAt26: null,
    durableRecoveryAt52: null,
    durableRecoveryAt103: null,
    publicitySpend: 0,
    publicityCount: 0,
    ledgerTotals: slices['260']!.ledgerTotals,
    slices,
    moviePortfolio: {
      completedFilms: 20,
      profitableFilms: 20,
      lossFilms: 0,
      totalCommittedCost: 50_000_000,
      totalStudioRevenue: 100_000_000,
      totalContribution: 50_000_000,
      portfolioRoi: 1,
      meanCommittedCost: 2_500_000,
      meanNegative: 2_000_000,
      meanMarketing: 500_000,
      meanLeadFame: 50,
      meanLeadOvr: 50,
      meanCritic: 50,
      genreCount: 2,
      genreHhi: 0.5,
      largestGenreShare: 0.5,
    },
  }
}

function intervention(id: (typeof SHADOW_INTERVENTIONS)[number]['id']) {
  return SHADOW_INTERVENTIONS.find((candidate) => candidate.id === id)!
}

describe('economy diagnosis shadow interventions', () => {
  it('neutral replay preserves every sampled cash value exactly', () => {
    const row = fixture([30e6, 40e6, 50e6, 55e6, 58e6])
    const result = applyShadowIntervention(row, intervention('neutral'))
    expect(result.totalCharge).toBe(0)
    expect(result.shadowEndCash).toBe(row.endCash)
    expect(result.samples.map((sample) => sample.shadowCash)).toEqual(
      [30e6, 40e6, 50e6, 55e6, 58e6],
    )
  })

  it('rich-only arms are exact no-ops when the threshold is never crossed', () => {
    const row = fixture([30e6, 40e6, 50e6, 55e6, 58e6])
    for (const id of [
      'measured-capital-envelope',
      'rich-payroll-overhead-match',
      'rich-positive-margin-share-25',
      'rich-positive-margin-share-50',
      'rich-cash-stock-charge-25',
      'rich-cash-stock-charge-50',
    ] as const) {
      const result = applyShadowIntervention(row, intervention(id))
      expect(result.totalCharge).toBe(0)
      expect(result.shadowEndCash).toBe(row.endCash)
    }
  })

  it('the measured capital envelope is charged once after threshold crossing', () => {
    const row = fixture([30e6, 40e6, 65e6, 80e6, 90e6])
    const result = applyShadowIntervention(
      row,
      intervention('measured-capital-envelope'),
    )
    expect(result.totalCharge).toBe(MEASURED_C1_ESTATE_CAPEX)
    expect(result.shadowEndCash).toBe(row.endCash - MEASURED_C1_ESTATE_CAPEX)
  })

  it('stock pressure charges only the excess above the established threshold', () => {
    const row = fixture([30e6, 40e6, 70e6, 70e6, 70e6])
    const result = applyShadowIntervention(
      row,
      intervention('rich-cash-stock-charge-50'),
    )
    const crossing = result.samples[2]!
    expect(crossing.shadowCashBeforeCharge).toBe(70e6)
    expect(crossing.charge).toBe((70e6 - RICH_CASH_THRESHOLD) * 0.5)
  })
})
