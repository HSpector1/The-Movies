// ── FilmPackageSummary — four honest package dimensions, side by side ─────────
// PURE display. Every value is computed by the ENGINE (via the adapter's read-only
// assessment helpers) and passed in as props; this component reinvents no formula,
// imports no core module, and draws no randomness. It renders the four Film Package
// dimensions as clearly-separated panels: Creative Cohesion (the creative brief,
// talent-independent), Talent Fit (per-assignment, never hiding the weakest link),
// Execution Confidence (perceived-only, Work Ethic excluded by design), and the
// Commercial Outlook (a profit RANGE, with the full-box-office disclosure). Nothing
// implies guaranteed profit; a possible loss is stated plainly.

import type {
  CreativeCohesion,
  PackageFit,
  ExecutionConfidence,
  ForecastProfitRange,
} from '../engine/adapter.ts'
import { money, score, confidenceLabel } from '../format.ts'
import { Metric, Warn } from './common.tsx'

export function FilmPackageSummary({
  cohesion,
  fit,
  execution,
  profit,
}: {
  cohesion: CreativeCohesion
  fit?: PackageFit
  execution?: ExecutionConfidence
  profit?: ForecastProfitRange
}) {
  return (
    <div className="stack" data-testid="film-package-summary">
      {/* 1 ── Creative Cohesion — always shown, talent-independent ────────── */}
      <div className="panel" data-testid="pkg-cohesion">
        <div className="spread">
          <h3 style={{ margin: 0 }}>Creative Cohesion</h3>
          <Metric label="Score / tier" small testid="pkg-cohesion-score">
            {score(cohesion.score, 0)} · <span className="tag">{cohesion.tier}</span>
          </Metric>
        </div>
        <p className="hint" data-testid="pkg-cohesion-disclosure">
          Reflects the creative brief (shape, promise, audience) only — talent is assessed
          separately.
        </p>
        <p className="reason" style={{ marginTop: 8 }}>
          {cohesion.explanation}
        </p>
        <div className="grid grid-2" style={{ marginTop: 8 }}>
          <div className="stack">
            <span className="opt-title">What coheres</span>
            {cohesion.strengths.length > 0 ? (
              <div className="spread" style={{ flexWrap: 'wrap', gap: 6, justifyContent: 'flex-start' }}>
                {cohesion.strengths.map((s) => (
                  <span key={s} className="badge">
                    {s}
                  </span>
                ))}
              </div>
            ) : (
              <span className="hint">No standout aligned axes.</span>
            )}
          </div>
          <div className="stack">
            <span className="opt-title">What conflicts</span>
            {cohesion.conflicts.length > 0 ? (
              <div className="spread" style={{ flexWrap: 'wrap', gap: 6, justifyContent: 'flex-start' }}>
                {cohesion.conflicts.map((c) => (
                  <span key={c} className="tag">
                    {c}
                  </span>
                ))}
              </div>
            ) : (
              <span className="hint">No conflicting axes.</span>
            )}
          </div>
        </div>
      </div>

      {/* 2 ── Talent Fit — only once writer + director chosen ─────────────── */}
      {fit !== undefined && (
        <div className="panel" data-testid="pkg-fit">
          <div className="spread">
            <h3 style={{ margin: 0 }}>Talent Fit</h3>
            <Metric label="Overall fit" small testid="pkg-fit-overall">
              {score(fit.overall, 0)}
            </Metric>
          </div>
          <p className="hint">
            The overall is an ability-weighted mean — the weakest link is shown on its own so it
            can never be hidden inside the average.
          </p>

          {fit.severeMismatch !== undefined && (
            <div data-testid="pkg-fit-severe" style={{ marginTop: 8 }}>
              <Warn>
                Severe mismatch: {fit.severeMismatch.role}
                {fit.severeMismatch.slot ? ` (${fit.severeMismatch.slot})` : ''} —{' '}
                {fit.severeMismatch.talentName} fits this role only {score(fit.severeMismatch.fit, 0)}/100.
              </Warn>
            </div>
          )}

          <div className="grid grid-2" style={{ marginTop: 8 }}>
            <div className="stack" data-testid="pkg-fit-strongest">
              <span className="opt-title">Strongest link</span>
              <span>
                {fit.strongest.role}
                {fit.strongest.slot ? ` (${fit.strongest.slot})` : ''}: {fit.strongest.talentName}
              </span>
              <span className="mono">{score(fit.strongest.fit, 0)}/100</span>
            </div>
            <div className="stack" data-testid="pkg-fit-weakest">
              <span className="opt-title">Weakest link</span>
              <span>
                {fit.weakest.role}
                {fit.weakest.slot ? ` (${fit.weakest.slot})` : ''}: {fit.weakest.talentName}
              </span>
              <span className="mono">{score(fit.weakest.fit, 0)}/100</span>
            </div>
          </div>

          <div className="sep" />
          <table className="data">
            <thead>
              <tr>
                <th>Role</th>
                <th>Talent</th>
                <th className="num">Fit</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {fit.perAssignment.map((a) => (
                <tr key={`${a.role}${a.slot ? `-${a.slot}` : ''}-${a.talentId}`}>
                  <td>
                    {a.role}
                    {a.slot ? ` (${a.slot})` : ''}
                  </td>
                  <td>{a.talentName}</td>
                  <td className="num mono">{score(a.fit, 0)}</td>
                  <td>{a.unproven ? <span className="badge">Unproven</span> : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {fit.unfilled.length > 0 && (
            <p className="hint" data-testid="pkg-fit-unfilled" style={{ marginTop: 8 }}>
              Required slots still unfilled: {fit.unfilled.join(', ')}.
            </p>
          )}
        </div>
      )}

      {/* 3 ── Execution Confidence — perceived only, WE excluded ──────────── */}
      {execution !== undefined && (
        <div className="panel" data-testid="pkg-exec">
          <div className="spread">
            <h3 style={{ margin: 0 }}>Execution Confidence</h3>
            <span className="badge" data-testid="pkg-exec-tier">
              {execution.tier}
            </span>
          </div>
          <p className="hint">
            Confidence is perceived only — assembled from the studio&rsquo;s greenlight-time view.
            Work Ethic is excluded by design.
          </p>
          <p className="reason" style={{ marginTop: 8 }}>
            {execution.explanation}
          </p>
          <div className="grid grid-2" style={{ marginTop: 8 }}>
            <div className="stack">
              <span className="opt-title">Reasons for confidence</span>
              {execution.confidenceSources.length > 0 ? (
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {execution.confidenceSources.map((s, i) => (
                    <li key={`${s}-${i}`}>{s}</li>
                  ))}
                </ul>
              ) : (
                <span className="hint">Nothing clearly lifts confidence.</span>
              )}
            </div>
            <div className="stack">
              <span className="opt-title">Sources of uncertainty</span>
              {execution.uncertaintySources.length > 0 ? (
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {execution.uncertaintySources.map((s, i) => (
                    <li key={`${s}-${i}`}>{s}</li>
                  ))}
                </ul>
              ) : (
                <span className="hint">No specific uncertainty flagged.</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4 ── Commercial Outlook — a profit RANGE, no guaranteed profit ───── */}
      {profit !== undefined && (
        <div className="panel" data-testid="pkg-profit">
          <div className="spread">
            <h3 style={{ margin: 0 }}>Commercial Outlook</h3>
            <span className="badge">{confidenceLabel(profit.confidence)}</span>
          </div>

          <div className="grid grid-3" style={{ marginTop: 8 }}>
            <Metric label="Studio Revenue (low–exp–high)" small testid="pkg-profit-revenue">
              {money(profit.studioRevenue.low)} – {money(profit.studioRevenue.expected)} –{' '}
              {money(profit.studioRevenue.high)}
            </Metric>
            <Metric label="Profit / loss (low–exp–high)" small testid="pkg-profit-profit">
              {money(profit.profit.low)} –{' '}
              <span className={profit.profit.expected >= 0 ? 'money pos' : 'money neg'}>
                {money(profit.profit.expected)}
              </span>{' '}
              – {money(profit.profit.high)}
            </Metric>
            <Metric label="Break-even" small testid="pkg-profit-breakeven">
              {money(profit.breakEven)}
            </Metric>
          </div>

          {profit.profit.low < 0 && (
            <p className="hint" style={{ marginTop: 8 }}>
              This is a range, not a promise — at the low end the film can lose money
              ({money(profit.profit.low)}).
            </p>
          )}

          <div className="grid grid-2" style={{ marginTop: 8 }}>
            <div className="stack">
              <span className="opt-title">Upside drivers</span>
              {profit.upsideDrivers.length > 0 ? (
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {profit.upsideDrivers.map((s, i) => (
                    <li key={`${s}-${i}`}>{s}</li>
                  ))}
                </ul>
              ) : (
                <span className="hint">No clear upside drivers.</span>
              )}
            </div>
            <div className="stack">
              <span className="opt-title">Downside risks</span>
              {profit.downsideRisks.length > 0 ? (
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {profit.downsideRisks.map((s, i) => (
                    <li key={`${s}-${i}`}>{s}</li>
                  ))}
                </ul>
              ) : (
                <span className="hint">No specific downside risks.</span>
              )}
            </div>
          </div>

          <p className="hint" data-testid="pkg-profit-disclosure" style={{ marginTop: 8 }}>
            Studio Revenue is the full box-office total — the model has no distributor split.
          </p>
        </div>
      )}
    </div>
  )
}
