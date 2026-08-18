// ── C2a-M2 — SET_TYPES and SET_BLUEPRINTS (charter §3.1/§9) ──────────────────
//
// The closed authored location vocabulary and the catalog that guarantees every
// entry in it is obtainable. Two laws carry the weight here:
//
//   * OWNER LAW 2 — no unrelievable reason. A beat may demand any `SetTypeId`,
//     so every id in `SET_TYPES` must have a blueprint. A vocabulary entry with
//     no way to build it is a queue reason a player can never clear.
//   * BOUNDED TERMS — every authored number states its range and this suite
//     asserts it, per the project's standing convention.

import { describe, expect, it } from 'vitest'
import {
  GENRE_ORDER,
  HOUSE_SET_BLUEPRINT_ID,
  SET_BLUEPRINTS,
  SET_TYPE_LABELS,
  SET_TYPES,
  STARTER_SET_TYPE,
  TUNING,
  endowedHouseSets,
  setBlueprintById,
  setTypeLabel,
} from '../src/core/index.js'
import type { Genre } from '../src/core/index.js'

describe('C2a-M2 — SET_TYPES, the closed location vocabulary', () => {
  it('is closed, unique, and sized to the charter’s ~8-12', () => {
    expect(SET_TYPES.length).toBeGreaterThanOrEqual(8)
    expect(SET_TYPES.length).toBeLessThanOrEqual(12)
    expect(new Set(SET_TYPES).size).toBe(SET_TYPES.length)
  })

  it('keeps the M1 starter entry exactly where the endowment expects it', () => {
    // The two endowed house sets were minted against this id at M1 and are
    // already inside migrated saves. Reordering or renaming it would invalidate
    // every one of them.
    expect(SET_TYPES[0]).toBe('generic-interior')
    expect(STARTER_SET_TYPE).toBe('generic-interior')
    for (const set of endowedHouseSets()) expect(set.setType).toBe(STARTER_SET_TYPE)
  })

  it('names every entry in stable engine kebab-case and in filmmaking words', () => {
    for (const setType of SET_TYPES) {
      expect(setType).toMatch(/^[a-z]+(-[a-z]+)*$/)
      const label = SET_TYPE_LABELS[setType]
      expect(label.trim().length).toBeGreaterThan(0)
      expect(setTypeLabel(setType)).toBe(label)
      // The professional-tycoon floor (`00F`): a player never reads an engine id.
      expect(label).not.toMatch(/-/)
      expect(label[0]).toBe(label[0]!.toUpperCase())
    }
    expect(Object.keys(SET_TYPE_LABELS)).toHaveLength(SET_TYPES.length)
  })

  it('is ERA-CLEAN — no entry names a year, a decade, or a technology (G15)', () => {
    for (const setType of SET_TYPES) {
      const label = SET_TYPE_LABELS[setType]
      expect(setType).not.toMatch(/\d/)
      expect(label).not.toMatch(/\d/)
      expect(`${setType} ${label}`.toLowerCase()).not.toMatch(
        /silent|talkie|colou?r|television|digital|space|starship|nuclear|cyber|modern/,
      )
    }
  })

  it('falls back honestly for a location it does not know', () => {
    expect(setTypeLabel('not-a-set-type')).toBe('not-a-set-type')
  })
})

