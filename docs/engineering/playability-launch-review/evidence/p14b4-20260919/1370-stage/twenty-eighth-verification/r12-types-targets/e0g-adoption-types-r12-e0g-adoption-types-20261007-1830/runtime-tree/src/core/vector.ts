// ── §2 / §2.1 Creative-space vector math ─────────────────────────────────────
// personaToExpression and safeCosine are given verbatim (full bodies) in §2.1.
// magnitude/dot/distance/personaDistance are declared as signatures with their
// stated meaning and bounds ("euclidean, 0 .. sqrt(12)"); implemented as the
// standard euclidean operators the signatures name.

import type { Expression, Persona } from './types.js'

// §2 top-level constant.
export const EPSILON = 1e-6

// §2.1 identity mapping — every persona→expression conversion goes through here.
export function personaToExpression(p: Persona): Expression {
  return { intimacy: p.warmth, tonalWeight: p.gravity, kineticEnergy: p.physicality }
}

export function magnitude(e: Expression): number {
  return Math.sqrt(
    e.intimacy * e.intimacy + e.tonalWeight * e.tonalWeight + e.kineticEnergy * e.kineticEnergy,
  )
}

export function dot(a: Expression, b: Expression): number {
  return a.intimacy * b.intimacy + a.tonalWeight * b.tonalWeight + a.kineticEnergy * b.kineticEnergy
}

// euclidean, 0 .. sqrt(12)
export function distance(a: Expression, b: Expression): number {
  const di = a.intimacy - b.intimacy
  const dt = a.tonalWeight - b.tonalWeight
  const dk = a.kineticEnergy - b.kineticEnergy
  return Math.sqrt(di * di + dt * dt + dk * dk)
}

// euclidean, 0 .. sqrt(12)
export function personaDistance(a: Persona, b: Persona): number {
  const dw = a.warmth - b.warmth
  const dg = a.gravity - b.gravity
  const dp = a.physicality - b.physicality
  return Math.sqrt(dw * dw + dg * dg + dp * dp)
}

// §2.1 verbatim
export function safeCosine(a: Expression, b: Expression): number {
  const ma = magnitude(a),
    mb = magnitude(b)
  if (ma < EPSILON || mb < EPSILON) return 0
  return dot(a, b) / (ma * mb)
}
