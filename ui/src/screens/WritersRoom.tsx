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
  developmentOfficeUplift,
} from '../engine/adapter.ts'
import type {
  ActionOutcome,
  CommissionScriptPayload,
  FilmPromise,
  FilmShape,
  GameState,
  Genre,
  ScriptProjectActionView,
  ScriptProjectsReadModel,
  SegmentId,
} from '../engine/adapter.ts'
import {
  SCREENPLAY_GENRES,
  SCREENPLAY_TITLE_MAX_LENGTH,
  commissionOriginalScreenplayAction,
  deliveredScreenplaySentence,
  originalCommissionOpen,
  originalDraftEstimate,
  assignScreenplayWriterAction,
  renameScreenplayAction,
  screenplayIdentitiesByProject,
  writerPool,
  writingScreenplaySentence,
} from '../engine/screenplay.ts'
import type {
  CommissionOriginalScreenplayPayload,
  OriginalDraftEstimateView,
  ScreenplayIdentityView,
  WriterPoolView,
} from '../engine/screenplay.ts'
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

/**
 * C2a-M3 — WHO WROTE IT, WHAT THEY FIRST CALLED IT, AND THE RENAME.
 *
 * THE TITLE MOMENT. The studio's own writers name the picture at the moment the
 * commission commits; the board says so while they are working on it and again
 * when they deliver it. The credit line is the engine's
 * (`originalScreenplayCredit`), and the delivery sentence is the one the §12-M3
 * legibility gate asks for.
 *
 * THE RENAME IS WITHOUT CEREMONY. One field, one confirmation, no dialog. It
 * writes `FilmConcept.title` — the single stored display authority twenty-one
 * live surfaces resolve — so a retitled picture is retitled everywhere at once.
 *
 * WHAT THE WRITERS CALLED IT SURVIVES IT. The working title is shown beside the
 * new one after a rename, because it is the record: two frozen-history surfaces
 * (a talent's career credits, a press clipping) keep it forever BY DESIGN, and a
 * board that hid it would make those two look like bugs.
 *
 * THE ENGINE HOLDS THE ONLY GATE. `renameRefusal` is the engine's own sentence;
 * this control is offered only when it is null, and the action is still refused by
 * the engine if it is not. A market premise keeps the name it came with (V1 scope
 * — charter §3.5), and that refusal is the engine's, not this file's.
 */
