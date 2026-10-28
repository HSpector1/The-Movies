// Static post-image of bridge/schema/project-studio-bridge.schema.json for projection 66, mirroring bridge/schema/dsl.ts.
// Usage: node schema66.cjs <pre schema.json> <out schema.json>. Prints the canonical sha256 identity of input and output.
const fs=require('fs'),c=require('crypto')
const [,,input,output]=process.argv
const canon=v=>Array.isArray(v)?v.map(canon):(typeof v!=='object'||v===null)?v:Object.fromEntries(Object.entries(v).sort(([a],[b])=>a<b?-1:a>b?1:0).map(([k,e])=>[k,canon(e)]))
const id_=s=>'sha256:'+c.createHash('sha256').update(JSON.stringify(canon(s))).digest('hex')
const s=JSON.parse(fs.readFileSync(input,'utf8'))
console.log('input ',id_(s))
const text=(o={})=>({type:'string',...o}),id=()=>text({minLength:1})
const enumeration=v=>({type:'string',enum:v})
const integer=(o={})=>({type:'integer',minimum:o.minimum??-2147483648,maximum:o.maximum??2147483647})
const count=()=>integer({minimum:0}),number=(o={})=>({type:'number',...o}),bool=()=>({type:'boolean'})
const array=i=>({type:'array',items:i}),nullable=x=>({anyOf:[x,{type:'null'}]}),ref=n=>({$ref:'#/$defs/'+n})
const OPT=Symbol('optional'),optional=x=>({[OPT]:x})
const object=(name,props)=>{const e=Object.entries(props).sort(([a],[b])=>a<b?-1:a>b?1:0)
 return {type:'object',properties:Object.fromEntries(e.map(([k,v])=>[k,v[OPT]??v])),required:e.filter(([,v])=>!v[OPT]).map(([k])=>k),additionalProperties:false,'x-csharp-name':name}}
