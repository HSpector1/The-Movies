// ── Film assembly wizard ─────────────────────────────────────────────────────
// Staged: Concept → Shape → Promise → Talent → Budget & Forecast → Review.
// Back-navigation keeps valid selections (all draft state lives in one object at
// this component's root; steps only read/patch it). Illegal talent is disabled
// with a plain reason (via TalentPicker). Consequences are shown via ENGINE
// outputs (previewForecast, requiredNegative, salaries) — no invented scores.
// Greenlight surfaces engine validation errors in plain English before committing.

import { useMemo, useRef, useState } from 'react'
import type {
  GameState,
  FilmConcept,
  FilmShape,
  FilmPromise,
  CastSlot,
  CreativeRole,
  Genre,
  DraftPackage,
} from '../engine/adapter.ts'
import {
  selectConcepts,
  talentByRole,
  studioPool,
  freelancerPool,
  isEmploymentEngaged,
  requiredNegative,
  salarySum,
  totalCommittedCost,
  commitmentPreview,
  breakEvenGross,
  previewForecast,
  greenlight,
  findConcept,
  assessCreativeCohesion,
  assessPackageFit,
  assessExecutionConfidence,
  assessProfitRange,
  assessPackageDelta,
  primaryDiscipline,
  NEGATIVE_BUDGET_MULTIPLIERS,
  MARKETING_BUDGET_LEVELS,
  PROMISE_WIDTHS,
  PROMISE_CENTERS,
  rangeFrom,
  SHAPE_OPTIONS,
  CAST_SLOTS,
  PROMISE_AXES,
  SEGMENT_ORDER,
  selectCash,
} from '../engine/adapter.ts'
import type {
  CreativeCohesion,
  PackageFit,
  ExecutionConfidence,
  ForecastProfitRange,
  PackageDelta,
  CommitmentPreview,
} from '../engine/adapter.ts'
import {
  SHAPE_DESCRIPTIONS,
  OPENING_OPTIONS,
  MIDPOINT_OPTIONS,
  ENDING_OPTIONS,
  PROMISE_AXIS_INFO,
  genreLabel,
} from '../content.ts'
import { money, moneyExact, axis, segmentLabel } from '../format.ts'
import { ConceptCard } from '../components/ConceptCard.tsx'
import { ForecastDisplay } from '../components/ForecastDisplay.tsx'
import { TalentPicker } from '../components/TalentPicker.tsx'
import type { PickerAssignment } from '../components/TalentPicker.tsx'
import { FilmPackageSummary } from '../components/FilmPackageSummary.tsx'
import { FilmReadiness } from '../components/FilmReadiness.tsx'
import { ChangePreview } from '../components/ChangePreview.tsx'
import { ErrorBox, Warn, Metric } from '../components/common.tsx'

type Step = 'concept' | 'shape' | 'promise' | 'talent' | 'budget' | 'review'
const STEP_ORDER: Step[] = ['concept', 'shape', 'promise', 'talent', 'budget', 'review']
const STEP_LABELS: Record<Step, string> = {
  concept: 'Concept',
  shape: 'Shape',
  promise: 'Promise',
  talent: 'Talent',
  budget: 'Budget & Forecast',
  review: 'Review',
}

// Sensible default shape (choices are still explicit; this is only a starting point).
const DEFAULT_SHAPE: FilmShape = { opening: 'slowSetup', midpoint: 'reversal', ending: 'bittersweet' }

// Draft state — separate from GameState until greenlight. Ids only for talent.
type Draft = {
  conceptId: string | null
  shape: FilmShape
  // per-axis center/width index into PROMISE_CENTERS / PROMISE_WIDTHS
  promiseCenterIdx: Record<'intimacy' | 'tonalWeight' | 'kineticEnergy', number>
  promiseWidthIdx: Record<'intimacy' | 'tonalWeight' | 'kineticEnergy', number>
  intendedSegments: string[]
  writerId: string | null
  directorId: string | null
  cast: Record<CastSlot, string | null>
  // Crew/Craft hires (D-4). The engine already accepts craftIds; the UI now lets the
  // player assign one (or none). Empty ⇒ technical defaults (as before).
  craftIds: string[]
  negativeLevelIdx: number // index into NEGATIVE_BUDGET_MULTIPLIERS
  marketingLevelIdx: number // index into MARKETING_BUDGET_LEVELS
}

