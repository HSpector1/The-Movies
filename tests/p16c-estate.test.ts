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
// Sprint 1: actual captured closure and bound readers replace the obsolete fabricated handoffs.
// The grouped-lot witness explicitly exercises a lawful adapter partition of real clean inventory.

import { describe, expect, it, vi } from 'vitest'
import { assertAuthenticLaterLotFallback, assertAuthenticWarningFallback } from './helpers/p16-authentic-bidders.js'
import { actualEstateOpening, actualEstateClosure, actualEstatePrior } from './helpers/p16-actual-estate.js'
import { applyActions } from '../src/core/actions.js'
import * as sale from '../src/core/assetSale.js'
import * as estate from '../src/core/estate.js'
import * as finance from '../src/core/rightsFinance.js'
import * as rights from '../src/core/rights.js'
import { libraryValuationV1 } from '../src/core/propertyValuation.js'
import { convertV49ToV48, convertV50ToV49, convertV51ToV50, importSave, makeSave, migrateToLive, stableStringify } from '../src/core/save.js'
import { tick } from '../src/core/tick.js'
import type { GameState } from '../src/core/types.js'

type RightSubject = { right: 'R1'; propertyId: string } | { right: 'R2'; filmId: string }
const R2 = (filmId: string): RightSubject => ({ right: 'R2', filmId })
const rivalCash = (state: GameState, id: string) => state.hollywood!.businesses.find((b) => b.studioId === id)!.account.cash

