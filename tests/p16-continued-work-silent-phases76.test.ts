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
import { applyActions } from '../src/core/actions.js'
import {buyerContinuedProductions,buyerContinuationWorkflows} from '../src/core/continuedWork.js'
import { tick } from '../src/core/tick.js'
import type { GameState } from '../src/core/types.js'
const TARGET='studio-aca408ec-r01',FILM=TARGET+':film:13'
const PIN='c17b7aa82bd09e6988867e149ed0266803d8e432cfcd8842d9c2aca1f7ace8ad'

function prepared(week:163|164) {
 const root=process.env.P16_ORIGINAL48_CAPTURE_ROOT;expect(root).toBeTruthy()
 const bytes=readFileSync(root+'/r04-actual163.save48.json')
 expect(createHash('sha256').update(bytes).digest('hex')).toBe(PIN)
 const raw=JSON.parse(bytes.toString()),rawBefore=JSON.stringify(raw)
 const old=saves.validateSaveP15B(raw);expect(old.saveVersion).toBe(48)
 const oldBefore=JSON.stringify(old)
 const current=saves.convertV48ToV49(old)
 expect(current.state.market.tick).toBe(163)
 const migratedBefore=JSON.stringify(current.state),initial=week===164?tick(current.state):current.state
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
 // ONE fixed explicit choice: all six authoritative target intervals; fail if any cannot lawfully continue.
 const retention={kind:'explicit' as const,contractIds:original.map(e=>e.contractId)}
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
 expect(quote.contracts.filter(c=>!c.retained)).toHaveLength(0);expect(quote.productions).toHaveLength(1);expect(quote.productions[0]).toMatchObject({productionId:FILM,remainingTicks:170-week,phase:week===163?'preProduction':'rehearsal',disposition:'continues'})
 expect(quote.exitCharges).toBe(expectedExits);expect(expectedExits).toBe(0)
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
function complete(p:ReturnType<typeof prepared>) {
 const result=acquisition.closeAbsorption(p.state,p.input,p.week)
 originalUnchanged(p)
 const record=result.rights.absorptions.find(a=>a.targetId===TARGET)!
 expect(record).toBeDefined();expect(record.week).toBe(p.week)
 expect(record.quotedAtWeek).toBe(p.input.quotedAtWeek);expect(record.quotedAtWeek).toBe(p.week)
 expect(record.quoteAgePolicyVersion).toBe(p.input.quoteAgePolicyVersion);expect(record.quoteAgePolicyVersion).toBe(1)
 return {result,record}
}

function pureTick(state:GameState){const before=JSON.stringify(state),next=tick(state);expect(JSON.stringify(state)).toBe(before);return next}
function action(state:GameState,a:Parameters<typeof applyActions>[1][number]){const before=JSON.stringify(state),next=applyActions(state,[a]);expect(JSON.stringify(state)).toBe(before);return next}
function journey(week:163|164){
 const p=prepared(week),{result}=complete(p),original=p.source.productions[0]!
 let state=result
 expect(state.firstTakes.some(t=>t.productionId===FILM)).toBe(false)
 for(let input=week;input<=164;input++){expect(state.market.tick).toBe(input);state=pureTick(state)}
 expect(state.market.tick).toBe(165)
 expect(buyerContinuedProductions(state).find(f=>f.id===FILM)?.remainingTicks).toBe(5)
 const lock=state.technology.productions.filter(t=>t.productionId===FILM)
 expect(lock).toEqual([{studioId:p.player,productionId:FILM,method:'silent',adoptionId:null,lockedWeek:164}])
 const before=JSON.stringify(state)
 expect(()=>applyActions(state,[{kind:'scheduleShootingTake',productionId:FILM}])).toThrow(/shooting task is not ready/)
 expect(JSON.stringify(state)).toBe(before)
 state=action(state,{kind:'assignShootingDirector',productionId:FILM,directorId:original.directorId})
 expect(buyerContinuationWorkflows(state).find(w=>w.productionId===FILM)).toMatchObject({shootingTask:{status:'blocked'},blocker:{kind:'scenery-load-in'}})
 state=action(state,{kind:'clearSceneryLoadIn',productionId:FILM})
 expect(buyerContinuationWorkflows(state).find(w=>w.productionId===FILM)?.shootingTask?.status).toBe('ready')
 state=action(state,{kind:'scheduleShootingTake',productionId:FILM})
 expect(buyerContinuationWorkflows(state).find(w=>w.productionId===FILM)?.shootingTask?.status).toBe('scheduled')
 state=pureTick(state)
 expect(state.market.tick).toBe(166)
 expect(buyerContinuedProductions(state).find(f=>f.id===FILM)?.remainingTicks).toBe(4)
 return {p,state,original}
}
describe.each([163,164] as const)('P16 genuine initial early SILENT boundary %i',week=>{
 it('actual positive first take refuses missing or foreign operator lock and creator subject without mutating any refused caller',()=>{
  const {state}=journey(week);saves.makeSave(state)
  const mutations:Array<{label:string;expected:RegExp;mutate:(x:GameState)=>void}>=[
   {label:'deleted actual buyer first take leaves an unmatched subject suffix',expected:/validateSaveV40: firstTakeSubjects.*complete ordered receipt suffix/,mutate:x=>{x.firstTakes=x.firstTakes.filter(t=>t.productionId!==FILM)}},
   {label:'deleted actual silent phase-entry lock',expected:/continued work: silent lock\/actual phase-entry bijection differs/,mutate:x=>{x.technology.productions=x.technology.productions.filter(t=>t.productionId!==FILM)}},
   {label:'silent lock assigned to original creator rather than actual buyer',expected:/continued work: silent lock belongs to wrong actual operator\/boundary/,mutate:x=>{x.technology.productions.find(t=>t.productionId===FILM)!.studioId=TARGET}},
   {label:'deleted actual creator screenplay subject',expected:/validateSaveV40: firstTakeSubjects.*complete ordered receipt suffix/,mutate:x=>{const event=x.firstTakes.find(t=>t.productionId===FILM)!.eventId;x.firstTakeSubjects.facts=x.firstTakeSubjects.facts.filter(f=>f.eventId!==event)}}
  ]
  for(const {label,mutate,expected} of mutations){const x=structuredClone(state);mutate(x);const before=JSON.stringify(x);try{expect(()=>saves.makeSave(x),label).toThrow(expected)}finally{expect(JSON.stringify(x),label+' caller purity').toBe(before)}}
 })
 it('real joined public acquisition publication fault leaves the admitted earlier paid work caller untouched',()=>{
  const p=prepared(week);complete(p)
  const real=saves.makeSave,marker='EARLY_SILENT_PUBLICATION_FAULT';let output=0
  const spy=vi.spyOn(saves,'makeSave').mockImplementation(state=>{const admitted=real(state);if(admitted.state.rights.absorptions.some(a=>a.targetId===TARGET)){output++;throw new Error(marker)}return admitted})
  try{expect(()=>acquisition.closeAbsorption(p.state,p.input,p.week)).toThrow(marker);expect(output).toBe(1)}finally{spy.mockRestore();originalUnchanged(p)}
 })
 it('native wrap preserves production identity then explicit release publishes creator film buyer rights and a replayable current save',()=>{
  const {p,state:takeState,original}=journey(week)
  const state=takeState
  const takes=state.firstTakes.filter(t=>t.productionId===FILM)
  expect(takes).toHaveLength(1);expect(takes[0]).toMatchObject({studioId:p.player,week:166,directorId:original.directorId,cast:original.cast})
  const source=state.hollywood!.businesses.find(b=>b.studioId===TARGET)!
  const script=p.source.development.projects.find(q=>q.productionId===FILM)!
  expect(state.firstTakeSubjects.facts.find(f=>f.eventId===takes[0]!.eventId)).toMatchObject({conceptId:original.conceptId,scriptProjectId:script.id})
  expect(source.development.projects.find(q=>q.id===script.id)).toEqual(script)
  expect(source.projects).toEqual(p.source.projects)
  expect(source.productions.find(f=>f.id===FILM)).toEqual({...original,remainingTicks:4})
  const wrapped=pureTick(takeState)
  expect(wrapped.market.tick).toBe(167)
  expect(buyerContinuedProductions(wrapped).find(f=>f.id===FILM)?.remainingTicks).toBe(3)
  const wraps=wrapped.studioEvents.rows.filter(e=>e.kind==='wrapped'&&e.productionId===FILM)
  expect(wraps).toHaveLength(1)
  expect(wraps[0]).toMatchObject({week:166}) // native input week; observed in state167
  expect(wrapped.hollywood!.businesses.find(b=>b.studioId===TARGET)!.productions.find(f=>f.id===FILM)).toEqual({...original,remainingTicks:3})
  saves.makeSave(wrapped)
  let ready=pureTick(wrapped);expect(ready.market.tick).toBe(168)
  ready=pureTick(ready);expect(ready.market.tick).toBe(169)
  expect(buyerContinuedProductions(ready).find(f=>f.id===FILM)?.remainingTicks).toBe(1)
  const held=pureTick(ready);expect(held.market.tick).toBe(170)
  expect(buyerContinuedProductions(held).find(f=>f.id===FILM)?.remainingTicks).toBe(1)
  expect(held.hollywood!.films.some(f=>f.filmId===FILM)).toBe(false)
  const text=saves.exportCurrentState(held),reload=saves.migrateToLive(saves.importSave(text)).state
  expect(saves.exportCurrentState(reload)).toBe(text)
  const committed=action(held,{kind:'commitPictureToRelease',productionId:FILM})
  expect(committed.market.tick).toBe(170)
  const final=pureTick(committed),replay=pureTick(action(reload,{kind:'commitPictureToRelease',productionId:FILM}))
  expect(final.market.tick).toBe(171)
  expect(saves.exportCurrentState(final)).toBe(saves.exportCurrentState(replay))
  expect(final.studioEvents.rows.filter(e=>e.kind==='wrapped'&&e.productionId===FILM)).toEqual(wraps)
  const film=final.hollywood!.films.find(f=>f.filmId===FILM)!
  expect(film).toBeDefined();if(film.provenance!=='simulation/v1')throw new Error('actual creator film required')
  expect(film.studioId).toBe(TARGET);expect(film.result.releaseTick).toBe(170)
  const record=final.rights.absorptions.find(a=>a.targetId===TARGET)!
  expect(record.workReleases).toHaveLength(1)
  const release=record.workReleases[0]!;expect(release).toMatchObject({productionId:FILM,week:170})
  expect(release.titleEventId).not.toBeNull()
  expect(final.rights.titleEvents.find(e=>e.id===release.titleEventId)).toMatchObject({cause:'absorbedWorkRelease',priorHolder:TARGET,newHolder:p.player,date:{kind:'campaign',week:170}})
  expect(record.buyerWorkflows).toEqual([])
  expect(record.runs.find(r=>r.productionId===FILM)).toMatchObject({beneficiaryFromWeek:170,startingWeekIndex:0,grossPaidBeforeClose:0,revenuePaidBeforeClose:0})
  expect(final.firstTakes.filter(t=>t.productionId===FILM)).toEqual(takeState.firstTakes.filter(t=>t.productionId===FILM))
  originalUnchanged(p)
 })
})
