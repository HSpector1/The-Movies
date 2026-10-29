// ── ASTRA Sprint 18 browser boundary: the rights desk (P16 transactions) and the title-sale disclosure (decision B) ──
//
// A module of the one engine boundary (like television.ts). Every value is a core read: the desk is `rightsDeskView`,
// the disclosure is `titleSaleOutcome` (src/core/rightsDesk.ts: the engine run forward on a private copy), the quotes
// are the core's own (`quoteAbsorption`, the submission laws), and every verb is a core action. A refusal is the core's
// own sentence, voiced here with the raw note kept one click away. A confirmation carries the digest of the outcome that
// was disclosed; the action recomputes it against the current state and refuses when it differs, so a stale screen
// never approves a different outcome.

import {
  applyActions,
  playerHolds,
  quoteAbsorption,
  rightsDeskView,
  rivalWillingness,
  saleOfferRefusal,
  titleSaleOutcome,
  titleSaleOutcomeDigest,
  P16_REASON_TEXT,
  type AbsorptionQuote,
  type AbsorptionRefusal,
  type DiligenceScopeItem,
  type DiligenceTarget,
  type GameState,
  type PlayerOfferInput,
  type RetentionChoice,
  type RightSubject,
  type RightsDeskView,
  type TitleSaleOutcome,
  type TitleSalePlan,
} from '../../../src/core/index.ts'
import type { ActionOutcome } from './adapter.ts'
import { refusalHumaniser } from './continuation.ts'

export type { AbsorptionQuote, AbsorptionRefusal, DiligenceScopeItem, DiligenceTarget, PlayerOfferInput, RetentionChoice, RightSubject, RightsDeskView, TitleSaleOutcome, TitleSalePlan }
export type { RightsDeskCounterparty, RightsDeskEstate, RightsDeskLot, RightsDeskOffer, RightsDeskTitle, TitleSaleSeasonOutcome } from '../../../src/core/index.ts'

/** The developer prefixes the core's verbs and laws put before a refusal code (actions.ts, assetSale.ts, dueDiligence.ts, acquisition.ts, estate.ts). */
const PREFIXES = /^(applyActions: \w+ rejected — |rights offer refused at acceptance: |rights offer refused: |due diligence refused: |estate bid refused: |absorption closing refused: |absorption: |rights: )+/

