import hashlib,json,os,sys
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');A=Path(__file__).parent
def role(p):
 p=Path(p);b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
Q=S/'1370-an-fullfunction-r5-root-readback-source-20261010-r2';V=S/'1370-an-fullfunction-r5-root-readback-independent-source-review-20261010-r2/RECEIPT.json'
assert role(V)['sha256']=='2927e08c69b4a02232f68f7723e6a1f496dd6de24442e60ce14ea0a1e47345d2'
v=json.loads(V.read_bytes());assert v['decision']=='ACCEPT_STATIC_FULLFUNCTION_ROOT_READBACK_SOURCE_ONLY' and not v['executionAuthorization'] and not v['concreteFindings']
assert role(Q/'SOURCE-PINS.json')['sha256']=='ddcbae6b479bc97087dcd64f4337a94507bd65c4a63c2cc83d09ec438002dfc6'
for r in json.loads((Q/'SOURCE-PINS.json').read_bytes())['files'].values():assert role(r['path'])==r
assert role(Q/'read-fullfunction.py')['sha256']=='130cfb8a528ba38e8242918012414a2becf0a2beb81c505b7616050542e51a90'
P=S/'1370-an-m0-fullfunction-parent-recorded-20261010-r5';actual=json.loads((P/'ACTUAL-TOOL.json').read_bytes());assert type(actual['sessionId']) is int and type(actual['finalExit']) is int
argv=[sys.executable,'-I','-B',str(Q/'read-fullfunction.py'),str(actual['sessionId']),str(actual['finalExit']),role(P/'EXECUTION-GRANT.json')['sha256'],role(P/'ACTUAL-TOOL.json')['sha256']]
os.execv(argv[0],argv)
