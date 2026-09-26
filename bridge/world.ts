// P14A.3 — the WORLD ROUTE facts (projection 44).
//
// READ MODELS over the landed A.1 case law (`e575fc1`/`562cdf2`) and the landed A.2
// workspace (`a0611b8`), and nothing else: no engine law, no new intent kind, no new
// page, no Pulse change, Save V28 UNCHANGED and nothing persisted. Three facts a world
// surface needs about one person, each derived at the read week from entries that
// already exist — the restrained status line of an OPEN case, the reference that opens
// that exact case, and whether the person is reached on the player's own lot or from the
// Industry roster and the profile.
//
// Laws (plan: "P14A.3 — World route facts — task expansion", scope item 1):
//   * `statusLine` exists for an OPEN case ONLY — "Renewal window open · decides Week N"
//     while the case reads `discovered | proposals_open`, and "Decides next week · Week N"
//     once `decisionWeek <= week + 1` while it is STILL open. That is exactly the landed
//     A.2 settling rule (`bridge/market.ts`, the `settling` bucket), not a narrower `===`:
//     a case already at or past its decision week (the transient `decision_pending`)
//     settles sooner still and reads the same line rather than falling out of the law.
//     The copy is the plan's CANDIDATE literal, with the U+00B7 middle dot — the Owner's
//     wording stays OPEN, and a copy change is a test edit plus a projection bump.
//   * `caseRef` opens the EXACT case through the existing `view`/`targetId` wire
//     convention of `bridge/market.ts`: `marketPage(state, {view:'market', targetId})`
//     answers with `selected.marketCase`, which is byte-equal to the Profile's own
//     `marketCase` because both call `marketCaseProjection`. Nothing is re-derived here.
//   * `caseRef` is NULL whenever `statusLine` is null — a closed case, and a person the
//     engine holds no case for. The world route is the restrained OPEN-case surface; a
//     settled case stays readable through the Profile's `marketCase` and the market
//     page's own `closed` bucket. (Implementation decision recorded at P14A.3-T1 ruling
//     (iii); unasserted by the T1 tests, reversible at a projection bump.)
//   * `reach` is `playerLot` iff the Profile's `presence.onLot` — the player-only,
//     save-neutral Presence Projection V1 fact — and `industry` otherwise. A rival's
//     person is never on the player's lot, so a rival's person is always reached from the
//     Industry roster and the profile. NO rival lot exists anywhere in the bridge and
//     none is added here.
//
// No figure of any kind crosses this module: a status line carries a derived week, and a
// case reference carries a talentId. A.1's disclosure law is untouched.
import { studioPresence } from '../src/core/presence.ts'
import { caseForTalent, latestCaseIsExtension } from '../src/core/talentMarket.ts'
import type { GameState } from '../src/core/types.ts'
import type { BridgeWorldRouteSnapshot } from './schema/bridge-schema.ts'

/** The four terminal case statuses — the same set `bridge/market.ts` closes a case on. */
const TERMINAL = new Set(['settled', 'declined', 'expired', 'invalidated'])

/**
 * The world route for one person at the state's own authoritative week.
 *
 * `onLot` is the Profile's own `presence.onLot`. A caller that has already built the
 * whole-roster presence set (`bridge/people.ts`, `bridge/industry.ts`) passes its own
 * answer rather than rebuilding the projection once per person; the two-parameter call
 * the plan names derives it here from the same single entry, `studioPresence`.
 */
export function personWorldRoute(
  state: GameState,
  talentId: string,
  onLot?: boolean,
): BridgeWorldRouteSnapshot {
  const week = state.market.tick
  const present = onLot ?? studioPresence(state).people.some((person) => person.talentId === talentId)
  const reach = present ? 'playerLot' : 'industry'
  const view = caseForTalent(state, talentId, week)
  if (view === null || TERMINAL.has(view.status)) return { statusLine: null, caseRef: null, reach }
  if (latestCaseIsExtension(state, talentId)) {
    return { statusLine: `One final extension · decides Week ${view.decisionWeek}`,
      caseRef: { view: 'market', targetId: talentId }, reach }
  }
  const statusLine =
    view.decisionWeek <= week + 1
      ? `Decides next week · Week ${String(view.decisionWeek)}`
      : `Renewal window open · decides Week ${String(view.decisionWeek)}`
  return { statusLine, caseRef: { view: 'market', targetId: talentId }, reach }
}
