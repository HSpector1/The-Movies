from pathlib import Path
import json,hashlib,os,stat
S=Path('/Users/zacheryspector/studio-scratch');old=S/'1370-ai-checkpoint-preparation-20261009-r1';out=S/'1370-ai-checkpoint-preparation-20261009-r2';out.mkdir(mode=0o700)
h=lambda raw:hashlib.sha256(raw).hexdigest();base=(old/'INVENTORY-DRAFT.json').read_bytes();assert h(base)=='98888818b513bd61fba861d39a067486f0bbe5c5cc2bcffb161c282f64beab81';inv=json.loads(base);by_path={x['sourcePath']:x for x in inv['files']};added=[];audits=[];omissions=[]
def signature(s):return (s.st_dev,s.st_ino,s.st_mode,s.st_nlink,s.st_size,s.st_mtime_ns,s.st_ctime_ns)
def read_exact(path,expected,expected_bytes):
 p=Path(path);a=p.lstat();assert p.is_absolute() and p.resolve(strict=True)==p and stat.S_ISREG(a.st_mode) and not p.is_symlink();assert a.st_size==expected_bytes and a.st_size<64*1024**2
 fd=os.open(p,os.O_RDONLY|os.O_NOFOLLOW)
 try:
  assert signature(os.fstat(fd))==signature(a);hashobj=hashlib.sha256();size=0
  while True:
   chunk=os.read(fd,65536)
   if not chunk:break
   hashobj.update(chunk);size+=len(chunk)
  assert signature(os.fstat(fd))==signature(a)==signature(p.lstat());assert size==expected_bytes and hashobj.hexdigest()==expected
 finally:os.close(fd)
 return a
main_outcome=S/'1370-c0-m0-controls-root-recorded-20261009-r3/TOOL-OUTCOME.json';raw=main_outcome.read_bytes();assert h(raw)=='5acfb378da7dee530b2738f0e8e910117d9b3a27c2d66e29e4f9374072ade036';primary=json.loads(raw);assert len(primary['roles'])==189
large_expected={str(S/'1370-c0-m0-changed-route-controls-output-20261009-r2'/slot/'out/child.stdout') for slot in ('27-cap','28-cap')}
assert {x['path'] for x in primary['roles'] if x['bytes']>1024**2}==large_expected
# Audit other already selected parent outcome roles: no external directory traversal.
parents=[]
for x in inv['files']:
 if ('parent-recorded' in x['package'] or 'root-recorded' in x['package']) and x['sourcePath'].endswith('TOOL-OUTCOME.json') and x['sourcePath']!=str(main_outcome):
  assert x['bytes']<1024**2;b=Path(x['sourcePath']).read_bytes();assert h(b)==x['sha256'];j=json.loads(b)
  if isinstance(j.get('roles'),list):parents.append((x['sourcePath'],j['roles']))
for outcome,roles in [(str(main_outcome),primary['roles']),*parents]:
 matches=0;newcount=0
 for role in roles:
  if not isinstance(role,dict) or not all(k in role for k in ['path','bytes','sha256']):continue
  path=role['path'];p=Path(path)
  if path in by_path:
   oldrole=by_path[path];assert oldrole['bytes']==role['bytes'] and oldrole['sha256']==role['sha256'];matches+=1;continue
  assert p.is_absolute()
  try:relative=p.relative_to(S)
  except ValueError:omissions.append({'outcome':outcome,'path':path,'reason':'Outside requested scratch payload scope'});continue
  package=relative.parts[0]
  selected=json.loads((old/'SELECTED-DIRECTORIES.json').read_bytes())['directoryNames']
  if outcome!=str(main_outcome) and package not in selected:
   omissions.append({'outcome':outcome,'path':path,'reason':'Outside literal selected families; pointer only, not silently scanned/copied'});continue
  a=read_exact(p,role['sha256'],role['bytes']);is_padding=path in large_expected
  assert not is_padding or role.get('archiveBytes') is False
  entry={'sourcePath':path,'package':package,'relativePath':str(Path(*relative.parts[1:])),'mode':format(stat.S_IMODE(a.st_mode),'04o'),'bytes':role['bytes'],'sha256':role['sha256'],'nlink':a.st_nlink,'preservationAction':'LOCAL_HASH_SIZE_ONLY' if is_padding else 'COPY_FINITE_PAYLOAD','reason':'Root identified synthetic cap fixture child.stdout32MiB+1; local hash/size only' if is_padding else 'Exact parent-recorded finite control/evidence role; no directory scan','priorGitBlob':'NOT_QUERIED_NO_GIT_OPERATIONS','evidenceRole':'actualTinyControlsSyntheticCap' if is_padding else 'actualParentOutcomeRole','parentOutcomePath':outcome}
  inv['files'].append(entry);by_path[path]=entry;added.append(entry);newcount+=1
 audits.append({'outcomePath':outcome,'declaredRoleCount':len(roles),'previouslyCovered':matches,'newExactRolesAdded':newcount})
assert all(x['path'] in by_path for x in primary['roles']);assert len({x['sourcePath'] for x in inv['files']})==len(inv['files'])
inv.update(schema='1370-ai-checkpoint-finite-backup-inventory-draft-r2',status='DRAFT_BACKUP_PLAN_WITH_EXACT_CONTROLS_ROLES_NOT_CHECKPOINT',predecessor={'path':str(old/'INVENTORY-DRAFT.json'),'sha256':h(base)},exactAdditionalOutcomeAudits=audits,outsideScopeRolePointersNotScanned=omissions)
inv['summary']={'selectedCompletedDirectories':len(inv['selectedDirectorySummaries']),'regularFiniteFiles':len(inv['files']),'payloadBytes':sum(x['bytes'] for x in inv['files'] if x['preservationAction']=='COPY_FINITE_PAYLOAD'),'localHashSizeOnlyBytes':sum(x['bytes'] for x in inv['files'] if x['preservationAction']=='LOCAL_HASH_SIZE_ONLY'),'localHashSizeOnlyFiles':sum(x['preservationAction']=='LOCAL_HASH_SIZE_ONLY' for x in inv['files']),'additionalExactControlRoles':len(added),'largeSyntheticCapFiles':2,'priorGitCoverage':'Not queried; no Git operations.'}
(out/'INVENTORY-DRAFT.json').write_text(json.dumps(inv,sort_keys=True,indent=2)+'\n');(out/'EXACT-ROLE-AUDIT.json').write_text(json.dumps({'primaryOutcomePath':str(main_outcome),'primaryOutcomeSha256':h(raw),'all189RolesCovered':True,'audits':audits,'newRoles':added,'outsideScopePointers':omissions},sort_keys=True,indent=2)+'\n');(out/'SELECTED-DIRECTORIES.json').write_bytes((old/'SELECTED-DIRECTORIES.json').read_bytes());(out/'augment-exact-roles.py').write_bytes(Path(__file__).read_bytes());print(json.dumps(inv['summary'],sort_keys=True));print(json.dumps({'audits':audits,'outsideScopePointers':len(omissions)},sort_keys=True))
