// ── D-17A/T3 retrospective fixed-cost allocation — PROPERTY TESTS ──────────────
// Owner ruling R7's accounting safeguard is the reason this module exists, so it is the
// thing under test: over ANY window,
//     Σ per-film allocated + unallocated idle burn  ===  Σ ledger payroll+overhead
// exactly (`===`, whole dollars, no tolerance), including overlapping productions and idle
// periods (quality requirement B).
//
// Three layers, deliberately:
//   (a) SYNTHETIC FUZZ — seeded random cost series and occupancy sets, so the partition rule
//       is proven on shapes the engine may never produce (empty weeks, gaps, 4-way overlap).
//   (b) ENGINE-DRIVEN — the real tick(), from a founded state, across a founding prefix, a
//       forced 2-slot overlap, idle gaps, a contract expiry mid-run, and a run still active at
//       the window boundary; asserted against the REAL ledger.
//   (c) NEGATIVE CONTROL — a deliberately formula-based allocator (the C1 mistake) must FAIL
//       the same invariant, which is what proves (b) has teeth.
//
// Seeded RNG only; no import of src/harness/**; nothing here mutates state.

import { describe, expect, it } from 'vitest'
import {
  FOUNDING_MINIMUMS,
  RngStream,
  TUNING,
  allocateFixedCostSeries,
  allocateFixedCosts,
  applyActions,
  beginFounding,
  filmOccupancyWindows,
  fixedCostOccupancy,
  generateWorld,
  partitionWeeklyFixedCost,
  tick,
  weeklyPayroll,
} from '../src/core/index.js'
import type { AllocationWindow, CastSlot, CreativeRole, GameState, WeeklyOccupancy } from '../src/core/index.js'

// ── helpers ───────────────────────────────────────────────────────────────────
function sumAllocated(a: { perFilm: Record<string, { allocated: number }> }): number {
  return Object.values(a.perFilm).reduce((s, f) => s + f.allocated, 0)
}

/** the AUTHORITATIVE figure the allocation must reconcile to, read straight off the ledger. */
function ledgerFixedCost(state: GameState, win: AllocationWindow): number {
  let total = 0
  for (const e of state.ledger) {
    if (e.kind !== 'payroll' && e.kind !== 'overhead') continue
    if (e.week < win.from || e.week > win.to) continue
    total -= e.amount
  }
  return total
}

