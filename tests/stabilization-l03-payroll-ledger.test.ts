// Stabilization 2026-10-22, audit finding L-03 (CORE-01).
//
// The weekly payroll was debited ONCE (`cash -= payroll`) but written as TWO ledger rows
// (`payroll` and `researchPayroll`), and the research advance debited one total for several
// rows. The ledger validator (construction.ts) folds the ledger row by row and requires
// `state.studio.cash === ledgerCash` EXACTLY. With fractional cash (studio revenue is an
// unrounded share of weekly gross) the single subtraction of a two-row total differs from the
// row-by-row fold by one ULP, and the next tick refused the world. The fix books each row as it
// is pushed, which is byte-identical for every history that validated.
//
// The witness below is found by search, not assumed: a cash value for which IEEE-754 double
// rounding makes `x − (a+b)` differ from `(x − a) − b` for this studio's actual payroll split.
import { beforeAll, describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { hiringMarketIds, weeklyPayroll } from '../src/core/employment.js'
import { makeSave } from '../src/core/save.js'
import { weeklyResearchPayroll } from '../src/core/technology.js'
import { tick } from '../src/core/tick.js'
import { TUNING } from '../src/core/tuning.js'
import type { GameState } from '../src/core/types.js'
import { p13aResearchReady } from '../src/harness/p13a/fixtures.js'

/** One validator-accepted cash movement, booked the way the validator folds it (cash + amount). */
function withRow(state: GameState, amount: number): GameState {
  return { ...state, studio: { ...state.studio, cash: state.studio.cash + amount },
    ledger: [...state.ledger, { week: state.market.tick, kind: amount > 0 ? 'studioRevenue' as const : 'overhead' as const, amount, note: 'stabilization L-03 cash witness' }] }
}

function ledgerFold(state: GameState): number {
  // The validator's own rule: INITIAL_CASH plus every row in order (a native p13a world has no V11 checkpoint).
  let cash: number = TUNING.INITIAL_CASH
  for (const row of state.ledger) cash += row.amount
  return cash
}

describe('L-03: payroll and research rows are booked exactly as the ledger validator folds them', () => {
  let state: GameState, base: number, research: number
  beforeAll(() => {
    let s = p13aResearchReady()
    // One non-scientist contract beside the seated Scientist, so payroll splits into two rows.
    const actor = hiringMarketIds(s).map((id) => s.talent.find((t) => t.id === id)).find((t) => t?.role === 'actor')
    if (actor === undefined) throw new Error('premise: no actor in the hiring market')
    s = applyActions(s, [{ kind: 'signContract', talentId: actor.id, termWeeks: 52 }])
    state = s
    research = weeklyResearchPayroll(s)
    base = weeklyPayroll(s) - research
  }, 180_000)

  it('premise: two payroll rows (base and research) are due at the next advance', () => {
    expect(research).toBeGreaterThan(0)
    expect(base).toBeGreaterThan(0)
    expect(state.studio.cash).toBe(ledgerFold(state))
  })

  it('a fractional cash witness that the single subtraction would have thrown on survives the advance and saves', () => {
    const payroll = base + research
    // One probe advance tells which rows the tick books BEFORE the payroll (the research
    // advance, overheads): their amounts fold onto the opening cash first, so the witness
    // predicate is evaluated on the cash the payroll actually meets.
    const probe = tick(state)
    const probed = probe.ledger.slice(state.ledger.length)
    const probedPayrollAt = probed.findIndex((row) => row.kind === 'payroll')
    expect(probedPayrollAt).toBeGreaterThanOrEqual(0)
    const beforePayroll = probed.slice(0, probedPayrollAt).map((row) => row.amount)
    const prePayroll = (opening: number): number => beforePayroll.reduce((cash, amount) => cash + amount, opening)
    // Double rounding needs the two results in different binades (`x − a` rounds to one grid,
    // the integer `b` then lands the sum on a coarser one) and the opening cash to carry at
    // least two mantissa bits below the finer grid. Which balances qualify depends on this
    // studio's own split, so the search walks every whole balance up to the payroll's order
    // of magnitude, with its lowest three bits in every setting, positive balances first. Each
    // candidate is CONSTRUCTED: two hand-booked rows (no producer writes them) that fold
    // exactly as the validator folds them, one movement to a whole balance and one fractional
    // share on top, standing in for the "fractional cash near zero" state the P15B economy
    // designs for.
    const ulp = (n: number): number => 2 ** (Math.floor(Math.log2(n)) - 52)
    const findWitness = (): GameState | null => {
      for (const sign of [1, -1]) {
        for (let n = 1; n <= 32_768; n++) {
          for (let j = 1; j <= 7; j++) {
            const x = sign * (n + j * ulp(n))
            const pre = prePayroll(x)
            if (pre - payroll === (pre - base) - research) continue
            const candidate = withRow(withRow(state, sign * n - state.studio.cash), sign * j * ulp(n))
            if (candidate.studio.cash !== x || ledgerFold(candidate) !== x) continue
            return candidate
          }
        }
      }
      return null
    }
    const witness = findWitness()
    expect(witness, 'premise: a double-rounding witness exists for this payroll split').not.toBeNull()
    const next = tick(witness!)
    expect(next.studio.cash).toBe(ledgerFold(next))
    // The proof that the single subtraction would have failed the fold: on the cash the payroll
    // met, `x − (a+b)` and `(x − a) − b` differ.
    const rows = next.ledger.slice(witness!.ledger.length)
    const payrollAt = rows.findIndex((row) => row.kind === 'payroll')
    const met = rows.slice(0, payrollAt).reduce((cash, row) => cash + row.amount, witness!.studio.cash)
    expect(met - payroll).not.toBe((met - base) - research)
    expect(rows.filter((row) => row.kind === 'payroll' || row.kind === 'researchPayroll').map((row) => row.amount)).toEqual([-base, -research])
    expect(() => makeSave(next)).not.toThrow()
    expect(() => tick(next)).not.toThrow()
  }, 20_000)
})
