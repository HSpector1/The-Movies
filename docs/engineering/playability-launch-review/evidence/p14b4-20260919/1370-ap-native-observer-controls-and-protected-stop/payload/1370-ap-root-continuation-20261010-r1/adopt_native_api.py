import hashlib,json
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');A=Path(__file__).parent
def role(p,h=None):
 b=p.read_bytes();r={'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
 if h is not None: assert r['sha256']==h
 return r
review=role(S/'1370-ap-native-observer-api-independent-review-20261010-r1/RECEIPT.json','329452f774cd32baf5e0d760dc85c0b3f8653fa95a90f5fc724f0a7b8e048e88')
v=json.loads(Path(review['path']).read_bytes());assert v['decision']=='ACCEPT_SOURCE_ONLY_NATIVE_OBSERVER_FINAL_API' and not v['concreteFindings']
for k in ['api','contract','rootDesignAdoption','governingDesignContract','independentDesignReview','originalWitness','currentSharedArmTemplateSource','originalMarketAndMutantPredicateSource']:
 assert role(Path(v[k]['path']))==v[k]
for item in v['authenticatedContractRoles']: assert role(Path(item['path']))==item
ad={'schema':'1370-root-native-observer-api-adoption/v1','status':'ROOT_ADOPTED_FINAL_NATIVE_OBSERVER_API_FOR_PUBLIC_IMPLEMENTATION_AND_INDEPENDENT_CONTROLS','api':v['api'],'contract':v['contract'],'independentReview':review,'rootDesignAdoption':v['rootDesignAdoption'],'implementationAuthorized':True,'independentSpecificControlsAuthorized':True,'executionAuthorization':False,'productionMutationAuthorized':False,'fullQualificationAccepted':False,'game':False,'publicImplementationWriter':'/root/m0_types_source_review','independentSpecificControlWriter':'/root/cleanup_independent_red','implementationReviewer':'/root/b109_focused_route_review','productionHead':'f2f97c622db7f5332164b790d1646355e89c00f4','productionSourceTree':'13880d9b0ba72aff5d4c5bcf5d12fe682c5de554','requiredControlCriteria':v['requiredSpecificControlCriteria'],'decisions':['Use one shared chronological first-error latch with explicit presence and immutable bounded physical prior snapshots; ordinary empty-latch cleanup precedence unchanged.','Original known-no-fit native sink row refusal and COUNT/ROW/TOTAL order remain distinct from direct codec work-bound failure.','First native operational error emits no row diagnostic even if later row refusal occurs.','Original independent market recorder, single-use fault restoration and exact30-byte typed-catch mutant remain unchanged.'],'limits':'Source work only. Exact source/control reviews and root adoption precede actual recorded controls. Actual native fit and fullfunction qualification remain unmeasured.'}
p=A/'NATIVE-OBSERVER-API-ADOPTION.json'
with p.open('x') as f:json.dump(ad,f,sort_keys=True,indent=2);f.write('\n')
print(json.dumps(role(p)))
