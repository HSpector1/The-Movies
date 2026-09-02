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
        // P06A (charter W1): the hold law means a Release Ready picture
        // (remainingTicks === 1) HOLDS until an explicit commit. This spot-run
        // drives the commit itself, exactly as the roster-wall/facilities
        // harnesses already do — committing at the ready week adds NO week.
        const committed = new Set(state.releaseAuthority.commitments.map((r) => r.productionId))
        const ready = state.studio.activeProductions.filter(
          (p) => p.remainingTicks === 1 && !committed.has(p.id),
        )
        if (ready.length > 0) {
          state = applyActions(
            state,
            ready.map((p) => ({ kind: 'commitPictureToRelease' as const, productionId: p.id })),
          )
        }
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

// ═════════════════════════════════════════════════════════════════════════════
// The drift (tick step 5.5).
// ═════════════════════════════════════════════════════════════════════════════

const KAPPA = TUNING.AWARENESS_DRIFT_RATE
const ANCHOR = TUNING.AWARENESS_DRIFT_ANCHOR

/** The contract's own rule, written out independently of tick.ts. */
function driftOf(a: number): number {
  return clamp(a - KAPPA * Math.max(0, a - ANCHOR), 0, 100)
}

/** An IDLE world (no production, nothing releasing) at a chosen awareness, in a chosen regime. */
function idleWorld(seed: string, awareness: number, engaged: boolean): GameState {
  const w = generateWorld(seed)
  return {
    ...w,
    economyEngagedEver: engaged,
    studio: {
      ...w.studio,
      activeProductions: [],
      standing: { audienceAwareness: awareness, industryPrestige: 40, commercialConfidence: 50 },
    },
  }
}

const AWARENESS_PROBE = [0, 5, 10, 20, 30, 34.9, 35, 35.1, 40, 50, 60, 75, 90, 100] as const

describe('D-17B §1 — the drift is one-sided, anchored, and bounded', () => {
  it('constants are the contract values (κ = 0.04/week, ANCHOR = 35)', () => {
    expect(TUNING.AWARENESS_DRIFT_RATE).toBe(0.04)
    expect(TUNING.AWARENESS_DRIFT_ANCHOR).toBe(35)
  })

  it('an idle ENGAGED week applies exactly the contract rule, on the whole probe range', () => {
    for (const a of AWARENESS_PROBE) {
      const out = tick(idleWorld('d17b-drift', a, true))
      expect(out.studio.standing.audienceAwareness).toBeCloseTo(driftOf(a), 12)
    }
  })

  it('AT and BELOW the anchor it is exactly inert — never a pull-UP, never a death spiral', () => {
    for (const a of AWARENESS_PROBE.filter((v) => v <= ANCHOR)) {
      const out = tick(idleWorld('d17b-drift', a, true))
      expect(out.studio.standing.audienceAwareness).toBe(a)
    }
  })

  it('the anchor is a FIXED POINT: repeated engaged weeks converge to it from above, never past it', () => {
    let s = idleWorld('d17b-drift-fp', 100, true)
    let previous = s.studio.standing.audienceAwareness
    for (let w = 0; w < 400; w++) {
      s = tick(s)
      const a = s.studio.standing.audienceAwareness
      expect(a).toBeLessThanOrEqual(previous) // monotone decreasing
      expect(a).toBeGreaterThanOrEqual(ANCHOR) // never crosses the anchor
      previous = a
    }
    expect(previous).toBeCloseTo(ANCHOR, 4) // and it actually gets there
  })

  it('the stock stays inside the engine 0..100 law and the weekly step is bounded by κ·(100−ANCHOR)', () => {
    const maxStep = KAPPA * (100 - ANCHOR)
    for (const a of AWARENESS_PROBE) {
      const out = tick(idleWorld('d17b-drift', a, true))
      const next = out.studio.standing.audienceAwareness
      expect(next).toBeGreaterThanOrEqual(0)
      expect(next).toBeLessThanOrEqual(100)
      expect(a - next).toBeGreaterThanOrEqual(0)
      expect(a - next).toBeLessThanOrEqual(maxStep + 1e-12)
    }
  })

  it('is MONOTONE in the stock: a more-aware studio is still more aware after the week', () => {
    const outs = AWARENESS_PROBE.map((a) => tick(idleWorld('d17b-drift', a, true)).studio.standing.audienceAwareness)
    for (let i = 1; i < outs.length; i++) expect(outs[i]!).toBeGreaterThanOrEqual(outs[i - 1]!)
  })

  it('is ENGAGED-GATED: a disengaged idle week never moves the stock, at any level', () => {
    for (const a of AWARENESS_PROBE) {
      const out = tick(idleWorld('d17b-drift', a, false))
      expect(out.studio.standing.audienceAwareness).toBe(a)
    }
  })

  it('touches NOTHING else — no other channel, no cash beyond the existing weekly charges, no RNG', () => {
    const before = idleWorld('d17b-drift-iso', 90, true)
    const after = tick(before)
    expect(after.studio.standing.industryPrestige).toBe(before.studio.standing.industryPrestige)
    expect(after.studio.standing.commercialConfidence).toBe(before.studio.standing.commercialConfidence)
    // no release ⇒ the sim stream is not advanced at all; the drift consumes none either
    expect(after.rngState).toBe(before.rngState)
    // the only cash movement in an idle engaged week is the D-12 overhead already on the ledger
    const added = after.ledger.slice(before.ledger.length)
    expect(added.every((e) => e.kind === 'overhead')).toBe(true)
  })

  it('is deterministic: the same engaged week from the same state gives the identical stock', () => {
    const s = idleWorld('d17b-drift-det', 82.3456, true)
    expect(tick(s).studio.standing.audienceAwareness).toBe(tick(s).studio.standing.audienceAwareness)
  })
})

