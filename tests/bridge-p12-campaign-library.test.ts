import {decodeCampaignStorage} from '../bridge/runtime/campaign-storage-codec.ts'
import {randomUUID,createHash} from 'node:crypto'
import {readFileSync} from 'node:fs'
import {gunzipSync} from 'node:zlib'
import {describe,it,expect} from 'vitest'
import {createBridgeRuntimeCoordinator,type BridgeRuntimeCoordinator} from '../bridge/runtime/runtime-coordinator.ts'
import type {BridgeCheckpointStore} from '../bridge/runtime/checkpoint-store.ts'
import {canonicalJson} from '../bridge/schema/canonical.ts'
import {BridgeSession,createBridgeInitialState} from '../bridge/session.ts'
import {PROTOCOL_VERSION,SCHEMA_ID} from '../bridge/protocol.ts'
import type {CampaignRequest} from '../bridge/schema/bridge-schema.ts'
import {loadCampaignLibrary,type CampaignLibrary} from '../bridge/runtime/campaign-library.ts'
import {DEFAULT_BRIDGE_RUNTIME_CHECKPOINT_LIMITS,loadBridgeRuntimeCheckpoint} from '../bridge/runtime-checkpoint.ts'
import {importSave,migrateToV19,exportSave,makeSaveV18,generateWorld} from '../src/core/index.js'
class Store implements BridgeCheckpointStore {
  checkpointPath='/synthetic/campaign-library.json';fail=false;closed=false
  constructor(public contents:string|null=null){}
  async read(){return this.contents}
  async writeAtomic(text:string){if(this.fail)throw new Error('injected pre-commit write failure');this.contents=text}
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
function working(store:Store){return JSON.parse(library(store).workingCheckpointJson)}
function state(store:Store){return migrateToV19(importSave(working(store).currentSaveJson)).state}
async function advance(runtime:BridgeRuntimeCoordinator) {
  const snapshot=await runtime.read(s=>s.snapshot())
  const option=snapshot.availableIntents.find(i=>i.kind==='advanceWeek')!
  expect(option).toBeTruthy()
  const result=await runtime.dispatch('command',{protocolVersion:PROTOCOL_VERSION,schemaId:SCHEMA_ID,sessionId:snapshot.sessionId,
    commandId:randomUUID(),expectedStateRevision:snapshot.stateRevision,type:'submitIntent',payload:{intentId:option.intentId}})
  expect(result.response.accepted).toBe(true)
}
describe('R05 independent named campaign transactions',()=>{
  it.each(['rename','delete'] as const)('keeps a reviewed contract quote usable across failed and successful catalogue-only %s',async(operation)=>{
    const prior=readFileSync(new URL('../ui/e2e/p11-core-v2/s6-p11-positive-long-payroll.checkpoint.json',import.meta.url),'utf8')
    const source=BridgeSession.fromRuntimeCheckpoint(loadBridgeRuntimeCheckpoint(prior).hydrated).gameState
    const store=new Store(),runtime=await createBridgeRuntimeCoordinator({...options(store),
      createFreshSession:limits=>new BridgeSession(source,undefined,null,{limits})})
    try{
      await runtime.campaign(await request(runtime,'saveAs',{label:'Original'}))
      const originalId=library(store).activeCampaignId!
      await runtime.campaign(await request(runtime,'saveAs',{label:'Active copy'}))
      const snap=await runtime.read(s=>s.snapshot())
      const contract=[...source.contracts].sort((a,b)=>a.endWeekExclusive-b.endWeekExclusive)[0]!
      const quoted=await runtime.read(s=>s.quote({protocolVersion:PROTOCOL_VERSION,schemaId:SCHEMA_ID,
        sessionId:snap.sessionId,expectedStateRevision:snap.stateRevision,commandId:randomUUID(),
        type:'quoteContract',draft:{verb:'release',talentId:contract.talentId,termWeeks:null}}))
      if(!quoted.accepted)throw new Error(quoted.message)
      expect(quoted.quote.ok).toBe(true)
      const before=store.contents,checkpoint=library(store).workingCheckpointJson
      const change=await request(runtime,operation,{campaignId:originalId,
        label:operation==='rename'?'Renamed original':null,confirmDestructive:operation==='delete'})
      store.fail=true;expect((await runtime.campaign(change)).accepted).toBe(false);expect(store.contents).toBe(before)
      store.fail=false;expect((await runtime.campaign(change)).accepted).toBe(true)
      expect(library(store).workingCheckpointJson).toBe(checkpoint)
      const committed=await runtime.dispatch('command',{protocolVersion:PROTOCOL_VERSION,schemaId:SCHEMA_ID,
        sessionId:snap.sessionId,expectedStateRevision:snap.stateRevision,commandId:randomUUID(),
        type:'submitIntent',payload:{intentId:quoted.quote.intentId}})
      expect(committed.response.accepted).toBe(true)
    }finally{await runtime.close()}
  },20000)
  it('keeps the shipped Save route and save-before-load consistent with the named record',async()=>{
    const store=new Store(),runtime=await createBridgeRuntimeCoordinator(options(store))
    await runtime.campaign(await request(runtime,'saveAs',{label:'Saved studio'}))
    const id=library(store).activeCampaignId!
    await advance(runtime)
    const first=state(store),snap=await runtime.read(s=>s.snapshot())
    const saved=await runtime.dispatch('save',{protocolVersion:PROTOCOL_VERSION,schemaId:SCHEMA_ID,sessionId:snap.sessionId,commandId:randomUUID(),expectedStateRevision:snap.stateRevision})
    expect(saved.response.accepted).toBe(true);expect((await runtime.campaignLibrary())!.dirty).toBe(false)
    await runtime.campaign(await request(runtime,'load',{campaignId:id}))
    expect(state(store)).toEqual(first)
    await advance(runtime)
    const second=state(store)
    await runtime.campaign(await request(runtime,'load',{campaignId:id,unsavedDisposition:'save'}))
    expect(state(store)).toEqual(second);expect((await runtime.campaignLibrary())!.dirty).toBe(false)
    await runtime.close()
  })
  it('rejects a corrupted cross-world active binding and stops on an uncertain commit',async()=>{
    const store=new Store(),fatal:unknown[]=[]
    let runtime=await createBridgeRuntimeCoordinator({...options(store),fatal:e=>fatal.push(e)})
    expect((await runtime.campaign(await request(runtime,'newGame',{label:'World A',unsavedDisposition:'discard'}))).accepted).toBe(true)
    const a=library(store).activeCampaignId!
    expect((await runtime.campaign(await request(runtime,'newGame',{label:'World B',unsavedDisposition:'discard'}))).accepted).toBe(true)
    const corrupted=library(store);corrupted.activeCampaignId=a
    expect(()=>loadCampaignLibrary(JSON.stringify(corrupted),DEFAULT_BRIDGE_RUNTIME_CHECKPOINT_LIMITS)).toThrow(/world origins/)
    const operation=await request(runtime,'saveAs',{label:'Committed copy'})
    const originalWrite=store.writeAtomic.bind(store)
    store.writeAtomic=async text=>{await originalWrite(text);throw new Error('commit happened but rollback failed')}
    await expect(runtime.campaign(operation)).rejects.toThrow(/uncertain/)
    expect(fatal).toHaveLength(1)
    await expect(runtime.campaignLibrary()).rejects.toThrow()
    await runtime.close();store.writeAtomic=originalWrite
    runtime=await createBridgeRuntimeCoordinator(options(store))
    expect((await runtime.campaignLibrary())!.campaigns).toHaveLength(3)
    expect((await runtime.campaign(operation)).accepted).toBe(true)
    expect((await runtime.campaignLibrary())!.campaigns).toHaveLength(3)
    await runtime.close()
  })
  it('saves atomically across the bounded replay journal with a new logical session',async()=>{
    const store=new Store(),limits={...DEFAULT_BRIDGE_RUNTIME_CHECKPOINT_LIMITS,maxJournalEntries:1}
    const runtime=await createBridgeRuntimeCoordinator({...options(store),checkpointLimits:limits,
      createFreshSession:bound=>BridgeSession.createRuntime(bound,'endowed','r05-journal-save')})
    await runtime.campaign(await request(runtime,'saveAs',{label:'Journal bound'}))
    const snap=await runtime.read(s=>s.snapshot()),intent=snap.availableIntents.find(i=>i.kind==='signFoundingContract')!
    expect(intent).toBeTruthy()
    expect((await runtime.dispatch('command',{protocolVersion:PROTOCOL_VERSION,schemaId:SCHEMA_ID,sessionId:snap.sessionId,
      commandId:randomUUID(),expectedStateRevision:snap.stateRevision,type:'submitIntent',payload:{intentId:intent.intentId}})).response.accepted).toBe(true)
    const before=state(store),oldSession=working(store).sessionId
    const result=await runtime.campaign(await request(runtime,'save'))
    expect(result.accepted).toBe(true)
    expect(working(store).sessionId).not.toBe(oldSession)
    expect(state(store)).toEqual(before);expect((await runtime.campaignLibrary())!.dirty).toBe(false)
    await runtime.close()
  })
  it('branches CURRENT complete state, preserves original records, switches scope and survives restart',async()=>{
    const store=new Store();let runtime=await createBridgeRuntimeCoordinator(options(store))
    expect((await runtime.campaign(await request(runtime,'saveAs',{label:'Alpine Pictures'}))).accepted).toBe(true)
    const a=library(store).records[0]!,originalA=a.checkpointJson
    await advance(runtime)
    const current=state(store)
    const as=await request(runtime,'saveAs',{label:'Night Watch'})
    const receipt=await runtime.campaign(as)
    expect(receipt.accepted).toBe(true)
    const b=library(store).records.find(r=>r.label==='Night Watch')!
    expect(b.id).not.toBe(a.id)
    expect(library(store).records.find(r=>r.id===a.id)!.checkpointJson).toBe(originalA)
    expect(state(store)).toEqual(current)
    expect(working(store).sessionId).not.toBe(as.sessionId)
    expect(working(store).savedSaveJson).toBe(working(store).currentSaveJson)
    expect(await runtime.campaign(as)).toEqual(receipt)
    expect(library(store).records).toHaveLength(2)
    await runtime.close();runtime=await createBridgeRuntimeCoordinator(options(store))
    expect((await runtime.campaignLibrary())!.activeCampaignId).toBe(b.id)
    expect(state(store)).toEqual(current)
    expect((await runtime.campaign(await request(runtime,'newGame',{label:'Third Feature'}))).accepted).toBe(true)
    expect(library(store).records).toHaveLength(3)
    expect(state(store).seed).not.toBe(current.seed)
    expect(state(store).hollywood!.worldId).not.toBe(current.hollywood!.worldId)
    expect((await runtime.campaign(await request(runtime,'load',{campaignId:a.id}))).accepted).toBe(true)
    expect(state(store).market.tick).toBe(current.market.tick-1)
    expect(library(store).records.find(r=>r.id===b.id)!.checkpointJson).toBe(b.checkpointJson)
    await runtime.close()
  })
  it('makes failed writes, cancel/unsaved conflicts, stale targets and rename collisions leave authority intact',async()=>{
    const store=new Store(),runtime=await createBridgeRuntimeCoordinator(options(store))
    await runtime.campaign(await request(runtime,'saveAs',{label:'Original'}))
    const original=store.contents!,snapshot=await runtime.campaignLibrary()
    store.fail=true
    expect((await runtime.campaign(await request(runtime,'saveAs',{label:'Failed copy'}))).accepted).toBe(false)
    expect(store.contents).toBe(original);expect(await runtime.campaignLibrary()).toEqual(snapshot)
    store.fail=false
    await advance(runtime)
    const unsaved=store.contents!
    expect((await runtime.campaign(await request(runtime,'newGame',{label:'Cancelled'}))).accepted).toBe(false)
    expect(store.contents).toBe(unsaved)
    expect((await runtime.campaign(await request(runtime,'rename',{campaignId:library(store).activeCampaignId,label:'../bad'}))).accepted).toBe(false)
    expect(store.contents).toBe(unsaved)
    const first=await request(runtime,'saveAs',{label:'First copy'}),second={...first,commandId:randomUUID(),label:'Racing copy'}
    const results=await Promise.all([runtime.campaign(first),runtime.campaign(second)])
    expect(results.map(r=>r.accepted)).toEqual([true,false]);expect(library(store).records).toHaveLength(2)
    const active=library(store).activeCampaignId!,raw=library(store).records.find(r=>r.id===active)!.checkpointJson
    await runtime.campaign(await request(runtime,'rename',{campaignId:active,label:'Renamed copy'}))
    expect(library(store).records.find(r=>r.id===active)!.checkpointJson).toBe(raw)
    expect((await runtime.campaign(await request(runtime,'rename',{campaignId:active,label:'Original'}))).accepted).toBe(false)
    await runtime.close()
  })
  it('requires exact delete/overwrite confirmation and never recreates a deleted active record',async()=>{
    const store=new Store(),runtime=await createBridgeRuntimeCoordinator(options(store))
    await runtime.campaign(await request(runtime,'saveAs',{label:'Source'}))
    const source=library(store).records[0]!
    await runtime.campaign(await request(runtime,'saveAs',{label:'Target'}))
    const target=library(store).records.find(r=>r.label==='Target')!
    await runtime.campaign(await request(runtime,'load',{campaignId:source.id}))
    await advance(runtime)
    const current=state(store)
    expect((await runtime.campaign(await request(runtime,'saveAs',{label:'Target',overwriteCampaignId:target.id}))).accepted).toBe(false)
    expect((await runtime.campaign(await request(runtime,'saveAs',{label:'Target',overwriteCampaignId:target.id,confirmDestructive:true}))).accepted).toBe(true)
    expect(state(store)).toEqual(current)
    expect(library(store).records.find(r=>r.id===source.id)!.checkpointJson).toBe(source.checkpointJson)
    expect((await runtime.campaign(await request(runtime,'delete',{campaignId:target.id}))).accepted).toBe(false)
    expect((await runtime.campaign(await request(runtime,'delete',{campaignId:target.id,confirmDestructive:true}))).accepted).toBe(true)
    expect(library(store).activeCampaignId).toBeNull();expect(state(store)).toEqual(current)
    await advance(runtime)
    expect(library(store).records.some(r=>r.id===target.id)).toBe(false)
    await runtime.close()
  })
  it('imports real old current/saved checkpoints as independently recoverable records without losing original bytes',async()=>{
    const original=gunzipSync(readFileSync(new URL('./fixtures/p06-recovery.checkpoint.json.gz',import.meta.url))).toString('utf8')
    const prior=JSON.parse(original),store=new Store(original)
    const runtime=await createBridgeRuntimeCoordinator(options(store))
    const imported=library(store)
    expect(imported.legacyCheckpointJson).toBe(original)
    expect(imported.records).toHaveLength(2)
    expect(working(store).savedSaveJson).not.toBe(working(store).currentSaveJson)
    for(const record of imported.records) {
      const cp=JSON.parse(record.checkpointJson),s=migrateToV19(importSave(cp.currentSaveJson)).state
      expect(s.hollywood!.origin).toBe('migration');expect(s.hollywood!.films).toEqual([])
    }
    expect(state(store).market.tick).toBe(importSave(prior.currentSaveJson).state.market.tick)
    expect(loadCampaignLibrary(store.contents!,DEFAULT_BRIDGE_RUNTIME_CHECKPOINT_LIMITS).changed).toBe(false)
    const corrupted=JSON.parse(store.contents!);corrupted.records[0].checkpointJson='{}'
    expect(()=>loadCampaignLibrary(JSON.stringify(corrupted),DEFAULT_BRIDGE_RUNTIME_CHECKPOINT_LIMITS)).toThrow()
    await runtime.close()
  })
  it('recovers different-world legacy slots and null saved state, preserving exact originals',async()=>{
    const digest=(s:string)=>createHash('sha256').update(s).digest('hex')
    for(const hasSaved of [true,false]) {
      const old=JSON.parse(gunzipSync(readFileSync(new URL('./fixtures/p06-recovery.checkpoint.json.gz',import.meta.url))).toString('utf8'))
      const a=generateWorld('r05-prior-current'),b=generateWorld('r05-prior-saved');a.market.tick=53;b.market.tick=520
      old.schemaId='sha256:97940e51e0566bed80231b223e5b7303a45d62db8d698f693e525eb244775211'
      old.currentSaveJson=exportSave(makeSaveV18(a));old.currentStateDigest=digest(old.currentSaveJson)
      old.savedSaveJson=hasSaved?exportSave(makeSaveV18(b)):null;old.savedStateDigest=hasSaved?digest(old.savedSaveJson):null
      old.journal=[];old.journalDigest=digest('[]');old.stateRevision=0
      const original=canonicalJson(old)+'\n',store=new Store(original)
      let runtime=await createBridgeRuntimeCoordinator(options(store))
      expect(library(store).legacyCheckpointJson).toBe(original)
      expect(library(store).records).toHaveLength(hasSaved?2:1)
      expect(state(store).seed).toBe(a.seed);expect(state(store).market.tick).toBe(53)
      const recovered=library(store).records
      if(hasSaved){await runtime.campaign(await request(runtime,'load',{campaignId:recovered[1]!.id}));expect(state(store).seed).toBe(b.seed);expect(state(store).market.tick).toBe(520)}
      else expect(working(store).savedSaveJson).toBeNull()
      const settled=store.contents;await runtime.close();runtime=await createBridgeRuntimeCoordinator(options(store))
      expect(store.contents).toBe(settled);expect(library(store).legacyCheckpointJson).toBe(original)
      await runtime.close()
    }
  })
  it('branches a full journal without changing source bytes and retries the exact durable copy after restart',async()=>{
    const store=new Store(),limits={...DEFAULT_BRIDGE_RUNTIME_CHECKPOINT_LIMITS,maxJournalEntries:1}
    const config={...options(store),checkpointLimits:limits,createFreshSession:(bound:typeof limits)=>BridgeSession.createRuntime(bound,'endowed','r05-full-journal-copy')}
    let runtime=await createBridgeRuntimeCoordinator(config)
    await runtime.campaign(await request(runtime,'saveAs',{label:'Original limited world'}))
    const source=library(store).records[0]!
    const snap=await runtime.read(s=>s.snapshot()),intent=snap.availableIntents.find(i=>i.kind==='signFoundingContract')!
    expect((await runtime.dispatch('command',{protocolVersion:PROTOCOL_VERSION,schemaId:SCHEMA_ID,sessionId:snap.sessionId,commandId:randomUUID(),expectedStateRevision:snap.stateRevision,type:'submitIntent',payload:{intentId:intent.intentId}})).response.accepted).toBe(true)
    expect(working(store).journal).toHaveLength(1)
    const current=state(store),before=store.contents,as=await request(runtime,'saveAs',{label:'Complete current copy'})
    store.fail=true;expect((await runtime.campaign(as)).accepted).toBe(false);expect(store.contents).toBe(before)
    store.fail=false;const receipt=await runtime.campaign(as);expect(receipt.accepted).toBe(true)
    expect(state(store)).toEqual(current);expect(working(store).sessionId).not.toBe(as.sessionId)
    expect(library(store).records.find(r=>r.id===source.id)!.checkpointJson).toBe(source.checkpointJson)
    expect((await runtime.campaignLibrary())!.dirty).toBe(false)
    await runtime.close();runtime=await createBridgeRuntimeCoordinator(config)
    expect(await runtime.campaign(as)).toEqual(receipt);expect(library(store).records).toHaveLength(2)
    expect(state(store)).toEqual(current);await runtime.close()
  })
  it.each(['save','discard'] as const)('durably %s dirty progress while preserving two inactive worlds and failed-write authority',async(operation)=>{
      const store=new Store();let runtime=await createBridgeRuntimeCoordinator(options(store))
      await runtime.campaign(await request(runtime,'saveAs',{label:'A'}));const a=library(store).activeCampaignId!
      for(const label of ['B','C'])expect((await runtime.campaign(await request(runtime,'newGame',{label}))).accepted).toBe(true)
      const inactive=library(store).records.filter(r=>r.id!==a)
      await runtime.campaign(await request(runtime,'load',{campaignId:a}))
      const saved=state(store);await advance(runtime);const dirty=state(store),before=store.contents
      const cmd=await request(runtime,operation,{confirmDestructive:true})
      store.fail=true;expect((await runtime.campaign(cmd)).accepted).toBe(false);expect(store.contents).toBe(before);expect(state(store)).toEqual(dirty)
      store.fail=false;expect((await runtime.campaign(cmd)).accepted).toBe(true)
      expect(state(store)).toEqual(operation==='save'?dirty:saved)
      await runtime.close();runtime=await createBridgeRuntimeCoordinator(options(store))
      expect(state(store)).toEqual(operation==='save'?dirty:saved);expect((await runtime.campaignLibrary())!.dirty).toBe(false)
      for(const record of inactive)expect(library(store).records.find(r=>r.id===record.id)!.checkpointJson).toBe(record.checkpointJson)
      await runtime.close()
  },20000)

})
