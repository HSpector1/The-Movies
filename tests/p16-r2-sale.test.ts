// ── P16 r2: bilateral sale laws the r1 selection never pinned ──
//
// Review r1 majors F49 (contract §6 "Recheck at closing; an earlier quote is not a cash reservation"), F50 (contract
// §3 "An R1 sale OR EXCLUSIVE R3 GRANT touching an active production ... Otherwise refuse"); minors F56 (open offers
// expire in the weekly tick), F57 (the side of the willingness policy where a rival BUYS), F36 (rivals answer offers in
// allocation order, not lexicographic id order). Each test fails when its law is removed (evidence/r2 mutation runs).

import { describe, expect, it } from 'vitest'
import * as licence from '../src/core/licence.js'
import * as sale from '../src/core/assetSale.js'
import * as finance from '../src/core/rightsFinance.js'
import { subjectValueV1 } from '../src/core/propertyValuation.js'
import * as rights from '../src/core/rights.js'
import { tick } from '../src/core/tick.js'
import { TUNING } from '../src/core/tuning.js'
import type { GameState } from '../src/core/types.js'
import { detached, liveFromGenuine, STABLE } from './helpers/p16-fixtures.js'

function world() {
  const state = liveFromGenuine('week53')
  const h = state.hollywood!
  const [player, r01, r02, r03] = [h.playerStudioId, ...h.identities.slice(1, 4).map((i) => i.studioId)] as [string, string, string, string]
  const week = state.market.tick
  const settled = (studioId: string) => h.films.find((f) => f.studioId === studioId && f.provenance === 'simulation/v1' && f.settledWeek !== null)!
  const film = (studioId: string) => ({ right: 'R2' as const, filmId: settled(studioId).filmId })
  const value = (s: GameState, subject: { right: 'R2'; filmId: string }) => { const v = subjectValueV1(s, subject, week); if (v.kind !== 'available') throw new Error(v.reason); return v.value }
  return { state, h, player, r01, r02, r03, week, film, value }
}

describe('r2 F49: affordability is rechecked at closing', () => {
  it('a buy offer made while affordable refuses at acceptance once the buyer\'s cash no longer covers the reserve', () => {
    const { state, player, r01, week, film } = world()
    const { state: offered, offer } = sale.makeOffer(state, { offerorId: player, counterpartyId: r01, direction: 'buy', instrument: { kind: 'title', subject: film(r01) }, price: 100_000 }, week, STABLE)
    expect(sale.closingRefusal(offered, offer, week, STABLE)).toBeNull()
    const spent = detached(offered)
    spent.studio.cash = finance.postPurchaseReserve(spent, player) + 99_999 // spendable now short of price + reserve by one dollar
    expect(sale.closingRefusal(spent, offer, week, STABLE)).toBe('insufficientCashAfterReserve')
    expect(() => sale.acceptOffer(spent, offer.id, r01, week, STABLE)).toThrow(/insufficientCashAfterReserve/)
  })
})

describe('r2 F50: an exclusive R3 grant on a property with an active production refuses, like its title sale', () => {
  it('the producer and the offer path both name activeProductionEncumbrance for a licence on the in-flight concept', () => {
    const { state, h, r01, r02, week } = world()
    const inFlight = h.businesses.find((b) => b.studioId === r01)!.productions[0]!
    const P = { right: 'R1' as const, propertyId: rights.storyPropertyId(inFlight.conceptId) }
    const grant: licence.LicenceGrant = { right: 'R3', subject: P, scope: { use: 'sequel' }, exclusive: true, startWeek: week, endWeekExclusive: week + 10, grantorId: r01, granteeId: r02 }
    expect(licence.licenceGrantRefusal(state, grant, week)).toBe('activeProductionEncumbrance')
    expect(sale.offerRefusal(state, { offerorId: r02, counterpartyId: r01, direction: 'buy', price: 1,
      instrument: { kind: 'licence', right: 'R3', subject: P, scope: { use: 'sequel' }, exclusive: true, startWeek: week, endWeekExclusive: week + 10 } }, week, STABLE)).toBe('activeProductionEncumbrance')
  })
})

