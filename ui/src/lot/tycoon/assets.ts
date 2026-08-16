// ── Tycoon world art — procedural isometric bakes at Hollywood art direction ──
//
// Every texture here is generated at runtime from Phaser Graphics: original geometry
// in the warm 1948 palette sampled from the plate (see ./palette.ts). Two authored
// PNGs already in the repo (`/lot/b-stage-a-h2.png`, `/lot/b-stage-b.png`) are used
// for the soundstages when they load; the procedural stage below is the fallback so
// the property can never end up without a stage.
//
// Craft rules, applied consistently:
//   • ONE light direction — upper-left. The `gy = fd` face (lower-left on screen) is
//     lit; the `gx = fw` face (lower-right) is in shade; roofs are lightest.
//   • Value separation — roof > lit wall > shade wall > ground, so silhouettes read
//     at management zoom without an outline.
//   • Warm shading — shadow colour is `WARM.shadow` (#4a3b2b), never black.
//   • Signage is drawn by the SCENE as skewed text on the wall plane (Graphics cannot
//     draw text); this module only bakes the painted sign FIELD the text sits on.
//
// Textures are baked once into the texture manager; the scene places sprites. None of
// the `make.graphics` objects below are ever added to the display list.
//
// Per LL 27(c) this procedural pass serves tycoon READABILITY. It is not, and is not
// claimed to be, premium authored art.

import type Phaser from 'phaser'
import { TILE_W, TILE_H } from '../scene/iso'
import { WARM as C } from './palette'

const hw = TILE_W / 2
const hh = TILE_H / 2

type Pt = { x: number; y: number }

/** Metadata for a baked sprite: texture key + normalized origin + footprint. */
export type TycoonSprite = {
  key: string
  originX: number
  originY: number
  fw: number
  fd: number
}

export const TYCOON_BUILDING_TEX: Record<string, TycoonSprite> = {}
export const TYCOON_PROP_TEX: Record<string, TycoonSprite> = {}

/** Authored soundstage textures already shipped in `ui/public/lot/`. */
export const AUTHORED_STAGE_A_KEY = 'b-stage-a-h2'
export const AUTHORED_STAGE_B_KEY = 'b-stage-b'

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

function finalize(b: Builder, key: string): void {
  b.g.generateTexture(key, Math.ceil(b.texW), Math.ceil(b.texH))
  b.g.destroy()
}

/**
 * A grounding skirt: a one-pixel-deep darker band around the base of the walls so a
 * building meets its plinth instead of floating. Cheap, and it is what makes the
 * diorama read as built rather than pasted.
 */
function baseSkirt(b: Builder, fw: number, fd: number): void {
  const { g, p } = b
  poly(g, [p(0, fd, 0), p(fw, fd, 0), p(fw, fd, 4), p(0, fd, 4)], C.shadow, 0.28)
  poly(g, [p(fw, 0, 0), p(fw, fd, 0), p(fw, fd, 4), p(fw, 0, 4)], C.shadow, 0.38)
}

/** Two wall faces with the house light direction, plus a soft corner seam. */
function drawWalls(
  b: Builder,
  fw: number,
  fd: number,
  H: number,
  lit: number,
  shade: number,
): void {
  const { g, p } = b
  // lit face: gy = fd (lower-left on screen), catching the upper-left sun
  poly(g, [p(0, fd, 0), p(fw, fd, 0), p(fw, fd, H), p(0, fd, H)], lit)
  // shaded face: gx = fw (lower-right on screen)
  poly(g, [p(fw, 0, 0), p(fw, fd, 0), p(fw, fd, H), p(fw, 0, H)], shade)
  stroke(g, [p(fw, fd, 0), p(fw, fd, H)], C.shadow, 1, 0.16)
  baseSkirt(b, fw, fd)
}

/** A window grid on the lit (gy = fd) face. */
function windowsLit(
  b: Builder,
  fw: number,
  fd: number,
  H: number,
  cols: number,
  rows: number,
  glass: number,
  litGlass: number,
): void {
  const { g, p } = b
  const mx = 0.2
  const mz = 0.18
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const t0 = (c + mx) / cols
      const t1 = (c + 1 - mx) / cols
      const z0 = (r + mz) / rows
      const z1 = (r + 1 - mz) / rows
      const on = (c * 7 + r * 3) % 5 === 0
      poly(
        g,
        [
          p(t0 * fw, fd, z0 * H),
          p(t1 * fw, fd, z0 * H),
          p(t1 * fw, fd, z1 * H),
          p(t0 * fw, fd, z1 * H),
        ],
        on ? litGlass : glass,
        0.92,
      )
    }
  }
}

/** A narrower window band on the shaded (gx = fw) face — depth without noise. */
function windowsShade(
  b: Builder,
  fw: number,
  fd: number,
  H: number,
  cols: number,
  z0: number,
  z1: number,
): void {
  const { g, p } = b
  for (let c = 0; c < cols; c++) {
    const t0 = (c + 0.24) / cols
    const t1 = (c + 0.76) / cols
    poly(
      g,
      [
        p(fw, t0 * fd, z0 * H),
        p(fw, t1 * fd, z0 * H),
        p(fw, t1 * fd, z1 * H),
        p(fw, t0 * fd, z1 * H),
      ],
      C.glassDeep,
      0.85,
    )
  }
}

