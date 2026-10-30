// ── P16 r2 REDs: estate encumbrances, handoff references and completeness, timing, as-of reads, tie-break ──
//
// Review r1 blocker F4 / major F29: the estate path refuses what the bilateral path refuses — an R2 film in an active
// run (contract §3: "refuse the active-run transaction" until receipt assignment exists) and an R1 property with an
// active production (contract §3) — and the handoff carries "subject/title/encumbrance references, disposition
// status ... and claim references" (contract §4). Minors F18/F37 (the ceremony runs AT D: an estate cannot open late
// or stay open past D), F38 (as-of reads), F39 (every held right gets one disposition: contract §4 "Every subject
// gets one disposition"), F48 (the tie-break is identity order, never submission order: contract §6), F60 (an estate
// cannot open while its bidders cannot be certified).

import { describe, expect, it } from 'vitest'
import { actualEstateOpening, actualEstateClosure } from './helpers/p16-actual-estate.js'
import { tick } from '../src/core/tick.js'
import { assertAuthenticBidTieAndLowerBid } from './helpers/p16-authentic-bidders.js'
import { assertActualR03Pending } from './helpers/p16-authentic-pending.js'
import * as estate from '../src/core/estate.js'
import * as finance from '../src/core/rightsFinance.js'
import * as rights from '../src/core/rights.js'
import { makeSave, validateSaveV51, importSave, migrateToLive, stableStringify, exportCurrentState } from '../src/core/save.js'
import type { GameState, Action, FilmShape } from '../src/core/types.js'
import { blockingEncumbranceFromFacts, detached, heldSubjectsFromFacts, liveFromGenuine } from './helpers/p16-fixtures.js'

import { manifestPin93, week93Raw } from './p14d1-rival-shelving-fixtures.js'
import { signRole } from './helpers/stabilization-staffing.js'
import { applyActions } from '../src/core/actions.js'
import { acceptOffer, makeOffer, offerRefusal } from '../src/core/assetSale.js'
import { blockingEncumbrance, permissionFor } from '../src/core/licence.js'
import { estateBidRefusal, submitEstateBid } from '../src/core/estate.js'
import { conditionRecord } from '../src/core/corporateConditionLive.js'
import { currentHolder, storyPropertyId, subjectKey } from '../src/core/rights.js'
import { postPurchaseReserve, spendableCash } from '../src/core/rightsFinance.js'
import { resolveShape } from '../src/core/shape.js'

// Genuine93 reverse-ownership witness. The fixed1M rival-origin offer is a scripted lawful API choice,
// not natural AI willingness. Original5000ms budget and first5626ms overrun remain recorded.
const R04='studio-aca408ec-r04', PRICE=1_000_000, FEE=1_000, BID=1_000
const SHAPE:FilmShape={opening:'slowSetup',midpoint:'reversal',ending:'bittersweet'}
function packageFor(state:GameState,conceptId:string) {
 const used=new Set<string>();const writer=signRole(state,'writer',1,used);state=writer.state
 const director=signRole(state,'director',1,used);state=director.state
 const actors=signRole(state,'actor',3,used);state=actors.state
 const craft=signRole(state,'craft',1,used);state=craft.state
 const concept=state.concepts.find(c=>c.id===conceptId)!
 const action:Action & {kind:'greenlight'}={kind:'greenlight',production:{conceptId,shape:SHAPE,
  promise:{genre:concept.genre,intendedSegments:['adult'],ranges:{intimacy:[-1,1],tonalWeight:[-1,1],kineticEnergy:[-1,1]}},
  writerId:writer.ids[0]!,directorId:director.ids[0]!,craftIds:[craft.ids[0]!],
  cast:{lead:actors.ids[0]!,antagonist:actors.ids[1]!,support:actors.ids[2]!},
  budget:{negative:concept.baseNegativeCost*resolveShape(SHAPE).budgetDemandMultiplier*state.era.costScale,marketing:0}}}
 return {state,action}
}

type Subject = { right: 'R1'; propertyId: string } | { right: 'R2'; filmId: string }
const key = (s: Subject) => (s.right === 'R1' ? `R1:${s.propertyId}` : `R2:${s.filmId}`)

function world() {
  const state = liveFromGenuine('week53')
  const h = state.hollywood!
  const [player, r01, r02] = [h.playerStudioId, ...h.identities.slice(1, 3).map((i) => i.studioId)] as [string, string, string]
  // r02 is the closing studio: at week 53 it holds a film in an active run AND a property with an active production.
  const r03 = r02
  const week = state.market.tick
  const held = heldSubjectsFromFacts(state, r03)
  const running = held.find((s) => blockingEncumbranceFromFacts(state, s) === 'activeRun')!
  const producing = held.find((s) => blockingEncumbranceFromFacts(state, s) === 'activeProduction')!
  const clean = held.filter((s) => blockingEncumbranceFromFacts(state, s) === null)
  return { state, h, player, r01, r03, week, held, running, producing, clean }
}

