// ONE unexecuted fixed-input public-route diagnostic; no acceptance or joint-family claim.
import {createHash} from 'node:crypto'
import {readFileSync,writeFileSync,existsSync,realpathSync} from 'node:fs'
import {dirname,isAbsolute} from 'node:path'
import {gunzipSync} from 'node:zlib'
import {performance} from 'node:perf_hooks'
import {makeSave,migrateToLive,stableStringify,validateSaveV26,validateSaveV48} from '/Users/zacheryspector/The-Movies-headless-program/src/core/save.ts'
import {applyActions} from '/Users/zacheryspector/The-Movies-headless-program/src/core/actions.ts'
import {tick} from '/Users/zacheryspector/The-Movies-headless-program/src/core/tick.ts'
import {adoptionQuote} from '/Users/zacheryspector/The-Movies-headless-program/src/core/technologyAdoption.ts'
import {conditionRecord,conditionFacts,outstandingLoan} from '/Users/zacheryspector/The-Movies-headless-program/src/core/corporateConditionLive.ts'
import {loanMaxPrincipal} from '/Users/zacheryspector/The-Movies-headless-program/src/core/studioLoan.ts'
import {isOperatingStudio} from '/Users/zacheryspector/The-Movies-headless-program/src/core/operatingState.ts'
import {queryPlacement,facilityDemolitionRefusal,facilityDemolitionRefund,blueprintById} from '/Users/zacheryspector/The-Movies-headless-program/src/core/placement.ts'
import {nextLaboratoryOrigin} from '/Users/zacheryspector/The-Movies-headless-program/src/harness/p13b/fixtures.ts'
import {TUNING} from '/Users/zacheryspector/The-Movies-headless-program/src/core/tuning.ts'
import type {GameState} from '/Users/zacheryspector/The-Movies-headless-program/src/core/types.ts'
const path='/Users/zacheryspector/The-Movies-headless-program/tests/fixtures/p13b/legacy-v26-lighting-restored-795.json.gz'
const request={technologyId:'lighting-control-01',stageFacilityId:'facility-soundstage-12'} as const
const closureDuration=26, physicalDuration=4
const targetDuration=closureDuration-physicalDuration+1, horizon=900, budget=30_000, started=0
const output=process.env.P15B_PENDING_PLAYER_CAPITAL_JSON
if(!output||!isAbsolute(output)||existsSync(output)||realpathSync(dirname(output))!==dirname(output))throw new Error('Required fresh absolute output with ordinary existing parent')
const bytes=(v:unknown)=>stableStringify(v),sha=(v:string|Buffer)=>createHash('sha256').update(v).digest('hex')
class Premise extends Error{}
function check(v:unknown,m:string):asserts v{if(!v)throw new Premise(m)}
function time(){check(performance.now()-started<=budget,'standalone diagnostic30s total cap exceeded')}
const result:Record<string,unknown>={kind:'fixed795→one paid unusedlab→distress23 edge→real demolition→minimumloan→stage12 lighting pending-closure DIAGNOSTIC',status:'STARTED',
 request,inputWeek:795,horizon,targetDuration,budgetMs:budget,seed:'p13a-core-causal-01',ticks:0,admissions:[],conditions:[],actions:[],
 scope:'player pending adoption ONLY; original failed joint adoption/proposal/rivalbuild leaf retained'}
