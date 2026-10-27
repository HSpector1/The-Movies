from pathlib import Path
D=Path('/Users/zacheryspector/studio-scratch/p16-sprint8-obligations-20261026/rival-continuation/source/postimages/src/core')
p=D/'continuedWork.ts';s=p.read_text()
s=s.replace('buyerContinuedProductions(state: GameState): Production[] {\n  const buyer=state.hollywood?.playerStudioId','buyerContinuedProductions(state: GameState,buyer=state.hollywood?.playerStudioId): Production[] {')
s=s.replace('buyerContinuationWorkflows(state:GameState):ProductionWorkflow[] {\n  return (state.rights?.absorptions ?? []).flatMap(a=>a.buyerId===state.hollywood?.playerStudioId ? a.buyerWorkflows : [])','buyerContinuationWorkflows(state:GameState,buyer=state.hollywood?.playerStudioId):ProductionWorkflow[] {\n  return (state.rights?.absorptions ?? []).flatMap(a=>a.buyerId===buyer ? a.buyerWorkflows : [])')
s=s.replace("export function buyerOperationsForAllWork(state:GameState):StudioOperations {\n  return {...state.operations,workflows:[...state.operations.workflows,...buyerContinuationWorkflows(state)]}\n}","export function buyerOperationsForAllWork(state:GameState,buyer=state.hollywood?.playerStudioId):StudioOperations {\n  const operations=buyer===undefined || buyer===state.hollywood?.playerStudioId?state.operations:state.hollywood?.businesses.find(b=>b.studioId===buyer)?.operations\n  if(!operations)throw new Error('continued work: actual buyer operations missing')\n  return {...operations,workflows:[...operations.workflows,...buyerContinuationWorkflows(state,buyer)]}\n}")
s=s.replace("export function buyerOperatedProductions(state:GameState):Production[] {\n  return [...state.studio.activeProductions,...buyerContinuedProductions(state)]\n}","export function buyerOperatedProductions(state:GameState,buyer=state.hollywood?.playerStudioId):Production[] {\n  const own=buyer===undefined || buyer===state.hollywood?.playerStudioId?state.studio.activeProductions:state.hollywood?.businesses.find(b=>b.studioId===buyer)?.productions??[]\n  return [...own,...buyerContinuedProductions(state,buyer)]\n}")
a=s.index('  if(transaction.buyerId!==h.playerStudioId){',s.index('export function bindContinuedWork'))
b=s.index('  let sourceOperations=source.operations',a)
s=s[:a]+'''  if(transaction.buyerId!==h.playerStudioId && transaction.continuedProductions.some(row=>row.originalProduction.remainingTicks>4))throw new Error('absorption: rivalBuyerEarlierWorkProducerRequired')
  if(transaction.continuedProductions.length===0)return state
  let operations=buyerOperationsForAllWork(state,transaction.buyerId)
'''+s[b:]
a=s.index('export function publishOperatedAdvance(');b=s.index('\n/** Actual returned native counters',a)
s=s[:a]+'''export function publishOperatedAdvance(state:GameState,advanced:readonly Production[],operations:StudioOperations,buyer=state.hollywood?.playerStudioId):GameState {
  const h=state.hollywood,player=buyer===undefined || buyer===h?.playerStudioId
  const own=new Set((player?state.studio.activeProductions:h?.businesses.find(b=>b.studioId===buyer)?.productions??[]).map(p=>p.id))
  const foreign=new Map((state.rights?.absorptions ?? []).filter(a=>a.buyerId===buyer).flatMap(a=>a.continuedProductions.map(p=>[p.productionId,a.targetId] as const)))
  const expected=buyerOperatedProductions(state,buyer).map(p=>p.id)
  if(new Set(advanced.map(p=>p.id)).size!==advanced.length || advanced.length!==expected.length || advanced.some(p=>!expected.includes(p.id)))throw new Error('continued work: advance lacks exact actual owner pool')
  const nativeOperations={...operations,workflows:operations.workflows.filter(w=>own.has(w.productionId))}
  return {...state,...(player?{operations:nativeOperations,studio:{...state.studio,activeProductions:advanced.filter(p=>own.has(p.id))}}:{}),
    rights:{...state.rights,absorptions:state.rights.absorptions.map(a=>a.buyerId!==buyer?a:{...a,buyerWorkflows:operations.workflows.filter(w=>a.continuedProductions.some(p=>p.productionId===w.productionId))})},
    hollywood:h?{...h,businesses:h.businesses.map(b=>{
      if(!player && b.studioId===buyer)return {...b,operations:nativeOperations,productions:advanced.filter(p=>own.has(p.id))}
      const ids=new Set(b.productions.filter(p=>foreign.get(p.id)===b.studioId).map(p=>p.id))
      if(ids.size===0)return b
      return {...b,productions:b.productions.map(p=>ids.has(p.id)?advanced.find(row=>row.id===p.id)??p:p)}
    })}:h}
}
'''+s[b:]
s=s.replace('recordContinuedWorkSteps(before:GameState,after:GameState,week:number):GameState','recordContinuedWorkSteps(before:GameState,after:GameState,week:number,buyer=before.hollywood?.playerStudioId):GameState').replace('  const buyer=before.hollywood?.playerStudioId\n','').replace('for(const original of buyerContinuedProductions(before))','for(const original of buyerContinuedProductions(before,buyer))')
s=s.replace('continuedCommittedReleaseIds(state:GameState):string[] {\n  const ids=new Set(buyerContinuedProductions(state).map(p=>p.id))','continuedCommittedReleaseIds(state:GameState,buyer=state.hollywood?.playerStudioId):string[] {\n  const ids=new Set(buyerContinuedProductions(state,buyer).map(p=>p.id))')
p.write_text(s)
p=D/'employment.ts';s=p.read_text().replace("import { buyerOperatedProductions } from './continuedWork.js'","import { buyerContinuedProductions, buyerOperatedProductions } from './continuedWork.js'")
s=s.replace('seatingProduction(state: GameState, talentId: string): Production | undefined {\n  return buyerOperatedProductions(state).find','seatingProduction(state: GameState, talentId: string,studioId=state.hollywood?.playerStudioId): Production | undefined {\n  return buyerOperatedProductions(state,studioId).find')
a='  for (const id of industryBusyTalentIds(state.hollywood, terminalWeekOf(state))) busy.add(id)'
b=a+"\n  for(const buyer of new Set((state.rights?.absorptions??[]).map(a=>a.buyerId))) {\n    if(terminalWeekOf(state).has(buyer))continue\n    for(const id of productionCompanyTalentIds(buyerContinuedProductions(state,buyer)))busy.add(id)\n  }"
assert s.count(a)==1;s=s.replace(a,b);p.write_text(s)
p=D/'corporateConditionLive.ts';s=p.read_text();a='  const seated = business.productions.find((p) => productionCompanyTalentIds([p]).has(talentId))';assert s.count(a)==1;s=s.replace(a,'  const seated = seatingProduction(state,talentId,studioId)');p.write_text(s)
print('Actual external edits: continuedWork.ts, employment.ts, corporateConditionLive.ts.')
