import * as saves from './save.js'
import { breakPromisesOnCancel } from './promises.js'
import { recordCancelledAfterFirstTake } from './relationships.js'
import type { GameState, Production, ProductionWorkflow, StudioOperations } from './types.js'
import { allocateRightsId, type AbsorptionRecord } from './rights.js'
import { addManagedProductionWorkflow, removeManagedProductionWorkflow } from './operations.js'
import { productionCompanyTalentIds } from './productionPeople.js'
import { closedWeekOf } from './operatingState.js'
import { isUnshotContinuationPhase, productionPhaseForRemainingTicks } from './productionPhases.js'

/** A creator's production stays with its genuine paid project. This selector is the actual
 * buyer work/capacity inventory; it is not a second playable lot or a cloned player picture. */
export function buyerContinuedProductions(state: GameState): Production[] {
  const buyer=state.hollywood?.playerStudioId
  return (state.rights?.absorptions ?? []).filter(a=>a.buyerId===buyer).flatMap(a=>{
    const source=state.hollywood!.businesses.find(b=>b.studioId===a.targetId)
    if(!source)throw new Error('continued work: original business missing')
    return source.productions.filter(p=>a.continuedProductions.some(row=>row.productionId===p.id) && !a.workCancellations.some(row=>row.productionId===p.id))
  })
}
export function buyerContinuationWorkflows(state:GameState):ProductionWorkflow[] {
  return (state.rights?.absorptions ?? []).flatMap(a=>a.buyerId===state.hollywood?.playerStudioId ? a.buyerWorkflows : [])
}
export function buyerOperationsForAllWork(state:GameState):StudioOperations {
  return {...state.operations,workflows:[...state.operations.workflows,...buyerContinuationWorkflows(state)]}
}
export function buyerOperatedProductions(state:GameState):Production[] {
  return [...state.studio.activeProductions,...buyerContinuedProductions(state)]
}
export function buyerContinuedTalentIds(state:GameState):string[] {
  return [...productionCompanyTalentIds(buyerContinuedProductions(state))]
}

/** Real unshot silent development/pre-production/rehearsal and already-shot post/release work.
 * Initial silent shooting5 uses real buyer actions; setup/Set-selected, sound and writing remain separate. */
export function continuedWorkRefusal(state:GameState,targetId:string,production:Production):string|null {
  const phase=productionPhaseForRemainingTicks(production.remainingTicks)
  const earlier=isUnshotContinuationPhase(phase)
  const completedTake=phase==='shooting' && production.remainingTicks===4
  const initialTake=phase==='shooting' && production.remainingTicks===5
  if(!earlier && !completedTake && !initialTake && phase!=='postProduction' && phase!=='releaseReady')return 'retainedEarlierProductionPhaseOwnerRequired'
  const take=state.firstTakes.find(row=>row.productionId===production.id)
  if((earlier || initialTake) && take)return 'earlierProductionAlreadyHasFirstTake'
  if(!earlier && !initialTake && !take)return 'continuedProductionMissingActualFirstTake'
  const source=state.hollywood?.businesses.find(b=>b.studioId===targetId)
  const workflow=source?.operations.workflows.find(w=>w.productionId===production.id)
  if(!workflow || workflow.phase!==phase)return 'continuedProductionMissingActualWorkflow'
  if(workflow.setup!==null)return 'retainedSetupWorkflowOwnerRequired'
  if(earlier && (workflow.bindings.requiresSetBinding!==false || state.technology.productions.some(p=>p.productionId===production.id)))return 'retainedEarlierSetOrSelectedTechnologyOwnerRequired'
  if(initialTake){
    const locks=state.technology.productions.filter(p=>p.productionId===production.id)
    if(workflow.bindings.requiresSetBinding!==false || workflow.shootingTask?.status!=='unassigned'
      || workflow.shootingTask.directorId!==production.directorId || locks.length!==1
      || locks[0]!.studioId!==targetId || locks[0]!.method!=='silent' || locks[0]!.adoptionId!==null
      || locks[0]!.lockedWeek===null || locks[0]!.lockedWeek>state.market.tick)return 'retainedInitialTakeSilentSourceRequired'
  }
  if(completedTake){
    const locks=state.technology.productions.filter(p=>p.productionId===production.id)
    if(workflow.bindings.requiresSetBinding!==false || workflow.shootingTask?.status!=='completed'
      || workflow.shootingTask.directorId!==production.directorId || take?.studioId!==targetId
      || locks.length!==1 || locks[0]!.studioId!==targetId || locks[0]!.method!=='silent'
      || locks[0]!.adoptionId!==null || locks[0]!.lockedWeek===null || locks[0]!.lockedWeek>state.market.tick)return 'retainedCompletedTakeSilentSourceRequired'
  }
  if(state.technology.productions.some(p=>p.productionId===production.id && p.method!=='silent'))return 'retainedProductionTechnologyOwnerRequired'
  return null
}

