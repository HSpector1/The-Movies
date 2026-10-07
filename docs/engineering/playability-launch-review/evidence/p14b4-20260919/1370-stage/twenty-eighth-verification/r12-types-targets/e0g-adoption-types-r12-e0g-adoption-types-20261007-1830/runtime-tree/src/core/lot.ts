// ── Property Geometry (C1-M1a) — the studio property, as state ────────────────
//
// The engine owns the property. Through V12 that ownership was expressed as
// module constants and every predicate here closed over them, which quietly made
// three things true: the property could never grow, the eight buildings the
// renderer painted were invisible to the engine, and "the lot" was a compile-time
// fact rather than something a savegame could describe.
//
// C1-M1a LAW: this module is now (a) the INITIAL AUTHORED PROPERTY as pure data
// and (b) pure geometry over ANY property it is handed. Nothing below closes over
// `LOT_WIDTH`, `LOT_ROADS`, or `LOT_PARCELS`; every predicate takes the property
// it is being asked about as its first parameter. The constants remain exported
// because they are the authored source of `INITIAL_PROPERTY` and several tests
// assert the renderer alignment against them by name — but they are no longer
// business logic, and 28×26 is the property a NEW studio starts on, not the
// property every studio has forever.
//
// This module consumes no RNG, no wall clock, and no caller-owned mutable state.
//
// ALIGNMENT (binding): the grid, the road rectangles, every parcel rectangle, and
// now every structure footprint are authored against the M1 tycoon world
// (`ui/src/lot/tycoon/world.ts`, a 28×26 isometric tile property). Under V12 the
// renderer was the authority for where the buildings stood and this module did not
// know they existed; under V13 the ENGINE owns that geometry as pure data and the
// renderer keeps only presentation metadata. The engine still never imports
// presentation code, so the alignment is asserted in tests.
//
// Grid convention (mirrors the renderer): +gx runs down-right on screen, +gy runs
// down-left. `LotRect` — roads and parcels — is INCLUSIVE on both bounds, exactly
// as the renderer's ground rectangles are (`TycoonScene.rasterizeGround` walks
// `gy <= r.y1`). FOOTPRINTS — structures and placed facilities — are HALF-OPEN
// (`[gx, gx+width)`), exactly as the renderer's building rectangles are. The two
// conventions are different on purpose and are never mixed.
//
// PARCELS OVER TILES (CODE-MINING-LEDGER Entry 3): the parcel map covers only the
// studio's own addressable ground. A cell inside the property that belongs to no
// parcel is unclaimed ground (`notOwned`); a cell in a `blocked` parcel is owned
// but not buildable (`terrainUnbuildable`). Placement occupancy is DERIVED from
// placed facilities and structures on every read, and is never persisted.

import type {
  LotCell,
  LotParcel,
  LotRect,
  PropertyState,
  PropertyStructure,
} from './types.js'

/** Tiles along gx of the INITIAL authored property. Mirrors `LOT_W` in the M1 world. */
export const LOT_WIDTH = 28
/** Tiles along gy of the INITIAL authored property. Mirrors `LOT_D` in the M1 world. */
export const LOT_DEPTH = 26

/** The legacy Development & Casting Annex parcel id, preserved verbatim from V11. */
export const LEGACY_EXPANSION_PARCEL_ID = 'expansion'

/**
 * The INITIAL road network — the same five rectangles the M1 world paints as roads
 * (stage road, studio avenue, studio boulevard, service spur, back-lot road).
 * Roads are circulation, never ownable land, so they are deliberately NOT parcels.
 */
export const LOT_ROADS: readonly LotRect[] = [
  { x0: 13, y0: 0, x1: 14, y1: 25 }, // stage road
  { x0: 0, y0: 7, x1: 27, y1: 8 }, // studio avenue
  { x0: 9, y0: 19, x1: 10, y1: 25 }, // studio boulevard: plaza → gate
  { x0: 15, y0: 14, x1: 22, y1: 15 }, // service spur to the scenery yard
  { x0: 14, y0: 21, x1: 22, y1: 22 }, // back-lot road to the parking apron
]

