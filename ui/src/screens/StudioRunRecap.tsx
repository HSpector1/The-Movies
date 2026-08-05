// ── D-15 Studio Run Recap — read-only run explainer ───────────────────────────
// A management summary (NOT a debug dump) that answers: what happened, where the money
// went, which films helped or hurt, who is improving, how concentrated the strategy was,
// and whether the studio can make another film / whether waiting helps. Renders ONLY from
// the pure `studioRunRecap` read-model (adapter → core) and formats every player-facing
// value with the shared money()/signed() formatters (the read-model returns raw numbers).
// Accessible: semantic headings, tables, signed values as text (never color alone),
// keyboard-operable, a cash chart with a textual equivalent, prioritised warnings.

import type { ReactNode } from 'react'
import type { GameState, StudioRunRecap as Recap, RecapFilm, RecapTalent, RecapWarning, InflectionPoint, RecoveryPosition } from '../engine/adapter.ts'
import { studioRunRecap } from '../engine/adapter.ts'
import { money, moneyExact, score, pct } from '../format.ts'
import { Metric, Delta } from '../components/common.tsx'

const RECOVERY_LABEL: Record<RecoveryPosition, string> = {
  healthy: 'Healthy',
  constrained: 'Constrained but recoverable',
  severe: 'Severe recovery position',
  noNormalProduction: 'Normal production unavailable',
  incomplete: 'State incomplete',
}
const SEVERITY_LABEL: Record<RecapWarning['severity'], string> = {
  important: 'Important',
  caution: 'Caution',
  observation: 'Observation',
}
const FILM_CLASS_LABEL: Record<RecapFilm['classification'], string> = {
  positive: 'Profit',
  breakEven: 'Break-even',
  loss: 'Loss',
  unknown: 'Unavailable',
}
const MAX_PRIMARY_WARNINGS = 3

