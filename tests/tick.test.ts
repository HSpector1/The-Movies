// ── §3 tick pipeline — INDEPENDENT contract-derived behavioral tests ─────────
//
// Every expectation is derived from build-contract.md rev. 4 §3 + the NORMATIVE
// resolutions (docs/rev4-open-questions.md: M1 clock, N5 same-tick order, B2/B3
// cadence, B12 context, M9 sim-stream = reception only). The bodies of tick.ts and
// standing.ts are NEVER read; we import ONLY the public surface (src/core/index.ts).
//
// The tick pipeline (§3), fixed order:
//   1 PRODUCTION  advance active productions (M1: only startTick < currentTick)
//   2 RELEASE     finished (remainingTicks 0) enter release; releaseTick stamped
//   3 RECEPTION   resolve released films (§5) — the ONLY sim-stream consumer (M9)
//   4 STANDING    updateStanding on the three channels (§6)
//   5 BROADCAST   select and render
//   [then] market.tick increments as the FINAL step (M1)
//
// M1 arithmetic: a film greenlit at tick t releases DURING tick t+PRODUCTION_TICKS.
// With PRODUCTION_TICKS = 8 and a greenlight at market.tick=0 (startTick 0), the
// film releases on the 9th tick() call with releaseTick === 8.

import { describe, expect, it } from 'vitest'
import {
  applyActions,
  generateWorld,
  resolveShape,
  stableStringify,
  tick,
  TUNING,
  updateStanding,
} from '../src/core/index.js'
import type {
  Action,
  CastSlot,
  GameState,
  Production,
  ReleaseBenchmarks,
  StandingContext,
  Talent,
} from '../src/core/index.js'

const SHAPE = { opening: 'slowSetup', midpoint: 'reversal', ending: 'bittersweet' } as const
const SHAPE_EFFECTS = resolveShape(SHAPE)

// ── helper: greenlight ONE valid package on `state`, choosing talent by role from
// the world and excluding ids already `busy` (concurrent exclusivity, M16). Returns
// the new state plus the exact package pieces the standing cross-check needs.
type Greenlit = {
  state: GameState
  conceptId: string
  budgetNegative: number
  requiredNegative: number
  marketing: number
  baseMarketValue: number
  writer: Talent
  director: Talent
  cast: { lead: Talent; antagonist: Talent; support: Talent }
}

function firstFree(pool: Talent[], busy: Set<string>): Talent {
  const t = pool.find((x) => !busy.has(x.id))
  if (!t) throw new Error('talent pool exhausted for role')
  busy.add(t.id)
  return t
}

// Ids busy in currently-active productions (exclusivity is only among CONCURRENT
// productions — released talent frees up; M16 "at most one active production at a time").
function busyIds(state: GameState): Set<string> {
  const s = new Set<string>()
  for (const p of state.studio.activeProductions) {
    s.add(p.writerId)
    s.add(p.directorId)
    s.add(p.cast.lead)
    s.add(p.cast.antagonist)
    s.add(p.cast.support)
  }
  return s
}

function greenlight(state: GameState, conceptIndex = 0): Greenlit {
  const concept = state.concepts[conceptIndex % state.concepts.length]
  const busy = busyIds(state)
  const writers = state.talent.filter((t) => t.role === 'writer')
  const directors = state.talent.filter((t) => t.role === 'director')
  const actors = state.talent.filter((t) => t.role === 'actor')

  const writer = firstFree(writers, busy)
  const director = firstFree(directors, busy)
  const lead = firstFree(actors, busy)
  const antagonist = firstFree(actors, busy)
  const support = firstFree(actors, busy)

  // requiredNegative per §5.1 = baseNegativeCost * budgetDemandMultiplier * era.costScale.
  const requiredNegative =
    concept.baseNegativeCost * SHAPE_EFFECTS.budgetDemandMultiplier * state.era.costScale
  const budgetNegative = requiredNegative // fund exactly to requirement (overrun 0)

  const production: Omit<Production, 'id' | 'startTick' | 'remainingTicks' | 'forecastSnapshot'> = {
    conceptId: concept.id,
    shape: SHAPE,
    promise: {
      genre: concept.genre, // §M4: promise.genre === concept.genre
      intendedSegments: ['adult'],
      ranges: { intimacy: [-1, 1], tonalWeight: [-1, 1], kineticEnergy: [-1, 1] },
    },
    writerId: writer.id,
    directorId: director.id,
    craftIds: [], // D-4(A): no craft hires in M0A
    cast: { lead: lead.id, antagonist: antagonist.id, support: support.id } as Record<
      CastSlot,
      string
    >,
    budget: { negative: budgetNegative, marketing: TUNING.MARKETING_HALF_SATURATION },
  }
  const action: Action = { kind: 'greenlight', production }
  return {
    state: applyActions(state, [action]),
    conceptId: concept.id,
    budgetNegative,
    requiredNegative,
    marketing: production.budget.marketing, // = TUNING.MARKETING_HALF_SATURATION here
    baseMarketValue: state.market.baseMarketValue, // the market this film releases into
    writer,
    director,
    cast: { lead, antagonist, support },
  }
}

