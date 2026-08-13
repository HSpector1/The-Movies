// ── Casting Room ────────────────────────────────────────────────────────────
// Optional, project-bound camera tests. Every candidate, blocker, Fit value,
// result band, and package gate arrives through the core read model. This screen
// never reads raw talent attributes and never chooses or reserves a winner.

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  CAST_SLOTS,
  acknowledgeCastingSessionAction,
  activateCastingSessionsAction,
  castingSessionsBoard,
  startCastingSessionAction,
} from '../engine/adapter.ts'
import type {
  CastSlot,
  CastingCandidateView,
  CastingProjectView,
  CastingSessionsReadModel,
  GameState,
} from '../engine/adapter.ts'
import { genreLabel } from '../content.ts'

const SLOT_LABEL: Record<CastSlot, string> = {
  lead: 'Lead',
  antagonist: 'Antagonist',
  support: 'Support',
}

type SlateDraft = Record<CastSlot, string[]>

const EMPTY_SLATE = (): SlateDraft => ({ lead: [], antagonist: [], support: [] })

function Blockers({
  blockers,
  testId,
}: {
  blockers: NonNullable<CastingProjectView['packageAvailability']>['blockers']
  testId: string
}) {
  if (blockers.length === 0) return null
  return (
    <div className="stack" data-testid={testId}>
      {blockers.map((blocker) => (
        <div className="warn" key={`${blocker.kind}:${blocker.headline}`}>
          <strong>{blocker.headline}</strong>
          <div>{blocker.detail}</div>
          <div className="hint">Remedy: {blocker.remedy}</div>
        </div>
      ))}
    </div>
  )
}

function CapacityPanel({ capacity }: { capacity: CastingSessionsReadModel['capacity'] }) {
  return (
    <section className="card stack" aria-labelledby="casting-capacity-heading">
      <div className="spread">
        <div>
          <h2 id="casting-capacity-heading">Development &amp; Casting capacity</h2>
          <div className="mono" data-testid="casting-capacity-summary">
            {capacity.occupied} of {capacity.capacity} slots occupied · {capacity.available} available
          </div>
        </div>
        <span className={`tag ${capacity.available > 0 ? 'fact' : 'warning'}`}>
          Exact occupancy
        </span>
      </div>
      <div className="grid grid-2">
        {capacity.facilities.map((facility) => (
          <article className="panel stack" key={facility.facilityId}>
            <div className="spread">
              <strong>{facility.facilityName}</strong>
              <span className="mono">{facility.occupied}/{facility.capacity}</span>
            </div>
            {facility.slots.map((slot) => (
              <div className="inset" key={slot.slot}>
                <span className="hint">Slot {slot.slot + 1}: </span>
                {slot.occupant?.label ?? 'Available'}
              </div>
            ))}
          </article>
        ))}
      </div>
    </section>
  )
}

function CandidateButton({
  candidate,
  selected,
  disabled,
  onToggle,
  slot,
}: {
  candidate: CastingCandidateView
  selected: boolean
  disabled: boolean
  onToggle: () => void
  slot: CastSlot
}) {
  return (
    <button
      type="button"
      className={`option${selected ? ' selected' : ''}${candidate.available ? '' : ' ineligible'}`}
      aria-pressed={selected}
      disabled={disabled}
      onClick={onToggle}
      data-testid={`casting-candidate-${slot}-${candidate.id}`}
    >
      <span className="spread">
        <span className="opt-title">{candidate.name}</span>
        <span className="tag estimate">{candidate.fit.label} {candidate.fit.score.toFixed(0)}</span>
      </span>
      <span className="opt-desc">Primary Actor · {candidate.availabilityLabel}</span>
    </button>
  )
}

