/** Public, bounded Industry reads. Authoritative IDs and facts only; no private business inputs. */
import {campaignDate} from '../src/core/calendar.js'
import {filmAudienceScore} from '../src/core/index.js'
import {flattenParticipants} from '../src/core/starPower.js'
import type {GameState,Standing} from '../src/core/types.js'
import type {HollywoodChartSnapshot} from '../src/core/hollywoodTypes.js'
import {INDUSTRY_LANES,type IndustryPage,type IndustryQuery,type IndustrySummary} from './schema/industry-schema.ts'
import {PROTOCOL_VERSION,SCHEMA_ID,SNAPSHOT_VERSION} from './protocol.ts'
import {snapshotBuildContextFor} from './snapshot-build-context.ts'
import {studioPresence} from '../src/core/presence.ts'
import {historyProjection} from './history.ts'

type Film=IndustryPage['films'][number]
type Credit=IndustryPage['credits'][number]
type Person=IndustryPage['people'][number]
type Studio=IndustryPage['studios'][number]
type Activity=IndustryPage['activities'][number]
const byText=(a:string,b:string)=>a<b?-1:a>b?1:0
const laneLabels={audienceAwareness:'Audience Awareness',industryPrestige:'Industry Prestige',commercialConfidence:'Commercial Confidence',output:'Released Films'}
const meanings={audienceAwareness:'How familiar audiences are with this studio.',industryPrestige:'The studio’s standing within the film industry.',commercialConfidence:'Confidence in the studio’s commercial record.',output:'Canonical released films, including separately labelled authored history.'}
export function industrySummary(state:GameState):IndustrySummary {
  return {calendar:campaignDate(state.market.tick),available:state.hollywood!==null,playerStudioId:state.hollywood?.playerStudioId??null,
    activeStudioCount:state.hollywood?.identities.filter(s=>s.enteredWeek!==null).length??0,
    notice:state.hollywood?'Separate public comparison lanes. Open a studio, film or person to inspect the record.':'Industry is unavailable in this historical control.'}
}
type Index={studios:Studio[];studioById:Map<string,Studio>;films:Film[];filmById:Map<string,Film>;credits:Map<string,Credit[]>;
  filmsByStudio:Map<string,Film[]>;filmsByPerson:Map<string,Film[]>;people:Map<string,Person>;roster:Map<string,Person[]>;activities:Activity[]}
