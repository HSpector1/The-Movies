// ── Tycoon world PRESENTATION — how the studio property looks ─────────────────
//
// The Operation Hollywood plate is one painted 1586×992 corner with five polygon
// hotspots; there is no more world behind it. This module is the replacement: a
// 28×26 isometric tile property carrying every addressable place as a real physical
// footprint with real ground zoning around it.
//
// C1-M1b — WHAT STANDS HERE IS NO LONGER THIS FILE'S DECISION.
//
// Through M1a the tables below were the authority for which buildings existed and
// where they stood: nine hand-authored footprints, a closed set, duplicated by hand
// against `src/core/lot.ts`. The ENGINE now owns that geometry (`state.property`,
// C1-M1a) and the snapshot carries it (`LotPropertyProjection`), so this module keeps
// only PRESENTATION — texture keys, ground anchors, painted signage, ground zoning,
// landscaping, routes, camera framings — keyed by the engine's own structure ids, plus
// per-BLUEPRINT templates for the facilities a studio builds. `../tycoon/buildings.ts`
// composes the two, and the scene paints what it composes.
//
// Two kinds of geometry remain here, and both are deliberate:
//
//   • `surveyedAt` — the origin each anchor set was surveyed against. Anchors are
//     absolute grid points ("the door of Development is at gx 4.5, gy 4.5"), so they
//     need a datum to be re-expressible when a body stands somewhere else. It is not a
//     claim about where the building IS; the snapshot answers that;
//   • `fallbackFootprint` — what a place occupies when a snapshot carries NO property
//     projection at all. That is the older hand-authored fixtures, and it is the same
//     compatibility seam the engine's own `propertyOf(state)` fallback provides.
//
// Grid convention (see ../scene/iso.ts): +gx runs down-right on screen, +gy runs
// down-left. A footprint at origin (gx, gy) with size fw × fd occupies the tiles
// [gx, gx+fw) × [gy, gy+fd); its four ground corners are the back (gx,gy), right
// (gx+fw,gy), front (gx+fw,gy+fd) and left (gx,gy+fd) corners.
//
// This file holds NO Phaser and NO snapshot logic — it is data the scene paints, so
// it stays unit-testable and cheap to reason about.

import type { BuildingId } from '../snapshot/StudioLotSnapshot'

/**
 * The INITIAL property's bounds. `28×26 is where a studio STARTS` (campaign law), so
 * these are the fallback a property-less snapshot gets, never a cap: the scene reads
 * `snapshot.property.bounds` whenever the projection is present.
 */
export const LOT_W = 28 // tiles along gx
export const LOT_D = 26 // tiles along gy

export type Rect = { x0: number; y0: number; x1: number; y1: number }
export type GridPoint = { gx: number; gy: number }

/** Ground zoning kinds — texture keys baked by ./assets.ts, in paint order. */
export type GroundKind =
  | 'tw-t-lawn'
  | 'tw-t-lawn2'
  | 'tw-t-lawn-dry'
  | 'tw-t-dirt'
  | 'tw-t-gravel'
  | 'tw-t-plaza'
  | 'tw-t-path'
  | 'tw-t-apron'
  | 'tw-t-road'
  | 'tw-t-road-line'

/**
 * One addressable place in the world, FULLY COMPOSED: presentation from this module,
 * geometry from the engine. `../tycoon/buildings.ts` builds these per snapshot.
 *
 * `placeId` mirrors the Operation Hollywood place vocabulary wherever an exact
 * semantic already exists (stage-7 / publicity / studio-gate / annex-parcel), so
 * host code that keys on those identities keeps working unchanged.
 */
export type WorldPlace = {
  buildingId: BuildingId
  placeId: string
  /** Canvas label — the sign painted on the building. */
  label: string
  /** Texture key, or '' for a marked open parcel with no building. */
  texKey: string
  gx: number
  gy: number
  fw: number
  fd: number
  /** Named ground anchors in grid space. */
  anchors: Record<string, GridPoint>
}

/**
 * How ONE authored place is PRESENTED — keyed by the engine's own structure id.
 *
 * This is the whole of what M1b leaves this module deciding about a body: what it is
 * made of, what its sign says, and where its named ground anchors are. Everything about
 * WHERE it stands now arrives on the snapshot.
 */
export type PlacePresentation = {
  buildingId: BuildingId
  placeId: string
  /** Canvas label — the sign painted on the building. */
  label: string
  /** Texture key, or '' for a marked open parcel with no building. */
  texKey: string
  /**
   * The origin these anchors were surveyed against. NOT a claim about where the body
   * stands: it is the datum the absolute anchor points below are measured from, so the
   * same door can be re-expressed for a body the engine places somewhere else.
   */
  surveyedAt: GridPoint
  /** What this place occupies when a snapshot carries no property projection at all. */
  fallbackFootprint: { fw: number; fd: number }
  /** Named ground anchors, in grid space, at `surveyedAt`. */
  anchors: Record<string, GridPoint>
}

/**
 * Re-express one presentation's anchors for a body standing at `origin`.
 *
 * A body at its surveyed origin gets its authored points back BIT FOR BIT (the deltas
 * are exactly zero and `x + 0 === x`), which is what keeps the Week-0 world identical
 * to the pre-M1b one. A body anywhere else gets the same doors, translated.
 */
export function anchorsAt(
  presentation: PlacePresentation,
  origin: GridPoint,
): Record<string, GridPoint> {
  const dgx = origin.gx - presentation.surveyedAt.gx
  const dgy = origin.gy - presentation.surveyedAt.gy
  const anchors: Record<string, GridPoint> = {}
  for (const [name, point] of Object.entries(presentation.anchors)) {
    anchors[name] = { gx: point.gx + dgx, gy: point.gy + dgy }
  }
  return anchors
}

/**
 * Physical stage identity. The Hollywood plate names its one stage "Stage 7"; the
 * second engine stage (`stage-b`) has never had a body. Both exist here, and both
 * carry the sign the plate established.
 */
export const STAGE_SIGN: Record<'stage-a' | 'stage-b', string> = {
  'stage-a': 'STAGE 7',
  'stage-b': 'STAGE 12',
}

export const ANNEX_PLACE_ID = 'annex-parcel'
export const SERVICE_YARD_PLACE_ID = 'service-yard'
export const STAGE_7_PLACE_ID = 'stage-7'
export const PUBLICITY_PLACE_ID = 'publicity'
export const GATE_PLACE_ID = 'studio-gate'

/**
 * The nine addressable places, PRESENTED.
 *
 * Composition, reading the screen from back (top) to front (bottom):
 *   • back-left     Development (writers) and, below it, Casting / Talent
 *   • back-centre   Administration & Publicity, the deco tower on the forecourt
 *   • back-right    Stage 7 and Stage 12, a two-stage row off the stage road
 *   • right         the Scenery & Service yard, feeding both stages
 *   • front-left    the Theater
 *   • front-centre  the Annex expansion parcel, on the boulevard
 *   • front         the Studio Gate at the end of the boulevard
 *
 * The ORDER is presentation too: it is the reading order the ground bake and the
 * building pass walk, so it is preserved here rather than taken from the engine's own
 * structure order (C1-M1b).
 */
