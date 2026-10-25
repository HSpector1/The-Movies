// UNRUN source-grounded clean-target transaction controls. Original48 capture has an explicitly
// disclosed R04 condition/finance constructor; R03 is unchanged. This is not natural campaign proof.
// No STABLE readers, new cash/history/work, clock changes, seed/retention/price fallback or wider timeout.
import { describe, expect, it } from 'vitest'
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
import type { GameState } from '../src/core/types.js'
const TARGET='studio-aca408ec-r01',FILM=TARGET+':film:13'
const PIN='cd11f369558e09f1d65d8e848374ea028f4c5f666c168b5527e48c098cfdfb19'

function prepared() {
 const root=process.env.P16_ORIGINAL48_CAPTURE_ROOT;expect(root).toBeTruthy()
 const bytes=readFileSync(root+'/r04-pre162.save48.json')
 expect(createHash('sha256').update(bytes).digest('hex')).toBe(PIN)
 const raw=JSON.parse(bytes.toString()),rawBefore=saves.stableStringify(raw)
 const old=saves.validateSaveP15B(raw);expect(old.saveVersion).toBe(48)
 const oldBefore=saves.stableStringify(old)
 const current=saves.convertV48ToV49(old),initial=current.state
 expect(current.saveVersion).toBe(49);expect(initial.market.tick).toBe(162)
 const player=initial.hollywood!.playerStudioId,source=initial.hollywood!.businesses.find(b=>b.studioId===TARGET)!
 expect(source,'fixed retained R03 prerequisite').toBeDefined()
 expect(source.account.cash).toBe(10336313.262935068)
 expect(source.productions).toHaveLength(1);expect(source.productions[0]).toMatchObject({id:FILM,startTick:161,remainingTicks:8});expect(source.runs).toHaveLength(0)
 expect(conditionRecord(initial,player)?.condition).toMatchObject({stage:'stable',week:162})
 expect(conditionRecord(initial,TARGET)?.condition).toMatchObject({stage:'stable',week:162})
 expect(outstandingLoan(initial,player,162)).toBeUndefined();expect(outstandingLoan(initial,TARGET,162)).toBeUndefined()
 expect(acquisition.absorptionProducerRefusal(initial,{buyerId:player,targetId:TARGET,consideration:1,retention:{kind:'default'},disclosureId:null})).toBeNull()
 const original=initial.hollywood!.activeEmploymentOrdinals.map(i=>initial.hollywood!.employment[i]!)
  .filter(e=>e.studioId===TARGET&&e.endedWeek===null&&e.terms.startWeek<=162&&162<e.terms.endWeekExclusive)
 expect(original).toHaveLength(6);expect(original.every(e=>e.terms.endWeekExclusive>162)).toBe(true)
 // ONE fixed explicit choice: the first authoritative target interval; fail if that person cannot lawfully continue.
 const retention={kind:'explicit' as const,contractIds:[]}
 const initialBefore=saves.stableStringify(initial)
 const diligence=requestDiligence(initial,{recipientId:player,target:{kind:'studio',studioId:TARGET},scope:['rights','employment','liabilities']},162)
 expect(saves.stableStringify(initial)).toBe(initialBefore);saves.makeSave(diligence.state)
 expect(diligence.record).toMatchObject({week:162,recipientId:player,target:{kind:'studio',studioId:TARGET}})
 expect(diligence.state.studio.cash).toBe(initial.studio.cash-diligence.record.fee)
 expect(diligence.record.fee).toBeGreaterThan(0)
 const expectedExits=original.reduce((sum,e)=>sum+terminationCost(e.terms,162),0)
 const postExitCash=source.account.cash-expectedExits
 const library=libraryValuationV1(diligence.state,TARGET,162);expect(library.kind).toBe('available')
 if(library.kind!=='available')throw new Error('fixed R03 library valuation premise absent')
 // The single lawful whole consideration at the public ask; not an amount sweep or edited account.
 const consideration=Math.ceil(acquisition.absorptionAsk(library.total,postExitCash))
 const previewInput={buyerId:player,targetId:TARGET,consideration,retention,disclosureId:diligence.record.id}
 const quote=acquisition.quoteAbsorption(diligence.state,previewInput,162)
 expect(quote.kind,'actual person/willingness/reserve/retention premise, no fallback').toBe('quote')
 if(quote.kind!=='quote')throw new Error(quote.refusal)
 expect(quote.affordable).toBe(true)
 expect(quote.contracts.filter(c=>c.retained)).toEqual([])
 expect(quote.contracts.filter(c=>!c.retained)).toHaveLength(6);expect(quote.productions).toHaveLength(1);expect(quote.productions[0]).toMatchObject({productionId:FILM,remainingTicks:8,disposition:'cancelRequired'})
 expect(quote.exitCharges).toBe(expectedExits);expect(expectedExits).toBeGreaterThan(0)
 expect(quote.targetCashBeforeExits).toBe(source.account.cash);expect(quote.postExitCash).toBe(postExitCash)
 expect(quote.quoteAgePolicyVersion).toBe(1);expect(quote.quotedAtWeek).toBe(162)
 const input={...previewInput,quotedAtWeek:quote.quotedAtWeek,quoteAgePolicyVersion:quote.quoteAgePolicyVersion}
 const state=diligence.state,before=saves.stableStringify(state)
 const subjects=subjectsHeldBy(resolveTitles(state),state.rights.estates,TARGET,162)
 expect(subjects.length,'real nonempty held-title transition required').toBeGreaterThan(0)
 return {raw,rawBefore,old,oldBefore,initial,initialBefore,state,before,player,source,original,quote,input,subjects}
}
function originalUnchanged(p:ReturnType<typeof prepared>) {
 expect(saves.stableStringify(p.state)).toBe(p.before)
 expect(saves.stableStringify(p.initial)).toBe(p.initialBefore)
 expect(saves.stableStringify(p.old)).toBe(p.oldBefore)
 expect(saves.stableStringify(p.raw)).toBe(p.rawBefore)
}
function completed(p:ReturnType<typeof prepared>) {
 const result=acquisition.closeAbsorption(p.state,p.input,162);originalUnchanged(p)
 const record=result.rights.absorptions.find(a=>a.targetId===TARGET)!
 expect(record.stoppedProductions).toHaveLength(1)
 expect(record.stoppedProductions[0]).toMatchObject({productionId:FILM,remainingTicks:8,reason:p.quote.productions[0]!.reason,blockedCapability:p.quote.productions[0]!.blockedCapability,missingParticipants:p.quote.productions[0]!.missingParticipants})
 const target=result.hollywood!.businesses.find(b=>b.studioId===TARGET)!
 expect(target.productions).toEqual(p.source.productions)
 expect(target.development.projects).toEqual(p.source.development.projects)
 expect(target.projects).toEqual(p.source.projects)
 return {result,record,target}
}
describe('P16 genuine pre162 paid R01 production cancellation-required transaction',()=>{
 it('public priced quote cancels only its actual required production and ordinary ticks retain paid screenplay footage and commitment without release refund or run income',()=>{
  const p=prepared(),c=completed(p)
  const text=saves.exportCurrentState(c.result),reload=saves.migrateToLive(saves.importSave(text)).state
  expect(saves.exportCurrentState(reload)).toBe(text)
  let state=c.result
  for(let week=163;week<=170;week++) {const before=JSON.stringify(state),prior=state;state=tick(prior);expect(JSON.stringify(prior)).toBe(before);expect(state.market.tick).toBe(week)}
  const target=state.hollywood!.businesses.find(b=>b.studioId===TARGET)!
  expect(target.productions).toEqual(c.target.productions);expect(target.development.projects).toEqual(c.target.development.projects)
  expect(target.projects).toEqual(c.target.projects);expect(target.runs).toEqual([])
  expect(target.account.cash).toBe(c.target.account.cash)
  expect(state.rights.absorptions.find(a=>a.id===c.record.id)).toEqual(c.record)
  expect(state.hollywood!.receipts.filter(r=>r.studioId===TARGET)).toEqual(c.result.hollywood!.receipts.filter(r=>r.studioId===TARGET))
  expect(state.hollywood!.films.find(f=>f.filmId===FILM)).toEqual(c.result.hollywood!.films.find(f=>f.filmId===FILM))
  expect(state.ledger.filter(e=>e.kind==='constructionRefund'||e.kind==='facilityDemolitionRefund')).toEqual(c.result.ledger.filter(e=>e.kind==='constructionRefund'||e.kind==='facilityDemolitionRefund'))
  saves.makeSave(state);originalUnchanged(p)
 })
 it('strict joined reader rejects omitted disposition wrong screenplay remaining footage and invented missing participant after actual cancellation positive',()=>{
  const p=prepared(),c=completed(p),text=JSON.stringify(saves.makeSave(c.result))
  const reject=(change:(state:GameState)=>void)=>{
   const saved=JSON.parse(text);change(saved.state);const before=JSON.stringify(saved)
   try {expect(()=>saves.validateSaveV49(saved)).toThrow(/absorption|paid|production|screenplay|work/i)}
   finally {expect(JSON.stringify(saved)).toBe(before)}
  }
  reject(state=>{state.rights.absorptions.find(a=>a.id===c.record.id)!.stoppedProductions=[]})
  reject(state=>{state.rights.absorptions.find(a=>a.id===c.record.id)!.stoppedProductions[0]!.scriptProjectId='missing-paid-screenplay'})
  reject(state=>{state.rights.absorptions.find(a=>a.id===c.record.id)!.stoppedProductions[0]!.remainingTicks++})
  reject(state=>{state.rights.absorptions.find(a=>a.id===c.record.id)!.stoppedProductions[0]!.missingParticipants=['person-not-in-this-production']})
  originalUnchanged(p)
 })
})
