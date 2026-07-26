// ── Programmatic placeholder assets ───────────────────────────────────────────
// All artwork is generated at runtime from Phaser Graphics — no image files, no
// copied assets. Everything is original geometry in the restrained palette. Each
// building is an isometric massing (roof rhombus + two lit/shadowed wall faces)
// with a distinguishing silhouette so the lot reads as a PLACE, not gray boxes.
//
// Textures are baked once into the texture manager; the scene places sprites.

import Phaser from 'phaser'
import { TILE_W, TILE_H } from './iso'
import { COLORS as K } from './palette'

const hw = TILE_W / 2
const hh = TILE_H / 2

type Pt = { x: number; y: number }

/** Metadata for a baked building/prop: texture key + normalized origin. */
export type BakedSprite = {
  key: string
  originX: number
  originY: number
  /** footprint in tiles (buildings only; props use 1x1) */
  fw: number
  fd: number
}

export const BUILDING_TEX: Record<string, BakedSprite> = {}
export const PROP_TEX: Record<string, BakedSprite> = {}

// ── low-level drawing helpers ─────────────────────────────────────────────────

function poly(g: Phaser.GameObjects.Graphics, pts: Pt[], color: number, alpha = 1): void {
  g.fillStyle(color, alpha)
  g.beginPath()
  g.moveTo(pts[0].x, pts[0].y)
  for (let i = 1; i < pts.length; i++) g.lineTo(pts[i].x, pts[i].y)
  g.closePath()
  g.fillPath()
}

function stroke(
  g: Phaser.GameObjects.Graphics,
  pts: Pt[],
  color: number,
  width: number,
  alpha = 1,
  close = false,
): void {
  g.lineStyle(width, color, alpha)
  g.beginPath()
  g.moveTo(pts[0].x, pts[0].y)
  for (let i = 1; i < pts.length; i++) g.lineTo(pts[i].x, pts[i].y)
  if (close) g.closePath()
  g.strokePath()
}

// ── building massing framework ────────────────────────────────────────────────

type Builder = {
  g: Phaser.GameObjects.Graphics
  /** grid (gx,gy) at height z (px up) → local texture pixel. */
  p: (gx: number, gy: number, z: number) => Pt
  texW: number
  texH: number
  originY: number
}

function beginBuilding(
  scene: Phaser.Scene,
  fw: number,
  fd: number,
  H: number,
  topExtra: number,
): Builder {
  const ox = fd * hw
  const oy = H + topExtra
  const texW = (fw + fd) * hw
  const texH = (fw + fd) * hh + H + topExtra
  const p = (gx: number, gy: number, z: number): Pt => ({
    x: (gx - gy) * hw + ox,
    y: (gx + gy) * hh - z + oy,
  })
  const originY = (((fw + fd) / 2) * hh + H + topExtra) / texH
  const g = scene.make.graphics({ x: 0, y: 0 })
  return { g, p, texW, texH, originY }
}

/** Draw the box: two wall faces + eave outline. Roof drawn by caller. */
function drawWalls(
  b: Builder,
  fw: number,
  fd: number,
  H: number,
  right: number,
  left: number,
): void {
  const { g, p } = b
  // right/east wall (front-right, +gx face at gy=fd) — lit
  poly(g, [p(0, fd, 0), p(fw, fd, 0), p(fw, fd, H), p(0, fd, H)], right)
  // left/south wall (front-left, +gy face at gx=fw) — shadow
  poly(g, [p(fw, 0, 0), p(fw, fd, 0), p(fw, fd, H), p(fw, 0, H)], left)
  // subtle corner seam
  stroke(g, [p(fw, fd, 0), p(fw, fd, H)], 0x000000, 1, 0.08)
}

/** A window grid on the +gx face (gy=fd) between gx∈[0,fw], z∈[0,H]. */
function windowsRight(
  b: Builder,
  fw: number,
  fd: number,
  H: number,
  cols: number,
  rows: number,
  glass: number,
  lit: number,
): void {
  const { g, p } = b
  const mx = 0.18,
    mz = 0.16
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const t0 = (c + mx) / cols
      const t1 = (c + 1 - mx) / cols
      const z0 = (r + mz) / rows
      const z1 = (r + 1 - mz) / rows
      const on = (c * 7 + r * 3) % 5 === 0
      const gx0 = t0 * fw,
        gx1 = t1 * fw
      poly(
        g,
        [p(gx0, fd, z0 * H), p(gx1, fd, z0 * H), p(gx1, fd, z1 * H), p(gx0, fd, z1 * H)],
        on ? lit : glass,
        0.9,
      )
    }
  }
}