// ══════════════════════════════════════════════════════════════════════════════
// (a) SYNTHETIC FUZZ
// ══════════════════════════════════════════════════════════════════════════════
describe('D-17A/T3 (a) — synthetic fuzz: the per-week partition is exact', () => {
  /** Build a deterministic random series: `weeks` weeks, F(w) ∈ [0, 1e6], 0–4 occupants. */
  function makeSeries(seed: string, weeks: number): WeeklyOccupancy[] {
    const rng = RngStream.fromSeed(seed)
    const pool = ['p-alpha', 'p-beta', 'p-gamma', 'p-delta', 'p-epsilon', 'p-zeta']
    const out: WeeklyOccupancy[] = []
    for (let w = 0; w < weeks; w++) {
      const fixedCost = Math.floor(rng.next() * 1_000_001)
      const n = Math.floor(rng.next() * 5) // 0..4 — deliberately includes empty weeks
      const active: string[] = []
      while (active.length < n) {
        const id = pool[Math.floor(rng.next() * pool.length)]!
        if (!active.includes(id)) active.push(id)
      }
      out.push({ week: w, fixedCost, activeProductionIds: active })
    }
    return out
  }

  it('every single week partitions EXACTLY: Σ shares + idle === F(w)', () => {
    for (const seed of ['fuzz-1', 'fuzz-2', 'fuzz-3']) {
      const series = makeSeries(seed, 400)
      for (const w of series) {
        const a = allocateFixedCostSeries([w], { from: w.week, to: w.week })
        expect(sumAllocated(a) + a.idle).toBe(w.fixedCost)
        expect(a.total).toBe(w.fixedCost)
        // idle is claimed ONLY when nobody occupied the studio
        if (w.activeProductionIds.length === 0) expect(a.idle).toBe(w.fixedCost)
        else expect(a.idle).toBe(0)
        for (const f of Object.values(a.perFilm)) {
          expect(Number.isInteger(f.allocated)).toBe(true)
          expect(f.allocated).toBeGreaterThanOrEqual(0)
          expect(f.allocatedWeeks).toBe(1)
        }
      }
    }
  })

  it('holds over the whole 400-week window, and every share is within one dollar of equal', () => {
    const series = makeSeries('fuzz-window', 400)
    const a = allocateFixedCostSeries(series, { from: 0, to: 399 })
    expect(sumAllocated(a) + a.idle).toBe(a.total)
    expect(a.total).toBe(series.reduce((s, w) => s + w.fixedCost, 0))
    for (const w of series) {
      const n = new Set(w.activeProductionIds).size
      if (n === 0) continue
      const shares = partitionWeeklyFixedCost(w.fixedCost, w.activeProductionIds).map((p) => p.share)
      expect(Math.max(...shares) - Math.min(...shares)).toBeLessThanOrEqual(1)
      expect(shares.reduce((x, y) => x + y, 0)).toBe(w.fixedCost)
    }
  })

  it('is ADDITIVE over ≥100 random sub-window splits (per film, per idle, per total)', () => {
    const series = makeSeries('fuzz-additive', 400)
    const rng = RngStream.fromSeed('fuzz-additive-splits')
    for (let trial = 0; trial < 120; trial++) {
      const a = Math.floor(rng.next() * 380)
      const b = a + 1 + Math.floor(rng.next() * (399 - a))
      const cut = a + Math.floor(rng.next() * (b - a)) // a ≤ cut < b
      const whole = allocateFixedCostSeries(series, { from: a, to: b })
      const left = allocateFixedCostSeries(series, { from: a, to: cut })
      const right = allocateFixedCostSeries(series, { from: cut + 1, to: b })
      expect(left.total + right.total).toBe(whole.total)
      expect(left.idle + right.idle).toBe(whole.idle)
      expect(sumAllocated(left) + sumAllocated(right)).toBe(sumAllocated(whole))
      for (const id of Object.keys(whole.perFilm)) {
        const l = left.perFilm[id]?.allocated ?? 0
        const r = right.perFilm[id]?.allocated ?? 0
        expect(l + r).toBe(whole.perFilm[id]!.allocated)
        const lw = left.perFilm[id]?.allocatedWeeks ?? 0
        const rw = right.perFilm[id]?.allocatedWeeks ?? 0
        expect(lw + rw).toBe(whole.perFilm[id]!.allocatedWeeks)
      }
      // the invariant survives every split
      expect(sumAllocated(whole) + whole.idle).toBe(whole.total)
    }
  })

  it('allocates NOTHING outside a film’s occupancy, and handles gaps / single-film weeks', () => {
    const series: WeeklyOccupancy[] = [
      { week: 0, fixedCost: 15_000, activeProductionIds: [] }, // idle
      { week: 1, fixedCost: 15_000, activeProductionIds: ['p-1'] }, // single film
      { week: 2, fixedCost: 0, activeProductionIds: ['p-1', 'p-2'] }, // zero-cost week
      { week: 3, fixedCost: 15_001, activeProductionIds: ['p-2'] },
      // week 4 absent entirely — a gap in the series
      { week: 5, fixedCost: 99, activeProductionIds: [] },
    ]
    const a = allocateFixedCostSeries(series, { from: 0, to: 5 })
    expect(a.total).toBe(15_000 + 15_000 + 0 + 15_001 + 99)
    expect(a.idle).toBe(15_000 + 99)
    expect(a.perFilm['p-1']!.allocated).toBe(15_000)
    expect(a.perFilm['p-1']!.allocatedWeeks).toBe(2)
    expect(a.perFilm['p-2']!.allocated).toBe(15_001)
    expect(sumAllocated(a) + a.idle).toBe(a.total)

    // a window entirely outside p-1's occupancy gives it nothing at all
    const after = allocateFixedCostSeries(series, { from: 3, to: 5 })
    expect(after.perFilm['p-1']).toBeUndefined()
  })

  it('places the odd dollar deterministically: ascending productionId, plain `<`', () => {
    // 7 split three ways = 2,2,2 with 1 left over → it goes to the FIRST id in ascending order.
    expect(partitionWeeklyFixedCost(7, ['p-3', 'p-1', 'p-2'])).toEqual([
      { productionId: 'p-1', share: 3 },
      { productionId: 'p-2', share: 2 },
      { productionId: 'p-3', share: 2 },
    ])
    // input order cannot change the answer
    expect(partitionWeeklyFixedCost(7, ['p-1', 'p-2', 'p-3'])).toEqual(
      partitionWeeklyFixedCost(7, ['p-2', 'p-3', 'p-1']),
    )
    // two remainder dollars go to the first TWO
    expect(partitionWeeklyFixedCost(17_002, ['b', 'a', 'd', 'c']).map((p) => p.share)).toEqual([
      4251, 4251, 4250, 4250,
    ])
    // ascending is BYTE order (plain `<`), not locale order — 'P' sorts before 'a'
    expect(partitionWeeklyFixedCost(1, ['a', 'P']).map((p) => p.productionId)).toEqual(['P', 'a'])
  })

  it('refuses a fractional cost rather than silently failing to reconcile', () => {
    expect(() => partitionWeeklyFixedCost(10.5, ['p-1', 'p-2'])).toThrow(/whole dollars/)
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// (b) ENGINE-DRIVEN — the real tick, the real ledger
// ══════════════════════════════════════════════════════════════════════════════
function openFounding(seed: string, termWeeks: number, extra = true): GameState {
  let s = beginFounding(generateWorld(seed))
  const pool = s.founding!.applicantIds.map((id) => s.talent.find((t) => t.id === id)!)
  const byRole = (role: CreativeRole, n: number) => pool.filter((t) => t.role === role).slice(0, n)
  const toSign = extra
    ? [...byRole('actor', 6), ...byRole('director', 2), ...byRole('writer', 2), ...byRole('craft', 2)]
    : [
        ...byRole('actor', FOUNDING_MINIMUMS.actor),
        ...byRole('director', FOUNDING_MINIMUMS.director),
        ...byRole('writer', FOUNDING_MINIMUMS.writer),
        ...byRole('craft', FOUNDING_MINIMUMS.craft),
      ]
  for (const t of toSign) s = applyActions(s, [{ kind: 'signContract', talentId: t.id, termWeeks }])
  return s
}
function rosterIdsOf(s: GameState, role: CreativeRole): string[] {
  return s.contracts
    .map((c) => s.talent.find((t) => t.id === c.talentId)!)
    .filter((t) => t.role === role)
    .map((t) => t.id)
}
/** Greenlight using the Nth free slice of the roster, so two films can be in flight at once. */
function greenlight(s: GameState, slot: number): GameState {
  const busy = new Set<string>()
  for (const p of s.studio.activeProductions) {
    busy.add(p.writerId)
    busy.add(p.directorId)
    for (const id of Object.values(p.cast)) busy.add(id)
    for (const id of p.craftIds) busy.add(id)
  }
  const free = (role: CreativeRole) => rosterIdsOf(s, role).filter((id) => !busy.has(id))
  const actors = free('actor')
  const concept = s.concepts[slot]!
  return applyActions(s, [
    {
      kind: 'greenlight',
      production: {
        conceptId: concept.id,
        shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' },
        promise: {
          genre: concept.genre,
          intendedSegments: ['adult'],
          ranges: { intimacy: [-0.5, 0.5], tonalWeight: [-0.5, 0.5], kineticEnergy: [-0.5, 0.5] },
        },
        writerId: free('writer')[0]!,
        directorId: free('director')[0]!,
        cast: { lead: actors[0]!, antagonist: actors[1]!, support: actors[2]! } as Record<CastSlot, string>,
        craftIds: [free('craft')[0]!],
        budget: { negative: concept.baseNegativeCost, marketing: 100_000 },
      },
    },
  ])
}
function advance(s: GameState, n: number): GameState {
  let out = s
  for (let i = 0; i < n; i++) out = tick(out)
  return out
}

/** founding prefix → idle → two overlapping productions → runs → trailing idle. */
function overlapFixture(): GameState {
  let s = openFounding('d17a-alloc-overlap', 156)
  s = advance(s, 3) // FOUNDING PREFIX: three weeks charged nothing at all
  s = applyActions(s, [{ kind: 'foundStudio' }])
  s = advance(s, 2) // IDLE GAP: founded, paying, no film
  s = greenlight(s, 0)
  s = advance(s, 3)
  s = greenlight(s, 1) // FORCED 2-SLOT OVERLAP (MAX_CONCURRENT_PRODUCTIONS = 2)
  s = advance(s, 25) // both produce, both release, both runs complete, then idle again
  return s
}

describe('D-17A/T3 (b) — engine-driven: the allocation reconciles to the real ledger', () => {
  it('the fixture really does contain a founding prefix, an overlap, and idle weeks', () => {
    const s = overlapFixture()
    expect(s.studio.releasedFilms.length).toBe(2)
    expect(s.theatricalRuns.length).toBe(2)
    // nothing was charged before founding …
    expect(s.ledger.filter((e) => e.kind === 'payroll' || e.kind === 'overhead').every((e) => e.week >= 3)).toBe(true)
    const occ = fixedCostOccupancy(s, { from: 0, to: s.market.tick - 1 })
    expect(occ.filter((w) => w.activeProductionIds.length === 2).length).toBeGreaterThan(0) // overlap
    expect(occ.filter((w) => w.activeProductionIds.length === 0 && w.fixedCost > 0).length).toBeGreaterThan(0) // paid idle
    expect(occ.filter((w) => w.fixedCost === 0).length).toBeGreaterThan(0) // the founding prefix
  })

  it('Σ allocated + idle === Σ ledger payroll+overhead over the FULL run', () => {
    const s = overlapFixture()
    const win = { from: 0, to: s.market.tick - 1 }
    const a = allocateFixedCosts(s)
    expect(a.window).toEqual(win)
    expect(a.total).toBe(ledgerFixedCost(s, win))
    expect(sumAllocated(a) + a.idle).toBe(a.total)
    expect(a.total).toBeGreaterThan(0)
    expect(a.idle).toBeGreaterThan(0)
    for (const f of Object.values(a.perFilm)) {
      expect(Number.isInteger(f.allocated)).toBe(true)
      expect(f.allocated).toBeGreaterThan(0)
    }
  })

  it('… and over EVERY sub-window of that run, including ones inside the founding prefix', () => {
    const s = overlapFixture()
    const last = s.market.tick - 1
    for (let from = 0; from <= last; from++) {
      for (let to = from; to <= last; to += 3) {
        const win = { from, to }
        const a = allocateFixedCosts(s, win)
        expect(sumAllocated(a) + a.idle).toBe(a.total)
        expect(a.total).toBe(ledgerFixedCost(s, win))
      }
    }
  })

  it('an overlap week really is split two ways, and a sole-occupancy week is not', () => {
    const s = overlapFixture()
    const occ = fixedCostOccupancy(s, { from: 0, to: s.market.tick - 1 })
    const shared = occ.find((w) => w.activeProductionIds.length === 2 && w.fixedCost > 0)!
    const alone = occ.find((w) => w.activeProductionIds.length === 1 && w.fixedCost > 0)!
    const a = allocateFixedCosts(s, { from: shared.week, to: shared.week })
    expect(Object.keys(a.perFilm)).toHaveLength(2)
    expect(sumAllocated(a)).toBe(shared.fixedCost)
    expect(a.idle).toBe(0)
    const b = allocateFixedCosts(s, { from: alone.week, to: alone.week })
    expect(Object.keys(b.perFilm)).toHaveLength(1)
    expect(sumAllocated(b)).toBe(alone.fixedCost)
  })

  it('the declared window convention holds: 8 production weeks, then the run from releaseTick', () => {
    const s = overlapFixture()
    const film = s.studio.releasedFilms[0]!
    const run = s.theatricalRuns.find((r) => r.productionId === film.productionId)!
    const w = filmOccupancyWindows(s).find((x) => x.productionId === film.productionId)!
    expect(w.from).toBe(film.releaseTick - TUNING.PRODUCTION_TICKS)
    expect(w.to).toBe(film.releaseTick + run.totalWeeks - 1)
    // the release week belongs to the RUN — occupancy is contiguous across the boundary
    const occ = fixedCostOccupancy(s, { from: w.from, to: w.to })
    expect(occ.every((o) => o.activeProductionIds.includes(film.productionId))).toBe(true)
    // and nothing is attributed the week before production or the week after the run
    const before = allocateFixedCosts(s, { from: Math.max(0, w.from - 1), to: Math.max(0, w.from - 1) })
    if (w.from > 0) expect(before.perFilm[film.productionId]).toBeUndefined()
    const after = allocateFixedCosts(s, { from: w.to + 1, to: w.to + 1 })
    expect(after.perFilm[film.productionId]).toBeUndefined()
  })

  it('a run STILL ACTIVE at the window boundary reconciles (the window simply truncates)', () => {
    let s = openFounding('d17a-alloc-active', 156)
    s = applyActions(s, [{ kind: 'foundStudio' }])
    s = greenlight(s, 0)
    s = advance(s, TUNING.PRODUCTION_TICKS + 2) // released, run in progress
    expect(s.theatricalRuns.some((r) => r.status === 'active')).toBe(true)
    const win = { from: 0, to: s.market.tick - 1 }
    const a = allocateFixedCosts(s)
    expect(a.total).toBe(ledgerFixedCost(s, win))
    expect(sumAllocated(a) + a.idle).toBe(a.total)
    const film = s.studio.releasedFilms[0]!
    // the still-running film is charged for the weeks it has actually occupied, no further
    expect(a.perFilm[film.productionId]!.allocatedWeeks).toBeLessThan(
      TUNING.PRODUCTION_TICKS + TUNING.THEATRICAL_WEEKS,
    )
  })

  it('an IN-FLIGHT production is attributed from its stored startTick, truncated at the window end', () => {
    let s = openFounding('d17a-alloc-inflight', 156)
    s = applyActions(s, [{ kind: 'foundStudio' }])
    s = advance(s, 2)
    s = greenlight(s, 0)
    const startTick = s.studio.activeProductions[0]!.startTick
    s = advance(s, 3)
    const a = allocateFixedCosts(s)
    const id = s.studio.activeProductions[0]!.id
    expect(a.perFilm[id]!.allocatedWeeks).toBe(s.market.tick - startTick)
    expect(sumAllocated(a) + a.idle).toBe(a.total)
    expect(a.total).toBe(ledgerFixedCost(s, { from: 0, to: s.market.tick - 1 }))
  })

  it('CONTRACT EXPIRY mid-run: burn drops to bare overhead and the allocation still reconciles', () => {
    let s = openFounding('d17a-alloc-expiry', TUNING.CONTRACT_MIN_WEEKS, false)
    s = applyActions(s, [{ kind: 'foundStudio' }])
    s = advance(s, 44)
    s = greenlight(s, 0) // in flight across the week-52 expiry
    s = advance(s, 20)
    expect(s.contracts).toHaveLength(0) // every founding contract lapsed
    expect(weeklyPayroll(s)).toBe(0)
    const win = { from: 0, to: s.market.tick - 1 }
    const a = allocateFixedCosts(s)
    expect(a.total).toBe(ledgerFixedCost(s, win))
    expect(sumAllocated(a) + a.idle).toBe(a.total)
    // post-expiry the studio still pays OVERHEAD_BASE with an empty roster (D-17A/R2)
    const lastWeek = { from: s.market.tick - 1, to: s.market.tick - 1 }
    expect(ledgerFixedCost(s, lastWeek)).toBe(TUNING.OVERHEAD_BASE)
    expect(allocateFixedCosts(s, lastWeek).total).toBe(TUNING.OVERHEAD_BASE)
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// (c) NEGATIVE CONTROL — the C1 mistake must be caught by this very invariant
// ══════════════════════════════════════════════════════════════════════════════
describe('D-17A/T3 (c) — negative control: a formula-based allocator FAILS the invariant', () => {
  it('recomputing the weekly cost from contracts over-attributes the founding prefix', () => {
    const s = overlapFixture()
    const win = { from: 0, to: s.market.tick - 1 }
    const truthful = allocateFixedCosts(s, win)
    const ledgerTotal = ledgerFixedCost(s, win)
    expect(truthful.total).toBe(ledgerTotal) // the ledger-based allocator reconciles …

    // … the formula-based one does not. It prices the SIGNED roster every week, including the
    // founding weeks in which the tick charged nothing at all (tick.ts:465/:476) — exactly the
    // C1 mistake the design forbids.
    const formulaSeries: WeeklyOccupancy[] = fixedCostOccupancy(s, win).map((w) => ({
      week: w.week,
      fixedCost: weeklyPayroll(s, w.week) + TUNING.OVERHEAD_BASE + TUNING.OVERHEAD_PER_EMPLOYEE * s.contracts.length,
      activeProductionIds: w.activeProductionIds,
    }))
    const formula = allocateFixedCostSeries(formulaSeries, win)
    // it is still internally consistent (it partitions SOMETHING exactly) …
    expect(sumAllocated(formula) + formula.idle).toBe(formula.total)
    // … but what it partitions is not the money the studio spent. THE TEST HAS TEETH.
    expect(formula.total).not.toBe(ledgerTotal)
    expect(formula.total).toBeGreaterThan(ledgerTotal)
  })

  it('the founding prefix is precisely where the two disagree', () => {
    const s = overlapFixture()
    const prefix = { from: 0, to: 2 }
    expect(ledgerFixedCost(s, prefix)).toBe(0) // the engine charged NOTHING
    expect(allocateFixedCosts(s, prefix).total).toBe(0)
    // the formula would have charged a full roster's payroll for those same weeks
    expect(weeklyPayroll(s, 0)).toBeGreaterThan(0)
  })
})
