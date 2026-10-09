"""UNRUN tiny owned fixture policy controls. Parent review/lane grant required.
External Python orchestrates only; sandbox children are /bin/sh and /usr/bin/git
or explicit mv/rm/chmod negatives. Never import Node/witness/game/protected repo.
"""
import datetime,hashlib,json,os,pathlib,signal,stat,subprocess,sys,time
S=pathlib.Path('/Users/zacheryspector/studio-scratch');HERE=pathlib.Path(__file__).resolve().parent
OLD=S/'1370-c0-aging-era-employment-witness-source-r8-diagnostic-proposal-20261008-r1/POLICY.sb'
NEW=S/'1370-c0-aging-era-employment-witness-source-r9-devnull-proposal-20261008-r1/POLICY.sb'
OUTPUT=S/'1370-c0-aging-era-employment-witness-r9-devnull-controls-output-20261008-r1'
OLD_BYTES=b'(version 1)\n(allow default)\n(deny file-write*)\n'
NEW_BYTES=OLD_BYTES+b'(allow file-write-data (literal "/dev/null"))\n'
WHOLE_SECONDS=120;CHILD_SECONDS=5;STDOUT_CAP=65536;STDERR_CAP=65536
def require(v,m):
 if not v:raise RuntimeError('STOP: '+m)
