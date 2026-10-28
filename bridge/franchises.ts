/** P17 (projection 65): the player's read-only view of the landed franchise root. Every number and verdict is the
 * core's own reader (src/core/continuation*.ts); nothing here re-derives continuation law, and nothing writes. */
import {continuationQuote,type ContinuationRequest,type ContinuationWorld,type FranchiseProperty} from '../src/core/continuation.js'
import {continuationWorldOf} from '../src/core/continuationGreenlight.js'
import {branchBand,fatigueAt,momentumAt,recognitionReported} from '../src/core/continuationSignals.js'
import type {GameState} from '../src/core/types.js'
import type {FranchisesPage} from './schema/industry-schema.ts'

type Property=FranchisesPage['properties'][number]
// The quote reads the production id only to refuse one that already carries a lineage edge; no production has this id.
const PROBE_PRODUCTION_ID='bridge-franchise-read-probe'
const SEQUEL_FAMILY=['directSequel','prequel','remake','reboot'] as const

/** P17 slice B: what the core records about a released installment (no per-release meter change is recorded). */
function releaseOutcome(world:ContinuationWorld,property:FranchiseProperty,productionId:string,releasedWeek:number|null):Property['installments'][number]['outcome'] {
 if(releasedWeek===null)return null
 const view=world.releasedFilm(productionId)
 if(view===null)throw new Error(`franchise view: released installment ${productionId} has no public result`)
 return {releasedWeek,criticScore:view.result.criticScore,openingGross:view.result.boxOffice.opening,totalGross:view.result.boxOffice.total,
  expectedTotal:view.result.forecast?.expectedTotal??null,propertyPeak:property.meter.peakInstallmentId===productionId,
  activeAgain:property.milestones.some(m=>m.milestoneId==='activeAgain'&&m.productionId===productionId)}
}

/** P17 slice B: the guests a release credited, exactly where the core attached a career record to the completed booking. */
function creditedGuests(state:GameState,productionId:string):Property['installments'][number]['guests'] {
 return (state.cameos?.bookings??[]).flatMap(b=>b.productionId!==productionId||b.status!=='completed'||b.careerEvent===null?[]:[{
  bookingId:b.bookingId,talentId:b.talentId,name:state.talent.find(t=>t.id===b.talentId)?.name??b.talentId,workWeek:b.workWeek,fee:b.fee,
  starPowerBefore:b.careerEvent.starPowerBefore,starPowerAfter:b.careerEvent.starPowerAfter,starPowerDelta:b.careerEvent.starPowerDelta}])
}

function propertyRow(world:ContinuationWorld,studioId:string,property:FranchiseProperty):Property {
 const week=world.week
 const meterOf=(subPropertyId:string|null)=>subPropertyId===null?property.meter:property.subProperties.find(s=>s.subPropertyId===subPropertyId)!.meter
 // Every request the quote's legality matrix can admit on this property: each film under each type, each hook as a spin-off.
 const requests:ContinuationRequest[]=property.installments.flatMap(edge=>[
  ...SEQUEL_FAMILY.map(type=>({type,predecessorProductionId:edge.childProductionId})),
  ...property.subProperties.map(sub=>({type:'spinOff' as const,predecessorProductionId:edge.childProductionId,subPropertyId:sub.subPropertyId})),
 ])
 // ponytail: one P16 title resolution per quote (resolveTitles is not memoized); share one per page if large franchises read slowly.
 const quotes=requests.map(request=>continuationQuote(world,{studioId,productionId:PROBE_PRODUCTION_ID,request}))
 const reboots=quotes.filter((_quote,index)=>requests[index]!.type==='reboot')
 const rebootLegal=reboots.some(quote=>quote.ok)
 return {storyPropertyId:property.storyPropertyId,franchiseId:property.franchiseId,mintedWeek:property.mintedWeek,
  recognition:recognitionReported(property.meter,week),fatigue:fatigueAt(property.meter,week),
  branches:property.branches.map(b=>({branchId:b.branchId,kind:b.kind,subPropertyId:b.subPropertyId,openedAtWeek:b.openedAtWeek,
   lastReleaseWeek:b.lastReleaseWeek,momentum:momentumAt(b,week),band:branchBand(b,meterOf(b.kind==='spinoff'?b.subPropertyId:null),week)})),
  installments:property.installments.map(e=>({productionId:e.childProductionId,parentProductionId:e.parentProductionId,type:e.type,
   branchId:e.branchId,greenlitWeek:e.greenlitWeek,studioId:e.studioId,releasedWeek:e.releasedWeek,
   outcome:releaseOutcome(world,property,e.childProductionId,e.releasedWeek),guests:creditedGuests(world.state,e.childProductionId)})),
  subProperties:property.subProperties.map(s=>({subPropertyId:s.subPropertyId,kind:s.kind,mintedAtProductionId:s.mintedAtProductionId,
   mintedWeek:s.mintedWeek,recognition:recognitionReported(s.meter,week),fatigue:fatigueAt(s.meter,week),promotedToStoryPropertyId:s.promotedToStoryPropertyId})),
  rebootLegal,rebootRefusal:rebootLegal?null:reboots.flatMap(quote=>quote.ok?[]:[quote.reason])[0]??null,
  choices:quotes.flatMap(q=>q.ok?[{type:q.type,predecessorProductionId:q.predecessorProductionId,subPropertyId:q.subPropertyId,branchId:q.branchId,
   branchKind:q.branchKind,use:q.use,recognition:q.recognition,momentum:q.momentum,fatigue:q.fatigue,inheritedAwareness01:q.inheritedAwareness01,band:q.band}]:[])}
}

// ponytail: lists the properties the root already carries; a film whose first continuation is not yet greenlit has no row
// until then. Add a candidate scan over the player's P16 titles when the first-sequel offer needs the Bridge.
export function franchisesPage(state:GameState,targetId:string|null,page:number,pageSize:number):{franchises:FranchisesPage;totalRows:number;pageCount:number} {
 if(targetId!==null)throw new Error('The franchise list requires a null targetId.')
 const studioId=state.hollywood?.playerStudioId
 if(studioId===undefined)throw new Error('Franchises require an established player studio.')
 const world=continuationWorldOf(state),properties=world.franchises.properties
 const pageCount=Math.ceil(properties.length/pageSize)
 if(page>0&&page>=pageCount)throw new Error('That franchise page is outside this record.')
 return {totalRows:properties.length,pageCount,franchises:{title:'Franchises',
  notice:'Recognition and Fatigue belong to the property; Momentum belongs to each continuity. A listed choice is lawful for your studio this week; the greenlight still checks the concept you choose.',
  properties:properties.slice(page*pageSize,(page+1)*pageSize).map(property=>propertyRow(world,studioId,property))}}
}