// ─────────────────────────────────────────────────────────────────────────────

// C2a-M4 (§11.8, re-based-not-retired): these two fill-to-capacity loops
// consumed the deleted cap. A TEST-LOCAL slate bound replaces it and every
// assertion below is unchanged — the loops need two pictures in flight, which is
// a fact about the fixture rather than a law of the engine.
const TEST_SLATE_BOUND = 2

describe('§3/M1 skip-first-tick + release timing', () => {
  it('greenlit at market.tick=0 (startTick 0) releases on the 9th tick() call, releaseTick 8', () => {
    const world = generateWorld('tick-timing-1')
    expect(world.market.tick).toBe(0)
    const { state: g } = greenlight(world)
    expect(g.studio.activeProductions).toHaveLength(1)
    expect(g.studio.activeProductions[0].startTick).toBe(0)
    // remainingTicks initialized to PRODUCTION_TICKS at greenlight (B2).
    expect(g.studio.activeProductions[0].remainingTicks).toBe(TUNING.PRODUCTION_TICKS)

    // Advance PRODUCTION_TICKS (=8) times: NOT yet released (skip-first-tick means the
    // greenlight tick t=0 does not advance the film; 8 advancing ticks land it at 0
    // remaining but release happens DURING the 9th call).
    let s = g
    for (let call = 1; call <= TUNING.PRODUCTION_TICKS; call++) {
      s = tick(s)
      expect(s.studio.releasedFilms).toHaveLength(0) // still not released
    }
    // market.tick has advanced to PRODUCTION_TICKS after 8 calls.
    expect(s.market.tick).toBe(TUNING.PRODUCTION_TICKS)

    // P06A W1 hold law: the picture sits at remainingTicks===1 (Release Ready) and
    // HOLDS there until explicitly committed. Committing advances no time (§ W1).
    s = applyActions(s, [
      { kind: 'commitPictureToRelease', productionId: s.studio.activeProductions[0]!.id },
    ])

    // 9th call: the film releases DURING this tick, stamped releaseTick = 8.
    s = tick(s)
    expect(s.studio.releasedFilms).toHaveLength(1)
    expect(s.studio.releasedFilms[0].releaseTick).toBe(TUNING.PRODUCTION_TICKS) // 8
    // market.tick increments last → 9 after the releasing call.
    expect(s.market.tick).toBe(TUNING.PRODUCTION_TICKS + 1)
    // and the production has left activeProductions.
    expect(s.studio.activeProductions).toHaveLength(0)
  })
})

describe('§3/M9 reception is the ONLY sim-stream consumer', () => {
  it('a tick with NO release leaves rngState unchanged', () => {
    const world = generateWorld('tick-rng-1')
    const { state: g } = greenlight(world)
    // applyActions must not touch the sim stream (forecast noise uses a derived stream).
    expect(g.rngState).toBe(world.rngState)

    // Ticks 1..8 have no release → sim stream untouched.
    let s = g
    for (let call = 1; call <= TUNING.PRODUCTION_TICKS; call++) {
      const before = s.rngState
      s = tick(s)
      expect(s.studio.releasedFilms).toHaveLength(0)
      expect(s.rngState).toBe(before) // no reception → no draw → rngState frozen
    }
  })

  it('a tick WITH a release changes rngState (the §5.3 critic draw advanced it)', () => {
    const world = generateWorld('tick-rng-2')
    const { state: g } = greenlight(world)
    let s = g
    for (let i = 0; i < TUNING.PRODUCTION_TICKS; i++) s = tick(s)
    // P06A W1 hold law: commit the Release Ready picture before the releasing tick.
    s = applyActions(s, [
      { kind: 'commitPictureToRelease', productionId: s.studio.activeProductions[0]!.id },
    ])
    const before = s.rngState
    const released = tick(s) // 9th call: reception resolves the film
    expect(released.studio.releasedFilms).toHaveLength(1)
    expect(released.rngState).not.toBe(before) // critic gaussian consumed the stream
  })
})

