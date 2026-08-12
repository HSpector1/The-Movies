// ── D-12 studio economy — INDEPENDENT acceptance tests (core engine) ──────────
// Proves the theatrical-run economy's load-bearing properties:
//   • the weekly gross SCHEDULE conserves opening×legs (only the timing changes);
//   • the Hill FAME→opening-reach saturation is monotone, concave, no hard cap;
//   • a release is paid EXACTLY ONCE per week (never a lump in the engaged path), Studio
//     Revenue = blended share × gross, and the ledger reconciles;
//   • overhead is debited once per founded week;
//   • V3→V4 migration records released films as legacyCompleted runs at their FULL-gross
//     V3 payout and NEVER pays them again;
//   • reload-vs-continuous is byte-identical with an active run straddling the save point.
// Seeded RNG only; imports only the public core surface.

import { describe, expect, it } from 'vitest'
import {
  applyActions,
  beginFounding,
  convertV4ToV5,
  convertV5ToV6,
  canAfford,
  convertV3ToV4,
  economyEngaged,
  exportSave,
  fameReach,
  FOUNDING_MINIMUMS,
  generateWorld,
  importSave,
  legacyTheatricalRun,
  makeSave,
  makeSaveV3,
  openTheatricalRun,
  theatricalSchedule,
  tick,
  TUNING,
} from '../src/core/index.js'
import type { CastSlot, CreativeRole, GameState, GameStateV3 } from '../src/core/index.js'

