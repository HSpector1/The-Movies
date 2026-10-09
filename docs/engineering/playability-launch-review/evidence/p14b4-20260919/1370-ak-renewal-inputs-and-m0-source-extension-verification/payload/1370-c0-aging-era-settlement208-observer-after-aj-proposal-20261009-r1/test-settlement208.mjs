import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {SELECTION,PAYLOAD_CAP,freezeSettlement208,observeSettlement208Ledger} from './settlement208-core.mjs'
import {SEED,SUBJECT} from './witness-core.mjs'
const clone=x=>JSON.parse(JSON.stringify(x))
const employment=JSON.parse(readFileSync(new URL('./synthetic-employment.json',import.meta.url),'utf8'))
const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex')
const primary={writer:'writing',director:'directing',actor:'acting',craft:'craft'}
const keys={writing:['storyStructure','characterDevelopment','dialogue','originality','narrativePacing','rewriting'],
 directing:['visualStorytelling','performanceDirection','toneControl','directingPacing','productionManagement','adaptability'],
 acting:['actingTechnique','emotionalRange','dialogueDelivery','comicTiming','physicalPerformance','screenPresence'],
 craft:['cinematography','editing','productionDesign','soundAndMusic','effectsExecution','technicalCoordination']}
function at208(){
 const rows=clone(employment).map(row=>row.terms.startWeek===208?{...row,endedWeek:null}:row)
 return {seed:SEED,market:{tick:208},rngState:'synthetic',firstTakes:[],
  talent:SELECTION.map(s=>({id:s.talentId,role:s.creativeRole,age:40,fame:40,
   skills:{[primary[s.creativeRole]]:Object.fromEntries(keys[primary[s.creativeRole]].map(k=>[k,{perceived:50}]))}})),
  talentProvenance:{rows:[{personId:SUBJECT,kind:'authored_exact_week',ageAtEntry:44.36540781416331,entryWeek:0}]},
  hollywood:{playerStudioId:'synthetic-player',employment:rows,receipts:[],businesses:['studio-aca408ec-r01','studio-aca408ec-r02','studio-aca408ec-r03'].map(studioId=>({studioId,policy:{version:1,reserveWeeks:20,marketingRatio:.14,negativeScale:.94,affinities:{adventure:1,comedy:1,crime:1,drama:1,horror:5,romance:1}}}))},
  talentMarket:{proposals:[],cases:SELECTION.map(s=>({talentId:s.talentId,subjectStudioId:s.oldRowFinal.studioId,contractId:s.oldRowFinal.contractId,openedWeek:196,outcome:'settled',closedWeek:208,reason:'synthetic settlement'})),
   receipts:SELECTION.map((s,i)=>({eventId:'synthetic-'+i,kind:'settled',week:208,talentId:s.talentId,studioId:s.renewalRowFinal.studioId,reasons:['synthetic only'],dropped:[]}))}}
}
const deepFreeze=value=>{if(value&&typeof value==='object'){Object.values(value).forEach(deepFreeze);Object.freeze(value)};return value}
test('selected16 minimum projection is pure over deeply frozen synthetic state',()=>{
 const state=deepFreeze(at208()),before=JSON.stringify(state),raw=freezeSettlement208(state),value=JSON.parse(raw)
 assert.equal(JSON.stringify(state),before);assert.equal(value.rows.length,16);assert.equal(value.week,208)
 assert.deepEqual(value.rows.map(r=>r.identity),SELECTION.map(s=>s.identity));assert.equal(value.extraRngCalls,0)
 assert.deepEqual(Object.keys(value.rows[0].person),['id','role','age','fame','skills'])
 assert.equal(value.rows[0].currentProposalCount,0);assert.ok(raw.length<=PAYLOAD_CAP)
})
test('wrong phase and seed refused',()=>{for(const week of [207,209])assert.throws(()=>freezeSettlement208({...at208(),market:{tick:week}}),/STOP_A208_PHASE_SEED/);assert.throws(()=>freezeSettlement208({...at208(),seed:'wrong'}),/STOP_A208_PHASE_SEED/)})
test('missing and duplicate selected person refused',()=>{let s=at208();s.talent.pop();assert.throws(()=>freezeSettlement208(s),/PERSON_COUNT/);s=at208();s.talent.push(s.talent[0]);assert.throws(()=>freezeSettlement208(s),/PERSON_COUNT/)})
test('identity occurrence order and incomplete history refused',()=>{let s=at208();[s.hollywood.employment[24],s.hollywood.employment[25]]=[s.hollywood.employment[25],s.hollywood.employment[24]];assert.throws(()=>freezeSettlement208(s),/CURRENT_IDENTITY_OCCURRENCE_ORDER_TERMS/);s=at208();s.hollywood.employment.push(s.hollywood.employment[24]);assert.throws(()=>freezeSettlement208(s),/SUBJECT_HISTORY_COUNT/);s=at208();s.hollywood.employment[24].terms.termWeeks=1;assert.throws(()=>freezeSettlement208(s),/CURRENT_IDENTITY_OCCURRENCE_ORDER_TERMS/)})
test('case winner policy missing duplicate and closed-proposal contexts refused',()=>{
 for(const field of ['cases','receipts']){let s=at208();s.talentMarket[field].pop();assert.throws(()=>freezeSettlement208(s),/COUNT/);s=at208();s.talentMarket[field].push(s.talentMarket[field][0]);assert.throws(()=>freezeSettlement208(s),/COUNT/)}
 let s=at208();s.hollywood.businesses.pop();assert.throws(()=>freezeSettlement208(s),/POLICY_COUNT/);s=at208();s.hollywood.businesses.push(s.hollywood.businesses[0]);assert.throws(()=>freezeSettlement208(s),/POLICY_COUNT/)
 s=at208();s.talentMarket.proposals.push({talentId:SUBJECT});assert.throws(()=>freezeSettlement208(s),/CLOSED_PROPOSALS/)
})
test('nonfinite input accessor and smaller cap refused without source mutation',()=>{
 for(const field of ['age','fame'])for(const value of [NaN,Infinity,-Infinity]){const s=at208();s.talent[0][field]=value;assert.throws(()=>freezeSettlement208(s),/FINITE_INPUT/)}
 let s=at208();s.talent[0].skills.writing.storyStructure.perceived=NaN;assert.throws(()=>freezeSettlement208(s),/FINITE_INPUT/)
 s=at208();let reads=0;Object.defineProperty(s.talent[0],'fame',{get(){reads++;return 40}});assert.throws(()=>freezeSettlement208(s),/ACCESSOR/);assert.equal(reads,0)
 s=at208();const before=JSON.stringify(s),size=freezeSettlement208(s).length;assert.equal(freezeSettlement208(s,size).length,size);assert.throws(()=>freezeSettlement208(s,size-1),/PAYLOAD_CAP/);assert.throws(()=>freezeSettlement208(s,1),/PAYLOAD_CAP/);assert.equal(JSON.stringify(s),before)
 s=at208();s.talentMarket.receipts[0].reasons=Array.from({length:16},()=> 'x'.repeat(512));assert.throws(()=>freezeSettlement208(s),/ROW_CAP/)
})
test('natural416 wrapper serializes208 before later mutations without extra factory or tick calls',()=>{
 let calls=0,factories=0
 const factory=seed=>{factories++;assert.equal(seed,SEED);const s=at208();s.market.tick=0;s.hollywood.employment=clone(employment.slice(0,24)).map(r=>({...r,endedWeek:null}));s.talent[0].age=44;return s}
 const tick=state=>{calls++;const week=state.market.tick+1;const next={...state,market:{tick:week}}
  if(week===208){const phase=at208();Object.assign(next,phase)}
  if(week===209)next.talent[0].fame=41
  if(week===416)next.hollywood={...next.hollywood,employment:clone(employment)}
  return next}
 const expected={employment:hash(employment),settlement:hash(SELECTION.map((s,i)=>['synthetic-'+i,'settled',208,s.talentId,s.renewalRowFinal.studioId,['synthetic only'],[]])),receipts:hash(at208().talentMarket.receipts),takes:hash([]),rng:'synthetic'}
 const result=observeSettlement208Ledger(factory,tick,expected,()=>0)
 assert.equal(calls,416);assert.equal(factories,1);assert.equal(result.rows,44);assert.equal(JSON.parse(result.settlement208Bytes).rows[0].person.fame,40)
 assert.equal(result.settlement208Rows,16);assert.equal(result.digests.employment,expected.employment)
})