describe('r2 F4/F29: the estate path refuses the bilateral path\'s encumbrances', () => {
  it('premise: the closing studio (r02) at week 53 holds a film in an active run and a property with an active production, and the bilateral path refuses both', () => {
    const { running, producing } = world()
    expect(running).toBeDefined()
    expect(producing).toBeDefined()
  })

  it('a lot holding an active-run film or an active-production property refuses the handoff by name; the same subjects pending are admitted and never sold', () => {
    assertActualR03Pending()
  })

  it('a lot encumbered after the handoff (a production started on its concept) cannot sell at D: its bids are disqualified by name and the lot archives',()=>{
 manifestPin93();const prior=migrateToLive(importSave(week93Raw())).state,priorBytes=stableStringify(prior)
 expect(prior.market.tick).toBe(93)
 let state=tick(prior);expect(state.market.tick).toBe(94)
 const player=state.hollywood!.playerStudioId,week=state.market.tick,conceptId=state.concepts[0]!.id
 console.info(JSON.stringify({proof:'reverse68-evaluated94',condition:conditionRecord(state,R04),cash:state.hollywood!.businesses.find(b=>b.studioId===R04)!.account.cash,reserve:postPurchaseReserve(state,R04)}))
 expect(conditionRecord(state,R04)?.condition.stage).toBe('stable')
 const first=packageFor(state,conceptId);state=applyActions(first.state,[first.action])
 const firstId=state.studio.activeProductions.at(-1)!.id
 state=applyActions(state,[{kind:'cancel',productionId:firstId}])
 const subject={right:'R1' as const,propertyId:storyPropertyId(conceptId)}
 expect(blockingEncumbrance(state,subject)).toBeNull()
 const sale={offerorId:R04,counterpartyId:player,direction:'buy' as const,price:PRICE,instrument:{kind:'title' as const,subject}}
 console.info(JSON.stringify({proof:'reverse68-sale-margin',spendable:spendableCash(state,R04),price:PRICE,reserve:postPurchaseReserve(state,R04),refusal:offerRefusal(state,sale,week)}))
 expect(offerRefusal(state,sale,week)).toBeNull()
 const playerBeforeSale=state.studio.cash,rivalBeforeSale=state.hollywood!.businesses.find(b=>b.studioId===R04)!.account.cash
 const offered=makeOffer(state,sale,week);state=acceptOffer(offered.state,offered.offer.id,player,week)
 expect(state.studio.cash).toBe(playerBeforeSale+PRICE)
 expect(state.hollywood!.businesses.find(b=>b.studioId===R04)!.account.cash).toBe(rivalBeforeSale-PRICE)
 const saleTx=state.rights.transactions.find(t=>t.offerId===offered.offer.id)!
 expect(saleTx).toMatchObject({kind:'titleSale',week,payerId:R04,payeeId:player,amount:PRICE,subject,licenceId:null})
 expect(saleTx.titleEventIds).toHaveLength(1)
 expect(state.rights.titleEvents.find(e=>e.id===saleTx.titleEventIds[0])).toMatchObject({subject,priorHolder:player,newHolder:R04,cause:'sale'})
 expect(currentHolder(state,subject,week)).toMatchObject({holderId:R04,tradeable:true})
 const grant={offerorId:player,counterpartyId:R04,direction:'buy' as const,price:FEE,instrument:{kind:'licence' as const,right:'R3' as const,subject,scope:{use:'remake' as const},exclusive:true,startWeek:week,endWeekExclusive:week+208}}
 expect(offerRefusal(state,grant,week)).toBeNull()
 const playerBeforeGrant=state.studio.cash,rivalBeforeGrant=state.hollywood!.businesses.find(b=>b.studioId===R04)!.account.cash
 const licenceOffer=makeOffer(state,grant,week);state=acceptOffer(licenceOffer.state,licenceOffer.offer.id,R04,week)
 expect(state.studio.cash).toBe(playerBeforeGrant-FEE)
 expect(state.hollywood!.businesses.find(b=>b.studioId===R04)!.account.cash).toBe(rivalBeforeGrant+FEE)
 const grantedLicence=state.rights.licences.find(l=>l.grantorId===R04&&l.granteeId===player&&l.subject.right==='R1'&&l.subject.propertyId===subject.propertyId)!
 expect(grantedLicence).toBeDefined()
 expect(state.rights.transactions.find(t=>t.id===grantedLicence.transactionId)).toMatchObject({kind:'licenceGrant',week,payerId:player,payeeId:R04,amount:FEE,subject,licenceId:grantedLicence.id,offerId:licenceOffer.offer.id,titleEventIds:[]})
 makeSave(state)
 const maxWeek=week+104
 while(state.market.tick<maxWeek&&!state.studioClosure.closures.some(c=>c.studioId===R04))state=tick(state)
 const closure=state.studioClosure.closures.find(c=>c.studioId===R04)
 console.info(JSON.stringify({proof:'reverse68-natural-continuation',week:state.market.tick,closure:closure??null,condition:conditionRecord(state,R04),cash:state.hollywood!.businesses.find(b=>b.studioId===R04)?.account.cash,loans:state.corporateCondition.loans.filter(l=>l.studioId===R04)}))
 expect(closure,'bounded104-week continuation must actually reach rival closure; absence is not global impossibility').toBeDefined()
 const opened=state.rights.estates.find(e=>e.closureId===closure!.closureId)!
 const lot=opened.lots.find(l=>l.subjects.some(s=>subjectKey(s)===subjectKey(subject)))!
 expect(lot).toBeDefined();expect(lot.encumbrances).toContain('licence:'+grantedLicence.id)
 expect(blockingEncumbrance(state,subject)).toBeNull()
 const permitted={kind:'permitted',via:'licence',licenceId:grantedLicence.id}
 expect(permissionFor(state,player,subject,'R3',{use:'remake'},state.market.tick)).toEqual(permitted)
 while(state.market.tick<opened.closesWeek-1)state=tick(state)
 const remake=packageFor(state,conceptId);state=remake.state
 expect(blockingEncumbrance(state,subject)).toBeNull()
 expect(permissionFor(state,player,subject,'R3',{use:'remake'},state.market.tick)).toEqual(permitted)
 expect(BID).toBeGreaterThanOrEqual(lot.minimumBid)
 const bid={estateId:opened.estateId,lotId:lot.lotId,bidderId:player,amount:BID}
 expect(estateBidRefusal(state,bid,state.market.tick)).toBeNull();makeSave(state)
 const before=stableStringify(state),submitted=submitEstateBid(state,bid,state.market.tick)
 const submittedBefore=stableStringify(submitted.state)
 const controlBusy=applyActions(state,[remake.action]),bidBusy=applyActions(submitted.state,[remake.action])
 expect(stableStringify(state)).toBe(before)
 expect(stableStringify(submitted.state)).toBe(submittedBefore)
 expect(blockingEncumbrance(controlBusy,subject)).toBe('activeProduction')
 expect(blockingEncumbrance(bidBusy,subject)).toBe('activeProduction')
 expect(permissionFor(bidBusy,player,subject,'R3',{use:'remake'},state.market.tick)).toEqual(permitted)
 const controlBefore=stableStringify(controlBusy),bidBefore=stableStringify(bidBusy)
 const control=tick(controlBusy),closed=tick(bidBusy)
 expect(stableStringify(controlBusy)).toBe(controlBefore)
 expect(stableStringify(bidBusy)).toBe(bidBefore)
 expect(stableStringify(state)).toBe(before)
 const final=closed.rights.estates.find(e=>e.estateId===opened.estateId)!
 expect(final.bids.find(b=>b.id===submitted.bid.id)).toMatchObject({status:'disqualified',disqualification:'lotEncumbered:activeProduction:'+subjectKey(subject)})
 expect(final.lots.find(l=>l.lotId===lot.lotId)!.status).toBe('archived')
 expect(closed.studio.cash).toBe(control.studio.cash)
 expect(closed.ledger).toEqual(control.ledger)
 expect(closed.rights.transactions.filter(t=>t.estateId===opened.estateId&&t.lotId===lot.lotId)).toEqual([])
 expect(closed.rights.transactions.find(t=>t.id===saleTx.id)).toEqual(saleTx)
 expect(closed.rights.transactions.find(t=>t.id===grantedLicence.transactionId)).toEqual(state.rights.transactions.find(t=>t.id===grantedLicence.transactionId))
 makeSave(closed)
 const saved=exportCurrentState(closed)
 expect(exportCurrentState(migrateToLive(importSave(saved)).state)).toBe(saved)
 expect(stableStringify(prior)).toBe(priorBytes)
})

  it('every right the closed studio held is disposed exactly once: an omitted, a duplicated, a foreign or an undisclosed-licence subject refuses the handoff', () => {
    const actual=actualEstateOpening(),[state,base,week]=actual.boundary,lot=base.lots[0]!,subject=lot.subjects[0]!
    const before=JSON.stringify(state)
    expect(estate.estateHandoffRefusal(state,base,week)).toBeNull()
    expect(estate.estateHandoffRefusal(state,{...base,lots:base.lots.slice(1)},week)).toBe(`dispositionMissing:${key(subject)}`)
    expect(estate.estateHandoffRefusal(state,{...base,pending:[{subject,reason:'notOffered'}]},week)).toBe(`dispositionDuplicate:${key(subject)}`)
    expect(estate.estateHandoffRefusal(state,{...base,pending:[{subject:{right:'R2',filmId:'no-such-film'},reason:'notOffered'}]},week)).toBe('pendingSubjectNotHeld:R2:no-such-film')
    expect(estate.estateHandoffRefusal(state,{...base,lots:base.lots.slice(1),pending:[{subject,reason:'' as never}]},week)).toBe('invalidPendingReason')
    expect(estate.estateHandoffRefusal(state,{...base,claimsContext:{...base.claimsContext,claimIds:[base.claimsContext.claimIds[0]!,base.claimsContext.claimIds[0]!]}},week)).toBe('actualClosureClaimsMismatch')
    expect(estate.estateHandoffRefusal(state,{...base,lots:base.lots.map((l,i)=>i===0?{...l,encumbrances:['licence:rights-licence-99']}:l)},week)).toBe(`encumbranceMismatch:${lot.lotId}`)
    expect(JSON.stringify(state)).toBe(before)

  })
})

