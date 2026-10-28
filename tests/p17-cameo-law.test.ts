// ── P17 Shape A — the pure cameo law: capability, fee, retained charge, publicity pool, obligation intervals ──
//
// Authority: 1367-stage/p17-prep/P17-CAMEO-CONTRACT.md §2 (1956 unlock, at most two guests, the profession profile
// table), §3 (P = Σ f/(f+50)·0.5^rank·affinity, delta = (P_all − P_principals)/2, ties by principal seat then guest
// order, honest negative displacement, pool < 2), §4 (fee formula with one rounding, round(fee·0.25) retained, one
// linked refund, completed work untouched). Every expected number is computed here from the contract's own formulas.
//
// RED at the parent 2c50c9df by missing module: src/core/cameo.ts is new law. The live-route cases in
// tests/p17-cameo-booking.test.ts are the assertion-level RED pins.

import { describe, expect, it } from 'vitest'
import {
  cameoAttentionDelta,
  cameoFee,
  cameoPublicityDelta,
  cameoRetained,
  cancelReservedBookings,
  completeCameoBooking,
  featuredCapacity,
  mintCameoBooking,
  reservedCameoTalentIds,
  reservedGuestWeeks,
} from '../src/core/cameo.js'
import { TUNING } from '../src/core/tuning.js'
import type { Segment } from '../src/core/types.js'
import { UNLOCK_WEEK } from './helpers/p17-cameo-route.js'

const r = (fame: number) => fame / (fame + 50)
const SEGMENTS: Segment[] = [
  { id: 'youngAdult', share: 0.3, taste: { intimacy: 0, tonalWeight: 0, kineticEnergy: 0 } },
  { id: 'family', share: 0.2, taste: { intimacy: 0, tonalWeight: 0, kineticEnergy: 0 } },
  { id: 'adult', share: 0.3, taste: { intimacy: 0, tonalWeight: 0, kineticEnergy: 0 } },
  { id: 'prestige', share: 0.2, taste: { intimacy: 0, tonalWeight: 0, kineticEnergy: 0 } },
]
const PRINCIPALS = [{ fame: 60 }, { fame: 40 }, { fame: 20 }]
const P_PRINCIPALS = r(60) + 0.5 * r(40) + 0.25 * r(20)

describe('P17 Shape A law — the adopted provisional constants', () => {
  it('pins every cameo term to the contract', () => {
    expect(TUNING.P17_CAMEO_UNLOCK_WEEK).toBe(UNLOCK_WEEK)
    expect(TUNING.P17_CAMEO_MAX_GUESTS).toBe(2)
    expect(TUNING.P17_CAMEO_FEE_FRACTION).toBe(0.35)
    expect(TUNING.P17_CAMEO_CANCEL_RETAINED_FRACTION).toBe(0.25)
    expect(TUNING.P17_CAMEO_CAST_WEIGHT).toBe(0.1)
    expect(TUNING.P17_CAMEO_VISIBILITY_WEIGHT).toBe(0.1)
    expect(TUNING.P17_CAMEO_RANK_DECAY).toBe(0.5)
    expect(TUNING.P17_CAMEO_POOL_NORMALIZER).toBe(2)
    expect(TUNING.FAME_REACH_HALF_SAT).toBe(50)
    expect(TUNING.P17_CAMEO_PROFILE).toEqual({
      actor: { youngAdult: 1, family: 1, adult: 1, prestige: 1 },
      director: { youngAdult: 0.6, family: 0.6, adult: 0.85, prestige: 1 },
      writer: { youngAdult: 0.5, family: 0.65, adult: 1, prestige: 0.85 },
      craft: { youngAdult: 0.5, family: 0.6, adult: 0.75, prestige: 0.9 },
      scientist: { youngAdult: 0.35, family: 0.5, adult: 0.75, prestige: 1 },
    })
  })

  it('one capability unlock: none at week 1871, two from week 1872', () => {
    expect(featuredCapacity(UNLOCK_WEEK - 1)).toBe(0)
    expect(featuredCapacity(UNLOCK_WEEK)).toBe(2)
    expect(featuredCapacity(UNLOCK_WEEK + 5000)).toBe(2)
  })
})

describe('P17 Shape A law — the fee and the retained charge', () => {
  it('prices the contract example exactly with one rounding, stays positive at zero fame and rises with fame at fixed acting', () => {
    expect(cameoFee(20, 85)).toBe(162_575)
    expect(cameoFee(0, 0)).toBe(Math.round(0.35 * TUNING.SALARY_BASE))
    expect(cameoFee(0, 0)).toBeGreaterThan(0)
    expect(cameoFee(45, 30)).toBe(Math.round(0.35 * (TUNING.SALARY_BASE + TUNING.SALARY_SKILL_COEF * 0.45 ** 2 + TUNING.SALARY_FAME_COEF * 0.3 ** 2)))
    for (let fame = 0; fame < 100; fame += 10) expect(cameoFee(30, fame + 10)).toBeGreaterThan(cameoFee(30, fame))
  })

  it('retains round(fee·0.25) and refunds the exact remainder once', () => {
    expect(cameoRetained(162_575)).toBe(40_644)
    expect(cameoRetained(8_750)).toBe(Math.round(8_750 * 0.25))
  })
})

