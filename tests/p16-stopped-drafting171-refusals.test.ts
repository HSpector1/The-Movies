// One fixed eight-tick diagnostic; not healthy drafting feature acceptance. Originally a missing-producer refusal witness; since
// Sprint 7's buyer-side continuation producer the same premise is governed by buyer writing capacity: this buyer has no free
// writing slot, so the retained script quotes continuationRequired/writerCapacityUnavailable and the close refuses with
// retainedScriptCapacityProducerRequired (acquisition.ts close guard). Positive route with capacity: p16-retained-drafting-continuation.
import {describe,it,expect} from 'vitest'
import {readFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import * as saves from '../src/core/save.js'
import {tick} from '../src/core/tick.js'
import {conditionRecord,outstandingLoan} from '../src/core/corporateConditionLive.js'
import {productionPhaseForRemainingTicks} from '../src/core/productionPhases.js'
import {absorptionProducerRefusal,quoteAbsorption,closeAbsorption,absorptionAsk} from '../src/core/acquisition.js'
import {requestDiligence} from '../src/core/dueDiligence.js'
import {terminationCost} from '../src/core/employment.js'
import {libraryValuationV1} from '../src/core/propertyValuation.js'
import {permittedBidderRefusal,spendableCash} from '../src/core/rightsFinance.js'
const TARGET='studio-aca408ec-r01'
function prepared(){
  const root=process.env.P16_ORIGINAL48_CAPTURE_ROOT;expect(root).toBeTruthy()
  const bytes=readFileSync(root+'/r04-actual163.save48.json')
  expect(createHash('sha256').update(bytes).digest('hex')).toBe('c17b7aa82bd09e6988867e149ed0266803d8e432cfcd8842d9c2aca1f7ace8ad')
  const raw=JSON.parse(bytes.toString()),rawBefore=JSON.stringify(raw),old=saves.validateSaveP15B(raw),oldBefore=JSON.stringify(old)
  const initial=saves.convertV48ToV49(old).state
  expect(JSON.stringify(raw)).toBe(rawBefore);expect(JSON.stringify(old)).toBe(oldBefore)
  expect(initial.market.tick).toBe(163)
  const original=initial.hollywood!.businesses.find(b=>b.studioId===TARGET)!
  expect(original.productions).toMatchObject([{id:TARGET+':film:13',remainingTicks:7}])
  const oldIds=new Set(original.development.projects.map(p=>p.id)),initialBefore=JSON.stringify(initial)
  let state=initial
  for(let input=163;input<=170;input++){
   expect(state.market.tick).toBe(input);const prior=state,before=JSON.stringify(prior)
   state=tick(prior);expect(JSON.stringify(prior)).toBe(before);expect(state.market.tick).toBe(input+1)
  }
  const beforeAdmission=JSON.stringify(state);saves.makeSave(state);expect(JSON.stringify(state)).toBe(beforeAdmission)
  const source=state.hollywood!.businesses.find(b=>b.studioId===TARGET)!
  const active=source.activeScriptOrdinals.map(i=>source.development.projects[i]!)
  const snapshot={week:state.market.tick,studioId:TARGET,condition:conditionRecord(state,TARGET)?.condition,
   cash:source.account.cash,decisionWeek:source.nextDecisionWeek,
   activeProductions:source.productions.map(p=>({id:p.id,remainingTicks:p.remainingTicks,phase:productionPhaseForRemainingTicks(p.remainingTicks)})),
   activeScripts:active.map(p=>({id:p.id,status:p.status,commissionedWeek:p.commissionedWeek,dueWeek:p.dueWeek,productionId:p.productionId,reservation:p.reservation})),
   newScriptIds:active.filter(p=>!oldIds.has(p.id)).map(p=>p.id)}
  console.info('P16_FIXED_DRAFT171_OBSERVATION '+JSON.stringify(snapshot))
  // Stop on the first absent premise. Existing script0015 or a greenlit older project is not a substitute.
  expect(state.market.tick).toBe(171)
  const fresh=active.filter(p=>!oldIds.has(p.id)&&p.status==='drafting')
  expect(fresh,'fixed route must actually produce new active drafting, no existing-project fallback').toHaveLength(1)
  expect(fresh[0]!.commissionedWeek).toBe(170)
  expect(source.productions).toHaveLength(1)
  const concurrent=source.productions[0]!
  expect(concurrent).toMatchObject({id:TARGET+':film:12',startTick:170,remainingTicks:8})
  const screenplay=active.find(p=>p.id==='script-0012')!
  expect(screenplay).toMatchObject({status:'inProduction',commissionedWeek:155,productionId:concurrent.id,dueWeek:null})
  expect(oldIds.has(screenplay.id)).toBe(true)
  const concurrentCost=source.projects.find(p=>p.scriptProjectId===screenplay.id)!
  expect(concurrentCost).toMatchObject({productionId:concurrent.id,conceptId:concurrent.conceptId,announcedWeek:170,production:concurrent.budget.negative,marketing:concurrent.budget.marketing})
  expect(concurrentCost.production).toBeGreaterThan(0)
  expect(state.hollywood!.receipts.filter(r=>r.studioId===TARGET&&r.kind==='filmAnnounced'&&r.productionId===concurrent.id)).toMatchObject([{week:170,conceptId:concurrent.conceptId}])
  expect(conditionRecord(state,TARGET)?.condition).toMatchObject({stage:'stable',week:171})
  expect(outstandingLoan(state,TARGET,171)).toBeUndefined()
  const buyer=state.hollywood!.playerStudioId
  expect(conditionRecord(state,buyer)?.condition).toMatchObject({stage:'stable',week:171})
  expect(outstandingLoan(state,buyer,171)).toBeUndefined();expect(permittedBidderRefusal(state,buyer,171)).toBeNull()
  const paid=requestDiligence(state,{recipientId:buyer,target:{kind:'studio',studioId:TARGET},scope:['rights','employment','liabilities']},171)
  expect(JSON.stringify(state)).toBe(beforeAdmission)
  expect(paid.record).toMatchObject({week:171,recipientId:buyer,target:{kind:'studio',studioId:TARGET},scope:['rights','employment','liabilities']})
  expect(paid.record.fee).toBeGreaterThan(0);expect(paid.state.studio.cash).toBe(state.studio.cash-paid.record.fee)
  const paidBefore=JSON.stringify(paid.state);saves.makeSave(paid.state);expect(JSON.stringify(paid.state)).toBe(paidBefore)
  const employment=state.hollywood!.activeEmploymentOrdinals.map(i=>state.hollywood!.employment[i]!).filter(e=>e.studioId===TARGET&&e.endedWeek===null&&e.terms.startWeek<=171&&171<e.terms.endWeekExclusive)
  expect(employment.length).toBeGreaterThan(0)
  const exits=employment.reduce((sum,e)=>sum+terminationCost(e.terms,171),0),postExitCash=source.account.cash-exits
  const library=libraryValuationV1(paid.state,TARGET,171);expect(library.kind).toBe('available')
  if(library.kind!=='available')throw new Error('fixed171 library valuation prerequisite absent')
  const consideration=Math.ceil(absorptionAsk(library.total,postExitCash))
  const preview={buyerId:buyer,targetId:TARGET,consideration,retention:{kind:'explicit' as const,contractIds:[] as string[]},disclosureId:paid.record.id}
  const quote=quoteAbsorption(paid.state,preview,171)
  expect(quote.kind,'fixed real paid quote, no alternate date amount buyer or retention').toBe('quote')
  if(quote.kind!=='quote')throw new Error(quote.refusal)
  expect(quote.affordable).toBe(true)
  expect(quote.exitCharges).toBe(exits);expect(quote.postExitCash).toBe(postExitCash)
  expect(quote.outlay).toBe(consideration-postExitCash)
  expect(spendableCash(paid.state,buyer)-quote.outlay).toBeGreaterThanOrEqual(quote.reserveAfter)
  expect(quote.contracts.every(c=>!c.retained)).toBe(true)
  expect(quote.productions).toMatchObject([{productionId:TARGET+':film:12',remainingTicks:8,phase:'development',disposition:'cancelRequired'}])
  const input={...preview,quotedAtWeek:quote.quotedAtWeek,quoteAgePolicyVersion:quote.quoteAgePolicyVersion}
  console.info('P16_FIXED_FUNDED_DRAFT171 '+JSON.stringify({week:171,buyerId:buyer,targetId:TARGET,scriptId:fresh[0]!.id,fee:paid.record.fee,consideration,exitCharges:exits,postExitCash,outlay:quote.outlay,reserve:quote.reserveAfter,affordable:quote.affordable,productionVerdicts:quote.productions}))
  expect(absorptionProducerRefusal(paid.state,input)).toBeNull()
  expect(quote.scripts.length).toBeGreaterThan(0)
  expect(quote.scripts.every(q=>q.disposition==='writeOff'&&q.reason==='writersNotRetained')).toBe(true)
  return {raw,rawBefore,old,oldBefore,initial,initialBefore,state,beforeAdmission,source,buyer,paid,paidBefore,quote,input,fresh}
}
function pureOriginal(p:ReturnType<typeof prepared>){
 expect(JSON.stringify(p.paid.state)).toBe(p.paidBefore);expect(JSON.stringify(p.state)).toBe(p.beforeAdmission)
 expect(JSON.stringify(p.initial)).toBe(p.initialBefore);expect(JSON.stringify(p.raw)).toBe(p.rawBefore);expect(JSON.stringify(p.old)).toBe(p.oldBefore)
}
function capacityRefused(p:ReturnType<typeof prepared>,retention:{kind:'default'}|{kind:'explicit';contractIds:string[]}){
 const library=libraryValuationV1(p.paid.state,TARGET,171);expect(library.kind).toBe('available')
 if(library.kind!=='available')throw new Error('actual171 fixed library premise absent')
 // One public whole ask using all actual source cash before exits; never retry another amount.
 const consideration=Math.ceil(absorptionAsk(library.total,p.source.account.cash))
 const preview={buyerId:p.buyer,targetId:TARGET,consideration,retention,disclosureId:p.paid.record.id}
 const quote=quoteAbsorption(p.paid.state,preview,171)
 expect(quote.kind,'fixed retained-writer quote remains genuine and affordable').toBe('quote')
 if(quote.kind!=='quote')throw new Error(quote.refusal)
 expect(quote.affordable).toBe(true)
 expect(quote.scripts).toHaveLength(p.quote.scripts.length)
 console.info('S9_DRAFT171_QUOTE_SCRIPTS '+JSON.stringify({retention,scripts:quote.scripts,contracts:quote.contracts.map(c=>({contractId:c.contractId,retained:c.retained}))}))
 expect(quote.scripts.every(q=>q.disposition==='continuationRequired'&&q.reason==='writerCapacityUnavailable')).toBe(true)
 const input={...preview,quotedAtWeek:quote.quotedAtWeek,quoteAgePolicyVersion:quote.quoteAgePolicyVersion}
 expect(absorptionProducerRefusal(p.paid.state,input)).toBeNull()
 try{expect(()=>closeAbsorption(p.paid.state,input,171)).toThrow(/retainedScriptCapacityProducerRequired/)}finally{pureOriginal(p)}
 saves.makeSave(p.paid.state)
}
describe('P16 real171 drafting continuation at the buyer writing capacity limit (continuation producer present since Sprint 7)',()=>{
 it('default writer choice quotes continuation required for writer capacity and the close refuses with the capacity producer, never converting drafting to writeoff',()=>{
  const p=prepared()
  expect(p.quote.scripts.every(q=>q.disposition==='writeOff')).toBe(true)
  capacityRefused(p,{kind:'default'})
 })
 it('explicit retention of all drafting writers in a partial company selection quotes the same capacity requirement and preserves all original input',()=>{
  const p=prepared(),writers=[...new Set(p.source.development.projects.filter(s=>s.status==='drafting'||s.status==='rewriting').flatMap(s=>s.writerIds))]
  expect(writers.length).toBeGreaterThan(0)
  const contractIds=writers.map(id=>{const row=p.state.hollywood!.activeEmploymentOrdinals.map(i=>p.state.hollywood!.employment[i]!).find(e=>e.studioId===TARGET&&e.terms.talentId===id&&e.endedWeek===null&&e.terms.startWeek<=171&&171<e.terms.endWeekExclusive);expect(row).toBeDefined();return row!.contractId})
  expect(contractIds.length).toBeLessThan(p.quote.contracts.length)
  capacityRefused(p,{kind:'explicit',contractIds})
 })
})
