from pathlib import Path
import hashlib,json,os,ast,difflib
S=Path('/Users/zacheryspector/studio-scratch')
SRC=S/'1370-ao-observer-row-diagnostic-source-20261010-r3'
OUT=S/'1370-ao-observer-row-diagnostic-independent-source-review-20261010-r3'
STOP=S/'1370-ao-observer-row-diagnostic-independent-source-review-20261010-r2'
def role(p):
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def save(p,obj):
 b=(json.dumps(obj,indent=2,sort_keys=True)+'\n').encode()
 with p.open('xb') as f:f.write(b);f.flush();os.fsync(f.fileno())
 assert p.read_bytes()==b
 return role(p)
# Reuse only this reviewer's trusted pure-data diff interpreter, not candidate code.
owned=S/'1370-ao-observer-row-diagnostic-independent-source-review-20261010-r1'/'prepare-review.py'
tree=ast.parse(owned.read_text());fn=next(n for n in tree.body if isinstance(n,ast.FunctionDef) and n.name=='apply_diff')
namespace={};exec('import re\n'+ast.get_source_segment(owned.read_text(),fn),namespace)
apply_diff=namespace['apply_diff']
assert sorted(p.name for p in OUT.iterdir())==['prepare-review.py']
assert not STOP.exists();STOP.mkdir()
pins=role(SRC/'SOURCE-PINS.json');assert pins['sha256']=='ecfa500f2a60f1280c6fcf06d60817bbb017bbf2524b74ab42bfd9c5aa5ce3b3'
m=json.loads((SRC/'SOURCE-PINS.json').read_bytes())
for k,r in m['files'].items():assert role(Path(r['path']))==r,k
p=json.loads((SRC/'SOURCE-PROOF.json').read_bytes());contract=json.loads((SRC/'CONTRACT.json').read_bytes())
for key in ['api','designAdoption','predecessorSourcePins','predecessorStop']:
 assert role(Path(p[key]['path']))==p[key]
for r in p['baselines']:assert role(Path(r['path']))==r
checks=[]
for target,base in [('talentMarket.ts','BASELINE-talentMarket.ts'),('typed-propagation-removed-talentMarket.ts','BASELINE-typed-propagation-removed-talentMarket.ts'),('FULL-BODY-CONTROLS-TEMPLATE.ts','BASELINE-FULL-BODY-CONTROLS-TEMPLATE.ts')]:
 old=(SRC/base).read_bytes();new=(SRC/target).read_bytes()
 assert apply_diff(old,(SRC/(target+'.forward.diff')).read_bytes())==new
 assert apply_diff(new,(SRC/(target+'.inverse.diff')).read_bytes())==old
 checks.append({'subject':target,'forwardExact':True,'inverseExact':True})
R1=(SRC/'BASELINE-R1-m0ObserverRowDiagnostic.mjs').read_bytes()
R2=(SRC/'BASELINE-R2-m0ObserverRowDiagnostic.mjs').read_bytes()
R3=(SRC/'m0ObserverRowDiagnostic.mjs').read_bytes()
for old,new,label in [(R1,R2,'R1'),(R2,R3,'R2')]:
 assert apply_diff(old,(SRC/f'm0ObserverRowDiagnostic.{label}.forward.diff').read_bytes())==new
 assert apply_diff(new,(SRC/f'm0ObserverRowDiagnostic.{label}.inverse.diff').read_bytes())==old
 checks.append({'subject':f'diagnostic {label} derivative','forwardExact':True,'inverseExact':True})
