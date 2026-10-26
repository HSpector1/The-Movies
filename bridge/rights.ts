/** Paid recipient-only disclosure and healthy absorption use the real public owners. */
import type { GameState } from '../src/core/types.js'
import { applyActions } from '../src/core/actions.js'
import { makeSave } from '../src/core/save.js'
import { quoteAbsorption } from '../src/core/acquisition.js'
import { QUOTE_AGE_POLICY_VERSION } from '../src/core/quoteAge.js'
import { TUNING } from '../src/core/tuning.js'
import type { BridgeDiligenceDraftPayload, BridgeDiligenceQuoteSnapshot, BridgeAbsorptionDraftPayload, BridgeAbsorptionQuoteSnapshot } from './schema/bridge-schema.ts'

export function diligenceDraftCopy(draft: BridgeDiligenceDraftPayload): BridgeDiligenceDraftPayload {
 return {target:{...draft.target},scope:[...draft.scope]}
}
export function absorptionDraftCopy(draft: BridgeAbsorptionDraftPayload): BridgeAbsorptionDraftPayload {
 return {targetId:draft.targetId,consideration:draft.consideration,disclosureId:draft.disclosureId,retention:draft.retention.kind==='explicit'?{kind:'explicit',contractIds:[...draft.retention.contractIds]}:{kind:'default'}}
}
export function diligenceDraftApply(current: GameState,draft: BridgeDiligenceDraftPayload) {
 try {const next=applyActions(current,[{kind:'requestDueDiligence',...diligenceDraftCopy(draft)}]);makeSave(next);return {ok:true as const,next}}
 catch(error){return {ok:false as const,error:(error as Error).message}}
}
export function diligenceQuoteSnapshot(state: GameState,draft: BridgeDiligenceDraftPayload,intentId:string):BridgeDiligenceQuoteSnapshot {
 const result=diligenceDraftApply(state,draft)
 // A discarded, actually admitted public successor proves affordability/record identity. No private body is returned.
 const record=result.ok?result.next.rights.diligence[result.next.rights.diligence.length-1]:undefined
 return {intentId,kind:'requestDueDiligence',commitLabel:'Pay for the selected due diligence',startsNow:result.ok,queues:false,queueNote:null,
  ok:result.ok,refusalReason:result.ok?null:result.error,fee:TUNING.RIGHTS_DUE_DILIGENCE_FEE,
  disclosureId:record?.id??null,disclosureWeek:record?.week??null,staleFromWeek:record?.staleFromWeek??null,
  target:{...draft.target},scope:[...draft.scope]}
}
export function absorptionDraftApply(current:GameState,draft:BridgeAbsorptionDraftPayload,quotedAtWeek:number,quoteAgePolicyVersion:typeof QUOTE_AGE_POLICY_VERSION) {
 try {return {ok:true as const,next:applyActions(current,[{kind:'absorbStudio',absorption:{...absorptionDraftCopy(draft),quotedAtWeek,quoteAgePolicyVersion}}])}}
 catch(error){return {ok:false as const,error:(error as Error).message}}
}
export function absorptionQuoteSnapshot(state:GameState,draft:BridgeAbsorptionDraftPayload,intentId:string):BridgeAbsorptionQuoteSnapshot {
 const base={intentId,kind:'absorbStudio' as const,commitLabel:'Absorb the selected studio',queues:false,queueNote:null,
  quotedAtWeek:state.market.tick,quoteAgePolicyVersion:QUOTE_AGE_POLICY_VERSION,targetId:draft.targetId,disclosureId:draft.disclosureId}
 const player=state.hollywood?.playerStudioId
 const q=player===undefined?{kind:'refusal' as const,refusal:'noIndustry'}:quoteAbsorption(state,{...absorptionDraftCopy(draft),buyerId:player,quotedAtWeek:state.market.tick,quoteAgePolicyVersion:QUOTE_AGE_POLICY_VERSION},state.market.tick)
 const applied=q.kind==='quote'?absorptionDraftApply(state,draft,state.market.tick,QUOTE_AGE_POLICY_VERSION):null
 const ok=applied?.ok===true
 // Core quote checks recipient-bound full disclosure before inspecting non-public deal facts.
 return {...base,startsNow:ok,ok,refusalReason:q.kind==='refusal'?q.refusal:applied?.ok===false?applied.error:null,
  terms:q.kind==='quote'?{consideration:q.consideration,targetCashBeforeExits:q.targetCashBeforeExits,exitCharges:q.exitCharges,postExitCash:q.postExitCash,
   guarantees:q.guarantees,outlay:q.outlay,ask:q.ask,reserveAfter:q.reserveAfter,resultingWeeklyFixedCost:q.resultingWeeklyFixedCost,
   affordable:q.affordable,promiseObligations:q.promiseObligations.map(p=>({...p})),marketObligations:{...q.marketObligations},rightsCount:q.rights.length,retainedContracts:q.contracts.filter(c=>c.retained).map(c=>c.contractId),
   exitedContracts:q.contracts.filter(c=>!c.retained).map(c=>c.contractId),scripts:q.scripts.map(s=>({scriptProjectId:s.scriptProjectId,status:s.status,writerIds:[...s.writerIds],disposition:s.disposition,reason:s.reason})),productions:q.productions.map(p=>({productionId:p.productionId,disposition:p.disposition,reason:p.reason}))}:null}
}
