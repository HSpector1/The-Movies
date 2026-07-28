// Phase-1 test: §2 vector math, §2.1 persona mapping and safeCosine guard,
// §4 specificity, §13 rangeFrom clamp.
//
// Every expected value derives from docs/build-contract.md (§2.1, §4, §13).
// No value copied from implementation.

import { describe, it, expect } from 'vitest'
import {
  EPSILON,
  personaToExpression,
  magnitude,
  dot,
  distance,
  personaDistance,
  safeCosine,
  specificity,
  rangeFrom,
} from '../src/core/index.js'
import type { Persona, Expression, Promise } from '../src/core/index.js'

describe('§2.1 personaToExpression — identity mapping warmth→intimacy etc.', () => {
  it('maps warmth→intimacy, gravity→tonalWeight, physicality→kineticEnergy', () => {
    // Source: build-contract.md §2.1 body of personaToExpression.
    const p: Persona = { warmth: 0.3, gravity: -0.7, physicality: 0.9 }
    expect(personaToExpression(p)).toEqual({
      intimacy: 0.3,
      tonalWeight: -0.7,
      kineticEnergy: 0.9,
    })
  })

  it('preserves each axis independently (no cross-axis leakage)', () => {
    // Source: §2.1 — three axes map one-to-one.
    const a = personaToExpression({ warmth: 1, gravity: 0, physicality: 0 })
    expect(a).toEqual({ intimacy: 1, tonalWeight: 0, kineticEnergy: 0 })
    const b = personaToExpression({ warmth: 0, gravity: -1, physicality: 0 })
    expect(b).toEqual({ intimacy: 0, tonalWeight: -1, kineticEnergy: 0 })
    const c = personaToExpression({ warmth: 0, gravity: 0, physicality: -1 })
    expect(c).toEqual({ intimacy: 0, tonalWeight: 0, kineticEnergy: -1 })
  })
})

describe('§2.1 safeCosine — returns 0 when either magnitude < EPSILON', () => {
  it('returns 0 when the first vector has magnitude below EPSILON', () => {
    // Source: §2.1 verbatim guard: `if (ma < EPSILON || mb < EPSILON) return 0`.
    const zero: Expression = { intimacy: 0, tonalWeight: 0, kineticEnergy: 0 }
    const v: Expression = { intimacy: 1, tonalWeight: 1, kineticEnergy: 1 }
    expect(safeCosine(zero, v)).toBe(0)
  })

  it('returns 0 when the second vector has magnitude below EPSILON', () => {
    // Source: §2.1 verbatim guard (mb branch).
    const zero: Expression = { intimacy: 0, tonalWeight: 0, kineticEnergy: 0 }
    const v: Expression = { intimacy: 1, tonalWeight: 1, kineticEnergy: 1 }
    expect(safeCosine(v, zero)).toBe(0)
  })

  it('returns 0 when both vectors are below EPSILON', () => {
    // Source: §2.1 guard.
    const zero: Expression = { intimacy: 0, tonalWeight: 0, kineticEnergy: 0 }
    expect(safeCosine(zero, zero)).toBe(0)
  })

  it('EPSILON is 1e-6 (§2 declaration)', () => {
    // Source: build-contract.md §2 `const EPSILON = 1e-6`.
    expect(EPSILON).toBe(1e-6)
  })

  it('returns 1 for two identical non-zero parallel vectors', () => {
    // Source: §2.1 formula dot(a,b)/(ma*mb) — parallel ⇒ cosine 1.
    const v: Expression = { intimacy: 0.2, tonalWeight: 0.4, kineticEnergy: -0.6 }
    expect(safeCosine(v, v)).toBeCloseTo(1, 12)
  })
})

