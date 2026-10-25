import { QUOTE_AGE_POLICIES, QUOTE_AGE_POLICY_VERSION, quoteAgeRefusal } from './quoteAge.js'
// ── P16B: bilateral rights offers — whole-title sales (R1/R2) and R3 exclusive term licences ──
//
// Authority: P16 integration contract §3 (instruments; refuse overlapping exclusive scopes, unknown
// subjects, over-wide grants, sublicensing; a title sale preserves live licences; an R1 sale or
// exclusive R3 grant touching an active production refuses; an R2 sale during an active run refuses
// until a receipt-assignment producer exists), §6 (permitted bidder at submission AND closing;
// commitment reservation; bilateral quote -> acceptance -> atomic close or refusal/expiry; no
// auction; anti-flip holdback; cooldown), §7 groups R/M; 1362-O §5.4/§5.7; P16A r3 (R4 has no
// executable grant before a real P18 consumer).
//
// Pure. The same functions serve player and rival on either side. A refusal is a string reason;
// the verb that acts on it throws and returns nothing else changed.

import { blockingEncumbrance, licenceGrantRefusal, mintLicence } from './licence.js'
import { corporateConditionReaders, affordabilityRefusal, moveStudioCash, permittedBidderRefusal, postPurchaseReserve, spendableCash, type CorporateConditionReaders } from './rightsFinance.js'
import { allocateRightsId, appendTitleEvent, currentHolder, licenceInForce, sameSubject, subjectKey,
  type RightSubject, type RightsInstrument, type RightsOffer, type RightsTransaction } from './rights.js'
import { subjectValueV1 } from './propertyValuation.js'
import { TUNING } from './tuning.js'
import type { GameState } from './types.js'

export type OfferInput = {
  offerorId: string
  counterpartyId: string
  direction: 'buy' | 'sell'
  instrument: RightsInstrument
  price: number
  disclosureId?: string | null
}
/** The player's verb payload: the offeror is always the player. */
export type PlayerOfferInput = Omit<OfferInput, 'offerorId'>

export { R3_USES } from './licence.js'

export const instrumentSubject = (instrument: RightsInstrument): RightSubject => instrument.subject
const buyerOf = (o: { direction: 'buy' | 'sell'; offerorId: string; counterpartyId: string }): string => (o.direction === 'buy' ? o.offerorId : o.counterpartyId)
const sellerOf = (o: { direction: 'buy' | 'sell'; offerorId: string; counterpartyId: string }): string => (o.direction === 'buy' ? o.counterpartyId : o.offerorId)

/** A title bought by `sellerId` cannot be resold inside RIGHTS_RESALE_HOLDBACK_WEEKS of its acquisition. */
export function resaleHoldbackRefusal(state: GameState, subject: RightSubject, sellerId: string, week: number): string | null {
  const acquired = state.rights.titleEvents
    .filter((e) => sameSubject(e.subject, subject) && e.newHolder === sellerId && (e.cause === 'sale' || e.cause === 'estateSale') && e.date.kind === 'campaign')
    .map((e) => (e.date as { week: number }).week)
  if (acquired.length === 0) return null
  return week - Math.max(...acquired) < TUNING.RIGHTS_RESALE_HOLDBACK_WEEKS ? 'resaleHoldback' : null
}

/** After a rejection the same offeror waits RIGHTS_OFFER_COOLDOWN_WEEKS before re-offering on the subject. */
export function offerCooldownRefusal(state: GameState, offerorId: string, subject: RightSubject, week: number): string | null {
  const rejected = state.rights.offers.filter((o) => o.offerorId === offerorId && o.status === 'rejected' && o.resolvedWeek !== null && sameSubject(instrumentSubject(o.instrument), subject))
  if (rejected.length === 0) return null
  return week - Math.max(...rejected.map((o) => o.resolvedWeek!)) < TUNING.RIGHTS_OFFER_COOLDOWN_WEEKS ? 'offerCooldown' : null
}

