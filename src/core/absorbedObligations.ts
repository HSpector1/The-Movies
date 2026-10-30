import { isOpportunityPredicate } from './opportunityPromises.js'
import { terminationCost } from './employment.js'
import { TUNING } from './tuning.js'
import { buyerScriptDevelopment, buyerScriptConcepts } from './continuedScripts.js'
import { buyerOperatedProductions, buyerOperationsForAllWork } from './continuedWork.js'
import type { AbsorptionRecord } from './rights.js'
import type { GameState, ProfessionalPromise, TalentMarketProposal, TalentMarketCaseV36, TalentMarketReceipt } from './types.js'
import { breakPromisesOnTermination, breakPromisesOnCancel, attachedPromiseDigest, proposalDigest, promiseCastSlots, qualifyingTakes } from './promises.js'
import { withdrawProposalAtAbsorption, invalidateCaseAtAbsorption, ABSORPTION_PROPOSAL_REASON, ABSORPTION_CASE_REASON, ABSORPTION_CASE_DROP_REASON } from './talentMarket.js'

export type AbsorptionPromiseDisposition =
 | {kind:'unboundHistory';original:ProfessionalPromise}
 | {kind:'continued';original:ProfessionalPromise;sourceContractId:string;buyerContractId:string}
 | {kind:'exit';original:ProfessionalPromise;sourceContractId:string;outcomeEventId:string}
export type AbsorptionCloseEvent =
 | {kind:'exitOutcome';promiseId:string;eventId:string}
 | {kind:'cancelOutcome';promiseId:string;productionId:string;eventId:string}
 | {kind:'withdrawal';talentId:string;issuerStudioId:string;eventId:string}
 | {kind:'caseInvalidation';talentId:string;subjectStudioId:string;contractId:string;openedWeek:number;eventId:string}
export type AbsorptionObligations = {
 promiseCountBeforeClose:number;firstTakeCountBeforeClose:number;marketReceiptCountBeforeClose:number
 promises:AbsorptionPromiseDisposition[]
 withdrawals:{original:TalentMarketProposal;eventId:string}[]
 cases:{original:TalentMarketCaseV36;droppedProposals:TalentMarketProposal[];eventId:string}[]
 closeEvents:AbsorptionCloseEvent[]
}
export type AbsorbedPromiseAssignment = Readonly<{
 absorptionId:string;week:number;sourceStudioId:string;buyerStudioId:string
 sourceContractId:string;buyerContractId:string;original:ProfessionalPromise
 firstTakeCountBeforeClose:number
 projectIds:ReadonlyMap<string,string>
 /** Native-only paid pictures keep their source-local subject ID in receipts. */
 projectProductionIds?:ReadonlyMap<string,string>
}>
export type AbsorptionWithdrawalAuthority=ReadonlyMap<string,Readonly<TalentMarketReceipt>>
export type AbsorbedPromiseAuthority = Readonly<{
 /** Exact immutable snapshots attested by this invocation's complete v7 proof. */
 withdrawalEvents:AbsorptionWithdrawalAuthority
 assignments:ReadonlyMap<string,AbsorbedPromiseAssignment>
}>
function fail(why:string):never{throw new Error(`absorption obligations: ${why}`)}
const record=(value:unknown):value is Record<string,unknown>=>value!==null&&typeof value==='object'&&!Array.isArray(value)
const exact=(value:object,keys:readonly string[])=>Object.keys(value).sort().join()===([...keys].sort().join())
function same(a:unknown,b:unknown):boolean{
 if(a===b)return true
 if(a===null||b===null||typeof a!=='object'||typeof b!=='object')return false
 if(Array.isArray(a)||Array.isArray(b))return Array.isArray(a)&&Array.isArray(b)&&a.length===b.length&&a.every((x,i)=>same(x,b[i]))
 const x=a as Record<string,unknown>,y=b as Record<string,unknown>,keys=Object.keys(x).sort()
 return same(keys,Object.keys(y).sort())&&keys.every(k=>same(x[k],y[k]))
}
const mutablePromiseKeys=new Set(['progress','evidenceRefs','outcome','outcomeWeek','outcomeCause','outcomeEventId','supersededByPromiseId'])
function immutablePromise(p:ProfessionalPromise):Record<string,unknown>{return Object.fromEntries(Object.entries(p).filter(([key])=>!mutablePromiseKeys.has(key)))}

/** Original issuer/contract are history. Only this proven current employer owns
 * future work selection; outcome and trust attribution never use this alias. */
export function operatingPromiseIssuer(state:GameState,promise:ProfessionalPromise,week=state.market.tick,authority=absorbedPromiseAuthority(state)):string{
 const assigned=authority?.assignments.get(promise.promiseId)
 return assigned&&week>=assigned.week?assigned.buyerStudioId:promise.issuerStudioId
}
export function promiseTakeIssuerMatches(promise:ProfessionalPromise,take:GameState['firstTakes'][number],ordinal:number,authority?:AbsorbedPromiseAuthority):boolean{
 const a=authority?.assignments.get(promise.promiseId)
 return a===undefined?take.studioId===promise.issuerStudioId:ordinal<a.firstTakeCountBeforeClose
  ?take.studioId===a.sourceStudioId&&take.week<=a.week
  :take.studioId===a.buyerStudioId&&take.week>a.week
}

/** Snapshot terms are authored by the actual close, not reconstructed from old
 * proposalSubmitted receipts (which never stored their terms). */
