// ── P18 browser boundary: commission a limited-series season, read it, cancel it, settle what it owes ──────────
//
// A module of the one engine boundary (like continuation.ts). Every value is a core read: the choices and the season
// rows are `tvCommissionChoices` / `tvView` (src/core/tvView.ts, the same read model the Bridge publishes), the quote is
// `tvCommissionPreview` (the admission the action runs), and the three verbs are the core actions. A refusal is the
// core's own sentence, returned to the surface verbatim; nothing here decides legality.

import {
  applyActions,
  tvCommissionChoices,
  tvCommissionPreview,
  tvView,
  type CommissionTvSeasonRequest,
  type GameState,
  type TvCommissionChoices,
  type TvCommissionPreview,
  type TvSeasonView,
} from '../../../src/core/index.ts'
import type { ActionOutcome } from './adapter.ts'

export type { CommissionTvSeasonRequest, TvCommissionChoices, TvCommissionPreview, TvSeasonView }
export { TV_BLOCK_LABEL, TV_CANCELLATION_LABEL, TV_MILESTONE_LABEL } from '../../../src/core/index.ts'

export function seasonChoices(state: GameState): TvCommissionChoices {
  return tvCommissionChoices(state)
}

export function seasonQuote(state: GameState, request: CommissionTvSeasonRequest): TvCommissionPreview {
  return tvCommissionPreview(state, request)
}

export function seasonRows(state: GameState): TvSeasonView[] {
  return tvView(state).seasons
}

function run(state: GameState, action: Parameters<typeof applyActions>[1][number]): ActionOutcome {
  try {
    return { ok: true, next: applyActions(state, [action]) }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export const commissionTvSeasonAction = (state: GameState, commission: CommissionTvSeasonRequest): ActionOutcome =>
  run(state, { kind: 'commissionTvSeason', commission })
export const cancelTvSeasonAction = (state: GameState, seasonId: string): ActionOutcome => run(state, { kind: 'cancelTvSeason', seasonId })
/** Pays what the settle preview offers now (the whole balance, or the available cash), guarded by the balance shown. */
export const settleTvObligationsAction = (state: GameState, agreementId: string, expectedRemaining: number, amount: number): ActionOutcome =>
  run(state, { kind: 'settleTvObligations', agreementId, expectedRemaining, amount })
