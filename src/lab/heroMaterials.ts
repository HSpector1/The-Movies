// Asset Lab 03 — HERO procedural PBR for ONE soundstage + its apron (isolated visual target).
//
// Everything here is DETERMINISTIC and OFFLINE: textures are drawn to an HTML canvas (CPU
// raster, headless-capture safe) and any grain uses a seeded PRNG or pure trig — NEVER
// Math.random. These are SELF-CONTAINED to Scene E: this module imports the Lab 02 signage
// helper but does NOT mutate the Lab 02 material family (src/lab/materials.ts). Scene D stays
// the untouched greybox baseline.
//
// The fidelity delta vs greybox is carried by: (1) procedural normal + roughness maps that
// give corrugated-steel ribs and weathered concrete real surface relief, (2) grime/streak
// baked into the albedo, (3) a warm, tuned MeshStandardMaterial family designed to sit under
// ACES tone mapping + the existing RoomEnvironment IBL.
import * as THREE from 'three'

export { makeSignTexture, signMaterial } from './materials'

// ---------------------------------------------------------------------------- determinism
/** Seeded PRNG (mulberry32). Deterministic — the whole point is byte-reproducible captures. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const canvas = (w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] => {
  const c = document.createElement('canvas')
  c.width = w; c.height = h
  return [c, c.getContext('2d')!]
}

/** Wrap a finished canvas as a tiling data texture in the given color space. */
function tex(c: HTMLCanvasElement, colorSpace: THREE.ColorSpace, repeat: [number, number] = [1, 1]): THREE.CanvasTexture {
  const t = new THREE.CanvasTexture(c)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(repeat[0], repeat[1])
  t.colorSpace = colorSpace
  t.anisotropy = 8
  t.needsUpdate = true
  return t
}

// ---------------------------------------------------------------------------- height→normal
/** Convert a grayscale HEIGHT canvas to a tangent-space (OpenGL, +Y up) normal-map canvas. */
function heightToNormal(height: HTMLCanvasElement, strength = 2.2): HTMLCanvasElement {
  const w = height.width, h = height.height
  const hg = height.getContext('2d')!
  const src = hg.getImageData(0, 0, w, h).data
  const [out, og] = canvas(w, h)
  const dst = og.createImageData(w, h)
  const at = (x: number, y: number): number => {
    const xx = (x + w) % w, yy = (y + h) % h            // wrap → seamless tiling
    return src[(yy * w + xx) * 4] / 255
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = (at(x + 1, y) - at(x - 1, y)) * strength
      const dy = (at(x, y + 1) - at(x, y - 1)) * strength
      // normal = normalize(-dx, -dy, 1)
      const nx = -dx, ny = -dy, nz = 1
      const inv = 1 / Math.hypot(nx, ny, nz)
      const i = (y * w + x) * 4
      dst.data[i] = (nx * inv * 0.5 + 0.5) * 255
      dst.data[i + 1] = (ny * inv * 0.5 + 0.5) * 255
      dst.data[i + 2] = (nz * inv * 0.5 + 0.5) * 255
      dst.data[i + 3] = 255
    }
  }
  og.putImageData(dst, 0, 0)
  return out
}

// ---------------------------------------------------------------------------- corrugated steel
/** A vertical-rib corrugated-metal height field with fine seeded grain (tiles in x). */
function corrugatedHeight(ribs: number, res = 512, grain = 0.06): HTMLCanvasElement {
  const [c, g] = canvas(res, res)
  const rnd = mulberry32(0x5713 + ribs)
  const noise = new Float32Array(res)                    // per-column vertical streak grain
  for (let x = 0; x < res; x++) noise[x] = (rnd() - 0.5) * 2
  const img = g.createImageData(res, res)
  for (let x = 0; x < res; x++) {
    const rib = 0.5 + 0.5 * Math.cos((x / res) * ribs * Math.PI * 2)   // smooth ribs, seamless
    for (let y = 0; y < res; y++) {
      // faint horizontal dents + column grain so the metal isn't a perfect extrusion
      const dent = 0.5 + 0.5 * Math.sin((y / res) * 40 * Math.PI + noise[x] * 3)
      const v = rib * 0.82 + dent * grain + noise[x] * grain * 0.5 + 0.09
      const p = Math.max(0, Math.min(1, v)) * 255
      const i = (y * res + x) * 4
      img.data[i] = img.data[i + 1] = img.data[i + 2] = p
      img.data[i + 3] = 255
    }
  }
  g.putImageData(img, 0, 0)
  return c
}

