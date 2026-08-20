import type {
  FirstFilmJourneyNext,
  FirstFilmJourneyView,
  PictureJourneyBeat,
} from './snapshot/firstFilmJourney.ts'
import type { PackageJourneyProgress } from './packageJourney.ts'

/**
 * Kept only so older browser preferences remain a known, harmless key. Picture Journey is
 * now a persistent P0 surface and deliberately ignores this former collapse preference.
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
  onNextStep: (next: FirstFilmJourneyNext, productionId: string | null) => void
  /** No animated collapse when the player has asked for reduced motion. */
  reducedMotion?: boolean
  /** Native inertness while a modal or the renderer owns input. */
  disabled?: boolean
  /** Live, unsaved choices inside the open Package workspace. */
  packageProgress?: PackageJourneyProgress | null
}

/**
 * ONE waiting line, engine copy rendered verbatim.
 *
 * This card used to compose its own "Waiting until Week 2 — " prefix around the engine's
 * reason and then print a second "Waiting — advance the week" status line under it, so a
 * waiting stage stacked two near-identical sentences that named the same week three times
 * (live-playtest finding). The engine's `waiting.reason` is now the whole quiet line —
 * what is being waited on AND the one thing the player can do about it — so the card
 * simply says it once. `untilWeek` remains the structured fact for anything that needs the
 * number itself.
 */
function waitingLine(waiting: { untilWeek: number | null; reason: string }): string {
  return waiting.reason
}

const JOURNEY_CHAPTERS = [
  { id: 'screenplay', label: 'Script' },
  { id: 'auditions', label: 'Tests' },
  { id: 'casting', label: 'Cast' },
  { id: 'prep', label: 'Prep' },
  { id: 'shoot', label: 'Shoot' },
  { id: 'finish', label: 'Finish' },
] as const

type JourneyChapter = (typeof JOURNEY_CHAPTERS)[number]['id']

