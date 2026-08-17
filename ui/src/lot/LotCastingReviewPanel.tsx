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
  sameLotCastingReviewAction,
  sameLotCastingReviewContext,
} from './snapshot/castingReview.ts'
import type {
  LotCastingReviewAction,
  LotCastingReviewContext,
  LotCastingReviewRole,
} from './snapshot/castingReview.ts'
import { genreLabel } from '../content.ts'

export type LotCastingReviewPanelFeedback =
  | { kind: 'success'; message: string }
  | { kind: 'error'; message: string }

export type LotCastingReviewPanelProps = {
  /** Exact rendered GameState identity; no physical gesture may cross its replacement. */
  inputBoundary: object
  context: LotCastingReviewContext
  /** Forwards the exact selector-owned action. The App remains the dispatch authority. */
  onAction: (action: LotCastingReviewAction) => void
  /** Supporting deep route, intentionally ordered after the world action. */
  onOpenDetails?: (() => void) | undefined
  /** The enclosing exact event rail already owns title/project/session identity and focus. */
  identityOwnedExternally?: boolean
  /** App-owned suspension/staleness state; all panel controls become natively inert. */
  disabled?: boolean
  /** Exact successor or rejection copy validated by the App. */
  feedback?: LotCastingReviewPanelFeedback | null
}

const ROLE_ORDER = ['lead', 'antagonist', 'support'] as const

const ROLE_LABEL: Record<(typeof ROLE_ORDER)[number], string> = {
  lead: 'Lead',
  antagonist: 'Antagonist',
  support: 'Support',
}

const CREATIVE_ROLE_LABEL: Record<
  LotCastingReviewContext['writer']['primaryRole'],
  string
> = {
  writer: 'Writer',
  director: 'Director',
  actor: 'Actor',
  craft: 'Craft',
}

function formatScore(value: number): string {
  return String(value)
}

function canonicalRoles(context: LotCastingReviewContext): LotCastingReviewRole[] {
  const roles: LotCastingReviewRole[] = []
  for (let index = 0; index < ROLE_ORDER.length; index += 1) {
    const role = context.roles[index]
    if (role === undefined || role.slot !== ROLE_ORDER[index]) return []
    roles.push(role)
  }
  return roles
}

type ReviewIntent =
  | { kind: 'action'; action: LotCastingReviewAction }
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
    sameLotCastingReviewAction(left.action, right.action)
  )
}

/**
 * The complete player-safe Casting review inside the live Studio Lot.
 * Authority checks, successor validation, autosave, and cross-event
 * deduplication deliberately remain with the App host.
 */
export const LotCastingReviewPanel = forwardRef<
  HTMLHeadingElement,
  LotCastingReviewPanelProps