/** Coupled native admission at C. Source facilities remain where they are; the buyer takes one
 * real returned allocation per continued production and carries it into the next admission. */
export function bindContinuedWork(state:GameState,transaction:AbsorptionRecord,occupied:ReadonlySet<string>):GameState {
  const h=state.hollywood!,source=h.businesses.find(b=>b.studioId===transaction.targetId)!
  if(transaction.buyerId!==h.playerStudioId){
    if(transaction.continuedProductions.length!==0 || transaction.buyerWorkflows.length!==0
      || transaction.workSteps.length!==0 || transaction.workReleases.length!==0 || transaction.workCancellations.length!==0) {
      throw new Error('absorption: rivalBuyerContinuedWorkProducerRequired')
    }
    // Nothing enters the player's allocator. Stopped paid work remains with its source owner.
    return state
  }

  let operations=buyerOperationsForAllWork(state)
  let sourceOperations=source.operations
  const postFacilities=new Map<string,string|null>()
  for(const row of transaction.continuedProductions) {
    const production=source.productions.find(p=>p.id===row.productionId)!
    const refusal=continuedWorkRefusal(state,transaction.targetId,production)
    if(refusal)throw new Error(`absorption: ${refusal}`)
    const workflow=sourceOperations.workflows.find(w=>w.productionId===production.id)!
    operations=addManagedProductionWorkflow(operations,production,occupied,undefined,workflow.bindings.requiresSetBinding)
    // The native buyer allocator supplies actual new stage/scenery slots. A completed
    // source take remains completed; an unassigned first take requires real buyer actions.
    // Both use the locked director and returned buyer stage, never former facilities.
    if(production.remainingTicks===4 || production.remainingTicks===5){
      const admitted=operations.workflows.find(w=>w.productionId===production.id)!
      const stage=admitted.reservations.find(r=>r.capability==='soundstage')
      if(!stage)throw new Error('absorption: shooting handoff buyer stage missing')
      operations={...operations,workflows:operations.workflows.map(w=>w===admitted?{...w,
        bindings:{...w.bindings,heldSinceWeek:transaction.week},
        shootingTask:{id:`shooting:${production.id}`,productionId:production.id,directorId:production.directorId,
          soundstageFacilityId:stage.facilityId,status:production.remainingTicks===4?'completed':'unassigned'}}:w)}
    }
    // Post work has no current stage/Set binding and no setup. Keep its actual original plan revision.
    operations={...operations,workflows:operations.workflows.map(w=>w.productionId===production.id?{...w,planRevision:workflow.planRevision}:w)}
    postFacilities.set(production.id,operations.workflows.find(w=>w.productionId===production.id)!.reservations.find(r=>r.capability==='post')?.facilityId ?? null)
    sourceOperations=removeManagedProductionWorkflow(sourceOperations,production.id)
  }
  const ids=new Set(transaction.continuedProductions.map(p=>p.productionId))
  return {...state,rights:{...state.rights,absorptions:state.rights.absorptions.map(a=>a.id===transaction.id?{...a,buyerWorkflows:operations.workflows.filter(w=>ids.has(w.productionId)),continuedProductions:a.continuedProductions.map(row=>({...row,buyerPostFacilityId:postFacilities.get(row.productionId)!}))}:a)},hollywood:{...h,businesses:h.businesses.map(b=>b===source?{...b,operations:sourceOperations}:b)}}
}

/** Actual split of the ONE native buyer allocation/advance, before queue admission or publication.
 * No production or screenplay changes creator, cost owner, identity or original participant history. */
export function publishOperatedAdvance(state:GameState,advanced:readonly Production[],operations:StudioOperations):GameState {
  const own=new Set(state.studio.activeProductions.map(p=>p.id))
  const h=state.hollywood
  const foreign=new Map((state.rights?.absorptions ?? []).flatMap(a=>a.continuedProductions.map(p=>[p.productionId,a.targetId] as const)))
  const expected=buyerOperatedProductions(state).map(p=>p.id)
  if(new Set(advanced.map(p=>p.id)).size!==advanced.length || advanced.length!==expected.length || advanced.some(p=>!expected.includes(p.id)))throw new Error('continued work: advance lacks exact actual owner pool')
  return {...state,operations:{...operations,workflows:operations.workflows.filter(w=>own.has(w.productionId))},rights:{...state.rights,absorptions:state.rights.absorptions.map(a=>({...a,buyerWorkflows:operations.workflows.filter(w=>a.continuedProductions.some(p=>p.productionId===w.productionId))}))},studio:{...state.studio,activeProductions:advanced.filter(p=>own.has(p.id))},
    hollywood:h?{...h,businesses:h.businesses.map(b=>{
      const ids=new Set(b.productions.filter(p=>foreign.get(p.id)===b.studioId).map(p=>p.id))
      if(ids.size===0)return b
      return {...b,productions:b.productions.map(p=>ids.has(p.id)?advanced.find(row=>row.id===p.id)??p:p)}
    })}:h}
}

