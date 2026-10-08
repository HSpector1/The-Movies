#!/usr/bin/env python3
"""Scratch-only synthetic and actual-r6 control checks; never opens H mirror/types."""
import ast,hashlib,json,math,pathlib,types,os,stat,subprocess,sys,tempfile,time
P=pathlib.Path(__file__).resolve().parent
S=pathlib.Path('/Users/zacheryspector/studio-scratch')
source=(P/'runner.py').read_text();tree=ast.parse(source)
need_fn=next(n for n in tree.body if isinstance(n,ast.FunctionDef) and n.name=='need')
proof_fn=next(n for n in tree.body if isinstance(n,ast.FunctionDef) and n.name=='canonical_proof')
verify_fn=next(n for n in tree.body if isinstance(n,ast.FunctionDef) and n.name=='validate_r6_chain')
observed_fn=next(n for n in tree.body if isinstance(n,ast.FunctionDef) and n.name=='validate_r6_observed')
ns={'hashlib':hashlib,'json':json,'pathlib':pathlib,'S':S}
exec(compile(ast.Module(body=[need_fn,proof_fn,verify_fn,observed_fn],type_ignores=[]),'<isolated-source>','exec'),ns)
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def read_pin(path,pin,cap=100000):
 assert path.is_file() and not path.is_symlink() and path.stat().st_size<=cap
 raw=path.read_bytes();assert hashlib.sha256(raw).hexdigest()==pin;return raw
ns['read_pin']=read_pin
ns.update({'HEAD':'9651546af98c44f04e8b6b2714d10d67dadb8f9c','TREE':'13880d9b0ba72aff5d4c5bcf5d12fe682c5de554',
'H_COMMIT':'8708d6a98e6eb4ad53e3a54e431c4b40b974f79d','H_TREE':'0ee21d8179977aaa0726ffb5d1b2bb2568c9df97',
'BRIDGE_TREE':'a697b042eccb85adacd40ef1303869be6d26239a',
'BRIDGE_SOURCE_SHA':'659b5a436fd874df8485cba90e3e1b5d5847e02f21f3b2dcc27c21e555a5785f',
'MANIFEST_SHA':'e2f92aa60063b754f110ec31f08080bfd461f6a150f74394464739c2d4cab7ff'})
binding=json.loads((P/'BINDING-SOURCE.json').read_text())
raw_path=pathlib.Path(binding['fullReadbackResultPath']);raw=json.loads(read_pin(raw_path,binding['fullReadbackResultSha256']))
assert ns['validate_r6_chain'](binding,raw)['proofDigestSha256']==raw['fileProofDigestSha256']
for key,bad in [('fullReadbackDigestSha256','0'*64),('fullReadbackR6LaneMetaSha256','0'*64),
                ('fullReadbackR6RecorderResultSha256','0'*64),('fullReadbackR6ExactReviewPath','/tmp/unrelated'),
                ('fullReadbackR4ObservedStopReceiptSha256','0'*64)]:
 wrong=dict(binding);wrong[key]=bad
 try:ns['validate_r6_chain'](wrong,raw)
 except (RuntimeError,AssertionError):pass
 else:raise AssertionError('accepted wrong '+key)
