// Pure control library. A separately reviewed recorded worker authenticates all
// module/input roles and imports this source. No gameplay, processes, or files.
import assert from 'node:assert/strict'
import {deflateRawSync,inflateRawSync,constants} from 'node:zlib'

const OPTIONS={level:1,windowBits:15,memLevel:8,strategy:constants.Z_DEFAULT_STRATEGY,maxOutputLength:131072}
const CALL_LABEL='helper and RNG call order/counts/stream keys'
const EVALUATION_LABEL='actual receipt bytes/inputs unaffected'
const bytes=row=>new TextEncoder().encode(JSON.stringify(row)+'\n')
const call=(sequence,detail=null,name='rng')=>({sequence,name,detail})
const evaluation=(context=null)=>({inputs:['OPPORTUNITY',{key:'x',value:2}],canonicalInputs:'[ "OPPORTUNITY", {"value":2,"key":"x"} ]',result:{inputsDigest:'digest',classification:'OK'},context})
function header(total,calls){
 const h=new Uint8Array(16),v=new DataView(h.buffer)
 h.set([77,48,84,82,1,0,0,0]);v.setUint32(8,total,true);v.setUint32(12,calls,true);return h
}
function frame(raw,tag=1,options=OPTIONS){
 const compressed=deflateRawSync(raw,options),f=new Uint8Array(9+compressed.length),v=new DataView(f.buffer)
 f[0]=tag;v.setUint32(1,raw.length,true);v.setUint32(5,compressed.length,true);f.set(compressed,9);return f
}
function sizedCall(sequence,length){
 const row=call(sequence,'')
 const missing=length-bytes(row).length;assert.ok(missing>=0)
 row.detail='x'.repeat(missing);assert.equal(bytes(row).length,length);return row
}
function noisy(length,seed){
 let x=seed>>>0,s=''
 // Printable unescaped ASCII makes exact row sizing independent of escaping.
 for(let i=0;i<length;i++){x^=x<<13;x^=x>>>17;x^=x<<5;s+=String.fromCharCode(35+((x>>>0)%55))}
 return s
}

