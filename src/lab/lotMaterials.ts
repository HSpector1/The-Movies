// Asset Lab 04 — procedural material family for the REFINED STUDIO LOT (isolated Scene F).
//
// Self-contained and OFFLINE/DETERMINISTIC: every texture is drawn to an HTML canvas (CPU raster,
// headless-capture safe); all variation uses a seeded PRNG (mulberry32) — NEVER Math.random. This
// module ADDS a brick / board-and-batten wood / troweled-stucco / terracotta-tile family in the
// SAME canvas + height→normal technique proven in Lab 03, so the new-asset footprint stays ZERO.
// It leaves the Lab 02 (materials.ts) and Lab 03 (heroMaterials.ts) families byte-untouched and
// reuses their shared instances (HM/M) + the iconic warm palette.
import * as THREE from 'three'
import { mulberry32, HM, HERO } from './heroMaterials'
import { signMaterial, M, PALETTE } from './materials'

export { mulberry32, signMaterial, HM, M, HERO, PALETTE }

// ---------------------------------------------------------------------------- canvas helpers
const cv = (w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] => {
  const c = document.createElement('canvas'); c.width = w; c.height = h
  return [c, c.getContext('2d')!]
}
function tex(c: HTMLCanvasElement, colorSpace: THREE.ColorSpace, repeat: [number, number] = [1, 1]): THREE.CanvasTexture {
  const t = new THREE.CanvasTexture(c)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(repeat[0], repeat[1])
  t.colorSpace = colorSpace
  t.anisotropy = 8
  t.needsUpdate = true
  return t
}
/** Grayscale HEIGHT canvas → tangent-space (OpenGL +Y) normal map canvas, seamless (wrapped). */
function heightToNormal(height: HTMLCanvasElement, strength = 2.0): HTMLCanvasElement {
  const w = height.width, h = height.height
  const src = height.getContext('2d')!.getImageData(0, 0, w, h).data
  const [out, og] = cv(w, h)
  const dst = og.createImageData(w, h)
  const at = (x: number, y: number): number => src[(((y + h) % h) * w + ((x + w) % w)) * 4] / 255
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const dx = (at(x + 1, y) - at(x - 1, y)) * strength
    const dy = (at(x, y + 1) - at(x, y - 1)) * strength
    const inv = 1 / Math.hypot(-dx, -dy, 1)
    const i = (y * w + x) * 4
    dst.data[i] = (-dx * inv * 0.5 + 0.5) * 255
    dst.data[i + 1] = (-dy * inv * 0.5 + 0.5) * 255
    dst.data[i + 2] = inv * 255
    dst.data[i + 3] = 255
  }
  og.putImageData(dst, 0, 0)
  return out
}

// ---------------------------------------------------------------------------- brick (masonry)
function brickCanvases(base: string, res = 512): { albedo: HTMLCanvasElement; height: HTMLCanvasElement } {
  const [a, ga] = cv(res, res)
  const [hgt, gh] = cv(res, res)
  ga.fillStyle = base; ga.fillRect(0, 0, res, res)
  gh.fillStyle = '#8a8a8a'; gh.fillRect(0, 0, res, res)            // brick faces mid-height
  const rows = 12, bh = res / rows, bw = res / 6
  const rnd = mulberry32(0x8b1c)
  const c0 = new THREE.Color(base)
  for (let r = 0; r < rows; r++) {
    const y = r * bh
    const off = (r % 2) * bw * 0.5
    for (let bx = -1; bx < 7; bx++) {
      const x = bx * bw + off
      const j = (rnd() - 0.5) * 0.16
      const col = c0.clone().offsetHSL((rnd() - 0.5) * 0.02, (rnd() - 0.5) * 0.06, j)
      ga.fillStyle = '#' + col.getHexString()
      ga.fillRect(x + 1, y + 1, bw - 2, bh - 2)
      gh.fillStyle = `rgba(255,255,255,${0.25 + rnd() * 0.2})`
      gh.fillRect(x + 2, y + 2, bw - 4, bh - 4)                    // proud brick
    }
  }
  // mortar grooves (dark, recessed)
  ga.strokeStyle = 'rgba(30,26,22,0.5)'; ga.lineWidth = res * 0.006
  gh.strokeStyle = 'rgba(0,0,0,0.85)'; gh.lineWidth = res * 0.01
  for (let r = 0; r <= rows; r++) { const y = r * bh; ga.beginPath(); ga.moveTo(0, y); ga.lineTo(res, y); ga.stroke(); gh.beginPath(); gh.moveTo(0, y); gh.lineTo(res, y); gh.stroke() }
  for (let r = 0; r < rows; r++) { const off = (r % 2) * bw * 0.5; for (let bx = 0; bx < 7; bx++) { const x = bx * bw + off; ga.beginPath(); ga.moveTo(x, r * bh); ga.lineTo(x, (r + 1) * bh); ga.stroke(); gh.beginPath(); gh.moveTo(x, r * bh); gh.lineTo(x, (r + 1) * bh); gh.stroke() } }
  // base-of-wall grime gradient (bottom = darker), unifies with the other families
  const grime = ga.createLinearGradient(0, res, 0, res * 0.65)
  grime.addColorStop(0, 'rgba(30,24,18,0.35)'); grime.addColorStop(1, 'rgba(30,24,18,0)')
  ga.fillStyle = grime; ga.fillRect(0, res * 0.65, res, res * 0.35)
  return { albedo: a, height: hgt }
}

