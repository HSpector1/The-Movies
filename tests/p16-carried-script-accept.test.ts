// UNRUN one fixed eight-tick diagnostic; not healthy drafting feature acceptance.
import {describe,it,expect,vi} from 'vitest'
import {readFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import * as saves from '../src/core/save.js'
import * as nativeScript from '../src/core/scriptDevelopment.js'
import {scriptProjectsReadModel} from '../src/core/scriptReadModel.js'
import {applyActions} from '../src/core/actions.js'
import type {GameState} from '../src/core/types.js'
import {assessFirstDraft} from '../src/core/scriptDevelopment.js'
import {developmentOfficeEstUplift} from '../src/core/facilityEffects.js'
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
  let beforeAdmission=JSON.stringify(state);saves.makeSave(state);expect(JSON.stringify(state)).toBe(beforeAdmission)
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
  const unactivated=state,unactivatedBefore=JSON.stringify(state)
  expect(state.scriptDevelopment).toMatchObject({mode:'legacy',projects:[]})
  state=applyActions(unactivated,[{kind:'activateScriptDevelopment'}])
  expect(JSON.stringify(unactivated)).toBe(unactivatedBefore)
  expect(state.scriptDevelopment).toMatchObject({mode:'managed',projects:[]})
  expect(state.studio.cash).toBe(unactivated.studio.cash);expect(state.ledger).toEqual(unactivated.ledger)
  expect(state.operations).toEqual(unactivated.operations)
  beforeAdmission=JSON.stringify(state);saves.makeSave(state);expect(JSON.stringify(state)).toBe(beforeAdmission)
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
  return {raw,rawBefore,old,oldBefore,initial,initialBefore,state,beforeAdmission,source,buyer,paid,paidBefore,quote,input,fresh,unactivated,unactivatedBefore}
}
function pureOriginal(p:ReturnType<typeof prepared>){
 expect(JSON.stringify(p.unactivated)).toBe(p.unactivatedBefore)
 expect(JSON.stringify(p.paid.state)).toBe(p.paidBefore);expect(JSON.stringify(p.state)).toBe(p.beforeAdmission)
 expect(JSON.stringify(p.initial)).toBe(p.initialBefore);expect(JSON.stringify(p.raw)).toBe(p.rawBefore);expect(JSON.stringify(p.old)).toBe(p.oldBefore)
}
function scriptRecord(state:GameState,id:string){const record=state.rights.absorptions.find(a=>a.id===id)!;if(!record||(record.producerVersion!=='absorption-scripts/v3'&&record.producerVersion!=='absorption-scripts/v4'))throw new Error('actual scripts/v3 producer required');return record}
function carriedProject(state:GameState,id:string){const row=scriptRecord(state,id).continuedScripts.find(row=>row.sourceScriptProjectId==='script-0014');expect(row).toBeDefined();return row!.project}
function retained(p:ReturnType<typeof prepared>,kind:'default'|'explicit'){
 const script=p.source.development.projects.find(s=>s.id==='script-0014')!
 expect(script).toMatchObject({status:'drafting',commissionedWeek:170,dueWeek:173,productionId:null})
 const writers=[...new Set(script.writerIds)]
 const contractIds=writers.map(id=>{const e=p.state.hollywood!.activeEmploymentOrdinals.map(i=>p.state.hollywood!.employment[i]!).find(e=>e.studioId===TARGET&&e.terms.talentId===id&&e.endedWeek===null&&e.terms.startWeek<=171&&171<e.terms.endWeekExclusive);expect(e).toBeDefined();return e!.contractId})
 const retention=kind==='default'?{kind:'default' as const}:{kind:'explicit' as const,contractIds}
 const library=libraryValuationV1(p.paid.state,TARGET,171);expect(library.kind).toBe('available');if(library.kind!=='available')throw new Error('fixed library premise')
 const consideration=Math.ceil(absorptionAsk(library.total,p.source.account.cash))
 const preview={buyerId:p.buyer,targetId:TARGET,consideration,retention,disclosureId:p.paid.record.id}
 const quote=quoteAbsorption(p.paid.state,preview,171);expect(quote.kind).toBe('quote');if(quote.kind!=='quote')throw new Error(quote.refusal)
 expect(quote.affordable).toBe(true)
 for(const id of contractIds)expect(quote.contracts.find(c=>c.contractId===id)?.retained,'each actual required writer retains the real bargain').toBe(true)
 const input={...preview,quotedAtWeek:quote.quotedAtWeek,quoteAgePolicyVersion:quote.quoteAgePolicyVersion}
 const result=closeAbsorption(p.paid.state,input,171);pureOriginal(p)
 const record=result.rights.absorptions.find(a=>a.targetId===TARGET)!
 const scripts=scriptRecord(result,record.id).continuedScripts
 const rows=scripts.filter(row=>row.sourceScriptProjectId===script.id)
 expect(rows).toHaveLength(1);const row=rows[0]!,carried=row.project
 expect(row.originalScript).toEqual(script)
 expect(row.originalCosts).toEqual(p.source.projects.find(cost=>cost.scriptProjectId===script.id))
 expect(row.sourceContractIds).toEqual(contractIds)
 expect(row.buyerContractIds).toEqual(contractIds.map(id=>record.contracts.find(c=>c.sourceContractId===id)!.buyerContractId))
 expect(result.scriptDevelopment.projects).toEqual(p.paid.state.scriptDevelopment.projects)
 expect(carried.id).not.toBe(script.id)
 expect(carried.id).toMatch(/^absorbed-script-[1-9][0-9]*$/)
 expect(Number(carried.id.slice('absorbed-script-'.length))).toBeLessThan(result.rights.nextId)
 expect(row.reservationAtClose).toEqual(carried.reservation)
 expect(carried).toMatchObject({conceptId:script.conceptId,status:'drafting',commissionedWeek:170,dueWeek:173,productionId:null,writerIds:script.writerIds,writerId:script.writerId,shape:script.shape,promise:script.promise,rewriteCount:script.rewriteCount,assessment:script.assessment})
 expect(carried.reservation).not.toBeNull()
 expect(result.operations.facilities.some(f=>f.id===carried.reservation!.facilityId&&f.capability===carried.reservation!.capability)).toBe(true)
 for(const id of contractIds){const source=p.state.hollywood!.employment.find(e=>e.contractId===id)!,link=record.contracts.find(c=>c.sourceContractId===id)!
  expect(link.buyerContractId).not.toBeNull();const buyer=result.hollywood!.employment.find(e=>e.contractId===link.buyerContractId)!
  expect(buyer.studioId).toBe(p.buyer);expect(buyer.terms).toEqual({...source.terms,startWeek:171,termWeeks:source.terms.endWeekExclusive-171})
 }
 expect(result.ledger.filter(e=>e.kind==='signingBonus')).toEqual(p.paid.state.ledger.filter(e=>e.kind==='signingBonus'))
 expect(result.hollywood!.businesses.find(b=>b.studioId===TARGET)!.development.projects).toEqual(p.source.development.projects)
 expect(result.hollywood!.businesses.find(b=>b.studioId===TARGET)!.projects).toEqual(p.source.projects)
 saves.makeSave(result)
 return {result,record,script,carried,input}
}
function step(state:GameState){const before=JSON.stringify(state),next=tick(state);expect(JSON.stringify(state)).toBe(before);return next}
function completion(kind:'default'|'explicit'){
 const p=prepared(),c=retained(p,kind),second=step(c.result)
 expect(second.market.tick).toBe(172)
 expect(carriedProject(second,c.record.id)).toMatchObject({status:'drafting',dueWeek:173,assessment:null})
 const text=saves.exportCurrentState(second),reload=saves.migrateToLive(saves.importSave(text)).state
 expect(saves.exportCurrentState(reload)).toBe(text)
 const final=step(second),replay=step(reload);expect(final.market.tick).toBe(173)
 expect(saves.exportCurrentState(final)).toBe(saves.exportCurrentState(replay))
 const project=carriedProject(final,c.record.id)
 expect(project).toMatchObject({status:'review',dueWeek:null,reservation:null,writerIds:c.script.writerIds,conceptId:c.script.conceptId,productionId:null})
 const concept=second.hollywood!.concepts.find(concept=>concept.id===c.script.conceptId)!
 expect(concept).toBeDefined()
 const uplift=developmentOfficeEstUplift(second),assessment=assessFirstDraft(concept,uplift)
 expect(project.assessment).toEqual(assessment)
 const completions=scriptRecord(final,c.record.id).scriptCompletions.filter(row=>row.projectId===c.carried.id)
 expect(completions).toHaveLength(1)
 expect(completions[0]).toMatchObject({projectId:c.carried.id,week:173,inputWeek:172,estUplift:uplift,writerRewriting:null,assessment})
 expect(completions[0]!.developmentContext).toEqual({facilities:second.operations.facilities,placements:second.placement.facilities,paidRows:second.ledger.filter(r=>r.kind==='constructionCapex'&&r.week<=172&&second.placement.facilities.some(p=>p.projectId===r.constructionProjectId)).map(r=>({projectId:r.constructionProjectId!,week:r.week,amount:r.amount}))})
 expect(final.hollywood!.businesses.find(b=>b.studioId===TARGET)!.development.projects).toEqual(p.source.development.projects)
 expect(final.hollywood!.businesses.find(b=>b.studioId===TARGET)!.projects).toEqual(p.source.projects)
 expect(scriptRecord(final,c.record.id).continuedScripts.filter(row=>row.project.id===c.carried.id)).toHaveLength(1)
 expect(final.scriptDevelopment.projects).toEqual(c.result.scriptDevelopment.projects)
 pureOriginal(p);return {p,c,second,final,project}
}
function accepted(){
 const j=completion('explicit'),before=j.final,projectId=j.c.carried.id,beforeBytes=JSON.stringify(before)
 expect(scriptRecord(before,j.c.record.id).producerVersion).toBe('absorption-scripts/v3')
 expect(carriedProject(before,j.c.record.id).status).toBe('review')
 const model=scriptProjectsReadModel(before),card=model.sections.needsReview.find(p=>p.projectId===projectId)!
 expect(card).toBeDefined();expect(card.legalActions.map(a=>a.kind)).toEqual(['acceptScript','requestScriptRewrite'])
 expect(card.legalActions.some(a=>a.kind==='requestScriptRewrite')).toBe(true)
 const next=applyActions(before,[{kind:'acceptScript',projectId}])
 expect(JSON.stringify(before)).toBe(beforeBytes)
 saves.makeSave(next)
 const record=next.rights.absorptions.find(a=>a.id===j.c.record.id)!
 if(record.producerVersion!=='absorption-scripts/v4')throw new Error('actual accepted v4 producer required')
 expect(record.scriptDecisions).toHaveLength(1)
 const decision=record.scriptDecisions[0]!
 expect(decision).toMatchObject({projectId,kind:'accept',week:173})
 expect(decision.id).toMatch(/^script-decision-[1-9][0-9]*$/)
 expect(Number(decision.id.slice('script-decision-'.length))).toBe(before.rights.nextId)
 expect(next.rights.nextId).toBe(before.rights.nextId+1)
 expect(carriedProject(next,j.c.record.id)).toEqual({...j.project,status:'ready'})
 const original=scriptRecord(before,j.c.record.id)
 expect(record.scriptCompletions).toEqual(original.scriptCompletions)
 expect(record.contracts).toEqual(original.contracts);expect(record.titleEventIds).toEqual(original.titleEventIds)
 expect(record.continuedScripts[0]!.originalScript).toEqual(original.continuedScripts[0]!.originalScript)
 expect(record.continuedScripts[0]!.originalCosts).toEqual(original.continuedScripts[0]!.originalCosts)
 expect(next.hollywood).toEqual(before.hollywood);expect(next.studio.cash).toBe(before.studio.cash)
 expect(next.ledger).toEqual(before.ledger);expect(next.contracts).toEqual(before.contracts)
 expect(next.operations).toEqual(before.operations);expect(next.scriptDevelopment).toEqual(before.scriptDevelopment)
 expect(next.rights.titleEvents).toEqual(before.rights.titleEvents);expect(next.rights.transactions).toEqual(before.rights.transactions)
 const ready=scriptProjectsReadModel(next),readyCard=ready.sections.readyToPackage.find(p=>p.projectId===projectId)!,packageView=ready.packages.find(p=>p.projectId===projectId)!
 expect(readyCard).toBeDefined();expect(readyCard.legalActions).toEqual([])
 expect(packageView).toBeDefined();expect(packageView.openAction).toBeNull()
 expect(packageView.availability).toMatchObject({knownGatesClear:false,canSubmitGreenlightIntent:false,willQueueGreenlightIntent:false,staffingAvailable:false})
 expect(packageView.availability.blockers.some(b=>b.kind==='carried-action')).toBe(true)
 return {j,before,beforeBytes,next,record,decision,projectId}
}
function acceptedRecord(state:GameState,id:string){const a=state.rights.absorptions.find(a=>a.id===id)!;if(a.producerVersion!=='absorption-scripts/v4')throw new Error('accepted v4 witness required');return a}
describe('P16 genuine carried draft public acceptance',()=>{
 it('public173 Review to Ready records one durable decision and offers only supported management actions while source employment titles and earned assessment remain unchanged',()=>{
  const a=accepted(),before=JSON.stringify(a.next)
  try{expect(()=>applyActions(a.next,[{kind:'acceptScript',projectId:a.projectId}])).toThrow(/script development: accept rejected .* does not need review/)}finally{expect(JSON.stringify(a.next)).toBe(before)}
  const readyBefore=JSON.stringify(a.next)
  try{expect(()=>applyActions(a.next,[{kind:'requestScriptRewrite',projectId:a.projectId}])).toThrow(/script development: rewrite rejected/)}finally{expect(JSON.stringify(a.next)).toBe(readyBefore)}
  const text=saves.exportCurrentState(a.next),reload=saves.migrateToLive(saves.importSave(text)).state
  expect(saves.exportCurrentState(reload)).toBe(text)
  const final=step(a.next),replay=step(reload);expect(final.market.tick).toBe(174)
  expect(saves.exportCurrentState(final)).toBe(saves.exportCurrentState(replay))
  expect(acceptedRecord(final,a.record.id).scriptDecisions).toEqual(a.record.scriptDecisions)
  expect(acceptedRecord(final,a.record.id).scriptCompletions).toEqual(a.record.scriptCompletions)
  expect(carriedProject(final,a.record.id)).toEqual(carriedProject(a.next,a.record.id))
  pureOriginal(a.j.p)
 })
 it('fully admitted accepted state rejects missing wrong future premature and duplicate decision authority with precise reader owners and whole caller purity',()=>{
  const a=accepted()
  const cases:Array<{label:string;expected:RegExp;change:(x:GameState)=>void}>=[
   {label:'missing required durable decision',expected:/continued script: missing buyer script decision/,change:x=>{acceptedRecord(x,a.record.id).scriptDecisions=[]}},
   {label:'decision names unknown carried work',expected:/continued script: buyer script decision authority\/order differs/,change:x=>{acceptedRecord(x,a.record.id).scriptDecisions[0]!.projectId='missing-carried-project'}},
   {label:'decision invents unsupported kind',expected:/continued script: buyer script decision authority\/order differs/,change:x=>{Reflect.set(acceptedRecord(x,a.record.id).scriptDecisions[0]!,'kind','rewrite')}},
   {label:'decision future boundary',expected:/continued script: buyer script decision authority\/order differs/,change:x=>{acceptedRecord(x,a.record.id).scriptDecisions[0]!.week=174}},
   {label:'decision precedes actual earned completion',expected:/continued script: buyer review decision precedes earned completion/,change:x=>{acceptedRecord(x,a.record.id).scriptDecisions[0]!.week=172}},
   {label:'duplicate globally allocated decision ID',expected:/duplicate id script-decision-/,change:x=>{acceptedRecord(x,a.record.id).scriptDecisions.push(structuredClone(a.decision))}},
   {label:'ready work retagged as undecided exact v3',expected:/continued script: native buyer project differs from original work\/earned completion/,change:x=>{const record=acceptedRecord(x,a.record.id);Reflect.set(record,'producerVersion','absorption-scripts/v3');Reflect.deleteProperty(record,'scriptDecisions')}}
  ]
  for(const {label,expected,change} of cases){const x=structuredClone(a.next);change(x);const before=JSON.stringify(x);try{expect(()=>saves.makeSave(x),label).toThrow(expected)}finally{expect(JSON.stringify(x),label).toBe(before)}}
 })
 it('real native accept producer failure after producing Ready preserves original Review caller without claiming an uncalled makeSave seam',()=>{
  const j=completion('explicit'),before=JSON.stringify(j.final),real=nativeScript.acceptScriptProject,marker='CARRIED_NATIVE_ACCEPT_FAILURE';let reached=0
  const spy=vi.spyOn(nativeScript,'acceptScriptProject').mockImplementation((development,id)=>{const result=real(development,id);if(id===j.c.carried.id){expect(result.projects.find(p=>p.id===id)?.status).toBe('ready');reached++;throw new Error(marker)}return result})
  try{expect(()=>applyActions(j.final,[{kind:'acceptScript',projectId:j.c.carried.id}])).toThrow(marker);expect(reached).toBe(1)}finally{spy.mockRestore();expect(JSON.stringify(j.final)).toBe(before);pureOriginal(j.p)}
  saves.makeSave(j.final)
 })
})
