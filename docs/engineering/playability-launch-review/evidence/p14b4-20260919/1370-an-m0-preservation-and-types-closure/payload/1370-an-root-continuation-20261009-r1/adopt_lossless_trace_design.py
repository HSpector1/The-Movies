import hashlib,json,os,stat,sys
from pathlib import Path
A=Path(__file__).parent;S=A.parent
def role(p):
 p=Path(p);st=p.lstat();assert p.is_absolute() and p.resolve(strict=True)==p and stat.S_ISREG(st.st_mode) and st.st_nlink==1
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def read(p):return json.loads(Path(p).read_bytes())
assert sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize
dr=role(S/'1370-an-fullfunction-lossless-trace-representation-design-20261010-r3/RECEIPT.json');assert dr['sha256']=='4bf0c136dabb47a4afd610ec72f416120f2ad07a7ee00ba4014c6d652c615b0d';d=read(dr['path'])
rr=role(S/'1370-an-fullfunction-lossless-trace-representation-independent-design-review-20261010-r3/RECEIPT.json');assert rr['sha256']=='4e2f0dcc8f53424e03929ea56d84e4bd0e22a8ab15ac5cb00a9d6923fd3536d2';r=read(rr['path'])
assert r['decision']=='ACCEPT_STATIC_LOSSLESS_TRACE_REPRESENTATION_AMENDMENT_DESIGN_ONLY' and r['concreteFindings']==[] and r['executionAuthorization'] is False
assert role(d['design']['path'])==d['design']
for p in d['sourceInputs'].values():assert role(p['path'])==p
v={'schema':'1370-root-lossless-helper-trace-representation-amendment/v1','status':'ROOT_ADOPTED_EXACT_LOSSLESS_COMPRESSED_TRACE_DESIGN_FOR_IMPLEMENTATION_ONLY','designReceipt':dr,'design':d['design'],'independentDesignReview':rr,'oldAccounting':'sum of expanded JSON+newline bytes <=2097152','newAccounting':'16-byte dedicated header plus sum of dedicated frame lengths (9-byte row header + exact compressed bytes) <=2097152 per trace','oldExpandedTotalPredicatePreserved':False,'originalFailuresRemainFailures':True,'helperLogicalEventCap':16384,'helperExpandedRowBytesCap':65536,'helperRetainedEncodedBytesCap':2097152,'observerCapsUnchanged':{'rows':512,'rowBytes':16384,'totalBytes':2097152},'clocksUnchangedSeconds':[300,320,330],'allLogicalEventsAndExactPayloadsRequired':True,'completeFatalTraceRequirementUnchanged':True,'twoDecodedRowTraversalRequired':True,'fixedJsHeapByteGuarantee':None,'stickyOperationalFailureRequired':True,'independentSnapshotsAcrossBeginEndRequired':True,'executionAuthorization':False,'implementationAuthorized':True,'productionGameplayChangesAuthorized':False,'runtimeReady':False,'actualEncodedFit':None,'next':'One scratch implementation writer implements exact codec/probe and bounded consumer migration; independent RED matrix and source review; recorded public codec/affected-consumer controls before a newly reviewed real fullfunction route. Reuse unchanged original18/32 outcomes only for byte-exact helpers; rerun affected original ordering predicates on changed consumer implementation as regression, without relabeling old evidence. No game mutation, M0/private scan or runtime granted here.'}
p=A/'LOSSLESS-TRACE-REPRESENTATION-DESIGN-ADOPTION.json'
with p.open('x') as f:json.dump(v,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
p.chmod(0o444);print(json.dumps(role(p)))
