from pathlib import Path
import json,hashlib,stat,os,datetime
S=Path('/Users/zacheryspector/studio-scratch');P=S/'1370-ak-checkpoint-incomplete-inventory-preparation-20261009-r4';P.mkdir(mode=0o700)
BASE=S/'1370-ak-inventory-raw-policy-corrected-parent-draft-20261009-r1/INVENTORY-DRAFT.json'
def info(p):
 p=Path(p);a=p.lstat();assert p.resolve(strict=True)==p and stat.S_ISREG(a.st_mode) and a.st_nlink==1
 sig=lambda s:(s.st_dev,s.st_ino,s.st_mode,s.st_nlink,s.st_size,s.st_mtime_ns,s.st_ctime_ns)
 fd=os.open(p,os.O_RDONLY|os.O_NOFOLLOW)
 try:
  h=hashlib.sha256();size=0
  while b:=os.read(fd,65536):h.update(b);size+=len(b)
  assert size==a.st_size and sig(os.fstat(fd))==sig(a)==sig(p.lstat())
 finally:os.close(fd)
 return {'bytes':size,'sha256':h.hexdigest(),'mode':format(stat.S_IMODE(a.st_mode),'04o'),'nlink':1}
assert info(BASE)['sha256']=='57791bad2853730117bcad16e99f16e98767ef615fef5ef9171ec751053a0048'
x=json.loads(BASE.read_bytes());rows={r['sourcePath']:r for r in x['files']}
# Reauthenticate every prior finite selected role, preserving corrected privacy classification.
for path,r in rows.items():assert info(path)=={k:r[k] for k in ['bytes','sha256','mode','nlink']},path
selected='''1370-c0-m0-additive-expanded-readback-source-outline-after-aj-20261009-r1
1370-c0-m0-additive-expanded-readback-parent-recorded-after-aj-20261009-r1
1370-c0-m0-additive-expanded-readback-parent-recorded-after-aj-20261009-r2
1370-c0-m0-expanded-readback-failure-independent-attribution-after-aj-20261009-r1
1370-c0-m0-expanded-readback-parent-wrapper-independent-source-review-after-aj-20261009-r1
1370-c0-m0-expanded-readback-parent-wrapper-independent-source-review-after-aj-20261009-r2
1370-c0-m0-additive-expanded-readback-verifier-physical-python-repair-proposal-after-aj-20261009-r3
1370-c0-m0-expanded-readback-physical-python-repair-independent-review-after-aj-20261009-r3
1370-c0-m0-additive-expanded-readback-independent-observed-review-after-aj-20261009-r3
1370-c0-m0-additive-postflight-exact-argv-independent-review-after-aj-20261009-r1
1370-c0-m0-additive-postflight-grant-preparation-after-aj-20261009-r1
1370-c0-m0-additive-complete-chain-independent-observed-review-after-aj-20261009-r1
1370-c0-m0-additive-complete-parent-adoption-after-aj-20261009-r1
1370-c0-a208-controls-node22-operational-amendment-independent-source-review-after-aj-20261009-r1
1370-c0-a208-controls-node22-operational-amendment-parent-adoption-after-aj-20261009-r1
1370-c0-a208-finite-recorded-controls-node22-filled-independent-source-review-after-aj-20261009-r1
1370-c0-a208-finite-recorded-controls-node22-filled-source-after-aj-20261009-r1
1370-c0-a208-node22-parent-control-wrapper-independent-source-review-after-aj-20261009-r1
1370-ak-adopted-preflight-raw-role-completeness-check-20261009-r1
1370-ak-inventory-raw-policy-corrected-parent-draft-20261009-r1
1370-c0-a208-external-pipeline-sink-held-proposal-after-aj-20261009-r1
1370-c0-a208-external-pipeline-sink-independent-source-review-after-aj-20261009-r1
1370-c0-a208-controls-node22-parent-recorded-after-aj-20261009-r1
1370-c0-a208-controls-js-output-after-aj-node22-20261009-r1
1370-c0-a208-controls-js-lane-after-aj-node22-20261009-r1'''.splitlines()
def local(p):return p.name in ['BEFORE-PS.txt','AFTER-PS.txt','BEFORE-LSOF.bin','AFTER-LSOF.bin','CURRENT-PS.LOCAL.txt'] or (p.name.startswith('CURRENT-LSOF-') and p.name.endswith('.LOCAL.bin'))
def add(p,package,rel):
 p=Path(p);fields=info(p);raw=local(p);rows[str(p)]={**fields,'sourcePath':str(p),'package':package,'relativePath':rel,'preservationAction':'LOCAL_HASH_SIZE_ONLY' if raw else 'COPY_FINITE_PAYLOAD','priorGitBlob':None if raw else 'NOT_QUERIED_NO_GIT_OPERATIONS','reason':'Whole-machine PS/FD capture: local hashes/sizes only, never archive raw bytes.' if raw else 'Explicit finite closed after-AJ artifact; immutable original role retained.'}
for name in selected:
 root=S/name;assert root.is_dir()
 for f in sorted(root.iterdir()):
  if f.is_file():add(f,name,f.name)
