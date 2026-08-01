// ── D-14 Phase 2 — Career Impact (the canonical development + Star Power view) ─
//
// Renders ONLY the frozen TalentCareerEvent records (via filmCareerImpact). It never
// recomputes a delta from present talent state. This is the single canonical
// presentation used by BOTH the film Autopsy and (per row) the Talent Profile history.

import { useState } from 'react'
import type { CareerImpactRow, FilmCareerImpact } from '../engine/careerImpact.ts'
import { deltaText } from '../engine/careerImpact.ts'

function BeforeAfter({ label, before, after, decimals, testid }: { label: string; before: number; after: number; decimals: number; testid?: string }) {
  const delta = after - before
  const b = before.toFixed(decimals)
  const a = after.toFixed(decimals)
  return (
    <div className="ci-row" data-testid={testid}>
      <span className="ci-label">{label}</span>
      {/* frozen before/after values are shown INDEPENDENTLY — never recomputed from a rounded delta */}
      <span className="ci-values">
        {b} <span aria-hidden="true">→</span> {a}
      </span>
      <span className="ci-delta" data-testid={testid ? `${testid}-delta` : undefined}>
        {deltaText(delta, decimals)}
      </span>
    </div>
  )
}

export function CareerImpactCard({ row }: { row: CareerImpactRow }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="card ci-card" data-testid={`career-impact-${row.talentId}`}>
      <div className="ci-head">
        <strong data-testid={`career-impact-name-${row.talentId}`}>{row.name}</strong>
        <span className="hint">
          {row.role} · {row.disciplineLabel}
        </span>
      </div>

      <BeforeAfter label="OVR" before={row.ovrBefore} after={row.ovrAfter} decimals={0} testid={`career-impact-ovr-${row.talentId}`} />
      <BeforeAfter label="Star Power" before={row.starPowerBefore} after={row.starPowerAfter} decimals={1} testid={`career-impact-starpower-${row.talentId}`} />

      {/* Changed visible skills (default view shows only what moved). */}
      {row.changedSkills.map((s) => (
        <BeforeAfter key={s.name} label={s.name} before={s.before} after={s.after} decimals={0} testid={`career-impact-skill-${row.talentId}-${s.name}`} />
      ))}

      {row.genreExpChanged && (
        <BeforeAfter label={`${row.genreLabel} experience`} before={row.genreExpBefore} after={row.genreExpAfter} decimals={0} />
      )}

      {/* Why it changed — translated player-facing sentences (never raw reason codes). */}
      <div className="ci-why">
        <span className="ci-label">Why it changed</span>
        <ul>
          {row.reasons.map((r, i) => (
            <li key={i} data-testid={`career-impact-reason-${row.talentId}`}>
              {r}
            </li>
          ))}
        </ul>
      </div>

      <button
        type="button"
        className="linkish"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        data-testid={`career-impact-toggle-${row.talentId}`}
      >
        {open ? 'Hide exact detail' : 'Show exact detail'}
      </button>
      {open && (
        <div className="ci-detail" data-testid={`career-impact-detail-${row.talentId}`}>
          <div className="hint">
            Reached {row.realizedTotal >= 1_000_000 ? `$${(row.realizedTotal / 1_000_000).toFixed(1)}M` : `$${Math.round(row.realizedTotal / 1000)}k`} · audience{' '}
            {Math.round(row.audienceScore)} · critic {Math.round(row.criticScore)}
          </div>
          <table>
            <thead>
              <tr>
                <th>Skill</th>
                <th>Before</th>
                <th>After</th>
                <th>Change</th>
              </tr>
            </thead>
            <tbody>
              {row.allSkills.map((s) => (
                <tr key={s.name}>
                  <td>{s.name}</td>
                  <td>{s.before}</td>
                  <td>{s.after}</td>
                  <td>{deltaText(s.delta, 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

/** The film-centric Career Impact section (Autopsy) — reads only frozen events. */
export function CareerImpact({ impact }: { impact: FilmCareerImpact }) {
  return (
    <section className="career-impact" data-testid="career-impact" aria-labelledby="career-impact-heading">
      <h3 id="career-impact-heading">Career Impact</h3>
      {impact.available ? (
        impact.rows.map((row) => <CareerImpactCard key={row.eventId} row={row} />)
      ) : (
        <div className="card" data-testid="career-impact-unavailable">
          <p>
            Detailed career impact was not recorded for this release. Career history is tracked from
            SaveFileV5 forward.
          </p>
        </div>
      )}
    </section>
  )
}
