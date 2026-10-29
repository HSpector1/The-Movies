// ── P18 surfaces: commission a limited-series season, follow it, cancel it, settle what it owes ──
// Presentation only. Every figure and every refusal comes from engine/television.ts, which reads the core. The quote is
// the admission the commit runs; a refusal is voiced in the player's words with the core's own sentence one click away
// (the P17 pattern), and the commit stays disabled.

import { useState } from 'react'
import type { ActionOutcome, GameState } from '../engine/adapter.ts'
import {
  seasonChoices,
  seasonQuote,
  seasonRefusalVoice,
  seasonRows,
  TV_BLOCK_LABEL,
  TV_CANCELLATION_LABEL,
  TV_MILESTONE_LABEL,
  type CommissionTvSeasonRequest,
  type TvSeasonView,
} from '../engine/television.ts'
import { moneyExact } from '../format.ts'

/** The refusal voiced in the player's words, with the core's own sentence behind a disclosure (P17Continuation's Refusal). */
function SeasonRefusal({ state, message, testid }: { state: GameState; message: string; testid: string }) {
  const voiced = seasonRefusalVoice(state)(message)
  return (
    <div className="errbox stack" role="alert" data-testid={testid} style={{ gap: 2 }}>
      <span data-testid={`${testid}-line`}>Not available: {voiced}</span>
      {voiced !== message && (
        <details data-testid={`${testid}-raw`}>
          <summary>Show the studio&rsquo;s note</summary>
          <span className="mono">{message}</span>
        </details>
      )}
    </div>
  )
}

/** A property with no recorded title: the disclosed dash, never its id (P17Continuation's `untitled`). */
const untitled = (t: string | null) => t ?? '— (no recorded title)'

type Picks = { propertyId: string; writerId: string; directorId: string; lead: string; antagonist: string; support: string; craftId: string; adoptionId: string }
const ROLE_ROWS: { key: keyof Picks; label: string; pool: 'writer' | 'director' | 'actor' | 'craft' }[] = [
  { key: 'writerId', label: 'Writer', pool: 'writer' },
  { key: 'directorId', label: 'Director', pool: 'director' },
  { key: 'lead', label: 'Lead', pool: 'actor' },
  { key: 'antagonist', label: 'Antagonist', pool: 'actor' },
  { key: 'support', label: 'Support', pool: 'actor' },
  { key: 'craftId', label: 'Craft lead', pool: 'craft' },
]

function initialPicks(state: GameState): Picks {
  const c = seasonChoices(state)
  const actors = c.people.actor
  return {
    propertyId: c.properties.find((p) => p.permitted)?.propertyId ?? '',
    writerId: c.people.writer[0]?.talentId ?? '', directorId: c.people.director[0]?.talentId ?? '',
    lead: actors[0]?.talentId ?? '', antagonist: actors[1]?.talentId ?? '', support: actors[2]?.talentId ?? '',
    craftId: c.people.craft[0]?.talentId ?? '',
    adoptionId: c.adoptions.find((a) => a.operational)?.adoptionId ?? '',
  }
}

const requestOf = (title: string, p: Picks): CommissionTvSeasonRequest => ({
  seriesTitle: title, propertyId: p.propertyId, adoptionId: p.adoptionId,
  roster: { writerId: p.writerId, directorId: p.directorId, cast: { lead: p.lead, antagonist: p.antagonist, support: p.support }, craftId: p.craftId },
})

