// HELD exact ASCII controls. CLI exact CONFIG SHA. No game/capture/write/launch activity.
import assert from 'node:assert/strict'
import {readFileSync,lstatSync,realpathSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {pathToFileURL} from 'node:url'
const hash=b=>createHash('sha256').update(b).digest('hex')
assert.equal(process.argv.length,3)
const configRaw=readFileSync(new URL('./CONFIG.json',import.meta.url));assert.equal(hash(configRaw),process.argv[2]);const config=JSON.parse(configRaw)
assert.equal(process.version,'v20.20.2');assert.equal(process.execPath,config.nodePath)
for(const r of Object.values(config.roles)){assert.equal(realpathSync(r.path),r.path);const st=lstatSync(r.path);assert.ok(st.isFile());assert.equal(st.nlink,1);const bytes=readFileSync(r.path);assert.equal(bytes.length,r.bytes);assert.equal(hash(bytes),r.sha256)}
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

// HELD appended controls. Prefix preserves original28/321 verbatim; no runtime yet.
assert.equal(groups,28);assert.equal(pairs,321)
const originalCounts={groups,pairs},extraRows=[],redRows=[]
const reference=await import(pathToFileURL(config.roles.selectedReference.path))
const specific=e=>({name:e.name,code:e.code??null,refusal:/STOP_[A-Z_]+/.exec(e.message)?.[0]??null})
function outcome(encoder,value,limit){try{return {bytes:encoder(value,limit)}}catch(e){return {error:specific(e)}}}
function parity(value,limit=reference.MAX){const left=reference.boundedJson(value,limit),right=candidate.boundedJson(value,limit);assert.deepEqual(right,left);pairs++;return right}
function outcomeParity(factory,limit){const left=outcome(reference.boundedJson,factory(),limit),right=outcome(candidate.boundedJson,factory(),limit);assert.deepEqual(right,left);return right}
function extra(name,expectedPairs,f){const before=pairs;test(name,f);assert.equal(pairs-before,expectedPairs);extraRows.push({name,status:'GREEN',pairs:expectedPairs})}
function freshTrace(factory,expectSuccess=true){const observations=[];for(const encoder of [reference.boundedJson,candidate.boundedJson]){const log=[],value=factory(log);observations.push({result:outcome(encoder,value,reference.MAX),log})}assert.deepEqual(observations[1],observations[0]);assert.equal('bytes' in observations[0].result,expectSuccess);if(expectSuccess)pairs++;return observations[0]}
extra('ascii128 values keys eligible mixtures empty slash DEL',268,()=>{
 for(let code=0;code<128;code++){const s=String.fromCharCode(code);parity(s);parity({[s]:s})}
 const eligible=Array.from({length:96},(_,i)=>String.fromCharCode(i+32)).filter(s=>s!=='"'&&s!=='\\').join('')
 for(const s of ['', '/', '\x7f',' !#~',eligible,eligible.repeat(3)]){parity(s);parity({[s]:s})}
})
extra('native fallback escapes unicode separators surrogate values keys',34,()=>{
 for(const s of ['"','\\','\0','\b','\t','\n','\f','\r','\x1f','é','Ā','😀','\u2028','\u2029','\ud800','\udfff','asciié/"\\\n']){parity(s);parity({[s]:s})}
})
extra('raw rendered cumulative key caps and ordered limit coercions',9,()=>{
 const corpus=['','a','\n','é',{x:'a'},{é:'\n'},['a','b']]
 for(const value of corpus){const size=reference.boundedJson(value).length;parity(value,size);for(let limit=0;limit<size;limit++)assert.ok(outcomeParity(()=>value,limit).error)}
 assert.equal(outcomeParity(()=>'aaaa',3).error.refusal,'STOP_STRING_CAP')
 assert.equal(outcomeParity(()=>({aaaa:0}),3).error.refusal,'STOP_STRING_CAP')
 assert.equal(outcomeParity(()=>'\n\n\n',3).error.refusal,'STOP_JSON_CAP')
 assert.equal(outcomeParity(()=>'ééé',5).error.refusal,'STOP_STRING_CAP')
 assert.equal(outcomeParity(()=>[0],NaN).error.refusal,'STOP_JSON_CAP')
 assert.equal(outcomeParity(()=>'a',NaN).error.refusal,'STOP_STRING_CAP')
 assert.equal(outcomeParity(()=>'a',Symbol('limit')).error.name,'TypeError')
 for(const value of ['a','é']){const obs=[];for(const encoder of [reference.boundedJson,candidate.boundedJson]){const log=[],limit={valueOf(){log.push(log.length+1);return reference.MAX}};obs.push({result:outcome(encoder,value,limit),log})}assert.deepEqual(obs[1],obs[0]);assert.deepEqual(obs[0].log,[1,2]);assert.ok(obs[0].result.bytes);pairs++}
 for(const value of ['a','é',{a:'é',é:'a'}]){const failAt=typeof value==='string'?2:4,obs=[];for(const encoder of [reference.boundedJson,candidate.boundedJson]){const log=[],limit={valueOf(){log.push(log.length+1);return log.length===failAt?1:reference.MAX}};obs.push({result:outcome(encoder,value,limit),log})}assert.deepEqual(obs[1],obs[0]);assert.equal(obs[0].result.error.refusal,'STOP_JSON_CAP');assert.deepEqual(obs[0].log,Array.from({length:failAt},(_,i)=>i+1))}
})
extra('byte and token flush seams oversized whole tokens late refusal',15,()=>{
 for(let total=65534;total<=65537;total++){const value='x'.repeat(total-2);parity(value,total);assert.equal(outcomeParity(()=>value,total-1).error.refusal,'STOP_JSON_CAP')}
 for(let total=65534;total<=65537;total++){const value=['x'.repeat(total-6),0];parity(value,total);assert.equal(outcomeParity(()=>value,total-1).error.refusal,'STOP_JSON_CAP')}
 // Full-value token count is odd:2048 elements traverse pending prefixes4095/4096/4097.
 for(const n of [2047,2048,2049])parity(Array(n).fill('a'))
 for(const value of ['x'.repeat(65537),'é'.repeat(40000),'\n'.repeat(40000)]){const size=reference.boundedJson(value).length;parity(value,size);assert.ok(outcomeParity(()=>value,size-1).error)}
 for(const [tail,refusal] of [[()=>Infinity,'STOP_NON_FINITE'],[()=>1n,'STOP_NON_JSON'],[()=>{const x={};x.self=x;return x},'STOP_CYCLE']])assert.equal(outcomeParity(()=>[...Array(2200).fill('a'),tail()],reference.MAX).error.refusal,refusal)
 parity({still:'fresh',unicode:'é'})
})
extra('source getters proxies two reads dynamic lengths both branches',8,()=>{
 for(const text of ['a','é']){
  freshTrace(log=>{let reads=0;const x={};Object.defineProperty(x,text,{enumerable:true,get(){log.push('get'+(++reads));return text}});return x})
  freshTrace(log=>new Proxy({[text]:text},{ownKeys(t){log.push('keys');return Reflect.ownKeys(t)},getOwnPropertyDescriptor(t,k){log.push('desc:'+String(k));return Reflect.getOwnPropertyDescriptor(t,k)},get(t,k,r){log.push('get:'+String(k));return Reflect.get(t,k,r)}}))
  freshTrace(log=>{const a=[text,text];Object.defineProperty(a,0,{get(){log.push('shrink');a.length=1;return text}});return a})
  freshTrace(log=>{const a=[text];let reads=0;Object.defineProperty(a,0,{get(){log.push('grow'+(++reads));if(reads===2)a.push(text);return text}});return a})
  const row=freshTrace(log=>{let reads=0;const x={};Object.defineProperty(x,text,{enumerable:true,get(){log.push('transition'+(++reads));return reads===1?text:undefined}});return x},false);assert.equal(row.result.error.code,'ERR_ASSERTION');assert.deepEqual(row.log,['transition1','transition2'])
 }
})
extra('shared repeated keys mutations fresh calls no container stringify clone',10,()=>{
 const shared={same:'a'},many=Array(3000).fill(shared);parity(many);shared.same='é';parity(many)
 const keys={repeat:'a'};parity(keys);keys.repeat='é';parity(keys)
 const nested={a:shared,b:shared};parity(nested);shared.same='a';parity(nested)
 parity(Object.freeze({a:Object.freeze(['a','é'])}))
 const stringify=JSON.stringify,OriginalProxy=globalThis.Proxy;let containers=0,newProxies=0
 JSON.stringify=function(v,...args){if(v!==null&&typeof v==='object')containers++;return Reflect.apply(stringify,JSON,[v,...args])}
 globalThis.Proxy=new OriginalProxy(OriginalProxy,{construct(target,args,newTarget){newProxies++;return Reflect.construct(target,args,newTarget)}})
 try{for(const value of ['ascii','é',{ascii:'é',é:'ascii'}])parity(value);assert.equal(containers,0);assert.equal(newProxies,0)}finally{JSON.stringify=stringify;globalThis.Proxy=OriginalProxy}
})
const mutants={};for(const name of ['escape','unicode','precheck'])mutants[name]=await import(pathToFileURL(config.roles['mutant_'+name].path))
function expectedRed(name,shape,f){f();redRows.push({name,status:'EXPECTED_RED',shape});process.stdout.write(`EXPECTED_RED ${name}\n`)}
expectedRed('escape exclusion mutant','exact native string and key byte mismatch on quote backslash LF',()=>{
 for(const s of ['"','\\','\n'])for(const value of [s,{[s]:s}]){const native=reference.boundedJson(value),wrong=mutants.escape.boundedJson(value);assert.notDeepEqual(wrong,native);const bad=typeof value==='string'?Buffer.from('"'+s+'"'):Buffer.from('{"'+s+'":"'+s+'"}');assert.deepEqual(wrong,bad);assert.deepEqual(candidate.boundedJson(value),native)}
 assert.equal(mutants.escape.boundedJson('"').toString('hex'),'222222');assert.equal(candidate.boundedJson('"').toString('hex'),'225c2222')
})
expectedRed('unicode byte-size mutant','é missing terminal byte and budget3 wrongly admitted',()=>{
 const wrong=mutants.unicode.boundedJson('é');assert.equal(wrong.toString('hex'),'22c3a9');assert.equal(reference.boundedJson('é').toString('hex'),'22c3a922');assert.deepEqual(candidate.boundedJson('é'),reference.boundedJson('é'))
 assert.equal(mutants.unicode.boundedJson('é',3).toString('hex'),'22c3a9');assert.equal(outcome(candidate.boundedJson,'é',3).error.refusal,'STOP_JSON_CAP')
 const value={é:0},native=reference.boundedJson(value);assert.deepEqual(mutants.unicode.boundedJson(value),native.subarray(0,-1));assert.deepEqual(candidate.boundedJson(value),native)
})
expectedRed('raw precheck mutant','STRING versus JSON cap plus missing ordered coercion checkpoint',()=>{
 for(const value of ['abcd','\n\n\n\n']){const good=outcome(candidate.boundedJson,value,3),wrong=outcome(mutants.precheck.boundedJson,value,3);assert.deepEqual(good.error,{name:'AssertionError',code:'ERR_ASSERTION',refusal:'STOP_STRING_CAP'});assert.deepEqual(wrong.error,{name:'AssertionError',code:'ERR_ASSERTION',refusal:'STOP_JSON_CAP'});assert.deepEqual(good,outcome(reference.boundedJson,value,3))}
 const rows=[];for(const encoder of [reference.boundedJson,candidate.boundedJson,mutants.precheck.boundedJson]){const log=[],limit={valueOf(){log.push(log.length+1);return log.length===1?reference.MAX:3}};rows.push({result:outcome(encoder,'abcd',limit),log})}
 assert.deepEqual(rows[1],rows[0]);assert.deepEqual(rows[0].log,[1,2]);assert.equal(rows[0].result.error.refusal,'STOP_JSON_CAP');assert.deepEqual(rows[2].log,[1]);assert.equal(rows[2].result.bytes.toString('hex'),'226162636422')
})
assert.deepEqual(originalCounts,{groups:28,pairs:321});assert.equal(groups,34);assert.equal(pairs,665);assert.equal(extraRows.length,6);assert.equal(redRows.length,3)
process.stdout.write(JSON.stringify({schema:'1370-b109-ascii-controls/v1',status:'ORIGINAL28_ASCII6_MUTANT3_EXPECTED_RED_GREEN_PASSED',originalGroups:28,originalPairs:321,newGroups:6,newPairs:344,totalGroups:34,totalPairs:665,expectedRed:3,unexpectedRed:0,groups:extraRows,mutants:redRows,game:false,saveImports:false,captureDecode:false,performanceWin:false})+'\n')
