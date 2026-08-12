// ── Founding screen (D-11.2 / D-11.D) ────────────────────────────────────────
// The player hires an initial roster from the bounded applicant pool (drawing the
// recruitment fund for signing bonuses, NOT operating cash) and founds the studio once
// the role minimums are met. D-11.D: applicants are organized into profession TABS with
// restrained sorting + filtering, richer cards, and per-profession progress; the minimum
// is 3 actors / 1 director / 1 writer / 1 craft. Every value shown comes from the adapter
// — no salary/fee/OVR/percentile is computed in this component.

import { useMemo, useState } from 'react'
import type {
  GameState,
  CreativeRole,
  FoundingApplicantRow,
  FoundingSortKey,
  FoundingFilters,
} from '../engine/adapter.ts'
import {
  foundingBudgetRemaining,
  foundingProgress,
  nextIncompleteProfession,
  foundingApplicantRows,
  sortFoundingRows,
  filterFoundingRows,
  FOUNDING_FILTERS_NONE,
  canFoundStudio,
  foundStudioAction,
  signContractAction,
  payrollSummary,
  foundingRunwayPreview,
  projectedWeeklyOverhead,
  selectCash,
  authoredTierTable,
} from '../engine/adapter.ts'
import { money, starPower, ageYears } from '../format.ts'
import { Metric } from '../components/common.tsx'

// Profession tab order + labels.
const ROLE_ORDER: readonly CreativeRole[] = ['actor', 'director', 'writer', 'craft']
const ROLE_GROUP_LABEL: Record<CreativeRole, string> = {
  actor: 'Actors',
  director: 'Directors',
  writer: 'Writers',
  craft: 'Production / Craft',
}
const ROLE_LABEL: Record<CreativeRole, string> = {
  actor: 'Actor',
  director: 'Director',
  writer: 'Writer',
  craft: 'Craft',
}

// Sort options (label + the authoritative FoundingSortKey the adapter sorts by). Default
// is relevant OVR — never fame alone.
const SORT_OPTIONS: { key: FoundingSortKey; label: string }[] = [
  { key: 'ovr', label: 'Relevant OVR' },
  { key: 'fame', label: 'Star Power' },
  { key: 'potential', label: 'Career Potential' },
  { key: 'workEthic', label: 'Work Ethic' },
  { key: 'salary', label: 'Annual salary (lowest)' },
  { key: 'signingBonus', label: 'Signing bonus (lowest)' },
  { key: 'value', label: 'Value (OVR per $M/yr)' },
  { key: 'age', label: 'Age (youngest)' },
]