/** Roughness map matching a corrugated height: rib crests slightly polished, valleys dusty. */
function corrugatedRoughness(ribs: number, res = 512, lo = 0.34, hi = 0.62): HTMLCanvasElement {
  const [c, g] = canvas(res, res)
  const rnd = mulberry32(0x9a11 + ribs)
  const img = g.createImageData(res, res)
  for (let x = 0; x < res; x++) {
    const crest = 0.5 + 0.5 * Math.cos((x / res) * ribs * Math.PI * 2)
    for (let y = 0; y < res; y++) {
      const grime = (rnd() - 0.5) * 0.08
      const r = Math.max(0, Math.min(1, hi - (hi - lo) * crest + grime)) * 255
      const i = (y * res + x) * 4
      img.data[i] = img.data[i + 1] = img.data[i + 2] = r
      img.data[i + 3] = 255
    }
  }
  g.putImageData(img, 0, 0)
  return c
}

// ---------------------------------------------------------------------------- painted stage wall
/** Weathered painted-steel wall albedo: base color, base-of-wall grime gradient, faint streaks. */
function wallAlbedo(base: string, res = 512): HTMLCanvasElement {
  const [c, g] = canvas(res, res)
  g.fillStyle = base; g.fillRect(0, 0, res, res)
  // faint large-scale patchiness so the paint isn't a flat fill (subtle — not grime blotches)
  const rnd = mulberry32(0x1234)
  for (let i = 0; i < 42; i++) {
    const x = rnd() * res, y = rnd() * res, r = 18 + rnd() * 62
    g.globalAlpha = 0.022 + rnd() * 0.035
    g.fillStyle = rnd() > 0.62 ? '#000000' : '#ffffff'
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill()
  }
  // rusty/water streaks descending (drip lines) — authored columns, deterministic
  g.globalAlpha = 1
  const streaks = [0.14, 0.36, 0.58, 0.8]
  for (const sx of streaks) {
    const x = sx * res, wgt = 2 + Math.floor(rnd() * 4)
    const grad = g.createLinearGradient(0, 0, 0, res)
    grad.addColorStop(0, 'rgba(70,50,32,0.0)')
    grad.addColorStop(0.2, 'rgba(70,50,32,0.09)')
    grad.addColorStop(1, 'rgba(52,38,26,0.19)')
    g.fillStyle = grad
    g.fillRect(x, 0, wgt, res)
  }
  // grime rising from the ground (bottom of the texture = base of the wall)
  const gg = g.createLinearGradient(0, res, 0, res * 0.6)
  gg.addColorStop(0, 'rgba(30,24,18,0.5)')
  gg.addColorStop(1, 'rgba(30,24,18,0.0)')
  g.fillStyle = gg; g.fillRect(0, res * 0.6, res, res * 0.4)
  return c
}

// ---------------------------------------------------------------------------- concrete apron
/** Board-formed concrete albedo with expansion joints, mottling, oil stains, worn threshold. */
function concreteAlbedo(base: string, res = 1024): HTMLCanvasElement {
  const [c, g] = canvas(res, res)
  g.fillStyle = base; g.fillRect(0, 0, res, res)
  const rnd = mulberry32(0xc04c)
  // value-noise mottling
  for (let i = 0; i < 900; i++) {
    const x = rnd() * res, y = rnd() * res, r = 8 + rnd() * 48
    g.globalAlpha = 0.03 + rnd() * 0.05
    g.fillStyle = rnd() > 0.5 ? '#ffffff' : '#20201c'
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill()
  }
  g.globalAlpha = 1
  // expansion-joint grid (control joints every ~1/4 texture)
  g.strokeStyle = 'rgba(20,18,15,0.55)'; g.lineWidth = 3
  for (let k = 1; k < 4; k++) {
    g.beginPath(); g.moveTo((k / 4) * res, 0); g.lineTo((k / 4) * res, res); g.stroke()
    g.beginPath(); g.moveTo(0, (k / 4) * res); g.lineTo(res, (k / 4) * res); g.stroke()
  }
  // oil / hydraulic stains
  for (const [sx, sy, sr] of [[0.32, 0.66, 60], [0.6, 0.38, 44], [0.72, 0.72, 30]] as const) {
    const grad = g.createRadialGradient(sx * res, sy * res, 2, sx * res, sy * res, sr)
    grad.addColorStop(0, 'rgba(24,20,16,0.5)')
    grad.addColorStop(1, 'rgba(24,20,16,0.0)')
    g.fillStyle = grad
    g.beginPath(); g.arc(sx * res, sy * res, sr, 0, Math.PI * 2); g.fill()
  }
  return c
}