export function runLosslessTraceControls({codecApi,probeApi,runOrderingSourceControls,orderingPacket}){
 const {createTraceStore,importEncodedSnapshot,TraceOperationalError,assertTracePairEqual}=codecApi
 assert.equal(typeof createTraceStore,'function');assert.equal(typeof assertTracePairEqual,'function')
 const results=[]
 const test=(id,expected,predicate,run)=>{
  run();results.push({id,expected,verdict:expected==='GREEN'?'ACCEPT_POSITIVE':'ACCEPT_SPECIFIC_REFUSAL',predicate})
 }
 const refusal=(fn,code)=>assert.throws(fn,e=>e instanceof TraceOperationalError&&e.code===code,'exact TraceOperationalError '+code)
 const assertion=(fn,label)=>assert.throws(fn,e=>e instanceof assert.AssertionError&&e.message.includes(label),'exact AssertionError '+label)
 function trace(calls=[],evaluations=[]){
  const s=createTraceStore();for(const row of calls)assert.equal(s.appendCall(row),true)
  for(const row of evaluations)assert.equal(s.appendEvaluation(row),true);return s.snapshot()
 }
 const importOne=(raw,tag=1,options=OPTIONS)=>importEncodedSnapshot(header(1,tag===1?1:0),[frame(raw,tag,options)])
 test('exact-literals-order-multiplicity-GREEN','GREEN','exact expanded JSON, Unicode/NUL/newline, canonical string and duplicates',()=>{
  const rows=[call(0,{seed:7,purpose:'a\u0000\n',key:'é😀'}),call(1,{seed:7,purpose:'a\u0000\n',key:'é😀'})],e=evaluation({issuer:'i',occurrence:2})
  const t=trace(rows,[e]);assert.equal(t.callCount,2);assert.equal(t.evaluationCount,1)
  assert.deepEqual([...t.calls()],rows);assert.deepEqual([...t.evaluations()],[e]);assert.deepEqual(t.callAt(1),rows[1]);assert.deepEqual(t.evaluationAt(0),e)
  const expected=16+rows.reduce((n,r)=>n+frame(bytes(r)).length,0)+frame(bytes(e),2).length
  assert.equal(t.encodedBytes,expected);assert.equal(t.entryCount,3);assert.equal(t.overflow,false)
 })
 test('independent-snapshots-caller-and-decoded-mutation-GREEN','GREEN','old snapshot survives fresh store and external mutations',()=>{
  const row=call(0,{key:'before'}),s=createTraceStore();assert.equal(s.appendCall(row),true);row.detail.key='after'
  const off=s.snapshot();const got=off.callAt(0);got.detail.key='decoded mutation'
  const on=trace([call(0,{key:'before'})]);assertTracePairEqual(off,on)
  assert.deepEqual(off.callAt(0),call(0,{key:'before'}));assert.equal(s.snapshot(),off);assert.ok(Object.isFrozen(off))
 })
 test('closed-api-error-sticky-RED','RED','STORE_CLOSED invalidates store and saved snapshot even if swallowed',()=>{
  const s=createTraceStore();assert.equal(s.appendCall(call(0)),true);const t=s.snapshot()
  refusal(()=>s.appendCall(call(1)),'STORE_CLOSED')
  refusal(()=>s.snapshot(),'TRACE_OPERATIONAL');refusal(()=>t.callAt(0),'TRACE_OPERATIONAL')
  refusal(()=>[...t.calls()],'TRACE_OPERATIONAL');refusal(()=>[...t.evaluations()],'TRACE_OPERATIONAL')
 })
 test('actual-probe-begin-end-reset-GREEN','GREEN','public probe snapshots coexist across capture modes and overflow reset',()=>{
  const e=evaluation({issuer:'i'});probeApi.begin(false);probeApi.call('rng',{seed:7});probeApi.evaluation(e.inputs,e.canonicalInputs,e.result,e.context)
  const off=probeApi.end();assert.equal(probeApi.captureEnabled(),true)
  probeApi.call('inactive ignored');probeApi.begin(true);probeApi.call('rng',{seed:7});probeApi.evaluation(e.inputs,e.canonicalInputs,e.result,e.context)
  const on=probeApi.end();assertTracePairEqual(off,on);assert.equal(off.callCount,1);assert.equal(on.callCount,1)
  probeApi.begin(true);probeApi.call('oversize','x'.repeat(65537));const failed=probeApi.end();assert.equal(failed.overflow,true)
  probeApi.begin(false);probeApi.call('fresh');const reset=probeApi.end();assert.equal(reset.overflow,false);assert.equal(reset.callAt(0).sequence,0)
  assert.deepEqual(off.callAt(0),call(0,{seed:7}));assertTracePairEqual(off,on)
  probeApi.begin(true,'ordinary-refusal');assert.equal(probeApi.consumeFault('draftPrice'),null)
  assert.equal(probeApi.consumeFault('submitProposal'),'ordinary-refusal');assert.equal(probeApi.consumeFault('submitProposal'),null)
  assert.deepEqual(probeApi.end().faultReached,{kind:'ordinary-refusal',phase:'submitProposal'})
 })
 test('import-owns-header-frame-inputs-GREEN','GREEN','defensive ownership excludes input mutation',()=>{
  const row=call(0,{key:'owned'}),h=header(1,1),f=frame(bytes(row)),t=importEncodedSnapshot(h,[f]);h.fill(0);f.fill(0)
  assert.deepEqual(t.callAt(0),row)
 })
 test('expanded65536-GREEN','GREEN','exact admitted expanded-row boundary includes newline',()=>{
  const row=sizedCall(0,65536),t=trace([row]);assert.deepEqual(t.callAt(0),row);assert.equal(t.overflow,false)
 })
 test('new-budget-over-old-expanded2MiB-GREEN','GREEN','all exact rows retained beyond old sum, encoded budget charged',()=>{
  const s=createTraceStore();let expanded=0,encoded=16
  for(let i=0;i<64;i++){const r=sizedCall(i,40000);expanded+=bytes(r).length;encoded+=frame(bytes(r)).length;assert.equal(s.appendCall(r),true)}
  const t=s.snapshot();assert.ok(expanded>2097152);assert.ok(encoded<=2097152);assert.equal(t.encodedBytes,encoded);assert.equal(t.callCount,64)
  let i=0;for(const r of t.calls()){assert.deepEqual(r,sizedCall(i++,40000))}assert.equal(i,64)
 })
 test('logical16384-then16385-resource-RED','RED','exact logical cap then sticky overflow without partial row',()=>{
  const s=createTraceStore();let encoded=16
  for(let i=0;i<16384;i++){const r=call(i);encoded+=frame(bytes(r)).length;assert.equal(s.appendCall(r),true)}
  assert.equal(s.appendCall(call(16384)),false);assert.equal(s.appendCall(call(16384)),false)
  const t=s.snapshot();assert.equal(t.entryCount,16384);assert.equal(t.encodedBytes,encoded)
  assert.equal(t.firstOverflow.entryCap,true);assert.equal(t.firstOverflow.rowByteCap,false);assert.equal(t.firstOverflow.totalByteCap,false)
  refusal(()=>t.callAt(0),'TRACE_OVERFLOW');refusal(()=>[...t.calls()],'TRACE_OVERFLOW')
 })
 test('expanded65537-resource-RED','RED','oversized row refuses even when tiny compressed',()=>{
  const row=sizedCall(0,65537);assert.ok(deflateRawSync(bytes(row),OPTIONS).length<65536)
  const s=createTraceStore();assert.equal(s.appendCall(row),false);const t=s.snapshot()
  assert.equal(t.entryCount,0);assert.equal(t.encodedBytes,16);assert.equal(t.firstOverflow.rowByteCap,true);assert.equal(t.firstOverflow.entryCap,false)
  refusal(()=>t.callAt(0),'TRACE_OVERFLOW')
 })
 test('encoded-budget-headers-atomicity-resource-RED','RED','16+9+actual compression drives aggregate refusal',()=>{
  const s=createTraceStore();let total=16,rows=0,refused=0
  for(let i=0;i<128;i++){
   const row=call(i,noisy(60000,i+1)),raw=bytes(row),n=frame(raw).length
   assert.ok(raw.length<=65536)
   if(total+n>2097152){assert.equal(s.appendCall(row),false);refused=n;break}
   assert.equal(s.appendCall(row),true);total+=n;rows++
  }
  assert.ok(refused>0);const t=s.snapshot();assert.equal(t.entryCount,rows);assert.equal(t.encodedBytes,total)
  assert.equal(t.firstOverflow.totalByteCap,true);assert.equal(t.firstOverflow.entryCap,false);assert.equal(t.firstOverflow.rowByteCap,false)
  assert.equal(t.firstOverflow.nextEncodedFrameBytes,refused);assert.ok(total+refused>2097152)
  refusal(()=>t.callAt(0),'TRACE_OVERFLOW');assert.equal(trace([call(0)]).overflow,false)
 })
 test('header-framing-variants-RED','RED','bad magic/version/reserved/counts rejected as FRAME_INVALID',()=>{
  for(const [offset,value] of [[0,0],[4,2],[5,1],[8,2],[12,0]]){
   const h=header(1,1);h[offset]=value;refusal(()=>importEncodedSnapshot(h,[frame(bytes(call(0)))]),'FRAME_INVALID')
  }
 })
 test('frame-tag-and-length-variants-RED','RED','tag and declared lengths reject precisely',()=>{
  for(const edit of ['tag','expanded','compressed','short']){
   let f=frame(bytes(call(0)));const v=new DataView(f.buffer)
   if(edit==='tag')f[0]=3;else if(edit==='expanded')v.setUint32(1,65537,true);else if(edit==='compressed')v.setUint32(5,f.length,true);else f=f.slice(0,8)
   refusal(()=>importEncodedSnapshot(header(1,1),[f]),'FRAME_INVALID')
  }
 })
 test('expanded-length-newline-RED','RED','decoded length and final newline reject as FRAME_INVALID',()=>{
  const f=frame(bytes(call(0)));new DataView(f.buffer).setUint32(1,bytes(call(0)).length+1,true)
  refusal(()=>importEncodedSnapshot(header(1,1),[f]).callAt(0),'FRAME_INVALID')
  refusal(()=>importOne(new TextEncoder().encode(JSON.stringify(call(0)))).callAt(0),'FRAME_INVALID')
 })
 test('utf8-json-rowshape-RED','RED','invalid UTF8, JSON and fixed fields reject as DECODE_INVALID',()=>{
  for(const raw of [new Uint8Array([255,10]),new TextEncoder().encode('{bad}\n'),bytes({sequence:0,name:'rng',detail:null,extra:1})]){
   const t=importOne(raw);refusal(()=>t.callAt(0),'DECODE_INVALID');refusal(()=>t.callAt(0),'TRACE_OPERATIONAL')
  }
 })
 test('trailing-concatenated-noncanonical-RED','RED','exact recompressed bytes reject alternate compressed representation',()=>{
  const raw=bytes(call(0,'x'.repeat(1000))),normal=frame(raw)
  for(const mode of ['trailing','concatenated','alternate']){
   let f
   if(mode==='alternate'){f=frame(raw,1,{...OPTIONS,level:0});assert.notDeepEqual(f,normal)}
   else{const extra=mode==='trailing'?new Uint8Array([0]):normal.slice(9);f=new Uint8Array(normal.length+extra.length);f.set(normal);f.set(extra,normal.length);new DataView(f.buffer).setUint32(5,f.length-9,true)}
   refusal(()=>importEncodedSnapshot(header(1,1),[f]).callAt(0),'FRAME_INVALID')
  }
 })
 test('corrupt-codec-stream-RED','RED','invalid deflate is CODEC_OPERATIONAL then sticky',()=>{
  const f=new Uint8Array(10),v=new DataView(f.buffer);f[0]=1;v.setUint32(1,2,true);v.setUint32(5,1,true);f[9]=255
  const t=importEncodedSnapshot(header(1,1),[f]);refusal(()=>t.callAt(0),'CODEC_OPERATIONAL');refusal(()=>t.callAt(0),'TRACE_OPERATIONAL')
 })
 test('inflate-output-limit-RED','RED','real public codec refuses beyond65536 before oversized decode',()=>{
  const f=frame(bytes(sizedCall(0,65537)));new DataView(f.buffer).setUint32(1,65536,true)
  refusal(()=>importEncodedSnapshot(header(1,1),[f]).callAt(0),'CODEC_OPERATIONAL')
 })
 test('codec-options-and-swallowed-failure-RED','RED','actual configured bounds supplied, swallowed exception cannot pass snapshot',()=>{
  let captureOptions,decodeOptions
  const s=createTraceStore({codec:{deflateRawSync(raw,options){captureOptions=options;throw new Error('injected codec failure')},inflateRawSync}})
  let caught=false;try{s.appendCall(call(0))}catch(e){assert.ok(e instanceof TraceOperationalError);assert.equal(e.code,'CODEC_OPERATIONAL');caught=true}
  assert.equal(caught,true);assert.deepEqual(captureOptions,OPTIONS);refusal(()=>s.snapshot(),'TRACE_OPERATIONAL');refusal(()=>s.appendCall(call(0)),'TRACE_OPERATIONAL')
  const t=importEncodedSnapshot(header(1,1),[frame(bytes(call(0)))],{codec:{deflateRawSync,inflateRawSync(raw,options){decodeOptions=options;throw new Error('injected inflate failure')}}})
  refusal(()=>t.callAt(0),'CODEC_OPERATIONAL');refusal(()=>t.callAt(0),'TRACE_OPERATIONAL')
  assert.deepEqual(decodeOptions,{windowBits:15,maxOutputLength:65536})
 })
 test('public-compression-output-limit-RED','RED','actual public convenience API enforces supplied output bound',()=>{
  assert.throws(()=>deflateRawSync(bytes(call(0,'output limit')),{...OPTIONS,maxOutputLength:1}),e=>e instanceof Error&&e.code==='ERR_BUFFER_TOO_LARGE','exact public codec ERR_BUFFER_TOO_LARGE')
 })
 test('unhonored-codec-output-limit-RED','RED','oversized injected codec result remains operational STOP',()=>{
  let seen
  const s=createTraceStore({codec:{deflateRawSync(raw,options){seen=options;return new Uint8Array(131073)},inflateRawSync}})
  refusal(()=>s.appendCall(call(0)),'CODEC_OPERATIONAL');assert.deepEqual(seen,OPTIONS)
  refusal(()=>s.snapshot(),'TRACE_OPERATIONAL')
 })
 test('encoded-import-budget-RED','RED','all owned headers and backing bytes charged before decode',()=>{
  const f=new Uint8Array(2097152-16+1);f[0]=1;const v=new DataView(f.buffer);v.setUint32(1,1,true);v.setUint32(5,f.length-9,true)
  refusal(()=>importEncodedSnapshot(header(1,1),[f]),'FRAME_INVALID')
 })
 test('context-projection-scope-GREEN','GREEN','off/on context differs while original semantic tuple comparison passes',()=>{
  assertTracePairEqual(trace([call(0)],[evaluation(null)]),trace([call(0)],[evaluation({issuer:'i',occurrence:3})]))
 })
 for(const [id,mutate] of [
  ['rng-seed',r=>{r[0].detail.seed=8}],['rng-purpose',r=>{r[0].detail.purpose='other'}],['rng-key',r=>{r[0].detail.key='other'}],
  ['omitted-call',r=>{r.pop()}],['reordered-call',r=>{[r[0],r[1]]=[r[1],r[0]];r.forEach((c,i)=>c.sequence=i)}],['duplicate-call-count',r=>{r.push(call(2,{seed:7,purpose:'p',key:'k'}))}],
 ])test(id+'-RED','RED',CALL_LABEL,()=>{
  const rows=[call(0,{seed:7,purpose:'p',key:'k'}),call(1,{seed:9,purpose:'q',key:'l'})],changed=structuredClone(rows);mutate(changed)
  assertion(()=>assertTracePairEqual(trace(rows),trace(changed)),CALL_LABEL)
 })
 for(const [id,mutate] of [
  ['tuple',e=>{e.inputs[1].value=3}],['canonical-literal',e=>{e.canonicalInputs='different exact literal'}],['result',e=>{e.result.inputsDigest='different'}],
 ])test(id+'-RED','RED',EVALUATION_LABEL,()=>{
  const e=evaluation(),changed=structuredClone(e);mutate(changed)
  assertion(()=>assertTracePairEqual(trace([],[e]),trace([],[changed])),EVALUATION_LABEL)
 })
 assert.equal(orderingPacket.schema,'1370-m0-ordering-synthetic-source-inputs/v1');assert.equal(orderingPacket.cases.length,18)
 for(const c of orderingPacket.cases){
  const actual=runOrderingSourceControls({...orderingPacket,cases:[c]})
  assert.deepEqual(actual,[{id:c.id,expected:c.expected}])
  results.push({id:'ordering:'+c.id,expected:c.expected,verdict:c.expected==='GREEN'?'ACCEPT_POSITIVE':'ACCEPT_SPECIFIC_REFUSAL',predicate:c.assertion??'original positive source-case'})
 }
 const positiveCount=results.filter(r=>r.expected==='GREEN').length,specificNegativeCount=results.filter(r=>r.expected==='RED').length
 assert.equal(results.length,49);assert.equal(positiveCount,9);assert.equal(specificNegativeCount,40)
 return {schema:'1370-lossless-trace-independent-controls-result/v1',status:'PURE_LOSSLESS_CODEC_AND_AFFECTED_ORDERING_COMPLETED_UNADOPTED',results,positiveCount,specificNegativeCount,originalOrderingCases:18,originalParserCasesReplayed:0,game:false,originalM0ReadOrWritten:false,executionAuthorization:false}
}
