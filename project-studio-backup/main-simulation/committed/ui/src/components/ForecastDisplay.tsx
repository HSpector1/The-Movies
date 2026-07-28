// ── ForecastDisplay — restricted-capable ─────────────────────────────────────
// Renders a Forecast (either the pre-greenlight PREVIEW or a stored snapshot) as
// clearly-marked ESTIMATES. Preserves confidence, causal factors and uncertainty
// factors. Distinguishes estimates from facts visually (estimate tag + block).
//
// `mode='normal'`     → exact expected opening/total/critic + per-segment bands.
// `mode='restricted'` → hides precise numbers; shows only qualitative labels and a
//   WIDENED band. A real component capability for a future deferred restricted-info
//   system — no pitch data, no filmmaker identities.

import type { Forecast } from '../engine/adapter.ts'
import { money, score, bandLabel, confidenceLabel, factorLabel, segmentLabel } from '../format.ts'

export type DisplayMode = 'normal' | 'restricted'

function qualitativeBox(n: number, scale: 'money' | 'critic'): string {
  if (scale === 'critic') {
    return n < 40 ? 'Weak' : n > 70 ? 'Strong' : 'Mixed'
  }
  // money buckets, deliberately coarse (restricted hides the precise number)
  if (n < 15_000_000) return 'Small'
  if (n < 45_000_000) return 'Moderate'
  return 'Large'
}

export function ForecastDisplay({
  forecast,
  mode = 'normal',
  heading = 'Forecast',
  source = 'estimate',
}: {
  forecast: Forecast
  mode?: DisplayMode
  heading?: string
  // 'estimate' = pre-greenlight preview; 'snapshot' = stored at greenlight. Both
  // are estimates, never results — labeled accordingly.
  source?: 'estimate' | 'snapshot'
}) {
  // Confidence is film-level (same across segments).
  const confidence = forecast.segments[0]?.confidence ?? 'low'
  const causal = forecast.segments[0]?.causalFactors ?? []
  const uncertainty = forecast.segments[0]?.uncertaintyFactors ?? []
  const restricted = mode === 'restricted'

  return (
    <div className="panel estimate-block" data-testid="forecast-display" data-mode={mode}>
      <div className="spread">
        <h3 style={{ margin: 0 }}>{heading}</h3>
        <span className="tag estimate">Estimate</span>
      </div>
      <p className="hint" style={{ marginTop: 4 }}>
        {source === 'snapshot'
          ? 'Captured at greenlight from greenlight-time information. This is the studio’s prediction, not a result.'
          : 'Projected from what is known before greenlight. This is a prediction, not a result.'}
      </p>

      <div className="grid grid-3" style={{ marginTop: 8 }}>
        <div className="metric">
          <span className="label">Expected opening</span>
          <span className="value small mono" data-testid="fc-opening">
            {restricted ? qualitativeBox(forecast.expectedOpening, 'money') : money(forecast.expectedOpening)}
          </span>
        </div>
        <div className="metric">
          <span className="label">Expected total</span>
          <span className="value small mono" data-testid="fc-total">
            {restricted ? qualitativeBox(forecast.expectedTotal, 'money') : money(forecast.expectedTotal)}
          </span>
        </div>
        <div className="metric">
          <span className="label">Expected critic score</span>
          <span className="value small mono" data-testid="fc-critic">
            {restricted
              ? qualitativeBox(forecast.expectedCriticScore, 'critic')
              : score(forecast.expectedCriticScore)}
          </span>
        </div>
      </div>

      <div className="sep" />
      <h4>Per-segment expectation</h4>
      <table className="data">
        <thead>
          <tr>
            <th>Segment</th>
            <th>Band</th>
            {!restricted && <th className="num">Estimate</th>}
            <th className="num">Range</th>
          </tr>
        </thead>
        <tbody>
          {forecast.segments.map((s) => {
            // Restricted widens the band: expand the interval outward.
            const low = restricted ? Math.max(0, s.low - 10) : s.low
            const high = restricted ? Math.min(100, s.high + 10) : s.high
            return (
              <tr key={s.segmentId} data-testid={`fc-seg-${s.segmentId}`}>
                <td>{segmentLabel(s.segmentId)}</td>
                <td>{bandLabel(s.expectedBand)}</td>
                {!restricted && <td className="num mono">{score(s.estimate)}</td>}
                <td className="num mono">
                  {score(low, 0)}–{score(high, 0)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <div className="sep" />
      <div className="spread">
        <span className="badge" data-testid="fc-confidence">
          {confidenceLabel(confidence)}
        </span>
      </div>
      {causal.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <h4>Why this looks promising</h4>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {causal.map((k) => (
              <li key={k}>{factorLabel(k)}</li>
            ))}
          </ul>
        </div>
      )}
      {uncertainty.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <h4>Sources of uncertainty</h4>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {uncertainty.map((k) => (
              <li key={k}>{factorLabel(k)}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
