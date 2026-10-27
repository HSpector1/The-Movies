import { buyerScriptDevelopment, continuedScriptOwner, rivalScriptOwners, rivalCarriedSource, carriedScriptForProduction, linkCarriedScriptToProduction, markCarriedScriptProduced, advanceBuyerScriptWork, acceptRivalContinuedReviews, recordRivalScriptRejection } from './continuedScripts.js'
import { buyerContinuedProductions, buyerOperationsForAllWork, buyerOperatedProductions, publishOperatedAdvance, recordContinuedWorkSteps, continuedCommittedReleaseIds } from './continuedWork.js'
import { advanceAbsorbedRuns } from './absorbedRuns.js'
import { validateAbsorbedProductionStops } from './absorbedWork.js'
import { validateAbsorbedScripts } from './absorbedScripts.js'
import {chooseIndustryPackage, searchIndustryPackages, rivalCostCuttingEntry, rivalCostCuttingReleaseAllowed,
  type RivalCostCuttingEntryFacts} from './hollywoodPolicy.js'
import { considerRivalSoundPurchase, selectRivalSoundProduction, rivalInstallationSlots } from './technologyRival.js'
import { createProductionTechnologyPolicy } from './technologyProduction.js'
import { busyTalentIds, offerForTalent, weeklySalary, renewalWindowOpen, terminationCost } from './employment.js'
import { productionCompanyTalentIds } from './productionPeople.js'
import { caseOpenForTalent, floorOffer } from './talentMarket.js'
import { assignmentRefusal, contractEndRefusal } from './careerLifecycle.js'
import { promisedCastMasks, WEEKS_TO_FIRST_TAKE } from './promises.js'
import { isOpportunityPredicate } from './opportunityPromises.js'
import { industryBusyTalentIds, moveRivalMoney, rivalCapacityOpex, rivalWeeklyOperatingCost, uniqueIdentity } from './hollywood.js'
import { loanInstallmentDueFor, releaseRefusal } from './corporateConditionLive.js'
import { absorbedWeekOf, closedWeekOf, terminalWeekOf } from './operatingState.js'
import { admitRivalPlansInWeek, advanceRivalResearch, completeRivalPlans, disposeEligibleRivalFacilities, rivalScientistDemand } from './rivalResearch.js'
import { researchAfterEmploymentRelease } from './technology.js'
import { RIVAL_TEAM_ROLES } from './hollywoodStartingData.js'
import { buildFilmParticipants } from './filmParticipants.js'
import { computeForecast } from './forecast.js'
import { forecastHistoryForOwner } from './industryCareer.js'
import { mintOriginalConcept, scriptDraftWeeks, writingPaceExperience } from './screenplay.js'
import { acceptScriptProject, canonicalScriptProjectId, commissionScriptProject,
  linkScriptProjectToProduction, markScriptProjectProduced, scriptOccupiedFacilitySlots } from './scriptDevelopment.js'
import { addManagedProductionWorkflow, advanceManagedProductions, assignShootingDirector,
  clearSceneryLoadIn, scheduleShootingTake } from './operations.js'
import { releaseCommitmentRefusal, withReleaseCommitment, committedReleaseIds, pruneReleasedCommitments } from './releaseAuthority.js'
import { persistedConceptIds, persistedProductionIds } from './productionIdentity.js'
import { resolveShape } from './shape.js'
import { stream } from './rng.js'
import { buildFilmResult, resolveReception, type ReceptionInputs } from './reception.js'
import { openTheatricalRun } from './economy.js'
import { updateStanding, type StandingContext } from './standing.js'
import { cloneStanding } from './studioHistory.js'
import { flattenParticipants } from './starPower.js'
import { generateIndustryTalent, FORCE_ORDER } from './worldgen.js'
import { GENRE_ORDER, TUNING } from './tuning.js'
import { clamp } from './math.js'
import type { ReleaseGrowthRecord } from './releaseCareers.js'
import type { GameState, Talent, FilmShape, Production, ScriptDevelopment, ScriptProject, LedgerEntry, Standing } from './types.js'
import type { HollywoodState, IndustryReceipt, LiveIndustryFilm, RivalBusiness } from './hollywoodTypes.js'

/** Shared arithmetic receives the world generator's fixed force order after
 * every load too; JSON key sorting must not change floating-point accumulation. */
function industryMarket(market:GameState['market']):GameState['market'] {
  return {...market,forces:Object.fromEntries(FORCE_ORDER.map(force=>[force,market.forces[force]])) as GameState['market']['forces']}
}

type ReceiptDraft = IndustryReceipt extends infer R ? R extends IndustryReceipt ? Omit<R,'eventId'> : never : never
function appendReceipt(h:HollywoodState, draft:ReceiptDraft) {
  h.receipts=[...h.receipts,{...draft,eventId:`industry-event-${h.nextReceipt++}`} as IndustryReceipt]
}
function hotDevelopment(b:RivalBusiness):ScriptDevelopment {
  return {mode:'managed',projects:b.activeScriptOrdinals.map(i=>b.development.projects[i]!)}
}
function storeHotDevelopment(b:RivalBusiness, hot:ScriptDevelopment) {
  if(hot.projects.every((p,i)=>p===b.development.projects[b.activeScriptOrdinals[i]!])) return
  const projects=[...b.development.projects]
  for(const p of hot.projects) projects[Number(p.id.slice(7))]=p
  b.development={mode:'managed',projects}
  b.activeScriptOrdinals=hot.projects.filter(p=>p.status!=='produced').map(p=>Number(p.id.slice(7)))
}
function currentEmployees(h:HollywoodState, studioId:string) {
  return h.activeEmploymentOrdinals.map(i=>h.employment[i]!).filter(e=>e.studioId===studioId)
}
function operatingReserve(b:RivalBusiness,h:HollywoodState,week:number) {
  return rivalWeeklyOperatingCost(b,h,week)*b.policy.reserveWeeks
}
function partsFor(p:Pick<Production,'writerId'|'directorId'|'cast'|'craftIds'>, talent:ReadonlyMap<string,Talent>) {
  const person=(id:string):Talent=>{const t=talent.get(id);if(!t)throw new Error(`Industry participant missing: ${id}`);return t}
  return {writer:person(p.writerId),director:person(p.directorId),cast:{lead:person(p.cast.lead),antagonist:person(p.cast.antagonist),support:person(p.cast.support)},craftHires:p.craftIds.map(person)}
}
function inputsFor(state:GameState,h:HollywoodState,b:RivalBusiness,p:Production|{conceptId:string;shape:FilmShape;promise:ScriptProject['promise'];budget:Production['budget'];writerId:string;directorId:string;cast:Production['cast'];craftIds:string[]}, project:ScriptProject,talent:ReadonlyMap<string,Talent>):ReceptionInputs {
  const carried=rivalCarriedSource({...state,hollywood:h},b.studioId,project)
  const cost=carried?.cost??b.projects[Number(project.id.slice(7))]!
  const concept=carried?.concept??h.concepts[cost.conceptOrdinal]!
  if(concept.id!==p.conceptId)throw new Error('Industry concept index lost identity')
  return {concept,shape:p.shape,shapeEffects:resolveShape(p.shape),promise:p.promise,budget:p.budget,
    ...partsFor(p,talent),market:industryMarket(state.market),standing:b.standing,era:state.era,
    ...(project.assessment?{scriptStrengthOverride:{actual:project.assessment.actualStrength,perceived:project.assessment.perceivedStrength}}:{})}
}

/** One owner-independent operations adapter at the approved abstract physical fidelity.
 * Capacity and task transitions are real; stage-local scenery has no simulated travel geometry. */