// ---------------------------------------------------------------------------- board-and-batten wood
function woodCanvases(base: string, res = 512): { albedo: HTMLCanvasElement; height: HTMLCanvasElement } {
  const [a, ga] = cv(res, res)
  const [hgt, gh] = cv(res, res)
  ga.fillStyle = base; ga.fillRect(0, 0, res, res)
  gh.fillStyle = '#7a7a7a'; gh.fillRect(0, 0, res, res)
  const planks = 8, pw = res / planks
  const rnd = mulberry32(0x3d77)
  const c0 = new THREE.Color(base)
  for (let p = 0; p < planks; p++) {
    const x = p * pw
    const col = c0.clone().offsetHSL(0, (rnd() - 0.5) * 0.03, (rnd() - 0.5) * 0.1)
    ga.fillStyle = '#' + col.getHexString(); ga.fillRect(x, 0, pw, res)
    // faint vertical grain streaks
    ga.strokeStyle = 'rgba(0,0,0,0.05)'; ga.lineWidth = 1
    for (let s = 0; s < 5; s++) { const sx = x + rnd() * pw; ga.beginPath(); ga.moveTo(sx, 0); ga.lineTo(sx + (rnd() - 0.5) * 6, res); ga.stroke() }
    gh.fillStyle = `rgba(255,255,255,${0.15 + rnd() * 0.15})`; gh.fillRect(x + 1, 0, pw - 2, res)
  }
  // battens (proud vertical strips over each seam)
  for (let p = 0; p <= planks; p++) {
    const x = p * pw
    ga.fillStyle = 'rgba(0,0,0,0.12)'; ga.fillRect(x - res * 0.012, 0, res * 0.024, res)
    gh.fillStyle = 'rgba(255,255,255,0.95)'; gh.fillRect(x - res * 0.012, 0, res * 0.024, res)
  }
  return { albedo: a, height: hgt }
}

// ---------------------------------------------------------------------------- troweled stucco
function stuccoCanvas(base: string, res = 512): { albedo: HTMLCanvasElement; height: HTMLCanvasElement } {
  const [a, ga] = cv(res, res)
  const [hgt, gh] = cv(res, res)
  ga.fillStyle = base; ga.fillRect(0, 0, res, res)
  gh.fillStyle = '#808080'; gh.fillRect(0, 0, res, res)
  const rnd = mulberry32(0x5ac0)
  for (let i = 0; i < 300; i++) {                                  // troweled mottle
    const x = rnd() * res, y = rnd() * res, r = 6 + rnd() * 22
    ga.globalAlpha = 0.02 + rnd() * 0.03; ga.fillStyle = rnd() > 0.5 ? '#ffffff' : '#000000'
    ga.beginPath(); ga.arc(x, y, r, 0, Math.PI * 2); ga.fill()
    gh.globalAlpha = 0.06 + rnd() * 0.06; gh.fillStyle = rnd() > 0.5 ? '#ffffff' : '#000000'
    gh.beginPath(); gh.arc(x, y, r, 0, Math.PI * 2); gh.fill()
  }
  ga.globalAlpha = 1; gh.globalAlpha = 1
  const grime = ga.createLinearGradient(0, res, 0, res * 0.7)
  grime.addColorStop(0, 'rgba(40,32,24,0.28)'); grime.addColorStop(1, 'rgba(40,32,24,0)')
  ga.fillStyle = grime; ga.fillRect(0, res * 0.7, res, res * 0.3)
  return { albedo: a, height: hgt }
}