const AUTHORED_PLACES: readonly PlacePresentation[] = [
  {
    buildingId: 'admin',
    placeId: PUBLICITY_PLACE_ID,
    label: 'ADMINISTRATION',
    texKey: 'tw-admin',
    surveyedAt: { gx: 9, gy: 2 },
    fallbackFootprint: { fw: 3, fd: 3 },
    anchors: {
      entry: { gx: 10.5, gy: 5.6 },
      photocall: { gx: 9.4, gy: 6.1 },
      queue: { gx: 11.6, gy: 5.9 },
      work: { gx: 10.5, gy: 5.7 },
      wait: { gx: 10.5, gy: 6.7 },
    },
  },
  {
    buildingId: 'writers',
    placeId: 'development',
    label: 'DEVELOPMENT',
    texKey: 'tw-writers',
    surveyedAt: { gx: 3, gy: 2 },
    fallbackFootprint: { fw: 3, fd: 2 },
    anchors: {
      entry: { gx: 4.5, gy: 4.6 },
      work: { gx: 4.5, gy: 4.5 },
      wait: { gx: 4.6, gy: 5.7 },
    },
  },
  {
    buildingId: 'casting',
    placeId: 'casting-office',
    label: 'CASTING',
    texKey: 'tw-casting',
    surveyedAt: { gx: 3, gy: 9 },
    fallbackFootprint: { fw: 3, fd: 2 },
    anchors: {
      entry: { gx: 4.5, gy: 11.6 },
      queue: { gx: 6.1, gy: 11.9 },
      work: { gx: 4.5, gy: 11.5 },
      wait: { gx: 4.7, gy: 12.6 },
    },
  },
  {
    buildingId: 'stage-a',
    placeId: STAGE_7_PLACE_ID,
    label: STAGE_SIGN['stage-a'],
    texKey: 'tw-stage-a',
    surveyedAt: { gx: 17, gy: 2 },
    fallbackFootprint: { fw: 4, fd: 4 },
    anchors: {
      entry: { gx: 19, gy: 6.4 },
      crewCall: { gx: 20.4, gy: 6.9 },
      camera: { gx: 21.4, gy: 7.1 },
      service: { gx: 17.6, gy: 6.5 },
      lamp: { gx: 17.1, gy: 6.05 },
      work: { gx: 19.0, gy: 6.5 },
      wait: { gx: 20.6, gy: 6.8 },
    },
  },
  {
    buildingId: 'stage-b',
    placeId: 'stage-12',
    label: STAGE_SIGN['stage-b'],
    texKey: 'tw-stage-b',
    surveyedAt: { gx: 17, gy: 9 },
    fallbackFootprint: { fw: 4, fd: 4 },
    anchors: {
      entry: { gx: 19, gy: 13.4 },
      crewCall: { gx: 20.4, gy: 13.9 },
      lamp: { gx: 17.1, gy: 13.05 },
      work: { gx: 19.0, gy: 13.5 },
      wait: { gx: 20.6, gy: 13.8 },
    },
  },
  {
    buildingId: 'post',
    placeId: SERVICE_YARD_PLACE_ID,
    label: 'SCENERY & POST',
    texKey: 'tw-post',
    surveyedAt: { gx: 18, gy: 18 },
    fallbackFootprint: { fw: 3, fd: 2 },
    anchors: {
      entry: { gx: 19.5, gy: 20.6 },
      truck: { gx: 23.4, gy: 17.4 },
      sceneryRack: { gx: 24.6, gy: 15.2 },
      loadIn: { gx: 22.2, gy: 16.2 },
      work: { gx: 19.5, gy: 20.5 },
      wait: { gx: 21.0, gy: 20.4 },
    },
  },
  {
    buildingId: 'theater',
    placeId: 'theater',
    label: 'THEATER',
    texKey: 'tw-theater',
    surveyedAt: { gx: 3, gy: 16 },
    fallbackFootprint: { fw: 3, fd: 2 },
    anchors: {
      entry: { gx: 4.5, gy: 18.6 },
      work: { gx: 4.5, gy: 18.5 },
      wait: { gx: 5.9, gy: 18.8 },
    },
  },
  {
    buildingId: 'gate',
    placeId: GATE_PLACE_ID,
    label: 'STUDIO GATE',
    // The arch straddles the boulevard: three tiles across gx, one deep in gy, so the
    // road (gx 9-10) passes under it exactly as an entrance should.
    texKey: 'tw-gate',
    surveyedAt: { gx: 8, gy: 23 },
    fallbackFootprint: { fw: 3, fd: 1 },
    anchors: {
      guard: { gx: 11.1, gy: 23.7 },
      arrival: { gx: 9.9, gy: 24.7 },
      inside: { gx: 9.9, gy: 21.8 },
      work: { gx: 11.1, gy: 23.7 },
      wait: { gx: 9.9, gy: 24.7 },
    },
  },
  {
    buildingId: 'expansion',
    placeId: ANNEX_PLACE_ID,
    label: 'ANNEX PARCEL',
    texKey: '', // a marked open parcel until construction completes
    surveyedAt: { gx: 7, gy: 15 },
    fallbackFootprint: { fw: 4, fd: 3 },
    anchors: {
      site: { gx: 9, gy: 16.5 },
      work: { gx: 9.0, gy: 17.8 },
      wait: { gx: 10.4, gy: 18.0 },
    },
  },
]

/** The eight AUTHORED BODIES, keyed by the engine structure ids they present. */
export const FOUNDING_PLACE_PRESENTATION: readonly PlacePresentation[] = AUTHORED_PLACES.filter(
  (place) => place.buildingId !== 'expansion',
)

/**
 * The legacy Annex PARCEL, which is presentation-owned on purpose.
 *
 * `INITIAL_PROPERTY_STRUCTURES` deliberately records no body here — the parcel is
 * "graded open ground with no body on it until a placement completes there" (C1-M1a) —
 * so there is no engine structure for the snapshot to describe. The marked pad, its
 * stakes and its whole lifecycle painting stay exactly where the accepted Annex specs
 * put them, and the `expansion` id keeps addressing exactly this.
 */
export const LEGACY_EXPANSION_PRESENTATION: PlacePresentation = AUTHORED_PLACES.find(
  (place) => place.buildingId === 'expansion',
)!

/** Every authored presentation, in reading order, keyed by structure id. */
export const PRESENTATION_BY_BUILDING: Readonly<Record<BuildingId, PlacePresentation>> =
  Object.fromEntries(AUTHORED_PLACES.map((place) => [place.buildingId, place]))

/**
 * THE AUTHORED WEEK-0 COMPOSITION — presentation over the fallback footprints.
 *
 * Retained, and retained deliberately: it is what the world looks like on the initial
 * property, it is the composition a snapshot with no property projection falls back to,
 * and it is the alignment fixture the engine's own geometry is asserted against. It is
 * NOT the authority any more — `composeWorldBuildings(snapshot)` is (C1-M1b).
 */
export const WORLD_PLACES: readonly WorldPlace[] = AUTHORED_PLACES.map((place) => ({
  buildingId: place.buildingId,
  placeId: place.placeId,
  label: place.label,
  texKey: place.texKey,
  gx: place.surveyedAt.gx,
  gy: place.surveyedAt.gy,
  fw: place.fallbackFootprint.fw,
  fd: place.fallbackFootprint.fd,
  anchors: place.anchors,
}))

/**
 * Fast lookup by building id over the AUTHORED WEEK-0 COMPOSITION.
 *
 * Every FOUNDING id is present exactly once; a placed facility is not here and never
 * will be, because this table cannot know what a studio built. Ask the composed world
 * (`worldBuildingById`) for an arbitrary id (C1-M1b).
 */
export const PLACE_BY_BUILDING: Readonly<Record<BuildingId, WorldPlace>> = Object.fromEntries(
  WORLD_PLACES.map((place) => [place.buildingId, place]),
) as Record<BuildingId, WorldPlace>

