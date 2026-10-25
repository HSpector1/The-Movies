// STATIC-UNRUN investigation for original estate68. Install under tests/ only for root's sole lane.
// Genuine week93 -> mandatory evaluated94 -> fixed1M player-title sale to R04 -> paid1000 remake back.
// The fixed1M rival-origin offer is a scripted lawful API choice, not evidence of natural AI willingness.
// One declared104-tick observation horizon; no price/seed search or closure-date promise.
// No fabricated finance/history/condition, STABLE reader, timeout override or P17 activation.
import { expect, it } from 'vitest'
import { manifestPin93, week93Raw } from './p14d1-rival-shelving-fixtures.js'
import { signRole } from './helpers/stabilization-staffing.js'
import { applyActions } from '../src/core/actions.js'
import { acceptOffer, makeOffer, offerRefusal } from '../src/core/assetSale.js'
import { blockingEncumbrance, permissionFor } from '../src/core/licence.js'
import { estateBidRefusal, submitEstateBid } from '../src/core/estate.js'
import { conditionRecord } from '../src/core/corporateConditionLive.js'
import { currentHolder, storyPropertyId, subjectKey } from '../src/core/rights.js'
import { postPurchaseReserve, spendableCash } from '../src/core/rightsFinance.js'
import { importSave, migrateToLive, makeSave, stableStringify, exportCurrentState } from '../src/core/save.js'
import { resolveShape } from '../src/core/shape.js'
import { tick } from '../src/core/tick.js'
import type { Action, FilmShape, GameState } from '../src/core/types.js'
const R04='studio-aca408ec-r04', PRICE=1_000_000, FEE=1_000, BID=1_000
const SHAPE:FilmShape={opening:'slowSetup',midpoint:'reversal',ending:'bittersweet'}
function packageFor(state:GameState,conceptId:string) {
 const used=new Set<string>();const writer=signRole(state,'writer',1,used);state=writer.state
 const director=signRole(state,'director',1,used);state=director.state
 const actors=signRole(state,'actor',3,used);state=actors.state
 const craft=signRole(state,'craft',1,used);state=craft.state
 const concept=state.concepts.find(c=>c.id===conceptId)!
 const action:Action & {kind:'greenlight'}={kind:'greenlight',production:{conceptId,shape:SHAPE,
  promise:{genre:concept.genre,intendedSegments:['adult'],ranges:{intimacy:[-1,1],tonalWeight:[-1,1],kineticEnergy:[-1,1]}},
  writerId:writer.ids[0]!,directorId:director.ids[0]!,craftIds:[craft.ids[0]!],
  cast:{lead:actors.ids[0]!,antagonist:actors.ids[1]!,support:actors.ids[2]!},
  budget:{negative:concept.baseNegativeCost*resolveShape(SHAPE).budgetDemandMultiplier*state.era.costScale,marketing:0}}}
 return {state,action}
}
it('investigates a real rival closure after reverse R1 ownership, then a post-opening licensed remake and D disqualification',()=>{
 manifestPin93();const prior=migrateToLive(importSave(week93Raw())).state,priorBytes=stableStringify(prior)
 expect(prior.market.tick).toBe(93)
 let state=tick(prior);expect(state.market.tick).toBe(94)
 const player=state.hollywood!.playerStudioId,week=state.market.tick,conceptId=state.concepts[0]!.id
 console.info(JSON.stringify({proof:'reverse68-evaluated94',condition:conditionRecord(state,R04),cash:state.hollywood!.businesses.find(b=>b.studioId===R04)!.account.cash,reserve:postPurchaseReserve(state,R04)}))
 expect(conditionRecord(state,R04)?.condition.stage).toBe('stable')
 const first=packageFor(state,conceptId);state=applyActions(first.state,[first.action])
 const firstId=state.studio.activeProductions.at(-1)!.id
 state=applyActions(state,[{kind:'cancel',productionId:firstId}])
 const subject={right:'R1' as const,propertyId:storyPropertyId(conceptId)}
 expect(blockingEncumbrance(state,subject)).toBeNull()
 const sale={offerorId:R04,counterpartyId:player,direction:'buy' as const,price:PRICE,instrument:{kind:'title' as const,subject}}
 console.info(JSON.stringify({proof:'reverse68-sale-margin',spendable:spendableCash(state,R04),price:PRICE,reserve:postPurchaseReserve(state,R04),refusal:offerRefusal(state,sale,week)}))
 expect(offerRefusal(state,sale,week)).toBeNull()
 const playerBeforeSale=state.studio.cash,rivalBeforeSale=state.hollywood!.businesses.find(b=>b.studioId===R04)!.account.cash
 const offered=makeOffer(state,sale,week);state=acceptOffer(offered.state,offered.offer.id,player,week)
 expect(state.studio.cash).toBe(playerBeforeSale+PRICE)
 expect(state.hollywood!.businesses.find(b=>b.studioId===R04)!.account.cash).toBe(rivalBeforeSale-PRICE)
 const saleTx=state.rights.transactions.find(t=>t.offerId===offered.offer.id)!
 expect(saleTx).toMatchObject({kind:'titleSale',week,payerId:R04,payeeId:player,amount:PRICE,subject,licenceId:null})
 expect(saleTx.titleEventIds).toHaveLength(1)
 expect(state.rights.titleEvents.find(e=>e.id===saleTx.titleEventIds[0])).toMatchObject({subject,priorHolder:player,newHolder:R04,cause:'sale'})
 expect(currentHolder(state,subject,week)).toMatchObject({holderId:R04,tradeable:true})
 const grant={offerorId:player,counterpartyId:R04,direction:'buy' as const,price:FEE,instrument:{kind:'licence' as const,right:'R3' as const,subject,scope:{use:'remake' as const},exclusive:true,startWeek:week,endWeekExclusive:week+208}}
 expect(offerRefusal(state,grant,week)).toBeNull()
 const playerBeforeGrant=state.studio.cash,rivalBeforeGrant=state.hollywood!.businesses.find(b=>b.studioId===R04)!.account.cash
 const licenceOffer=makeOffer(state,grant,week);state=acceptOffer(licenceOffer.state,licenceOffer.offer.id,R04,week)
 expect(state.studio.cash).toBe(playerBeforeGrant-FEE)
 expect(state.hollywood!.businesses.find(b=>b.studioId===R04)!.account.cash).toBe(rivalBeforeGrant+FEE)
 const licence=state.rights.licences.find(l=>l.grantorId===R04&&l.granteeId===player&&l.subject.right==='R1'&&l.subject.propertyId===subject.propertyId)!
 expect(licence).toBeDefined()
 expect(state.rights.transactions.find(t=>t.id===licence.transactionId)).toMatchObject({kind:'licenceGrant',week,payerId:player,payeeId:R04,amount:FEE,subject,licenceId:licence.id,offerId:licenceOffer.offer.id,titleEventIds:[]})
 makeSave(state)
 const maxWeek=week+104
 while(state.market.tick<maxWeek&&!state.studioClosure.closures.some(c=>c.studioId===R04))state=tick(state)
 const closure=state.studioClosure.closures.find(c=>c.studioId===R04)
 console.info(JSON.stringify({proof:'reverse68-natural-continuation',week:state.market.tick,closure:closure??null,condition:conditionRecord(state,R04),cash:state.hollywood!.businesses.find(b=>b.studioId===R04)?.account.cash,loans:state.corporateCondition.loans.filter(l=>l.studioId===R04)}))
 expect(closure,'bounded104-week continuation must actually reach rival closure; absence is not global impossibility').toBeDefined()
 const opened=state.rights.estates.find(e=>e.closureId===closure!.closureId)!
 const lot=opened.lots.find(l=>l.subjects.some(s=>subjectKey(s)===subjectKey(subject)))!
 expect(lot).toBeDefined();expect(lot.encumbrances).toContain('licence:'+licence.id)
 expect(blockingEncumbrance(state,subject)).toBeNull()
 const permitted={kind:'permitted',via:'licence',licenceId:licence.id}
 expect(permissionFor(state,player,subject,'R3',{use:'remake'},state.market.tick)).toEqual(permitted)
 while(state.market.tick<opened.closesWeek-1)state=tick(state)
 const remake=packageFor(state,conceptId);state=remake.state
 expect(blockingEncumbrance(state,subject)).toBeNull()
 expect(permissionFor(state,player,subject,'R3',{use:'remake'},state.market.tick)).toEqual(permitted)
 expect(BID).toBeGreaterThanOrEqual(lot.minimumBid)
 const bid={estateId:opened.estateId,lotId:lot.lotId,bidderId:player,amount:BID}
 expect(estateBidRefusal(state,bid,state.market.tick)).toBeNull();makeSave(state)
 const before=stableStringify(state),submitted=submitEstateBid(state,bid,state.market.tick)
 const submittedBefore=stableStringify(submitted.state)
 const controlBusy=applyActions(state,[remake.action]),bidBusy=applyActions(submitted.state,[remake.action])
 expect(stableStringify(state)).toBe(before)
 expect(stableStringify(submitted.state)).toBe(submittedBefore)
 expect(blockingEncumbrance(controlBusy,subject)).toBe('activeProduction')
 expect(blockingEncumbrance(bidBusy,subject)).toBe('activeProduction')
 expect(permissionFor(bidBusy,player,subject,'R3',{use:'remake'},state.market.tick)).toEqual(permitted)
 const controlBefore=stableStringify(controlBusy),bidBefore=stableStringify(bidBusy)
 const control=tick(controlBusy),closed=tick(bidBusy)
 expect(stableStringify(controlBusy)).toBe(controlBefore)
 expect(stableStringify(bidBusy)).toBe(bidBefore)
 expect(stableStringify(state)).toBe(before)
 const final=closed.rights.estates.find(e=>e.estateId===opened.estateId)!
 expect(final.bids.find(b=>b.id===submitted.bid.id)).toMatchObject({status:'disqualified',disqualification:'lotEncumbered:activeProduction:'+subjectKey(subject)})
 expect(final.lots.find(l=>l.lotId===lot.lotId)!.status).toBe('archived')
 expect(closed.studio.cash).toBe(control.studio.cash)
 expect(closed.ledger).toEqual(control.ledger)
 expect(closed.rights.transactions.filter(t=>t.estateId===opened.estateId&&t.lotId===lot.lotId)).toEqual([])
 expect(closed.rights.transactions.find(t=>t.id===saleTx.id)).toEqual(saleTx)
 expect(closed.rights.transactions.find(t=>t.id===licence.transactionId)).toEqual(state.rights.transactions.find(t=>t.id===licence.transactionId))
 makeSave(closed)
 const saved=exportCurrentState(closed)
 expect(exportCurrentState(migrateToLive(importSave(saved)).state)).toBe(saved)
 expect(stableStringify(prior)).toBe(priorBytes)
})
