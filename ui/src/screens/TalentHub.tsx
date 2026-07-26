// ── Talent Hub (Phase 5.1) ───────────────────────────────────────────────────
// A browsable roster over the studio's talent. Every number shown is a read-only
// engine SUMMARY (roleOVR / roleTier / temperamentSummary / expectedPotential* /
// workEthicLabel / genreExperience / projectFit / expectedPerformance) surfaced
// through the adapter — the Hub NEVER reads hidden actual skills or true ceilings.
//
// Three views:
//   • Roster  — every talent, all four role OVRs + tiers, Creative Temperament,
//               visible Potential tier/range per discipline, Work Ethic label,
//               perceived genre experience.
//   • Profile — the same for one talent, expanded, PLUS a Project Fit comparison
//               for a selected film/slot (shows how Fit re-ranks vs OVR) and
//               cross-role consideration (act / write / direct / craft), surfacing
//               "Unproven in this role" with a wider Expected Performance band.
//
// Information integrity is the governing rule (see the adapter's Hub section and the
// mutation-grade test hub-integrity.test.tsx).

import { useMemo, useState } from 'react'
import type {
  GameState,
  Discipline,
  CastSlot,
  FilmConcept,
  FilmPromise,
  FilmShape,
  TalentProfile,
  FitComparison,
  CrossRoleAssessment,
} from '../engine/adapter.ts'
import {
  talentHubRoster,
  talentProfile,
  fitComparison,
  crossRoleAssessment,
  shapeFitReasons,
  careerIdentityLabel,
  capableButUnprovenLabels,
  primaryPoolIds,
  DISCIPLINES,
  DISCIPLINE_LABEL,
  CAST_SLOTS,
  selectConcepts,
} from '../engine/adapter.ts'
import type { ShapeReason } from '../engine/adapter.ts'
import { money, score } from '../format.ts'
import { genreLabel } from '../content.ts'

// A neutral assignment context the Hub uses to make Fit/Expected-Performance
// meaningful without a live draft: a balanced, moderately-specific promise and a
// mid shape. Fit is film/assignment specific; this is a fair, fixed comparison
// baseline (the Assembly wizard drives the real, chosen assignment).
const NEUTRAL_SHAPE: FilmShape = { opening: 'slowSetup', midpoint: 'reversal', ending: 'bittersweet' }
function neutralPromise(concept: FilmConcept): FilmPromise {
  return {
    genre: concept.genre,
    intendedSegments: ['adult'],
    ranges: {
      intimacy: [-0.4, 0.4],
      tonalWeight: [-0.4, 0.4],
      kineticEnergy: [-0.4, 0.4],
    },
  }
}

const CAST_SLOT_LABEL: Record<CastSlot, string> = {
  lead: 'Lead',
  antagonist: 'Antagonist',
  support: 'Support',
}

export function TalentHub({
  state,
  onBack,
}: {
  state: GameState
  onBack: () => void
}) {
  const roster = useMemo(() => talentHubRoster(state), [state])
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const profile = selectedId ? talentProfile(state, selectedId) : undefined

  return (
    <div className="app-shell">
      <div className="topbar">
        <div className="brand">
          <span className="mark">TALENT HUB</span>
          <span className="sub">{roster.length} people</span>
        </div>
        <button className="ghost" onClick={onBack} data-testid="hub-back">
          Back to studio
        </button>
      </div>

      {!profile ? (
        <RosterView roster={roster} onOpen={setSelectedId} />
      ) : (
        <ProfileView
          state={state}
          profile={profile}
          onBackToRoster={() => setSelectedId(null)}
        />
      )}
    </div>
  )
}

// ── Roster ────────────────────────────────────────────────────────────────────
function RosterView({
  roster,
  onOpen,
}: {
  roster: TalentProfile[]
  onOpen: (id: string) => void
}) {
  return (
    <div className="card">
      <h2>Roster</h2>
      <p className="hint">
        Everyone the studio can work with. OVR is broad ability in a discipline (it does not change
        with the film). Potential, Work Ethic and Temperament describe upside, growth and expressive
        style — never current quality. Open a profile to compare Project Fit for a specific film.
      </p>
      <div className="grid grid-3" data-testid="hub-roster">
        {roster.map((t) => (
          <RosterCard key={t.id} t={t} onOpen={onOpen} />
        ))}
      </div>
    </div>
  )
}

