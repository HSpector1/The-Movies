// ── P16C RED: estate lots, sealed bids, the close ceremony at D, archival of unsold rights ──
//
// Authority: P16 integration contract §4 (the handoff admits lots; half-open window [opensWeek,
// closesWeek) closes once; unsold lots archive; no free claim; estate staff are free agents and a
// purchase buys no people), §6 ("Estates alone use competitive bids on clean, explicitly identified
// lots ... sealed one-shot comparison at the recorded window close, with descending valid bid
// amount then ascending reserved studio identity order ... Validate each buyer's eligibility/
// reserved cash and lot authority again before resolution; try the next eligible valid bid when a
// higher one no longer qualifies ... Estate consideration goes to the estate once ... Archival
// freezes unsold rights as not for sale ... A repeat close/archive command is an explicit refusal or
// internal policy no-op"), §7 group E; 1367-G timing amendment (bids admitted only before D; valid
// pre-D sealed bids resolve exactly once at D; new bids at D refuse; 13-week window); 1362-O §5.1,
// §5.3, §5.7.
//
// The P15B Wave 4 producer is concurrent work: estates here are opened from HAND-BUILT
// `EstateHandoff` fixtures (the typed adapter point); nothing here declares a studio terminal.
//
// r2: handoff v2 disposes of every right the closed studio holds (lots + pending, review F39) and carries
// licence encumbrances and claim references (F4/F29); estates open and close only under bound P15B
// readers (F60), so these tests hand in STABLE and the shipped binding refuses the ceremony by name.

import { describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import * as sale from '../src/core/assetSale.js'
import * as estate from '../src/core/estate.js'
import * as finance from '../src/core/rightsFinance.js'
import * as rights from '../src/core/rights.js'
import { libraryValuationV1 } from '../src/core/propertyValuation.js'
import { convertV49ToV48, importSave, makeSave, migrateToLive, stableStringify } from '../src/core/save.js'
import { tick } from '../src/core/tick.js'
import { TUNING } from '../src/core/tuning.js'
import type { GameState } from '../src/core/types.js'
import { detached, estateHandoffFor, liveFromGenuine, readersWith, STABLE } from './helpers/p16-fixtures.js'

type RightSubject = { right: 'R1'; propertyId: string } | { right: 'R2'; filmId: string }
const R1 = (propertyId: string): RightSubject => ({ right: 'R1', propertyId })
const R2 = (filmId: string): RightSubject => ({ right: 'R2', filmId })
const rivalCash = (state: GameState, id: string) => state.hollywood!.businesses.find((b) => b.studioId === id)!.account.cash

function world() {
  const state = liveFromGenuine('week53')
  const h = state.hollywood!
  const [player, r01, r02, r03, r04] = [h.playerStudioId, ...h.identities.slice(1, 5).map((i) => i.studioId)] as [string, string, string, string, string]
  const films = (studioId: string) => h.films.filter((f) => f.studioId === studioId)
  const settled = films(r03).filter((f) => f.provenance === 'simulation/v1' && f.settledWeek !== null)
  const authored = films(r03).filter((f) => f.provenance === 'authored-start/v1')
  const week = state.market.tick
  const lotA = { lotId: 'lot-a', subjects: [R2(settled[0]!.filmId), R2(settled[1]!.filmId)], minimumBid: 1, encumbrances: [] as string[] }
  const lotB = { lotId: 'lot-b', subjects: [R1(rights.storyPropertyId(settled[0]!.conceptId))], minimumBid: 10_000, encumbrances: [] as string[] }
  const lotC = { lotId: 'lot-c', subjects: [R2(authored[0]!.filmId)], minimumBid: 1, encumbrances: [] as string[] }
  const handoff: estate.EstateHandoff = {
    ...estateHandoffFor(state, r03, week, [lotA, lotB, lotC], ['p15b-claim-1', 'p15b-claim-2']),
    closureId: 'closure-r03-53', estateId: 'estate-r03-53',
    claimsContext: { priorityVersion: 'p15b-w4/claims-v1', claimIds: ['p15b-claim-1', 'p15b-claim-2'] },
    cashReconciliation: { terminalCash: Math.round(rivalCash(state, r03)), loanRemainder: 0 },
  }
  return { state, h, player, r01, r02, r03, r04, week, lotA, lotB, lotC, handoff, D: week + TUNING.ESTATE_WINDOW_WEEKS }
}

describe('P16C estate handoff: the typed adapter point opens an estate; it never declares a studio terminal', () => {
  it('opens from a valid handoff, materializes the lot titles, and from the closure week the studio\'s rights are estate-only', () => {
    const { state, r03, player, handoff, week, lotA, D } = world()
    expect(estate.estateHandoffRefusal(state, handoff, week)).toBeNull()
    const { state: opened, estate: record } = estate.openEstate(state, handoff, week, STABLE)
    expect(record).toMatchObject({ estateId: handoff.estateId, closureId: handoff.closureId, studioId: r03, closureWeek: week, opensWeek: week, closesWeek: D, closedWeek: null, bids: [], proceeds: [] })
    expect(record.lots.map((l) => [l.lotId, l.status])).toEqual([['lot-a', 'open'], ['lot-b', 'open'], ['lot-c', 'open']])
    for (const subject of lotA.subjects) {
      expect(rights.currentHolder(opened, subject, week)).toEqual({ kind: 'holder', holderId: r03, tradeable: false, archived: false, estate: { estateId: handoff.estateId, lotId: 'lot-a' } })
      expect(rights.currentHolder(opened, subject, week - 1)).toEqual({ kind: 'holder', holderId: r03, tradeable: true, archived: false })
    }
    // r2 (F39): a right of the closed studio that no lot admits is pending: frozen with the estate from the closure week.
    const outside = opened.hollywood!.films.find((f) => f.studioId === r03 && !handoff.lots.some((l) => l.subjects.some((s) => s.right === 'R2' && s.filmId === f.filmId)))!
    expect(rights.currentHolder(opened, R2(outside.filmId), week)).toEqual({ kind: 'holder', holderId: r03, tradeable: false, archived: false, estate: { estateId: handoff.estateId, lotId: null } })
    expect(record.pending.length).toBe(handoff.pending.length)
    expect(record.claimsContext).toEqual({ priorityVersion: 'p15b-w4/claims-v1', claimIds: ['p15b-claim-1', 'p15b-claim-2'] })
    expect(libraryValuationV1(opened, r03, week)).toEqual({ kind: 'unavailable', reason: 'unresolvedTerminalAuthority' })
    // Bilateral sale of an admitted lot subject refuses: estates alone use competitive bids.
    expect(sale.offerRefusal(opened, { offerorId: player, counterpartyId: r03, direction: 'buy', instrument: { kind: 'title', subject: lotA.subjects[0]! }, price: 1 }, week, STABLE)).toBe('notTradeable')
    // The closed studio is no longer a permitted bidder anywhere.
    expect(finance.permittedBidderRefusal(opened, r03, week)).toBe('terminal')
    expect(() => makeSave(opened)).not.toThrow()
    // Opening moved no money and touched no person.
    expect(opened.studio.cash).toBe(state.studio.cash)
    expect(opened.hollywood!.employment).toEqual(state.hollywood!.employment)
    expect(opened.hollywood!.businesses.map((b) => b.account)).toEqual(state.hollywood!.businesses.map((b) => b.account))
  })

  it('refuses a malformed handoff by name: overlapping lots, a subject the studio does not hold, a wrong window, an unknown studio, a duplicate estate', () => {
    const { state, r01, handoff, week, lotA, lotB } = world()
    const before = stableStringify(state)
    expect(estate.estateHandoffRefusal(state, { ...handoff, lots: [lotA, { ...lotB, subjects: [...lotB.subjects, lotA.subjects[0]!] }] }, week)).toBe('lotOverlap')
    const foreign = state.hollywood!.films.find((f) => f.studioId === r01)!
    expect(estate.estateHandoffRefusal(state, { ...handoff, lots: [{ ...lotA, subjects: [R2(foreign.filmId)] }] }, week)).toBe('lotSubjectNotHeld')
    expect(estate.estateHandoffRefusal(state, { ...handoff, lots: [{ ...lotA, subjects: [R2('no-such-film')] }] }, week)).toBe('lotSubjectNotHeld')
    expect(estate.estateHandoffRefusal(state, { ...handoff, closesWeek: handoff.closesWeek + 1 }, week)).toBe('invalidWindow')
    expect(estate.estateHandoffRefusal(state, { ...handoff, opensWeek: handoff.opensWeek + 1 }, week)).toBe('invalidWindow')
    expect(estate.estateHandoffRefusal(state, handoff, handoff.closesWeek)).toBe('notClosureWeek')
    expect(estate.estateHandoffRefusal(state, { ...handoff, studioId: 'studio-nobody' }, week)).toBe('unknownStudio')
    expect(estate.estateHandoffRefusal(state, { ...handoff, lots: [] }, week)).toMatch(/^dispositionMissing:R/)
    expect(estate.estateHandoffRefusal(state, { ...handoff, lots: [lotA, { ...lotB, lotId: 'lot-a' }] }, week)).toBe('duplicateLotId')
    const opened = estate.openEstate(state, handoff, week, STABLE).state
    expect(estate.estateHandoffRefusal(opened, handoff, week)).toBe('duplicateEstate')
    expect(() => estate.openEstate(state, { ...handoff, lots: [] }, week, STABLE)).toThrow(/dispositionMissing/)
    // The shipped (unbound) P15B binding can certify nobody: it cannot open an estate at all (review F60).
    expect(() => estate.openEstate(state, handoff, week)).toThrow(/conditionReadersUnbound/)
    expect(stableStringify(state)).toBe(before)
  })
})

describe('P16C sealed bids: admission only before D, reservations, refusals', () => {
  it('admits one sealed bid per bidder per lot before D, reserves the amount, and refuses by name otherwise', () => {
    const { state, player, r01, r03, r04, handoff, week, D } = world()
    const opened = estate.openEstate(state, handoff, week, STABLE).state
    const bid = (over: Partial<estate.EstateBidInput>) => estate.estateBidRefusal(opened, { estateId: handoff.estateId, lotId: 'lot-a', bidderId: player, amount: 100_000, ...over }, week, STABLE)
    expect(bid({})).toBeNull()
    expect(bid({ estateId: 'estate-nobody' })).toBe('unknownEstate')
    expect(bid({ lotId: 'lot-z' })).toBe('unknownLot')
    expect(bid({ amount: 0 })).toBe('invalidBid')
    expect(bid({ amount: 1.5 })).toBe('invalidBid')
    expect(bid({ lotId: 'lot-b', amount: 9_999 })).toBe('belowMinimumBid')
    expect(bid({ bidderId: r03 })).toBe('selfDealing')
    expect(bid({ bidderId: r04, amount: Math.max(1, Math.round(rivalCash(opened, r04))) })).toBe('insufficientCashAfterReserve')
    expect(estate.estateBidRefusal(opened, { estateId: handoff.estateId, lotId: 'lot-a', bidderId: r01, amount: 1 }, week, readersWith({ [r01]: 'warning' }))).toBe('bidderNotPermitted:stageNotStable:warning')
    expect(estate.estateBidRefusal(opened, { estateId: handoff.estateId, lotId: 'lot-a', bidderId: player, amount: 1 }, D, STABLE)).toBe('estateClosed')
    expect(estate.estateBidRefusal(opened, { estateId: handoff.estateId, lotId: 'lot-a', bidderId: player, amount: 1 }, D + 5, STABLE)).toBe('estateClosed')
    const { state: withBid, bid: sealed } = estate.submitEstateBid(opened, { estateId: handoff.estateId, lotId: 'lot-a', bidderId: player, amount: 100_000 }, week, STABLE)
    expect(sealed).toMatchObject({ estateId: handoff.estateId, lotId: 'lot-a', bidderId: player, amount: 100_000, week, status: 'sealed', disqualification: null })
    expect(finance.reservedCash(withBid, player)).toBe(100_000)
    expect(withBid.studio.cash).toBe(state.studio.cash)
    expect(estate.estateBidRefusal(withBid, { estateId: handoff.estateId, lotId: 'lot-a', bidderId: player, amount: 200_000 }, week, STABLE)).toBe('duplicateBid')
    // Two sealed bids cannot spend the same balance.
    const affordable = finance.spendableCash(withBid, player) - finance.postPurchaseReserve(withBid, player)
    expect(estate.estateBidRefusal(withBid, { estateId: handoff.estateId, lotId: 'lot-b', bidderId: player, amount: affordable + 1 }, week, STABLE)).toBe('insufficientCashAfterReserve')
    expect(estate.estateBidRefusal(withBid, { estateId: handoff.estateId, lotId: 'lot-b', bidderId: player, amount: affordable }, week, STABLE)).toBeNull()
    expect(() => makeSave(withBid)).not.toThrow()
    // The player's verb routes through the shipped (unbound, fail-closed) P15B binding: refused by name; the amount law still precedes it.
    expect(() => applyActions(opened, [{ kind: 'submitEstateBid', estateId: handoff.estateId, lotId: 'lot-b', amount: 20_000 }])).toThrow(/bidderNotPermitted:conditionUnavailable/)
    expect(() => applyActions(opened, [{ kind: 'submitEstateBid', estateId: handoff.estateId, lotId: 'lot-b', amount: 1 }])).toThrow(/belowMinimumBid/)
  })
})

describe('P16C close ceremony at D: sealed comparison, deterministic tie-break, failed-winner fallback, proceeds once, archival', () => {
  function bidsPlaced() {
    const w = world()
    let state = estate.openEstate(w.state, w.handoff, w.week, STABLE).state
    const put = (lotId: string, bidderId: string, amount: number) => { state = estate.submitEstateBid(state, { estateId: w.handoff.estateId, lotId, bidderId, amount }, w.week, STABLE).state }
    // Equal bids, r01 (row 1) sealed BEFORE the player (row 0): the tie resolves by ascending reserved identity order,
    // never by submission order (review F48).
    put('lot-a', w.r01, 100_000)
    put('lot-a', w.player, 100_000)
    put('lot-a', w.r02, 90_000)
    put('lot-b', w.r01, 60_000) // the higher bid, disqualified at D by changed facts below
    put('lot-b', w.r02, 50_000)
    return { ...w, state }
  }
  const factsAtD = (r01: string) => readersWith({ [r01]: 'warning' })

  it('resolves exactly once at D with exact debits, proceeds to the estate once, title to the winners, archival of the unsold lot, and no person moved', () => {
    const { state, player, r01, r02, r03, handoff, D, lotA, lotB, lotC } = bidsPlaced()
    const atD = { ...state, market: { ...state.market, tick: D } } as GameState
    const closed = estate.resolveEstate(atD, handoff.estateId, D, factsAtD(r01))
    const record = closed.rights.estates.find((e) => e.estateId === handoff.estateId)!
    expect(record.closedWeek).toBe(D)
    const statuses = Object.fromEntries(record.bids.map((b) => [`${b.lotId}:${b.bidderId}`, b.status]))
    expect(statuses).toEqual({ [`lot-a:${player}`]: 'won', [`lot-a:${r01}`]: 'lost', [`lot-a:${r02}`]: 'lost', [`lot-b:${r01}`]: 'disqualified', [`lot-b:${r02}`]: 'won' })
    expect(record.bids.find((b) => b.lotId === 'lot-b' && b.bidderId === r01)!.disqualification).toMatch(/bidderNotPermitted:stageNotStable:warning/)
    expect(record.lots.map((l) => [l.lotId, l.status])).toEqual([['lot-a', 'sold'], ['lot-b', 'sold'], ['lot-c', 'archived']])
    // Money: each winner debited once; the estate credited once per lot; nobody else moved; the closed studio received nothing.
    expect(closed.studio.cash).toBe(state.studio.cash - 100_000)
    expect(closed.ledger.filter((e) => e.kind === 'rightsConsideration')).toHaveLength(1)
    expect(rivalCash(closed, r02)).toBe(rivalCash(state, r02) - 50_000)
    expect(rivalCash(closed, r01)).toBe(rivalCash(state, r01))
    expect(rivalCash(closed, r03)).toBe(rivalCash(state, r03))
    expect(record.proceeds.map((p) => [p.lotId, p.amount])).toEqual([['lot-a', 100_000], ['lot-b', 50_000]])
    const txs = closed.rights.transactions.filter((t) => t.kind === 'estateSale')
    expect(txs).toHaveLength(2)
    expect(txs[0]).toMatchObject({ payerId: player, payeeId: null, estateId: handoff.estateId, lotId: 'lot-a', amount: 100_000, subject: null })
    expect(txs[0]!.titleEventIds).toHaveLength(2)
    // Title: sold rights are owned (creator still r03); the unsold right is archived, nontradeable, never a free asset.
    for (const subject of lotA.subjects) expect(rights.currentHolder(closed, subject, D)).toEqual({ kind: 'holder', holderId: player, tradeable: true, archived: false })
    for (const subject of lotB.subjects) expect(rights.currentHolder(closed, subject, D)).toEqual({ kind: 'holder', holderId: r02, tradeable: true, archived: false })
    expect(rights.currentHolder(closed, lotC.subjects[0]!, D)).toEqual({ kind: 'holder', holderId: `estate:${r03}`, tradeable: false, archived: true })
    expect(closed.rights.filmTitles.find((t) => t.filmId === (lotA.subjects[0] as { filmId: string }).filmId)!.creatorStudioId).toBe(r03)
    expect(sale.offerRefusal(closed, { offerorId: player, counterpartyId: r03, direction: 'buy', instrument: { kind: 'title', subject: lotC.subjects[0]! }, price: 1 }, D, STABLE)).toBe('notTradeable')
    // The player's library now carries the two films at their value; reservations released.
    const value = libraryValuationV1(closed, player, D)
    expect(value.kind === 'available' && value.items.map((i) => i.subject)).toEqual(lotA.subjects)
    expect(finance.reservedCash(closed, player)).toBe(0)
    expect(finance.reservedCash(closed, r01)).toBe(0)
    // Estate sales buy no people: employment is untouched.
    expect(closed.hollywood!.employment).toEqual(state.hollywood!.employment)
    expect(closed.hollywood!.activeEmploymentOrdinals).toEqual(state.hollywood!.activeEmploymentOrdinals)
    // The rights root of this pure ceremony validates as a Save46 root (the full save boundary is proved on the natural route).
    expect(() => rights.validateRightsRoot(closed as unknown as Record<string, unknown>, 'ceremony')).not.toThrow()
    // A repeat close is an explicit refusal; the tick-side policy call is a no-op with identical bytes.
    expect(() => estate.resolveEstate(closed, handoff.estateId, D, factsAtD(r01))).toThrow(/already closed/)
    expect(stableStringify(estate.closeDueEstates(closed, D + 1, factsAtD(r01)))).toBe(stableStringify(closed))
    // Before D nothing resolves.
    expect(() => estate.resolveEstate(state, handoff.estateId, D - 1, STABLE)).toThrow(/before its close boundary/)
  })

  it('the natural route: ticks carry the estate to D; the shipped (unbound) binding refuses the ceremony by name instead of archiving every lot; with bound readers the week-D ceremony sells, archives, saves and reloads byte-for-byte', () => {
    const { state, player, r02, r03, handoff, week, D, lotA, lotC } = bidsPlaced()
    let s = state
    for (let w = week; w < D - 1; w++) {
      s = tick(s)
      expect(s.rights.estates[0]!.closedWeek, `week ${s.market.tick}`).toBeNull()
      expect(() => makeSave(s)).not.toThrow()
    }
    expect(s.market.tick).toBe(D - 1)
    // r2 (review F60): the ceremony never runs under the unbound sentinel — no silent disqualification, no permanent archive.
    expect(() => tick(s)).toThrow(/conditionReadersUnbound/)
    // Replay from the pre-D state is byte-identical.
    let again = state
    for (let w = week; w < D - 1; w++) again = tick(again)
    expect(stableStringify(again)).toBe(stableStringify(s))
    // The week-D ceremony with bound readers (review F61): the week advances with the estate set aside, then the estate
    // closes at D exactly as the tick's last rights step would, and the result saves and reloads byte-for-byte.
    const advanced = tick({ ...s, rights: { ...s.rights, estates: [] } } as GameState)
    expect(advanced.market.tick).toBe(D)
    const closed = estate.resolveEstate({ ...advanced, rights: { ...advanced.rights, estates: s.rights.estates } } as GameState, handoff.estateId, D, STABLE)
    const record = closed.rights.estates[0]!
    expect(record.closedWeek).toBe(D)
    expect(record.lots.map((l) => [l.lotId, l.status])).toEqual([['lot-a', 'sold'], ['lot-b', 'sold'], ['lot-c', 'archived']])
    expect(record.pending.every((p) => p.status === 'archived')).toBe(true)
    expect(rights.currentHolder(closed, lotA.subjects[0]!, D)).toMatchObject({ kind: 'holder', holderId: player, tradeable: true })
    expect(rights.currentHolder(closed, lotC.subjects[0]!, D)).toMatchObject({ kind: 'holder', holderId: `estate:${r03}`, archived: true, tradeable: false })
    expect(record.proceeds.map((p) => p.amount)).toEqual([100_000, 60_000])
    expect(rivalCash(closed, r02)).toBe(rivalCash(advanced, r02))
    const saved = makeSave(closed)
    expect(stableStringify(migrateToLive(importSave(stableStringify(saved))))).toBe(stableStringify(saved))
    expect(() => applyActions(closed, [{ kind: 'submitEstateBid', estateId: handoff.estateId, lotId: 'lot-c', amount: 1 }])).toThrow(/estateClosed/)
    expect(() => convertV49ToV48(saved)).toThrow(/migrateToV48: cannot downgrade or discard a recorded rights root/)
  })

  it('a winner who can no longer afford a later lot after winning an earlier one falls back to the next valid bid', () => {
    const w = world()
    let state = estate.openEstate(w.state, w.handoff, w.week, STABLE).state
    const affordable = finance.spendableCash(state, w.player) - finance.postPurchaseReserve(state, w.player)
    const big = Math.floor(affordable * 0.6)
    state = estate.submitEstateBid(state, { estateId: w.handoff.estateId, lotId: 'lot-a', bidderId: w.player, amount: big }, w.week, STABLE).state
    // The second bid is affordable only while the first is unpaid: both together exceed the reserve test.
    const second = Math.floor(affordable * 0.6)
    expect(estate.estateBidRefusal(state, { estateId: w.handoff.estateId, lotId: 'lot-b', bidderId: w.player, amount: second }, w.week, STABLE)).toBe('insufficientCashAfterReserve')
    // So the player cannot even seal it: the reservation law already prevents the double spend. Seal a lawful one instead,
    // then shrink the player's cash before D so the FIRST win exhausts what the second needed.
    const small = Math.floor(affordable * 0.3)
    state = estate.submitEstateBid(state, { estateId: w.handoff.estateId, lotId: 'lot-b', bidderId: w.player, amount: small }, w.week, STABLE).state
    state = estate.submitEstateBid(state, { estateId: w.handoff.estateId, lotId: 'lot-b', bidderId: w.r02, amount: 10_000 }, w.week, STABLE).state
    const squeezed = detached(state)
    squeezed.studio.cash = finance.postPurchaseReserve(squeezed, w.player) + big + 1 // enough for lot-a, not for lot-b after it
    const atD = { ...squeezed, market: { ...squeezed.market, tick: w.D } } as GameState
    const closed = estate.resolveEstate(atD, w.handoff.estateId, w.D, STABLE)
    const record = closed.rights.estates[0]!
    expect(record.bids.find((b) => b.lotId === 'lot-a' && b.bidderId === w.player)!.status).toBe('won')
    expect(record.bids.find((b) => b.lotId === 'lot-b' && b.bidderId === w.player)!).toMatchObject({ status: 'disqualified', disqualification: 'insufficientCashAfterReserve' })
    expect(record.bids.find((b) => b.lotId === 'lot-b' && b.bidderId === w.r02)!.status).toBe('won')
    expect(closed.studio.cash).toBe(squeezed.studio.cash - big)
  })
})