/**
 * The INITIAL coarse parcel map. Ten parcels, all owned from the first week (the
 * studio owns its own lot; there is no land market this milestone, so
 * `ownedFromStart` is uniformly true and `notOwned` can only ever mean "not part
 * of the property").
 *
 * Eight are buildable ground; two are owned-but-protected (`blocked`) so the
 * `terrainUnbuildable` rule has real subjects: the central courtyard is the
 * studio's civic plaza and the scenery yard hardstanding is working ground the
 * Scenery & Post building already uses.
 *
 * `expansion` is the legacy V11 fixed parcel. Its id is preserved exactly. Its
 * rectangle is the renderer's graded Annex pad (gy 15–17) PLUS the one-tile
 * boulevard frontage strip at gy 18, so the parcel genuinely fronts the studio
 * boulevard exactly as the M1 world describes it ("front-centre the Annex
 * expansion parcel, on the boulevard").
 *
 * `north-back-lot` deliberately has NO road frontage: it is the deep graded
 * ground behind Stage 7, owned and buildable but unserved until a spur is built.
 * It is what makes `noRoadAccess` a live rule rather than a decorative one.
 *
 * NO PARCEL OVERLAPS ANY STRUCTURE FOOTPRINT. That is an authored fact about this
 * initial property, not a law of the type — but it is the exact reason adding
 * structures to the occupancy index in C1-M1a changed no query verdict, so it is
 * asserted directly in the neutrality tests rather than assumed.
 */
export const LOT_PARCELS: readonly LotParcel[] = [
  {
    id: 'backlot-apron',
    label: 'Back-Lot Apron',
    terrain: 'buildable',
    rect: { x0: 23, y0: 20, x1: 26, y1: 24 },
    ownedFromStart: true,
  },
  {
    id: 'courtyard',
    label: 'Central Courtyard',
    terrain: 'blocked',
    rect: { x0: 7, y0: 10, x1: 11, y1: 14 },
    ownedFromStart: true,
  },
  {
    id: LEGACY_EXPANSION_PARCEL_ID,
    label: 'Annex Expansion Parcel',
    terrain: 'buildable',
    rect: { x0: 7, y0: 15, x1: 10, y1: 18 },
    ownedFromStart: true,
  },
  {
    id: 'north-back-lot',
    label: 'North Back Lot',
    terrain: 'buildable',
    rect: { x0: 21, y0: 0, x1: 27, y1: 5 },
    ownedFromStart: true,
  },
  {
    id: 'north-court',
    label: 'North Court',
    terrain: 'buildable',
    rect: { x0: 6, y0: 2, x1: 8, y1: 6 },
    ownedFromStart: true,
  },
  {
    id: 'north-lawn',
    label: 'North Lawn',
    terrain: 'buildable',
    rect: { x0: 0, y0: 2, x1: 2, y1: 6 },
    ownedFromStart: true,
  },
  {
    id: 'service-yard',
    label: 'Scenery & Service Yard',
    terrain: 'blocked',
    rect: { x0: 21, y0: 16, x1: 26, y1: 18 },
    ownedFromStart: true,
  },
  {
    id: 'south-lawn',
    label: 'South Lawn',
    terrain: 'buildable',
    rect: { x0: 3, y0: 19, x1: 8, y1: 22 },
    ownedFromStart: true,
  },
  {
    id: 'stage-south',
    label: 'Stage South Pad',
    terrain: 'buildable',
    rect: { x0: 15, y0: 16, x1: 17, y1: 20 },
    ownedFromStart: true,
  },
  {
    id: 'west-lawn',
    label: 'West Lawn',
    terrain: 'buildable',
    rect: { x0: 0, y0: 9, x1: 2, y1: 14 },
    ownedFromStart: true,
  },
]

