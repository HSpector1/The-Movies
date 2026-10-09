import datetime
import hashlib
import json
import os
from pathlib import Path
import shutil
import stat
import subprocess
import sys

S = Path('/Users/zacheryspector/studio-scratch')
R = Path('/Users/zacheryspector/The-Movies-headless-program')
P = Path(__file__).parent
def sha(p):
    return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def role(p):
    p = Path(p)
    assert p.is_file() and not p.is_symlink()
    return {'path':str(p), 'bytes':p.stat().st_size, 'sha256':sha(p)}
def git(*args):
    return subprocess.check_output(['/usr/bin/git','-c','gc.auto=0','-c','maintenance.auto=0','--no-optional-locks',*args],cwd=R,text=True).strip()
review = Path(sys.argv[1])
assert sha(review) == sys.argv[2]
rv = json.loads(review.read_text())
assert rv['decision'].startswith('ACCEPT') and rv.get('bindingSemanticSha256') == '4cfdbc36dae7fab7dc0687b48f3c7d84abc94b8ac0aca146273306d96bd261e4'
launch_path = P/'ADOPTED-LAUNCH-SPEC.json'
assert sha(launch_path) == 'e58ea56079b2dfc48bfb321ed9452e3ea5e373ae6a7a153768c77a9c8959ef79'
launch = json.loads(launch_path.read_text())
bp = Path(launch['bindingPath'])
assert sha(bp) == launch['bindingSha256'] == '71e2db2dbe2dabfbf9d885002a9096e0e291d0ed315b92129f8098e5ceada78e'
b = json.loads(bp.read_text())
assert b['executionAuthorization'] is True and b['status'] == 'REVIEWED_FILLED_UNRUN'
roles = [role(review),role(launch_path),role(bp),role(P/'ADOPTION.json'),role(Path(__file__))]
for k in ['exactBindingReview','preflightReview','materializer','materializerSourceReview','materializerArgvRole','parentScopeAdoption','recorder','routeSourceReview','supervisor']:
    p = Path(b[k+'Path'])
    assert sha(p) == b[k+'Sha256'], k
    roles.append(role(p))
assert sha(launch['argv'][1]) == launch['helperSha256']
roles.append(role(launch['argv'][1]))
for path, expected in b['strictRootMetadata'].items():
    st = Path(path).lstat()
    assert stat.S_ISDIR(st.st_mode) and [st.st_dev,st.st_ino,stat.S_IMODE(st.st_mode),st.st_mtime_ns,st.st_ctime_ns] == expected, path
for path, expected in b['ancestryIdentity'].items():
    st = Path(path).lstat()
    assert stat.S_ISDIR(st.st_mode) and [st.st_dev,st.st_ino,stat.S_IMODE(st.st_mode)] == expected, path
for path, expected in b['toolRoles'].items():
    st = Path(path).lstat()
    assert stat.S_ISREG(st.st_mode) and [st.st_dev,st.st_ino,stat.S_IMODE(st.st_mode),st.st_nlink] == expected['identity'], path
    assert sha(path) == expected['sha256'], path
    roles.append(role(path))
assert git('rev-parse','HEAD') == b['productionHead']
assert git('rev-parse','HEAD:src') == b['productionSourceTree']
assert not git('status','--porcelain=v1','--untracked-files=all')
assert git('ls-remote','origin','refs/heads/wip/headless-program-20260916-ts') == b['productionHead']+'\trefs/heads/wip/headless-program-20260916-ts'
assert subprocess.check_output(['/usr/sbin/sysctl','-n','kern.bootsessionuuid'],text=True).strip() == b['bootSessionUuid']
assert 'AC Power' in subprocess.check_output(['/usr/bin/pmset','-g','batt'],text=True)
free = shutil.disk_usage(S).free
assert free >= b['bounds']['preflightFreeBytes']
fresh = [S/'HEAVY-LANE-LOCK',Path(b['outputRoot']),Path(b['scratchRoot']),Path(b['recorderLockPath']),Path(launch['argv'][3]).parent]
assert all(not os.path.lexists(p) for p in fresh)
cleared = []
for group in [96706,98020]:
    try:
        os.killpg(group,0)
    except ProcessLookupError:
        cleared.append(group)
    else:
        raise RuntimeError('prior owned group still present: '+str(group))
grant = {'schema':'m0-root-exact-materialization-grant/v1','status':'GRANTED_ONE_EXACT_RECORDED_M0_SOURCE_MATERIALIZATION_ONLY','utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'rootPidBecomesHelperPid':os.getpid(),'reviewDecision':rv['decision'],'adoptedPreflight':role(review),'bindingSemanticSha256':launch['bindingSemanticSha256'],'guardCoreSha256':launch['guardCoreSha256'],'roles':roles,'argv':launch['argv'],'cwd':launch['cwd'],'environment':launch['environment'],'bounds':b['bounds'],'currentStrictRootsAndAncestryExact':True,'currentToolIdentitiesAndHashesExact':True,'productionHead':b['productionHead'],'productionSourceTree':b['productionSourceTree'],'productionCleanAndLiveWorkingRefExact':True,'acPower':True,'freeBytes':free,'priorOwnedGroupsFreshlyAbsent':cleared,'runtimePathsFreshlyAbsent':[str(p) for p in fresh],'protectedFreezeMaintainedSinceFullGuard28679':True,'unexpectedHelperWaitIsStop':True,'gameTypesCollectionWiringNeutralityAuthorized':False,'fullPostflightRequired':True}
fd = os.open(P/'GRANT.json',os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
with os.fdopen(fd,'w') as f:
    json.dump(grant,f,indent=2,sort_keys=True)
    f.write('\n')
    f.flush()
    os.fsync(f.fileno())
Path(launch['argv'][3]).parent.mkdir(mode=0o700)
print(json.dumps({'grant':role(P/'GRANT.json'),'rootPidBecomesHelperPid':os.getpid(),'argv':launch['argv']}),flush=True)
os.chdir(R)
os.execvpe(launch['argv'][0],launch['argv'],dict(os.environ,**launch['environment']))
