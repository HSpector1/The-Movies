// Colocated spec for the D-17B counter-flow shim. Run with:
//   npx vitest run --config src/harness/d16/vitest.d16.config.ts
//
// THE FIRST TEST IS THE ONE THAT MATTERS: with the shim off, `runOne` must be the D-17A
// `runOne`, to the byte. Everything else here is about the shim being a pure, bounded,
// cash-blind function of player-visible quantities.

import { describe, it, expect } from 'vitest'
import { TUNING } from '../../core/index.js'
import type { GameState } from '../../core/index.js'
import {
  COUNTER_FLOW_OFF,
  applyCounterFlow,
  counterFlowKey,
  counterFlowStream,
  counterFlowValue,
  newCounterFlowMemo,
  validateCounterFlow,
} from './counterflow.js'
import type { CounterFlowConfig, CounterFlowCtx } from './counterflow.js'
import { foundStudioFor, runOne } from './driver.js'
import { standardCadence, forecastProfitMax } from './policies.js'
import { reconciledCash } from './view.js'

const SEEDS = ['d16-0001', 'd16-0002', 'd16-0003'] as const

function ctxOf(over: Partial<CounterFlowCtx> = {}): CounterFlowCtx {
  return {
    seed: 'd16-0001',
    week: 40,
    aPre: 30,
    aPost: 28,
    releases: [],
    weeksSinceRelease: 5,
    ...over,
  }
}

describe('d17b/counterflow — THE NEUTRAL-ARM INVARIANT', () => {
  it('runOne with the shim OFF is byte-identical to runOne without the option (3 seeds × 2 policies)', () => {
    for (const seed of SEEDS) {
      for (const policy of [standardCadence, forecastProfitMax]) {
        const bare = runOne({ seed, policy, horizonWeeks: 208 })
        const off = runOne({ seed, policy, horizonWeeks: 208, counterFlow: COUNTER_FLOW_OFF })
        expect(JSON.stringify(off)).toBe(JSON.stringify(bare))
      }
    }
  })

  it('the OFF shim is an object-identity pass-through, so no spread copy can perturb anything', () => {
    const state = foundStudioFor('d16-0001', standardCadence).state
    const memo = newCounterFlowMemo(0, COUNTER_FLOW_OFF)
    const out = applyCounterFlow(state, memo, COUNTER_FLOW_OFF, ctxOf())
    expect(out.state).toBe(state)
    expect(out.memo).toBe(memo)
    expect(out.point).toBeNull()
  })

  it('emits NO counterFlowKey when off, so the artifact stamp is absent (not null)', () => {
    expect(counterFlowKey(undefined)).toBeUndefined()
    expect(counterFlowKey(COUNTER_FLOW_OFF)).toBeUndefined()
    expect(counterFlowKey({ family: 'A', authorization: 'candidate', pointsPerWeek: 0.05 })).toContain('A:')
    expect(counterFlowKey({ family: 'A', authorization: 'candidate', pointsPerWeek: 0.05 })).toContain('auth=candidate')
  })
})

