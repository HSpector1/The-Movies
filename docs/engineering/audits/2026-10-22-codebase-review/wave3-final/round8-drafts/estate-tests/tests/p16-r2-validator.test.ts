// ── P16 r2 REDs: the Save46 rights validator admits no forged money, backdate or broken chain; valuation never partial ──
//
// Review r1 majors F9/F31 (every P16 money row reconciles against a transaction that CARRIES its effect: lawful kind,
// a producer that exists, sign, payee, its offer/title event/licence/lot/record — contract §7 S/M, 1362-O "malformed
// state refused"), F43 + minor F15 (a persisted property's date is bounded by its own greenlight evidence; a
// consistent backdate refuses), F45 + minor F16 (the chain-continuity rule, isolated from the unknown-holder rule),
// F12 (valuation returns explicit unavailable, never a partial total: P16A r3), F51 (the unsafe-sum refusal: P16A r3
// A1); minors F58 (three validator rules), F53 (the boundary week), F65 (a missing title is null, never '').

import { describe, expect, it } from 'vitest'
import { actualEstateClosure } from './helpers/p16-actual-estate.js'
import { applyActions } from '../src/core/actions.js'
import * as estate from '../src/core/estate.js'
import * as sale from '../src/core/assetSale.js'
import { libraryValuationV1 } from '../src/core/propertyValuation.js'
import * as rights from '../src/core/rights.js'
import { convertV48ToV49, makeSave, stableStringify, validateSaveV49 } from '../src/core/save.js'
import { tick } from '../src/core/tick.js'
import { TUNING } from '../src/core/tuning.js'
import type { GameState } from '../src/core/types.js'
import { detached, genuinePredecessorEnvelope, greenlightPayload, liveFromGenuine, mintRoute, STABLE } from './helpers/p16-fixtures.js'

type Save = ReturnType<typeof makeSave>

function world() {
  const state = liveFromGenuine('week53')
  const h = state.hollywood!
  const [player, r01, r02, r03] = [h.playerStudioId, ...h.identities.slice(1, 4).map((i) => i.studioId)] as [string, string, string, string]
  const week = state.market.tick
  const settled = (studioId: string) => h.films.find((f) => f.studioId === studioId && f.provenance === 'simulation/v1' && f.settledWeek !== null)!
  return { state, h, player, r01, r02, r03, week, settled }
}

/** The player buys r01's settled film through the lawful bilateral path: one closed titleSale. */
function soldSave(): { save: Save; price: number; r01: string; player: string; week: number } {
  const { state, player, r01, week, settled } = world()
  const subject = { right: 'R2' as const, filmId: settled(r01).filmId }
  const price = 123_456
  const { state: offered, offer } = sale.makeOffer(state, { offerorId: r01, counterpartyId: player, direction: 'sell', instrument: { kind: 'title', subject }, price }, week, STABLE)
  return { save: makeSave(sale.acceptOffer(offered, offer.id, player, week, STABLE)), price, r01, player, week }
}

const rivalPeriod = (save: Save, studioId: string) => {
  const account = save.state.hollywood!.businesses.find((b) => b.studioId === studioId)!.account
  return { account, period: account.periods[account.periods.length - 1]! }
}
const blankTx = (id: string, week: number) => ({ id, week, payeeId: null, estateId: null, subject: null, licenceId: null, offerId: null, lotId: null, bidId: null, titleEventIds: [] as string[] })