function validateProposalSnapshot(state:GameState,p:TalentMarketProposal,C:number,promiseLimit:number):void{
 if(!record(p)||!exact(p,['talentId','issuerStudioId','termWeeks','premiumTier','startWeek','annualSalary','signingBonus','submittedWeek','digest','promises','representation'])
  ||typeof p.talentId!=='string'||p.talentId.length===0||typeof p.issuerStudioId!=='string'||p.issuerStudioId.length===0||!TUNING.CONTRACT_TERM_OPTIONS.includes(p.termWeeks)||!TUNING.MARKET_PREMIUM_TIERS.includes(p.premiumTier)
  ||!Number.isSafeInteger(p.startWeek)||p.startWeek<C||!Number.isSafeInteger(p.submittedWeek)||p.submittedWeek>C
  ||!Number.isSafeInteger(p.annualSalary)||p.annualSalary<0||!Number.isSafeInteger(p.signingBonus)||p.signingBonus!==Math.round(p.annualSalary*TUNING.CONTRACT_SIGNING_BONUS_FRACTION)
  ||p.representation!==null||!Array.isArray(p.promises)||p.promises.length>1)fail('removed proposal snapshot shape differs')
 const roots=state.promises.slice(0,promiseLimit)
 for(const id of p.promises){const promise=roots.find(row=>row.promiseId===id)
  if(!promise||promise.issuerStudioId!==p.issuerStudioId||promise.beneficiaryPersonId!==p.talentId||promise.contractId!==null)fail('removed proposal has no original attached unbound promise')
 }
 if(p.digest!==proposalDigest(p.talentId,p.issuerStudioId,p.termWeeks,p.startWeek,p.premiumTier,attachedPromiseDigest({promises:roots},p.promises)))fail('removed proposal material digest differs')
 const submitted=state.talentMarket.receipts.some(r=>r.kind==='proposalSubmitted'&&r.week===p.submittedWeek&&r.talentId===p.talentId&&r.studioId===p.issuerStudioId)
 if(!submitted)fail('removed proposal lacks a submission receipt')
}

/** The shared market root also owns native promise outcomes. A close consumes
 * exactly one contiguous segment; no same-week pre-close outcome can stand in
 * for one of these events. Full source/contract proof precedes this check. */
function validateCloseEventSegment(state:GameState,a:AbsorptionRecord,o:AbsorptionObligations):void{
 if(o.closeEvents.some(ref=>!record(ref)))fail('close event must be an object')
 const start=o.marketReceiptCountBeforeClose
 if(!Number.isSafeInteger(start)||start<0||start+o.closeEvents.length>state.talentMarket.receipts.length)fail('close receipt prefix differs')
 const used=new Set<string>()
 let phase=0,lastCancellation=-1,lastCancelledPromise=-1
 const expectedExits=a.contracts.filter(link=>link.buyerContractId===null).flatMap(link=>o.promises.filter(d=>d.kind==='exit'&&d.sourceContractId===link.sourceContractId).map(d=>d.original.promiseId))
 const actualExits=o.closeEvents.filter((ref):ref is Extract<AbsorptionCloseEvent,{kind:'exitOutcome'}>=>ref.kind==='exitOutcome').map(ref=>ref.promiseId)
 if(!same(expectedExits,actualExits))fail('native exit settlement order differs')
 if(!same(o.closeEvents.filter(ref=>ref.kind==='withdrawal').map(ref=>ref.eventId),o.withdrawals.map(row=>row.eventId))
  ||!same(o.closeEvents.filter(ref=>ref.kind==='caseInvalidation').map(ref=>ref.eventId),o.cases.map(row=>row.eventId)))fail('market disposition order differs')
 for(let i=0;i<o.closeEvents.length;i++){
  const ref=o.closeEvents[i]!,receipt=state.talentMarket.receipts[start+i]!
  if(!record(ref)||typeof ref.eventId!=='string'||used.has(ref.eventId)||receipt.eventId!==ref.eventId||receipt.week!==a.week)fail('close event segment differs')
  used.add(ref.eventId)
  const nextPhase=ref.kind==='exitOutcome'?0:ref.kind==='cancelOutcome'?1:ref.kind==='withdrawal'?2:ref.kind==='caseInvalidation'?3:-1
  if(nextPhase<phase||nextPhase<0)fail('close event order differs')
  phase=nextPhase
  if(ref.kind==='exitOutcome'||ref.kind==='cancelOutcome'){
   if(!exact(ref,ref.kind==='cancelOutcome'?['kind','promiseId','productionId','eventId']:['kind','promiseId','eventId']))fail('close outcome reference shape differs')
   const disposition=o.promises.find(row=>row.original.promiseId===ref.promiseId)
   const current=state.promises.find(row=>row.promiseId===ref.promiseId)
   const requiredKind=ref.kind==='exitOutcome'?'exit':'continued'
   const reason=ref.kind==='exitOutcome'?'a promise to this person was broken by an early termination':'a promise to this person was broken by a cancelled picture'
   if(!disposition||disposition.kind!==requiredKind||!current||current.outcome!=='BROKEN'||current.outcomeWeek!==a.week||current.outcomeEventId!==ref.eventId
    ||receipt.kind!=='promiseOutcome'||receipt.talentId!==disposition.original.beneficiaryPersonId||receipt.studioId!==a.targetId
    ||!same(receipt.reasons,[reason])||!same(receipt.dropped,[]))fail('close outcome differs from native settlement')
   const cause=ref.kind==='exitOutcome'?'the studio terminated this contract early, ending the window':disposition.original.family==='DIRECTING_COUNT'
    ?'the studio cancelled the picture this person was directing, and no path was left':'the studio cancelled the picture this person was cast in, and no path was left'
   if(!same(current,{...disposition.original,outcome:'BROKEN',outcomeWeek:a.week,outcomeCause:cause,outcomeEventId:ref.eventId}))fail('native close settlement changed prior promise work')
   if(disposition.kind==='exit'&&disposition.outcomeEventId!==ref.eventId)fail('exit outcome reference differs')
   if(ref.kind==='cancelOutcome'){
    const ordinal=a.stoppedProductions.findIndex(p=>p.productionId===ref.productionId),promiseOrdinal=o.promises.indexOf(disposition)
    if(ordinal<lastCancellation||ordinal===lastCancellation&&promiseOrdinal<=lastCancelledPromise)fail('native cancellation settlement order differs')
    lastCancellation=ordinal;lastCancelledPromise=promiseOrdinal
    const source=state.hollywood!.businesses.find(b=>b.studioId===a.targetId)
    if(!source||!Array.isArray(source.productions)||source.productions.some(p=>!record(p)||!record(p.cast)))fail('cancelled source pictures shape differs')
    const picture=source.productions.find(p=>p.id===ref.productionId)
    if(!picture||!a.stoppedProductions.some(p=>p.productionId===ref.productionId)
     ||!(disposition.original.family==='DIRECTING_COUNT'?picture.directorId===disposition.original.beneficiaryPersonId
      :['lead','antagonist','support'].some(slot=>picture.cast[slot as keyof typeof picture.cast]===disposition.original.beneficiaryPersonId)))fail('cancel outcome lacks actual stopped qualifying seat')
   }
  }else if(ref.kind==='withdrawal'){
   if(!exact(ref,['kind','talentId','issuerStudioId','eventId']))fail('withdrawal reference shape differs')
   const item=o.withdrawals.find(row=>row.eventId===ref.eventId)
   if(!item||item.original.talentId!==ref.talentId||item.original.issuerStudioId!==ref.issuerStudioId||ref.issuerStudioId!==a.targetId
    ||receipt.kind!=='proposalWithdrawn'||receipt.talentId!==ref.talentId||receipt.studioId!==ref.issuerStudioId
    ||!same(receipt.reasons,[ABSORPTION_PROPOSAL_REASON])||!same(receipt.dropped,[]))fail('close withdrawal differs')
  }else{
   if(!exact(ref,['kind','talentId','subjectStudioId','contractId','openedWeek','eventId']))fail('case reference shape differs')
   const item=o.cases.find(row=>row.eventId===ref.eventId)
   if(!item||item.original.talentId!==ref.talentId||item.original.subjectStudioId!==ref.subjectStudioId||ref.subjectStudioId!==a.targetId
    ||item.original.contractId!==ref.contractId||item.original.openedWeek!==ref.openedWeek
    ||receipt.kind!=='invalidated'||receipt.talentId!==ref.talentId||receipt.studioId!==null
    ||!same(receipt.reasons,[ABSORPTION_CASE_DROP_REASON])||!same(receipt.dropped,[]))fail('close case invalidation differs')
  }
 }
 if(o.withdrawals.some(row=>!used.has(row.eventId))||o.cases.some(row=>!used.has(row.eventId))
  ||o.promises.some(row=>row.kind==='exit'&&!used.has(row.outcomeEventId)))fail('close dispositions omit their native event')
 const end=start+o.closeEvents.length
 if(state.talentMarket.receipts.some((receipt,index)=>(index<start||index>=end)&&receipt.week===a.week
  &&((receipt.kind==='proposalWithdrawn'&&receipt.studioId===a.targetId&&same(receipt.reasons,[ABSORPTION_PROPOSAL_REASON]))
   ||(receipt.kind==='invalidated'&&state.talentMarket.cases.some(kase=>kase.subjectStudioId===a.targetId&&kase.closedWeek===a.week&&kase.reason===ABSORPTION_CASE_REASON&&kase.talentId===receipt.talentId)&&same(receipt.reasons,[ABSORPTION_CASE_DROP_REASON])))))fail('unexplained absorption market event')
}

