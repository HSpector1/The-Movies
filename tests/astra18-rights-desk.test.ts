// ASTRA Sprint 18 (Owner decision B): the rights desk read model and the title-sale consequence disclosure.
// Built on the natural P18 season route the Sprint 14 witnesses measure (tests/helpers/p18-season-world.ts); the sale is
// the s14 W3 sale (tests/helpers/p17-route.ts sellTitle). The disclosure is checked AGAINST the outcome the engine then
// produces: the season named, the boundary, the cause, the refund and the charge.
import { beforeAll, describe, expect, it } from 'vitest'
import { permittedBidderRefusal } from '../src/core/rightsFinance.js'
import { playerHolds, rightsDeskView, saleOfferRefusal, titleSaleConsequences, titleSaleConsequencesDigest } from '../src/core/rightsDesk.js'
import { makeSave } from '../src/core/save.js'
import { tick } from '../src/core/tick.js'
import type { GameState } from '../src/core/types.js'
import type { RightSubject } from '../src/core/rights.js'
import { STABLE } from './helpers/p16-fixtures.js'
import { sellTitle } from './helpers/p17-route.js'
import { agreement, commissioned, player, season, tickUntil } from './helpers/p18-route.js'
import { buildSeasonWorld, type SeasonRoute } from './helpers/p18-season-world.js'

let route: SeasonRoute
let atSale: GameState
let rival: string
let subject: RightSubject
beforeAll(() => {
  route = buildSeasonWorld()
  atSale = tickUntil(commissioned(structuredClone(route)), (s) => season(s).work.block !== 'scripts', 20, 'the end of the scripts block')
  const week = atSale.market.tick
  const live = atSale.hollywood!.identities.find((i) => i.studioId !== player(atSale) && i.enteredWeek !== null && permittedBidderRefusal(atSale, i.studioId, week, STABLE) === null)
  if (live === undefined) throw new Error(`premise: no rival P16 permits to buy at week ${week}`)
  rival = live.studioId
  subject = { right: 'R1', propertyId: route.propertyId }
}, 240_000)

describe('rightsDeskView: what the player holds, may do and is offered, read by the core\'s own laws', () => {
  it('lists the season\'s property as held, names the live season on it, and prices the player\'s standing', () => {
    const view = rightsDeskView(atSale)
    expect(view.week).toBe(atSale.market.tick)
    expect(view.studioId).toBe(player(atSale))
    const held = view.titles.find((t) => t.subject.right === 'R1' && t.subject.propertyId === route.propertyId)
    expect(held, 'the season\'s property is the player\'s').toBeDefined()
    expect(held!.liveSeasonIds).toEqual([season(atSale).seasonId])
    expect(held!.saleRefusal).toBeNull()
    expect(held!.encumbrance).toBeNull()
    expect(view.diligenceFee).toBe(50_000)
    expect(view.reserve).toBeGreaterThan(0)
    expect(view.offers).toEqual([])
    expect(view.estates).toEqual([])
    const counterparty = view.counterparties.find((c) => c.studioId === rival)
    expect(counterparty, 'the permitted buyer is listed').toBeDefined()
    expect(counterparty!.name.length).toBeGreaterThan(0)
    expect(counterparty!.disclosures).toEqual([])
    // Each counterparty's refusals are the core's own strings or null; never invented here.
    for (const c of view.counterparties) {
      expect(c.diligence === null || typeof c.diligence === 'string').toBe(true)
      expect(c.absorption === null || typeof c.absorption === 'string').toBe(true)
    }
    expect(playerHolds(atSale, subject)).toBe(true)
    expect(saleOfferRefusal(atSale, rival, subject, 1_000)).toBeNull()
    expect(saleOfferRefusal(atSale, 'studio-nobody', subject, 1_000)).toBe('unknownStudio')
  })
})

describe('titleSaleConsequences: the disclosed cancellation equals the one the engine writes (contract §7, decision B)', () => {
  it('names the live season, the next boundary, cause rights, the refund and the charge, and the outcome matches', () => {
    const week = atSale.market.tick
    const disclosed = titleSaleConsequences(atSale, subject)
    expect(disclosed.closingWeek).toBe(week)
    expect(disclosed.continues).toEqual([])
    expect(disclosed.cancels).toHaveLength(1)
    const c = disclosed.cancels[0]!
    expect(c.season.seasonId).toBe(season(atSale).seasonId)
    expect(c.cancelsAtWeek).toBe(week + 1)
    expect(c.cause).toBe('rights')
    const a = agreement(atSale)
    expect(c.season.cancelPreview).not.toBeNull()
    expect(c.season.cancelPreview!.refundDue).toBe(a.received - a.earned)
    expect(c.season.cancelPreview!.chargeDue).toBe(a.terms.cancellationCharge)
    expect(c.season.agreement.earned).toBe(a.earned)
    // The engine's own outcome after the s14 W3 sale and one advance.
    const sold = sellTitle(atSale, route.propertyId, rival)
    expect(playerHolds(sold, subject)).toBe(false)
    const end = tick(sold)
    const s = season(end)
    expect(s.status).toBe('cancelled')
    expect(s.cancellation).toEqual({ week: c.cancelsAtWeek, cause: c.cause })
    expect(agreement(end).settlement).toMatchObject({ week: c.cancelsAtWeek, refundDue: c.season.cancelPreview!.refundDue, chargeDue: c.season.cancelPreview!.chargeDue })
    expect(agreement(end).earned, 'earned fees stay').toBe(a.earned)
    expect(() => makeSave(end)).not.toThrow()
    // The digest a confirmation carries changes once the consequences differ (here: the season is no longer live).
    expect(titleSaleConsequencesDigest(titleSaleConsequences(atSale, subject))).toBe(titleSaleConsequencesDigest(disclosed))
    expect(titleSaleConsequencesDigest(titleSaleConsequences(end, subject))).not.toBe(titleSaleConsequencesDigest(disclosed))
    expect(titleSaleConsequences(end, subject).cancels).toEqual([])
  }, 60_000)

  it('a sale at the final boundary would be the deadline\'s; a film title or a property without a live season discloses nothing', () => {
    const s = season(atSale)
    const atFinal = titleSaleConsequences(atSale, subject, s.finalWeek - 1)
    expect(atFinal.cancels[0]).toMatchObject({ cancelsAtWeek: s.finalWeek, cause: 'deadline' })
    expect(titleSaleConsequences(atSale, { right: 'R2', filmId: 'no-such-film' }).cancels).toEqual([])
    expect(titleSaleConsequences(atSale, { right: 'R1', propertyId: 'story-property:no-such-property' }).cancels).toEqual([])
  })
})
