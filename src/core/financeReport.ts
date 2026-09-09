/** P11 read model. Observations only; ledger/checkpoint are the sole cash history. */
import type { GameState, LedgerEntry, LedgerKind } from './types.js'
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
export const FINANCE_TIME_CLASSES = {
  recordedCash: 'Recorded cash movements in the named ledger weeks',
  currentRecurringCost: 'Recurring costs charged by the next advance from current state',
  knownCommitment: 'Scheduled effects of commitments already made',
  currentPaceEstimate: 'Conditional estimate at current pace; not a forecast',
} as const
export type FinanceTimeClass = keyof typeof FINANCE_TIME_CLASSES
export const FINANCE_CAPITAL_CONTRIBUTOR_LIMIT = 20
export type FinanceCapitalContributor = {
  ledgerIndex: number; week: number; amount: number; constructionProjectId: string; name: string;
  placementId: number | null; facilityId: string | null; buildingId: string | null;
  historyEventId: number | null; identityBasis: string;
}
export type FinanceCapitalContributors = {
  rows: FinanceCapitalContributor[]; totalEntries: number; displayedAmount: number;
  remainingEntries: number; remainingAmount: number; recordedAmount: number; notice: string | null;
}
export type FinancePeriod = {
  id: string; label: string; fromWeek: number; toWeekInclusive: number; complete: boolean;
  timeClass: 'recordedCash'; coverage: 'complete' | 'partial' | 'unavailable';
  notice: string | null; openingCash: number | null; closingCash: number | null;
  netCash: number; categories: FinanceCategory[]; capitalContributors: FinanceCapitalContributors;
}
export type FinanceCostPoint = {
  week: number; amount: number | null; coverage: FinancePeriod['coverage']; notice: string | null;
}
export type FinanceCostSeries = {
  kind: LedgerKind; label: string; periodAmount: number | null; points: FinanceCostPoint[];
}
export type FinanceHistoryWindow = {
  windowWeeks: 13 | 52; label: string; period: FinancePeriod | null; points: FinancePeriod[]; costSeries: FinanceCostSeries[];
}
export type FinanceHistory = {
  defaultWindowWeeks: 13; windows: FinanceHistoryWindow[]; calendarNotice: string;
}
export type FinanceRecordedEntry = {
  ledgerIndex: number; week: number; kind: LedgerKind; categoryLabel: string; amount: number;
  note: string; talentId: string | null; productionId: string | null; constructionProjectId: string | null;
  provenance: string;
}
export type FinanceRecordedEntries = {
  timeClass: 'recordedCash'; fromWeek: number; toWeekInclusive: number;
  totalEntries: number; offset: number; hasMore: boolean; rows: FinanceRecordedEntry[];
}

export function financeRecordingBoundary(state: GameState): { firstCompleteWeek: number | null; notice: string | null } {
  // A V10 cash balance can reconcile to the retained ledger and therefore migrate
  // WITHOUT a CashLedgerCheckpoint. That is not proof of complete old history.
  // P08 provenance only RESTRICTS coverage here; its rows never supply cash amounts.
  // A migration may occur midway through its current week, so that week is partial.
  const historyStart = state.studioHistory.recordingStartedWeek
  const firstHistoryComplete = historyStart === 0 ? 0 : historyStart + 1
  const checkpoint = state.cashLedgerCheckpoint
  if (checkpoint === undefined && historyStart === 0) return { firstCompleteWeek: 0, notice: null }
  const first = checkpoint === undefined ? undefined : state.ledger[checkpoint.ledgerLength]
  const firstCompleteWeek = checkpoint === undefined ? firstHistoryComplete
    : first === undefined ? null : Math.max(firstHistoryComplete, first.week + 1)
  return {
    firstCompleteWeek,
    notice: firstCompleteWeek === null
      ? 'Earlier cash movements were not recorded. No complete recorded week is available yet.'
      : `Earlier cash movements were not recorded. Week ${firstCompleteWeek - 1} may be partial; complete weekly coverage begins Week ${firstCompleteWeek}.`,
  }
}