const promiseKeys=['promiseId','family','version','issuerStudioId','beneficiaryPersonId','predicate','windowStartWeek','dueWeekExclusive','feasibilityReceipt','progress','evidenceRefs','outcome','outcomeWeek','outcomeCause','outcomeEventId','contractId','supersededByPromiseId'] as const
function openOriginal(value:unknown,C:number):asserts value is ProfessionalPromise{
 if(!record(value)||!exact(value,promiseKeys)||typeof value.promiseId!=='string'||typeof value.issuerStudioId!=='string'||typeof value.beneficiaryPersonId!=='string'
  ||typeof value.family!=='string'||!Number.isSafeInteger(value.version)||Number(value.version)<1
  ||!Number.isSafeInteger(value.windowStartWeek)||Number(value.windowStartWeek)>C||!Number.isSafeInteger(value.dueWeekExclusive)||Number(value.dueWeekExclusive)<=Number(value.windowStartWeek)
  ||!record(value.predicate)||!Number.isSafeInteger(value.predicate.count)||Number(value.predicate.count)<1
  ||!record(value.feasibilityReceipt)||typeof value.feasibilityReceipt.inputsDigest!=='string'
  ||!Number.isSafeInteger(value.progress)||Number(value.progress)<0||!Array.isArray(value.evidenceRefs)||value.evidenceRefs.some(id=>typeof id!=='string')
  ||value.outcome!==null||value.outcomeWeek!==null||value.outcomeCause!==null||value.outcomeEventId!==null||value.supersededByPromiseId!==null
  ||(value.contractId!==null&&typeof value.contractId!=='string'))fail('original open promise snapshot shape differs')
}

/** No v7 means no new traversal, authority, or changed frozen-reader order.
 * This owner proves only the source/employment/receipt joins required BEFORE
 * frozen promise descent. Native promise, absorption and current49 validators
 * remain mandatory after descent; this does not validate a whole save. */
