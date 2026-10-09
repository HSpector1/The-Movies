from pathlib import Path
import datetime,hashlib,json,os,stat
S=Path('/Users/zacheryspector/studio-scratch')
HERE=Path(__file__).parent
P=S/'1370-c0-m0-additive-full-guard-parent-recorded-after-aj-20261009-r2'
OLD=S/'1370-c0-m0-additive-full-guard-parent-recorded-after-aj-20261009-r1'
Q=S/'1370-c0-m0-additive-operational-full-guard-after-aj-proposal-20261009-r2'
roles={}
def read(p,expected=None):
 p=Path(p); assert p.resolve(strict=True)==p
 fd=os.open(p,os.O_RDONLY|os.O_NOFOLLOW)
 try:
  first=os.fstat(fd); assert stat.S_ISREG(first.st_mode) and first.st_nlink==1 and first.st_size<=1048576
  parts=[]; total=0
  while True:
   b=os.read(fd,65536)
   if not b:break
   total+=len(b);assert total<=1048576;parts.append(b)
  last=os.fstat(fd); path=p.lstat()
  keys=lambda t:(t.st_dev,t.st_ino,t.st_mode,t.st_nlink,t.st_size,t.st_mtime_ns,t.st_ctime_ns)
  assert keys(first)==keys(last)==keys(path)
 finally:os.close(fd)
 data=b''.join(parts);assert len(data)==first.st_size
 r={'path':str(p),'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()}
 if expected:assert r==expected
 roles[str(p)]=r
 return data,r
proposal,proposalrole=read(P/'EXACT-ARGV-PROPOSAL.json');assert proposalrole['sha256']=='bbfd52484cc6160a53ae219aa0d093d5f69f231a860427dc68866d097afb8a26'
x=json.loads(proposal)
wrapper,wrapperrole=read(P/'grant_before_fill.py');assert wrapperrole['sha256']=='110717276f325d44e00bd0d5d36db9ece6a1fc193a78c42b68ab2f09c405d6ce'
review,reviewrole=read(S/'1370-c0-m0-additive-full-guard-root-source-review-after-aj-20261009-r1/RECEIPT.json');assert reviewrole['sha256']==x['sourceReviewSha256']=='a06cdade7513d63e793e27b67a74571ca16b896ae0ee2ee1aeda94d2c854053c'
r=json.loads(review)
for name,expected in r['roles'].items():read(Path(name),expected)
assert x['argv']==[*r['beforeFillArgv'][:-1],'before-fill-after-aj-r3']
assert x['cwd']==r['cwd'] and x['environment']==r['environment']
assert x['configSha256']==r['configSha256']==roles[str(Q/'CONFIG.json')]['sha256']
assert x['guardSourceSha256']==r['guardSourceSha256']==roles[str(Q/'snapshot.py')]['sha256']
stop,stoprole=read(OLD/'BEFORE-FILL-STOP.json');assert stoprole['sha256']==x['priorStop']['sha256']=='757eccd1f815fd4cc167c034b3bd0bca2d8f084c81a4a9a1442fe3d1dde68f29'
st=json.loads(stop);assert st['actualToolExit']==1 and st['snapshotPid']==85523
stderr,stderrrole=read(OLD/'before-fill.stderr');assert stderrrole['sha256']==st['stderrSha256'] and len(stderr)==1058
assert b'FileNotFoundError' in stderr and b'line 127, in main' in stderr and b'evidence/before-fill-after-aj-r2' in stderr
stdout,stdoutrole=read(OLD/'before-fill.stdout');assert stdout==b''
tool,toolrole=read(OLD/'BEFORE-FILL-ACTUAL-TOOL.json');t=json.loads(tool);assert t['toolSessionId']==2203 and t['chunks'][-1]['exit_code']==1
grant,grantrole=read(OLD/'BEFORE-FILL-GRANT.json');g=json.loads(grant);assert grantrole['sha256']=='afe0da07dcdd2ae261b635950ff962db9ebae959e591110b79f48d7a96848317'
assert g['parentPidBecomesSnapshotPid']==85523 and g['argv']==r['beforeFillArgv']
assert g['guardSource']==roles[str(Q/'snapshot.py')] and g['config']==roles[str(Q/'CONFIG.json')]
lines=roles[str(Q/'snapshot.py')]
source=read(Q/'snapshot.py')[0].decode().splitlines()
assert 'output.mkdir(mode=0o700)' in source[126] and 'facts_before=current(' in source[131] and 'protected={' in source[133] and 'inventory_started=' in source[138]
p=Path(x['outputParentRole']['path']);s=p.lstat();assert p.resolve(strict=True)==p and stat.S_ISDIR(s.st_mode)
parent={'path':str(p),'device':s.st_dev,'inode':s.st_ino,'mode':stat.S_IMODE(s.st_mode)}
assert parent==x['outputParentRole'] and parent['mode']==0o700
absent=[Q/'evidence'/x['argv'][-1],Q/'evidence'/'before-fill-after-aj-r2',P/'before-fill.stdout',P/'before-fill.stderr',P/'BEFORE-FILL-GRANT.json']
for path in absent:assert not os.path.lexists(path)
for check in (os.kill,os.killpg):
 try:check(85523,0)
 except ProcessLookupError:pass
 else:raise AssertionError('prior owned PID/PGID85523 exists')
facts={'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'roles':roles,'exactArgvProposal':proposalrole,'argv':x['argv'],'wrapperSha256':wrapperrole['sha256'],'outputParentRole':parent,'freshAbsentPaths':list(map(str,absent)),'priorPidAndPgidFreshAbsent':[85523],'globalWorkerClearanceClaim':False,'causeConfirmedBeforeCurrentProtectedAndInventory':True,'sourceConfigUnchanged':True,'guardRuntimeExecuted':False,'fullScanExecuted':False,'gitExecuted':False,'wrapperExecuted':False}
(HERE/'FACTS.json').write_text(json.dumps(facts,indent=2,sort_keys=True)+'\n')
print(json.dumps({'status':'FINITE_ARTIFACT_SETUP_REPAIR_REVIEW_PASS','roles':len(roles),'priorPidAndPgidAbsent':85523,'outputParentRole':parent}))
