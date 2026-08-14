import type { Ref } from 'react'
import type {
  FilmChronicleView,
  FilmParticipant,
  FilmPromise,
  FilmShape,
} from '../engine/adapter.ts'
import { genreLabel, PROMISE_AXIS_INFO, SHAPE_DESCRIPTIONS } from '../content.ts'
import { axis, segmentLabel } from '../format.ts'

const ROLE_LABEL: Record<FilmParticipant['role'], string> = {
  writer: 'Writer',
  director: 'Director',
  lead: 'Lead',
  antagonist: 'Antagonist',
  support: 'Support',
  craft: 'Production/Craft Lead',
}

const PROMISE_AXES = ['intimacy', 'tonalWeight', 'kineticEnergy'] as const

function safeId(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, '-')
}

function shapeLabel(value: string): string {
  return SHAPE_DESCRIPTIONS[value]?.title ?? value
}

function shapeLine(shape: FilmShape): string {
  return `${shapeLabel(shape.opening)} opening. ${shapeLabel(shape.midpoint)} midpoint. ${shapeLabel(shape.ending)} final reel.`
}

function promiseRange(
  axisName: keyof FilmPromise['ranges'],
  range: FilmPromise['ranges'][keyof FilmPromise['ranges']],
): string {
  const info = PROMISE_AXIS_INFO[axisName]
  return `${info.title}: ${axis(range[0])} to ${axis(range[1])} (${info.low} to ${info.high})`
}

function frozenCredits(participants: FilmChronicleView['credits']): FilmParticipant[] {
  if (!participants.available) return []
  const p = participants.participants
  return [p.writer, p.director, p.cast.lead, p.cast.antagonist, p.cast.support, ...p.craft]
}

/**
 * A deterministic, code-native studio one-sheet. All facts arrive through the
 * FilmChronicleView; this component performs display formatting only.
 */
