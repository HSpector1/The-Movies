from pathlib import Path
import hashlib,json,os,re,difflib
S=Path('/Users/zacheryspector/studio-scratch')
SRC=S/'1370-ao-observer-row-diagnostic-source-20261010-r1'
OUT=S/'1370-ao-observer-row-diagnostic-independent-source-review-20261010-r1'
def role(p):
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def save(n,obj):
 p=OUT/n;b=(json.dumps(obj,indent=2,sort_keys=True)+'\n').encode()
 with p.open('xb') as f:f.write(b);f.flush();os.fsync(f.fileno())
 assert p.read_bytes()==b
 return role(p)
def apply_diff(data,patch):
 original=data.decode().splitlines(keepends=True);lines=patch.decode().splitlines(keepends=True)
 assert lines[0].startswith('--- ') and lines[1].startswith('+++ ')
 result=[];cursor=0;i=2
 while i<len(lines):
  h=re.fullmatch(r'@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@\n',lines[i]);assert h,lines[i]
  oldcount=int(h[2] or 1);newcount=int(h[4] or 1);start=int(h[1])-1 if oldcount else int(h[1])
  assert cursor<=start;result.extend(original[cursor:start]);cursor=start;i+=1;oldseen=newseen=0
  while i<len(lines) and not lines[i].startswith('@@ '):
   line=lines[i];assert line[0] in ' +-'
   if line[0] in ' -':assert original[cursor]==line[1:];cursor+=1;oldseen+=1
   if line[0] in ' +':result.append(line[1:]);newseen+=1
   i+=1
  assert (oldseen,newseen)==(oldcount,newcount)
 result.extend(original[cursor:]);return ''.join(result).encode()
assert sorted(p.name for p in OUT.iterdir())==['prepare-review.py']
pins=role(SRC/'SOURCE-PINS.json');assert pins['sha256']=='281b84af5b4ceeaf80850766457e15eac88be274930840325a9e35bbdb69fe1a'
m=json.loads((SRC/'SOURCE-PINS.json').read_bytes())
for k,r in m['files'].items():assert role(Path(r['path']))==r,k
proof=json.loads((SRC/'SOURCE-PROOF.json').read_bytes())
for key in ['api','designAdoption']:assert role(Path(proof[key]['path']))==proof[key]
for r in proof['baselines']:assert role(Path(r['path']))==r
pairs=[('talentMarket.ts','BASELINE-talentMarket.ts'),('typed-propagation-removed-talentMarket.ts','BASELINE-typed-propagation-removed-talentMarket.ts'),('FULL-BODY-CONTROLS-TEMPLATE.ts','BASELINE-FULL-BODY-CONTROLS-TEMPLATE.ts')]
inverse_checks=[]
for target,base in pairs:
 old=(SRC/base).read_bytes();new=(SRC/target).read_bytes()
 assert apply_diff(old,(SRC/(target+'.forward.diff')).read_bytes())==new
 assert apply_diff(new,(SRC/(target+'.inverse.diff')).read_bytes())==old
 inverse_checks.append({'target':target,'forwardExact':True,'wholeInverseExact':True})
