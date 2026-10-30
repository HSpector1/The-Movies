// ASTRA Sprint 27 (projection 71): the Rights desk and the estates on the real Bridge, against their core counterparts.
// RED at 6ddeeb00 by assertion: there the closed quote parser has no `quoteEstateBid` or `quoteRightsOffer` type and the
// closed Industry parser has no `rights` or `estates` view, so each case's first assertion on those fails. Every figure,
// refusal and consequence asserted here is the core's own, read beside the Bridge from the same state (rightsDeskView,
// estateBidRefusal, saleOfferRefusal, titleSaleOutcome, the core actions), never a number of this test's making.
//
// Worlds: the actual R04 closure (tests/helpers/p16-actual-estate.ts, the genuine r04-pre162 capture ticked once to its
// closure at week 163, estate window 163 to 176) for the estates; the natural P18 season route (tests/helpers/
// p18-season-world.ts, built once per file) with its commissioned season for the title sale and the decision B disclosure.
// The one disclosed device is a rival's offer made to the player through the core's own `makeOffer` (rivals never initiate
// offers in play), the same device tests/astra18-rights-desk.test.ts uses for the acceptance path.
import { beforeAll, describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { makeOffer, type PlayerOfferInput } from '../src/core/assetSale.js'
import { estateBidRefusal } from '../src/core/estate.js'
import { permittedBidderRefusal, spendableCash } from '../src/core/rightsFinance.js'
import { playerHolds, rightsDeskView, saleOfferRefusal, titleSaleOutcome, titleSaleOutcomeDigest, type TitleSalePlan } from '../src/core/rightsDesk.js'
import type { RightSubject } from '../src/core/rights.js'
import { tick } from '../src/core/tick.js'
import { tvView } from '../src/core/tvView.js'
import type { GameState } from '../src/core/types.js'
import { BRIDGE_SCHEMA, PROTOCOL_VERSION, SCHEMA_ID, validateIndustry, validateQuote } from '../bridge/protocol.ts'
import { rightsOfferDraftApply } from '../bridge/rightsDesk.ts'
import type { BridgeEstateBidDraftPayload, BridgeRightsOfferDraftPayload } from '../bridge/schema/bridge-schema.ts'
import type { EstatesPage, IndustryQuery, RightsPage } from '../bridge/schema/industry-schema.ts'
import { parseWireValue } from '../bridge/schema/runtime.ts'
import { BridgeSession } from '../bridge/session.ts'
import { actualEstateClosure } from './helpers/p16-actual-estate.js'
import { STABLE } from './helpers/p16-fixtures.js'
import { commissioned, player, season } from './helpers/p18-route.js'
import { buildSeasonWorld, type SeasonRoute } from './helpers/p18-season-world.js'

const envelope = (session: BridgeSession, commandId: string) => ({ protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId: session.sessionId, commandId, expectedStateRevision: session.stateRevision })
const command = (session: BridgeSession, commandId: string, intentId: string) => session.command({ ...envelope(session, commandId), type: 'submitIntent', payload: { intentId } })

function quoteBid(session: BridgeSession, commandId: string, draft: BridgeEstateBidDraftPayload) {
  const parsed = validateQuote({ ...envelope(session, commandId), type: 'quoteEstateBid', draft })
  expect(parsed, 'the closed quote parser admits quoteEstateBid').toMatchObject({ ok: true })
  if (!parsed.ok) throw new Error('unreachable after the assertion above')
  const response = session.quote(parsed.quote)
  expect(response).toMatchObject({ accepted: true })
  if (!response.accepted || response.quote.kind !== 'submitEstateBid') throw new Error('unreachable after the assertion above')
  expect(parseWireValue(BRIDGE_SCHEMA.$defs.StudioBridgeQuoteResponse, response)).toEqual(response)
  return response.quote
}
function quoteOffer(session: BridgeSession, commandId: string, draft: BridgeRightsOfferDraftPayload) {
  const parsed = validateQuote({ ...envelope(session, commandId), type: 'quoteRightsOffer', draft })
  expect(parsed, 'the closed quote parser admits quoteRightsOffer').toMatchObject({ ok: true })
  if (!parsed.ok) throw new Error('unreachable after the assertion above')
  const response = session.quote(parsed.quote)
  expect(response).toMatchObject({ accepted: true })
  if (!response.accepted || (response.quote.kind !== 'makeRightsOffer' && response.quote.kind !== 'acceptRightsOffer')) throw new Error('unreachable after the assertion above')
  expect(parseWireValue(BRIDGE_SCHEMA.$defs.StudioBridgeQuoteResponse, response)).toEqual(response)
  return response.quote
}
function view<K extends 'rights' | 'estates'>(session: BridgeSession, kind: K, requestId: string): K extends 'rights' ? RightsPage : EstatesPage {
  const parsed = validateIndustry({ protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId: session.sessionId, requestId, expectedStateRevision: session.stateRevision,
    type: 'industryQuery', view: kind, targetId: null, page: 0, pageSize: 50, lane: 'recent', period: 'all' } as IndustryQuery)
  expect(parsed, `the closed Industry parser admits the ${kind} view`).toMatchObject({ ok: true })
  if (!parsed.ok) throw new Error('unreachable after the assertion above')
  const result = session.industry(parsed.request)
  expect(result).toHaveProperty(kind)
  expect(parseWireValue(BRIDGE_SCHEMA.$defs.StudioIndustryResponse, result)).toEqual(result)
  const page = (result as unknown as Record<K, unknown>)[kind]
  expect(page).not.toBeNull()
  return page as K extends 'rights' ? RightsPage : EstatesPage
}
const offered = (session: BridgeSession, kind: string) => session.snapshot().availableIntents.filter((intent) => intent.kind === kind)

// ── A. the estates: the actual R04 closure ───────────────────────────────────────────────────────────────────────

describe('ASTRA Sprint 27 — the estates on the Bridge (the actual R04 closure, estate window 163 to 176)', () => {
  let opened: GameState
  let estateId: string
  let lotId: string
  let minimumBid: number
  let me: string
  beforeAll(() => {
    const actual = actualEstateClosure()
    opened = actual.state
    estateId = actual.estate.estateId
    lotId = actual.estate.lots[0]!.lotId
    minimumBid = actual.estate.lots[0]!.minimumBid
    me = opened.hollywood!.playerStudioId
    if (estateBidRefusal(opened, { estateId, lotId, bidderId: me, amount: minimumBid }, opened.market.tick) !== null) throw new Error('premise: the player may bid at the minimum at the opening week')
  }, 120_000)

  it('the estates view lists the open estate, every lot at its minimum with the core\'s bid law and no sealed bid, and no closed estate yet', () => {
    const session = new BridgeSession(opened, 's27-estates-open')
    const page = view(session, 'estates', 's27-estates-open-page')
    const desk = rightsDeskView(opened)
    expect(page).toMatchObject({ week: 163, permitted: desk.permitted, spendable: desk.spendable, reserve: desk.reserve })
    expect(page.estates).toHaveLength(1)
    const estate = page.estates[0]!
    expect(estate).toMatchObject({ estateId, studioId: 'studio-aca408ec-r04', closureWeek: 163, opensWeek: 163, closesWeek: 176, closedWeek: null, claims: [] })
    expect(estate.lots).toHaveLength(desk.estates[0]!.lots.length)
    for (const [index, lot] of estate.lots.entries()) {
      const core = desk.estates[0]!.lots[index]!
      expect(lot).toMatchObject({ lotId: core.lotId, minimumBid: core.minimumBid, status: 'open', myBid: null, bidRefusal: core.bidRefusal, sale: null, encumbrances: core.encumbrances })
      expect(lot.subjects.map((s) => s.title)).toEqual(core.titles)
      expect(lot.subjects.map((s) => s.subject)).toEqual(core.subjects)
    }
    expect(estate.lots[0]).toMatchObject({ lotId, minimumBid, bidRefusal: null })
    expect(estate.lots[0]!.subjects[0]!.title).toBe('Portrait of a Meridian')
  })

  it('quoteEstateBid refuses by the core\'s own token (below the minimum, an unknown lot, an unknown estate) and registers no commit', () => {
    const session = new BridgeSession(opened, 's27-bid-refusals')
    const low = quoteBid(session, 's27-bid-low', { estateId, lotId, amount: minimumBid - 1 })
    expect(low).toMatchObject({ ok: false, startsNow: false, refusalReason: 'belowMinimumBid', minimumBid, closesWeek: 176, spendableAfter: null, quotedAtWeek: 163 })
    expect(low.refusalReason).toBe(estateBidRefusal(opened, { estateId, lotId, bidderId: me, amount: minimumBid - 1 }, 163))
    expect(quoteBid(session, 's27-bid-lot', { estateId, lotId: 'no-such-lot', amount: minimumBid })).toMatchObject({ ok: false, refusalReason: 'unknownLot', minimumBid: null })
    expect(quoteBid(session, 's27-bid-estate', { estateId: 'no-such-estate', lotId, amount: minimumBid })).toMatchObject({ ok: false, refusalReason: 'unknownEstate', closesWeek: null })
    expect(command(session, 's27-bid-refused-commit', low.intentId)).toMatchObject({ accepted: false })
    expect(session.gameState).toBe(opened)
  })

  it('a lawful quote reads the reservation from the core\'s own successor and commits the sealed bid exactly as the core action; a second bid on the lot is a duplicate', () => {
    const session = new BridgeSession(opened, 's27-bid-commit')
    const quote = quoteBid(session, 's27-bid-quote', { estateId, lotId, amount: minimumBid })
    const core = applyActions(opened, [{ kind: 'submitEstateBid', estateId, lotId, amount: minimumBid }])
    expect(quote).toMatchObject({ ok: true, startsNow: true, queues: false, refusalReason: null, estateId, lotId, amount: minimumBid, minimumBid, closesWeek: 176,
      spendableBefore: spendableCash(opened, me), spendableAfter: spendableCash(core, me) })
    expect(quote.spendableAfter!).toBeLessThan(quote.spendableBefore)
    expect(offered(session, 'submitEstateBid'), 'a quote-minted commit is never a listed one-click intent').toEqual([])
    expect(command(session, 's27-bid-commit-1', quote.intentId)).toMatchObject({ accepted: true })
    expect(session.gameState.rights.estates).toEqual(core.rights.estates)
    expect(session.gameState.studio.cash).toBe(core.studio.cash)
    const page = view(session, 'estates', 's27-estates-bid-page')
    expect(page.estates[0]!.lots[0]!.myBid).toMatchObject({ amount: minimumBid, week: 163, status: 'sealed', disqualification: null })
    expect(page.estates[0]!.lots[0]!.bidRefusal, 'the desk reads the bid law for a lot the player already bid on').toBe(rightsDeskView(core).estates[0]!.lots[0]!.bidRefusal)
    expect(quoteBid(session, 's27-bid-again', { estateId, lotId, amount: minimumBid })).toMatchObject({ ok: false, refusalReason: 'duplicateBid' })
    expect(command(session, 's27-bid-commit-stale', quote.intentId), 'the quote was digest-bound to the state the commit replaced').toMatchObject({ accepted: false })
  })

  it('after the ceremony at D the estates view shows the closed estate\'s disposition: the player\'s lot sold to the player, the rest archived, the bid won, and the closure\'s claims', () => {
    let state = applyActions(opened, [{ kind: 'submitEstateBid', estateId, lotId, amount: minimumBid }])
    for (let week = state.market.tick; week < 176; week++) state = tick(state)
    expect(state.market.tick).toBe(176)
    const session = new BridgeSession(state, 's27-estates-closed')
    const page = view(session, 'estates', 's27-estates-closed-page')
    const desk = rightsDeskView(state).closedEstates
    expect(desk).toHaveLength(1)
    expect(page.estates).toHaveLength(1)
    const estate = page.estates[0]!
    expect(estate).toMatchObject({ estateId, closureWeek: 163, opensWeek: 163, closesWeek: 176, closedWeek: 176 })
    const mine = estate.lots.find((l) => l.lotId === lotId)!
    expect(mine).toMatchObject({ status: 'sold', sale: { amount: minimumBid, buyerId: me }, myBid: { amount: minimumBid, week: 163, status: 'won', disqualification: null }, bidRefusal: null })
    expect(mine.sale!.buyerName).toBe(desk[0]!.lots.find((l) => l.lotId === lotId)!.sale!.buyerName)
    for (const lot of estate.lots.filter((l) => l.lotId !== lotId)) expect(lot).toMatchObject({ status: 'archived', sale: null, myBid: null })
    expect(estate.claims).toEqual(desk[0]!.claims)
    expect(estate.claims.map((c) => c.kind)).toEqual(['employment'])
    expect(estate.claims[0]).toMatchObject({ count: 6 })
    expect(playerHolds(state, state.rights.estates[0]!.lots.find((l) => l.lotId === lotId)!.subjects[0]!)).toBe(true)
    expect(quoteBid(session, 's27-bid-closed', { estateId, lotId, amount: minimumBid })).toMatchObject({ ok: false, refusalReason: 'estateClosed' })
  })
})

// ── B. the Rights desk: the natural season route ─────────────────────────────────────────────────────────────────

describe('ASTRA Sprint 27 — the Rights desk on the Bridge (the natural P18 season route, decision B)', () => {
  let route: SeasonRoute
  let live: GameState
  let C: number
  let me: string
  let rival: string
  let subject: RightSubject
  let value: number
  let seasonId: string
  beforeAll(() => {
    route = buildSeasonWorld()
    live = commissioned(structuredClone(route))
    C = live.market.tick
    me = player(live)
    const candidate = live.hollywood!.businesses.map((b) => b.studioId).filter((id) => id !== me).sort()
      .find((id) => permittedBidderRefusal(live, id, C, STABLE) === null)
    if (candidate === undefined) throw new Error(`premise: no rival P16 permits to buy at week ${C}`)
    rival = candidate
    subject = { right: 'R1', propertyId: route.propertyId }
    const held = rightsDeskView(live).titles.find((t) => t.subject.right === 'R1' && t.subject.propertyId === route.propertyId)
    if (held === undefined || held.value === null) throw new Error('premise: the season property is held and valued')
    value = held.value
    seasonId = season(live).seasonId
    if (saleOfferRefusal(live, rival, subject, value) !== null) throw new Error('premise: the sell offer at the valuation is lawful')
  }, 300_000)

  const sellDraft = (price: number): BridgeRightsOfferDraftPayload => ({ plan: 'offer', counterpartyId: rival, subject: { right: 'R1', propertyId: route.propertyId }, price })
  const sellOffer = (price: number): PlayerOfferInput => ({ counterpartyId: rival, direction: 'sell', instrument: { kind: 'title', subject }, price })
  const sellPlan = (price: number): TitleSalePlan => ({ kind: 'offer', offer: sellOffer(price) })
  const seasonFacts = (state: GameState) => {
    const s = tvView(state).seasons.find((x) => x.seasonId === seasonId)!
    return { status: s.status, cancellation: s.cancellation, deliveredWeek: s.deliveredWeek, creditedUnits: s.creditedUnits, earned: s.agreement.earned, settlement: s.agreement.settlement, outstanding: s.agreement.outstanding }
  }

  it('the rights view lists the held property with the core\'s sale law, valuation, licences and live season, the operating counterparties and no offer', () => {
    const session = new BridgeSession(live, 's27-rights-view')
    const page = view(session, 'rights', 's27-rights-page')
    const desk = rightsDeskView(live)
    expect(page).toMatchObject({ week: C, studioId: me, permitted: desk.permitted, spendable: desk.spendable, reserve: desk.reserve, offers: [] })
    const row = page.titles.find((t) => t.subject.right === 'R1' && t.subject.propertyId === route.propertyId)!
    const core = desk.titles.find((t) => t.subject.right === 'R1' && t.subject.propertyId === route.propertyId)!
    expect(row).toMatchObject({ saleRefusal: null, encumbrance: core.encumbrance, resaleHoldback: core.resaleHoldback, value, liveSeasonIds: [seasonId], title: core.title })
    expect(row.licencesOut.map((l) => l.licenceId)).toEqual(core.licencesOut.map((l) => l.licenceId))
    for (const l of row.licencesOut) expect(l.grantorId).toBe(me)
    expect(page.counterparties.map((c) => c.studioId)).toEqual(desk.counterparties.map((c) => c.studioId))
    expect(page.counterparties.map((c) => c.studioId)).toContain(rival)
    expect(page.licencesIn.map((l) => l.licenceId)).toEqual(desk.licencesIn.map((l) => l.id))
  })

  it('quoteRightsOffer (a sell offer at the valuation): the core\'s willingness, the made offer\'s expiry and the decision B consequence verbatim; the commit makes the offer exactly as the core action and the real advance meets the disclosure', () => {
    const session = new BridgeSession(live, 's27-sell')
    const quote = quoteOffer(session, 's27-sell-quote', sellDraft(value))
    const core = applyActions(live, [{ kind: 'makeRightsOffer', offer: sellOffer(value) }])
    const made = core.rights.offers.find((o) => !live.rights.offers.some((x) => x.id === o.id))!
    const disclosed = titleSaleOutcome(live, sellPlan(value))
    expect(quote).toMatchObject({ ok: true, startsNow: true, kind: 'makeRightsOffer', plan: 'offer', offerId: null, refusalReason: null, quotedAtWeek: C,
      subject: { right: 'R1', propertyId: route.propertyId }, counterpartyId: rival, direction: 'sell', playerSells: true, price: value, value, encumbrance: null, expiresWeek: made.expiresWeek })
    expect(quote.willingness).toMatchObject({ willing: true })
    expect(quote.consequence).not.toBeNull()
    const c = quote.consequence!
    expect(c).toMatchObject({ kind: 'outcome', week: C, refusal: null, answer: { kind: 'closed', week: C + 1, price: value }, reachesWeek: C + 2, digest: titleSaleOutcomeDigest(disclosed) })
    expect(c.seasons).toHaveLength(1)
    expect(c.seasons[0]).toMatchObject({ seasonId, after: { status: 'cancelled', cancellation: { week: C + 2, cause: 'rights' } } })
    expect(c.seasons[0]!.after.creditedUnits, 'the week\'s unit lands before the title moves').toBe(c.seasons[0]!.before.creditedUnits + 1)
    expect(offered(session, 'makeRightsOffer'), 'a quote-minted commit is never a listed one-click intent').toEqual([])
    expect(command(session, 's27-sell-commit', quote.intentId)).toMatchObject({ accepted: true })
    expect(session.gameState.rights.offers).toEqual(core.rights.offers)
    const reached = tick(tick(session.gameState))
    expect(seasonFacts(reached)).toEqual(c.seasons[0]!.after)
    expect(playerHolds(reached, subject)).toBe(false)
    // The made offer is the player's: the view carries its one-gesture withdraw and nothing else.
    const page = view(session, 'rights', 's27-sell-page')
    expect(page.offers).toHaveLength(1)
    expect(page.offers[0]).toMatchObject({ offerId: made.id, role: 'offeror', direction: 'sell', status: 'open', expiresWeek: made.expiresWeek, saleReviewRequired: false, acceptIntent: null, rejectIntent: null })
    expect(page.offers[0]!.withdrawIntent).toMatchObject({ kind: 'withdrawRightsOffer', confirmation: 'none' })
    expect(quoteOffer(session, 's27-sell-dup', sellDraft(value))).toMatchObject({ ok: false, refusalReason: 'duplicateOpenOffer' })
    expect(command(session, 's27-sell-withdraw', page.offers[0]!.withdrawIntent!.intentId)).toMatchObject({ accepted: true })
    expect(session.gameState.rights.offers.find((o) => o.id === made.id)).toMatchObject({ status: 'withdrawn' })
    expect(session.gameState.rights.offers).toEqual(applyActions(core, [{ kind: 'withdrawRightsOffer', offerId: made.id }]).rights.offers)
  })

  it('refusals and freshness: a price above the rival\'s bid is quoted with the limit and a rejected answer, an unknown buyer refuses at the submission law, a refused quote never commits, and a stale disclosure refuses the commit', () => {
    const session = new BridgeSession(live, 's27-sell-refusals')
    const over = quoteOffer(session, 's27-sell-over', sellDraft(value + 1))
    expect(over).toMatchObject({ ok: true, willingness: { willing: false, limit: value }, consequence: { kind: 'outcome', answer: { kind: 'rejected', week: C + 1 } } })
    expect(over.consequence!.seasons[0]!.after.status).toBe('live')
    const unknown = quoteOffer(session, 's27-sell-unknown', { plan: 'offer', counterpartyId: 'studio-nobody', subject: { right: 'R1', propertyId: route.propertyId }, price: value })
    expect(unknown).toMatchObject({ ok: false, startsNow: false, refusalReason: saleOfferRefusal(live, 'studio-nobody', subject, value), consequence: null, willingness: null })
    expect(unknown.refusalReason).toBe('unknownStudio')
    expect(command(session, 's27-sell-unknown-commit', unknown.intentId)).toMatchObject({ accepted: false })
    expect(session.gameState).toBe(live)
    // The disclosed consequence must still be the consequence now: the digest of this week's outcome is refused next week.
    const stale = titleSaleOutcomeDigest(titleSaleOutcome(live, sellPlan(value)))
    expect(rightsOfferDraftApply(tick(live), sellDraft(value), stale)).toMatchObject({ ok: false, error: expect.stringMatching(/season consequences of this sale changed/) })
    expect(rightsOfferDraftApply(live, sellDraft(value), null)).toMatchObject({ ok: false })
    expect(rightsOfferDraftApply(live, sellDraft(value), stale)).toMatchObject({ ok: true })
  })

  it('a rival\'s buy offer on the held title: no one-gesture accept (the disclosure is owed), a one-gesture reject; the quoted acceptance closes now with the consequence and commits as the core action', () => {
    const { state: offeredState, offer } = makeOffer(live, { offerorId: rival, counterpartyId: me, direction: 'buy', instrument: { kind: 'title', subject }, price: value }, C, STABLE)
    const session = new BridgeSession(offeredState, 's27-accept')
    const page = view(session, 'rights', 's27-accept-page')
    const row = page.offers.find((o) => o.offerId === offer.id)!
    expect(row).toMatchObject({ role: 'counterparty', direction: 'buy', status: 'open', price: value, saleReviewRequired: true, acceptIntent: null, withdrawIntent: null, closing: null })
    expect(row.rejectIntent).toMatchObject({ kind: 'rejectRightsOffer', confirmation: 'none' })
    expect(offered(session, 'acceptRightsOffer')).toEqual([])
    const quote = quoteOffer(session, 's27-accept-quote', { plan: 'accept', offerId: offer.id })
    const disclosed = titleSaleOutcome(offeredState, { kind: 'accept', offerId: offer.id })
    expect(quote).toMatchObject({ ok: true, kind: 'acceptRightsOffer', plan: 'accept', offerId: offer.id, counterpartyId: rival, direction: 'buy', playerSells: true, price: value, value, expiresWeek: null, willingness: null,
      consequence: { kind: 'outcome', answer: { kind: 'closed', week: C, price: value }, reachesWeek: C + 1, digest: titleSaleOutcomeDigest(disclosed) } })
    expect(quote.consequence!.seasons[0]).toMatchObject({ seasonId, after: { status: 'cancelled', cancellation: { week: C + 1, cause: 'rights' } } })
    const core = applyActions(offeredState, [{ kind: 'acceptRightsOffer', offerId: offer.id }])
    expect(command(session, 's27-accept-commit', quote.intentId)).toMatchObject({ accepted: true })
    expect(session.gameState.rights.offers).toEqual(core.rights.offers)
    expect(session.gameState.rights.transactions).toEqual(core.rights.transactions)
    expect(session.gameState.studio.cash).toBe(core.studio.cash)
    expect(playerHolds(session.gameState, subject)).toBe(false)
    expect(seasonFacts(tick(session.gameState))).toEqual(quote.consequence!.seasons[0]!.after)
    // The one-gesture reject on a fresh session of the same offer.
    const rejecting = new BridgeSession(offeredState, 's27-reject')
    const reject = view(rejecting, 'rights', 's27-reject-page').offers.find((o) => o.offerId === offer.id)!.rejectIntent!
    expect(command(rejecting, 's27-reject-commit', reject.intentId)).toMatchObject({ accepted: true })
    expect(rejecting.gameState.rights.offers).toEqual(applyActions(offeredState, [{ kind: 'rejectRightsOffer', offerId: offer.id }]).rights.offers)
    expect(view(rejecting, 'rights', 's27-reject-after').offers.find((o) => o.offerId === offer.id)).toMatchObject({ status: 'rejected', refusal: 'rejectedByCounterparty', acceptIntent: null, rejectIntent: null, withdrawIntent: null })
  })

  it('a rival\'s sell offer to the player (a purchase): a one-gesture accept marked confirmation=required that closes exactly as the core action; the title passes and the cash moves', () => {
    const film = live.hollywood!.films.find((f) => f.studioId === rival && f.provenance === 'simulation/v1' && f.settledWeek !== null)
    if (film === undefined) throw new Error(`premise: the rival ${rival} holds a settled film title at week ${C}`)
    const bought: RightSubject = { right: 'R2', filmId: film.filmId }
    const { state: offeredState, offer } = makeOffer(live, { offerorId: rival, counterpartyId: me, direction: 'sell', instrument: { kind: 'title', subject: bought }, price: 100_000 }, C, STABLE)
    const session = new BridgeSession(offeredState, 's27-purchase')
    const row = view(session, 'rights', 's27-purchase-page').offers.find((o) => o.offerId === offer.id)!
    expect(row).toMatchObject({ role: 'counterparty', direction: 'sell', saleReviewRequired: false, closing: null, withdrawIntent: null })
    expect(row.acceptIntent).toMatchObject({ kind: 'acceptRightsOffer', confirmation: 'required' })
    expect(row.rejectIntent).toMatchObject({ kind: 'rejectRightsOffer', confirmation: 'none' })
    expect(offered(session, 'acceptRightsOffer').map((i) => i.intentId)).toContain(row.acceptIntent!.intentId)
    // The quoted path answers the same acceptance without a consequence (the player buys; no held title moves).
    expect(quoteOffer(session, 's27-purchase-quote', { plan: 'accept', offerId: offer.id })).toMatchObject({ ok: true, playerSells: false, consequence: null, direction: 'sell', price: 100_000 })
    const core = applyActions(offeredState, [{ kind: 'acceptRightsOffer', offerId: offer.id }])
    expect(command(session, 's27-purchase-commit', row.acceptIntent!.intentId)).toMatchObject({ accepted: true })
    expect(session.gameState.rights).toEqual(core.rights)
    expect(session.gameState.studio.cash).toBe(offeredState.studio.cash - 100_000)
    expect(playerHolds(session.gameState, bought)).toBe(true)
  })
})
