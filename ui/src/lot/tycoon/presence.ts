// ── Presence on the Lot V1 — engine presence → a place on the property ────────
//
// The engine answers "who is where, doing what, this week" (`studioPresence`, mirrored
// onto the snapshot as `LotPresenceProjection`). Its answer names an ENGINE FACILITY
// ID and a slot. This module is the one translation from that answer to a point on the
// 28×26 property, and it is the only place that translation happens.
//
// It owns NO rule. It decides no attendance, invents no location for an unauthored
// facility (law 12: an unmapped facility simply produces no stand, and the person keeps
// their home-zone parking), and advances no beat. It holds no Phaser, so every claim it
// makes is checkable in `presence.test.ts` rather than by eye.
//
// Two kinds of site exist on this property:
//   • an AUTHORED place — the nine `WORLD_PLACES` bodies, each with a `work` anchor at
//     its door and a `wait` anchor on the ground outside it;
//   • a PLACED facility — a V12 annex standing on a parcel. It has no BuildingId (the
//     neutral-receipt ruling stands; this milestone does not widen the union), so its
//     anchors are derived from the cells the engine says it occupies, and its commute
//     re-uses the authored road route to the nearest authored place.

import type {
  BuildingId,
  LotPlacedFacilityState,
  LotPresenceBeat,
  LotPresencePerson,
  LotPresenceProjection,
} from '../snapshot/StudioLotSnapshot.ts'
import {
  LOT_D,
  LOT_W,
  PLACE_BY_BUILDING,
  PRESENCE_ROUTES,
  presenceQueueSlotOffset,
  presenceSiteSlotOffset,
  type GridPoint,
  type PersonHomeRole,
} from './world.ts'

/**
 * Which authored place each FOUNDING engine facility is.
 *
 * Mirrors the accepted adapter mapping (`LOT_STAGE_BY_SOUNDSTAGE_ID`) and
 * `buildingInspector.ts`'s `BUILDING_FACILITY_IDS`. Two deliberate rulings:
 *
 *  • `facility-development-casting` is ONE physical building in the engine, and the
 *    property draws two (Development and Casting). Physical presence stands at
 *    DEVELOPMENT — the building whose sign names the work the facility exists for —
 *    while both inspector panels keep reporting that one facility's occupancy, exactly
 *    as the already-accepted slot facts do.
 *  • `facility-scenery-shop` and `facility-post-building` are both the Scenery & Post
 *    body, which is what the world already calls that place.
 */
export const PRESENCE_FACILITY_PLACE: Readonly<Record<string, BuildingId>> = {
  'facility-development-casting': 'writers',
  'facility-development-casting-annex': 'expansion',
  'facility-soundstage-07': 'stage-a',
  'facility-soundstage-12': 'stage-b',
  'facility-post-building': 'post',
  'facility-scenery-shop': 'post',
}

/** The legacy fixed Annex parcel, which the `expansion` place already owns. */
const LEGACY_ANNEX_PARCEL = 'expansion'

/** How far outside a placed facility's front face its workers stand, in tiles. */
const PLACED_WORK_STANDOFF = 1.6
/** How far outside that again its queue forms. */
const PLACED_WAIT_STANDOFF = 2.1

export type PresenceSite =
  | {
      kind: 'place'
      buildingId: BuildingId
      /** The authored place whose road route this site's commute uses. */
      routeTo: BuildingId
      work: GridPoint
      wait: GridPoint
    }
  | {
      kind: 'placed'
      placedId: number
      routeTo: BuildingId
      work: GridPoint
      wait: GridPoint
    }

/** What the world does with one person at one beat. */
export type PresenceStance = 'home' | 'at-site' | 'waiting'

export type PresenceStand = {
  talentId: string
  stance: PresenceStance
  /** Null when the week carries no workplace claim (roster), or the site is unmapped. */
  site: PresenceSite | null
  /** Where the person stands at the site, including their co-location offset. */
  destination: GridPoint | null
  /** Home → destination, inclusive of both ends. One point when they never leave. */
  path: readonly GridPoint[]
  /** The engine's own beat array for this person, carried verbatim. */
  beats: readonly LotPresenceBeat[]
  blockedReason: string | null
}

