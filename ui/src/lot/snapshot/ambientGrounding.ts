// ── EVERYTHING BELONGS TO A SYSTEM (charter §4.2, `00C`.6) ────────────────────
//
// The lot has carried eight decorative patrols since C1: a grip crossing the
// service yard, an electrician walking between the stages, a publicity walker on
// the front avenue. They were dressing. They walked whether or not the studio was
// doing anything, which means the property could be at a dead stop and still look
// busy — a live violation of owner law 9, and the reason §4.2 names them by count.
//
// This module turns each patrol into an ASSERTION. Every route now claims an
// authoritative fact, and it may only be on the property when its fact is true. No
// new art, no new actors, no new routes: the same eight people, now answerable to
// the question "why is that person there?"
//
// WHERE THERE IS NO AUTHORITY, NOTHING IS CLAIMED. A legacy studio carries no
// `weekTheater` — it holds no reservations an engine projection can read — so this
// returns `null` and the renderer leaves the patrols exactly as they have always
// been. Withholding the projection is not evidence that the studio is idle, and a
// grounding law that hid people on the strength of a missing fact would be
// inventing one.

import { lotTheaterSubjects, lotWeekTheater } from './weekTheater.ts'
import type { StudioLotSnapshot } from './StudioLotSnapshot.ts'
import type { AmbientGroundName } from '../tycoon/world.ts'

/**
 * The facts a patrol may stand on. Each is a real thing the ENGINE says is
 * happening, joined to the crew a player would expect to see doing it.
 *
 * ONE vocabulary: the union is declared beside the routes that claim it
 * (`../tycoon/world.ts`) and this module derives it. A route naming a ground that
 * cannot be derived, or a ground nothing claims, is a compile error there and a
 * measured failure in the suite here.
 *
 *   gate-open           the studio is operating at all
 *   stage-hot           at least one soundstage is shooting
 *   scenery-moving      scenery is on the road, or a set is mounting/striking/clearing
 *   campaign-running    a booked publicity campaign is still running its course
 *   company-standing-by a company or a queued picture is waiting for a resource
 *   building            a committed build is progressing
 */
export type AmbientGround = AmbientGroundName

export const AMBIENT_GROUNDS: readonly AmbientGround[] = [
  'gate-open',
  'stage-hot',
  'scenery-moving',
  'campaign-running',
  'company-standing-by',
  'building',
]

/**
 * Which grounds are true this week, or `null` when this studio publishes no
 * authority to ground against (legacy mode — see the header).
 */
export function lotAmbientGrounds(snapshot: StudioLotSnapshot): Set<AmbientGround> | null {
  const theater = lotWeekTheater(snapshot)
  if (theater === null) return null
  const grounds = new Set<AmbientGround>()
  // The projection exists at all only for a studio the engine is running.
  grounds.add('gate-open')
  if (lotTheaterSubjects(snapshot, 'stage-hot').length > 0) grounds.add('stage-hot')
  if (
    lotTheaterSubjects(snapshot, 'scenery-in-transit').length > 0 ||
    lotTheaterSubjects(snapshot, 'set-mounting').length > 0 ||
    lotTheaterSubjects(snapshot, 'set-struck').length > 0 ||
    lotTheaterSubjects(snapshot, 'wrap-clearing').length > 0
  ) {
    grounds.add('scenery-moving')
  }
  if (
    lotTheaterSubjects(snapshot, 'company-waiting').length > 0 ||
    lotTheaterSubjects(snapshot, 'queue-waiting').length > 0
  ) {
    grounds.add('company-standing-by')
  }
  if (lotTheaterSubjects(snapshot, 'construction-progressing').length > 0) {
    grounds.add('building')
  }
  if (lotPublicityCampaignRunning(snapshot)) grounds.add('campaign-running')
  return grounds
}

/**
 * Is a booked campaign still running?
 *
 * The engine does not publish "a campaign is live" as a field, but it publishes the
 * consequence: a tier that was booked carries a cooldown, and its offer says so with
 * the week it becomes available again. A cooldown in the future is a campaign the
 * studio is currently paying for — which is precisely why the publicity walker is on
 * the avenue. This reads the engine's own offer; it computes no pricing, no lift and
 * no legality of its own.
 */
export function lotPublicityCampaignRunning(snapshot: StudioLotSnapshot): boolean {
  const offers = Array.isArray(snapshot.publicityOffers) ? snapshot.publicityOffers : []
  const week = typeof snapshot.week === 'number' ? snapshot.week : 0
  return offers.some(
    (offer) =>
      offer.available === false &&
      typeof offer.availableWeek === 'number' &&
      offer.availableWeek > week,
  )
}
