/** P11 read model. Observations only; ledger/checkpoint are the sole cash history. */
import type { GameState, LedgerKind } from './types.js'
import { TUNING } from './tuning.js'
import { financeView } from './economyView.js'

export const FINANCE_CATEGORIES: Record<LedgerKind, string> = {
  studioRevenue: 'Studio Revenue received', boxOffice: 'Legacy box-office receipt',
  payroll: 'Payroll', overhead: 'Ordinary studio overhead', facilityOpex: 'Facility operating costs',
  production: 'Film production and marketing commitments', freelancerFee: 'Film freelancer fees',
  constructionCapex: 'Facility capital spending', facilityDemolitionRefund: 'Facility capital recovered',
  setCapex: 'Set capital spending', setDemolitionRefund: 'Set capital recovered',
  setMaintenance: 'One-time Set repairs', signingBonus: 'Signing and renewal bonuses',
  termination: 'Termination payments', publicity: 'Publicity',
}
export type FinanceCategory = { kind: LedgerKind; label: string; amount: number; entryCount: number }
export type FinancePeriod = {
  id: string; label: string; fromWeek: number; toWeekInclusive: number; complete: boolean;
  notice: string | null; openingCash: number | null; closingCash: number | null;
  netCash: number; categories: FinanceCategory[];
}

export function financeRecordingBoundary(state: GameState): { firstCompleteWeek: number | null; notice: string | null } {
  if (state.cashLedgerCheckpoint === undefined) return { firstCompleteWeek: 0, notice: null }
  const first = state.ledger[state.cashLedgerCheckpoint.ledgerLength]
  return {
    firstCompleteWeek: first === undefined ? null : first.week + 1,
    notice: first === undefined
      ? 'Earlier cash movements were not recorded. No complete recorded week is available yet.'
      : `Earlier cash movements were not recorded. Week ${first.week} may be partial; complete weekly coverage begins Week ${first.week + 1}.`,
  }
}

export function recordedFinancePeriod(state: GameState, fromWeek: number, toWeekInclusive: number, id: string, label: string): FinancePeriod {
  const boundary = financeRecordingBoundary(state)
  const complete = boundary.firstCompleteWeek !== null && fromWeek >= boundary.firstCompleteWeek
    && fromWeek <= toWeekInclusive && toWeekInclusive <= state.market.tick
  const checkpoint = state.cashLedgerCheckpoint
  let opening = checkpoint?.cash ?? TUNING.INITIAL_CASH
  let netCash = 0
  const byKind = new Map<LedgerKind, FinanceCategory>()
  // An ordered suffix is authoritative. Never reconstruct pre-checkpoint rows.
  for (let i = checkpoint?.ledgerLength ?? 0; i < state.ledger.length; i++) {
    const entry = state.ledger[i]!
    if (entry.week < fromWeek) opening += entry.amount
    if (entry.week < fromWeek || entry.week > toWeekInclusive) continue
    netCash += entry.amount
    const category = byKind.get(entry.kind) ?? { kind: entry.kind, label: FINANCE_CATEGORIES[entry.kind], amount: 0, entryCount: 0 }
    category.amount += entry.amount
    category.entryCount++
    byKind.set(entry.kind, category)
  }
  return { id, label, fromWeek, toWeekInclusive, complete,
    notice: complete ? null : boundary.notice ?? 'This period is not yet recorded.',
    openingCash: complete ? opening : null, closingCash: complete ? opening + netCash : null,
    netCash, categories: Object.keys(FINANCE_CATEGORIES).flatMap(k => {
      const value = byKind.get(k as LedgerKind)
      return value === undefined ? [] : [value]
    }),
  }
}

export function financeOverview(state: GameState) {
  const view = financeView(state)
  const week = state.market.tick
  const boundary = financeRecordingBoundary(state)
  const lastPeriod = week === 0 ? null : recordedFinancePeriod(state, week - 1, week - 1, 'lastWeek', `Week ${week - 1} · completed`)
  const currentPeriod = recordedFinancePeriod(state, week, week, 'currentWeek', `Week ${week} · so far`)
  // Preserve the established epsilon and runway arithmetic; state/copy are authored here.
  const runwayState: 'inRed' | 'positive' | 'steady' | 'finite' | 'unavailable' = state.founding !== null ? 'unavailable'
    : view.cash <= 0 ? 'inRed' : Math.abs(view.netWeeklyCash) <= 1e-9 ? 'steady'
      : view.runway.infinite ? 'positive' : 'finite'
  const runwayLabel = runwayState === 'inRed' ? 'In the red'
    : runwayState === 'positive' ? 'Cashflow positive at current pace'
      : runwayState === 'steady' ? 'Cashflow steady at current pace'
        : runwayState === 'unavailable' ? 'Not available during founding'
          : `Approx. ${view.runway.weeks} weeks at current pace`
  return {
    asOfWeek: week, cash: view.cash,
    weeklyPayroll: state.founding === null ? view.weeklyPayroll : 0,
    weeklyOverhead: view.weeklyOverhead, weeklyFacilityOperatingCost: view.weeklyFacilityOperatingCost,
    weeklyOperatingCost: view.weeklyBurn, nextScheduledStudioRevenue: view.expectedWeeklyRunRevenue,
    netWeeklyCashflow: view.netWeeklyCash, runwayState, runwayLabel,
    runwayWeeks: runwayState === 'finite' ? view.runway.weeks : null,
    paceBasis: `Next advance, Week ${week} → ${week + 1}: current contracts, operational property and already-active theatrical runs. Excludes new decisions and films not yet released; receipts can change each week.`,
    firstCompleteWeek: boundary.firstCompleteWeek, coverageNotice: boundary.notice,
    lastPeriod, currentPeriod,
  }
}