/** What the scene knows about one rendered person that presence does not. */
export type PresencePersonHome = { role: PersonHomeRole; home: GridPoint }

function clampToLot(point: GridPoint): GridPoint {
  return {
    gx: Math.min(LOT_W, Math.max(0, point.gx)),
    gy: Math.min(LOT_D, Math.max(0, point.gy)),
  }
}

function placeAnchor(buildingId: BuildingId, key: 'work' | 'wait'): GridPoint {
  const place = PLACE_BY_BUILDING[buildingId]
  const anchor = place.anchors[key] ?? place.anchors.entry ?? { gx: place.gx, gy: place.gy }
  return { gx: anchor.gx, gy: anchor.gy }
}

/** Which authored place a free-standing point is nearest to, by its `work` anchor. */
function nearestAuthoredPlace(at: GridPoint): BuildingId {
  let best: BuildingId = 'admin'
  let bestDistance = Number.POSITIVE_INFINITY
  // Fixed iteration order: the map's own key order, which is the authored place order.
  for (const buildingId of Object.keys(PRESENCE_FACILITY_PLACE).map(
    (facilityId) => PRESENCE_FACILITY_PLACE[facilityId]!,
  )) {
    const anchor = placeAnchor(buildingId, 'work')
    const distance = (anchor.gx - at.gx) ** 2 + (anchor.gy - at.gy) ** 2
    if (distance < bestDistance) {
      bestDistance = distance
      best = buildingId
    }
  }
  return best
}

function placedSite(placed: LotPlacedFacilityState): PresenceSite | null {
  if (!Array.isArray(placed.cells) || placed.cells.length === 0) return null
  let x0 = placed.cells[0]!.gx
  let y0 = placed.cells[0]!.gy
  let x1 = x0
  let y1 = y0
  for (const cell of placed.cells) {
    if (!Number.isFinite(cell.gx) || !Number.isFinite(cell.gy)) return null
    if (cell.gx < x0) x0 = cell.gx
    if (cell.gy < y0) y0 = cell.gy
    if (cell.gx > x1) x1 = cell.gx
    if (cell.gy > y1) y1 = cell.gy
  }
  const centreGx = (x0 + x1 + 1) / 2
  const work = clampToLot({ gx: centreGx, gy: y1 + PLACED_WORK_STANDOFF })
  const wait = clampToLot({ gx: centreGx + 1.4, gy: y1 + PLACED_WAIT_STANDOFF })
  return { kind: 'placed', placedId: placed.id, routeTo: nearestAuthoredPlace(work), work, wait }
}

/**
 * The world site one ENGINE facility id is, or null when nothing authored answers for
 * it. A null site is an honest "this facility has no body on the property yet" — the
 * person keeps their home-zone parking and claims no place (law 12).
 */
export function resolvePresenceSite(
  facilityId: string,
  placements: readonly LotPlacedFacilityState[],
): PresenceSite | null {
  const placed = placements.filter((candidate) => candidate.facilityId === facilityId)
  if (placed.length === 1) {
    const only = placed[0]!
    // The legacy fixed parcel IS the authored `expansion` place, which paints its own
    // lifecycle; a second body there would be two owners for one piece of ground.
    if (only.parcelId !== LEGACY_ANNEX_PARCEL) return placedSite(only)
  }
  // More than one placement claiming one facility id is contradictory truth: withhold.
  if (placed.length > 1) return null
  const buildingId = PRESENCE_FACILITY_PLACE[facilityId]
  if (buildingId === undefined) return null
  return {
    kind: 'place',
    buildingId,
    routeTo: buildingId,
    work: placeAnchor(buildingId, 'work'),
    wait: placeAnchor(buildingId, 'wait'),
  }
}

/** The stance one beat of the engine's array puts a person in. */
export function stanceForBeat(beat: LotPresenceBeat | undefined): PresenceStance {
  return beat === 'at-site' ? 'at-site' : beat === 'waiting' ? 'waiting' : 'home'
}

/**
 * The presentation commute for one person: home → authored road route → the exact
 * point they stand on. A site with no authored route (only reachable when a placement's
 * nearest place has no route entry) degrades to a straight two-point approach rather
 * than inventing road geometry.
 */