sealed=S/'1370-c0-m0-additive-operational-full-guard-after-aj-proposal-20261009-r2/evidence/postflight-after-aj-r2'
for f in sorted(sealed.iterdir()):assert f.is_file();add(f,sealed.parents[1].name,'evidence/postflight-after-aj-r2/'+f.name)
standalone='''1370-ak-grant-a208-controls-node22.py
1370-ak-grant-a208-controls-node22-preparation.json
1370-ak-grant-readback-r2.py
1370-ak-grant-readback-r2-preparation.json
1370-ak-seal-postflight.py
1370-ak-root-lessons-after-aj-20261009-r2.md
1370-c0-m0-additive-expanded-readback-facts-after-aj-20261009-r3.json
1370-c0-m0-additive-expanded-readback-lane-after-aj-20261009-r1.log
1370-c0-m0-additive-expanded-readback-lane-after-aj-20261009-r1.log.meta
1370-c0-m0-additive-expanded-readback-lane-after-aj-20261009-r2.log
1370-c0-m0-additive-expanded-readback-lane-after-aj-20261009-r2.log.meta
review_adopted_neutral.py
fill-expanded-readback-after-aj.py'''.splitlines()
for name in standalone:add(S/name,'standalone-after-aj',name)
add(Path(__file__),P.name,'prepare.py')
# Finite external .py audit/author roles explicitly referenced by already-selected JSON receipts/manifests.
external={}
def visit(v):
 if isinstance(v,dict):
  for key in ['path','sourcePath']:
   path=v.get(key)
   if isinstance(path,str) and path.startswith(str(S)+'/') and path.endswith('.py') and Path(path).is_file():external[path]=v.get('sha256')
  for child in v.values():visit(child)
 elif isinstance(v,list):
  for child in v:visit(child)
for r in list(rows.values()):
 if r['sourcePath'].endswith('.json') and r['preservationAction']!='LOCAL_HASH_SIZE_ONLY':
  try:visit(json.loads(Path(r['sourcePath']).read_bytes()))
  except json.JSONDecodeError:pass
for path,expected in external.items():
 if expected:assert info(path)['sha256']==expected,path
 if path not in rows:add(path,'external-finite-audits',Path(path).name)
for r in rows.values():
 if local(Path(r['sourcePath'])):assert r['preservationAction']=='LOCAL_HASH_SIZE_ONLY'
assert sum(r['preservationAction']=='LOCAL_HASH_SIZE_ONLY' for r in rows.values())==17
x.update(status='INCOMPLETE_AFTER_AJ_CLOSED_M0_AND_NODE22_SOURCE_PREPARATION_ONLY',utc=datetime.datetime.now(datetime.timezone.utc).isoformat(),files=sorted(rows.values(),key=lambda r:r['sourcePath']),pendingAdditions=[{'role':'Active Node22 JS then Python recorded controls','status':'PENDING_ACTUAL_OUTCOMES_AND_INDEPENDENT_OBSERVED_REVIEWS','claimLimit':'JS closed source-produced TAP/output roles retained, independent observed review pending; Python not yet completed.'},{'role':'Final root claims/checkpoint review/inventory/raw-policy approval/archive/readback/push','status':'PENDING_ROOT_FINALIZATION' }],rootFinalization=None)
x['selectedDirectoryNames']=sorted(set(x['selectedDirectoryNames']+selected));x['previousCorrectedDraft']={'path':str(BASE),**info(BASE)}
x['futureTasksNotArtifactCoveragePending']=['A208 game observer actual','Pure16 pricing observed input/fill/run'];x['scopeLimit']='Finite closed artifact bookkeeping only; no scratch recursion, protected/Git mutation, source/runtime imports, new scanner/test/Node/game/archive/finalization. Active controls excluded until closed.'
x['semanticRoleWarnings']+=['Earlier074c incomplete draft incorrectly classified five CURRENT-PS/LSOF rawcaptures COPY; corrected57791 and this inventory require all17 known rawcaptures LOCAL_HASH_SIZE_ONLY. Never publish raw bytes.','Future game observer/pure16 tasks are outside this checkpoint artifact coverage; not used to prevent finite checkpoint finalization.','Current finalbinding35e and originalafb/archivePINS roles separate; historical original/sourceonly/refusal statuses remain truthful.']
aj=json.loads(Path(x['predecessor']['manifestPath']).read_bytes());ajrows={r['sourcePath']:r for r in aj['files']}
for path,r in list(rows.items()):
 prior=ajrows.get(path)
 if prior and all(r[k]==prior[k] for k in ['bytes','sha256','mode','nlink']):
  x['priorArchiveRoleTransport'].append({'sourcePath':path,'sha256':r['sha256'],'priorAJManifestEntry':prior,'action':'ALREADY_ARCHIVED_AJ_EXACT_ROLE_TRANSPORT_ONLY'});del rows[path]
x['files']=sorted(rows.values(),key=lambda r:r['sourcePath'])
x['summary']={'completeInventory':False,'closedWorkArtifactCoverageComplete':False,'regularFiniteFiles':len(rows),'selectedFiniteDirectories':len(x['selectedDirectoryNames']),'payloadFiles':sum(r['preservationAction']=='COPY_FINITE_PAYLOAD' for r in rows.values()),'payloadBytes':sum(r['bytes'] for r in rows.values() if r['preservationAction']=='COPY_FINITE_PAYLOAD'),'localHashSizeOnlyFiles':17,'localHashSizeOnlyBytes':sum(r['bytes'] for r in rows.values() if r['preservationAction']=='LOCAL_HASH_SIZE_ONLY'),'alreadyArchivedAJExactRolesTransported':len(x['priorArchiveRoleTransport']),'pendingAdditions':2}
out=P/'INVENTORY-DRAFT.json';out.write_text(json.dumps(x,indent=2,sort_keys=True)+'\n');print({'inventory':str(out),**info(out),'summary':x['summary'],'externalReferencedPyCount':len(external)})
