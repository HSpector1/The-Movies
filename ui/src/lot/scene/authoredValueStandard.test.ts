// ── The authored-environment value contract ───────────────────────────────────
//
// Standard: docs/art/AUTHORED-ENVIRONMENT-PIPELINE-STANDARD.md
//
// Lesson AU cost this project a whole corrective pass: a governed relational
// threshold was carried from the space it was defined in (displayed sRGB) into a
// different one (linear irradiance), and every membership check kept passing while
// the shipped asset read wrong. This spec is the guard that makes that class of
// error a test failure instead of a review finding.
//
// It asserts three things, all derived from `COLORS` rather than remembered:
//
//   1. ONE canonical displayed-luma definition — Rec.601 over ENCODED sRGB.
//   2. Each wall family's own lit/shadow relationship, computed from the palette
//      constants the family is actually painted with.
//   3. That the Stage B band is NOT a universal constant — the families genuinely
//      disagree, so a future authored building must take its target from its own
//      family.
//
// This file is a spec. Nothing here ships: the runtime does not import it, and the
// acceptance instrument that measures shipped PNGs is
// scripts/art/authored-asset-pipeline.py, which carries the same formula.

import { describe, expect, it } from 'vitest'
import { COLORS as K } from './palette'
import { STAGE_A, STAGE_B } from './stageSpec'

/**
 * The canonical displayed luma: Rec.601 coefficients over 8-bit ENCODED sRGB.
 *
 * "Displayed" is load-bearing. The value a governed relationship describes is the
 * one on screen, and the on-screen value is the encoded byte — not a linearised
 * intensity, not a Blender irradiance, not a source material constant.
 */
const displayedLuma = (c: number): number =>
  0.299 * ((c >> 16) & 0xff) + 0.587 * ((c >> 8) & 0xff) + 0.114 * (c & 0xff)

/** The same colour linearised first — the trap AU records, kept here to prove it is a different quantity. */
const linearLuminance = (c: number): number => {
  const toLinear = (v: number) => {
    const s = v / 255
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  }
  const r = toLinear((c >> 16) & 0xff)
  const g = toLinear((c >> 8) & 0xff)
  const b = toLinear(c & 0xff)
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) * 255
}

/** shadow ÷ lit, in the canonical space. The only form the standard governs. */
const shadowToLit = (lit: number, shadow: number) => displayedLuma(shadow) / displayedLuma(lit)

/**
 * Every wall family currently used by the lot's architecture, named by the palette
 * keys it is painted from. `*Right` is the LIT face (+gy), `*Left` is the SHADOW
 * face (+gx) — see StagePalette.
 */
const WALL_FAMILIES = {
  cream: { lit: K.creamRight, shadow: K.creamLeft },
  buff: { lit: K.buffRight, shadow: K.buffLeft },
  taupe: { lit: K.taupeRight, shadow: K.taupeLeft },
  slate: { lit: K.slateRight, shadow: K.slateLeft },
  wallStucco: { lit: K.wallStuccoR, shadow: K.wallStuccoL },
} as const

/**
 * The published contract. These are not chosen numbers — each is
 * displayedLuma(shadow) / displayedLuma(lit) over that family's own two constants,
 * and the test below recomputes them. They are written out so a palette edit that
 * silently moves a governed relationship fails here and has to be re-published.
 */
const FAMILY_TARGET = {
  cream: 0.8737,
  buff: 0.8589,
  taupe: 0.8511,
  slate: 0.8424,
  wallStucco: 0.8752,
} as const

/** Bounded tolerance around the family-derived target. Derivation is in the standard. */
const FAMILY_TOLERANCE = 0.015

describe('canonical displayed-luma definition', () => {
  it('1. is Rec.601 over encoded sRGB — the coefficients, on a known colour', () => {
    // creamRight #e1d2ad = (225, 210, 173)
    expect(displayedLuma(K.creamRight)).toBeCloseTo(0.299 * 225 + 0.587 * 210 + 0.114 * 173, 6)
    expect(displayedLuma(0xffffff)).toBeCloseTo(255, 6)
    expect(displayedLuma(0x000000)).toBe(0)
  })

  it('2. linearising first produces a DIFFERENT quantity — the AU trap, pinned', () => {
    const encoded = shadowToLit(K.creamRight, K.creamLeft)
    const linear = linearLuminance(K.creamLeft) / linearLuminance(K.creamRight)
    expect(encoded).toBeCloseTo(0.8737, 4)
    expect(linear).toBeCloseTo(0.7408, 4)
    // The gap is not a rounding difference. A rig fed the displayed number as a
    // linear one lands ~0.13 away from where the standard says it should read.
    expect(Math.abs(encoded - linear)).toBeGreaterThan(0.1)
  })

  it('3. Rec.709 over encoded sRGB agrees to <0.001 — so the tiebreak is reproducibility, not accuracy', () => {
    const luma709 = (c: number) =>
      0.2126 * ((c >> 16) & 0xff) + 0.7152 * ((c >> 8) & 0xff) + 0.0722 * (c & 0xff)
    for (const { lit, shadow } of Object.values(WALL_FAMILIES)) {
      const r601 = displayedLuma(shadow) / displayedLuma(lit)
      const r709 = luma709(shadow) / luma709(lit)
      expect(Math.abs(r601 - r709)).toBeLessThan(0.001)
    }
  })
})

