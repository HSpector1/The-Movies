import { liveRetirementWritingAuthority, prepareLiveWritingContext, type LiveWritingContext } from './liveRetirementWriting.js'
import type { RetirementWritingAuthority } from './retirementWriting.js'
import { assertStudioOperationsInvariants } from './operations.js'
import { activeContract, busyTalentIds } from './employment.js'
import { castingOccupiedFacilitySlots } from './castingSessions.js'
import { resourceClaims } from './occupancy.js'
import type { GameState, ScriptDevelopment, ScriptProject, Production, FilmConcept, LedgerEntry } from './types.js'
import type { AbsorptionRecord, AbsorptionScriptCompletion, AbsorptionScriptDecision } from './rights.js'
import { allocateRightsId } from './rights.js'
import { allocateScriptReservation, completeDueScriptWork, assertScriptDevelopmentInvariants, assessFirstDraft, scriptRewriteDelta, acceptScriptProject, requestScriptRewrite, linkScriptProjectToProduction, returnScriptProjectToReady, markScriptProjectProduced } from './scriptDevelopment.js'
import { buyerOperationsForAllWork, buyerOperatedProductions } from './continuedWork.js'
import { closedWeekOf } from './operatingState.js'
import { TUNING, SCRIPT_DEVELOPMENT_OFFICE_TIER_2_EST_UPLIFT, SCRIPT_DEVELOPMENT_OFFICE_TIER_3_EST_UPLIFT, FACILITY_BLUEPRINTS } from './tuning.js'
import { developmentOfficeEstUplift } from './facilityEffects.js'

type Owner=Extract<AbsorptionRecord,{producerVersion:'absorption-scripts/v3'|'absorption-scripts/v4'|'absorption-scripts/v5'|'absorption-scripts/v6'|'absorption-obligations/v7'}>
function withScriptDecisions(a:Owner,continuedScripts:Owner['continuedScripts'],scriptDecisions:AbsorptionScriptDecision[],version:'absorption-scripts/v5'|'absorption-scripts/v6'):Owner{
 return a.producerVersion==='absorption-obligations/v7'
  ?{...a,continuedScripts,scriptDecisions}
  :{...a,producerVersion:version,continuedScripts,scriptDecisions}
}
function fail(why:string):never{throw new Error(`continued script: ${why}`)}
const exact=(x:object,keys:string[])=>Object.keys(x).sort().join()===keys.sort().join()
function same(a:unknown,b:unknown):boolean{
 if(a===b)return true
 if(a===null||b===null||typeof a!=='object'||typeof b!=='object')return false
 if(Array.isArray(a)||Array.isArray(b))return Array.isArray(a)&&Array.isArray(b)&&a.length===b.length&&a.every((v,i)=>same(v,b[i]))
 const x=a as Record<string,unknown>,y=b as Record<string,unknown>,keys=Object.keys(x).sort()
 return keys.join()===Object.keys(y).sort().join()&&keys.every(k=>same(x[k],y[k]))
}
function owners(state:GameState):Owner[]{
 return (state.rights?.absorptions??[]).filter((a):a is Owner=>(a.producerVersion==='absorption-scripts/v3'||a.producerVersion==='absorption-scripts/v4'||(a.producerVersion==='absorption-scripts/v5'||a.producerVersion==='absorption-scripts/v6'||a.producerVersion==='absorption-obligations/v7'))&&(!(a.producerVersion==='absorption-obligations/v7')||a.continuedScripts.length>0))
}
export function continuedScriptOwner(state:GameState,id:string){
 for(const a of owners(state)){const row=a.continuedScripts.find(r=>r.project.id===id);if(row)return {a,row}}
 return null
}
export function buyerScriptDevelopment(state:GameState):ScriptDevelopment{
 const player=state.hollywood?.playerStudioId
 const projects=owners(state).filter(a=>a.buyerId===player).flatMap(a=>a.continuedScripts.map(r=>r.project))
 return projects.length===0?state.scriptDevelopment:{...state.scriptDevelopment,projects:[...state.scriptDevelopment.projects,...projects]}
}
export function buyerScriptConcepts(state:GameState){
 const ids=new Set(owners(state).filter(a=>a.buyerId===state.hollywood?.playerStudioId).flatMap(a=>a.continuedScripts.map(r=>r.originalScript.conceptId)))
 return [...state.concepts,...(state.hollywood?.concepts??[]).filter(c=>ids.has(c.id)&&!state.concepts.some(own=>own.id===c.id))]
}

/** Exact current49 authority for native buyer productions only. Derived afresh
 * from independently replayed carried history; absent for every older record. */
export type CarriedProductionAuthority = Readonly<{
 concepts: readonly FilmConcept[];
 productionScripts: ReadonlyMap<string,ScriptProject>;
 /** Every actual native greenlight remains joined after cancellation clears the
  * current project link, or after a later greenlight assigns a different ID. */
 productionScriptHistory: ReadonlyMap<string,Readonly<{studioId:string;project:ScriptProject;firstTakeEarliestWeek:number;firstTakeLatestWeek:number|null}>>;
 originalProductions: readonly Production[];
}>
export function carriedScriptForProduction(state:GameState,productionId:string){
 return owners(state).flatMap(a=>a.continuedScripts).find(row=>row.project.productionId===productionId)?.project
}
function productionDecision(state:GameState,projectId:string,project:ScriptProject,decision:
 | {projectId:string;kind:'greenlight';week:number;production:Production;paidRows:LedgerEntry[]}
 | {projectId:string;kind:'cancelProduction';week:number;production:Production}
 | {projectId:string;kind:'productionReleased';week:number;productionId:string}):GameState {
 const owner=continuedScriptOwner(state,projectId)
 if(!owner||owner.a.buyerId!==state.hollywood?.playerStudioId)fail('native production has no carried buyer screenplay')
 const allocated=allocateRightsId(state.rights,'script-decision')
 const event={...structuredClone(decision),id:allocated.id}
 return {...state,rights:{...allocated.root,absorptions:allocated.root.absorptions.map(a=>a.id===owner.a.id?withScriptDecisions(owner.a,
  owner.a.continuedScripts.map(row=>row.project.id===projectId?{...row,project}:row),
  [...(owner.a.producerVersion==='absorption-scripts/v3'?[]:owner.a.scriptDecisions),event],'absorption-scripts/v6'):a)}}
}
/** Called only after the ordinary native producer returned the paid production. */
export function linkCarriedScriptToProduction(state:GameState,projectId:string,production:Production):GameState {
 const owner=continuedScriptOwner(state,projectId)
 if(!owner)fail('native greenlight has no carried screenplay')
 const project=linkScriptProjectToProduction({mode:'managed',projects:[owner.row.project]},projectId,production.id).projects[0]!
 const paidRows=state.ledger.filter(row=>row.productionId===production.id&&(row.kind==='production'||row.kind==='freelancerFee'))
 return productionDecision(state,projectId,project,{projectId,kind:'greenlight',week:state.market.tick,production,paidRows})
}
/** Ordinary cancel has already removed the native production without a refund. */
export function returnCarriedScriptToReady(state:GameState,production:Production):GameState {
 const previous=carriedScriptForProduction(state,production.id)
 if(!previous)return state
 const project=returnScriptProjectToReady({mode:'managed',projects:[previous]},production.id).projects[0]!
 return productionDecision(state,previous.id,project,{projectId:previous.id,kind:'cancelProduction',week:state.market.tick,production})
}
/** Ordinary release owns the film, cash, growth, standing and title; only its
 * carried screenplay's durable lifecycle is joined here at the actual input week. */
