// ONE boundary producer diagnostic, not natural player-survival or closure qualification.
import {readFileSync,writeFileSync,existsSync,realpathSync} from 'node:fs'
import {dirname,isAbsolute} from 'node:path'
import {createHash} from 'node:crypto'
import {gunzipSync} from 'node:zlib'
import {performance} from 'node:perf_hooks'
import {validateSaveV45,migrateToLive,makeSave,validateSaveV48,stableStringify} from '/Users/zacheryspector/The-Movies-headless-program/src/core/save.ts'
import {tick} from '/Users/zacheryspector/The-Movies-headless-program/src/core/tick.ts'
import {isOperatingStudio} from '/Users/zacheryspector/The-Movies-headless-program/src/core/operatingState.ts'
import type {GameState} from '/Users/zacheryspector/The-Movies-headless-program/src/core/types.ts'
const output=process.env.P15B_RIVAL_INSTRUMENT_BOUNDARY_JSON
if(!output||!isAbsolute(output)||existsSync(output)||realpathSync(dirname(output))!==dirname(output))throw new Error('fresh absolute output required')
const started=performance.now(),studio='studio-aca408ec-r01',facility=studio+':laboratory:0'
const file='/Users/zacheryspector/The-Movies-headless-program/tests/fixtures/p14/genuine-v45-recovery-witnesses-1368/calendar.json.gz'
const sha=(x:string|Buffer)=>createHash('sha256').update(x).digest('hex'),bytes=(x:unknown)=>stableStringify(x)
class Premise extends Error{}
function check(x:unknown,m:string):asserts x{if(!x)throw new Premise(m)}
function clock(){check(performance.now()-started<=30000,'internal30s cap exceeded')}
const result:Record<string,unknown>={status:'STARTED',mode:'rival transaction harness; develop:true/deferPlayerClosure:true explicitly NOT natural player survival',inputWeek:104,producerInputWeek:260,outputWeek:261,ticks:0,admissions:[],scope:'unfinished actual rival instrument producer ONLY; no closure proof'}
let parsed:unknown,ph:string|undefined,original:GameState|undefined,oh:string|undefined,state:GameState|undefined
function admit(s:GameState,label:string){clock();const h=sha(bytes(s));validateSaveV48(makeSave(s));check(sha(bytes(s))===h,'admission mutated '+label);(result.admissions as unknown[]).push({label,week:s.market.tick,stateSHA256:h});clock()}
try{
 const gzip=readFileSync(file),raw=gunzipSync(gzip);check(sha(gzip)==='9b4732127aa6bae8d77da1ea9bf0afe22acdb1a1b15cf2ae80a727dc14181dc9','genuine gzip pin');check(sha(raw)==='6632462c2ba1c350859e3d185afbf35e5a50cc6b6a9035693d8e71cbf79b09da','genuine raw pin')
 parsed=JSON.parse(raw.toString());ph=sha(bytes(parsed));const old=validateSaveV45(parsed);state=migrateToLive(old).state;check(sha(bytes(parsed))===ph,'historical input mutation');original=state;oh=sha(bytes(state));check(state.market.tick===104&&state.seed==='p13a-core-causal-01','fixed input');admit(state,'original104')
 while(state.market.tick<260){clock();check(isOperatingStudio(state,studio),'target rival closed before boundary');state=tick(state,{develop:true,deferPlayerClosure:true});result.ticks=(result.ticks as number)+1}
 admit(state,'producerInput260');check(isOperatingStudio(state,studio),'rival closed at input260')
 check(!state.physicalPlans.plans.some(p=>p.studioId===studio&&p.work.blueprintId==='acoustic-instruments'),'existing instrument plan before fixed admission')
 const before=sha(bytes(state));const next=tick(state,{develop:true,deferPlayerClosure:true});check(sha(bytes(state))===before,'boundary tick input mutation');state=next;result.ticks=(result.ticks as number)+1;admit(state,'actualOutput261')
 const plans=state.physicalPlans.plans.filter(p=>p.studioId===studio&&p.work.kind==='installation'&&p.work.blueprintId==='acoustic-instruments');result.planCount=plans.length;check(plans.length===1,'one actual instrument plan required');const p=plans[0]!
 result.subject={id:p.id,status:p.status,queuedWeek:p.queuedWeek,statusWeek:p.statusWeek,work:p.work,approvedQuote:p.approvedQuote,commitReceipt:p.commitReceipt}
 check(p.status==='started'&&p.commitReceipt?.week===260&&p.commitReceipt.cost===350000&&p.approvedQuote.buildWeeks===5,'authentic260 instrument commitment premise')
 const completions=state.hollywood!.receipts.filter(r=>r.kind==='instrumentOperational'&&r.studioId===studio&&r.facilityId===facility&&r.technologyId==='synchronized-sound');result.completions=completions;check(completions.length===0,'instrument already completed')
 const b=state.hollywood!.businesses.find(b=>b.studioId===studio)!;result.target={cash:b.account.cash,costCutting:b.costCutting,operating:isOperatingStudio(state,studio)};result.status='ACTUAL260_COMMIT_UNFINISHED_AT261_ONLY';
}catch(e){result.status=e instanceof Premise?'STOP_UNMET_PREMISE_OR_CAP':'ERROR';result.reason=e instanceof Error?e.message:String(e);process.exitCode=e instanceof Premise?2:1}
finally{
 try{check(!ph||sha(bytes(parsed))===ph,'historical final purity');check(!oh||sha(bytes(original))===oh,'migrated final purity');result.inputPure=true}catch(e){result.purityError=String(e);process.exitCode=1}
 result.elapsedMs=performance.now()-started;result.timingScope='after module imports; external30s watchdog includes startup';writeFileSync(output,JSON.stringify(result,null,2)+'\n',{flag:'wx',mode:0o600})
}
