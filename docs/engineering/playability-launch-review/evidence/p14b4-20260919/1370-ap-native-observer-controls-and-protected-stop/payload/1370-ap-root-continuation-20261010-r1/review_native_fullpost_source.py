import ast,hashlib,json,os,stat,sys
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');A=Path(__file__).parent;N=S/'1370-ap-native-fullfunction-shared-fullpostflight-source-20261010-r1'
def role(p):
 p=Path(p);s=p.lstat();assert p.is_absolute() and p.resolve(strict=True)==p and stat.S_ISREG(s.st_mode) and s.st_nlink==1
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def read(p):return json.loads(Path(p).read_bytes())
assert sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize
sp=role(N/'SOURCE-PINS.json');assert sp['sha256']=='b8748925da99da45b51f2f1f2a70603576c2c5745fb559d94f5e6d3df70f5dcf';pins=read(sp['path'])
for r in pins['files'].values():assert role(r['path'])==r
proof=read(N/'SOURCE-PROOF.json');recipe=read(N/'RECIPE.json');ad=recipe['preflightAdoption'];assert role(ad['path'])==ad and ad['sha256']=='e3804904e003a7178e98c3d6d83c52ff32194f1117cef780d24c3d1c88849552'
v=read(ad['path'])
for k,rk in [('snapshot','baseline'),('guardSource','guardSource'),('config','guardConfig'),('sourcePins','guardSourcePins'),('sourceReview','guardSourceReview')]:assert recipe[rk]==v[k] and role(recipe[rk]['path'])==recipe[rk]
common={'1370-ao-current-operational-fullguard-source-20261010-r1':'1370-ap-current-operational-fullguard-source-20261010-r1','1370-ao-fullfunction-observer-row-diagnostic-shared-fullpostflight-parent-recorded-20261010-r1':'1370-ap-native-fullfunction-shared-fullpostflight-parent-recorded-20261010-r1','postflight-fullfunction-observer-row-diagnostic-r1':'postflight-fullfunction-native-observer-r1'}
extra={'launch-fullpostflight.py':{'1370-ao-root-continuation-20261010-r1':'1370-ap-root-continuation-20261010-r1','CURRENT-AN-FULL-PREFLIGHT-OBSERVED-ADOPTION.json':'CURRENT-AO-FULL-PREFLIGHT-OBSERVED-ADOPTION.json','753a7597c20032c70b2a07c9001de15ba1f72b5a0a5ac7706e340228da5fef5a':ad['sha256'],'ROOT_ADOPTED_CURRENT_AN_FULL_PREFLIGHT':'ROOT_ADOPTED_CURRENT_AO_FULL_PREFLIGHT','9df63e39d302e3b8481198999e129233ab4eb5709848d91cb1d45af0dfee0e88':recipe['guardSourcePins']['sha256'],'under current AN.':'under current AO.'},'read-fullpostflight.py':{'1370-ao-fullpostflight-raw-local-only/v1':'1370-ap-fullpostflight-raw-local-only/v1','1370-ao-fullfunction-shared-fullpostflight-readback/v1':'1370-ap-native-fullfunction-shared-fullpostflight-readback/v1'}}
counts=[]
assert len(proof['applications'])==2
for pair in proof['applications']:
 for k in ('source','baseline','retainedBaseline'):assert role(pair[k]['path'])==pair[k]
 name=Path(pair['source']['path']).name;expected={**common,**extra[name]};assert {x['before']:x['after'] for x in pair['applications']}==expected
 old=Path(pair['baseline']['path']).read_text();new=Path(pair['source']['path']).read_text();assert old==Path(pair['retainedBaseline']['path']).read_text()
 applied=old
 for x in pair['applications']:
  assert applied.count(x['before'])==x['count']==1;applied=applied.replace(x['before'],x['after'])
 assert applied==new
 inverse=new
 for x in reversed(pair['applications']):assert inverse.count(x['after'])==1;inverse=inverse.replace(x['after'],x['before'])
 assert inverse==old
 def helpers(text):
  return [(n.name,ast.get_source_segment(text,n)) for n in ast.parse(text).body if isinstance(n,(ast.FunctionDef,ast.ClassDef))]
 assert helpers(old)==helpers(new) and len(helpers(new))==3;counts.append(3)
 assert '180' in new or name=='read-fullpostflight.py'
assert recipe['originalPerCommandTimeoutSeconds']==180 and recipe['wholeScanDeadline'] is None and recipe['wholeImmutableMapAndNineStrictRootsEqualityRequired'] is True
assert all(recipe[k] is None for k in ('actualRouteReadback','actualGrant','actualPostflight'))
out={'schema':'1370-native-fullfunction-fullpostflight-independent-source-review/v1','decision':'ACCEPT_STATIC_ORIGINAL_FULLPOSTFLIGHT_CURRENT_AO_BINDINGS_ONLY','reviewer':'/root','sourceAuthor':'/root/cleanup_independent_red','sourceManifest':sp,'sourcePins':{n:pins['files'][n] for n in ('launch-fullpostflight.py','read-fullpostflight.py','RECIPE.json')},'sourceProof':role(N/'SOURCE-PROOF.json'),'rootReviewSource':role(__file__),'wholeIndependentForwardInverseApplications':4,'allHelperBytesEqual':counts,'independentAllowedChanges':'Explicit current AO authority bindings, fresh parent/label and AP schema names only; whole files independently reconstructed from original source.','currentPreflightAdoption':ad,'sourceScopeRead':'Reviewed completion/exit and exact actual PID/PGID gates; direct scanner identity, original guard argv, complete immutable and9 strict roots equality, bounded original current checks, mandatory postflight including STOP and LOCAL-only raw roles.','originalPerCommandTimeoutSeconds':180,'wholeScanDeadline':None,'concreteFindings':[],'executionAuthorization':False,'actualPostflightExecuted':False,'game':False}
p=A/'NATIVE-FULLPOSTFLIGHT-INDEPENDENT-SOURCE-REVIEW.json'
with p.open('x') as f:json.dump(out,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
p.chmod(0o444);print(json.dumps(role(p)))
