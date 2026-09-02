// ── D-12 financial read models (economyView.ts) — engine-mirror proofs ─────────
// These read models are the SINGLE money source the UI reads. The point of the suite
// is to prove each figure MIRRORS the engine: overhead == tick step 7.5, next-week run
// revenue == what the very next tick actually credits, runway follows the D-12.16
// current-commitments rule, financeTotals reconciles to cash, and periodSummary sums
// the real ledger. Seeded RNG only; imports only the public core surface.

import { describe, expect, it } from 'vitest'
import {
  TUNING,
  generateWorld,
  beginFounding,
  applyActions,
  tick,
  FOUNDING_MINIMUMS,
  weeklyPayroll,
  weeklyOverhead,
  weeklyBurn,
  runNextWeekRevenue,
  runRemainingRevenue,
  expectedWeeklyRunRevenue,
  runway,
  affordability,
  commitmentPreview,
  breakEvenGross,
  runView,
  activeRunViews,
  financeTotals,
  periodSummary,
  financeView,
} from '../src/core/index.js'
import type { CastSlot, CreativeRole, GameState } from '../src/core/index.js'

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
  return s.contracts.map((c) => s.talent.find((t) => t.id === c.talentId)!).filter((t) => t.role === role).map((t) => t.id)
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
        promise: { genre: concept.genre, intendedSegments: ['adult'], ranges: { intimacy: [-0.5, 0.5], tonalWeight: [-0.5, 0.5], kineticEnergy: [-0.5, 0.5] } },
        writerId: rosterIds(s, 'writer')[0]!,
        directorId: rosterIds(s, 'director')[0]!,
        cast,
        craftIds: [rosterIds(s, 'craft')[0]!],
        budget: { negative: concept.baseNegativeCost, marketing: 100_000 },
      },
    },
  ])
}
// P06A W1 hold law: a production at remainingTicks===1 HOLDS until an explicit
// commitPictureToRelease. Commit every ready picture before each tick so a plain
// N-tick drive still reaches release — committing advances no time.
function advance(s: GameState, n: number): GameState {
  let out = s
  for (let i = 0; i < n; i++) {
    const ready = out.studio.activeProductions.filter((p) => p.remainingTicks === 1)
    if (ready.length > 0) {
      out = applyActions(
        out,
        ready.map((p) => ({ kind: 'commitPictureToRelease' as const, productionId: p.id })),
      )
    }
    out = tick(out)
  }
  return out
}
// A founded studio advanced to just past its first release → exactly one ACTIVE run.
// A film greenlit at week W needs PRODUCTION_TICKS ticks of progress, then RELEASES on the
// following tick (opening the run + crediting week 0 in that same tick) → PRODUCTION_TICKS + 1.
const TICKS_TO_RELEASE = TUNING.PRODUCTION_TICKS + 1
function withActiveRun(seed: string): GameState {
  return advance(greenlightOneFilm(foundStudio(seed)), TICKS_TO_RELEASE)
}

describe('D-12 read models — weekly cost side mirrors the engine', () => {
  it('weeklyOverhead == tick step 7.5 (base + per-contract; 0 when not engaged/founded)', () => {
    const fresh = generateWorld('view-oh') // headless, never engaged
    expect(weeklyOverhead(fresh)).toBe(0)

    const founded = foundStudio('view-oh')
    const expected = TUNING.OVERHEAD_BASE + TUNING.OVERHEAD_PER_EMPLOYEE * founded.contracts.length
    expect(weeklyOverhead(founded)).toBe(expected)

    // and it is exactly what the engine debits: one tick's overhead ledger delta.
    const before = founded.ledger.filter((e) => e.kind === 'overhead').length
    const stepped = tick(founded)
    const ohEntries = stepped.ledger.filter((e) => e.kind === 'overhead')
    expect(ohEntries.length).toBe(before + 1)
    expect(ohEntries.at(-1)!.amount).toBe(-expected)
  })

  it('weeklyBurn == weeklyPayroll + weeklyOverhead', () => {
    const founded = foundStudio('view-burn')
    expect(weeklyBurn(founded)).toBe(weeklyPayroll(founded) + weeklyOverhead(founded))
  })
})

describe('D-12 read models — active-run revenue mirrors the very next tick', () => {
  it('expectedWeeklyRunRevenue predicts EXACTLY the studioRevenue the next tick credits', () => {
    const s = withActiveRun('view-run')
    const runs = s.theatricalRuns.filter((r) => r.status === 'active')
    expect(runs.length).toBe(1)
    const predicted = expectedWeeklyRunRevenue(s)
    expect(predicted).toBeGreaterThan(0)

    const before = s.ledger.filter((e) => e.kind === 'studioRevenue').length
    const stepped = tick(s)
    const newEntries = stepped.ledger.filter((e) => e.kind === 'studioRevenue').slice(before)
    const creditedThisTick = newEntries.reduce((a, e) => a + e.amount, 0)
    expect(creditedThisTick).toBeCloseTo(predicted, 6)
  })

  it('runRemainingRevenue == share × Σ future weekly gross, and drains to 0 at completion', () => {
    const s = withActiveRun('view-remain')
    const run = s.theatricalRuns.find((r) => r.status === 'active')!
    let manual = 0
    for (let w = run.weekIndex; w < run.totalWeeks; w++) manual += run.weeklyGross[w]! * run.studioShare
    expect(runRemainingRevenue(run)).toBeCloseTo(manual, 6)
    expect(runNextWeekRevenue(run)).toBeCloseTo(run.weeklyGross[run.weekIndex]! * run.studioShare, 6)

    // advance to the end of the run → no active runs, remaining 0.
    const done = advance(s, run.totalWeeks)
    for (const r of done.theatricalRuns) expect(runRemainingRevenue(r)).toBe(0)
  })
})