describe('r2 F9/F31: no P16 money without the transaction that carries its effect', () => {
  it('the control: a lawful closed title sale validates', () => {
    expect(() => validateSaveV49(soldSave().save)).not.toThrow()
  })

  it('refuses an absorption transaction (no producer exists in this checkpoint) even with consistent cash', () => {
    const { save, player, week } = soldSave()
    const forged = detached(save)
    const id = `rights-tx-${forged.state.rights.nextId}`
    forged.state.rights.nextId += 1
    forged.state.rights.transactions.push({ ...blankTx(id, week), kind: 'absorption' as never, payerId: player, amount: -1_000_000 })
    forged.state.ledger.push({ week, kind: 'acquisitionOutlay', amount: 1_000_000, note: id })
    forged.state.studio.cash += 1_000_000
    expect(() => validateSaveV49(forged)).toThrow(/transactions\[\d+\].*kind/)
  })

  it('refuses an unknown transaction kind', () => {
    const { save, player, week } = soldSave()
    const forged = detached(save)
    const id = `rights-tx-${forged.state.rights.nextId}`
    forged.state.rights.nextId += 1
    forged.state.rights.transactions.push({ ...blankTx(id, week), kind: 'gift' as never, payerId: player, amount: 0 })
    expect(() => validateSaveV49(forged)).toThrow(/transactions\[\d+\].*kind/)
  })

  it('refuses a title sale that moved no title and names no accepted offer, though its cash reconciles', () => {
    const { save, player, r01, week } = soldSave()
    const forged = detached(save)
    const id = `rights-tx-${forged.state.rights.nextId}`
    forged.state.rights.nextId += 1
    const film = forged.state.hollywood!.films.find((f) => f.studioId === r01 && f.provenance === 'simulation/v1' && f.settledWeek !== null && !forged.state.rights.filmTitles.some((t) => t.filmId === f.filmId))!
    forged.state.rights.transactions.push({ ...blankTx(id, week), kind: 'titleSale', payerId: player, payeeId: r01, amount: 1_000_000, subject: { right: 'R2', filmId: film.filmId } })
    forged.state.ledger.push({ week, kind: 'rightsConsideration', amount: -1_000_000, note: id })
    forged.state.studio.cash -= 1_000_000
    const { account, period } = rivalPeriod(forged, r01)
    period.movements.rightsConsideration += 1_000_000; period.closing += 1_000_000; account.cash += 1_000_000
    expect(() => validateSaveV49(forged)).toThrow(/transactions\[\d+\].*(offer|title event)/)
  })

  it('refuses a real title sale whose payee was erased and whose seller credit was removed', () => {
    const { save, price, r01 } = soldSave()
    const forged = detached(save)
    forged.state.rights.transactions[0]!.payeeId = null
    const { account, period } = rivalPeriod(forged, r01)
    period.movements.rightsConsideration -= price; period.closing -= price; account.cash -= price
    expect(() => validateSaveV49(forged)).toThrow(/transactions\[0\].*payee/)
  })

  it('refuses a licence grant transaction with no licence, and a diligence fee with no disclosure record', () => {
    const { save, player, r01, week } = soldSave()
    const licenceTx = detached(save)
    const id = `rights-tx-${licenceTx.state.rights.nextId}`
    licenceTx.state.rights.nextId += 1
    licenceTx.state.rights.transactions.push({ ...blankTx(id, week), kind: 'licenceGrant', payerId: player, payeeId: r01, amount: 0 })
    expect(() => validateSaveV49(licenceTx)).toThrow(/transactions\[\d+\].*licence/)
    const feeTx = detached(save)
    const fee = `rights-tx-${feeTx.state.rights.nextId}`
    feeTx.state.rights.nextId += 1
    feeTx.state.rights.transactions.push({ ...blankTx(fee, week), kind: 'dueDiligence', payerId: player, amount: TUNING.RIGHTS_DUE_DILIGENCE_FEE })
    feeTx.state.ledger.push({ week, kind: 'dueDiligenceFee', amount: -TUNING.RIGHTS_DUE_DILIGENCE_FEE, note: fee })
    feeTx.state.studio.cash -= TUNING.RIGHTS_DUE_DILIGENCE_FEE
    expect(() => validateSaveV49(feeTx)).toThrow(/transactions\[\d+\].*disclosure record/)
  })
})

