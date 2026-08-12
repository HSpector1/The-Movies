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

// A4: a plain money figure in a Downside/Expected/Upside triple (Studio Revenue — always ≥ 0).
function RangeFigure({ label, value, testid }: { label: string; value: number; testid?: string }) {
  return (
    <div className="stack" {...(testid ? { 'data-testid': testid } : {})}>
      <span className="hint">{label}</span>
      <span className="mono">{money(value)}</span>
    </div>
  )
}

// A4: a Film Contribution figure that never relies on color alone — every figure carries an
// explicit Profit / Loss / Break-even word, and negative values are marked as a loss (red).
// A near-zero value (|contribution| < $1K, i.e. it rounds to break-even) reads as neutral.
function ContribFigure({ label, value, testid }: { label: string; value: number; testid?: string }) {
  const neutral = Math.abs(value) < 1_000
  const cls = neutral ? 'mono' : value > 0 ? 'money pos' : 'money neg'
  const word = neutral ? 'Break-even' : value > 0 ? 'Profit' : 'Loss'
  return (
    <div className="stack" {...(testid ? { 'data-testid': testid } : {})}>
      <span className="hint">{label}</span>
      <span className={cls}>
        {money(value)} · {word}
      </span>
    </div>
  )
}

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

          <div className="stack" style={{ marginTop: 8 }}>
            <div className="stack" data-testid="pkg-profit-revenue">
              <span className="opt-title">Studio Revenue</span>
              <div className="grid grid-3">
                <RangeFigure label="Downside" value={profit.studioRevenue.low} />
                <RangeFigure label="Expected" value={profit.studioRevenue.expected} />
                <RangeFigure label="Upside" value={profit.studioRevenue.high} />
              </div>
            </div>
            <div className="stack" data-testid="pkg-profit-profit">
              <span className="opt-title">Film Contribution</span>
              <div className="grid grid-3">
                <ContribFigure label="Downside" value={profit.profit.low} testid="pkg-profit-contribution-downside" />
                <ContribFigure label="Expected" value={profit.profit.expected} />
                <ContribFigure label="Upside" value={profit.profit.high} />
              </div>
            </div>
            {/* D-17A/T2: this panel's break-even is the DIRECT-cost figure, and its label now
                says so. The studio-economic (cycle-inclusive) headline lives at Assembly, where
                the studio's weekly burn is in scope; two identically-labelled break-evens with
                different values on one screen was exactly the competing-headline defect R7 closes. */}
            <Metric label="Break-even theatrical gross (direct costs only)" small testid="pkg-profit-breakeven">
              {money(profit.breakEven)}
            </Metric>
            <p className="hint" style={{ marginTop: 0 }}>
              The full box-office gross required for the studio&rsquo;s share to repay this
              film&rsquo;s direct costs. It does not include the studio payroll and overhead paid
              while the film is made and released &mdash; Assembly&rsquo;s break-even headline does.
            </p>
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
            Studio Revenue is the studio’s blended rental share of box office (distributor and
            exhibitor economics are abstracted into that share); break-even is the gross the film
            must reach to return its cost.
          </p>
        </div>
      )}
    </div>
  )
}
