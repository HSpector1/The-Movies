// ── P17 surfaces: continuation choice, featured appearances, booking cancellation, release outcome ──
// Presentation only. Every number and every refusal comes from engine/continuation.ts, which reads the core.
// A refused choice or guest is shown with its reason and cannot be selected.

import { useEffect, useRef, useState } from 'react'
import type { ActionOutcome, GameState } from '../engine/adapter.ts'
import {
  BAND_LABEL,
  BASIS_LABEL,
  bookingRequestOf,
  BRANCH_KIND_LABEL,
  CANCEL_REASON_LABEL,
  CONTINUATION_TYPE_LABEL,
  productionBookings,
  releaseOutcome,
  USE_LABEL,
  type BookingRow,
  type CameoBookingRequest,
  type ContinuationPanel,
  type GuestPanel,
  type MeterSnapshot,
} from '../engine/continuation.ts'
import { money, pct } from '../format.ts'
import { RefusalNotice } from './common.tsx'

const fixed = (n: number) => n.toFixed(1)
/** Some refusals name a guest by id; the player sees the person's name. */
const named = (reason: string, id: string, name: string) => reason.split(id).join(name)

const QUALITY_NOTE =
  'Inherited awareness raises the opening reach only; it never changes critic or audience scores. ' +
  'Recognition and Fatigue are property-wide (a reboot inherits the Fatigue); Momentum belongs to one continuity.'

export function ContinuationChoicePanel({
  panel,
  blocked,
  selectedKey,
  onSelect,
}: {
  panel: ContinuationPanel
  /** Why this greenlight cannot carry a continuation at all (it would wait in the queue); null when it can. */
  blocked: string | null
  selectedKey: string | null
  onSelect: (key: string | null) => void
}) {
  return (
    <div className="card stack" data-testid="continuation-panel">
      <h3 style={{ margin: 0 }}>Continue a property</h3>
      {panel.unavailable !== null ? (
        <div className="notice" data-testid="continuation-unavailable">{panel.unavailable}</div>
      ) : panel.properties.length === 0 ? (
        <p className="hint" data-testid="continuation-none">
          The studio holds no title or licence on a property with released work, so this picture is an original.
        </p>
      ) : blocked !== null ? (
        <div className="notice" data-testid="continuation-blocked">{blocked}</div>
      ) : (
        <fieldset className="stack" style={{ border: 0, padding: 0, margin: 0 }}>
          <legend>Is this picture a continuation?</legend>
          <p className="hint">{QUALITY_NOTE}</p>
          <label className="row" style={{ gap: 8 }}>
            <input
              type="radio"
              name="continuation"
              checked={selectedKey === null}
              onChange={() => onSelect(null)}
              data-testid="continuation-choice-none"
            />
            An original picture (no continuation)
          </label>
          {panel.properties.map((p) => (
            <div className="inset stack" key={p.storyPropertyId} data-testid={`continuation-property-${p.storyPropertyId}`}>
              <div className="spread">
                <strong>{p.title}</strong>
                <span className="tag">{p.standing === 'title' ? 'Title held' : 'Licensed'}</span>
              </div>
              {p.meters === null ? (
                <span className="hint" data-testid={`continuation-meters-${p.storyPropertyId}`}>
                  No continuation recorded yet; each choice shows the meters it would start from.
                </span>
              ) : (
                <span className="hint" data-testid={`continuation-meters-${p.storyPropertyId}`}>
                  Recognition {fixed(p.meters.recognition)} · Fatigue {fixed(p.meters.fatigue)}
                  {p.continuities.map((c) => ` · ${BRANCH_KIND_LABEL[c.kind]}: Momentum ${fixed(c.momentum)}, ${BAND_LABEL[c.band]}`).join('')}
                </span>
              )}
              {p.choices.map((c) => {
                const testid = `continuation-choice-${c.request.type}-${c.request.predecessorProductionId}${c.request.subPropertyId ? `-${c.request.subPropertyId}` : ''}`
                return (
                  <label className="stack" key={c.key} style={{ gap: 2 }} data-testid={`${testid}-row`}>
                    <span className="row" style={{ gap: 8 }}>
                      <input
                        type="radio"
                        name="continuation"
                        disabled={!c.quote.ok}
                        checked={selectedKey === c.key}
                        onChange={() => onSelect(c.key)}
                        data-testid={testid}
                      />
                      <strong>{CONTINUATION_TYPE_LABEL[c.request.type]}</strong> of {c.predecessorTitle}
                    </span>
                    {c.quote.ok ? (
                      <span className="hint" data-testid={`${testid}-quote`}>
                        {c.right?.via === 'licence' && c.right.endWeekExclusive !== null
                          ? `Relies on a licence in force through week ${c.right.endWeekExclusive - 1}`
                          : 'Relies on the held title'}
                        {` (${USE_LABEL[c.quote.use]}) · Recognition ${fixed(c.quote.recognition)} · Momentum ${fixed(c.quote.momentum)} · Fatigue ${fixed(c.quote.fatigue)} · Inherited awareness ${pct(c.quote.inheritedAwareness01)} · ${BAND_LABEL[c.quote.band]}`}
                      </span>
                    ) : (
                      <span className="hint" data-testid={`${testid}-refusal`}>Not available: {c.refusal}</span>
                    )}
                  </label>
                )
              })}
            </div>
          ))}
        </fieldset>
      )}
    </div>
  )
}

