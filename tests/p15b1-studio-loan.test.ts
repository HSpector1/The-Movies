// ── P15B Wave 1 — the pure loan law `studio-loan/v1`, RED tests (record 1352-C) ──
//
// Authority: 1352-A-p15b-corporate-condition-charter.md §4.4 (the loan law)
// and §5 items 10-14; 1352-F Amendment 4 (zero-fixed-cost loan hole closed:
// `max >= LOAN_AMOUNT_STEP`) and its note ("Installment exactness depends on
// total >= term ... a bounded-term test pins LOAN_AMOUNT_STEP*(100+
// LOAN_INTEREST_PERCENT)/100 >= LOAN_TERM_WEEKS").
//
// NOTE ON MODULE SPLIT: `coverWeeks` is pinned to `src/core/corporateCondition.ts`
// by the brief's PARENT API DECISIONS (not this module), even though it is
// thematically the "does a loan installment lower cover" question (RED item
// 13, `loan-obligation-in-cover`). That leaf lives in
// tests/p15b1-corporate-condition.test.ts, not here; this file only imports
// `src/core/studioLoan.ts`.
//
// RED-BY-DESIGN: `src/core/studioLoan.ts` does not exist yet. Dynamic
// per-test import (`loadLoan()`), same per-leaf-attribution rationale as the
// sibling corporate-condition file and the 1346-C precedent. The exception is
// `tuning-bounded-terms`, which imports only the real, already-existing
// `src/core/tuning.ts` and gets a genuine value-mismatch RED reason.
//
// EXPECTED VALUES: every number is derived BY HAND from the §4.4/§4.5 formula
// text in a comment at its call site, repeated in the handback.

import { describe, expect, it } from 'vitest'
import { TUNING } from '../src/core/tuning.js'

async function loadLoan(): Promise<Record<string, unknown>> {
  return (await import('../src/core/studioLoan.js')) as unknown as Record<string, unknown>
}

function requireFn<T extends (...a: any[]) => any>(mod: Record<string, unknown>, name: string): T {
  const fn = mod[name]
  if (typeof fn !== 'function') {
    throw new Error(
      `RED: src/core/studioLoan.ts does not export a function named '${name}' (got ${typeof fn}). ` +
        'This guard exists so a partially-implemented module fails loudly per-leaf instead of a vacuous pass.',
    )
  }
  return fn as T
}

function requireValue(mod: Record<string, unknown>, name: string): unknown {
  if (!(name in mod)) {
    throw new Error(`RED: src/core/studioLoan.ts does not export a binding named '${name}'.`)
  }
  return mod[name]
}

type ConditionStage = 'stable' | 'warning' | 'distress' | 'recovery' | 'closed'
type LoanEligibleState = { hasOutstandingLoan: boolean; founding: boolean }
type StudioLoan = { principal: number; total: number; contractedWeek: number; installments: readonly number[] }

// ═══════════════════════════════════════════════════════════════════════
// module surface
// ═══════════════════════════════════════════════════════════════════════
describe('p15b studio loan: module surface', () => {
  it('loan-definition-version-export', async () => {
    const mod = await loadLoan()
    expect(requireValue(mod, 'STUDIO_LOAN_VERSION')).toBe('studio-loan/v1')
  })
})

