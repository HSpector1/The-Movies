// UNRUN equivalence/refusal controls; no captures, game, save modules or files written.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { pathToFileURL } from 'node:url'
const hash=b=>createHash('sha256').update(b).digest('hex')
const configRaw=readFileSync(new URL('./CONFIG.json',import.meta.url));assert.equal(hash(configRaw),process.argv[2]);const config=JSON.parse(configRaw)
assert.equal(process.version,'v20.20.2');assert.equal(process.execPath,config.nodePath)
for(const name of ['baseline','candidate','controls']){const r=config.roles[name];assert.equal(hash(readFileSync(r.path)),r.sha256)}
const baseline=await import(pathToFileURL(config.roles.baseline.path)),candidate=await import(pathToFileURL(config.roles.candidate.path))
let groups=0,pairs=0;const test=(name,f)=>{f();groups++;process.stdout.write(`PASS ${name}\n`)}
function equal(value,limit=baseline.MAX){const left=baseline.boundedJson(value,limit),right=candidate.boundedJson(value,limit);assert.deepEqual(right,left);pairs++;return right}
function refusal(factory,pattern,limit=baseline.MAX){for(const encoder of [baseline.boundedJson,candidate.boundedJson])assert.throws(()=>encoder(factory(),limit),pattern)}
test('exact primitives and finite number rendering',()=>{for(const v of [null,true,false,0,-0,1,-1,0.1,Number.MIN_VALUE,Number.MAX_VALUE,1e-7,1e-6,1e20,1e21,9007199254740991,'','quote"slash\\\n\r\t\b\f','é😀','\ud800','\udfff'])equal(v)})
test('captured key order, integer keys and escaping',()=>equal({'10':10,'2':2,z:1,a:undefined,'escape"\n':3,'é😀':{'é😀':4}}))
test('undefined object omission and sparse-array null',()=>{const a=Array(4);a[1]=undefined;a[2]=null;a[3]={missing:undefined};equal({a,missing:undefined})})
test('shared references are allowed while cycles refuse',()=>{const x={key:1};equal({a:x,b:x});refusal(()=>{const x={};x.self=x;return x},/STOP_CYCLE/);refusal(()=>{const x=[];x.push(x);return x},/STOP_CYCLE/)})
test('own toJSON refuses; inherited toJSON is ignored like baseline',()=>{for(const toJSON of [undefined,null,()=>1])refusal(()=>({toJSON}),/STOP_CUSTOM_JSON/);equal(Object.assign(Object.create({toJSON(){throw Error('must not run')}}),{a:1}));equal(new Date(0))})
test('unsupported atoms and nonfinite numbers refuse',()=>{for(const v of [1n,()=>1,Symbol('x')]){refusal(()=>v,/STOP_NON_JSON/);refusal(()=>[v],/STOP_NON_JSON/)}for(const v of [NaN,Infinity,-Infinity])refusal(()=>({v}),/STOP_NON_FINITE/);refusal(()=>undefined,/./)})
test('exact-fit and cap refusal for every small budget',()=>{const v={repeated:[{same:'é😀'},{same:'é😀'}],booleans:[true,false,null,-0]};const size=equal(v).length;for(let cap=0;cap<size;cap++)refusal(()=>v,/STOP_(JSON|STRING)_CAP/,cap);equal(v,size);equal(v,size+1)})
test('string raw precheck and escaped token budget',()=>{refusal(()=> 'é'.repeat(10),/STOP_STRING_CAP/,19);refusal(()=> '\n'.repeat(10),/STOP_JSON_CAP/,20);refusal(()=>({'key':'x'.repeat(baseline.MAX)}),/STOP_JSON_CAP/);refusal(()=> 'x'.repeat(baseline.MAX+1),/STOP_STRING_CAP/)})
test('property-key cache is per call and cannot mask object mutation',()=>{const v={shared:1,nested:{shared:2}};const first=equal(v);v.shared=9;const second=equal(v);assert.notDeepEqual(first,second);const key='\n'.repeat(10);refusal(()=>({[key]:0}),/STOP_JSON_CAP/,20);equal({[key]:0},40)})
test('getter visitation order remains identical',()=>{const make=log=>{const v={};Object.defineProperty(v,'value',{enumerable:true,get(){log.push('value');return 1}});Object.defineProperty(v,'missing',{enumerable:true,get(){log.push('missing');return undefined}});return [v,v]};const a=[],b=[];assert.deepEqual(baseline.boundedJson(make(a)),candidate.boundedJson(make(b)));assert.deepEqual(a,b)})
test('deterministic nested corpus',()=>{let n=0x1370109;for(let i=0;i<250;i++){n=(Math.imul(n,1664525)+1013904223)>>>0;equal({id:i,reused:{id:n,label:'value'+(n%13)},rows:[null,Boolean(n&1),n/17,-0,{label:'\n😀'+i}]})}})

