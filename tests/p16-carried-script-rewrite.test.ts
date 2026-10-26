// UNRUN one fixed eight-tick diagnostic; not healthy drafting feature acceptance.
import {describe,it,expect,vi} from 'vitest'
import {readFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import * as saves from '../src/core/save.js'
import * as nativeScript from '../src/core/scriptDevelopment.js'
import {buyerScriptDevelopment} from '../src/core/continuedScripts.js'
import {buyerOperationsForAllWork,buyerOperatedProductions} from '../src/core/continuedWork.js'
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
function scriptRecord(state:GameState,id:string){const record=state.rights.absorptions.find(a=>a.id===id)!;if(!record||(record.producerVersion!=='absorption-scripts/v3'&&record.producerVersion!=='absorption-scripts/v4'&&record.producerVersion!=='absorption-scripts/v5'))throw new Error('actual scripts/v3 producer required');return record}
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
function rewriteRecord(state:GameState,id:string){const a=state.rights.absorptions.find(a=>a.id===id)!;if(a.producerVersion!=='absorption-scripts/v5')throw new Error('actual v5 rewrite owner required');return a}
function rewriteDecision(state:GameState,id:string){const d=rewriteRecord(state,id).scriptDecisions.find(d=>d.kind==='rewrite');if(!d||d.kind!=='rewrite')throw new Error('actual rewrite decision required');return d}
function rewritten(){
 const j=completion('explicit'),projectId=j.c.carried.id,before=JSON.stringify(j.final)
 expect(j.final.scriptDevelopment.projects).toEqual([])
 expect(buyerScriptDevelopment(j.final).projects.map(p=>p.id)).toEqual([projectId])
 const card=scriptProjectsReadModel(j.final).sections.needsReview.find(p=>p.projectId===projectId)!
 expect(card.legalActions.some(a=>a.kind==='requestScriptRewrite')).toBe(true)
 const state=applyActions(j.final,[{kind:'requestScriptRewrite',projectId}])
 expect(JSON.stringify(j.final)).toBe(before)
 saves.makeSave(state)
 const record=rewriteRecord(state,j.c.record.id),decision=record.scriptDecisions.find(d=>d.kind==='rewrite')!
 if(decision.kind!=='rewrite')throw new Error('real rewrite decision required')
 expect(decision).toMatchObject({projectId,kind:'rewrite',week:173})
 expect(record.scriptDecisions).toHaveLength(1)
 expect(decision.nativeInput.development).toEqual(buyerScriptDevelopment(j.final))
 expect(decision.nativeInput.operations).toEqual(buyerOperationsForAllWork(j.final))
 expect(decision.allocationAuthority).toEqual({projectIds:buyerScriptDevelopment(j.final).projects.map(p=>p.id),workflowIds:buyerOperationsForAllWork(j.final).workflows.map(w=>w.productionId),productions:buyerOperatedProductions(j.final),occupiedSlots:decision.nativeInput.occupiedSlots,developmentContext:{facilities:j.final.operations.facilities,placements:j.final.placement.facilities,paidRows:j.final.ledger.filter(r=>r.kind==='constructionCapex'&&r.week<=173&&j.final.placement.facilities.some(p=>p.projectId===r.constructionProjectId)).map(r=>({projectId:r.constructionProjectId!,week:r.week,amount:r.amount}))},estUplift:developmentOfficeEstUplift(j.final)})
 expect(decision.allocationAuthority.projectIds).toContain(projectId)
 const native=nativeScript.requestScriptRewrite(decision.nativeInput.development,decision.nativeInput.operations,projectId,173,new Set(decision.nativeInput.occupiedSlots)).projects.find(p=>p.id===projectId)!
 const project=carriedProject(state,j.c.record.id)
 expect(project).toEqual(native);expect(project).toMatchObject({status:'rewriting',rewriteCount:1,dueWeek:174})
 expect(project.reservation).toEqual(decision.reservation)
 expect(state.operations.facilities.some(f=>f.id===project.reservation!.facilityId&&f.capability===project.reservation!.capability)).toBe(true)
 expect(record.scriptCompletions).toEqual(scriptRecord(j.final,j.c.record.id).scriptCompletions)
 expect(state.studio.cash).toBe(j.final.studio.cash);expect(state.ledger).toEqual(j.final.ledger)
 const after=step(state);expect(after.market.tick).toBe(174)
 const output=carriedProject(after,j.c.record.id),writer=state.talent.find(t=>t.id===project.writerId)!
 expect(writer.skills.writing.rewriting).toBeDefined()
 expect(output).toMatchObject({status:'review',dueWeek:null,reservation:null,rewriteCount:1})
 expect(output.assessment).toEqual(nativeScript.rewriteAssessment(j.project.assessment!,writer))
 const completions=rewriteRecord(after,j.c.record.id).scriptCompletions
 expect(completions).toHaveLength(2);expect(completions[0]).toEqual(record.scriptCompletions[0])
 expect(completions[1]).toMatchObject({projectId,week:174,inputWeek:173,writerRewriting:writer.skills.writing.rewriting,assessment:output.assessment})
 expect(after.hollywood!.businesses.find(b=>b.studioId===TARGET)!.development.projects).toEqual(j.p.source.development.projects)
 expect(after.hollywood!.businesses.find(b=>b.studioId===TARGET)!.projects).toEqual(j.p.source.projects)
 pureOriginal(j.p);return {j,projectId,state,record,decision,after,output}
}
describe('P16 genuine carried script public rewrite',()=>{
 it('actual public rewrite uses native buyer reservation and talent to append a second earned Review then public final Accept and once-only175 replay',()=>{
  const a=rewritten(),text=saves.exportCurrentState(a.after),reload=saves.migrateToLive(saves.importSave(text)).state
  expect(saves.exportCurrentState(reload)).toBe(text)
  const before=JSON.stringify(a.after),ready=applyActions(a.after,[{kind:'acceptScript',projectId:a.projectId}])
  expect(JSON.stringify(a.after)).toBe(before)
  expect(carriedProject(ready,a.j.c.record.id)).toEqual({...a.output,status:'ready'})
  const r=rewriteRecord(ready,a.j.c.record.id)
  expect(r.scriptDecisions.map(d=>({projectId:d.projectId,kind:d.kind,week:d.week}))).toEqual([{projectId:a.projectId,kind:'rewrite',week:173},{projectId:a.projectId,kind:'accept',week:174}])
  expect(r.scriptCompletions).toEqual(rewriteRecord(a.after,a.j.c.record.id).scriptCompletions)
  const final=step(ready),replay=step(applyActions(reload,[{kind:'acceptScript',projectId:a.projectId}]))
  expect(final.market.tick).toBe(175);expect(saves.exportCurrentState(final)).toBe(saves.exportCurrentState(replay))
  expect(rewriteRecord(final,a.j.c.record.id).scriptDecisions).toEqual(r.scriptDecisions)
  expect(rewriteRecord(final,a.j.c.record.id).scriptCompletions).toEqual(r.scriptCompletions)
  const rejectedBefore=JSON.stringify(a.after)
  try{expect(()=>applyActions(a.after,[{kind:'requestScriptRewrite',projectId:a.projectId}])).toThrow(/script development: rewrite rejected/)}finally{expect(JSON.stringify(a.after)).toBe(rejectedBefore)}
 })
 it('real rewritten history refuses missing request or second receipt wrong due talent assessment and historical capacity forgery with exact owners',()=>{
  const a=rewritten()
  const cases:Array<{label:string;expected:RegExp;change:(x:GameState)=>void}>=[
   {label:'missing all actual buyer decisions',expected:/continued script: missing buyer script decision/,change:x=>{rewriteRecord(x,a.j.c.record.id).scriptDecisions=[]}},
   {label:'missing second earned completion',expected:/continued script: buyer rewrite completion bijection differs/,change:x=>{rewriteRecord(x,a.j.c.record.id).scriptCompletions=rewriteRecord(x,a.j.c.record.id).scriptCompletions.slice(0,1)}},
   {label:'rewrite input boundary changed',expected:/continued script: buyer rewrite completion boundary differs/,change:x=>{rewriteRecord(x,a.j.c.record.id).scriptCompletions[1]!.inputWeek=172}},
   {label:'second earned assessment changed',expected:/continued script: native earned rewrite assessment differs/,change:x=>{rewriteRecord(x,a.j.c.record.id).scriptCompletions[1]!.assessment.actualStrength+=1}},
   {label:'request before original earned Review',expected:/continued script: buyer review decision precedes earned completion/,change:x=>{rewriteDecision(x,a.j.c.record.id).week=172}},
   {label:'wrong historical returned reservation',expected:/continued script: native rewrite reservation differs/,change:x=>{rewriteDecision(x,a.j.c.record.id).reservation.slot+=1}},
   {label:'invented historical facility plus reservation preserves actual observation',expected:/continued script: native rewrite facilities differ from observed source/,change:x=>{const d=rewriteDecision(x,a.j.c.record.id),facility=d.reservation.facilityId;expect(d.nativeInput.operations.facilities.some(f=>f.id===facility)).toBe(true);d.nativeInput.operations.facilities=d.nativeInput.operations.facilities.map(f=>f.id===facility?{...f,id:'invented-native-facility'}:f);d.reservation.facilityId='invented-native-facility'}},
   {label:'actual rewrite subject omitted from native input',expected:/continued script: native rewrite input differs from earned project/,change:x=>{const d=rewriteDecision(x,a.j.c.record.id);d.nativeInput.development.projects=d.nativeInput.development.projects.filter(p=>p.id!==a.projectId)}},
   {label:'historical actual Review status rewritten in raw native input',expected:/continued script: native rewrite input differs from earned project/,change:x=>{rewriteDecision(x,a.j.c.record.id).nativeInput.development.projects.find(p=>p.id===a.projectId)!.status='ready'}},
   {label:'historical Review invents a live reservation in raw native input',expected:/continued script: native rewrite input differs from earned project/,change:x=>{const d=rewriteDecision(x,a.j.c.record.id);d.nativeInput.development.projects.find(p=>p.id===a.projectId)!.reservation=structuredClone(d.reservation)}},
   {label:'actual subject omitted from preserved pool manifest',expected:/continued script: native rewrite complete allocation pool differs/,change:x=>{const d=rewriteDecision(x,a.j.c.record.id);d.allocationAuthority.projectIds=d.allocationAuthority.projectIds.filter(id=>id!==a.projectId)}},
   {label:'actual current rewrite count erased',expected:/continued script: native buyer project differs from original work\/earned completion/,change:x=>{carriedProject(x,a.j.c.record.id).rewriteCount=0}}

  ]
  for(const {label,change,expected} of cases){const x=structuredClone(a.after);change(x);const before=JSON.stringify(x);try{expect(()=>saves.makeSave(x),label).toThrow(expected)}finally{expect(JSON.stringify(x),label).toBe(before)}}
 })
 it('actual native rewrite producer failure after returning real rewriting work preserves original Review caller',()=>{
  const j=completion('explicit'),before=JSON.stringify(j.final),real=nativeScript.requestScriptRewrite,marker='CARRIED_NATIVE_REWRITE_FAILURE';let reached=0
  const spy=vi.spyOn(nativeScript,'requestScriptRewrite').mockImplementation((...args)=>{const result=real(...args);if(args[2]===j.c.carried.id){expect(result.projects.find(p=>p.id===args[2])).toMatchObject({status:'rewriting',rewriteCount:1,dueWeek:174});reached++;throw new Error(marker)}return result})
  try{expect(()=>applyActions(j.final,[{kind:'requestScriptRewrite',projectId:j.c.carried.id}])).toThrow(marker);expect(reached).toBe(1)}finally{spy.mockRestore();expect(JSON.stringify(j.final)).toBe(before);pureOriginal(j.p)}
  saves.makeSave(j.final)
 })
})