// ═══════════════════════════════════════════════════════════════════════
// 10. loan-eligibility
// ═══════════════════════════════════════════════════════════════════════
describe('p15b studio loan: loan-eligibility', () => {
  it('loan-eligibility-stage-table', async () => {
    const mod = await loadLoan()
    const loanEligible = requireFn<(stage: ConditionStage, wfc: number, s: LoanEligibleState) => boolean>(mod, 'loanEligible')
    const clean: LoanEligibleState = { hasOutstandingLoan: false, founding: false }
    // wfc=10,000 -> max=floor(26*10000/1000)*1000=260,000, well above the
    // 1,000 floor, so only STAGE decides these five.
    expect(loanEligible('stable', 10_000, clean)).toBe(false)
    expect(loanEligible('warning', 10_000, clean)).toBe(true)
    expect(loanEligible('distress', 10_000, clean)).toBe(true)
    expect(loanEligible('recovery', 10_000, clean)).toBe(false)
    expect(loanEligible('closed', 10_000, clean)).toBe(false)
  })

  it('loan-eligibility-one-at-a-time-no-outstanding-loan', async () => {
    const mod = await loadLoan()
    const loanEligible = requireFn<(stage: ConditionStage, wfc: number, s: LoanEligibleState) => boolean>(mod, 'loanEligible')
    expect(loanEligible('warning', 10_000, { hasOutstandingLoan: true, founding: false })).toBe(false)
    expect(loanEligible('distress', 10_000, { hasOutstandingLoan: true, founding: false })).toBe(false)
  })

  it('loan-eligibility-never-while-founding-or-closed', async () => {
    const mod = await loadLoan()
    const loanEligible = requireFn<(stage: ConditionStage, wfc: number, s: LoanEligibleState) => boolean>(mod, 'loanEligible')
    expect(loanEligible('warning', 10_000, { hasOutstandingLoan: false, founding: true })).toBe(false)
    expect(loanEligible('distress', 10_000, { hasOutstandingLoan: false, founding: true })).toBe(false)
    // "closed" is refused by stage alone regardless of founding/loan state.
    expect(loanEligible('closed', 10_000, { hasOutstandingLoan: false, founding: false })).toBe(false)
    expect(loanEligible('closed', 10_000, { hasOutstandingLoan: true, founding: true })).toBe(false)
  })

  it('loan-eligibility-max-below-step-boundary', async () => {
    const mod = await loadLoan()
    const loanEligible = requireFn<(stage: ConditionStage, wfc: number, s: LoanEligibleState) => boolean>(mod, 'loanEligible')
    const clean: LoanEligibleState = { hasOutstandingLoan: false, founding: false }
    // wfc=38 -> 26*38=988, floor(988/1000)=0, max=0 -> ineligible.
    // wfc=39 -> 26*39=1014, floor(1014/1000)=1, max=1,000 -> exactly at the
    // step floor, eligible. This pair pins the boundary exactly.
    expect(loanEligible('warning', 38, clean)).toBe(false)
    expect(loanEligible('warning', 39, clean)).toBe(true)
  })
})

// ═══════════════════════════════════════════════════════════════════════
// 11. loan-principal (+ loan-zero-fixed-cost, 1352-F addition)
// ═══════════════════════════════════════════════════════════════════════
describe('p15b studio loan: loan-principal', () => {
  it('loan-principal-max-formula', async () => {
    const mod = await loadLoan()
    const loanMaxPrincipal = requireFn<(wfc: number) => number>(mod, 'loanMaxPrincipal')
    // max = floor(26 * weeklyFixedCost / 1000) * 1000.
    expect(loanMaxPrincipal(1000)).toBe(26_000) // 26*1000=26000/1000=26 exact
    expect(loanMaxPrincipal(1500)).toBe(39_000) // 26*1500=39000/1000=39 exact
    expect(loanMaxPrincipal(999)).toBe(25_000) // 26*999=25974/1000=25.974 -> floor 25
    expect(loanMaxPrincipal(10_000)).toBe(260_000)
    expect(loanMaxPrincipal(38)).toBe(0) // 26*38=988/1000=0.988 -> floor 0
    expect(loanMaxPrincipal(39)).toBe(1000) // 26*39=1014/1000=1.014 -> floor 1 -> 1000
  })

  it('loan-principal-step-multiples-and-refusals', async () => {
    const mod = await loadLoan()
    const contractLoan = requireFn<(principal: number, wfc: number, week: number) => StudioLoan>(mod, 'contractLoan')
    // wfc=1000 -> max=26,000.
    expect(() => contractLoan(0, 1000, 10)).toThrow() // <= 0
    expect(() => contractLoan(-1000, 1000, 10)).toThrow() // negative
    expect(() => contractLoan(1500, 1000, 10)).toThrow() // not a multiple of 1,000
    expect(() => contractLoan(26_500, 1000, 10)).toThrow() // not a multiple (also above-max territory)
    expect(() => contractLoan(27_000, 1000, 10)).toThrow() // multiple of 1,000, but above max=26,000
    expect(() => contractLoan(26_000, 1000, 10)).not.toThrow() // exactly at max: legal
    expect(() => contractLoan(1000, 1000, 10)).not.toThrow() // exactly at the floor: legal
  })

  it('loan-zero-fixed-cost', async () => {
    const mod = await loadLoan()
    const loanMaxPrincipal = requireFn<(wfc: number) => number>(mod, 'loanMaxPrincipal')
    const loanEligible = requireFn<(stage: ConditionStage, wfc: number, s: LoanEligibleState) => boolean>(mod, 'loanEligible')
    // 1352-F Amendment 4: weeklyFixedCost=0 -> max=0 -> ineligible in both
    // warning and distress, the two stages that would otherwise qualify.
    expect(loanMaxPrincipal(0)).toBe(0)
    const clean: LoanEligibleState = { hasOutstandingLoan: false, founding: false }
    expect(loanEligible('warning', 0, clean)).toBe(false)
    expect(loanEligible('distress', 0, clean)).toBe(false)
    // (remedies() correctly omitting LOAN from the family list at
    // weeklyFixedCost=0 is pinned in tests/p15b1-corporate-condition.test.ts,
    // since `remedies` lives in corporateCondition.ts, not this module.)
  })
})