describe('d17b/counterflow — the six families are pure, bounded functions', () => {
  const families: CounterFlowConfig[] = [
    { family: 'A', authorization: 'candidate', pointsPerWeek: 0.2, floor: 5 },
    { family: 'B', authorization: 'candidate', rho: 0.005 },
    { family: 'C', authorization: 'reference', kappa: 0.03, baseline: 25 },
    { family: 'D', authorization: 'reference', gainKeep: 1, lossKeep: 0.5, idleDrain: 0.02 },
    { family: 'E', authorization: 'candidate', idleRate: 0.15, tauWeeks: 12 },
    { family: 'F', authorization: 'reference', pivotHalfLifeReleases: 3 },
  ]

  it('is deterministic: the same inputs produce the same output, every time', () => {
    for (const cfg of families) {
      const memo = newCounterFlowMemo(0, cfg)
      const ctx = ctxOf({ releases: [{ productionId: 'p1', reach: 0.4, starAttention: 0.3 }] })
      const a = counterFlowValue(cfg, ctx, memo)
      const b = counterFlowValue(cfg, ctx, memo)
      expect(b).toBe(a)
    }
  })

  it('mutates neither its ctx nor its memo', () => {
    for (const cfg of families) {
      const memo = newCounterFlowMemo(0, cfg)
      const ctx = ctxOf({ releases: [{ productionId: 'p1', reach: 0.4, starAttention: 0.3 }] })
      const memoBefore = JSON.stringify(memo)
      const ctxBefore = JSON.stringify(ctx)
      counterFlowValue(cfg, ctx, memo)
      expect(JSON.stringify(memo)).toBe(memoBefore)
      expect(JSON.stringify(ctx)).toBe(ctxBefore)
    }
  })

  it('never leaves [floor, ceiling], and never leaves [0, 100]', () => {
    for (const cfg of families) {
      const bounded: CounterFlowConfig = { ...cfg, floor: 10, ceiling: 60 }
      const memo = newCounterFlowMemo(0, bounded)
      for (const aPost of [0, 5, 10, 30, 60, 99.5, 100]) {
        for (const aPre of [0, 30, 100]) {
          const v = counterFlowValue(bounded, ctxOf({ aPre, aPost, releases: [{ productionId: 'p', reach: 1, starAttention: 1 }] }), memo)
          expect(v).toBeGreaterThanOrEqual(10)
          expect(v).toBeLessThanOrEqual(60)
        }
      }
    }
  })

  it('family C has its fixed point exactly at `baseline`', () => {
    const cfg: CounterFlowConfig = { family: 'C', authorization: 'reference', kappa: 0.25, baseline: 37 }
    const memo = newCounterFlowMemo(0, cfg)
    expect(counterFlowValue(cfg, ctxOf({ aPost: 37 }), memo)).toBe(37)
    // and it pulls BOTH ways in the two-sided form
    expect(counterFlowValue(cfg, ctxOf({ aPost: 60 }), memo)).toBeLessThan(60)
    expect(counterFlowValue(cfg, ctxOf({ aPost: 10 }), memo)).toBeGreaterThan(10)
  })

  it('family C in pullDownOnly form NEVER pulls up (the authorized one-sided variant)', () => {
    const cfg: CounterFlowConfig = {
      family: 'C',
      authorization: 'candidate',
      kappa: 0.25,
      baseline: 37,
      revertMode: 'pullDownOnly',
    }
    const memo = newCounterFlowMemo(0, cfg)
    expect(counterFlowValue(cfg, ctxOf({ aPost: 60 }), memo)).toBeLessThan(60)
    expect(counterFlowValue(cfg, ctxOf({ aPost: 10 }), memo)).toBe(10)
    expect(counterFlowValue(cfg, ctxOf({ aPost: 37 }), memo)).toBe(37)
  })

  it('family D with gainKeep = lossKeep = 1 and no idle drain is the IDENTITY', () => {
    const cfg: CounterFlowConfig = { family: 'D', authorization: 'reference', gainKeep: 1, lossKeep: 1, idleDrain: 0 }
    const memo = newCounterFlowMemo(0, cfg)
    for (const [aPre, aPost] of [[30, 28], [30, 33], [0, 0], [77, 77]] as const) {
      expect(counterFlowValue(cfg, ctxOf({ aPre, aPost }), memo)).toBe(aPost)
    }
  })

  it('family E decays at 0 inside the grace window and at the full rate once wsr >= tau', () => {
    const cfg: CounterFlowConfig = {
      family: 'E',
      authorization: 'candidate',
      idleRate: 0.15,
      tauWeeks: 12,
      releaseGraceWeeks: 4,
    }
    const memo = newCounterFlowMemo(0, cfg)
    expect(counterFlowValue(cfg, ctxOf({ aPost: 50, weeksSinceRelease: 0 }), memo)).toBe(50)
    expect(counterFlowValue(cfg, ctxOf({ aPost: 50, weeksSinceRelease: 3 }), memo)).toBe(50)
    expect(counterFlowValue(cfg, ctxOf({ aPost: 50, weeksSinceRelease: 12 }), memo)).toBeCloseTo(50 - 0.15, 12)
    expect(counterFlowValue(cfg, ctxOf({ aPost: 50, weeksSinceRelease: 40 }), memo)).toBeCloseTo(50 - 0.15, 12)
    // and it ramps in between
    const mid = counterFlowValue(cfg, ctxOf({ aPost: 50, weeksSinceRelease: 6 }), memo)
    expect(mid).toBeLessThan(50)
    expect(mid).toBeGreaterThan(50 - 0.15)
  })

  it('family F is the IDENTITY in a week with no release, and re-prices one that has', () => {
    const cfg: CounterFlowConfig = { family: 'F', authorization: 'reference', pivotHalfLifeReleases: 3 }
    const memo = newCounterFlowMemo(0, cfg)
    expect(counterFlowValue(cfg, ctxOf({ aPre: 30, aPost: 27.5, releases: [] }), memo)).toBe(27.5)
    // A film whose reach EQUALS the pivot contributes only the star term, so the alternative
    // stock is aPre + starTerm — strictly better than the engine's negative-reach outcome.
    const reach = memo.pivotEma
    const v = counterFlowValue(cfg, ctxOf({ aPre: 30, aPost: 27.5, releases: [{ productionId: 'p', reach, starAttention: 0.5 }] }), memo)
    expect(v).toBeCloseTo(30 + TUNING.AWARENESS_STAR_WEIGHT * 0.5, 10)
  })

  it('the private keyed stream is reproducible and is NOT the sim stream', () => {
    const state = foundStudioFor('d16-0001', standardCadence).state
    const a = counterFlowStream('d16-0001', 12).gaussian(0, 1)
    const b = counterFlowStream('d16-0001', 12).gaussian(0, 1)
    const c = counterFlowStream('d16-0001', 13).gaussian(0, 1)
    expect(b).toBe(a)
    expect(c).not.toBe(a)
    expect(JSON.stringify(counterFlowStream('d16-0001', 12).serialize())).not.toBe(JSON.stringify(state.rngState))
  })
})

