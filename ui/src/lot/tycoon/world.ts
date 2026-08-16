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
    texKey: 'tw-admin',
    gx: 9,
    gy: 2,
    fw: 3,
    fd: 3,
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
    gx: 3,
    gy: 2,
    fw: 3,
    fd: 2,
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
    gx: 3,
    gy: 9,
    fw: 3,
    fd: 2,
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
    gx: 17,
    gy: 2,
    fw: 4,
    fd: 4,
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
    gx: 17,
    gy: 9,
    fw: 4,
    fd: 4,
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
    gx: 18,
    gy: 18,
    fw: 3,
    fd: 2,
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
    gx: 3,
    gy: 16,
    fw: 3,
    fd: 2,
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
    gx: 8,
    gy: 23,
    fw: 3,
    fd: 1,
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
    gx: 7,
    gy: 15,
    fw: 4,
    fd: 3,
    anchors: {
      site: { gx: 9, gy: 16.5 },
      work: { gx: 9.0, gy: 17.8 },
      wait: { gx: 10.4, gy: 18.0 },
    },
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