function operateStage(b:RivalBusiness) {
  for(const p of b.productions) {
    let workflow=b.operations.workflows.find(w=>w.productionId===p.id)
    if(workflow?.shootingTask?.status==='unassigned') {
      b.operations=assignShootingDirector(b.operations,p,p.directorId)
      workflow=b.operations.workflows.find(w=>w.productionId===p.id)
    }
    if(workflow?.shootingTask?.status==='blocked'&&workflow.blocker?.kind==='scenery-load-in') {
      b.operations=clearSceneryLoadIn(b.operations,p.id)
      workflow=b.operations.workflows.find(w=>w.productionId===p.id)
    }
    if(workflow?.shootingTask?.status==='ready') b.operations=scheduleShootingTake(b.operations,p.id)
  }
}

type StaffingCashFacts = Pick<RivalCostCuttingEntryFacts,
  'unfilledFilmSlotForCash' | 'renewalRefusedForCash' | 'unrelatedScientistSlotRefusedForCash'>

/** Fill only actual role deficits. Existing lawful employees are preferred; no player poaching. */
function staff(state:GameState,h:HollywoodState,b:RivalBusiness,talent:Talent[],week:number,extraRoles:readonly Talent['role'][],suppliedPeople:{id:string;age:number}[],cashFacts:StaffingCashFacts):Talent[] {
  const cutting=b.costCutting.since!==null
  const reserveAfterOffer=(terms:import('./types.js').Contract,replacing?:number)=>{
    const employment=[...h.employment,{contractId:'prospective',studioId:b.studioId,terms,endedWeek:null,reason:'replacement' as const}]
    const activeEmploymentOrdinals=[...h.activeEmploymentOrdinals.filter(i=>i!==replacing),employment.length-1]
    return operatingReserve(b,{...h,employment,activeEmploymentOrdinals},week)
  }
  // Same renewal window and immediate replacement terms as the player's renewContract.
  // Ongoing work does not prevent an existing employer from retaining its own people.
  for(const ordinal of cutting?[]:[...h.activeEmploymentOrdinals]) {
    const old=h.employment[ordinal]!
    if(old.studioId!==b.studioId||!renewalWindowOpen(old.terms,week))continue
    // P14A.1 (companion §2.1.3 / §2.5, the second bounded staff() edit): this loop
    // runs BEFORE decide() in the same weekly pass and would otherwise auto-renew a
    // rival's expiring person for 208 weeks in the discovery week, so a rival's
    // person could never reach a contested expiry. A CASE SUBJECT is excluded for
    // the whole open-case span — the exclusion lands with the case-open check, not
    // with settlement. Under a case the incumbent's retention is its PROPOSAL.
    if(caseOpenForTalent({...state,hollywood:h,talent},old.terms.talentId,week))continue
    // P14C.2a (773 D7 / trap 1): the fixed 208-week renewal never binds past an
    // announced person's effective week; they finish this term and are not renewed.
    if(contractEndRefusal(state,old.terms.talentId,week+TUNING.HOLLYWOOD_CONTRACT_WEEKS)!==null)continue
    const person=talent.find(t=>t.id===old.terms.talentId)!
    // R1 binds rivals (R3): this studio's own release floor prices its own re-hire.
    const terms=floorOffer({...state,hollywood:h},b.studioId,offerForTalent(state.seed,person,TUNING.HOLLYWOOD_CONTRACT_WEEKS,week),week)
    if(b.account.cash-terms.signingBonus<reserveAfterOffer(terms,ordinal)) {
      cashFacts.renewalRefusedForCash=true;continue
    }
    const contractId=`${b.studioId}:contract:${person.id}:${week}`
    const newOrdinal=h.employment.length
    h.employment=[...h.employment]
    h.employment[ordinal]={...old,endedWeek:week}
    h.employment.push({contractId,studioId:b.studioId,terms,endedWeek:null,reason:'renewal'})
    h.activeEmploymentOrdinals=h.activeEmploymentOrdinals.map(i=>i===ordinal?newOrdinal:i)
    moveRivalMoney(b.account,'signing',-terms.signingBonus,week)
    appendReceipt(h,{week,studioId:b.studioId,kind:'employment',talentId:person.id,fromStudioId:b.studioId,toStudioId:b.studioId,contractId,reason:'renewal'})
  }
  const occupied=busyTalentIds({...state,hollywood:h,talent})
  const unavailable=new Set([...occupied,...state.contracts.map(c=>c.talentId),...(state.founding?.applicantIds??[])])
  for(const e of h.activeEmploymentOrdinals.map(i=>h.employment[i]!))unavailable.add(e.terms.talentId)
  const own=currentEmployees(h,b.studioId)
  const filled=new Set<string>()
  // P14C.2a (773 D7 / trap 1): a fresh hire or a re-hire is a new 208-week contract, so
  // nobody it would bind past an effective week is a candidate (announced, finishing or
  // retired alike). A skipped slot falls through to the next person or a minted one.
  const capped=(id:string)=>contractEndRefusal(state,id,week+TUNING.HOLLYWOOD_CONTRACT_WEEKS)!==null
  let next=talent
  // P13B-S8: the fixed production team, then the Scientists this studio's own
  // research policy demands — one list, one contract law, one receipt per hire.
  for(const [slot,role] of (cutting?[]:[...RIVAL_TEAM_ROLES,...extraRoles]).entries()) {
    const retained=own.find(e=>!filled.has(e.terms.talentId)&&next.find(t=>t.id===e.terms.talentId)?.role===role)
    if(retained){filled.add(retained.terms.talentId);continue}
    const expired=[...h.employment].reverse().find(e=>e.studioId===b.studioId && next.find(t=>t.id===e.terms.talentId)?.role===role && !filled.has(e.terms.talentId))
    let person=expired&&!unavailable.has(expired.terms.talentId)&&!capped(expired.terms.talentId)?next.find(t=>t.id===expired.terms.talentId):undefined
    person ??= next.find(t=>t.role===role&&!unavailable.has(t.id)&&!capped(t.id))
    let supplied=false
    let exactAge=0
    if(!person) {
      const id=uniqueIdentity(`person-${b.studioId}-supply-${week}-${slot}`,new Set(next.map(t=>t.id)))
      person=generateIndustryTalent(state.seed,id,role)
      // P14C.1: the EXACT draw is the provenance anchor and is kept unrounded; the
      // COMMITTED person stores its floor, applied HERE so `offerForTalent` below
      // prices the age this world ends up storing.
      exactAge=person.age
      person={...person,age:Math.floor(exactAge)}
      supplied=true
    }
    const terms=floorOffer({...state,hollywood:h},b.studioId,offerForTalent(state.seed,person,TUNING.HOLLYWOOD_CONTRACT_WEEKS,week),week)
    if(b.account.cash-terms.signingBonus < reserveAfterOffer(terms)) {
      if(role==='scientist')cashFacts.unrelatedScientistSlotRefusedForCash=true
      else cashFacts.unfilledFilmSlotForCash=true
      continue
    }
    // P14C.1 (record 762 §4, 759-C amendment 3): the APPEND, not the mint at :138.
    // The affordability check above `continue`s, so a rival that cannot pay discards
    // the person it just minted; provenance written inside a shared mint primitive
    // would record one dead row per unaffordable rival hire per week, forever, in a
    // save validated on every load. Collected here and written by the outer tick with
    // the same `talent` array this returns.
    if(supplied){next=[...next,person];suppliedPeople.push({id:person.id,age:exactAge})}
    const reason=expired?.terms.talentId===person.id?'renewal':'replacement'
    const contractId=`${b.studioId}:contract:${person.id}:${week}`
    h.activeEmploymentOrdinals=[...h.activeEmploymentOrdinals,h.employment.length]
    h.employment=[...h.employment,{contractId,studioId:b.studioId,terms,endedWeek:null,reason}]
    moveRivalMoney(b.account,'signing',-terms.signingBonus,week)
    appendReceipt(h,{week,studioId:b.studioId,kind:'employment',talentId:person.id,fromStudioId:null,toStudioId:b.studioId,contractId,reason})
    unavailable.add(person.id);filled.add(person.id)
  }
  // R3 (companion §2.1.9, §3.5 E4, §3.6; 1305-A/F): the player's termination law, chosen
  // by strategy. Ordinarily surplus excludes Scientists and retains filled slots.
  // While cutting, no slot retains anyone and unseated Scientists may be surplus.
  // A release needs no
  // production, writing or unreleased research seat, more than the cap left, no open
  // promise from this studio, and this studio's reserve without the person after the charge.
  const seated=industryBusyTalentIds(h,terminalWeekOf(state))
  for(const project of state.technology.projects) if(project.studioId===b.studioId)
    for(const seat of project.seats) if(seat.releasedWeek===null) seated.add(seat.talentId)
  const surplus=h.activeEmploymentOrdinals.filter(i=>{const e=h.employment[i]!
    return e.studioId===b.studioId&&!filled.has(e.terms.talentId)&&(cutting||next.find(t=>t.id===e.terms.talentId)?.role!=='scientist')})
  for(const ordinal of surplus.sort((x,y)=>x-y)) {
    const e=h.employment[ordinal]!,id=e.terms.talentId
    // P15B Wave 3 (1352-A §4.3; 1357-A §3.4): legality is the one shared release predicate; the research
    // seat, the cap, the promise and the reserve below remain this studio's policy.
    if(releaseRefusal({...state,hollywood:h},b.studioId,id)!==null)continue
    if(seated.has(id)||e.terms.endWeekExclusive-week<=TUNING.HIRING_TERMINATION_CAP_WEEKS)continue
    if(state.promises.some(p=>p.issuerStudioId===b.studioId&&p.beneficiaryPersonId===id&&p.outcome===null))continue
    const charge=terminationCost(e.terms,week)
    const activeEmploymentOrdinals=h.activeEmploymentOrdinals.filter(i=>i!==ordinal)
    if(b.account.cash-charge<operatingReserve(b,{...h,activeEmploymentOrdinals},week))continue
    // Existing exclusions above cover production/writing/research seats and promises.
    // Keep R3 exactly as before outside cutting; the extra payback law is scoped.
    if(cutting&&!rivalCostCuttingReleaseAllowed({week,endWeekExclusive:e.terms.endWeekExclusive,
      annualSalary:e.terms.annualSalary,cash:b.account.cash,
      weeklyOperatingCost:rivalWeeklyOperatingCost(b,h,week),reserveWeeks:b.policy.reserveWeeks,
      productionSeat:false,writingSeat:false,unreleasedResearchSeat:false,openPromise:false}))continue
    h.employment=[...h.employment]
    h.employment[ordinal]={...e,endedWeek:week}
    h.activeEmploymentOrdinals=activeEmploymentOrdinals
    moveRivalMoney(b.account,'termination',-charge,week)
    appendReceipt(h,{week,studioId:b.studioId,kind:'employment',talentId:id,fromStudioId:b.studioId,toStudioId:null,contractId:e.contractId,reason:'termination'})
  }
  return next
}

