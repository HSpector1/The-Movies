// ── D-15 Studio Run Recap — read-only run explainer ───────────────────────────
// A management summary (NOT a debug dump) that answers: what happened, where the money
// went, which films helped or hurt, who is improving, how concentrated the strategy was,
// and whether the studio can make another film / whether waiting helps. Renders ONLY from
// the pure `studioRunRecap` read-model (adapter → core). No mutation, no engine formula
// in the screen. Accessible: semantic headings, tables, signed values as text (never
// color alone), keyboard-operable, textual alternatives for the one cash bar-chart.

import type { ReactNode } from 'react'
import type { GameState } from '../engine/adapter.ts'
import {
  studioRunRecap,
  type RecapFilm,
  type RecapTalent,
  type RecoveryPosition,
} from '../engine/adapter.ts'
import { money, moneyExact, score, pct } from '../format.ts'
import { Metric, Delta } from '../components/common.tsx'

const RECOVERY_LABEL: Record<RecoveryPosition, string> = {
  healthy: 'Healthy',
  constrained: 'Constrained but recoverable',
  severe: 'Severe recovery position',
  noNormalProduction: 'Normal production unavailable',
  incomplete: 'State incomplete',
}

function cap(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s
}

// Signed money with color AND an explicit +/- sign (never color alone — a11y).
function SignedMoney({ value, testid }: { value: number; testid?: string }) {
  return (
    <span className={value < 0 ? 'money neg' : 'money pos'} {...(testid ? { 'data-testid': testid } : {})}>
      {value >= 0 ? '+' : ''}
      {money(value)}
    </span>
  )
}

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section className="card" aria-labelledby={id} data-testid={`recap-section-${id}`}>
      <h2 id={id}>{title}</h2>
      {children}
    </section>
  )
}

const FILM_CLASS_LABEL: Record<RecapFilm['classification'], string> = {
  positive: 'Profit',
  breakEven: 'Break-even',
  loss: 'Loss',
  unknown: 'Unavailable',
}

