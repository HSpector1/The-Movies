import ast,difflib,hashlib,json,os,stat,sys
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');A=Path(__file__).parent
B=S/'1370-an-fullfunction-shared-fullpostflight-source-20261010-r8';N=S/'1370-ao-fullfunction-observer-row-diagnostic-shared-fullpostflight-source-20261010-r1'
def role(p):
 p=Path(p);st=p.lstat();assert p.resolve()==p and stat.S_ISREG(st.st_mode) and st.st_nlink==1
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def put(p,b):
 with p.open('xb') as f:f.write(b);f.flush();os.fsync(f.fileno())
 p.chmod(0o444);return role(p)
def doc(p,d):return put(p,(json.dumps(d,sort_keys=True,indent=2)+'\n').encode())
assert sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize and not N.exists()
N.mkdir(mode=0o700);pairs=[]
common=[
 ('1370-an-fullfunction-shared-fullpostflight-parent-recorded-20261010-r5','1370-ao-fullfunction-observer-row-diagnostic-shared-fullpostflight-parent-recorded-20261010-r1'),
 ('1370-an-current-operational-fullguard-source-20261009-r1','1370-ao-current-operational-fullguard-source-20261010-r1'),
 ('postflight-fullfunction-qualification-r5','postflight-fullfunction-observer-row-diagnostic-r1'),
]
special={
 'launch-fullpostflight.py':[
  ('1370-an-root-continuation-20261009-r1','1370-ao-root-continuation-20261010-r1'),
  ('CURRENT-AM-FULL-PREFLIGHT-OBSERVED-ADOPTION.json','CURRENT-AN-FULL-PREFLIGHT-OBSERVED-ADOPTION.json'),
  ('ac3c336fcf4c57b4de25a2d03fe4642719e7137d34ffe24d2106a8210ecc1612','753a7597c20032c70b2a07c9001de15ba1f72b5a0a5ac7706e340228da5fef5a'),
  ('ROOT_ADOPTED_CURRENT_AM_FULL_PREFLIGHT','ROOT_ADOPTED_CURRENT_AN_FULL_PREFLIGHT'),
  ('e638252b8082aa756f56471552327706a17dcf0e2d6bd01628710624ce7ec435','9df63e39d302e3b8481198999e129233ab4eb5709848d91cb1d45af0dfee0e88'),
  ('under current AM.','under current AN.'),
 ],
 'read-fullpostflight.py':[
  ('1370-an-fullpostflight-raw-local-only/v1','1370-ao-fullpostflight-raw-local-only/v1'),
  ('1370-an-fullfunction-shared-fullpostflight-readback/v1','1370-ao-fullfunction-shared-fullpostflight-readback/v1'),
 ]}
for name in special:
 old=(B/name).read_bytes();new=old;changes=common+special[name]
 for x,y in changes:assert new.count(x.encode())>=1 and y.encode() not in new;new=new.replace(x.encode(),y.encode())
 inverse=new
 for x,y in reversed(changes):inverse=inverse.replace(y.encode(),x.encode())
 assert inverse==old
 oa=ast.parse(old);na=ast.parse(new)
 originalFns=[ast.dump(n,include_attributes=False) for n in oa.body if isinstance(n,(ast.FunctionDef,ast.ClassDef))]
 newFns=[ast.dump(n,include_attributes=False) for n in na.body if isinstance(n,(ast.FunctionDef,ast.ClassDef))]
 assert originalFns==newFns
 put(N/('BASELINE-'+name),old);nr=put(N/name,new)
 fwd=put(N/(name+'.forward.diff'),''.join(difflib.unified_diff(old.decode().splitlines(True),new.decode().splitlines(True),fromfile='AN/'+name,tofile='AO/'+name)).encode())
 inv=put(N/(name+'.inverse.diff'),''.join(difflib.unified_diff(new.decode().splitlines(True),old.decode().splitlines(True),fromfile='AO/'+name,tofile='AN/'+name)).encode())
 pairs.append({'base':role(B/name),'new':nr,'forward':fwd,'inverse':inv,'allFunctionAstsEqual':True,'fullInverseEqualsOriginal':True,'changes':[{'before':x,'after':y,'occurrences':old.count(x.encode())} for x,y in changes]})
ad=role(A/'CURRENT-AN-FULL-PREFLIGHT-OBSERVED-ADOPTION.json');assert ad['sha256']=='753a7597c20032c70b2a07c9001de15ba1f72b5a0a5ac7706e340228da5fef5a'
proof=doc(N/'SOURCE-PROOF.json',{'schema':'1370-ao-fullfunction-diagnostic-shared-postflight-binding-proof/v1','pairs':pairs,'completeInversePairs':2,'originalMethodsAndPredicatesUnchanged':True,'newOriginalGuardSource':role(S/'1370-ao-current-operational-fullguard-source-20261010-r1/snapshot.py'),'newFullPreflightAdoption':ad,'executionAuthorization':False})
doc(N/'RECIPE.json',{'schema':'1370-ao-fullfunction-diagnostic-shared-postflight-recipe/v1','executionAuthorization':False,'launcherArguments':['actual fullfunction root READBACK absolute path','actual READBACK sha256'],'readerArguments':['actual postflight tool session id','actual postflight GRANT sha256'],'preflightAdoption':ad,'actualRouteReadback':None,'actualGrant':None,'actualPostflight':None,'originalPerCommandTimeoutSeconds':180,'wholeScanDeadline':None,'actualOwnedIdsRequired':True,'wholeImmutableMapAndNineStrictRootsEqualityRequired':True,'rawWholeMachineEvidence':'LOCAL_HASH_SIZE_ONLY','noGameAcceptance':True,'scope':'Fresh current AN original full postflight against the actual accepted current AN full baseline after diagnostic route completion, including STOP. No predicate or ownership change.'})
pins=doc(N/'SOURCE-PINS.json',{'schema':'1370-fullfunction-shared-fullpostflight-source-pins/v1','files':{p.name:role(p) for p in sorted(N.iterdir()) if p.is_file()},'executionAuthorization':False})
print(json.dumps({'sourcePins':pins,'proof':proof}))
