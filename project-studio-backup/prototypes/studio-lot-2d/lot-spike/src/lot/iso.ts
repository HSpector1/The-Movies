// ── Isometric projection ──────────────────────────────────────────────────────
// A brief technical inspection (recorded in README §"Why not Phaser's iso
// tilemap") concluded that a hand-composed lot with custom building sprites and
// precise depth control is best served by a direct 2:1 isometric transform over a
// logical grid, rather than Phaser's Tiled-oriented isometric tilemap loader.
// The math is tiny and gives us full control of placement and z-order.

/** Tile footprint in screen pixels — classic 2:1 diamond. */
export const TILE_W = 128
export const TILE_H = 64

export type Grid = { gx: number; gy: number }
export type Screen = { x: number; y: number }

/** Grid cell (can be fractional) → screen pixels, relative to the world origin. */
export function gridToScreen(gx: number, gy: number): Screen {
  return {
    x: (gx - gy) * (TILE_W / 2),
    y: (gx + gy) * (TILE_H / 2),
  }
}

/** Screen pixels → fractional grid cell. Inverse of gridToScreen. */
export function screenToGrid(x: number, y: number): Grid {
  const hw = TILE_W / 2
  const hh = TILE_H / 2
  return {
    gx: (x / hw + y / hh) / 2,
    gy: (y / hh - x / hw) / 2,
  }
}

/**
 * Depth key for painter's-algorithm sorting. Larger = nearer the camera = drawn
 * on top. We key on the front-most grid corner (gx+gy) so a building always sorts
 * behind things in front of it, then add a small layer bias to keep ground below
 * props below buildings when their corners tie.
 */
export function depthFor(gx: number, gy: number, layerBias = 0): number {
  return (gx + gy) * 16 + layerBias
}

export const LAYER = {
  ground: 0,
  dressing: 1, // paths, planters, lot markings
  shadow: 2,
  building: 4,
  prop: 6, // water tower, signage, vehicles, workers resolved per-tile
  overlay: 10_000, // production banners, selection ring (always above their tile)
} as const