export function StudioRunRecap({
  state,
  onBack,
  onOpenProfile,
}: {
  state: GameState
  onBack: () => void
  onOpenProfile?: ((id: string) => void) | undefined
}) {
  const r = studioRunRecap(state)
  const { summary, capital, position, concentration } = r
  const nameById = new Map(r.talent.map((t) => [t.talentId, t.name]))
  const talentName = (id: string | null) => (id ? nameById.get(id) ?? id : '—')

  return (
    <div className="app-shell" data-testid="studio-run-recap">
      <div className="topbar">
        <div className="brand">
          <span className="mark">STUDIO RUN RECAP</span>
          <span className="sub">Through week {summary.throughWeek}</span>
        </div>
        <button className="primary" onClick={onBack} data-testid="recap-back">
          Back to studio
        </button>
      </div>

      {/* ── A. Run summary ── */}
      <Section id="summary" title="What happened">
        <div className="row" style={{ gap: 24, flexWrap: 'wrap' }}>
          <Metric label="Run through" small testid="recap-through-week">
            Week {summary.throughWeek}
          </Metric>
          <Metric label="Starting cash" small>
            {moneyExact(summary.startingCash)}
          </Metric>
          <Metric label="Current cash" small testid="recap-current-cash">
            {moneyExact(summary.currentCash)}
          </Metric>
          <Metric label="Net cash change" small testid="recap-cash-change">
            <SignedMoney value={summary.cashChange} />
          </Metric>
          <Metric label="Films released" small testid="recap-film-count">
            {summary.releasedFilmCount}
          </Metric>
          <Metric label="Profitable / loss" small testid="recap-profit-loss-count">
            {summary.profitableFilmCount} / {summary.lossFilmCount}
          </Metric>
          <Metric label="Total film contribution" small testid="recap-total-contribution">
            <SignedMoney value={summary.totalFilmContribution} />
          </Metric>
          <Metric label="Avg critic" small>
            {summary.avgCriticScore != null ? score(summary.avgCriticScore) : '—'}
          </Metric>
          <Metric label="Avg audience" small>
            {summary.avgAudienceScore != null ? score(summary.avgAudienceScore) : '—'}
          </Metric>
        </div>
        <details style={{ marginTop: 10 }}>
          <summary>More detail</summary>
          <div className="row" style={{ gap: 24, flexWrap: 'wrap', marginTop: 8 }}>
            <Metric label="Total box office" small>
              {money(summary.totalBoxOfficeGross)}
            </Metric>
            <Metric label="Total studio revenue" small>
              {money(summary.totalStudioRevenue)}
            </Metric>
            <Metric label="Best film" small>
              {summary.bestFilm ? `${summary.bestFilm.title} (${money(summary.bestFilm.contribution)})` : '—'}
            </Metric>
            <Metric label="Worst film" small>
              {summary.worstFilm ? `${summary.worstFilm.title} (${money(summary.worstFilm.contribution)})` : '—'}
            </Metric>
            <Metric label="Longest loss streak" small>
              {summary.longestLossStreak}
            </Metric>
          </div>
        </details>
      </Section>

      <div style={{ height: 16 }} />

      {/* ── B. Capital story ── */}
      <Section id="capital" title="Where the money went">
        <p className="hint">
          Film economics, staffing, and overhead are shown separately. Film contribution is Studio
          Revenue minus each film&rsquo;s production commitment; payroll and overhead are studio costs,
          not charged to any single film.
        </p>
        <div className="grid grid-2" style={{ marginTop: 8 }}>
          <div className="inset">
            <h3 style={{ marginTop: 0 }}>Film economics</h3>
            <Metric label="Production commitments" small>
              {moneyExact(-capital.totalCommitments)}
            </Metric>
            <Metric label="Studio theatrical revenue" small>
              {moneyExact(capital.totalStudioRevenue)}
            </Metric>
            <Metric label="Net film contribution" small testid="recap-capital-contribution">
              <SignedMoney value={capital.totalFilmContribution} />
            </Metric>
          </div>
          <div className="inset">
            <h3 style={{ marginTop: 0 }}>Staffing &amp; overhead</h3>
            <Metric label="Payroll paid (run)" small>
              {moneyExact(-capital.totalPayroll)}
            </Metric>
            <Metric label="Overhead paid (run)" small>
              {moneyExact(-capital.totalOverhead)}
            </Metric>
            <Metric label="Current weekly burn" small testid="recap-weekly-burn">
              {moneyExact(-capital.currentWeeklyBurn)} ({moneyExact(-capital.currentWeeklyPayroll)} payroll +{' '}
              {moneyExact(-capital.currentWeeklyOverhead)} overhead)
            </Metric>
            <Metric label="Cash available now" small>
              {moneyExact(capital.currentCash)}
            </Metric>
          </div>
        </div>

        {r.inflectionPoints.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <h3>Key moments</h3>
            <table className="data" data-testid="recap-inflections">
              <thead>
                <tr>
                  <th>Week</th>
                  <th>Moment</th>
                  <th>What happened</th>
                </tr>
              </thead>
              <tbody>
                {r.inflectionPoints.map((p, i) => (
                  <tr key={`${p.kind}-${i}`}>
                    <td className="num">{p.week || '—'}</td>
                    <td>{p.label}</td>
                    <td>{p.evidence}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <details style={{ marginTop: 12 }}>
          <summary>Cash over time ({capital.cashTimeline.length} recorded weeks)</summary>
          <table className="data" data-testid="recap-cash-timeline" style={{ marginTop: 8 }}>
            <thead>
              <tr>
                <th>Week</th>
                <th className="num">Cash</th>
              </tr>
            </thead>
            <tbody>
              {capital.cashTimeline.map((c) => (
                <tr key={c.week}>
                  <td className="num">{c.week}</td>
                  <td className="num">{moneyExact(c.cash)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      </Section>

      <div style={{ height: 16 }} />

      {/* ── C. Film slate ── */}
      <Section id="films" title="Which films helped or hurt">
        {r.films.length === 0 ? (
          <p className="empty">No films have been released yet.</p>
        ) : (
          <table className="data" data-testid="recap-film-slate">
            <thead>
              <tr>
                <th>Wk</th>
                <th>Title</th>
                <th>Genre</th>
                <th>Lead</th>
                <th className="num">Commitment</th>
                <th className="num">Forecast</th>
                <th className="num">Actual</th>
                <th className="num">vs F/C</th>
                <th className="num">Critic</th>
                <th className="num">Studio rev.</th>
                <th className="num">Contribution</th>
                <th className="num">ROI</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              {r.films.map((f) => (
                <tr key={f.productionId} data-testid={`recap-film-${f.productionId}`}>
                  <td className="num">{f.releaseWeek}</td>
                  <td>{f.title}</td>
                  <td>{f.genre ? cap(f.genre) : '—'}</td>
                  <td>{f.lead ?? '—'}</td>
                  <td className="num">{f.committedCost != null ? money(f.committedCost) : '—'}</td>
                  <td className="num">{f.forecastTotal != null ? money(f.forecastTotal) : '—'}</td>
                  <td className="num">{money(f.realizedTotal)}</td>
                  <td className="num">{f.totalVsForecast != null ? `${f.totalVsForecast.toFixed(2)}×` : '—'}</td>
                  <td className="num">{score(f.realizedCritic)}</td>
                  <td className="num">{f.studioRevenue != null ? money(f.studioRevenue) : '—'}</td>
                  <td className="num" data-testid={`recap-film-${f.productionId}-contribution`}>
                    {f.contribution != null ? <SignedMoney value={f.contribution} /> : '—'}
                  </td>
                  <td className="num">{f.roi != null ? pct(f.roi) : '—'}</td>
                  <td>
                    <span className={`tag ${f.classification === 'loss' ? 'result' : 'fact'}`}>
                      {FILM_CLASS_LABEL[f.classification]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Section>

      <div style={{ height: 16 }} />

      {/* ── D. Talent development ── */}
      <Section id="talent" title="Who is improving">
        {r.talent.length === 0 ? (
          <p className="empty">No recorded career events yet.</p>
        ) : (
          <>
            <p className="hint">
              Strongest developer: <strong>{talentName(r.talentHighlights.strongestDeveloper)}</strong> · Largest
              craft gain: <strong>{talentName(r.talentHighlights.largestCraftImprovement)}</strong> · Largest Star
              Power gain: <strong>{talentName(r.talentHighlights.largestStarPowerImprovement)}</strong>
            </p>
            <table className="data" data-testid="recap-talent">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th className="num">Films</th>
                  <th className="num">OVR</th>
                  <th className="num">OVR Δ</th>
                  <th className="num">Star Power</th>
                  <th className="num">SP Δ</th>
                  <th className="num">+ / ~ / −</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                {r.talent.map((t: RecapTalent) => (
                  <tr key={t.talentId} data-testid={`recap-talent-${t.talentId}`}>
                    <td>
                      {onOpenProfile ? (
                        <button
                          type="button"
                          className="linkish"
                          data-testid={`recap-open-profile-${t.talentId}`}
                          onClick={() => onOpenProfile(t.talentId)}
                        >
                          {t.name}
                        </button>
                      ) : (
                        t.name
                      )}
                    </td>
                    <td>{cap(t.role)}</td>
                    <td className="num">{t.filmCount}</td>
                    <td className="num">
                      {t.startOVR}→{t.currentOVR}
                    </td>
                    <td className="num">
                      <Delta value={t.ovrChange} digits={0} />
                    </td>
                    <td className="num">
                      {Math.round(t.startStarPower)}→{Math.round(t.currentStarPower)}
                    </td>
                    <td className="num">
                      <Delta value={t.starPowerChange} digits={1} />
                    </td>
                    <td className="num">
                      {t.positiveStarEvents}/{t.negligibleStarEvents}/{t.negativeStarEvents}
                    </td>
                    <td>{t.productiveButUnderRecognized ? 'Productive, little recognition' : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </Section>

      <div style={{ height: 16 }} />

      {/* ── E. Strategy concentration ── */}
      <Section id="concentration" title="How concentrated was the strategy">
        <div className="row" style={{ gap: 24, flexWrap: 'wrap' }}>
          <Metric label="Top genre" small testid="recap-top-genre">
            {concentration.topGenre
              ? `${cap(concentration.topGenre.key)} (${concentration.topGenre.count}/${concentration.filmCount}, ${pct(concentration.topGenre.share)})`
              : '—'}
          </Metric>
          <Metric label="Top lead" small testid="recap-top-lead">
            {concentration.topLead
              ? `${concentration.topLead.key} (${concentration.topLead.count}/${concentration.filmCount}, ${pct(concentration.topLead.share)})`
              : '—'}
          </Metric>
          <Metric label="Budget spread" small>
            {concentration.budget
              ? `${money(concentration.budget.min)}–${money(concentration.budget.max)} (avg ${money(concentration.budget.mean)})`
              : '—'}
          </Metric>
          <Metric label="Release cadence" small>
            {concentration.cadence?.avgWeeksBetween != null
              ? `~${concentration.cadence.avgWeeksBetween} wks apart`
              : '—'}
          </Metric>
        </div>
        {concentration.recurringTeam.length > 0 && (
          <p className="hint" style={{ marginTop: 8 }} data-testid="recap-recurring-team">
            Recurring team:{' '}
            {concentration.recurringTeam.map((m) => `${m.name} (${cap(m.role)}, ${m.count})`).join(' · ')}
          </p>
        )}
        <p className="hint" style={{ marginTop: 8 }}>
          {concentration.note}
        </p>
      </Section>

      <div style={{ height: 16 }} />

      {/* ── F. Current position ── */}
      <Section id="position" title="Can I make another film, and what happens if I wait?">
        <div className="spread" style={{ alignItems: 'center', marginBottom: 8 }}>
          <span
            className={`tag ${position.recovery === 'healthy' ? 'fact' : position.recovery === 'incomplete' ? 'estimate' : 'result'}`}
            data-testid="recap-recovery"
          >
            {RECOVERY_LABEL[position.recovery]}
          </span>
        </div>
        <div className="grid grid-2">
          <div className="inset">
            <Metric label="Current cash" small>
              {moneyExact(position.currentCash)}
            </Metric>
            <Metric label="Cheapest legal film" small testid="recap-cheapest">
              {position.cheapest ? (
                <>
                  {moneyExact(position.cheapest.commitment)} —{' '}
                  {position.cheapest.affordable ? (
                    <span className="money pos">affordable</span>
                  ) : (
                    <span className="money neg">short {moneyExact(position.cheapest.shortfall)}</span>
                  )}
                </>
              ) : (
                '—'
              )}
            </Metric>
            <Metric label="Typical recent film" small testid="recap-typical">
              {position.typicalRecent ? (
                <>
                  {moneyExact(position.typicalRecent.commitment)} —{' '}
                  {position.typicalRecent.affordable ? (
                    <span className="money pos">affordable</span>
                  ) : (
                    <span className="money neg">short {moneyExact(position.typicalRecent.shortfall)}</span>
                  )}
                </>
              ) : (
                '—'
              )}
            </Metric>
          </div>
          <div className="inset">
            <Metric label="Active theatrical revenue" small>
              {position.hasActiveRevenue ? `${moneyExact(position.activeRunRevenue)}/wk incoming` : 'None active'}
            </Metric>
            <Metric label="Weekly burn" small>
              {moneyExact(-position.currentWeeklyBurn)}/wk
            </Metric>
            <Metric label="Waiting" small testid="recap-waiting">
              {position.waitingHelps
                ? 'holds or improves cash'
                : `reduces cash ~${moneyExact(-position.netWeeklyCash)}/wk`}
            </Metric>
            <Metric label="Fixed-cost runway" small>
              {position.fixedCostRunwayWeeks == null ? '— (net positive)' : `${position.fixedCostRunwayWeeks} wks`}
            </Metric>
            <Metric label="Contracts expire in" small>
              {position.weeksUntilFirstContractExpires == null
                ? '—'
                : position.weeksUntilFirstContractExpires === position.weeksUntilLastContractExpires
                  ? `${position.weeksUntilFirstContractExpires} wks`
                  : `${position.weeksUntilFirstContractExpires}–${position.weeksUntilLastContractExpires} wks`}
            </Metric>
          </div>
        </div>
        <ul className="hint" style={{ marginTop: 10 }} data-testid="recap-recovery-reasons">
          {position.recoveryReasons.map((reason, i) => (
            <li key={i}>{reason}</li>
          ))}
        </ul>
      </Section>

      {/* ── Warnings ── */}
      {r.warnings.length > 0 && (
        <>
          <div style={{ height: 16 }} />
          <Section id="warnings" title="What to watch">
            <ul data-testid="recap-warnings" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {r.warnings.map((w) => (
                <li
                  key={w.code}
                  className="warn"
                  data-testid={`recap-warning-${w.code}`}
                  style={{ marginBottom: 8 }}
                >
                  <strong>
                    [{w.severity === 'serious' ? 'Important' : w.severity === 'caution' ? 'Caution' : 'Note'}]
                  </strong>{' '}
                  {w.text}
                  <span className="hint" style={{ display: 'block' }}>
                    {w.evidence}
                  </span>
                </li>
              ))}
            </ul>
          </Section>
        </>
      )}

      {/* ── Evidence limitations ── */}
      <div style={{ height: 16 }} />
      <Section id="limitations" title="Notes &amp; limitations">
        <ul className="hint" data-testid="recap-limitations">
          {r.evidenceLimitations.map((l, i) => (
            <li key={i}>{l}</li>
          ))}
        </ul>
      </Section>
    </div>
  )
}
