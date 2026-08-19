// ── materials3d — the 3D material ledger, derived from the 2D identity ─────────
//
// Every colour here comes from the SAME warm 1948 ledger the isometric bake uses
// (../tycoon/palette.ts), so the 3D world is the same studio in the same light —
// not a new art direction. Texture detail is painted onto canvases with the
// deterministic gridHash the 2D ground bake uses: two builds of this module paint
// byte-identical pixels. No Math.random, no Date, no engine state.

import {
  CanvasTexture,
  Color,
  DoubleSide,
  MeshStandardMaterial,
  NearestFilter,
  RepeatWrapping,
  SRGBColorSpace,
} from 'three'
import { WARM } from '../tycoon/palette.ts'
import { gridHash } from '../tycoon/world.ts'

/**
 * Hex number → three Color. Palette numbers are sRGB; three's colour management
 * already converts constructor hexes to the linear working space, so no manual
 * conversion — doing both crushes the whole ledger two stops darker.
 */
export function warm(hex: number): Color {
  return new Color(hex)
}

/** Mix two palette hexes in linear space. */
export function warmMix(a: number, b: number, t: number): Color {
  return warm(a).lerp(warm(b), t)
}

type Painter = (ctx: CanvasRenderingContext2D, size: number) => void

/** Paint a deterministic canvas texture. Callers own repeat/wrap settings. */
export function canvasTexture(size: number, painter: Painter): CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (ctx === null) throw new Error('2d context unavailable for material bake')
  painter(ctx, size)
  const tex = new CanvasTexture(canvas)
  tex.colorSpace = SRGBColorSpace
  tex.wrapS = RepeatWrapping
  tex.wrapT = RepeatWrapping
  tex.anisotropy = 4
  return tex
}

const css = (hex: number, alpha = 1): string => {
  const r = (hex >> 16) & 0xff
  const g = (hex >> 8) & 0xff
  const b = hex & 0xff
  return `rgba(${r},${g},${b},${alpha})`
}

/** Deterministic 0..1 per texel — the same hash the 2D ground bake varies with. */
const texel01 = (x: number, y: number, salt: number): number => gridHash(x * 0.37, y * 0.53, salt)

/** Subtle per-texel luminance mottle over a base colour (stucco, render, gravel). */
function mottle(base: number, spread: number, salt: number, scale = 4): Painter {
  return (ctx, size) => {
    ctx.fillStyle = css(base)
    ctx.fillRect(0, 0, size, size)
    for (let y = 0; y < size; y += scale) {
      for (let x = 0; x < size; x += scale) {
        const n = (texel01(x, y, salt) - 0.5) * 2 * spread
        ctx.fillStyle = n >= 0 ? css(0xffffff, n) : css(0x201810, -n)
        ctx.fillRect(x, y, scale, scale)
      }
    }
  }
}

/** Vertical corrugation stripes (stage walls, service sheds). */
function corrugation(base: number, dark: number): Painter {
  return (ctx, size) => {
    ctx.fillStyle = css(base)
    ctx.fillRect(0, 0, size, size)
    const rib = size / 32
    for (let x = 0; x < size; x += rib * 2) {
      ctx.fillStyle = css(dark, 0.55)
      ctx.fillRect(x, 0, rib * 0.7, size)
      ctx.fillStyle = css(0xffffff, 0.10)
      ctx.fillRect(x + rib, 0, rib * 0.5, size)
    }
  }
}

/** Terracotta roman-tile rows for the office/bungalow roofs. */
function tileRows(base: number, dark: number): Painter {
  return (ctx, size) => {
    ctx.fillStyle = css(base)
    ctx.fillRect(0, 0, size, size)
    const row = size / 12
    for (let y = 0; y < size; y += row) {
      ctx.fillStyle = css(dark, 0.5)
      ctx.fillRect(0, y + row * 0.72, size, row * 0.28)
      for (let x = 0; x < size; x += row * 0.9) {
        const wob = (texel01(x, y, 7) - 0.5) * row * 0.12
        ctx.fillStyle = css(0xffffff, 0.07)
        ctx.fillRect(x + wob, y, row * 0.16, row * 0.72)
      }
    }
  }
}

