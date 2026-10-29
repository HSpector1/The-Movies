// ASTRA Sprint 20 (projection 70): capture the genuine outgoing69 runtime checkpoint. Run ONLY on an immutable detached
// snapshot of edb1cee4 (projection 69, Save51; tag p18-sprint19-checkpoint-20261029), read-only, with CONTRACT70_OUTPUT
// naming an empty directory: node <wt>/node_modules/vite-node/vite-node.mjs --root /Users/zacheryspector/studio-scratch/astra-snapshot-edb1cee4 capture69.ts.
// Then freeze <dir>/outgoing69.checkpoint.json.gz and OUTGOING69-RECEIPT.json at
// tests/fixtures/bridge/genuine-projection69-runtime/ and pin tests/bridge-runtime-checkpoint.test.ts from the receipt.
// Pattern: playtest-response/bridge-step/tools/capture68.ts.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import { BridgeSession, createManagedBridgeState } from '/Users/zacheryspector/studio-scratch/astra-snapshot-edb1cee4/bridge/session.ts'
import { PROTOCOL_VERSION, SCHEMA_ID } from '/Users/zacheryspector/studio-scratch/astra-snapshot-edb1cee4/bridge/protocol.ts'
import { PROJECTION_VERSION } from '/Users/zacheryspector/studio-scratch/astra-snapshot-edb1cee4/bridge/schema/bridge-schema.ts'
import { decodeBridgeRuntimeCheckpoint } from '/Users/zacheryspector/studio-scratch/astra-snapshot-edb1cee4/bridge/runtime-checkpoint.ts'
import { LIVE_SAVE_VERSION } from '/Users/zacheryspector/studio-scratch/astra-snapshot-edb1cee4/src/core/save.ts'
const sha=(value:string|Uint8Array)=>createHash('sha256').update(value).digest('hex')
const output=process.env.CONTRACT70_OUTPUT
assert.ok(output)
assert.equal(PROTOCOL_VERSION,4);assert.equal(PROJECTION_VERSION,69);assert.equal(LIVE_SAVE_VERSION,51)
assert.equal(SCHEMA_ID,'sha256:6cdb8065eedbfe81d794f6e0a17db71570729ac5701f688ea033b2175bfe4a5a')
const dto=readFileSync('/Users/zacheryspector/studio-scratch/astra-snapshot-edb1cee4/generated/unity/StudioBridgeDtos.Generated.cs')
assert.equal(sha(dto),'f30bb208dde04abe12972e8ef0056d247fab5d0ad08ecf6dff7ccbaafa3c3c0e')
const state=createManagedBridgeState('p18-authentic-outgoing69')
assert.equal(state.market.tick,0,'public managed founding performs no tick')
const session=new BridgeSession(state,'p18-authentic-outgoing69-session')
const result=session.dispatchWithRuntimeCheckpoint('save',{protocolVersion:PROTOCOL_VERSION,schemaId:SCHEMA_ID,sessionId:session.sessionId,commandId:'outgoing69-real-save',expectedStateRevision:session.stateRevision})
assert.equal(result.response.accepted,true)
assert.ok(result.prepared)
const {checkpoint,encoded}=result.prepared
assert.equal(checkpoint.schemaId,SCHEMA_ID);assert.equal(checkpoint.journal.length,1)
assert.equal(checkpoint.journal[0]!.route,'save')
assert.ok(checkpoint.savedSaveJson)
assert.equal(JSON.parse(checkpoint.currentSaveJson).saveVersion,51)
decodeBridgeRuntimeCheckpoint(encoded)
const zipped=gzipSync(encoded)
writeFileSync(`${output}/outgoing69.checkpoint.json.gz`,zipped,{flag:'wx'})
writeFileSync(`${output}/OUTGOING69-RECEIPT.json`,JSON.stringify({status:'ACTUAL-PUBLIC-RUNTIME-CAPTURE',sourceHead:'edb1cee4d7c203fa5603b5febebc77d3ba794691',producerSha256:sha(readFileSync(new URL(import.meta.url))),schemaId:SCHEMA_ID,protocolVersion:PROTOCOL_VERSION,projectionVersion:PROJECTION_VERSION,saveVersion:LIVE_SAVE_VERSION,generatedDtoSha256:sha(dto),decodedSha256:sha(encoded),compressedSha256:sha(zipped),compressedBytes:zipped.length,currentSaveSha256:sha(checkpoint.currentSaveJson),savedSaveSha256:sha(checkpoint.savedSaveJson),journalEntries:checkpoint.journal.length,publicRoute:'BridgeSession.dispatchWithRuntimeCheckpoint(save)',actualTicks:0,node:process.version},null,2)+'\n',{flag:'wx'})
console.log('captured outgoing69')
