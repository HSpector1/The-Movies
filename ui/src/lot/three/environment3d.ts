// ── environment3d — the ground truth surface and the 1948 valley around it ─────
//
// The ground texture rasterises the SAME zoning tables the 2D bake rasterises
// (world.ts ROADS/PLAZA/APRONS/PATHS/PARKING/pads) over the same per-tile
// dryness noise, so the two renderers describe one property. The surround keeps
// the correction wave's geography exactly: orange groves west and north, the
// public street with palms, parked sedans, billboards and bungalow blocks on the
// two near sides, a ridge on the horizon. Everything outside the wall is PUBLIC
// ground — painted scenery, never addressable, exactly like the 2D bake.

import {
  BoxGeometry,
  CanvasTexture,
  ConeGeometry,
  CylinderGeometry,
  Group,
  IcosahedronGeometry,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  PlaneGeometry,
  Quaternion,
  SRGBColorSpace,
  Vector3,
} from 'three'
import {
  APRONS,
  EXPANSION_PADS,
  PARKING,
  PATHS,
  PLAZA,
  ROADS,
  YARD_PADS,
  gridNoise,
  groundDryness,
  type Rect,
} from '../tycoon/world.ts'
import { WARM } from '../tycoon/palette.ts'
import type { WorldBuilding } from '../tycoon/buildings.ts'
import { TILE_M } from './iso3d.ts'
import { warm, type MaterialLedger } from './materials3d.ts'

const cssHex = (hex: number, alpha = 1): string =>
  `rgba(${(hex >> 16) & 0xff},${(hex >> 8) & 0xff},${hex & 0xff},${alpha})`

/** Tiles of painted margin around the property on every side. */
const MARGIN = 16

export type GroundBuild = {
  group: Group
  dispose: () => void
}

/**
 * The painted ground: one big textured plane (zero per-frame cost — the 3D twin of
 * the 2D world's single baked RenderTexture), plus a horizon plane beyond it.
 */
