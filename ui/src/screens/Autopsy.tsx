// ── Autopsy — the key explanation screen ─────────────────────────────────────
// Every number here is an engine value (reconstructed via the adapter's
// explainRelease → public resolveReception). Nothing is invented. The random term
// (reviewVariance) is NEVER hidden. The film is presented as an authored object,
// not one number: craft, cohesion, per-contributor vectors, shape effects, promise
// alignment, timing, reach, the full critic breakdown, per-segment response, the
// box-office breakdown, profit/loss, standing deltas and WHY each channel moved.

import type { AutopsyView } from '../engine/adapter.ts'
import { money, moneyExact, score, axis, signed, segmentLabel } from '../format.ts'
import { Metric, Delta } from '../components/common.tsx'

function Vec({ v }: { v: { intimacy: number; tonalWeight: number; kineticEnergy: number } }) {
  return (
    <span className="mono">
      ({axis(v.intimacy)}, {axis(v.tonalWeight)}, {axis(v.kineticEnergy)})
    </span>
  )
}

export function Autopsy({ view, onBack }: { view: AutopsyView; onBack: () => void }) {
  const profitPositive = view.profit >= 0
  return (
    <div className="app-shell" data-testid="autopsy">
      <div className="topbar">
        <div className="brand">
          <span className="mark">AUTOPSY</span>
          <span className="sub">{view.conceptTitle}</span>
        </div>
        <button className="primary" onClick={onBack} data-testid="autopsy-back">
          Back to studio
        </button>
      </div>

      {/* Headline: forecast (estimate) vs result */}
      <div className="card">
        <div className="spread">
          <h2 style={{ margin: 0 }}>What we expected, and what happened</h2>
        </div>
        <div className="grid grid-3" style={{ marginTop: 12 }}>
          <div className="estimate-block">
            <Metric label="Forecast critic (estimate)" small>
              {score(view.forecast.expectedCriticScore)}
            </Metric>
            <Metric label="Forecast total (estimate)" small>
              {money(view.forecast.expectedTotal)}
            </Metric>
          </div>
          <div className="result-block">
            <Metric label="Realized critic (result)" small testid="autopsy-critic">
              {score(view.criticScore)}
            </Metric>
            <Metric label="Realized total (result)" small>
              {money(view.boxOffice.total)}
            </Metric>
          </div>
          <div>
            <Metric label="Profit / loss (result)" small testid="autopsy-profit">
              <span className={profitPositive ? 'money pos' : 'money neg'}>
                {profitPositive ? 'Profit ' : 'Loss '}
                {moneyExact(view.profit)}
              </span>
            </Metric>
            <Metric label="Committed cost" small>
              {moneyExact(view.committedCost)}
            </Metric>
          </div>
        </div>
      </div>

      <div style={{ height: 16 }} />

      <div className="grid grid-2">
        {/* Craft breakdown */}
        <div className="card">
          <h3>Craft</h3>
          <p className="hint">How well the film was made — script, direction, cast, technical, budget.</p>
          <table className="data">
            <tbody>
              <tr>
                <td>Script strength</td>
                <td className="num">{score(view.scriptStrength)}</td>
              </tr>
              <tr>
                <td>Director execution</td>
                <td className="num">{score(view.directorExecution)}</td>
              </tr>
              <tr>
                <td>Cast execution</td>
                <td className="num">{score(view.castExecution)}</td>
              </tr>
              <tr>
                <td>Technical</td>
                <td className="num">{score(view.technical)}</td>
              </tr>
              <tr>
                <td>Budget adequacy</td>
                <td className="num">{score(view.budgetAdequacy)}</td>
              </tr>
              <tr>
                <td>
                  <strong>Craft</strong>
                </td>
                <td className="num">
                  <strong>{score(view.craft)}</strong>
                </td>
              </tr>
            </tbody>
          </table>
          <p className="hint">Required negative: {money(view.requiredNegative)}</p>
        </div>

        {/* Cohesion + contributions */}
        <div className="card">
          <h3>Cohesion</h3>
          <p className="hint">
            Does the film feel intentional? Each contributor pulls the film in a direction; cohesion
            measures how aligned they are.
          </p>
          <table className="data">
            <thead>
              <tr>
                <th>Contributor</th>
                <th className="num">Vector (intimacy, weight, energy)</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(view.contributions).map(([key, c]) => (
                <tr key={key}>
                  <td>{c.role}</td>
                  <td className="num">
                    <Vec v={c.vector} />
                  </td>
                </tr>
              ))}
              <tr>
                <td>
                  <strong>Delivered (centroid)</strong>
                </td>
                <td className="num">
                  <strong>
                    <Vec v={view.delivered} />
                  </strong>
                </td>
              </tr>
            </tbody>
          </table>
          <div className="row" style={{ gap: 24, marginTop: 8 }}>
            <Metric label="Directional agreement" small>
              {score(view.directionalAgreement, 2)}
            </Metric>
            <Metric label="Expressive strength" small>
              {score(view.expressiveStrength, 2)}
            </Metric>
            <Metric label="Cohesion" small testid="autopsy-cohesion">
              {score(view.cohesion, 2)}
            </Metric>
          </div>
        </div>
      </div>

      <div style={{ height: 16 }} />

      {/* Critic breakdown — including the sampled term, never hidden */}
      <div className="card">
        <h3>Critical reception</h3>
        <p className="hint">
          The critic score is drawn around a mean; the sampled variance is part of the outcome and is
          shown here, never hidden.
        </p>
        <div className="grid grid-4">
          <Metric label="0.65 × craft" small>
            {score(0.65 * view.craft)}
          </Metric>
          <Metric label="Cohesion contribution" small>
            {signed(view.cohesionContribution)}
          </Metric>
          <Metric label="Originality contribution" small>
            {signed(view.originalityContribution)}
          </Metric>
          <Metric label="Timeliness contribution" small>
            {signed(view.timelinessContribution)}
          </Metric>
        </div>
        <div className="sep" />
        <div className="grid grid-4">
          <Metric label="Critic mean" small testid="autopsy-criticmean">
            {score(view.criticMean)}
          </Metric>
          <Metric label="Critic sigma" small>
            {score(view.criticSigma, 2)}
          </Metric>
          <Metric label="Review variance (sampled)" small testid="autopsy-reviewvariance">
            <span className="tag estimate" style={{ marginRight: 6 }}>
              Random
            </span>
            {signed(view.reviewVariance)}
          </Metric>
          <Metric label="Realized critic score" small>
            {score(view.criticScore)}
          </Metric>
        </div>
        <p className="hint" style={{ marginTop: 8 }}>
          Force alignment (cultural timing): {axis(view.forceAlignment)} · Originality (raw):{' '}
          {score(view.originalityRaw)}
        </p>
      </div>

      <div style={{ height: 16 }} />

      <div className="grid grid-2">
        {/* Promise + segment appeal */}
        <div className="card">
          <h3>Promise &amp; audience</h3>
          <p className="hint">
            How well the delivered film matched the promise, and how each segment responded.
          </p>
          <div className="row" style={{ gap: 24 }}>
            <Metric label="Promise mismatch" small testid="autopsy-mismatch">
              {score(view.promiseMismatch, 2)}
            </Metric>
            <Metric label="Mismatch penalty" small>
              {score(view.mismatchPenalty)}
            </Metric>
            <Metric label="Star draw" small>
              {score(view.starDraw)}
            </Metric>
          </div>
          <div className="sep" />
          <table className="data">
            <thead>
              <tr>
                <th>Segment</th>
                <th className="num">Fit</th>
                <th className="num">Appeal</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(view.segmentAppeal).map((seg) => (
                <tr key={seg}>
                  <td>{segmentLabel(seg)}</td>
                  <td className="num">{score(view.segmentFit[seg as keyof typeof view.segmentFit])}</td>
                  <td className="num">{score(view.segmentAppeal[seg as keyof typeof view.segmentAppeal])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Box office breakdown */}
        <div className="card">
          <h3>Box office</h3>
          <table className="data">
            <tbody>
              <tr>
                <td>Awareness factor (reach)</td>
                <td className="num">{score(view.awarenessFactor, 2)}</td>
              </tr>
              <tr>
                <td>Opening reach multiplier</td>
                <td className="num">{score(view.openingReachMult, 2)}</td>
              </tr>
              <tr>
                <td>Weighted audience score</td>
                <td className="num">{score(view.weightedAudienceScore)}</td>
              </tr>
              <tr>
                <td>Legs</td>
                <td className="num">{score(view.legs, 2)}</td>
              </tr>
              <tr>
                <td>
                  <strong>Opening</strong>
                </td>
                <td className="num">
                  <strong>{money(view.boxOffice.opening)}</strong>
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Total</strong>
                </td>
                <td className="num">
                  <strong>{money(view.boxOffice.total)}</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ height: 16 }} />

      {/* Standing deltas + WHY each channel moved (D-6 inputs) */}
      <div className="card">
        <h3>Standing changes — and why</h3>
        <div className="grid grid-3">
          <div className="stack">
            <div className="spread">
              <strong>Audience Awareness</strong>
              <Delta value={view.standingDeltas.audienceAwareness} testid="autopsy-delta-aware" />
            </div>
            <span className="hint">{view.standingWhy.awareness}</span>
            <span className="hint mono">
              {view.standingBefore.audienceAwareness.toFixed(0)} →{' '}
              {view.standingAfter.audienceAwareness.toFixed(0)}
            </span>
          </div>
          <div className="stack">
            <div className="spread">
              <strong>Industry Prestige</strong>
              <Delta value={view.standingDeltas.industryPrestige} testid="autopsy-delta-prestige" />
            </div>
            <span className="hint">{view.standingWhy.prestige}</span>
            <span className="hint mono">
              {view.standingBefore.industryPrestige.toFixed(0)} →{' '}
              {view.standingAfter.industryPrestige.toFixed(0)}
            </span>
          </div>
          <div className="stack">
            <div className="spread">
              <strong>Commercial Confidence</strong>
              <Delta
                value={view.standingDeltas.commercialConfidence}
                testid="autopsy-delta-confidence"
              />
            </div>
            <span className="hint">{view.standingWhy.confidence}</span>
            <span className="hint mono">
              {view.standingBefore.commercialConfidence.toFixed(0)} →{' '}
              {view.standingAfter.commercialConfidence.toFixed(0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
