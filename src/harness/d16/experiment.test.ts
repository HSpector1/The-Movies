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
import { activeMarketingGrid, assertMarketingGridPristine, withMarketingGrid } from './packages.js'
import type { MarketingGrid } from './packages.js'

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

// ── D-17B ────────────────────────────────────────────────────────────────────

describe('d17b/experiment — the §13.4 allowlist extension (23 keys, read-timing MEASURED)', () => {
  it('accepts every one of the 23 D-17B keys as a use-time sweep', () => {
    const keys = [
      'MARKETING_HALF_SATURATION', 'MARKETING_CAPACITY_MIN', 'MARKETING_CAPACITY_MAX',
      'MARKETING_AWARENESS_STANDING_WEIGHT', 'MARKETING_AWARENESS_EXP', 'MARKETING_REACH_MIN',
      'MARKETING_REACH_MAX', 'OVEREXPOSURE_THRESHOLD', 'OVEREXPOSURE_RANGE', 'OVEREXPOSURE_LEGS_COEF',
      'OVEREXPOSURE_DELIVERY_REF', 'OVEREXPOSURE_DELIVERY_RANGE', 'DISC_SUPPORT_AWARENESS',
      'DISC_SUPPORT_STAR', 'DISC_SUPPORT_THRESHOLD', 'DISC_SPREAD', 'DISC_SUPPORT_EXP', 'DISC_FLOOR',
      'DISC_CEIL', 'DISC_FORECAST_LOW_Z', 'AWARENESS_REACH_WEIGHT', 'AWARENESS_STAR_WEIGHT',
      'AWARENESS_DELTA_CAP',
    ] as const
    for (const k of keys) {
      const entry = TUNING_ALLOWLIST.find((e) => (e.key as string) === k)
      expect(entry, `${k} is not on the allowlist`).toBeDefined()
      expect(entry!.timing).toBe('use')
      expect(() => validateOverrides({ [k]: 1 } as Record<string, number>)).not.toThrow()
    }
    // and the whole set applies and restores in ONE scope
    const sweep: Record<string, number> = {}
    for (const k of keys) sweep[k] = (TUNING as unknown as Record<string, number>)[k]! * 1.1
    withTuningOverrides(sweep, () => {
      for (const k of keys) expect((TUNING as unknown as Record<string, number>)[k]).toBeCloseTo(sweep[k]!, 9)
    })
    assertTuningPristine('d17b-23-key sweep')
  })

  it('the three awareness-delta keys are labelled LAB SWEEPS ONLY (R4 does not authorize them)', () => {
    for (const k of ['AWARENESS_REACH_WEIGHT', 'AWARENESS_STAR_WEIGHT', 'AWARENESS_DELTA_CAP']) {
      const entry = TUNING_ALLOWLIST.find((e) => (e.key as string) === k)!
      expect(entry.note).toContain('LAB SWEEPS ONLY')
      expect(entry.note).toContain('NOT authorized by R4')
    }
  })

  it('MARKETING_HALF_SATURATION is allowlisted WITH its "inert when engaged" warning', () => {
    const entry = TUNING_ALLOWLIST.find((e) => (e.key as string) === 'MARKETING_HALF_SATURATION')!
    expect(entry.note).toContain('INERT IN EVERY ENGAGED D-17B CORPUS')
    expect(entry.readAt).toContain('reception.ts')
  })
})

describe('d17b/experiment — a lab lever can never be stamped CURRENT (the §13.4 defect)', () => {
  it('a counter-flow, publicity or grid key forces COUNTERFACTUAL even with no overrides', () => {
    expect(makeTag({}, { counterFlowKey: 'C:auth=reference;kappa=0.01' }).mode).toBe('COUNTERFACTUAL')
    expect(makeTag({}, { publicityKey: 'whisper=60000/1.5' }).mode).toBe('COUNTERFACTUAL')
    expect(makeTag({}, { marketingGridKey: '200000,700000,2000000' }).mode).toBe('COUNTERFACTUAL')
    // …and with no lever at all it is still CURRENT
    expect(makeTag({}, {}).mode).toBe('CURRENT')
  })

  it('the tagNote is DERIVED from the same levers as the mode, so it cannot contradict it', () => {
    const cf = makeTag({}, { counterFlowKey: 'A:auth=candidate;pointsPerWeek=0.05' })
    expect(cf.tagNote).toContain('COUNTERFACTUAL')
    expect(cf.tagNote).toContain('A:auth=candidate')
    const both = makeTag({ OVERHEAD_BASE: 1 }, { publicityKey: 'k' })
    expect(both.tagNote).toContain('OVERHEAD_BASE=1')
    expect(both.tagNote).toContain('publicity k')
  })

  it('leaves the CURRENT stamp byte-identical: no tagNote, no lever keys, ever null', () => {
    const t = makeTag({})
    expect(t.tagNote).toBeUndefined()
    expect(Object.prototype.hasOwnProperty.call(t, 'tagNote')).toBe(false)
    const stamped = tagArtifact({ endCash: 5 }, t)
    expect(Object.keys(stamped).sort()).toEqual(['endCash', 'mode', 'overrideKey', 'overrides'])
  })

  it('stamps every present lever key onto the artifact, and no absent one', () => {
    const stamped = tagArtifact({ endCash: 5 }, makeTag({}, { counterFlowKey: 'C:x', marketingGridKey: '1,2,3' }))
    expect(stamped.counterFlowKey).toBe('C:x')
    expect(stamped.marketingGridKey).toBe('1,2,3')
    expect(Object.prototype.hasOwnProperty.call(stamped, 'publicityKey')).toBe(false)
  })

  it('stamps a production candidate identity without mislabelling current production counterfactual', () => {
    const tag = makeTag({}, { productionCandidateKey: 'D17B:drift=.04/35;publicity=sat100' })
    expect(tag.mode).toBe('CURRENT')
    expect(tag.tagNote).toBeUndefined()
    expect(tagArtifact({ endCash: 5 }, tag).productionCandidateKey).toContain('sat100')
  })
})

describe('d17b/experiment — the marketing grid scope restores like a TUNING scope', () => {
  it('binds inside and restores after, and the canary catches a leak', () => {
    const shipped = activeMarketingGrid()
    const swept: MarketingGrid = [200_000, 700_000, 2_000_000]
    withMarketingGrid(swept, () => {
      expect(activeMarketingGrid()).toEqual(swept)
      expect(() => assertMarketingGridPristine('inside')).toThrow(/was not restored/)
    })
    expect(activeMarketingGrid()).toEqual(shipped)
    assertMarketingGridPristine('after')
  })

  it('restores even when the body throws, and rejects an impossible menu', () => {
    expect(() =>
      withMarketingGrid([1, 2, 3], () => {
        throw new Error('boom')
      }),
    ).toThrow('boom')
    assertMarketingGridPristine('after-throw')
    expect(() => withMarketingGrid([3, 2, 1], () => 0)).toThrow(/strictly ascending/)
    expect(() => withMarketingGrid([-1, 2, 3], () => 0)).toThrow(/non-negative/)
  })
})
