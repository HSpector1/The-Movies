// UNRUN runnable earlier-silent owner baseline, exact existing pre162; no synthetic positive history.
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
import { applyActions } from '../src/core/actions.js'
import {buyerContinuedProductions,buyerContinuationWorkflows} from '../src/core/continuedWork.js'
import { tick } from '../src/core/tick.js'
import type { GameState } from '../src/core/types.js'
const TARGET='studio-aca408ec-r02',FILM=TARGET+':film:14'
const PIN='cd11f369558e09f1d65d8e848374ea028f4c5f666c168b5527e48c098cfdfb19'

function prepared() {
 const root=process.env.P16_ORIGINAL48_CAPTURE_ROOT;expect(root).toBeTruthy()
 const bytes=readFileSync(root+'/r04-pre162.save48.json')
 expect(createHash('sha256').update(bytes).digest('hex')).toBe(PIN)
 const raw=JSON.parse(bytes.toString()),rawBefore=JSON.stringify(raw)
 const old=saves.validateSaveP15B(raw);expect(old.saveVersion).toBe(48)
 const oldBefore=JSON.stringify(old)
 const current=saves.convertV48ToV49(old),initial=current.state
 expect(current.saveVersion).toBe(49);expect(initial.market.tick).toBe(162)
 const player=initial.hollywood!.playerStudioId,source=initial.hollywood!.businesses.find(b=>b.studioId===TARGET)!
 expect(source,'fixed retained R01 prerequisite').toBeDefined()
 expect(source.account.cash).toBe(13916181.654646564)
 expect(source.productions).toHaveLength(1);expect(source.productions[0]).toMatchObject({id:FILM,startTick:157,remainingTicks:4});expect(source.runs).toHaveLength(0)
 expect(conditionRecord(initial,player)?.condition).toMatchObject({stage:'stable',week:162})
 expect(conditionRecord(initial,TARGET)?.condition).toMatchObject({stage:'stable',week:162})
 expect(outstandingLoan(initial,player,162)).toBeUndefined();expect(outstandingLoan(initial,TARGET,162)).toBeUndefined()
 expect(acquisition.absorptionProducerRefusal(initial,{buyerId:player,targetId:TARGET,consideration:1,retention:{kind:'default'},disclosureId:null})).toBeNull()
 const original=initial.hollywood!.activeEmploymentOrdinals.map(i=>initial.hollywood!.employment[i]!)
  .filter(e=>e.studioId===TARGET&&e.endedWeek===null&&e.terms.startWeek<=162&&162<e.terms.endWeekExclusive)
 expect(original).toHaveLength(6);expect(original.every(e=>e.terms.endWeekExclusive===208)).toBe(true)
 // ONE fixed explicit choice: all six authoritative target intervals; fail if any cannot lawfully continue.
 const retention={kind:'explicit' as const,contractIds:original.map(e=>e.contractId)}
 const initialBefore=JSON.stringify(initial)
 const diligence=requestDiligence(initial,{recipientId:player,target:{kind:'studio',studioId:TARGET},scope:['rights','employment','liabilities']},162)
 expect(JSON.stringify(initial)).toBe(initialBefore);saves.makeSave(diligence.state)
 expect(diligence.record).toMatchObject({week:162,recipientId:player,target:{kind:'studio',studioId:TARGET}})
 expect(diligence.state.studio.cash).toBe(initial.studio.cash-diligence.record.fee)
 expect(diligence.record.fee).toBeGreaterThan(0)
 const expectedExits=original.filter(e=>!retention.contractIds.includes(e.contractId)).reduce((sum,e)=>sum+terminationCost(e.terms,162),0)
 const postExitCash=source.account.cash-expectedExits
 const library=libraryValuationV1(diligence.state,TARGET,162);expect(library.kind).toBe('available')
 if(library.kind!=='available')throw new Error('fixed R01 library valuation premise absent')
 // The single lawful whole consideration at the public ask; not an amount sweep or edited account.
 const consideration=Math.ceil(acquisition.absorptionAsk(library.total,postExitCash))
 const previewInput={buyerId:player,targetId:TARGET,consideration,retention,disclosureId:diligence.record.id}
 const quote=acquisition.quoteAbsorption(diligence.state,previewInput,162)
 expect(quote.kind,'actual person/willingness/reserve/retention premise, no fallback').toBe('quote')
 if(quote.kind!=='quote')throw new Error(quote.refusal)
 expect(quote.affordable).toBe(true)
 expect(quote.contracts.filter(c=>c.retained).map(c=>c.contractId)).toEqual(retention.contractIds)
 expect(quote.contracts.filter(c=>!c.retained)).toHaveLength(0);expect(quote.productions).toHaveLength(1);expect(quote.productions[0]).toMatchObject({productionId:FILM,remainingTicks:4,phase:'shooting',disposition:'continues'})
 expect(quote.exitCharges).toBe(expectedExits);expect(expectedExits).toBe(0)
 expect(quote.targetCashBeforeExits).toBe(source.account.cash);expect(quote.postExitCash).toBe(postExitCash)
 expect(quote.quoteAgePolicyVersion).toBe(1);expect(quote.quotedAtWeek).toBe(162)
 const input={...previewInput,quotedAtWeek:quote.quotedAtWeek,quoteAgePolicyVersion:quote.quoteAgePolicyVersion}
 const state=diligence.state,before=JSON.stringify(state)
 const subjects=subjectsHeldBy(resolveTitles(state),state.rights.estates,TARGET,162)
 expect(subjects.length,'real nonempty held-title transition required').toBeGreaterThan(0)
 return {raw,rawBefore,old,oldBefore,initial,initialBefore,state,before,player,source,original,quote,input,subjects}
}
function originalUnchanged(p:ReturnType<typeof prepared>) {
 expect(JSON.stringify(p.state)).toBe(p.before)
 expect(JSON.stringify(p.initial)).toBe(p.initialBefore)
 expect(JSON.stringify(p.old)).toBe(p.oldBefore)
 expect(JSON.stringify(p.raw)).toBe(p.rawBefore)
}
function complete(p:ReturnType<typeof prepared>) {
 const result=acquisition.closeAbsorption(p.state,p.input,162)
 originalUnchanged(p)
 const record=result.rights.absorptions.find(a=>a.targetId===TARGET)!
 expect(record).toBeDefined();expect(record.week).toBe(162)
 expect(record.quotedAtWeek).toBe(p.input.quotedAtWeek);expect(record.quotedAtWeek).toBe(162)
 expect(record.quoteAgePolicyVersion).toBe(p.input.quoteAgePolicyVersion);expect(record.quoteAgePolicyVersion).toBe(1)
 return {result,record}
}

