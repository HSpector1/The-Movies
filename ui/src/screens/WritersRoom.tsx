// ── Writers Room ────────────────────────────────────────────────────────────
// Persistent screenplay-development workspace. Every lifecycle fact, blocker,
// legal action, assessment, and capacity slot arrives through the adapter's
// narrow core read model; this screen never inspects mutable screenplay state.

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  PROMISE_CENTERS,
  PROMISE_WIDTHS,
  SEGMENT_ORDER,
  rangeFrom,
  scriptProjectsBoard,
  runScriptProjectAction,
  commissionScriptAction,
} from '../engine/adapter.ts'
import type {
  CommissionScriptPayload,
  FilmPromise,
  FilmShape,
  GameState,
  ScriptProjectActionView,
  ScriptProjectsReadModel,
  SegmentId,
} from '../engine/adapter.ts'
import {
  ENDING_OPTIONS,
  MIDPOINT_OPTIONS,
  OPENING_OPTIONS,
  PROMISE_AXIS_INFO,
  SHAPE_DESCRIPTIONS,
  genreLabel,
} from '../content.ts'

const DEFAULT_SHAPE: FilmShape = {
  opening: 'slowSetup',
  midpoint: 'reversal',
  ending: 'bittersweet',
}

type PromiseAxis = keyof FilmPromise['ranges']
type SectionKey = keyof ScriptProjectsReadModel['sections']

const SECTION_ORDER: readonly {
  key: SectionKey
  title: string
  empty: string
}[] = [
  {
    key: 'needsReview',
    title: 'Needs review',
    empty: 'No screenplay is waiting for a studio decision.',
  },
  {
    key: 'inDevelopment',
    title: 'In development',
    empty: 'No screenplay is drafting or rewriting this week.',
  },
  {
    key: 'readyToPackage',
    title: 'Ready to package',
    empty: 'No accepted screenplay is waiting for a film package.',
  },
  {
    key: 'productionHistory',
    title: 'Production history',
    empty: 'No screenplay has entered production yet.',
  },
]