// Single-source potential-tier labels (from the adapter's authoritative tier table).
const TIER_LABEL: Record<string, string> = Object.fromEntries(
  authoredTierTable().map((t) => [t.tier, t.label]),
)

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
  const [tab, setTab] = useState<CreativeRole>('actor')
  const [sortKey, setSortKey] = useState<FoundingSortKey>('ovr')
  const [filters, setFilters] = useState<FoundingFilters>(FOUNDING_FILTERS_NONE)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const fund = foundingBudgetRemaining(state)
  const cash = selectCash(state)
  const payroll = payrollSummary(state)
  const foundingRunway = foundingRunwayPreview(state) // shared runway model, incl. post-founding overhead
  const progress = foundingProgress(state)
  const canFound = canFoundStudio(state)
  const nextIncomplete = nextIncompleteProfession(state)
  const tabProgress = progress.find((p) => p.role === tab)!

  const allInTab = foundingApplicantRows(state, tab)
  const rows = useMemo(
    () => sortFoundingRows(filterFoundingRows(allInTab, filters), sortKey),
    [allInTab, filters, sortKey],
  )

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
  const patchFilter = (p: Partial<FoundingFilters>) => setFilters((f) => ({ ...f, ...p }))

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

      {/* A10: set the player's expectation about studio size and capacity up front — the
          original game did not offer Small/Medium/Large starting sizes either, and the
          two-production capacity + separate-team requirement is easy to miss otherwise. */}
      <div className="card stack" data-testid="founding-intro">
        <h2 style={{ marginTop: 0 }}>You are founding a small independent studio</h2>
        <p className="hint" style={{ marginBottom: 0 }}>
          There is no Small / Medium / Large choice — every studio starts the same way, small and
          independent, and grows through the films it makes. Your studio can run{' '}
          <strong>up to two productions at once</strong>, but each production needs its own{' '}
          <strong>complete, available team</strong> (a writer, a director, three cast, and a
          Production/Craft Lead). To staff a second film at the same time you need roster depth —
          extra people beyond one team — or an available freelancer for each open role.
        </p>
      </div>

      <div style={{ height: 16 }} />

      <div className="grid grid-2">
        <div className="card stack">
          <h2>Roster requirements</h2>
          <div className="stack" data-testid="founding-coverage">
            {progress.map((row) => (
              <div className="spread" key={row.role} data-testid={`founding-coverage-${row.role}`}>
                <span>
                  {ROLE_GROUP_LABEL[row.role]}
                  {row.extra > 0 ? ` (+${row.extra} extra)` : ''}
                </span>
                <span className="mono">
                  {row.met ? '✓ ' : ''}
                  {row.count}/{row.min}
                </span>
              </div>
            ))}
          </div>
          <p className="hint">
            Signing bonuses draw the recruitment fund, not your operating cash. <strong>One Writer</strong>{' '}
            is required — a second is optional (there is no assignable role for a second writer until
            persistent scripts).
          </p>
        </div>

        <div className="card stack">
          <h2>Payroll outlook</h2>
          <p className="hint">
            Updates as you sign. Weekly salary and studio overhead both begin once the studio is
            founded; Runway below already includes the overhead this roster will incur.
          </p>
          <div className="row" style={{ gap: 24 }}>
            <Metric label="Weekly payroll" small testid="founding-weekly">
              {money(payroll.weeklyPayroll)}
            </Metric>
            <Metric label="Weekly overhead (once founded)" small testid="founding-overhead">
              {money(projectedWeeklyOverhead(state))}
            </Metric>
            <Metric label="Runway" small testid="founding-runway">
              {/* D-17A/T1: one runway UNIT string across the product ("wk"). */}
              {foundingRunway.infinite ? '—' : `${foundingRunway.weeks} wk`}
            </Metric>
          </div>
        </div>
      </div>

      <div style={{ height: 16 }} />

      <div className="card stack">
        {/* Profession tabs — one active at a time, each showing its own progress. */}
        <div className="btn-row" data-testid="founding-tabs">
          {ROLE_ORDER.map((role) => {
            const pr = progress.find((p) => p.role === role)!
            return (
              <button
                key={role}
                type="button"
                className={tab === role ? 'primary' : 'ghost'}
                onClick={() => setTab(role)}
                data-testid={`founding-tab-${role}`}
              >
                {ROLE_GROUP_LABEL[role]} · {pr.count}/{pr.min}
                {pr.met ? ' ✓' : ''}
              </button>
            )
          })}
        </div>

        <div className="spread">
          <h3 style={{ margin: 0 }} data-testid="founding-tab-progress">
            {ROLE_GROUP_LABEL[tab]} — {tabProgress.count} of {tabProgress.min} required
            {tabProgress.met ? ' ✓' : ''}
          </h3>
          <div className="row" style={{ gap: 8, alignItems: 'center' }}>
            <label className="hint" htmlFor="founding-sort">
              Sort by
            </label>
            <select
              id="founding-sort"
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as FoundingSortKey)}
              data-testid="founding-sort"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.key} value={o.key}>
                  {o.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="ghost"
              onClick={() => setFiltersOpen((o) => !o)}
              data-testid="founding-filters-toggle"
            >
              Filters {filtersOpen ? '−' : '+'}
            </button>
          </div>
        </div>

        {filtersOpen && (
          <div className="panel stack" data-testid="founding-filters">
            <div className="grid grid-3">
              <div className="stack">
                <label className="hint" htmlFor="founding-filter-minovr">
                  Min relevant OVR
                </label>
                <input
                  id="founding-filter-minovr"
                  type="number"
                  min={0}
                  max={99}
                  value={filters.minOVR}
                  onChange={(e) => patchFilter({ minOVR: Number(e.target.value) || 0 })}
                  data-testid="founding-filter-minovr"
                />
              </div>
              <div className="stack">
                <label className="hint" htmlFor="founding-filter-minfame">
                  Min Star Power
                </label>
                <input
                  id="founding-filter-minfame"
                  type="number"
                  min={0}
                  max={100}
                  value={filters.minFame}
                  onChange={(e) => patchFilter({ minFame: Number(e.target.value) || 0 })}
                  data-testid="founding-filter-minfame"
                />
              </div>
              <div className="stack">
                <label className="hint" htmlFor="founding-filter-maxsalary">
                  Max annual salary
                </label>
                <input
                  id="founding-filter-maxsalary"
                  type="number"
                  min={0}
                  step={100000}
                  value={filters.maxSalary ?? ''}
                  onChange={(e) =>
                    patchFilter({ maxSalary: e.target.value === '' ? null : Number(e.target.value) })
                  }
                  data-testid="founding-filter-maxsalary"
                />
              </div>
              <div className="stack">
                <label className="hint" htmlFor="founding-filter-potential">
                  Career Potential ≥
                </label>
                <select
                  id="founding-filter-potential"
                  value={filters.potential}
                  onChange={(e) => patchFilter({ potential: e.target.value as FoundingFilters['potential'] })}
                  data-testid="founding-filter-potential"
                >
                  <option value="any">Any</option>
                  {authoredTierTable().map((t) => (
                    <option key={t.tier} value={t.tier}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="stack">
                <label className="hint" htmlFor="founding-filter-profile">
                  Profile
                </label>
                <select
                  id="founding-filter-profile"
                  value={filters.profile}
                  onChange={(e) => patchFilter({ profile: e.target.value as FoundingFilters['profile'] })}
                  data-testid="founding-filter-profile"
                >
                  <option value="any">Any</option>
                  <option value="specialist">Specialists</option>
                  <option value="multiHyphenate">Multi-hyphenate</option>
                </select>
              </div>
              <div className="stack" style={{ justifyContent: 'flex-end', gap: 4 }}>
                <label className="row" style={{ gap: 6 }}>
                  <input
                    type="checkbox"
                    checked={filters.affordableOnly}
                    onChange={(e) => patchFilter({ affordableOnly: e.target.checked })}
                    data-testid="founding-filter-affordable"
                  />
                  Affordable under fund
                </label>
                <label className="row" style={{ gap: 6 }}>
                  <input
                    type="checkbox"
                    checked={filters.createdOnly}
                    onChange={(e) => patchFilter({ createdOnly: e.target.checked })}
                    data-testid="founding-filter-created"
                  />
                  Created talent only
                </label>
              </div>
            </div>
            <div className="spread">
              <span className="hint" data-testid="founding-filter-count">
                {rows.length} of {allInTab.length} {ROLE_GROUP_LABEL[tab].toLowerCase()} shown
              </span>
              <button
                type="button"
                className="ghost"
                onClick={() => setFilters(FOUNDING_FILTERS_NONE)}
                data-testid="founding-filters-clear"
              >
                Clear filters
              </button>
            </div>
          </div>
        )}

        {error !== null && (
          <div className="errbox" role="alert" data-testid="error-box">
            {error}
          </div>
        )}

        <div className="stack" data-testid={`founding-group-${tab}`}>
          {rows.length === 0 ? (
            <div className="empty" data-testid="founding-tab-empty">
              No {ROLE_GROUP_LABEL[tab].toLowerCase()} match your filters.
            </div>
          ) : (
            <div className="grid grid-2">
              {rows.map((row) => (
                <ApplicantCard key={row.id} row={row} onSign={sign} />
              ))}
            </div>
          )}
        </div>

        <div className="spread">
          <div className="btn-row">
            <button className="ghost" onClick={onCreate} data-testid="founding-create-applicant">
              Create Custom Applicant
            </button>
            {nextIncomplete !== null && nextIncomplete !== tab && (
              <button
                className="primary"
                onClick={() => setTab(nextIncomplete)}
                data-testid="founding-next-profession"
              >
                Next: {ROLE_GROUP_LABEL[nextIncomplete]} →
              </button>
            )}
          </div>
          <button className="accent" onClick={found} disabled={!canFound} data-testid="found-studio">
            Found the studio
          </button>
        </div>
        {!canFound && (
          <p className="hint">
            Found the studio once every role minimum above is met (✓). Freelancers can later cover
            occasional gaps on a per-film basis.
          </p>
        )}
      </div>

      <p className="hint" style={{ marginTop: 16 }}>
        This bounded pool is who is available to found with. There is no guaranteed superstar — build a
        balanced roster and hire freelancers for one-off gaps later.
      </p>
    </div>
  )
}

// One applicant card: identity + relevant read + strengths/concern + market standing + sign
// offers (or a Signed tag). Every value comes from the FoundingApplicantRow (adapter).
function ApplicantCard({
  row,
  onSign,
}: {
  row: FoundingApplicantRow
  onSign: (talentId: string, termWeeks: number) => void
}) {
  const offers = row.card.employment.offerOptions
  return (
    <div className="panel stack" data-testid={`founding-card-${row.id}`}>
      <div className="spread">
        <strong>{row.name}</strong>
        {row.signed ? (
          <span className="tag fact" data-testid={`founding-signed-${row.id}`}>
            Signed
          </span>
        ) : (
          <span className="sub">{ROLE_LABEL[row.role]}</span>
        )}
      </div>

      <div className="row" style={{ gap: 20 }}>
        <Metric label="OVR" small>
          {row.ovr} · {row.ovrTier}
        </Metric>
        <Metric label="Star power" small>
          {starPower(row.fame)}
        </Metric>
        <Metric label="Age" small>
          {ageYears(row.age)}
        </Metric>
      </div>

      <div className="spread">
        <span className="hint">
          Career Potential:{' '}
          <span className="tag estimate" style={{ marginRight: 4 }}>
            Est
          </span>
          {TIER_LABEL[row.potentialTier] ?? row.potentialTier} · OVR ≤ {row.potentialHigh}
        </span>
        <span className="hint">Work ethic: {row.workEthicLabel}</span>
      </div>

      <div className="spread hint">
        <span data-testid={`founding-standing-${row.id}`}>
          ~{row.standingPct}th %ile — {row.standing}
        </span>
        <span>Value: {row.value} OVR/$M</span>
      </div>

      {(row.topStrengths.length > 0 || row.primaryConcern) && (
        <div className="spread hint" data-testid={`founding-notes-${row.id}`}>
          {row.topStrengths.length > 0 && <span>Strengths: {row.topStrengths.join(' · ')}</span>}
          {row.primaryConcern && <span>Concern: {row.primaryConcern}</span>}
        </div>
      )}

      {row.signed ? (
        <p className="hint">On the founding roster.</p>
      ) : offers.length === 0 ? (
        <p className="hint">No offers available.</p>
      ) : (
        <div className="btn-row">
          {offers.map((offer) => (
            <button
              key={offer.termWeeks}
              className="primary"
              onClick={() => onSign(row.id, offer.termWeeks)}
              data-testid={`founding-sign-${row.id}-${offer.termWeeks}`}
            >
              {offer.termWeeks / 52} yr · {money(offer.annualSalary)}/yr · {money(offer.signingBonus)} bonus
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