>(function LotCastingReviewPanel(
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
  const packageHeadingId = useId()
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
      sameLotCastingReviewContext(previous.context, context)
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

  const roles = canonicalRoles(context)
  const packageAvailability = context.packageAvailability

  return (
    <section
      className="card stack lot-casting-review-panel"
      aria-labelledby={identityOwnedExternally ? undefined : headingId}
      aria-label={identityOwnedExternally ? `Casting review · ${context.title}` : undefined}
      data-testid="lot-casting-review-panel"
      data-session-id={context.sessionId}
      data-project-id={context.projectId}
      data-opens-package={String(context.action.opensPackage)}
    >
      {!identityOwnedExternally && (
        <header className="lot-next-event-identity">
          <span className="lot-next-event-kicker">Casting review</span>
          <h3 id={headingId} ref={headingRef} tabIndex={-1} data-testid="lot-casting-review-heading">
            {context.title}
          </h3>
          {/* Genre and writer, not `script-0000 · casting-0000`. The ids stay on
              `data-project-id`/`data-session-id` above, where provenance needs them and
              no player reads them (cold-playtest defect). */}
          <span data-testid="lot-casting-review-identity">
            {genreLabel(context.genre)} ·{' '}
            {CREATIVE_ROLE_LABEL[context.writer.primaryRole]} {context.writer.name}
          </span>
        </header>
      )}

      <div className="lot-casting-review-evidence stack">
        <dl className="lot-next-event-facts" aria-label="Casting review identity">
          <div>
            <dt>Genre</dt>
            <dd data-testid="lot-casting-review-genre">{context.genre}</dd>
          </div>
          <div>
            <dt>Writer</dt>
            <dd data-testid="lot-casting-review-writer">{context.writer.name}</dd>
          </div>
          <div>
            <dt>Creative role</dt>
            <dd data-testid="lot-casting-review-writer-role">
              {CREATIVE_ROLE_LABEL[context.writer.primaryRole]}
            </dd>
          </div>
        </dl>

        <div className="inset" data-testid="lot-casting-review-consequence">
          <strong>Review consequence</strong>
          <div>{context.consequence}</div>
        </div>

        <div className="lot-casting-review-role-grid" data-testid="lot-casting-review-roles">
          {roles.map((role) => (
            <section
              className="lot-casting-review-role stack"
              aria-labelledby={`${headingId}-${role.slot}`}
              data-testid={`lot-casting-review-role-${role.slot}`}
              key={role.slot}
            >
              <h4 id={`${headingId}-${role.slot}`}>{ROLE_LABEL[role.slot]}</h4>
              {role.evidence.map((evidence, index) => (
                <article
                  className="lot-casting-review-row stack"
                  data-testid={`lot-casting-review-row-${role.slot}-${index}`}
                  data-talent-id={evidence.talentId}
                  key={`${index}:${evidence.talentId}`}
                >
                  <header className="lot-casting-review-row-head">
                    <strong data-testid={`lot-casting-review-name-${role.slot}-${index}`}>
                      {evidence.name}
                    </strong>
                    {/* Which of the role's two reads this row is. Everything honest
                        about the person is already printed below; the talent id it used
                        to show added nothing a player could act on, and lives on
                        `data-talent-id` above. */}
                    <span data-testid={`lot-casting-review-talent-id-${role.slot}-${index}`}>
                      Camera test {index + 1} of {role.evidence.length}
                    </span>
                  </header>

                  <dl
                    className="lot-casting-review-row-facts"
                    aria-label={`${ROLE_LABEL[role.slot]} camera test · ${evidence.name}`}
                  >
                    <div>
                      <dt>{evidence.label}</dt>
                      <dd data-testid={`lot-casting-review-estimate-${role.slot}-${index}`}>
                        <data value={String(evidence.estimate)}>{evidence.estimate}</data>
                        {' · '}{evidence.low}–{evidence.high}
                      </dd>
                    </div>
                    <div>
                      <dt>{evidence.fit.label}</dt>
                      <dd data-testid={`lot-casting-review-fit-${role.slot}-${index}`}>
                        <data value={String(evidence.fit.score)}>
                          {formatScore(evidence.fit.score)}
                        </data>
                      </dd>
                    </div>
                    <div>
                      <dt>Availability</dt>
                      <dd data-testid={`lot-casting-review-availability-${role.slot}-${index}`}>
                        <strong>{evidence.available ? 'Available' : 'Unavailable'}</strong>
                        {' · '}{evidence.availabilityLabel}
                      </dd>
                    </div>
                  </dl>

                  {(evidence.strengths.length > 0 || evidence.concerns.length > 0) && (
                    <div className="lot-casting-review-language">
                      {evidence.strengths.length > 0 && (
                        <div data-testid={`lot-casting-review-strengths-${role.slot}-${index}`}>
                          <strong>Strengths</strong>
                          <ul>
                            {evidence.strengths.map((strength, strengthIndex) => (
                              <li key={`${strengthIndex}:${strength}`}>{strength}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {evidence.concerns.length > 0 && (
                        <div
                          className="hint"
                          data-testid={`lot-casting-review-concerns-${role.slot}-${index}`}
                        >
                          <strong>Concerns</strong>
                          <ul>
                            {evidence.concerns.map((concern, concernIndex) => (
                              <li key={`${concernIndex}:${concern}`}>{concern}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </article>
              ))}
            </section>
          ))}
        </div>

        <section
          className="lot-casting-review-package stack"
          aria-labelledby={packageHeadingId}
          data-testid="lot-casting-review-package"
        >
          <h4 id={packageHeadingId}>Current package state</h4>
          <p data-testid="lot-casting-review-package-state">
            <strong>
              {packageAvailability.knownGatesClear
                ? 'Known package gates clear'
                : 'Package gates blocked'}
            </strong>
          </p>
          <dl className="lot-next-event-facts" aria-label="Current package gates">
            <div><dt>Writer</dt><dd>{packageAvailability.writerAvailable ? 'Available' : 'Blocked'}</dd></div>
            <div><dt>Staffing</dt><dd>{packageAvailability.staffingAvailable ? 'Available' : 'Blocked'}</dd></div>
            <div><dt>Production slot</dt><dd>{packageAvailability.productionSlotAvailable ? 'Available' : 'Blocked'}</dd></div>
            <div>
              <dt>Development &amp; Casting slot</dt>
              <dd>{packageAvailability.developmentCastingSlotAvailable ? 'Available' : 'Blocked'}</dd>
            </div>
          </dl>

          {packageAvailability.blockers.length > 0 && (
            <section aria-labelledby={blockersHeadingId} data-testid="lot-casting-review-blockers">
              <h5 id={blockersHeadingId}>Current blockers</h5>
              <div className="stack">
                {packageAvailability.blockers.map((blocker, index) => (
                  <div
                    className="warn"
                    key={`${index}:${blocker.kind}:${blocker.headline}`}
                    data-testid="lot-casting-review-blocker"
                  >
                    <strong>{blocker.headline}</strong>
                    <div>{blocker.detail}</div>
                    <div className="hint">Remedy: {blocker.remedy}</div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </section>
      </div>

      <div
        className="lot-next-event-actions"
        role="group"
        aria-label="Casting review actions"
      >
        <button
          type="button"
          className="lot-next-event-action primary"
          disabled={disabled}
          {...boundaryFor({ kind: 'action', action: context.action })}
          data-testid={`lot-casting-review-action-${context.action.kind}-${context.sessionId}`}
        >
          {context.action.label}
        </button>

        {onOpenDetails !== undefined && (
          <button
            type="button"
            className="lot-next-event-action ghost"
            disabled={disabled}
            {...boundaryFor({ kind: 'deep' })}
            data-testid="lot-casting-review-open-details"
          >
            Open Casting Room details
          </button>
        )}
      </div>

      {feedback !== null && (
        <div
          className={feedback.kind === 'error' ? 'errbox' : 'result-block'}
          role={feedback.kind === 'error' ? 'alert' : undefined}
          aria-atomic={feedback.kind === 'error' ? 'true' : undefined}
          data-testid="lot-casting-review-feedback"
          data-feedback-kind={feedback.kind}
        >
          {feedback.message}
        </div>
      )}
    </section>
  )
})
