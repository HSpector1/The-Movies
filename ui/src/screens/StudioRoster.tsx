// ── Studio Roster (D-11.3 / .7 / .9 / .19) ───────────────────────────────────
// Manage the contracted roster: review payroll & runway, renew contracts inside
// their renewal window, and release talent (with the exact termination cost shown
// before a confirm). Filters let the player narrow by profession or to contracts in
// their renewal window. Every value shown comes from the adapter — nothing is
// recomputed here. Renew/release call the adapter action wrappers; on ok the parent
// receives the next state via onChange.

import { useEffect, useRef, useState } from 'react'
import type { GameState, EmploymentCard, CreativeRole } from '../engine/adapter.ts'
import {
  rosterCards,
  payrollSummary,
  renewContractAction,
  renewOfferTruths,
  releaseTalentAction,
} from '../engine/adapter.ts'
import { money, moneyExact, starPower } from '../format.ts'
import { Metric } from '../components/common.tsx'

type ProfessionFilter = 'all' | CreativeRole

const ROLE_LABEL: Record<CreativeRole, string> = {
  actor: 'Actor',
  director: 'Director',
  writer: 'Writer',
  craft: 'Craft',
}

const STATUS_LABEL: Record<string, string> = {
  contracted: 'Contracted',
  engagedFreelancer: 'Engaged freelancer',
  availableFreelancer: 'Available freelancer',
  freeAgent: 'Free agent',
  unavailable: 'Unavailable',
}


