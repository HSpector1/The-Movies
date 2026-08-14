// ── Film Chronicle V1 release reveal ────────────────────────────────────────
// A deterministic studio one-sheet beside the existing truthful release story.
// All claims arrive through NewspaperView / FilmChronicleView; this screen adds
// presentation and session-aware navigation only.

import { useLayoutEffect, useRef } from 'react'
import type { ConstructionCompletionSummary, NewspaperView } from '../engine/adapter.ts'
import { money } from '../format.ts'
import { ConstructionCompletionNotice } from '../components/ConstructionCompletionNotice.tsx'
import { FilmPoster } from '../components/FilmPoster.tsx'

function StarGlyphs({ stars }: { stars: number }) {
  const full = Math.floor(stars)
  const half = stars - full >= 0.5
  const glyphs: string[] = []
  for (let i = 0; i < full; i++) glyphs.push('★')
  if (half) glyphs.push('½')
  while (glyphs.length < 5) glyphs.push('☆')
  return <span aria-hidden="true">{glyphs.join('')}</span>
}

function ProfitFigure({
  value,
  label,
  testid = 'newspaper-profit',
}: {
  value: number
  label: string
  testid?: string
}) {
  const cls = value >= 0 ? 'money pos' : 'money neg'
  const sign = value >= 0 ? '' : '-'
  return (
    <span className={cls} data-testid={testid}>
      {sign}
      {money(Math.abs(value))} · {label}
    </span>
  )
}

function SecondaryStory({
  view,
  index,
  autopsyAvailable,
  onOpenAutopsy,
  onOpenChronicle,
}: {
  view: NewspaperView
  index: number
  autopsyAvailable: boolean
  onOpenAutopsy: (index: number) => void
  onOpenChronicle?: ((index: number) => void) | undefined
}) {
  const f = view.financial
  return (
    <article className="panel stack" data-testid={`newspaper-secondary-${index}`}>
      <div className="spread">
        <strong data-testid={`newspaper-secondary-title-${index}`}>{view.filmTitle}</strong>
        {autopsyAvailable ? (
          <button
            type="button"
            className="ghost"
            onClick={() => onOpenAutopsy(index)}
            data-testid={`newspaper-secondary-autopsy-${index}`}
          >
            Autopsy →
          </button>
        ) : (
          <button
            type="button"
            className="ghost"
            onClick={() => onOpenChronicle?.(index)}
            disabled={!onOpenChronicle}
            data-testid={`newspaper-secondary-chronicle-${index}`}
          >
            Chronicle →
          </button>
        )}
      </div>
      <span className="hint">{view.headline}</span>
      <div className="row" style={{ gap: 24, flexWrap: 'wrap' }}>
        <span className="mono" data-testid={`newspaper-secondary-critic-${index}`}>
          Critics {view.critic.stars.toFixed(1)}/5 · {Math.round(view.critic.score)}/100
        </span>
        <span className="mono" data-testid={`newspaper-secondary-audience-${index}`}>
          Audiences: {view.audience.label} · {Math.round(view.audience.score)}/100
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
        <span>Studio Revenue still to come</span>
        <span className="mono" data-testid={`newspaper-secondary-still-to-come-${index}`}>
          {money(f.studioRevenueStillToCome)}
        </span>
      </div>
      <div className="spread">
        <span>Total immediate commitment</span>
        <span className="mono" data-testid={`newspaper-secondary-commitment-${index}`}>
          {money(f.totalCommitment)}
        </span>
      </div>
      <div className="spread">
        <span>Projected film contribution</span>
        <ProfitFigure
          value={f.projectedContribution}
          label={f.projectedContributionLabel}
          testid={`newspaper-secondary-contribution-${index}`}
        />
      </div>
      <span className="hint" style={{ fontSize: 10 }}>
        {f.disclosure}
      </span>
    </article>
  )
}