/** Assembly's "Commission a season" panel: the lawful choices, the core quote, every refusal by name, one commit. */
export function SeasonCommissionPanel({
  state,
  onCommission,
}: {
  state: GameState
  /** Returns the action's outcome so a refusal at commit shows here, verbatim. */
  onCommission?: ((request: CommissionTvSeasonRequest) => ActionOutcome | undefined) | undefined
}) {
  const [title, setTitle] = useState('')
  const [picks, setPicks] = useState<Picks>(() => initialPicks(state))
  const [commitRefusal, setCommitRefusal] = useState<string | null>(null)
  const choices = seasonChoices(state)
  const request = requestOf(title, picks)
  const preview = seasonQuote(state, request)
  const q = preview.quote
  const set = (key: keyof Picks, value: string) => { setPicks({ ...picks, [key]: value }); setCommitRefusal(null) }
  return (
    <div className="card stack" data-testid="season-panel">
      <h3 style={{ margin: 0 }}>Commission a season</h3>
      <p className="hint">
        One limited-series season for the commissioner: a fee of {moneyExact(preview.terms.fee)}, an
        advance of {moneyExact(preview.terms.advance)} on acceptance, delivery due by week {preview.terms.dueWeek} and final at week {preview.terms.finalWeek}.
      </p>
      <label className="stack" style={{ gap: 2 }}>
        Series title
        <input value={title} onChange={(e) => { setTitle(e.target.value); setCommitRefusal(null) }} data-testid="season-title" />
      </label>
      <label className="stack" style={{ gap: 2 }}>
        Property
        <select value={picks.propertyId} onChange={(e) => set('propertyId', e.target.value)} data-testid="season-property">
          <option value="">Choose a property</option>
          {choices.properties.map((p) => (
            <option key={p.propertyId} value={p.propertyId} disabled={!p.permitted}>
              {untitled(p.title)}{p.refusal === null ? '' : ` (not available: ${p.refusal})`}
            </option>
          ))}
        </select>
      </label>
      {ROLE_ROWS.map((row) => (
        <label className="stack" style={{ gap: 2 }} key={row.key}>
          {row.label}
          <select value={picks[row.key]} onChange={(e) => set(row.key, e.target.value)} data-testid={`season-${row.key}`}>
            <option value="">Choose a {row.label.toLowerCase()}</option>
            {choices.people[row.pool].map((p) => <option key={p.talentId} value={p.talentId}>{p.name}</option>)}
          </select>
        </label>
      ))}
      <label className="stack" style={{ gap: 2 }}>
        Sound chain
        <select value={picks.adoptionId} onChange={(e) => set('adoptionId', e.target.value)} data-testid="season-adoption">
          <option value="">Choose a synchronized-dialogue chain</option>
          {choices.adoptions.map((a) => (
            <option key={a.adoptionId} value={a.adoptionId} disabled={!a.operational}>
              {a.stageName} with {a.postName}{a.operational ? '' : ' (not operational)'}
            </option>
          ))}
        </select>
      </label>
      <div className="inset stack" data-testid="season-quote" style={{ gap: 2 }}>
        <span>Work floor (twelve units): {moneyExact(q.floor)}</span>
        <span>Fixed obligations over the next {q.weeks} weeks: {moneyExact(q.payroll + q.overhead + q.facilityOpex + q.loanInstallments)}
          {' '}(payroll {moneyExact(q.payroll)}, overhead {moneyExact(q.overhead)}, facilities {moneyExact(q.facilityOpex)}, loan {moneyExact(q.loanInstallments)})</span>
        <span>Cancellation provision: {moneyExact(q.provision)}</span>
        <strong data-testid="season-quote-required">Cash required {moneyExact(q.required)}; cash held {moneyExact(q.cash)}</strong>
        <span data-testid="season-quote-advance">The advance of {moneyExact(preview.terms.advance)} arrives on acceptance and is not counted.</span>
      </div>
      {preview.refusal !== null && <SeasonRefusal state={state} message={preview.refusal} testid="season-refusal" />}
      {commitRefusal !== null && <SeasonRefusal state={state} message={commitRefusal} testid="season-commit-refusal" />}
      <button
        type="button"
        className="accent"
        disabled={preview.refusal !== null || !onCommission}
        onClick={() => {
          const outcome = onCommission?.(request)
          if (outcome !== undefined && !outcome.ok) setCommitRefusal(outcome.error)
        }}
        data-testid="season-commission"
      >
        Commission the season
      </button>
    </div>
  )
}

/**
 * ASTRA Sprint 18, decision C (option a): a deadline cancellation keeps its classification and names the inability the
 * record supports: incomplete work (the credited units), or a complete master that could not be accepted at the final
 * boundary (the record keeps no reason for that, and none is invented).
 */
function deadlineExplanation(row: TvSeasonView): string {
  return row.creditedUnits < row.totalUnits
    ? `the season could not be delivered: ${row.creditedUnits} of ${row.totalUnits} units were credited by the final week ${row.finalWeek}`
    : `all ${row.totalUnits} units were credited but the master could not be accepted at the final week ${row.finalWeek}; the record keeps no further reason`
}

/** Decision C: a cancelled season's distribution licence is not revoked by the cancellation; nothing is deliverable under it. */
function cancelledLicenceText(state: GameState, row: TvSeasonView): string {
  const licence = state.rights.licences.find((l) => l.id === row.distribution.licenceId)
  if (licence === undefined) return 'its distribution licence is not on record'
  return state.market.tick < licence.endWeekExclusive
    ? `its distribution licence stays in force through week ${licence.endWeekExclusive - 1}, with nothing deliverable under it`
    : `its distribution licence ended at week ${licence.endWeekExclusive}`
}

/** FIX-S13B-1 items 4, 6: one closed branch per status; a delivered season reads its P16-checked availability. */
function seasonStatusText(state: GameState, row: TvSeasonView): string {
  switch (row.status) {
    case 'live': return 'In production'
    case 'cancelled': {
      if (row.cancellation === null) throw new Error(`season ${row.seasonId} is cancelled without its cancellation record`)
      const why = row.cancellation.cause === 'deadline' ? `: ${deadlineExplanation(row)}` : ''
      return `Cancelled at week ${row.cancellation.week} (${TV_CANCELLATION_LABEL[row.cancellation.cause]})${why}; ${cancelledLicenceText(state, row)}`
    }
    case 'delivered': {
      const until = row.distribution.availableUntilWeekExclusive
      if (row.deliveredWeek === null || until === null) throw new Error(`season ${row.seasonId} is delivered without its delivered week`)
      const service = row.distribution.available ? `on the commissioner\u2019s service through week ${until - 1}`
        : row.distribution.expired ? `the commissioner\u2019s window ended at week ${until}`
          : 'not on the commissioner\u2019s service: P16 no longer permits its distribution'
      return `Delivered at week ${row.deliveredWeek}; ${service}`
    }
  }
}

