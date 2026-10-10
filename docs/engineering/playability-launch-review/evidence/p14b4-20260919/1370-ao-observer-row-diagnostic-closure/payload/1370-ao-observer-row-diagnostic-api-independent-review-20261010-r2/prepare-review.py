from pathlib import Path
import hashlib,json,os
S=Path('/Users/zacheryspector/studio-scratch')
OUT=S/'1370-ao-observer-row-diagnostic-api-independent-review-20261010-r2'
SRC=S/'1370-ao-observer-row-diagnostic-api-20261010-r2'
def role(p):
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def save(name,obj):
 p=OUT/name;b=(json.dumps(obj,indent=2,sort_keys=True)+'\n').encode()
 with p.open('xb') as f:f.write(b);f.flush();os.fsync(f.fileno())
 assert p.read_bytes()==b
 return role(p)
assert sorted(p.name for p in OUT.iterdir())==['prepare-review.py']
proof_path=SRC/'SOURCE-PROOF.json';proof=json.loads(proof_path.read_bytes())
assert role(proof_path)['sha256']=='1e4da10d231f0768416820fe50a5e109c7ae938015d1656feacdeec96eac4fea'
for key in ['predecessor','predecessorReview','source']:
 assert role(Path(proof[key]['path']))==proof[key]
assert proof['source']['sha256']=='8b23588f28233794a7d0317b76d0770912015bc3ffd20dd823aae74b21225eb8'
baseline=(SRC/'BASELINE-API.md').read_bytes()
assert baseline==Path(proof['predecessor']['path']).read_bytes()
adjusted=baseline.decode()
for old,new in proof['twoSingleSubstitutions']:
 assert adjusted.count(old)==1
 adjusted=adjusted.replace(old,new)
source=Path(proof['source']['path']).read_text()
assert source.startswith(adjusted)
append=source[len(adjusted):]
assert append.startswith('\n\n## R2 correction: actual shared arm/error/cleanup implementation')
restored=source[:len(adjusted)]
for old,new in reversed(proof['twoSingleSubstitutions']):
 assert restored.count(new)==1
 restored=restored.replace(new,old)
assert restored.encode()==baseline
receipt={
 'schema':'1370-observer-row-diagnostic-api-independent-source-review/v1',
 'decision':'ACCEPT_STATIC_BOUNDED_OBSERVER_ROW_DIAGNOSTIC_API_ONLY',
 'reviewer':'b109_focused_route_review, independent of root API and implementation/control authors',
 'api':proof['source'],'sourceProof':role(proof_path),'predecessor':proof['predecessor'],
 'preservedPredecessorStop':proof['predecessorReview'],'baseline':role(SRC/'BASELINE-API.md'),
 'concreteFindings':[],'findings':[],'executionAuthorization':False,
 'checks':{
  'exactTwoSingleSubstitutionsAndOneAppend':True,'completeInverseRestoresR1':True,
  'F1Resolved':'Same-module synchronous runObserverArm catches both swallowed-return and swallowed-then-F paths, snapshots exact sticky E and presence boolean before emit/reset, propagates E instead of F. Immediate post-advance check prevents subsequent assertions after swallowed failure.',
  'F2Resolved':'Always end then reset. Local E survives both cleanup failures even when factory.reset clears state; absent E retains original nestedfinally fatal end/reset behavior and reset precedence.',
  'sameImplementationUsedByControlsAndActualArm':True,
  'normalBodyCallOrderAssertionsAndReturnUnchanged':True,
  'factoryFourMethodsUnchanged':True,
  'originalWitnessAndOccurrenceReconstructionUnchanged':'Pinned public witness/native field order/exact10-field identity/producing sink closure; original record remains authority.',
  'boundsUnchanged':{'observerRows':512,'observerRowBytes':16384,'observerTotalBytes':2097152,'canonicalParseInputBytes':65536,'diagnosticLineBytesIncludingNewline':4096},
  'noRawPayloadCacheTruncationOrEmitterFallback':True,
  'pureControlRequirements':'Exact original row/count/total refusals, sameE vs distinctF, end/reset/both failure cases, cleanup order, reset clearing state, immutable prior line and original ordinary cleanup semantics. Unknown setup/import errors never intended RED.',
 },
 'scope':'Narrow interface repair source only; author must now implement and independently review exact same-module helper/witness integration and controls. No runtime, private reads, gameplay import, source mutation, cap amendment or implementation acceptance performed by reviewer.',
 'implementationAccepted':False,'controlsExecuted':False,'fullQualificationAccepted':False,
 'futureAuthority':{'implementationSource':None,'independentImplementationReview':None,'controlsSource':None,'actualControlsObservedReview':None,'freshOperationalAuthority':None,'gameGrant':None},
 'preservation':'R1 API and two-finding STOP remain unchanged. No claim either error combination occurred in actual56544.',
}
r=save('RECEIPT.json',receipt)
seal={'schema':'1370-independent-source-review-seal/v1','files':{'RECEIPT.json':r,'prepare-review.py':role(OUT/'prepare-review.py')},'executionAuthorization':False}
for v in seal['files'].values():assert role(Path(v['path']))==v
se=save('SEAL.json',seal)
for p in OUT.iterdir():p.chmod(0o444)
OUT.chmod(0o555)
print(json.dumps({'receipt':r,'seal':se},indent=2))