// ---------------------------------------------------------------------------- terracotta barrel-tile roof
function terracottaCanvas(base: string, res = 512): { albedo: HTMLCanvasElement; height: HTMLCanvasElement } {
  const [a, ga] = cv(res, res)
  const [hgt, gh] = cv(res, res)
  ga.fillStyle = base; ga.fillRect(0, 0, res, res)
  gh.fillStyle = '#404040'; gh.fillRect(0, 0, res, res)
  const cols = 14, tw = res / cols
  const rnd = mulberry32(0x7717)
  const c0 = new THREE.Color(base)
  for (let cix = 0; cix < cols; cix++) {
    const x = cix * tw
    const col = c0.clone().offsetHSL((rnd() - 0.5) * 0.02, (rnd() - 0.5) * 0.05, (rnd() - 0.5) * 0.1)
    ga.fillStyle = '#' + col.getHexString(); ga.fillRect(x, 0, tw, res)
    // barrel highlight/shadow across each tile column (rounded relief)
    const g = ga.createLinearGradient(x, 0, x + tw, 0)
    g.addColorStop(0, 'rgba(0,0,0,0.28)'); g.addColorStop(0.5, 'rgba(255,255,255,0.18)'); g.addColorStop(1, 'rgba(0,0,0,0.3)')
    ga.fillStyle = g; ga.fillRect(x, 0, tw, res)
    const gh2 = gh.createLinearGradient(x, 0, x + tw, 0)
    gh2.addColorStop(0, '#101010'); gh2.addColorStop(0.5, '#e0e0e0'); gh2.addColorStop(1, '#101010')
    gh.fillStyle = gh2; gh.fillRect(x, 0, tw, res)
  }
  // horizontal tile-course shadow lines
  ga.strokeStyle = 'rgba(20,12,8,0.35)'; ga.lineWidth = res * 0.006
  for (let r = 1; r < 8; r++) { const y = (r / 8) * res; ga.beginPath(); ga.moveTo(0, y); ga.lineTo(res, y); ga.stroke() }
  return { albedo: a, height: hgt }
}

// ---------------------------------------------------------------------------- palette (from art-direction spec)
export const LOT = {
  stuccoCream: '#e7d7bb', stuccoWarm: '#d9b98f', stuccoOchre: '#e3c88e', stuccoSage: '#c6c3a0',
  deco: '#efe6d2', decoBand: '#d8c9a8', terracotta: '#b45f3c', teal: '#3e6b63', gold: '#c9a24a',
  brick: '#9c5a44', brickPale: '#a55e48', aubergine: '#5a3e52', coral: '#d98c6a',
  woodCream: '#d8c9a8', woodRed: '#a5352a', woodGreen: '#7f8a6a', woodBrace: '#8a6b44',
  tileRoot: '#b06a4a', shingle: '#8a857a', trim: '#f5efe0', barnRed: '#8c4a3b',
} as const

const std = (color: string, o: Partial<THREE.MeshStandardMaterialParameters> = {}): THREE.MeshStandardMaterial =>
  new THREE.MeshStandardMaterial({ color: new THREE.Color(color), roughness: 0.9, metalness: 0, ...o })

// ---------------------------------------------------------------------------- built maps (once, shared)
const brickC = brickCanvases(LOT.brick, 512)
const brickMap = tex(brickC.albedo, THREE.SRGBColorSpace, [3, 2])
const brickNrm = tex(heightToNormal(brickC.height, 1.6), THREE.NoColorSpace, [3, 2])
const woodC = woodCanvases(LOT.woodCream, 512)
const woodMap = tex(woodC.albedo, THREE.SRGBColorSpace, [2, 2])
const woodNrm = tex(heightToNormal(woodC.height, 1.8), THREE.NoColorSpace, [2, 2])
const stuccoC = stuccoCanvas(LOT.stuccoCream, 512)
const stuccoMap = tex(stuccoC.albedo, THREE.SRGBColorSpace, [2, 2])
const stuccoNrm = tex(heightToNormal(stuccoC.height, 0.7), THREE.NoColorSpace, [2, 2])
const tileC = terracottaCanvas(LOT.tileRoot, 512)
const tileMap = tex(tileC.albedo, THREE.SRGBColorSpace, [4, 4])
const tileNrm = tex(heightToNormal(tileC.height, 1.4), THREE.NoColorSpace, [4, 4])

