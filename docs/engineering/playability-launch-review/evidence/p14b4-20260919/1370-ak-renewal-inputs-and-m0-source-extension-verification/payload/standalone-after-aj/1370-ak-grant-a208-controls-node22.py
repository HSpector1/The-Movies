import datetime,hashlib,json,os,shutil,stat,subprocess,sys
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');R=Path('/Users/zacheryspector/The-Movies-headless-program')
Q=S/'1370-c0-a208-finite-recorded-controls-node22-filled-source-after-aj-20261009-r1'
P=S/'1370-c0-a208-controls-node22-parent-recorded-after-aj-20261009-r1'
HEAD='f0fb818fe7534c3e3784206d16728b015c7f059a'
def stamp(s):return (s.st_dev,s.st_ino,s.st_mode,s.st_nlink,s.st_size,s.st_mtime_ns,s.st_ctime_ns)
def role(p):
 p=Path(p);before=p.lstat();assert p.resolve(strict=True)==p and stat.S_ISREG(before.st_mode) and before.st_nlink==1 and before.st_size<=128*1024**2
 fd=os.open(p,os.O_RDONLY|os.O_NOFOLLOW)
 try:
  assert stamp(os.fstat(fd))==stamp(before);h=hashlib.sha256();size=0
  while True:
   chunk=os.read(fd,65536)
   if not chunk:break
   size+=len(chunk);assert size<=128*1024**2;h.update(chunk)
  assert size==before.st_size and stamp(os.fstat(fd))==stamp(before)==stamp(p.lstat())
 finally:os.close(fd)
 return {'path':str(p),'bytes':size,'sha256':h.hexdigest()}
def git(*args):return subprocess.check_output(['/usr/bin/git','-c','gc.auto=0','-c','maintenance.auto=0','--no-optional-locks',*args],cwd=R,text=True,timeout=30).strip()
assert sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize
assert len(sys.argv) in (8,10)
mode,wrapper_review_path,wrapper_review_sha,source_review_path,source_review_sha,completion_path,completion_sha=sys.argv[1:8]
assert mode in ('js','python') and len(sys.argv)==(8 if mode=='js' else 10)
wr=Path(wrapper_review_path);assert role(wr)['sha256']==wrapper_review_sha;wrj=json.loads(wr.read_text());assert wrj['decision']=='ACCEPT_SOURCE_ONLY_UNRUN_A208_NODE22_PARENT_CONTROL_WRAPPER' and wrj['wrapper']==role(Path(__file__))
sr=Path(source_review_path);assert role(sr)['sha256']==source_review_sha=='8e6a73e06cb774e61d103439bd17536ee97302802cea21cb48a5a93d808776cf';review=json.loads(sr.read_text());assert review['decision']=='ACCEPT_SOURCE_ONLY_UNRUN_A208_NODE22_FILLED_CONTROLS_ROUTE'
pins=role(Q/'SOURCE-PINS.json');assert pins['sha256']=='8e3d9c290e07e9f4be06fac3c0b31aa1d371e4dc6fd9976455135c348582d1c5'==review['sourcePinsSha256']
source=json.loads((Q/'SOURCE-PINS.json').read_text());roles=[role(wr),role(sr),pins,role(Path(__file__))]
for name,expected in source['files'].items():
 actual=role(Q/name);assert actual['bytes']==expected['bytes'] and actual['sha256']==expected['sha256'];roles.append(actual)
c=json.loads((Q/'CONFIG.json').read_text());route=json.loads((Q/'ROUTE.json').read_text())
assert role(Q/'CONFIG.json')['sha256']=='09a59741bdb24e8641ca82e2ac4ee1aa95bde7c82bf779603aface088c0f6afb'
for expected in c['roles'].values():assert role(expected['path'])==expected;roles.append(expected)
assert role(c['nodePath'])=={'path':c['nodePath'],'bytes':c['nodeBytes'],'sha256':c['nodeSha256']}
assert c['executionAuthorization'] is False and route['executionAuthorization'] is False
assert role(c['runtimeGrant']['path'])==c['runtimeGrant'] and c['runtimeGrant']['sha256']=='7da501eb54301aaf0a22c5dc29e4dff786ee4bd9bfff490153d951c54bd7b9eb'
scope=json.loads(Path(c['runtimeGrant']['path']).read_text());assert scope['executionAuthorization'] is False and scope['actualRuntimeGrant'] is None
assert scope['status']=='ROOT_ADOPTED_PROSPECTIVE_NODE22_TOOL_MATCH_SOURCE_ONLY' and scope['requestedConfigReplacement']=={'nodePath':c['nodePath'],'nodeBytes':c['nodeBytes'],'nodeSha256':c['nodeSha256']} and len(c['roles'])==30
done=Path(completion_path);assert role(done)['sha256']==completion_sha;d=json.loads(done.read_text())
assert d['status']=='ROOT_ADOPTED_OBSERVED_M0_ADDITIVE_WITH_FULL_PROTECTION' and d['protectedPostflightAccepted'] is True and d['soleLaneReleased'] is True and d['productionHead']==HEAD
for expected in d['acceptedRoles'].values():assert role(expected['path'])==expected
roles.append(role(done))
js_review=None
if mode=='python':
 jr=Path(sys.argv[8]);assert role(jr)['sha256']==sys.argv[9];j=json.loads(jr.read_text())
 assert j['decision']=='ACCEPT_OBSERVED_A208_JS_CONTROLS' and j['sourcePinsSha256']==pins['sha256'] and j['all13Passed'] is True
 js_review=role(jr);roles.append(js_review)