describe('P16C estate handoff: the typed adapter point opens an estate; it never declares a studio terminal', () => {
  it('opens from a valid handoff, materializes the lot titles, and from the closure week the studio\'s rights are estate-only', () => {
    const actual=actualEstateOpening(),[state,handoff,week]=actual.boundary
    const r03=handoff.studioId,player=state.hollywood!.playerStudioId,D=handoff.closesWeek
    const lotA=handoff.lots.find(l=>l.subjects.some(s=>s.right==='R2'&&s.filmId===r03+':film:0'))!
    expect(lotA).toBeDefined()
    expect(estate.estateHandoffRefusal(state,handoff,week)).toBeNull()
    const {state:opened,estate:record}=estate.openEstate(...actual.boundary)
    expect(record).toEqual(actual.estate)
    expect(record).toMatchObject({estateId:handoff.estateId,closureId:handoff.closureId,studioId:r03,closureWeek:week,opensWeek:week,closesWeek:D,closedWeek:null,bids:[],proceeds:[]})
    expect(record.lots.map(l=>[l.lotId,l.status])).toEqual(handoff.lots.map(l=>[l.lotId,'open']))
    for(const subject of lotA.subjects){
      expect(rights.currentHolder(opened,subject,week)).toEqual({kind:'holder',holderId:r03,tradeable:false,archived:false,estate:{estateId:handoff.estateId,lotId:lotA.lotId}})
      expect(rights.currentHolder(opened,subject,week-1)).toEqual({kind:'holder',holderId:r03,tradeable:true,archived:false})
    }
    // This actual R04 closure has no pending rights. The nonempty active-work law uses real R03 closure in r2.
    expect(record.pending).toEqual(handoff.pending)
    expect(record.claimsContext).toEqual(handoff.claimsContext)
    expect(record.claimsContext.claimIds).toHaveLength(6)
    expect(record.cashReconciliation).toEqual({terminalCash:actual.closure.cash.closing,loanRemainder:actual.closure.loan!.remainder})
    expect(libraryValuationV1(opened,r03,week)).toEqual({kind:'unavailable',reason:'unresolvedTerminalAuthority'})
    expect(sale.offerRefusal(opened,{offerorId:player,counterpartyId:r03,direction:'buy',instrument:{kind:'title',subject:lotA.subjects[0]!},price:1},week)).toBe('notTradeable')
    expect(finance.permittedBidderRefusal(opened,r03,week)).toBe('terminal')
    // The actual adapter phase is not relabelled as an independently saved whole tick.
    expect(()=>makeSave(actual.state)).not.toThrow()
    // Reuse this admitted closure; a later validation must resolve its current title evidence afresh.
    const changed = structuredClone(actual.state)
    const subject = actual.estate.lots.flatMap(l => l.subjects).find(s => s.right === 'R1')!
    expect(subject?.right).toBe('R1')
    if (subject.right !== 'R1') throw new Error('actual estate has no R1 title')
    const property = changed.rights.properties.find(p => p.propertyId === subject.propertyId)!
    expect(property).toBeDefined()
    expect(typeof property.title).toBe('string')
    const originalTitle = property.title
    expect(() => estate.validateEstateJoins(changed, 'fresh-title')).not.toThrow()
    property.title = originalTitle === 'Hostile estate title' ? 'Another hostile estate title' : 'Hostile estate title'
    expect(rights.resolveTitles(changed).unavailable).toContainEqual({ subject, reason: 'ambiguousProvenance' })
    const changedBefore = stableStringify(changed)
    expect(() => estate.validateEstateJoins(changed, 'fresh-title')).toThrow('estate join held rights must be disposed exactly once at closure')
    expect(stableStringify(changed)).toBe(changedBefore)
    property.title = originalTitle
    expect(() => estate.validateEstateJoins(changed, 'fresh-title')).not.toThrow()
    expect(opened.studio.cash).toBe(state.studio.cash)
    expect(opened.hollywood!.employment).toEqual(state.hollywood!.employment)
    expect(opened.hollywood!.businesses.map(b=>b.account)).toEqual(state.hollywood!.businesses.map(b=>b.account))
    expect(opened.studioClosure).toEqual(state.studioClosure)

  })

  it('refuses a malformed handoff by name: overlapping lots, a subject the studio does not hold, a wrong window, an unknown studio, a duplicate estate', () => {
    const actual=actualEstateOpening(),[state,handoff,week]=actual.boundary
    const lotA=handoff.lots[0]!,lotB=handoff.lots[1]!,r01='studio-aca408ec-r01'
    const before=stableStringify(state),handoffBefore=stableStringify(handoff)
    const reject=(changed:estate.EstateHandoff,reason:string)=>{
      const changedBefore=stableStringify(changed)
      expect(estate.estateHandoffRefusal(state,changed,week)).toBe(reason)
      expect(()=>estate.openEstate(state,changed,week)).toThrow('estate handoff refused: '+reason)
      expect(stableStringify(changed)).toBe(changedBefore)
      expect(stableStringify(state)).toBe(before)
    }
    reject({...handoff,lots:[lotA,{...lotB,subjects:[...lotB.subjects,lotA.subjects[0]!]}]},'lotOverlap')
    const foreign=state.hollywood!.films.find(f=>f.studioId===r01)!
    reject({...handoff,lots:[{...lotA,subjects:[R2(foreign.filmId)]}]},'lotSubjectNotHeld')
    reject({...handoff,lots:[{...lotA,subjects:[R2('no-such-film')]}]},'lotSubjectNotHeld')
    // Immutable closure authority now precedes the shape checks; do not weaken it to recover old diagnostics.
    reject({...handoff,closesWeek:handoff.closesWeek+1},'actualClosureWindowMismatch')
    reject({...handoff,opensWeek:handoff.opensWeek+1},'actualClosureWindowMismatch')
    expect(estate.estateHandoffRefusal(state,handoff,handoff.closesWeek)).toBe('notClosureWeek')
    reject({...handoff,studioId:'studio-nobody'},'actualClosureMissing')
    reject({...handoff,lots:[]},'dispositionMissing:'+rights.subjectKey(handoff.lots[0]!.subjects[0]!))
    reject({...handoff,lots:[lotA,{...lotB,lotId:lotA.lotId}]},'duplicateLotId')
    const opened=estate.openEstate(...actual.boundary).state
    expect(estate.estateHandoffRefusal(opened,handoff,week)).toBe('duplicateEstate')
    expect(()=>estate.openEstate(state,handoff,week,finance.UNBOUND_CORPORATE_CONDITION_READERS)).toThrow(/conditionReadersUnbound/)
    expect(stableStringify(state)).toBe(before);expect(stableStringify(handoff)).toBe(handoffBefore)

  })
})