function decide(state:GameState,h:HollywoodState,b:RivalBusiness,talent:Talent[],week:number,
  greenlights:{studioId:string;production:Production}[],cashFacts:StaffingCashFacts) {
  if(week<b.nextDecisionWeek)return state.rights
  b.nextDecisionWeek=week+TUNING.HOLLYWOOD_DECISION_WEEKS
  const operatedCount=()=>buyerOperatedProductions({...state,hollywood:h},b.studioId).length
  let rights=state.rights
  const decisionState=()=>({...state,hollywood:h,rights})
  let greenlit=false,commissioned=false
  let commissionStop:RivalCostCuttingEntryFacts['commissionStop']='none'
  const indexedOutcomes=new Map<number|string,RivalCostCuttingEntryFacts['indexedOutcomes'][number]>()
  const runDecision=()=>{
  const busy=busyTalentIds({...state,hollywood:h,talent})
  const people=new Map(talent.map(t=>[t.id,t]))
  const employees=currentEmployees(h,b.studioId).map(e=>people.get(e.terms.talentId)!)
  // P14C.2a (773 D9): a rival seats nobody whose seat cannot release before their
  // effective retirement week, and nobody finishing or retired — director, cast and craft.
  const seatable=(t:Talent)=>!busy.has(t.id)&&assignmentRefusal(state,t.id,week)===null
  // P14D.1 (1344-A §3.1): one decision opportunity for one ready screenplay. A viable package
  // is returned for the greenlight; otherwise the outcome names why none was chosen.
  const evaluate=(ready:ScriptProject)=>{
    const director=employees.find(t=>t.role==='director'&&seatable(t))
    const craft=employees.find(t=>t.role==='craft'&&seatable(t))
    // P14B.4 seating preference (plan :215-236): eligible PROMISED people enter the triple first, in employment
    // order; the writer of this screenplay and the chosen director/craft cannot double as cast; with no member
    // the expression below is the historical first-three rule unchanged.
    const carried=rivalCarriedSource(decisionState(),b.studioId,ready)
    const projectConcept=carried?.concept??h.concepts[b.projects[Number(ready.id.slice(7))]!.conceptOrdinal]!
    const masks=promisedCastMasks(state,b.studioId,week+WEEKS_TO_FIRST_TAKE,
      {genre:projectConcept.genre,scriptProjectId:ready.id})
    const taken=new Set([ready.writerId,director?.id,craft?.id])
    const promised=employees.filter(t=>masks.has(t.id)&&seatable(t)&&!taken.has(t.id)&&t.skills.acting!==undefined)
    const actors=[...promised,...employees.filter(t=>t.role==='actor'&&seatable(t)&&!promised.includes(t))].slice(0,3)
    if(!director||actors.length!==3||!craft)return {outcome:'staffingBlocked'} as const
    const cost=carried?.cost??b.projects[Number(ready.id.slice(7))]!
    const concept=carried?.concept??h.concepts[cost.conceptOrdinal]!
    const provisional={conceptId:concept.id,shape:ready.shape,promise:ready.promise,budget:{negative:concept.baseNegativeCost,marketing:0},writerId:ready.writerId,
      directorId:director.id,cast:{lead:actors[0]!.id,antagonist:actors[1]!.id,support:actors[2]!.id},craftIds:[craft.id]}
    const args=[inputsFor(decisionState(),h,b,provisional,ready,people),b.policy,{seed:state.seed,key:`${b.studioId}:package:${ready.id}`,
      cashAvailable:b.account.cash-operatingReserve(b,h,week),weeklyCost:rivalWeeklyOperatingCost(b,h,week),lockScreenplay:true,
      ...(masks.size>0?{promisedMasks:masks}:{})}] as const
    const candidate=chooseIndustryPackage(...args)
    if(candidate)return {outcome:'viable',candidate,provisional,director,cost,concept} as const
    // 1363-A/F Part A: cash binds only if a skipped package would pass the unchanged viability gate.
    // The ordinary chooser stays opted out; only this refusal re-search pays for the extra forecasts.
    const diagnostic=searchIndustryPackages(args[0],args[1],{...args[2],diagnoseUnaffordableViability:true})
    return {outcome:(diagnostic.unaffordableViable??0)>0?'cashBlocked':'economicRejection'} as const
  }
  type Viable=Extract<ReturnType<typeof evaluate>,{outcome:'viable'}>
  const greenlight=(ready:ScriptProject,{candidate,provisional,director,cost,concept}:Viable)=>{
    const {negative,marketing}=candidate.budget
    const carried=continuedScriptOwner(decisionState(),ready.id)
    const id=uniqueIdentity(carried?`${b.studioId}:film:${ready.id}`:`${b.studioId}:film:${Number(ready.id.slice(7))}`,persistedProductionIds(decisionState()))
    const choices={...provisional,budget:candidate.budget,cast:candidate.cast}
    const inp=inputsFor(decisionState(),h,b,choices,ready,people)
    const forecastSnapshot=computeForecast(inp,{seed:state.seed,productionId:id,directorId:director.id,
      ...forecastHistoryForOwner({...state,hollywood:h},b.studioId)},true,true)
    const production:Production={...choices,id,startTick:week,remainingTicks:TUNING.PRODUCTION_TICKS,forecastSnapshot,
      participants:buildFilmParticipants(id=>employees.some(t=>t.id===id),inp,concept,inp.shapeEffects,ready.promise,ready.shape)}
    const operations=addManagedProductionWorkflow(b.operations,production,scriptOccupiedFacilitySlots(buyerScriptDevelopment(decisionState(),b.studioId)))
    b.operations=operations;b.productions=[...b.productions,production]
    if(!carried)storeHotDevelopment(b,linkScriptProjectToProduction(hotDevelopment(b),ready.id,id))
    greenlights.push({studioId:b.studioId,production})
    greenlit=true
    b.costCutting={version:1,since:null}
    // A newly seated person cannot also start writing in this decision.
    // Permanent screenplay credit alone does not occupy a production seat.
    for(const personId of productionCompanyTalentIds([production]))busy.add(personId)
    moveRivalMoney(b.account,'production',-negative,week);moveRivalMoney(b.account,'marketing',-marketing,week)
    const paidCost={...cost,productionId:id,production:negative,marketing,announcedWeek:week}
    if(carried)rights=linkCarriedScriptToProduction(decisionState(),ready.id,production,paidCost).rights
    else {b.projects=[...b.projects];b.projects[Number(ready.id.slice(7))]=paidCost}
    appendReceipt(h,{week,studioId:b.studioId,kind:'filmAnnounced',productionId:id,conceptId:concept.id})
  }
  for(const ready of buyerScriptDevelopment(decisionState(),b.studioId).projects.filter(p=>p.status==='ready')) {
    if(operatedCount()!==0)break
    const acquired=continuedScriptOwner(decisionState(),ready.id)
    const ordinal=Number(ready.id.slice(7))
    const result=evaluate(ready)
    if(result.outcome!=='viable')indexedOutcomes.set(acquired?ready.id:ordinal,result.outcome)
    if(acquired&&acquired.a.producerVersion==='absorption-rival-scripts/v8'){
      if(result.outcome==='viable'){rights=recordRivalScriptRejection(decisionState(),b.studioId,ready.id,0,week,false).rights;greenlight(ready,result);continue}
      if(result.outcome!=='economicRejection')continue
      const count=Math.min(TUNING.HOLLYWOOD_SHELVE_AFTER_REJECTIONS,(acquired.a.scriptShelving.rejections.find(r=>r.projectId===ready.id)?.count??0)+1)
      const named=state.promises.some(p=>p.outcome===null&&p.issuerStudioId===b.studioId&&isOpportunityPredicate(p.predicate)&&p.predicate.kind==='projectOpportunity'&&p.predicate.scriptProjectId===ready.id)
      const shelve=count===TUNING.HOLLYWOOD_SHELVE_AFTER_REJECTIONS&&!named
      rights=recordRivalScriptRejection(decisionState(),b.studioId,ready.id,count,week,shelve).rights
      if(shelve){b.screenplayShelving={...b.screenplayShelving,commissionHoldUntilWeek:week+TUNING.HOLLYWOOD_SHELVE_COMMISSION_HOLD_WEEKS};appendReceipt(h,{week,studioId:b.studioId,kind:'screenplayShelved',scriptProjectId:ready.id,conceptId:ready.conceptId,rejections:count})}
      continue
    }
    if(result.outcome!=='viable')indexedOutcomes.set(ordinal,result.outcome)
    const shelving=b.screenplayShelving
    // A greenlit screenplay is no longer ready, so its count leaves with it.
    if(result.outcome==='viable'){b.screenplayShelving={...shelving,rejections:shelving.rejections.filter(r=>r.ordinal!==ordinal)};greenlight(ready,result);continue}
    // P14D.1 (1344-A §3.1-§3.3): only an economic rejection counts; staffing and cash blockage leave the count.
    if(result.outcome!=='economicRejection')continue
    const count=Math.min(TUNING.HOLLYWOOD_SHELVE_AFTER_REJECTIONS,(shelving.rejections.find(r=>r.ordinal===ordinal)?.count??0)+1)
    // An open promise from this studio naming the screenplay defers shelving; the count waits at the threshold.
    const named=state.promises.some(p=>p.outcome===null&&p.issuerStudioId===b.studioId&&isOpportunityPredicate(p.predicate)
      &&p.predicate.kind==='projectOpportunity'&&p.predicate.scriptProjectId===ready.id)
    if(count<TUNING.HOLLYWOOD_SHELVE_AFTER_REJECTIONS||named) {
      b.screenplayShelving={...shelving,rejections:[...shelving.rejections.filter(r=>r.ordinal!==ordinal),{ordinal,count}].sort((x,y)=>x.ordinal-y.ordinal)}
      continue
    }
    // Shelving frees the slot. The screenplay stays ready with its costs and history; no money moves.
    b.activeScriptOrdinals=b.activeScriptOrdinals.filter(i=>i!==ordinal)
    b.screenplayShelving={version:1,rejections:shelving.rejections.filter(r=>r.ordinal!==ordinal),
      shelved:[...shelving.shelved,{ordinal,week,retryWeek:week+TUNING.HOLLYWOOD_SHELVED_RETRY_WEEKS}].sort((x,y)=>x.ordinal-y.ordinal),
      commissionHoldUntilWeek:week+TUNING.HOLLYWOOD_SHELVE_COMMISSION_HOLD_WEEKS}
    appendReceipt(h,{week,studioId:b.studioId,kind:'screenplayShelved',scriptProjectId:ready.id,conceptId:b.projects[ordinal]!.conceptId,rejections:count})
  }
  // P14D.1 (1344-A §3.4, 1344-F Amendment 1): with no production and a free slot, retry the oldest due
  // shelved screenplay, read directly (a shelved ordinal is outside the hot view). It re-enters the
  // index only together with its greenlight; an economic rejection waits another retry interval.
  const due=operatedCount()===0&&buyerScriptDevelopment(decisionState(),b.studioId).projects.length<2
    ?b.screenplayShelving.shelved.find(s=>s.retryWeek<=week):undefined
  if(due) {
    const ready=b.development.projects[due.ordinal]!
    const result=evaluate(ready)
    const shelving=b.screenplayShelving
    if(result.outcome==='viable') {
      b.activeScriptOrdinals=[...b.activeScriptOrdinals,due.ordinal].sort((x,y)=>x-y)
      b.screenplayShelving={...shelving,shelved:shelving.shelved.filter(s=>s!==due)}
      greenlight(ready,result)
    } else if(result.outcome==='economicRejection') {
      b.screenplayShelving={...shelving,shelved:shelving.shelved.map(s=>s===due?{...s,retryWeek:week+TUNING.HOLLYWOOD_SHELVED_RETRY_WEEKS}:s)}
    }
  }
  if(operatedCount()===0&&buyerScriptDevelopment(decisionState(),b.studioId).projects.length<2){
    const due=rivalScriptOwners(decisionState(),b.studioId).flatMap(a=>a.scriptShelving.shelved.map(s=>({a,s}))).filter(({s})=>s.retryWeek<=week).sort((x,y)=>x.s.week-y.s.week)[0]
    if(due){const ready=due.a.continuedScripts.find(r=>r.project.id===due.s.projectId)!.project,result=evaluate(ready)
      if(result.outcome==='viable'){rights=recordRivalScriptRejection(decisionState(),b.studioId,ready.id,0,week,false).rights;greenlight(ready,result)}
      else if(result.outcome==='economicRejection')rights=recordRivalScriptRejection(decisionState(),b.studioId,ready.id,0,week,true,true).rights
    }
  }
  // A bounded ready inventory, paid writers and enough actual runway precede a commission.
  if(b.costCutting.since!==null)return
  if(buyerScriptDevelopment(decisionState(),b.studioId).projects.length>=2){commissionStop='fullIndex';return}
  if(b.account.cash<operatingReserve(b,h,week))return
  if(week<b.screenplayShelving.commissionHoldUntilWeek){commissionStop='hold';return}
  const writer=employees.find(t=>t.role==='writer'&&!busy.has(t.id))
  if(!writer){commissionStop=employees.some(t=>t.role==='writer')?'busyWriter':'missingWriter';return}
  const ordinal=b.development.projects.length
  const chooser=stream(state.seed,'hollywood-v1',`${b.studioId}:package:${ordinal}`)
  let roll=chooser.next()*GENRE_ORDER.reduce((sum,g)=>sum+b.policy.affinities[g],0)
  const genre=GENRE_ORDER.find(g=>(roll-=b.policy.affinities[g])<0)??GENRE_ORDER[0]!
  const conceptId=uniqueIdentity(`${b.studioId}:concept:${ordinal}`,persistedConceptIds({...state,hollywood:h}))
  const concept=mintOriginalConcept(state.seed,conceptId,genre)
  let shape:FilmShape={opening:genre==='horror'?'mysteryHook':genre==='adventure'?'immediateAction':'slowSetup',
    midpoint:genre==='horror'?'revelation':'reversal',ending:genre==='drama'?'bittersweet':'triumph'}
  const expression=resolveShape(shape).expression
  const range=(n:number)=>[clamp(n-.35,-1,1),clamp(n+.35,-1,1)] as [number,number]
  let promise:ScriptProject['promise']={genre,intendedSegments:[genre==='comedy'?'family':genre==='horror'||genre==='adventure'?'youngAdult':'adult'],
    ranges:{intimacy:range(expression.intimacy),tonalWeight:range(expression.tonalWeight),kineticEnergy:range(expression.kineticEnergy)}}
  const director=employees.find(t=>t.role==='director')
  const cast=employees.filter(t=>t.role==='actor')
  const craft=employees.find(t=>t.role==='craft')
  if(!director||cast.length<3||!craft){commissionStop='missingTeam';return}
  const draftWeeks=scriptDraftWeeks({origin:'original',officeTierAtMint:'baseline',writerExperience:writingPaceExperience([writer],genre),writerCount:1})
  const writerTerms=currentEmployees(h,b.studioId).find(e=>e.terms.talentId===writer.id)!.terms
  // Work due at the term end completes before ordinary expiry. Later work needs a paid term
  // already in force; an open market case does not guarantee a future renewal.
  if(week+draftWeeks>writerTerms.endWeekExclusive)return
  const weeklyCost=rivalWeeklyOperatingCost(b,h,week)
  const reserve=weeklyCost*Math.max(b.policy.reserveWeeks,draftWeeks+TUNING.PRODUCTION_TICKS+1)
  const candidate=chooseIndustryPackage({concept,shape,shapeEffects:resolveShape(shape),promise,budget:{negative:concept.baseNegativeCost,marketing:0},
    writer,director,cast:{lead:cast[0]!,antagonist:cast[1]!,support:cast[2]!},craftHires:[craft],market:industryMarket(state.market),standing:b.standing,era:state.era},b.policy,
    {seed:state.seed,key:`${b.studioId}:screenplay:${ordinal}`,cashAvailable:b.account.cash-reserve,weeklyCost,lockScreenplay:false})
  if(!candidate){commissionStop='unaffordablePackage';return}
  shape=candidate.shape;promise=candidate.promise
  const hot=buyerScriptDevelopment(decisionState(),b.studioId)
  const next=commissionScriptProject(hot,buyerOperationsForAllWork(decisionState(),b.studioId),{conceptId,writerId:writer.id,shape,promise},week,new Set(),draftWeeks,canonicalScriptProjectId(ordinal))
  const project=next.projects[next.projects.length-1]!
  b.development={mode:'managed',projects:[...b.development.projects,project]}
  b.activeScriptOrdinals=[...b.activeScriptOrdinals,ordinal]
  b.projects=[...b.projects,{scriptProjectId:project.id,conceptId,conceptOrdinal:h.concepts.length,productionId:null,development:0,production:0,marketing:0,announcedWeek:null}]
  h.concepts=[...h.concepts,concept]
  commissioned=true
  }
  runDecision()
  // All ordinary early returns converge here. No scheduled decision means no entry.
  // A full index is proved by real retained ordinals and their evaluations this week.
  const outcomes=buyerScriptDevelopment(decisionState(),b.studioId).projects.map(p=>indexedOutcomes.get(continuedScriptOwner(decisionState(),p.id)?p.id:Number(p.id.slice(7))))
  const enters=rivalCostCuttingEntry({decisionRan:true,productionCount:operatedCount(),runCount:b.runs.length,
    greenlit,commissioned,hasScriptWork:buyerScriptDevelopment(decisionState(),b.studioId).projects.some(p=>p.status==='drafting'||p.status==='rewriting'),
    cash:b.account.cash,reserve:operatingReserve(b,h,week),commissionStop,...cashFacts,
    indexedOutcomes:outcomes.every((outcome):outcome is RivalCostCuttingEntryFacts['indexedOutcomes'][number]=>outcome!==undefined)?outcomes:[]})
  if(b.costCutting.since===null&&enters)b.costCutting={version:1,since:week}
  return rights
}

