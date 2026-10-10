// Pure dependency-injected controls. Source authoring does not execute this file.
import assert from 'node:assert/strict'

const NATIVE='c0-m0-promise-feasibility/v3-native-canonical'
const LEGACY='c0-m0-feasibility/v1'
const ROW='M0 feasibility row byte bound exceeded'
const COUNT='M0 feasibility row bound exceeded'
const TOTAL='M0 feasibility total byte bound exceeded'
const bytes=s=>Buffer.byteLength(s,'utf8')
const json=x=>JSON.stringify(x)
const ctx=patch=>({era:'M0',week:196,caseKey:'case',caseOccurrence:0,caseSourceIndex:0,
 subject:'person',issuer:'studio',proposalKey:'proposal',proposalOccurrence:0,
 proposalSourceIndex:0,phase:'authorCandidate',candidateOrdinal:0,...patch})
function digest(text){let n=0xcbf29ce484222325n;for(let i=0;i<text.length;i++)n=(n^BigInt(text.charCodeAt(i)))*0x100000001b3n&0xffffffffffffffffn;return n.toString(16).padStart(16,'0')}
const detail=text=>({canonicalInputs:text,inputBytes:bytes(text),inputsDigest:digest(text)})
const ordinary=()=>detail(json(['PREFERRED_GENRE_OPPORTUNITY',{a:[1,true,null,'quote"\\\n☃😀'],b:'value'}]))
const identity=(c,k)=>json([c.week,c.caseKey,c.caseOccurrence,c.proposalKey,c.proposalOccurrence,
 c.phase,c.candidateOrdinal??null,c.submittedOrdinal??null,c.survivorOrdinal??null,k])
const frame=(c,k,d,rows)=>({schema:NATIVE,sequence:rows.length,
 occurrence:rows.filter(r=>identity(r.context,r.kind)===identity(c,k)).length,context:c,kind:k,detail:d})
function frozen(value){const todo=[value],seen=new Set();while(todo.length){const v=todo.pop();if(!v||typeof v!=='object'||seen.has(v))continue;seen.add(v);todo.push(...Object.values(v));Object.freeze(v)}return value}
function thrown(fn){let failed=false,error;try{fn()}catch(e){failed=true;error=e}assert.equal(failed,true,'specific refusal actually occurred');return error}
function originalError(fn,message){const e=thrown(fn);assert.ok(e instanceof Error);assert.equal(e.name,'Error');assert.equal(e.message,message);return e}
function exactThrown(fn,value){assert.equal(thrown(fn),value,'exact first thrown value, not another failure')}
function assessmentAt(c,rows,target){const d={classification:'REASONABLY_ACHIEVABLE',bottleneck:null,inputsDigest:'0000000000000000',rulesVersion:4,week:196,locals:{pad:''}};const overhead=bytes(json(frame(c,'assessment',d,rows))+'\n');assert.ok(target>=overhead);d.locals.pad='x'.repeat(target-overhead);assert.equal(bytes(json(frame(c,'assessment',d,rows))+'\n'),target);return d}
function canonicalAt(n){const text=json(['PREFERRED_GENRE_OPPORTUNITY','x'.repeat(n-bytes(json(['PREFERRED_GENRE_OPPORTUNITY',''])))]);assert.equal(bytes(text),n);return detail(text)}
function inputAt(codec,c,rows,target){let n=0;for(let i=0;i<5;i++){const d=detail(json(['PREFERRED_GENRE_OPPORTUNITY','x'.repeat(n)])),native=codec.encodeInputDetail(d),r=frame(c,'inputTuple',native,rows),size=bytes(json(r)+'\n');if(size===target)return{d,native,row:r};n+=target-size;assert.ok(n>=0&&n<16384)}assert.fail('exact physical input boundary fixture converges')}

