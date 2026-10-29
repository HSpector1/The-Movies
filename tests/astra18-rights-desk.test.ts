// ASTRA Sprint 18 (Owner decision B): the rights desk read model and the title-sale disclosure.
// Built on the natural P18 season route (tests/helpers/p18-season-world.ts). The disclosure is the engine run forward
// on a private copy (src/core/rightsDesk.ts titleSaleOutcome); each case compares it with the real sequence the player
// would live (the action, then the real advances) and pins the law it must show: the week of work before the title
// moves (review FIX-1 finding 1), a milestone earned in that week, a delivery the sale cannot cancel, the final
// boundary, a rejected price, and the same-week close of an accepted buy offer.
import { beforeAll, describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { makeOffer, type PlayerOfferInput } from '../src/core/assetSale.js'
import { permittedBidderRefusal } from '../src/core/rightsFinance.js'
import { playerHolds, rightsDeskView, saleOfferRefusal, titleSaleOutcome, titleSaleOutcomeDigest, type TitleSalePlan } from '../src/core/rightsDesk.js'
import { makeSave } from '../src/core/save.js'
import { tick } from '../src/core/tick.js'
import { tvView } from '../src/core/tvView.js'
import type { GameState } from '../src/core/types.js'
import type { RightSubject } from '../src/core/rights.js'
import { STABLE } from './helpers/p16-fixtures.js'
import { agreement, commissioned, player, season, tickUntil, withCash } from './helpers/p18-route.js'
import { buildSeasonWorld, type SeasonRoute } from './helpers/p18-season-world.js'

let route: SeasonRoute
let live: GameState
let rival: string
let subject: RightSubject
let value: number
beforeAll(() => {
  route = buildSeasonWorld()
  live = commissioned(structuredClone(route))
  const week = live.market.tick
  const candidate = live.hollywood!.businesses.map((b) => b.studioId).filter((id) => id !== player(live)).sort()
    .find((id) => permittedBidderRefusal(live, id, week, STABLE) === null)
  if (candidate === undefined) throw new Error(`premise: no rival P16 permits to buy at week ${week}`)
  rival = candidate
  subject = { right: 'R1', propertyId: route.propertyId }
  const held = rightsDeskView(live).titles.find((t) => t.subject.right === 'R1' && t.subject.propertyId === route.propertyId)
  if (held === undefined || held.value === null) throw new Error('premise: the season property is held and valued')
  value = held.value
}, 240_000)

const sellOffer = (price: number): PlayerOfferInput => ({ counterpartyId: rival, direction: 'sell', instrument: { kind: 'title', subject }, price })
const sellPlan = (price: number): TitleSalePlan => ({ kind: 'offer', offer: sellOffer(price) })
/** The season's view fields the disclosure reports, read from a real state. */
const seasonFacts = (state: GameState) => {
  const s = tvView(state).seasons.find((x) => x.propertyId === route.propertyId)!
  return { status: s.status, cancellation: s.cancellation, deliveredWeek: s.deliveredWeek, creditedUnits: s.creditedUnits, earned: s.agreement.earned, settlement: s.agreement.settlement, outstanding: s.agreement.outstanding }
}
/** The real path of the player's sell offer: the action, the answering advance, and one more advance when the title moved. */
function realSell(state: GameState, price: number): { answered: GameState; reached: GameState } {
  const offered = applyActions(state, [{ kind: 'makeRightsOffer', offer: sellOffer(price) }])
  const answered = tick(offered)
  const moved = !playerHolds(answered, subject)
  return { answered, reached: moved ? tick(answered) : answered }
}

describe('rightsDeskView: what the player holds, may do and is offered, read by the core\'s own laws', () => {
  it('lists the season\'s property as held with its live season, operating rivals only, and the acquisition law gated behind a disclosure', () => {
    const view = rightsDeskView(live)
    expect(view.week).toBe(live.market.tick)
    expect(view.studioId).toBe(player(live))
    const held = view.titles.find((t) => t.subject.right === 'R1' && t.subject.propertyId === route.propertyId)!
    expect(held.liveSeasonIds).toEqual([season(live).seasonId])
    expect(held.saleRefusal).toBeNull()
    expect(view.diligenceFee).toBe(50_000)
    expect(view.offers).toEqual([])
    expect(view.estates).toEqual([])
    const counterparty = view.counterparties.find((c) => c.studioId === rival)!
    expect(counterparty.name.length).toBeGreaterThan(0)
    expect(counterparty.disclosures).toEqual([])
    expect(counterparty.absorption, 'no condition fact leaks before a disclosure is held').toBe('disclosureRequired')
    for (const c of view.counterparties) expect(c.diligence === null || typeof c.diligence === 'string').toBe(true)
    expect(saleOfferRefusal(live, rival, subject, value)).toBeNull()
    expect(saleOfferRefusal(live, 'studio-nobody', subject, value)).toBe('unknownStudio')
  })
})

describe('titleSaleOutcome: the disclosure is what the engine does (decision B, review FIX-1 finding 1)', () => {
  it('a sell offer at the scripts block: the rival answers at the boundary, the season works the week first, then cancels under cause rights', () => {
    const week = live.market.tick
    const disclosed = titleSaleOutcome(live, sellPlan(value))
    if (disclosed.kind !== 'outcome') throw new Error(`premise: ${disclosed.refusal}`)
    expect(disclosed.answer).toEqual({ kind: 'closed', week: week + 1, price: value })
    expect(disclosed.reachesWeek).toBe(week + 2)
    expect(disclosed.seasons).toHaveLength(1)
    const s = disclosed.seasons[0]!
    expect(s.after.cancellation).toEqual({ week: week + 2, cause: 'rights' })
    expect(s.after.creditedUnits, 'the week\'s unit lands before the title moves').toBe(s.before.creditedUnits + 1)
    expect(s.after.settlement).toMatchObject({ week: week + 2, refundDue: s.before.received - s.after.earned, chargeDue: agreement(live).terms.cancellationCharge })
    const { reached } = realSell(live, value)
    expect(seasonFacts(reached)).toEqual(s.after)
    expect(() => makeSave(reached)).not.toThrow()
    // The digest a confirmation carries is stable for the same state and plan, and differs once the state differs.
    expect(titleSaleOutcomeDigest(titleSaleOutcome(live, sellPlan(value)))).toBe(titleSaleOutcomeDigest(disclosed))
    expect(titleSaleOutcomeDigest(titleSaleOutcome(live, sellPlan(value + 1_000)))).not.toBe(titleSaleOutcomeDigest(disclosed))
  }, 60_000)

  it('at two credited units the week\'s unit earns the scripts milestone before the sale: earned rises, the refund falls', () => {
    const at = tickUntil(live, (s) => season(s).work.creditedUnits >= 2, 8, 'two credited units')
    expect(season(at).work.creditedUnits).toBe(2)
    const disclosed = titleSaleOutcome(at, sellPlan(value))
    if (disclosed.kind !== 'outcome') throw new Error(`premise: ${disclosed.refusal}`)
    const s = disclosed.seasons[0]!
    expect(s.after.creditedUnits).toBe(3)
    expect(s.after.earned).toBeGreaterThan(s.before.earned)
    expect(s.after.cancellation).toEqual({ week: at.market.tick + 2, cause: 'rights' })
    expect(s.after.settlement!.refundDue).toBe(s.before.received - s.after.earned)
    expect(seasonFacts(realSell(at, value).reached)).toEqual(s.after)
  }, 60_000)

  it('at eleven credited units the season delivers at the boundary; the sale cannot cancel it and the disclosure says so', () => {
    const at = tickUntil(live, (s) => season(s).work.creditedUnits >= 11, 40, 'eleven credited units')
    expect(season(at).work.creditedUnits).toBe(11)
    const disclosed = titleSaleOutcome(at, sellPlan(value))
    if (disclosed.kind !== 'outcome') throw new Error(`premise: ${disclosed.refusal}`)
    const s = disclosed.seasons[0]!
    expect(s.after.status).toBe('delivered')
    expect(s.after.deliveredWeek).toBe(at.market.tick + 1)
    expect(s.after.cancellation).toBeNull()
    expect(seasonFacts(realSell(at, value).reached)).toEqual(s.after)
  }, 120_000)

  it('on the eve of the final week a starved season meets its own deadline before the title moves: the disclosure blames the deadline, not the sale', () => {
    const starved = withCash(live, 0)
    const eve = tickUntil(starved, (s) => s.market.tick >= season(s).finalWeek - 1, 24, 'the eve of the final week')
    expect(season(eve).status).toBe('live')
    const disclosed = titleSaleOutcome(eve, sellPlan(value))
    if (disclosed.kind !== 'outcome') throw new Error(`premise: ${disclosed.refusal}`)
    const s = disclosed.seasons[0]!
    expect(s.after.cancellation).toEqual({ week: season(eve).finalWeek, cause: 'deadline' })
    expect(seasonFacts(realSell(eve, value).reached)).toEqual(s.after)
  }, 60_000)

  it('a price above the rival\'s bid is declined at the boundary with the core\'s reason; the season is untouched', () => {
    const disclosed = titleSaleOutcome(live, sellPlan(value + 1_000))
    if (disclosed.kind !== 'outcome') throw new Error(`premise: ${disclosed.refusal}`)
    expect(disclosed.answer).toMatchObject({ kind: 'rejected', week: live.market.tick + 1 })
    expect((disclosed.answer as { reason: string }).reason).toMatch(/^notWilling:priceAboveBid:\d+$/)
    expect(disclosed.seasons[0]!.after.status).toBe('live')
    expect(disclosed.seasons[0]!.after.cancellation).toBeNull()
    const { answered } = realSell(live, value + 1_000)
    expect(playerHolds(answered, subject)).toBe(true)
    expect(seasonFacts(answered)).toEqual(disclosed.seasons[0]!.after)
  }, 60_000)

  it('accepting a rival\'s open buy offer closes now: the season cancels at the next boundary', () => {
    const week = live.market.tick
    const offered = makeOffer(live, { offerorId: rival, counterpartyId: player(live), direction: 'buy', instrument: { kind: 'title', subject }, price: value }, week, STABLE)
    const disclosed = titleSaleOutcome(offered.state, { kind: 'accept', offerId: offered.offer.id })
    if (disclosed.kind !== 'outcome') throw new Error(`premise: ${disclosed.refusal}`)
    expect(disclosed.answer).toEqual({ kind: 'closed', week, price: value })
    expect(disclosed.seasons[0]!.after.cancellation).toEqual({ week: week + 1, cause: 'rights' })
    const real = tick(applyActions(offered.state, [{ kind: 'acceptRightsOffer', offerId: offered.offer.id }]))
    expect(seasonFacts(real)).toEqual(disclosed.seasons[0]!.after)
  }, 60_000)

  it('a refused plan is reported with the core\'s own refusal; a title without a live season has no season consequence', () => {
    const refused = titleSaleOutcome(live, { kind: 'offer', offer: { counterpartyId: 'studio-nobody', direction: 'sell', instrument: { kind: 'title', subject }, price: 0 } })
    expect(refused).toMatchObject({ kind: 'refused', refusal: expect.stringContaining('unknownStudio') })
    expect(() => titleSaleOutcome(live, { kind: 'offer', offer: { counterpartyId: rival, direction: 'sell', instrument: { kind: 'title', subject: { right: 'R2', filmId: 'no-such-film' } }, price: 0 } }))
      .not.toThrow()
    const other = titleSaleOutcome(live, { kind: 'offer', offer: { counterpartyId: rival, direction: 'sell', instrument: { kind: 'title', subject: { right: 'R2', filmId: 'no-such-film' } }, price: 0 } })
    expect(other.kind === 'refused' || other.seasons.length === 0).toBe(true)
  }, 60_000)
})