/** Each active run pays its installment due at input week `week` at its locked share; a final payment settles the
 * film at that week. One loop for an operating business and for a closed business's estate (P15B r3). */
function payRuns(h:HollywoodState,b:RivalBusiness,week:number) {
  const runs:typeof b.runs=[];const runOrdinals:number[]=[]
  if(b.runs.length>0)h.films=[...h.films]
  for(const [i,sourceRun] of b.runs.entries()) {
    const run={...sourceRun}
    const gross=run.weeklyGross[run.weekIndex]!
    const revenue=gross*run.studioShare
    run.cumulativeGrossPaid+=gross;run.cumulativeStudioRevenuePaid+=revenue;run.weekIndex++
    moveRivalMoney(b.account,'studioRevenue',revenue,week)
    const ordinal=b.activeRunFilmOrdinals[i]!
    const film=h.films[ordinal]!
    if(film.provenance!=='simulation/v1'||film.filmId!==run.productionId)throw new Error('Industry receipt owner mismatch')
    const settled=run.weekIndex>=run.totalWeeks
    h.films[ordinal]={...film,studioRevenueReceived:run.cumulativeStudioRevenuePaid,settledWeek:settled?week:null}
    if(settled)appendReceipt(h,{week,studioId:b.studioId,kind:'filmSettled',productionId:run.productionId})
    else {runs.push(run);runOrdinals.push(ordinal)}
  }
  b.runs=runs;b.activeRunFilmOrdinals=runOrdinals
}

