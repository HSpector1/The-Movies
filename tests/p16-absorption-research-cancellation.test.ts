// UNRUN fixed accepted45 research267→actual first current evaluation268 control.
// PREREQUISITE: real completed-instrument and pending paid-plan dispositions must exist.
// No fake work/access/condition/cash/receipt, STABLE adapter, retiming, waiting/search or wider timeout.
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { createHash } from 'node:crypto'
import * as saves from '../src/core/save.js'
import * as acquisition from '../src/core/acquisition.js'
import { requestDiligence } from '../src/core/dueDiligence.js'
import { conditionRecord, outstandingLoan } from '../src/core/corporateConditionLive.js'
import { terminationCost } from '../src/core/employment.js'
import { libraryValuationV1 } from '../src/core/propertyValuation.js'
import { validateTechnology } from '../src/core/technology.js'
import { tick } from '../src/core/tick.js'
import type { GameState } from '../src/core/types.js'
const TARGET='studio-aca408ec-r01',PROJECT=TARGET+':research:synchronized-sound'
function preparedCancellation() {
 const root=new URL('./fixtures/p14/genuine-v45-recovery-witnesses-1368/',import.meta.url)
 const digest=(bytes:Uint8Array)=>createHash('sha256').update(bytes).digest('hex')
 const manifest=readFileSync(new URL('MANIFEST.json',root))
 expect(digest(manifest)).toBe('11ad61be481a8bec170f40425cfcfe7fcb24596418d30b6c8bf27895e93c3ba5')
 const gzip=readFileSync(new URL('research.json.gz',root)),raw=gunzipSync(gzip)
 expect(digest(gzip)).toBe('c3f78360efc6ff30f7ef63a873ee49174dac4b5cf8a4e683672e3aac20591a56')
 expect(digest(raw)).toBe('2b27ca1517b8fcf5329b4742e329e252dfb40fe2dbafe3868244bd6f81b0f3b1')
 const original=saves.importSave(raw.toString()),originalBefore=JSON.stringify(original)
 expect(original.saveVersion).toBe(45)
 const start=saves.migrateToLive(original).state,startBefore=JSON.stringify(start)
 expect(start.market.tick).toBe(267)
 expect(start.technology.projects.find(p=>p.id===PROJECT)).toMatchObject({status:'active',verifiedWork:12,expenditure:80000})
 // One ordinary tick only: existing old45 capture has no current condition authority yet.
 const evaluated=tick(start,{develop:true});expect(JSON.stringify(start)).toBe(startBefore)
 expect(evaluated.market.tick).toBe(268);saves.makeSave(evaluated)
 const player=evaluated.hollywood!.playerStudioId
 expect(conditionRecord(evaluated,player)?.condition).toMatchObject({stage:'stable',week:268})
 expect(conditionRecord(evaluated,TARGET)?.condition).toMatchObject({stage:'stable',week:268})
 expect(outstandingLoan(evaluated,player,268)).toBeUndefined();expect(outstandingLoan(evaluated,TARGET,268)).toBeUndefined()
 const work=evaluated.technology.projects.find(p=>p.id===PROJECT)!
 expect(work).toBeDefined();expect(work.status).toBe('active')
 expect(work.verifiedWork).toBeGreaterThan(12);expect(work.expenditure).toBeGreaterThan(80000)
 expect(work.weeks.some(w=>w.week===267)).toBe(true)
 const base={buyerId:player,targetId:TARGET,consideration:1,retention:{kind:'explicit' as const,contractIds:[]},disclosureId:null}
 // Stops at the exact genuine source capability gap. R4 alone must not be represented as a passing baseline.
 expect(acquisition.absorptionProducerRefusal(evaluated,base),'real unfinished plan/work owners must exist; no suppressed ordinary decision or plan deletion').toBeNull()
 const evaluatedBefore=JSON.stringify(evaluated)
 const diligence=requestDiligence(evaluated,{recipientId:player,target:{kind:'studio',studioId:TARGET},scope:['rights','employment','liabilities']},268)
 expect(JSON.stringify(evaluated)).toBe(evaluatedBefore);saves.makeSave(diligence.state)
 const target=evaluated.hollywood!.businesses.find(b=>b.studioId===TARGET)!
 const contracts=evaluated.hollywood!.activeEmploymentOrdinals.map(i=>evaluated.hollywood!.employment[i]!)
  .filter(e=>e.studioId===TARGET&&e.endedWeek===null&&e.terms.startWeek<=268&&268<e.terms.endWeekExclusive)
 expect(contracts.length).toBeGreaterThan(0)
 const exits=contracts.reduce((sum,e)=>sum+terminationCost(e.terms,268),0)
 const library=libraryValuationV1(diligence.state,TARGET,268);expect(library.kind).toBe('available')
 if(library.kind!=='available')throw new Error('fixed268 library valuation prerequisite absent')
 const input={...base,consideration:Math.ceil(acquisition.absorptionAsk(library.total,target.account.cash-exits)),disclosureId:diligence.record.id}
 const quote=acquisition.quoteAbsorption(diligence.state,input,268)
 expect(quote.kind,'single fixed public choice must be lawful; no fallback').toBe('quote')
 if(quote.kind!=='quote')throw new Error(quote.refusal)
 expect(quote.affordable).toBe(true);expect(quote.contracts.every(c=>!c.retained)).toBe(true)
 expect(quote.research.some(p=>p.projectId===PROJECT)).toBe(true)
 expect(quote.quotedAtWeek).toBe(268);expect(quote.quoteAgePolicyVersion).toBe(1)
 const before=JSON.stringify(diligence.state)
 const final=acquisition.closeAbsorption(diligence.state,{...input,quotedAtWeek:quote.quotedAtWeek,quoteAgePolicyVersion:quote.quoteAgePolicyVersion},268)
 expect(JSON.stringify(diligence.state)).toBe(before)
 const save=saves.makeSave(final),record=final.rights.absorptions.find(a=>a.targetId===TARGET)!
 const project=final.technology.projects.find(p=>p.id===PROJECT)!
 expect(record).toBeDefined();expect(project).toBeDefined()
 expect(project.absorptionCancellation).toEqual({absorptionId:record.id,week:268,priorStatus:'active'})
 expect(record.research.filter(p=>p.projectId===PROJECT)).toHaveLength(1)
 expect(JSON.stringify(original)).toBe(originalBefore)
 return {original,originalBefore,start,startBefore,evaluated,evaluatedBefore,before,diligence,work,final,save,record,project}
}
function inputUnchanged(p:ReturnType<typeof preparedCancellation>) {
 expect(JSON.stringify(p.original)).toBe(p.originalBefore);expect(JSON.stringify(p.start)).toBe(p.startBefore)
 expect(JSON.stringify(p.evaluated)).toBe(p.evaluatedBefore);expect(JSON.stringify(p.diligence.state)).toBe(p.before)
}
describe('P16 real absorbed research marker from fixed accepted267 input',()=>{
 it('actual public close retains all earned work and paid physical history with one source-owned cancellation and roundtrip',()=>{
  const p=preparedCancellation()
  expect(p.project.status).toBe('cancelled');expect(p.project.completedWeek).toBeNull()
  expect(p.project.verifiedWork).toBe(p.work.verifiedWork);expect(p.project.expenditure).toBe(p.work.expenditure)
  expect(p.project.startedWeek).toBe(p.work.startedWeek);expect(p.project.weeks).toEqual(p.work.weeks);expect(p.project.legacy).toEqual(p.work.legacy)
  expect(p.project.seats).toEqual(p.work.seats.map(s=>s.releasedWeek===null?{...s,releasedWeek:268}:s))
  const sourcePlan=p.diligence.state.physicalPlans.plans.find(plan=>plan.id===TARGET+':plan:3')!
  expect(sourcePlan).toMatchObject({status:'started',commitReceipt:{week:266,cost:900000}})
  const stopped=p.final.physicalPlans.plans.find(plan=>plan.id===sourcePlan.id)!
  expect(stopped.commitReceipt).toEqual(sourcePlan.commitReceipt);expect(stopped.approvedQuote).toEqual(sourcePlan.approvedQuote)
  expect(p.final.hollywood!.receipts.slice(0,p.diligence.state.hollywood!.receipts.length)).toEqual(p.diligence.state.hollywood!.receipts)
  const text=saves.exportCurrentState(p.final),reloaded=saves.migrateToLive(saves.importSave(text)).state
  expect(saves.exportCurrentState(reloaded)).toBe(text)
  expect(reloaded.technology.projects.find(p=>p.id===PROJECT)).toEqual(p.project)
  inputUnchanged(p)
 })
 it('full joined reader refuses either omitted authority or malformed marker and frozen own-era project readers reject its new field',()=>{
  const p=preparedCancellation(),text=JSON.stringify(p.save)
  const mutate=(fn:(state:GameState)=>void)=>{
   const saved=JSON.parse(text) as typeof p.save;fn(saved.state);const before=JSON.stringify(saved)
   try {expect(()=>saves.validateSaveV50(saved)).toThrow(/absorption|Technology save/i)}
   finally {expect(JSON.stringify(saved)).toBe(before)}
  }
  mutate(state=>{delete state.technology.projects.find(p=>p.id===PROJECT)!.absorptionCancellation})
  mutate(state=>{const a=state.rights.absorptions.find(a=>a.id===p.record.id)!;a.research=a.research.filter(r=>r.projectId!==PROJECT)})
  mutate(state=>{state.technology.projects.find(p=>p.id===PROJECT)!.absorptionCancellation!.absorptionId='absorption-0'})
  mutate(state=>{state.technology.projects.find(p=>p.id===PROJECT)!.absorptionCancellation!.week++})
  mutate(state=>{const a=state.rights.absorptions.find(a=>a.id===p.record.id)!;a.research=[...a.research,a.research.find(r=>r.projectId===PROJECT)!]})
  const finalBefore=JSON.stringify(p.final)
  try {expect(()=>validateTechnology(p.final,true)).toThrow(/Technology save: exact keys required/)}
  finally {expect(JSON.stringify(p.final)).toBe(finalBefore)}
  // Actual original45 admitted input, one hostile new-field mutation only: no modern root or version retag masks refusal.
  expect(saves.validateSaveV45(p.original)).toBe(p.original)
  const old=JSON.parse(p.originalBefore),oldProject=old.state.technology.projects.find((row:{id:string})=>row.id===PROJECT)
  oldProject.absorptionCancellation={...p.project.absorptionCancellation};const oldBefore=JSON.stringify(old)
  try {expect(()=>saves.validateSaveV45(old)).toThrow(/Technology save: exact keys required/)}
  finally {expect(JSON.stringify(old)).toBe(oldBefore)}
  inputUnchanged(p)
 })
})