export function markCarriedScriptProduced(state:GameState,productionId:string,week:number):GameState {
 const previous=carriedScriptForProduction(state,productionId)
 if(!previous)return state
 const project=markScriptProjectProduced({mode:'managed',projects:[previous]},productionId).projects[0]!
 return productionDecision(state,previous.id,project,{projectId:previous.id,kind:'productionReleased',week,productionId})
}
/** Only the dereference shapes consumed by the early receipt replay. This is
 * not a substitute for any frozen/full validator, all of which still run. */
function assertCarriedHistoryInputShape(state:GameState):void {
 type Row=Record<string,unknown>
 const object=(value:unknown,path:string):Row=>{
  if(value===null||typeof value!=='object'||Array.isArray(value))fail(`native production input ${path} must be an object`)
  return value as Row
 }
 const rows=(value:unknown,path:string):Row[]=>{
  if(!Array.isArray(value))fail(`native production input ${path} must be an array`)
  return value.map((row,i)=>object(row,`${path}[${i}]`))
 }
 const text=(value:unknown,path:string):void=>{
  if(typeof value!=='string'||value.length===0)fail(`native production input ${path} must be a string`)
 }
 const strings=(value:unknown,path:string):void=>{
  if(!Array.isArray(value))fail(`native production input ${path} must be an array`)
  value.forEach((item,i)=>text(item,`${path}[${i}]`))
 }
 const script=(value:unknown,path:string):void=>{
  const p=object(value,path);text(p.id,`${path}.id`);strings(p.writerIds,`${path}.writerIds`)
 }
 const production=(value:unknown,path:string):void=>{
  const p=object(value,path);text(p.id,`${path}.id`);object(p.budget,`${path}.budget`)
  object(p.forecastSnapshot,`${path}.forecastSnapshot`)
 }
 const development=(value:unknown,path:string):void=>{
  const d=object(value,path);rows(d.projects,`${path}.projects`).forEach((p,i)=>script(p,`${path}.projects[${i}]`))
 }
 const operations=(value:unknown,path:string):void=>{
  const op=object(value,path)
  rows(op.facilities,`${path}.facilities`).forEach(f=>{text(f.id,`${path}.facility.id`);text(f.name,`${path}.facility.name`)})
  rows(op.workflows,`${path}.workflows`).forEach(w=>{
   rows(w.reservations,`${path}.workflow.reservations`)
   if(w.bindings!==undefined)object(w.bindings,`${path}.workflow.bindings`)
   if(w.shootingTask!==null)object(w.shootingTask,`${path}.workflow.shootingTask`)
   if(w.blocker!==null)object(w.blocker,`${path}.workflow.blocker`)
  })
 }
 const observation=(value:unknown,path:string):void=>{
  const o=object(value,path);rows(o.facilities,`${path}.facilities`);rows(o.placements,`${path}.placements`);rows(o.paidRows,`${path}.paidRows`)
 }
 const root=object(state,'state'),h=object(root.hollywood,'hollywood')
 const market=object(root.market,'market')
 if(!Number.isSafeInteger(market.tick))fail('native production input market.tick must be a whole week')
 development(root.scriptDevelopment,'scriptDevelopment')
 rows(root.ledger,'ledger')
 const studio=object(root.studio,'studio')
 rows(studio.activeProductions,'studio.activeProductions').forEach((p,i)=>production(p,`studio.activeProductions[${i}]`))
 rows(studio.releasedFilms,'studio.releasedFilms')
 rows(object(root.releaseAuthority,'releaseAuthority').commitments,'releaseAuthority.commitments')
 rows(object(root.studioClosure,'studioClosure').closures,'studioClosure.closures')
 rows(object(root.placement,'placement').facilities,'placement.facilities')
 operations(root.operations,'operations')
 rows(h.concepts,'hollywood.concepts').forEach((c,i)=>text(c.id,`hollywood.concepts[${i}].id`))
 rows(h.employment,'hollywood.employment').forEach((e,i)=>object(e.terms,`hollywood.employment[${i}].terms`))
 const businesses=rows(h.businesses,'hollywood.businesses')
 const rights=object(root.rights,'rights')
 if(!Number.isSafeInteger(rights.nextId))fail('native production input rights.nextId must be a whole number')
 for(const a of rows(rights.absorptions,'rights.absorptions')){
  text(a.id,'absorption.id')
  rows(a.continuedProductions,'absorption.continuedProductions').forEach(r=>production(r.originalProduction,'continuedProduction.originalProduction'))
  rows(a.workSteps,'absorption.workSteps');rows(a.workCancellations,'absorption.workCancellations');rows(a.workReleases,'absorption.workReleases')
  if(!['absorption-scripts/v3','absorption-scripts/v4','absorption-scripts/v5','absorption-scripts/v6','absorption-obligations/v7'].includes(a.producerVersion as string))continue
  const source=businesses.find(b=>b.studioId===a.targetId)
  if(!source)fail('native production input source business missing')
  development(source.development,'source.development');rows(source.projects,'source.projects')
  rows(a.contracts,'absorption.contracts');rows(a.stoppedScripts,'absorption.stoppedScripts')
  rows(a.continuedScripts,'absorption.continuedScripts').forEach(r=>{
   script(r.project,'continuedScript.project');script(r.originalScript,'continuedScript.originalScript')
   object(r.originalCosts,'continuedScript.originalCosts');object(r.reservationAtClose,'continuedScript.reservationAtClose')
  })
  rows(a.scriptCompletions,'absorption.scriptCompletions').forEach(r=>observation(r.developmentContext,'completion.developmentContext'))
  if(a.producerVersion==='absorption-scripts/v3')continue
  for(const d of rows(a.scriptDecisions,'absorption.scriptDecisions')){
   text(d.id,'decision.id');text(d.projectId,'decision.projectId')
   if(d.kind==='greenlight'||d.kind==='cancelProduction')production(d.production,'decision.production')
   if(d.kind==='greenlight')rows(d.paidRows,'decision.paidRows')
   if(d.kind!=='rewrite')continue
   const input=object(d.nativeInput,'rewrite.nativeInput'),authority=object(d.allocationAuthority,'rewrite.allocationAuthority')
   development(input.development,'rewrite.development');operations(input.operations,'rewrite.operations')
   rows(authority.productions,'rewrite.productions').forEach(p=>production(p,'rewrite.production'))
   strings(authority.projectIds,'rewrite.projectIds');strings(authority.workflowIds,'rewrite.workflowIds')
   observation(authority.developmentContext,'rewrite.developmentContext')
  }
 }
}
/** Invocation-local validation only; each call proves the CURRENT queued
 * action's history, including newly minted carried greenlights. */
export type QueuedCarriedValidation = (state:GameState)=>CarriedProductionAuthority|undefined

/** Only tick supplies the actual native admission witness. The producer state
 * retains zero rows until reception/finalize; only this proof view reads their
 * byte-matching committed pre-release counter. Never a persisted-state policy. */
