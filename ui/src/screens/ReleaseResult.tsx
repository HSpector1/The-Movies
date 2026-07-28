// ── Release result panel ─────────────────────────────────────────────────────
// An event panel (NOT a Broadcast feed) shown after a week that produced releases.
// Critic score, segment responses, opening + total box office, committed cost,
// profit/loss, standing changes, forecast-vs-result — clearly marked as RESULTS.
// From here the player can open the full autopsy for any released film.

import type {
  GameState,
  FilmResult,
  AutopsyView,
  ReleaseDevelopment,
  ParticipantDevelopment,
} from '../engine/adapter.ts'
import { explainRelease, findConcept } from '../engine/adapter.ts'
import { money, moneyExact, score, segmentLabel } from '../format.ts'
import { Metric, Delta } from '../components/common.tsx'

export function ReleaseResult({
  preTick,
  postTickStanding,
  released,
  development,
  onOpenAutopsy,
  onContinue,
}: {
  preTick: GameState
  postTickStanding: GameState['studio']['standing']
  released: FilmResult[]
  // RULING A: per-release development summary for every participating talent.
  development: ReleaseDevelopment[]
  onOpenAutopsy: (view: AutopsyView, film: FilmResult) => void
  onContinue: () => void
}) {
  // Index the development summary by productionId for O(1) lookup per released film.
  const devByProd = new Map<string, ReleaseDevelopment>()
  for (const d of development) devByProd.set(d.productionId, d)
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
          // D-12 P5: this screen shows every film that released THIS week side by side; the studio-standing
          // delta is the week's studio-wide movement, shared across them. Pass the co-releases so each card
          // (and the autopsy opened from it) labels the delta honestly instead of implying this film caused it.
          const sameWeekReleases = released
            .filter((o) => o.productionId !== f.productionId)
            .map((o) => ({ productionId: o.productionId, title: findConcept(preTick, o.conceptId)?.title ?? o.conceptId }))
          const view = explainRelease(preTick, postTickStanding, f, sameWeekReleases)
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
              {view.standingSharedWeek && (
                <p className="reason" data-testid={`release-sharedweek-${f.productionId}`} style={{ marginTop: 0 }}>
                  <strong>Studio standing change for Week {view.releaseWeek}</strong> — includes {concept?.title ?? f.conceptId}
                  {view.sameWeekReleases.map((r) => ` and ${r.title}`).join('')}. This is the studio-wide movement for
                  the week, shared across these releases — not attributable to this film alone.
                </p>
              )}
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

              <div className="sep" />
              <DevelopmentSummary dev={devByProd.get(f.productionId)} productionId={f.productionId} />

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

// ── RULING A — Per-release development summary ────────────────────────────────
// Every participating talent's development this release: discipline performed, the
// professional-skill changes (or a truthful "no measurable increase" line), genre
// experience gained, role OVR before → after, and any truthful Work-Ethic / approaching-
// range note. All lines come from the engine (developmentReport / careerIdentity via the
// adapter); nothing is recomputed here. Hidden ceilings, rolls, and true potential are
// never shown.
function DevelopmentSummary({
  dev,
  productionId,
}: {
  dev: ReleaseDevelopment | undefined
  productionId: string
}) {
  if (!dev) return null
  return (
    <div data-testid={`development-summary-${productionId}`}>
      <h4>How the team developed</h4>
      <p className="hint" style={{ marginTop: 0 }}>
        Working on a film develops the people who made it. These are the lasting changes from
        this release — estimates of ability, never hidden ceilings or true potential.
      </p>
      <div className="grid grid-2" style={{ gap: 12 }}>
        {dev.participants.map((p) => (
          <ParticipantRow key={p.talentId} p={p} productionId={productionId} />
        ))}
      </div>
    </div>
  )
}

function ParticipantRow({
  p,
  productionId,
}: {
  p: ParticipantDevelopment
  productionId: string
}) {
  // The professional-skill lines only (OVR + experience lines are shown separately below,
  // structured). A truthful "no measurable increase" line when no professional skill rose.
  const ovrMoved = p.ovrAfter !== p.ovrBefore
  return (
    <div
      className="panel stack"
      style={{ padding: 10, gap: 4 }}
      data-testid={`dev-participant-${productionId}-${p.talentId}`}
    >
      <div className="spread">
        <strong>{p.name}</strong>
        <span className="badge">{p.disciplineLabel}</span>
      </div>

      {/* Role OVR before → after (a public perceived summary). */}
      <div className="spread mono" style={{ fontSize: 13 }}>
        <span className="hint">Role OVR</span>
        <span data-testid={`dev-ovr-${productionId}-${p.talentId}`}>
          {p.ovrBefore} → {p.ovrAfter}
          {ovrMoved && <span className="tag estimate" style={{ marginLeft: 6 }}>changed</span>}
        </span>
      </div>

      {/* Professional-skill changes + genre experience — the engine's report lines. */}
      {p.professionalSkillRose ? (
        <ul style={{ margin: 0, paddingLeft: 18 }} data-testid={`dev-lines-${productionId}-${p.talentId}`}>
          {p.lines.map((line, i) => (
            <li key={i} className="mono" style={{ fontSize: 12 }}>
              {line}
            </li>
          ))}
        </ul>
      ) : (
        <>
          <div className="hint" data-testid={`dev-nogain-${productionId}-${p.talentId}`}>
            No measurable professional-skill increase.
          </div>
          {/* Experience/OVR lines can still be present even when no professional skill rose. */}
          {p.lines.length > 0 && p.lines[0] !== 'No measurable skill increase.' && (
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {p.lines
                .filter((l) => l.includes('experience'))
                .map((line, i) => (
                  <li key={i} className="mono" style={{ fontSize: 12 }}>
                    {line}
                  </li>
                ))}
            </ul>
          )}
        </>
      )}

      {/* Truthful Work-Ethic / approaching-range notes (only when the calc used them). */}
      {p.notes.length > 0 && (
        <div className="stack" style={{ gap: 2 }} data-testid={`dev-notes-${productionId}-${p.talentId}`}>
          {p.notes.map((n, i) => (
            <span key={i} className="hint" style={{ fontSize: 11 }}>
              {n}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
