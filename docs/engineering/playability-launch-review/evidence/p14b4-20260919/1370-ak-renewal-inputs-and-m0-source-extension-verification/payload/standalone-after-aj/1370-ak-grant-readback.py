import datetime,hashlib,json,os,shutil,stat,subprocess,sys
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch')
R=Path('/Users/zacheryspector/The-Movies-headless-program')
P=S/'1370-c0-m0-additive-expanded-readback-parent-recorded-after-aj-20261009-r1'
Q=S/'1370-c0-m0-additive-expanded-readback-verifier-filled-proposal-after-aj-20261009-r2'
REVIEW=S/'1370-c0-m0-additive-expanded-readback-filled-independent-review-after-aj-20261009-r2/RECEIPT.json'
HELPER=S/'1370-c0-stage41-heavy-lane-recovery-proposal-r8/lane-run-r8.sh'
LOG=S/'1370-c0-m0-additive-expanded-readback-lane-after-aj-20261009-r1.log'
def stamp(s):return [s.st_dev,s.st_ino,s.st_mode,s.st_nlink,s.st_size,s.st_mtime_ns,s.st_ctime_ns]
def role(p):
 p=Path(p);st=p.lstat();assert p.resolve(strict=True)==p and stat.S_ISREG(st.st_mode) and st.st_nlink==1 and st.st_size<=16*1024**2
 fd=os.open(p,os.O_RDONLY|os.O_NOFOLLOW)
 try:
  assert stamp(os.fstat(fd))==stamp(st);h=hashlib.sha256();size=0
  while True:
   chunk=os.read(fd,65536)
   if not chunk:break
   size+=len(chunk);assert size<=16*1024**2;h.update(chunk)
  assert size==st.st_size and stamp(os.fstat(fd))==stamp(st)==stamp(p.lstat())
 finally:os.close(fd)
 return {'path':str(p),'bytes':size,'sha256':h.hexdigest()}
def command(argv,timeout=30):return subprocess.check_output(argv,cwd=R,text=True,timeout=timeout).strip()
assert sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize and len(sys.argv)==3
wrapperReview=Path(sys.argv[1]);assert role(wrapperReview)['sha256']==sys.argv[2]
wr=json.loads(wrapperReview.read_text());assert wr['decision']=='ACCEPT_SOURCE_ONLY_EXACT_M0_READBACK_PARENT_WRAPPER' and wr['wrapper']==role(Path(__file__))
assert role(REVIEW)['sha256']=='10ce9ac2c0a14dcfa6a7e81401abb11dd753c6d071f699419d6265e48740d15c'
review=json.loads(REVIEW.read_text());assert review['decision']=='ACCEPT_EXACT_FILLED_UNRUN_M0_ADDITIVE_EXPANDED_READBACK'
for key,name in [('sourcePins','SOURCE-PINS.json'),('config','CONFIG.json'),('verifier','verify-expanded.py'),('recipe','RECIPE.json')]:assert review[key]==role(Q/name)
pins=json.loads((Q/'SOURCE-PINS.json').read_text())
for r in pins['files'].values():assert role(r['path'])==r
cfg=json.loads((Q/'CONFIG.json').read_text());recipe=json.loads((Q/'RECIPE.json').read_text())
assert cfg['bounds']=={'factsBytes':4194304,'perFileBytes':33554432,'regularBytes':119393120,'regularFiles':1740,'wholeSeconds':240}
py=cfg['pythonTool'];assert role(py['path'])['sha256']==py['sha256']
st=Path(py['path']).lstat();assert [st.st_dev,st.st_ino,stat.S_IMODE(st.st_mode),st.st_nlink]==py['identity']
assert role(HELPER)['sha256']=='aff8e9749cd3e33de874931dbf258fc13ceb79d2f7ea44fcc56816db85af3f2e'
roles=cfg['futureAuthority']['roles']
for r in roles.values():assert role(r['path'])==r
outcome=json.loads(Path(roles['parentToolOutcome']['path']).read_text());assert all(type(outcome[k]) is int and outcome[k]==0 for k in ['actualToolExit','actualHelperExit','actualSupervisorExit','actualRecorderExit','actualChildExit']) and outcome['unexpectedHelperWait'] is False
assert roles['binding']['sha256']==outcome['bindingSha256']=='35e596a0ee6d5119fd2a84f03f3fc0a7398be1208a8f65e4c4824ca67e269a50'
assert recipe['argv'][:5]==[py['path'],'-I','-B',str(Q/'verify-expanded.py'),review['sourcePins']['sha256']]
assert recipe['argv'][5:]==['<ACTUAL_SEPARATE_ROOT_READBACK_GRANT_PATH>','<ACTUAL_GRANT_SHA256>'] and recipe['cwd']==str(R)
assert recipe['environment']=={'GIT_OPTIONAL_LOCKS':'0','PYTHONDONTWRITEBYTECODE':'1'} and recipe['executionAuthorization'] is False
assert command(['/usr/sbin/sysctl','-n','kern.bootsessionuuid'],5)=='452DE205-E1D6-462E-8673-553462BB0166'
assert 'AC Power' in command(['/usr/bin/pmset','-g','batt'],5)
free=shutil.disk_usage(S).free;assert free>=3758096384
ids=[44676,45166,45180,45181,45183,45200]
for pid in ids:
 for check in (os.kill,os.killpg):
  try:check(pid,0)
  except ProcessLookupError:pass
  else:raise RuntimeError('Prior owned PID or PGID exists '+str(pid))
fresh=[P,LOG,Path(str(LOG)+'.meta'),S/'HEAVY-LANE-LOCK',Path(cfg['outputPath'])]
assert all(not os.path.lexists(p) for p in fresh)
grant={'schema':'1370-m0-expanded-readback-root-grant/v1','decision':'GRANT_READONLY_EXPANDED_M0_READBACK','utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'sourcePinsSha256':review['sourcePins']['sha256'],'configSha256':review['config']['sha256'],'bindingSha256':roles['binding']['sha256'],'soleLaneReserved':True,'readbackLimitSeconds':240,'exactReview':role(REVIEW),'wrapperReview':role(wrapperReview),'wrapper':role(Path(__file__)),'helper':role(HELPER),'rootPidBecomesHelperPid':os.getpid(),'priorOwnedPidsAndPgidsAbsent':ids,'globalWorkerAbsenceClaim':False,'protectedFreezeMaintainedSinceBaseline744095':True,'actualFreeBytes':free,'acPower':True,'unexpectedHelperWaitIsStop':True,'gameExecutionAuthorized':False,'outputPath':cfg['outputPath'],'cwd':str(R),'environment':recipe['environment'],'runtimeArgvPrefix':recipe['argv'][:5]}
P.mkdir(mode=0o700)
fd=os.open(P/'GRANT.json',os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
with os.fdopen(fd,'w') as f:json.dump(grant,f,indent=2,sort_keys=True);f.write('\n');f.flush();os.fsync(f.fileno())
gr=role(P/'GRANT.json');argv=['/bin/bash',str(HELPER),'0',str(LOG),*recipe['argv'][:5],gr['path'],gr['sha256']]
print(json.dumps({'grant':gr,'rootPidBecomesHelperPid':os.getpid(),'argv':argv}),flush=True)
os.chdir(R);os.execve(argv[0],argv,dict(os.environ,**recipe['environment']))