// ── Per-BLUEPRINT presentation (C1-M1b) ───────────────────────────────────────
//
// A facility the studio BUILDS has no authored body — the player chose where it stands
// and the engine owns its footprint. What the renderer still owns is how it LOOKS and
// where its ground anchors fall, and that is a property of the BLUEPRINT, not of the
// individual placement: every Development & Casting Annex wears the same walls and puts
// its door on the same face.
//
// Standoffs are measured from the facility's FRONT face (its largest gy) in tiles, which
// is the same arithmetic the accepted presence projection already used — so an annex's
// workers stand exactly where they stood before this template existed.

/** Where a placed facility's named ground anchors fall, relative to its footprint. */
export type PlacedAnchorTemplate = {
  /** Tiles beyond the front face where its workers stand. */
  workStandoff: number
  /** Tiles beyond the front face where its queue forms. */
  waitStandoff: number
  /** Tiles across the frontage, from the centre line, where the queue's head stands. */
  waitAcross: number
}

/** How one buildable blueprint is presented once it stands on the property. */
export type BlueprintPresentation = {
  /** Baked building texture, or '' for a blueprint with no authored art yet. */
  texKey: string
  anchors: PlacedAnchorTemplate
}

/**
 * The default any blueprint gets. It is an HONEST default, not a borrowed one: a
 * blueprint with no authored art is drawn as a plain massing block rather than wearing
 * another building's body (shift law 12), and its door is on its front face because
 * that is the face the camera and every road on this property look at.
 */
export const DEFAULT_BLUEPRINT_PRESENTATION: BlueprintPresentation = {
  texKey: '',
  anchors: { workStandoff: 1.6, waitStandoff: 2.1, waitAcross: 1.4 },
}

/**
 * Per-blueprint overrides. Everything absent falls back to the default above.
 *
 * C1-M5 gives each of the four new blueprints its own baked body, so a studio's
 * property reads as a set of buildings the player CHOSE rather than one sprite
 * repeated. Anchors: the two office tiers and the craft annex are 3 × 2 like the
 * Annex and keep its standoffs; the Hall is 4 × 3 and stands its people one tile
 * further out, because a bigger frontage puts its door further from the centre.
 */
export const BLUEPRINT_PRESENTATION: Readonly<Record<string, BlueprintPresentation>> = {
  'development-casting-annex': {
    texKey: 'tw-annex',
    anchors: DEFAULT_BLUEPRINT_PRESENTATION.anchors,
  },
  'development-office-2': {
    texKey: 'tw-office-2',
    anchors: DEFAULT_BLUEPRINT_PRESENTATION.anchors,
  },
  'development-office-3': {
    texKey: 'tw-office-3',
    anchors: DEFAULT_BLUEPRINT_PRESENTATION.anchors,
  },
  'development-casting-hall': {
    texKey: 'tw-hall',
    anchors: { workStandoff: 2.1, waitStandoff: 2.7, waitAcross: 1.8 },
  },
  'craft-annex': {
    texKey: 'tw-craft',
    anchors: DEFAULT_BLUEPRINT_PRESENTATION.anchors,
  },
}

/** The presentation one blueprint wears. Never null: an unknown blueprint is honest. */
export function blueprintPresentation(blueprintId: string | null | undefined): BlueprintPresentation {
  if (typeof blueprintId !== 'string') return DEFAULT_BLUEPRINT_PRESENTATION
  return BLUEPRINT_PRESENTATION[blueprintId] ?? DEFAULT_BLUEPRINT_PRESENTATION
}

/**
 * The named ground anchors of one placed facility, from its blueprint's template.
 *
 * Footprints are HALF-OPEN, so the front face is `origin.gy + depth - 1` and the centre
 * of the frontage is `origin.gx + width / 2` — the same two numbers the accepted
 * presence projection derived from the engine's own cell list.
 */
export function placedAnchors(
  origin: GridPoint,
  footprint: { width: number; depth: number },
  blueprintId: string | null | undefined,
): Record<string, GridPoint> {
  const template = blueprintPresentation(blueprintId).anchors
  const front = origin.gy + footprint.depth - 1
  const centre = (origin.gx + (origin.gx + footprint.width - 1) + 1) / 2
  const work = { gx: centre, gy: front + template.workStandoff }
  return {
    entry: { gx: work.gx, gy: work.gy },
    work,
    wait: { gx: centre + template.waitAcross, gy: front + template.waitStandoff },
  }
}

// ── ground zoning ─────────────────────────────────────────────────────────────

/** Stage Road — the production spine, separating the office side from the stages. */
export const ROADS: readonly Rect[] = [
  { x0: 13, y0: 0, x1: 14, y1: 25 }, // stage road (runs down-left)
  { x0: 0, y0: 7, x1: 27, y1: 8 }, // studio avenue (runs down-right)
  { x0: 9, y0: 19, x1: 10, y1: 25 }, // studio boulevard: plaza → gate
  { x0: 15, y0: 14, x1: 22, y1: 15 }, // service spur to the scenery yard gate
  { x0: 14, y0: 21, x1: 22, y1: 22 }, // back-lot road to the staff parking apron
]

/** Staff/production parking — the working lot's open ground, and M2's build room. */
export const PARKING: readonly Rect[] = [
  { x0: 21, y0: 20, x1: 26, y1: 24 },
]

export const PLAZA: readonly Rect[] = [
  { x0: 7, y0: 10, x1: 11, y1: 14 }, // central courtyard
]

/** Paved aprons in front of each stage's elephant doors (the +gy face). */
export const APRONS: readonly Rect[] = [
  { x0: 17, y0: 6, x1: 21, y1: 6 }, // stage 7
  { x0: 17, y0: 13, x1: 21, y1: 13 }, // stage 12
]

export const PATHS: readonly Rect[] = [
  { x0: 9, y0: 5, x1: 9, y1: 10 }, // admin → courtyard
  { x0: 5, y0: 4, x1: 5, y1: 8 }, // development → casting
  { x0: 5, y0: 12, x1: 5, y1: 15 }, // casting → theater
  { x0: 5, y0: 14, x1: 7, y1: 14 }, // theater walk → courtyard
  { x0: 11, y0: 12, x1: 12, y1: 12 }, // courtyard → stage road
]

/** The Annex parcel's graded pad. */
export const EXPANSION_PADS: readonly Rect[] = [
  { x0: 7, y0: 15, x1: 10, y1: 17 },
]

/** The Scenery & Service yard hardstanding — the yard IS a place, not decoration. */
export const YARD_PADS: readonly Rect[] = [
  { x0: 21, y0: 14, x1: 26, y1: 18 },
]

/**
 * Clickable ground region for the Scenery & Service yard. Selecting it resolves the
 * current load-in work; without any, it falls back to the Post building's own verb.
 */
export const YARD_REGION: Rect = { x0: 21, y0: 14, x1: 26, y1: 18 }

// ── landscaping & set dressing ────────────────────────────────────────────────

export type PropPlacement = {
  texKey: string
  gx: number
  gy: number
  /** Deterministic jitter magnitude in tiles; the scene applies it from `sceneSeed`. */
  jitter?: number
}

