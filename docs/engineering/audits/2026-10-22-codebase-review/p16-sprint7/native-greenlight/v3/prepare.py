from pathlib import Path
W=Path('/Users/zacheryspector/studio-scratch/p16-retained-writing-20261026-wt');D=Path(__file__).parent/'working'
files=['src/core/continuedScripts.ts','src/core/firstTakeSubjects.ts','src/core/promises.ts','src/core/save.ts']
for f in files:
 p=D/f;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes((W/f).read_bytes())
p=D/files[0];s=p.read_text().replace(' productionScripts: ReadonlyMap<string,ScriptProject>;',''' productionScripts: ReadonlyMap<string,ScriptProject>;
 /** Every actual native greenlight remains joined after cancellation clears the
  * current project link, or after a later greenlight assigns a different ID. */
 productionScriptHistory: ReadonlyMap<string,Readonly<{studioId:string;project:ScriptProject}>>;''')
s=s.replace(' return {concepts,productionScripts,originalProductions}', ''' const productionScriptHistory=new Map<string,Readonly<{studioId:string;project:ScriptProject}>>()
 for(const a of current)for(const decision of a.scriptDecisions){
  if(decision.kind!=='greenlight')continue
  const project=a.continuedScripts.find(row=>row.project.id===decision.projectId)?.project
  if(!project||productionScriptHistory.has(decision.production.id))fail('native production history has no unique screenplay')
  productionScriptHistory.set(decision.production.id,{studioId:a.buyerId,project})
 }
 return {concepts,productionScripts,productionScriptHistory,originalProductions}''')
p.write_text(s)
p=D/files[1];s=p.read_text();s="import { carriedProductionAuthority, type CarriedProductionAuthority } from './continuedScripts.js'\n"+s
s=s.replace("import { GENRE_ORDER }", "import { GENRE_ORDER, CAST_SLOTS }")
s=s.replace('productionId?: string, absorptions?: ReadonlyMap<string,AbsorptionRecord>):', 'productionId?: string, absorptions?: ReadonlyMap<string,AbsorptionRecord>, carriedProduction?:CarriedProductionAuthority):')
needle="  if (state.hollywood?.playerStudioId === studioId) {"
new='''  // A new buyer production is distinct from a seller production continued at
  // close. Its exact paid greenlight history supplies source screenplay/concept
  // visibility while the buyer remains the film's issuing/creator studio.
  const native=productionId===undefined?undefined:carriedProduction?.productionScriptHistory.get(productionId)
  if(native&&native.studioId===studioId&&state.hollywood?.playerStudioId===studioId){
    const concept=carriedProduction?.concepts.find(row=>row.id===native.project.conceptId)
    const original=carriedProduction?.originalProductions.find(row=>row.id===productionId)
    if(!concept||!original||original.conceptId!==concept.id)return undefined
    return {concepts:[concept],development:{mode:'managed',projects:[native.project]},productions:[original],creatorStudioId:studioId}
  }
'''+needle
assert needle in s;s=s.replace(needle,new,1)
s=s.replace('export function subjectForNewTake(state: SubjectState,', 'export function subjectForNewTake(state: GameState,')
s=s.replace("  const owner = takeSubjectOwner(state, studioId,production.id,new Map((state.rights?.absorptions??[]).map(a=>[a.targetId,a])))", """  const carried=studioId===state.hollywood?.playerStudioId&&!state.concepts.some(c=>c.id===production.conceptId)
    ?carriedProductionAuthority(state):undefined
  const owner = takeSubjectOwner(state, studioId,production.id,new Map((state.rights?.absorptions??[]).map(a=>[a.targetId,a])),carried)""")
s=s.replace('export function validateFirstTakeSubjects(raw: Record<string, unknown>, absorptions?:ReadonlyMap<string,AbsorptionRecord>): void {','export function validateFirstTakeSubjects(raw: Record<string, unknown>, absorptions?:ReadonlyMap<string,AbsorptionRecord>, carriedProduction?:CarriedProductionAuthority): void {')
s=s.replace('takeSubjectOwner(state, take.studioId,take.productionId,absorptions)','takeSubjectOwner(state, take.studioId,take.productionId,absorptions,carriedProduction)')
needle="    if (fact.scriptProjectId !== null) {"
new='''    const native=carriedProduction?.productionScriptHistory.get(take.productionId)
    if(native&&native.studioId===take.studioId){
      const original=carriedProduction?.originalProductions.find(row=>row.id===take.productionId)
      if(!original||fact.scriptProjectId!==native.project.id||take.directorId!==original.directorId
        ||CAST_SLOTS.some(slot=>take.cast[slot]!==original.cast[slot]))return fail(`facts[${i}] disagrees with its native paid screenplay or crew`)
    }
'''+needle
assert needle in s;s=s.replace(needle,new,1);p.write_text(s)
p=D/files[2];s=p.read_text();s="import type { CarriedProductionAuthority } from './continuedScripts.js'\n"+s
s=s.replace('export function validatePromiseRootsV40(state: unknown, absorptions?:ReadonlyMap<string,AbsorptionRecord>): void {\n  validatePromiseRootsForVersion(state, 40,absorptions)','export function validatePromiseRootsV40(state: unknown, absorptions?:ReadonlyMap<string,AbsorptionRecord>, carriedProduction?:CarriedProductionAuthority): void {\n  validatePromiseRootsForVersion(state, 40,absorptions,carriedProduction)')
s=s.replace('saveVersion: 29 | 30 | 39 | 40, absorptions?:ReadonlyMap<string,AbsorptionRecord>): void {','saveVersion: 29 | 30 | 39 | 40, absorptions?:ReadonlyMap<string,AbsorptionRecord>, carriedProduction?:CarriedProductionAuthority): void {')
s=s.replace('validateFirstTakeSubjects(state,absorptions)','validateFirstTakeSubjects(state,absorptions,carriedProduction)');p.write_text(s)
p=D/files[3];s=p.read_text().replace('validatePromiseRootsV40(raw, era.rights ? era.absorptions : undefined)','validatePromiseRootsV40(raw, era.rights ? era.absorptions : undefined, era.carriedProduction)');p.write_text(s)