function makeInitialDraft(): Draft {
  return {
    conceptId: null,
    shape: DEFAULT_SHAPE,
    // default centers to 0.25 index (mild), widths to a middle width
    promiseCenterIdx: { intimacy: 1, tonalWeight: 1, kineticEnergy: 1 },
    promiseWidthIdx: { intimacy: 1, tonalWeight: 1, kineticEnergy: 1 },
    intendedSegments: ['adult'],
    writerId: null,
    directorId: null,
    cast: { lead: null, antagonist: null, support: null },
    craftIds: [], // no craft hire by default (technical falls back to D-4 default)
    negativeLevelIdx: 1, // 1.0×
    marketingLevelIdx: 1, // 400k
  }
}

// Build the concrete Promise from the draft indices + concept genre.
function buildPromise(draft: Draft, genre: Genre): FilmPromise {
  const ranges = {} as FilmPromise['ranges']
  for (const ax of PROMISE_AXES) {
    const center = PROMISE_CENTERS[draft.promiseCenterIdx[ax]]!
    const width = PROMISE_WIDTHS[draft.promiseWidthIdx[ax]]!
    ranges[ax] = rangeFrom(center, width)
  }
  return {
    genre,
    intendedSegments: draft.intendedSegments as FilmPromise['intendedSegments'],
    ranges,
  }
}

// Assemble a full DraftPackage when everything required is chosen (else null).
function buildPackage(state: GameState, draft: Draft): DraftPackage | null {
  if (!draft.conceptId || !draft.writerId || !draft.directorId) return null
  if (!draft.cast.lead || !draft.cast.antagonist || !draft.cast.support) return null
  const concept = findConcept(state, draft.conceptId)
  if (!concept) return null
  const req = requiredNegative(concept, draft.shape, state)
  const negative = NEGATIVE_BUDGET_MULTIPLIERS[draft.negativeLevelIdx]! * req
  const marketing = MARKETING_BUDGET_LEVELS[draft.marketingLevelIdx]!
  return {
    conceptId: draft.conceptId,
    shape: draft.shape,
    promise: buildPromise(draft, concept.genre),
    writerId: draft.writerId,
    directorId: draft.directorId,
    craftIds: draft.craftIds, // the player-chosen Crew/Craft hires (may be empty)
    cast: {
      lead: draft.cast.lead,
      antagonist: draft.cast.antagonist,
      support: draft.cast.support,
    },
    budget: { negative, marketing },
  }
}

// A PARTIAL package for the Film Package summary — buildable as soon as writer+director
// are chosen (cast slots may still be empty; assessPackageFit reports them as unfilled).
// Returns null until writer+director exist. Craft is included (empty allowed).
function buildPartialPackage(state: GameState, draft: Draft): DraftPackage | null {
  if (!draft.conceptId || !draft.writerId || !draft.directorId) return null
  const concept = findConcept(state, draft.conceptId)
  if (!concept) return null
  const req = requiredNegative(concept, draft.shape, state)
  const negative = NEGATIVE_BUDGET_MULTIPLIERS[draft.negativeLevelIdx]! * req
  const marketing = MARKETING_BUDGET_LEVELS[draft.marketingLevelIdx]!
  return {
    conceptId: draft.conceptId,
    shape: draft.shape,
    promise: buildPromise(draft, concept.genre),
    writerId: draft.writerId,
    directorId: draft.directorId,
    craftIds: draft.craftIds,
    // cast may be partial; assessPackageFit tolerates missing slots (cast lookups guard).
    cast: {
      lead: draft.cast.lead ?? '',
      antagonist: draft.cast.antagonist ?? '',
      support: draft.cast.support ?? '',
    },
    budget: { negative, marketing },
  }
}

// Whether two complete packages assign the SAME talent to every slot (writer, director,
// each cast slot, and craft). Used to decide when a change preview is worth showing.
function samePackageTalent(a: DraftPackage, b: DraftPackage): boolean {
  if (a.writerId !== b.writerId || a.directorId !== b.directorId) return false
  for (const slot of CAST_SLOTS) {
    if (a.cast[slot] !== b.cast[slot]) return false
  }
  const ac = a.craftIds ?? []
  const bc = b.craftIds ?? []
  if (ac.length !== bc.length) return false
  for (let i = 0; i < ac.length; i++) if (ac[i] !== bc[i]) return false
  return true
}