// ── step order ────────────────────────────────────────────────────────────────
// The contract's placement is BINDING: step 5.5, immediately AFTER BROADCAST and BEFORE
// DEVELOPMENT. Two halves:
//
//  (a) the drift folds the POST-step-4 stock (not the start-of-tick one) — so it runs after
//      STANDING, and exactly once per week;
//  (b) BROADCAST reads the PRE-drift stock. That is decidable because `editorialRelevance`
//      for a release is `mean(audienceAwareness, commercialConfidence)/100`
//      (broadcast.ts:173) and `air ⇔ rankScore ≥ BROADCAST_THRESHOLD`, with
//      `rankScore = K · relevance` where K = magnitude·prominence·novelty·cooldown. K is
//      INDEPENDENT of standing (magnitude compares the weighted audience score — which
//      `computeSegmentAppeal` derives without reading standing — against the production's
//      FROZEN greenlight forecast; prominence is lead fame; novelty/cooldown are history),
//      and `commercialConfidence` reaches NOTHING in the engine except this one term.
//
//      K is therefore COMPUTABLE from the tick's own output, with no reference to the drift:
//        magnitude  = clamp(|Σ share·segmentScores − Σ share·forecastSnapshot.center| / 50, 0, 1)
//        prominence = clamp(lead fame / 100, 0, 1)
//        novelty    = cooldown = 1 for a studio's FIRST aired release (window empty)
//      Bisecting the starting confidence to the air/no-air boundary then discriminates: the
//      boundary must satisfy K·(a_postStanding + c)/200 = THRESHOLD if BROADCAST saw the
//      pre-drift stock, and K·(a_final + c)/200 = THRESHOLD if it saw the post-drift stock.
//      Those two predictions are ~1 confidence point apart and the bisection resolves the
//      boundary to ~1e-6.
//
//  DEVELOPMENT (step 6) reads NO standing channel at all (development.ts takes concept,
//  shape, promise, requiredNegative and criticScore), so "DEVELOPMENT sees the post-drift
//  stock" is vacuous for its own arithmetic; what is observable, and asserted below, is that
//  the state the tick RETURNS carries the post-drift stock.

