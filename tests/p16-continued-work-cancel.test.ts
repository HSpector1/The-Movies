// UNRUN R9-r2 explicit release-law transaction control; original skeletons are preserved superseded UNRUN.
// UNRUN source-grounded clean-target transaction controls. Original48 capture has an explicitly
// disclosed R04 condition/finance constructor; R03 is unchanged. This is not natural campaign proof.
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
import { tick } from '../src/core/tick.js'
import { applyActions } from '../src/core/actions.js'
import {activeContract} from '../src/core/employment.js'
import {RELATIONSHIP_CANCEL_DELTA} from '../src/core/relationships.js'
import type {GameState} from '../src/core/types.js'
import {buyerContinuedProductions,buyerContinuationWorkflows,buyerContinuedTalentIds} from '../src/core/continuedWork.js'
const TARGET='studio-aca408ec-r02',FILM=TARGET+':film:14'
const PIN='c17b7aa82bd09e6988867e149ed0266803d8e432cfcd8842d9c2aca1f7ace8ad'

function prepared() {
 const root=process.env.P16_ORIGINAL48_CAPTURE_ROOT;expect(root).toBeTruthy()
 const bytes=readFileSync(root+'/r04-actual163.save48.json')
 expect(createHash('sha256').update(bytes).digest('hex')).toBe(PIN)
 const raw=JSON.parse(bytes.toString()),rawBefore=saves.stableStringify(raw)
 const old=saves.validateSaveP15B(raw);expect(old.saveVersion).toBe(48)
 const oldBefore=saves.stableStringify(old)
 const current=saves.convertV48ToV49(old),initial=current.state
 expect(current.saveVersion).toBe(49);expect(initial.market.tick).toBe(163)
 const player=initial.hollywood!.playerStudioId,source=initial.hollywood!.businesses.find(b=>b.studioId===TARGET)!
 expect(source,'fixed retained R03 prerequisite').toBeDefined()
 expect(source.account.cash).toBe(13824449.654646564)
 expect(source.productions).toHaveLength(1);expect(source.productions[0]).toMatchObject({id:FILM,startTick:157,remainingTicks:3});expect(source.runs).toHaveLength(0)
 expect(conditionRecord(initial,player)?.condition).toMatchObject({stage:'stable',week:163})
 expect(conditionRecord(initial,TARGET)?.condition).toMatchObject({stage:'stable',week:163})
 expect(outstandingLoan(initial,player,163)).toBeUndefined();expect(outstandingLoan(initial,TARGET,163)).toBeUndefined()
 expect(acquisition.absorptionProducerRefusal(initial,{buyerId:player,targetId:TARGET,consideration:1,retention:{kind:'default'},disclosureId:null})).toBeNull()
 const original=initial.hollywood!.activeEmploymentOrdinals.map(i=>initial.hollywood!.employment[i]!)
  .filter(e=>e.studioId===TARGET&&e.endedWeek===null&&e.terms.startWeek<=163&&163<e.terms.endWeekExclusive)
 expect(original).toHaveLength(6);expect(original.every(e=>e.terms.endWeekExclusive===208)).toBe(true)
 // ONE fixed explicit choice: the first authoritative target interval; fail if that person cannot lawfully continue.
 const retention={kind:'explicit' as const,contractIds:original.map(e=>e.contractId)}
 const initialBefore=saves.stableStringify(initial)
 const diligence=requestDiligence(initial,{recipientId:player,target:{kind:'studio',studioId:TARGET},scope:['rights','employment','liabilities']},163)
 expect(saves.stableStringify(initial)).toBe(initialBefore);saves.makeSave(diligence.state)
 expect(diligence.record).toMatchObject({week:163,recipientId:player,target:{kind:'studio',studioId:TARGET}})
 expect(diligence.state.studio.cash).toBe(initial.studio.cash-diligence.record.fee)
 expect(diligence.record.fee).toBeGreaterThan(0)
 const expectedExits=original.filter(e=>!retention.contractIds.includes(e.contractId)).reduce((sum,e)=>sum+terminationCost(e.terms,163),0)
 const postExitCash=source.account.cash-expectedExits
 const library=libraryValuationV1(diligence.state,TARGET,163);expect(library.kind).toBe('available')
 if(library.kind!=='available')throw new Error('fixed R03 library valuation premise absent')
 // The single lawful whole consideration at the public ask; not an amount sweep or edited account.
 const consideration=Math.ceil(acquisition.absorptionAsk(library.total,postExitCash))
 const previewInput={buyerId:player,targetId:TARGET,consideration,retention,disclosureId:diligence.record.id}
 const quote=acquisition.quoteAbsorption(diligence.state,previewInput,163)
 expect(quote.kind,'actual person/willingness/reserve/retention premise, no fallback').toBe('quote')
 if(quote.kind!=='quote')throw new Error(quote.refusal)
 expect(quote.affordable).toBe(true)
 expect(quote.contracts.filter(c=>c.retained).map(c=>c.contractId)).toEqual(retention.contractIds)
 expect(quote.contracts.filter(c=>!c.retained)).toHaveLength(0);expect(quote.productions).toHaveLength(1);expect(quote.productions[0]).toMatchObject({productionId:FILM,remainingTicks:3,phase:'postProduction',disposition:'continues'})
 expect(quote.exitCharges).toBe(expectedExits);expect(expectedExits).toBe(0)
 expect(quote.targetCashBeforeExits).toBe(source.account.cash);expect(quote.postExitCash).toBe(postExitCash)
 expect(quote.quoteAgePolicyVersion).toBe(1);expect(quote.quotedAtWeek).toBe(163)
 const input={...previewInput,quotedAtWeek:quote.quotedAtWeek,quoteAgePolicyVersion:quote.quoteAgePolicyVersion}
 const state=diligence.state,before=saves.stableStringify(state)
 const subjects=subjectsHeldBy(resolveTitles(state),state.rights.estates,TARGET,163)
 expect(subjects.length,'real nonempty held-title transition required').toBeGreaterThan(0)
 return {raw,rawBefore,old,oldBefore,initial,initialBefore,state,before,player,source,original,quote,input,subjects}
}
function originalUnchanged(p:ReturnType<typeof prepared>) {
 expect(saves.stableStringify(p.state)).toBe(p.before)
 expect(saves.stableStringify(p.initial)).toBe(p.initialBefore)
 expect(saves.stableStringify(p.old)).toBe(p.oldBefore)
 expect(saves.stableStringify(p.raw)).toBe(p.rawBefore)
}
function complete(p:ReturnType<typeof prepared>) {
 const result=acquisition.closeAbsorption(p.state,p.input,163)
 originalUnchanged(p)
 const record=result.rights.absorptions.find(a=>a.targetId===TARGET)!
 expect(record).toBeDefined();expect(record.week).toBe(163)
 expect(record.quotedAtWeek).toBe(p.input.quotedAtWeek);expect(record.quotedAtWeek).toBe(163)
 expect(record.quoteAgePolicyVersion).toBe(p.input.quoteAgePolicyVersion);expect(record.quoteAgePolicyVersion).toBe(1)
 return {result,record}
}