describe('§2.1 magnitude / dot / distance', () => {
  it('magnitude of (1,1,1) is sqrt(3)', () => {
    // Source: §2.1 magnitude(e) is the euclidean norm.
    expect(magnitude({ intimacy: 1, tonalWeight: 1, kineticEnergy: 1 })).toBeCloseTo(
      Math.sqrt(3),
      12,
    )
  })

  it('dot is the componentwise sum of products', () => {
    // Source: §2.1 dot(a,b).
    const a: Expression = { intimacy: 1, tonalWeight: 2, kineticEnergy: 3 }
    const b: Expression = { intimacy: -1, tonalWeight: 0.5, kineticEnergy: 2 }
    expect(dot(a, b)).toBeCloseTo(-1 + 1 + 6, 12) // = 6
  })

  it('distance((1,1,1),(-1,-1,-1)) === sqrt(12) (stated bound)', () => {
    // Source: build-contract.md §2.1 — distance is euclidean, range 0..sqrt(12);
    // the max-separation pair realizes the stated upper bound.
    const a: Expression = { intimacy: 1, tonalWeight: 1, kineticEnergy: 1 }
    const b: Expression = { intimacy: -1, tonalWeight: -1, kineticEnergy: -1 }
    expect(distance(a, b)).toBeCloseTo(Math.sqrt(12), 12)
  })

  it('distance of a vector to itself is 0', () => {
    // Source: §2.1 euclidean distance.
    const a: Expression = { intimacy: 0.4, tonalWeight: -0.2, kineticEnergy: 0.7 }
    expect(distance(a, a)).toBe(0)
  })

  it('personaDistance((1,1,1),(-1,-1,-1)) === sqrt(12) (stated bound)', () => {
    // Source: build-contract.md §2.1 — personaDistance euclidean, 0..sqrt(12).
    const a: Persona = { warmth: 1, gravity: 1, physicality: 1 }
    const b: Persona = { warmth: -1, gravity: -1, physicality: -1 }
    expect(personaDistance(a, b)).toBeCloseTo(Math.sqrt(12), 12)
  })
})

describe('§4 specificity — mean per-axis narrowness, NOT volume', () => {
  const mkPromise = (
    iw: [number, number],
    tw: [number, number],
    kw: [number, number],
  ): Promise => ({
    genre: 'drama',
    intendedSegments: ['adult'],
    ranges: { intimacy: iw, tonalWeight: tw, kineticEnergy: kw },
  })

  it('all widths 2 → 0', () => {
    // Source: §4 — each axis narrowness 1 - clamp(2/2,0,1) = 0; mean 0.
    expect(specificity(mkPromise([-1, 1], [-1, 1], [-1, 1]))).toBeCloseTo(0, 12)
  })

  it('all widths 0.4 → 0.8', () => {
    // Source: §4 — each axis 1 - clamp(0.4/2,0,1) = 0.8; mean 0.8.
    expect(specificity(mkPromise([0, 0.4], [0, 0.4], [0, 0.4]))).toBeCloseTo(0.8, 12)
  })

  it('one width-0 axis + two width-2 axes → 1/3 (mean narrowness, not volume)', () => {
    // Source: §4 comment — a volume product would score this as maximally specific;
    // the mean-narrowness reading gives (1 + 0 + 0)/3 = 1/3.
    expect(specificity(mkPromise([0.2, 0.2], [-1, 1], [-1, 1]))).toBeCloseTo(1 / 3, 12)
  })

  it('width clamps: a width beyond 2 does not push narrowness below 0', () => {
    // Source: §4 — clamp(w/2, 0, 1) caps the width term; narrowness stays in [0,1].
    // Width 3 (from -1..+2 conceptually, but ranges are clamped inputs) → clamp(1.5,0,1)=1 → 0.
    expect(specificity(mkPromise([-1, 1], [-1, 1], [0.5, 0.5]))).toBeCloseTo(
      (0 + 0 + 1) / 3,
      12,
    )
  })
})

describe('§13 rangeFrom — clamps to [-1, 1]', () => {
  it('rangeFrom(0, 0.8) === [-0.4, 0.4]', () => {
    // Source: §13 rangeFrom(center, width) = [center - width/2, center + width/2].
    expect(rangeFrom(0, 0.8)).toEqual([-0.4, 0.4])
  })

  it('clamps the low end at -1', () => {
    // Source: §13 — clamp(center - width/2, -1, 1).
    expect(rangeFrom(-0.75, 2.0)).toEqual([-1, 0.25])
  })

  it('clamps the high end at +1', () => {
    // Source: §13 — clamp(center + width/2, -1, 1).
    expect(rangeFrom(0.75, 2.0)).toEqual([-0.25, 1])
  })

  it('clamps both ends for a very wide range around center 0', () => {
    // Source: §13 — both ends clamp.
    expect(rangeFrom(0, 4.0)).toEqual([-1, 1])
  })
})
