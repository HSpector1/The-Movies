// ── Procedural studio signage (D1-A, Concept A — Golden Age Deco) ────────────────
//
// Original procedural plaques, gate wordmark, theater marquee, department signs, and
// per-building attention badges. All drawn from the manifest palette; all reduced-motion
// safe (any motion is exposed for the scene to gate behind its `motion` multiplier). No
// external art, no bitmap fonts — the two shared system-font stacks only.
//
// Every function returns a Phaser Container the caller positions/scales. State cues
// (attention badges) pair a SHAPE + a WORD + a colour — never colour alone.

import type Phaser from 'phaser'
import type { StudioIdentityManifest } from './manifest'
import { hex } from './manifest'

const FONT_SERIF = 'Georgia, "Iowan Old Style", "Times New Roman", serif'
const FONT_SANS = 'Avenir, "Helvetica Neue", Arial, sans-serif'

/** A framed Deco plaque with centered serif lettering. Used for stage plaques + department
 * signs. Horizontal, restrained, enamel/brass read. */
export function makePlaque(
  scene: Phaser.Scene,
  m: StudioIdentityManifest,
  text: string,
  opts: { size?: number; emphasise?: boolean } = {},
): Phaser.GameObjects.Container {
  const s = opts.size ?? 1
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
  // dark enamel ground
  g.fillStyle(m.palette.dark, 0.94)
  g.fillRoundedRect(-w / 2, -h / 2, w, h, 3)
  // brass frame (double rule = Deco)
  g.lineStyle(2, m.palette.primary, 1)
  g.strokeRoundedRect(-w / 2, -h / 2, w, h, 3)
  g.lineStyle(1, m.palette.neutral, 0.6)
  g.strokeRoundedRect(-w / 2 + 2.5, -h / 2 + 2.5, w - 5, h - 5, 2)
  // burgundy accent corners
  if (opts.emphasise) {
    g.fillStyle(m.palette.accent, 1)
    g.fillRect(-w / 2, -h / 2, 4 * s, 4 * s)
    g.fillRect(w / 2 - 4 * s, h / 2 - 4 * s, 4 * s, 4 * s)
  }
  return scene.add.container(0, 0, [g, t])
}

/** The gate wordmark: the studio display name in a Deco frame. The emblem is placed
 * separately by the scene. */
export function makeGateWordmark(
  scene: Phaser.Scene,
  m: StudioIdentityManifest,
): Phaser.GameObjects.Container {
  const t = scene.add.text(0, 0, m.displayName, {
    fontFamily: FONT_SERIF,
    fontSize: '13px',
    color: hex(m.palette.light),
    fontStyle: 'bold',
  })
  t.setOrigin(0.5, 0.5)
  t.setLetterSpacing?.(2)
  const w = t.width + 18
  const g = scene.add.graphics()
  // a slim brass rule above and below the wordmark (Deco banner)
  g.lineStyle(2, m.palette.primary, 1)
  g.beginPath()
  g.moveTo(-w / 2, -9)
  g.lineTo(w / 2, -9)
  g.moveTo(-w / 2, 9)
  g.lineTo(w / 2, 9)
  g.strokePath()
  // burgundy end-caps
  g.fillStyle(m.palette.accent, 1)
  g.fillCircle(-w / 2, 0, 2.5)
  g.fillCircle(w / 2, 0, 2.5)
  return scene.add.container(0, 0, [g, t])
}

/** The theater marquee face: a Deco border with bulbs and the title/emblem text. Bulbs are
 * exposed via container.getData('bulbs') so the scene can run a gentle deterministic chase
 * gated behind reduced-motion; the static state (all lit) IS the reduced-motion equivalent. */
export function makeMarquee(
  scene: Phaser.Scene,
  m: StudioIdentityManifest,
  title: string,
): Phaser.GameObjects.Container {
  const label = title || m.signage.theaterLabel
  const t = scene.add.text(0, 0, label, {
    fontFamily: FONT_SERIF,
    fontSize: '11px',
    color: hex(m.palette.light),
    fontStyle: 'bold',
    align: 'center',
  })
  t.setOrigin(0.5, 0.5)
  t.setLetterSpacing?.(1)
  const w = Math.max(t.width + 22, 60)
  const h = t.height + 14
  const g = scene.add.graphics()
  g.fillStyle(m.palette.accent, 0.96) // burgundy marquee ground
  g.fillRoundedRect(-w / 2, -h / 2, w, h, 4)
  g.lineStyle(2, m.palette.primary, 1)
  g.strokeRoundedRect(-w / 2, -h / 2, w, h, 4)
  const c = scene.add.container(0, 0, [g])
  // bulbs around the perimeter (deterministic count from manifest.bulbDensity)
  const n = Math.max(3, Math.round(m.marquee.bulbDensity))
  const bulbs: Phaser.GameObjects.Arc[] = []
  for (let i = 0; i < n; i++) {
    const fx = -w / 2 + 5 + (i / (n - 1)) * (w - 10)
    for (const by of [-h / 2, h / 2]) {
      const b = scene.add.circle(fx, by, 1.6, m.palette.primary, 1)
      bulbs.push(b)
      c.add(b)
    }
  }
  c.add(t)
  c.setData('bulbs', bulbs)
  return c
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
  // shape icon (distinct per kind — shape carries meaning without colour)
  if (kind === 'warning') {
    g.fillStyle(color, 1)
    g.fillTriangle(1, 4, 5, -4, 9, 4) // triangle = warning
  } else if (kind === 'active') {
    g.lineStyle(1.5, color, 1)
    g.strokeCircle(5, 0, 3.5) // ring = active/lit
    g.fillStyle(color, 1)
    g.fillCircle(5, 0, 1.3)
  } else {
    g.lineStyle(1.6, color, 1) // check = release/positive
    g.beginPath()
    g.moveTo(2, 0)
    g.lineTo(4.5, 3)
    g.lineTo(9, -3.5)
    g.strokePath()
  }
  return scene.add.container(0, 0, [g, t])
}
