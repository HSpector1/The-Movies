// ── P15B Wave 1: the pure loan law `studio-loan/v1` ─────────────────────────
// Authority (docs/engineering/playability-launch-review/evidence/p14b4-20260919/):
// Owner ruling 3 of 1342-O (explicitly contracted, interest-bearing loans under the shared
// rules; no automatic bailout, no undocumented debt product), charter 1352-A §4.4 as
// amended by 1352-F (Amendment 4: a loan needs max ≥ LOAN_AMOUNT_STEP), reviewed in 1352-B
// and 1352-B2.
//
// Pure `(inputs) => outputs`: no RNG, Date, GameState, save, Bridge or tick hook. Wave 2
// owns the loan contract in state, the `takeLoan` action, the rival policy and the charge.
// Inputs are never mutated. One law for every studio: nothing here reads a studio id or flag.
//
// - Eligible: stage warning or distress, no outstanding loan, not founding, and
//   max ≥ LOAN_AMOUNT_STEP. Stable, recovery and closed studios cannot borrow.
// - Principal: a multiple of LOAN_AMOUNT_STEP in [LOAN_AMOUNT_STEP, max], where
//   max = floor(LOAN_MAX_FIXED_COST_WEEKS · weeklyFixedCost / LOAN_AMOUNT_STEP) · LOAN_AMOUNT_STEP.
// - Interest: flat, total = principal + principal · LOAN_INTEREST_PERCENT / 100, an integer.
// - Schedule: LOAN_TERM_WEEKS installments; installment i (from 0) falls due in week
//   contractedWeek + 1 + i and is floor(total / term) + (i < total mod term ? 1 : 0), so the
//   installments sum exactly to total.
// - No early repayment, refinancing or second loan in v1.
//
// Error messages carry no money value: a rival's figures stay private.

import type { ConditionStage } from './corporateCondition.js'
import { TUNING } from './tuning.js'

export const STUDIO_LOAN_VERSION = 'studio-loan/v1'

export type StudioLoan = {
  principal: number
  total: number
  contractedWeek: number
  /** installments[i] falls due in week contractedWeek + 1 + i. */
  installments: readonly number[]
}

export function loanMaxPrincipal(weeklyFixedCost: number): number {
  if (!(Number.isFinite(weeklyFixedCost) && weeklyFixedCost >= 0)) {
    throw new Error('studio loan: weekly fixed cost must be finite and non-negative')
  }
  const step = TUNING.LOAN_AMOUNT_STEP
  return Math.floor((TUNING.LOAN_MAX_FIXED_COST_WEEKS * weeklyFixedCost) / step) * step
}

export function loanEligible(
  stage: ConditionStage,
  weeklyFixedCost: number,
  state: { hasOutstandingLoan: boolean; founding: boolean },
): boolean {
  return (
    (stage === 'warning' || stage === 'distress') &&
    !state.hasOutstandingLoan &&
    !state.founding &&
    loanMaxPrincipal(weeklyFixedCost) >= TUNING.LOAN_AMOUNT_STEP
  )
}

/**
 * Contracts a loan in `week`. The caller checks eligibility (`loanEligible`); this checks the
 * principal against the law and throws for one that is not a positive multiple of
 * LOAN_AMOUNT_STEP or that exceeds the maximum.
 */
export function contractLoan(principal: number, weeklyFixedCost: number, week: number): StudioLoan {
  if (!Number.isInteger(week)) throw new Error(`studio loan: contract week must be an integer (got ${week})`)
  const step = TUNING.LOAN_AMOUNT_STEP
  if (!(Number.isInteger(principal) && principal > 0 && principal % step === 0)) {
    throw new Error('studio loan: principal must be a positive multiple of LOAN_AMOUNT_STEP')
  }
  if (principal > loanMaxPrincipal(weeklyFixedCost)) {
    throw new Error('studio loan: principal exceeds the maximum for this weekly fixed cost')
  }
  const total = principal + (principal * TUNING.LOAN_INTEREST_PERCENT) / 100
  if (!Number.isInteger(total)) throw new Error('studio loan: total is not an integer; LOAN_AMOUNT_STEP and LOAN_INTEREST_PERCENT disagree')
  const term = TUNING.LOAN_TERM_WEEKS
  const base = Math.floor(total / term)
  const remainder = total % term
  const installments = Array.from({ length: term }, (_, i) => base + (i < remainder ? 1 : 0))
  return { principal, total, contractedWeek: week, installments }
}

/** The installment due in `week`, 0 outside the schedule. */
export function loanInstallmentDue(loan: StudioLoan, week: number): number {
  if (!Number.isInteger(week)) throw new Error(`studio loan: week must be an integer (got ${week})`)
  const i = week - loan.contractedWeek - 1
  return i >= 0 && i < loan.installments.length ? loan.installments[i] : 0
}
