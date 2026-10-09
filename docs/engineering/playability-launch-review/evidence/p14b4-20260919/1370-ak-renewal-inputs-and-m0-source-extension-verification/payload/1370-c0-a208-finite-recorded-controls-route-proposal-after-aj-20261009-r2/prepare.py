from pathlib import Path
import hashlib,json,difflib,re
S=Path('/Users/zacheryspector/studio-scratch');P=Path(__file__).parent;Q=S/'1370-c0-aging-era-settlement208-observer-after-aj-proposal-20261009-r1';B=S/'1370-c0-initial23-source-order-pricing-verification-proposal-20261009-r1';M=S/'1370-c0-m0-additive-recorded-controls-proposal-20261009-r2'
def role(p):
 b=p.read_bytes();return dict(path=str(p),bytes=len(b),sha256=hashlib.sha256(b).hexdigest())
def put(n,x): (P/n).write_text(x if isinstance(x,str) else json.dumps(x,indent=2,sort_keys=True)+'\n')
m=json.loads((Q/'SOURCE-PINS.json').read_text());assert role(Q/'SOURCE-PINS.json')['sha256']=='3452218ceabf6bb63f690db2eff3f83edda56db71c5826982a92ae0c73085aaf'
counts={n:len(re.findall(r'^test\(', (Q/n).read_text(),re.M)) for n in ['test-synthetic.mjs','test-settlement208.mjs']}
counts.update({n:len(re.findall(r'^    def test_|^ def test_', (Q/n).read_text(),re.M)) for n in ['test-supervisor.py','test-outer.py','test-settlement208-frame.py']});assert sum(counts[n] for n in ['test-synthetic.mjs','test-settlement208.mjs'])==13;assert sum(counts[n] for n in ['test-supervisor.py','test-outer.py','test-settlement208-frame.py'])==14
# The driver is defined as source text only; imports/test execution happen only under a future grant.
driver='''import os,signal,time
START=time.monotonic();ACTIVE=45;WHOLE=55
class ControlStop(KeyboardInterrupt):pass
SLOTS=[];HISTORY=[];POPENS=[];REG=None
REAL_FORK=os.fork;REAL_WAIT=os.waitpid
MASK={signal.SIGALRM};PHASE='suite';STOP=None;ROOT=None

def cap_check():
 if ROOT is None:return
 total=0
 for parent,dirs,files in os.walk(ROOT,followlinks=False):
  for name in dirs+files:
   try:st=os.lstat(os.path.join(parent,name))
   except FileNotFoundError:continue  # Own TemporaryDirectory cleanup may remove it.
   if stat.S_ISREG(st.st_mode):total+=st.st_size
   elif not stat.S_ISDIR(st.st_mode):raise ControlStop('owned fixture special file')
 if total>8*1024**2:raise ControlStop('8 MiB owned fixture cap')

def group_alive(pid):
 try:os.killpg(pid,0);return True
 except ProcessLookupError:return False
 except PermissionError:return True

def refresh():
 for slot in SLOTS:
  if not slot['ready']:
   try:slot['ready']=os.getpgid(slot['pid'])==slot['pid']
   except ProcessLookupError:pass

def hard_kill():
 refresh()
 for slot in SLOTS:
  if slot.get('groupClear'):continue
  if slot['ready']:
   try:os.killpg(slot['pid'],signal.SIGKILL)
   except ProcessLookupError:pass
  if not slot['reaped']:
   try:os.kill(slot['pid'],signal.SIGKILL)
   except ProcessLookupError:pass
 # Popen probes explicitly inherit the externally owned runner group.
 for child in POPENS:
  if child.poll() is None:
   try:os.kill(child.pid,signal.SIGKILL)
   except ProcessLookupError:pass

def alarm(signum,frame):
 global STOP
 elapsed=time.monotonic()-START
 if elapsed>=WHOLE:hard_kill();os._exit(124)
 refresh()
 try:cap_check()
 except ControlStop as exc:STOP=STOP or str(exc);raise
 if PHASE=='suite' and elapsed>=ACTIVE:STOP=STOP or '45-second active suite cap';raise ControlStop(STOP)

def tracked_fork():
 previous=signal.pthread_sigmask(signal.SIG_BLOCK,MASK)
 slot={'pid':None,'ready':False,'reaped':False};SLOTS.append(slot)
 try:
  if time.monotonic()-START>=ACTIVE:raise ControlStop('before-fork cap')
  pid=REAL_FORK()
  if pid==0:return 0
  slot['pid']=pid
 finally:
  if slot['pid'] is None and slot in SLOTS:SLOTS.remove(slot)
  signal.pthread_sigmask(signal.SIG_SETMASK,previous)
 # Ownership is assigned before durability; no blocking file write while masked.
 os.write(REG,(json.dumps({'event':'ownedFork','pid':pid})+'\\n').encode());os.fsync(REG)
 return pid

def tracked_wait(pid,flags):
 if flags not in (0,os.WNOHANG):raise ControlStop('unexpected wait')
 while True:
  previous=signal.pthread_sigmask(signal.SIG_BLOCK,MASK)
  try:
   refresh();got,status=REAL_WAIT(pid,os.WNOHANG)
   if got:
    for slot in SLOTS:
     if slot['pid']==got:slot['reaped']=True;slot['exit']=os.waitstatus_to_exitcode(status);slot['groupClear']=not group_alive(got)
  finally:signal.pthread_sigmask(signal.SIG_SETMASK,previous)
  if flags==os.WNOHANG or got:return got,status
  time.sleep(.025)

signal.signal(signal.SIGALRM,alarm);signal.setitimer(signal.ITIMER_REAL,.25,.25)
import hashlib,json,importlib.util,sys,unittest,subprocess,stat
from pathlib import Path
HERE=Path(__file__).parent

def need(ok,why):
 if not ok:raise ControlStop(why)
def sha(b):return hashlib.sha256(b).hexdigest()
def exclusive(path,raw):
 fd=os.open(path,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
 with os.fdopen(fd,'wb') as f:f.write(raw);f.flush();os.fsync(f.fileno())
def auth(role):
 path=Path(role['path']);before=path.lstat();need(path.resolve(strict=True)==path and stat.S_ISREG(before.st_mode) and before.st_nlink==1,'physical role')
 fd=os.open(path,os.O_RDONLY|os.O_NOFOLLOW)
 try:
  need(os.fstat(fd)==before,'open race');raw=os.read(fd,role['bytes']+1);need(len(raw)==role['bytes'] and sha(raw)==role['sha256'],'role bytes/hash');need(os.fstat(fd)==before==path.lstat(),'read race');return raw
 finally:os.close(fd)
def main():
 global REG,PHASE,ROOT
 need(sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize,'-I -B no -O');need(len(sys.argv)==2,'exact configsha')
 raw=(HERE/'CONFIG.json').read_bytes();need(sha(raw)==sys.argv[1],'config hash');c=json.loads(raw);need(isinstance(c.get('runtimeGrant'),dict),'grant unfilled')
 need(Path(sys.executable).resolve(strict=True)==Path(c['pythonPath']),'exact Python')
 for role in c['roles'].values():auth(role)
 root=Path(c['pythonFixture']);need(root.parent==Path('/Users/zacheryspector/studio-scratch') and not os.path.lexists(root),'absent exact fixture');root.mkdir(mode=0o700);ROOT=root
 REG=os.open(root/'OWNED.ndjson',os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
 for name,item in c['observerFiles'].items():exclusive(root/name,auth(item))
 original_popen=subprocess.Popen
 def inherited_probe(*args,**kwargs):
  need(not kwargs.get('start_new_session') and not kwargs.get('preexec_fn'),'only inherited sandbox probes')
  argv=list(args[0]);need(argv[0]=='/usr/bin/sandbox-exec','exact synthetic probe tool')
  if '/usr/local/bin/python3' in argv:argv[argv.index('/usr/local/bin/python3')]=c['pythonPath']
  child=original_popen(argv,*args[1:],**kwargs);POPENS.append(child)
  communicate=child.communicate
  def retained(*ca,**ck):
   out,err=communicate(*ca,**ck)
   need(len(out or b'')<=1048576 and len(err or b'')<=1048576,'probe stream cap')
   exclusive(root/(str(child.pid)+'.probe.stdout'),out or b'');exclusive(root/(str(child.pid)+'.probe.stderr'),err or b'')
   return out,err
  child.communicate=retained
  os.write(REG,(json.dumps({'event':'inheritedProbe','pid':child.pid,'ownedPgid':os.getpgrp(),'argv':argv})+'\\n').encode());os.fsync(REG)
  return child
 subprocess.Popen=inherited_probe;os.fork=tracked_fork;os.waitpid=tracked_wait
 outcome=None;reason=None;cleanup=[]
 try:
  suite=unittest.TestSuite()
  for name in ['test-supervisor.py','test-outer.py','test-settlement208-frame.py']:
   spec=importlib.util.spec_from_file_location(name,root/name);module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
   if name=='test-outer.py':
    old_failure=module.outer.failure_record
    def retained_failure(streams,pid,child_exit,cleared):
     record=old_failure(streams,pid,child_exit,cleared)
     for label,data in streams.items():
      raw=bytes(data);need(len(raw)<=1048576,'outer retained stream cap');exclusive(root/(str(pid)+'.outer.'+label),raw)
     exclusive(root/(str(pid)+'.outer-refusal.json'),(json.dumps(record,sort_keys=True)+'\\n').encode());return record
    module.outer.failure_record=retained_failure
   suite.addTests(unittest.defaultTestLoader.loadTestsFromModule(module))
  outcome=unittest.TextTestRunner(verbosity=2).run(suite);need(outcome.testsRun==14,'exact14 methods')
 except BaseException as exc:reason=type(exc).__name__+':'+str(exc)
 finally:
  PHASE='cleanup';hard_kill()
  for slot in SLOTS:
   try:
    while not slot['reaped'] and time.monotonic()-START<WHOLE-1:
     got,status=REAL_WAIT(slot['pid'],os.WNOHANG)
     if got:slot['reaped']=True;slot['exit']=os.waitstatus_to_exitcode(status)
     else:time.sleep(.025)
    slot['groupClear']=not group_alive(slot['pid']);HISTORY.append(dict(slot))
   except BaseException as exc:cleanup.append(type(exc).__name__+':'+str(exc))
  for child in POPENS:
   try:child.wait(timeout=max(0,min(1,WHOLE-1-(time.monotonic()-START))))
   except BaseException as exc:cleanup.append(type(exc).__name__+':'+str(exc))
  os.fsync(REG);os.close(REG)
 ok=outcome is not None and outcome.wasSuccessful() and outcome.testsRun==14 and not reason and not STOP and not cleanup and len(SLOTS)==7 and len(POPENS)==4 and all(x['reaped'] and x['groupClear'] for x in HISTORY) and all(x.returncode is not None for x in POPENS) and time.monotonic()-START<ACTIVE
 result={'status':'A208_PYTHON_CONTROLS_PASS' if ok else 'A208_PYTHON_CONTROLS_STOP','methods':None if outcome is None else outcome.testsRun,'failures':None if outcome is None else len(outcome.failures),'errors':None if outcome is None else len(outcome.errors),'reason':reason,'stickyStop':STOP,'cleanupErrors':cleanup,'ownedGroups':HISTORY,'inheritedProbes':[{'pid':x.pid,'exit':x.returncode,'ownedPgid':os.getpgrp()} for x in POPENS],'elapsedSeconds':time.monotonic()-START,'game':False}
 cap_check()
 exclusive(root/'RESULT.json',(json.dumps(result,sort_keys=True)+'\\n').encode());print(json.dumps(result,sort_keys=True),flush=True);cap_check();need(time.monotonic()-START<WHOLE,'late finalization');signal.setitimer(signal.ITIMER_REAL,0)
 return 0 if ok else 2
if __name__=='__main__':raise SystemExit(main())
'''
put('drive.py',driver)
config=json.loads((B/'CONFIG-UNFILLED.json').read_text());config={k:v for k,v in config.items() if k in ['nodePath','nodeBytes','nodeSha256','bounds','executionAuthorization']};config.update(schema='1370-a208-finite-recorded-controls-config-r1',runtimeGrant=None,pythonPath='/usr/local/Cellar/python@3.14/3.14.4_1/Frameworks/Python.framework/Versions/3.14/bin/python3.14',pythonFixture=str(S/'1370-c0-a208-python-controls-fixture-after-aj-20261009-r1'),sourceReview=None,controlCounts=counts,observerFiles={n:{'path':str(Q/n),**v} for n,v in m['files'].items()})
config['roles']={'observerPins':role(Q/'SOURCE-PINS.json'),'observerReview':role(S/'1370-c0-aging-era-settlement208-observer-independent-source-review-after-aj-20261009-r1/RECEIPT.json'),'driver':role(P/'drive.py'),'python':role(Path(config['pythonPath'])),'helper':role(S/'1370-c0-stage41-heavy-lane-recovery-proposal-r8/lane-run-r8.sh'),**{'observer:'+n:v for n,v in config['observerFiles'].items()}}
put('CONFIG.json',config);csha=role(P/'CONFIG.json')['sha256'];raw=(B/'record-pure-node.py').read_text();changes=[('0e78eda5ad73702635054003d49560f77545c16e2fe5abef297ad456a5498168',csha),("OUTPUTS={mode:SCRATCH/('1370-c0-initial23-pricing-'+mode+'-output-20261009-r1') for mode in ('verification',)}","OUTPUTS={mode:SCRATCH/('1370-c0-a208-controls-'+mode+'-output-after-aj-20261009-r1') for mode in ('js','python')}"),("require(isinstance(config.get('futureWitness'),dict),'WITNESS_UNFILLED')","require(isinstance(config.get('runtimeGrant'),dict),'CONTROLS_GRANT_UNFILLED')"),("script=config['roles']['verification']['path'];argv=[config['nodePath'],script,CONFIG_SHA]","argv=([config['nodePath'],'--test',config['roles']['observer:test-synthetic.mjs']['path'],config['roles']['observer:test-settlement208.mjs']['path']] if mode=='js' else [config['pythonPath'],'-I','-B',config['roles']['driver']['path'],CONFIG_SHA])"),('PURE_INITIAL23_PRICING_','PURE_A208_CONTROLS_')]
rec=raw
for a,b in changes:assert a in rec;rec=rec.replace(a,b)
put('record.py',rec);put('REUSE.diff',''.join(difflib.unified_diff(raw.splitlines(True),rec.splitlines(True),fromfile=str(B/'record-pure-node.py'),tofile=str(P/'record.py'))));put('REUSE.json',{'baseline':role(B/'record-pure-node.py'),'trackingPrecedent':role(M/'run_controls.py'),'changes':changes,'parentOwnershipClockMechanisms':'Unchanged fork/READY/GO, source authentication, capture caps, sticky failure and bounded cleanup/finalization. Driver borrows tracked fork/WNOHANG masking pattern and safe known-PID fallback; separately reviewed additions.','executed':False})
helper=config['roles']['helper']['path'];python=config['pythonPath'];commands={mode:['/bin/bash',helper,'0',str(S/('1370-c0-a208-controls-'+mode+'-lane-after-aj-20261009-r1')/'controls.log'),python,'-I','-B',str(P/'record.py'),mode] for mode in ['js','python']}
put('ROUTE.json',{'schema':'1370-a208-finite-recorded-controls-route-r1','commands':commands,'cwd':str(P),'environment':{'PYTHONDONTWRITEBYTECODE':'1','GIT_OPTIONAL_LOCKS':'0'},'bounds':{'eachParentChildSeconds':60,'eachParentActiveSeconds':75,'eachParentWholeSeconds':90,'eachStreamBytes':1048576,'pythonDriverActiveSeconds':45,'pythonDriverWholeSeconds':55,'ownedFixtureBytes':8388608},'expected':{'jsGroups':13,'pythonMethods':14,'pythonDirectSetsidGroups':7,'sandboxProbesInOwnedDriverGroup':4,'outerGroupInheritedGrandchildren':2,'nodeWorkers':'Native --test workers inherit the exact recorded Node PGID; no invented PID list.'},'grant':None,'sourceReview':None,'executionAuthorization':False,'sequence':'One JS arm then one Python arm; stop on any nonzero/mismatch/override/cleanup uncertainty. No auto retry. Separately record both raw tool outcomes/helper log/meta/stdout/stderr/RESULT and driver registry/fixtures.'})
put('REPORT.md','''SOURCE ONLY; held finite A208 controls route. No Node/imports/tests/game execution.

Two exact arms reuse qualified60/75/90 recorder and helper ownership/retained failure capture. JS runs original6 plus new7 groups. Python driver runs original supervisor5/outer7 and new transport2 methods over exclusive exact copies of all18 observer source files in a fresh owned fixture; frozen source/protected mirrors stay unchanged. Test-created temporary fixtures retain existing TemporaryDirectory semantics; no deletion of retained registry/results or other outputs. Tests import only stdlib and observer declarations, never engine/game.

Sandbox probe stdout/stderr and original outer failure_record diagnostics/streams are preserved in exclusive per-PID files. Python ownership adapter records every direct outer fork before unmasking alarm, uses WNOHANG polling, retains pre-setsid exactPID fallback and confirms self-PGID before signaling groups. Seven outer test groups cover two inherited sleep grandchildren. Four sandbox probes inherit the already recorded driver group; source test alias /usr/local/bin/python3 is transparently replaced by exact pinned interpreter, only for its fd probe. No arbitrary Popen sessions/preexec are permitted. Driver45/55 clocks are below parent60 child/75 active/90 whole; hard finalization failure is exit124 with no success. Parent preserves captured stdout/stderr and cleanup status. Runtime success/timing is unproven until actual controls.

CONFIGruntimeGrant/sourceReview and ROUTEgrant remain null. Future exact filled config requires independently reviewed runtime/tools/current guards, parent control grant and updated recorder CONFIG pin; no source draft relabeling. Root must independently review this route before any run. Direct output paths, no-collision and ownership evidence are concrete. JS native workers and sandbox probes inherit exact parent recorded groups; neither their individual PIDs nor global absence is invented.
''')
files={x.name:role(x) for x in P.iterdir() if x.is_file() and x.name not in ['SOURCE-PINS.json','RECEIPT.json']};put('SOURCE-PINS.json',{'schema':'1370-a208-finite-recorded-controls-pins-r1','files':files,'observerPins':role(Q/'SOURCE-PINS.json'),'executionAuthorization':False,'runtimeGrant':None})
put('RECEIPT.json',{'decision':'READY_SOURCE_ONLY_HELD_A208_FINITE_CONTROLS_ROUTE_PENDING_INDEPENDENT_REVIEW','sourcePins':role(P/'SOURCE-PINS.json'),'config':role(P/'CONFIG.json'),'recorder':role(P/'record.py'),'driver':role(P/'drive.py'),'counts':counts,'executed':False,'executionAuthorization':False});print(json.dumps({'pins':role(P/'SOURCE-PINS.json'),'receipt':role(P/'RECEIPT.json')}))