let retainedOriginal:GameState|undefined,retainedOriginalHash:string|undefined,retainedParsed:unknown,retainedParsedHash:string|undefined
function admit(s:GameState,label:string){
 time();const before=sha(bytes(s));const saved=makeSave(s);check(validateSaveV48(saved)===saved,'actual live48 reader identity')
 check(sha(bytes(s))===before,'admission mutated '+label);(result.admissions as unknown[]).push({label,stateSHA256:before,week:s.market.tick});time()
}
function observe(s:GameState){
 const own=s.hollywood!.playerStudioId,c=conditionRecord(s,own),f=conditionFacts(s,own)
 const cover=f.cash/(f.weeklyFixedCost+f.loanInstallment)
 ;(result.conditions as unknown[]).push({week:s.market.tick,condition:c?.condition??null,cash:f.cash,
 weeklyFixedCost:f.weeklyFixedCost,loanInstallment:f.loanInstallment,cover})
 return {own,c,f,cover}
}
function action(s:GameState,a:Parameters<typeof applyActions>[1][number],label:string){
 time();const before=sha(bytes(s)),next=applyActions(s,[a]);check(sha(bytes(s))===before,'public action mutated '+label)
 admit(next,label);(result.actions as unknown[]).push({kind:a.kind,week:s.market.tick,inputSHA256:before,outputSHA256:sha(bytes(next))});return next
}
try{
 const compressed=readFileSync(path),raw=gunzipSync(compressed)
 check(sha(compressed)==='47d266bccb7871450e089f886d4565c970e97ad1b0af54d297733b064416312f','exact gzip changed')
 check(sha(raw)==='f48da034f2bd64c35b23361ab12726b2ba0a8f02a7d8dc59caa84055f92f5314','exact raw changed')
 const parsed=JSON.parse(raw.toString()),beforeParsed=sha(bytes(parsed));retainedParsed=parsed;retainedParsedHash=beforeParsed;validateSaveV26(parsed)
 check(sha(bytes(parsed))===beforeParsed,'historical26 reader mutated capture')
 const loaded=migrateToLive(parsed);check(sha(bytes(parsed))===beforeParsed,'public migration mutated capture')
 const original=loaded.state,originalHash=sha(bytes(original));retainedOriginal=original;retainedOriginalHash=originalHash;let state=original
 check(state.seed==='p13a-core-causal-01'&&state.market.tick===795&&state.studio.cash===1_105_240,'exact capture premise')
 check(TUNING.CORPORATE_CLOSURE_DISTRESS_WEEKS===26&&TUNING.CORPORATE_WARN_COVER_WEEKS===4&&TUNING.LOAN_AMOUNT_STEP===1000,'frozen policy changed')
 admit(state,'original795')
 const own=state.hollywood!.playerStudioId
 check(state.technology.access.some(a=>a.studioId===own&&a.technologyId===request.technologyId&&a.acquiredWeek===791&&a.route==='research'),'earned access791 absent')
 check(state.technology.adoptions.some(a=>a.studioId===own&&a.technologyId===request.technologyId&&a.cancelledWeek===793&&a.stageFacilityId==='facility-soundstage-07'),'retained cancelled original absent')
 const quoteBefore=sha(bytes(state)),priced=adoptionQuote(state,request)
 check(sha(bytes(state))===quoteBefore,'initial adoption quote mutated')
 result.initialQuote=priced
 check(priced.ok&&priced.total>0,'fixed stage12 initial public quote refused; no alternate target')
 check(priced.reusedEquipmentAssetId==='studio-aca408ec-player:equipment:1','actual unheld retained equipment not reused')
 check(priced.components.filter(c=>c.source==='physical').reduce((n,c)=>n+(c.weeks??0),0)===4,'actual lighting physical4weeks premise changed')
 // ONE predeclared publiccapital policy, existing deterministic grid quote helper;
 // no alternate asset/target/amount/timing and no synthetic placement/receipt.
 const siteInput=sha(bytes(state)),origin=nextLaboratoryOrigin(state)
 check(sha(bytes(state))===siteInput,'existing grid query helper mutated input')
 const buildingRequest={blueprintId:'research-laboratory',origin},buildingQuote=queryPlacement(state,buildingRequest)
 check(sha(bytes(state))===siteInput,'public placement quote mutated')
 check(buildingQuote.ok&&buildingQuote.cost===900_000&&buildingQuote.weeklyOperatingCost===3000&&buildingQuote.buildWeeks===12,'one laboratory quote premise differs/refuses')
 const oldPlacements=new Set(state.placement.facilities.map(p=>p.id))
 const preCapitalCash=state.studio.cash
 state=action(state,{kind:'placeFacility',placement:buildingRequest},'oneRealPaidLaboratory795')
 const addedLab=state.placement.facilities.filter(p=>!oldPlacements.has(p.id))
 check(addedLab.length===1,'one actual placement required')
 const newLab=addedLab[0]!
 check(state.studio.cash===preCapitalCash-buildingQuote.cost,'actual publiccapital debit differs')
 result.capital={origin,quote:buildingQuote,placementId:newLab.id,facilityId:newLab.facilityId,projectId:newLab.projectId,paid:preCapitalCash-state.studio.cash}
 let demolitionDone=false
 let committedId:string|null=null,committedWeek:number|null=null
 while(state.market.tick<=horizon){
  time();const {c,f,cover}=observe(state)
  const closed=state.studioClosure.closures.find(r=>r.studioId===own)
  if(closed){
   admit(state,'actualClosure')
   check(committedId!==null,'actual closure before fixed commitment point')
   const adoption=state.technology.adoptions.find(a=>a.id===committedId)!
   const disposition=closed.dispositions.find(d=>d.subjectKind==='adoption'&&d.subjectId===committedId)
   result.closure={week:closed.closureWeek,closureId:closed.closureId,committedId,committedWeek,
    adoption:{operationalWeek:adoption.operationalWeek,cancelledWeek:adoption.cancelledWeek},disposition,loanInstallmentsPaid:state.ledger.filter(e=>e.kind==='loanInstallment').reduce((n,e)=>n-e.amount,0),facilityOpex:state.ledger.filter(e=>e.kind==='facilityOpex'&&e.week>=795).reduce((n,e)=>n-e.amount,0)}
   check(adoption.operationalWeek===null&&adoption.cancelledWeek===null&&disposition?.status==='pending','closure did not retain actual pending player adoption')
   check(sha(bytes(original))===originalHash&&sha(bytes(parsed))===beforeParsed,'original input final purity')
   result.status='ACTUAL_PENDING_PLAYER_ADOPTION_CLOSURE_OBSERVED_DIAGNOSTIC_NOT_ACCEPTANCE';break
  }
  check(isOperatingStudio(state,own),'actual player terminal; no tick')
  check(c?.condition.stage!=='recovery','actual recovery resets duration; stop, no timing retry')
  if(committedId!==null){
   const a=state.technology.adoptions.find(a=>a.id===committedId)!
   check(a.operationalWeek===null&&a.cancelledWeek===null,'adoption operational/cancelled before closure; stop')
  }else if(c?.condition.stage==='distress'&&c.condition.distressWeeks>=targetDuration){
   check(c.condition.distressWeeks===targetDuration,'missed exact derived fixed duration23; no retiming')
   admit(state,'fixedCommitmentInput')
   check(outstandingLoan(state,own)===undefined,'existing loan bars route')
   check(!demolitionDone,'single demolition only')
   const lab=state.placement.facilities.find(p=>p.id===newLab.id)
   check(lab?.status==='operational'&&lab.blueprintId==='research-laboratory','new fully paid unused laboratory not operational')
   check(!state.placement.facilities.some(p=>p.installation?.targetFacilityId===newLab.facilityId),'new laboratory unexpectedly has modules')
   const demolitionRequest={placementId:newLab.id},demolitionInput=sha(bytes(state))
   const refusal=facilityDemolitionRefusal(state,demolitionRequest)
   check(sha(bytes(state))===demolitionInput,'demolition eligibility mutated input')
   check(refusal===null,'one actual laboratory demolition refused; no alternate facility')
   const bp=blueprintById('research-laboratory');check(bp!==null,'laboratory blueprint missing')
   const refund=facilityDemolitionRefund(bp);check(refund===450_000,'authored realcapitalrefund changed')
   const preDemolitionCash=state.studio.cash
   state=action(state,{kind:'demolishFacility',demolition:demolitionRequest},'actualNewLaboratoryDemolition')
   check(state.studio.cash-preDemolitionCash===refund,'actual refund differs')
   check(!state.placement.facilities.some(p=>p.id===newLab.id),'demolition did not withdraw real placement')
   result.demolition={week:state.market.tick,placementId:newLab.id,refund,ledger:state.ledger.filter(e=>e.kind==='facilityDemolitionRefund'&&e.constructionProjectId===newLab.projectId)}
   demolitionDone=true
   const freshFacts=conditionFacts(state,own)
   const principal=Math.max(1000,Math.ceil((priced.total-state.studio.cash)/1000)*1000),maximum=loanMaxPrincipal(freshFacts.weeklyFixedCost)
   result.minimumLoan={week:state.market.tick,actualCash:state.studio.cash,quotedDebit:priced.total,principal,maximum,postDemolitionFacts:freshFacts}
   check(principal<=maximum,'single minimum lawful principal exceeds maximum; no amount sweep')
   const withLoan=action(state,{kind:'takeLoan',principal},'actualPublicLoan')
   const afterLoanHash=sha(bytes(withLoan)),fresh=adoptionQuote(withLoan,request)
   check(sha(bytes(withLoan))===afterLoanHash,'fresh funded quote mutated')
   result.fundedQuote=fresh
   check(fresh.ok&&bytes(fresh.components)===bytes(priced.components)&&fresh.total===priced.total,'fresh quote differs/refuses; no stale-price commit or principal recalculation')
   const ids=new Set(withLoan.technology.adoptions.map(a=>a.id))
   state=action(withLoan,{kind:'adoptTechnology',...request},'actualPublicAdoption')
   const added=state.technology.adoptions.filter(a=>!ids.has(a.id));check(added.length===1,'exactly one real adoption required')
   const a=added[0]!;committedId=a.id;committedWeek=state.market.tick
   const facts=conditionFacts(state,own),residualCover=facts.cash/(facts.weeklyFixedCost+facts.loanInstallment)
   check(facts.cash>=0&&residualCover<4,'residual not nonnegative-low; stop without ticks')
   const plans=state.placement.facilities.filter(p=>a.physicalProjectIds.includes(p.projectId))
   check(plans.length>0,'real physical commitments absent')
   result.committed={id:a.id,week:committedWeek,cash:facts.cash,weeklyFixedCost:facts.weeklyFixedCost,
    installment:facts.loanInstallment,cover:residualCover,loan:outstandingLoan(state,own),
    physical:plans.map(p=>({projectId:p.projectId,placedWeek:p.placedWeek,completesWeek:p.completesWeek,status:p.status}))}
   check(plans.every(p=>p.completesWeek>committedWeek!),'physical completion already reached')
  }
  check(state.market.tick<horizon,'fixed900 horizon reached; no continuation')
  const at=state.market.tick;state=tick(state);check(state.market.tick===at+1,'ordinary full tick clock mismatch')
  result.ticks=Number(result.ticks)+1
 }
}catch(e){result.status=e instanceof Premise?'UNMET_SINGLE_ROUTE_PREMISE_NOT_ACCEPTANCE':'DIAGNOSTIC_ERROR_NOT_ACCEPTANCE';result.error=(e as Error).message}
result.inputPurity={historical:retainedParsedHash===undefined?null:sha(bytes(retainedParsed))===retainedParsedHash,
 migrated:retainedOriginal===undefined?null:sha(bytes(retainedOriginal))===retainedOriginalHash}
if((result.inputPurity as {historical:boolean|null;migrated:boolean|null}).historical===false||(result.inputPurity as {historical:boolean|null;migrated:boolean|null}).migrated===false){result.status='DIAGNOSTIC_ERROR_NOT_ACCEPTANCE';result.error='retained original input purity failed'}
result.elapsedMs=performance.now()-started
writeFileSync(output,JSON.stringify(result,null,2)+'\n',{flag:'wx'})
console.log(JSON.stringify({status:result.status,ticks:result.ticks,error:result.error??null,diagnosticSHA256:sha(readFileSync(output))}))
if(result.status!=='ACTUAL_PENDING_PLAYER_ADOPTION_CLOSURE_OBSERVED_DIAGNOSTIC_NOT_ACCEPTANCE')process.exitCode=2
