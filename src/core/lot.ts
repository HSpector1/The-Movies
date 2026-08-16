// ── Placement Core V12 — the authored studio lot ─────────────────────────────
//
// The engine owns the property. This module is static authored data plus pure
// geometry: the lot's dimensions, its coarse parcel map, its road network, and
// the two derived predicates placement legality needs (road frontage, severance).
// It consumes no RNG, no wall clock, and no caller-owned mutable state.
//
// ALIGNMENT (binding): the grid, the road rectangles, and every parcel rectangle
// are authored against the M1 tycoon world (`ui/src/lot/tycoon/world.ts`, a 28×26
// isometric tile property). The renderer paints that world; this module is the
// authority for what may be built on it. The two are aligned BY HAND and the
// alignment is asserted in tests — the engine never imports presentation code.
//
// Grid convention (mirrors the renderer): +gx runs down-right on screen, +gy runs
// down-left. Every rectangle here is INCLUSIVE on both bounds, exactly as the
// renderer's ground rectangles are (`TycoonScene.rasterizeGround` walks
// `gy <= r.y1`). Building footprints in the renderer are half-open (`[gx, gx+fw)`);
// those cells are simply absent from the parcel map, which is why a placement can
// never land on Stage 7.
//
// PARCELS OVER TILES (CODE-MINING-LEDGER Entry 3): the parcel map covers only the
// studio's own addressable ground. A cell inside the lot that belongs to no parcel
// is unclaimed ground (`notOwned`); a cell in a `blocked` parcel is owned but not
// buildable (`terrainUnbuildable`). Occupancy is DERIVED from placed facilities and
// is never persisted here or anywhere else.

import type { LotCell, LotParcel, LotRect } from './types.js'

/** Tiles along gx. Mirrors `LOT_W` in the M1 world. */
export const LOT_WIDTH = 28
/** Tiles along gy. Mirrors `LOT_D` in the M1 world. */
export const LOT_DEPTH = 26

/** The legacy Development & Casting Annex parcel id, preserved verbatim from V11. */
export const LEGACY_EXPANSION_PARCEL_ID = 'expansion'

/**
 * The studio road network — the same five rectangles the M1 world paints as roads
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
 * The coarse parcel map. Ten parcels, all owned from the first week (the studio
 * owns its own lot; there is no land market this milestone, so `ownedFromStart`
 * is uniformly true and `notOwned` can only ever mean "not part of the property").
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

/** Canonical cell key. The one string form used by every occupancy index. */
export function cellKey(cell: LotCell): string {
  return `${String(cell.gx)},${String(cell.gy)}`
}

export function isOnLot(cell: LotCell): boolean {
  return (
    Number.isInteger(cell.gx) &&
    Number.isInteger(cell.gy) &&
    cell.gx >= 0 &&
    cell.gy >= 0 &&
    cell.gx < LOT_WIDTH &&
    cell.gy < LOT_DEPTH
  )
}

function rectContains(rect: LotRect, cell: LotCell): boolean {
  return cell.gx >= rect.x0 && cell.gx <= rect.x1 && cell.gy >= rect.y0 && cell.gy <= rect.y1
}

/** Every cell of a rectangle in fixed reading order (ascending gy, then gx). */
export function rectCells(rect: LotRect): LotCell[] {
  const cells: LotCell[] = []
  for (let gy = rect.y0; gy <= rect.y1; gy++) {
    for (let gx = rect.x0; gx <= rect.x1; gx++) cells.push({ gx, gy })
  }
  return cells
}

/** The parcel owning a cell, or null for unclaimed ground / off-lot. */
export function parcelAt(cell: LotCell): LotParcel | null {
  if (!isOnLot(cell)) return null
  for (const parcel of LOT_PARCELS) {
    if (rectContains(parcel.rect, cell)) return parcel
  }
  return null
}

export function parcelById(id: string): LotParcel | null {
  for (const parcel of LOT_PARCELS) {
    if (parcel.id === id) return parcel
  }
  return null
}

// Road membership is a derived predicate over the authored rectangles, built once.
// Nothing iterates this set (order would not be meaningful); it answers membership.
const ROAD_CELL_KEYS: ReadonlySet<string> = (() => {
  const keys = new Set<string>()
  for (const road of LOT_ROADS) {
    for (const cell of rectCells(road)) {
      if (isOnLot(cell)) keys.add(cellKey(cell))
    }
  }
  return keys
})()

export function isRoadCell(cell: LotCell): boolean {
  return ROAD_CELL_KEYS.has(cellKey(cell))
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
 */
export function parcelHasRoadFrontage(parcel: LotParcel): boolean {
  for (const cell of rectCells(parcel.rect)) {
    for (const step of NEIGHBOURS) {
      if (isRoadCell({ gx: cell.gx + step.gx, gy: cell.gy + step.gy })) return true
    }
  }
  return false
}

/**
 * The CorsixTH reachability rule, clean-room: with the candidate footprint marked
 * impassable, walk the ring of cells immediately surrounding it and require every
 * consecutive pair of PASSABLE ring cells to remain connected through passable
 * ground. A failure means the placement would sever the lot into pieces.
 *
 * "All consecutive passable pairs connected" is exactly "all passable ring cells
 * lie in one connected component", so this runs one flood from the first passable
 * ring cell instead of O(perimeter) separate path queries.
 *
 * Passability model (documented deliberately): the obstacles are the lot boundary
 * and the cells already occupied by placed facilities. The authored studio
 * buildings are not obstacles here because the parcel map never overlaps them —
 * a placement cannot reach them to wall anything against them. With the current
 * ten-parcel map, whose buildable parcels are small and separated by open ground
 * and roads, no legal single placement can sever the lot; the rule is nevertheless
 * evaluated on every query (never short-circuited) and binds the moment the parcel
 * map or the catalog grows. Its algorithm is exercised directly by unit tests over
 * synthetic occupancy.
 */
export function placementWouldSeverLot(
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

  const passable = (cell: LotCell): boolean => isOnLot(cell) && !blocked.has(cellKey(cell))
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
