import datetime,hashlib,json,os,shutil,stat,subprocess,sys
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch')
R=Path('/Users/zacheryspector/The-Movies-headless-program')
P=S/'1370-c0-m0-additive-exact-parent-adoption-after-aj-20261009-r1'
A={'status','executionAuthorization','exactBindingReviewPath','exactBindingReviewSha256','exactBindingReviewDecision'}
CORE='69f4a0a4e5bb4d686ef03178dafa9b4c27c11d8671745d61a0537fd725adf69d'
def sha(b):return hashlib.sha256(b).hexdigest()
def canonical(x):return json.dumps(x,sort_keys=True,separators=(',',':')).encode()
def stamp(s):return [s.st_dev,s.st_ino,s.st_mode,s.st_nlink,s.st_size,s.st_mtime_ns,s.st_ctime_ns]
def role(p,links=1):
 p=Path(p);st=p.lstat();assert p.resolve(strict=True)==p and stat.S_ISREG(st.st_mode) and st.st_nlink==links and st.st_size<=16*1024**2
 fd=os.open(p,os.O_RDONLY|os.O_NOFOLLOW)
 try:
  assert stamp(os.fstat(fd))==stamp(st);h=hashlib.sha256();size=0
  while True:
   chunk=os.read(fd,65536)
   if not chunk:break
   size+=len(chunk);assert size<=16*1024**2;h.update(chunk)
  assert stamp(os.fstat(fd))==stamp(st)==stamp(p.lstat()) and size==st.st_size
 finally:os.close(fd)
 return {'path':str(p),'bytes':size,'sha256':h.hexdigest()}
def command(argv,timeout=30):return subprocess.check_output(argv,cwd=R,text=True,timeout=timeout).strip()
def git(*args):return command(['/usr/bin/git','-c','gc.auto=0','-c','maintenance.auto=0','--no-optional-locks',*args])
assert sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize and len(sys.argv)==3
review=Path(sys.argv[1]);assert role(review)['sha256']==sys.argv[2]
rv=json.loads(review.read_text());assert rv['decision']=='ACCEPT_M0_ADDITIVE_ADOPTED_PREFLIGHT' and rv['wrapper']==role(Path(__file__))
launch_path=P/'ADOPTED-LAUNCH-SPEC.json';assert rv['adoptedLaunch']==role(launch_path)
l=json.loads(launch_path.read_text());bp=Path(l['bindingPath']);assert role(bp)['sha256']==l['bindingSha256']
b=json.loads(bp.read_text());assert b['executionAuthorization'] is True and b['status']=='REVIEWED_FILLED_UNRUN'
semantic=sha(canonical({k:v for k,v in b.items() if k not in A}));assert semantic==l['bindingSemanticSha256']==rv['bindingSemanticSha256']
assert sha(canonical({k:v for k,v in b.items() if k not in A|{'preflightReviewPath','preflightReviewSha256'}}))==CORE==rv['guardCoreSha256']==l['guardCoreSha256']
assert b['bounds']=={'childSeconds':180,'wholeSeconds':210,'combinedChildLogsBytes':33554432,'bodyResultBytes':100000}
assert b['productionHead']=='f0fb818fe7534c3e3784206d16728b015c7f059a' and b['productionSourceTree']=='13880d9b0ba72aff5d4c5bcf5d12fe682c5de554'
roles=[role(review),role(launch_path),role(bp),role(P/'ADOPTION.json'),role(Path(__file__))]
for k in ['exactBindingReview','preflightReview','materializer','materializerSourceReview','materializerArgvRole','parentScopeAdoption','recorder','routeSourceReview','supervisor','currentFullGuardSnapshot','currentFullGuardReview','currentFullGuardParentAdoption','currentBoundedMetadata']:
 x=role(b[k+'Path']);assert x['sha256']==b[k+'Sha256'];roles.append(x)
