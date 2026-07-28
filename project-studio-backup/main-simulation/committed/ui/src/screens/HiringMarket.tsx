// ── Hiring Market (D-11.6 / .10) ─────────────────────────────────────────────
// Two markets, one screen. The CONTRACT market lists free agents the studio can sign
// to ongoing payroll (offer options per card). The FREELANCER market is informational
// only: it shows the one-film premium fee for each available freelancer, but freelancers
// are chosen during film assembly, not signed here. A sort control lets the player weigh
// an expensive star against an affordable specialist. Every value comes from the adapter —
// no salary/fee/OVR is computed here.

import { useState } from 'react'
import type { GameState, EmploymentCard, CreativeRole } from '../engine/adapter.ts'
import {
  hiringMarketCards,
  freelancerMarketCards,
  signContractAction,
  selectCash,
} from '../engine/adapter.ts'
import { money, starPower, ageYears } from '../format.ts'
import { Metric } from '../components/common.tsx'

// D-11.19: sortable by OVR, salary, Star Power, Potential, Work Ethic, contract
// value, and specialty. All keys read values the adapter returns (nothing computed).
type SortKey = 'ovr' | 'salary' | 'starPower' | 'potential' | 'workEthic' | 'contractValue' | 'specialty'
const SORT_LABELS: Record<SortKey, string> = {
  ovr: 'Primary OVR (high→low)',
  salary: '2-year salary (low→high)',
  starPower: 'Star Power (high→low)',
  potential: 'Potential (high→low)',
  workEthic: 'Work Ethic (high→low)',
  contractValue: 'Contract value (high→low)',
  specialty: 'Specialty peak (high→low)',
}

const ROLE_LABEL: Record<CreativeRole, string> = {
  actor: 'Actor',
  director: 'Director',
  writer: 'Writer',
  craft: 'Craft',
}

// Primary-discipline OVR for a card (0 if somehow absent) — used for the sort key only.
function primaryOvr(card: EmploymentCard): number {
  return card.profile.disciplines.find((d) => d.isPrimary)?.ovr ?? 0
}

// The annual salary of the ~2-year offer (or the first offer). Sort key only.
function twoYearAnnual(card: EmploymentCard): number {
  const offers = card.employment.offerOptions
  if (offers.length === 0) return 0
  const twoYear = offers.find((o) => o.termWeeks === 104)
  return (twoYear ?? offers[0]!).annualSalary
}

// Total 2-year contract value = annual × 2 + signing bonus. Sort key only.
function twoYearValue(card: EmploymentCard): number {
  const offers = card.employment.offerOptions
  if (offers.length === 0) return 0
  const o = offers.find((x) => x.termWeeks === 104) ?? offers[0]!
  return o.annualSalary * 2 + o.signingBonus
}

// Visible Potential estimate (primary discipline band high) and the specialty peak
// (the person's single strongest discipline OVR). Sort keys only; adapter values.
function potentialHigh(card: EmploymentCard): number {
  return card.profile.disciplines.find((d) => d.isPrimary)?.potentialHigh ?? 0
}
function specialtyPeak(card: EmploymentCard): number {
  return Math.max(0, ...card.profile.disciplines.map((d) => d.ovr))
}

// Descending sort score for a key ('salary' negated so it reads low→high).
function sortScore(card: EmploymentCard, key: SortKey): number {
  switch (key) {
    case 'ovr':
      return primaryOvr(card)
    case 'salary':
      return -twoYearAnnual(card)
    case 'starPower':
      return card.profile.fame
    case 'potential':
      return potentialHigh(card)
    case 'workEthic':
      return card.profile.workEthic
    case 'contractValue':
      return twoYearValue(card)
    case 'specialty':
      return specialtyPeak(card)
  }
}

