import json,os
from pathlib import Path
A=Path(__file__).parent;S=A.parent
base=(A/'review_fullfunction_shared_post_source.py').read_text();ns={'__file__':str(A/'review_fullfunction_shared_post_source.py')};exec(compile(base[:base.index('manifest=role(')],'accepted-review-helpers','exec'),ns);role=ns['role'];patch=ns['patch']
Q=S/'1370-an-fullfunction-r4-root-readback-source-20261010-r1';mr=role(Q/'SOURCE-PINS.json');assert mr['sha256']=='66b77f4029f90c14f919a82a6633d1d9c76030a3af6b068b6b49e9ed8434e34b'
m=json.loads((Q/'SOURCE-PINS.json').read_bytes())
for r in m['files'].values():assert role(r['path'])==r
p=json.loads((Q/'SOURCE-PROOF.json').read_bytes());assert role(p['predecessorSource']['path'])==p['predecessorSource'] and role(p['predecessor']['path'])==p['predecessor']
old=Path(p['predecessorSource']['path']).read_text();new=(Q/'read-fullfunction.py').read_text();assert (Q/'BASELINE-read-fullfunction.py').read_text()==old
assert patch(old,(Q/'read-fullfunction.forward.diff').read_text())==new and patch(new,(Q/'read-fullfunction.inverse.diff').read_text())==old
v=old
for a,b in p['fiveLiteralSubstitutions']:assert v.count(a)==1;v=v.replace(a,b)
assert v==new;compile(new,str(Q/'read-fullfunction.py'),'exec')
out={'schema':'1370-root-independent-fullfunction-retained-readback-source-review/v1','decision':'ACCEPT_STATIC_FINITE_R4_FULLFUNCTION_RETAINED_READBACK_ONLY','sourceManifest':mr,'source':role(Q/'read-fullfunction.py'),'reviewer':'root; source authored by b109_focused_route_review','concreteFindings':[],'executionAuthorization':False,'actualOutcome':None,'wholeForwardAndInverseExact':True,'onlyFiveLiteralSubstitutions':p['fiveLiteralSubstitutions'],'allPassStopProofNullAndOwnershipClausesUnchanged':True,'previousRootReview':role(A/'FULLFUNCTION-R3-READBACK-SOURCE-REVIEW.json')}
f=A/'FULLFUNCTION-R4-READBACK-SOURCE-REVIEW.json'
with f.open('x') as h:json.dump(out,h,sort_keys=True,indent=2);h.write('\n');h.flush();os.fsync(h.fileno())
f.chmod(0o444);print(json.dumps(role(f)))
