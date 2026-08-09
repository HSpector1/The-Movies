// ── Programmatic placeholder assets ───────────────────────────────────────────
// All artwork is generated at runtime from Phaser Graphics — no image files, no
// copied assets. Everything is original geometry in the restrained palette. Each
// building is an isometric massing (roof rhombus + two lit/shadowed wall faces)
// with a distinguishing silhouette so the lot reads as a PLACE, not gray boxes.
//
// Textures are baked once into the texture manager; the scene places sprites.

import type Phaser from 'phaser'
import { TILE_W, TILE_H } from './iso'
import { COLORS as K } from './palette'
import { LEGACY_STAGE, STAGE_A, STAGE_B, type StageSpec } from './stageSpec'

const hw = TILE_W / 2
const hh = TILE_H / 2

type Pt = { x: number; y: number }

/**
 * Linear RGB interpolation, `index` steps along a ramp of `length`.
 *
 * This replaces the one runtime Phaser call this module used to make
 * (`Phaser.Display.Color.Interpolate.ColorWithColor` + `GetColor`) and is bit-identical
 * to it: Phaser's `Linear(p0,p1,t) = (p1-p0)*t+p0` and `GetColor(r,g,b) = r<<16|g<<8|b`,
 * with the same un-rounded channel values fed straight into the bitwise pack. Dropping the
 * value-import is what makes the whole baking layer unit-testable — Phaser cannot be
 * imported under jsdom (it touches a real canvas at module load), which is why every other
 * lot module uses `import type`.
 */
function lerpColor(from: number, to: number, length: number, index: number): number {
  const t = index / length
  const r0 = (from >> 16) & 0xff
  const g0 = (from >> 8) & 0xff
  const b0 = from & 0xff
  const r1 = (to >> 16) & 0xff
  const g1 = (to >> 8) & 0xff
  const b1 = to & 0xff
  const r = (r1 - r0) * t + r0
  const g = (g1 - g0) * t + g0
  const b = (b1 - b0) * t + b0
  return (r << 16) | (g << 8) | b
}

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

/**
 * Vaulted "barrel" roof for a soundstage: stacked domed rhombi.
 * Band count and the colour ramp come from the stage's spec/palette; the geometry is
 * unchanged from the original hard-coded version.
 */