assert git('rev-parse','HEAD')==HEAD and git('rev-parse','HEAD:src')=='13880d9b0ba72aff5d4c5bcf5d12fe682c5de554' and not git('status','--porcelain=v1','--untracked-files=all')
assert git('ls-remote','origin','refs/heads/wip/headless-program-20260916-ts')==HEAD+'\trefs/heads/wip/headless-program-20260916-ts'
assert not os.path.lexists(S/'HEAVY-LANE-LOCK')
for pid in d['ownedPidsAndPgids']:
 for check in (os.kill,os.killpg):
  try:check(pid,0)
  except ProcessLookupError:pass
  else:raise RuntimeError('Previously owned PID or PGID still present '+str(pid))
free=shutil.disk_usage(S).free;assert free>=3758096384
assert 'AC Power' in subprocess.check_output(['/usr/bin/pmset','-g','batt'],text=True,timeout=5)
argv=route['commands'][mode];assert argv[:3]==['/bin/bash',str(S/'1370-c0-stage41-heavy-lane-recovery-proposal-r8/lane-run-r8.sh'),'0'] and argv[4:]==[c['pythonPath'],'-I','-B',str(Q/'record.py'),mode]
assert role(argv[1])['sha256']=='aff8e9749cd3e33de874931dbf258fc13ceb79d2f7ea44fcc56816db85af3f2e'
assert role(c['pythonPath'])['sha256']=='7673432d7f09628764bff0664b0ed1605743a266593d73434e82fd2fa8da2835'
lane=Path(argv[3]).parent;out=S/('1370-c0-a208-controls-'+mode+'-output-after-aj-node22-20261009-r1')
assert lane==S/('1370-c0-a208-controls-'+mode+'-lane-after-aj-node22-20261009-r1') and not os.path.lexists(lane) and not os.path.lexists(out)
assert not os.path.lexists(c['pythonFixture'])
assert route['cwd']==str(Q) and route['environment']=={'GIT_OPTIONAL_LOCKS':'0','PYTHONDONTWRITEBYTECODE':'1'}
assert route['expected']['jsGroups']==13 and route['expected']['pythonMethods']==14 and route['expected']['noChildReportValidationMethods']==3
P.mkdir(mode=0o700,exist_ok=True);assert P.resolve(strict=True)==P and P.is_dir()
grant={'schema':'a208-controls-root-grant-v1','status':'GRANTED_ONE_EXACT_A208_'+mode.upper()+'_CONTROL_ARM','utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'mode':mode,'rootPidBecomesHelperPid':os.getpid(),'sourceRoles':roles,'config':role(Q/'CONFIG.json'),'recorder':role(Q/'record.py'),'route':role(Q/'ROUTE.json'),'wrapperReview':role(wr),'sourceReview':role(sr),'protectedM0ChainCompletion':role(done),'jsObservedReview':js_review,'argv':argv,'cwd':route['cwd'],'environment':route['environment'],'bounds':route['bounds'],'expected':route['expected'],'productionHead':HEAD,'freeBytes':free,'acPower':True,'priorOwnedPidsAndPgidsFreshlyAbsent':d['ownedPidsAndPgids'],'globalWorkerAbsenceClaim':False,'unexpectedHelperWaitIsStop':True,'sourceConfigHeldLabelsRemainHistorical':True,'gamePricingOrRenewalAttributionAuthorized':False}
gp=P/(mode.upper()+'-GRANT.json');fd=os.open(gp,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
with os.fdopen(fd,'w') as f:json.dump(grant,f,sort_keys=True,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
lane.mkdir(mode=0o700);print(json.dumps({'grant':role(gp),'rootPidBecomesHelperPid':os.getpid()}),flush=True)
os.chdir(route['cwd']);os.execve(argv[0],argv,dict(os.environ,**route['environment']))