export function prepareQueuedCarriedValidation(input:GameState,admittedReleaseIds:readonly string[]):QueuedCarriedValidation|undefined {
 if(admittedReleaseIds.length===0)return undefined
 const authority=carriedProductionAuthority(input)
 if(!authority)return undefined
 const ids=new Set(admittedReleaseIds)
 const releases=input.studio.activeProductions.filter(p=>ids.has(p.id)&&authority.productionScripts.has(p.id)).map(p=>structuredClone(p))
 if(releases.length===0)return undefined
 const commitments=new Map(releases.map(p=>{
  const commitment=input.releaseAuthority.commitments.find(row=>row.productionId===p.id)
  if(p.remainingTicks!==1||!commitment)fail('queued release witness is not committed Ready work')
  return [p.id,structuredClone(commitment)] as const
 }))
 const originals=new Map(releases.map(p=>[p.id,p] as const))
 const arrivedWeek=input.market.tick+1
 return state=>{
  if(state.market.tick!==arrivedWeek)fail('queued release proof belongs to another arrival week')
  for(const original of releases){
   const current=state.studio.activeProductions.find(p=>p.id===original.id)
   if(!current||current.remainingTicks!==0||!same({...current,remainingTicks:1},original)
    ||state.studio.releasedFilms.some(f=>f.productionId===original.id)
    ||!same(state.releaseAuthority.commitments.find(row=>row.productionId===original.id),commitments.get(original.id)))fail('queued release differs from its actual admission witness')
  }
  // Derive afresh after EACH action. No pre-action authority is reused for
  // newly paid productions or decisions; the live validator remains strict.
  const proofState={...state,studio:{...state.studio,activeProductions:state.studio.activeProductions.map(p=>originals.has(p.id)?{...p,remainingTicks:1}:p)}}
  return carriedProductionAuthority(proofState)
 }
}

export function carriedProductionAuthority(state:GameState):CarriedProductionAuthority|undefined {
 const raw=state.rights?.absorptions
 // Older saves retain their existing validation traversal and refusal order.
 if(!Array.isArray(raw)||!raw.some(a=>a&&typeof a==='object'&&(a.producerVersion==='absorption-scripts/v6'||a.producerVersion==='absorption-obligations/v7'&&Array.isArray(a.scriptDecisions)&&a.scriptDecisions.some(d=>d&&typeof d==='object'&&d.kind==='greenlight'))))return undefined
 assertCarriedHistoryInputShape(state)
 const current=owners(state).filter((a):a is Extract<Owner,{producerVersion:'absorption-scripts/v6'|'absorption-obligations/v7'}>=>a.producerVersion==='absorption-scripts/v6'||a.producerVersion==='absorption-obligations/v7'&&a.scriptDecisions.some(d=>d.kind==='greenlight'))
 // This replays exact receipt IDs/order, source bargains/paid work, earned
 // assessment and every native lifecycle transition BEFORE granting any lookup.
 validateContinuedScriptHistory(state)
 const ids=new Set(current.flatMap(a=>a.scriptDecisions.filter(d=>d.kind==='greenlight').map(d=>d.projectId)))
 const projects=current.flatMap(a=>a.continuedScripts.map(row=>row.project)).filter(p=>ids.has(p.id))
 const conceptIds=new Set(projects.map(p=>p.conceptId))
 const concepts=state.hollywood!.concepts.filter(c=>conceptIds.has(c.id))
 if(concepts.length!==conceptIds.size)fail('native production has no exact source concept')
 const productionScripts=new Map(projects.filter(p=>p.productionId!==null).map(p=>[p.productionId!,p] as const))
 const originalProductions=current.flatMap(a=>a.scriptDecisions.flatMap(d=>d.kind==='greenlight'?[d.production]:d.kind==='cancelProduction'?[d.production]:[]))
 const productionScriptHistory=new Map<string,Readonly<{studioId:string;project:ScriptProject;firstTakeEarliestWeek:number;firstTakeLatestWeek:number|null}>>()
 for(const a of current)for(const decision of a.scriptDecisions){
  if(decision.kind!=='greenlight')continue
  const project=a.continuedScripts.find(row=>row.project.id===decision.projectId)?.project
  if(!project||productionScriptHistory.has(decision.production.id))fail('native production history has no unique screenplay')
  // Greenlight's input week is skipped. Four later countdown advances
  // reach the native 5→4 take, whose receipt names the produced week.
  const firstTakeEarliestWeek=decision.week+(decision.production.remainingTicks-4)+1
  const terminal=a.scriptDecisions.find(d=>(d.kind==='cancelProduction'&&d.production.id===decision.production.id)
    ||(d.kind==='productionReleased'&&d.productionId===decision.production.id))
  const live=state.studio.activeProductions.find(p=>p.id===decision.production.id)
  // At a cancellation/current boundary B with remaining r, the take has
  // already produced remaining=4; at least4-r later advances were needed.
  // A release receipt instead names input R, with1→0 still ahead of its
  // produced week: from4 it needs three prior advances, hence latest R-3.
  const boundary=terminal?.week??state.market.tick
  const remaining=terminal?.kind==='cancelProduction'?terminal.production.remainingTicks:live?.remainingTicks
  const firstTakeLatestWeek=terminal?.kind==='productionReleased'?terminal.week-3
    :remaining!==undefined&&remaining<=4?boundary-(4-remaining):null
  productionScriptHistory.set(decision.production.id,{studioId:a.buyerId,project,firstTakeEarliestWeek,firstTakeLatestWeek})
 }
 return {concepts,productionScripts,productionScriptHistory,originalProductions}
}
export function carriedConceptForProduction(state:GameState,productionId:string,prepared?:CarriedProductionAuthority):FilmConcept|undefined {
 const authority=prepared??carriedProductionAuthority(state)
 const original=authority?.originalProductions.find(p=>p.id===productionId)
 return original===undefined?undefined:authority?.concepts.find(c=>c.id===original.conceptId)
}

