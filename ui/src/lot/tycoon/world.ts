// ── Tycoon world model — the studio property, composed by hand on a grid ──────
//
// The Operation Hollywood plate is one painted 1586×992 corner with five polygon
// hotspots; there is no more world behind it. This module is the replacement: a
// 28×26 isometric tile property carrying every addressable place as a real physical
// footprint with real ground zoning around it.
//
// Grid convention (see ../scene/iso.ts): +gx runs down-right on screen, +gy runs
// down-left. A footprint at origin (gx, gy) with size fw × fd occupies the tiles
// [gx, gx+fw) × [gy, gy+fd); its four ground corners are the back (gx,gy), right
// (gx+fw,gy), front (gx+fw,gy+fd) and left (gx,gy+fd) corners.
//
// This file holds NO Phaser and NO snapshot logic — it is data the scene paints, so
// it stays unit-testable and cheap to reason about.

import type { BuildingId } from '../snapshot/StudioLotSnapshot'

export const LOT_W = 28 // tiles along gx
export const LOT_D = 26 // tiles along gy

export type Rect = { x0: number; y0: number; x1: number; y1: number }
export type GridPoint = { gx: number; gy: number }

/** Ground zoning kinds — texture keys baked by ./assets.ts, in paint order. */
export type GroundKind =
  | 'tw-t-lawn'
  | 'tw-t-lawn2'
  | 'tw-t-dirt'
  | 'tw-t-gravel'
  | 'tw-t-plaza'
  | 'tw-t-path'
  | 'tw-t-apron'
  | 'tw-t-road'
  | 'tw-t-road-line'

/**
 * One addressable place in the world. Every `BuildingId` has exactly one entry, so
 * the physical world and the DOM companion list are the same set of destinations.
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
  /** Longer world label used by the selection panel. */
  blurb: string
  /** Texture key, or '' for a marked open parcel with no building. */
  texKey: string
  gx: number
  gy: number
  fw: number
  fd: number
  /** Affordances published with the place selection event. */
  affordances: string[]
  /** Named ground anchors in grid space. */
  anchors: Record<string, GridPoint>
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
 * The nine addressable places, placed.
 *
 * Composition, reading the screen from back (top) to front (bottom):
 *   • back-left     Development (writers) and, below it, Casting / Talent
 *   • back-centre   Administration & Publicity, the deco tower on the forecourt
 *   • back-right    Stage 7 and Stage 12, a two-stage row off the stage road
 *   • right         the Scenery & Service yard, feeding both stages
 *   • front-left    the Theater
 *   • front-centre  the Annex expansion parcel, on the boulevard
 *   • front         the Studio Gate at the end of the boulevard
 */
export const WORLD_PLACES: readonly WorldPlace[] = [
  {
    buildingId: 'admin',
    placeId: PUBLICITY_PLACE_ID,
    label: 'ADMINISTRATION',
    blurb: 'Administration & Publicity',
    texKey: 'tw-admin',
    gx: 9,
    gy: 2,
    fw: 3,
    fd: 3,
    affordances: ['work', 'meeting', 'publicity'],
    anchors: {
      entry: { gx: 10.5, gy: 5.6 },
      photocall: { gx: 9.4, gy: 6.1 },
      queue: { gx: 11.6, gy: 5.9 },
    },
  },
  {
    buildingId: 'writers',
    placeId: 'development',
    label: 'DEVELOPMENT',
    blurb: 'Where pictures begin. Develop and assemble a new film.',
    texKey: 'tw-writers',
    gx: 3,
    gy: 2,
    fw: 3,
    fd: 2,
    affordances: ['work', 'develop-script'],
    anchors: { entry: { gx: 4.5, gy: 4.6 } },
  },
  {
    buildingId: 'casting',
    placeId: 'casting-office',
    label: 'CASTING',
    blurb: 'Browse and sign the talent who will carry your pictures.',
    texKey: 'tw-casting',
    gx: 3,
    gy: 9,
    fw: 3,
    fd: 2,
    affordances: ['work', 'audition', 'meeting'],
    anchors: {
      entry: { gx: 4.5, gy: 11.6 },
      queue: { gx: 6.1, gy: 11.9 },
    },
  },
  {
    buildingId: 'stage-a',
    placeId: STAGE_7_PLACE_ID,
    label: STAGE_SIGN['stage-a'],
    blurb: 'Stage 7',
    texKey: 'tw-stage-a',
    gx: 17,
    gy: 2,
    fw: 4,
    fd: 4,
    affordances: ['enter-stage', 'shoot', 'load-in'],
    anchors: {
      entry: { gx: 19, gy: 6.4 },
      crewCall: { gx: 20.4, gy: 6.9 },
      camera: { gx: 21.4, gy: 7.1 },
      service: { gx: 17.6, gy: 6.5 },
      lamp: { gx: 17.1, gy: 6.05 },
    },
  },
  {
    buildingId: 'stage-b',
    placeId: 'stage-12',
    label: STAGE_SIGN['stage-b'],
    blurb: 'The second stage. Dark until a second picture is greenlit.',
    texKey: 'tw-stage-b',
    gx: 17,
    gy: 9,
    fw: 4,
    fd: 4,
    affordances: ['enter-stage', 'shoot'],
    anchors: {
      entry: { gx: 19, gy: 13.4 },
      crewCall: { gx: 20.4, gy: 13.9 },
      lamp: { gx: 17.1, gy: 13.05 },
    },
  },
  {
    buildingId: 'post',
    placeId: SERVICE_YARD_PLACE_ID,
    label: 'SCENERY & POST',
    blurb: 'Scenery & Service',
    texKey: 'tw-post',
    gx: 18,
    gy: 18,
    fw: 3,
    fd: 2,
    affordances: ['delivery', 'supply-scenery', 'load-in'],
    anchors: {
      entry: { gx: 19.5, gy: 20.6 },
      truck: { gx: 23.4, gy: 17.4 },
      sceneryRack: { gx: 24.6, gy: 15.2 },
      loadIn: { gx: 22.2, gy: 16.2 },
    },
  },
  {
    buildingId: 'theater',
    placeId: 'theater',
    label: 'THEATER',
    blurb: 'The house lights dim. View recently released films.',
    texKey: 'tw-theater',
    gx: 3,
    gy: 16,
    fw: 3,
    fd: 2,
    affordances: ['screening', 'premiere'],
    anchors: { entry: { gx: 4.5, gy: 18.6 } },
  },
  {
    buildingId: 'gate',
    placeId: GATE_PLACE_ID,
    label: 'STUDIO GATE',
    blurb: 'Studio Gate',
    texKey: 'tw-gate',
    gx: 9,
    gy: 22,
    fw: 1,
    fd: 3,
    affordances: ['gate-security', 'arrival'],
    anchors: {
      guard: { gx: 11.3, gy: 24.1 },
      arrival: { gx: 9.9, gy: 24.4 },
      inside: { gx: 9.9, gy: 21.2 },
    },
  },
  {
    buildingId: 'expansion',
    placeId: ANNEX_PLACE_ID,
    label: 'ANNEX PARCEL',
    blurb: 'Development & Casting Annex',
    texKey: '', // a marked open parcel until construction completes
    gx: 7,
    gy: 15,
    fw: 4,
    fd: 3,
    affordances: ['develop-studio', 'construct-annex'],
    anchors: { site: { gx: 9, gy: 16.5 } },
  },
]

