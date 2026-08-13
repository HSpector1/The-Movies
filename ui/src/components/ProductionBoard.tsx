// ── Production Board ────────────────────────────────────────────────────
// Pure React over the adapter's narrow read model. This component never receives
// GameState and never decides which action is legal.

import { useEffect, useRef } from 'react'
import type {
  ProductionBoardView,
  ProductionCommandView,
} from '../engine/adapter.ts'
import { money, score } from '../format.ts'
import { Metric } from './common.tsx'

export function ProductionBoard({
  board,
  onCommand,
  focusProductionId,
}: {
  board: ProductionBoardView
  onCommand?: (command: ProductionCommandView) => void
  /** Navigation-only handoff from the Studio Calendar. */
  focusProductionId?: string
}) {
  const pendingFocusProductionId = useRef<string | null>(null)
  const commandRefs = useRef(new Map<string, HTMLButtonElement>())
  const statusRefs = useRef(new Map<string, HTMLSpanElement>())
  const headingRef = useRef<HTMLHeadingElement | null>(null)
  const initialFocusProductionId = useRef<string | null>(focusProductionId ?? null)

  // A command replaces itself with the next legal command, or with the final
  // scheduled status. Move focus to that authoritative successor so keyboard and
  // screen-reader users never fall back to <body> when React removes the button.
  useEffect(() => {
    const productionId = pendingFocusProductionId.current ?? initialFocusProductionId.current
    if (productionId === null) return
    const card = board.cards.find((candidate) => candidate.productionId === productionId)
    if (card === undefined) {
      headingRef.current?.focus()
      initialFocusProductionId.current = null
      return
    }
    const target = card.command
      ? commandRefs.current.get(productionId)
      : statusRefs.current.get(productionId)
    if (target === undefined) return
    target.focus()
    pendingFocusProductionId.current = null
    initialFocusProductionId.current = null
  }, [board])

  return (
    <div className="card production-board" data-testid="production-board">
      <div className="spread production-board-heading">
        <div>
          <h2 ref={headingRef} tabIndex={-1} data-testid="production-board-heading">Production Board</h2>
          <p className="hint">
            {board.mode === 'managed'
              ? 'Authoritative phases, facility reservations, and shooting calls.'
              : 'This migrated studio retains its original production countdown.'}
          </p>
        </div>
        <span className={`tag ${board.mode === 'managed' ? 'fact' : 'estimate'}`}>
          {board.mode === 'managed' ? 'Managed operations' : 'Legacy schedule'}
        </span>
      </div>

      {board.cards.length === 0 ? (
        <div className="empty" data-testid="no-active">
          Nothing in production. Assemble a film to get started.
        </div>
      ) : (
        <div className="grid grid-2" data-testid="active-list">
          {board.cards.map((card) => (
            <article
              className={`panel production-card${card.blocker ? ' production-card-attention' : ''}`}
              key={card.productionId}
              data-testid={`active-${card.productionId}`}
            >
              <div className="spread production-card-title">
                <div>
                  <strong>{card.title}</strong>
                  <div className="production-phase" data-testid={`production-phase-${card.productionId}`}>
                    {card.phaseLabel}
                  </div>
                </div>
                <span
                  className={`tag ${card.blocker ? 'warning' : 'fact'}`}
                  role="status"
                  aria-live="polite"
                  aria-atomic="true"
                  tabIndex={-1}
                  ref={(node) => {
                    if (node) statusRefs.current.set(card.productionId, node)
                    else statusRefs.current.delete(card.productionId)
                  }}
                  data-testid={`production-status-${card.productionId}`}
                >
                  {card.statusLabel}
                </span>
              </div>

              <div className="production-board-facts">
                <Metric label="Weeks left" small testid={`weeks-${card.productionId}`}>
                  {card.weeksRemaining}
                </Metric>
                <Metric label="Current facility" small testid={`production-facility-${card.productionId}`}>
                  {card.currentFacility}
                </Metric>
                <Metric label="Director" small testid={`production-director-${card.productionId}`}>
                  {card.director.name}
                  {card.director.status === 'not-called'
                    ? ' · not called'
                    : card.director.status === 'called'
                      ? ' · called'
                      : ' · locked'}
                </Metric>
              </div>

              {card.blocker && (
                <div
                  className="production-blocker"
                  role="status"
                  data-testid={`production-blocker-${card.productionId}`}
                >
                  <strong>{card.blocker.headline}</strong>
                  <span>{card.blocker.detail}</span>
                  <span className="hint">{card.blocker.consequence}</span>
                </div>
              )}

              {card.command && (
                <button
                  type="button"
                  className="accent production-command"
                  disabled={!onCommand}
                  ref={(node) => {
                    if (node) commandRefs.current.set(card.productionId, node)
                    else commandRefs.current.delete(card.productionId)
                  }}
                  onClick={() => {
                    pendingFocusProductionId.current = card.productionId
                    onCommand?.(card.command!)
                  }}
                  data-testid={`production-command-${card.command.kind}-${card.productionId}`}
                >
                  {card.command.label}
                </button>
              )}

              <div className="production-forecast">
                <Metric label="Expected total theatrical gross" small>
                  <span className="tag estimate">Est</span>{' '}
                  {money(card.forecast.expectedTotal)}
                </Metric>
                <Metric label="Expected critic score" small>
                  <span className="tag estimate">Est</span>{' '}
                  {score(card.forecast.expectedCriticScore)}
                </Metric>
              </div>
            </article>
          ))}
        </div>
      )}

      {board.mode === 'managed' && (
        <p className="hint production-schedule-assumption" data-testid="production-schedule-assumption">
          {board.scheduleAssumption}
        </p>
      )}
    </div>
  )
}
