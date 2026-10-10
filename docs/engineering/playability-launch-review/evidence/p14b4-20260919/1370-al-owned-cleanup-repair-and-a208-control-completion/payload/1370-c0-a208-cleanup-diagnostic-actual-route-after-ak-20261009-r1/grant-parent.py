"""SOURCE ONLY unrun current-AK exact Python diagnostic parent wrapper.
Args: filled-route-review path SHA, wrapper-review path SHA,
      actual root PURE-OBSERVED-ADOPTION path SHA.
No source-only dictionary is a real retry grant. Invoke only after separate root
once-only grant decision; this source is never executed during preparation.
"""
import datetime,hashlib,json,os,shutil,stat,subprocess,sys
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');R=Path('/Users/zacheryspector/The-Movies-headless-program')
Q=S/'1370-c0-a208-cleanup-diagnostic-actual-route-after-ak-20261009-r1'
P=S/'1370-c0-a208-cleanup-diagnostic-actual-python-parent-recorded-after-ak-20261009-r1'
HEAD='372d15e1ae53b898be2cf633a6bb8bb0058cb01f';SRC='13880d9b0ba72aff5d4c5bcf5d12fe682c5de554'
MAIN='c902a704eb948cc576083d0973c8c23e59937dc1';AJ='f0fb818fe7534c3e3784206d16728b015c7f059a'
CONFIG_SHA='1670a6d9ae9f16c65bbf75c4f51b2a2151740c878efd03de16d6f89ec6fea6b6'
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
def authenticate(expected):assert role(expected['path'])==expected;return expected
def json_role(path,expected_sha):
 actual=role(path);assert actual['sha256']==expected_sha and actual['bytes']<=1024**2
 return actual,json.loads(Path(path).read_text())
def git(*args):return subprocess.check_output(['/usr/bin/git','-c','gc.auto=0','-c','maintenance.auto=0','--no-optional-locks',*args],cwd=R,text=True,timeout=30).strip()
def absent(number):
 assert type(number) is int and number>1
 for check in (os.kill,os.killpg):
  try:check(number,0)
  except ProcessLookupError:pass
  else:raise RuntimeError('Previously owned PID or PGID still present '+str(number))
