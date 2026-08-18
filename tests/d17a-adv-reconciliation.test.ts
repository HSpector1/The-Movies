// ── D-17A INDEPENDENT ADVERSARIAL TESTS — B. ACCOUNTING CONSERVATION ──────────
// Quality requirement B / the R7 safeguard (contract §1 T3, §4 B):
//   "over any window, Σ per-film allocated fixed cost + unallocated idle burn ≡
//    Σ ledger `payroll` + `overhead` for that window, to the cent."
// and the Phase-0 gate decision (§6): "per-week pro-rata partition of ACTUAL ledger
// payroll+overhead (never recomputed from contracts — C1), equal split, largest-
// remainder with ascending-`productionId` plain-`<` order, integer dollars end-to-end
// (C2)". A per-WEEK partition is additive over windows by construction — so window
// additivity is asserted with `===`, not a tolerance.
//
// The schedules below are deliberately hostile: a founding prefix of varied length
// (weeks that charge NOTHING), two overlapping productions with staggered releases, a
// dead stretch with no production and no runs, a contract expiring mid-run, and a
// release whose occupancy window reaches back to week 0 of engagement.

import { describe, expect, it } from 'vitest'
import {
  allocateFixedCosts,
  applyActions,
  beginFounding,
  exportSave,
  filmOccupancyWindows,
  generateWorld,
  importSave,
  makeSave,
  migrateToV14,
  RngStream,
  stableStringify,
  tick,
  validateSave,
  weeklyBurn,
} from '../src/core/index.js'
import type { AllocationWindow, CastSlot, CreativeRole, GameState } from '../src/core/index.js'

const ROSTER: Record<CreativeRole, number> = { actor: 6, director: 2, writer: 2, craft: 2 }

/** Found a studio; `foundingTicks` weeks are ticked while the founding draft is still OPEN,
 *  which charges neither payroll nor overhead (tick steps 7 / 7.5 gate on founding === null). */
function foundStudio(seed: string, term: number, foundingTicks: number): GameState {
  let s = beginFounding(generateWorld(seed))
  const pool = s.founding!.applicantIds.map((id) => s.talent.find((t) => t.id === id)!)
  const byRole = (role: CreativeRole, n: number) => pool.filter((t) => t.role === role).slice(0, n)
  const toSign = [
    ...byRole('actor', ROSTER.actor),
    ...byRole('director', ROSTER.director),
    ...byRole('writer', ROSTER.writer),
    ...byRole('craft', ROSTER.craft),
  ]
  for (const t of toSign) s = applyActions(s, [{ kind: 'signContract', talentId: t.id, termWeeks: term }])
  for (let i = 0; i < foundingTicks; i++) s = tick(s)
  return applyActions(s, [{ kind: 'foundStudio' }])
}

function rosterOf(s: GameState, role: CreativeRole) {
  return s.contracts.map((c) => s.talent.find((t) => t.id === c.talentId)!).filter((t) => t.role === role)
}

function greenlight(s: GameState, conceptIdx: number, slot: number, negative: number, marketing: number): GameState {
  const a = rosterOf(s, 'actor')
  const w = rosterOf(s, 'writer')
  const d = rosterOf(s, 'director')
  const c = rosterOf(s, 'craft')
  const concept = s.concepts[conceptIdx]!
  const out = applyActions(s, [
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
        writerId: w[slot]!.id,
        directorId: d[slot]!.id,
        cast: {
          lead: a[slot * 3]!.id,
          antagonist: a[slot * 3 + 1]!.id,
          support: a[slot * 3 + 2]!.id,
        } as Record<CastSlot, string>,
        craftIds: [c[slot]!.id],
        budget: { negative, marketing },
      },
    },
  ])
  expect(out.studio.activeProductions.length).toBeGreaterThan(s.studio.activeProductions.length)
  return out
}

const advance = (s: GameState, n: number): GameState => {
  let out = s
  for (let i = 0; i < n; i++) out = tick(out)
  return out
}

/** THE AUTHORITY: Σ ledger payroll+overhead over [from,to], as a POSITIVE amount of dollars spent. */
function ledgerFixedCost(s: GameState, w: AllocationWindow): number {
  let total = 0
  for (const e of s.ledger) {
    if ((e.kind === 'payroll' || e.kind === 'overhead') && e.week >= w.from && e.week <= w.to) total -= e.amount
  }
  return total
}