wrongraw=dict(raw);wrongraw['regularFiles']=1401
try:ns['validate_r6_chain'](binding,wrongraw)
except (RuntimeError,AssertionError):pass
else:raise AssertionError('accepted short raw roster')
a=['a/child.ts',4,'1'*40,'a'*64,0o644];z=['z.ts',9,'2'*40,'b'*64,0o755]
assert ns['canonical_proof']({'z.ts':z,'a/child.ts':a})==ns['canonical_proof']({'a/child.ts':a,'z.ts':z})
assert ns['canonical_proof']({'z.ts':z,'a/child.ts':a})!=hashlib.sha256(b''.join(json.dumps(x,separators=(',',':')).encode()+b'\n' for x in [z,a])).hexdigest()
assert ns['validate_r6_observed'](binding,raw)['decision']=='ACCEPT_OBSERVED_H_BRIDGE_FULL_SOURCE_BYTES_ONLY'
wrong=dict(binding);wrong['fullReadbackObservedReceiptSha256']='0'*64
try:ns['validate_r6_observed'](wrong,raw)
except RuntimeError:pass
else:raise AssertionError('accepted unrelated observed receipt')
assert 'validate_r6_observed(binding,readback)' in source
assert "OUT_ROOT=S/'1370-c0-h-typecheck-collection-results-r9'" in source
assert binding['oldTypeStopReceiptSha256']=='6c8e310bca8d581a479ffda929b3edad83670c5bdb52c2ef45b419e4953f0f4d'
assert 'os.walk(' not in source and 'os.symlink(' not in source
assert "START=globals().get('_BOOTSTRAP_START')" in source
remaining_fn=next(n for n in tree.body if isinstance(n,ast.FunctionDef) and n.name=='remaining')
timer={'need':ns['need'],'math':math,'time':types.SimpleNamespace(monotonic=lambda:101.0),'WALL':300,'START':100.0}
exec(compile(ast.Module(body=[remaining_fn],type_ignores=[]),'<timer>','exec'),timer)
assert timer['remaining']()==299.0
for bad in (None,True,float('nan'),float('inf'),102.0,-1000.0):
 timer['START']=bad
 try:timer['remaining']()
 except RuntimeError:pass
 else:raise AssertionError('bad bootstrap start accepted')
timer['START']=-199.0
try:timer['remaining']()
except RuntimeError:pass
else:raise AssertionError('expired 300-second timer accepted')
assert 'os.O_NOFOLLOW' in source and 'directory/global entry cap' in source
assert 'dependency content audit cap' in source and 'source_step(run_id)' in source
# Small synthetic no-follow and bounded-name refusals, never touching the H mirror.
extra=[n for n in tree.body if isinstance(n,ast.FunctionDef) and n.name in ('fields','open_dir_chain','verify_dir_chain','close_chain','bounded_names')]
ns.update({'os':os,'stat':stat,'source_step':lambda run_id:None})
exec(compile(ast.Module(body=extra,type_ignores=[]),'<isolated-walkers>','exec'),ns)
with tempfile.TemporaryDirectory(prefix='h-types-r8-red-') as root_text:
 root=pathlib.Path(root_text).resolve();good=root/'good';good.mkdir();(root/'link').symlink_to(good,target_is_directory=True)
 held=ns['open_dir_chain'](good);ns['verify_dir_chain'](good,held);ns['close_chain'](held)
 try:ns['open_dir_chain'](root/'link')
 except (RuntimeError,OSError):pass
 else:raise AssertionError('symlink parent accepted')
 for i in range(1501):(good/f'x{i:04d}').write_bytes(b'')
 held=ns['open_dir_chain'](good)
 try:
  try:ns['bounded_names'](held[-1],{'entries':0},1500,'synthetic')
  except RuntimeError:pass
  else:raise AssertionError('over-cap directory accepted')
 finally:ns['close_chain'](held)
# Execute r9 functions in isolation: never enters the historical mirror or runs types.
run_ns={'__name__':'_synthetic_r9','_BOOTSTRAP_START':time.monotonic()}
exec(compile(source,str(P/'runner.py'),'exec'),run_ns)
assert run_ns['MAX_CHILD_LOG']==8*1024*1024 and run_ns['MAX_COLLECTION']==1024*1024 and run_ns['MAX_RESULT']==128*1024
assert 'env=clean_git_env()' in source and 'GIT_' in source
prior_git_dir=os.environ.get('GIT_DIR')
os.environ['GIT_DIR']='/tmp/intentional-git-spoof-r9'
try:
 assert 'GIT_DIR' not in run_ns['clean_git_env']()
 assert run_ns['cmd'](['git','rev-parse','HEAD'])==run_ns['HEAD']
finally:
 if prior_git_dir is None:os.environ.pop('GIT_DIR',None)
 else:os.environ['GIT_DIR']=prior_git_dir