describe('§3/D-1 cash credit on release', () => {
  it('cash increases by exactly the released film boxOffice.total on the releasing tick', () => {
    const world = generateWorld('tick-cash-1')
    const { state: g } = greenlight(world)
    let s = g
    for (let i = 0; i < TUNING.PRODUCTION_TICKS; i++) s = tick(s)
    // P06A W1 hold law: commit the Release Ready picture before the releasing tick.
    s = applyActions(s, [
      { kind: 'commitPictureToRelease', productionId: s.studio.activeProductions[0]!.id },
    ])
    // The releasing tick is a SINGLE-release tick (one production only).
    const cashBefore = s.studio.cash
    const releasedCountBefore = s.studio.releasedFilms.length
    const after = tick(s)
    expect(after.studio.releasedFilms.length).toBe(releasedCountBefore + 1)
    const newFilm = after.studio.releasedFilms[after.studio.releasedFilms.length - 1]
    const cashDelta = after.studio.cash - cashBefore
    expect(cashDelta).toBeCloseTo(newFilm.boxOffice.total, 6)
  })
})

describe('§6/B12 tick threads updateStanding correctly (cross-check)', () => {
  it('studio.standing after the releasing tick equals updateStanding(prev, film, benchmarks, ctx)', () => {
    const world = generateWorld('tick-standing-1')
    const g = greenlight(world)
    let s = g.state
    for (let i = 0; i < TUNING.PRODUCTION_TICKS; i++) s = tick(s)

    // Capture EVERYTHING the §6 update needs BEFORE the releasing tick:
    // - the production's forecastSnapshot (benchmarks derive from it, §6/B12)
    // - the three cast fames (ctx.castFames)
    // - prev standing
    const prod = s.studio.activeProductions[0]
    const snap = prod.forecastSnapshot
    const prevStanding = { ...s.studio.standing }

    // P06A W1 hold law: commit the Release Ready picture before the releasing tick.
    s = applyActions(s, [{ kind: 'commitPictureToRelease', productionId: prod.id }])

    const after = tick(s)
    expect(after.studio.releasedFilms).toHaveLength(1)
    const releasedFilm = after.studio.releasedFilms[0]

    const benchmarks: ReleaseBenchmarks = {
      expectedOpening: snap.expectedOpening,
      expectedTotal: snap.expectedTotal,
      expectedCriticScore: snap.expectedCriticScore,
    }
    const ctx: StandingContext = {
      castFames: {
        lead: g.cast.lead.fame,
        antagonist: g.cast.antagonist.fame,
        support: g.cast.support.fame,
      },
      actualNegative: g.budgetNegative, // = production.budget.negative (M2)
      requiredNegative: g.requiredNegative, // baseNegativeCost * budgetDemandMultiplier * era.costScale
      // D-6 widened StandingContext: the already-existing release values.
      baseMarketValue: g.baseMarketValue, // reach = boxOffice.total / baseMarketValue
      marketing: g.marketing, // production.budget.marketing
      // committed-cost salaries = Σ(writer + director + cast) resolved talent salaries
      // (craft salaries are 0 in M0A — no craft hires).
      salaries:
        g.writer.salary +
        g.director.salary +
        g.cast.lead.salary +
        g.cast.antagonist.salary +
        g.cast.support.salary,
      // D-17B §1 (E1): the regime the tick captured for this release. This cross-check runs the
      // headless M0A world (no founding, no contracts), so `economyEngaged` is false — the same
      // value tick.ts threads — and the D-6 expectation is unchanged.
      engaged: false,
    }

    const expected = updateStanding(prevStanding, releasedFilm, benchmarks, ctx)
    expect(after.studio.standing).toStrictEqual(expected)
  })
})