// ── founding + greenlight helpers ──────────────────────────────────────────────
function foundStudio(seed: string): GameState {
  let s = beginFounding(generateWorld(seed))
  const pool = s.founding!.applicantIds.map((id) => s.talent.find((t) => t.id === id)!)
  const byRole = (role: CreativeRole, n: number) => pool.filter((t) => t.role === role).slice(0, n)
  const toSign = [
    ...byRole('actor', FOUNDING_MINIMUMS.actor),
    ...byRole('director', FOUNDING_MINIMUMS.director),
    ...byRole('writer', FOUNDING_MINIMUMS.writer),
    ...byRole('craft', FOUNDING_MINIMUMS.craft),
  ]
  for (const t of toSign) s = applyActions(s, [{ kind: 'signContract', talentId: t.id, termWeeks: 156 }])
  return applyActions(s, [{ kind: 'foundStudio' }])
}
function rosterIds(s: GameState, role: CreativeRole): string[] {
  return s.contracts
    .map((c) => s.talent.find((t) => t.id === c.talentId)!)
    .filter((t) => t.role === role)
    .map((t) => t.id)
}
function greenlightOneFilm(s: GameState): GameState {
  const concept = s.concepts[0]!
  const actors = rosterIds(s, 'actor')
  const cast = { lead: actors[0]!, antagonist: actors[1]!, support: actors[2]! } as Record<CastSlot, string>
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
        writerId: rosterIds(s, 'writer')[0]!,
        directorId: rosterIds(s, 'director')[0]!,
        cast,
        craftIds: [rosterIds(s, 'craft')[0]!],
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
const ledgerSum = (s: GameState) => s.ledger.reduce((a, e) => a + e.amount, 0)
const reconciles = (s: GameState) => Math.abs(s.studio.cash - (TUNING.INITIAL_CASH + ledgerSum(s))) < 0.01

// ── PART 1 — the weekly gross schedule conserves the total ────────────────────

describe('D-12: theatricalSchedule conserves opening × legs (only the timing changes)', () => {
  it.each([
    [10_000_000, 1.8],
    [15_000_000, 2.5],
    [8_000_000, 3.7],
    [40_000_000, 4.0],
  ])('opening=%i legs=%f → Σ weekly = opening×legs, week 1 = opening, length N', (opening, legs) => {
    const sched = theatricalSchedule(opening, legs)
    expect(sched.length).toBe(TUNING.THEATRICAL_WEEKS)
    expect(sched[0]).toBeCloseTo(opening, 2) // week 1 gross ≡ opening
    const sum = sched.reduce((a, b) => a + b, 0)
    expect(sum).toBeCloseTo(opening * legs, 2) // conserved
    expect(sched.every((g) => g >= 0)).toBe(true)
  })

  it('higher legs back-weights the run (a smaller week-1 share of gross)', () => {
    const frontLoaded = theatricalSchedule(10_000_000, 1.8)
    const sleeper = theatricalSchedule(10_000_000, 3.7)
    const share = (sched: number[]) => sched[0]! / sched.reduce((a, b) => a + b, 0)
    expect(share(frontLoaded)).toBeGreaterThan(share(sleeper))
  })
})

// ── PART 2 — the Hill fame→opening-reach saturation ───────────────────────────

describe('D-12: fameReach is a monotone, concave Hill with no hard cap', () => {
  it('matches fame/(fame+K), clamps, and is 0 at fame 0', () => {
    const K = TUNING.FAME_REACH_HALF_SAT
    expect(fameReach(0)).toBe(0)
    expect(fameReach(50)).toBeCloseTo(50 / (50 + K), 6)
    expect(fameReach(100)).toBeCloseTo(100 / (100 + K), 6)
    expect(fameReach(-20)).toBe(0) // clamped
    expect(fameReach(140)).toBe(fameReach(100)) // clamped
  })
  it('is strictly increasing with STRICTLY DIMINISHING marginal reach', () => {
    for (let f = 0; f < 100; f++) expect(fameReach(f + 1)).toBeGreaterThan(fameReach(f))
    const gainLow = fameReach(20) - fameReach(10)
    const gainHigh = fameReach(90) - fameReach(80)
    expect(gainLow).toBeGreaterThan(gainHigh) // 10→20 worth more than 80→90
  })
  it('has no hard cap below fame 100 (100 > 99) and never normalizes to 1.0', () => {
    expect(fameReach(100)).toBeGreaterThan(fameReach(99))
    expect(fameReach(100)).toBeLessThan(1)
  })
})

// ── PART 3 — run builders ─────────────────────────────────────────────────────

describe('D-12: TheatricalRun builders', () => {
  const film = { productionId: 'p1', conceptId: 'c1', releaseTick: 8, boxOffice: { opening: 10_000_000, total: 25_000_000 } } as never
  it('openTheatricalRun locks an active D-12 run (share 0.52, model 1, conserved schedule)', () => {
    const run = openTheatricalRun(film, 10_000_000, 2.5, 8)
    expect(run.status).toBe('active')
    expect(run.weekIndex).toBe(0)
    expect(run.studioShare).toBe(TUNING.STUDIO_RENTAL_BLENDED)
    expect(run.economyModelVersion).toBe(TUNING.ECONOMY_MODEL_VERSION)
    expect(run.weeklyGross.reduce((a, b) => a + b, 0)).toBeCloseTo(25_000_000, 2)
  })
  it('legacyTheatricalRun records a finished full-gross run (share 1.0, model 0, never repayable)', () => {
    const run = legacyTheatricalRun(film)
    expect(run.status).toBe('legacyCompleted')
    expect(run.studioShare).toBe(1.0)
    expect(run.economyModelVersion).toBe(0)
    expect(run.weekIndex).toBe(run.totalWeeks) // finished
    expect(run.cumulativeStudioRevenuePaid).toBe(25_000_000) // the amount ACTUALLY credited under V3
  })
})

// ── PART 4 — engine: a release is paid ONCE per week (no lump), reconciled ─────

describe('D-12: an engaged release is paid weekly (never a lump) and reconciles', () => {
  it('opens a theatrical run, credits Studio Revenue once/week, no boxOffice lump', () => {
    const founded = foundStudio('d12-run')
    expect(economyEngaged(founded)).toBe(true)
    const greenlit = greenlightOneFilmSafe(founded)
    // Advance through production (8) + the whole run (6) + buffer.
    const done = advance(greenlit, TUNING.PRODUCTION_TICKS + TUNING.THEATRICAL_WEEKS + 2)

    const run = done.theatricalRuns.find((r) => r.economyModelVersion === TUNING.ECONOMY_MODEL_VERSION)!
    expect(run).toBeDefined()
    expect(run.status).toBe('completed')
    expect(run.weekIndex).toBe(run.totalWeeks)

    // NO single-lump box-office credit in the engaged path — only weekly studioRevenue.
    expect(done.ledger.filter((e) => e.kind === 'boxOffice').length).toBe(0)
    const revEntries = done.ledger.filter((e) => e.kind === 'studioRevenue' && e.productionId === run.productionId)
    expect(revEntries.length).toBe(run.totalWeeks) // exactly one per week

    const gross = run.weeklyGross.reduce((a, b) => a + b, 0)
    expect(run.cumulativeGrossPaid).toBeCloseTo(gross, 2)
    expect(run.cumulativeStudioRevenuePaid).toBeCloseTo(gross * TUNING.STUDIO_RENTAL_BLENDED, 2)
    // Studio Revenue is the blended share of gross (NOT 100%).
    expect(run.cumulativeStudioRevenuePaid).toBeLessThan(gross)
    expect(reconciles(done)).toBe(true)
  })
})

// ── PART 5 — overhead is debited once per founded week ────────────────────────

describe('D-12: overhead is a base + per-employee weekly debit (engaged, founded)', () => {
  it('debits OVERHEAD_BASE + OVERHEAD_PER_EMPLOYEE × headcount once per tick', () => {
    const founded = foundStudio('d12-oh')
    const stepped = tick(founded)
    const oh = stepped.ledger.filter((e) => e.kind === 'overhead')
    expect(oh.length).toBe(1)
    expect(oh[0]!.amount).toBe(
      -(TUNING.OVERHEAD_BASE + TUNING.OVERHEAD_PER_EMPLOYEE * founded.contracts.length),
    )
  })
})

// ── PART 6 — V3 migration: legacyCompleted, never repaid ──────────────────────

describe('D-12: V3→V4 migration records released films as legacyCompleted (no double-pay)', () => {
  it('migrated releases carry their full-gross V3 payout and are never credited again', () => {
    // Build a state with a released film, then strip theatricalRuns to a frozen V3 shape.
    const founded = foundStudio('d12-mig')
    const withFilm = advance(greenlightOneFilmSafe(founded), TUNING.PRODUCTION_TICKS + 1)
    expect(withFilm.studio.releasedFilms.length).toBeGreaterThan(0)
    const released = withFilm.studio.releasedFilms
    const { theatricalRuns: _drop, ...v3state } = withFilm
    const v4 = convertV3ToV4(makeSaveV3(v3state as GameStateV3))

    // Each released film became a legacyCompleted run at its FULL gross.
    expect(v4.state.theatricalRuns.length).toBe(released.length)
    for (const f of released) {
      const run = v4.state.theatricalRuns.find((r) => r.productionId === f.productionId)!
      expect(run.status).toBe('legacyCompleted')
      expect(run.cumulativeStudioRevenuePaid).toBe(f.boxOffice.total) // NOT restated as 52%
    }
    // Advancing the migrated state adds NO new legacy credit (legacyCompleted is skipped
    // by tick step 3.5) — so a migrated release can never be paid twice.
    const legacyRev = (st: GameState) =>
      st.ledger.filter((e) => e.kind === 'studioRevenue' && released.some((f) => f.productionId === e.productionId)).length
    const liveState = convertV5ToV6(convertV4ToV5(v4)).state // D-17A: run the live V6 shape forward
    const before = legacyRev(liveState)
    const advanced = advance(liveState, 6)
    expect(legacyRev(advanced)).toBe(before) // no NEW legacy credit — no double-pay
  })
})

// ── PART 7 — reload-vs-continuous equivalence (active run straddling the save) ─

describe('D-12: reload equals continuous play with an active run straddling the save', () => {
  it('export at mid-run → import → advance is byte-identical to an uninterrupted run', () => {
    const founded = foundStudio('d12-reload')
    const greenlit = greenlightOneFilmSafe(founded)
    const midRun = advance(greenlit, TUNING.PRODUCTION_TICKS + 2) // a run is now active, straddling
    // Sanity: an active D-12 run exists at the save point.
    expect(midRun.theatricalRuns.some((r) => r.status === 'active')).toBe(true)

    const continuous = advance(midRun, 6)
    const reloaded = importSave(exportSave(makeSave(midRun)))
    if (reloaded.saveVersion !== 6) throw new Error('expected V6')
    const split = advance(reloaded.state, 6)

    expect(exportSave(makeSave(split))).toBe(exportSave(makeSave(continuous)))
  })
})

// ── PART 8 — solvency gate: blocks voluntary overdrafts; unavoidable debits may go neg ─

describe('D-12: solvency gate blocks voluntary overdrafts; unavoidable debits may run negative', () => {
  it('canAfford is a pure IMMEDIATE-transaction check (never future runway)', () => {
    const s = foundStudio('d12-afford')
    expect(canAfford(s, 1000).ok).toBe(true)
    expect(canAfford(s, s.studio.cash).ok).toBe(true) // exactly to zero is allowed
    const over = canAfford(s, s.studio.cash + 1)
    expect(over.ok).toBe(false)
    if (!over.ok) expect(over.reason).toMatch(/insufficient/i)
  })

  it('a greenlight whose immediate commitment exceeds cash is REJECTED by the engine', () => {
    const s = foundStudio('d12-afford-gl')
    const concept = s.concepts[0]!
    const actors = rosterIds(s, 'actor')
    expect(() =>
      applyActions(s, [
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
            writerId: rosterIds(s, 'writer')[0]!,
            directorId: rosterIds(s, 'director')[0]!,
            cast: { lead: actors[0]!, antagonist: actors[1]!, support: actors[2]! },
            craftIds: [rosterIds(s, 'craft')[0]!],
            budget: { negative: concept.baseNegativeCost, marketing: s.studio.cash + 1_000_000 }, // > cash
          },
        },
      ]),
    ).toThrow(/solvency gate/i)
  })

  it('unavoidable weekly payroll + overhead MAY still push cash below zero (no rejection)', () => {
    const s = foundStudio('d12-afford-neg')
    const broke: GameState = { ...s, studio: { ...s.studio, cash: 100 } }
    const stepped = tick(broke) // payroll + overhead exceed 100 → negative, but never rejected
    expect(stepped.studio.cash).toBeLessThan(0)
  })
})

// A greenlight can fail if the roster can't field a legal film; assert it succeeded so the
// economy assertions test a real release (not a silently-skipped one).
function greenlightOneFilmSafe(s: GameState): GameState {
  const out = greenlightOneFilm(s)
  expect(out.studio.activeProductions.length).toBe(1)
  return out
}