export function absorbedPromiseAuthority(input:unknown):AbsorbedPromiseAuthority|undefined{
 if(!record(input)||!record(input.rights)||!Array.isArray(input.rights.absorptions))return undefined
 if(!input.rights.absorptions.some(a=>record(a)&&(a.producerVersion==='absorption-obligations/v7'||a.producerVersion==='absorption-rival-obligations/v9')))return undefined
 if(input.rights.absorptions.some(a=>!record(a)))fail('consumed absorption row must be an object')
 if(!record(input.market)||!Number.isSafeInteger(input.market.tick)||!Array.isArray(input.promises)||!Array.isArray(input.firstTakes)
  ||!record(input.talentMarket)||!Array.isArray(input.talentMarket.receipts)||!Array.isArray(input.talentMarket.proposals)||!Array.isArray(input.talentMarket.cases)
  ||!record(input.hollywood)||typeof input.hollywood.playerStudioId!=='string'||!Array.isArray(input.hollywood.employment)||!Array.isArray(input.hollywood.receipts)||!Array.isArray(input.hollywood.businesses)
  ||!record(input.firstTakeSubjects)||!Array.isArray(input.firstTakeSubjects.facts))fail('consumed obligation roots are missing')
 const state=input as unknown as GameState,h=state.hollywood!,assignments=new Map<string,AbsorbedPromiseAssignment>(),withdrawalEvents=new Map<string,Readonly<TalentMarketReceipt>>()
 const receipts=state.talentMarket.receipts
 if(state.firstTakes.some(t=>!record(t)||!Number.isSafeInteger(t.week)||typeof t.eventId!=='string'||!record(t.cast))
  ||state.firstTakeSubjects.facts.some(f=>!record(f)))fail('consumed first take shape differs')
 if(receipts.some(r=>!record(r)||typeof r.eventId!=='string'||!Array.isArray(r.reasons)||!Array.isArray(r.dropped)))fail('consumed market receipt shape differs')
 if(state.promises.some(p=>!record(p)||typeof p.promiseId!=='string'||typeof p.issuerStudioId!=='string'||typeof p.family!=='string'||!record(p.predicate)||!Number.isSafeInteger(p.predicate.count)))fail('consumed promise root shape differs')
 if(new Set(state.promises.map(p=>p.promiseId)).size!==state.promises.length||new Set(receipts.map(r=>r.eventId)).size!==receipts.length)fail('consumed promise or event identity is duplicated')
 if(h.businesses.some(b=>!record(b)))fail('consumed source business shape differs')
 if(h.employment.some(e=>!record(e)||typeof e.contractId!=='string'||!record(e.terms)||!Number.isSafeInteger(e.terms.startWeek)||!Number.isSafeInteger(e.terms.endWeekExclusive)))fail('consumed employment shape differs')
 if(state.talentMarket.cases.some(c=>!record(c))||state.talentMarket.proposals.some(p=>!record(p)))fail('consumed market subjects shape differs')
 if(h.receipts.some(r=>!record(r)))fail('consumed industry receipt shape differs')
 for(const a of state.rights.absorptions){
  if((a.producerVersion!=='absorption-obligations/v7'&&a.producerVersion!=='absorption-rival-obligations/v9'))continue
  if(typeof a.id!=='string'||!Number.isSafeInteger(a.week)||a.week<0||a.week>state.market.tick||(a.producerVersion==='absorption-obligations/v7'?a.buyerId!==h.playerStudioId:a.buyerId===h.playerStudioId||!h.businesses.some(b=>b.studioId===a.buyerId))||typeof a.targetId!=='string'||a.buyerId===a.targetId
   ||!Array.isArray(a.contracts)||a.contracts.some(link=>!record(link)||typeof link.sourceContractId!=='string'||typeof link.talentId!=='string'||(link.buyerContractId!==null&&typeof link.buyerContractId!=='string'))
   ||!Array.isArray(a.stoppedProductions)||a.stoppedProductions.some(p=>!record(p)||typeof p.productionId!=='string')
   ||!Array.isArray(a.stoppedScripts)||!Array.isArray(a.continuedScripts)||!Array.isArray(a.scriptCompletions)||!Array.isArray(a.scriptDecisions)||!record(a.obligations))fail('obligation absorption identity differs')
  const o=a.obligations
  if(!exact(o,['promiseCountBeforeClose','firstTakeCountBeforeClose','marketReceiptCountBeforeClose','promises','withdrawals','cases','closeEvents'])
   ||!Number.isSafeInteger(o.promiseCountBeforeClose)||o.promiseCountBeforeClose<0||o.promiseCountBeforeClose>state.promises.length
   ||!Number.isSafeInteger(o.firstTakeCountBeforeClose)||o.firstTakeCountBeforeClose<0||o.firstTakeCountBeforeClose>state.firstTakes.length
   ||!Number.isSafeInteger(o.marketReceiptCountBeforeClose)||o.marketReceiptCountBeforeClose<0||o.marketReceiptCountBeforeClose>receipts.length
   ||!Array.isArray(o.promises)||!Array.isArray(o.withdrawals)||!Array.isArray(o.cases)||!Array.isArray(o.closeEvents)
   ||o.promises.length+o.withdrawals.length+o.cases.length===0)fail('obligation record shape differs')
  if(state.firstTakes.some((t,i)=>i<o.firstTakeCountBeforeClose?t.week>a.week:t.week<=a.week))fail('close first take prefix differs')
  const prefix=state.promises.slice(0,o.promiseCountBeforeClose),seen=new Set<string>()
  let lastOriginalIndex=-1
  for(const d of o.promises){
   if(!record(d)||!['unboundHistory','continued','exit'].includes(d.kind)||!exact(d,d.kind==='unboundHistory'?['kind','original']:d.kind==='continued'?['kind','original','sourceContractId','buyerContractId']:['kind','original','sourceContractId','outcomeEventId']))fail('promise disposition shape differs')
   openOriginal(d.original,a.week)
   const original=d.original,index=prefix.findIndex(p=>p.promiseId===original.promiseId),current=prefix[index]
   if(index<=lastOriginalIndex||seen.has(original.promiseId)||original.issuerStudioId!==a.targetId||!same(immutablePromise(original),immutablePromise(current!)))fail('promise disposition original identity differs')
   lastOriginalIndex=index
   seen.add(original.promiseId)
   if(d.kind==='unboundHistory'){
    if(original.contractId!==null||!same(current,original))fail('unbound history was changed')
    continue
   }
   const originalTakes=qualifyingTakes({firstTakes:state.firstTakes.slice(0,o.firstTakeCountBeforeClose),firstTakeSubjects:state.firstTakeSubjects},original)
   if(original.progress!==Math.min(original.predicate.count,originalTakes.length)||original.evidenceRefs.some(id=>!originalTakes.some(t=>t.eventId===id)))fail('original promise progress differs from pre-close takes')
   if(original.contractId!==d.sourceContractId||typeof d.sourceContractId!=='string')fail('promise source contract differs')
   const links=a.contracts.filter(link=>record(link)&&link.sourceContractId===d.sourceContractId&&link.talentId===original.beneficiaryPersonId)
   const sources=h.employment.filter(e=>e.contractId===d.sourceContractId)
   if(links.length!==1||sources.length!==1)fail('promise source employment is not unique')
   const link=links[0]!,source=sources[0]!
   if(source.studioId!==a.targetId||source.terms.talentId!==original.beneficiaryPersonId||source.endedWeek!==a.week
    ||source.terms.startWeek>a.week||source.terms.endWeekExclusive<=a.week||original.dueWeekExclusive>source.terms.endWeekExclusive)fail('promise source employment interval differs')
   const sourceEvents=h.receipts.filter(r=>r.kind==='employment'&&r.week===a.week&&r.studioId===a.targetId&&r.contractId===d.sourceContractId&&r.talentId===original.beneficiaryPersonId
    &&r.fromStudioId===a.targetId&&r.toStudioId===null&&r.reason===(d.kind==='exit'?'absorptionExit':'absorptionContinuation'))
   if(sourceEvents.length!==1)fail('promise source employment event differs')
   if(d.kind==='exit'){
    if(link.buyerContractId!==null||typeof d.outcomeEventId!=='string')fail('exit disposition has continued employment')
    continue
   }
   if(typeof d.buyerContractId!=='string'||link.buyerContractId!==d.buyerContractId)fail('promise buyer contract link differs')
   const buyers=h.employment.filter(e=>e.contractId===d.buyerContractId)
   if(buyers.length!==1)fail('promise buyer employment is not unique')
   const buyer=buyers[0]!,expected={...source.terms,startWeek:a.week,termWeeks:source.terms.endWeekExclusive-a.week}
   if(buyer.studioId!==a.buyerId||buyer.reason!=='absorptionContinuation'||!same(buyer.terms,expected)
    ||(buyer.endedWeek!==null&&buyer.endedWeek<a.week))fail('promise buyer bargain differs')
   const buyerEvents=h.receipts.filter(r=>r.kind==='employment'&&r.week===a.week&&r.studioId===a.buyerId&&r.contractId===d.buyerContractId&&r.talentId===original.beneficiaryPersonId
    &&r.fromStudioId===a.targetId&&r.toStudioId===a.buyerId&&r.reason==='absorptionContinuation')
   if(buyerEvents.length!==1||assignments.has(original.promiseId))fail('promise buyer employment event differs')
   assignments.set(original.promiseId,{absorptionId:a.id,week:a.week,sourceStudioId:a.targetId,buyerStudioId:a.buyerId,
    sourceContractId:d.sourceContractId,buyerContractId:d.buyerContractId,original,firstTakeCountBeforeClose:o.firstTakeCountBeforeClose,projectIds:closingProjectIds(state,a),...(a.producerVersion==='absorption-rival-obligations/v9'?{projectProductionIds:new Map(a.continuedProductions.map(row=>[row.scriptProjectId,row.productionId]))}:{})})
  }
  // A root already terminal before the receipt prefix, or already superseded
  // before the promise prefix, was not open at close and cannot be re-broken.
  for(const current of prefix){
   if(current.issuerStudioId!==a.targetId)continue
   const outcomeIndex=current.outcomeEventId===null?-1:receipts.findIndex(r=>r.eventId===current.outcomeEventId)
   const supersededBefore=current.supersededByPromiseId!==null&&prefix.some(p=>p.promiseId===current.supersededByPromiseId)
   const openAtClose=!supersededBefore&&(current.outcome===null||(outcomeIndex>=o.marketReceiptCountBeforeClose&&outcomeIndex>=0))
   if(openAtClose&&!seen.has(current.promiseId))fail('open source promise omitted at close')
   if(!openAtClose&&seen.has(current.promiseId))fail('already terminal promise included at close')
  }
  for(const row of [...o.withdrawals,...o.cases])if(!record(row)||typeof row.eventId!=='string')fail('market disposition shape differs')
  const removedProposalIdentities=new Set<string>()
  const submissionBeforeClose=(p:TalentMarketProposal):number=>{
   const identity=JSON.stringify([p.talentId,p.issuerStudioId])
   if(removedProposalIdentities.has(identity))fail('removed proposal identity is duplicated across close dispositions')
   removedProposalIdentities.add(identity)
   let submission=-1
   receipts.slice(0,o.marketReceiptCountBeforeClose).forEach((r,i)=>{if(r.kind==='proposalSubmitted'&&r.talentId===p.talentId&&r.studioId===p.issuerStudioId)submission=i})
   if(submission<0||receipts[submission]!.week!==p.submittedWeek)fail('removed proposal lacks its latest pre-close submission')
   return submission
  }
  let priorSubmission=-1
  for(const row of o.withdrawals){if(!exact(row,['original','eventId']))fail('withdrawal snapshot shape differs');validateProposalSnapshot(state,row.original,a.week,o.promiseCountBeforeClose)
   if(row.original.issuerStudioId!==a.targetId)fail('withdrawal issuer differs')
   const submission=submissionBeforeClose(row.original)
   if(submission<=priorSubmission)fail('withdrawal source order differs')
   priorSubmission=submission
  }
  let priorCase=-1
  for(const row of o.cases){if(!exact(row,['original','droppedProposals','eventId'])||!record(row.original)||!Array.isArray(row.droppedProposals)
    ||row.original.subjectStudioId!==a.targetId||row.original.outcome!==null||row.original.closedWeek!==null||row.original.reason!==null)fail('case snapshot shape differs')
   let priorDroppedSubmission=-1
   for(const p of row.droppedProposals){
    validateProposalSnapshot(state,p,a.week,o.promiseCountBeforeClose)
    if(p.talentId!==row.original.talentId||p.issuerStudioId===a.targetId)fail('case dropped proposal attribution differs')
    const submission=submissionBeforeClose(p)
    if(submission<=priorDroppedSubmission)fail('case dropped proposal source order differs')
    priorDroppedSubmission=submission
   }
   const matches=state.talentMarket.cases.filter(k=>k.talentId===row.original.talentId&&k.subjectStudioId===row.original.subjectStudioId&&k.contractId===row.original.contractId&&k.openedWeek===row.original.openedWeek)
   const ordinal=matches.length===1?state.talentMarket.cases.indexOf(matches[0]!):-1
   if(ordinal<=priorCase)fail('case source order differs')
   priorCase=ordinal
   if(matches.length!==1||!same({...matches[0],outcome:null,closedWeek:null,reason:null},row.original)||matches[0]!.outcome!=='invalidated'||matches[0]!.closedWeek!==a.week||matches[0]!.reason!==ABSORPTION_CASE_REASON)fail('case terminal join differs')
  }
  // The persisted native case root, not the supplied disposition list, owns
  // completeness. Reset only terminal fields to join each exact original case.
  const nativeCases=state.talentMarket.cases.filter(kase=>kase.subjectStudioId===a.targetId&&kase.outcome==='invalidated'&&kase.closedWeek===a.week&&kase.reason===ABSORPTION_CASE_REASON)
  if(!same(nativeCases.map(kase=>({...kase,outcome:null,closedWeek:null,reason:null})),o.cases.map(row=>row.original)))fail('native absorption case disposition bijection differs')
  if(new Set(o.withdrawals.map(row=>row.original.talentId)).size!==o.withdrawals.length
   ||new Set(o.cases.map(row=>row.original.contractId)).size!==o.cases.length
   ||state.talentMarket.proposals.some(p=>p.issuerStudioId===a.targetId)
   ||state.talentMarket.cases.some(c=>c.subjectStudioId===a.targetId&&c.outcome===null))fail('absorption leaves an open original market subject')
  validateCloseEventSegment(state,a,o)
  for(const row of o.withdrawals){
   const receipt=receipts.find(r=>r.eventId===row.eventId)
   if(!receipt||receipt.kind!=='proposalWithdrawn'||withdrawalEvents.has(receipt.eventId))fail('validated absorption withdrawal event is not unique')
   withdrawalEvents.set(receipt.eventId,structuredClone(receipt))
  }
 }
 // Typed forward waiver chains inherit only the same original employment duty.
 // This is a narrow pre-descent join; native full waiver validators still run.
 const indices=new Map(state.promises.map((p,i)=>[p.promiseId,i] as const)),incoming=new Set<string>()
 for(const [id,assignment] of assignments){
  const predecessor=state.promises[indices.get(id)!]!,successorId=predecessor.supersededByPromiseId
  if(successorId===null)continue
  const index=indices.get(successorId),successor=index===undefined?undefined:state.promises[index]
  if(!successor||(index??-1)<=indices.get(id)!||incoming.has(successorId)||predecessor.outcome!=='WAIVED'||predecessor.outcomeWeek===null
   ||!record(successor.predicate)||!record(successor.feasibilityReceipt)||successor.contractId!==predecessor.contractId
   ||successor.issuerStudioId!==predecessor.issuerStudioId||successor.beneficiaryPersonId!==predecessor.beneficiaryPersonId
   ||successor.feasibilityReceipt.week!==predecessor.outcomeWeek||successor.windowStartWeek<=predecessor.outcomeWeek
   ||successor.feasibilityReceipt.classification!=='REASONABLY_ACHIEVABLE'||successor.predicate.count<predecessor.predicate.count-predecessor.progress
   ||(predecessor.family==='DIRECTING_COUNT')!==(successor.family==='DIRECTING_COUNT')
   ||!promiseCastSlots(successor).every(slot=>promiseCastSlots(predecessor).includes(slot)))fail('continued promise successor duty differs')
  const old=predecessor.predicate,fresh=successor.predicate
  if(isOpportunityPredicate(old)&&old.kind==='projectOpportunity'){
   const canonical=(value:string)=>assignment.projectIds.get(value)??value
   if(!isOpportunityPredicate(fresh)||fresh.kind!=='projectOpportunity'||canonical(fresh.scriptProjectId)!==canonical(old.scriptProjectId))fail('continued promise successor changes named project')
  }else if(isOpportunityPredicate(old)&&old.kind==='genreOpportunity'){
   if(!isOpportunityPredicate(fresh)||(fresh.kind==='genreOpportunity'?fresh.genre!==old.genre:fresh.kind!=='projectOpportunity'||assignedProjectGenre(state,assignment,fresh.scriptProjectId)!==old.genre))fail('continued promise successor weakens genre')
  }
  incoming.add(successorId)
  if(assignments.has(successorId))fail('continued promise successor has two owners')
  assignments.set(successorId,assignment)
 }
 for(const a of state.rights.absorptions){
  if((a.producerVersion!=='absorption-obligations/v7'&&a.producerVersion!=='absorption-rival-obligations/v9'))continue
  if(state.promises.slice(a.obligations.promiseCountBeforeClose).some(p=>p.issuerStudioId===a.targetId&&!assignments.has(p.promiseId)))fail('post-close source promise has no actual typed successor duty')
 }
 return {assignments,withdrawalEvents}
}

