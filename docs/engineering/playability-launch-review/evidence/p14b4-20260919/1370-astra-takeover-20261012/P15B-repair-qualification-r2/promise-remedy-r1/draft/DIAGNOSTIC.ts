// Unexecuted ONE-policy diagnostic. Original four tests and core5s budgets unchanged.
import {createHash} from 'node:crypto'
import {readFileSync,writeFileSync,existsSync,realpathSync} from 'node:fs'
import {dirname,isAbsolute} from 'node:path'
import {gunzipSync} from 'node:zlib'
import {performance} from 'node:perf_hooks'
import {makeSave,migrateToLive,stableStringify,validateSaveV35,validateSaveV48} from '/Users/zacheryspector/The-Movies-headless-program/src/core/save.ts'
import {tick} from '/Users/zacheryspector/The-Movies-headless-program/src/core/tick.ts'
import {applyTakeLoan,conditionRecord,conditionFacts,outstandingLoan} from '/Users/zacheryspector/The-Movies-headless-program/src/core/corporateConditionLive.ts'
import {loanMaxPrincipal} from '/Users/zacheryspector/The-Movies-headless-program/src/core/studioLoan.ts'
import {isOperatingStudio} from '/Users/zacheryspector/The-Movies-headless-program/src/core/operatingState.ts'
import {retirementRecordFor} from '/Users/zacheryspector/The-Movies-headless-program/src/core/careerLifecycle.ts'
import type {GameState} from '/Users/zacheryspector/The-Movies-headless-program/src/core/types.ts'
const fixture='/Users/zacheryspector/The-Movies-headless-program/tests/fixtures/p14/genuine-v35-c2b-corpus/genuine-v35-c2b-rival-incumbent-cohorts.json.gz'
const gzipSHA='afb89ad0a5f1e972564d1389c800fb544e5082e8a8dddb4bbd5a2a43520e085d'
const rawSHA='8b4c1934222bc28da2bd4517b3967350cc01e2517cb18044246a3a65323f2fa8'
const output=process.env.P15B_PROMISE_PUBLIC_REMEDY_JSON
if(!output||!isAbsolute(output)||existsSync(output)||realpathSync(dirname(output))!==dirname(output))throw new Error('Required fresh absolute output with ordinary existing parent')
const started=performance.now(),budgetMs=30_000,horizon=2704,target=2695
const bytes=(v:unknown)=>stableStringify(v),sha=(v:string|Buffer)=>createHash('sha256').update(v).digest('hex')
class Stop extends Error{}
function check(v:unknown,m:string):asserts v{if(!v)throw new Stop(m)}
function clock(){check(performance.now()-started<=budgetMs,'diagnostic30s cap exceeded; not original core5s budget')}
const result:Record<string,unknown>={kind:'genuine2600 first-eligible ONE maximum publicloan →2695 prerequisite diagnostic',status:'STARTED',budgetMs,horizon,target,ticks:0,admissions:[],conditions:[],scope:'NOT four-control qualification; no alternate remedy/timing/amount policy'}
let parsed:unknown,parsedHash:string|undefined,original:GameState|undefined,originalHash:string|undefined,state:GameState|undefined
const person='person-cohort-208-actor-1',issuer='studio-25969b11-r01'
function promise(s:GameState,id:string){const rows=s.promises.filter(p=>p.promiseId===id);check(rows.length===1,'exactly one '+id);return rows[0]!}
function summary(s:GameState){const own=s.hollywood!.playerStudioId,c=conditionRecord(s,own),f=conditionFacts(s,own);return {week:s.market.tick,cash:s.studio.cash,condition:c?.condition??null,fixedCost:f.weeklyFixedCost,installment:f.loanInstallment,operating:isOperatingStudio(s,own),outstandingLoan:outstandingLoan(s,own)??null}}
function admit(s:GameState,label:string){clock();const before=sha(bytes(s)),saved=makeSave(s);validateSaveV48(saved);check(sha(bytes(s))===before,'admission mutated '+label);(result.admissions as unknown[]).push({label,week:s.market.tick,stateSHA256:before});clock()}
let terminals:string|undefined
try{
 const compressed=readFileSync(fixture);check(sha(compressed)===gzipSHA,'genuine gzip changed');const raw=gunzipSync(compressed);check(sha(raw)===rawSHA,'manifest raw hash changed')
 parsed=JSON.parse(raw.toString());parsedHash=sha(bytes(parsed));const historical=validateSaveV35(parsed);check(historical.state.market.tick===2600,'own-era2600 premise')
 const loaded=migrateToLive(historical);check(sha(bytes(parsed))===parsedHash,'historical reader/migration mutated input');original=loaded.state;originalHash=sha(bytes(original));state=original;admit(state,'original2600')
 const p=promise(state,'promise-148');check(p.outcome===null&&p.progress===0&&p.beneficiaryPersonId===person&&p.issuerStudioId===issuer&&p.windowStartWeek===2496&&p.dueWeekExclusive===2704&&p.contractId==='studio-25969b11-r01:contract:person-cohort-208-actor-1:2496','original148 premise')
 const settled=[promise(state,'promise-132'),promise(state,'promise-142')];check(settled[0]!.outcome==='SATISFIED'&&settled[1]!.outcome==='BROKEN','settled132142 premise');terminals=bytes(settled)
 let borrowed=false
 while(state.market.tick<=horizon){
  clock();const own=state.hollywood!.playerStudioId,snap=summary(state);(result.conditions as unknown[]).push(snap)
  check(bytes([promise(state,'promise-132'),promise(state,'promise-142')])===terminals,'settled132142 changed')
  if(!isOperatingStudio(state,own)){admit(state,'actualTerminal');result.closure=state.studioClosure.closures.find(c=>c.studioId===own)??null;throw new Stop('actual player closure/terminal before2695; no further tick')}
  if(state.market.tick===target){
   admit(state,'actual2695');const current=promise(state,'promise-148'),retirement=retirementRecordFor(state,person),business=state.hollywood!.businesses.find(b=>b.studioId===issuer)
   result.targetPremises={promise:{outcome:current.outcome,progress:current.progress,beneficiaryPersonId:current.beneficiaryPersonId,issuerStudioId:current.issuerStudioId,windowStartWeek:current.windowStartWeek,dueWeekExclusive:current.dueWeekExclusive,contractId:current.contractId},retirement:retirement??null,rivalProductionCount:business?.productions.length??null}
   check(current.outcome===null&&current.progress===0&&current.beneficiaryPersonId===person&&current.issuerStudioId===issuer&&current.windowStartWeek===2496&&current.dueWeekExclusive===2704&&current.contractId==='studio-25969b11-r01:contract:person-cohort-208-actor-1:2496','actual2695 promise premise unmet')
   check(retirement?.announcedWeek===2566&&retirement.effectiveWeek===2704&&retirement.status==='announced','actual2695 retirement premise unmet');check(business?.productions.length===0,'actual2695 no rival production premise unmet')
   result.status='ACTUAL2695_PREREQUISITE_MET_ONLY_NOT_FOUR_TESTS';break
  }
  const c=conditionRecord(state,own),f=conditionFacts(state,own),maximum=loanMaxPrincipal(f.weeklyFixedCost)
  if(!borrowed&&state.founding===null&&c?.condition.week===state.market.tick&&(c.condition.stage==='warning'||c.condition.stage==='distress')&&outstandingLoan(state,own)===undefined&&maximum>=1000){
   admit(state,'firstEligibleLoanInput');const before=sha(bytes(state)),next=applyTakeLoan(state,maximum);check(sha(bytes(state))===before,'public loan mutated input');admit(next,'actualPublicMaximumLoan')
   const added=next.corporateCondition.loans.filter(l=>!state!.corporateCondition.loans.some(old=>old.loanId===l.loanId));check(added.length===1,'one actual loan required');result.loan={input:snap,principal:maximum,contract:added[0],cashAfter:next.studio.cash,principalLedger:next.ledger.slice(state.ledger.length)};state=next;borrowed=true
  }
  check(state.market.tick<horizon,'horizon before target premise');state=tick(state);result.ticks=(result.ticks as number)+1
 }
}catch(error){result.status=error instanceof Stop?'STOP_UNMET_PREMISE_OR_CAP':'ERROR';result.reason=error instanceof Error?error.message:String(error);process.exitCode=error instanceof Stop?2:1}
finally{
 try{check(!parsedHash||sha(bytes(parsed))===parsedHash,'original historical input final purity');check(!originalHash||sha(bytes(original))===originalHash,'original migrated input final purity');result.originalInputPure=true}catch(error){result.status='ERROR_INPUT_MUTATION';result.reason=String(error);process.exitCode=1}
 try{if(state){result.final=summary(state);result.settled132142=[promise(state,'promise-132'),promise(state,'promise-142')].map(p=>({promiseId:p.promiseId,outcome:p.outcome,outcomeWeek:p.outcomeWeek,progress:p.progress}))}}catch(error){result.finalizeError=error instanceof Error?error.message:String(error);if(result.status==='ACTUAL2695_PREREQUISITE_MET_ONLY_NOT_FOUR_TESTS'){result.status='ERROR_FINALIZATION';process.exitCode=1}}
 result.elapsedTimingScope='driver body after module imports; future external30s watchdog includes startup';result.elapsedMs=Math.round(performance.now()-started);writeFileSync(output,JSON.stringify(result,null,2)+'\n',{flag:'wx',mode:0o600})
}