const std = (opts: ConstructorParameters<typeof MeshStandardMaterial>[0]): MeshStandardMaterial =>
  new MeshStandardMaterial(opts)

/**
 * The shared material ledger. Built once per renderer, disposed with it.
 * Value ladder (palette law): roof above lit wall above shade wall above ground —
 * in 3D the ladder comes from the sun, so walls share one albedo per family.
 */
export type MaterialLedger = ReturnType<typeof buildMaterials>

export function buildMaterials() {
  const stucco = canvasTexture(256, mottle(WARM.cream, 0.045, 11))
  stucco.repeat.set(2, 2)
  const stuccoTaupe = canvasTexture(256, mottle(WARM.taupe, 0.05, 13))
  const stuccoBuff = canvasTexture(256, mottle(WARM.buff, 0.05, 17))
  const corrugate = canvasTexture(256, corrugation(WARM.corrugate, WARM.corrugateDark))
  corrugate.repeat.set(3, 1)
  const terracotta = canvasTexture(256, tileRows(WARM.terracotta, WARM.terracottaDark))
  const roofGravelTex = canvasTexture(256, mottle(WARM.roofGravel, 0.06, 19, 3))

  return {
    // walls
    cream: std({ map: stucco, roughness: 0.86 }),
    taupe: std({ map: stuccoTaupe, roughness: 0.88 }),
    buff: std({ map: stuccoBuff, roughness: 0.88 }),
    slate: std({ color: warm(WARM.slate), roughness: 0.85 }),
    corrugate: std({ map: corrugate, roughness: 0.62, metalness: 0.22 }),
    brick: std({ color: warm(WARM.brick), roughness: 0.92 }),
    // roofs
    terracotta: std({ map: terracotta, roughness: 0.8 }),
    roofGravel: std({ map: roofGravelTex, roughness: 0.95 }),
    roofMetal: std({ color: warm(WARM.roofMetal), roughness: 0.55, metalness: 0.35 }),
    roofSlateGreen: std({ color: warm(WARM.roofSlateGreen), roughness: 0.8 }),
    // trim & detail
    trim: std({ color: warm(WARM.creamLit), roughness: 0.7 }),
    trimDeep: std({ color: warm(WARM.creamDeep), roughness: 0.8 }),
    brass: std({ color: warm(WARM.brass), roughness: 0.35, metalness: 0.75 }),
    signPanel: std({ color: warm(WARM.signPanel), roughness: 0.6 }),
    awning: std({ color: warm(WARM.awning), roughness: 0.85 }),
    glass: std({
      color: warm(WARM.glass),
      roughness: 0.18,
      metalness: 0.6,
      emissive: warm(WARM.glassDeep),
      emissiveIntensity: 0.12,
    }),
    windowLit: std({
      color: warm(WARM.windowLit),
      emissive: warm(WARM.windowLit),
      emissiveIntensity: 0.85,
      roughness: 0.4,
    }),
    stageGlow: std({
      color: warm(WARM.stageGlow),
      emissive: warm(WARM.stageGlow),
      emissiveIntensity: 1.15,
      roughness: 0.5,
    }),
    marquee: std({ color: warm(WARM.marquee), roughness: 0.5 }),
    // greenery
    trunk: std({ color: warm(WARM.trunk), roughness: 0.95 }),
    frond: std({ color: warm(WARM.frond), roughness: 0.9, side: DoubleSide }),
    frondDark: std({ color: warm(WARM.frondDark), roughness: 0.9, side: DoubleSide }),
    hedge: std({ color: warm(WARM.hedge), roughness: 0.95 }),
    hedgeDark: std({ color: warm(WARM.hedgeDark), roughness: 0.95 }),
    scrub: std({ color: warm(WARM.scrub), roughness: 0.95 }),
    grove: std({ color: warm(WARM.grove), roughness: 0.92 }),
    groveDark: std({ color: warm(WARM.groveDark), roughness: 0.92 }),
    // set dressing & plant
    timber: std({ color: warm(WARM.timber), roughness: 0.9 }),
    timberDark: std({ color: warm(WARM.timberDark), roughness: 0.9 }),
    crate: std({ color: warm(WARM.crate), roughness: 0.9 }),
    canvasTarp: std({ color: warm(WARM.canvasTarp), roughness: 0.95 }),
    steel: std({ color: warm(WARM.steel), roughness: 0.45, metalness: 0.6 }),
    steelLit: std({ color: warm(WARM.steelLit), roughness: 0.4, metalness: 0.6 }),
    drum: std({ color: warm(WARM.drum), roughness: 0.6 }),
    fencePost: std({ color: warm(WARM.fencePost), roughness: 0.9 }),
    // vehicles
    truckBody: std({ color: warm(WARM.truckBody), roughness: 0.5, metalness: 0.15 }),
    truckTrim: std({ color: warm(WARM.truckTrim), roughness: 0.5 }),
    vanBody: std({ color: warm(WARM.vanBody), roughness: 0.5, metalness: 0.15 }),
    carBody: std({ color: warm(WARM.carBody), roughness: 0.35, metalness: 0.3 }),
    carTrim: std({ color: warm(WARM.carTrim), roughness: 0.3, metalness: 0.5 }),
    tyre: std({ color: warm(WARM.tyre), roughness: 0.95 }),
    chrome: std({ color: warm(0xd8d2c4), roughness: 0.2, metalness: 0.9 }),
    trailerSkin: std({ color: warm(0xc9c2b2), roughness: 0.3, metalness: 0.7 }),
    // selection / guidance chrome
    selection: std({
      color: warm(WARM.selection),
      emissive: warm(WARM.selection),
      emissiveIntensity: 0.6,
      roughness: 0.5,
    }),
  }
}

