// ── Newspaper release reveal (D-11.C, Phase 5.2A cycle-3) ─────────────────────
// The emotional headline layer shown once at a film's release. Renders an original
// fictional entertainment newspaper front page from the pure NewspaperView derivation
// (see src/core/newspaper.ts). Comprehensible in ~5 seconds: one dominant headline, a
// star line, an audience verdict, a restrained financial summary, and a couple of
// callouts — NOT a metrics wall. The detailed autopsy is the authoritative analysis and
// is one click away. Presentation only: no simulation logic, no RNG.

import type { NewspaperView } from '../engine/adapter.ts'
import { money } from '../format.ts'

// ── critic stars as ★ / ½ / ☆ to 5 ────────────────────────────────────────────
// stars is already in half-steps (criticStars, 0..5). Render filled ★, one optional
// half ½, then empty ☆ padding to five glyphs.
function StarGlyphs({ stars }: { stars: number }) {
  const full = Math.floor(stars)
  const half = stars - full >= 0.5
  const glyphs: string[] = []
  for (let i = 0; i < full; i++) glyphs.push('★')
  if (half) glyphs.push('½')
  while (glyphs.length < 5) glyphs.push('☆')
  return <span aria-hidden="true">{glyphs.join('')}</span>
}

// A profit/loss number colored via money pos|neg (text sign + color, never color alone).
function ProfitFigure({ value, label, testid = 'newspaper-profit' }: { value: number; label: string; testid?: string }) {
  const cls = value >= 0 ? 'money pos' : 'money neg'
  const sign = value >= 0 ? '' : '-'
  return (
    <span className={cls} data-testid={testid}>
      {sign}
      {money(Math.abs(value))} · {label}
    </span>
  )
}

// One secondary film — A9: every same-week release is EQUALLY inspectable. A secondary
// story is not just a headline: it carries the same reception + opening-vs-projected
// financials the lead story shows, plus a link to its own full autopsy. No metric a
// player needs to judge the film is hidden behind the lead story.
function SecondaryStory({
  view,
  index,
  onOpenAutopsy,
}: {
  view: NewspaperView
  index: number
  onOpenAutopsy: (index: number) => void
}) {
  const f = view.financial
  return (
    <div className="panel stack" data-testid={`newspaper-secondary-${index}`}>
      <div className="spread">
        <strong data-testid={`newspaper-secondary-title-${index}`}>{view.filmTitle}</strong>
        <button
          type="button"
          className="ghost"
          onClick={() => onOpenAutopsy(index)}
          data-testid={`newspaper-secondary-autopsy-${index}`}
        >
          Autopsy →
        </button>
      </div>
      <span className="hint">{view.headline}</span>
      <div className="row" style={{ gap: 24, flexWrap: 'wrap' }}>
        <span className="mono" data-testid={`newspaper-secondary-critic-${index}`}>
          Critics {view.critic.stars.toFixed(1)}/5 · {Math.round(view.critic.score)}/100
        </span>
        <span className="mono" data-testid={`newspaper-secondary-audience-${index}`}>
          Audiences: {view.audience.label}
        </span>
      </div>
      <div className="spread">
        <span>Opening gross</span>
        <span className="mono">{money(f.openingGross)}</span>
      </div>
      <div className="spread">
        <span>Studio Revenue paid this week</span>
        <span className="mono" data-testid={`newspaper-secondary-paid-${index}`}>
          {money(f.studioRevenueThisWeek)}
        </span>
      </div>
      <div className="spread">
        <span>Projected total theatrical gross</span>
        <span className="mono">{money(f.projectedTotalGross)}</span>
      </div>
      <div className="spread">
        <span>Projected total Studio Revenue</span>
        <span className="mono">{money(f.projectedTotalStudioRevenue)}</span>
      </div>
      <div className="spread">
        <span>Projected film contribution</span>
        <ProfitFigure
          value={f.projectedContribution}
          label={f.projectedContributionLabel}
          testid={`newspaper-secondary-contribution-${index}`}
        />
      </div>
    </div>
  )
}

