"""Root one-shot pure-control grant; requires independent exact source receipt."""
import datetime,hashlib,json,os,shutil,stat,subprocess,sys
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');R=Path('/Users/zacheryspector/The-Movies-headless-program')
Q=Path(__file__).parent
P=S/'1370-c0-a208-cleanup-pure-red-green-parent-after-ak-20261009-r1'
HEAD='372d15e1ae53b898be2cf633a6bb8bb0058cb01f'
def role(p):
 p=Path(p);st=p.lstat();assert p.resolve(strict=True)==p and stat.S_ISREG(st.st_mode) and st.st_nlink==1 and st.st_size<128*1024**2
 b=p.read_bytes();assert p.lstat()==st
 return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def git(*a):return subprocess.check_output(['/usr/bin/git','-c','gc.auto=0','-c','maintenance.auto=0','--no-optional-locks',*a],cwd=R,text=True,timeout=30).strip()
assert sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize and len(sys.argv)==3
review=Path(sys.argv[1]);assert role(review)['sha256']==sys.argv[2];rv=json.loads(review.read_text())
assert rv['decision']=='ACCEPT_SOURCE_ONLY_PURE_CLEANUP_FILLED_ROUTE_AND_WRAPPER' and rv['wrapper']==role(Path(__file__))
pins=role(Q/'SOURCE-PINS.json');assert rv['sourcePinsSha256']==pins['sha256']
for name,item in json.loads((Q/'SOURCE-PINS.json').read_text())['files'].items():assert role(Q/name)==item
c=json.loads((Q/'CONFIG.json').read_text());route=json.loads((Q/'ROUTE.json').read_text())
for item in [*c['roles'].values(),c['candidateModule'],c['tester']]:assert role(item['path'])==item
assert c['status']=='REVIEWED_FILLED_UNRUN' and c['executionAuthorization'] is False
assert git('rev-parse','HEAD')==HEAD and git('rev-parse','HEAD:src')=='13880d9b0ba72aff5d4c5bcf5d12fe682c5de554' and not git('status','--porcelain=v1','--untracked-files=all')
assert git('ls-remote','origin','refs/heads/wip/headless-program-20260916-ts')==HEAD+'\trefs/heads/wip/headless-program-20260916-ts'
assert not os.path.lexists(S/'HEAVY-LANE-LOCK') and shutil.disk_usage(S).free>=3758096384
assert 'AC Power' in subprocess.check_output(['/usr/bin/pmset','-g','batt'],text=True,timeout=10)
for path in [P,*map(Path,route['absentPathsAtFutureGrant'])]:assert not os.path.lexists(path)
expected=['/bin/bash',c['roles']['helper']['path'],'0',str(S/'1370-c0-a208-cleanup-pure-red-green-lane-after-ak-20261009-r1/controls.log'),c['pythonPath'],'-I','-B',str(Q/'record.py'),'pure']
assert route['argv']==expected and route['cwd']==str(Q)
P.mkdir(mode=0o700);Path(expected[3]).parent.mkdir(mode=0o700)
grant={'status':'ROOT_ONCE_ONLY_PURE_CLEANUP_CONTROLS_GRANTED','sourcePins':pins,'independentReview':role(review),'argv':expected,'cwd':str(Q),'bounds':c['bounds'],'game':False,'diagnosticActual17MethodRetry':False,'utc':datetime.datetime.now(datetime.timezone.utc).isoformat()}
(P/'GRANT.json').write_text(json.dumps(grant,sort_keys=True,indent=2)+'\n')
env=dict(os.environ,GIT_OPTIONAL_LOCKS='0',PYTHONDONTWRITEBYTECODE='1');env.pop('NODE_OPTIONS',None);env.pop('NODE_PATH',None)
child=subprocess.Popen(expected,cwd=Q,env=env)
(P/'HELPER-PID.json').write_text(json.dumps({'pid':child.pid})+'\n');print(json.dumps({'helperPid':child.pid,'grant':str(P/'GRANT.json')}),flush=True)
code=child.wait();print(json.dumps({'helperExit':code}),flush=True)
raise SystemExit(code)
