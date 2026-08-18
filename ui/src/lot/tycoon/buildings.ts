// ── The composed world (C1-M1b) — WHICH buildings exist, and WHERE ────────────
//
// One join, in one place: GEOMETRY from the engine (`snapshot.property`, the engine's
// own `state.property.structures` plus the facilities the studio built) meets
// PRESENTATION from `./world.ts` (texture, sign, ground anchors, place vocabulary).
//
// Before this module the renderer's `WORLD_PLACES` decided which buildings existed. It
// was a closed set of nine, hand-duplicated against `src/core/lot.ts`, and it is the
// reason a facility a player built had no identity in the world: no id, no hit area, no
// inspector, no presence anchor, no receipt. The property is state now, so the world's
// building set is state too.
//
// This module owns NO rule. It decides no legality, no status and no attention; it
// reads what the engine published and dresses it. It holds no Phaser, so every claim it
// makes is checkable in `buildings.test.ts` rather than by eye.
//
// THREE KINDS of body come out of it, and the difference is load-bearing:
//
//   • `landmark` / `founding` — the eight authored bodies. Ids verbatim, presentation
//     keyed by those same ids, anchors re-expressed from their surveyed datum;
//   • `parcel` — the legacy Annex parcel, `expansion`. The engine records NO structure
//     there (it is graded open ground until something completes on it), so the marked
//     pad is presentation-owned and every accepted Annex spec keeps addressing it by
//     exactly that id;
//   • `placed` — a facility the studio built, addressed as `placed-<placementId>`, with
//     its blueprint's presentation template. The ONE exception is a placement standing
//     ON the legacy parcel: that IS the Annex, `expansion` already owns that ground and
//     paints its own lifecycle, and a second body there would be two owners for one
//     piece of ground (shift law 10).

import type {
  BuildingId,
  LotWorldBuilding,
  LotWorldBuildingRole,
  StudioLotSnapshot,
} from '../snapshot/StudioLotSnapshot.ts'
import { placedFacilityIdOf } from '../snapshot/StudioLotSnapshot.ts'
import {
  LEGACY_EXPANSION_PRESENTATION,
  LOT_D,
  LOT_W,
  PRESENTATION_BY_BUILDING,
  WORLD_PLACES,
  anchorsAt,
  blueprintPresentation,
  placedAnchors,
  type GridPoint,
  type WorldPlace,
} from './world.ts'

/** The legacy Annex parcel id, in both the engine's parcel map and the world. */
export const LEGACY_ANNEX_PARCEL_ID = 'expansion'

/** One fully composed body: everything the scene needs to paint and address it. */
export type WorldBuilding = WorldPlace & {
  role: LotWorldBuildingRole
  /** Which `LotPlacedFacilityState` this body is, or null for an authored place. */
  placedFacilityId: number | null
  /** Which blueprint's presentation it wears, or null for an authored place. */
  blueprintId: string | null
  /**
   * What a placed body IS, in the engine's own capability term, or null for an authored
   * place. A body with no authored art of its own is dressed by its CLASS from this
   * (C2a-M2 §3.1) — one procedural soundstage serves every soundstage a studio builds.
   */
  capability: string | null
  /** Whether a body stands here yet. `null` for an authored place, which always does. */
  status: 'underConstruction' | 'operational' | null
}

/** The addressable grid the snapshot describes, or the initial property's bounds. */
export function worldBounds(snapshot: StudioLotSnapshot | null | undefined): {
  width: number
  depth: number
} {
  const bounds = snapshot?.property?.bounds
  if (
    typeof bounds?.width === 'number' &&
    typeof bounds.depth === 'number' &&
    Number.isInteger(bounds.width) &&
    Number.isInteger(bounds.depth) &&
    bounds.width > 0 &&
    bounds.depth > 0
  ) {
    return { width: bounds.width, depth: bounds.depth }
  }
  return { width: LOT_W, depth: LOT_D }
}

function isFiniteInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value)
}

/** One engine building record, validated before anything is composed from it. */
function exactWorldBuilding(value: unknown): LotWorldBuilding | null {
  if (typeof value !== 'object' || value === null) return null
  const building = value as Partial<LotWorldBuilding>
  if (typeof building.id !== 'string' || building.id.trim().length === 0) return null
  if (typeof building.label !== 'string' || building.label.trim().length === 0) return null
  const role = building.role
  if (role !== 'landmark' && role !== 'founding' && role !== 'parcel' && role !== 'placed') {
    return null
  }
  if (!isFiniteInteger(building.origin?.gx) || !isFiniteInteger(building.origin.gy)) return null
  if (!isFiniteInteger(building.footprint?.width) || !isFiniteInteger(building.footprint.depth)) {
    return null
  }
  if (building.footprint.width <= 0 || building.footprint.depth <= 0) return null
  return building as LotWorldBuilding
}

