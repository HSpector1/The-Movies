import {parentPort, workerData} from 'node:worker_threads'
import {join} from 'node:path'
import {BridgeSession} from '../session.ts'
import {PROTOCOL_VERSION,SCHEMA_ID,SNAPSHOT_VERSION} from '../protocol.ts'
import {CAMPAIGN_LIBRARY_MAX_BYTES} from './campaign-library.ts'
import {openBridgeCheckpointStore,type BridgeCheckpointStore} from './checkpoint-store.ts'
import {createBridgeRuntimeCoordinator,type BridgeRuntimeCoordinator} from './runtime-coordinator.ts'
import {loadPostCommitResponseTestGate,POST_COMMIT_RESPONSE_TEST_ENV} from '../testing/post-commit-response-gate.ts'
import {executeRuntimeWorkerRequest} from './worker-adapter.ts'
import type {RuntimeWorkerConfiguration,RuntimeWorkerInput,RuntimeWorkerOutput} from './worker-contract.ts'
if(parentPort===null)throw new Error('Runtime worker requires its parent message port.')
const port=parentPort
const configuration=workerData as RuntimeWorkerConfiguration
let runtime:BridgeRuntimeCoordinator|null=null, store:BridgeCheckpointStore|null=null, stopping=false, startupComplete=false
const handlers=new Set<Promise<void>>()
const send=(message:RuntimeWorkerOutput,transfer:ArrayBuffer[]=[]):void=>port.postMessage(message,transfer)
const reportFatal=(error:unknown):void=>send({kind:'fatal',message:(error as Error).message??'Runtime worker failed.'})
// Startup reports failure only after its cleanup; an early notification must not race parent termination with lock release.
const fatal=(error:unknown):void=>{if(startupComplete)reportFatal(error)}
class MemoryCheckpointStore implements BridgeCheckpointStore {
 readonly checkpointPath='<memory-only>';private contents:string|null=null
 async read():Promise<string|null>{return this.contents}
 async writeAtomic(text:string):Promise<void>{this.contents=text}
 async close():Promise<void>{}
}
if(configuration.testGateEnvironment!==undefined)process.env[POST_COMMIT_RESPONSE_TEST_ENV]=configuration.testGateEnvironment
const durable=configuration.runtimeDirectory!==null
const gate=loadPostCommitResponseTestGate(durable)
const initialized=(async()=>{
 if(configuration.regime!=='endowed'&&configuration.regime!=='bare-lot')throw new Error('Unknown founding regime.')
 store=durable?await openBridgeCheckpointStore(join(configuration.runtimeDirectory!,'bridge-runtime-v1.json'),{runtimeRoot:configuration.runtimeDirectory!,maxBytes:CAMPAIGN_LIBRARY_MAX_BYTES}):new MemoryCheckpointStore()
 runtime=await createBridgeRuntimeCoordinator({store,campaigns:{durable,regime:configuration.regime},createFreshSession:limits=>BridgeSession.createRuntime(limits,configuration.regime),fatal})
 const initial=await runtime.read(session=>{const s=session.snapshot();return {protocolVersion:PROTOCOL_VERSION,schemaId:SCHEMA_ID,snapshotVersion:SNAPSHOT_VERSION,runtimeInstanceId:configuration.runtimeInstanceId,durable,sessionId:s.sessionId,stateRevision:s.stateRevision,gameWeek:s.gameWeek,stateDigest:s.stateDigest,payloadBytes:s.metrics.payloadBytes,serializationMs:s.metrics.serializationMs}})
 startupComplete=true
 send({kind:'ready',ready:initial})
 return runtime
})()
void initialized.catch(async error=>{try{await store?.close()}catch{}reportFatal(error);process.exitCode=1;port.close()})
port.on('message',(message:RuntimeWorkerInput)=>{
 if(message.kind==='close'){
  if(stopping)return;stopping=true
  void initialized.then(async active=>{await Promise.allSettled([...handlers]);await active.close()}).then(()=>{send({kind:'closed'});port.close()},error=>{fatal(error);process.exitCode=1;port.close()})
  return
 }
 if(message.kind!=='request'||stopping)return
 // Route handlers may await replies/test gates concurrently; only the existing coordinator owns authority ordering.
 const handler=initialized.then(active=>executeRuntimeWorkerRequest(active,message.request,configuration.runtimeInstanceId,gate)).then(reply=>{send({kind:'response',id:message.id,reply},[reply.body.buffer as ArrayBuffer])},error=>{send({kind:'request-error',id:message.id,message:(error as Error).message})})
 handlers.add(handler);void handler.finally(()=>handlers.delete(handler))
})