/** Permanent greenery and dressing — the property's bones. */
export function landscaping(): PropPlacement[] {
  const props: PropPlacement[] = []

  // the lot's landmark, behind the stages
  props.push({ texKey: 'tw-tower', gx: 24, gy: 4 })

  // palms lining the boulevard up to (but never under) the gate arch — the arrival
  for (let gy = 18.4; gy <= 22.5; gy += 1.8) {
    props.push({ texKey: 'tw-palm', gx: 8.3, gy, jitter: 0.08 })
    props.push({ texKey: 'tw-palm', gx: 10.8, gy, jitter: 0.08 })
  }

  // hedges framing the courtyard
  for (const [gx, gy] of [
    [6.5, 9.5],
    [11.5, 9.5],
    [6.5, 14.5],
    [11.5, 14.5],
  ] as const) {
    props.push({ texKey: 'tw-hedge', gx, gy })
  }

  // courtyard furniture
  props.push({ texKey: 'tw-bench', gx: 7.7, gy: 11.5 })
  props.push({ texKey: 'tw-bench', gx: 11.1, gy: 12.6 })
  props.push({ texKey: 'tw-planter', gx: 7.6, gy: 13.1, jitter: 0.05 })
  props.push({ texKey: 'tw-planter', gx: 11.3, gy: 11.1, jitter: 0.05 })

  // lamps along the studio avenue and the boulevard
  for (let gx = 2; gx <= 26; gx += 4) props.push({ texKey: 'tw-lamp', gx, gy: 6.4 })
  for (let gy = 10; gy <= 22; gy += 3.5) {
    props.push({ texKey: 'tw-lamp', gx: 8.5, gy })
    props.push({ texKey: 'tw-lamp', gx: 10.5, gy })
  }

  // admin forecourt
  props.push({ texKey: 'tw-planter', gx: 8.5, gy: 5.5 })
  props.push({ texKey: 'tw-planter', gx: 11.6, gy: 5.5 })
  props.push({ texKey: 'tw-flag', gx: 10.1, gy: 5.4 })
  props.push({ texKey: 'tw-sign', gx: 11.5, gy: 9.1 })

  // softening planting on the west lawn and behind the stages
  props.push({ texKey: 'tw-palm', gx: 6.6, gy: 6.6, jitter: 0.12 })
  props.push({ texKey: 'tw-palm', gx: 2.4, gy: 12.6, jitter: 0.12 })
  props.push({ texKey: 'tw-palm', gx: 15.4, gy: 3.4, jitter: 0.12 })
  props.push({ texKey: 'tw-palm', gx: 2.6, gy: 20.4, jitter: 0.12 })
  props.push({ texKey: 'tw-hedge', gx: 22.4, gy: 3.4 })
  props.push({ texKey: 'tw-hedge', gx: 15.5, gy: 20.5 })

  // gate: guard booth + barrier + flanking palms
  props.push({ texKey: 'tw-booth', gx: 11.4, gy: 23.6 })
  props.push({ texKey: 'tw-barrier', gx: 10.4, gy: 24.1 })
  props.push({ texKey: 'tw-palm', gx: 7.2, gy: 24.6, jitter: 0.05 })
  props.push({ texKey: 'tw-palm', gx: 12.4, gy: 22.2, jitter: 0.05 })

  // scenery yard: racks, stacked flats, crates, a service truck
  props.push({ texKey: 'tw-rack', gx: 24.7, gy: 15.2 })
  props.push({ texKey: 'tw-rack', gx: 25.3, gy: 16.6 })
  props.push({ texKey: 'tw-flats', gx: 23.3, gy: 14.5 })
  props.push({ texKey: 'tw-crate', gx: 22.4, gy: 17.4, jitter: 0.08 })
  props.push({ texKey: 'tw-crate', gx: 23.2, gy: 18.2, jitter: 0.08 })
  props.push({ texKey: 'tw-crate', gx: 24.4, gy: 17.9, jitter: 0.08 })
  props.push({ texKey: 'tw-truck', gx: 23.4, gy: 17.4 })

  // the back lot: staff parking, lit and swept, on the far side of the stage road
  props.push({ texKey: 'tw-car', gx: 22.4, gy: 21.4 })
  props.push({ texKey: 'tw-car', gx: 23.6, gy: 22.6 })
  props.push({ texKey: 'tw-car', gx: 24.8, gy: 21.3 })
  props.push({ texKey: 'tw-lamp', gx: 21.4, gy: 20.4 })
  props.push({ texKey: 'tw-lamp', gx: 25.6, gy: 23.6 })
  props.push({ texKey: 'tw-flats', gx: 25.4, gy: 19.4 })
  props.push({ texKey: 'tw-crate', gx: 26.4, gy: 20.4, jitter: 0.08 })
  for (let gy = 19.5; gy <= 24.5; gy += 2.4) {
    props.push({ texKey: 'tw-palm', gx: 27.3, gy, jitter: 0.08 })
  }
  props.push({ texKey: 'tw-palm', gx: 17.4, gy: 24.4, jitter: 0.1 })
  props.push({ texKey: 'tw-palm', gx: 13.4, gy: 25.2, jitter: 0.1 })
  props.push({ texKey: 'tw-hedge', gx: 20.5, gy: 24.5 })

  // stage aprons: standing gear that belongs to the stages
  props.push({ texKey: 'tw-cart', gx: 21.6, gy: 6.4 })
  props.push({ texKey: 'tw-crate', gx: 16.5, gy: 6.4, jitter: 0.06 })
  props.push({ texKey: 'tw-cart', gx: 21.6, gy: 13.4 })

  // theater forecourt
  props.push({ texKey: 'tw-planter', gx: 6.3, gy: 17.4 })
  props.push({ texKey: 'tw-lamp', gx: 6.5, gy: 15.6 })

  return props
}

// ── C1-M6b — backlot dressing ─────────────────────────────────────────────────
//
// A studio lot is a WORKING place. Before this pass the property was correct and empty:
// the right buildings on the right ground with nothing standing about between them, which
// is what made it read cold. This is the fix, and it is the smallest honest version of it.
//
// THE LAW THIS INVENTORY IS WRITTEN TO. Dressing is presentation and only presentation. It
// enters no occupancy, carries no hit area, holds no state and answers no question. So it
// may not stand anywhere that would make a player believe ground is taken when it is not:
// every point below is on ground the parcel map does NOT offer for building — road verges,
// the two BLOCKED parcels (the courtyard and the service yard), the aprons, and the
// unclaimed margins outside every parcel rectangle. `world.test.ts` asserts exactly that
// against the engine's own `LOT_PARCELS`, so the claim is checked rather than promised.
//
// The legacy landscaping above predates that law and is left where the accepted specs put
// it; the SCENE additionally makes any prop yield to a real body standing on its cell, so
// even a grandfathered prop stops painting the moment its ground is genuinely built on.
//
// DENSITY is the tutorial-era lot from the corpus, not the ten-year one: margins and
// working yards dressed, the middle of the property left open for the studio the player
// is going to build.

/**
 * Deterministic, clock-free variation from a grid coordinate. No RNG, no `Date.now`.
 *
 * The odd constant it STARTS from is load-bearing, and was put there by a failing test: a
 * hash built by multiplying and xoring the inputs alone has a fixed point at the origin —
 * `gridHash(0, 0)` returned exactly 0, so the corner of the property was permanently the
 * driest cell on it and every salted variation there agreed with every other. Seeding the
 * accumulator removes the fixed point; the corner is now an ordinary cell.
 */
export function gridHash(gx: number, gy: number, salt = 0): number {
  const x = Math.round(gx * 16) | 0
  const y = Math.round(gy * 16) | 0
  let h = (0x9e3779b9 ^ Math.imul(x, 0x27d4eb2d)) >>> 0
  h = (h ^ Math.imul(y ^ 0x85ebca6b, 0x165667b1)) >>> 0
  h = (h ^ Math.imul(salt ^ 0xc2b2ae35, 0x27d4eb2d)) >>> 0
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b) >>> 0
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35) >>> 0
  return (h ^ (h >>> 16)) >>> 0
}

/** The same hash as a fraction in [0, 1). */
export function gridNoise(gx: number, gy: number, salt = 0): number {
  return gridHash(gx, gy, salt) / 0x1_0000_0000
}

