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
import { currentHolder, resolveTitles, subjectsHeldBy } from '../src/core/rights.js'
import { tick } from '../src/core/tick.js'
import { applyActions } from '../src/core/actions.js'
import type { GameState } from '../src/core/types.js'
import { standingChanged } from '../src/core/studioHistory.js'
import { persistedProductionIds } from '../src/core/productionIdentity.js'
import { updateStanding } from '../src/core/standing.js'
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

function journey(p:ReturnType<typeof prepared>) {
 const {result,record}=complete(p),link=record.continuedProductions[0]!
 expect(record.continuedProductions).toHaveLength(1)
 expect(link).toMatchObject({productionId:FILM,originalReleaseCommitment:null})
 expect(link.originalProduction).toEqual(p.source.productions[0])
 expect(link.originalWorkflow).toEqual(p.source.operations.workflows.find(w=>w.productionId===FILM))
 expect(link.originalWorkflow.phase).toBe('postProduction')
 expect(p.state.operations.facilities.some(f=>f.id===link.buyerPostFacilityId&&f.capability==='post')).toBe(true)
 expect(result.operations.facilities).toEqual(p.state.operations.facilities)
 expect(result.hollywood!.businesses.find(b=>b.studioId===TARGET)!.operations.workflows.some(w=>w.productionId===FILM)).toBe(false)
 expect(result.hollywood!.businesses.find(b=>b.studioId===TARGET)!.projects).toEqual(p.source.projects)
 const originalTake=p.state.firstTakes.find(e=>e.productionId===FILM)!
 expect(originalTake).toMatchObject({week:162,studioId:TARGET})
 const pureTick=(state:GameState)=>{const before=JSON.stringify(state),next=tick(state);expect(JSON.stringify(state)).toBe(before);return next}
 const earlyBefore=JSON.stringify(result)
 try {expect(()=>applyActions(result,[{kind:'commitPictureToRelease',productionId:FILM}])).toThrow(/not Release Ready/)}
 finally {expect(JSON.stringify(result)).toBe(earlyBefore)}
 const ready=pureTick(pureTick(result));expect(ready.market.tick).toBe(165)
 expect(ready.hollywood!.businesses.find(b=>b.studioId===TARGET)!.productions.find(production=>production.id===FILM)!.remainingTicks).toBe(1)
 expect(ready.hollywood!.businesses.find(b=>b.studioId===TARGET)!.releaseAuthority.commitments).toEqual([])
 const held=pureTick(ready);expect(held.market.tick).toBe(166)
 expect(held.hollywood!.businesses.find(b=>b.studioId===TARGET)!.productions.find(production=>production.id===FILM)!.remainingTicks).toBe(1)
 expect(held.hollywood!.films.some(f=>f.filmId===FILM)).toBe(false)
 expect(held.rights.absorptions.find(a=>a.id===record.id)!.workReleases).toEqual([])
 const heldText=saves.exportCurrentState(held),reloaded=saves.migrateToLive(saves.importSave(heldText)).state
 expect(saves.exportCurrentState(reloaded)).toBe(heldText)
 const heldBefore=JSON.stringify(held),committed=applyActions(held,[{kind:'commitPictureToRelease',productionId:FILM}])
 expect(JSON.stringify(held)).toBe(heldBefore);expect(committed.market.tick).toBe(166)
 expect(committed.studio.cash).toBe(held.studio.cash);expect(committed.rngState).toEqual(held.rngState)
 expect(committed.studioEvents.rows.filter(e=>e.kind==='releaseCommitted'&&e.productionId===FILM)).toMatchObject([{week:166}])
 const authority=committed.hollywood!.businesses.find(b=>b.studioId===TARGET)!.releaseAuthority.commitments
 expect(authority).toEqual([{productionId:FILM,commitmentId:'release-commitment-'+FILM,committedAtWeek:166}])
 const committedBefore=JSON.stringify(committed)
 try {expect(()=>applyActions(committed,[{kind:'commitPictureToRelease',productionId:FILM}])).toThrow(/already|committed/i)}
 finally {expect(JSON.stringify(committed)).toBe(committedBefore)}
 const final=pureTick(committed),replay=pureTick(applyActions(reloaded,[{kind:'commitPictureToRelease',productionId:FILM}]))
 expect(final.market.tick).toBe(167);expect(saves.exportCurrentState(final)).toBe(saves.exportCurrentState(replay))
 const finalRecord=final.rights.absorptions.find(a=>a.id===record.id)!
 expect(finalRecord.workSteps.map(step=>({productionId:step.productionId,week:step.week,beforeRemaining:step.beforeRemaining,afterRemaining:step.afterRemaining})))
  .toEqual([{productionId:FILM,week:163,beforeRemaining:3,afterRemaining:2},{productionId:FILM,week:164,beforeRemaining:2,afterRemaining:1},{productionId:FILM,week:165,beforeRemaining:1,afterRemaining:1},{productionId:FILM,week:166,beforeRemaining:1,afterRemaining:0}])
 const film=final.hollywood!.films.find(f=>f.filmId===FILM)!
 expect(film).toBeDefined();if(film.provenance!=='simulation/v1')throw new Error('actual creator film required')
 expect(film.studioId).toBe(TARGET);expect(film.result.releaseTick).toBe(166)
 expect(finalRecord.workReleases).toHaveLength(1)
 const release=finalRecord.workReleases[0]!
 expect(release).toMatchObject({productionId:FILM,week:166})
 expect(release.benchmarks).toEqual({expectedOpening:link.originalProduction.forecastSnapshot.expectedOpening,expectedTotal:link.originalProduction.forecastSnapshot.expectedTotal,expectedCriticScore:link.originalProduction.forecastSnapshot.expectedCriticScore})
 expect(release.standingAfter).toEqual(updateStanding(release.standingBefore,film.result,release.benchmarks,release.standingContext))
 expect(release.titleEventId).not.toBeNull()
 expect(currentHolder(final,{right:'R2',filmId:FILM},166)).toMatchObject({kind:'holder',holderId:p.player})
 const titles=final.rights.titleEvents.filter(e=>e.subject.right==='R2'&&e.subject.filmId===FILM)
 expect(titles.find(e=>e.cause==='genesis')).toMatchObject({newHolder:TARGET,date:{kind:'campaign',week:166}})
 expect(titles.find(e=>e.id===release.titleEventId)).toMatchObject({cause:'absorbedWorkRelease',priorHolder:TARGET,newHolder:p.player,date:{kind:'campaign',week:166}})
 expect(final.firstTakes.find(e=>e.productionId===FILM)).toEqual(originalTake)
 expect(final.hollywood!.businesses.find(b=>b.studioId===TARGET)!.standing).toEqual(p.source.standing)
 const history=final.studioHistory.rows.filter(r=>r.kind==='standingChanged'&&r.source.kind==='releaseResult'&&r.source.productionId===FILM)
 expect(history).toHaveLength(standingChanged(release.standingBefore,release.standingAfter)?1:0)
 expect(finalRecord.buyerWorkflows).toEqual([])
 expect(finalRecord.runs.find(r=>r.productionId===FILM)).toMatchObject({beneficiaryFromWeek:166,startingWeekIndex:0,grossPaidBeforeClose:0,revenuePaidBeforeClose:0})
 originalUnchanged(p)
 return {result,record,held,committed,final,finalRecord,release,film,pureTick}
}
describe('P16 genuine163 R02 paid post-production explicit healthy continuation',()=>{
 it('actual buyer allocation holds ready work without commitment then public commit166 releases with original creator buyer R2 Standing future cash and replay',()=>{
  const p=prepared(),j=journey(p)
  const identityBefore=JSON.stringify(j.final)
  expect(persistedProductionIds(j.final).has(FILM)).toBe(true)
  expect(JSON.stringify(j.final)).toBe(identityBefore)
  expect(j.record.contracts.filter(c=>c.buyerContractId!==null)).toHaveLength(6)
  for(const old of p.original) {
   const link=j.record.contracts.find(c=>c.sourceContractId===old.contractId)!
   expect(j.result.hollywood!.employment.find(e=>e.contractId===link.buyerContractId)!.terms).toEqual({...old.terms,startWeek:163,termWeeks:45})
  }
  const run=j.final.hollywood!.businesses.find(b=>b.studioId===TARGET)!.runs.find(r=>r.productionId===FILM)!
  expect(run).toBeDefined();expect(run.releaseTick).toBe(166)
  const next=j.pureTick(j.final),owner=next.rights.absorptions.find(a=>a.id===j.record.id)!
  const receipts=owner.runReceipts.filter(r=>r.productionId===FILM)
  expect(receipts.map(r=>r.week)).toEqual([166,167])
  for(const receipt of receipts) {
   expect(receipt.gross).toBe(run.weeklyGross[receipt.weekIndex]);expect(receipt.revenue).toBe(receipt.gross*run.studioShare)
   const rows=next.ledger.filter(e=>e.kind==='absorbedRunRevenue'&&e.note===receipt.id)
   expect(rows).toHaveLength(receipt.revenue>0?1:0);if(receipt.revenue>0)expect(rows[0]).toMatchObject({week:receipt.week,amount:receipt.revenue})
  }
  expect(next.hollywood!.businesses.find(b=>b.studioId===TARGET)!.account.cash).toBe(j.final.hollywood!.businesses.find(b=>b.studioId===TARGET)!.account.cash)
  expect(next.studio.cash).toBeCloseTo(j.final.studio.cash+next.ledger.slice(j.final.ledger.length).reduce((n,e)=>n+e.amount,0),6)
  const text=saves.exportCurrentState(next),reload=saves.migrateToLive(saves.importSave(text)).state
  expect(saves.exportCurrentState(reload)).toBe(text);originalUnchanged(p)
 })
 it('actual admitted release refuses omitted or invented work counter commitment title and Standing authority with full-reader caller purity',()=>{
  const p=prepared(),j=journey(p),text=JSON.stringify(saves.makeSave(j.final))
  const reject=(change:(state:GameState)=>void,expectedPattern=/continued|work|release|Standing|rights|commitment|studio/i)=>{
   const saved=JSON.parse(text);change(saved.state);const before=JSON.stringify(saved)
   try {expect(()=>saves.validateSaveV49(saved)).toThrow(expectedPattern)}
   finally {expect(JSON.stringify(saved)).toBe(before)}
  }
  reject(state=>{const film=state.hollywood!.films.find(f=>f.filmId===FILM)!;expect(film).toBeDefined();state.hollywood={...state.hollywood!,films:[...state.hollywood!.films,structuredClone(film)]}},/duplicate film identity/)
  reject(state=>{state.rights.absorptions.find(a=>a.id===j.record.id)!.workSteps=state.rights.absorptions.find(a=>a.id===j.record.id)!.workSteps.slice(1)})
  reject(state=>{state.rights.absorptions.find(a=>a.id===j.record.id)!.workSteps[2]!.afterRemaining=0})
  reject(state=>{state.studioEvents={...state.studioEvents,rows:state.studioEvents.rows.filter(e=>!(e.kind==='releaseCommitted'&&e.productionId===FILM))}})
  reject(state=>{state.rights.absorptions.find(a=>a.id===j.record.id)!.continuedProductions[0]!.originalReleaseCommitment={productionId:FILM,commitmentId:'release-commitment-'+FILM,committedAtWeek:163}})
  reject(state=>{state.rights.absorptions.find(a=>a.id===j.record.id)!.workReleases[0]!.titleEventId=null})
  expect(j.final.studioHistory.rows.filter(r=>r.kind==='standingChanged'&&r.source.kind==='releaseResult'&&r.source.productionId===FILM)).toHaveLength(1)
  reject(state=>{state.studioHistory={...state.studioHistory,rows:state.studioHistory.rows.filter(r=>!(r.kind==='standingChanged'&&r.source.kind==='releaseResult'&&r.source.productionId===FILM))}})
  originalUnchanged(p)
 })
 it('real complete current49 publication fault rolls back the original public163 caller after all native snapshot and title employment joins validate',()=>{
  const p=prepared(),positive=complete(p)
  expect(positive.record.continuedProductions).toHaveLength(1)
  const real=saves.makeSave,marker='R9_CONTINUATION_REAL_JOINED_PUBLICATION_FAULT';let output=0
  const spy=vi.spyOn(saves,'makeSave').mockImplementation(state=>{
   const admitted=real(state)
   if(admitted.state.rights.absorptions.some(a=>a.targetId===TARGET)) {output++;throw new Error(marker)}
   return admitted
  })
  try {expect(()=>acquisition.closeAbsorption(p.state,p.input,163)).toThrow(marker);expect(output).toBe(1)}
  finally {spy.mockRestore();originalUnchanged(p)}
 })
})
