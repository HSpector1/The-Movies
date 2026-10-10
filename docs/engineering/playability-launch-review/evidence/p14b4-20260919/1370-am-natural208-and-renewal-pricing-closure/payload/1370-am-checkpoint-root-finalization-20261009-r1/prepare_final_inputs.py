import hashlib,json,os,sys
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');D=Path(__file__).parent;A=S/'1370-am-root-continuation-20261009-r1'
def role(p):
 p=Path(p);b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
base=S/'1370-am-checkpoint-archive-input-readiness-independent-review-after-al-20261009-r3/PROPOSED-INPUT-PACKAGES.json';assert role(base)['sha256']=='949487c7e9751221201098f32ed19ead35c2c14eaa74a7bc9524bbd71f1b839b'
v=json.loads(base.read_bytes());paths=v['paths'][:];raw=v['localRawPaths'][:];assert len(paths)==139 and len(raw)==37
ad=json.loads((A/'M0-R6-METADATA-STOP-OBSERVED-ADOPTION.json').read_bytes());postparent=Path(ad['fullPostflightReadback']['path']).parent;post=json.loads((postparent/'POSTFLIGHT-READBACK.json').read_bytes());assert post['actualToolSessionId']==98815 and post['actualToolExit']==0
classification=json.loads((postparent/'RAW-LOCAL-ONLY-ROLES.json').read_bytes());assert len(classification['roles'])==4
for r in classification['roles']:
 assert r['archiveDisposition']=='LOCAL_HASH_SIZE_ONLY' and role(r['path'])=={k:r[k] for k in ('path','bytes','sha256')};raw.append(r['path'])
add=[str(postparent),str(Path(ad['independentObservedReview']['path']).parent),str(base.parent),str(S/'1370-am-checkpoint-documentation-drafts-independent-after-al-20261009-r3')]
add += [str(D/n) for n in ['prepare_stage_script.py','stage_and_verify.py','prepare_final_docs.py','prepare_final_inputs.py','HANDOFF-FINAL.md','REPORT-FINAL.md','ROOT-FINAL-CLAIM.txt','INPUT-PACKAGES-FINAL.json']]
for name in sys.argv[1:]:add.append(name)
for name in add:
 p=Path(name);assert (p.exists() or p==D/'INPUT-PACKAGES-FINAL.json') and p.is_absolute() and p.resolve()==p;paths.append(name)
assert len(paths)==len(set(paths)) and len(raw)==len(set(raw))==41
for p in map(Path,paths):
 for q in map(Path,paths):
  if p!=q:assert p not in q.parents,('overlapping paths',str(p),str(q))
assert not os.path.lexists(S/'HEAVY-LANE-LOCK')
out={'schema':'1370-am-final-explicit-packages/v1','status':'FINAL_EXPLICIT_PACKAGES_AND_LOCAL_RAW_ROLES','predecessor':role(base),'paths':sorted(paths),'localRawPaths':sorted(raw),'completedR6SharedPostflight':role(postparent/'POSTFLIGHT-READBACK.json'),'r6MetadataStopAdoption':role(A/'M0-R6-METADATA-STOP-OBSERVED-ADOPTION.json'),'allHistoricalFailuresPreserved':True,'actualM0TypesAccepted':False,'gameplaySourceMutation':False,'scope':'Finite completed AM evidence and explicitly identified held source only. No private mirror/dependency inventory copied; all whole-machine raw PS/FD hash/size-only.'}
p=D/'INPUT-PACKAGES-FINAL.json'
with p.open('x') as f:json.dump(out,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
p.chmod(0o444);print(json.dumps({'role':role(p),'paths':len(paths),'localRawRoles':len(raw)}))
