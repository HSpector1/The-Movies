from pathlib import Path
import os,stat,json,hashlib,ast,difflib
S=Path('/Users/zacheryspector/studio-scratch')
P=S/'1370-c0-m0-additive-expanded-readback-verifier-filled-proposal-after-aj-20261009-r2'
Q=S/'1370-c0-m0-additive-expanded-readback-verifier-physical-python-repair-proposal-after-aj-20261009-r3'
roles={}
def read(p,expected=None):
 p=Path(p);parent=os.open('/',os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW)
 def sig(st):return [st.st_dev,st.st_ino,st.st_mode,st.st_nlink,st.st_size,st.st_mtime_ns,st.st_ctime_ns]
 try:
  for name in p.parent.parts[1:]:
   f=os.open(name,os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW,dir_fd=parent);os.close(parent);parent=f
  before=os.stat(p.name,dir_fd=parent,follow_symlinks=False);assert stat.S_ISREG(before.st_mode) and before.st_nlink==1 and before.st_size<1000000
  fd=os.open(p.name,os.O_RDONLY|os.O_NOFOLLOW,dir_fd=parent)
  try:
   assert sig(os.fstat(fd))==sig(before);blocks=[];size=0
   while True:
    b=os.read(fd,65536)
    if not b:break
    size+=len(b);assert size<1000000;blocks.append(b)
   assert size==before.st_size and sig(os.fstat(fd))==sig(before)==sig(os.stat(p.name,dir_fd=parent,follow_symlinks=False))==sig(p.lstat())
  finally:os.close(fd)
 finally:os.close(parent)
 raw=b''.join(blocks);r={'path':str(p),'bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest()}
 if expected:assert r['sha256']==expected
 roles[str(p)]=r;return raw,r
def obj(p,sha=None):return json.loads(read(p,sha)[0])
oldpins=obj(P/'SOURCE-PINS.json','dfbf25dc7d97aa654dedf625abfd2c2209dcb089c3870d4c49b17d4540125a30')
original={}
for n,r in oldpins['files'].items():
 raw,got=read(P/n,r['sha256']);assert got==r;original[n]=raw
F=S/'1370-c0-m0-expanded-readback-failure-independent-attribution-after-aj-20261009-r1/RECEIPT.json'
failure=obj(F,'fedba7eda2203ce80d37f319e65371dffb9ca8aba04538d7dc2d610f2e9d84e5')
assert failure['decision']=='ACCEPT_OBSERVED_FAILURE_ATTRIBUTION_ALLOW_NARROW_FRESH_PHYSICAL_PYTHON_PREDICATE_REPAIR' and failure['mirrorReadbackStarted'] is False and failure['readbackSucceeded'] is False
outcome=obj(failure['failureOutcome']['path'],failure['failureOutcome']['sha256'])
for r in failure['preservedRoles'].values():
 raw,got=read(r['path'],r['sha256']);assert got==r
grant=obj(failure['preservedRoles']['GRANT.json']['path']);oldReview=obj(grant['exactReview']['path'],grant['exactReview']['sha256'])
assert oldReview['sourcePinsSha256']==oldpins.get('sourcePinsSha256','dfbf25dc7d97aa654dedf625abfd2c2209dcb089c3870d4c49b17d4540125a30')
oldtext=original['verify-expanded.py'].decode();old=failure['allowedFreshSourceRepair']['old'];new=failure['allowedFreshSourceRepair']['new']
assert oldtext.count(old)==1 and new not in oldtext
text=oldtext.replace(old,new);assert text.replace(new,old)==oldtext
oldast=ast.parse(oldtext);newast=ast.parse(text)
def functions(t):return {n.name:ast.dump(n,include_attributes=False) for n in t.body if isinstance(n,ast.FunctionDef)}
of=functions(oldast);nf=functions(newast);assert set(of)==set(nf) and all(of[k]==nf[k] for k in of if k!='main')
cfg=json.loads(original['CONFIG.json']);oldOutput=cfg['outputPath'];assert not os.path.lexists(oldOutput)
cfg['outputPath']=str(S/'1370-c0-m0-additive-expanded-readback-facts-after-aj-20261009-r3.json');assert not os.path.lexists(cfg['outputPath'])
assert len(cfg['futureAuthority']['roles'])==14 and cfg['bounds']['wholeSeconds']==240
Q.mkdir(mode=0o700)
for n,b in original.items():(Q/n).write_bytes(b)
(Q/'verify-expanded.py').write_text(text)
(Q/'CONFIG.json').write_text(json.dumps(cfg,indent=2,sort_keys=True)+'\n')
def role(p):return read(p)[1]
sourcepins={**oldpins,'status':'PHYSICAL_PYTHON_PREDICATE_REPAIR_SOURCE_ONLY_UNRUN_REVIEW_REQUIRED','files':{n:role(Q/n) for n in oldpins['files']},'predecessorFilledSourcePins':roles[str(P/'SOURCE-PINS.json')],'predecessorFilledReview':roles[grant['exactReview']['path']],'observedFailureAttribution':roles[str(F)],'executionAuthorization':False,'verifierExecutionPerformed':False}
(Q/'SOURCE-PINS.json').write_text(json.dumps(sourcepins,indent=2,sort_keys=True)+'\n')
recipe=obj(P/'RECIPE.json');recipe['status']='PHYSICAL_PYTHON_REPAIR_UNRUN_SEPARATE_ROOT_GRANT_REQUIRED';recipe['argv'][3]=str(Q/'verify-expanded.py');recipe['argv'][4]=role(Q/'SOURCE-PINS.json')['sha256']
(Q/'RECIPE.json').write_text(json.dumps(recipe,indent=2,sort_keys=True)+'\n')
for name,before,after in [('verify-expanded.py',oldtext,text),('CONFIG.json',original['CONFIG.json'].decode(),(Q/'CONFIG.json').read_text())]:
 (Q/(name+'.diff')).write_text(''.join(difflib.unified_diff(before.splitlines(keepends=True),after.splitlines(keepends=True),fromfile='immutable-failed-r2/'+name,tofile='fresh-r3/'+name)))
proof={'status':'SOURCE_ONLY_UNRUN_ONE_PREDICATE_REPAIR','originalSourcePins':roles[str(P/'SOURCE-PINS.json')],'originalFailedVerifier':oldpins['files']['verify-expanded.py'],'originalFilledReview':roles[grant['exactReview']['path']],'failureOutcome':failure['failureOutcome'],'independentFailureAttribution':roles[str(F)],'actualFailureExits':{'tool':2,'helper':2,'verifierMeta':2},'actualProbeRole':failure['preservedRoles']['INTERPRETER-PROBE-ACTUAL-TOOL.json'],'actualProbeSpelling':failure['probe']['executable'],'actualProbeStrictPhysicalResolution':failure['probe']['executableResolved'],'oldPredicate':old,'newPredicate':new,'inverseFullVerifierTextExact':True,'unchangedFunctionASTs':sorted(k for k in of if k!='main'),'mainOtherTextExactByInverse':True,'unchangedPinnedDocuments':[n for n in original if n not in ['CONFIG.json','verify-expanded.py']],'configOnlyChange':'outputPath','actual14RolePacketAndPythonPhysicalHashIdentityBindingChecksUnchanged':True,'wholeBound240Unchanged':True,'priorOutputAbsent':oldOutput,'freshOutput':cfg['outputPath'],'verifierImportedOrExecuted':False,'mirrorOrDependencyPayloadRead':False,'readbackSucceeded':False,'currentGroupProbePerformed':False,'numericFailedVerifierPidKnown':False,'newRuntimeGrant':None,'sourceChangedProtected':False,'roles':roles}
(Q/'REPAIR-PROOF.json').write_text(json.dumps(proof,indent=2,sort_keys=True)+'\n')
(Q/'REPAIR-REPORT.md').write_text('SOURCE ONLY UNRUN. Independent attribution fedba7 accepts the observed spelling refusal (actual tool/helper/verifier2) before grant packet, mirror/target or output access. Fresh r3 changes precisely one predicate to strict physical resolution of sys.executable. Direct actual invocation, nofollow pinned physical binary SHA/dev/inode/mode/nlink reads and adopted binding tool equality remain required. Full inverse verifier text is exact; all non-main function ASTs and all other main text are retained. CONFIG changes only fresh outputPath; actual14 completion roles,240-second bound,1740/119393120 data/metadata/link assertions remain unchanged. Original failed r2 source/config/grant/raw/helper/meta and absence facts remain immutable. The unchanged inherited REPORT/FILL-REQUIREMENTS/REUSE-PROOF are historical preparation documents, not claims about this repaired runtime. This new repair report/proof is authoritative for source status. Actual expanded readback remains unperformed; independent repaired-source review, exact fresh root grant, actual0 and full protected postflight are separate mandatory gates. No verifier/proposal import, Node/test/game/fullscan/Git/protected write occurred in authoring.\n')
(Q/'REPAIR-PINS.json').write_text(json.dumps({'status':'SOURCE_ONLY_REPAIR_PROVENANCE_UNRUN','files':{n:role(Q/n) for n in ['SOURCE-PINS.json','RECIPE.json','verify-expanded.py.diff','CONFIG.json.diff','REPAIR-PROOF.json','REPAIR-REPORT.md']},'author':role(Path(__file__))},indent=2,sort_keys=True)+'\n')
print(json.dumps({n:role(Q/n) for n in ['SOURCE-PINS.json','verify-expanded.py','CONFIG.json','RECIPE.json','REPAIR-PROOF.json','REPAIR-PINS.json']}))