/**
 * The INITIAL authored structures — the eight physical bodies the studio starts
 * with, as ENGINE data (C1-M1a).
 *
 * The numbers are lifted VERBATIM from the M1 renderer's `WORLD_PLACES`. They are
 * not imported: the engine owns its own geometry and never depends on presentation
 * code. The alignment is asserted in tests, exactly as the road and parcel
 * alignment already was.
 *
 * Three are landmarks with no engine capacity — the Gate, Administration, and the
 * Theater are civic bodies that occupy ground and nothing else. Five are founding
 * bodies that house the studio's starting plant, and `providesFacilityIds` names
 * exactly which `INITIAL_STUDIO_FACILITIES` entries work inside each.
 *
 * ACCEPTED M1.5 BEHAVIOR, deliberately preserved: `casting` provides NOTHING. The
 * engine models ONE shared 'Development & Casting' facility, and its body stands
 * at Development. The Casting / Talent building is a real body on real ground with
 * no separate engine capacity behind it. Splitting it into a second facility would
 * change the capacity model, which this behavior-neutral milestone may not do — so
 * the honest empty list is recorded here rather than a convenient fiction.
 *
 * The Annex expansion PARCEL is not a structure. It is graded open ground with no
 * body on it until a placement completes there, which is why the renderer draws it
 * as a marked pad and why it is the one world footprint the parcel map covers.
 */
export const INITIAL_PROPERTY_STRUCTURES: readonly PropertyStructure[] = [
  {
    id: 'gate',
    label: 'Studio Gate',
    role: 'landmark',
    // The arch straddles the boulevard: three tiles across gx, one deep in gy, so
    // the road (gx 9–10) passes under it exactly as an entrance should.
    origin: { gx: 8, gy: 23 },
    footprint: { width: 3, depth: 1 },
    providesFacilityIds: [],
  },
  {
    id: 'admin',
    label: 'Administration',
    role: 'landmark',
    origin: { gx: 9, gy: 2 },
    footprint: { width: 3, depth: 3 },
    providesFacilityIds: [],
  },
  {
    id: 'theater',
    label: 'Theater',
    role: 'landmark',
    origin: { gx: 3, gy: 16 },
    footprint: { width: 3, depth: 2 },
    providesFacilityIds: [],
  },
  {
    id: 'writers',
    label: 'Development',
    role: 'founding',
    origin: { gx: 3, gy: 2 },
    footprint: { width: 3, depth: 2 },
    providesFacilityIds: ['facility-development-casting'],
  },
  {
    id: 'casting',
    label: 'Casting / Talent',
    role: 'founding',
    origin: { gx: 3, gy: 9 },
    footprint: { width: 3, depth: 2 },
    // Intentionally empty — see the note above. The shared Development & Casting
    // facility's body stands at `writers`.
    providesFacilityIds: [],
  },
  {
    id: 'stage-a',
    label: 'Stage A',
    role: 'founding',
    origin: { gx: 17, gy: 2 },
    footprint: { width: 4, depth: 4 },
    providesFacilityIds: ['facility-soundstage-07'],
  },
  {
    id: 'stage-b',
    label: 'Stage B',
    role: 'founding',
    origin: { gx: 17, gy: 9 },
    footprint: { width: 4, depth: 4 },
    providesFacilityIds: ['facility-soundstage-12'],
  },
  {
    id: 'post',
    label: 'Production / Post',
    role: 'founding',
    origin: { gx: 18, gy: 18 },
    footprint: { width: 3, depth: 2 },
    providesFacilityIds: ['facility-post-building', 'facility-scenery-shop'],
  },
]

/**
 * THE INITIAL AUTHORED PROPERTY — the property a new studio starts on, and the
 * exact value `convertV12ToV13` synthesizes for a migrated world.
 *
 * Deep-frozen so no caller can quietly edit the authored source of truth. A live
 * GameState never holds this object: it holds a deep copy from `initialProperty()`.
 */
