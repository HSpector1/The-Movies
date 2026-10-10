import hashlib,json
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');A=Path(__file__).parent
def role(p,h):
 b=p.read_bytes();assert hashlib.sha256(b).hexdigest()==h
 return {'path':str(p),'bytes':len(b),'sha256':h}
supplement=role(S/'1370-ap-native-observer-source-20261010-r1/DIAGNOSTIC-CODEC-SUPPLEMENT-FINAL.md','696c55e3ea5251da8f522d15495d6438f0b502cf6ca9507141e17ef901d1874e')
review=role(S/'1370-ap-native-observer-diagnostic-codec-supplement-independent-review-20261010-r1/RECEIPT.json','f727b29235472a3573ccdc2366ad1214cad07152af33c25766398d4211e26a76')
v=json.loads(Path(review['path']).read_bytes());assert v['decision']=='ACCEPT_SOURCE_ONLY_BOUNDED_DIAGNOSTIC_CODEC_SUPPLEMENT' and not v['concreteFindings']
api=role(A/'NATIVE-OBSERVER-API-ADOPTION.json','9300b1167ee0b481757023e9a93306432c115c3e6f554733aff42e6c95565c7f')
ad={'schema':'1370-root-diagnostic-codec-supplement-adoption/v1','status':'ROOT_ADOPTED_BOUNDED_DIAGNOSTIC_CODEC_SUPPLEMENT_FOR_PUBLIC_IMPLEMENTATION','supplement':supplement,'independentReview':review,'apiAdoption':api,'implementationAuthorized':True,'executionAuthorization':False,'game':False,'fitMeasured':False,'interpretation':'Exactly two metadata-only methods share the original private bounded encode/decode cores after first original row-byte Error. No healthy-path bypass, latch clearing, append, failed-payload cache, legacyRow bypass or acceptance authority. Invalid empty-latch calls record FORMAT_INVALID before throwing; existing first errors never change. All unchanged normal health/resource predicates and original bounded diagnostic fallback remain.','consumerExtraction':'Existing fullbody canonical/context/digest/inputBytes matching predicate may be extracted into an actual pure consumer shared by fullbody and independent controls with identical existential semantics, assertion and lazy traversal.'}
p=A/'DIAGNOSTIC-CODEC-SUPPLEMENT-ADOPTION.json'
with p.open('x') as f:json.dump(ad,f,sort_keys=True,indent=2);f.write('\n')
b=p.read_bytes();print(json.dumps({'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}))
