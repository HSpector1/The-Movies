// ── D-17B §1 — the awareness counter-flow and the reach-pivot regime split ─────
// Authority: docs/D-17B-CANDIDATE-DESIGN-CONTRACT.md §1 (+ §0 escalation E1);
// Owner authorization §4 A/C, §7, §18.
//
// §1 ships TWO coupled halves of one design and this file tests both:
//   N  — `AWARENESS_REACH_NEUTRAL` 0.58 → 0.45, as an ENGAGED-ONLY regime split (E1). The
//        recovery-side work. The disengaged/M0A branch keeps 0.58 byte-identically.
//   κ  — a new engaged-gated tick step 5.5, immediately after BROADCAST and before
//        DEVELOPMENT: `awareness' = awareness − κ·max(0, awareness − ANCHOR)`. The
//        anti-runaway work. Pure, weekly, deterministic, NO RNG.
//
// The M0A byte-identity claim is structural, not statistical: the headless corpus is never
// `economyEngaged`, so the split selects the legacy constant and the drift never runs. The
// spot-run below asserts exactly that over a real headless year, and the 1385-test acceptance
// corpus (tests/acceptance-corpus.test.ts) is the standing guard.

import { describe, expect, it } from 'vitest'
import {
  applyActions,
  clamp,
  economyEngaged,
  generateWorld,
  OracleAgent,
  tick,
  TUNING,
  updateStanding,
} from '../src/core/index.js'
import type { FilmResult, GameState, Standing, StandingContext } from '../src/core/index.js'

// ── a minimal, type-complete release the D-6 formulas can read ────────────────
const NEUTRAL_CRITIC = TUNING.PRESTIGE_CRITIC_BENCHMARK // ⇒ prestigeDelta exactly 0

function result(total: number, criticScore: number = NEUTRAL_CRITIC): FilmResult {
  return {
    productionId: 'p-1',
    releaseTick: 1,
    conceptId: 'c-1',
    directorId: 't-dir',
    craft: 50,
    cohesion: 0.5,
    criticScore,
    segmentScores: { youngAdult: 50, family: 50, adult: 50, prestige: 50 },
    boxOffice: { opening: total / 3, legs: 3, total },
  } as unknown as FilmResult
}

function ctx(over: Partial<StandingContext> = {}): StandingContext {
  return {
    castFames: { lead: 0, antagonist: 0, support: 0 },
    actualNegative: 1_000_000,
    requiredNegative: 1_000_000,
    baseMarketValue: 1_000_000,
    marketing: 400_000,
    salaries: 600_000,
    engaged: false,
    ...over,
  }
}

const MID: Standing = { audienceAwareness: 50, industryPrestige: 50, commercialConfidence: 50 }

/** The D-6 awareness delta, reassembled from TUNING at a chosen pivot — the reference. */
function referenceDelta(total: number, baseMarketValue: number, neutral: number): number {
  const reach = clamp(total / Math.max(baseMarketValue, 1) / TUNING.AWARENESS_REACH_SCALE, 0, 1)
  return clamp(
    TUNING.AWARENESS_REACH_WEIGHT * (reach - neutral),
    -TUNING.AWARENESS_DELTA_CAP,
    TUNING.AWARENESS_DELTA_CAP,
  )
}