/** P15A.1 Wave 2 (1355-A §3.1 item 5): the frozen batch's rival members must be exactly the rival
 * pictures at remainingTicks 1 when the week starts (fact 8). Returns each studio's due ids in
 * release order. A missing or unknown member throws before any work, so the input is untouched. */
function frozenRivalMembers(state:GameState,factorById:ReadonlyMap<string,number>,closed:ReadonlyMap<string,number>):Map<string,string[]> {
  const due=new Map<string,string[]>()
  for(const b of state.hollywood?.businesses??[]) {
    if(closed.has(b.studioId))continue // P15B closure/v1 (r3): a closed business releases nothing (marketIntegration.runMarketBatch)
    const ids=buyerOperatedProductions(state,b.studioId).filter(p=>p.remainingTicks===1).map(p=>p.id).sort()
    if(ids.length>0)due.set(b.studioId,ids)
  }
  const all=new Set([...due.values()].flat())
  const missing=[...all].filter(id=>!factorById.has(id)).sort()
  const unknown=[...factorById.keys()].filter(id=>!all.has(id)).sort()
  if(missing.length>0||unknown.length>0)throw new Error(`shared market: the frozen batch disagrees with the rival due set: missing [${missing.join(', ')}], unknown [${unknown.join(', ')}]`)
  return due
}

