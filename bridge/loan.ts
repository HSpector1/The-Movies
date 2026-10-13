/** Chosen financing is quoted by the existing core law, never a new debt product. */
import type { GameState } from '../src/core/types.js'
import { applyActions } from '../src/core/actions.js'
import { applyTakeLoan } from '../src/core/corporateConditionLive.js'
import { contractLoan, loanMaxPrincipal } from '../src/core/studioLoan.js'
import { studioWeeklyFixedCost } from '../src/core/powerRankingArchive.js'
import { TUNING } from '../src/core/tuning.js'
import type { BridgeLoanDraftPayload, BridgeLoanQuoteSnapshot } from './schema/bridge-schema.ts'

export function loanDraftApply(current: GameState, draft: BridgeLoanDraftPayload) {
  try { return { ok: true as const, next: applyActions(current, [{ kind: 'takeLoan', principal: draft.principal }]) } }
  catch (error) { return { ok: false as const, error: (error as Error).message } }
}
export function loanQuoteSnapshot(state: GameState, draft: BridgeLoanDraftPayload, intentId: string): BridgeLoanQuoteSnapshot {
  // Core checks eligibility BEFORE the principal. Its discarded successor never becomes authority.
  let refusalReason: string | null = null
  try { applyTakeLoan(state, draft.principal) } catch (error) { refusalReason = (error as Error).message }
  const player = state.hollywood?.playerStudioId
  const fixed = player === undefined ? 0 : studioWeeklyFixedCost(state, player)
  const maximumPrincipal = loanMaxPrincipal(fixed)
  const terms = refusalReason === null ? contractLoan(draft.principal, fixed, state.market.tick) : null
  return { intentId, kind: 'takeLoan', commitLabel: 'Take the selected studio loan', startsNow: terms !== null,
    queues: false, queueNote: null, ok: terms !== null, refusalReason, principal: draft.principal,
    minimumPrincipal: TUNING.LOAN_AMOUNT_STEP, principalStep: TUNING.LOAN_AMOUNT_STEP, maximumPrincipal,
    total: terms?.total ?? null, contractedWeek: state.market.tick, installments: terms === null ? [] : [...terms.installments] }
}
