// ── Procedural studio signage (D1-A, Concept A — Golden Age Deco) ────────────────
//
// Original procedural signage with a deliberate VISUAL HIERARCHY (D1-A revision):
//   • primary landmarks — the Studio Gate banner, the Stage A/B facade identifiers, and
//     the Theater marquee canopy — are large and building-mounted;
//   • secondary/tertiary department plaques are smaller orientation labels.
// All drawn from the manifest palette; all reduced-motion safe (any motion is exposed for
// the scene to gate behind its `motion` multiplier). No external art, no bitmap fonts — the
// two shared system-font stacks only. State cues (attention badges) pair a SHAPE + a WORD
// + a colour — never colour alone.
//
// Every function returns a Phaser Container the caller positions/scales.

import type Phaser from 'phaser'
import type { StudioIdentityManifest } from './manifest'
import { hex } from './manifest'

const FONT_SERIF = 'Georgia, "Iowan Old Style", "Times New Roman", serif'
const FONT_SANS = 'Avenir, "Helvetica Neue", Arial, sans-serif'

/** Sign tier — drives size so the lot reads as a hierarchy, not nine identical labels. */
export type SignTier = 'primary' | 'secondary' | 'tertiary'
const TIER_SCALE: Record<SignTier, number> = { primary: 1.5, secondary: 1.12, tertiary: 0.9 }

/** A framed Deco plaque with centered serif lettering (department orientation labels). */
export function makePlaque(
  scene: Phaser.Scene,
  m: StudioIdentityManifest,
  text: string,
  opts: { tier?: SignTier; emphasise?: boolean } = {},
): Phaser.GameObjects.Container {
  const s = TIER_SCALE[opts.tier ?? 'secondary']
  const t = scene.add.text(0, 0, text, {
    fontFamily: FONT_SERIF,
    fontSize: `${Math.round(11 * s)}px`,
    color: hex(m.palette.light),
    fontStyle: 'bold',
  })
  t.setOrigin(0.5, 0.5)
  t.setLetterSpacing?.(1.5)
  const padX = 8 * s
  const w = t.width + padX * 2
  const h = t.height + 6 * s
  const g = scene.add.graphics()
  g.fillStyle(m.palette.dark, 0.94)
  g.fillRoundedRect(-w / 2, -h / 2, w, h, 3)
  g.lineStyle(2, m.palette.primary, 1)
  g.strokeRoundedRect(-w / 2, -h / 2, w, h, 3)
  g.lineStyle(1, m.palette.neutral, 0.6)
  g.strokeRoundedRect(-w / 2 + 2.5, -h / 2 + 2.5, w - 5, h - 5, 2)
  if (opts.emphasise) {
    g.fillStyle(m.palette.accent, 1)
    g.fillRect(-w / 2, -h / 2, 4 * s, 4 * s)
    g.fillRect(w / 2 - 4 * s, h / 2 - 4 * s, 4 * s, 4 * s)
  }
  return scene.add.container(0, 0, [g, t])
}

/** The Studio Gate banner: a large Deco marquee-board bearing the studio wordmark, with a
 * stepped brass frame and burgundy inlay. The emblem is placed by the scene above it. The
 * gate's PRIMARY-landmark treatment — the biggest wordmark on the lot. */
export function makeGateBanner(
  scene: Phaser.Scene,
  m: StudioIdentityManifest,
): Phaser.GameObjects.Container {
  const t = scene.add.text(0, 0, m.displayName, {
    fontFamily: FONT_SERIF,
    fontSize: '19px',
    color: hex(m.palette.light),
    fontStyle: 'bold',
  })
  t.setOrigin(0.5, 0.5)
  t.setLetterSpacing?.(2.5)
  const w = t.width + 34
  const h = t.height + 18
  const g = scene.add.graphics()
  // charcoal board
  g.fillStyle(m.palette.dark, 0.96)
  g.fillRoundedRect(-w / 2, -h / 2, w, h, 4)
  // double brass frame (Deco)
  g.lineStyle(3, m.palette.primary, 1)
  g.strokeRoundedRect(-w / 2, -h / 2, w, h, 4)
  g.lineStyle(1.5, m.palette.neutral, 0.7)
  g.strokeRoundedRect(-w / 2 + 4, -h / 2 + 4, w - 8, h - 8, 3)
  // burgundy inlay rules top + bottom
  g.fillStyle(m.palette.accent, 1)
  g.fillRect(-w / 2 + 6, -h / 2 - 3, w - 12, 3)
  g.fillRect(-w / 2 + 6, h / 2, w - 12, 3)
  // stepped Deco corner blocks
  for (const sx of [-1, 1]) {
    for (const sy of [-1, 1]) {
      g.fillStyle(m.palette.primary, 1)
      g.fillRect((w / 2 - 6) * sx - (sx < 0 ? 0 : 6), (h / 2 - 6) * sy - (sy < 0 ? 0 : 6), 6, 6)
    }
  }
  return scene.add.container(0, 0, [g, t])
}

