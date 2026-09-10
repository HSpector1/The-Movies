import {describe,it,expect} from 'vitest'
import {encodeCampaignStorage,decodeCampaignStorage} from '../bridge/runtime/campaign-storage-codec.ts'
import type {CampaignLibrary} from '../bridge/runtime/campaign-library.ts'
const checkpoint='{"current":"Unicode café 🎬","saved":"separate exact bytes","journal":[]}\n'
const fixture=():CampaignLibrary=>({format:'project-studio-campaign-library',libraryVersion:1,catalogueRevision:0,activeCampaignId:null,
 workingCheckpointJson:checkpoint,records:[{id:'synthetic-codec-record',label:'Exact original',revision:0,checkpointJson:checkpoint.replace('current','other')}],receipts:[],legacyCheckpointJson:' {"prior":"verbatim whitespace"}\n'})
describe('R05 lossless bounded campaign storage representation',()=>{
 it('round-trips every opaque checkpoint and exact original bytes without changing its input',async()=>{
  const original=fixture(),before=JSON.stringify(original),encoded=await encodeCampaignStorage(original,100000)
  expect(JSON.parse(encoded).libraryVersion).toBe(2)
  expect(decodeCampaignStorage(JSON.parse(encoded),10000,32)).toEqual(original)
  expect(JSON.stringify(original)).toBe(before)
  expect(await encodeCampaignStorage(original,100000)).toBe(encoded)
  expect(await encodeCampaignStorage(fixture(),100000)).toBe(encoded)
 })
 it('refuses unknown codecs, extra keys, checksum/size corruption and invalid base64 before exposing a checkpoint',async()=>{
  const encoded=await encodeCampaignStorage(fixture(),100000)
  for(const mutate of [
   (v:any)=>v.workingCheckpointJson.codec='future/v2',
   (v:any)=>v.workingCheckpointJson.unknown=true,
   (v:any)=>v.workingCheckpointJson.sha256='0'.repeat(64),
   (v:any)=>v.workingCheckpointJson.decodedBytes--,
   (v:any)=>v.workingCheckpointJson.data+='!',
  ]){const value=JSON.parse(encoded);mutate(value);expect(()=>decodeCampaignStorage(value,10000,32)).toThrow()}
 })
 it('enforces independent encoded, decoded-per-checkpoint and aggregate expansion bounds',async()=>{
  await expect(encodeCampaignStorage(fixture(),8)).rejects.toThrow(/storage bound/)
  const value=JSON.parse(await encodeCampaignStorage(fixture(),100000))
  expect(()=>decodeCampaignStorage(value,8,32)).toThrow(/oversized/)
  expect(()=>decodeCampaignStorage(value,10000,0)).toThrow(/record list/)
  value.workingCheckpointJson.decodedBytes=128*1024*1024
  value.records=Array.from({length:9},()=>({...value.records[0],checkpointJson:value.workingCheckpointJson}))
  expect(()=>decodeCampaignStorage(value,128*1024*1024,32)).toThrow(/decoded storage/)
 })
 it('enforces each caller bound across cache hits, failed requests and concurrent requests',async()=>{
  const original=fixture(),encoded=await encodeCampaignStorage(original,100000)
  await expect(encodeCampaignStorage(original,8)).rejects.toThrow(/storage bound/)
  expect(await encodeCampaignStorage(original,100000)).toBe(encoded)
  const restrictiveFirst=fixture()
  await expect(encodeCampaignStorage(restrictiveFirst,8)).rejects.toThrow(/storage bound/)
  expect(await encodeCampaignStorage(restrictiveFirst,100000)).toBe(encoded)
  const concurrent=fixture()
  const results=await Promise.allSettled([encodeCampaignStorage(concurrent,8),encodeCampaignStorage(concurrent,100000)])
  expect(results[0].status).toBe('rejected')
  expect(results[1]).toEqual({status:'fulfilled',value:encoded})
 })
})