/** The P16 transaction refusal codes (assetSale, dueDiligence, acquisition, estate, rightsFinance, quoteAge) in the player's words. */
const RIGHTS_REASON_TEXT: Readonly<Record<string, string>> = {
  selfDealing: 'a studio cannot deal with itself', unknownStudio: 'that studio is not on record', invalidPrice: 'the price must be a whole, non-negative amount',
  sellerNotOperating: 'the seller is not operating', counterpartyNotHolder: 'the other studio does not hold that title', offerorNotHolder: 'your studio does not hold that title',
  notTradeable: 'the title cannot be traded now', activeProductionEncumbrance: 'a production on it blocks the sale', activeRunEncumbrance: 'a theatrical run on it blocks the sale',
  resaleHoldback: 'a title bought recently cannot be resold yet', offerCooldown: 'the same offer was rejected recently; wait before offering again',
  duplicateOpenOffer: 'an offer like this one is already open', disclosureNotHeld: 'your studio holds no disclosure about the other studio', staleDisclosure: 'the disclosure is stale; request a fresh one',
  disclosureRequired: 'a fresh full disclosure of that studio is needed first', disclosureScope: 'the disclosure held does not cover rights, employment and liabilities',
  insufficientCashAfterReserve: 'cash after the purchase would fall below the reserve', emptyScope: 'choose at least one scope item', invalidScope: 'the scope is not valid',
  selfTarget: 'a studio cannot examine itself', unknownTarget: 'that target is not on record', targetConditionUnavailable: 'the target has no condition record yet',
  targetTerminal: 'the target has closed', targetOutstandingLoan: 'the target is repaying a distress loan', playerNotForSale: 'your own studio is not for sale',
  invalidConsideration: 'the consideration must be a whole, non-negative amount', absorptionQuoteRequired: 'quote the acquisition before closing it',
  incompleteAbsorptionQuote: 'the quote carried is incomplete', quoteTooOld: 'the quote is too old; quote again', unknownQuoteAgePolicyVersion: 'the quote names an unknown age policy',
  acquiredScriptReassignmentProducerRequired: 'the target has acquired writing in hand; that acquisition is not supported yet',
  acquiredPromiseReassignmentProducerRequired: 'the target carries delegated promises; that acquisition is not supported yet',
  acquiredRunReassignmentProducerRequired: 'the target has a theatrical run in progress; that acquisition is not supported yet',
  acquiredWorkReassignmentProducerRequired: 'the target has work in progress that cannot be carried; that acquisition is not supported yet',
  partialWriterTeamProducerRequired: 'the target\'s writing team cannot be carried in part; that acquisition is not supported yet',
  retainedScriptProducerRequired: 'the target\'s retained writing cannot be carried; that acquisition is not supported yet',
  unknownEstate: 'that estate is not on record', estateClosed: 'the estate has closed', estateNotOpen: 'the estate has not opened', unknownLot: 'that lot is not open',
  invalidBid: 'the bid must be a whole, positive amount', belowMinimumBid: 'the bid is below the lot\'s minimum', duplicateBid: 'your studio already holds a sealed bid on that lot',
  lotAuthorityLost: 'the lot\'s title is no longer the estate\'s to sell',
  notOperating: 'the studio is not operating', founding: 'a founding studio cannot deal yet', terminal: 'the studio has closed', conditionUnavailable: 'no condition record exists yet',
  outstandingDistressLoan: 'a distress loan is still being repaid', invalidQuoteWeeks: 'the quote week is not valid', futureQuote: 'the quote is dated in the future',
  quoteTooYoung: 'the quote is too fresh to act on', staleQuote: 'the quote is stale; quote again', exclusiveOverlap: 'an exclusive licence already covers that term',
  grantorNotHolder: 'the grantor does not hold the title', selfGrant: 'a studio cannot license itself', invalidTerm: 'the licence term is not valid', invalidExclusivity: 'the licence exclusivity is not valid',
  invalidRight: 'that right cannot be licensed', r3RequiresExclusive: 'a production licence must be exclusive', r4ConsumerNotLive: 'television licensing is not open',
  rejectedByCounterparty: 'the other studio declined', notWilling: 'the other studio is not willing at that price', priceAboveBid: 'the price is above what the other studio would pay',
  priceBelowAsk: 'the price is below what the other studio asks', valueUnavailable: 'the title has no valuation to price against', noIndustry: 'there is no industry yet',
  unknownOffer: 'that offer is not on record', offerNotOpen: 'that offer is no longer open', offerExpired: 'that offer has expired',
}
/** Codes that carry a detail after the colon, voiced as `prefix: detail`. */
const PREFIX_TEXT: Readonly<Record<string, string>> = {
  buyerNotPermitted: 'the buyer may not deal now', recipientNotPermitted: 'your studio may not request a disclosure now', bidderNotPermitted: 'your studio may not bid now',
  stageNotStable: 'the studio\'s condition is', targetNotStable: 'the target\'s condition is', holderUnavailable: 'the title cannot be read', noAuthority: 'the right is held by',
  notWilling: 'the other studio is not willing', valueUnavailable: 'the title has no valuation', priceAboveBid: 'the most it would pay is', priceBelowAsk: 'the least it would take is',
}

/** Prefixes whose detail completes the sentence (a stage, a holder, an amount); the others introduce a clause after a colon. */
const JOIN_SPACE = new Set(['stageNotStable', 'targetNotStable', 'noAuthority', 'priceAboveBid', 'priceBelowAsk'])

/** One refusal token (`code`, `code:detail`, `code:detail:more`) in the player's words; a code without a sentence stays as written. */
export function voiceRightsReason(token: string): string {
  const [code, ...rest] = token.split(':')
  if (code === undefined || code === '') return token
  const detail = rest.join(':')
  if (detail !== '' && Object.hasOwn(PREFIX_TEXT, code)) {
    const inner = /^\d+$/.test(detail) ? `$${Number(detail).toLocaleString('en-US')}` : voiceRightsReason(detail)
    return `${PREFIX_TEXT[code]}${JOIN_SPACE.has(code) ? ' ' : ': '}${inner}`
  }
  if (detail === '') return RIGHTS_REASON_TEXT[code] ?? P16_REASON_TEXT[code] ?? token
  return token
}

/**
 * A rights refusal in the player's words: the developer prefixes go, each token becomes its sentence (nested details
 * recursively), then the P17 humaniser names properties, licences, films and studios. A code with no sentence stays
 * as written; the caller shows the raw note beside it.
 */
export function rightsRefusalVoice(state: GameState): (raw: string) => string {
  const humane = refusalHumaniser(state)
  return (raw) => {
    const text = raw.replace(PREFIXES, '')
    const voiced = text.replace(/\b([A-Za-z][A-Za-z0-9]*(?::[A-Za-z0-9_-]+)*)\b/g, (token) => voiceRightsReason(token))
    return humane(voiced)
  }
}

export function rightsDesk(state: GameState): RightsDeskView {
  return rightsDeskView(state)
}

/** Decision B: what the plan does to the player's live seasons, by the engine on a private copy; the digest rides with the confirmation. */
export function titleSaleDisclosure(state: GameState, plan: TitleSalePlan): { outcome: TitleSaleOutcome; digest: string } {
  const outcome = titleSaleOutcome(state, plan)
  return { outcome, digest: titleSaleOutcomeDigest(outcome) }
}

