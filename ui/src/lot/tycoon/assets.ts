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
// The one name for the stage-CLASS body, so the bake and the presentation that asks
// for it can never drift apart (C2a-M2 §3.1). `world.ts` imports only a snapshot type.
import {
  PLACED_DEVELOPMENT_CASTING_TEX_KEY,
  PLACED_POST_TEX_KEY,
  PLACED_SCENERY_TEX_KEY,
  PLACED_SOUNDSTAGE_TEX_KEY,
} from './world'

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

function gableRoof(
  b: Builder,
  fw: number,
  fd: number,
  H: number,
  peak: number,
  lit = C.terracotta,
  shade = C.terracottaDark,
): void {
  const { g, p } = b
  const cy = fd / 2
  const R0 = p(0, cy, H + peak)
  const R1 = p(fw, cy, H + peak)
  // back slope (gy = 0 side) — away from the sun
  poly(g, [p(0, 0, H), p(fw, 0, H), R1, R0], shade)
  // near slope (gy = fd side) — lit
  poly(g, [p(0, fd, H), p(fw, fd, H), R1, R0], lit)
  // gable ends
  poly(g, [p(0, 0, H), p(0, fd, H), R0], C.cream)
  poly(g, [p(fw, 0, H), p(fw, fd, H), R1], C.creamShade)
  // eave overhang shadow on the lit wall
  poly(g, [p(0, fd, H - 5), p(fw, fd, H - 5), p(fw, fd, H), p(0, fd, H)], C.shadow, 0.22)
  stroke(g, [R0, R1], C.shadow, 1.5, 0.22)
}

/**
 * A HIPPED roof — four slopes to a short ridge, no gable ends (C1-M6b).
 *
 * The whole point is that it is not a gable: Casting and Development were the same 3 × 2
 * cream box under the same terracotta gable, differing only by 8px of wall height, and at
 * management zoom that is not a difference at all. A hip in a different colour is a
 * silhouette AND a colour a player can tell apart across the property.
 */
function hipRoof(
  b: Builder,
  fw: number,
  fd: number,
  H: number,
  peak: number,
  lit: number,
  shade: number,
): void {
  const { g, p } = b
  const cy = fd / 2
  const inset = Math.min(0.8, fw * 0.28)
  const R0 = p(inset, cy, H + peak)
  const R1 = p(fw - inset, cy, H + peak)
  // eaves overhang the walls a little, which is what reads as a roof rather than a lid
  const e = 0.14
  poly(g, [p(-e, -e, H), p(fw + e, -e, H), R1, R0], shade)
  poly(g, [p(-e, fd + e, H), p(fw + e, fd + e, H), R1, R0], lit)
  poly(g, [p(-e, -e, H), p(-e, fd + e, H), R0], mix(lit, shade, 0.5))
  poly(g, [p(fw + e, -e, H), p(fw + e, fd + e, H), R1], shade)
  poly(g, [p(0, fd, H - 5), p(fw, fd, H - 5), p(fw, fd, H), p(0, fd, H)], C.shadow, 0.24)
  stroke(g, [R0, R1], C.shadow, 1.5, 0.3)
}

/**
 * A SAW-TOOTH north-light roof: the universal signature of a workshop.
 *
 * Scenery & Post is where things are BUILT, and nothing else on the property is. Giving
 * it the one roof form that means "this is a shop floor" is worth more than any label.
 */
function sawtoothRoof(b: Builder, fw: number, fd: number, H: number, teeth: number): void {
  const { g, p } = b
  const rise = 16
  for (let i = 0; i < teeth; i++) {
    const y0 = (i / teeth) * fd
    const y1 = ((i + 1) / teeth) * fd
    // the sloping deck, falling away from the glazed face
    poly(g, [p(0, y0, H + rise), p(fw, y0, H + rise), p(fw, y1, H), p(0, y1, H)], C.corrugate)
    // the vertical glazed face looking away from the sun
    poly(g, [p(0, y0, H), p(fw, y0, H), p(fw, y0, H + rise), p(0, y0, H + rise)], C.glassDeep, 0.95)
    stroke(g, [p(0, y0, H + rise), p(fw, y0, H + rise)], C.corrugateDark, 1.5, 0.85)
  }
  // the near eave, thick enough to read as a fascia
  poly(g, [p(0, fd, H - 4), p(fw, fd, H - 4), p(fw, fd, H), p(0, fd, H)], C.corrugateDark)
}

/** A MONO-PITCH corrugated roof: one plane, falling to the service side. */
function monoPitchRoof(b: Builder, fw: number, fd: number, H: number, rise: number): void {
  const { g, p } = b
  poly(g, [p(-0.1, -0.1, H + rise), p(fw + 0.1, -0.1, H + rise), p(fw + 0.1, fd + 0.1, H), p(-0.1, fd + 0.1, H)], C.corrugate)
  g.lineStyle(1, C.corrugateDark, 0.7)
  for (let t = 0.08; t < fw; t += 0.34) {
    const a = p(t, -0.1, H + rise)
    const c = p(t, fd + 0.1, H)
    g.lineBetween(a.x, a.y, c.x, c.y)
  }
  poly(g, [p(-0.1, -0.1, H + rise), p(fw + 0.1, -0.1, H + rise), p(fw + 0.1, -0.1, H + rise - 4), p(-0.1, -0.1, H + rise - 4)], C.corrugateDark)
  poly(g, [p(0, fd, H - 4), p(fw, fd, H - 4), p(fw, fd, H), p(0, fd, H)], C.corrugateDark)
}

/** A masonry chimney on the shaded slope — Development's one masonry note. */
function chimney(b: Builder, fw: number, H: number, peak: number): void {
  const { g, p } = b
  const gx0 = fw * 0.66
  const gx1 = gx0 + 0.36
  const top = H + peak + 16
  poly(g, [p(gx0, 0.32, H + 6), p(gx1, 0.32, H + 6), p(gx1, 0.32, top), p(gx0, 0.32, top)], C.brick)
  poly(g, [p(gx1, 0.02, H + 6), p(gx1, 0.32, H + 6), p(gx1, 0.32, top), p(gx1, 0.02, top)], C.brickDark)
  poly(g, [p(gx0 - 0.06, 0.0, top), p(gx1 + 0.06, 0.0, top), p(gx1 + 0.06, 0.36, top), p(gx0 - 0.06, 0.36, top)], C.creamShade)
}

/** A projecting entry portico with two columns — Casting's public face. */
function portico(b: Builder, fw: number, fd: number, roofColour: number): void {
  const { g, p } = b
  const cx = fw / 2
  const out = 0.5
  const HP = 30
  for (const x of [cx - 0.62, cx + 0.62]) {
    poly(g, [p(x - 0.09, fd + out, 0), p(x + 0.09, fd + out, 0), p(x + 0.09, fd + out, HP), p(x - 0.09, fd + out, HP)], C.cream)
    poly(g, [p(x + 0.09, fd, 0), p(x + 0.09, fd + out, 0), p(x + 0.09, fd + out, HP), p(x + 0.09, fd, HP)], C.creamShade)
  }
  // the canopy slab, and its shadow thrown back onto the wall
  poly(g, [p(cx - 0.86, fd, HP + 8), p(cx + 0.86, fd, HP + 8), p(cx + 0.86, fd + out, HP + 8), p(cx - 0.86, fd + out, HP + 8)], roofColour)
  poly(g, [p(cx - 0.86, fd + out, HP), p(cx + 0.86, fd + out, HP), p(cx + 0.86, fd + out, HP + 8), p(cx - 0.86, fd + out, HP + 8)], mix(roofColour, C.shadow, 0.35))
  poly(g, [p(cx - 0.86, fd, HP - 8), p(cx + 0.86, fd, HP - 8), p(cx + 0.86, fd, HP + 8), p(cx - 0.86, fd, HP + 8)], C.shadow, 0.2)
}

/** A glazed roof MONITOR: the Hall's badge, and a big building's daylight. */
function roofMonitor(b: Builder, fw: number, fd: number, H: number): void {
  const { g, p } = b
  const y0 = fd * 0.34
  const y1 = fd * 0.66
  const z0 = H + 5
  const z1 = z0 + 18
  poly(g, [p(0.4, y1, z0), p(fw - 0.4, y1, z0), p(fw - 0.4, y1, z1), p(0.4, y1, z1)], C.glassDeep, 0.95)
  poly(g, [p(fw - 0.4, y0, z0), p(fw - 0.4, y1, z0), p(fw - 0.4, y1, z1), p(fw - 0.4, y0, z1)], C.slateShade)
  poly(g, [p(0.4, y0, z1), p(fw - 0.4, y0, z1), p(fw - 0.4, y1, z1), p(0.4, y1, z1)], C.brass, 0.9)
  g.lineStyle(1.2, C.brassDark, 0.8)
  for (let t = 0.8; t < fw - 0.4; t += 0.5) {
    const a = p(t, y1, z0)
    const c = p(t, y1, z1)
    g.lineBetween(a.x, a.y, c.x, c.y)
  }
}