/**
 * How dry one open ground cell is, from its coordinates alone.
 *
 * The corpus' ground is BLOTCHED — sun-scorched patches through watered grass — and a
 * single flat tone is what made this property read as a diagram. Two octaves of the
 * coordinate hash give the blotches size without any noise texture, and because it is a
 * pure function of the cell, two paints of the same snapshot are byte-identical.
 */
export function groundDryness(gx: number, gy: number): number {
  const coarse = gridNoise(Math.floor(gx / 3), Math.floor(gy / 3), 11)
  const fine = gridNoise(gx, gy, 29)
  return coarse * 0.68 + fine * 0.32
}

/** Above this, an open lawn cell is painted as scorched rather than watered. */
export const GROUND_SCORCH_THRESHOLD = 0.62
/** Traffic verges are drier: a cell beside a road or apron scorches this much sooner. */
export const GROUND_VERGE_BONUS = 0.28

/**
 * Standing gear, fencing and dry planting — the property, inhabited.
 *
 * Grouped by where on the lot they stand, because that is how they were authored and how
 * a reviewer checks them.
 */
export function backlotDressing(): PropPlacement[] {
  const props: PropPlacement[] = []
  const at = (texKey: string, gx: number, gy: number, jitter?: number): void => {
    props.push(jitter === undefined ? { texKey, gx, gy } : { texKey, gx, gy, jitter })
  }

  // ── the north margin, behind the back wall line (gy 0-1) ───────────────────
  at('tw-palm', 1.4, 0.5, 0.1)
  at('tw-palm', 4.6, 0.6, 0.1)
  at('tw-palm', 11.5, 0.6, 0.1)
  at('tw-palm', 16.4, 0.5, 0.1)
  at('tw-scrub', 2.6, 1.4, 0.08)
  at('tw-scrub', 7.5, 0.5, 0.08)
  at('tw-scrub', 12.4, 1.5, 0.08)
  at('tw-scrub', 19.5, 1.4, 0.08)

  // ── the west margin, outside the owned lawns (gx 0-2, gy 15-25) ────────────
  at('tw-palm', 1.4, 16.4, 0.1)
  at('tw-palm', 0.6, 19.6, 0.1)
  at('tw-palm', 1.5, 23.4, 0.1)
  at('tw-scrub', 2.4, 17.6, 0.08)
  at('tw-scrub', 0.5, 21.5, 0.08)
  at('tw-scrub', 2.5, 24.6, 0.08)
  // a fence run marking where the studio's own ground begins
  for (const gy of [19.5, 20.5, 21.5, 22.5]) at('tw-fence-y', 2.9, gy)

  // ── the stage road verge (gx 12 and gx 15) ────────────────────────────────
  at('tw-lamp', 12.4, 3.5)
  at('tw-lamp', 12.4, 11.5)
  at('tw-lamp', 12.4, 19.5)
  at('tw-scrub', 12.5, 5.6, 0.08)
  at('tw-scrub', 12.5, 16.5, 0.08)
  at('tw-crate', 15.6, 2.6, 0.06)
  at('tw-lightstand', 15.5, 4.4)

  // ── standing gear on the two stage aprons ─────────────────────────────────
  at('tw-rigging', 18.6, 6.6)
  at('tw-rigging', 19.6, 13.5)
  at('tw-drums', 16.5, 13.4)
  at('tw-ladder', 21.4, 12.4)

  // ── the scenery & service yard (a BLOCKED parcel — nothing may be built here) ─
  at('tw-pallets', 22.5, 16.5)
  at('tw-drums', 25.4, 17.6)
  at('tw-scaffold', 26.4, 16.4)
  at('tw-skip', 21.5, 18.6)
  at('tw-ladder', 24.5, 16.5)
  for (const gx of [22.5, 23.5, 24.5, 25.5]) at('tw-fence-x', gx, 18.9)

  // ── the back-lot parking, on the strip the parcel map does not offer ───────
  at('tw-van', 21.6, 23.5)
  at('tw-drums', 22.5, 20.4)
  at('tw-lamp', 21.4, 24.4)

  // ── the south-east margin, behind the back-lot road ───────────────────────
  at('tw-palm', 16.5, 24.5, 0.1)
  at('tw-palm', 19.5, 23.5, 0.1)
  at('tw-scrub', 18.4, 25.4, 0.08)
  for (const gx of [15.5, 16.5, 17.5]) at('tw-fence-x', gx, 23.1)

  // ── the east margin ────────────────────────────────────────────────────────
  at('tw-palm', 27.4, 10.5, 0.08)
  at('tw-palm', 27.4, 13.5, 0.08)
  at('tw-scrub', 27.5, 17.4, 0.08)

  // ── the boulevard verge, on the gate approach ─────────────────────────────
  at('tw-lamp', 11.5, 19.4)
  at('tw-palm', 11.6, 21.5, 0.08)
  at('tw-palm', 12.5, 24.5, 0.08)

  // ── the courtyard and the avenue, softened (both BLOCKED or unclaimed) ─────
  at('tw-planter', 8.6, 10.4, 0.05)
  at('tw-planter', 10.4, 13.6, 0.05)
  at('tw-lamp', 4.4, 6.4)
  at('tw-planter', 6.6, 9.4, 0.05)

  return props
}

/** Extra dressing shown only when the studio is doing well. Authored, not a tint. */
export function establishedDressing(): PropPlacement[] {
  return [
    { texKey: 'tw-bannerpole', gx: 8.5, gy: 20.4 },
    { texKey: 'tw-bannerpole', gx: 10.6, gy: 20.4 },
    { texKey: 'tw-bannerpole', gx: 8.5, gy: 17.0 },
    { texKey: 'tw-bannerpole', gx: 10.6, gy: 17.0 },
    { texKey: 'tw-umbrella', gx: 7.8, gy: 12.1 },
    { texKey: 'tw-umbrella', gx: 11.2, gy: 13.4 },
    { texKey: 'tw-planter', gx: 6.7, gy: 11.1 },
    { texKey: 'tw-planter', gx: 12.3, gy: 14.0 },
  ]
}

// ── movement ──────────────────────────────────────────────────────────────────

/**
 * The one scripted route: a dispatched director leaves the Administration forecourt,
 * takes the studio avenue past the stage road, and walks onto the Stage 7 apron.
 *
 * This is cosmetic acknowledgement of an already-accepted engine transition. No point
 * on it advances a task, and the destination is painted directly from loaded truth
 * whether or not the walk was ever seen (LL law 2).
 */
export const DIRECTOR_ROUTE: readonly GridPoint[] = [
  { gx: 10.5, gy: 5.8 },
  { gx: 9.3, gy: 7.5 },
  { gx: 13.6, gy: 7.5 },
  { gx: 17.6, gy: 7.4 },
  { gx: 19.6, gy: 6.9 },
  { gx: 19.0, gy: 6.4 },
]

/** Where a person of each role waits when no place has claimed them. */
export const PERSON_HOME: Readonly<Record<'director' | 'talent', GridPoint>> = {
  // The front office: an unassigned director waits where the week is decided.
  director: { gx: 10.5, gy: 5.9 },
  // The Casting forecourt: contracted talent waits where it was signed.
  talent: { gx: 5.4, gy: 11.9 },
}

/**
 * Deterministic slot offsets (in tiles) so co-located people never share a pixel.
 *
 * Sixteen authored slots, laid out as loose knots of two and three rather than a grid,
 * because the studio's whole contracted roster now stands here (M1.5 staff presence) and
 * a fifteen-person rank reads as a spreadsheet, not a lot. Every offset stays on open
 * ground for BOTH homes; `PERSON_HOME_JITTER` softens the remaining regularity from the
 * scene seed. This is parking, not a claim: no slot asserts a location or a task.
 */
