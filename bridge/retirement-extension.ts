// C.2-RM875: public case identity/terms only. Prices and proposal disclosure remain
// with talentMarket; this projection never reads a rival's compensation.
import { retirementRecordFor } from '../src/core/careerLifecycle.ts'
import { TUNING } from '../src/core/tuning.ts'
import { caseForTalent, latestCaseIsExtension, marketEligibility, openMarketCaseFor } from '../src/core/talentMarket.ts'
import type { GameState } from '../src/core/types.ts'
import type { BridgeMarketCaseSnapshot } from './schema/bridge-schema.ts'

export function retirementExtensionFields(
  state: GameState,
  talentId: string,
  viewerStudioId: string,
  week: number = state.market.tick,
): Pick<BridgeMarketCaseSnapshot, 'variant' | 'soleIssuerStudioId' | 'retirementExtension'> {
  if (!latestCaseIsExtension(state, talentId)) {
    return { variant: 'expiry', soleIssuerStudioId: null, retirementExtension: null }
  }
  const view = caseForTalent(state, talentId, week)
  const issuer = view?.subjectStudioId ?? null
  const record = retirementRecordFor(state, talentId)
  const open = openMarketCaseFor(state, talentId, week)
  // Closed cases retain the real issuer/variant, never a second opportunity
  // computed from the effective week an accepted extension has already moved.
  if (view === null || issuer === null || open === undefined || record?.status !== 'announced' || record.extensionUsed) {
    return { variant: 'retirementExtension', soleIssuerStudioId: issuer, retirementExtension: null }
  }
  const endWeekExclusive = record.effectiveWeek + TUNING.RETIREMENT_NOTICE_WEEKS
  return {
    variant: 'retirementExtension', soleIssuerStudioId: issuer,
    retirementExtension: {
      issuerStudioId: issuer,
      viewerCanOffer: marketEligibility(state, talentId, week).proposers.includes(viewerStudioId),
      requiredTermWeeks: endWeekExclusive - view.decisionWeek,
      startWeek: view.decisionWeek,
      endWeekExclusive,
    },
  }
}

/** Receipts carry no case id, so join the latest case identity, terminal kind and
 * exact closed week within its own opening span. Never borrow an older outcome. */
export function extensionTerminalReceipt(state: GameState, talentId: string) {
  const kase = [...state.talentMarket.cases].reverse().find(row => row.talentId === talentId)
  if (kase?.variant !== 'retirementExtension' || kase.outcome === null || kase.closedWeek === null) return undefined
  const view = caseForTalent(state, talentId)
  if (view === null || view.contractId !== kase.contractId || view.openedWeek !== kase.openedWeek || view.status !== kase.outcome) return undefined
  return [...state.talentMarket.receipts].reverse().find(receipt => receipt.talentId === talentId
    && receipt.kind === kase.outcome && receipt.week === kase.closedWeek && receipt.week >= kase.openedWeek)
}
