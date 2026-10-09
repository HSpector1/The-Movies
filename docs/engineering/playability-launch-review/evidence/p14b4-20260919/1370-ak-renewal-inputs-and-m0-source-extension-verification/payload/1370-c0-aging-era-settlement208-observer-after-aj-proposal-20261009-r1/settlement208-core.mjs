// SOURCE ONLY. Standard unmodified JS native builtins and engine plain data records.
// External data projection only: no quote/predicate/age/OVR/engine/RNG helper calls.
import { createHash } from 'node:crypto'
import { observeLedger, EXPECTED, SEED } from './witness-core.mjs'
export const SELECTION = [{"identity":["studio-aca408ec-r02:contract:person-studio-aca408ec-r01-0:208",0],"sourceOrder":24,"talentId":"person-studio-aca408ec-r01-0","creativeRole":"writer","oldSourceOrder":0,"oldRowFinal":{"contractId":"studio-aca408ec-r01:contract:person-studio-aca408ec-r01-0:0","studioId":"studio-aca408ec-r01","terms":{"talentId":"person-studio-aca408ec-r01-0","annualSalary":395548,"signingBonus":71199,"termWeeks":208,"startWeek":0,"endWeekExclusive":208},"endedWeek":208,"reason":"entry"},"renewalRowFinal":{"contractId":"studio-aca408ec-r02:contract:person-studio-aca408ec-r01-0:208","studioId":"studio-aca408ec-r02","terms":{"talentId":"person-studio-aca408ec-r01-0","annualSalary":499573,"signingBonus":89923,"startWeek":208,"endWeekExclusive":416,"termWeeks":208},"endedWeek":416,"reason":"replacement"}},{"identity":["studio-aca408ec-r02:contract:person-studio-aca408ec-r01-1:208",0],"sourceOrder":25,"talentId":"person-studio-aca408ec-r01-1","creativeRole":"director","oldSourceOrder":1,"oldRowFinal":{"contractId":"studio-aca408ec-r01:contract:person-studio-aca408ec-r01-1:0","studioId":"studio-aca408ec-r01","terms":{"talentId":"person-studio-aca408ec-r01-1","annualSalary":141075,"signingBonus":25394,"termWeeks":208,"startWeek":0,"endWeekExclusive":208},"endedWeek":208,"reason":"entry"},"renewalRowFinal":{"contractId":"studio-aca408ec-r02:contract:person-studio-aca408ec-r01-1:208","studioId":"studio-aca408ec-r02","terms":{"talentId":"person-studio-aca408ec-r01-1","annualSalary":242680,"signingBonus":43682,"startWeek":208,"endWeekExclusive":416,"termWeeks":208},"endedWeek":416,"reason":"replacement"}},{"identity":["studio-aca408ec-r02:contract:person-studio-aca408ec-r01-2:208",0],"sourceOrder":26,"talentId":"person-studio-aca408ec-r01-2","creativeRole":"actor","oldSourceOrder":2,"oldRowFinal":{"contractId":"studio-aca408ec-r01:contract:person-studio-aca408ec-r01-2:0","studioId":"studio-aca408ec-r01","terms":{"talentId":"person-studio-aca408ec-r01-2","annualSalary":220859,"signingBonus":39755,"termWeeks":208,"startWeek":0,"endWeekExclusive":208},"endedWeek":208,"reason":"entry"},"renewalRowFinal":{"contractId":"studio-aca408ec-r02:contract:person-studio-aca408ec-r01-2:208","studioId":"studio-aca408ec-r02","terms":{"talentId":"person-studio-aca408ec-r01-2","annualSalary":346793,"signingBonus":62423,"startWeek":208,"endWeekExclusive":416,"termWeeks":208},"endedWeek":416,"reason":"replacement"}},{"identity":["studio-aca408ec-r02:contract:person-studio-aca408ec-r01-3:208",0],"sourceOrder":27,"talentId":"person-studio-aca408ec-r01-3","creativeRole":"actor","oldSourceOrder":3,"oldRowFinal":{"contractId":"studio-aca408ec-r01:contract:person-studio-aca408ec-r01-3:0","studioId":"studio-aca408ec-r01","terms":{"talentId":"person-studio-aca408ec-r01-3","annualSalary":745914,"signingBonus":134265,"termWeeks":208,"startWeek":0,"endWeekExclusive":208},"endedWeek":208,"reason":"entry"},"renewalRowFinal":{"contractId":"studio-aca408ec-r02:contract:person-studio-aca408ec-r01-3:208","studioId":"studio-aca408ec-r02","terms":{"talentId":"person-studio-aca408ec-r01-3","annualSalary":916663,"signingBonus":164999,"startWeek":208,"endWeekExclusive":416,"termWeeks":208},"endedWeek":416,"reason":"replacement"}},{"identity":["studio-aca408ec-r02:contract:person-studio-aca408ec-r01-4:208",0],"sourceOrder":28,"talentId":"person-studio-aca408ec-r01-4","creativeRole":"actor","oldSourceOrder":4,"oldRowFinal":{"contractId":"studio-aca408ec-r01:contract:person-studio-aca408ec-r01-4:0","studioId":"studio-aca408ec-r01","terms":{"talentId":"person-studio-aca408ec-r01-4","annualSalary":916051,"signingBonus":164889,"termWeeks":208,"startWeek":0,"endWeekExclusive":208},"endedWeek":208,"reason":"entry"},"renewalRowFinal":{"contractId":"studio-aca408ec-r02:contract:person-studio-aca408ec-r01-4:208","studioId":"studio-aca408ec-r02","terms":{"talentId":"person-studio-aca408ec-r01-4","annualSalary":1092446,"signingBonus":196640,"startWeek":208,"endWeekExclusive":416,"termWeeks":208},"endedWeek":416,"reason":"replacement"}},{"identity":["studio-aca408ec-r02:contract:person-studio-aca408ec-r01-5:208",0],"sourceOrder":29,"talentId":"person-studio-aca408ec-r01-5","creativeRole":"craft","oldSourceOrder":5,"oldRowFinal":{"contractId":"studio-aca408ec-r01:contract:person-studio-aca408ec-r01-5:0","studioId":"studio-aca408ec-r01","terms":{"talentId":"person-studio-aca408ec-r01-5","annualSalary":191216,"signingBonus":34419,"termWeeks":208,"startWeek":0,"endWeekExclusive":208},"endedWeek":208,"reason":"entry"},"renewalRowFinal":{"contractId":"studio-aca408ec-r02:contract:person-studio-aca408ec-r01-5:208","studioId":"studio-aca408ec-r02","terms":{"talentId":"person-studio-aca408ec-r01-5","annualSalary":257634,"signingBonus":46374,"startWeek":208,"endWeekExclusive":416,"termWeeks":208},"endedWeek":416,"reason":"replacement"}},{"identity":["studio-aca408ec-r01:contract:person-studio-aca408ec-r02-0:208",0],"sourceOrder":30,"talentId":"person-studio-aca408ec-r02-0","creativeRole":"writer","oldSourceOrder":6,"oldRowFinal":{"contractId":"studio-aca408ec-r02:contract:person-studio-aca408ec-r02-0:0","studioId":"studio-aca408ec-r02","terms":{"talentId":"person-studio-aca408ec-r02-0","annualSalary":225992,"signingBonus":40679,"termWeeks":208,"startWeek":0,"endWeekExclusive":208},"endedWeek":208,"reason":"entry"},"renewalRowFinal":{"contractId":"studio-aca408ec-r01:contract:person-studio-aca408ec-r02-0:208","studioId":"studio-aca408ec-r01","terms":{"talentId":"person-studio-aca408ec-r02-0","annualSalary":292260,"signingBonus":52607,"startWeek":208,"endWeekExclusive":416,"termWeeks":208},"endedWeek":416,"reason":"replacement"}},{"identity":["studio-aca408ec-r01:contract:person-studio-aca408ec-r02-1:208",0],"sourceOrder":31,"talentId":"person-studio-aca408ec-r02-1","creativeRole":"director","oldSourceOrder":7,"oldRowFinal":{"contractId":"studio-aca408ec-r02:contract:person-studio-aca408ec-r02-1:0","studioId":"studio-aca408ec-r02","terms":{"talentId":"person-studio-aca408ec-r02-1","annualSalary":313082,"signingBonus":56355,"termWeeks":208,"startWeek":0,"endWeekExclusive":208},"endedWeek":208,"reason":"entry"},"renewalRowFinal":{"contractId":"studio-aca408ec-r01:contract:person-studio-aca408ec-r02-1:208","studioId":"studio-aca408ec-r01","terms":{"talentId":"person-studio-aca408ec-r02-1","annualSalary":445718,"signingBonus":80229,"startWeek":208,"endWeekExclusive":416,"termWeeks":208},"endedWeek":416,"reason":"replacement"}},{"identity":["studio-aca408ec-r01:contract:person-studio-aca408ec-r02-2:208",0],"sourceOrder":32,"talentId":"person-studio-aca408ec-r02-2","creativeRole":"actor","oldSourceOrder":8,"oldRowFinal":{"contractId":"studio-aca408ec-r02:contract:person-studio-aca408ec-r02-2:0","studioId":"studio-aca408ec-r02","terms":{"talentId":"person-studio-aca408ec-r02-2","annualSalary":115209,"signingBonus":20738,"termWeeks":208,"startWeek":0,"endWeekExclusive":208},"endedWeek":208,"reason":"entry"},"renewalRowFinal":{"contractId":"studio-aca408ec-r01:contract:person-studio-aca408ec-r02-2:208","studioId":"studio-aca408ec-r01","terms":{"talentId":"person-studio-aca408ec-r02-2","annualSalary":191769,"signingBonus":34518,"startWeek":208,"endWeekExclusive":416,"termWeeks":208},"endedWeek":416,"reason":"replacement"}},{"identity":["studio-aca408ec-r01:contract:person-studio-aca408ec-r02-3:208",0],"sourceOrder":33,"talentId":"person-studio-aca408ec-r02-3","creativeRole":"actor","oldSourceOrder":9,"oldRowFinal":{"contractId":"studio-aca408ec-r02:contract:person-studio-aca408ec-r02-3:0","studioId":"studio-aca408ec-r02","terms":{"talentId":"person-studio-aca408ec-r02-3","annualSalary":765621,"signingBonus":137812,"termWeeks":208,"startWeek":0,"endWeekExclusive":208},"endedWeek":208,"reason":"entry"},"renewalRowFinal":{"contractId":"studio-aca408ec-r01:contract:person-studio-aca408ec-r02-3:208","studioId":"studio-aca408ec-r01","terms":{"talentId":"person-studio-aca408ec-r02-3","annualSalary":876801,"signingBonus":157824,"startWeek":208,"endWeekExclusive":416,"termWeeks":208},"endedWeek":416,"reason":"replacement"}},{"identity":["studio-aca408ec-r01:contract:person-studio-aca408ec-r02-4:208",0],"sourceOrder":34,"talentId":"person-studio-aca408ec-r02-4","creativeRole":"actor","oldSourceOrder":10,"oldRowFinal":{"contractId":"studio-aca408ec-r02:contract:person-studio-aca408ec-r02-4:0","studioId":"studio-aca408ec-r02","terms":{"talentId":"person-studio-aca408ec-r02-4","annualSalary":473558,"signingBonus":85240,"termWeeks":208,"startWeek":0,"endWeekExclusive":208},"endedWeek":208,"reason":"entry"},"renewalRowFinal":{"contractId":"studio-aca408ec-r01:contract:person-studio-aca408ec-r02-4:208","studioId":"studio-aca408ec-r01","terms":{"talentId":"person-studio-aca408ec-r02-4","annualSalary":656727,"signingBonus":118211,"startWeek":208,"endWeekExclusive":416,"termWeeks":208},"endedWeek":416,"reason":"replacement"}},{"identity":["studio-aca408ec-r01:contract:person-studio-aca408ec-r02-5:208",0],"sourceOrder":35,"talentId":"person-studio-aca408ec-r02-5","creativeRole":"craft","oldSourceOrder":11,"oldRowFinal":{"contractId":"studio-aca408ec-r02:contract:person-studio-aca408ec-r02-5:0","studioId":"studio-aca408ec-r02","terms":{"talentId":"person-studio-aca408ec-r02-5","annualSalary":250600,"signingBonus":45108,"termWeeks":208,"startWeek":0,"endWeekExclusive":208},"endedWeek":208,"reason":"entry"},"renewalRowFinal":{"contractId":"studio-aca408ec-r01:contract:person-studio-aca408ec-r02-5:208","studioId":"studio-aca408ec-r01","terms":{"talentId":"person-studio-aca408ec-r02-5","annualSalary":291337,"signingBonus":52441,"startWeek":208,"endWeekExclusive":416,"termWeeks":208},"endedWeek":416,"reason":"replacement"}},{"identity":["studio-aca408ec-r03:contract:person-studio-aca408ec-r03-0:208",0],"sourceOrder":36,"talentId":"person-studio-aca408ec-r03-0","creativeRole":"writer","oldSourceOrder":12,"oldRowFinal":{"contractId":"studio-aca408ec-r03:contract:person-studio-aca408ec-r03-0:0","studioId":"studio-aca408ec-r03","terms":{"talentId":"person-studio-aca408ec-r03-0","annualSalary":257755,"signingBonus":46396,"termWeeks":208,"startWeek":0,"endWeekExclusive":208},"endedWeek":208,"reason":"entry"},"renewalRowFinal":{"contractId":"studio-aca408ec-r03:contract:person-studio-aca408ec-r03-0:208","studioId":"studio-aca408ec-r03","terms":{"talentId":"person-studio-aca408ec-r03-0","annualSalary":324580,"signingBonus":58424,"startWeek":208,"endWeekExclusive":416,"termWeeks":208},"endedWeek":416,"reason":"replacement"}},{"identity":["studio-aca408ec-r03:contract:person-studio-aca408ec-r03-1:208",0],"sourceOrder":37,"talentId":"person-studio-aca408ec-r03-1","creativeRole":"director","oldSourceOrder":13,"oldRowFinal":{"contractId":"studio-aca408ec-r03:contract:person-studio-aca408ec-r03-1:0","studioId":"studio-aca408ec-r03","terms":{"talentId":"person-studio-aca408ec-r03-1","annualSalary":181799,"signingBonus":32724,"termWeeks":208,"startWeek":0,"endWeekExclusive":208},"endedWeek":208,"reason":"entry"},"renewalRowFinal":{"contractId":"studio-aca408ec-r03:contract:person-studio-aca408ec-r03-1:208","studioId":"studio-aca408ec-r03","terms":{"talentId":"person-studio-aca408ec-r03-1","annualSalary":282555,"signingBonus":50860,"startWeek":208,"endWeekExclusive":416,"termWeeks":208},"endedWeek":416,"reason":"replacement"}},{"identity":["studio-aca408ec-r03:contract:person-studio-aca408ec-r03-2:208",0],"sourceOrder":38,"talentId":"person-studio-aca408ec-r03-2","creativeRole":"actor","oldSourceOrder":14,"oldRowFinal":{"contractId":"studio-aca408ec-r03:contract:person-studio-aca408ec-r03-2:0","studioId":"studio-aca408ec-r03","terms":{"talentId":"person-studio-aca408ec-r03-2","annualSalary":330318,"signingBonus":59457,"termWeeks":208,"startWeek":0,"endWeekExclusive":208},"endedWeek":208,"reason":"entry"},"renewalRowFinal":{"contractId":"studio-aca408ec-r03:contract:person-studio-aca408ec-r03-2:208","studioId":"studio-aca408ec-r03","terms":{"talentId":"person-studio-aca408ec-r03-2","annualSalary":543983,"signingBonus":97917,"startWeek":208,"endWeekExclusive":416,"termWeeks":208},"endedWeek":416,"reason":"replacement"}},{"identity":["studio-aca408ec-r03:contract:person-studio-aca408ec-r03-3:208",0],"sourceOrder":39,"talentId":"person-studio-aca408ec-r03-3","creativeRole":"actor","oldSourceOrder":15,"oldRowFinal":{"contractId":"studio-aca408ec-r03:contract:person-studio-aca408ec-r03-3:0","studioId":"studio-aca408ec-r03","terms":{"talentId":"person-studio-aca408ec-r03-3","annualSalary":831383,"signingBonus":149649,"termWeeks":208,"startWeek":0,"endWeekExclusive":208},"endedWeek":208,"reason":"entry"},"renewalRowFinal":{"contractId":"studio-aca408ec-r03:contract:person-studio-aca408ec-r03-3:208","studioId":"studio-aca408ec-r03","terms":{"talentId":"person-studio-aca408ec-r03-3","annualSalary":1059738,"signingBonus":190753,"startWeek":208,"endWeekExclusive":416,"termWeeks":208},"endedWeek":416,"reason":"replacement"}}]
const PRIMARY = {"writer":"writing","director":"directing","actor":"acting","craft":"craft","scientist":"research"}
const SKILLS = {"acting":["actingTechnique","emotionalRange","dialogueDelivery","comicTiming","physicalPerformance","screenPresence"],"writing":["storyStructure","characterDevelopment","dialogue","originality","narrativePacing","rewriting"],"directing":["visualStorytelling","performanceDirection","toneControl","directingPacing","productionManagement","adaptability"],"craft":["cinematography","editing","productionDesign","soundAndMusic","effectsExecution","technicalCoordination"],"research":["scientificMethod","acoustics","instrumentation","experimentation","engineering","documentation"]}
export const PAYLOAD_CAP = 64 * 1024
const ROW_CAP = 4096
const requireValue = (ok, why) => { if (!ok) throw new Error(`STOP_A208_${why}`) }
const plain = value => {
  requireValue(value !== null && typeof value === 'object' && !Array.isArray(value) &&
    [Object.prototype, null].includes(Object.getPrototypeOf(value)), 'PLAIN_DATA')
  requireValue(Object.values(Object.getOwnPropertyDescriptors(value)).every(d => Object.hasOwn(d, 'value')), 'ACCESSOR')
  return value
}
const array = (value, cap) => { requireValue(Array.isArray(value) && value.length <= cap, 'ARRAY_CAP'); return value }
const one = (rows, why) => { requireValue(rows.length === 1, why); return rows[0] }
const finite = value => { requireValue(Number.isFinite(value), 'FINITE_INPUT'); return value }
const text = value => { requireValue(typeof value === 'string' && Buffer.byteLength(value) <= 512, 'TEXT_CAP'); return value }
const texts = value => array(value, 16).map(text)
const jsonEqual = (a,b) => JSON.stringify(a) === JSON.stringify(b)
const occurrence = (rows,index,id) => rows.slice(0,index).filter(row => row.contractId === id).length
function personProjection(person, selected) {
  plain(person)
  requireValue(person.id === selected.talentId && person.role === selected.creativeRole, 'PERSON_ROLE')
  const discipline = PRIMARY[person.role], profile = plain(plain(person.skills)[discipline])
  const skills = { [discipline]: Object.fromEntries(SKILLS[discipline].map(key => {
    const value = finite(plain(profile[key]).perceived)
    requireValue(value >= 1 && value <= 99, 'SKILL_RANGE')
    return [key, { perceived: value }]
  })) }
  const age=finite(person.age), fame=finite(person.fame)
  requireValue(Number.isInteger(age) && age >= 0 && age <= 160 && fame >= 0 && fame <= 100, 'AGE_FAME_RANGE')
  return {id:person.id,role:person.role,age,fame,skills}
}
function policyProjection(policy) {
  plain(policy);plain(policy.affinities)
  return {version:finite(policy.version),reserveWeeks:finite(policy.reserveWeeks),
    marketingRatio:finite(policy.marketingRatio),negativeScale:finite(policy.negativeScale),
    affinities:Object.fromEntries(['adventure','comedy','crime','drama','horror','romance'].map(g=>[g,finite(policy.affinities[g])]))}
}
function caseProjection(kase) {
  plain(kase)
  return {talentId:text(kase.talentId),subjectStudioId:text(kase.subjectStudioId),contractId:text(kase.contractId),
    openedWeek:finite(kase.openedWeek),outcome:text(kase.outcome),closedWeek:finite(kase.closedWeek),reason:text(kase.reason)}
}
function receiptProjection(receipt) {
  plain(receipt)
  return {eventId:text(receipt.eventId),kind:text(receipt.kind),week:finite(receipt.week),
    talentId:text(receipt.talentId),studioId:text(receipt.studioId),reasons:texts(receipt.reasons),dropped:texts(receipt.dropped)}
}
function selectedRow(state, selected) {
  const talent=array(state.talent,4096),employment=array(state.hollywood.employment,2048)
  const person=one(talent.filter(p=>p.id===selected.talentId),'PERSON_COUNT')
  const histories=employment.map((row,sourceOrder)=>({row,sourceOrder})).filter(x=>x.row.terms.talentId===selected.talentId)
  requireValue(histories.length===2,'SUBJECT_HISTORY_COUNT')
  const old=one(histories.filter(x=>x.row.contractId===selected.oldRowFinal.contractId),'OLD_COUNT')
  const current=one(histories.filter(x=>x.row.contractId===selected.identity[0]),'CURRENT_COUNT')
  requireValue(old.sourceOrder===selected.oldSourceOrder && jsonEqual(old.row,selected.oldRowFinal),'OLD_IDENTITY_TERMS')
  const currentExpected={...selected.renewalRowFinal,endedWeek:null}
  requireValue(current.sourceOrder===selected.sourceOrder && occurrence(employment,current.sourceOrder,current.row.contractId)===selected.identity[1] &&
    jsonEqual(current.row,currentExpected),'CURRENT_IDENTITY_OCCURRENCE_ORDER_TERMS')
  const cases=array(state.talentMarket.cases,2048).map((row,sourceOrder)=>({row,sourceOrder})).filter(x=>x.row.talentId===selected.talentId)
  const kase=one(cases,'CASE_COUNT')
  requireValue(kase.row.contractId===old.row.contractId && kase.row.subjectStudioId===old.row.studioId && kase.row.openedWeek===196 &&
    kase.row.closedWeek===208 && kase.row.outcome==='settled','CASE_PHASE')
  const receipt=one(array(state.talentMarket.receipts,8192).map((row,sourceOrder)=>({row,sourceOrder})).filter(x=>
    x.row.talentId===selected.talentId && x.row.kind==='settled' && x.row.week===208),'WINNER_COUNT')
  requireValue(receipt.row.studioId===current.row.studioId,'WINNER_STUDIO')
  const businesses=array(state.hollywood.businesses,16)
  const business=one(businesses.map((row,sourceOrder)=>({row,sourceOrder})).filter(x=>x.row.studioId===receipt.row.studioId),'POLICY_COUNT')
  requireValue(old.row.studioId!==state.hollywood.playerStudioId && business.row.studioId!==state.hollywood.playerStudioId,'RIVAL_CONTEXT')
  const proposals=array(state.talentMarket.proposals,2048).filter(p=>p.talentId===selected.talentId)
  requireValue(proposals.length===0,'CLOSED_PROPOSALS')
  const terminations=array(state.hollywood.receipts,8192).map((row,sourceOrder)=>({row,sourceOrder})).filter(x=>
    x.row.kind==='employment' && x.row.reason==='termination' && x.row.talentId===selected.talentId)
  requireValue(terminations.length<=2 && terminations.every(x=>x.row.contractId===old.row.contractId),'TERMINATION_CONTEXT')
  const terminationReceipts=terminations.map(({row,sourceOrder})=>({sourceOrder,eventId:text(row.eventId),week:finite(row.week),
    studioId:text(row.studioId),kind:row.kind,talentId:row.talentId,contractId:row.contractId,reason:row.reason}))
  return {identity:selected.identity,sourceOrder:selected.sourceOrder,person:personProjection(person,selected),
    oldEmployment:{sourceOrder:old.sourceOrder,row:old.row},currentEmployment:{sourceOrder:current.sourceOrder,row:current.row},
    case:{sourceOrder:kase.sourceOrder,row:caseProjection(kase.row)},winnerReceipt:{sourceOrder:receipt.sourceOrder,row:receiptProjection(receipt.row)},
    business:{sourceOrder:business.sourceOrder,studioId:business.row.studioId,policy:policyProjection(business.row.policy)},
    currentProposalCount:0,terminationReceipts}
}
export function freezeSettlement208(state, cap=PAYLOAD_CAP) {
  requireValue(Number.isSafeInteger(cap) && cap>=1 && cap<=PAYLOAD_CAP,'PAYLOAD_CAP_ARGUMENT')
  requireValue(state?.market?.tick===208 && state.seed===SEED,'PHASE_SEED')
  const prefix='{"schema":"1370-a208-selected16-snapshot-r1","phase":"after-natural-tick208-return","week":208,"seed":"'+SEED+'","rows":['
  const suffix='],"pricingHelpersCalled":0,"extraRngCalls":0,"premiumAttribution":false,"floorAttribution":false}\n'
  let bytes=Buffer.byteLength(prefix)+Buffer.byteLength(suffix)
  requireValue(bytes<=cap,'PAYLOAD_CAP')
  const pieces=[prefix]
  for(const selected of SELECTION) {
    const token=(pieces.length>1?',':'')+JSON.stringify(selectedRow(state,selected))
    requireValue(Buffer.byteLength(token)<=ROW_CAP,'ROW_CAP')
    const next=bytes+Buffer.byteLength(token);requireValue(next<=cap,'PAYLOAD_CAP')
    pieces.push(token);bytes=next
  }
  pieces.push(suffix)
  const frozen=Buffer.from(pieces.join(''),'utf8');requireValue(frozen.length===bytes,'PAYLOAD_BYTES')
  return frozen // owned serialized bytes, no live state references retained
}
/** R9 core remains byte-identical; exactly one factory and416 real engine tick calls. */
export function observeSettlement208Ledger(factory,tick,expected=EXPECTED,clock=Date.now) {
  let frozen=null,captures=0
  const result=observeLedger(factory,state=>{
    const next=tick(state)
    if(next?.market?.tick===208) {requireValue(frozen===null,'DUPLICATE_PHASE');frozen=freezeSettlement208(next);captures++}
    return next
  },expected,clock)
  requireValue(captures===1 && Buffer.isBuffer(frozen),'MISSING_PHASE')
  return {...result,settlement208Bytes:frozen,settlement208Sha256:createHash('sha256').update(frozen).digest('hex'),settlement208Rows:16}
}