describe('D-12 read models — runway (D-12.16 current commitments only)', () => {
  it('pre-release founded studio (burn, no run revenue) → finite runway = ⌊cash / burn⌋', () => {
    const founded = foundStudio('view-rw')
    expect(expectedWeeklyRunRevenue(founded)).toBe(0)
    const rw = runway(founded)
    expect(rw.infinite).toBe(false)
    expect(rw.weeks).toBe(Math.floor(founded.studio.cash / weeklyBurn(founded)))
    expect(rw.netWeeklyCash).toBe(-weeklyBurn(founded))
  })

  it('an active run out-earning burn → infinite runway (weeks null, "—")', () => {
    const s = withActiveRun('view-rw2')
    // the opening weeks of a competent release pay far more than a small studio's burn.
    expect(expectedWeeklyRunRevenue(s)).toBeGreaterThan(weeklyBurn(s))
    const rw = runway(s)
    expect(rw.infinite).toBe(true)
    expect(rw.weeks).toBeNull()
    expect(rw.netWeeklyCash).toBeGreaterThan(0)
  })
})

describe('D-12 read models — affordability / commitment preview / break-even', () => {
  it('affordability delegates to the engine gate; commitmentPreview reports cashAfter + reason', () => {
    const founded = foundStudio('view-aff')
    const ok = commitmentPreview(founded, 1_000_000)
    expect(ok.affordable).toBe(true)
    expect(ok.cashAfter).toBe(founded.studio.cash - 1_000_000)
    expect(ok.reason).toBeUndefined()
    expect(affordability(founded, 1_000_000)).toEqual({ ok: true })

    const tooMuch = founded.studio.cash + 1
    const bad = commitmentPreview(founded, tooMuch)
    expect(bad.affordable).toBe(false)
    expect(bad.cashAfter).toBe(founded.studio.cash - tooMuch)
    expect(bad.reason).toBeDefined()
    const gate = affordability(founded, tooMuch)
    expect(gate.ok).toBe(false)
    if (!gate.ok) expect(bad.reason).toBe(gate.reason)
  })

  it('break-even gross = cost / share (studio keeps only its rental share)', () => {
    expect(breakEvenGross(5_200_000, 0.52)).toBeCloseTo(10_000_000, 6)
    expect(breakEvenGross(5_200_000)).toBeCloseTo(5_200_000 / TUNING.STUDIO_RENTAL_BLENDED, 6)
  })
})

describe('D-12 read models — run view + ledger reconciliation + period summary', () => {
  it('runView: totalGross = Σ weeklyGross, totalStudioRevenue = share × gross, completionTick', () => {
    const s = withActiveRun('view-rv')
    const [rv] = activeRunViews(s)
    const run = s.theatricalRuns.find((r) => r.status === 'active')!
    expect(rv).toBeDefined()
    expect(rv!.totalGross).toBeCloseTo(run.weeklyGross.reduce((a, b) => a + b, 0), 6)
    expect(rv!.totalStudioRevenue).toBeCloseTo(rv!.totalGross * run.studioShare, 6)
    expect(rv!.completionTick).toBe(run.releaseTick + run.totalWeeks - 1)
    expect(runView(run)).toEqual(rv)
  })

  it('financeTotals.net reconciles to cash − INITIAL_CASH; studioRevenue matches the ledger', () => {
    const s = advance(withActiveRun('view-recon'), 8) // let a full run pay out
    const t = financeTotals(s)
    expect(t.net).toBeCloseTo(s.studio.cash - TUNING.INITIAL_CASH, 4)
    const ledgerSR = s.ledger.filter((e) => e.kind === 'studioRevenue').reduce((a, e) => a + e.amount, 0)
    expect(t.studioRevenue).toBeCloseTo(ledgerSR, 6)
    expect(t.studioRevenue).toBeGreaterThan(0)
  })

  it('periodSummary over the whole run window == the run cumulative Studio Revenue + 1 release', () => {
    const founded = foundStudio('view-period')
    const gl = greenlightOneFilm(founded)
    const releaseState = advance(gl, TICKS_TO_RELEASE)
    const run = releaseState.theatricalRuns.find((r) => r.status === 'active')!
    const end = advance(releaseState, run.totalWeeks) // fully drained
    const finalRun = end.theatricalRuns.find((r) => r.productionId === run.productionId)!

    const sum = periodSummary(end, run.releaseTick, run.releaseTick + run.totalWeeks - 1)
    expect(sum.studioRevenue).toBeCloseTo(finalRun.cumulativeStudioRevenuePaid, 4)
    expect(sum.releases).toBe(1)
    expect(sum.completedRuns).toBe(1)
    expect(sum.weeks).toBe(run.totalWeeks)
  })

  it('financeView bundles the dashboard figures consistently', () => {
    const s = withActiveRun('view-fv')
    const fv = financeView(s)
    expect(fv.cash).toBe(s.studio.cash)
    expect(fv.weeklyBurn).toBe(fv.weeklyPayroll + fv.weeklyOverhead)
    expect(fv.netWeeklyCash).toBe(fv.expectedWeeklyRunRevenue - fv.weeklyBurn)
    expect(fv.activeRuns).toBe(1)
    expect(fv.runway).toEqual(runway(s))
  })
})