export const PERSON_HOME_SLOTS: readonly GridPoint[] = [
  { gx: 0, gy: 0 },
  { gx: 0.95, gy: 0.35 },
  { gx: 1.85, gy: -0.15 },
  { gx: 0.55, gy: 1.05 },
  { gx: 1.6, gy: 0.95 },
  { gx: 2.5, gy: 0.45 },
  { gx: -0.7, gy: 0.75 },
  { gx: 0.15, gy: 1.85 },
  { gx: 1.15, gy: 2.0 },
  { gx: 2.15, gy: 1.6 },
  { gx: 3.05, gy: 1.15 },
  { gx: -0.35, gy: 2.6 },
  { gx: 0.75, gy: 2.85 },
  { gx: 1.8, gy: 2.75 },
  { gx: 2.8, gy: 2.3 },
  { gx: 3.35, gy: 0.15 },
]

/** Jitter magnitude (tiles) applied to a parked person from the scene seed. */
export const PERSON_HOME_JITTER = 0.16

/** How many times the authored lattice is re-used, shifted, before it repeats. */
const PERSON_HOME_RINGS = 3
const PERSON_HOME_RING_STEP: GridPoint = { gx: 0.45, gy: 0.08 }

/**
 * Where the Nth co-located person of a role parks, relative to their role's home.
 *
 * Past the authored lattice the slots WRAP with a small ring shift rather than marching
 * away on an unbounded arithmetic grid — that grid eventually stood someone inside the
 * Theater. Repeating at very high occupancy is a cosmetic overlap; leaving the open
 * ground is a lie about where a person can stand.
 */
export function personHomeSlotOffset(slot: number): GridPoint {
  const count = PERSON_HOME_SLOTS.length
  const index = Number.isFinite(slot) ? Math.max(0, Math.floor(slot)) : 0
  const base = PERSON_HOME_SLOTS[index % count]!
  const ring = Math.floor(index / count) % PERSON_HOME_RINGS
  return {
    gx: base.gx + ring * PERSON_HOME_RING_STEP.gx,
    gy: base.gy + ring * PERSON_HOME_RING_STEP.gy,
  }
}

// ── Presence commutes (M3-UI) ────────────────────────────────────────────────
//
// Presentation waypoint paths from a role's HOME ZONE to a place's `work` anchor.
//
// They are AUTHORED, not searched. The property has exactly two home zones and nine
// places, so the whole commute table is twelve short lists a person can read and a
// test can check — which is the honest way to get road-following movement without
// inventing a pathfinder the milestone explicitly excludes. Every interior waypoint
// below sits on real circulation (road, path, plaza, apron, parcel pad or parking) or
// on the open lawn strip immediately beside it, and no segment crosses a building
// footprint; `world.test.ts` asserts both.
//
// LAW 2. Nothing on these paths advances anything. A person's POSITION during a week
// playback is interpolation over the engine's own beat array; the engine's answer for
// where they are this week is identical whether or not the walk was ever seen.

export type PersonHomeRole = 'director' | 'talent'

/** The interior waypoints between each home zone and each place's `work` anchor. */
export const PRESENCE_ROUTES: Readonly<
  Record<PersonHomeRole, Readonly<Partial<Record<BuildingId, readonly GridPoint[]>>>>
> = {
  // The director home is the Administration forecourt, one step off the avenue.
  director: {
    admin: [],
    writers: [
      { gx: 9.4, gy: 7.5 },
      { gx: 5.6, gy: 7.5 },
      { gx: 5.5, gy: 5.4 },
    ],
    // Casting's door faces SOUTH, and its own building blocks the western path, so
    // the walk goes down the admin path, across the courtyard and back up.
    casting: [
      { gx: 9.4, gy: 7.5 },
      { gx: 9.2, gy: 10.4 },
      { gx: 8.2, gy: 13.4 },
      { gx: 6.4, gy: 14.4 },
      { gx: 5.5, gy: 12.8 },
    ],
    'stage-a': [
      { gx: 11.6, gy: 7.5 },
      { gx: 16.6, gy: 7.5 },
      { gx: 18.4, gy: 6.7 },
    ],
    'stage-b': [
      { gx: 11.6, gy: 7.5 },
      { gx: 13.6, gy: 7.7 },
      { gx: 13.6, gy: 13.6 },
      { gx: 15.6, gy: 14.4 },
      { gx: 17.6, gy: 13.7 },
    ],
    post: [
      { gx: 11.6, gy: 7.5 },
      { gx: 13.6, gy: 7.7 },
      { gx: 13.6, gy: 20.6 },
      { gx: 16.4, gy: 21.5 },
      { gx: 19.4, gy: 21.4 },
    ],
    theater: [
      { gx: 9.4, gy: 7.5 },
      { gx: 9.2, gy: 10.4 },
      { gx: 8.2, gy: 13.4 },
      { gx: 6.4, gy: 14.4 },
      { gx: 6.4, gy: 18.6 },
    ],
    expansion: [
      { gx: 9.4, gy: 7.5 },
      { gx: 9.2, gy: 10.4 },
      { gx: 9.0, gy: 13.6 },
      { gx: 9.0, gy: 15.6 },
    ],
    gate: [
      { gx: 9.4, gy: 7.5 },
      { gx: 9.2, gy: 10.4 },
      { gx: 9.6, gy: 13.6 },
      { gx: 9.6, gy: 19.6 },
      { gx: 9.9, gy: 22.6 },
    ],
  },
  // The talent home is the Casting forecourt, on the courtyard's western edge.
  talent: {
    casting: [],
    writers: [
      { gx: 6.4, gy: 11.4 },
      { gx: 6.4, gy: 8.4 },
      { gx: 5.6, gy: 7.5 },
      { gx: 5.5, gy: 5.4 },
    ],
    admin: [
      { gx: 6.4, gy: 11.4 },
      { gx: 6.4, gy: 8.4 },
      { gx: 9.4, gy: 7.5 },
      { gx: 9.6, gy: 6.4 },
    ],
    'stage-a': [
      { gx: 6.4, gy: 11.4 },
      { gx: 6.4, gy: 8.4 },
      { gx: 9.4, gy: 7.5 },
      { gx: 13.6, gy: 7.6 },
      { gx: 16.6, gy: 7.5 },
      { gx: 18.4, gy: 6.7 },
    ],
    'stage-b': [
      { gx: 6.6, gy: 12.4 },
      { gx: 8.4, gy: 12.6 },
      { gx: 11.4, gy: 12.4 },
      { gx: 13.6, gy: 12.6 },
      { gx: 15.6, gy: 14.4 },
      { gx: 17.6, gy: 13.7 },
    ],
    post: [
      { gx: 6.6, gy: 12.4 },
      { gx: 8.4, gy: 12.6 },
      { gx: 11.4, gy: 12.4 },
      { gx: 13.6, gy: 12.6 },
      { gx: 13.6, gy: 20.6 },
      { gx: 16.4, gy: 21.5 },
      { gx: 19.4, gy: 21.4 },
    ],
    theater: [
      { gx: 5.6, gy: 13.4 },
      { gx: 5.6, gy: 15.6 },
      { gx: 6.6, gy: 16.2 },
      { gx: 6.6, gy: 18.6 },
    ],
    expansion: [
      { gx: 6.6, gy: 13.4 },
      { gx: 8.0, gy: 14.4 },
      { gx: 9.0, gy: 15.6 },
    ],
    gate: [
      { gx: 6.6, gy: 13.4 },
      { gx: 8.0, gy: 14.4 },
      { gx: 9.6, gy: 16.6 },
      { gx: 9.6, gy: 19.6 },
      { gx: 9.9, gy: 22.6 },
    ],
  },
}

