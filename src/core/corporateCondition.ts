// ── P15B Wave 1: the pure corporate condition law `corporate-condition/v1` ───
// Authority (docs/engineering/playability-launch-review/evidence/p14b4-20260919/):
// Owner ruling 3 of 1342-O (player and rival studios can fail, only after warnings and
// meaningful recovery opportunities), charter 1352-A §4 as amended by 1352-F (Amendments 1-4)
// and ruled by 1352-F2 (first evaluation, distressWeeks, causes), reviewed in 1352-B and
// 1352-B2, with the parent's API decisions on the 1352 RED.
//
// Pure `(inputs) => outputs`: no RNG, Date, GameState, save, Bridge or tick hook. Wave 2
// owns the fact adapter, the condition root, events and the weekly step. Inputs are never
// mutated. The law reads no studio id or flag, so every studio follows it identically.
//
// Each evaluated week, with end-of-week facts:
// - O = weeklyFixedCost + loanInstallment; cover = cash / O, or ±∞ by the sign of cash
//   when O = 0 (+∞ for cash ≥ 0). low = cover < CORPORATE_WARN_COVER_WEEKS; negative =
//   cash < 0 (a negative week is always low).
// - Counter step, from prev: lowRun = low ? prev + 1 : 0; negativeRun = negative ? prev + 1
//   : 0; clearRun = low ? 0 : prev + 1; distressWeeks = prev.stage = distress ? prev + 1 : 0.
// - Transition step, at most one row, in this order within the stage (TUNING.CORPORATE_*):
//     stable   | lowRun ≥ WARN_SUSTAIN_WEEKS                            → warning
//     warning  | negativeRun ≥ DISTRESS_SUSTAIN_WEEKS                   → distress
//     warning  | clearRun ≥ CLEAR_WEEKS                                 → stable
//     distress | not low                                               → recovery
//     distress | distressWeeks ≥ CLOSURE_DISTRESS_WEEKS and negative    → closed
//     recovery | lowRun ≥ WARN_SUSTAIN_WEEKS                            → warning
//     recovery | clearRun ≥ RECOVERY_STABLE_WEEKS                       → stable
//   closed is absorbing: the step refuses a closed studio.
// - A transition into distress sets distressWeeks to 1; distressWeeks is 0 in every other
//   stage, closed included (1352-F2 ruling 2).
// - The first evaluation (prev = null) steps from a zero condition: stable, every counter 0,
//   since = facts.week, week = facts.week − 1 (1352-F2 ruling 1).
//
// Causes are integer durations read from the counter step of the transition week, never a
// cash or cover value (1352-F2 ruling 3): LOW_COVER = lowRun, NEGATIVE_CASH = negativeRun,
// DISTRESS_DURATION = distressWeeks before the transition resets it, COVER_RESTORED =
// clearRun. Per row: → warning [LOW_COVER, NEGATIVE_CASH if negativeRun > 0]; warning →
// distress [NEGATIVE_CASH, LOW_COVER]; → stable and → recovery [COVER_RESTORED]; distress →
// closed [DISTRESS_DURATION, NEGATIVE_CASH].
//
// Error messages carry no money value: a rival's figures stay private.

import { loanEligible } from './studioLoan.js'
import { TUNING } from './tuning.js'

export const CORPORATE_CONDITION_VERSION = 'corporate-condition/v1'

export type ConditionStage = 'stable' | 'warning' | 'distress' | 'recovery' | 'closed'
export type ConditionFacts = { week: number; cash: number; weeklyFixedCost: number; loanInstallment: number }
/** `week` is the last evaluated week; `since` is the week the current stage began. */
export type Condition = {
  stage: ConditionStage
  since: number
  week: number
  lowRun: number
  negativeRun: number
  clearRun: number
  distressWeeks: number
}
export type ConditionCause = { code: 'LOW_COVER' | 'NEGATIVE_CASH' | 'DISTRESS_DURATION' | 'COVER_RESTORED'; weeks: number }
/** At most 5 causes (annex E.4); v1 emits at most 2. */
export type ConditionTransition = { from: ConditionStage; to: ConditionStage; week: number; causes: ConditionCause[] }
export type RemedyFamily = 'LOAN' | 'REDUCE_OBLIGATIONS' | 'RELEASE'
export type RemedyCapability = {
  hasPendingRelease: boolean
  terminableContracts: number
  hasOutstandingLoan: boolean
  founding: boolean
}

const STAGES: readonly ConditionStage[] = ['stable', 'warning', 'distress', 'recovery', 'closed']

function assertFacts(facts: ConditionFacts): void {
  if (!Number.isInteger(facts.week)) throw new Error(`corporate condition: week must be an integer (got ${facts.week})`)
  if (!Number.isFinite(facts.cash)) throw new Error(`corporate condition: week ${facts.week} cash must be finite`)
  if (!(Number.isFinite(facts.weeklyFixedCost) && facts.weeklyFixedCost >= 0)) {
    throw new Error(`corporate condition: week ${facts.week} weekly fixed cost must be finite and non-negative`)
  }
  if (!(Number.isInteger(facts.loanInstallment) && facts.loanInstallment >= 0)) {
    throw new Error(`corporate condition: week ${facts.week} loan installment must be a non-negative integer`)
  }
}

function assertStage(stage: ConditionStage): void {
  if (!STAGES.includes(stage)) throw new Error(`corporate condition: unknown stage ${String(stage)}`)
}

function assertCondition(c: Condition): void {
  assertStage(c.stage)
  for (const n of [c.since, c.week, c.lowRun, c.negativeRun, c.clearRun, c.distressWeeks]) {
    if (!Number.isInteger(n)) throw new Error('corporate condition: a condition field is not an integer')
  }
  if (c.lowRun < 0 || c.negativeRun < 0 || c.clearRun < 0 || c.distressWeeks < 0) {
    throw new Error('corporate condition: a condition counter is negative')
  }
}