/** Dispose every material and its textures (teardown law: no leaked GPU memory). */
export function disposeMaterials(ledger: MaterialLedger): void {
  for (const material of Object.values(ledger)) {
    material.map?.dispose()
    material.dispose()
  }
}

/**
 * A painted sign texture — building name lettering lives IN the world, on physical
 * boards, so identity reads without floating labels (00H priority 5/6).
 */
export function signTexture(label: string, opts?: { bg?: number; ink?: number; ratio?: number }): CanvasTexture {
  const bg = opts?.bg ?? WARM.signPanel
  const ink = opts?.ink ?? WARM.signInk
  const ratio = opts?.ratio ?? 4
  const h = 128
  const w = h * ratio
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (ctx === null) throw new Error('2d context unavailable for sign bake')
  ctx.fillStyle = css(bg)
  ctx.fillRect(0, 0, w, h)
  ctx.strokeStyle = css(ink, 0.85)
  ctx.lineWidth = 6
  ctx.strokeRect(7, 7, w - 14, h - 14)
  ctx.fillStyle = css(ink)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  let px = Math.floor(h * 0.52)
  ctx.font = `600 ${px}px Georgia, 'Times New Roman', serif`
  while (ctx.measureText(label.toUpperCase()).width > w * 0.86 && px > 18) {
    px -= 4
    ctx.font = `600 ${px}px Georgia, 'Times New Roman', serif`
  }
  ctx.fillText(label.toUpperCase(), w / 2, h / 2 + 2)
  const tex = new CanvasTexture(canvas)
  tex.colorSpace = SRGBColorSpace
  tex.minFilter = NearestFilter
  tex.magFilter = NearestFilter
  return tex
}
