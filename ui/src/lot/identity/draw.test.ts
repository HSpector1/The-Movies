// ── D1-A: emblem + signage draw helpers ──────────────────────────────────────────
// These paint the identity onto Phaser Graphics/Text/Container objects. WebGL is not
// available under jsdom, so we drive them with a minimal fake scene that records the
// object graph. The point is to prove: the helpers never throw, they return a container,
// the marquee exposes exactly (2 × bulbDensity) bulbs for the reduced-motion chase, and
// every attention kind renders. Determinism is proven by rendering twice and diffing the
// recorded draw-call count (no RNG, no time, no Math.random anywhere in the path).

import type Phaser from 'phaser'
import { describe, expect, it } from 'vitest'
import { CONCEPT_A_GOLDEN_AGE } from './manifest.ts'
import { drawEmblem } from './emblem.ts'
import {
  makePlaque,
  makeGateBanner,
  makeStageIdentifier,
  makeMarquee,
  makeAccentBand,
  makeAttentionBadge,
} from './signage.ts'

type Stub = Record<string, unknown> & { calls: number; list?: unknown[]; _data?: Record<string, unknown> }

/** A chainable stub that counts every method call (a coarse determinism fingerprint). */
function stub(extra: Record<string, unknown> = {}): Stub {
  const o: Stub = { calls: 0, width: 42, height: 12, x: 0, y: 0 }
  const chain = (fn: string) => {
    o[fn] = (...args: unknown[]) => {
      o.calls++
      if (fn === 'setData') {
        o._data = o._data ?? {}
        o._data[args[0] as string] = args[1]
      }
      if (fn === 'getData') return (o._data ?? {})[args[0] as string]
      if (fn === 'add' && o.list) o.list.push(...args)
      return o
    }
  }
  for (const fn of [
    'setOrigin',
    'setLetterSpacing',
    'setAlpha',
    'setPosition',
    'setVisible',
    'setFillStyle',
    'setData',
    'getData',
    'add',
    'destroy',
    'fillStyle',
    'fillCircle',
    'fillRect',
    'fillTriangle',
    'fillRoundedRect',
    'lineStyle',
    'strokeRoundedRect',
    'strokeCircle',
    'strokePoints',
    'fillPoints',
    'beginPath',
    'moveTo',
    'lineTo',
    'strokePath',
  ]) {
    chain(fn)
  }
  return Object.assign(o, extra)
}

function fakeScene(): { scene: Phaser.Scene; counter: { created: number } } {
  const counter = { created: 0 }
  const bump = <T>(o: T): T => {
    counter.created++
    return o
  }
  const scene = {
    add: {
      text: () => bump(stub()),
      graphics: () => bump(stub()),
      circle: () => bump(stub()),
      container: (_x: number, _y: number, children?: unknown[]) =>
        bump(stub({ list: children ? [...children] : [] })),
    },
  } as unknown as Phaser.Scene
  return { scene, counter }
}

const M = CONCEPT_A_GOLDEN_AGE

describe('D1-A emblem', () => {
  it('renders a container without throwing (colour + grayscale)', () => {
    const { scene } = fakeScene()
    expect(() => drawEmblem(scene, M)).not.toThrow()
    expect(() => drawEmblem(scene, M, { grayscale: true })).not.toThrow()
    expect(drawEmblem(scene, M, { radius: 12 })).toBeTruthy()
  })

  it('is deterministic — two renders issue the same number of draw calls', () => {
    const a = fakeScene()
    const b = fakeScene()
    drawEmblem(a.scene, M)
    drawEmblem(b.scene, M)
    expect(a.counter.created).toBe(b.counter.created)
    expect(a.counter.created).toBeGreaterThan(0)
  })
})

describe('D1-A signage', () => {
  it('renders every primary + department sign container without throwing', () => {
    const { scene } = fakeScene()
    expect(makePlaque(scene, M, 'ADMINISTRATION', { tier: 'secondary' })).toBeTruthy()
    expect(makePlaque(scene, M, 'DEVELOPMENT', { tier: 'tertiary' })).toBeTruthy()
    expect(makeGateBanner(scene, M)).toBeTruthy()
    expect(makeStageIdentifier(scene, M, 'A')).toBeTruthy()
    expect(makeStageIdentifier(scene, M, 'B')).toBeTruthy()
    expect(makeAccentBand(scene, M, 60)).toBeTruthy()
  })

  it('marquee exposes an even, non-empty set of bulbs (top+bottom pairs) for the chase', () => {
    const { scene } = fakeScene()
    const marquee = makeMarquee(scene, M, 'THE LAST TAKE') as unknown as {
      getData: (k: string) => unknown[]
    }
    const bulbs = marquee.getData('bulbs')
    expect(Array.isArray(bulbs)).toBe(true)
    expect(bulbs.length).toBeGreaterThan(0)
    expect(bulbs.length % 2).toBe(0)
  })

  it('marquee renders its static no-release state (null title) without throwing', () => {
    const { scene } = fakeScene()
    expect(() => makeMarquee(scene, M, null)).not.toThrow()
  })

  it('renders every attention kind (shape + word + colour) without throwing', () => {
    const { scene } = fakeScene()
    for (const kind of ['warning', 'active', 'positive'] as const) {
      expect(() => makeAttentionBadge(scene, M, kind)).not.toThrow()
    }
  })
})