function journeyChapter(beat: PictureJourneyBeat): JourneyChapter {
  switch (beat) {
    case 'auditions-running':
    case 'auditions-ready':
      return 'auditions'
    case 'auditions-reviewed':
      return 'casting'
    case 'greenlit':
    case 'pre-production':
    case 'load-in':
      return 'prep'
    case 'shooting':
      return 'shoot'
    case 'post-production':
    case 'release-ready':
    case 'released':
      return 'finish'
    default:
      return 'screenplay'
  }
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
 * It is a guidance LAYER, not a quest log and not a tutorial: no modal, no auto-pop, one
 * current chapter and one next step at a time. Every step is a suggestion the player may
 * ignore. It stays visible: hiding the movie's only explanation
 * of what happened and what comes next recreated the exact dead end this surface prevents.
 */
export function LotPictureGuidanceCard({
  state,
  onNextStep,
  reducedMotion = false,
  disabled = false,
  packageProgress = null,
}: LotPictureGuidanceCardProps) {
  const view = state.kind === 'view' ? state.view : null
  const title = view === null ? 'Picture unavailable' : view.pictureTitle ?? 'No picture yet'
  // Working titles are display copy and may collide. Unsaved Package choices belong only
  // to the exact engine-projected screenplay identity that produced them.
  const livePackage =
    view !== null &&
    packageProgress !== null &&
    view.scriptProjectId !== null &&
    packageProgress.projectId === view.scriptProjectId
      ? packageProgress
      : null
  const next = livePackage === null ? view?.next ?? null : null
  const chapter = view === null ? null : livePackage === null ? journeyChapter(view.beat) : 'casting'
  let headline = view?.headline ?? null
  let whatHappened = view?.whatHappened ?? null
  let detail = view?.detail ?? null
  let whyItMatters = view?.whyItMatters ?? null
  let packageNext: string | null = null

  if (livePackage !== null) {
    if (!livePackage.castComplete) {
      const hasCompletedAuditionEvidence = view?.beat === 'auditions-reviewed'
      headline = 'CAST YOUR PICTURE'
      whatHappened = hasCompletedAuditionEvidence
        ? `Camera-test results reviewed. ${livePackage.selectedRoleCount} of ${livePackage.requiredRoleCount} production roles selected.`
        : `${livePackage.selectedRoleCount} of ${livePackage.requiredRoleCount} production roles selected.`
      detail = `Still required: ${livePackage.missingRoles.join(', ')}.`
      whyItMatters = hasCompletedAuditionEvidence
        ? 'Recorded camera-test estimates and ranges stay beside each tested performer. They inform casting but do not assign anyone.'
        : 'No camera tests were completed for this package. These are editable staffing choices, not audition-backed assignments.'
      packageNext = 'Choose the missing roles in the Package workspace.'
    } else if (livePackage.step === 'greenlight') {
      headline = 'READY FOR GREENLIGHT'
      whatHappened = 'Cast, crew, budget, and forecast are assembled.'
      detail = livePackage.chosenSummary
      whyItMatters = 'This package is ready to become an active studio production.'
      packageNext = 'Greenlight this picture to begin production.'
    } else {
      headline = 'ROLES SELECTED'
      whatHappened = 'Every required role currently has an editable selection.'
      detail = livePackage.chosenSummary
      whyItMatters = 'Nothing is committed until greenlight. The next package decision is the production budget.'
      packageNext =
        livePackage.step === 'casting'
          ? 'Continue to the budget; every role remains editable until greenlight.'
          : 'Set the production and marketing budget, then review the forecast.'
    }
  }

  /**
   * The ENGINE's own stage id, printed verbatim — never a value this card derives.
   *
   * It therefore reads `drafting` under the headline "Screenplay — rewriting", and that is
   * correct rather than a mismatch: `drafting` is the engine's ONE stage for "the
   * screenplay is being written" (`firstFilmJourney.ts` — both `drafting` and `rewriting`
   * project statuses land on it), and the HEADLINE is where the engine refines a rewrite
   * from a first draft. Emitting a distinct `rewriting` value here would mean this card
   * re-answering a question the projection already answered, in a word the frozen contract
   * does not contain — the exact drift the mirror type exists to prevent. `unavailable` is
   * the one value that is not an engine stage: it is this card's own absent/malformed
   * state, which no engine stage names.
   */
  const stageAttribute = view?.stage ?? 'unavailable'

  return (
    <section
      className={
        `hollywood-picture-guidance${reducedMotion ? ' is-reduced-motion' : ''}`
      }
      aria-label="Picture guidance"
      data-testid="lot-picture-guidance"
      data-guidance-stage={stageAttribute}
      data-guidance-beat={view?.beat ?? 'unavailable'}
    >
      <p className="hollywood-eyebrow" data-testid="lot-picture-guidance-eyebrow">
        <i /> PICTURE JOURNEY
        {view !== null && <span>PICTURE {view.ordinal}</span>}
      </p>
      <p className="hollywood-picture-guidance-title" data-testid="lot-picture-guidance-title">
        {title}
      </p>
      {view !== null && (
        <ol
          className="hollywood-picture-guidance-rail"
          aria-label="Picture journey"
          data-testid="lot-picture-guidance-rail"
        >
          {JOURNEY_CHAPTERS.map((item) => (
            <li
              key={item.id}
              className={item.id === chapter ? 'is-current' : undefined}
              aria-current={item.id === chapter ? 'step' : undefined}
            >
              {item.label}
            </li>
          ))}
        </ol>
      )}
      <div className="hollywood-picture-guidance-body">
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
              {headline}
            </p>
            <p
              className="hollywood-picture-guidance-milestone"
              data-testid="lot-picture-guidance-what"
            >
              <b aria-hidden="true">✓</b>
              <span>{whatHappened}</span>
            </p>
            {detail !== null && (
              <p
                className="hollywood-picture-guidance-detail"
                data-testid="lot-picture-guidance-detail"
              >
                {detail}
              </p>
            )}
            <div className="hollywood-picture-guidance-why" data-testid="lot-picture-guidance-why">
              <strong>WHY IT MATTERS</strong>
              <p>{whyItMatters}</p>
            </div>
            {view.blocked !== null && (
              <p
                className="hollywood-consequence hollywood-picture-guidance-blocked"
                data-testid="lot-picture-guidance-blocked"
              >
                <b>!</b>
                <span>{view.blocked.reason}</span>
              </p>
            )}
            <div className="hollywood-picture-guidance-next-step">
              <strong>NEXT</strong>
              {livePackage === null && view.waiting !== null && (
                <p
                  className="hollywood-picture-guidance-waiting"
                  data-testid="lot-picture-guidance-waiting"
                >
                  {waitingLine(view.waiting)}
                </p>
              )}
              {packageNext !== null ? (
                <p
                  className="hollywood-picture-guidance-status"
                  data-testid="lot-picture-guidance-status"
                >
                  {packageNext}
                </p>
              ) : next !== null ? (
                next.kind === 'advance-week' ? (
                // The week already has ONE advance control, on the studio bar. A second
                // button here would be a duplicate authority over time, so the picture's
                // step is stated as a quiet status line instead — and only when the
                // waiting line above did not already say it, which it now always does for
                // a step the engine paired with a `waiting`.
                view.waiting === null && (
                  <p
                    className="hollywood-picture-guidance-status"
                    data-testid="lot-picture-guidance-status"
                  >
                    Waiting — advance the week
                  </p>
                )
              ) : (
                <button
                  type="button"
                  className="hollywood-picture-guidance-next"
                  data-testid="lot-picture-guidance-next"
                  data-guidance-kind={next.kind}
                  disabled={disabled}
                  onClick={() => onNextStep(next, view.productionId)}
                >
                  {next.label}
                </button>
              )
              ) : (
                <p className="hollywood-picture-guidance-status" data-testid="lot-picture-guidance-status">
                  No action required.
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
