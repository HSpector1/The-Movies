// Pure dependency-injected controls; authoring does not execute this module.
import assert from 'node:assert/strict'

const ROW_ERROR = 'M0 feasibility row byte bound exceeded'
const SCHEMA = '1370-m0-observer-row-diagnostic/v1'
const bytes = value => Buffer.byteLength(value, 'utf8')
const context = changes => ({era:'M0',week:196,caseKey:'case',caseOccurrence:0,
  caseSourceIndex:0,subject:'person',issuer:'studio',proposalKey:'proposal',
  proposalOccurrence:0,proposalSourceIndex:0,phase:'authorCandidate',candidateOrdinal:0,...changes})
const identity = (c,kind) => JSON.stringify([c.week,c.caseKey,c.caseOccurrence,c.proposalKey,
  c.proposalOccurrence,c.phase,c.candidateOrdinal??null,c.submittedOrdinal??null,c.survivorOrdinal??null,kind])
const tuple = canonical => ({canonicalInputs:canonical,inputBytes:bytes(canonical),inputsDigest:'digest'})
const ordinaryTuple = () => tuple(JSON.stringify(['APPEARANCE_COUNT','quote"\\\n☃']))
const row = (c,kind,detail,rows) => ({schema:'c0-m0-feasibility/v1',sequence:rows.length,
  occurrence:rows.filter(r=>identity(r.context,r.kind)===identity(c,kind)).length,context:c,kind,detail})
function detailAt(c,kind,rows,target,base={}) {
  const detail={...base,padding:''}
  const overhead=bytes(JSON.stringify(row(c,kind,detail,rows))+'\n')
  assert.ok(target>=overhead,'boundary fixture has nonnegative exact padding')
  detail.padding='x'.repeat(target-overhead)
  assert.equal(bytes(JSON.stringify(row(c,kind,detail,rows))+'\n'),target)
  return detail
}
function canonicalAt(target) {
  const overhead=bytes(JSON.stringify(['APPEARANCE_COUNT','']))
  const value=JSON.stringify(['APPEARANCE_COUNT','x'.repeat(target-overhead)])
  assert.equal(bytes(value),target);return value
}
const availableKeys=['availability','canonicalInputBytes','canonicalInputUnavailableReason',
  'context','contextBytes','detailBytes','error','family','familyUnavailableReason','kind',
  'occurrence','predicate','priorRowCount','rowBytes','rowLimit','schema','sequence'].sort()
const unavailableKeys=['availability','error','predicate','reason','rowLimit','schema'].sort()