// Additions below preserve all eleven original groups verbatim.
function freshParity(make){const a=[],b=[];assert.deepEqual(baseline.boundedJson(make(a)),candidate.boundedJson(make(b)));assert.deepEqual(a,b)}
test('stateful first-check and second-value reads',()=>{
  freshParity(log=>{let reads=0;const v={};Object.defineProperty(v,'x',{enumerable:true,get(){log.push(++reads);return reads===1?1:2}});Object.defineProperty(v,'omit',{enumerable:true,get(){log.push('omit');return undefined}});return [v,v]})
  for(const array of [false,true]){const make=log=>{let n=0;const v=array?[]:{};Object.defineProperty(v,array?'0':'x',{enumerable:true,get(){log.push(++n);return n===1?1:undefined}});return v};const a=[],b=[];assert.throws(()=>baseline.boundedJson(make(a)));assert.throws(()=>candidate.boundedJson(make(b)));assert.deepEqual(a,b)}
})
test('dynamic array shrink and growth preserve emitted length',()=>{
  freshParity(log=>{const v=[0,1,2];Object.defineProperty(v,'0',{get(){log.push('shrink');v.length=1;return 7}});return v})
  freshParity(log=>{const v=[0];let n=0;Object.defineProperty(v,'0',{get(){log.push(++n);if(n===1)v.push(8,9);return n}});return v})
})
test('null prototypes prevent inherited hooks including array pollution',()=>{
  const oldObject=Object.getOwnPropertyDescriptor(Object.prototype,'toJSON'),oldArray=Object.getOwnPropertyDescriptor(Array.prototype,'toJSON');let calls=0
  try{Object.defineProperty(Object.prototype,'toJSON',{configurable:true,value(){calls++;throw Error('object hook')}});Object.defineProperty(Array.prototype,'toJSON',{configurable:true,value(){calls++;throw Error('array hook')}});equal({rows:[{x:1},null]});assert.equal(calls,0)}
  finally{if(oldObject)Object.defineProperty(Object.prototype,'toJSON',oldObject);else delete Object.prototype.toJSON;if(oldArray)Object.defineProperty(Array.prototype,'toJSON',oldArray);else delete Array.prototype.toJSON}
  refusal(()=>Object.defineProperty([],'toJSON',{value:undefined}),/STOP_CUSTOM_JSON/)
  refusal(()=>Object.defineProperty({},'toJSON',{value:undefined}),/STOP_CUSTOM_JSON/)
})
test('safe proto keys and integer ordering',()=>{const v=Object.create(null);v.z=1;v['10']=10;v.__proto__={safe:true};v['2']=2;v.constructor=3;equal(v)})
test('token caps and refusals never serialize source containers',()=>{
  const native=JSON.stringify;let containers=0
  JSON.stringify=function(v,...args){if(v!==null&&typeof v==='object'){containers++;assert.equal(Object.getPrototypeOf(v),null)}return native(v,...args)}
  try{
    for(const [make,pattern,cap] of [[()=>({x:'\n'.repeat(8)}),/STOP_JSON_CAP/,16],[()=>({a:'123',b:'456'}),/STOP_JSON_CAP/,18],[()=>({x:Infinity}),/STOP_NON_FINITE/,baseline.MAX],[()=>({x:1n}),/STOP_NON_JSON/,baseline.MAX],[()=>({toJSON:undefined}),/STOP_CUSTOM_JSON/,baseline.MAX],[()=> 'é'.repeat(10),/STOP_STRING_CAP/,19]]){containers=0;assert.throws(()=>candidate.boundedJson(make(),cap),pattern);assert.equal(containers,0)}
    containers=0;assert.equal(candidate.boundedJson({x:[1,null]}).toString(),'{"x":[1,null]}');assert.equal(containers,0)
  }finally{JSON.stringify=native}
})