function flatRoof(b: Builder, fw: number, fd: number, H: number): void {
  const { g, p } = b
  poly(g, [p(0, 0, H), p(fw, 0, H), p(fw, fd, H), p(0, fd, H)], C.roofGravel)
  // parapet: a lit cap on the near edges reads as thickness
  poly(g, [p(0, fd, H), p(fw, fd, H), p(fw, fd, H + 5), p(0, fd, H + 5)], C.roofGravelDark)
  poly(g, [p(fw, 0, H), p(fw, fd, H), p(fw, fd, H + 5), p(fw, 0, H + 5)], C.roofGravelDark)
  poly(g, [p(0, 0, H + 5), p(fw, 0, H + 5), p(fw, fd, H + 5), p(0, fd, H + 5)], C.roofGravel, 0.6)
  stroke(g, [p(0, 0, H + 5), p(fw, 0, H + 5), p(fw, fd, H + 5), p(0, fd, H + 5)], C.shadow, 1.5, 0.3, true)
}

function gableRoof(b: Builder, fw: number, fd: number, H: number, peak: number): void {
  const { g, p } = b
  const cy = fd / 2
  const R0 = p(0, cy, H + peak)
  const R1 = p(fw, cy, H + peak)
  // back slope (gy = 0 side) — away from the sun
  poly(g, [p(0, 0, H), p(fw, 0, H), R1, R0], C.terracottaDark)
  // near slope (gy = fd side) — lit
  poly(g, [p(0, fd, H), p(fw, fd, H), R1, R0], C.terracotta)
  // gable ends
  poly(g, [p(0, 0, H), p(0, fd, H), R0], C.cream)
  poly(g, [p(fw, 0, H), p(fw, fd, H), R1], C.creamShade)
  // eave overhang shadow on the lit wall
  poly(g, [p(0, fd, H - 5), p(fw, fd, H - 5), p(fw, fd, H), p(0, fd, H)], C.shadow, 0.22)
  stroke(g, [R0, R1], C.shadow, 1.5, 0.22)
}

/** Vaulted soundstage roof — stacked domed rhombi. */
function barrelRoof(b: Builder, fw: number, fd: number, H: number, rise: number): void {
  const { g, p } = b
  const cx = fw / 2
  const cy = fd / 2
  const bands = 7
  for (let i = 0; i <= bands; i++) {
    const t = i / bands
    const z = H + t * rise
    const rw = (1 - t * 0.92) * (fw / 2)
    const rd = (1 - t * 0.92) * (fd / 2)
    const shade = i / bands
    const col = mix(C.roofMetalDark, C.roofMetal, shade)
    poly(
      g,
      [p(cx - rw, cy - rd, z), p(cx + rw, cy - rd, z), p(cx + rw, cy + rd, z), p(cx - rw, cy + rd, z)],
      col,
    )
  }
}

function mix(from: number, to: number, t: number): number {
  const r0 = (from >> 16) & 0xff
  const g0 = (from >> 8) & 0xff
  const b0 = from & 0xff
  const r1 = (to >> 16) & 0xff
  const g1 = (to >> 8) & 0xff
  const b1 = to & 0xff
  return (
    ((((r1 - r0) * t + r0) | 0) << 16) |
    ((((g1 - g0) * t + g0) | 0) << 8) |
    (((b1 - b0) * t + b0) | 0)
  )
}

/** Vertical buttress strips on the lit face — the soundstage facade rhythm. */
function pilasters(b: Builder, fw: number, fd: number, H: number, count: number, width: number): void {
  const { g, p } = b
  for (let i = 1; i <= count; i++) {
    const cx = (i / (count + 1)) * fw
    poly(
      g,
      [
        p(cx - width / 2, fd, 0),
        p(cx + width / 2, fd, 0),
        p(cx + width / 2, fd, H),
        p(cx - width / 2, fd, H),
      ],
      C.cream,
      0.55,
    )
  }
}

/**
 * A painted sign field on the lit wall — a flat band of dark paint the scene writes
 * its skewed label onto. Buildings carry their names because a tycoon world has to
 * be readable without a tooltip.
 */
function signField(
  b: Builder,
  fw: number,
  fd: number,
  H: number,
  z0: number,
  z1: number,
  inset = 0.35,
): void {
  const { g, p } = b
  poly(
    g,
    [
      p(inset, fd, z0 * H),
      p(fw - inset, fd, z0 * H),
      p(fw - inset, fd, z1 * H),
      p(inset, fd, z1 * H),
    ],
    C.signPanel,
    0.82,
  )
  stroke(
    g,
    [
      p(inset, fd, z0 * H),
      p(fw - inset, fd, z0 * H),
      p(fw - inset, fd, z1 * H),
      p(inset, fd, z1 * H),
    ],
    C.brass,
    1.5,
    0.7,
    true,
  )
}

// ── buildings ─────────────────────────────────────────────────────────────────

