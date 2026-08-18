// ── C2a-M0 — engine baseline, hygiene, and the union ─────────────────────────
// Charter §12-M0 + §3.2. Three things are pinned here:
//   1. the founding facility capacities are NAMED TUNING constants, not literals;
//   2. the phase→capability and phase→countdown tables have exactly ONE source;
//   3. `occupiedResourceSlots` is the one named union producer, and the
//      cross-owner double-booking refusal it carries is NON-VACUOUS.

import { describe, expect, it } from 'vitest'
import {
  INITIAL_STUDIO_FACILITIES,
  TUNING,
  initialManagedStudioOperations,
} from '../src/core/index.js'

describe('C2a-M0 — founding capacity hoists (charter §12-M0)', () => {
  it('names every founding facility capacity in TUNING at its frozen V1 value', () => {
    expect(TUNING.FOUNDING_DEVELOPMENT_CASTING_CAPACITY).toBe(2)
    expect(TUNING.FOUNDING_POST_CAPACITY).toBe(2)
    expect(TUNING.FOUNDING_SCENERY_CAPACITY).toBe(2)
    expect(TUNING.FOUNDING_SOUNDSTAGE_CAPACITY).toBe(1)
  })

  it('bounds every founding capacity as a positive integer', () => {
    for (const capacity of [
      TUNING.FOUNDING_DEVELOPMENT_CASTING_CAPACITY,
      TUNING.FOUNDING_POST_CAPACITY,
      TUNING.FOUNDING_SCENERY_CAPACITY,
      TUNING.FOUNDING_SOUNDSTAGE_CAPACITY,
    ]) {
      expect(Number.isInteger(capacity)).toBe(true)
      expect(capacity).toBeGreaterThan(0)
    }
  })

  it('builds the founding facility array from those constants and nothing else', () => {
    expect(
      INITIAL_STUDIO_FACILITIES.map((facility) => [facility.id, facility.capacity] as const),
    ).toEqual([
      ['facility-development-casting', TUNING.FOUNDING_DEVELOPMENT_CASTING_CAPACITY],
      ['facility-post-building', TUNING.FOUNDING_POST_CAPACITY],
      ['facility-scenery-shop', TUNING.FOUNDING_SCENERY_CAPACITY],
      ['facility-soundstage-07', TUNING.FOUNDING_SOUNDSTAGE_CAPACITY],
      ['facility-soundstage-12', TUNING.FOUNDING_SOUNDSTAGE_CAPACITY],
    ])
    // Both founding stages share ONE named per-stage capacity: the N-stage world
    // C2 builds derives every later stage from the same number.
    const stages = INITIAL_STUDIO_FACILITIES.filter(
      (facility) => facility.capability === 'soundstage',
    )
    expect(stages).toHaveLength(2)
    expect(new Set(stages.map((facility) => facility.capacity))).toEqual(
      new Set([TUNING.FOUNDING_SOUNDSTAGE_CAPACITY]),
    )
  })

  it('hands the live studio mutable clones carrying the same capacities', () => {
    const operations = initialManagedStudioOperations()
    expect(operations.facilities.map((facility) => facility.capacity)).toEqual([
      TUNING.FOUNDING_DEVELOPMENT_CASTING_CAPACITY,
      TUNING.FOUNDING_POST_CAPACITY,
      TUNING.FOUNDING_SCENERY_CAPACITY,
      TUNING.FOUNDING_SOUNDSTAGE_CAPACITY,
      TUNING.FOUNDING_SOUNDSTAGE_CAPACITY,
    ])
    expect(operations.facilities[0]).not.toBe(INITIAL_STUDIO_FACILITIES[0])
  })
})