ad=json.loads((P/'ADOPTION.json').read_text());assert ad['adoptedBinding']==role(bp) and ad['adoptedLaunch']==role(launch_path) and ad['nonbindingFiveBytesAndMetadataUnchanged'] is True and set(ad['changedFields'])==A
am=role(ad['archiveManifest']['path']);assert am==ad['archiveManifest'];roles.append(am)
for entry in json.loads(Path(am['path']).read_text())['files'].values():assert role(entry['archive']['path'])==entry['archive']
assert role(l['argv'][1])['sha256']==l['helperSha256']=='aff8e9749cd3e33de874931dbf258fc13ceb79d2f7ea44fcc56816db85af3f2e'
assert l['argv']==['/bin/bash',l['argv'][1],'0',str(S/b['helperLogName']),b['pythonPath'],'-I','-B',b['supervisorPath'],str(bp)] and l['cwd']==str(R) and l['environment']==b['launchEnvironment']
assert l['runtimeArgv']==l['argv'][4:] and b['materializerArgv']==[b['pythonPath'],'-I','-B',b['materializerPath'],str(bp)]
for path,expected in b['strictRootMetadata'].items():
 p=Path(path);st=p.lstat();assert p.resolve(strict=True)==p and stat.S_ISDIR(st.st_mode) and [st.st_dev,st.st_ino,stat.S_IMODE(st.st_mode),st.st_mtime_ns,st.st_ctime_ns]==expected
for path,expected in b['ancestryIdentity'].items():
 p=Path(path);st=p.lstat();assert p.resolve(strict=True)==p and stat.S_ISDIR(st.st_mode) and [st.st_dev,st.st_ino,stat.S_IMODE(st.st_mode)]==expected
leaf=Path(b['mirrorPath']);assert leaf.resolve(strict=True)==leaf and stamp(leaf.lstat())==b['originalM0RootMetadata']
for path,expected in b['toolRoles'].items():
 p=Path(path);st=p.lstat();assert p.resolve(strict=True)==p and stat.S_ISREG(st.st_mode) and os.access(p,os.X_OK) and [st.st_dev,st.st_ino,stat.S_IMODE(st.st_mode),st.st_nlink]==expected['identity']
 x=role(p,links=st.st_nlink);assert x['sha256']==expected['sha256'];roles.append(x)
assert git('rev-parse','HEAD')==b['productionHead'] and git('rev-parse','HEAD:src')==b['productionSourceTree'] and not git('status','--porcelain=v1','--untracked-files=all')
assert git('ls-remote','origin','refs/heads/wip/headless-program-20260916-ts')==b['productionHead']+'\trefs/heads/wip/headless-program-20260916-ts'
assert command(['/usr/sbin/sysctl','-n','kern.bootsessionuuid'],5)==b['bootSessionUuid']
assert 'AC Power' in command(['/usr/bin/pmset','-g','batt'],5)
free=shutil.disk_usage(S).free;assert free>=3758096384
log=Path(l['argv'][3]);fresh=[S/'HEAVY-LANE-LOCK',Path(b['outputRoot']),Path(b['recorderLockPath']),log,log.with_suffix('.meta'),Path(str(log)+'.meta'),P/'GRANT.json']
assert all(not os.path.lexists(p) for p in fresh)
ids=[93713,78074]
for pid in ids:
 for check in (os.kill,os.killpg):
  try:check(pid,0)
  except ProcessLookupError:pass
  else:raise RuntimeError('Prior owned scanner PID or PGID exists '+str(pid))
grant={'schema':'m0-additive-root-exact-grant/v1','status':'GRANTED_ONE_EXACT_RECORDED_M0_ADDITIVE_INPUT_ROUTE_ONLY','utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'rootPidBecomesHelperPid':os.getpid(),'adoptedPreflight':role(review),'bindingSemanticSha256':semantic,'guardCoreSha256':CORE,'roles':roles,'argv':l['argv'],'cwd':l['cwd'],'environment':l['environment'],'bounds':b['bounds'],'acPower':True,'freeBytes':free,'priorOwnedScannerPidsAndPgidsAbsent':ids,'globalWorkerAbsenceClaim':False,'runtimePathsFreshlyAbsent':list(map(str,fresh)),'protectedFreezeMaintainedSinceBaseline744095':True,'unexpectedHelperWaitIsStop':True,'gameTypesCollectionWiringNeutralityAuthorized':False,'independentExpandedReadbackAndFullProtectedPostflightRequired':True}
fd=os.open(P/'GRANT.json',os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
with os.fdopen(fd,'w') as f:json.dump(grant,f,indent=2,sort_keys=True);f.write('\n');f.flush();os.fsync(f.fileno())
print(json.dumps({'grant':role(P/'GRANT.json'),'rootPidBecomesHelperPid':os.getpid()}),flush=True)
os.chdir(R);os.execve(l['argv'][0],l['argv'],dict(os.environ,**l['environment']))