describe('d17b/counterflow — the authorization gate (Phase-A gate ruling 2)', () => {
  it('REFUSES candidate status for the three unauthorized families, naming the ruling', () => {
    expect(() => validateCounterFlow({ family: 'C', authorization: 'candidate', kappa: 0.01, baseline: 40 })).toThrow(
      /FREE PULL-UP/,
    )
    expect(() => validateCounterFlow({ family: 'D', authorization: 'candidate', lossKeep: 0.5 })).toThrow(
      /gate ruling 2/,
    )
    expect(() => validateCounterFlow({ family: 'F', authorization: 'candidate', pivotHalfLifeReleases: 3 })).toThrow(
      /gate ruling 2/,
    )
    // …and every one of them is legal as a LABELLED REFERENCE ARM
    expect(() => validateCounterFlow({ family: 'C', authorization: 'reference', kappa: 0.01, baseline: 40 })).not.toThrow()
    expect(() => validateCounterFlow({ family: 'D', authorization: 'reference', lossKeep: 0.5 })).not.toThrow()
    expect(() => validateCounterFlow({ family: 'F', authorization: 'reference', pivotHalfLifeReleases: 3 })).not.toThrow()
  })

  it('ACCEPTS candidate status for A, E, B and the one-sided C', () => {
    expect(() => validateCounterFlow({ family: 'A', authorization: 'candidate', pointsPerWeek: 0.05 })).not.toThrow()
    expect(() => validateCounterFlow({ family: 'E', authorization: 'candidate', idleRate: 0.15, tauWeeks: 12 })).not.toThrow()
    expect(() => validateCounterFlow({ family: 'B', authorization: 'candidate', rho: 0.005 })).not.toThrow()
    expect(() =>
      validateCounterFlow({ family: 'C', authorization: 'candidate', kappa: 0.02, baseline: 30, revertMode: 'pullDownOnly' }),
    ).not.toThrow()
  })

  it('rejects a config whose numbers could not mean what they say', () => {
    expect(() => validateCounterFlow({ family: 'C', authorization: 'reference', kappa: 2, baseline: 40 })).toThrow(/kappa/)
    expect(() => validateCounterFlow({ family: 'A', authorization: 'candidate', pointsPerWeek: 1, floor: 90, ceiling: 10 })).toThrow(
      /floor 90 > ceiling 10/,
    )
    expect(() => validateCounterFlow({ family: 'F', authorization: 'reference', pivotHalfLifeReleases: 3, pivotInit: 40 })).toThrow(
      /it is a REACH/,
    )
  })
})

describe('d17b/counterflow — the shim touches awareness and NOTHING else', () => {
  const cfg: CounterFlowConfig = { family: 'C', authorization: 'reference', kappa: 0.5, baseline: 90 }

  it('leaves cash, the ledger and rngState bit-identical', () => {
    const state = foundStudioFor('d16-0001', standardCadence).state
    const memo = newCounterFlowMemo(0, cfg)
    const out = applyCounterFlow(state, memo, cfg, ctxOf({ aPre: 40, aPost: 40 }))
    expect(out.state).not.toBe(state)
    expect(out.state.studio.standing.audienceAwareness).not.toBe(state.studio.standing.audienceAwareness)
    expect(out.state.studio.cash).toBe(state.studio.cash)
    expect(out.state.ledger).toBe(state.ledger)
    expect(out.state.rngState).toBe(state.rngState)
    expect(reconciledCash(out.state)).toBe(reconciledCash(state))
    // structural diff: the ONLY difference anywhere in the state is that one number
    const scrub = (s: GameState): string =>
      JSON.stringify({ ...s, studio: { ...s.studio, standing: { ...s.studio.standing, audienceAwareness: 0 } } })
    expect(scrub(out.state)).toBe(scrub(state))
  })

  it('a real 104-week run under a family MOVES awareness and still reconciles (not vacuous)', () => {
    const off = runOne({ seed: 'd16-0001', policy: standardCadence, horizonWeeks: 104, awarenessStats: true })
    const on = runOne({ seed: 'd16-0001', policy: standardCadence, horizonWeeks: 104, counterFlow: cfg })
    expect(on.reconciliationOk).toBe(true)
    expect(on.awareness).toBeDefined()
    expect(on.awareness!.final).not.toBe(off.awareness!.final)
    expect(on.counterFlow).toBeDefined()
    expect(on.counterFlow!.appliedWeeks).toBeGreaterThan(0)
    // the counter-flow record is ABSENT on the neutral run
    expect(off.counterFlow).toBeUndefined()
  })
})