function SlatePlanner({
  project,
  state,
  onChange,
  onCancel,
  onStarted,
  onError,
}: {
  project: CastingProjectView
  state: GameState
  onChange: (next: GameState) => void
  onCancel: () => void
  onStarted: (projectId: string) => void
  onError: (message: string) => void
}) {
  const [selected, setSelected] = useState<SlateDraft>(EMPTY_SLATE)

  const uniqueCount = new Set(CAST_SLOTS.flatMap((slot) => selected[slot])).size
  const exactPairs = CAST_SLOTS.every((slot) => selected[slot].length === 2)
  const planStillLegal = project.legalActions.some((action) => action.kind === 'planAuditions')
  const everySelectionStillAvailable = CAST_SLOTS.every((slot) =>
    selected[slot].every((id) =>
      project.candidates[slot].some((candidate) => candidate.id === id && candidate.available),
    ),
  )
  const canStart =
    planStillLegal && everySelectionStillAvailable && exactPairs && uniqueCount >= 3

  function toggle(slot: CastSlot, candidate: CastingCandidateView) {
    setSelected((current) => {
      const pair = current[slot]
      const nextPair = pair.includes(candidate.id)
        ? pair.filter((id) => id !== candidate.id)
        : pair.length < 2
          ? [...pair, candidate.id]
          : pair
      return { ...current, [slot]: nextPair }
    })
  }

  function submit() {
    if (!canStart) return
    const result = startCastingSessionAction(state, {
      projectId: project.projectId,
      slate: {
        lead: [selected.lead[0]!, selected.lead[1]!],
        antagonist: [selected.antagonist[0]!, selected.antagonist[1]!],
        support: [selected.support[0]!, selected.support[1]!],
      },
    })
    if (!result.ok) {
      onError(result.error)
      return
    }
    onError('')
    onStarted(project.projectId)
    onChange(result.next)
  }

  return (
    <section className="card stack" aria-labelledby="casting-plan-heading" data-testid="casting-planner">
      <div className="spread">
        <div>
          <div className="eyebrow">Camera-test slate</div>
          <h2 id="casting-plan-heading">Plan auditions for {project.title}</h2>
          <p className="hint">
            Choose exactly two primary Actors for each role. A person may read more than one role,
            but the complete slate needs at least three different people.
          </p>
        </div>
        <button type="button" onClick={onCancel} data-testid="casting-plan-close">Close</button>
      </div>

      <div className="inset stack" data-testid="casting-consequence">
        <strong>One week · one shared Development &amp; Casting slot · no audition fee</strong>
        <span>
          Camera tests do not sign, pay, reserve, or mark an actor busy. Payroll and studio overhead
          continue while the week passes.
        </span>
        <span className="hint">
          Results are imperfect evidence, not a forecast guarantee or an automatic cast choice.
        </span>
      </div>

      <div className="grid grid-3">
        {CAST_SLOTS.map((slot) => (
          <fieldset className="panel stack" key={slot} data-testid={`casting-slate-${slot}`}>
            <legend>{SLOT_LABEL[slot]} · choose 2</legend>
            <span className="hint" aria-live="polite" aria-atomic="true">
              {selected[slot].length} of 2 selected
            </span>
            {project.candidates[slot].map((candidate) => (
              <CandidateButton
                key={candidate.id}
                candidate={candidate}
                slot={slot}
                selected={selected[slot].includes(candidate.id)}
                disabled={
                  !candidate.available ||
                  (selected[slot].length >= 2 && !selected[slot].includes(candidate.id))
                }
                onToggle={() => toggle(slot, candidate)}
              />
            ))}
          </fieldset>
        ))}
      </div>

      <div className="spread">
        <span className="hint" role="status" aria-live="polite" aria-atomic="true" data-testid="casting-unique-count">
          {uniqueCount} different actor{uniqueCount === 1 ? '' : 's'} selected · at least 3 required
        </span>
        <button
          type="button"
          className="primary"
          disabled={!canStart}
          onClick={submit}
          data-testid="casting-start"
        >
          Start one-week auditions
        </button>
      </div>
    </section>
  )
}

export function CastingEvidence({ project }: { project: CastingProjectView }) {
  if (project.results === null) return null
  return (
    <section className="stack" aria-labelledby={`casting-evidence-${project.projectId}`} data-testid={`casting-results-${project.projectId}`}>
      <div>
        <h3 id={`casting-evidence-${project.projectId}`}>Camera-test evidence</h3>
        <p className="hint">
          Est. ranges are persisted audition observations, not guarantees. Fit is the studio’s adjacent project metric; current availability still controls legal casting.
        </p>
      </div>
      <div className="grid grid-3">
        {CAST_SLOTS.map((slot) => (
          <section className="inset stack" key={slot} aria-labelledby={`casting-results-${project.projectId}-${slot}`}>
            <h3 id={`casting-results-${project.projectId}-${slot}`}>{SLOT_LABEL[slot]}</h3>
            {project.results![slot].map((result) => (
              <article className="panel stack" key={result.talentId} data-testid={`casting-result-${slot}-${result.talentId}`}>
                <div className="spread">
                  <strong>{result.name}</strong>
                  <span className="tag estimate">{result.label} {result.estimate}</span>
                </div>
                <div className="mono">Camera-test range {result.low}–{result.high}</div>
                <div>{result.fit.label} {result.fit.score.toFixed(0)}</div>
                <div className="hint">Current status: {result.availabilityLabel}</div>
                {result.strengths.map((strength) => (
                  <div key={strength}>Strength: {strength}</div>
                ))}
                {result.concerns.map((concern) => (
                  <div className="hint" key={concern}>Concern: {concern}</div>
                ))}
              </article>
            ))}
          </section>
        ))}
      </div>
    </section>
  )
}

