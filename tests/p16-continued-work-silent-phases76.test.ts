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
import { guaranteedComp } from '../src/core/employment.js'
import { actualP16Money } from '../src/core/rights.js'
import { permittedBidderRefusal, spendableCash, weeklyFixedCost } from '../src/core/rightsFinance.js'
import { TUNING } from '../src/core/tuning.js'
import { continuedWorkRefusal, buyerOperatedProductions } from '../src/core/continuedWork.js'
import { busyTalentIds, weeklySalary } from '../src/core/employment.js'
import { releaseRefusal } from '../src/core/corporateConditionLive.js'
import { currentHolder } from '../src/core/rights.js'
import { updateStanding } from '../src/core/standing.js'
import { openTheatricalRun } from '../src/core/economy.js'
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

// Fixed actual163 candidate only: R02 is still filming; use the capture's already idle R03.
describe('P16 genuine rival earlier silent continuation admission',()=>{
 it('quotes actual163 unshot silent phase7 with all six original people into idle R03 before reaching the earlier-work producer',()=>{
  const root=process.env.P16_ORIGINAL48_CAPTURE_ROOT;expect(root).toBeTruthy()
  const bytes=readFileSync(root+'/r04-actual163.save48.json')
  expect(createHash('sha256').update(bytes).digest('hex')).toBe(PIN)
  // Preserve the original disclosed drained-R04 fixture; R01/R03 are unchanged.
  const raw=JSON.parse(bytes.toString()),rawBefore=JSON.stringify(raw)
  const old=saves.validateSaveP15B(raw),oldBefore=JSON.stringify(old)
  const current=saves.convertV48ToV49(old),state=current.state,before=JSON.stringify(state)
  expect(old.saveVersion).toBe(48);expect(current.saveVersion).toBe(49);expect(state.market.tick).toBe(163)
  saves.makeSave(state)
  const buyerId='studio-aca408ec-r03',source=state.hollywood!.businesses.find(b=>b.studioId===TARGET)!
  const buyer=state.hollywood!.businesses.find(b=>b.studioId===buyerId)!
  expect(state.hollywood!.playerStudioId).not.toBe(buyerId)
  expect(source.productions).toHaveLength(1);expect(source.runs).toEqual([])
  const production=source.productions[0]!,script=source.development.projects.find(p=>p.productionId===FILM)!
  expect(production).toMatchObject({id:FILM,startTick:161,remainingTicks:7})
  expect(script).toMatchObject({id:'script-0013',status:'inProduction',conceptId:production.conceptId})
  expect(source.development.projects.filter(p=>p.status==='drafting'||p.status==='rewriting')).toEqual([])
  expect(state.firstTakes.filter(t=>t.productionId===FILM)).toEqual([])
  expect(state.technology.productions.filter(p=>p.productionId===FILM)).toEqual([])
  expect(source.operations.workflows.find(w=>w.productionId===FILM))
   .toMatchObject({phase:'preProduction',setup:null,blocker:null,shootingTask:null,bindings:{requiresSetBinding:false,setId:null}})
  expect(continuedWorkRefusal(state,TARGET,production)).toBeNull()
  expect(buyerOperatedProductions(state,buyerId)).toEqual([]);expect(buyer.costCutting.since).toBeNull()
  expect(buyer.operations).toMatchObject({mode:'managed',workflows:[]})
  expect(buyer.development.projects.filter(p=>p.status==='drafting'||p.status==='rewriting'||p.status==='review')).toEqual([])
  for(const id of [buyerId,TARGET]) {
   expect(conditionRecord(state,id)?.condition).toMatchObject({stage:'stable',week:163})
   expect(outstandingLoan(state,id,163)).toBeUndefined()
  }
  expect(permittedBidderRefusal(state,buyerId,163)).toBeNull()
  const employees=state.hollywood!.activeEmploymentOrdinals.map(i=>state.hollywood!.employment[i]!)
   .filter(e=>e.studioId===TARGET&&e.endedWeek===null&&e.terms.startWeek<=163&&163<e.terms.endWeekExclusive)
  expect(employees).toHaveLength(6);expect(employees.every(e=>e.terms.endWeekExclusive===208)).toBe(true)
  const required=[production.writerId,production.directorId,...production.craftIds,...Object.values(production.cast)]
  expect(employees.map(e=>e.terms.talentId).sort()).toEqual([...new Set(required)].sort())
  expect(state.promises.filter(p=>p.issuerStudioId===TARGET&&p.outcome===null)).toEqual([])
  expect(state.talentMarket.proposals.filter(p=>p.issuerStudioId===TARGET)).toEqual([])
  expect(state.talentMarket.cases.filter(c=>c.subjectStudioId===TARGET&&c.closedWeek===null)).toEqual([])
  const paid=requestDiligence(state,{recipientId:buyerId,target:{kind:'studio',studioId:TARGET},scope:['rights','employment','liabilities']},163)
  expect(JSON.stringify(state)).toBe(before)
  expect(paid.record).toMatchObject({week:163,recipientId:buyerId,target:{kind:'studio',studioId:TARGET},fee:TUNING.RIGHTS_DUE_DILIGENCE_FEE})
  expect(paid.record.fee).toBeGreaterThan(0)
  expect(paid.state.hollywood!.businesses.find(b=>b.studioId===buyerId)!.account.cash).toBe(buyer.account.cash-paid.record.fee)
  expect(actualP16Money(paid.state,buyerId).dueDiligenceFee-actualP16Money(state,buyerId).dueDiligenceFee).toBe(-paid.record.fee)
  expect(paid.state.studio).toEqual(state.studio);expect(paid.state.ledger).toEqual(state.ledger)
  const paidBefore=JSON.stringify(paid.state),value=libraryValuationV1(paid.state,TARGET,163)
  expect(value.kind).toBe('available');if(value.kind!=='available')throw new Error('fixed163 earlier continuation needs actual library valuation')
  const consideration=acquisition.absorptionAsk(value.total,source.account.cash)
  const preview={buyerId,targetId:TARGET,consideration,retention:{kind:'explicit' as const,contractIds:employees.map(e=>e.contractId)},disclosureId:paid.record.id}
  const quote=acquisition.quoteAbsorption(paid.state,preview,163)
  expect(quote.kind,'actual R03 person choice, capacity and complete reserve must admit this fixed route').toBe('quote')
  if(quote.kind!=='quote')throw new Error(quote.refusal)
  expect(quote.contracts.filter(c=>c.retained).map(c=>c.contractId)).toEqual(preview.retention.contractIds)
  expect(quote.contracts.every(c=>c.reason===null&&c.busyOn===FILM)).toBe(true)
  expect(quote.productions).toEqual([{productionId:FILM,remainingTicks:7,phase:'preProduction',missingParticipants:[],disposition:'continues',reason:null,blockedCapability:null}])
  expect(quote.scripts).toEqual([]);expect(quote.runs).toEqual([])
  expect(quote.exitCharges).toBe(0);expect(quote.targetCashBeforeExits).toBe(source.account.cash);expect(quote.postExitCash).toBe(source.account.cash)
  expect(quote.guarantees).toBe(employees.reduce((sum,e)=>sum+guaranteedComp(e.terms,163),0))
  expect(quote.affordable).toBe(true);expect(quote.ask).toBe(consideration)
  expect(quote.outlay).toBe(consideration-source.account.cash)
  expect(quote.resultingWeeklyFixedCost).toBe(Math.ceil(weeklyFixedCost(paid.state,buyerId)+employees.reduce((sum,e)=>sum+e.terms.annualSalary/TUNING.TICKS_PER_YEAR,0)+TUNING.OVERHEAD_PER_EMPLOYEE*employees.length))
  expect(quote.reserveAfter).toBe(TUNING.RIGHTS_RESERVE_WEEKS*quote.resultingWeeklyFixedCost)
  expect(spendableCash(paid.state,buyerId)-quote.outlay).toBeGreaterThanOrEqual(quote.reserveAfter)
  const input={...preview,quotedAtWeek:quote.quotedAtWeek,quoteAgePolicyVersion:quote.quoteAgePolicyVersion}
  expect(input).toMatchObject({quotedAtWeek:163,quoteAgePolicyVersion:1})
  expect(acquisition.absorptionProducerRefusal(paid.state,input)).toBeNull()
  console.info('S8_RIVAL_EARLIER_REAL163_PREMISES '+JSON.stringify({week:163,buyerId,targetId:TARGET,productionId:FILM,remainingTicks:production.remainingTicks,retained:preview.retention.contractIds,buyerCash:buyer.account.cash,consideration,outlay:quote.outlay,reserve:quote.reserveAfter,guarantees:quote.guarantees}))
  // The published original-source RED reached rivalBuyerEarlierWorkProducerRequired here.
  let closed:GameState
  try {closed=acquisition.closeAbsorption(paid.state,input,163)}
  finally {
   expect(JSON.stringify(paid.state)).toBe(paidBefore);expect(JSON.stringify(state)).toBe(before)
   expect(JSON.stringify(old)).toBe(oldBefore);expect(JSON.stringify(raw)).toBe(rawBefore)
  }
  const record=closed.rights.absorptions.find(a=>a.targetId===TARGET)!
  const closedSource=closed.hollywood!.businesses.find(b=>b.studioId===TARGET)!,closedBuyer=closed.hollywood!.businesses.find(b=>b.studioId===buyerId)!
  expect(record).toMatchObject({buyerId,targetId:TARGET,week:163,exitCharges:0,outlay:quote.outlay})
  expect(record.continuedProductions).toHaveLength(1)
  expect(record.continuedProductions[0]).toMatchObject({productionId:FILM,scriptProjectId:script.id,originalProduction:production,originalWorkflow:source.operations.workflows.find(w=>w.productionId===FILM)})
  expect(record.workSteps).toEqual([]);expect(record.workReleases).toEqual([]);expect(record.runReceipts).toEqual([])
  expect(closedSource.productions).toEqual(source.productions);expect(closedSource.development).toEqual(source.development)
  expect(closedSource.operations.workflows.some(w=>w.productionId===FILM)).toBe(false)
  expect(closedBuyer.productions).toEqual([]);expect(closedBuyer.runs).toEqual([])
  expect(closedSource.account.cash).toBe(0);expect(closedBuyer.account.cash).toBe(buyer.account.cash-paid.record.fee-quote.outlay)
  expect(closed.contracts).toEqual(paid.state.contracts);expect(closed.operations).toEqual(paid.state.operations)
  expect(closed.studio).toEqual(paid.state.studio);expect(closed.ledger).toEqual(paid.state.ledger)
  for(const original of employees) {
   const buyerContractId=buyerId+':contract:'+original.terms.talentId+':163'
   expect(record.contracts.find(c=>c.sourceContractId===original.contractId)).toEqual({sourceContractId:original.contractId,buyerContractId,talentId:original.terms.talentId,exitCost:0})
   expect(closed.hollywood!.employment.find(e=>e.contractId===original.contractId)).toEqual({...original,endedWeek:163})
   expect(closed.hollywood!.employment.find(e=>e.contractId===buyerContractId))
    .toEqual({contractId:buyerContractId,studioId:buyerId,endedWeek:null,reason:'absorptionContinuation',terms:{...original.terms,startWeek:163,termWeeks:45}})
  }
  const booked=(s:GameState,kind:'signing'|'payroll'|'studioRevenue')=>s.hollywood!.businesses.find(b=>b.studioId===buyerId)!.account.periods.reduce((sum,p)=>sum+p.movements[kind],0)
  expect(booked(closed,'signing')).toBe(booked(paid.state,'signing'))
  const company=[production.directorId,...Object.values(production.cast),...production.craftIds]
  expect(new Set(company).size).toBe(5);expect(company).not.toContain(production.writerId)
  const concept=state.hollywood!.concepts.find(c=>c.id===production.conceptId)!
  let journey=closed
  for(let week=163;week<=170;week++) {
   const prior=journey,priorRecord=prior.rights.absorptions.find(a=>a.id===record.id)!
   const priorBuyer=prior.hollywood!.businesses.find(b=>b.studioId===buyerId)!
   if(week<170) {
    expect(buyerOperatedProductions(prior,buyerId)).toMatchObject([{id:FILM,remainingTicks:170-week}])
    const workflow=priorRecord.buyerWorkflows.find(w=>w.productionId===FILM)!
    expect(priorRecord.buyerWorkflows).toHaveLength(1);expect(workflow.blocker).toBeNull()
    for(const r of workflow.reservations)expect(priorBuyer.operations.facilities.some(f=>f.id===r.facilityId&&f.capability===r.capability)).toBe(true)
    const busy=busyTalentIds(prior)
    for(const id of company) {
     expect(busy.has(id)).toBe(true)
     expect(releaseRefusal(prior,buyerId,id)).toBe(`talent "${id}" is seated on active production "${FILM}" until it is released (R2)`)
    }
   }
   // The actual new rival lock must survive a full save before the native task makes its first take.
   const text=week===165?saves.exportCurrentState(prior):null
   const reload=text===null?null:saves.migrateToLive(saves.importSave(text)).state
   if(reload!==null) {
    expect(reload.market.tick).toBe(165);expect(saves.exportCurrentState(reload)).toBe(text)
    const wrongOwner=structuredClone(reload)
    wrongOwner.technology.productions.find(p=>p.productionId===FILM)!.studioId=TARGET
    const wrongBefore=JSON.stringify(wrongOwner)
    try {expect(()=>saves.makeSave(wrongOwner)).toThrow(/^continued work: silent lock belongs to wrong actual operator\/boundary$/)}
    finally {expect(JSON.stringify(wrongOwner)).toBe(wrongBefore)}
   }
   journey=pureTick(prior);expect(journey.market.tick).toBe(week+1)
   const current=journey.rights.absorptions.find(a=>a.id===record.id)!
   const currentSource=journey.hollywood!.businesses.find(b=>b.studioId===TARGET)!,currentBuyer=journey.hollywood!.businesses.find(b=>b.studioId===buyerId)!
   if(week<170) {
    expect(current.workSteps.slice(0,-1)).toEqual(priorRecord.workSteps)
    expect(current.workSteps.at(-1)).toMatchObject({productionId:FILM,week,beforeRemaining:170-week,afterRemaining:169-week})
    expect(current.workSteps).toHaveLength(week-162);expect(currentBuyer.productions).toEqual([])
    expect(journey.hollywood!.receipts.slice(closed.hollywood!.receipts.length).filter(r=>r.kind==='filmAnnounced'&&r.studioId===buyerId)).toEqual([])
    for(const id of company)expect(journey.hollywood!.employment.find(e=>e.contractId===buyerId+':contract:'+id+':163'))
     .toEqual(closed.hollywood!.employment.find(e=>e.contractId===buyerId+':contract:'+id+':163'))
   } else expect(current.workSteps).toEqual(priorRecord.workSteps)
   const paidPeople=journey.hollywood!.employment.filter(e=>e.studioId===buyerId&&e.terms.startWeek<=week&&week<e.terms.endWeekExclusive&&(e.endedWeek===null||e.endedWeek>week))
   if(week<170)for(const id of company)expect(paidPeople.some(e=>e.terms.talentId===id)).toBe(true)
   expect(booked(journey,'payroll')-booked(prior,'payroll')).toBe(-paidPeople.reduce((sum,e)=>sum+weeklySalary(e.terms.annualSalary),0))
   const moneyBefore=priorBuyer.account.periods.reduce((sum,p)=>sum+Object.values(p.movements).reduce((n,m)=>n+m,0),0)
   const moneyAfter=currentBuyer.account.periods.reduce((sum,p)=>sum+Object.values(p.movements).reduce((n,m)=>n+m,0),0)
   expect(currentBuyer.account.cash-priorBuyer.account.cash).toBeCloseTo(moneyAfter-moneyBefore,6)
   expect(currentBuyer.account.cash).toBeCloseTo(currentBuyer.account.openingBalance+moneyAfter,6)
   expect(currentSource.account).toEqual(closedSource.account);expect(currentSource.projects).toEqual(source.projects)
   expect(currentSource.standing).toEqual(source.standing)
   expect(journey.technology.productions.filter(p=>p.productionId===FILM)).toEqual(week<164?[]:[{studioId:buyerId,productionId:FILM,method:'silent',adoptionId:null,lockedWeek:164}])
   const takes=journey.firstTakes.filter(t=>t.productionId===FILM)
   if(week<165)expect(takes).toEqual([])
   else {
    expect(takes).toHaveLength(1);const take=takes[0]!
    expect(take).toEqual({eventId:take.eventId,week:166,studioId:buyerId,productionId:FILM,directorId:production.directorId,cast:production.cast})
    expect(journey.firstTakeSubjects.facts.find(f=>f.eventId===take.eventId)).toEqual({eventId:take.eventId,conceptId:production.conceptId,genre:concept.genre,scriptProjectId:script.id})
    if(week>165)expect(takes).toEqual(prior.firstTakes.filter(t=>t.productionId===FILM))
   }
   if(week===164||week===165)expect(current.buyerWorkflows.find(w=>w.productionId===FILM))
    .toMatchObject({phase:'shooting',blocker:null,shootingTask:{status:week===164?'unassigned':'completed',directorId:production.directorId}})
   expect(journey.studioEvents.rows.filter(e=>(e.kind==='wrapped'||e.kind==='releaseCommitted')&&e.productionId===FILM)).toEqual([])
   expect(journey.ledger.filter(e=>e.kind==='absorbedRunRevenue')).toEqual(closed.ledger.filter(e=>e.kind==='absorbedRunRevenue'))
   expect(journey.studio.cash).toBeCloseTo(prior.studio.cash+journey.ledger.slice(prior.ledger.length).reduce((sum,e)=>sum+e.amount,0),6)
   let acquiredRevenue=0
   if(week<169) {
    expect(current.workReleases).toEqual([]);expect(current.runReceipts).toEqual([])
    expect(currentSource.development.projects.find(p=>p.id===script.id)).toEqual(script)
    expect(currentSource.productions).toEqual([{...production,remainingTicks:169-week}])
   } else {
    const film=journey.hollywood!.films.find(f=>f.filmId===FILM)!
    if(film.provenance!=='simulation/v1')throw new Error('early continued release must retain its actual creator film')
    expect(film).toMatchObject({filmId:FILM,studioId:TARGET,conceptId:production.conceptId,scriptProjectId:script.id,result:{releaseTick:169,participants:production.participants}})
    expect(film.credits.some(c=>c.talentId===production.writerId&&c.role==='writer')).toBe(true)
    const cost=source.projects[Number(script.id.slice(7))]!
    expect(film.directCommitment).toBe(cost.development+cost.production+cost.marketing)
    expect(currentSource.productions).toEqual([]);expect(currentSource.development.projects.find(p=>p.id===script.id)).toEqual({...script,status:'produced'})
    expect(current.buyerWorkflows).toEqual([]);expect(current.workReleases).toHaveLength(1)
    const release=current.workReleases[0]!
    expect(release).toMatchObject({productionId:FILM,week:169})
    expect(release.standingAfter).toEqual(updateStanding(release.standingBefore,film.result,release.benchmarks,release.standingContext))
    if(week===169)expect(release.standingBefore).toEqual(priorBuyer.standing)
    else expect(current.workReleases).toEqual(priorRecord.workReleases)
    const titles=journey.rights.titleEvents.filter(e=>e.subject.right==='R2'&&e.subject.filmId===FILM)
    expect(titles).toHaveLength(2)
    expect(titles.find(e=>e.cause==='genesis')).toMatchObject({newHolder:TARGET,date:{kind:'campaign',week:169}})
    expect(titles.find(e=>e.id===release.titleEventId)).toMatchObject({cause:'absorbedWorkRelease',priorHolder:TARGET,newHolder:buyerId,date:{kind:'campaign',week:169}})
    expect(currentHolder(journey,{right:'R2',filmId:FILM},week)).toMatchObject({kind:'holder',holderId:buyerId})
    expect(journey.hollywood!.receipts.filter(r=>r.kind==='filmReleased'&&r.productionId===FILM))
     .toMatchObject([{week:169,studioId:TARGET,before:source.standing,after:source.standing}])
    const opening=film.result.boxOffice.opening,schedule=openTheatricalRun(film.result,opening,opening>0?film.result.boxOffice.total/opening:1,169)
    const index=week-169,gross=schedule.weeklyGross[index]!
    acquiredRevenue=gross*schedule.studioShare
    expect(current.runReceipts.slice(0,-1)).toEqual(priorRecord.runReceipts);expect(current.runReceipts).toHaveLength(index+1)
    expect(current.runReceipts.at(-1)).toMatchObject({week,productionId:FILM,weekIndex:index,gross,revenue:acquiredRevenue})
    expect(current.runs).toEqual([{productionId:FILM,beneficiaryFromWeek:169,startingWeekIndex:0,grossPaidBeforeClose:0,revenuePaidBeforeClose:0}])
    expect(currentSource.runs).toEqual([{...schedule,weekIndex:index+1,cumulativeGrossPaid:current.runReceipts.reduce((sum,r)=>sum+r.gross,0),cumulativeStudioRevenuePaid:current.runReceipts.reduce((sum,r)=>sum+r.revenue,0)}])
    expect(film.studioRevenueReceived).toBe(current.runReceipts.reduce((sum,r)=>sum+r.revenue,0))
   }
   // R03 has no prior run; source R01 is visited first, but opening revenue is still due at release169.
   expect(booked(journey,'studioRevenue')-booked(prior,'studioRevenue')).toBeCloseTo(acquiredRevenue,6)
   if(reload!==null)expect(saves.exportCurrentState(pureTick(reload))).toBe(saves.exportCurrentState(journey))
  }
  const finalText=saves.exportCurrentState(journey),finalReload=saves.migrateToLive(saves.importSave(finalText)).state
  expect(saves.exportCurrentState(finalReload)).toBe(finalText)
  expect(finalReload.rights.absorptions.find(a=>a.id===record.id)!.runReceipts).toHaveLength(2)
  expect(JSON.stringify(paid.state)).toBe(paidBefore);expect(JSON.stringify(state)).toBe(before)
  expect(JSON.stringify(old)).toBe(oldBefore);expect(JSON.stringify(raw)).toBe(rawBefore)
 })
})
