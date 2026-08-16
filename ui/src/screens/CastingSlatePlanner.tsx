import { useRef, useState } from 'react'
import { CAST_SLOTS } from '../engine/adapter.ts'
import type {
  CastSlot,
  ActionOutcome,
  CastingCandidateView,
  CastingProjectView,
  StartCastingSessionPayload,
} from '../engine/adapter.ts'
import { genreLabel } from '../content.ts'

const SLOT_LABEL: Record<CastSlot, string> = {
  lead: 'Lead',
  antagonist: 'Antagonist',
  support: 'Support',
}

export type CastingSlate = StartCastingSessionPayload['slate']

export type CastingSlateDraft = Record<CastSlot, string[]>

function emptySlate(): CastingSlateDraft {
  return { lead: [], antagonist: [], support: [] }
}

function copyDraft(draft: CastingSlateDraft): CastingSlateDraft {
  return {
    lead: [...draft.lead],
    antagonist: [...draft.antagonist],
    support: [...draft.support],
  }
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
      aria-label={`${candidate.name}, ${candidate.fit.label} ${candidate.fit.score.toFixed(0)}, ${candidate.availabilityLabel}`}
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

export type CastingSlatePlannerProps = {
  project: CastingProjectView
  /** A host claim or current authority change can suspend every planner action. */
  disabled?: boolean
  onCancel?: () => void
  onSlateChange?: (draft: CastingSlateDraft) => void
  onSubmit: (slate: CastingSlate) => ActionOutcome
}

/**
 * The one canonical camera-test slate editor shared by Casting Room and the
 * retained Studio Lot host. It owns selection law only; Engine dispatch and
 * exact-once authority remain with its host.
 */
export function CastingSlatePlanner({
  project,
  disabled = false,
  onCancel,
  onSlateChange,
  onSubmit,
}: CastingSlatePlannerProps) {
  const [selected, setSelected] = useState<CastingSlateDraft>(emptySlate)
  const [error, setError] = useState('')
  const selectedRef = useRef(selected)
  selectedRef.current = selected

  const uniqueCount = new Set(CAST_SLOTS.flatMap((slot) => selected[slot])).size
  const exactPairs = CAST_SLOTS.every((slot) => selected[slot].length === 2)
  const planStillLegal = project.legalActions.some(
    (action) => action.kind === 'planAuditions' && action.projectId === project.projectId,
  )
  const everySelectionStillAvailable = CAST_SLOTS.every((slot) =>
    selected[slot].every((id) =>
      project.candidates[slot].some((candidate) => candidate.id === id && candidate.available),
    ),
  )
  const canStart =
    !disabled && planStillLegal && everySelectionStillAvailable && exactPairs && uniqueCount >= 3

  function toggle(slot: CastSlot, candidate: CastingCandidateView) {
    if (disabled || !candidate.available) return
    const current = selectedRef.current
    const pair = current[slot]
    const nextPair = pair.includes(candidate.id)
      ? pair.filter((id) => id !== candidate.id)
      : pair.length < 2
        ? [...pair, candidate.id]
        : pair
    if (nextPair === pair) return
    const next = { ...current, [slot]: nextPair }
    selectedRef.current = next
    setSelected(next)
    setError('')
    onSlateChange?.(copyDraft(next))
  }

  function submit() {
    if (!canStart) return
    const result = onSubmit({
      lead: [selected.lead[0]!, selected.lead[1]!],
      antagonist: [selected.antagonist[0]!, selected.antagonist[1]!],
      support: [selected.support[0]!, selected.support[1]!],
    })
    if (!result.ok) {
      setError(result.error)
      return
    }
    setError('')
  }

  return (
    <section
      className="card stack casting-slate-planner"
      aria-labelledby="casting-plan-heading"
      data-testid="casting-planner"
    >
      <div className="spread casting-slate-planner-heading">
        <div>
          <div className="eyebrow">Camera-test slate</div>
          <h2 id="casting-plan-heading">Plan auditions for {project.title}</h2>
          <p className="hint" data-testid="casting-plan-screenplay-context">
            {genreLabel(project.genre)} screenplay by {project.writer.name}. Choose exactly two
            primary Actors for each role. A person may read more than one role, but the complete
            slate needs at least three different people.
          </p>
        </div>
        {onCancel !== undefined && (
          <button
            type="button"
            disabled={disabled}
            onClick={onCancel}
            data-testid="casting-plan-close"
          >
            Close
          </button>
        )}
      </div>

      {error !== '' && (
        <div className="errbox" role="alert" data-testid="casting-planner-error">
          {error}
        </div>
      )}

      <div className="inset stack" data-testid="casting-consequence">
        <strong>{project.consequence}</strong>
        <span>
          There is no audition fee. Camera tests do not sign, pay, reserve, or mark an actor busy. They do
          not hold an Actor or choose a winner.
        </span>
        <span className="hint">
          Results are imperfect evidence, not a forecast guarantee or an automatic cast choice.
        </span>
      </div>

      <div className="grid grid-3 casting-slate-candidate-grid">
        {CAST_SLOTS.map((slot) => (
          <fieldset className="panel stack" key={slot} data-testid={`casting-slate-${slot}`}>
            <legend>{SLOT_LABEL[slot]} · choose 2</legend>
            <span
              className="hint"
              aria-live="polite"
              aria-atomic="true"
              data-testid={`casting-selection-count-${slot}`}
            >
              {selected[slot].length} of 2 selected
            </span>
            {project.candidates[slot].map((candidate) => (
              <CandidateButton
                key={candidate.id}
                candidate={candidate}
                slot={slot}
                selected={selected[slot].includes(candidate.id)}
                disabled={
                  disabled ||
                  !candidate.available ||
                  (selected[slot].length >= 2 && !selected[slot].includes(candidate.id))
                }
                onToggle={() => toggle(slot, candidate)}
              />
            ))}
          </fieldset>
        ))}
      </div>

      <div className="spread casting-slate-planner-submit">
        <span
          className="hint"
          role="status"
          aria-live="polite"
          aria-atomic="true"
          data-testid="casting-unique-count"
        >
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
