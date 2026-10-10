import hashlib,json,os,stat
from pathlib import Path
A=Path(__file__).parent;S=A.parent
def role(p):
 p=Path(p);s=p.lstat();assert p.resolve(strict=True)==p and stat.S_ISREG(s.st_mode) and s.st_nlink==1
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
r=role(S/'1370-an-fullfunction-r12-lossless-wiring-plan-independent-source-review-20261010-r1/RECEIPT.json')
assert r['sha256']=='e3d329beaf14ba63e26a1e5a78f949af998a0933c71d69fa23cc0a7ffe9b5e1e'
rv=json.loads(Path(r['path']).read_bytes())
assert rv['decision']=='ACCEPT_STATIC_R12_LOSSLESS_WIRING_PLAN_SOURCE_ONLY' and rv['concreteFindings']==[] and rv['executionAuthorization'] is False
p=role(S/'1370-an-fullfunction-r12-lossless-wiring-plan-source-20261010-r1/PLAN.json')
assert p['sha256']=='b08eae014f4b6b7b27ac21a3040f833ce68d401a84a60cf8e46b6461a05f6dcc'
v={'schema':'1370-root-fullfunction-lossless-wiring-plan-adoption/v1','status':'ROOT_ADOPTED_R12_LOSSLESS_WIRING_PLAN_FOR_SOURCE_PREPARATION_ONLY','sourcePlan':p,'independentSourceReview':r,'executionAuthorization':False,'actualPureControlsAdoption':None,'actualFit':None,'baselineAccepted':False,'mutantAccepted':False,'scope':'Exact R11 derivative and fixed genuine representation source aliases, future R5 runtime selectors. Preserve original proof, source/dependency guards and clocks. Seal runtime authority only with genuine observed pure49 adoption. Pure49 exercises codec/probe/pair/order and18 original source cases; fullbodytemplate is only source-reviewed/authenticated until real qualification.'}
out=A/'R12-LOSSLESS-WIRING-PLAN-ADOPTION.json'
with out.open('x') as f:json.dump(v,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
out.chmod(0o444);print(json.dumps(role(out)))