function bakeAdmin(scene: Phaser.Scene): void {
  const fw = 3
  const fd = 3
  const H = 118
  const topExtra = 56
  const b = beginBuilding(scene, fw, fd, H, topExtra)
  const { g, p } = b
  drawWalls(b, fw, fd, H, C.taupe, C.taupeShade)
  // art-deco string courses
  for (const z of [H * 0.36, H * 0.68]) {
    poly(g, [p(0, fd, z - 3), p(fw, fd, z - 3), p(fw, fd, z + 3), p(0, fd, z + 3)], C.brass, 0.85)
    poly(g, [p(fw, 0, z - 3), p(fw, fd, z - 3), p(fw, fd, z + 3), p(fw, 0, z + 3)], C.brassDark, 0.8)
  }
  windowsLit(b, fw, fd, H, 4, 3, C.glass, C.windowLit)
  windowsShade(b, fw, fd, H, 3, 0.42, 0.66)
  // entrance canopy + doors on the lit face
  poly(g, [p(1.1, fd, 0), p(1.9, fd, 0), p(1.9, fd, 34), p(1.1, fd, 34)], C.signPanel, 0.9)
  poly(g, [p(0.9, fd, 36), p(2.1, fd, 36), p(2.1, fd, 42), p(0.9, fd, 42)], C.awning)
  signField(b, fw, fd, H, 0.44, 0.56, 0.3)
  flatRoof(b, fw, fd, H)
  // stepped deco crown
  const cx = fw / 2
  const cy = fd / 2
  for (let s = 0; s < 3; s++) {
    const t = s / 3
    const r = (1 - t) * 0.95
    const z = H + 5 + s * 13
    poly(g, [p(cx - r, cy - r, z), p(cx + r, cy - r, z), p(cx + r, cy + r, z), p(cx - r, cy + r, z)], s % 2 ? C.brass : C.taupe)
    poly(g, [p(cx - r, cy + r, z), p(cx + r, cy + r, z), p(cx + r, cy + r, z + 13), p(cx - r, cy + r, z + 13)], C.taupeShade)
  }
  stroke(g, [p(cx, cy, H + 44), p(cx, cy, H + topExtra)], C.brassDark, 2)
  TYCOON_BUILDING_TEX['tw-admin'] = { key: 'tw-admin', originX: 0.5, originY: b.originY, fw, fd }
  finalize(b, 'tw-admin')
}

function bakeOffice(scene: Phaser.Scene, key: string, fw: number, fd: number, H: number, peak: number): void {
  const b = beginBuilding(scene, fw, fd, H, peak)
  const { g, p } = b
  drawWalls(b, fw, fd, H, C.cream, C.creamShade)
  windowsLit(b, fw, fd, H, fw + 1, 2, C.glass, C.windowLit)
  windowsShade(b, fw, fd, H, fd + 1, 0.35, 0.62)
  // door + awning
  poly(g, [p(fw / 2 - 0.28, fd, 0), p(fw / 2 + 0.28, fd, 0), p(fw / 2 + 0.28, fd, 30), p(fw / 2 - 0.28, fd, 30)], C.signPanel, 0.9)
  poly(g, [p(fw / 2 - 0.5, fd, 32), p(fw / 2 + 0.5, fd, 32), p(fw / 2 + 0.5, fd, 38), p(fw / 2 - 0.5, fd, 38)], C.awning)
  signField(b, fw, fd, H, 0.7, 0.86, 0.3)
  gableRoof(b, fw, fd, H, peak)
  TYCOON_BUILDING_TEX[key] = { key, originX: 0.5, originY: b.originY, fw, fd }
  finalize(b, key)
}

function bakePost(scene: Phaser.Scene): void {
  const fw = 3
  const fd = 2
  const H = 66
  const b = beginBuilding(scene, fw, fd, H, 26)
  const { g, p } = b
  drawWalls(b, fw, fd, H, C.slate, C.slateShade)
  windowsLit(b, fw, fd, H, 4, 2, C.glass, C.glass)
  // roller shutter — this block also serves the scenery yard behind it
  poly(g, [p(1.6, fd, 0), p(2.7, fd, 0), p(2.7, fd, 44), p(1.6, fd, 44)], C.crateDark)
  for (let i = 1; i < 5; i++) {
    stroke(g, [p(1.6, fd, i * 9), p(2.7, fd, i * 9)], C.shadow, 1, 0.35)
  }
  signField(b, fw, fd, H, 0.74, 0.9, 0.25)
  flatRoof(b, fw, fd, H)
  // rooftop plant
  for (const [gx, gy] of [
    [0.9, 0.6],
    [2.0, 1.2],
  ] as const) {
    poly(g, [p(gx - 0.28, gy - 0.28, H + 5), p(gx + 0.28, gy - 0.28, H + 5), p(gx + 0.28, gy + 0.28, H + 5), p(gx - 0.28, gy + 0.28, H + 5)], C.slateLit)
    poly(g, [p(gx - 0.28, gy + 0.28, H + 5), p(gx + 0.28, gy + 0.28, H + 5), p(gx + 0.28, gy + 0.28, H + 17), p(gx - 0.28, gy + 0.28, H + 17)], C.slateShade)
    poly(g, [p(gx - 0.28, gy - 0.28, H + 17), p(gx + 0.28, gy - 0.28, H + 17), p(gx + 0.28, gy + 0.28, H + 17), p(gx - 0.28, gy + 0.28, H + 17)], C.slate)
  }
  TYCOON_BUILDING_TEX['tw-post'] = { key: 'tw-post', originX: 0.5, originY: b.originY, fw, fd }
  finalize(b, 'tw-post')
}

function bakeTheater(scene: Phaser.Scene): void {
  const fw = 3
  const fd = 2
  const H = 78
  const peak = 42
  const b = beginBuilding(scene, fw, fd, H, peak + 26)
  const { g, p } = b
  drawWalls(b, fw, fd, H, C.cream, C.creamShade)
  // marquee canopy jutting from the lit face, with a bulb strip
  poly(g, [p(0.3, fd, H * 0.52), p(fw - 0.3, fd, H * 0.52), p(fw - 0.3, fd + 0.45, H * 0.52), p(0.3, fd + 0.45, H * 0.52)], C.marquee)
  poly(g, [p(0.3, fd + 0.45, H * 0.52), p(fw - 0.3, fd + 0.45, H * 0.52), p(fw - 0.3, fd + 0.45, H * 0.52 - 12), p(0.3, fd + 0.45, H * 0.52 - 12)], C.awning)
  for (let i = 0; i < 7; i++) {
    const t = 0.4 + (i / 7) * (fw - 0.8)
    const q = p(t, fd + 0.45, H * 0.52 - 4)
    g.fillStyle(C.brass, 1)
    g.fillCircle(q.x, q.y, 2.2)
  }
  // vertical blade sign
  poly(g, [p(fw - 0.55, fd, H * 0.56), p(fw - 0.2, fd, H * 0.56), p(fw - 0.2, fd, H + peak * 0.8), p(fw - 0.55, fd, H + peak * 0.8)], C.awning)
  stroke(g, [p(fw - 0.375, fd, H * 0.56), p(fw - 0.375, fd, H + peak * 0.8)], C.brass, 2, 0.9)
  signField(b, fw, fd, H, 0.66, 0.8, 0.3)
  gableRoof(b, fw, fd, H, peak)
  TYCOON_BUILDING_TEX['tw-theater'] = { key: 'tw-theater', originX: 0.5, originY: b.originY, fw, fd }
  finalize(b, 'tw-theater')
}