describe('r2 F43/F15: a persisted property\'s date is its own greenlight evidence, never earlier', () => {
  function materialized(): Save {
    const base = convertV48ToV49(genuinePredecessorEnvelope('week53'))
    const f = base.state.hollywood!.films.find((x) => x.provenance === 'simulation/v1')!
    let state = rights.materializeLegacyTitles(base.state as GameState, { right: 'R2', filmId: f.filmId })
    state = rights.materializeLegacyTitles(state, { right: 'R1', propertyId: rights.storyPropertyId(f.conceptId) })
    return { ...base, state } as Save
  }

  it('a property and its genesis backdated together (to before the campaign, or to week 0) refuse as ambiguous provenance', () => {
    for (const date of [{ kind: 'beforeCampaign' as const, year: 1901 }, { kind: 'campaign' as const, week: 0 }]) {
      const forged = detached(materialized())
      const property = forged.state.rights.properties[0]!
      property.createdAt = date
      forged.state.rights.titleEvents.find((e) => e.subject.right === 'R1')!.date = date
      expect(() => validateSaveV49(forged), JSON.stringify(date)).toThrow(/properties\[0\].*ambiguous provenance/)
    }
  })

  it('the lawful earlier date survives: a property first greenlit by a production later cancelled keeps that week', () => {
    const route = mintRoute()
    const cancelled = applyActions(route.greenlit, [{ kind: 'cancel', productionId: route.productionId }])
    let s = tick(tick(cancelled))
    const concept = s.concepts.find((c) => c.id === route.conceptId)!
    s = applyActions(s, [{ kind: 'greenlight', production: greenlightPayload(s, concept) }])
    const property = s.rights.properties.find((p) => p.propertyId === rights.storyPropertyId(route.conceptId))!
    expect(property.createdAt).toEqual({ kind: 'campaign', week: 0 })
    expect(property.workLinks).toHaveLength(2)
    expect(() => makeSave(s)).not.toThrow()
    // ... and a forged later date for the same record refuses: the evidence fixes it exactly.
    const forged = detached(makeSave(s))
    forged.state.rights.properties.find((p) => p.propertyId === property.propertyId)!.createdAt = { kind: 'campaign', week: 1 }
    forged.state.rights.titleEvents.find((e) => e.subject.right === 'R1' && e.subject.propertyId === property.propertyId)!.date = { kind: 'campaign', week: 1 }
    expect(() => validateSaveV49(forged)).toThrow(/ambiguous provenance/)
  })
})

describe('r2 F45/F16: chain continuity is refused on its own, with every holder a known identity', () => {
  it('a sale event whose priorHolder is a real studio but not the previous holder breaks continuity', () => {
    const { save, r01, player } = soldSave()
    const forged = detached(save)
    const sale = forged.state.rights.titleEvents.find((e) => e.cause === 'sale')!
    const other = forged.state.hollywood!.identities.find((i) => i.studioId !== r01 && i.studioId !== player)!.studioId
    sale.priorHolder = other
    expect(() => validateSaveV49(forged)).toThrow(new RegExp(`priorHolder ${other} breaks continuity with ${r01}`))
  })
})

describe('r2 F58: the licence-overlap, bid-window and estate-proceeds rules each refuse a forged save', () => {
  const licenceOffer = (state: GameState, grantor: string, grantee: string, subject: { right: 'R1'; propertyId: string }, start: number, end: number, week: number) => {
    const instrument = { kind: 'licence' as const, right: 'R3' as const, subject, scope: { use: 'sequel' as const }, exclusive: true, startWeek: start, endWeekExclusive: end }
    const { state: offered, offer } = sale.makeOffer(state, { offerorId: grantee, counterpartyId: grantor, direction: 'buy', instrument, price: 1_000 }, week, STABLE)
    return sale.acceptOffer(offered, offer.id, grantor, week, STABLE)
  }

  it('two exclusive sequel licences whose terms are edited to overlap refuse', () => {
    const { state, r01, r02, r03, week, settled } = world()
    const P = { right: 'R1' as const, propertyId: rights.storyPropertyId(settled(r01).conceptId) }
    const twice = licenceOffer(licenceOffer(state, r01, r02, P, week, week + 10, week), r01, r03, P, week + 10, week + 20, week)
    const forged = detached(makeSave(twice))
    forged.state.rights.licences[1]!.startWeek = week + 5
    const offer = forged.state.rights.offers.find((o) => o.transactionId === forged.state.rights.licences[1]!.transactionId)!
    if (offer.instrument.kind === 'licence') offer.instrument.startWeek = week + 5
    expect(() => validateSaveV49(forged)).toThrow(/licences\[1\] overlaps exclusive licence/)
  })

  it('a sealed bid dated before its window, and estate proceeds that differ from the estate sales, refuse', () => {
    const { state, estate: opened } = actualEstateClosure()
    let s = state
    // Reuse the fixed 13M public bid from p16-estate-d-ceremony, not an arbitrary below-valuation bid.
    while (s.market.tick < opened.closesWeek - 1) s = tick(s)
    const lot = opened.lots.find(l => l.subjects.length === 1 && l.subjects[0]!.right === 'R2'
      && l.subjects[0]!.filmId === 'studio-aca408ec-r04:film:0')!
    expect(lot).toBeDefined()
    expect(lot.minimumBid).toBeLessThanOrEqual(13_000_000)
    const input = { estateId: opened.estateId, lotId: lot.lotId, bidderId: s.hollywood!.playerStudioId, amount: 13_000_000 }
    expect(estate.estateBidRefusal(s, input, s.market.tick)).toBeNull()
    s = estate.submitEstateBid(s, input, s.market.tick).state
    const baseline = makeSave(s)
    expect(() => validateSaveV49(baseline)).not.toThrow()
    const early = detached(baseline)
    early.state.rights.estates.find(e => e.estateId === opened.estateId)!.bids[0]!.week = opened.opensWeek - 1
    expect(() => validateSaveV49(early)).toThrow(/bids\[0\] admitted only inside/)
    const before = stableStringify(s)
    const closed = estate.resolveEstate(s, opened.estateId, opened.closesWeek)
    expect(stableStringify(s)).toBe(before)
    expect(() => rights.validateRightsRoot(closed as unknown as Record<string, unknown>, 'r2')).not.toThrow()
    const proceeds = detached(closed)
    const record = proceeds.rights.estates.find(e => e.estateId === opened.estateId)!
    expect(record.proceeds).toHaveLength(1)
    record.proceeds[0]!.amount += 1
    expect(() => rights.validateRightsRoot(proceeds as unknown as Record<string, unknown>, 'r2')).toThrow(/proceeds must equal the estate sale transactions/)
  })
})

