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
import { absorbedWeekOf, closedWeekOf, isOperatingStudio } from '../src/core/operatingState.js'
import { tick } from '../src/core/tick.js'
import type { GameState } from '../src/core/types.js'
const TARGET='studio-aca408ec-r03'
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
 expect(source.account.cash).toBe(6690650.718992807)
 expect(source.productions).toHaveLength(0);expect(source.runs).toHaveLength(0)
 expect(conditionRecord(initial,player)?.condition).toMatchObject({stage:'stable',week:162})
 expect(conditionRecord(initial,TARGET)?.condition).toMatchObject({stage:'stable',week:162})
 expect(outstandingLoan(initial,player,162)).toBeUndefined();expect(outstandingLoan(initial,TARGET,162)).toBeUndefined()
 expect(acquisition.absorptionProducerRefusal(initial,{buyerId:player,targetId:TARGET,consideration:1,retention:{kind:'default'},disclosureId:null})).toBeNull()
 const original=initial.hollywood!.activeEmploymentOrdinals.map(i=>initial.hollywood!.employment[i]!)
  .filter(e=>e.studioId===TARGET&&e.endedWeek===null&&e.terms.startWeek<=162&&162<e.terms.endWeekExclusive)
 expect(original).toHaveLength(6);expect(original.every(e=>e.terms.endWeekExclusive===208)).toBe(true)
 // ONE fixed explicit choice: the first authoritative target interval; fail if that person cannot lawfully continue.
 const keep=original[0]!,retention={kind:'explicit' as const,contractIds:[keep.contractId]}
 const initialBefore=saves.stableStringify(initial)
 const diligence=requestDiligence(initial,{recipientId:player,target:{kind:'studio',studioId:TARGET},scope:['rights','employment','liabilities']},162)
 expect(saves.stableStringify(initial)).toBe(initialBefore);saves.makeSave(diligence.state)
 expect(diligence.record).toMatchObject({week:162,recipientId:player,target:{kind:'studio',studioId:TARGET}})
 expect(diligence.state.studio.cash).toBe(initial.studio.cash-diligence.record.fee)
 expect(diligence.record.fee).toBeGreaterThan(0)
 const expectedExits=original.filter(e=>e!==keep).reduce((sum,e)=>sum+terminationCost(e.terms,162),0)
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
 expect(quote.contracts.filter(c=>c.retained).map(c=>c.contractId)).toEqual([keep.contractId])
 expect(quote.contracts.filter(c=>!c.retained)).toHaveLength(5)
 expect(quote.exitCharges).toBe(expectedExits);expect(expectedExits).toBeGreaterThan(0)
 expect(quote.targetCashBeforeExits).toBe(source.account.cash);expect(quote.postExitCash).toBe(postExitCash)
 expect(quote.quoteAgePolicyVersion).toBe(1);expect(quote.quotedAtWeek).toBe(162)
 const input={...previewInput,quotedAtWeek:quote.quotedAtWeek,quoteAgePolicyVersion:quote.quoteAgePolicyVersion}
 const state=diligence.state,before=saves.stableStringify(state)
 const subjects=subjectsHeldBy(resolveTitles(state),state.rights.estates,TARGET,162)
 expect(subjects.length,'real nonempty held-title transition required').toBeGreaterThan(0)
 return {raw,rawBefore,old,oldBefore,initial,initialBefore,state,before,player,source,original,keep,quote,input,subjects}
}
function originalUnchanged(p:ReturnType<typeof prepared>) {
 expect(saves.stableStringify(p.state)).toBe(p.before)
 expect(saves.stableStringify(p.initial)).toBe(p.initialBefore)
 expect(saves.stableStringify(p.old)).toBe(p.oldBefore)
 expect(saves.stableStringify(p.raw)).toBe(p.rawBefore)
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

describe('P16 actual clean-target absorption from retained original48 R03',()=>{
 it('retains one linked bargain, pays five capped exits and exact fractional cash at par, preserves titles/history and ordinary replay',()=>{
  const p=prepared(),{result,record}=complete(p),h=result.hollywood!
  expect(record.contracts.map(c=>c.sourceContractId)).toEqual(p.original.map(e=>e.contractId))
  expect(record.exitCharges).toBe(p.quote.exitCharges)
  expect(record.cashBeforeExits).toBe(p.source.account.cash)
  expect(Number.isInteger(record.cashBeforeExits)).toBe(false)
  expect(record.postExitCash).toBe(record.cashBeforeExits-record.exitCharges)
  expect(record.outlay).toBe(record.consideration-record.postExitCash)
  expect(result.studio.cash).toBe(p.state.studio.cash-record.outlay)
  const target=h.businesses.find(b=>b.studioId===TARGET)!
  expect(target.account.cash).toBe(0)
  expect(target.account.periods.reduce((sum,row)=>sum+row.movements.acquisitionOutlay,0)).toBe(-record.postExitCash)
  expect(target.account.periods.reduce((sum,row)=>sum+row.movements.termination,0))
   .toBe(p.source.account.periods.reduce((sum,row)=>sum+row.movements.termination,0)-record.exitCharges)
  const payment=result.ledger.filter(e=>e.kind==='acquisitionOutlay'&&e.note===record.id)
  expect(payment).toHaveLength(1);expect(payment[0]).toMatchObject({week:162,amount:-record.outlay})
  const link=record.contracts.find(c=>c.sourceContractId===p.keep.contractId)!
  expect(link.buyerContractId).not.toBeNull();expect(link.buyerContractId).not.toBe(p.keep.contractId)
  const kept=h.employment.find(e=>e.contractId===link.buyerContractId)!
  expect(kept.studioId).toBe(p.player);expect(kept.reason).toBe('absorptionContinuation')
  expect(kept.terms).toEqual({...p.keep.terms,startWeek:162,termWeeks:46})
  for(const original of p.original) {
   const ended=h.employment.find(e=>e.contractId===original.contractId)!
   expect(ended.terms).toEqual(original.terms);expect(ended.endedWeek).toBe(162)
   expect(h.receipts.filter(r=>r.kind==='employment'&&r.contractId===original.contractId&&r.toStudioId===null&&r.week===162)).toHaveLength(1)
  }
  expect(result.ledger.filter(e=>e.kind==='signingBonus')).toEqual(p.state.ledger.filter(e=>e.kind==='signingBonus'))
  expect(h.receipts.slice(0,p.state.hollywood!.receipts.length)).toEqual(p.state.hollywood!.receipts)
  expect(target.operations).toEqual(p.source.operations)
  expect(result.technology).toEqual(p.state.technology)
  expect(record.research).toHaveLength(0) // deliberately NOT a nonempty research-cancellation qualification
  expect(absorbedWeekOf(result).get(TARGET)).toBe(162);expect(isOperatingStudio(result,TARGET)).toBe(false)
  expect(closedWeekOf(result).has(TARGET)).toBe(false)
  expect(result.studioClosure).toEqual(p.state.studioClosure)
  expect(result.rights.estates).toEqual(p.state.rights.estates)
  expect(record.titleEventIds).toHaveLength(p.subjects.length)
  for(const subject of p.subjects)expect(currentHolder(result,subject,162)).toMatchObject({kind:'holder',holderId:p.player})
  expect(h.identities).toEqual(p.state.hollywood!.identities)
  expect(h.films).toEqual(p.state.hollywood!.films)
  const text=saves.exportCurrentState(result),reloaded=saves.migrateToLive(saves.importSave(text)).state
  expect(saves.exportCurrentState(reloaded)).toBe(text)
  expect(reloaded.rights.absorptions.find(a=>a.id===record.id)).toMatchObject({quotedAtWeek:p.input.quotedAtWeek,quoteAgePolicyVersion:p.input.quoteAgePolicyVersion})
  const resultBefore=saves.stableStringify(result),reloadBefore=saves.stableStringify(reloaded)
  const next=tick(result),replayed=tick(reloaded)
  expect(next.market.tick).toBe(163)
  expect(next.hollywood!.businesses.find(b=>b.studioId===TARGET)).toEqual(target)
  expect(next.corporateCondition.studios.find(r=>r.studioId===TARGET)).toEqual(result.corporateCondition.studios.find(r=>r.studioId===TARGET))
  expect(next.rights.absorptions).toEqual(result.rights.absorptions)
  expect(saves.exportCurrentState(replayed)).toBe(saves.exportCurrentState(next))
  expect(saves.stableStringify(result)).toBe(resultBefore);expect(saves.stableStringify(reloaded)).toBe(reloadBefore)
  originalUnchanged(p)
 })
 it('full current reader refuses independent cent drift and missing employment/title links, and named downgrade preserves its caller',()=>{
  const p=prepared(),{result,record}=complete(p),save=saves.makeSave(result)
  const baseline=saves.stableStringify(save)
  const mutate=(change:(state:GameState)=>void,expected=/absorption|rights|employment|contract/i)=>{
   const envelope=JSON.parse(baseline) as typeof save;change(envelope.state)
   const before=saves.stableStringify(envelope)
   try {expect(()=>saves.validateSaveV49(envelope)).toThrow(expected)}
   finally {expect(saves.stableStringify(envelope)).toBe(before)}
  }
  expect(save.state.rights.absorptions).toHaveLength(1)
  mutate(state=>{state.rights.absorptions.push(null as never)},/^validateSaveV49: rights\.absorptions\[1\] must be an object$/)
  for(const field of ['cashBeforeExits','exitCharges','postExitCash','outlay'] as const)
   mutate(state=>{state.rights.absorptions.find(a=>a.id===record.id)![field]+=0.01})
  mutate(state=>{state.rights.absorptions.find(a=>a.id===record.id)!.contracts.find(c=>c.buyerContractId===null)!.exitCost+=0.01})
  mutate(state=>{state.rights.absorptions.find(a=>a.id===record.id)!.contracts=state.rights.absorptions.find(a=>a.id===record.id)!.contracts.slice(1)})
  mutate(state=>{state.rights.absorptions.find(a=>a.id===record.id)!.titleEventIds=state.rights.absorptions.find(a=>a.id===record.id)!.titleEventIds.slice(1)})
  // Remove BOTH joined authorities, retaining actual genesis/body: ID-bijection alone cannot catch this.
  const omitted=JSON.parse(baseline) as typeof save
  const omittedRecord=omitted.state.rights.absorptions.find(a=>a.id===record.id)!
  expect(omittedRecord.titleEventIds.length).toBeGreaterThan(1)
  const lastId=omittedRecord.titleEventIds.at(-1)!
  const lastTransfer=omitted.state.rights.titleEvents.find(e=>e.id===lastId)!
  expect(lastTransfer).toBeDefined()
  expect(lastTransfer.source).toEqual({kind:'absorption',absorptionId:record.id})
  const retainedGenesis=omitted.state.rights.titleEvents.filter(e=>e.source.kind==='legacy'&&
   saves.stableStringify(e.subject)===saves.stableStringify(lastTransfer.subject))
  expect(retainedGenesis).toHaveLength(1)
  omitted.state.rights.titleEvents=omitted.state.rights.titleEvents.filter(e=>e.id!==lastId)
  omittedRecord.titleEventIds=omittedRecord.titleEventIds.filter(id=>id!==lastId)
  expect(omitted.state.rights.titleEvents.filter(e=>e.source.kind==='absorption'&&e.source.absorptionId===record.id).map(e=>e.id)).toEqual(omittedRecord.titleEventIds)
  expect(omitted.state.rights.titleEvents.find(e=>e.id===retainedGenesis[0]!.id)).toEqual(retainedGenesis[0])
  const omittedBefore=saves.stableStringify(omitted)
  try {expect(()=>saves.validateSaveV49(omitted)).toThrow(/held title dispositions incomplete/)}
  finally {expect(saves.stableStringify(omitted)).toBe(omittedBefore)}
  expect(()=>saves.convertV49ToV48(save)).toThrow(/rights|absorption|downgrade/i)
  expect(saves.stableStringify(save)).toBe(baseline)
  // Actual original48 remains its admitted own-era input; no retagged modern envelope is used as a historical control.
  expect(saves.validateSaveP15B(p.old)).toBe(p.old);originalUnchanged(p)
 })
 it('real current49 publication refusal rolls back the fully admitted clean-target caller after actual joined validation',()=>{
  const p=prepared(),positive=complete(p)
  expect(positive.record.contracts.some(c=>c.buyerContractId!==null)).toBe(true)
  const realMakeSave=saves.makeSave,marker='P16_ABSORPTION_REAL_JOINED_PUBLICATION_REFUSAL'
  let publication=0,inputAdmissions=0
  const spy=vi.spyOn(saves,'makeSave').mockImplementation(state=>{
   // Actual cross-module builder seam; its real lexical full reader runs before the fault.
   const admitted=realMakeSave(state)
   const row=admitted.state.rights.absorptions.find(a=>a.targetId===TARGET)
   if(row!==undefined) {
    publication++
    expect(admitted.state.hollywood!.businesses.find(b=>b.studioId===TARGET)!.account.cash).toBe(0)
    expect(row.titleEventIds.length).toBeGreaterThan(0)
    throw new Error(marker)
   }
   inputAdmissions++;return admitted
  })
  try {
   expect(()=>acquisition.closeAbsorption(p.state,p.input,162)).toThrow(marker)
   expect(inputAdmissions).toBe(1);expect(publication).toBe(1)
  } finally {spy.mockRestore();originalUnchanged(p)}
 })

 it('recorded original preview pair survives real close and reload; missing unknown future and age13 records refuse full readers purely',()=>{
  const p=prepared(),{result,record}=complete(p),save=saves.makeSave(result)
  expect(record).toMatchObject({quotedAtWeek:162,quoteAgePolicyVersion:1})
  const text=saves.exportCurrentState(result),reload=saves.migrateToLive(saves.importSave(text)).state
  expect(reload.rights.absorptions.find(a=>a.id===record.id)).toMatchObject({quotedAtWeek:162,quoteAgePolicyVersion:1})
  const baseline=saves.stableStringify(save)
  const cases=[
   {label:'missing-original-date',change:(a:typeof record)=>{Reflect.deleteProperty(a,'quotedAtWeek')},reason:/absorption.*unknown or missing fields/i},
   {label:'missing-original-version',change:(a:typeof record)=>{Reflect.deleteProperty(a,'quoteAgePolicyVersion')},reason:/absorption.*unknown or missing fields/i},
   {label:'unknown-original-version',change:(a:typeof record)=>{Reflect.set(a,'quoteAgePolicyVersion',99)},reason:/absorption.*unknown quote age policy version/i},
   {label:'future-original-date',change:(a:typeof record)=>{a.quotedAtWeek=a.week+1},reason:/absorption.*recorded acceptance quote age futureQuote/i},
   {label:'age13-original-date',change:(a:typeof record)=>{a.quotedAtWeek=a.week-13},reason:/absorption.*recorded acceptance quote age quoteTooOld/i},
  ]
  for(const item of cases) {
   const mutant=JSON.parse(baseline) as typeof save
   item.change(mutant.state.rights.absorptions.find(a=>a.id===record.id)!)
   const before=saves.stableStringify(mutant)
   try {
    expect(()=>saves.validateSaveV49(mutant),item.label+' strict49').toThrow(item.reason)
    expect(()=>saves.makeSave(mutant.state),item.label+' writer').toThrow(item.reason)
   } finally {expect(saves.stableStringify(mutant)).toBe(before)}
  }
  expect(saves.stableStringify(save)).toBe(baseline);originalUnchanged(p)
 })
 it('carried close refuses missing partial unknown future and age13 preview pairs on a real positive current input without refreshing or mutation',()=>{
  const p=prepared(),positive=complete(p)
  expect(positive.record).toMatchObject({quotedAtWeek:162,quoteAgePolicyVersion:1})
  const cases=[
   {label:'missing-pair',change:(input:typeof p.input)=>{Reflect.deleteProperty(input,'quotedAtWeek');Reflect.deleteProperty(input,'quoteAgePolicyVersion')},reason:/absorption closing refused: absorptionQuoteRequired/},
   {label:'missing-date',change:(input:typeof p.input)=>{Reflect.deleteProperty(input,'quotedAtWeek')},reason:/absorption closing refused: incompleteAbsorptionQuote/},
   {label:'missing-version',change:(input:typeof p.input)=>{Reflect.deleteProperty(input,'quoteAgePolicyVersion')},reason:/absorption closing refused: incompleteAbsorptionQuote/},
   {label:'unknown-version',change:(input:typeof p.input)=>{Reflect.set(input,'quoteAgePolicyVersion',99)},reason:/absorption closing refused: unknownQuoteAgePolicyVersion/},
   {label:'future-date',change:(input:typeof p.input)=>{input.quotedAtWeek=163},reason:/absorption closing refused: futureQuote/},
   {label:'age13-date',change:(input:typeof p.input)=>{input.quotedAtWeek=149},reason:/absorption closing refused: quoteTooOld/},
  ]
  for(const item of cases) {
   const input=structuredClone(p.input);item.change(input)
   const before=saves.stableStringify(input)
   try {expect(()=>acquisition.closeAbsorption(p.state,input,162),item.label).toThrow(item.reason)}
   finally {expect(saves.stableStringify(input)).toBe(before);originalUnchanged(p)}
  }
 })
})