export function NewspaperReveal({
  views,
  onOpenAutopsy,
  onContinue,
}: {
  views: NewspaperView[]
  onOpenAutopsy: (index: number) => void
  onContinue: () => void
}) {
  const primary = views[0]
  if (primary === undefined) {
    // Defensive: nothing released this beat. Still offer a way forward.
    return (
      <div className="app-shell">
        <div className="card stack">
          <p className="hint">No films released this week.</p>
          <div className="btn-row">
            <button type="button" className="primary" onClick={onContinue} data-testid="newspaper-continue">
              Continue
            </button>
          </div>
        </div>
      </div>
    )
  }

  const p = primary.critic
  const cast = primary.participants.cast
  const lead = cast.lead

  return (
    <div className="app-shell">
      <div className="card stack" data-testid="newspaper-reveal">
        {/* ── Masthead ── */}
        <div
          className="stack"
          style={{ borderBottom: '3px double currentColor', paddingBottom: 8, textAlign: 'center' }}
        >
          <span
            className="mark"
            data-testid="newspaper-masthead"
            style={{ fontSize: 34, letterSpacing: 2, lineHeight: 1.05 }}
          >
            {primary.masthead}
          </span>
          <span className="hint mono">Week {primary.week}</span>
        </div>

        {/* ── Primary story: the dominant headline ── */}
        <div className="stack" style={{ textAlign: 'center' }}>
          <h1
            data-testid="newspaper-headline"
            style={{ fontSize: 40, lineHeight: 1.05, margin: '8px 0 4px', textTransform: 'uppercase' }}
          >
            {primary.headline}
          </h1>
          <p className="hint" style={{ fontSize: 15 }}>
            {primary.subheadline}
          </p>
        </div>

        {/* ── Critic + audience verdicts, side by side ── */}
        <div className="grid grid-2">
          <div className="panel stack" data-testid="newspaper-critic">
            <span className="hint">Critics</span>
            <div className="row" style={{ gap: 8, alignItems: 'baseline' }}>
              <span style={{ fontSize: 26 }}>
                <StarGlyphs stars={p.stars} />
              </span>
              <strong className="mono" data-testid="newspaper-critic-stars">
                {p.stars.toFixed(1)}/5
              </strong>
              <span className="mono hint">{Math.round(p.score)}/100</span>
            </div>
          </div>
          <div className="panel stack" data-testid="newspaper-audience">
            <span className="hint">Audiences</span>
            <strong>{primary.audience.label}</strong>
          </div>
        </div>

        {/* ── Opening-day financials: PAID this week vs PROJECTED full run (P3) ── */}
        <div className="panel stack" data-testid="newspaper-financial">
          <span className="hint">Opening week — banked so far</span>
          <div className="spread">
            <span>Opening gross</span>
            <span className="mono">{money(primary.financial.openingGross)}</span>
          </div>
          <div className="spread">
            <span>Studio Revenue paid this week</span>
            <span className="mono" data-testid="newspaper-paid-this-week">
              {money(primary.financial.studioRevenueThisWeek)}
            </span>
          </div>
          <div className="sep" />
          <span className="hint">Projected — full theatrical run (not yet banked)</span>
          <div className="spread">
            <span>Projected total gross</span>
            <span className="mono">{money(primary.financial.projectedTotalGross)}</span>
          </div>
          <div className="spread">
            <span>Projected total Studio Revenue</span>
            <span className="mono">{money(primary.financial.projectedTotalStudioRevenue)}</span>
          </div>
          <div className="spread">
            <span>Studio Revenue still to come</span>
            <span className="mono">{money(primary.financial.studioRevenueStillToCome)}</span>
          </div>
          <div className="sep" />
          <div className="spread">
            <span>Total immediate commitment</span>
            <span className="mono">{money(primary.financial.totalCommitment)}</span>
          </div>
          <div className="spread">
            <span>Projected film contribution</span>
            <ProfitFigure
              value={primary.financial.projectedContribution}
              label={primary.financial.projectedContributionLabel}
            />
          </div>
          <span className="hint" style={{ fontSize: 10 }}>
            {primary.financial.disclosure}
          </span>
        </div>

        {/* ── Callouts (2–3 short lines) ── */}
        {primary.callouts.length > 0 && (
          <div className="stack" data-testid="newspaper-callouts">
            {primary.callouts.slice(0, 3).map((c, i) => (
              <span key={i} className="hint" data-testid={`newspaper-callout-${i}`}>
                • {c}
              </span>
            ))}
          </div>
        )}

        {/* ── Key names where space permits ── */}
        <div className="spread hint" data-testid="newspaper-participants">
          <span>Written by {primary.participants.writer.name}</span>
          <span>Directed by {primary.participants.director.name}</span>
          <span>Starring {lead.name}</span>
        </div>

        {/* ── Actions ── */}
        <div className="btn-row">
          <button
            type="button"
            className="accent"
            onClick={() => onOpenAutopsy(0)}
            data-testid="newspaper-open-autopsy"
          >
            Read the full autopsy
          </button>
          <button type="button" className="primary" onClick={onContinue} data-testid="newspaper-continue">
            Continue
          </button>
        </div>

        {/* ── Secondary films (if any) ── */}
        {views.length > 1 && (
          <div className="stack" data-testid="newspaper-secondary-list">
            <span className="hint">Also opening this week</span>
            {views.slice(1).map((v, i) => (
              <SecondaryStory key={i + 1} view={v} index={i + 1} onOpenAutopsy={onOpenAutopsy} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
