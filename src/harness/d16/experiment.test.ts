// Colocated spec for the D-16 counterfactual layer. Run with:
//   npx vitest run --config src/harness/d16/vitest.d16.config.ts
//
// NOTE: these tests mutate the process-global TUNING inside a try/finally. They are
// deliberately kept in ONE file and must not run concurrently with anything that reads
// TUNING — which is why the D-16 corpus itself always runs single-process via vite-node.

import { describe, it, expect } from 'vitest'
import { TUNING } from '../../core/index.js'
import {
  TUNING_ALLOWLIST,
  assertTuningPristine,
  makeTag,
  readTimingTable,
  tagArtifact,
  validateOverrides,
  withTuningOverrides,
} from './experiment.js'

describe('d16/experiment — override scoping', () => {
  it('applies an override inside the scope and restores it afterwards', () => {
    const before = TUNING.OVERHEAD_BASE
    const inside = withTuningOverrides({ OVERHEAD_BASE: 1 }, () => TUNING.OVERHEAD_BASE)
    expect(inside).toBe(1)
    expect(TUNING.OVERHEAD_BASE).toBe(before)
    assertTuningPristine('restore')
  })

  it('restores even when the body throws', () => {
    const before = TUNING.OVERHEAD_BASE
    expect(() =>
      withTuningOverrides({ OVERHEAD_BASE: 99 }, () => {
        throw new Error('boom')
      }),
    ).toThrow('boom')
    expect(TUNING.OVERHEAD_BASE).toBe(before)
    assertTuningPristine('restore-after-throw')
  })

  it('nests correctly', () => {
    const before = TUNING.OVERHEAD_BASE
    withTuningOverrides({ OVERHEAD_BASE: 10 }, () => {
      expect(TUNING.OVERHEAD_BASE).toBe(10)
      withTuningOverrides({ OVERHEAD_PER_EMPLOYEE: 7 }, () => {
        expect(TUNING.OVERHEAD_BASE).toBe(10)
        expect(TUNING.OVERHEAD_PER_EMPLOYEE).toBe(7)
      })
      expect(TUNING.OVERHEAD_BASE).toBe(10)
    })
    expect(TUNING.OVERHEAD_BASE).toBe(before)
    assertTuningPristine('nested')
  })
})

describe('d16/experiment — the allowlist and read-timing discipline', () => {
  it('rejects a key that is not on the allowlist', () => {
    expect(() => validateOverrides({ COHESION_CAP: 1 })).toThrow(/not in TUNING_ALLOWLIST/)
  })

  it('rejects a worldgen-time key unless the experiment regenerates worlds', () => {
    expect(() => validateOverrides({ INITIAL_CASH: 1 })).toThrow(/read at worldgen time/)
    expect(() => validateOverrides({ INITIAL_CASH: 1 }, { regeneratesWorlds: true })).not.toThrow()
  })

  it('rejects a founding-time key unless the experiment regenerates worlds', () => {
    expect(() => validateOverrides({ HIRING_FOUNDING_BUDGET: 1 })).toThrow(/read at founding time/)
  })

  it('accepts use-time keys unconditionally', () => {
    expect(() => validateOverrides({ OVERHEAD_BASE: 1, STUDIO_RENTAL_BLENDED: 0.6 })).not.toThrow()
  })

  it('every allowlist entry names where the value is read', () => {
    expect(TUNING_ALLOWLIST.length).toBeGreaterThan(10)
    for (const e of TUNING_ALLOWLIST) {
      expect(e.readAt).toMatch(/\.ts:/)
      expect(['worldgen', 'founding', 'use']).toContain(e.timing)
      expect(Object.prototype.hasOwnProperty.call(TUNING, e.key)).toBe(true)
    }
    expect(readTimingTable()).toHaveLength(TUNING_ALLOWLIST.length)
  })
})

describe('d16/experiment — artifact tagging', () => {
  it('an empty override set is CURRENT; any override is COUNTERFACTUAL', () => {
    expect(makeTag({}).mode).toBe('CURRENT')
    expect(makeTag({}).overrideKey).toBe('')
    const t = makeTag({ OVERHEAD_BASE: 1 })
    expect(t.mode).toBe('COUNTERFACTUAL')
    expect(t.overrideKey).toBe('OVERHEAD_BASE=1')
  })

  it('the override key is sorted, so the same sweep always names itself the same way', () => {
    const a = makeTag({ STUDIO_RENTAL_BLENDED: 0.6, OVERHEAD_BASE: 1 })
    const b = makeTag({ OVERHEAD_BASE: 1, STUDIO_RENTAL_BLENDED: 0.6 })
    expect(a.overrideKey).toBe(b.overrideKey)
    expect(a.overrideKey).toBe('OVERHEAD_BASE=1;STUDIO_RENTAL_BLENDED=0.6')
  })

  it('tagArtifact always stamps mode + overrides onto the payload', () => {
    const tagged = tagArtifact({ endCash: 5 }, makeTag({ OVERHEAD_BASE: 1 }))
    expect(tagged.mode).toBe('COUNTERFACTUAL')
    expect(tagged.overrides).toEqual({ OVERHEAD_BASE: 1 })
    expect(tagged.endCash).toBe(5)
  })
})
