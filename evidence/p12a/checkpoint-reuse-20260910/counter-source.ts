import { randomUUID,createHash } from 'node:crypto'
import { writeFileSync } from 'node:fs'
import { BridgeSession,createBridgeInitialState } from './source/bridge/session.ts'
import { createBridgeRuntimeCoordinator } from './source/bridge/runtime/runtime-coordinator.ts'
import { PROTOCOL_VERSION,SCHEMA_ID } from './source/bridge/protocol.ts'
import { canonicalJson } from './source/bridge/schema/canonical.ts'
const counts:Record<string,number>={}, keys:Record<string,Record<string,number>>={}
let active=false
;(globalThis as any).__p12Counter=(name:string,key?:string)=>{if(!active)return;counts[name]=(counts[name]??0)+1;if(key){keys[name]??={};keys[name][key]=(keys[name][key]??0)+1}}
const reset=()=>{for(const key of Object.keys(counts))delete counts[key];for(const key of Object.keys(keys))delete keys[key];active=true}
const end=()=>{active=false;return{counts:{...counts},checkpointGroups:Object.fromEntries(Object.entries(keys).map(([name,map])=>[name,{distinct:Object.keys(map).length,invocationsPerDistinct:Object.values(map).sort((a,b)=>a-b)}]))}}
const assert=(x:unknown,message:string)=>{if(!x)throw Error(message)}
let contents:string|null=null,writes=0
const store={checkpointPath:'/synthetic/reuse-counter',read:async()=>contents,writeAtomic:async(json:string)=>{contents=json;writes++},close:async()=>{}}
const runtime=await createBridgeRuntimeCoordinator({store,campaigns:{durable:true,regime:'endowed'},fatal:e=>{throw e},createFreshSession:()=>new BridgeSession(createBridgeInitialState('prepared-checkpoint-counter'))})
const request=async(operation:string,extra={})=>{const l=(await runtime.campaignLibrary())!;return{protocolVersion:PROTOCOL_VERSION,schemaId:SCHEMA_ID,type:'campaign',commandId:randomUUID(),sessionId:l.sessionId,expectedStateRevision:l.stateRevision,expectedCatalogueRevision:l.catalogueRevision,expectedActiveCampaignId:l.activeCampaignId,operation,campaignId:null,label:null,overwriteCampaignId:null,confirmDestructive:false,unsavedDisposition:'requireClean',...extra} as any}
const advance=async()=>{const s=await runtime.read(x=>x.snapshot()),intent=s.availableIntents.find(x=>x.kind==='advanceWeek')!;const r=await runtime.dispatch('command',{protocolVersion:PROTOCOL_VERSION,schemaId:SCHEMA_ID,sessionId:s.sessionId,commandId:randomUUID(),expectedStateRevision:s.stateRevision,type:'submitIntent',payload:{intentId:intent.intentId}});assert(r.response.accepted,'advance rejected')}
const report:any={kind:'small deterministic fixture instrumented invocation counts',qualifications:['Counters inserted only into private esbuild output, no runtime source instrumentation.','Counts describe complete operation dispatch including compression preparation; no timing assertions.','Checkpoint distinctness key joins session/revision/current/saved/journal digests; raw private payloads omitted.','A capacity-check checkpoint and its later final export may have identical bytes: remaining duplicate validation is reported, not relabelled as different state.'],completed:false}
try{
 assert((await runtime.campaign(await request('saveAs',{label:'Counted campaign'}))).accepted,'name rejected')
 await advance()
 const before=await runtime.read(x=>x.snapshot()),campaignRequest=await request('save')
 reset();const response=await runtime.campaign(campaignRequest);report.campaignSave=end();assert(response.accepted,'campaign save rejected')
 assert(response.stateDigest===before.stateDigest&&response.gameWeek===before.gameWeek,'world changed on save')
 const durable=contents,saveWrites=writes;assert(canonicalJson(await runtime.campaign(campaignRequest))===canonicalJson(response),'retry differs');assert(contents===durable&&writes===saveWrites,'retry wrote')
 await advance();const s=await runtime.read(x=>x.snapshot());const ordinaryRequest={protocolVersion:PROTOCOL_VERSION,schemaId:SCHEMA_ID,sessionId:s.sessionId,commandId:randomUUID(),expectedStateRevision:s.stateRevision}
 reset();const ordinary=await runtime.dispatch('save',ordinaryRequest);report.ordinarySave=end();assert(ordinary.response.accepted,'ordinary save rejected')
 assert(ordinary.response.stateDigest===s.stateDigest,'ordinary changed world')
 const bytes=contents,ordinaryWrites=writes;assert((await runtime.dispatch('save',ordinaryRequest)).responseJson===ordinary.responseJson,'ordinary retry differs');assert(contents===bytes&&writes===ordinaryWrites,'ordinary retry wrote')
 assert(report.campaignSave.counts.strictCheckpoint>0&&report.ordinarySave.counts.canonicalCheckpointExactBytes>0,'Missing positive instrumentation');
 report.final={week:s.gameWeek,digest:s.stateDigest,returnedSaveSha256:ordinary.response.accepted?createHash('sha256').update(ordinary.response.saveJson).digest('hex'):null};report.completed=true
}finally{active=false;await runtime.close();writeFileSync(process.argv[2],JSON.stringify(report,null,2)+'\n',{mode:0o600});console.log(JSON.stringify(report))}
