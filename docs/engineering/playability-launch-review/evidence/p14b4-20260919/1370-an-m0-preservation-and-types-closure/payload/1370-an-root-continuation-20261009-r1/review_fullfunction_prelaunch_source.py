import ast,hashlib,json,os,re,stat
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');A=Path(__file__).parent;Q=S/'1370-an-m0-fullfunction-current-prelaunch-preparation-source-20261009-r1'
def role(p):
 p=Path(p);st=p.lstat();assert p.resolve(strict=True)==p and stat.S_ISREG(st.st_mode) and st.st_nlink==1
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def patch(text,diff):
 src=text.splitlines(keepends=True);out=[];cursor=0;lines=diff.splitlines(keepends=True);i=2
 while i<len(lines):
  m=re.match(r'@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@',lines[i]);assert m,lines[i]
  start=int(m[1])-1;assert start>=cursor;out.extend(src[cursor:start]);cursor=start;i+=1
  while i<len(lines) and not lines[i].startswith('@@ '):
   code=lines[i][0];value=lines[i][1:];assert code in ' +-'
   if code in ' -':assert src[cursor]==value;cursor+=1
   if code in ' +':out.append(value)
   i+=1
 out.extend(src[cursor:]);return ''.join(out)
manifest=role(Q/'SOURCE-PINS.json');assert manifest['sha256']=='753704a28f8e044181f9d722201ce09a4b475170a1f4ba95f3beb05c4fd1cece'
pins=json.loads((Q/'SOURCE-PINS.json').read_bytes());assert pins['executionAuthorization'] is False
for r in pins['files'].values():assert role(r['path'])==r
checks=[]
for label,oldname,newname in [('launcher','run_types_retry_prelaunch_once.py','run_fullfunction_current_prelaunch_once.py'),('reader','read_types_retry_prelaunch.py','read_fullfunction_current_prelaunch.py')]:
 old=(A/oldname).read_text();new=(Q/newname).read_text();assert (Q/('BASELINE-'+oldname)).read_text()==old
 assert patch(old,(Q/(label+'.forward.diff')).read_text())==new and patch(new,(Q/(label+'.inverse.diff')).read_text())==old
 before=ast.parse(old);after=ast.parse(new)
 functions=[]
 for n in before.body:
  if isinstance(n,ast.FunctionDef):
   matching=next(x for x in after.body if isinstance(x,ast.FunctionDef) and x.name==n.name);assert ast.get_source_segment(old,n)==ast.get_source_segment(new,matching);functions.append(n.name)
 checks.append({'source':newname,'completeForwardAndInverseExact':True,'byteExactHelpers':functions})
v={'schema':'1370-root-independent-fullfunction-prelaunch-preparation-source-review/v1','decision':'ACCEPT_STATIC_FULLFUNCTION_CURRENT_PRELAUNCH_PREPARATION_SOURCE_ONLY','sourceManifest':manifest,'sourcePins':{n:pins['files'][n] for n in ('run_fullfunction_current_prelaunch_once.py','read_fullfunction_current_prelaunch.py','EXACT-ARGV.json')},'concreteFindings':[],'executionAuthorization':False,'actualPreflight':None,'independentReviewer':'root; source authored by cleanup_independent_red','checks':checks,'semanticReview':['Only original three unfilled configuration roles are filled: actual successful shared snapshot0700, recorded four prior IDs and fresh external output. Accepted current-AM original scanner7015/review6f7e remain unchanged.','Genuine types be632/observed aa9b/fullpost d9e5 chain is checked, prior R6 and disk STOP scope preserved. Readback typesAccepted=false is its original pending-stage claim, not substituted for final types admission.','Original direct scanner executes with lock absent, actual PID=PGID=SID recorded; original180-second individual-command bounds retained, no added whole clock or inventory.','Reader takes actual future session/scanner values, checks retained actual tool/exit and grant, authenticates filled config and actual stdout-reported preflight hash, nine strict roots, genuine full-map reuse and all original current predicates.','Raw whole-machine PS/FD remains four exact local-only roles. Reader only claims current shared preflight; no game or new types result.'],'sourceOnly':True}
p=A/'FULLFUNCTION-PREFLIGHT-PREPARATION-SOURCE-REVIEW.json'
with p.open('x') as f:json.dump(v,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
p.chmod(0o444);print(json.dumps(role(p)))
