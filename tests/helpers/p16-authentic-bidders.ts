// C-03 authentic bidder competition and fallback witnesses.
// All preparation stays inside each original default 5 s test; no cached state or reader injection.
import { expect } from 'vitest'
import { applyActions } from '../../src/core/actions.js'
import { acceptOffer, makeOffer, offerRefusal, rivalWillingness } from '../../src/core/assetSale.js'
import { conditionRecord, outstandingLoan } from '../../src/core/corporateConditionLive.js'
import { estateBidRefusal, resolveEstate, submitEstateBid } from '../../src/core/estate.js'
import { publicityOffer } from '../../src/core/publicity.js'
import { currentHolder } from '../../src/core/rights.js'
import { permittedBidderRefusal, postPurchaseReserve, reservedCash, spendableCash, studioCash, weeklyFixedCost } from '../../src/core/rightsFinance.js'
import { exportCurrentState, importSave, makeSave, migrateToLive } from '../../src/core/save.js'
import { tick } from '../../src/core/tick.js'
import type { GameState } from '../../src/core/types.js'
import { actualEstateClosure } from './p16-actual-estate.js'

const R01 = 'studio-aca408ec-r01'
const R02 = 'studio-aca408ec-r02'
const R04 = 'studio-aca408ec-r04'
const FILM = R04 + ':film:0'
const PROPERTY = 'story-property:' + R04 + ':concept:0'

function prepare(atClose = true) {
  const opened = actualEstateClosure()
  let state = opened.state
  if (atClose) while (state.market.tick < 175) state = tick(state)
  expect(state.market.tick).toBe(atClose ? 175 : 163)
  const record = state.rights.estates.find(e => e.estateId === opened.estate.estateId)!
  expect(record).toMatchObject({ studioId: R04, opensWeek: 163, closesWeek: 176, closedWeek: null })
  const filmLot = record.lots.find(l => l.subjects.length === 1 && l.subjects[0]!.right === 'R2' && l.subjects[0]!.filmId === FILM)!
  const propertyLot = record.lots.find(l => l.subjects.length === 1 && l.subjects[0]!.right === 'R1' && l.subjects[0]!.propertyId === PROPERTY)!
  expect(filmLot, 'fixed original R04 film0, no asset fallback').toBeDefined()
  expect(propertyLot, 'fixed original R04 concept0, no asset fallback').toBeDefined()
  expect(filmLot.minimumBid).toBe(38_114)
  expect(propertyLot.minimumBid).toBe(9_528)
  expect(filmLot.encumbrances).toEqual([])
  expect(propertyLot.encumbrances).toEqual([])
  makeSave(state)
  return { state, record, filmLot, propertyLot, player: state.hollywood!.playerStudioId }
}

function put(state: GameState, estateId: string, lotId: string, bidderId: string, amount: number) {
  const input = { estateId, lotId, bidderId, amount }
  expect(permittedBidderRefusal(state, bidderId, state.market.tick)).toBeNull()
  expect(estateBidRefusal(state, input, state.market.tick)).toBeNull()
  return submitEstateBid(state, input, state.market.tick).state
}

