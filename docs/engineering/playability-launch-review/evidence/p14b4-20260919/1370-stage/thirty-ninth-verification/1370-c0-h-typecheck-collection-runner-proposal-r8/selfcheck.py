#!/usr/bin/env python3
"""Scratch-only synthetic and actual-r6 control checks; never opens H mirror/types."""
import ast,hashlib,json,math,pathlib,types,os,stat,tempfile
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
assert "OUT_ROOT=S/'1370-c0-h-typecheck-collection-results-r8'" in source
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
print(json.dumps({'status':'PASS_R8_OBSERVED_CHAIN_AND_SECURE_WALKERS_SOURCE_ONLY','digest':raw['fileProofDigestSha256'],'syntheticRefusals':8},sort_keys=True))