describe('P17 Shape A law — the publicity pool', () => {
  it('is zero with no guests and with a zero-fame guest ranked last', () => {
    for (const v of Object.values(cameoPublicityDelta(PRINCIPALS, [], SEGMENTS))) expect(v).toBe(0)
    for (const v of Object.values(cameoPublicityDelta(PRINCIPALS, [{ fame: 0, profession: 'actor' }], SEGMENTS))) expect(v).toBe(0)
  })

  it('a famous guest outranks the principals: delta = (P_all − P_principals)/2 with the profession affinity', () => {
    const delta = cameoPublicityDelta(PRINCIPALS, [{ fame: 80, profession: 'director' }], SEGMENTS)
    for (const seg of SEGMENTS) {
      const affinity = TUNING.P17_CAMEO_PROFILE.director[seg.id]
      const all = affinity * r(80) + 0.5 * r(60) + 0.25 * r(40) + 0.125 * r(20)
      expect(delta[seg.id]).toBeCloseTo((all - P_PRINCIPALS) / 2, 12)
    }
    expect(cameoAttentionDelta(delta, SEGMENTS)).toBeCloseTo(SEGMENTS.reduce((sum, seg) => sum + seg.share * delta[seg.id], 0), 12)
  })

  it('an off-segment famous guest who displaces better-fit names gives an honest negative delta', () => {
    const delta = cameoPublicityDelta(PRINCIPALS, [{ fame: 90, profession: 'scientist' }], SEGMENTS)
    expect(delta.youngAdult).toBeCloseTo((0.35 * r(90) + 0.5 * P_PRINCIPALS - P_PRINCIPALS) / 2, 12)
    expect(delta.youngAdult).toBeLessThan(0)
  })

  it('a fame tie ranks the principal first, then guests in committed order; the bound stays below one', () => {
    const tied = cameoPublicityDelta([{ fame: 50 }, { fame: 30 }, { fame: 10 }], [{ fame: 50, profession: 'director' }], SEGMENTS)
    const principalFirst = r(50) + 0.5 * 0.6 * r(50) + 0.25 * r(30) + 0.125 * r(10)
    expect(tied.family).toBeCloseTo((principalFirst - (r(50) + 0.5 * r(30) + 0.25 * r(10))) / 2, 12)
    const order = cameoPublicityDelta([{ fame: 10 }, { fame: 10 }, { fame: 10 }], [{ fame: 40, profession: 'writer' }, { fame: 40, profession: 'scientist' }], SEGMENTS)
    expect(order.youngAdult).toBeCloseTo((0.5 * r(40) + 0.5 * 0.35 * r(40) + (0.25 + 0.125 + 0.0625) * r(10) - 1.75 * r(10)) / 2, 12)
    const extreme = cameoPublicityDelta([{ fame: 0 }, { fame: 0 }, { fame: 0 }], [{ fame: 100, profession: 'actor' }, { fame: 100, profession: 'actor' }], SEGMENTS)
    for (const v of Object.values(extreme)) expect(Math.abs(v)).toBeLessThan(1)
  })
})

describe('P17 Shape A law — the booking lifecycle and its obligation interval', () => {
  const facts = { studioId: 's', productionId: 'prod-1872', talentId: 't-1', workWeek: 1876, bookedWeek: 1872, basis: 'freelance' as const, profession: 'director' as const, fee: 162_575, perceivedActingOVR: 20, fame: 85 }
  const root = mintCameoBooking(mintCameoBooking(undefined, facts), { ...facts, talentId: 't-2', workWeek: 1874 })

  it('mints ordinal ids from an absent root, freezes the quote versions and the retained charge', () => {
    expect(root.bookings.map((b) => [b.bookingId, b.status, b.retained])).toEqual([['cameo-1', 'reserved', 40_644], ['cameo-2', 'reserved', 40_644]])
    expect(root.nextOrdinal).toBe(3)
    expect(root.bookings[0]!.quote).toEqual({ perceivedActingOVR: 20, fame: 85, ruleVersion: 'p17-cameo/v1', capabilityVersion: 'p17-cameo-capability/v1', profileVersion: 'p17-cameo-profile/v1' })
  })

  it('cancels a reserved booking once with one refund; completed work and a second cancellation move nothing', () => {
    const done = completeCameoBooking(root, 'cameo-2', 1874, 51.5)
    const first = cancelReservedBookings(done, () => true, 1873, 'productionCancelled')
    expect(first.refunds).toEqual([{ bookingId: 'cameo-1', talentId: 't-1', productionId: 'prod-1872', amount: 162_575 - 40_644 }])
    expect(first.root.bookings[1]).toEqual(done.bookings[1])
    const again = cancelReservedBookings(first.root, () => true, 1873, 'explicit')
    expect(again.refunds).toEqual([])
    expect(again.root).toBe(first.root)
  })

  it('reserves exactly [from, until): an unrelated week stays usable; a seat from now on is open-ended', () => {
    expect([...reservedCameoTalentIds(root, 1876, 1877)]).toEqual(['t-1'])
    expect([...reservedCameoTalentIds(root, 1877)]).toEqual([])
    expect([...reservedCameoTalentIds(root, 1872, 1876)]).toEqual(['t-2'])
    expect([...reservedCameoTalentIds(root, 1872)].sort()).toEqual(['t-1', 't-2'])
    expect(reservedGuestWeeks(root, 't-1')).toEqual([1876])
    expect(reservedCameoTalentIds(undefined, 0).size).toBe(0)
  })
})