function cap(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s
}
// signed money with color AND an explicit +/- sign (never color alone — a11y).
function money$(n: number): string {
  return `${n >= 0 ? '+' : ''}${money(n)}`
}
function SignedMoney({ value, testid }: { value: number; testid?: string }) {
  return (
    <span className={value < 0 ? 'money neg' : 'money pos'} {...(testid ? { 'data-testid': testid } : {})}>
      {money$(value)}
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

// ── player-facing Key Moment sentence (composed here, with formatting) ──
function inflectionContent(p: InflectionPoint, r: Recap): { heading: string; body: string } {
  const wk = p.week != null ? `Week ${p.week} — ` : ''
  switch (p.kind) {
    case 'openingBalance':
      return { heading: 'Opening balance', body: `The studio began with ${money(p.value)}.` }
    case 'peakCash':
      return { heading: `${wk}Highest cash`, body: `Cash peaked at ${money(p.value)}.` }
    case 'lowestCash':
      return { heading: `${wk}Lowest cash`, body: `Cash bottomed at ${money(p.value)}.` }
    case 'firstLoss':
      return { heading: `${wk}First loss`, body: `“${p.filmTitle}” lost ${money(Math.abs(p.value))} in film contribution.` }
    case 'firstTypicalUnaffordable':
      return {
        heading: `${wk}Recent-normal production became unaffordable`,
        body: `Cash first fell below your recent typical commitment of ${money(r.position.typicalRecent?.commitment ?? 0)}.`,
      }
    case 'bestContribution':
      return { heading: `${wk}Best film contribution`, body: `“${p.filmTitle}” added ${money(p.value)} in film contribution.` }
    case 'worstContribution':
      return { heading: `${wk}Worst film contribution`, body: `“${p.filmTitle}” lost ${money(Math.abs(p.value))} in film contribution.` }
    case 'strongestDevelopment':
      return { heading: 'Strongest talent development', body: `${p.talentName} improved by +${p.value} OVR across the run.` }
  }
}

// ── player-facing warning text (composed here, with formatting) ──
function warningContent(w: RecapWarning, r: Recap): { title: string; body: string; evidence: string } {
  const p = r.position
  const s = r.summary
  const typical = p.typicalRecent?.commitment ?? 0
  const cheapest = p.cheapest?.commitment ?? 0
  switch (w.code) {
    case 'cashPositiveButNormalUnaffordable':
      return {
        title: 'Cash positive, but your usual film is out of reach',
        body: 'Your balance is positive, but a film at your recent typical commitment is not affordable. “Cash positive” is not the same as “able to finance your next normal film.”',
        evidence: `Cash ${moneyExact(p.currentCash)} vs recent typical commitment ${money(typical)} (short ${money(p.typicalRecent?.shortfall ?? 0)}).`,
      }
    case 'waitingBurnsCash':
      return {
        title: 'Waiting reduces your cash',
        body: `Waiting alone worsens the position${p.hasActiveRevenue ? '' : ' — no active theatrical run is generating revenue'}. Fixed costs reduce cash by about ${money(-p.netWeeklyCash)} per week.`,
        evidence: `Revenue ${money(p.activeRunRevenue)}/wk − burn ${money(p.currentWeeklyBurn)}/wk = ${money$(p.netWeeklyCash)}/wk.`,
      }
    case 'oneMoreFailureNarrowsOptions':
      return {
        title: 'Another comparable loss would narrow options',
        body: 'Another loss similar to your recent losses would reduce normal production options further.',
        evidence: `${s.lossFilmCount} of ${s.releasedFilmCount} films lost money.`,
      }
    case 'contractsOutliveRunway':
      return {
        title: 'Contracts outlast your cash',
        body: 'You cannot wait for current contracts to expire — they end after cash would run out under current fixed costs.',
        evidence: `Contracts expire in ~${p.weeksUntilLastContractExpires ?? '—'} wks; fixed-cost runway ~${p.fixedCostRunwayWeeks ?? '—'} wks.`,
      }
    case 'noActiveRevenue':
      return {
        title: 'No active theatrical revenue',
        body: 'No theatrical run is currently in its paying weeks, so nothing offsets weekly fixed costs.',
        evidence: `Weekly burn ${money(p.currentWeeklyBurn)}.`,
      }
    case 'repeatedLosses':
      return {
        title: 'Repeated losses',
        body: `${s.lossFilmCount} of ${s.releasedFilmCount} films lost money, with a streak of ${s.longestLossStreak} in a row.`,
        evidence: `Longest loss streak ${s.longestLossStreak}.`,
      }
    case 'optionsBelowTypical':
      return {
        title: 'Affordable options below your usual',
        body: `Your affordable options (~${money(cheapest)}) are materially below your recent typical commitment (~${money(typical)}).`,
        evidence: `Shortfall vs typical ${money(p.typicalRecent?.shortfall ?? 0)}.`,
      }
    case 'highGenreConcentration':
      return {
        title: 'High genre concentration',
        body: `${pct(r.concentration.topGenre?.share ?? 0)} of releases were ${cap(r.concentration.topGenre?.key ?? '')} — this concentrates exposure to the same audience assumptions.`,
        evidence: `${r.concentration.topGenre?.count ?? 0} of ${r.concentration.filmCount} releases.`,
      }
    case 'highLeadConcentration':
      return {
        title: 'High lead concentration',
        body: `${r.concentration.topLead?.key ?? ''} led ${r.concentration.topLead?.count ?? 0} of ${r.concentration.filmCount} releases.`,
        evidence: `${pct(r.concentration.topLead?.share ?? 0)} of releases.`,
      }
  }
}

// ── compact cash-over-time line chart (inline SVG; no external dep) ──
// Annotations are RIGHT-ALIGNED inside the viewBox (reserved right padding + textAnchor
// "end"), so the full label text can never clip at the canvas boundary at any viewport/zoom.
const CHART_W = 720
function CashChart({ recap }: { recap: Recap }) {
  const { openingBalance, cashTimeline, currentCash } = recap.capital
  const throughWeek = recap.summary.throughWeek
  if (cashTimeline.length === 0) return <p className="empty">No weekly cash history recorded yet.</p>
  const firstWeek = cashTimeline[0]!.week
  const lastWeek = cashTimeline[cashTimeline.length - 1]!.week
  const cashes = cashTimeline.map((p) => p.cash)
  const yMax = Math.max(openingBalance, ...cashes)
  const yMin = Math.min(0, ...cashes)
  const W = CHART_W, H = 240, padL = 76, padR = 120, padT = 20, padB = 34
  const plotW = W - padL - padR, plotH = H - padT - padB
  const RIGHT = W - padR // plot right edge; annotations sit in the reserved [RIGHT, W] margin
  const EDGE = W - 8 // right-aligned annotations end here — always inside the viewBox
  const x = (w: number) => padL + ((w - firstWeek) / Math.max(1, lastWeek - firstWeek)) * plotW
  const y = (c: number) => padT + (1 - (c - yMin) / Math.max(1, yMax - yMin)) * plotH
  const linePts = cashTimeline.map((p) => `${x(p.week).toFixed(1)},${y(p.cash).toFixed(1)}`).join(' ')
  const low = cashTimeline.reduce((a, b) => (b.cash < a.cash ? b : a))
  const last = cashTimeline[cashTimeline.length - 1]!
  const yOpen = y(openingBalance)
  const lowX = x(low.week)
  // choose the low label's anchor by position so it never clips at either edge
  const lowAnchor: 'start' | 'middle' | 'end' = lowX > RIGHT - 48 ? 'end' : lowX < padL + 48 ? 'start' : 'middle'
  const caption =
    `Opening balance was ${money(openingBalance)}. The chart then shows ${cashTimeline.length} recorded weekly ` +
    `closing balances, from the end of Week ${firstWeek} through the end of Week ${lastWeek}.`
  const ariaLabel =
    `Cash history through week ${throughWeek}: opened at ${money(openingBalance)} before commitments, ` +
    `${money(currentCash)} now, low point ${money(low.cash)} at the end of week ${low.week}.`
  return (
    <figure style={{ margin: 0 }} data-testid="recap-cash-chart">
      <svg
        role="img"
        aria-label={ariaLabel}
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ width: '100%', height: 'auto', maxWidth: W, display: 'block' }}
      >
        {[yMin, (yMin + yMax) / 2, yMax].map((c) => (
          <g key={`t${c}`}>
            <line x1={padL} y1={y(c)} x2={RIGHT} y2={y(c)} stroke="var(--border)" strokeWidth="1" opacity="0.4" />
            <text x={padL - 8} y={y(c) + 4} textAnchor="end" fontSize="11" fill="var(--text-dim)">{money(c)}</text>
          </g>
        ))}
        {/* opening-balance reference (dashed) + right-aligned label INSIDE the canvas */}
        <line x1={padL} y1={yOpen} x2={RIGHT} y2={yOpen} stroke="var(--accent)" strokeDasharray="4 3" strokeWidth="1" />
        <text x={EDGE} y={yOpen - 6} textAnchor="end" fontSize="11" fill="var(--accent)">Opening {money(openingBalance)}</text>
        {/* cash line (end-of-week closes) */}
        <polyline points={linePts} fill="none" stroke="var(--accent)" strokeWidth="2" />
        {/* current marker + right-aligned label */}
        <circle cx={x(last.week)} cy={y(last.cash)} r="4" fill="var(--text)" />
        <text x={EDGE} y={y(last.cash) + 4} textAnchor="end" fontSize="11" fill="var(--text)">Now {money(last.cash)}</text>
        {/* low marker + position-aware anchored label */}
        <circle cx={lowX} cy={y(low.cash)} r="4" fill="var(--neg)" />
        <text x={lowX} y={y(low.cash) + 18} textAnchor={lowAnchor} fontSize="11" fill="var(--neg)">Low {money(low.cash)}</text>
        {/* x-axis endpoints */}
        <text x={padL} y={H - 8} fontSize="11" fill="var(--text-dim)">End Wk {firstWeek}</text>
        <text x={RIGHT} y={H - 8} textAnchor="end" fontSize="11" fill="var(--text-dim)">End Wk {lastWeek}</text>
      </svg>
      <figcaption className="hint" data-testid="recap-cash-chart-summary">{caption}</figcaption>
    </figure>
  )
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
  const primaryWarnings = r.warnings.slice(0, MAX_PRIMARY_WARNINGS)
  const secondaryWarnings = r.warnings.slice(MAX_PRIMARY_WARNINGS)

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
          <Metric label="Run through" small testid="recap-through-week">Week {summary.throughWeek}</Metric>
          <Metric label="Starting cash" small>{moneyExact(summary.startingCash)}</Metric>
          <Metric label="Current cash" small testid="recap-current-cash">{moneyExact(summary.currentCash)}</Metric>
          <Metric label="Net cash change" small testid="recap-cash-change"><SignedMoney value={summary.cashChange} /></Metric>
          <Metric label="Films released" small testid="recap-film-count">{summary.releasedFilmCount}</Metric>
          <Metric label="Profit / break-even / loss" small testid="recap-pbl-count">
            {summary.profitableFilmCount} / {summary.breakEvenFilmCount} / {summary.lossFilmCount}
          </Metric>
          <Metric label="Total film contribution" small testid="recap-total-contribution"><SignedMoney value={summary.totalFilmContribution} /></Metric>
          <Metric label="Avg critic" small>{summary.avgCriticScore != null ? score(summary.avgCriticScore) : '—'}</Metric>
          <Metric label="Avg audience" small>{summary.avgAudienceScore != null ? score(summary.avgAudienceScore) : '—'}</Metric>
        </div>
        <details style={{ marginTop: 10 }}>
          <summary>More detail</summary>
          <div className="row" style={{ gap: 24, flexWrap: 'wrap', marginTop: 8 }}>
            <Metric label="Total box office" small>{money(summary.totalBoxOfficeGross)}</Metric>
            <Metric label="Total studio revenue" small>{money(summary.totalStudioRevenue)}</Metric>
            <Metric label="Best film" small>{summary.bestFilm ? `${summary.bestFilm.title} (${money$(summary.bestFilm.contribution)})` : '—'}</Metric>
            <Metric label="Worst film" small>{summary.worstFilm ? `${summary.worstFilm.title} (${money$(summary.worstFilm.contribution)})` : '—'}</Metric>
            <Metric label="Longest loss streak" small>{summary.longestLossStreak}</Metric>
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
            <Metric label="Production commitments" small>{moneyExact(capital.totalCommitments)}</Metric>
            <Metric label="Studio theatrical revenue" small>{moneyExact(capital.totalStudioRevenue)}</Metric>
            <Metric label="Net film contribution" small testid="recap-capital-contribution"><SignedMoney value={capital.totalFilmContribution} /></Metric>
          </div>
          <div className="inset">
            <h3 style={{ marginTop: 0 }}>Staffing &amp; overhead</h3>
            <Metric label="Payroll paid (run)" small>{moneyExact(capital.totalPayroll)}</Metric>
            <Metric label="Overhead paid (run)" small>{moneyExact(capital.totalOverhead)}</Metric>
            <Metric label="Weekly cash drain" small testid="recap-weekly-burn">{moneyExact(capital.currentWeeklyBurn)} / wk</Metric>
            <p className="hint" style={{ margin: '2px 0 0' }}>
              Payroll {money(capital.currentWeeklyPayroll)} · Overhead {money(capital.currentWeeklyOverhead)}
            </p>
          </div>
        </div>

        <div style={{ marginTop: 14 }}>
          <h3>Cash history through Week {summary.throughWeek}</h3>
          <CashChart recap={r} />
        </div>

        {r.inflectionPoints.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <h3>Key moments</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }} data-testid="recap-inflections">
              {r.inflectionPoints.map((p, i) => {
                const c = inflectionContent(p, r)
                return (
                  <li key={`${p.kind}-${i}`} style={{ marginBottom: 6 }}>
                    <strong>{c.heading}</strong> — {c.body}
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        <details style={{ marginTop: 12 }}>
          <summary data-testid="recap-weekly-toggle">View {capital.cashTimeline.length} weekly closing balances</summary>
          <div style={{ overflowX: 'auto' }}>
            <table className="data" data-testid="recap-cash-timeline" style={{ marginTop: 8 }}>
              <thead>
                <tr><th>Cash checkpoint</th><th className="num">Balance</th></tr>
              </thead>
              <tbody>
                <tr><td>Opening balance</td><td className="num">{moneyExact(capital.openingBalance)}</td></tr>
                {capital.cashTimeline.map((c) => (
                  <tr key={c.week}><td>End of Week {c.week}</td><td className="num">{moneyExact(c.cash)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </Section>

      <div style={{ height: 16 }} />

      {/* ── C. Film slate ── */}
      <Section id="films" title="Which films helped or hurt">
        {r.films.length === 0 ? (
          <p className="empty">No films have been released yet.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
          <table className="data" data-testid="recap-film-slate">
            <thead>
              <tr>
                <th>Wk</th><th>Title</th><th>Genre</th><th>Lead</th>
                <th className="num">Commitment</th><th className="num">Forecast</th><th className="num">Actual</th>
                <th className="num">vs F/C</th><th className="num">Critic</th><th className="num">Studio rev.</th>
                <th className="num">Contribution</th><th className="num">ROI</th><th>Result</th>
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
                    <span
                      className={`tag ${f.classification === 'loss' ? 'result' : f.classification === 'breakEven' ? 'estimate' : 'fact'}`}
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      {FILM_CLASS_LABEL[f.classification]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
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
                  <th>Name</th><th>Role</th><th className="num">Films</th><th className="num">OVR</th>
                  <th className="num">OVR Δ</th><th className="num">Star Power</th><th className="num">SP Δ</th>
                  <th className="num">+ / ~ / −</th><th>Note</th>
                </tr>
              </thead>
              <tbody>
                {r.talent.map((t: RecapTalent) => (
                  <tr key={t.talentId} data-testid={`recap-talent-${t.talentId}`}>
                    <td>
                      {onOpenProfile ? (
                        <button type="button" className="linkish" data-testid={`recap-open-profile-${t.talentId}`} onClick={() => onOpenProfile(t.talentId)}>
                          {t.name}
                        </button>
                      ) : (
                        t.name
                      )}
                    </td>
                    <td>{cap(t.role)}</td>
                    <td className="num">{t.filmCount}</td>
                    <td className="num">{t.startOVR}→{t.currentOVR}</td>
                    <td className="num"><Delta value={t.ovrChange} digits={0} /></td>
                    <td className="num">{Math.round(t.startStarPower)}→{Math.round(t.currentStarPower)}</td>
                    <td className="num"><Delta value={t.starPowerChange} digits={1} /></td>
                    <td className="num">{t.positiveStarEvents}/{t.negligibleStarEvents}/{t.negativeStarEvents}</td>
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
            {concentration.topGenre ? `${cap(concentration.topGenre.key)} (${concentration.topGenre.count}/${concentration.filmCount}, ${pct(concentration.topGenre.share)})` : '—'}
          </Metric>
          <Metric label="Top lead" small testid="recap-top-lead">
            {concentration.topLead ? `${concentration.topLead.key} (${concentration.topLead.count}/${concentration.filmCount}, ${pct(concentration.topLead.share)})` : '—'}
          </Metric>
          <Metric label="Budget spread" small>
            {concentration.budget ? `${money(concentration.budget.min)}–${money(concentration.budget.max)} (avg ${money(concentration.budget.mean)})` : '—'}
          </Metric>
          <Metric label="Release cadence" small>
            {concentration.cadence?.avgWeeksBetween != null ? `~${concentration.cadence.avgWeeksBetween} wks apart` : '—'}
          </Metric>
        </div>
        {concentration.recurringTeam.length > 0 && (
          <p className="hint" style={{ marginTop: 8 }} data-testid="recap-recurring-team">
            Recurring team: {concentration.recurringTeam.map((m) => `${m.name} (${cap(m.role)}, ${m.count})`).join(' · ')}
          </p>
        )}
        <p className="hint" style={{ marginTop: 8 }}>{concentration.note}</p>
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
            <Metric label="Current cash" small>{moneyExact(position.currentCash)}</Metric>
            <Metric label="Lowest estimated production commitment" small testid="recap-cheapest">
              {position.cheapest ? (
                <>
                  {moneyExact(position.cheapest.commitment)} —{' '}
                  {position.cheapest.affordable ? <span className="money pos">affordable</span> : <span className="money neg">short {moneyExact(position.cheapest.shortfall)}</span>}
                </>
              ) : '—'}
            </Metric>
            <p className="hint" style={{ margin: '0 0 6px' }}>Estimated from currently available production inputs.</p>
            <Metric label="Recent typical commitment" small testid="recap-typical">
              {position.typicalRecent ? (
                <>
                  {moneyExact(position.typicalRecent.commitment)} —{' '}
                  {position.typicalRecent.affordable ? <span className="money pos">affordable</span> : <span className="money neg">short {moneyExact(position.typicalRecent.shortfall)}</span>}
                </>
              ) : '—'}
            </Metric>
            <p className="hint" style={{ margin: 0 }}>Median production commitment of your last three released films.</p>
          </div>
          <div className="inset">
            <Metric label="Active theatrical revenue" small>
              {position.hasActiveRevenue ? `${moneyExact(position.activeRunRevenue)}/wk incoming` : 'None active'}
            </Metric>
            <Metric label="Weekly cash drain" small>{money(position.currentWeeklyBurn)} / wk</Metric>
            <Metric label="Waiting effect" small testid="recap-waiting">
              {position.waitingHelps ? 'holds or improves cash' : `${money$(position.netWeeklyCash)} / wk`}
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
              {position.contractsOutliveRunway ? ' (beyond runway)' : ''}
            </Metric>
          </div>
        </div>
        <ul className="hint" style={{ marginTop: 10 }} data-testid="recap-recovery-reasons">
          {position.recoveryReasons.map((reason, i) => (
            <li key={i}>{reason}</li>
          ))}
        </ul>
      </Section>

      {/* ── Warnings (prioritised) ── */}
      {r.warnings.length > 0 && (
        <>
          <div style={{ height: 16 }} />
          <Section id="warnings" title="What to watch">
            <ul data-testid="recap-warnings" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {primaryWarnings.map((w) => {
                const c = warningContent(w, r)
                return (
                  <li key={w.code} className={`warn sev-${w.severity}`} data-testid={`recap-warning-${w.code}`} style={{ marginBottom: 8 }}>
                    <strong>[{SEVERITY_LABEL[w.severity]}] {c.title}.</strong> {c.body}
                    <span className="hint" style={{ display: 'block' }}>{c.evidence}</span>
                  </li>
                )
              })}
            </ul>
            {secondaryWarnings.length > 0 && (
              <details style={{ marginTop: 8 }}>
                <summary data-testid="recap-more-observations">More strategic observations ({secondaryWarnings.length})</summary>
                <ul data-testid="recap-secondary-warnings" style={{ listStyle: 'none', padding: 0, margin: '8px 0 0' }}>
                  {secondaryWarnings.map((w) => {
                    const c = warningContent(w, r)
                    return (
                      <li key={w.code} data-testid={`recap-warning-${w.code}`} style={{ marginBottom: 6 }}>
                        <strong>[{SEVERITY_LABEL[w.severity]}] {c.title}.</strong> {c.body}
                      </li>
                    )
                  })}
                </ul>
              </details>
            )}
          </Section>
        </>
      )}

      {/* ── Methodology (collapsed) ── */}
      <div style={{ height: 16 }} />
      <details className="card" data-testid="recap-methodology">
        <summary>How these figures are calculated</summary>
        <ul className="hint" style={{ marginTop: 8 }}>
          <li><strong>Lowest estimated production commitment</strong> — the lowest-cost production we can estimate from your current concepts and contracted team. It is an estimate, not a guaranteed quote.</li>
          <li><strong>Recent typical commitment</strong> — the median production commitment of your last three released films.</li>
          <li><strong>Film contribution</strong> — a film&rsquo;s Studio Revenue minus its production commitment. Payroll and overhead are studio costs, not charged to any film.</li>
          <li><strong>Fixed-cost runway</strong> — how many weeks current cash lasts under weekly payroll + overhead, minus any active theatrical revenue.</li>
          {r.evidenceLimitations.map((l, i) => (<li key={i}>{l}</li>))}
        </ul>
      </details>
    </div>
  )
}
