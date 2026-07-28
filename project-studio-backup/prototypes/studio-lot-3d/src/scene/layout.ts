// ── World layout (metres) ─────────────────────────────────────────────────────
// One representative studio section, laid out per the approved scale sheet
// (1.8 m character unit; soundstage ~13 m tall; water tower ~18 m). X = right,
// Z = depth (+Z toward the front/gate), Y = up. Greybox uses primitives only.

import type { BuildingId } from '../types/snapshot'

export type Vec2 = [x: number, z: number]
export type Vec3 = [x: number, y: number, z: number]

export type BuildingKind =
  | 'gate'
  | 'admin'
  | 'soundstage'
  | 'theater'
  | 'bungalow'
  | 'backlot'
  | 'watertower'

export type BuildingSpec = {
  id: BuildingId
  kind: BuildingKind
  pos: Vec2 // ground-centre
  size: [w: number, d: number]
  height: number
  label: string
  /** selectable buildings emit intents; landmarks (water tower) may be false */
  selectable: boolean
}

// Scale-sheet heights (m): character 1.8, door 2.2, truck 4, trailer 3, palm 9,
// gate 7, soundstage 13, admin 17, water tower 18.
export const BUILDINGS: BuildingSpec[] = [
  { id: 'gate', kind: 'gate', pos: [0, 22], size: [10, 3], height: 7, label: 'Studio Gate', selectable: true },
  { id: 'admin', kind: 'admin', pos: [-2, -20], size: [16, 12], height: 17, label: 'Administration', selectable: true },
  { id: 'stage-a', kind: 'soundstage', pos: [20, 0], size: [16, 22], height: 13, label: 'Soundstage A', selectable: true },
  { id: 'theater', kind: 'theater', pos: [-17, 13], size: [10, 8], height: 9, label: 'Screening Theater', selectable: true },
  { id: 'writers', kind: 'bungalow', pos: [-19, 1], size: [8, 6], height: 5, label: "Writers' Building", selectable: true },
  { id: 'casting', kind: 'bungalow', pos: [-19, -9], size: [8, 6], height: 5, label: 'Casting Office', selectable: true },
  { id: 'backlot', kind: 'backlot', pos: [20, -18], size: [22, 4], height: 8, label: 'Backlot Street', selectable: true },
]

// water-tower landmark (non-selectable prop, but part of identity)
export const WATER_TOWER: { pos: Vec2; height: number } = { pos: [33, -8], height: 18 }

// ground zones (metres): boulevard along Z, loading apron in front of the stage
export const GROUND = {
  size: 120,
  boulevard: { x: 0, halfW: 4, z0: -14, z1: 26 }, // gate → admin
  crossRoad: { z: 0, halfW: 3, x0: -6, x1: 34 }, // toward the stage apron
  apron: { cx: 10.5, cz: 2, w: 8, d: 16 }, // tarmac in front of the stage doors
}

// stage-A door + apron anchors. The soundstage footprint is x∈[12,28]; the doors
// are on its −X face at x=12, so ALL apron anchors sit at x<12 (in front of the
// doors) and NEVER inside the footprint. Characters enter the stage only at the
// door (x=12) and only when it is open.
export const STAGE_A = {
  doorCentre: [12, 0, 0] as Vec3, // the door plane on the −X face
  threshold: [11.2, 0, 0] as Vec3, // just outside the doors (approach/stop point)
  apronGear: [9.5, 0, 5] as Vec3,
  crew: [
    [10.5, 0, 4] as Vec3,
    [8.6, 0, 6] as Vec3,
    [10.8, 0, 7.5] as Vec3,
  ],
  truck: [8.5, 0, 4.5] as Vec3,
  trailer: [7, 0, 12] as Vec3,
  vanPark: [8.5, 0, 9] as Vec3,
  vanEntry: [8.5, 0, 27] as Vec3, // straight service corridor at x=8.5 (clear of the stage)
}

// ── routing validation (deterministic, authored — NOT a pathfinder) ───────────
// Building footprint rectangles (x0,z0)-(x1,z1); used to validate that authored
// vehicle/character routes never cross solid geometry.
export type FootRect = { id: BuildingId; x0: number; z0: number; x1: number; z1: number }
export const FOOTPRINTS: FootRect[] = BUILDINGS.map((b) => ({
  id: b.id,
  x0: b.pos[0] - b.size[0] / 2,
  z0: b.pos[1] - b.size[1] / 2,
  x1: b.pos[0] + b.size[0] / 2,
  z1: b.pos[1] + b.size[1] / 2,
}))

/** Which footprint (if any) contains a point, with an optional padding margin. */
export function inFootprint(x: number, z: number, pad = 0): BuildingId | null {
  for (const f of FOOTPRINTS) {
    if (x >= f.x0 - pad && x <= f.x1 + pad && z >= f.z0 - pad && z <= f.z1 + pad) return f.id
  }
  return null
}

/**
 * Is a straight segment clear of all building footprints? Sampled densely.
 * `doorException` = a building whose footprint may be touched ONLY at its door
 * (used when a character legitimately enters through an open doorway).
 */