/** A world one tick before its first release, with the ENGAGED regime armed. */
function preReleaseWorld(seed: string): GameState {
  let s: GameState = generateWorld(seed)
  s = applyActions(s, OracleAgent.chooseActions(s))
  expect(s.studio.activeProductions.length).toBeGreaterThan(0)
  for (let guard = 0; guard < 40; guard++) {
    const p = s.studio.activeProductions[0]
    if (p !== undefined && p.startTick < s.market.tick && p.remainingTicks === 1) break
    s = tick(s)
  }
  const p = s.studio.activeProductions[0]
  expect(p).toBeDefined()
  expect(p!.remainingTicks).toBe(1)
  expect(s.studio.releasedFilms.length).toBe(0)
  return s
}

type ReleaseOutcome = { aired: boolean; aFinal: number; cFinal: number; state: GameState }

function releaseWeek(base: GameState, awareness: number, confidence: number): ReleaseOutcome {
  const armed: GameState = {
    ...base,
    economyEngagedEver: true,
    studio: {
      ...base.studio,
      standing: { audienceAwareness: awareness, industryPrestige: 40, commercialConfidence: confidence },
    },
  }
  // P06A (charter W1): remainingTicks === 1 HOLDS until an explicit commit.
  // `preReleaseWorld` guarantees exactly one production sits at that ready week,
  // so commit it before the single tick this fixture makes — committing adds NO
  // week, so the release still lands on this exact tick.
  const ready = armed.studio.activeProductions.filter((p) => p.remainingTicks === 1)
  const committed =
    ready.length === 0
      ? armed
      : applyActions(
          armed,
          ready.map((p) => ({ kind: 'commitPictureToRelease' as const, productionId: p.id })),
        )
  const out = tick(committed)
  expect(out.studio.releasedFilms.length).toBe(1)
  return {
    aired: out.broadcastItems.length > base.broadcastItems.length,
    aFinal: out.studio.standing.audienceAwareness,
    cFinal: out.studio.standing.commercialConfidence,
    state: out,
  }
}

/**
 * `K = magnitude · prominence · novelty · cooldown` — the standing-INDEPENDENT half of §8's
 * rankScore, assembled from the tick's own output. Requires a first release into an empty
 * broadcast window (novelty = cooldown = 1), which `preReleaseWorld` guarantees.
 */
function rankConstant(base: GameState, out: ReleaseOutcome): number {
  expect(base.broadcastItems.length).toBe(0)
  const prod = base.studio.activeProductions[0]!
  const film = out.state.studio.releasedFilms[0]!
  const centerBySegment = new Map(prod.forecastSnapshot.segments.map((s) => [s.segmentId, s.center]))
  let was = 0
  let center = 0
  for (const seg of base.market.segments) {
    was += seg.share * film.segmentScores[seg.id]
    center += seg.share * centerBySegment.get(seg.id)!
  }
  const magnitude = clamp(Math.abs(was - center) / 50, 0, 1)
  const leadFame = base.talent.find((t) => t.id === prod.cast.lead)!.fame
  const prominence = clamp(leadFame / 100, 0, 1)
  return magnitude * prominence
}

/** Bisect the starting confidence to the exact air/no-air boundary. */
function airBoundary(base: GameState, awareness: number): { c: number; outcome: ReleaseOutcome } | null {
  let lo = 0
  let hi = 100
  if (releaseWeek(base, awareness, hi).aired === releaseWeek(base, awareness, lo).aired) return null
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2
    if (releaseWeek(base, awareness, mid).aired) hi = mid
    else lo = mid
  }
  return { c: hi, outcome: releaseWeek(base, awareness, hi) }
}

