// ── Release result panel ─────────────────────────────────────────────────────
// An event panel (NOT a Broadcast feed) shown after a week that produced releases.
// Critic score, segment responses, opening + total box office, committed cost,
// profit/loss, standing changes, forecast-vs-result — clearly marked as RESULTS.
// From here the player can open the full autopsy for any released film.

import type { GameState, FilmResult, AutopsyView } from '../engine/adapter.ts'
import { explainRelease, findConcept } from '../engine/adapter.ts'
import { money, moneyExact, score, segmentLabel } from '../format.ts'
import { Metric, Delta } from '../components/common.tsx'

export function ReleaseResult({
  preTick,
  postTickStanding,
  released,
  onOpenAutopsy,
  onContinue,
}: {
  preTick: GameState
  postTickStanding: GameState['studio']['standing']
  released: FilmResult[]
  onOpenAutopsy: (view: AutopsyView, film: FilmResult) => void
  onContinue: () => void
}) {
  return (
    <div className="app-shell">
      <div className="topbar">
        <div className="brand">
          <span className="mark">THE WEEK’S RELEASES</span>
        </div>
        <button className="primary" onClick={onContinue} data-testid="release-continue">
          Back to studio
        </button>
      </div>

      <div className="stack" data-testid="release-list">
        {released.map((f) => {
          const view = explainRelease(preTick, postTickStanding, f)
          const concept = findConcept(preTick, f.conceptId)
          const profitPositive = view.profit >= 0
          return (
            <div className="card" key={f.productionId} data-testid={`release-card-${f.productionId}`}>
              <div className="spread">
                <h2 style={{ margin: 0 }}>{concept?.title ?? f.conceptId}</h2>
                <span className="tag result">Result</span>
              </div>

              <div className="grid grid-4 result-block" style={{ marginTop: 12 }}>
                <Metric label="Critic score" small testid={`res-critic-${f.productionId}`}>
                  {score(f.criticScore)}
                </Metric>
                <Metric label="Opening" small>
                  {money(f.boxOffice.opening)}
                </Metric>
                <Metric label="Total box office" small>
                  {money(f.boxOffice.total)}
                </Metric>
                <Metric label="Profit / loss" small testid={`res-profit-${f.productionId}`}>
                  <span className={profitPositive ? 'money pos' : 'money neg'}>
                    {profitPositive ? 'Profit ' : 'Loss '}
                    {moneyExact(view.profit)}
                  </span>
                </Metric>
              </div>

              <div className="sep" />
              <div className="grid grid-2">
                <div>
                  <h4>Forecast vs result</h4>
                  <table className="data">
                    <thead>
                      <tr>
                        <th></th>
                        <th className="num">Forecast</th>
                        <th className="num">Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Critic</td>
                        <td className="num">{score(view.forecast.expectedCriticScore)}</td>
                        <td className="num">{score(f.criticScore)}</td>
                      </tr>
                      <tr>
                        <td>Opening</td>
                        <td className="num">{money(view.forecast.expectedOpening)}</td>
                        <td className="num">{money(f.boxOffice.opening)}</td>
                      </tr>
                      <tr>
                        <td>Total</td>
                        <td className="num">{money(view.forecast.expectedTotal)}</td>
                        <td className="num">{money(f.boxOffice.total)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div>
                  <h4>Segment response</h4>
                  <table className="data">
                    <tbody>
                      {Object.entries(f.segmentScores).map(([seg, v]) => (
                        <tr key={seg}>
                          <td>{segmentLabel(seg)}</td>
                          <td className="num">{score(v)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="sep" />
              <h4>Standing changes</h4>
              <div className="row" style={{ gap: 28 }}>
                <div className="metric">
                  <span className="label">Audience Awareness</span>
                  <span className="value small">
                    <Delta value={view.standingDeltas.audienceAwareness} testid={`delta-aware-${f.productionId}`} />
                  </span>
                </div>
                <div className="metric">
                  <span className="label">Industry Prestige</span>
                  <span className="value small">
                    <Delta value={view.standingDeltas.industryPrestige} />
                  </span>
                </div>
                <div className="metric">
                  <span className="label">Commercial Confidence</span>
                  <span className="value small">
                    <Delta value={view.standingDeltas.commercialConfidence} />
                  </span>
                </div>
              </div>

              <div className="btn-row" style={{ marginTop: 16 }}>
                <button
                  className="accent"
                  onClick={() => onOpenAutopsy(view, f)}
                  data-testid={`open-autopsy-${f.productionId}`}
                >
                  Read the full autopsy
                </button>
              </div>
            </div>
          )
        })}
        {released.length === 0 && (
          <div className="card empty" data-testid="no-week-releases">
            A week passed. Nothing released this week.
          </div>
        )}
      </div>
    </div>
  )
}
