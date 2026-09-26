import type { GameState } from '../src/core/types.ts'
import { blueprintById } from '../src/core/placement.ts'
import { expectedWeeklyRunRevenue, pipelineRunRevenue } from '../src/core/economyView.ts'
import { weeklySalary } from '../src/core/employment.ts'
import { setIsUnderRepair } from '../src/core/sets.ts'
import { TUNING } from '../src/core/tuning.ts'
import { ordinaryRenewalWindow } from '../src/core/studioCalendar.ts'
import type { FinanceRoute } from './finance-route.ts'

export type FinanceUpcomingEvent = {
  id: string; kind: 'facilityCompletion' | 'facilityOpex' | 'contractRenewal' | 'contractExpiry' | 'setCompletion' | 'retirement'
  week: number; label: string; detail: string; weeklyOperatingCostChange: number | null; route: FinanceRoute | null
}
export const FINANCE_UPCOMING_LIMIT = 64

/** Only already-committed dates. No future receipt schedule crosses this boundary. */
export function financeUpcoming(state: GameState) {
  const week = state.market.tick
  const events: FinanceUpcomingEvent[] = []
  for (const placed of state.placement.facilities) {
    if (placed.status !== 'underConstruction' && placed.completesWeek !== week) continue
    const blueprint = blueprintById(placed.blueprintId)
    if (blueprint === null) throw new Error('Finance Upcoming: unknown committed facility blueprint')
    const route: FinanceRoute = { kind: 'facilityHistory', targetId: `placed-${placed.id}`, label: 'Open Facility History' }
    if (placed.status === 'underConstruction') events.push({ id: `facility-completion:${placed.projectId}`, kind: 'facilityCompletion', week: placed.completesWeek,
      label: `${blueprint.name} becomes operational`, detail: 'Already paid capital; no additional purchase charge on completion.',
      weeklyOperatingCostChange: null, route })
    if (state.founding === null) events.push({ id: `facility-opex:${placed.projectId}`, kind: 'facilityOpex', week: placed.completesWeek + 1,
      label: `${blueprint.name} first operating charge arrives`,
      detail: `First operating charge is the advance Week ${placed.completesWeek} → ${placed.completesWeek + 1}, after completion. Other costs and future decisions are not included.`,
      weeklyOperatingCostChange: blueprint.weeklyOperatingCost, route })
  }
  for (const contract of state.contracts) {
    if (contract.startWeek > week || contract.endWeekExclusive <= week) continue
    const talent = state.talent.find(t => t.id === contract.talentId)
    if (talent === undefined) throw new Error('Finance Upcoming: unknown contracted person')
    const route: FinanceRoute = { kind: 'profile', targetId: talent.id, label: 'Open Profile' }
    const renewalWeek = ordinaryRenewalWindow(state, contract)
    if (renewalWeek !== null) events.push({ id: `renewal:${talent.id}:${contract.endWeekExclusive}`, kind: 'contractRenewal',
      week: renewalWeek,
      label: `${talent.name} renewal window ${contract.endWeekExclusive - TUNING.HIRING_RENEWAL_WINDOW_WEEKS <= week ? 'is open' : 'opens'}`, detail: 'Review the current terms. Renewal is a decision, not an automatic signing debit.',
      weeklyOperatingCostChange: null, route })
    events.push({ id: `expiry:${talent.id}:${contract.endWeekExclusive}`, kind: 'contractExpiry', week: contract.endWeekExclusive,
      label: `${talent.name} current contract expires`,
      detail: `If not renewed, current weekly salary of $${weeklySalary(contract.annualSalary).toLocaleString('en-US')} ends on arrival in Week ${contract.endWeekExclusive}. No replacement contract is assumed.`,
      weeklyOperatingCostChange: null, route })
  }
  for (const set of state.sets) {
    if (set.status !== 'under-construction' || set.completesWeek === null) continue
    events.push({ id: `set-completion:${set.id}:${set.completesWeek}`, kind: 'setCompletion', week: set.completesWeek,
      label: `${set.name} ${setIsUnderRepair(set) ? 'repair completes' : 'becomes standing'}`, detail: `${set.completesWeek < week ? 'The retained completion date is overdue; no replacement date is invented. ' : ''}Completion of already-started Set work. Its committed cost has already been paid; this is not a new recurring charge.`,
      weeklyOperatingCostChange: null, route: null })
  }
  for (const record of state.careerLifecycle?.records ?? []) {
    if (record.status === 'retired') continue
    const name = state.talent.find(t => t.id === record.personId)!.name
    events.push({ id: `retirement:${record.personId}`, kind: 'retirement', week: record.effectiveWeek,
      label: `${name} · ${record.status === 'finishing_commitments' ? 'Finishing commitments before retirement' : 'Retirement boundary'}`,
      detail: `Retirement from ${record.profession}, announced Week ${record.announcedWeek}. This is nonfinancial; no automatic charge. Existing obligations may finish after this boundary; final completion is not yet known.`,
      weeklyOperatingCostChange: null, route: { kind: 'profile', targetId: record.personId, label: 'Open Profile' } })
  }
  events.sort((a, b) => a.week - b.week || a.id.localeCompare(b.id))
  return { timeClass: 'knownCommitment' as const, defaultWindowWeeks: 13 as const,
    nextAdvanceStudioRevenue: state.founding === null ? expectedWeeklyRunRevenue(state) : 0,
    remainingStudioRevenue: pipelineRunRevenue(state),
    basis: 'Known commitments and public retirement boundaries. The dated list includes this week, the selected rolling window, already-open renewal windows, overdue committed Set work and finishing retirement obligations. Retirement facts are nonfinancial. Revenue totals cover already-active runs; remaining revenue has no single payment date here. Excludes new films, automatic renewals and uncommitted decisions.',
    windows: ([13, 52] as const).map(windowWeeks => {
      const fromWeek = week, toWeekInclusive = week + windowWeeks - 1
      const eligible = events.filter(e => e.week <= toWeekInclusive && (e.week >= fromWeek || e.kind === 'contractRenewal' || e.kind === 'setCompletion' || e.kind === 'retirement'))
      const remainingRows = Math.max(0, eligible.length - FINANCE_UPCOMING_LIMIT)
      return { windowWeeks, fromWeek, toWeekInclusive, rows: eligible.slice(0, FINANCE_UPCOMING_LIMIT), remainingRows,
        notice: remainingRows === 0 ? null : `${remainingRows} further dated commitments are outside this bounded list. Review Payroll, Operations and public profiles or Calendar for their exact owners.` }
    }) }
}
