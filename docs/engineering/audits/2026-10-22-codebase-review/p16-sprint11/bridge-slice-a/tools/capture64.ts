// Sprint 11 S1: capture the genuine P16-build outgoing64 runtime checkpoint. Run ONLY in an immutable snapshot of
// a5a66c27 (tag p16-technical-checkpoint-20261027), from its root, with CONTRACT65_OUTPUT naming an empty directory:
//   CONTRACT65_OUTPUT=<dir> npx vite-node <this file copied into the snapshot root>
// Then freeze <dir>/outgoing64.checkpoint.json.gz and OUTGOING64-RECEIPT.json at
// tests/fixtures/p16/genuine-projection64-runtime/ and fill the three PLACEHOLDER pins in
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
const output=process.env.CONTRACT65_OUTPUT
assert.ok(output)
assert.equal(PROTOCOL_VERSION,4);assert.equal(PROJECTION_VERSION,64);assert.equal(LIVE_SAVE_VERSION,49)
assert.equal(SCHEMA_ID,'sha256:57f12ee28d21aa47c7514afa1c058105a10f10a9e76d400d664e97c23dc90272')
const dto=readFileSync('generated/unity/StudioBridgeDtos.Generated.cs')
assert.equal(sha(dto),'d80acca15d87c65429860263eeb9f5a59b65b41c30f1bdbfcc084883a43c6943')
const state=createManagedBridgeState('p16-authentic-outgoing64')
assert.equal(state.market.tick,0,'public managed founding performs no tick')
const session=new BridgeSession(state,'p16-authentic-outgoing64-session')
const result=session.dispatchWithRuntimeCheckpoint('save',{protocolVersion:PROTOCOL_VERSION,schemaId:SCHEMA_ID,sessionId:session.sessionId,commandId:'outgoing64-real-save',expectedStateRevision:session.stateRevision})
assert.equal(result.response.accepted,true)
assert.ok(result.prepared)
const {checkpoint,encoded}=result.prepared
assert.equal(checkpoint.schemaId,SCHEMA_ID);assert.equal(checkpoint.journal.length,1)
assert.equal(checkpoint.journal[0]!.route,'save')
assert.ok(checkpoint.savedSaveJson)
assert.equal(JSON.parse(checkpoint.currentSaveJson).saveVersion,49)
decodeBridgeRuntimeCheckpoint(encoded)
const zipped=gzipSync(encoded)
writeFileSync(`${output}/outgoing64.checkpoint.json.gz`,zipped,{flag:'wx'})
writeFileSync(`${output}/OUTGOING64-RECEIPT.json`,JSON.stringify({status:'ACTUAL-PUBLIC-RUNTIME-CAPTURE',sourceHead:'a5a66c27e8b07b029d196850f8133cccfa3d26ef',producerSha256:sha(readFileSync(new URL(import.meta.url))),schemaId:SCHEMA_ID,protocolVersion:PROTOCOL_VERSION,projectionVersion:PROJECTION_VERSION,saveVersion:LIVE_SAVE_VERSION,generatedDtoSha256:sha(dto),decodedSha256:sha(encoded),compressedSha256:sha(zipped),compressedBytes:zipped.length,currentSaveSha256:sha(checkpoint.currentSaveJson),savedSaveSha256:sha(checkpoint.savedSaveJson),journalEntries:checkpoint.journal.length,publicRoute:'BridgeSession.dispatchWithRuntimeCheckpoint(save)',actualTicks:0,node:process.version},null,2)+'\n',{flag:'wx'})
