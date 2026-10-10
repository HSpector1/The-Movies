import hashlib,json,os,sys
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch')
def role(p):
 p=Path(p);b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
Q=S/'1370-an-fullfunction-shared-fullpostflight-source-20261010-r8';V=S/'1370-an-fullfunction-shared-fullpostflight-independent-source-review-20261010-r8/RECEIPT.json'
assert role(V)['sha256']=='8e1249cd33fb4cfcaec42398220fcccca92a45517a7196e4e72803659828aa74'
v=json.loads(V.read_bytes());assert v['decision']=='ACCEPT_STATIC_ORIGINAL_SHARED_FULL_POSTFLIGHT_ADAPTER_AFTER_FULLFUNCTION_PASS_OR_STOP' and not v['executionAuthorization'] and not v['concreteFindings']
assert role(Q/'SOURCE-PINS.json')['sha256']=='9af7b525628eb79336121909f54ca7a6c6afb342c2172fb199507eef57146878'
for r in json.loads((Q/'SOURCE-PINS.json').read_bytes())['files'].values():assert role(r['path'])==r
assert role(Q/'read-fullpostflight.py')['sha256']=='1f08bf32ef32e27e053de758bece9bb57d82ea572f3ed9cd70813b9bc26f0da2'
P=S/'1370-an-fullfunction-shared-fullpostflight-parent-recorded-20261010-r5';actual=json.loads((P/'ACTUAL-TOOL.json').read_bytes());assert type(actual['sessionId']) is int and actual['finalExit']==0
argv=[sys.executable,'-I','-B',str(Q/'read-fullpostflight.py'),str(actual['sessionId']),role(P/'GRANT.json')['sha256']]
os.execv(argv[0],argv)
