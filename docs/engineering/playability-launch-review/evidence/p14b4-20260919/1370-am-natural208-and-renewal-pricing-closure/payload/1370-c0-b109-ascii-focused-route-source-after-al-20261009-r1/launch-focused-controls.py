"""Held after-AL launch: external reviewed route plus separately recorded root grant.
No grant is created by this wrapper. Never invoke during source preparation."""
import hashlib, json, os, shutil, stat, subprocess, sys
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch')
R=Path('/Users/zacheryspector/The-Movies-headless-program')
P=Path(__file__).resolve().parent
def require(ok,message):
 if not ok:raise RuntimeError('STOP_'+message)
def metadata(st):return (st.st_dev,st.st_ino,st.st_size,st.st_mtime_ns,st.st_ctime_ns,st.st_mode,st.st_nlink)
def role(path):
 p=Path(path);require(p.resolve(strict=True)==p and not p.is_symlink(),'PHYSICAL_SOURCE');before=p.lstat();require(stat.S_ISREG(before.st_mode) and before.st_nlink==1,'REGULAR_SOURCE')
 fd=os.open(p,os.O_RDONLY|os.O_NOFOLLOW)
 try:
  require(metadata(os.fstat(fd))==metadata(before),'SOURCE_OPEN_RACE');h=hashlib.sha256();size=0
  while True:
   block=os.read(fd,1024**2)
   if not block:break
   h.update(block);size+=len(block)
  require(metadata(os.fstat(fd))==metadata(before)==metadata(p.lstat()),'SOURCE_READ_RACE')
 finally:os.close(fd)
 return {'path':str(p),'bytes':size,'sha256':h.hexdigest()}
def authenticate(wanted):
 require(type(wanted) is dict and set(wanted)=={'path','bytes','sha256'} and type(wanted['path']) is str and type(wanted['bytes']) is int and type(wanted['sha256']) is str,'ROLE_SCHEMA')
 require(role(wanted['path'])==wanted,'ROLE_HASH')
 return Path(wanted['path'])
def git(*args):return subprocess.check_output(['/usr/bin/git','-c','gc.auto=0','-c','maintenance.auto=0','--no-optional-locks',*args],cwd=R,text=True).strip()
require(sys.dont_write_bytecode and not sys.flags.optimize and len(sys.argv)==3,'EXACT_PYTHON_B_GRANT_ARGS')
gp=Path(sys.argv[1]);require(gp.parent==S/'1370-c0-b109-ascii-focused-controls-parent-recorded-after-al-20261009-r1' and gp.name=='GRANT.json','ROOT_GRANT_LOCATION')
grant_role=role(gp);require(grant_role['sha256']==sys.argv[2],'ROOT_GRANT_HASH')
g=json.loads(gp.read_bytes())
require(g['schema']=='1370-root-b109-ascii-focused-controls-grant/v1' and g['status']=='GRANT_EXACT_B109_ASCII_FOCUSED_CONTROLS_ONCE' and g['executionAuthorization'] is True,'EXTERNAL_ROOT_GRANT')
require(g['scope']=='PURE_FOCUSED_CONTROLS_ONLY' and g['game'] is False and g['benchmark'] is False and g['full109'] is False,'ROOT_SCOPE')
sourcepins_path=authenticate(g['routeSourcePins']);require(sourcepins_path==P/'SOURCE-PINS.json','ROUTE_PINS_PATH')
sourcepins=json.loads(sourcepins_path.read_bytes())
for expected_role in sourcepins['files'].values():authenticate(expected_role)
require(sourcepins['files']['launch-focused-controls.py']==role(Path(__file__).resolve()),'SELF_ROLE')
recipe=json.loads((P/'CONTROL-RECIPE.json').read_bytes());c=json.loads((P/'CONFIG.json').read_bytes())
review_path=authenticate(g['routeSourceReview']);review=json.loads(review_path.read_bytes())
require(review['decision']==recipe['sourceReviewDecisionRequired'] and review['routeSourcePins']==g['routeSourcePins'] and review['executionAuthorization'] is False,'EXACT_ROUTE_SOURCE_REVIEW')
protection_path=authenticate(g['currentProtection']);protection=json.loads(protection_path.read_bytes())
require(g['currentProtection']==c['roles']['currentProtection'],'EXACT_CURRENT_PROTECTION_ROLE')
for key,wanted in c['currentProtectionContract'].items():require(type(protection[key]) is type(wanted) and protection[key]==wanted,'ROOT_CURRENT_PROTECTION_'+key.upper())
from strict_contract import exact
for key in ('argv','cwd','bounds','expected','operational'):require(exact(g[key],recipe[key]),'ROOT_BINDING_'+key.upper())
require(g['environment']==recipe['requiredEnvironment'],'ROOT_ENVIRONMENT')
for expected_role in c['roles'].values():authenticate(expected_role)
node={'path':c['nodePath'],'bytes':c['nodeBytes'],'sha256':c['nodeSha256']};authenticate(node);require(os.access(c['nodePath'],os.X_OK),'NODE_EXECUTABLE')
authenticate(recipe['helper']);authenticate(recipe['python'])
ops=c['operational'];require(git('rev-parse','HEAD')==ops['head'] and git('rev-parse','HEAD:src')==ops['sourceTree'],'CURRENT_AL_SOURCE')
require(git('branch','--show-current')==ops['branch'] and git('rev-parse','refs/remotes/origin/'+ops['branch'])==ops['trackingWorkingHead'],'CURRENT_WORKING_REFS')
require(not git('status','--porcelain=v1','--untracked-files=all'),'CLEAN_WORKTREE')
require(git('ls-remote','origin','refs/heads/'+ops['branch'],'refs/heads/main')==ops['main']+'\trefs/heads/main\n'+ops['head']+'\trefs/heads/'+ops['branch'],'EXACT_ADVERTISED_REFS')
require(not os.path.lexists(S/'HEAVY-LANE-LOCK'),'FREE_LANE')
free=shutil.disk_usage(S).free;require(free>=3.5*1024**3,'DISK_HEADROOM')
require('AC Power' in subprocess.check_output(['/usr/bin/pmset','-g','batt'],text=True),'AC_POWER')
require(not os.path.lexists(recipe['outputPath']) and not os.path.lexists(recipe['parentCreatesPrivateFreshLaneDirectory']),'FRESH_OUTPUT_AND_LANE')
require(S.resolve(strict=True)==S and gp.parent.resolve(strict=True)==gp.parent,'PHYSICAL_SCRATCH')
claim=gp.parent/'LAUNCH-CLAIM.json';fd=os.open(claim,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
with os.fdopen(fd,'w') as f:
 json.dump({'schema':'1370-b109-ascii-focused-controls-launch-claim/v1','grant':grant_role,'routeSourcePins':g['routeSourcePins'],'routeSourceReview':g['routeSourceReview'],'currentProtection':g['currentProtection'],'helperPid':os.getpid(),'helperPgid':os.getpgrp(),'argv':recipe['argv'],'cwd':recipe['cwd'],'freeBytes':free,'acPower':True,'rootPidBecomesHelperPid':True,'unexpectedHelperWaitIsStop':True},f,indent=2,sort_keys=True);f.write('\n');f.flush();os.fsync(f.fileno())
Path(recipe['parentCreatesPrivateFreshLaneDirectory']).mkdir(mode=0o700)
print(json.dumps({'launchClaim':role(claim),'helperPid':os.getpid()}),flush=True)
os.chdir(R);os.execvpe(recipe['argv'][0],recipe['argv'],dict(os.environ,**recipe['requiredEnvironment']))
