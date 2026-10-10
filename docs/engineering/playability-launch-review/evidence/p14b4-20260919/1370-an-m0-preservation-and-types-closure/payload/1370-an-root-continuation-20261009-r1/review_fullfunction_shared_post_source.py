import ast,hashlib,json,os,re,stat
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');A=Path(__file__).parent;Q=S/'1370-an-fullfunction-shared-fullpostflight-source-20261010-r3'
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
manifest=role(Q/'SOURCE-PINS.json');assert manifest['sha256']=='d1589a7039240dc5415ffc80ab980f1ff1537b80fa6956eac36e7fe8a85dc889';pins=json.loads((Q/'SOURCE-PINS.json').read_bytes())
for r in pins['files'].values():assert role(r['path'])==r
checks=[]
for oldname,newname in [('run_m0_external_types_r3_fullpostflight_once.py','launch-fullpostflight.py'),('read_m0_external_types_r3_fullpostflight.py','read-fullpostflight.py')]:
 old=(A/oldname).read_text();new=(Q/newname).read_text();assert (Q/('BASELINE-'+oldname)).read_text()==old
 assert patch(old,(Q/(newname+'.forward.diff')).read_text())==new and patch(new,(Q/(newname+'.inverse.diff')).read_text())==old
 before=ast.parse(old);after=ast.parse(new);functions=[]
 for n in before.body:
  if isinstance(n,ast.FunctionDef):
   match=next(x for x in after.body if isinstance(x,ast.FunctionDef) and x.name==n.name);assert ast.get_source_segment(old,n)==ast.get_source_segment(new,match);functions.append(n.name)
 checks.append({'source':newname,'completeForwardAndInverseExact':True,'byteExactHelpers':functions})
out={'schema':'1370-root-independent-fullfunction-shared-post-source-review/v1','decision':'ACCEPT_STATIC_ORIGINAL_SHARED_FULL_POSTFLIGHT_ADAPTER_AFTER_FULLFUNCTION_PASS_OR_STOP','sourceManifest':manifest,'concreteFindings':[],'executionAuthorization':False,'sourceOnly':True,'reviewer':'root; adapter authored by m0_types_source_review','checks':checks,'verified':['Original shared G source/config/current-AM baseline/admission/prior review identities and exact original guard argv retained; no alternate scope, new clock or new inventory method.','Only fresh parent/output label and authentic completed actualroute readback interface change; PASS or STOP retained literally, no zero coercion for nullable unstarted runner.','Actual recorded PID and PGID sets are separately validated, passed only in their proper probe roles; original guard receives group IDs only.','Own scanner PID=PGID=SID recorded before direct exec, source role/pins checked and lane absent. Original180s percommand/no whole timer retained.','Reader checks actual terminal tool0/grant hash supplied after completion, full immutable maps/nine roots/scratchidentity, original raw4localonly, actual priorstatus/exits and cleanup. This never admits game, fullfunction or missing M0 afterproofs.','Relocated launcher explicitly uses actual AN root authority path; original staleDconstant unused and harmless. Earlier sourceR1/R2 preserved unrun.']}
p=A/'FULLFUNCTION-SHARED-POST-SOURCE-REVIEW.json'
with p.open('x') as f:json.dump(out,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
p.chmod(0o444);print(json.dumps(role(p)))