// ---------------------------------------------------------------------------- lot material family (shared)
export const LM = {
  brick: std(LOT.brick, { map: brickMap, normalMap: brickNrm, roughness: 0.9, envMapIntensity: 0.6 }),
  brickPale: std(LOT.brickPale, { map: brickMap, normalMap: brickNrm, roughness: 0.9, envMapIntensity: 0.6, color: new THREE.Color(LOT.brickPale) }),
  wood: std(LOT.woodCream, { map: woodMap, normalMap: woodNrm, roughness: 0.85, envMapIntensity: 0.4 }),
  woodRed: std(LOT.woodRed, { map: woodMap, normalMap: woodNrm, roughness: 0.85, color: new THREE.Color(LOT.woodRed), envMapIntensity: 0.4 }),
  woodGreen: std(LOT.woodGreen, { map: woodMap, normalMap: woodNrm, roughness: 0.85, color: new THREE.Color(LOT.woodGreen), envMapIntensity: 0.4 }),
  woodBrace: std(LOT.woodBrace, { roughness: 1 }),
  stucco: std(LOT.stuccoCream, { map: stuccoMap, normalMap: stuccoNrm, roughness: 0.92, envMapIntensity: 0.5 }),
  stuccoWarm: std(LOT.stuccoWarm, { map: stuccoMap, normalMap: stuccoNrm, roughness: 0.92, color: new THREE.Color(LOT.stuccoWarm), envMapIntensity: 0.5 }),
  stuccoOchre: std(LOT.stuccoOchre, { map: stuccoMap, normalMap: stuccoNrm, roughness: 0.92, color: new THREE.Color(LOT.stuccoOchre), envMapIntensity: 0.5 }),
  stuccoSage: std(LOT.stuccoSage, { map: stuccoMap, normalMap: stuccoNrm, roughness: 0.92, color: new THREE.Color(LOT.stuccoSage), envMapIntensity: 0.5 }),
  deco: std(LOT.deco, { map: stuccoMap, normalMap: stuccoNrm, roughness: 0.9, color: new THREE.Color(LOT.deco), envMapIntensity: 0.5 }),
  decoBand: std(LOT.decoBand, { roughness: 0.85 }),
  terracotta: std(LOT.terracotta, { roughness: 0.75, envMapIntensity: 0.6 }),
  tile: std(LOT.tileRoot, { map: tileMap, normalMap: tileNrm, roughness: 0.8, envMapIntensity: 0.7 }),
  teal: std(LOT.teal, { roughness: 0.7 }),
  coral: std(LOT.coral, { roughness: 0.75 }),
  aubergine: std(LOT.aubergine, { roughness: 0.6 }),
  gold: std(LOT.gold, { roughness: 0.4, metalness: 0.6, envMapIntensity: 1.1 }),
  shingle: std(LOT.shingle, { roughness: 0.95 }),
  trim: std(LOT.trim, { roughness: 0.8 }),
  barnRed: std(LOT.barnRed, { roughness: 0.6, metalness: 0.2, envMapIntensity: 0.8 }),
  concrete: M.concrete, sidewalk: M.sidewalk, asphalt: M.asphalt, curbPaint: M.curbPaint,
  darkMetal: HM.darkMetal, galv: HM.galv, brass: M.brass, glass: M.glass,
  wallCorrugated: HM.wall, roofMetal: HM.roof, foliage: M.foliage, foliageLight: M.foliageLight, trunk: M.trunk,
}

/** Emissive practical (marquee bulbs, blade sign, warm windows) — on=false → dark, software-safe. */
export function lotPractical(color: string, emissive: string, intensity: number, on = true): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(color), emissive: new THREE.Color(on ? emissive : '#111'),
    emissiveIntensity: on ? intensity : 0, roughness: 0.5, metalness: 0.1,
  })
}
