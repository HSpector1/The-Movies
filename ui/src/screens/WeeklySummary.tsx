// ── Weekly / period summary (D-12.18) ─────────────────────────────────────────
// Shown when "Sim to next event" stops on a non-release event. Reports the aggregate
// cash movement over the weeks it advanced (from periodSummary — the real ledger) and
// WHY it stopped. Releases are the exception: they route to the newspaper reveal (their
// own summary), never here. Pure display over a SimResult; no simulation logic.

import type {
  ConstructionCompletionSummary,
  PeriodSummary,
  SimStopReason,
} from '../engine/adapter.ts'
import { money } from '../format.ts'
import { Metric } from '../components/common.tsx'
import { ConstructionCompletionNotice } from '../components/ConstructionCompletionNotice.tsx'

export function WeeklySummary({
  summary,
  stopReason,
  stopMessage,
  weeks,
  cashNow,
  constructionCompletion,
  onContinue,
}: {
  summary: PeriodSummary
  stopReason: SimStopReason
  // D-12 P1.3: the engine-derived stop explanation (e.g. "Stopped at Week 14: … completed their theatrical
  // runs."). Displayed verbatim — React never re-derives the reason from the resulting state.
  stopMessage: string
  weeks: number
  cashNow: number
  constructionCompletion?: ConstructionCompletionSummary | null
  onContinue: () => void
}) {
  const alert = stopReason === 'cashNegative' || stopReason === 'limit'
  return (
    <div className="app-shell">
      <div className="topbar">
        <div className="brand">
          <span className="mark">PROJECT: STUDIO</span>
          <span className="sub">weekly summary</span>
        </div>
      </div>

      <div className="card" data-testid="period-summary">
        <h2>
          {weeks === 1 ? 'Week' : `Weeks ${summary.fromWeek} – ${summary.toWeekInclusive}`} ·{' '}
          {weeks} {weeks === 1 ? 'week' : 'weeks'} advanced
        </h2>
        <p className="hint" data-testid="stop-reason" style={alert ? { color: 'var(--neg)' } : undefined}>
          {stopMessage}
        </p>

        <div className="row" style={{ gap: 24, flexWrap: 'wrap', marginTop: 8 }}>
          <Metric label="Studio Revenue" small testid="sum-studio-revenue">
            <span className="money pos">{money(summary.studioRevenue)}</span>
          </Metric>
          <Metric label="Payroll" small testid="sum-payroll">
            <span className="money neg">{money(summary.payroll)}</span>
          </Metric>
          <Metric label="Overhead" small testid="sum-overhead">
            <span className="money neg">{money(summary.overhead)}</span>
          </Metric>
          <Metric label="Production spend" small testid="sum-production">
            <span className="money neg">{money(summary.production)}</span>
          </Metric>
          <Metric label="Publicity" small testid="sum-publicity">
            <span className="money neg">{money(summary.publicity)}</span>
          </Metric>
          <Metric label="Studio construction" small testid="sum-construction">
            <span className="money neg">{money(summary.construction)}</span>
          </Metric>
          <Metric label="Net this period" small testid="sum-net">
            <span className={summary.netCash < 0 ? 'money neg' : 'money pos'}>
              {summary.netCash >= 0 ? '+' : ''}
              {money(summary.netCash)}
            </span>
          </Metric>
        </div>

        <div className="row" style={{ gap: 24, flexWrap: 'wrap', marginTop: 12 }}>
          <Metric label="Releases" small testid="sum-releases">
            {summary.releases}
          </Metric>
          <Metric label="Runs completed" small testid="sum-completed-runs">
            {summary.completedRuns}
          </Metric>
          <Metric label="Cash now" small testid="sum-cash-now">
            <span className={cashNow < 0 ? 'money neg' : 'money pos'}>{money(cashNow)}</span>
          </Metric>
        </div>

        <div className="sep" />
        <div className="btn-row">
          <button className="primary" onClick={onContinue} data-testid="period-continue">
            Continue
          </button>
        </div>
      </div>
      {constructionCompletion && (
        <ConstructionCompletionNotice completion={constructionCompletion} />
      )}
    </div>
  )
}