describe('P16C sealed bids: admission only before D, reservations, refusals', () => {
  it('admits one sealed bid per bidder per lot before D, reserves the amount, and refuses by name otherwise', () => {
    const actual=actualEstateClosure(),opened=actual.state,record=actual.estate,week=opened.market.tick,D=record.closesWeek,player=opened.hollywood!.playerStudioId
    const lotA=record.lots.find(l=>l.subjects.some(s=>s.right==='R2'&&s.filmId===record.studioId+':film:0'))!
    const lotB=record.lots.find(l=>l.subjects.some(s=>s.right==='R1'&&s.propertyId==='story-property:'+record.studioId+':concept:0'))!
    expect(lotA).toBeDefined();expect(lotB).toBeDefined()
    const input={estateId:record.estateId,lotId:lotA.lotId,bidderId:player,amount:100_000}
    const before=stableStringify(opened)
    const bid=(over:Partial<estate.EstateBidInput>)=>estate.estateBidRefusal(opened,{...input,...over},week)
    expect(bid({})).toBeNull()
    expect(estate.estateBidRefusal(actual.prior,input,162)).toBe('unknownEstate')
    expect(bid({estateId:'estate-nobody'})).toBe('unknownEstate')
    expect(bid({lotId:'lot-z'})).toBe('unknownLot')
    expect(bid({amount:0})).toBe('invalidBid');expect(bid({amount:1.5})).toBe('invalidBid')
    expect(bid({lotId:lotB.lotId,amount:lotB.minimumBid-1})).toBe('belowMinimumBid')
    expect(bid({bidderId:record.studioId})).toBe('selfDealing')
    expect(bid({amount:opened.studio.cash})).toBe('insufficientCashAfterReserve')
    const rival='studio-aca408ec-r01', rivalAmount=Math.floor(finance.spendableCash(opened,rival))
    expect(finance.permittedBidderRefusal(opened,rival,week)).toBeNull()
    expect(Number.isSafeInteger(rivalAmount)).toBe(true);expect(rivalAmount).toBeGreaterThan(lotA.minimumBid)
    expect(bid({bidderId:rival,amount:rivalAmount})).toBe('insufficientCashAfterReserve')
    expect(estate.estateBidRefusal(opened,input,week,finance.UNBOUND_CORPORATE_CONDITION_READERS)).toBe('bidderNotPermitted:conditionUnavailable')
    // A real warning bidder's refusal is checked in the paid-down warning-fallback case below.
    expect(estate.estateBidRefusal(opened,input,D)).toBe('estateClosed')
    expect(estate.estateBidRefusal(opened,input,D+5)).toBe('estateClosed')
    expect(estate.estateBidRefusal(opened,input,week-1)).toBe('estateNotOpen')
    expect(finance.reservedCash(opened,player)).toBe(0)
    const {state:withBid,bid:sealed}=estate.submitEstateBid(opened,input,week)
    expect(sealed).toMatchObject({...input,week,status:'sealed',disqualification:null})
    expect(finance.reservedCash(withBid,player)).toBe(100_000);expect(withBid.studio.cash).toBe(opened.studio.cash)
    expect(estate.estateBidRefusal(withBid,{...input,amount:200_000},week)).toBe('duplicateBid')
    const affordable=finance.spendableCash(withBid,player)-finance.postPurchaseReserve(withBid,player)
    expect(Number.isSafeInteger(affordable)).toBe(true)
    expect(estate.estateBidRefusal(withBid,{...input,lotId:lotB.lotId,amount:affordable+1},week)).toBe('insufficientCashAfterReserve')
    expect(estate.estateBidRefusal(withBid,{...input,lotId:lotB.lotId,amount:affordable},week)).toBeNull()
    expect(()=>makeSave(withBid)).not.toThrow()
    // The shipped public action now uses actual bound readers and agrees with the direct producer.
    expect(applyActions(opened,[{kind:'submitEstateBid',estateId:record.estateId,lotId:lotA.lotId,amount:100_000}])).toEqual(withBid)
    expect(()=>applyActions(opened,[{kind:'submitEstateBid',estateId:record.estateId,lotId:lotB.lotId,amount:lotB.minimumBid-1}])).toThrow(/belowMinimumBid/)
    expect(stableStringify(opened)).toBe(before)

  })
})