assert R1==(S/'1370-ao-observer-row-diagnostic-source-20261010-r1'/'m0ObserverRowDiagnostic.mjs').read_bytes()
assert R2==(S/'1370-ao-observer-row-diagnostic-source-20261010-r2'/'m0ObserverRowDiagnostic.mjs').read_bytes()
oldguard=b"if (typeof kind !== 'string') fail('FAILED_ROW_UNSUPPORTED')"
newguard=b"if (kind !== 'inputTuple' && kind !== 'assessment') fail('FAILED_ROW_UNSUPPORTED')"
assert R2.count(oldguard)==1 and R2.replace(oldguard,newguard)==R3
helper_marker=b'// The actual fullbody arm and pure controls share this error-precedence adapter.'
assert R1.split(helper_marker)[1]==R2.split(helper_marker)[1]==R3.split(helper_marker)[1]
for name in p['unchangedFromR1']:
 assert (SRC/name).read_bytes()==(S/'1370-ao-observer-row-diagnostic-source-20261010-r1'/name).read_bytes()
assert (SRC/'m0FeasibilityWitness.ts').read_bytes()==Path(p['baselines'][3]['path']).read_bytes()
base_a=(SRC/'BASELINE-talentMarket.ts').read_text();base_b=(SRC/'BASELINE-typed-propagation-removed-talentMarket.ts').read_text()
new_a=(SRC/'talentMarket.ts').read_text();new_b=(SRC/'typed-propagation-removed-talentMarket.ts').read_text()
edits=lambda a,b:[x for x in difflib.ndiff(a.splitlines(True),b.splitlines(True)) if not x.startswith('  ')]
assert edits(base_a,base_b)==edits(new_a,new_b) and len(new_b.encode())-len(new_a.encode())==30
assert contract['diagnosticOnlyBounds']==p['diagnosticOnlyBounds']
assert contract['supportedFailedRowKinds']==['inputTuple','assessment']
r2stop={
 'schema':'1370-observer-row-diagnostic-independent-source-review/v1',
 'decision':'STOP_STATIC_OBSERVER_ROW_DIAGNOSTIC_FAILED_KIND_PREFLIGHT',
 'sourceManifest':p['predecessorSourcePins'],'executionAuthorization':False,
 'concreteFindings':[{'code':'UNBOUNDED_FAILED_KIND_IDENTITY_SERIALIZATION','source':'R2 retain typeof-only kind guard before identity(context,kind)','impact':'Original public witness runtime accepts arbitrary kind:string; a huge kind can cause the genuine row-byte Error then unbounded diagnostic identity serialization before row preflight.','minimalRepair':'Check exact supported failed kinds inputTuple/assessment before identity; unsupported gives FAILED_ROW_UNSUPPORTED, ordinary successful original records unchanged.','reviewedRepair':pins}],
 'remainingReview':'R1 pre-serialization bounds/context-extra/accounting findings repaired; all integration/witness roles and E/helper semantics unchanged. R2 is unaccepted/unrun source STOP, preserved; no actual cause/runtime claims.',
 'priorSourceStop':p['predecessorStop'],'sourceOnly':True,'actualControls':None,'actualGame':None,
}
stoprole=save(STOP/'RECEIPT.json',r2stop)
stopseal=save(STOP/'SEAL.json',{'schema':'1370-independent-source-review-seal/v1','files':{'RECEIPT.json':stoprole},'executionAuthorization':False})
for q in STOP.iterdir():q.chmod(0o444)
STOP.chmod(0o555)
aliases=['m0ObserverRowDiagnostic.mjs','m0FeasibilityWitness.ts','talentMarket.ts','typed-propagation-removed-talentMarket.ts','FULL-BODY-CONTROLS-TEMPLATE.ts']
receipt={
 'schema':'1370-observer-row-diagnostic-independent-source-review/v1',
 'decision':'ACCEPT_STATIC_BOUNDED_OBSERVER_ROW_DIAGNOSTIC_IMPLEMENTATION_SOURCE_ONLY',
 'sourceManifest':pins,'sourcePins':{k:m['files'][k] for k in aliases},'routeSourcePins':{k:m['files'][k] for k in aliases},
 'pureInputPins':{k:m['files'][k] for k in aliases[:2]},
 'sourceProof':m['files']['SOURCE-PROOF.json'],'contract':m['files']['CONTRACT.json'],
 'api':p['api'],'designAdoption':p['designAdoption'],'preservedR1Stop':p['predecessorStop'],'preservedR2Stop':stoprole,
 'reviewer':'b109_focused_route_review, independent of implementation/control authors',
 'concreteFindings':[],'findings':[],'executionAuthorization':False,'sourceOnly':True,
 'checks':{
  'allManifestRolesAuthenticated':len(m['files']),'wholeForwardInverseApplications':10,'wholeInversePairs':checks,
  'R3OnlySubstantiveDelta':'Exact supported-kind preflight guard before occurrence identity serialization',
  'allFourIntegrationAndWitnessRolesByteIdenticalR1':True,'unchanged4729BytePublicWitness':True,'soleOriginal30ByteCatchRemovalMutantDeltaExact':True,
  'diagnosticOnlyCeilings':contract['diagnosticOnlyBounds'],
  'originalObserverCapsUnchanged':{'rows':512,'rowBytesIncludingNewline':16384,'totalRowStreamBytes':2097152},
  'preflightBeforeNativeReconstruction':'Known failed kinds; exact whitelisted scalar context; bounded canonical UTF8 scan; safe plain JSON traversal without getter/toJSON execution, cumulative byte/nodes/properties/depth caps. Unsupported/overbound selects unavailable before row serialization.',
  'nativeStringByteCounting':'Incremental JSON escapes, lone surrogate escape bytes, paired surrogate UTF8 and bounded primitive-number serialization match native row encoding; meaningful runtime controls still required.',
  'exactOriginalPriorStreamFraming':'Sum each retained row JSON plus newline, early original cap; no array +1 substitution.',
  'occurrence':'Native row field order and exact original10-field identity including applicable ordinal; actual sink prior rows only, refusal never advances occurrence.',
  'family':'Failed bounded inputTuple or actual preceding exact-context inputTuple; missing/mismatched/malformed explicitly reasoned. Bounded malformed canonical retains measured bytes, no guessed family.',
  'noRawExtraContextPayloadEmission':'Unknown/nested context extra rejected to scalar unavailable; full-context rowBytes never claimed after field truncation.',
  'errorAndCleanup':'First same E sticky before diagnostics; record never resumes after failure. Shared helper source identical R1, E wins over later F/end/reset, both cleanup attempts, original cleanup behavior without E. Reset clears scratch state; immutable emitted line retained by caller.',
  'actualArmUsesSharedHelperAndImmediatePostAdvanceCheck':True,'producingSinkClosureCapturedBeforeWrap':True,
  'emission':'At most one attempted line <=4096 UTF8 including newline, guarded emitter exceptions, no emitter fallback/second line. No failure=no output.',
  'normalRowsPolicyRNGInputPurityFaultControlScheduleUnchanged':True,
 },
 'scope':'Exact public implementation/witness/shared-arm integration source only. No controls, transpilation, imports, private copy/source/inventory reads or game execution by reviewer. Diagnostic unavailable limits do not change observer acceptance, transport, policy or original caps.',
 'actualControls':None,'actualGameplay':None,'actualFailedRowMetrics':None,
 'fullQualificationAccepted':False,'runtimeAuthority':None,
 'preservation':'Original R1/R2 source STOPs and initial author signed mutant-length preparation failure preserved; no outcome relabeled.',
}
r=save(OUT/'RECEIPT.json',receipt)
seal={'schema':'1370-independent-source-review-seal/v1','files':{'RECEIPT.json':r,'prepare-review.py':role(OUT/'prepare-review.py')},'executionAuthorization':False}
for v in seal['files'].values():assert role(Path(v['path']))==v
se=save(OUT/'SEAL.json',seal)
for q in OUT.iterdir():q.chmod(0o444)
OUT.chmod(0o555)
print(json.dumps({'receipt':r,'seal':se,'preservedR2Stop':stoprole},indent=2))