export const INITIAL_PROPERTY: PropertyState = deepFreezeProperty({
  bounds: { width: LOT_WIDTH, depth: LOT_DEPTH },
  roads: LOT_ROADS.map((road) => ({ ...road })),
  parcels: LOT_PARCELS.map((parcel) => ({ ...parcel, rect: { ...parcel.rect } })),
  structures: INITIAL_PROPERTY_STRUCTURES.map((structure) => ({
    ...structure,
    origin: { ...structure.origin },
    footprint: { ...structure.footprint },
    providesFacilityIds: [...structure.providesFacilityIds],
  })),
})

function deepFreezeProperty(property: PropertyState): PropertyState {
  for (const road of property.roads) Object.freeze(road)
  Object.freeze(property.roads)
  for (const parcel of property.parcels) {
    Object.freeze(parcel.rect)
    Object.freeze(parcel)
  }
  Object.freeze(property.parcels)
  for (const structure of property.structures) {
    Object.freeze(structure.origin)
    Object.freeze(structure.footprint)
    Object.freeze(structure.providesFacilityIds)
    Object.freeze(structure)
  }
  Object.freeze(property.structures)
  Object.freeze(property.bounds)
  return Object.freeze(property)
}

/** A fresh, fully mutable deep copy of the initial authored property. */
export function initialProperty(): PropertyState {
  return clonePropertyState(INITIAL_PROPERTY)
}

// ── P09 — THE AUTHORED BARE-LOT PROPERTY (charter §16/§17) ───────────────────
//
// A SEPARATE authored property for the sparse 1920 start. `INITIAL_PROPERTY` is
// never edited or repurposed (§16); this is NEW data on its OWN grid.
//
// P09 W1c — the ground is authored to the world the player actually sees. The
// accepted Unity lot (`StudioLot.unity`) is a hand-composed 1948 layout, not a
// rendering of the endowed 28×26 grid, so a bare lot that reused that grid would
// put its engine ground under the wrong art. The bare lot is instead measured
// from the scene's authored ground plane (`Studio Property Ground`, 178 × 114
// world units) at ONE cell size — the Gate Boulevard's authored width over the
// Gate's three-cell footprint (12.5 / 3 ≈ 4.1667 units per cell) — which gives
// a 42 × 27 grid whose Gate arch stands astride the authored boulevard exactly
// where the scene has it, whose Administration sits on the authored
// Administration pad, and whose roads trace the authored circulation
// (Gate Boulevard, the Production Crossroad, the Stage Service Road). A Unity
// grid presenter anchored on the Gate then places every engine cell on the
// ground the art already shows; nothing about legality is read from art.
//
// What it contains, and nothing else (§17): the two civic LANDMARKS (Gate,
// Administration — no engine capacity), the authored roads, and OWNED buildable
// ground sized so the minimum first-film plant (office 3×2, scenery 3×2,
// soundstage 4×4, post 3×2, every one with a clearance ring and road frontage)
// fits with room to grow.
//
// What it deliberately does NOT contain: any `founding` structure (so
// `foundingFacilitiesOf` yields nothing and the managed operations root starts
// EMPTY), the Theater, and the legacy `expansion` parcel id (whose reserved
// Annex contract belongs to the endowed lot's history, not to open ground).
export const BARE_LOT_WIDTH = 42
export const BARE_LOT_DEPTH = 27

/** The bare lot's circulation, tracing the authored scene roads (half-open cell rects). */
export const BARE_LOT_ROADS: readonly LotRect[] = [
  { x0: 21, y0: 10, x1: 23, y1: 26 }, // Gate Boulevard: the plaza → the Gate arch (three cells wide)
  { x0: 0, y0: 11, x1: 40, y1: 13 }, // Production Crossroad: the east–west avenue
  { x0: 39, y0: 0, x1: 40, y1: 13 }, // Stage Service Road: north–south along the east edge
]