/** Read-only calculator view. Stored roots, issuer history and producer inputs
 * remain untouched. This view must never be passed to a producer or save writer. */
export function operationalPromiseView(state:GameState,authority:AbsorbedPromiseAuthority|undefined):GameState{
 if(!authority||authority.assignments.size===0)return state
 const productions=buyerOperatedProductions(state),development=buyerScriptDevelopment(state),concepts=buyerScriptConcepts(state)
 const active=new Set(productions.map(p=>p.id)),projects=[...development.projects]
 for(const a of state.rights.absorptions){
  if(a.buyerId!==state.hollywood?.playerStudioId)continue
  const source=state.hollywood.businesses.find(b=>b.studioId===a.targetId)
  for(const row of a.continuedProductions){
   if(!active.has(row.productionId)||projects.some(p=>p.id===row.scriptProjectId))continue
   const project=source?.development.projects.find(p=>p.id===row.scriptProjectId&&p.productionId===row.productionId)
   if(!project||project.conceptId!==row.originalProduction.conceptId)fail('operational promise project lacks its actual continued film')
   projects.push(project)
   const concept=state.hollywood.concepts.find(c=>c.id===project.conceptId)
   if(!concept)fail('operational promise project concept is missing')
   if(!concepts.some(c=>c.id===concept.id))concepts.push(concept)
  }
 }
 // The calculator now sees these same actual operating rows in its native
 // roots. Do not append them a second time through shared continuation readers.
 // Terminal identities and every unmerged collection remain in the read view.
 const rights={...state.rights,absorptions:state.rights.absorptions.map(a=>a.buyerId===state.hollywood?.playerStudioId
  ?{...a,continuedProductions:[],buyerWorkflows:[]}:a)}
 let view:GameState={...state,rights,concepts,scriptDevelopment:{...development,projects},
  studio:{...state.studio,activeProductions:productions},operations:buyerOperationsForAllWork(state),
  promises:state.promises.map(p=>operationalPromise(state,p,authority))}
 const buyers=new Set([...authority.assignments.values()].map(a=>a.buyerStudioId).filter(id=>id!==state.hollywood?.playerStudioId))
 if(buyers.size===0)return view
 const h=state.hollywood!
 view={...view,hollywood:{...h,businesses:h.businesses.map(b=>{
  if(!buyers.has(b.studioId))return b
  const productions=buyerOperatedProductions(state,b.studioId)
  const projects=[...b.development.projects]
  const foreign=state.rights.absorptions.filter(a=>a.buyerId===b.studioId)
  for(const a of foreign){
   if('continuedScripts' in a)for(const row of a.continuedScripts){if(projects.some(p=>p.id===row.project.id))fail('operational rival project identity collision');projects.push(row.project)}
   for(const row of a.continuedProductions){
    if(!productions.some(p=>p.id===row.productionId))continue
    const source=h.businesses.find(b=>b.studioId===a.targetId),project=source?.development.projects.find(p=>p.id===row.scriptProjectId&&p.productionId===row.productionId)
    if(!project||project.conceptId!==row.originalProduction.conceptId)fail('operational rival picture lacks its exact creator screenplay')
    // A qualified reference exists only in this calculator view. The actual
    // creator project/receipt IDs and every persisted collection are untouched.
    const id=`${a.targetId}:${row.scriptProjectId}`
    if(projects.some(p=>p.id===id))fail('operational rival paid project identity collision')
    projects.push({...project,id})
   }
  }
  const shelved=[...b.screenplayShelving.shelved]
  for(const a of foreign)if(a.producerVersion==='absorption-rival-scripts/v8'||a.producerVersion==='absorption-rival-obligations/v9')for(const row of a.scriptShelving.shelved){
   const ordinal=projects.findIndex(p=>p.id===row.projectId)
   if(ordinal<0)fail('operational rival shelf has no actual project')
   shelved.push({ordinal,week:row.week,retryWeek:row.retryWeek})
  }
  const shelfIds=new Set(shelved.map(row=>row.ordinal))
  return {...b,productions,operations:buyerOperationsForAllWork(state,b.studioId),development:{mode:'managed' as const,projects},
   activeScriptOrdinals:projects.flatMap((p,index)=>p.status!=='produced'&&!shelfIds.has(index)?[index]:[]),
   screenplayShelving:{...b.screenplayShelving,shelved}}
 })},rights:{...view.rights,absorptions:view.rights.absorptions.map(a=>buyers.has(a.buyerId)?{...a,continuedProductions:[],buyerWorkflows:[],...('continuedScripts' in a?{continuedScripts:[]}: {})}:a)}}
 return view
}
export function operationalPromise<T extends {promiseId?:string;issuerStudioId:string;predicate:ProfessionalPromise['predicate']}>(_state:GameState,p:T,authority:AbsorbedPromiseAuthority|undefined):T{
 const assignment=p.promiseId===undefined?undefined:authority?.assignments.get(p.promiseId)
 if(!assignment)return p
 let predicate=p.predicate
 if('kind' in predicate&&predicate.kind==='projectOpportunity'){
  const projectId=assignment.projectIds.get(predicate.scriptProjectId)
  if(projectId)predicate={...predicate,scriptProjectId:projectId}
 }
 return {...p,issuerStudioId:assignment.buyerStudioId,predicate}
}

