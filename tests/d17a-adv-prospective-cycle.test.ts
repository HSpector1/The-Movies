// ── D-17A INDEPENDENT ADVERSARIAL TESTS — G. THE PROSPECTIVE CYCLE COST ───────
// Contract T3 (prospective): "cycleFixedCost = (PRODUCTION_TICKS + THEATRICAL_WEEKS) ×
// currentWeeklyBurn ÷ expectedConcurrency, displayed with its assumption named; the
// DEFAULT headline uses sole-occupancy (concurrency = 1 …) and states so."
// §6 fixes the basis: "the contract-literal 14 × currentWeeklyBurn on a founding-guarded
// basis" — and T1 names the defect being closed: "the latent §5.10 divergence (unguarded
// `weeklyPayroll` during founding in `weeklyBurn`)".
//
// The authority for "current weekly burn" is not a selector: it is what the TICK actually
// debits. Every assertion below is anchored either to the ledger the tick writes, or to
// the contract's own arithmetic.

import { describe, expect, it } from 'vitest'
import {
  applyActions,
  beginFounding,
  breakEvenGross,
  cycleInclusiveBreakEvenGross,
  generateWorld,
  prospectiveCycleFixedCost,
  tick,
  TUNING,
  weeklyBurn,
  weeklyPayroll,
} from '../src/core/index.js'
import type { CreativeRole, GameState } from '../src/core/index.js'

const ROSTER: Record<CreativeRole, number> = { actor: 6, director: 2, writer: 2, craft: 2 }
const CYCLE_WEEKS = TUNING.PRODUCTION_TICKS + TUNING.THEATRICAL_WEEKS

/** A founding draft with the roster signed but the studio NOT yet founded. */
function midFounding(seed: string): GameState {
  let s = beginFounding(generateWorld(seed))
  const pool = s.founding!.applicantIds.map((id) => s.talent.find((t) => t.id === id)!)
  const byRole = (role: CreativeRole, n: number) => pool.filter((t) => t.role === role).slice(0, n)
  const toSign = [
    ...byRole('actor', ROSTER.actor),
    ...byRole('director', ROSTER.director),
    ...byRole('writer', ROSTER.writer),
    ...byRole('craft', ROSTER.craft),
  ]
  for (const t of toSign) s = applyActions(s, [{ kind: 'signContract', talentId: t.id, termWeeks: 156 }])
  return s
}
const found = (s: GameState): GameState => applyActions(s, [{ kind: 'foundStudio' }])

/** What the tick ACTUALLY debits as fixed cost for the state's current week. */
function ledgerFixedChargeForThisWeek(s: GameState): number {
  const week = s.market.tick
  return tick(s)
    .ledger.filter((e) => (e.kind === 'payroll' || e.kind === 'overhead') && e.week === week)
    .reduce((a, e) => a - e.amount, 0)
}

// ═════════════════════════════════════════════════════════════════════════════
describe('D-17A/G — the cycle is the whole make-and-release cycle, and the split is named', () => {
  it('weeks === PRODUCTION_TICKS + THEATRICAL_WEEKS, and the default assumption is sole occupancy', () => {
    const s = found(midFounding('adv-g-weeks'))
    const sole = prospectiveCycleFixedCost(s)
    expect(sole.weeks).toBe(CYCLE_WEEKS)
    expect(sole.concurrency).toBe(1) // the conservative DEFAULT, stated on the value itself
    expect(sole.amount).toBe(Math.round(sole.weeks * sole.weeklyBurn))
  })

  it('at concurrency 2 the amount is round(weeks × basis ÷ 2) — the named shared-occupancy line', () => {
    const s = found(midFounding('adv-g-conc'))
    const shared = prospectiveCycleFixedCost(s, { concurrency: 2 })
    expect(shared.concurrency).toBe(2)
    expect(shared.weeks).toBe(CYCLE_WEEKS)
    expect(shared.weeklyBurn).toBe(prospectiveCycleFixedCost(s).weeklyBurn) // same basis, split named
    expect(shared.amount).toBe(Math.round((shared.weeks * shared.weeklyBurn) / 2))
    expect(Number.isInteger(shared.amount)).toBe(true) // whole dollars
  })

  it('every concurrency rung is round(weeks × basis ÷ n), and never blends', () => {
    const s = found(midFounding('adv-g-rungs'))
    const basis = prospectiveCycleFixedCost(s).weeklyBurn
    for (const n of [1, 2, 3, 4, 7]) {
      const v = prospectiveCycleFixedCost(s, { concurrency: n })
      expect(v.concurrency).toBe(n)
      expect(v.weeklyBurn).toBe(basis)
      expect(v.amount).toBe(Math.round((CYCLE_WEEKS * basis) / n))
    }
    // a nonsensical concurrency degrades to the CONSERVATIVE sole-occupancy assumption
    expect(prospectiveCycleFixedCost(s, { concurrency: 0 }).concurrency).toBe(1)
    expect(prospectiveCycleFixedCost(s, { concurrency: -3 }).amount).toBe(
      prospectiveCycleFixedCost(s).amount,
    )
  })

  it('the cycle-inclusive break-even is the direct break-even against commitment + cycle cost', () => {
    const s = found(midFounding('adv-g-breakeven'))
    const committed = 2_500_000
    for (const opts of [undefined, { concurrency: 2 }] as const) {
      const be = opts === undefined
        ? cycleInclusiveBreakEvenGross(s, committed)
        : cycleInclusiveBreakEvenGross(s, committed, opts)
      expect(be.direct).toBe(breakEvenGross(committed))
      expect(be.cycleInclusive).toBe(breakEvenGross(committed + be.fixedCost.amount))
      expect(be.cycleInclusive).toBeGreaterThan(be.direct) // the headline is never the friendlier number
      expect(be.fixedCost).toEqual(
        opts === undefined ? prospectiveCycleFixedCost(s) : prospectiveCycleFixedCost(s, opts),
      )
    }
  })
})