const T5=['directSequel','prequel','remake','reboot','spinOff'],ROLES=['writer','director','actor','craft','scientist'],BASIS=['employee','freelance']
const add=(name,schema)=>{if(s.$defs[name])throw new Error('exists '+name);s.$defs[name]=schema}
add('StudioContinuationRequest',object('StudioContinuationRequest',{type:enumeration(T5),predecessorProductionId:id(),subPropertyId:optional(id()),branchId:optional(id())}))
add('StudioCameoBookingRequest',object('StudioCameoBookingRequest',{talentId:id(),workWeek:count(),fee:number({minimum:0}),basis:enumeration(BASIS)}))
add('StudioContinuationRightsBasis',object('StudioContinuationRightsBasis',{via:enumeration(['title','licence','parent']),holderStudioId:id(),licenceId:nullable(id()),grantorStudioId:nullable(id()),licenceEndWeekExclusive:nullable(count()),coverWeek:count()}))
add('StudioContinuationQuoteTerms',object('StudioContinuationQuoteTerms',{storyPropertyId:id(),type:enumeration(T5),use:enumeration(['sequel','remake','spinoff']),predecessorProductionId:id(),branchId:nullable(id()),branchKind:enumeration(['main','reboot','spinoff']),subPropertyId:nullable(id()),link:bool(),rights:ref('StudioContinuationRightsBasis'),recognition:number(),momentum:number(),fatigue:number(),comparison01:number(),continuityCredit:nullable(number()),inheritedAwareness01:number(),band:enumeration(['new','active','activeAgain','cooling','dormant','revivalCandidate'])}))
add('StudioFeaturedGuestTerms',object('StudioFeaturedGuestTerms',{talentId:id(),name:id(),profession:enumeration(ROLES),basis:enumeration(BASIS),workWeek:count(),standardShootingWeek:bool(),fee:number({minimum:0}),retained:number({minimum:0}),refundable:number({minimum:0}),readinessRisk:id(),disclosures:array(id())}))
const draft=s.$defs.StudioCastingDraftPayload
draft.properties.continuation=ref('StudioContinuationRequest');draft.properties.cameos=array(ref('StudioCameoBookingRequest'))
const quote=s.$defs.StudioCastingQuoteSnapshot
quote.properties.continuation=nullable(ref('StudioContinuationQuoteTerms'));quote.properties.featuredGuests=nullable(array(ref('StudioFeaturedGuestTerms')))
quote.required.push('continuation','featuredGuests')
add('StudioFranchiseReleaseOutcome',object('StudioFranchiseReleaseOutcome',{releasedWeek:count(),criticScore:number(),openingGross:number(),totalGross:number(),expectedTotal:nullable(number()),propertyPeak:bool(),activeAgain:bool()}))
add('StudioFranchiseCreditedGuest',object('StudioFranchiseCreditedGuest',{bookingId:id(),talentId:id(),name:id(),workWeek:count(),fee:number(),starPowerBefore:number(),starPowerAfter:number(),starPowerDelta:number()}))
add('StudioFeaturedGuestWeek',object('StudioFeaturedGuestWeek',{workWeek:count(),standardShooting:bool(),ok:bool(),basis:nullable(enumeration(BASIS)),refusal:nullable(id()),readinessRisk:nullable(id()),disclosures:array(id())}))
add('StudioFeaturedGuestRow',object('StudioFeaturedGuestRow',{talentId:id(),name:id(),profession:enumeration(ROLES),fame:number(),fee:nullable(number()),retained:nullable(number()),refundable:nullable(number()),weeks:array(ref('StudioFeaturedGuestWeek'))}))
add('StudioFeaturedBookingRow',object('StudioFeaturedBookingRow',{bookingId:id(),productionId:id(),productionTitle:id(),talentId:id(),name:id(),profession:enumeration(ROLES),basis:enumeration(BASIS),workWeek:count(),bookedWeek:count(),fee:number(),retained:number(),status:enumeration(['reserved','completed','cancelled']),completedWeek:nullable(count()),cancelledWeek:nullable(count()),cancelReason:nullable(enumeration(['explicit','missedWork','productionCancelled','employmentExit','rightsLoss'])),refund:nullable(number()),releasedWeek:nullable(count()),starPowerDelta:nullable(number()),cancelIntent:nullable(ref('StudioBridgeIntentOption'))}))
add('StudioFeaturedAppearancesPage',object('StudioFeaturedAppearancesPage',{title:id(),notice:id(),greenlightWeek:count(),capacity:count(),nominalShootingWeeks:array(count()),guests:array(ref('StudioFeaturedGuestRow')),bookings:array(ref('StudioFeaturedBookingRow'))}))
const inst=s.$defs.StudioFranchiseInstallment
inst.properties.outcome=nullable(ref('StudioFranchiseReleaseOutcome'));inst.properties.guests=array(ref('StudioFranchiseCreditedGuest'));inst.required.push('outcome','guests')
for(const d of ['StudioIndustryRequest','StudioIndustryResponse']){const v=s.$defs[d].properties.view.enum;if(v.at(-1)!=='franchises')throw new Error('view '+d);v.push('featuredAppearances')}
const resp=s.$defs.StudioIndustryResponse;resp.properties.featuredAppearances=nullable(ref('StudioFeaturedAppearancesPage'));resp.required.push('featuredAppearances')
// AVAILABLE_INTENT_KINDS: every enum whose last member is the old last kind 'absorbStudio' and that holds 'takeLoan'
let kinds=0;const walk=v=>{if(v&&typeof v==='object'){if(Array.isArray(v.enum)&&v.enum.at(-1)==='absorbStudio'&&v.enum.includes('takeLoan')){v.enum.push('cancelFeaturedBooking');kinds++}for(const e of Object.values(v))walk(e)}};walk(s.$defs)
let snaps=0;const walk2=v=>{if(v&&typeof v==='object'){for(const [k,e] of Object.entries(v)){if(k==='snapshotVersion'&&e.const===65){e.const=66;snaps++}walk2(e)}}};walk2(s.$defs)
if(snaps!==5)throw new Error('snapshotVersion '+snaps)
if(s.$id!=='urn:project-studio:bridge:protocol-4:projection-65')throw new Error('$id');s.$id='urn:project-studio:bridge:protocol-4:projection-66'
if(s['x-project-studio'].projectionVersion!==65)throw new Error('xps');s['x-project-studio'].projectionVersion=66
for(const d of Object.values(s.$defs))if(Array.isArray(d.required))d.required.sort((a,b)=>a<b?-1:a>b?1:0)
console.log('intent kind enums',kinds)
fs.writeFileSync(output,JSON.stringify(canon(s),null,2)+'\n')
console.log('output',id_(s))