function cancellation(p:ReturnType<typeof prepared>) {
 const {result,record}=complete(p)
 expect(buyerContinuedProductions(result).find(production=>production.id===FILM)).toMatchObject({remainingTicks:3})
 expect(buyerContinuationWorkflows(result).some(w=>w.productionId===FILM)).toBe(true)
 const inputBefore=JSON.stringify(result)
 const cancelled=applyActions(result,[{kind:'cancel',productionId:FILM}]) // intended own-only baseline RED
 expect(JSON.stringify(result)).toBe(inputBefore)
 saves.makeSave(cancelled)
 expect(cancelled.market.tick).toBe(163);expect(cancelled.studio.cash).toBe(result.studio.cash)
 expect(cancelled.rngState).toEqual(result.rngState);expect(cancelled.studio.standing).toEqual(result.studio.standing)
 expect(cancelled.hollywood!.businesses.find(b=>b.studioId===TARGET)!.productions).toEqual(result.hollywood!.businesses.find(b=>b.studioId===TARGET)!.productions)
 expect(cancelled.hollywood!.businesses.find(b=>b.studioId===TARGET)!.development).toEqual(result.hollywood!.businesses.find(b=>b.studioId===TARGET)!.development)
 expect(cancelled.hollywood!.businesses.find(b=>b.studioId===TARGET)!.projects).toEqual(result.hollywood!.businesses.find(b=>b.studioId===TARGET)!.projects)
 expect(cancelled.hollywood!.employment).toEqual(result.hollywood!.employment)
 expect(cancelled.firstTakes).toEqual(result.firstTakes)
 const take=result.firstTakes.find(t=>t.productionId===FILM)!
 expect(take).toMatchObject({studioId:TARGET,week:162})
 const seats=[take.directorId,take.cast.lead,take.cast.antagonist,take.cast.support]
 expect(new Set(seats).size).toBe(seats.length)
 const pairs=seats.flatMap((a,i)=>seats.slice(i+1).map(b=>[a,b].sort()))
 const key=(a:string,b:string)=>[a,b].sort().join('|')
 const expectedPairs=pairs.map(([a,b])=>{
  const edge=result.relationships.find(e=>key(e.a,e.b)===key(a!,b!))!
  expect(edge,'actual first-take shared pair must exist').toBeDefined()
  expect(edge.firstSharedWeek).toBeLessThanOrEqual(take.week)
  expect(edge.recent.some(d=>d.kind==='cancelledAfterFirstTake'&&d.ref===FILM)).toBe(false)
  const after=cancelled.relationships.find(e=>e.edgeId===edge.edgeId)!
  expect(after.sharedCancellations).toBe(edge.sharedCancellations+1)
  expect(after.recent.filter(d=>d.kind==='cancelledAfterFirstTake'&&d.ref===FILM))
   .toEqual([{kind:'cancelledAfterFirstTake',week:163,ref:FILM,delta:-RELATIONSHIP_CANCEL_DELTA}])
  return key(edge.a,edge.b)
 })
 expect(expectedPairs.length).toBeGreaterThan(0)
 expect(cancelled.relationships.filter(e=>e.recent.some(d=>d.kind==='cancelledAfterFirstTake'&&d.ref===FILM)).map(e=>key(e.a,e.b)).sort()).toEqual(expectedPairs.sort())

 expect(cancelled.rights.titleEvents).toEqual(result.rights.titleEvents)
 expect(cancelled.rights.properties).toEqual(result.rights.properties)
 expect(cancelled.rights.filmTitles).toEqual(result.rights.filmTitles)
 expect(cancelled.ledger).toEqual(result.ledger)
 const receipt=cancelled.rights.absorptions.find(a=>a.id===record.id)!.workCancellations
 expect(receipt).toHaveLength(1);expect(receipt[0]).toMatchObject({productionId:FILM,week:163,remainingTicks:3})
 expect(receipt[0]!.id).toMatch(/^absorbed-work-cancel-/)
 expect(buyerContinuedProductions(cancelled).some(production=>production.id===FILM)).toBe(false)
 expect(buyerContinuationWorkflows(cancelled).some(w=>w.productionId===FILM)).toBe(false)
 expect(buyerContinuedTalentIds(cancelled).some(id=>p.original.some(e=>e.terms.talentId===id))).toBe(false)
 return {result,record,cancelled,inputBefore,receipt:receipt[0]!}
}
describe('P16 actual buyer public cancellation of acquired paid R02 work',()=>{
 it('real public cancel frees buyer work and capacity without erasing source paid history employment first take or retained rights and replays ordinary stop',()=>{
  const p=prepared(),c=cancellation(p),text=saves.exportCurrentState(c.cancelled),reload=saves.migrateToLive(saves.importSave(text)).state
  expect(saves.exportCurrentState(reload)).toBe(text)
  let state=c.cancelled,replay=reload
  for(let week=164;week<=166;week++) {
   const before=JSON.stringify(state),replayBefore=JSON.stringify(replay),prior=state,priorReplay=replay
   state=tick(prior);replay=tick(priorReplay);expect(JSON.stringify(prior)).toBe(before);expect(JSON.stringify(priorReplay)).toBe(replayBefore)
   expect(state.market.tick).toBe(week)
  }
  expect(saves.exportCurrentState(state)).toBe(saves.exportCurrentState(replay))
  expect(state.hollywood!.films.some(f=>f.filmId===FILM)).toBe(false)
  expect(state.hollywood!.businesses.find(b=>b.studioId===TARGET)!.productions).toEqual(c.cancelled.hollywood!.businesses.find(b=>b.studioId===TARGET)!.productions)
  expect(state.rights.absorptions.find(a=>a.id===c.record.id)!.workReleases).toEqual([])
  expect(state.rights.absorptions.find(a=>a.id===c.record.id)!.workSteps).toEqual(c.cancelled.rights.absorptions.find(a=>a.id===c.record.id)!.workSteps)
  expect(state.rights.absorptions.find(a=>a.id===c.record.id)!.runReceipts).toEqual([])
  expect(state.ledger.filter(e=>e.kind==='constructionRefund'||e.kind==='facilityDemolitionRefund')).toEqual(c.cancelled.ledger.filter(e=>e.kind==='constructionRefund'||e.kind==='facilityDemolitionRefund'))
  const before=JSON.stringify(c.cancelled)
  try {expect(()=>applyActions(c.cancelled,[{kind:'commitPictureToRelease',productionId:FILM}])).toThrow(/active|continued|cancel|ready|unknown/i)}
  finally {expect(JSON.stringify(c.cancelled)).toBe(before)}
  const director=p.source.productions[0]!.directorId
  const live=activeContract(c.cancelled,director)
  expect(live,'real retained buyer contract required for staffing control').toBeDefined()
  if(!live)throw new Error('retained director contract prerequisite absent')
  const busyBefore=JSON.stringify(c.result)
  try {expect(()=>applyActions(c.result,[{kind:'releaseTalent',talentId:director}])).toThrow(/seated on active production/)}
  finally {expect(JSON.stringify(c.result)).toBe(busyBefore)}
  const staffingBefore=JSON.stringify(c.cancelled),cost=terminationCost(live,163)
  expect(cost).toBeGreaterThan(0)
  const staffed=applyActions(c.cancelled,[{kind:'releaseTalent',talentId:director}])
  expect(JSON.stringify(c.cancelled)).toBe(staffingBefore)
  expect(activeContract(staffed,director)).toBeUndefined()
  expect(staffed.studio.cash).toBe(c.cancelled.studio.cash-cost)
  expect(staffed.ledger.slice(c.cancelled.ledger.length)).toEqual([{week:163,kind:'termination',amount:-cost,talentId:director,note:'early-release termination cost'}])
  expect(staffed.rights.titleEvents).toEqual(c.cancelled.rights.titleEvents)
  saves.makeSave(staffed)
  originalUnchanged(p)
 })
 it('real cancelled-publication failure preserves the admitted buyer source after successful manual cancellation positive',()=>{
  const p=prepared(),c=cancellation(p),real=saves.makeSave,marker='REAL_ACQUIRED_WORK_CANCEL_PUBLICATION_FAULT';let published=0
  const spy=vi.spyOn(saves,'makeSave').mockImplementation(state=>{
   const admitted=real(state)
   if(!buyerContinuedProductions(admitted.state).some(production=>production.id===FILM)) {published++;throw new Error(marker)}
   return admitted
  })
  try {expect(()=>applyActions(c.result,[{kind:'cancel',productionId:FILM}])).toThrow(marker);expect(published).toBe(1)}
  finally {spy.mockRestore();expect(JSON.stringify(c.result)).toBe(c.inputBefore);originalUnchanged(p)}
 })
 it('actual cancellation authority is complete once-only and full joined readers refuse missing foreign counter date or repeated receipts while committed work stays irreversible',()=>{
  const p=prepared(),c=cancellation(p),text=JSON.stringify(saves.makeSave(c.cancelled))
  const reject=(change:(state:GameState)=>void)=>{
   const saved=JSON.parse(text);change(saved.state);const before=JSON.stringify(saved)
   try {expect(()=>saves.validateSaveV51(saved)).toThrow(/continued|work|workflow|relationship|cancellation|absorption|capacity|production/i)}
   finally {expect(JSON.stringify(saved)).toBe(before)}
  }
  reject(state=>{state.rights.absorptions.find(a=>a.id===c.record.id)!.workCancellations=[]})
  reject(state=>{state.rights.absorptions.find(a=>a.id===c.record.id)!.workCancellations[0]!.productionId='foreign-paid-production'})
  reject(state=>{state.rights.absorptions.find(a=>a.id===c.record.id)!.workCancellations[0]!.remainingTicks--})
  reject(state=>{state.rights.absorptions.find(a=>a.id===c.record.id)!.workCancellations[0]!.week++})
  reject(state=>{const a=state.rights.absorptions.find(a=>a.id===c.record.id)!;a.workCancellations=[...a.workCancellations,{...a.workCancellations[0]!}]})
  const before=JSON.stringify(c.cancelled)
  try {expect(()=>applyActions(c.cancelled,[{kind:'cancel',productionId:FILM}])).toThrow(/cancel|active|continued/i)}
  finally {expect(JSON.stringify(c.cancelled)).toBe(before)}
  let ready=c.result
  for(let week=164;week<=165;week++) {const prior=ready,bytes=JSON.stringify(prior);ready=tick(prior);expect(JSON.stringify(prior)).toBe(bytes);expect(ready.market.tick).toBe(week)}
  const readyBefore=JSON.stringify(ready),committed=applyActions(ready,[{kind:'commitPictureToRelease',productionId:FILM}])
  expect(JSON.stringify(ready)).toBe(readyBefore);saves.makeSave(committed)
  const committedBefore=JSON.stringify(committed)
  try {expect(()=>applyActions(committed,[{kind:'cancel',productionId:FILM}])).toThrow(/commit|irreversible/i)}
  finally {expect(JSON.stringify(committed)).toBe(committedBefore);originalUnchanged(p)}
 })

})
