"""UNRUN bounded pure Node controls/benchmark recorder; no game or Save imports.
Parent grants sole lane separately. Exact one argument: controls or benchmark.
"""
import datetime,hashlib,json,os,pathlib,selectors,signal,stat,subprocess,sys,time
HERE=pathlib.Path(__file__).resolve().parent;SCRATCH=pathlib.Path('/Users/zacheryspector/studio-scratch')
CONFIG_SHA='7210e58edf7c1623541d940d7c552bacc1a0e0cf9fd869530f1ce72a0752e16e';CAP=1024**2;CHILD=60;ACTIVE=75;WHOLE=90
OUTPUTS={mode:SCRATCH/('1370-c0-b109-encoder-'+mode+'-output-20261009-r1') for mode in ('controls','benchmark')}
def require(v,m):
 if not v:raise RuntimeError('STOP_'+m)
def sha(b):return hashlib.sha256(b).hexdigest()
def write(p,b):
 require(len(b)<=CAP,'OUTPUT_CAP');fd=os.open(p,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
 with os.fdopen(fd,'wb') as f:os.fchmod(f.fileno(),0o600);f.write(b);f.flush();os.fsync(f.fileno())
def metadata(st):return (st.st_dev,st.st_ino,st.st_size,st.st_mtime_ns,st.st_ctime_ns,st.st_mode,st.st_nlink)
def authenticate(path,expected,cap=None):
 p=pathlib.Path(path);require(p.resolve(strict=True)==p and not p.is_symlink(),'PHYSICAL_SOURCE');before=p.lstat();require(stat.S_ISREG(before.st_mode) and before.st_nlink==1,'REGULAR_SOURCE')
 if cap is not None:require(before.st_size<=cap,'SOURCE_CAP')
 fd=os.open(p,os.O_RDONLY|os.O_NOFOLLOW)
 try:
  require(metadata(os.fstat(fd))==metadata(before),'SOURCE_OPEN_RACE');h=hashlib.sha256()
  while True:
   b=os.read(fd,1024**2)
   if not b:break
   h.update(b)
  require(h.hexdigest()==expected,'SOURCE_HASH');require(metadata(os.fstat(fd))==metadata(before)==metadata(p.lstat()),'SOURCE_READ_RACE')
 finally:os.close(fd)
def alive(pgid):
 try:os.killpg(pgid,0);return True
 except ProcessLookupError:return False
 except PermissionError:return True
def main():
 require(sys.dont_write_bytecode and not sys.flags.optimize,'PYTHON_B_REQUIRED');require(len(sys.argv)==2 and sys.argv[1] in OUTPUTS,'EXACT_MODE')
 started=time.monotonic();end=started+WHOLE;mode=sys.argv[1]
 configraw=(HERE/'CONFIG.json').read_bytes();require(sha(configraw)==CONFIG_SHA,'CONFIG_HASH');config=json.loads(configraw)
 for role in config['roles'].values():authenticate(role['path'],role['sha256'],16*1024**2)
 authenticate(config['nodePath'],config['nodeSha256']);require(os.access(config['nodePath'],os.X_OK),'NODE_EXECUTABLE');require(time.monotonic()<started+ACTIVE,'ACTIVE_PREFLIGHT_DEADLINE')
 output=OUTPUTS[mode];require(output.parent==SCRATCH and SCRATCH.resolve(strict=True)==SCRATCH and not os.path.lexists(output),'ABSENT_OWNED_OUTPUT');output.mkdir(mode=0o700)
 script=config['roles']['controls' if mode=='controls' else 'benchmark']['path'];argv=[config['nodePath'],script,CONFIG_SHA]
 child=subprocess.Popen(argv,cwd=HERE,env=dict(os.environ,PYTHONDONTWRITEBYTECODE='1'),stdin=subprocess.DEVNULL,stdout=subprocess.PIPE,stderr=subprocess.PIPE,start_new_session=True,close_fds=True)
 child_end=time.monotonic()+CHILD;sel=selectors.DefaultSelector();buffers={'stdout':bytearray(),'stderr':bytearray()};failure=None;timedout=False
 for name,pipe in [('stdout',child.stdout),('stderr',child.stderr)]:os.set_blocking(pipe.fileno(),False);sel.register(pipe,selectors.EVENT_READ,name)
 try:
  while sel.get_map() or child.poll() is None:
   if time.monotonic()>=min(child_end,started+ACTIVE):failure='STOP_CHILD_OR_ACTIVE_DEADLINE';timedout=True;break
   for key,_ in sel.select(timeout=0.05):
    b=os.read(key.fileobj.fileno(),8192)
    if not b:sel.unregister(key.fileobj);key.fileobj.close();continue
    target=buffers[key.data]
    if len(target)+len(b)>CAP:failure='STOP_'+key.data.upper()+'_CAP';break
    target.extend(b)
   if failure:break
 finally:
  if child.poll() is None or alive(child.pid):
   for sig in (signal.SIGTERM,signal.SIGKILL):
    try:os.killpg(child.pid,sig)
    except ProcessLookupError:pass
    finish=min(end,time.monotonic()+2)
    while time.monotonic()<finish and (child.poll() is None or alive(child.pid)):time.sleep(0.025)
    if child.poll() is not None and not alive(child.pid):break
  groupclear=child.poll() is not None and not alive(child.pid)
  if not groupclear:failure='STOP_OWNED_GROUP_CLEARANCE_UNKNOWN'
  if time.monotonic()>=end:failure='STOP_WHOLE_90_SECONDS'
  for key in list(sel.get_map().values()):sel.unregister(key.fileobj);key.fileobj.close()
  sel.close()
 for name,raw in buffers.items():write(output/(name+'.bin'),bytes(raw))
 last=None
 if not failure and child.returncode==0:
  try:last=json.loads(bytes(buffers['stdout']).splitlines()[-1])
  except Exception:failure='STOP_REPORT_SHAPE'
 else:failure=failure or 'STOP_CHILD_EXIT_'+str(child.returncode)
 expected='ENCODER_EQUIVALENCE_AND_REFUSALS_PASSED' if mode=='controls' else 'PURE_INDEXED308_ENCODER_BENCHMARK_COMPLETE'
 if not failure and (last.get('status')!=expected or buffers['stderr'] or (mode=='controls' and last.get('groups')!=11)):failure='STOP_REPORT_ROLE'
 result={'schema':'1370-b109-pure-encoder-recorder-r1','status':failure or 'PURE_ENCODER_'+mode.upper()+'_COMPLETE_UNADOPTED','mode':mode,'configSha256':CONFIG_SHA,'actualChildExit':child.returncode,'childPid':child.pid,'ownedPgid':child.pid,'groupClear':groupclear,'timedOut':timedout,'elapsedSeconds':time.monotonic()-started,'boundsSeconds':{'node':CHILD,'active':ACTIVE,'whole':WHOLE},'stdoutBytes':len(buffers['stdout']),'stdoutSha256':sha(bytes(buffers['stdout'])),'stderrBytes':len(buffers['stderr']),'stderrSha256':sha(bytes(buffers['stderr'])),'game':False,'sourceOrGameplayAdoption':False,'executionAuthorization':False,'utc':datetime.datetime.now(datetime.timezone.utc).isoformat()}
 write(output/'RESULT.json',(json.dumps(result,sort_keys=True,indent=2)+'\n').encode());print(json.dumps({'status':result['status'],'output':str(output),'resultSha256':sha((output/'RESULT.json').read_bytes()),'actualChildExit':child.returncode,'groupClear':groupclear}));return 2 if failure else 0
if __name__=='__main__':sys.exit(main())
