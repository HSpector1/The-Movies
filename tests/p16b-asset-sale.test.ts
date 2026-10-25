// ── P16B RED: lawful bilateral title sales and R3 licences, exact cash receipts, reservations ──
//
// Authority: P16 integration contract §3 (R1/R2 whole-title sale; R3 exclusive term licence only;
// R4 no executable grant before P18; refuse overlapping exclusive scopes, unknown subjects, expired
// permission, over-wide grants; a title sale preserves live licences; active production/run
// encumbrances refuse), §6 (permitted bidder; cash funded with post-purchase reserve; commitment
// reservation while a binding offer is outstanding; bilateral quote -> acceptance -> atomic close
// or refusal/expiry; no auction; holdback/anti-flip; cooldown), §7 groups R/M; 1362-O §5.4, §5.7;
// P16A r3 ("Whole-title sale belongs to P16B; live R3/R4 grants survive it").
//
// Fixture: the genuine week-53 Save45 capture lifted to 46 (four rivals with libraries; the player
// with cash and no films). Rival answers run through the real tick; rival <-> rival sales call the
// same functions directly (symmetric law).

import { describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import * as sale from '../src/core/assetSale.js'
import * as finance from '../src/core/rightsFinance.js'
import * as rights from '../src/core/rights.js'
import { libraryValuationV1, subjectValueV1 } from '../src/core/propertyValuation.js'
import { convertV49ToV48, importSave, makeSave, migrateToLive, stableStringify } from '../src/core/save.js'
import { advanceRightsWeek } from '../src/core/rightsTick.js'
import { tick } from '../src/core/tick.js'
import { TUNING } from '../src/core/tuning.js'
import type { GameState } from '../src/core/types.js'
import { detached, liveFromGenuine, readersWith, STABLE } from './helpers/p16-fixtures.js'

type RightSubject = { right: 'R1'; propertyId: string } | { right: 'R2'; filmId: string }
const R1 = (propertyId: string): RightSubject => ({ right: 'R1', propertyId })
const R2 = (filmId: string): RightSubject => ({ right: 'R2', filmId })
const title = (subject: RightSubject) => ({ kind: 'title' as const, subject })
const premium = TUNING.RIGHTS_WILLINGNESS_PREMIUM_PERCENT

function world() {
  const state = liveFromGenuine('week53')
  const h = state.hollywood!
  const [player, r01, r02, r03, r04] = [h.playerStudioId, ...h.identities.slice(1, 5).map((i) => i.studioId)] as [string, string, string, string, string]
  const settledFilm = (studioId: string) => h.films.find((f) => f.studioId === studioId && f.provenance === 'simulation/v1' && f.settledWeek !== null)!
  const value = (subject: RightSubject) => { const v = subjectValueV1(state, subject, state.market.tick); if (v.kind !== 'available') throw new Error(v.reason); return v.value }
  return { state, h, player, r01, r02, r03, r04, settledFilm, value, week: state.market.tick }
}
const sellPrice = (value: number) => Math.ceil((value * (100 + premium)) / 100)
const buyPrice = (value: number) => Math.floor((value * (100 - premium)) / 100)
const rivalCash = (state: GameState, id: string) => state.hollywood!.businesses.find((b) => b.studioId === id)!.account.cash
const rivalMoved = (state: GameState, id: string, kind: 'rightsConsideration' | 'dueDiligenceFee' | 'acquisitionOutlay') =>
  state.hollywood!.businesses.find((b) => b.studioId === id)!.account.periods.reduce((s, p) => s + p.movements[kind], 0)

describe('P16B permitted bidder and cash law', () => {
  it('a stable, operating, founded studio with no distress loan is a permitted bidder; every other stage, a loan, founding, or an un-entered identity refuses by name', () => {
    const { state, player, r01, week } = world()
    expect(finance.permittedBidderRefusal(state, player, week, STABLE)).toBeNull()
    expect(finance.permittedBidderRefusal(state, r01, week, STABLE)).toBeNull()
    for (const stage of ['warning', 'distress', 'recovery', 'closed'] as const) {
      expect(finance.permittedBidderRefusal(state, r01, week, readersWith({ [r01]: stage }))).toBe(`stageNotStable:${stage}`)
    }
    expect(finance.permittedBidderRefusal(state, r01, week, readersWith({}, [r01]))).toBe('outstandingDistressLoan')
    expect(finance.permittedBidderRefusal(state, state.hollywood!.identities[9]!.studioId, week, STABLE)).toBe('notOperating')
    expect(finance.permittedBidderRefusal(state, 'studio-nobody', week, STABLE)).toBe('unknownStudio')
    const founding = { ...state, founding: { applicantIds: [], budget: 0, spentBonus: 0 } } as GameState
    expect(finance.permittedBidderRefusal(founding, player, week, STABLE)).toBe('founding')
  })

  it('the post-purchase reserve is RIGHTS_RESERVE_WEEKS of the buyer\'s resulting weekly fixed cost, and spendable cash is cash minus open reservations', () => {
    const { state, player, r01, week } = world()
    expect(finance.postPurchaseReserve(state, player)).toBe(TUNING.RIGHTS_RESERVE_WEEKS * finance.weeklyFixedCost(state, player))
    expect(finance.postPurchaseReserve(state, r01)).toBe(TUNING.RIGHTS_RESERVE_WEEKS * finance.weeklyFixedCost(state, r01))
    expect(finance.reservedCash(state, player)).toBe(0)
    expect(finance.spendableCash(state, player)).toBe(state.studio.cash)
    expect(finance.affordabilityRefusal(state, player, finance.spendableCash(state, player) - finance.postPurchaseReserve(state, player))).toBeNull()
    expect(finance.affordabilityRefusal(state, player, finance.spendableCash(state, player) - finance.postPurchaseReserve(state, player) + 1)).toBe('insufficientCashAfterReserve')
    expect(finance.affordabilityRefusal(state, r01, rivalCash(state, r01))).toBe('insufficientCashAfterReserve')
    expect(week).toBe(53)
  })

  it('the explicit UNBOUND negative fixture refuses a bidder without evaluated condition authority', () => {
    const { state, r01, week } = world()
    expect(finance.permittedBidderRefusal(state, r01, week, finance.UNBOUND_CORPORATE_CONDITION_READERS)).toBe('conditionUnavailable')
  })
})

describe('P16B bilateral title sale: player buys a rival film through a binding offer the rival answers at the next tick', () => {
  it('reserves the price while the offer is open, closes atomically with exact receipts on both sides, moves the R2 title and its value, and saves/reloads', () => {
    const { state, player, r01, settledFilm, value, week } = world()
    const film = settledFilm(r01)
    const subject = R2(film.filmId)
    const price = sellPrice(value(subject))
    const cashBefore = state.studio.cash
    const r01Before = rivalCash(state, r01)
    const { state: offered, offer } = sale.makeOffer(state, { offerorId: player, counterpartyId: r01, direction: 'buy', instrument: title(subject), price }, week, STABLE)
    expect(offer).toMatchObject({ offerorId: player, counterpartyId: r01, direction: 'buy', price, week, expiresWeek: week + TUNING.RIGHTS_OFFER_DURATION_WEEKS, status: 'open', transactionId: null })
    expect(offered.studio.cash).toBe(cashBefore) // a reservation is not a payment
    expect(finance.reservedCash(offered, player)).toBe(price)
    expect(finance.spendableCash(offered, player)).toBe(cashBefore - price)
    expect(offered.rights.transactions).toEqual([])
    expect(() => makeSave(offered)).not.toThrow()
    // The rival answers at the boundary under bound readers standing in for P15B's; the unbound tick's refusal is proven in p16b-condition-readers.
    const closed = advanceRightsWeek(offered, week, STABLE)
    const resolved = closed.rights.offers.find((o) => o.id === offer.id)!
    expect(resolved.status).toBe('accepted')
    expect(resolved.resolvedWeek).toBe(week)
    const tx = closed.rights.transactions.find((t) => t.id === resolved.transactionId)!
    expect(tx).toMatchObject({ kind: 'titleSale', payerId: player, payeeId: r01, amount: price, subject, offerId: offer.id, estateId: null })
    expect(tx.titleEventIds).toHaveLength(1)
    // Exact receipts: one player ledger row, one rival movement, each once; nothing else moved by the sale.
    const rows = closed.ledger.filter((e) => e.kind === 'rightsConsideration')
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({ week, kind: 'rightsConsideration', amount: -price, note: tx.id })
    expect(rivalMoved(closed, r01, 'rightsConsideration')).toBe(price)
    // Money conservation: the buyer paid the price exactly once, the seller received it exactly once, nothing else moved.
    expect(closed.studio.cash).toBe(cashBefore - price)
    expect(rivalCash(closed, r01)).toBe(r01Before + price)
    // Title: the creator is permanent; the holder is now the player; the event cites the transaction.
    expect(rights.currentHolder(closed, subject, closed.market.tick)).toEqual({ kind: 'holder', holderId: player, tradeable: true, archived: false })
    expect(rights.currentHolder(closed, subject, week - 1)).toEqual({ kind: 'holder', holderId: r01, tradeable: true, archived: false })
    expect(closed.rights.filmTitles.find((t) => t.filmId === film.filmId)!.creatorStudioId).toBe(r01)
    const event = closed.rights.titleEvents.find((e) => e.id === tx.titleEventIds[0])!
    expect(event).toMatchObject({ subject, cause: 'sale', priorHolder: r01, newHolder: player, date: { kind: 'campaign', week }, source: { kind: 'transaction', transactionId: tx.id } })
    // Reservation released on closing; value moved; no second payment.
    expect(finance.reservedCash(closed, player)).toBe(0)
    const playerValue = libraryValuationV1(closed, player, closed.market.tick)
    expect(playerValue.kind === 'available' && playerValue.items).toEqual([{ subject, value: value(subject) }])
    // The era boundary: saves, reloads, and refuses the downgrade by name (a real recorded sale).
    const reloaded = migrateToLive(importSave(stableStringify(makeSave(closed)))).state as GameState
    expect(stableStringify(reloaded.rights)).toBe(stableStringify(closed.rights))
    expect(() => convertV49ToV48(makeSave(closed))).toThrow(/migrateToV48: cannot downgrade or discard a recorded rights root/)
    // Replay: the same step on the same state is byte-identical.
    expect(stableStringify(advanceRightsWeek(offered, week, STABLE))).toBe(stableStringify(closed))
  })

  it('an offer below the rival\'s willingness is rejected at the next tick, the reservation is released, and a re-offer inside the cooldown refuses', () => {
    const { state, player, r01, settledFilm, value, week } = world()
    const subject = R2(settledFilm(r01).filmId)
    const price = sellPrice(value(subject)) - 1
    const { state: offered, offer } = sale.makeOffer(state, { offerorId: player, counterpartyId: r01, direction: 'buy', instrument: title(subject), price }, week, STABLE)
    const answered = tick(offered)
    const resolved = answered.rights.offers.find((o) => o.id === offer.id)!
    expect(resolved.status).toBe('rejected')
    expect(resolved.refusal).toMatch(/^notWilling:priceBelowAsk:\d+$/)
    expect(finance.reservedCash(answered, player)).toBe(0)
    expect(answered.rights.transactions).toEqual([])
    expect(answered.ledger.filter((e) => e.kind === 'rightsConsideration')).toEqual([])
    expect(rights.currentHolder(answered, subject, answered.market.tick)).toMatchObject({ holderId: r01 })
    const again = { offerorId: player, counterpartyId: r01, direction: 'buy' as const, instrument: title(subject), price: price + 1 }
    expect(sale.offerRefusal(answered, again, answered.market.tick, STABLE)).toBe('offerCooldown')
    // The cooldown runs from the rejection week (the produced week the rival answered in).
    const unlock = resolved.resolvedWeek! + TUNING.RIGHTS_OFFER_COOLDOWN_WEEKS
    expect(sale.offerRefusal({ ...answered, market: { ...answered.market, tick: unlock - 1 } }, again, unlock - 1, STABLE)).toBe('offerCooldown')
    expect(sale.offerRefusal({ ...answered, market: { ...answered.market, tick: unlock } }, again, unlock, STABLE)).toBeNull()
  })

  it('refusals are pure and named: non-holder seller, unknown subject, active run (R2), active production (R1), ineligible buyer, unaffordable price, double-spent reservation, duplicate open offer, self-dealing', () => {
    const { state, h, player, r01, r02, r04, settledFilm, value, week } = world()
    const before = stableStringify(state)
    const film = settledFilm(r01)
    const offer = (over: Partial<Parameters<typeof sale.offerRefusal>[1]>) => sale.offerRefusal(state,
      { offerorId: player, counterpartyId: r01, direction: 'buy', instrument: title(R2(film.filmId)), price: sellPrice(value(R2(film.filmId))), ...over }, week, STABLE)
    expect(offer({})).toBeNull()
    expect(offer({ counterpartyId: r02 })).toBe('counterpartyNotHolder')
    expect(offer({ instrument: title(R2('no-such-film')) })).toBe('unknownSubject')
    const running = h.films.find((f) => f.provenance === 'simulation/v1' && f.settledWeek === null)!
    expect(offer({ counterpartyId: running.studioId, instrument: title(R2(running.filmId)), price: 1 })).toBe('activeRunEncumbrance')
    const inFlight = h.businesses.find((b) => b.studioId === r01)!.productions[0]!
    expect(offer({ instrument: title(R1(rights.storyPropertyId(inFlight.conceptId))), price: 1 })).toBe('activeProductionEncumbrance')
    expect(sale.offerRefusal(state, { offerorId: player, counterpartyId: r01, direction: 'buy', instrument: title(R2(film.filmId)), price: 1 }, week,
      readersWith({ [player]: 'warning' }))).toBe('buyerNotPermitted:stageNotStable:warning')
    expect(sale.offerRefusal(state, { offerorId: player, counterpartyId: r01, direction: 'buy', instrument: title(R2(film.filmId)), price: 1 }, week,
      readersWith({}, [player]))).toBe('buyerNotPermitted:outstandingDistressLoan')
    expect(offer({ price: finance.spendableCash(state, player) })).toBe('insufficientCashAfterReserve')
    expect(offer({ price: -1 })).toBe('invalidPrice')
    expect(offer({ price: 1.5 })).toBe('invalidPrice')
    expect(offer({ counterpartyId: player })).toBe('selfDealing')
    // A rival buyer that cannot keep its reserve: r04 holds the least cash.
    const r04Buy = { offerorId: r04, counterpartyId: r01, direction: 'buy' as const, instrument: title(R2(film.filmId)), price: Math.max(1, Math.round(rivalCash(state, r04))) }
    expect(sale.offerRefusal(state, r04Buy, week, STABLE)).toBe('insufficientCashAfterReserve')
    // Two outstanding offers cannot each spend the same cash.
    const affordable = finance.spendableCash(state, player) - finance.postPurchaseReserve(state, player)
    const half = Math.floor(affordable / 2) + 1
    const first = sale.makeOffer(state, { offerorId: player, counterpartyId: r01, direction: 'buy', instrument: title(R2(film.filmId)), price: half }, week, STABLE).state
    const second = h.films.find((f) => f.studioId === r02 && f.provenance === 'simulation/v1' && f.settledWeek !== null)!
    expect(sale.offerRefusal(first, { offerorId: player, counterpartyId: r02, direction: 'buy', instrument: title(R2(second.filmId)), price: half }, week, STABLE)).toBe('insufficientCashAfterReserve')
    expect(sale.offerRefusal(first, { offerorId: player, counterpartyId: r01, direction: 'buy', instrument: title(R2(film.filmId)), price: half }, week, STABLE)).toBe('duplicateOpenOffer')
    expect(stableStringify(state)).toBe(before)
  })
})

describe('P16B symmetric law: rival <-> rival sale, withdrawal, expiry, holdback', () => {
  it('a rival sells a film to a rival at acceptance with exact movements on both accounts; withdrawal releases; expiry releases', () => {
    const { state, r01, r02, settledFilm, value, week } = world()
    const subject = R2(settledFilm(r02).filmId)
    const price = buyPrice(value(subject))
    const { state: offered, offer } = sale.makeOffer(state, { offerorId: r01, counterpartyId: r02, direction: 'buy', instrument: title(subject), price }, week, STABLE)
    expect(finance.reservedCash(offered, r01)).toBe(price)
    const closed = sale.acceptOffer(offered, offer.id, r02, week, STABLE)
    expect(rivalCash(closed, r01)).toBe(rivalCash(state, r01) - price)
    expect(rivalCash(closed, r02)).toBe(rivalCash(state, r02) + price)
    expect(rivalMoved(closed, r01, 'rightsConsideration')).toBe(-price)
    expect(rivalMoved(closed, r02, 'rightsConsideration')).toBe(price)
    expect(rights.currentHolder(closed, subject, week)).toMatchObject({ holderId: r01 })
    expect(closed.studio.cash).toBe(state.studio.cash)
    expect(closed.ledger).toEqual(state.ledger)
    expect(() => makeSave(closed)).not.toThrow()
    // Only the counterparty may accept; an accepted offer cannot be accepted or withdrawn again.
    expect(() => sale.acceptOffer(offered, offer.id, r01, week, STABLE)).toThrow(/counterparty/)
    expect(() => sale.acceptOffer(closed, offer.id, r02, week, STABLE)).toThrow(/open/)
    expect(() => sale.withdrawOffer(closed, offer.id, r01, week)).toThrow(/open/)
    // Withdrawal by the offeror releases the reservation and moves no money.
    const withdrawn = sale.withdrawOffer(offered, offer.id, r01, week)
    expect(withdrawn.rights.offers.find((o) => o.id === offer.id)!.status).toBe('withdrawn')
    expect(finance.reservedCash(withdrawn, r01)).toBe(0)
    expect(rivalCash(withdrawn, r01)).toBe(rivalCash(state, r01))
    expect(() => sale.withdrawOffer(offered, offer.id, r02, week)).toThrow(/offeror/)
    // Expiry at expiresWeek releases; before it nothing changes.
    expect(sale.expireOffers(offered, offer.expiresWeek - 1).rights.offers.find((o) => o.id === offer.id)!.status).toBe('open')
    const expired = sale.expireOffers(offered, offer.expiresWeek)
    expect(expired.rights.offers.find((o) => o.id === offer.id)!).toMatchObject({ status: 'expired', resolvedWeek: offer.expiresWeek })
    expect(finance.reservedCash(expired, r01)).toBe(0)
    expect(() => sale.acceptOffer(expired, offer.id, r02, offer.expiresWeek, STABLE)).toThrow(/open/)
  })

  it('a bought title cannot be resold inside the holdback; a sale is refused by the seller side when the buyer\'s facts changed at acceptance (revalidation)', () => {
    const { state, r01, r02, r03, settledFilm, value, week } = world()
    const subject = R2(settledFilm(r02).filmId)
    const price = buyPrice(value(subject))
    const { state: offered, offer } = sale.makeOffer(state, { offerorId: r01, counterpartyId: r02, direction: 'buy', instrument: title(subject), price }, week, STABLE)
    const closed = sale.acceptOffer(offered, offer.id, r02, week, STABLE)
    expect(sale.resaleHoldbackRefusal(closed, subject, r01, week)).toBe('resaleHoldback')
    expect(sale.resaleHoldbackRefusal(closed, subject, r01, week + TUNING.RIGHTS_RESALE_HOLDBACK_WEEKS - 1)).toBe('resaleHoldback')
    expect(sale.resaleHoldbackRefusal(closed, subject, r01, week + TUNING.RIGHTS_RESALE_HOLDBACK_WEEKS)).toBeNull()
    expect(sale.offerRefusal(closed, { offerorId: r03, counterpartyId: r01, direction: 'buy', instrument: title(subject), price }, week, STABLE)).toBe('resaleHoldback')
    // Revalidation at acceptance: the buyer is no longer a permitted bidder.
    expect(() => sale.acceptOffer(offered, offer.id, r02, week, readersWith({ [r01]: 'distress' }))).toThrow(/buyerNotPermitted/)
  })
})

describe('P16B licences: R3 exclusive term grants, overlap, scope, survival through a title sale, reversion', () => {
  const sequel = (subject: RightSubject, startWeek: number, endWeekExclusive: number, exclusive = true) =>
    ({ kind: 'licence' as const, right: 'R3' as const, subject, scope: { use: 'sequel' as const }, exclusive, startWeek, endWeekExclusive })

  it('grants an exclusive sequel licence with consideration; authority for that scope moves to the grantee while the title stays with the grantor', () => {
    const { state, r01, r02, settledFilm, week } = world()
    const property = R1(rights.storyPropertyId(settledFilm(r01).conceptId))
    const optionValue = subjectValueV1(state, property, week)
    expect(optionValue.kind).toBe('available')
    const price = sellPrice(optionValue.kind === 'available' ? optionValue.value : 0)
    const { state: offered, offer } = sale.makeOffer(state, { offerorId: r02, counterpartyId: r01, direction: 'buy', instrument: sequel(property, week, week + 104), price }, week, STABLE)
    const granted = sale.acceptOffer(offered, offer.id, r01, week, STABLE)
    expect(granted.rights.licences).toHaveLength(1)
    const licence = granted.rights.licences[0]!
    expect(licence).toMatchObject({ right: 'R3', subject: property, scope: { use: 'sequel' }, exclusive: true, grantorId: r01, granteeId: r02, startWeek: week, endWeekExclusive: week + 104, grantedWeek: week })
    const tx = granted.rights.transactions.find((t) => t.id === licence.transactionId)!
    expect(tx).toMatchObject({ kind: 'licenceGrant', payerId: r02, payeeId: r01, amount: price, licenceId: licence.id, subject: property })
    expect(rivalMoved(granted, r02, 'rightsConsideration')).toBe(-price)
    expect(rivalMoved(granted, r01, 'rightsConsideration')).toBe(price)
    expect(rights.rightsAuthority(granted, property, 'R3', week, { use: 'sequel' })).toEqual({ kind: 'authority', studioId: r02, via: 'licence', licenceId: licence.id })
    expect(rights.rightsAuthority(granted, property, 'R3', week, { use: 'remake' })).toEqual({ kind: 'authority', studioId: r01, via: 'title', licenceId: null })
    expect(rights.rightsAuthority(granted, property, 'R3', week)).toEqual({ kind: 'authority', studioId: r01, via: 'title', licenceId: null })
    expect(rights.currentHolder(granted, property, week)).toMatchObject({ holderId: r01 })
    expect(() => makeSave(granted)).not.toThrow()
    // Refusals: an overlapping exclusive sequel grant to a third studio; a sublicence by the grantee; an R4 grant; an R3 on a film.
    const { r03 } = world()
    expect(sale.offerRefusal(granted, { offerorId: r03, counterpartyId: r01, direction: 'buy', instrument: sequel(property, week + 10, week + 20), price }, week, STABLE)).toBe('exclusiveOverlap')
    expect(sale.offerRefusal(granted, { offerorId: r03, counterpartyId: r02, direction: 'buy', instrument: sequel(property, week, week + 10), price }, week, STABLE)).toBe('counterpartyNotHolder')
    expect(sale.offerRefusal(granted, { offerorId: r03, counterpartyId: r01, direction: 'buy', instrument: { ...sequel(property, week, week + 10), scope: { use: 'remake' } }, price }, week, STABLE)).toBeNull()
    expect(sale.offerRefusal(granted, { offerorId: r03, counterpartyId: r01, direction: 'buy', instrument: { ...sequel(property, week, week + 10), right: 'R4', scope: { use: 'television' } }, price }, week, STABLE)).toBe('r4ConsumerNotLive')
    expect(sale.offerRefusal(granted, { offerorId: r03, counterpartyId: r01, direction: 'buy', instrument: sequel(R2(settledFilm(r01).filmId), week, week + 10), price }, week, STABLE)).toBe('r3RequiresProperty')
    expect(sale.offerRefusal(granted, { offerorId: r03, counterpartyId: r01, direction: 'buy', instrument: sequel(property, week - 1, week + 10), price }, week, STABLE)).toBe('invalidTerm')
    expect(sale.offerRefusal(granted, { offerorId: r03, counterpartyId: r01, direction: 'buy', instrument: sequel(property, week + 10, week + 10), price }, week, STABLE)).toBe('invalidTerm')
  })

  it('a whole-title sale of the property preserves the live licence and the grantee; an expired licence reverts authority to the holder', () => {
    const { state, player, r01, r02, settledFilm, value, week } = world()
    const property = R1(rights.storyPropertyId(settledFilm(r01).conceptId))
    const optionValue = value(property)
    const { state: offered, offer } = sale.makeOffer(state, { offerorId: r02, counterpartyId: r01, direction: 'buy', instrument: sequel(property, week, week + 2), price: sellPrice(optionValue) }, week, STABLE)
    const granted = sale.acceptOffer(offered, offer.id, r01, week, STABLE)
    const licenceId = granted.rights.licences[0]!.id
    // The player buys the (encumbered) property outright; the licence survives with its term and grantee.
    const buy = sale.makeOffer(granted, { offerorId: player, counterpartyId: r01, direction: 'buy', instrument: title(property), price: sellPrice(optionValue) }, week, STABLE)
    const sold = sale.acceptOffer(buy.state, buy.offer.id, r01, week, STABLE)
    expect(rights.currentHolder(sold, property, week)).toMatchObject({ holderId: player })
    expect(sold.rights.licences).toEqual(granted.rights.licences)
    expect(rights.rightsAuthority(sold, property, 'R3', week, { use: 'sequel' })).toEqual({ kind: 'authority', studioId: r02, via: 'licence', licenceId })
    // Two ticks later the term [week, week+2) has ended: authority reverts to the current holder.
    const later = tick(tick(sold))
    expect(later.market.tick).toBe(week + 2)
    expect(rights.rightsAuthority(later, property, 'R3', later.market.tick, { use: 'sequel' })).toEqual({ kind: 'authority', studioId: player, via: 'title', licenceId: null })
    expect(later.rights.licences).toHaveLength(1) // expiry is not deletion
    expect(() => makeSave(later)).not.toThrow()
  })
})

describe('P16B actions: the player\'s verbs route through applyActions with refusal purity', () => {
  it('makeRightsOffer / withdrawRightsOffer / acceptRightsOffer / rejectRightsOffer dispatch; a refused verb throws and changes nothing; the buyer-side verbs refuse by name while the P15B readers are unbound', () => {
    const { state, player, r01, settledFilm, value, week } = world()
    const subject = R2(settledFilm(r01).filmId)
    const price = sellPrice(value(subject))
    const before = stableStringify(state)
    // The shipped binding is unbound (fail-closed): the player's buy verb is refused by name ahead of every other law; nothing changes.
    expect(() => applyActions(state, [{ kind: 'makeRightsOffer', offer: { counterpartyId: r01, direction: 'buy', instrument: title(subject), price } }])).toThrow(/buyerNotPermitted:conditionUnavailable/)
    expect(() => applyActions(state, [{ kind: 'makeRightsOffer', offer: { counterpartyId: r01, direction: 'buy', instrument: title(R2('no-such-film')), price } }])).toThrow(/buyerNotPermitted:conditionUnavailable/)
    expect(() => applyActions(state, [{ kind: 'acceptRightsOffer', offerId: 'rights-offer-99' }])).toThrow(/unknown offer/)
    expect(stableStringify(state)).toBe(before)
    // An offer that exists (made under bound readers) routes through the verbs that read no bidder facts.
    const offered = sale.makeOffer(state, { offerorId: player, counterpartyId: r01, direction: 'buy', instrument: title(subject), price }, week, STABLE).state
    expect(offered.rights.offers).toHaveLength(1)
    expect(offered.rights.offers[0]!.offerorId).toBe(player)
    const withdrawn = applyActions(offered, [{ kind: 'withdrawRightsOffer', offerId: offered.rights.offers[0]!.id }])
    expect(withdrawn.rights.offers[0]!.status).toBe('withdrawn')
    expect(week).toBe(53)
    // A rival sell offer addressed to the player waits for the player's verb: rejection reads no facts; acceptance revalidates the buyer and refuses by name.
    const rivalSell = sale.makeOffer(detached(state), { offerorId: r01, counterpartyId: player, direction: 'sell', instrument: title(subject), price }, week, STABLE).state
    expect(() => applyActions(rivalSell, [{ kind: 'acceptRightsOffer', offerId: rivalSell.rights.offers[0]!.id }])).toThrow(/buyerNotPermitted:conditionUnavailable/)
    const accepted = sale.acceptOffer(rivalSell, rivalSell.rights.offers[0]!.id, player, week, STABLE)
    expect(rights.currentHolder(accepted, subject, week)).toMatchObject({ holderId: player })
    expect(accepted.studio.cash).toBe(state.studio.cash - price)
    const rejected = applyActions(rivalSell, [{ kind: 'rejectRightsOffer', offerId: rivalSell.rights.offers[0]!.id }])
    expect(rejected.rights.offers[0]!.status).toBe('rejected')
    expect(rejected.studio.cash).toBe(state.studio.cash)
  })
})