function concreteRoughness(res = 1024): HTMLCanvasElement {
  const [c, g] = canvas(res, res)
  g.fillStyle = '#d8d8d8'; g.fillRect(0, 0, res, res)      // fairly rough concrete (~0.85)
  const rnd = mulberry32(0x7ea1)
  for (let i = 0; i < 700; i++) {
    const x = rnd() * res, y = rnd() * res, r = 10 + rnd() * 60
    g.globalAlpha = 0.05 + rnd() * 0.08
    g.fillStyle = rnd() > 0.5 ? '#ffffff' : '#8a8a8a'
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill()
  }
  // a slightly polished/damp patch → darker (lower roughness) spec highlight at golden hour
  g.globalAlpha = 1
  const grad = g.createRadialGradient(res * 0.44, res * 0.6, 4, res * 0.44, res * 0.6, res * 0.14)
  grad.addColorStop(0, 'rgba(70,70,70,0.9)')
  grad.addColorStop(1, 'rgba(216,216,216,0.0)')
  g.fillStyle = grad
  g.beginPath(); g.arc(res * 0.44, res * 0.6, res * 0.14, 0, Math.PI * 2); g.fill()
  return c
}

// ---------------------------------------------------------------------------- painted decals
/** A tiling yellow hazard-hatch texture on transparent ground (fire-lane / keep-clear paint). */
export function hazardTexture(label = '', res = 512): THREE.CanvasTexture {
  const [c, g] = canvas(res, res)
  g.clearRect(0, 0, res, res)
  g.strokeStyle = '#d8b14a'; g.lineWidth = res * 0.09
  for (let i = -res; i < res * 2; i += res * 0.22) {
    g.beginPath(); g.moveTo(i, 0); g.lineTo(i + res, res); g.stroke()
  }
  // worn edges: subtract a little
  g.globalCompositeOperation = 'destination-out'
  const rnd = mulberry32(0x4a2b)
  for (let i = 0; i < 120; i++) {
    g.globalAlpha = 0.15 + rnd() * 0.25
    g.beginPath(); g.arc(rnd() * res, rnd() * res, 3 + rnd() * 10, 0, Math.PI * 2); g.fill()
  }
  g.globalCompositeOperation = 'source-over'
  if (label) {
    g.globalAlpha = 0.9; g.fillStyle = '#d8b14a'
    g.font = `700 ${Math.floor(res * 0.1)}px ui-sans-serif, sans-serif`
    g.textAlign = 'center'; g.textBaseline = 'middle'
    g.fillText(label, res / 2, res / 2)
  }
  const t = new THREE.CanvasTexture(c)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  return t
}

/** Faint chalk/tape ground scrawl decal on transparent ground. */
export function markTexture(text: string, color = '#e4d7a0', res = 256): THREE.CanvasTexture {
  const [c, g] = canvas(res, res)
  g.clearRect(0, 0, res, res)
  g.strokeStyle = color; g.fillStyle = color; g.globalAlpha = 0.85
  g.lineWidth = res * 0.05; g.lineCap = 'round'
  g.font = `700 ${Math.floor(res * 0.5)}px ui-sans-serif, sans-serif`
  g.textAlign = 'center'; g.textBaseline = 'middle'
  g.fillText(text, res / 2, res / 2)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 4
  return t
}

// ---------------------------------------------------------------------------- palette
export const HERO = {
  wall: '#8f8a7c',        // painted galvanized stage wall
  wallDark: '#736d5f',    // shadowed lower band / pilasters
  cornice: '#d8cbb0',     // bright cornice cap that catches the key
  doorSteel: '#565349',   // elephant-door leaves
  doorRib: '#43454c',     // door battens / track
  darkMetal: '#3a3c42',   // header, conduit, hardware
  galv: '#5a5c60',        // galvanised downspouts / vents
  roof: '#847d70',        // barrel roof metal (lifted from flat-black so the arch reads its form)
  concrete: '#b8b2a6',    // warm-neutral apron (corrects Lab 01 red pavement at the root)
  concreteDark: '#8f897d',
  dock: '#b0a99c',
  hazard: '#d8b14a',
  rubber: '#1b1a18',
  cableBlack: '#17161a',
  sandbag: '#8a7f63',
  orange: '#d1622a',
  red: '#a5352a',
  redEye: '#ff2a1a',
  brass: '#bb8a3f',
  crate: '#9a6b3e',
  trunk: '#584635',
  canvasTan: '#6f6653',
  monitorGlass: '#12242c',
} as const

const std = (color: string, o: Partial<THREE.MeshStandardMaterialParameters> = {}): THREE.MeshStandardMaterial =>
  new THREE.MeshStandardMaterial({ color: new THREE.Color(color), roughness: 0.9, metalness: 0, ...o })