function ProjectCard({
  project,
  onPlan,
  onOpenPackage,
  onAcknowledge,
  statusRef,
}: {
  project: CastingProjectView
  onPlan: () => void
  onOpenPackage: () => void
  onAcknowledge: () => void
  statusRef: (node: HTMLSpanElement | null) => void
}) {
  const plan = project.legalActions.find((action) => action.kind === 'planAuditions')
  const open = project.legalActions.find((action) => action.kind === 'openPackage')
  const acknowledge = project.legalActions.find(
    (action) => action.kind === 'acknowledgeCastingSession',
  )
  return (
    <article className="panel stack" data-testid={`casting-project-${project.projectId}`}>
      <div className="spread">
        <div>
          <strong>{project.title}</strong>
          <div className="hint">{genreLabel(project.genre)} · screenplay by {project.writer.name}</div>
        </div>
        <span
          className={`tag ${project.status === 'review' ? 'warning' : 'fact'}`}
          role="status"
          aria-live="polite"
          aria-atomic="true"
          tabIndex={-1}
          ref={statusRef}
          data-testid={`casting-status-${project.projectId}`}
        >
          {project.status === 'notStarted'
            ? 'Ready to plan'
            : project.status === 'auditioning'
              ? 'Auditioning'
              : project.status === 'review'
                ? 'Results need review'
                : 'Casting review complete'}
        </span>
      </div>

      {project.status === 'auditioning' && (
        <div className="mono" data-testid={`casting-due-${project.projectId}`}>
          Due Week {project.dueWeek} · {project.weeksUntilDecision} week{project.weeksUntilDecision === 1 ? '' : 's'} until results
        </div>
      )}

      <p className="hint">{project.consequence}</p>
      <CastingEvidence project={project} />
      {project.blockers.length > 0 && (
        <div className="stack" data-testid={`casting-session-blockers-${project.projectId}`}>
          {project.blockers.map((blocker) => (
            <div className="warn" key={blocker}>{blocker}</div>
          ))}
        </div>
      )}
      <Blockers blockers={project.packageAvailability?.blockers ?? []} testId={`casting-blockers-${project.projectId}`} />

      <div className="btn-row">
        {open && (
          <button type="button" className="primary" onClick={onOpenPackage} data-testid={`casting-open-package-${project.projectId}`}>
            {open.label}
          </button>
        )}
        {plan && (
          <button type="button" onClick={onPlan} data-testid={`casting-plan-${project.projectId}`}>
            {plan.label}
          </button>
        )}
        {acknowledge && (
          <button type="button" className="primary" onClick={onAcknowledge} data-testid={`casting-acknowledge-${project.projectId}`}>
            {acknowledge.label}
          </button>
        )}
      </div>
    </article>
  )
}

const SECTIONS: ReadonlyArray<{
  key: keyof CastingSessionsReadModel['sections']
  title: string
  empty: string
}> = [
  { key: 'needsReview', title: 'Needs review', empty: 'No audition results are waiting for review.' },
  { key: 'auditioning', title: 'Auditions underway', empty: 'No camera tests are underway.' },
  { key: 'readyToPlan', title: 'Ready screenplays', empty: 'No accepted screenplay is ready for casting.' },
  { key: 'history', title: 'Casting history', empty: 'No completed casting review yet.' },
]