/**
 * The core's own answer to a sell offer at `price` at today's valuation (assetSale.ts rivalWillingness); the rival
 * answers at the week boundary against that week's valuation and its own permission and cash. `limit` is the most
 * that rival would pay now, read from the core's reason token (`notWilling:priceAboveBid:<limit>`), else null.
 */
export function saleWillingness(state: GameState, counterpartyId: string, subject: RightSubject, price: number): { willing: boolean; reason: string; value: number | null; limit: number | null } {
  const h = state.hollywood
  if (!h) return { willing: false, reason: 'noIndustry', value: null, limit: null }
  const answer = rivalWillingness(state, { direction: 'sell', instrument: { kind: 'title', subject }, price, offerorId: h.playerStudioId, counterpartyId }, state.market.tick)
  const limit = /^notWilling:priceAboveBid:(\d+)$/.exec(answer.reason)
  return { ...answer, limit: limit === null ? null : Number(limit[1]) }
}

export { playerHolds, saleOfferRefusal }

function run(state: GameState, action: Parameters<typeof applyActions>[1][number]): ActionOutcome {
  try {
    return { ok: true, next: applyActions(state, [action]) }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

/** The outcome shown must still be the outcome now; otherwise the action refuses and the surface re-reads. */
function outcomeUnchanged(state: GameState, plan: TitleSalePlan, acknowledgedDigest: string): ActionOutcome | null {
  const now = titleSaleDisclosure(state, plan).digest
  return now === acknowledgedDigest ? null : { ok: false, error: 'rights: the season consequences of this sale changed since they were shown; review them again before confirming' }
}

/**
 * A binding offer by the player. A sale of a title the player holds carries the digest of the disclosed outcome
 * (decision B); a buy offer or a licence offer carries none.
 */
export function makeRightsOfferAction(state: GameState, offer: PlayerOfferInput, acknowledgedDigest: string | null = null): ActionOutcome {
  if (offer.direction === 'sell' && offer.instrument.kind === 'title') {
    if (acknowledgedDigest === null) return { ok: false, error: 'rights: a title sale needs its season consequences acknowledged first' }
    const changed = outcomeUnchanged(state, { kind: 'offer', offer }, acknowledgedDigest)
    if (changed !== null) return changed
  }
  return run(state, { kind: 'makeRightsOffer', offer })
}
export const withdrawRightsOfferAction = (state: GameState, offerId: string): ActionOutcome => run(state, { kind: 'withdrawRightsOffer', offerId })
export const rejectRightsOfferAction = (state: GameState, offerId: string): ActionOutcome => run(state, { kind: 'rejectRightsOffer', offerId })

/** Accepting a rival's offer closes at once; accepting a buy of a held title carries the acknowledged outcome. */
export function acceptRightsOfferAction(state: GameState, offerId: string, acknowledgedDigest: string | null = null): ActionOutcome {
  const offer = state.rights.offers.find((o) => o.id === offerId)
  if (offer === undefined) return { ok: false, error: `rights: unknownOffer:${offerId}` }
  if (offer.direction === 'buy' && offer.instrument.kind === 'title' && playerHolds(state, offer.instrument.subject)) {
    if (acknowledgedDigest === null) return { ok: false, error: 'rights: selling this title needs its season consequences acknowledged first' }
    const changed = outcomeUnchanged(state, { kind: 'accept', offerId }, acknowledgedDigest)
    if (changed !== null) return changed
  }
  return run(state, { kind: 'acceptRightsOffer', offerId })
}

export const requestDueDiligenceAction = (state: GameState, target: DiligenceTarget, scope: DiligenceScopeItem[]): ActionOutcome =>
  run(state, { kind: 'requestDueDiligence', target, scope })

/** The acquisition quote the commit runs (the core's `quoteAbsorption`), or its refusal. */
export function absorptionQuote(state: GameState, targetId: string, consideration: number, retention: RetentionChoice, disclosureId: string | null): AbsorptionQuote | AbsorptionRefusal {
  const h = state.hollywood
  if (!h) return { kind: 'refusal', refusal: 'noIndustry' }
  return quoteAbsorption(state, { buyerId: h.playerStudioId, targetId, consideration, retention, disclosureId }, state.market.tick)
}

/** Closes the quoted acquisition; the core revalidates the dated quote and every closing condition itself. */
export const absorbStudioAction = (state: GameState, quote: AbsorptionQuote, retention: RetentionChoice): ActionOutcome =>
  run(state, { kind: 'absorbStudio', absorption: { targetId: quote.targetId, consideration: quote.consideration, retention, disclosureId: quote.disclosureId, quotedAtWeek: quote.quotedAtWeek, quoteAgePolicyVersion: quote.quoteAgePolicyVersion } })

export const submitEstateBidAction = (state: GameState, estateId: string, lotId: string, amount: number): ActionOutcome =>
  run(state, { kind: 'submitEstateBid', estateId, lotId, amount })
