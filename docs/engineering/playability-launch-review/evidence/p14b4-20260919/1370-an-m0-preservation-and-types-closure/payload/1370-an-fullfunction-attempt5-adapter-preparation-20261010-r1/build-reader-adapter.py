from pathlib import Path
import json,os,hashlib,ast,difflib,re
S=Path('/Users/zacheryspector/studio-scratch')
BASE=S/'1370-an-fullfunction-r4-root-readback-source-20261010-r1'
OUT=S/'1370-an-fullfunction-r5-root-readback-source-20261010-r1'
F=S/'1370-an-m0-fullfunction-qualification-source-20261010-r12'
def role(p):
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def auth(p,n,h):
 r=role(p);assert r['bytes']==n and r['sha256']==h,r;return json.loads(p.read_bytes()),r
def write(n,v):
 b=v if isinstance(v,bytes) else v.encode() if isinstance(v,str) else (json.dumps(v,sort_keys=True,indent=2)+'\n').encode()
 with (OUT/n).open('xb') as f:f.write(b);f.flush();os.fsync(f.fileno())
 return role(OUT/n)
def helpers(s):
 t=ast.parse(s);return {n.name:ast.get_source_segment(s,n) for n in t.body if isinstance(n,ast.FunctionDef) and n.name!='main'}
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
m,mr=auth(BASE/'SOURCE-PINS.json',2045,'66b77f4029f90c14f919a82a6633d1d9c76030a3af6b068b6b49e9ed8434e34b')
rv,rvr=auth(S/'1370-an-root-continuation-20261009-r1/FULLFUNCTION-R4-READBACK-SOURCE-REVIEW.json',1986,'14b78b1df94fabe45925f933232a7db0968a55a8ab4bf40037a186b390edc4ba')
for r in m['files'].values():assert role(Path(r['path']))==r
fm,fmr=auth(F/'SOURCE-PINS.json',14385,'79d9400a49dc02abc836d9e3b9e9f4a814966da47cae67293f299b1993deb283')
c,cr=auth(F/'CONFIG.json',13790,'efb9f7b597a6781a69488437faea4755f4a4d186848bfe30baa1c801fa4cf669')
aliases=['CONFIG.json','run-fullfunction.py','run-fullfunction.mjs','record-fullfunction.py','CORE-TEST-TEMPLATE.ts','CONFIG-TEMPLATE.mts','FULL-BODY-CONTROLS-TEMPLATE.ts','exact-json.mjs','run-parser-controls.mjs','canonical-typescript-transform.mjs','m0WiringProbe.ts','RESOLUTION-SOURCE-BINDING.json','m0TraceCodec.mjs','traceSequences.mjs','ordering.ts']
for n in aliases:assert role(Path(fm['files'][n]['path']))==fm['files'][n]
before=(BASE/'read-fullfunction.py').read_text();after=before
oldtuple="('CONFIG.json','run-fullfunction.py','run-fullfunction.mjs','record-fullfunction.py','CORE-TEST-TEMPLATE.ts','CONFIG-TEMPLATE.mts','FULL-BODY-CONTROLS-TEMPLATE.ts','exact-json.mjs','run-parser-controls.mjs','canonical-typescript-transform.mjs','m0WiringProbe.ts','RESOLUTION-SOURCE-BINDING.json')"
changes=[('1370-an-m0-fullfunction-parent-recorded-20261010-r4','1370-an-m0-fullfunction-parent-recorded-20261010-r5'),('1370-an-m0-fullfunction-qualification-source-20261010-r11','1370-an-m0-fullfunction-qualification-source-20261010-r12'),('8a6e67c7bea7c897e83f27f418d4743bfd1b9035ddd70147e9615e92658c81d6',cr['sha256']),('18b014711ab516c421e5ade49a6cea9757f34ba9aa85f896e126087be3349b36',fmr['sha256']),(oldtuple,repr(tuple(aliases)))]
for old,new in changes:assert after.count(old)==1,(old,after.count(old));after=after.replace(old,new)
check=after
for old,new in reversed(changes):assert check.count(new)==1;check=check.replace(new,old)
assert check==before and helpers(before)==helpers(after)
def dict_signature(src,variable):
 tree=ast.parse(src);found=[]
 for n in ast.walk(tree):
  if isinstance(n,ast.Assign) and any(isinstance(t,ast.Name) and t.id==variable for t in n.targets) and isinstance(n.value,ast.Dict):
   keys=[k.value if isinstance(k,ast.Constant) else None for k in n.value.keys]
   if 'schema' in keys:
    val=n.value.values[keys.index('schema')]
    found.append({'keys':keys,'schema':val.value if isinstance(val,ast.Constant) else None})
 return found
