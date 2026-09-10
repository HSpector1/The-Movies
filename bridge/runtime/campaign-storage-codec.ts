import {createHash} from 'node:crypto'
import {gzip,gunzipSync} from 'node:zlib'
import {TextDecoder} from 'node:util'
import {canonicalJson} from '../schema/canonical.ts'
import type {CampaignLibrary,CampaignRecord} from './campaign-library.ts'

const MAX_DECODED_LIBRARY_BYTES=1024*1024*1024
const sha=(text:string|Buffer)=>createHash('sha256').update(text).digest('hex')
type PackedCheckpoint={codec:'gzip-base64/v1';decodedBytes:number;sha256:string;data:string}
const packedRecords=new WeakMap<CampaignRecord,Promise<PackedCheckpoint>>()
const encodedLibraries=new WeakMap<CampaignLibrary,Promise<string>>()
async function pack(text:string):Promise<PackedCheckpoint>{
 const bytes=Buffer.from(text,'utf8')
 const compressed=await new Promise<Buffer>((resolve,reject)=>gzip(bytes,{level:1},(error,result)=>error?reject(error):resolve(result)))
 return {codec:'gzip-base64/v1',decodedBytes:bytes.length,sha256:sha(bytes),data:compressed.toString('base64')}
}
function recordPack(record:CampaignRecord){let pending=packedRecords.get(record);if(!pending){pending=pack(record.checkpointJson);packedRecords.set(record,pending)}return pending}
/** Storage format 2 changes representation only. Decoding returns exact outer1
 * checkpoint text, including its original newline and both independent slots. */
export async function encodeCampaignStorage(library:CampaignLibrary,maxEncodedBytes:number):Promise<string>{
 let pending=encodedLibraries.get(library)
 if(!pending){pending=(async()=>{
  const total=[library.workingCheckpointJson,...library.records.map(r=>r.checkpointJson),library.legacyCheckpointJson??''].reduce((n,s)=>n+Buffer.byteLength(s,'utf8'),0)
  if(total>MAX_DECODED_LIBRARY_BYTES)throw new Error('Campaign library exceeds its bounded decoded storage allowance')
  const records=[]
  for(const record of library.records)records.push({...record,checkpointJson:await recordPack(record)})
  const stored={...library,libraryVersion:2,records,workingCheckpointJson:await pack(library.workingCheckpointJson),legacyCheckpointJson:library.legacyCheckpointJson===null?null:await pack(library.legacyCheckpointJson)}
  const json=canonicalJson(stored)
  return json
 })()
 encodedLibraries.set(library,pending)}
 // Cache representation only. Each caller retains its own capacity boundary,
 // including concurrent calls and retries after a stricter allowance failed.
 const json=await pending
 if(Buffer.byteLength(json,'utf8')>maxEncodedBytes)throw new Error('Campaign library storage bound reached; preserve existing records and export/archive deliberately.')
 return json
}
function packed(value:unknown,maxDecodedBytes:number):asserts value is PackedCheckpoint{
 if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('Malformed compressed campaign checkpoint')
 const v=value as Record<string,unknown>,keys=['codec','decodedBytes','sha256','data']
 if(Object.keys(v).length!==keys.length||keys.some(k=>!Object.hasOwn(v,k))||v.codec!=='gzip-base64/v1'||!Number.isSafeInteger(v.decodedBytes)||Number(v.decodedBytes)<1||Number(v.decodedBytes)>maxDecodedBytes||typeof v.sha256!=='string'||!/^[0-9a-f]{64}$/.test(v.sha256)||typeof v.data!=='string'||v.data.length>Math.ceil(maxDecodedBytes/3)*4+4096)throw new Error('Malformed, unknown or oversized compressed campaign checkpoint')
}
function unpack(value:PackedCheckpoint):string{
 const bytes=Buffer.from(value.data,'base64')
 if(bytes.toString('base64')!==value.data)throw new Error('Campaign checkpoint base64 is not exact')
 const decoded=gunzipSync(bytes,{maxOutputLength:value.decodedBytes})
 if(decoded.length!==value.decodedBytes||sha(decoded)!==value.sha256)throw new Error('Campaign checkpoint decoded size or checksum mismatch')
 return new TextDecoder('utf-8',{fatal:true}).decode(decoded)
}
export function decodeCampaignStorage(value:unknown,maxDecodedCheckpointBytes:number,maxRecords:number):unknown{
 if(!value||typeof value!=='object'||Array.isArray(value))return value
 const source=value as Record<string,unknown>
 if(source.libraryVersion!==2)return value
 if(!Array.isArray(source.records)||source.records.length>maxRecords)throw new Error('Malformed or unbounded campaign record list')
 const cells=[source.workingCheckpointJson,...source.records.map(r=>r?.checkpointJson),...(source.legacyCheckpointJson===null?[]:[source.legacyCheckpointJson])]
 let total=0
 for(const cell of cells){packed(cell,maxDecodedCheckpointBytes);total+=cell.decodedBytes}
 if(total>MAX_DECODED_LIBRARY_BYTES)throw new Error('Campaign library exceeds its bounded decoded storage allowance')
 return {...source,libraryVersion:1,workingCheckpointJson:unpack(source.workingCheckpointJson as PackedCheckpoint),
  records:source.records.map(r=>({...r,checkpointJson:unpack(r.checkpointJson)})),
  legacyCheckpointJson:source.legacyCheckpointJson===null?null:unpack(source.legacyCheckpointJson as PackedCheckpoint)}
}