describe('§3/M1/B2/B3 exact 10-release timeline + 2 unfinished (D-2 cadence)', () => {
  it('manual driver: releases at ticks 8,9,17,18,26,27,35,36,44,45; 2 unfinished at year end', () => {
    // MANUAL driver (NOT the §13 agents): every tick, if a slot is free, greenlight ONE
    // valid package with talent NOT currently engaged (rotating concepts + disjoint
    // among concurrent productions so M16 exclusivity holds), then tick().
    //
    // Derivation (M1): slot cycle = 9 ticks — a film greenlit at tick t releases during
    // t+8, and its slot is re-greenlit at t+9. Two staggered slots (concurrency 2, B3):
    //   slot A greenlit at 0 → releases 8, re-greenlit 9 → releases 17, 26, 35, 44
    //   slot B greenlit at 1 → releases 9, re-greenlit 10 → releases 18, 27, 36, 45
    // → 10 releases at 8,9,17,18,26,27,35,36,44,45, with two productions greenlit near
    // year end (ticks 45/46) still in flight when the year stops at market.tick 52.
    let s = generateWorld('tick-timeline-1')
    let conceptIdx = 0
    const releaseTicks: number[] = []
    let seen = 0

    for (let currentTick = 0; currentTick <= 51; currentTick++) {
      // sanity: currentTick tracks market.tick before this tick() call.
      expect(s.market.tick).toBe(currentTick)
      if (s.studio.activeProductions.length < TEST_SLATE_BOUND) {
        const { state } = greenlight(s, conceptIdx)
        conceptIdx += 1
        s = state
      }
      // P06A W1 hold law: commit every Release Ready picture before the tick that
      // would otherwise release it — committing advances no time (bounded: at most
      // TEST_SLATE_BOUND productions can ever be ready in the same tick).
      const ready = s.studio.activeProductions.filter((p) => p.remainingTicks === 1)
      if (ready.length > 0) {
        s = applyActions(
          s,
          ready.map((p) => ({ kind: 'commitPictureToRelease' as const, productionId: p.id })),
        )
      }
      s = tick(s)
      const now = s.studio.releasedFilms.length
      for (let k = seen; k < now; k++) releaseTicks.push(s.studio.releasedFilms[k].releaseTick)
      seen = now
    }

    // Year end: 52 tick() calls executed → market.tick 52 (B1).
    expect(s.market.tick).toBe(TUNING.TICKS_PER_YEAR) // 52
    expect(releaseTicks).toEqual([8, 9, 17, 18, 26, 27, 35, 36, 44, 45])
    expect(s.studio.releasedFilms).toHaveLength(10)
    // Exactly two productions remain unfinished (B1: still-active, excluded from stats).
    expect(s.studio.activeProductions).toHaveLength(2)
  })
})

describe('§15.7 determinism / replay', () => {
  it('tick(state) twice on the same input is byte-identical (single releasing tick)', () => {
    const world = generateWorld('tick-det-1')
    const { state: g } = greenlight(world)
    let s = g
    for (let i = 0; i < TUNING.PRODUCTION_TICKS; i++) s = tick(s)
    const a = tick(s)
    const b = tick(s)
    expect(stableStringify(a)).toBe(stableStringify(b))
  })

  it('tick(state) twice is byte-identical on a no-release tick too', () => {
    const world = generateWorld('tick-det-2')
    const { state: g } = greenlight(world)
    const a = tick(g)
    const b = tick(g)
    expect(stableStringify(a)).toBe(stableStringify(b))
  })

  it('a full multi-tick run is reproducible from the seed', () => {
    // Same seed + same manual action sequence → byte-identical end state.
    function run(seed: string): GameState {
      let s = generateWorld(seed)
      let conceptIdx = 0
      for (let currentTick = 0; currentTick <= 51; currentTick++) {
        if (s.studio.activeProductions.length < TEST_SLATE_BOUND) {
          const { state } = greenlight(s, conceptIdx)
          conceptIdx += 1
          s = state
        }
        s = tick(s)
      }
      return s
    }
    const a = run('tick-replay-1')
    const b = run('tick-replay-1')
    expect(stableStringify(a)).toBe(stableStringify(b))
  })
})
