// ── D-12 Phase 1 — Sim to Next Event stops when theatrical runs end ─────────────────────────────────
// The owner pressed "Sim to next event" at Week 22 with two runs in theaters (payment 1 of 6) and no
// productions; it advanced to Week 131, stopping only when cash went negative. Root cause: advanceToNextEvent
// had no run-ending stop branch (a prior "beta P2" decision treated run completion as routine). These tests
// lock in the corrected canonical stop semantics + the engine-derived stop message.

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  greenlight,
  advanceToNextEvent,
  theatricalRuns,
  requiredNegative,
  exportSaveJson,
  importSaveJson,
  selectActiveProductions,
} from '../engine/adapter.ts'
import type { GameState, DraftPackage, CastSlot } from '../engine/adapter.ts'
import { generateWorld, beginFounding, applyActions, tick, roleOVR, ROLE_TO_DISCIPLINE } from '../../../src/core/index.ts'
import { newFoundedGame, foundedRosterIds } from '../test/founding.ts'
import { WeeklySummary } from './WeeklySummary.tsx'

const ORD = { opening: 'mysteryHook', midpoint: 'reversal', ending: 'bittersweet' } as const

// A studio staffed for TWO concurrent films (2 writers / 2 directors / 2 craft / 6 actors).
function foundedTwoCrews(seed: string): GameState {
  let s = beginFounding(generateWorld(seed))
  const pool = s.founding!.applicantIds.map((id) => s.talent.find((t) => t.id === id)!)
  const pickN = (role: string, n: number) =>
    [...pool.filter((t) => t.role === role)].sort((a, b) => roleOVR(b, ROLE_TO_DISCIPLINE[role as 'writer']) - roleOVR(a, ROLE_TO_DISCIPLINE[role as 'writer'])).slice(0, n)
  for (const [role, n] of [['writer', 2], ['director', 2], ['craft', 2], ['actor', 6]] as const)
    for (const t of pickN(role, n)) s = applyActions(s, [{ kind: 'signContract', talentId: t.id, termWeeks: 208 }])
  return applyActions(s, [{ kind: 'foundStudio' }])
}
function twoFilmPkgs(s: GameState): [DraftPackage, DraftPackage] {
  const ids = (role: 'writer' | 'director' | 'craft' | 'actor') =>
    s.contracts.map((c) => s.talent.find((t) => t.id === c.talentId)!).filter((t) => t.role === role).map((t) => t.id)
  const w = ids('writer'), d = ids('director'), c = ids('craft'), a = ids('actor')
  const mk = (ci: number, wi: number, di: number, cci: number, ai: [number, number, number]): DraftPackage => {
    const concept = s.concepts[ci]!
    return {
      conceptId: concept.id, shape: ORD,
      promise: { genre: concept.genre, intendedSegments: ['adult'], ranges: { intimacy: [-0.4, 0.4], tonalWeight: [-0.4, 0.4], kineticEnergy: [-0.4, 0.4] } },
      writerId: w[wi]!, directorId: d[di]!, craftIds: [c[cci]!],
      cast: { lead: a[ai[0]]!, antagonist: a[ai[1]]!, support: a[ai[2]]! } as Record<CastSlot, string>,
      budget: { negative: requiredNegative(concept, ORD, s), marketing: 400_000 },
    }
  }
  return [mk(0, 0, 0, 0, [0, 1, 2]), mk(1, 1, 1, 1, [3, 4, 5])]
}
const gl = (s: GameState, p: DraftPackage) => {
  const g = greenlight(s, p)
  if (!g.ok) throw new Error(g.error)
  return g.next
}
// Advance to the state where TWO runs are active at payment 1 of 6, no productions (the owner's Week 22).
function stageTwoRunsAtPayment1(seed: string): GameState {
  let s = foundedTwoCrews(seed)
  const [a, b] = twoFilmPkgs(s)
  s = gl(gl(s, a), b)
  for (let k = 0; k < 60; k++) {
    const runs = theatricalRuns(s)
    if (runs.length === 2 && runs.every((r) => r.weekIndex === 1)) break
    s = tick(s, { develop: true })
  }
  return s
}
const oneRunPkg = (s: GameState): DraftPackage => {
  const concept = s.concepts[0]!
  const id = (r: 'writer' | 'director' | 'craft' | 'actor', i: number) => foundedRosterIds(s, r)[i]!
  return {
    conceptId: concept.id, shape: ORD,
    promise: { genre: concept.genre, intendedSegments: ['adult'], ranges: { intimacy: [-0.4, 0.4], tonalWeight: [-0.4, 0.4], kineticEnergy: [-0.4, 0.4] } },
    writerId: id('writer', 0), directorId: id('director', 0), craftIds: [id('craft', 0)],
    cast: { lead: id('actor', 0), antagonist: id('actor', 1), support: id('actor', 2) } as Record<CastSlot, string>,
    budget: { negative: requiredNegative(concept, ORD, s), marketing: 400_000 },
  }
}

