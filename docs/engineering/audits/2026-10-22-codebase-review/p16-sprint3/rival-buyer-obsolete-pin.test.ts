// UNRUN runnable earlier-silent owner baseline, exact existing preweek; no synthetic positive history.
// UNRUN R9-r2 explicit release-law transaction control; original skeletons are preserved superseded UNRUN.
// UNRUN source-grounded clean-target transaction controls. Original48 capture has an explicitly
// disclosed R04 condition/finance constructor; R01 is unchanged. This is not natural campaign proof.
// No STABLE readers, new cash/history/work, clock changes, seed/retention/price fallback or wider timeout.
import { describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import {tick} from '../src/core/tick.js'
import type {GameState} from '../src/core/types.js'
import {currentHolder,actualP16Money} from '../src/core/rights.js'
import * as saves from '../src/core/save.js'
import * as acquisition from '../src/core/acquisition.js'
import { requestDiligence } from '../src/core/dueDiligence.js'
import { conditionRecord, outstandingLoan } from '../src/core/corporateConditionLive.js'
import { terminationCost } from '../src/core/employment.js'
import { libraryValuationV1 } from '../src/core/propertyValuation.js'
import { resolveTitles, subjectsHeldBy } from '../src/core/rights.js'
const TARGET='studio-aca408ec-r01',FILM=TARGET+':film:13'
const PIN='c17b7aa82bd09e6988867e149ed0266803d8e432cfcd8842d9c2aca1f7ace8ad'

function prepared() {
 const week=163 as const
 const root=process.env.P16_ORIGINAL48_CAPTURE_ROOT;expect(root).toBeTruthy()
 const bytes=readFileSync(root+'/r04-actual163.save48.json')
 expect(createHash('sha256').update(bytes).digest('hex')).toBe(PIN)
 const raw=JSON.parse(bytes.toString()),rawBefore=JSON.stringify(raw)
 const old=saves.validateSaveP15B(raw);expect(old.saveVersion).toBe(48)
 const oldBefore=JSON.stringify(old)
 const current=saves.convertV48ToV49(old)
 expect(current.state.market.tick).toBe(163)
 const initial=current.state
 expect(current.saveVersion).toBe(49);expect(initial.market.tick).toBe(week)
 const player='studio-aca408ec-r02',source=initial.hollywood!.businesses.find(b=>b.studioId===TARGET)!
 expect(source,'fixed retained R01 prerequisite').toBeDefined()
 expect(source.account.cash).toBeGreaterThan(0)
 expect(source.productions).toHaveLength(1);expect(source.productions[0]).toMatchObject({id:FILM,startTick:161,remainingTicks:170-week});expect(source.runs).toHaveLength(0)
 expect(conditionRecord(initial,player)?.condition).toMatchObject({stage:'stable',week:week})
 expect(conditionRecord(initial,TARGET)?.condition).toMatchObject({stage:'stable',week:week})
 expect(outstandingLoan(initial,player,week)).toBeUndefined();expect(outstandingLoan(initial,TARGET,week)).toBeUndefined()
 const original=initial.hollywood!.activeEmploymentOrdinals.map(i=>initial.hollywood!.employment[i]!)
  .filter(e=>e.studioId===TARGET&&e.endedWeek===null&&e.terms.startWeek<=week&&week<e.terms.endWeekExclusive)
 expect(original).toHaveLength(6);expect(original.every(e=>e.terms.endWeekExclusive===208)).toBe(true)
 // ONE fixed explicit choice: all six authoritative target intervals; fail if any cannot lawfully continue.
 const retention={kind:'explicit' as const,contractIds:[] as string[]}
 const initialBefore=JSON.stringify(initial)
 const diligence=requestDiligence(initial,{recipientId:player,target:{kind:'studio',studioId:TARGET},scope:['rights','employment','liabilities']},week)
 expect(JSON.stringify(initial)).toBe(initialBefore);saves.makeSave(diligence.state)
 expect(diligence.record).toMatchObject({week:week,recipientId:player,target:{kind:'studio',studioId:TARGET}})
 expect(diligence.state.studio.cash).toBe(initial.studio.cash)
 expect(diligence.state.hollywood!.businesses.find(b=>b.studioId===player)!.account.cash).toBe(initial.hollywood!.businesses.find(b=>b.studioId===player)!.account.cash-diligence.record.fee)
 expect(diligence.record.fee).toBeGreaterThan(0)
 const expectedExits=original.filter(e=>!retention.contractIds.includes(e.contractId)).reduce((sum,e)=>sum+terminationCost(e.terms,week),0)
 const postExitCash=source.account.cash-expectedExits
 const library=libraryValuationV1(diligence.state,TARGET,week);expect(library.kind).toBe('available')
 if(library.kind!=='available')throw new Error('fixed R01 library valuation premise absent')
 // The single lawful whole consideration at the public ask; not an amount sweep or edited account.
 const consideration=Math.ceil(acquisition.absorptionAsk(library.total,postExitCash))
 const previewInput={buyerId:player,targetId:TARGET,consideration,retention,disclosureId:diligence.record.id}
 const quote=acquisition.quoteAbsorption(diligence.state,previewInput,week)
 expect(quote.kind,'actual person/willingness/reserve/retention premise, no fallback').toBe('quote')
 if(quote.kind!=='quote')throw new Error(quote.refusal)
 expect(quote.affordable).toBe(true)
 expect(quote.contracts.filter(c=>c.retained).map(c=>c.contractId)).toEqual(retention.contractIds)
 expect(quote.contracts.filter(c=>!c.retained)).toHaveLength(6);expect(quote.productions).toHaveLength(1);expect(quote.productions[0]).toMatchObject({productionId:FILM,remainingTicks:170-week,phase:'preProduction',disposition:'cancelRequired'})
 expect(quote.exitCharges).toBe(expectedExits);expect(expectedExits).toBeGreaterThan(0)
 expect(quote.targetCashBeforeExits).toBe(source.account.cash);expect(quote.postExitCash).toBe(postExitCash)
 expect(quote.quoteAgePolicyVersion).toBe(1);expect(quote.quotedAtWeek).toBe(week)
 const input={...previewInput,quotedAtWeek:quote.quotedAtWeek,quoteAgePolicyVersion:quote.quoteAgePolicyVersion}
 const state=diligence.state,before=JSON.stringify(state)
 const subjects=subjectsHeldBy(resolveTitles(state),state.rights.estates,TARGET,week)
 expect(subjects.length,'real nonempty held-title transition required').toBeGreaterThan(0)
 return {week,raw,rawBefore,old,oldBefore,initial,initialBefore,state,before,player,source,original,quote,input,subjects}
}
function originalUnchanged(p:ReturnType<typeof prepared>) {
 expect(JSON.stringify(p.state)).toBe(p.before)
 expect(JSON.stringify(p.initial)).toBe(p.initialBefore)
 expect(JSON.stringify(p.old)).toBe(p.oldBefore)
 expect(JSON.stringify(p.raw)).toBe(p.rawBefore)
}
function completed(p:ReturnType<typeof prepared>){
 expect(p.quote.exitCharges).toBe(1305330);expect(p.quote.outlay).toBe(862166.7370649315);expect(p.quote.reserveAfter).toBe(2385032)
 expect(p.quote.productions[0]).toMatchObject({productionId:FILM,remainingTicks:7,phase:'preProduction',disposition:'cancelRequired',reason:'missingParticipants',blockedCapability:null})
 const result=acquisition.closeAbsorption(p.state,p.input,163);originalUnchanged(p)
 const record=result.rights.absorptions.find(a=>a.targetId===TARGET)!
 expect(record).toMatchObject({week:163,buyerId:p.player,targetId:TARGET,exitCharges:p.quote.exitCharges,outlay:p.quote.outlay,postExitCash:p.quote.postExitCash})
 expect(record.contracts.every(c=>c.buyerContractId===null)).toBe(true)
 expect(record.stoppedProductions).toHaveLength(1)
 expect(record.stoppedProductions[0]).toMatchObject({productionId:FILM,remainingTicks:7,reason:'missingParticipants',missingParticipants:p.quote.productions[0]!.missingParticipants})
 expect(record.continuedProductions).toEqual([]);expect(record.buyerWorkflows).toEqual([])
 const buyerBefore=p.state.hollywood!.businesses.find(b=>b.studioId===p.player)!,buyer=result.hollywood!.businesses.find(b=>b.studioId===p.player)!
 expect(buyer.account.cash).toBe(buyerBefore.account.cash-record.outlay)
 expect(actualP16Money(result,p.player).acquisitionOutlay-actualP16Money(p.state,p.player).acquisitionOutlay).toBe(-record.outlay)
 const target=result.hollywood!.businesses.find(b=>b.studioId===TARGET)!
 expect(target.account.cash).toBe(0);expect(target.productions).toEqual(p.source.productions);expect(target.development.projects).toEqual(p.source.development.projects);expect(target.projects).toEqual(p.source.projects)
 expect(buyer.productions).toEqual(buyerBefore.productions);expect(buyer.operations).toEqual(buyerBefore.operations)
 expect(result.studio).toEqual(p.state.studio);expect(result.ledger).toEqual(p.state.ledger);expect(result.contracts).toEqual(p.state.contracts);expect(result.operations).toEqual(p.state.operations)
 expect(result.firstTakes).toEqual(p.state.firstTakes);expect(result.technology.productions).toEqual(p.state.technology.productions)
 expect(p.subjects.length).toBeGreaterThan(0)
 for(const subject of p.subjects)expect(currentHolder(result,subject,163)).toMatchObject({kind:'holder',holderId:p.player})
 return {result,record,target}
}
function ordinary(state:GameState){let result=state;for(const week of [164,165,166]){const before=JSON.stringify(result),prior=result;result=tick(prior);expect(JSON.stringify(prior)).toBe(before);expect(result.market.tick).toBe(week)}return result}
describe('P16 genuine actual163 rival buyer explicit nonretention acquisition',()=>{
 it('real R02 funded close owns exact money and titles without player pollution then preserves paid target work through ordinary ticks save reload and replay',()=>{
  const p=prepared(),c=completed(p),text=saves.exportCurrentState(c.result),reload=saves.migrateToLive(saves.importSave(text)).state
  expect(saves.exportCurrentState(reload)).toBe(text)
  const final=ordinary(c.result),replay=ordinary(reload)
  expect(saves.exportCurrentState(final)).toBe(saves.exportCurrentState(replay))
  const target=final.hollywood!.businesses.find(b=>b.studioId===TARGET)!
  expect(target.account.cash).toBe(0);expect(target.productions).toEqual(c.target.productions);expect(target.projects).toEqual(c.target.projects);expect(target.development.projects).toEqual(c.target.development.projects);expect(target.runs).toEqual([])
  expect(final.rights.absorptions.find(a=>a.id===c.record.id)).toEqual(c.record)
  expect(final.hollywood!.receipts.filter(r=>r.studioId===TARGET)).toEqual(c.result.hollywood!.receipts.filter(r=>r.studioId===TARGET))
  expect(final.firstTakes.filter(r=>r.productionId===FILM)).toEqual(c.result.firstTakes.filter(r=>r.productionId===FILM))
  expect(final.hollywood!.films.some(f=>f.filmId===FILM)).toBe(false)
  expect(final.ledger.filter(e=>e.kind==='constructionRefund'||e.kind==='facilityDemolitionRefund')).toEqual(c.result.ledger.filter(e=>e.kind==='constructionRefund'||e.kind==='facilityDemolitionRefund'))
  const before=JSON.stringify(c.result)
  try{expect(()=>acquisition.closeAbsorption(c.result,p.input,163)).toThrow(/terminal|absorbed|target|operating/i)}finally{expect(JSON.stringify(c.result)).toBe(before)}
  originalUnchanged(p)
 })
 it('actual rival close full reader refuses wrong buyer cash and missing paid work disposition without modifying hostile callers',()=>{
  const p=prepared(),c=completed(p)
  const originalCash=c.result.hollywood!.businesses.find(b=>b.studioId===p.player)!.account.cash
  const cashDrift=Math.max(1,2*Math.ceil(Math.abs(originalCash)*1e-7))
  const changedCash=originalCash+cashDrift
  expect(cashDrift).toBeGreaterThan(1e-7*Math.max(1,Math.abs(originalCash),Math.abs(changedCash)))
  const changes:Array<{label:string;change:(x:GameState)=>void;expected?:RegExp}>=[
   {label:'unknown buyer identity',change:x=>{x.rights.absorptions.find(a=>a.id===c.record.id)!.buyerId='missing-rival'}},
   {label:'unearned buyer cash above both reconciliation tolerances',change:x=>{x.hollywood!.businesses.find(b=>b.studioId===p.player)!.account.cash+=cashDrift},expected:/cash differs from reconciliation/},
   {label:'omitted stopped paid work',change:x=>{x.rights.absorptions.find(a=>a.id===c.record.id)!.stoppedProductions=[]}},
   {label:'invented retained rival work ownership',change:x=>{const a=x.rights.absorptions.find(a=>a.id===c.record.id)!;const production=p.source.productions[0]!,script=p.source.development.projects.find(s=>s.productionId===production.id)!,workflow=p.source.operations.workflows.find(w=>w.productionId===production.id)!;a.stoppedProductions=[];a.continuedProductions=[{productionId:production.id,scriptProjectId:script.id,originalProduction:structuredClone(production),originalWorkflow:structuredClone(workflow),originalReleaseCommitment:null,buyerPostFacilityId:null}]}},
  ]
  for(const {label,change,expected=/absorption|Hollywood|cash|money|work|identity|studio/i} of changes){const x=structuredClone(c.result);change(x);const before=JSON.stringify(x);try{expect(()=>saves.makeSave(x),label).toThrow(expected)}finally{expect(JSON.stringify(x),label).toBe(before)}}
  originalUnchanged(p)
 })
 it('real full joined rival publication fault after all actual effects validates then rolls back the original caller',()=>{
  const p=prepared();completed(p)
  const real=saves.makeSave,marker='RIVAL_ABSORPTION_PUBLICATION_FAULT';let outputs=0
  const spy=vi.spyOn(saves,'makeSave').mockImplementation(state=>{const admitted=real(state);if(admitted.state.rights.absorptions.some(a=>a.targetId===TARGET)){outputs++;throw new Error(marker)}return admitted})
  try{expect(()=>acquisition.closeAbsorption(p.state,p.input,163)).toThrow(marker);expect(outputs).toBe(1)}finally{spy.mockRestore();originalUnchanged(p)}
 })
})
