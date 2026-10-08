#!/usr/bin/env python3
"""UNRUN independent H r11 observed audit. Requires a reviewed filled binding."""
import hashlib,json,math,os,pathlib,runpy,shutil,signal,stat,subprocess,sys,time

S=pathlib.Path('/Users/zacheryspector/studio-scratch')
REPO=pathlib.Path('/Users/zacheryspector/The-Movies-headless-program')
HERE=S/'1370-c0-h-typecheck-r11-independent-observed-audit-proposal-r1'
MIRROR=S/'1370-c0-h-m0-observer-mirrors-r2/20261008-h-types-r1'
RUN=S/'1370-c0-h-typecheck-collection-results-r11/20261008-h-types-r9'
LANE=S/'c0-h-types-20261008-h-types-r9.lane.log'
RECORDER=S/'1370-c0-h-typecheck-collection-recorder-results-r3/20261008-h-types-r9.RECORDER-RESULT.json'
DEEP_SOURCE=S/'1370-c0-h-bridge-full-readback-runner-proposal-r6/readback.py'
DEEP_SPEC=S/'1370-c0-h-bridge-full-readback-runner-proposal-r6/SPEC.json'
DEEP_SOURCE_SHA='6d2c51bc6a802e7e19e41849d27569e35bcfcee31dfc12480c0f6a22998314d1'
DEEP_SPEC_SHA='24952774515fd0e36eb2d2895e3e1d6996371c93617995612e3db5c75ac3a5d5'
SOURCE_SHA='83f4b7b07f68f8424824a6369a5e9425d423c0a6d10ef3581931a689c2c727e3'
STATIC_SHA='5893c1dea2d14162cc6d666de0258ee8ebea7328f516aedc4cbcccc987acb5c1'
RECORDER_STATIC_SHA='14ac6279df85de332262d54e69726d185cdd4fe7806944d709350553998bbb6a'
SOURCE_BINDING_SHA='1f93093fa31c502d3abf5724ffc4c27e93d4aa0100ba1944ff06db322b93cc27'
PLAN_SHA='b0a0f154d648ae5448407a5360507eaad11b720e404455425870cd29e4329949'
BASELINE_SHA='b0b58d06f21e81bfb6357e2295708e5fc11b5a2248f1c1cd5babf331689e8de3'
READBACK_SHA='35ca2012f0a6122cd88f509cc6f484c1ec489a08d8752d500877095293ca328a'
PROOF='1534ca888a99c1f41e3eb2a7201d6d6d56f1343bab3f4040518348cc34d276b4'
HEAD='afea5fb6abba09bec6cada7e4c5a1ccfaf05caff'
SRC='13880d9b0ba72aff5d4c5bcf5d12fe682c5de554'
EVIDENCE='6516532ac67ffcafc66fd424abb89bc1bc0acc2e'
NODE='/Users/zacheryspector/.nvm/versions/node/v22.23.2/bin/node'
ORIGIN='https://github.com/HSpector1/The-Movies.git'
RUN_ID='20261008-h-types-r9'
START=globals().get('_BOOTSTRAP_START')
BINDING=pathlib.Path(globals().get('_BINDING_PATH',str(HERE/'BINDING-UNFILLED.json')))
OUT=pathlib.Path(globals().get('_OUTPUT_PATH',str(S/'1370-c0-h-typecheck-r11-independent-observed-audit-results-r1/AUDIT.json')))
WALL=600
FLOOR=3*1024**3
PREFLIGHT=int(3.5*1024**3)
LAST_ENV=0.0

def need(ok,why):
 if not ok:raise RuntimeError(why)
def remaining():
 need(type(START) in (int,float) and math.isfinite(START),'invalid audit start')
 elapsed=time.monotonic()-START
 need(math.isfinite(elapsed) and 0<=elapsed<WALL,'audit whole deadline')
 return WALL-elapsed
remaining()
def fields(st):return st.st_dev,st.st_ino,st.st_mode,st.st_nlink,st.st_size,st.st_mtime_ns,st.st_ctime_ns
def dirs(path,include_leaf=False):
 path=pathlib.Path(path);need(path.is_absolute(),'relative audit path')
 names=path.parts[1:] if include_leaf else path.parts[1:-1]
 held=[os.open('/',os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW)]
 try:
  for name in names:
   need(name not in ('','.','..'),'unsafe audit path')
   before=os.stat(name,dir_fd=held[-1],follow_symlinks=False)
   fd=os.open(name,os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW,dir_fd=held[-1])
   need(stat.S_ISDIR(before.st_mode) and fields(before)==fields(os.fstat(fd)),'audit parent drift')
   held.append(fd)
  return held
 except BaseException:
  for fd in reversed(held):os.close(fd)
  raise
def close(held):
 for fd in reversed(held):os.close(fd)
