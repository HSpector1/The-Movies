// NEW D negatives on the single qualified pre162→C163→fixed13M bid175 route.
// No alternative lot/bid, clocks/cash/history injections, or successful validator substitute.
import { describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import * as saves from '../src/core/save.js'
import { tick } from '../src/core/tick.js'
import { applyActions } from '../src/core/actions.js'
import { conditionRecord, outstandingLoan } from '../src/core/corporateConditionLive.js'
import { estateBidRefusal } from '../src/core/estate.js'
import { spendableCash, postPurchaseReserve } from '../src/core/rightsFinance.js'
import type { GameState } from '../src/core/types.js'
const R04='studio-aca408ec-r04',FILM='studio-aca408ec-r04:film:0',BID=13_000_000
let cached:{beforeD:GameState;final:GameState;closureId:string;txId:string}|undefined
function admitted(state:GameState) {
 const before=JSON.stringify(state),saved=saves.makeSave(state)
 expect(saved.saveVersion).toBe(saves.LIVE_SAVE_VERSION)
 expect(JSON.stringify(saved.state)).toBe(before)
 expect(JSON.stringify(state)).toBe(before)
}
function route() {
 if(cached===undefined) {
  const path=process.env.P16_JOIN_PREC48_PATH;expect(path).toBeTruthy()
  const bytes=readFileSync(path!);expect(createHash('sha256').update(bytes).digest('hex')).toBe('cd11f369558e09f1d65d8e848374ea028f4c5f666c168b5527e48c098cfdfb19')
  const raw=JSON.parse(bytes.toString()),original=JSON.stringify(raw),old=saves.validateSaveP15B(raw)
  expect(old.state.market.tick).toBe(162)
  let state=saves.convertV48ToV49(old).state;admitted(state)
  while(state.market.tick<175){const input=state,before=JSON.stringify(input);state=tick(input);expect(JSON.stringify(input)).toBe(before)}
  admitted(state)
  const closure=state.studioClosure.closures.find(c=>c.studioId===R04)!
  expect(closure).toBeDefined();expect(closure.closureWeek).toBe(163)
  expect(closure.dispositions.filter(d=>d.subjectKind==='theatricalRun')).toEqual([])
  const estate=state.rights.estates.find(e=>e.closureId===closure.closureId)!
  expect(estate).toBeDefined();expect(estate.closedWeek).toBeNull();expect(estate.closesWeek).toBe(176)
  const lot=estate.lots.find(l=>l.subjects.length===1&&l.subjects[0]!.right==='R2'&&l.subjects[0]!.filmId===FILM)!
  expect(lot,'fixed existingFILM0 clean lot premise').toBeDefined();expect(lot.encumbrances).toEqual([])
  const player=state.hollywood!.playerStudioId
  expect(conditionRecord(state,player)?.condition).toMatchObject({stage:'stable',week:175})
  expect(outstandingLoan(state,player,176)).toBeUndefined()
  expect(spendableCash(state,player)-BID).toBeGreaterThanOrEqual(postPurchaseReserve(state,player))
  expect(estateBidRefusal(state,{estateId:estate.estateId,lotId:lot.lotId,bidderId:player,amount:BID},175)).toBeNull()
  const input=state,before=JSON.stringify(input)
  const beforeD=applyActions(input,[{kind:'submitEstateBid',estateId:estate.estateId,lotId:lot.lotId,amount:BID}]);admitted(beforeD)
  expect(JSON.stringify(input)).toBe(before)
  const beforeTick=JSON.stringify(beforeD),final=tick(beforeD);admitted(final)
  expect(JSON.stringify(beforeD)).toBe(beforeTick);expect(JSON.stringify(raw)).toBe(original)
  expect(final.market.tick).toBe(176)
  const txs=final.rights.transactions.filter(t=>t.estateId===estate.estateId&&t.kind==='estateSale')
  expect(txs).toHaveLength(1);expect(txs[0]).toMatchObject({week:176,amount:BID,payerId:player,payeeId:null})
  const receipts=final.studioClosure.estateEvents.filter(e=>e.closureId===closure.closureId&&String(e.kind)==='saleReceipt')
  expect(receipts).toHaveLength(1);expect(receipts[0]).toMatchObject({reference:txs[0]!.id,amount:BID,week:176})
  expect(final.studioClosure.estateEvents.filter(e=>e.closureId===closure.closureId&&e.kind==='archival')).toHaveLength(1)
  expect(final.rights.estates.find(e=>e.estateId===estate.estateId)!.closedWeek).toBe(176)
  // Memo is private and never given to callers: each leaf gets a detached fresh copy.
  cached={beforeD:structuredClone(beforeD),final:structuredClone(final),closureId:closure.closureId,txId:txs[0]!.id}
 }
 return structuredClone(cached)
}
function rejectPure(label:string,state:GameState) {
 const bytes=JSON.stringify(state),envelope={saveVersion:saves.P16_SAVE_VERSION,seed:state.seed,state,broadcastCache:state.broadcastItems}
 const observe=(run:()=>unknown):string=>{
  let caught:unknown
  try {run()} catch(error) {caught=error}
  expect(caught,label+' must actually refuse after admitted positiveD baseline').toBeInstanceOf(Error)
  const message=(caught as Error).message
  expect(message.trim().length,label+' refusal message').toBeGreaterThan(0)
  return message
 }
 try {
  const strict49=observe(()=>saves.validateSaveV49(envelope))
  const writer=observe(()=>saves.makeSave(state))
  // Same full-reader category through its direct and writer entry, with measured first cause retained.
  expect(writer,label+' writer/direct refusal identity').toBe(strict49)
  console.info(JSON.stringify({proof:'p16-D-hostile-first-refusal',label,strict49,writer}))
 } finally {expect(JSON.stringify(state)).toBe(bytes)}
}
describe('P16 joinedD strict-save corruption and actual publication rollback',()=>{
 it('refuses missing duplicate amount and foreign saleReceipt without mutating the admitted source',()=>{
  const {final,closureId}=route(),before=JSON.stringify(final);admitted(final)
  const receipt=final.studioClosure.estateEvents.find(e=>e.closureId===closureId&&String(e.kind)==='saleReceipt')!
  expect(receipt).toBeDefined()
  const missing=structuredClone(final);missing.studioClosure.estateEvents=missing.studioClosure.estateEvents.filter(e=>e.eventId!==receipt.eventId);rejectPure('missing-saleReceipt',missing)
  const duplicate=structuredClone(final);duplicate.studioClosure.estateEvents.push({...receipt});rejectPure('duplicate-saleReceipt',duplicate)
  const amount=structuredClone(final);amount.studioClosure.estateEvents.find(e=>e.eventId===receipt.eventId)!.amount+=1;rejectPure('amount-saleReceipt',amount)
  const foreign=structuredClone(final);foreign.studioClosure.estateEvents.find(e=>e.eventId===receipt.eventId)!.reference='rights-transaction-not-this-estate';rejectPure('foreign-saleReceipt',foreign)
  expect(JSON.stringify(final)).toBe(before)
 })
 it('refuses extra estateSaleProceeds and an extra buyer rights debit even with their matching cash changes',()=>{
  const {final}=route(),before=JSON.stringify(final);admitted(final)
  const extra=structuredClone(final),business=extra.hollywood!.businesses.find(b=>b.studioId===R04)!
  const period=business.account.periods.find(p=>p.fromWeek<=176&&p.throughWeek>=176)!
  expect(period).toBeDefined()
  const movements=period.movements as unknown as Record<string,number>
  expect(movements.estateSaleProceeds).toBe(BID)
  movements.estateSaleProceeds+=1;period.closing+=1;business.account.cash+=1;rejectPure('extra-estateSaleProceeds',extra)
  const debit=structuredClone(final),actual=debit.ledger.find(r=>r.week===176&&r.kind==='rightsConsideration'&&r.amount===-BID)!
  expect(actual).toBeDefined()
  debit.ledger.push({...actual,amount:-1});debit.studio.cash-=1;rejectPure('extra-buyer-rights-debit',debit)
  expect(JSON.stringify(final)).toBe(before)
 })
 it('a real strict49 D publication refusal cannot publish partial sale cash claims or archival',()=>{
  const {beforeD,final,closureId,txId}=route();admitted(beforeD);admitted(final)
  const before=JSON.stringify(beforeD),real=saves.validateSaveP18,marker='P16_REAL_D_PUBLICATION_REFUSAL' // P18: the live publication reader
  const spy=vi.spyOn(saves,'validateSaveP18').mockImplementation(envelope=>{
   const admitted=real(envelope)
   expect(admitted.state.market.tick).toBe(176)
   expect(admitted.state.studioClosure.estateEvents.some(e=>e.closureId===closureId&&String(e.kind)==='saleReceipt'&&e.reference===txId)).toBe(true)
   expect(admitted.state.studioClosure.estateEvents.some(e=>e.closureId===closureId&&e.kind==='archival')).toBe(true)
   throw new Error(marker)
  })
  try {expect(()=>tick(beforeD)).toThrow(marker);expect(spy).toHaveBeenCalled()}
  finally {spy.mockRestore();expect(JSON.stringify(beforeD)).toBe(before)}
 })
})
