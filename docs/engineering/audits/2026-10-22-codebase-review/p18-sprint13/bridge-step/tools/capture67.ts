// Sprint 13 slice B: capture the genuine outgoing67 runtime checkpoint. Run ONLY in an immutable snapshot of
// 31fdb366 (projection 67, Save51), from its root, with CONTRACT68_OUTPUT naming an empty directory:
//   CONTRACT68_OUTPUT=<dir> npx vite-node <this file copied into the snapshot root>
// Then freeze <dir>/outgoing67.checkpoint.json.gz and OUTGOING67-RECEIPT.json at
// tests/fixtures/bridge/genuine-projection67-runtime/ and fill the three PLACEHOLDER pins in
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
const output=process.env.CONTRACT68_OUTPUT
assert.ok(output)
assert.equal(PROTOCOL_VERSION,4);assert.equal(PROJECTION_VERSION,67);assert.equal(LIVE_SAVE_VERSION,51)
assert.equal(SCHEMA_ID,'sha256:8bd45eec049c6105ed2efee3899cfbb2a440c1b40f536a899b332ffbde3003f0')
const dto=readFileSync('generated/unity/StudioBridgeDtos.Generated.cs')
assert.equal(sha(dto),'bfc54ea4df66a7e12f7e405c7307b60562816c908ccfac9d0670ee80a996f450')
const state=createManagedBridgeState('p17-authentic-outgoing67')
assert.equal(state.market.tick,0,'public managed founding performs no tick')
const session=new BridgeSession(state,'p17-authentic-outgoing67-session')
const result=session.dispatchWithRuntimeCheckpoint('save',{protocolVersion:PROTOCOL_VERSION,schemaId:SCHEMA_ID,sessionId:session.sessionId,commandId:'outgoing67-real-save',expectedStateRevision:session.stateRevision})
assert.equal(result.response.accepted,true)
assert.ok(result.prepared)
const {checkpoint,encoded}=result.prepared
assert.equal(checkpoint.schemaId,SCHEMA_ID);assert.equal(checkpoint.journal.length,1)
assert.equal(checkpoint.journal[0]!.route,'save')
assert.ok(checkpoint.savedSaveJson)
assert.equal(JSON.parse(checkpoint.currentSaveJson).saveVersion,51)
decodeBridgeRuntimeCheckpoint(encoded)
const zipped=gzipSync(encoded)
writeFileSync(`${output}/outgoing67.checkpoint.json.gz`,zipped,{flag:'wx'})
writeFileSync(`${output}/OUTGOING67-RECEIPT.json`,JSON.stringify({status:'ACTUAL-PUBLIC-RUNTIME-CAPTURE',sourceHead:'31fdb366f977c2d22fbf8b19266e1e349bf48d6a',producerSha256:sha(readFileSync(new URL(import.meta.url))),schemaId:SCHEMA_ID,protocolVersion:PROTOCOL_VERSION,projectionVersion:PROJECTION_VERSION,saveVersion:LIVE_SAVE_VERSION,generatedDtoSha256:sha(dto),decodedSha256:sha(encoded),compressedSha256:sha(zipped),compressedBytes:zipped.length,currentSaveSha256:sha(checkpoint.currentSaveJson),savedSaveSha256:sha(checkpoint.savedSaveJson),journalEntries:checkpoint.journal.length,publicRoute:'BridgeSession.dispatchWithRuntimeCheckpoint(save)',actualTicks:0,node:process.version},null,2)+'\n',{flag:'wx'})
