// ── Film record (D-11.A) — the post-reload/archived autopsy ──────────────────
// After a save/reload the per-session pre-tick snapshot is gone, so the full autopsy
// (reception reconstruction) cannot run. But the film's IMMUTABLE participant record and
// its result persist on the FilmResult (V3), so this screen still shows WHO made the film
// (the identity the owner needs preserved) and how it did. Renders ONLY from the film's
// own frozen record — never current roster/employment/other films.

import type { FilmRecordView, FilmParticipant } from '../engine/adapter.ts'
import type { FilmCareerImpact } from '../engine/careerImpact.ts'
import { CareerImpact } from '../components/CareerImpact.tsx'
import { money, moneyExact, score } from '../format.ts'
import { Metric } from '../components/common.tsx'

const PART_ROLE_LABEL: Record<FilmParticipant['role'], string> = {
  writer: 'Writer',
  director: 'Director',
  lead: 'Lead',
  antagonist: 'Antagonist',
  support: 'Support',
  craft: 'Production/Craft Lead',
}

export function FilmRecord({
  view,
  careerImpact,
  onOpenProfile,
  onBack,
}: {
  view: FilmRecordView
  careerImpact?: FilmCareerImpact
  onOpenProfile?: ((id: string) => void) | undefined
  onBack: () => void
}) {
  const impact: FilmCareerImpact = careerImpact ?? { available: false, filmId: view.productionId }
  const p = view.participants
  const rows: FilmParticipant[] = [p.writer, p.director, p.cast.lead, p.cast.antagonist, p.cast.support, ...p.craft]
  const profitPositive = view.profit >= 0
  // D-17A/T2: while the run is still paying out, this is a FULL-RUN figure the studio has not
  // banked. The label says so rather than presenting unreceived money as a result.
  const word = `${view.projected ? 'Projected ' : ''}${profitPositive ? 'Profit' : 'Loss'}`
  return (
    <div className="app-shell" data-testid="film-record">
      <div className="topbar">
        <div className="brand">
          <span className="mark">FILM RECORD</span>
          <span className="sub">{view.conceptTitle}</span>
        </div>
        <button className="primary" onClick={onBack} data-testid="film-record-back">
          Back to studio
        </button>
      </div>

      <div className="card">
        <div className="row" style={{ gap: 24, flexWrap: 'wrap' }}>
          <Metric label="Critic" small testid="record-critic">
            {score(view.criticScore)}
          </Metric>
          <Metric label="Box office" small>
            {money(view.boxOffice.total)}
          </Metric>
          <Metric label="Committed cost" small>
            {moneyExact(view.committedCost)}
          </Metric>
          {/* D-17A FIX-PASS (R7): this figure is Studio Revenue − the film's DIRECT committed
              cost (D-12 §3/§8); payroll and overhead are never allocated into it, and this
              screen shows no studio-economic counterpart. The label names the basis so the word
              "Profit" here cannot be read as the studio-economic "Profit" on the greenlight
              screen. */}
          <Metric
            label={
              view.projected
                ? 'Projected direct profit / loss (full run, before studio fixed costs)'
                : 'Direct profit / loss (before studio fixed costs)'
            }
            small
            testid="record-profit"
          >
            <span className={profitPositive ? 'money pos' : 'money neg'}>
              {word} {moneyExact(view.profit)}
            </span>
          </Metric>
        </div>
        <p className="hint" style={{ marginTop: 8 }}>
          An archived record from a reloaded save — this film&rsquo;s own frozen cast &amp; crew and
          result. (The full scene-by-scene autopsy is available only for films released during the
          live session.)
        </p>
      </div>

      <div style={{ height: 16 }} />

      <div className="card" data-testid="record-participants">
        <h2>Who made this film</h2>
        <table className="data">
          <thead>
            <tr>
              <th>Role</th>
              <th>Name</th>
              <th>Employment</th>
              <th className="num">Greenlight OVR</th>
              <th className="num">Fit</th>
              <th className="num">Expected</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={`${r.role}-${r.talentId}`} data-testid={`record-participant-${r.talentId}`}>
                <td>{PART_ROLE_LABEL[r.role]}</td>
                <td data-testid={`record-participant-name-${r.role}`}>
                  {onOpenProfile ? (
                    <button type="button" className="linkish" data-testid={`autopsy-open-profile-${r.talentId}`} onClick={() => onOpenProfile(r.talentId)}>
                      {r.name}
                    </button>
                  ) : (
                    r.name
                  )}
                </td>
                <td>{r.freelancer ? 'Freelancer' : 'Studio'}</td>
                <td className="num">{r.greenlightOVR}</td>
                <td className="num">{r.greenlightFit}</td>
                <td className="num">
                  {r.greenlightEP.low.toFixed(0)}–{r.greenlightEP.high.toFixed(0)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ height: 16 }} />

      {/* D-14: Career Impact survives reload (frozen events), so it appears on the archived record too. */}
      <CareerImpact impact={impact} />
    </div>
  )
}