export function NewspaperReveal({
  views,
  constructionCompletion,
  canOpenAutopsy,
  onOpenAutopsy,
  onOpenChronicle,
  onContinue,
}: {
  views: NewspaperView[]
  constructionCompletion?: ConstructionCompletionSummary | null
  canOpenAutopsy?: ((index: number) => boolean) | undefined
  onOpenAutopsy: (index: number) => void
  onOpenChronicle?: ((index: number) => void) | undefined
  onContinue: () => void
}) {
  const headingRef = useRef<HTMLHeadingElement | null>(null)
  const primary = views[0]

  useLayoutEffect(() => {
    // App screens share one document instead of a router, so a dashboard action
    // can otherwise carry its deep scroll position into this new release surface.
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
    // A just-completed facility owns the first announcement/focus beat on this
    // release screen. Otherwise enter at the Chronicle's film-title heading.
    if (!constructionCompletion) headingRef.current?.focus({ preventScroll: true })
  }, [primary?.chronicle.productionId, constructionCompletion])

  if (primary === undefined) {
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
  const primaryAutopsyAvailable = canOpenAutopsy?.(0) ?? true
  const credits = primary.chronicle.credits

  return (
    <main className="app-shell film-chronicle-screen">
      {constructionCompletion && <ConstructionCompletionNotice completion={constructionCompletion} />}

      <div className="film-chronicle-lead">
        <FilmPoster view={primary.chronicle} titleAsHeading titleRef={headingRef} />

        <article className="film-chronicle-newspaper" data-testid="newspaper-reveal">
          <header className="film-chronicle-masthead">
            <span className="film-chronicle-masthead__name" data-testid="newspaper-masthead">
              {primary.masthead}
            </span>
            <span className="film-chronicle-masthead__date">Week {primary.week} · Evening Edition</span>
          </header>

          <h2
            className="film-chronicle-headline"
            data-testid="newspaper-headline"
          >
            {primary.headline}
          </h2>
          <p className="film-chronicle-deck">{primary.subheadline}</p>

          <div className="film-chronicle-columns">
            <div className="film-chronicle-column stack">
              <section className="panel stack" data-testid="newspaper-critic">
                <span className="hint">Critics</span>
                <div className="row" style={{ gap: 8, alignItems: 'baseline', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 26 }}>
                    <StarGlyphs stars={p.stars} />
                  </span>
                  <strong className="mono" data-testid="newspaper-critic-stars">
                    {p.stars.toFixed(1)}/5
                  </strong>
                  <span className="mono hint">{Math.round(p.score)}/100</span>
                </div>
              </section>

              <section className="panel stack" data-testid="newspaper-audience">
                <span className="hint">Audiences</span>
                <strong>{primary.audience.label}</strong>
                <span className="mono">{Math.round(primary.audience.score)}/100</span>
              </section>

              {primary.callouts.length > 0 && (
                <section className="stack" data-testid="newspaper-callouts">
                  <strong>From the review desk</strong>
                  {primary.callouts.slice(0, 3).map((callout, index) => (
                    <span key={index} className="hint" data-testid={`newspaper-callout-${index}`}>
                      • {callout}
                    </span>
                  ))}
                </section>
              )}

              <section className="stack" data-testid="newspaper-participants">
                <strong>Production credits</strong>
                {credits.available ? (
                  <>
                    <span>Written by {credits.participants.writer.name}</span>
                    <span>Directed by {credits.participants.director.name}</span>
                    <span>Starring {credits.participants.cast.lead.name}</span>
                  </>
                ) : (
                  <span className="hint">{credits.message}</span>
                )}
              </section>
            </div>

            <section className="film-chronicle-column stack" data-testid="newspaper-financial">
              <strong>Opening-week ledger</strong>
              <span className="hint">Banked so far</span>
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
              <span className="hint">Projected full theatrical run — not yet banked</span>
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
            </section>
          </div>

          <div className="btn-row" style={{ marginTop: 20 }}>
            {primaryAutopsyAvailable ? (
              <button
                type="button"
                className="accent"
                onClick={() => onOpenAutopsy(0)}
                data-testid="newspaper-open-autopsy"
              >
                Read the full autopsy
              </button>
            ) : (
              <button
                type="button"
                className="accent"
                onClick={() => onOpenChronicle?.(0)}
                disabled={!onOpenChronicle}
                data-testid="newspaper-open-chronicle"
              >
                Open Film Chronicle
              </button>
            )}
            <button type="button" className="primary" onClick={onContinue} data-testid="newspaper-continue">
              Continue
            </button>
          </div>
        </article>
      </div>

      {views.length > 1 && (
        <section className="film-chronicle-newspaper stack" data-testid="newspaper-secondary-list">
          <h2>Also opening this week</h2>
          <div className="film-chronicle-secondary-grid">
            {views.slice(1).map((view, offset) => {
              const index = offset + 1
              return (
                <SecondaryStory
                  key={view.chronicle.productionId}
                  view={view}
                  index={index}
                  autopsyAvailable={canOpenAutopsy?.(index) ?? true}
                  onOpenAutopsy={onOpenAutopsy}
                  onOpenChronicle={onOpenChronicle}
                />
              )
            })}
          </div>
        </section>
      )}
    </main>
  )
}
