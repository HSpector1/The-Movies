from pathlib import Path
import json,hashlib,re,difflib
S=Path('/Users/zacheryspector/studio-scratch')
D=S/'1370-aq-native-refusal-diagnostic-independent-controls-source-20261010-r1'
B=S/'1370-ap-native-observer-independent-controls-source-20261010-r2'
I=S/'1370-aq-native-observer-refusal-diagnostic-source-20261010-r2'
A=S/'1370-ap-root-continuation-20261010-r1'
roles={}
def role(p):
    b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def auth(r):
    p=Path(r['path']);assert role(p)==r;return json.loads(p.read_bytes())
def write(n,value):
    data=value if isinstance(value,bytes) else value.encode('utf-8')
    p=D/n;assert not p.exists()
    with p.open('xb') as f:f.write(data)
    p.chmod(0o444);assert p.read_bytes()==data;roles[n]=role(p);return roles[n]
def put(n,value):return write(n,json.dumps(value,sort_keys=True,indent=2)+'\n')
baseManifest=json.loads((B/'SOURCE-PINS.json').read_bytes())
for r in baseManifest['files'].values():assert role(Path(r['path']))==r
implementation=json.loads((I/'SOURCE-PINS.json').read_bytes())
for r in implementation['files'].values():assert role(Path(r['path']))==r
designRole=role(A/'NATIVE-REFUSAL-DIAGNOSTIC-DESIGN-ADOPTION.json')
assert designRole['bytes']==2382 and designRole['sha256']=='e1547ab7446749afd375ec235503da7eb81ac9955b598fd1bc01304ddbe59054'
before=(B/'run-native-observer-controls.mjs').read_text()
oldMatrix=json.loads((B/'MATRIX.json').read_bytes())
contract=json.loads((B/'CONTRACT.json').read_bytes())
snippet=(D/'ADDED-CONTROLS-SNIPPET.mjs').read_text()
ids=re.findall(r"put\('([^']+)'",snippet)
assert len(ids)==14 and len(set(ids))==14
predicates={
'v2_canonical_no_fit_lower_bound_only':'same original row Error; capped16385 lower bound only for16385 and262144 UTF8 inputs; zero encoder/parse calls; exact stable context/sequence/occurrence',
'v2_multibyte_capped_counter_not_exact':'same row Error;3/4-byte crossing reports lowerbound16385, never actual full byte length',
'v2_known_no_fit_ignores_other_getters':'same row Error; known canonical no-fit invokes zero declared-byte/digest getters and zero diagnostic encoding',
'v2_exact_physical_cap_classification':'physical16384 accepted; physical16385 exact refusalClass and complete detail/canonical/context metrics',
'v2_input_encoder_four_typed_codes':'actual AP native codec raises each precise authenticated four-code refusal at INPUT_DETAIL_ENCODE; original sink E remains first',
'v2_predecessor_decode_precise_stage':'actual predecessor diagnostic decoder FORMAT_INVALID classified PREDECESSOR_INPUT_DECODE; original sink E remains first',
'v2_spoofed_or_unknown_code_refused':'both codec stages reject plain/Error/SyntaxError spoof, actual typed unknown code and typed code getter as DIAGNOSTIC_UNAVAILABLE; getter0',
'v2_arbitrary_code_getter_not_invoked':'both codec stages never read arbitrary code getter; DIAGNOSTIC_UNAVAILABLE and same first E',
'v2_unknown_codec_diagnostic_code_spoof_refused':'both codec stages refuse diagnosticCode data spoof and invoke zero diagnosticCode getters; DIAGNOSTIC_UNAVAILABLE and same first E',
'v2_unsafe_canonical_descriptor_no_getter':'actual row E plus diagnostic canonical accessor yields FAILED_ROW_UNSUPPORTED without invoking getter or inventing lowerbound',
'v2_unsafe_context_no_getter':'actual row E plus unsupported diagnostic context accessor yields CONTEXT_UNSUPPORTED getter0 with explicit omitted context',
'v2_lower_bound_output_cap_explicit_fallback':'same row E; lowerbound metadata exceeding4096 yields explicit DIAGNOSTIC_OUTPUT_OVER_BOUND with no context/raw fragment',
'v2_lower_bound_E_survives_body_cleanup_writer':'actual first lowerbound row E wins normal/later-failing body, falsy cleanup errors and writer failure; both cleanups and one consumed emission',
'v2_falsy_first_preempts_no_fit_work':'undefined/null/false/0/empty first failure prevents snapshot/record/diagnostic writer and survives actual shared arm',
}
assert set(ids)==set(predicates)
extra=[{'id':n,'expected':'RED','predicate':predicates[n]} for n in ids]
after=before
old="assert.equal(m.schema,'1370-m0-observer-row-diagnostic/v1')"
assert after.count(old)==1
after=after.replace(old,"assert.equal(m.schema,'1370-m0-native-observer-row-diagnostic/v2')")
marker="].map(([id,expected,predicate])=>({id,expected,predicate}))"
assert after.count(marker)==1
rows=''.join(' '+json.dumps([x['id'],x['expected'],x['predicate']],ensure_ascii=False)+',\n' for x in extra)
after=after.replace(marker,rows+marker)
marker=" assert.equal(tests.size,NATIVE_CASES.length,'authored roster has exactly one implementation per case')"
assert after.count(marker)==1
after=after.replace(marker,snippet+'\n'+marker)
# Exact original bytes are recoverable by these three inverse substitutions.
restored=after
restored=restored.replace(snippet+'\n'+marker,marker).replace(rows+"].map(([id,expected,predicate])=>({id,expected,predicate}))", "].map(([id,expected,predicate])=>({id,expected,predicate}))").replace("assert.equal(m.schema,'1370-m0-native-observer-row-diagnostic/v2')",old)
assert restored==before
write('BASELINE-run-native-observer-controls.mjs',(B/'run-native-observer-controls.mjs').read_bytes())
write('BASELINE-MATRIX.json',(B/'MATRIX.json').read_bytes())
write('BASELINE-CONTRACT.json',(B/'CONTRACT.json').read_bytes())
write('run-native-observer-controls.mjs',after)
write('run-native-observer-controls.forward.diff',''.join(difflib.unified_diff(before.splitlines(True),after.splitlines(True),fromfile='BASELINE-run-native-observer-controls.mjs',tofile='run-native-observer-controls.mjs')))
write('run-native-observer-controls.inverse.diff',''.join(difflib.unified_diff(after.splitlines(True),before.splitlines(True),fromfile='run-native-observer-controls.mjs',tofile='BASELINE-run-native-observer-controls.mjs')))
nd=list(difflib.ndiff(before.splitlines(True),after.splitlines(True)))
assert ''.join(difflib.restore(nd,1))==before and ''.join(difflib.restore(nd,2))==after
write('run-native-observer-controls.lossless.ndiff',''.join(nd))
matrix={**oldMatrix,'cases':oldMatrix['cases'][:54]+extra+oldMatrix['cases'][54:],'nativeRefusalDiagnosticCases':len(extra),'originalNativeObserverCases':72}
assert [x for x in matrix['cases'] if x['id'] not in set(ids)]==oldMatrix['cases']
assert len({x['id'] for x in matrix['cases']})==len(matrix['cases'])
matrix['caseCount']=len(matrix['cases']);matrix['positiveCount']=sum(x['expected']=='GREEN' for x in matrix['cases']);matrix['specificNegativeCount']=sum(x['expected']=='RED' for x in matrix['cases']);matrix['nativeCases']=54+len(extra)
put('MATRIX.json',matrix)
contract['library']=roles['run-native-observer-controls.mjs'];contract['matrix']=roles['MATRIX.json']
contract['requiredInputs']['m0ObserverRowDiagnostic.mjs']=implementation['files']['m0ObserverRowDiagnostic.mjs']
contract['originalNativeImplementationAuthorities']=contract.pop('authorities')
contract['authorities']={'nativeImplementationSourceManifest':contract['originalNativeImplementationAuthorities']['implementationSourceManifest'],'nativeImplementationIndependentReview':contract['originalNativeImplementationAuthorities']['implementationIndependentReview'],'diagnosticSourceManifest':role(I/'SOURCE-PINS.json'),'diagnosticInterface':role(I/'INTERFACE.json'),'diagnosticIndependentSourceReview':None,'diagnosticDesignAdoption':designRole}
contract['result'].update({k:matrix[k] for k in ('caseCount','positiveCount','specificNegativeCount')})
contract['semantics']['diagnosticSchema']='1370-m0-native-observer-row-diagnostic/v2'
contract['semantics']['original72']='All AP72 IDs, expected verdicts, predicates and relative order remain exact. Only original diagnostic-schema expectation updates v1 to v2. Original18 packet and original registration bodies remain unchanged.'
contract['semantics']['newCases']='Fourteen diagnostic-v2 refusal controls; no codec/sink implementation clones. forcedRow uses an actual AP sink assessment-row refusal to select original E, with a public diagnostic wrapper fixture for stage/accessor refusal. Monitored codec methods call the authentic codec to obtain its four typed failures; spoof/control injections test only diagnostic attribution. No market fault or game premise is altered.'
contract['semantics']['knownNoFit']='Lowerbound16385 only; canonical bytes/row/detail null, bounded own canonical descriptor, no encoder/parse/getter; no raw string retained.'
contract['semantics']['unknownCodecStage']='Only actual NativeObserverFormatError and own-data reviewed code may classify either stage; unknown diagnosticCode spoof/accessor remains generic unavailable.'
contract['syntaxCheck']='UNRUN: source was authored and inspected only; no Node/TypeScript imports, parser/compiler, tests or candidate execution by this author.'
put('CONTRACT.json',contract)
put('SOURCE-PROOF.json',{'schema':'1370-native-refusal-diagnostic-controls-source-proof/v1','executionAuthorization':False,'predecessorSourceManifest':role(B/'SOURCE-PINS.json'),'predecessorLibrary':baseManifest['files']['run-native-observer-controls.mjs'],'predecessorMatrix':baseManifest['files']['MATRIX.json'],'currentDiagnosticSourceManifest':role(I/'SOURCE-PINS.json'),'currentDiagnosticModule':implementation['files']['m0ObserverRowDiagnostic.mjs'],'original72ProjectionExact':True,'original18PacketExactRole':contract['requiredInputs']['ORDERING-SOURCE-CASES.json'],'onlyInheritedExecutableChange':'One exact diagnostic-schema expectation v1 to native diagnostic v2; original72 test registration bodies unchanged. Fourteen appended native case registrations and source roster rows.','completeInverseRestoredOriginalLibrary':True,'completeLosslessForwardInverseApplied':True,'changedSourceDiffs':{n:roles[n] for n in ['run-native-observer-controls.forward.diff','run-native-observer-controls.inverse.diff','run-native-observer-controls.lossless.ndiff']},'caseCount':matrix['caseCount'],'positiveCount':matrix['positiveCount'],'specificNegativeCount':matrix['specificNegativeCount'],'syntaxCheckExecuted':False,'candidateImported':False,'controlsExecuted':False,'actualResult':None})
write('LESSONS.md','Preserve the original AP72 affected predicates and original18 ordering packet; versioned metadata changes only the schema expectation. Test the actual diagnostic encoder/decode stage, exact native error class and own-data code, not arbitrary Error.code values. An unknown codec-stage diagnosticCode getter/data spoof must not become internal preflight attribution. Capped16385 proves only a lower bound; multibyte crossings and large strings are not exact lengths. Actual first row Error remains fatal through body, writer and both cleanup failures, including falsy values. Pure diagnostic controls do not claim current gameplay row fit or the measured cause of the AP attempt. All source-only; no candidate imports, syntax/parser calls or runtime by the controls author.\n')
(D/'ADDED-CONTROLS-SNIPPET.mjs').chmod(0o444)
roles['ADDED-CONTROLS-SNIPPET.mjs']=role(D/'ADDED-CONTROLS-SNIPPET.mjs')
write('seal_controls.py',Path(__file__).read_bytes())
manifest={'schema':'1370-native-observer-independent-controls-source-pins/v1','executionAuthorization':False,'files':dict(roles)}
mr=put('SOURCE-PINS.json',manifest)
for r in manifest['files'].values():assert role(Path(r['path']))==r
put('SEAL.json',{'schema':'1370-native-refusal-controls-source-seal/v1','sourceManifest':mr,'payloadRolesReadbackVerified':len(manifest['files']),'executionAuthorization':False,'controlsExecuted':False})
D.chmod(0o555)
print(json.dumps({'sourceManifest':mr,'library':roles['run-native-observer-controls.mjs'],'matrix':roles['MATRIX.json'],'contract':roles['CONTRACT.json'],'caseCount':matrix['caseCount'],'positiveCount':matrix['positiveCount'],'specificNegativeCount':matrix['specificNegativeCount']},sort_keys=True))
