// ── Film assembly wizard ─────────────────────────────────────────────────────
// Staged: Concept → Shape → Promise → Talent → Budget & Forecast → Review.
// Back-navigation keeps valid selections (all draft state lives in one object at
// this component's root; steps only read/patch it). Illegal talent is disabled
// with a plain reason (via TalentPicker). Consequences are shown via ENGINE
// outputs (previewForecast, requiredNegative, salaries) — no invented scores.
// Greenlight surfaces engine validation errors in plain English before committing.

import { useEffect, useMemo, useRef, useState } from 'react'
import type {
  GameState,
  FilmConcept,
  FilmShape,
  FilmPromise,
  CastSlot,
  CreativeRole,
  Genre,
  DraftPackage,
  ReadyScriptPackageView,
  CastingProjectView,
} from '../engine/adapter.ts'
import {
  selectConcepts,
  talentByRole,
  studioPool,
  freelancerPool,
  isEconomyEngaged,
  requiredNegative,
  salarySum,
  totalCommittedCost,
  commitmentPreview,
  cycleInclusiveBreakEvenGross,
  prospectiveCycleFixedCost,
  regimeStudioShare,
  affordabilityScopes,
  assessDiscoveryExposure,
  previewForecast,
  TUNING,
  marketingEfficiency,
  marketingMenu,
  productionDemandView,
  capitalExposure,
  shapeExplainView,
  teamDirectionPreview,
  teamDirectionGuidance,
  greenlight,
  greenlightScriptProject,
  scriptProjectsBoard,
  castingSessionsBoard,
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
  CycleFixedCost,
  DiscoveryExposureView,
} from '../engine/adapter.ts'
import {
  SHAPE_DESCRIPTIONS,
  OPENING_OPTIONS,
  MIDPOINT_OPTIONS,
  ENDING_OPTIONS,
  PROMISE_AXIS_INFO,
  genreLabel,
} from '../content.ts'
import { money, moneyExact, axis, pct, segmentLabel } from '../format.ts'
import { ConceptCard } from '../components/ConceptCard.tsx'
import { ForecastDisplay } from '../components/ForecastDisplay.tsx'
import { TalentPicker } from '../components/TalentPicker.tsx'
import type { PickerAssignment } from '../components/TalentPicker.tsx'
import { FilmPackageSummary } from '../components/FilmPackageSummary.tsx'
import { FilmReadiness } from '../components/FilmReadiness.tsx'
import { AffordabilityScopesCard } from '../components/AffordabilityScopes.tsx'
import { DiscoveryExposureLine } from '../components/DiscoveryExposure.tsx'
import { ChangePreview } from '../components/ChangePreview.tsx'
import { ErrorBox, Warn, Metric } from '../components/common.tsx'
import { TalentCreator } from './TalentCreator.tsx'
import { CastingEvidence } from './CastingRoom.tsx'

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
  marketingLevelIdx: number // index into the active three-rung marketing menu
}