/** Bind actual native reservations after production allocation, using the SAME buyer facility pool. */
export function bindContinuedScripts(state:GameState,id:string,occupied:ReadonlySet<string>):GameState{
 let next=state
 const original=owners(state).find(a=>a.id===id)
 if(!original)return state
 if(original.buyerId!==state.hollywood?.playerStudioId)fail('rival buyer drafting producer required')
 for(const originalRow of original.continuedScripts){
  const allocated=allocateRightsId(next.rights,'absorbed-script')
  const boundPool=buyerScriptDevelopment(next)
  const pool={...boundPool,projects:boundPool.projects.filter(p=>!original.continuedScripts.some(r=>r.project.id===p.id&&r.project.id===r.sourceScriptProjectId))}
  const reservation=allocateScriptReservation(buyerOperationsForAllWork(next),pool,allocated.id,occupied)
  if(!reservation)fail('buyer native development capacity unavailable')
  next={...next,rights:{...allocated.root,absorptions:allocated.root.absorptions.map(a=>a.id===id&&(a.producerVersion==='absorption-scripts/v3'||a.producerVersion==='absorption-scripts/v4'||(a.producerVersion==='absorption-scripts/v5'||a.producerVersion==='absorption-scripts/v6'||a.producerVersion==='absorption-obligations/v7'))?{...a,
   continuedScripts:a.continuedScripts.map(r=>r.sourceScriptProjectId===originalRow.sourceScriptProjectId?{...r,reservationAtClose:reservation,
    project:{...r.originalScript,id:allocated.id,reservation}}:r)}:a)}}
 }
 return next
}
/** ONE native script-work pass for own and continued work, in stored order. */
export function advanceBuyerScriptWork(state:GameState,arrivalWeek:number,estUplift:number):{state:GameState;development:ScriptDevelopment}{
 const before=buyerScriptDevelopment(state)
 const foreign=owners(state).filter(a=>a.buyerId===state.hollywood?.playerStudioId).flatMap(a=>a.continuedScripts.map(row=>({a,row})))
 if(foreign.length&&closedWeekOf(state).has(state.hollywood!.playerStudioId))fail('closed buyer cannot advance writing')
 const completed=completeDueScriptWork(before,arrivalWeek,{concepts:buyerScriptConcepts(state),talent:state.talent,estUplift})
 let rights=state.rights
 for(const {a,row} of foreign){
  const project=completed.projects.find(p=>p.id===row.project.id)!
  if(project===row.project)continue
  if((row.project.status!=='drafting'&&row.project.status!=='rewriting')||project.status!=='review'||project.assessment===null)fail('unexpected native script transition')
  if(a.scriptCompletions.some(r=>r.projectId===project.id&&r.week===arrivalWeek)||a.scriptCompletions.filter(r=>r.projectId===project.id).length>=(row.project.rewriteCount===1?2:1))fail('completion replay')
  const writer=state.talent.find(t=>t.id===project.writerId)!
  const rewriting=writer.skills.writing.rewriting
  if(row.project.status==='rewriting'&&!rewriting)fail('native rewrite skill context missing')
  const writerRewriting=row.project.status==='rewriting'&&rewriting?{actual:rewriting.actual,perceived:rewriting.perceived}:null
  const allocated=allocateRightsId(rights,'script-completion')
  const receipt:AbsorptionScriptCompletion={id:allocated.id,projectId:project.id,week:arrivalWeek,inputWeek:state.market.tick,estUplift,writerRewriting,assessment:{...project.assessment},developmentContext:{facilities:structuredClone(state.operations.facilities),placements:structuredClone(state.placement.facilities),paidRows:state.ledger.filter(r=>r.kind==='constructionCapex'&&r.week<=state.market.tick&&state.placement.facilities.some(p=>p.projectId===r.constructionProjectId)).map(r=>({projectId:r.constructionProjectId!,week:r.week,amount:r.amount}))}}
  rights={...allocated.root,absorptions:allocated.root.absorptions.map(r=>r.id===a.id&&(r.producerVersion==='absorption-scripts/v3'||r.producerVersion==='absorption-scripts/v4'||(r.producerVersion==='absorption-scripts/v5'||r.producerVersion==='absorption-scripts/v6'||r.producerVersion==='absorption-obligations/v7'))?{...r,
   continuedScripts:r.continuedScripts.map(s=>s.project.id===project.id?{...s,project}:s),scriptCompletions:[...r.scriptCompletions,receipt]}:r)}
 }
 const own=new Set(state.scriptDevelopment.projects.map(p=>p.id))
 return {state:{...state,rights},development:{...state.scriptDevelopment,projects:completed.projects.filter(p=>own.has(p.id))}}
}
/** The public buyer decision uses the genuine combined native work pool; source history is untouched. */
export function acceptContinuedScript(state:GameState,projectId:string,writingContext:LiveWritingContext=prepareLiveWritingContext(state)):GameState {
 const owner=continuedScriptOwner(state,projectId)
 if(!owner)fail('unknown buyer review project')
 if(owner.a.buyerId!==state.hollywood?.playerStudioId||closedWeekOf(state).has(owner.a.buyerId))fail('review decision requires operating buyer')
 const completed=acceptScriptProject(buyerScriptDevelopment(state),projectId)
 const project=completed.projects.find(p=>p.id===projectId)!
 const allocated=allocateRightsId(state.rights,'script-decision')
 const decision={id:allocated.id,projectId,kind:'accept' as const,week:state.market.tick}
 const next={...state,rights:{...allocated.root,absorptions:allocated.root.absorptions.map((a):AbsorptionRecord=>{
  if(a.id!==owner.a.id||!(a.producerVersion==='absorption-scripts/v3'||a.producerVersion==='absorption-scripts/v4'||(a.producerVersion==='absorption-scripts/v5'||a.producerVersion==='absorption-scripts/v6'||a.producerVersion==='absorption-obligations/v7')))return a
  const continuedScripts=a.continuedScripts.map(r=>r.project.id===projectId?{...r,project}:r)
  if((a.producerVersion==='absorption-scripts/v5'||a.producerVersion==='absorption-scripts/v6'||a.producerVersion==='absorption-obligations/v7'))return {...a,continuedScripts,scriptDecisions:[...a.scriptDecisions,decision]}
  return {...a,producerVersion:'absorption-scripts/v4',continuedScripts,scriptDecisions:[...(a.producerVersion==='absorption-scripts/v4'?a.scriptDecisions:[]),decision]}
 })}}
 validateContinuedScripts(next,liveRetirementWritingAuthority(next,writingContext))
 return next
}
export function carriedRewriteHistorySupported(state:GameState):boolean {
 return state.scriptDevelopment.projects.length===0&&buyerScriptDevelopment(state).projects.length===1
}
/** A real buyer rewrite: native allocator and existing contracted-time/busy gates, no new commission. */
export function rewriteContinuedScript(state:GameState,projectId:string,writingContext:LiveWritingContext=prepareLiveWritingContext(state)):GameState {
 const owner=continuedScriptOwner(state,projectId)
 if(!owner)fail('unknown buyer rewrite project')
 if(owner.a.buyerId!==state.hollywood?.playerStudioId||closedWeekOf(state).has(owner.a.buyerId))fail('rewrite requires operating buyer')
 // The native own root does not preserve historical task reservations after completion.
 // Admit only the real single carried task until a coupled historical owner exists.
 if(!carriedRewriteHistorySupported(state))fail('competing screenplay history producer required')
 const writer=owner.row.project.writerId
 if(!activeContract(state,writer,state.market.tick))fail('rewrite writer is not buyer contracted')
 if(busyTalentIds(state).has(writer))fail('rewrite writer has an active assignment')
 const occupiedSlots=[...new Set([...castingOccupiedFacilitySlots(state.castingSessions),...resourceClaims(state).filter(r=>r.owner==='installation'&&r.facilitySlotKey!==null).map(r=>r.facilitySlotKey!)])].sort()
 const nativeInput={operations:structuredClone(buyerOperationsForAllWork(state)),development:structuredClone(buyerScriptDevelopment(state)),occupiedSlots}
 const allocationAuthority={projectIds:nativeInput.development.projects.map(p=>p.id),workflowIds:nativeInput.operations.workflows.map(w=>w.productionId),productions:structuredClone(buyerOperatedProductions(state)),occupiedSlots:[...occupiedSlots],
  developmentContext:{facilities:structuredClone(state.operations.facilities),placements:structuredClone(state.placement.facilities),paidRows:state.ledger.filter(r=>r.kind==='constructionCapex'&&r.week<=state.market.tick&&state.placement.facilities.some(p=>p.projectId===r.constructionProjectId)).map(r=>({projectId:r.constructionProjectId!,week:r.week,amount:r.amount}))},estUplift:developmentOfficeEstUplift(state)}
 const development=requestScriptRewrite(nativeInput.development,nativeInput.operations,projectId,state.market.tick,new Set(occupiedSlots))
 const project=development.projects.find(p=>p.id===projectId)!
 if(project.reservation===null)fail('native rewrite returned no reservation')
 const allocated=allocateRightsId(state.rights,'script-decision')
 const decision:AbsorptionScriptDecision={id:allocated.id,projectId,kind:'rewrite',week:state.market.tick,reservation:structuredClone(project.reservation),nativeInput,allocationAuthority}
 const next={...state,rights:{...allocated.root,absorptions:allocated.root.absorptions.map(a=>a.id===owner.a.id&&(a.producerVersion==='absorption-scripts/v3'||a.producerVersion==='absorption-scripts/v4'||(a.producerVersion==='absorption-scripts/v5'||a.producerVersion==='absorption-scripts/v6'||a.producerVersion==='absorption-obligations/v7'))?withScriptDecisions(a,
  a.continuedScripts.map(r=>r.project.id===projectId?{...r,project}:r),
  [...(a.producerVersion==='absorption-scripts/v3'?[]:a.scriptDecisions),decision],a.producerVersion==='absorption-scripts/v6'?'absorption-scripts/v6':'absorption-scripts/v5'):a)}}
 validateContinuedScripts(next,liveRetirementWritingAuthority(next,writingContext))
 return next
}
function validateDevelopmentObservation(state:GameState,ctx:AbsorptionScriptCompletion['developmentContext'],inputWeek:number,estUplift:number):void {
    if(!ctx||!exact(ctx,['facilities','placements','paidRows'])||!Array.isArray(ctx.facilities)||!Array.isArray(ctx.placements)||!Array.isArray(ctx.paidRows))fail('native facility observation missing')
    const placementIds=new Set<number>()
    for(const p of ctx.placements){
     if(!p||!exact(p,['id','blueprintId','parcelId','origin','cells','facilityId','projectId','status','placedWeek','completesWeek','cancellation',...(Object.hasOwn(p,'installation')?['installation']:[])])||placementIds.has(p.id)||!Number.isInteger(p.id)||p.id<1||!FACILITY_BLUEPRINTS.some(b=>b.id===p.blueprintId)
      ||!Number.isInteger(p.placedWeek)||p.placedWeek<0||p.placedWeek>inputWeek||!Number.isInteger(p.completesWeek)||p.completesWeek<p.placedWeek
      ||!['operational','underConstruction','cancelled'].includes(p.status)||p.status==='operational'&&p.completesWeek>inputWeek
      ||p.status==='underConstruction'&&p.completesWeek<=inputWeek)fail('native facility observation timing differs')
     placementIds.add(p.id)
     const retained=state.placement.facilities.find(now=>now.id===p.id)
     if(retained&&(retained.blueprintId!==p.blueprintId||retained.projectId!==p.projectId||retained.facilityId!==p.facilityId||retained.placedWeek!==p.placedWeek||retained.completesWeek!==p.completesWeek||!same(retained.installation,p.installation)))fail('native facility observation source differs')
     const paid=state.ledger.filter(l=>l.kind==='constructionCapex'&&l.constructionProjectId===p.projectId&&l.week===p.placedWeek)
     if(paid.length===0||paid.some(l=>!Number.isFinite(l.amount)||l.amount>=0))fail('native facility observation has no paid source')
    }
    const paidRows=state.ledger.filter(l=>l.kind==='constructionCapex'&&l.week<=inputWeek&&ctx.placements.some(p=>p.projectId===l.constructionProjectId)).map(l=>({projectId:l.constructionProjectId!,week:l.week,amount:l.amount}))
    if(!same(ctx.paidRows,paidRows))fail('native facility paid observation differs')
    const facilities=new Set<string>()
    for(const f of ctx.facilities){
     if(!f||!exact(f,['id','name','capability','capacity'])||facilities.has(f.id)||typeof f.id!=='string'||typeof f.name!=='string'||!Number.isInteger(f.capacity)||f.capacity<0||!['development-casting','soundstage','set-scenery','post','laboratory'].includes(f.capability))fail('native facility registry observation differs')
     facilities.add(f.id)
     const retained=state.operations.facilities.find(now=>now.id===f.id)
     if(retained&&retained.capability!==f.capability)fail('native facility registry source differs')
     if(!retained&&!ctx.placements.some(p=>p.facilityId===f.id&&p.status==='operational'))fail('native facility registry observation has no source')
    }
    const observed={...state,operations:{...state.operations,facilities:ctx.facilities},placement:{...state.placement,facilities:ctx.placements}}
    if(estUplift!==developmentOfficeEstUplift(observed))fail('native facility assessment effect differs')
}
function validateCompletionContext(state:GameState,r:AbsorptionScriptCompletion):void {
 validateDevelopmentObservation(state,r.developmentContext,r.inputWeek,r.estUplift)
}
/** Exact current owner proof. The caller forwards only its same-invocation native
 * retirement proof; exact task/week checks confer no new carried-task grant. */