/** Procedural soundstage — the fallback whenever an authored PNG did not arrive. */
function bakeStage(scene: Phaser.Scene, key: string): void {
  const fw = 4
  const fd = 4
  const H = 104
  const rise = 46
  const b = beginBuilding(scene, fw, fd, H, rise)
  const { g, p } = b
  drawWalls(b, fw, fd, H, C.buff, C.buffShade)
  pilasters(b, fw, fd, H, 3, 0.22)
  barrelRoof(b, fw, fd, H, rise)
  // elephant doors on the lit face
  const inset = 0.55
  const doorH = H * 0.6
  poly(g, [p(inset, fd, 0), p(fw - inset, fd, 0), p(fw - inset, fd, doorH), p(inset, fd, doorH)], C.crateDark)
  for (let i = 1; i < 4; i++) {
    const t = inset + (i / 4) * (fw - inset * 2)
    stroke(g, [p(t, fd, 0), p(t, fd, doorH)], C.shadow, 1.5, 0.6)
  }
  poly(g, [p(inset - 0.12, fd, doorH), p(fw - inset + 0.12, fd, doorH), p(fw - inset + 0.12, fd, doorH + 9), p(inset - 0.12, fd, doorH + 9)], C.brassDark)
  signField(b, fw, fd, H, 0.72, 0.9, 0.5)
  TYCOON_BUILDING_TEX[key] = { key, originX: 0.5, originY: b.originY, fw, fd }
  finalize(b, key)
}

/** The hero entrance arch: two deco pillars + a lettered header beam, 1×3. */
function bakeGate(scene: Phaser.Scene): void {
  const fw = 1
  const fd = 3
  const H = 128
  const b = beginBuilding(scene, fw, fd, H, 30)
  const { g, p } = b
  const PW = 0.62
  for (const gy of [0, fd - PW]) {
    poly(g, [p(0, gy + PW, 0), p(PW, gy + PW, 0), p(PW, gy + PW, H), p(0, gy + PW, H)], C.taupe)
    poly(g, [p(PW, gy, 0), p(PW, gy + PW, 0), p(PW, gy + PW, H), p(PW, gy, H)], C.taupeShade)
    poly(g, [p(0, gy, H), p(PW, gy, H), p(PW, gy + PW, H), p(0, gy + PW, H)], C.roofGravel)
    poly(g, [p(0, gy + PW, 12), p(PW, gy + PW, 12), p(PW, gy + PW, 18), p(0, gy + PW, 18)], C.brass, 0.9)
  }
  // header beam spanning the pillars
  const bz0 = H - 30
  poly(g, [p(0, 0, bz0), p(0, fd, bz0), p(0, fd, H), p(0, 0, H)], C.taupe)
  poly(g, [p(PW, 0, bz0), p(PW, fd, bz0), p(PW, fd, H), p(PW, 0, H)], C.taupeShade)
  poly(g, [p(0, 0, H), p(PW, 0, H), p(PW, fd, H), p(0, fd, H)], C.roofGravel)
  poly(g, [p(0, 0, H - 4), p(0, fd, H - 4), p(0, fd, H), p(0, 0, H)], C.brass, 0.9)
  poly(g, [p(0, 0, bz0), p(0, fd, bz0), p(0, fd, bz0 + 3), p(0, 0, bz0 + 3)], C.brass, 0.9)
  // stepped finial
  const cy = fd / 2
  poly(g, [p(0.1, cy - 0.5, H), p(0.5, cy - 0.5, H), p(0.5, cy + 0.5, H), p(0.1, cy + 0.5, H)], C.brass)
  poly(g, [p(0.1, cy + 0.5, H), p(0.5, cy + 0.5, H), p(0.5, cy + 0.5, H + 14), p(0.1, cy + 0.5, H + 14)], C.brassDark)
  TYCOON_BUILDING_TEX['tw-gate'] = { key: 'tw-gate', originX: 0.5, originY: b.originY, fw, fd }
  finalize(b, 'tw-gate')
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
  TYCOON_PROP_TEX[key] = { key, originX: 0.5, originY, fw: 1, fd: 1 }
}

/** A small warm contact shadow, offset toward the lower right. */
function contact(g: Phaser.GameObjects.Graphics, cx: number, cy: number, rx: number): void {
  for (let i = 3; i >= 1; i--) {
    g.fillStyle(C.shadow, 0.09)
    g.fillEllipse(cx + 2, cy + 1, rx * i * 0.42, rx * i * 0.2)
  }
}