export function segClear(
  ax: number,
  az: number,
  bx: number,
  bz: number,
  pad = 0.2,
  doorException?: BuildingId,
): boolean {
  const steps = Math.max(2, Math.ceil(Math.hypot(bx - ax, bz - az) * 4))
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const hit = inFootprint(ax + (bx - ax) * t, az + (bz - az) * t, pad)
    if (hit && hit !== doorException) return false
  }
  return true
}

// camera presets: [position, target]
// NOTE: stage-A doors face −X (toward the boulevard/apron at x≈11). Production and
// human cameras sit on that −X/front side so the apron action is not occluded by
// the stage mass (x 12..28).
export const CAMERA_PRESETS: Record<'overview' | 'production' | 'human', { pos: Vec3; target: Vec3 }> = {
  overview: { pos: [46, 38, 50], target: [4, 4, 2] },
  production: { pos: [1, 11, 22], target: [12, 2.5, 4] },
  human: { pos: [5.5, 3.4, 14], target: [12, 1.5, 6.5] },
}

// ── static obstacles (Gate-C defect B: represent props/vegetation in traversal
// data). ONE source of truth for both the rendered scene AND route validation, so
// no authored character route crosses a tree trunk or a major prop footprint. These
// are deterministic authored footprints — NOT a pathfinder. ──────────────────────

// vegetation: trees are on the WEST verge + gate sentinels + a few accents, kept
// clear of the authored ambient loops and the apron cast band (x 8.5–12, z 0–7).
export const TREES: Vec2[] = [
  [-6.5, 22], [-6.5, 17], [-6.5, 14], [-6.5, 9], [-6.5, -1], [-6.5, -6], [-6.5, -11],
  [9.5, 24], [-9.5, 24], [-24, 9], [-24, -3], [-13, -15], [-11, 10],
]
export const HEDGES: { pos: Vec2; w: number; d: number }[] = [
  { pos: [-2, -7.5], w: 12, d: 0.8 },
  { pos: [-14.5, 1], w: 0.8, d: 5 },
  { pos: [-14.5, -9], w: 0.8, d: 5 },
]

// talent trailer (parked south of the crossroad, clear of the human camera AND the
// char-crew1 ambient loop at z≈-6 — validated as an obstacle)
export const TRAILER_POS: Vec3 = [4.5, 0, -10]

// production apron props — placed WEST/rear of the cast band so the vignette cast
// never walks through them. id → circular footprint on the ground.
export const APRON_PROPS: { id: string; pos: Vec2; r: number }[] = [
  { id: 'crane', pos: [6.2, 3.0], r: 1.3 },
  { id: 'filmCamera', pos: [7.0, 4.6], r: 0.7 },
  { id: 'monitor', pos: [5.6, 5.8], r: 0.6 },
  { id: 'light1', pos: [6.6, 8.2], r: 0.6 },
  { id: 'light2', pos: [11.6, 8.2], r: 0.6 },
  { id: 'gear', pos: [6.4, 6.6], r: 0.9 },
  { id: 'trailer', pos: [TRAILER_POS[0], TRAILER_POS[2]], r: 3.0 },
]
export const propPos = (id: string): Vec2 => APRON_PROPS.find((p) => p.id === id)!.pos

// spaced apron crew staging (Gate-C defect C: ≥ ~2 m apart, out of the cast band,
// clear of props) — role-specific observers, not a stack on one waypoint.
export const APRON_CREW: Vec2[] = [
  [7.6, 7.2], [9.8, 8.2], [11.4, 6.8],
]

export type ObstacleCircle = { id: string; x: number; z: number; r: number }
export const OBSTACLES: ObstacleCircle[] = [
  ...TREES.map((t, i) => ({ id: `tree-${i}`, x: t[0], z: t[1], r: 0.6 })),
  ...APRON_PROPS.map((p) => ({ id: p.id, x: p.pos[0], z: p.pos[1], r: p.r })),
]

/** Is a point inside any obstacle circle or hedge rect (with padding)? Returns id. */
export function inObstacle(x: number, z: number, pad = 0.15): string | null {
  for (const o of OBSTACLES) {
    const dx = x - o.x
    const dz = z - o.z
    const rr = o.r + pad
    if (dx * dx + dz * dz <= rr * rr) return o.id
  }
  for (const h of HEDGES) {
    if (Math.abs(x - h.pos[0]) <= h.w / 2 + pad && Math.abs(z - h.pos[1]) <= h.d / 2 + pad) return `hedge@${h.pos[0]},${h.pos[1]}`
  }
  return null
}

/** Is a straight segment clear of all obstacle footprints? Sampled densely. */
export function obstacleSegClear(ax: number, az: number, bx: number, bz: number, pad = 0.15): boolean {
  const steps = Math.max(2, Math.ceil(Math.hypot(bx - ax, bz - az) * 4))
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    if (inObstacle(ax + (bx - ax) * t, az + (bz - az) * t, pad)) return false
  }
  return true
}
