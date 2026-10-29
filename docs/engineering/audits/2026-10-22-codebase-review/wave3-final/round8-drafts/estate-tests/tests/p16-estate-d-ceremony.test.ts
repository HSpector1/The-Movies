// One predeclared public13M bid on the existing disclosed R04 transaction control.
// No new seed/timing/amount fallback; no fake cash/history. Core5s unchanged.
import { expect,it } from 'vitest'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { applyActions } from '../src/core/actions.js'
import { convertV48ToV49,makeSave,validateSaveP15B,stableStringify,exportCurrentState,importSave,migrateToLive } from '../src/core/save.js'
import { tick } from '../src/core/tick.js'
import { conditionRecord,outstandingLoan } from '../src/core/corporateConditionLive.js'
import { estateBidRefusal } from '../src/core/estate.js'
import { postPurchaseReserve,spendableCash } from '../src/core/rightsFinance.js'
import { currentHolder } from '../src/core/rights.js'
import type { GameState } from '../src/core/types.js'
const R04='studio-aca408ec-r04',FILM='studio-aca408ec-r04:film:0',BID=13_000_000
const sha=(b:Buffer)=>createHash('sha256').update(b).digest('hex')
const cash=(s:GameState,id:string)=>s.hollywood!.businesses.find(b=>b.studioId===id)!.account.cash
function sequences(state:GameState) {
 const values:number[]=[]
 function visit(value:unknown):void {
  if(!value||typeof value!=='object')return
  if(Array.isArray(value)){for(const x of value)visit(x);return}
  const row=value as Record<string,unknown>
  if(typeof row.p15DomainSequence==='number')values.push(row.p15DomainSequence)
  for(const x of Object.values(row))visit(x)
 }
 for(const key of ['sharedMarket','powerRanking','corporateCondition','studioClosure','campaignLegacy'])visit((state as unknown as Record<string,unknown>)[key])
 return values.sort((a,b)=>a-b)
}
it('P16 D ceremony actual13M sale intake pays partial claims once before one archival and replays',()=>{
 const path=process.env.P16_JOIN_PREC48_PATH
 expect(path,'qualified original48 publicpre162 capture binding').toBeTruthy()
 const bytes=readFileSync(path!)
 expect(sha(bytes)).toBe('cd11f369558e09f1d65d8e848374ea028f4c5f666c168b5527e48c098cfdfb19')
 const raw=JSON.parse(bytes.toString()),rawBefore=JSON.stringify(raw),old=validateSaveP15B(raw)
 expect(old.saveVersion).toBe(48);expect(old.state.market.tick).toBe(162)
 let state=convertV48ToV49(old).state
 expect(JSON.stringify(raw)).toBe(rawBefore);makeSave(state)
 const beforeC=JSON.stringify(state),prior=state
 state=tick(state);expect(JSON.stringify(prior)).toBe(beforeC);makeSave(state)
 const closure=state.studioClosure.closures.find(c=>c.studioId===R04)!
 expect(closure).toBeDefined();expect(closure.closureWeek).toBe(163)
 expect(closure.cash.closing).toBeLessThan(0);expect(closure.loan!.remainder).toBeGreaterThan(0)
 expect(closure.dispositions.filter(d=>d.subjectKind==='theatricalRun')).toEqual([])
 while(state.market.tick<175){const oldState=state,before=JSON.stringify(state);state=tick(state);expect(JSON.stringify(oldState)).toBe(before)}
 makeSave(state)
 const player=state.hollywood!.playerStudioId,estate=state.rights.estates.find(e=>e.closureId===closure.closureId)!
 expect(estate).toBeDefined();expect(estate.closesWeek).toBe(176);expect(estate.closedWeek).toBeNull()
 // One fixed identified original R04 R2 subject; never try a different asset if unavailable.
 const lot=estate.lots.find(l=>l.subjects.length===1&&l.subjects[0]!.right==='R2'&&l.subjects[0]!.filmId===FILM)!
 expect(lot,'fixed clean original R04film0 lot premise').toBeDefined()
 expect(lot.status).toBe('open');expect(lot.encumbrances).toEqual([]);expect(lot.minimumBid).toBeLessThanOrEqual(BID)
 expect(conditionRecord(state,player)?.condition).toMatchObject({stage:'stable',week:175})
 expect(outstandingLoan(state,player,176)).toBeUndefined()
 expect(spendableCash(state,player)-BID).toBeGreaterThanOrEqual(postPurchaseReserve(state,player))
 const request={estateId:estate.estateId,lotId:lot.lotId,bidderId:player,amount:BID}
 expect(estateBidRefusal(state,request,175)).toBeNull()
 const beforeBid=JSON.stringify(state),withoutBid=state
 const bidState=applyActions(state,[{kind:'submitEstateBid',estateId:estate.estateId,lotId:lot.lotId,amount:BID}])
 expect(JSON.stringify(state)).toBe(beforeBid);makeSave(bidState)
 expect(bidState.studio.cash).toBe(state.studio.cash)
 expect(estateBidRefusal(bidState,request,176)).toBe('estateClosed')
 const own=bidState.studioClosure.claims.filter(c=>c.closureId===closure.closureId).sort((a,b)=>a.sourceContractId<b.sourceContractId?-1:a.sourceContractId>b.sourceContractId?1:a.claimId<b.claimId?-1:a.claimId>b.claimId?1:0)
 expect(own.length).toBeGreaterThan(0);expect(own.every(c=>c.paid===0&&c.unpaid===c.original)).toBe(true)
 const startingEstateCash=cash(bidState,R04),beforeD=JSON.stringify(bidState)
 // Tested action: temporary joined-D failclosed must remain the actual pre-fix RED.
 const final=tick(bidState)
 expect(JSON.stringify(bidState)).toBe(beforeD);makeSave(final)
 const controlBefore=JSON.stringify(withoutBid),control=tick(withoutBid)
 expect(JSON.stringify(withoutBid)).toBe(controlBefore);makeSave(control)
 const result=final.rights.estates.find(e=>e.estateId===estate.estateId)!
 const transactions=final.rights.transactions.filter(t=>t.estateId===estate.estateId&&t.kind==='estateSale')
 expect(transactions).toHaveLength(1)
 const tx=transactions[0]!
 expect(tx).toMatchObject({week:176,payerId:player,payeeId:null,amount:BID,lotId:lot.lotId})
 expect(result.proceeds).toEqual([{transactionId:tx.id,lotId:lot.lotId,amount:BID}])
 expect(final.studio.cash-control.studio.cash).toBe(-BID)
 // Round 8: compare with the same ordinary tick without the bid, so payroll and natural career changes
 // remain legitimate while an estate title purchase cannot transfer any person or employment authority.
 expect(final.hollywood!.employment).toEqual(control.hollywood!.employment)
 expect(final.hollywood!.activeEmploymentOrdinals).toEqual(control.hollywood!.activeEmploymentOrdinals)
 expect(final.contracts).toEqual(control.contracts)
 expect(final.freeAgents).toEqual(control.freeAgents)
 expect(currentHolder(final,{right:'R2',filmId:FILM},176)).toMatchObject({kind:'holder',holderId:player})
 const events=final.studioClosure.estateEvents.filter(e=>e.closureId===closure.closureId&&e.week===176)
 const intake=events.filter(e=>String(e.kind)==='saleReceipt'),distribution=events.filter(e=>e.kind==='distribution'),archive=events.filter(e=>e.kind==='archival')
 expect(intake).toHaveLength(1);expect(distribution).toHaveLength(1);expect(archive).toHaveLength(1)
 expect(intake[0]).toMatchObject({reference:tx.id,amount:BID,phaseId:'p16.estateSale',phaseOrderVersion:3,phaseOrdinal:2})
 expect(distribution[0]).toMatchObject({reference:closure.closureId,phaseId:'p15b.closure',phaseOrderVersion:3,phaseOrdinal:5})
 expect(archive[0]).toMatchObject({reference:closure.closureId,amount:0,phaseId:'p15b.closure',phaseOrderVersion:3,phaseOrdinal:5})
 expect(intake[0]!.p15DomainSequence).toBeLessThan(distribution[0]!.p15DomainSequence)
 expect(distribution[0]!.p15DomainSequence).toBeLessThan(archive[0]!.p15DomainSequence)
 // This exact captured route has no active runs; do not claim nonzero run intake coverage.
 const run=events.filter(e=>e.kind==='runReceipt');expect(run).toEqual([])
 const runTotal=run.reduce((n,e)=>n+e.amount,0)
 let available=Math.floor(Math.max(0,startingEstateCash+BID+runTotal)),paidTotal=0
 expect(available).toBeGreaterThan(0);expect(available).toBeLessThan(own.reduce((n,c)=>n+c.unpaid,0))
 for(const claim of own){
  const amount=Math.min(available,claim.unpaid);available-=amount;paidTotal+=amount
  const actual=final.studioClosure.claims.find(c=>c.claimId===claim.claimId)!
  expect(actual.paid).toBe(claim.paid+amount);expect(actual.unpaid).toBe(claim.unpaid-amount)
  expect(actual.original).toBe(actual.paid+actual.unpaid)
  expect(actual.payments).toEqual([...claim.payments,...(amount>0?[{week:176,amount,reference:distribution[0]!.eventId}]:[])])
  expect(actual.status).toBe(actual.paid===actual.original?'paid':actual.paid===0?'unpaidArchived':'partiallyPaid')
 }
 expect(distribution[0]!.amount).toBe(paidTotal)
 expect(cash(final,R04)).toBeCloseTo(startingEstateCash+BID+runTotal-paidTotal,6)
 const periods=final.hollywood!.businesses.find(b=>b.studioId===R04)!.account.periods
 const priorPeriods=bidState.hollywood!.businesses.find(b=>b.studioId===R04)!.account.periods
 const movement=(rows:typeof periods,key:string)=>rows.reduce((n,p)=>n+((p.movements as unknown as Record<string,number>)[key]??0),0)
 expect(movement(periods,'estateSaleProceeds')-movement(priorPeriods,'estateSaleProceeds')).toBe(BID)
 expect(movement(periods,'claimPayment')-movement(priorPeriods,'claimPayment')).toBe(-paidTotal)
 expect(final.studioClosure.closures.find(c=>c.closureId===closure.closureId)).toEqual(closure)
 expect(result.closedWeek).toBe(176)
 expect(result.lots.filter(l=>l.lotId!==lot.lotId).every(l=>l.status==='archived')).toBe(true)
 expect(result.pending.every(p=>p.status==='archived')).toBe(true)
 const appended=sequences(final).filter(n=>n>=bidState.p15Sequence.next)
 expect(new Set(appended).size).toBe(appended.length)
 expect(appended).toEqual(Array.from({length:final.p15Sequence.next-bidState.p15Sequence.next},(_,i)=>bidState.p15Sequence.next+i))
 const json=exportCurrentState(final),reloaded=migrateToLive(importSave(json)).state
 expect(exportCurrentState(reloaded)).toBe(json)
 // Compare two independent successors, then inspect that exact admitted successor.
 const next=tick(final),reloadedNext=tick(reloaded)
 expect(stableStringify(makeSave(reloadedNext))).toBe(stableStringify(makeSave(next)))
 expect(next.studioClosure.estateEvents.filter(e=>e.closureId===closure.closureId&&String(e.kind)==='saleReceipt')).toHaveLength(1)
 expect(next.studioClosure.estateEvents.filter(e=>e.closureId===closure.closureId&&e.kind==='archival')).toHaveLength(1)
})
