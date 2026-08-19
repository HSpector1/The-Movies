// ── Scenery Load-In V2 — the load-in has a DISTANCE now (charter §4.2) ───────
//
// WHAT CHANGED, AND WHY IT IS ALLOWED TO. `docs/WORLD-FIRST-SCENERY-LOAD-IN-V1-
// CONTRACT.md:621-634` excluded travel time, ETA and any new clock. Charter §11.6
// SUPERSEDES that exclusion list by name and §4.2 replaces it with one narrow
// mechanic, Owner-signed at §18 item 8:
//
//   *scenery load-in gains real duration from engine-owned grid distance between
//   the supplying set-scenery facility and the bound stage
//   (`SCENERY_LOAD_IN_WEEKS_BASE` + `_PER_DISTANCE`); general travel-as-outcome
//   stays out.*
//
// That is the whole licence. There is no pathfinding here, no route, no vehicle,
// no ETA surface, no per-person travel: one integer number of weeks, derived from
// two positions the engine already owns, and NOTHING else in the campaign consults
// distance for an outcome. `00E`.13 records the general case as a NAMED PARITY
// RESIDUAL owned by the C3+ travel docket; it may not disappear silently, and this
// module is deliberately too small to be mistaken for it.
//
// PURITY. Everything here is a pure function of state: no RNG (not even a derived
// stream), no clock, no I/O, and nothing is persisted. The load-in's duration is
// DERIVED every time it is asked for, from `bindings.heldSinceWeek` (the week the
// picture took the stage — already persisted, already preserved across sticky
// retention) and two grid positions. V14 gains no field, which is what §8's
// "V14 is the complete schema" requires.
//
// ── THE GRANDFATHER (§4.2's re-proof budget, and the ruling this lane made) ───
//
// `bindings.requiresSetBinding` is the line, and it is not a new line: the V14
// migrator already mints it FALSE for every in-flight workflow and states why —
// *"an in-flight production keeps `facility-scenery-shop` byte-for-byte and never
// acquires a set. A picture halfway through shooting cannot retroactively be told
// it needed a standing set it was never offered."* (`save.ts`, convertV13ToV14.)
//
// A picture that never bound a set was never told which shop its scenery comes
// from either, so it is not told how far that shop is now. Its load-in stays what
// it always was: a click. Everything the V14 engine greenlit carries
// `requiresSetBinding === true` and gets a real load-in.
//
// This is what keeps the four SHA-256-pinned Scenery Load-In V1 fixtures
// byte-identical and the T9 migration matrix green: every one of them is a
// MIGRATED save, so every one of them is grandfathered by the rule the migration
// already wrote.

import { propertyOf } from './lot.js'
import { TUNING } from './tuning.js'
import type { GameState, LotCell, ProductionWorkflow } from './types.js'

/** Why a load-in duration could not be derived. Withheld, never guessed (law 17/21). */
export type SceneryLoadInWithholding =
  | 'not-blocked'
  | 'grandfathered'
  | 'no-stage-reservation'
  | 'no-scenery-reservation'
  | 'no-held-since-week'
  | 'stage-has-no-body'
  | 'scenery-shop-has-no-body'

export type SceneryLoadIn = {
  /** The `set-scenery` facility the scenery is coming FROM. */
  fromFacilityId: string
  /** The soundstage it is going TO. */
  toFacilityId: string
  /** Grid cells between the two bodies (Manhattan, body centre to body centre). */
  distance: number
  /** Whole weeks the trip takes. Bounded by `SCENERY_LOAD_IN_WEEKS_*`. */
  weeks: number
  /** The week the picture took the stage — the week the scenery was called for. */
  calledWeek: number
  /** Weeks of the trip already behind it, clamped to `[0, weeks]`. */
  weeksElapsed: number
  /** Weeks still to travel. 0 means the scenery is on the stage NOW. */
  weeksRemaining: number
  /** True exactly when `weeksRemaining === 0`. */
  arrived: boolean
}

// ── geometry (engine-owned; the renderer's numbers were lifted into `lot.ts` at
//     C1-M1a precisely so this kind of question never depends on presentation) ──

function isFiniteInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value)
}

/**
 * The centre cell of the body a facility works inside, or null when no body
 * stands for it.
 *
 * Two authorities, in the order the property projection reads them: the AUTHORED
 * structures (`providesFacilityIds` — the founding plant), then the PLACEMENTS
 * (everything the studio built). Law 12 governs the gap: a facility with no body
 * claims no place on the property, so it gets `null` rather than a coordinate
 * somebody made up.
 *
 * Contradictory truth is withheld too: two bodies claiming one facility name
 * neither.
 */
