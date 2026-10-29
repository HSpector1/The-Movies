// Decision 6b profile: the p12 campaign-library case "keeps the shipped Save route and save-before-load consistent"
// (6.1 s alone against 5,000 ms), replicated step by step with timers; run under node --cpu-prof. Read-only on the tree.
import {performance} from 'node:perf_hooks'
import {randomUUID} from 'node:crypto'
import {decodeCampaignStorage} from '/Users/zacheryspector/studio-scratch/p17-continuation-20261027-wt/bridge/runtime/campaign-storage-codec.ts'
import {createBridgeRuntimeCoordinator,type BridgeRuntimeCoordinator} from '/Users/zacheryspector/studio-scratch/p17-continuation-20261027-wt/bridge/runtime/runtime-coordinator.ts'
import type {BridgeCheckpointStore} from '/Users/zacheryspector/studio-scratch/p17-continuation-20261027-wt/bridge/runtime/checkpoint-store.ts'
import {BridgeSession,createBridgeInitialState} from '/Users/zacheryspector/studio-scratch/p17-continuation-20261027-wt/bridge/session.ts'
import {PROTOCOL_VERSION,SCHEMA_ID} from '/Users/zacheryspector/studio-scratch/p17-continuation-20261027-wt/bridge/protocol.ts'
import type {CampaignRequest} from '/Users/zacheryspector/studio-scratch/p17-continuation-20261027-wt/bridge/schema/bridge-schema.ts'
import {type CampaignLibrary} from '/Users/zacheryspector/studio-scratch/p17-continuation-20261027-wt/bridge/runtime/campaign-library.ts'
import {DEFAULT_BRIDGE_RUNTIME_CHECKPOINT_LIMITS} from '/Users/zacheryspector/studio-scratch/p17-continuation-20261027-wt/bridge/runtime-checkpoint.ts'
import {importSave,migrateToLive} from '/Users/zacheryspector/studio-scratch/p17-continuation-20261027-wt/src/core/index.js'
class Store implements BridgeCheckpointStore {
  checkpointPath='/synthetic/campaign-library.json';fail=false;closed=false
  constructor(public contents:string|null=null){}
  async read(){return this.contents}
  async writeAtomic(text:string){if(this.fail)throw new Error('injected');this.contents=text}
  async close(){this.closed=true}
}
const options=(store:Store)=>({store,fatal:(e:unknown)=>{throw e},campaigns:{durable:true,regime:'endowed' as const},
  createFreshSession:()=>new BridgeSession(createBridgeInitialState('r05-library-test'))})
async function request(runtime:BridgeRuntimeCoordinator,operation:CampaignRequest['operation'],extra:Partial<CampaignRequest>={}):Promise<CampaignRequest> {
  const library=(await runtime.campaignLibrary())!
  return {protocolVersion:PROTOCOL_VERSION,schemaId:SCHEMA_ID,type:'campaign',commandId:randomUUID(),sessionId:library.sessionId,
    expectedStateRevision:library.stateRevision,expectedCatalogueRevision:library.catalogueRevision,expectedActiveCampaignId:library.activeCampaignId,
    operation,campaignId:null,label:null,overwriteCampaignId:null,confirmDestructive:false,unsavedDisposition:'requireClean',...extra}
}
function library(store:Store):CampaignLibrary{return decodeCampaignStorage(JSON.parse(store.contents!),DEFAULT_BRIDGE_RUNTIME_CHECKPOINT_LIMITS.maxCheckpointBytes,32) as CampaignLibrary}
function state(store:Store){return migrateToLive(importSave(JSON.parse(library(store).workingCheckpointJson).currentSaveJson)).state}
async function advance(runtime:BridgeRuntimeCoordinator) {
  const snapshot=await runtime.read(s=>s.snapshot())
  const option=snapshot.availableIntents.find(i=>i.kind==='advanceWeek')!
  await runtime.dispatch('command',{protocolVersion:PROTOCOL_VERSION,schemaId:SCHEMA_ID,sessionId:snapshot.sessionId,
    commandId:randomUUID(),expectedStateRevision:snapshot.stateRevision,type:'submitIntent',payload:{intentId:option.intentId}})
}
const marks:Record<string,number>={}; let last=performance.now()
const mark=(name:string)=>{const now=performance.now();marks[name]=Math.round(now-last);last=now}
const store=new Store(),runtime=await createBridgeRuntimeCoordinator(options(store)); mark('createCoordinator')
await runtime.campaign(await request(runtime,'saveAs',{label:'Saved studio'})); mark('saveAs')
const id=library(store).activeCampaignId!; mark('decodeLibrary')
await advance(runtime); mark('advance1')
const first=state(store); mark('state(store) decode+import+migrate')
const snap=await runtime.read(s=>s.snapshot()); mark('snapshot')
await runtime.dispatch('save',{protocolVersion:PROTOCOL_VERSION,schemaId:SCHEMA_ID,sessionId:snap.sessionId,commandId:randomUUID(),expectedStateRevision:snap.stateRevision}); mark('dispatch save')
await runtime.campaign(await request(runtime,'load',{campaignId:id})); mark('load')
state(store); mark('state(store) 2')
await advance(runtime); mark('advance2')
state(store); mark('state(store) 3')
await runtime.campaign(await request(runtime,'load',{campaignId:id,unsavedDisposition:'save'})); mark('load with save')
state(store); mark('state(store) 4')
await runtime.close(); mark('close')
console.log(JSON.stringify({storeBytes:store.contents!.length,firstWeek:first.market.tick,marks,totalMs:Object.values(marks).reduce((a,b)=>a+b,0)},null,1))
