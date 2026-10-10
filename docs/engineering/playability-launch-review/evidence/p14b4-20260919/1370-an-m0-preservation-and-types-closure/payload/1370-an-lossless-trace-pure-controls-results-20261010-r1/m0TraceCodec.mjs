import {deflateRawSync,inflateRawSync,constants} from 'node:zlib'
import assert from 'node:assert/strict'
const MAX_ENTRIES=16384,MAX_ROW_BYTES=65536,MAX_BYTES=2097152
const OPTIONS=Object.freeze({level:1,windowBits:15,memLevel:8,strategy:constants.Z_DEFAULT_STRATEGY,maxOutputLength:131072})
const INFLATE=Object.freeze({windowBits:15,maxOutputLength:65536})
const encoder=new TextEncoder(),decoder=new TextDecoder('utf-8',{fatal:true})
export class TraceOperationalError extends Error{
 constructor(code,message){super(message);this.name='TraceOperationalError';this.code=code}
}
const fail=(code,message)=>{throw new TraceOperationalError(code,message)}
const own=bytes=>{const out=new Uint8Array(bytes.length);out.set(bytes);return out}
const equal=(a,b)=>a.length===b.length&&a.every((n,i)=>n===b[i])
function header(entries,calls){
 const bytes=new Uint8Array(16),v=new DataView(bytes.buffer)
 bytes.set([77,48,84,82,1,0,0,0]);v.setUint32(8,entries,true);v.setUint32(12,calls,true);return bytes
}
function shape(row,tag){
 if(row===null||typeof row!=='object'||Array.isArray(row))fail('DECODE_INVALID','trace row object')
 const keys=Object.keys(row),wanted=tag===1?['sequence','name','detail']:['inputs','canonicalInputs','result','context']
 if(keys.length!==wanted.length||wanted.some(k=>!Object.hasOwn(row,k)))fail('DECODE_INVALID','trace row fields')
 if(tag===1&&(!Number.isSafeInteger(row.sequence)||row.sequence<0||typeof row.name!=='string'))fail('DECODE_INVALID','call row identity')
 if(tag===2&&(!Array.isArray(row.inputs)||typeof row.canonicalInputs!=='string'))fail('DECODE_INVALID','evaluation tuple')
}
function makeView(h,frames,codec,state,overflow,firstOverflow){
 const hv=new DataView(h.buffer,h.byteOffset,h.byteLength)
 const entryCount=hv.getUint32(8,true),callCount=hv.getUint32(12,true)
 const bytes=16+frames.reduce((n,f)=>n+f.byteLength,0)
 function requireUsable(){
  if(state.failed)fail('TRACE_OPERATIONAL','trace operational failure is sticky')
  if(overflow)fail('TRACE_OVERFLOW','trace resource overflow is sticky')
 }
 function decode(frame,callOrdinal=null){
  requireUsable()
  try{
   const v=new DataView(frame.buffer,frame.byteOffset,frame.byteLength),n=v.getUint32(1,true)
   const compressed=frame.subarray(9)
   const raw=codec.inflateRawSync(compressed,INFLATE)
   if(raw.length!==n||raw[n-1]!==10)fail('FRAME_INVALID','expanded length/newline')
   const canonical=codec.deflateRawSync(raw,OPTIONS)
   if(!equal(canonical,compressed))fail('FRAME_INVALID','noncanonical compressed frame')
   let text,row
   try{text=decoder.decode(raw);row=JSON.parse(text.slice(0,-1))}catch{fail('DECODE_INVALID','invalid UTF8/JSON')}
   shape(row,frame[0])
   if(callOrdinal!==null&&row.sequence!==callOrdinal)fail('DECODE_INVALID','call sequence is contiguous')
   return row
  }catch(error){
   state.failed=true
   if(error instanceof TraceOperationalError)throw error
   fail('CODEC_OPERATIONAL','codec decode failed')
  }
 }
 function *rows(tag){requireUsable();let i=0;for(const f of frames)if(f[0]===tag)yield decode(f,tag===1?i++:null)}
 function at(tag,index){
  requireUsable();if(!Number.isSafeInteger(index)||index<0){state.failed=true;fail('FRAME_INVALID','invalid row ordinal')}
  let i=0;for(const f of frames)if(f[0]===tag&&i++===index)return decode(f,tag===1?index:null)
  state.failed=true;fail('FRAME_INVALID','row ordinal absent')
 }
 return Object.freeze({callCount,evaluationCount:entryCount-callCount,entryCount,encodedBytes:bytes,
  overflow,firstOverflow:firstOverflow===null?null:Object.freeze({...firstOverflow}),
  calls:()=>rows(1),evaluations:()=>rows(2),callAt:i=>at(1,i),evaluationAt:i=>at(2,i)})
}
const DEFAULT_CODEC=Object.freeze({deflateRawSync,inflateRawSync})
export function createTraceStore({codec=DEFAULT_CODEC}={}){
 let frames=[],calls=0,evaluations=0,bytes=16,overflow=false,firstOverflow=null,closed=false,view=null
 const state={failed:false}
 function append(row,tag){
  if(closed){state.failed=true;fail('STORE_CLOSED','append after snapshot')}
  if(state.failed)fail('TRACE_OPERATIONAL','trace operational failure is sticky')
  if(overflow)return false
  try{
   const raw=encoder.encode(JSON.stringify(row)+'\n'),entries=calls+evaluations
   const diagnostic={entryCap:entries>=MAX_ENTRIES,rowByteCap:raw.length>MAX_ROW_BYTES,totalByteCap:false,
    entries,calls,evaluations,retainedBytes:bytes,nextRowBytes:raw.length,nextEncodedFrameBytes:null}
   if(diagnostic.entryCap||diagnostic.rowByteCap){overflow=true;firstOverflow=diagnostic;return false}
   // Validation uses the single captured serialized snapshot, never the caller again.
   const captured=JSON.parse(decoder.decode(raw).slice(0,-1));shape(captured,tag)
   if(tag===1&&captured.sequence!==calls)fail('DECODE_INVALID','call sequence is contiguous')
   const compressed=codec.deflateRawSync(raw,OPTIONS)
   if(compressed.length>131072)fail('CODEC_OPERATIONAL','codec output limit not honored')
   const n=9+compressed.length;diagnostic.nextEncodedFrameBytes=n
   if(bytes+n>MAX_BYTES){diagnostic.totalByteCap=true;overflow=true;firstOverflow=diagnostic;return false}
   const frame=new Uint8Array(n),v=new DataView(frame.buffer)
   frame[0]=tag;v.setUint32(1,raw.length,true);v.setUint32(5,compressed.length,true);frame.set(compressed,9)
   frames.push(frame);bytes+=n;if(tag===1)calls++;else evaluations++
   return true
  }catch(error){
   state.failed=true
   if(error instanceof TraceOperationalError)throw error
   fail('CODEC_OPERATIONAL','codec capture failed')
  }
 }
 return Object.freeze({appendCall:row=>append(row,1),appendEvaluation:row=>append(row,2),
  snapshot(){
   if(state.failed)fail('TRACE_OPERATIONAL','trace operational failure is sticky')
   if(view!==null)return view
   closed=true
   try{view=makeView(header(calls+evaluations,calls),frames,codec,state,overflow,firstOverflow);return view}
   catch(error){state.failed=true;throw error}
  }})
}
export function importEncodedSnapshot(inputHeader,inputFrames,{codec=DEFAULT_CODEC}={}){
 // Finite public frame-control entry. Runtime snapshots transfer existing backing.
 const state={failed:false}
 if(!(inputHeader instanceof Uint8Array)||inputHeader.length!==16||!Array.isArray(inputFrames))fail('FRAME_INVALID','header/frame vector shape')
 const h=own(inputHeader),hv=new DataView(h.buffer)
 if(!equal(h.subarray(0,8),new Uint8Array([77,48,84,82,1,0,0,0])))fail('FRAME_INVALID','header version/reserved')
 if(inputFrames.length>MAX_ENTRIES||hv.getUint32(8,true)!==inputFrames.length)fail('FRAME_INVALID','header entry count')
 let bytes=16,calls=0;const frames=[]
 for(const source of inputFrames){
  if(!(source instanceof Uint8Array)||source.length<9||source.length>MAX_BYTES)fail('FRAME_INVALID','frame byte shape')
  bytes+=source.length;if(bytes>MAX_BYTES)fail('FRAME_INVALID','encoded storage bound')
  const f=own(source),v=new DataView(f.buffer),expanded=v.getUint32(1,true)
  if(![1,2].includes(f[0])||expanded<1||expanded>MAX_ROW_BYTES||v.getUint32(5,true)!==f.length-9)fail('FRAME_INVALID','frame tag/length')
  if(f[0]===1)calls++;frames.push(f)
 }
 if(hv.getUint32(12,true)!==calls)fail('FRAME_INVALID','header call count')
 return makeView(h,frames,codec,state,false,null)
}

function compare(left,right,label,project=x=>x){
  const a=left[Symbol.iterator](),b=right[Symbol.iterator]()
  for(;;){const x=a.next(),y=b.next();assert.equal(x.done,y.done,label);if(x.done)return
   assert.equal(JSON.stringify(project(x.value)),JSON.stringify(project(y.value)),label)}
}
export function assertCallTraceEqual(off,on,label='helper and RNG call order/counts/stream keys'){
 compare(off.calls(),on.calls(),label)
}
export function assertTracePairEqual(off,on){
 assertCallTraceEqual(off,on)
 compare(off.evaluations(),on.evaluations(),'actual receipt bytes/inputs unaffected',({inputs,canonicalInputs,result})=>({inputs,canonicalInputs,result}))
}