describe('D-12 P1 — Sim to Next Event stop semantics', () => {
  it('(1,3,4,5) one run at payment 1 of 6 stops at the run end; final payment + payroll/overhead applied once', () => {
    let s = newFoundedGame('sim-one')
    s = gl(s, oneRunPkg(s))
    s = advanceToNextEvent(s).next // to release (run opens)
    const run = s.theatricalRuns.find((r) => r.status === 'active')!
    expect(run.weekIndex).toBe(1) // payment 1 of 6
    const segStart = s.market.tick
    const seg = advanceToNextEvent(s)
    expect(seg.stopReason).toBe('runCompleted') // (1)
    expect(seg.weeks).toBeLessThanOrEqual(run.totalWeeks) // (5) no empty overshoot weeks
    // (3) exactly one Studio-Revenue payment per run week — none skipped/duplicated.
    const sr = seg.next.ledger.filter((e) => e.kind === 'studioRevenue' && e.productionId === run.productionId)
    expect(sr.length).toBe(run.totalWeeks)
    // (4) payroll + overhead applied exactly once per advanced week of THIS segment.
    const inSeg = (k: string) => seg.next.ledger.filter((e) => e.kind === k && e.week >= segStart && e.week < seg.toWeek).length
    expect(inSeg('payroll')).toBe(seg.weeks)
    expect(inSeg('overhead')).toBe(seg.weeks)
  })

  it('(2,12) two same-week runs both end → one stop, both titles reported, no Week-131 overshoot', () => {
    const s = stageTwoRunsAtPayment1('sim-two')
    expect(theatricalRuns(s).filter((r) => r.status === 'active').length).toBe(2)
    expect(selectActiveProductions(s).length).toBe(0)
    const startWeek = s.market.tick
    const seg = advanceToNextEvent(s)
    expect(seg.stopReason).toBe('runCompleted')
    expect(seg.completedRuns.length).toBe(2) // both surfaced
    expect(seg.stopMessage).toMatch(/completed their theatrical runs/)
    // (12) cannot run away: from ~payment 1 of 6 it stops within the runs' remaining weeks, not +100.
    expect(seg.toWeek - startWeek).toBeLessThanOrEqual(6)
    expect(seg.next.studio.cash).toBeGreaterThan(0) // it did NOT sim into the red
  })

  it('(6) a run ending is detected even though the completed run stays in the collection (status completed)', () => {
    let s = newFoundedGame('sim-detect')
    s = gl(s, oneRunPkg(s))
    s = advanceToNextEvent(s).next
    const run = s.theatricalRuns.find((r) => r.status === 'active')!
    const seg = advanceToNextEvent(s)
    // The run is NOT removed — it remains with status 'completed' — yet it was detected as the stop event.
    const stillThere = seg.next.theatricalRuns.find((r) => r.productionId === run.productionId)!
    expect(stillThere.status).toBe('completed')
    expect(seg.completedRuns.map((r) => r.productionId)).toContain(run.productionId)
  })

  it('(7) a film release still stops correctly', () => {
    let s = newFoundedGame('sim-release')
    s = gl(s, oneRunPkg(s))
    const seg = advanceToNextEvent(s)
    expect(seg.stopReason).toBe('release')
    expect(seg.released.length).toBe(1)
  })

  it('(8) a contract event still stops correctly', () => {
    // A short contract with no production/run → the sim stops on the contract event, not a run/cash event.
    let s = beginFounding(generateWorld('sim-contract'))
    const pool = s.founding!.applicantIds.map((id) => s.talent.find((t) => t.id === id)!)
    const ROLES = ['actor', 'director', 'writer', 'craft'] as const
    const MIN = { actor: 4, director: 1, writer: 1, craft: 1 } as const
    for (const role of ROLES)
      for (const t of pool.filter((t) => t.role === role).slice(0, MIN[role]))
        s = applyActions(s, [{ kind: 'signContract', talentId: t.id, termWeeks: 52 }]) // short term
    s = applyActions(s, [{ kind: 'foundStudio' }])
    const seg = advanceToNextEvent(s)
    expect(['contractExpired', 'renewalWindow']).toContain(seg.stopReason)
    expect(seg.stopMessage).toMatch(/contract/i)
  })

  it('(9) the first negative-cash crossing still stops after a full tick', () => {
    // Idle studio (long contracts, no productions/runs): burn eventually crosses cash below $0.
    let s = newFoundedGame('sim-cash', 400) // 400-week contracts so cash crosses before they expire
    const seg = advanceToNextEvent(s)
    expect(seg.stopReason).toBe('cashNegative')
    expect(seg.next.studio.cash).toBeLessThan(0)
    expect(seg.stopMessage).toMatch(/cash crossed below \$0/)
    expect(seg.guardHit).toBe(false)
  })

  it('(10) reloading after the run-completed event preserves the stop week and payments', () => {
    let s = newFoundedGame('sim-reload')
    s = gl(s, oneRunPkg(s))
    s = advanceToNextEvent(s).next
    const seg = advanceToNextEvent(s)
    const round = importSaveJson(exportSaveJson(seg.next))
    expect(round.ok).toBe(true)
    if (!round.ok) return
    // Runs + ledger studio-revenue survive the round-trip byte-for-byte (same stop state).
    expect(exportSaveJson(round.state)).toBe(exportSaveJson(seg.next))
    const run = seg.next.theatricalRuns[0]!
    const reRun = round.state.theatricalRuns.find((r) => r.productionId === run.productionId)!
    expect(reRun.cumulativeStudioRevenuePaid).toBe(run.cumulativeStudioRevenuePaid)
    expect(reRun.status).toBe(run.status)
  })

  it('(11) the UI displays the engine-provided stop reason verbatim (React never infers it)', () => {
    const s = stageTwoRunsAtPayment1('sim-ui')
    const seg = advanceToNextEvent(s)
    render(
      <WeeklySummary
        summary={seg.summary}
        stopReason={seg.stopReason}
        stopMessage={seg.stopMessage}
        weeks={seg.weeks}
        cashNow={seg.next.studio.cash}
        onContinue={() => {}}
      />,
    )
    expect(screen.getByTestId('stop-reason').textContent).toBe(seg.stopMessage)
    expect(screen.getByTestId('stop-reason').textContent).toMatch(/completed their theatrical runs/)
  })
})
