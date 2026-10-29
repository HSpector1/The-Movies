// Playtest-response slice (decision 7c): capture the genuine outgoing68 runtime checkpoint. Run ONLY on an immutable
// snapshot of b3c179b0 (projection 68, Save51; tag p18-sprint16-playtest-candidate-r2-20261028), read-only, with
// CONTRACT69_OUTPUT naming an empty directory. The lane runs it from the snapshot root with vite-node --root <root>.
// Then freeze <dir>/outgoing68.checkpoint.json.gz and OUTGOING68-RECEIPT.json at
// tests/fixtures/bridge/genuine-projection68-runtime/ and pin tests/bridge-runtime-checkpoint.test.ts from the receipt
// (compressedSha256, decodedSha256, currentSaveSha256). Pattern: p18-sprint13/bridge-step/tools/capture67.ts.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import { BridgeSession, createManagedBridgeState } from '/Users/zacheryspector/studio-scratch/p17-continuation-20261027-wt/bridge/session.ts'
import { PROTOCOL_VERSION, SCHEMA_ID } from '/Users/zacheryspector/studio-scratch/p17-continuation-20261027-wt/bridge/protocol.ts'
import { PROJECTION_VERSION } from '/Users/zacheryspector/studio-scratch/p17-continuation-20261027-wt/bridge/schema/bridge-schema.ts'
import { decodeBridgeRuntimeCheckpoint } from '/Users/zacheryspector/studio-scratch/p17-continuation-20261027-wt/bridge/runtime-checkpoint.ts'
import { LIVE_SAVE_VERSION } from '/Users/zacheryspector/studio-scratch/p17-continuation-20261027-wt/src/core/save.ts'
const sha=(value:string|Uint8Array)=>createHash('sha256').update(value).digest('hex')
const output=process.env.CONTRACT69_OUTPUT
assert.ok(output)
assert.equal(PROTOCOL_VERSION,4);assert.equal(PROJECTION_VERSION,68);assert.equal(LIVE_SAVE_VERSION,51)
assert.equal(SCHEMA_ID,'sha256:b91efc9c632b2503a0f5ca0f33a243164e97775b2c13f566746ba004d7835851')
const dto=readFileSync('/Users/zacheryspector/studio-scratch/p17-continuation-20261027-wt/generated/unity/StudioBridgeDtos.Generated.cs')
assert.equal(sha(dto),'2da6d5c5fa8f54c5251cca589f7a93204c17694e66b781699cd6fcf218b419ce')
const state=createManagedBridgeState('p18-authentic-outgoing68')
assert.equal(state.market.tick,0,'public managed founding performs no tick')
const session=new BridgeSession(state,'p18-authentic-outgoing68-session')
const result=session.dispatchWithRuntimeCheckpoint('save',{protocolVersion:PROTOCOL_VERSION,schemaId:SCHEMA_ID,sessionId:session.sessionId,commandId:'outgoing68-real-save',expectedStateRevision:session.stateRevision})
assert.equal(result.response.accepted,true)
assert.ok(result.prepared)
const {checkpoint,encoded}=result.prepared
assert.equal(checkpoint.schemaId,SCHEMA_ID);assert.equal(checkpoint.journal.length,1)
assert.equal(checkpoint.journal[0]!.route,'save')
assert.ok(checkpoint.savedSaveJson)
assert.equal(JSON.parse(checkpoint.currentSaveJson).saveVersion,51)
decodeBridgeRuntimeCheckpoint(encoded)
const zipped=gzipSync(encoded)
writeFileSync(`${output}/outgoing68.checkpoint.json.gz`,zipped,{flag:'wx'})
writeFileSync(`${output}/OUTGOING68-RECEIPT.json`,JSON.stringify({status:'ACTUAL-PUBLIC-RUNTIME-CAPTURE',sourceHead:'b3c179b07fd1d41446c2f5ea00872a9e38b94703',producerSha256:sha(readFileSync(new URL(import.meta.url))),schemaId:SCHEMA_ID,protocolVersion:PROTOCOL_VERSION,projectionVersion:PROJECTION_VERSION,saveVersion:LIVE_SAVE_VERSION,generatedDtoSha256:sha(dto),decodedSha256:sha(encoded),compressedSha256:sha(zipped),compressedBytes:zipped.length,currentSaveSha256:sha(checkpoint.currentSaveJson),savedSaveSha256:sha(checkpoint.savedSaveJson),journalEntries:checkpoint.journal.length,publicRoute:'BridgeSession.dispatchWithRuntimeCheckpoint(save)',actualTicks:0,node:process.version},null,2)+'\n',{flag:'wx'})
console.log('captured outgoing68')