/** The composed body for one engine record, dressed by its own presentation. */
function composeOne(record: LotWorldBuilding): WorldBuilding | null {
  if (record.role === 'placed') {
    const placedId = record.placedFacilityId ?? placedFacilityIdOf(record.id)
    if (placedId === null) return null
    const blueprintId = record.blueprintId ?? null
    const capability = record.capability ?? null
    const origin: GridPoint = { gx: record.origin.gx, gy: record.origin.gy }
    return {
      buildingId: record.id,
      // A placed facility has no Operation Hollywood place vocabulary to mirror: it did
      // not exist when that vocabulary was written. Its own world id IS its place id.
      placeId: record.id,
      label: record.label.toUpperCase(),
      texKey: blueprintPresentation(blueprintId, capability).texKey,
      gx: origin.gx,
      gy: origin.gy,
      fw: record.footprint.width,
      fd: record.footprint.depth,
      anchors: placedAnchors(origin, record.footprint, blueprintId, capability),
      role: 'placed',
      placedFacilityId: placedId,
      blueprintId,
      capability,
      status: record.status ?? 'underConstruction',
    }
  }

  // An authored body the renderer has never been taught to draw is not drawn: borrowing
  // another building's presentation would be a lie about what stands there.
  const presentation = PRESENTATION_BY_BUILDING[record.id]
  if (presentation === undefined) return null
  const origin: GridPoint = { gx: record.origin.gx, gy: record.origin.gy }
  return {
    buildingId: record.id,
    placeId: presentation.placeId,
    label: presentation.label,
    texKey: presentation.texKey,
    gx: origin.gx,
    gy: origin.gy,
    fw: record.footprint.width,
    fd: record.footprint.depth,
    anchors: anchorsAt(presentation, origin),
    role: record.role,
    placedFacilityId: null,
    blueprintId: null,
    capability: null,
    status: null,
  }
}

/** The legacy Annex parcel, composed straight from its retained presentation. */
function legacyExpansionBuilding(): WorldBuilding {
  const presentation = LEGACY_EXPANSION_PRESENTATION
  return {
    buildingId: presentation.buildingId,
    placeId: presentation.placeId,
    label: presentation.label,
    texKey: presentation.texKey,
    gx: presentation.surveyedAt.gx,
    gy: presentation.surveyedAt.gy,
    fw: presentation.fallbackFootprint.fw,
    fd: presentation.fallbackFootprint.fd,
    anchors: presentation.anchors,
    role: 'parcel',
    placedFacilityId: null,
    blueprintId: null,
    capability: null,
    status: null,
  }
}

/**
 * THE AUTHORED WEEK-0 COMPOSITION, as `WorldBuilding`s.
 *
 * What a snapshot with no property projection composes to — the older hand-authored
 * presentation fixtures, and the same compatibility seam the engine's own
 * `propertyOf(state)` fallback provides for a property-less state.
 */
export const INITIAL_WORLD_BUILDINGS: readonly WorldBuilding[] = WORLD_PLACES.map((place) => ({
  ...place,
  role: place.buildingId === LEGACY_ANNEX_PARCEL_ID ? ('parcel' as const) : ('founding' as const),
  placedFacilityId: null,
  blueprintId: null,
  capability: null,
  status: null,
}))

/**
 * Every body standing on the property this snapshot describes, in PAINT ORDER.
 *
 * The order is presentation, not engine order: the authored bodies come first in the
 * reading order `world.ts` composes them in (back of the screen to front), then the
 * legacy Annex parcel, then placed facilities by ascending placement id. The ground
 * bake and the building pass both walk it, so pinning it here is what keeps a Week-0
 * repaint byte-identical to the pre-M1b world.
 *
 * A record the snapshot cannot account for produces NO body at all — never a guessed
 * one. That is the same fail-neutral discipline every other lot projection holds.
 */
export function composeWorldBuildings(
  snapshot: StudioLotSnapshot | null | undefined,
): WorldBuilding[] {
  const records = snapshot?.property?.buildings
  if (!Array.isArray(records)) return [...INITIAL_WORLD_BUILDINGS]

  const authored: WorldBuilding[] = []
  const placed: { order: number; building: WorldBuilding }[] = []
  const seen = new Set<BuildingId>()
  for (const record of records) {
    const exact = exactWorldBuilding(record)
    if (exact === null) continue
    // Two bodies claiming one id is contradictory truth: the copies can disagree about
    // where they stand and nothing here can adjudicate them. Keep neither.
    if (seen.has(exact.id)) continue
    seen.add(exact.id)
    const composed = composeOne(exact)
    if (composed === null) continue
    if (composed.role === 'placed') {
      placed.push({ order: composed.placedFacilityId ?? 0, building: composed })
    } else {
      authored.push(composed)
    }
  }
  const duplicated = new Set(
    records
      .map((record) => (typeof record === 'object' && record !== null ? record.id : null))
      .filter((id, index, all): id is BuildingId => id !== null && all.indexOf(id) !== index),
  )
  const ordered = authored
    .filter((building) => !duplicated.has(building.buildingId))
    .sort((a, b) => presentationOrder(a.buildingId) - presentationOrder(b.buildingId))

  return [
    ...ordered,
    legacyExpansionBuilding(),
    ...placed
      .filter(({ building }) => !duplicated.has(building.buildingId))
      .sort((a, b) => a.order - b.order)
      .map(({ building }) => building),
  ]
}

/** Where one authored id sits in the renderer's own back-to-front reading order. */
function presentationOrder(id: BuildingId): number {
  const index = WORLD_PLACES.findIndex((place) => place.buildingId === id)
  // An authored body with no presentation never reaches here (`composeOne` refuses it),
  // so this is belt-and-braces: an unknown id sorts last rather than in front of the lot.
  return index < 0 ? WORLD_PLACES.length : index
}

/** One composed body by id, or null. Never assumes the founding nine (C1-M1b). */
export function worldBuildingById(
  buildings: readonly WorldBuilding[],
  id: BuildingId,
): WorldBuilding | null {
  const matches = buildings.filter((building) => building.buildingId === id)
  return matches.length === 1 ? matches[0]! : null
}

/** One composed body by its Hollywood place id, or null. */
export function worldBuildingByPlaceId(
  buildings: readonly WorldBuilding[],
  placeId: string,
): WorldBuilding | null {
  const matches = buildings.filter((building) => building.placeId === placeId)
  return matches.length === 1 ? matches[0]! : null
}
