// Inserted into the exact AP controls closure; never a diagnostic implementation.
  const forcedRow=(p,kind,d,{context=ctx(),rowsProvider=()=>p.sink.rows()}={})=>{
    const original=capture(p),prior=p.sink.rows(),bad=assessmentAt(ctx(),prior,16385)
    const wrapper=p.diagnostic.wrap({context,record(){return original.record('assessment',bad)}},rowsProvider)
    const E=originalError(()=>wrapper.record(kind,d),ROW)
    assert.equal(p.latch.first().error,E);exactThrown(()=>p.diagnostic.throwIfFailed(),E)
    return E
  }
  const codecFault=(p,operation,fn)=>{
    const base=p.codec;let fault,calls=0
    const codec={...base,[operation](d){calls++;try{return fn(base,d)}catch(e){fault=e;throw e}}}
    p.diagnostic=createObserverRowDiagnostic({codec,latch:p.latch})
    return ()=>({fault,calls})
  }
  const unknownMetadata=(p,E)=>{const m=available(p,E);assert.equal(m.availability,'unavailable');assert.equal(m.reason,'DIAGNOSTIC_UNAVAILABLE');assert.ok(!Object.hasOwn(m,'nativeCodecErrorCode'));assert.ok(!Object.hasOwn(m,'refusalClass'));return m}
  put('v2_canonical_no_fit_lower_bound_only',()=>{
    for(const n of [16385,262144]){
      const latch=createObserverFailureLatch(),base=createNativeRowCodec({latch});let ordinaryEncodes=0,diagnosticEncodes=0,parses=0
      const codec={...base,encodeInputDetail(d){ordinaryEncodes++;return base.encodeInputDetail(d)},encodeInputDetailForDiagnostic(d){diagnosticEncodes++;return base.encodeInputDetailForDiagnostic(d)}}
      const sink=createM0FeasibilitySink({codec,latch}),diagnostic=createObserverRowDiagnostic({codec,latch}),p={latch,codec,sink,diagnostic}
      capture(p).record('inputTuple',ordinary());const prior=p.sink.rows();ordinaryEncodes=0
      const a=diagnostic.wrap(capture(p),()=>prior),d=canonicalAt(n),saved=JSON.parse;let E
      JSON.parse=(...args)=>{parses++;return saved(...args)}
      try{E=originalError(()=>a.record('inputTuple',d),ROW)}finally{JSON.parse=saved}
      assert.equal(ordinaryEncodes,0);assert.equal(diagnosticEncodes,0);assert.equal(parses,0)
      const m=available(p,E);assert.equal(m.availability,'unavailable');assert.equal(m.reason,'NATIVE_CANONICAL_NO_FIT');assert.equal(m.canonicalInputBytesLowerBound,16385);assert.equal(m.canonicalInputBytes,null);assert.equal(m.rowBytes,null);assert.equal(m.detailBytes,null);assert.equal(m.canonicalInputUnavailableReason,'CANONICAL_INPUT_OVER_BOUND');assert.equal(m.family,null);assert.equal(m.familyUnavailableReason,'CANONICAL_INPUT_OVER_BOUND');assert.equal(m.sequence,1);assert.equal(m.priorRowCount,1);assert.equal(m.occurrence,1);assert.equal(m.kind,'inputTuple');assert.deepEqual(m.context,ctx());assert.equal(m.contextBytes,bytes(json(ctx())));assert.ok(!Object.hasOwn(m,'refusalClass'));assert.equal(p.latch.first().error,E);exactThrown(()=>p.sink.rows(),E)
    }
  })
  put('v2_multibyte_capped_counter_not_exact',()=>{
    for(const tail of ['☃','😀']){
      const text=json(['FAMILY','x'.repeat(16383-bytes(json(['FAMILY',''])))+tail]),d=detail(text);assert.ok(d.inputBytes>16384)
      const p=setup();let encodes=0;const base=p.codec;p.diagnostic=createObserverRowDiagnostic({latch:p.latch,codec:{...base,encodeInputDetailForDiagnostic(){encodes++;assert.fail('known-no-fit must precede encoder')}}})
      const E=originalError(()=>wrap(p).record('inputTuple',d),ROW),m=available(p,E);assert.equal(m.reason,'NATIVE_CANONICAL_NO_FIT');assert.equal(m.canonicalInputBytesLowerBound,16385);assert.equal(m.canonicalInputBytes,null);assert.notEqual(d.inputBytes,m.canonicalInputBytesLowerBound);assert.equal(encodes,0);assert.equal(p.latch.first().error,E)
    }
  })
  put('v2_known_no_fit_ignores_other_getters',()=>{
    const p=setup(),d=canonicalAt(16385);let gets=0,encodes=0
    for(const key of ['inputBytes','inputsDigest'])Object.defineProperty(d,key,{enumerable:true,get(){gets++;throw new Error('forbidden getter')}})
    const base=p.codec;p.diagnostic=createObserverRowDiagnostic({latch:p.latch,codec:{...base,encodeInputDetailForDiagnostic(){encodes++;assert.fail('no encode on capped canonical')}}})
    const E=originalError(()=>wrap(p).record('inputTuple',d),ROW),m=available(p,E);assert.equal(m.reason,'NATIVE_CANONICAL_NO_FIT');assert.equal(gets,0);assert.equal(encodes,0);assert.equal(m.canonicalInputBytesLowerBound,16385);exactThrown(()=>p.diagnostic.throwIfFailed(),E)
  })
  put('v2_exact_physical_cap_classification',()=>{
    const p=setup(),d=inputAt(p.codec,ctx(),[],16384);wrap(p).record('inputTuple',d.d);assert.equal(bytes(json(p.sink.rows()[0])+'\n'),16384);let writes=0;p.diagnostic.emitFirst(()=>writes++);assert.equal(writes,0)
    const prior=p.sink.rows(),bad=inputAt(p.codec,ctx(),prior,16385),E=originalError(()=>wrap(p).record('inputTuple',bad.d),ROW),m=available(p,E);assert.equal(m.availability,'available');assert.equal(m.refusalClass,'PHYSICAL_ROW_BYTE_CAP');assert.equal(m.rowBytes,16385);assert.equal(m.detailBytes,bytes(json(bad.native)));assert.equal(m.canonicalInputBytes,bad.d.inputBytes);assert.ok(m.canonicalInputBytes<=16384);assert.ok(!Object.hasOwn(m,'canonicalInputBytesLowerBound'));assert.equal(m.occurrence,1);exactThrown(()=>p.sink.rows(),E)
  })
  put('v2_input_encoder_four_typed_codes',()=>{
    for(const code of ['CANONICAL_OVER_BOUND','FORMAT_INVALID','STRUCTURE_OVER_BOUND','CANONICAL_ROUNDTRIP']){
      const p=setup(),observe=codecFault(p,'encodeInputDetailForDiagnostic',base=>{
        let bad=ordinary();if(code==='CANONICAL_OVER_BOUND')bad=canonicalAt(16385)
        else if(code==='FORMAT_INVALID')bad={...bad,extra:true}
        else if(code==='CANONICAL_ROUNDTRIP')bad=detail('[-0]')
        else{let v=0;for(let i=0;i<64;i++)v=[v];bad=detail(json(v))}
        return base.encodeInputDetailForDiagnostic(bad)
      })
      const E=forcedRow(p,'inputTuple',ordinary()),m=available(p,E),f=observe();assert.equal(f.calls,1);assert.ok(f.fault instanceof NativeObserverFormatError);assert.equal(f.fault.code,code);assert.equal(m.availability,'unavailable');assert.equal(m.reason,'NATIVE_DETAIL_FORMAT_REFUSAL');assert.equal(m.nativeCodecErrorCode,code);assert.equal(m.operation,'INPUT_DETAIL_ENCODE');assert.ok(m.rowBytes==null);assert.ok(m.detailBytes==null);assert.ok(!Object.hasOwn(m,'refusalClass'));assert.equal(p.latch.first().error,E);exactThrown(()=>p.codec.encodeInputDetail(ordinary()),E)
    }
  })
  put('v2_predecessor_decode_precise_stage',()=>{
    const p=setup();capture(p).record('inputTuple',ordinary());const observe=codecFault(p,'decodeInputDetailForDiagnostic',(base,d)=>base.decodeInputDetailForDiagnostic({...d,extra:true}))
    const E=rowRefusal(p),m=available(p,E),f=observe();assert.equal(f.calls,1);assert.ok(f.fault instanceof NativeObserverFormatError);assert.equal(f.fault.code,'FORMAT_INVALID');assert.equal(m.availability,'unavailable');assert.equal(m.reason,'NATIVE_DETAIL_FORMAT_REFUSAL');assert.equal(m.nativeCodecErrorCode,'FORMAT_INVALID');assert.equal(m.operation,'PREDECESSOR_INPUT_DECODE');assert.ok(!Object.hasOwn(m,'refusalClass'));assert.equal(p.latch.first().error,E);exactThrown(()=>p.sink.rows(),E)
  })
  put('v2_spoofed_or_unknown_code_refused',()=>{
    for(const method of ['encodeInputDetailForDiagnostic','decodeInputDetailForDiagnostic'])for(const mode of ['plain','error','syntax','unrecognized-typed','typed-accessor']){
      const p=setup();let gets=0,F
      if(method==='decodeInputDetailForDiagnostic')capture(p).record('inputTuple',ordinary())
      if(mode==='plain')F={code:'FORMAT_INVALID'}
      else if(mode==='unrecognized-typed')F=new NativeObserverFormatError('NOT_A_REVIEWED_CODE')
      else if(mode==='typed-accessor'){F=new NativeObserverFormatError('FORMAT_INVALID');Object.defineProperty(F,'code',{get(){gets++;return 'FORMAT_INVALID'}})}
      else{F=mode==='syntax'?new SyntaxError('format syntax'):new Error('spoof');F.code='FORMAT_INVALID'}
      const observe=codecFault(p,method,()=>{throw F}),E=method==='decodeInputDetailForDiagnostic'?rowRefusal(p):forcedRow(p,'inputTuple',ordinary());unknownMetadata(p,E);assert.equal(observe().fault,F);assert.equal(observe().calls,1);assert.equal(gets,0);assert.equal(p.latch.first().error,E)
    }
  })
  put('v2_arbitrary_code_getter_not_invoked',()=>{
    for(const method of ['encodeInputDetailForDiagnostic','decodeInputDetailForDiagnostic']){
      const p=setup(),F=new Error('not native');if(method==='decodeInputDetailForDiagnostic')capture(p).record('inputTuple',ordinary());let gets=0;Object.defineProperty(F,'code',{get(){gets++;throw new Error('code getter')}})
      codecFault(p,method,()=>{throw F});const E=method==='decodeInputDetailForDiagnostic'?rowRefusal(p):forcedRow(p,'inputTuple',ordinary());unknownMetadata(p,E);assert.equal(gets,0);assert.equal(p.latch.first().error,E)
    }
  })
  put('v2_unknown_codec_diagnostic_code_spoof_refused',()=>{
    for(const method of ['encodeInputDetailForDiagnostic','decodeInputDetailForDiagnostic'])for(const mode of ['data','accessor']){
      const p=setup(),F=new Error('unknown codec failure');let gets=0
      if(method==='decodeInputDetailForDiagnostic')capture(p).record('inputTuple',ordinary())
      if(mode==='data')F.diagnosticCode='CONTEXT_UNSUPPORTED'
      else Object.defineProperty(F,'diagnosticCode',{get(){gets++;return 'CONTEXT_UNSUPPORTED'}})
      codecFault(p,method,()=>{throw F});const E=method==='decodeInputDetailForDiagnostic'?rowRefusal(p):forcedRow(p,'inputTuple',ordinary());unknownMetadata(p,E);assert.equal(gets,0);assert.equal(p.latch.first().error,E)
    }
  })
  put('v2_unsafe_canonical_descriptor_no_getter',()=>{
    const p=setup(),d=ordinary();let gets=0;Object.defineProperty(d,'canonicalInputs',{enumerable:true,get(){gets++;throw new Error('canonical getter')}})
    const E=forcedRow(p,'inputTuple',d),m=available(p,E);assert.equal(m.availability,'unavailable');assert.equal(m.reason,'FAILED_ROW_UNSUPPORTED');assert.equal(gets,0);assert.ok(!Object.hasOwn(m,'canonicalInputBytesLowerBound'));assert.ok(!Object.hasOwn(m,'context'));assert.equal(p.latch.first().error,E)
  })
  put('v2_unsafe_context_no_getter',()=>{
    const p=setup(),c=ctx();let gets=0;Object.defineProperty(c,'week',{enumerable:true,get(){gets++;throw new Error('context getter')}})
    const E=forcedRow(p,'inputTuple',canonicalAt(16385),{context:c}),m=available(p,E);assert.equal(m.availability,'unavailable');assert.equal(m.reason,'CONTEXT_UNSUPPORTED');assert.equal(gets,0);assert.ok(!Object.hasOwn(m,'context'));assert.ok(!Object.hasOwn(m,'canonicalInputBytesLowerBound'));assert.equal(p.latch.first().error,E)
  })
  put('v2_lower_bound_output_cap_explicit_fallback',()=>{
    const p=setup(),c=ctx({caseKey:'x'.repeat(4200)}),E=originalError(()=>wrap(p,c).record('inputTuple',canonicalAt(16385)),ROW),m=available(p,E);assert.equal(m.availability,'unavailable');assert.equal(m.reason,'DIAGNOSTIC_OUTPUT_OVER_BOUND');assert.ok(!Object.hasOwn(m,'context'));assert.ok(!Object.hasOwn(m,'canonicalInputBytesLowerBound'));assert.ok(!json(m).includes('x'.repeat(100)));exactThrown(()=>p.diagnostic.throwIfFailed(),E)
  })
  put('v2_lower_bound_E_survives_body_cleanup_writer',()=>{
    for(const laterFailure of [false,true]){
      const p=setup(),calls=[];let E;const actual=thrown(()=>runObserverArm(p.diagnostic,()=>{E=originalError(()=>wrap(p).record('inputTuple',canonicalAt(16385)),ROW);if(laterFailure)throw new Error('later body');return 17},()=>{calls.push('end');throw undefined},()=>{calls.push('reset');throw false},line=>{calls.push('write');assert.ok(bytes(line)<=4096);assert.equal(JSON.parse(line).reason,'NATIVE_CANONICAL_NO_FIT');throw new Error('writer')}));assert.equal(actual,E);assert.equal(p.latch.first().error,E);assert.deepEqual(calls,['write','end','reset']);let repeat=0;p.diagnostic.emitFirst(()=>repeat++);assert.equal(repeat,0)
    }
  })
  put('v2_falsy_first_preempts_no_fit_work',()=>{
    for(const E of [undefined,null,false,0,'']){
      const p=setup();let prior=0,records=0,writes=0;p.latch.record(E);const a=p.diagnostic.wrap({context:ctx(),record(){records++}},()=>{prior++;return []});exactThrown(()=>a.record('inputTuple',canonicalAt(16385)),E);p.diagnostic.emitFirst(()=>writes++);assert.equal(prior,0);assert.equal(records,0);assert.equal(writes,0);exactThrown(()=>runObserverArm(p.diagnostic,()=>17,()=>{},()=>{},()=>writes++),E);assert.equal(writes,0)
    }
  })