export function validateContinuedScriptHistory(state:GameState):void{
 const player=state.hollywood?.playerStudioId
 const current=owners(state)
 const nativeIds=state.scriptDevelopment.projects.map(p=>p.id)
 const seen=new Set(nativeIds)
 for(const a of current){
  if(a.buyerId!==player||!Array.isArray(a.continuedScripts)||a.continuedScripts.length===0||!Array.isArray(a.scriptCompletions))fail('unknown native writing owner')
  const source=state.hollywood!.businesses.find(b=>b.studioId===a.targetId)!
  const still=source.development.projects.filter(p=>p.status==='drafting'||p.status==='rewriting')
  const stopped=new Set(a.stoppedScripts.map(p=>p.scriptProjectId))
  if(!same(a.continuedScripts.map(r=>r.sourceScriptProjectId),still.filter(p=>!stopped.has(p.id)).map(p=>p.id)))fail('source continuation bijection/order differs')
  const decisions:AbsorptionScriptDecision[]=a.producerVersion==='absorption-scripts/v3'?[]:a.scriptDecisions
  if(!Array.isArray(decisions)||(a.producerVersion!=='absorption-scripts/v3'&&a.producerVersion!=='absorption-obligations/v7'&&decisions.length===0))fail('missing buyer script decision')
  if(a.producerVersion==='absorption-scripts/v5'&&!decisions.some(d=>d.kind==='rewrite'))fail('rewrite producer has no actual request')
  if(a.producerVersion==='absorption-scripts/v6'&&!decisions.some(d=>d.kind==='greenlight'))fail('native production producer has no actual greenlight')
  const decisionKeys=new Set<string>()
  let lastDecisionWeek=a.week
  let lastDecisionOrder=Number(a.id.slice(a.id.lastIndexOf('-')+1))
  for(const decision of decisions){
   if(!decision||typeof decision!=='object')fail('buyer script decision shape differs')
   if(typeof decision.id!=='string')fail('buyer script decision id must be a string')
   const receiptOrder=Number(decision.id.slice(decision.id.lastIndexOf('-')+1))
   if((a.producerVersion==='absorption-scripts/v6'||a.producerVersion==='absorption-obligations/v7')&&(!Number.isSafeInteger(receiptOrder)||receiptOrder<=lastDecisionOrder||receiptOrder>=state.rights.nextId))fail('native production receipt order differs')
   lastDecisionOrder=receiptOrder
   const rewrite=decision.kind==='rewrite'
   const greenlight=decision.kind==='greenlight',cancel=decision.kind==='cancelProduction',released=decision.kind==='productionReleased'
   const lifecycle=greenlight||cancel||released
   if(!decision||!exact(decision,rewrite?['id','projectId','kind','week','reservation','nativeInput','allocationAuthority']:greenlight?['id','projectId','kind','week','production','paidRows']:cancel?['id','projectId','kind','week','production']:released?['id','projectId','kind','week','productionId']:['id','projectId','kind','week'])||!/^script-decision-[1-9][0-9]*$/.test(decision.id)
    ||decision.kind!=='accept'&&!rewrite&&!lifecycle||lifecycle&&a.producerVersion!=='absorption-scripts/v6'&&a.producerVersion!=='absorption-obligations/v7'||rewrite&&(a.producerVersion!=='absorption-scripts/v5'&&a.producerVersion!=='absorption-scripts/v6'&&a.producerVersion!=='absorption-obligations/v7')
    ||!Number.isInteger(decision.week)||decision.week<lastDecisionWeek||decision.week>state.market.tick||decision.week>=(closedWeekOf(state).get(a.buyerId)??Infinity)
    ||decisionKeys.has(`${decision.projectId}:${decision.kind}:${lifecycle?(released?decision.productionId:decision.production.id):''}`)||!a.continuedScripts.some(r=>r.project.id===decision.projectId))fail('buyer script decision authority/order differs')
   decisionKeys.add(`${decision.projectId}:${decision.kind}:${lifecycle?(released?decision.productionId:decision.production.id):''}`);lastDecisionWeek=decision.week
  }
  const expectedReceipts:{projectId:string;week:number}[]=[]
  for(const row of a.continuedScripts){
   if(!exact(row,['sourceScriptProjectId','sourceContractIds','buyerContractIds','originalScript','originalCosts','reservationAtClose','project']))fail('unknown continuation fields')
   const original=source.development.projects.find(p=>p.id===row.sourceScriptProjectId)
   const cost=source.projects.find(p=>p.scriptProjectId===row.sourceScriptProjectId)
   if(!original||!same(original,row.originalScript)||!cost||!same(cost,row.originalCosts)||original.productionId!==null||cost.productionId!==null
    ||original.dueWeek===null||original.dueWeek<=a.week||original.commissionedWeek>a.week||original.reservation===null)fail('original paid creator/script history differs')
   const project=row.project
   if(!/^absorbed-script-[1-9][0-9]*$/.test(project.id)||seen.has(project.id))fail('native work identity collision')
   seen.add(project.id);nativeIds.push(project.id)
   const writers=[...new Set(original.writerIds)]
   const links=writers.map(id=>a.contracts.find(c=>c.talentId===id))
   if(writers.length===0||links.some(c=>!c||c.buyerContractId===null)
    ||!same(row.sourceContractIds,links.map(c=>c!.sourceContractId))||!same(row.buyerContractIds,links.map(c=>c!.buyerContractId)))fail('partial or missing retained writer team')
   for(const link of links){
    const old=state.hollywood!.employment.find(e=>e.contractId===link!.sourceContractId)!
    const kept=state.hollywood!.employment.find(e=>e.contractId===link!.buyerContractId)!
    if(!old||!kept||old.studioId!==a.targetId||old.terms.startWeek>original.commissionedWeek||old.terms.endWeekExclusive<=a.week||old.endedWeek!==a.week
     ||kept.studioId!==a.buyerId||kept.reason!=='absorptionContinuation'||kept.terms.startWeek!==a.week||kept.terms.endWeekExclusive<original.dueWeek
     ||!same(kept.terms,{...old.terms,startWeek:a.week,termWeeks:old.terms.endWeekExclusive-a.week}))fail('original source and actual buyer writing bargain differ')
   }
   const until=Math.min(state.market.tick,closedWeekOf(state).get(a.buyerId)??Infinity)
   const allReceipts=a.scriptCompletions.filter(r=>r.projectId===project.id)
   const receipts=allReceipts.filter(r=>r.week===original.dueWeek)
   const due=original.dueWeek<=until
   if(receipts.length!==(due?1:0))fail('native completion/actual due boundary bijection differs')
   let expected:ScriptProject={...original,id:project.id,reservation:row.reservationAtClose}
   if(due){
    const r=receipts[0]!
    if(!exact(r,['id','projectId','week','inputWeek','estUplift','developmentContext','writerRewriting','assessment'])||!/^script-completion-[1-9][0-9]*$/.test(r.id)
     ||r.week!==original.dueWeek||r.inputWeek!==r.week-1||r.inputWeek<a.week||![0,SCRIPT_DEVELOPMENT_OFFICE_TIER_2_EST_UPLIFT,SCRIPT_DEVELOPMENT_OFFICE_TIER_3_EST_UPLIFT].includes(r.estUplift))fail('completion observation differs')
    validateCompletionContext(state,r)
    const concept=state.hollywood!.concepts.find(c=>c.id===original.conceptId)
    if(!concept)fail('native completion source concept missing')
    let assessment
    if(original.status==='drafting'){
     if(r.writerRewriting!==null)fail('first draft invents rewrite context')
     assessment=assessFirstDraft(concept,r.estUplift)
    }else{
     const profile=r.writerRewriting
     if(!original.assessment||!profile||!exact(profile,['actual','perceived'])||![profile.actual,profile.perceived].every(n=>Number.isFinite(n)&&n>=0&&n<=100))fail('rewrite observation missing')
     const clamp=(n:number)=>Math.max(0,Math.min(100,n))
     assessment={actualStrength:clamp(original.assessment!.actualStrength+scriptRewriteDelta(original.assessment!.actualStrength,profile!.actual)),
      perceivedStrength:clamp(original.assessment!.perceivedStrength+scriptRewriteDelta(original.assessment!.perceivedStrength,profile!.perceived))}
    }
    if(!same(r.assessment,assessment))fail('native earned assessment differs')
    expected={...expected,status:'review',dueWeek:null,reservation:null,assessment}
    expectedReceipts.push({projectId:project.id,week:r.week})
   }
   let latestCompletion=original.dueWeek
   let expectedCount=due?1:0
   for(const decision of decisions.filter(r=>r.projectId===project.id)){
    if(!due||decision.week<latestCompletion)fail('buyer review decision precedes earned completion')
    if(decision.kind==='accept'){
     expected=acceptScriptProject({mode:'managed',projects:[expected]},project.id).projects[0]!
     continue
    }
    if(decision.kind==='greenlight'){
     const p=decision.production
     if(!p||p.startTick!==decision.week||p.remainingTicks!==TUNING.PRODUCTION_TICKS||p.conceptId!==expected.conceptId||p.writerId!==expected.writerId
      ||!same(p.shape,expected.shape)||!same(p.promise,expected.promise)||!Array.isArray(decision.paidRows))fail('native greenlight differs from earned Ready source')
     const paid=state.ledger.filter(row=>row.productionId===p.id&&(row.kind==='production'||row.kind==='freelancerFee'))
     const debit=paid.filter(row=>row.kind==='production')
     if(!same(paid,decision.paidRows)||debit.length!==1||debit[0]!.week!==decision.week||debit[0]!.amount!==-(p.budget.negative+p.budget.marketing)
      ||paid.some(row=>row.week!==decision.week||row.amount>=0))fail('native greenlight lacks exact actual paid source')
     const live=state.studio.activeProductions.find(row=>row.id===p.id)
     // Native operations change only the countdown. Sound/technology/shooting
     // progress lives in its own independently validated roots, not this row.
     if(live&&(!Number.isInteger(live.remainingTicks)||live.remainingTicks<1||live.remainingTicks>p.remainingTicks
      ||state.market.tick-decision.week<p.remainingTicks-live.remainingTicks
      ||!same({...live,remainingTicks:p.remainingTicks},p)))fail('native active production differs from paid greenlight')
     expected=linkScriptProjectToProduction({mode:'managed',projects:[expected]},project.id,p.id).projects[0]!
     continue
    }
    if(decision.kind==='cancelProduction'){
     const p=decision.production
     const original=decisions.find(d=>d.kind==='greenlight'&&d.production.id===p?.id)
     if(!p||!original||original.kind!=='greenlight'||expected.productionId!==p.id||p.remainingTicks<1||p.remainingTicks>original.production.remainingTicks
      ||decision.week-original.week<original.production.remainingTicks-p.remainingTicks
      ||!same({...p,remainingTicks:original.production.remainingTicks},original.production)
      ||state.studio.activeProductions.some(row=>row.id===p.id)||state.studio.releasedFilms.some(row=>row.productionId===p.id)
      ||state.releaseAuthority.commitments.some(row=>row.productionId===p.id))fail('native cancellation has no exact uncommitted paid production')
     expected=returnScriptProjectToReady({mode:'managed',projects:[expected]},p.id).projects[0]!
     continue
    }
    if(decision.kind==='productionReleased'){
     const film=state.studio.releasedFilms.find(f=>f.productionId===decision.productionId)
     const original=decisions.find(d=>d.kind==='greenlight'&&d.production.id===decision.productionId)
     if(!film||!original||original.kind!=='greenlight'||film.releaseTick!==decision.week||expected.productionId!==film.productionId||film.conceptId!==expected.conceptId
      ||film.directorId!==original.production.directorId||!same(film.participants,original.production.participants)
      ||!same(film.forecast,original.production.participants?{expectedOpening:original.production.forecastSnapshot.expectedOpening,expectedTotal:original.production.forecastSnapshot.expectedTotal,expectedCriticScore:original.production.forecastSnapshot.expectedCriticScore}:undefined)
      ||state.studio.activeProductions.some(p=>p.id===film.productionId))fail('native carried release lacks actual buyer film')
     expected=markScriptProjectProduced({mode:'managed',projects:[expected]},film.productionId).projects[0]!
     continue
    }
    const input=decision.nativeInput
    if(!input||!exact(input,['operations','development','occupiedSlots'])||!Array.isArray(input.occupiedSlots)
     ||!same(input.occupiedSlots,[...new Set(input.occupiedSlots)].sort())||input.occupiedSlots.some(k=>typeof k!=='string')
     ||!input.development||!Array.isArray(input.development.projects)||!same(input.development.projects.find(p=>p.id===project.id),expected))fail('native rewrite input differs from earned project')
    if(!exact(input.development,['mode','projects'])||input.development.mode!=='managed'||!input.operations||!exact(input.operations,['mode','facilities','workflows'])||input.operations.mode!=='managed'||!Array.isArray(input.operations.facilities)||!Array.isArray(input.operations.workflows))fail('native rewrite owner context differs')
    const decisionOrder=Number(decision.id.slice(decision.id.lastIndexOf('-')+1))
    const authority=decision.allocationAuthority
    if(!authority||!exact(authority,['projectIds','workflowIds','productions','occupiedSlots','developmentContext','estUplift'])||!Array.isArray(authority.projectIds)||!Array.isArray(authority.workflowIds)
     ||!Array.isArray(authority.productions)||!Array.isArray(authority.occupiedSlots)||!same(input.occupiedSlots,authority.occupiedSlots)
     ||!same(input.development.projects.map(p=>p.id),authority.projectIds)||!same(input.operations.workflows.map(w=>w.productionId),authority.workflowIds)
     ||new Set(authority.projectIds).size!==authority.projectIds.length||new Set(authority.workflowIds).size!==authority.workflowIds.length)fail('native rewrite complete allocation pool differs')
    validateDevelopmentObservation(state,authority.developmentContext,decision.week,authority.estUplift)
    if(!same(input.operations.facilities,authority.developmentContext.facilities))fail('native rewrite facilities differ from observed source')
    if(!same(authority.workflowIds,authority.productions.map(p=>p.id)))fail('native rewrite production inventory differs')
    assertStudioOperationsInvariants(input.operations,authority.productions,{facilityPolicy:'configured',offlineFacilityIds:'deferred',sharedOccupancy:{scriptDevelopment:input.development}})
    for(const observed of authority.productions){
     const foreign=state.rights.absorptions.filter(owner=>owner.buyerId===a.buyerId&&owner.week<=decision.week&&Number(owner.id.slice(owner.id.lastIndexOf('-')+1))<decisionOrder).flatMap(owner=>owner.continuedProductions.map(r=>({owner,row:r}))).find(r=>r.row.productionId===observed.id)
     if(foreign){
      const original=foreign.row.originalProduction
      const priorSteps=foreign.owner.workSteps.filter(step=>step.productionId===observed.id&&step.week<decision.week)
      const remaining=priorSteps.length?priorSteps[priorSteps.length-1]!.afterRemaining:original.remainingTicks
      if(observed.remainingTicks!==remaining||observed.conceptId!==original.conceptId||observed.startTick!==original.startTick||!same(observed.budget,original.budget)||observed.writerId!==original.writerId||!same(observed.shape,original.shape)||!same(observed.promise,original.promise))fail('native rewrite observed production differs from paid work')
     }else{
      const paid=state.ledger.filter(l=>l.kind==='production'&&l.productionId===observed.id&&l.week<=decision.week)
      if(paid.length===0||paid[0]!.week!==observed.startTick||!Number.isFinite(paid[0]!.amount)||paid[0]!.amount>-(observed.budget.negative+observed.budget.marketing))fail('native rewrite observed production has no paid source')
     }
    }
    for(const own of state.studio.activeProductions.filter(p=>p.startTick<decision.week))if(!authority.workflowIds.includes(own.id))fail('native rewrite own workflow pool incomplete')
    for(const film of state.studio.releasedFilms.filter(f=>f.releaseTick>=decision.week)){
     const paid=state.ledger.find(l=>l.kind==='production'&&l.productionId===film.productionId&&l.week<decision.week)
     if(paid&&!authority.workflowIds.includes(film.productionId))fail('native rewrite released workflow history incomplete')
    }
    // Native own projects are append-only canonical rows. Older commissions cannot be omitted;
    // observed same-week prefix binds action order without inventing later commissions in the past.
    const ownAtRequest=state.scriptDevelopment.projects.filter(p=>authority.projectIds.includes(p.id))
    if(!same(authority.projectIds.slice(0,ownAtRequest.length),ownAtRequest.map(p=>p.id))
     ||state.scriptDevelopment.projects.some(p=>p.commissionedWeek<decision.week&&!authority.projectIds.includes(p.id)))fail('native rewrite own project pool incomplete')
    const carriedAtRequest=current.filter(owner=>owner.week<=decision.week).flatMap(owner=>owner.continuedScripts.map(r=>r.project)).filter(p=>Number(p.id.slice(p.id.lastIndexOf('-')+1))<decisionOrder)
    if(!same(authority.projectIds.slice(ownAtRequest.length),carriedAtRequest.map(p=>p.id)))fail('native rewrite carried project pool incomplete')
    if(ownAtRequest.length!==0||carriedAtRequest.length!==1||carriedAtRequest[0]!.id!==project.id||!same(authority.projectIds,[project.id]))fail('competing screenplay history is not admitted')
    // The sole native input project was exactly compared to reconstructed earned state above;
    // there is no competing historical task whose discarded live reservation could be trusted.
    for(const workflow of input.operations.workflows){
     const foreign=state.rights.absorptions.filter(owner=>owner.buyerId===a.buyerId&&owner.week<=decision.week&&Number(owner.id.slice(owner.id.lastIndexOf('-')+1))<decisionOrder).flatMap(owner=>owner.continuedProductions.map(r=>({owner,row:r}))).find(r=>r.row.productionId===workflow.productionId)
     const paid=state.ledger.find(l=>l.kind==='production'&&l.productionId===workflow.productionId&&l.week<=decision.week)
     if(!paid&&!foreign)fail('native rewrite workflow has no genuine paid owner')
     if(foreign){
      const ended=foreign.owner.workCancellations.find(r=>r.productionId===workflow.productionId)?.week??foreign.owner.workReleases.find(r=>r.productionId===workflow.productionId)?.week??Infinity
      if(ended<decision.week)fail('native rewrite workflow follows actual work end')
     }
    }
    // All authentic acquired work still operating at this request belongs in the pool.
    for(const owner of state.rights.absorptions.filter(owner=>owner.buyerId===a.buyerId&&owner.week<=decision.week&&Number(owner.id.slice(owner.id.lastIndexOf('-')+1))<decisionOrder))for(const work of owner.continuedProductions){
     const ended=owner.workCancellations.find(r=>r.productionId===work.productionId)?.week??owner.workReleases.find(r=>r.productionId===work.productionId)?.week??Infinity
     if(ended>decision.week&&!authority.workflowIds.includes(work.productionId))fail('native rewrite acquired workflow pool incomplete')
    }
    const contextIds=new Set<string>()
    for(const observed of input.development.projects){
     const known=state.scriptDevelopment.projects.find(p=>p.id===observed.id)??current.flatMap(owner=>owner.continuedScripts.map(r=>r.project)).find(p=>p.id===observed.id)
     if(!known||contextIds.has(observed.id)||observed.conceptId!==known.conceptId||observed.writerId!==known.writerId||!same(observed.writerIds,known.writerIds)||observed.commissionedWeek!==known.commissionedWeek||!same(observed.shape,known.shape)||!same(observed.promise,known.promise))fail('native rewrite input has no authentic project source')
     contextIds.add(observed.id)
    }
    const employment=state.hollywood!.employment.find(e=>e.studioId===a.buyerId&&e.terms.talentId===expected.writerId&&e.terms.startWeek<=decision.week&&e.terms.endWeekExclusive>decision.week&&(e.endedWeek===null||e.endedWeek>decision.week))
    if(!employment)fail('rewrite has no actual buyer employment authority')
    expected=requestScriptRewrite(input.development,input.operations,project.id,decision.week,new Set(input.occupiedSlots)).projects.find(p=>p.id===project.id)!
    if(!same(expected.reservation,decision.reservation))fail('native rewrite reservation differs')
    const rewriteWeek=decision.week+1
    if(rewriteWeek<=until){
     const repeated=allReceipts.filter(r=>r.week===rewriteWeek)
     if(repeated.length!==1)fail('buyer rewrite completion bijection differs')
     const r=repeated[0]!
     if(!exact(r,['id','projectId','week','inputWeek','estUplift','developmentContext','writerRewriting','assessment'])||!/^script-completion-[1-9][0-9]*$/.test(r.id)||r.inputWeek!==decision.week)fail('buyer rewrite completion boundary differs')
     validateCompletionContext(state,r)
     const profile=r.writerRewriting
     if(!expected.assessment||!profile||!exact(profile,['actual','perceived'])||![profile.actual,profile.perceived].every(n=>Number.isFinite(n)&&n>=0&&n<=100))fail('rewrite observation missing')
     const clamp=(n:number)=>Math.max(0,Math.min(100,n))
     const assessment={actualStrength:clamp(expected.assessment.actualStrength+scriptRewriteDelta(expected.assessment.actualStrength,profile.actual)),perceivedStrength:clamp(expected.assessment.perceivedStrength+scriptRewriteDelta(expected.assessment.perceivedStrength,profile.perceived))}
     if(!same(r.assessment,assessment))fail('native earned rewrite assessment differs')
     expected={...expected,status:'review',dueWeek:null,reservation:null,assessment}
     expectedReceipts.push({projectId:project.id,week:rewriteWeek});expectedCount++;latestCompletion=rewriteWeek
    }else latestCompletion=rewriteWeek
   }
   if(allReceipts.length!==expectedCount)fail('unknown or duplicate buyer completion')
   if(!same(project,expected)||!exact(row.reservationAtClose,['projectId','facilityId','capability','slot'])||row.reservationAtClose.projectId!==project.id)fail('native buyer project differs from original work/earned completion')
  }
  if(!same(a.scriptCompletions.map(r=>[r.projectId,r.week]),expectedReceipts.sort((x,y)=>x.week-y.week).map(r=>[r.projectId,r.week])))fail('completion receipt order or unknown subject differs')
 }
}
export function validateContinuedScripts(state:GameState,retirementWriting?:RetirementWritingAuthority):void{
 validateContinuedScriptHistory(state)
 const player=state.hollywood?.playerStudioId,current=owners(state)
 const nativeIds=[...state.scriptDevelopment.projects.map(p=>p.id),...current.flatMap(a=>a.continuedScripts.map(row=>row.project.id))]
 if(current.length===0)return
 const closed=closedWeekOf(state).get(player!)
 const productionScripts=new Map<string,ScriptProject>(current.filter(a=>a.producerVersion==='absorption-scripts/v6'||a.producerVersion==='absorption-obligations/v7').flatMap(a=>a.continuedScripts.filter(row=>row.project.productionId!==null).map(row=>[row.project.productionId!,row.project] as const)))
 for(const a of state.rights.absorptions.filter(a=>a.buyerId===player)){
  const source=state.hollywood!.businesses.find(b=>b.studioId===a.targetId)!
  for(const row of a.continuedProductions){
   const script=source.development.projects.find(p=>p.productionId===row.productionId&&p.status==='inProduction')
   if(script)productionScripts.set(row.productionId,script)
  }
 }
 assertScriptDevelopmentInvariants(buyerScriptDevelopment(state),{current49ProjectIds:nativeIds,current49ProductionScripts:productionScripts,studioId:player,retirementWriting,
  currentWeek:Math.min(state.market.tick,closed??Infinity),concepts:buyerScriptConcepts(state),talent:state.talent,contracts:state.contracts,
  operations:buyerOperationsForAllWork(state),activeProductions:buyerOperatedProductions(state),releasedFilms:state.studio.releasedFilms})
}