// R2 additions preserve all sixteen R1 groups verbatim.
function orderedProxy(data,order,log=[]){return new Proxy(data,{ownKeys(){log.push('keys');return typeof order==='function'?order():order},getOwnPropertyDescriptor(t,k){log.push('desc:'+String(k));const descriptor=Reflect.getOwnPropertyDescriptor(t,k);return descriptor===undefined?undefined:Object.setPrototypeOf(descriptor,null)},get(t,k,r){log.push('get:'+String(k));return Reflect.get(t,k,r)}})}
test('proxy reverse and mixed integer order exact bytes and caps',()=>{
  for(const order of [['2','1'],['z','2','__proto__','1','a']]){
    const make=()=>{const v=Object.create(null);for(const k of order)v[k]=k;return orderedProxy(v,order)}
    const expected=baseline.boundedJson(make());assert.deepEqual(candidate.boundedJson(make()),expected);assert.deepEqual(candidate.boundedJson(make(),expected.length),expected);refusal(make,/STOP_JSON_CAP/,expected.length-1)
  }
})
test('nested and shared proxy order is fresh on each occurrence',()=>freshParity(log=>{
  let n=0;const v=orderedProxy({'1':1,'2':2},()=>++n%2?['2','1']:['1','2'],log)
  const nested=orderedProxy({a:[v,v],'1':v,'2':{x:v}},['a','2','1'],log)
  return {nested,again:v}
}))
test('proxy omitted names preserve all original hook traces',()=>{
  for(const all of [false,true])freshParity(log=>orderedProxy({'1':all?undefined:1,'2':undefined,z:undefined,a:all?undefined:2,end:undefined},['z','2','a','1','end'],log))
  freshParity(log=>orderedProxy({},[],log))
})
test('proxy stateful values retain two reads and undefined refusal',()=>{
  const make=(log,refuse)=>{let n=0;const t={'1':1,omit:undefined};Object.defineProperty(t,'2',{enumerable:true,configurable:true,get(){log.push('getter:'+ ++n);return n===1?7:refuse?undefined:8}});return orderedProxy(t,['omit','2','1'],log)}
  freshParity(log=>make(log,false));const a=[],b=[];assert.throws(()=>baseline.boundedJson(make(a,true)));assert.throws(()=>candidate.boundedJson(make(b,true)));assert.deepEqual(a,b)
})
test('null handler ignores inherited get and descriptor traps',()=>{
  const names=['get','getOwnPropertyDescriptor'],old=names.map(k=>Object.getOwnPropertyDescriptor(Object.prototype,k));let calls=0
  const source=orderedProxy({'1':1,'2':2},['2','1'])
  try{for(const k of names){const d=Object.create(null);d.configurable=true;d.value=function(){calls++;throw Error('inherited handler trap')};Object.defineProperty(Object.prototype,k,d)};assert.deepEqual(candidate.boundedJson(source),baseline.boundedJson(source));assert.equal(calls,0)}
  finally{for(const k of names)delete Object.prototype[k];names.forEach((k,i)=>{if(old[i])Object.defineProperty(Object.prototype,k,Object.setPrototypeOf(old[i],null))})}
})
test('token emission creates no clone Proxy wrapping',()=>{
  const NativeProxy=globalThis.Proxy;let wraps=0
  const reversed=orderedProxy({'1':1,'2':2},['2','1'])
  globalThis.Proxy=function(target,handler){wraps++;assert.equal(Object.getPrototypeOf(target),null);assert.equal(Object.getPrototypeOf(handler),null);assert.deepEqual(Object.keys(handler),['ownKeys']);assert.ok(Object.keys(target).every(k=>{const d=Object.getOwnPropertyDescriptor(target,k);return d.enumerable&&d.configurable&&Object.hasOwn(d,'value')}));return new NativeProxy(target,handler)}
  try{candidate.boundedJson({'1':1,'2':2,z:[{x:1}]});assert.equal(wraps,0);candidate.boundedJson(reversed);assert.equal(wraps,0)}finally{globalThis.Proxy=NativeProxy}
})