export function CastingRoom({
  state,
  onChange,
  initialProjectId,
  onOpenPackage,
  onOpenRoster,
  onBack,
}: {
  state: GameState
  onChange: (next: GameState) => void
  initialProjectId?: string
  onOpenPackage: (projectId: string) => void
  onOpenRoster: () => void
  onBack: () => void
}) {
  const board = useMemo(() => castingSessionsBoard(state), [state])
  const initialPlanningProjectId = board.sections.readyToPlan.find(
    (project) =>
      project.projectId === initialProjectId &&
      project.legalActions.some((action) => action.kind === 'planAuditions'),
  )?.projectId ?? null
  const [planningProjectId, setPlanningProjectId] = useState<string | null>(initialPlanningProjectId)
  const [error, setError] = useState('')
  const [announcement, setAnnouncement] = useState('')
  const pendingFocusProjectId = useRef<string | null>(null)
  const statusRefs = useRef(new Map<string, HTMLSpanElement>())
  const planningProject = board.sections.readyToPlan.find(
    (project) => project.projectId === planningProjectId,
  )

  useEffect(() => {
    const projectId = pendingFocusProjectId.current
    if (projectId === null) return
    const target = statusRefs.current.get(projectId)
    if (target === undefined) return
    target.focus()
    pendingFocusProjectId.current = null
  }, [board])

  function activate() {
    setError('')
    const result = activateCastingSessionsAction(state)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setAnnouncement('Casting Sessions activated. No prior audition history was inferred.')
    onChange(result.next)
  }

  function acknowledge(project: CastingProjectView) {
    if (project.sessionId === null) return
    setError('')
    const takeToPackage =
      project.legalActions.find((action) => action.kind === 'acknowledgeCastingSession')
        ?.opensPackage ?? false
    const result = acknowledgeCastingSessionAction(state, project.sessionId)
    if (!result.ok) {
      setError(result.error)
      return
    }
    onChange(result.next)
    setAnnouncement(
      takeToPackage
        ? `${project.title} casting review complete. Opening a blank package.`
        : `${project.title} casting review complete. The ordinary package blockers remain listed.`,
    )
    if (takeToPackage) {
      onOpenPackage(project.projectId)
    } else {
      pendingFocusProjectId.current = project.projectId
    }
  }

  return (
    <main className="app-shell stack" data-testid="casting-room">
      <header className="spread card">
        <div>
          <div className="eyebrow">Talent · Camera tests</div>
          <h1>Casting Room</h1>
          <p className="hint">
            Spend one week gathering imperfect role-specific evidence, then make the final cast decision in Package Assembly.
          </p>
        </div>
        <div className="btn-row">
          <button type="button" onClick={onBack} data-testid="casting-room-back">Back to studio</button>
          <button type="button" onClick={onOpenRoster} data-testid="casting-open-roster">Studio Roster</button>
        </div>
      </header>

      <div className="visually-hidden" role="status" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>

      {board.mode === 'legacy' && (
        <section className="card stack" data-testid="casting-legacy">
          <h2>Enable Casting Sessions</h2>
          <p>
            This migrated studio has no inferred audition history. Enabling starts the optional camera-test loop from now on; the existing direct package path remains unchanged.
          </p>
          {board.activation.blocker && (
            <div className="warn" data-testid="casting-activation-blocker">
              {board.activation.blocker}
            </div>
          )}
          <button
            type="button"
            className="primary"
            disabled={!board.activation.canActivate}
            onClick={activate}
            data-testid="casting-activate"
          >
            Enable Casting Sessions
          </button>
        </section>
      )}

      <CapacityPanel capacity={board.capacity} />

      {error && <div className="errbox" role="alert" data-testid="casting-error">{error}</div>}

      {planningProject && (
        <SlatePlanner
          key={planningProject.projectId}
          project={planningProject}
          state={state}
          onChange={onChange}
          onCancel={() => setPlanningProjectId(null)}
          onStarted={(projectId) => {
            setPlanningProjectId(null)
            pendingFocusProjectId.current = projectId
            setAnnouncement('Auditions started. Results are due in one week; no actor was reserved or paid.')
          }}
          onError={setError}
        />
      )}

      {SECTIONS.map((section) => {
        const projects = board.sections[section.key]
        return (
          <section className="card stack" key={section.key} aria-labelledby={`casting-section-${section.key}`}>
            <div className="spread">
              <h2 id={`casting-section-${section.key}`}>{section.title}</h2>
              <span className="badge mono">{projects.length}</span>
            </div>
            {projects.length === 0 ? (
              <div className="empty" data-testid={`casting-empty-${section.key}`}>{section.empty}</div>
            ) : (
              <div className="grid grid-2" data-testid={`casting-section-${section.key}-cards`}>
                {projects.map((project) => (
                  <ProjectCard
                    key={project.projectId}
                    project={project}
                    onPlan={() => {
                      if (!project.legalActions.some((action) => action.kind === 'planAuditions')) {
                        return
                      }
                      setError('')
                      setPlanningProjectId(project.projectId)
                    }}
                    onOpenPackage={() => onOpenPackage(project.projectId)}
                    onAcknowledge={() => acknowledge(project)}
                    statusRef={(node) => {
                      if (node) statusRefs.current.set(project.projectId, node)
                      else statusRefs.current.delete(project.projectId)
                    }}
                  />
                ))}
              </div>
            )}
          </section>
        )
      })}
    </main>
  )
}