function makeInitialDraft(locked?: ReadyScriptPackageView): Draft {
  return {
    conceptId: locked?.concept.id ?? null,
    shape: locked?.lockedShape ?? DEFAULT_SHAPE,
    // default centers to 0.25 index (mild), widths to a middle width
    promiseCenterIdx: { intimacy: 1, tonalWeight: 1, kineticEnergy: 1 },
    promiseWidthIdx: { intimacy: 1, tonalWeight: 1, kineticEnergy: 1 },
    intendedSegments: locked ? [...locked.lockedPromise.intendedSegments] : ['adult'],
    writerId: locked?.writer.id ?? null,
    directorId: null,
    cast: { lead: null, antagonist: null, support: null },
    craftIds: [], // no craft hire by default (technical falls back to D-4 default)
    negativeLevelIdx: 1, // 1.0×
    marketingLevelIdx: 1, // middle rung
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
function buildPackage(
  state: GameState,
  draft: Draft,
  locked?: ReadyScriptPackageView,
): DraftPackage | null {
  const conceptId = locked?.concept.id ?? draft.conceptId
  const writerId = locked?.writer.id ?? draft.writerId
  if (!conceptId || !writerId || !draft.directorId) return null
  if (!draft.cast.lead || !draft.cast.antagonist || !draft.cast.support) return null
  const concept = findConcept(state, conceptId)
  if (!concept) return null
  const shape = locked?.lockedShape ?? draft.shape
  const promise = locked?.lockedPromise ?? buildPromise(draft, concept.genre)
  const req = requiredNegative(concept, shape, state)
  const negative = NEGATIVE_BUDGET_MULTIPLIERS[draft.negativeLevelIdx]! * req
  const withoutMarketing: DraftPackage = {
    conceptId,
    shape,
    promise,
    writerId,
    directorId: draft.directorId,
    craftIds: draft.craftIds, // the player-chosen Crew/Craft hires (may be empty)
    cast: {
      lead: draft.cast.lead,
      antagonist: draft.cast.antagonist,
      support: draft.cast.support,
    },
    budget: { negative, marketing: 0 },
  }
  const marketing = marketingMenu(
    state,
    withoutMarketing,
    locked?.projectId,
  ).levels[draft.marketingLevelIdx]!
  return { ...withoutMarketing, budget: { negative, marketing } }
}

// A PARTIAL package for the Film Package summary — buildable as soon as writer+director
// are chosen (cast slots may still be empty; assessPackageFit reports them as unfilled).
// Returns null until writer+director exist. Craft is included (empty allowed).
function buildPartialPackage(
  state: GameState,
  draft: Draft,
  locked?: ReadyScriptPackageView,
): DraftPackage | null {
  const conceptId = locked?.concept.id ?? draft.conceptId
  const writerId = locked?.writer.id ?? draft.writerId
  if (!conceptId || !writerId || !draft.directorId) return null
  const concept = findConcept(state, conceptId)
  if (!concept) return null
  const shape = locked?.lockedShape ?? draft.shape
  const req = requiredNegative(concept, shape, state)
  const negative = NEGATIVE_BUDGET_MULTIPLIERS[draft.negativeLevelIdx]! * req
  const marketing = MARKETING_BUDGET_LEVELS[draft.marketingLevelIdx]!
  return {
    conceptId,
    shape,
    promise: locked?.lockedPromise ?? buildPromise(draft, concept.genre),
    writerId,
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
  scriptProjectId,
  onGreenlit,
  onCancel,
  onStateChange,
  onOpenProfile,
}: {
  state: GameState
  scriptProjectId?: string
  onGreenlit: (next: GameState) => void
  onCancel: () => void
  // A1: apply an authoritative GameState change (a Custom Talent created mid-assembly) WITHOUT
  // unmounting Assembly, so the in-progress film-package draft is preserved. Optional so existing
  // tests that render <Assembly> without it still work (the create action is simply unavailable).
  onStateChange?: (next: GameState) => void
  // D-14: open the shared Talent Profile for a candidate/assigned talent. Optional so existing
  // tests still work.
  onOpenProfile?: ((id: string) => void) | undefined
}) {
  const screenplayBoard = scriptProjectsBoard(state)
  const lockedScript = scriptProjectId
    ? screenplayBoard.packages.find((candidate) => candidate.projectId === scriptProjectId)
    : undefined
  const castingProject = scriptProjectId
    ? Object.values(castingSessionsBoard(state).sections)
        .flat()
        .find((candidate) => candidate.projectId === scriptProjectId)
    : undefined
  const castingHandoffAnnouncement =
    castingProject?.status === 'complete' && castingProject.results !== null
      ? `${castingProject.title} casting review complete. Blank package opened at Cast & crew. Auditions did not select anyone; choose a currently legal cast.`
      : null
  const managedRequiresScript = state.scriptDevelopment.mode === 'managed'
  const stepOrder: Step[] = lockedScript ? ['talent', 'budget', 'review'] : STEP_ORDER
  const [draft, setDraft] = useState<Draft>(() => makeInitialDraft(lockedScript))
  const [step, setStep] = useState<Step>(lockedScript ? 'talent' : 'concept')
  const [error, setError] = useState<string | null>(null)
  // A1: when true, the embedded Talent Creator is shown IN PLACE of the wizard. Assembly stays
  // mounted the whole time, so `draft` (concept/shape/promise/talent picks) survives the round-trip.
  const [creating, setCreating] = useState(false)
  // A2: on each step transition, reset scroll to the top and move focus to the new step's heading
  // so the primary controls (not the bottom Next button) are what the player lands on.
  const contentRef = useRef<HTMLDivElement>(null)
  const firstRender = useRef(true)
  useEffect(() => {
    const isFirstRender = firstRender.current
    firstRender.current = false
    if (isFirstRender && castingHandoffAnnouncement === null) return
    const container = contentRef.current
    if (!container) return
    if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
      try {
        window.scrollTo(0, 0)
      } catch {
        /* jsdom has no layout; focus below is the accessible signal */
      }
    }
    container.scrollTop = 0
    const heading = container.querySelector('h2')
    if (heading instanceof HTMLElement) {
      heading.setAttribute('tabindex', '-1')
      heading.focus()
    }
  }, [step, castingHandoffAnnouncement])

  const concepts = selectConcepts(state)
  const concept = draft.conceptId ? findConcept(state, draft.conceptId) : undefined
  // D-11.11 candidate sources: when the economy is engaged, staffing draws from the
  // studio roster + available freelancers ONLY (unavailable global talent excluded);
  // a converted legacy save (never engaged) falls back to the open global pool.
  // D-17A FIX-PASS: the PERSISTED regime, so the wizard's pools, its required-craft gate
  // and its freelancer fees are the same rules `applyGreenlight` enforces. Reading
  // "employed right now" let a fired-everyone studio build packages the engine refused.
  const engaged = isEconomyEngaged(state)
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

  const pkg = useMemo(() => buildPackage(state, draft, lockedScript), [state, draft, lockedScript])
  const partialPkg = useMemo(
    () => buildPartialPackage(state, draft, lockedScript),
    [state, draft, lockedScript],
  )

  // ── Film Package summary — the four real engine dimensions (perceived-only) ──
  // Cohesion is TALENT-INDEPENDENT: it can be shown from the promise step onward.
  // Fit needs writer+director (partial cast OK). Execution/Profit need a FULL package
  // (every cast slot chosen) because they run the §5/§7 pipeline over resolved talent.
  const promiseForSummary = concept
    ? lockedScript?.lockedPromise ?? buildPromise(draft, concept.genre)
    : null
  const cohesion: CreativeCohesion | null =
    concept && promiseForSummary
      ? assessCreativeCohesion(concept, lockedScript?.lockedShape ?? draft.shape, promiseForSummary)
      : null
  const fit: PackageFit | null = partialPkg ? assessPackageFit(state, partialPkg) : null
  const execution: ExecutionConfidence | null = pkg
    ? assessExecutionConfidence(state, pkg, lockedScript?.projectId)
    : null
  const profit: ForecastProfitRange | null = pkg
    ? assessProfitRange(state, pkg, lockedScript?.projectId)
    : null
  // D-12: the release-strategy financials for the fully-committed package — the immediate
  // commitment (negative + marketing + salaries), the solvency gate, and post-greenlight cash
  // and runway. `null` until the package is complete. The greenlight is BLOCKED when the gate
  // fails (D-12.11) — a voluntary commitment may not overdraw.
  const commitment = pkg ? totalCommittedCost(state, pkg) : null
  const preview: CommitmentPreview | null = commitment !== null ? commitmentPreview(state, commitment) : null
  const blockedByGate = preview !== null && !preview.affordable
  const scriptAvailabilityBlockers = lockedScript?.availability.blockers ?? []
  const blockedByScriptAvailability =
    lockedScript !== undefined && !lockedScript.availability.knownGatesClear
  // D-17A/T2: the 14-week studio fixed cost this package is asked to carry (sole occupancy —
  // the conservative, named default). Passed to every panel that reports a profit sign, so no
  // surface can show a green "Profit" whose studio-economic branch is negative.
  const cycleFixedCost = prospectiveCycleFixedCost(state)
  // D-17A/T6: the engine's own reach-support verdict for the fully-assembled package.
  const discovery = pkg
    ? assessDiscoveryExposure(state, pkg, lockedScript?.projectId)
    : null
  const activeMarketingMenu = pkg
    ? marketingMenu(state, pkg, lockedScript?.projectId)
    : null

  // ── Change preview (on select/swap) — real computed packageDelta ────────────
  // A delta needs TWO complete packages. We remember the last complete package the
  // player had; whenever the current complete package differs (a swap/select changed a
  // slot), we show the resulting change via packageDelta (real deltas only). The ref is
  // updated after render so the NEXT change diffs against this one.
  const prevCompletePkg = useRef<DraftPackage | null>(null)
  let changeDelta: PackageDelta | null = null
  if (pkg && prevCompletePkg.current && !samePackageTalent(prevCompletePkg.current, pkg)) {
    changeDelta = assessPackageDelta(
      state,
      prevCompletePkg.current,
      pkg,
      lockedScript?.projectId,
    )
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
    return stepOrder.indexOf(s)
  }
  function next() {
    const i = stepIndex(step)
    if (i < stepOrder.length - 1) go(stepOrder[i + 1]!)
  }
  function back() {
    const i = stepIndex(step)
    if (i > 0) go(stepOrder[i - 1]!)
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
    if (blockedByScriptAvailability) return
    const result = lockedScript
      ? greenlightScriptProject(state, lockedScript.projectId, pkg)
      : greenlight(state, pkg)
    if (!result.ok) {
      setError(result.error)
      return
    }
    onGreenlit(result.next)
  }

  if (managedRequiresScript && lockedScript === undefined) {
    return (
      <div className="app-shell">
        <div className="topbar">
          <div className="brand"><span className="mark">PACKAGE A SCREENPLAY</span></div>
          <button className="ghost" onClick={onCancel}>Back to studio</button>
        </div>
        <div className="errbox" role="alert" data-testid="managed-assembly-gate">
          Managed studios must open package assembly from a Ready screenplay in the Writers’ Room.
        </div>
      </div>
    )
  }

  // A1: while creating a Custom Talent mid-assembly, show the existing Talent Creator IN PLACE of
  // the wizard. Assembly does not unmount, so the film-package draft is preserved; on Created/Back
  // we return to the exact step the player left, with every selection intact.
  if (creating) {
    return (
      <TalentCreator
        state={state}
        onCreated={(next) => {
          onStateChange?.(next)
          setCreating(false)
        }}
        onBack={() => setCreating(false)}
      />
    )
  }

  return (
    <div className="app-shell">
      {castingHandoffAnnouncement !== null && (
        <div
          id="assembly-casting-handoff"
          className="visually-hidden"
          role="status"
          aria-live="polite"
          aria-atomic="true"
          data-testid="assembly-casting-handoff"
        >
          {castingHandoffAnnouncement}
        </div>
      )}
      <div className="topbar">
        <div className="brand">
          <span className="mark">{lockedScript ? `PACKAGE ${lockedScript.concept.title}` : 'ASSEMBLE A FILM'}</span>
        </div>
        <button className="ghost" onClick={onCancel} data-testid="assembly-back-dashboard">
          Back to studio
        </button>
      </div>

      <div className="steps" data-testid="assembly-steps">
        {stepOrder.map((s) => (
          <span
            key={s}
            className={`step${s === step ? ' active' : ''}${stepIndex(s) < stepIndex(step) ? ' done' : ''}`}
            data-testid={`step-${s}`}
          >
            {STEP_LABELS[s]}
          </span>
        ))}
      </div>

      <div ref={contentRef} data-testid="assembly-step-content">
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
            {...(lockedScript ? { lockedWriter: lockedScript.writer } : {})}
            {...(castingProject?.results ? { castingProject } : {})}
            onCreateTalent={onStateChange ? () => setCreating(true) : undefined}
            onOpenProfile={onOpenProfile}
          />
        )}
        {step === 'budget' && concept && (
          <BudgetStep
            state={state}
            draft={draft}
            concept={concept}
            pkg={pkg}
            patch={patch}
            discovery={discovery}
            {...(lockedScript ? { scriptProjectId: lockedScript.projectId } : {})}
          />
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
            cycleFixedCost={cycleFixedCost}
            discovery={discovery}
            {...(lockedScript ? { scriptProjectId: lockedScript.projectId } : {})}
          />
        )}
      </div>

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
            cycleFixedCost={cycleFixedCost}
            {...(discovery ? { discovery } : {})}
            {...(activeMarketingMenu ? { marketing: activeMarketingMenu } : {})}
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
          {stepOrder.indexOf(step) === 0 ? 'Cancel' : 'Back'}
        </button>
        {step !== 'review' ? (
          <button className="primary" onClick={next} disabled={!canAdvance()} data-testid="assembly-next">
            Next
          </button>
        ) : (
          <button
            className="accent"
            onClick={handleGreenlight}
            disabled={!pkg || blockedByGate || blockedByScriptAvailability}
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
      {step === 'review' && blockedByScriptAvailability && (
        <div
          className="errbox stack"
          role="alert"
          data-testid="script-package-blockers"
          style={{ marginTop: 12 }}
        >
          <strong>This screenplay cannot be greenlit yet.</strong>
          {scriptAvailabilityBlockers.map((blocker) => (
            <div
              className="stack"
              key={blocker.kind}
              data-testid={`script-package-blocker-${blocker.kind}`}
              style={{ gap: 4 }}
            >
              <strong>{blocker.headline}</strong>
              <span>{blocker.detail}</span>
              <span className="hint"><strong>Remedy:</strong> {blocker.remedy}</span>
            </div>
          ))}
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
  // C3: bounded script browsing over the EXISTING concept data — sort by base cost, filter by genre,
  // search by title. The current selection is preserved as the sort/filter changes (only the display
  // order/subset changes; onSelect is not touched). No new script-development system.
  type Sort = 'default' | 'costAsc' | 'costDesc'
  const [sort, setSort] = useState<Sort>('default')
  const [genre, setGenre] = useState<string>('all')
  const [query, setQuery] = useState('')
  const genres = Array.from(new Set(concepts.map((c) => c.genre))).sort()
  const shown = concepts
    .filter((c) => (genre === 'all' || c.genre === genre) && (query === '' || c.title.toLowerCase().includes(query.toLowerCase())))
    .sort((a, b) =>
      sort === 'costAsc' ? a.baseNegativeCost - b.baseNegativeCost : sort === 'costDesc' ? b.baseNegativeCost - a.baseNegativeCost : 0,
    )
  return (
    <div className="card">
      <h2>Choose a concept</h2>
      <p className="hint">Only the studio-visible details are shown: title, genre, base needs, roles.</p>
      <div className="row" style={{ gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 8 }} data-testid="concept-browse">
        <label className="hint" htmlFor="concept-sort">Sort by base cost</label>
        <select id="concept-sort" value={sort} onChange={(e) => setSort(e.target.value as Sort)} data-testid="concept-sort">
          <option value="default">Default</option>
          <option value="costAsc">Cost: low to high</option>
          <option value="costDesc">Cost: high to low</option>
        </select>
        <label className="hint" htmlFor="concept-genre">Genre</label>
        <select id="concept-genre" value={genre} onChange={(e) => setGenre(e.target.value)} data-testid="concept-genre">
          <option value="all">All genres</option>
          {genres.map((g) => (
            <option key={g} value={g}>
              {genreLabel(g as Genre)}
            </option>
          ))}
        </select>
        <input
          type="search"
          placeholder="Search title…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          data-testid="concept-search"
          aria-label="Search concepts by title"
        />
        <span className="hint mono" data-testid="concept-count">{shown.length} of {concepts.length}</span>
      </div>
      {shown.length === 0 ? (
        <div className="empty" data-testid="concept-none">No concepts match. Clear the search or genre filter.</div>
      ) : (
        <div className="grid grid-3" data-testid="concept-grid">
          {shown.map((c) => (
            <ConceptCard key={c.id} concept={c} mode="normal" selected={selected === c.id} onSelect={onSelect} />
          ))}
        </div>
      )}
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
  const explain = shapeExplainView(shape)
  return (
    <div className="card">
      <h2>Shape the story</h2>
      <p className="hint">
        Three structural choices. Each has a creative meaning; the studio does not tell you which is
        “best”.
      </p>
      {/* C2: plain-English, engine-derived summary of what the CURRENT shape does — updates live and
          is shown alongside the actual reach/craft/demand deltas below. */}
      <div className="panel stack" data-testid="shape-explanation">
        <strong>{explain.summary}</strong>
        <span className="hint mono">
          opening reach {explain.openingReachMod > 0 ? '+' : ''}
          {explain.openingReachMod} · craft {explain.craftMod > 0 ? '+' : ''}
          {explain.craftMod} · Production Demand {explain.budgetDemandMultiplier.toFixed(2)}× (
          {explain.demandCategory})
        </span>
      </div>
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
// D-12 Phase 3 — engine-derived Team Direction preview (all vector math in the adapter; this only renders).
function TeamDirectionPanel({
  state,
  sel,
}: {
  state: GameState
  sel: { writerId: string | null; directorId: string | null; cast: Record<CastSlot, string | null>; shape: FilmShape }
}) {
  const td = teamDirectionPreview(state, sel)
  const guidance = teamDirectionGuidance(state, sel)
  const bandClass = td.band === 'Strong' ? 'money pos' : td.band === 'Weak' ? 'money neg' : 'mono'
  // D-12 P2.2 — change vs the PREVIOUS complete team (this panel instance's last score). Resets when the
  // panel unmounts (leaving the assembly flow / switching films) — never compared across films.
  const prevScore = useRef<number | null>(null)
  const delta = td.ready && prevScore.current !== null && guidance.score !== null ? guidance.score - prevScore.current : null
  useEffect(() => {
    if (guidance.score !== null) prevScore.current = guidance.score
  }, [guidance.score])
  const roleLabel = (r: string) => r.charAt(0).toUpperCase() + r.slice(1)
  return (
    <div className="card stack" data-testid="team-direction">
      <h3 style={{ marginTop: 0 }}>Team direction</h3>
      {!td.ready ? (
        <p className="hint" data-testid="team-direction-summary">
          {td.summary}
        </p>
      ) : (
        <>
          <div className="row" style={{ gap: 24, flexWrap: 'wrap' }}>
            <Metric label="Team direction" small testid="team-direction-score">
              {/* P2.1 — the exact 0–100 score behind the Weak/Mixed/Strong band. */}
              <span className={bandClass}>
                {guidance.score}/100 — {td.band}
              </span>
            </Metric>
            {delta !== null && (
              <Metric label="Change" small testid="team-direction-delta">
                {delta === 0 ? 'No meaningful change' : delta > 0 ? `Improved by ${delta}` : `Worsened by ${Math.abs(delta)}`}
              </Metric>
            )}
            {td.mostCompatible && (
              <Metric label="Most compatible" small testid="team-direction-compatible">
                {td.mostCompatible.a} &amp; {td.mostCompatible.b}
              </Metric>
            )}
            {td.mostOpposed && (
              <Metric label="Most opposed" small testid="team-direction-opposed">
                {td.mostOpposed.a} &amp; {td.mostOpposed.b}
              </Metric>
            )}
            <Metric label="Assessment confidence" small testid="team-direction-confidence">
              {/* P2.5 — confidence is about certainty of the ASSESSMENT, not team quality. */}
              <span title="Confidence describes how certain the studio is about this direction assessment. It does not mean the team is good.">
                {td.confidence}
              </span>
            </Metric>
          </div>
          {/* P2.6 — what to change: most-opposed + axes + best available role + reachability. */}
          <p className="hint" data-testid="team-direction-summary">
            {guidance.advice}
          </p>
          {/* P2.4 — best available single substitution across the roster. */}
          {guidance.best && (
            <p className="reason" data-testid="team-direction-best" style={{ marginTop: 0 }}>
              <strong>Best available improvement:</strong>{' '}
              {guidance.best.delta > 0
                ? `Replace ${roleLabel(guidance.best.role)} with ${guidance.best.name}: ${guidance.score} → ${guidance.best.toScore}${guidance.best.toBand !== td.band ? ` — ${guidance.best.toBand}` : `, remains ${td.band}`}.`
                : `No available substitution improves this team (best: ${roleLabel(guidance.best.role)}, ${guidance.best.label}).`}
              {!guidance.reachesMixed && ' No available single change reaches Mixed with the current roster.'}
            </p>
          )}
          <p className="hint" style={{ fontSize: '0.85em', opacity: 0.8 }}>
            Creative direction is known from the talent you’ve chosen; realized performance still varies.
          </p>
        </>
      )}
    </div>
  )
}

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
  lockedWriter,
  castingProject,
  onCreateTalent,
  onOpenProfile,
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
  lockedWriter?: ReadyScriptPackageView['writer']
  castingProject?: CastingProjectView
  onOpenProfile?: ((id: string) => void) | undefined
  // A1: open the Talent Creator without leaving assembly. Undefined ⇒ the action is unavailable
  // (e.g. a test rendered <Assembly> without onStateChange); the button is then simply not shown.
  onCreateTalent?: (() => void) | undefined
}) {
  const castIds = CAST_SLOTS.map((s) => draft.cast[s]).filter((x): x is string => x !== null)
  // Participant uniqueness is cross-discipline. A screenplay writer may be a
  // primary actor/director/craft professional, so every picker must exclude every
  // other locked or selected credit rather than relying on primary-role pools to
  // be disjoint. Keep the current pick out of its own exclusion list so it stays
  // selected and actionable.
  const otherCredits = (...ids: Array<string | null | undefined>): string[] =>
    ids.filter((id): id is string => id !== null && id !== undefined)
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
      {/* A1: the primary "Create Custom Talent" action sits at the TOP of the Talent step, beside
          the heading, so it is visible without scrolling past the whole cast. It opens the existing
          creator and returns here with every selection preserved. */}
      <div className="spread">
        <h2
          style={{ margin: 0 }}
          tabIndex={-1}
          aria-describedby={castingProject?.status === 'complete' ? 'assembly-casting-handoff' : undefined}
          data-testid="assembly-talent-heading"
        >
          Cast &amp; crew the film
        </h2>
        {onCreateTalent && (
          <button
            type="button"
            className="primary"
            onClick={onCreateTalent}
            data-testid="talent-step-create"
          >
            + Create Custom Talent
          </button>
        )}
      </div>
      <p className="hint">
        {engaged
          ? 'Staff the film from Your Studio (talent you employ — on payroll, no per-film cost) or from Available Freelancers (a one-film fee, tagged “Freelancer”). Unavailable industry talent is not shown. A Production/Craft Lead is required.'
          : 'Pick a writer, a director, one actor per cast slot, and (optionally) a Crew/Craft lead.'}{' '}
        Candidates are sorted by Project Fit for the assignment — not by fame. Anyone already
        engaged in another production, or already used on this film, is disabled with the reason
        shown. Need someone who does not exist yet? Use Create Custom Talent above — your film
        selections are kept.
      </p>
      {castingProject && (
        <div className="panel stack" data-testid="assembly-casting-evidence">
          <CastingEvidence project={castingProject} />
          <p className="hint">
            Auditions did not preselect anyone. Choose a currently legal Lead, Antagonist, and Support below.
          </p>
        </div>
      )}
      <div className="grid grid-2">
        {lockedWriter ? (
          <div className="panel stack" data-testid="locked-script-writer">
            <h4>Screenplay writer · locked</h4>
            <strong>{lockedWriter.name}</strong>
            <span className="hint">The accepted screenplay owns this credit. Package assembly cannot replace it.</span>
          </div>
        ) : (
          <TalentPicker
            onOpenProfile={onOpenProfile}
            title="Writer"
            pool={writers}
            role="writer"
            selectedId={draft.writerId}
            chosenElsewhere={otherCredits(
              draft.directorId,
              ...castIds,
              craftId,
            ).filter((id) => id !== draft.writerId)}
            onSelect={(id) => patch({ writerId: id })}
            testid="picker-writer"
            assignment={assignmentFor('writer')}
            freelancerFees={freelancerFees}
          />
        )}
        <TalentPicker
          onOpenProfile={onOpenProfile}
          title="Director"
          pool={directors}
          role="director"
          selectedId={draft.directorId}
          chosenElsewhere={otherCredits(
            draft.writerId,
            ...castIds,
            craftId,
          ).filter((id) => id !== draft.directorId)}
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
          onOpenProfile={onOpenProfile}
            key={slot}
            title={SLOT_TITLES[slot]}
            pool={actors}
            role="actor"
            selectedId={draft.cast[slot]}
            chosenElsewhere={otherCredits(
              draft.writerId,
              draft.directorId,
              ...castIds,
              craftId,
            ).filter((id) => id !== draft.cast[slot])}
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
          onOpenProfile={onOpenProfile}
          title={engaged ? 'Production/Craft Lead (required)' : 'Crew / Craft (optional)'}
          pool={crew}
          role="craft"
          selectedId={craftId}
          chosenElsewhere={otherCredits(
            draft.writerId,
            draft.directorId,
            ...castIds,
          ).filter((id) => id !== craftId)}
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
      <TeamDirectionPanel state={state} sel={{ writerId: draft.writerId, directorId: draft.directorId, cast: draft.cast, shape: draft.shape }} />
    </div>
  )
}

// ── D-17A/T2 (Owner ruling R7) — the ONE break-even headline ──────────────────
// There must not be two competing player-facing meanings of "break even". The HEADLINE is
// STUDIO-ECONOMIC: the theatrical gross this film has to reach for the studio's rental share
// to repay the film's own direct commitment AND the fixed cost the studio pays across the
// film's 14-week make-and-release cycle. The direct-cost figure is not deleted — it stays,
// explicitly labelled, as the D-12 §3/§8 detail it always was (payroll and overhead are never
// silently folded into a film's Contribution).
//
// The headline assumes SOLE OCCUPANCY (concurrency 1) and says so: conservative, and
// conservative exactly when the studio is poorest. Shared occupancy is a NAMED second line at
// concurrency 2 — never blended into the headline, never an "expected concurrency 1.4".
// Every figure comes from `cycleInclusiveBreakEvenGross`; this component does no arithmetic.
function BreakEvenBlock({
  state,
  committed,
  prefix,
}: {
  state: GameState
  committed: number
  prefix: 'budget' | 'release'
}) {
  const be = cycleInclusiveBreakEvenGross(state, committed)
  const shared = cycleInclusiveBreakEvenGross(state, committed, { concurrency: 2 })
  const fc = be.fixedCost
  return (
    <div className="stack" data-testid={`${prefix}-breakeven-block`} style={{ gap: 4 }}>
      <Metric label="Break-even theatrical gross" small testid={`${prefix}-breakeven`}>
        {money(be.cycleInclusive)}
      </Metric>
      <span className="hint" data-testid={`${prefix}-breakeven-direct`}>
        {money(be.direct)} against this film&rsquo;s direct costs only.
      </span>
      <span className="hint" data-testid={`${prefix}-breakeven-shared`}>
        {money(shared.cycleInclusive)} if a second film shares those {fc.weeks} weeks.
      </span>
      <span className="hint" data-testid={`${prefix}-breakeven-assumption`}>
        The headline assumes this film alone carries all {fc.weeks} weeks of studio fixed costs
        &mdash; {TUNING.PRODUCTION_TICKS} weeks in production plus {TUNING.THEATRICAL_WEEKS} weeks
        in release &mdash; at today&rsquo;s {money(fc.weeklyBurn)} per week of payroll and
        overhead, which is {money(fc.amount)}.
      </span>
    </div>
  )
}

// ── D-17A/T9 — greenlight discipline, made legible ───────────────────────────
// D-16 item 13: the skill the economy actually rewards is refusing packages whose CENTRAL
// forecast does not clear the studio's costs — and nothing on the greenlight screen ever
// named it. This line does, in one signed number, from values the read-models already
// produced: expected gross × the blended rental share, less the immediate commitment and
// less the fixed cost of the 14 weeks the film occupies the studio.
//
// INFORMATION DISCIPLINE (binding): this is INFORMATION, not auto-play. It ranks nothing,
// marks no "best package", recommends no choice, and reveals nothing the player cannot
// already see on this screen. The centre of a forecast is not a promise, and the copy says so.
function GreenlightDiscipline({
  state,
  committed,
  expectedTotal,
}: {
  state: GameState
  committed: number
  expectedTotal: number
}) {
  const fc = prospectiveCycleFixedCost(state)
  // D-17A FIX-PASS: the REGIME's share, not a constant — a never-engaged (D-1) studio banks
  // 100% of the gross, so pricing its forecast at 0.52 here disagreed with both its own
  // break-even block and the Dashboard scorecard for the same film.
  const share = regimeStudioShare(state)
  const expectedStudioRevenue = expectedTotal * share
  const result = expectedStudioRevenue - (committed + fc.amount)
  const covers = result >= 0
  return (
    <div className="panel stack" data-testid="greenlight-discipline" style={{ gap: 6 }}>
      <div className="spread">
        <strong>Forecast-positive discipline</strong>
        <strong
          className={covers ? 'money pos' : 'money neg'}
          data-testid="greenlight-discipline-value"
        >
          {covers ? '+' : ''}
          {money(result)}
        </strong>
      </div>
      <span data-testid="greenlight-discipline-verdict">
        This package&rsquo;s central forecast <strong>{covers ? 'covers' : 'does not cover'}</strong>{' '}
        its direct costs and {fc.weeks} weeks of studio fixed costs.
      </span>
      <span className="hint" data-testid="greenlight-discipline-working">
        {share < 1 ? (
          <>
            Expected gross {money(expectedTotal)} × your {pct(share)} rental share is{' '}
            {money(expectedStudioRevenue)} of Studio Revenue
          </>
        ) : (
          <>
            Expected gross {money(expectedTotal)} is {money(expectedStudioRevenue)} of Studio
            Revenue &mdash; with no theatrical run open, the studio keeps all of it
          </>
        )}
        , less {money(committed)} committed now and {money(fc.amount)} of payroll and overhead
        across the cycle.
      </span>
      <span className="hint">
        The centre of a forecast is not a promise &mdash; the range still applies. This is
        information, not a recommendation: the studio does not rank your packages or choose one
        for you.
      </span>
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
  discovery,
  scriptProjectId,
}: {
  state: GameState
  draft: Draft
  concept: FilmConcept
  pkg: DraftPackage | null
  patch: (p: Partial<Draft>) => void
  discovery: DiscoveryExposureView | null
  scriptProjectId?: string
}) {
  const req = requiredNegative(concept, draft.shape, state)
  const negative = NEGATIVE_BUDGET_MULTIPLIERS[draft.negativeLevelIdx]! * req
  const menu = pkg ? marketingMenu(state, pkg, scriptProjectId) : null
  const marketingLevels = menu?.levels ?? MARKETING_BUDGET_LEVELS
  const marketing = marketingLevels[draft.marketingLevelIdx]!
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
  const MKT_LABELS = ['Entry campaign', 'Extended campaign', 'Maximum campaign']
  // A5: the same solvency preview + break-even the Review step uses, surfaced HERE so the whole
  // financial decision is visible in Budget & Forecast — the player never reaches the bottom Next
  // button without meeting it. commitmentPreview is a pure adapter read (no formula); the
  // break-even block reads `cycleInclusiveBreakEvenGross` itself (D-17A/T2).
  const preview = commitmentPreview(state, committed)
  const forecast = pkg ? previewForecast(state, pkg, scriptProjectId) : null
  const mktEff = pkg
    ? marketingEfficiency(state, pkg, scriptProjectId)
    : null // D-12 P2 awareness-conditioned marketing state
  const demand = productionDemandView(state, concept, draft.shape, negative) // D-12 production-demand read model
  const exposure = capitalExposure(state, committed) // C1: capital exposure (separate from solvency)
  // D-17A/T4: the same three affordability scopes the Dashboard and the recap show, beside
  // the budget picker — so "what can I afford" is answered where the money is being chosen.
  const scopes = affordabilityScopes(state)

  return (
    <div className="stack">
      <h2 style={{ marginTop: 0 }}>Budget &amp; Forecast</h2>

      {/* ── Your spending decision ── */}
      <div className="card stack" data-testid="budget-spending">
        <h3 style={{ marginTop: 0 }}>Your spending decision</h3>
        <div className="fact-block">
          <Metric label="Baseline Production Budget (from concept + shape)" small testid="required-negative">
            {money(req)}
          </Metric>
        </div>
        <p className="hint">
          Also called the film&rsquo;s negative cost: the money required to produce the completed
          movie before marketing. Your Production Budget choice scales it.
        </p>

        {/* D-17A/T4 — what the studio can currently field, before you pick a tier. */}
        <div className="panel stack" data-testid="budget-affordability-panel">
          <AffordabilityScopesCard scopes={scopes} testid="budget-affordability" />
        </div>

        <div>
          <h4>Production Budget</h4>
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
          {/* D-12 final downside: engine-derived Production Demand — how much funding THIS film needs
              to realize its ambition, and whether the selected budget under/adequately/over-funds it.
              Truthful; updates live as the tier or Shape changes; never claims budget buys box office. */}
          <div className="panel stack" data-testid="production-demand" style={{ marginTop: 8 }}>
            <div className="row" style={{ gap: 24, flexWrap: 'wrap' }}>
              <Metric label="Production Demand" small testid="demand-category">
                {demand.demandCategory}
              </Metric>
              <Metric label="Funding status" small testid="demand-funding-status">
                {demand.fundingStatus}
              </Metric>
              <Metric label="Funding vs demand" small>
                {Math.round(demand.fundingRatio * 100)}%
              </Metric>
            </div>
            <span className="hint" data-testid="demand-drivers">
              {demand.drivers}
            </span>
            <span className="hint" data-testid="demand-consequence">
              {demand.consequence}
            </span>
          </div>
        </div>

        <div>
          <h4>Marketing</h4>
          {menu?.engaged && (
            <p
              className="hint"
              data-testid="marketing-menu-capacity"
              data-capacity={menu.capacity}
            >
              This package&rsquo;s measured efficient marketing capacity is{' '}
              <strong>{money(menu.capacity)}</strong>. The active menu is anchored to that
              package-specific dollar figure.
            </p>
          )}
          <div className="btn-row" data-testid="marketing-levels">
            {marketingLevels.map((m, i) => (
              <button
                key={i}
                type="button"
                className={`option${draft.marketingLevelIdx === i ? ' selected' : ''}`}
                style={{ width: 'auto' }}
                onClick={() => patch({ marketingLevelIdx: i })}
                data-testid={`marketing-${i}`}
                data-marketing-amount={m}
                data-capacity-multiple={menu?.multipliers?.[i]}
              >
                <div className="opt-title">{MKT_LABELS[i]}</div>
                <div className="opt-desc mono">{money(m)}</div>
                {menu?.multipliers && (
                  <div className="opt-desc">{menu.multipliers[i]}× capacity</div>
                )}
              </button>
            ))}
          </div>
          {/* D-17A/T7 (Owner ruling R6, D-17A half) — MARKETING TRUTH. The rungs and every
              marketing constant are untouched; only the account of them changed.

              What was here before told the player that a large campaign on a low-awareness
              film meant "most of this campaign is wasted". That is a claim about marginal
              return, and it is not what the engine computes: the marketing Hill curve's
              marginal return is positive everywhere — it diminishes, it does not vanish —
              and the reach ceiling is set by the film's visibility, not by a wastage rule.
              Steering the player away from spend whose marginal return is positive is the
              exact defect R6 names.

              Every figure below is a MEASURED `computeBoxOffice` value read through
              `marketingEfficiency`. Overexposure is mentioned if and ONLY if the engine's own
              `overexposure` value is above zero — never inferred from the size of the spend. */}
          {mktEff && mktEff.engaged && (
            <div className="stack" data-testid="marketing-efficiency" style={{ marginTop: 6, gap: 4 }}>
              <span className="hint">
                Campaign status: <strong>{mktEff.state}</strong>.
              </span>
              <span className="hint" data-testid="marketing-capacity">
                {money(mktEff.spend)} against a measured efficient capacity of{' '}
                {money(mktEff.capacity)} &mdash; {Math.round(mktEff.ratio * 100)}% of capacity.
              </span>
              <span className="hint" data-testid="marketing-reach">
                At this film&rsquo;s current visibility ({pct(mktEff.preMarketingAwareness)}), the
                campaign converts to {pct(mktEff.quality)} of the reach spending can buy here,
                for a total opening reach of {pct(mktEff.awarenessFactor)}. Spending more always
                adds some reach; it adds less per dollar the further past capacity you go.
              </span>
              <span className="hint" data-testid="marketing-menu-shape">
                This menu starts at {menu?.multipliers?.[0]}× capacity, extends to{' '}
                {menu?.multipliers?.[1]}×, and reaches its maximum campaign at{' '}
                {menu?.multipliers?.[2]}×. These are breadth choices, not an optimizer or a
                promise of profitable return.
              </span>
              {mktEff.overexposure > 0 && (
                <span className="hint" data-testid="marketing-overexposure">
                  At {mktEff.overexposureThreshold}× capacity the active menu begins to count as
                  overexposure; this selection is at {pct(mktEff.overexposure)} of the full effect,
                  which costs word of mouth if the film underdelivers on what the campaign
                  promised.
                </span>
              )}
              <span className="hint">
                Marketing widens who shows up; it does not change how good the film is.
              </span>
            </div>
          )}
        </div>

        <div className="sep" />
        <div className="stack fact-block">
          <div className="spread">
            <span>Production Budget</span>
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
        </div>
      </div>

      {/* ── Studio impact — C1: solvency and EXPOSURE are separate; a solvent-but-aggressive
          commitment is not reassured with a single green tick. ── */}
      <div className="card stack" data-testid="budget-impact">
        <h3 style={{ marginTop: 0 }}>Studio impact</h3>
        <div className="row" style={{ gap: 24, flexWrap: 'wrap' }}>
          <Metric label="Solvency" small testid="budget-solvency">
            <span className={preview.affordable ? 'money pos' : 'money neg'}>
              {preview.affordable ? 'Pass' : 'Blocked'}
            </span>
          </Metric>
          <Metric label="Capital committed" small testid="budget-capital-committed">
            {moneyExact(committed)} · {Math.round(exposure.pctOfCash * 100)}% of current cash
          </Metric>
          <Metric label="Exposure" small testid="budget-exposure">
            {/* NOT green for High/Extreme — passing solvency does not make an aggressive bet safe. */}
            <span
              className={
                exposure.exposure === 'Low'
                  ? 'money pos'
                  : exposure.exposure === 'Extreme'
                    ? 'money neg'
                    : 'mono'
              }
            >
              {exposure.exposure}
            </span>
          </Metric>
          <Metric label="Current Cash" small>
            <span className={cash < 0 ? 'money neg' : 'money pos'}>{moneyExact(cash)}</span>
          </Metric>
          <Metric label="Cash After Greenlight" small testid="budget-cash-after">
            <span className={preview.cashAfter < 0 ? 'money neg' : 'money pos'}>
              {moneyExact(preview.cashAfter)}
            </span>
          </Metric>
          <Metric label="Post-Greenlight Runway" small testid="budget-runway">
            {preview.postRunway.infinite ? '—' : `${preview.postRunway.weeks} wk`}
          </Metric>
        </div>
        {(exposure.exposure === 'High' || exposure.exposure === 'Extreme') && preview.affordable && (
          <p className="hint" data-testid="budget-exposure-note">
            This greenlight is solvent, but it commits {Math.round(exposure.pctOfCash * 100)}% of your
            current cash — a {exposure.exposure.toLowerCase()}-exposure bet. One weak result could leave
            the studio thin. Consider a smaller Production Budget or Marketing.
          </p>
        )}
        {goesNegative && (
          <Warn>
            This commitment ({moneyExact(committed)}) is more than the studio has on hand
            ({moneyExact(cash)}). A greenlight can’t overdraw the studio (D-12 solvency rule), so
            lower the Production Budget or Marketing until the commitment fits your cash.
          </Warn>
        )}
      </div>

      {/* ── Commercial outlook ── */}
      <div className="card stack" data-testid="budget-outlook">
        <h3 style={{ marginTop: 0 }}>Commercial outlook</h3>
        <div className="row" style={{ gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <Metric label="Expected Total Theatrical Gross" small testid="budget-expected-gross">
            {forecast ? money(forecast.expectedTotal) : '—'}
          </Metric>
          <BreakEvenBlock state={state} committed={committed} prefix="budget" />
        </div>
        {/* D-17A/T9 — the discipline, named, at the point the spending decision is made. */}
        {forecast && (
          <GreenlightDiscipline state={state} committed={committed} expectedTotal={forecast.expectedTotal} />
        )}
        {forecast ? (
          <ForecastDisplay forecast={forecast} mode="normal" source="estimate" />
        ) : (
          <div className="panel">
            <p className="hint">Finish choosing talent to see the forecast.</p>
          </div>
        )}
        {/* D-17A/T6 — the discoverability band, with real numbers, beside the forecast. */}
        {discovery && forecast && (
          <div className="panel">
            <DiscoveryExposureLine
              exposure={discovery}
              expectedOpening={forecast.expectedOpening}
              testid="budget-discovery-exposure"
            />
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
  cycleFixedCost,
  discovery,
  scriptProjectId,
}: {
  state: GameState
  pkg: DraftPackage
  conceptTitle: string
  preview: CommitmentPreview
  cohesion: CreativeCohesion | null
  fit: PackageFit | null
  execution: ExecutionConfidence | null
  profit: ForecastProfitRange | null
  cycleFixedCost: CycleFixedCost
  discovery: DiscoveryExposureView | null
  scriptProjectId?: string
}) {
  const committed = totalCommittedCost(state, pkg)
  const exposure = capitalExposure(state, committed) // C1: solvency and exposure are separate
  // D-17A/T2: the same cycle-inclusive headline the Budget step shows, for the closing hint.
  const be = cycleInclusiveBreakEvenGross(state, committed)
  // ONE forecast for this step — the discipline line and the forecast panel read the same object.
  const forecast = previewForecast(state, pkg, scriptProjectId)
  const menu = marketingMenu(state, pkg, scriptProjectId)
  return (
    <div className="stack">
      {/* Film Readiness — assembled from the four real dimensions, not a hidden score */}
      {cohesion && fit && execution && profit && (
        <FilmReadiness cohesion={cohesion} fit={fit} execution={execution} profit={profit} cycleFixedCost={cycleFixedCost} />
      )}
      {/* D-12 Phase 3 — the SAME team-direction the autopsy later explains, shown before greenlight. */}
      <TeamDirectionPanel state={state} sel={{ writerId: pkg.writerId, directorId: pkg.directorId, cast: pkg.cast, shape: pkg.shape }} />

      <div className="grid grid-2">
        <div className="card stack">
          <h2>Review &amp; release strategy</h2>
          {/* D-17A/T9 — the named discipline sits at the TOP of the decision card, before the
              individual figures, because it is the question the decision turns on. */}
          <GreenlightDiscipline state={state} committed={committed} expectedTotal={forecast.expectedTotal} />
          <div className="spread">
            <span>Film</span>
            <strong>{conceptTitle}</strong>
          </div>
          <div className="spread">
            <span>Total immediate commitment (Production Budget + Marketing + Freelancer Fees)</span>
            <strong className="mono" data-testid="release-commitment">
              {moneyExact(committed)}
            </strong>
          </div>
          {menu.engaged && (
            <div className="spread" data-testid="release-marketing-capacity">
              <span>Package marketing capacity</span>
              <strong className="mono">{money(menu.capacity)}</strong>
            </div>
          )}
          {/* D-17A/T2: the studio-economic headline, with the direct figure kept as labelled
              detail and shared occupancy as a NAMED second line. */}
          <BreakEvenBlock state={state} committed={committed} prefix="release" />
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
              {preview.affordable ? 'Pass ✓' : 'Blocked ✗'}
            </strong>
          </div>
          <div className="spread" data-testid="release-exposure">
            <span>Capital exposure ({Math.round(exposure.pctOfCash * 100)}% of cash)</span>
            {/* Passing solvency does not make an aggressive bet safe — not green for High/Extreme. */}
            <strong
              className={
                exposure.exposure === 'Low'
                  ? 'money pos'
                  : exposure.exposure === 'Extreme'
                    ? 'money neg'
                    : 'mono'
              }
            >
              {exposure.exposure}
            </strong>
          </div>
          {!preview.affordable && <Warn>{preview.reason}</Warn>}
          <p className="hint">
            Greenlighting commits the budget and salaries now. Studio Revenue is your rental share
            of box office, paid weekly across the film’s theatrical run — so the film must gross
            about {money(be.cycleInclusive)} to return its own costs and the {be.fixedCost.weeks}{' '}
            weeks of studio payroll and overhead it occupies. The forecast is a prediction, not a
            guarantee.
          </p>
        </div>
        <div className="stack">
          <ForecastDisplay forecast={forecast} mode="normal" source="estimate" />
          {/* D-17A/T6 — the discoverability band, beside the forecast it widens. */}
          {discovery && (
            <div className="panel">
              <DiscoveryExposureLine
                exposure={discovery}
                expectedOpening={forecast.expectedOpening}
                testid="release-discovery-exposure"
              />
            </div>
          )}
        </div>
      </div>

      {/* Full four-dimension Film Package summary at greenlight review */}
      {cohesion && (
        <FilmPackageSummary
          cohesion={cohesion}
          {...(fit ? { fit } : {})}
          {...(execution ? { execution } : {})}
          {...(profit ? { profit } : {})}
          cycleFixedCost={cycleFixedCost}
          {...(discovery ? { discovery } : {})}
          marketing={menu}
        />
      )}
    </div>
  )
}
