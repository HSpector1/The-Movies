import type { GameState } from '../src/core/types.ts'
import { financeOverview } from '../src/core/financeReport.ts'
import { guaranteedComp } from '../src/core/employment.ts'

/** The owning action supplies a discarded successor. Finance never commits it. */
export function financialConsequence(before: GameState, after: GameState, later?: { state: GameState; beginsWeek: number; label: string }) {
  const current = financeOverview(before)
  const next = financeOverview(after)
  const future = later === undefined ? null : financeOverview(later.state)
  const guarantees = (s: GameState) => s.contracts.reduce((sum,c)=>sum+guaranteedComp(c,s.market.tick),0)
  return {
    cashBefore: before.studio.cash, immediateCashChange: after.studio.cash-before.studio.cash, cashAfter: after.studio.cash,
    weeklyOperatingCostBefore: current.weeklyOperatingCost, weeklyOperatingCostAfter: next.weeklyOperatingCost,
    weeklyPayrollChange: next.weeklyPayroll-current.weeklyPayroll,
    netWeeklyCashflowBefore: current.netWeeklyCashflow, netWeeklyCashflowAfter: next.netWeeklyCashflow,
    runwayAfter: next.runwayLabel, guaranteesBefore: guarantees(before), guaranteesAfter: guarantees(after),
    currentBasis: `After committing now; next advance Week ${before.market.tick} → ${before.market.tick+1}. Current contracts, operational facilities and already-active theatrical receipts only.`,
    laterBeginsWeek: later?.beginsWeek ?? null,
    laterOperatingCost: future?.weeklyOperatingCost ?? null, laterNetWeeklyCashflow: future?.netWeeklyCashflow ?? null,
    laterRunway: future?.runwayLabel ?? null,
    laterBasis: later === undefined ? null : `${later.label} Conditional comparison at today's pace, holding other costs, receipts and post-purchase cash fixed. This is not a forecast of cash on that future date.`,
    exclusions: 'Guarantees are future payroll, not a second debit. Excludes future decisions, unreleased-film revenue and unmodeled Builder employment costs.',
  }
}