function formatScore(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

function PromiseCenterControl({
  axis,
  index,
  onChange,
}: {
  axis: PromiseAxis
  index: number
  onChange: (index: number) => void
}) {
  const info = PROMISE_AXIS_INFO[axis]
  return (
    <label className="stack" htmlFor={`script-promise-${axis}`}>
      <span>
        <strong>{info.title}</strong>{' '}
        <span className="hint">— {info.desc}</span>
      </span>
      <select
        id={`script-promise-${axis}`}
        data-testid={`script-promise-${axis}`}
        value={index}
        onChange={(event) => onChange(Number(event.target.value))}
      >
        {PROMISE_CENTERS.map((center, optionIndex) => (
          <option key={center} value={optionIndex}>
            {optionIndex === 0
              ? info.low
              : optionIndex === PROMISE_CENTERS.length - 1
                ? info.high
                : center < 0
                  ? `Leans ${info.low.toLowerCase()}`
                  : `Leans ${info.high.toLowerCase()}`}
          </option>
        ))}
      </select>
    </label>
  )
}

function Blockers({
  blockers,
  testId,
}: {
  blockers: ScriptProjectsReadModel['commission']['blockers']
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

function CommissionPanel({
  board,
  state,
  onChange,
  onClose,
  onError,
}: {
  board: ScriptProjectsReadModel
  state: GameState
  onChange: (next: GameState) => void
  onClose: () => void
  onError: (message: string) => void
}) {
  const firstConcept = board.commission.concepts[0]
  const firstWriter = board.commission.writers.find((writer) => writer.available)
  const [conceptId, setConceptId] = useState(firstConcept?.id ?? '')
  const [writerId, setWriterId] = useState(firstWriter?.id ?? '')
  const [shape, setShape] = useState<FilmShape>(DEFAULT_SHAPE)
  const [segments, setSegments] = useState<SegmentId[]>(['adult'])
  const [promiseCenters, setPromiseCenters] = useState<Record<PromiseAxis, number>>({
    intimacy: 1,
    tonalWeight: 1,
    kineticEnergy: 1,
  })

  const concept = board.commission.concepts.find((candidate) => candidate.id === conceptId)
  const canSubmit =
    board.commission.canStart &&
    concept !== undefined &&
    board.commission.writers.some((writer) => writer.id === writerId && writer.available) &&
    segments.length > 0

  function toggleSegment(segment: SegmentId) {
    setSegments((current) =>
      current.includes(segment)
        ? current.filter((candidate) => candidate !== segment)
        : [...current, segment],
    )
  }

  function submit() {
    if (!canSubmit || concept === undefined) return
    const width = PROMISE_WIDTHS[1]
    const ranges = {} as FilmPromise['ranges']
    for (const axis of Object.keys(promiseCenters) as PromiseAxis[]) {
      ranges[axis] = rangeFrom(PROMISE_CENTERS[promiseCenters[axis]]!, width)
    }
    const payload: CommissionScriptPayload = {
      conceptId: concept.id,
      writerId,
      shape,
      promise: {
        genre: concept.genre,
        intendedSegments: segments,
        ranges,
      },
    }
    const result = commissionScriptAction(state, payload)
    if (!result.ok) {
      onError(result.error)
      return
    }
    onError('')
    onClose()
    onChange(result.next)
  }

  return (
    <section className="card stack" aria-labelledby="commission-script-heading" data-testid="commission-panel">
      <div className="spread">
        <div>
          <h2 id="commission-script-heading">Commission a screenplay</h2>
          <p className="hint">
            Lock the concept, creative shape, audience promise, and contracted writer before work begins.
          </p>
        </div>
        <button type="button" onClick={onClose} data-testid="commission-close">
          Close
        </button>
      </div>

      <Blockers blockers={board.commission.blockers} testId="commission-blockers" />

      <div className="grid grid-2">
        <label className="stack" htmlFor="script-concept">
          <strong>Source concept</strong>
          <select
            id="script-concept"
            data-testid="script-concept"
            value={conceptId}
            onChange={(event) => setConceptId(event.target.value)}
          >
            {board.commission.concepts.map((candidate) => (
              <option key={candidate.id} value={candidate.id}>
                {candidate.title} — {genreLabel(candidate.genre)}
              </option>
            ))}
          </select>
        </label>

        <label className="stack" htmlFor="script-writer">
          <strong>Contracted writer</strong>
          <select
            id="script-writer"
            data-testid="script-writer"
            value={writerId}
            onChange={(event) => setWriterId(event.target.value)}
          >
            {board.commission.writers.map((writer) => (
              <option key={writer.id} value={writer.id} disabled={!writer.available}>
                {writer.name} — {writer.writingEstimate.label} {formatScore(writer.writingEstimate.score)}
                {writer.assignmentLabel ? ` — ${writer.assignmentLabel}` : ''}
              </option>
            ))}
          </select>
        </label>
      </div>

      <fieldset className="panel stack">
        <legend>Creative shape</legend>
        <div className="grid grid-3">
          <label className="stack" htmlFor="script-shape-opening">
            <strong>Opening</strong>
            <select
              id="script-shape-opening"
              data-testid="script-shape-opening"
              value={shape.opening}
              onChange={(event) =>
                setShape((current) => ({
                  ...current,
                  opening: event.target.value as FilmShape['opening'],
                }))
              }
            >
              {OPENING_OPTIONS.map((option) => (
                <option key={option} value={option}>{SHAPE_DESCRIPTIONS[option]!.title}</option>
              ))}
            </select>
          </label>
          <label className="stack" htmlFor="script-shape-midpoint">
            <strong>Midpoint</strong>
            <select
              id="script-shape-midpoint"
              data-testid="script-shape-midpoint"
              value={shape.midpoint}
              onChange={(event) =>
                setShape((current) => ({
                  ...current,
                  midpoint: event.target.value as FilmShape['midpoint'],
                }))
              }
            >
              {MIDPOINT_OPTIONS.map((option) => (
                <option key={option} value={option}>{SHAPE_DESCRIPTIONS[option]!.title}</option>
              ))}
            </select>
          </label>
          <label className="stack" htmlFor="script-shape-ending">
            <strong>Ending</strong>
            <select
              id="script-shape-ending"
              data-testid="script-shape-ending"
              value={shape.ending}
              onChange={(event) =>
                setShape((current) => ({
                  ...current,
                  ending: event.target.value as FilmShape['ending'],
                }))
              }
            >
              {ENDING_OPTIONS.map((option) => (
                <option key={option} value={option}>{SHAPE_DESCRIPTIONS[option]!.title}</option>
              ))}
            </select>
          </label>
        </div>
      </fieldset>

      <fieldset className="panel stack">
        <legend>Audience promise</legend>
        <div>
          <strong>Intended audiences</strong>
          <div className="row" style={{ marginTop: 8 }}>
            {SEGMENT_ORDER.map((segment) => (
              <label key={segment}>
                <input
                  type="checkbox"
                  checked={segments.includes(segment)}
                  onChange={() => toggleSegment(segment)}
                  data-testid={`script-segment-${segment}`}
                />{' '}
                {segment === 'youngAdult'
                  ? 'Young adult'
                  : segment.charAt(0).toUpperCase() + segment.slice(1)}
              </label>
            ))}
          </div>
        </div>
        <div className="grid grid-3">
          {(Object.keys(promiseCenters) as PromiseAxis[]).map((axis) => (
            <PromiseCenterControl
              key={axis}
              axis={axis}
              index={promiseCenters[axis]}
              onChange={(index) =>
                setPromiseCenters((current) => ({ ...current, [axis]: index }))
              }
            />
          ))}
        </div>
      </fieldset>

      <div className="inset" data-testid="commission-consequence">
        <strong>What happens next</strong>
        <div>{board.commission.consequence}</div>
        <div className="hint">
          No separate screenplay acquisition fee is charged. The studio still carries payroll and overhead while the week passes.
        </div>
      </div>

      <div className="btn-row">
        <button
          type="button"
          className="primary"
          disabled={!canSubmit}
          onClick={submit}
          data-testid="commission-submit"
        >
          Commission screenplay
        </button>
      </div>
    </section>
  )
}

export function WritersRoom({
  state,
  onChange,
  onOpenPackage,
  onPlanAuditions,
  onBack,
  focusProjectId,
}: {
  state: GameState
  onChange: (next: GameState) => void
  onOpenPackage: (projectId: string) => void
  onPlanAuditions?: ((projectId: string) => void) | undefined
  onBack: () => void
  /** Navigation-only handoff from the Studio Calendar. */
  focusProjectId?: string
}) {
  const board = useMemo(() => scriptProjectsBoard(state), [state])
  const [commissioning, setCommissioning] = useState(false)
  const [error, setError] = useState('')
  const pendingFocusProjectId = useRef<string | null>(null)
  const initialFocusProjectId = useRef<string | null>(focusProjectId ?? null)
  const actionRefs = useRef(new Map<string, HTMLButtonElement>())
  const statusRefs = useRef(new Map<string, HTMLSpanElement>())
  const headingRef = useRef<HTMLHeadingElement | null>(null)

  useEffect(() => {
    const projectId = pendingFocusProjectId.current ?? initialFocusProjectId.current
    if (projectId === null) return
    const cards = SECTION_ORDER.flatMap((section) => board.sections[section.key])
    const card = cards.find((candidate) => candidate.projectId === projectId)
    if (card === undefined) {
      headingRef.current?.focus()
      initialFocusProjectId.current = null
      return
    }
    const target =
      card.legalActions.length > 0
        ? actionRefs.current.get(projectId)
        : statusRefs.current.get(projectId)
    if (target === undefined) return
    target.focus()
    pendingFocusProjectId.current = null
    initialFocusProjectId.current = null
  }, [board])

  function runAction(action: ScriptProjectActionView) {
    setError('')
    if (action.kind === 'openPackage') {
      onOpenPackage(action.projectId)
      return
    }
    if (action.kind === 'planAuditions') {
      onPlanAuditions?.(action.projectId)
      return
    }
    pendingFocusProjectId.current = action.projectId
    const result = runScriptProjectAction(state, action)
    if (!result.ok) {
      pendingFocusProjectId.current = null
      setError(result.error)
      return
    }
    onChange(result.next)
  }

  return (
    <main className="stack" data-testid="writers-room">
      <header className="spread card">
        <div>
          <div className="eyebrow">Development</div>
          <h1 ref={headingRef} tabIndex={-1} data-testid="writers-room-heading">Writers Room</h1>
          <p className="hint">
            Develop authoritative screenplays, review each draft, then carry an accepted script into package assembly.
          </p>
        </div>
        <div className="btn-row">
          <button type="button" onClick={onBack} data-testid="writers-room-back">
            Back to studio
          </button>
          <button
            type="button"
            className="primary"
            disabled={!board.commission.canStart}
            onClick={() => setCommissioning(true)}
            data-testid="commission-open"
          >
            Commission a script
          </button>
        </div>
      </header>

      {board.mode === 'legacy' && (
        <div className="warn" role="status" data-testid="writers-room-legacy">
          This migrated studio still uses its legacy direct-greenlight screenplay path.
        </div>
      )}

      <section className="card stack" aria-labelledby="script-capacity-heading">
        <div className="spread">
          <div>
            <h2 id="script-capacity-heading">Development &amp; Casting capacity</h2>
            <div className="mono" data-testid="script-capacity-summary">
              {board.capacity.occupied} of {board.capacity.capacity} slots occupied · {board.capacity.available} available
            </div>
          </div>
          <span className={`tag ${board.capacity.available > 0 ? 'fact' : 'warning'}`}>
            Exact occupancy
          </span>
        </div>
        <div className="grid grid-2">
          {board.capacity.facilities.map((facility) => (
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

      {!commissioning && (
        <Blockers blockers={board.commission.blockers} testId="writers-room-commission-blockers" />
      )}
      {commissioning && (
        <CommissionPanel
          board={board}
          state={state}
          onChange={onChange}
          onClose={() => setCommissioning(false)}
          onError={setError}
        />
      )}

      {error && (
        <div className="errbox" role="alert" data-testid="writers-room-error">
          {error}
        </div>
      )}

      {SECTION_ORDER.map((section) => {
        const cards = board.sections[section.key]
        return (
          <section className="card stack" key={section.key} aria-labelledby={`script-section-${section.key}`}>
            <div className="spread">
              <h2 id={`script-section-${section.key}`}>{section.title}</h2>
              <span className="badge mono">{cards.length}</span>
            </div>
            {cards.length === 0 ? (
              <div className="empty" data-testid={`script-empty-${section.key}`}>{section.empty}</div>
            ) : (
              <div className="grid grid-2" data-testid={`script-section-${section.key}-cards`}>
                {cards.map((card) => (
                  <article className="panel stack" key={card.projectId} data-testid={`script-card-${card.projectId}`}>
                    <div className="spread">
                      <div>
                        <strong>{card.title}</strong>
                        <div className="hint">
                          {genreLabel(card.genre)} · {card.writer.name}
                        </div>
                      </div>
                      <span
                        className={`tag ${card.status === 'review' ? 'warning' : 'fact'}`}
                        role="status"
                        aria-live="polite"
                        aria-atomic="true"
                        tabIndex={-1}
                        ref={(node) => {
                          if (node) statusRefs.current.set(card.projectId, node)
                          else statusRefs.current.delete(card.projectId)
                        }}
                        data-testid={`script-status-${card.projectId}`}
                      >
                        {card.lifecycleLabel}
                      </span>
                    </div>

                    {card.weeksUntilDecision !== null && (
                      <div className="mono" data-testid={`script-weeks-${card.projectId}`}>
                        {card.weeksUntilDecision} week{card.weeksUntilDecision === 1 ? '' : 's'} until review
                      </div>
                    )}

                    {card.assessment && (
                      <div className="estimate-block stack" data-testid={`script-assessment-${card.projectId}`}>
                        <div>
                          <span className="tag estimate">{card.assessment.label}</span>{' '}
                          <strong>{formatScore(card.assessment.score)} · {card.assessment.band}</strong>
                        </div>
                        {card.assessment.strengths.map((strength) => (
                          <div key={strength}>Strength: {strength}</div>
                        ))}
                        {card.assessment.concerns.map((concern) => (
                          <div className="hint" key={concern}>Concern: {concern}</div>
                        ))}
                      </div>
                    )}

                    <p className="hint">{card.consequence}</p>
                    <Blockers blockers={card.blockers} testId={`script-blockers-${card.projectId}`} />

                    {card.legalActions.length > 0 && (
                      <div className="btn-row">
                        {card.legalActions.map((action, actionIndex) => (
                          <button
                            type="button"
                            className={action.kind === 'acceptScript' || action.kind === 'openPackage' ? 'primary' : ''}
                            key={action.kind}
                            ref={(node) => {
                              const packageIndex = card.legalActions.findIndex(
                                (candidate) => candidate.kind === 'openPackage',
                              )
                              if (actionIndex !== (packageIndex >= 0 ? packageIndex : 0)) return
                              if (node) actionRefs.current.set(card.projectId, node)
                              else actionRefs.current.delete(card.projectId)
                            }}
                            onClick={() => runAction(action)}
                            data-testid={`script-action-${action.kind}-${card.projectId}`}
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        )
      })}
    </main>
  )
}
