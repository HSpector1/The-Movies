// ── Studio Calendar & Capacity Board V1 ────────────────────────────────────
// Read-only React over the core's one studioCalendar projection. Dates,
// occupancy, priority, amounts, and conditional release boundaries are already
// resolved by core; this screen only formats facts and emits navigation intents.

import { useEffect, useMemo, useRef, useState } from 'react'
import type {
  GameState,
  StudioCalendarCommitmentView,
  StudioCalendarDecisionView,
  StudioCalendarView,
} from '../engine/adapter.ts'
import { studioCalendarBoard } from '../engine/adapter.ts'
import { moneyExact } from '../format.ts'
import { StudioDevelopmentPreview } from './StudioDevelopment.tsx'

export type StudioCalendarRoute =
  | { kind: 'script'; projectId: string }
  | { kind: 'casting'; projectId: string; sessionId: string }
  | { kind: 'production'; productionId: string }
  | { kind: 'theatricalRun'; productionId: string }
  | { kind: 'contract'; talentId: string }
  | { kind: 'studioDevelopment' }

function decisionCopy(
  decision: StudioCalendarDecisionView | null,
  productionOutlook: StudioCalendarView['productionOutlook'] = [],
): {
  headline: string
  detail: string
  label: string | null
  route: StudioCalendarRoute | null
} {
  if (decision === null) {
    return {
      headline: 'No decision waiting',
      detail: 'No screenplay, casting, or production command currently blocks unattended simulation.',
      label: null,
      route: null,
    }
  }
  switch (decision.kind) {
    case 'scriptReview':
      return {
        headline: `${decision.title} needs screenplay review`,
        detail: 'The Writers Room owns the exact Accept or Rewrite choice.',
        label: 'Open screenplay review',
        route: { kind: 'script', projectId: decision.projectId },
      }
    case 'castingReview':
      return {
        headline: `${decision.title} needs casting review`,
        detail: 'The Casting Room owns acknowledgement and the live package gate.',
        label: 'Open casting review',
        route: {
          kind: 'casting',
          projectId: decision.projectId,
          sessionId: decision.sessionId,
        },
      }
    case 'productionOperation':
      const production = productionOutlook.find(
        (candidate) => candidate.productionId === decision.productionId,
      )
      return {
        headline: production
          ? `${production.title} needs a production command`
          : 'A production command is waiting',
        detail: 'The Production Board owns the exact current command and its consequences.',
        label: 'Open Production Board',
        route: { kind: 'production', productionId: decision.productionId },
      }
  }
}

function commitmentRoute(event: StudioCalendarCommitmentView): StudioCalendarRoute {
  switch (event.kind) {
    case 'scriptDue':
      return { kind: 'script', projectId: event.projectId }
    case 'castingDue':
      return { kind: 'casting', projectId: event.projectId, sessionId: event.sessionId }
    case 'constructionCompletion':
      return { kind: 'studioDevelopment' }
    case 'theatricalReceipt':
      return { kind: 'theatricalRun', productionId: event.productionId }
    case 'contractRenewal':
    case 'contractExpiry':
      return { kind: 'contract', talentId: event.talentId }
  }
}