// Six chunk-specific groups. The original twenty-two groups above are byte-identical.
const referenceRole=config.roles.referenceEncoder;assert.equal(hash(readFileSync(referenceRole.path)),referenceRole.sha256)
const referenceEncoder=await import(pathToFileURL(referenceRole.path))
function chunkEqual(value,limit=baseline.MAX){const output=equal(value,limit);assert.deepEqual(referenceEncoder.boundedJson(value,limit),output);return output}
function chunkRefusal(factory,pattern,limit=baseline.MAX){for(const encoder of [baseline.boundedJson,referenceEncoder.boundedJson,candidate.boundedJson])assert.throws(()=>encoder(factory(),limit),pattern)}
function chunkFreshParity(make,pattern){
  const logs=[],outputs=[]
  for(const encoder of [baseline.boundedJson,referenceEncoder.boundedJson,candidate.boundedJson]){const log=[];logs.push(log);if(pattern)assert.throws(()=>encoder(make(log)),pattern);else outputs.push(encoder(make(log)))}
  assert.deepEqual(logs[1],logs[0]);assert.deepEqual(logs[2],logs[0])
  if(!pattern){assert.deepEqual(outputs[1],outputs[0]);assert.deepEqual(outputs[2],outputs[0]);pairs++}
}
test('chunk whole-token count and UTF8 byte seams retain exact-fit caps',()=>{
  const cases=[...([2047,2048,2049].map(n=>Array(n).fill(0))),...([-1,0,1].map(delta=>['x'.repeat(65536-6+delta),0]))]
  for(const value of cases){const raw=chunkEqual(value);chunkEqual(value,raw.length);chunkRefusal(()=>value,/STOP_JSON_CAP/,raw.length-1)}
})
test('oversized whole tokens preserve Unicode escaping and cap refusals',()=>{
  const key='😀\n'.repeat(12000)
  for(const value of ['x'.repeat(65537),'é'.repeat(40000),'😀'.repeat(20000),'\n'.repeat(40000),'\ud800'.repeat(12000),{[key]:1}]){
    const raw=chunkEqual(value);assert.ok(raw.length>65536);chunkEqual(value,raw.length);chunkRefusal(()=>value,/STOP_(JSON|STRING)_CAP/,raw.length-1)
  }
})
test('late refusal after multiple chunks cannot return or retain partial output',()=>{
  const prefix=()=>Array(40000).fill(0)
  for(const [make,pattern] of [[()=>[...prefix(),Infinity],/STOP_NON_FINITE/],[()=>[...prefix(),1n],/STOP_NON_JSON/],[()=>[...prefix(),{toJSON:undefined}],/STOP_CUSTOM_JSON/],[()=>{const x={};x.self=x;return [...prefix(),x]},/STOP_CYCLE/]]){chunkRefusal(make,pattern);chunkEqual({after:[1,null,'fresh']})}
  const value=[...prefix(),{end:true}],cap=referenceEncoder.boundedJson(value).length-1;chunkRefusal(()=>value,/STOP_JSON_CAP/,cap);chunkEqual({after:[1,null,'fresh']})
})
test('source getters Proxy traces and dynamic length stay exact across seams',()=>{
  chunkFreshParity(log=>{const v=Array(2048).fill(0);let n=0;Object.defineProperty(v,'2047',{configurable:true,get(){log.push(++n);return n===1?1:{last:2}}});return v})
  chunkFreshParity(log=>new Proxy(Array(2048).fill(0),{get(t,k,r){log.push(String(k));return Reflect.get(t,k,r)}}))
  chunkFreshParity(log=>{const v=Array(2050).fill(0);Object.defineProperty(v,'2047',{configurable:true,get(){log.push('shrink');v.length=2048;return 7}});return v})
  chunkFreshParity(log=>{const v=Array(2048).fill(0);let n=0;Object.defineProperty(v,'2047',{configurable:true,get(){log.push(++n);if(n===1)v.push(8,9);return n}});return v})
  chunkFreshParity(log=>{const v=Array(2048).fill(0);let n=0;Object.defineProperty(v,'2047',{configurable:true,get(){log.push(++n);return n===1?1:undefined}});return v},/./)
})
test('shared references repeated keys and mutation remain fresh across chunks and calls',()=>{
  const shared={same:1},value=Array(3000).fill(shared);const first=chunkEqual(value);shared.same=9;const second=chunkEqual(value);assert.notDeepEqual(first,second)
  chunkEqual(Array.from({length:1200},(_,i)=>({'repeated\n😀':i,nested:{'repeated\n😀':i+1}})))
})
test('chunk token architecture and unusual limit coercion preserve original checkpoints',()=>{
  const nativeStringify=JSON.stringify,NativeProxy=globalThis.Proxy;let containers=0,wraps=0
  JSON.stringify=function(v,...args){if(v!==null&&typeof v==='object')containers++;return nativeStringify(v,...args)}
  globalThis.Proxy=function(...args){wraps++;return new NativeProxy(...args)}
  try{chunkEqual(Array.from({length:2100},(_,i)=>({same:i})));assert.equal(containers,0);assert.equal(wraps,0)}finally{JSON.stringify=nativeStringify;globalThis.Proxy=NativeProxy}
  const encoders=[referenceEncoder.boundedJson,candidate.boundedJson],logs=[],outputs=[]
  for(const encoder of encoders){const log=[],value=Array(2100).fill(0);let reads=0;Object.defineProperty(value,'2047',{get(){log.push('get:'+ ++reads);return 0}});const limit={valueOf(){log.push('limit');return baseline.MAX}};logs.push(log);outputs.push(encoder(value,limit))}
  assert.deepEqual(logs[1],logs[0]);assert.deepEqual(outputs[1],outputs[0]);pairs++
  const late=[]
  for(const encoder of encoders){let count=0;const log=[],limit={valueOf(){log.push(++count);return count===4100?NaN:baseline.MAX}};assert.throws(()=>encoder(Array(2100).fill(0),limit),/STOP_JSON_CAP/);assert.equal(count,4100);late.push(log)}
  assert.deepEqual(late[1],late[0]);chunkRefusal(()=>[0],/STOP_JSON_CAP/,NaN);chunkRefusal(()=>[0],TypeError,Symbol('limit'))
})

process.stdout.write(JSON.stringify({status:'ENCODER_EQUIVALENCE_AND_REFUSALS_PASSED',groups,pairs,game:false,saveImports:false,captureDecode:false})+'\n')