function finishPeriod(state: GameState, fromWeek: number, toWeekInclusive: number, id: string, label: string,
  opening: number, closing: number, netCash: number, byKind: Map<LedgerKind, FinanceCategory>,
  capital: FinanceCapitalContributors): FinancePeriod {
  const boundary = financeRecordingBoundary(state)
  const validRange = Number.isInteger(fromWeek) && Number.isInteger(toWeekInclusive)
    && fromWeek >= 0 && fromWeek <= toWeekInclusive
  const complete = validRange && boundary.firstCompleteWeek !== null && fromWeek >= boundary.firstCompleteWeek
    && toWeekInclusive <= state.market.tick
  const hasCoveredWeek = validRange && boundary.firstCompleteWeek !== null
    && Math.max(fromWeek, boundary.firstCompleteWeek) <= Math.min(toWeekInclusive, state.market.tick)
  const coverage = complete ? 'complete' : byKind.size > 0 || hasCoveredWeek ? 'partial' : 'unavailable'
  const notice = complete ? null : !validRange ? 'No completed week is available in this range.'
    : toWeekInclusive > state.market.tick ? 'This range includes weeks not yet recorded.'
      : `${boundary.notice ?? 'This period is not yet recorded.'} Amounts shown are retained movements only; opening and closing Cash are not available for the whole period.`
  return { id, label, fromWeek, toWeekInclusive, complete, timeClass: 'recordedCash', coverage, notice,
    openingCash: complete ? opening : null, closingCash: complete ? closing : null,
    netCash, capitalContributors: { ...capital, notice: [
      ...(!complete ? ['Retained facility capital payments only; this period does not have complete recording coverage.'] : []),
      ...(capital.remainingEntries > 0 ? [`Showing ${capital.rows.length} of ${capital.totalEntries} recorded payments. The remaining ${capital.remainingEntries} payments are included in the remainder amount.`] : []),
    ].join(' ') || null },
    categories: Object.keys(FINANCE_CATEGORIES).flatMap(k => {
      const value = byKind.get(k as LedgerKind)
      return value === undefined ? [] : [{ ...value }]
    }),
  }
}

/** Identity joins never supply money. Missing historical correlations stay missing. */
function capitalIdentities(state: GameState) {
  const committed = new Map(state.studioHistory.rows.flatMap(row =>
    row.kind === 'facilityCommitted' ? [[row.placementId, row] as const] : []))
  return new Map(state.placement.facilities.map(placed => {
    const row = committed.get(placed.id)
    const history = row?.facilityId === placed.facilityId && row.week === placed.placedWeek ? row : null
    return [placed.projectId, { placed, history }] as const
  }))
}

function emptyCapitalContributors(): FinanceCapitalContributors {
  return { rows: [], totalEntries: 0, displayedAmount: 0, remainingEntries: 0,
    remainingAmount: 0, recordedAmount: 0, notice: null }
}

function addCapitalContributor(capital: FinanceCapitalContributors, entry: LedgerEntry, ledgerIndex: number,
  identities: ReturnType<typeof capitalIdentities>, limit: number): void {
  if (entry.kind !== 'constructionCapex') return
  capital.totalEntries++
  capital.recordedAmount += entry.amount
  if (capital.rows.length >= limit) {
    capital.remainingEntries++
    capital.remainingAmount += entry.amount
    return
  }
  const identity = identities.get(entry.constructionProjectId)
  // Exact matching commit week protects the link as well as the retained IDs.
  const history = identity?.history?.week === entry.week ? identity.history : null
  capital.displayedAmount += entry.amount
  capital.rows.push({ ledgerIndex, week: entry.week, amount: entry.amount,
    constructionProjectId: entry.constructionProjectId, name: history?.name ?? entry.note,
    placementId: identity?.placed.id ?? null, facilityId: identity?.placed.facilityId ?? null,
    buildingId: identity === undefined ? null : `placed-${identity.placed.id}`,
    historyEventId: history?.eventId ?? null,
    identityBasis: history !== null ? 'Name and exact construction event from recorded Studio History; amount and week from the cash ledger.'
      : identity === undefined ? 'Recorded ledger description. Exact purchase identity cannot be established from retained records; no exact History link is available.'
        : 'Recorded ledger description; site identity from the retained placement. No exact recorded construction event can be established for this payment; no exact History link is available.',
  })
}