/** Weeks of obligations the cash covers: cash / O, with O = 0 giving ±∞ by the sign of cash. */
export function coverWeeks(facts: ConditionFacts): number {
  assertFacts(facts)
  const obligation = facts.weeklyFixedCost + facts.loanInstallment
  if (obligation > 0) return facts.cash / obligation
  return facts.cash >= 0 ? Infinity : -Infinity
}

export function stepCondition(
  prev: Condition | null,
  facts: ConditionFacts,
): { next: Condition; transition: ConditionTransition | null } {
  assertFacts(facts)
  let from: Condition
  if (prev === null) {
    from = { stage: 'stable', since: facts.week, week: facts.week - 1, lowRun: 0, negativeRun: 0, clearRun: 0, distressWeeks: 0 }
  } else {
    assertCondition(prev)
    if (prev.stage === 'closed') throw new Error('corporate condition: a closed studio is not evaluated')
    if (facts.week !== prev.week + 1) {
      throw new Error(`corporate condition: week ${facts.week} does not follow the last evaluated week ${prev.week}`)
    }
    from = prev
  }

  const low = coverWeeks(facts) < TUNING.CORPORATE_WARN_COVER_WEEKS
  const negative = facts.cash < 0
  const lowRun = low ? from.lowRun + 1 : 0
  const negativeRun = negative ? from.negativeRun + 1 : 0
  const clearRun = low ? 0 : from.clearRun + 1
  const distressWeeks = from.stage === 'distress' ? from.distressWeeks + 1 : 0

  const lowCover: ConditionCause = { code: 'LOW_COVER', weeks: lowRun }
  const negativeCash: ConditionCause = { code: 'NEGATIVE_CASH', weeks: negativeRun }
  const coverRestored: ConditionCause = { code: 'COVER_RESTORED', weeks: clearRun }
  const warningCauses = (): ConditionCause[] => (negativeRun > 0 ? [lowCover, negativeCash] : [lowCover])

  let fired: { to: ConditionStage; causes: ConditionCause[] } | null = null
  switch (from.stage) {
    case 'stable':
      if (lowRun >= TUNING.CORPORATE_WARN_SUSTAIN_WEEKS) fired = { to: 'warning', causes: warningCauses() }
      break
    case 'warning':
      if (negativeRun >= TUNING.CORPORATE_DISTRESS_SUSTAIN_WEEKS) fired = { to: 'distress', causes: [negativeCash, lowCover] }
      else if (clearRun >= TUNING.CORPORATE_CLEAR_WEEKS) fired = { to: 'stable', causes: [coverRestored] }
      break
    case 'distress':
      if (!low) fired = { to: 'recovery', causes: [coverRestored] }
      else if (distressWeeks >= TUNING.CORPORATE_CLOSURE_DISTRESS_WEEKS && negative) {
        fired = { to: 'closed', causes: [{ code: 'DISTRESS_DURATION', weeks: distressWeeks }, negativeCash] }
      }
      break
    case 'recovery':
      if (lowRun >= TUNING.CORPORATE_WARN_SUSTAIN_WEEKS) fired = { to: 'warning', causes: warningCauses() }
      else if (clearRun >= TUNING.CORPORATE_RECOVERY_STABLE_WEEKS) fired = { to: 'stable', causes: [coverRestored] }
      break
  }

  const stage = fired === null ? from.stage : fired.to
  const next: Condition = {
    stage,
    since: fired === null ? from.since : facts.week,
    week: facts.week,
    lowRun,
    negativeRun,
    clearRun,
    // 1 on the entry week, the counter step while in distress, 0 in every other stage.
    distressWeeks: stage !== 'distress' ? 0 : fired !== null ? 1 : distressWeeks,
  }
  return { next, transition: fired === null ? null : { from: from.stage, to: fired.to, week: facts.week, causes: fired.causes } }
}

/**
 * The remedy families a studio may use this week, in the fixed order LOAN,
 * REDUCE_OBLIGATIONS, RELEASE (1352-A §4.3):
 * - LOAN when the loan law allows it (`loanEligible`);
 * - REDUCE_OBLIGATIONS when a contract is terminable under the shared charge law;
 * - RELEASE when a production or run in release exists.
 * Only LOAN reads the stage. A closed studio is not evaluated, so it has no list.
 */
export function remedies(condition: Condition, facts: ConditionFacts, capability: RemedyCapability): RemedyFamily[] {
  assertStage(condition.stage)
  if (condition.stage === 'closed') throw new Error('corporate condition: a closed studio is not evaluated')
  assertFacts(facts)
  const { hasPendingRelease, terminableContracts, hasOutstandingLoan, founding } = capability
  if (!(Number.isInteger(terminableContracts) && terminableContracts >= 0)) {
    throw new Error('corporate condition: terminable contracts must be a non-negative integer')
  }
  if (typeof hasPendingRelease !== 'boolean' || typeof hasOutstandingLoan !== 'boolean' || typeof founding !== 'boolean') {
    throw new Error('corporate condition: remedy capability flags must be booleans')
  }
  const families: RemedyFamily[] = []
  if (loanEligible(condition.stage, facts.weeklyFixedCost, { hasOutstandingLoan, founding })) families.push('LOAN')
  if (terminableContracts > 0) families.push('REDUCE_OBLIGATIONS')
  if (hasPendingRelease) families.push('RELEASE')
  return families
}

/** The rival-safe projection (1122-A): the stage and the week it began, no other number. */
export function publicCondition(condition: Condition): { stage: ConditionStage; since: number } {
  return { stage: condition.stage, since: condition.since }
}
