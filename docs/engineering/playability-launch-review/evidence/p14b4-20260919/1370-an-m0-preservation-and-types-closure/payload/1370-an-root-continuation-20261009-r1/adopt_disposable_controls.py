import hashlib,json,os,stat,sys
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');A=Path(__file__).parent;P=S/'1370-an-disposable-metadata-controls-parent-recorded-20261009-r1'
def role(p):
 p=Path(p);st=p.lstat();assert p.is_absolute() and p.resolve(strict=True)==p and stat.S_ISREG(st.st_mode) and st.st_nlink==1
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def put(p,obj):
 with p.open('x') as f:json.dump(obj,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
 p.chmod(0o444);return role(p)
assert sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize
rpath=S/'1370-an-disposable-metadata-controls-independent-observed-review-20261009-r1/RECEIPT.json';rr=role(rpath);assert rr['sha256']=='d1fc49491307cf21c93be748f99839574d51733ba17f3d4260b3e0d262f8a1e7'
r=json.loads(rpath.read_bytes());assert r['decision']=='ACCEPT_ACTUAL_DISPOSABLE_METADATA_PAIR_ONLY' and r['concreteFindings']==[] and r['executionAuthorization'] is False
for key,value in r.items():
 if type(value) is dict and set(value)=={'path','bytes','sha256'}:assert role(value['path'])==value,key
actual=json.loads((P/'CONSUMER-ACTUAL.json').read_bytes());summary=actual['stdoutSummary'];assert type(actual['actualTool']['exit_code']) is int and actual['actualTool']['exit_code']==0
assert summary['decision']=='ACCEPT_ACTUAL_DISPOSABLE_PAIR_ONLY' and summary['outcomeSha256']==r['outcome']['sha256']
sr=put(P/'CONSUMER-SUMMARY.json',summary)
adoption={'schema':'1370-an-root-disposable-metadata-pair-observed-adoption/v1','status':'ROOT_ADOPTED_ACTUAL_DISPOSABLE_METADATA_PAIR_ONLY','independentObservedReview':rr,'outcome':r['outcome'],'consumerSummary':sr,'consumerActualTool':r['consumerActual'],'sourcePins':r['routeSourcePins'],'sourceReview':r['sourceReview'],'parentAdapterSourcePins':r['parentAdapterSourcePins'],'parentAdapterSourceReview':r['parentAdapterSourceReview'],'sourceAdoption':r['sourceAdoption'],'recorderResult':r['recorderResult'],'actualTool':r['actualTool'],'freshOwnedAbsence':r['freshOwnedAbsence'],'recordedFacts':r['observed'],'originalM0CauseAdmission':False,'originalM0SourcePreservationAdmission':False,'typesAccepted':False,'collectionAcceptedForOriginalM0':False,'game':False,'executionAuthorization':False,'automaticRetry':False,'scope':'Actual disposable loader RED/GREEN only; original R6 STOP and absent M0 after-proofs stay open. Complete original M0 preservation diagnostic and fresh external-config types/collection route remain required.','majorLessons':r['majorLessons']}
ar=put(A/'DISPOSABLE-METADATA-PAIR-OBSERVED-ADOPTION.json',adoption)
print(json.dumps({'rootAdoption':ar,'consumerSummary':sr}))
