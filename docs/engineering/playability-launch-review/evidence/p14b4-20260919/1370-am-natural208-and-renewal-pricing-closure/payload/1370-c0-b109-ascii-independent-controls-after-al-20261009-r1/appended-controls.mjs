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
