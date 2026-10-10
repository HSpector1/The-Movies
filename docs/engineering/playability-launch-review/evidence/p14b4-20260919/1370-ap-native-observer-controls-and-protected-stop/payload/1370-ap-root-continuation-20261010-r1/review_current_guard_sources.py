import ast,hashlib,json,re
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');A=Path(__file__).parent
G=S/'1370-ap-current-operational-fullguard-source-20261010-r1'
D=S/'1370-ap-current-operational-fullguard-root-adapters-source-20261010-r1'
O=S/'1370-ao-root-continuation-20261010-r1'
def role(p,h=None):
 data=p.read_bytes();r={'path':str(p),'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()}
 if h:assert r['sha256']==h
 return r
def apply_exact(source,delta):
 base=source.splitlines(True);lines=delta.splitlines(True);assert lines[0].startswith('--- ') and lines[1].startswith('+++ ')
 out=[];cursor=0;i=2
 while i<len(lines):
  m=re.fullmatch(r'@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@.*\n',lines[i]);assert m
  start=int(m[1])-1;assert start>=cursor;out.extend(base[cursor:start]);cursor=start
  assert len(out)==int(m[3])-1
  oldcount=0;newcount=0;i+=1
  while i<len(lines) and not lines[i].startswith('@@ '):
   line=lines[i];assert line[0] in ' +-'
   if line[0] in ' -':assert base[cursor]==line[1:];cursor+=1;oldcount+=1
   if line[0] in ' +':out.append(line[1:]);newcount+=1
   i+=1
  assert oldcount==int(m[2] or '1') and newcount==int(m[4] or '1')
 out.extend(base[cursor:]);return ''.join(out)
gp=role(G/'SOURCE-PINS.json','5ede60a6f02c405aea31dd7fa981d871de6b5af8c594cf103ad9c66076f9834a')
dp=role(D/'SOURCE-PINS.json','953822aa5ae812e71dd0df59dc8c9bc597a0ea5ef6b39a2de6426599f7cceb02')
for p in (G,D):
 for item in json.loads((p/'SOURCE-PINS.json').read_bytes())['files'].values():assert role(Path(item['path']))==item
applications=0
for p,name in [(G,'PROOF.json'),(D,'SOURCE-PROOF.json')]:
 for pair in json.loads((p/name).read_bytes())['pairs'].values():
  for item in pair.values():assert role(Path(item['path']))==item
  old=Path(pair['baseline']['path']).read_text();new=Path(pair['current']['path']).read_text()
  assert old==Path(pair['original']['path']).read_text()
  assert apply_exact(old,Path(pair['forward']['path']).read_text())==new
  assert apply_exact(new,Path(pair['inverse']['path']).read_text())==old
  applications+=2
oldc=json.loads((G/'BASELINE-CONFIG.json.txt').read_bytes());newc=json.loads((G/'CONFIG.json').read_bytes())
changed=sorted(k for k in newc if newc[k]!=oldc[k]);assert changed==['operationalRemoteRefs','parentScopeAdoption','productionHead','status']
scope=role(A/'CURRENT-AO-FULLGUARD-OPERATIONAL-SCOPE-ADOPTION.json','7dee435f6d0ac86e41d590aa08ef81b87caaa8f3e7692a097301a94eeb7bbc6b')
assert newc['parentScopeAdoption']=={k:scope[k] for k in ('path','sha256')}
assert newc['productionHead']=='f2f97c622db7f5332164b790d1646355e89c00f4'
assert newc['operationalRemoteRefs']=={'refs/heads/main':'c902a704eb948cc576083d0973c8c23e59937dc1','refs/heads/wip/headless-program-20260916-ts':newc['productionHead']}
assert newc['privateBaseline']['sha256']=='555867b2be0abf76728fc8b905c52a73512b5da31d24162d804e7e1b9d8c9347'
old=(G/'BASELINE-snapshot.py.txt').read_text();new=(G/'snapshot.py').read_text()
oldhash=role(G/'BASELINE-CONFIG.json.txt')['sha256'];newhash=role(G/'CONFIG.json')['sha256']
assert old.count(oldhash)==1 and old.replace(oldhash,newhash)==new
def functions(text):
 return {n.name:ast.get_source_segment(text,n) for n in ast.parse(text).body if isinstance(n,(ast.FunctionDef,ast.AsyncFunctionDef))}
assert functions(old)==functions(new) and len(functions(new))==11
common=[('1370-ao-current-operational-fullguard-source-20261010-r1',G.name),('1370-ao-current-an-fullpreflight-parent-recorded-20261010-r1','1370-ap-current-ao-fullpreflight-parent-recorded-20261010-r1'),('before-fill-current-an-r1','before-fill-current-ao-r1'),('0cf8b1d0bbf7d1977413d0c3074407cc8f7b80a4',newc['productionHead']),('A=Path(__file__).parent',"A=Path("+repr(str(A))+")")]
specific={
 'run_current_fullguard_once.py':[('9df63e39d302e3b8481198999e129233ab4eb5709848d91cb1d45af0dfee0e88',gp['sha256']),('ACCEPT_CURRENT_AN_FULLGUARD_BINDINGS_SOURCE_ONLY','ACCEPT_CURRENT_AO_FULLGUARD_BINDINGS_SOURCE_ONLY'),('CURRENT-AN-FULLGUARD-SOURCE-ADOPTION.json','CURRENT-AO-FULLGUARD-SOURCE-ADOPTION.json'),('1370-ao-root-current-an-fullguard-source-adoption/v1','1370-ap-root-current-ao-fullguard-source-adoption/v1'),('ROOT_ADOPTED_CURRENT_AN_FULLGUARD_BINDINGS_SOURCE_ONLY','ROOT_ADOPTED_CURRENT_AO_FULLGUARD_BINDINGS_SOURCE_ONLY'),('1370-ao-root-direct-current-an-fullpreflight-grant/v1','1370-ap-root-direct-current-ao-fullpreflight-grant/v1'),('GRANTED_ONCE_ORIGINAL_COMPLETE_CURRENT_AN_FULL_PREFLIGHT','GRANTED_ONCE_ORIGINAL_COMPLETE_CURRENT_AO_FULL_PREFLIGHT')],
 'read_current_fullpreflight.py':[('1370-ao-fullpreflight-owned-absence/v1','1370-ap-fullpreflight-owned-absence/v1'),('1370-ao-fullpreflight-raw-local-only/v1','1370-ap-fullpreflight-raw-local-only/v1'),('1370-ao-current-an-fullpreflight-readback/v1','1370-ap-current-ao-fullpreflight-readback/v1'),('ACTUAL_CURRENT_AN_FULL_PREFLIGHT_COMPLETE_UNADOPTED','ACTUAL_CURRENT_AO_FULL_PREFLIGHT_COMPLETE_UNADOPTED')]
}
for name,extra in specific.items():
 baseline=(O/name).read_text();expected=baseline
 for before,after in common+extra:
  assert before in expected;expected=expected.replace(before,after)
 candidate=(D/name).read_text();assert candidate==expected and functions(candidate)==functions(baseline)
recipe=json.loads((D/'RECIPE.json').read_bytes())
assert recipe['guardSourcePins']==gp and recipe['guardConfig']==role(G/'CONFIG.json') and recipe['genuineRootScope']==scope
assert recipe['launchArgv'][3]==str(D/'run_current_fullguard_once.py') and recipe['readerArgv'][3]==str(D/'read_current_fullpreflight.py')
assert recipe['perCommandSeconds']==180 and recipe['wholeScanDeadline'] is None and recipe['executionAuthorization'] is False
result={'schema':'1370-ap-current-ao-fullguard-root-independent-source-review/v1','decision':'ACCEPT_CURRENT_AO_FULLGUARD_BINDINGS_SOURCE_ONLY','sourcePins':gp,'adapterSourcePins':dp,'operationalScope':scope,'concreteFindings':[],'executionAuthorization':False,'reviewer':'root; independent of source author b109','completeWholeDiffApplicationsActuallyVerified':applications,'allElevenGuardFunctionsByteExact':True,'runtimeAdaptersWholeSourceEqualExplicitBindingTransform':True,'originalPerCommand180NoWholeDeadline':True,'rawPsFdLocalOnly':True,'originalR9BaselineAndM0ProofsUnchanged':True,'prepareScriptNotAuthorizedForExecution':'Documentary only; genuine root scope/facts and filled source already exist.','readerSourceReviewed':role(D/'read_current_fullpreflight.py'),'launcherSourceReviewed':role(D/'run_current_fullguard_once.py')}
p=A/'CURRENT-AO-FULLGUARD-INDEPENDENT-SOURCE-REVIEW.json'
with p.open('x') as f:json.dump(result,f,sort_keys=True,indent=2);f.write('\n')
print(json.dumps(role(p)))
