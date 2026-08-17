import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type SyntheticEvent,
} from 'react'
import {
  sameLotScriptReviewAction,
  sameLotScriptReviewContext,
} from './snapshot/scriptReview.ts'
import type {
  LotScriptReviewAction,
  LotScriptReviewContext,
} from './snapshot/scriptReview.ts'

export type LotScriptReviewPanelFeedback =
  | { kind: 'success'; message: string }
  | { kind: 'error'; message: string }

export type LotScriptReviewPanelProps = {
  /** Exact rendered GameState identity; no physical gesture may cross its replacement. */
  inputBoundary: object
  context: LotScriptReviewContext
  /** Forwards the exact selector-owned action. The App remains the dispatch authority. */
  onAction: (action: LotScriptReviewAction) => void
  /** Supporting deep route, intentionally ordered after every world action. */
  onOpenDetails?: (() => void) | undefined
  /** The enclosing exact event rail already owns title/project identity and focus. */
  identityOwnedExternally?: boolean
  /** App-owned suspension/staleness state; all panel controls become natively inert. */
  disabled?: boolean
  /** Exact successor or rejection copy validated by the App. */
  feedback?: LotScriptReviewPanelFeedback | null
}

const ROLE_LABEL: Record<
  LotScriptReviewContext['writer']['primaryRole'],
  string
> = {
  writer: 'Writer',
  director: 'Director',
  actor: 'Actor',
  craft: 'Craft',
}

