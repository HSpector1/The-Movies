// ── Film Chronicle V1 — durable released-film record ────────────────────────
// The exact one-sheet/creative history comes from the pure Chronicle projection.
// Result economics and Career Impact retain their existing authoritative sources.

import { useEffect, useRef } from 'react'
import type { FilmRecordView, FilmParticipant } from '../engine/adapter.ts'
import type { FilmCareerImpact } from '../engine/careerImpact.ts'
import { CareerImpact } from '../components/CareerImpact.tsx'
import { FilmPoster } from '../components/FilmPoster.tsx'
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
  const headingRef = useRef<HTMLHeadingElement | null>(null)
  useEffect(() => {
    headingRef.current?.focus()
  }, [view.productionId])

  const impact: FilmCareerImpact = careerImpact ?? { available: false, filmId: view.productionId }
  const credits = view.chronicle.credits
  const rows: FilmParticipant[] = credits.available
    ? [
        credits.participants.writer,
        credits.participants.director,
        credits.participants.cast.lead,
        credits.participants.cast.antagonist,
        credits.participants.cast.support,
        ...credits.participants.craft,
      ]
    : []
  const profitPositive = view.profit >= 0
  const word = `${view.projected ? 'Projected ' : ''}${profitPositive ? 'Profit' : 'Loss'}`

  return (
    <main className="app-shell film-chronicle-screen" data-testid="film-record">
      <div className="topbar">
        <div className="brand">
          <h1 ref={headingRef} tabIndex={-1} className="mark" style={{ margin: 0 }}>
            FILM CHRONICLE
          </h1>
          <span className="sub">{view.conceptTitle}</span>
        </div>
        <button className="primary" onClick={onBack} data-testid="film-record-back">
          Back to studio
        </button>
      </div>

      <div className="film-chronicle-lead">
        <FilmPoster view={view.chronicle} />

        <div className="stack">
          <section className="card stack">
            <div className="spread" style={{ alignItems: 'baseline', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <span className="mark">ARCHIVE · RELEASE WEEK {view.chronicle.productionRecord.available ? view.chronicle.productionRecord.releaseWeek : '—'}</span>
                <h2 style={{ margin: '6px 0 0' }}>{view.conceptTitle}</h2>
              </div>
              <span className="tag result">{view.chronicle.reception.audience.label}</span>
            </div>

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
              This durable Chronicle is reconstructed from the film&rsquo;s frozen production
              record. The full mathematical autopsy remains available only when this session
              retains the studio state from immediately before release.
            </p>
          </section>

          <section className="card" data-testid="record-participants">
            <h2>Who made this film</h2>
            {credits.available ? (
              <div style={{ overflowX: 'auto' }}>
                <table className="data">
                  <thead>
                    <tr>
                      <th>Role</th>
                      <th>Name</th>
                      <th>Status at greenlight</th>
                      <th className="num">Greenlight OVR</th>
                      <th className="num">Fit</th>
                      <th className="num">Expected</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((participant) => (
                      <tr
                        key={`${participant.role}-${participant.talentId}`}
                        data-testid={`record-participant-${participant.talentId}`}
                      >
                        <td>{PART_ROLE_LABEL[participant.role]}</td>
                        <td data-testid={`record-participant-name-${participant.role}`}>
                          {onOpenProfile ? (
                            <button
                              type="button"
                              className="linkish"
                              data-testid={`autopsy-open-profile-${participant.talentId}`}
                              onClick={() => onOpenProfile(participant.talentId)}
                            >
                              {participant.name}
                            </button>
                          ) : (
                            participant.name
                          )}
                        </td>
                        <td>{participant.freelancer ? 'Freelancer' : 'Studio'}</td>
                        <td className="num">{participant.greenlightOVR}</td>
                        <td className="num">{participant.greenlightFit}</td>
                        <td className="num">
                          {participant.greenlightEP.low.toFixed(0)}–{participant.greenlightEP.high.toFixed(0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="empty" data-testid="record-participants-unavailable">
                {credits.message}
              </p>
            )}
          </section>
        </div>
      </div>

      <CareerImpact impact={impact} />
    </main>
  )
}