assert sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize and len(sys.argv)==7
fillpath,fillsha,wrpath,wrsha,focuspath,focussha=sys.argv[1:]
fr,fill=json_role(fillpath,fillsha)
assert fill['decision']=='ACCEPT_SOURCE_ONLY_UNRUN_A208_CLEANUP_DIAGNOSTIC_ACTUAL_ROUTE' and fill['executionAuthorization'] is False
pins=role(Q/'SOURCE-PINS.json');assert pins['sha256']==fill['sourcePinsSha256']
source=json.loads((Q/'SOURCE-PINS.json').read_text());assert source['executionAuthorization'] is False
for name,expected in source['files'].items():assert authenticate(expected)['path']==str(Q/name)
wr,w=json_role(wrpath,wrsha)
assert w['decision']=='ACCEPT_SOURCE_ONLY_UNRUN_A208_CURRENT_AK_DIAGNOSTIC_PARENT_WRAPPER' and w['wrapper']==role(Path(__file__)) and w['executionAuthorization'] is False
assert role(Q/'CONFIG.json')['sha256']==CONFIG_SHA
c=json.loads((Q/'CONFIG.json').read_text());route=json.loads((Q/'ROUTE.json').read_text())
assert c['executionAuthorization'] is False and route['executionAuthorization'] is False and c['sourceOnlyBindingNotExecutionAuthority'] is True
assert c['operationalProductionHead']==HEAD and c['operationalSourceTree']==SRC and len(c['roles'])==36
for expected in c['roles'].values():authenticate(expected)
assert c['sourceReview']==c['roles']['diagnosticImplementationReview']
review=json.loads(Path(c['sourceReview']['path']).read_text())
assert review['decision']=='ACCEPT_SOURCE_ONLY_UNRUN_A208_OWNED_CLEANUP_DIAGNOSTIC_IMPLEMENTATION' and review['executionAuthorization'] is False
assert review['module']['sha256']=='8117463b6ecd6aa57dd5b34a6ad1ee50f8d9a82197b13659bed0f489a6ad2a15' and review['driver']['sha256']=='0a4934e66eb748d7f2912373bd6896b21e80a867fad4a1e72b9f2a7647345369'
assert c['runtimeGrant']==c['roles']['implementationSourceAdoption'];adoption=json.loads(Path(c['runtimeGrant']['path']).read_text())
assert adoption['status']=='ROOT_ADOPTED_SOURCE_ONLY_CLEANUP_DIAGNOSTIC_IMPLEMENTATION' and adoption['runtimeRetryAuthorized'] is False and adoption['review']==c['sourceReview']
assert adoption['module']['sha256']==c['roles']['ownedCleanupDiagnostics']['sha256'] and adoption['driver']['sha256']==c['roles']['driver']['sha256']
assert role(c['nodePath'])=={'path':c['nodePath'],'bytes':c['nodeBytes'],'sha256':c['nodeSha256']}
assert c['nodeSha256']=='0b4f059915f3bf3c6cbb02422f4a529bfb21cbbec2d29851c9a5d833f78a04f6'
# Historical completion is immutable AJ evidence, never rewritten as current AK.
done_role=authenticate(source['historicalM0Complete']);done=json.loads(Path(done_role['path']).read_text())
assert done['status']=='ROOT_ADOPTED_OBSERVED_M0_ADDITIVE_WITH_FULL_PROTECTION' and done['productionHead']==AJ and done['productionSourceTree']==SRC and done['soleLaneReleased'] is True and done['protectedPostflightAccepted'] is True
for expected in done['acceptedRoles'].values():authenticate(expected)
pub_role=authenticate(source['currentAkReadback']);pub=json.loads(Path(pub_role['path']).read_text())
assert pub['status']=='PUSHED_REMOTE_AND_COMMITTED_TREE_VERIFIED' and pub['head']==pub['trackingWorkingHead']==HEAD and pub['sourceTree']==SRC and pub['main']==MAIN and pub['workingTreeClean'] is True
# Qualify existing JS1abe by exact source/tool/argv/validator equality, not new bundle SHA.
proof=json.loads((Q/'JS-REUSE-PROOF.json').read_text());old_role=authenticate(proof['originalConfig']);old=json.loads(Path(old_role['path']).read_text())
jr=authenticate(proof['actualJsReview']);j=json.loads(Path(jr['path']).read_text())
assert j['decision']=='ACCEPT_OBSERVED_A208_JS_CONTROLS' and j['all13Passed'] is True and j['sourcePinsSha256']==proof['historicalPinsSha256']
assert c['observerFiles']==old['observerFiles'] and len(c['observerFiles'])==18
for expected in c['observerFiles'].values():authenticate(expected)
assert all(c[key]==old[key] for key in ('nodePath','nodeBytes','nodeSha256'))
assert c['roles']['reportGuard']['sha256']==old['roles']['reportGuard']['sha256'] and c['roles']['reportControls']['sha256']==old['roles']['reportControls']['sha256']
assert proof['actualJsArgv']==[old['nodePath'],'--test','--test-reporter=tap',old['roles']['observer:test-synthetic.mjs']['path'],old['roles']['observer:test-settlement208.mjs']['path']]
authenticate(proof['originalRecorder'])
# Actual focused outcome remains external and unfilled until root adoption exists.
fa,f=json_role(focuspath,focussha)
assert Path(focuspath)==S/'1370-al-root-continuation-20261009-r1/PURE-OBSERVED-ADOPTION.json' and fa==c['actualFocusedControlReceipt']==c['roles']['actualFocusedAdoption']
assert f['status']=='ROOT_ADOPTED_OBSERVED_PURE_CLEANUP_RED_GREEN'
assert authenticate(f['candidateModule'])['sha256']=='8117463b6ecd6aa57dd5b34a6ad1ee50f8d9a82197b13659bed0f489a6ad2a15'
assert authenticate(f['tester'])['sha256']=='5acc6a49004a2021e35bc93164754accfce1f8180f40290579c78c60d3dbf328'
assert set(f['actualExits'])=={'tool','helper','recorder','child'} and all(type(value) is int and value==0 for value in f['actualExits'].values())
assert f['counts']=={'expectedRed':3,'green':18,'total':21} and all(type(value) is int for value in f['counts'].values())
assert f['game'] is False and f['actual17MethodControlsAccepted'] is False and f['runtimeRetryAuthorized'] is False
fi=authenticate(f['independentReview']);independent=json.loads(Path(fi['path']).read_text());assert independent['decision']=='ACCEPT_OBSERVED_PURE_CLEANUP_RED_GREEN'
assert isinstance(f['acceptedRoles'],dict) and len(f['acceptedRoles'])>=6
for expected in f['acceptedRoles'].values():authenticate(expected)
assert isinstance(f['ownedIdsAbsent'],list) and f['ownedIdsAbsent']
assert git('symbolic-ref','--quiet','--short','HEAD')=='wip/headless-program-20260916-ts'
assert git('rev-parse','HEAD')==HEAD and git('rev-parse','HEAD:src')==SRC and not git('status','--porcelain=v1','--untracked-files=all')
assert git('ls-remote','origin','refs/heads/wip/headless-program-20260916-ts','refs/heads/main').splitlines()==[MAIN+'\trefs/heads/main',HEAD+'\trefs/heads/wip/headless-program-20260916-ts']
assert not os.path.lexists(S/'HEAVY-LANE-LOCK')
previous=json.loads(Path(source['historicalControlsParentDisposition']['path']).read_text())
authenticate(source['historicalControlsParentDisposition'])
owned=sorted(set(done['ownedPidsAndPgids']+previous['freshKnownPidsAndPgidsAbsent']+f['ownedIdsAbsent']))
for number in owned:absent(number)
free=shutil.disk_usage(S).free;assert free>=3758096384
assert 'AC Power' in subprocess.check_output(['/usr/bin/pmset','-g','batt'],text=True,timeout=5)
argv=route['commands']['python'];assert argv[:3]==['/bin/bash',c['roles']['helper']['path'],'0'] and argv[4:]==[c['pythonPath'],'-I','-B',str(Q/'record.py'),'python']
assert c['roles']['helper']['sha256']=='aff8e9749cd3e33de874931dbf258fc13ceb79d2f7ea44fcc56816db85af3f2e' and c['roles']['python']['sha256']=='7673432d7f09628764bff0664b0ed1605743a266593d73434e82fd2fa8da2835'
assert route['bounds']=={'eachParentActiveSeconds':75,'eachParentChildSeconds':60,'eachParentWholeSeconds':90,'eachStreamBytes':1048576,'ownedFixtureBytes':8388608,'pythonDriverActiveSeconds':45,'pythonDriverWholeSeconds':55}
assert route['cwd']==str(Q) and route['environment']=={'GIT_OPTIONAL_LOCKS':'0','PYTHONDONTWRITEBYTECODE':'1'}
lane=Path(argv[3]).parent;out=S/'1370-c0-a208-cleanup-diagnostic-actual-python-output-after-ak-20261009-r1'
assert lane==S/'1370-c0-a208-cleanup-diagnostic-actual-python-lane-after-ak-20261009-r1' and not os.path.lexists(lane) and not os.path.lexists(out) and not os.path.lexists(c['pythonFixture'])
assert route['expected']['pythonMethods']==14 and route['expected']['noChildReportValidationMethods']==3 and route['expected']['pythonDirectSetsidGroups']==7 and route['expected']['sandboxProbesInOwnedDriverGroup']==4
P.mkdir(mode=0o700,exist_ok=True);assert P.resolve(strict=True)==P and P.is_dir()
grant={'schema':'1370-a208-current-ak-diagnostic-root-grant-v1','status':'GRANTED_ONE_EXACT_A208_PYTHON_CLEANUP_DIAGNOSTIC_ARM','utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'rootPidBecomesHelperPid':os.getpid(),'sourcePins':pins,'config':role(Q/'CONFIG.json'),'recorder':role(Q/'record.py'),'route':role(Q/'ROUTE.json'),'wrapper':role(Path(__file__)),'filledRouteReview':fr,'wrapperReview':wr,'actualFocusedAdoption':fa,'focusedIndependentReview':fi,'historicalM0Completion':done_role,'currentAkReadback':pub_role,'reusedJsObservedReview':jr,'jsReuseProof':role(Q/'JS-REUSE-PROOF.json'),'argv':argv,'cwd':route['cwd'],'environment':route['environment'],'bounds':route['bounds'],'expected':route['expected'],'productionHead':HEAD,'sourceTree':SRC,'freeBytes':free,'acPower':True,'priorOwnedPidsAndPgidsFreshlyAbsent':owned,'globalWorkerAbsenceClaim':False,'unexpectedHelperWaitIsStop':True,'noAutomaticRetry':True,'gamePricingOrRenewalAttributionAuthorized':False}
gp=P/'PYTHON-GRANT.json';fd=os.open(gp,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
with os.fdopen(fd,'w') as stream:json.dump(grant,stream,sort_keys=True,indent=2);stream.write('\n');stream.flush();os.fsync(stream.fileno())
lane.mkdir(mode=0o700);print(json.dumps({'grant':role(gp),'rootPidBecomesHelperPid':os.getpid()}),flush=True)
os.chdir(route['cwd']);os.execve(argv[0],argv,dict(os.environ,**route['environment']))
