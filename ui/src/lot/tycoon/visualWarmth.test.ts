// ── C1-M6b — the visual warmth pass, proven rather than looked at ─────────────
//
// The art review is the PM's job and this file does not attempt it. What it DOES pin is
// every claim the pass makes that a person cannot check by eye, and every law it had to
// be written to:
//
//   1. DETERMINISM. Ground mottling and prop variation derive from a coordinate hash, not
//      from `Math.random`, not from a clock, and not from a consumed RNG stream. Two paints
//      of the same snapshot must be byte-identical, so the hash is pinned by value.
//   2. DRESSING TELLS NO LIES. Not one prop in the new backlot inventory stands on ground
//      the ENGINE's own parcel map offers for building — checked against `LOT_PARCELS`
//      itself, not against a copy of it kept over here.
//   3. THE VALUE LADDER SURVIVED THE OCHRE SHIFT. Warmth was allowed to move every hue and
//      lift every value; it was NOT allowed to collapse the bands a player reads the
//      property's circulation from. Roads stay below grass, paving stays above it, and the
//      construction pad stays below all of them.
//   4. THE SHIFT ACTUALLY HAPPENED. Each terrain tone is asserted warmer (hue rotated
//      toward yellow) than the exact value it replaced, so a later edit that quietly walks
//      the palette back has to say so out loud.

import { describe, expect, it } from 'vitest'
import { LOT_PARCELS, LOT_ROADS } from '../../../../src/core/index.ts'
import { WARM } from './palette.ts'
import {
  GROUND_SCORCH_THRESHOLD,
  GROUND_VERGE_BONUS,
  LOT_D,
  LOT_W,
  WORLD_PLACES,
  backlotDressing,
  gridHash,
  gridNoise,
  groundDryness,
  landscaping,
  type PropPlacement,
} from './world.ts'

// ── colour helpers ────────────────────────────────────────────────────────────

type Hsl = { h: number; s: number; l: number }

function hsl(rgb: number): Hsl {
  const r = ((rgb >> 16) & 0xff) / 255
  const g = ((rgb >> 8) & 0xff) / 255
  const b = (rgb & 0xff) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return { h: 0, s: 0, l }
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  const h =
    max === r ? ((g - b) / d + (g < b ? 6 : 0)) : max === g ? (b - r) / d + 2 : (r - g) / d + 4
  return { h: h * 60, s, l }
}

const lightness = (rgb: number): number => hsl(rgb).l

// ── 1. determinism ────────────────────────────────────────────────────────────

describe('C1-M6b — the ground is painted deterministically', () => {
  it('answers the same hash for the same cell, every time', () => {
    for (const [gx, gy] of [
      [0, 0],
      [13, 7],
      [27, 25],
      [3.5, 19.5],
    ] as const) {
      const first = gridHash(gx, gy)
      expect(gridHash(gx, gy)).toBe(first)
      expect(gridHash(gx, gy)).toBe(first)
    }
  })

  it('pins the hash by VALUE, so a refactor cannot silently repaint the lot', () => {
    // Not magic numbers: the current output of `gridHash`, recorded so that a change to
    // the mixing constants is a decision somebody has to make on purpose.
    expect(gridHash(0, 0)).toBe(1_128_905_535)
    expect(gridHash(13, 7)).toBe(971_073_803)
    expect(gridHash(27, 25)).toBe(1_893_111_987)
    expect(gridHash(4, 4, 11)).toBe(12_851_914)
  })

  it('has no fixed point at the origin — the corner of the lot is an ordinary cell', () => {
    // Found by this test, not by eye: an unseeded multiply-and-xor hash returns 0 for
    // (0, 0) at every salt, which pinned the property's back corner as permanently the
    // driest cell on it and made every salted variation there identical.
    expect(gridHash(0, 0)).not.toBe(0)
    expect(gridHash(0, 0, 1)).not.toBe(gridHash(0, 0, 2))
    expect(groundDryness(0, 0)).toBeGreaterThan(0)
    expect(groundDryness(0, 0)).toBeLessThan(1)
  })

  it('spreads its noise across the whole unit interval', () => {
    const samples: number[] = []
    for (let gy = 0; gy < LOT_D; gy++) {
      for (let gx = 0; gx < LOT_W; gx++) samples.push(gridNoise(gx, gy, 29))
    }
    for (const value of samples) {
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(1)
    }
    const mean = samples.reduce((sum, v) => sum + v, 0) / samples.length
    expect(mean).toBeGreaterThan(0.4)
    expect(mean).toBeLessThan(0.6)
  })

  it('is a pure function of the cell — no clock, no stream, no order dependence', () => {
    const forwards: number[] = []
    for (let gy = 0; gy < LOT_D; gy++) {
      for (let gx = 0; gx < LOT_W; gx++) forwards.push(groundDryness(gx, gy))
    }
    const backwards: number[] = []
    for (let gy = LOT_D - 1; gy >= 0; gy--) {
      for (let gx = LOT_W - 1; gx >= 0; gx--) backwards.push(groundDryness(gx, gy))
    }
    expect(backwards.reverse()).toEqual(forwards)
  })

  it('scorches some of the open ground and nothing like all of it', () => {
    let dry = 0
    let total = 0
    for (let gy = 0; gy < LOT_D; gy++) {
      for (let gx = 0; gx < LOT_W; gx++) {
        total += 1
        if (groundDryness(gx, gy) >= GROUND_SCORCH_THRESHOLD) dry += 1
      }
    }
    const fraction = dry / total
    // Blotches, not a second lawn and not a desert: the corpus' tutorial-era ground is
    // mottled, and a mottle that covers everything or nothing is not a mottle.
    expect(fraction).toBeGreaterThan(0.05)
    expect(fraction).toBeLessThan(0.45)
  })

  it('makes a traffic verge drier than open ground, which is the whole point of it', () => {
    expect(GROUND_VERGE_BONUS).toBeGreaterThan(0)
    // A cell that is not dry enough on its own can be pushed over by traffic; a cell that
    // is nowhere near still cannot. Both matter: the verge is a bias, not an override.
    const nudged = GROUND_SCORCH_THRESHOLD - GROUND_VERGE_BONUS / 2
    expect(nudged + GROUND_VERGE_BONUS).toBeGreaterThanOrEqual(GROUND_SCORCH_THRESHOLD)
    expect(0 + GROUND_VERGE_BONUS).toBeLessThan(GROUND_SCORCH_THRESHOLD)
  })
})