const indexes=new WeakMap<GameState,Index>()
function indexFor(state:GameState):Index {
  const cached=indexes.get(state);if(cached)return cached
  const h=state.hollywood
  if(!h)throw new Error('Industry authority is unavailable')
  const names=new Map(h.identities.map(s=>[s.studioId,s.name]))
  const employer=new Map<string,string>()
  for(const i of h.activeEmploymentOrdinals){const e=h.employment[i]!;employer.set(e.terms.talentId,e.studioId)}
  for(const c of state.contracts)if(c.startWeek<=state.market.tick&&state.market.tick<c.endWeekExclusive)employer.set(c.talentId,h.playerStudioId)
  const credits=new Map<string,Credit[]>()
  const toCredit=(c:{talentId:string;name:string;role:string}):Credit=>({talentId:c.talentId,name:c.name,role:c.role,
    employerStudioId:employer.get(c.talentId)??null,employerName:names.get(employer.get(c.talentId)??'')??null})
  const films:Film[]=h.films.map(f=>{
    credits.set(f.filmId,f.credits.map(toCredit))
    const authored=f.provenance==='authored-start/v1'
    const liveRun=authored?null:h.businesses.find(b=>b.studioId===f.studioId)?.runs.find(r=>r.productionId===f.filmId)
    return {filmId:f.filmId,studioId:f.studioId,studioName:names.get(f.studioId)!,title:f.title,genre:f.genre,
      dateLabel:authored?`${f.released.year} · Before this campaign`:campaignDate(f.result.releaseTick).label,
      releaseWeek:authored?null:f.result.releaseTick,historicalYear:authored?f.released.year:null,provenance:f.provenance,
      criticScore:authored?f.criticScore:f.result.criticScore,audienceScore:authored?f.audienceScore:filmAudienceScore(state,f.result),
      openingGross:authored?f.openingGross:f.result.boxOffice.opening,totalGross:authored?f.totalGross:liveRun?liveRun.cumulativeGrossPaid:f.result.boxOffice.total,
      runStatus:authored||f.settledWeek!==null?'settled':'inRun',
      businessNotice:authored?'Authored starting record; its run and historical effects were already settled before 1920.':f.settledWeek!==null?'Completed theatrical run. Public gross is distinct from studio revenue.':'The theatrical run is active. Total shows gross earned so far; future receipts, costs and studio revenue remain private.'}
  })
  const concepts=new Map(state.concepts.map(c=>[c.id,c]))
  for(const f of state.studio.releasedFilms) {
    const concept=concepts.get(f.conceptId),run=state.theatricalRuns.find(r=>r.productionId===f.productionId)
    credits.set(f.productionId,f.participants?flattenParticipants(f.participants).map(toCredit):[])
    films.push({filmId:f.productionId,studioId:h.playerStudioId,studioName:names.get(h.playerStudioId)!,title:concept?.title??f.productionId,genre:concept?.genre??'Unknown',dateLabel:campaignDate(f.releaseTick).label,releaseWeek:f.releaseTick,historicalYear:null,provenance:'player-record',criticScore:f.criticScore,audienceScore:filmAudienceScore(state,f),openingGross:f.boxOffice.opening,totalGross:run?.status==='active'?run.cumulativeGrossPaid:f.boxOffice.total,runStatus:run?.status==='active'?'inRun':run?'settled':'recorded',businessNotice:run?.status==='active'?'The run is active; total shows public gross earned so far. Open your film result for private finances.':'Recorded public gross. Open your film result for its full business record.'})
  }
  const filmsByStudio=new Map<string,Film[]>(),filmsByPerson=new Map<string,Film[]>()
  const append=<T>(map:Map<string,T[]>,key:string,row:T)=>{const rows=map.get(key);if(rows)rows.push(row);else map.set(key,[row])}
  for(const film of films){append(filmsByStudio,film.studioId,film);for(const c of credits.get(film.filmId)??[])append(filmsByPerson,c.talentId,film)}
  const people=new Map<string,Person>(),roster=new Map<string,Person[]>()
  const onLot=new Set(studioPresence(state).people.map(p=>p.talentId))
  for(const t of state.talent){const owner=employer.get(t.id)??null;const person:Person={talentId:t.id,name:t.name,roleLabel:t.role==='craft'?'Crew':t.role[0]!.toUpperCase()+t.role.slice(1),employerStudioId:owner,employerName:owner?names.get(owner)??null:null,
    employmentLabel:owner?`Studio: ${names.get(owner)}`:'No exclusive studio contract',creditCount:filmsByPerson.get(t.id)?.length??0,onPlayerLot:onLot.has(t.id),
    notice:'Credits establish work on a film. They do not establish historical employment. Current employer is read from the present contract.'};people.set(t.id,person);if(owner)append(roster,owner,person)}
  const current=h.chart??{week:state.market.tick,rows:h.identities.filter(s=>s.enteredWeek!==null).map(s=>({studioId:s.studioId,standing:h.businesses.find(b=>b.studioId===s.studioId)?.standing??state.studio.standing,output:filmsByStudio.get(s.studioId)?.length??0}))},prior=h.previousChart
  const sameCohort=current!==null&&prior!==null&&current.rows.length===prior.rows.length&&current.rows.every(r=>prior.rows.some(p=>p.studioId===r.studioId))
  const rank=(snapshot:HollywoodChartSnapshot,key:typeof INDUSTRY_LANES[number],studioId:string)=>{
    const value=(r:HollywoodChartSnapshot['rows'][number])=>key==='output'?r.output:r.standing[key]
    const own=snapshot.rows.find(r=>r.studioId===studioId);if(!own)return null
    return 1+snapshot.rows.filter(r=>value(r)>value(own)).length
  }
  const studios:Studio[]=h.identities.filter(s=>s.enteredWeek!==null).map(s=>{
    const owned=filmsByStudio.get(s.studioId)??[],business=h.businesses.find(b=>b.studioId===s.studioId)
    const standing:Standing=business?.standing??state.studio.standing
    const chartRow=current?.rows.find(r=>r.studioId===s.studioId)
    const lanes=INDUSTRY_LANES.map(key=>{
      const currentRank=current?rank(current,key,s.studioId):null,previousRank=prior?rank(prior,key,s.studioId):null
      const comparable=sameCohort&&currentRank!==null&&previousRank!==null
      const movement=!prior?'unavailable':previousRank===null?'new':!comparable?'unavailable':currentRank!<previousRank?'up':currentRank!>previousRank?'down':'unchanged'
      return {key,label:laneLabels[key],meaning:meanings[key],value:key==='output'?(chartRow?.output??owned.length):(chartRow?.standing[key]??standing[key]),rank:currentRank??1,priorRank:comparable?previousRank:null,movement,
        movementLabel:movement==='new'?'New to this comparison':movement==='unavailable'?'No comparable prior cohort':movement==='unchanged'?'No rank change':`${movement==='up'?'Up':'Down'} ${Math.abs(currentRank!-previousRank!)} since ${campaignDate(prior!.week).label}`,
        snapshotWeek:current?.week??state.market.tick,snapshotLabel:`Comparison: ${campaignDate(current?.week??state.market.tick).label} · ${current.rows.length} studios`,priorWeek:comparable?prior!.week:null} satisfies Studio['lanes'][number]
    })
    return {studioId:s.studioId,name:s.name,mark:s.mark,color:s.color,player:s.role==='player',
      foundingLabel:s.role==='player'&&state.founding!==null?`Campaign began ${campaignDate(s.enteredWeek!).label} · Studio founding in progress`:s.founding===null?'Founding date not recorded':s.founding.kind==='beforeCampaign'?`Established ${s.founding.year}`:`Founded ${campaignDate(s.founding.week).label}`,
      entryLabel:`Present since ${campaignDate(s.enteredWeek!).label}`,recordingNotice:h.origin==='migration'?`Industry recording begins ${campaignDate(s.recordedFromWeek!).label}. Earlier rival films are not reconstructed.`:s.row>4?'New company; films appear only after an actual release.':'Authored earlier films are labelled separately from this campaign’s simulated releases.',filmCount:owned.length,authoredFilmCount:owned.filter(f=>f.provenance==='authored-start/v1').length,liveFilmCount:owned.filter(f=>f.provenance!=='authored-start/v1').length,lanes}
  })
  const filmById=new Map(films.map(f=>[f.filmId,f]))
  const activities:Activity[]=h.receipts.flatMap((r):Activity[]=>{
    const studio=names.get(r.studioId)!,base={eventId:r.eventId,week:r.week,dateLabel:campaignDate(r.week).label,studioId:r.studioId}
    if(r.kind==='studioEntered')return [{...base,group:'studios' as const,headline:`${studio} joins Hollywood`,detail:r.origin==='fresh'?'Starting incumbent. Earlier authored film records are already settled.':'A new recorded company begins with finite starting resources and no backfilled filmography.',filmId:null,talentId:null}]
    if(r.kind==='employment')return r.reason==='renewal'||r.reason==='entry'||r.reason==='existing-player-contract'?[]:[{...base,group:'people' as const,headline:`${people.get(r.talentId)?.name??r.talentId}: ${r.toStudioId?'joined '+names.get(r.toStudioId):'contract ended'}`,detail:'Recorded employment transition. Contract terms remain private.',filmId:null,talentId:r.talentId}]
    if(r.kind==='filmReleased')return [{...base,group:'releases' as const,headline:`${studio} releases ${filmById.get(r.productionId)?.title??r.productionId}`,detail:`Released through recorded development, production, post-production and release commitments. Release Standing: ${(['audienceAwareness','industryPrestige','commercialConfidence'] as const).map(key=>`${laneLabels[key]} ${r.before[key].toFixed(1)} → ${r.after[key].toFixed(1)}`).join('; ')}. These are separate recorded changes at release, before later drift.`,filmId:r.productionId,talentId:null}]
    if(r.kind==='filmSettled')return [{...base,group:'releases' as const,headline:`${filmById.get(r.productionId)?.title??r.productionId} completes its theatrical run`,detail:'The final scheduled payment was received. The settled public result is now complete.',filmId:r.productionId,talentId:null}]
    if(r.kind==='filmAnnounced')return [{...base,group:'announcements' as const,headline:`${studio} announces a film`,detail:'An actual funded production has been greenlit. No release date is promised.',filmId:r.productionId,talentId:null}]
    return []
  })
  const index={studios,studioById:new Map(studios.map(s=>[s.studioId,s])),films,filmById:new Map(films.map(f=>[f.filmId,f])),credits,filmsByStudio,filmsByPerson,people,roster,activities}
  indexes.set(state,index);return index
}
const chronology=(f:Film)=>(f.releaseWeek??((f.historicalYear??1919)-1920)*52)
function filterFilms(rows:Film[],q:IndustryQuery,week:number):Film[] {
  return rows.filter(f=>q.period==='authored'?f.provenance==='authored-start/v1':q.period==='live'?f.provenance!=='authored-start/v1':q.period==='recent'?f.releaseWeek!==null&&f.releaseWeek>=Math.max(0,week-51):true)
    .sort((a,b)=>{const value=(f:Film)=>q.lane==='critics'?f.criticScore:q.lane==='audience'?f.audienceScore:q.lane==='opening'?f.openingGross:q.lane==='total'?f.totalGross:chronology(f);return value(b)-value(a)||byText(a.filmId,b.filmId)})
}
/** Query results own their output objects; the immutable per-state index never escapes. */
export function industryPage(state:GameState,sessionId:string,stateRevision:number,q:IndustryQuery):IndustryPage {
  const index=indexFor(state),h=state.hollywood!,calendar=campaignDate(state.market.tick)
  const result:IndustryPage={protocolVersion:PROTOCOL_VERSION,schemaId:SCHEMA_ID,snapshotVersion:SNAPSHOT_VERSION,type:'industryPage',requestId:q.requestId,sessionId,stateRevision,stateDigest:snapshotBuildContextFor(state).stateDigest(),calendar,view:q.view,targetId:q.targetId,page:q.page,pageSize:q.pageSize,totalRows:0,pageCount:0,lane:q.lane,period:q.period,title:'Industry',notice:'Public facts only. Standing channels and film measures have separate meanings; there is no combined Power score.',studios:[],films:[],people:[],credits:[],activities:[],projects:[],tendencies:[]}
  const page=<T>(rows:T[]):T[]=>{result.totalRows=rows.length;result.pageCount=Math.ceil(rows.length/q.pageSize);if(q.page>0&&q.page>=result.pageCount)throw new Error('That page is outside this snapshot. Return to the first page.');return rows.slice(q.page*q.pageSize,(q.page+1)*q.pageSize)}
  if(q.view==='studios') {
    const lane=INDUSTRY_LANES.find(k=>k===q.lane)??'audienceAwareness'
    const rows=structuredClone(index.studios)
    if(lane==='output'&&q.period==='recent') {
      const current=h.chart,prior=h.previousChart,at=current?.week??state.market.tick
      const count=(id:string,week:number)=>(index.filmsByStudio.get(id)??[]).filter(f=>f.releaseWeek!==null&&f.releaseWeek<week&&f.releaseWeek>=Math.max(0,week-52)).length
      const comparable=!!current&&!!prior&&current.rows.length===prior.rows.length&&current.rows.every(r=>prior.rows.some(p=>p.studioId===r.studioId))
      for(const studio of rows) {
        const l=studio.lanes.find(l=>l.key==='output')!,value=count(studio.studioId,at)
        l.label='Released Films · Last 52 weeks';l.meaning='Actual campaign releases in the 52 weeks ending at the comparison date; authored starting history is excluded.';l.value=value
        l.rank=1+rows.filter(s=>count(s.studioId,at)>value).length
        l.priorRank=comparable?1+prior!.rows.filter(r=>count(r.studioId,prior!.week)>count(studio.studioId,prior!.week)).length:null
        l.movement=l.priorRank===null?'unavailable':l.rank<l.priorRank?'up':l.rank>l.priorRank?'down':'unchanged'
        l.movementLabel=l.priorRank===null?'No comparable prior cohort':l.movement==='unchanged'?'No rank change':`${l.movement==='up'?'Up':'Down'} ${Math.abs(l.rank-l.priorRank)} since ${campaignDate(prior!.week).label}`
      }
    }
    result.title='Studio Charts';result.studios=page(rows.sort((a,b)=>a.lanes.find(l=>l.key===lane)!.rank-b.lanes.find(l=>l.key===lane)!.rank||byText(a.studioId,b.studioId)))
  } else if(q.view==='films') {
    result.title='Movie Charts';result.films=page(filterFilms(index.films,q,state.market.tick))
  } else if(q.view==='studio'||q.view==='history'||q.view==='roster') {
    const studio=index.studioById.get(q.targetId??'');if(!studio)throw new Error('That studio is not present in this campaign.')
    result.title=q.view==='history'?`${studio.name} · History`:studio.name;result.studios=[studio];result.notice=studio.recordingNotice
    if(q.view==='roster') {
      result.title=`${studio.name} · Current roster`
      result.people=page(index.roster.get(studio.studioId)??[])
    }
    else if(q.view==='history') {
      result.films=(index.filmsByStudio.get(studio.studioId)??[]).filter(f=>f.provenance==='authored-start/v1')
      const records=studio.player?historyProjection(state).timeline.map((r):Activity=>({eventId:`player-history-${r.eventId}`,week:r.week,dateLabel:campaignDate(r.week).label,
        group:r.filmId?'releases':r.personId?'people':'studios',headline:r.headline,detail:r.detail,studioId:h.playerStudioId,filmId:r.filmId,talentId:r.personId})):index.activities.filter(r=>r.studioId===studio.studioId)
      result.activities=page(records.filter(r=>q.period!=='recent'||r.week>=Math.max(0,state.market.tick-12)).sort((a,b)=>b.week-a.week||byText(a.eventId,b.eventId)))
    }
    else {
      const all=index.filmsByStudio.get(studio.studioId)??[]
      result.films=page(filterFilms(all,q,state.market.tick));result.people=(index.roster.get(studio.studioId)??[]).slice(0,6)
      result.notice+=` Showing ${result.people.length} of ${index.roster.get(studio.studioId)?.length??0} current people; open the complete roster for every member.`
      const business=h.businesses.find(b=>b.studioId===studio.studioId)
      for(const p of business?.productions??[]){const cost=business!.projects.find(c=>c.productionId===p.id);if(cost?.announcedWeek===null||!cost)continue;const concept=h.concepts[cost.conceptOrdinal]!
        result.projects.push({productionId:p.id,studioId:studio.studioId,title:concept.title,genre:concept.genre,announcedWeek:cost.announcedWeek,dateLabel:campaignDate(cost.announcedWeek).label,stageLabel:'In production',notice:'Announced at actual greenlight. Scheduling and unrevealed development remain private.'})}
      const observed=all.filter(f=>f.provenance!=='authored-start/v1'&&f.releaseWeek!==null&&f.releaseWeek>=Math.max(0,state.market.tick-155))
      const genres=new Map<string,number>();for(const f of observed)genres.set(f.genre,(genres.get(f.genre)??0)+1)
      const leading=[...genres.entries()].sort((a,b)=>b[1]-a[1]||byText(a[0],b[0]))[0]
      result.tendencies=[{label:'Observed release genres',detail:observed.length<3?`${observed.length} recorded releases: too small a sample to describe a tendency.`:`${leading![1]} of ${observed.length} releases were ${leading![0]}. Other genres remain possible.`,sampleCount:observed.length,fromLabel:campaignDate(Math.max(studio.recordingNotice.includes('Earlier')?h.originWeek:0,state.market.tick-155)).label,throughLabel:calendar.label,basis:'Last 156 campaign weeks of released films. Authored starting films and unrevealed plans are excluded; this is observation, not a strategy forecast.'}]
      result.tendencies.push({label:'Observed release pace',detail:`${observed.length} recorded releases during this window. This is past output; future releases are not promised.`,sampleCount:observed.length,
        fromLabel:campaignDate(Math.max(h.originWeek,state.market.tick-155)).label,throughLabel:calendar.label,basis:'Actual released-film dates during the last 156 campaign weeks. No hidden production budgets or plans are inferred.'})
    }
  } else if(q.view==='project') {
    const business=h.businesses.find(b=>b.projects.some(p=>p.productionId===q.targetId))
    const cost=business?.projects.find(p=>p.productionId===q.targetId)
    if(!business||!cost||cost.announcedWeek===null)throw new Error('No authoritative public announcement exists for that production.')
    const concept=h.concepts[cost.conceptOrdinal]!,production=business.productions.find(p=>p.id===q.targetId),film=index.filmById.get(q.targetId!)
    result.title=concept.title;result.studios=[index.studioById.get(business.studioId)!]
    result.projects=[{productionId:cost.productionId!,studioId:business.studioId,title:concept.title,genre:concept.genre,announcedWeek:cost.announcedWeek,dateLabel:campaignDate(cost.announcedWeek).label,
      stageLabel:film?'Released':'In production',notice:'Publicly announced production. Private schedules, costs and unannounced development are not disclosed.'}]
    if(film){result.films=[film];result.credits=page(index.credits.get(film.filmId)??[])}
    else result.credits=page(production?.participants?flattenParticipants(production.participants).map(c=>({talentId:c.talentId,name:c.name,role:c.role,
      employerStudioId:index.people.get(c.talentId)?.employerStudioId??null,employerName:index.people.get(c.talentId)?.employerName??null})):[])
  } else if(q.view==='employment') {
    const person=index.people.get(q.targetId??'');if(!person)throw new Error('That person is absent from this campaign.')
    result.title=`${person.name} · Recorded employment`;result.people=[person]
    result.notice=`Employment recording begins ${campaignDate(h.originWeek).label}. Film credits do not establish an employer. Existing migration contracts are observations, not newly signed contracts.`
    result.activities=page(h.receipts.flatMap((r):Activity[]=>r.kind==='employment'&&r.talentId===person.talentId?[{eventId:r.eventId,week:r.week,dateLabel:campaignDate(r.week).label,group:'people',studioId:r.studioId,filmId:null,talentId:r.talentId,
      headline:`${index.studioById.get(r.studioId)!.name} · ${r.reason==='existing-player-contract'?'Existing contract observed':r.toStudioId===null?'Contract ended':r.reason==='renewal'?'Contract renewed':'Contract began'}`,
      detail:'Actual recorded employment authority. Contract terms are kept private in Industry.'}]:[]).reverse())
  } else if(q.view==='film') {
    const film=index.filmById.get(q.targetId??'');if(!film)throw new Error('That film has no released result yet. Open its studio for the public announcement.')
    result.title=film.title;result.films=[film];result.credits=page(index.credits.get(film.filmId)??[]);result.notice=film.businessNotice
  } else if(q.view==='person') {
    const person=index.people.get(q.targetId??'');if(!person)throw new Error('That person is absent from this campaign.')
    result.title=person.name;result.people=[person];result.films=page(filterFilms(index.filmsByPerson.get(person.talentId)??[],q,state.market.tick));result.notice=person.notice
  } else {
    result.title='Industry Pulse';result.notice='Grouped material activity for the last 13 campaign weeks. Routine phase changes and ordinary renewals are omitted.'
    const groupOrder={releases:0,people:1,studios:2,announcements:3}
    result.activities=page(index.activities.filter(r=>r.week>=Math.max(0,state.market.tick-12)).sort((a,b)=>groupOrder[a.group]-groupOrder[b.group]||b.week-a.week||byText(a.eventId,b.eventId)))
  }
  return structuredClone(result)
}
