from pathlib import Path
import hashlib,json,os
D=Path(__file__).resolve().parent
B=D.parent/'1370-ap-native-fullfunction-current-prelaunch-preparation-source-20261010-r2'
def role(p):
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
old=(B/'prepare_source.py').read_text()
before='ACCEPT_ACTUAL_PURE_NATIVE_OBSERVER_CONTROLS_ONLY'
after='ACCEPT_ACTUAL_PURE_NATIVE_OBSERVER_72_CONTROLS_ONLY'
assert old.count(before)==2
new=old.replace(before,after)
before2="assert ind['decision']=='ACCEPT_ACTUAL_PURE_NATIVE_OBSERVER_72_CONTROLS_ONLY'"
after2="assert ind['schema']=='1370-native-observer-controls-independent-observed-review/v1' and ind['decision']=='ACCEPT_ACTUAL_PURE_NATIVE_OBSERVER_72_CONTROLS_ONLY'"
assert new.count(before2)==1
new=new.replace(before2,after2)
assert new.replace(after2,before2).replace(after,before)==old
with (D/'prepare_source.py').open('x') as f:f.write(new)
proof={'schema':'1370-ap-native-prelaunch-observed-contract-correction/v1','predecessorSourceManifest':role(B/'SOURCE-PINS.json'),
 'finding':'Final agreed observed decision includes explicit72; predecessor provisional label omitted72. Root supplied the exact final observed schema too.',
 'oldDecision':'ACCEPT_ACTUAL_PURE_NATIVE_OBSERVER_CONTROLS_ONLY','newDecision':after,
 'observedReviewSchema':'1370-native-observer-controls-independent-observed-review/v1',
 'sourceCorrection':'Exact label correction in launcher/reader/CONTRACT and explicit observed schema validation; fresh source-package bindings only. Root adoption and actual readback schema/status remain unchanged.',
 'originalSourceBuilderInverseActuallyEqual':True,'predecessorPreservedUnrun':True,'executionAuthorization':False}
with (D/'PREDECESSOR-CONTRACT-CORRECTION.json').open('x') as f:json.dump(proof,f,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
