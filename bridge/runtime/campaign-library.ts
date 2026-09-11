import {encodeCampaignStorage,decodeCampaignStorage} from './campaign-storage-codec.ts'
import {randomUUID} from 'node:crypto'
import {campaignDate} from '../../src/core/calendar.js'
import type {FoundingRegime} from '../../src/core/types.js'
import {importSave,migrateToV20} from '../../src/core/index.js'
import {BridgeSession,type RejectedResponse} from '../session.ts'
import {sameNativeCampaignOrigin} from '../campaign-origin.ts'
import {PROTOCOL_VERSION,SCHEMA_ID,SNAPSHOT_VERSION,type ControlEnvelope,type RejectionCode} from '../protocol.ts'
import {canonicalJson} from '../schema/canonical.ts'
import {BRIDGE_SCHEMA,type CampaignRequest,type CampaignAcceptedResponse,type CampaignLibraryResponse} from '../schema/bridge-schema.ts'
import {parseWireValue} from '../schema/runtime.ts'
import {BridgeRuntimeCheckpointHistoryFullError,loadBridgeRuntimeCheckpoint,type BridgeRuntimeCheckpointLimits,type EncodedBridgeRuntimeCheckpoint} from '../runtime-checkpoint.ts'

export const CAMPAIGN_LIBRARY_FORMAT='project-studio-campaign-library' as const
export const CAMPAIGN_LIBRARY_MAX_BYTES=256*1024*1024
export const CAMPAIGN_LIBRARY_MAX_RECORDS=32
const MAX_RECEIPTS=128
export type CampaignRecord={id:string;label:string;revision:number;checkpointJson:string}
export type CampaignReceipt={commandId:string;requestJson:string;response:CampaignAcceptedResponse}
export type CampaignLibrary={format:typeof CAMPAIGN_LIBRARY_FORMAT;libraryVersion:1;catalogueRevision:number;
  activeCampaignId:string|null;workingCheckpointJson:string;records:CampaignRecord[];receipts:CampaignReceipt[];
  /** Original supported single-profile bytes, retained verbatim as rollback/recovery provenance. */
  legacyCheckpointJson:string|null}