describe('C2a-M2 — SET_BLUEPRINTS, the buildable set catalog', () => {
  it('covers EVERY location in the vocabulary, exactly once (owner law 2)', () => {
    const byType = SET_BLUEPRINTS.map((blueprint) => blueprint.setType)
    expect([...byType].sort()).toEqual([...SET_TYPES].sort())
    expect(new Set(byType).size).toBe(SET_BLUEPRINTS.length)
    // Stated the other way round, because this is the direction owner law 2
    // actually runs: a beat naming any authored location can always be answered.
    for (const setType of SET_TYPES) {
      expect(SET_BLUEPRINTS.some((blueprint) => blueprint.setType === setType)).toBe(true)
    }
  })

  it('gives every one of the six genres a set built FOR it', () => {
    const priorities = new Set<Genre>(SET_BLUEPRINTS.map((blueprint) => blueprint.priorityGenre))
    for (const genre of GENRE_ORDER) expect(priorities.has(genre)).toBe(true)
  })

  it('holds every authored number inside its stated range', () => {
    const rungs = [
      TUNING.SET_GENRE_WEIGHT_PRIMARY,
      TUNING.SET_GENRE_WEIGHT_STRONG,
      TUNING.SET_GENRE_WEIGHT_NEUTRAL,
      TUNING.SET_GENRE_WEIGHT_WEAK,
    ]
    const ids = new Set<string>()
    const names = new Set<string>()
    for (const blueprint of SET_BLUEPRINTS) {
      const label = `set blueprint "${blueprint.id}"`
      expect(ids.has(blueprint.id), `${label} id is duplicated`).toBe(false)
      expect(names.has(blueprint.name), `${label} name is duplicated`).toBe(false)
      ids.add(blueprint.id)
      names.add(blueprint.name)

      expect(blueprint.id).toMatch(/^set-[a-z]+(-[a-z]+)*$/)
      expect(blueprint.name.trim().length, label).toBeGreaterThan(0)
      expect((SET_TYPES as readonly string[]).includes(blueprint.setType), label).toBe(true)

      // quality 0..100, SHOWN.
      expect(Number.isInteger(blueprint.quality), label).toBe(true)
      expect(blueprint.quality, label).toBeGreaterThanOrEqual(0)
      expect(blueprint.quality, label).toBeLessThanOrEqual(100)

      // capex: whole dollars, strictly positive, so the strike refund is always
      // strictly lossy and refund farming is impossible.
      expect(Number.isInteger(blueprint.capex), label).toBe(true)
      expect(blueprint.capex, label).toBeGreaterThan(0)

      // buildWeeks: one of the three authored bands, never a fourth answer.
      expect(
        [
          TUNING.SET_BUILD_WEEKS_BAND_LOW,
          TUNING.SET_BUILD_WEEKS_BAND_MID,
          TUNING.SET_BUILD_WEEKS_BAND_HIGH,
        ],
        label,
      ).toContain(blueprint.buildWeeks)

      // attractiveness: ALWAYS negative — the corpus's own finding (lane 3 §11).
      expect(blueprint.attractiveness, label).toBeLessThan(0)

      // genre weights: all six genres, every one on an authored rung in 0..1.
      expect(Object.keys(blueprint.genreWeights).sort(), label).toEqual([...GENRE_ORDER].sort())
      for (const genre of GENRE_ORDER) {
        const weight = blueprint.genreWeights[genre]!
        expect(weight, `${label}.${genre}`).toBeGreaterThanOrEqual(0)
        expect(weight, `${label}.${genre}`).toBeLessThanOrEqual(1)
        expect(rungs, `${label}.${genre}`).toContain(weight)
      }
      expect(GENRE_ORDER, label).toContain(blueprint.priorityGenre)

      // Cash is the ONLY live gate in C2a: no entry declares a requirement whose
      // system does not exist, so no catalog card can promise an unreachable
      // unlock.
      expect(blueprint.requires, label).toEqual([])
    }
  })

  it('agrees with the endowment the V14 migrator already minted', () => {
    const house = setBlueprintById(HOUSE_SET_BLUEPRINT_ID)
    expect(house).not.toBeNull()
    expect(house!.quality).toBe(TUNING.HOUSE_SET_QUALITY)
    expect(house!.priorityGenre).toBe(TUNING.HOUSE_SET_PRIORITY_GENRE)
    for (const genre of GENRE_ORDER) {
      expect(house!.genreWeights[genre]).toBe(TUNING.HOUSE_SET_GENRE_WEIGHT)
    }
    // Every endowed set resolves against the catalog, which is what lets a strike
    // price its refund and a package surface name what it is shooting on.
    for (const set of endowedHouseSets()) {
      expect(setBlueprintById(set.blueprintId)).not.toBeNull()
      expect(set.quality).toBe(setBlueprintById(set.blueprintId)!.quality)
    }
  })

  it('is a ladder with real inversions, exactly as the corpus records', () => {
    // The house set is the cheapest and the least good — the corpus's own
    // "deliberately miserable bottom rung" shape (lane 3 §3.3).
    const house = setBlueprintById(HOUSE_SET_BLUEPRINT_ID)!
    for (const blueprint of SET_BLUEPRINTS) {
      if (blueprint.id === house.id) continue
      expect(blueprint.capex).toBeGreaterThan(house.capex)
      expect(blueprint.quality).toBeGreaterThan(house.quality)
    }
    // …and price is NOT a perfect proxy for quality. At least one pair inverts,
    // which is what keeps "which set" a decision instead of a budget lookup.
    const inversion = SET_BLUEPRINTS.some((a) =>
      SET_BLUEPRINTS.some((b) => a.capex < b.capex && a.quality > b.quality),
    )
    expect(inversion).toBe(true)
  })

  it('answers for a blueprint it does not have', () => {
    expect(setBlueprintById('set-not-a-blueprint')).toBeNull()
  })
})