/** Actual returned native counters, captured once under the global rights allocator. */
export function recordContinuedWorkSteps(before:GameState,after:GameState,week:number):GameState {
  if(week!==before.market.tick)throw new Error('continued work: not the actual input boundary')
  const buyer=before.hollywood?.playerStudioId
  if(buyer && closedWeekOf(before).has(buyer))throw new Error('continued work: closed buyer cannot advance retained work')
  let rights=after.rights
  for(const original of buyerContinuedProductions(before)) {
    const source=before.rights.absorptions.find(a=>a.continuedProductions.some(p=>p.productionId===original.id))!
    const advanced=after.hollywood!.businesses.find(b=>b.studioId===source.targetId)!.productions.find(p=>p.id===original.id)!
    if(!advanced || advanced.remainingTicks>original.remainingTicks || advanced.remainingTicks<original.remainingTicks-1)throw new Error('continued work: native counter lost or invented work')
    if(source.workSteps.some(s=>s.productionId===original.id && s.week===week))throw new Error('continued work: step replay')
    const allocated=allocateRightsId(rights,'absorbed-work')
    rights={...allocated.root,absorptions:allocated.root.absorptions.map(a=>a.id===source.id?{...a,workSteps:[...a.workSteps,{id:allocated.id,productionId:original.id,week,beforeRemaining:original.remainingTicks,afterRemaining:advanced.remainingTicks}]}:a)}
  }
  return {...after,rights}
}

/** Actual buyer-owned release front door; the source authority remains creator/project linked. */
export function continuedReleaseOwner(state:GameState,productionId:string) {
  const buyer=state.hollywood?.playerStudioId
  const transaction=state.rights?.absorptions.find(a=>a.buyerId===buyer && a.continuedProductions.some(p=>p.productionId===productionId))
  if(!transaction)return null
  const business=state.hollywood!.businesses.find(b=>b.studioId===transaction.targetId)!
  return {business,owner:{productions:buyerContinuedProductions(state).filter(p=>transaction.continuedProductions.some(row=>row.productionId===p.id)),concepts:state.hollywood!.concepts,operations:buyerOperationsForAllWork(state),releaseAuthority:business.releaseAuthority}}
}
export function continuedCommittedReleaseIds(state:GameState):string[] {
  const ids=new Set(buyerContinuedProductions(state).map(p=>p.id))
  return state.hollywood?.businesses.flatMap(b=>b.releaseAuthority.commitments.filter(row=>ids.has(row.productionId)).map(row=>row.productionId)) ?? []
}

/** Real current49 buyer cancellation. Paid creator body/script/first-take remain terminal source
 * history, while canonical buyer work/capacity and live staffing claims end at the actual action. */
export function cancelContinuedProduction(state:GameState,productionId:string):GameState {
  saves.makeSave(state)
  const h=state.hollywood,buyer=h?.playerStudioId
  if(!h || !buyer || closedWeekOf(state).has(buyer))throw new Error('continued cancel: buyer is not operating')
  const a=state.rights.absorptions.find(a=>a.buyerId===buyer && a.continuedProductions.some(row=>row.productionId===productionId))
  if(!a)throw new Error('continued cancel: no actual buyer-owned production')
  if(a.workCancellations.some(row=>row.productionId===productionId))throw new Error('continued cancel: production already cancelled')
  const b=h.businesses.find(b=>b.studioId===a.targetId)!
  const p=b.productions.find(p=>p.id===productionId)
  if(!p || p.remainingTicks<1 || a.workReleases.some(row=>row.productionId===productionId))throw new Error('continued cancel: production is no longer active')
  if(b.releaseAuthority.commitments.some(row=>row.productionId===productionId))throw new Error('continued cancel: irreversible release commitment already accepted')
  const allocated=allocateRightsId(state.rights,'absorbed-work-cancel')
  const receipt={id:allocated.id,productionId,week:state.market.tick,remainingTicks:p.remainingTicks}
  let next:GameState={...state,rights:{...allocated.root,absorptions:allocated.root.absorptions.map(owner=>owner.id===a.id?{...owner,workCancellations:[...owner.workCancellations,receipt],buyerWorkflows:removeManagedProductionWorkflow({...state.operations,workflows:owner.buyerWorkflows},productionId).workflows}:owner)}}
  next=recordCancelledAfterFirstTake(breakPromisesOnCancel(next,buyer,p),buyer,p)
  saves.makeSave(next)
  return next
}

/** Actual combined native action writeback; no copied foreign Production enters the player's array. */
export function withBuyerOperations(state:GameState,operations:StudioOperations):GameState {
  return buyerContinuationWorkflows(state).length===0?{...state,operations}:publishOperatedAdvance(state,buyerOperatedProductions(state),operations)
}
export function publishBuyerOperationsAction(before:GameState,after:GameState):GameState {
  if(buyerContinuationWorkflows(before).length>0){saves.makeSave(before);saves.makeSave(after)}
  return after
}