export function presencePath(
  role: PersonHomeRole,
  home: GridPoint,
  site: PresenceSite,
  destination: GridPoint,
): GridPoint[] {
  const interior = PRESENCE_ROUTES[role][site.routeTo] ?? []
  return [home, ...interior.map((point) => ({ gx: point.gx, gy: point.gy })), destination]
}

function siteKey(site: PresenceSite): string {
  return site.kind === 'place' ? `place:${site.buildingId}` : `placed:${String(site.placedId)}`
}

/**
 * Every rendered person's stand for one beat of the current week.
 *
 * Deterministic in every respect: presence people arrive already sorted by talentId
 * from the engine, co-location indices are assigned in that same fixed order, and no
 * RNG is consumed here at all.
 */
export function presenceStands(
  presence: LotPresenceProjection | null | undefined,
  placements: readonly LotPlacedFacilityState[],
  people: ReadonlyMap<string, PresencePersonHome>,
  beat: number,
): PresenceStand[] {
  if (presence === null || presence === undefined || !Array.isArray(presence.people)) return []
  const stands: PresenceStand[] = []
  const workIndex = new Map<string, number>()
  const queueIndex = new Map<string, number>()

  for (const person of presence.people) {
    const known = people.get(person.talentId)
    if (known === undefined) continue
    const beats = Array.isArray(person.beats) ? person.beats : []
    const stance = stanceForBeat(beats[beat])
    const site =
      person.facilityId === null ? null : resolvePresenceSite(person.facilityId, placements)

    if (site === null || stance === 'home') {
      stands.push({
        talentId: person.talentId,
        stance: 'home',
        site,
        destination: null,
        path: [known.home],
        beats,
        blockedReason: person.blockedReason,
      })
      continue
    }

    const key = siteKey(site)
    const counter = stance === 'waiting' ? queueIndex : workIndex
    const index = counter.get(key) ?? 0
    counter.set(key, index + 1)
    const anchor = stance === 'waiting' ? site.wait : site.work
    const offset =
      stance === 'waiting' ? presenceQueueSlotOffset(index) : presenceSiteSlotOffset(index)
    const destination = clampToLot({ gx: anchor.gx + offset.gx, gy: anchor.gy + offset.gy })
    stands.push({
      talentId: person.talentId,
      stance,
      site,
      destination,
      path: presencePath(known.role, known.home, site, destination),
      beats,
      blockedReason: person.blockedReason,
    })
  }
  return stands
}

/**
 * How many people the engine says are AT each site this week — the number the facility
 * label chrome prints. It counts presence, not sprites: a casting-slate candidate the
 * studio has not contracted is genuinely in the building even though the lot draws no
 * body for them, and the count would be a lie if it said otherwise.
 */
export function presenceOccupantCounts(
  presence: LotPresenceProjection | null | undefined,
  placements: readonly LotPlacedFacilityState[],
): { byBuilding: Map<BuildingId, number>; byPlacement: Map<number, number> } {
  const byBuilding = new Map<BuildingId, number>()
  const byPlacement = new Map<number, number>()
  if (presence === null || presence === undefined || !Array.isArray(presence.people)) {
    return { byBuilding, byPlacement }
  }
  const beat = Number.isInteger(presence.staticBeat) ? presence.staticBeat : 0
  for (const person of presence.people) {
    if (person.facilityId === null) continue
    if (stanceForBeat(person.beats?.[beat]) !== 'at-site') continue
    const site = resolvePresenceSite(person.facilityId, placements)
    if (site === null) continue
    if (site.kind === 'place') {
      byBuilding.set(site.buildingId, (byBuilding.get(site.buildingId) ?? 0) + 1)
    } else {
      byPlacement.set(site.placedId, (byPlacement.get(site.placedId) ?? 0) + 1)
    }
  }
  return { byBuilding, byPlacement }
}

/** Every person the engine has queued outside a site this week, in engine order. */
export function presenceWaiting(
  presence: LotPresenceProjection | null | undefined,
): LotPresencePerson[] {
  if (presence === null || presence === undefined || !Array.isArray(presence.people)) return []
  const beat = Number.isInteger(presence.staticBeat) ? presence.staticBeat : 0
  return presence.people.filter((person) => stanceForBeat(person.beats?.[beat]) === 'waiting')
}