function RosterCard({ t, onOpen }: { t: TalentProfile; onOpen: (id: string) => void }) {
  const primary = t.disciplines.find((d) => d.isPrimary)!
  return (
    <button
      type="button"
      className="option stack"
      style={{ textAlign: 'left', width: '100%' }}
      onClick={() => onOpen(t.id)}
      data-testid={`hub-talent-${t.id}`}
      aria-label={`Open ${t.name} profile`}
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
        <span className="badge">{DISCIPLINE_LABEL[t.primaryDiscipline]}</span>
      </div>

      {/* RULING B: credited career identity vs capable-but-unproven (roster summary). */}
      <CareerIdentityLine profile={t} testid={`hub-identity-${t.id}`} compact />


      {/* Four role OVRs + tiers; the primary discipline is marked. */}
      <div className="grid grid-4" style={{ gap: 6 }} data-testid={`hub-ovrs-${t.id}`}>
        {t.disciplines.map((d) => (
          <div
            key={d.discipline}
            className={`panel${d.isPrimary ? ' selected' : ''}`}
            style={{ padding: 6, textAlign: 'center' }}
            data-testid={`hub-ovr-${t.id}-${d.discipline}`}
          >
            <div className="hint" style={{ fontSize: 11 }}>
              {d.label}
            </div>
            <div className="mono" style={{ fontSize: 18 }}>
              {d.ovr}
            </div>
            <div className="hint" style={{ fontSize: 10 }}>
              {d.tier}
            </div>
          </div>
        ))}
      </div>

      <div className="opt-desc" data-testid={`hub-temper-${t.id}`}>
        {t.temperament}
      </div>
      <div className="opt-desc mono">
        Work ethic {t.workEthicLabel} · Potential ({primary.label}) {primary.potentialTier} (
        {primary.potentialLow}–{primary.potentialHigh})
      </div>
      {!t.available && (
        <div className="reason">Engaged in {t.engagedIn} — busy until it releases.</div>
      )}
    </button>
  )
}

// ── RULING B — Career identity (credited) vs Capable-but-Unproven ─────────────
// The credited career identity is built ONLY from disciplines with a real demonstrated
// credit (workHistory > 0) at a usable OVR — e.g. "Actor / Writer". A discipline the
// talent could do well (OVR ≥ 60) but has never been credited in reads as "Capable but
// Unproven" — never as an established role. No fabricated credits. Values come from the
// engine's careerIdentity; this component only formats them.
function CareerIdentityLine({
  profile,
  testid,
  compact = false,
}: {
  profile: TalentProfile
  testid: string
  compact?: boolean
}) {
  const label = careerIdentityLabel(profile.careerIdentity)
  const capable = capableButUnprovenLabels(profile.careerIdentity)
  return (
    <div className="opt-desc" data-testid={testid} style={{ fontSize: compact ? 12 : undefined }}>
      {label ? (
        <span>
          <span className="hint">Known for: </span>
          <strong data-testid={`${testid}-credited`}>{label}</strong>
        </span>
      ) : (
        <span className="hint" data-testid={`${testid}-none`}>
          No credited role yet — {DISCIPLINE_LABEL[profile.primaryDiscipline]} by training.
        </span>
      )}
      {capable.length > 0 && (
        <div className="hint" data-testid={`${testid}-capable`} style={{ fontSize: 11 }}>
          Capable but Unproven: {capable.join(', ')}
        </div>
      )}
    </div>
  )
}