// ── 2. dressing tells no lies ─────────────────────────────────────────────────

const BUILDABLE_PARCELS = LOT_PARCELS.filter((parcel) => parcel.terrain === 'buildable')

function cellOf(prop: PropPlacement): { gx: number; gy: number } {
  return { gx: Math.floor(prop.gx), gy: Math.floor(prop.gy) }
}

/** Every cell a prop could occupy once its deterministic jitter is applied. */
function jitteredCells(prop: PropPlacement): { gx: number; gy: number }[] {
  const slack = prop.jitter ?? 0
  const cells: { gx: number; gy: number }[] = []
  for (const dx of [-slack, 0, slack]) {
    for (const dy of [-slack, 0, slack]) {
      cells.push({ gx: Math.floor(prop.gx + dx), gy: Math.floor(prop.gy + dy) })
    }
  }
  return cells
}

describe('C1-M6b — backlot dressing never stands on buildable ground', () => {
  const dressing = backlotDressing()

  it('actually dresses the lot', () => {
    expect(dressing.length).toBeGreaterThanOrEqual(40)
  })

  it('puts no prop — at any point of its jitter — inside a BUILDABLE parcel', () => {
    const offences: string[] = []
    for (const prop of dressing) {
      for (const cell of jitteredCells(prop)) {
        for (const parcel of BUILDABLE_PARCELS) {
          const inside =
            cell.gx >= parcel.rect.x0 &&
            cell.gx <= parcel.rect.x1 &&
            cell.gy >= parcel.rect.y0 &&
            cell.gy <= parcel.rect.y1
          if (inside) {
            offences.push(`${prop.texKey}@${String(prop.gx)},${String(prop.gy)} → ${parcel.id}`)
          }
        }
      }
    }
    expect(offences).toEqual([])
  })

  it('keeps every prop inside the property', () => {
    for (const prop of dressing) {
      const slack = prop.jitter ?? 0
      expect(prop.gx - slack).toBeGreaterThanOrEqual(0)
      expect(prop.gy - slack).toBeGreaterThanOrEqual(0)
      expect(prop.gx + slack).toBeLessThanOrEqual(LOT_W)
      expect(prop.gy + slack).toBeLessThanOrEqual(LOT_D)
    }
  })

  it('keeps every prop off an authored building footprint', () => {
    for (const prop of dressing) {
      for (const place of WORLD_PLACES) {
        const cell = cellOf(prop)
        const inside =
          cell.gx >= place.gx &&
          cell.gx < place.gx + place.fw &&
          cell.gy >= place.gy &&
          cell.gy < place.gy + place.fd
        expect(`${prop.texKey} in ${place.buildingId}: ${String(inside)}`).toBe(
          `${prop.texKey} in ${place.buildingId}: false`,
        )
      }
    }
  })

  it('keeps every prop off the road network — circulation is not a shelf', () => {
    for (const prop of dressing) {
      const cell = cellOf(prop)
      for (const road of LOT_ROADS) {
        const inside =
          cell.gx >= road.x0 && cell.gx <= road.x1 && cell.gy >= road.y0 && cell.gy <= road.y1
        expect(`${prop.texKey}@${String(cell.gx)},${String(cell.gy)}: ${String(inside)}`).toBe(
          `${prop.texKey}@${String(cell.gx)},${String(cell.gy)}: false`,
        )
      }
    }
  })

  it('adds no prop twice on the same point', () => {
    const seen = new Set<string>()
    for (const prop of [...landscaping(), ...dressing]) {
      const key = `${prop.texKey}@${String(prop.gx)},${String(prop.gy)}`
      expect(seen.has(key)).toBe(false)
      seen.add(key)
    }
  })
})