function finalize(b: Builder, key: string): void {
  b.g.generateTexture(key, Math.ceil(b.texW), Math.ceil(b.texH))
  b.g.destroy()
}

// ── roofs ─────────────────────────────────────────────────────────────────────

function flatRoof(b: Builder, fw: number, fd: number, H: number, top: number, dark: number): void {
  const { g, p } = b
  poly(g, [p(0, 0, H), p(fw, 0, H), p(fw, fd, H), p(0, fd, H)], top)
  // parapet lip
  stroke(g, [p(0, 0, H), p(fw, 0, H), p(fw, fd, H), p(0, fd, H)], dark, 1.5, 0.5, true)
}

/** Gable roof, ridge along the longer footprint axis. */
function gableRoof(
  b: Builder,
  fw: number,
  fd: number,
  H: number,
  peak: number,
  slopeLit: number,
  slopeDark: number,
  gableCol: number,
): void {
  const { g, p } = b
  if (fw >= fd) {
    const cy = fd / 2
    const R0 = p(0, cy, H + peak)
    const R1 = p(fw, cy, H + peak)
    // back-right slope (gy=0 side) — lit
    poly(g, [p(0, 0, H), p(fw, 0, H), R1, R0], slopeLit)
    // front-left slope (gy=fd side) — shadow
    poly(g, [p(0, fd, H), p(fw, fd, H), R1, R0], slopeDark)
    // gable triangles
    poly(g, [p(0, 0, H), p(0, fd, H), R0], gableCol)
    poly(g, [p(fw, 0, H), p(fw, fd, H), R1], gableCol)
    stroke(g, [R0, R1], 0x000000, 1, 0.12) // ridge
  } else {
    const cx = fw / 2
    const R0 = p(cx, 0, H + peak)
    const R1 = p(cx, fd, H + peak)
    poly(g, [p(0, 0, H), p(0, fd, H), R1, R0], slopeDark)
    poly(g, [p(fw, 0, H), p(fw, fd, H), R1, R0], slopeLit)
    poly(g, [p(0, 0, H), p(fw, 0, H), R0], gableCol)
    poly(g, [p(0, fd, H), p(fw, fd, H), R1], gableCol)
    stroke(g, [R0, R1], 0x000000, 1, 0.12)
  }
}

/** Vaulted "barrel" roof for a soundstage: stacked domed rhombi. */
function barrelRoof(b: Builder, fw: number, fd: number, H: number, rise: number): void {
  const { g, p } = b
  const bands = 5
  const cx = fw / 2
  const cy = fd / 2
  for (let i = 0; i <= bands; i++) {
    const t = i / bands
    const z = H + t * rise
    // shrinking rhombus centered on the roof fakes a vaulted profile
    const rw = (1 - t) * (fw / 2)
    const rd = (1 - t) * (fd / 2)
    const shade = Phaser.Display.Color.Interpolate.ColorWithColor(
      Phaser.Display.Color.ValueToColor(K.buffLeft),
      Phaser.Display.Color.ValueToColor(0xf3e6c6),
      bands,
      i,
    )
    const col = i === 0 ? K.buff : Phaser.Display.Color.GetColor(shade.r, shade.g, shade.b)
    poly(
      g,
      [
        p(cx - rw, cy - rd, z),
        p(cx + rw, cy - rd, z),
        p(cx + rw, cy + rd, z),
        p(cx - rw, cy + rd, z),
      ],
      col,
      1,
    )
  }
}

// ── building composers ────────────────────────────────────────────────────────