export function assertAuthenticBidTieAndLowerBid() {
    const w = prepare()
    const rows = w.state.hollywood!.identities
    expect(rows.find(i => i.studioId === w.player)!.row).toBeLessThan(rows.find(i => i.studioId === R01)!.row)
    let state = put(w.state, w.record.estateId, w.filmLot.lotId, R01, 100_000)
    state = put(state, w.record.estateId, w.filmLot.lotId, w.player, 100_000)
    state = put(state, w.record.estateId, w.filmLot.lotId, R02, 90_000)
    expect(state.rights.estates.find(e => e.estateId === w.record.estateId)!.bids.map(b => b.bidderId)).toEqual([R01, w.player, R02])
    for (const id of [w.player, R01, R02]) expect(outstandingLoan(state, id, 176)).toBeUndefined()
    expect(reservedCash(state, w.player)).toBe(100_000)
    expect(studioCash(state, w.player)).toBe(studioCash(w.state, w.player))
    const before = exportCurrentState(state)
    const result = resolveEstate(state, w.record.estateId, 176)
    expect(exportCurrentState(state)).toBe(before)
    const control = tick(w.state)
    const record = result.rights.estates.find(e => e.estateId === w.record.estateId)!
    expect(record.bids.map(b => [b.bidderId, b.status, b.disqualification])).toEqual([
      [R01, 'lost', null], [w.player, 'won', null], [R02, 'lost', null],
    ])
    expect(result.studio.cash - control.studio.cash).toBe(-100_000)
    expect(studioCash(result, R01)).toBe(studioCash(control, R01))
    expect(studioCash(result, R02)).toBe(studioCash(control, R02))
    expect(result.ledger.filter(e => e.kind === 'rightsConsideration')).toHaveLength(1)
    const sales = result.rights.transactions.filter(t => t.kind === 'estateSale' && t.estateId === record.estateId)
    expect(sales).toHaveLength(1)
    expect(sales[0]).toMatchObject({ payerId: w.player, payeeId: null, estateId: record.estateId, lotId: w.filmLot.lotId, amount: 100_000, subject: null })
    expect(sales[0]!.titleEventIds).toHaveLength(1)
    expect(record.proceeds).toEqual([{ transactionId: sales[0]!.id, lotId: w.filmLot.lotId, amount: 100_000 }])
    expect(currentHolder(result, { right: 'R2', filmId: FILM }, 176)).toEqual({ kind: 'holder', holderId: w.player, tradeable: true, archived: false })
    expect(record.closedWeek).toBe(176)
    expect(record.lots.filter(l => l.lotId !== w.filmLot.lotId).every(l => l.status === 'archived')).toBe(true)
    expect(result.hollywood!.employment).toEqual(control.hollywood!.employment)
    expect(result.hollywood!.activeEmploymentOrdinals).toEqual(control.hollywood!.activeEmploymentOrdinals)
    for (const id of [w.player, R01, R02]) expect(reservedCash(result, id)).toBe(0)
    expect(() => resolveEstate(result, record.estateId, 176)).toThrow(/already closed/)
    const saved = exportCurrentState(result)
    expect(exportCurrentState(migrateToLive(importSave(saved)).state)).toBe(saved)
}

export function assertAuthenticLaterLotFallback() {
    const w = prepare()
    expect(w.record.lots.indexOf(w.propertyLot)).toBeLessThan(w.record.lots.indexOf(w.filmLot))
    const affordable = spendableCash(w.state, w.player) - postPurchaseReserve(w.state, w.player)
    const big = Math.floor(affordable * 0.6)
    const small = Math.floor(affordable * 0.3)
    let state = put(w.state, w.record.estateId, w.propertyLot.lotId, w.player, big)
    expect(estateBidRefusal(state, { estateId: w.record.estateId, lotId: w.filmLot.lotId, bidderId: w.player, amount: big }, 175)).toBe('insufficientCashAfterReserve')
    state = put(state, w.record.estateId, w.filmLot.lotId, w.player, small)
    state = put(state, w.record.estateId, w.filmLot.lotId, R01, 100_000)
    expect(small).toBeGreaterThan(100_000)
    expect(reservedCash(state, w.player)).toBe(big + small)
    expect(publicityOffer(state, 'push')).toMatchObject({ available: true, cost: 3_600_000 })
    const before = exportCurrentState(state)
    const squeezed = applyActions(state, [{ kind: 'publicity', tier: 'push' }])
    expect(exportCurrentState(state)).toBe(before)
    expect(squeezed.studio.cash).toBe(state.studio.cash - 3_600_000)
    expect(squeezed.ledger.slice(state.ledger.length)).toEqual([{ week: 175, kind: 'publicity', amount: -3_600_000, note: 'publicity: push' }])
    expect(reservedCash(squeezed, w.player)).toBe(big + small)
    makeSave(squeezed)
    // Same actual campaign and ordinary week, with no sealed bids: isolates only sale debits.
    const control = tick(applyActions(w.state, [{ kind: 'publicity', tier: 'push' }]))
    expect(permittedBidderRefusal(control, w.player, 176)).toBeNull()
    expect(control.studio.cash - big).toBeGreaterThanOrEqual(postPurchaseReserve(control, w.player))
    expect(control.studio.cash - big - small).toBeLessThan(postPurchaseReserve(control, w.player))
    const result = resolveEstate(squeezed, w.record.estateId, 176)
    const record = result.rights.estates.find(e => e.estateId === w.record.estateId)!
    expect(record.bids.find(b => b.lotId === w.propertyLot.lotId && b.bidderId === w.player)!.status).toBe('won')
    expect(record.bids.find(b => b.lotId === w.filmLot.lotId && b.bidderId === w.player)).toMatchObject({ status: 'disqualified', disqualification: 'insufficientCashAfterReserve' })
    expect(record.bids.find(b => b.lotId === w.filmLot.lotId && b.bidderId === R01)!.status).toBe('won')
    expect(result.studio.cash).toBe(control.studio.cash - big)
    expect(studioCash(result, R01)).toBe(studioCash(control, R01) - 100_000)
    expect(record.proceeds.map(p => [p.lotId, p.amount])).toEqual([[w.propertyLot.lotId, big], [w.filmLot.lotId, 100_000]])
    expect(currentHolder(result, { right: 'R1', propertyId: PROPERTY }, 176)).toMatchObject({ kind: 'holder', holderId: w.player })
    expect(currentHolder(result, { right: 'R2', filmId: FILM }, 176)).toMatchObject({ kind: 'holder', holderId: R01 })
    expect(reservedCash(result, w.player)).toBe(0)
    makeSave(result)
}

