// ── P18 browser boundary: commission a limited-series season, read it, cancel it, settle what it owes ──────────
//
// A module of the one engine boundary (like continuation.ts). Every value is a core read: the choices and the season
// rows are `tvCommissionChoices` / `tvView` (src/core/tvView.ts, the same read model the Bridge publishes), the quote is
// `tvCommissionPreview` (the admission the action runs), and the three verbs are the core actions. A refusal is the
// core's own sentence: the surface voices it (`seasonRefusalVoice`) and keeps the raw note one click away.

import {
  applyActions,
  P16_REASON_TEXT,
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
import { refusalHumaniser } from './continuation.ts'

export type { CommissionTvSeasonRequest, TvCommissionChoices, TvCommissionPreview, TvSeasonView }
export { TV_BLOCK_LABEL, TV_CANCELLATION_LABEL, TV_MILESTONE_LABEL } from '../../../src/core/index.ts'

const ENGINE_PREFIX = /^applyActions: \w+ rejected — /

/**
 * FIX-S13B-1 item 2: a season refusal in the player's words, the P17 pattern. The developer prefix goes; each season,
 * series and agreement id becomes its series title, a sound-chain adoption its stage and Post names, a person their
 * name and a P16 code its sentence; P17's humaniser then names properties, licences and studios. The caller keeps the
 * raw sentence in a disclosure beside it.
 */
export function seasonRefusalVoice(state: GameState): (raw: string) => string {
  const names = new Map<string, string>()
  const root = state.television
  for (const series of root?.series ?? []) names.set(series.seriesId, series.title)
  for (const season of root?.seasons ?? []) {
    const title = root!.series.find((x) => x.seriesId === season.seriesId)?.title
    if (title !== undefined) { names.set(season.seasonId, title); names.set(season.agreementId, `for ${title}`) }
  }
  for (const a of tvCommissionChoices(state).adoptions) names.set(a.adoptionId, `the ${a.stageName} and ${a.postName} chain`)
  for (const t of state.talent) names.set(t.id, t.name)
  const humane = refusalHumaniser(state)
  return (raw) => humane(raw.replace(ENGINE_PREFIX, '').replace(/\w[\w:.-]*\w|\w/g, (token) => names.get(token) ?? (/[A-Z]/.test(token) ? P16_REASON_TEXT[token] : undefined) ?? token))
}

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