function bakeAdmin(scene: Phaser.Scene): void {
  const fw = 3,
    fd = 3,
    H = 118,
    topExtra = 46
  const b = beginBuilding(scene, fw, fd, H, topExtra)
  const { g, p } = b
  drawWalls(b, fw, fd, H, K.taupeRight, K.taupeLeft)
  // brass string-courses (art-deco horizontal bands)
  for (const z of [H * 0.34, H * 0.67]) {
    poly(g, [p(0, fd, z - 3), p(fw, fd, z - 3), p(fw, fd, z + 3), p(0, fd, z + 3)], K.brass, 0.85)
    poly(g, [p(fw, 0, z - 3), p(fw, fd, z - 3), p(fw, fd, z + 3), p(fw, 0, z + 3)], K.brassDark, 0.85)
  }
  windowsRight(b, fw, fd, H, 4, 3, K.glass, K.windowLit)
  flatRoof(b, fw, fd, H, K.roofFlat, K.roofFlatDark)
  // stepped deco crown centered on roof
  const cx = fw / 2,
    cy = fd / 2
  for (let s = 0; s < 3; s++) {
    const t = s / 3
    const rw = (1 - t) * 0.9
    const rd = (1 - t) * 0.9
    const z = H + s * 12
    poly(
      g,
      [
        p(cx - rw, cy - rd, z),
        p(cx + rw, cy - rd, z),
        p(cx + rw, cy + rd, z),
        p(cx - rw, cy + rd, z),
      ],
      s % 2 ? K.brass : K.taupe,
    )
    poly(
      g,
      [p(cx - rw, cy + rd, z), p(cx + rw, cy + rd, z), p(cx + rw, cy + rd, z + 12), p(cx - rw, cy + rd, z + 12)],
      K.taupeLeft,
    )
  }
  // flag mast
  stroke(g, [p(cx, cy, H + 34), p(cx, cy, H + topExtra)], K.brassDark, 2)
  BUILDING_TEX.admin = { key: 'b-admin', originX: 0.5, originY: b.originY, fw, fd }
  finalize(b, 'b-admin')
}

function bakeWriters(scene: Phaser.Scene): void {
  const fw = 3,
    fd = 2,
    H = 64,
    peak = 30
  const b = beginBuilding(scene, fw, fd, H, peak)
  drawWalls(b, fw, fd, H, K.creamRight, K.creamLeft)
  windowsRight(b, fw, fd, H, 4, 2, K.window, K.windowLit)
  gableRoof(b, fw, fd, H, peak, K.terracotta, K.terracottaDark, K.cream)
  BUILDING_TEX.writers = { key: 'b-writers', originX: 0.5, originY: b.originY, fw, fd }
  finalize(b, 'b-writers')
}

function bakeCasting(scene: Phaser.Scene): void {
  const fw = 2,
    fd = 2,
    H = 52,
    peak = 24
  const b = beginBuilding(scene, fw, fd, H, peak)
  drawWalls(b, fw, fd, H, K.creamRight, K.creamLeft)
  windowsRight(b, fw, fd, H, 3, 1, K.window, K.windowLit)
  gableRoof(b, fw, fd, H, peak, K.terracotta, K.terracottaDark, K.cream)
  BUILDING_TEX.casting = { key: 'b-casting', originX: 0.5, originY: b.originY, fw, fd }
  finalize(b, 'b-casting')
}

function bakeStage(scene: Phaser.Scene): void {
  const fw = 4,
    fd = 4,
    H = 78,
    rise = 34
  const b = beginBuilding(scene, fw, fd, H, rise)
  const { g, p } = b
  drawWalls(b, fw, fd, H, K.buffRight, K.buffLeft)
  barrelRoof(b, fw, fd, H, rise)
  // big elephant doors on the front-right face
  poly(
    g,
    [p(0.7, fd, 0), p(fw - 0.7, fd, 0), p(fw - 0.7, fd, H * 0.72), p(0.7, fd, H * 0.72)],
    K.stageDoor,
  )
  for (let i = 1; i < 5; i++) {
    const t = i / 5
    stroke(g, [p(0.7 + t * (fw - 1.4), fd, 0), p(0.7 + t * (fw - 1.4), fd, H * 0.72)], K.stageDoorSeam, 1.5)
  }
  BUILDING_TEX.stage = { key: 'b-stage', originX: 0.5, originY: b.originY, fw, fd }
  finalize(b, 'b-stage')
}

function bakePost(scene: Phaser.Scene): void {
  const fw = 3,
    fd = 2,
    H = 58
  const b = beginBuilding(scene, fw, fd, H, 20)
  const { g, p } = b
  drawWalls(b, fw, fd, H, K.slateRight, K.slateLeft)
  windowsRight(b, fw, fd, H, 4, 2, K.glass, K.glass)
  flatRoof(b, fw, fd, H, K.roofFlat, K.roofFlatDark)
  // rooftop vents / AC blocks
  for (const [gx, gy] of [
    [1, 0.6],
    [2, 1.2],
  ] as const) {
    poly(g, [p(gx - 0.3, gy, H), p(gx + 0.3, gy, H), p(gx + 0.3, gy + 0.3, H), p(gx - 0.3, gy + 0.3, H)], K.slate)
    poly(g, [p(gx + 0.3, gy, H), p(gx + 0.3, gy + 0.3, H), p(gx + 0.3, gy + 0.3, H + 12), p(gx + 0.3, gy, H + 12)], K.slateLeft)
  }
  BUILDING_TEX.post = { key: 'b-post', originX: 0.5, originY: b.originY, fw, fd }
  finalize(b, 'b-post')
}