function bakeProps(scene: Phaser.Scene): void {
  bakeProp(scene, 'tw-palm', 64, 104, 0.93, (g) => {
    const cx = 32
    contact(g, cx, 99, 22)
    stroke(g, [{ x: cx, y: 99 }, { x: cx - 4, y: 64 }, { x: cx + 2, y: 34 }], C.trunk, 6)
    stroke(g, [{ x: cx, y: 99 }, { x: cx - 4, y: 64 }, { x: cx + 2, y: 34 }], C.shadow, 2, 0.25)
    for (let i = 0; i < 8; i++) {
      const a = (Math.PI * 2 * i) / 8 - Math.PI / 2
      const ex = cx + Math.cos(a) * 26
      const ey = 30 + Math.sin(a) * 15
      stroke(
        g,
        [{ x: cx, y: 33 }, { x: (cx + ex) / 2, y: (30 + ey) / 2 - 7 }, { x: ex, y: ey }],
        Math.cos(a) < 0 ? C.frond : C.frondDark,
        4.5,
      )
    }
    g.fillStyle(C.frond, 1)
    g.fillCircle(cx, 31, 5)
  })

  bakeProp(scene, 'tw-hedge', TILE_W, TILE_H + 26, 0.85, (g) => {
    const p = (gx: number, gy: number, z: number): Pt => ({ x: (gx - gy) * hw + hw, y: (gx + gy) * hh - z + 26 })
    poly(g, [p(0, 1, 0), p(1, 1, 0), p(1, 1, 24), p(0, 1, 24)], C.hedge)
    poly(g, [p(1, 0, 0), p(1, 1, 0), p(1, 1, 24), p(1, 0, 24)], C.hedgeDark)
    poly(g, [p(0, 0, 24), p(1, 0, 24), p(1, 1, 24), p(0, 1, 24)], mix(C.hedge, 0xffffff, 0.12))
  })

  bakeProp(scene, 'tw-planter', 48, 48, 0.8, (g) => {
    contact(g, 24, 40, 14)
    g.fillStyle(C.planter, 1)
    g.fillRoundedRect(11, 24, 26, 16, 3)
    g.fillStyle(mix(C.planter, C.shadow, 0.3), 1)
    g.fillRect(26, 24, 11, 16)
    g.fillStyle(C.hedge, 1)
    g.fillCircle(17, 21, 7)
    g.fillCircle(29, 23, 7)
    g.fillCircle(23, 16, 7)
    g.fillStyle(C.brass, 0.95)
    g.fillCircle(19, 17, 2.6)
    g.fillCircle(27, 20, 2.6)
  })

  bakeProp(scene, 'tw-lamp', 26, 92, 0.96, (g) => {
    contact(g, 13, 88, 8)
    stroke(g, [{ x: 13, y: 88 }, { x: 13, y: 18 }], C.steel, 3)
    g.fillStyle(C.lampGlass, 1)
    g.fillCircle(13, 13, 5.5)
    g.lineStyle(2, C.steel, 1)
    g.strokeCircle(13, 13, 6.5)
  })

  bakeProp(scene, 'tw-bench', 44, 32, 0.85, (g) => {
    contact(g, 22, 26, 12)
    g.fillStyle(C.trunk, 1)
    g.fillRect(9, 17, 26, 4)
    g.fillRect(9, 9, 26, 3)
    g.fillStyle(C.shadow, 0.5)
    g.fillRect(11, 21, 3, 6)
    g.fillRect(30, 21, 3, 6)
  })

  bakeProp(scene, 'tw-tower', 118, 208, 0.96, (g) => {
    const cx = 59
    contact(g, cx, 202, 34)
    const legs = [
      [cx - 36, 204, cx - 15, 104],
      [cx + 36, 204, cx + 15, 104],
      [cx - 19, 196, cx - 8, 104],
      [cx + 19, 196, cx + 8, 104],
    ] as const
    for (const [x0, y0, x1, y1] of legs) stroke(g, [{ x: x0, y: y0 }, { x: x1, y: y1 }], C.steel, 3.5)
    stroke(g, [{ x: cx - 32, y: 162 }, { x: cx + 32, y: 162 }], C.steel, 2)
    stroke(g, [{ x: cx - 25, y: 130 }, { x: cx + 25, y: 130 }], C.steel, 2)
    stroke(g, [{ x: cx - 36, y: 204 }, { x: cx + 15, y: 104 }], C.steel, 1.5, 0.55)
    stroke(g, [{ x: cx + 36, y: 204 }, { x: cx - 15, y: 104 }], C.steel, 1.5, 0.55)
    g.fillStyle(C.cream, 1)
    g.fillRect(cx - 28, 56, 56, 48)
    g.fillStyle(C.creamShade, 1)
    g.fillRect(cx + 8, 56, 20, 48)
    g.fillStyle(C.brass, 0.85)
    g.fillRect(cx - 28, 74, 56, 4)
    poly(g, [{ x: cx - 28, y: 56 }, { x: cx + 28, y: 56 }, { x: cx, y: 24 }], C.terracotta)
    stroke(g, [{ x: cx, y: 24 }, { x: cx, y: 11 }], C.steel, 2)
    g.fillStyle(C.awning, 1)
    g.fillCircle(cx, 10, 3.2)
  })

  bakeProp(scene, 'tw-booth', 78, 88, 0.9, (g) => {
    contact(g, 34, 78, 20)
    const p = (gx: number, gy: number, z: number): Pt => ({ x: (gx - gy) * hw * 0.5 + 30, y: (gx + gy) * hh * 0.5 - z + 60 })
    const H = 44
    poly(g, [p(0, 1, 0), p(1, 1, 0), p(1, 1, H), p(0, 1, H)], C.cream)
    poly(g, [p(1, 0, 0), p(1, 1, 0), p(1, 1, H), p(1, 0, H)], C.creamShade)
    poly(g, [p(0.1, 1, H * 0.52), p(0.9, 1, H * 0.52), p(0.9, 1, H * 0.86), p(0.1, 1, H * 0.86)], C.glass, 0.92)
    poly(g, [p(0, 0, H), p(1, 0, H), p(1, 1, H), p(0, 1, H)], C.terracottaDark)
    poly(g, [p(0, 0, H), p(1, 0, H), p(0.5, 0.5, H + 16)], C.terracotta)
    poly(g, [p(1, 0, H), p(1, 1, H), p(0.5, 0.5, H + 16)], C.terracottaDark)
  })

  // gate barrier — a systems object: the studio controls who enters
  bakeProp(scene, 'tw-barrier', 92, 46, 0.9, (g) => {
    contact(g, 20, 40, 10)
    g.fillStyle(C.steel, 1)
    g.fillRect(15, 20, 7, 18)
    g.fillStyle(C.marquee, 1)
    g.fillRect(20, 14, 66, 6)
    g.fillStyle(C.awning, 1)
    for (let i = 0; i < 4; i++) g.fillRect(24 + i * 16, 14, 8, 6)
    g.fillStyle(C.steel, 1)
    g.fillCircle(19, 18, 4)
  })

  bakeProp(scene, 'tw-flag', 34, 92, 0.97, (g) => {
    stroke(g, [{ x: 9, y: 90 }, { x: 9, y: 7 }], C.steel, 2.5)
    g.fillStyle(C.brass, 1)
    g.fillCircle(9, 6, 2.6)
    poly(g, [{ x: 9, y: 10 }, { x: 30, y: 15 }, { x: 9, y: 25 }], C.awning)
  })

  bakeProp(scene, 'tw-sign', 46, 52, 0.95, (g) => {
    contact(g, 23, 46, 9)
    stroke(g, [{ x: 23, y: 46 }, { x: 23, y: 22 }], C.trunk, 3.5)
    g.fillStyle(C.signPanel, 1)
    g.fillRoundedRect(5, 10, 36, 14, 2)
    g.lineStyle(1.5, C.brass, 0.9)
    g.strokeRoundedRect(5, 10, 36, 14, 2)
    g.fillStyle(C.brass, 0.9)
    g.fillRect(9, 16, 20, 2)
  })

  bakeProp(scene, 'tw-bannerpole', 38, 104, 0.97, (g) => {
    stroke(g, [{ x: 7, y: 102 }, { x: 7, y: 7 }], C.steel, 3)
    g.fillStyle(C.awning, 1)
    g.fillRect(7, 14, 24, 58)
    g.fillStyle(C.brass, 1)
    g.fillRect(7, 14, 24, 5)
    g.fillRect(7, 67, 24, 5)
    g.fillCircle(19, 42, 5.5)
    g.fillStyle(C.awning, 1)
    g.fillCircle(19, 42, 2.8)
  })

  bakeProp(scene, 'tw-umbrella', 48, 58, 0.9, (g) => {
    contact(g, 24, 52, 11)
    stroke(g, [{ x: 24, y: 52 }, { x: 24, y: 22 }], C.steel, 2)
    g.fillStyle(C.marquee, 1)
    g.fillEllipse(24, 46, 22, 8)
    poly(g, [{ x: 24, y: 5 }, { x: 45, y: 21 }, { x: 3, y: 21 }], C.awning)
    g.fillStyle(C.brass, 1)
    for (let i = 0; i < 3; i++) poly(g, [{ x: 8 + i * 12, y: 21 }, { x: 14 + i * 12, y: 21 }, { x: 11 + i * 12, y: 26 }], C.brass)
  })

  // ── scenery yard dressing: crates, stacked flats, a rack, a service truck ──
  bakeProp(scene, 'tw-crate', 44, 40, 0.86, (g) => {
    contact(g, 22, 34, 13)
    const p = (gx: number, gy: number, z: number): Pt => ({ x: (gx - gy) * 12 + 22, y: (gx + gy) * 6 - z + 26 })
    const H = 17
    poly(g, [p(0, 1, 0), p(1, 1, 0), p(1, 1, H), p(0, 1, H)], C.crate)
    poly(g, [p(1, 0, 0), p(1, 1, 0), p(1, 1, H), p(1, 0, H)], C.crateDark)
    poly(g, [p(0, 0, H), p(1, 0, H), p(1, 1, H), p(0, 1, H)], mix(C.crate, 0xffffff, 0.16))
    stroke(g, [p(0, 1, H * 0.5), p(1, 1, H * 0.5)], C.timberDark, 1.5, 0.8)
  })

  bakeProp(scene, 'tw-flats', 74, 66, 0.9, (g) => {
    contact(g, 37, 58, 22)
    // leaning painted flats — scenery waiting for a load-in
    for (let i = 0; i < 3; i++) {
      const x = 10 + i * 9
      poly(
        g,
        [{ x, y: 56 }, { x: x + 26, y: 56 }, { x: x + 32, y: 12 + i * 2 }, { x: x + 6, y: 12 + i * 2 }],
        i % 2 ? C.timber : C.timberDark,
      )
      stroke(
        g,
        [{ x, y: 56 }, { x: x + 6, y: 12 + i * 2 }],
        C.shadow,
        1.5,
        0.4,
      )
    }
  })

  bakeProp(scene, 'tw-rack', 92, 74, 0.92, (g) => {
    contact(g, 46, 66, 26)
    g.fillStyle(C.steel, 1)
    g.fillRect(8, 20, 4, 46)
    g.fillRect(78, 20, 4, 46)
    for (const y of [24, 42]) {
      g.fillStyle(C.steel, 1)
      g.fillRect(8, y, 74, 4)
      g.fillStyle(C.timber, 1)
      g.fillRect(14, y - 12, 26, 12)
      g.fillStyle(C.canvasTarp, 1)
      g.fillRect(44, y - 10, 30, 10)
    }
  })

  bakeProp(scene, 'tw-truck', 106, 60, 0.82, (g) => {
    contact(g, 53, 52, 30)
    g.fillStyle(C.truckBody, 1)
    g.fillRoundedRect(8, 18, 62, 22, 3)
    g.fillStyle(mix(C.truckBody, C.shadow, 0.28), 1)
    g.fillRect(44, 18, 26, 22)
    g.fillStyle(C.truckBody, 1)
    g.fillRoundedRect(66, 12, 30, 26, 4)
    g.fillStyle(C.glass, 0.9)
    g.fillRect(78, 16, 14, 10)
    g.fillStyle(C.truckTrim, 0.9)
    g.fillRect(12, 26, 30, 3)
    g.fillStyle(C.timber, 1)
    g.fillRect(14, 10, 44, 8) // a load of flats on the bed
    g.fillStyle(C.tyre, 1)
    g.fillCircle(24, 42, 8)
    g.fillCircle(80, 42, 8)
    g.fillStyle(C.steel, 1)
    g.fillCircle(24, 42, 3)
    g.fillCircle(80, 42, 3)
  })

  bakeProp(scene, 'tw-cart', 48, 42, 0.85, (g) => {
    contact(g, 24, 36, 14)
    g.fillStyle(C.steel, 1)
    g.fillRect(7, 24, 32, 4)
    g.fillStyle(C.crate, 1)
    g.fillRect(10, 10, 13, 14)
    g.fillStyle(C.canvasTarp, 1)
    g.fillRect(25, 13, 12, 11)
    g.fillStyle(C.tyre, 1)
    g.fillCircle(13, 31, 4)
    g.fillCircle(33, 31, 4)
  })

  bakeProp(scene, 'tw-car', 104, 54, 0.82, (g) => {
    contact(g, 52, 46, 32)
    g.fillStyle(C.carBody, 1)
    g.fillRoundedRect(4, 18, 96, 22, 10)
    g.fillStyle(mix(C.carBody, 0xffffff, 0.14), 1)
    g.fillRoundedRect(24, 6, 54, 24, 9)
    g.fillStyle(C.glass, 0.7)
    poly(g, [{ x: 31, y: 10 }, { x: 48, y: 10 }, { x: 48, y: 23 }, { x: 31, y: 23 }], C.glass, 0.7)
    poly(g, [{ x: 53, y: 10 }, { x: 71, y: 13 }, { x: 71, y: 23 }, { x: 53, y: 23 }], C.glass, 0.7)
    g.fillStyle(C.tyre, 1)
    g.fillCircle(25, 40, 10)
    g.fillCircle(78, 40, 10)
    g.fillStyle(C.carTrim, 1)
    g.fillCircle(6, 28, 3)
    g.fillCircle(98, 28, 3)
  })

  // survey stake for the vacant expansion parcel
  bakeProp(scene, 'tw-stake', 16, 40, 0.95, (g) => {
    stroke(g, [{ x: 8, y: 38 }, { x: 8, y: 8 }], C.timberDark, 2.5)
    g.fillStyle(C.awning, 1)
    g.fillRect(8, 6, 7, 5)
  })
}

