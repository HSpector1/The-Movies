// ── D-17A economy read-model selectors — basic proofs (T1 / T3 / T4 / T5) ──────
// D-17A closes the "three near-copies of runway" defect (T1), adds the prospective
// cycle-inclusive break-even family (T3), promotes the recap's affordability scopes to a
// first-class selector (T4), and adds contract-obligation truth at signing (T5).
//
// These are the BASIC proofs (bounds, founding-guard behaviour, arithmetic identities,
// parity with the surfaces they were extracted from). An independent adversarial pass
// comes later. Seeded RNG only; public core surface only; nothing here mutates state.

import { describe, expect, it } from 'vitest'
import {
  FOUNDING_MINIMUMS,
  applyActions,
  beginFounding,
  commitmentPreview,
  expectedWeeklyRunRevenue,
  financeView,
  foundingRunwayPreview,
  generateWorld,
  projectedWeeklyOverhead,
  runway,
  tick,
  weeklyBurn,
  weeklyOverhead,
  weeklyPayroll,
} from '../src/core/index.js'
import type { CreativeRole, GameState } from '../src/core/index.js'

// ── fixtures (same construction the D-12 economy suite uses) ───────────────────
function openFounding(seed: string): GameState {
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
  return s
}
function foundStudio(seed: string): GameState {
  return applyActions(openFounding(seed), [{ kind: 'foundStudio' }])
}
// ═══════════════════════════════════════════════════════════════════════════════
// T1 — ONE runway / ONE burn
// ═══════════════════════════════════════════════════════════════════════════════
describe('D-17A/T1 — weeklyBurn is the actual-charge basis', () => {
  it('is ZERO while a founding draft is open, even with a fully signed roster', () => {
    const drafting = openFounding('d17a-t1-a')
    expect(drafting.founding).not.toBeNull()
    expect(drafting.contracts.length).toBeGreaterThan(0)
    // the roster exists and is priced …
    expect(weeklyPayroll(drafting)).toBeGreaterThan(0)
    // … but the tick charges neither payroll (tick.ts:465) nor overhead (tick.ts:476).
    expect(weeklyOverhead(drafting)).toBe(0)
    expect(weeklyBurn(drafting)).toBe(0)
  })

  it('a founding tick really does debit nothing — the selector matches the engine', () => {
    const drafting = openFounding('d17a-t1-b')
    const before = drafting.studio.cash
    const after = tick(drafting)
    expect(after.studio.cash).toBe(before)
    expect(after.ledger).toHaveLength(drafting.ledger.length)
    expect(weeklyBurn(drafting)).toBe(0)
  })

  it('post-founding it is exactly payroll + overhead (the pre-D-17A identity is preserved)', () => {
    const founded = foundStudio('d17a-t1-c')
    expect(founded.founding).toBeNull()
    expect(weeklyBurn(founded)).toBe(weeklyPayroll(founded) + weeklyOverhead(founded))
    expect(weeklyBurn(founded)).toBeGreaterThan(0)
  })

  it('runway during founding is infinite (nothing is being charged yet)', () => {
    const drafting = openFounding('d17a-t1-d')
    const rw = runway(drafting)
    expect(rw.infinite).toBe(true)
    expect(rw.weeks).toBeNull()
    expect(rw.netWeeklyCash).toBe(0)
  })

  it('foundingRunwayPreview is UNCHANGED — the deliberate post-founding projection', () => {
    const drafting = openFounding('d17a-t1-e')
    const preview = foundingRunwayPreview(drafting)
    const projectedBurn = weeklyPayroll(drafting) + projectedWeeklyOverhead(drafting)
    expect(projectedBurn).toBeGreaterThan(0)
    expect(preview.infinite).toBe(false)
    expect(preview.weeks).toBe(Math.floor(drafting.studio.cash / projectedBurn))
    expect(preview.netWeeklyCash).toBe(-projectedBurn)
    // it is a PROJECTION past the founding gate, so it deliberately differs from live runway
    expect(preview.weeks).not.toBe(runway(drafting).weeks)
  })

  it('financeView reads the shared burn + runway, and stays self-consistent', () => {
    const founded = foundStudio('d17a-t1-f')
    const fv = financeView(founded)
    expect(fv.weeklyBurn).toBe(weeklyBurn(founded))
    expect(fv.weeklyBurn).toBe(fv.weeklyPayroll + fv.weeklyOverhead)
    expect(fv.netWeeklyCash).toBe(fv.expectedWeeklyRunRevenue - fv.weeklyBurn)
    expect(fv.runway).toEqual(runway(founded))

    // During a founding draft the COMPONENTS still report the contracted roster, while the
    // charge basis is 0 — burn and runway both come from the one authoritative rule.
    const drafting = openFounding('d17a-t1-f')
    const dv = financeView(drafting)
    expect(dv.weeklyPayroll).toBeGreaterThan(0)
    expect(dv.weeklyBurn).toBe(0)
    expect(dv.runway).toEqual(runway(drafting))
    expect(dv.runway.infinite).toBe(true)
  })

  it('commitmentPreview uses the shared rule: same burn/rev, cash reduced, floored at 0', () => {
    const founded = foundStudio('d17a-t1-g')
    const burn = weeklyBurn(founded)
    const rev = expectedWeeklyRunRevenue(founded)
    const amount = 1_000_000
    const p = commitmentPreview(founded, amount)
    expect(p.postWeeklyBurn).toBe(burn)
    expect(p.cashAfter).toBe(founded.studio.cash - amount)
    expect(p.postRunway.weeks).toBe(Math.floor((founded.studio.cash - amount) / (burn - rev)))
    expect(p.postRunway.netWeeklyCash).toBe(rev - burn)

    // an unaffordable commitment is still previewed, with the balance floored at 0 → 0 weeks
    const huge = commitmentPreview(founded, founded.studio.cash * 10)
    expect(huge.affordable).toBe(false)
    expect(huge.cashAfter).toBeLessThan(0)
    expect(huge.postRunway.weeks).toBe(0)
  })
})