function commitmentCopy(event: StudioCalendarCommitmentView): {
  title: string
  detail: string
  action: string
  ariaLabel: string
} {
  switch (event.kind) {
    case 'scriptDue':
      return {
        title: `${event.title} · ${event.activity === 'drafting' ? 'Draft due' : 'Rewrite due'}`,
        detail: `Completes on the advance that arrives at Week ${event.week}.`,
        action: 'Open Writers Room',
        ariaLabel: `Open ${event.title} in Writers Room`,
      }
    case 'castingDue':
      return {
        title: `${event.title} · Camera tests due`,
        detail: `Results arrive on the advance that reaches Week ${event.week}.`,
        action: 'Open Casting Room',
        ariaLabel: `Open ${event.title} in Casting Room`,
      }
    case 'constructionCompletion':
      return {
        title: `${event.title} · Construction completes`,
        detail: `Becomes Operational on the advance that reaches Week ${event.week}, after that advance's automatic allocations.`,
        action: 'Open Studio Development',
        ariaLabel: `Open ${event.title} in Studio Development`,
      }
    case 'theatricalReceipt':
      return {
        title: `${event.title} · Studio Revenue ${moneyExact(event.studioRevenue)}`,
        detail: `Payment ${event.paymentOrdinal} of ${event.totalPayments} arrives on the advance to Week ${event.week}.`,
        action: 'Open theatrical run',
        ariaLabel: `Open ${event.title} theatrical run for payment ${event.paymentOrdinal}`,
      }
    case 'contractRenewal':
      return {
        title: `${event.talentName} · Renewal window${event.alreadyOpen ? ' open' : ' opens'}`,
        detail: `${moneyExact(event.weeklySalary)} weekly salary · ${event.alreadyOpen ? 'Opened at' : 'Opens at'} Week ${event.week}.`,
        action: 'Open Studio Roster',
        ariaLabel: `Open ${event.talentName} renewal in Studio Roster`,
      }
    case 'contractExpiry':
      return {
        title: `${event.talentName} · Contract ends`,
        detail: `Exclusive end Week ${event.week}; final active payroll is processed before the advance arrives there.`,
        action: 'Open Studio Roster',
        ariaLabel: `Open ${event.talentName} contract expiry in Studio Roster`,
      }
  }
}

function nextBoundaryCopy(calendar: StudioCalendarView): string {
  const nextWeek = calendar.summary.nextCommittedWeek
  if (nextWeek === null) return 'No committed future boundary'
  const count = calendar.commitments.filter((event) => event.week === nextWeek).length
  return `Week ${nextWeek} · ${count} committed event${count === 1 ? '' : 's'}`
}

function nextDecisionHeadline(calendar: StudioCalendarView): string {
  return decisionCopy(calendar.nextDecision, calendar.productionOutlook).headline
}

function activityLabel(activity: string): string {
  const labels: Record<string, string> = {
    development: 'Development',
    preProduction: 'Pre-production',
    rehearsal: 'Rehearsal',
    shooting: 'Shooting',
    postProduction: 'Post-production',
    releaseReady: 'Release Ready',
    drafting: 'Drafting',
    rewriting: 'Rewriting',
    auditioning: 'Auditioning',
  }
  return labels[activity] ?? activity
}

function capabilityLabel(capability: string): string {
  const labels: Record<string, string> = {
    'development-casting': 'Development & Casting',
    soundstage: 'Soundstage',
    'set-scenery': 'Scenery Shop',
    post: 'Post Building',
  }
  return labels[capability] ?? capability
}

function ownerLabel(owner: string): string {
  return owner === 'script' ? 'screenplay' : owner === 'casting' ? 'casting session' : 'production'
}

export function StudioCalendarPreview({
  state,
  onOpen,
}: {
  state: GameState
  onOpen?: () => void
}) {
  const calendar = useMemo(() => studioCalendarBoard(state), [state])
  const busiest = calendar.staffingHorizon.busiestExpiry
  return (
    <section className="card calendar-preview" aria-labelledby="calendar-preview-heading" data-testid="calendar-preview">
      <div className="spread calendar-preview-heading">
        <div>
          <div className="eyebrow">Operating plan · Week {calendar.currentWeek}</div>
          <h2 id="calendar-preview-heading">Studio Calendar</h2>
        </div>
        <button
          type="button"
          className="accent"
          onClick={onOpen}
          disabled={!onOpen}
          data-testid="open-studio-calendar"
        >
          Open calendar
        </button>
      </div>
      <div className="calendar-preview-grid">
        <div>
          <span className="hint">Next decision</span>
          <strong>{nextDecisionHeadline(calendar)}</strong>
        </div>
        <div>
          <span className="hint">Next committed boundary</span>
          <strong>{nextBoundaryCopy(calendar)}</strong>
        </div>
        <div>
          <span className="hint">Facility utilization</span>
          <strong>
            {calendar.mode === 'managed'
              ? `${calendar.summary.occupiedSlots} of ${calendar.summary.facilityCapacity} slots occupied`
              : 'Legacy studio · no managed facility board'}
          </strong>
        </div>
        <div>
          <span className="hint">Busiest staffing expiry</span>
          <strong>
            {busiest
              ? `${busiest.contractCount} of ${busiest.rosterCount} contracts · Week ${busiest.week}`
              : 'No active contract expiry cluster'}
          </strong>
        </div>
      </div>
    </section>
  )
}