export const BARE_LOT_PARCELS: readonly LotParcel[] = [
  {
    id: 'north-yard',
    label: 'North Yard',
    terrain: 'buildable',
    rect: { x0: 0, y0: 0, x1: 38, y1: 10 },
    ownedFromStart: true,
  }, // north of the Crossroad, fronting it and the Service Road
  {
    id: 'west-yard',
    label: 'West Yard',
    terrain: 'buildable',
    rect: { x0: 0, y0: 14, x1: 7, y1: 25 },
    ownedFromStart: true,
  }, // west of Administration, fronting the Crossroad
  {
    id: 'gate-court-west',
    label: 'Gate Court West',
    terrain: 'buildable',
    rect: { x0: 11, y0: 14, x1: 20, y1: 25 },
    ownedFromStart: true,
  }, // between Administration and the Boulevard
  {
    id: 'gate-court-east',
    label: 'Gate Court East',
    terrain: 'buildable',
    rect: { x0: 24, y0: 14, x1: 41, y1: 25 },
    ownedFromStart: true,
  }, // east of the Boulevard to the property edge
]

export const BARE_LOT_STRUCTURES: readonly PropertyStructure[] = [
  {
    id: 'gate',
    label: 'Studio Gate',
    role: 'landmark',
    origin: { gx: 21, gy: 26 }, // astride the Boulevard's southern end — the authored arch
    footprint: { width: 3, depth: 1 },
    providesFacilityIds: [],
  },
  {
    id: 'admin',
    label: 'Administration',
    role: 'landmark',
    origin: { gx: 8, gy: 18 }, // the authored Administration pad, west of the Boulevard
    footprint: { width: 3, depth: 3 },
    providesFacilityIds: [],
  },
]

export const BARE_LOT_PROPERTY: PropertyState = deepFreezeProperty({
  bounds: { width: BARE_LOT_WIDTH, depth: BARE_LOT_DEPTH },
  roads: BARE_LOT_ROADS.map((road) => ({ ...road })),
  parcels: BARE_LOT_PARCELS.map((parcel) => ({ ...parcel, rect: { ...parcel.rect } })),
  structures: BARE_LOT_STRUCTURES.map((structure) => ({
    ...structure,
    origin: { ...structure.origin },
    footprint: { ...structure.footprint },
    providesFacilityIds: [...structure.providesFacilityIds],
  })),
})

/** A fresh, fully mutable deep copy of the authored bare-lot property. */
export function bareLotProperty(): PropertyState {
  return clonePropertyState(BARE_LOT_PROPERTY)
}

/** A deep copy of any property. Pure data in, pure data out. */
export function clonePropertyState(property: PropertyState): PropertyState {
  return {
    bounds: { ...property.bounds },
    roads: property.roads.map((road) => ({ ...road })),
    parcels: property.parcels.map((parcel) => ({ ...parcel, rect: { ...parcel.rect } })),
    structures: property.structures.map((structure) => ({
      ...structure,
      origin: { ...structure.origin },
      footprint: { ...structure.footprint },
      providesFacilityIds: [...structure.providesFacilityIds],
    })),
  }
}

/**
 * The property a state is governed by.
 *
 * A V13 state owns an explicit `property` root and this returns it. A FROZEN ≤V12
 * projection has no property root at all, because V12's property was the module
 * constants above — and `INITIAL_PROPERTY` IS those constants, which is exactly
 * what `convertV12ToV13` synthesizes for such a state.
 *
 * So the fallback is not a default and not a guess: it is the same value the
 * migration produces, which is what lets the frozen V12 save validator keep
 * proving V12 files with the ONE live placement authority instead of a second
 * historical copy of the rules. Every live surface passes a real V13 state.
 */
export function propertyOf(state: { property?: PropertyState }): PropertyState {
  return state.property ?? INITIAL_PROPERTY
}

/** Canonical cell key. The one string form used by every occupancy index. */
export function cellKey(cell: LotCell): string {
  return `${String(cell.gx)},${String(cell.gy)}`
}