describe('family-derived relational targets', () => {
  for (const [name, tones] of Object.entries(WALL_FAMILIES)) {
    it(`4. ${name}: the published target is what its own palette constants produce`, () => {
      const target = FAMILY_TARGET[name as keyof typeof FAMILY_TARGET]
      expect(shadowToLit(tones.lit, tones.shadow)).toBeCloseTo(target, 4)
      // a shadow face is darker than the face it turns away from, and not by so
      // much that the corner reads as a different material
      expect(target).toBeGreaterThan(0.8)
      expect(target).toBeLessThan(1)
    })
  }

  it('5. a stage takes its target from its OWN spec, never from the other stage', () => {
    expect(shadowToLit(STAGE_A.palette.wallRight, STAGE_A.palette.wallLeft)).toBeCloseTo(
      FAMILY_TARGET.buff,
      4,
    )
    expect(shadowToLit(STAGE_B.palette.wallRight, STAGE_B.palette.wallLeft)).toBeCloseTo(
      FAMILY_TARGET.cream,
      4,
    )
  })

  it('6. the families genuinely disagree — no universal ratio exists to be reused', () => {
    const targets = Object.values(FAMILY_TARGET)
    const spread = Math.max(...targets) - Math.min(...targets)
    // taupe (0.8511) and slate (0.8424) sit BELOW Stage B's historical 0.859–0.876
    // band. Reusing that band on an admin or post-production building would demand a
    // relationship those families' own constants cannot produce.
    expect(spread).toBeGreaterThan(FAMILY_TOLERANCE * 2)
    expect(FAMILY_TARGET.taupe).toBeLessThan(0.859)
    expect(FAMILY_TARGET.slate).toBeLessThan(0.859)
  })
})

describe('the bounded tolerance, against the evidence that set it', () => {
  // Measured on the accepted production PNGs by
  // scripts/art/authored-asset-pipeline.py measure. Historical record, reproduced.
  const ACCEPTED_STAGE_B = { normal: 0.8687, worn: 0.8614 }
  const PROCEDURAL_CONTROL = { normal: 0.8737, worn: 0.8746 }
  const CAUGHT_DEFECT = 0.949 // the linear-irradiance mistake, before AU was learned

  const within = (measured: number, family: keyof typeof FAMILY_TARGET) =>
    Math.abs(measured - FAMILY_TARGET[family]) <= FAMILY_TOLERANCE

  it('7. admits every accepted production measurement against the cream target', () => {
    expect(within(ACCEPTED_STAGE_B.normal, 'cream')).toBe(true)
    expect(within(ACCEPTED_STAGE_B.worn, 'cream')).toBe(true)
    expect(within(PROCEDURAL_CONTROL.normal, 'cream')).toBe(true)
    expect(within(PROCEDURAL_CONTROL.worn, 'cream')).toBe(true)
  })

  it('8. rejects the defect that was actually shipped and caught', () => {
    expect(within(CAUGHT_DEFECT, 'cream')).toBe(false)
    // and by a wide margin — this is not a near miss the tolerance nearly allowed
    expect(Math.abs(CAUGHT_DEFECT - FAMILY_TARGET.cream)).toBeGreaterThan(FAMILY_TOLERANCE * 4)
  })

  it('9. does NOT double as a family discriminator — which is why the target is spec-derived', () => {
    // Stated rather than hidden: buff's own target sits 0.0148 from cream's, inside
    // 2x the tolerance. A ±0.015 window around cream would therefore also admit a
    // building painted buff. That is not a defect in the tolerance — the tolerance
    // bounds authoring drift, it does not identify materials. The protection is that
    // a building's target is computed from ITS OWN palette (test 5), so cream's
    // number is never the yardstick a buff building is held to.
    expect(Math.abs(FAMILY_TARGET.buff - FAMILY_TARGET.cream)).toBeLessThan(FAMILY_TOLERANCE * 2)
    expect(Math.abs(FAMILY_TARGET.buff - FAMILY_TARGET.cream)).toBeGreaterThan(0.01)
  })
})