/**
 * The same world, made AIRABLE: a star-led cast (prominence ≈ 1) whose greenlight forecast was
 * deliberately pessimistic (per-segment centers/estimates zeroed ⇒ magnitude 1 and direction
 * 'better'). That puts the §8 rank constant K near 1, which is what places the air/no-air
 * boundary inside the 0..100 confidence range at all — an Oracle film matching its own forecast
 * has K ≈ 0.03-0.35 and can never air, so the step-order question would be untestable on it.
 * This edits FIXTURE STATE only; no engine rule is touched.
 */
function withAirableRelease(base: GameState): GameState {
  const prod = base.studio.activeProductions[0]!
  const castIds = new Set([prod.cast.lead, prod.cast.antagonist, prod.cast.support])
  return {
    ...base,
    talent: base.talent.map((t) => (castIds.has(t.id) ? { ...t, fame: 99 } : t)),
    studio: {
      ...base.studio,
      activeProductions: [
        {
          ...prod,
          forecastSnapshot: {
            ...prod.forecastSnapshot,
            segments: prod.forecastSnapshot.segments.map((s) => ({ ...s, center: 0, estimate: 0 })),
          },
        },
      ],
    },
  }
}

describe('D-17B §1 — step 5.5: after STANDING, after BROADCAST, before DEVELOPMENT', () => {
  it('(a) the drift folds the POST-STANDING stock, exactly once per week', () => {
    const base = preReleaseWorld('d17b-order-a')
    // a release moves awareness first (step 4), then the drift takes its cut of THAT value
    const out = releaseWeek(base, 70, 50)
    // invert the drift: a_final = a4·(1−κ) + κ·ANCHOR  ⇒  a4 = (a_final − κ·ANCHOR)/(1−κ)
    const a4 = (out.aFinal - KAPPA * ANCHOR) / (1 - KAPPA)
    expect(a4).toBeGreaterThan(ANCHOR)
    expect(driftOf(a4)).toBeCloseTo(out.aFinal, 10)
    // the release genuinely moved the stock, so this is not the idle case in disguise
    expect(a4).not.toBeCloseTo(70, 6)
    // and applying the drift FIRST (a wrong order) would land somewhere else
    expect(out.aFinal).not.toBeCloseTo(driftOf(70) + (a4 - 70), 6)
  })

  it('(b) BROADCAST is decided on the PRE-drift stock', () => {
    const base = withAirableRelease(preReleaseWorld('d17b-order-b'))
    const boundary = airBoundary(base, 60)
    expect(boundary, 'no air/no-air boundary in the confidence range').not.toBeNull()
    const found = boundary!
    expect(found.c).toBeGreaterThan(1)
    expect(found.c).toBeLessThan(99)
    const K = rankConstant(base, found.outcome)
    expect(K).toBeGreaterThan(0)

    const a4 = (found.outcome.aFinal - KAPPA * ANCHOR) / (1 - KAPPA)
    expect(a4).toBeGreaterThan(ANCHOR)
    const drift = a4 - found.outcome.aFinal
    expect(drift).toBeGreaterThan(0.5) // the two hypotheses are far apart in confidence units

    const scorePre = (K * (a4 + found.outcome.cFinal)) / 200
    const scorePost = (K * (found.outcome.aFinal + found.outcome.cFinal)) / 200

    // the observed boundary sits on the PRE-drift score…
    expect(scorePre).toBeCloseTo(TUNING.BROADCAST_THRESHOLD, 4)
    // …and is decisively NOT the post-drift one
    expect(scorePost).toBeLessThan(TUNING.BROADCAST_THRESHOLD - 1e-3)
  })

  it('(c) the RETURNED state carries the post-drift stock', () => {
    const base = preReleaseWorld('d17b-order-c')
    const out = releaseWeek(base, 90, 50)
    const a4 = (out.aFinal - KAPPA * ANCHOR) / (1 - KAPPA)
    expect(out.aFinal).toBeLessThan(a4) // what the caller sees is post-drift, not post-standing
  })
})