export function isOnLot(property: PropertyState, cell: LotCell): boolean {
  return (
    Number.isInteger(cell.gx) &&
    Number.isInteger(cell.gy) &&
    cell.gx >= 0 &&
    cell.gy >= 0 &&
    cell.gx < property.bounds.width &&
    cell.gy < property.bounds.depth
  )
}

function rectContains(rect: LotRect, cell: LotCell): boolean {
  return cell.gx >= rect.x0 && cell.gx <= rect.x1 && cell.gy >= rect.y0 && cell.gy <= rect.y1
}

/** Every cell of an INCLUSIVE rectangle in fixed reading order (ascending gy, then gx). */
export function rectCells(rect: LotRect): LotCell[] {
  const cells: LotCell[] = []
  for (let gy = rect.y0; gy <= rect.y1; gy++) {
    for (let gx = rect.x0; gx <= rect.x1; gx++) cells.push({ gx, gy })
  }
  return cells
}

/**
 * Every cell of a structure's HALF-OPEN footprint, in fixed reading order. Same
 * convention and same order as `footprintCells` uses for a blueprint, so the two
 * kinds of body index into occupancy identically.
 */
export function structureCells(structure: PropertyStructure): LotCell[] {
  const cells: LotCell[] = []
  for (let dy = 0; dy < structure.footprint.depth; dy++) {
    for (let dx = 0; dx < structure.footprint.width; dx++) {
      cells.push({ gx: structure.origin.gx + dx, gy: structure.origin.gy + dy })
    }
  }
  return cells
}

/**
 * Every cell physically occupied by an authored structure. Membership only;
 * nothing iterates it, so its insertion order is never observable.
 *
 * C1-M1a: this is what makes today's buildings first-class ground. Before it, the
 * engine could not answer "is something standing here?" about its own studio.
 */
export function propertyStructureCellKeys(property: PropertyState): ReadonlySet<string> {
  const keys = new Set<string>()
  for (const structure of property.structures) {
    for (const cell of structureCells(structure)) keys.add(cellKey(cell))
  }
  return keys
}

/** The parcel owning a cell, or null for unclaimed ground / off-property. */
export function parcelAt(property: PropertyState, cell: LotCell): LotParcel | null {
  if (!isOnLot(property, cell)) return null
  for (const parcel of property.parcels) {
    if (rectContains(parcel.rect, cell)) return parcel
  }
  return null
}

export function parcelById(property: PropertyState, id: string): LotParcel | null {
  for (const parcel of property.parcels) {
    if (parcel.id === id) return parcel
  }
  return null
}

/**
 * Road membership as a derived set over the property's own road rectangles.
 *
 * Under V12 this was a module-level constant computed once. It is now derived per
 * property, because a property is state and a constant cannot describe a road
 * network that grows. Nothing iterates the result (order would not be meaningful);
 * it answers membership.
 */
export function roadCellKeys(property: PropertyState): ReadonlySet<string> {
  const keys = new Set<string>()
  for (const road of property.roads) {
    for (const cell of rectCells(road)) {
      if (isOnLot(property, cell)) keys.add(cellKey(cell))
    }
  }
  return keys
}

export function isRoadCell(property: PropertyState, cell: LotCell): boolean {
  return roadCellKeys(property).has(cellKey(cell))
}

/** Fixed orthogonal neighbour order: +gx, −gx, +gy, −gy. */
const NEIGHBOURS: readonly LotCell[] = [
  { gx: 1, gy: 0 },
  { gx: -1, gy: 0 },
  { gx: 0, gy: 1 },
  { gx: 0, gy: -1 },
]

/**
 * Road frontage is a property of the SITE, not of a single wall. A parcel fronts a
 * road when any of its cells is orthogonally adjacent to a road cell — the same
 * question a construction manager asks ("can a truck reach this site?"). Checking
 * the parcel rather than the individual footprint is what lets the legacy Annex,
 * which V11 law already permits on its graded pad, keep passing after the bump.
 *
 * The road index is built once per call rather than per candidate cell, so a
 * parcel of any size costs one pass over the property's roads.
 */
