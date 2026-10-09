// Colocated spec for the D-16 luck resampler. Run with:
//   npx vitest run --config src/harness/d16/vitest.d16.config.ts

import { describe, it, expect } from 'vitest'
import { RngStream, stableStringify, stream, tick } from '../../core/index.js'
import { foundStudioFor } from './driver.js'
import { standardCadence } from './policies.js'
import { LUCK_CAVEATS, LUCK_RNG_OFFSET_PER_INDEX, luckFan, luckSeed, resampleLuck } from './luck.js'

const FOUNDED = foundStudioFor('d16-luck', standardCadence).state

describe('d16/luck', () => {
  it('re-keys the seed loudly and advances the sim stream by a documented offset', () => {
    const r = resampleLuck(FOUNDED, 3)
    expect(r.seed).toBe(luckSeed(FOUNDED.seed, 3))
    expect(r.seed).toContain('::luck-3')
    const base = RngStream.deserialize(FOUNDED.rngState)
    for (let i = 0; i < 3 * LUCK_RNG_OFFSET_PER_INDEX; i++) base.next()
    expect(r.rngState).toBe(base.serialize())
  })

  it('does not mutate the source state', () => {
    const before = stableStringify(FOUNDED)
    resampleLuck(FOUNDED, 5)
    expect(stableStringify(FOUNDED)).toBe(before)
  })

  it('k = 0 leaves rngState untouched but still re-keys the seed', () => {
    const r = resampleLuck(FOUNDED, 0)
    expect(r.rngState).toBe(FOUNDED.rngState)
    expect(r.seed).not.toBe(FOUNDED.seed)
  })

  it('different luck indices really do produce different derived draws', () => {
    const a = resampleLuck(FOUNDED, 1)
    const b = resampleLuck(FOUNDED, 2)
    const za = stream(a.seed, 'discovery-v1', 'prod-0008').gaussian(0, 1)
    const zb = stream(b.seed, 'discovery-v1', 'prod-0008').gaussian(0, 1)
    const z0 = stream(FOUNDED.seed, 'discovery-v1', 'prod-0008').gaussian(0, 1)
    expect(za).not.toBe(zb)
    expect(za).not.toBe(z0)
  })

  it('the world itself is carried through unchanged (same talent, concepts, market)', () => {
    const r = resampleLuck(FOUNDED, 7)
    expect(stableStringify(r.talent)).toBe(stableStringify(FOUNDED.talent))
    expect(stableStringify(r.concepts)).toBe(stableStringify(FOUNDED.concepts))
    expect(r.market.baseMarketValue).toBe(FOUNDED.market.baseMarketValue)
    expect(r.studio.cash).toBe(FOUNDED.studio.cash)
    expect(stableStringify(r.contracts)).toBe(stableStringify(FOUNDED.contracts))
  })

  it('a resampled continuation is itself deterministic and replayable', () => {
    const a = resampleLuck(FOUNDED, 4)
    let x = a
    let y = resampleLuck(FOUNDED, 4)
    for (let i = 0; i < 12; i++) {
      x = tick(x, { develop: true })
      y = tick(y, { develop: true })
    }
    expect(stableStringify(x)).toBe(stableStringify(y))
  })

  it('luckFan yields distinct arms and rejects a bad index', () => {
    const fan = luckFan(FOUNDED, 4)
    expect(fan).toHaveLength(4)
    expect(new Set(fan.map((s) => s.seed)).size).toBe(4)
    expect(() => resampleLuck(FOUNDED, -1)).toThrow(/non-negative integer/)
    expect(() => resampleLuck(FOUNDED, 1.5)).toThrow(/non-negative integer/)
  })

  it('ships its caveats so no artifact can quote it without them', () => {
    expect(LUCK_CAVEATS.length).toBeGreaterThanOrEqual(5)
    expect(LUCK_CAVEATS.join(' ')).toMatch(/hiring/)
    expect(LUCK_CAVEATS.join(' ')).toMatch(/worldgen/)
  })
})