describe('r2 F18/F37/F60: the window opens at the closure week, closes exactly at D, and needs certifiable bidders', () => {
  it('openEstate refuses outside the closure week and while the P15B readers are unbound; the validator refuses an estate still open at or after D', () => {
    const actual=actualEstateOpening(),[state,handoff,week]=actual.boundary
    const before=JSON.stringify(state)
    expect(estate.estateHandoffRefusal(state,handoff,week+1)).toBe('notClosureWeek')
    expect(estate.estateHandoffRefusal(state,handoff,week-1)).toBe('notClosureWeek')
    // The current producer has actual bound readers; only the explicit unbound sentinel must refuse.
    expect(estate.openEstate(state,handoff,week).estate).toEqual(actual.estate)
    expect(()=>estate.openEstate(state,handoff,week,finance.UNBOUND_CORPORATE_CONDITION_READERS)).toThrow(/conditionReadersUnbound/)
    const save=detached(makeSave(actual.state));save.state.market.tick=handoff.closesWeek
    const hostileBefore=JSON.stringify(save)
    expect(()=>rights.validateRightsRoot(save.state as unknown as Record<string,unknown>,'r2')).toThrow(/still open at or after its close boundary/)
    expect(()=>validateSaveV51(save)).toThrow()
    expect(JSON.stringify(save)).toBe(hostileBefore);expect(JSON.stringify(state)).toBe(before)
    expect(()=>validateSaveV51(makeSave(actual.state))).not.toThrow()

  })
})