export function FeaturedGuestPanel({
  panel,
  blocked,
  onWorkWeek,
  selected,
  onChange,
}: {
  panel: GuestPanel
  /** Why this greenlight cannot carry guests at all (queued, or a carried screenplay); null when it can. */
  blocked: string | null
  onWorkWeek: (week: number) => void
  /** The chosen guests that are still eligible at their quoted fee and basis this render. */
  selected: CameoBookingRequest[]
  onChange: (next: CameoBookingRequest[]) => void
}) {
  const fees = selected.reduce((sum, g) => sum + g.fee, 0)
  const workWeek = panel.workWeek
  return (
    <div className="card stack" data-testid="guest-panel">
      <h3 style={{ margin: 0 }}>Featured appearances</h3>
      {panel.unavailable !== null ? (
        <div className="notice" data-testid="guest-unavailable">{panel.unavailable}</div>
      ) : blocked !== null ? (
        <div className="notice" data-testid="guest-blocked">{blocked}</div>
      ) : (
        <fieldset className="stack" style={{ border: 0, padding: 0, margin: 0 }}>
          <legend>Feature up to {panel.capacity} guests</legend>
          <p className="hint">
            Each guest is an existing person who appears for one week. The fee is charged at greenlight; three
            principals stay required and a guest takes no seat.
          </p>
          <label className="row" style={{ gap: 8 }}>
            Work week
            <select value={workWeek} onChange={(e) => onWorkWeek(Number(e.target.value))} data-testid="guest-work-week">
              {panel.workWeeks.map((w) => <option key={w} value={w}>Week {w} (standard shooting week)</option>)}
            </select>
          </label>
          {panel.eligible.length === 0 && (
            <div className="notice" data-testid="guest-none">
              Nobody among the {panel.scanned} most famous people can appear in week {workWeek}.
            </div>
          )}
          {panel.eligible.map(({ talentId, quote }) => {
            if (!quote.ok) return null
            const on = selected.some((g) => g.talentId === talentId)
            return (
              <label className="inset stack" key={talentId} style={{ gap: 2 }} data-testid={`guest-row-${talentId}`}>
                <span className="row" style={{ gap: 8 }}>
                  <input
                    type="checkbox"
                    checked={on}
                    disabled={!on && selected.length >= panel.capacity}
                    onChange={() => onChange(on ? selected.filter((g) => g.talentId !== talentId) : [...selected, bookingRequestOf(quote)])}
                    data-testid={`guest-feature-${talentId}`}
                  />
                  <strong>{quote.name}</strong> ({quote.profession}, fame {fixed(quote.fame)}) · {BASIS_LABEL[quote.basis]} · fee{' '}
                  <span className="mono" data-testid={`guest-fee-${talentId}`}>{money(quote.fee)}</span>
                </span>
                <span className="hint">{named(quote.readinessRisk, talentId, quote.name)}</span>
                {quote.disclosures.map((d) => <span className="hint" key={d}>{d}</span>)}
              </label>
            )
          })}
          {panel.refused.length > 0 && (
            <details data-testid="guest-refused">
              <summary>Not available this week ({panel.refused.length} shown)</summary>
              {panel.refused.map(({ talentId, name, quote }) => (
                <div className="hint" key={talentId} data-testid={`guest-refusal-${talentId}`}>
                  {name}: {quote.ok ? '' : named(quote.reason, talentId, name)}
                </div>
              ))}
            </details>
          )}
          <div data-testid="guest-cost-total">
            Featured appearances add <strong className="mono">{money(fees)}</strong> to this greenlight&rsquo;s committed cost
            {selected.length > 0 ? ` (${selected.length} guest${selected.length === 1 ? '' : 's'}).` : '.'}
          </div>
        </fieldset>
      )}
    </div>
  )
}

