import ast,json,os
from pathlib import Path
A=Path(__file__).parent;S=A.parent
old=(A/'review_fullfunction_shared_post_source.py').read_text();ns={'__file__':str(A/'review_fullfunction_shared_post_source.py')};exec(compile(old[:old.index('manifest=role(')],'accepted-source-review-helpers','exec'),ns)
role=ns['role'];patch=ns['patch'];Q=S/'1370-an-fullfunction-shared-fullpostflight-source-20261010-r4';B=S/'1370-an-fullfunction-shared-fullpostflight-source-20261010-r3'
mr=role(Q/'SOURCE-PINS.json');assert mr['sha256']=='f98fcdbffe35eab67ebd18e3da43cafc91b4b719f6831166c5a58cce4f76ad36'
pins=json.loads((Q/'SOURCE-PINS.json').read_bytes())
for r in pins['files'].values():assert role(r['path'])==r
checks=[]
for name in ('launch-fullpostflight.py','read-fullpostflight.py'):
 before=(B/name).read_text();after=(Q/name).read_text();assert (Q/('R3-BASELINE-'+name)).read_text()==before
 assert patch(before,(Q/(name+'.r4-forward.diff')).read_text())==after and patch(after,(Q/(name+'.r4-inverse.diff')).read_text())==before
 transformed=before.replace('1370-an-fullfunction-shared-fullpostflight-parent-recorded-20261010-r1','1370-an-fullfunction-shared-fullpostflight-parent-recorded-20261010-r2').replace('postflight-fullfunction-qualification-r1','postflight-fullfunction-qualification-r2');assert transformed==after
 compile(after,str(Q/name),'exec');checks.append({'source':name,'completeForwardAndInverseExact':True,'onlyFreshParentAndEvidencePathsChanged':True,'compileOnly':True})
out={'schema':'1370-root-independent-fullfunction-shared-post-source-review/v1','decision':'ACCEPT_STATIC_ORIGINAL_SHARED_FULL_POSTFLIGHT_ADAPTER_AFTER_FULLFUNCTION_PASS_OR_STOP','sourceManifest':mr,'concreteFindings':[],'executionAuthorization':False,'sourceOnly':True,'reviewer':'root; adapter authored by m0_types_source_review','checks':checks,'originalGuardConfigBaselineAndClocksUnchanged':True,'separateRecordedPidsAndGroupIds':True,'noMissingExitCoercion':True,'rawPsFdLocalOnly':True}
p=A/'FULLFUNCTION-RETRY-SHARED-POST-SOURCE-REVIEW.json'
with p.open('x') as f:json.dump(out,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
p.chmod(0o444);print(json.dumps(role(p)))
