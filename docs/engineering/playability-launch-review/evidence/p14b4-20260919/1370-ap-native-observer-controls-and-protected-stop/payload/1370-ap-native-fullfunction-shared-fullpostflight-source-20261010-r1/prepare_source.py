"""Finite source derivative only; does not execute either generated adapter."""
from pathlib import Path
import ast,difflib,hashlib,json,os,warnings
S=Path('/Users/zacheryspector/studio-scratch');D=Path(__file__).resolve().parent
B=S/'1370-ao-fullfunction-observer-row-diagnostic-shared-fullpostflight-source-20261010-r1'
A=S/'1370-ap-root-continuation-20261010-r1'
def role(p):
 b=Path(p).read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def put(name,v):
 p=D/name
 with p.open('x') as f:f.write(json.dumps(v,indent=2)+'\n');f.flush();os.fsync(f.fileno())
 return role(p)
def helper_texts(t):
 return {n.name:ast.get_source_segment(t,n) for n in ast.parse(t).body if isinstance(n,(ast.FunctionDef,ast.ClassDef))}
pins=json.loads((B/'SOURCE-PINS.json').read_text())
for r in pins['files'].values():assert role(r['path'])==r
ar=role(A/'CURRENT-AO-FULL-PREFLIGHT-OBSERVED-ADOPTION.json');assert ar['sha256']=='e3804904e003a7178e98c3d6d83c52ff32194f1117cef780d24c3d1c88849552'
authority=json.loads(Path(ar['path']).read_text())
changes=[
 ('1370-ao-root-continuation-20261010-r1','1370-ap-root-continuation-20261010-r1'),
 ('1370-ao-current-operational-fullguard-source-20261010-r1','1370-ap-current-operational-fullguard-source-20261010-r1'),
 ('1370-ao-fullfunction-observer-row-diagnostic-shared-fullpostflight-parent-recorded-20261010-r1','1370-ap-native-fullfunction-shared-fullpostflight-parent-recorded-20261010-r1'),
 ('CURRENT-AN-FULL-PREFLIGHT-OBSERVED-ADOPTION.json','CURRENT-AO-FULL-PREFLIGHT-OBSERVED-ADOPTION.json'),
 ('753a7597c20032c70b2a07c9001de15ba1f72b5a0a5ac7706e340228da5fef5a',ar['sha256']),
 ('ROOT_ADOPTED_CURRENT_AN_FULL_PREFLIGHT','ROOT_ADOPTED_CURRENT_AO_FULL_PREFLIGHT'),
 ('9df63e39d302e3b8481198999e129233ab4eb5709848d91cb1d45af0dfee0e88',authority['sourcePins']['sha256']),
 ('postflight-fullfunction-observer-row-diagnostic-r1','postflight-fullfunction-native-observer-r1'),
 ('1370-ao-fullpostflight-raw-local-only/v1','1370-ap-fullpostflight-raw-local-only/v1'),
 ('1370-ao-fullfunction-shared-fullpostflight-readback/v1','1370-ap-native-fullfunction-shared-fullpostflight-readback/v1'),
 ('under current AN.','under current AO.'),
]
proof=[]
for name in ('launch-fullpostflight.py','read-fullpostflight.py'):
 old=(B/name).read_text();new=old;applied=[]
 for before,after in changes:
  count=new.count(before)
  if count:new=new.replace(before,after);applied.append({'before':before,'after':after,'count':count})
 restored=new
 for change in reversed(applied):
  assert restored.count(change['after'])==change['count']
  restored=restored.replace(change['after'],change['before'])
 assert restored==old and helper_texts(new)==helper_texts(old)
 with warnings.catch_warnings():warnings.simplefilter('error',SyntaxWarning);compile(new,str(D/name),'exec')
 for fn,body in [(name,new),('BASELINE-'+name,old)]:
  with (D/fn).open('x') as f:f.write(body)
 for direction,left,right in [('forward',old,new),('inverse',new,old)]:
  with (D/(name+'.'+direction+'.diff')).open('x') as f:f.writelines(difflib.unified_diff(left.splitlines(True),right.splitlines(True),fromfile='before',tofile='after'))
 proof.append({'source':role(D/name),'baseline':role(B/name),'retainedBaseline':role(D/('BASELINE-'+name)),'applications':applied,'wholeInverseActuallyEqual':True,'allOriginalHelpersByteExact':list(helper_texts(old)),'staticCompilationOnly':True})
recipe=put('RECIPE.json',{'schema':'1370-ap-native-fullfunction-shared-fullpostflight-recipe/v1','scope':'Mandatory original complete shared postflight against genuine fresh AO before-fill baseline ed62 after the native fullfunction route, including STOP. Original whole immutable map/nine strict roots/current predicates remain exact. No original M0 AFTER proof or gameplay success invented.',
 'preflightAdoption':ar,'baseline':authority['snapshot'],'guardSource':authority['guardSource'],'guardConfig':authority['config'],'guardSourcePins':authority['sourcePins'],'guardSourceReview':authority['sourceReview'],
 'launcherArguments':['actual fullfunction READBACK absolute path','actual READBACK sha256'],'readerArguments':['actual postflight tool session id','actual GRANT sha256'],
 'originalPerCommandTimeoutSeconds':180,'wholeScanDeadline':None,'wholeImmutableMapAndNineStrictRootsEqualityRequired':True,'actualOwnedIdsRequired':True,'rawWholeMachineEvidence':'LOCAL_HASH_SIZE_ONLY',
 'actualRouteReadback':None,'actualGrant':None,'actualPostflight':None,'executionAuthorization':False,'noGameAcceptance':True})
put('SOURCE-PROOF.json',{'schema':'1370-ap-native-fullfunction-postflight-source-proof/v1','predecessorSourcePins':role(B/'SOURCE-PINS.json'),'applications':proof,'wholeInverseApplications':2,'helperCounts':[len(helper_texts((B/n).read_text())) for n in ('launch-fullpostflight.py','read-fullpostflight.py')],
 'currentAOProtectionAuthority':ar,'futureActualsUnfilled':True,'historicalTypesAndM0ProofsSeparate':True,'noRuntimeExecuted':True,'executionAuthorization':False})
files={p.name:role(p) for p in D.iterdir() if p.is_file()}
manifest=put('SOURCE-PINS.json',{'schema':'1370-ap-native-fullfunction-postflight-source-pins/v1','files':files,'executionAuthorization':False})
seal=put('SEAL.json',{'schema':'1370-ap-source-seal/v1','sourceManifest':manifest,'payloadFiles':len(files),'actualExecution':False,'executionAuthorization':False})
for p in D.iterdir():p.chmod(0o444)
D.chmod(0o555)
print(json.dumps({'sourceManifest':manifest,'recipe':recipe,'seal':seal}))