export function facilityBodyCentre(state: GameState, facilityId: string): LotCell | null {
  if (typeof facilityId !== 'string' || facilityId.length === 0) return null
  const property = propertyOf(state)
  const structures = Array.isArray(property.structures) ? property.structures : []
  const housing = structures.filter(
    (structure) =>
      Array.isArray(structure.providesFacilityIds) &&
      structure.providesFacilityIds.includes(facilityId),
  )
  if (housing.length > 1) return null
  const structure = housing[0]
  if (structure !== undefined) {
    const origin = structure.origin
    const footprint = structure.footprint
    if (
      origin === undefined ||
      footprint === undefined ||
      !isFiniteInteger(origin.gx) ||
      !isFiniteInteger(origin.gy) ||
      !isFiniteInteger(footprint.width) ||
      !isFiniteInteger(footprint.depth) ||
      footprint.width <= 0 ||
      footprint.depth <= 0
    ) return null
    // Half-open footprint (`[gx, gx+width)`), so the centre is floored inside it.
    return {
      gx: origin.gx + Math.floor((footprint.width - 1) / 2),
      gy: origin.gy + Math.floor((footprint.depth - 1) / 2),
    }
  }
  const placements = Array.isArray(state.placement?.facilities) ? state.placement.facilities : []
  const built = placements.filter((placed) => placed.facilityId === facilityId)
  if (built.length !== 1) return null
  const cells = built[0]!.cells
  if (!Array.isArray(cells) || cells.length === 0) return null
  let sumX = 0
  let sumY = 0
  for (const cell of cells) {
    if (!isFiniteInteger(cell.gx) || !isFiniteInteger(cell.gy)) return null
    sumX += cell.gx
    sumY += cell.gy
  }
  // Floored mean of the occupied cells — deterministic, and identical for two
  // placements with identical footprints wherever the cells were listed from.
  return { gx: Math.floor(sumX / cells.length), gy: Math.floor(sumY / cells.length) }
}

/**
 * Grid distance between two bodies: MANHATTAN, because the lot is a grid served
 * by orthogonal roads and a truck does not fly. No route is computed and no road
 * is consulted — §4.2's licence is distance, not pathfinding.
 */
export function gridDistance(a: LotCell, b: LotCell): number {
  return Math.abs(a.gx - b.gx) + Math.abs(a.gy - b.gy)
}

/**
 * The whole weeks a load-in over `distance` grid cells takes.
 *
 * BOUNDED TERM (§14 G3): the result is always an integer in
 * `[SCENERY_LOAD_IN_WEEKS_BASE, SCENERY_LOAD_IN_WEEKS_MAX]`. `Math.floor` — not
 * `round` — so a trip only costs an extra week once it has genuinely earned one,
 * which is what keeps the founding lot's own two stages supplied inside the base
 * week and reserves the cost for ground a player chose to build on.
 */
export function sceneryLoadInWeeksForDistance(distance: number): number {
  if (!Number.isFinite(distance) || distance < 0) return TUNING.SCENERY_LOAD_IN_WEEKS_BASE
  const weeks =
    TUNING.SCENERY_LOAD_IN_WEEKS_BASE +
    Math.floor(distance * TUNING.SCENERY_LOAD_IN_WEEKS_PER_DISTANCE)
  if (weeks < TUNING.SCENERY_LOAD_IN_WEEKS_BASE) return TUNING.SCENERY_LOAD_IN_WEEKS_BASE
  if (weeks > TUNING.SCENERY_LOAD_IN_WEEKS_MAX) return TUNING.SCENERY_LOAD_IN_WEEKS_MAX
  return weeks
}

/**
 * The load-in one workflow is living through this week, or a stated reason it has
 * none. NEVER throws; never guesses.
 *
 * `week` is the authoritative week being read (`market.tick`), passed in rather
 * than re-read so a tick step and a projection can agree about which week they
 * are talking about.
 */
export function sceneryLoadInFor(
  state: GameState,
  workflow: ProductionWorkflow,
  week: number,
): SceneryLoadIn | SceneryLoadInWithholding {
  if (workflow.blocker?.kind !== 'scenery-load-in') return 'not-blocked'
  const bindings = workflow.bindings as ProductionWorkflow['bindings'] | undefined
  // THE GRANDFATHER. See the header: a picture that was never required to bind a
  // set is a picture from before this law, and its load-in stays a click.
  if (bindings === undefined || bindings.requiresSetBinding !== true) return 'grandfathered'
  const stageFacilityId = bindings.stageFacilityId
  if (typeof stageFacilityId !== 'string' || stageFacilityId.length === 0) {
    return 'no-stage-reservation'
  }
  const scenery = workflow.reservations.find(
    (reservation) => reservation.capability === 'set-scenery',
  )
  if (scenery === undefined) return 'no-scenery-reservation'
  const calledWeek = bindings.heldSinceWeek
  if (!isFiniteInteger(calledWeek) || calledWeek < 0) return 'no-held-since-week'
  const to = facilityBodyCentre(state, stageFacilityId)
  if (to === null) return 'stage-has-no-body'
  const from = facilityBodyCentre(state, scenery.facilityId)
  if (from === null) return 'scenery-shop-has-no-body'
  const distance = gridDistance(from, to)
  const weeks = sceneryLoadInWeeksForDistance(distance)
  const rawElapsed = week - calledWeek
  const weeksElapsed = rawElapsed < 0 ? 0 : rawElapsed > weeks ? weeks : rawElapsed
  const weeksRemaining = weeks - weeksElapsed
  return {
    fromFacilityId: scenery.facilityId,
    toFacilityId: stageFacilityId,
    distance,
    weeks,
    calledWeek,
    weeksElapsed,
    weeksRemaining,
    arrived: weeksRemaining === 0,
  }
}

/** Narrowing helper: a derived load-in, as opposed to a stated reason there is none. */
export function isSceneryLoadIn(
  value: SceneryLoadIn | SceneryLoadInWithholding,
): value is SceneryLoadIn {
  return typeof value !== 'string'
}