function addCategory(byKind: Map<LedgerKind, FinanceCategory>, entry: LedgerEntry): void {
  const category = byKind.get(entry.kind) ?? { kind: entry.kind, label: FINANCE_CATEGORIES[entry.kind], amount: 0, entryCount: 0 }
  category.amount += entry.amount
  category.entryCount++
  byKind.set(entry.kind, category)
}

export function recordedFinancePeriod(state: GameState, fromWeek: number, toWeekInclusive: number, id: string, label: string,
  contributorLimit = FINANCE_CAPITAL_CONTRIBUTOR_LIMIT): FinancePeriod {
  const checkpoint = state.cashLedgerCheckpoint
  let opening = checkpoint?.cash ?? TUNING.INITIAL_CASH
  let closing = opening
  let netCash = 0
  const byKind = new Map<LedgerKind, FinanceCategory>()
  const capital = emptyCapitalContributors()
  const identities = capitalIdentities(state)
  const limit = Number.isInteger(contributorLimit) && contributorLimit >= 0
    ? Math.min(contributorLimit, FINANCE_CAPITAL_CONTRIBUTOR_LIMIT) : FINANCE_CAPITAL_CONTRIBUTOR_LIMIT
  // An ordered suffix is authoritative. Never reconstruct pre-checkpoint rows.
  for (let i = checkpoint?.ledgerLength ?? 0; i < state.ledger.length; i++) {
    const entry = state.ledger[i]!
    if (entry.week < fromWeek) opening += entry.amount
    // Match the engine's ordered floating-point additions. Regrouping as
    // opening + sum(movements) can change the literal closing Cash by one ULP.
    if (entry.week <= toWeekInclusive) closing += entry.amount
    if (entry.week < fromWeek || entry.week > toWeekInclusive) continue
    netCash += entry.amount
    addCategory(byKind, entry)
    addCapitalContributor(capital, entry, i, identities, limit)
  }
  return finishPeriod(state, fromWeek, toWeekInclusive, id, label, opening, closing, netCash, byKind, capital)
}

