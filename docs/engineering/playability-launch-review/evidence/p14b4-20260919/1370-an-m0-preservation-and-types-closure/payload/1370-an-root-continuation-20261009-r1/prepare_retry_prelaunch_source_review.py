import ast,hashlib,json,os,stat,sys
from pathlib import Path
A=Path(__file__).parent;S=A.parent
base=(A/'review_fullfunction_prelaunch_source.py').read_text()
prefix=base[:base.index('manifest=role(')]
ns={'__file__':str(A/'review_fullfunction_prelaunch_source.py')};exec(compile(prefix,'accepted-review-helpers','exec'),ns)
role=ns['role'];patch=ns['patch']
Q=S/'1370-an-m0-fullfunction-current-prelaunch-preparation-source-20261010-r2';B=S/'1370-an-m0-fullfunction-current-prelaunch-preparation-source-20261009-r1'
manifest=role(Q/'SOURCE-PINS.json');assert manifest['sha256']=='07832ac63601daf7077d126514a44feb91adb4c553afe2148d80b8fbbc516ce7'
pins=json.loads((Q/'SOURCE-PINS.json').read_bytes());assert pins['executionAuthorization'] is False
for r in pins['files'].values():assert role(r['path'])==r
proof=json.loads((Q/'SOURCE-PROOF.json').read_bytes());assert role(B/'SOURCE-PINS.json')==proof['baseManifest']
checks=[]
for label,name in [('launcher','run_fullfunction_current_prelaunch_once.py'),('reader','read_fullfunction_current_prelaunch.py')]:
 old=(B/name).read_text();new=(Q/name).read_text();assert (Q/('BASE-r1-'+label+'.py.txt')).read_text()==old
 assert patch(old,(Q/(label+'.forward.diff')).read_text())==new and patch(new,(Q/(label+'.inverse.diff')).read_text())==old
 restored=new
 for c in reversed(proof['sourceChanges'][label]):
  assert restored.count(c['after'])==c['occurrences'];restored=restored.replace(c['after'],c['before'])
 assert restored==old
 compile(new,str(Q/name),'exec')
 before=ast.parse(old);after=ast.parse(new);helpers=[]
 for n in before.body:
  if isinstance(n,ast.FunctionDef):
   other=next(x for x in after.body if isinstance(x,ast.FunctionDef) and x.name==n.name);assert ast.get_source_segment(old,n)==ast.get_source_segment(new,other);helpers.append(n.name)
 checks.append({'source':name,'wholeForwardAndInverseExact':True,'declaredChangesInverseExact':True,'byteExactHelpers':helpers,'compileOnlySyntaxWarningError':True})
v={'schema':'1370-root-independent-fullfunction-prelaunch-preparation-source-review/v1','decision':'ACCEPT_STATIC_FULLFUNCTION_RETRY_CURRENT_PRELAUNCH_PREPARATION_SOURCE_ONLY','sourceManifest':manifest,'sourcePins':{n:pins['files'][n] for n in ('run_fullfunction_current_prelaunch_once.py','read_fullfunction_current_prelaunch.py','EXACT-ARGV.json')},'concreteFindings':[],'executionAuthorization':False,'actualPreflight':None,'independentReviewer':'root; source authored by cleanup_independent_red','checks':checks,'semanticReview':['Original scanner7015/review6f7e, nine strict roots, continuous freeze map reuse and per-command180 bound are unchanged. No new inventory or overall clock.','Genuine future latest completed shared postflight and independently reviewed root STOP are separately authenticated from accepted TYPES0700. Original0136 immutable map equality is required; old attempt remains STOP.','Only original three null configuration fields are filled: latest shared snapshot, producer recorded actual group IDs, and fresh R2 output. PID/group identities are not inferred.','Reader requires genuine completed session/scanner, exact grant/config/output, all original current checks and fresh scanner ESRCH. Four raw PS/FD roles remain local-only.','TYPES0700 remains the separate exact types prerequisite; latest shared postflight is explicitly named. No game, new types or historical pass claimed.'],'sourceOnly':True}
p=A/'FULLFUNCTION-RETRY-PREFLIGHT-PREPARATION-SOURCE-REVIEW.json'
with p.open('x') as f:json.dump(v,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
p.chmod(0o444);print(json.dumps(role(p)))