export function parcelHasRoadFrontage(property: PropertyState, parcel: LotParcel): boolean {
  const roads = roadCellKeys(property)
  for (const cell of rectCells(parcel.rect)) {
    for (const step of NEIGHBOURS) {
      if (roads.has(cellKey({ gx: cell.gx + step.gx, gy: cell.gy + step.gy }))) return true
    }
  }
  return false
}

/**
 * The CorsixTH reachability rule, clean-room: with the candidate footprint marked
 * impassable, walk the ring of cells immediately surrounding it and require every
 * consecutive pair of PASSABLE ring cells to remain connected through passable
 * ground. A failure means the placement would sever the property into pieces.
 *
 * "All consecutive passable pairs connected" is exactly "all passable ring cells
 * lie in one connected component", so this runs one flood from the first passable
 * ring cell instead of O(perimeter) separate path queries.
 *
 * Passability model (C1-M1a, updated and MORE truthful than V12's): the obstacles
 * are the property boundary and `occupiedCellKeys` — which now includes the
 * authored structures as well as placed facilities. V12 deliberately excluded the
 * authored buildings on the grounds that the parcel map never overlaps them, so a
 * placement could not reach them to wall anything against them. That reasoning was
 * sound but the model was a fiction: a soundstage IS impassable ground. Including
 * structures was verified to change NO verdict at any origin on the initial
 * property (the severance-neutrality sweep in the tests), so the rule got more
 * honest at zero behavioral cost — and it binds correctly the moment the property
 * grows a parcel beside a building.
 *
 * The rule is never short-circuited: it is evaluated on every query.
 */
export function placementWouldSeverLot(
  property: PropertyState,
  occupiedCellKeys: ReadonlySet<string>,
  candidateCells: readonly LotCell[],
): boolean {
  const blocked = new Set<string>(occupiedCellKeys)
  for (const cell of candidateCells) blocked.add(cellKey(cell))

  let x0 = Number.POSITIVE_INFINITY
  let y0 = Number.POSITIVE_INFINITY
  let x1 = Number.NEGATIVE_INFINITY
  let y1 = Number.NEGATIVE_INFINITY
  for (const cell of candidateCells) {
    if (cell.gx < x0) x0 = cell.gx
    if (cell.gy < y0) y0 = cell.gy
    if (cell.gx > x1) x1 = cell.gx
    if (cell.gy > y1) y1 = cell.gy
  }
  if (!Number.isFinite(x0)) return false

  // The ring, walked in one fixed order: top edge left→right, right edge top→bottom,
  // bottom edge right→left, left edge bottom→top.
  const ring: LotCell[] = []
  for (let gx = x0 - 1; gx <= x1 + 1; gx++) ring.push({ gx, gy: y0 - 1 })
  for (let gy = y0; gy <= y1; gy++) ring.push({ gx: x1 + 1, gy })
  for (let gx = x1 + 1; gx >= x0 - 1; gx--) ring.push({ gx, gy: y1 + 1 })
  for (let gy = y1; gy >= y0; gy--) ring.push({ gx: x0 - 1, gy })

  const passable = (cell: LotCell): boolean =>
    isOnLot(property, cell) && !blocked.has(cellKey(cell))
  const passableRing = ring.filter(passable)
  if (passableRing.length < 2) return false

  const seen = new Set<string>()
  const queue: LotCell[] = [passableRing[0]!]
  seen.add(cellKey(passableRing[0]!))
  while (queue.length > 0) {
    const cell = queue.shift()!
    for (const step of NEIGHBOURS) {
      const next = { gx: cell.gx + step.gx, gy: cell.gy + step.gy }
      const key = cellKey(next)
      if (seen.has(key) || !passable(next)) continue
      seen.add(key)
      queue.push(next)
    }
  }
  for (const cell of passableRing) {
    if (!seen.has(cellKey(cell))) return true
  }
  return false
}