export function Assembly({
  state,
  onGreenlit,
  onCancel,
}: {
  state: GameState
  onGreenlit: (next: GameState) => void
  onCancel: () => void
}) {
  const [draft, setDraft] = useState<Draft>(makeInitialDraft)
  const [step, setStep] = useState<Step>('concept')
  const [error, setError] = useState<string | null>(null)

  const concepts = selectConcepts(state)
  const concept = draft.conceptId ? findConcept(state, draft.conceptId) : undefined
  // D-11.11 candidate sources: when employment is engaged, staffing draws from the
  // studio roster + available freelancers ONLY (unavailable global talent excluded);
  // a converted legacy save (not engaged) falls back to the open global pool.
  const engaged = isEmploymentEngaged(state)
  const buildPool = (role: CreativeRole) =>
    engaged
      ? [...studioPool(state, role), ...freelancerPool(state, role).map((f) => f.talent)]
      : talentByRole(state, role)
  const writers = useMemo(() => buildPool('writer'), [state])
  const directors = useMemo(() => buildPool('director'), [state])
  const actors = useMemo(() => buildPool('actor'), [state])
  const crew = useMemo(() => buildPool('craft'), [state])
  // id → one-film freelancer fee, for every available freelancer across all roles.
  const freelancerFees = useMemo(() => {
    const m: Record<string, number> = {}
    if (engaged) {
      for (const role of ['writer', 'director', 'actor', 'craft'] as CreativeRole[]) {
        for (const f of freelancerPool(state, role)) m[f.talent.id] = f.fee
      }
    }
    return m
  }, [state, engaged])

  const pkg = useMemo(() => buildPackage(state, draft), [state, draft])
  const partialPkg = useMemo(() => buildPartialPackage(state, draft), [state, draft])

  // ── Film Package summary — the four real engine dimensions (perceived-only) ──
  // Cohesion is TALENT-INDEPENDENT: it can be shown from the promise step onward.
  // Fit needs writer+director (partial cast OK). Execution/Profit need a FULL package
  // (every cast slot chosen) because they run the §5/§7 pipeline over resolved talent.
  const promiseForSummary = concept ? buildPromise(draft, concept.genre) : null
  const cohesion: CreativeCohesion | null =
    concept && promiseForSummary
      ? assessCreativeCohesion(concept, draft.shape, promiseForSummary)
      : null
  const fit: PackageFit | null = partialPkg ? assessPackageFit(state, partialPkg) : null
  const execution: ExecutionConfidence | null = pkg ? assessExecutionConfidence(state, pkg) : null
  const profit: ForecastProfitRange | null = pkg ? assessProfitRange(state, pkg) : null
  // D-12: the release-strategy financials for the fully-committed package — the immediate
  // commitment (negative + marketing + salaries), the solvency gate, and post-greenlight cash
  // and runway. `null` until the package is complete. The greenlight is BLOCKED when the gate
  // fails (D-12.11) — a voluntary commitment may not overdraw.
  const commitment = pkg ? totalCommittedCost(state, pkg) : null
  const preview: CommitmentPreview | null = commitment !== null ? commitmentPreview(state, commitment) : null
  const blockedByGate = preview !== null && !preview.affordable

  // ── Change preview (on select/swap) — real computed packageDelta ────────────
  // A delta needs TWO complete packages. We remember the last complete package the
  // player had; whenever the current complete package differs (a swap/select changed a
  // slot), we show the resulting change via packageDelta (real deltas only). The ref is
  // updated after render so the NEXT change diffs against this one.
  const prevCompletePkg = useRef<DraftPackage | null>(null)
  let changeDelta: PackageDelta | null = null
  if (pkg && prevCompletePkg.current && !samePackageTalent(prevCompletePkg.current, pkg)) {
    changeDelta = assessPackageDelta(state, prevCompletePkg.current, pkg)
  }
  // Remember the current complete package as the baseline for the next change.
  if (pkg) prevCompletePkg.current = pkg

  function patch(p: Partial<Draft>) {
    setDraft((d) => ({ ...d, ...p }))
  }

  function go(next: Step) {
    setError(null)
    setStep(next)
  }
  function stepIndex(s: Step): number {
    return STEP_ORDER.indexOf(s)
  }
  function next() {
    const i = stepIndex(step)
    if (i < STEP_ORDER.length - 1) go(STEP_ORDER[i + 1]!)
  }
  function back() {
    const i = stepIndex(step)
    if (i > 0) go(STEP_ORDER[i - 1]!)
    else onCancel()
  }

  // Per-step "can advance" gates.
  function canAdvance(): boolean {
    switch (step) {
      case 'concept':
        return draft.conceptId !== null
      case 'shape':
        return true
      case 'promise':
        return draft.intendedSegments.length > 0
      case 'talent':
        return (
          draft.writerId !== null &&
          draft.directorId !== null &&
          draft.cast.lead !== null &&
          draft.cast.antagonist !== null &&
          draft.cast.support !== null &&
          // D-11.13: a Production/Craft Lead is required once employment is engaged.
          (!engaged || draft.craftIds.length === 1)
        )
      case 'budget':
        return pkg !== null
      case 'review':
        return pkg !== null
    }
  }

  function handleGreenlight() {
    setError(null)
    if (!pkg) {
      setError('The film is not fully assembled yet.')
      return
    }
    const result = greenlight(state, pkg)
    if (!result.ok) {
      setError(result.error)
      return
    }
    onGreenlit(result.next)
  }

  return (
    <div className="app-shell">
      <div className="topbar">
        <div className="brand">
          <span className="mark">ASSEMBLE A FILM</span>
        </div>
        <button className="ghost" onClick={onCancel} data-testid="assembly-back-dashboard">
          Back to studio
        </button>
      </div>

      <div className="steps" data-testid="assembly-steps">
        {STEP_ORDER.map((s) => (
          <span
            key={s}
            className={`step${s === step ? ' active' : ''}${stepIndex(s) < stepIndex(step) ? ' done' : ''}`}
            data-testid={`step-${s}`}
          >
            {STEP_LABELS[s]}
          </span>
        ))}
      </div>

      {step === 'concept' && (
        <ConceptStep concepts={concepts} selected={draft.conceptId} onSelect={(id) => patch({ conceptId: id })} />
      )}
      {step === 'shape' && <ShapeStep shape={draft.shape} onChange={(shape) => patch({ shape })} />}
      {step === 'promise' && concept && (
        <PromiseStep draft={draft} concept={concept} patch={patch} />
      )}
      {step === 'talent' && concept && promiseForSummary && (
        <TalentStep
          state={state}
          draft={draft}
          concept={concept}
          promise={promiseForSummary}
          writers={writers}
          directors={directors}
          actors={actors}
          crew={crew}
          patch={patch}
          engaged={engaged}
          freelancerFees={freelancerFees}
        />
      )}
      {step === 'budget' && concept && (
        <BudgetStep state={state} draft={draft} concept={concept} pkg={pkg} patch={patch} />
      )}
      {step === 'review' && concept && pkg && preview && (
        <ReviewStep
          state={state}
          pkg={pkg}
          conceptTitle={concept.title}
          preview={preview}
          cohesion={cohesion}
          fit={fit}
          execution={execution}
          profit={profit}
        />
      )}

      {/* Change preview — the real computed effect of the latest select/swap. Shown on
          the talent/budget steps once a complete package exists and a slot just changed. */}
      {(step === 'talent' || step === 'budget') && changeDelta && (
        <div style={{ marginTop: 16 }}>
          <ChangePreview delta={changeDelta} label="Effect of your last change" />
        </div>
      )}

      {/* Persistent Film Package summary — the four real engine dimensions. Shown from
          the promise step onward (cohesion is talent-independent; the rest fill in as
          the package is assembled). Never on the concept/shape steps (no promise yet). */}
      {(step === 'promise' || step === 'talent' || step === 'budget') && cohesion && (
        <div style={{ marginTop: 16 }}>
          <FilmPackageSummary
            cohesion={cohesion}
            {...(fit ? { fit } : {})}
            {...(execution ? { execution } : {})}
            {...(profit ? { profit } : {})}
          />
        </div>
      )}

      {error && (
        <div style={{ marginTop: 16 }}>
          <ErrorBox message={error} />
        </div>
      )}

      <div className="btn-row" style={{ marginTop: 20 }}>
        <button onClick={back} data-testid="assembly-back">
          {step === 'concept' ? 'Cancel' : 'Back'}
        </button>
        {step !== 'review' ? (
          <button className="primary" onClick={next} disabled={!canAdvance()} data-testid="assembly-next">
            Next
          </button>
        ) : (
          <button
            className="accent"
            onClick={handleGreenlight}
            disabled={!pkg || blockedByGate}
            data-testid="greenlight"
          >
            Greenlight this film
          </button>
        )}
      </div>
      {step === 'review' && blockedByGate && preview && (
        <div style={{ marginTop: 12 }}>
          <ErrorBox message={preview.reason ?? 'This commitment would overdraw the studio.'} />
        </div>
      )}
    </div>
  )
}

