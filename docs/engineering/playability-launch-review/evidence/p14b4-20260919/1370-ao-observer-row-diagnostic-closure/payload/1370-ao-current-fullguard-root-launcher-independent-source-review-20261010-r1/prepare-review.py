from pathlib import Path
import hashlib,json,os,ast
S=Path('/Users/zacheryspector/studio-scratch')
A=S/'1370-ao-root-continuation-20261010-r1'
OUT=S/'1370-ao-current-fullguard-root-launcher-independent-source-review-20261010-r1'
def role(p):
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def save(n,d):
 p=OUT/n;b=(json.dumps(d,indent=2,sort_keys=True)+'\n').encode()
 with p.open('xb') as f:f.write(b);f.flush();os.fsync(f.fileno())
 assert p.read_bytes()==b
 return role(p)
assert sorted(p.name for p in OUT.iterdir())==['prepare-review.py']
pr=A/'GUARD-ROOT-LAUNCHER-PROOF.json';proof=json.loads(pr.read_bytes())
assert role(pr)['sha256']=='f6b3a7b567649c9bce997bf30458387e31abee1a4ba66f9a4d52ba6ff8d1450c'
for k in ['base','new']:assert role(Path(proof[k]['path']))==proof[k]
base=Path(proof['base']['path']).read_text();new=Path(proof['new']['path']).read_text();forward=base
assert len(proof['replacements'])==11
for r in proof['replacements']:
 assert forward.count(r['before'])==r['occurrences'];forward=forward.replace(r['before'],r['after'])
assert forward.encode()==new.encode()
inverse=new
for r in reversed(proof['replacements']):
 assert inverse.count(r['after'])==r['occurrences'];inverse=inverse.replace(r['after'],r['before'])
assert inverse.encode()==base.encode()
oldtree=ast.parse(base);newtree=ast.parse(new)
oldfn={n.name:n for n in oldtree.body if isinstance(n,ast.FunctionDef)}
newfn={n.name:n for n in newtree.body if isinstance(n,ast.FunctionDef)}
assert oldfn.keys()==newfn.keys()
for k in oldfn:assert ast.get_source_segment(base,oldfn[k])==ast.get_source_segment(new,newfn[k])
source_review=S/'1370-ao-current-operational-fullguard-independent-source-review-20261010-r1'/'RECEIPT.json'
sr=json.loads(source_review.read_bytes());assert sr['decision']=='ACCEPT_CURRENT_AN_FULLGUARD_BINDINGS_SOURCE_ONLY'
assert sr['sourcePins']['sha256']=='9df63e39d302e3b8481198999e129233ab4eb5709848d91cb1d45af0dfee0e88'
receipt={
 'schema':'1370-current-an-fullguard-root-launcher-independent-source-review/v1',
 'decision':'ACCEPT_STATIC_CURRENT_AN_FULLGUARD_ROOT_LAUNCHER_ONLY',
 'rootLauncher':proof['new'],'predecessorRootLauncher':proof['base'],'sourceProof':role(pr),
 'fullguardSourcePins':sr['sourcePins'],'fullguardSourceReview':role(source_review),
 'concreteFindings':[],'executionAuthorization':False,
 'checks':{'exactElevenLiteralReplacements':proof['replacements'],'completeForwardInverseByteEqual':True,'helpersByteExact':list(oldfn),'onlyBoundHeadSourceOutputReceiptSchemaLabelsChanged':True,'allSourceRolesAndPhysicalPythonHashBeforeGrant':True,'isolatedNoBytecodeNoOptimizeRequired':True,'sourceReviewDecisionRoleFindingsContractExact':True,'freshOutputParentAndEvidenceAndHeavyLockAbsentBeforeGrant':True,'actualOwnSessionGroupAndPidPreservingDirectExec':True,'original180SecondsPerCommand':True,'overallScanDeadline':None,'noHelperOrDetaching':True,'originalObservedCopyReceiptArgsAndBaselineGuardsUnchanged':True,'freshCurrentANHead':'0cf8b1d0bbf7d1977413d0c3074407cc8f7b80a4','sameOriginalStderrStdoutRetentionAndEnvironment':True,'rawPsFdLocalOnly':True,'automaticRetry':False},
 'scope':'Read-only source review of root once-launcher binding derivative and existing fullguard source receipt. No launcher/import/guard execution, runtime probes, private baseline/source reads or Git/repo mutation. Root alone may issue actual scan authority; runtime success remains unknown.',
 'actualGrant':None,'actualScanOutcome':None,'gameAuthorization':False,
}
r=save('RECEIPT.json',receipt)
seal={'schema':'1370-independent-source-review-seal/v1','files':{'RECEIPT.json':r,'prepare-review.py':role(OUT/'prepare-review.py')},'executionAuthorization':False}
for v in seal['files'].values():assert role(Path(v['path']))==v
se=save('SEAL.json',seal)
for f in OUT.iterdir():f.chmod(0o444)
OUT.chmod(0o555)
print(json.dumps({'receipt':r,'seal':se},indent=2))