export const CASES = [
  ['ordinary_exact_row_parity','GREEN','same authoritative rows; no diagnostic'],
  ['immutable_exact_frozen_context','GREEN','capture immutable; exact underlying context'],
  ['authoritative_row_16384','GREEN','original inclusive expanded-row boundary'],
  ['native_identity_source_indices_and_ordinals','GREEN','original ten-field occurrence identity'],
  ['reset_preserves_prior_line_and_new_sink_binding','GREEN','scratch reset; prior evidence immutable'],
  ['shared_arm_success_and_cleanup_order','GREEN','actual helper preserves body value; end then reset'],
  ['row_16385_input_tuple','RED','same original row-byte Error; exact diagnostic'],
  ['unicode_nonzero_sequence_occurrence','RED','native escaped UTF8 bytes; actual prior rows'],
  ['different_ordinal_refused_occurrence_zero','RED','native identity partitions ordinal'],
  ['assessment_exact_context_family','RED','actual preceding same-context inputTuple'],
  ['assessment_missing_predecessor','RED','CANONICAL_INPUT_MISSING'],
  ['assessment_wrong_context_predecessor','RED','CANONICAL_INPUT_MISSING'],
  ['input_tuple_missing_canonical','RED','CANONICAL_INPUT_MISSING'],
  ['canonical_malformed','RED','CANONICAL_INPUT_MALFORMED'],
  ['canonical_invalid_family','RED','FAMILY_UNAVAILABLE'],
  ['canonical_65536_inclusive','RED','bounded canonical parsing remains available'],
  ['canonical_65537_refused','RED','CANONICAL_INPUT_OVER_BOUND; no unbounded reconstruction'],
  ['canonical_declared_byte_mismatch','RED','CANONICAL_INPUT_BYTE_MISMATCH'],
  ['reconstruction_serialization_failure','RED','FAILED_ROW_UNSUPPORTED; stateful toJSON never reentered'],
  ['detail_getter_not_reentered','RED','FAILED_ROW_UNSUPPORTED; accessor invoked only by original witness'],
  ['context_extra_payload_not_emitted','RED','CONTEXT_UNSUPPORTED; no raw extra context payload'],
  ['context_65536_inclusive','RED','inclusive context preflight then bounded emission refusal'],
  ['context_65537_refused','RED','CONTEXT_OVER_BOUND before row reconstruction'],
  ['huge_context_no_raw_payload','RED','CONTEXT_OVER_BOUND; bounded scalar unavailable metadata'],
  ['huge_failed_detail_no_raw_payload','RED','FAILED_ROW_OVER_BOUND; no unbounded diagnostic reconstruction'],
  ['reconstruction_524288_inclusive','RED','exact bounded native row reconstruction; original row refusal unchanged'],
  ['reconstruction_524289_refused','RED','FAILED_ROW_OVER_BOUND at complete row including newline'],
  ['structural_node_and_depth_bounds','RED','FAILED_ROW_OVER_BOUND for bounded over-limit node and depth fixtures'],
  ['provider_exception','RED','DIAGNOSTIC_UNAVAILABLE; original Error wins'],
  ['provider_nonarray','RED','PRIOR_ROWS_UNAVAILABLE'],
  ['provider_prior_rows_count_513','RED','PRIOR_ROWS_UNAVAILABLE; bounded provider cardinality'],
  ['provider_prior_rows_over_total_bound','RED','PRIOR_ROWS_UNAVAILABLE'],
  ['prior_rows_exact_original_total_bound','RED','original stream accounting accepts exact 2MiB prior rows'],
  ['diagnostic_output_over_4096','RED','DIAGNOSTIC_OUTPUT_OVER_BOUND'],
  ['swallowed_row_failure_then_return','RED','throwIfFailed rethrows exact original Error'],
  ['swallowed_row_failure_then_unrelated_F','RED','sticky original E wins over later F'],
  ['row_error_survives_end_failure','RED','actual helper preserves E; reset still attempted'],
  ['row_error_survives_reset_failure','RED','actual helper preserves E after factory reset'],
  ['row_error_survives_both_cleanup_failures','RED','actual helper preserves E; end then reset attempted'],
  ['row_error_survives_writer_failure','RED','actual helper preserves E and performs both cleanup calls'],
  ['ordinary_body_error_and_cleanup_precedence','RED','actual helper keeps original nested fatal cleanup precedence'],
  ['subsequent_record_cannot_resume','RED','same first Error; no additional authoritative call'],
  ['emitter_failure_consumes_first_emission','RED','same original Error; one invocation only'],
  ['original_count_513','RED','original row-count Error; no row-byte diagnostic'],
  ['original_total_2097152_then_more','RED','original total-byte Error; no row-byte diagnostic'],
  ['unrelated_error_unchanged','RED','unrelated original Error; no diagnostic reinterpretation'],
  ['original_reentrant_error_unchanged','RED','original reentrant Error; no diagnostic reinterpretation'],
].map(([id,expected,predicate])=>({id,expected,predicate}))

