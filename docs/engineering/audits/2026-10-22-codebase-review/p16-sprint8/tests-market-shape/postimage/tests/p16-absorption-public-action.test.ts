// UNRUN source-grounded clean-target transaction controls. Original48 capture has an explicitly
// disclosed R04 condition/finance constructor; R03 is unchanged. This is not natural campaign proof.
// No STABLE readers, new cash/history/work, clock changes, seed/retention/price fallback or wider timeout.
import { describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import * as saves from '../src/core/save.js'
import * as acquisition from '../src/core/acquisition.js'
import { requestDiligence,disclosureFor,diligenceRefusal } from '../src/core/dueDiligence.js'
import { conditionRecord, outstandingLoan } from '../src/core/corporateConditionLive.js'
import { terminationCost } from '../src/core/employment.js'
import { libraryValuationV1 } from '../src/core/propertyValuation.js'
import { resolveTitles, subjectsHeldBy } from '../src/core/rights.js'
import { applyActions } from '../src/core/actions.js'
import { tick } from '../src/core/tick.js'
import type { Action } from '../src/core/types.js'
import { c2LiveFixture } from './helpers/p14c2a-fixtures.js'
import { caseForTalent, marketEligibility, proposalDraft, submitProposal } from '../src/core/talentMarket.js'
import { rivalWeeklyOperatingCost } from '../src/core/hollywood.js'
import { spendableCash } from '../src/core/rightsFinance.js'
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
function publicAction(p:ReturnType<typeof prepared>,override:Record<string,unknown>={}) {
 const absorption={targetId:p.input.targetId,consideration:p.input.consideration,retention:p.input.retention,disclosureId:p.input.disclosureId,quotedAtWeek:p.input.quotedAtWeek,quoteAgePolicyVersion:p.input.quoteAgePolicyVersion}
 // Hostile transport extras deliberately cross the public runtime boundary; the production type omits buyerId.
 return {kind:'absorbStudio',absorption:{...absorption,...override}} as Action
}
describe('P16 public absorbStudio dispatch on retained original48 R03',()=>{
 it('public action equals the real direct owner with original quote pair, one outlay, no second fee or bonus and byte roundtrip',()=>{
  const p=prepared(),direct=acquisition.closeAbsorption(p.state,p.input,162)
  const result=applyActions(p.state,[publicAction(p)]);originalUnchanged(p)
  expect(JSON.stringify(result)).toBe(JSON.stringify(direct))
  const record=result.rights.absorptions.find(a=>a.targetId===TARGET)!
  expect(record).toMatchObject({buyerId:p.player,week:162,quotedAtWeek:162,quoteAgePolicyVersion:1})
  expect(result.rights.absorptions).toHaveLength(p.state.rights.absorptions.length+1)
  expect(result.ledger.filter(e=>e.kind==='acquisitionOutlay'&&e.note===record.id)).toHaveLength(1)
  expect(result.ledger.filter(e=>e.kind==='dueDiligenceFee')).toEqual(p.state.ledger.filter(e=>e.kind==='dueDiligenceFee'))
  expect(result.ledger.filter(e=>e.kind==='signingBonus')).toEqual(p.state.ledger.filter(e=>e.kind==='signingBonus'))
  const text=saves.exportCurrentState(result),reload=saves.migrateToLive(saves.importSave(text)).state
  expect(saves.exportCurrentState(reload)).toBe(text)
  expect(reload.rights.absorptions.find(a=>a.id===record.id)).toEqual(record)
  originalUnchanged(p)
 })
 it('public dispatch forces the actual player and refuses missing or unheld report and stale invalid carried quote after a real positive',()=>{
  const p=prepared(),positive=applyActions(p.state,[publicAction(p)])
  saves.makeSave(positive)
  const spoof=applyActions(p.state,[publicAction(p,{buyerId:TARGET})])
  expect(JSON.stringify(spoof)).toBe(JSON.stringify(positive))
  expect(spoof.rights.absorptions.find(a=>a.targetId===TARGET)!.buyerId).toBe(p.player)
  // A real held report is never edited or fabricated. Foreign/unheld ID and missing ID must fail on ownership.
  for(const override of [{disclosureId:null},{disclosureId:'disclosure-not-held'},
   {quotedAtWeek:149,quoteAgePolicyVersion:1},{quotedAtWeek:163,quoteAgePolicyVersion:1},
   {quotedAtWeek:162,quoteAgePolicyVersion:99},{quotedAtWeek:undefined},{quoteAgePolicyVersion:undefined}]) {
   try {expect(()=>applyActions(p.state,[publicAction(p,override)])).toThrow(/disclosure|diligence|quote|preview|age|version/i)}
   finally {originalUnchanged(p)}
  }
  // A real retained disclosure ages normally; no date rewrite or fake reader is used.
  // Its stale-at-175 campaign prerequisite belongs to existing F17 controls, not this fixed162 action unit.
 })
 it('real full publication fault rolls back public caller after the transaction owner builds and validates its joined output',()=>{
  const p=prepared(),positive=applyActions(p.state,[publicAction(p)])
  expect(positive.rights.absorptions.find(a=>a.targetId===TARGET)).toBeDefined()
  const real=saves.makeSave,marker='PUBLIC_ABSORPTION_JOINED_PUBLICATION_FAULT';let publication=0
  const spy=vi.spyOn(saves,'makeSave').mockImplementation(state=>{
   const admitted=real(state)
   if(admitted.state.rights.absorptions.some(a=>a.targetId===TARGET)) {publication++;throw new Error(marker)}
   return admitted
  })
  try {expect(()=>applyActions(p.state,[publicAction(p)])).toThrow(marker);expect(publication).toBe(1)}
  finally {spy.mockRestore();originalUnchanged(p)}
 })
 it('actual R01 paid foreign-recipient report never authorizes player absorption or reveals its body to the player',()=>{
  const p=prepared(),positive=applyActions(p.state,[publicAction(p)])
  saves.makeSave(positive)
  const recipient='studio-aca408ec-r01'
  expect(conditionRecord(p.state,recipient)?.condition).toMatchObject({stage:'stable',week:162})
  expect(outstandingLoan(p.state,recipient,162)).toBeUndefined()
  expect(p.state.hollywood!.businesses.find(b=>b.studioId===recipient)!.account.cash).toBe(10336313.262935068)
  const request={recipientId:recipient,target:{kind:'studio' as const,studioId:TARGET},scope:['rights','employment','liabilities'] as ('rights'|'employment'|'liabilities')[]}
  expect(diligenceRefusal(p.state,request,162)).toBeNull()
  const before=JSON.stringify(p.state),foreign=requestDiligence(p.state,request,162)
  expect(JSON.stringify(p.state)).toBe(before);saves.makeSave(foreign.state)
  expect(foreign.record).toMatchObject({week:162,recipientId:recipient,target:{kind:'studio',studioId:TARGET}})
  expect(foreign.record.fee).toBeGreaterThan(0)
  expect(foreign.state.hollywood!.businesses.find(b=>b.studioId===recipient)!.account.cash).toBe(10336313.262935068-foreign.record.fee)
  expect(foreign.state.studio.cash).toBe(p.state.studio.cash)
  expect(disclosureFor(foreign.state,p.player,foreign.record.id)).toBeNull()
  expect(disclosureFor(foreign.state,recipient,foreign.record.id)).toEqual(foreign.record)
  const foreignBefore=JSON.stringify(foreign.state)
  try {expect(()=>applyActions(foreign.state,[publicAction(p,{disclosureId:foreign.record.id})])).toThrow(/absorption: disclosureNotHeld/)}
  finally {expect(JSON.stringify(foreign.state)).toBe(foreignBefore);originalUnchanged(p)}
 })
 it('actual held paid report expires after exactly13 ordinary ticks while a genuine fresh quote pair cannot rescue its old report authority',()=>{
  const p=prepared();let state=p.state
  expect(p.input.disclosureId).toBeTruthy()
  const originalReport=state.rights.diligence.find(d=>d.id===p.input.disclosureId)!
  expect(originalReport).toMatchObject({week:162,staleFromWeek:175,recipientId:p.player})
  for(let week=163;week<=175;week++) {const prior=state,before=JSON.stringify(prior);state=tick(prior);expect(JSON.stringify(prior)).toBe(before);expect(state.market.tick).toBe(week)}
  saves.makeSave(state)
  expect(state.rights.diligence.find(d=>d.id===originalReport.id)).toEqual(originalReport)
  expect(disclosureFor(state,p.player,originalReport.id)).toEqual(originalReport) // Retained history stays readable; transaction freshness expires.
  expect(conditionRecord(state,p.player)?.condition).toMatchObject({stage:'stable',week:175})
  expect(conditionRecord(state,TARGET)?.condition).toMatchObject({stage:'stable',week:175})
  expect(outstandingLoan(state,p.player,175)).toBeUndefined();expect(outstandingLoan(state,TARGET,175)).toBeUndefined()
  expect(acquisition.absorptionProducerRefusal(state,p.input),'fixed175 real target work is a mandatory prerequisite; no suppressed decisions or fallback').toBeNull()
  const stateBefore=JSON.stringify(state),fresh=requestDiligence(state,{recipientId:p.player,target:{kind:'studio',studioId:TARGET},scope:['rights','employment','liabilities']},175)
  expect(JSON.stringify(state)).toBe(stateBefore);saves.makeSave(fresh.state)
  const live=fresh.state.hollywood!.activeEmploymentOrdinals.map(i=>fresh.state.hollywood!.employment[i]!).filter(e=>e.studioId===TARGET&&e.endedWeek===null&&e.terms.startWeek<=175&&175<e.terms.endWeekExclusive)
  expect(live.some(e=>e.contractId===p.keep.contractId)).toBe(true)
  const cash=fresh.state.hollywood!.businesses.find(b=>b.studioId===TARGET)!.account.cash
  const exits=live.filter(e=>e.contractId!==p.keep.contractId).reduce((n,e)=>n+terminationCost(e.terms,175),0)
  const library=libraryValuationV1(fresh.state,TARGET,175)
  expect(library.kind).toBe('available');if(library.kind!=='available')throw new Error('fixed175 library premise absent')
  const input={...p.input,consideration:Math.ceil(acquisition.absorptionAsk(library.total,cash-exits)),disclosureId:fresh.record.id,quotedAtWeek:175}
  const quote=acquisition.quoteAbsorption(fresh.state,input,175)
  expect(quote.kind,'fresh actual quote mandatory before hostile old report reuse').toBe('quote')
  if(quote.kind!=='quote')throw new Error(quote.refusal)
  expect(quote.affordable).toBe(true);expect(quote.quotedAtWeek).toBe(175)
  const draft={targetId:input.targetId,consideration:input.consideration,retention:input.retention,disclosureId:input.disclosureId}
  const action:Action={kind:'absorbStudio',absorption:{...draft,quotedAtWeek:quote.quotedAtWeek,quoteAgePolicyVersion:quote.quoteAgePolicyVersion,disclosureId:originalReport.id}}
  const before=JSON.stringify(fresh.state)
  try {expect(()=>applyActions(fresh.state,[action])).toThrow(/absorption: quoteTooOld/)}
  finally {expect(JSON.stringify(fresh.state)).toBe(before);originalUnchanged(p)}
 })

})

describe('P16 absorption of a genuine current proposal', () => {
 it('withdraws the absorbed rival proposal while preserving the actual player case and competing offer', () => {
  // Record775's unchanged, strictly validated Save33 capture already contains
  // the real player director expiry case and paid proposal. Its original fund()
  // bootstrap remains disclosed in the capture provenance; no new cash/history.
  const initial=c2LiveFixture('genuine-v33-c2-contract-and-case'),initialBefore=saves.stableStringify(initial)
  const target='studio-cf7914ad-r01',talentId='authored-0001',buyer=initial.hollywood!.playerStudioId
  expect(initial.market.tick).toBe(48);expect(initial.studio.cash).toBe(28_981_127)
  expect(caseForTalent(initial,talentId)).toMatchObject({subjectStudioId:buyer,openedWeek:40,decisionWeek:52,status:'proposals_open'})
  const initialCase=initial.talentMarket.cases.find(c=>c.talentId===talentId&&c.closedWeek===null)!
  const competing=initial.talentMarket.proposals.find(p=>p.talentId===talentId&&p.issuerStudioId===buyer)!
  expect(competing).toMatchObject({submittedWeek:44,startWeek:52,termWeeks:52,premiumTier:1.25,promises:['promise-0']})
  expect(initial.promises.filter(p=>p.issuerStudioId===target)).toEqual([])
  const initialTarget=initial.hollywood!.businesses.find(b=>b.studioId===target)!
  expect(initialTarget.account.cash).toBe(19_158_967)
  expect(marketEligibility(initial,talentId).proposers).toContain(target)
  const draft=proposalDraft(initial,target,talentId,52,1,48)
  expect(initialTarget.account.cash-draft.signingBonus)
   .toBeGreaterThanOrEqual(rivalWeeklyOperatingCost(initialTarget,initial.hollywood!,48)*initialTarget.policy.reserveWeeks)
  // Public market producer already used by p14a1-proposals; fixed floor tier,
  // never a copied proposal or early call to the weekly discovery seam.
  const proposed=submitProposal(initial,{talentId,issuerStudioId:target,termWeeks:52,premiumTier:1})
  expect(saves.stableStringify(initial)).toBe(initialBefore)
  const proposal=proposed.talentMarket.proposals.find(p=>p.issuerStudioId===target&&p.talentId===talentId)!
  expect(proposal).toEqual({talentId,issuerStudioId:target,termWeeks:draft.termWeeks,premiumTier:draft.premiumTier,
   startWeek:draft.startWeek,annualSalary:draft.annualSalary,signingBonus:draft.signingBonus,digest:draft.digest,
   submittedWeek:48,promises:[],representation:null})
  expect(proposed.hollywood!.businesses.find(b=>b.studioId===target)!.account).toEqual(initialTarget.account)
  expect(proposed.talentMarket.receipts.slice(initial.talentMarket.receipts.length))
   .toMatchObject([{kind:'proposalSubmitted',week:48,talentId,studioId:target,reasons:[],dropped:[]}])
  saves.makeSave(proposed)
  const proposedBefore=saves.stableStringify(proposed),state=tick(proposed),stateBefore=saves.stableStringify(state)
  expect(state.market.tick).toBe(49);expect(saves.stableStringify(proposed)).toBe(proposedBefore)
  expect(state.talentMarket.proposals.find(p=>p.issuerStudioId===target&&p.talentId===talentId)).toEqual(proposal)
  expect(state.talentMarket.proposals.find(p=>p.issuerStudioId===buyer&&p.talentId===talentId)).toEqual(competing)
  expect(state.talentMarket.cases.find(c=>c.contractId===initialCase.contractId)).toEqual(initialCase)
  // This route proves proposal withdrawal only. It has no target-subject case
  // and does not substitute for the separate case-invalidation acceptance.
  expect(state.talentMarket.cases.filter(c=>c.subjectStudioId===target&&c.closedWeek===null)).toEqual([])
  expect(state.talentMarket.proposals.filter(p=>p.issuerStudioId===target)).toEqual([proposal])
  expect(state.promises.filter(p=>p.issuerStudioId===target)).toEqual([])
  for(const studioId of [buyer,target]) {
   expect(conditionRecord(state,studioId)?.condition).toMatchObject({stage:'stable',week:49})
   expect(outstandingLoan(state,studioId,49)).toBeUndefined()
  }
  saves.makeSave(state)
  const paid=applyActions(state,[{kind:'requestDueDiligence',target:{kind:'studio',studioId:target},scope:['rights','employment','liabilities']}])
  expect(saves.stableStringify(state)).toBe(stateBefore)
  const report=paid.rights.diligence.at(-1)!
  expect(report).toMatchObject({recipientId:buyer,target:{kind:'studio',studioId:target},week:49})
  expect(report.fee).toBeGreaterThan(0);expect(paid.studio.cash).toBe(state.studio.cash-report.fee)
  const source=paid.hollywood!.businesses.find(b=>b.studioId===target)!
  const employees=paid.hollywood!.activeEmploymentOrdinals.map(i=>paid.hollywood!.employment[i]!)
   .filter(e=>e.studioId===target&&e.endedWeek===null&&e.terms.startWeek<=49&&49<e.terms.endWeekExclusive)
  expect(employees).toHaveLength(6)
  const retention={kind:'explicit' as const,contractIds:[]},exits=employees.reduce((sum,e)=>sum+terminationCost(e.terms,49),0)
  const library=libraryValuationV1(paid,target,49);expect(library.kind).toBe('available')
  if(library.kind!=='available')throw new Error('fixed market R01 library premise unavailable')
  const consideration=acquisition.absorptionAsk(library.total,source.account.cash-exits)
  const preview={buyerId:buyer,targetId:target,consideration,retention,disclosureId:report.id}
  const paidBefore=saves.stableStringify(paid),quote=acquisition.quoteAbsorption(paid,preview,49)
  expect(saves.stableStringify(paid)).toBe(paidBefore)
  expect(quote.kind,'actual condition, disclosure and consent; no replacement price or target').toBe('quote')
  if(quote.kind!=='quote')throw new Error(quote.refusal)
  expect(quote.affordable).toBe(true);expect(quote.contracts.filter(c=>c.retained)).toEqual([])
  expect(quote.exitCharges).toBe(exits);expect(quote.postExitCash).toBe(source.account.cash-exits)
  expect(quote.outlay).toBe(consideration-quote.postExitCash)
  expect(quote.reserveAfter).toBeGreaterThan(0)
  expect(spendableCash(paid,buyer)-quote.outlay).toBeGreaterThanOrEqual(quote.reserveAfter)
  expect(quote.productions.every(p=>p.disposition==='cancelRequired')).toBe(true)
  expect(quote.scripts.every(p=>p.disposition==='writeOff')).toBe(true)
  console.info('S8 actual proposal-only premises',JSON.stringify({week:49,target,talentId,digest:proposal.digest,
   consideration,exits,outlay:quote.outlay,reserve:quote.reserveAfter,producerRefusal:acquisition.absorptionProducerRefusal(paid,preview)}))
  const action:Action={kind:'absorbStudio',absorption:{targetId:target,consideration,retention,disclosureId:report.id,
   quotedAtWeek:quote.quotedAtWeek,quoteAgePolicyVersion:quote.quoteAgePolicyVersion}}
  let closed:ReturnType<typeof applyActions>
  try {closed=applyActions(paid,[action])}
  finally {
   expect(saves.stableStringify(paid)).toBe(paidBefore);expect(saves.stableStringify(state)).toBe(stateBefore)
   expect(saves.stableStringify(proposed)).toBe(proposedBefore);expect(saves.stableStringify(initial)).toBe(initialBefore)
  }
  const record=closed.rights.absorptions.find(a=>a.targetId===target)!
  expect(record).toMatchObject({producerVersion:'absorption-obligations/v7',buyerId:buyer,targetId:target,week:49})
  expect(closed.talentMarket.proposals).toEqual(paid.talentMarket.proposals.filter(p=>p.issuerStudioId!==target))
  expect(closed.talentMarket.cases).toEqual(paid.talentMarket.cases)
  expect(closed.talentMarket.receipts.slice(paid.talentMarket.receipts.length)).toEqual([{
   eventId:`talent-market-event-${paid.talentMarket.receipts.length}`,kind:'proposalWithdrawn',week:49,talentId,
   studioId:target,reasons:['the issuing studio was absorbed'],dropped:[],
  }])
  expect(closed.promises).toEqual(paid.promises)
  expect(closed.studio.cash).toBe(paid.studio.cash-quote.outlay)
  expect(closed.ledger.slice(paid.ledger.length)).toEqual([{kind:'acquisitionOutlay',week:49,amount:-quote.outlay,note:record.id}])
  expect(closed.ledger.filter(e=>e.kind==='signingBonus')).toEqual(paid.ledger.filter(e=>e.kind==='signingBonus'))
  const text=saves.exportCurrentState(closed),reload=saves.migrateToLive(saves.importSave(text)).state
  expect(saves.exportCurrentState(reload)).toBe(text)
  expect(reload.talentMarket).toEqual(closed.talentMarket)
  expect(saves.stableStringify(paid)).toBe(paidBefore)
  // Review item3: the genuine positive v7 activates pre-descent authority.
  // These are explicitly invalid JSON clones, never admitted campaign history.
  for(const defect of ['null absorption sibling','null close event'] as const) {
   const hostile=JSON.parse(text)
   if(defect==='null absorption sibling')hostile.state.rights.absorptions.push(null)
   else {
    const owner=hostile.state.rights.absorptions.find((a:{id:string})=>a.id===record.id)
    expect(owner.obligations.closeEvents.length,'actual nonempty native withdrawal event prerequisite').toBeGreaterThan(0)
    owner.obligations.closeEvents[0]=null
   }
   const before=saves.stableStringify(hostile)
   expect(()=>saves.validateSaveV49(hostile),defect).toThrow(/^absorption obligations:/)
   expect(saves.stableStringify(hostile),defect+' caller purity').toBe(before)
  }
 })
})
