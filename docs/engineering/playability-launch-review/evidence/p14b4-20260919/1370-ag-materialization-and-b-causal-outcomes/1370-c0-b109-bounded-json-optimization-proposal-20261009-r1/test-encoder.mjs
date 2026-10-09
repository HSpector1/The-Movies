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
process.stdout.write(JSON.stringify({status:'ENCODER_EQUIVALENCE_AND_REFUSALS_PASSED',groups,pairs,game:false,saveImports:false,captureDecode:false})+'\n')