/** The instrument's own law for a seller/buyer pair at `week`; null when lawful. A licence is the producer's law (licence.ts), its holder refusal named from the offer's side. */
export function instrumentRefusal(state: GameState, sellerId: string, buyerId: string, direction: 'buy' | 'sell', instrument: RightsInstrument, week: number): string | null {
  const subject = instrumentSubject(instrument)
  if (instrument.kind === 'licence') {
    const refusal = licenceGrantRefusal(state, { right: instrument.right, subject, scope: instrument.scope, exclusive: instrument.exclusive,
      startWeek: instrument.startWeek, endWeekExclusive: instrument.endWeekExclusive, grantorId: sellerId, granteeId: buyerId }, week)
    if (refusal === 'grantorNotHolder') return direction === 'buy' ? 'counterpartyNotHolder' : 'offerorNotHolder'
    return refusal
  }
  const holder = currentHolder(state, subject, week)
  if (holder.kind === 'unavailable') return holder.reason === 'unknownSubject' ? 'unknownSubject' : `holderUnavailable:${holder.reason}`
  if (holder.archived || holder.estate !== undefined || !holder.tradeable) return 'notTradeable'
  if (holder.holderId !== sellerId) return direction === 'buy' ? 'counterpartyNotHolder' : 'offerorNotHolder'
  const blocked = blockingEncumbrance(state, subject)
  if (blocked !== null) return `${blocked}Encumbrance`
  return resaleHoldbackRefusal(state, subject, sellerId, week)
}

function disclosureRefusal(state: GameState, offerorId: string, counterpartyId: string, disclosureId: string | null | undefined, week: number): string | null {
  if (disclosureId === null || disclosureId === undefined) return null
  const record = state.rights.diligence.find((d) => d.id === disclosureId)
  if (record === undefined || record.recipientId !== offerorId || record.target.kind !== 'studio' || record.target.studioId !== counterpartyId) return 'disclosureNotHeld'
  const age = quoteAgeRefusal('disclosure', record.week, week, record.quoteAgePolicyVersion)
  return age !== null ? age : week >= record.staleFromWeek ? 'staleDisclosure' : null
}

/** The complete submission law; null when the offer may be made. */
export function offerRefusal(state: GameState, input: OfferInput, week: number, readers: CorporateConditionReaders = corporateConditionReaders): string | null {
  const h = state.hollywood
  if (!h) return 'noIndustry'
  if (input.offerorId === input.counterpartyId) return 'selfDealing'
  for (const id of [input.offerorId, input.counterpartyId]) if (!h.identities.some((i) => i.studioId === id)) return 'unknownStudio'
  if (!Number.isSafeInteger(input.price) || input.price < 0) return 'invalidPrice'
  const buyer = buyerOf(input)
  const seller = sellerOf(input)
  const permitted = permittedBidderRefusal(state, buyer, week, readers)
  if (permitted !== null) return `buyerNotPermitted:${permitted}`
  const sellerIdentity = h.identities.find((i) => i.studioId === seller)!
  if (sellerIdentity.enteredWeek === null) return 'sellerNotOperating'
  const instrument = instrumentRefusal(state, seller, buyer, input.direction, input.instrument, week)
  if (instrument !== null) return instrument
  const subject = instrumentSubject(input.instrument)
  const cooldown = offerCooldownRefusal(state, input.offerorId, subject, week)
  if (cooldown !== null) return cooldown
  if (state.rights.offers.some((o) => o.status === 'open' && o.offerorId === input.offerorId && o.counterpartyId === input.counterpartyId
    && o.instrument.kind === input.instrument.kind && sameSubject(instrumentSubject(o.instrument), subject))) return 'duplicateOpenOffer'
  const disclosure = disclosureRefusal(state, input.offerorId, input.counterpartyId, input.disclosureId, week)
  if (disclosure !== null) return disclosure
  if (input.direction === 'buy') {
    const affordable = affordabilityRefusal(state, buyer, input.price)
    if (affordable !== null) return affordable
  }
  return null
}

/** A binding offer: refuses loudly, else records it open with its reservation (a buy offer) until expiry. */
export function makeOffer(state: GameState, input: OfferInput, week: number, readers: CorporateConditionReaders = corporateConditionReaders): { state: GameState; offer: RightsOffer } {
  const refusal = offerRefusal(state, input, week, readers)
  if (refusal !== null) throw new Error(`rights offer refused: ${refusal}`)
  const allocated = allocateRightsId(state.rights, 'rights-offer')
  const offer: RightsOffer = { quoteAgePolicyVersion: QUOTE_AGE_POLICY_VERSION, disclosureId: input.disclosureId ?? null, id: allocated.id, week, offerorId: input.offerorId, counterpartyId: input.counterpartyId, direction: input.direction,
    instrument: input.instrument, price: input.price, expiresWeek: week + QUOTE_AGE_POLICIES[QUOTE_AGE_POLICY_VERSION].bilateralOffer.max + 1, status: 'open', resolvedWeek: null, transactionId: null, refusal: null }
  return { state: { ...state, rights: { ...allocated.root, offers: [...allocated.root.offers, offer] } }, offer }
}

