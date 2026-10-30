// ASTRA Sprint 27 (projection 71): capture the genuine outgoing70 runtime checkpoint. Run ONLY on an immutable detached
// sparse snapshot of 6ddeeb00 (projection 70, Save51; tag p18-sprint26-candidate-20261030), read-only, with
// CONTRACT71_OUTPUT naming an empty directory:
//   CONTRACT71_OUTPUT=<dir> node <wt>/node_modules/vite-node/vite-node.mjs --root /Users/zacheryspector/studio-scratch/astra-snapshot-6ddeeb00 capture70.ts
// Then freeze <dir>/outgoing70.checkpoint.json.gz and OUTGOING70-RECEIPT.json at
// tests/fixtures/bridge/genuine-projection70-runtime/ and pin tests/bridge-runtime-checkpoint.test.ts from the receipt.
// Pattern: astra-sprints-17-21/sprint20/bridge-step/tools/capture69.ts.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import { BridgeSession, createManagedBridgeState } from '/Users/zacheryspector/studio-scratch/astra-snapshot-6ddeeb00/bridge/session.ts'
import { PROTOCOL_VERSION, SCHEMA_ID } from '/Users/zacheryspector/studio-scratch/astra-snapshot-6ddeeb00/bridge/protocol.ts'
import { PROJECTION_VERSION } from '/Users/zacheryspector/studio-scratch/astra-snapshot-6ddeeb00/bridge/schema/bridge-schema.ts'
import { decodeBridgeRuntimeCheckpoint } from '/Users/zacheryspector/studio-scratch/astra-snapshot-6ddeeb00/bridge/runtime-checkpoint.ts'
import { LIVE_SAVE_VERSION } from '/Users/zacheryspector/studio-scratch/astra-snapshot-6ddeeb00/src/core/save.ts'
const sha=(value:string|Uint8Array)=>createHash('sha256').update(value).digest('hex')
const output=process.env.CONTRACT71_OUTPUT
assert.ok(output)
assert.equal(PROTOCOL_VERSION,4);assert.equal(PROJECTION_VERSION,70);assert.equal(LIVE_SAVE_VERSION,51)
assert.equal(SCHEMA_ID,'sha256:aaafd0bdf597d3538acc5cb77568dd38de43dd50c7f052767ee40bb8e16ea448')
const dto=readFileSync('/Users/zacheryspector/studio-scratch/astra-snapshot-6ddeeb00/generated/unity/StudioBridgeDtos.Generated.cs')
assert.equal(sha(dto),'2e6cae58ccca518805d25549edee023f03dc1e2a0777e21c5994204599265061')
const state=createManagedBridgeState('p18-authentic-outgoing70')
assert.equal(state.market.tick,0,'public managed founding performs no tick')
const session=new BridgeSession(state,'p18-authentic-outgoing70-session')
const result=session.dispatchWithRuntimeCheckpoint('save',{protocolVersion:PROTOCOL_VERSION,schemaId:SCHEMA_ID,sessionId:session.sessionId,commandId:'outgoing70-real-save',expectedStateRevision:session.stateRevision})
assert.equal(result.response.accepted,true)
assert.ok(result.prepared)
const {checkpoint,encoded}=result.prepared
assert.equal(checkpoint.schemaId,SCHEMA_ID);assert.equal(checkpoint.journal.length,1)
assert.equal(checkpoint.journal[0]!.route,'save')
assert.ok(checkpoint.savedSaveJson)
assert.equal(JSON.parse(checkpoint.currentSaveJson).saveVersion,51)
decodeBridgeRuntimeCheckpoint(encoded)
const zipped=gzipSync(encoded)
writeFileSync(`${output}/outgoing70.checkpoint.json.gz`,zipped,{flag:'wx'})
writeFileSync(`${output}/OUTGOING70-RECEIPT.json`,JSON.stringify({status:'ACTUAL-PUBLIC-RUNTIME-CAPTURE',sourceHead:'6ddeeb00c5636c13429637694b5e60d98a8bc190',producerSha256:sha(readFileSync(new URL(import.meta.url))),schemaId:SCHEMA_ID,protocolVersion:PROTOCOL_VERSION,projectionVersion:PROJECTION_VERSION,saveVersion:LIVE_SAVE_VERSION,generatedDtoSha256:sha(dto),decodedSha256:sha(encoded),compressedSha256:sha(zipped),compressedBytes:zipped.length,currentSaveSha256:sha(checkpoint.currentSaveJson),savedSaveSha256:sha(checkpoint.savedSaveJson),journalEntries:checkpoint.journal.length,publicRoute:'BridgeSession.dispatchWithRuntimeCheckpoint(save)',actualTicks:0,node:process.version},null,2)+'\n',{flag:'wx'})
console.log('captured outgoing70')
