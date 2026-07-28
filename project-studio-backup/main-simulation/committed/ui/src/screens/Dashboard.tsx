// ── Studio dashboard ─────────────────────────────────────────────────────────
// What do I own / what's in production / what happened / what's my next decision.
// Current week, cash, three standing channels (labeled + one-line meanings),
// active productions (stored forecast + remaining weeks), recent releases, and the
// primary actions (Assemble a film, Advance one week) plus Talent creator / Saves.

import type { GameState, FilmResult, RunView } from '../engine/adapter.ts'
import {
  selectWeek,
  selectCash,
  standingChannels,
  selectActiveProductions,
  selectReleasedFilms,
  canGreenlightMore,
  assemblyAvailability,
  findConcept,
  financeCard,
  theatricalRuns,
  studioRevenueForFilm,
} from '../engine/adapter.ts'
import { money, score } from '../format.ts'
import { Metric, StandingBar } from '../components/common.tsx'

export function Dashboard({
  state,
  onAssemble,
  onAdvance,
  onSimToEvent,
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
  onSimToEvent: () => void
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
  const availability = assemblyAvailability(state) // P5: block Assemble early if no legal team can form
  const fin = financeCard(state)
  const runs = theatricalRuns(state)

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
              disabled={!canGreenlight || !availability.canAssemble}
              data-testid="assemble-film"
            >
              Assemble a film
            </button>
            <button className="primary" onClick={onAdvance} data-testid="advance-week">
              Advance one week
            </button>
            <button className="primary" onClick={onSimToEvent} data-testid="sim-to-event">
              Sim to next event
            </button>
          </div>
          <p className="hint">
            Sim to next event runs weeks in order — applying payroll, overhead, and theatrical
            revenue — and stops before the next thing that needs you: a release, a run ending, a
            contract change, or cash going negative.
          </p>
          {!canGreenlight && (
            <p className="hint">
              At the production cap ({active.length}). Advance weeks until a film releases before
              starting another.
            </p>
          )}
          {canGreenlight && !availability.canAssemble && (
            <p className="hint" data-testid="assemble-blocked-reason">
              {availability.reason}
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
        <h2>Finances</h2>
        <div className="row" style={{ gap: 24, flexWrap: 'wrap' }} data-testid="finances-card">
          <Metric label="Cash" small testid="fin-cash">
            <span className={fin.cash < 0 ? 'money neg' : 'money pos'}>{money(fin.cash)}</span>
          </Metric>
          <Metric label="Runway" small testid="fin-runway">
            {fin.runway.infinite ? '—' : `${fin.runway.weeks} wk`}
          </Metric>
          <Metric label="Weekly payroll" small testid="fin-payroll">
            {money(fin.weeklyPayroll)}
          </Metric>
          <Metric label="Weekly overhead" small testid="fin-overhead">
            {money(fin.weeklyOverhead)}
          </Metric>
          <Metric label="Weekly burn" small testid="fin-burn">
            {money(fin.weeklyBurn)}
          </Metric>
          <Metric label="Active-run revenue / wk" small testid="fin-run-revenue">
            {money(fin.expectedWeeklyRunRevenue)}
          </Metric>
          <Metric label="Net weekly" small testid="fin-net-weekly">
            <span className={fin.netWeeklyCash < 0 ? 'money neg' : 'money pos'}>
              {fin.netWeeklyCash >= 0 ? '+' : ''}
              {money(fin.netWeeklyCash)}
            </span>
          </Metric>
          <Metric label="In theaters" small testid="fin-active-runs">
            {fin.activeRuns}
          </Metric>
          <Metric label="Revenue still to come" small testid="fin-pipeline">
            {money(fin.pipelineRunRevenue)}
          </Metric>
        </div>
        <p className="hint" style={{ marginTop: 8 }}>
          Runway answers “how long can the studio last under its current commitments” — it never
          reserves cash for a film you haven’t greenlit. Studio Revenue is your rental share
          (about {Math.round((runs[0]?.studioShare ?? 0.52) * 100)}%) of box office, paid weekly
          across a film’s theatrical run — not the full gross.
        </p>
      </div>

      <div style={{ height: 16 }} />

      <div className="card">
        <h2>In theaters</h2>
        {runs.length === 0 ? (
          <div className="empty" data-testid="no-runs">
            No films in theaters. A released film pays Studio Revenue weekly across its run.
          </div>
        ) : (
          <div className="grid grid-2" data-testid="theatrical-runs">
            {runs.map((r) => (
              <TheatricalRunPanel
                key={r.productionId}
                run={r}
                title={findConcept(state, r.conceptId)?.title ?? r.conceptId}
              />
            ))}
          </div>
        )}
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
                    <span className="tag fact">In production</span>
                  </div>
                  <div className="row" style={{ marginTop: 8, gap: 24 }}>
                    <Metric label="Weeks left" small testid={`weeks-${p.id}`}>
                      {p.remainingTicks}
                    </Metric>
                    <Metric label="Expected total theatrical gross" small>
                      <span className="tag estimate" style={{ marginRight: 6 }}>
                        Est
                      </span>
                      {money(p.forecastSnapshot.expectedTotal)}
                    </Metric>
                    <Metric label="Expected critic score" small>
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
                <th className="num">Gross</th>
                <th className="num">Studio Rev</th>
                <th>Released</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {recent.map((f) => {
                const concept = findConcept(state, f.conceptId)
                const studioRev = studioRevenueForFilm(state, f.productionId)
                return (
                  <tr key={f.productionId} data-testid={`release-${f.productionId}`}>
                    <td>{concept?.title ?? f.conceptId}</td>
                    <td className="num">{score(f.criticScore)}</td>
                    <td className="num">{money(f.boxOffice.opening)}</td>
                    <td className="num">{money(f.boxOffice.total)}</td>
                    <td className="num" data-testid={`release-${f.productionId}-studiorev`}>
                      {studioRev === null ? '—' : money(studioRev)}
                    </td>
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

// One active theatrical run. Labels are unambiguous about state (P-secondary off-by-one fix):
// weekIndex = Studio-Revenue payments ALREADY received; nextWeekRevenue = the NEXT scheduled payment.
function TheatricalRunPanel({ run, title }: { run: RunView; title: string }) {
  return (
    <div className="panel" data-testid={`run-${run.productionId}`}>
      <div className="spread">
        <strong>{title ?? run.conceptId}</strong>
        <span className="tag fact">
          Payments received: {run.weekIndex} of {run.totalWeeks}
        </span>
      </div>
      <div className="row" style={{ marginTop: 8, gap: 24, flexWrap: 'wrap' }}>
        <Metric label="Next-week Studio Revenue" small testid={`run-${run.productionId}-thisweek`}>
          {money(run.nextWeekRevenue)}
        </Metric>
        <Metric label="Received to date" small testid={`run-${run.productionId}-received`}>
          {money(run.studioRevenuePaid)}
        </Metric>
        <Metric label="Still to come" small testid={`run-${run.productionId}-remaining`}>
          {money(run.remainingRevenue)}
        </Metric>
        <Metric label="Total gross" small>
          {money(run.totalGross)}
        </Metric>
        <Metric label="Total Studio Revenue" small testid={`run-${run.productionId}-total`}>
          {money(run.totalStudioRevenue)}
        </Metric>
      </div>
    </div>
  )
}
