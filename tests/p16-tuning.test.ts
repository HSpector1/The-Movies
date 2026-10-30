// ── P16 provisional tuning: every bounded term asserts its stated range (CLAUDE.md convention) ──
//
// Authority: P16 integration contract §6 ("Provisional numeric policy is a producer deliverable
// before transaction REDs: reserve duration, diligence fee, window duration, minimum/maximum quote
// age, bid duration, willingness premium, cooldown and holdback/resale protection. Canonical
// ~26-week reserve and 52-week holdback are candidate tuning only"); 1367-G (13-week estate
// window); 1362-O 5.5 (fee delegated as provisional tuning); P16A r3 (coefficients $100,000 /
// $25,000 are provisional tuning, never offer/clearing prices).

import { describe, expect, it } from 'vitest'
import { TUNING } from '../src/core/tuning.js'

describe('P16 TUNING: exact provisional values', () => {
  const expected: Record<string, number> = {
    RIGHTS_R2_CATALOGUE_VALUE_AT_100: 100_000,
    RIGHTS_R1_OPTION_VALUE_AT_100: 25_000,
    RIGHTS_RESERVE_WEEKS: 26,
    RIGHTS_DUE_DILIGENCE_FEE: 50_000,
    RIGHTS_DISCLOSURE_STALE_WEEKS: 13,
    RIGHTS_OFFER_DURATION_WEEKS: 4,
    RIGHTS_OFFER_COOLDOWN_WEEKS: 4,
    RIGHTS_WILLINGNESS_PREMIUM_PERCENT: 20,
    RIGHTS_RESALE_HOLDBACK_WEEKS: 52,
    ESTATE_WINDOW_WEEKS: 13,
  }
  for (const [key, value] of Object.entries(expected)) {
    it(`${key} === ${value}`, () => {
      expect((TUNING as Record<string, unknown>)[key]).toBe(value)
    })
  }
})

describe('P16 TUNING: stated ranges', () => {
  it('coefficients are positive whole dollars and the option premium is below the catalogue coefficient', () => {
    expect(Number.isInteger(TUNING.RIGHTS_R2_CATALOGUE_VALUE_AT_100) && TUNING.RIGHTS_R2_CATALOGUE_VALUE_AT_100 > 0).toBe(true)
    expect(Number.isInteger(TUNING.RIGHTS_R1_OPTION_VALUE_AT_100) && TUNING.RIGHTS_R1_OPTION_VALUE_AT_100 > 0).toBe(true)
    expect(TUNING.RIGHTS_R1_OPTION_VALUE_AT_100).toBeLessThan(TUNING.RIGHTS_R2_CATALOGUE_VALUE_AT_100)
  })
  it('durations are whole weeks in [1, 104]; the estate window is 13 by adoption; the holdback exceeds the offer duration', () => {
    for (const key of ['RIGHTS_RESERVE_WEEKS', 'RIGHTS_DISCLOSURE_STALE_WEEKS', 'RIGHTS_OFFER_DURATION_WEEKS', 'RIGHTS_OFFER_COOLDOWN_WEEKS',
      'RIGHTS_RESALE_HOLDBACK_WEEKS', 'ESTATE_WINDOW_WEEKS'] as const) {
      const v = TUNING[key]
      expect(Number.isInteger(v) && v >= 1 && v <= 104, key).toBe(true)
    }
    expect(TUNING.ESTATE_WINDOW_WEEKS).toBe(13)
    expect(TUNING.RIGHTS_RESALE_HOLDBACK_WEEKS).toBeGreaterThan(TUNING.RIGHTS_OFFER_DURATION_WEEKS)
  })
  it('the diligence fee is a positive whole-dollar amount and the willingness premium is a whole percent in (0, 100)', () => {
    expect(Number.isInteger(TUNING.RIGHTS_DUE_DILIGENCE_FEE) && TUNING.RIGHTS_DUE_DILIGENCE_FEE > 0).toBe(true)
    expect(Number.isInteger(TUNING.RIGHTS_WILLINGNESS_PREMIUM_PERCENT)).toBe(true)
    expect(TUNING.RIGHTS_WILLINGNESS_PREMIUM_PERCENT).toBeGreaterThan(0)
    expect(TUNING.RIGHTS_WILLINGNESS_PREMIUM_PERCENT).toBeLessThan(100)
  })
})
