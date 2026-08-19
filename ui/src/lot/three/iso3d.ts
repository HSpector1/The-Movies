// ── iso3d — the ONE mapping between the lot grid and 3D world space ───────────
//
// The 3D world renders the SAME logical grid the 2:1 isometric world renders:
// +gx runs down-right on screen, +gy runs down-left, fractional coordinates are
// legal everywhere. This module is the whole coordinate contract:
//
//     grid (gx, gy)  →  world (gx·TILE_M, 0, gy·TILE_M)
//
// and the orthographic camera is aimed so that a 3D frame and a 2D frame of the
// same grid point at the same tycoon zoom show the same ground. Nothing here
// reads engine state and nothing here decides a rule — it is projection math.

import { Vector3 } from 'three'
import type { GridPoint } from '../tycoon/world.ts'

/** Metres of ground one tile edge spans. Presentation constant, not TUNING. */
export const TILE_M = 4

/**
 * Metres of screen-horizontal ground per 2D world pixel.
 *
 * In the 2:1 world one tile diamond is 128 px wide; in 3D the same diamond is the
 * tile's ground diagonal, TILE_M·√2 metres. The ratio converts any tycoon camera
 * zoom into an orthographic frustum size, which is what keeps a before/after pair
 * framed identically.
 */
export const M_PER_PX = (TILE_M * Math.SQRT2) / 128

/** Grid point → world-space position on the ground plane (y = 0). */
export function gridToWorld(gx: number, gy: number, y = 0): Vector3 {
  return new Vector3(gx * TILE_M, y, gy * TILE_M)
}

/** World-space position → grid point (inverse of gridToWorld, ground plane). */
export function worldToGrid(x: number, z: number): GridPoint {
  return { gx: x / TILE_M, gy: z / TILE_M }
}

/**
 * The camera's offset direction from its target, normalized.
 *
 * Azimuth: from (+x, +z) looking back at the origin, which puts +gx down-right and
 * +gy down-left on screen — the 2D world's own orientation. Elevation: 30° above
 * the horizon, which is exactly the 2:1 dimetric foreshortening the tile art uses.
 */
export const CAMERA_OFFSET_DIR = new Vector3(1, Math.SQRT2 * Math.tan(Math.PI / 6), 1).normalize()

/** Distance the eye sits from its target. Pure ortho translation — any value clears the set. */
export const CAMERA_DISTANCE_M = 420

/**
 * The sun's offset direction from the scene, normalized.
 *
 * Chosen against the 2D identity contract (palette.ts): the lit vertical face is the
 * +gy face, which renders screen-LEFT, and shadows fall toward screen lower-right.
 * With the camera on the (+x, +z) diagonal that means the sun stands on the +z side,
 * behind −x, and high — a warm mid-afternoon key, one light, like the baked art.
 */
export const SUN_OFFSET_DIR = new Vector3(-0.62, 1.05, 0.5).normalize()

/** Tycoon zoom → orthographic half-width in metres for a given viewport width. */
export function orthoHalfWidth(viewportPxWidth: number, zoom: number): number {
  return ((viewportPxWidth / 2) * M_PER_PX) / zoom
}
