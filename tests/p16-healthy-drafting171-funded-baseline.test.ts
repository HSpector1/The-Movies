// UNRUN one fixed eight-tick diagnostic; not healthy drafting feature acceptance.
import {describe,it,expect,vi} from 'vitest'
import {readFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import * as saves from '../src/core/save.js'
import type {GameState} from '../src/core/types.js'
import {currentHolder} from '../src/core/rights.js'
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
function v2(state:GameState,id:string){const record=state.rights.absorptions.find(a=>a.id===id)!;expect(record).toBeDefined();if(record.producerVersion!=='absorption-scripts/v2')throw new Error('actual scripts/v2 producer required');return record}
function completed(p:ReturnType<typeof prepared>){
 const result=closeAbsorption(p.paid.state,p.input,171);pureOriginal(p)
 const found=result.rights.absorptions.find(a=>a.targetId===TARGET)!,record=v2(result,found.id)
 expect(record.stoppedScripts).toHaveLength(p.quote.scripts.length)
 expect(record.stoppedScripts.map(s=>s.scriptProjectId)).toEqual(p.quote.scripts.map(s=>s.scriptProjectId))
 expect(record.stoppedScripts.some(s=>s.scriptProjectId==='script-0014')).toBe(true)
 for(const row of record.stoppedScripts){
  const script=p.source.development.projects.find(s=>s.id===row.scriptProjectId)!,cost=p.source.projects.find(c=>c.scriptProjectId===script.id)!
  expect(row.reason).toBe('writersNotRetained');expect(row.originalScript).toEqual(script);expect(row.originalCosts).toEqual(cost)
  const writers=[...new Set(script.writerIds)]
  expect(row.sourceContractIds).toEqual(writers.map(id=>record.contracts.find(c=>c.talentId===id)!.sourceContractId))
  for(const id of row.sourceContractIds){const link=record.contracts.find(c=>c.sourceContractId===id)!;expect(link.buyerContractId).toBeNull();expect(result.hollywood!.employment.find(e=>e.contractId===id)).toMatchObject({studioId:TARGET,endedWeek:171});expect(result.hollywood!.receipts.filter(r=>r.kind==='employment'&&r.contractId===id&&r.reason==='absorptionExit')).toMatchObject([{week:171,studioId:TARGET}])}
  expect(result.scriptDevelopment.projects.some(s=>s.id===script.id&&s.conceptId===script.conceptId)).toBe(false)
 }
 const target=result.hollywood!.businesses.find(b=>b.studioId===TARGET)!
 expect(target.development.projects).toEqual(p.source.development.projects);expect(target.projects).toEqual(p.source.projects);expect(target.productions).toEqual(p.source.productions)
 expect(record.stoppedProductions).toMatchObject([{productionId:TARGET+':film:12',remainingTicks:8}]);expect(record.continuedProductions).toEqual([])
 expect(result.studio.cash).toBe(p.paid.state.studio.cash-record.outlay);expect(target.account.cash).toBe(0)
 expect(record.outlay).toBe(record.consideration-record.postExitCash);expect(record.postExitCash).toBe(record.cashBeforeExits-record.exitCharges)
 for(const subject of p.quote.rights)expect(currentHolder(result,subject,171)).toMatchObject({kind:'holder',holderId:p.buyer})
 return {result,record,target}
}
function ordinary(state:GameState){let next=state;for(const week of [172,173,174]){const prior=next,before=JSON.stringify(prior);next=tick(prior);expect(JSON.stringify(prior)).toBe(before);expect(next.market.tick).toBe(week)}return next}
describe('P16 real funded171 stopped drafting writeoff',()=>{
 it('real explicit writer exits preserve original draft costs due reservation and concurrent paid film beyond due with no buyer credit progress refund and save replay',()=>{
  const p=prepared(),c=completed(p),text=saves.exportCurrentState(c.result),reload=saves.migrateToLive(saves.importSave(text)).state
  expect(saves.exportCurrentState(reload)).toBe(text)
  const final=ordinary(c.result),replay=ordinary(reload)
  expect(saves.exportCurrentState(final)).toBe(saves.exportCurrentState(replay))
  const target=final.hollywood!.businesses.find(b=>b.studioId===TARGET)!
  expect(target.account.cash).toBe(0);expect(target.development.projects).toEqual(c.target.development.projects);expect(target.projects).toEqual(c.target.projects);expect(target.productions).toEqual(c.target.productions)
  expect(v2(final,c.record.id)).toEqual(c.record)
  expect(target.development.projects.find(s=>s.id==='script-0014')).toMatchObject({status:'drafting',commissionedWeek:170,dueWeek:173,productionId:null})
  expect(final.scriptDevelopment.projects).toEqual(c.result.scriptDevelopment.projects)
  expect(final.hollywood!.receipts.filter(r=>r.studioId===TARGET)).toEqual(c.result.hollywood!.receipts.filter(r=>r.studioId===TARGET))
  expect(final.hollywood!.films.some(f=>f.filmId===TARGET+':film:12')).toBe(false)
  expect(final.ledger.filter(e=>e.kind==='constructionRefund'||e.kind==='facilityDemolitionRefund')).toEqual(c.result.ledger.filter(e=>e.kind==='constructionRefund'||e.kind==='facilityDemolitionRefund'))
  pureOriginal(p)
 })
 it('actual scripts v2 publication rejects missing dispositions wrong writer cost or original body with whole hostile caller purity',()=>{
  const p=prepared(),c=completed(p);saves.makeSave(c.result)
  const changes:Array<{label:string;change:(x:GameState)=>void}>=[
   {label:'all stopped draft rows omitted',change:x=>{v2(x,c.record.id).stoppedScripts=[]}},
   {label:'writer exit link omitted',change:x=>{v2(x,c.record.id).stoppedScripts[0]!.sourceContractIds=[]}},
   {label:'paid development cost invented',change:x=>{v2(x,c.record.id).stoppedScripts[0]!.originalCosts.development+=1}},
   {label:'original source writer body changed',change:x=>{v2(x,c.record.id).stoppedScripts[0]!.originalScript.writerIds=[]}},
   {label:'actual source due boundary moved',change:x=>{x.hollywood!.businesses.find(b=>b.studioId===TARGET)!.development.projects.find(s=>s.id==='script-0014')!.dueWeek=174}}
  ]
  for(const {label,change} of changes){const x=structuredClone(c.result);change(x);const before=JSON.stringify(x);try{expect(()=>saves.makeSave(x),label).toThrow(/absorbed script|absorption|script|development/i)}finally{expect(JSON.stringify(x),label).toBe(before)}}
  pureOriginal(p)
 })
 it('actual joined scripts v2 final publication validation fault cannot expose writer exits cash titles or partial stopped work',()=>{
  const p=prepared();completed(p)
  const real=saves.makeSave,marker='STOPPED_DRAFT171_PUBLICATION_FAULT';let outputs=0
  const spy=vi.spyOn(saves,'makeSave').mockImplementation(state=>{const admitted=real(state);if(admitted.state.rights.absorptions.some(a=>a.targetId===TARGET)){outputs++;throw new Error(marker)}return admitted})
  try{expect(()=>closeAbsorption(p.paid.state,p.input,171)).toThrow(marker);expect(outputs).toBe(1)}finally{spy.mockRestore();pureOriginal(p)}
 })
})
