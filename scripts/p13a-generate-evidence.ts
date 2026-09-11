import { createHash } from 'node:crypto'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { BridgeSession } from '../bridge/session.ts'
import { p13aLaboratorySlice } from '../src/harness/p13a/fixtures.js'
import { SCHEMA_ID } from '../bridge/protocol.ts'

const directory=resolve('artifacts/p13a/early')
mkdirSync(directory,{recursive:true})
const state=p13aLaboratorySlice()
const checkpoint=new BridgeSession(state,'p13a-generated-early-laboratory-01').exportRuntimeCheckpointEncoded().encoded
const path=resolve(directory,'generated-laboratory.checkpoint.json')
writeFileSync(path,checkpoint,{flag:'wx'})
const manifest={kind:'p13a-generated-evidence/v1',source:'live engine generated fixture; no user campaign input',
  seed:state.seed,week:state.market.tick,laboratoryFacilityId:state.operations.facilities.find(f=>f.capability==='laboratory')!.id,
  checkpoint:path,sha256:createHash('sha256').update(checkpoint).digest('hex'),bytes:Buffer.byteLength(checkpoint),schemaId:SCHEMA_ID}
writeFileSync(resolve(directory,'manifest.json'),JSON.stringify(manifest,null,2)+'\n',{flag:'wx'})
console.log(JSON.stringify(manifest,null,2))
