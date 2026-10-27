// §6 transaction-unit counterfactuals, NOT natural campaign/closure reachability.
import {expect,it} from 'vitest'
import {accepted45} from './helpers/1368-recovery-witnesses.js'
import {drainRival} from './helpers/p15b-live.js'
import {makeSave,validateSaveV50,exportSave,importSave,stableStringify} from '../src/core/save.js'
import {tick} from '../src/core/tick.js'
import {blueprintById,facilityDemolitionRefund} from '../src/core/index.js'
import {validateRivalFacilityDisposal} from '../src/core/rivalResearch.js'
import type {IndustryReceipt} from '../src/core/hollywoodTypes.js'
import {P15_PHASE_ORDER_VERSION,P15_PHASE_TABLES} from '../src/core/p15Phases.js'
import {closureDigest,validateStudioClosureRoot} from '../src/core/studioClosure.js'
import type {GameState} from '../src/core/types.js'
const R='studio-aca408ec-r01',LAB=R+':laboratory:1',PLAN=R+':plan:3',ADOPTION=R+':sound-adoption:0'
const text=(x:unknown)=>stableStringify(x)
function admitted(s:GameState){const before=text(s),saved=makeSave(s);validateSaveV50(saved);expect(text(s)).toBe(before);return s}
function conditionPremise(s:GameState):GameState{
 // Only newly empty migrated condition root changes. Existing Ranking/shared history and sequences stay exact.
 expect(s.corporateCondition.studios).toEqual([]);expect(s.corporateCondition.events).toEqual([]);expect(s.corporateCondition.loans).toEqual([])
 const W=s.market.tick,start=W-32,n=s.p15Sequence.next
 const phase=P15_PHASE_TABLES[P15_PHASE_ORDER_VERSION]!.find(p=>p.phaseId==='p15b.condition')!
 const triple={phaseId:'p15b.condition',phaseOrdinal:phase.phaseOrdinal,phaseOrderVersion:P15_PHASE_ORDER_VERSION}
 const studios=s.hollywood!.identities.filter(i=>i.enteredWeek!==null&&i.enteredWeek<=W).map(i=>{
  const first=Math.max(start+1,i.enteredWeek!)
  return {studioId:i.studioId,firstEvaluatedWeek:first,definitionVersion:'corporate-condition/v1',condition:i.studioId===R
   ?{stage:'distress',since:W-24,week:W,lowRun:32,negativeRun:32,clearRun:0,distressWeeks:25}
   :{stage:'stable',since:first,week:W,lowRun:0,negativeRun:0,clearRun:W-first+1,distressWeeks:0}}
 }).sort((a,b)=>a.studioId<b.studioId?-1:1)
 expect(studios.find(r=>r.studioId===R)!.firstEvaluatedWeek).toBe(start+1)
 const events=[{eventId:'corporate-event-1',studioId:R,week:W-28,from:'stable',to:'warning',causes:[{code:'LOW_COVER',weeks:4},{code:'NEGATIVE_CASH',weeks:4}],definitionVersion:'corporate-condition/v1',p15DomainSequence:n,...triple},
 {eventId:'corporate-event-2',studioId:R,week:W-24,from:'warning',to:'distress',causes:[{code:'NEGATIVE_CASH',weeks:8},{code:'LOW_COVER',weeks:8}],definitionVersion:'corporate-condition/v1',p15DomainSequence:n+1,...triple}]
 return {...s,corporateCondition:{version:1,recordedFromWeek:start,nextEvent:3,nextLoan:1,studios,events,loans:[]},p15Sequence:{...s.p15Sequence,next:n+2}} as GameState
}
function runTo(s:GameState,W:number){let next=s;while(next.market.tick<W)next=tick(next,{develop:true,deferPlayerClosure:true});return admitted(next)}
function terminal(s:GameState,kind:'physicalPlan'|'adoption',id:string){
 const original=text(s),W=s.market.tick,withCondition=admitted(conditionPremise(s))
 const cash=withCondition.hollywood!.businesses.find(b=>b.studioId===R)!.account.cash
 const premise=admitted(drainRival(withCondition,R,Math.ceil(cash)+10_000_000)),before=text(premise)
 const booked=(state:GameState,money:'researchCapacity'|'technologyAdoption'|'facilityDemolitionRefund')=>state.hollywood!.businesses.find(b=>b.studioId===R)!.account.periods.reduce((n,p)=>n+p.movements[money],0)
 const money=kind==='physicalPlan'?'researchCapacity':'technologyAdoption'
 const paidBefore=booked(premise,money),refundsBefore=booked(premise,'facilityDemolitionRefund')
 const next=admitted(tick(premise,{develop:true,deferPlayerClosure:true}))
 // The work's existing capital movement is retained; no positive refund is booked at closure.
 expect(booked(next,money)).toBe(paidBefore)
 const previousReceiptIds=new Set(premise.hollywood!.receipts.map(r=>r.eventId))
 const disposals=next.hollywood!.receipts.filter((r):r is Extract<IndustryReceipt,{kind:'facilityDisposed'}>=>r.kind==='facilityDisposed'&&r.studioId===R&&!previousReceiptIds.has(r.eventId))
 if(kind==='physicalPlan')expect(disposals).toEqual([])
 else {
  // The already-completed bare second lab is disposed by real cost cutting BEFORE closure.
  // Its refund is separate from the in-flight sound equipment/deployment commitment.
  expect(disposals).toHaveLength(1)
  expect(disposals[0]).toMatchObject({kind:'facilityDisposed',week:W,studioId:R,facilityId:LAB,planId:PLAN,blueprintId:'research-laboratory',refund:450000})
  const body=premise.physicalPlans.plans.find(p=>p.id===PLAN)!
  expect(body).toMatchObject({work:{kind:'placement',blueprintId:'research-laboratory'},commitReceipt:{week:266,cost:900000}})
  expect(premise.hollywood!.receipts.filter(r=>r.kind==='laboratoryCommitted'&&r.planId===PLAN)).toMatchObject([{eventId:'industry-event-258',week:266,facilityId:LAB}])
  expect(premise.hollywood!.receipts.filter(r=>r.kind==='laboratoryOperational'&&r.facilityId===LAB)).toMatchObject([{eventId:'industry-event-261',week:278}])
  expect(premise.hollywood!.businesses.find(b=>b.studioId===R)!.operations.facilities.some(f=>f.id===LAB&&f.capability==='laboratory')).toBe(true)
  expect(disposals[0]!.refund).toBe(facilityDemolitionRefund(blueprintById('research-laboratory')!))
  expect(disposals[0]!.refund).toBe(body.commitReceipt!.cost/2)
  expect(disposals.some(r=>r.facilityId===premise.technology.adoptions.find(a=>a.id===id)!.stageFacilityId||r.facilityId===premise.technology.adoptions.find(a=>a.id===id)!.postFacilityId)).toBe(false)
 }
 expect(booked(next,'facilityDemolitionRefund')-refundsBefore).toBe(disposals.reduce((n,r)=>n+r.refund,0))
 // The full reader also checks authentic paid-body/bare-dependency/tombstone authority.
 expect(()=>validateRivalFacilityDisposal(next)).not.toThrow()
 expect(text(premise)).toBe(before);expect(text(s)).toBe(original)
 const c=next.studioClosure.closures.find(c=>c.studioId===R)!;expect(c).toBeDefined();expect(c.closureWeek).toBe(W+1)
 const cause=next.corporateCondition.events.find(e=>e.eventId===c.causeEventId);expect(cause).toMatchObject({studioId:R,week:W+1,to:'closed'})
 const rows=c.dispositions.filter(d=>d.subjectKind===kind&&d.subjectId===id);expect(rows).toHaveLength(1);expect(rows[0]!.status).toBe('applied');expect(rows[0]!.result).toContain('zero refund')
 if(kind==='physicalPlan')expect(rows[0]!.result).toBe(`build stopped at week ${W+1} by the terminal operating state; zero refund`)
 const serialized=exportSave(makeSave(next));expect(exportSave(importSave(serialized))).toBe(serialized)
 // Digest repair cannot hide a deleted required terminal subject.
 const bad=structuredClone(next),bc=bad.studioClosure.closures.find(x=>x.closureId===c.closureId)!
 bc.dispositions=bc.dispositions.filter(d=>!(d.subjectKind===kind&&d.subjectId===id));bc.counts={}
 for(const d of bc.dispositions)bc.counts[d.subjectKind]=(bc.counts[d.subjectKind]??0)+1
 bc.digest=closureDigest(bc.closureId,bc.dispositions)
 const mutantBefore=text(bad),missing=`no disposition for live subject ${kind}:${id}`
 // P16 rebase: the root validator applies the era it is handed; a Save49 closure is stamped with the estate phase
 // table 3, which only the rights era admits (the live reader passes `rightsEstate: true`), so the era comes from the state.
 expect(()=>validateStudioClosureRoot(bad as unknown as Record<string,unknown>,'pending-rival completeness',{rightsEstate:Object.hasOwn(bad,'rights')})).toThrow(missing)
 expect(text(bad)).toBe(mutantBefore)
 expect(()=>makeSave(bad)).toThrow(missing)
 expect(text(bad)).toBe(mutantBefore)
 return {next,c}
}
it('constructed condition/finance premise closes authentic pending rival lab; independent ordinary arm completes it',()=>{
 const s=admitted(accepted45('research').current.state),source=text(s);expect(s.market.tick).toBe(267)
 const p=s.physicalPlans.plans.find(p=>p.id===PLAN)!;expect(p).toMatchObject({status:'started',commitReceipt:{week:266,cost:900000},approvedQuote:{buildWeeks:12}})
 const commitment=s.hollywood!.receipts.find(r=>r.eventId==='industry-event-258');expect(commitment).toMatchObject({kind:'laboratoryCommitted',planId:PLAN,facilityId:LAB,week:266})
 expect(s.hollywood!.receipts.filter(r=>r.kind==='laboratoryOperational'&&r.facilityId===LAB)).toEqual([])
 const completed=runTo(s,278);expect(completed.hollywood!.receipts.filter(r=>r.kind==='laboratoryOperational'&&r.facilityId===LAB)).toHaveLength(1)
 const {next}=terminal(s,'physicalPlan',PLAN);expect(next.physicalPlans.plans.find(p=>p.id===PLAN)).toEqual(p)
 const stopped=runTo(next,278);expect(stopped.hollywood!.receipts.filter(r=>r.kind==='laboratoryOperational'&&r.facilityId===LAB)).toEqual([])
 expect(stopped.hollywood!.receipts.filter(r=>r.kind==='laboratoryCommitted'&&r.planId===PLAN)).toEqual([commitment]);expect(text(s)).toBe(source)
})
it('constructed condition/finance premise closes authentic pending rival sound; independent ordinary arm completes it',()=>{
 const s=admitted(accepted45('baseline280').current.state),source=text(s);expect(s.market.tick).toBe(280)
 const a=s.technology.adoptions.find(a=>a.id===ADOPTION)!;expect(a).toMatchObject({studioId:R,committedWeek:276,operationalWeek:null,cancelledWeek:null,route:'research',equipmentAssetId:R+':equipment:0'})
 expect(s.technology.access.find(x=>x.studioId===R&&x.technologyId==='synchronized-sound')).toMatchObject({route:'research',acquiredWeek:276})
 expect(s.hollywood!.receipts.find(r=>r.eventId==='industry-event-260')).toMatchObject({kind:'researchCompleted',week:276,projectId:R+':research:synchronized-sound'})
 const completed=runTo(s,288);expect(completed.technology.adoptions.find(x=>x.id===ADOPTION)!.operationalWeek).toBe(288)
 const {next}=terminal(s,'adoption',ADOPTION);expect(next.technology.adoptions.find(x=>x.id===ADOPTION)).toEqual(a)
 const stopped=runTo(next,288);expect(stopped.technology.adoptions.find(x=>x.id===ADOPTION)).toEqual(a)
 expect(stopped.technology.equipment.find(e=>e.id===a.equipmentAssetId)!.holderAdoptionId).toBe(ADOPTION);expect(text(s)).toBe(source)
})