function SeasonStatus({ state, row }: { state: GameState; row: TvSeasonView }) {
  return <span data-testid={`season-state-${row.seasonId}`}>{seasonStatusText(state, row)}</span>
}

/** The Dashboard's season rows: live progress, the cancel with its settlement shown first, settle when owed, terminal state. */
export function SeasonCard({
  state,
  onCancel,
  onSettle,
}: {
  state: GameState
  onCancel?: ((seasonId: string) => ActionOutcome | undefined) | undefined
  onSettle?: ((agreementId: string, expectedRemaining: number, amount: number) => ActionOutcome | undefined) | undefined
}) {
  const rows = seasonRows(state)
  const [confirming, setConfirming] = useState<string | null>(null)
  const [refusal, setRefusal] = useState<string | null>(null)
  if (rows.length === 0) return null
  const handle = (outcome: ActionOutcome | undefined) => {
    if (outcome === undefined) return
    setRefusal(outcome.ok ? null : outcome.error)
    setConfirming(null)
  }
  return (
    <div className="card stack" data-testid="season-card">
      <h2 style={{ margin: 0 }}>Television</h2>
      {refusal !== null && <SeasonRefusal state={state} message={refusal} testid="season-action-refusal" />}
      {rows.map((row) => (
        <div className="inset stack" key={row.seasonId} data-testid={`season-row-${row.seasonId}`} style={{ gap: 4 }}>
          <span><strong>{row.seriesTitle}</strong> · <SeasonStatus state={state} row={row} /></span>
          {row.status === 'live' && (
            <>
              <span data-testid={`season-progress-${row.seasonId}`}>
                {TV_BLOCK_LABEL[row.block]} · {row.creditedUnits} of {row.totalUnits} units credited · due week {row.dueWeek}, final week {row.finalWeek}
              </span>
              {row.nextMilestone !== null && (
                <span className="hint" data-testid={`season-milestone-${row.seasonId}`}>
                  Next: {TV_MILESTONE_LABEL[row.nextMilestone.kind]} {moneyExact(row.nextMilestone.amount)} at unit {row.nextMilestone.afterUnit}
                </span>
              )}
              {row.stall !== null && <span className="hint" data-testid={`season-stall-${row.seasonId}`}>Waiting: {row.stall}</span>}
            </>
          )}
          <span className="hint" data-testid={`season-money-${row.seasonId}`}>
            Earned {moneyExact(row.agreement.earned)} of {moneyExact(row.agreement.fee)} · received {moneyExact(row.agreement.received)}
            {row.agreement.outstanding > 0 ? ` · owed ${moneyExact(row.agreement.outstanding)}` : ''}
          </span>
          {row.cancelPreview !== null && (confirming === row.seasonId ? (
            <div className="stack" style={{ gap: 4 }}>
              <span data-testid={`season-cancel-settlement-${row.seasonId}`}>
                Cancelling now returns the unearned advance {moneyExact(row.cancelPreview.refundDue)} and charges {moneyExact(row.cancelPreview.chargeDue)}:
                {' '}{moneyExact(row.cancelPreview.refundPaidNow)} refunded and {moneyExact(row.cancelPreview.chargePaidNow)} charged from cash now,
                {' '}{moneyExact(row.cancelPreview.owedAfter)} left owed. Completed work and earned fees stay.
              </span>
              <span className="btn-row">
                <button type="button" className="ghost" disabled={!onCancel} onClick={() => handle(onCancel?.(row.seasonId))} data-testid={`season-cancel-confirm-${row.seasonId}`}>
                  Confirm cancellation
                </button>
                <button type="button" className="ghost" onClick={() => setConfirming(null)} data-testid={`season-cancel-keep-${row.seasonId}`}>
                  Keep the season
                </button>
              </span>
            </div>
          ) : (
            <button type="button" className="ghost" onClick={() => setConfirming(row.seasonId)} data-testid={`season-cancel-${row.seasonId}`}>
              Cancel the season
            </button>
          ))}
          {/* FIX-S13B-1 item 6: with no cash to pay, no settle verb (the Bridge offers none either); the owed figure stays above. */}
          {row.settlePreview !== null && row.settlePreview.payableNow > 0 && (
            <button
              type="button"
              className="ghost"
              disabled={!onSettle}
              onClick={() => handle(onSettle?.(row.agreement.agreementId, row.settlePreview!.outstanding, row.settlePreview!.payableNow))}
              data-testid={`season-settle-${row.seasonId}`}
            >
              Settle {moneyExact(row.settlePreview.payableNow)} of {moneyExact(row.settlePreview.outstanding)} owed
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
