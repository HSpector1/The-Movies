// Sprint 11 slice B: capture the genuine outgoing65 runtime checkpoint. Run ONLY in an immutable snapshot of
// 2b1a5b4b (projection 65, Save50), from its root, with CONTRACT66_OUTPUT naming an empty directory:
//   CONTRACT66_OUTPUT=<dir> npx vite-node <this file copied into the snapshot root>
// Then freeze <dir>/outgoing65.checkpoint.json.gz and OUTGOING65-RECEIPT.json at
// tests/fixtures/bridge/genuine-projection65-runtime/ and fill the three PLACEHOLDER pins in
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
const output=process.env.CONTRACT66_OUTPUT
assert.ok(output)
assert.equal(PROTOCOL_VERSION,4);assert.equal(PROJECTION_VERSION,65);assert.equal(LIVE_SAVE_VERSION,50)
assert.equal(SCHEMA_ID,'sha256:d57642ad971a0682ae587c8d9c73fdf8b251f28749dd156e53a5c8487b4e6df8')
const dto=readFileSync('generated/unity/StudioBridgeDtos.Generated.cs')
assert.equal(sha(dto),'1be6dfd89031ce6ebe3cbcca5e7aa41a03c02ee81c8b490b1e15691824f4a1f0')
const state=createManagedBridgeState('p17-authentic-outgoing65')
assert.equal(state.market.tick,0,'public managed founding performs no tick')
const session=new BridgeSession(state,'p17-authentic-outgoing65-session')
const result=session.dispatchWithRuntimeCheckpoint('save',{protocolVersion:PROTOCOL_VERSION,schemaId:SCHEMA_ID,sessionId:session.sessionId,commandId:'outgoing65-real-save',expectedStateRevision:session.stateRevision})
assert.equal(result.response.accepted,true)
assert.ok(result.prepared)
const {checkpoint,encoded}=result.prepared
assert.equal(checkpoint.schemaId,SCHEMA_ID);assert.equal(checkpoint.journal.length,1)
assert.equal(checkpoint.journal[0]!.route,'save')
assert.ok(checkpoint.savedSaveJson)
assert.equal(JSON.parse(checkpoint.currentSaveJson).saveVersion,50)
decodeBridgeRuntimeCheckpoint(encoded)
const zipped=gzipSync(encoded)
writeFileSync(`${output}/outgoing65.checkpoint.json.gz`,zipped,{flag:'wx'})
writeFileSync(`${output}/OUTGOING65-RECEIPT.json`,JSON.stringify({status:'ACTUAL-PUBLIC-RUNTIME-CAPTURE',sourceHead:'2b1a5b4b50dd66b6506d61b51a6b8a6861581579',producerSha256:sha(readFileSync(new URL(import.meta.url))),schemaId:SCHEMA_ID,protocolVersion:PROTOCOL_VERSION,projectionVersion:PROJECTION_VERSION,saveVersion:LIVE_SAVE_VERSION,generatedDtoSha256:sha(dto),decodedSha256:sha(encoded),compressedSha256:sha(zipped),compressedBytes:zipped.length,currentSaveSha256:sha(checkpoint.currentSaveJson),savedSaveSha256:sha(checkpoint.savedSaveJson),journalEntries:checkpoint.journal.length,publicRoute:'BridgeSession.dispatchWithRuntimeCheckpoint(save)',actualTicks:0,node:process.version},null,2)+'\n',{flag:'wx'})