const allocatedSum = (perFilm: Record<string, { allocated: number }>): number => {
  let sum = 0
  for (const k of Object.keys(perFilm)) sum += perFilm[k]!.allocated
  return sum
}

/** The hostile run:
 *    weeks 0..4   founding draft still open  → NO payroll, NO overhead
 *    week 5       studio founded; film A greenlit    (occupies 5..18)
 *    week 8       film B greenlit, staggered release (occupies 8..21)
 *    weeks 22..39 DEAD STRETCH — no production, no run
 *    week 40      film C greenlit                    (occupies 40..53)
 *    week 52      every contract expires MID-RUN of film C
 *    → week 65 */
function hostileRun(seed: string, foundingTicks: number): GameState {
  let s = foundStudio(seed, 52, foundingTicks)
  s = greenlight(s, 0, 0, 1_200_000, 100_000)
  s = advance(s, 3)
  s = greenlight(s, 1, 1, 1_400_000, 100_000)
  s = advance(s, 20)
  s = advance(s, 12) // dead stretch
  s = greenlight(s, 2, 0, 900_000, 100_000)
  s = advance(s, 25)
  return s
}

// ═════════════════════════════════════════════════════════════════════════════
describe('D-17A/B — Σ perFilm + idle ≡ Σ ledger payroll+overhead, to the dollar', () => {
  it.each([0, 3, 11])('holds over the default window with a founding prefix of %i weeks', (prefix) => {
    const s = hostileRun(`adv-b-prefix-${prefix}`, prefix)
    const alloc = allocateFixedCosts(s)

    // The hostile shape actually materialized.
    expect(s.studio.releasedFilms.length).toBe(3)
    expect(s.contracts.length).toBe(0) // the contracts expired during the run
    expect(alloc.window.from).toBeLessThanOrEqual(0)

    expect(allocatedSum(alloc.perFilm) + alloc.idle).toBe(alloc.total)
    expect(alloc.total).toBe(ledgerFixedCost(s, alloc.window))
    expect(alloc.idle).toBeGreaterThan(0) // the dead stretch is REPORTED, never smeared
    expect(Object.keys(alloc.perFilm).length).toBe(3)
  })

  it('holds over EVERY prefix window [from, k] of the run (a sliding reconciliation sweep)', () => {
    const s = hostileRun('adv-b-sweep', 5)
    const full = allocateFixedCosts(s)
    for (let k = full.window.from; k <= full.window.to; k++) {
      const w = { from: full.window.from, to: k }
      const a = allocateFixedCosts(s, w)
      expect(allocatedSum(a.perFilm) + a.idle).toBe(a.total)
      expect(a.total).toBe(ledgerFixedCost(s, w))
    }
  })

  it('holds when a release sits at week 0 of engagement (occupancy reaching before the ledger)', () => {
    // No founding prefix: film A is greenlit at week 0, so its production window starts at the
    // very first engaged week and its [releaseTick−8 …] reach cannot run off the front.
    let s = foundStudio('adv-b-week0', 156, 0)
    s = greenlight(s, 0, 0, 1_200_000, 100_000)
    s = advance(s, 16)
    const occ = filmOccupancyWindows(s)
    expect(occ.length).toBe(1)
    expect(occ[0]!.from).toBeGreaterThanOrEqual(0) // never a negative week

    const alloc = allocateFixedCosts(s)
    expect(allocatedSum(alloc.perFilm) + alloc.idle).toBe(alloc.total)
    expect(alloc.total).toBe(ledgerFixedCost(s, alloc.window))

    // A window deliberately reaching BEFORE week 0 adds nothing and still reconciles.
    const back = allocateFixedCosts(s, { from: -20, to: alloc.window.to })
    expect(back.total).toBe(alloc.total)
    expect(allocatedSum(back.perFilm) + back.idle).toBe(back.total)
  })
})

