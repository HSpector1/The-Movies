from pathlib import Path
import os,json,hashlib,ast,difflib,re
S=Path('/Users/zacheryspector/studio-scratch')
P=Path(__file__).parent
BASE=S/'1370-an-fullfunction-shared-fullpostflight-source-20261010-r7'
OUT=S/'1370-an-fullfunction-shared-fullpostflight-source-20261010-r8'
def role(p):
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def write(n,v):
 b=v if isinstance(v,bytes) else v.encode() if isinstance(v,str) else (json.dumps(v,sort_keys=True,indent=2)+'\n').encode()
 with (OUT/n).open('xb') as f:f.write(b);f.flush();os.fsync(f.fileno())
 return role(OUT/n)
def helpers(s):
 t=ast.parse(s);return {n.name:ast.get_source_segment(s,n) for n in t.body if isinstance(n,(ast.FunctionDef,ast.ClassDef)) and n.name!='main'}
def apply_diff(diff,original):
 lines=original.splitlines(keepends=True);out=[];at=0;d=diff.splitlines(keepends=True);i=2
 while i<len(d):
  m=re.match(r'@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@',d[i]);assert m,d[i]
  start=int(m.group(1))-1;count=int(m.group(2) or 1);i+=1;out.extend(lines[at:start]);at=start;consumed=0
  while i<len(d) and not d[i].startswith('@@'):
   line=d[i];i+=1
   if line.startswith(' '):assert lines[at]==line[1:];out.append(line[1:]);at+=1;consumed+=1
   elif line.startswith('-'):assert lines[at]==line[1:];at+=1;consumed+=1
   elif line.startswith('+'):out.append(line[1:])
   else:raise ValueError(line)
  assert consumed==count
 out.extend(lines[at:]);return ''.join(out)
m=json.loads((BASE/'SOURCE-PINS.json').read_bytes())
mr=role(BASE/'SOURCE-PINS.json');assert mr['bytes']==3328 and mr['sha256']=='827e809acded4d54a4d69ed34a1dfb06f3b31f5ea6ce2ddcd5f732abb1681342'
for r in m['files'].values():assert role(Path(r['path']))==r
input_data=json.loads((P/'POST-R7-REVIEW-INPUT.json').read_bytes());rr=input_data['acceptedRootReview']
assert role(Path(rr['path']))==rr
OUT.mkdir(mode=0o700)
changes=[('1370-an-fullfunction-shared-fullpostflight-parent-recorded-20261010-r4-disk-retry','1370-an-fullfunction-shared-fullpostflight-parent-recorded-20261010-r5'),('postflight-fullfunction-qualification-r4-disk-retry','postflight-fullfunction-qualification-r5')]
proofs=[]
for n in ('launch-fullpostflight.py','read-fullpostflight.py'):
 before=(BASE/n).read_text();after=before
 for old,new in changes:assert after.count(old)==1;after=after.replace(old,new)
 check=after
 for old,new in reversed(changes):assert check.count(new)==1;check=check.replace(new,old)
 assert check==before and helpers(before)==helpers(after)
 base=write('BASELINE-'+n,before);new=write(n,after)
 f=''.join(difflib.unified_diff(before.splitlines(True),after.splitlines(True),fromfile='BASE/'+n,tofile='NEW/'+n));inv=''.join(difflib.unified_diff(after.splitlines(True),before.splitlines(True),fromfile='NEW/'+n,tofile='BASE/'+n))
 assert apply_diff(f,before)==after and apply_diff(inv,after)==before
 fr=write(n+'.forward.diff',f);ir=write(n+'.inverse.diff',inv)
 proofs.append({'baseline':base,'derivative':new,'forward':fr,'inverse':ir,'wholeNormalizationInverseExact':True,'wholeRetainedForwardInverseApplicationsExact':True,'originalNonMainHelpersSourceByteEqual':True})
write('SOURCE-PROOF.json',{'schema':'1370-fresh-attempt5-original-shared-postflight-source-proof/v1','executionAuthorization':False,'predecessorSourceManifest':mr,'predecessorAcceptedRootReview':rr,'changes':changes,'completeSourcePairs':proofs,'originalConfigBaselineGuardAndAllChecksUnchanged':True,'oldDiskStop7509AndSuccessfulRecovery17336Retained':True,'futureActualRouteReadback':None,'futureGrant':None,'candidateExecuted':False,'privateInventories':False})
recipe=json.loads((BASE/'RECIPE.json').read_bytes())
recipe['schema']='1370-fullfunction-fresh-attempt5-original-shared-postflight-source-recipe/v1'
recipe['freshParentPath']=str(S/'1370-an-fullfunction-shared-fullpostflight-parent-recorded-20261010-r5')
recipe['freshEvidenceLabel']='postflight-fullfunction-qualification-r5'
recipe['sourceScope']='Path-only source preparation for a future separately authorized original postflight after a genuine attempt5 PASS or STOP. No invocation, automatic retry or cap waiver.'
recipe['launcherArgv'][3]=str(OUT/'launch-fullpostflight.py');recipe['readerArgv'][3]=str(OUT/'read-fullpostflight.py')
recipe['futureActualRouteReadback']=None;recipe['futureSourceReview']=None;recipe['futureGrant']=None
write('RECIPE.json',recipe)
write('LESSONS.txt','Original failed disk-floor post7509 stays failure; successful recovery17336 is separate genuine preservation evidence. Fresh future PASS/STOP readback and externally granted once invocation are required, never substitute old actual ownership identities. This path-only derivative preserves the original full guard/config/baseline, per-command180, scanner own-session identity, retained raw hash/size disposition and all protection checks. No whole scan clock, M0 after proof or runtime authority is invented.\n')
files={p.name:role(p) for p in OUT.iterdir()}
pins=write('SOURCE-PINS.json',{'schema':'1370-fullfunction-shared-fullpostflight-source-pins/v1','executionAuthorization':False,'files':files})
for r in files.values():assert role(Path(r['path']))==r
seal=write('SEAL.json',{'schema':'1370-fresh-source-path-adapter-seal/v1','sourceManifest':pins,'allManifestRolesReadbackEqual':True,'executionAuthorization':False})
for p in OUT.iterdir():p.chmod(0o444)
OUT.chmod(0o555)
print(json.dumps({'sourceManifest':pins,'seal':seal}))