assert (SRC/'BASELINE-talentMarket.ts').read_bytes()==Path(proof['baselines'][0]['path']).read_bytes()
assert (SRC/'BASELINE-typed-propagation-removed-talentMarket.ts').read_bytes()==Path(proof['baselines'][1]['path']).read_bytes()
assert (SRC/'BASELINE-FULL-BODY-CONTROLS-TEMPLATE.ts').read_bytes()==Path(proof['baselines'][2]['path']).read_bytes()
assert (SRC/'m0FeasibilityWitness.ts').read_bytes()==Path(proof['baselines'][3]['path']).read_bytes()
old_a=(SRC/'BASELINE-talentMarket.ts').read_text();old_b=(SRC/'BASELINE-typed-propagation-removed-talentMarket.ts').read_text()
new_a=(SRC/'talentMarket.ts').read_text();new_b=(SRC/'typed-propagation-removed-talentMarket.ts').read_text()
delta_old=list(difflib.ndiff(old_a.splitlines(True),old_b.splitlines(True)))
delta_new=list(difflib.ndiff(new_a.splitlines(True),new_b.splitlines(True)))
edits=lambda d:[v for v in d if not v.startswith('  ')]
assert edits(delta_old)==edits(delta_new)
assert len(new_b.encode())-len(new_a.encode())==30
receipt={
 'schema':'1370-observer-row-diagnostic-independent-source-review/v1',
 'decision':'STOP_STATIC_OBSERVER_ROW_DIAGNOSTIC_UNBOUNDED_SERIALIZATION_AND_RAW_CONTEXT',
 'sourceManifest':pins,'sourcePins':{k:m['files'][k] for k in ['m0ObserverRowDiagnostic.mjs','m0FeasibilityWitness.ts','talentMarket.ts','typed-propagation-removed-talentMarket.ts','FULL-BODY-CONTROLS-TEMPLATE.ts']},
 'api':proof['api'],'designAdoption':proof['designAdoption'],'sourceProof':m['files']['SOURCE-PROOF.json'],
 'reviewer':'b109_focused_route_review, independent of implementation/control authors',
 'executionAuthorization':False,'sourceOnly':True,
 'concreteFindings':[
  {'id':'F1','code':'FAILED_INPUT_SERIALIZED_BEFORE_DIAGNOSTIC_BOUND',
   'source':'m0ObserverRowDiagnostic.mjs retain/familyEvidence',
   'evidence':'retain builds rowBytes via JSON.stringify(row) and TextEncoder before familyEvidence checks canonicalInputs<=65536. It then separately serializes detail/context. Candidate line length is checked only after the full object/string allocation. A huge failed canonical string, extra detail graph or context is therefore reserialized before unavailable; stateful toJSON/getter work can run again.',
   'impact':'Original refusal stays fatal, but required bounded diagnostic transient/access work is not implemented and reconstructed bytes can refer to a changed second serialization.',
   'minimalRepair':'Set sticky E first, then bounded safe plain-data/schema preflight before any full native reconstruction. Inspect supported context/detail shapes, scalar lengths, canonical string and finite structural work. Overbound/unsupported evidence yields bounded scalar unavailable; do not reserialize failed raw data, truncate, cache it, or guess rowBytes.'},
  {'id':'F2','code':'UNFILTERED_CONTEXT_CAN_EMIT_RAW_EXTRA_FIELDS',
   'source':'m0ObserverRowDiagnostic.mjs candidate.context',
   'evidence':'Original witness validateContext checks required fields but JSON-clones all context extras. Diagnostic emits capture.context wholesale. A valid required context plus small raw payload/tuple extra is therefore emitted under4096.',
   'impact':'Violates adopted scalar-metadata-only/no-raw contract even though current gameplay integration constructs known context fields.',
   'minimalRepair':'Require exact adopted scalar context shape before emission/reconstruction. Unknown/nested extras produce bounded unavailable. Never omit extras and claim the resulting rowBytes equals authoritative original row.'},
  {'id':'F3','code':'PRIOR_ARRAY_FRAME_BYTE_GUARD_DIFFERS_FROM_ORIGINAL_STREAM',
   'source':'m0ObserverRowDiagnostic.mjs retain prior rows guard',
   'evidence':'bytes(JSON.stringify(rows)) exceeds sum(bytes(JSON.stringify(row)+newline)) by one byte for nonempty rows. Exact legitimate2MiB prior stream is classified unavailable by this array guard.',
   'impact':'No cap waiver or false success; nevertheless this is avoidable false unavailability under the exact reconstruction contract.',
   'minimalRepair':'Sum original per-row JSON+newline bytes with early cap using bounded source data. Preserve original512/16384/2097152 acceptance predicates. Author independently identified this same issue.'}
 ],
 'passedStaticChecks':{
  'all16ManifestRolesAuthenticated':True,'wholeInversePairs':inverse_checks,'completeDiffApplications':6,
  'originalWitnessBytesExact':True,'mutantOnlyOriginal30ByteCatchDeltaExact':True,
  'sharedArmUsesActualHelper':True,'immediatePostAdvanceStickyCheck':True,
  'stickySameErrorBeforeDiagnosticWork':True,
  'sameErrorSurvivesLaterFAndEndResetErrors':True,
  'noRowErrorOriginalNestedCleanupSemantics':True,
  'producingSinkClosure':True,'nativeRowFieldOrderAndFull10FieldOccurrenceIdentity':True,
  'firstRefusalBeforeRowsAndOccurrenceIncrement':True,
  'emissionAttemptAtMostOnceAndCallbackErrorsCannotReplaceE':True,
  'ordinarySuccessfulRowsAndGameplayBodyFaultControlsUnchanged':True,
  'diagnosticStateClearedAtExistingReset':True,
 },
 'futureControlsCriteria':['Overbound canonical/context/detail must be unavailable without repeated failed-input serializers.','Extra raw context tuple must not appear in emitted line.','Exact original stream accounting at2MiB; array-frame byte must not alter availability.','Existing native boundary/occurrence/parity/firstE/emission/cleanup/reset cases remain exact; unknown errors never intended RED.'],
 'scope':'Implementation R1 source-only STOP, preserved. No candidate imports/tests/runtime/private inventory or gameplay outcome by reviewer. Consolidated bounded preflight/accounting derivative is appropriate; no new gate or cap amendment.',
 'actualControls':None,'actualGameplay':None,'implementationAccepted':False,
}
receipt['routeSourcePins']=receipt['sourcePins']
r=save('RECEIPT.json',receipt)
seal={'schema':'1370-independent-source-review-seal/v1','files':{'RECEIPT.json':r,'prepare-review.py':role(OUT/'prepare-review.py')},'executionAuthorization':False}
for v in seal['files'].values():assert role(Path(v['path']))==v
se=save('SEAL.json',seal)
for p in OUT.iterdir():p.chmod(0o444)
OUT.chmod(0o555)
print(json.dumps({'receipt':r,'seal':se},indent=2))
