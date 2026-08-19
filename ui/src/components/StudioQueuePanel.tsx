// ── THE QUEUE PANEL (C2a-M4, charter §3.3 — owner law 2's player surface) ────
//
// The two-film cap is deleted (owner law 1). Nothing is refused for being the
// third picture any more — it WAITS. Owner law 2 is what makes that fair rather
// than mysterious, and it is a promise about a SCREEN, not about the engine:
//
//   *when capacity is unavailable, QUEUE, DON'T MAGICALLY FORBID — the player
//    must know WHAT IS WAITING, WHAT IT NEEDS, WHAT OCCUPIES IT, and HOW TO
//    RELIEVE THE BOTTLENECK.*
//
// This panel is where those four facts are read. It owns none of them. Every
// sentence below is either the engine's own (`headline`, `detail`, a need's
// `label`) or a formatting of engine numbers; there is no capacity arithmetic,
// no countdown, no price lookup and no blueprint table in this file. The one
// number this component computes is `week + freesInWeeks`, and it computes it
// because a player plans against a DATE, not against a delta — both terms are
// engine facts and the sum is stated beside the delta, never instead of it.
//
// Voice: a studio talks about pictures and rooms. "RAVINE is shooting on
// Soundstage 7 — frees in 2 weeks" is the register. "facility-capacity blocker
// on prod-0012" is not, and never reaches the screen.

import type {
  StudioQueueRemedy,
  StudioQueueView,
  StudioQueueWaiterView,
} from '../engine/adapter.ts'
import { money } from '../format.ts'

/**
 * What a remedy row DOES when the player takes it.
 *
 * The panel routes; it never acts. `onBuild` carries the catalog and blueprint
 * to whatever surface owns building on this screen (the Lot's build catalog for
 * a room, the Scenery Shop for scenery), `onCancelIntent` withdraws a queued
 * front-door intent, and a wait remedy has no handler at all because waiting is
 * not something a button can do — it is a date, and the row states it.
 */
export type StudioQueueRemedyHandlers = {
  onBuild?: (remedy: Extract<StudioQueueRemedy, { kind: 'build-blueprint' }>) => void
  onRepairSet?: (remedy: Extract<StudioQueueRemedy, { kind: 'repair-set' }>) => void
  onStrikeSet?: (remedy: Extract<StudioQueueRemedy, { kind: 'strike-and-mount' }>) => void
  onCancelIntent?: (remedy: Extract<StudioQueueRemedy, { kind: 'cancel-queued-intent' }>) => void
}

/**
 * How the studio says what a holder is doing.
 *
 * The engine hands back its own activity word — a production phase, a
 * screenplay's `drafting`, a casting session's `auditioning`, or a set's
 * `standing`. These are the studio's phrasings of the same facts. Anything not
 * in the table falls back to the engine's word lowercased, so a new activity
 * reads plainly instead of throwing or showing a camelCase token.
 */
const ACTIVITY_PHRASE: Record<string, string> = {
  development: 'in development',
  preProduction: 'in pre-production',
  rehearsal: 'in rehearsal',
  shooting: 'shooting',
  postProduction: 'in post-production',
  releaseReady: 'ready for release',
  drafting: 'being written',
  rewriting: 'in rewrites',
  auditioning: 'in camera tests',
  standing: 'standing',
  // The set arm of the engine's view labels its occupant with a PHASE LABEL.
  Development: 'in development',
  'Pre-production': 'in pre-production',
  Rehearsal: 'in rehearsal',
  Shooting: 'shooting',
  'Post-production': 'in post-production',
  'Release Ready': 'ready for release',
}

function activityPhrase(activity: string): string {
  return ACTIVITY_PHRASE[activity] ?? activity.toLowerCase()
}

export function weeksPhrase(weeks: number): string {
  return `${String(weeks)} week${weeks === 1 ? '' : 's'}`
}

/**
 * "RAVINE is shooting on Soundstage 7 — frees in 2 weeks."
 *
 * A picture stands ON a stage and ON a set; work happens IN an office. The
 * preposition follows what the waiter is short of, which the engine has already
 * told us — it is not a guess about the building's name.
 */
export function holderSentence(
  occupant: StudioQueueWaiterView['occupiedBy'][number],
  place: string | undefined,
  preposition: 'on' | 'in' = 'in',
): string {
  const where = place === undefined ? '' : ` ${preposition} ${place}`
  const frees =
    occupant.freesInWeeks === null
      ? ' — no return date is committed yet'
      : occupant.freesInWeeks === 0
        ? ' — it frees this week'
        : ` — frees in ${weeksPhrase(occupant.freesInWeeks)}`
  return `${occupant.title} is ${activityPhrase(occupant.activity)}${where}${frees}.`
}

/**
 * The remedy row's own words: what it costs, how long it takes, and what the
 * studio gets. Prices and durations are the catalog's, carried on the remedy.
 */