/**
 * Where the Nth co-located WORKER stands, relative to a site's `work` anchor.
 *
 * A loose knot around the door, not a rank: six people at a soundstage should read as
 * a company standing about on the apron. Like the home lattice this is parking, not a
 * claim — the engine says the person is at this facility, and nothing finer.
 */
export const PRESENCE_SITE_SLOTS: readonly GridPoint[] = [
  { gx: 0, gy: 0 },
  { gx: 0.78, gy: 0.26 },
  { gx: -0.62, gy: 0.34 },
  { gx: 0.24, gy: 0.84 },
  { gx: 1.32, gy: 0.72 },
  { gx: -1.14, gy: 0.92 },
  { gx: 0.94, gy: 1.4 },
  { gx: -0.28, gy: 1.46 },
]

/** How far each ring of site slots is shifted before the lattice repeats. */
const PRESENCE_SITE_RING_STEP: GridPoint = { gx: 0.36, gy: 0.62 }

export function presenceSiteSlotOffset(index: number): GridPoint {
  const count = PRESENCE_SITE_SLOTS.length
  const n = Number.isFinite(index) ? Math.max(0, Math.floor(index)) : 0
  const base = PRESENCE_SITE_SLOTS[n % count]!
  const ring = Math.floor(n / count)
  return {
    gx: base.gx + ring * PRESENCE_SITE_RING_STEP.gx,
    gy: base.gy + ring * PRESENCE_SITE_RING_STEP.gy,
  }
}

/** How many people stand in one rank of the waiting queue before it doubles back. */
export const PRESENCE_QUEUE_RANK = 4
/** The step between two people in the queue, and between two ranks. */
const PRESENCE_QUEUE_STEP: GridPoint = { gx: 0.46, gy: 0.3 }
const PRESENCE_QUEUE_RANK_STEP: GridPoint = { gx: -0.34, gy: 0.52 }

/**
 * Where the Nth WAITING person stands, relative to a site's `wait` anchor.
 *
 * Deliberately a LINE rather than a knot: a queue outside a full building is the one
 * thing on this lot that should look like a queue at a glance.
 */
export function presenceQueueSlotOffset(index: number): GridPoint {
  const n = Number.isFinite(index) ? Math.max(0, Math.floor(index)) : 0
  const place = n % PRESENCE_QUEUE_RANK
  const rank = Math.floor(n / PRESENCE_QUEUE_RANK)
  return {
    gx: place * PRESENCE_QUEUE_STEP.gx + rank * PRESENCE_QUEUE_RANK_STEP.gx,
    gy: place * PRESENCE_QUEUE_STEP.gy + rank * PRESENCE_QUEUE_RANK_STEP.gy,
  }
}

/** Deterministic ambient patrols. Roles come from the role atlas. */
export const AMBIENT_ROUTES: readonly {
  role: 'grip' | 'stagehand' | 'electrician' | 'camera' | 'security' | 'publicity' | 'extra'
  a: GridPoint
  b: GridPoint
}[] = [
  { role: 'grip', a: { gx: 22.4, gy: 16.6 }, b: { gx: 20.4, gy: 14.9 } },
  { role: 'stagehand', a: { gx: 17.8, gy: 6.6 }, b: { gx: 20.8, gy: 6.6 } },
  { role: 'electrician', a: { gx: 21.4, gy: 7.4 }, b: { gx: 21.4, gy: 12.6 } },
  { role: 'camera', a: { gx: 16.4, gy: 7.5 }, b: { gx: 13.6, gy: 7.5 } },
  { role: 'publicity', a: { gx: 11.4, gy: 6.2 }, b: { gx: 9.2, gy: 6.6 } },
  { role: 'security', a: { gx: 10.9, gy: 23.4 }, b: { gx: 10.9, gy: 21.4 } },
  { role: 'extra', a: { gx: 7.8, gy: 11.4 }, b: { gx: 10.9, gy: 13.2 } },
  { role: 'grip', a: { gx: 24.2, gy: 17.9 }, b: { gx: 22.6, gy: 17.9 } },
]

// ── camera framing targets ────────────────────────────────────────────────────

/** Absolute camera zoom range — institution scale through person scale. */
export const ZOOM_MIN = 0.32
export const ZOOM_MAX = 1.9

/**
 * LOD band thresholds. BOTH boundaries are relative to the CURRENT whole-property fit,
 * because the fit moves every time host chrome changes the canvas box.
 *
 * Playtest 1 found the two ways an absolute threshold lies about the default view:
 *   • the camera holds a raw zoom across a resize, the canvas grows, and the same zoom is
 *     suddenly BELOW the new fit — the whole-property view classified as institution
 *     scale and every building label disappeared;
 *   • on a large canvas the fit alone exceeds an absolute person-scale threshold, so the
 *     default framing classified as person scale and every status badge stepped aside.
 *
 * Keying both boundaries to fit closes both: the whole-property framing (ratio 1.0) is
 * always an operations view, whatever the host does to the box. On a canvas so large that
 * the fit is already near max zoom, the people band becomes unreachable — the property is
 * then drawn at person scale anyway, and the selected person keeps their nameplate.
 */
export const ZOOM_INSTITUTION_OF_FIT = 0.92
export const ZOOM_PEOPLE_OF_FIT = 1.25
/** Absolute floor for person scale, so a small canvas cannot enter it too early. */
export const ZOOM_PEOPLE_ABSOLUTE = 1.0

export type LodBand = 'institution' | 'operations' | 'people'

/** Clamp any camera zoom into the world's absolute range. */
export function clampZoom(zoom: number): number {
  if (!Number.isFinite(zoom)) return ZOOM_MIN
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, zoom))
}

/** Which reading distance a camera zoom is at, against the CURRENT whole-property fit. */
export function lodBandFor(zoom: number, fitZoom: number): LodBand {
  // A zoom or fit that cannot be read must not blank the world's chrome. The default
  // reading distance is the working studio, never the silhouette-only institution view.
  if (!Number.isFinite(zoom) || zoom <= 0) return 'operations'
  if (!Number.isFinite(fitZoom) || fitZoom <= 0) return 'operations'
  if (zoom < fitZoom * ZOOM_INSTITUTION_OF_FIT) return 'institution'
  const peopleAbove = Math.max(ZOOM_PEOPLE_ABSOLUTE, fitZoom * ZOOM_PEOPLE_OF_FIT)
  return zoom < peopleAbove ? 'operations' : 'people'
}

/**
 * The zoom that HOLDS A FRAMING across a canvas resize.
 *
 * Host chrome changing the box is not a camera command, but keeping the raw number is not
 * "no command" either — the same zoom shows a different fraction of the property once the
 * fit moves. Keeping the camera's ratio to the fit is what actually leaves the framing
 * alone.
 */
export function reframedZoom(previousZoom: number, previousFit: number, nextFit: number): number {
  if (!Number.isFinite(previousZoom) || previousZoom <= 0) return clampZoom(nextFit)
  if (!Number.isFinite(previousFit) || previousFit <= 0) return clampZoom(previousZoom)
  if (!Number.isFinite(nextFit) || nextFit <= 0) return clampZoom(previousZoom)
  return clampZoom((previousZoom / previousFit) * nextFit)
}

/**
 * How thick a WORLD-SPACE stroke must be drawn to keep a constant SCREEN weight.
 *
 * Text chrome already counter-scales (see `updateLod`); Graphics chrome did not, which
 * is why the build ghost's per-cell verdicts smeared into one another at institution
 * scale — a 2px world stroke over a 0.32× camera is two thirds of a pixel. Never thinner
 * than the requested screen weight: zooming IN must not fatten a hairline.
 */
