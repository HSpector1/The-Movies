import { useCallback, useId, useState } from 'react'
import type { FirstFilmJourneyNext, FirstFilmJourneyView } from './snapshot/firstFilmJourney.ts'

/**
 * UI PREFERENCE, not save data. The collapsed state of a HUD card is a property of this
 * browser, not of the studio — it never enters GameState, a save, or a session snapshot.
 */
export const PICTURE_GUIDANCE_COLLAPSED_STORAGE_KEY = 'project-studio.ui.picture-guidance-collapsed'

/**
 * What the host proved about the journey this frame. `unavailable` is the honest surface
 * for a projection that is present but cannot be trusted: it claims nothing about the
 * picture rather than degrading into a statement the host cannot prove.
 */
export type LotPictureGuidanceState =
  | { kind: 'view'; view: FirstFilmJourneyView }
  | { kind: 'unavailable' }

export type LotPictureGuidanceCardProps = {
  state: LotPictureGuidanceState
  /**
   * Take the picture's ONE imperative next step. The host owns what that means physically
   * (pan the camera to the building and select it); this card only names it.
   */
  onNextStep: (next: FirstFilmJourneyNext) => void
  /** No animated collapse when the player has asked for reduced motion. */
  reducedMotion?: boolean
  /** Native inertness while a modal or the renderer owns input. */
  disabled?: boolean
}

function readCollapsedPreference(): boolean {
  try {
    return localStorage.getItem(PICTURE_GUIDANCE_COLLAPSED_STORAGE_KEY) === '1'
  } catch {
    return false // storage unavailable (private mode / sandbox) — start expanded
  }
}

function writeCollapsedPreference(collapsed: boolean): void {
  try {
    if (collapsed) localStorage.setItem(PICTURE_GUIDANCE_COLLAPSED_STORAGE_KEY, '1')
    else localStorage.removeItem(PICTURE_GUIDANCE_COLLAPSED_STORAGE_KEY)
  } catch {
    /* storage unavailable — the preference simply does not persist */
  }
}

function waitingLine(waiting: { untilWeek: number | null; reason: string }): string {
  return waiting.untilWeek === null
    ? `Waiting — ${waiting.reason}`
    : `Waiting until Week ${String(waiting.untilWeek)} — ${waiting.reason}`
}

/**
 * PICTURE GUIDANCE — the picture as a followable identity, from before its first
 * commission.
 *
 * The top-left desk used to claim "No active production / the studio lot is idle" for the
 * whole pre-greenlight journey, while a screenplay was drafting and auditions were
 * running. This card owns that slot instead: the picture's name, where it stands, and the
 * ONE imperative next step — engine copy, rendered verbatim.
 *
 * It is a guidance LAYER, not a quest log and not a tutorial: no modal, no auto-pop, no
 * progress checklist, one step at a time, collapsible to a header, and every step is a
 * suggestion the player may ignore.
 */
export function LotPictureGuidanceCard({
  state,
  onNextStep,
  reducedMotion = false,
  disabled = false,
}: LotPictureGuidanceCardProps) {
  const bodyId = useId()
  const [collapsed, setCollapsed] = useState(readCollapsedPreference)

  const toggle = useCallback(() => {
    setCollapsed((current) => {
      const next = !current
      writeCollapsedPreference(next)
      return next
    })
  }, [])

  const view = state.kind === 'view' ? state.view : null
  const eyebrow = view === null
    ? 'YOUR PICTURE'
    : view.ordinal === 1
      ? 'YOUR FIRST PICTURE'
      : 'YOUR NEXT PICTURE'
  const title = view === null ? 'Picture unavailable' : view.pictureTitle ?? 'No picture yet'
  const next = view?.next ?? null

  return (
    <section
      className={
        `hollywood-picture-guidance${collapsed ? ' is-collapsed' : ''}` +
        `${reducedMotion ? ' is-reduced-motion' : ''}`
      }
      aria-label="Picture guidance"
      data-testid="lot-picture-guidance"
      data-guidance-stage={view?.stage ?? 'unavailable'}
    >
      <p className="hollywood-eyebrow" data-testid="lot-picture-guidance-eyebrow">
        <i /> {eyebrow}
      </p>
      <button
        type="button"
        className="hollywood-picture-guidance-toggle"
        data-testid="lot-picture-guidance-toggle"
        aria-expanded={!collapsed}
        aria-controls={bodyId}
        aria-label="Picture guidance details"
        onClick={toggle}
      >
        <span aria-hidden="true">{collapsed ? '▸' : '▾'}</span>
      </button>
      <h2 data-testid="lot-picture-guidance-title">{title}</h2>
      <div id={bodyId} className="hollywood-picture-guidance-body" hidden={collapsed}>
        {view === null ? (
          <p className="hollywood-picture-guidance-headline" data-testid="lot-picture-guidance-headline">
            Picture guidance is unavailable this week.
          </p>
        ) : (
          <>
            <p
              className="hollywood-picture-guidance-headline"
              data-testid="lot-picture-guidance-headline"
            >
              {view.headline}
            </p>
            {view.detail !== null && (
              <p
                className="hollywood-picture-guidance-detail"
                data-testid="lot-picture-guidance-detail"
              >
                {view.detail}
              </p>
            )}
            {view.waiting !== null && (
              <p
                className="hollywood-picture-guidance-waiting"
                data-testid="lot-picture-guidance-waiting"
              >
                {waitingLine(view.waiting)}
              </p>
            )}
            {view.blocked !== null && (
              <p
                className="hollywood-consequence hollywood-picture-guidance-blocked"
                data-testid="lot-picture-guidance-blocked"
              >
                <b>!</b>
                <span>{view.blocked.reason}</span>
              </p>
            )}
            {next !== null && (
              next.kind === 'advance-week' ? (
                // The week already has ONE advance control, on the studio bar. A second
                // button here would be a duplicate authority over time, so the picture's
                // step is stated as a quiet status line instead.
                <p
                  className="hollywood-picture-guidance-status"
                  data-testid="lot-picture-guidance-status"
                >
                  Waiting — advance the week
                </p>
              ) : (
                <button
                  type="button"
                  className="hollywood-picture-guidance-next"
                  data-testid="lot-picture-guidance-next"
                  data-guidance-kind={next.kind}
                  disabled={disabled}
                  onClick={() => onNextStep(next)}
                >
                  {next.label}
                </button>
              )
            )}
          </>
        )}
      </div>
    </section>
  )
}