export function StudioCalendar({
  state,
  onNavigate,
  onBack,
}: {
  state: GameState
  onNavigate: (route: StudioCalendarRoute) => void
  onBack: () => void
}) {
  const calendar = useMemo(() => studioCalendarBoard(state), [state])
  const headingRef = useRef<HTMLHeadingElement | null>(null)
  const decision = decisionCopy(calendar.nextDecision, calendar.productionOutlook)
  const [operationalAnnouncement, setOperationalAnnouncement] = useState('')

  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  useEffect(() => {
    const development = calendar.studioDevelopment
    setOperationalAnnouncement(
      development.status === 'operational'
        ? `${development.name} is Operational. Development & Casting capacity is now ${development.currentDevelopmentCastingCapacity} shared slots.`
        : '',
    )
  }, [
    calendar.studioDevelopment.currentDevelopmentCastingCapacity,
    calendar.studioDevelopment.name,
    calendar.studioDevelopment.status,
  ])

  return (
    <main className="app-shell stack calendar-screen" data-testid="studio-calendar">
      <div
        className="visually-hidden"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        data-testid="calendar-annex-operational-announcement"
      >
        {operationalAnnouncement}
      </div>
      <header className="spread card calendar-header">
        <div>
          <div className="eyebrow">Studio operations · Week {calendar.currentWeek}</div>
          <h1 ref={headingRef} tabIndex={-1}>Studio Calendar &amp; Capacity Board</h1>
          <p className="hint">
            Committed work and receipts are exact. Production release dates are conditional on commands and facility access.
          </p>
        </div>
        <button type="button" onClick={onBack} data-testid="calendar-back">Back to studio</button>
      </header>

      {calendar.mode === 'legacy' && (
        <div className="warn" role="status" data-testid="calendar-legacy">
          Legacy operations: this studio keeps its original production countdown. No managed facilities or reservations are inferred.
        </div>
      )}

      <section className="card stack calendar-attention" aria-labelledby="calendar-attention-heading">
        <div className="spread">
          <div>
            <div className="eyebrow">Authoritative priority</div>
            <h2 id="calendar-attention-heading">Needs attention</h2>
          </div>
          <span className={`tag ${calendar.nextDecision ? 'warning' : 'fact'}`}>
            {calendar.nextDecision ? 'Decision required' : 'Clear'}
          </span>
        </div>
        <strong data-testid="calendar-next-decision">{decision.headline}</strong>
        <p className="hint">{decision.detail}</p>
        {decision.route && decision.label && (
          <button
            type="button"
              className="accent calendar-owner-action"
              onClick={() => onNavigate(decision.route!)}
              aria-label={`${decision.label}: ${decision.headline}`}
              data-testid="calendar-next-decision-open"
          >
            {decision.label}
          </button>
        )}
      </section>

      <section className="card stack" aria-labelledby="calendar-facilities-heading">
        <div className="spread">
          <div>
            <h2 id="calendar-facilities-heading">This week on the lot</h2>
            <p className="hint">Exact current reservations only; future phases are not bookings.</p>
          </div>
          <span className="tag fact">Exact occupancy</span>
        </div>
        <p className="mono calendar-utilization" data-testid="calendar-utilization">
          {calendar.mode === 'managed'
            ? `${calendar.summary.occupiedSlots} of ${calendar.summary.facilityCapacity} slots occupied · ${calendar.summary.availableSlots} available`
            : 'No managed facilities exist in this legacy studio.'}
        </p>
        {calendar.facilities.length === 0 ? (
          <div className="empty" data-testid="calendar-no-facilities">
            No managed facility inventory is available to display.
          </div>
        ) : (
          <div className="calendar-facility-grid" data-testid="calendar-facilities">
            {calendar.facilities.map((facility) => (
              <article
                className="panel stack calendar-facility"
                key={facility.facilityId}
                data-testid={`calendar-facility-${facility.facilityId}`}
              >
                <div className="spread">
                  <div>
                    <strong>{facility.facilityName}</strong>
                    <div className="hint">{capabilityLabel(facility.capability)}</div>
                  </div>
                  <span className="mono">{facility.occupied}/{facility.capacity}</span>
                </div>
                <div className="stack calendar-slot-list">
                  {facility.slots.map((slot) => (
                    <div className="inset calendar-slot" key={slot.slot} data-testid={`calendar-slot-${facility.facilityId}-${slot.slot}`}>
                      <span className="hint">Slot {slot.slot + 1}</span>
                      {slot.occupant === null ? (
                        <strong>Available</strong>
                      ) : (
                        <>
                          <strong>{slot.occupant.title}</strong>
                          <span>{activityLabel(slot.occupant.activity)} · {ownerLabel(slot.occupant.owner)}</span>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <StudioDevelopmentPreview
        state={state}
        onOpen={() => onNavigate({ kind: 'studioDevelopment' })}
      />

      <section className="card stack" aria-labelledby="calendar-commitments-heading">
        <div className="spread">
          <div>
            <h2 id="calendar-commitments-heading">Committed schedule</h2>
            <p className="hint">Persisted due work, construction completion, locked Studio Revenue receipts, and contract boundaries.</p>
          </div>
          <span className="tag fact">Committed</span>
        </div>
        {calendar.commitments.length === 0 ? (
          <div className="empty" data-testid="calendar-no-commitments">
            No future work, construction, receipt, renewal, or expiry boundary is currently committed.
          </div>
        ) : (
          <ol className="calendar-event-list" data-testid="calendar-commitments">
            {calendar.commitments.map((event) => {
              const copy = commitmentCopy(event)
              return (
                <li className="panel calendar-event" key={`${event.kind}:${event.ownerId}:${event.occurrenceIndex}`}>
                  <div className="calendar-week" aria-label={`Week ${event.week}`}>Week {event.week}</div>
                  <div className="calendar-event-copy">
                    <strong>{copy.title}</strong>
                    <span className="hint">{copy.detail}</span>
                  </div>
                  <button
                    type="button"
                    className="ghost"
                    onClick={() => onNavigate(commitmentRoute(event))}
                    aria-label={copy.ariaLabel}
                    data-testid={`calendar-event-open-${event.kind}-${event.ownerId}-${event.occurrenceIndex}`}
                  >
                    {copy.action}
                  </button>
                </li>
              )
            })}
          </ol>
        )}
      </section>

      <section className="card stack" aria-labelledby="calendar-production-heading">
        <div className="spread">
          <div>
            <h2 id="calendar-production-heading">Production outlook</h2>
            <p className="hint">Progress is exact; release boundaries assume every command and allocation succeeds before advance.</p>
          </div>
          <span className="tag estimate">Conditional</span>
        </div>
        {calendar.productionOutlook.length === 0 ? (
          <div className="empty" data-testid="calendar-no-productions">
            No active production has a conditional release outlook.
          </div>
        ) : (
          <div className="grid grid-2" data-testid="calendar-productions">
            {calendar.productionOutlook.map((production) => (
              <article className={`panel stack calendar-production calendar-production-${production.status}`} key={production.productionId}>
                <div className="spread">
                  <div>
                    <strong>{production.title}</strong>
                    <div className="hint">{production.phaseLabel}</div>
                  </div>
                  <span className={`tag ${production.status === 'held' || production.status === 'decision-required' ? 'warning' : 'fact'}`}>
                    {production.statusLabel}
                  </span>
                </div>
                <dl className="calendar-facts">
                  <div><dt>Progress countdown</dt><dd>{production.remainingTicks} week{production.remainingTicks === 1 ? '' : 's'} left</dd></div>
                  <div><dt>Conditional release</dt><dd>Week {production.conditionalReleaseWeek}</dd></div>
                  <div><dt>Current facilities</dt><dd>{production.facilities.length > 0 ? production.facilities.map((facility) => facility.facilityName).join(' + ') : 'No facility reserved'}</dd></div>
                </dl>
                {production.blocker && (
                  <div className="warn" role="status">
                    <strong>{production.blocker.headline}</strong>
                    <div>{production.blocker.detail}</div>
                    <div className="hint">{production.blocker.consequence}</div>
                  </div>
                )}
                <p className="hint">{production.releaseAssumption}</p>
                {production.status !== 'held' && (
                  <button
                    type="button"
                    className="ghost calendar-owner-action"
                    onClick={() => onNavigate({ kind: 'production', productionId: production.productionId })}
                    aria-label={`View ${production.title} on Production Board`}
                  >
                    View on Production Board
                  </button>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="card stack" aria-labelledby="calendar-staffing-heading">
        <div>
          <h2 id="calendar-staffing-heading">Staffing horizon</h2>
          <p className="hint">Exact active-contract boundaries; no prediction of renewal choices or departures.</p>
        </div>
        {calendar.staffingHorizon.busiestExpiry ? (
          <div className="warn calendar-cluster" data-testid="calendar-expiry-cluster">
            <strong>
              {calendar.staffingHorizon.busiestExpiry.contractCount} of {calendar.staffingHorizon.busiestExpiry.rosterCount} active contracts end at Week {calendar.staffingHorizon.busiestExpiry.week}
            </strong>
            <span>
              {(calendar.staffingHorizon.busiestExpiry.rosterShare * 100).toFixed(1)}% of the current roster · {moneyExact(calendar.staffingHorizon.busiestExpiry.weeklyPayroll)} in associated weekly payroll · observed cluster, not a forecast of departures.
            </span>
          </div>
        ) : (
          <div className="empty" data-testid="calendar-no-expiry-cluster">No active contract expiry cluster exists.</div>
        )}
        {calendar.staffingHorizon.contracts.length > 0 && (
          <div className="calendar-contract-grid" data-testid="calendar-contracts">
            {calendar.staffingHorizon.contracts.map((contract) => (
              <article
                className="inset stack"
                key={contract.talentId}
                data-testid={`calendar-contract-${contract.talentId}`}
              >
                <div className="spread">
                  <strong>{contract.talentName}</strong>
                  <span className={`tag ${contract.renewalOpen ? 'warning' : 'fact'}`}>
                    {contract.renewalOpen ? 'Renewal open' : `${contract.remainingWeeks} wk left`}
                  </span>
                </div>
                <span>Renewal opens Week {contract.renewalWindowWeek} · exclusive end Week {contract.endWeekExclusive}</span>
                <span className="hint">{moneyExact(contract.weeklySalary)} weekly salary</span>
                <button
                  type="button"
                  className="ghost"
                  onClick={() => onNavigate({ kind: 'contract', talentId: contract.talentId })}
                  aria-label={`Open ${contract.talentName} staffing details in Studio Roster`}
                >
                  Open Studio Roster
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