/** Atomic close owner. `before` is the already admitted input and `next` has
 * actual linked employment/work, but has not published the v7 obligation row.
 * Closing authority is invocation-local and cannot escape this function. */
export function closeAbsorbedObligations(before:GameState,next:GameState,absorptionId:string):GameState{
 const a=next.rights.absorptions.find(row=>row.id===absorptionId)
 if(!a)fail('closing absorption is missing')
 const originals=before.promises.filter(p=>p.issuerStudioId===a.targetId&&p.outcome===null)
 const proposals=before.talentMarket.proposals.filter(p=>p.issuerStudioId===a.targetId)
 const cases=before.talentMarket.cases.filter(c=>c.subjectStudioId===a.targetId&&c.outcome===null)
 if(originals.length+proposals.length+cases.length===0)return next
 if(before.market.tick!==a.week||next.market.tick!==a.week||!same(next.promises,before.promises)||!same(next.talentMarket,before.talentMarket))fail('closing obligation input changed before its native segment')
 const o:AbsorptionObligations={promiseCountBeforeClose:before.promises.length,firstTakeCountBeforeClose:before.firstTakes.length,
  marketReceiptCountBeforeClose:before.talentMarket.receipts.length,promises:[],withdrawals:[],cases:[],closeEvents:[]}
 const priorAuthority=absorbedPromiseAuthority(before)
 const assignments=new Map(priorAuthority?.assignments??[])
 for(const original of originals){
  if(original.contractId===null){o.promises.push({kind:'unboundHistory',original:structuredClone(original)});continue}
  const link=a.contracts.find(row=>row.sourceContractId===original.contractId&&row.talentId===original.beneficiaryPersonId)
  if(!link)fail('open bound promise has no actual closing employment')
  if(link.buyerContractId===null){o.promises.push({kind:'exit',original:structuredClone(original),sourceContractId:link.sourceContractId,outcomeEventId:''});continue}
  o.promises.push({kind:'continued',original:structuredClone(original),sourceContractId:link.sourceContractId,buyerContractId:link.buyerContractId})
  assignments.set(original.promiseId,{absorptionId:a.id,week:a.week,sourceStudioId:a.targetId,buyerStudioId:a.buyerId,
   sourceContractId:link.sourceContractId,buyerContractId:link.buyerContractId,original,firstTakeCountBeforeClose:before.firstTakes.length,projectIds:closingProjectIds(next,a),...(a.buyerId!==before.hollywood!.playerStudioId?{projectProductionIds:new Map(a.continuedProductions.map(row=>[row.scriptProjectId,row.productionId]))}:{})})
 }
 // Capture the next script subproducer only as the coherent v7 close. Empty
 // arrays grant no writing authority; actual future decisions retain this tag.
 next={...next,rights:{...next.rights,absorptions:next.rights.absorptions.map(row=>row.id!==a.id?row:{...row,
  ...(a.buyerId===next.hollywood!.playerStudioId?{producerVersion:'absorption-obligations/v7' as const}:{producerVersion:'absorption-rival-obligations/v9' as const,scriptShelving:'scriptShelving' in row?row.scriptShelving:{rejections:[],shelved:[]}}),stoppedScripts:'stoppedScripts' in row?row.stoppedScripts??[]:[],
  continuedScripts:'continuedScripts' in row?row.continuedScripts:[],scriptCompletions:'scriptCompletions' in row?row.scriptCompletions:[],
  scriptDecisions:'scriptDecisions' in row?row.scriptDecisions:[],obligations:o})}}
 const authority={assignments,withdrawalEvents:priorAuthority?.withdrawalEvents??new Map()}
 const appendOutcomes=(prior:GameState,after:GameState,kind:'exitOutcome'|'cancelOutcome',productionId?:string)=>{
  for(const receipt of after.talentMarket.receipts.slice(prior.talentMarket.receipts.length)){
   const promise=after.promises.find(p=>p.outcomeEventId===receipt.eventId)
   if(receipt.kind!=='promiseOutcome'||!promise)fail('native close settlement emitted an unrelated event')
   if(kind==='exitOutcome'){
    const disposition=o.promises.find(d=>d.kind==='exit'&&d.original.promiseId===promise.promiseId)
    if(!disposition||disposition.kind!=='exit')fail('native exit settled an unrelated promise')
    disposition.outcomeEventId=receipt.eventId
    o.closeEvents.push({kind,promiseId:promise.promiseId,eventId:receipt.eventId})
   }else o.closeEvents.push({kind,promiseId:promise.promiseId,eventId:receipt.eventId,productionId:productionId!})
  }
 }
 for(const link of a.contracts){
  if(link.buyerContractId!==null)continue
  const prior=next
  next=breakPromisesOnTermination(next,a.targetId,link.talentId,authority)
  appendOutcomes(prior,next,'exitOutcome')
 }
 const continued=new Set(o.promises.filter(d=>d.kind==='continued').map(d=>d.original.promiseId))
 const source=before.hollywood!.businesses.find(b=>b.studioId===a.targetId)!
 for(const stopped of a.stoppedProductions){
  const picture=source.productions.find(p=>p.id===stopped.productionId)
  if(!picture)fail('native cancelled source picture is missing')
  const prior=next
  next=breakPromisesOnCancel(next,a.buyerId,picture,authority,continued)
  appendOutcomes(prior,next,'cancelOutcome',picture.id)
 }
 for(const proposal of proposals){
  next=withdrawProposalAtAbsorption(next,proposal.talentId,proposal.issuerStudioId)
  const eventId=next.talentMarket.receipts.at(-1)!.eventId
  o.withdrawals.push({original:structuredClone(proposal),eventId})
  o.closeEvents.push({kind:'withdrawal',talentId:proposal.talentId,issuerStudioId:proposal.issuerStudioId,eventId})
 }
 for(const kase of cases){
  const droppedProposals=next.talentMarket.proposals.filter(p=>p.talentId===kase.talentId).map(p=>structuredClone(p))
  next=invalidateCaseAtAbsorption(next,kase)
  const eventId=next.talentMarket.receipts.at(-1)!.eventId
  o.cases.push({original:structuredClone(kase),droppedProposals,eventId})
  o.closeEvents.push({kind:'caseInvalidation',talentId:kase.talentId,subjectStudioId:kase.subjectStudioId,contractId:kase.contractId,openedWeek:kase.openedWeek,eventId})
 }
 return next
}