// ── Step: Concept ────────────────────────────────────────────────────────────
function ConceptStep({
  concepts,
  selected,
  onSelect,
}: {
  concepts: FilmConcept[]
  selected: string | null
  onSelect: (id: string) => void
}) {
  return (
    <div className="card">
      <h2>Choose a concept</h2>
      <p className="hint">Only the studio-visible details are shown: title, genre, base needs, roles.</p>
      <div className="grid grid-3" data-testid="concept-grid">
        {concepts.map((c) => (
          <ConceptCard
            key={c.id}
            concept={c}
            mode="normal"
            selected={selected === c.id}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  )
}

// ── Step: Shape ──────────────────────────────────────────────────────────────
function ShapeStep({ shape, onChange }: { shape: FilmShape; onChange: (s: FilmShape) => void }) {
  const groups: { key: keyof FilmShape; label: string; options: readonly string[] }[] = [
    { key: 'opening', label: 'Opening', options: OPENING_OPTIONS },
    { key: 'midpoint', label: 'Midpoint', options: MIDPOINT_OPTIONS },
    { key: 'ending', label: 'Ending', options: ENDING_OPTIONS },
  ]
  return (
    <div className="card">
      <h2>Shape the story</h2>
      <p className="hint">
        Three structural choices. Each has a creative meaning; the studio does not tell you which is
        “best”.
      </p>
      <div className="grid grid-3">
        {groups.map((g) => (
          <div className="stack" key={g.key} data-testid={`shape-group-${g.key}`}>
            <h4>{g.label}</h4>
            {g.options.map((optRaw) => {
              const opt = optRaw as string
              const info = SHAPE_DESCRIPTIONS[opt]!
              const selected = (shape[g.key] as string) === opt
              const eff = SHAPE_OPTIONS[opt as keyof typeof SHAPE_OPTIONS]
              return (
                <button
                  key={opt}
                  type="button"
                  className={`option${selected ? ' selected' : ''}`}
                  onClick={() => onChange({ ...shape, [g.key]: opt })}
                  data-testid={`shape-${opt}`}
                  aria-pressed={selected}
                >
                  <div className="opt-title">{info.title}</div>
                  <div className="opt-desc">{info.desc}</div>
                  <div className="opt-desc mono">
                    reach {eff.openingReachMod > 0 ? '+' : ''}
                    {eff.openingReachMod} · craft {eff.craftMod > 0 ? '+' : ''}
                    {eff.craftMod}
                  </div>
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Step: Promise ────────────────────────────────────────────────────────────
function PromiseStep({
  draft,
  concept,
  patch,
}: {
  draft: Draft
  concept: FilmConcept
  patch: (p: Partial<Draft>) => void
}) {
  function toggleSegment(id: string) {
    const has = draft.intendedSegments.includes(id)
    const next = has
      ? draft.intendedSegments.filter((s) => s !== id)
      : [...draft.intendedSegments, id]
    patch({ intendedSegments: next })
  }
  return (
    <div className="card">
      <h2>Make a promise</h2>
      <p className="hint">
        Genre is fixed by the concept ({genreLabel(concept.genre)}). For each dimension, set where
        the film sits and how tightly you commit to it. A tighter promise is more specific.
      </p>

      <div className="grid grid-3" style={{ marginTop: 8 }}>
        {PROMISE_AXES.map((ax) => {
          const info = PROMISE_AXIS_INFO[ax]
          const center = PROMISE_CENTERS[draft.promiseCenterIdx[ax]]!
          const width = PROMISE_WIDTHS[draft.promiseWidthIdx[ax]]!
          const range = rangeFrom(center, width)
          return (
            <div className="panel stack" key={ax} data-testid={`promise-${ax}`}>
              <h4>{info.title}</h4>
              <p className="hint">{info.desc}</p>

              <label>
                Center:{' '}
                <strong>
                  {center < -0.5
                    ? info.low
                    : center > 0.5
                      ? info.high
                      : 'Balanced'}
                </strong>
              </label>
              <div className="btn-row">
                {PROMISE_CENTERS.map((c, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`option${draft.promiseCenterIdx[ax] === i ? ' selected' : ''}`}
                    style={{ width: 'auto', padding: '6px 10px' }}
                    onClick={() => patch({ promiseCenterIdx: { ...draft.promiseCenterIdx, [ax]: i } })}
                    data-testid={`promise-${ax}-center-${i}`}
                  >
                    {c > 0 ? '+' : ''}
                    {c}
                  </button>
                ))}
              </div>

              <label style={{ marginTop: 8 }}>
                Width:{' '}
                <strong>{width <= 0.4 ? 'Tight' : width <= 0.8 ? 'Focused' : width <= 1.4 ? 'Loose' : 'Broad'}</strong>
              </label>
              <div className="btn-row">
                {PROMISE_WIDTHS.map((w, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`option${draft.promiseWidthIdx[ax] === i ? ' selected' : ''}`}
                    style={{ width: 'auto', padding: '6px 10px' }}
                    onClick={() => patch({ promiseWidthIdx: { ...draft.promiseWidthIdx, [ax]: i } })}
                    data-testid={`promise-${ax}-width-${i}`}
                  >
                    {w}
                  </button>
                ))}
              </div>
              <div className="opt-desc mono">
                range {axis(range[0])} … {axis(range[1])}
              </div>
            </div>
          )
        })}
      </div>

      <div className="sep" />
      <h4>Intended segments</h4>
      <p className="hint">Which audiences is this film aimed at?</p>
      <div className="btn-row" data-testid="segment-toggles">
        {SEGMENT_ORDER.map((id) => (
          <button
            key={id}
            type="button"
            className={`option${draft.intendedSegments.includes(id) ? ' selected' : ''}`}
            style={{ width: 'auto' }}
            onClick={() => toggleSegment(id)}
            data-testid={`segment-${id}`}
            aria-pressed={draft.intendedSegments.includes(id)}
          >
            {segmentLabel(id)}
          </button>
        ))}
      </div>
      {draft.intendedSegments.length === 0 && (
        <p className="reason" style={{ color: 'var(--neg)' }}>
          Choose at least one intended segment.
        </p>
      )}
    </div>
  )
}

// ── Step: Talent ─────────────────────────────────────────────────────────────
function TalentStep({
  state,
  draft,
  concept,
  promise,
  writers,
  directors,
  actors,
  crew,
  patch,
  engaged,
  freelancerFees,
}: {
  state: GameState
  draft: Draft
  concept: FilmConcept
  promise: FilmPromise
  writers: ReturnType<typeof talentByRole>
  directors: ReturnType<typeof talentByRole>
  actors: ReturnType<typeof talentByRole>
  crew: ReturnType<typeof talentByRole>
  patch: (p: Partial<Draft>) => void
  engaged: boolean
  freelancerFees: Record<string, number>
}) {
  const castIds = CAST_SLOTS.map((s) => draft.cast[s]).filter((x): x is string => x !== null)
  const SLOT_TITLES: Record<CastSlot, string> = {
    lead: 'Lead',
    antagonist: 'Antagonist',
    support: 'Support',
  }
  const gLabel = genreLabel(concept.genre)
  // A per-assignment context factory: the picker uses it to compute rich cards (Fit,
  // Expected Performance, genre experience, strengths/concerns) via the adapter.
  const assignmentFor = (role: 'writer' | 'director' | 'craft', slot?: CastSlot): PickerAssignment => ({
    state,
    discipline: primaryDiscipline(role),
    conceptId: concept.id,
    slot,
    promise,
    shape: draft.shape,
    genreLabel: gLabel,
  })
  const castAssignment = (slot: CastSlot): PickerAssignment => ({
    state,
    discipline: 'acting',
    conceptId: concept.id,
    slot,
    promise,
    shape: draft.shape,
    genreLabel: gLabel,
  })
  // The chosen Crew member (single hire supported in the UI; engine accepts a list).
  const craftId = draft.craftIds[0] ?? null
  return (
    <div className="card">
      <h2>Cast &amp; crew the film</h2>
      <p className="hint">
        {engaged
          ? 'Staff the film from Your Studio (talent you employ — on payroll, no per-film cost) or from Available Freelancers (a one-film fee, tagged “Freelancer”). Unavailable industry talent is not shown. A Production/Craft Lead is required.'
          : 'Pick a writer, a director, one actor per cast slot, and (optionally) a Crew/Craft lead.'}{' '}
        Candidates are sorted by Project Fit for the assignment — not by fame. Anyone already
        engaged in another production, or already used on this film, is disabled with the reason
        shown.
      </p>
      <div className="grid grid-2">
        <TalentPicker
          title="Writer"
          pool={writers}
          role="writer"
          selectedId={draft.writerId}
          chosenElsewhere={[]}
          onSelect={(id) => patch({ writerId: id })}
          testid="picker-writer"
          assignment={assignmentFor('writer')}
          freelancerFees={freelancerFees}
        />
        <TalentPicker
          title="Director"
          pool={directors}
          role="director"
          selectedId={draft.directorId}
          chosenElsewhere={[]}
          onSelect={(id) => patch({ directorId: id })}
          testid="picker-director"
          assignment={assignmentFor('director')}
          freelancerFees={freelancerFees}
        />
      </div>
      <div className="sep" />
      <div className="grid grid-3">
        {CAST_SLOTS.map((slot) => (
          <TalentPicker
            key={slot}
            title={SLOT_TITLES[slot]}
            pool={actors}
            role="actor"
            selectedId={draft.cast[slot]}
            chosenElsewhere={castIds.filter((id) => id !== draft.cast[slot])}
            onSelect={(id) => patch({ cast: { ...draft.cast, [slot]: id } })}
            testid={`picker-${slot}`}
            assignment={castAssignment(slot)}
            freelancerFees={freelancerFees}
          />
        ))}
      </div>
      <div className="sep" />
      {/* Production/Craft Lead — REQUIRED once employment is engaged (D-11.13). One hire;
          selecting toggles it into craftIds. Its Fit/OVR/EP/cost/strengths appear on the
          card and it flows into the package summary and committed cost like any assignment. */}
      <div className="grid grid-3">
        <TalentPicker
          title={engaged ? 'Production/Craft Lead (required)' : 'Crew / Craft (optional)'}
          pool={crew}
          role="craft"
          selectedId={craftId}
          chosenElsewhere={[]}
          onSelect={(id) => patch({ craftIds: craftId === id ? [] : [id] })}
          testid="picker-craft"
          assignment={assignmentFor('craft')}
          freelancerFees={freelancerFees}
        />
      </div>
      {engaged && craftId === null && (
        <p className="reason" style={{ color: 'var(--neg)' }}>
          Choose a Production/Craft Lead to continue.
        </p>
      )}
    </div>
  )
}

// ── Step: Budget & Forecast ──────────────────────────────────────────────────
function BudgetStep({
  state,
  draft,
  concept,
  pkg,
  patch,
}: {
  state: GameState
  draft: Draft
  concept: FilmConcept
  pkg: DraftPackage | null
  patch: (p: Partial<Draft>) => void
}) {
  const req = requiredNegative(concept, draft.shape, state)
  const negative = NEGATIVE_BUDGET_MULTIPLIERS[draft.negativeLevelIdx]! * req
  const marketing = MARKETING_BUDGET_LEVELS[draft.marketingLevelIdx]!
  const salaries = salarySum(state, {
    writerId: draft.writerId!,
    directorId: draft.directorId!,
    cast: draft.cast as Record<CastSlot, string>,
    craftIds: draft.craftIds, // include the Crew/Craft hire in the committed salary sum
  })
  const committed = negative + marketing + salaries
  const cash = selectCash(state)
  const goesNegative = cash - committed < 0

  const NEG_LABELS = ['Lean (0.75×)', 'Adequate (1.0×)', 'Generous (1.25×)']
  const MKT_LABELS = ['Small campaign', 'Standard campaign', 'Wide campaign']

  return (
    <div className="grid grid-2">
      <div className="card stack">
        <h2>Budget</h2>
        <div className="fact-block">
          <Metric label="Required negative (from concept + shape)" small testid="required-negative">
            <span className="tag fact" style={{ marginRight: 6 }}>
              Fact
            </span>
            {money(req)}
          </Metric>
        </div>

        <div>
          <h4>Negative budget</h4>
          <div className="btn-row" data-testid="negative-levels">
            {NEGATIVE_BUDGET_MULTIPLIERS.map((m, i) => (
              <button
                key={i}
                type="button"
                className={`option${draft.negativeLevelIdx === i ? ' selected' : ''}`}
                style={{ width: 'auto' }}
                onClick={() => patch({ negativeLevelIdx: i })}
                data-testid={`negative-${i}`}
              >
                <div className="opt-title">{NEG_LABELS[i]}</div>
                <div className="opt-desc mono">{money(m * req)}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h4>Marketing</h4>
          <div className="btn-row" data-testid="marketing-levels">
            {MARKETING_BUDGET_LEVELS.map((m, i) => (
              <button
                key={i}
                type="button"
                className={`option${draft.marketingLevelIdx === i ? ' selected' : ''}`}
                style={{ width: 'auto' }}
                onClick={() => patch({ marketingLevelIdx: i })}
                data-testid={`marketing-${i}`}
              >
                <div className="opt-title">{MKT_LABELS[i]}</div>
                <div className="opt-desc mono">{money(m)}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="sep" />
        <div className="stack fact-block">
          <div className="spread">
            <span>Production Budget (negative)</span>
            <span className="mono">{moneyExact(negative)}</span>
          </div>
          <div className="spread">
            <span>Marketing</span>
            <span className="mono">{moneyExact(marketing)}</span>
          </div>
          <div className="spread">
            <span>Freelancer Fees (this film)</span>
            <span className="mono" data-testid="salaries">
              {moneyExact(salaries)}
            </span>
          </div>
          <div className="spread">
            <strong>Total Immediate Commitment</strong>
            <strong className="mono" data-testid="committed-cost">
              {moneyExact(committed)}
            </strong>
          </div>
          <div className="spread">
            <span>Current cash</span>
            <span className={`mono ${cash < 0 ? 'money neg' : 'money pos'}`}>{moneyExact(cash)}</span>
          </div>
        </div>

        {goesNegative && (
          <Warn>
            This commitment ({moneyExact(committed)}) is more than the studio has on hand
            ({moneyExact(cash)}). A greenlight can’t overdraw the studio (D-12 solvency rule), so
            lower the negative or marketing budget until the commitment fits your cash.
          </Warn>
        )}
      </div>

      <div className="stack">
        {pkg ? (
          <ForecastDisplay forecast={previewForecast(state, pkg)} mode="normal" source="estimate" />
        ) : (
          <div className="panel">
            <p className="hint">Finish choosing talent to see the forecast.</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Step: Review ─────────────────────────────────────────────────────────────
function ReviewStep({
  state,
  pkg,
  conceptTitle,
  preview,
  cohesion,
  fit,
  execution,
  profit,
}: {
  state: GameState
  pkg: DraftPackage
  conceptTitle: string
  preview: CommitmentPreview
  cohesion: CreativeCohesion | null
  fit: PackageFit | null
  execution: ExecutionConfidence | null
  profit: ForecastProfitRange | null
}) {
  const committed = totalCommittedCost(state, pkg)
  const breakEven = breakEvenGross(committed)
  return (
    <div className="stack">
      {/* Film Readiness — assembled from the four real dimensions, not a hidden score */}
      {cohesion && fit && execution && profit && (
        <FilmReadiness cohesion={cohesion} fit={fit} execution={execution} profit={profit} />
      )}

      <div className="grid grid-2">
        <div className="card stack">
          <h2>Review &amp; release strategy</h2>
          <div className="spread">
            <span>Film</span>
            <strong>{conceptTitle}</strong>
          </div>
          <div className="spread">
            <span>Commitment now (negative + marketing + salaries)</span>
            <strong className="mono" data-testid="release-commitment">
              {moneyExact(committed)}
            </strong>
          </div>
          <div className="spread">
            <span>Break-even gross</span>
            <strong className="mono" data-testid="release-breakeven">
              {money(breakEven)}
            </strong>
          </div>
          <div className="spread">
            <span>Cash after greenlight</span>
            <strong
              className={`mono ${preview.cashAfter < 0 ? 'money neg' : 'money pos'}`}
              data-testid="release-cash-after"
            >
              {moneyExact(preview.cashAfter)}
            </strong>
          </div>
          <div className="spread">
            <span>Post-greenlight runway</span>
            <strong className="mono" data-testid="release-runway">
              {preview.postRunway.infinite ? '—' : `${preview.postRunway.weeks} wk`}
            </strong>
          </div>
          <div className="spread" data-testid="release-gate">
            <span>Solvency gate</span>
            <strong className={preview.affordable ? 'money pos' : 'money neg'}>
              {preview.affordable ? 'Affordable ✓' : 'Blocked ✗'}
            </strong>
          </div>
          {!preview.affordable && <Warn>{preview.reason}</Warn>}
          <p className="hint">
            Greenlighting commits the budget and salaries now. Studio Revenue is your rental share
            of box office, paid weekly across the film’s theatrical run — so the film must gross
            about {money(breakEven)} to return its cost. The forecast is a prediction, not a
            guarantee.
          </p>
        </div>
        <div className="stack">
          <ForecastDisplay forecast={previewForecast(state, pkg)} mode="normal" source="estimate" />
        </div>
      </div>

      {/* Full four-dimension Film Package summary at greenlight review */}
      {cohesion && (
        <FilmPackageSummary
          cohesion={cohesion}
          {...(fit ? { fit } : {})}
          {...(execution ? { execution } : {})}
          {...(profit ? { profit } : {})}
        />
      )}
    </div>
  )
}
