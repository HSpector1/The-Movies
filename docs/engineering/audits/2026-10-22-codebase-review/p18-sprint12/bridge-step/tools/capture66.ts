// Sprint 12 bridge step: capture the genuine outgoing66 runtime checkpoint. Run ONLY in an immutable snapshot of
// ecbc42c9 (projection 66, Save50), from its root, with CONTRACT67_OUTPUT naming an empty directory:
//   CONTRACT67_OUTPUT=<dir> npx vite-node <this file copied into the snapshot root>
// Then freeze <dir>/outgoing66.checkpoint.json.gz and OUTGOING66-RECEIPT.json at
// tests/fixtures/bridge/genuine-projection66-runtime/ and fill the three PLACEHOLDER pins in
// tests/bridge-runtime-checkpoint.test.ts from the receipt (compressedSha256, decodedSha256, currentSaveSha256).
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import { BridgeSession, createManagedBridgeState } from './bridge/session.ts'
import { PROTOCOL_VERSION, SCHEMA_ID } from './bridge/protocol.ts'
import { PROJECTION_VERSION } from './bridge/schema/bridge-schema.ts'
import { decodeBridgeRuntimeCheckpoint } from './bridge/runtime-checkpoint.ts'
import { LIVE_SAVE_VERSION } from './src/core/save.ts'
const sha=(value:string|Uint8Array)=>createHash('sha256').update(value).digest('hex')
const output=process.env.CONTRACT67_OUTPUT
assert.ok(output)
assert.equal(PROTOCOL_VERSION,4);assert.equal(PROJECTION_VERSION,66);assert.equal(LIVE_SAVE_VERSION,50)
assert.equal(SCHEMA_ID,'sha256:589380869e1329a8027b8339b88646761ce6d791376df5fd793e77ae9dd3b96a')
const dto=readFileSync('generated/unity/StudioBridgeDtos.Generated.cs')
assert.equal(sha(dto),'47f080760227875efa856cb06b91290bb765dab04d14e92bb7e3ab9ba675ffc1')
const state=createManagedBridgeState('p17-authentic-outgoing66')
assert.equal(state.market.tick,0,'public managed founding performs no tick')
const session=new BridgeSession(state,'p17-authentic-outgoing66-session')
const result=session.dispatchWithRuntimeCheckpoint('save',{protocolVersion:PROTOCOL_VERSION,schemaId:SCHEMA_ID,sessionId:session.sessionId,commandId:'outgoing66-real-save',expectedStateRevision:session.stateRevision})
assert.equal(result.response.accepted,true)
assert.ok(result.prepared)
const {checkpoint,encoded}=result.prepared
assert.equal(checkpoint.schemaId,SCHEMA_ID);assert.equal(checkpoint.journal.length,1)
assert.equal(checkpoint.journal[0]!.route,'save')
assert.ok(checkpoint.savedSaveJson)
assert.equal(JSON.parse(checkpoint.currentSaveJson).saveVersion,50)
decodeBridgeRuntimeCheckpoint(encoded)
const zipped=gzipSync(encoded)
writeFileSync(`${output}/outgoing66.checkpoint.json.gz`,zipped,{flag:'wx'})
writeFileSync(`${output}/OUTGOING66-RECEIPT.json`,JSON.stringify({status:'ACTUAL-PUBLIC-RUNTIME-CAPTURE',sourceHead:'ecbc42c97020ba74f239e78463f1898cfdf00a88',producerSha256:sha(readFileSync(new URL(import.meta.url))),schemaId:SCHEMA_ID,protocolVersion:PROTOCOL_VERSION,projectionVersion:PROJECTION_VERSION,saveVersion:LIVE_SAVE_VERSION,generatedDtoSha256:sha(dto),decodedSha256:sha(encoded),compressedSha256:sha(zipped),compressedBytes:zipped.length,currentSaveSha256:sha(checkpoint.currentSaveJson),savedSaveSha256:sha(checkpoint.savedSaveJson),journalEntries:checkpoint.journal.length,publicRoute:'BridgeSession.dispatchWithRuntimeCheckpoint(save)',actualTicks:0,node:process.version},null,2)+'\n',{flag:'wx'})