function barrelRoof(
  b: Builder,
  fw: number,
  fd: number,
  H: number,
  rise: number,
  bands: number,
  base: number,
  shadeFrom: number,
  shadeTo: number,
): void {
  const { g, p } = b
  const cx = fw / 2
  const cy = fd / 2
  for (let i = 0; i <= bands; i++) {
    const t = i / bands
    const z = H + t * rise
    // shrinking rhombus centered on the roof fakes a vaulted profile
    const rw = (1 - t) * (fw / 2)
    const rd = (1 - t) * (fd / 2)
    const col = i === 0 ? base : lerpColor(shadeFrom, shadeTo, bands, i)
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

// ── soundstage composer (D1-B) ────────────────────────────────────────────────
// One function composes ANY soundstage from a StageSpec. It draws exactly what the
// previous hard-coded bakeStage() drew when handed LEGACY_STAGE — same helpers, same
// order, same numbers — so re-expressing the shipped stage through the composer is a
// provable no-op. Distinct stages are new spec literals, not new code paths.

/**
 * Compose one soundstage into a baked texture and return its sprite metadata.
 * Pure presentation: a spec describes how a stage LOOKS, never what it can do.
 */
export function bakeStageFromSpec(scene: Phaser.Scene, spec: StageSpec): BakedSprite {
  const { fw, fd } = spec.bays
  const H = spec.wallH
  const pal = spec.palette
  // The roof's rise is also the texture headroom above the eave (topExtra).
  const topExtra = spec.roof.rise
  const b = beginBuilding(scene, fw, fd, H, topExtra)
  const { g, p } = b

  drawWalls(b, fw, fd, H, pal.wallRight, pal.wallLeft)
  barrelRoof(b, fw, fd, H, spec.roof.rise, spec.roof.bands, pal.roofBase, pal.roofShadeFrom, pal.roofShadeTo)

  // big elephant doors on the front-left (+gy) face
  const { inset, heightFrac, leaves } = spec.doors
  const doorH = H * heightFrac
  const span = fw - inset * 2
  poly(g, [p(inset, fd, 0), p(fw - inset, fd, 0), p(fw - inset, fd, doorH), p(inset, fd, doorH)], pal.doorFill)
  for (let i = 1; i < leaves; i++) {
    const t = i / leaves
    stroke(g, [p(inset + t * span, fd, 0), p(inset + t * span, fd, doorH)], pal.doorSeam, 1.5)
  }

  const baked: BakedSprite = { key: spec.key, originX: 0.5, originY: b.originY, fw, fd }
  finalize(b, spec.key)
  return baked
}

/**
 * Bake the lot's soundstages.
 *
 * `distinct === false` (the default, content flag OFF) bakes the single shared `b-stage`
 * texture from LEGACY_STAGE and points both stages at it — exactly the pre-D1-B lot.
 * `distinct === true` bakes a texture per stage from STAGE_A / STAGE_B.
 *
 * Either way this costs ZERO top-level display objects: `scene.make.graphics()` is never
 * added to the display list, and the result is a texture the scene places as one sprite.
 */
function bakeStages(scene: Phaser.Scene, distinct: boolean): void {
  if (!distinct) {
    const shared = bakeStageFromSpec(scene, LEGACY_STAGE)
    BUILDING_TEX.stage = shared
    BUILDING_TEX.stageA = shared
    BUILDING_TEX.stageB = shared
    return
  }
  const a = bakeStageFromSpec(scene, STAGE_A)
  BUILDING_TEX.stageA = a
  BUILDING_TEX.stageB = bakeStageFromSpec(scene, STAGE_B)
  // `stage` stays a valid alias (nothing renders it once the stages are distinct); the
  // shared legacy texture is not baked in this mode because nothing would place it.
  BUILDING_TEX.stage = a
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

  // entrance gate: a hero arch — two deco pillars + a lettered header beam.
  // Spans 3 tiles in gy (a proper boulevard-width entrance). Studio-name text is
  // added by the scene as an overlay on the header (Graphics can't draw text).
  bakeProp(scene, 'p-gate', 260, 210, 0.9, (g) => {
    const OX = 100
    const OY = 150
    const p = (gx: number, gy: number, z: number): Pt => ({ x: (gx - gy) * hw + OX, y: (gx + gy) * hh - z + OY })
    const PW = 0.7 // pillar footprint
    const H = 120
    for (const gy of [0, 3 - PW]) {
      // pillar: two lit/shadow faces + deco cap
      poly(g, [p(0, gy, 0), p(PW, gy, 0), p(PW, gy, H), p(0, gy, H)], K.taupeRight)
      poly(g, [p(PW, gy, 0), p(PW, gy + PW, 0), p(PW, gy + PW, H), p(PW, gy, H)], K.taupeLeft)
      poly(g, [p(0, gy, H), p(PW, gy, H), p(PW, gy + PW, H), p(0, gy + PW, H)], K.roofFlat)
      // brass base band
      poly(g, [p(0, gy, 10), p(PW, gy, 10), p(PW, gy, 16), p(0, gy, 16)], K.brass, 0.9)
    }
    // header beam spanning the two pillars (deep so text reads on it)
    const bz0 = H - 26
    poly(g, [p(0.1, 0, bz0), p(0.55, 0, bz0), p(0.55, 3, bz0), p(0.1, 3, bz0)], K.taupe)
    poly(g, [p(0.1, 0, H), p(0.55, 0, H), p(0.55, 3, H), p(0.1, 3, H)], K.roofFlat)
    poly(g, [p(0.55, 0, bz0), p(0.55, 3, bz0), p(0.55, 3, H), p(0.55, 0, H)], K.taupeLeft)
    // brass trim lines on the header face
    poly(g, [p(0.1, 0, H - 4), p(0.1, 3, H - 4), p(0.1, 3, H), p(0.1, 0, H)], K.brass, 0.9)
    poly(g, [p(0.1, 0, bz0), p(0.1, 3, bz0), p(0.1, 3, bz0 + 3), p(0.1, 0, bz0 + 3)], K.brass, 0.9)
    // stepped deco finial centered on the beam
    poly(g, [p(0.2, 1.1, H), p(0.45, 1.1, H), p(0.45, 1.9, H), p(0.2, 1.9, H)], K.brass)
    poly(g, [p(0.2, 1.9, H), p(0.45, 1.9, H), p(0.45, 1.9, H + 12), p(0.2, 1.9, H + 12)], K.brassDark)
    poly(g, [p(0.25, 1.3, H + 12), p(0.4, 1.3, H + 12), p(0.4, 1.7, H + 12), p(0.25, 1.7, H + 12)], K.brass)
  })

  // guard booth beside the gate
  bakeProp(scene, 'p-booth', 70, 78, 0.9, (g) => {
    const OX = 24
    const OY = 52
    const p = (gx: number, gy: number, z: number): Pt => ({ x: (gx - gy) * hw * 0.5 + OX, y: (gx + gy) * hh * 0.5 - z + OY })
    const H = 40
    poly(g, [p(0, 1, 0), p(1, 1, 0), p(1, 1, H), p(0, 1, H)], K.creamRight)
    poly(g, [p(1, 0, 0), p(1, 1, 0), p(1, 1, H), p(1, 0, H)], K.creamLeft)
    // window band
    poly(g, [p(0.1, 1, H * 0.55), p(0.9, 1, H * 0.55), p(0.9, 1, H * 0.85), p(0.1, 1, H * 0.85)], K.glass, 0.9)
    // hip roof
    poly(g, [p(0, 0, H), p(1, 0, H), p(1, 1, H), p(0, 1, H)], K.terracottaDark)
    poly(g, [p(0, 0, H), p(1, 0, H), p(0.5, 0.5, H + 14)], K.terracotta)
    poly(g, [p(1, 0, H), p(1, 1, H), p(0.5, 0.5, H + 14)], K.terracottaDark)
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

// ── pass-2 props: ambient roles, equipment, vehicles, dressing ────────────────

function figure(g: Phaser.GameObjects.Graphics, body: number, opts: {
  hat?: number
  trim?: number
}): void {
  // shared little-person silhouette, 18x36, feet near y=34
  g.fillStyle(body, 1)
  g.fillRoundedRect(6, 13, 6, 14, 2) // torso
  if (opts.trim) {
    g.fillStyle(opts.trim, 1)
    g.fillRect(6, 13, 6, 3) // collar/scarf
  }
  g.fillStyle(K.skin, 1)
  g.fillCircle(9, 9, 4) // head
  if (opts.hat) {
    g.fillStyle(opts.hat, 1)
    g.fillRect(5, 6, 8, 3) // hat brim
    g.fillRect(6.5, 3.5, 5, 3)
  }
  g.fillStyle(body, 1)
  g.fillRect(6, 25, 2.6, 9) // legs
  g.fillRect(10, 25, 2.6, 9)
}

function bakeProps2(scene: Phaser.Scene): void {
  // ── ambient roles (four distinct silhouettes) ──────────────────────────────
  // general crew: blue coverall + hard hat
  bakeProp(scene, 'p-crew', 18, 36, 0.95, (g) => figure(g, K.roleCrew, { hat: K.roleCrewHat }))
  // office/creative staff: tan, carrying a clipboard
  bakeProp(scene, 'p-office', 20, 36, 0.95, (g) => {
    figure(g, K.roleOffice, {})
    g.fillStyle(K.titleBoard, 1)
    g.fillRect(12, 17, 5, 6) // clipboard
  })
  // talent / executive: pale glamour coat + red scarf
  bakeProp(scene, 'p-talent', 18, 37, 0.95, (g) => figure(g, K.roleTalent, { trim: K.roleTalentTrim }))
  // grip pushing a hand-cart of gear
  bakeProp(scene, 'p-grip', 30, 36, 0.95, (g) => {
    figure(g, K.roleGrip, {})
    g.fillStyle(K.cartFrame, 1)
    g.fillRect(14, 24, 12, 3) // cart deck
    g.fillStyle(K.crate, 1)
    g.fillRect(16, 15, 9, 9) // crate on cart
    g.fillStyle(0x000000, 0.5)
    g.fillCircle(16, 30, 3)
    g.fillCircle(24, 30, 3)
  })
  // director: long coat, fedora, red scarf, rolled script — a confident silhouette
  bakeProp(scene, 'p-director', 20, 40, 0.95, (g) => {
    g.fillStyle(K.roleDirector, 1)
    g.fillRoundedRect(5, 13, 8, 18, 2) // longer coat
    g.fillStyle(K.roleDirectorScarf, 1)
    g.fillRect(5, 13, 8, 3)
    g.fillStyle(K.skin, 1)
    g.fillCircle(9, 9, 4)
    g.fillStyle(K.roleDirectorHat, 1)
    g.fillRect(4, 6, 10, 2.5) // fedora brim
    g.fillRect(6, 3, 6, 3.5) // crown
    g.fillStyle(K.titleBoard, 1)
    g.fillRect(13, 18, 3, 8) // rolled script under arm
    g.fillStyle(K.roleDirector, 1)
    g.fillRect(5, 29, 3, 8)
    g.fillRect(10, 29, 3, 8)
  })
  // publicity photographer: crouched stance, big camera at the face
  bakeProp(scene, 'p-photog', 22, 34, 0.95, (g) => {
    g.fillStyle(K.rolePhotog, 1)
    g.fillRoundedRect(5, 14, 7, 12, 2)
    g.fillStyle(K.skin, 1)
    g.fillCircle(9, 10, 4)
    g.fillStyle(K.cameraBox, 1)
    g.fillRect(10, 7, 9, 7) // camera body
    g.fillStyle(K.glass, 0.9)
    g.fillCircle(18, 10.5, 2.5) // lens
    g.fillStyle(K.rolePhotog, 1)
    g.fillRect(5, 24, 2.6, 9)
    g.fillRect(9, 24, 2.6, 9)
  })

  // ── production equipment (clusters near active stages) ─────────────────────
  bakeProp(scene, 'p-cart', 40, 34, 0.85, (g) => {
    g.fillStyle(K.cartFrame, 1)
    g.fillRect(6, 20, 28, 4)
    g.fillStyle(K.crate, 1)
    g.fillRect(9, 8, 11, 12)
    g.fillStyle(K.cartBody, 1)
    g.fillRect(21, 11, 10, 9)
    g.fillStyle(0x000000, 0.5)
    g.fillCircle(11, 26, 3.5)
    g.fillCircle(29, 26, 3.5)
  })
  bakeProp(scene, 'p-crate', 30, 28, 0.82, (g) => {
    g.fillStyle(K.crate, 1)
    g.fillRect(4, 12, 13, 13)
    g.fillStyle(0xffffff, 0.06)
    g.fillRect(4, 12, 13, 3)
    g.fillStyle(K.cartFrame, 1)
    g.fillRect(15, 8, 11, 17)
    g.fillStyle(K.brass, 0.7)
    g.fillRect(15, 15, 11, 2)
  })
  bakeProp(scene, 'p-cone', 16, 20, 0.9, (g) => {
    g.fillStyle(K.cone, 1)
    poly(g, [{ x: 8, y: 4 }, { x: 12, y: 17 }, { x: 4, y: 17 }], K.cone)
    g.fillStyle(K.titleBoard, 0.85)
    g.fillRect(5.5, 10, 5, 2)
    g.fillStyle(K.cartFrame, 1)
    g.fillRect(3, 17, 10, 2)
  })
  bakeProp(scene, 'p-light', 20, 48, 0.96, (g) => {
    stroke(g, [{ x: 10, y: 46 }, { x: 10, y: 20 }], K.lightStand, 2.5)
    stroke(g, [{ x: 10, y: 44 }, { x: 4, y: 47 }], K.lightStand, 2)
    stroke(g, [{ x: 10, y: 44 }, { x: 16, y: 47 }], K.lightStand, 2)
    g.fillStyle(K.lightStand, 1)
    g.fillRect(4, 8, 12, 12) // fixture body
    g.fillStyle(K.lightHead, 1)
    g.fillRect(6, 10, 8, 8) // lens
  })
  bakeProp(scene, 'p-titleboard', 40, 48, 0.95, (g) => {
    // A-frame easel with a title placard (scene overlays the film title text)
    stroke(g, [{ x: 12, y: 46 }, { x: 8, y: 20 }], K.titleBoardLeg, 2.5)
    stroke(g, [{ x: 28, y: 46 }, { x: 32, y: 20 }], K.titleBoardLeg, 2.5)
    g.fillStyle(K.titleBoard, 1)
    g.fillRoundedRect(4, 8, 32, 16, 2)
    g.lineStyle(1.5, K.titleBoardLeg, 0.8)
    g.strokeRoundedRect(4, 8, 32, 16, 2)
    // clapper stripes at the top
    g.fillStyle(0x241a12, 1)
    g.fillRect(4, 8, 32, 4)
    g.fillStyle(K.titleBoard, 1)
    for (let i = 0; i < 6; i++) g.fillRect(6 + i * 5.4, 8, 2.6, 4)
  })

  // ── vehicles ───────────────────────────────────────────────────────────────
  bakeProp(scene, 'p-van', 74, 48, 0.82, (g) => {
    g.fillStyle(K.vanBody, 1)
    g.fillRoundedRect(6, 12, 58, 18, 3)
    g.fillStyle(K.vanRoof, 1)
    g.fillRect(10, 8, 40, 8)
    g.fillStyle(K.glass, 0.9)
    g.fillRect(50, 14, 10, 8) // windshield
    g.fillStyle(K.brass, 0.8)
    g.fillRect(12, 20, 30, 3) // studio stripe
    g.fillStyle(0x1c1712, 1)
    g.fillCircle(20, 31, 6)
    g.fillCircle(54, 31, 6)
    g.fillStyle(K.cartFrame, 1)
    g.fillCircle(20, 31, 2.5)
    g.fillCircle(54, 31, 2.5)
  })
  bakeProp(scene, 'p-golfcart', 46, 38, 0.82, (g) => {
    g.fillStyle(K.cartFrame, 1)
    g.fillRect(8, 18, 30, 8)
    g.fillStyle(K.cartRoof, 1)
    g.fillRect(6, 6, 34, 4) // canopy
    stroke(g, [{ x: 9, y: 10 }, { x: 9, y: 18 }], K.cartFrame, 2)
    stroke(g, [{ x: 37, y: 10 }, { x: 37, y: 18 }], K.cartFrame, 2)
    g.fillStyle(K.vehicleTrim, 0.9)
    g.fillRect(10, 13, 12, 5) // seat
    g.fillStyle(0x1c1712, 1)
    g.fillCircle(14, 27, 4.5)
    g.fillCircle(32, 27, 4.5)
  })

  // ── dressing / signage / flags ─────────────────────────────────────────────
  bakeProp(scene, 'p-flag', 30, 84, 0.97, (g) => {
    stroke(g, [{ x: 8, y: 82 }, { x: 8, y: 6 }], K.flagPole, 2.5)
    g.fillStyle(K.brass, 1)
    g.fillCircle(8, 6, 2.5)
    poly(g, [{ x: 8, y: 9 }, { x: 26, y: 13 }, { x: 8, y: 22 }], K.flagCloth)
  })
  // vertical hanging premiere banner (established dressing)
  bakeProp(scene, 'p-bannerpole', 34, 96, 0.97, (g) => {
    stroke(g, [{ x: 6, y: 94 }, { x: 6, y: 6 }], K.flagPole, 3)
    g.fillStyle(K.pennantRed, 1)
    g.fillRect(6, 12, 22, 54)
    g.fillStyle(K.pennantWarm, 1)
    g.fillRect(6, 12, 22, 5)
    g.fillRect(6, 61, 22, 5)
    // simple star motif
    g.fillStyle(K.pennantWarm, 1)
    g.fillCircle(17, 38, 5)
    g.fillStyle(K.pennantRed, 1)
    g.fillCircle(17, 38, 2.5)
  })
  // café table + umbrella for a lively plaza
  bakeProp(scene, 'p-umbrella', 44, 52, 0.9, (g) => {
    stroke(g, [{ x: 22, y: 50 }, { x: 22, y: 22 }], K.cartFrame, 2)
    g.fillStyle(K.titleBoard, 1)
    g.fillEllipse(22, 44, 20, 7) // table top
    g.fillStyle(K.pennantRed, 1)
    poly(g, [{ x: 22, y: 6 }, { x: 42, y: 20 }, { x: 2, y: 20 }], K.pennantRed)
    g.fillStyle(K.pennantWarm, 1)
    for (let i = 0; i < 3; i++) poly(g, [{ x: 6 + i * 12, y: 20 }, { x: 12 + i * 12, y: 20 }, { x: 9 + i * 12, y: 24 }], K.pennantWarm)
  })
  // free-standing studio directional sign
  bakeProp(scene, 'p-sign', 40, 46, 0.95, (g) => {
    stroke(g, [{ x: 20, y: 44 }, { x: 20, y: 20 }], K.signPost, 3)
    g.fillStyle(K.signPanel, 1)
    g.fillRoundedRect(4, 10, 32, 12, 2)
    g.lineStyle(1, K.brass, 0.8)
    g.strokeRoundedRect(4, 10, 32, 12, 2)
    g.fillStyle(K.brass, 0.9)
    g.fillRect(8, 15, 18, 2)
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
  mk('t-apron', K.tarmacApron, K.roadEdge, (g) => {
    g.lineStyle(1, K.roadLine, 0.25)
    g.beginPath()
    g.moveTo(10, hh)
    g.lineTo(TILE_W - 10, hh)
    g.strokePath()
  })
}

/** Options for a bake pass. Presentation only — no simulation input reaches here. */
export type BakeOptions = {
  /**
   * D1-B soundstage content gate. OFF (the default) bakes the single shared stage
   * texture: the pre-spike lot, unchanged. ON bakes a texture per stage.
   */
  distinctStages?: boolean
}

/** Generate every texture once. Call from Scene.create before building the lot. */
export function bakeAllTextures(scene: Phaser.Scene, opts: BakeOptions = {}): void {
  bakeTiles(scene)
  bakeAdmin(scene)
  bakeWriters(scene)
  bakeCasting(scene)
  bakeStages(scene, opts.distinctStages === true)
  bakePost(scene)
  bakeTheater(scene)
  bakeProps(scene)
  bakeProps2(scene)
}