with tempfile.TemporaryDirectory(prefix='h-types-r9-red-') as root_text:
 root=pathlib.Path(root_text).resolve();out=root/'out';out.mkdir()
 # Exact origin and production/evidence ref guards, without an actual lane or remote call.
 lock=root/'HEAVY-LANE-LOCK';lock.write_text('c0-h-types-synthetic.lane.log')
 run_ns['S']=root;run_ns['remaining']=lambda:300
 run_ns['shutil']=types.SimpleNamespace(disk_usage=lambda _:types.SimpleNamespace(free=4*1024**3))
 good={('pmset','-g','batt'):"Now drawing from 'AC Power'",('git','rev-parse','HEAD'):run_ns['HEAD'],
       ('git','rev-parse','HEAD:src'):run_ns['TREE'],('git','status','--porcelain=v1'):'',
       ('git','remote','get-url','origin'):run_ns['ORIGIN'],
       ('git','ls-remote','origin',run_ns['REF']):run_ns['HEAD']+'\t'+run_ns['REF'],
       ('git','rev-parse',run_ns['EVIDENCE_REF']):run_ns['EVIDENCE_TIP'],
       ('git','ls-remote','origin',run_ns['EVIDENCE_REF']):run_ns['EVIDENCE_TIP']+'\t'+run_ns['EVIDENCE_REF']}
 run_ns['cmd']=lambda args,cwd=None:good[tuple(args)]
 run_ns['guard']('synthetic')
 for key in [('git','remote','get-url','origin'),('git','rev-parse',run_ns['EVIDENCE_REF']),
             ('git','ls-remote','origin',run_ns['EVIDENCE_REF'])]:
  prior=good[key];good[key]='wrong'
  try:run_ns['guard']('synthetic')
  except RuntimeError:pass
  else:raise AssertionError('spoofed origin/evidence guard accepted')
  good[key]=prior
 # Stable output refuses a symlink and a size change during descriptor read.
 f=out/'collection.json';f.write_bytes(b'{}')
 link=out/'link.json';link.symlink_to(f)
 try:run_ns['stable_output'](link,1024,True)
 except RuntimeError:pass
 else:raise AssertionError('collection symlink accepted')
 class OsProxy:
  def __init__(self,real,target):self.real=real;self.target=target;self.changed=False
  def __getattr__(self,name):return getattr(self.real,name)
  def read(self,fd,n):
   if not self.changed:
    self.changed=True
    with self.target.open('ab') as stream:stream.write(b'growth')
   return self.real.read(fd,n)
 real_os=run_ns['os'];run_ns['os']=OsProxy(os,f)
 try:
  try:run_ns['stable_output'](f,1024,True)
  except RuntimeError:pass
  else:raise AssertionError('collection growth accepted')
 finally:run_ns['os']=real_os
 try:run_ns['write_result'](out/'oversize.json',{'payload':'x'*run_ns['MAX_RESULT']})
 except RuntimeError:pass
 else:raise AssertionError('oversized result accepted')
 assert not (out/'oversize.json').exists()
 # A disposable noisy child crosses a small test cap and its process group clears.
 run_ns['MAX_CHILD_LOG']=65536
 run_ns['guard']=lambda _:None;run_ns['source_step']=lambda _:None
 run_ns['NODE']=sys.executable
 seen=[];real_subprocess=run_ns['subprocess']
 def capture_popen(*args,**kwargs):
  child=real_subprocess.Popen(*args,**kwargs);seen.append(child.pid);return child
 run_ns['subprocess']=types.SimpleNamespace(Popen=capture_popen,TimeoutExpired=subprocess.TimeoutExpired,DEVNULL=subprocess.DEVNULL)
 try:
  try:run_ns['run_child']('noisy',[sys.executable,'-c','import sys;sys.stdout.buffer.write(b"x"*131072)'],root,out,'synthetic')
  except RuntimeError as error:assert 'child output cap' in str(error)
  else:raise AssertionError('noisy child accepted')
 finally:run_ns['subprocess']=real_subprocess
 assert seen and run_ns['CURRENT'] is None
 try:os.killpg(seen[0],0)
 except ProcessLookupError:pass
 else:raise AssertionError('noisy child process group survived')
print(json.dumps({'status':'PASS_R9_BOUNDED_CHILD_GIT_REF_AND_RACE_REDS','digest':raw['fileProofDigestSha256'],'syntheticRefusals':15},sort_keys=True))