const summaries=new WeakMap<CampaignRecord,CampaignLibraryResponse['campaigns'][number]>()
function object(value:unknown,keys:string[]):asserts value is Record<string,unknown> {
  if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).length!==keys.length||keys.some(k=>!Object.hasOwn(value,k)))throw new Error('Campaign library has malformed or unknown fields')
}
function safeInteger(value:unknown):asserts value is number {if(typeof value!=='number'||!Number.isSafeInteger(value)||value<0||value>2147483647)throw new Error('Campaign library requires a nonnegative wire-safe integer')}
function uuid(value:unknown):asserts value is string {if(typeof value!=='string'||!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(value))throw new Error('Campaign storage identity is malformed')}
export function normalizeCampaignLabel(value:string):string {
  const label=value.normalize('NFC').trim().replace(/\s+/gu,' ')
  if(!label||Array.from(label).length>64||/[\/\\\p{C}]/u.test(label)||label==='.'||label==='..')throw new Error('Use 1–64 visible characters without slashes or control characters.')
  return label
}
const labelKey=(label:string)=>label.toLowerCase()
function encodeSession(session:BridgeSession,limits:BridgeRuntimeCheckpointLimits):string{return session.exportRuntimeCheckpointEncoded(limits).encoded}
function hydrate(json:string,limits:BridgeRuntimeCheckpointLimits):BridgeSession{
  const hydrated=loadBridgeRuntimeCheckpoint(json,limits).hydrated
  const session=BridgeSession.fromRuntimeCheckpoint(hydrated,limits)
  if(!session.gameState.hollywood)throw new Error('Historical control saves cannot be opened as native campaigns: Hollywood authority is missing')
  if(hydrated.savedSave!==null&&!sameNativeCampaignOrigin(session.gameState,hydrated.savedSave.state))throw new Error('Native current and saved slots have different world origins or missing Hollywood authority')
  return session
}
function summary(record:CampaignRecord):CampaignLibraryResponse['campaigns'][number] {
  const cached=summaries.get(record);if(cached)return cached
  // Record bytes were validated at creation/load. Catalogue polling reads the cached projection thereafter.
  const checkpoint=JSON.parse(record.checkpointJson)
  const state=migrateToV20(importSave(checkpoint.currentSaveJson)).state
  const date=campaignDate(state.market.tick)
  const value={id:record.id,label:record.label,revision:record.revision,gameWeek:date.absoluteWeek,
    year:date.year,weekOfYear:date.weekOfYear,dateLabel:date.label,studioName:state.hollywood?.identities[0]?.name??null}
  summaries.set(record,value);return value
}
function recordFor(session:BridgeSession,label:string,limits:BridgeRuntimeCheckpointLimits,id:string=randomUUID(),revision=0):CampaignRecord {
  return recordForCheckpoint(encodeSession(session,limits),label,id,revision)
}
function recordForCheckpoint(checkpointJson:string,label:string,id:string=randomUUID(),revision=0):CampaignRecord {
  const record={id,label:normalizeCampaignLabel(label),revision,checkpointJson}
  summary(record);return record
}
export function initialCampaignLibrary(session:BridgeSession,limits:BridgeRuntimeCheckpointLimits,legacyOriginal:string|null):CampaignLibrary {
  if(!session.gameState.hollywood)throw new Error('Native campaigns require Hollywood authority')
  // Import is a native boundary too; validate both slots before publishing any record.
  const checked=loadBridgeRuntimeCheckpoint(encodeSession(session,limits),limits).hydrated
  const checkpoint=session.exportRuntimeCheckpoint()
  const mixedOrigins=checked.savedSave!==null&&!sameNativeCampaignOrigin(session.gameState,checked.savedSave.state)
  if(mixedOrigins&&legacyOriginal===null)throw new Error('Native current and saved slots have different world origins or missing Hollywood authority')
  // Old single-profile storage could retain a saved slot from another game.
  // Recover both as independent named records; the untouched outer bytes retain
  // the original slots/journal. A native record never inherits that mixed scope.
  if(mixedOrigins)session=BridgeSession.fromSaveJson(checkpoint.currentSaveJson,undefined,limits)
  const records:CampaignRecord[]=[]
  if(legacyOriginal!==null) {
    const current=recordFor(session,'Recovered campaign — current',limits)
    records.push(current)
    if(checkpoint.savedSaveJson!==null&&checkpoint.savedSaveJson!==checkpoint.currentSaveJson) {
      const saved=BridgeSession.fromSaveJson(checkpoint.savedSaveJson,undefined,limits)
      records.push(recordFor(saved,'Recovered campaign — saved',limits))
    }
  }
  return {format:CAMPAIGN_LIBRARY_FORMAT,libraryVersion:1,catalogueRevision:0,activeCampaignId:records[0]?.id??null,
    workingCheckpointJson:encodeSession(session,limits),records,receipts:[],legacyCheckpointJson:legacyOriginal}
}
export function encodeCampaignLibrary(library:CampaignLibrary):Promise<string> {
  return encodeCampaignStorage(library,CAMPAIGN_LIBRARY_MAX_BYTES)
}
/** Validate every record and nested checkpoint before exposing the catalogue. Unknown/corrupt data never creates a new game. */
export function loadCampaignLibrary(json:string,limits:BridgeRuntimeCheckpointLimits):{library:CampaignLibrary;session:BridgeSession;changed:boolean} {
  if(Buffer.byteLength(json,'utf8')>CAMPAIGN_LIBRARY_MAX_BYTES)throw new Error('Campaign library exceeds its aggregate byte bound')
  const encodedValue=JSON.parse(json)
  const value:unknown=decodeCampaignStorage(encodedValue,limits.maxCheckpointBytes,CAMPAIGN_LIBRARY_MAX_RECORDS)
  object(value,['format','libraryVersion','catalogueRevision','activeCampaignId','workingCheckpointJson','records','receipts','legacyCheckpointJson'])
  if(value.format!==CAMPAIGN_LIBRARY_FORMAT||value.libraryVersion!==1)throw new Error('Unsupported campaign library format/version')
  safeInteger(value.catalogueRevision)
  const catalogueRevision=value.catalogueRevision
  if(value.activeCampaignId!==null)uuid(value.activeCampaignId)
  if(typeof value.workingCheckpointJson!=='string'||!Array.isArray(value.records)||value.records.length>CAMPAIGN_LIBRARY_MAX_RECORDS||!Array.isArray(value.receipts)||value.receipts.length>MAX_RECEIPTS)throw new Error('Malformed or unbounded campaign library')
  if(value.legacyCheckpointJson!==null) {
    if(typeof value.legacyCheckpointJson!=='string')throw new Error('Malformed legacy recovery bytes')
    loadBridgeRuntimeCheckpoint(value.legacyCheckpointJson,limits)
  }
  const ids=new Set<string>(),labels=new Set<string>()
  const records=value.records.map(raw=>{
    object(raw,['id','label','revision','checkpointJson']);uuid(raw.id);safeInteger(raw.revision)
    if(raw.revision>catalogueRevision)throw new Error('Campaign record revision exceeds its catalogue')
    if(typeof raw.label!=='string'||normalizeCampaignLabel(raw.label)!==raw.label||typeof raw.checkpointJson!=='string')throw new Error('Malformed campaign record')
    if(ids.has(raw.id)||labels.has(labelKey(raw.label)))throw new Error('Duplicated campaign identity or label')
    ids.add(raw.id);labels.add(labelKey(raw.label))
    const session=hydrate(raw.checkpointJson,limits)
    return recordFor(session,raw.label,limits,raw.id,raw.revision)
  })
  if(value.activeCampaignId!==null&&!ids.has(value.activeCampaignId))throw new Error('Active campaign record is missing')
  const receipts:CampaignReceipt[]=[];const commands=new Set<string>()
  for(const raw of value.receipts) {
    object(raw,['commandId','requestJson','response'])
    if(typeof raw.commandId!=='string'||typeof raw.requestJson!=='string'||commands.has(raw.commandId))throw new Error('Malformed or duplicate campaign receipt')
    commands.add(raw.commandId)
    const request=parseWireValue(BRIDGE_SCHEMA.$defs.StudioCampaignRequest,JSON.parse(raw.requestJson))
    const response=parseWireValue(BRIDGE_SCHEMA.$defs.StudioCampaignAcceptedResponse,raw.response)
    if(canonicalJson(request)!==raw.requestJson||request.commandId!==raw.commandId||response.commandId!==raw.commandId||request.sessionId!==response.originatingSessionId||request.operation!==response.operation||response.catalogueRevision>value.catalogueRevision)throw new Error('Campaign receipt/request correlation failed')
    receipts.push({commandId:raw.commandId,requestJson:raw.requestJson,response})
  }
  const session=hydrate(value.workingCheckpointJson,limits)
  const active=records.find(r=>r.id===value.activeCampaignId)
  if(active) {
    const checkpoint=JSON.parse(active.checkpointJson)
    const saved=migrateToV20(importSave(checkpoint.currentSaveJson)).state
    const current=session.gameState
    if(saved.seed!==current.seed || saved.hollywood?.worldId!==current.hollywood?.worldId || saved.hollywood?.playerStudioId!==current.hollywood?.playerStudioId) {
      throw new Error('Active campaign record and working checkpoint have different world origins')
    }
  }
  const library:CampaignLibrary={format:CAMPAIGN_LIBRARY_FORMAT,libraryVersion:1,catalogueRevision:value.catalogueRevision,
    activeCampaignId:value.activeCampaignId as string|null,workingCheckpointJson:encodeSession(session,limits),records,receipts,
    legacyCheckpointJson:value.legacyCheckpointJson as string|null}
  const sourceRecords=value.records as CampaignRecord[]
  const changed=encodedValue.libraryVersion!==2 || canonicalJson(encodedValue)!==json || library.workingCheckpointJson!==value.workingCheckpointJson || records.some((r,i)=>r.checkpointJson!==sourceRecords[i]!.checkpointJson)
  return {library,session,changed}
}
export function campaignDirty(library:CampaignLibrary,session:BridgeSession):boolean {
  const active=library.records.find(r=>r.id===library.activeCampaignId)
  // An unnamed draft has no named savepoint, including after session/journal rollover.
  if(!active)return true
  return JSON.parse(active.checkpointJson).currentStateDigest!==session.snapshot().stateDigest
}
export function campaignLibrarySnapshot(library:CampaignLibrary,session:BridgeSession,durable:boolean):CampaignLibraryResponse {
  const snap=session.snapshot()
  return {protocolVersion:PROTOCOL_VERSION,schemaId:SCHEMA_ID,snapshotVersion:SNAPSHOT_VERSION,type:'campaignLibrary',
    sessionId:session.sessionId,stateRevision:session.stateRevision,gameWeek:snap.gameWeek,stateDigest:snap.stateDigest,
    catalogueRevision:library.catalogueRevision,activeCampaignId:library.activeCampaignId,dirty:campaignDirty(library,session),durable,
    campaigns:library.records.map(summary)}
}
export type CampaignProposal={library:CampaignLibrary;session:BridgeSession;response:CampaignAcceptedResponse;replayed:boolean}|{response:RejectedResponse}
/** Pure prospective transaction. The coordinator publishes ONLY after its atomic durable write. */
export function proposeCampaign(library:CampaignLibrary,session:BridgeSession,request:CampaignRequest,limits:BridgeRuntimeCheckpointLimits,regime:FoundingRegime):CampaignProposal {
  const started=performance.now(),requestJson=canonicalJson(request)
  const reject=(code:RejectionCode,message:string):CampaignProposal=>({response:session.protocolReject(request.commandId,code,message,started)})
  const receipt=library.receipts.find(r=>r.commandId===request.commandId)
  if(receipt)return receipt.requestJson===requestJson?{library,session,response:receipt.response,replayed:true}:reject('COMMAND_ID_REUSE','That campaign operation ID already names different request bytes.')
  if(request.sessionId!==session.sessionId)return reject('SESSION_MISMATCH','The active campaign changed. Refresh the library before trying again.')
  if(request.expectedStateRevision!==session.stateRevision)return reject('STALE_REVISION','The studio changed. Refresh before modifying its campaign record.')
  if(request.expectedCatalogueRevision!==library.catalogueRevision||request.expectedActiveCampaignId!==library.activeCampaignId)return reject('CAMPAIGN_CONFLICT','The campaign library or active record changed. Refresh and select the target again.')
  const operation=request.operation
  if(library.catalogueRevision>=2147483647)return reject('STORAGE_UNAVAILABLE','The campaign catalogue revision bound has been reached; preserve and recover this library before further writes.')
  if((operation==='save'||operation==='newGame'||operation==='saveAs'||operation==='discard')&&request.campaignId!==null)return reject('INVALID_CONTROL','This operation does not accept a selected campaign target.')
  if(!['saveAs'].includes(operation)&&request.overwriteCampaignId!==null)return reject('INVALID_CONTROL','An overwrite target is allowed only for an explicit Save As.')
  if(['save','load','delete','discard'].includes(operation)&&request.label!==null)return reject('INVALID_CONTROL','This operation does not change a campaign name.')
  if(operation==='discard'&&!request.confirmDestructive)return reject('CAMPAIGN_CONFLICT','Confirm discarding current unsaved progress.')
  let label:string|null=null
  if(['newGame','saveAs','rename'].includes(operation)) {
    if(request.label===null)return reject('INVALID_CAMPAIGN_LABEL','Enter a campaign name.')
    try{label=normalizeCampaignLabel(request.label)}catch(error){return reject('INVALID_CAMPAIGN_LABEL',(error as Error).message)}
  }
  const selected=library.records.find(r=>r.id===request.campaignId)
  if(['load','rename','delete'].includes(operation)&&!selected)return reject('CAMPAIGN_NOT_FOUND','The selected campaign no longer exists.')
  const overwrite=library.records.find(r=>r.id===request.overwriteCampaignId)
  if(request.overwriteCampaignId!==null&&(!overwrite||!request.confirmDestructive))return reject('CAMPAIGN_CONFLICT','Select and confirm the exact campaign to overwrite.')
  if(operation==='delete'&&!request.confirmDestructive)return reject('CAMPAIGN_CONFLICT','Confirm deletion of the selected named campaign.')
  const collision=label===null?undefined:library.records.find(r=>labelKey(r.label)===labelKey(label!))
  if(collision&&!(operation==='rename'&&collision.id===selected!.id)&&!(operation==='saveAs'&&collision.id===overwrite?.id))return reject('CAMPAIGN_CONFLICT','That name already belongs to another campaign. Choose a new name or an explicit overwrite target.')
  if(operation==='saveAs'&&overwrite?.id===library.activeCampaignId)return reject('CAMPAIGN_CONFLICT','Save updates the active record. Save As must preserve the original record.')
  if((operation==='newGame'||operation==='saveAs')&&!overwrite&&library.records.length>=CAMPAIGN_LIBRARY_MAX_RECORDS)return reject('STORAGE_UNAVAILABLE','The campaign library is full. Delete a deliberately selected record before creating another.')
  let records=[...library.records],activeId=library.activeCampaignId
  // Catalogue-only operations keep the unchanged authority and its pending
  // quotes. Replacement operations construct their own session below. Fork
  // lazily before Save, the only operation that mutates an existing session.
  let prospective=session
  // Reuse only within this synchronous transaction stage. Save mutates the same
  // session without advancing its revision; replacement sessions have new stages.
  let prepared:{session:BridgeSession;value:EncodedBridgeRuntimeCheckpoint}|null=null
  const prepare=():EncodedBridgeRuntimeCheckpoint=>{
    if(prepared===null||prepared.session!==prospective)prepared={session:prospective,value:prospective.exportRuntimeCheckpointEncoded(limits)}
    return prepared.value
  }
  const saveActive=():boolean=>{
    const index=records.findIndex(r=>r.id===activeId)
    if(index<0)return false
    if(prospective===session)prospective=hydrate(encodeSession(session,limits),limits)
    prepared=null
    const save=()=>prospective.dispatchWithRuntimeCheckpoint('save',{protocolVersion:PROTOCOL_VERSION,schemaId:SCHEMA_ID,sessionId:prospective.sessionId,
      commandId:request.commandId,expectedStateRevision:prospective.stateRevision} satisfies ControlEnvelope,limits)
    let result
    try{result=save()}catch(error){
      if(!(error instanceof BridgeRuntimeCheckpointHistoryFullError))throw error
      prospective=prospective.rolloverRuntime(limits)
      result=save()
    }
    if(!result.response.accepted)throw new Error(result.response.message)
    if(result.prepared!==null)prepared={session:prospective,value:result.prepared}
    const record=records[index]!
    records[index]=recordForCheckpoint(prepare().encoded,record.label,record.id,record.revision+1)
    return true
  }
  if((operation==='newGame'||operation==='load')&&campaignDirty(library,session)) {
    if(request.unsavedDisposition==='requireClean')return reject('UNSAVED_PROGRESS','Save or discard current progress before leaving this campaign, or cancel.')
    if(request.unsavedDisposition==='save'&&!saveActive())return reject('UNSAVED_PROGRESS','Name this unsaved campaign with Save As before leaving it.')
  }
  switch(operation) {
    case 'discard': {
      const active=records.find(r=>r.id===activeId)
      prospective=active?hydrate(active.checkpointJson,limits).rolloverRuntime(limits):BridgeSession.createRuntime(limits,regime)
      break
    }
    case 'newGame': {
      prospective=BridgeSession.createRuntime(limits,regime)
      const record=recordForCheckpoint(prepare().encoded,label!);records.push(record);activeId=record.id;break
    }
    case 'save':if(!saveActive())return reject('NO_SAVE','Use Save As to name this campaign first.');break
    case 'saveAs': {
      // Current complete state, seed, RNG and identities; only session/storage scopes are new.
      prospective=BridgeSession.fromSaveJson(session.exportRuntimeCheckpoint().currentSaveJson,undefined,limits)
      const record=recordForCheckpoint(prepare().encoded,label!,overwrite?.id??randomUUID(),overwrite?overwrite.revision+1:0)
      if(overwrite)records=records.map(r=>r.id===overwrite.id?record:r);else records.push(record)
      activeId=record.id;break
    }
    case 'load': {
      // A library record is a complete recoverable campaign; retain its explicit saved-state distinction.
      prospective=hydrate(records.find(r=>r.id===selected!.id)!.checkpointJson,limits).rolloverRuntime(limits)
      activeId=selected!.id;break
    }
    case 'rename': {
      records=records.map(r=>r.id===selected!.id?{...r,label:label!,revision:r.revision+1}:r);break
    }
    case 'delete': {
      records=records.filter(r=>r.id!==selected!.id)
      if(activeId===selected!.id)activeId=null // Working state remains an unnamed draft; autosave cannot recreate a record.
      break
    }
  }
  const finalCheckpoint=prepare()
  const checkpoint=finalCheckpoint.checkpoint
  const response:CampaignAcceptedResponse={protocolVersion:PROTOCOL_VERSION,schemaId:SCHEMA_ID,type:'campaignAccepted',accepted:true,
    commandId:request.commandId,originatingSessionId:request.sessionId,operation,campaignId:activeId,sessionId:prospective.sessionId,
    stateRevision:prospective.stateRevision,gameWeek:prospective.gameState.market.tick,stateDigest:checkpoint.currentStateDigest,
    catalogueRevision:library.catalogueRevision+1,message:{newGame:'New independent campaign created.',save:'Campaign saved.',saveAs:'Current campaign copied; the copy is now active.',load:'Selected campaign restored.',rename:'Campaign renamed.',delete:'Selected campaign deleted.',discard:'Unsaved progress discarded; named records are preserved.'}[operation],processingMs:performance.now()-started}
  parseWireValue(BRIDGE_SCHEMA.$defs.StudioCampaignAcceptedResponse,response)
  const next:CampaignLibrary={...library,catalogueRevision:response.catalogueRevision,activeCampaignId:activeId,records,
    workingCheckpointJson:finalCheckpoint.encoded,receipts:[...library.receipts,{commandId:request.commandId,requestJson,response}].slice(-MAX_RECEIPTS)}
  return {library:next,session:prospective,response,replayed:false}
}

/** Backward-compatible /save updates the active named record in the same atomic transaction. */
export function withWorkingCampaignCheckpoint(library:CampaignLibrary,checkpointJson:string,saveActive:boolean):CampaignLibrary {
  if(!saveActive||library.activeCampaignId===null)return {...library,workingCheckpointJson:checkpointJson}
  return {...library,workingCheckpointJson:checkpointJson,catalogueRevision:library.catalogueRevision+1,
    records:library.records.map(r=>r.id===library.activeCampaignId?{...r,revision:r.revision+1,checkpointJson}:r)}
}
