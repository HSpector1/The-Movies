// ── Studio dashboard ─────────────────────────────────────────────────────────
// What do I own / what's in production / what happened / what's my next decision.
// Current week, cash, three standing channels (labeled + one-line meanings),
// active productions (stored forecast + remaining weeks), recent releases, and the
// primary actions (Assemble a film, Advance one week) plus Talent creator / Saves.

import type {
  GameState,
  FilmResult,
  RunView,
  PublicityTier,
  ProductionCommandView,
} from '../engine/adapter.ts'
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
  runProjection,
  releaseScorecard,
  affordabilityScopes,
  publicityDecision,
  productionBoard,
  studioDecision,
  scriptProjectsBoard,
} from '../engine/adapter.ts'
import { money, score } from '../format.ts'
import { Metric, StandingBar } from '../components/common.tsx'
import { AffordabilityScopesCard } from '../components/AffordabilityScopes.tsx'
import { ProductionBoard } from '../components/ProductionBoard.tsx'

export function Dashboard({
  state,
  onAssemble,
  onAdvance,
  onSimToEvent,
  onCreateTalent,
  onOpenHub,
  onOpenRoster,
  onOpenCasting,
  onOpenHiring,
  onOpenLot,
  onOpenRecap,
  onSaves,
  onOpenAutopsy,
  onOpenClipping,
  onPublicize,
  onProductionCommand,
}: {
  state: GameState
  onAssemble: () => void
  onAdvance: () => void
  onSimToEvent: () => void
  onCreateTalent: () => void
  onOpenHub?: () => void
  onOpenRoster?: () => void
  onOpenCasting?: () => void
  onOpenHiring?: () => void
  // Gate D1: open the Studio Lot overview. Optional — present only when the
  // studioLotOverview feature flag is on (default off), so the flag-off app is unchanged.
  onOpenLot?: (() => void) | undefined
  // D-15: open the read-only Studio Run Recap.
  onOpenRecap?: () => void
  onSaves: () => void
  onOpenAutopsy: (film: FilmResult) => void
  // D-11.C PART 2: reopen a film's newspaper clipping. Optional — the clipping is
  // reconstructed from persisted state, so it works even for imported saves.
  onOpenClipping?: (film: FilmResult) => void
  onPublicize?: (tier: PublicityTier) => void
  onProductionCommand?: (command: ProductionCommandView) => void
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
  // D-17A/T4: "what can I actually make right now?" — from the FIRST week of a run, not
  // gated behind the retrospective recap.
  const scopes = affordabilityScopes(state)
  const publicity = publicityDecision(state)
  const board = productionBoard(state)
  const scripts = scriptProjectsBoard(state)
  const pendingDecision = studioDecision(state)
  const pendingScriptDecision =
    pendingDecision?.kind === 'scriptReview' ? pendingDecision.decision : null
  const pendingCastingDecision =
    pendingDecision?.kind === 'castingReview' ? pendingDecision.decision : null
  const pendingProductionDecision =
    pendingDecision?.kind === 'productionDecision' ? pendingDecision.decision : null
  const managedScripts = scripts.mode === 'managed'
  const capacityHold = board.cards.find((card) => card.blocker?.kind === 'facility-capacity') ?? null

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
            {pendingScriptDecision
              ? `${pendingScriptDecision.title} needs screenplay review before unattended simulation can continue.`
              : pendingCastingDecision
                ? `${pendingCastingDecision.title} has audition results waiting for review in the Casting Room.`
              : pendingProductionDecision
              ? `${pendingProductionDecision.title} needs a ${pendingProductionDecision.phaseLabel} decision before its countdown can advance.`
              : capacityHold
                ? `${capacityHold.title} is held for facility capacity. No player command is required; capacity retries on the next week.`
              : managedScripts
                ? 'Commission, review, and package screenplays in the Writers’ Room, or let a week pass so studio work advances.'
                : 'Assemble and greenlight a film, or let a week pass so productions advance and finished films release.'}
          </p>
          <div className="btn-row">
            <button
              className="accent"
              onClick={pendingCastingDecision ? onOpenCasting : onAssemble}
              disabled={
                pendingCastingDecision
                  ? !onOpenCasting
                  : !managedScripts && (!canGreenlight || !availability.canAssemble)
              }
              data-testid="assemble-film"
            >
              {pendingCastingDecision
                ? 'Review casting results'
                : managedScripts
                  ? 'Open Writers’ Room'
                  : 'Assemble a film'}
            </button>
            <button className="primary" onClick={onAdvance} data-testid="advance-week">
              Advance one week
            </button>
            <button
              className="primary"
              onClick={onSimToEvent}
              disabled={
                pendingScriptDecision !== null ||
                pendingCastingDecision !== null ||
                pendingProductionDecision !== null
              }
              data-testid="sim-to-event"
            >
              Sim to next event
            </button>
          </div>
          <p className="hint">
            {pendingScriptDecision
              ? 'Review the screenplay in the Writers’ Room before unattended simulation. Advancing one week deliberately leaves the review waiting without hidden progress.'
              : pendingCastingDecision
                ? 'Review the camera-test evidence before unattended simulation. Acknowledgement is always legal and never selects a winner.'
              : pendingProductionDecision
              ? 'Resolve the command on the Production Board before unattended simulation. You may still advance a week deliberately; the film will hold while studio costs continue.'
              : capacityHold
                ? 'The Production Board shows the capacity warning. Advance or Sim to retry it while payroll and studio overhead continue.'
              : 'Sim to next event runs weeks in order — applying payroll, overhead, and theatrical revenue — and stops at a screenplay review, casting review, production decision, release, run ending, contract change, or cash going negative.'}
          </p>
          {!managedScripts && !canGreenlight && (
            <p className="hint">
              At the production cap ({active.length}). Advance weeks until a film releases before
              starting another.
            </p>
          )}
          {!managedScripts && canGreenlight && !availability.canAssemble && (
            <p className="hint" data-testid="assemble-blocked-reason">
              {availability.reason}
            </p>
          )}
          <div className="sep" />
          <div className="btn-row">
            <button
              className="ghost"
              onClick={onOpenCasting}
              disabled={!onOpenCasting}
              data-testid="open-casting-room"
            >
              Casting Room
            </button>
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
            <button
              className="ghost"
              onClick={onOpenRecap}
              disabled={!onOpenRecap}
              data-testid="open-recap"
            >
              Studio Run Recap
            </button>
            {onOpenLot && (
              <button className="ghost" onClick={onOpenLot} data-testid="open-studio-lot">
                Studio Lot
              </button>
            )}
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

      <div className="card stack" data-testid="publicity-panel">
        <div className="spread" style={{ alignItems: 'flex-start', gap: 16 }}>
          <div>
            <h2 style={{ marginTop: 0 }}>Publicity campaigns</h2>
            <p className="hint" style={{ marginBottom: 0 }}>
              Buy an immediate Audience Awareness lift. Returns diminish sharply as awareness
              rises: the measured Whisper maintenance rule&rsquo;s lifetime break-even crosses at
              roughly 30–32 awareness, so the figures below are decision inputs, not a
              recommended tier or promised outcome.
            </p>
          </div>
          <Metric label="Awareness now" small testid="publicity-awareness">
            {channels.find((channel) => channel.key === 'audienceAwareness')?.value.toFixed(2)} / 100
          </Metric>
        </div>
        <p className="hint" data-testid="awareness-practical-band">
          In measured working studios the practical band was roughly 0–57 of the nominal 0–100.
          About 90% of awareness decline came from below-neutral releases; the weekly pull-down
          above 35 accounted for the rest.
        </p>
        <p className="hint" data-testid="publicity-global-cooldown">
          Every purchase starts a shared {publicity[0]?.globalCooldownWeeks}-week cooldown across
          all campaigns; each tier also has its own longer reuse clock shown below.
        </p>
        <div className="grid grid-3" data-testid="publicity-tiers">
          {publicity.map((offer) => {
            const label =
              offer.tier === 'whisper'
                ? 'Whisper campaign'
                : offer.tier === 'push'
                  ? 'Push campaign'
                  : 'Blitz campaign'
            return (
              <div className="inset stack" key={offer.tier} data-testid={`publicity-${offer.tier}`}>
                <div className="spread">
                  <strong>{label}</strong>
                  <span className="mono">{money(offer.cost)}</span>
                </div>
                <span className="hint">
                  Immediate lift now: <strong>+{offer.expectedLift.toFixed(2)}</strong> points
                </span>
                <span className="hint">
                  Price per immediate point:{' '}
                  <strong>{offer.pricePerPoint === null ? '—' : money(offer.pricePerPoint)}</strong>
                </span>
                <span className="hint">
                  Tier cooldown: {offer.cooldownWeeks} weeks
                </span>
                {offer.reason && <span className="hint">{offer.reason}</span>}
                <button
                  type="button"
                  className="primary"
                  disabled={!offer.available || !onPublicize}
                  onClick={() => onPublicize?.(offer.tier)}
                  data-testid={`buy-publicity-${offer.tier}`}
                >
                  Run {label.toLowerCase()}
                </button>
              </div>
            )
          })}
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

      {/* D-17A/T4 — the three affordability scopes, the same numbers the recap reports and
          the same gate the greenlight action enforces. */}
      <div className="card">
        <h2>What you can make right now</h2>
        <AffordabilityScopesCard scopes={scopes} testid="dash-affordability" />
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
                projection={runProjection(state, r)}
              />
            ))}
          </div>
        )}
      </div>

      <div style={{ height: 16 }} />

      <ProductionBoard
        board={board}
        {...(onProductionCommand ? { onCommand: onProductionCommand } : {})}
      />

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
                <th className="num">Audience</th>
                <th className="num">Gross</th>
                <th className="num">Studio Rev</th>
                <th className="num">Contribution</th>
                <th className="num">ROI</th>
                {/* D-17A FIX-PASS (R7 "no competing headline meanings of profit"): the bare word
                    "Profit" in this column is the DIRECT-cost basis (Studio Revenue − committed
                    cost, D-12 §3/§8 — payroll and overhead are never folded in), while the
                    greenlight screen's "Profit" is studio-economic. Same word, two bases,
                    indistinguishable labels. The column now names its basis. */}
                <th data-testid="releases-result-header">Result (direct costs)</th>
                <th>Released</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {recent.map((f) => {
                const concept = findConcept(state, f.conceptId)
                // D-12 P6: compact multi-axis scorecard — profit, critics and audiences as SEPARATE truths.
                // Studio Rev, Contribution and ROI all come from the SAME scorecard basis so a completed run
                // (dropped from theatricalRuns) never shows a real Contribution beside a "—" Studio Rev.
                const card = releaseScorecard(state, f)
                const profit = card.contribution >= 0
                return (
                  <tr key={f.productionId} data-testid={`release-${f.productionId}`}>
                    <td>{concept?.title ?? f.conceptId}</td>
                    <td className="num">{score(f.criticScore)}</td>
                    <td className="num" data-testid={`release-${f.productionId}-audience`}>{score(card.audience)}</td>
                    <td className="num">{money(f.boxOffice.total)}</td>
                    <td className="num" data-testid={`release-${f.productionId}-studiorev`}>
                      {money(card.studioRevenue)}
                    </td>
                    <td className={`num ${profit ? 'money pos' : 'money neg'}`} data-testid={`release-${f.productionId}-contribution`}>
                      {money(card.contribution)}
                    </td>
                    <td className={`num ${profit ? 'money pos' : 'money neg'}`} data-testid={`release-${f.productionId}-roi`}>
                      {Math.round(card.roi * 100)}%
                    </td>
                    <td data-testid={`release-${f.productionId}-result`}>{card.resultLabel}</td>
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
function TheatricalRunPanel({
  run,
  title,
  projection,
}: {
  run: RunView
  title: string
  projection: import('../engine/adapter.ts').RunProjection
}) {
  const profit = projection.projectedContribution >= 0
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
      {/* D-12 P6: is this run currently projected to repay its cost? — visible without opening an autopsy. */}
      <div className="row" style={{ marginTop: 8, gap: 24, flexWrap: 'wrap' }}>
        <Metric label="Direct commitment" small testid={`run-${run.productionId}-commitment`}>
          {money(projection.commitment)}
        </Metric>
        <Metric label={projection.label} small testid={`run-${run.productionId}-projected`}>
          <span className={profit ? 'money pos' : 'money neg'}>{money(projection.projectedContribution)}</span>
        </Metric>
        <Metric label="Projected ROI" small testid={`run-${run.productionId}-roi`}>
          <span className={profit ? 'money pos' : 'money neg'}>{Math.round(projection.projectedRoi * 100)}%</span>
        </Metric>
      </div>
    </div>
  )
}
