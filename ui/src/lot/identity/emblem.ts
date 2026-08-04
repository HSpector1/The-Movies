// ── Procedural studio emblem (D1-A) ──────────────────────────────────────────────
//
// An ORIGINAL, procedurally-drawn emblem — no downloaded logo, no lion/mountain/globe/
// torch/castle/shield-crest resembling a commercial studio. Concept A ("crest") is an
// Art-Deco spotlight-and-monogram device: a stepped geometric frame, restrained spotlight
// rays, a horizontal deco bar, and the studio monogram in the shared serif face.
//
// Everything is drawn from the manifest palette so a name/colour change never touches this
// code. It reads at the default camera, stays legible in grayscale (shape + value, not only
// colour), and carries no motion (safe under reduced motion). Returns a Phaser Container the
// caller positions/scales; `radius` is the emblem's half-size in px at scale 1.

import type Phaser from 'phaser'
import type { StudioIdentityManifest } from './manifest'
import { hex } from './manifest'

const FONT_SERIF = 'Georgia, "Iowan Old Style", "Times New Roman", serif'

export type EmblemOptions = {
  radius?: number // half-size in px (default 26)
  showMonogram?: boolean // default true
  grayscale?: boolean // draw with value-only palette (for the grayscale legibility proof)
}

/** Draw the Concept-A emblem into a new Container. Deterministic; no motion, no rng. */
export function drawEmblem(
  scene: Phaser.Scene,
  m: StudioIdentityManifest,
  opts: EmblemOptions = {},
): Phaser.GameObjects.Container {
  const r = opts.radius ?? 26
  const gray = opts.grayscale === true
  // value-preserving grayscale so the emblem proves out without colour
  const primary = gray ? 0xd8d8d8 : m.palette.primary
  const light = gray ? 0xf2f2f2 : m.palette.light
  const dark = gray ? 0x161616 : m.palette.dark
  const accent = gray ? 0x8a8a8a : m.palette.accent
  const lw = m.emblem.lineWeight

  const c = scene.add.container(0, 0)
  const g = scene.add.graphics()

  // ground disc (dark) — grounds the emblem on any building face
  g.fillStyle(dark, 0.92)
  g.fillCircle(0, 0, r * 1.02)

  // spotlight rays (upper hemisphere), restrained — Deco beams from behind the crest
  if (m.emblem.accentMode === 'rays') {
    g.fillStyle(primary, 0.16)
    const beams = 5
    for (let i = 0; i < beams; i++) {
      const t = (i - (beams - 1) / 2) / beams
      const a = -Math.PI / 2 + t * 1.15 // fan across the top
      const spread = 0.06
      const far = r * 1.7
      const x1 = Math.cos(a - spread) * far
      const y1 = Math.sin(a - spread) * far
      const x2 = Math.cos(a + spread) * far
      const y2 = Math.sin(a + spread) * far
      g.fillTriangle(0, -2, x1, y1, x2, y2)
    }
  }

  // stepped Deco frame: outer octagon-ish ring + inner ring
  const ringPts = (rad: number, k: number): number[] => {
    const pts: number[] = []
    for (let i = 0; i < 8; i++) {
      const a = -Math.PI / 2 + (i / 8) * Math.PI * 2
      pts.push(Math.cos(a) * rad * k, Math.sin(a) * rad * k)
    }
    return pts
  }
  g.lineStyle(lw + 1, primary, 1)
  g.strokePoints(toPts(ringPts(r, 0.94)), true, true)
  g.lineStyle(lw, light, 0.9)
  g.strokePoints(toPts(ringPts(r, 0.78)), true, true)

  // horizontal Deco bar behind the monogram (accent)
  g.fillStyle(accent, 1)
  g.fillRect(-r * 0.66, -r * 0.1, r * 1.32, r * 0.2)
  g.fillStyle(primary, 1)
  g.fillRect(-r * 0.66, -r * 0.13, r * 1.32, r * 0.03)
  g.fillRect(-r * 0.66, r * 0.1, r * 1.32, r * 0.03)

  c.add(g)

  if (opts.showMonogram !== false) {
    const t = scene.add.text(0, -r * 0.02, m.monogram, {
      fontFamily: FONT_SERIF,
      fontSize: `${Math.round(r * 0.82)}px`,
      color: hex(light),
      fontStyle: 'bold',
    })
    t.setOrigin(0.5, 0.5)
    t.setLetterSpacing?.(1)
    // subtle drop for legibility on light building faces
    const sh = scene.add.text(1, -r * 0.02 + 1, m.monogram, {
      fontFamily: FONT_SERIF,
      fontSize: `${Math.round(r * 0.82)}px`,
      color: hex(dark),
      fontStyle: 'bold',
    })
    sh.setOrigin(0.5, 0.5)
    sh.setAlpha(0.5)
    c.add(sh)
    c.add(t)
  }

  return c
}

// Plain {x,y} vectors (Vector2Like) — Graphics.strokePoints accepts these, so the emblem
// needs no Phaser runtime import (keeps it loadable under jsdom for unit tests).
function toPts(flat: number[]): Array<{ x: number; y: number }> {
  const pts: Array<{ x: number; y: number }> = []
  for (let i = 0; i < flat.length; i += 2) pts.push({ x: flat[i], y: flat[i + 1] })
  return pts
}