describe('r2 F56: the weekly tick expires open offers', () => {
  it('an offer the player never answers expires at its expiry week through tick, not only through a direct call', () => {
    const { state, player, r01, week, film } = world()
    const { state: offered, offer } = sale.makeOffer(state, { offerorId: r01, counterpartyId: player, direction: 'sell', instrument: { kind: 'title', subject: film(r01) }, price: 50_000 }, week, STABLE)
    let s = offered
    for (let i = 0; i < TUNING.RIGHTS_OFFER_DURATION_WEEKS; i++) s = tick(s)
    expect(s.market.tick).toBe(offer.expiresWeek)
    expect(s.rights.offers.find((o) => o.id === offer.id)).toMatchObject({ status: 'expired', resolvedWeek: offer.expiresWeek })
  })
})

describe('r2 F57: a rival buys at or below its bid and rejects one dollar above it', () => {
  it('a sell offer to a rival at its bid closes; one dollar over is rejected naming the bid', () => {
    const { state, r01, r02, week, film, value } = world()
    const subject = film(r01)
    const bid = Math.floor((value(state, subject) * (100 - TUNING.RIGHTS_WILLINGNESS_PREMIUM_PERCENT)) / 100)
    const at = sale.makeOffer(state, { offerorId: r01, counterpartyId: r02, direction: 'sell', instrument: { kind: 'title', subject }, price: bid }, week, STABLE)
    expect(sale.answerRivalOffers(at.state, week, STABLE).rights.offers.find((o) => o.id === at.offer.id)!.status).toBe('accepted')
    const over = sale.makeOffer(state, { offerorId: r01, counterpartyId: r02, direction: 'sell', instrument: { kind: 'title', subject }, price: bid + 1 }, week, STABLE)
    expect(sale.answerRivalOffers(over.state, week, STABLE).rights.offers.find((o) => o.id === over.offer.id)).toMatchObject({ status: 'rejected', refusal: `notWilling:priceAboveBid:${bid}` })
  })
})

describe('r2 F36: rivals answer open offers in allocation order', () => {
  it('with cash for one of two sell offers, the earlier-allocated offer (rights-offer-9) closes before rights-offer-10', () => {
    const { state, r01, r02, r03, week, film, value } = world()
    const nine = { ...state, rights: { ...state.rights, nextId: 9 } } as GameState
    const priceOf = (studioId: string) => Math.floor((value(state, film(studioId)) * (100 - TUNING.RIGHTS_WILLINGNESS_PREMIUM_PERCENT)) / 100)
    const first = sale.makeOffer(nine, { offerorId: r02, counterpartyId: r01, direction: 'sell', instrument: { kind: 'title', subject: film(r02) }, price: priceOf(r02) }, week, STABLE)
    const second = sale.makeOffer(first.state, { offerorId: r03, counterpartyId: r01, direction: 'sell', instrument: { kind: 'title', subject: film(r03) }, price: priceOf(r03) }, week, STABLE)
    expect([first.offer.id, second.offer.id]).toEqual(['rights-offer-9', 'rights-offer-10'])
    const tight = detached(second.state)
    const buyer = tight.hollywood!.businesses.find((b) => b.studioId === r01)!
    buyer.account.cash = finance.postPurchaseReserve(tight, r01) + Math.max(priceOf(r02), priceOf(r03))
    const answered = sale.answerRivalOffers(tight, week, STABLE)
    expect(answered.rights.offers.find((o) => o.id === 'rights-offer-9')!.status).toBe('accepted')
    expect(answered.rights.offers.find((o) => o.id === 'rights-offer-10')).toMatchObject({ status: 'rejected', refusal: 'insufficientCashAfterReserve' })
  })
})