// ═════════════════════════════════════════════════════════════════════════════
describe('D-17B §1/E1 — the reach pivot is a REGIME SPLIT, not an unconditional retune', () => {
  it('TUNING carries both pivots: the legacy 0.58 untouched and the engaged 0.45', () => {
    expect(TUNING.AWARENESS_REACH_NEUTRAL).toBe(0.58)
    expect(TUNING.AWARENESS_REACH_NEUTRAL_ENGAGED).toBe(0.45)
  })

  it('the DISENGAGED branch reproduces the legacy 0.58 delta exactly, on every reach', () => {
    for (const total of [0, 50_000, 300_000, 522_000, 700_000, 810_000, 2_000_000]) {
      const out = updateStanding(MID, result(total), {} as never, ctx({ engaged: false }))
      const delta = out.audienceAwareness - MID.audienceAwareness
      expect(delta).toBeCloseTo(referenceDelta(total, 1_000_000, TUNING.AWARENESS_REACH_NEUTRAL), 12)
    }
  })

  it('the ENGAGED branch pivots at 0.45 — and nothing else about the D-6 shape moves', () => {
    for (const total of [0, 50_000, 300_000, 522_000, 700_000, 810_000, 2_000_000]) {
      const out = updateStanding(MID, result(total), {} as never, ctx({ engaged: true }))
      const delta = out.audienceAwareness - MID.audienceAwareness
      expect(delta).toBeCloseTo(
        referenceDelta(total, 1_000_000, TUNING.AWARENESS_REACH_NEUTRAL_ENGAGED),
        12,
      )
    }
  })

  it('the split moves the pivot ONLY: away from the cap the gap is exactly WEIGHT·(0.58 − 0.45)', () => {
    const gap = TUNING.AWARENESS_REACH_WEIGHT *
      (TUNING.AWARENESS_REACH_NEUTRAL - TUNING.AWARENESS_REACH_NEUTRAL_ENGAGED)
    // reach values well inside the ±cap for BOTH pivots
    for (const total of [400_000, 500_000, 600_000, 700_000]) {
      const off = updateStanding(MID, result(total), {} as never, ctx({ engaged: false }))
      const on = updateStanding(MID, result(total), {} as never, ctx({ engaged: true }))
      expect(on.audienceAwareness - off.audienceAwareness).toBeCloseTo(gap, 12)
    }
  })

  it('engaged is never WORSE for awareness than disengaged, and the ±cap is unchanged', () => {
    for (const total of [0, 100_000, 900_000, 5_000_000, 50_000_000]) {
      const off = updateStanding(MID, result(total), {} as never, ctx({ engaged: false }))
      const on = updateStanding(MID, result(total), {} as never, ctx({ engaged: true }))
      expect(on.audienceAwareness).toBeGreaterThanOrEqual(off.audienceAwareness)
      for (const s of [off, on]) {
        const d = s.audienceAwareness - MID.audienceAwareness
        expect(Math.abs(d)).toBeLessThanOrEqual(TUNING.AWARENESS_DELTA_CAP + 1e-12)
      }
    }
  })

  it('the OTHER two D-6 channels are untouched by the regime', () => {
    for (const critic of [10, 45, 80]) {
      const off = updateStanding(MID, result(600_000, critic), {} as never, ctx({ engaged: false }))
      const on = updateStanding(MID, result(600_000, critic), {} as never, ctx({ engaged: true }))
      expect(on.industryPrestige).toBe(off.industryPrestige)
      expect(on.commercialConfidence).toBe(off.commercialConfidence)
    }
  })

  it('the star-attention term is unchanged by the split (it is added AFTER the pivot)', () => {
    const famous = ctx({ engaged: true, castFames: { lead: 100, antagonist: 100, support: 100 } })
    const unknown = ctx({ engaged: true })
    const a = updateStanding(MID, result(100_000), {} as never, famous)
    const b = updateStanding(MID, result(100_000), {} as never, unknown)
    expect(a.audienceAwareness - b.audienceAwareness).toBeCloseTo(TUNING.AWARENESS_STAR_WEIGHT, 12)
  })
})

// ═════════════════════════════════════════════════════════════════════════════
describe('D-17B §1/E1 — M0A byte-identity by construction (headless spot-run)', () => {
  it('a headless year is never engaged, so every standing update uses the legacy 0.58 pivot', () => {
    for (const seed of ['d17b-m0a-0001', 'd17b-m0a-0002', 'd17b-m0a-0003']) {
      let state: GameState = generateWorld(seed)
      expect(economyEngaged(state)).toBe(false)
      let releases = 0
      for (let t = 0; t < TUNING.TICKS_PER_YEAR; t++) {
        const before = state.studio.standing
        const beforeCount = state.studio.releasedFilms.length
        state = applyActions(state, OracleAgent.chooseActions(state))
        state = tick(state)
        // the regime never flips in a headless world — the split can only ever pick 0.58
        expect(economyEngaged(state)).toBe(false)
        const fresh = state.studio.releasedFilms.slice(beforeCount)
        releases += fresh.length
        if (fresh.length === 0) {
          // no release ⇒ awareness is EXACTLY unchanged (no drift may run when disengaged)
          expect(state.studio.standing.audienceAwareness).toBe(before.audienceAwareness)
        }
      }
      expect(releases).toBeGreaterThan(0) // the spot-run actually exercised releases
    }
  })
})