function requireOpenOffer(state: GameState, offerId: string, week: number): RightsOffer {
  const offer = state.rights.offers.find((o) => o.id === offerId)
  if (offer === undefined) throw new Error(`rights: unknown offer ${offerId}`)
  if (offer.status !== 'open') throw new Error(`rights: offer ${offerId} is not open (${offer.status})`)
  if (week >= offer.expiresWeek) throw new Error(`rights: offer ${offerId} is not open (expired at week ${offer.expiresWeek})`)
  return offer
}

function resolveOffer(state: GameState, offerId: string, status: RightsOffer['status'], week: number, transactionId: string | null, refusal: string | null): GameState {
  return { ...state, rights: { ...state.rights, offers: state.rights.offers.map((o) => (o.id === offerId ? { ...o, status, resolvedWeek: week, transactionId, refusal } : o)) } }
}

/** Everything the close must hold again at acceptance; null when the close may proceed. */
export function closingRefusal(state: GameState, offer: RightsOffer, week: number, readers: CorporateConditionReaders = corporateConditionReaders): string | null {
  const age = quoteAgeRefusal('bilateralOffer', offer.week, week, offer.quoteAgePolicyVersion)
  if (age !== null) return age
  const disclosure = disclosureRefusal(state, offer.offerorId, offer.counterpartyId, offer.disclosureId, week)
  if (disclosure !== null) return disclosure
  const buyer = buyerOf(offer)
  const permitted = permittedBidderRefusal(state, buyer, week, readers)
  if (permitted !== null) return `buyerNotPermitted:${permitted}`
  const instrument = instrumentRefusal(state, sellerOf(offer), buyer, offer.direction, offer.instrument, week)
  if (instrument !== null) return instrument
  // A buy offer's own reservation already sits inside spendable cash; a sell offer's buyer has committed nothing yet.
  const afterPrice = offer.direction === 'buy' ? spendableCash(state, buyer) : spendableCash(state, buyer) - offer.price
  if (afterPrice < postPurchaseReserve(state, buyer)) return 'insufficientCashAfterReserve'
  return null
}

/** The atomic close: title event or licence, both cash moves, one transaction, the offer accepted. */
function closeOffer(state: GameState, offer: RightsOffer, week: number): GameState {
  const buyer = buyerOf(offer)
  const seller = sellerOf(offer)
  const subject = instrumentSubject(offer.instrument)
  const txAllocated = allocateRightsId(state.rights, 'rights-tx')
  let next: GameState = { ...state, rights: txAllocated.root }
  const titleEventIds: string[] = []
  let licenceId: string | null = null
  if (offer.instrument.kind === 'title') {
    const appended = appendTitleEvent(next, { subject, priorHolder: seller, newHolder: buyer, cause: 'sale', date: { kind: 'campaign', week }, source: { kind: 'transaction', transactionId: txAllocated.id } })
    next = appended.state
    titleEventIds.push(appended.event.id)
  } else {
    const minted = mintLicence(next, { right: offer.instrument.right, subject, scope: offer.instrument.scope, exclusive: offer.instrument.exclusive,
      startWeek: offer.instrument.startWeek, endWeekExclusive: offer.instrument.endWeekExclusive, grantorId: seller, granteeId: buyer }, week, txAllocated.id)
    licenceId = minted.licence.id
    next = minted.state
  }
  next = moveStudioCash(next, buyer, 'rightsConsideration', -offer.price, week, txAllocated.id)
  next = moveStudioCash(next, seller, 'rightsConsideration', offer.price, week, txAllocated.id)
  const transaction: RightsTransaction = { id: txAllocated.id, week, kind: offer.instrument.kind === 'title' ? 'titleSale' : 'licenceGrant', payerId: buyer, payeeId: seller,
    estateId: null, amount: offer.price, subject, licenceId, offerId: offer.id, lotId: null, bidId: null, titleEventIds }
  next = { ...next, rights: { ...next.rights, transactions: [...next.rights.transactions, transaction] } }
  return resolveOffer(next, offer.id, 'accepted', week, txAllocated.id, null)
}