// The fuller career-identity panel for the profile view: each discipline flagged as
// PROVEN (credited), CAPABLE BUT UNPROVEN, or neither, truthfully.
function CareerIdentityPanel({ profile }: { profile: TalentProfile }) {
  const ci = profile.careerIdentity
  return (
    <div className="card" data-testid="hub-career-identity">
      <h3 style={{ marginTop: 0 }}>Career identity</h3>
      <p className="hint" style={{ marginTop: 0 }}>
        What they’re <em>known for</em> (a discipline with real credits at a usable level) is
        distinct from what they’re merely <em>capable of</em> (a usable ability with no credits
        yet). Capability is not a career — an unproven role carries more uncertainty.
      </p>
      <CareerIdentityLine profile={profile} testid="hub-profile-identity" />
      <table className="data" style={{ marginTop: 8 }} data-testid="hub-identity-table">
        <thead>
          <tr>
            <th>Discipline</th>
            <th className="num">OVR</th>
            <th className="num">Credits</th>
            <th>Standing</th>
          </tr>
        </thead>
        <tbody>
          {ci.disciplines.map((d) => (
            <tr key={d.discipline} data-testid={`hub-identity-row-${d.discipline}`}>
              <td>
                {DISCIPLINE_LABEL[d.discipline]}
                {d.discipline === ci.primary && (
                  <span className="badge" style={{ marginLeft: 8 }}>Primary</span>
                )}
              </td>
              <td className="num mono">{d.ovr}</td>
              <td className="num mono">{d.workHistory}</td>
              <td>
                {d.proven ? (
                  <span className="tag result" data-testid={`hub-identity-proven-${d.discipline}`}>
                    Established
                  </span>
                ) : d.capableButUnproven ? (
                  <span className="tag estimate" data-testid={`hub-identity-capable-${d.discipline}`}>
                    Capable but Unproven
                  </span>
                ) : (
                  <span className="hint">Not a strength</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Profile ─────────────────────────────────────────────────────────────────
function ProfileView({
  state,
  profile,
  onBackToRoster,
}: {
  state: GameState
  profile: TalentProfile
  onBackToRoster: () => void
}) {
  return (
    <div className="stack" data-testid="hub-profile" style={{ gap: 16 }}>
      <div className="card stack">
        <div className="spread">
          <h2 style={{ margin: 0 }}>
            {profile.name}
            {profile.authored && (
              <span className="badge authored" style={{ marginLeft: 8 }}>
                Authored
              </span>
            )}
          </h2>
          <button className="ghost" onClick={onBackToRoster} data-testid="hub-to-roster">
            All talent
          </button>
        </div>

        <div className="opt-desc mono">
          Primary {DISCIPLINE_LABEL[profile.primaryDiscipline]} · Age {profile.age.toFixed(0)} · Fame{' '}
          {profile.fame.toFixed(0)} · Salary {money(profile.salary)}
          {!profile.available && ` · Engaged in ${profile.engagedIn}`}
        </div>

        <div className="fact-block stack">
          <div>
            <strong>Creative Temperament</strong>
            <div className="hint" data-testid="hub-profile-temper">
              {profile.temperament}
            </div>
            <div className="hint" style={{ fontSize: 11 }}>
              Expressive style — how they naturally present, not how good they are.
            </div>
          </div>
          <div className="spread">
            <span>Work ethic</span>
            <span className="mono" data-testid="hub-profile-workethic">
              {profile.workEthicLabel}
            </span>
          </div>
          <div className="hint" style={{ fontSize: 11 }}>
            Work ethic affects only how they develop — never their current quality, OVR, Fit or draw.
          </div>
        </div>
      </div>

      {/* Per-discipline: OVR, tier, visible potential, work history / unproven. */}
      <div className="card">
        <h3 style={{ marginTop: 0 }}>Ability by discipline</h3>
        <table className="data" data-testid="hub-discipline-table">
          <thead>
            <tr>
              <th>Discipline</th>
              <th className="num">OVR</th>
              <th>Tier</th>
              <th>Potential (visible)</th>
              <th className="num">Track record</th>
            </tr>
          </thead>
          <tbody>
            {profile.disciplines.map((d) => (
              <tr key={d.discipline} data-testid={`hub-disc-${d.discipline}`}>
                <td>
                  {d.label}
                  {d.isPrimary && <span className="badge" style={{ marginLeft: 8 }}>Primary</span>}
                </td>
                <td className="num mono">{d.ovr}</td>
                <td>{d.tier}</td>
                <td>
                  {d.potentialTier}{' '}
                  <span className="hint mono">
                    ({d.potentialLow}–{d.potentialHigh})
                  </span>
                </td>
                <td className="num">
                  {d.unproven ? (
                    <span className="reason" data-testid={`hub-unproven-${d.discipline}`}>
                      Unproven in this role
                    </span>
                  ) : (
                    <span className="mono">
                      {d.workHistory} film{d.workHistory === 1 ? '' : 's'}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="hint" style={{ fontSize: 11 }}>
          Potential is the studio's estimate of upside, shown as a range — not a guarantee and never
          the true ceiling.
        </p>
      </div>

      {/* RULING B: career identity (credited) vs capability. */}
      <CareerIdentityPanel profile={profile} />

      {/* Perceived genre experience for the primary discipline (all four available). */}
      <GenreExperiencePanel profile={profile} />

      {/* Project Fit comparison + cross-role consideration. */}
      <FitComparisonPanel state={state} profile={profile} />
    </div>
  )
}

function GenreExperiencePanel({ profile }: { profile: TalentProfile }) {
  const [disc, setDisc] = useState<Discipline>(profile.primaryDiscipline)
  const cells = profile.genreExperience[disc]
  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>Genre experience (as believed)</h3>
      <div className="btn-row" data-testid="hub-genre-disc-toggles">
        {DISCIPLINES.map((d) => (
          <button
            key={d}
            type="button"
            className={`option${d === disc ? ' selected' : ''}`}
            style={{ width: 'auto' }}
            onClick={() => setDisc(d)}
            data-testid={`hub-genre-disc-${d}`}
          >
            {DISCIPLINE_LABEL[d]}
          </button>
        ))}
      </div>
      <div className="grid grid-3" style={{ marginTop: 8 }} data-testid="hub-genre-grid">
        {cells.map((c) => (
          <div key={c.genre} className="panel" style={{ padding: 8 }}>
            <div className="spread">
              <span>{genreLabel(c.genre)}</span>
              <span className="mono">{c.perceived.toFixed(0)}</span>
            </div>
            <div className="meter" aria-label={`${genreLabel(c.genre)} experience ${c.perceived.toFixed(0)} of 100`}>
              <span style={{ width: `${Math.max(0, Math.min(100, c.perceived))}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Fit comparison + cross-role ───────────────────────────────────────────────
function FitComparisonPanel({
  state,
  profile,
}: {
  state: GameState
  profile: TalentProfile
}) {
  const concepts = useMemo(() => selectConcepts(state), [state])
  const [conceptId, setConceptId] = useState<string>(concepts[0]?.id ?? '')
  const [discipline, setDiscipline] = useState<Discipline>(profile.primaryDiscipline)
  const [slot, setSlot] = useState<CastSlot>('lead')

  const concept = concepts.find((c) => c.id === conceptId)

  // The assignment the comparison ranks against: acting needs a cast slot; the
  // crew/craft disciplines do not.
  const activeSlot: CastSlot | undefined = discipline === 'acting' ? slot : undefined

  const { comparison, thisRow, cross, shapeReasons } = useMemo(() => {
    if (!concept) return { comparison: null, thisRow: null, cross: null, shapeReasons: [] }
    const promise = neutralPromise(concept)
    // Rank the PRIMARY-role pool for that discipline against this assignment.
    const poolIds = primaryPoolIds(state, discipline)
    // Include THIS talent even when their primary role differs (cross-role case).
    const ids = poolIds.includes(profile.id) ? poolIds : [profile.id, ...poolIds]
    const cmp: FitComparison = fitComparison(
      state,
      discipline,
      concept.id,
      activeSlot,
      promise,
      NEUTRAL_SHAPE,
      ids,
    )
    const row = cmp.rows.find((r) => r.talentId === profile.id) ?? null
    const xr: CrossRoleAssessment = crossRoleAssessment(
      state,
      profile.id,
      discipline,
      concept.id,
      activeSlot,
      promise,
      NEUTRAL_SHAPE,
    )
    // RULING C: shape-sensitive Fit/EP reasons, from the SHARED projectSkillWeights path
    // (never a UI reimplementation). Empty unless the chosen shape materially moves a skill
    // this talent is notably strong/weak in — so reasons appear only when shape matters.
    const reasons: ShapeReason[] = shapeFitReasons(
      state,
      profile.id,
      discipline,
      concept.id,
      activeSlot,
      promise,
      NEUTRAL_SHAPE,
    )
    return { comparison: cmp, thisRow: row, cross: xr, shapeReasons: reasons }
  }, [state, concept, discipline, activeSlot, profile.id])

  const consideringCrossRole = discipline !== profile.primaryDiscipline

  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>Project Fit — for a specific film</h3>
      <p className="hint">
        Fit is film- and role-specific: a lower-OVR specialist can out-fit a higher-OVR generalist on
        a matching film. Pick a concept and a role to see how Fit re-ranks the pool against broad OVR.
      </p>

      <div className="row" style={{ gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <label className="stack">
          <span className="hint">Concept</span>
          <select
            value={conceptId}
            onChange={(e) => setConceptId(e.target.value)}
            data-testid="hub-fit-concept"
          >
            {concepts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title} ({genreLabel(c.genre)})
              </option>
            ))}
          </select>
        </label>

        <label className="stack">
          <span className="hint">Considered as</span>
          <select
            value={discipline}
            onChange={(e) => setDiscipline(e.target.value as Discipline)}
            data-testid="hub-fit-discipline"
          >
            {DISCIPLINES.map((d) => (
              <option key={d} value={d}>
                {DISCIPLINE_LABEL[d]}
                {d === profile.primaryDiscipline ? ' (primary)' : ''}
              </option>
            ))}
          </select>
        </label>

        {discipline === 'acting' && (
          <label className="stack">
            <span className="hint">Cast slot</span>
            <select value={slot} onChange={(e) => setSlot(e.target.value as CastSlot)} data-testid="hub-fit-slot">
              {CAST_SLOTS.map((s) => (
                <option key={s} value={s}>
                  {CAST_SLOT_LABEL[s]}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {consideringCrossRole && cross && (
        <div className="warn" style={{ marginTop: 12 }} data-testid="hub-crossrole-note">
          Considering {profile.name} outside their primary discipline (as{' '}
          {DISCIPLINE_LABEL[discipline]}).{' '}
          {cross.unproven
            ? 'They are Unproven in this role — the Expected Performance band is wider.'
            : 'They have a track record in this role.'}
        </div>
      )}

      {thisRow && cross && (
        <div className="fact-block stack" style={{ marginTop: 12 }} data-testid="hub-this-fit">
          <div className="spread">
            <span>{profile.name} — broad OVR</span>
            <span className="mono">
              {thisRow.ovr} ({thisRow.ovrTier})
            </span>
          </div>
          <div className="spread">
            <span>Fit on this film</span>
            <span className="mono" data-testid="hub-this-fit-value">
              {score(thisRow.fit)}
            </span>
          </div>
          <div className="spread">
            <span>Expected performance</span>
            <span className="mono" data-testid="hub-this-ep">
              {score(cross.performance.low)}–{score(cross.performance.high)} (mid{' '}
              {score(cross.performance.expected)})
            </span>
          </div>
          <div className="spread">
            <span>Ranked by Fit vs by OVR</span>
            <span className="mono">
              Fit #{thisRow.fitRank} · OVR #{thisRow.ovrRank}
              {thisRow.promotedByFit && (
                <span className="tag estimate" style={{ marginLeft: 8 }} data-testid="hub-this-promoted">
                  Fit promotes
                </span>
              )}
            </span>
          </div>

          {/* RULING C: shape-sensitive reasons, shown ONLY when the chosen structure
              materially moves a skill this talent is notably strong/weak in. */}
          {shapeReasons.length > 0 && (
            <div className="stack" style={{ gap: 4, marginTop: 4 }} data-testid="hub-shape-reasons">
              <span className="hint" style={{ fontSize: 11 }}>
                Why the chosen structure matters here:
              </span>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {shapeReasons.map((r) => (
                  <li
                    key={r.skill}
                    className={r.kind === 'concern' ? 'reason' : 'hint'}
                    data-testid={`hub-shape-reason-${r.skill}`}
                    style={{ fontSize: 12 }}
                  >
                    {r.text}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {comparison && (
        <>
          {comparison.specialistUpset && (
            <div className="hint" style={{ marginTop: 12 }} data-testid="hub-specialist-upset">
              Specialist over generalist: the best Fit here is{' '}
              <strong>{nameOf(comparison, comparison.specialistUpset.fitLeaderId)}</strong>, who is not
              the highest broad-OVR pick (
              <strong>{nameOf(comparison, comparison.specialistUpset.ovrLeaderId)}</strong>). On a
              matching film, Fit — not OVR — is what to trust.
            </div>
          )}
          <table className="data" style={{ marginTop: 12 }} data-testid="hub-fit-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Talent</th>
                <th className="num">OVR</th>
                <th className="num">Fit</th>
                <th className="num">OVR rank</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {comparison.rows.map((r) => (
                <tr
                  key={r.talentId}
                  className={r.talentId === profile.id ? 'selected' : ''}
                  data-testid={`hub-fit-row-${r.talentId}`}
                >
                  <td className="mono">{r.fitRank}</td>
                  <td>
                    {r.name}
                    {!r.available && <span className="hint"> · busy</span>}
                  </td>
                  <td className="num mono">{r.ovr}</td>
                  <td className="num mono">{score(r.fit)}</td>
                  <td className="num mono">{r.ovrRank}</td>
                  <td>
                    {r.promotedByFit && <span className="tag estimate">Fit promotes</span>}
                    {r.unproven && <span className="reason"> Unproven</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  )
}

function nameOf(cmp: FitComparison, id: string): string {
  return cmp.rows.find((r) => r.talentId === id)?.name ?? id
}