// ── 3 & 4. the ochre shift, and what it was not allowed to cost ───────────────

describe('C1-M6b — the ochre shift kept the value ladder', () => {
  it('keeps every grass tone lighter than the roads it borders', () => {
    for (const grass of [WARM.lawn, WARM.lawnAlt, WARM.lawnDry]) {
      expect(lightness(grass)).toBeGreaterThan(lightness(WARM.road) + 0.05)
    }
  })

  it('keeps every paved tone lighter than every grass tone', () => {
    for (const paving of [WARM.path, WARM.plaza]) {
      for (const grass of [WARM.lawn, WARM.lawnAlt, WARM.lawnDry]) {
        expect(lightness(paving)).toBeGreaterThan(lightness(grass) + 0.05)
      }
    }
  })

  it('keeps the construction pad darker than the driest grass it is cut into', () => {
    // A graded pad has to read as bare earth, not as another scorch blotch — a player
    // watching a build has to be able to see the pad it is standing on.
    expect(lightness(WARM.dirt)).toBeLessThan(lightness(WARM.lawnDry) - 0.05)
    expect(hsl(WARM.dirt).h).toBeLessThan(hsl(WARM.lawnDry).h - 8)
  })

  it('orders the three grass tones watered → scorched → driest', () => {
    expect(lightness(WARM.lawn)).toBeLessThan(lightness(WARM.lawnAlt))
    expect(lightness(WARM.lawnAlt)).toBeLessThan(lightness(WARM.lawnDry))
  })

  it('keeps the surround paler than the watered property inside the wall', () => {
    // The 2005 corpus reads the studio as the darker, greener island in a bleached
    // landscape; that is what makes the boundary legible at institution zoom.
    expect(lightness(WARM.surround)).toBeGreaterThan(lightness(WARM.lawn) + 0.08)
  })

  it('keeps every SHADE wall darker than the ground it now stands on', () => {
    // The silhouette ladder is roof > lit wall > shade wall > ground. A ground that came
    // up in value takes the shade walls down with it, or bodies float.
    for (const wall of [WARM.creamShade, WARM.taupeShade, WARM.buffShade, WARM.slateShade]) {
      expect(lightness(wall)).toBeLessThan(lightness(WARM.lawnDry))
    }
  })
})

describe('C1-M6b — the shift is warmer than what it replaced', () => {
  // The exact pre-M6b values, recorded so "warmer" is a measurement and not a claim.
  const BEFORE = {
    lawn: 0x8a9459,
    lawnAlt: 0x7d8850,
    surround: 0xa89a6e,
    haze: 0x9fa8a4,
  } as const

  it('rotates the grass hue toward yellow', () => {
    expect(hsl(WARM.lawn).h).toBeLessThan(hsl(BEFORE.lawn).h - 3)
  })

  it('lifts every terrain tone in value', () => {
    expect(lightness(WARM.lawn)).toBeGreaterThan(lightness(BEFORE.lawn))
    expect(lightness(WARM.surround)).toBeGreaterThan(lightness(BEFORE.surround))
  })

  it('inverts the mottle: the second grass tone is now the SCORCHED one', () => {
    expect(lightness(BEFORE.lawnAlt)).toBeLessThan(lightness(BEFORE.lawn))
    expect(lightness(WARM.lawnAlt)).toBeGreaterThan(lightness(WARM.lawn))
  })

  it('warms the atmosphere off its old cold grey', () => {
    expect(hsl(BEFORE.haze).h).toBeGreaterThan(120)
    expect(hsl(WARM.haze).h).toBeLessThan(70)
  })

  it('gives the warm chrome a dark bed to be read against', () => {
    // Every warm cue (selection gold, hover cream, the guidance rim, the ghost outline) is
    // stroked over `chromeHalo` first. It only works if it is genuinely dark.
    expect(lightness(WARM.chromeHalo)).toBeLessThan(0.2)
    for (const cue of [WARM.selection, WARM.hover, WARM.brass, WARM.marquee]) {
      expect(lightness(cue) - lightness(WARM.chromeHalo)).toBeGreaterThan(0.4)
    }
  })
})