export function FilmPoster({
  view,
  titleAsHeading = false,
  titleRef,
}: {
  view: FilmChronicleView
  titleAsHeading?: boolean
  titleRef?: Ref<HTMLHeadingElement> | undefined
}) {
  const titleId = `film-poster-title-${safeId(view.productionId)}`
  const captionId = `film-poster-caption-${safeId(view.productionId)}`
  const posterGenre = view.genre ?? 'unrecorded'
  const posterGenreLabel = view.genre === null ? 'Genre unavailable' : genreLabel(view.genre)
  const creative = view.creativeRecord
  const credits = view.credits
  const production = view.productionRecord
  const packageRecord = view.packageRecord
  const participants = credits.available ? credits.participants : null
  const creditsUnavailableMessage = credits.available ? '' : credits.message
  const openingClass = creative.available ? creative.shape.opening : 'unrecorded'
  const allCredits = frozenCredits(credits)

  return (
    <figure
      className={`film-poster film-poster--${posterGenre} film-poster--opening-${openingClass}`}
      aria-labelledby={titleId}
      aria-describedby={captionId}
      data-testid="film-poster"
      data-production-id={view.productionId}
    >
      <span className="film-poster__motif film-poster__motif--disc" aria-hidden="true" />
      <span className="film-poster__motif film-poster__motif--beam" aria-hidden="true" />

      <header className="film-poster__header">
        <span>A PROJECT: STUDIO PRODUCTION</span>
        <span className="film-poster__genre" data-testid="film-poster-genre">
          {posterGenreLabel}
        </span>
      </header>

      <div className="film-poster__body">
        {titleAsHeading ? (
          <h1
            ref={titleRef}
            tabIndex={-1}
            className="film-poster__title"
            id={titleId}
            data-testid="film-poster-title"
          >
            {view.title}
          </h1>
        ) : (
          <div className="film-poster__title" id={titleId} data-testid="film-poster-title">
            {view.title}
          </div>
        )}

        {creative.available ? (
          <p className="film-poster__shape-line" data-testid="film-poster-shape-line">
            {shapeLine(creative.shape)}
          </p>
        ) : (
          <p className="film-poster__unavailable" data-testid="film-poster-creative-unavailable">
            {creative.message}
          </p>
        )}

        {participants ? (
          <div className="film-poster__billing" data-testid="film-poster-billing">
            <span>
              <small>Directed by</small>
              <strong>{participants.director.name}</strong>
            </span>
            <span>
              <small>Starring</small>
              <strong>{participants.cast.lead.name}</strong>
            </span>
          </div>
        ) : (
          <p className="film-poster__unavailable" data-testid="film-poster-credits-unavailable">
            {creditsUnavailableMessage}
          </p>
        )}

        {creative.available && (
          <div className="film-poster__audience" data-testid="film-poster-audience">
            For {creative.promise.intendedSegments.map(segmentLabel).join(' · ')}
          </div>
        )}
      </div>

      <footer className="film-poster__footer">
        {creative.available && (
          <>
            <dl className="film-poster__beats" data-testid="film-poster-beats">
              <div className="film-poster__beat">
                <dt>Opening</dt>
                <dd>{shapeLabel(creative.shape.opening)}</dd>
              </div>
              <div className="film-poster__beat">
                <dt>Midpoint</dt>
                <dd>{shapeLabel(creative.shape.midpoint)}</dd>
              </div>
              <div className="film-poster__beat">
                <dt>Final reel</dt>
                <dd>{shapeLabel(creative.shape.ending)}</dd>
              </div>
            </dl>

            <ul className="film-poster__promise" aria-label="Audience promise" data-testid="film-poster-promise">
              {PROMISE_AXES.map((name) => (
                <li key={name}>{promiseRange(name, creative.promise.ranges[name])}</li>
              ))}
            </ul>
          </>
        )}

        {credits.available && (
          <dl className="film-poster__credits" data-testid="film-poster-credits">
            {allCredits.map((participant) => (
              <div key={`${participant.role}-${participant.talentId}`}>
                <dt>{ROLE_LABEL[participant.role]}</dt>
                <dd>{participant.name}</dd>
              </div>
            ))}
          </dl>
        )}

        <div className="film-poster__facts">
          {production.available ? (
            <p className="film-poster__fact" data-testid="film-poster-production-record">
              <span className="film-poster__fact-label">Production record</span>
              <strong>
                Commissioned Week {production.commissionedWeek} · {production.rewriteCount === 0 ? 'First draft' : 'One final rewrite'}
                {' · '}Greenlit Week {production.greenlightWeek} · Released Week {production.releaseWeek}
                {' · '}{production.elapsedWeeks} weeks elapsed
              </strong>
            </p>
          ) : (
            <p className="film-poster__unavailable" data-testid="film-poster-production-unavailable">
              {production.message}
            </p>
          )}

          {packageRecord.available ? (
            <p className="film-poster__fact" data-testid="film-poster-package-record">
              <span className="film-poster__fact-label">Package fit</span>
              <strong>
                {packageRecord.strongest.label}: {packageRecord.strongest.participant.name} ({packageRecord.strongest.fit})
                {' · '}{packageRecord.weakest.label}: {packageRecord.weakest.participant.name} ({packageRecord.weakest.fit})
              </strong>
            </p>
          ) : (
            <p className="film-poster__unavailable" data-testid="film-poster-package-unavailable">
              {packageRecord.message}
            </p>
          )}
        </div>

        <div className="film-poster__reception" data-testid="film-poster-reception">
          <span>Critics {Math.round(view.reception.critic.score)}/100</span>
          <span>{view.reception.audience.label} · {Math.round(view.reception.audience.score)}/100</span>
        </div>
      </footer>

      <figcaption className="visually-hidden" id={captionId}>
        Studio one-sheet for {view.title}, {view.genre === null ? 'genre unavailable' : `a ${genreLabel(view.genre)} film`}.
        {participants
          ? ` Directed by ${participants.director.name} and starring ${participants.cast.lead.name}.`
          : ` ${creditsUnavailableMessage}`}
        {' '}Critic score {Math.round(view.reception.critic.score)} out of 100. {view.reception.audience.label}.
      </figcaption>
    </figure>
  )
}
