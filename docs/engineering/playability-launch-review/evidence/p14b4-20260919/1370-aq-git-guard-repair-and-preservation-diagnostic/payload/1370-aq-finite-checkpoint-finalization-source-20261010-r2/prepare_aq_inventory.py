"""One root-invoked finite inventory builder. Does not copy, run candidates, or use Git."""
import hashlib,json,os,stat,sys
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch')
D=Path(__file__).resolve().parent
PLAN=S/'1370-aq-checkpoint-archive-selection-plan-20261010-r1/PLAN.json'
AP=S/'1370-ap-checkpoint-root-finalization-20261010-r1'
FORBIDDEN={'.git','node_modules','__pycache__'}
PROTECTED_PACKETS={'fixtures.json','settlement208.json','employment208.json','natural-boundary-fixture.json'}
RAW_PREFIX=('BEFORE-PS','AFTER-PS','BEFORE-LSOF','AFTER-LSOF','CURRENT-PS','CURRENT-LSOF','ACTIVE-PS')
SEMANTIC_KEYS={'rawLocalOnly','syntheticArtifactsLocalOnly','localRawPaths','wholeMachineRawLocalOnlyPaths','semanticProducerRawLocalOnlyPaths','rebuildableNodeCacheLocalOnlyPaths'}
FILE_CAP=33554432
TOTAL_CAP=268435456

def need(ok,message):
 if not ok:raise RuntimeError(message)
def signature(st):
 return tuple(getattr(st,k) for k in ('st_dev','st_ino','st_mode','st_nlink','st_size','st_mtime_ns','st_ctime_ns'))
def inspect(path,read=False):
 p=Path(path);st=p.lstat()
 need(p.is_absolute() and p.resolve(strict=True)==p and stat.S_ISREG(st.st_mode) and st.st_nlink==1,'UNSAFE_ORDINARY_SOURCE')
 need(st.st_size<=FILE_CAP,'FINITE_FILE_OVER_BOUND')
 h=hashlib.sha256();parts=[]
 with p.open('rb') as f:
  need(signature(os.fstat(f.fileno()))==signature(st),'SOURCE_OPEN_CHANGED')
  for b in iter(lambda:f.read(65536),b''):
   h.update(b)
   if read:parts.append(b)
  need(signature(os.fstat(f.fileno()))==signature(st)==signature(p.lstat()),'SOURCE_CHANGED')
 return {'path':str(p),'bytes':st.st_size,'sha256':h.hexdigest()},st,b''.join(parts) if read else None
def authenticated(r):
 need(type(r) is dict and set(r)=={'path','bytes','sha256'} and type(r['bytes']) is int,'ROLE_SCHEMA')
 actual,_,data=inspect(r['path'],True);need(actual==r,'ROLE_HASH_MISMATCH');return data
def role_refs(value):
 stack=[value]
 while stack:
  v=stack.pop()
  if type(v) is dict:
   if set(v)=={'path','bytes','sha256'}:yield v
   else:stack.extend(v.values())
  elif type(v) is list:stack.extend(v)
def classify_producer(value,local):
 stack=[value]
 while stack:
  v=stack.pop()
  if type(v) is dict:
   for k,x in v.items():
    if k in SEMANTIC_KEYS:
     need(type(x) is list,'LOCAL_PRODUCER_SHAPE')
     for item in x:
      if type(item) is str:local.add(item)
      else:
       need(type(item) is dict and 'path' in item,'LOCAL_ROLE_SHAPE');local.add(item['path'])
    stack.append(x)
  elif type(v) is list:stack.extend(v)
def raw_name(p):
 return p.name.startswith(RAW_PREFIX) or p.name.endswith(('.LOCAL','.partial')) or p.name in ('ACTUAL-IMMUTABLE-LOCAL.json','DIAGNOSTIC-SUMMARY-LOCAL.json')