function pureTick(state:GameState){const before=JSON.stringify(state),next=tick(state);expect(JSON.stringify(state)).toBe(before);return next}
function action(state:GameState,a:Parameters<typeof applyActions>[1][number]){const before=JSON.stringify(state),next=applyActions(state,[a]);expect(JSON.stringify(state)).toBe(before);return next}
function journey(){
 const p=prepared(),{result,record}=complete(p),original=p.source.productions[0]!
 const originalTake=p.state.firstTakes.find(t=>t.productionId===FILM)!,originalLock=p.state.technology.productions.find(t=>t.productionId===FILM)!
 expect(originalTake).toMatchObject({eventId:'first-take-event-45',studioId:TARGET,week:162,directorId:original.directorId,cast:original.cast})
 expect(originalLock).toEqual({studioId:TARGET,productionId:FILM,method:'silent',adoptionId:null,lockedWeek:160})
 const workflow=p.source.operations.workflows.find(w=>w.productionId===FILM)!
 expect(workflow).toMatchObject({phase:'shooting',setup:null,blocker:null,shootingTask:{status:'completed',directorId:original.directorId},bindings:{requiresSetBinding:false,setId:null}})
 expect(record.continuedProductions[0]).toMatchObject({originalProduction:original,originalWorkflow:workflow})
 expect(result.firstTakes.filter(t=>t.productionId===FILM)).toEqual([originalTake])
 expect(result.technology.productions.filter(t=>t.productionId===FILM)).toEqual([originalLock])
 const bw=buyerContinuationWorkflows(result).find(w=>w.productionId===FILM)!
 expect(bw.phase).toBe('shooting');expect(bw.shootingTask).toMatchObject({status:'completed',directorId:original.directorId})
 for(const reservation of bw.reservations)expect(result.operations.facilities.some(f=>f.id===reservation.facilityId&&f.capability===reservation.capability)).toBe(true)
 const wrapped=pureTick(result);expect(wrapped.market.tick).toBe(163)
 expect(buyerContinuedProductions(wrapped).find(f=>f.id===FILM)?.remainingTicks).toBe(3)
 const wraps=wrapped.studioEvents.rows.filter(e=>e.kind==='wrapped'&&e.productionId===FILM)
 expect(wraps).toHaveLength(1);expect(wraps[0]).toMatchObject({week:162,setId:null})
 saves.makeSave(wrapped)
 const post=pureTick(wrapped),ready=pureTick(post)
 expect(post.market.tick).toBe(164);expect(ready.market.tick).toBe(165)
 expect(buyerContinuedProductions(ready).find(f=>f.id===FILM)?.remainingTicks).toBe(1)
 const held=pureTick(ready);expect(held.market.tick).toBe(166)
 expect(buyerContinuedProductions(held).find(f=>f.id===FILM)?.remainingTicks).toBe(1)
 expect(held.hollywood!.films.some(f=>f.filmId===FILM)).toBe(false)
 const text=saves.exportCurrentState(held),reload=saves.migrateToLive(saves.importSave(text)).state
 expect(saves.exportCurrentState(reload)).toBe(text)
 const committed=action(held,{kind:'commitPictureToRelease',productionId:FILM}),final=pureTick(committed)
 const replay=pureTick(action(reload,{kind:'commitPictureToRelease',productionId:FILM}))
 expect(final.market.tick).toBe(167);expect(saves.exportCurrentState(final)).toBe(saves.exportCurrentState(replay))
 return {p,result,record,original,originalTake,originalLock,wrapped,wraps,final}
}
describe('P16 genuine completed-take shooting4 handoff',()=>{
 it('public funded acquisition preserves the actual take silent lock and paid creator work through buyer wrap explicit release and save replay',()=>{
  const j=journey(),{p,final}=j
  expect(final.firstTakes.filter(t=>t.productionId===FILM)).toEqual([j.originalTake])
  expect(final.technology.productions.filter(t=>t.productionId===FILM)).toEqual([j.originalLock])
  expect(final.studioEvents.rows.filter(e=>e.kind==='wrapped'&&e.productionId===FILM)).toEqual(j.wraps)
  const film=final.hollywood!.films.find(f=>f.filmId===FILM)!
  expect(film).toBeDefined();if(film.provenance!=='simulation/v1')throw new Error('real creator film required')
  expect(film.studioId).toBe(TARGET);expect(film.result.releaseTick).toBe(166)
  const record=final.rights.absorptions.find(a=>a.id===j.record.id)!
  expect(record.workReleases).toHaveLength(1);const release=record.workReleases[0]!
  expect(release).toMatchObject({productionId:FILM,week:166})
  expect(final.rights.titleEvents.find(t=>t.id===release.titleEventId)).toMatchObject({cause:'absorbedWorkRelease',priorHolder:TARGET,newHolder:p.player,date:{kind:'campaign',week:166}})
  expect(record.buyerWorkflows).toEqual([])
  expect(record.runs.find(r=>r.productionId===FILM)).toMatchObject({beneficiaryFromWeek:166,startingWeekIndex:0,grossPaidBeforeClose:0,revenuePaidBeforeClose:0})
  expect(final.hollywood!.businesses.find(b=>b.studioId===TARGET)!.projects).toEqual(p.source.projects)
  expect(record.continuedProductions[0]!.originalProduction).toEqual(j.original)
  originalUnchanged(p)
 })
 it('actual positive shooting handoff refuses invented buyer take lock or altered source paid snapshot with full caller purity',()=>{
  const p=prepared(),{result}=complete(p);saves.makeSave(result)
  const cases:Array<{label:string;change:(x:GameState)=>void;expected:RegExp}>=[
   {label:'take wrongly attributed to buyer',change:x=>{x.firstTakes.find(t=>t.productionId===FILM)!.studioId=p.player},expected:/firstTakeSubjects|continued work|first.take/i},
   {label:'missing original source silent lock',change:x=>{x.technology.productions=x.technology.productions.filter(t=>t.productionId!==FILM)},expected:/continued work: completed take lost original silent source authority/},
   {label:'original source silent lock has null lock boundary',change:x=>{x.technology.productions.find(t=>t.productionId===FILM)!.lockedWeek=null},expected:/Production technology: filming has begun without its selected loadout lock\./},
   {label:'silent lock wrongly attributed to buyer',change:x=>{x.technology.productions.find(t=>t.productionId===FILM)!.studioId=p.player},expected:/Technology save|continued work/i},
   {label:'paid original work changed',change:x=>{x.rights.absorptions.find(a=>a.targetId===TARGET)!.continuedProductions[0]!.originalProduction.remainingTicks=3},expected:/continued work|original|snapshot/i}
  ]
  for(const {label,change,expected} of cases){const x=structuredClone(result);change(x);const before=JSON.stringify(x);try{expect(()=>saves.makeSave(x),label).toThrow(expected)}finally{expect(JSON.stringify(x),label).toBe(before)}}
  originalUnchanged(p)
 })
 it('real fully admitted shooting acquisition publication fault rolls back original input without cancelling paid work',()=>{
  const p=prepared();complete(p)
  const real=saves.makeSave,marker='SHOOTING4_PUBLICATION_FAULT';let output=0
  const spy=vi.spyOn(saves,'makeSave').mockImplementation(state=>{const admitted=real(state);if(admitted.state.rights.absorptions.some(a=>a.targetId===TARGET)){output++;throw new Error(marker)}return admitted})
  try{expect(()=>acquisition.closeAbsorption(p.state,p.input,162)).toThrow(marker);expect(output).toBe(1)}finally{spy.mockRestore();originalUnchanged(p)}
 })
})
