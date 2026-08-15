// ── TalentPicker (redesigned candidate cards, CYCLE 3) ───────────────────────
// Choose one talent for a role (writer / director / a cast slot / craft). Each card
// shows ONLY player-visible, ASSIGNMENT-RELEVANT information, all derived from PUBLIC
// engine summaries via the adapter (never actual skills / true ceilings):
//   • the assignment + role-specific OVR + Project Fit for THIS assignment
//   • Expected Performance range + Star Power + salary + relevant genre experience
//   • the top 2–3 assignment-relevant strengths + the most important relevant concern
//   • cross-role status ("Capable but Unproven") where applicable
// The card is EXPANDABLE for full details. Ineligible talent is disabled with a plain
// reason (mirrors the engine's applyActions legality via the adapter's eligibility).
//
// Candidates are DEFAULT-SORTED by Project Fit for this assignment (Fame is never the
// only comparison). Sort + filter controls let the player re-rank/narrow the pool.
//
// The card data comes from adapter.assignmentCard(...) — the ONLY talent-ability path.
// When no assignment context is supplied (a defensive fallback), the picker shows a
// minimal card with the player-visible fields only.

import { useMemo, useState } from 'react'
import type {
  PlayerVisibleTalent,
  CreativeRole,
  CandidateCard,
  Discipline,
  FilmShape,
  FilmPromise,
  CastSlot,
  GameState,
} from '../engine/adapter.ts'
import { talentEligibility, assignmentCard } from '../engine/adapter.ts'
import { money, score, axis, starPower, ageYears } from '../format.ts'

// The assignment context the picker needs to compute per-assignment cards. The parent
// (Assembly) threads the concept/discipline/slot/promise/shape it already has in hand.
export type PickerAssignment = {
  state: GameState
  discipline: Discipline
  conceptId: string
  slot: CastSlot | undefined
  promise: FilmPromise
  shape: FilmShape
  genreLabel: string // human genre name, for the "relevant genre experience" line
}

type SortKey = 'fit' | 'ovr' | 'ep' | 'salary' | 'starPower' | 'genreExp' | 'value'
const SORT_LABELS: Record<SortKey, string> = {
  fit: 'Project Fit',
  ovr: 'Role OVR',
  ep: 'Expected Perf.',
  salary: 'Salary',
  starPower: 'Star Power',
  genreExp: 'Genre Exp.',
  value: 'Value',
}

type ProvenFilter = 'all' | 'proven' | 'unproven'

export function TalentPicker({
  title,
  pool,
  role,
  selectedId,
  chosenElsewhere,
  onSelect,
  onOpenProfile,
  testid,
  assignment,
  freelancerFees,
}: {
  title: string
  pool: PlayerVisibleTalent[]
  role: CreativeRole
  selectedId: string | null
  chosenElsewhere: string[]
  onSelect: (id: string) => void
  onOpenProfile?: ((id: string) => void) | undefined
  testid?: string
  // When present, cards are the rich per-assignment cards (default-sorted by Fit) with
  // sort + filters. When absent, a minimal player-visible fallback card is shown.
  assignment?: PickerAssignment
  // D-11.11: id → one-film freelancer fee for pool members who are Available Freelancers
  // (not studio-contracted). Tags the row "Freelancer" and shows the fee (a direct
  // project cost) instead of a contract salary. Studio talent are on weekly payroll.
  freelancerFees?: Record<string, number>
}) {
  // Compute the rich card for every talent in the pool (perceived-only, via adapter).
  const cards = useMemo(() => {
    if (!assignment) return null
    const map = new Map<string, CandidateCard>()
    for (const t of pool) {
      map.set(
        t.id,
        assignmentCard(
          assignment.state,
          assignment.discipline,
          assignment.conceptId,
          assignment.slot,
          assignment.promise,
          assignment.shape,
          t.id,
        ),
      )
    }
    return map
  }, [assignment, pool])

  if (!assignment || !cards) {
    return (
      <MinimalPicker
        title={title}
        pool={pool}
        role={role}
        selectedId={selectedId}
        chosenElsewhere={chosenElsewhere}
        onSelect={onSelect}
        testid={testid}
      />
    )
  }

  return (
    <RichPicker
      title={title}
      pool={pool}
      role={role}
      selectedId={selectedId}
      chosenElsewhere={chosenElsewhere}
      onSelect={onSelect}
      onOpenProfile={onOpenProfile}
      testid={testid}
      cards={cards}
      genreLabel={assignment.genreLabel}
      freelancerFees={freelancerFees}
    />
  )
}