oldcontroller=(S/'1370-an-m0-fullfunction-qualification-source-20261010-r11/run-fullfunction.py').read_text()
newcontroller=(F/'run-fullfunction.py').read_text()
controller_contract=dict_signature(oldcontroller,'result');assert controller_contract==dict_signature(newcontroller,'result')
oldrec=(S/'1370-an-m0-fullfunction-qualification-source-20261010-r11/record-fullfunction.py').read_text()
newrec=(F/'record-fullfunction.py').read_text()
rec_contract=dict_signature(oldrec,'result');assert rec_contract==dict_signature(newrec,'result')
oldnode=(S/'1370-an-m0-fullfunction-qualification-source-20261010-r11/run-fullfunction.mjs').read_text();newnode=(F/'run-fullfunction.mjs').read_text()
node_result_suffix="const final={schema:'1370-fullfunction-node-result/v1',status:'PASS_REAL_FULL_FUNCTION_FIXTURES_BASELINE_SPECIFIC_TYPED_CATCH_RED',"
assert node_result_suffix in oldnode and node_result_suffix in newnode
OUT.mkdir(mode=0o700)
br=write('BASELINE-read-fullfunction.py',before);nr=write('read-fullfunction.py',after)
f=''.join(difflib.unified_diff(before.splitlines(True),after.splitlines(True),fromfile='BASE/read-fullfunction.py',tofile='NEW/read-fullfunction.py'))
inv=''.join(difflib.unified_diff(after.splitlines(True),before.splitlines(True),fromfile='NEW/read-fullfunction.py',tofile='BASE/read-fullfunction.py'))
assert apply_diff(f,before)==after and apply_diff(inv,after)==before
fr=write('read-fullfunction.forward.diff',f);ir=write('read-fullfunction.inverse.diff',inv)
write('SOURCE-PROOF.json',{'schema':'1370-fresh-attempt5-fullfunction-root-readback-source-proof/v1','executionAuthorization':False,'predecessorSourceManifest':mr,'predecessorAcceptedRootReview':rvr,'admittedProspectiveRouteSourceManifest':fmr,'prospectiveRouteConfig':cr,'exactFiveSingleSubstitutions':changes,'baseline':br,'derivative':nr,'forward':fr,'inverse':ir,'wholeNormalizationInverseExact':True,'wholeRetainedForwardInverseApplicationsExact':True,'allNonMainHelpersByteEqual':True,'readerProtocolOtherwiseByteUnchanged':True,'controllerReportContractUnchanged':controller_contract,'recorderReportContractUnchanged':rec_contract,'nodeReportSchemaStatusUnchanged':True,'reviewAliases':aliases,'expectedRuntimeAliasRoles':{n:fm['files'][n] for n in aliases},'losslessControlsAuthorityProvenance':'Existing authenticated grant/rootbinding/sourceadoption roles retain actual losslessControlsObservedAdoption. No new readback fields or semantic gate added; original PASS/STOP/nullability/proof/phase/mutant/cleanup predicates unchanged.','noSourceAuthorRuntime':True,'futureActualSessionId':None,'futureActualGrant':None,'futureActualTool':None,'futureReadback':None})
recipe=json.loads((BASE/'RECIPE.json').read_bytes());recipe['schema']='1370-fresh-attempt5-fullfunction-root-readback-recipe/v1'
recipe['argv']=[str(x).replace(BASE.name,OUT.name) for x in recipe['argv']]
recipe['freshParentPath']=str(S/'1370-an-m0-fullfunction-parent-recorded-20261010-r5')
recipe['routeSourceManifest']=fmr;recipe['routeConfig']=cr;recipe['reviewAliases']=aliases
recipe['futureActualSessionId']=None;recipe['futureActualGrant']=None;recipe['futureActualTool']=None;recipe['futureReadback']=None
recipe['sourceScope']='Binding-only exact five replacements from qualified R4 reader; root owns actual finite-evidence readback. No runtime, private traversal, new gate or schema change.'
write('RECIPE.json',recipe)
write('LESSONS.txt','Update only authentic retained binding literals and explicit15 runtime aliases; keep the actual PASS/STOP/nullability and exact intended-mutant predicates unchanged. Readback does not supply missing after proofs or silently accept a partial baseline. Complete immutable source inverses are required. Representation and actual49 controls authority remains authenticated in the existing actual grant/rootbinding/source chain, without introducing a new reader protocol. All future execution/outcome roles remain unknown until genuine.\n')
files={p.name:role(p) for p in OUT.iterdir()}
pins=write('SOURCE-PINS.json',{'schema':'1370-fullfunction-root-readback-source-pins/v1','executionAuthorization':False,'files':files})
for r in files.values():assert role(Path(r['path']))==r
seal=write('SEAL.json',{'schema':'1370-fresh-root-readback-source-seal/v1','sourceManifest':pins,'allManifestRolesReadbackEqual':True,'executionAuthorization':False})
for p in OUT.iterdir():p.chmod(0o444)
OUT.chmod(0o555)
print(json.dumps({'sourceManifest':pins,'reader':nr,'seal':seal}))