export function buildGround(lotW: number, lotD: number, buildings: readonly WorldBuilding[]): GroundBuild {
  const spanW = lotW + MARGIN * 2
  const spanD = lotD + MARGIN * 2
  const px = 3072
  const canvas = document.createElement('canvas')
  canvas.width = px
  canvas.height = Math.round((px * spanD) / spanW)
  const ctx = canvas.getContext('2d')
  if (ctx === null) throw new Error('2d context unavailable for ground bake')
  const sx = canvas.width / spanW
  const sy = canvas.height / spanD
  const tile = (gx: number, gy: number, w: number, d: number, colour: string): void => {
    ctx.fillStyle = colour
    ctx.fillRect((gx + MARGIN) * sx, (gy + MARGIN) * sy, w * sx, d * sy)
  }

  // public valley floor
  tile(-MARGIN, -MARGIN, spanW, spanD, cssHex(WARM.surround))
  for (let gy = -MARGIN; gy < lotD + MARGIN; gy++) {
    for (let gx = -MARGIN; gx < lotW + MARGIN; gx++) {
      const n = gridNoise(gx, gy + 977)
      if (n > 0.6) tile(gx, gy, 1, 1, cssHex(WARM.surroundEdge, 0.4 + (n - 0.6)))
    }
  }

  // the property's own lawn, tile by tile, with the 2D world's dryness character
  for (let gy = 0; gy < lotD; gy++) {
    for (let gx = 0; gx < lotW; gx++) {
      const dry = groundDryness(gx, gy)
      const base = dry > 0.58 ? WARM.lawnDry : gridNoise(gx, gy) > 0.5 ? WARM.lawn : WARM.lawnAlt
      tile(gx, gy, 1, 1, cssHex(base))
      if (gridNoise(gx, gy, 31) > 0.72) tile(gx + 0.15, gy + 0.2, 0.55, 0.5, cssHex(WARM.lawnEdge, 0.25))
    }
  }

  const paintRects = (rects: readonly Rect[], colour: number, edge?: number): void => {
    for (const r of rects) {
      if (edge !== undefined) tile(r.x0 - 0.12, r.y0 - 0.12, r.x1 - r.x0 + 1.24, r.y1 - r.y0 + 1.24, cssHex(edge))
      tile(r.x0, r.y0, r.x1 - r.x0 + 1, r.y1 - r.y0 + 1, cssHex(colour))
    }
  }
  paintRects(EXPANSION_PADS, WARM.dirt, WARM.dirtEdge)
  paintRects(YARD_PADS, WARM.gravel, WARM.gravelEdge)
  paintRects(PLAZA, WARM.plaza, WARM.plazaEdge)
  paintRects(PATHS, WARM.path, WARM.pathEdge)
  paintRects(PARKING, WARM.apron, WARM.apronEdge)
  paintRects(APRONS, WARM.apron, WARM.apronEdge)
  paintRects(ROADS, WARM.road, WARM.roadEdge)

  // road wear + centre lines, following the network rather than re-authoring it
  ctx.setLineDash([sx * 0.55, sx * 0.5])
  ctx.lineWidth = Math.max(2, sx * 0.07)
  ctx.strokeStyle = cssHex(WARM.roadLine, 0.85)
  for (const r of ROADS) {
    ctx.beginPath()
    const cx = (r.x0 + r.x1 + 1) / 2 + MARGIN
    const cy = (r.y0 + r.y1 + 1) / 2 + MARGIN
    if (r.x1 - r.x0 >= r.y1 - r.y0) {
      ctx.moveTo((r.x0 + MARGIN) * sx, cy * sy)
      ctx.lineTo((r.x1 + 1 + MARGIN) * sx, cy * sy)
    } else {
      ctx.moveTo(cx * sx, (r.y0 + MARGIN) * sy)
      ctx.lineTo(cx * sx, (r.y1 + 1 + MARGIN) * sy)
    }
    ctx.stroke()
  }
  ctx.setLineDash([])

  // parking bay stripes — the 2D bake's own hint that the ground is worked
  ctx.strokeStyle = cssHex(WARM.apronLine, 0.5)
  ctx.lineWidth = Math.max(1.5, sx * 0.045)
  for (const r of PARKING) {
    for (let gx = r.x0; gx <= r.x1; gx += 1) {
      ctx.beginPath()
      ctx.moveTo((gx + MARGIN) * sx, (r.y0 + MARGIN + 0.3) * sy)
      ctx.lineTo((gx + MARGIN) * sx, (r.y0 + MARGIN + 2.2) * sy)
      ctx.stroke()
    }
  }

  // ── the public street on both near sides (correction-wave geography) ───────
  const street = (alongX: boolean): void => {
    const base = alongX ? lotD : lotW
    // sidewalks
    if (alongX) {
      tile(-MARGIN, base + 1.1, spanW, 0.9, cssHex(WARM.sidewalk))
      tile(-MARGIN, base + 4.7, spanW, 0.9, cssHex(WARM.sidewalk))
      tile(-MARGIN, base + 2.0, spanW, 2.7, cssHex(WARM.street))
    } else {
      tile(base + 1.1, -MARGIN, 0.9, spanD, cssHex(WARM.sidewalk))
      tile(base + 4.7, -MARGIN, 0.9, spanD, cssHex(WARM.sidewalk))
      tile(base + 2.0, -MARGIN, 2.7, spanD, cssHex(WARM.street))
    }
    ctx.setLineDash([sx * 0.8, sx * 0.7])
    ctx.strokeStyle = cssHex(WARM.streetLine, 0.8)
    ctx.lineWidth = Math.max(2, sx * 0.06)
    ctx.beginPath()
    if (alongX) {
      ctx.moveTo(0, (base + 3.35 + MARGIN) * sy)
      ctx.lineTo(canvas.width, (base + 3.35 + MARGIN) * sy)
    } else {
      ctx.moveTo((base + 3.35 + MARGIN) * sx, 0)
      ctx.lineTo((base + 3.35 + MARGIN) * sx, canvas.height)
    }
    ctx.stroke()
    ctx.setLineDash([])
  }
  street(true)
  street(false)

  // boulevard connector: the gate road continues onto the public street
  tile(9, lotD, 2, 2.2, cssHex(WARM.road))

  // grove floor rows, west and north wedges
  for (let gy = -MARGIN + 2; gy <= lotD + 6; gy += 1.5) tile(-9.8, gy - 0.2, 8.4, 0.4, cssHex(WARM.groveRow, 0.5))
  for (let gx = -MARGIN + 2; gx <= lotW + 6; gx += 1.5) tile(gx - 0.2, -9.8, 0.4, 8.4, cssHex(WARM.groveRow, 0.5))

  // soft ambient-occlusion pools under every standing body — contact, not paint
  for (const b of buildings) {
    const cx = (b.gx + b.fw / 2 + MARGIN) * sx
    const cy = (b.gy + b.fd / 2 + MARGIN) * sy
    const rx = (b.fw / 2 + 0.55) * sx
    const ry = (b.fd / 2 + 0.55) * sy
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(rx, ry))
    grad.addColorStop(0, cssHex(WARM.shadow, 0.34))
    grad.addColorStop(0.75, cssHex(WARM.shadow, 0.18))
    grad.addColorStop(1, cssHex(WARM.shadow, 0))
    ctx.fillStyle = grad
    ctx.save()
    ctx.translate(cx, cy)
    ctx.scale(rx / Math.max(rx, ry), ry / Math.max(rx, ry))
    ctx.beginPath()
    ctx.arc(0, 0, Math.max(rx, ry), 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.anisotropy = 8
  const groundMat = new MeshStandardMaterial({ map: texture, roughness: 0.96 })
  const ground = new Mesh(new PlaneGeometry(spanW * TILE_M, spanD * TILE_M), groundMat)
  ground.rotation.x = -Math.PI / 2
  ground.position.set(((lotW / 2) * TILE_M * 2) / 2 - 0 + ((-MARGIN + spanW / 2 - lotW / 2) * 0), 0, 0)
  // centre the painted span on the lot's own centre
  ground.position.set((lotW / 2) * TILE_M, 0, (lotD / 2) * TILE_M)
  ground.receiveShadow = true

  const horizonMat = new MeshStandardMaterial({ color: warm(WARM.surroundEdge), roughness: 1 })
  const horizon = new Mesh(new PlaneGeometry(spanW * TILE_M * 6, spanD * TILE_M * 6), horizonMat)
  horizon.rotation.x = -Math.PI / 2
  horizon.position.set((lotW / 2) * TILE_M, -0.08, (lotD / 2) * TILE_M)
  horizon.receiveShadow = true

  // The public walks are physical slabs, not another painted line. They sit wholly
  // outside the studio wall, so the authoritative lot surface, roads and occupancy Y
  // remain exactly where the engine put them. Split each run at the perpendicular
  // street: a raised strip must never bridge the road through the public intersection.
  const walkGeometry = new BoxGeometry(1, 1, 1)
  const walkMaterial = new MeshStandardMaterial({ color: warm(WARM.sidewalk), roughness: 0.97 })
  const curbMaterial = new MeshStandardMaterial({ color: warm(WARM.streetEdge), roughness: 0.92 })
  const publicWalks = new Group()
  publicWalks.name = 'Public sidewalks and kerbs'
  const WALK_H = 0.16
  const CURB_H = 0.24
  const CURB_W = 0.16
  const addWalkRect = (
    x0: number,
    z0: number,
    x1: number,
    z1: number,
    roadEdge: 'x0' | 'x1' | 'z0' | 'z1',
  ): void => {
    const slab = new Mesh(walkGeometry, walkMaterial)
    slab.position.set(((x0 + x1) / 2) * TILE_M, WALK_H / 2, ((z0 + z1) / 2) * TILE_M)
    slab.scale.set((x1 - x0) * TILE_M, WALK_H, (z1 - z0) * TILE_M)
    slab.receiveShadow = true
    publicWalks.add(slab)

    const curb = new Mesh(walkGeometry, curbMaterial)
    const alongX = roadEdge === 'z0' || roadEdge === 'z1'
    const edgeX = roadEdge === 'x0' ? x0 : roadEdge === 'x1' ? x1 : (x0 + x1) / 2
    const edgeZ = roadEdge === 'z0' ? z0 : roadEdge === 'z1' ? z1 : (z0 + z1) / 2
    curb.position.set(edgeX * TILE_M, CURB_H / 2, edgeZ * TILE_M)
    curb.scale.set(alongX ? (x1 - x0) * TILE_M : CURB_W, CURB_H, alongX ? CURB_W : (z1 - z0) * TILE_M)
    curb.castShadow = true
    curb.receiveShadow = true
    publicWalks.add(curb)
  }
  const xMin = -MARGIN
  const xMax = lotW + MARGIN
  const zMin = -MARGIN
  const zMax = lotD + MARGIN
  const eastRoad0 = lotW + 2.0
  const eastRoad1 = lotW + 4.7
  const southRoad0 = lotD + 2.0
  const southRoad1 = lotD + 4.7

  // South boulevard: inner and neighbourhood-side walks, each side of the east road.
  addWalkRect(xMin, lotD + 1.1, eastRoad0, lotD + 2.0, 'z1')
  addWalkRect(eastRoad1, lotD + 1.1, xMax, lotD + 2.0, 'z1')
  addWalkRect(xMin, lotD + 4.7, eastRoad0, lotD + 5.6, 'z0')
  addWalkRect(eastRoad1, lotD + 4.7, xMax, lotD + 5.6, 'z0')
  // East boulevard: the same treatment, split at the south road.
  addWalkRect(lotW + 1.1, zMin, lotW + 2.0, southRoad0, 'x1')
  addWalkRect(lotW + 1.1, southRoad1, lotW + 2.0, zMax, 'x1')
  addWalkRect(lotW + 4.7, zMin, lotW + 5.6, southRoad0, 'x0')
  addWalkRect(lotW + 4.7, southRoad1, lotW + 5.6, zMax, 'x0')

  const group = new Group()
  group.add(horizon)
  group.add(ground)
  group.add(publicWalks)
  return {
    group,
    dispose: () => {
      texture.dispose()
      groundMat.dispose()
      horizonMat.dispose()
      walkMaterial.dispose()
      curbMaterial.dispose()
      ground.geometry.dispose()
      horizon.geometry.dispose()
      walkGeometry.dispose()
    },
  }
}

/** The stucco perimeter wall, broken exactly at the gate's own frontage. */
export function buildPerimeterWall(
  lotW: number,
  lotD: number,
  m: MaterialLedger,
  gate: WorldBuilding | undefined,
): Group {
  const g = new Group()
  const H = 2.3
  const T = 0.5
  const seg = (x0: number, z0: number, x1: number, z1: number): void => {
    const len = Math.hypot(x1 - x0, z1 - z0)
    if (len < 0.05) return
    const wall = new Mesh(new BoxGeometry(len, H, T), m.cream)
    wall.position.set((x0 + x1) / 2, H / 2, (z0 + z1) / 2)
    wall.rotation.y = -Math.atan2(z1 - z0, x1 - x0)
    wall.castShadow = true
    wall.receiveShadow = true
    g.add(wall)
    const cap = new Mesh(new BoxGeometry(len, 0.14, T + 0.16), m.trim)
    cap.position.set((x0 + x1) / 2, H + 0.07, (z0 + z1) / 2)
    cap.rotation.y = wall.rotation.y
    g.add(cap)
    const pierCount = Math.max(1, Math.round(len / (TILE_M * 3)))
    for (let i = 0; i <= pierCount; i++) {
      const t = i / pierCount
      const pier = new Mesh(new BoxGeometry(T + 0.4, H + 0.35, T + 0.4), m.cream)
      pier.position.set(x0 + (x1 - x0) * t, (H + 0.35) / 2, z0 + (z1 - z0) * t)
      pier.castShadow = true
      g.add(pier)
    }
  }
  const west = 0
  const north = 0
  const east = lotW * TILE_M
  const south = lotD * TILE_M
  seg(west, north, east, north)
  seg(west, north, west, south)
  seg(east, north, east, south)
  // the south run breaks at the gate (fail-neutral: no gate record, no break)
  if (gate !== undefined && gate.gy + gate.fd >= lotD - 2) {
    const gx0 = (gate.gx - 0.4) * TILE_M
    const gx1 = (gate.gx + gate.fw + 0.4) * TILE_M
    seg(west, south, gx0, south)
    seg(gx1, south, east, south)
  } else {
    seg(west, south, east, south)
  }
  return g
}

/** Ridge, groves, street palms, parked sedans, billboards and bungalow blocks. */
export function buildSurround(lotW: number, lotD: number, m: MaterialLedger): Group {
  const g = new Group()
  const dummy = new Object3D()
  const place = (
    inst: InstancedMesh,
    i: number,
    x: number,
    z: number,
    s: number,
    yaw: number,
    y = 0,
  ): void => {
    dummy.position.set(x * TILE_M, y, z * TILE_M)
    dummy.scale.setScalar(s)
    dummy.rotation.set(0, yaw, 0)
    dummy.updateMatrix()
    inst.setMatrixAt(i, dummy.matrix)
  }

  // ── ridge on the far horizon ────────────────────────────────────────────────
  const hillMats = [
    new MeshStandardMaterial({ color: warm(WARM.hillFar), roughness: 1 }),
    new MeshStandardMaterial({ color: warm(WARM.hillMid), roughness: 1 }),
    new MeshStandardMaterial({ color: warm(WARM.hillNear), roughness: 1 }),
  ]
  const hillSpots: Array<[number, number, number, number, number]> = [
    [-26, 2, 30, 9, 0],
    [-22, 16, 26, 7.5, 1],
    [-18, -14, 24, 8.5, 1],
    [4, -24, 30, 9.5, 0],
    [18, -20, 24, 7, 1],
    [-8, -20, 20, 6.5, 2],
    [32, -16, 22, 6, 2],
  ]
  for (const [hx, hz, r, h, mi] of hillSpots) {
    const hill = new Mesh(new IcosahedronGeometry(1, 2), hillMats[mi])
    hill.scale.set(r * TILE_M * 0.5, h * TILE_M * 0.22, r * TILE_M * 0.42)
    hill.position.set(hx * TILE_M, -1.5, hz * TILE_M)
    hill.receiveShadow = true
    g.add(hill)
  }

  // ── orange groves, west and north wedges, the 2D bake's own spacing ────────
  const grovePts: Array<[number, number, number]> = []
  for (let gy = -MARGIN + 3; gy <= lotD + 6; gy += 1.5) {
    for (let gx = -9.5; gx <= -1.6; gx += 0.92) {
      grovePts.push([gx + (gridNoise(Math.round(gx * 8), 601 + gy) - 0.5) * 0.24, gy, 601 + gy])
    }
  }
  for (let gx = -MARGIN + 3; gx <= lotW + 6; gx += 1.5) {
    for (let gy = -9.5; gy <= -1.6; gy += 0.92) {
      grovePts.push([gx, gy + (gridNoise(Math.round(gy * 8), 701 + gx) - 0.5) * 0.24, 701 + gx])
    }
  }
  const trunkGeo = new CylinderGeometry(0.09, 0.13, 0.9, 6)
  trunkGeo.translate(0, 0.45, 0)
  const blobGeo = new IcosahedronGeometry(1.05, 1)
  blobGeo.translate(0, 1.55, 0)
  const trunks = new InstancedMesh(trunkGeo, m.trunk, grovePts.length)
  const blobs = new InstancedMesh(blobGeo, m.grove, grovePts.length)
  // Hundreds of identical canopy shadow stamps made the surround noisier and darker
  // than the playable studio. The painted row beds still ground the grove; reserve
  // real cast shadows for the much sparser palms and built context.
  blobs.castShadow = false
  grovePts.forEach(([gx, gy, salt], i) => {
    const s = 0.75 + gridNoise(Math.round(gx * 8), salt + 1) * 0.4
    const yaw = gridNoise(Math.round(gy * 8), salt + 2) * Math.PI
    place(trunks, i, gx, gy, s, yaw)
    place(blobs, i, gx, gy, s, yaw)
  })
  g.add(trunks)
  g.add(blobs)

  // ── street palms on both public sidewalks ───────────────────────────────────
  const palmPts: Array<[number, number, number]> = []
  for (let gx = -12; gx < lotW + 13; gx += 2.4) {
    palmPts.push([gx, lotD + 1.55, Math.round(gx * 2) + 891])
    if (gridNoise(Math.round(gx * 2), 893) > 0.5) palmPts.push([gx + 1.2, lotD + 5.0, Math.round(gx * 2) + 895])
  }
  for (let gy = -12; gy < lotD + 13; gy += 2.4) {
    palmPts.push([lotW + 1.55, gy, Math.round(gy * 2) + 897])
    if (gridNoise(Math.round(gy * 2), 899) > 0.5) palmPts.push([lotW + 5.0, gy + 1.2, Math.round(gy * 2) + 901])
  }
  const palmTrunkGeo = new CylinderGeometry(0.09, 0.14, 7, 6)
  palmTrunkGeo.translate(0.25, 3.5, 0)
  ;(palmTrunkGeo as CylinderGeometry).rotateZ(0.07)
  // one merged frond star per palm
  const frondPlane = new PlaneGeometry(2.5, 0.55, 3, 1)
  const star = new Group()
  for (let i = 0; i < 8; i++) {
    const p = new Mesh(frondPlane)
    const a = (i / 8) * Math.PI * 2
    p.position.set(Math.cos(a) * 1.0, 7.1, Math.sin(a) * 1.0)
    p.rotation.y = -a
    p.rotation.z = -0.5
    star.add(p)
  }
  const starGeo = mergeGroupGeometry(star)
  const palmTrunks = new InstancedMesh(palmTrunkGeo, m.trunk, palmPts.length)
  const palmCrowns = new InstancedMesh(starGeo, m.frond, palmPts.length)
  palmTrunks.castShadow = true
  palmCrowns.castShadow = true
  palmPts.forEach(([gx, gy, salt], i) => {
    const s = 0.8 + gridNoise(salt, 881) * 0.35
    const yaw = gridNoise(salt, 883) * Math.PI * 2
    place(palmTrunks, i, gx, gy, s, yaw)
    place(palmCrowns, i, gx, gy, s, yaw)
  })
  g.add(palmTrunks)
  g.add(palmCrowns)

  // ── parked period sedans on the public street ───────────────────────────────
  const carPts: Array<[number, number, boolean, number]> = []
  for (let gx = -12; gx < lotW + 12; gx += 3.1) {
    if (gridNoise(Math.round(gx * 2), 861) >= 0.34) carPts.push([gx, lotD + 2.35, true, Math.round(gx * 2) + 861])
  }
  for (let gx = -12; gx < lotW + 12; gx += 3.7) {
    if (gridNoise(Math.round(gx * 2), 863) >= 0.62) carPts.push([gx + 1.4, lotD + 4.05, true, Math.round(gx * 2) + 863])
  }
  for (let gy = -12; gy < lotD + 12; gy += 3.1) {
    if (gridNoise(Math.round(gy * 2), 871) >= 0.34) carPts.push([lotW + 2.35, gy, false, Math.round(gy * 2) + 871])
  }
  for (let gy = -12; gy < lotD + 12; gy += 3.7) {
    if (gridNoise(Math.round(gy * 2), 873) >= 0.62) carPts.push([lotW + 4.05, gy + 1.4, false, Math.round(gy * 2) + 873])
  }
  // A few extra shared parts turn the old two-box traffic into recognisable late-40s
  // sedans without making the public street the star. One instanced draw per material /
  // silhouette part keeps the added period read inexpensive.
  const carPaint = new MeshStandardMaterial({ color: warm(0xffffff), roughness: 0.38, metalness: 0.28 })
  const carGlass = new MeshStandardMaterial({ color: warm(WARM.glassDeep), roughness: 0.2, metalness: 0.18 })
  const carChrome = new MeshStandardMaterial({ color: warm(WARM.carTrim), roughness: 0.2, metalness: 0.78 })
  const carRubber = new MeshStandardMaterial({ color: warm(WARM.tyre), roughness: 0.96 })
  const carBodyGeo = new BoxGeometry(4.25, 0.72, 1.78)
  carBodyGeo.translate(0, 0.62, 0)
  const carDeckGeo = new BoxGeometry(4.0, 0.24, 1.58)
  carDeckGeo.translate(0, 1.02, 0)
  const carGlassGeo = new BoxGeometry(2.08, 0.5, 1.4)
  carGlassGeo.translate(-0.25, 1.4, 0)
  const carRoofGeo = new BoxGeometry(1.9, 0.14, 1.44)
  carRoofGeo.translate(-0.25, 1.72, 0)
  const bumperGeo = new BoxGeometry(0.16, 0.14, 1.86)
  const sideTrimGeo = new BoxGeometry(3.45, 0.065, 0.06)
  const wheelGeo = new CylinderGeometry(0.38, 0.38, 0.22, 12)
  wheelGeo.rotateX(Math.PI / 2)
  const carBodies = new InstancedMesh(carBodyGeo, carPaint, carPts.length)
  const carDecks = new InstancedMesh(carDeckGeo, carPaint, carPts.length)
  const carGlazing = new InstancedMesh(carGlassGeo, carGlass, carPts.length)
  const carRoofs = new InstancedMesh(carRoofGeo, carPaint, carPts.length)
  const carBumpers = new InstancedMesh(bumperGeo, carChrome, carPts.length * 2)
  const carSideTrim = new InstancedMesh(sideTrimGeo, carChrome, carPts.length * 2)
  const carWheels = new InstancedMesh(wheelGeo, carRubber, carPts.length * 4)
  carBodies.castShadow = true
  carDecks.castShadow = true
  carRoofs.castShadow = true
  carWheels.castShadow = true
  const carQ = new Quaternion()
  const carOrigin = new Vector3()
  const carLocal = new Vector3()
  const carWorld = new Vector3()
  const carScale = new Vector3(1, 1, 1)
  const carUp = new Vector3(0, 1, 0)
  const carMtx = new Matrix4()
  const placeCarPart = (
    inst: InstancedMesh,
    index: number,
    gx: number,
    gy: number,
    yaw: number,
    lx: number,
    ly: number,
    lz: number,
  ): void => {
    carQ.setFromAxisAngle(carUp, yaw)
    carOrigin.set(gx * TILE_M, 0, gy * TILE_M)
    carLocal.set(lx, ly, lz).applyQuaternion(carQ)
    carWorld.copy(carOrigin).add(carLocal)
    carMtx.compose(carWorld, carQ, carScale)
    inst.setMatrixAt(index, carMtx)
  }
  carPts.forEach(([gx, gy, alongX, salt], i) => {
    const yaw = alongX ? 0 : Math.PI / 2
    place(carBodies, i, gx, gy, 1, yaw)
    place(carDecks, i, gx, gy, 1, yaw)
    place(carGlazing, i, gx, gy, 1, yaw)
    place(carRoofs, i, gx, gy, 1, yaw)
    placeCarPart(carBumpers, i * 2, gx, gy, yaw, -2.16, 0.55, 0)
    placeCarPart(carBumpers, i * 2 + 1, gx, gy, yaw, 2.16, 0.55, 0)
    placeCarPart(carSideTrim, i * 2, gx, gy, yaw, 0, 0.79, -0.91)
    placeCarPart(carSideTrim, i * 2 + 1, gx, gy, yaw, 0, 0.79, 0.91)
    for (let wi = 0; wi < 4; wi++) {
      placeCarPart(
        carWheels,
        i * 4 + wi,
        gx,
        gy,
        yaw,
        wi < 2 ? -1.32 : 1.32,
        0.42,
        wi % 2 === 0 ? -0.83 : 0.83,
      )
    }
    const tone = gridNoise(salt, 851)
    const colour = warm(
      tone > 0.75
        ? WARM.vanBody
        : tone > 0.5
          ? WARM.truckBody
          : tone > 0.25
            ? WARM.neighbourWallShade
            : WARM.carBody,
    )
    carBodies.setColorAt(i, colour)
    carDecks.setColorAt(i, colour)
    carRoofs.setColorAt(i, colour.clone().lerp(warm(0xffffff), 0.08))
  })
  g.add(carBodies)
  g.add(carDecks)
  g.add(carGlazing)
  g.add(carRoofs)
  g.add(carBumpers)
  g.add(carSideTrim)
  g.add(carWheels)

  // ── bungalow blocks beyond the street, both sides ───────────────────────────
  const bungalowPts: Array<[number, number, number, number, number, boolean]> = []
  for (let gx = -14; gx < lotW + 14; gx += 2.7) {
    const salt = Math.round(gx * 4) + 900
    bungalowPts.push([gx, lotD + 6.1, 1.8 + gridNoise(salt, 831) * 0.6, 1.6, salt, true])
    if (gridNoise(salt, 841) > 0.36) bungalowPts.push([gx + 0.8, lotD + 9.0, 2.0, 1.7, salt + 2, true])
    if (gridNoise(salt, 845) > 0.55) bungalowPts.push([gx - 0.4, lotD + 11.6, 2.2, 1.8, salt + 3, true])
  }
  for (let gy = -14; gy < lotD + 14; gy += 2.7) {
    const salt = Math.round(gy * 4) + 1_100
    bungalowPts.push([lotW + 6.1, gy, 1.6, 1.8 + gridNoise(salt, 833) * 0.6, salt, false])
    if (gridNoise(salt, 843) > 0.36) bungalowPts.push([lotW + 9.0, gy + 0.8, 1.7, 2.0, salt + 2, false])
    if (gridNoise(salt, 847) > 0.55) bungalowPts.push([lotW + 11.6, gy - 0.4, 1.8, 2.2, salt + 3, false])
  }
  const bwGeo = new BoxGeometry(1, 1, 1)
  bwGeo.translate(0, 0.5, 0)
  const brGeo = new ConeGeometry(0.78, 0.55, 4)
  brGeo.rotateY(Math.PI / 4)
  const bungalowWallMat = new MeshStandardMaterial({ color: warm(0xffffff), roughness: 0.92 })
  const bungalowRoofMat = new MeshStandardMaterial({ color: warm(0xffffff), roughness: 0.87 })
  const bungalowDoorMat = new MeshStandardMaterial({ color: warm(0xffffff), roughness: 0.78 })
  const bungalowGlassMat = new MeshStandardMaterial({ color: warm(0xffffff), roughness: 0.28, metalness: 0.08 })
  const bungalowPorchMat = new MeshStandardMaterial({ color: warm(WARM.sidewalk), roughness: 0.96 })
  const bungalowTrimMat = new MeshStandardMaterial({ color: warm(WARM.neighbourWallShade), roughness: 0.9 })
  const bungalowBrickMat = new MeshStandardMaterial({ color: warm(WARM.brick), roughness: 0.94 })
  const bWalls = new InstancedMesh(bwGeo, bungalowWallMat, bungalowPts.length)
  const bRoofs = new InstancedMesh(brGeo, bungalowRoofMat, bungalowPts.length)
  const bDoors = new InstancedMesh(bwGeo, bungalowDoorMat, bungalowPts.length)
  const bWindows = new InstancedMesh(bwGeo, bungalowGlassMat, bungalowPts.length * 2)
  const bPorches = new InstancedMesh(bwGeo, bungalowPorchMat, bungalowPts.length)
  const bPorchRoofs = new InstancedMesh(bwGeo, bungalowRoofMat, bungalowPts.length)
  const bPorchPosts = new InstancedMesh(bwGeo, bungalowTrimMat, bungalowPts.length * 2)
  const chimneyCount = bungalowPts.filter(([, , , , salt]) => gridNoise(salt, 828) > 0.38).length
  const bChimneys = new InstancedMesh(bwGeo, bungalowBrickMat, chimneyCount)
  bWalls.castShadow = true
  bRoofs.castShadow = true
  bPorchRoofs.castShadow = true
  bChimneys.castShadow = true
  const q = new Quaternion()
  const setBungalowBox = (
    inst: InstancedMesh,
    index: number,
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
  ): void => {
    inst.setMatrixAt(index, new Matrix4().compose(new Vector3(x, y, z), q, new Vector3(w, h, d)))
  }
  let chimneyIndex = 0
  bungalowPts.forEach(([gx, gy, fw, fd, salt, frontOnZ], i) => {
    const wallH = 2.7 + gridNoise(salt, 835) * 0.8
    const worldX = gx * TILE_M
    const worldZ = gy * TILE_M
    const houseW = fw * TILE_M
    const houseD = fd * TILE_M
    const mtx = new Matrix4().compose(
      new Vector3(worldX, 0, worldZ),
      q,
      new Vector3(houseW, wallH, houseD),
    )
    bWalls.setMatrixAt(i, mtx)
    const rm = new Matrix4().compose(
      new Vector3(worldX, wallH, worldZ),
      q,
      new Vector3(houseW * 1.06, 2.2, houseD * 1.06),
    )
    bRoofs.setMatrixAt(i, rm)
    const wallRoll = gridNoise(salt, 837)
    const wallColour =
      wallRoll > 0.66
        ? warm(WARM.neighbourWall)
        : wallRoll > 0.33
          ? warm(WARM.neighbourWallShade).lerp(warm(WARM.neighbourWall), 0.42)
          : warm(WARM.creamShade).lerp(warm(WARM.neighbourWall), 0.58)
    const roofTone = gridNoise(salt, 839) > 0.5 ? WARM.neighbourRoof : WARM.neighbourRoofDark
    const roofColour = warm(roofTone)
    bWalls.setColorAt(i, wallColour)
    bRoofs.setColorAt(i, warm(roofTone))

    // Every street-facing facade gets a real entrance, paired windows and a shallow
    // porch. Their small, seeded offsets keep the rows residential rather than cloned.
    const facadeSpan = frontOnZ ? houseW : houseD
    const frontExtent = (frontOnZ ? houseD : houseW) / 2
    const front = -frontExtent - 0.05
    const doorShift = (gridNoise(salt, 849) - 0.5) * Math.min(0.7, facadeSpan * 0.12)
    const doorColour = warm(
      gridNoise(salt, 851) > 0.66
        ? WARM.vanBody
        : gridNoise(salt, 853) > 0.5
          ? WARM.truckBody
          : WARM.neighbourRoofDark,
    )
    if (frontOnZ) {
      setBungalowBox(bDoors, i, worldX + doorShift, 0.14, worldZ + front, 0.82, 1.9, 0.1)
    } else {
      setBungalowBox(bDoors, i, worldX + front, 0.14, worldZ + doorShift, 0.1, 1.9, 0.82)
    }
    bDoors.setColorAt(i, doorColour)

    const windowOffset = Math.min(1.45, facadeSpan * 0.27)
    const windowColour = warm(gridNoise(salt, 855) > 0.76 ? WARM.glass : WARM.glassDeep)
    for (let windowI = 0; windowI < 2; windowI++) {
      const along = windowI === 0 ? -windowOffset : windowOffset
      const index = i * 2 + windowI
      if (frontOnZ) {
        setBungalowBox(bWindows, index, worldX + along, 0.92, worldZ + front - 0.01, 0.9, 1.02, 0.07)
      } else {
        setBungalowBox(bWindows, index, worldX + front - 0.01, 0.92, worldZ + along, 0.07, 1.02, 0.9)
      }
      bWindows.setColorAt(index, windowColour)
    }

    const porchW = Math.min(2.45, facadeSpan * (0.46 + gridNoise(salt, 857) * 0.08))
    const porchD = 0.78 + gridNoise(salt, 859) * 0.28
    const porchFront = -frontExtent - porchD / 2
    if (frontOnZ) {
      setBungalowBox(bPorches, i, worldX + doorShift, 0, worldZ + porchFront, porchW, 0.16, porchD)
      setBungalowBox(bPorchRoofs, i, worldX + doorShift, 2.18, worldZ + porchFront, porchW * 1.06, 0.14, porchD * 1.04)
    } else {
      setBungalowBox(bPorches, i, worldX + porchFront, 0, worldZ + doorShift, porchD, 0.16, porchW)
      setBungalowBox(bPorchRoofs, i, worldX + porchFront, 2.18, worldZ + doorShift, porchD * 1.04, 0.14, porchW * 1.06)
    }
    bPorchRoofs.setColorAt(i, roofColour)
    for (let postI = 0; postI < 2; postI++) {
      const along = doorShift + (postI === 0 ? -porchW * 0.43 : porchW * 0.43)
      const postFront = -frontExtent - porchD * 0.78
      const index = i * 2 + postI
      if (frontOnZ) {
        setBungalowBox(bPorchPosts, index, worldX + along, 0.14, worldZ + postFront, 0.09, 2.04, 0.09)
      } else {
        setBungalowBox(bPorchPosts, index, worldX + postFront, 0.14, worldZ + along, 0.09, 2.04, 0.09)
      }
    }

    if (gridNoise(salt, 828) > 0.38) {
      const chimneyAlong = (gridNoise(salt, 827) - 0.5) * facadeSpan * 0.46
      if (frontOnZ) {
        setBungalowBox(bChimneys, chimneyIndex, worldX + chimneyAlong, wallH + 0.18, worldZ + houseD * 0.16, 0.42, 1.38, 0.42)
      } else {
        setBungalowBox(bChimneys, chimneyIndex, worldX + houseW * 0.16, wallH + 0.18, worldZ + chimneyAlong, 0.42, 1.38, 0.42)
      }
      chimneyIndex++
    }
  })
  g.add(bWalls)
  g.add(bRoofs)
  g.add(bDoors)
  g.add(bWindows)
  g.add(bPorches)
  g.add(bPorchRoofs)
  g.add(bPorchPosts)
  g.add(bChimneys)

  // yard trees between the bungalows share the grove look
  const yardPts: Array<[number, number, number]> = []
  for (let gx = -14; gx < lotW + 14; gx += 2.7) yardPts.push([gx + 2.2, lotD + 5.7, Math.round(gx * 4) + 901])
  for (let gy = -14; gy < lotD + 14; gy += 2.7) yardPts.push([lotW + 5.7, gy + 2.2, Math.round(gy * 4) + 1_101])
  const yardTrunks = new InstancedMesh(trunkGeo, m.trunk, yardPts.length)
  const yardBlobs = new InstancedMesh(blobGeo, m.groveDark, yardPts.length)
  yardBlobs.castShadow = false
  yardPts.forEach(([gx, gy, salt], i) => {
    const s = 1.0 + gridNoise(salt, 821) * 0.6
    place(yardTrunks, i, gx, gy, s, salt)
    place(yardBlobs, i, gx, gy, s, salt)
  })
  g.add(yardTrunks)
  g.add(yardBlobs)

  // ── the picture billboards on the gate approach ─────────────────────────────
  for (const [bx, bz, yaw] of [
    [12.8, lotD + 5.6, Math.PI],
    [lotW + 5.6, 6.5, Math.PI / 2],
  ] as const) {
    const bb = new Group()
    for (const dx of [-2.1, 2.1]) {
      const post = new Mesh(new CylinderGeometry(0.09, 0.09, 4.2, 6), m.steel)
      post.position.set(dx, 2.1, 0)
      post.castShadow = true
      bb.add(post)
    }
    const face = new Mesh(new BoxGeometry(6.2, 3.0, 0.16), new MeshStandardMaterial({ color: warm(WARM.billboardFace), roughness: 0.7 }))
    face.position.set(0, 4.6, 0)
    face.castShadow = true
    bb.add(face)
    const frame = new Mesh(new BoxGeometry(6.6, 3.4, 0.1), new MeshStandardMaterial({ color: warm(WARM.billboardFrame), roughness: 0.8 }))
    frame.position.set(0, 4.6, -0.06)
    bb.add(frame)
    // abstract poster composition — world art, never a word the scene was not given
    const stripe = new Mesh(new BoxGeometry(2.1, 2.4, 0.04), new MeshStandardMaterial({ color: warm(WARM.billboardInk), roughness: 0.7 }))
    stripe.position.set(-1.6, 4.5, 0.09)
    bb.add(stripe)
    const disc = new Mesh(new CylinderGeometry(0.9, 0.9, 0.05, 18), new MeshStandardMaterial({ color: warm(WARM.awning), roughness: 0.7 }))
    disc.rotation.x = Math.PI / 2
    disc.position.set(1.3, 4.7, 0.09)
    bb.add(disc)
    bb.position.set(bx * TILE_M, 0, bz * TILE_M)
    bb.rotation.y = yaw
    g.add(bb)
  }

  return g
}

/** Merge a group of planar meshes into one BufferGeometry (palm crowns). */
function mergeGroupGeometry(group: Group): PlaneGeometry {
  // Cheap merge: bake each child's transform into a clone and concatenate manually.
  const geos: PlaneGeometry[] = []
  group.updateMatrixWorld(true)
  group.traverse((node) => {
    const mesh = node as Mesh
    if (!mesh.isMesh) return
    const geo = (mesh.geometry as PlaneGeometry).clone()
    geo.applyMatrix4(mesh.matrixWorld)
    geos.push(geo)
  })
  const merged = geos[0]
  // Manual concatenation of position/normal/uv/index buffers.
  let totalVerts = 0
  let totalIndex = 0
  for (const geo of geos) {
    totalVerts += geo.attributes.position.count
    totalIndex += geo.index?.count ?? 0
  }
  const position = new Float32Array(totalVerts * 3)
  const normal = new Float32Array(totalVerts * 3)
  const uv = new Float32Array(totalVerts * 2)
  const index = new Uint16Array(totalIndex)
  let vo = 0
  let io = 0
  for (const geo of geos) {
    position.set(geo.attributes.position.array as Float32Array, vo * 3)
    normal.set(geo.attributes.normal.array as Float32Array, vo * 3)
    uv.set(geo.attributes.uv.array as Float32Array, vo * 2)
    const idx = geo.index
    if (idx !== null) {
      for (let i = 0; i < idx.count; i++) index[io + i] = idx.getX(i) + vo
      io += idx.count
    }
    vo += geo.attributes.position.count
  }
  const out = merged.clone()
  out.setAttribute('position', new (Object.getPrototypeOf(merged.attributes.position).constructor)(position, 3))
  out.setAttribute('normal', new (Object.getPrototypeOf(merged.attributes.normal).constructor)(normal, 3))
  out.setAttribute('uv', new (Object.getPrototypeOf(merged.attributes.uv).constructor)(uv, 2))
  out.setIndex(Array.from(index))
  return out
}