function BookingStatus({ b }: { b: BookingRow }) {
  if (b.status === 'cancelled') {
    return <>Cancelled ({b.cancelReason ? CANCEL_REASON_LABEL[b.cancelReason] : 'no reason recorded'}); refunded {money(b.refund ?? 0)}, retained {money(b.retained)}</>
  }
  if (b.status === 'completed') return <>Completed in week {b.completedWeek}; the fee is earned</>
  return <>Reserved for week {b.workWeek}</>
}

/** The production screen's bookings, with the one explicit cancel control for a reserved appearance. */
export function FeaturedBookingsCard({
  state,
  onCancel,
}: {
  state: GameState
  /** Returns the action's outcome so a refusal shows here, in the studio's language. */
  onCancel?: ((bookingId: string) => ActionOutcome | undefined) | undefined
}) {
  const rows = productionBookings(state)
  const [refusal, setRefusal] = useState<string | null>(null)
  const [focusId, setFocusId] = useState<string | null>(null)
  const rowRefs = useRef(new Map<string, HTMLDivElement>())
  // the cancel button disappears with the reservation; focus moves to the booking it closed
  useEffect(() => {
    if (focusId === null) return
    rowRefs.current.get(focusId)?.focus()
    setFocusId(null)
  }, [focusId])
  if (rows.length === 0) return null
  const nameOf = (id: string) => state.talent.find((t) => t.id === id)?.name
  return (
    <div className="card stack" data-testid="featured-bookings">
      <h2 style={{ margin: 0 }}>Featured appearances</h2>
      {refusal !== null && <RefusalNotice message={refusal} nameOf={nameOf} testid="booking-cancel-refusal" />}
      {rows.map((b) => (
        <div
          className="inset stack"
          key={b.bookingId}
          data-testid={`booking-${b.bookingId}`}
          tabIndex={-1}
          ref={(node) => {
            if (node) rowRefs.current.set(b.bookingId, node)
            else rowRefs.current.delete(b.bookingId)
          }}
          style={{ gap: 4 }}
        >
          <span><strong>{b.name}</strong> in {b.pictureTitle} · fee {money(b.fee)} · <BookingStatus b={b} /></span>
          {b.status === 'reserved' && (
            <>
              <span className="hint" data-testid={`booking-cancel-disclosure-${b.bookingId}`}>
                Cancelling now retains {money(b.retained)} of the {money(b.fee)} fee and refunds {money(b.fee - b.retained)}.
              </span>
              <button
                type="button"
                className="ghost"
                disabled={!onCancel}
                onClick={() => {
                  const outcome = onCancel?.(b.bookingId)
                  if (outcome === undefined) return
                  if (outcome.ok) {
                    setRefusal(null)
                    setFocusId(b.bookingId)
                  } else {
                    setRefusal(outcome.error)
                  }
                }}
                data-testid={`booking-cancel-${b.bookingId}`}
              >
                Cancel {b.name}&rsquo;s appearance
              </button>
            </>
          )}
        </div>
      ))}
    </div>
  )
}