// ── Rich picker: default-sort by Fit, with sort + filter controls ─────────────
function RichPicker({
  title,
  pool,
  role,
  selectedId,
  chosenElsewhere,
  onSelect,
  onOpenProfile,
  testid,
  cards,
  genreLabel,
  freelancerFees,
}: {
  title: string
  pool: PlayerVisibleTalent[]
  role: CreativeRole
  selectedId: string | null
  chosenElsewhere: string[]
  onSelect: (id: string) => void
  onOpenProfile?: ((id: string) => void) | undefined
  testid: string | undefined
  cards: Map<string, CandidateCard>
  genreLabel: string
  freelancerFees?: Record<string, number> | undefined
}) {
  const [sortKey, setSortKey] = useState<SortKey>('fit') // DEFAULT = Project Fit
  const [proven, setProven] = useState<ProvenFilter>('all')
  const [minFit, setMinFit] = useState(0)
  const [availableOnly, setAvailableOnly] = useState(false)
  const [strongOnly, setStrongOnly] = useState(false) // has at least one strength
  // ── Owner-ruling filters (Phase 5.1 CYCLE 3) — the six enumerated candidate filters
  // that were previously only SORT keys or had no surface. Each narrows the pool by a
  // player-visible card value; none privileges fame (fame stays a SORT option only).
  const [minOvr, setMinOvr] = useState(0) // OVR range (min) over role-OVR shown on the card
  const [maxSalary, setMaxSalary] = useState(Infinity) // salary range (max) over card salary
  const [minStar, setMinStar] = useState(0) // Star Power range (min) over card fame/Star Power
  const [minGenreExp, setMinGenreExp] = useState(0) // genre-experience threshold over card genreExp
  const [specialistOnly, setSpecialistOnly] = useState(false) // peaked profile in this discipline
  const [multiHyphenateOnly, setMultiHyphenateOnly] = useState(false) // capable non-primary discipline
  const [expanded, setExpanded] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return pool.filter((t) => {
      const c = cards.get(t.id)!
      if (proven === 'proven' && c.unproven) return false
      if (proven === 'unproven' && !c.unproven) return false
      if (c.fit < minFit) return false
      if (availableOnly && !c.available) return false
      if (strongOnly && c.strengths.length === 0) return false
      // Owner-ruling filters — min-OVR / max-salary / min-Star / min-genre-exp ranges,
      // and the specialist / multi-hyphenate classification flags (all from the card).
      if (c.ovr < minOvr) return false
      if (c.salary > maxSalary) return false
      if (c.starPower < minStar) return false
      if (c.genreExp < minGenreExp) return false
      if (specialistOnly && !c.specialist) return false
      if (multiHyphenateOnly && !c.multiHyphenate) return false
      return true
    })
  }, [
    pool,
    cards,
    proven,
    minFit,
    availableOnly,
    strongOnly,
    minOvr,
    maxSalary,
    minStar,
    minGenreExp,
    specialistOnly,
    multiHyphenateOnly,
  ])

  const sorted = useMemo(() => {
    const scoreOf = (c: CandidateCard): number => {
      switch (sortKey) {
        case 'fit':
          return c.fit
        case 'ovr':
          return c.ovr
        case 'ep':
          return c.performance.expected
        case 'salary':
          return -c.salary // ascending salary (cheaper first) → negate for descending sort
        case 'starPower':
          return c.starPower
        case 'genreExp':
          return c.genreExp
        case 'value':
          // Fit per $M salary — higher is better value. Guard against zero salary.
          return c.fit / Math.max(c.salary / 1_000_000, 0.01)
      }
    }
    // Descending by the chosen score; stable tiebreak by talent id for determinism.
    return [...filtered].sort((a, b) => {
      const ca = cards.get(a.id)!
      const cb = cards.get(b.id)!
      const d = scoreOf(cb) - scoreOf(ca)
      return d !== 0 ? d : a.id.localeCompare(b.id)
    })
  }, [filtered, cards, sortKey])

  return (
    <div className="stack" {...(testid ? { 'data-testid': testid } : {})}>
      <div className="spread">
        <h4 style={{ margin: 0 }}>{title}</h4>
        <span className="hint">Sorted by {SORT_LABELS[sortKey]}</span>
      </div>

      {/* Sort + filter controls */}
      <div className="panel stack" data-testid={`${testid ?? 'picker'}-controls`}>
        <label className="hint">
          Sort by{' '}
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            data-testid={`${testid ?? 'picker'}-sort`}
            aria-label={`${title}: sort candidates`}
          >
            {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
              <option key={k} value={k}>
                {SORT_LABELS[k]}
              </option>
            ))}
          </select>
        </label>
        <div className="btn-row" style={{ flexWrap: 'wrap', gap: 6 }}>
          <select
            value={proven}
            onChange={(e) => setProven(e.target.value as ProvenFilter)}
            data-testid={`${testid ?? 'picker'}-filter-proven`}
            aria-label={`${title}: experience filter`}
          >
            <option value="all">Proven & unproven</option>
            <option value="proven">Proven only</option>
            <option value="unproven">Unproven only</option>
          </select>
          <select
            value={String(minFit)}
            onChange={(e) => setMinFit(Number(e.target.value))}
            data-testid={`${testid ?? 'picker'}-filter-minfit`}
            aria-label={`${title}: minimum project fit`}
          >
            <option value="0">Any Fit</option>
            <option value="50">Fit ≥ 50</option>
            <option value="65">Fit ≥ 65</option>
            <option value="80">Fit ≥ 80</option>
          </select>
          <label className="hint">
            <input
              type="checkbox"
              checked={availableOnly}
              onChange={(e) => setAvailableOnly(e.target.checked)}
              data-testid={`${testid ?? 'picker'}-filter-available`}
            />{' '}
            Available only
          </label>
          <label className="hint">
            <input
              type="checkbox"
              checked={strongOnly}
              onChange={(e) => setStrongOnly(e.target.checked)}
              data-testid={`${testid ?? 'picker'}-filter-strengths`}
            />{' '}
            Has a relevant strength
          </label>
          {/* ── Owner-ruling filters — OVR / salary / Star Power ranges + genre-exp
              threshold + specialist / multi-hyphenate flags. Same select/checkbox chrome
              as the existing filters; each narrows by a player-visible card value. ── */}
          <select
            value={String(minOvr)}
            onChange={(e) => setMinOvr(Number(e.target.value))}
            data-testid={`${testid ?? 'picker'}-filter-minovr`}
            aria-label={`${title}: minimum role OVR`}
          >
            <option value="0">Any OVR</option>
            <option value="50">OVR ≥ 50</option>
            <option value="65">OVR ≥ 65</option>
            <option value="80">OVR ≥ 80</option>
          </select>
          <select
            value={maxSalary === Infinity ? 'all' : String(maxSalary)}
            onChange={(e) =>
              setMaxSalary(e.target.value === 'all' ? Infinity : Number(e.target.value))
            }
            data-testid={`${testid ?? 'picker'}-filter-maxsalary`}
            aria-label={`${title}: maximum salary`}
          >
            <option value="all">Any salary</option>
            <option value="500000">Salary ≤ {money(500_000)}</option>
            <option value="1000000">Salary ≤ {money(1_000_000)}</option>
            <option value="2000000">Salary ≤ {money(2_000_000)}</option>
          </select>
          <select
            value={String(minStar)}
            onChange={(e) => setMinStar(Number(e.target.value))}
            data-testid={`${testid ?? 'picker'}-filter-minstar`}
            aria-label={`${title}: minimum Star Power`}
          >
            <option value="0">Any Star Power</option>
            <option value="40">Star ≥ 40</option>
            <option value="60">Star ≥ 60</option>
            <option value="80">Star ≥ 80</option>
          </select>
          <select
            value={String(minGenreExp)}
            onChange={(e) => setMinGenreExp(Number(e.target.value))}
            data-testid={`${testid ?? 'picker'}-filter-mingenreexp`}
            aria-label={`${title}: minimum genre experience`}
          >
            <option value="0">Any genre exp.</option>
            <option value="25">Genre exp. ≥ 25</option>
            <option value="50">Genre exp. ≥ 50</option>
            <option value="75">Genre exp. ≥ 75</option>
          </select>
          <label className="hint">
            <input
              type="checkbox"
              checked={specialistOnly}
              onChange={(e) => setSpecialistOnly(e.target.checked)}
              data-testid={`${testid ?? 'picker'}-filter-specialist`}
            />{' '}
            Specialists only
          </label>
          <label className="hint">
            <input
              type="checkbox"
              checked={multiHyphenateOnly}
              onChange={(e) => setMultiHyphenateOnly(e.target.checked)}
              data-testid={`${testid ?? 'picker'}-filter-multihyphenate`}
            />{' '}
            Multi-hyphenates only
          </label>
        </div>
      </div>

      <div className="scroll stack">
        {sorted.length === 0 && <p className="hint">No candidates match these filters.</p>}
        {sorted.map((t) => {
          const c = cards.get(t.id)!
          const elig = talentEligibility(t, role, chosenElsewhere)
          const selected = selectedId === t.id
          const isOpen = expanded === t.id
          return (
            <div key={t.id} className="stack" style={{ gap: 4 }}>
              {onOpenProfile && (
                <button
                  type="button"
                  className="linkish"
                  data-testid={`picker-open-profile-${t.id}`}
                  onClick={(event) => {
                    // The shared Profile drawer captures the exact control that opened it so
                    // closing can return the player to the same candidate in the live Package.
                    // Claim focus explicitly instead of depending on browser-specific pointer
                    // focus defaults (which also makes keyboard/test activation deterministic).
                    event.currentTarget.focus({ preventScroll: true })
                    onOpenProfile(t.id)
                  }}
                >
                  View profile
                </button>
              )}
              <button
                type="button"
                className={`option${selected ? ' selected' : ''}${elig.eligible ? '' : ' ineligible'}`}
                disabled={!elig.eligible}
                onClick={() => onSelect(t.id)}
                data-testid={`talent-${t.id}`}
                aria-pressed={selected}
              >
                <div className="spread">
                  <span className="opt-title">
                    {t.name}
                    {t.authored && (
                      <span className="badge authored" style={{ marginLeft: 8 }}>
                        Authored
                      </span>
                    )}
                    {c.capableButUnproven && (
                      <span
                        className="badge"
                        style={{ marginLeft: 8 }}
                        data-testid={`talent-${t.id}-unproven`}
                      >
                        Capable but Unproven
                      </span>
                    )}
                    {freelancerFees?.[t.id] !== undefined && (
                      <span
                        className="badge estimate"
                        style={{ marginLeft: 8 }}
                        data-testid={`talent-${t.id}-freelancer`}
                      >
                        Freelancer
                      </span>
                    )}
                  </span>
                  <span className="badge" data-testid={`talent-${t.id}-fit`}>
                    Fit {c.fit.toFixed(0)}
                  </span>
                </div>
                {/* Assignment-relevant primary line: role OVR, EP range, star power, and
                    per-film cost — a freelancer's one-film fee, or a studio talent's salary. */}
                <div className="opt-desc mono">
                  {c.ovrTier} · OVR {c.ovr.toFixed(0)} · Expected{' '}
                  <span data-testid={`talent-${t.id}-ep`}>
                    {c.performance.low.toFixed(0)}–{c.performance.high.toFixed(0)}
                  </span>{' '}
                  · Star {starPower(c.starPower)} ·{' '}
                  {freelancerFees?.[t.id] !== undefined
                    ? `Freelancer fee ${money(freelancerFees[t.id]!)}`
                    : money(c.salary)}
                </div>
                <div className="opt-desc">
                  Relevant genre experience ({genreLabel}):{' '}
                  <span data-testid={`talent-${t.id}-genreexp`}>{c.genreExp.toFixed(0)}</span>
                </div>
                {/* Top assignment-relevant strengths */}
                {c.strengths.length > 0 && (
                  <div className="opt-desc" data-testid={`talent-${t.id}-strengths`}>
                    {c.strengths.map((s, i) => (
                      <span key={i} className="tag" style={{ marginRight: 6 }}>
                        {s}
                      </span>
                    ))}
                  </div>
                )}
                {/* The single most important relevant concern */}
                {c.weakness && (
                  <div className="reason" data-testid={`talent-${t.id}-weakness`}>
                    {c.weakness}
                  </div>
                )}
                {!elig.eligible && <div className="reason">{elig.reason}</div>}
              </button>

              {/* Expand for full details (still perceived-only) */}
              <button
                type="button"
                className="ghost"
                style={{ alignSelf: 'flex-start', fontSize: 12, padding: '2px 8px' }}
                onClick={() => setExpanded(isOpen ? null : t.id)}
                data-testid={`talent-${t.id}-expand`}
                aria-expanded={isOpen}
              >
                {isOpen ? 'Hide details' : 'Details'}
              </button>
              {isOpen && (
                <div className="panel stack" data-testid={`talent-${t.id}-details`}>
                  <div className="opt-desc mono">
                    Believed temperament — warmth {axis(t.perceived.warmth)}, gravity{' '}
                    {axis(t.perceived.gravity)}, physicality {axis(t.perceived.physicality)}
                  </div>
                  <div className="opt-desc mono">
                    Expected performance band: {score(c.performance.low, 0)}–
                    {score(c.performance.high, 0)} (mid {score(c.performance.expected, 0)}), width{' '}
                    {c.bandWidth.toFixed(0)}
                  </div>
                  <div className="opt-desc mono">
                    Age {ageYears(t.age)} · {c.unproven ? 'Unproven' : 'Proven'} in this discipline
                  </div>
                  {c.strengths.length === 0 && !c.weakness && (
                    <div className="hint">
                      The chosen structure does not strongly favor or disfavor this talent.
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Minimal fallback (no assignment context) — player-visible fields only ─────
function MinimalPicker({
  title,
  pool,
  role,
  selectedId,
  chosenElsewhere,
  onSelect,
  testid,
}: {
  title: string
  pool: PlayerVisibleTalent[]
  role: CreativeRole
  selectedId: string | null
  chosenElsewhere: string[]
  onSelect: (id: string) => void
  testid: string | undefined
}) {
  return (
    <div className="stack" {...(testid ? { 'data-testid': testid } : {})}>
      <h4>{title}</h4>
      <div className="scroll stack">
        {pool.map((t) => {
          const elig = talentEligibility(t, role, chosenElsewhere)
          const selected = selectedId === t.id
          return (
            <button
              type="button"
              key={t.id}
              className={`option${selected ? ' selected' : ''}${elig.eligible ? '' : ' ineligible'}`}
              disabled={!elig.eligible}
              onClick={() => onSelect(t.id)}
              data-testid={`talent-${t.id}`}
              aria-pressed={selected}
            >
              <div className="spread">
                <span className="opt-title">
                  {t.name}
                  {t.authored && (
                    <span className="badge authored" style={{ marginLeft: 8 }}>
                      Authored
                    </span>
                  )}
                </span>
                <span className="badge">Fame {starPower(t.fame)}</span>
              </div>
              <div className="opt-desc">
                Known ability {t.skill.toFixed(0)} · Salary {money(t.salary)} · Age {ageYears(t.age)}
              </div>
              <div className="opt-desc">
                Believed to be — warmth {axis(t.perceived.warmth)}, gravity{' '}
                {axis(t.perceived.gravity)}, physicality {axis(t.perceived.physicality)}
              </div>
              {!elig.eligible && <div className="reason">{elig.reason}</div>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
