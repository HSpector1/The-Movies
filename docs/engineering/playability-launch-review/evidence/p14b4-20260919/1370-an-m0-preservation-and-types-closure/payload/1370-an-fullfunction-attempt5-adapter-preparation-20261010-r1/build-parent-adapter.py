from pathlib import Path
import json,os,hashlib,ast,difflib,re
S=Path('/Users/zacheryspector/studio-scratch')
BASE=S/'1370-an-m0-fullfunction-parent-source-20261010-r4'
OUT=S/'1370-an-m0-fullfunction-parent-source-20261010-r5'
C=S/'1370-an-lossless-trace-codec-consumers-source-20261010-r3'
def role(p):
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def auth(p,n,h):
 r=role(p);assert r['bytes']==n and r['sha256']==h;return json.loads(p.read_bytes()),r
def write(n,v):
 b=v if isinstance(v,bytes) else v.encode() if isinstance(v,str) else (json.dumps(v,sort_keys=True,indent=2)+'\n').encode()
 with (OUT/n).open('xb') as f:f.write(b);f.flush();os.fsync(f.fileno())
 return role(OUT/n)
def change(s,a,b):
 assert s.count(a)==1,(a,s.count(a));return s.replace(a,b,1)
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
m,mr=auth(BASE/'SOURCE-PINS.json',2017,'bbd9477ee57d96fbf4b325277542819725cff0d707418aea6acd038d10d55618')
review,rr=auth(S/'1370-an-m0-fullfunction-parent-independent-source-review-20261010-r4/RECEIPT.json',3118,'6ebdd529dbb7d5a1fff2483c72eff328230dbac794da9ea35928fd47213fd86d')
assert review['sourceManifest']==mr and review['executionAuthorization'] is False and review['concreteFindings']==[]
for r in m['files'].values():assert role(Path(r['path']))==r
cm,cmr=auth(C/'SOURCE-PINS.json',9104,'7f2ef8499136e025a90ec67c417b1788e1209c69764a448527bb0a5244d68027')
names=['m0TraceCodec.mjs','traceSequences.mjs','m0WiringProbe.ts','ordering.ts','FULL-BODY-CONTROLS-TEMPLATE.ts']
external={n:cm['files'][n] for n in names}
for r in external.values():assert role(Path(r['path']))==r
before=(BASE/'launch-fullfunction.py').read_text();after=before
after=change(after," parser_config=load(authenticate(sp['files']['CONFIG.json']))"," parser_config=load(authenticate(sp['files']['CONFIG.json']))\n representation_roles="+repr(external)+"\n require(exact(parser_config['representationInputs'],representation_roles),'EXACT_FIXED_REPRESENTATION_INPUTS')")
after=change(after,"  else:require(Path(r['path'])==source/name,'ROUTE_FILE_PATH')","  elif name in representation_roles:require(exact(r,representation_roles[name]),'EXACT_REVIEWED_EXTERNAL_REPRESENTATION_ROLE')\n  else:require(Path(r['path'])==source/name,'ROUTE_FILE_PATH')")
old="('CONFIG.json','run-fullfunction.py','run-fullfunction.mjs','record-fullfunction.py','CORE-TEST-TEMPLATE.ts','CONFIG-TEMPLATE.mts','FULL-BODY-CONTROLS-TEMPLATE.ts','exact-json.mjs','run-parser-controls.mjs')"
aliases=['CONFIG.json','run-fullfunction.py','run-fullfunction.mjs','record-fullfunction.py','CORE-TEST-TEMPLATE.ts','CONFIG-TEMPLATE.mts','FULL-BODY-CONTROLS-TEMPLATE.ts','exact-json.mjs','run-parser-controls.mjs','canonical-typescript-transform.mjs','m0WiringProbe.ts','RESOLUTION-SOURCE-BINDING.json','m0TraceCodec.mjs','traceSequences.mjs','ordering.ts']
after=change(after,old,repr(tuple(aliases)))
after=change(after," artifact=load(authenticate(b['artifactBoundAdoption']));"," lossless=load(authenticate(b['losslessControlsObservedAdoption']));require(lossless['executionAuthorization'] is False,'EXTERNAL_LOSSLESS_CONTROLS_OBSERVED_ROLE')\n artifact=load(authenticate(b['artifactBoundAdoption']));")
after=change(after,"'parserControlsAdoption':b['parserControlsAdoption'],'runtimeTools':rt","'parserControlsAdoption':b['parserControlsAdoption'],'losslessControlsObservedAdoption':b['losslessControlsObservedAdoption'],'runtimeTools':rt")
after=change(after,'1370-an-m0-fullfunction-parent-recorded-20261010-r4','1370-an-m0-fullfunction-parent-recorded-20261010-r5')
assert helpers(before)==helpers(after)
OUT.mkdir(mode=0o700)
base=write('BASELINE-launch-fullfunction.py',before);new=write('launch-fullfunction.py',after)
f=''.join(difflib.unified_diff(before.splitlines(True),after.splitlines(True),fromfile='BASE/launch-fullfunction.py',tofile='NEW/launch-fullfunction.py'))
inv=''.join(difflib.unified_diff(after.splitlines(True),before.splitlines(True),fromfile='NEW/launch-fullfunction.py',tofile='BASE/launch-fullfunction.py'))
assert apply_diff(f,before)==after and apply_diff(inv,after)==before
fr=write('launch-fullfunction.py.forward.diff',f);ir=write('launch-fullfunction.py.inverse.diff',inv)
write('SOURCE-PROOF.json',{'schema':'1370-fresh-attempt5-parent-source-proof/v1','executionAuthorization':False,'predecessorSourceManifest':mr,'predecessorIndependentSourceReview':rr,'implementationSourceManifest':cmr,'fixedExternalRepresentationInputs':external,'exactTestedParserExceptions':'Two exact F7 parserInputs roles only; unchanged original checks.','reviewAliases':aliases,'changes':['Fresh parent-recorded-r5 path only.','Five exact accepted C/R3 representationInputs fixed paths, bytes and hashes, alongside original two F7 parser exceptions; all other route files local.','Full15 explicit runtime-review aliases.','External genuine losslessControlsObservedAdoption role authenticated and emitted unchanged into lane-owned grant; future R12 reviewed controller/Node own semantic actual49 admission gate before private work.'],'baseline':base,'derivative':new,'forward':fr,'inverse':ir,'wholeRetainedForwardInverseApplicationsExact':True,'allTenNonMainHelperSourcesByteEqual':True,'originalClocksAndOwnGroupDurableClaimsUnchanged':True,'candidateExecuted':False,'futureR12SourceManifest':None,'futureR12Config':None,'futureR12SourceReview':None,'futureCurrentProtection':None,'futureLosslessControlsObservedAdoption':None,'futureActualReadback':None})
recipe=json.loads((BASE/'RECIPE.json').read_bytes())
recipe.update({'schema':'1370-fullfunction-fresh-attempt5-parent-source-recipe/v1','freshParentPath':str(S/'1370-an-m0-fullfunction-parent-recorded-20261010-r5'),'fixedExternalRepresentationInputs':external,'configurationField':'representationInputs','reviewAliases':aliases,'externalObservedRoleGrantKey':'losslessControlsObservedAdoption','semanticObservedControlsGateOwner':'Independently reviewed future R12 controller and Node before private scans/imports; genuine successful recorded public49 controls adoption. This parent authenticates the externally supplied role and transfers it byte/hash-exact into the lane-owned grant.','futureLosslessControlsObservedAdoption':None,'futureR12Config':None,'futureCurrentProtection':None,'futureActualReadback':None,'unchangedTestedParserAllowlist':'Exactly two tested F7 parser roles matched to parserInputs remain external; five additional external representation roles are the fixed admitted C/R3 role map. No broad external-directory exception.'})
recipe['argv'][3]=str(OUT/'launch-fullfunction.py')
recipe['mode']='Source-only exact admitted representation wiring and fresh attempt5 parent. Existing actual failures and all original ownership/clocks/protection requirements preserved.'
write('RECIPE.json',recipe)
write('LESSONS.txt','External roles are exact filename/path/bytes/SHA mappings, never directory allowlists. The actual root once binding, current protection and successful pure49 observed adoption stay external future authority until genuine. Full15 reviewed aliases include canonical transform and resolution binding as well as representation modules. Parent only authenticates/transfers the genuine controls adoption role; independently reviewed R12 runtime must enforce its exact semantic admission before private source reads/imports. Original ten helpers, separate prep60 canceledbeforeexec, 300/320/330 recorder clocks and actual PID/PGID/SID ownership remain unchanged.\n')
files={p.name:role(p) for p in OUT.iterdir()}
pins=write('SOURCE-PINS.json',{'schema':'1370-fullfunction-parent-source-pins/v1','executionAuthorization':False,'files':files})
for r in files.values():assert role(Path(r['path']))==r
seal=write('SEAL.json',{'schema':'1370-fresh-source-parent-adapter-seal/v1','sourceManifest':pins,'allManifestRolesReadbackEqual':True,'executionAuthorization':False})
for p in OUT.iterdir():p.chmod(0o444)
OUT.chmod(0o555)
print(json.dumps({'sourceManifest':pins,'launcher':new,'seal':seal}))