describe('r2 F12: valuation is explicit unavailable when any subject the holder holds or created is unavailable — never a partial total', () => {
  it('a holder whose persisted property contradicts its source cannot be valued at all', () => {
    const { state, r01, week, settled } = world()
    const P = { right: 'R1' as const, propertyId: rights.storyPropertyId(settled(r01).conceptId) }
    const forged = detached(rights.materializeLegacyTitles(state, P))
    forged.rights.properties[0]!.title = 'A Title Nobody Released'
    expect(rights.resolveTitles(forged).unavailable).toEqual([{ subject: P, reason: 'ambiguousProvenance' }])
    expect(libraryValuationV1(forged, r01, week)).toEqual({ kind: 'unavailable', reason: 'ambiguousProvenance', subject: P })
  })
})

describe('r2 F51: an unsafe sum refuses only valuation', () => {
  it('when per-item values overflow the safe integer range the read is unavailable(unsafeSum) and nothing changes', () => {
    const { state, r01, week } = world()
    const before = stableStringify(state)
    const tuning = TUNING as unknown as Record<string, number>
    const saved = tuning.RIGHTS_R2_CATALOGUE_VALUE_AT_100!
    try {
      tuning.RIGHTS_R2_CATALOGUE_VALUE_AT_100 = 2 ** 52
      expect(libraryValuationV1(state, r01, week)).toEqual({ kind: 'unavailable', reason: 'unsafeSum' })
    } finally {
      tuning.RIGHTS_R2_CATALOGUE_VALUE_AT_100 = saved
    }
    expect(libraryValuationV1(state, r01, week).kind).toBe('available')
    expect(stableStringify(state)).toBe(before)
  })
})

describe('r2 F53/F65: the boundary week is legacy; a missing title is null', () => {
  it('a fact dated exactly at recordedFromWeek is legacy, the next week is not', () => {
    expect(rights.isLegacyDate({ kind: 'campaign', week: 3 }, 3)).toBe(true)
    expect(rights.isLegacyDate({ kind: 'campaign', week: 4 }, 3)).toBe(false)
    expect(rights.isLegacyDate({ kind: 'beforeCampaign', year: 1920 }, 0)).toBe(true)
  })

  it('a release with no attested title mints title null with source unavailable, never an empty string', () => {
    const route = mintRoute()
    const film = route.released.studio.releasedFilms.find((f) => f.productionId === route.productionId)!
    const minted = rights.mintFilmTitleAtRelease(route.released, { studioId: route.released.hollywood!.playerStudioId, filmId: 'r2-untitled', conceptId: film.conceptId, title: null, week: film.releaseTick })
    expect(minted.rights.filmTitles.find((t) => t.filmId === 'r2-untitled')).toMatchObject({ title: null, titleSource: 'unavailable' })
  })
})