describe('P16C close ceremony at D: sealed comparison, deterministic tie-break, failed-winner fallback, proceeds once, archival', () => {
  it('resolves exactly once at D with exact debits, proceeds to the estate once, title to the winners, archival of the unsold lot, and no person moved', () => {
    // Constructed adapter partition permitted by contract §4, not an untouched producer capture.
    // Only two clean singleton lots are grouped; real closure, inventory and valuation remain intact.
    const prior=actualEstatePrior(), originalOpen=estate.openEstate
    const priorBytes=stableStringify(prior)
    let grouped: estate.EstateHandoff | undefined
    const spy=vi.spyOn(estate,'openEstate').mockImplementation((state,handoff,week,readers)=>{
      if(handoff.studioId!=='studio-aca408ec-r04')return originalOpen(state,handoff,week,readers)
      const a=handoff.lots.find(l=>l.subjects.some(s=>s.right==='R2'&&s.filmId===handoff.studioId+':film:0'))!
      const b=handoff.lots.find(l=>l.subjects.some(s=>s.right==='R2'&&s.filmId===handoff.studioId+':film:1'))!
      expect(a.subjects).toHaveLength(1);expect(b.subjects).toHaveLength(1)
      expect(a.encumbrances).toEqual([]);expect(b.encumbrances).toEqual([])
      expect(a.lotId).not.toBe(b.lotId)
      expect(Number.isSafeInteger(a.minimumBid+b.minimumBid)).toBe(true)
      expect(a.minimumBid+b.minimumBid).toBe(83_841)
      grouped={...handoff,lots:handoff.lots.filter(l=>l!==b).map(l=>l===a?{...a,subjects:[...a.subjects,...b.subjects],minimumBid:a.minimumBid+b.minimumBid}:l)}
      expect(grouped.lots.flatMap(l=>l.subjects).map(rights.subjectKey).sort()).toEqual(handoff.lots.flatMap(l=>l.subjects).map(rights.subjectKey).sort())
      expect(estate.estateHandoffRefusal(state,grouped,week)).toBeNull()
      return originalOpen(state,grouped,week,readers)
    })
    let state: GameState
    try {state=tick(prior)} finally {spy.mockRestore()}
    expect(stableStringify(prior)).toBe(priorBytes)
    expect(grouped).toBeDefined();makeSave(state)
    const handoff=grouped!,r03=handoff.studioId,D=handoff.closesWeek,player=state.hollywood!.playerStudioId
    const r01='studio-aca408ec-r01',r02='studio-aca408ec-r02'
    const lotA=handoff.lots.find(l=>l.subjects.length===2)!
    const lotB=handoff.lots.find(l=>l.subjects.some(s=>s.right==='R1'&&s.propertyId==='story-property:'+r03+':concept:0'))!
    const lotC=handoff.lots.find(l=>l.subjects.some(s=>s.right==='R2'&&s.filmId===r03+':film:2'))!
    while(state.market.tick<D-1)state=tick(state)
    const control=tick(state)
    for(const [lotId,bidderId,amount] of [[lotA.lotId,r01,100_000],[lotA.lotId,player,100_000],[lotA.lotId,r02,90_000],[lotB.lotId,r01,60_000],[lotB.lotId,r02,50_000]] as const){
      state=estate.submitEstateBid(state,{estateId:handoff.estateId,lotId,bidderId,amount},D-1).state
    }
    const before=stableStringify(state)
    expect(()=>estate.resolveEstate(state,handoff.estateId,D-1)).toThrow('estate: public resolution requires the admitted current D−1 input and exact D')
    const closed=estate.resolveEstate(state,handoff.estateId,D)
    expect(stableStringify(state)).toBe(before)
    const record=closed.rights.estates.find(e=>e.estateId===handoff.estateId)!
    expect(record.closedWeek).toBe(D)
    expect(record.bids.map(b=>b.status)).toEqual(['lost','won','lost','won','lost'])
    expect(record.lots.filter(l=>l.status==='sold').map(l=>l.lotId)).toEqual([lotB.lotId,lotA.lotId])
    expect(closed.studio.cash).toBe(control.studio.cash-100_000)
    expect(closed.ledger.filter(e=>e.kind==='rightsConsideration')).toHaveLength(1)
    expect(rivalCash(closed,r01)).toBe(rivalCash(control,r01)-60_000)
    expect(rivalCash(closed,r02)).toBe(rivalCash(control,r02))
    // Actual P15 terminal estate account receives consideration; immutable closure cash does not change.
    expect(rivalCash(closed,r03)).toBe(rivalCash(control,r03)+160_000)
    expect(closed.studioClosure.closures).toEqual(control.studioClosure.closures)
    const txs=closed.rights.transactions.filter(t=>t.kind==='estateSale'&&t.estateId===record.estateId)
    expect(txs).toHaveLength(2)
    const groupSale=txs.find(t=>t.lotId===lotA.lotId)!
    expect(groupSale).toMatchObject({payerId:player,payeeId:null,amount:100_000,subject:null})
    expect(groupSale.titleEventIds).toHaveLength(2)
    expect(new Set(groupSale.titleEventIds).size).toBe(2)
    expect(groupSale.titleEventIds.map(id=>closed.rights.titleEvents.find(e=>e.id===id))).toEqual(lotA.subjects.map(subject=>expect.objectContaining({subject,priorHolder:r03,newHolder:player,cause:'estateSale',source:{kind:'transaction',transactionId:groupSale.id}})))
    expect(txs.find(t=>t.lotId===lotB.lotId)!.titleEventIds).toHaveLength(1)
    expect(closed.studioClosure.estateEvents.filter(e=>e.closureId===record.closureId&&e.kind==='saleReceipt')).toEqual(txs.map(t=>expect.objectContaining({reference:t.id,amount:t.amount,week:D})))
    expect(closed.studioClosure.claims).toEqual(control.studioClosure.claims)
    expect(record.proceeds).toEqual(txs.map(t=>({transactionId:t.id,lotId:t.lotId,amount:t.amount})))
    for(const subject of lotA.subjects)expect(rights.currentHolder(closed,subject,D)).toEqual({kind:'holder',holderId:player,tradeable:true,archived:false})
    expect(rights.currentHolder(closed,lotB.subjects[0]!,D)).toMatchObject({holderId:r01,tradeable:true})
    expect(rights.currentHolder(closed,lotC.subjects[0]!,D)).toEqual({kind:'holder',holderId:'estate:'+r03,tradeable:false,archived:true})
    for(const subject of lotA.subjects){
      expect(subject.right).toBe('R2')
      if(subject.right==='R2')expect(closed.rights.filmTitles.find(t=>t.filmId===subject.filmId)!.creatorStudioId).toBe(r03)
    }
    expect(sale.offerRefusal(closed,{offerorId:player,counterpartyId:r03,direction:'buy',instrument:{kind:'title',subject:lotC.subjects[0]!},price:1},D)).toBe('notTradeable')
    const value=libraryValuationV1(closed,player,D)
    expect(value.kind==='available'&&value.items.map(i=>i.subject)).toEqual(lotA.subjects)
    for(const id of [player,r01,r02])expect(finance.reservedCash(closed,id)).toBe(0)
    expect(closed.hollywood!.employment).toEqual(control.hollywood!.employment)
    expect(closed.hollywood!.activeEmploymentOrdinals).toEqual(control.hollywood!.activeEmploymentOrdinals)
    expect(closed.contracts).toEqual(control.contracts)
    expect(()=>rights.validateRightsRoot(closed as unknown as Record<string,unknown>,'ceremony')).not.toThrow()
    const saved=makeSave(closed)
    expect(stableStringify(migrateToLive(importSave(stableStringify(saved))))).toBe(stableStringify(saved))
    expect(()=>estate.resolveEstate(closed,handoff.estateId,D)).toThrow(/already closed/)
    expect(estate.closeDueEstates(closed,D+1)).toBe(closed)
  })

  it('the ordinary route: ticks carry the estate to D; explicit unbound readers refuse, while actual bound readers sell, archive, save and reload byte-for-byte', () => {
    const actual=actualEstateClosure(),estateId=actual.estate.estateId,D=actual.estate.closesWeek,r03=actual.estate.studioId
    const player=actual.state.hollywood!.playerStudioId,r01='studio-aca408ec-r01',r02='studio-aca408ec-r02'
    const lotA=actual.estate.lots.find(l=>l.subjects.some(s=>s.right==='R2'&&s.filmId===r03+':film:0'))!
    const lotB=actual.estate.lots.find(l=>l.subjects.some(s=>s.right==='R1'&&s.propertyId==='story-property:'+r03+':concept:0'))!
    const lotC=actual.estate.lots.find(l=>l.subjects.some(s=>s.right==='R2'&&s.filmId===r03+':film:1'))!
    expect(lotA).toBeDefined();expect(lotB).toBeDefined();expect(lotC).toBeDefined()
    let start=estate.submitEstateBid(actual.state,{estateId,lotId:lotA.lotId,bidderId:player,amount:100_000},163).state
    start=estate.submitEstateBid(start,{estateId,lotId:lotB.lotId,bidderId:r01,amount:60_000},163).state
    let s=start
    while(s.market.tick<D-1){s=tick(s);expect(s.rights.estates.find(e=>e.estateId===estateId)!.closedWeek).toBeNull();expect(()=>makeSave(s)).not.toThrow()}
    expect(s.market.tick).toBe(D-1)
    const before=stableStringify(s)
    expect(()=>estate.resolveEstate(s,estateId,D,finance.UNBOUND_CORPORATE_CONDITION_READERS)).toThrow(/public resolution requires actual evaluated condition readers/)
    expect(stableStringify(s)).toBe(before)
    let again=start
    while(again.market.tick<D-1)again=tick(again)
    expect(stableStringify(again)).toBe(stableStringify(s))
    const closed=estate.resolveEstate(s,estateId,D),advanced=tick(s)
    expect(stableStringify(closed)).toBe(stableStringify(advanced));expect(stableStringify(s)).toBe(before)
    const record=closed.rights.estates.find(e=>e.estateId===estateId)!
    expect(record.closedWeek).toBe(D)
    expect(record.lots.filter(l=>l.status==='sold').map(l=>l.lotId)).toEqual([lotB.lotId,lotA.lotId])
    expect(record.lots.filter(l=>l.status==='archived')).toHaveLength(actual.estate.lots.length-2)
    expect(record.pending.every(p=>p.status==='archived')).toBe(true)
    expect(rights.currentHolder(closed,lotA.subjects[0]!,D)).toMatchObject({kind:'holder',holderId:player,tradeable:true})
    expect(rights.currentHolder(closed,lotC.subjects[0]!,D)).toMatchObject({kind:'holder',holderId:`estate:${r03}`,archived:true,tradeable:false})
    expect(record.proceeds.map(p=>p.amount)).toEqual([60_000,100_000])
    expect(rivalCash(closed,r02)).toBe(rivalCash(advanced,r02))
    const saved=makeSave(closed)
    expect(stableStringify(migrateToLive(importSave(stableStringify(saved))))).toBe(stableStringify(saved))
    expect(()=>applyActions(closed,[{kind:'submitEstateBid',estateId,lotId:lotC.lotId,amount:1}])).toThrow(/estateClosed/)
    expect(()=>convertV49ToV48(convertV50ToV49(convertV51ToV50(saved)))).toThrow(/migrateToV48: cannot discard unique estate observation or current closure provenance/)

  })

  it('a winner who can no longer afford a later lot after winning an earlier one falls back to the next valid bid', () => {
    assertAuthenticLaterLotFallback()
  })
  it('a genuinely paid-down bidder enters warning before D and its higher bid falls back to a stable rival',assertAuthenticWarningFallback)

})