/** A lantern cupola on the ridge — Office III's rank, readable as a SHAPE. */
function cupola(b: Builder, fw: number, fd: number, H: number, peak: number): void {
  const { g, p } = b
  const cx = fw / 2
  const cy = fd / 2
  const z = H + peak - 4
  const r = 0.3
  poly(g, [p(cx - r, cy + r, z), p(cx + r, cy + r, z), p(cx + r, cy + r, z + 20), p(cx - r, cy + r, z + 20)], C.windowLit, 0.95)
  poly(g, [p(cx + r, cy - r, z), p(cx + r, cy + r, z), p(cx + r, cy + r, z + 20), p(cx + r, cy - r, z + 20)], C.creamShade)
  poly(g, [p(cx - r - 0.1, cy - r - 0.1, z + 20), p(cx + r + 0.1, cy - r - 0.1, z + 20), p(cx + r + 0.1, cy + r + 0.1, z + 20), p(cx - r - 0.1, cy + r + 0.1, z + 20)], C.terracotta)
  poly(g, [p(cx - r, cy + r, z + 20), p(cx + r, cy + r, z + 20), p(cx, cy, z + 32)], C.terracotta)
  poly(g, [p(cx + r, cy - r, z + 20), p(cx + r, cy + r, z + 20), p(cx, cy, z + 32)], C.terracottaDark)
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

/**
 * The two founding office bodies — and, at C1-M6b, no longer the same building twice.
 *
 * Before this pass `tw-writers` and `tw-casting` were one bake called with two wall
 * heights: identical cream box, identical terracotta gable, identical door, 8px apart.
 * Two of the five founding bodies were therefore untellable at a glance, which is the
 * cold-lot problem in its purest form. Each now carries its own architecture:
 *
 *   development — terracotta GABLE, a brick chimney breaking the ridge, and a projecting
 *                 bay window under the sign: a writers' building with a fireplace in it;
 *   casting     — a green-slate HIP (the one cool roof on the property), a two-column
 *                 entry PORTICO, and a rail along the frontage where the queue forms.
 *
 * Silhouette, roof colour and frontage all differ, so the difference survives institution
 * zoom where the sign has already disappeared.
 */
function bakeOffice(
  scene: Phaser.Scene,
  key: string,
  fw: number,
  fd: number,
  H: number,
  peak: number,
  dress: 'development' | 'casting',
): void {
  const b = beginBuilding(scene, fw, fd, H, peak + (dress === 'development' ? 20 : 12))
  const { g, p } = b
  drawWalls(b, fw, fd, H, C.cream, C.creamShade)
  windowsLit(b, fw, fd, H, fw + 1, 2, C.glass, C.windowLit)
  windowsShade(b, fw, fd, H, fd + 1, 0.35, 0.62)
  // door + awning
  poly(g, [p(fw / 2 - 0.28, fd, 0), p(fw / 2 + 0.28, fd, 0), p(fw / 2 + 0.28, fd, 30), p(fw / 2 - 0.28, fd, 30)], C.signPanel, 0.9)
  poly(g, [p(fw / 2 - 0.5, fd, 32), p(fw / 2 + 0.5, fd, 32), p(fw / 2 + 0.5, fd, 38), p(fw / 2 - 0.5, fd, 38)], C.awning)
  signField(b, fw, fd, H, 0.7, 0.86, 0.3)

  if (dress === 'development') {
    // a projecting bay window on the lit face, and its own little lead roof
    const bx = fw * 0.24
    poly(g, [p(bx - 0.3, fd + 0.3, 6), p(bx + 0.3, fd + 0.3, 6), p(bx + 0.3, fd + 0.3, 34), p(bx - 0.3, fd + 0.3, 34)], C.glass, 0.95)
    poly(g, [p(bx + 0.3, fd, 6), p(bx + 0.3, fd + 0.3, 6), p(bx + 0.3, fd + 0.3, 34), p(bx + 0.3, fd, 34)], C.creamShade)
    poly(g, [p(bx - 0.38, fd, 34), p(bx + 0.38, fd, 34), p(bx + 0.38, fd + 0.38, 38), p(bx - 0.38, fd + 0.38, 38)], C.roofMetal)
    gableRoof(b, fw, fd, H, peak)
    chimney(b, fw, H, peak)
  } else {
    portico(b, fw, fd, C.roofSlateGreen)
    hipRoof(b, fw, fd, H, peak, C.roofSlateGreen, C.roofSlateGreenDark)
    // the queue rail: this is the one founding building people actually line up outside
    for (const x of [0.25, 0.75, 1.25]) {
      poly(g, [p(fw - x, fd + 0.62, 0), p(fw - x + 0.06, fd + 0.62, 0), p(fw - x + 0.06, fd + 0.62, 15), p(fw - x, fd + 0.62, 15)], C.steel)
    }
    stroke(g, [p(fw - 1.25, fd + 0.62, 15), p(fw - 0.25, fd + 0.62, 15)], C.steel, 2, 0.95)
  }
  TYCOON_BUILDING_TEX[key] = { key, originX: 0.5, originY: b.originY, fw, fd }
  finalize(b, key)
}

/**
 * The Development & Casting Annex — the first PLACED building on the property.
 *
 * Deliberately MODEST: a single-storey annex block, lower than Development (66px) and
 * Casting (58px), in the same stucco family so it reads as the studio's own extension
 * rather than a new institution. It carries the framework's flat roof + parapet, one
 * band of glazing on the lit face, a small entry canopy, and a painted sign field —
 * so the silhouette is distinguishable from the two gabled offices at institution zoom
 * while the palette and light direction are identical.
 *
 * Its footprint is the blueprint's own (3 × 2 cells), so the sprite lands exactly on
 * the cells the Engine says the placement occupies.
 */
function bakeAnnex(scene: Phaser.Scene): void {
  const fw = 3
  const fd = 2
  const H = 50
  const b = beginBuilding(scene, fw, fd, H, 14)
  const { g, p } = b
  drawWalls(b, fw, fd, H, C.taupe, C.taupeShade)
  windowsLit(b, fw, fd, H, 5, 1, C.glass, C.windowLit)
  windowsShade(b, fw, fd, H, fd + 1, 0.36, 0.66)
  // entry: a recessed door under a shallow canopy on the lit face
  poly(
    g,
    [p(fw / 2 - 0.24, fd, 0), p(fw / 2 + 0.24, fd, 0), p(fw / 2 + 0.24, fd, 26), p(fw / 2 - 0.24, fd, 26)],
    C.signPanel,
    0.88,
  )
  poly(
    g,
    [p(fw / 2 - 0.46, fd, 27), p(fw / 2 + 0.46, fd, 27), p(fw / 2 + 0.46, fd, 32), p(fw / 2 - 0.46, fd, 32)],
    C.awning,
  )
  signField(b, fw, fd, H, 0.72, 0.9, 0.3)
  flatRoof(b, fw, fd, H)
  // one rooftop vent stack, so the roof plane is not a bare rectangle at close zoom
  poly(g, [p(2.15, 0.5, H + 5), p(2.5, 0.5, H + 5), p(2.5, 0.9, H + 5), p(2.15, 0.9, H + 5)], C.slateLit)
  poly(g, [p(2.15, 0.9, H + 5), p(2.5, 0.9, H + 5), p(2.5, 0.9, H + 15), p(2.15, 0.9, H + 15)], C.slateShade)
  poly(g, [p(2.15, 0.5, H + 15), p(2.5, 0.5, H + 15), p(2.5, 0.9, H + 15), p(2.15, 0.9, H + 15)], C.slate)
  TYCOON_BUILDING_TEX['tw-annex'] = { key: 'tw-annex', originX: 0.5, originY: b.originY, fw, fd }
  finalize(b, 'tw-annex')
}

// ── C1-M5: the four blueprints a studio can add to its property ──────────────
//
// Every one of these is a building the player CHOSE from a catalog that told them what
// it does, so each has to be recognisable from its silhouette alone — at institution
// zoom, with no label. The families are deliberate:
//
//   • the two DEVELOPMENT OFFICE tiers share the gabled cream office family the studio
//     was founded with (`tw-writers`), and differ by TIER: II is taller with one dormer
//     and a brass string course; III is taller again, twin-dormered, with a full brass
//     cornice and a ridge finial. A player who owns II reads III as "the same thing,
//     more of it" — which is exactly what the effect is;
//   • the HALL is the Annex's own flat-roofed stucco language at twice the scale, with
//     the pilaster rhythm the soundstages use, so it reads as the biggest development
//     building on the lot rather than as a second annex;
//   • the CRAFT SERVICES ANNEX is SERVICE architecture: low, shallow-pitched, a roller
//     shutter, an awning over a counter, and an extract flue. It reads as back-of-house
//     at a glance, which is what stops it being mistaken for another office.
//
// These are baked ON DEMAND (see `bakeBlueprintTexture`), not with the founding set: a
// studio that has built none of them pays no texture memory for them at all.

/** One brass string course wrapped round the lit and shade faces at height `z`. */
function stringCourse(b: Builder, fw: number, fd: number, z: number, thickness = 3): void {
  const { g, p } = b
  poly(g, [p(0, fd, z - thickness), p(fw, fd, z - thickness), p(fw, fd, z + thickness), p(0, fd, z + thickness)], C.brass, 0.85)
  poly(g, [p(fw, 0, z - thickness), p(fw, fd, z - thickness), p(fw, fd, z + thickness), p(fw, 0, z + thickness)], C.brassDark, 0.8)
}

/** A roof dormer on the lit slope — the office tiers' rank insignia. */
function dormer(b: Builder, fd: number, H: number, cx: number, peak: number): void {
  const { g, p } = b
  const cy = fd / 2
  const z = H + peak * 0.34
  const halfW = 0.32
  // cheek walls and the little lit face, sitting on the near slope
  poly(g, [p(cx - halfW, cy + 0.34, z), p(cx + halfW, cy + 0.34, z), p(cx + halfW, cy + 0.34, z + 15), p(cx - halfW, cy + 0.34, z + 15)], C.cream)
  poly(g, [p(cx - halfW, cy + 0.34, z + 3), p(cx + halfW, cy + 0.34, z + 3), p(cx + halfW, cy + 0.34, z + 12), p(cx - halfW, cy + 0.34, z + 12)], C.windowLit, 0.92)
  // its own little terracotta cap
  poly(g, [p(cx - halfW - 0.06, cy + 0.34, z + 15), p(cx + halfW + 0.06, cy + 0.34, z + 15), p(cx + halfW + 0.06, cy, z + 20), p(cx - halfW - 0.06, cy, z + 20)], C.terracotta)
}

/**
 * The two Development Office tiers. `tier` is the rank the silhouette carries: one
 * dormer and a string course, or two dormers, a cornice, and a ridge finial.
 */
function bakeDevelopmentOffice(scene: Phaser.Scene, key: string, tier: 2 | 3): void {
  const fw = 3
  const fd = 2
  const H = tier === 3 ? 88 : 74
  const peak = tier === 3 ? 38 : 34
  const b = beginBuilding(scene, fw, fd, H, peak + 32)
  const { g, p } = b
  drawWalls(b, fw, fd, H, C.cream, C.creamShade)
  windowsLit(b, fw, fd, H, fw + 1, tier === 3 ? 3 : 2, C.glass, C.windowLit)
  windowsShade(b, fw, fd, H, fd + 1, 0.32, 0.6)
  // the office family's door and awning, unchanged from the founding offices
  poly(g, [p(fw / 2 - 0.28, fd, 0), p(fw / 2 + 0.28, fd, 0), p(fw / 2 + 0.28, fd, 30), p(fw / 2 - 0.28, fd, 30)], C.signPanel, 0.9)
  poly(g, [p(fw / 2 - 0.5, fd, 32), p(fw / 2 + 0.5, fd, 32), p(fw / 2 + 0.5, fd, 38), p(fw / 2 - 0.5, fd, 38)], C.awning)
  // TIER MARKING, on the walls: one course for II, a full cornice for III.
  stringCourse(b, fw, fd, H * 0.52)
  if (tier === 3) {
    stringCourse(b, fw, fd, H - 7, 4)
    // pilasters give the taller mass a vertical rhythm the shorter tier does not have
    pilasters(b, fw, fd, H, 2, 0.16)
  }
  signField(b, fw, fd, H, 0.68, 0.84, 0.3)
  gableRoof(b, fw, fd, H, peak)
  // …and on the roof: the rank a player reads at institution zoom.
  //
  // C1-M6b sharpens the tier gap. A finial is a few pixels of brass; at the whole-property
  // framing II and III still read as one building. III now carries a LIT LANTERN CUPOLA on
  // the ridge — a shape, not a detail — plus a chimney, so the taller tier is taller AND
  // busier in silhouette, which is what "the same thing, more of it" should look like.
  if (tier === 3) {
    dormer(b, fd, H, fw * 0.24, peak)
    dormer(b, fd, H, fw * 0.76, peak)
    cupola(b, fw, fd, H, peak)
    chimney(b, fw, H, peak)
  } else {
    dormer(b, fd, H, fw * 0.5, peak)
    stroke(g, [p(fw / 2, fd / 2, H + peak), p(fw / 2, fd / 2, H + peak + 18)], C.brassDark, 2.5)
    poly(g, [p(fw / 2 - 0.12, fd / 2 - 0.12, H + peak + 18), p(fw / 2 + 0.12, fd / 2 - 0.12, H + peak + 18), p(fw / 2 + 0.12, fd / 2 + 0.12, H + peak + 18), p(fw / 2 - 0.12, fd / 2 + 0.12, H + peak + 18)], C.brass)
  }
  TYCOON_BUILDING_TEX[key] = { key, originX: 0.5, originY: b.originY, fw, fd }
  finalize(b, key)
}

/**
 * The Development & Casting Hall — the Annex's language, twice the building.
 *
 * 4 × 3 cells and 82px tall against the Annex's 3 × 2 and 50px, with the soundstage
 * pilaster rhythm on its lit face and a full glazed band: it has to read as the biggest
 * thing the development side of the lot can build.
 */
function bakeHall(scene: Phaser.Scene): void {
  const fw = 4
  const fd = 3
  const H = 82
  const b = beginBuilding(scene, fw, fd, H, 30)
  const { g, p } = b
  drawWalls(b, fw, fd, H, C.taupe, C.taupeShade)
  pilasters(b, fw, fd, H, 3, 0.2)
  windowsLit(b, fw, fd, H, 7, 2, C.glass, C.windowLit)
  windowsShade(b, fw, fd, H, fd + 2, 0.34, 0.68)
  stringCourse(b, fw, fd, H * 0.58)
  // a wide, generous entrance: double doors under a deep canopy, centred
  poly(g, [p(fw / 2 - 0.42, fd, 0), p(fw / 2 + 0.42, fd, 0), p(fw / 2 + 0.42, fd, 32), p(fw / 2 - 0.42, fd, 32)], C.signPanel, 0.9)
  stroke(g, [p(fw / 2, fd, 0), p(fw / 2, fd, 32)], C.brassDark, 1.5, 0.8)
  poly(g, [p(fw / 2 - 0.78, fd, 34), p(fw / 2 + 0.78, fd, 34), p(fw / 2 + 0.78, fd, 41), p(fw / 2 - 0.78, fd, 41)], C.awning)
  // C1-M6b: an entry portico on the frontage. A 4 × 3 flat-roofed box and a 3 × 2 one are
  // the same building at institution zoom; a projecting porch under a brass-capped monitor
  // is not.
  portico(b, fw, fd, C.brass)
  signField(b, fw, fd, H, 0.74, 0.9, 0.34)
  flatRoof(b, fw, fd, H)
  // the badge: a full-length glazed roof monitor, brass-capped
  roofMonitor(b, fw, fd, H)
  // roof plant, pushed to the ends so the monitor owns the middle
  for (const [x0, x1] of [[0.35, 1.0], [3.0, 3.65]] as const) {
    poly(g, [p(x0, 0.2, H + 5), p(x1, 0.2, H + 5), p(x1, 0.75, H + 5), p(x0, 0.75, H + 5)], C.slateLit)
    poly(g, [p(x0, 0.75, H + 5), p(x1, 0.75, H + 5), p(x1, 0.75, H + 18), p(x0, 0.75, H + 18)], C.slateShade)
    poly(g, [p(x0, 0.2, H + 18), p(x1, 0.2, H + 18), p(x1, 0.75, H + 18), p(x0, 0.75, H + 18)], C.slate)
  }
  TYCOON_BUILDING_TEX['tw-hall'] = { key: 'tw-hall', originX: 0.5, originY: b.originY, fw, fd }
  finalize(b, 'tw-hall')
}

/**
 * The Craft Services Annex — back-of-house, and it looks it.
 *
 * Low (36px), shallow-pitched, gravel-and-timber rather than stucco-and-brass, with a
 * roller shutter, a serving counter under a striped awning, and an extract flue. Nothing
 * about it reads "office", which is the whole job: a player glancing at the lot should
 * never mistake where the crew eat for where the screenplays are written.
 */
function bakeCraftAnnex(scene: Phaser.Scene): void {
  const fw = 3
  const fd = 2
  const H = 36
  const b = beginBuilding(scene, fw, fd, H, 48)
  const { g, p } = b
  drawWalls(b, fw, fd, H, C.taupeLit, C.creamDeep)
  // service ROLLER SHUTTER on the shade face — deliveries come in the back
  poly(g, [p(fw, 0.45, 2), p(fw, 1.55, 2), p(fw, 1.55, 26), p(fw, 0.45, 26)], C.steel, 0.95)
  for (let z = 4; z < 26; z += 5) {
    stroke(g, [p(fw, 0.45, z), p(fw, 1.55, z)], C.shadow, 1, 0.35)
  }
  // the SERVING COUNTER on the lit face, under a striped awning
  poly(g, [p(0.5, fd, 12), p(fw - 0.5, fd, 12), p(fw - 0.5, fd, 25), p(0.5, fd, 25)], C.signPanel, 0.85)
  poly(g, [p(0.5, fd, 25), p(fw - 0.5, fd, 25), p(fw - 0.5, fd, 28), p(0.5, fd, 28)], C.timber)
  const stripes = 5
  for (let i = 0; i < stripes; i++) {
    const x0 = 0.36 + (i / stripes) * (fw - 0.72)
    const x1 = 0.36 + ((i + 0.5) / stripes) * (fw - 0.72)
    poly(g, [p(x0, fd, 29), p(x1, fd, 29), p(x1, fd, 36), p(x0, fd, 36)], i % 2 === 0 ? C.awning : C.cream)
  }
  poly(g, [p(0.36, fd, 29), p(fw - 0.36, fd, 29), p(fw - 0.36, fd, 30), p(0.36, fd, 30)], C.awningDark)
  windowsShade(b, fw, fd, H, 2, 0.55, 0.8)
  // C1-M6b: a MONO-PITCH corrugated roof, not a flat parapet. Every other small building
  // on this property has a flat or a gable; one plane falling to the service side reads as
  // a shed from any distance, which is exactly what the crew canteen should read as.
  const rise = 18
  monoPitchRoof(b, fw, fd, H, rise)
  poly(g, [p(0.55, 0.5, H + rise), p(0.95, 0.5, H + rise), p(0.95, 0.95, H + rise), p(0.55, 0.95, H + rise)], C.steel)
  poly(g, [p(0.55, 0.95, H + rise), p(0.95, 0.95, H + rise), p(0.95, 0.95, H + 26 + rise), p(0.55, 0.95, H + 26 + rise)], C.slateShade)
  poly(g, [p(0.5, 0.45, H + 26 + rise), p(1.0, 0.45, H + 26 + rise), p(1.0, 1.0, H + 26 + rise), p(0.5, 1.0, H + 26 + rise)], C.slateLit)
  // a low vent hood beside it, so the roof plane has a service silhouette
  poly(g, [p(1.9, 0.6, H + rise - 3), p(2.6, 0.6, H + rise - 3), p(2.6, 1.2, H + rise - 5), p(1.9, 1.2, H + rise - 5)], C.slate)
  poly(g, [p(1.9, 1.2, H + rise - 5), p(2.6, 1.2, H + rise - 5), p(2.6, 1.2, H + rise + 3), p(1.9, 1.2, H + rise + 3)], C.slateShade)
  // stacked crates against the shade wall: the yard's own vocabulary, borrowed
  poly(g, [p(fw - 0.05, 1.62, 0), p(fw - 0.05, 1.95, 0), p(fw - 0.05, 1.95, 13), p(fw - 0.05, 1.62, 13)], C.crate)
  poly(g, [p(fw - 0.05, 1.62, 13), p(fw - 0.05, 1.95, 13), p(fw - 0.05, 1.95, 24), p(fw - 0.05, 1.62, 24)], C.crateDark)
  TYCOON_BUILDING_TEX['tw-craft'] = { key: 'tw-craft', originX: 0.5, originY: b.originY, fw, fd }
  finalize(b, 'tw-craft')
}

/**
 * Bake ONE placed-blueprint texture, the first time the world actually needs it.
 *
 * Idempotent and deterministic. A studio that has built none of these pays nothing for
 * them: the founding bake is untouched, so the Week-0 texture figure is exactly what it
 * has always been (law 25 — a texture that MIGHT be needed later is not a reason to move
 * a decoded-bytes pin). Returns true when a new texture was actually baked, so the
 * caller can re-measure its own telemetry rather than report a stale total.
 */
export function bakeBlueprintTexture(scene: Phaser.Scene, texKey: string): boolean {
  if (texKey === '' || TYCOON_BUILDING_TEX[texKey] !== undefined) return false
  switch (texKey) {
    case 'tw-office-2':
      bakeDevelopmentOffice(scene, 'tw-office-2', 2)
      return true
    case 'tw-office-3':
      bakeDevelopmentOffice(scene, 'tw-office-3', 3)
      return true
    case 'tw-hall':
      bakeHall(scene)
      return true
    case 'tw-craft':
      bakeCraftAnnex(scene)
      return true
    case PLACED_SOUNDSTAGE_TEX_KEY:
      // C2a-M2 §3.1 — Soundstage (Standard). The SAME geometry the two founding stages
      // wear, keyed as a class rather than per stage: `bakeStage` was already
      // parameterised by texture key only, so a studio's third, fourth and fifth
      // soundstage all read as soundstages at every zoom band for one texture's bytes.
      // Grid world only. The plate origin never gets a placed body (law 27a).
      bakeStage(scene, PLACED_SOUNDSTAGE_TEX_KEY)
      return true
    case PLACED_SCENERY_TEX_KEY:
      // C2a-M2 §3.4 — Scenery Shop. The founding Scenery & Post block's own workshop
      // body: corrugated cladding, a shutter tall enough to take a flat through, and the
      // saw-tooth north light that is this property's one "things are physically BUILT
      // here" roof form. `bakePost` gained a key parameter for exactly this and the
      // founding bake still passes its own, so no existing texture moves.
      bakePost(scene, PLACED_SCENERY_TEX_KEY)
      return true
    case PLACED_POST_TEX_KEY:
      // C2a-M2 §3.4 — Post Building. The ONE support class with no body of its own to
      // inherit: the founding block houses the post building AND the scenery shop, so
      // dressing both classes in the saw-tooth would leave a studio's two support
      // buildings untellable at a glance. Cutting rooms are dark boxes; this is one.
      bakePostBuilding(scene, PLACED_POST_TEX_KEY)
      return true
    case PLACED_DEVELOPMENT_CASTING_TEX_KEY:
      // C2a-M2 §3.4 — Development & Casting Office. The founding Casting office's own
      // body, at its own wall height and peak: cream walls, the property's one cool
      // slate-green hip, a two-column portico, and the frontage rail people queue along.
      // The four C1 development blueprints have AUTHORED bodies and keep them; only the
      // baseline office, which has none, is dressed by its class.
      bakeOffice(scene, PLACED_DEVELOPMENT_CASTING_TEX_KEY, 3, 2, 58, 28, 'casting')
      return true
    default:
      // A blueprint whose art has not been authored gets the honest massing block the
      // placement layer already draws — never another building's body (shift law 12).
      return false
  }
}

/**
 * Scenery & Post — a WORKSHOP, and at C1-M6b it finally looks like one.
 *
 * It was a slate box with a flat roof and rooftop plant, which is what half the property
 * already looked like. The only building on the lot where things are physically BUILT now
 * carries the one roof form that means exactly that: a saw-tooth north light, over
 * corrugated cladding, with the roller shutter tall enough to take a flat through it.
 */
function bakePost(scene: Phaser.Scene, key: string): void {
  const fw = 3
  const fd = 2
  const H = 66
  const b = beginBuilding(scene, fw, fd, H, 30)
  const { g, p } = b
  drawWalls(b, fw, fd, H, C.slate, C.slateShade)
  // corrugated cladding on the lit face — vertical ribs, not a smooth stucco plane
  g.lineStyle(1, C.slateShade, 0.5)
  for (let t = 0.12; t < fw; t += 0.22) {
    const a = p(t, fd, 2)
    const c = p(t, fd, H - 2)
    g.lineBetween(a.x, a.y, c.x, c.y)
  }
  windowsLit(b, fw, fd, H, 4, 1, C.glass, C.glass)
  // roller shutter — this block also serves the scenery yard behind it
  poly(g, [p(1.5, fd, 0), p(2.75, fd, 0), p(2.75, fd, 50), p(1.5, fd, 50)], C.crateDark)
  for (let i = 1; i < 6; i++) {
    stroke(g, [p(1.5, fd, i * 9), p(2.75, fd, i * 9)], C.shadow, 1, 0.35)
  }
  poly(g, [p(1.42, fd, 50), p(2.83, fd, 50), p(2.83, fd, 55), p(1.42, fd, 55)], C.steel)
  signField(b, fw, fd, H, 0.74, 0.9, 0.25)
  sawtoothRoof(b, fw, fd, H, 3)
  // one extract stack, so the workshop reads as running machinery
  poly(g, [p(0.35, 0.2, H + 16), p(0.68, 0.2, H + 16), p(0.68, 0.55, H + 16), p(0.35, 0.55, H + 16)], C.steel)
  poly(g, [p(0.35, 0.55, H + 16), p(0.68, 0.55, H + 16), p(0.68, 0.55, H + 30), p(0.35, 0.55, H + 30)], C.slateShade)
  poly(g, [p(0.3, 0.15, H + 30), p(0.73, 0.15, H + 30), p(0.73, 0.6, H + 30), p(0.3, 0.6, H + 30)], C.slateLit)
  TYCOON_BUILDING_TEX[key] = { key, originX: 0.5, originY: b.originY, fw, fd }
  finalize(b, key)
}

/**
 * The POST BUILDING — cutting rooms, and the one §3.4 class with no body to inherit.
 *
 * The founding Scenery & Post block houses BOTH the post building and the scenery shop,
 * so it cannot serve as the class body for each of them: a studio that put up one of
 * each would have two identical saw-tooth sheds and no way to tell which was which at
 * management zoom. The scenery class keeps the workshop (that is what a scenery shop
 * IS); post gets its own body here.
 *
 * The architecture is what the building actually does. Cutting rooms and a projection
 * theatre are DARK ROOMS: a solid lower wall with no glazing at working height, one
 * high clerestory band where the corridor is, a single service door under a canopy, and
 * a flat roof carrying the plant that keeps a sealed building breathable. Flat + blank
 * against the workshop's saw-tooth + shutter reads as a different building from any
 * distance, which is the whole requirement (C1-M6b's silhouette law).
 */
function bakePostBuilding(scene: Phaser.Scene, key: string): void {
  const fw = 3
  const fd = 2
  const H = 62
  const b = beginBuilding(scene, fw, fd, H, 34)
  const { g, p } = b
  drawWalls(b, fw, fd, H, C.taupeLit, C.creamDeep)
  // The blank band: no windows at working height, because there is nothing to see out
  // of a cutting room. One shadow line where the render course would be.
  poly(g, [p(0, fd, H * 0.3), p(fw, fd, H * 0.3), p(fw, fd, H * 0.3 + 3), p(0, fd, H * 0.3 + 3)], C.shadow, 0.2)
  // the high clerestory band — the corridor behind the rooms, lit late
  for (let i = 0; i < 5; i++) {
    const x0 = 0.34 + (i / 5) * (fw - 0.68)
    const x1 = 0.34 + ((i + 0.62) / 5) * (fw - 0.68)
    poly(g, [p(x0, fd, H * 0.7), p(x1, fd, H * 0.7), p(x1, fd, H * 0.78), p(x0, fd, H * 0.78)], C.windowLit, 0.9)
  }
  windowsShade(b, fw, fd, H, 2, 0.66, 0.78)
  // one service door under a shallow canopy, on the lit face
  poly(g, [p(fw / 2 - 0.26, fd, 0), p(fw / 2 + 0.26, fd, 0), p(fw / 2 + 0.26, fd, 27), p(fw / 2 - 0.26, fd, 27)], C.steel, 0.95)
  poly(g, [p(fw / 2 - 0.5, fd, 28), p(fw / 2 + 0.5, fd, 28), p(fw / 2 + 0.5, fd, 33), p(fw / 2 - 0.5, fd, 33)], C.awning)
  // the red lamp beside the door: a running theatre is not to be walked into
  g.fillStyle(C.awningDark, 1)
  const lamp = p(fw / 2 + 0.62, fd, 30)
  g.fillCircle(lamp.x, lamp.y, 3.4)
  signField(b, fw, fd, H, 0.44, 0.6, 0.3)
  flatRoof(b, fw, fd, H)
  // rooftop plant: two boxed units and a stack. A sealed building breathes through them,
  // and they are what stops the roof plane reading as a bare rectangle at close zoom.
  for (const gx of [0.5, 1.6]) {
    poly(g, [p(gx, 0.4, H + 5), p(gx + 0.7, 0.4, H + 5), p(gx + 0.7, 1.1, H + 5), p(gx, 1.1, H + 5)], C.steelLit)
    poly(g, [p(gx, 1.1, H + 5), p(gx + 0.7, 1.1, H + 5), p(gx + 0.7, 1.1, H + 20), p(gx, 1.1, H + 20)], C.steel)
    poly(g, [p(gx, 0.4, H + 20), p(gx + 0.7, 0.4, H + 20), p(gx + 0.7, 1.1, H + 20), p(gx, 1.1, H + 20)], C.slateLit)
  }
  poly(g, [p(2.5, 0.3, H + 5), p(2.8, 0.3, H + 5), p(2.8, 0.6, H + 5), p(2.5, 0.6, H + 5)], C.steel)
  poly(g, [p(2.5, 0.6, H + 5), p(2.8, 0.6, H + 5), p(2.8, 0.6, H + 32), p(2.5, 0.6, H + 32)], C.slateShade)
  poly(g, [p(2.45, 0.25, H + 32), p(2.85, 0.25, H + 32), p(2.85, 0.65, H + 32), p(2.45, 0.65, H + 32)], C.slateLit)
  TYCOON_BUILDING_TEX[key] = { key, originX: 0.5, originY: b.originY, fw, fd }
  finalize(b, key)
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

/**
 * The hero entrance arch: two deco pillars + a lettered header beam.
 *
 * 3 tiles across gx by 1 deep in gy, so it STRADDLES the two-lane boulevard rather
 * than lying along it — the road passes under the arch, which is the whole point of a
 * studio gate. The scene letters the beam with the studio's own name.
 */
function bakeGate(scene: Phaser.Scene): void {
  const fw = 3
  const fd = 1
  const H = 126
  const b = beginBuilding(scene, fw, fd, H, 30)
  const { g, p } = b
  const PW = 0.62
  for (const gx of [0, fw - PW]) {
    // lit face (gy = fd), shaded face (gx = pillar's far side), then the cap
    poly(g, [p(gx, fd, 0), p(gx + PW, fd, 0), p(gx + PW, fd, H), p(gx, fd, H)], C.taupe)
    poly(g, [p(gx + PW, 0, 0), p(gx + PW, fd, 0), p(gx + PW, fd, H), p(gx + PW, 0, H)], C.taupeShade)
    poly(g, [p(gx, 0, H), p(gx + PW, 0, H), p(gx + PW, fd, H), p(gx, fd, H)], C.roofGravel)
    poly(g, [p(gx, fd, 12), p(gx + PW, fd, 12), p(gx + PW, fd, 18), p(gx, fd, 18)], C.brass, 0.9)
  }
  // header beam spanning the pillars, deep enough for lettering to read on it
  const bz0 = H - 32
  poly(g, [p(0, fd, bz0), p(fw, fd, bz0), p(fw, fd, H), p(0, fd, H)], C.taupe)
  poly(g, [p(fw, 0, bz0), p(fw, fd, bz0), p(fw, fd, H), p(fw, 0, H)], C.taupeShade)
  poly(g, [p(0, 0, H), p(fw, 0, H), p(fw, fd, H), p(0, fd, H)], C.roofGravel)
  poly(g, [p(0, fd, H - 4), p(fw, fd, H - 4), p(fw, fd, H), p(0, fd, H)], C.brass, 0.9)
  poly(g, [p(0, fd, bz0), p(fw, fd, bz0), p(fw, fd, bz0 + 3), p(0, fd, bz0 + 3)], C.brass, 0.9)
  // stepped finial centred on the beam
  const cx = fw / 2
  poly(g, [p(cx - 0.45, 0, H), p(cx + 0.45, 0, H), p(cx + 0.45, fd, H), p(cx - 0.45, fd, H)], C.brass)
  poly(g, [p(cx - 0.45, fd, H), p(cx + 0.45, fd, H), p(cx + 0.45, fd, H + 15), p(cx - 0.45, fd, H + 15)], C.brassDark)
  poly(g, [p(cx - 0.25, 0, H + 15), p(cx + 0.25, 0, H + 15), p(cx + 0.25, fd, H + 15), p(cx - 0.25, fd, H + 15)], C.brass)
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
    // C1-M6b: the tank gets the details a real one has — a catwalk with a handrail, a
    // service ladder up the near leg, cross-braced guys, and a painted name band. The
    // lot's tallest landmark was the one silhouette carrying no craft at close zoom.
    g.fillStyle(C.cream, 1)
    g.fillRect(cx - 28, 56, 56, 48)
    g.fillStyle(C.creamShade, 1)
    g.fillRect(cx + 8, 56, 20, 48)
    // staved barrel: vertical seams across the lit face
    g.lineStyle(1, C.creamShade, 0.55)
    for (let x = cx - 22; x < cx + 8; x += 7) g.lineBetween(x, 58, x, 102)
    g.fillStyle(C.brass, 0.85)
    g.fillRect(cx - 28, 74, 56, 4)
    g.fillStyle(C.signPanel, 0.9)
    g.fillRect(cx - 24, 80, 48, 12)
    g.fillStyle(C.brass, 0.75)
    g.fillRect(cx - 19, 84, 38, 3)
    // catwalk deck + handrail round the base of the tank
    g.fillStyle(C.steel, 1)
    g.fillRect(cx - 34, 102, 68, 3)
    g.lineStyle(1.6, C.steel, 0.95)
    g.strokeRect(cx - 34, 92, 68, 10)
    for (let x = cx - 30; x <= cx + 30; x += 10) g.lineBetween(x, 92, x, 102)
    // service ladder up the near leg, hooped at the top
    stroke(g, [{ x: cx - 24, y: 196 }, { x: cx - 12, y: 104 }], C.steel, 1.6, 0.9)
    stroke(g, [{ x: cx - 18, y: 196 }, { x: cx - 6, y: 104 }], C.steel, 1.6, 0.9)
    for (let i = 1; i < 9; i++) {
      const t = i / 9
      stroke(
        g,
        [
          { x: cx - 24 + 12 * t, y: 196 - 92 * t },
          { x: cx - 18 + 12 * t, y: 196 - 92 * t },
        ],
        C.steel,
        1.2,
        0.85,
      )
    }
    poly(g, [{ x: cx - 28, y: 56 }, { x: cx + 28, y: 56 }, { x: cx, y: 24 }], C.terracotta)
    poly(g, [{ x: cx + 4, y: 52 }, { x: cx + 28, y: 56 }, { x: cx, y: 24 }], C.terracottaDark)
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

  bakeBacklotProps(scene)
  bakeProductionProps(scene)
}

// ── C2a-M5x production plant, planting and crews ──────────────────────────────
//
// 00H priorities 1 (visibly active workers tied to real jobs), 4 (more production
// props / equipment / vehicles), 6 (department identity) and 7 (density).
//
// The Owner's read of the M5 lot was "only marginally busier". The C1-M6b inventory
// dressed the MARGINS — fences, drums, scrub — and deliberately left the property's
// middle open. That reads as a model of a studio rather than a studio. This set is the
// working plant itself: the vehicles a picture arrives and leaves in, the gear a stage
// runs on, the trees a 1948 California lot is planted with, and — the part no static
// prop could carry before — CREW CLUSTERS, small groups of figures caught mid-job.
//
// A crew cluster is one baked texture and therefore ONE display object for three or
// four figures. That is the whole reason it exists: the alternative, a sprite per
// person, would have put a hundred objects and a hundred hit tests on the lot to say
// something presentation is allowed to say once. Nothing in this file is addressable,
// holds state, or answers a question — and the WORLD only stands a crew cluster
// somewhere the ENGINE's own week theater says that work is happening (see
// `theaterCrewProps` in TycoonScene).

/** A small standing figure for a crew cluster, in the people atlas' silhouette language. */
function crewFigure(
  g: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  h: number,
  suit: number,
  hat: number | null,
  arms: 'down' | 'up' | 'carry' = 'down',
): void {
  const s = h / 46
  g.fillStyle(C.shadow, 0.24)
  g.fillEllipse(x + 2 * s, y, 16 * s, 5 * s)
  g.fillStyle(0x2a231b, 1)
  g.fillRect(x - 5.5 * s, y - 15 * s, 4.5 * s, 15 * s)
  g.fillRect(x + 1 * s, y - 15 * s, 4.5 * s, 15 * s)
  g.fillStyle(suit, 1)
  g.fillRoundedRect(x - 7 * s, y - 33 * s, 14 * s, 20 * s, 3 * s)
  if (arms === 'up') {
    g.fillRoundedRect(x - 11 * s, y - 42 * s, 4 * s, 14 * s, 2 * s)
    g.fillRoundedRect(x + 7 * s, y - 42 * s, 4 * s, 14 * s, 2 * s)
  } else if (arms === 'carry') {
    g.fillRoundedRect(x - 12 * s, y - 32 * s, 12 * s, 4 * s, 2 * s)
    g.fillRoundedRect(x + 6 * s, y - 30 * s, 4 * s, 12 * s, 2 * s)
  } else {
    g.fillRoundedRect(x - 10 * s, y - 32 * s, 4 * s, 16 * s, 2 * s)
    g.fillRoundedRect(x + 6 * s, y - 32 * s, 4 * s, 16 * s, 2 * s)
  }
  g.fillStyle(0xd7a678, 1)
  g.fillCircle(x, y - 37.5 * s, 5.2 * s)
  if (hat !== null) {
    g.fillStyle(hat, 1)
    g.fillEllipse(x, y - 41.5 * s, 13 * s, 5.5 * s)
    g.fillRect(x - 4 * s, y - 45 * s, 8 * s, 4 * s)
  }
}

function bakeProductionProps(scene: Phaser.Scene): void {
  // ── planting ────────────────────────────────────────────────────────────────
  // The palm is the only tree on the lot today, and a lot planted with one species
  // reads as a texture rather than a landscape. Two more: the broadleaf shade tree
  // that fills a lawn, and the cypress that marks a corner.
  bakeProp(scene, 'tw-tree', 76, 98, 0.95, (g) => {
    const cx = 38
    contact(g, cx, 93, 26)
    stroke(g, [{ x: cx, y: 93 }, { x: cx - 3, y: 62 }, { x: cx + 1, y: 50 }], C.trunk, 7)
    stroke(g, [{ x: cx + 1, y: 66 }, { x: cx + 12, y: 55 }], C.trunk, 4)
    g.fillStyle(C.frondDark, 1)
    g.fillCircle(cx - 9, 44, 22)
    g.fillCircle(cx + 12, 48, 18)
    g.fillCircle(cx + 2, 28, 20)
    g.fillStyle(C.frond, 1)
    g.fillCircle(cx - 7, 40, 19)
    g.fillCircle(cx + 10, 44, 15)
    g.fillCircle(cx + 1, 25, 16)
    g.fillStyle(mix(C.frond, 0xffffff, 0.2), 1)
    g.fillCircle(cx - 10, 32, 11)
    g.fillCircle(cx, 20, 8)
  })

  bakeProp(scene, 'tw-cypress', 44, 112, 0.96, (g) => {
    const cx = 22
    contact(g, cx, 107, 14)
    g.fillStyle(C.frondDark, 1)
    poly(g, [{ x: cx, y: 6 }, { x: cx + 14, y: 78 }, { x: cx + 8, y: 104 }, { x: cx - 8, y: 104 }, { x: cx - 14, y: 78 }], C.frondDark)
    g.fillStyle(C.frond, 1)
    poly(g, [{ x: cx - 2, y: 12 }, { x: cx + 6, y: 78 }, { x: cx + 2, y: 102 }, { x: cx - 8, y: 102 }, { x: cx - 11, y: 74 }], C.frond)
  })

  bakeProp(scene, 'tw-flowerbed', 66, 40, 0.86, (g) => {
    contact(g, 33, 34, 20)
    g.fillStyle(C.dirt, 1)
    g.fillEllipse(33, 26, 56, 20)
    g.fillStyle(C.dirtEdge, 0.6)
    g.fillEllipse(33, 28, 56, 18)
    for (let i = 0; i < 14; i++) {
      const a = (Math.PI * 2 * i) / 14
      g.fillStyle(i % 3 === 0 ? C.awning : i % 3 === 1 ? C.brass : C.marquee, 1)
      g.fillCircle(33 + Math.cos(a) * 21, 25 + Math.sin(a) * 7, 3.2)
    }
    g.fillStyle(C.hedge, 1)
    g.fillCircle(33, 22, 5)
  })

  // ── the picture's own vehicles ──────────────────────────────────────────────
  bakeProp(scene, 'tw-trailer', 116, 78, 0.86, (g) => {
    contact(g, 58, 70, 36)
    // a star's trailer: cream body, brass waistline, awning over the door
    g.fillStyle(C.cream, 1)
    g.fillRoundedRect(10, 24, 92, 34, 8)
    g.fillStyle(C.creamShade, 1)
    g.fillRect(58, 24, 44, 34)
    g.fillStyle(mix(C.cream, 0xffffff, 0.25), 1)
    g.fillRoundedRect(12, 22, 88, 9, 5)
    g.fillStyle(C.brass, 0.9)
    g.fillRect(12, 41, 88, 3)
    g.fillStyle(C.glass, 0.85)
    g.fillRoundedRect(19, 29, 18, 10, 2)
    g.fillRoundedRect(43, 29, 18, 10, 2)
    g.fillStyle(C.creamDeep, 1)
    g.fillRect(76, 30, 15, 28)
    g.fillStyle(C.awning, 1)
    poly(g, [{ x: 72, y: 28 }, { x: 96, y: 28 }, { x: 100, y: 20 }, { x: 76, y: 20 }], C.awning)
    g.fillStyle(C.awningDark, 1)
    g.fillRect(76, 58, 15, 3)
    g.fillStyle(C.tyre, 1)
    g.fillCircle(32, 60, 9)
    g.fillCircle(84, 60, 9)
    g.fillStyle(C.steelLit, 1)
    g.fillCircle(32, 60, 3.4)
    g.fillCircle(84, 60, 3.4)
    stroke(g, [{ x: 10, y: 46 }, { x: 2, y: 52 }], C.steel, 3)
  })

  bakeProp(scene, 'tw-boxtruck', 122, 82, 0.85, (g) => {
    contact(g, 61, 74, 38)
    g.fillStyle(C.truckBody, 1)
    g.fillRect(8, 18, 74, 40)
    g.fillStyle(mix(C.truckBody, C.shadow, 0.3), 1)
    g.fillRect(56, 18, 26, 40)
    g.fillStyle(C.truckTrim, 0.9)
    g.fillRect(12, 32, 66, 5)
    g.fillStyle(mix(C.truckBody, 0xffffff, 0.12), 1)
    g.fillRect(8, 15, 74, 5)
    g.fillStyle(C.truckBody, 1)
    g.fillRoundedRect(80, 26, 32, 32, 5)
    g.fillStyle(C.glass, 0.9)
    g.fillRect(92, 30, 16, 12)
    g.fillStyle(C.tyre, 1)
    g.fillCircle(26, 60, 10)
    g.fillCircle(66, 60, 10)
    g.fillCircle(98, 60, 10)
    g.fillStyle(C.steelLit, 1)
    g.fillCircle(26, 60, 3.6)
    g.fillCircle(66, 60, 3.6)
    g.fillCircle(98, 60, 3.6)
  })

  bakeProp(scene, 'tw-sedan', 108, 58, 0.83, (g) => {
    contact(g, 54, 50, 33)
    const body = C.vanBody
    g.fillStyle(body, 1)
    g.fillRoundedRect(4, 20, 100, 22, 10)
    g.fillStyle(mix(body, 0xffffff, 0.16), 1)
    g.fillRoundedRect(28, 7, 50, 25, 10)
    poly(g, [{ x: 34, y: 11 }, { x: 51, y: 11 }, { x: 51, y: 25 }, { x: 34, y: 25 }], C.glass, 0.72)
    poly(g, [{ x: 56, y: 11 }, { x: 73, y: 14 }, { x: 73, y: 25 }, { x: 56, y: 25 }], C.glass, 0.72)
    g.fillStyle(C.carTrim, 0.85)
    g.fillRect(10, 30, 88, 3)
    g.fillStyle(C.tyre, 1)
    g.fillCircle(26, 42, 10)
    g.fillCircle(80, 42, 10)
    g.fillStyle(C.marquee, 1)
    g.fillCircle(26, 42, 4)
    g.fillCircle(80, 42, 4)
  })

  // ── the gear a stage actually runs on ───────────────────────────────────────
  bakeProp(scene, 'tw-crane', 124, 116, 0.95, (g) => {
    contact(g, 56, 110, 34)
    // dolly base
    g.fillStyle(C.steel, 1)
    g.fillRoundedRect(26, 92, 60, 12, 4)
    g.fillStyle(C.tyre, 1)
    g.fillCircle(34, 106, 7)
    g.fillCircle(78, 106, 7)
    // column and boom
    g.fillStyle(C.steelLit, 1)
    g.fillRect(50, 58, 12, 36)
    stroke(g, [{ x: 56, y: 62 }, { x: 112, y: 16 }], C.steel, 7)
    stroke(g, [{ x: 56, y: 62 }, { x: 16, y: 94 }], C.steel, 7)
    stroke(g, [{ x: 56, y: 62 }, { x: 100, y: 26 }], C.steelLit, 2.5)
    // counterweights at the tail
    g.fillStyle(C.shadow, 1)
    g.fillRoundedRect(10, 84, 22, 16, 3)
    // camera head and operator seat
    g.fillStyle(0x1e2120, 1)
    g.fillRoundedRect(100, 8, 22, 15, 3)
    g.fillCircle(122, 15, 6)
    g.fillStyle(C.glass, 0.8)
    g.fillCircle(122, 15, 3)
    g.fillStyle(C.truckBody, 1)
    g.fillRoundedRect(92, 22, 14, 9, 3)
  })

  bakeProp(scene, 'tw-arcrig', 60, 112, 0.96, (g) => {
    contact(g, 30, 106, 18)
    stroke(g, [{ x: 30, y: 104 }, { x: 16, y: 108 }], C.steel, 3)
    stroke(g, [{ x: 30, y: 104 }, { x: 44, y: 108 }], C.steel, 3)
    stroke(g, [{ x: 30, y: 104 }, { x: 30, y: 46 }], C.steel, 4.5)
    g.fillStyle(0x2b2b28, 1)
    g.fillRoundedRect(12, 20, 36, 30, 5)
    g.fillStyle(C.lampGlass, 1)
    g.fillCircle(46, 35, 11)
    g.fillStyle(mix(C.lampGlass, 0xffffff, 0.5), 0.9)
    g.fillCircle(46, 35, 6)
    g.fillStyle(0x1d1d1b, 1)
    g.fillRect(44, 18, 16, 5)
    g.fillRect(44, 47, 16, 5)
    stroke(g, [{ x: 20, y: 50 }, { x: 6, y: 100 }, { x: 20, y: 106 }], 0x24211c, 3)
  })

  bakeProp(scene, 'tw-genset', 78, 54, 0.87, (g) => {
    contact(g, 39, 46, 24)
    g.fillStyle(C.truckBody, 1)
    g.fillRoundedRect(10, 14, 58, 24, 3)
    g.fillStyle(mix(C.truckBody, C.shadow, 0.32), 1)
    g.fillRect(46, 14, 22, 24)
    g.fillStyle(C.steel, 1)
    for (let x = 14; x < 42; x += 5) g.fillRect(x, 18, 2, 16)
    g.fillStyle(C.steel, 1)
    g.fillRect(6, 36, 66, 4)
    g.fillStyle(C.tyre, 1)
    g.fillCircle(20, 44, 7)
    g.fillCircle(58, 44, 7)
    stroke(g, [{ x: 68, y: 26 }, { x: 76, y: 30 }], C.steel, 3)
  })

  bakeProp(scene, 'tw-cablereel', 58, 50, 0.87, (g) => {
    contact(g, 29, 44, 20)
    for (const [cx, cy, r] of [[20, 26, 15], [40, 30, 12]] as const) {
      g.fillStyle(C.timberDark, 1)
      g.fillCircle(cx, cy, r)
      g.fillStyle(0x24211c, 1)
      g.fillCircle(cx, cy, r * 0.62)
      g.fillStyle(C.timber, 1)
      g.fillCircle(cx, cy, r * 0.2)
    }
  })

  bakeProp(scene, 'tw-cratestack', 66, 76, 0.91, (g) => {
    contact(g, 33, 70, 22)
    const p = (gx: number, gy: number, z: number): Pt => ({ x: (gx - gy) * 15 + 33, y: (gx + gy) * 7.5 - z + 52 })
    const box = (bx: number, by: number, z0: number, size: number): void => {
      const H = size
      poly(g, [p(bx, by + 1, z0), p(bx + 1, by + 1, z0), p(bx + 1, by + 1, z0 + H), p(bx, by + 1, z0 + H)], C.crate)
      poly(g, [p(bx + 1, by, z0), p(bx + 1, by + 1, z0), p(bx + 1, by + 1, z0 + H), p(bx + 1, by, z0 + H)], C.crateDark)
      poly(g, [p(bx, by, z0 + H), p(bx + 1, by, z0 + H), p(bx + 1, by + 1, z0 + H), p(bx, by + 1, z0 + H)], mix(C.crate, 0xffffff, 0.16))
      stroke(g, [p(bx, by + 1, z0 + H * 0.5), p(bx + 1, by + 1, z0 + H * 0.5)], C.timberDark, 1.4, 0.75)
    }
    box(-0.5, -0.5, 0, 17)
    box(0.5, 0.4, 0, 15)
    box(-0.4, 0.5, 0, 15)
    box(0, 0, 17, 16)
    box(-0.1, -0.05, 33, 14)
  })

  bakeProp(scene, 'tw-flatlean', 108, 94, 0.92, (g) => {
    contact(g, 54, 86, 34)
    // painted scenery flats leaning on a stage wall — the tallest yard prop, and the
    // one that says SET rather than storage. Painted faces, not blank timber.
    const faces = [C.taupeLit, C.awning, C.glassDeep, C.timber] as const
    for (let i = 0; i < 4; i++) {
      const x = 8 + i * 13
      poly(
        g,
        [{ x, y: 84 }, { x: x + 32, y: 84 }, { x: x + 40, y: 10 + i * 3 }, { x: x + 8, y: 10 + i * 3 }],
        faces[i],
      )
      stroke(g, [{ x, y: 84 }, { x: x + 8, y: 10 + i * 3 }], C.shadow, 2, 0.4)
      // a painted horizon band so a flat reads as scenery
      poly(
        g,
        [{ x: x + 3, y: 60 }, { x: x + 35, y: 60 }, { x: x + 36, y: 50 }, { x: x + 4, y: 50 }],
        mix(faces[i], C.shadow, 0.28),
        0.8,
      )
    }
  })

  bakeProp(scene, 'tw-lumber', 92, 58, 0.88, (g) => {
    contact(g, 46, 50, 28)
    for (const x of [16, 66]) {
      stroke(g, [{ x: x - 7, y: 48 }, { x, y: 30 }, { x: x + 7, y: 48 }], C.timberDark, 3)
    }
    for (let i = 0; i < 4; i++) {
      g.fillStyle(i % 2 ? C.timber : mix(C.timber, C.shadow, 0.18), 1)
      g.fillRect(8, 30 - i * 5, 76, 4.4)
    }
    g.fillStyle(C.steel, 1)
    g.fillRect(70, 12, 3, 16)
    g.fillStyle(C.steelLit, 1)
    poly(g, [{ x: 62, y: 14 }, { x: 80, y: 10 }, { x: 80, y: 14 }, { x: 62, y: 18 }], C.steelLit)
  })

  // ── crews, caught mid-job ───────────────────────────────────────────────────
  // Each of these is placed by the WORLD only where the engine's own week theater
  // says that work is happening. They are the answer to 00H priority 1.

  bakeProp(scene, 'tw-crew-build', 118, 96, 0.93, (g) => {
    // a construction gang: one up a ladder, two placing a plank, materials at their feet
    g.fillStyle(C.timberDark, 1)
    g.fillRect(6, 78, 44, 5)
    g.fillRect(10, 84, 36, 5)
    stroke(g, [{ x: 62, y: 90 }, { x: 70, y: 24 }], C.timber, 3.5)
    stroke(g, [{ x: 74, y: 90 }, { x: 82, y: 24 }], C.timber, 3.5)
    for (let i = 0; i < 6; i++) stroke(g, [{ x: 63 + i * 1.4, y: 80 - i * 11 }, { x: 75 + i * 1.4, y: 80 - i * 11 }], C.timber, 2.4)
    crewFigure(g, 76, 52, 34, 0x6d4c2e, 0xc9a24a, 'up')
    crewFigure(g, 26, 90, 40, 0x4a5140, 0xc9a24a, 'carry')
    crewFigure(g, 48, 94, 42, 0x3a4f5a, 0xc9a24a, 'down')
    g.fillStyle(C.crate, 1)
    g.fillRect(92, 74, 20, 14)
    g.fillStyle(C.crateDark, 1)
    g.fillRect(104, 74, 8, 14)
    g.fillStyle(C.drum, 1)
    g.fillRoundedRect(2, 64, 13, 20, 3)
  })

  bakeProp(scene, 'tw-crew-grip', 104, 84, 0.92, (g) => {
    // grips at a stage door: a gear cart, a light on a stand, two hands working
    g.fillStyle(C.steel, 1)
    g.fillRect(8, 60, 34, 5)
    g.fillStyle(C.tyre, 1)
    g.fillCircle(14, 68, 5)
    g.fillCircle(36, 68, 5)
    g.fillStyle(C.canvasTarp, 1)
    g.fillRect(12, 44, 26, 16)
    g.fillStyle(C.crate, 1)
    g.fillRect(16, 34, 18, 10)
    stroke(g, [{ x: 88, y: 76 }, { x: 88, y: 30 }], C.steel, 3.5)
    g.fillStyle(0x2b2b28, 1)
    g.fillRoundedRect(76, 14, 24, 18, 4)
    g.fillStyle(C.lampGlass, 1)
    g.fillCircle(99, 23, 7)
    crewFigure(g, 54, 78, 40, 0x4a5140, 0x2c3a42, 'carry')
    crewFigure(g, 70, 82, 42, 0x35322e, null, 'up')
  })

  bakeProp(scene, 'tw-crew-haul', 100, 78, 0.9, (g) => {
    // two hands walking a loaded hand truck down the road
    g.fillStyle(C.steel, 1)
    g.fillRect(44, 34, 4, 34)
    g.fillRect(44, 66, 22, 4)
    g.fillStyle(C.tyre, 1)
    g.fillCircle(50, 70, 6)
    g.fillStyle(C.crate, 1)
    g.fillRect(48, 40, 26, 26)
    g.fillStyle(C.crateDark, 1)
    g.fillRect(64, 40, 10, 26)
    stroke(g, [{ x: 48, y: 53 }, { x: 74, y: 53 }], C.timberDark, 1.6, 0.8)
    crewFigure(g, 26, 74, 42, 0x6d4c2e, 0x2c3a42, 'carry')
    crewFigure(g, 86, 76, 42, 0x4a5140, 0x2c3a42, 'carry')
  })

  bakeProp(scene, 'tw-crew-queue', 124, 82, 0.92, (g) => {
    // a line of hopefuls outside a casting door: the queue the world can WEAR
    const suits = [0x2a6a5c, 0x74495f, 0x715f4a, 0x4d3527, 0x3a4f5a] as const
    for (let i = 0; i < 5; i++) {
      crewFigure(g, 14 + i * 24, 76 - (i % 2) * 4, 40, suits[i], i % 2 ? 0x33261e : null, 'down')
    }
  })

  bakeProp(scene, 'tw-crew-camera', 96, 86, 0.93, (g) => {
    // a camera crew on the apron: tripod head, an operator, a slate
    stroke(g, [{ x: 34, y: 78 }, { x: 22, y: 84 }], C.steel, 3)
    stroke(g, [{ x: 34, y: 78 }, { x: 46, y: 84 }], C.steel, 3)
    stroke(g, [{ x: 34, y: 78 }, { x: 34, y: 40 }], C.steel, 4)
    g.fillStyle(0x1e2120, 1)
    g.fillRoundedRect(18, 22, 34, 20, 4)
    g.fillCircle(52, 32, 8)
    g.fillStyle(C.glass, 0.85)
    g.fillCircle(52, 32, 4)
    g.fillStyle(0x2b2b28, 1)
    g.fillCircle(26, 18, 9)
    crewFigure(g, 66, 82, 42, 0x35322e, 0x2c3a42, 'up')
    g.fillStyle(C.signInk, 1)
    g.fillRect(84, 54, 12, 10)
    g.fillStyle(C.signPanel, 1)
    for (let i = 0; i < 3; i++) g.fillRect(84 + i * 4, 54, 2, 3)
  })
}

// ── C1-M6b backlot dressing ───────────────────────────────────────────────────
//
// Inert props whose only job is to make the property look INHABITED — a working lot has
// standing gear on it, and a lot with none reads as an architectural model.
//
// Every one of these is presentation and nothing else: they carry no hit area, no state,
// no id, and the world places them only on ground no player can build on (see
// `backlotDressing` in ./world.ts). They are deliberately SMALL and LOW — a prop that
// competes with a building's silhouette would be dressing that lies about what stands
// where. Nothing here is taller than a person except the two fence runs and the light
// stand, and none of them casts a footprint big enough to be mistaken for a body.

function bakeBacklotProps(scene: Phaser.Scene): void {
  /**
   * A post-and-wire fence run, one tile long, in each of the two isometric directions.
   * Fencing is what actually tells a player where the working yard ends and the graded
   * lot begins — a boundary the ground zoning alone cannot draw.
   */
  // One tile long, anchored at the MIDDLE of its run: the sprite's origin lands on the
  // grid point it is placed at, so a row of them joins up instead of marching off-line.
  const fenceBase = 30
  const fenceTexH = 70
  const fence = (key: string, along: 'gx' | 'gy'): void => {
    bakeProp(scene, key, TILE_W, fenceTexH, (fenceBase + TILE_H * 0.25) / fenceTexH, (g) => {
      const p = (t: number, z: number): Pt =>
        along === 'gx'
          ? { x: t * TILE_W, y: t * TILE_H * 0.5 - z + fenceBase }
          : { x: TILE_W - t * TILE_W, y: t * TILE_H * 0.5 - z + fenceBase }
      const H = 26
      // three posts, then two wire runs and a top rail between them
      for (const t of [0.04, 0.5, 0.96]) {
        const foot = p(t, 0)
        const head = p(t, H)
        g.fillStyle(C.fencePost, 1)
        g.fillRect(foot.x - 2, head.y, 4, foot.y - head.y)
        g.fillStyle(C.shadow, 0.28)
        g.fillRect(foot.x + 2, head.y + 2, 2, foot.y - head.y - 2)
      }
      for (const z of [H, H * 0.66, H * 0.33]) {
        stroke(g, [p(0.04, z), p(0.96, z)], z === H ? C.fencePost : C.fenceWire, z === H ? 2.5 : 1.4, 0.9)
      }
    })
  }
  fence('tw-fence-x', 'gx')
  fence('tw-fence-y', 'gy')

  // Painted oil drums — the one hit of studio red out in the yard.
  bakeProp(scene, 'tw-drums', 52, 44, 0.86, (g) => {
    contact(g, 26, 38, 15)
    const drum = (cx: number, cy: number, colour: number): void => {
      g.fillStyle(colour, 1)
      g.fillRect(cx - 8, cy - 20, 16, 20)
      g.fillStyle(mix(colour, C.shadow, 0.34), 1)
      g.fillRect(cx + 2, cy - 20, 6, 20)
      g.fillStyle(mix(colour, 0xffffff, 0.22), 1)
      g.fillEllipse(cx, cy - 20, 16, 6)
      g.lineStyle(1.2, C.shadow, 0.4)
      g.lineBetween(cx - 8, cy - 13, cx + 8, cy - 13)
      g.lineBetween(cx - 8, cy - 7, cx + 8, cy - 7)
    }
    drum(16, 36, C.drum)
    drum(33, 33, C.drumAlt)
    drum(25, 40, C.drum)
  })

  // A stack of timber pallets: the shape a working yard is actually full of.
  bakeProp(scene, 'tw-pallets', 56, 40, 0.86, (g) => {
    contact(g, 28, 34, 17)
    const p = (gx: number, gy: number, z: number): Pt => ({ x: (gx - gy) * 14 + 28, y: (gx + gy) * 7 - z + 26 })
    for (let i = 0; i < 4; i++) {
      const z = i * 6
      poly(g, [p(0, 1, z), p(1, 1, z), p(1, 1, z + 4), p(0, 1, z + 4)], i % 2 ? C.timber : C.timberDark)
      poly(g, [p(1, 0, z), p(1, 1, z), p(1, 1, z + 4), p(1, 0, z + 4)], C.crateDark)
    }
    poly(g, [p(0, 0, 24), p(1, 0, 24), p(1, 1, 24), p(0, 1, 24)], mix(C.timber, 0xffffff, 0.18))
  })

  // A leaning ladder and a paint pot — somebody is mid-job here.
  bakeProp(scene, 'tw-ladder', 44, 56, 0.92, (g) => {
    contact(g, 20, 50, 11)
    stroke(g, [{ x: 12, y: 51 }, { x: 30, y: 8 }], C.timber, 2.6)
    stroke(g, [{ x: 18, y: 53 }, { x: 36, y: 10 }], C.timber, 2.6)
    for (let i = 1; i < 6; i++) {
      const t = i / 6
      stroke(
        g,
        [{ x: 12 + (30 - 12) * t, y: 51 + (8 - 51) * t }, { x: 18 + (36 - 18) * t, y: 53 + (10 - 53) * t }],
        C.timberDark,
        1.6,
      )
    }
    g.fillStyle(C.drum, 1).fillRect(4, 44, 9, 9)
    g.fillStyle(C.steelLit, 1).fillEllipse(8.5, 44, 9, 3.5)
  })

  // Sandbags and a coil of cable: soundstage rigging that lives outside the doors.
  bakeProp(scene, 'tw-rigging', 52, 34, 0.84, (g) => {
    contact(g, 26, 28, 15)
    for (const [x, y] of [[12, 26], [24, 28], [36, 25], [18, 20], [30, 21]] as const) {
      g.fillStyle(C.canvasTarp, 1)
      g.fillEllipse(x, y, 15, 8)
      g.fillStyle(mix(C.canvasTarp, C.shadow, 0.3), 1)
      g.fillEllipse(x + 3, y + 2, 11, 5)
    }
    g.lineStyle(2.4, C.tyre, 0.9)
    g.strokeEllipse(24, 15, 20, 9)
    g.strokeEllipse(24, 13, 14, 6)
  })

  // A film lamp on a stand. Nothing on the lot says "movie studio" faster.
  bakeProp(scene, 'tw-lightstand', 42, 82, 0.95, (g) => {
    contact(g, 21, 76, 11)
    stroke(g, [{ x: 21, y: 77 }, { x: 12, y: 62 }], C.steel, 2.2)
    stroke(g, [{ x: 21, y: 77 }, { x: 30, y: 62 }], C.steel, 2.2)
    stroke(g, [{ x: 21, y: 77 }, { x: 21, y: 26 }], C.steel, 3)
    g.fillStyle(C.steel, 1).fillRect(11, 12, 20, 17)
    g.fillStyle(C.steelLit, 1).fillRect(11, 12, 20, 4)
    g.fillStyle(C.lampGlass, 0.95).fillEllipse(31, 21, 7, 14)
    g.lineStyle(1.8, C.steel, 1).strokeEllipse(31, 21, 7, 14)
  })

  // A small scaffold tower — the corpus' construction idiom, standing idle in the yard.
  bakeProp(scene, 'tw-scaffold', 74, 86, 0.93, (g) => {
    contact(g, 37, 78, 24)
    for (const x of [12, 34, 60]) stroke(g, [{ x, y: 80 }, { x, y: 14 }], C.steel, 2.4)
    for (const y of [22, 44, 66]) stroke(g, [{ x: 12, y }, { x: 60, y: y - 6 }], C.steel, 2)
    stroke(g, [{ x: 12, y: 80 }, { x: 60, y: 8 }], C.steel, 1.4, 0.5)
    stroke(g, [{ x: 60, y: 74 }, { x: 12, y: 14 }], C.steel, 1.4, 0.5)
    g.fillStyle(C.timber, 1).fillRect(10, 40, 52, 5)
    g.fillStyle(C.timberDark, 1).fillRect(10, 45, 52, 2)
    g.fillStyle(C.canvasTarp, 0.85).fillRect(36, 46, 26, 20)
  })

  // A refuse skip. Unglamorous, and exactly why the lot reads as worked in.
  bakeProp(scene, 'tw-skip', 62, 40, 0.86, (g) => {
    contact(g, 31, 34, 18)
    const p = (gx: number, gy: number, z: number): Pt => ({ x: (gx - gy) * 16 + 31, y: (gx + gy) * 8 - z + 26 })
    poly(g, [p(0, 1, 0), p(1, 1, 0), p(1, 1, 14), p(0, 1, 14)], C.drumAlt)
    poly(g, [p(1, 0, 0), p(1, 1, 0), p(1, 1, 14), p(1, 0, 14)], mix(C.drumAlt, C.shadow, 0.34))
    poly(g, [p(0, 0, 14), p(1, 0, 14), p(1, 1, 14), p(0, 1, 14)], mix(C.drumAlt, C.shadow, 0.5))
    g.fillStyle(C.timber, 0.9)
    g.fillRect(20, 15, 20, 5)
    g.fillStyle(C.crate, 0.9)
    g.fillRect(32, 12, 14, 6)
  })

  // Dry backlot scrub — the planting that grows where nobody waters.
  bakeProp(scene, 'tw-scrub', 46, 34, 0.9, (g) => {
    contact(g, 23, 29, 12)
    for (const [x, y, r] of [[13, 24, 8], [24, 21, 10], [33, 25, 7], [19, 18, 7]] as const) {
      g.fillStyle(C.scrubDark, 1)
      g.fillEllipse(x + 2, y + 2, r * 2, r * 1.1)
      g.fillStyle(C.scrub, 1)
      g.fillEllipse(x, y, r * 2, r * 1.1)
    }
  })

  // A delivery van — a different silhouette from the truck and the studio cars.
  bakeProp(scene, 'tw-van', 92, 54, 0.83, (g) => {
    contact(g, 46, 46, 28)
    g.fillStyle(C.vanBody, 1)
    g.fillRoundedRect(6, 12, 56, 26, 4)
    g.fillStyle(mix(C.vanBody, C.shadow, 0.3), 1)
    g.fillRect(40, 12, 22, 26)
    g.fillStyle(C.vanBody, 1)
    g.fillRoundedRect(58, 18, 28, 20, 5)
    g.fillStyle(C.glass, 0.9)
    g.fillRect(68, 21, 14, 9)
    g.fillStyle(C.timber, 0.85)
    g.fillRect(12, 20, 24, 3)
    g.fillStyle(C.tyre, 1)
    g.fillCircle(22, 40, 8)
    g.fillCircle(72, 40, 8)
    g.fillStyle(C.steelLit, 1)
    g.fillCircle(22, 40, 3)
    g.fillCircle(72, 40, 3)
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
  // C1-M6b: the driest grass. Two scorch blooms rather than one flat fill, so a run of
  // verge cells reads as worn ground instead of a painted stripe.
  mk('tw-t-lawn-dry', C.lawnDry, C.lawnEdge, (g) => {
    g.fillStyle(C.lawnAlt, 0.4)
    g.fillEllipse(hw - 15, hh + 5, 26, 12)
    g.fillStyle(C.surround, 0.32)
    g.fillEllipse(hw + 17, hh - 4, 22, 10)
  })
  mk('tw-t-path', C.path, C.pathEdge)
  mk('tw-t-road', C.road, C.roadEdge, (g) => {
    // C1-M6b: patched asphalt. The tile is shared by BOTH road directions, so the wear
    // is a repair patch rather than a wheel track — a track would have to point somewhere.
    g.fillStyle(C.roadWear, 0.5)
    g.fillEllipse(hw - 18, hh + 6, 30, 13)
    g.fillStyle(C.roadWear, 0.34)
    g.fillEllipse(hw + 20, hh - 5, 22, 9)
    // kerb highlight on the up-sun edges keeps roads from reading as holes
    stroke(g, [{ x: 0, y: hh }, { x: hw, y: 0 }], C.roadLine, 1.5, 0.16)
  })
  mk('tw-t-road-line', C.road, C.roadEdge, (g) => {
    g.fillStyle(C.roadWear, 0.42)
    g.fillEllipse(hw + 21, hh + 7, 24, 10)
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
  bakeOffice(scene, 'tw-writers', 3, 2, 66, 32, 'development')
  bakeOffice(scene, 'tw-casting', 3, 2, 58, 28, 'casting')
  bakeAnnex(scene)
  bakePost(scene, 'tw-post')
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