function bakeTheater(scene: Phaser.Scene): void {
  const fw = 3,
    fd = 2,
    H = 70,
    peak = 40
  const b = beginBuilding(scene, fw, fd, H, peak)
  const { g, p } = b
  drawWalls(b, fw, fd, H, K.creamRight, K.creamLeft)
  // marquee canopy jutting from the front-right face
  poly(g, [p(0.3, fd, H * 0.5), p(fw - 0.3, fd, H * 0.5), p(fw - 0.3, fd + 0.5, H * 0.5), p(0.3, fd + 0.5, H * 0.5)], K.marqueeTrim)
  poly(g, [p(0.3, fd + 0.5, H * 0.5), p(fw - 0.3, fd + 0.5, H * 0.5), p(fw - 0.3, fd + 0.5, H * 0.5 - 10), p(0.3, fd + 0.5, H * 0.5 - 10)], K.marquee)
  // vertical blade sign
  poly(g, [p(fw - 0.5, fd, H * 0.55), p(fw - 0.2, fd, H * 0.55), p(fw - 0.2, fd, H + peak * 0.7), p(fw - 0.5, fd, H + peak * 0.7)], K.bladeSign)
  gableRoof(b, fw, fd, H, peak, K.terracotta, K.terracottaDark, K.cream)
  BUILDING_TEX.theater = { key: 'b-theater', originX: 0.5, originY: b.originY, fw, fd }
  finalize(b, 'b-theater')
}

// ── props ─────────────────────────────────────────────────────────────────────

function bakeProp(
  scene: Phaser.Scene,
  key: string,
  w: number,
  h: number,
  originY: number,
  draw: (g: Phaser.GameObjects.Graphics) => void,
): void {
  const g = scene.make.graphics({ x: 0, y: 0 })
  draw(g)
  g.generateTexture(key, Math.ceil(w), Math.ceil(h))
  g.destroy()
  PROP_TEX[key] = { key, originX: 0.5, originY, fw: 1, fd: 1 }
}

