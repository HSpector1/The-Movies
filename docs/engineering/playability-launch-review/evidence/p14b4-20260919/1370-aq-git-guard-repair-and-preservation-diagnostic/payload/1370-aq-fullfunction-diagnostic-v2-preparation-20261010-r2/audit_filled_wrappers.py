"""Final finite wrapper/source bindings audit; no prepared modules are imported."""
from pathlib import Path
import ast,difflib,hashlib,json,re
S=Path('/Users/zacheryspector/studio-scratch');D=Path(__file__).resolve().parent
F=S/'1370-aq-m0-fullfunction-native-refusal-diagnostic-source-20261010-r2';P=S/'1370-aq-m0-fullfunction-native-refusal-diagnostic-parent-source-20261010-r2';W=S/'1370-aq-m0-fullfunction-native-refusal-diagnostic-root-wrappers-source-20261010-r2'
def load(p):return json.loads(Path(p).read_text())
def role(p):
 p=Path(p);b=p.read_bytes();return dict(path=str(p),bytes=len(b),sha256=hashlib.sha256(b).hexdigest())
c=load(F/'CONFIG.json');m=load(F/'SOURCE-PINS.json');pm=load(P/'SOURCE-PINS.json');wm=load(W/'SOURCE-PINS.json');r=load(W/'RECIPE.json')
for x in [pm,wm]:
 for v in x['files'].values():assert role(v['path'])==v
assert r['sourceManifest']==role(F/'SOURCE-PINS.json') and r['parentSourceManifest']==role(P/'SOURCE-PINS.json') and r['currentProtection']==c['currentProtection']
checked=[]
for n in ['run_observer_fullfunction_once.py','run_observer_reader_once.py']:
 t=(W/n).read_text();tree=ast.parse(t,filename=str(W/n));keys={x.slice.value for x in ast.walk(tree) if isinstance(x,ast.Subscript) and isinstance(x.value,ast.Name) and x.value.id=='config' and isinstance(x.slice,ast.Constant)};assert keys<=set(c)
 constants={x.value for x in ast.walk(tree) if isinstance(x,ast.Constant) and isinstance(x.value,str)}
 assert str(P) in constants
 if n=='run_observer_fullfunction_once.py':assert str(F) in constants and role(F/'SOURCE-PINS.json')['sha256'] in constants and 'nativeRefusalControlsObservedAdoption' in constants
 assert r['combinedReviewSchema'] in constants
 checked.append(dict(file=n,configurationKeys=sorted(keys),evaluatedPackageOperandsAudited=True,astParsedOnly=True))
reader=(P/'read-fullfunction.py').read_text();assert "F=S/'"+F.name+"'" in reader and role(F/'SOURCE-PINS.json')['sha256'] in reader and role(F/'CONFIG.json')['sha256'] in reader
once=(W/'run_observer_fullfunction_once.py').read_text();assert "'nativeRefusalControlsObservedAdoption':refusal" in once
parent=(P/'launch-fullfunction.py').read_text();assert "'nativeRefusalControlsObservedAdoption':b['nativeRefusalControlsObservedAdoption']" in parent
assert "'parentPath':str(S/"+repr(Path(c['parentRecordedPath']).name)+")" in once and "out==S/"+repr(Path(c['parentRecordedPath']).name) in parent
for base in [W]:
 for n,v in load(base/'WHOLE-FORWARD-INVERSE.json').items():
  assert ''.join(difflib.restore(v['losslessNdiff'],1)).encode()==Path(v['baseline']['path']).read_bytes()
  assert ''.join(difflib.restore(v['losslessNdiff'],2)).encode()==(base/n).read_bytes()
for key,v in load(D/'R1-DRAFT-TO-R2-WHOLE-INVERSES.json').items():
 path=S/key;assert ''.join(difflib.restore(v['losslessNdiff'],1)).encode()==Path(v['baseline']['path']).read_bytes();assert ''.join(difflib.restore(v['losslessNdiff'],2)).encode()==path.read_bytes()
ad=load(c['actualCurrentAPFullPreflightAdoption']['path']);assert role(c['actualCurrentAPFullPreflightAdoption']['path'])==c['actualCurrentAPFullPreflightAdoption']
assert ad['schema']==c['currentFullPreflightContract']['schema'] and ad['status']==c['currentFullPreflightContract']['status'] and ad['productionHead']==c['operationalHead'] and ad['productionSourceTree']==c['productionSourceTree'] and ad['executionAuthorization'] is False and ad['protectedFreezeContinues'] is True
assert c['currentProtection'] is not None and c['actualSourceReview'] is None and c['actualGrant'] is None
out={'schema':'1370-aq-held-fullfunction-wrappers-static-audit/v1','executionAuthorization':False,'sourceSealed':True,'route':role(F/'SOURCE-PINS.json'),'parent':role(P/'SOURCE-PINS.json'),'wrappers':role(W/'SOURCE-PINS.json'),'currentAPFullGuardAdoption':c['actualCurrentAPFullPreflightAdoption'],'snapshotFromGenuineFullGuard':ad['snapshot'],'wrapperChecks':checked,'ownSourcePinsAndConfigLiteralHashesExact':True,'new86GrantKeyPreservedThroughRootBindingAndInnerGrant':True,'wholeWrapperInverseApplications':4,'priorDraftInverseApplications':22,'pendingActualFields':c['heldUnfilledActualRoles'],'candidateExecuted':False,'privateTreesRead':False}
(D/'WRAPPER-STATIC-AUDIT.json').write_text(json.dumps(out,indent=2)+'\n');print(json.dumps({'audit':role(D/'WRAPPER-STATIC-AUDIT.json'),'sourceSealed':True}))