export function HiringMarket({
  state,
  onChange,
  onCreate,
  onBack,
}: {
  state: GameState
  onChange: (next: GameState) => void
  onCreate: () => void // D-11.A: open the Talent Creator to add a Custom Talent (free agent)
  onBack: () => void
}) {
  const [sortKey, setSortKey] = useState<SortKey>('ovr')
  const [error, setError] = useState<string | null>(null)

  const cash = selectCash(state)
  const contractCards = [...hiringMarketCards(state)].sort(
    (a, b) => sortScore(b, sortKey) - sortScore(a, sortKey),
  )
  const freelancerCards = freelancerMarketCards(state)

  function sign(talentId: string, termWeeks: number) {
    const out = signContractAction(state, talentId, termWeeks)
    if (out.ok) {
      setError(null)
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
          <span className="sub">Hiring Market</span>
        </div>
        <div className="row" style={{ gap: 24 }}>
          <Metric label="Cash" testid="hiring-cash">
            <span className={cash < 0 ? 'money neg' : 'money pos'}>{money(cash)}</span>
          </Metric>
          <button className="ghost" onClick={onCreate} data-testid="hiring-create-talent">
            Create Custom Talent
          </button>
          <button className="ghost" onClick={onBack} data-testid="hiring-back">
            Back
          </button>
        </div>
      </div>

      {error !== null && (
        <div className="errbox" role="alert" data-testid="error-box">
          {error}
        </div>
      )}

      <div className="card stack">
        <div className="spread">
          <h2>Contract market</h2>
          <label className="row" style={{ gap: 6 }}>
            <span className="hint">Sort by</span>
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              data-testid="hiring-sort"
            >
              {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
                <option key={k} value={k}>
                  {SORT_LABELS[k]}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="hint">
          Contracts are ongoing weekly payroll. Compare an expensive star against an affordable
          specialist before you commit.
        </p>

        {contractCards.length === 0 ? (
          <div className="empty" data-testid="hiring-empty">
            No free agents on the market right now.
          </div>
        ) : (
          <div className="grid grid-2" data-testid="hiring-list">
            {contractCards.map((card) => (
              <HiringCard key={card.profile.id} card={card} onSign={sign} />
            ))}
          </div>
        )}
      </div>

      <div style={{ height: 16 }} />

      <div className="card stack">
        <h2>Freelancer market (one film · premium)</h2>
        <p className="hint">
          Freelancers are hired per-film during assembly, not signed here. The fee shown is a
          one-film premium cost — a contract is ongoing payroll instead.
        </p>

        {freelancerCards.length === 0 ? (
          <div className="empty" data-testid="freelancer-empty">
            No freelancers available right now.
          </div>
        ) : (
          <div className="grid grid-2" data-testid="freelancer-list">
            {freelancerCards.map((card) => (
              <FreelancerCard key={card.profile.id} card={card} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// One signable contract card: identity + primary read + potential + sign offers.
function HiringCard({
  card,
  onSign,
}: {
  card: EmploymentCard
  onSign: (talentId: string, termWeeks: number) => void
}) {
  const { profile, employment } = card
  const primary = profile.disciplines.find((d) => d.isPrimary)
  const id = profile.id

  return (
    <div className="panel stack" data-testid={`hiring-card-${id}`}>
      <div className="spread">
        <strong>{profile.name}</strong>
        <span className="sub">{ROLE_LABEL[profile.role]}</span>
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

      {employment.offerOptions.length === 0 ? (
        <p className="hint">No offers available.</p>
      ) : (
        <div className="btn-row">
          {employment.offerOptions.map((offer) => (
            <button
              key={offer.termWeeks}
              className="primary"
              onClick={() => onSign(id, offer.termWeeks)}
              data-testid={`hiring-sign-${id}-${offer.termWeeks}`}
            >
              Sign {offer.termWeeks / 52} yr · {money(offer.annualSalary)}/yr ·{' '}
              {money(offer.signingBonus)} bonus
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// One informational freelancer card: identity + primary read + the one-film fee. No
// sign button — freelancers are chosen in film assembly.
function FreelancerCard({ card }: { card: EmploymentCard }) {
  const { profile, employment } = card
  const primary = profile.disciplines.find((d) => d.isPrimary)
  const id = profile.id

  return (
    <div className="panel stack" data-testid={`freelancer-card-${id}`}>
      <div className="spread">
        <strong>{profile.name}</strong>
        <span className="sub">{ROLE_LABEL[profile.role]}</span>
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
        <Metric label="One-film fee" small testid={`freelancer-fee-${id}`}>
          {employment.freelancerFee === null ? '—' : money(employment.freelancerFee)}
        </Metric>
      </div>

      <p className="hint">Hired per-film during assembly, not signed here.</p>
    </div>
  )
}
