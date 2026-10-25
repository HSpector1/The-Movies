// UNRUN fixed genuine pre162 rival-buyer transaction controls; all setup inside default5s.
import {describe,it,expect,vi} from 'vitest'
import {readFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import * as sales from '../src/core/assetSale.js'
import * as finance from '../src/core/rightsFinance.js'
import * as saves from '../src/core/save.js'
import {requestDiligence,disclosureFor} from '../src/core/dueDiligence.js'
import {actualP16Money,currentHolder} from '../src/core/rights.js'
import {conditionRecord,outstandingLoan} from '../src/core/corporateConditionLive.js'
const SELLER='studio-aca408ec-r01',BUYER='studio-aca408ec-r03',FILM=SELLER+':film:0',PRICE=1000
const subject={right:'R2' as const,filmId:FILM}
function pure<T>(state:Parameters<typeof saves.makeSave>[0],fn:()=>T){const before=JSON.stringify(state);try{return fn()}finally{expect(JSON.stringify(state)).toBe(before)}}
function prepared(){
 const path=process.env.P16_JOIN_PREC48_PATH;expect(path).toBeTruthy()
 const bytes=readFileSync(path!);expect(createHash('sha256').update(bytes).digest('hex')).toBe('cd11f369558e09f1d65d8e848374ea028f4c5f666c168b5527e48c098cfdfb19')
 const raw=JSON.parse(bytes.toString()),rawBefore=JSON.stringify(raw),old=saves.validateSaveP15B(raw),oldBefore=JSON.stringify(old)
 const base=saves.convertV48ToV49(old).state
 expect(JSON.stringify(raw)).toBe(rawBefore);expect(JSON.stringify(old)).toBe(oldBefore);expect(base.market.tick).toBe(162)
 const film=base.hollywood!.films.find(f=>f.filmId===FILM)!
 expect(film).toMatchObject({studioId:SELLER,provenance:'simulation/v1',settledWeek:16})
 expect(base.hollywood!.businesses.find(b=>b.studioId===SELLER)!.runs.some(r=>r.productionId===FILM)).toBe(false)
 expect(currentHolder(base,subject,162)).toMatchObject({kind:'holder',holderId:SELLER,tradeable:true})
 expect(conditionRecord(base,BUYER)?.condition).toMatchObject({week:162,stage:'stable'})
 expect(outstandingLoan(base,BUYER,162)).toBeUndefined();expect(finance.permittedBidderRefusal(base,BUYER,162)).toBeNull()
 const cash=finance.studioCash(base,BUYER)
 const dd=pure(base,()=>requestDiligence(base,{recipientId:BUYER,target:{kind:'studio',studioId:SELLER},scope:['rights']},162))
 expect(dd.record).toMatchObject({recipientId:BUYER,target:{kind:'studio',studioId:SELLER},week:162,scope:['rights']})
 expect(disclosureFor(dd.state,BUYER,dd.record.id)).toEqual(dd.record)
 expect(disclosureFor(dd.state,SELLER,dd.record.id)).toBeNull()
 expect(disclosureFor(dd.state,base.hollywood!.playerStudioId,dd.record.id)).toBeNull()
 expect(dd.record.fee).toBeGreaterThan(0);expect(finance.studioCash(dd.state,BUYER)).toBe(cash-dd.record.fee)
 pure(dd.state,()=>saves.makeSave(dd.state))
 // Buyer-held report cannot be attached as seller-held authority; it remains genuine paid private history.
 const input={offerorId:SELLER,counterpartyId:BUYER,direction:'sell' as const,instrument:{kind:'title' as const,subject},price:PRICE,disclosureId:null}
 expect(sales.offerRefusal(dd.state,input,162)).toBeNull()
 const made=pure(dd.state,()=>sales.makeOffer(dd.state,input,162))
 expect(made.offer).toMatchObject({offerorId:SELLER,counterpartyId:BUYER,price:PRICE,status:'open',week:162,quoteAgePolicyVersion:1})
 expect(sales.rivalWillingness(made.state,made.offer,162).willing,'fixed1000 real valuation willingness, no fallback').toBe(true)
 expect(sales.closingRefusal(made.state,made.offer,162)).toBeNull()
 expect(finance.spendableCash(made.state,BUYER)-PRICE).toBeGreaterThanOrEqual(finance.postPurchaseReserve(made.state,BUYER))
 pure(made.state,()=>saves.makeSave(made.state))
 return {base,dd,...made}
}
function closed(p:ReturnType<typeof prepared>){
 const result=pure(p.state,()=>sales.acceptOffer(p.state,p.offer.id,BUYER,162))
 pure(result,()=>saves.makeSave(result));return result
}
describe('P16 genuine rival buyer bilateral rights parity',()=>{
 it('real paid R03 diligence and funded R01 seller offer close once through direct and ordinary rival answer owners with exact rival cash title and save parity',()=>{
  const p=prepared(),result=closed(p),answered=pure(p.state,()=>sales.answerRivalOffers(p.state,162))
  expect(saves.exportCurrentState(answered)).toBe(saves.exportCurrentState(result))
  const row=result.rights.offers.find(o=>o.id===p.offer.id)!
  expect(row).toMatchObject({status:'accepted',resolvedWeek:162});const tx=result.rights.transactions.find(t=>t.id===row.transactionId)!
  expect(tx).toMatchObject({kind:'titleSale',week:162,payerId:BUYER,payeeId:SELLER,amount:PRICE,offerId:p.offer.id,subject})
  expect(tx.titleEventIds).toHaveLength(1)
  expect(result.rights.titleEvents.find(t=>t.id===tx.titleEventIds[0])).toMatchObject({cause:'sale',priorHolder:SELLER,newHolder:BUYER,date:{kind:'campaign',week:162}})
  expect(currentHolder(result,subject,162)).toMatchObject({kind:'holder',holderId:BUYER})
  expect(finance.studioCash(result,BUYER)).toBe(finance.studioCash(p.state,BUYER)-PRICE)
  expect(finance.studioCash(result,SELLER)).toBe(finance.studioCash(p.state,SELLER)+PRICE)
  expect(actualP16Money(result,BUYER).rightsConsideration-actualP16Money(p.state,BUYER).rightsConsideration).toBe(-PRICE)
  expect(actualP16Money(result,SELLER).rightsConsideration-actualP16Money(p.state,SELLER).rightsConsideration).toBe(PRICE)
  expect(result.studio.cash).toBe(p.state.studio.cash);expect(result.ledger).toEqual(p.state.ledger)
  expect(result.rights.diligence).toEqual(p.state.rights.diligence)
  expect(result.rights.transactions.filter(t=>t.offerId===p.offer.id)).toHaveLength(1)
  pure(result,()=>expect(()=>sales.acceptOffer(result,p.offer.id,BUYER,162)).toThrow(/not open \(accepted\)/))
  const text=saves.exportCurrentState(result),reload=saves.migrateToLive(saves.importSave(text)).state
  expect(saves.exportCurrentState(reload)).toBe(text)
 })
 it('positive rival close does not grant foreign acceptance or seller use of buyer-held private report authority',()=>{
  const p=prepared();closed(p)
  pure(p.state,()=>expect(()=>sales.acceptOffer(p.state,p.offer.id,p.state.hollywood!.playerStudioId,162)).toThrow(/only the counterparty/))
  const foreign={offerorId:SELLER,counterpartyId:BUYER,direction:'sell' as const,instrument:{kind:'title' as const,subject},price:PRICE,disclosureId:p.dd.record.id}
  expect(sales.offerRefusal(p.dd.state,foreign,162)).toBe('disclosureNotHeld')
  pure(p.dd.state,()=>expect(()=>sales.makeOffer(p.dd.state,foreign,162)).toThrow(/disclosureNotHeld/))
 })
 it('real second cash owner refusal cannot expose a partial title payment or accepted rival offer to the original caller',()=>{
  const p=prepared();closed(p)
  const real=finance.moveStudioCash,marker='RIVAL_RIGHTS_SECOND_CASH_FAULT';let calls=0
  const spy=vi.spyOn(finance,'moveStudioCash').mockImplementation((...args)=>{
   const next=real(...args);calls++
   expect(currentHolder(args[0],subject,162)).toMatchObject({kind:'holder',holderId:BUYER})
   expect(args[2]).toBe('rightsConsideration');expect(args[4]).toBe(162)
   if(calls===1){expect(args[1]).toBe(BUYER);expect(args[3]).toBe(-PRICE);expect(finance.studioCash(next,BUYER)).toBe(finance.studioCash(p.state,BUYER)-PRICE)}
   if(calls===2){expect(args[1]).toBe(SELLER);expect(args[3]).toBe(PRICE);expect(finance.studioCash(args[0],BUYER)).toBe(finance.studioCash(p.state,BUYER)-PRICE);expect(finance.studioCash(next,SELLER)).toBe(finance.studioCash(p.state,SELLER)+PRICE);throw new Error(marker)}
   return next
  })
  try{pure(p.state,()=>expect(()=>sales.acceptOffer(p.state,p.offer.id,BUYER,162)).toThrow(marker));expect(calls).toBe(2)}finally{spy.mockRestore()}
  expect(p.state.rights.offers.find(o=>o.id===p.offer.id)!.status).toBe('open')
  pure(p.state,()=>saves.makeSave(p.state))
 })
})
