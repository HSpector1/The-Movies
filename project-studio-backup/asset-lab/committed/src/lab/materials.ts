// Asset Lab 02 — a small, deliberately art-directed material family (contract §6).
// Warm, stylized, golden-hour studio palette (aligned with the approved Meridian direction:
// "warm, golden-hour, stylized 1940s-50s Hollywood studio"). Shared instances keep draw
// setup low. These are GREYBOX materials, not final production art.
import * as THREE from 'three'

export const PALETTE = {
  asphalt: '#34302b',
  concrete: '#6f675b',
  sidewalk: '#8f8475',
  curbPaint: '#d8b14a',
  brick: '#9c5a44',
  wallCream: '#e7d7bb',
  wallWarm: '#d9b98f',
  accentTerracotta: '#b45f3c',
  brass: '#bb8a3f',
  soundstage: '#8a8579',
  soundstageDoor: '#55524a',
  darkMetal: '#40434a',
  signDark: '#241f1a',
  signCream: '#efe4cc',
  signGold: '#c9a24a',
  glass: '#8fb0bd',
  foliage: '#6d7a3d',
  foliageLight: '#869a4a',
  trunk: '#584635',
  crate: '#9a6b3e',
  tarpBlue: '#3f5c74',
  roofFelt: '#3c3a37',
} as const

const std = (color: string, o: Partial<THREE.MeshStandardMaterialParameters> = {}): THREE.MeshStandardMaterial =>
  new THREE.MeshStandardMaterial({ color: new THREE.Color(color), roughness: 0.9, metalness: 0, ...o })

// Shared, art-directed material instances.
export const M = {
  asphalt: std(PALETTE.asphalt, { roughness: 0.95 }),
  concrete: std(PALETTE.concrete, { roughness: 0.92 }),
  sidewalk: std(PALETTE.sidewalk, { roughness: 0.9 }),
  curbPaint: std(PALETTE.curbPaint, { roughness: 0.7 }),
  brick: std(PALETTE.brick, { roughness: 0.85 }),
  wallCream: std(PALETTE.wallCream, { roughness: 0.8 }),
  wallWarm: std(PALETTE.wallWarm, { roughness: 0.8 }),
  accent: std(PALETTE.accentTerracotta, { roughness: 0.7 }),
  brass: std(PALETTE.brass, { roughness: 0.4, metalness: 0.7 }),
  soundstage: std(PALETTE.soundstage, { roughness: 0.65, metalness: 0.15 }),
  soundstageDoor: std(PALETTE.soundstageDoor, { roughness: 0.6, metalness: 0.25 }),
  darkMetal: std(PALETTE.darkMetal, { roughness: 0.45, metalness: 0.7 }),
  glass: std(PALETTE.glass, { roughness: 0.15, metalness: 0.1, transparent: true, opacity: 0.5, envMapIntensity: 0.8 }),
  foliage: std(PALETTE.foliage, { roughness: 1 }),
  foliageLight: std(PALETTE.foliageLight, { roughness: 1 }),
  trunk: std(PALETTE.trunk, { roughness: 1 }),
  crate: std(PALETTE.crate, { roughness: 0.85 }),
  tarp: std(PALETTE.tarpBlue, { roughness: 0.8 }),
  roofFelt: std(PALETTE.roofFelt, { roughness: 0.95 }),
  signDark: std(PALETTE.signDark, { roughness: 0.6 }),
}

/** A CanvasTexture with drawn text — offline-safe readable signage / stage numbers / banners.
 *  Uses the browser 2D canvas (system fonts), so no external font fetch (headless-capture safe). */
export function makeSignTexture(
  text: string,
  opts: { bg?: string; fg?: string; w?: number; h?: number; font?: string; sub?: string } = {},
): THREE.CanvasTexture {
  const w = opts.w ?? 1024
  const h = opts.h ?? 256
  const c = document.createElement('canvas')
  c.width = w; c.height = h
  const g = c.getContext('2d')!
  g.fillStyle = opts.bg ?? PALETTE.signDark
  g.fillRect(0, 0, w, h)
  // thin inner border for a finished sign look
  g.strokeStyle = opts.fg ?? PALETTE.signGold
  g.lineWidth = Math.max(4, h * 0.03)
  g.strokeRect(g.lineWidth, g.lineWidth, w - g.lineWidth * 2, h - g.lineWidth * 2)
  g.fillStyle = opts.fg ?? PALETTE.signGold
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  g.font = opts.font ?? `700 ${Math.floor(h * (opts.sub ? 0.38 : 0.5))}px ui-sans-serif, Georgia, serif`
  g.fillText(text, w / 2, opts.sub ? h * 0.4 : h / 2)
  if (opts.sub) {
    g.font = `500 ${Math.floor(h * 0.16)}px ui-sans-serif, sans-serif`
    g.fillText(opts.sub, w / 2, h * 0.72)
  }
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  return tex
}

/** Material carrying a text sign on its front face. */
export function signMaterial(text: string, opts?: Parameters<typeof makeSignTexture>[1]): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ map: makeSignTexture(text, opts), roughness: 0.55, metalness: 0.05 })
}
