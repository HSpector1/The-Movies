// UNRUN runnable earlier-silent owner baseline, exact existing preweek; no synthetic positive history.
// UNRUN R9-r2 explicit release-law transaction control; original skeletons are preserved superseded UNRUN.
// UNRUN source-grounded clean-target transaction controls. Original48 capture has an explicitly
// disclosed R04 condition/finance constructor; R01 is unchanged. This is not natural campaign proof.
// No STABLE readers, new cash/history/work, clock changes, seed/retention/price fallback or wider timeout.
import { describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import * as saves from '../src/core/save.js'
import * as acquisition from '../src/core/acquisition.js'
import { requestDiligence } from '../src/core/dueDiligence.js'
import { conditionRecord, outstandingLoan } from '../src/core/corporateConditionLive.js'
import { terminationCost } from '../src/core/employment.js'
import { libraryValuationV1 } from '../src/core/propertyValuation.js'
import { resolveTitles, subjectsHeldBy } from '../src/core/rights.js'
import {buyerContinuedProductions,buyerContinuationWorkflows} from '../src/core/continuedWork.js'
import type { GameState } from '../src/core/types.js'
import { tick } from '../src/core/tick.js'
const TARGET='studio-aca408ec-r01',FILM=TARGET+':film:13'
const PIN='c17b7aa82bd09e6988867e149ed0266803d8e432cfcd8842d9c2aca1f7ace8ad'

function prepared() {
 const week=165 as const
 const root=process.env.P16_ORIGINAL48_CAPTURE_ROOT;expect(root).toBeTruthy()
 const bytes=readFileSync(root+'/r04-actual163.save48.json')
 expect(createHash('sha256').update(bytes).digest('hex')).toBe(PIN)
 const raw=JSON.parse(bytes.toString()),rawBefore=JSON.stringify(raw)
 const old=saves.validateSaveP15B(raw);expect(old.saveVersion).toBe(48)
 const oldBefore=JSON.stringify(old)
 const current=saves.convertV48ToV49(old)
 expect(current.state.market.tick).toBe(163)
 const migratedBefore=JSON.stringify(current.state)
 const first=tick(current.state),firstBefore=JSON.stringify(first)
 expect(first.market.tick).toBe(164);saves.makeSave(first)
 const initial=tick(first)
 expect(JSON.stringify(first)).toBe(firstBefore)
 expect(JSON.stringify(current.state)).toBe(migratedBefore)
 saves.makeSave(initial)
 expect(current.saveVersion).toBe(49);expect(initial.market.tick).toBe(week)
 const player=initial.hollywood!.playerStudioId,source=initial.hollywood!.businesses.find(b=>b.studioId===TARGET)!
 expect(source,'fixed retained R01 prerequisite').toBeDefined()
 expect(source.account.cash).toBeGreaterThan(0)
 expect(source.productions).toHaveLength(1);expect(source.productions[0]).toMatchObject({id:FILM,startTick:161,remainingTicks:170-week});expect(source.runs).toHaveLength(0)
 expect(conditionRecord(initial,player)?.condition).toMatchObject({stage:'stable',week:week})
 expect(conditionRecord(initial,TARGET)?.condition).toMatchObject({stage:'stable',week:week})
 expect(outstandingLoan(initial,player,week)).toBeUndefined();expect(outstandingLoan(initial,TARGET,week)).toBeUndefined()
 expect(acquisition.absorptionProducerRefusal(initial,{buyerId:player,targetId:TARGET,consideration:1,retention:{kind:'default'},disclosureId:null})).toBeNull()
 const original=initial.hollywood!.activeEmploymentOrdinals.map(i=>initial.hollywood!.employment[i]!)
  .filter(e=>e.studioId===TARGET&&e.endedWeek===null&&e.terms.startWeek<=week&&week<e.terms.endWeekExclusive)
 expect(original).toHaveLength(6);expect(original.every(e=>e.terms.endWeekExclusive===208)).toBe(true)
 // ONE fixed explicit choice: retain none of the six authoritative target intervals; actual capped exits apply.
 const retention={kind:'explicit' as const,contractIds:[] as string[]}
 const initialBefore=JSON.stringify(initial)
 const diligence=requestDiligence(initial,{recipientId:player,target:{kind:'studio',studioId:TARGET},scope:['rights','employment','liabilities']},week)
 expect(JSON.stringify(initial)).toBe(initialBefore);saves.makeSave(diligence.state)
 expect(diligence.record).toMatchObject({week:week,recipientId:player,target:{kind:'studio',studioId:TARGET}})
 expect(diligence.state.studio.cash).toBe(initial.studio.cash-diligence.record.fee)
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
 expect(quote.contracts.filter(c=>!c.retained)).toHaveLength(6);expect(quote.productions).toHaveLength(1);expect(quote.productions[0]).toMatchObject({productionId:FILM,remainingTicks:170-week,phase:'shooting',disposition:'cancelRequired',reason:'missingParticipants',blockedCapability:null})
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
 expect(p.state.firstTakes.some(t=>t.productionId===FILM)).toBe(false)
 expect(p.state.technology.productions.filter(t=>t.productionId===FILM)).toEqual([{studioId:TARGET,productionId:FILM,method:'silent',adoptionId:null,lockedWeek:164}])
 const result=acquisition.closeAbsorption(p.state,p.input,165);originalUnchanged(p)
 const record=result.rights.absorptions.find(a=>a.targetId===TARGET)!,production=p.source.productions[0]!
 const script=p.source.development.projects.find(s=>s.productionId===FILM)!
 // Independent paid-subject order: writer, director, craft, then cast; only actual
 // target employment explicitly NOT retained contributes a missing participant.
 const missing=[...new Set([production.writerId,production.directorId,...production.craftIds,...Object.values(production.cast)]
  .filter(id=>p.original.some(e=>e.terms.talentId===id&&!p.input.retention.contractIds.includes(e.contractId))))]
 expect(p.quote.productions[0]!.missingParticipants).toEqual(missing)
 expect(record.stoppedProductions).toEqual([{productionId:FILM,scriptProjectId:script.id,remainingTicks:5,phase:'shooting',reason:'missingParticipants',blockedCapability:null,missingParticipants:missing}])
 expect(record.continuedProductions).toEqual([]);expect(record.buyerWorkflows).toEqual([])
 expect(record.contracts.every(c=>c.buyerContractId===null)).toBe(true)
 expect(record.exitCharges).toBe(p.quote.exitCharges)
 expect(record.postExitCash).toBe(record.cashBeforeExits-record.exitCharges)
 expect(record.outlay).toBe(record.consideration-record.postExitCash)
 expect(result.studio.cash).toBe(p.state.studio.cash-record.outlay)
 const target=result.hollywood!.businesses.find(b=>b.studioId===TARGET)!
 expect(target.account.cash).toBe(0);expect(target.productions).toEqual(p.source.productions)
 expect(target.development.projects).toEqual(p.source.development.projects);expect(target.projects).toEqual(p.source.projects)
 expect(result.technology.productions.filter(t=>t.productionId===FILM)).toEqual(p.state.technology.productions.filter(t=>t.productionId===FILM))
 expect(result.firstTakes.filter(t=>t.productionId===FILM)).toEqual([])
 expect(buyerContinuedProductions(result).some(t=>t.id===FILM)).toBe(false)
 expect(buyerContinuationWorkflows(result).some(t=>t.productionId===FILM)).toBe(false)
 return {result,record,target}
}
function advance(state:GameState){let next=state;for(const week of [166,167,168,169,170,171]){const prior=next,before=JSON.stringify(prior);next=tick(prior);expect(JSON.stringify(prior)).toBe(before);expect(next.market.tick).toBe(week)}return next}
describe('P16 genuine initial shooting5 explicit nonretention writeoff',()=>{
 it('fixed empty retention pays actual capped exits and preserves stopped paid source work and silent lock without buyer work refund take or release through ordinary deadline',()=>{
  const p=prepared(),c=completed(p)
  const text=saves.exportCurrentState(c.result),reload=saves.migrateToLive(saves.importSave(text)).state
  expect(saves.exportCurrentState(reload)).toBe(text)
  const final=advance(c.result),replay=advance(reload)
  expect(saves.exportCurrentState(final)).toBe(saves.exportCurrentState(replay))
  const target=final.hollywood!.businesses.find(b=>b.studioId===TARGET)!
  expect(target.productions).toEqual(c.target.productions);expect(target.development.projects).toEqual(c.target.development.projects);expect(target.projects).toEqual(c.target.projects)
  expect(target.account.cash).toBe(0);expect(target.runs).toEqual([])
  expect(final.rights.absorptions.find(a=>a.id===c.record.id)).toEqual(c.record)
  expect(final.firstTakes.filter(t=>t.productionId===FILM)).toEqual([])
  expect(final.technology.productions.filter(t=>t.productionId===FILM)).toEqual(c.result.technology.productions.filter(t=>t.productionId===FILM))
  expect(final.hollywood!.films.some(f=>f.filmId===FILM)).toBe(false)
  expect(final.studioEvents.rows.filter(e=>(e.kind==='wrapped'||e.kind==='releaseCommitted')&&e.productionId===FILM)).toEqual(c.result.studioEvents.rows.filter(e=>(e.kind==='wrapped'||e.kind==='releaseCommitted')&&e.productionId===FILM))
  expect(final.hollywood!.receipts.filter(r=>r.studioId===TARGET)).toEqual(c.result.hollywood!.receipts.filter(r=>r.studioId===TARGET))
  expect(final.ledger.filter(e=>e.kind==='constructionRefund'||e.kind==='facilityDemolitionRefund')).toEqual(c.result.ledger.filter(e=>e.kind==='constructionRefund'||e.kind==='facilityDemolitionRefund'))
  originalUnchanged(p)
 })
 it('actual stopped shooting5 positive refuses missing disposition or altered paid remaining work without modifying rejected caller',()=>{
  const p=prepared(),c=completed(p)
  for(const change of [(x:GameState)=>{x.rights.absorptions.find(a=>a.id===c.record.id)!.stoppedProductions=[]},(x:GameState)=>{x.rights.absorptions.find(a=>a.id===c.record.id)!.stoppedProductions[0]!.remainingTicks=4}]){
   const x=structuredClone(c.result);change(x);const before=JSON.stringify(x)
   try{expect(()=>saves.makeSave(x)).toThrow(/absorption|paid|production|screenplay|work/i)}finally{expect(JSON.stringify(x)).toBe(before)}
  }
  originalUnchanged(p)
 })
 it('real joined publication failure rolls back public empty-retention acquisition after valid capped exits and paid-work disposition',()=>{
  const p=prepared();completed(p)
  const real=saves.makeSave,marker='SHOOTING5_WRITEOFF_PUBLICATION_FAULT';let outputs=0
  const spy=vi.spyOn(saves,'makeSave').mockImplementation(state=>{const admitted=real(state);if(admitted.state.rights.absorptions.some(a=>a.targetId===TARGET)){outputs++;throw new Error(marker)}return admitted})
  try{expect(()=>acquisition.closeAbsorption(p.state,p.input,165)).toThrow(marker);expect(outputs).toBe(1)}finally{spy.mockRestore();originalUnchanged(p)}
 })
})