function formatScore(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

type ReviewIntent =
  | { kind: 'action'; action: LotScriptReviewAction }
  | { kind: 'deep' }

type CapturedReviewIntent = {
  intent: ReviewIntent
  owner: HTMLButtonElement
}

function copyIntent(intent: ReviewIntent): ReviewIntent {
  return intent.kind === 'deep'
    ? { kind: 'deep' }
    : { kind: 'action', action: { ...intent.action } }
}

function sameIntent(left: ReviewIntent, right: ReviewIntent): boolean {
  if (left.kind !== right.kind) return false
  return left.kind === 'deep' || (
    right.kind === 'action' &&
    sameLotScriptReviewAction(left.action, right.action)
  )
}

/**
 * A bounded, player-safe screenplay decision inside the live Studio Lot.
 * Authority checks, successor validation, autosave, and hard cross-event
 * deduplication deliberately remain with the App host.
 */
export const LotScriptReviewPanel = forwardRef<
  HTMLHeadingElement,
  LotScriptReviewPanelProps
>(function LotScriptReviewPanel(
  {
    inputBoundary,
    context,
    onAction,
    onOpenDetails,
    identityOwnedExternally = false,
    disabled = false,
    feedback = null,
  },
  headingRef,
) {
  const headingId = useId()
  const assessmentHeadingId = useId()
  const blockersHeadingId = useId()
  const capturedIntentRef = useRef<CapturedReviewIntent | null>(null)
  const heldKeyRef = useRef<{
    key: 'Enter' | ' '
    capture: CapturedReviewIntent
  } | null>(null)
  const claimedRef = useRef(false)
  const claimedEpochRef = useRef(0)
  const virtualTailSealedRef = useRef(false)
  const virtualTailTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const physicalPrimaryRequiredRef = useRef(false)
  const disabledRef = useRef(disabled)
  disabledRef.current = disabled
  const previousBoundaryRef = useRef({ inputBoundary, context, disabled })

  const sealVirtualTail = useCallback(() => {
    virtualTailSealedRef.current = true
    if (virtualTailTimerRef.current !== null) clearTimeout(virtualTailTimerRef.current)
    virtualTailTimerRef.current = setTimeout(() => {
      virtualTailSealedRef.current = false
      virtualTailTimerRef.current = null
    }, 0)
  }, [])

  const clearInput = useCallback((seal: boolean) => {
    capturedIntentRef.current = null
    heldKeyRef.current = null
    claimedEpochRef.current += 1
    claimedRef.current = false
    if (seal) sealVirtualTail()
  }, [sealVirtualTail])

  const claimTurn = useCallback((): boolean => {
    if (claimedRef.current) return false
    claimedRef.current = true
    const epoch = ++claimedEpochRef.current
    queueMicrotask(() => {
      if (claimedEpochRef.current === epoch) claimedRef.current = false
    })
    return true
  }, [])

  useLayoutEffect(() => {
    const previous = previousBoundaryRef.current
    previousBoundaryRef.current = { inputBoundary, context, disabled }
    if (
      previous.inputBoundary === inputBoundary &&
      previous.disabled === disabled &&
      sameLotScriptReviewContext(previous.context, context)
    ) return
    physicalPrimaryRequiredRef.current = true
    clearInput(true)
  }, [clearInput, context, disabled, inputBoundary])

  useEffect(() => {
    const onVisibility = () => {
      if (!document.hidden) return
      physicalPrimaryRequiredRef.current = true
      clearInput(true)
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [clearInput])

  useEffect(() => () => {
    capturedIntentRef.current = null
    heldKeyRef.current = null
    claimedEpochRef.current += 1
    claimedRef.current = false
    if (virtualTailTimerRef.current !== null) clearTimeout(virtualTailTimerRef.current)
  }, [])

  const captureStart = (
    event: SyntheticEvent<HTMLButtonElement>,
    intent: ReviewIntent,
    family: 'pointer' | 'mouse' | 'touch',
  ) => {
    event.stopPropagation()
    if (
      disabledRef.current ||
      document.hidden ||
      claimedRef.current ||
      capturedIntentRef.current !== null ||
      heldKeyRef.current !== null ||
      (physicalPrimaryRequiredRef.current && family !== 'pointer')
    ) return
    if (family === 'pointer') physicalPrimaryRequiredRef.current = false
    virtualTailSealedRef.current = false
    capturedIntentRef.current = {
      intent: copyIntent(intent),
      owner: event.currentTarget,
    }
  }

  const cancelStart = (event: SyntheticEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    const captured = capturedIntentRef.current
    if (captured === null || captured.owner !== event.currentTarget) return
    physicalPrimaryRequiredRef.current = true
    clearInput(true)
  }

  const captureKey = (
    event: ReactKeyboardEvent<HTMLButtonElement>,
    intent: ReviewIntent,
  ) => {
    event.stopPropagation()
    if (event.key !== 'Enter' && event.key !== ' ') return
    if (
      disabledRef.current ||
      document.hidden ||
      event.repeat ||
      claimedRef.current ||
      capturedIntentRef.current !== null ||
      heldKeyRef.current !== null
    ) {
      event.preventDefault()
      return
    }
    const captured = {
      intent: copyIntent(intent),
      owner: event.currentTarget,
    }
    heldKeyRef.current = { key: event.key, capture: captured }
    capturedIntentRef.current = captured
    virtualTailSealedRef.current = false
  }

  const releaseKey = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    const held = heldKeyRef.current
    if (held === null || held.key !== event.key) return
    setTimeout(() => {
      if (heldKeyRef.current === held) heldKeyRef.current = null
      if (capturedIntentRef.current === held.capture) capturedIntentRef.current = null
      sealVirtualTail()
    }, 0)
  }

  const dispatchIntent = (
    event: ReactMouseEvent<HTMLButtonElement>,
    intent: ReviewIntent,
  ) => {
    event.stopPropagation()
    if (disabledRef.current || document.hidden) {
      physicalPrimaryRequiredRef.current = true
      clearInput(true)
      return
    }
    if (event.detail > 1 || claimedRef.current) {
      clearInput(true)
      return
    }

    const captured = capturedIntentRef.current
    capturedIntentRef.current = null
    if (captured !== null) {
      if (
        captured.owner !== event.currentTarget ||
        !sameIntent(captured.intent, intent)
      ) {
        clearInput(true)
        return
      }
    } else if (
      event.detail !== 0 ||
      heldKeyRef.current !== null ||
      virtualTailSealedRef.current
    ) return

    if (!claimTurn()) return
    if (intent.kind === 'action') onAction(intent.action)
    else onOpenDetails?.()
  }

  const boundaryFor = (intent: ReviewIntent) => ({
    onPointerDown: (event: SyntheticEvent<HTMLButtonElement>) =>
      captureStart(event, intent, 'pointer'),
    onMouseDown: (event: SyntheticEvent<HTMLButtonElement>) =>
      captureStart(event, intent, 'mouse'),
    onTouchStart: (event: SyntheticEvent<HTMLButtonElement>) =>
      captureStart(event, intent, 'touch'),
    onPointerCancel: cancelStart,
    onTouchCancel: cancelStart,
    onKeyDown: (event: ReactKeyboardEvent<HTMLButtonElement>) => captureKey(event, intent),
    onKeyUp: releaseKey,
    onBlur: cancelStart,
    onClick: (event: ReactMouseEvent<HTMLButtonElement>) => dispatchIntent(event, intent),
  })

  return (
    <section
      className="card stack lot-script-review-panel"
      aria-labelledby={identityOwnedExternally ? undefined : headingId}
      aria-label={identityOwnedExternally ? `Screenplay review · ${context.title}` : undefined}
      data-testid="lot-script-review-panel"
      data-project-id={context.projectId}
      data-review-state={context.reviewState}
    >
      {!identityOwnedExternally && (
        <header className="lot-next-event-identity">
          <span className="lot-next-event-kicker">Screenplay review</span>
          <h3 id={headingId} ref={headingRef} tabIndex={-1} data-testid="lot-script-review-heading">
            {context.title}
          </h3>
          {/* The subtitle names the picture in the studio's own terms. The project id
              stays on `data-project-id` above, where tests and provenance need it and no
              player ever reads it (cold-playtest defect: "Project script-0000"). */}
          <span data-testid="lot-script-review-project-id">
            {context.reviewState === 'first-draft' ? 'First draft' : 'Final draft'}
            {' · '}
            {ROLE_LABEL[context.writer.primaryRole]} {context.writer.name}
          </span>
        </header>
      )}

      <div className="lot-script-review-evidence stack">
        <dl className="lot-next-event-facts" aria-label="Screenplay review identity">
          <div>
            <dt>Writer</dt>
            <dd data-testid="lot-script-review-writer">{context.writer.name}</dd>
          </div>
          <div>
            <dt>Creative role</dt>
            <dd data-testid="lot-script-review-writer-role">
              {ROLE_LABEL[context.writer.primaryRole]}
            </dd>
          </div>
          <div>
            <dt>Review</dt>
            <dd data-testid="lot-script-review-state">
              {context.reviewState === 'first-draft' ? 'First draft' : 'Final draft'}
            </dd>
          </div>
        </dl>

      <section
        className="estimate-block stack"
        aria-labelledby={assessmentHeadingId}
        data-testid="lot-script-review-assessment"
      >
        <h4 id={assessmentHeadingId}>Screenplay assessment</h4>
        <div data-testid="lot-script-review-estimate">
          <span className="tag estimate">{context.assessment.label}</span>{' '}
          <strong>
            <data value={String(context.assessment.score)}>
              {formatScore(context.assessment.score)}
            </data>{' '}
            · {context.assessment.band}
          </strong>
        </div>

        {context.assessment.strengths.length > 0 && (
          <div data-testid="lot-script-review-strengths">
            <strong>Strengths</strong>
            <ul>
              {context.assessment.strengths.map((strength, index) => (
                <li key={`${index}:${strength}`}>{strength}</li>
              ))}
            </ul>
          </div>
        )}

        {context.assessment.concerns.length > 0 && (
          <div className="hint" data-testid="lot-script-review-concerns">
            <strong>Concerns</strong>
            <ul>
              {context.assessment.concerns.map((concern, index) => (
                <li key={`${index}:${concern}`}>{concern}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <div className="inset" data-testid="lot-script-review-consequence">
        <strong>What happens next</strong>
        <div>{context.consequence}</div>
      </div>

        {context.blockers.length > 0 && (
          <section aria-labelledby={blockersHeadingId} data-testid="lot-script-review-blockers">
            <h4 id={blockersHeadingId}>Current blockers</h4>
            <div className="stack">
              {context.blockers.map((blocker, index) => (
                <div
                  className="warn"
                  key={`${index}:${blocker.kind}:${blocker.headline}`}
                  data-testid="lot-script-review-blocker"
                >
                  <strong>{blocker.headline}</strong>
                  <div>{blocker.detail}</div>
                  <div className="hint">Remedy: {blocker.remedy}</div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <div
        className="lot-next-event-actions"
        role="group"
        aria-label="Screenplay review actions"
      >
        {context.legalActions.map((action) => (
          <button
            type="button"
            className={`lot-next-event-action${action.kind === 'acceptScript' ? ' primary' : ''}`}
            key={action.kind}
            disabled={disabled}
            {...boundaryFor({ kind: 'action', action })}
            data-testid={`lot-script-review-action-${action.kind}-${context.projectId}`}
          >
            {action.label}
          </button>
        ))}

        {onOpenDetails !== undefined && (
          <button
            type="button"
            className="lot-next-event-action ghost"
            disabled={disabled}
            {...boundaryFor({ kind: 'deep' })}
            data-testid="lot-script-review-open-details"
          >
            Open Writers’ Room details
          </button>
        )}
      </div>

      {feedback !== null && (
        <div
          className={feedback.kind === 'error' ? 'errbox' : 'result-block'}
          role={feedback.kind === 'error' ? 'alert' : undefined}
          aria-atomic={feedback.kind === 'error' ? 'true' : undefined}
          data-testid="lot-script-review-feedback"
          data-feedback-kind={feedback.kind}
        >
          {feedback.message}
        </div>
      )}
    </section>
  )
})
