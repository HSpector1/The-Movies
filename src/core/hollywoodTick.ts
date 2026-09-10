import {chooseIndustryPackage} from './hollywoodPolicy.js'
import { busyTalentIds, offerForTalent, weeklySalary } from './employment.js'
import { moveRivalMoney, rivalCapacityOpex, rivalWeeklyOperatingCost, uniqueIdentity } from './hollywood.js'
import { RIVAL_TEAM_ROLES } from './hollywoodStartingData.js'
import { buildFilmParticipants } from './filmParticipants.js'
import { computeForecast } from './forecast.js'
import { mintOriginalConcept, scriptDraftWeeks, writingPaceExperience } from './screenplay.js'
import { acceptScriptProject, canonicalScriptProjectId, commissionScriptProject, completeDueScriptWork,
  linkScriptProjectToProduction, markScriptProjectProduced, scriptOccupiedFacilitySlots } from './scriptDevelopment.js'
import { addManagedProductionWorkflow, advanceManagedProductions, assignShootingDirector,
  clearSceneryLoadIn, scheduleShootingTake } from './operations.js'
import { releaseCommitmentRefusal, withReleaseCommitment, committedReleaseIds, pruneReleasedCommitments } from './releaseAuthority.js'
import { persistedConceptIds, persistedProductionIds } from './productionIdentity.js'
import { resolveShape } from './shape.js'
import { stream } from './rng.js'
import { buildFilmResult, resolveReception, type ReceptionInputs } from './reception.js'
import { openTheatricalRun } from './economy.js'
import { updateStanding } from './standing.js'
import { flattenParticipants } from './starPower.js'
import { generateIndustryTalent } from './worldgen.js'
import { GENRE_ORDER, TUNING } from './tuning.js'
import { clamp } from './math.js'
import type { ReleaseGrowthRecord } from './releaseCareers.js'
import type { GameState, Talent, FilmShape, Production, ScriptDevelopment, ScriptProject } from './types.js'
import type { HollywoodState, IndustryReceipt, LiveIndustryFilm, RivalBusiness } from './hollywoodTypes.js'

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
  const cost=b.projects[Number(project.id.slice(7))]!
  const concept=h.concepts[cost.conceptOrdinal]!
  if(concept.id!==p.conceptId)throw new Error('Industry concept index lost identity')
  return {concept,shape:p.shape,shapeEffects:resolveShape(p.shape),promise:p.promise,budget:p.budget,
    ...partsFor(p,talent),market:state.market,standing:b.standing,era:state.era,
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

/** Fill only actual role deficits. Existing lawful employees are preferred; no player poaching. */
function staff(state:GameState,h:HollywoodState,b:RivalBusiness,talent:Talent[],week:number):Talent[] {
  const occupied=busyTalentIds({...state,hollywood:h,talent})
  const unavailable=new Set([...occupied,...state.contracts.map(c=>c.talentId),...(state.founding?.applicantIds??[])])
  for(const e of h.activeEmploymentOrdinals.map(i=>h.employment[i]!))unavailable.add(e.terms.talentId)
  const own=currentEmployees(h,b.studioId)
  const filled=new Set<string>()
  let next=talent
  for(const [slot,role] of RIVAL_TEAM_ROLES.entries()) {
    const retained=own.find(e=>!filled.has(e.terms.talentId)&&next.find(t=>t.id===e.terms.talentId)?.role===role)
    if(retained){filled.add(retained.terms.talentId);continue}
    const expired=[...h.employment].reverse().find(e=>e.studioId===b.studioId && next.find(t=>t.id===e.terms.talentId)?.role===role && !filled.has(e.terms.talentId))
    let person=expired&&!unavailable.has(expired.terms.talentId)?next.find(t=>t.id===expired.terms.talentId):undefined
    person ??= next.find(t=>t.role===role&&!unavailable.has(t.id))
    let supplied=false
    if(!person) {
      const id=uniqueIdentity(`person-${b.studioId}-supply-${week}-${slot}`,new Set(next.map(t=>t.id)))
      person=generateIndustryTalent(state.seed,id,role);supplied=true
    }
    const terms=offerForTalent(state.seed,person,TUNING.HOLLYWOOD_CONTRACT_WEEKS,week)
    if(b.account.cash-terms.signingBonus < operatingReserve(b,h,week))continue
    if(supplied)next=[...next,person]
    const reason=expired?.terms.talentId===person.id?'renewal':'replacement'
    const contractId=`${b.studioId}:contract:${person.id}:${week}`
    h.activeEmploymentOrdinals=[...h.activeEmploymentOrdinals,h.employment.length]
    h.employment=[...h.employment,{contractId,studioId:b.studioId,terms,endedWeek:null,reason}]
    moveRivalMoney(b.account,'signing',-terms.signingBonus,week)
    appendReceipt(h,{week,studioId:b.studioId,kind:'employment',talentId:person.id,fromStudioId:null,toStudioId:b.studioId,contractId,reason})
    unavailable.add(person.id);filled.add(person.id)
  }
  return next
}

function decide(state:GameState,h:HollywoodState,b:RivalBusiness,talent:Talent[],week:number) {
  if(week<b.nextDecisionWeek)return
  b.nextDecisionWeek=week+TUNING.HOLLYWOOD_DECISION_WEEKS
  const busy=busyTalentIds({...state,hollywood:h,talent})
  const people=new Map(talent.map(t=>[t.id,t]))
  const employees=currentEmployees(h,b.studioId).map(e=>people.get(e.terms.talentId)!)
  const ready=hotDevelopment(b).projects.find(p=>p.status==='ready')
  if(ready&&b.productions.length===0) {
    const director=employees.find(t=>t.role==='director'&&!busy.has(t.id))
    const actors=employees.filter(t=>t.role==='actor'&&!busy.has(t.id)).slice(0,3)
    const craft=employees.find(t=>t.role==='craft'&&!busy.has(t.id))
    if(director&&actors.length===3&&craft) {
      const cost=b.projects[Number(ready.id.slice(7))]!
      const concept=h.concepts[cost.conceptOrdinal]!
      const provisional={conceptId:concept.id,shape:ready.shape,promise:ready.promise,budget:{negative:concept.baseNegativeCost,marketing:0},writerId:ready.writerId,
        directorId:director.id,cast:{lead:actors[0]!.id,antagonist:actors[1]!.id,support:actors[2]!.id},craftIds:[craft.id]}
      const candidate=chooseIndustryPackage(inputsFor(state,h,b,provisional,ready,people),b.policy,{seed:state.seed,key:`${b.studioId}:package:${ready.id}`,
        cashAvailable:b.account.cash-operatingReserve(b,h,week),weeklyCost:rivalWeeklyOperatingCost(b,h,week),lockScreenplay:true})
      if(candidate) {
        const {negative,marketing}=candidate.budget
        const id=uniqueIdentity(`${b.studioId}:film:${Number(ready.id.slice(7))}`,persistedProductionIds({...state,hollywood:h}))
        const choices={...provisional,budget:candidate.budget,cast:candidate.cast}
        const inp=inputsFor(state,h,b,choices,ready,people)
        const ownerFilms=h.films.flatMap(f=>f.studioId===b.studioId&&f.provenance==='simulation/v1'?[f.result]:[])
        const directorCredits=h.films.flatMap(f=>{const d=f.credits.find(c=>c.role==='director');return d?[{directorId:d.talentId,genre:f.genre}]:[]})
        for(const f of state.studio.releasedFilms){const c=state.concepts.find(c=>c.id===f.conceptId);if(c)directorCredits.push({directorId:f.directorId,genre:c.genre})}
        const forecastSnapshot=computeForecast(inp,{seed:state.seed,productionId:id,directorId:director.id,
          releasedFilms:ownerFilms,concepts:h.concepts,directorCredits},true,true)
        const production:Production={...choices,id,startTick:week,remainingTicks:TUNING.PRODUCTION_TICKS,forecastSnapshot,
          participants:buildFilmParticipants(id=>employees.some(t=>t.id===id),inp,concept,inp.shapeEffects,ready.promise,ready.shape)}
        const operations=addManagedProductionWorkflow(b.operations,production,scriptOccupiedFacilitySlots(hotDevelopment(b)))
        const development=linkScriptProjectToProduction(hotDevelopment(b),ready.id,id)
        b.operations=operations;b.productions=[...b.productions,production];storeHotDevelopment(b,development)
        moveRivalMoney(b.account,'production',-negative,week);moveRivalMoney(b.account,'marketing',-marketing,week)
        b.projects=[...b.projects];b.projects[Number(ready.id.slice(7))]={...cost,productionId:id,production:negative,marketing,announcedWeek:week}
        appendReceipt(h,{week,studioId:b.studioId,kind:'filmAnnounced',productionId:id,conceptId:concept.id})
      }
    }
  }
  // A bounded ready inventory, paid writers and enough actual runway precede a commission.
  if(b.activeScriptOrdinals.length>=2||b.account.cash<operatingReserve(b,h,week))return
  const writer=employees.find(t=>t.role==='writer'&&!busy.has(t.id))
  if(!writer)return
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
  if(!director||cast.length<3||!craft)return
  const candidate=chooseIndustryPackage({concept,shape,shapeEffects:resolveShape(shape),promise,budget:{negative:concept.baseNegativeCost,marketing:0},
    writer,director,cast:{lead:cast[0]!,antagonist:cast[1]!,support:cast[2]!},craftHires:[craft],market:state.market,standing:b.standing,era:state.era},b.policy,
    {seed:state.seed,key:`${b.studioId}:screenplay:${ordinal}`,cashAvailable:b.account.cash-operatingReserve(b,h,week),weeklyCost:rivalWeeklyOperatingCost(b,h,week),lockScreenplay:false})
  if(!candidate)return
  shape=candidate.shape;promise=candidate.promise
  const draftWeeks=scriptDraftWeeks({origin:'original',officeTierAtMint:'baseline',writerExperience:writingPaceExperience([writer],genre),writerCount:1})
  const hot=hotDevelopment(b)
  const next=commissionScriptProject(hot,b.operations,{conceptId,writerId:writer.id,shape,promise},week,new Set(),draftWeeks,canonicalScriptProjectId(ordinal))
  const project=next.projects[next.projects.length-1]!
  b.development={mode:'managed',projects:[...b.development.projects,project]}
  b.activeScriptOrdinals=[...b.activeScriptOrdinals,ordinal]
  b.projects=[...b.projects,{scriptProjectId:project.id,conceptId,conceptOrdinal:h.concepts.length,productionId:null,development:0,production:0,marketing:0,announcedWeek:null}]
  h.concepts=[...h.concepts,concept]
}

/** Stage rival work against pre-development talent. All writes are to new local objects. */
export function advanceHollywoodWeek(state:GameState):{hollywood:HollywoodState|null;talent:Talent[];growth:ReleaseGrowthRecord[]} {
  const source=state.hollywood
  if(!source)return {hollywood:null,talent:state.talent,growth:[]}
  const week=state.market.tick
  const h:HollywoodState={...source,businesses:source.businesses.map(b=>({...b,account:{...b.account,
    periods:b.account.periods.map((p,i)=>i===b.account.periods.length-1?{...p,movements:{...p.movements}}:p)}}))}
  let talent=state.talent
  const growth:ReleaseGrowthRecord[]=[]
  for(const b of h.businesses) {
    if(week>=b.nextDecisionWeek)talent=staff(state,h,b,talent,week)
    decide(state,h,b,talent,week)
    operateStage(b)
    for(const p of b.productions) if(releaseCommitmentRefusal({productions:b.productions,operations:b.operations,releaseAuthority:b.releaseAuthority,concepts:[]},p.id)===null) {
      b.releaseAuthority=withReleaseCommitment(b.releaseAuthority,p.id,week)
    }
    const advanced=advanceManagedProductions(b.operations,b.productions,week,committedReleaseIds(b.releaseAuthority),scriptOccupiedFacilitySlots(hotDevelopment(b)))
    const releasing=advanced.productions.filter(p=>p.remainingTicks===0).sort((a,b)=>a.id<b.id?-1:a.id>b.id?1:0)
    const ids=new Set(releasing.map(p=>p.id))
    if(ids.size!==advanced.admittedReleaseIds.length||advanced.admittedReleaseIds.some(id=>!ids.has(id)))throw new Error('Industry release admission mismatch')
    b.operations=advanced.operations;b.productions=advanced.productions.filter(p=>p.remainingTicks>0)
    const people=new Map(talent.map(t=>[t.id,t]))
    const startStanding=b.standing
    for(const p of releasing) {
      const project=hotDevelopment(b).projects.find(s=>s.productionId===p.id)!
      const inp=inputsFor(state,h,{...b,standing:startStanding},p,project,people)
      const result=resolveReception(inp,stream(state.seed,'hollywood-v1',`${p.id}:reception`),true,true,stream(state.seed,'discovery-v1',p.id).gaussian(0,1))
      const base=buildFilmResult(result,{productionId:p.id,releaseTick:week,conceptId:p.conceptId,directorId:p.directorId})
      const filmResult={...base,participants:p.participants!,forecast:{expectedCriticScore:p.forecastSnapshot.expectedCriticScore,expectedTotal:p.forecastSnapshot.expectedTotal,expectedOpening:p.forecastSnapshot.expectedOpening}}
      const cost=b.projects[Number(project.id.slice(7))]!
      const film:LiveIndustryFilm={filmId:p.id,studioId:b.studioId,conceptId:p.conceptId,title:inp.concept.title,genre:inp.concept.genre,
        credits:flattenParticipants(p.participants!).map(c=>({talentId:c.talentId,name:c.name,role:c.role})),provenance:'simulation/v1',
        scriptProjectId:project.id,result:filmResult,directCommitment:cost.development+cost.production+cost.marketing,
        studioRevenueReceived:0,settledWeek:null,releaseCommitmentId:`release-commitment-${p.id}`}
      b.activeRunFilmOrdinals=[...b.activeRunFilmOrdinals,h.films.length]
      h.films=[...h.films,film]
      b.runs=[...b.runs,openTheatricalRun(filmResult,base.boxOffice.opening,base.boxOffice.opening>0?base.boxOffice.total/base.boxOffice.opening:1,week)]
      const before=b.standing
      b.standing=updateStanding(before,filmResult,p.forecastSnapshot,{castFames:{lead:inp.cast.lead.fame,antagonist:inp.cast.antagonist.fame,support:inp.cast.support.fame},
        actualNegative:p.budget.negative,requiredNegative:result.requiredNegative,baseMarketValue:state.market.baseMarketValue,marketing:p.budget.marketing,
        salaries:inp.writer.salary+inp.director.salary+inp.cast.lead.salary+inp.cast.antagonist.salary+inp.cast.support.salary,engaged:true})
      appendReceipt(h,{week,studioId:b.studioId,kind:'filmReleased',productionId:p.id,conceptId:p.conceptId,before,after:b.standing})
      growth.push({filmResult,develop:{productionId:p.id,performers:flattenParticipants(p.participants!).map(c=>({talentId:c.talentId,discipline:c.discipline})),
        ctx:{concept:inp.concept,shape:p.shape,shapeEffects:inp.shapeEffects,promise:p.promise,requiredNegative:result.requiredNegative,criticScore:result.criticScore}},
        broadcast:{weightedAudienceScore:result.weightedAudienceScore}})
      storeHotDevelopment(b,markScriptProjectProduced(hotDevelopment(b),p.id))
    }
    b.releaseAuthority=pruneReleasedCommitments(b.releaseAuthority,ids)
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
    const excess=Math.max(0,b.standing.audienceAwareness-TUNING.AWARENESS_DRIFT_ANCHOR)
    if(excess>0)b.standing={...b.standing,audienceAwareness:clamp(b.standing.audienceAwareness-TUNING.AWARENESS_DRIFT_RATE*excess,0,100)}
    const employees=currentEmployees(h,b.studioId)
    moveRivalMoney(b.account,'payroll',-employees.reduce((sum,e)=>sum+weeklySalary(e.terms.annualSalary),0),week)
    moveRivalMoney(b.account,'overhead',-(TUNING.OVERHEAD_BASE+TUNING.OVERHEAD_PER_EMPLOYEE*employees.length),week)
    moveRivalMoney(b.account,'facilityOpex',-rivalCapacityOpex(b),week)
    const hot=hotDevelopment(b)
    const concepts=b.activeScriptOrdinals.map(i=>h.concepts[b.projects[i]!.conceptOrdinal]!)
    let complete=completeDueScriptWork(hot,week+1,{concepts,talent,estUplift:0})
    for(const project of complete.projects)if(project.status==='review')complete=acceptScriptProject(complete,project.id)
    storeHotDevelopment(b,complete)
  }
  return {hollywood:h,talent,growth}
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
        output:b?b.development.projects.length-b.activeScriptOrdinals.length+(h.origin==='fresh'&&s.row<=4?2:0):state.studio.releasedFilms.length}
    })
    h={...h,previousChart:h.chart,chart:{week,rows}}
  }
  const freeAgents=expired.length>0?[...new Set([...state.freeAgents,...expired.map(i=>h.employment[i]!.terms.talentId)])]:state.freeAgents
  return h===source?state:{...state,hollywood:h,freeAgents}
}