/** Stage rival work against pre-development talent. All writes are to new local objects.
 * P15A.1 Wave 2 (1355-A §3.1-3.2): `factorById` carries the frozen shared-market factor of each rival
 * release, witnessed against the due set and each studio's releases; absent, every rival release
 * takes today's path. */
/** One actual creator-paid reception/release producer, shared by normal rivals and buyer-operated work. */
function publishCreatorRelease(state:GameState,h:HollywoodState,b:RivalBusiness,p:Production,talent:Talent[],week:number,receptionStanding:Standing,factorById?:ReadonlyMap<string,number>) {
  const people=new Map(talent.map(t=>[t.id,t]))
  const project=hotDevelopment(b).projects.find(s=>s.productionId===p.id)??carriedScriptForProduction({...state,hollywood:h},p.id)!
  const inp=inputsFor(state,h,{...b,standing:receptionStanding},p,project,people)
  // P15A.1 Wave 2 (1355-A §3.2): the rival release site of the seam.
  const factor=factorById?.get(p.id)
  const result=resolveReception(factor===undefined?inp:{...inp,competitionFactor:factor},stream(state.seed,'hollywood-v1',`${p.id}:reception`),true,true,stream(state.seed,'discovery-v1',p.id).gaussian(0,1))
  const base=buildFilmResult(result,{productionId:p.id,releaseTick:week,conceptId:p.conceptId,directorId:p.directorId})
  const filmResult={...base,participants:p.participants!,forecast:{expectedCriticScore:p.forecastSnapshot.expectedCriticScore,expectedTotal:p.forecastSnapshot.expectedTotal,expectedOpening:p.forecastSnapshot.expectedOpening}}
  const cost=rivalCarriedSource({...state,hollywood:h},b.studioId,project)?.cost??b.projects[Number(project.id.slice(7))]!
  const film:LiveIndustryFilm={filmId:p.id,studioId:b.studioId,conceptId:p.conceptId,title:inp.concept.title,genre:inp.concept.genre,
    credits:flattenParticipants(p.participants!).map(c=>({talentId:c.talentId,name:c.name,role:c.role})),provenance:'simulation/v1',
    scriptProjectId:project.id,result:filmResult,directCommitment:cost.development+cost.production+cost.marketing,
    studioRevenueReceived:0,settledWeek:null,releaseCommitmentId:`release-commitment-${p.id}`}
  b.activeRunFilmOrdinals=[...b.activeRunFilmOrdinals,h.films.length]
  h.films=[...h.films,film]
  b.runs=[...b.runs,openTheatricalRun(filmResult,base.boxOffice.opening,base.boxOffice.opening>0?base.boxOffice.total/base.boxOffice.opening:1,week)]

  const ctx:StandingContext={castFames:{lead:inp.cast.lead.fame,antagonist:inp.cast.antagonist.fame,support:inp.cast.support.fame},
    actualNegative:p.budget.negative,requiredNegative:result.requiredNegative,baseMarketValue:state.market.baseMarketValue,marketing:p.budget.marketing,
    salaries:inp.writer.salary+inp.director.salary+inp.cast.lead.salary+inp.cast.antagonist.salary+inp.cast.support.salary,engaged:true}
  const growth:ReleaseGrowthRecord={filmResult,develop:{productionId:p.id,performers:flattenParticipants(p.participants!).map(c=>({talentId:c.talentId,discipline:c.discipline})),ctx:{concept:inp.concept,shape:p.shape,shapeEffects:inp.shapeEffects,promise:p.promise,requiredNegative:result.requiredNegative,criticScore:result.criticScore}},broadcast:{weightedAudienceScore:result.weightedAudienceScore}}
  const carried=continuedScriptOwner(state,project.id)
  if(!carried)storeHotDevelopment(b,markScriptProjectProduced(hotDevelopment(b),p.id))
  const rights=carried?markCarriedScriptProduced({...state,hollywood:h},p.id,week).rights:state.rights
  return {filmResult,ctx,growth,rights}
}

/** Actual continued receptions at the reception boundary. Standing is applied by the ONE
 * buyer ordered Standing loop; no public state is published between reception and that update. */
export function prepareContinuedReleases(state:GameState,productions:readonly Production[],receptionStanding:Standing,factors?:ReadonlyMap<string,number>) {
  const source=state.hollywood
  const growth:ReleaseGrowthRecord[]=[]
  const records:{filmResult:ReturnType<typeof publishCreatorRelease>['filmResult'];benchmarks:import('./standing.js').ReleaseBenchmarks;ctx:StandingContext}[]=[]
  if(!source || productions.length===0)return {hollywood:source,rights:state.rights,growth,records}
  const h:HollywoodState={...source,businesses:source.businesses.map(b=>({...b}))}
  let rights=state.rights
  for(const p of productions) {
    const owner=rights.absorptions.find(a=>a.buyerId===h.playerStudioId && a.continuedProductions.some(r=>r.productionId===p.id))
    if(!owner || p.remainingTicks!==0 || owner.workReleases.some(r=>r.productionId===p.id))throw new Error('continued work: unknown/unready/replayed reception')
    const b=h.businesses.find(b=>b.studioId===owner.targetId)!
    const released=publishCreatorRelease(state,h,b,p,state.talent,state.market.tick,receptionStanding,factors)
    const benchmarks={expectedOpening:p.forecastSnapshot.expectedOpening,expectedTotal:p.forecastSnapshot.expectedTotal,expectedCriticScore:p.forecastSnapshot.expectedCriticScore}
    const observation={productionId:p.id,week:state.market.tick,titleEventId:null,standingBefore:cloneStanding(receptionStanding),standingAfter:cloneStanding(receptionStanding),standingContext:structuredClone(released.ctx),benchmarks}
    rights={...rights,absorptions:rights.absorptions.map(a=>a.id===owner.id?{...a,workReleases:[...a.workReleases,observation],runs:[...a.runs,{productionId:p.id,beneficiaryFromWeek:state.market.tick,startingWeekIndex:0,grossPaidBeforeClose:0,revenuePaidBeforeClose:0}],buyerWorkflows:a.buyerWorkflows.filter(w=>w.productionId!==p.id)}:a)}
    appendReceipt(h,{week:state.market.tick,studioId:b.studioId,kind:'filmReleased',productionId:p.id,conceptId:p.conceptId,before:cloneStanding(b.standing),after:cloneStanding(b.standing)})
    b.productions=b.productions.filter(row=>row.id!==p.id)
    b.releaseAuthority=pruneReleasedCommitments(b.releaseAuthority,new Set([p.id]))
    growth.push(released.growth);records.push({filmResult:released.filmResult,benchmarks,ctx:released.ctx})
  }
  return {hollywood:h,rights,growth,records}
}