/** Fast lookup by building id. Every `BuildingId` is present exactly once. */
export const PLACE_BY_BUILDING: Readonly<Record<BuildingId, WorldPlace>> = Object.fromEntries(
  WORLD_PLACES.map((place) => [place.buildingId, place]),
) as Record<BuildingId, WorldPlace>

// ── ground zoning ─────────────────────────────────────────────────────────────

/** Stage Road — the production spine, separating the office side from the stages. */
export const ROADS: readonly Rect[] = [
  { x0: 13, y0: 0, x1: 14, y1: 25 }, // stage road (runs down-left)
  { x0: 0, y0: 7, x1: 27, y1: 8 }, // studio avenue (runs down-right)
  { x0: 9, y0: 19, x1: 10, y1: 25 }, // studio boulevard: plaza → gate
  { x0: 15, y0: 15, x1: 27, y1: 16 }, // service spur into the scenery yard
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
  { x0: 5, y0: 4, x1: 5, y1: 9 }, // development → casting
  { x0: 5, y0: 15, x1: 9, y1: 15 }, // theater → courtyard
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

  // palms lining the boulevard up to the gate — the arrival
  for (let gy = 18.4; gy <= 24; gy += 1.8) {
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
  for (let gy = 10; gy <= 24; gy += 3.5) {
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
  props.push({ texKey: 'tw-booth', gx: 11.3, gy: 23.4 })
  props.push({ texKey: 'tw-barrier', gx: 10.0, gy: 23.6 })
  props.push({ texKey: 'tw-palm', gx: 7.3, gy: 24.4, jitter: 0.05 })
  props.push({ texKey: 'tw-palm', gx: 12.2, gy: 22.0, jitter: 0.05 })

  // scenery yard: racks, stacked flats, crates, a service truck
  props.push({ texKey: 'tw-rack', gx: 24.7, gy: 15.2 })
  props.push({ texKey: 'tw-rack', gx: 25.3, gy: 16.6 })
  props.push({ texKey: 'tw-flats', gx: 23.3, gy: 14.5 })
  props.push({ texKey: 'tw-crate', gx: 22.4, gy: 17.4, jitter: 0.08 })
  props.push({ texKey: 'tw-crate', gx: 23.2, gy: 18.2, jitter: 0.08 })
  props.push({ texKey: 'tw-crate', gx: 24.4, gy: 17.9, jitter: 0.08 })
  props.push({ texKey: 'tw-truck', gx: 23.4, gy: 17.4 })

  // stage aprons: standing gear that belongs to the stages
  props.push({ texKey: 'tw-cart', gx: 21.6, gy: 6.4 })
  props.push({ texKey: 'tw-crate', gx: 16.5, gy: 6.4, jitter: 0.06 })
  props.push({ texKey: 'tw-cart', gx: 21.6, gy: 13.4 })

  // theater forecourt
  props.push({ texKey: 'tw-planter', gx: 6.3, gy: 17.4 })
  props.push({ texKey: 'tw-lamp', gx: 6.5, gy: 15.6 })

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

/** Deterministic slot offsets (in tiles) so co-located people never share a pixel. */
export const PERSON_HOME_SLOTS: readonly GridPoint[] = [
  { gx: 0, gy: 0 },
  { gx: 0.95, gy: 0.35 },
  { gx: 1.85, gy: -0.15 },
  { gx: 0.55, gy: 1.05 },
  { gx: 1.6, gy: 0.95 },
  { gx: 2.5, gy: 0.45 },
]

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
