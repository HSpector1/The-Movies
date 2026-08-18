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
//   • an AUTHORED place — one of the composed authored bodies, each with a `work` anchor
//     at its door and a `wait` anchor on the ground outside it. Since C1-M1b those doors
//     are re-expressed from the ENGINE's own origin for the body, not from a hard-coded
//     footprint, so a body the engine puts somewhere else takes its door with it;
//   • a PLACED facility — a facility the studio built. Since C1-M1b it is a first-class
//     world citizen with its own `BuildingId` (`placed-<placementId>`), and its anchors
//     come from its BLUEPRINT's presentation template rather than from arithmetic
//     invented here. Its commute re-uses the authored road route to the nearest
//     authored place.

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
  PRESENCE_ROUTES,
  placedAnchors,
  presenceQueueSlotOffset,
  presenceSiteSlotOffset,
  type GridPoint,
  type PersonHomeRole,
} from './world.ts'
import { INITIAL_WORLD_BUILDINGS, worldBuildingById, type WorldBuilding } from './buildings.ts'

/**
 * Which authored place each FOUNDING engine facility is.
 *
 * FOUNDING only, and it must never grow a third soundstage row (C2a-M2 §3.1). A facility
 * the studio BUILT is answered before this table is ever consulted, by `placedSite()`,
 * off the engine's own cell list and its blueprint's anchor template — which is why a
 * third, fourth and fifth soundstage already stand their crews at their own doors while
 * this table still names exactly the six bodies a studio is founded with.
 *
 * Two deliberate rulings:
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

/**
 * One authored body's named ground anchor, from the COMPOSED world.
 *
 * `buildings` is the world the scene actually painted. Absent, it falls back to the
 * authored Week-0 composition — the same compatibility seam a snapshot with no property
 * projection gets, and the reason every retained caller keeps working unchanged.
 */
function placeAnchor(
  buildingId: BuildingId,
  key: 'work' | 'wait',
  buildings: readonly WorldBuilding[],
): GridPoint | null {
  const place = worldBuildingById(buildings, buildingId)
  if (place === null) return null
  const anchor = place.anchors[key] ?? place.anchors.entry ?? { gx: place.gx, gy: place.gy }
  return { gx: anchor.gx, gy: anchor.gy }
}

/** Which authored place a free-standing point is nearest to, by its `work` anchor. */
function nearestAuthoredPlace(at: GridPoint, buildings: readonly WorldBuilding[]): BuildingId {
  let best: BuildingId = 'admin'
  let bestDistance = Number.POSITIVE_INFINITY
  // Fixed iteration order: the map's own key order, which is the authored place order.
  for (const buildingId of Object.keys(PRESENCE_FACILITY_PLACE).map(
    (facilityId) => PRESENCE_FACILITY_PLACE[facilityId]!,
  )) {
    const anchor = placeAnchor(buildingId, 'work', buildings)
    if (anchor === null) continue
    const distance = (anchor.gx - at.gx) ** 2 + (anchor.gy - at.gy) ** 2
    if (distance < bestDistance) {
      bestDistance = distance
      best = buildingId
    }
  }
  return best
}

/**
 * The site one PLACED facility is, dressed by its own blueprint's anchor template.
 *
 * The footprint is the extent of the cells the ENGINE says it occupies, so a facility of
 * any size on any parcel resolves — nothing here assumes an annex, a single placement,
 * or a first-placement-only world.
 */
function placedSite(
  placed: LotPlacedFacilityState,
  buildings: readonly WorldBuilding[],
): PresenceSite | null {
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
  const anchors = placedAnchors(
    { gx: x0, gy: y0 },
    { width: x1 - x0 + 1, depth: y1 - y0 + 1 },
    placed.blueprintId,
    // A stage's crew stand at a stage's door. The class template answers for a body
    // whose blueprint carries no authored art of its own (C2a-M2 §3.1).
    placed.capability,
  )
  const work = clampToLot(anchors.work ?? { gx: x0, gy: y1 })
  const wait = clampToLot(anchors.wait ?? work)
  return {
    kind: 'placed',
    placedId: placed.id,
    routeTo: nearestAuthoredPlace(work, buildings),
    work,
    wait,
  }
}

/**
 * The world site one ENGINE facility id is, or null when nothing authored answers for
 * it. A null site is an honest "this facility has no body on the property yet" — the
 * person keeps their home-zone parking and claims no place (law 12).
 */
export function resolvePresenceSite(
  facilityId: string,
  placements: readonly LotPlacedFacilityState[],
  buildings: readonly WorldBuilding[] = INITIAL_WORLD_BUILDINGS,
): PresenceSite | null {
  const placed = placements.filter((candidate) => candidate.facilityId === facilityId)
  if (placed.length === 1) {
    const only = placed[0]!
    // The legacy fixed parcel IS the authored `expansion` place, which paints its own
    // lifecycle; a second body there would be two owners for one piece of ground.
    if (only.parcelId !== LEGACY_ANNEX_PARCEL) return placedSite(only, buildings)
  }
  // More than one placement claiming one facility id is contradictory truth: withhold.
  if (placed.length > 1) return null
  const buildingId = PRESENCE_FACILITY_PLACE[facilityId]
  if (buildingId === undefined) return null
  const work = placeAnchor(buildingId, 'work', buildings)
  const wait = placeAnchor(buildingId, 'wait', buildings)
  // A facility whose body is not standing on this property claims no site at all.
  if (work === null || wait === null) return null
  return { kind: 'place', buildingId, routeTo: buildingId, work, wait }
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
  buildings: readonly WorldBuilding[] = INITIAL_WORLD_BUILDINGS,
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
      person.facilityId === null
        ? null
        : resolvePresenceSite(person.facilityId, placements, buildings)

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
  buildings: readonly WorldBuilding[] = INITIAL_WORLD_BUILDINGS,
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
    const site = resolvePresenceSite(person.facilityId, placements, buildings)
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
