// ── Meridian restyle (palette-swap toward the Meridian visual language) ───────
// Kenney kit models share ONE small palette texture (colormap.png). Remapping that
// texture's hues toward the Meridian anchors recolours the WHOLE kit at once — the
// core "can this family adopt our art direction?" test. Deterministic; no network.
//
// Meridian anchors (from the concept brief): cream stucco, terracotta, buff
// industrial, taupe/brass Deco, signature deep red, sage landscaping. Lightness of
// each source texel is preserved so low-poly shading survives the recolour.

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  let h = 0
  let s = 0
  const d = max - min
  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      default:
        h = ((r - g) / d + 4) / 6
    }
  }
  return [h * 360, s, l]
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h = ((h % 360) + 360) % 360 / 360
  if (s === 0) {
    const v = Math.round(l * 255)
    return [v, v, v]
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q
  const hue = (t: number): number => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }
  return [Math.round(hue(h + 1 / 3) * 255), Math.round(hue(h) * 255), Math.round(hue(h - 1 / 3) * 255)]
}

// map a source (hue, sat) onto a Meridian (hue, sat); source lightness is kept
function meridianHueSat(h: number, s: number): [number, number] {
  if (s < 0.12) return [38, 0.09] // neutrals → warm taupe/cream (lightness carries it)
  if (h >= 345 || h < 20) return s > 0.5 ? [356, 0.6] : [15, 0.5] // reds → deep red / terracotta
  if (h < 50) return [40, 0.42] // yellow/brown → buff / brass
  if (h < 170) return [95, 0.24] // greens → sage
  if (h < 270) return [34, 0.14] // blue/cyan → warm steel-taupe (desaturate cool tones)
  return [12, 0.45] // purple/magenta → terracotta
}

/** Recolour a source image (the kit's colormap) toward Meridian. Returns a canvas. */
export function meridianizeImage(img: CanvasImageSource, w: number, h: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0, w, h)
  const data = ctx.getImageData(0, 0, w, h)
  const px = data.data
  for (let i = 0; i < px.length; i += 4) {
    if (px[i + 3] === 0) continue
    const [sh, ss, sl] = rgbToHsl(px[i], px[i + 1], px[i + 2])
    const [mh, ms] = meridianHueSat(sh, ss)
    // warm-bias the lightness very slightly toward golden-hour
    const l = Math.min(1, sl * 1.02)
    const [r, g, b] = hslToRgb(mh, ms, l)
    px[i] = r
    px[i + 1] = g
    px[i + 2] = b
  }
  ctx.putImageData(data, 0, 0)
  return canvas
}

// per-type tint for map-less assets (e.g. vertex-coloured nature) — multiplies the
// existing vertex colours toward the Meridian anchor for that asset type.
export const MERIDIAN_TINT: Record<string, string> = {
  vegetation: '#8a9a6b', // sage
  building: '#d8cbb0', // cream stucco
  hangar: '#c9bfa2', // buff industrial
  prop: '#b9ad8c', // taupe case
  vehicle: '#9aa39c', // muted steel
  car: '#7a2f2a', // signature deep red (period car)
  humanoid: '#b8a98c', // wardrobe neutral
}