function remedyCopy(
  remedy: StudioQueueRemedy,
  week: number,
): { headline: string; detail: string; action: string | null } {
  switch (remedy.kind) {
    case 'build-blueprint':
      return remedy.catalog === 'facility'
        ? {
            headline: `Build a ${remedy.label}`,
            detail: `${money(remedy.cost)} · ready in ${weeksPhrase(remedy.weeks)} · more room, permanently.`,
            action: 'Open the build catalog',
          }
        : {
            headline: `Commission ${remedy.label}`,
            detail: `${money(remedy.cost)} · standing in ${weeksPhrase(remedy.weeks)} · something to shoot on.`,
            action: 'Open the Scenery Shop',
          }
    case 'wait-for-holder':
      return {
        headline: `Wait for ${remedy.title}`,
        // THE WEEK, not only the delta: a player schedules against a date.
        detail:
          remedy.freesInWeeks === null
            ? 'It has no committed return date yet — this one cannot be planned around.'
            : remedy.freesInWeeks === 0
              ? `It gives the room back this week — Week ${String(week)}.`
              : `It gives the room back in ${weeksPhrase(remedy.freesInWeeks)} — Week ${String(week + remedy.freesInWeeks)}.`,
        action: null,
      }
    case 'repair-set':
      return {
        headline: `Repair ${remedy.setName}`,
        detail: `${money(remedy.cost)} · back in ${weeksPhrase(remedy.weeks)} · worn past the point it can carry a picture.`,
        action: 'Open the Scenery Shop',
      }
    case 'strike-and-mount':
      return {
        headline: `Strike ${remedy.setName}`,
        detail: `${money(remedy.refund)} back · clears the stage so this picture's scenery can go up.`,
        action: 'Open the Scenery Shop',
      }
    case 'cancel-queued-intent':
      return {
        headline: remedy.label,
        detail: 'It leaves the queue, nothing is spent, and the pictures behind it move up.',
        action: 'Withdraw it',
      }
  }
}

function remedyKey(remedy: StudioQueueRemedy, index: number): string {
  switch (remedy.kind) {
    case 'build-blueprint':
      return `build-${remedy.catalog}-${remedy.blueprintId}`
    case 'wait-for-holder':
      return `wait-${remedy.ownerId}`
    case 'repair-set':
      return `repair-${remedy.setId}`
    case 'strike-and-mount':
      return `strike-${remedy.setId}`
    case 'cancel-queued-intent':
      return `cancel-${String(remedy.ordinal)}-${String(index)}`
  }
}

function remedyHandler(
  remedy: StudioQueueRemedy,
  handlers: StudioQueueRemedyHandlers,
): (() => void) | null {
  switch (remedy.kind) {
    case 'build-blueprint':
      return handlers.onBuild === undefined ? null : () => handlers.onBuild?.(remedy)
    case 'repair-set':
      return handlers.onRepairSet === undefined ? null : () => handlers.onRepairSet?.(remedy)
    case 'strike-and-mount':
      return handlers.onStrikeSet === undefined ? null : () => handlers.onStrikeSet?.(remedy)
    case 'cancel-queued-intent':
      return handlers.onCancelIntent === undefined ? null : () => handlers.onCancelIntent?.(remedy)
    case 'wait-for-holder':
      return null
  }
}

function waitBadge(waiter: StudioQueueWaiterView): string {
  return waiter.waitWeeks === 0
    ? 'Waiting since this week'
    : `Waiting ${weeksPhrase(waiter.waitWeeks)}`
}

function kindLabel(waiter: StudioQueueWaiterView): string {
  return waiter.kind === 'production' ? 'Picture in flight' : 'Not started yet'
}

