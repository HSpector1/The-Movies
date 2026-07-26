// ── Founding screen (D-11.2) ─────────────────────────────────────────────────
// The player hires an initial roster from the bounded applicant pool (drawing the
// recruitment fund for signing bonuses, NOT operating cash) and then founds the
// studio once the role minimums are met. Signing keeps the player here (onChange);
// founding leaves the screen (onFounded). Every value shown comes from the adapter —
// no salary/fee/OVR is computed in this component.

import { useState } from 'react'
import type { GameState, EmploymentCard, CreativeRole } from '../engine/adapter.ts'
import {
  foundingBudgetRemaining,
  foundingCoverage,
  foundingApplicantCards,
  canFoundStudio,
  foundStudioAction,
  signContractAction,
  payrollSummary,
  selectCash,
} from '../engine/adapter.ts'
import { money, starPower, ageYears } from '../format.ts'
import { Metric } from '../components/common.tsx'

// Applicant roles in the order the pool is grouped for display.
const ROLE_ORDER: readonly CreativeRole[] = ['actor', 'director', 'writer', 'craft']
const ROLE_GROUP_LABEL: Record<CreativeRole, string> = {
  actor: 'Actors',
  director: 'Directors',
  writer: 'Writers',
  craft: 'Production / Craft',
}

// Human role label for a single card header.
const ROLE_LABEL: Record<CreativeRole, string> = {
  actor: 'Actor',
  director: 'Director',
  writer: 'Writer',
  craft: 'Craft',
}

export function FoundingScreen({
  state,
  onChange,
  onCreate,
  onFounded,
}: {
  state: GameState
  onChange: (next: GameState) => void
  onCreate: () => void // D-11.A: open the Talent Creator to add a Custom Applicant
  onFounded: (next: GameState) => void
}) {
  const [error, setError] = useState<string | null>(null)

  const fund = foundingBudgetRemaining(state)
  const cash = selectCash(state)
  const coverage = foundingCoverage(state)
  const payroll = payrollSummary(state)
  const cards = foundingApplicantCards(state)
  const canFound = canFoundStudio(state)

  // Group the applicant pool by role, preserving draft order within each group.
  const grouped: Record<CreativeRole, EmploymentCard[]> = {
    actor: [],
    director: [],
    writer: [],
    craft: [],
  }
  for (const card of cards) grouped[card.profile.role].push(card)

  function sign(talentId: string, termWeeks: number) {
    const out = signContractAction(state, talentId, termWeeks)
    if (out.ok) {
      setError(null)
      onChange(out.next)
    } else {
      setError(out.error)
    }
  }

  function found() {
    const out = foundStudioAction(state)
    if (out.ok) {
      setError(null)
      onFounded(out.next)
    } else {
      setError(out.error)
    }
  }

  return (
    <div className="app-shell">
      <div className="topbar">
        <div className="brand">
          <span className="mark">PROJECT: STUDIO</span>
          <span className="sub">Founding your studio</span>
        </div>
        <div className="row" style={{ gap: 24 }}>
          <Metric label="Recruitment fund" testid="founding-fund">
            <span className="money pos">{money(fund)}</span>
          </Metric>
          <Metric label="Operating cash" testid="founding-cash">
            <span className={cash < 0 ? 'money neg' : 'money pos'}>{money(cash)}</span>
          </Metric>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card stack">
          <h2>Roster requirements</h2>
          <div className="stack" data-testid="founding-coverage">
            {coverage.map((row) => (
              <div className="spread" key={row.role} data-testid={`founding-coverage-${row.role}`}>
                <span>{row.label}</span>
                <span className="mono">
                  {row.met ? '✓ ' : ''}
                  {row.count}/{row.min}
                </span>
              </div>
            ))}
          </div>
          <p className="hint">
            Signing bonuses draw the recruitment fund, not your operating cash. Meet every role
            minimum to found the studio.
          </p>
        </div>

        <div className="card stack">
          <h2>Payroll outlook</h2>
          <p className="hint">Updates as you sign. Weekly salary begins once the studio is founded.</p>
          <div className="row" style={{ gap: 24 }}>
            <Metric label="Weekly payroll" small testid="founding-weekly">
              {money(payroll.weeklyPayroll)}
            </Metric>
            <Metric label="Annual payroll" small testid="founding-annual">
              {money(payroll.annualPayroll)}
            </Metric>
            <Metric label="Runway" small testid="founding-runway">
              {payroll.runwayWeeks === null ? '—' : `${payroll.runwayWeeks} wks`}
            </Metric>
          </div>
        </div>
      </div>

      <div style={{ height: 16 }} />

      <div className="card stack">
        <div className="spread">
          <h2>Applicant pool</h2>
          <div className="btn-row">
            <button className="ghost" onClick={onCreate} data-testid="founding-create-applicant">
              Create Custom Applicant
            </button>
            <button
              className="accent"
              onClick={found}
              disabled={!canFound}
              data-testid="found-studio"
            >
              Found the studio
            </button>
          </div>
        </div>
        <p className="hint">
          A custom applicant joins this pool and is signed under the same recruitment-fund
          rules — creating them does not employ them.
        </p>
        {!canFound && (
          <p className="hint">
            Found the studio once every role minimum above is met (✓). Freelancers can later cover
            occasional gaps on a per-film basis.
          </p>
        )}

        {error !== null && (
          <div className="errbox" role="alert" data-testid="error-box">
            {error}
          </div>
        )}

        {cards.length === 0 ? (
          <div className="empty" data-testid="founding-empty">
            No applicants available.
          </div>
        ) : (
          ROLE_ORDER.map((role) => {
            const group = grouped[role]
            if (group.length === 0) return null
            return (
              <div className="stack" key={role} data-testid={`founding-group-${role}`}>
                <h3>{ROLE_GROUP_LABEL[role]}</h3>
                <div className="grid grid-2">
                  {group.map((card) => (
                    <ApplicantCard key={card.profile.id} card={card} onSign={sign} />
                  ))}
                </div>
              </div>
            )
          })
        )}
      </div>

      <p className="hint" style={{ marginTop: 16 }}>
        This bounded pool is who is available to found with. There is no guaranteed superstar —
        build a balanced roster and hire freelancers for one-off gaps later.
      </p>
    </div>
  )
}