def verify(held,path,include_leaf=False):
 names=pathlib.Path(path).parts[1:] if include_leaf else pathlib.Path(path).parts[1:-1]
 for parent,child,name in zip(held,held[1:],names):
  a=os.fstat(child);b=os.stat(name,dir_fd=parent,follow_symlinks=False)
  need((a.st_dev,a.st_ino,a.st_mode)==(b.st_dev,b.st_ino,b.st_mode),'audit parent pathname drift')
def read(path,cap,pin=None):
 path=pathlib.Path(path);held=dirs(path)
 try:
  parent=held[-1];before=os.stat(path.name,dir_fd=parent,follow_symlinks=False)
  need(stat.S_ISREG(before.st_mode) and before.st_nlink==1 and before.st_size<=cap,'audit input cap/regular')
  fd=os.open(path.name,os.O_RDONLY|os.O_NOFOLLOW,dir_fd=parent)
  try:
   need(fields(before)==fields(os.fstat(fd)),'audit input open drift')
   chunks=[];size=0;sha=hashlib.sha256()
   while True:
    guard()
    part=os.read(fd,1<<20)
    if not part:break
    size+=len(part);need(size<=cap and size<=before.st_size,'audit input growth')
    sha.update(part);chunks.append(part)
   need(size==before.st_size and fields(before)==fields(os.fstat(fd))==fields(os.stat(path.name,dir_fd=parent,follow_symlinks=False)),'audit input changed')
  finally:os.close(fd)
  verify(held,path)
  digest=sha.hexdigest()
  if pin is not None:need(digest==pin,'audit input SHA '+str(path))
  return b''.join(chunks),digest
 finally:close(held)
def run_command(*args):
 env={k:v for k,v in os.environ.items() if not k.startswith('GIT_')}
 proc=subprocess.run(args,cwd=REPO,env=env,capture_output=True,timeout=min(15,remaining()))
 need(proc.returncode==0 and len(proc.stdout)<=2*1024**2 and len(proc.stderr)<=2*1024**2,'audit guard command')
 return proc.stdout.strip().decode()
def guard(preflight=False,force=False):
 global LAST_ENV
 remaining();need(shutil.disk_usage(S).free>=(PREFLIGHT if preflight else FLOOR),'audit disk floor')
 now=time.monotonic()
 if preflight or force or now-LAST_ENV>=5:
  raw=subprocess.run(['pmset','-g','batt'],capture_output=True,timeout=min(10,remaining()))
  need(raw.returncode==0 and raw.stdout.splitlines()[:1]==[b"Now drawing from 'AC Power'"],'audit AC')
  need(not os.path.lexists(S/'HEAVY-LANE-LOCK') or b'h-typecheck-r11-observed-audit' in read(S/'HEAVY-LANE-LOCK',10000)[0],'audit lane owner')
  LAST_ENV=now
def source_guard():
 need(run_command('git','rev-parse','HEAD')==HEAD and run_command('git','rev-parse','HEAD:src')==SRC and
      run_command('git','status','--porcelain=v1')=='','audit production identity')
 need(run_command('git','remote','get-url','origin')==ORIGIN and run_command('git','config','--get','remote.origin.url')==ORIGIN,'audit origin')
 for ref,oid in [('refs/heads/wip/headless-program-20260916-ts',HEAD),('refs/heads/evidence/1370-r10-clean-captures',EVIDENCE)]:
  need(run_command('git','rev-parse',ref)==oid and run_command('git','ls-remote','origin',ref)==oid+'\t'+ref,'audit local/remote ref')

def stop_reason(recorder,runner,meta):
 failures=[]
 if not meta or not meta[-1].startswith(b'end, exit 0; '):failures.append('recorded child nonzero/missing')
 if not recorder or recorder.get('childExit')!=0 or recorder.get('groupClear') is not True or recorder.get('status')!='CHILD_EXIT_ZERO_PENDING_OBSERVED_REVIEW':failures.append('recorder child/status/group')
 if not runner or runner.get('status')!='PASS_FULL_ERA_TYPES_AND_DIAGNOSTIC_COLLECTION_ONLY':failures.append('runner status/missing result')
 return failures

def write_receipt(payload):
 raw=(json.dumps(payload,sort_keys=True,indent=2)+'\n').encode();need(len(raw)<=128*1024,'audit output cap')
 need(OUT.is_absolute() and OUT.is_relative_to(S) and not os.path.lexists(OUT),'audit output collision')
 OUT.parent.mkdir(mode=0o700,parents=True,exist_ok=True)
 held=dirs(OUT)
 try:
  parent=held[-1];need(not os.path.lexists(OUT),'audit output collision')
  fd=os.open(OUT.name,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600,dir_fd=parent)
  try:
   view=memoryview(raw)
   while view:remaining();view=view[os.write(fd,view):]
   os.fsync(fd)
  finally:os.close(fd)
  os.fsync(parent);verify(held,OUT)
 finally:close(held)
 got,digest=read(OUT,128*1024);need(got==raw,'audit output readback')
 return digest