def sha(b):return hashlib.sha256(b).hexdigest()
def write(path,b):
 fd=os.open(path,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
 with os.fdopen(fd,'wb') as f:os.fchmod(f.fileno(),0o600);f.write(b);f.flush();os.fsync(f.fileno())
def group_alive(pgid):
 try:os.killpg(pgid,0);return True
 except ProcessLookupError:return False
 except PermissionError:return True
def null_identity():
 p=pathlib.Path('/dev/null');a=p.lstat()
 require(p.resolve(strict=True)==p and stat.S_ISCHR(a.st_mode) and a.st_uid==a.st_gid==0 and a.st_nlink==1 and stat.S_IMODE(a.st_mode)==0o666 and a.st_rdev==50331650,'fresh root-owned physical character /dev/null')
 return {'path':str(p),'device':a.st_dev,'inode':a.st_ino,'uid':a.st_uid,'gid':a.st_gid,'mode':'0666','rdev':a.st_rdev,'links':a.st_nlink,'type':'character'}
def tree(root):
 rows={}
 for p in sorted(root.rglob('*')):
  st=p.lstat();rel=str(p.relative_to(root));require(not p.is_symlink(),'fixture symlink')
  rows[rel]={'mode':stat.S_IMODE(st.st_mode),'inode':st.st_ino,'device':st.st_dev,'links':st.st_nlink,'mtimeNs':st.st_mtime_ns,'ctimeNs':st.st_ctime_ns,'type':'directory' if p.is_dir() else 'regular'}
  if p.is_file():rows[rel].update(bytes=st.st_size,sha256=sha(p.read_bytes()))
 return rows
def main():
 require(sys.dont_write_bytecode and not sys.flags.optimize,'Python -B required')
 require(len(sys.argv)==1,'no arbitrary output or policy paths accepted')
 configraw=(HERE/'CONTROLS-CONFIG.json').read_bytes();config=json.loads(configraw)
 for role in config['roles'].values():
  p=pathlib.Path(role['path']);require(p.resolve(strict=True)==p and p.is_file() and not p.is_symlink() and sha(p.read_bytes())==role['sha256'],'pinned control tool/source')
 require(OLD.read_bytes()==OLD_BYTES and NEW.read_bytes()==NEW_BYTES,'exact old/new policy bytes')
 require(OUTPUT.parent==S and OUTPUT.resolve()==OUTPUT and not os.path.lexists(OUTPUT),'one-shot owned output')
 for blocked in config['protectedRoots']:require(not str(OUTPUT).startswith(blocked+'/') and OUTPUT!=pathlib.Path(blocked),'fixture outside protected roots')
 started=time.monotonic();end=started+WHOLE_SECONDS;OUTPUT.mkdir(mode=0o700)
 repo=OUTPUT/'tiny-repo';repo.mkdir(mode=0o700);hooks=OUTPUT/'empty-hooks';hooks.mkdir(mode=0o700);records=[]
 # Match the real witness supervisor's GIT_* and NODE_OPTIONS stripping.
 env={k:v for k,v in os.environ.items() if not k.startswith(('GIT_','NODE_OPTIONS'))}
 def run(label,argv):
  require(time.monotonic()<end,'whole control deadline before spawn');null_identity()
  p=subprocess.Popen(argv,cwd=repo,env=env,stdin=subprocess.DEVNULL,stdout=subprocess.PIPE,stderr=subprocess.PIPE,start_new_session=True,close_fds=True)
  timed_out=False
  try:
   try:out,err=p.communicate(timeout=min(CHILD_SECONDS,max(0,end-time.monotonic())))
   except subprocess.TimeoutExpired:
    timed_out=True
    for sig in (signal.SIGTERM,signal.SIGKILL):
     try:os.killpg(p.pid,sig)
     except ProcessLookupError:pass
     try:out,err=p.communicate(timeout=min(1,max(0,end-time.monotonic())));break
     except subprocess.TimeoutExpired:continue
    else:raise RuntimeError('STOP: control child survivor')
   require(p.returncode is not None and not group_alive(p.pid),'control group clearance')
   require(not timed_out and len(out)<=STDOUT_CAP and len(err)<=STDERR_CAP,'control timeout/output cap')
   write(OUTPUT/(label+'.stdout'),out);write(OUTPUT/(label+'.stderr'),err)
   records.append({'label':label,'argv':argv,'exit':p.returncode,'pid':p.pid,'ownedPgid':p.pid,'groupClear':True,'stdoutBytes':len(out),'stdoutSha256':sha(out),'stderrBytes':len(err),'stderrSha256':sha(err),'nullDevice':null_identity()})
   return p.returncode,out,err
  finally:
   if p.poll() is None or group_alive(p.pid):
    try:os.killpg(p.pid,signal.SIGKILL)
    except ProcessLookupError:pass
    p.communicate(timeout=1)
 def setup(label,args):
  code,out,err=run(label,['/usr/bin/git','-c','gc.auto=0','-c','maintenance.auto=0','-c','core.hooksPath='+str(hooks),*args]);require(code==0 and not err,'unsandboxed owned fixture setup '+label);return out
 setup('setup-init',['init','--quiet','--initial-branch=devnull-control'])
 marker=repo/'marker.txt';write(marker,b'tiny owned devnull fixture\n')
 setup('setup-add',['add','--','marker.txt'])
 setup('setup-commit',['-c','user.name=Devnull synthetic control','-c','user.email=devnull-control@invalid','-c','commit.gpgsign=false','commit','--quiet','-m','tiny owned policy fixture'])
 head=setup('setup-head',['rev-parse','HEAD']);blob=setup('setup-blob',['rev-parse','HEAD:marker.txt']);baseline=tree(repo)
 def sandbox(policy,code,args=()):return ['/usr/bin/sandbox-exec','-f',str(policy),'/bin/sh','-c',code,'policy-control',*args]
 git_script='exec /usr/bin/git "$@"'
 code,out,err=run('old-git-revparse',sandbox(OLD,git_script,['rev-parse','HEAD']))
 require(code!=0 and b'/dev/null' in err and b'Operation not permitted' in err,'old policy RED precise /dev/null Git refusal')
 code,out,err=run('old-null-rdwr',sandbox(OLD,'exec 3<>/dev/null; printf "NULL_RDWR_OK\\n"; printf discard >&3'))
 require(code!=0 and b'/dev/null' in err,'old policy RED /dev/null RDWR refusal')
 for label,args,expected in [('new-git-head',['rev-parse','HEAD'],head),('new-git-head-file',['rev-parse','HEAD:marker.txt'],blob),('new-git-status',['status','--porcelain=v1','--untracked-files=all'],b''),('new-git-cat-file',['cat-file','blob',blob.decode().strip()],marker.read_bytes())]:
  code,out,err=run(label,sandbox(NEW,git_script,args));require(code==0 and out==expected and not err,'new policy GREEN exact witness Git shape '+label);require(tree(repo)==baseline,'readonly fixture byte/metadata/inode drift '+label)
 code,out,err=run('new-null-rdwr',sandbox(NEW,'exec 3<>/dev/null; printf "NULL_RDWR_OK\\n"; printf discard >&3'));require(code==0 and out==b'NULL_RDWR_OK\n' and not err,'new policy only /dev/null data sink')
 negative=[('overwrite','printf CORRUPT > "$1"',[str(marker)]),('create','printf CREATED > "$1"',[str(repo/'new-file')]),('rename','exec /bin/mv "$1" "$2"',[str(marker),str(repo/'renamed')]),('unlink','exec /bin/rm "$1"',[str(marker)]),('chmod','exec /bin/chmod 0777 "$1"',[str(marker)])]
 for label,script,args in negative:
  code,out,err=run('new-deny-'+label,sandbox(NEW,script,args));require(code!=0 and err,'regular write/metadata must refuse '+label);require(tree(repo)==baseline,'regular write/metadata changed fixture '+label)
 require(time.monotonic()<end,'whole control deadline');require(OLD.read_bytes()==OLD_BYTES and NEW.read_bytes()==NEW_BYTES,'source policy bytes unchanged')
 for role in config['sourceProofRoles']:
  require(sha(pathlib.Path(role['path']).read_bytes())==role['sha256'],'source proof unchanged')
 result={'schema':'1370-witness-r9-devnull-tiny-policy-controls-r1','status':'POLICY_CONTROLS_PASSED_SOURCE_ONLY','records':records,'fixtureRoot':str(repo),'fixtureUnchanged':tree(repo)==baseline,'fixtureCanonicalSha256':sha(json.dumps(baseline,sort_keys=True,separators=(',',':')).encode()),'childEnvironmentGitNames':sorted(k for k in env if k.startswith('GIT_')),'wholeElapsedSeconds':time.monotonic()-started,'wholeCeilingSeconds':WHOLE_SECONDS,'sourcePoliciesUnchanged':True,'sourceProofRolesUnchanged':True,'gameRun':False,'pythonUnderSandbox':False,'executionAuthorization':False,'utc':datetime.datetime.now(datetime.timezone.utc).isoformat()}
 write(OUTPUT/'RESULT.json',(json.dumps(result,sort_keys=True,indent=2)+'\n').encode());print(json.dumps({'status':result['status'],'output':str(OUTPUT),'resultSha256':sha((OUTPUT/'RESULT.json').read_bytes()),'records':len(records)}))
if __name__=='__main__':main()