export function advanceHollywoodWeek(state:GameState,factorById?:ReadonlyMap<string,number>):{hollywood:HollywoodState|null;talent:Talent[];growth:ReleaseGrowthRecord[];technology:GameState['technology'];physicalPlans:GameState['physicalPlans'];
  /** P14B.1 (1): this week's rival first takes (the 5 -> 4 advance), handed to
   * the outer tick so the ONE first-take root is appended in one place. */
  firstTakes:{studioId:string;production:Production}[];
  greenlights:{studioId:string;production:Production}[];
  /** P14C.1: the people `staff()` actually APPENDED this week (a mint the rival could
   * not afford is discarded and is not here), each carrying its EXACT entry age, handed
   * to the outer tick so provenance is written with the same commit that carries them. */
  suppliedTalent:{id:string;age:number}[];
  rights:GameState['rights'];absorbedRunRevenue:LedgerEntry[]} {
  const source=state.hollywood
  // P15B Wave 4 (closure/v1): an actually closed business is terminal history (operatingState.closedWeekOf).
  const closed=closedWeekOf(state)
  const absorbed=absorbedWeekOf(state)
  const frozen=factorById===undefined?null:frozenRivalMembers(state,factorById,terminalWeekOf(state))
  if(!source)return {hollywood:null,talent:state.talent,growth:[],technology:state.technology,physicalPlans:state.physicalPlans,firstTakes:[],greenlights:[],suppliedTalent:[],rights:state.rights,absorbedRunRevenue:[]}
  const week=state.market.tick
  const h:HollywoodState={...source,businesses:source.businesses.map(b=>({...b,account:{...b.account,
    periods:b.account.periods.map((p,i)=>i===b.account.periods.length-1?{...p,movements:{...p.movements}}:p)}}))}
  let talent=state.talent
  let technology=state.technology
  let physicalPlans=state.physicalPlans
  let rights=state.rights
  const absorbedRunRevenue:LedgerEntry[]=[]
  const rivalRunRevenue:ReturnType<typeof advanceAbsorbedRuns>['rivalRevenue']=[]
  const growth:ReleaseGrowthRecord[]=[]
  const firstTakes:{studioId:string;production:Production}[]=[]
  const greenlights:{studioId:string;production:Production}[]=[]
  const suppliedTalent:{id:string;age:number}[]=[]
  const working=():GameState=>({...state,hollywood:h,rights,technology,physicalPlans,talent})
  // Validate input bodies before any buyer can advance/release their source. Actual
  // run service waits until every native policy/release has completed below.
  for(const sourceBusiness of source.businesses)if(absorbed.has(sourceBusiness.studioId)) {
    const transaction=state.rights.absorptions.find(a=>a.targetId===sourceBusiness.studioId)!
    validateAbsorbedProductionStops(state,sourceBusiness,transaction)
    validateAbsorbedScripts(state,sourceBusiness,transaction)
  }
  for(const b of h.businesses) {
    if(absorbed.has(b.studioId))continue
    if(closed.has(b.studioId)){payRuns(h,b,week);continue}
    const cashFacts:StaffingCashFacts={unfilledFilmSlotForCash:false,renewalRefusedForCash:false,unrelatedScientistSlotRefusedForCash:false}
    technology=considerRivalSoundPurchase(working(),h,{...b,operations:buyerOperationsForAllWork(working(),b.studioId)})
    if(week>=b.nextDecisionWeek)talent=staff(working(),h,b,talent,week,
      Array.from({length:rivalScientistDemand({...state,technology,physicalPlans,hollywood:h},h,b,talent,week)},()=>'scientist' as const),suppliedTalent,cashFacts)
    // P13B-S8 (audit item 7): this studio's own physical admission and research
    // week, after its hiring and before it commissions a film — its capital and
    // its research bill are spent from the same account the film draws on.
    physicalPlans=admitRivalPlansInWeek({...state,technology,physicalPlans,hollywood:h,talent},h,b,physicalPlans,week)
    technology=advanceRivalResearch({...state,technology,physicalPlans,hollywood:h,talent},h,b,talent,week)
    rights=decide(working(),h,b,talent,week,greenlights,cashFacts)
    // Shared disposal law returns an atomic copy; adopt only its four changed
    // fields into this tick's owned clones. No second staff/decision pass spends
    // the refund, and the removed body pays no opex for the current week.
    const disposed=disposeEligibleRivalFacilities({...state,technology,physicalPlans,hollywood:h,talent},b.studioId)
    if(disposed.hollywood!==h) {
      const result=disposed.hollywood!
      const owner=result.businesses.find(row=>row.studioId===b.studioId)!
      b.account=owner.account;b.operations=owner.operations
      h.receipts=result.receipts;h.nextReceipt=result.nextReceipt
    }
    // Work is allocated once against this actual rival registry. Foreign paid
    // productions stay in their creator bodies; only their buyer workflows join.
    const beforeWork:GameState={...working(),hollywood:{...h,businesses:h.businesses.map(row=>({...row}))}}
    const operated=buyerOperatedProductions(beforeWork,b.studioId)
    const operations=buyerOperationsForAllWork(beforeWork,b.studioId)
    if(buyerContinuedProductions(beforeWork,b.studioId).length>0 && operated.length>1)throw new Error('continued work: rival one-production operation violated')
    const stageView={...b,productions:operated,operations}
    operateStage(stageView)
    for(const p of operated) {
      const transaction=rights.absorptions.find(a=>a.buyerId===b.studioId && a.continuedProductions.some(row=>row.productionId===p.id))
      const authority=transaction?h.businesses.find(row=>row.studioId===transaction.targetId)!:b
      if(releaseCommitmentRefusal({productions:operated,operations:stageView.operations,releaseAuthority:authority.releaseAuthority,concepts:[]},p.id)===null)
        authority.releaseAuthority=withReleaseCommitment(authority.releaseAuthority,p.id,week)
    }
    technology=selectRivalSoundProduction(technology,b)
    const productionTechnology=createProductionTechnologyPolicy({...working(),technology},b.studioId)
    const committed=new Set([...committedReleaseIds(b.releaseAuthority),...continuedCommittedReleaseIds(working(),b.studioId)])
    const advanced=advanceManagedProductions(stageView.operations,operated,week,committed,new Set([...scriptOccupiedFacilitySlots(buyerScriptDevelopment(working(),b.studioId)),...rivalInstallationSlots(technology,b)]),undefined,undefined,productionTechnology.policy)
    technology=productionTechnology.technology()
    for(const production of advanced.firstTakes)firstTakes.push({studioId:b.studioId,production})
    const releasing=advanced.productions.filter(p=>p.remainingTicks===0).sort((a,b)=>a.id<b.id?-1:a.id>b.id?1:0)
    const ids=new Set(releasing.map(p=>p.id))
    if(ids.size!==advanced.admittedReleaseIds.length||advanced.admittedReleaseIds.some(id=>!ids.has(id)))throw new Error('Industry release admission mismatch')
    const members=frozen?.get(b.studioId)??[]
    if(frozen!==null&&(members.length!==releasing.length||releasing.some((p,i)=>p.id!==members[i])))throw new Error(`shared market: ${b.studioId} releases [${releasing.map(p=>p.id).join(', ')}] but its frozen batch members are [${members.join(', ')}]`)
    const published=publishOperatedAdvance(beforeWork,advanced.productions,advanced.operations,b.studioId)
    rights=recordContinuedWorkSteps(beforeWork,published,week,b.studioId).rights
    // Adopt only the split native/source work fields into the existing owned
    // business objects, preserving the loop's actual object identities.
    for(const update of published.hollywood!.businesses) {
      const actual=h.businesses.find(row=>row.studioId===update.studioId)!
      actual.operations=update.operations;actual.productions=update.productions
    }
    const startStanding=b.standing
    for(const p of releasing) {
      const transaction=rights.absorptions.find(a=>a.buyerId===b.studioId && a.continuedProductions.some(row=>row.productionId===p.id))
      const creator=transaction?h.businesses.find(row=>row.studioId===transaction.targetId)!:b
      const released=publishCreatorRelease(working(),h,creator,p,talent,week,startStanding,factorById)
      rights=released.rights
      const before=b.standing
      b.standing=updateStanding(before,released.filmResult,p.forecastSnapshot,released.ctx)
      if(transaction) {
        const observation={productionId:p.id,week,titleEventId:null,standingBefore:cloneStanding(before),standingAfter:cloneStanding(b.standing),standingContext:structuredClone(released.ctx),
          benchmarks:{expectedOpening:p.forecastSnapshot.expectedOpening,expectedTotal:p.forecastSnapshot.expectedTotal,expectedCriticScore:p.forecastSnapshot.expectedCriticScore}}
        rights={...rights,absorptions:rights.absorptions.map(a=>a.id!==transaction.id?a:{...a,workReleases:[...a.workReleases,observation],
          runs:[...a.runs,{productionId:p.id,beneficiaryFromWeek:week,startingWeekIndex:0,grossPaidBeforeClose:0,revenuePaidBeforeClose:0}],buyerWorkflows:a.buyerWorkflows.filter(w=>w.productionId!==p.id)})}
        // One creator event; the buyer's actual Standing proof lives in the
        // joined workRelease, never a fabricated player history/second film row.
        appendReceipt(h,{week,studioId:creator.studioId,kind:'filmReleased',productionId:p.id,conceptId:p.conceptId,before:cloneStanding(creator.standing),after:cloneStanding(creator.standing)})
        creator.productions=creator.productions.filter(row=>row.id!==p.id)
        creator.releaseAuthority=pruneReleasedCommitments(creator.releaseAuthority,new Set([p.id]))
      } else appendReceipt(h,{week,studioId:b.studioId,kind:'filmReleased',productionId:p.id,conceptId:p.conceptId,before,after:b.standing})
      growth.push(released.growth)
    }
    b.productions=b.productions.filter(p=>p.remainingTicks>0)
    b.releaseAuthority=pruneReleasedCommitments(b.releaseAuthority,ids)
    payRuns(h,b,week)
    const excess=Math.max(0,b.standing.audienceAwareness-TUNING.AWARENESS_DRIFT_ANCHOR)
    if(excess>0)b.standing={...b.standing,audienceAwareness:clamp(b.standing.audienceAwareness-TUNING.AWARENESS_DRIFT_RATE*excess,0,100)}
    const employees=currentEmployees(h,b.studioId)
    moveRivalMoney(b.account,'payroll',-employees.reduce((sum,e)=>sum+weeklySalary(e.terms.annualSalary),0),week)
    moveRivalMoney(b.account,'overhead',-(TUNING.OVERHEAD_BASE+TUNING.OVERHEAD_PER_EMPLOYEE*employees.length),week)
    moveRivalMoney(b.account,'facilityOpex',-rivalCapacityOpex(b,h.receipts),week)
    // P15B Wave 2 (1357-A §5-§6.3): the installment due this week follows facility opex, whatever the
    // cash; no movement when none is due. The loans root is read from the input state: the step that
    // writes it runs after this one.
    const installment=loanInstallmentDueFor(state,b.studioId,week)
    if(installment>0)moveRivalMoney(b.account,'loanInstallment',-installment,week)
    const advancedWriting=advanceBuyerScriptWork(working(),week+1,0,b.studioId)
    rights=advancedWriting.state.rights
    let complete=advancedWriting.development
    for(const project of complete.projects)if(project.status==='review')complete=acceptScriptProject(complete,project.id)
    storeHotDevelopment(b,complete)
    rights=acceptRivalContinuedReviews(working(),b.studioId,week+1).rights
  }
  // Every source (including one that precedes its buyer in array order) now
  // sees the fresh actual workRelease and new week-zero run. Service exactly
  // once, after all policies; recipient cash is flushed only after this pass.
  for(const sourceBusiness of h.businesses)if(absorbed.has(sourceBusiness.studioId)) {
    const transaction=rights.absorptions.find(a=>a.targetId===sourceBusiness.studioId)!
    const runAdvance=advanceAbsorbedRuns(working(),h,sourceBusiness,transaction,week)
    rights=runAdvance.rights;absorbedRunRevenue.push(...runAdvance.ledger);rivalRunRevenue.push(...runAdvance.rivalRevenue)
  }
  // Assigned income, like native payRuns, is unavailable to this week's policy. Flush
  // after every business so source array order cannot advance a buyer's spending power.
  // A closed recipient retains its actual terminal account; the closure phase journals
  // and distributes this same due installment through its canonical estate run owner.
  for(const payment of rivalRunRevenue) {
    const buyer=h.businesses.find(b=>b.studioId===payment.buyerId)
    const owners=rights.absorptions.filter(a=>a.buyerId===payment.buyerId).flatMap(a=>a.runReceipts.filter(r=>r.id===payment.receiptId))
    if(!buyer || payment.week!==week || owners.length!==1 || owners[0]!.week!==week || owners[0]!.revenue!==payment.amount)throw new Error('absorption run: missing actual rival cash instruction owner')
    moveRivalMoney(buyer.account,'studioRevenue',payment.amount,week)
  }
  return {hollywood:h,talent,growth,technology,physicalPlans,firstTakes,greenlights,suppliedTalent,rights,absorbedRunRevenue}
}