export function runObserverRowDiagnosticControls({createObserverRowDiagnostic,createM0FeasibilitySink,runObserverArm}) {
  assert.equal(typeof createObserverRowDiagnostic,'function')
  assert.equal(typeof createM0FeasibilitySink,'function')
  assert.equal(typeof runObserverArm,'function','tests require the SAME exported helper used by the actual template')
  const results=[]
  function rig(c=context(),provider) {
    const sink=createM0FeasibilitySink(),original=sink.capture(c),diagnostic=createObserverRowDiagnostic()
    let originalError=null,attempts=0
    const watched=Object.freeze({context:original.context,record(kind,detail){
      attempts++;try{return original.record(kind,detail)}catch(e){originalError=e;throw e}
    }})
    const capture=diagnostic.wrap(watched,provider??(()=>sink.rows()))
    return {sink,original,diagnostic,capture,error:()=>originalError,attempts:()=>attempts}
  }
  function refused(r,kind,detail,message=ROW_ERROR) {
    let observed
    assert.throws(()=>r.capture.record(kind,detail),e=>{
      observed=e;return e===r.error()&&e.constructor===Error&&e.message===message
    },'only the intended original authoritative Error satisfies this refusal')
    return observed
  }
  function sticky(r,e) {
    assert.throws(()=>r.diagnostic.throwIfFailed(),x=>x===e,'same original Error must remain sticky')
  }
  function line(r) {
    const output=[];r.diagnostic.emitFirst(v=>output.push(v))
    assert.equal(output.length,1);assert.equal(typeof output[0],'string')
    assert.ok(output[0].endsWith('\n'));assert.ok(bytes(output[0])<=4096)
    const value=JSON.parse(output[0]);assert.equal(value.schema,SCHEMA)
    assert.equal(value.predicate,'ROW_BYTE_CAP');assert.equal(value.rowLimit,16384)
    assert.deepEqual(value.error,{name:'Error',message:ROW_ERROR})
    const second=[];r.diagnostic.emitFirst(v=>second.push(v));assert.deepEqual(second,[])
    return {value,text:output[0]}
  }
  function available(r,kind,detail,expectedRow,expect={}) {
    const {value,text}=line(r)
    assert.deepEqual(Object.keys(value).sort(),availableKeys);assert.equal(value.availability,'available')
    assert.deepEqual(value.context,expectedRow.context);assert.equal(value.sequence,expectedRow.sequence)
    assert.equal(value.occurrence,expectedRow.occurrence);assert.equal(value.priorRowCount,expectedRow.sequence)
    assert.equal(value.kind,kind);assert.equal(value.rowBytes,bytes(JSON.stringify(expectedRow)+'\n'))
    assert.equal(value.detailBytes,bytes(JSON.stringify(detail)));assert.equal(value.contextBytes,bytes(JSON.stringify(expectedRow.context)))
    for(const [k,v] of Object.entries(expect))assert.deepEqual(value[k],v,k)
    assert.equal(Object.hasOwn(value,'detail'),false);assert.equal(Object.hasOwn(value,'canonicalInputs'),false)
    assert.equal(text.includes('PAYLOAD_MUST_NOT_APPEAR'),false)
    return value
  }
  function unavailable(r,reason) {
    const {value}=line(r);assert.deepEqual(Object.keys(value).sort(),unavailableKeys)
    assert.equal(value.availability,'unavailable');assert.equal(value.reason,reason)
  }
  function rowFailure(kind='inputTuple',base=ordinaryTuple(),c=context(),provider) {
    const r=rig(c,provider),rows=r.sink.rows(),detail=detailAt(r.capture.context,kind,rows,16385,base)
    const expectedRow=row(r.capture.context,kind,detail,rows),e=refused(r,kind,detail)
    assert.deepEqual(r.sink.rows(),rows);sticky(r,e);return {r,detail,expectedRow,e}
  }
  function familyCase(base,expect) {
    const f=rowFailure('inputTuple',base);available(f.r,'inputTuple',f.detail,f.expectedRow,expect);sticky(f.r,f.e)
  }
  function test(id,run) {
    const spec=CASES.find(x=>x.id===id);assert.ok(spec);assert.ok(!results.some(x=>x.id===id))
    run();results.push({...spec,verdict:spec.expected==='GREEN'?'ACCEPT_POSITIVE':'ACCEPT_SPECIFIC_REFUSAL'})
  }

  test('ordinary_exact_row_parity',()=>{
    const plain=createM0FeasibilitySink(),p=plain.capture(context()),r=rig()
    for(const [kind,detail] of [['inputTuple',ordinaryTuple()],['assessment',{classification:'POSSIBLE',locals:{x:1}}],['inputTuple',ordinaryTuple()]]){
      p.record(kind,detail);r.capture.record(kind,detail)
    }
    assert.deepEqual(r.sink.rows(),plain.rows());r.diagnostic.throwIfFailed()
    const out=[];r.diagnostic.emitFirst(v=>out.push(v));assert.deepEqual(out,[])
  })
  test('immutable_exact_frozen_context',()=>{
    const c=context(),r=rig(c);assert.ok(Object.isFrozen(r.capture))
    assert.equal(r.capture.context,r.original.context);assert.ok(Object.isFrozen(r.capture.context))
    c.subject='changed';r.capture.record('assessment',{v:1});assert.equal(r.sink.rows()[0].context.subject,'person')
  })
  test('authoritative_row_16384',()=>{
    const r=rig(),detail=detailAt(r.capture.context,'inputTuple',[],16384,ordinaryTuple())
    r.capture.record('inputTuple',detail);assert.equal(bytes(JSON.stringify(r.sink.rows()[0])+'\n'),16384)
    r.diagnostic.throwIfFailed();const out=[];r.diagnostic.emitFirst(v=>out.push(v));assert.deepEqual(out,[])
  })
  test('native_identity_source_indices_and_ordinals',()=>{
    const sink=createM0FeasibilitySink(),d=createObserverRowDiagnostic()
    const cs=[context(),context({caseSourceIndex:9,proposalSourceIndex:8,issuer:'other',era:'H'}),
      context({candidateOrdinal:1}),context({caseOccurrence:1}),context({proposalOccurrence:1}),
      context({phase:'freezeProposal',candidateOrdinal:undefined,submittedOrdinal:0}),
      context({phase:'chooserBand',candidateOrdinal:undefined,survivorOrdinal:0})]
    for(const c of cs)d.wrap(sink.capture(c),()=>sink.rows()).record('assessment',{v:'☃"\\\n'})
    assert.deepEqual(sink.rows().map(r=>r.occurrence),[0,1,0,0,0,0,0])
    assert.deepEqual(sink.rows().map(r=>r.sequence),[0,1,2,3,4,5,6]);d.throwIfFailed()
  })
  test('reset_preserves_prior_line_and_new_sink_binding',()=>{
    const f=rowFailure(),saved=line(f.r).text;f.r.diagnostic.reset();f.r.diagnostic.throwIfFailed()
    const newSink=createM0FeasibilitySink(),cap=f.r.diagnostic.wrap(newSink.capture(context({week:208})),()=>newSink.rows())
    cap.record('assessment',{v:1});assert.equal(newSink.rows().length,1);assert.equal(f.r.sink.rows().length,0)
    const out=[];f.r.diagnostic.emitFirst(v=>out.push(v));assert.deepEqual(out,[])
    assert.equal(JSON.parse(saved).rowBytes,16385);assert.equal(JSON.parse(saved).context.week,196)
  })
  test('shared_arm_success_and_cleanup_order',()=>{
    const r=rig(),events=[],result=Object.freeze({bodyValue:7})
    const actual=runObserverArm(r.diagnostic,()=>{events.push('body');r.capture.record('assessment',{v:1});return result},
      ()=>events.push('end'),()=>{events.push('reset');r.diagnostic.reset()},()=>events.push('emit'))
    assert.equal(actual,result);assert.deepEqual(events,['body','end','reset'])
    assert.equal(r.sink.rows().length,1);r.diagnostic.throwIfFailed()
  })
  test('row_16385_input_tuple',()=>{
    const f=rowFailure();available(f.r,'inputTuple',f.detail,f.expectedRow,{family:'APPEARANCE_COUNT',
      familyUnavailableReason:null,canonicalInputBytes:bytes(f.detail.canonicalInputs),canonicalInputUnavailableReason:null})
  })
  test('unicode_nonzero_sequence_occurrence',()=>{
    const r=rig(context({caseKey:'☃"\\\n',proposalKey:'é🙂'}))
    r.capture.record('inputTuple',ordinaryTuple());r.capture.record('inputTuple',ordinaryTuple())
    const before=r.sink.rows(),detail=detailAt(r.capture.context,'inputTuple',before,16385,ordinaryTuple())
    const er=row(r.capture.context,'inputTuple',detail,before),e=refused(r,'inputTuple',detail)
    assert.equal(er.sequence,2);assert.equal(er.occurrence,2);available(r,'inputTuple',detail,er,{family:'APPEARANCE_COUNT'});sticky(r,e)
  })
  test('different_ordinal_refused_occurrence_zero',()=>{
    const r=rig();r.capture.record('inputTuple',ordinaryTuple())
    const original=r.sink.capture(context({candidateOrdinal:1})),watched={context:original.context,record(k,v){try{original.record(k,v)}catch(e){r.latest=e;throw e}}}
    const cap=r.diagnostic.wrap(watched,()=>r.sink.rows()),before=r.sink.rows(),detail=detailAt(cap.context,'inputTuple',before,16385,ordinaryTuple())
    let e;assert.throws(()=>cap.record('inputTuple',detail),x=>{e=x;return x===r.latest&&x.constructor===Error&&x.message===ROW_ERROR})
    available(r,'inputTuple',detail,row(cap.context,'inputTuple',detail,before),{occurrence:0,sequence:1});sticky(r,e)
  })
  test('assessment_exact_context_family',()=>{
    const r=rig();r.capture.record('inputTuple',ordinaryTuple())
    const before=r.sink.rows(),detail=detailAt(r.capture.context,'assessment',before,16385,{classification:'POSSIBLE',locals:{}})
    const e=refused(r,'assessment',detail);available(r,'assessment',detail,row(r.capture.context,'assessment',detail,before),
      {family:'APPEARANCE_COUNT',canonicalInputBytes:bytes(ordinaryTuple().canonicalInputs),familyUnavailableReason:null,canonicalInputUnavailableReason:null});sticky(r,e)
  })
  test('assessment_missing_predecessor',()=>{
    const f=rowFailure('assessment',{classification:'POSSIBLE'});available(f.r,'assessment',f.detail,f.expectedRow,
      {family:null,familyUnavailableReason:'CANONICAL_INPUT_MISSING',canonicalInputBytes:null,canonicalInputUnavailableReason:'CANONICAL_INPUT_MISSING'})
  })
  test('assessment_wrong_context_predecessor',()=>{
    const r=rig();r.sink.capture(context({caseSourceIndex:99})).record('inputTuple',ordinaryTuple())
    const before=r.sink.rows(),detail=detailAt(r.capture.context,'assessment',before,16385,{classification:'POSSIBLE'});refused(r,'assessment',detail)
    available(r,'assessment',detail,row(r.capture.context,'assessment',detail,before),{family:null,familyUnavailableReason:'CANONICAL_INPUT_MISSING'})
  })
  test('input_tuple_missing_canonical',()=>familyCase({inputsDigest:'digest'},
    {family:null,familyUnavailableReason:'CANONICAL_INPUT_MISSING',canonicalInputBytes:null,canonicalInputUnavailableReason:'CANONICAL_INPUT_MISSING'}))
  test('canonical_malformed',()=>familyCase(tuple('{'),
    {family:null,familyUnavailableReason:'CANONICAL_INPUT_MALFORMED',canonicalInputBytes:1,canonicalInputUnavailableReason:null}))
  test('canonical_invalid_family',()=>familyCase(tuple('{}'),
    {family:null,familyUnavailableReason:'FAMILY_UNAVAILABLE',canonicalInputBytes:2,canonicalInputUnavailableReason:null}))
  test('canonical_65536_inclusive',()=>{
    const r=rig(),detail=tuple(canonicalAt(65536)),er=row(r.capture.context,'inputTuple',detail,[]),e=refused(r,'inputTuple',detail)
    available(r,'inputTuple',detail,er,{family:'APPEARANCE_COUNT',familyUnavailableReason:null,canonicalInputBytes:65536,canonicalInputUnavailableReason:null});sticky(r,e)
  })
  test('canonical_65537_refused',()=>{
    const r=rig(),detail=tuple(canonicalAt(65537)),e=refused(r,'inputTuple',detail)
    unavailable(r,'CANONICAL_INPUT_OVER_BOUND');sticky(r,e)
  })
  test('canonical_declared_byte_mismatch',()=>familyCase({...ordinaryTuple(),inputBytes:1},
    {family:null,familyUnavailableReason:'CANONICAL_INPUT_BYTE_MISMATCH',canonicalInputBytes:null,canonicalInputUnavailableReason:'CANONICAL_INPUT_BYTE_MISMATCH'}))
  test('reconstruction_serialization_failure',()=>{
    let calls=0;const detail={toJSON(){calls++;if(calls===1)return {v:'x'.repeat(17000)};throw new Error('diagnostic serialization fault')}}
    const r=rig(),e=refused(r,'inputTuple',detail);unavailable(r,'FAILED_ROW_UNSUPPORTED');assert.equal(calls,1);sticky(r,e)
  })
  test('detail_getter_not_reentered',()=>{
    let calls=0;const detail={get canonicalInputs(){calls++;return ordinaryTuple().canonicalInputs},inputBytes:bytes(ordinaryTuple().canonicalInputs),padding:'x'.repeat(17000)}
    const r=rig(),e=refused(r,'inputTuple',detail);unavailable(r,'FAILED_ROW_UNSUPPORTED');assert.equal(calls,1);sticky(r,e)
  })
  test('context_extra_payload_not_emitted',()=>{
    const f=rowFailure('inputTuple',ordinaryTuple(),context({extraTuple:['PAYLOAD_MUST_NOT_APPEAR',1,2]}))
    const {value,text}=line(f.r);assert.deepEqual(Object.keys(value).sort(),unavailableKeys)
    assert.equal(value.availability,'unavailable');assert.equal(value.reason,'CONTEXT_UNSUPPORTED')
    assert.equal(text.includes('PAYLOAD_MUST_NOT_APPEAR'),false);assert.equal(text.includes('extraTuple'),false);sticky(f.r,f.e)
  })
  function contextAt(target) {
    const c=context({caseKey:''}),overhead=bytes(JSON.stringify(c));c.caseKey='x'.repeat(target-overhead)
    assert.equal(bytes(JSON.stringify(c)),target);return c
  }
  test('context_65536_inclusive',()=>{
    const r=rig(contextAt(65536)),e=refused(r,'inputTuple',ordinaryTuple())
    assert.equal(bytes(JSON.stringify(r.capture.context)),65536)
    unavailable(r,'DIAGNOSTIC_OUTPUT_OVER_BOUND');sticky(r,e)
  })
  test('context_65537_refused',()=>{
    const r=rig(contextAt(65537)),e=refused(r,'inputTuple',ordinaryTuple())
    assert.equal(bytes(JSON.stringify(r.capture.context)),65537)
    unavailable(r,'CONTEXT_OVER_BOUND');sticky(r,e)
  })
  test('huge_context_no_raw_payload',()=>{
    const r=rig(context({caseKey:'PAYLOAD_MUST_NOT_APPEAR'+'x'.repeat(1048576)})),e=refused(r,'inputTuple',ordinaryTuple())
    const {value,text}=line(r);assert.deepEqual(Object.keys(value).sort(),unavailableKeys)
    assert.equal(value.reason,'CONTEXT_OVER_BOUND');assert.equal(text.includes('PAYLOAD_MUST_NOT_APPEAR'),false);sticky(r,e)
  })
  test('huge_failed_detail_no_raw_payload',()=>{
    const r=rig(),e=refused(r,'inputTuple',{...ordinaryTuple(),padding:'PAYLOAD_MUST_NOT_APPEAR'+'x'.repeat(1048576)})
    const {value,text}=line(r);assert.deepEqual(Object.keys(value).sort(),unavailableKeys)
    assert.equal(value.reason,'FAILED_ROW_OVER_BOUND');assert.equal(text.includes('PAYLOAD_MUST_NOT_APPEAR'),false);sticky(r,e)
  })
  function largeBoundedDetail(c,target) {
    const detail=detailAt(c,'inputTuple',[],target,{...ordinaryTuple(),chunks:Array(8).fill('x'.repeat(60000))})
    assert.ok(detail.padding.length<=65536);assert.ok(detail.chunks.every(s=>s.length<=65536))
    return detail
  }
  test('reconstruction_524288_inclusive',()=>{
    const r=rig(),detail=largeBoundedDetail(r.capture.context,524288),e=refused(r,'inputTuple',detail)
    available(r,'inputTuple',detail,row(r.capture.context,'inputTuple',detail,[]),{rowBytes:524288,family:'APPEARANCE_COUNT'});sticky(r,e)
  })
  test('reconstruction_524289_refused',()=>{
    const r=rig(),detail=largeBoundedDetail(r.capture.context,524289),e=refused(r,'inputTuple',detail)
    unavailable(r,'FAILED_ROW_OVER_BOUND');sticky(r,e)
  })
  test('structural_node_and_depth_bounds',()=>{
    let nested=0;for(let i=0;i<80;i++)nested={child:nested}
    for(const detail of [{values:Array(16385).fill(0)},{nested,padding:'x'.repeat(17000)}]){
      const r=rig(),e=refused(r,'inputTuple',detail);unavailable(r,'FAILED_ROW_OVER_BOUND');sticky(r,e)
    }
  })
  test('provider_exception',()=>{const f=rowFailure('inputTuple',ordinaryTuple(),context(),()=>{throw new Error('provider fault')});unavailable(f.r,'DIAGNOSTIC_UNAVAILABLE');sticky(f.r,f.e)})
  test('provider_nonarray',()=>{const f=rowFailure('inputTuple',ordinaryTuple(),context(),()=>({rows:[]}));unavailable(f.r,'PRIOR_ROWS_UNAVAILABLE')})
  test('provider_prior_rows_count_513',()=>{
    const invalid=Array.from({length:513},(_,i)=>({schema:'c0-m0-feasibility/v1',sequence:i,
      occurrence:i,context:context(),kind:'assessment',detail:{v:i}}))
    const f=rowFailure('inputTuple',ordinaryTuple(),context(),()=>invalid);unavailable(f.r,'PRIOR_ROWS_UNAVAILABLE')
  })
  test('provider_prior_rows_over_total_bound',()=>{
    const tooLarge=Array.from({length:512},(_,i)=>({schema:'c0-m0-feasibility/v1',sequence:i,
      occurrence:i,context:context(),kind:'assessment',detail:{v:'x'.repeat(4200)}}))
    assert.ok(bytes(JSON.stringify(tooLarge))>2097152)
    const f=rowFailure('inputTuple',ordinaryTuple(),context(),()=>tooLarge);unavailable(f.r,'PRIOR_ROWS_UNAVAILABLE')
  })
  test('prior_rows_exact_original_total_bound',()=>{
    const r=rig();for(let i=0;i<128;i++){
      const prior=r.sink.rows();r.capture.record('assessment',detailAt(r.capture.context,'assessment',prior,16384,{v:i}))
    }
    const prior=r.sink.rows();assert.equal(prior.reduce((n,r)=>n+bytes(JSON.stringify(r)+'\n'),0),2097152)
    const detail=detailAt(r.capture.context,'inputTuple',prior,16385,ordinaryTuple()),e=refused(r,'inputTuple',detail)
    available(r,'inputTuple',detail,row(r.capture.context,'inputTuple',detail,prior),{sequence:128,occurrence:0,family:'APPEARANCE_COUNT'})
    assert.deepEqual(r.sink.rows(),prior);sticky(r,e)
  })
  test('diagnostic_output_over_4096',()=>{
    const f=rowFailure('inputTuple',tuple(JSON.stringify(['x'.repeat(4500)])))
    unavailable(f.r,'DIAGNOSTIC_OUTPUT_OVER_BOUND');sticky(f.r,f.e)
  })
  function sharedRowFailure({bodyThrows=false,endThrows=false,resetThrows=false,writerThrows=false}={}) {
    const r=rig(),detail=detailAt(r.capture.context,'inputTuple',[],16385,ordinaryTuple())
    const events=[],later=new Error('later unrelated F'),endError=new Error('end fault'),resetError=new Error('reset fault')
    let first,emitted
    assert.throws(()=>runObserverArm(r.diagnostic,()=>{
      events.push('body');first=refused(r,'inputTuple',detail);events.push('swallowed E')
      if(bodyThrows)throw later
      return 'must not be accepted'
    },()=>{events.push('end');if(endThrows)throw endError},()=>{
      events.push('reset');r.diagnostic.reset();if(resetThrows)throw resetError
    },value=>{events.push('emit');emitted=value;if(writerThrows)throw new Error('writer fault')}),
      e=>e===first&&e!==later&&e!==endError&&e!==resetError,'only exact original E satisfies actual arm refusal')
    assert.deepEqual(events,['body','swallowed E','emit','end','reset'])
    assert.equal(first,r.error());assert.deepEqual(r.sink.rows(),[])
    assert.equal(JSON.parse(emitted).rowBytes,16385);assert.ok(bytes(emitted)<=4096)
    r.diagnostic.throwIfFailed() // reset cleared scratch; locally captured E still won.
  }
  test('swallowed_row_failure_then_return',()=>sharedRowFailure())
  test('swallowed_row_failure_then_unrelated_F',()=>sharedRowFailure({bodyThrows:true}))
  test('row_error_survives_end_failure',()=>sharedRowFailure({bodyThrows:true,endThrows:true}))
  test('row_error_survives_reset_failure',()=>sharedRowFailure({bodyThrows:true,resetThrows:true}))
  test('row_error_survives_both_cleanup_failures',()=>sharedRowFailure({bodyThrows:true,endThrows:true,resetThrows:true}))
  test('row_error_survives_writer_failure',()=>sharedRowFailure({bodyThrows:true,endThrows:true,resetThrows:true,writerThrows:true}))
  test('ordinary_body_error_and_cleanup_precedence',()=>{
    for(const [endThrows,resetThrows] of [[false,false],[true,false],[false,true],[true,true]]){
      const r=rig(),events=[],bodyError=new Error('ordinary body F'),endError=new Error('ordinary end'),resetError=new Error('ordinary reset')
      const winner=resetThrows?resetError:endThrows?endError:bodyError
      assert.throws(()=>runObserverArm(r.diagnostic,()=>{events.push('body');throw bodyError},
        ()=>{events.push('end');if(endThrows)throw endError},()=>{events.push('reset');r.diagnostic.reset();if(resetThrows)throw resetError},
        ()=>events.push('emit')),e=>e===winner)
      assert.deepEqual(events,['body','end','reset']);r.diagnostic.throwIfFailed()
    }
  })
  test('subsequent_record_cannot_resume',()=>{
    const f=rowFailure(),n=f.r.attempts();assert.throws(()=>f.r.capture.record('assessment',{v:1}),e=>e===f.e)
    assert.equal(f.r.attempts(),n);assert.deepEqual(f.r.sink.rows(),[]);sticky(f.r,f.e);available(f.r,'inputTuple',f.detail,f.expectedRow)
  })
  test('emitter_failure_consumes_first_emission',()=>{
    const f=rowFailure();let count=0;assert.doesNotThrow(()=>f.r.diagnostic.emitFirst(()=>{count++;throw new Error('writer fault')}))
    f.r.diagnostic.emitFirst(()=>{count++});assert.equal(count,1);sticky(f.r,f.e)
  })
  test('original_count_513',()=>{
    const r=rig();for(let i=0;i<512;i++)r.capture.record('assessment',{v:i})
    assert.equal(r.sink.rows().length,512);refused(r,'assessment',{v:513},'M0 feasibility row bound exceeded')
    const out=[];r.diagnostic.emitFirst(v=>out.push(v));assert.deepEqual(out,[]);r.diagnostic.throwIfFailed()
  })
  test('original_total_2097152_then_more',()=>{
    const r=rig();for(let i=0;i<128;i++){const rs=r.sink.rows();r.capture.record('assessment',detailAt(r.capture.context,'assessment',rs,16384,{v:i}))}
    const before=r.sink.rows();assert.equal(before.reduce((n,r)=>n+bytes(JSON.stringify(r)+'\n'),0),2097152)
    refused(r,'assessment',{v:'more'},'M0 feasibility total byte bound exceeded');assert.deepEqual(r.sink.rows(),before)
    const out=[];r.diagnostic.emitFirst(v=>out.push(v));assert.deepEqual(out,[]);r.diagnostic.throwIfFailed()
  })
  test('unrelated_error_unchanged',()=>{
    const r=rig(),other=new Error('unrelated original serializer Error')
    assert.throws(()=>r.capture.record('assessment',{toJSON(){throw other}}),e=>e===other)
    const out=[];r.diagnostic.emitFirst(v=>out.push(v));assert.deepEqual(out,[]);r.diagnostic.throwIfFailed()
  })
  test('original_reentrant_error_unchanged',()=>{
    const r=rig();let inside
    assert.throws(()=>r.capture.record('assessment',{toJSON(){try{r.original.record('assessment',{v:1})}catch(e){inside=e;throw e}}}),
      e=>e===inside&&e.constructor===Error&&e.message==='M0 feasibility reentrant capture')
    const out=[];r.diagnostic.emitFirst(v=>out.push(v));assert.deepEqual(out,[]);r.diagnostic.throwIfFailed()
  })
  assert.deepEqual(results.map(r=>r.id),CASES.map(r=>r.id))
  return {schema:'1370-observer-row-independent-controls-result/v1',status:'PURE_OBSERVER_ROW_DIAGNOSTIC_CONTROLS_COMPLETED_UNADOPTED',
    caseCount:results.length,positiveCount:results.filter(r=>r.expected==='GREEN').length,
    specificNegativeCount:results.filter(r=>r.expected==='RED').length,results,
    game:false,privateM0ReadOrWritten:false,fullQualificationAccepted:false,executionAuthorization:false}
}