describe('D-17A/B — conservation holds mid-flight, not only on tidy finished slates', () => {
  it('holds while a film is still IN PRODUCTION and has never released', () => {
    let s = foundStudio('adv-b-inflight', 156, 0)
    s = greenlight(s, 0, 0, 1_200_000, 100_000)
    s = advance(s, 3)
    expect(s.studio.activeProductions.length).toBe(1)
    expect(s.studio.releasedFilms.length).toBe(0) // nothing has released yet

    const alloc = allocateFixedCosts(s)
    expect(allocatedSum(alloc.perFilm) + alloc.idle).toBe(alloc.total)
    expect(alloc.total).toBe(ledgerFixedCost(s, alloc.window))
    expect(alloc.total).toBeGreaterThan(0)
  })

  it('holds while a theatrical run is still ACTIVE (window ends mid-run)', () => {
    let s = foundStudio('adv-b-midrun', 156, 0)
    s = greenlight(s, 0, 0, 1_200_000, 100_000)
    s = advance(s, 10)
    const active = s.theatricalRuns.find((r) => r.status === 'active')
    expect(active).toBeDefined()
    expect(active!.weekIndex).toBeLessThan(active!.totalWeeks)

    const alloc = allocateFixedCosts(s)
    expect(allocatedSum(alloc.perFilm) + alloc.idle).toBe(alloc.total)
    expect(alloc.total).toBe(ledgerFixedCost(s, alloc.window))
  })

  it('holds on a rosterless post-cliff studio still paying overhead', () => {
    let s = foundStudio('adv-b-postcliff', 52, 0)
    s = greenlight(s, 0, 0, 1_200_000, 100_000)
    s = advance(s, 60) // every contract expires at week 52; overhead keeps being charged
    expect(s.contracts.length).toBe(0)

    const alloc = allocateFixedCosts(s)
    expect(allocatedSum(alloc.perFilm) + alloc.idle).toBe(alloc.total)
    expect(alloc.total).toBe(ledgerFixedCost(s, alloc.window))
    // the post-expiry weeks are pure idle overhead — reported, never smeared onto the old film
    const tail = allocateFixedCosts(s, { from: 52, to: alloc.window.to })
    expect(tail.idle).toBe(tail.total)
    expect(tail.total).toBe(ledgerFixedCost(s, { from: 52, to: alloc.window.to }))
  })
})

describe('D-17A/B — a film is charged only for the weeks it actually occupied the studio', () => {
  it('allocates 0 to every film over a window disjoint from its occupancy', () => {
    const s = hostileRun('adv-b-occupancy', 5)
    const occ = filmOccupancyWindows(s)
    expect(occ.length).toBe(3)

    // The dead stretch: strictly between film B's end and film C's start.
    const dead = { from: occ[1]!.to + 1, to: occ[2]!.from - 1 }
    expect(dead.to).toBeGreaterThanOrEqual(dead.from)
    const a = allocateFixedCosts(s, dead)
    for (const f of occ) expect(a.perFilm[f.productionId]?.allocated ?? 0).toBe(0)
    expect(a.idle).toBe(a.total)
    expect(a.total).toBe(ledgerFixedCost(s, dead))
    expect(a.total).toBeGreaterThan(0) // burn really was being spent — it is just unattributed
  })

  it('charges each film 0 in every window that ends before it starts or starts after it ends', () => {
    const s = hostileRun('adv-b-occupancy2', 5)
    for (const f of filmOccupancyWindows(s)) {
      const before = allocateFixedCosts(s, { from: 0, to: f.from - 1 })
      expect(before.perFilm[f.productionId]?.allocated ?? 0).toBe(0)
      expect(before.perFilm[f.productionId]?.allocatedWeeks ?? 0).toBe(0)
      const after = allocateFixedCosts(s, { from: f.to + 1, to: f.to + 40 })
      expect(after.perFilm[f.productionId]?.allocated ?? 0).toBe(0)
      expect(after.perFilm[f.productionId]?.allocatedWeeks ?? 0).toBe(0)
    }
  })
})