function MeterRow({ label, m }: { label: string; m: MeterSnapshot | null }) {
  return (
    <tr>
      <th scope="row">{label}</th>
      <td className="num">{m ? fixed(m.recognition) : '—'}</td>
      <td className="num">{m && m.momentum !== null ? fixed(m.momentum) : '—'}</td>
      <td className="num">{m ? fixed(m.fatigue) : '—'}</td>
    </tr>
  )
}

/** The released film's lineage edge, its property meters before and after this release, and its guests. */
export function ReleaseContinuationOutcome({
  preTick,
  postTick,
  productionId,
  coReleased = [],
}: {
  preTick: GameState
  postTick: GameState
  productionId: string
  /** The other films the same tick released (the before/after pair spans them when they share the property). */
  coReleased?: readonly string[]
}) {
  const { lineage, guests } = releaseOutcome(preTick, postTick, productionId, coReleased)
  if (lineage === null && guests.length === 0) return null
  return (
    <div className="stack" data-testid={`release-continuation-${productionId}`}>
      <div className="sep" />
      {lineage !== null && (
        <>
          <h4 style={{ margin: 0 }}>Lineage</h4>
          <p className="reason" style={{ margin: 0 }} data-testid={`release-lineage-${productionId}`}>
            {CONTINUATION_TYPE_LABEL[lineage.type]}
            {lineage.parentTitle !== null ? ` of ${lineage.parentTitle}` : ''} in {lineage.propertyTitle}, on the{' '}
            {BRANCH_KIND_LABEL[lineage.branchKind]}
            {lineage.greenlitWeek !== null ? `, greenlit week ${lineage.greenlitWeek}` : ''}
            {lineage.releasedWeek !== null ? `, released week ${lineage.releasedWeek}` : ''}.
            {lineage.propertyPeak ? ' This film is the property’s Recognition peak.' : ''}
            {lineage.activeAgain ? ' The continuity is active again after a dormant gap.' : ''}
          </p>
          <div className="data-table-scroll" role="region" aria-label="Property meters around this release" tabIndex={0}>
            <table className="data" data-testid={`release-meters-${productionId}`}>
              <thead>
                <tr><th scope="col">Meter reading</th><th scope="col" className="num">Recognition</th><th scope="col" className="num">Momentum</th><th scope="col" className="num">Fatigue</th></tr>
              </thead>
              <tbody>
                <MeterRow label="Before this release" m={lineage.before} />
                <MeterRow label="After this release" m={lineage.after} />
              </tbody>
            </table>
          </div>
          {lineage.sharedWith.length > 0 && (
            <p className="hint" style={{ margin: 0 }} data-testid={`release-meters-shared-${productionId}`}>
              These readings span the whole week, which also released {lineage.sharedWith.join(' and ')} into this property.
            </p>
          )}
          <p className="hint" style={{ margin: 0 }}>{QUALITY_NOTE}</p>
        </>
      )}
      {guests.length > 0 && (
        <>
          <h4 style={{ margin: 0 }}>Featured appearances</h4>
          {guests.map((g) => (
            <div className="hint" key={g.bookingId} data-testid={`release-guest-${g.bookingId}`}>
              <strong>{g.name}</strong>:{' '}
              {g.credit
                ? `credited; star power ${fixed(g.credit.starPowerBefore)} → ${fixed(g.credit.starPowerAfter)}`
                : <BookingStatus b={g} />}
            </div>
          ))}
        </>
      )}
    </div>
  )
}