// ── ground tiles ──────────────────────────────────────────────────────────────

function bakeTiles(scene: Phaser.Scene): void {
  const diamond: Pt[] = [
    { x: hw, y: 0 },
    { x: TILE_W, y: hh },
    { x: hw, y: TILE_H },
    { x: 0, y: hh },
  ]
  const mk = (
    key: string,
    fill: number,
    edge: number,
    extra?: (g: Phaser.GameObjects.Graphics) => void,
  ): void => {
    const g = scene.make.graphics({ x: 0, y: 0 })
    poly(g, diamond, fill)
    stroke(g, diamond, edge, 1, 0.3, true)
    if (extra) extra(g)
    g.generateTexture(key, TILE_W, TILE_H)
    g.destroy()
  }
  mk('tw-t-lawn', C.lawn, C.lawnEdge, (g) => {
    g.fillStyle(C.lawnAlt, 0.45)
    g.fillEllipse(hw, hh, 34, 16)
  })
  mk('tw-t-lawn2', C.lawnAlt, C.lawnEdge)
  mk('tw-t-path', C.path, C.pathEdge)
  mk('tw-t-road', C.road, C.roadEdge, (g) => {
    // kerb highlight on the up-sun edges keeps roads from reading as holes
    stroke(g, [{ x: 0, y: hh }, { x: hw, y: 0 }], C.roadLine, 1.5, 0.16)
  })
  mk('tw-t-road-line', C.road, C.roadEdge, (g) => {
    g.fillStyle(C.roadLine, 0.72)
    g.fillRect(hw - 13, hh - 2, 26, 4)
    stroke(g, [{ x: 0, y: hh }, { x: hw, y: 0 }], C.roadLine, 1.5, 0.16)
  })
  mk('tw-t-plaza', C.plaza, C.plazaEdge, (g) => {
    g.lineStyle(1, C.plazaSeam, 0.55)
    g.beginPath()
    g.moveTo(hw, 6)
    g.lineTo(hw, TILE_H - 6)
    g.moveTo(10, hh)
    g.lineTo(TILE_W - 10, hh)
    g.strokePath()
  })
  mk('tw-t-dirt', C.dirt, C.dirtEdge)
  mk('tw-t-gravel', C.gravel, C.gravelEdge, (g) => {
    g.fillStyle(C.gravelEdge, 0.35)
    g.fillEllipse(hw - 16, hh + 6, 12, 6)
    g.fillEllipse(hw + 18, hh - 5, 10, 5)
  })
  mk('tw-t-apron', C.apron, C.apronEdge, (g) => {
    g.lineStyle(1, C.apronLine, 0.28)
    g.beginPath()
    g.moveTo(10, hh)
    g.lineTo(TILE_W - 10, hh)
    g.strokePath()
  })
}