// ═══════════════════════════════════════════════════════════════════════
// 12. loan-schedule-exact
// ═══════════════════════════════════════════════════════════════════════
describe('p15b studio loan: loan-schedule-exact', () => {
  it('loan-schedule-exact-smallest-total-case', async () => {
    const mod = await loadLoan()
    const contractLoan = requireFn<(principal: number, wfc: number, week: number) => StudioLoan>(mod, 'contractLoan')
    const loanInstallmentDue = requireFn<(loan: StudioLoan, week: number) => number>(mod, 'loanInstallmentDue')
    // principal=1,000, wfc=1,000 (max=26,000, well above): total = 1,000 +
    // 1,000*0.12 = 1,120 (the smallest possible total per 1352-F's own note).
    // term=52. floor(1120/52)=21 (52*21=1,092); remainder=1120-1092=28.
    // So the first 28 installments (i=0..27) are 22, and the remaining 24
    // (i=28..51) are 21. Sum = 28*22 + 24*21 = 616 + 504 = 1,120 exactly.
    const loan = contractLoan(1000, 1000, 100)
    expect(loan.principal).toBe(1000)
    expect(loan.total).toBe(1120)
    expect(loan.contractedWeek).toBe(100)
    expect(loan.installments.length).toBe(52)
    for (const inst of loan.installments) expect(Number.isInteger(inst)).toBe(true)
    expect(loan.installments.reduce((a, b) => a + b, 0)).toBe(1120)
    for (let i = 0; i < 28; i++) expect(loan.installments[i]).toBe(22)
    for (let i = 28; i < 52; i++) expect(loan.installments[i]).toBe(21)

    // First installment due the week after contracting (week 101);
    // week 100 (the contracting week itself) owes nothing.
    expect(loanInstallmentDue(loan, 100)).toBe(0)
    expect(loanInstallmentDue(loan, 101)).toBe(22)
    expect(loanInstallmentDue(loan, 152)).toBe(21) // week 100+52, the 52nd installment (index 51)
    expect(loanInstallmentDue(loan, 153)).toBe(0) // outside the schedule
    expect(loanInstallmentDue(loan, 99)).toBe(0) // before the schedule
  })

  it('loan-schedule-exact-boundary-total-mod-term-is-zero', async () => {
    const mod = await loadLoan()
    const contractLoan = requireFn<(principal: number, wfc: number, week: number) => StudioLoan>(mod, 'contractLoan')
    // principal=13,000 (a multiple of 1,000; wfc=1,000 -> max=26,000, so
    // 13,000 is legal). total = 13,000 * 1.12 = 14,560. 14,560 / 52 = 280
    // exactly (52*280=14,560): the boundary case where total mod term = 0,
    // so every installment is identically 280 with no remainder split.
    const loan = contractLoan(13_000, 1000, 0)
    expect(loan.total).toBe(14_560)
    expect(loan.installments.length).toBe(52)
    for (const inst of loan.installments) expect(inst).toBe(280)
    expect(loan.installments.reduce((a, b) => a + b, 0)).toBe(14_560)
  })
})

