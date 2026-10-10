"""Root finite archive package selection after the active AO routes are complete."""
import hashlib,json,os,subprocess
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');D=Path(__file__).parent
extras=[
 '1370-an-checkpoint-root-finalization-20261009-r1',
 'c0-m0-fullfunction-observer-row-diagnostic-20261010-r1.lane.log',
 'c0-m0-fullfunction-observer-row-diagnostic-20261010-r1.lane.log.meta',
]
assert not os.path.lexists(S/'HEAVY-LANE-LOCK')
roots=sorted([p for p in S.iterdir() if p.name.startswith('1370-ao-') and p!=D]+[S/x for x in extras]+[D/n for n in ('prepare_final_packages.py','prepare_inventory.py','INVENTORY-SOURCE-BINDING.json')],key=str)
# Pure48 lane and metadata are inside its selected parent package, authenticated by actual readback.
# Only the exact fullfunction top-level lane roles are explicit extras.
assert len(roots)==len(set(roots));paths=[];empty=[];raw=[];caches=[];selected=[];semantic=[]
for p in roots:
 assert p.is_absolute() and p.resolve(strict=True)==p and p.exists()
 if p.is_file():files=[p]
 else:
  r=subprocess.run(['rg','--files','--hidden','--no-ignore',str(p)],stdout=subprocess.PIPE,stderr=subprocess.PIPE);assert r.returncode in (0,1) and not r.stderr
  files=[Path(os.fsdecode(x)) for x in r.stdout.splitlines()]
 if not files:empty.append(str(p));continue
 paths.append(str(p))
 for f in files:
  selected.append(str(f))
  if f.name.startswith('RAW-LOCAL-ONLY-') and f.suffix=='.json':
   v=json.loads(f.read_bytes());roles=v.get('roles',v.get('rawLocalOnly',[]));assert isinstance(roles,list)
   semantic.extend(r['path'] for r in roles)
  elif f.name=='PREFLIGHT.json':
   v=json.loads(f.read_bytes());roles=v.get('rawLocalOnly',[]);assert isinstance(roles,list)
   semantic.extend(r['path'] for r in roles)
  if f.name.startswith(('BEFORE-PS','AFTER-PS','BEFORE-LSOF','AFTER-LSOF','CURRENT-PS','CURRENT-LSOF','ACTIVE-PS')) or f.name.endswith('.LOCAL'):
   raw.append(str(f))
  elif any('node-compile-cache' in part for part in f.parts):caches.append(str(f))
assert set(semantic)<=set(selected),'Semantic raw role outside finite selected packages'
raw=sorted(set(raw+semantic));paths.append(str(D/'INPUT-PACKAGES-FINAL.json'))
plan={'status':'FINAL_EXPLICIT_PACKAGES_AND_LOCAL_RAW_ROLES','paths':paths,'localRawPaths':sorted(set(raw+caches)),'wholeMachineRawLocalOnlyPaths':raw,'semanticProducerRawLocalOnlyPaths':sorted(set(semantic)),'rebuildableNodeCacheLocalOnlyPaths':sorted(caches),'emptyNamedPackagesNoFiles':empty,'scope':'Only explicit AO session evidence/source packages, the two exact top-level fullfunction lane roles, whole late AN finalization package and four explicit current builder/input roles; excludes current inventory itself, original M0/R9/private copies and production dependencies.','notes':['All selected files are reauthenticated by the original finite inventory and archive tools.','Whole-machine PS/FD roles are seeded from retained producer classifications and preflight roles, with filename checks as defense. Rebuildable Node compile-cache files also preserve local hashes/sizes only; their bytes are not exported.','No inferred runtime success; source STOPs, actual failures and original qualified observed outcomes remain distinct.']}
p=D/'INPUT-PACKAGES-FINAL.json';assert not p.exists()
with p.open('x') as f:json.dump(plan,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
p.chmod(0o444);b=p.read_bytes();print(json.dumps({'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest(),'packages':len(paths),'emptyPackages':len(empty),'rawLocalOnly':len(raw),'nodeCacheLocalOnly':len(caches)}))