/** A large Stage identifier mounted on the stage facade: a big serif A/B under a STAGE
 * caption, in a brass-framed charcoal panel with burgundy accent. Reads a stage at the
 * management camera without the companion nav. Identity only — it never signals availability. */
export function makeStageIdentifier(
  scene: Phaser.Scene,
  m: StudioIdentityManifest,
  letter: string,
): Phaser.GameObjects.Container {
  const W = 52
  const H = 60
  const g = scene.add.graphics()
  // charcoal plate
  g.fillStyle(m.palette.dark, 0.95)
  g.fillRoundedRect(-W / 2, -H / 2, W, H, 5)
  // brass Deco frame
  g.lineStyle(3, m.palette.primary, 1)
  g.strokeRoundedRect(-W / 2, -H / 2, W, H, 5)
  g.lineStyle(1.5, m.palette.neutral, 0.6)
  g.strokeRoundedRect(-W / 2 + 4, -H / 2 + 4, W - 8, H - 8, 4)
  // burgundy caption band behind STAGE
  g.fillStyle(m.palette.accent, 1)
  g.fillRect(-W / 2 + 5, -H / 2 + 8, W - 10, 12)
  const c = scene.add.container(0, 0, [g])
  const cap = scene.add.text(0, -H / 2 + 14, 'STAGE', {
    fontFamily: FONT_SANS,
    fontSize: '9px',
    color: hex(m.palette.light),
    fontStyle: 'bold',
  })
  cap.setOrigin(0.5, 0.5)
  cap.setLetterSpacing?.(3)
  const big = scene.add.text(0, 8, letter, {
    fontFamily: FONT_SERIF,
    fontSize: '34px',
    color: hex(m.palette.light),
    fontStyle: 'bold',
  })
  big.setOrigin(0.5, 0.5)
  const shadow = scene.add.text(1.5, 9.5, letter, {
    fontFamily: FONT_SERIF,
    fontSize: '34px',
    color: hex(m.palette.dark),
    fontStyle: 'bold',
  })
  shadow.setOrigin(0.5, 0.5)
  shadow.setAlpha(0.5)
  c.add(shadow)
  c.add(big)
  c.add(cap)
  return c
}

/** The Theater marquee canopy — a primary landmark. A blade canopy silhouette over a
 * burgundy marquee face carrying THEATER and, when a film is present, the release title.
 * Bulbs are exposed via getData('bulbs') for the reduced-motion-gated chase (static all-lit
 * is the reduced-motion equivalent). Reads as a marquee attached to the building. */
