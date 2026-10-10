import difflib,hashlib,json,os
from pathlib import Path
A=Path('/Users/zacheryspector/studio-scratch/1370-am-root-continuation-20261009-r1')
def role(p):
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
old=A/'run_m0_postflight_once.py';src=old.read_text()
edits=[("mode=sys.argv[1];assert mode in ('proof','types');", "mode=sys.argv[1];assert mode=='types';"),
 ("assert rb['toolExit']==rb['helperExit']==rb['recorderExit']==rb['runnerExit']==0 and rb['laneReleased'] is True and rb['mode']==mode", "assert rb['toolExit']==rb['helperExit']==rb['recorderExit']==rb['runnerExit']==1 and rb['laneReleased'] is True and rb['mode']==mode and rb['status']=='ACTUAL_M0_TYPES_STOP_PENDING_FULL_POSTFLIGHT_AND_INDEPENDENT_REVIEW' and rb['rootCompilerExit']==2 and rb['sourceProofsEqual'] is True and rb['dependencyProofsEqual'] is True"),
 ("'status':'GRANTED_ONCE_ORIGINAL_SHARED_FULL_POSTFLIGHT','mode':mode", "'status':'GRANTED_ONCE_ORIGINAL_SHARED_FULL_POSTFLIGHT_AFTER_TYPE_FAILURE','priorTypeFailurePreserved':True,'mode':mode")]
new=src
for before,after in edits:assert new.count(before)==1;new=new.replace(before,after,1)
inverse=new
for before,after in reversed(edits):assert inverse.count(after)==1;inverse=inverse.replace(after,before,1)
assert inverse==src
out=A/'run_m0_failed_types_postflight_once.py'
with out.open('x') as f:f.write(new);f.flush();os.fsync(f.fileno())
out.chmod(0o444)
d={'schema':'1370-root-m0-failed-types-original-postflight-parent-adapter/v1','status':'SOURCE_ONLY_PENDING_INDEPENDENT_REVIEW','executionAuthorization':False,'original':role(old),'derivative':role(out),'exactReplacements':[{'before':b,'after':a} for b,a in edits],'wholeFileInverseEqualsOriginal':True,'unchanged':'Original guard source/config/copy authority/baseline/argument-map/full inventory/predicates/per-command180/own scanner/directexec/lock absent/numeric ownership checks/output roles. Only select types, consume observed failure readback instead of success, and label failure-preservation truthfully.','actualFailureReadback':role(Path('/Users/zacheryspector/studio-scratch/1370-c0-m0-types-parent-recorded-after-al-20261009-r5/READBACK.json')),'automaticRetry':False}
p=A/'M0-FAILED-TYPES-POSTFLIGHT-ADAPTER.json'
with p.open('x') as f:json.dump(d,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
p.chmod(0o444);print(json.dumps({'adapter':role(out),'proof':role(p)}))