def enumerate_root(root):
 """Explicit selected package only; never follow directories or file symlinks."""
 root=Path(root);need(root.is_absolute() and root.resolve(strict=True)==root,'ROOT_PATH')
 if root.is_file():
  need(root.name not in PROTECTED_PACKETS,'AUTHENTIC_FIXTURE_PACKET_MUST_NOT_BE_SELECTED')
  return [root],[]
 need(root.is_dir(),'MISSING_NAMED_PACKAGE');files=[];excluded=[]
 for directory,dirs,names in os.walk(root,followlinks=False):
  base=Path(directory)
  for name in list(dirs):
   p=base/name
   if name in FORBIDDEN or name in ('.vite','.cache') or 'node-compile-cache' in name or p.is_symlink():
    dirs.remove(name);excluded.append({'path':str(p),'reason':'DEPENDENCY_PRIVATE_OR_REBUILDABLE_CACHE_NO_TRAVERSAL'})
  for name in names:
   need(name not in PROTECTED_PACKETS,'AUTHENTIC_FIXTURE_PACKET_MUST_NOT_BE_SELECTED')
   p=base/name
   need(not p.is_symlink(),'UNCLASSIFIED_FILE_SYMLINK')
   files.append(p)
 return files,excluded
def publish(path,value):
 data=(json.dumps(value,sort_keys=True,indent=2)+'\n').encode();need(len(data)<=8388608,'INVENTORY_OUTPUT_BOUND')
 fd=os.open(path,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
 with os.fdopen(fd,'wb') as f:f.write(data);f.flush();os.fsync(f.fileno())
 path.chmod(0o444);return inspect(path)[0]
def main():
 need(len(sys.argv)==4,'CLI: root-cutoff-role-json cutoff-sha fresh-scratch-output-directory')
 cutoff_role,_,cutoff_bytes=inspect(sys.argv[1],True);need(cutoff_role['sha256']==sys.argv[2],'CUTOFF_SHA')
 c=json.loads(cutoff_bytes);need(c['status']=='ROOT_DECLARED_AQ_FINAL_CUTOFF' and c['executionAuthorization'] is True,'CUTOFF_NOT_GRANTED')
 need(c['pendingAdditions']==[],'UNRESOLVED_FINAL_INPUTS')
 plan=json.loads(authenticated(c['selectionPlan']));need(c['selectionPlan']['path']==str(PLAN),'WRONG_SELECTION_PLAN')
 for key in ('diagnosticReadback','diagnosticObservedReview'):
  authenticated(c[key])
 if c['comparisonResult'] is not None:authenticated(c['comparisonResult'])
 else:need(c['comparisonUnavailableReason'] in ('ACTUAL_MAP_NOT_PRODUCED','COMPLETE_COMPARISON_REFUSED'),'MISSING_COMPARISON_DISPOSITION')
 for r in c['approvedLooseRoles']:authenticated(r)
 for r in c['additionalLocalRoles']:authenticated(r)
 for r in plan['methodRoles']:authenticated(r)
 paths=list(plan['candidatePackagePaths'])+list(c['latePackagePaths'])+[str(AP),str(D),str(PLAN.parent)]+list(plan['candidateLoosePackageRoles'])+[r['path'] for r in c['approvedLooseRoles']]
 # No scratch-wide prefix discovery. Late additions must be explicitly named AQ packages.
 for name in paths:
  p=Path(name)
  need(p==AP or p==D or (p.parent==S and p.name.startswith('1370-aq-')) or name in [r['path'] for r in c['approvedLooseRoles']],'OUTSIDE_FINITE_SELECTION')
 need(len(paths)==len(set(paths)),'DUPLICATE_ROOT')
 out=Path(sys.argv[3]);need(out.parent==S and out.name.startswith('1370-aq-') and not out.exists(),'FRESH_OUTPUT_REQUIRED')
 files=[];excluded=[];empty=[];owner={}
 for root in paths:
  p=Path(root);batch,skip=enumerate_root(p);excluded.extend(skip)
  if not batch:empty.append(str(p))
  for f in batch:
   need(str(f) not in owner,'OVERLAPPING_SELECTED_ROOTS')
   owner[str(f)]=(p.name,p) if p.is_dir() else (p.parent.name,p.parent)
   files.append(f)
 need(0<len(files)<10000,'FINITE_ROLE_BOUND')
 local={r['path'] for r in c['additionalLocalRoles']};producer=[]
 for f in files:
  if raw_name(f):local.add(str(f));continue
  if f.suffix=='.json' and f.stat().st_size<=2097152:
   _,_,data=inspect(f,True);v=json.loads(data);classify_producer(v,local)
   if f.name.startswith('RAW-LOCAL-ONLY-'):
    roles=v.get('roles',v.get('rawLocalOnly',[]));need(type(roles) is list,'RAW_CLASSIFICATION_SHAPE')
    local.update(r['path'] for r in roles)
   producer.append(str(f))
 historical_local=sorted(local-set(owner))
 need(all(not (Path(p).parent==S and Path(p).name.startswith('1370-aq-')) and not any(x.startswith('1370-aq-') for x in Path(p).parts) for p in historical_local),'AQ_LOCAL_ROLE_OUTSIDE_SELECTION')
 # Whole late AP documents reference its already-published raw roles. References
 # outside this finite selection are recorded as provenance, never followed.
 local.intersection_update(owner)
 if c['comparisonResult'] is not None:need(c['comparisonResult']['path'] in local,'COMPARISON_MUST_BE_LOCAL')
 rows=[];total=0
 for f in sorted(files):
  r,st,_=inspect(f);total+=r['bytes'];need(total<=TOTAL_CAP,'FINITE_TOTAL_INPUT_BOUND')
  package,base=owner[str(f)];rel=f.relative_to(base)
  need(not any(x in FORBIDDEN for x in rel.parts),'PROTECTED_PAYLOAD_SEGMENT')
  rows.append({'sourcePath':str(f),'package':package,'relativePath':str(rel),'bytes':r['bytes'],'sha256':r['sha256'],'mode':format(stat.S_IMODE(st.st_mode),'04o'),'nlink':st.st_nlink,'preservationAction':'LOCAL_HASH_SIZE_ONLY' if str(f) in local else 'COPY_FINITE_PAYLOAD','priorGitBlob':None})
 # All sources validated before any output. This operation creates scratch metadata only.
 out.mkdir(mode=0o700)
 input_plan={'status':'FINAL_EXPLICIT_PACKAGES_AND_LOCAL_RAW_ROLES','paths':sorted(owner),'localRawPaths':sorted(local),'historicalLocalReferencesNotSelectedOrRead':historical_local,'emptyNamedPackagesNoFiles':empty,'excludedWithoutTraversal':excluded,'rootCutoff':cutoff_role,'selectedPackageRoots':paths}
 inv={'schema':'1370-aq-finite-checkpoint-inventory/v1','files':rows,'pendingAdditions':[],'rootCutoff':cutoff_role,'semanticRoleWarnings':['LOCAL raw PS/FD, actual immutable maps, summaries, comparison values and synthetic padding are hash-size-only; no Git reuse.','Later diagnostic comparison never retrospectively accepts failed54871 or establishes a transient cause.','Source-only corrected fullfunction R3 remains unrun and unresolved.'],'summary':{'completeInventory':True,'roles':len(rows),'bytes':total,'localOnlyRoles':len(local),'selectedNonLocalBytesBeforePriorHEADReuse':sum(r['bytes'] for r in rows if r['preservationAction']=='COPY_FINITE_PAYLOAD')}}
 result={'inputPlan':publish(out/'INPUT-PACKAGES-FINAL.json',input_plan),'inventory':publish(out/'INVENTORY-FINAL.json',inv),'summary':inv['summary'],'archiveCopied':False,'gitMutated':False}
 print(json.dumps(result,sort_keys=True))
if __name__=='__main__':main()