export function StudioQueueWaiterRow({
  waiter,
  week,
  places,
  handlers,
}: {
  waiter: StudioQueueWaiterView
  week: number
  places: ReadonlyMap<string, string>
  handlers: StudioQueueRemedyHandlers
}) {
  return (
    <article
      className="panel stack queue-waiter"
      data-testid={`queue-waiter-${waiter.id}`}
      data-queue-waiter-kind={waiter.kind}
    >
      <div className="spread">
        <div>
          <strong data-testid={`queue-waiter-title-${waiter.id}`}>{waiter.title}</strong>
          <div className="hint">{kindLabel(waiter)}</div>
        </div>
        <span className="tag warning" data-testid={`queue-waiter-wait-${waiter.id}`}>
          {waitBadge(waiter)}
        </span>
      </div>

      {/* WHAT IS WAITING — the engine's own sentence, unedited. */}
      <strong data-testid={`queue-waiter-headline-${waiter.id}`}>{waiter.headline}</strong>

      <dl className="queue-facts">
        {/* WHAT IT NEEDS */}
        <div>
          <dt>What it needs</dt>
          <dd data-testid={`queue-waiter-needs-${waiter.id}`}>
            {waiter.needs.label}
            {waiter.alsoMissing.length > 0 &&
              ` — and also ${waiter.alsoMissing.map((need) => need.label).join(', ')}`}
          </dd>
        </div>
        {/* WHAT OCCUPIES IT, and WHEN IT FREES */}
        <div>
          <dt>Who has it</dt>
          <dd data-testid={`queue-waiter-holders-${waiter.id}`}>
            {waiter.occupiedBy.length === 0 ? (
              <span>{waiter.detail}</span>
            ) : (
              <ul className="queue-holder-list">
                {waiter.occupiedBy.map((occupant) => (
                  <li key={occupant.resourceId} data-testid={`queue-holder-${waiter.id}-${occupant.resourceId}`}>
                    {holderSentence(
                      occupant,
                      places.get(occupant.resourceId),
                      waiter.needs.kind === 'set' || waiter.needs.capability === 'soundstage'
                        ? 'on'
                        : 'in',
                    )}
                  </li>
                ))}
              </ul>
            )}
          </dd>
        </div>
      </dl>

      {/* HOW TO RELIEVE IT */}
      <div className="stack queue-remedies" data-testid={`queue-remedies-${waiter.id}`}>
        <span className="eyebrow">What relieves it</span>
        {waiter.remedies.length === 0 ? (
          <span className="hint">Nothing on the lot can relieve this one yet.</span>
        ) : (
          <ul className="queue-remedy-list">
            {waiter.remedies.map((remedy, index) => {
              const copy = remedyCopy(remedy, week)
              const key = remedyKey(remedy, index)
              const onAct = remedyHandler(remedy, handlers)
              return (
                <li className="inset queue-remedy" key={key} data-testid={`queue-remedy-${waiter.id}-${key}`}>
                  <div className="queue-remedy-copy">
                    <strong>{copy.headline}</strong>
                    <span className="hint">{copy.detail}</span>
                  </div>
                  {copy.action !== null && onAct !== null && (
                    <button
                      type="button"
                      className="ghost"
                      onClick={onAct}
                      aria-label={`${copy.action}: ${copy.headline}`}
                      data-testid={`queue-remedy-act-${waiter.id}-${key}`}
                    >
                      {copy.action}
                    </button>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </article>
  )
}

export function queueSummarySentence(view: StudioQueueView): string {
  const { waitingProductions, waitingIntents, longestWaitWeeks } = view.summary
  if (waitingProductions === 0 && waitingIntents === 0) {
    return 'Nothing is waiting. Every picture and every commission on the lot has the room it needs.'
  }
  const parts: string[] = []
  if (waitingProductions > 0) {
    parts.push(
      `${String(waitingProductions)} picture${waitingProductions === 1 ? '' : 's'} held at a door`,
    )
  }
  if (waitingIntents > 0) {
    parts.push(
      `${String(waitingIntents)} order${waitingIntents === 1 ? '' : 's'} waiting to start`,
    )
  }
  return `${parts.join(' · ')} · longest wait ${weeksPhrase(longestWaitWeeks)}.`
}

/**
 * THE QUEUE, on a screen.
 *
 * Rendered in the engine's own service order — longest-waiting-first, ordinal
 * tie-break — because the order on the screen is the order the lot will actually
 * serve, and a board that sorted it differently would be a lie about fairness.
 */
export function StudioQueuePanel({
  view,
  places,
  handlers = {},
  headingId = 'studio-queue-heading',
}: {
  view: StudioQueueView
  places: ReadonlyMap<string, string>
  handlers?: StudioQueueRemedyHandlers
  headingId?: string
}) {
  return (
    <section className="card stack studio-queue" aria-labelledby={headingId} data-testid="studio-queue">
      <div className="spread">
        <div>
          <div className="eyebrow">Waiting on the lot · Week {view.week}</div>
          <h2 id={headingId}>The queue</h2>
          <p className="hint">
            Nothing is refused for being next in line. What the lot cannot start today, it holds
            here — and starts the week a room frees.
          </p>
        </div>
        <span
          className={`tag ${view.waiters.length === 0 ? 'fact' : 'warning'}`}
          data-testid="studio-queue-count"
        >
          {view.waiters.length === 0 ? 'Clear' : `${String(view.waiters.length)} waiting`}
        </span>
      </div>
      <p className="hint" data-testid="studio-queue-summary">
        {queueSummarySentence(view)}
      </p>
      {view.waiters.length === 0 ? (
        <div className="empty" data-testid="studio-queue-empty">
          No picture and no order is waiting for a room this week.
        </div>
      ) : (
        <div className="stack" data-testid="studio-queue-waiters">
          {view.waiters.map((waiter) => (
            <StudioQueueWaiterRow
              key={waiter.id}
              waiter={waiter}
              week={view.week}
              places={places}
              handlers={handlers}
            />
          ))}
        </div>
      )}
    </section>
  )
}
