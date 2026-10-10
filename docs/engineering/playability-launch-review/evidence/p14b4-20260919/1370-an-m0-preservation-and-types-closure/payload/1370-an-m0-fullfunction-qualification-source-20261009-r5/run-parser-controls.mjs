// Finite pure public data controls. Never imports the gameplay worker or M0 modules.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {equal,parseExact} from './exact-json.mjs';
const HERE=path.dirname(fileURLToPath(import.meta.url));
assert.equal(process.argv.length,2);assert.equal(process.version,'v22.23.2');
const identity=s=>[s.dev,s.ino,s.mode,s.nlink,s.size,s.mtimeNs,s.ctimeNs].map(String).join(':');
function role(p){
 assert.equal(fs.realpathSync(p),p);const st=fs.lstatSync(p,{bigint:true});assert.ok(st.isFile()&&st.nlink===1n&&st.size<=131072n);
 const fd=fs.openSync(p,fs.constants.O_RDONLY|fs.constants.O_NOFOLLOW),h=crypto.createHash('sha256');let bytes=0;
 try{assert.equal(identity(fs.fstatSync(fd,{bigint:true})),identity(st));for(;;){const b=Buffer.alloc(4096),n=fs.readSync(fd,b,0,b.length,null);if(!n)break;bytes+=n;assert.ok(bytes<=Number(st.size)&&bytes<=131072);h.update(b.subarray(0,n))}assert.equal(bytes,Number(st.size));assert.equal(identity(fs.fstatSync(fd,{bigint:true})),identity(st));assert.equal(identity(fs.lstatSync(p,{bigint:true})),identity(st))}finally{fs.closeSync(fd)}
 return {path:p,bytes,sha256:h.digest('hex')};
}
const parse=s=>parseExact(Buffer.from(s));
const exactStop=(s,label)=>assert.throws(()=>parse(s),e=>e instanceof Error&&e.message===label);
const rows=[];
function check(id,predicate,body){body();rows.push({id,predicate,verdict:'PASS_SPECIFIC_PURE_CONTROL'})}
check('safe-positive-max','native Number parity at MAX_SAFE_INTEGER',()=>assert.equal(parse('9007199254740991'),JSON.parse('9007199254740991')));
check('unsafe-positive-boundary','exact BigInt9007199254740992',()=>assert.equal(parse('9007199254740992'),9007199254740992n));
check('unsafe-positive-neighbor','neighbor retains exact BigInt9007199254740993',()=>assert.equal(parse('9007199254740993'),9007199254740993n));
check('safe-negative-min','native Number parity at MIN_SAFE_INTEGER',()=>assert.equal(parse('-9007199254740991'),JSON.parse('-9007199254740991')));
check('unsafe-negative-boundary','exact BigInt-9007199254740992',()=>assert.equal(parse('-9007199254740992'),-9007199254740992n));
check('unsafe-negative-neighbor','neighbor retains exact BigInt-9007199254740993',()=>assert.equal(parse('-9007199254740993'),-9007199254740993n));
check('actual-known-root-nanoseconds','exact recorded postR6 token1791600924862151724',()=>assert.equal(parse('1791600924862151724'),1791600924862151724n));
check('adjacent-root-nanoseconds','adjacent nanosecond identity remains unequal',()=>assert.equal(equal(parse('1791600924862151724'),parse('1791600924862151725')),false));
check('integer-negative-zero','integer -0 normalized to0 as Python JSON integer',()=>{assert.equal(parse('-0'),0);assert.equal(Object.is(parse('-0'),-0),false)});
check('ordinary-fraction','native finite fraction parity1.25',()=>assert.equal(parse('1.25'),JSON.parse('1.25')));
check('fraction-negative-zero','native negative fractional zero preserved',()=>assert.equal(Object.is(parse('-0.0'),-0),true));
check('finite-exponent','native exponent parity1e3',()=>assert.equal(parse('1e3'),JSON.parse('1e3')));
check('duplicate-key','exact STOP_DUPLICATE_JSON_KEY',()=>exactStop('{"a":1,"a":2}','STOP_DUPLICATE_JSON_KEY'));
check('nested-duplicate-key','nested exact STOP_DUPLICATE_JSON_KEY',()=>exactStop('{"outer":{"a":1,"a":2}}','STOP_DUPLICATE_JSON_KEY'));
check('malformed-leading-zero','exact STOP_JSON_TRAILING_DATA',()=>exactStop('01','STOP_JSON_TRAILING_DATA'));
check('malformed-fraction','exact STOP_JSON_TRAILING_DATA',()=>exactStop('1.','STOP_JSON_TRAILING_DATA'));
check('malformed-exponent','exact STOP_JSON_TRAILING_DATA',()=>exactStop('1e','STOP_JSON_TRAILING_DATA'));
check('fraction-overflow','exact STOP_JSON_NONFINITE',()=>exactStop('1e309','STOP_JSON_NONFINITE'));
check('unsupported-nan','exact STOP_JSON_VALUE',()=>exactStop('NaN','STOP_JSON_VALUE'));
check('malformed-escape','native SyntaxError; unknown errors fail',()=>assert.throws(()=>parse('"\\q"'),e=>e instanceof SyntaxError));
check('raw-control-in-string','native SyntaxError; unknown errors fail',()=>assert.throws(()=>parse('"\u0001"'),e=>e instanceof SyntaxError));
check('unterminated-string','exact STOP_JSON_STRING_END',()=>exactStop('"x','STOP_JSON_STRING_END'));
check('malformed-utf8','TypeError with exact ERR_ENCODING_INVALID_ENCODED_DATA',()=>assert.throws(()=>parseExact(Buffer.from([0x22,0xc3,0x28,0x22])),e=>e instanceof TypeError&&e.code==='ERR_ENCODING_INVALID_ENCODED_DATA'));
check('depth-overflow','exact STOP_JSON_DEPTH',()=>exactStop('['.repeat(101)+'0'+']'.repeat(101),'STOP_JSON_DEPTH'));
check('trailing-data','exact STOP_JSON_TRAILING_DATA',()=>exactStop('{}true','STOP_JSON_TRAILING_DATA'));
check('array-trailing-comma','exact STOP_JSON_VALUE',()=>exactStop('[1,]','STOP_JSON_VALUE'));
check('object-trailing-comma','exact STOP_JSON_STRING',()=>exactStop('{"a":1,}','STOP_JSON_STRING'));
check('unsupported-undefined','exact STOP_JSON_VALUE',()=>exactStop('undefined','STOP_JSON_VALUE'));
check('escaped-string','native string parity with braces and escapes',()=>{const s=JSON.stringify('quoted"{x}\n\\');assert.equal(parse(s),JSON.parse(s))});
check('prototype-key','own __proto__ key with null prototype',()=>{const o=parse('{"__proto__":{"x":1}}');assert.equal(Object.getPrototypeOf(o),null);assert.ok(Object.hasOwn(o,'__proto__'));assert.equal(o.__proto__.x,1)});
check('typed-structure-equality','BigInt vsNumber, boolean vsNumber and array vsObject stay distinct',()=>{assert.equal(equal(9007199254740992n,9007199254740992),false);assert.equal(equal(false,0),false);assert.equal(equal([],{}),false)});
check('nested-proof-exactness','reordered keys compare equal; one nested nanosecond differs',()=>{const a=parse('{"root":[16777220,166751332,16832,13,416,1791600924862151724,1791600924862151724],"ok":true}'),b=parse('{"ok":true,"root":[16777220,166751332,16832,13,416,1791600924862151724,1791600924862151724]}'),c=parse('{"ok":true,"root":[16777220,166751332,16832,13,416,1791600924862151725,1791600924862151724]}');assert.equal(equal(a,b),true);assert.equal(equal(a,c),false)});
assert.equal(rows.length,32);
const result={schema:'1370-exact-identity-json-pure-controls-result/v1',status:'PASS_EXACT_IDENTITY_JSON_PURE_CONTROLS_ALL_CASES_ONLY',parserSource:role(path.join(HERE,'exact-json.mjs')),controlsSource:role(fileURLToPath(import.meta.url)),caseCount:rows.length,results:rows,negativePredicate:'Each fixed input must raise its specific STOP label or native malformed-string SyntaxError or exact UTF8 TypeError code; all other errors fail.',unsafeIntegerRepresentation:'BigInt only in validation memory; report stores predicates, not converted proof values.',originalJsonArtifactBytesChanged:false,privateM0ReadOrWritten:false,game:false,executionAuthorization:false};
const raw=Buffer.from(JSON.stringify(result)+'\n');assert.ok(raw.length<=131072);process.stdout.write(raw);