// ── people fallback ───────────────────────────────────────────────────────────
// The role atlas (`/lot/hollywood/role-atlas-v1.png`) is the shipped people art and is
// what the world uses. These flat silhouettes exist only so a failed atlas fetch still
// leaves a populated, clickable studio rather than an empty one.

const FALLBACK_ROLES: readonly (readonly [string, number, string])[] = [
  ['director', 0x4d3527, 'fedora'],
  ['talent', 0x2a6a5c, 'wave'],
  ['grip', 0x4a5140, 'cap'],
  ['stagehand', 0x6d4c2e, 'cap'],
  ['electrician', 0x3a4f5a, 'tool'],
  ['camera', 0x35322e, 'camera'],
  ['security', 0x24405c, 'cap'],
  ['publicity', 0x74495f, 'flash'],
  ['extra', 0x715f4a, 'hat'],
]

/** Decoded RGBA cost of the fallback people set, for honest texture accounting. */
export const FALLBACK_PEOPLE_BYTES = FALLBACK_ROLES.length * 54 * 74 * 4

export function bakePeopleFallback(scene: Phaser.Scene): void {
  for (const [role, suit, prop] of FALLBACK_ROLES) {
    const key = `tw-person-${role}`
    if (scene.textures.exists(key)) continue
    const g = scene.make.graphics({ x: 0, y: 0 })
    g.fillStyle(C.shadow, 0.24)
    g.fillEllipse(26, 68, 34, 9)
    g.fillStyle(0x241f19, 1).fillRoundedRect(16, 49, 8, 18, 3).fillRoundedRect(27, 49, 8, 18, 3)
    g.fillStyle(suit, 1).fillRoundedRect(12, 23, 28, 32, 6)
    g.fillStyle(C.cream, 1).fillTriangle(21, 23, 30, 23, 25, 37)
    g.fillStyle(suit, 1).fillRoundedRect(6, 28, 9, 27, 4).fillRoundedRect(37, 28, 9, 27, 4)
    g.fillStyle(0xd7a678, 1).fillCircle(25, 15, 9)
    g.fillStyle(0x33241a, 1).fillEllipse(25, 10, 18, 8)
    if (prop === 'fedora' || prop === 'hat') {
      g.fillStyle(0x33261e, 1).fillRoundedRect(14, 3, 22, 8, 3).fillRect(8, 9, 34, 4)
    } else if (prop === 'cap') {
      g.fillStyle(0x2c3a42, 1).fillEllipse(24, 8, 21, 10).fillRect(25, 9, 17, 3)
    }
    if (prop === 'camera') {
      g.fillStyle(0x1a1e1f, 1).fillRect(38, 29, 12, 10).fillCircle(50, 34, 5)
    } else if (prop === 'tool') {
      g.lineStyle(3, C.brass, 1).lineBetween(42, 36, 49, 53)
    } else if (prop === 'flash') {
      g.fillStyle(0x1f2221, 1).fillRect(40, 31, 10, 8)
      g.fillStyle(C.lampGlass, 1).fillCircle(45, 27, 4)
    } else if (prop === 'wave') {
      g.fillStyle(0xd7a678, 1).fillCircle(45, 25, 5)
    }
    g.lineStyle(2, C.cream, 0.42).strokeRoundedRect(12, 23, 28, 32, 6)
    g.generateTexture(key, 54, 74)
    g.destroy()
  }
}