function bakeProps(scene: Phaser.Scene): void {
  // soft shadow blob
  bakeProp(scene, 'p-shadow', 80, 40, 0.5, (g) => {
    for (let i = 5; i >= 1; i--) {
      g.fillStyle(K.shadow, 0.06)
      g.fillEllipse(40, 20, i * 14, i * 7)
    }
  })

  // palm tree
  bakeProp(scene, 'p-palm', 60, 96, 0.92, (g) => {
    const cx = 30
    stroke(g, [{ x: cx, y: 92 }, { x: cx - 3, y: 60 }, { x: cx + 2, y: 34 }], K.trunk, 5)
    for (let i = 0; i < 7; i++) {
      const a = (Math.PI * 2 * i) / 7 - Math.PI / 2
      const ex = cx + Math.cos(a) * 24
      const ey = 30 + Math.sin(a) * 14
      stroke(g, [{ x: cx, y: 32 }, { x: (cx + ex) / 2, y: (30 + ey) / 2 - 6 }, { x: ex, y: ey }], K.palmFrond, 4)
    }
    g.fillStyle(K.palmFrond, 1)
    g.fillCircle(cx, 30, 5)
  })

  // clipped hedge (small iso block)
  bakeProp(scene, 'p-hedge', TILE_W, TILE_H + 22, 0.86, (g) => {
    const p = (gx: number, gy: number, z: number): Pt => ({ x: (gx - gy) * hw + hw, y: (gx + gy) * hh - z + 22 })
    poly(g, [p(0, 1, 0), p(1, 1, 0), p(1, 1, 22), p(0, 1, 22)], K.hedgeDark)
    poly(g, [p(1, 0, 0), p(1, 1, 0), p(1, 1, 22), p(1, 0, 22)], K.hedgeDark)
    poly(g, [p(0, 0, 22), p(1, 0, 22), p(1, 1, 22), p(0, 1, 22)], K.hedge)
  })

  // flowering planter
  bakeProp(scene, 'p-planter', 44, 44, 0.8, (g) => {
    g.fillStyle(K.planter, 1)
    g.fillRoundedRect(10, 22, 24, 16, 3)
    g.fillStyle(K.hedge, 1)
    g.fillCircle(16, 20, 7)
    g.fillCircle(28, 22, 7)
    g.fillCircle(22, 15, 7)
    g.fillStyle(K.bannerGold, 0.9)
    g.fillCircle(18, 16, 2.5)
    g.fillCircle(26, 19, 2.5)
  })

  // lamp post
  bakeProp(scene, 'p-lamp', 24, 84, 0.95, (g) => {
    stroke(g, [{ x: 12, y: 82 }, { x: 12, y: 16 }], K.lampPost, 3)
    g.fillStyle(K.lampGlow, 1)
    g.fillCircle(12, 12, 5)
    g.lineStyle(2, K.lampPost, 1)
    g.strokeCircle(12, 12, 6)
  })

  // bench
  bakeProp(scene, 'p-bench', 40, 28, 0.85, (g) => {
    g.fillStyle(K.bench, 1)
    g.fillRect(8, 16, 24, 4)
    g.fillRect(8, 8, 24, 3)
    g.fillStyle(0x000000, 0.3)
    g.fillRect(10, 20, 3, 6)
    g.fillRect(27, 20, 3, 6)
  })

  // iconic water tower (generic silhouette — legs + tank + finial)
  bakeProp(scene, 'p-tower', 110, 190, 0.95, (g) => {
    const cx = 55
    // four splayed legs with cross-bracing
    const legs = [
      [cx - 34, 188, cx - 14, 96],
      [cx + 34, 188, cx + 14, 96],
      [cx - 18, 180, cx - 8, 96],
      [cx + 18, 180, cx + 8, 96],
    ] as const
    for (const [x0, y0, x1, y1] of legs) stroke(g, [{ x: x0, y: y0 }, { x: x1, y: y1 }], K.towerLeg, 3)
    stroke(g, [{ x: cx - 30, y: 150 }, { x: cx + 30, y: 150 }], K.towerLeg, 2)
    stroke(g, [{ x: cx - 24, y: 120 }, { x: cx + 24, y: 120 }], K.towerLeg, 2)
    stroke(g, [{ x: cx - 34, y: 188 }, { x: cx + 14, y: 96 }], K.towerLeg, 1.5, 0.6)
    stroke(g, [{ x: cx + 34, y: 188 }, { x: cx - 14, y: 96 }], K.towerLeg, 1.5, 0.6)
    // tank
    g.fillStyle(K.towerTank, 1)
    g.fillRect(cx - 26, 52, 52, 44)
    g.fillStyle(0x000000, 0.12)
    g.fillRect(cx + 10, 52, 16, 44)
    // conical top
    poly(g, [{ x: cx - 26, y: 52 }, { x: cx + 26, y: 52 }, { x: cx, y: 24 }], K.towerLeg)
    stroke(g, [{ x: cx, y: 24 }, { x: cx, y: 12 }], K.towerLeg, 2)
    g.fillStyle(K.banner, 1)
    g.fillCircle(cx, 11, 3)
  })

  // studio delivery cart / open roadster (simple)
  bakeProp(scene, 'p-vehicle', 64, 40, 0.82, (g) => {
    g.fillStyle(K.vehicleBody, 1)
    g.fillRoundedRect(8, 14, 44, 12, 3)
    g.fillRect(14, 8, 24, 8)
    g.fillStyle(K.vehicleTrim, 0.9)
    g.fillRect(16, 9, 8, 6)
    g.fillRect(26, 9, 8, 6)
    g.fillStyle(0x1c1712, 1)
    g.fillCircle(18, 27, 5)
    g.fillCircle(44, 27, 5)
    g.fillStyle(K.bannerGold, 1)
    g.fillCircle(18, 27, 2)
    g.fillCircle(44, 27, 2)
  })

  // worker figure (simple standing person)
  bakeProp(scene, 'p-worker', 18, 34, 0.94, (g) => {
    g.fillStyle(K.worker, 1)
    g.fillRoundedRect(6, 12, 6, 14, 2) // body
    g.fillStyle(0xe8caa8, 1)
    g.fillCircle(9, 8, 4) // head
    g.fillStyle(K.worker, 1)
    g.fillRect(6, 24, 2.5, 8) // legs
    g.fillRect(10, 24, 2.5, 8)
  })
  bakeProp(scene, 'p-worker2', 18, 34, 0.94, (g) => {
    g.fillStyle(K.workerAlt, 1)
    g.fillRoundedRect(6, 12, 6, 14, 2)
    g.fillStyle(0xe8caa8, 1)
    g.fillCircle(9, 8, 4)
    g.fillStyle(K.workerAlt, 1)
    g.fillRect(6, 24, 2.5, 8)
    g.fillRect(10, 24, 2.5, 8)
  })

  // entrance gate: two pillars + arch beam (drawn as an iso-facing prop)
  bakeProp(scene, 'p-gate', 200, 150, 0.9, (g) => {
    const p = (gx: number, gy: number, z: number): Pt => ({ x: (gx - gy) * hw + hw + 30, y: (gx + gy) * hh - z + 108 })
    // left pillar at grid (0,0), right pillar at (0,2)
    for (const gy of [0, 2]) {
      poly(g, [p(0, gy, 0), p(0.5, gy, 0), p(0.5, gy, 96), p(0, gy, 96)], K.creamRight)
      poly(g, [p(0.5, gy, 0), p(0.5, gy + 0.4, 0), p(0.5, gy + 0.4, 96), p(0.5, gy, 96)], K.creamLeft)
      poly(g, [p(0, gy, 96), p(0.5, gy, 96), p(0.5, gy + 0.4, 96), p(0, gy + 0.4, 96)], K.roofFlat)
    }
    // arch beam
    poly(g, [p(0.1, 0, 96), p(0.4, 0, 96), p(0.4, 2.4, 96), p(0.1, 2.4, 96)], K.marqueeTrim)
    poly(g, [p(0.1, 0, 108), p(0.4, 0, 108), p(0.4, 2.4, 108), p(0.1, 2.4, 108)], K.brass)
  })

  // rooftop recording light bulb (baked small; scene toggles tint/alpha)
  bakeProp(scene, 'p-bulb', 16, 16, 0.5, (g) => {
    g.fillStyle(0xffffff, 1)
    g.fillCircle(8, 8, 5)
  })

  // marquee bulb strip element for the theater when a hit is up
  bakeProp(scene, 'p-banner', 120, 60, 0.95, (g) => {
    poly(
      g,
      [
        { x: 8, y: 8 },
        { x: 112, y: 8 },
        { x: 104, y: 44 },
        { x: 16, y: 44 },
      ],
      K.banner,
    )
    g.fillStyle(K.bannerGold, 1)
    g.fillRect(8, 8, 104, 4)
    for (let i = 0; i < 6; i++) g.fillCircle(20 + i * 16, 6, 2.5)
  })
}