describe('D-17A/B — window additivity (the partition is per WEEK, so splits are exact)', () => {
  it('alloc[a,k] + alloc[k+1,b] === alloc[a,b] per film, per idle, per total — 24 seeded splits', () => {
    const s = hostileRun('adv-b-additivity', 5)
    const whole = allocateFixedCosts(s)
    const span = whole.window.to - whole.window.from
    const rng = RngStream.fromSeed('d17a-adv-split-points')

    for (let i = 0; i < 24; i++) {
      const k = whole.window.from + Math.floor(rng.next() * span)
      const left = allocateFixedCosts(s, { from: whole.window.from, to: k })
      const right = allocateFixedCosts(s, { from: k + 1, to: whole.window.to })

      expect(left.total + right.total).toBe(whole.total)
      expect(left.idle + right.idle).toBe(whole.idle)
      const ids = new Set([
        ...Object.keys(whole.perFilm),
        ...Object.keys(left.perFilm),
        ...Object.keys(right.perFilm),
      ])
      for (const id of ids) {
        expect((left.perFilm[id]?.allocated ?? 0) + (right.perFilm[id]?.allocated ?? 0)).toBe(
          whole.perFilm[id]?.allocated ?? 0,
        )
        expect((left.perFilm[id]?.allocatedWeeks ?? 0) + (right.perFilm[id]?.allocatedWeeks ?? 0)).toBe(
          whole.perFilm[id]?.allocatedWeeks ?? 0,
        )
      }
    }
  })
})

describe('D-17A/B — odd dollars: whole-dollar determinism and a governed tie-break', () => {
  /** A seed whose weekly fixed cost is ODD, so a two-film week cannot split evenly. */
  function oddBurnConcurrentRun(): GameState {
    let s = foundStudio('odd-1', 156, 0)
    expect(weeklyBurn(s) % 2).toBe(1) // the adversarial precondition
    s = greenlight(s, 0, 0, 1_200_000, 100_000)
    s = greenlight(s, 1, 1, 1_200_000, 100_000) // identical occupancy — every week is shared
    return advance(s, 16)
  }

  it('conserves exactly even when the weekly cost is indivisible by the occupant count', () => {
    const s = oddBurnConcurrentRun()
    const a = allocateFixedCosts(s)
    expect(allocatedSum(a.perFilm) + a.idle).toBe(a.total)
    expect(a.total).toBe(ledgerFixedCost(s, a.window))
    // Every reported figure is a whole number of dollars (C2).
    expect(Number.isInteger(a.total)).toBe(true)
    expect(Number.isInteger(a.idle)).toBe(true)
    for (const k of Object.keys(a.perFilm)) expect(Number.isInteger(a.perFilm[k]!.allocated)).toBe(true)
  })

  it('gives the odd dollar to the lower productionId (largest remainder, ascending plain-<)', () => {
    const s = oddBurnConcurrentRun()
    const a = allocateFixedCosts(s)
    const ids = Object.keys(a.perFilm).sort()
    expect(ids.length).toBe(2)
    expect(a.perFilm[ids[0]!]!.allocatedWeeks).toBe(a.perFilm[ids[1]!]!.allocatedWeeks)
    // The two films share every occupied week; each shared week's odd dollar goes to the lower id.
    const sharedWeeks = a.perFilm[ids[0]!]!.allocatedWeeks
    expect(a.perFilm[ids[0]!]!.allocated - a.perFilm[ids[1]!]!.allocated).toBe(sharedWeeks)
  })

  it('is identical across two independent calls and across a save → validate → migrate → load trip', () => {
    const s = oddBurnConcurrentRun()
    const first = stableStringify(allocateFixedCosts(s))
    expect(stableStringify(allocateFixedCosts(s))).toBe(first)

    // Property State V13 (C1-M1a): the live load-to-play entry is migrateToV14.
    const reloaded = migrateToV14(validateSave(importSave(exportSave(makeSave(s)))))
    expect(reloaded.saveVersion).toBe(14)
    expect(stableStringify(allocateFixedCosts(reloaded.state))).toBe(first)

    // …and the hostile schedule survives the same trip.
    const h = hostileRun('adv-b-roundtrip', 5)
    const hFirst = stableStringify(allocateFixedCosts(h))
    const hBack = migrateToV14(validateSave(importSave(exportSave(makeSave(h)))))
    expect(stableStringify(allocateFixedCosts(hBack.state))).toBe(hFirst)
  })
})