/** Generate every tycoon texture once. Call from Scene.create before building. */
export function bakeTycoonTextures(scene: Phaser.Scene): void {
  bakeTiles(scene)
  bakeAdmin(scene)
  bakeOffice(scene, 'tw-writers', 3, 2, 66, 32)
  bakeOffice(scene, 'tw-casting', 3, 2, 58, 28)
  bakePost(scene)
  bakeTheater(scene)
  bakeStage(scene, 'tw-stage-a')
  bakeStage(scene, 'tw-stage-b')
  bakeGate(scene)
  bakeProps(scene)
  bakePeopleFallback(scene)
}

/**
 * The ground anchor of an isometric building texture, from its baked height alone.
 *
 * Every texture in this framework is laid out as `texH = (fw+fd)*hh + H + topExtra`
 * with the footprint centre sitting `((fw+fd)/2)*hh` above the bottom edge, so the
 * anchor is recoverable from height without knowing the wall/roof split. That is what
 * lets an authored PNG of a DIFFERENT height drop into the same placement — which the
 * two shipped stage images are (368px and 374px against a 380px procedural bake).
 */
export function isoOriginY(texH: number, fw: number, fd: number): number {
  return (texH - ((fw + fd) / 2) * hh) / texH
}

/**
 * Re-point a stage registry entry at an already-loaded authored texture. Footprint
 * carries over from the procedural bake so placement, depth and every overlay position
 * are unchanged by the swap; the anchor is recomputed from the authored image height.
 * The caller owns the `textures.exists()` check.
 */
export function pointStageAtAuthored(stageKey: string, authoredKey: string, texH: number): void {
  const procedural = TYCOON_BUILDING_TEX[stageKey]
  if (!procedural) return
  TYCOON_BUILDING_TEX[stageKey] = {
    ...procedural,
    key: authoredKey,
    originY: isoOriginY(texH, procedural.fw, procedural.fd),
  }
}