// ═══════════════════════════════════════════════════════════════════════
// 14. tuning-bounded-terms (the full §4.5 table, both corporate-condition
//     and loan keys — one unified table in the charter, one leaf here) plus
//     the installment-exactness bound (1352-F note).
// ═══════════════════════════════════════════════════════════════════════
describe('p15b studio loan: tuning-bounded-terms', () => {
  it('tuning-bounded-terms', () => {
    const t = TUNING as unknown as Record<string, number>
    // Exact values, §4.5.
    expect(t.CORPORATE_WARN_COVER_WEEKS).toBe(4)
    expect(t.CORPORATE_WARN_SUSTAIN_WEEKS).toBe(4)
    expect(t.CORPORATE_CLEAR_WEEKS).toBe(4)
    expect(t.CORPORATE_DISTRESS_SUSTAIN_WEEKS).toBe(8)
    expect(t.CORPORATE_RECOVERY_STABLE_WEEKS).toBe(13)
    expect(t.CORPORATE_CLOSURE_DISTRESS_WEEKS).toBe(26)
    expect(t.LOAN_MAX_FIXED_COST_WEEKS).toBe(26)
    expect(t.LOAN_TERM_WEEKS).toBe(52)
    expect(t.LOAN_INTEREST_PERCENT).toBe(12)
    expect(t.LOAN_AMOUNT_STEP).toBe(1000)
    // Ranges: every one of these is a positive integer.
    for (const key of [
      'CORPORATE_WARN_COVER_WEEKS',
      'CORPORATE_WARN_SUSTAIN_WEEKS',
      'CORPORATE_CLEAR_WEEKS',
      'CORPORATE_DISTRESS_SUSTAIN_WEEKS',
      'CORPORATE_RECOVERY_STABLE_WEEKS',
      'CORPORATE_CLOSURE_DISTRESS_WEEKS',
      'LOAN_MAX_FIXED_COST_WEEKS',
      'LOAN_TERM_WEEKS',
      'LOAN_INTEREST_PERCENT',
      'LOAN_AMOUNT_STEP',
    ]) {
      expect(Number.isInteger(t[key])).toBe(true)
      expect(t[key]).toBeGreaterThan(0)
    }
    // Cross-key structural facts asserted directly by the charter text:
    // CORPORATE_CLOSURE_DISTRESS_WEEKS (26) matches LOAN_MAX_FIXED_COST_WEEKS
    // (26) "matches the 26-week loan horizon" (§4.5 reason column).
    expect(t.CORPORATE_CLOSURE_DISTRESS_WEEKS).toBe(t.LOAN_MAX_FIXED_COST_WEEKS)
    // Installment-exactness bound (1352-F note): the smallest possible total
    // (one step, with interest) must be at least one installment per week of
    // the term, i.e. LOAN_AMOUNT_STEP*(100+LOAN_INTEREST_PERCENT)/100 >=
    // LOAN_TERM_WEEKS. At the pinned values: 1000*112/100=1120 >= 52.
    const smallestTotal = (t.LOAN_AMOUNT_STEP * (100 + t.LOAN_INTEREST_PERCENT)) / 100
    expect(smallestTotal).toBe(1120)
    expect(smallestTotal).toBeGreaterThanOrEqual(t.LOAN_TERM_WEEKS)
  })
})
