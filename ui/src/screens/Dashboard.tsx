// ── Studio dashboard ─────────────────────────────────────────────────────────
// What do I own / what's in production / what happened / what's my next decision.
// Current week, cash, three standing channels (labeled + one-line meanings),
// active productions (stored forecast + remaining weeks), recent releases, and the
// primary actions (Assemble a film, Advance one week) plus Talent creator / Saves.

import type { GameState, FilmResult } from '../engine/adapter.ts'
import {
  selectWeek,
  selectCash,
  standingChannels,
  selectActiveProductions,
  selectReleasedFilms,
  canGreenlightMore,
  findConcept,
  payrollSummary,
} from '../engine/adapter.ts'
import { money, score } from '../format.ts'
import { Metric, StandingBar } from '../components/common.tsx'

export function Dashboard({
  state,
  onAssemble,
  onAdvance,
  onCreateTalent,
  onOpenHub,
  onOpenRoster,
  onOpenHiring,
  onSaves,
  onOpenAutopsy,
  onOpenClipping,
}: {
  state: GameState
  onAssemble: () => void
  onAdvance: () => void
  onCreateTalent: () => void
  onOpenHub?: () => void
  onOpenRoster?: () => void
  onOpenHiring?: () => void
  onSaves: () => void
  onOpenAutopsy: (film: FilmResult) => void
  // D-11.C PART 2: reopen a film's newspaper clipping. Optional — the clipping is
  // reconstructed from persisted state, so it works even for imported saves.
  onOpenClipping?: (film: FilmResult) => void
}) {
  const week = selectWeek(state)
  const cash = selectCash(state)
  const channels = standingChannels(state)
  const active = selectActiveProductions(state)
  const released = selectReleasedFilms(state)
  const canGreenlight = canGreenlightMore(state)
  const payroll = payrollSummary(state)

  // Recent releases: most recent first.
  const recent = [...released].reverse().slice(0, 6)

  return (
    <div className="app-shell">
      <div className="topbar">
        <div className="brand">
          <span className="mark">PROJECT: STUDIO</span>
          <span className="sub" data-testid="seed-label">
            seed “{state.seed}”
          </span>
        </div>
        <div className="row" style={{ gap: 24 }}>
          <Metric label="Week" testid="dash-week">
            {week}
          </Metric>
          <Metric label="Cash" testid="dash-cash">
            <span className={cash < 0 ? 'money neg' : 'money pos'}>{money(cash)}</span>
          </Metric>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <h2>Standing</h2>
          <div className="stack" style={{ gap: 18 }}>
            {channels.map((c) => (
              <StandingBar
                key={c.key}
                label={c.label}
                meaning={c.meaning}
                value={c.value}
                testid={`standing-${c.key}`}
              />
            ))}
          </div>
        </div>

        <div className="card stack">
          <h2>Next decision</h2>
          <p className="hint">
            Assemble and greenlight a film, or let a week pass so productions advance and finished
            films release.
          </p>
          <div className="btn-row">
            <button
              className="accent"
              onClick={onAssemble}
              disabled={!canGreenlight}
              data-testid="assemble-film"
            >
              Assemble a film
            </button>
            <button className="primary" onClick={onAdvance} data-testid="advance-week">
              Advance one week
            </button>
          </div>
          {!canGreenlight && (
            <p className="hint">
              At the production cap ({active.length}). Advance weeks until a film releases before
              starting another.
            </p>
          )}
          <div className="sep" />
          <div className="btn-row">
            <button
              className="ghost"
              onClick={onOpenRoster}
              disabled={!onOpenRoster}
              data-testid="open-roster"
            >
              Studio Roster
            </button>
            <button
              className="ghost"
              onClick={onOpenHiring}
              disabled={!onOpenHiring}
              data-testid="open-hiring"
            >
              Hiring Market
            </button>
            <button
              className="ghost"
              onClick={onOpenHub}
              disabled={!onOpenHub}
              data-testid="open-talent-hub"
            >
              Talent Hub
            </button>
            <button className="ghost" onClick={onCreateTalent} data-testid="open-talent-creator">
              Create talent
            </button>
            <button className="ghost" onClick={onSaves} data-testid="open-saves">
              Saves
            </button>
          </div>
        </div>
      </div>

      <div style={{ height: 16 }} />

      <div className="card">
        <h2>Payroll &amp; runway</h2>
        <div className="row" style={{ gap: 24, flexWrap: 'wrap' }} data-testid="payroll-summary">
          <Metric label="Roster" small testid="payroll-count">
            {payroll.contractCount}
          </Metric>
          <Metric label="Weekly payroll" small testid="payroll-weekly">
            {money(payroll.weeklyPayroll)}
          </Metric>
          <Metric label="Annual payroll" small testid="payroll-annual">
            {money(payroll.annualPayroll)}
          </Metric>
          <Metric label="Contract obligations" small>
            {money(payroll.projectedObligations)}
          </Metric>
          <Metric label="Signing bonuses paid" small testid="payroll-bonuses">
            {money(payroll.signingBonusesPaid)}
          </Metric>
          <Metric label="Upcoming renewals" small testid="payroll-renewals">
            {payroll.upcomingRenewals}
          </Metric>
          <Metric label="Runway" small testid="payroll-runway">
            {payroll.runwayWeeks === null ? '—' : `${payroll.runwayWeeks} wk`}
          </Metric>
        </div>
        <p className="hint" style={{ marginTop: 8 }}>
          Weekly payroll is charged every time you advance a week. Studio Revenue currently equals
          full box-office revenue (distributor and exhibitor economics are not yet modeled).
        </p>
      </div>

      <div style={{ height: 16 }} />

      <div className="card">
        <h2>In production</h2>
        {active.length === 0 ? (
          <div className="empty" data-testid="no-active">
            Nothing in production. Assemble a film to get started.
          </div>
        ) : (
          <div className="grid grid-2" data-testid="active-list">
            {active.map((p) => {
              const concept = findConcept(state, p.conceptId)
              return (
                <div className="panel" key={p.id} data-testid={`active-${p.id}`}>
                  <div className="spread">
                    <strong>{concept?.title ?? p.conceptId}</strong>
                    <span className="tag fact">Fact</span>
                  </div>
                  <div className="row" style={{ marginTop: 8, gap: 24 }}>
                    <Metric label="Weeks left" small testid={`weeks-${p.id}`}>
                      {p.remainingTicks}
                    </Metric>
                    <Metric label="Forecast total" small>
                      <span className="tag estimate" style={{ marginRight: 6 }}>
                        Est
                      </span>
                      {money(p.forecastSnapshot.expectedTotal)}
                    </Metric>
                    <Metric label="Forecast critic" small>
                      <span className="tag estimate" style={{ marginRight: 6 }}>
                        Est
                      </span>
                      {score(p.forecastSnapshot.expectedCriticScore)}
                    </Metric>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div style={{ height: 16 }} />

      <div className="card">
        <h2>Recent releases</h2>
        {recent.length === 0 ? (
          <div className="empty" data-testid="no-releases">
            No films have released yet.
          </div>
        ) : (
          <table className="data" data-testid="releases-table">
            <thead>
              <tr>
                <th>Film</th>
                <th className="num">Critic</th>
                <th className="num">Opening</th>
                <th className="num">Total</th>
                <th>Released</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {recent.map((f) => {
                const concept = findConcept(state, f.conceptId)
                return (
                  <tr key={f.productionId} data-testid={`release-${f.productionId}`}>
                    <td>{concept?.title ?? f.conceptId}</td>
                    <td className="num">{score(f.criticScore)}</td>
                    <td className="num">{money(f.boxOffice.opening)}</td>
                    <td className="num">{money(f.boxOffice.total)}</td>
                    <td>week {f.releaseTick}</td>
                    <td>
                      <div className="btn-row">
                        {onOpenClipping && (
                          <button
                            className="ghost"
                            onClick={() => onOpenClipping(f)}
                            data-testid={`clipping-${f.productionId}`}
                          >
                            Clipping
                          </button>
                        )}
                        <button
                          className="ghost"
                          onClick={() => onOpenAutopsy(f)}
                          data-testid={`autopsy-${f.productionId}`}
                        >
                          Autopsy
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
        {recent.length > 0 && (
          <p className="hint" style={{ marginTop: 8 }}>
            Autopsy is available for releases from this session (the full breakdown needs the
            pre-release studio state, which is kept only for films released while you play).
          </p>
        )}
      </div>
    </div>
  )
}