/** One pass over the retained ledger, then at most 52 exact weekly points. */
export function financeHistory(state: GameState): FinanceHistory {
  const lastWeek = state.market.tick - 1
  const firstWeek = Math.max(0, state.market.tick - 52)
  const checkpoint = state.cashLedgerCheckpoint
  const identities = capitalIdentities(state)
  let opening = checkpoint?.cash ?? TUNING.INITIAL_CASH
  const byWeek = new Map<number, { entry: LedgerEntry; ledgerIndex: number }[]>()
  for (let i = checkpoint?.ledgerLength ?? 0; i < state.ledger.length; i++) {
    const entry = state.ledger[i]!
    if (entry.week < firstWeek) opening += entry.amount
    else if (entry.week <= lastWeek) {
      const entries = byWeek.get(entry.week) ?? []
      entries.push({ entry, ledgerIndex: i })
      byWeek.set(entry.week, entries)
    }
  }
  const windows = ([13, 52] as const).map((windowWeeks): FinanceHistoryWindow => {
    const fromWeek = Math.max(0, state.market.tick - windowWeeks)
    const categories = new Map<LedgerKind, FinanceCategory>()
    const capital = emptyCapitalContributors()
    const points: FinancePeriod[] = []
    let cash = opening
    let windowOpening = opening
    let windowNet = 0
    for (let week = firstWeek; week <= lastWeek; week++) {
      const weekOpening = cash
      const weekCategories = new Map<LedgerKind, FinanceCategory>()
      const weekCapital = emptyCapitalContributors()
      let weekNet = 0
      for (const { entry, ledgerIndex } of byWeek.get(week) ?? []) {
        cash += entry.amount
        if (week < fromWeek) continue
        weekNet += entry.amount
        windowNet += entry.amount
        addCategory(weekCategories, entry)
        addCategory(categories, entry)
        addCapitalContributor(weekCapital, entry, ledgerIndex, identities, FINANCE_CAPITAL_CONTRIBUTOR_LIMIT)
        addCapitalContributor(capital, entry, ledgerIndex, identities, FINANCE_CAPITAL_CONTRIBUTOR_LIMIT)
      }
      if (week < fromWeek) { windowOpening = cash; continue }
      points.push(finishPeriod(state, week, week, `week-${week}`, `Week ${week} · completed`,
        weekOpening, cash, weekNet, weekCategories, weekCapital))
    }
    const label = points.length === 0 ? 'No completed weeks yet'
      : points.length < windowWeeks ? `${points.length} of ${windowWeeks} completed weeks available`
        : `Last ${windowWeeks} completed weeks`
    const period = points.length === 0 ? null : finishPeriod(state, fromWeek, lastWeek, `last${windowWeeks}Weeks`, label,
      windowOpening, cash, windowNet, categories, capital)
    const costSeries = (Object.keys(FINANCE_CATEGORIES) as LedgerKind[])
      .filter(kind => kind !== 'studioRevenue' && kind !== 'boxOffice')
      .map((kind): FinanceCostSeries => ({ kind, label: FINANCE_CATEGORIES[kind],
        periodAmount: period?.categories.find(c => c.kind === kind)?.amount ?? (period?.complete ? 0 : null),
        points: points.map(point => ({ week: point.fromWeek,
          amount: point.categories.find(c => c.kind === kind)?.amount ?? (point.complete ? 0 : null),
          coverage: point.coverage, notice: point.notice })),
      }))
    return { windowWeeks, label, period, points, costSeries }
  })
  return { defaultWindowWeeks: 13, windows,
    calendarNotice: 'History uses recorded weeks. Calendar years and eras are not available from the current history.' }
}

/** Exact row identities and source notes, paged without interpreting names or notes as IDs. */
export function recordedFinanceEntries(state: GameState, fromWeek: number, toWeekInclusive: number,
  offset = 0, limit = 50, kind?: LedgerKind): FinanceRecordedEntries {
  const safeOffset = Number.isInteger(offset) && offset >= 0 ? offset : 0
  const safeLimit = Number.isInteger(limit) && limit > 0 ? Math.min(limit, 100) : 50
  const rows: FinanceRecordedEntry[] = []
  let totalEntries = 0
  for (let i = state.cashLedgerCheckpoint?.ledgerLength ?? 0; i < state.ledger.length; i++) {
    const entry = state.ledger[i]!
    if (entry.week < fromWeek || entry.week > toWeekInclusive || (kind !== undefined && entry.kind !== kind)) continue
    if (totalEntries >= safeOffset && rows.length < safeLimit) rows.push({
      ledgerIndex: i, week: entry.week, kind: entry.kind, categoryLabel: FINANCE_CATEGORIES[entry.kind],
      amount: entry.amount, note: entry.note, talentId: entry.talentId ?? null,
      productionId: entry.productionId ?? null, constructionProjectId: entry.constructionProjectId ?? null,
      provenance: 'Recorded cash ledger',
    })
    totalEntries++
  }
  return { timeClass: 'recordedCash', fromWeek, toWeekInclusive, totalEntries, offset: safeOffset,
    hasMore: safeOffset + rows.length < totalEntries, rows }
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
    weeklyCostTimeClass: 'currentRecurringCost' as const, scheduledRevenueTimeClass: 'knownCommitment' as const,
    paceTimeClass: 'currentPaceEstimate' as const,
    firstCompleteWeek: boundary.firstCompleteWeek, coverageNotice: boundary.notice,
    lastPeriod, currentPeriod,
  }
}