// ---------------------------------------------------------------------------- built maps (once)
const wallRibNormal = tex(heightToNormal(corrugatedHeight(46, 512), 1.8), THREE.NoColorSpace, [3, 3])
const wallRibRough = tex(corrugatedRoughness(46, 512), THREE.NoColorSpace, [3, 3])
const doorRibNormal = tex(heightToNormal(corrugatedHeight(10, 512), 3.0), THREE.NoColorSpace, [1, 2])
const doorRibRough = tex(corrugatedRoughness(10, 512, 0.38, 0.6), THREE.NoColorSpace, [1, 2])
const roofRibNormal = tex(heightToNormal(corrugatedHeight(70, 512), 1.4), THREE.NoColorSpace, [8, 2])
const roofRibRough = tex(corrugatedRoughness(70, 512, 0.3, 0.5), THREE.NoColorSpace, [8, 2])
const wallMap = tex(wallAlbedo(HERO.wall, 512), THREE.SRGBColorSpace, [2, 2])
const concreteMap = tex(concreteAlbedo(HERO.concrete, 1024), THREE.SRGBColorSpace, [1, 1])
const concreteRough = tex(concreteRoughness(1024), THREE.NoColorSpace, [1, 1])
const asphaltMap = tex(concreteAlbedo('#3d3831', 1024), THREE.SRGBColorSpace, [5, 5])   // dark, tiled = broad lot asphalt

// ---------------------------------------------------------------------------- hero materials
export const HM = {
  // corrugated painted stage wall — the surface that most sells "clad metal stage"
  wall: std(HERO.wall, {
    map: wallMap, normalMap: wallRibNormal, normalScale: new THREE.Vector2(0.7, 0.7),
    roughnessMap: wallRibRough, roughness: 0.62, metalness: 0.28, envMapIntensity: 1.2,
  }),
  wallPlain: std(HERO.wall, { roughness: 0.7, metalness: 0.22, envMapIntensity: 1.0 }),
  cornice: std(HERO.cornice, { roughness: 0.72, metalness: 0.05, envMapIntensity: 0.7 }),
  pilaster: std(HERO.wallDark, { roughness: 0.7, metalness: 0.2, envMapIntensity: 0.9 }),
  doorLeaf: std(HERO.doorSteel, {
    normalMap: doorRibNormal, normalScale: new THREE.Vector2(1.0, 1.0),
    roughnessMap: doorRibRough, roughness: 0.55, metalness: 0.45, envMapIntensity: 1.4,
  }),
  doorRib: std(HERO.doorRib, { roughness: 0.45, metalness: 0.7, envMapIntensity: 1.3 }),
  header: std(HERO.darkMetal, { roughness: 0.5, metalness: 0.8, envMapIntensity: 1.4 }),
  darkMetal: std(HERO.darkMetal, { roughness: 0.45, metalness: 0.75, envMapIntensity: 1.3 }),
  galv: std(HERO.galv, { roughness: 0.55, metalness: 0.65, envMapIntensity: 1.2 }),
  roof: std(HERO.roof, {
    normalMap: roofRibNormal, normalScale: new THREE.Vector2(0.8, 0.8),
    roughnessMap: roofRibRough, roughness: 0.5, metalness: 0.55, envMapIntensity: 1.3,
  }),
  concrete: std(HERO.concrete, {
    map: concreteMap, roughnessMap: concreteRough, roughness: 0.9, metalness: 0, envMapIntensity: 0.5,
  }),
  asphalt: std('#3d3831', { map: asphaltMap, roughness: 0.97, metalness: 0, envMapIntensity: 0.3 }),
  dock: std(HERO.dock, { roughness: 0.85, metalness: 0, envMapIntensity: 0.5 }),
  rubber: std(HERO.rubber, { roughness: 0.95, metalness: 0 }),
  cable: std(HERO.cableBlack, { roughness: 0.85, metalness: 0.1 }),
  sandbag: std(HERO.sandbag, { roughness: 1, metalness: 0 }),
  sandbagWorn: std('#6f6653', { roughness: 1, metalness: 0 }),
  orange: std(HERO.orange, { roughness: 0.7, metalness: 0 }),
  red: std(HERO.red, { roughness: 0.6, metalness: 0.1 }),
  brass: std(HERO.brass, { roughness: 0.4, metalness: 0.7, envMapIntensity: 1.2 }),
  crate: std(HERO.crate, { roughness: 0.85 }),
  trunk: std(HERO.trunk, { roughness: 1 }),
  canvasTan: std(HERO.canvasTan, { roughness: 1 }),
  glassDark: std('#0e1c22', { roughness: 0.15, metalness: 0.2, envMapIntensity: 1.6 }),
}

/** Emissive practical (film-light lens, red-eye, work light). `on=false` → dark, software-safe. */
export function practical(color: string, emissive: string, intensity: number, on = true): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    emissive: new THREE.Color(on ? emissive : '#111'),
    emissiveIntensity: on ? intensity : 0,
    roughness: 0.4, metalness: 0.2,
  })
}