describe('C2a-M2 — the Set TUNING families, bounded', () => {
  it('bounds the wear, threshold, novelty and uplift terms', () => {
    expect(TUNING.SET_CONDITION_WEAR_PER_PRODUCTION).toBeGreaterThan(0)
    expect(TUNING.SET_CONDITION_UNUSABLE_THRESHOLD).toBeGreaterThan(0)
    expect(TUNING.SET_CONDITION_UNUSABLE_THRESHOLD).toBeLessThan(TUNING.SET_CONDITION_INITIAL)
    // THE LOAD-BEARING INEQUALITY. A set that is legal to shoot on cannot be worn
    // past zero by shooting on it, which is what makes `condition === 0` mean one
    // thing only — "this set has never stood" — and is how a first build is told
    // apart from a repair without a schema member V14 froze shut.
    expect(TUNING.SET_CONDITION_UNUSABLE_THRESHOLD).toBeGreaterThan(
      TUNING.SET_CONDITION_WEAR_PER_PRODUCTION,
    )

    expect(TUNING.SET_NOVELTY_INITIAL).toBeGreaterThan(0)
    expect(TUNING.SET_NOVELTY_INITIAL).toBeLessThanOrEqual(1)
    expect(TUNING.SET_NOVELTY_DEPLETION_PER_RELEASE).toBeGreaterThan(0)
    expect(TUNING.SET_NOVELTY_DEPLETION_PER_RELEASE).toBeLessThan(1)
    expect(TUNING.SET_NOVELTY_RECEPTION_FACTOR_MIN).toBeGreaterThan(0)
    expect(TUNING.SET_NOVELTY_RECEPTION_FACTOR_MIN).toBeLessThan(1)

    expect(TUNING.SET_QUALITY_UPLIFT_MAX).toBeGreaterThan(0)
    expect(TUNING.SET_GENRE_FIT_UPLIFT_MAX).toBeGreaterThan(0)
    expect(TUNING.SET_GENRE_FIT_PRIORITY_BONUS).toBeGreaterThan(0)
    expect(TUNING.SET_GENRE_FIT_PRIORITY_BONUS).toBeLessThanOrEqual(1)
    // The whole owner-law-3 lever stays a small, bounded share of a 0..100 craft
    // score — the §9 condition on the ratified exception.
    expect(TUNING.SET_QUALITY_UPLIFT_MAX + TUNING.SET_GENRE_FIT_UPLIFT_MAX).toBeLessThanOrEqual(15)
  })

  it('bounds the money, the weeks and the refund', () => {
    expect(Number.isInteger(TUNING.SET_REPAIR_COST)).toBe(true)
    expect(TUNING.SET_REPAIR_COST).toBeGreaterThan(0)
    expect(Number.isInteger(TUNING.SET_REPAIR_WEEKS)).toBe(true)
    expect(TUNING.SET_REPAIR_WEEKS).toBeGreaterThan(0)
    // Two NAMED ZEROS, each stated as one by the charter and each with its reason
    // in TUNING: striking is instant, and the corpus records no recurring cash
    // cost for a set anywhere in the recovered schema.
    expect(TUNING.SET_STRIKE_WEEKS).toBe(0)
    expect(TUNING.SET_WEEKLY_MAINTENANCE_COST).toBe(0)
    // Strictly lossy: build-then-strike can never be a profit.
    expect(TUNING.SET_DEMOLITION_REFUND_FRACTION).toBeGreaterThan(0)
    expect(TUNING.SET_DEMOLITION_REFUND_FRACTION).toBeLessThan(1)

    const bands = [
      TUNING.SET_BUILD_WEEKS_BAND_LOW,
      TUNING.SET_BUILD_WEEKS_BAND_MID,
      TUNING.SET_BUILD_WEEKS_BAND_HIGH,
    ]
    for (const band of bands) {
      expect(Number.isInteger(band)).toBe(true)
      expect(band).toBeGreaterThanOrEqual(1)
    }
    expect(bands).toEqual([...bands].sort((a, b) => a - b))
    expect(new Set(bands).size).toBe(bands.length)
  })

  it('keeps the four genre-weight rungs distinct and ordered inside 0..1', () => {
    const rungs = [
      TUNING.SET_GENRE_WEIGHT_PRIMARY,
      TUNING.SET_GENRE_WEIGHT_STRONG,
      TUNING.SET_GENRE_WEIGHT_NEUTRAL,
      TUNING.SET_GENRE_WEIGHT_WEAK,
    ]
    expect(new Set(rungs).size).toBe(rungs.length)
    expect(rungs).toEqual([...rungs].sort((a, b) => b - a))
    for (const rung of rungs) {
      expect(rung).toBeGreaterThanOrEqual(0)
      expect(rung).toBeLessThanOrEqual(1)
    }
    // NEUTRAL is the house-set weight, not a number that merely resembles it.
    expect(TUNING.SET_GENRE_WEIGHT_NEUTRAL).toBe(TUNING.HOUSE_SET_GENRE_WEIGHT)
  })
})