export function StudioRoster({
  state,
  onChange,
  onBack,
  onOpenProfile,
  focusTalentId,
  focusHeadingOnMount,
}: {
  state: GameState
  onChange: (next: GameState) => void
  onBack: () => void
  onOpenProfile?: ((id: string) => void) | undefined
  /** Navigation-only handoff from the Studio Calendar. */
  focusTalentId?: string
  /** Generic roster destination without claiming an exact person identity. */
  focusHeadingOnMount?: boolean
}) {
  const [profession, setProfession] = useState<ProfessionFilter>('all')
  const [renewalsOnly, setRenewalsOnly] = useState(false)
  const [pendingRelease, setPendingRelease] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const cardRefs = useRef(new Map<string, HTMLDivElement>())
  const headingRef = useRef<HTMLHeadingElement | null>(null)
  const pendingInitialFocus = useRef(focusTalentId ?? null)
  const pendingHeadingFocus = useRef(
    focusTalentId === undefined && focusHeadingOnMount === true,
  )

  const payroll = payrollSummary(state)
  const all = rosterCards(state)
  const cards = all.filter((c) => {
    if (profession !== 'all' && c.profile.role !== profession) return false
    if (renewalsOnly && !(c.employment.contract?.renewalOpen ?? false)) return false
    return true
  })

  useEffect(() => {
    const talentId = pendingInitialFocus.current
    if (talentId !== null) {
      const target = cardRefs.current.get(talentId)
      if (target) target.focus()
      else headingRef.current?.focus()
      pendingInitialFocus.current = null
      return
    }
    if (pendingHeadingFocus.current) {
      headingRef.current?.focus()
      pendingHeadingFocus.current = false
    }
  }, [all])

  function renew(talentId: string, termWeeks: number) {
    const out = renewContractAction(state, talentId, termWeeks)
    if (out.ok) {
      setError(null)
      onChange(out.next)
    } else {
      setError(out.error)
    }
  }

  function release(talentId: string) {
    const out = releaseTalentAction(state, talentId)
    if (out.ok) {
      setError(null)
      setPendingRelease(null)
      onChange(out.next)
    } else {
      setError(out.error)
    }
  }

  return (
    <div className="app-shell">
      <div className="topbar">
        <div className="brand">
          <span className="mark">PROJECT: STUDIO</span>
          <span className="sub">Studio Roster</span>
        </div>
        <div className="row" style={{ gap: 24 }}>
          <button className="ghost" onClick={onBack} data-testid="roster-back">
            Back
          </button>
        </div>
      </div>

      <div className="card stack">
        <h2>Payroll &amp; runway</h2>
        <div className="row" style={{ gap: 24 }}>
          <Metric label="Cash" small testid="roster-cash">
            <span className={payroll.cash < 0 ? 'money neg' : 'money pos'}>{money(payroll.cash)}</span>
          </Metric>
          <Metric label="Weekly payroll" small testid="roster-weekly">
            {money(payroll.weeklyPayroll)}
          </Metric>
          <Metric label="Annual payroll" small testid="roster-annual">
            {money(payroll.annualPayroll)}
          </Metric>
          <Metric label="Projected obligations" small testid="roster-obligations">
            {money(payroll.projectedObligations)}
          </Metric>
          <Metric label="Upcoming renewals" small testid="roster-renewals">
            {payroll.upcomingRenewals}
          </Metric>
          {/* D-17A/T1: THE studio runway — the identical figure the Dashboard shows. Payroll
              alone is a cost line above, never a second, longer-looking "runway". */}
          <Metric label="Runway" small testid="roster-runway">
            {payroll.runway.infinite ? '—' : `${payroll.runway.weeks} wk`}
          </Metric>
        </div>
        <p className="hint" style={{ marginTop: 0 }}>
          Runway is the studio-wide figure shown on the Dashboard: how many weeks current cash
          lasts against weekly payroll <em>and</em> overhead, less any revenue from films already
          in theaters. Weekly and annual payroll above are cost lines, not a runway of their own.
        </p>
      </div>

      <div style={{ height: 16 }} />

      <div className="card stack">
        <div className="spread">
          <h2 ref={headingRef} tabIndex={-1} data-testid="roster-heading">Roster</h2>
          <div className="row" style={{ gap: 16 }}>
            <label className="row" style={{ gap: 6 }}>
              <span className="hint">Profession</span>
              <select
                value={profession}
                onChange={(e) => setProfession(e.target.value as ProfessionFilter)}
                data-testid="roster-filter-profession"
              >
                <option value="all">All</option>
                <option value="actor">Actors</option>
                <option value="director">Directors</option>
                <option value="writer">Writers</option>
                <option value="craft">Craft</option>
              </select>
            </label>
            <label className="row" style={{ gap: 6 }}>
              <input
                type="checkbox"
                checked={renewalsOnly}
                onChange={(e) => setRenewalsOnly(e.target.checked)}
                data-testid="roster-filter-renewals"
              />
              <span className="hint">Renewals only</span>
            </label>
          </div>
        </div>

        {error !== null && (
          <div className="errbox" role="alert" data-testid="error-box">
            {error}
          </div>
        )}

        {cards.length === 0 ? (
          <div className="empty" data-testid="roster-empty">
            No employees match the current filter.
          </div>
        ) : (
          <div className="grid grid-2" data-testid="roster-list">
            {cards.map((card) => (
              <RosterCard
                key={card.profile.id}
                card={card}
                state={state}
                pendingRelease={pendingRelease === card.profile.id}
                onAskRelease={() => setPendingRelease(card.profile.id)}
                onCancelRelease={() => setPendingRelease(null)}
                onConfirmRelease={() => release(card.profile.id)}
                onRenew={renew}
                onOpenProfile={onOpenProfile}
                cardRef={(node) => {
                  if (node) cardRefs.current.set(card.profile.id, node)
                  else cardRefs.current.delete(card.profile.id)
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// One employee card: identity, all four discipline OVRs, potential, contract terms,
// termination cost, and renew/release actions.
function RosterCard({
  card,
  state,
  pendingRelease,
  onAskRelease,
  onCancelRelease,
  onConfirmRelease,
  onRenew,
  onOpenProfile,
  cardRef,
}: {
  card: EmploymentCard
  state: GameState
  pendingRelease: boolean
  onAskRelease: () => void
  onCancelRelease: () => void
  onConfirmRelease: () => void
  onRenew: (talentId: string, termWeeks: number) => void
  onOpenProfile?: ((id: string) => void) | undefined
  cardRef?: (node: HTMLDivElement | null) => void
}) {
  const { profile, employment } = card
  const contract = employment.contract
  const primary = profile.disciplines.find((d) => d.isPrimary)
  const id = profile.id

  // D-17A/T5: renewal terms come from `renewOfferTruths`, which prices each term with the
  // SAME `contractOffer` the renew action itself calls — so the salary, the bonus, the whole
  // guaranteed obligation and its runway consequence are the real ones, not a placeholder set
  // of term lengths with an unknown price (which is what this screen used to offer).
  const renewOffers = renewOfferTruths(state, id)

  return (
    <div
      className="panel stack"
      data-testid={`roster-card-${id}`}
      ref={cardRef}
      tabIndex={-1}
    >
      {onOpenProfile && (
        <button
          type="button"
          className="linkish"
          data-testid={`roster-open-profile-${id}`}
          onClick={() => onOpenProfile(id)}
        >
          View profile
        </button>
      )}
      <div className="spread">
        <strong>{profile.name}</strong>
        <span className="sub">{ROLE_LABEL[profile.role]}</span>
      </div>

      <div className="row" style={{ gap: 16 }}>
        {profile.disciplines.map((d) => (
          <Metric
            key={d.discipline}
            label={d.isPrimary ? `${d.label} ★` : d.label}
            small
            testid={`roster-ovr-${id}-${d.discipline}`}
          >
            {d.ovr}
          </Metric>
        ))}
      </div>

      <div className="spread">
        <span className="hint">Star power: {starPower(profile.fame)}</span>
        <span className="hint">Work ethic: {profile.workEthicLabel}</span>
      </div>
      {primary && (
        <span className="hint">
          <span className="tag estimate" style={{ marginRight: 6 }}>
            Est
          </span>
          {primary.label} potential {primary.potentialTier} · OVR {primary.potentialLow}–
          {primary.potentialHigh}
        </span>
      )}

      <div className="sep" />

      <div className="spread">
        <span className="hint">Status</span>
        <span className="mono">{STATUS_LABEL[employment.status] ?? employment.status}</span>
      </div>
      {!profile.available && profile.engagedIn && (
        <p className="hint" data-testid={`roster-assignment-${id}`}>
          {profile.assignmentKind === 'script'
            ? `${profile.engagedIn} — unavailable until the screenplay reaches review.`
            : `Working on ${profile.engagedIn} — busy until it releases.`}
        </p>
      )}

      {contract === null ? (
        <p className="hint">No active contract.</p>
      ) : (
        <>
          <div className="row" style={{ gap: 24 }}>
            <Metric label="Annual salary" small testid={`roster-salary-${id}`}>
              {money(contract.annualSalary)}
            </Metric>
            <Metric label="Contract ends" small testid={`roster-ends-${id}`}>
              week {contract.endWeekExclusive} · {(contract.remainingWeeks / 52).toFixed(1)} yr left
            </Metric>
            <Metric label="Termination cost" small testid={`roster-termcost-${id}`}>
              {money(contract.terminationCost)}
            </Metric>
          </div>

          {contract.renewalOpen && (
            <div className="stack" data-testid={`roster-renew-${id}`}>
              <span className="hint">Renewal window open</span>
              {renewOffers.map((t) => {
                const wk = (r: { infinite: boolean; weeks: number | null }) =>
                  r.infinite ? '—' : `${r.weeks} wk`
                return (
                  <div className="stack" key={t.termWeeks} style={{ gap: 2 }}>
                    <button
                      className="accent"
                      onClick={() => onRenew(id, t.termWeeks)}
                      data-testid={`roster-renew-${id}-${t.termWeeks}`}
                    >
                      Renew {t.termWeeks / 52} yr · {money(t.annualSalary)}/yr ·{' '}
                      {money(t.obligation.signingBonus)} bonus
                    </button>
                    <span className="hint" data-testid={`offer-obligation-${id}-${t.termWeeks}`}>
                      Commits <strong>{moneyExact(t.obligation.total)}</strong> over {t.termWeeks}{' '}
                      weeks &mdash; {moneyExact(t.obligation.guaranteedComp)} guaranteed salary (
                      {money(t.obligation.weeklySalary)}/wk) plus{' '}
                      {moneyExact(t.obligation.signingBonus)} paid now.
                    </span>
                    <span className="hint" data-testid={`offer-runway-${id}-${t.termWeeks}`}>
                      Runway {wk(t.runway.before)} &rarr; {wk(t.runway.after)}
                      {t.bonusAffordable ? '' : ' · the renewal bonus alone exceeds current cash'}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      <div className="btn-row">
        {pendingRelease ? (
          <>
            <button
              className="primary"
              onClick={onConfirmRelease}
              data-testid={`roster-confirm-release-${id}`}
            >
              Confirm release · costs {money(contract?.terminationCost ?? 0)}
            </button>
            <button className="ghost" onClick={onCancelRelease} data-testid={`roster-cancel-release-${id}`}>
              Cancel
            </button>
          </>
        ) : (
          <button
            className="ghost"
            onClick={onAskRelease}
            disabled={profile.assignmentKind === 'script'}
            title={
              profile.assignmentKind === 'script'
                ? 'This contract cannot be released until the screenplay reaches review.'
                : undefined
            }
            data-testid={`roster-release-${id}`}
          >
            Release
          </button>
        )}
      </div>
    </div>
  )
}
