"""Finite checkpoint inventory; enumerate only supplied evidence packages."""
import hashlib,json,os,stat,subprocess,sys
from pathlib import Path
OUT=Path(__file__).parent/'INVENTORY-FINAL.json'
assert not OUT.exists() and len(sys.argv)==2
plan=json.loads(Path(sys.argv[1]).read_bytes()); assert plan["status"]=="FINAL_EXPLICIT_PACKAGES_AND_LOCAL_RAW_ROLES"
local_raw=set(plan["localRawPaths"])
assert local_raw
seen_local=set()
rows=[];seen=set()
for arg in plan["paths"]:
 root=Path(arg);assert root.is_absolute() and root.resolve(strict=True)==root
 if root.is_file():
  paths=[root];package=root.parent.name;base=root.parent
 else:
  assert root.is_dir() and not root.is_symlink()
  raw=subprocess.check_output(['rg','--files','--hidden','--no-ignore',str(root)])
  paths=[Path(os.fsdecode(line)) for line in raw.splitlines()]
  package=root.name;base=root
 for path in sorted(paths):
  assert str(path) not in seen;seen.add(str(path))
  st=path.lstat();assert path.resolve(strict=True)==path and stat.S_ISREG(st.st_mode) and st.st_nlink==1
  rel=path.relative_to(base)
  assert not any(part in ('.git','node_modules','__pycache__') for part in rel.parts)
  before=(st.st_dev,st.st_ino,st.st_mode,st.st_nlink,st.st_size,st.st_mtime_ns,st.st_ctime_ns)
  h=hashlib.sha256()
  with path.open('rb') as stream:
   for block in iter(lambda:stream.read(65536),b''):h.update(block)
  after=path.lstat();assert before==(after.st_dev,after.st_ino,after.st_mode,after.st_nlink,after.st_size,after.st_mtime_ns,after.st_ctime_ns)
  local=str(path) in local_raw
  if local: seen_local.add(str(path))
  if path.name.startswith(('BEFORE-PS','AFTER-PS','BEFORE-LSOF','AFTER-LSOF','CURRENT-PS','CURRENT-LSOF','ACTIVE-PS')) or path.name.endswith('.LOCAL') or (path.name.endswith('.outer.stdout') and st.st_size>=524288):
   assert local, 'unclassified semantic raw role: '+str(path)
  rows.append({'sourcePath':str(path),'package':package,'relativePath':str(rel),'bytes':st.st_size,'sha256':h.hexdigest(),'mode':format(stat.S_IMODE(st.st_mode),'04o'),'nlink':st.st_nlink,'preservationAction':'LOCAL_HASH_SIZE_ONLY' if local else 'COPY_FINITE_PAYLOAD','priorGitBlob':None})
assert rows and len(rows)<10000
assert seen_local==local_raw, "unmatched raw classification"
result={'schema':'1370-am-finite-checkpoint-inventory/v1','files':rows,'pendingAdditions':[],'semanticRoleWarnings':['Recorded cap-padding and raw whole-machine PS/FD are local hash/size only; no payload or Git reuse claim for these roles.','Held source proposals and original STOP evidence do not constitute accepted runtime.','Actual source-role identity and historical operational HEAD remain distinct; publication ends prior production/common metadata continuity.'],'summary':{'completeInventory':True,'roles':len(rows),'bytes':sum(r['bytes'] for r in rows),'localOnlyRoles':sum(r['preservationAction']=='LOCAL_HASH_SIZE_ONLY' for r in rows)}}
OUT.write_text(json.dumps(result,sort_keys=True,indent=2)+'\n')
OUT.chmod(0o444);data=OUT.read_bytes()
print(json.dumps({'inventory':str(OUT),'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest(),'summary':result['summary']},sort_keys=True))