function closingProjectIds(state:GameState,a:AbsorptionRecord):ReadonlyMap<string,string>{
 const out=new Map<string,string>()
 if(!Array.isArray(a.continuedProductions))fail('continued promise picture links missing')
 if(!('continuedScripts' in a))return out
 if(!Array.isArray(a.continuedScripts))fail('continued promise project links missing')
 const source=state.hollywood!.businesses.find(b=>b.studioId===a.targetId)
 if(!source||!record(source.development)||!Array.isArray(source.development.projects)||source.development.projects.some(p=>!record(p)))fail('continued promise source projects missing')
 for(const link of a.continuedScripts){
  if(!record(link)||typeof link.sourceScriptProjectId!=='string'||!record(link.originalScript)||!record(link.project)||typeof link.project.id!=='string'
   ||link.originalScript.id!==link.sourceScriptProjectId||link.project.conceptId!==link.originalScript.conceptId
   ||out.has(link.sourceScriptProjectId)||[...out.values()].includes(link.project.id)
   ||!same(source.development.projects.find(p=>p.id===link.sourceScriptProjectId),link.originalScript))fail('continued promise project source differs')
  out.set(link.sourceScriptProjectId,link.project.id)
 }
 for(const row of a.continuedProductions){
  if(!record(row)||typeof row.scriptProjectId!=='string'||typeof row.productionId!=='string'||!record(row.originalProduction))fail('continued promise picture source shape differs')
  const project=source.development.projects.find(p=>p.id===row.scriptProjectId&&p.productionId===row.productionId)
  if(!project||project.conceptId!==row.originalProduction.conceptId||row.originalProduction.id!==row.productionId||out.has(row.scriptProjectId))fail('continued promise picture source differs')
  out.set(row.scriptProjectId,a.buyerId===state.hollywood!.playerStudioId?row.scriptProjectId:`${a.targetId}:${row.scriptProjectId}`)
 }
 return out
}
function assignedProjectGenre(state:GameState,a:AbsorbedPromiseAssignment,id:string):string|undefined{
 const player=a.buyerStudioId===state.hollywood?.playerStudioId
 const own=(player?state.scriptDevelopment:state.hollywood?.businesses.find(b=>b.studioId===a.buyerStudioId)?.development)?.projects.find(p=>p.id===id)
 if(own)return (player?state.concepts:state.hollywood!.concepts).find(c=>c.id===own.conceptId)?.genre
 const sourceId=[...a.projectIds].find(([source,buyer])=>source===id||buyer===id)?.[0]
 const source=state.hollywood!.businesses.find(b=>b.studioId===a.sourceStudioId)
 const project=source?.development.projects.find(p=>p.id===sourceId)
 return project?state.hollywood!.concepts.find(c=>c.id===project.conceptId)?.genre:undefined
}

/** Player release settles promises immediately BEFORE syncPlayerEmployment.
 * Recognize only its exact removed linked bargain and paid native ledger tail;
 * later historical reads use the real ended interval written by that sync. */
export function absorbedPromiseContractEnded(state:GameState,a:AbsorbedPromiseAssignment,week:number):boolean{
 const linked=state.hollywood?.employment.find(e=>e.contractId===a.buyerContractId&&e.studioId===a.buyerStudioId&&e.terms.talentId===a.original.beneficiaryPersonId)
 if(!linked)return false
 if(linked.endedWeek===week)return true
 const paid=state.ledger.at(-1)
 return linked.endedWeek===null&&a.buyerStudioId===state.hollywood?.playerStudioId&&linked.terms.startWeek<=week&&week<linked.terms.endWeekExclusive
  &&!state.contracts.some(c=>same(c,linked.terms))&&state.freeAgents.includes(linked.terms.talentId)
  &&paid?.kind==='termination'&&paid.week===week&&paid.talentId===linked.terms.talentId&&paid.amount===-terminationCost(linked.terms,week)
}