describe('r2 F38: an as-of read inside the window reports the lot as it stood that week', () => {
  it('a subject that archives at D reads unarchived at every earlier week of the window', () => {
    const actual=actualEstateClosure(),record=actual.estate,D=record.closesWeek,r03=record.studioId
    const lot=record.lots.find(l=>l.subjects.some(s=>s.right==='R2'&&s.filmId===r03+':film:0'))!
    expect(lot).toBeDefined();const subject=lot.subjects[0]!
    let state=actual.state
    while(state.market.tick<D-1)state=tick(state)
    const before=JSON.stringify(state),closed=estate.resolveEstate(state,record.estateId,D)
    expect(JSON.stringify(state)).toBe(before);makeSave(closed)
    for(let week=record.opensWeek;week<D;week++)expect(rights.currentHolder(closed,subject,week)).toEqual({kind:'holder',holderId:r03,tradeable:false,archived:false,estate:{estateId:record.estateId,lotId:lot.lotId}})
    expect(rights.currentHolder(closed,subject,D)).toMatchObject({holderId:`estate:${r03}`,archived:true,tradeable:false})

  })
})

describe('r2 F48: the deterministic tie-break is ascending reserved identity order, not submission order', () => {
  it('equal sealed bids resolve to the lower identity row even when the higher row bid first', () => {
    assertAuthenticBidTieAndLowerBid()
  })
})