function ScreenplayProvenance({
  identity,
  projectId,
  status,
  onRename,
}: {
  identity: ScreenplayIdentityView
  projectId: string
  status: ScriptProjectStatusLike
  onRename: ((title: string) => ActionOutcome) | null
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(identity.title)
  const [refusal, setRefusal] = useState('')
  const renameable = onRename !== null && identity.renameRefusal === null

  function open() {
    setDraft(identity.title)
    setRefusal('')
    setEditing(true)
  }

  function save() {
    if (onRename === null) return
    const result = onRename(draft)
    if (!result.ok) {
      setRefusal(result.error)
      return
    }
    setRefusal('')
    setEditing(false)
  }

  return (
    <div className="stack" data-testid={`script-provenance-${projectId}`}>
      <span className="hint" data-testid={`script-provenance-label-${projectId}`}>
        {identity.provenance.label}
      </span>

      {/* THE TITLE MOMENT, and only while it IS one. A screenplay in production or
          already released is not being handed over — the credit above says who
          wrote it, and claiming a delivery that happened months ago would be a
          sentence the studio's own calendar contradicts. */}
      {identity.provenance.origin === 'original' &&
        identity.provenance.writerName !== null &&
        status !== 'inProduction' &&
        status !== 'produced' && (
        <span data-testid={`script-title-moment-${projectId}`}>
          {status === 'drafting' || status === 'rewriting'
            ? writingScreenplaySentence(identity.provenance.writerName, identity.title)
            : deliveredScreenplaySentence(identity.provenance.writerName, identity.title)}
        </span>
      )}

      {identity.provenance.renamed && identity.provenance.generatedTitle !== null && (
        <span className="hint" data-testid={`script-working-title-${projectId}`}>
          Written as ‘{identity.provenance.generatedTitle}’.
        </span>
      )}

      {renameable && !editing && (
        <div className="btn-row">
          <button
            type="button"
            onClick={open}
            data-testid={`script-rename-open-${projectId}`}
          >
            Retitle this picture
          </button>
        </div>
      )}

      {renameable && editing && (
        <div className="stack">
          <label className="stack" htmlFor={`script-rename-input-${projectId}`}>
            <strong>New title</strong>
            <input
              id={`script-rename-input-${projectId}`}
              data-testid={`script-rename-input-${projectId}`}
              value={draft}
              maxLength={SCREENPLAY_TITLE_MAX_LENGTH}
              onChange={(event) => setDraft(event.target.value)}
            />
          </label>
          <div className="btn-row">
            <button
              type="button"
              className="primary"
              onClick={save}
              data-testid={`script-rename-save-${projectId}`}
            >
              Retitle it
            </button>
            <button
              type="button"
              onClick={() => { setEditing(false); setRefusal('') }}
              data-testid={`script-rename-cancel-${projectId}`}
            >
              Keep the current title
            </button>
          </div>
          {refusal && (
            <div className="errbox" role="alert" data-testid={`script-rename-error-${projectId}`}>
              {refusal}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/** The lifecycle statuses this file distinguishes; the board publishes the value. */
type ScriptProjectStatusLike = ScriptProjectsReadModel['sections']['inDevelopment'][number]['status']

/**
 * C2a-M3 — MORE HANDS ON THE SAME SCRIPT (`00E`.9).
 *
 * *"To speed the writing of scripts, put multiple writers on the project."*
 * [CORPUS Prima, developer-reviewed.] It buys TIME and nothing else — the ruling
 * is explicit that writer experience has no bearing on a script's quality — so
 * this control states exactly one consequence: the week the draft would land.
 *
 * THE LIST IS THE ENGINE'S. Every name offered is a writer the engine would
 * actually accept, and the week beside it is the week that successor carries. A
 * writer who would be refused is absent rather than offered and then rejected.
 * The candidates are computed only when the player opens the control.
 */
function ScreenplayWriterPool({
  projectId,
  poolFor,
  onAssign,
}: {
  projectId: string
  poolFor: () => WriterPoolView | null
  onAssign: (writerId: string) => ActionOutcome
}) {
  const [open, setOpen] = useState(false)
  const [refusal, setRefusal] = useState('')
  const pool = open ? poolFor() : null

  return (
    <div className="stack" data-testid={`script-pool-${projectId}`}>
      {!open && (
        <div className="btn-row">
          <button
            type="button"
            onClick={() => { setRefusal(''); setOpen(true) }}
            data-testid={`script-pool-open-${projectId}`}
          >
            Put another writer on it
          </button>
        </div>
      )}

      {open && pool !== null && (
        <div className="inset stack">
          <span data-testid={`script-pool-on-it-${projectId}`}>
            On the script: {pool.onIt.map((person) => person.name).join(', ')} ·{' '}
            {pool.onIt.length} of {pool.maxWriters}
          </span>
          {pool.candidates.length === 0 ? (
            <span className="hint" data-testid={`script-pool-empty-${projectId}`}>
              No other contracted writer is free to join this script.
            </span>
          ) : (
            <div className="btn-row" style={{ flexWrap: 'wrap' }}>
              {pool.candidates.map((candidate) => (
                <button
                  type="button"
                  key={candidate.id}
                  onClick={() => {
                    const result = onAssign(candidate.id)
                    if (!result.ok) {
                      setRefusal(result.error)
                      return
                    }
                    setRefusal('')
                    setOpen(false)
                  }}
                  data-testid={`script-pool-add-${projectId}-${candidate.id}`}
                >
                  {candidate.name} — delivers week {candidate.dueWeek}
                  {candidate.weeksSaved > 0
                    ? ` (${candidate.weeksSaved} ${candidate.weeksSaved === 1 ? 'week' : 'weeks'} sooner)`
                    : ' (no sooner)'}
                </button>
              ))}
            </div>
          )}
          <div className="btn-row">
            <button
              type="button"
              onClick={() => { setOpen(false); setRefusal('') }}
              data-testid={`script-pool-close-${projectId}`}
            >
              Leave the script as it is
            </button>
          </div>
          {refusal && (
            <div className="errbox" role="alert" data-testid={`script-pool-error-${projectId}`}>
              {refusal}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * C2a-M3 — THE SECOND WAY TO START A PICTURE (charter §3.5).
 *
 * The market path is unchanged: pick a premise the world is selling and adapt it.
 * The original path buys nothing from anybody — the player names a genre and a
 * creative direction, a contracted writer goes to work, and the studio owns a
 * premise that did not exist that morning. Everything in this object is supplied
 * by the host from the accepted state, because the form itself may not reach into
 * the engine; when it is absent the form is exactly the C1 form.
 */
export type OriginalCommissionSurface = {
  /** Whether the original path is open — the engine's blockers, market arm scoped out. */
  open: boolean
  /** The engine's own clock for this writer and this creative direction. */
  estimateFor: (input: { writerId: string; genre: Genre }) => OriginalDraftEstimateView
  submit: (payload: CommissionOriginalScreenplayPayload) => ActionOutcome
}

/** Which supply the player is commissioning from. */
export type CommissionSource = 'market' | 'original'

export function ScreenplayCommissionForm({
  board,
  onSubmit,
  onClose,
  onError,
  officeUplift = null,
  original = null,
  initialSource,
}: {
  board: ScriptProjectsReadModel
  onSubmit: (payload: CommissionScriptPayload) => ActionOutcome
  onClose: () => void
  onError: (message: string) => void
  /**
   * C2a-M3: the original-screenplay path, or null on a surface that has not been
   * given it. Absent means the form behaves exactly as C1 shipped it.
   */
  original?: OriginalCommissionSurface | null
  /** Which supply the form opens on. Defaults to whichever one is actually available. */
  initialSource?: CommissionSource
  /**
   * C1-M5: what the studio's development offices will add to this draft, or null.
   *
   * The "Est." beside each writer is the WRITER's own estimate; the office uplift is
   * applied at DRAFT time, so without this line a player who has just paid $600,000
   * for Development Office II reads a form where nothing whatsoever changed. The
   * numbers come from the engine's effects authority — this form states them and
   * computes nothing.
   */
  officeUplift?: { name: string; points: number } | null
}) {
  const firstConcept = board.commission.concepts[0]
  // The default writer is the best AVAILABLE person whose profession is actually Writer.
  //
  // The engine publishes this list best-writing-estimate-first, and every entry is merely
  // "contracted and able to write" — on a thin founding roster the top estimate can belong
  // to a director or a craft lead, and committing them to a screenplay strips the role the
  // package will need. Preferring a primary-role Writer never reaches past a better
  // writer (the list is already sorted, so the FIRST primary-role Writer is the best one),
  // and when the studio has none the previous best-estimate-first default stands unchanged
  // — that is a real staffing situation, not a case for an empty form.
  const availableWriters = board.commission.writers.filter((writer) => writer.available)
  const firstWriter =
    availableWriters.find((writer) => writer.primaryRole === 'writer') ?? availableWriters[0]
  const originalOpen = original !== null && original.open
  const [conceptId, setConceptId] = useState(firstConcept?.id ?? '')
  const [writerId, setWriterId] = useState(firstWriter?.id ?? '')
  const [shape, setShape] = useState<FilmShape>(DEFAULT_SHAPE)
  const [segments, setSegments] = useState<SegmentId[]>(['adult'])
  const [promiseCenters, setPromiseCenters] = useState<Record<PromiseAxis, number>>({
    intimacy: 1,
    tonalWeight: 1,
    kineticEnergy: 1,
  })
  // The form opens on whichever supply the studio actually has. A studio that has
  // bought the market out opens on its own writers rather than on an empty list —
  // that is the whole inversion of C1's terminal exhaustion blocker (§3.5).
  const [source, setSource] = useState<CommissionSource>(
    initialSource ??
      (board.commission.concepts.length === 0 && originalOpen ? 'original' : 'market'),
  )
  const [direction, setDirection] = useState<Genre>(
    firstConcept?.genre ?? SCREENPLAY_GENRES[0]!,
  )

  const commissioningOriginal = source === 'original' && originalOpen
  const concept = board.commission.concepts.find((candidate) => candidate.id === conceptId)
  const writerAvailable = board.commission.writers.some(
    (writer) => writer.id === writerId && writer.available,
  )
  const estimate = commissioningOriginal
    ? original.estimateFor({ writerId, genre: direction })
    : null
  const canSubmit = commissioningOriginal
    ? originalOpen && writerAvailable && segments.length > 0
    : board.commission.canSubmitMarketIntent &&
      concept !== undefined &&
      writerAvailable &&
      segments.length > 0

  // The market-exhaustion blocker is about the MARKET. On the original path it is
  // not a blocker at all — it is the reason the player is on this path — so the
  // form stops printing it as one rather than contradicting its own remedy.
  const visibleBlockers = commissioningOriginal
    ? board.commission.blockers.filter((blocker) => blocker.kind !== 'no-concepts')
    : board.commission.blockers

  function toggleSegment(segment: SegmentId) {
    setSegments((current) =>
      current.includes(segment)
        ? current.filter((candidate) => candidate !== segment)
        : [...current, segment],
    )
  }

  function promiseRanges(): FilmPromise['ranges'] {
    const width = PROMISE_WIDTHS[1]
    const ranges = {} as FilmPromise['ranges']
    for (const axis of Object.keys(promiseCenters) as PromiseAxis[]) {
      ranges[axis] = rangeFrom(PROMISE_CENTERS[promiseCenters[axis]]!, width)
    }
    return ranges
  }

  function submit() {
    if (!canSubmit) return
    if (commissioningOriginal) {
      const payload: CommissionOriginalScreenplayPayload = {
        writerId,
        genre: direction,
        shape,
        promise: {
          genre: direction,
          intendedSegments: segments,
          ranges: promiseRanges(),
        },
      }
      const result = original.submit(payload)
      if (!result.ok) {
        onError(result.error)
        return
      }
      onError('')
      onClose()
      return
    }
    if (concept === undefined) return
    const payload: CommissionScriptPayload = {
      conceptId: concept.id,
      writerId,
      shape,
      promise: {
        genre: concept.genre,
        intendedSegments: segments,
        ranges: promiseRanges(),
      },
    }
    const result = onSubmit(payload)
    if (!result.ok) {
      onError(result.error)
      return
    }
    onError('')
    onClose()
  }

  return (
    <section className="card stack" aria-labelledby="commission-script-heading" data-testid="commission-panel">
      <div className="spread">
        <div>
          <h2 id="commission-script-heading">Commission a screenplay</h2>
          <p className="hint" data-testid="commission-lede">
            {commissioningOriginal
              ? 'Name the picture’s genre and its creative shape, then put a contracted writer on it. The premise, the title and the story beats will be theirs.'
              : 'Lock the concept, creative shape, audience promise, and contracted writer before work begins.'}
          </p>
        </div>
        <button type="button" onClick={onClose} data-testid="commission-close">
          Close
        </button>
      </div>

      {originalOpen && (
        <fieldset className="panel stack" data-testid="commission-source">
          <legend>Where the screenplay comes from</legend>
          <div className="row">
            <label>
              <input
                type="radio"
                name="commission-source"
                checked={source === 'market'}
                disabled={board.commission.concepts.length === 0}
                onChange={() => setSource('market')}
                data-testid="script-source-market"
              />{' '}
              Adapt a premise from the market
            </label>
            <label>
              <input
                type="radio"
                name="commission-source"
                checked={commissioningOriginal}
                onChange={() => setSource('original')}
                data-testid="script-source-original"
              />{' '}
              Commission an original screenplay
            </label>
          </div>
          <p className="hint" data-testid="commission-source-note">
            {commissioningOriginal
              ? 'Your own writer invents the premise. Nothing is bought, and the studio owns it outright.'
              : `${String(board.commission.concepts.length)} unclaimed ${
                  board.commission.concepts.length === 1 ? 'premise is' : 'premises are'
                } still on the market.`}
          </p>
        </fieldset>
      )}

      <Blockers blockers={visibleBlockers} testId="commission-blockers" />

      {officeUplift !== null && officeUplift.points > 0 && (
        <p className="hint" data-testid="commission-office-uplift">
          {officeUplift.name} will add {officeUplift.points} points of estimated strength
          to this draft.
        </p>
      )}

      <div className="grid grid-2">
        {commissioningOriginal ? (
          <label className="stack" htmlFor="script-direction">
            <strong>Creative direction</strong>
            <select
              id="script-direction"
              data-testid="script-direction"
              value={direction}
              onChange={(event) => setDirection(event.target.value as Genre)}
            >
              {SCREENPLAY_GENRES.map((candidate) => (
                <option key={candidate} value={candidate}>
                  {genreLabel(candidate)}
                </option>
              ))}
            </select>
          </label>
        ) : (
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
        )}

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
        <div>
          {board.commission.willQueueIntent
            ? 'The request joins the Development & Casting queue. No writer, screenplay identity, cost, or room is committed until it reaches the front and is revalidated.'
            : estimate === null
              ? board.commission.consequence
              : estimate.consequence}
        </div>
        {estimate !== null && (
          <>
            {/* C2a-M3 / `00E`.9 — WRITER SPEED, IN THE FORM, BEFORE THE COMMITMENT.
                Every figure is `scriptDraftWeeks` asked about this studio and this
                writer; the second sentence names the two levers the ruled law
                actually has and no others. */}
            <div data-testid="commission-writing-weeks">
              An original at this office: about {estimate.weeks}{' '}
              {estimate.weeks === 1 ? 'week' : 'weeks'} of writing.
            </div>
            {estimate.richnessWeeks > 0 && (
              <div className="hint" data-testid="commission-richness-note">
                Your development offices write a richer script, which adds{' '}
                {estimate.richnessWeeks}{' '}
                {estimate.richnessWeeks === 1 ? 'week' : 'weeks'} to it.
              </div>
            )}
            <div className="hint" data-testid="commission-pace-note">
              {estimate.pace}
            </div>
          </>
        )}
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
          {board.commission.willQueueIntent
            ? commissioningOriginal
              ? 'Queue original screenplay commission'
              : 'Queue screenplay commission'
            : commissioningOriginal
              ? 'Commission an original screenplay'
              : 'Commission screenplay'}
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
  const [commissionSource, setCommissionSource] = useState<CommissionSource | undefined>(undefined)
  const [error, setError] = useState('')
  const [announcement, setAnnouncement] = useState('')
  // C2a-M3 — the door opens for EITHER supply. `canStart` alone shut the Writers
  // Room the moment the market ran dry, which is precisely when the studio's own
  // writers become the way through (§3.5).
  const originalOpen = originalCommissionOpen(board)
  const commissioningOpen =
    board.commission.canSubmitMarketIntent || originalOpen
  // C2a-M3 — provenance is resolved once for the whole board, from the blueprint
  // root and the talent census. It is never stored on the shared-world premise
  // (guardrail 8): who wrote a screenplay is a studio-relative fact.
  const identities = useMemo(() => screenplayIdentitiesByProject(state), [state])
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
            disabled={!commissioningOpen}
            onClick={() => {
              setCommissionSource(undefined)
              setCommissioning(true)
            }}
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

      {announcement && (
        <div
          className="notice"
          role="status"
          aria-live="polite"
          aria-atomic="true"
          data-testid="writers-room-commission-receipt"
        >
          {announcement}
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
        <>
          <Blockers blockers={board.commission.blockers} testId="writers-room-commission-blockers" />
          {/* C2a-M3 — the remedy is a BUTTON. C1's exhaustion blocker said "continue
              with an existing project", which named no action; its successor names
              one that exists, and here it is, beside the sentence that offers it. */}
          {originalOpen && board.commission.concepts.length === 0 && (
            <div className="btn-row" data-testid="writers-room-exhaustion-remedy">
              <button
                type="button"
                className="primary"
                onClick={() => {
                  setCommissionSource('original')
                  setCommissioning(true)
                }}
                data-testid="writers-room-commission-original"
              >
                Commission an original screenplay
              </button>
            </div>
          )}
        </>
      )}
      {commissioning && (
        <ScreenplayCommissionForm
          board={board}
          officeUplift={developmentOfficeUplift(state)}
          original={{
            open: originalOpen,
            estimateFor: (input) => originalDraftEstimate(state, input),
            submit: (payload) => {
              const result = commissionOriginalScreenplayAction(state, payload)
              if (result.ok) {
                const beforeOrdinals = new Set(
                  state.productionQueue.map((entry) => entry.ordinal),
                )
                const added = result.next.productionQueue.filter(
                  (entry) => !beforeOrdinals.has(entry.ordinal),
                )
                setAnnouncement(
                  added.length === 1 &&
                    added[0]?.kind === 'commissionOriginalScreenplay' &&
                    added[0].payload.writerId === payload.writerId
                    ? 'Original screenplay commission joined the Development & Casting queue. No writer, premise, project identity, or cost is committed until it starts.'
                    : '',
                )
                onChange(result.next)
              }
              return result
            },
          }}
          {...(commissionSource ? { initialSource: commissionSource } : {})}
          onSubmit={(payload) => {
            const result = commissionScriptAction(state, payload)
            if (result.ok) {
              const beforeOrdinals = new Set(
                state.productionQueue.map((entry) => entry.ordinal),
              )
              const added = result.next.productionQueue.filter(
                (entry) => !beforeOrdinals.has(entry.ordinal),
              )
              setAnnouncement(
                added.length === 1 &&
                  added[0]?.kind === 'commissionScript' &&
                  added[0].payload.conceptId === payload.conceptId
                  ? 'Screenplay commission joined the Development & Casting queue. No writer, project identity, or cost is committed until it starts.'
                  : '',
              )
              onChange(result.next)
            }
            return result
          }}
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

                    {(() => {
                      const identity = identities.get(card.projectId)
                      if (identity === undefined) return null
                      return (
                        <ScreenplayProvenance
                          identity={identity}
                          projectId={card.projectId}
                          status={card.status}
                          onRename={(title) => {
                            const result = renameScreenplayAction(state, identity.conceptId, title)
                            if (result.ok) onChange(result.next)
                            return result
                          }}
                        />
                      )
                    })()}

                    {card.weeksUntilDecision !== null && (
                      <div className="mono" data-testid={`script-weeks-${card.projectId}`}>
                        {card.weeksUntilDecision} week{card.weeksUntilDecision === 1 ? '' : 's'} until review
                      </div>
                    )}

                    {card.status === 'drafting' && (
                      <ScreenplayWriterPool
                        projectId={card.projectId}
                        poolFor={() => writerPool(state, card.projectId)}
                        onAssign={(writerId) => {
                          const result = assignScreenplayWriterAction(state, card.projectId, writerId)
                          if (result.ok) onChange(result.next)
                          return result
                        }}
                      />
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
