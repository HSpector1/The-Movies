from pathlib import Path
W=Path('/Users/zacheryspector/studio-scratch/p16-retained-writing-20261026-wt');D=Path(__file__).parent/'working'
files=['src/core/continuedScripts.ts','src/core/actions.ts','src/core/queueAdmission.ts','src/core/tick.ts','src/core/rights.ts']
for f in files:
 p=D/f;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes((W/f).read_bytes())
p=D/files[0];s=p.read_text();mark='export function carriedProductionAuthority(state:GameState):CarriedProductionAuthority|undefined {'
new='''/** Invocation-local validation only; each call proves the CURRENT queued
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
 const releases=input.studio.activeProductions.filter(p=>ids.has(p.id)&&authority.productionScripts.has(p.id))
 if(releases.length===0)return undefined
 const commitments=new Map(releases.map(p=>{
  const commitment=input.releaseAuthority.commitments.find(row=>row.productionId===p.id)
  if(p.remainingTicks!==1||!commitment)fail('queued release witness is not committed Ready work')
  return [p.id,commitment] as const
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

'''+mark
assert mark in s;s=s.replace(mark,new,1)
s=s.replace('export function carriedConceptForProduction(state:GameState,productionId:string):FilmConcept|undefined {\n const authority=carriedProductionAuthority(state)', 'export function carriedConceptForProduction(state:GameState,productionId:string,prepared?:CarriedProductionAuthority):FilmConcept|undefined {\n const authority=prepared??carriedProductionAuthority(state)')
p.write_text(s)
p=D/files[1];s=p.read_text();s=s.replace("markCarriedScriptProduced", "markCarriedScriptProduced") if False else s
# Extend the existing continuedScripts import without introducing a new owner.
s=s.replace("carriedProductionAuthority } from './continuedScripts.js'", "carriedProductionAuthority, type QueuedCarriedValidation } from './continuedScripts.js'",1)
def change_function(s,name,edit):
 start=s.index(('export function ' if name=='commitQueuedIntent' else 'function ')+name+'(')
 end=s.find('\nfunction ',start+1)
 exp=s.find('\nexport function ',start+1)
 if end<0:end=len(s)
 if exp>=0:end=min(end,exp)
 part=s[start:end];new=edit(part);assert part!=new,name
 return s[:start]+new+s[end:]
for name in ['applyCommissionScript','applyCommissionOriginalScreenplay','applyStartCastingSession']:
 def edit(part):
  assert '  allowQueue = true,\n' in part
  part=part.replace('  allowQueue = true,\n','  allowQueue = true,\n  queuedCarriedValidation?:QueuedCarriedValidation,\n',1)
  assert '}, writingContext)' in part
  return part.replace('}, writingContext)','}, writingContext, queuedCarriedValidation)')
 s=change_function(s,name,edit)
def edit(part):
 part=part.replace('  injectedEvents?: StudioEventSink,\n','  injectedEvents?: StudioEventSink,\n  queuedCarriedValidation?:QueuedCarriedValidation,\n',1)
 old='mintStoryPropertyAtGreenlight(competed, { studioId: playerStudioId, production, week: state.market.tick })'
 new='''mintStoryPropertyAtGreenlight(competed, { studioId: playerStudioId, production, week: state.market.tick },
      scriptProject!==undefined&&continuedScriptOwner(competed,scriptProject.id)?queuedCarriedValidation?.(competed):undefined)'''
 assert old in part;return part.replace(old,new)
s=change_function(s,'applyGreenlight',edit)
def edit(part):
 part=part.replace('  injectedEvents?: StudioEventSink,\n','  injectedEvents?: StudioEventSink,\n  queuedCarriedValidation?:QueuedCarriedValidation,\n',1)
 old='applyGreenlightScriptProjectNow(state, action, writingContext, project, injectedEvents)'
 assert old in part;return part.replace(old,'applyGreenlightScriptProjectNow(state, action, writingContext, project, injectedEvents, queuedCarriedValidation)')
s=change_function(s,'applyGreenlightScriptProject',edit)
def edit(part):
 part=part.replace('  injectedEvents?: StudioEventSink,\n','  injectedEvents?: StudioEventSink,\n  queuedCarriedValidation?:QueuedCarriedValidation,\n',1)
 part=part.replace('    injectedEvents,\n','    injectedEvents,\n    queuedCarriedValidation,\n',1)
 assert 'assertCurrentScriptState(next, writingContext)' in part
 return part.replace('assertCurrentScriptState(next, writingContext)','assertCurrentScriptState(next, writingContext, queuedCarriedValidation)')
s=change_function(s,'applyGreenlightScriptProjectNow',edit)
s=s.replace('function assertCurrentScriptState(state: GameState, writingContext: LiveWritingContext): GameState {\n  const carried=carriedProductionAuthority(state)', 'function assertCurrentScriptState(state: GameState, writingContext: LiveWritingContext, queuedCarriedValidation?:QueuedCarriedValidation): GameState {\n  const carried=queuedCarriedValidation?queuedCarriedValidation(state):carriedProductionAuthority(state)')
def edit(part):
 part=part.replace('  writingContext: LiveWritingContext = prepareLiveWritingContext(state),\n','  writingContext: LiveWritingContext = prepareLiveWritingContext(state),\n  queuedCarriedValidation?:QueuedCarriedValidation,\n',1)
 assert part.count('            false,\n')==4
 part=part.replace('            false,\n          ),','            false,\n            queuedCarriedValidation,\n          ),')
 part=part.replace('            events,\n','            events,\n            queuedCarriedValidation,\n',1)
 return part
s=change_function(s,'commitQueuedIntent',edit);p.write_text(s)
p=D/files[2];s=p.read_text();s="import type { QueuedCarriedValidation } from './continuedScripts.js'\n"+s
s=s.replace('  writingContext: LiveWritingContext = prepareLiveWritingContext(state),\n','  writingContext: LiveWritingContext = prepareLiveWritingContext(state),\n  queuedCarriedValidation?:QueuedCarriedValidation,\n',1)
s=s.replace('commitQueuedIntent(next, entry, week, events, writingContext)','commitQueuedIntent(next, entry, week, events, writingContext, queuedCarriedValidation)');p.write_text(s)
p=D/files[3];s=p.read_text();s=s.replace("markCarriedScriptProduced } from './continuedScripts.js'", "markCarriedScriptProduced, prepareQueuedCarriedValidation } from './continuedScripts.js'",1)
needle='    events.at(currentTick + 1),\n    writingContext,\n  )';new='''    events.at(currentTick + 1),
    writingContext,
    workInput.productionQueue.length===0?undefined:prepareQueuedCarriedValidation(workInput,productionAdvance.admittedReleaseIds),
  )''';assert needle in s;s=s.replace(needle,new,1);p.write_text(s)
p=D/files[4];s=p.read_text().replace("import { carriedConceptForProduction } from './continuedScripts.js'", "import { carriedConceptForProduction, type CarriedProductionAuthority } from './continuedScripts.js'",1)
s=s.replace('export function mintStoryPropertyAtGreenlight(state: GameState, input: { studioId: string; production: Production; week: number }): GameState {','export function mintStoryPropertyAtGreenlight(state: GameState, input: { studioId: string; production: Production; week: number }, carriedProduction?:CarriedProductionAuthority): GameState {',1)
s=s.replace('carriedConceptForProduction(state,input.production.id):undefined','carriedConceptForProduction(state,input.production.id,carriedProduction):undefined',1);p.write_text(s)