export function chromeStrokeWidth(screenWidth: number, zoom: number): number {
  if (!Number.isFinite(screenWidth) || screenWidth <= 0) return 0
  if (!Number.isFinite(zoom) || zoom <= 0) return screenWidth
  return screenWidth * Math.max(1, 1 / zoom)
}

/**
 * How deeply one ghost cell fills, per reading distance. At institution scale a tile is
 * a few pixels across and its outline carries almost nothing, so the FILL has to carry
 * the verdict instead. Colour is never the only channel: the ghost's caption states the
 * verdict in words and the Build button's own enabled state carries it into the DOM.
 */
export const GHOST_FILL_ALPHA: Readonly<Record<LodBand, number>> = {
  institution: 0.66,
  operations: 0.42,
  people: 0.42,
}

// ── Guidance world marker (M-D) ───────────────────────────────────────────────
//
// The restrained Guiding Stream. The donor games all answered "where am I needed" with
// something SOFT, physical and explicitly ignorable — a sparkling trail, a lit pool of
// ground — never a blinking mobile-game arrow. This is that, in one shape: a warm pool of
// light spread on the ground around the building the picture's next step names.
//
// It is world-space geometry, not text, so it reads at all three reading distances
// without ever shrinking a label below legibility: it simply scales with the property
// like the building it lies under, deepening its fill as the camera pulls back.

/** How far the pool spreads beyond the building's own ground footprint, as a scale. */
export const GUIDANCE_MARKER_SPREAD = { outer: 1.46, inner: 1.18 } as const

/**
 * How deeply the pool fills, per reading distance. Same reasoning as `GHOST_FILL_ALPHA`:
 * at institution scale a footprint is small and its outline carries little, so the fill
 * has to carry the cue. Colour is never the only channel — the guidance card names the
 * same step in words, and the marker is a suggestion either way.
 */
export const GUIDANCE_MARKER_FILL_ALPHA: Readonly<Record<LodBand, number>> = {
  institution: 0.3,
  operations: 0.2,
  people: 0.16,
}

/** A slow breath, well over the two seconds that separates "gentle" from "flashing". */
export const GUIDANCE_MARKER_PULSE_MS = 2_600
export const GUIDANCE_MARKER_ALPHA_MIN = 0.55
export const GUIDANCE_MARKER_ALPHA_MAX = 1
/**
 * The STATIC value. Reduced motion does not mean "no marker" — the player still has to be
 * able to see where they are needed — it means the marker simply sits there, lit and
 * still, at the middle of the breath it would otherwise take.
 */
export const GUIDANCE_MARKER_ALPHA_STATIC = 0.8

/**
 * The marker's alpha at a moment in its cycle: a cosine ease from MIN up to MAX and back,
 * once per `GUIDANCE_MARKER_PULSE_MS`. Under reduced motion — or over any clock this
 * cannot read — the answer is the one static value, so nothing ever moves.
 */
export function guidanceMarkerAlpha(elapsedMs: number, reducedMotion: boolean): number {
  if (reducedMotion) return GUIDANCE_MARKER_ALPHA_STATIC
  if (!Number.isFinite(elapsedMs) || elapsedMs < 0) return GUIDANCE_MARKER_ALPHA_STATIC
  const phase = (elapsedMs % GUIDANCE_MARKER_PULSE_MS) / GUIDANCE_MARKER_PULSE_MS
  const eased = (1 - Math.cos(phase * Math.PI * 2)) / 2
  return GUIDANCE_MARKER_ALPHA_MIN + (GUIDANCE_MARKER_ALPHA_MAX - GUIDANCE_MARKER_ALPHA_MIN) * eased
}

/**
 * How much clear world space a brought-into-view target keeps between itself and the
 * frame, expressed in SCREEN pixels so the comfort margin reads the same at every zoom.
 */
export const FOCUS_COMFORT_MARGIN_PX = 72

/** A camera's visible world rectangle, described the way Phaser's own camera keeps it. */
export type CameraView = {
  /** World point under the middle of the viewport (Phaser: scroll + half UNZOOMED size). */
  centreX: number
  centreY: number
  /** Visible world size — the viewport divided by zoom. */
  width: number
  height: number
}

/** An axis-aligned world-space box. */
export type WorldBox = { minX: number; minY: number; maxX: number; maxY: number }

/**
 * ONE CAMERA GRAMMAR: selecting something PANS, it never zooms.
 *
 * Returns the camera centre that brings `target` comfortably inside `view` at the
 * CURRENT zoom, or `null` when the target is already comfortably framed — "no camera
 * command" is a real answer, and the answer a player expects when they click a building
 * they can already see.
 *
 * The move is the SMALLEST one that works: the camera slides just far enough for the
 * target plus its margin to clear the frame edge, so the rest of the property the player
 * had arranged stays where they put it. Only a target too big for the frame is centred,
 * because nothing else can frame it.
 *
 * (Before M3-UI's grammar repair, three plate-era retained contexts — Administration,
 * the Gate, the Annex — answered a selection by setting zoom to twice the whole-property
 * fit and re-centring, which silently threw away the player's own framing and left about
 * a third of the studio off-screen with no player-facing way back.)
 */
export function panCentreIntoView(
  view: CameraView,
  target: WorldBox,
  marginWorld: number,
): { x: number; y: number } | null {
  if (!Number.isFinite(view.width) || !Number.isFinite(view.height)) return null
  if (view.width <= 0 || view.height <= 0) return null
  if (!Number.isFinite(view.centreX) || !Number.isFinite(view.centreY)) return null
  for (const edge of [target.minX, target.minY, target.maxX, target.maxY]) {
    if (!Number.isFinite(edge)) return null
  }
  const margin = Number.isFinite(marginWorld) && marginWorld > 0 ? marginWorld : 0
  const x = axisCentreIntoView(view.centreX, view.width, target.minX, target.maxX, margin)
  const y = axisCentreIntoView(view.centreY, view.height, target.minY, target.maxY, margin)
  if (x === null && y === null) return null
  return { x: x ?? view.centreX, y: y ?? view.centreY }
}

/** One axis of `panCentreIntoView`. Null means this axis is already comfortable. */
function axisCentreIntoView(
  centre: number,
  size: number,
  min: number,
  max: number,
  margin: number,
): number | null {
  const wantMin = min - margin
  const wantMax = max + margin
  const half = size / 2
  // Too big to frame with its margins: the middle of it is the best any camera can do.
  if (wantMax - wantMin >= size) {
    const middle = (min + max) / 2
    return middle === centre ? null : middle
  }
  if (wantMin < centre - half) return wantMin + half
  if (wantMax > centre + half) return wantMax - half
  return null
}

export type CameraFraming = 'overview' | 'wide' | 'production' | 'entrance' | 'theater'

/** Grid centre + zoom multiplier (relative to the whole-property fit) per framing. */
export const CAMERA_FRAMINGS: Readonly<Record<CameraFraming, { at: GridPoint; scale: number }>> = {
  // The default view: the whole graded property at operations zoom.
  overview: { at: { gx: 13.5, gy: 12.5 }, scale: 1 },
  wide: { at: { gx: 13.5, gy: 12.5 }, scale: 0.7 },
  production: { at: { gx: 19, gy: 8 }, scale: 2.1 },
  entrance: { at: { gx: 10, gy: 21 }, scale: 2.1 },
  theater: { at: { gx: 5, gy: 16 }, scale: 2.0 },
}