// One applicant card: identity + primary-discipline read + sign offers (or a Signed tag).
function ApplicantCard({
  card,
  onSign,
}: {
  card: EmploymentCard
  onSign: (talentId: string, termWeeks: number) => void
}) {
  const { profile, employment } = card
  const primary = profile.disciplines.find((d) => d.isPrimary)
  const signed = employment.status === 'contracted'

  return (
    <div className="panel stack" data-testid={`founding-card-${profile.id}`}>
      <div className="spread">
        <strong>{profile.name}</strong>
        {signed ? (
          <span className="tag fact" data-testid={`founding-signed-${profile.id}`}>
            Signed
          </span>
        ) : (
          <span className="sub">{ROLE_LABEL[profile.role]}</span>
        )}
      </div>

      <div className="row" style={{ gap: 24 }}>
        {primary && (
          <Metric label={`${primary.label} OVR`} small>
            {primary.ovr} · {primary.tier}
          </Metric>
        )}
        <Metric label="Star power" small>
          {starPower(profile.fame)}
        </Metric>
        <Metric label="Age" small>
          {ageYears(profile.age)}
        </Metric>
      </div>

      <div className="spread">
        <span className="hint">Work ethic: {profile.workEthicLabel}</span>
        {primary && (
          <span className="hint">
            <span className="tag estimate" style={{ marginRight: 6 }}>
              Est
            </span>
            {primary.potentialTier} · OVR {primary.potentialLow}–{primary.potentialHigh}
          </span>
        )}
      </div>

      {signed ? (
        <p className="hint">On the founding roster.</p>
      ) : employment.offerOptions.length === 0 ? (
        <p className="hint">No offers available.</p>
      ) : (
        <div className="btn-row">
          {employment.offerOptions.map((offer) => (
            <button
              key={offer.termWeeks}
              className="primary"
              onClick={() => onSign(profile.id, offer.termWeeks)}
              data-testid={`founding-sign-${profile.id}-${offer.termWeeks}`}
            >
              {offer.termWeeks / 52} yr · {money(offer.annualSalary)}/yr · {money(offer.signingBonus)}{' '}
              bonus
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