export const NATIVE_CASES=[
 ['rich_canonical_unicode_exact_projection','GREEN','complete canonical UTF8 and original UTF16 digest survive native roundtrip'],
 ['native_projection_matches_original_witness','GREEN','all original logical values/context/identity/order/multiplicity retained'],
 ['legacy_over_16384_native_fits','GREEN','explicit accounting amendment; complete expanded projection and L<=2P+2'],
 ['native_row_16384_inclusive','GREEN','actual native physical JSON plus newline equals16384'],
 ['native_count_512_inclusive','GREEN','all512 logical rows retained'],
 ['native_total_2097152_inclusive','GREEN','128 exact16384 physical rows charge exact2MiB'],
 ['immutable_snapshot_fresh_arm_isolation','GREEN','immutable owned row references; old snapshot/failure does not mutate new arm'],
 ['actual_binding_consumer_valid_tuple','GREEN','actual shared consumer accepts canonical/inputBytes/digest/context relation'],
 ['canonical_depth_64_projection_and_binding','GREEN','canonical depth64 survives physical wrapper, legacy view and actual binding'],
 ['actual_arm_success_cleanup_order','GREEN','actual shared helper returns body value and attempts end then reset'],
 ['codec_original_unknown_key','RED','FORMAT_INVALID; exact original keys'],
 ['codec_accessor_not_invoked','RED','FORMAT_INVALID without getter invocation'],
 ['codec_nonarray_canonical','RED','FORMAT_INVALID; canonical tuple is array'],
 ['codec_malformed_canonical','RED','actual native SyntaxError; malformed JSON, no remapping'],
 ['codec_declared_byte_mismatch','RED','FORMAT_INVALID; exact UTF8 inputBytes'],
 ['codec_negative_zero_spelling','RED','CANONICAL_ROUNDTRIP; no lexical normalization'],
 ['codec_unsafe_integer_spelling','RED','CANONICAL_ROUNDTRIP; no changed number preimage'],
 ['codec_unnecessary_escape_spelling','RED','CANONICAL_ROUNDTRIP; original canonical spelling exact'],
 ['direct_codec_canonical_16385','RED','CANONICAL_OVER_BOUND; operational direct codec bound'],
 ['codec_depth_65','RED','STRUCTURE_OVER_BOUND before stringify'],
 ['decoder_wrong_encoding_tag','RED','FORMAT_INVALID; exact native encoding'],
 ['decoder_unknown_key','RED','FORMAT_INVALID; exact native detail keys'],
 ['decoder_plain_bounded_tuple','GREEN','validated plain parsed helper row has exact canonical projection'],
 ['decoder_declared_byte_mismatch','RED','FORMAT_INVALID; decoded canonical bytes'],
 ['decoder_nodes_properties_over_bound','RED','STRUCTURE_OVER_BOUND before canonical serialization for oversized owned tuple'],
 ['legacy_historical_schema_not_native','RED','FORMAT_INVALID; old schema never relabeled'],
 ['legacy_over_physical_row_limit','RED','FORMAT_INVALID; decoder validates physical boundary'],
 ['sink_row_16385','RED','same original row-byte Error; no partial row commit'],
 ['sink_canonical_known_no_fit','RED','same original row-byte Error before codec/parse'],
 ['count_513_preempts_malformed_conversion','RED','same original count Error; no encoder call'],
 ['total_2097152_then_more','RED','same original total Error; charged rows unchanged'],
 ['consumer_changed_tuple_digest_bytes','RED','actual shared evaluation-match assertion rejects altered tuple/digest/bytes'],
 ['consumer_order_duplicate_omission','RED','actual shared evaluation-match assertion rejects changed full tuple'],
 ['consumer_context_and_source_index','RED','actual shared evaluation-match assertion rejects altered exact context'],
 ['consumer_envelope_version_and_extra_key','RED','actual matcher rejects unknown physical schema/extra envelope via FORMAT_INVALID'],
 ['latch_falsy_first_values','RED','undefined/null/false/0/empty first value survives later failure'],
 ['native_E_swallowed_body_paths','RED','actual helper rethrows original native E after return or later F; no row metadata'],
 ['row_E_swallowed_body_paths','RED','actual helper rethrows same original row E after return or later F'],
 ['first_E_survives_end_reset_writer','RED','first native E preserved; both cleanup callbacks attempted'],
 ['cleanup_new_E_swallowed','RED','new shared E during end/reset forbids successful return'],
 ['ordinary_empty_latch_cleanup_precedence','RED','original reset>end>body fatal precedence, including undefined'],
 ['sticky_rows_and_later_record','RED','strict public access and records rethrow first E; no later encoding'],
 ['snapshot_failure_no_record','RED','actual wrapper records snapshot E; authoritative record not invoked'],
 ['native_row_diagnostic_available_physical','RED','same row E; exact new physical bytes and canonical metadata'],
 ['assessment_diagnostic_native_predecessor','RED','same row E; exact same-context native predecessor decoded after latch'],
 ['native_first_no_row_emission','RED','writer zero calls; later resource error cannot become first cause'],
 ['diagnostic_output_4096_bound','RED','same row E; unavailable scalar metadata under output cap'],
 ['diagnostic_writer_failure_consumes','RED','same row E; first emission consumed despite writer failure'],
 ['diagnostic_healthy_bypass_refused','RED','FORMAT_INVALID is sticky; metadata method has no healthy authority'],
 ['diagnostic_eligible_core_same_E','RED','metadata-only encoder/decoder work after original row E; normal APIs remain fatal'],
 ['diagnostic_native_first_bypass_refused','RED','FORMAT_INVALID cannot replace first native E'],
 ['capture_invalid_context_sticky','RED','same original invalid-context Error retained before throw'],
 ['capture_native_serialization_identity','RED','actual native context serialization TypeError retained by identity'],
 ['capture_after_sticky_before_getter','RED','first E precedes any later capture getter or serialization work'],
].map(([id,expected,predicate])=>({id,expected,predicate}))