export function makeMarquee(
  scene: Phaser.Scene,
  m: StudioIdentityManifest,
  title: string | null,
): Phaser.GameObjects.Container {
  const showing = !!title
  const caption = 'THEATER'
  const capT = scene.add.text(0, 0, caption, {
    fontFamily: FONT_SERIF,
    fontSize: '13px',
    color: hex(m.palette.light),
    fontStyle: 'bold',
  })
  capT.setOrigin(0.5, 0.5)
  capT.setLetterSpacing?.(4)
  const titleT = showing
    ? scene.add.text(0, 0, title!, {
        fontFamily: FONT_SERIF,
        fontSize: '11px',
        color: hex(m.palette.light),
        fontStyle: 'italic',
        align: 'center',
      })
    : null
  titleT?.setOrigin(0.5, 0.5)
  const textW = Math.max(capT.width, titleT?.width ?? 0)
  const w = Math.max(textW + 26, 92)
  const h = (showing ? 34 : 24) + 6
  const g = scene.add.graphics()
  // canopy blade (trapezoid) above the face — the marquee silhouette
  g.fillStyle(m.palette.secondary, 1)
  g.fillPoints(
    [
      { x: -w / 2 - 6, y: -h / 2 - 12 },
      { x: w / 2 + 6, y: -h / 2 - 12 },
      { x: w / 2, y: -h / 2 },
      { x: -w / 2, y: -h / 2 },
    ],
    true,
  )
  g.lineStyle(2, m.palette.primary, 1)
  g.strokePoints(
    [
      { x: -w / 2 - 6, y: -h / 2 - 12 },
      { x: w / 2 + 6, y: -h / 2 - 12 },
      { x: w / 2, y: -h / 2 },
      { x: -w / 2, y: -h / 2 },
    ],
    true,
    true,
  )
  // burgundy marquee face
  g.fillStyle(m.palette.accent, 0.97)
  g.fillRoundedRect(-w / 2, -h / 2, w, h, 4)
  g.lineStyle(2, m.palette.primary, 1)
  g.strokeRoundedRect(-w / 2, -h / 2, w, h, 4)
  const c = scene.add.container(0, 0, [g])
  // bulbs around the top + bottom edges
  const n = Math.max(4, Math.round((m.marquee.bulbDensity * w) / 92))
  const bulbs: Phaser.GameObjects.Arc[] = []
  for (let i = 0; i < n; i++) {
    const fx = -w / 2 + 5 + (i / (n - 1)) * (w - 10)
    for (const by of [-h / 2, h / 2]) {
      const b = scene.add.circle(fx, by, 1.7, m.palette.primary, 1)
      bulbs.push(b)
      c.add(b)
    }
  }
  if (showing) {
    capT.setPosition(0, -h / 2 + 9)
    titleT!.setPosition(0, h / 2 - 9)
    c.add(capT)
    c.add(titleT!)
  } else {
    capT.setPosition(0, 0)
    c.add(capT)
  }
  c.setData('bulbs', bulbs)
  return c
}

/** A restrained Deco entrance band mounted at a building base: a brass bar with a burgundy
 * inlay and stepped end blocks. Spreads the palette onto the architecture without repainting
 * it. Width is caller-provided (scaled to the building footprint). */
export function makeAccentBand(
  scene: Phaser.Scene,
  m: StudioIdentityManifest,
  width: number,
): Phaser.GameObjects.Container {
  const w = Math.max(18, width)
  const g = scene.add.graphics()
  g.fillStyle(m.palette.primary, 1)
  g.fillRect(-w / 2, -3, w, 6)
  g.fillStyle(m.palette.accent, 1)
  g.fillRect(-w / 2 + 3, -1, w - 6, 2)
  // stepped end blocks
  g.fillStyle(m.palette.primary, 1)
  g.fillRect(-w / 2 - 3, -4, 3, 8)
  g.fillRect(w / 2, -4, 3, 8)
  return scene.add.container(0, 0, [g])
}

/** A per-building attention badge: SHAPE + WORD + colour (never colour alone). Renders the
 * snapshot attention states the D1 scene currently leaves unpainted in-canvas. */
export type AttentionKind = 'warning' | 'active' | 'positive'

export function makeAttentionBadge(
  scene: Phaser.Scene,
  m: StudioIdentityManifest,
  kind: AttentionKind,
): Phaser.GameObjects.Container {
  const spec: Record<AttentionKind, { color: number; word: string }> = {
    warning: { color: m.palette.warning, word: 'ATTENTION' },
    active: { color: m.palette.primary, word: 'ACTIVE' },
    positive: { color: m.palette.positive, word: 'RELEASE' },
  }
  const { color, word } = spec[kind]
  const t = scene.add.text(9, 0, word, {
    fontFamily: FONT_SANS,
    fontSize: '9px',
    color: hex(m.palette.light),
    fontStyle: 'bold',
  })
  t.setOrigin(0, 0.5)
  const w = t.width + 20
  const h = 14
  const g = scene.add.graphics()
  g.fillStyle(m.palette.dark, 0.92)
  g.fillRoundedRect(-4, -h / 2, w, h, 3)
  g.lineStyle(1.5, color, 1)
  g.strokeRoundedRect(-4, -h / 2, w, h, 3)
  if (kind === 'warning') {
    g.fillStyle(color, 1)
    g.fillTriangle(1, 4, 5, -4, 9, 4)
  } else if (kind === 'active') {
    g.lineStyle(1.5, color, 1)
    g.strokeCircle(5, 0, 3.5)
    g.fillStyle(color, 1)
    g.fillCircle(5, 0, 1.3)
  } else {
    g.lineStyle(1.6, color, 1)
    g.beginPath()
    g.moveTo(2, 0)
    g.lineTo(4.5, 3)
    g.lineTo(9, -3.5)
    g.strokePath()
  }
  return scene.add.container(0, 0, [g, t])
}
