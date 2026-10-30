/** P18 Sprint 13 slice B (projection 68): the limited-series season on the Bridge. Every figure, refusal and verdict is
 * the core's own: the quote is `tvCommissionPreview` (the same admission the action runs), the view is `tvView`, and the
 * commit, cancel and settle verbs are the core `commissionTvSeason`, `cancelTvSeason` and `settleTvObligations` actions,
 * which revalidate everything at commit. Rivals produce no seasons; the view is the player's own record. */
import { applyActions } from '../src/core/actions.js'
import { tvCommissionPreview } from '../src/core/tvCommission.js'
import { tvView, TV_BLOCK_LABEL } from '../src/core/tvView.js'
import type { CommissionTvSeasonRequest } from '../src/core/tvTypes.js'
import type { Action, GameState } from '../src/core/types.js'
import type { AvailableIntent } from './protocol.ts'
import type { BridgeTvCommissionDraftPayload, BridgeTvCommissionQuoteSnapshot } from './schema/bridge-schema.ts'
import type { TelevisionPage } from './schema/industry-schema.ts'

export type TvIntentSpec = {
  seasonId: string
  kind: 'cancelTvSeason' | 'settleTvObligations'
  label: string
  detail: string
  action: Extract<Action, { kind: 'cancelTvSeason' | 'settleTvObligations' }>
}
export type TvIntent = { spec: TvIntentSpec; option: AvailableIntent }

const money = (n: number): string => `$${Math.round(n).toLocaleString('en-US')}`

/** The closed draft, field by field: no extra payload key reaches the core. */
export function tvCommissionDraftCopy(draft: BridgeTvCommissionDraftPayload): CommissionTvSeasonRequest {
  return { seriesTitle: draft.seriesTitle, propertyId: draft.propertyId, adoptionId: draft.adoptionId,
    roster: { writerId: draft.roster.writerId, directorId: draft.roster.directorId, craftId: draft.roster.craftId,
      cast: { lead: draft.roster.cast.lead, antagonist: draft.roster.cast.antagonist, support: draft.roster.cast.support } } }
}

export function tvCommissionDraftApply(current: GameState, draft: BridgeTvCommissionDraftPayload) {
  try { return { ok: true as const, next: applyActions(current, [{ kind: 'commissionTvSeason', commission: tvCommissionDraftCopy(draft) }]) } }
  catch (error) { return { ok: false as const, error: (error as Error).message } }
}

/** The core preview, verbatim: a refusal names its rule; a lawful quote carries the admission quote and the frozen terms. */
export function tvCommissionQuoteSnapshot(state: GameState, draft: BridgeTvCommissionDraftPayload, intentId: string): BridgeTvCommissionQuoteSnapshot {
  const preview = tvCommissionPreview(state, tvCommissionDraftCopy(draft))
  const ok = preview.refusal === null
  return { intentId, kind: 'commissionTvSeason', commitLabel: 'Commission this television season', startsNow: ok, queues: false, queueNote: null,
    ok, refusalReason: preview.refusal, commitWeek: preview.commitWeek, quote: { ...preview.quote },
    terms: { ...preview.terms, milestones: { ...preview.terms.milestones } },
    commissionerLicenceConsideration: preview.commissionerLicenceConsideration, distributionLicenceEndWeekExclusive: preview.distributionLicenceEndWeekExclusive }
}

/** One cancel verb per live season, and one settle verb per agreement that owes and still belongs to the operating studio. */
export function tvIntentSpecs(state: GameState): TvIntentSpec[] {
  const specs: TvIntentSpec[] = []
  for (const row of tvView(state).seasons) {
    if (row.cancelPreview !== null) {
      const c = row.cancelPreview
      specs.push({ seasonId: row.seasonId, kind: 'cancelTvSeason', label: `Cancel the ${row.seriesTitle} season`,
        detail: `Freezes the unearned advance ${money(c.refundDue)} and the ${money(c.chargeDue)} cancellation charge; pays ${money(c.refundPaidNow)} back and `
          + `${money(c.chargePaidNow)} of the charge from cash now and leaves ${money(c.owedAfter)} owed. Completed work and earned fees stay.`,
        action: { kind: 'cancelTvSeason', seasonId: row.seasonId } })
    }
    if (row.settlePreview !== null && row.settlePreview.payableNow > 0) {
      const s = row.settlePreview
      specs.push({ seasonId: row.seasonId, kind: 'settleTvObligations', label: `Settle ${money(s.payableNow)} of the ${money(s.outstanding)} owed on ${row.seriesTitle}`,
        detail: 'Pays the advance refund first, then the cancellation charge. No interest, refinancing or forgiveness.',
        action: { kind: 'settleTvObligations', agreementId: row.agreement.agreementId, expectedRemaining: s.outstanding, amount: s.payableNow } })
    }
  }
  return specs
}

export function televisionPage(state: GameState, targetId: string | null, page: number, pageSize: number, intents: readonly TvIntent[]): { television: TelevisionPage; totalRows: number; pageCount: number } {
  if (targetId !== null) throw new Error('The television view requires a null targetId.')
  if (state.hollywood === null) throw new Error('The television view requires an established player studio.')
  const view = tvView(state)
  const pageCount = Math.ceil(view.seasons.length / pageSize)
  if (page > 0 && page >= pageCount) throw new Error('That television page is outside this record.')
  const option = (seasonId: string, kind: TvIntentSpec['kind']): AvailableIntent | null =>
    intents.find((intent) => intent.spec.seasonId === seasonId && intent.spec.kind === kind)?.option ?? null
  const seasons = view.seasons.slice(page * pageSize, (page + 1) * pageSize).map((row) => ({
    seasonId: row.seasonId, seriesId: row.seriesId, seriesTitle: row.seriesTitle, propertyId: row.propertyId, status: row.status,
    block: row.block, blockLabel: TV_BLOCK_LABEL[row.block], creditedUnits: row.creditedUnits, totalUnits: row.totalUnits, stall: row.stall,
    commitWeek: row.commitWeek, dueWeek: row.dueWeek, finalWeek: row.finalWeek, deliveredWeek: row.deliveredWeek,
    cancellation: row.cancellation === null ? null : { ...row.cancellation },
    nextMilestone: row.nextMilestone === null ? null : { ...row.nextMilestone },
    agreement: { ...row.agreement, settlement: row.agreement.settlement === null ? null : { ...row.agreement.settlement } },
    distribution: { ...row.distribution },
    cancelPreview: row.cancelPreview === null ? null : { ...row.cancelPreview },
    settlePreview: row.settlePreview === null ? null : { ...row.settlePreview },
    cancelIntent: option(row.seasonId, 'cancelTvSeason'), settleIntent: option(row.seasonId, 'settleTvObligations'),
  }))
  return { totalRows: view.seasons.length, pageCount, television: {
    title: 'Television',
    notice: 'The studio\'s own limited-series seasons: each figure is the engine\'s record of the agreement. A season earns its milestones by paid work; '
      + 'cancelling before delivery returns the unearned advance and pays the cancellation charge, refund first, from the cash available.',
    week: state.market.tick, series: view.series, seasons,
  } }
}