describe('D-17A/G — the founding guard (T1): burn is what the tick charges, the basis is projected', () => {
  it('during a founding draft weeklyBurn is 0 — because the tick charges nothing', () => {
    const s = midFounding('adv-g-founding')
    expect(s.founding).not.toBeNull()
    expect(s.contracts.length).toBeGreaterThan(0)
    expect(weeklyPayroll(s)).toBeGreaterThan(0) // salaries EXIST…

    expect(weeklyBurn(s)).toBe(0) // …but nothing is charged yet
    expect(ledgerFixedChargeForThisWeek(s)).toBe(0) // proven against the tick's own ledger
  })

  it('during founding the prospective basis is the PROJECTED post-founding burn (non-zero)', () => {
    const s = midFounding('adv-g-projected')
    const cycle = prospectiveCycleFixedCost(s)
    expect(cycle.weeklyBurn).toBeGreaterThan(0) // the plan is priced, not zeroed
    expect(cycle.amount).toBe(Math.round(CYCLE_WEEKS * cycle.weeklyBurn))

    // and the projection is exactly the burn the studio will actually carry once founded
    const founded = found(s)
    expect(cycle.weeklyBurn).toBe(weeklyBurn(founded))
    expect(cycle.amount).toBe(prospectiveCycleFixedCost(founded).amount)
  })

  it('right after founding closes, weeklyBurn === the payroll + overhead the next tick writes', () => {
    const s = found(midFounding('adv-g-postfounding'))
    const week = s.market.tick
    const stepped = tick(s)

    const payroll = stepped.ledger.find((e) => e.kind === 'payroll' && e.week === week)!
    const overhead = stepped.ledger.find((e) => e.kind === 'overhead' && e.week === week)!
    expect(-payroll.amount).toBe(weeklyPayroll(s))
    expect(-overhead.amount).toBe(TUNING.OVERHEAD_BASE + TUNING.OVERHEAD_PER_EMPLOYEE * s.contracts.length)
    expect(weeklyBurn(s)).toBe(-(payroll.amount + overhead.amount))
    expect(s.studio.cash - stepped.studio.cash).toBe(weeklyBurn(s)) // no runs yet: cash falls by exactly burn
  })

  it('tracks the roster: after firing everyone the basis is overhead alone, still what the tick charges', () => {
    let s = found(midFounding('adv-g-fired'))
    for (const c of [...s.contracts]) s = applyActions(s, [{ kind: 'releaseTalent', talentId: c.talentId }])
    expect(s.contracts.length).toBe(0)

    expect(weeklyBurn(s)).toBe(TUNING.OVERHEAD_BASE)
    expect(ledgerFixedChargeForThisWeek(s)).toBe(TUNING.OVERHEAD_BASE)
    expect(prospectiveCycleFixedCost(s).weeklyBurn).toBe(TUNING.OVERHEAD_BASE)
    expect(prospectiveCycleFixedCost(s).amount).toBe(CYCLE_WEEKS * TUNING.OVERHEAD_BASE)
  })

  it('a never-engaged headless world carries no fixed cycle cost at all', () => {
    const w = generateWorld('adv-g-headless')
    expect(weeklyBurn(w)).toBe(0)
    expect(ledgerFixedChargeForThisWeek(w)).toBe(0)
    expect(prospectiveCycleFixedCost(w).amount).toBe(0)
  })
})