export function runNativeObserverControls({createObserverFailureLatch,createNativeRowCodec,
 NativeObserverFormatError,createM0FeasibilitySink,originalCreateM0FeasibilitySink,
 createObserverRowDiagnostic,runObserverArm,assertNativeEvaluationBinding,
 runOrderingSourceControls,orderingPacket}){
 const results=[],tests=new Map()
 const put=(id,fn)=>{assert.ok(!tests.has(id));tests.set(id,fn)}
 const codecOnly=()=>{const latch=createObserverFailureLatch();return{latch,codec:createNativeRowCodec({latch})}}
 const setup=()=>{const p=codecOnly();p.sink=createM0FeasibilitySink(p);p.diagnostic=createObserverRowDiagnostic(p);return p}
 const capture=(p,c=ctx())=>p.sink.capture(c)
 const wrap=(p,c=ctx(),provider=()=>p.sink.rows())=>p.diagnostic.wrap(capture(p,c),provider)
 const format=(p,fn,code)=>{const e=thrown(fn);assert.ok(e instanceof NativeObserverFormatError);assert.equal(e.name,'NativeObserverFormatError');assert.equal(e.code,code);assert.equal(p.latch.first().failed,true);assert.equal(p.latch.first().error,e);exactThrown(()=>p.latch.throwIfFailed(),e);return e}
 const available=(p,e)=>{const lines=[];p.diagnostic.emitFirst(x=>lines.push(x));assert.equal(lines.length,1);assert.ok(lines[0].endsWith('\n'));assert.ok(bytes(lines[0])<=4096);const m=JSON.parse(lines[0]);assert.equal(m.schema,'1370-m0-observer-row-diagnostic/v1');assert.equal(m.predicate,'ROW_BYTE_CAP');assert.equal(m.error.name,e.name);assert.equal(m.error.message,e.message);return m}
 const evalFor=(row,d)=>({inputs:JSON.parse(d.canonicalInputs),canonicalInputs:d.canonicalInputs,result:{inputsDigest:d.inputsDigest},context:row.context})
 const nativeTuple=()=>{const p=setup(),d=ordinary();capture(p).record('inputTuple',d);return{...p,d,row:p.sink.rows()[0]}}
 const rowRefusal=p=>{const before=p.sink.rows(),d=assessmentAt(ctx(),before,16385);return originalError(()=>wrap(p).record('assessment',d),ROW)}
 const boundLabel='witness is the actual full-body evaluation tuple'
 const consumerRefusal=(p,row,evaluations)=>assert.throws(()=>assertNativeEvaluationBinding(p.codec,row,evaluations),e=>e instanceof assert.AssertionError&&e.message.includes(boundLabel),'actual binding predicate, not an arbitrary codec/import exception')

 put('rich_canonical_unicode_exact_projection',()=>{const p=codecOnly();for(const value of [['FAMILY',{a:[0,-0,1e100,true,false,null,'"\\\b\n\u0000☃😀\ud800'],b:{a:1,z:2}}],['FAMILY',[],{},'']]){const d=detail(json(value)),n=p.codec.encodeInputDetail(d);assert.deepEqual(p.codec.decodeInputDetail(n),d);assert.equal(d.inputsDigest,digest(d.canonicalInputs));assert.ok(Object.isFrozen(n));assert.ok(Object.isFrozen(n.canonicalInputsTuple))}})
 put('native_projection_matches_original_witness',()=>{const p=setup(),old=originalCreateM0FeasibilitySink();for(const c of [ctx(),ctx({caseSourceIndex:1,proposalSourceIndex:3}),ctx({candidateOrdinal:1})]){const a=capture(p,c),b=old.capture(c);for(const [kind,d] of [['inputTuple',ordinary()],['assessment',{classification:'FRAGILE',locals:{a:[1,2],b:true}}],['inputTuple',ordinary()]]){a.record(kind,d);b.record(kind,d)}}const physical=p.sink.rows(),expected=old.rows();assert.equal(physical.length,expected.length);for(let i=0;i<physical.length;i++)assert.deepEqual(p.codec.legacyRow(physical[i]),expected[i])})
 put('legacy_over_16384_native_fits',()=>{const p=setup(),c=ctx(),d=detail(json(['PREFERRED_GENRE_OPPORTUNITY','"\\'.repeat(2300)]));capture(p,c).record('inputTuple',d);const r=p.sink.rows()[0],l=p.codec.legacyRow(r),P=bytes(json(r)+'\n'),L=bytes(json(l)+'\n');assert.ok(P<=16384);assert.ok(L>16384,'meaningful accounting amendment fixture');assert.ok(L<=2*P+2);assert.deepEqual(l.detail,d);assert.equal(l.context.caseKey,c.caseKey)})
 put('native_row_16384_inclusive',()=>{const p=setup(),d=assessmentAt(ctx(),[],16384);capture(p).record('assessment',d);assert.equal(bytes(json(p.sink.rows()[0])+'\n'),16384)})
 put('native_count_512_inclusive',()=>{const p=setup(),a=capture(p);for(let i=0;i<512;i++)a.record('assessment',{slot:i});const rows=p.sink.rows();assert.equal(rows.length,512);assert.deepEqual(rows.map(r=>r.detail.slot),Array.from({length:512},(_,i)=>i));assert.deepEqual(rows.map(r=>r.sequence),Array.from({length:512},(_,i)=>i));assert.deepEqual(rows.map(r=>r.occurrence),Array.from({length:512},(_,i)=>i))})
 put('native_total_2097152_inclusive',()=>{const p=setup(),a=capture(p);for(let i=0;i<128;i++)a.record('assessment',assessmentAt(ctx(),p.sink.rows(),16384));assert.equal(p.sink.rows().reduce((n,r)=>n+bytes(json(r)+'\n'),0),2097152)})
 put('immutable_snapshot_fresh_arm_isolation',()=>{const p=nativeTuple(),rows=p.sink.rows(),old=json(rows);assert.ok(Object.isFrozen(rows));assert.ok(Object.isFrozen(rows[0]));assert.ok(Object.isFrozen(rows[0].context));assert.ok(Object.isFrozen(rows[0].detail.canonicalInputsTuple));assert.equal(p.sink.rows()[0],rows[0],'snapshot copies references, not a serialized trace');const q=setup();capture(q).record('inputTuple',ordinary());assert.equal(json(rows),old);assert.notEqual(q.sink.rows()[0],rows[0]);assert.equal(q.latch.first().failed,false)})
 put('actual_binding_consumer_valid_tuple',()=>{const p=nativeTuple();assertNativeEvaluationBinding(p.codec,p.row,[evalFor(p.row,p.d)])})
 put('canonical_depth_64_projection_and_binding',()=>{const p=setup();let v=0;for(let i=0;i<63;i++)v=[v];const d=detail(json(v));capture(p).record('inputTuple',d);const r=p.sink.rows()[0];assert.deepEqual(p.codec.legacyRow(r).detail,d);assertNativeEvaluationBinding(p.codec,r,[evalFor(r,d)])})
 put('actual_arm_success_cleanup_order',()=>{const p=setup(),calls=[];assert.equal(runObserverArm(p.diagnostic,()=>17,()=>calls.push('end'),()=>calls.push('reset'),()=>calls.push('write')),17);assert.deepEqual(calls,['end','reset'])})
 put('codec_original_unknown_key',()=>{for(const mode of ['enumerable','symbol','nonenumerable']){const p=codecOnly(),d=ordinary();if(mode==='enumerable')d.extra=true;else if(mode==='symbol')d[Symbol('extra')]=true;else Object.defineProperty(d,'extra',{value:true,enumerable:false});format(p,()=>p.codec.encodeInputDetail(d),'FORMAT_INVALID')}})
 put('codec_accessor_not_invoked',()=>{const p=codecOnly(),d=ordinary();let gets=0;Object.defineProperty(d,'canonicalInputs',{enumerable:true,get(){gets++;return '[]'}});format(p,()=>p.codec.encodeInputDetail(d),'FORMAT_INVALID');assert.equal(gets,0)})
 put('codec_nonarray_canonical',()=>{const p=codecOnly();format(p,()=>p.codec.encodeInputDetail(detail('{}')),'FORMAT_INVALID')})
 put('codec_malformed_canonical',()=>{const p=codecOnly(),E=thrown(()=>p.codec.encodeInputDetail(detail('[broken')));assert.ok(E instanceof SyntaxError);assert.equal(E.name,'SyntaxError');assert.equal(p.latch.first().error,E);exactThrown(()=>p.codec.encodeInputDetail(ordinary()),E)})
 put('codec_declared_byte_mismatch',()=>{const p=codecOnly();format(p,()=>p.codec.encodeInputDetail({...ordinary(),inputBytes:1}),'FORMAT_INVALID')})
 for(const [id,text] of [['codec_negative_zero_spelling','[-0]'],['codec_unsafe_integer_spelling','[9007199254740993]'],['codec_unnecessary_escape_spelling','["\\u0061"]']])put(id,()=>{const p=codecOnly();format(p,()=>p.codec.encodeInputDetail(detail(text)),'CANONICAL_ROUNDTRIP')})
 put('direct_codec_canonical_16385',()=>{const p=codecOnly();format(p,()=>p.codec.encodeInputDetail(canonicalAt(16385)),'CANONICAL_OVER_BOUND')})
 put('codec_depth_65',()=>{const p=codecOnly();let value=0;for(let i=0;i<64;i++)value=[value];format(p,()=>p.codec.encodeInputDetail(detail(json(value))),'STRUCTURE_OVER_BOUND')})
 const corruptDetail=(edit,code)=>{const p=codecOnly(),n=structuredClone(p.codec.encodeInputDetail(ordinary()));edit(n);format(p,()=>p.codec.decodeInputDetail(frozen(n)),code)}
 put('decoder_wrong_encoding_tag',()=>corruptDetail(n=>n.canonicalInputsEncoding='different','FORMAT_INVALID'))
 put('decoder_unknown_key',()=>corruptDetail(n=>n.extra=true,'FORMAT_INVALID'))
 put('decoder_plain_bounded_tuple',()=>{const p=codecOnly(),d=ordinary(),n=structuredClone(p.codec.encodeInputDetail(d));assert.deepEqual(p.codec.decodeInputDetail(n),d);const value=Array(8191).fill(0),canonical=json(value),large={canonicalInputsEncoding:'native-json-tuple/v1',canonicalInputsTuple:value,inputBytes:bytes(canonical),inputsDigest:digest(canonical)};assert.equal(bytes(canonical),16383);assert.deepEqual(p.codec.decodeInputDetail(large),detail(canonical))})
 put('decoder_declared_byte_mismatch',()=>corruptDetail(n=>n.inputBytes++,'FORMAT_INVALID'))
 put('decoder_nodes_properties_over_bound',()=>{for(const length of [8192,16385]){const p=codecOnly(),d={canonicalInputsEncoding:'native-json-tuple/v1',canonicalInputsTuple:Array(length).fill(0),inputBytes:16384,inputsDigest:'0000000000000000'};format(p,()=>p.codec.decodeInputDetail(d),'STRUCTURE_OVER_BOUND')}})
 put('legacy_historical_schema_not_native',()=>{const p=nativeTuple(),r=structuredClone(p.row);r.schema=LEGACY;format(p,()=>p.codec.legacyRow(frozen(r)),'FORMAT_INVALID')})
 put('legacy_over_physical_row_limit',()=>{const p=codecOnly(),r=frozen(frame(ctx(),'assessment',{pad:'x'.repeat(16384)},[]));format(p,()=>p.codec.legacyRow(r),'FORMAT_INVALID')})
 put('sink_row_16385',()=>{const p=setup(),before=p.sink.rows();const e=originalError(()=>capture(p).record('assessment',assessmentAt(ctx(),before,16385)),ROW);assert.deepEqual(before,[]);assert.equal(p.latch.first().error,e);exactThrown(()=>p.sink.rows(),e)})
 put('sink_canonical_known_no_fit',()=>{for(const accessor of [false,true]){const p=setup();let encoded=0,gets=0;const monitored={...p.codec,encodeInputDetail(d){encoded++;return p.codec.encodeInputDetail(d)}};const sink=createM0FeasibilitySink({latch:p.latch,codec:monitored}),d=canonicalAt(16385);if(accessor)Object.defineProperty(d,'inputBytes',{enumerable:true,get(){gets++;throw new Error('must not inspect declared bytes')}});const e=originalError(()=>sink.capture(ctx()).record('inputTuple',d),ROW);assert.equal(encoded,0);assert.equal(gets,0);assert.equal(p.latch.first().error,e)}})
 put('count_513_preempts_malformed_conversion',()=>{for(const d of [detail('[broken'),canonicalAt(16385)]){const p=setup();let encoded=0;const monitored={...p.codec,encodeInputDetail(x){encoded++;return p.codec.encodeInputDetail(x)}};const sink=createM0FeasibilitySink({latch:p.latch,codec:monitored}),a=sink.capture(ctx());for(let i=0;i<512;i++)a.record('assessment',{i});const prior=sink.rows(),e=originalError(()=>a.record('inputTuple',d),COUNT);assert.equal(encoded,0);assert.equal(prior.length,512);assert.equal(p.latch.first().error,e)}})
 put('total_2097152_then_more',()=>{const p=setup(),a=capture(p);for(let i=0;i<128;i++)a.record('assessment',assessmentAt(ctx(),p.sink.rows(),16384));const prior=p.sink.rows(),e=originalError(()=>a.record('assessment',{}),TOTAL);assert.equal(prior.length,128);assert.equal(prior.reduce((n,r)=>n+bytes(json(r)+'\n'),0),2097152);assert.equal(p.latch.first().error,e)})
 put('consumer_changed_tuple_digest_bytes',()=>{for(const mode of ['tuple','digest']){const p=nativeTuple(),r=structuredClone(p.row);if(mode==='tuple'){r.detail.canonicalInputsTuple[1].b='altered';r.detail.inputBytes=bytes(json(r.detail.canonicalInputsTuple))}else r.detail.inputsDigest='0000000000000000';consumerRefusal(p,frozen(r),[evalFor(p.row,p.d)])}})
 put('consumer_order_duplicate_omission',()=>{for(const mode of ['order','duplicate','omit']){const p=setup(),d=detail(json(['FAMILY','first','second']));capture(p).record('inputTuple',d);const r=structuredClone(p.sink.rows()[0]),t=r.detail.canonicalInputsTuple;if(mode==='order')[t[1],t[2]]=[t[2],t[1]];else if(mode==='duplicate')t.push(t[1]);else t.splice(1,1);r.detail.inputBytes=bytes(json(t));consumerRefusal(p,frozen(r),[evalFor(p.sink.rows()[0],d)])}})
 put('consumer_context_and_source_index',()=>{for(const key of ['issuer','caseSourceIndex','proposalSourceIndex','proposalOccurrence']){const p=nativeTuple(),r=structuredClone(p.row);r.context[key]=typeof r.context[key]==='number'?r.context[key]+1:'different';consumerRefusal(p,frozen(r),[evalFor(p.row,p.d)])}})
 put('consumer_envelope_version_and_extra_key',()=>{for(const mode of ['schema','extra']){const p=nativeTuple(),r=structuredClone(p.row);if(mode==='schema')r.schema=LEGACY;else r.extra=true;format(p,()=>assertNativeEvaluationBinding(p.codec,frozen(r),[evalFor(p.row,p.d)]),'FORMAT_INVALID')}})
 put('latch_falsy_first_values',()=>{for(const first of [undefined,null,false,0,'']){const p=setup(),later=new Error('later'),calls=[];p.latch.record(first);p.latch.record(later);assert.deepEqual(p.latch.first(),{failed:true,error:first});exactThrown(()=>runObserverArm(p.diagnostic,()=>{throw later},()=>calls.push('end'),()=>calls.push('reset'),()=>calls.push('write')),first);assert.deepEqual(calls,['end','reset'])}})
 put('native_E_swallowed_body_paths',()=>{for(const laterFailure of [false,true]){const p=setup(),F=new Error('later body');let E;const calls=[];const actual=thrown(()=>runObserverArm(p.diagnostic,()=>{E=thrown(()=>p.codec.encodeInputDetail({...ordinary(),extra:true}));if(laterFailure)throw F;return 17},()=>calls.push('end'),()=>calls.push('reset'),()=>calls.push('write')));assert.equal(actual,E);assert.ok(E instanceof NativeObserverFormatError);assert.equal(E.code,'FORMAT_INVALID');assert.deepEqual(calls,['end','reset'])}})
 put('row_E_swallowed_body_paths',()=>{for(const laterFailure of [false,true]){const p=setup(),F=new Error('later');let E;const calls=[];const actual=thrown(()=>runObserverArm(p.diagnostic,()=>{E=rowRefusal(p);if(laterFailure)throw F;return 17},()=>calls.push('end'),()=>calls.push('reset'),()=>calls.push('write')));assert.equal(actual,E);assert.deepEqual(calls,['write','end','reset'])}})
 put('first_E_survives_end_reset_writer',()=>{for(const resource of [false,true]){const p=setup(),E=resource?rowRefusal(p):format(p,()=>p.codec.encodeInputDetail({...ordinary(),extra:true}),'FORMAT_INVALID'),calls=[];exactThrown(()=>runObserverArm(p.diagnostic,()=>99,()=>{calls.push('end');throw new Error('end')},()=>{calls.push('reset');throw new Error('reset')},()=>{calls.push('write');throw new Error('writer')}),E);assert.deepEqual(calls,resource?['write','end','reset']:['end','reset'])}})
 put('cleanup_new_E_swallowed',()=>{for(const phase of ['end','reset']){const p=setup(),calls=[];let E;const callback=name=>()=>{calls.push(name);if(name===phase){E=thrown(()=>p.codec.encodeInputDetail({...ordinary(),extra:true}))}else if(name==='reset'&&phase==='end')throw new Error('later reset')};const actual=thrown(()=>runObserverArm(p.diagnostic,()=>17,callback('end'),callback('reset'),()=>calls.push('write')));assert.equal(actual,E);assert.ok(E instanceof NativeObserverFormatError);assert.deepEqual(calls,['end','reset'])}})
 put('ordinary_empty_latch_cleanup_precedence',()=>{for(const mode of ['reset','reset-undefined','end','body','body-undefined']){const p=setup(),body=mode==='body-undefined'?undefined:new Error('body'),end=new Error('end'),reset=mode==='reset-undefined'?undefined:new Error('reset'),calls=[];const expected=mode.startsWith('reset')?reset:mode==='end'?end:body;exactThrown(()=>runObserverArm(p.diagnostic,()=>{throw body},()=>{calls.push('end');if(mode==='end'||mode.startsWith('reset'))throw end},()=>{calls.push('reset');if(mode.startsWith('reset'))throw reset},()=>calls.push('write')),expected);assert.deepEqual(calls,['end','reset']);assert.equal(p.latch.first().failed,false)}})
 put('sticky_rows_and_later_record',()=>{const p=setup(),a=capture(p),E=originalError(()=>a.record('assessment',assessmentAt(ctx(),[],16385)),ROW);exactThrown(()=>p.sink.rows(),E);exactThrown(()=>a.record('assessment',{}),E);exactThrown(()=>p.codec.encodeInputDetail(ordinary()),E);exactThrown(()=>p.codec.legacyRow(frozen(frame(ctx(),'assessment',{},[]))),E)})
 put('snapshot_failure_no_record',()=>{const p=setup(),E=new Error('snapshot failure');let recorded=0;const a=p.diagnostic.wrap({context:frozen(ctx()),record(){recorded++}},()=>{throw E});exactThrown(()=>a.record('assessment',{}),E);assert.equal(recorded,0);assert.equal(p.latch.first().error,E);exactThrown(()=>p.diagnostic.throwIfFailed(),E)})
 put('native_row_diagnostic_available_physical',()=>{const p=setup(),a=wrap(p);a.record('inputTuple',ordinary());const prior=p.sink.rows(),bad=inputAt(p.codec,ctx(),prior,16385),E=originalError(()=>a.record('inputTuple',bad.d),ROW),m=available(p,E);assert.equal(m.availability,'available');assert.equal(m.rowBytes,bytes(json(bad.row)+'\n'));assert.equal(m.detailBytes,bytes(json(bad.native)));assert.equal(m.contextBytes,bytes(json(ctx())));assert.equal(m.sequence,1);assert.equal(m.occurrence,1);assert.equal(m.priorRowCount,1);assert.equal(m.canonicalInputBytes,bad.d.inputBytes);assert.equal(m.family,'PREFERRED_GENRE_OPPORTUNITY');exactThrown(()=>p.sink.rows(),E)})
 put('assessment_diagnostic_native_predecessor',()=>{const p=setup(),a=wrap(p),d=ordinary();a.record('inputTuple',d);a.record('inputTuple',d);const prior=p.sink.rows(),bad=assessmentAt(ctx(),prior,16385),E=originalError(()=>a.record('assessment',bad),ROW),m=available(p,E);assert.equal(m.availability,'available');assert.equal(m.sequence,2);assert.equal(m.priorRowCount,2);assert.equal(m.canonicalInputBytes,d.inputBytes);assert.equal(m.family,'PREFERRED_GENRE_OPPORTUNITY');assert.equal(m.occurrence,0)})
 put('native_first_no_row_emission',()=>{const p=setup(),a=capture(p),calls=[];let priorReads=0,recordCalls=0,E;const wrapped=p.diagnostic.wrap({context:a.context,record(k,d){recordCalls++;return a.record(k,d)}},()=>{priorReads++;return p.sink.rows()});const F=new Error(ROW);const actual=thrown(()=>runObserverArm(p.diagnostic,()=>{E=format(p,()=>p.codec.encodeInputDetail({...ordinary(),extra:true}),'FORMAT_INVALID');exactThrown(()=>wrapped.record('assessment',{}),E);throw F},()=>calls.push('end'),()=>calls.push('reset'),()=>calls.push('write')));assert.equal(actual,E);assert.equal(priorReads,0);assert.equal(recordCalls,0);assert.deepEqual(calls,['end','reset']);exactThrown(()=>p.diagnostic.throwIfFailed(),E)})
 put('diagnostic_output_4096_bound',()=>{const p=setup(),c=ctx({caseKey:'x'.repeat(4200)}),prior=p.sink.rows(),d=assessmentAt(c,prior,16385),E=originalError(()=>wrap(p,c).record('assessment',d),ROW),m=available(p,E);assert.equal(m.availability,'unavailable');assert.equal(m.reason,'DIAGNOSTIC_OUTPUT_OVER_BOUND');assert.ok(!Object.hasOwn(m,'context'));assert.ok(!json(m).includes('x'.repeat(100)))})
 put('diagnostic_writer_failure_consumes',()=>{const p=setup(),E=rowRefusal(p);let writes=0;p.diagnostic.emitFirst(()=>{writes++;throw new Error('writer')});p.diagnostic.emitFirst(()=>writes++);assert.equal(writes,1);exactThrown(()=>p.diagnostic.throwIfFailed(),E)})
 put('diagnostic_healthy_bypass_refused',()=>{for(const method of ['encodeInputDetailForDiagnostic','decodeInputDetailForDiagnostic']){const p=codecOnly(),n=p.codec.encodeInputDetail(ordinary());format(p,()=>p.codec[method](method.startsWith('encode')?ordinary():n),'FORMAT_INVALID')}})
 put('diagnostic_eligible_core_same_E',()=>{const p=codecOnly(),d=ordinary(),n=p.codec.encodeInputDetail(d),E=new Error(ROW);p.latch.record(E);assert.deepEqual(p.codec.encodeInputDetailForDiagnostic(d),n);assert.deepEqual(p.codec.decodeInputDetailForDiagnostic(n),d);exactThrown(()=>p.codec.encodeInputDetail(d),E);exactThrown(()=>p.codec.decodeInputDetail(n),E);const F=thrown(()=>p.codec.encodeInputDetailForDiagnostic(detail('[broken')));assert.ok(F instanceof SyntaxError);assert.equal(p.latch.first().error,E)})
 put('diagnostic_native_first_bypass_refused',()=>{const p=codecOnly(),d=ordinary(),n=p.codec.encodeInputDetail(d),E=format(p,()=>p.codec.encodeInputDetail({...ordinary(),extra:true}),'FORMAT_INVALID');for(const [method,value] of [['encodeInputDetailForDiagnostic',d],['decodeInputDetailForDiagnostic',n]]){const F=thrown(()=>p.codec[method](value));assert.ok(F instanceof NativeObserverFormatError);assert.equal(F.code,'FORMAT_INVALID');assert.equal(p.latch.first().error,E)}})
 put('capture_invalid_context_sticky',()=>{const p=setup(),E=originalError(()=>p.sink.capture(ctx({week:-1})),'M0 feasibility invalid context');assert.equal(p.latch.first().error,E);exactThrown(()=>p.sink.rows(),E)})
 put('capture_native_serialization_identity',()=>{const p=setup(),c=ctx();c.self=c;const E=thrown(()=>p.sink.capture(c));assert.ok(E instanceof TypeError);assert.equal(E.name,'TypeError');assert.match(E.message,/circular/i);assert.equal(p.latch.first().error,E);exactThrown(()=>p.sink.throwIfFailed(),E)})
 put('capture_after_sticky_before_getter',()=>{const p=setup(),E=originalError(()=>p.sink.capture(ctx({week:-1})),'M0 feasibility invalid context');let gets=0;const c=ctx();Object.defineProperty(c,'week',{get(){gets++;throw new Error('late getter')}});exactThrown(()=>p.sink.capture(c),E);assert.equal(gets,0)})

 assert.equal(tests.size,NATIVE_CASES.length,'authored roster has exactly one implementation per case')
 for(const test of NATIVE_CASES){assert.ok(tests.has(test.id));tests.get(test.id)();results.push({...test,verdict:test.expected==='GREEN'?'ACCEPT_POSITIVE':'ACCEPT_SPECIFIC_REFUSAL'})}
 assert.equal(orderingPacket.cases.length,18);const orderingResults=runOrderingSourceControls(orderingPacket)
 assert.deepEqual(orderingResults,orderingPacket.cases.map(({id,expected})=>({id,expected})))
 for(const test of orderingPacket.cases)results.push({id:test.id,expected:test.expected,predicate:test.assertion??'original synthetic source schema GREEN',verdict:test.expected==='GREEN'?'ACCEPT_POSITIVE':'ACCEPT_SPECIFIC_REFUSAL'})
 const positiveCount=results.filter(r=>r.expected==='GREEN').length,specificNegativeCount=results.length-positiveCount
 return {schema:'1370-native-observer-independent-controls-result/v1',status:'PURE_NATIVE_OBSERVER_CODEC_SINK_AND_AFFECTED_CONSUMERS_COMPLETED_UNADOPTED',results,caseCount:results.length,positiveCount,specificNegativeCount,originalOrderingCases:18,originalParserCasesReplayed:0,historicalObserverControlsReplayed:0,game:false,originalM0ReadOrWritten:false,executionAuthorization:false}
}