/** End-of-week expiry follows payroll; future entrants are attached by the outer tick. */
export function finishHollywoodWeek(state:GameState):GameState {
  const source=state.hollywood;if(!source)return state
  const week=state.market.tick
  const expired=source.activeEmploymentOrdinals.filter(i=>source.employment[i]!.terms.endWeekExclusive<=week)
  let h=source
  if(expired.length>0) {
    h={...h,employment:[...h.employment],activeEmploymentOrdinals:h.activeEmploymentOrdinals.filter(i=>!expired.includes(i))}
    for(const i of expired) {
      const e=h.employment[i]!
      h.employment[i]={...e,endedWeek:week}
      appendReceipt(h,{week,studioId:e.studioId,kind:'employment',talentId:e.terms.talentId,fromStudioId:e.studioId,toStudioId:null,contractId:e.contractId,reason:'expiry'})
    }
  }
  if(week%13===0||h.chart===null) {
    const rows=h.identities.filter(s=>s.enteredWeek!==null).map(s=>{
      const b=h.businesses.find(b=>b.studioId===s.studioId)
      return {studioId:s.studioId,standing:{...(b?.standing??state.studio.standing)},
        output:b?h.films.filter(f=>f.studioId===s.studioId&&(f.provenance==='authored-start/v1'||f.result.releaseTick<week)).length:state.studio.releasedFilms.length}
    })
    h={...h,previousChart:h.chart,chart:{week,rows}}
  }
  // R3 (1305-F amendment 1): a rival's early release in the week just advanced (the
  // pre-increment week `staff()` ran in) frees the person in the same pass, read from
  // that week's own termination end receipts.
  const released:string[]=[]
  for(let i=source.receipts.length-1;i>=0&&source.receipts[i]!.week>=week-1;i--) {
    const r=source.receipts[i]!
    if(r.week===week-1&&r.kind==='employment'&&r.reason==='termination'&&r.studioId!==source.playerStudioId)released.push(r.talentId)
  }
  const freeAgents=expired.length+released.length>0?[...new Set([...state.freeAgents,...expired.map(i=>h.employment[i]!.terms.talentId),...released])]:state.freeAgents
  let next:GameState=h===source&&freeAgents===state.freeAgents?state:{...state,hollywood:h,freeAgents}
  // P13B-S8: a Scientist whose contract ended holds no seat that can work — the
  // same pause law the player's own release runs, for that studio's own project.
  for(const i of expired) {
    const e=h.employment[i]!
    if(e.studioId===h.playerStudioId)continue
    next={...next,technology:researchAfterEmploymentRelease(next,e.terms.talentId,e.studioId)}
  }
  // Plans that finished their authored build weeks become this studio's plant, on
  // the week that has ARRIVED — the boundary a rival adoption's own clock uses.
  return completeRivalPlans(next)
}