export function assertAuthenticWarningFallback() {
    const w = prepare(false)
    let state = put(w.state, w.record.estateId, w.filmLot.lotId, w.player, 100_000)
    state = put(state, w.record.estateId, w.filmLot.lotId, R01, 90_000)
    expect(state.contracts).toEqual([])
    expect(state.theatricalRuns).toEqual([])
    expect(state.studio.releasedFilms).toEqual([])
    expect(weeklyFixedCost(state, w.player)).toBe(15_000)
    expect(publicityOffer(state, 'whisper')).toMatchObject({ available: true, cost: 1_200_000 })
    // Fixed lawful price formula, not a searched amount. A real clean original R01 title
    // pays the seller and leaves the sealed 100k plus one actual 1.2M campaign in cash.
    const price = state.studio.cash - 100_000 - 1_200_000
    const purchase = { offerorId: w.player, counterpartyId: R01, direction: 'buy' as const,
      instrument: { kind: 'title' as const, subject: { right: 'R2' as const, filmId: R01 + ':film:0' } }, price }
    expect(Number.isSafeInteger(price)).toBe(true)
    expect(offerRefusal(state, purchase, 163)).toBeNull()
    expect(rivalWillingness(state, purchase, 163).willing).toBe(true)
    const offer = makeOffer(state, purchase, 163)
    const purchased = acceptOffer(offer.state, offer.offer.id, R01, 163)
    expect(purchased.studio.cash).toBe(1_300_000)
    expect(studioCash(purchased, R01)).toBe(studioCash(state, R01) + price)
    expect(currentHolder(purchased, purchase.instrument.subject, 163)).toMatchObject({ kind: 'holder', holderId: w.player })
    expect(reservedCash(purchased, w.player)).toBe(100_000)
    makeSave(purchased)
    state = applyActions(purchased, [{ kind: 'publicity', tier: 'whisper' }])
    expect(state.studio.cash).toBe(100_000)
    expect(state.ledger.slice(purchased.ledger.length)).toEqual([{ week: 163, kind: 'publicity', amount: -1_200_000, note: 'publicity: whisper' }])
    makeSave(state)
    while (state.market.tick < 175) state = tick(state)
    expect(state.studio.cash).toBe(-80_000)
    expect(weeklyFixedCost(state, w.player)).toBe(15_000)
    expect(conditionRecord(state, w.player)?.condition).toMatchObject({ week: 175, stage: 'warning', since: 169 })
    expect(state.corporateCondition.events.filter(e => e.studioId === w.player)).toContainEqual(expect.objectContaining({ week: 169, from: 'stable', to: 'warning' }))
    expect(permittedBidderRefusal(state, w.player, 175)).toBe('stageNotStable:warning')
    expect(estateBidRefusal(state,{estateId:w.record.estateId,lotId:w.propertyLot.lotId,bidderId:w.player,amount:100_000},175)).toBe('bidderNotPermitted:stageNotStable:warning')
    expect(permittedBidderRefusal(state, R01, 175)).toBeNull()
    makeSave(state)
    const before = exportCurrentState(state)
    const result = resolveEstate(state, w.record.estateId, 176)
    expect(exportCurrentState(state)).toBe(before)
    const record = result.rights.estates.find(e => e.estateId === w.record.estateId)!
    expect(record.bids.find(b => b.bidderId === w.player)).toMatchObject({ status: 'disqualified', disqualification: 'bidderNotPermitted:stageNotStable:warning' })
    expect(record.bids.find(b => b.bidderId === R01)).toMatchObject({ status: 'won', disqualification: null })
    expect(result.studio.cash).toBe(-95_000)
    expect(record.proceeds.map(p => p.amount)).toEqual([90_000])
    expect(currentHolder(result, { right: 'R2', filmId: FILM }, 176)).toMatchObject({ kind: 'holder', holderId: R01 })
    expect(result.rights.transactions.filter(t => t.kind === 'estateSale' && t.estateId === record.estateId)).toHaveLength(1)
    expect(reservedCash(result, w.player)).toBe(0)
    makeSave(result)
}