/** The counterparty accepts: every closing condition is held again, then the close is atomic. */
export function acceptOffer(state: GameState, offerId: string, studioId: string, week: number, readers: CorporateConditionReaders = corporateConditionReaders): GameState {
  const offer = requireOpenOffer(state, offerId, week)
  if (offer.counterpartyId !== studioId) throw new Error(`rights: only the counterparty ${offer.counterpartyId} may accept offer ${offerId}`)
  const refusal = closingRefusal(state, offer, week, readers)
  if (refusal !== null) throw new Error(`rights offer refused at acceptance: ${refusal}`)
  return closeOffer(state, offer, week)
}

export function rejectOffer(state: GameState, offerId: string, studioId: string, week: number): GameState {
  const offer = requireOpenOffer(state, offerId, week)
  if (offer.counterpartyId !== studioId) throw new Error(`rights: only the counterparty ${offer.counterpartyId} may reject offer ${offerId}`)
  return resolveOffer(state, offerId, 'rejected', week, null, 'rejectedByCounterparty')
}

export function withdrawOffer(state: GameState, offerId: string, studioId: string, week: number): GameState {
  const offer = requireOpenOffer(state, offerId, week)
  if (offer.offerorId !== studioId) throw new Error(`rights: only the offeror ${offer.offerorId} may withdraw offer ${offerId}`)
  return resolveOffer(state, offerId, 'withdrawn', week, null, null)
}

/** The provisional rival policy: sells at or above value × (100 + p) / 100, buys at or below value × (100 − p) / 100. */
export function rivalWillingness(state: GameState, offer: Pick<RightsOffer, 'direction' | 'instrument' | 'price' | 'offerorId' | 'counterpartyId'>, week: number): { willing: boolean; reason: string; value: number | null } {
  const subject = instrumentSubject(offer.instrument)
  const valued = subjectValueV1(state, subject, week)
  if (valued.kind !== 'available') return { willing: false, reason: `valueUnavailable:${valued.reason}`, value: null }
  const p = TUNING.RIGHTS_WILLINGNESS_PREMIUM_PERCENT
  const rivalSells = offer.direction === 'buy'
  const threshold = rivalSells ? Math.ceil((valued.value * (100 + p)) / 100) : Math.floor((valued.value * (100 - p)) / 100)
  const willing = rivalSells ? offer.price >= threshold : offer.price <= threshold
  return { willing, reason: willing ? 'willing' : `notWilling:${rivalSells ? 'priceBelowAsk' : 'priceAboveBid'}:${threshold}`, value: valued.value }
}

/** Every open offer addressed to a rival is answered at the week boundary: closed when willing and lawful, else rejected with its reason. */
export function answerRivalOffers(state: GameState, week: number, readers: CorporateConditionReaders = corporateConditionReaders): GameState {
  const h = state.hollywood
  if (!h) return state
  let next = state
  // r2 (F36): allocation order — the root appends offers as the allocator issues them — never lexicographic id order.
  for (const offer of state.rights.offers) {
    if (offer.status !== 'open' || offer.counterpartyId === h.playerStudioId || week >= offer.expiresWeek) continue
    const willingness = rivalWillingness(next, offer, week)
    if (!willingness.willing) { next = resolveOffer(next, offer.id, 'rejected', week, null, willingness.reason); continue }
    const refusal = closingRefusal(next, offer, week, readers)
    if (refusal !== null) { next = resolveOffer(next, offer.id, 'rejected', week, null, refusal); continue }
    next = closeOffer(next, offer, week)
  }
  return next
}

/** Open offers at or past their expiry expire; their reservations release with them. */
export function expireOffers(state: GameState, week: number): GameState {
  let next = state
  for (const offer of state.rights.offers) {
    if (offer.status === 'open' && week >= offer.expiresWeek) next = resolveOffer(next, offer.id, 'expired', week, null, null)
  }
  return next
}

/** The buyer, seller and subject of an offer, for read models. */
export function offerParties(offer: RightsOffer): { buyerId: string; sellerId: string; subject: RightSubject; key: string } {
  const subject = instrumentSubject(offer.instrument)
  return { buyerId: buyerOf(offer), sellerId: sellerOf(offer), subject, key: subjectKey(subject) }
}

export { licenceInForce }