// ── ground tiles (baked as diamonds, drawn into a RenderTexture by the scene) ──

function bakeTiles(scene: Phaser.Scene): void {
  const diamond: Pt[] = [
    { x: hw, y: 0 },
    { x: TILE_W, y: hh },
    { x: hw, y: TILE_H },
    { x: 0, y: hh },
  ]
  const mk = (key: string, fill: number, edge: number, extra?: (g: Phaser.GameObjects.Graphics) => void): void => {
    const g = scene.make.graphics({ x: 0, y: 0 })
    poly(g, diamond, fill)
    stroke(g, diamond, edge, 1, 0.35, true)
    if (extra) extra(g)
    g.generateTexture(key, TILE_W, TILE_H)
    g.destroy()
  }
  mk('t-lawn', K.lawn, K.lawnEdge, (g) => {
    g.fillStyle(K.lawnAlt, 0.5)
    g.fillEllipse(hw, hh, 30, 15)
  })
  mk('t-lawn2', K.lawnAlt, K.lawnEdge)
  mk('t-path', K.path, K.pathEdge)
  mk('t-road', K.road, K.roadEdge)
  mk('t-road-line', K.road, K.roadEdge, (g) => {
    g.fillStyle(K.roadLine, 0.7)
    g.fillRect(hw - 12, hh - 2, 24, 4)
  })
  mk('t-plaza', K.plaza, K.plazaEdge, (g) => {
    g.lineStyle(1, K.plazaSeam, 0.6)
    g.beginPath()
    g.moveTo(hw, 6)
    g.lineTo(hw, TILE_H - 6)
    g.moveTo(10, hh)
    g.lineTo(TILE_W - 10, hh)
    g.strokePath()
  })
  mk('t-dirt', K.dirt, K.dirtEdge)
}

/** Generate every texture once. Call from Scene.create before building the lot. */
export function bakeAllTextures(scene: Phaser.Scene): void {
  bakeTiles(scene)
  bakeAdmin(scene)
  bakeWriters(scene)
  bakeCasting(scene)
  bakeStage(scene)
  bakePost(scene)
  bakeTheater(scene)
  bakeProps(scene)
}
